import { NextResponse } from 'next/server';
import { currentUser, ensureSchema } from '../../../../lib/db';
export async function GET(request: Request) { await ensureSchema(); const user = await currentUser(request); return user ? NextResponse.json({ user }) : NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
