import { NextRequest, NextResponse } from 'next/server';
import { getAdminEmail } from '@/lib/server/admin-auth';
import { selectRows } from '@/lib/server/supabase';

type EventRow = { name: string; session_id: string | null; order_id: string | null; payload: Record<string, unknown> | null; created_at: string };
type PresenceRow = { key: string; value: Record<string, unknown>; updated_at: string };
type OrderRow = { id: string; total: number; payment_status: string; created_at: string };

const eventLabels: Record<string, string> = {
  page_view: 'Acessou a página', cart_open: 'Abriu o carrinho', cart_close: 'Fechou o carrinho',
  bundle_add_to_cart: 'Adicionou a coleção', order_bump_accept: 'Aceitou o order bump',
  order_bump_reject: 'Recusou o order bump', cart_offer_accept: 'Aceitou a oferta do carrinho',
  cart_offer_reject: 'Recusou a oferta do carrinho', checkout_started: 'Iniciou o checkout', purchase_completed: 'Compra confirmada',
};

function startFor(range: string) {
  const now = new Date();
  if (range === 'today') {
    const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
    return new Date(`${day}T00:00:00-03:00`);
  }
  return new Date(now.getTime() - (range === '30d' ? 30 : 7) * 86400000);
}

const text = (value: unknown, fallback = '') => typeof value === 'string' && value ? value : fallback;

async function selectAll<T>(table: string, filters: Record<string, string | number>) {
  const rows: T[] = [];
  for (let offset = 0; ; offset += 1000) {
    const page = await selectRows<T>(table, { ...filters, limit: 1000, offset });
    rows.push(...page);
    if (page.length < 1000) return rows;
  }
}

export async function GET(request: NextRequest) {
  if (!(await getAdminEmail())) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  const range = ['today', '7d', '30d'].includes(request.nextUrl.searchParams.get('range') || '') ? request.nextUrl.searchParams.get('range')! : 'today';
  const start = startFor(range);
  const activeCutoff = Date.now() - 25000;
  try {
    const [events, presence, orders] = await Promise.all([
      selectAll<EventRow>('analytics_events', { select: 'name,session_id,order_id,payload,created_at', created_at: `gte.${start.toISOString()}`, order: 'created_at.desc' }),
      selectAll<PresenceRow>('site_settings', { select: 'key,value,updated_at', key: 'like.analytics_presence.%', updated_at: `gte.${new Date(activeCutoff).toISOString()}`, order: 'updated_at.desc' }),
      selectAll<OrderRow>('orders', { select: 'id,total,payment_status,created_at', created_at: `gte.${start.toISOString()}` }),
    ]);
    const sessions = new Set(events.map((item) => item.session_id).filter(Boolean));
    const counts = (name: string) => new Set(events.filter((event) => event.name === name).map((event) => event.session_id || event.order_id).filter(Boolean)).size;
    const group = (field: 'sourceType' | 'sourcePlatform') => {
      const seen = new Set<string>(); const result = new Map<string, number>();
      for (const event of events) {
        const id = event.session_id; if (!id || seen.has(id)) continue; seen.add(id);
        const key = text(event.payload?.[field], field === 'sourceType' ? 'unknown' : 'Não identificado');
        result.set(key, (result.get(key) || 0) + 1);
      }
      return [...result].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    };
    const live = presence.flatMap((row) => {
      const value = row.value || {}; const lastSeenAt = text(value.lastSeenAt, row.updated_at);
      if (value.active !== true || new Date(lastSeenAt).getTime() < activeCutoff) return [];
      return [{ sessionId: text(value.sessionId, row.key.slice('analytics_presence.'.length)), lastSeenAt, path: text(value.path, '/receitas'), sourceType: text(value.sourceType, 'unknown'), sourcePlatform: text(value.sourcePlatform, 'Não identificado'), city: text(value.city, 'Localização indisponível'), region: text(value.region), country: text(value.country), latitude: Number(value.latitude) || null, longitude: Number(value.longitude) || null, device: text(value.device, 'Dispositivo não identificado'), browser: text(value.browser), lastEvent: text(value.lastEvent, 'page_view') }];
    });
    const paid = orders.filter((order) => order.payment_status === 'paid');
    return NextResponse.json({
      range, updatedAt: new Date().toISOString(),
      kpis: { uniqueVisitors: sessions.size, pageViews: events.filter((event) => event.name === 'page_view').length, cartOpens: counts('cart_open'), checkoutStarts: counts('checkout_started'), purchases: paid.length, revenue: paid.reduce((sum, order) => sum + Number(order.total || 0), 0), activeNow: live.length },
      funnel: [
        ['Acessaram', counts('page_view')], ['Abriram o carrinho', counts('cart_open')], ['Adicionaram coleção', counts('bundle_add_to_cart')],
        ['Aceitaram bump', counts('order_bump_accept')], ['Recusaram bump', counts('order_bump_reject')], ['Aceitaram oferta', counts('cart_offer_accept')], ['Recusaram oferta', counts('cart_offer_reject')], ['Iniciaram checkout', counts('checkout_started')], ['Compraram', paid.length],
      ].map(([name, value]) => ({ name, value })),
      sources: group('sourceType'), platforms: group('sourcePlatform'), live,
      recent: events.filter((event) => eventLabels[event.name]).slice(0, 30).map((event) => ({ name: event.name, label: eventLabels[event.name], at: event.created_at, city: text(event.payload?.city, 'Localização indisponível'), platform: text(event.payload?.sourcePlatform, 'Não identificado'), device: text(event.payload?.device, 'Dispositivo não identificado') })),
    });
  } catch (error) {
    console.error('admin_analytics_read_failed', error);
    return NextResponse.json({ error: 'Não foi possível carregar os dados de analytics.' }, { status: 500 });
  }
}
