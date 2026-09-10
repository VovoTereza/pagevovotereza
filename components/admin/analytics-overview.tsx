'use client';

import { useCallback, useEffect, useState } from 'react';
import { Activity, Check, Copy, Eye, MousePointerClick, Radio, RefreshCw, ShoppingCart, WalletCards, type LucideIcon } from 'lucide-react';
import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import dynamic from 'next/dynamic';

const LiveVisitorsMap = dynamic(
  () =>
    import('./live-visitors-map').then((module) => module.LiveVisitorsMap),
  {
    ssr: false,
    loading: () => (
      <output className="analytics-map-loading">
        Carregando mapa ao vivo…
      </output>
    ),
  },
);

type Slice = { name: string; value: number };
type LiveVisitor = { sessionId: string; lastSeenAt: string; lastActionAt: string; path: string; sourceType: string; sourcePlatform: string; city: string; region: string; country: string; latitude: number | null; longitude: number | null; device: string; browser: string; lastEvent: string };
type AnalyticsData = {
  updatedAt: string;
  kpis: { uniqueVisitors: number; pageViews: number; cartOpens: number; checkoutStarts: number; purchases: number; revenue: number; activeNow: number };
  funnel: Slice[];
  sources: Slice[];
  platforms: Slice[];
  live: LiveVisitor[];
};

const empty: AnalyticsData = { updatedAt: '', kpis: { uniqueVisitors: 0, pageViews: 0, cartOpens: 0, checkoutStarts: 0, purchases: 0, revenue: 0, activeNow: 0 }, funnel: [], sources: [], platforms: [], live: [] };
const colors = ['#2f6d37', '#b65032', '#d89b2b', '#7e684f', '#6c8b68', '#2f2922'];
const sourceLabel: Record<string, string> = { paid: 'Tráfego pago', organic: 'Orgânico', direct: 'Direto', referral: 'Referência', unknown: 'Não identificado' };
const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);
const liveEventLabels: Record<string, string> = {
  page_view: 'Visualizando a página', cart_open: 'Carrinho aberto', cart_close: 'Fechou o carrinho',
  bundle_add_to_cart: 'Adicionou a coleção', order_bump_accept: 'Aceitou o order bump',
  order_bump_reject: 'Recusou o order bump', cart_offer_accept: 'Aceitou a oferta',
  cart_offer_reject: 'Recusou a oferta', checkout_started: 'Iniciou o checkout',
};
const trackedSources = [
  ['WhatsApp', 'whatsapp', 'share'], ['Facebook', 'facebook', 'social'],
  ['Instagram', 'instagram', 'social'], ['YouTube', 'youtube', 'social'],
  ['TikTok', 'tiktok', 'social'], ['Google Ads', 'google', 'cpc'],
] as const;

function Donut({ title, data, translate = false }: { title: string; data: Slice[]; translate?: boolean }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const shown = data.map((item, index) => ({ ...item, fill: colors[index % colors.length] }));
  return (
    <article className="analytics-card analytics-donut-card">
      <div className="analytics-card-heading"><div><span>AQUISIÇÃO</span><h2>{title}</h2></div></div>
      <div className="analytics-donut-layout">
        <div className="analytics-donut">
          {data.length ? <ResponsiveContainer width="100%" height="100%" minWidth={0}><PieChart><Pie data={shown} dataKey="value" nameKey="name" innerRadius="63%" outerRadius="88%" paddingAngle={data.length > 1 ? 3 : 0} stroke="none" /><Tooltip formatter={(value) => [`${Number(value)} visitante${Number(value) === 1 ? '' : 's'}`, 'Total']} /></PieChart></ResponsiveContainer> : <div className="analytics-empty-ring" />}
          <div><strong>{total}</strong><span>visitantes</span></div>
        </div>
        <ul>{data.length ? data.map((item, index) => <li key={item.name}><i style={{ background: colors[index % colors.length] }} /><span>{translate ? sourceLabel[item.name] || item.name : item.name}</span><strong>{item.value}</strong><small>{total ? Math.round((item.value / total) * 100) : 0}%</small></li>) : <li className="analytics-no-data">Os dados aparecerão após os primeiros acessos.</li>}</ul>
      </div>
    </article>
  );
}

export function AnalyticsOverview() {
  const [range, setRange] = useState('today');
  const [data, setData] = useState<AnalyticsData>(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?range=${range}`, { cache: 'no-store' });
      const value = await response.json() as AnalyticsData & { error?: string };
      if (!response.ok) throw new Error(value.error || 'Falha ao carregar dados.');
      setData(value); setError('');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Falha ao carregar dados.'); }
    finally { setLoading(false); }
  }, [range]);
  const loadLive = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/analytics?live=1', { cache: 'no-store' });
      const value = await response.json() as { updatedAt: string; activeNow: number; live: LiveVisitor[] };
      if (!response.ok) return;
      setData((current) => ({ ...current, updatedAt: value.updatedAt, live: value.live, kpis: { ...current.kpis, activeNow: value.activeNow } }));
    } catch { /* A atualização histórica continua visível se a rede oscilar. */ }
  }, []);
  useEffect(() => {
    queueMicrotask(() => void load());
    const liveTimer = window.setInterval(() => { if (document.visibilityState === 'visible') void loadLive(); }, 2000);
    const totalsTimer = window.setInterval(() => { if (document.visibilityState === 'visible') void load(true); }, 10000);
    return () => { window.clearInterval(liveTimer); window.clearInterval(totalsTimer); };
  }, [load, loadLive]);
  const copyLink = async (label: string, source: string, medium: string) => {
    const url = new URL('/receitas', window.location.origin);
    url.searchParams.set('utm_source', source);
    url.searchParams.set('utm_medium', medium);
    url.searchParams.set('utm_campaign', 'principal');
    await navigator.clipboard.writeText(url.toString());
    setCopied(label);
    window.setTimeout(() => setCopied((current) => current === label ? '' : current), 1800);
  };
  const base = Math.max(data.kpis.uniqueVisitors, data.funnel.find((item) => item.name === 'Acessaram')?.value || 0, 1);
  const cards: Array<{ label: string; value: string | number; note: string; Icon: LucideIcon }> = [
    { label: 'Visitantes únicos', value: data.kpis.uniqueVisitors, note: 'Navegadores distintos no período', Icon: Eye },
    { label: 'Carrinhos abertos', value: data.kpis.cartOpens, note: `${Math.round((data.kpis.cartOpens / base) * 100)}% dos acessos`, Icon: ShoppingCart },
    { label: 'Checkouts iniciados', value: data.kpis.checkoutStarts, note: `${Math.round((data.kpis.checkoutStarts / base) * 100)}% dos acessos`, Icon: WalletCards },
    { label: 'Compras confirmadas', value: data.kpis.purchases, note: 'Somente pagamentos aprovados', Icon: MousePointerClick },
    { label: 'Receita paga', value: money(data.kpis.revenue), note: 'Somente pedidos pagos', Icon: Activity },
  ];
  return (
    <div className={`admin-overview${loading ? ' is-loading' : ''}`} aria-busy={loading}>
      <div className="analytics-toolbar">
        <div className="analytics-live-status"><i /><strong>{data.kpis.activeNow}</strong><span>{data.kpis.activeNow === 1 ? 'pessoa vendo agora' : 'pessoas vendo agora'}</span></div>
        <div><label htmlFor="analytics-range">Período</label><select id="analytics-range" value={range} onChange={(event) => setRange(event.target.value)}><option value="today">Hoje</option><option value="7d">Últimos 7 dias</option><option value="30d">Últimos 30 dias</option></select><button type="button" onClick={() => void load()} aria-label="Atualizar analytics"><RefreshCw /></button></div>
      </div>
      {error && <div className="analytics-error">{error} <button onClick={() => void load()}>Tentar novamente</button></div>}
      <section className="analytics-kpi-grid" aria-label="Indicadores principais">
        {cards.map(({ label, value, note, Icon }) => <article key={label}><Icon /><span>{label}</span><strong>{value}</strong><small>{note}</small></article>)}
      </section>
      <section className="analytics-live-grid">
        <article className="analytics-card analytics-map-card"><div className="analytics-card-heading"><div><span>TEMPO REAL</span><h2>Localização dos acessos ao vivo</h2></div><b><Radio /> AO VIVO</b></div><LiveVisitorsMap visitors={data.live} /></article>
        <article className="analytics-card analytics-activity-card"><div className="analytics-card-heading"><div><span>PRESENÇA REAL</span><h2>Pessoas ativas agora</h2></div><b><Radio /> AO VIVO</b></div><div className="analytics-activity-list">{data.live.length ? data.live.map((item) => <div key={item.sessionId}><i /><p><strong>{liveEventLabels[item.lastEvent] || 'Visualizando a página'}</strong><span>{item.city} · {item.sourcePlatform}</span><small>{item.device} · última ação às {new Date(item.lastActionAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</small></p></div>) : <div className="analytics-activity-empty"><Activity /><strong>Ninguém vendo a página agora</strong><span>Uma pessoa desaparece daqui ao sair ou ocultar a página.</span></div>}</div></article>
      </section>
      <section className="analytics-card analytics-funnel-card"><div className="analytics-card-heading"><div><span>JORNADA DE COMPRA</span><h2>Ações e conversões</h2></div></div><div className="analytics-funnel">{data.funnel.map((item) => <article key={item.name}><span>{item.name}</span><strong>{item.value}</strong><div><i style={{ width: `${Math.max(item.value ? (item.value / base) * 100 : 0, item.value ? 5 : 0)}%` }} /></div><small>{Math.round((item.value / base) * 100)}% dos acessos</small></article>)}</div></section>
      <section className="analytics-source-grid"><Donut title="Origem dos acessos" data={data.sources} translate /><Donut title="Plataforma de descoberta" data={data.platforms} /></section>
      <section className="analytics-card analytics-tracking-card"><div className="analytics-card-heading"><div><span>RASTREAMENTO PRECISO</span><h2>Links identificados por plataforma</h2></div></div><p>Use estes links nas publicações e mensagens. Apps como o WhatsApp podem ocultar a origem; o parâmetro no link mantém a identificação correta.</p><div>{trackedSources.map(([label, source, medium]) => <button type="button" key={label} onClick={() => void copyLink(label, source, medium)}>{copied === label ? <Check /> : <Copy />}<span>{copied === label ? 'Link copiado' : label}</span></button>)}</div><small>Quando alguém pesquisa no Google e abre o resultado orgânico, o painel identifica automaticamente como “Pesquisa Google”.</small></section>
      <p className="analytics-footnote">Presença atualizada a cada 2 segundos. Visitantes são deduplicados no mesmo navegador. Atualizado {data.updatedAt ? new Date(data.updatedAt).toLocaleString('pt-BR') : 'agora'}. A localização é aproximada e nenhum endereço IP é armazenado.</p>
    </div>
  );
}
