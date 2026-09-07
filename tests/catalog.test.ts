import assert from 'node:assert/strict';
import test from 'node:test';
import {
  bundles,
  cartOffer,
  exitOffers,
  getBundle,
  getProduct,
  orderBump,
} from '../lib/catalog.ts';

test('todos os bundles possuem produtos válidos e economia real', () => {
  for (const bundle of bundles) {
    assert.ok(bundle.productIds.every((id) => getProduct(id)));
    assert.ok(bundle.compareAtPrice > bundle.price);
    assert.ok(bundle.price > 0);
  }
});

test('bundle padrão e três ofertas progressivas estão configurados', () => {
  assert.equal(getBundle('familia')?.recommended, true);
  assert.deepEqual(
    exitOffers.map((offer) => offer.stage),
    [1, 2, 3],
  );
  assert.ok(exitOffers.every((offer) => getBundle(offer.bundleId)));
});

test('order bump e cart offer apontam para produtos existentes', () => {
  assert.ok(getProduct(orderBump.productId));
  assert.ok(getProduct(cartOffer.productId));
  assert.ok(orderBump.price < getProduct(orderBump.productId)!.price);
  assert.ok(cartOffer.price < getProduct(cartOffer.productId)!.price);
});
