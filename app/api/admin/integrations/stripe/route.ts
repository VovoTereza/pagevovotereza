import { getAdminEmail } from '@/lib/server/admin-auth';
import {
  getStripeIntegrationStatus,
  resolveStripeCredentials,
  saveStripeCredentials,
} from '@/lib/server/stripe-config';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';

const schema = z.object({
  secretKey: z.string().trim().max(300).optional().default(''),
  publishableKey: z.string().trim().max(300).optional().default(''),
  webhookSecret: z.string().trim().max(300).optional().default(''),
});

async function authorized() {
  return Boolean(await getAdminEmail());
}

export async function GET(request: NextRequest) {
  if (!(await authorized()))
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  try {
    return NextResponse.json({
      status: await getStripeIntegrationStatus(),
      webhookUrl: `${request.nextUrl.origin}/api/stripe/webhook`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar a configuração da Stripe.',
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
      { error: 'Revise as credenciais informadas.' },
      { status: 400 },
    );

  try {
    const current = (await resolveStripeCredentials()).credentials;
    const secretKey = parsed.data.secretKey || current?.secretKey || '';
    const publishableKey =
      parsed.data.publishableKey || current?.publishableKey || '';
    const webhookSecret =
      parsed.data.webhookSecret || current?.webhookSecret || '';

    if (!/^sk_(test|live)_/.test(secretKey))
      return NextResponse.json(
        {
          error:
            'Informe uma chave secreta Stripe válida (sk_test_ ou sk_live_).',
        },
        { status: 400 },
      );
    if (!/^pk_(test|live)_/.test(publishableKey))
      return NextResponse.json(
        {
          error:
            'Informe uma chave publicável Stripe válida (pk_test_ ou pk_live_).',
        },
        { status: 400 },
      );
    if (
      (secretKey.startsWith('sk_live_') &&
        !publishableKey.startsWith('pk_live_')) ||
      (secretKey.startsWith('sk_test_') &&
        !publishableKey.startsWith('pk_test_'))
    )
      return NextResponse.json(
        {
          error:
            'As chaves secreta e publicável precisam pertencer ao mesmo modo da Stripe.',
        },
        { status: 400 },
      );
    if (webhookSecret && !webhookSecret.startsWith('whsec_'))
      return NextResponse.json(
        { error: 'O segredo do webhook deve começar com whsec_.' },
        { status: 400 },
      );

    const stripe = new Stripe(secretKey, {
      httpClient: Stripe.createFetchHttpClient(),
    });
    const account = await stripe.accounts.retrieve(null);
    const accountName =
      account.business_profile?.name ||
      account.settings?.dashboard?.display_name ||
      account.email ||
      account.id;

    await saveStripeCredentials({
      secretKey,
      publishableKey,
      webhookSecret,
      accountId: account.id,
      accountName,
    });

    return NextResponse.json({
      ok: true,
      status: await getStripeIntegrationStatus(),
      webhookUrl: `${request.nextUrl.origin}/api/stripe/webhook`,
    });
  } catch (error) {
    const message =
      error instanceof Stripe.errors.StripeError
        ? 'A Stripe recusou essa chave. Confirme a credencial e tente novamente.'
        : error instanceof Error
          ? error.message
          : 'Não foi possível salvar a integração.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
