import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultCatalog } from '../lib/catalog.ts';
import {
  buildExternalCheckoutOptions,
  checkoutCartSignature,
} from '../lib/external-checkout.ts';

test('gera uma assinatura estável independente da ordem do carrinho', () => {
  const first = checkoutCartSignature([
    { kind: 'bundle', id: 'essencial' },
    { kind: 'product', id: 'sobremesas', source: 'order_bump' },
  ]);
  const second = checkoutCartSignature([
    { kind: 'product', id: 'sobremesas', source: 'order_bump' },
    { kind: 'bundle', id: 'essencial' },
  ]);
  assert.equal(first, second);
});

test('gera links distintos para cesta, adicionais e descontos de recuperação', () => {
  const options = buildExternalCheckoutOptions(defaultCatalog);
  assert.ok(options.length > defaultCatalog.bundles.length);
  assert.equal(
    new Set(options.map((option) => option.signature)).size,
    options.length,
  );
  assert.ok(
    options.some((option) => option.label.includes('Caderno da Babosa')),
  );
  assert.ok(options.some((option) => option.label.includes('recuperação 1')));
  assert.ok(options.some((option) => option.label.includes('recuperação 3')));
});

test('não oferece novamente produtos já incluídos na biblioteca completa', () => {
  const complete = buildExternalCheckoutOptions(defaultCatalog).filter(
    (option) => option.label === 'Biblioteca da Vovó Tereza',
  );
  assert.equal(complete.length, 1);
  assert.equal(complete[0]?.items.length, 1);
});

test('cobre adicionais que permanecem após a remoção do pacote', () => {
  const options = buildExternalCheckoutOptions(defaultCatalog);
  const additionalOnly = checkoutCartSignature([
    {
      kind: 'product',
      id: defaultCatalog.orderBump.productId,
      source: 'order_bump',
    },
  ]);
  const bothAdditionals = checkoutCartSignature([
    {
      kind: 'product',
      id: defaultCatalog.orderBump.productId,
      source: 'order_bump',
    },
    {
      kind: 'product',
      id: defaultCatalog.cartOffer.productId,
      source: 'cart_offer',
    },
  ]);
  assert.ok(options.some((option) => option.signature === additionalOnly));
  assert.ok(options.some((option) => option.signature === bothAdditionals));
});
