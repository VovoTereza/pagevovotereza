import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { CheckCircle2, Download, Mail } from 'lucide-react';
import Link from 'next/link';
import { getDb } from '@/db';
import { orderItems, orders } from '@/db/schema';
import { getStripe } from '@/lib/server/stripe';

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id: sessionId } = await searchParams; let session = null;
  try { if (sessionId && env.STRIPE_SECRET_KEY) session = await getStripe().checkout.sessions.retrieve(sessionId); } catch { session = null; }
  if (!sessionId || !session || session.payment_status !== 'paid') return <main className="status-page"><div className="status-card"><h1>Pagamento ainda não confirmado</h1><p>Se você acabou de pagar, aguarde alguns instantes e atualize esta página. O acesso só é liberado depois da confirmação segura da Stripe.</p><Link className="secondary-button" href="/">VOLTAR À LOJA</Link></div></main>;
  let order: typeof orders.$inferSelect | undefined; let items: (typeof orderItems.$inferSelect)[] = [];
  try { [order] = await getDb().select().from(orders).where(eq(orders.stripeCheckoutSessionId, session.id)).limit(1); if (order) items = await getDb().select().from(orderItems).where(eq(orderItems.orderId, order.id)); } catch {}
  return <main className="status-page"><div className="status-card success"><CheckCircle2/><p className="eyebrow">PAGAMENTO CONFIRMADO</p><h1>Obrigado, {session.customer_details?.name?.split(' ')[0] || 'sua compra foi recebida'}</h1><p>Seu pedido foi confirmado. Também enviamos as instruções para <strong>{session.customer_details?.email}</strong>.</p><div className="order-box"><span>Pedido</span><strong>{order?.orderNumber || session.client_reference_id}</strong>{items.map((item) => <div key={item.id}><span>{item.titleSnapshot}</span>{order?.downloadToken ? <a href={`/api/download?token=${order.downloadToken}&product=${item.productId}`}><Download/> Baixar</a> : <small>Preparando acesso</small>}</div>)}</div><p className="delivery-note"><Mail/> Guarde esta página e confira também sua caixa de spam.</p><Link className="secondary-button" href="/">VOLTAR À PÁGINA INICIAL</Link></div></main>;
}
