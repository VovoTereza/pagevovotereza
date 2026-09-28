import type { CatalogConfig } from '@/lib/catalog';

export type CheckoutCartItem = {
  kind: 'bundle' | 'product';
  id: string;
  quantity?: number;
  source?: 'order_bump' | 'cart_offer' | 'exit_offer';
  offerStage?: number;
};

export type ExternalCheckoutLink = {
  signature: string;
  url: string;
};

export type ExternalCheckoutOption = {
  signature: string;
  label: string;
  detail: string;
  total: number;
  items: CheckoutCartItem[];
};

export function checkoutCartSignature(items: CheckoutCartItem[]) {
  return items
    .map(
      (item) =>
        `${item.kind}:${item.id}:${item.source || 'standard'}:${item.offerStage || 0}:${item.quantity || 1}`,
    )
    .sort()
    .join('|');
}

export function buildExternalCheckoutOptions(
  catalog: CatalogConfig,
): ExternalCheckoutOption[] {
  const product = (id: string) =>
    catalog.products.find((item) => item.id === id);
  const bases: {
    label: string;
    bundleId: string;
    price: number;
    item: CheckoutCartItem;
  }[] = catalog.bundles.map((bundle) => ({
    label: bundle.name,
    bundleId: bundle.id,
    price: bundle.price,
    item: { kind: 'bundle', id: bundle.id, quantity: 1 },
  }));
  for (const offer of catalog.exitOffers) {
    if (!offer.discountPercent) continue;
    const bundle = catalog.bundles.find((item) => item.id === offer.bundleId);
    if (!bundle) continue;
    bases.push({
      label: `${bundle.name} · recuperação ${offer.stage} (-${offer.discountPercent}%)`,
      bundleId: bundle.id,
      price: Math.round(bundle.price * (1 - offer.discountPercent / 100)),
      item: {
        kind: 'bundle',
        id: bundle.id,
        quantity: 1,
        source: 'exit_offer',
        offerStage: offer.stage,
      },
    });
  }

  const options = new Map<string, ExternalCheckoutOption>();
  const standaloneAdditions = [
    {
      item: {
        kind: 'product' as const,
        id: catalog.orderBump.productId,
        quantity: 1,
        source: 'order_bump' as const,
      },
      price: catalog.orderBump.price,
      name: product(catalog.orderBump.productId)?.name || 'Oferta adicional',
    },
    {
      item: {
        kind: 'product' as const,
        id: catalog.cartOffer.productId,
        quantity: 1,
        source: 'cart_offer' as const,
      },
      price: catalog.cartOffer.price,
      name: product(catalog.cartOffer.productId)?.name || 'Oferta complementar',
    },
  ];

  for (let mask = 1; mask < 1 << standaloneAdditions.length; mask += 1) {
    const chosen = standaloneAdditions.filter(
      (_, index) => mask & (1 << index),
    );
    const items = chosen.map((item) => item.item);
    const signature = checkoutCartSignature(items);
    options.set(signature, {
      signature,
      label: chosen.map((item) => item.name).join(' + '),
      detail: `${chosen.length} ${chosen.length === 1 ? 'produto digital' : 'produtos digitais'}`,
      total: chosen.reduce((sum, item) => sum + item.price, 0),
      items,
    });
  }

  for (const base of bases) {
    const bundle = catalog.bundles.find((item) => item.id === base.bundleId);
    if (!bundle) continue;
    const additions = [
      {
        item: {
          kind: 'product' as const,
          id: catalog.orderBump.productId,
          quantity: 1,
          source: 'order_bump' as const,
        },
        price: catalog.orderBump.price,
        name: product(catalog.orderBump.productId)?.name || 'Oferta adicional',
        available: !bundle.productIds.includes(catalog.orderBump.productId),
      },
      {
        item: {
          kind: 'product' as const,
          id: catalog.cartOffer.productId,
          quantity: 1,
          source: 'cart_offer' as const,
        },
        price: catalog.cartOffer.price,
        name:
          product(catalog.cartOffer.productId)?.name || 'Oferta complementar',
        available: !bundle.productIds.includes(catalog.cartOffer.productId),
      },
    ].filter((item) => item.available);

    for (let mask = 0; mask < 1 << additions.length; mask += 1) {
      const chosen = additions.filter((_, index) => mask & (1 << index));
      const items = [base.item, ...chosen.map((item) => item.item)];
      const signature = checkoutCartSignature(items);
      const suffix = chosen.length
        ? ` + ${chosen.map((item) => item.name).join(' + ')}`
        : '';
      options.set(signature, {
        signature,
        label: `${base.label}${suffix}`,
        detail: `${bundle.productIds.length + chosen.length} ${bundle.productIds.length + chosen.length === 1 ? 'produto digital' : 'produtos digitais'}`,
        total: base.price + chosen.reduce((sum, item) => sum + item.price, 0),
        items,
      });
    }
  }
  return [...options.values()];
}
