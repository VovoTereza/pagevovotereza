import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/db';
import { siteSettings } from '@/db/schema';
import { defaultSiteConfig } from '@/lib/catalog';
import { getAdminEmail } from '@/lib/server/admin-auth';

const schema = z.object({
  heroBadge: z.string().min(2).max(100),
  heroTitle: z.string().min(10).max(180),
  heroSubtitle: z.string().min(10).max(320),
  ctaText: z.string().min(3).max(80),
  urgencyText: z.string().max(180),
  heroImage: z.string().max(500),
  founderImage: z.string().max(500),
  cartBannerEmpty: z.string().max(500),
  cartBannerFilled: z.string().max(500),
  customerPhotos: z
    .array(
      z.object({
        id: z.string().min(1).max(80),
        src: z.string().min(1).max(500),
        alt: z.string().max(180),
      }),
    )
    .max(100),
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
  seoTitle: z.string().min(10).max(80),
  seoDescription: z.string().min(30).max(180),
  keyword: z.string().min(2).max(80).default('babosa'),
  metaPixelId: z.string().max(80).optional().default(''),
  googleAnalyticsId: z.string().max(80).optional().default(''),
  tiktokPixelId: z.string().max(80).optional().default(''),
});

export async function GET() {
  try {
    const [row] = await getDb()
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'public_config'))
      .limit(1);
    return NextResponse.json({
      ...defaultSiteConfig,
      keyword: 'babosa',
      metaPixelId: '',
      googleAnalyticsId: '',
      tiktokPixelId: '',
      ...((row?.value || {}) as object),
    });
  } catch {
    return NextResponse.json({
      ...defaultSiteConfig,
      keyword: 'babosa',
      metaPixelId: '',
      googleAnalyticsId: '',
      tiktokPixelId: '',
    });
  }
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
    await getDb()
      .insert(siteSettings)
      .values({ key: 'public_config', value: parsed.data })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: parsed.data, updatedAt: new Date() },
      });
    return NextResponse.json({ ok: true, config: parsed.data });
  } catch {
    return NextResponse.json(
      { error: 'Não foi possível salvar no banco.' },
      { status: 500 },
    );
  }
}
