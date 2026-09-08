import { env } from 'cloudflare:workers';

type QueryValue = string | number | boolean;

function settings() {
  const url = env.SUPABASE_URL?.replace(/\/$/, '');
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase não configurado no servidor.');
  return { url, key, bucket: env.SUPABASE_STORAGE_BUCKET || 'vovo-tereza-files' };
}

async function request<T>(path: string, init: RequestInit = {}) {
  const { url, key } = settings();
  const headers = new Headers(init.headers);
  headers.set('apikey', key);
  headers.set('authorization', `Bearer ${key}`);
  if (init.body && !headers.has('content-type'))
    headers.set('content-type', 'application/json');
  const response = await fetch(`${url}${path}`, {
    ...init,
    headers,
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase ${response.status}: ${detail.slice(0, 300)}`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

const query = (values: Record<string, QueryValue | undefined>) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
};

export function selectRows<T>(
  table: string,
  values: Record<string, QueryValue | undefined> = {},
) {
  return request<T[]>(`/rest/v1/${table}${query(values)}`);
}

export function insertRows<T>(table: string, rows: object | object[]) {
  return request<T[]>(`/rest/v1/${table}`, {
    method: 'POST',
    headers: { prefer: 'return=representation' },
    body: JSON.stringify(rows),
  });
}

export function upsertRows<T>(
  table: string,
  rows: object | object[],
  onConflict?: string,
) {
  return request<T[]>(
    `/rest/v1/${table}${query({ on_conflict: onConflict })}`,
    {
      method: 'POST',
      headers: { prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(rows),
    },
  );
}

export function updateRows<T>(
  table: string,
  filters: Record<string, QueryValue>,
  values: object,
) {
  return request<T[]>(`/rest/v1/${table}${query(filters)}`, {
    method: 'PATCH',
    headers: { prefer: 'return=representation' },
    body: JSON.stringify(values),
  });
}

export function deleteRows(table: string, filters: Record<string, QueryValue>) {
  return request<void>(`/rest/v1/${table}${query(filters)}`, {
    method: 'DELETE',
  });
}

const storagePath = (key: string) =>
  key
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');

export async function uploadObject(
  key: string,
  body: ArrayBuffer,
  contentType: string,
) {
  const { url, key: serviceKey, bucket } = settings();
  const response = await fetch(
    `${url}/storage/v1/object/${encodeURIComponent(bucket)}/${storagePath(key)}`,
    {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        authorization: `Bearer ${serviceKey}`,
        'content-type': contentType,
        'x-upsert': 'true',
      },
      body,
    },
  );
  if (!response.ok)
    throw new Error(`Falha no Storage: ${(await response.text()).slice(0, 300)}`);
}

export async function getObject(key: string) {
  const { url, key: serviceKey, bucket } = settings();
  const response = await fetch(
    `${url}/storage/v1/object/authenticated/${encodeURIComponent(bucket)}/${storagePath(key)}`,
    {
      headers: {
        apikey: serviceKey,
        authorization: `Bearer ${serviceKey}`,
      },
    },
  );
  if (response.status === 404) return null;
  if (!response.ok)
    throw new Error(`Falha no Storage: ${(await response.text()).slice(0, 300)}`);
  return response;
}
