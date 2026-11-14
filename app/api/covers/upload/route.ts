import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { currentUser, ensureSchema } from '../../../../lib/db';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  await ensureSchema();
  if (!await currentUser(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const form = await request.formData(); const file = form.get('file');
  if (!(file instanceof File) || !file.type.startsWith('image/') || file.size > 8 * 1024 * 1024) return NextResponse.json({ error: 'Image required, max 8 MB' }, { status: 400 });
  const ext = file.type.split('/')[1]?.replace('jpeg','jpg') || 'bin'; const name = `${randomBytes(18).toString('hex')}.${ext}`;
  const dir = '/data/covers'; await mkdir(dir, { recursive: true }); await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/api/covers/${name}` }, { status: 201 });
}
