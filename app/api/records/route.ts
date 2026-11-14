import { NextResponse } from 'next/server';
import { currentUser, db, ensureSchema } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  await ensureSchema();
  if (!await currentUser(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { rows } = await db.query('SELECT id, title, artist, year, genre, status, color, finish, notes, discogs_url AS "discogsUrl", cover_url AS "coverUrl" FROM records ORDER BY created_at DESC');
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  await ensureSchema();
  if (!await currentUser(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const required = ['id', 'title', 'artist', 'year', 'genre', 'status', 'color', 'notes'];
  if (required.some(key => body[key] === undefined)) return NextResponse.json({ error: 'Invalid record' }, { status: 400 });
  const { rows } = await db.query(`INSERT INTO records (id,title,artist,year,genre,status,color,finish,notes,discogs_url,cover_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id,title,artist,year,genre,status,color,finish,notes,discogs_url AS "discogsUrl",cover_url AS "coverUrl"`, [body.id, body.title, body.artist, body.year, body.genre, body.status, body.color, body.finish ?? 'Solid', body.notes ?? '', body.discogsUrl ?? null, body.coverUrl ?? null]);
  return NextResponse.json(rows[0], { status: 201 });
}
