import type { Metadata } from 'next';
import { Storefront } from '@/components/store/storefront';

export const metadata: Metadata = {
  alternates: { canonical: '/receitas' },
  openGraph: { url: '/receitas' },
};

export default function ReceitasPage() {
  return <Storefront />;
}
