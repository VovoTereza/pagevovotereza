import { env } from 'cloudflare:workers';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { digitalAssets, orderItems, orders } from '@/db/schema';
import { getCatalogConfig } from '@/lib/server/catalog-config';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token'); const productId = request.nextUrl.searchParams.get('product');
  if (!token || !productId) return NextResponse.json({ error: 'Link inválido.' }, { status: 400 });
  const db = getDb(); const [order] = await db.select().from(orders).where(and(eq(orders.downloadToken, token), eq(orders.paymentStatus, 'paid'))).limit(1);
  if (!order) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const [owned] = await db.select().from(orderItems).where(and(eq(orderItems.orderId, order.id), eq(orderItems.productId, productId))).limit(1);
  if (!owned) return NextResponse.json({ error: 'Produto não pertence a este pedido.' }, { status: 403 });
  const [asset] = await db.select().from(digitalAssets).where(and(eq(digitalAssets.productId, productId), eq(digitalAssets.active, true))).limit(1);
  const configuredProduct = (await getCatalogConfig()).products.find((product) => product.id === productId);
  const fileKey = asset?.fileKey || configuredProduct?.digitalFile;
  const fileName = asset?.fileName || configuredProduct?.digitalFileName || 'caderno-vovo-tereza.pdf';
  const contentType = asset?.contentType || 'application/pdf';
  if (!fileKey) return NextResponse.json({ error: 'Arquivo temporariamente indisponível. Entre em contato com o suporte.' }, { status: 404 });
  const object = await env.FILES.get(fileKey); if (!object) return NextResponse.json({ error: 'Arquivo não encontrado.' }, { status: 404 });
  return new Response(object.body, { headers: { 'content-type': contentType, 'content-disposition': `attachment; filename="${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}"`, 'cache-control': 'private, no-store' } });
}
