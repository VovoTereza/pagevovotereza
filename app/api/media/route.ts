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
      'cache-control': 'public, max-age=3600',
    },
  });
}
