import { env } from 'cloudflare:workers';
import { cookies } from 'next/headers';

const COOKIE = 'vovo_admin_session';
const encoder = new TextEncoder();
const toHex = (bytes: ArrayBuffer) => [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');

async function signature(payload: string) {
  if (!env.ADMIN_SESSION_SECRET) return '';
  const key = await crypto.subtle.importKey('raw', encoder.encode(env.ADMIN_SESSION_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)));
}

export async function createAdminSession(email: string) {
  const payload = `${email}|${Date.now() + 8 * 60 * 60 * 1000}`;
  return `${payload}|${await signature(payload)}`;
}

export async function verifyAdminSession(raw?: string | null) {
  if (!raw) return null;
  const [email, expiry, supplied] = raw.split('|');
  if (!email || !expiry || !supplied || Number(expiry) < Date.now()) return null;
  const expected = await signature(`${email}|${expiry}`);
  if (!expected || expected.length !== supplied.length) return null;
  let mismatch = 0; for (let i = 0; i < expected.length; i++) mismatch |= expected.charCodeAt(i) ^ supplied.charCodeAt(i);
  return mismatch === 0 ? email : null;
}

export async function getAdminEmail() { return verifyAdminSession((await cookies()).get(COOKIE)?.value); }
export const adminCookieName = COOKIE;
