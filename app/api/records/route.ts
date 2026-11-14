import { NextResponse } from 'next/server';
import { currentUser, db, ensureSchema } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  await ensureSchema();
  if (!await currentUser(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { rows } = await db.query('SELECT id, title, artist, year, genre, status, color, vinyl_count AS "vinylCount", vinyl2_color AS "vinyl2Color", vinyl3_color AS "vinyl3Color", finish, splatter_a AS "splatterA", splatter_b AS "splatterB", splatter_c AS "splatterC", notes, discogs_url AS "discogsUrl", cover_url AS "coverUrl" FROM records ORDER BY created_at DESC');
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  await ensureSchema();
  if (!await currentUser(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const required = ['id', 'title', 'artist', 'year', 'genre', 'status', 'color', 'notes'];
  if (required.some(key => body[key] === undefined)) return NextResponse.json({ error: 'Invalid record' }, { status: 400 });
  const { rows } = await db.query(`INSERT INTO records (id,title,artist,year,genre,status,color,vinyl_count,vinyl2_color,vinyl3_color,finish,splatter_a,splatter_b,splatter_c,notes,discogs_url,cover_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING id,title,artist,year,genre,status,color,vinyl_count AS "vinylCount",vinyl2_color AS "vinyl2Color",vinyl3_color AS "vinyl3Color",finish,splatter_a AS "splatterA",splatter_b AS "splatterB",splatter_c AS "splatterC",notes,discogs_url AS "discogsUrl",cover_url AS "coverUrl"`, [body.id, body.title, body.artist, body.year, body.genre, body.status, body.color, Math.min(3,Math.max(1,Number(body.vinylCount)||1)), body.vinyl2Color ?? '#242323', body.vinyl3Color ?? '#242323', body.finish ?? 'Solid', body.splatterA ?? '#e43b25', body.splatterB ?? '#ff9f1c', body.splatterC ?? '#111111', body.notes ?? '', body.discogsUrl ?? null, body.coverUrl ?? null]);
  return NextResponse.json(rows[0], { status: 201 });
}
