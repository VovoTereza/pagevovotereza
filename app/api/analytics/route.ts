import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { insertRows } from '@/lib/server/supabase';

const schema = z.object({ name:z.string().min(2).max(80), sessionId:z.string().max(100).optional(), payload:z.record(z.string(),z.unknown()).optional() });
export async function POST(request: NextRequest) { const parsed=schema.safeParse(await request.json().catch(()=>null)); if (!parsed.success) return NextResponse.json({error:'Evento inválido.'},{status:400}); try { await insertRows('analytics_events',{id:crypto.randomUUID(),name:parsed.data.name,session_id:parsed.data.sessionId,payload:parsed.data.payload||{}}); } catch {} return new NextResponse(null,{status:204}); }
