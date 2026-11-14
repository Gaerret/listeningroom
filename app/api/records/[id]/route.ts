import { NextResponse } from 'next/server';
import { currentUser, db, ensureSchema } from '../../../../lib/db';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  await ensureSchema();
  if (!await currentUser(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  const body = await request.json();
  const { rows } = await db.query(`UPDATE records SET title=$2,artist=$3,year=$4,genre=$5,status=$6,color=$7,notes=$8,discogs_url=$9,updated_at=now() WHERE id=$1 RETURNING id,title,artist,year,genre,status,color,notes,discogs_url AS "discogsUrl"`, [id, body.title, body.artist, body.year, body.genre, body.status, body.color, body.notes ?? '', body.discogsUrl ?? null]);
  return rows[0] ? NextResponse.json(rows[0]) : NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  await ensureSchema();
  if (!await currentUser(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  await db.query('DELETE FROM records WHERE id=$1', [id]);
  return new NextResponse(null, { status: 204 });
}
