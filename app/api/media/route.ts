import { NextRequest, NextResponse } from 'next/server';
import { getObject } from '@/lib/server/supabase';

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key');
  if (!key || !key.startsWith('covers/'))
    return NextResponse.json({ error: 'Imagem inválida.' }, { status: 400 });
  const object = await getObject(key);
  if (!object)
    return NextResponse.json(
      { error: 'Imagem não encontrada.' },
      { status: 404 },
    );
  return new Response(object.body, {
    headers: {
      'content-type': object.headers.get('content-type') || 'application/octet-stream',
      'cache-control':
        'public, max-age=31536000, s-maxage=31536000, immutable',
      'cdn-cache-control': 'public, max-age=31536000, immutable',
      ...(object.headers.get('etag')
        ? { etag: object.headers.get('etag')! }
        : {}),
      ...(object.headers.get('last-modified')
        ? { 'last-modified': object.headers.get('last-modified')! }
        : {}),
    },
  });
}
