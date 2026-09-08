import { NextRequest, NextResponse } from 'next/server';
import { getAdminEmail } from '@/lib/server/admin-auth';
import { uploadObject } from '@/lib/server/supabase';

const safePart = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export async function POST(request: NextRequest) {
  if (!(await getAdminEmail()))
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  const form = await request.formData();
  const file = form.get('file');
  const productValue = form.get('productId');
  const kindValue = form.get('kind');
  const productId =
    typeof productValue === 'string' ? productValue : 'catalogo';
  const kind = typeof kindValue === 'string' ? kindValue : 'cover';
  if (!(file instanceof File))
    return NextResponse.json(
      { error: 'Selecione um arquivo.' },
      { status: 400 },
    );
  const isCover = kind === 'cover';
  const allowed = isCover
    ? ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
    : ['application/pdf'];
  const maxSize = isCover ? 8 * 1024 * 1024 : 50 * 1024 * 1024;
  if (!allowed.includes(file.type))
    return NextResponse.json(
      {
        error: isCover
          ? 'Envie uma imagem JPG, PNG, WebP ou AVIF.'
          : 'Envie o entregável em PDF.',
      },
      { status: 400 },
    );
  if (file.size > maxSize)
    return NextResponse.json(
      { error: `O arquivo deve ter no máximo ${isCover ? '8 MB' : '50 MB'}.` },
      { status: 400 },
    );
  const key = `${isCover ? 'covers' : 'deliverables'}/${safePart(productId)}/${crypto.randomUUID()}-${safePart(file.name)}`;
  try {
    await uploadObject(key, await file.arrayBuffer(), file.type);
    return NextResponse.json({
      ok: true,
      key,
      fileName: file.name,
      url: isCover ? `/api/media?key=${encodeURIComponent(key)}` : undefined,
    });
  } catch {
    return NextResponse.json(
      { error: 'Não foi possível armazenar o arquivo.' },
      { status: 500 },
    );
  }
}
