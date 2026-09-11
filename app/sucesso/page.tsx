import { CheckCircle2, Download, Mail } from 'lucide-react';
import Link from 'next/link';
import { MarketingPixels } from '@/components/tracking/marketing-pixels';
import { getSiteConfig } from '@/lib/server/site-config';
import { getStripe } from '@/lib/server/stripe';
import { selectRows } from '@/lib/server/supabase';

type Order = { id: string; orderNumber: string; downloadToken: string | null };
type OrderItem = {
  id: string;
  productId: string | null;
  titleSnapshot: string;
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const config = await getSiteConfig();
  let session = null;
  try {
    if (sessionId)
      session = await (await getStripe()).checkout.sessions.retrieve(sessionId);
  } catch {
    session = null;
  }
  if (!sessionId || !session || session.payment_status !== 'paid')
    return (
      <main className="status-page">
        <div className="status-card">
          <h1>Pagamento ainda não confirmado</h1>
          <p>
            Se você acabou de pagar, aguarde alguns instantes e atualize esta
            página. O acesso só é liberado depois da confirmação segura da
            Stripe.
          </p>
          <Link className="secondary-button" href="/receitas">
            VOLTAR À LOJA
          </Link>
        </div>
      </main>
    );
  let order: Order | undefined;
  let items: OrderItem[] = [];
  try {
    const [row] = await selectRows<{
      id: string;
      order_number: string;
      download_token: string | null;
    }>('orders', {
      stripe_checkout_session_id: `eq.${session.id}`,
      select: 'id,order_number,download_token',
      limit: 1,
    });
    if (row) {
      order = {
        id: row.id,
        orderNumber: row.order_number,
        downloadToken: row.download_token,
      };
      const rows = await selectRows<{
        id: string;
        product_id: string | null;
        title_snapshot: string;
      }>('order_items', {
        order_id: `eq.${row.id}`,
        select: 'id,product_id,title_snapshot',
      });
      items = rows.map((item) => ({
        id: item.id,
        productId: item.product_id,
        titleSnapshot: item.title_snapshot,
      }));
    }
  } catch {}
  const purchaseId = order?.id || session.client_reference_id || session.id;
  const productIds = [
    ...new Set(
      items.flatMap((item) => (item.productId ? [item.productId] : [])),
    ),
  ];
  return (
    <main className="status-page">
      <MarketingPixels
        metaPixelId={config.metaPixelId}
        googleAnalyticsId={config.googleAnalyticsId}
        tiktokPixelId={config.tiktokPixelId}
        purchase={{
          eventId: purchaseId,
          value: session.amount_total || 0,
          currency: session.currency || 'brl',
          itemCount: productIds.length || items.length,
          contentIds: productIds,
        }}
      />
      <div className="status-card success">
        <CheckCircle2 />
        <p className="eyebrow">PAGAMENTO CONFIRMADO</p>
        <h1>
          Obrigado,{' '}
          {session.customer_details?.name?.split(' ')[0] ||
            'sua compra foi recebida'}
        </h1>
        <p>
          Seu pedido foi confirmado. Também enviamos as instruções para{' '}
          <strong>{session.customer_details?.email}</strong>.
        </p>
        <div className="order-box">
          <span>Pedido</span>
          <strong>{order?.orderNumber || session.client_reference_id}</strong>
          {items.map((item) => (
            <div key={item.id}>
              <span>{item.titleSnapshot}</span>
              {order?.downloadToken ? (
                <a
                  href={`/api/download?token=${order.downloadToken}&product=${item.productId}`}
                >
                  <Download /> Baixar
                </a>
              ) : (
                <small>Preparando acesso</small>
              )}
            </div>
          ))}
        </div>
        <p className="delivery-note">
          <Mail /> Guarde esta página e confira também sua caixa de spam.
        </p>
        <Link className="secondary-button" href="/receitas">
          VOLTAR À PÁGINA INICIAL
        </Link>
      </div>
    </main>
  );
}
