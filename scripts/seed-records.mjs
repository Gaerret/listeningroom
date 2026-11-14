import { Pool } from 'pg';
import { readFile } from 'node:fs/promises';

const importedRecords = JSON.parse(await readFile(process.env.IMPORT_FILE ?? './import-data.json', 'utf8'));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const discogs = /^https:\/\/(www\.)?discogs\.com\/(release|ru\/release)\/(\d+)/i;

async function verifyDiscogs(url) {
  if (!url) return { ok: true };
  const match = url.match(discogs);
  if (!match) return { ok: false, reason: 'invalid Discogs release URL' };
  try {
    const response = await fetch(`https://api.discogs.com/releases/${match[3]}`, { headers: { 'user-agent': 'TheListeningRoom/1.0' } });
    if (!response.ok) return { ok: false, reason: `Discogs API HTTP ${response.status}` };
    const release = await response.json();
    return { ok: true, year: release.year, title: release.title, artist: release.artists?.map(a => a.name).join(', '), coverUrl: release.images?.find(i => i.type === 'primary')?.uri ?? release.thumb ?? null };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : 'request failed' };
  }
}

await pool.query(`CREATE TABLE IF NOT EXISTS records (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, artist TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year BETWEEN 1900 AND 2100), genre TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('collection', 'wishlist')),
  color TEXT NOT NULL, notes TEXT NOT NULL DEFAULT '', discogs_url TEXT, cover_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`);

let imported = 0;
let skipped = 0;
for (const record of importedRecords) {
  const match = record.notes.match(/Discogs: (https?:\/\/\S+)/);
  const discogsUrl = match?.[1] ?? null;
  const check = await verifyDiscogs(discogsUrl);
  if (!check.ok) { console.warn(`SKIP ${record.artist} — ${record.title}: ${check.reason}`); skipped++; continue; }
  if (discogsUrl && (check.title?.toLowerCase() !== record.title.toLowerCase() || !check.artist?.toLowerCase().includes(record.artist.toLowerCase()))) { console.warn(`SKIP ${record.artist} — ${record.title}: Discogs metadata mismatch`); skipped++; continue; }
  await pool.query(`INSERT INTO records (id,title,artist,year,genre,status,color,notes,discogs_url,cover_url)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (id) DO UPDATE SET cover_url=EXCLUDED.cover_url, discogs_url=EXCLUDED.discogs_url`,
    [record.id, record.title, record.artist, check.year || record.year, record.genre, record.status, record.color, record.notes, discogsUrl, check.coverUrl]);
  imported++;
}
console.log(`Imported: ${imported}; skipped after Discogs validation: ${skipped}`);
await pool.end();
