import { Pool } from 'pg';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const globalForDb = globalThis as unknown as { listeningRoomPool?: Pool };
export const db = globalForDb.listeningRoomPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (process.env.NODE_ENV !== 'production') globalForDb.listeningRoomPool = db;

export async function ensureSchema() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS share_links (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS records (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      year INTEGER NOT NULL CHECK (year BETWEEN 1900 AND 2100),
      genre TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('collection', 'wishlist')),
      color TEXT NOT NULL,
      finish TEXT NOT NULL DEFAULT 'Solid',
      notes TEXT NOT NULL DEFAULT '',
      discogs_url TEXT,
      cover_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await db.query('ALTER TABLE records ADD COLUMN IF NOT EXISTS cover_url TEXT');
  await db.query("ALTER TABLE records ADD COLUMN IF NOT EXISTS finish TEXT NOT NULL DEFAULT 'Solid'");
  await db.query("ALTER TABLE records ADD COLUMN IF NOT EXISTS splatter_a TEXT NOT NULL DEFAULT '#e43b25'");
  await db.query("ALTER TABLE records ADD COLUMN IF NOT EXISTS splatter_b TEXT NOT NULL DEFAULT '#ff9f1c'");
  await db.query("ALTER TABLE records ADD COLUMN IF NOT EXISTS splatter_c TEXT NOT NULL DEFAULT '#111111'");
  await db.query("ALTER TABLE records ADD COLUMN IF NOT EXISTS vinyl_count INTEGER NOT NULL DEFAULT 1");
  await db.query("ALTER TABLE records ADD COLUMN IF NOT EXISTS vinyl2_color TEXT NOT NULL DEFAULT '#242323'");
  await db.query("ALTER TABLE records ADD COLUMN IF NOT EXISTS vinyl3_color TEXT NOT NULL DEFAULT '#242323'");
}

function hashPassword(password: string, salt = randomBytes(16).toString('hex')) {
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, digest] = stored.split(':');
  if (!salt || !digest) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(digest, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function bootstrapAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  const existing = await db.query('SELECT id FROM users WHERE email=$1', [email]);
  if (!existing.rowCount) await db.query('INSERT INTO users (id,email,password_hash) VALUES ($1,$2,$3)', [randomBytes(16).toString('hex'), email, hashPassword(password)]);
}

export async function authenticate(email: string, password: string) {
  const result = await db.query('SELECT id,email,password_hash FROM users WHERE email=$1', [email.trim().toLowerCase()]);
  const user = result.rows[0];
  if (!user || !verifyPassword(password, user.password_hash)) return null;
  const token = randomBytes(32).toString('base64url');
  const tokenHash = scryptSync(token, 'listening-room-session', 32).toString('hex');
  await db.query('INSERT INTO sessions (token_hash,user_id,expires_at) VALUES ($1,$2,now()+interval \'30 days\')', [tokenHash, user.id]);
  return { token, user: { id: user.id, email: user.email } };
}

export async function currentUser(request: Request) {
  const token = request.headers.get('cookie')?.match(/(?:^|; )lr_session=([^;]+)/)?.[1];
  if (!token) return null;
  const tokenHash = scryptSync(decodeURIComponent(token), 'listening-room-session', 32).toString('hex');
  const result = await db.query('SELECT users.id,users.email FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.token_hash=$1 AND sessions.expires_at>now()', [tokenHash]);
  return result.rows[0] ?? null;
}

export { hashPassword };
