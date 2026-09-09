import { getAdminEmail } from '@/lib/server/admin-auth';
import {
  getResendIntegrationStatus,
  resolveResendCredentials,
  saveResendCredentials,
} from '@/lib/server/resend-config';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

const schema = z.object({
  apiKey: z.string().trim().max(300).optional().default(''),
  fromName: z.string().trim().min(2).max(100),
  fromEmail: z.email().trim().max(200),
  replyTo: z.union([z.literal(''), z.email().trim().max(200)]),
});

async function authorized() {
  return Boolean(await getAdminEmail());
}

export async function GET() {
  if (!(await authorized()))
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  try {
    return NextResponse.json({ status: await getResendIntegrationStatus() });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar a configuração da Resend.',
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!(await authorized()))
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Revise o remetente, o e-mail e a chave informados.' },
      { status: 400 },
    );

  try {
    const current = (await resolveResendCredentials()).credentials;
    const apiKey = parsed.data.apiKey || current?.apiKey || '';
    if (!apiKey.startsWith('re_'))
      return NextResponse.json(
        { error: 'Informe uma chave de API válida da Resend (re_...).' },
        { status: 400 },
      );

    const resend = new Resend(apiKey);
    const validation = await resend.domains.list();
    if (validation.error)
      return NextResponse.json(
        {
          error:
            'A Resend recusou essa chave. Confirme a credencial e tente novamente.',
        },
        { status: 400 },
      );

    await saveResendCredentials({
      apiKey,
      fromName: parsed.data.fromName,
      fromEmail: parsed.data.fromEmail,
      replyTo: parsed.data.replyTo,
    });
    return NextResponse.json({
      ok: true,
      status: await getResendIntegrationStatus(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Não foi possível salvar a integração da Resend.',
      },
      { status: 400 },
    );
  }
}
