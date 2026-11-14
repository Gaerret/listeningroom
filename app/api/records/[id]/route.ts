import { NextResponse } from 'next/server';
import { currentUser, db, ensureSchema } from '../../../../lib/db';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  await ensureSchema();
  if (!await currentUser(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  const body = await request.json();
  const { rows } = await db.query(`UPDATE records SET title=$2,artist=$3,year=$4,genre=$5,genres=$6,price=$7,status=$8,color=$9,vinyl_designs=$10::jsonb,label_color=$11,vinyl_count=$12,vinyl2_color=$13,vinyl3_color=$14,finish=$15,splatter_a=$16,splatter_b=$17,splatter_c=$18,notes=$19,discogs_url=$20,cover_url=$21,updated_at=now() WHERE id=$1 RETURNING id,title,artist,year,genre,genres,price,status,color,vinyl_designs AS "vinylDesigns",label_color AS "labelColor",vinyl_count AS "vinylCount",vinyl2_color AS "vinyl2Color",vinyl3_color AS "vinyl3Color",finish,splatter_a AS "splatterA",splatter_b AS "splatterB",splatter_c AS "splatterC",notes,discogs_url AS "discogsUrl",cover_url AS "coverUrl"`, [id, body.title, body.artist, body.year, body.genre, body.genres ?? [], Number(body.price)||0, body.status, body.color, JSON.stringify(body.vinylDesigns ?? []), body.labelColor ?? '#e8e2d4', Math.max(1,Number(body.vinylCount)||1), body.vinyl2Color ?? body.color, body.vinyl3Color ?? body.color, body.finish ?? 'Solid', body.splatterA ?? '#e43b25', body.splatterB ?? '#ff9f1c', body.splatterC ?? '#111111', body.notes ?? '', body.discogsUrl ?? null, body.coverUrl ?? null]);
  return rows[0] ? NextResponse.json(rows[0]) : NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  await ensureSchema();
  if (!await currentUser(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  await db.query('DELETE FROM records WHERE id=$1', [id]);
  return new NextResponse(null, { status: 204 });
}
