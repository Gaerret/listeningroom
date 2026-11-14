import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const headers = { 'user-agent': 'TheListeningRoom/1.0' };
const norm = value => String(value ?? '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function search(record) {
  await wait(1100);
  const url = new URL('https://api.discogs.com/database/search');
  url.searchParams.set('artist', record.artist);
  url.searchParams.set('release_title', record.title);
  url.searchParams.set('type', 'release');
  url.searchParams.set('per_page', '10');
  const response = await fetch(url, { headers });
  if (response.status === 429) { await wait(15000); return search(record); }
  if (!response.ok) return null;
  const data = await response.json();
  const titleTokens = norm(record.title).split(' ').filter(Boolean);
  const exact = (data.results ?? []).find(item => titleTokens.every(token => norm(item.title).includes(token)));
  if (!exact?.resource_url) return null;
  await wait(1100);
  const releaseResponse = await fetch(exact.resource_url, { headers });
  if (releaseResponse.status === 429) { await wait(15000); return search(record); }
  if (!releaseResponse.ok) return null;
  const release = await releaseResponse.json();
  const images = [...(release.images ?? [])].sort((a, b) => (b.width * b.height) - (a.width * a.height));
  return { ...exact, cover_image: images[0]?.uri ?? release.uri150 ?? release.thumb ?? null };
}

const { rows } = await pool.query('SELECT id,artist,title FROM records WHERE cover_url IS NULL ORDER BY status,artist,title');
let found = 0;
for (const record of rows) {
  const result = await search(record);
  const cover = result?.cover_image || result?.thumb;
  if (!cover) { console.warn(`NOT FOUND ${record.artist} — ${record.title}`); continue; }
  await pool.query('UPDATE records SET cover_url=$2,discogs_url=COALESCE(discogs_url,$3),updated_at=now() WHERE id=$1', [record.id, cover, result.uri ?? null]);
  found++;
  console.log(`FOUND ${record.artist} — ${record.title}`);
}
console.log(`Found covers: ${found}; without cover: ${rows.length - found}`);
await pool.end();
