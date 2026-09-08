import { env } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getCatalogConfig } from '@/lib/server/catalog-config';
import { getObject, selectRows } from '@/lib/server/supabase';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token'); const productId = request.nextUrl.searchParams.get('product');
  if (!token || !productId) return NextResponse.json({ error: 'Link inválido.' }, { status: 400 });
  const [order] = await selectRows<{ id: string }>('orders', { download_token: `eq.${token}`, payment_status: 'eq.paid', select: 'id', limit: 1 });
  if (!order) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const [owned] = await selectRows<{ id: string }>('order_items', { order_id: `eq.${order.id}`, product_id: `eq.${productId}`, select: 'id', limit: 1 });
  if (!owned) return NextResponse.json({ error: 'Produto não pertence a este pedido.' }, { status: 403 });
  const [asset] = await selectRows<{ file_key: string; file_name: string; content_type: string }>('digital_assets', { product_id: `eq.${productId}`, active: 'eq.true', select: 'file_key,file_name,content_type', limit: 1 });
  const configuredProduct = (await getCatalogConfig()).products.find((product) => product.id === productId);
  const fileKey = asset?.file_key || configuredProduct?.digitalFile;
  const fileName = asset?.file_name || configuredProduct?.digitalFileName || 'caderno-vovo-tereza.pdf';
  const contentType = asset?.content_type || 'application/pdf';
  if (!fileKey) return NextResponse.json({ error: 'Arquivo temporariamente indisponível. Entre em contato com o suporte.' }, { status: 404 });
  const object = await getObject(fileKey); if (!object) return NextResponse.json({ error: 'Arquivo não encontrado.' }, { status: 404 });
  void env;
  return new Response(object.body, { headers: { 'content-type': contentType, 'content-disposition': `attachment; filename="${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}"`, 'cache-control': 'private, no-store' } });
}
