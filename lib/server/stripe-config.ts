import { env } from '@/lib/server/runtime-env';
import { selectRows, upsertRows } from '@/lib/server/supabase';
import {
  decryptIntegrationConfig,
  encryptIntegrationConfig,
  type EncryptedIntegrationConfig,
} from '@/lib/server/integration-crypto';

const SETTINGS_KEY = 'stripe_integration';

export type StripeCredentials = {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  accountId?: string;
  accountName?: string;
  updatedAt?: string;
};

export type StripeIntegrationStatus = {
  configured: boolean;
  embeddedCheckoutConfigured: boolean;
  secretKeyHint: string;
  publishableKeyHint: string;
  webhookConfigured: boolean;
  webhookSecretHint: string;
  mode: 'test' | 'live' | null;
  accountId: string;
  accountName: string;
  source: 'panel' | 'environment' | null;
  updatedAt: string;
};

export async function loadStoredStripeCredentials() {
  const [row] = await selectRows<{ value: EncryptedIntegrationConfig }>(
    'site_settings',
    {
      key: `eq.${SETTINGS_KEY}`,
      select: 'value',
      limit: 1,
    },
  );
  return row?.value
    ? decryptIntegrationConfig<StripeCredentials>(row.value)
    : null;
}

export async function resolveStripeCredentials(): Promise<{
  credentials: StripeCredentials | null;
  source: StripeIntegrationStatus['source'];
}> {
  try {
    const stored = await loadStoredStripeCredentials();
    if (stored?.secretKey) return { credentials: stored, source: 'panel' };
  } catch (error) {
    if (!env.STRIPE_SECRET_KEY) throw error;
    console.error('stripe_panel_config_read_failed', error);
  }
  if (!env.STRIPE_SECRET_KEY) return { credentials: null, source: null };
  return {
    source: 'environment',
    credentials: {
      secretKey: env.STRIPE_SECRET_KEY,
      publishableKey: env.STRIPE_PUBLISHABLE_KEY || '',
      webhookSecret: env.STRIPE_WEBHOOK_SECRET || '',
    },
  };
}

export async function saveStripeCredentials(credentials: StripeCredentials) {
  const updatedAt = new Date().toISOString();
  await upsertRows(
    'site_settings',
    {
      key: SETTINGS_KEY,
      value: await encryptIntegrationConfig({ ...credentials, updatedAt }),
      updated_at: updatedAt,
    },
    'key',
  );
}

const maskSecret = (value: string) =>
  value ? `${value.slice(0, 7)}••••••••${value.slice(-4)}` : '';

export async function getStripeIntegrationStatus(): Promise<StripeIntegrationStatus> {
  const { credentials, source } = await resolveStripeCredentials();
  return {
    configured: Boolean(credentials?.secretKey),
    embeddedCheckoutConfigured: Boolean(credentials?.publishableKey),
    secretKeyHint: maskSecret(credentials?.secretKey || ''),
    publishableKeyHint: maskSecret(credentials?.publishableKey || ''),
    webhookConfigured: Boolean(credentials?.webhookSecret),
    webhookSecretHint: maskSecret(credentials?.webhookSecret || ''),
    mode: credentials?.secretKey
      ? credentials.secretKey.startsWith('sk_live_')
        ? 'live'
        : 'test'
      : null,
    accountId: credentials?.accountId || '',
    accountName: credentials?.accountName || '',
    source,
    updatedAt: credentials?.updatedAt || '',
  };
}
