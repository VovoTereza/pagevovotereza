import { Resend } from 'resend';
import type { Product } from '@/lib/catalog';
import { env } from '@/lib/server/runtime-env';
import { resolveResendCredentials } from '@/lib/server/resend-config';
import {
  purchaseEmailTemplate,
  recoveryEmailTemplate,
} from '@/lib/server/email-templates';

export async function sendOrderEmails(input: {
  customerEmail: string | null;
  customerName: string | null;
  orderId: string;
  orderNumber: string;
  downloadToken: string;
  products: Product[];
  purchasedProductIds: string[];
  requestOrigin: string;
}) {
  if (!input.customerEmail) return;
  const { credentials } = await resolveResendCredentials();
  if (!credentials) return;

  const siteUrl = (env.NEXT_PUBLIC_SITE_URL || input.requestOrigin).replace(
    /\/$/,
    '',
  );
  const resend = new Resend(credentials.apiKey);
  const from = `${credentials.fromName} <${credentials.fromEmail}>`;
  const replyTo = credentials.replyTo || undefined;
  const uniquePurchasedIds = [...new Set(input.purchasedProductIds)];
  const purchased = uniquePurchasedIds
    .map((id) => input.products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));
  const purchaseTemplate = purchaseEmailTemplate({
    customerName: input.customerName,
    orderNumber: input.orderNumber,
    siteUrl,
    products: purchased.map((product) => ({
      name: product.name,
      downloadUrl: `${siteUrl}/api/download?token=${encodeURIComponent(input.downloadToken)}&product=${encodeURIComponent(product.id)}`,
    })),
  });

  const purchaseResult = await resend.emails.send(
    {
      from,
      to: input.customerEmail,
      replyTo,
      subject: `Seus arquivos estão prontos · Pedido ${input.orderNumber}`,
      html: purchaseTemplate.html,
      text: purchaseTemplate.text,
    },
    { idempotencyKey: `purchase-${input.orderId}` },
  );
  if (purchaseResult.error) throw new Error(purchaseResult.error.message);

  const purchasedSet = new Set(uniquePurchasedIds);
  const productsLeft = input.products.filter(
    (product) => product.active && !purchasedSet.has(product.id),
  );
  if (!productsLeft.length) return;
  const recoveryTemplate = recoveryEmailTemplate({
    customerName: input.customerName,
    siteUrl,
    products: productsLeft.map((product) => ({
      name: product.name,
      price: product.price,
      coverImage: product.coverImage
        ? new URL(product.coverImage, `${siteUrl}/`).toString()
        : undefined,
      url: `${siteUrl}/produto/${encodeURIComponent(product.slug)}`,
    })),
  });
  const sendAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const recoveryResult = await resend.emails.send(
    {
      from,
      to: input.customerEmail,
      replyTo,
      subject: 'Alguns cadernos ficaram de fora da sua coleção',
      html: recoveryTemplate.html,
      text: recoveryTemplate.text,
      scheduledAt: sendAt,
    },
    { idempotencyKey: `recovery-${input.orderId}` },
  );
  if (recoveryResult.error) throw new Error(recoveryResult.error.message);
}
