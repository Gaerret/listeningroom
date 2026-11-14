import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
export const runtime = 'nodejs';
export async function GET(_: Request, context: { params: Promise<{ filename: string }> }) { const { filename } = await context.params; if (!/^[a-f0-9]{36}\.[a-z0-9]+$/i.test(filename)) return new NextResponse(null,{status:404}); try { const data=await readFile(path.join('/data/covers',filename)); const ext=filename.split('.').pop(); return new NextResponse(data,{headers:{'content-type':`image/${ext==='jpg'?'jpeg':ext}`,'cache-control':'public,max-age=31536000,immutable'}}); } catch { return new NextResponse(null,{status:404}); } }
