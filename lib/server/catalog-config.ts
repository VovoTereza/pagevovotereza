import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { siteSettings } from '@/db/schema';
import { defaultCatalog, type CatalogConfig } from '@/lib/catalog';

export async function getCatalogConfig(): Promise<CatalogConfig> {
  try {
    const [row] = await getDb()
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'catalog_config'))
      .limit(1);
    const value = row?.value as Partial<CatalogConfig> | undefined;
    if (!value) return structuredClone(defaultCatalog);
    return {
      products: value.products?.length
        ? value.products
        : defaultCatalog.products,
      bundles: value.bundles?.length ? value.bundles : defaultCatalog.bundles,
      orderBump: value.orderBump || defaultCatalog.orderBump,
      cartOffer: value.cartOffer || defaultCatalog.cartOffer,
      exitOffers: value.exitOffers?.length
        ? value.exitOffers
        : defaultCatalog.exitOffers,
      testimonials: value.testimonials || [],
    };
  } catch {
    return structuredClone(defaultCatalog);
  }
}
