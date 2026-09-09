import { env } from '@/lib/server/runtime-env';
import { selectRows, upsertRows } from '@/lib/server/supabase';
import {
  decryptIntegrationConfig,
  encryptIntegrationConfig,
  type EncryptedIntegrationConfig,
} from '@/lib/server/integration-crypto';

const SETTINGS_KEY = 'resend_integration';

export type ResendCredentials = {
  apiKey: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  updatedAt?: string;
};

export type ResendIntegrationStatus = {
  configured: boolean;
  apiKeyHint: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  source: 'panel' | 'environment' | null;
  updatedAt: string;
};

export async function loadStoredResendCredentials() {
  const [row] = await selectRows<{ value: EncryptedIntegrationConfig }>(
    'site_settings',
    { key: `eq.${SETTINGS_KEY}`, select: 'value', limit: 1 },
  );
  return row?.value
    ? decryptIntegrationConfig<ResendCredentials>(row.value)
    : null;
}

export async function resolveResendCredentials(): Promise<{
  credentials: ResendCredentials | null;
  source: ResendIntegrationStatus['source'];
}> {
  try {
    const stored = await loadStoredResendCredentials();
    if (stored?.apiKey && stored.fromEmail)
      return { credentials: stored, source: 'panel' };
  } catch (error) {
    if (!env.RESEND_API_KEY) throw error;
    console.error('resend_panel_config_read_failed', error);
  }
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL)
    return { credentials: null, source: null };
  return {
    source: 'environment',
    credentials: {
      apiKey: env.RESEND_API_KEY,
      fromName: env.RESEND_FROM_NAME || 'Vovó Tereza',
      fromEmail: env.RESEND_FROM_EMAIL,
      replyTo: env.RESEND_REPLY_TO || '',
    },
  };
}

export async function saveResendCredentials(credentials: ResendCredentials) {
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
  value ? `${value.slice(0, 5)}••••••••${value.slice(-4)}` : '';

export async function getResendIntegrationStatus(): Promise<ResendIntegrationStatus> {
  const { credentials, source } = await resolveResendCredentials();
  return {
    configured: Boolean(credentials?.apiKey && credentials.fromEmail),
    apiKeyHint: maskSecret(credentials?.apiKey || ''),
    fromName: credentials?.fromName || '',
    fromEmail: credentials?.fromEmail || '',
    replyTo: credentials?.replyTo || '',
    source,
    updatedAt: credentials?.updatedAt || '',
  };
}
