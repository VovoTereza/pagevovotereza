import { env } from '@/lib/server/runtime-env';
import { selectRows, upsertRows } from '@/lib/server/supabase';

const SETTINGS_KEY = 'stripe_integration';
const encoder = new TextEncoder();
const decoder = new TextDecoder();

type EncryptedStripeConfig = {
  version: 1;
  iv: string;
  ciphertext: string;
  updatedAt: string;
};

export type StripeCredentials = {
  secretKey: string;
  webhookSecret: string;
  accountId?: string;
  accountName?: string;
  updatedAt?: string;
};

export type StripeIntegrationStatus = {
  configured: boolean;
  secretKeyHint: string;
  webhookConfigured: boolean;
  webhookSecretHint: string;
  mode: 'test' | 'live' | null;
  accountId: string;
  accountName: string;
  source: 'panel' | 'environment' | null;
  updatedAt: string;
};

const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

const base64ToBytes = (value: string) => {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

async function encryptionKey() {
  const source = env.INTEGRATION_ENCRYPTION_KEY || env.ADMIN_SESSION_SECRET;
  if (!source)
    throw new Error(
      'Defina INTEGRATION_ENCRYPTION_KEY ou ADMIN_SESSION_SECRET no servidor antes de salvar integrações.',
    );
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(source));
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, [
    'encrypt',
    'decrypt',
  ]);
}

async function encryptCredentials(credentials: StripeCredentials) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    await encryptionKey(),
    encoder.encode(JSON.stringify(credentials)),
  );
  return {
    version: 1,
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
    updatedAt: credentials.updatedAt || new Date().toISOString(),
  } satisfies EncryptedStripeConfig;
}

async function decryptCredentials(value: EncryptedStripeConfig) {
  if (
    value?.version !== 1 ||
    typeof value.iv !== 'string' ||
    typeof value.ciphertext !== 'string'
  )
    return null;
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBytes(value.iv) },
    await encryptionKey(),
    base64ToBytes(value.ciphertext),
  );
  return JSON.parse(decoder.decode(plaintext)) as StripeCredentials;
}

export async function loadStoredStripeCredentials() {
  const [row] = await selectRows<{ value: EncryptedStripeConfig }>(
    'site_settings',
    {
      key: `eq.${SETTINGS_KEY}`,
      select: 'value',
      limit: 1,
    },
  );
  return row?.value ? decryptCredentials(row.value) : null;
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
      value: await encryptCredentials({ ...credentials, updatedAt }),
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
    secretKeyHint: maskSecret(credentials?.secretKey || ''),
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
