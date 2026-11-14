import { NextResponse } from 'next/server';
import { authenticate, bootstrapAdmin, db, ensureSchema } from '../../../../lib/db';

export async function POST(request: Request) {
  await ensureSchema(); await bootstrapAdmin();
  const { email, password } = await request.json();
  const result = await authenticate(String(email ?? ''), String(password ?? ''));
  if (!result) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  const response = NextResponse.json({ user: result.user });
  // The VPS is currently served over HTTP; enable Secure after HTTPS is configured.
  response.cookies.set('lr_session', result.token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 60 * 60 * 24 * 30, path: '/' });
  return response;
}
