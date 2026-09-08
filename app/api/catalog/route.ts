import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminEmail } from '@/lib/server/admin-auth';
import { getCatalogConfig } from '@/lib/server/catalog-config';
import { upsertRows } from '@/lib/server/supabase';

const productSchema = z.object({
  id: z.string().min(2).max(80),
  name: z.string().min(3).max(140),
  slug: z.string().min(2).max(120),
  description: z.string().min(8).max(600),
  price: z.number().int().min(100).max(10000000),
  compareAtPrice: z.number().int().min(100).max(10000000).optional(),
  category: z.string().min(2).max(80),
  active: z.boolean(),
  coverImage: z.string().max(500).optional(),
  digitalFile: z.string().max(500).optional(),
  digitalFileName: z.string().max(180).optional(),
});
const bundleSchema = z.object({
  id: z.string().min(2).max(80),
  name: z.string().min(3).max(140),
  badge: z.string().max(60).optional(),
  description: z.string().min(8).max(500),
  productIds: z.array(z.string().max(80)).min(1).max(20),
  price: z.number().int().min(100).max(10000000),
  compareAtPrice: z.number().int().min(100).max(10000000),
  cta: z.string().min(3).max(80),
  recommended: z.boolean().optional(),
});
const simpleOfferSchema = z.object({
  id: z.string().min(2).max(80),
  productId: z.string().min(2).max(80),
  headline: z.string().min(3).max(160),
  description: z.string().min(8).max(400),
  price: z.number().int().min(100).max(10000000),
});
const exitOfferSchema = z.object({
  stage: z.number().int().min(1).max(10),
  banner: z.string().max(500).optional(),
  headline: z.string().min(3).max(160),
  description: z.string().min(8).max(500),
  bundleId: z.string().min(2).max(80),
  discountPercent: z.number().int().min(0).max(90),
  cta: z.string().min(3).max(80),
});
const testimonialSchema = z.object({
  id: z.string().min(2).max(80),
  name: z.string().min(2).max(100),
  headline: z.string().max(120).optional(),
  city: z.string().max(100).optional(),
  text: z.string().min(5).max(800),
  photo: z.string().max(500).optional(),
  rating: z.number().int().min(1).max(5),
  active: z.boolean(),
});
const catalogSchema = z.object({
  products: z.array(productSchema).min(1).max(100),
  bundles: z.array(bundleSchema).min(1).max(30),
  orderBump: simpleOfferSchema,
  cartOffer: simpleOfferSchema,
  exitOffers: z.array(exitOfferSchema).min(1).max(10),
  testimonials: z.array(testimonialSchema).max(100),
});

export async function GET() {
  return NextResponse.json(await getCatalogConfig());
}

export async function PUT(request: NextRequest) {
  if (!(await getAdminEmail()))
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  const parsed = catalogSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Revise os dados do catálogo antes de salvar.' },
      { status: 400 },
    );
  const productIds = new Set(parsed.data.products.map((product) => product.id));
  if (
    parsed.data.bundles.some((bundle) =>
      bundle.productIds.some((id) => !productIds.has(id)),
    )
  )
    return NextResponse.json(
      { error: 'Um bundle contém um produto inexistente.' },
      { status: 400 },
    );
  if (
    !productIds.has(parsed.data.orderBump.productId) ||
    !productIds.has(parsed.data.cartOffer.productId)
  )
    return NextResponse.json(
      { error: 'Uma oferta aponta para um produto inexistente.' },
      { status: 400 },
    );
  try {
    await upsertRows(
      'site_settings',
      {
        key: 'catalog_config',
        value: parsed.data,
        updated_at: new Date().toISOString(),
      },
      'key',
    );
    return NextResponse.json({ ok: true, catalog: parsed.data });
    /* O modelo relacional detalhado continua documentado na migração SQL.
    const db = getDb();
    for (const product of parsed.data.products) {
      await db
        .insert(productRows)
        .values({
          id: product.id,
          name: product.name,
          slug: product.slug,
          internalName: product.name,
          shortDescription: product.description,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          currency: 'BRL',
          active: product.active,
          coverImage: product.coverImage,
          deliveryType: 'digital',
          digitalFile: product.digitalFile,
        })
        .onConflictDoUpdate({
          target: productRows.id,
          set: {
            name: product.name,
            slug: product.slug,
            internalName: product.name,
            shortDescription: product.description,
            description: product.description,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            active: product.active,
            coverImage: product.coverImage,
            digitalFile: product.digitalFile,
            updatedAt: new Date(),
          },
        });
    }
    for (const bundle of parsed.data.bundles) {
      await db
        .insert(bundleRows)
        .values({
          id: bundle.id,
          name: bundle.name,
          internalName: bundle.name,
          slug: bundle.id,
          shortDescription: bundle.description,
          description: bundle.description,
          price: bundle.price,
          compareAtPrice: bundle.compareAtPrice,
          badgeText: bundle.badge,
          ctaText: bundle.cta,
          recommended: Boolean(bundle.recommended),
          active: true,
        })
        .onConflictDoUpdate({
          target: bundleRows.id,
          set: {
            name: bundle.name,
            internalName: bundle.name,
            shortDescription: bundle.description,
            description: bundle.description,
            price: bundle.price,
            compareAtPrice: bundle.compareAtPrice,
            badgeText: bundle.badge,
            ctaText: bundle.cta,
            recommended: Boolean(bundle.recommended),
            updatedAt: new Date(),
          },
        });
      await db.delete(bundleItems).where(eq(bundleItems.bundleId, bundle.id));
      await db.insert(bundleItems).values(
        bundle.productIds.map((productId, index) => ({
          bundleId: bundle.id,
          productId,
          quantity: 1,
          sortOrder: index,
        })),
      );
    }
    const bump = parsed.data.orderBump;
    await db
      .insert(orderBumps)
      .values({
        id: bump.id,
        name: bump.headline,
        internalName: bump.headline,
        headline: bump.headline,
        description: bump.description,
        productId: bump.productId,
        priceOverride: bump.price,
        ctaText: 'ADICIONAR',
        active: true,
      })
      .onConflictDoUpdate({
        target: orderBumps.id,
        set: {
          name: bump.headline,
          headline: bump.headline,
          description: bump.description,
          productId: bump.productId,
          priceOverride: bump.price,
          updatedAt: new Date(),
        },
      });
    const cart = parsed.data.cartOffer;
    await db
      .insert(cartOffers)
      .values({
        id: cart.id,
        name: cart.headline,
        internalName: cart.headline,
        headline: cart.headline,
        description: cart.description,
        productId: cart.productId,
        priceOverride: cart.price,
        ctaText: 'ADICIONAR',
        active: true,
      })
      .onConflictDoUpdate({
        target: cartOffers.id,
        set: {
          name: cart.headline,
          headline: cart.headline,
          description: cart.description,
          productId: cart.productId,
          priceOverride: cart.price,
          updatedAt: new Date(),
        },
      });
    for (const offer of parsed.data.exitOffers) {
      const id = `exit-${offer.stage}`;
      await db
        .insert(exitOfferRows)
        .values({
          id,
          stage: offer.stage,
          name: offer.headline,
          internalName: offer.headline,
          headline: offer.headline,
          description: offer.description,
          offerType: 'bundle',
          bundleId: offer.bundleId,
          discountType: 'percent',
          discountValue: offer.discountPercent,
          ctaText: offer.cta,
          active: true,
        })
        .onConflictDoUpdate({
          target: exitOfferRows.stage,
          set: {
            name: offer.headline,
            internalName: offer.headline,
            headline: offer.headline,
            description: offer.description,
            bundleId: offer.bundleId,
            discountType: 'percent',
            discountValue: offer.discountPercent,
            ctaText: offer.cta,
            active: true,
            updatedAt: new Date(),
          },
        });
    }
    for (const testimonial of parsed.data.testimonials) {
      await db
        .insert(testimonialRows)
        .values({
          id: testimonial.id,
          name: testimonial.name,
          text: testimonial.text,
          photo: testimonial.photo,
          rating: testimonial.rating,
          city: testimonial.city,
          verified: testimonial.active,
          active: testimonial.active,
        })
        .onConflictDoUpdate({
          target: testimonialRows.id,
          set: {
            name: testimonial.name,
            text: testimonial.text,
            photo: testimonial.photo,
            rating: testimonial.rating,
            city: testimonial.city,
            verified: testimonial.active,
            active: testimonial.active,
            updatedAt: new Date(),
          },
        });
    }
    await db
      .insert(siteSettings)
      .values({ key: 'catalog_config', value: parsed.data })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: parsed.data, updatedAt: new Date() },
      });
    return NextResponse.json({ ok: true, catalog: parsed.data }); */
  } catch {
    return NextResponse.json(
      { error: 'Não foi possível salvar o catálogo.' },
      { status: 500 },
    );
  }
}
