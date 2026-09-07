import { env } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  cartOffer,
  exitOffers,
  getBundle,
  getProduct,
  orderBump,
} from '@/lib/catalog';
import { getStripe } from '@/lib/server/stripe';
import { getDb } from '@/db';
import { orders } from '@/db/schema';

const requestSchema = z.object({
  items: z
    .array(
      z.object({
        kind: z.enum(['bundle', 'product']),
        id: z.string().max(80),
        quantity: z.number().int().min(1).max(5),
        source: z.enum(['order_bump', 'cart_offer', 'exit_offer']).optional(),
        offerStage: z.number().int().min(1).max(3).optional(),
      }),
    )
    .min(1)
    .max(10),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json(
        { error: 'O carrinho enviado não é válido.' },
        { status: 400 },
      );
    const covered = new Set<string>();
    const resolved = parsed.data.items
      .map((item) => {
        if (item.kind === 'bundle') {
          const bundle = getBundle(item.id);
          if (!bundle) throw new Error('Bundle indisponível.');
          bundle.productIds.forEach((id) => covered.add(id));
          const offer =
            item.source === 'exit_offer'
              ? exitOffers.find(
                  (entry) =>
                    entry.stage === item.offerStage &&
                    entry.bundleId === item.id,
                )
              : undefined;
          const price = offer
            ? Math.round(bundle.price * (1 - offer.discountPercent / 100))
            : bundle.price;
          return {
            ...item,
            title: bundle.name,
            price,
            productIds: bundle.productIds,
          };
        }
        const product = getProduct(item.id);
        if (!product?.active) throw new Error('Produto indisponível.');
        let price = product.price;
        if (item.source === 'order_bump' && item.id === orderBump.productId)
          price = orderBump.price;
        if (item.source === 'cart_offer' && item.id === cartOffer.productId)
          price = cartOffer.price;
        return {
          ...item,
          title: product.name,
          price,
          productIds: [product.id],
        };
      })
      .filter((item) => item.kind === 'bundle' || !covered.has(item.id));
    const total = resolved.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    if (total < 100) throw new Error('Total inválido.');
    const orderId = crypto.randomUUID();
    const orderNumber = `VT-${Date.now().toString(36).toUpperCase()}`;
    try {
      await getDb()
        .insert(orders)
        .values({
          id: orderId,
          orderNumber,
          subtotal: total,
          total,
          currency: 'BRL',
          status: 'pending',
          paymentStatus: 'pending',
        });
    } catch (error) {
      console.error('pending_order_write_failed', error);
    }
    const origin = env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        locale: 'pt-BR',
        customer_creation: 'always',
        billing_address_collection: 'auto',
        allow_promotion_codes: true,
        client_reference_id: orderId,
        metadata: {
          orderId,
          orderNumber,
          cart: JSON.stringify(parsed.data.items),
        },
        line_items: resolved.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: 'brl',
            unit_amount: item.price,
            product_data: {
              name: item.title,
              description:
                item.kind === 'bundle'
                  ? `${item.productIds.length} itens digitais`
                  : 'Produto digital',
            },
          },
        })),
        success_url: `${origin}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/?checkout=cancelado#ofertas`,
      },
      { idempotencyKey: request.headers.get('x-idempotency-key') || orderId },
    );
    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Não foi possível iniciar o pagamento.',
      },
      { status: 500 },
    );
  }
}
