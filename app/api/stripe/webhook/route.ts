import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/server/stripe';
import { resolveStripeCredentials } from '@/lib/server/stripe-config';
import { getCatalogConfig } from '@/lib/server/catalog-config';
import { insertRows, updateRows, upsertRows } from '@/lib/server/supabase';

type CartInput = {
  kind: 'bundle' | 'product';
  id: string;
  quantity: number;
  source?: 'order_bump' | 'cart_offer' | 'exit_offer';
};

async function completeCheckout(session: Stripe.Checkout.Session) {
  const { products, bundles, orderBump, cartOffer } = await getCatalogConfig();
  const getBundle = (id: string) => bundles.find((item) => item.id === id);
  const getProduct = (id: string) => products.find((item) => item.id === id);
  const orderId =
    session.metadata?.orderId ||
    session.client_reference_id ||
    crypto.randomUUID();
  const orderNumber =
    session.metadata?.orderNumber ||
    `VT-${Date.now().toString(36).toUpperCase()}`;
  const cart = JSON.parse(session.metadata?.cart || '[]') as CartInput[];
  const total = session.amount_total || 0;
  const email =
    session.customer_details?.email || session.customer_email || null;
  const name = session.customer_details?.name || null;
  const token = crypto.randomUUID();
  await upsertRows('orders', {
      id: orderId,
      order_number: orderNumber,
      customer_name: name,
      customer_email: email,
      subtotal: session.amount_subtotal || total,
      discount: (session.amount_subtotal || total) - total,
      total,
      currency: (session.currency || 'brl').toUpperCase(),
      stripe_payment_intent_id:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : null,
      stripe_checkout_session_id: session.id,
      stripe_customer_id:
        typeof session.customer === 'string' ? session.customer : null,
      status: 'confirmed',
      payment_status: 'paid',
      download_token: token,
      updated_at: new Date().toISOString(),
    }, 'id');
  const rows: Record<string, unknown>[] = [];
  for (const item of cart) {
    if (item.kind === 'bundle') {
      const bundle = getBundle(item.id);
      if (!bundle) continue;
      for (const productId of bundle.productIds)
        rows.push({
          id: crypto.randomUUID(),
          order_id: orderId,
          product_id: productId,
          bundle_id: bundle.id,
          title_snapshot: getProduct(productId)?.name || bundle.name,
          quantity: item.quantity,
          unit_price: 0,
          total: 0,
          item_type: 'bundle_product',
        });
    } else {
      const product = getProduct(item.id);
      if (product) {
        let price = product.price;
        if (item.source === 'order_bump' && item.id === orderBump.productId)
          price = orderBump.price;
        if (item.source === 'cart_offer' && item.id === cartOffer.productId)
          price = cartOffer.price;
        rows.push({
          id: crypto.randomUUID(),
          order_id: orderId,
          product_id: product.id,
          title_snapshot: product.name,
          quantity: item.quantity,
          unit_price: price,
          total: price * item.quantity,
          item_type: item.source || 'product',
        });
      }
    }
  }
  if (rows.length) await insertRows('order_items', rows);
}

export async function POST(request: NextRequest) {
  const { credentials } = await resolveStripeCredentials();
  if (!credentials?.webhookSecret)
    return NextResponse.json(
      { error: 'Webhook não configurado.' },
      { status: 503 },
    );
  const signature = request.headers.get('stripe-signature');
  if (!signature)
    return NextResponse.json({ error: 'Assinatura ausente.' }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = await (await getStripe()).webhooks.constructEventAsync(
      await request.text(),
      signature,
      credentials.webhookSecret,
    );
  } catch {
    return NextResponse.json(
      { error: 'Assinatura inválida.' },
      { status: 400 },
    );
  }
  try {
    await insertRows('processed_webhooks', { id: event.id, type: event.type });
  } catch {
    return NextResponse.json({ received: true, duplicate: true });
  }
  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded'
  )
    await completeCheckout(event.data.object);
  if (
    event.type === 'checkout.session.async_payment_failed' ||
    event.type === 'checkout.session.expired'
  )
    await updateRows('orders', { stripe_checkout_session_id: `eq.${event.data.object.id}` }, {
        status: event.type.endsWith('expired') ? 'expired' : 'payment_failed',
        payment_status: 'failed',
        updated_at: new Date().toISOString(),
      });
  if (event.type === 'charge.refunded') {
    const intent =
      typeof event.data.object.payment_intent === 'string'
        ? event.data.object.payment_intent
        : '';
    if (intent)
      await updateRows('orders', { stripe_payment_intent_id: `eq.${intent}` }, {
          status: 'refunded',
          payment_status: 'refunded',
          updated_at: new Date().toISOString(),
        });
  }
  return NextResponse.json({ received: true });
}
