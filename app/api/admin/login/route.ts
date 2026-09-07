import { env } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminCookieName, createAdminSession } from '@/lib/server/admin-auth';

const attempts = new Map<string, { count: number; reset: number }>();
const schema = z.object({ email: z.email(), password: z.string().min(8).max(200) });

export async function POST(request: NextRequest) {
  const ip = request.headers.get('cf-connecting-ip') || 'local'; const now = Date.now(); const state = attempts.get(ip);
  if (state && state.reset > now && state.count >= 6) return NextResponse.json({ error: 'Muitas tentativas. Aguarde alguns minutos.' }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Informe email e senha válidos.' }, { status: 400 });
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) return NextResponse.json({ error: 'Login administrativo ainda não foi configurado no servidor.' }, { status: 503 });
  if (parsed.data.email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase() || parsed.data.password !== env.ADMIN_PASSWORD) {
    attempts.set(ip, { count: state && state.reset > now ? state.count + 1 : 1, reset: now + 10 * 60 * 1000 });
    return NextResponse.json({ error: 'Email ou senha incorretos.' }, { status: 401 });
  }
  attempts.delete(ip); const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, await createAdminSession(parsed.data.email), { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'strict', path: '/', maxAge: 8 * 60 * 60 });
  return response;
}

export async function DELETE(request: NextRequest) { const response = NextResponse.json({ ok: true }); response.cookies.set(adminCookieName, '', { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'strict', path: '/', maxAge: 0 }); return response; }
