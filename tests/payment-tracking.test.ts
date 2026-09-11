import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const webhook = readFileSync(
  new URL('../app/api/stripe/webhook/route.ts', import.meta.url),
  'utf8',
);
const checkout = readFileSync(
  new URL('../app/api/checkout/route.ts', import.meta.url),
  'utf8',
);
const success = readFileSync(
  new URL('../app/sucesso/page.tsx', import.meta.url),
  'utf8',
);
const pixels = readFileSync(
  new URL('../components/tracking/marketing-pixels.tsx', import.meta.url),
  'utf8',
);

test('webhook confirma e entrega somente sessões efetivamente pagas', () => {
  assert.match(webhook, /session\.payment_status !== 'paid'/);
  assert.match(webhook, /event\.data\.object\.payment_status === 'paid'/);
  assert.match(webhook, /checkout\.session\.async_payment_succeeded/);
});

test('checkout preserva a atribuição até o webhook', () => {
  for (const field of [
    'sourceType',
    'sourcePlatform',
    'utmSource',
    'utmMedium',
    'utmCampaign',
    'utmContent',
    'utmTerm',
    'landingUrl',
    'referrer',
  ]) {
    assert.match(checkout, new RegExp(field));
    assert.match(webhook, new RegExp(field));
  }
});

test('Purchase nasce apenas na página protegida por pagamento confirmado', () => {
  assert.match(success, /session\.payment_status !== 'paid'/);
  assert.match(success, /<MarketingPixels/);
  assert.match(pixels, /'Purchase'/);
  assert.match(pixels, /eventID: purchase\.eventId/);
  assert.match(pixels, /vovo-paid-purchase:/);
});
