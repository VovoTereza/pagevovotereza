import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/db';
import { analyticsEvents } from '@/db/schema';

const schema = z.object({ name:z.string().min(2).max(80), sessionId:z.string().max(100).optional(), payload:z.record(z.string(),z.unknown()).optional() });
export async function POST(request: NextRequest) { const parsed=schema.safeParse(await request.json().catch(()=>null)); if (!parsed.success) return NextResponse.json({error:'Evento inválido.'},{status:400}); try { await getDb().insert(analyticsEvents).values({id:crypto.randomUUID(),name:parsed.data.name,sessionId:parsed.data.sessionId,payload:parsed.data.payload||{}}); } catch {} return new NextResponse(null,{status:204}); }
