import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminEmail } from '@/lib/server/admin-auth';
import { getSiteConfig } from '@/lib/server/site-config';
import { upsertRows } from '@/lib/server/supabase';
import { storefrontSectionIds, storefrontVisibilityIds } from '@/lib/catalog';

const optionalUrl = z
  .string()
  .max(300)
  .refine((value) => !value || URL.canParse(value), 'Informe uma URL válida.');
const schema = z.object({
  pageSectionOrder: z
    .array(z.enum(storefrontSectionIds))
    .length(storefrontSectionIds.length)
    .refine((items) => new Set(items).size === storefrontSectionIds.length),
  hiddenSections: z
    .array(z.enum(storefrontVisibilityIds))
    .max(storefrontVisibilityIds.length),
  navLabels: z.array(z.string().min(1).max(40)).length(4),
  heroBadge: z.string().min(2).max(100),
  heroTitle: z.string().min(10).max(180),
  heroSubtitle: z.string().min(10).max(320),
  ctaText: z.string().min(3).max(80),
  heroBenefits: z.array(z.string().min(1).max(80)).length(4),
  heroPriceLabel: z.string().min(1).max(40),
  heroPriceSuffix: z.string().min(1).max(40),
  heroMicrocopy: z.string().min(2).max(180),
  heroCardTitle: z.string().min(2).max(80),
  heroCardSubtitle: z.string().min(2).max(100),
  urgencyText: z.string().max(180),
  heroImage: z.string().max(500),
  founderImage: z.string().max(500),
  cartBannerEmpty: z.string().max(500),
  cartBannerFilled: z.string().max(500),
  proofItems: z.array(z.string().min(1).max(80)).length(3),
  painEyebrow: z.string().min(2).max(100),
  painTitle: z.string().min(4).max(180),
  painDescription: z.string().min(10).max(360),
  painItems: z
    .array(
      z.object({
        title: z.string().min(2).max(100),
        text: z.string().min(5).max(280),
      }),
    )
    .min(1)
    .max(6),
  contentsEyebrow: z.string().min(2).max(100),
  contentsTitle: z.string().min(4).max(180),
  contentsDescription: z.string().min(10).max(360),
  contentsItems: z
    .array(
      z.object({
        title: z.string().min(2).max(100),
        text: z.string().min(5).max(280),
      }),
    )
    .min(1)
    .max(8),
  customerPhotos: z
    .array(
      z.object({
        id: z.string().min(1).max(80),
        src: z.string().min(1).max(500),
        alt: z.string().max(180),
      }),
    )
    .max(100),
  galleryEyebrow: z.string().min(2).max(100),
  galleryTitle: z.string().min(4).max(180),
  cartGalleryTitle: z.string().min(4).max(180),
  comparisonEyebrow: z.string().min(2).max(100),
  comparisonTitle: z.string().min(10).max(180),
  comparisonDescription: z.string().min(10).max(360),
  comparisonCtaText: z.string().min(3).max(80),
  comparisonFeatureLabel: z.string().min(2).max(80),
  comparisonPrimaryLabel: z.string().min(2).max(80),
  comparisonSecondaryLabel: z.string().min(2).max(80),
  comparisonItems: z.array(z.string().min(2).max(140)).min(1).max(10),
  comparisonNote: z.string().min(10).max(240),
  commentsEyebrow: z.string().min(2).max(100),
  commentsTitle: z.string().min(8).max(180),
  commentsSubtitle: z.string().min(10).max(280),
  commentsEmptyTitle: z.string().min(2).max(100),
  commentsEmptyText: z.string().min(5).max(280),
  benefitsEyebrow: z.string().min(2).max(100),
  benefitsTitle: z.string().min(4).max(180),
  benefitsItems: z
    .array(
      z.object({
        title: z.string().min(2).max(100),
        text: z.string().min(5).max(280),
      }),
    )
    .min(1)
    .max(8),
  founderEyebrow: z.string().min(2).max(100),
  founderTitle: z.string().min(4).max(180),
  founderBodyOne: z.string().min(10).max(500),
  founderBodyTwo: z.string().min(10).max(500),
  founderSignature: z.string().min(2).max(100),
  founderCtaText: z.string().min(2).max(80),
  collectionEyebrow: z.string().min(2).max(100),
  collectionTitle: z.string().min(4).max(180),
  collectionSubtitle: z.string().min(10).max(280),
  collectionBenefits: z.array(z.string().min(1).max(80)).length(4),
  collectionCtaText: z.string().min(2).max(80),
  paymentSecurityText: z.string().min(2).max(100),
  paymentNote: z.string().min(2).max(160),
  faqEyebrow: z.string().min(2).max(100),
  faqTitle: z.string().min(4).max(180),
  faqItems: z
    .array(
      z.object({
        question: z.string().min(2).max(180),
        answer: z.string().min(5).max(600),
      }),
    )
    .min(1)
    .max(12),
  footerText: z.string().min(5).max(240),
  footerCopyright: z.string().min(2).max(120),
  facebookUrl: optionalUrl,
  instagramUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  floatingCtaText: z.string().min(2).max(80),
  cartEmptyTitle: z.string().min(2).max(100),
  cartEmptyText: z.string().min(5).max(240),
  cartEmptyCtaText: z.string().min(2).max(80),
  cartEmptyNote: z.string().min(2).max(180),
  cartBumpEyebrow: z.string().min(2).max(80),
  cartBumpRecipeLabel: z.string().min(2).max(80),
  cartBumpRecipes: z
    .array(
      z.object({
        title: z.string().min(2).max(100),
        text: z.string().min(5).max(300),
      }),
    )
    .min(1)
    .max(12),
  cartOfferEyebrow: z.string().min(2).max(80),
  cartOfferRecipeLabel: z.string().min(2).max(80),
  cartOfferRecipes: z
    .array(
      z.object({
        title: z.string().min(2).max(100),
        text: z.string().min(5).max(300),
      }),
    )
    .min(1)
    .max(12),
  cartAddCtaPrefix: z.string().min(2).max(80),
  cartRemoveText: z.string().min(1).max(40),
  cartBundleItemLabel: z.string().min(1).max(60),
  cartProductItemLabel: z.string().min(1).max(60),
  cartSubtotalLabel: z.string().min(1).max(60),
  cartSavingsLabel: z.string().min(1).max(80),
  cartSecurityText: z.string().min(2).max(180),
  cartCheckoutCtaText: z.string().min(2).max(80),
  cartCheckoutLoadingText: z.string().min(2).max(80),
  seoTitle: z.string().min(10).max(80),
  seoDescription: z.string().min(30).max(180),
  keyword: z.string().min(2).max(80).default('babosa'),
  metaPixelId: z.string().max(80).optional().default(''),
  googleAnalyticsId: z.string().max(80).optional().default(''),
  tiktokPixelId: z.string().max(80).optional().default(''),
});

export async function GET() {
  return NextResponse.json(await getSiteConfig(), {
    headers: {
      'cache-control':
        'public, max-age=0, s-maxage=30, stale-while-revalidate=300',
    },
  });
}

export async function PUT(request: NextRequest) {
  if (!(await getAdminEmail()))
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Revise os campos informados.' },
      { status: 400 },
    );
  try {
    await upsertRows(
      'site_settings',
      {
        key: 'public_config',
        value: parsed.data,
        updated_at: new Date().toISOString(),
      },
      'key',
    );
    return NextResponse.json({ ok: true, config: parsed.data });
  } catch {
    return NextResponse.json(
      { error: 'Não foi possível salvar no banco.' },
      { status: 500 },
    );
  }
}
