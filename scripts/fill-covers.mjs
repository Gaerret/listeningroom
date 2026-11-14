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
  const exact = (data.results ?? []).find(item => norm(item.title).includes(norm(record.title)) && norm(item.title).includes(norm(record.artist)) && (item.cover_image || item.thumb));
  return exact ?? null;
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
