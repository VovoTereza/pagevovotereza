import { env } from '@/lib/server/runtime-env';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export type EncryptedIntegrationConfig = {
  version: 1;
  iv: string;
  ciphertext: string;
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

export async function encryptIntegrationConfig<
  T extends { updatedAt?: string },
>(value: T) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    await encryptionKey(),
    encoder.encode(JSON.stringify(value)),
  );
  return {
    version: 1,
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
    updatedAt: value.updatedAt || new Date().toISOString(),
  } satisfies EncryptedIntegrationConfig;
}

export async function decryptIntegrationConfig<T>(
  value: EncryptedIntegrationConfig,
) {
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
  return JSON.parse(decoder.decode(plaintext)) as T;
}
