import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.receitasdavovotereza.site'),
  title: 'Vovó Tereza | Receitas naturais e autocuidado',
  description: 'Receitas tradicionais de autocuidado, babosa para os cabelos e chás organizados em cadernos digitais.',
  openGraph: { title: 'Vovó Tereza', description: 'Cadernos de receitas naturais e autocuidado, organizados com carinho.', type: 'website', locale: 'pt_BR' },
  twitter: { card: 'summary_large_image', title: 'Vovó Tereza', description: 'Receitas naturais e autocuidado em cadernos digitais.' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
