import { NextResponse } from 'next/server';
import { currentUser, db, ensureSchema } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  await ensureSchema();
  if (!await currentUser(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { rows } = await db.query('SELECT id, title, artist, year, genre, status, color, notes, discogs_url AS "discogsUrl" FROM records ORDER BY created_at DESC');
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  await ensureSchema();
  if (!await currentUser(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const required = ['id', 'title', 'artist', 'year', 'genre', 'status', 'color', 'notes'];
  if (required.some(key => body[key] === undefined)) return NextResponse.json({ error: 'Invalid record' }, { status: 400 });
  const { rows } = await db.query(`INSERT INTO records (id,title,artist,year,genre,status,color,notes,discogs_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id,title,artist,year,genre,status,color,notes,discogs_url AS "discogsUrl"`, [body.id, body.title, body.artist, body.year, body.genre, body.status, body.color, body.notes ?? '', body.discogsUrl ?? null]);
  return NextResponse.json(rows[0], { status: 201 });
}
