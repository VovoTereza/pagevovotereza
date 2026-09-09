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
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png', sizes: '64x64' },
      { url: '/favicon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' }],
  },
  openGraph: {
    title: 'Vovó Tereza',
    description: 'Cadernos de receitas naturais e autocuidado, organizados com carinho.',
    type: 'website',
    locale: 'pt_BR',
    images: [
      {
        url: '/og-vovo-tereza.jpg',
        width: 1200,
        height: 630,
        alt: 'Receitas naturais para cuidar de você — Vovó Tereza',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vovó Tereza',
    description: 'Receitas naturais e autocuidado em cadernos digitais.',
    images: ['/og-vovo-tereza.jpg'],
  },
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
