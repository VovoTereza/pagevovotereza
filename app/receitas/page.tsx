import type { Metadata } from 'next';
import { Storefront } from '@/components/store/storefront';
import { getCatalogConfig } from '@/lib/server/catalog-config';
import { getSiteConfig } from '@/lib/server/site-config';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  alternates: { canonical: '/receitas' },
  openGraph: {
    title: 'Vovó Tereza | Receitas naturais e autocuidado',
    description: 'Receitas tradicionais de autocuidado, babosa para os cabelos e chás organizados em cadernos digitais.',
    type: 'website',
    locale: 'pt_BR',
    url: '/receitas',
    images: [
      {
        url: 'https://pagevovotereza.vercel.app/og-vovo-tereza.jpg',
        width: 1200,
        height: 630,
        alt: 'Receitas naturais para cuidar de você — Vovó Tereza',
      },
    ],
  },
};

export default async function ReceitasPage() {
  const [initialConfig, initialCatalog] = await Promise.all([
    getSiteConfig(),
    getCatalogConfig(),
  ]);
  return (
    <Storefront
      initialConfig={initialConfig}
      initialCatalog={initialCatalog}
    />
  );
}
