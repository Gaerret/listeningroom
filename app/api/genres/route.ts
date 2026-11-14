import { NextResponse } from 'next/server';
import { currentUser, db, ensureSchema } from '../../../lib/db';
export async function GET(){await ensureSchema();const {rows}=await db.query('SELECT name FROM genre_catalog ORDER BY name');return NextResponse.json(rows.map(r=>r.name));}
export async function POST(request:Request){await ensureSchema();if(!await currentUser(request))return NextResponse.json({error:'Unauthorized'},{status:401});const {name}=await request.json();const clean=String(name||'').trim();if(!clean||clean.length>80)return NextResponse.json({error:'Invalid genre'},{status:400});await db.query('INSERT INTO genre_catalog(name) VALUES($1) ON CONFLICT DO NOTHING',[clean]);return NextResponse.json({name:clean},{status:201});}
