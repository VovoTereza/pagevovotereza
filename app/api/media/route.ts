import { env } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key');
  if (!key || !key.startsWith('covers/'))
    return NextResponse.json({ error: 'Imagem inválida.' }, { status: 400 });
  const object = await env.FILES.get(key);
  if (!object)
    return NextResponse.json(
      { error: 'Imagem não encontrada.' },
      { status: 404 },
    );
  return new Response(object.body, {
    headers: {
      'content-type':
        object.httpMetadata?.contentType || 'application/octet-stream',
      'cache-control': 'public, max-age=3600',
    },
  });
}
