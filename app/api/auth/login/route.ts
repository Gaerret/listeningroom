import { NextResponse } from 'next/server';
import { authenticate, bootstrapAdmin, db, ensureSchema } from '../../../../lib/db';

export async function POST(request: Request) {
  await ensureSchema(); await bootstrapAdmin();
  const { email, password } = await request.json();
  const result = await authenticate(String(email ?? ''), String(password ?? ''));
  if (!result) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  const response = NextResponse.json({ user: result.user });
  response.cookies.set('lr_session', result.token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 30, path: '/' });
  return response;
}
