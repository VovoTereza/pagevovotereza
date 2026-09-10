import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { insertRows, upsertRows } from '@/lib/server/supabase';

const schema = z.object({
  name: z.string().min(2).max(80),
  sessionId: z.uuid(),
  visitorId: z.uuid().optional(),
  visibility: z.enum(['visible', 'hidden', 'prerender']).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

const safeHeader = (request: NextRequest, name: string) => {
  const value = request.headers.get(name) || '';
  try { return decodeURIComponent(value); } catch { return value; }
};

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Evento inválido.' }, { status: 400 });
  const { name, sessionId, visitorId, payload = {}, visibility } = parsed.data;
  const now = new Date().toISOString();
  const geo = {
    country: safeHeader(request, 'x-vercel-ip-country'),
    region: safeHeader(request, 'x-vercel-ip-country-region'),
    city: safeHeader(request, 'x-vercel-ip-city'),
    latitude: Number(safeHeader(request, 'x-vercel-ip-latitude')) || null,
    longitude: Number(safeHeader(request, 'x-vercel-ip-longitude')) || null,
  };
  const active = !['session_hidden', 'session_end'].includes(name) && visibility !== 'hidden';
  const enriched = { ...payload, ...geo, visitorId };
  const presenceEvent = name.startsWith('session_');
  const lastEvent = presenceEvent && typeof payload.lastMeaningfulEvent === 'string'
    ? payload.lastMeaningfulEvent
    : name;
  const lastActionAt = presenceEvent && typeof payload.lastMeaningfulEventAt === 'string'
    ? payload.lastMeaningfulEventAt
    : now;
  try {
    await upsertRows('site_settings', {
      key: `analytics_presence.${sessionId}`,
      value: { ...enriched, sessionId, lastEvent, lastActionAt, lastSeenAt: now, active },
      updated_at: now,
    }, 'key');
    if (name !== 'session_heartbeat') {
      await insertRows('analytics_events', {
        id: crypto.randomUUID(), name, session_id: sessionId, payload: enriched, created_at: now,
      });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('analytics_write_failed', error);
    return NextResponse.json({ error: 'Evento não registrado.' }, { status: 503 });
  }
}
