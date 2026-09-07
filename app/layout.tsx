import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://vovotereza.com.br'),
  title: 'Vovó Tereza | Receitas tradicionais em cadernos digitais',
  description: 'Receitas brasileiras, cadernos de família e conhecimentos tradicionais organizados para consultar no celular.',
  openGraph: { title: 'Vovó Tereza', description: 'O Caderno Esquecido da Vovó Tereza.', type: 'website', locale: 'pt_BR' },
  twitter: { card: 'summary_large_image', title: 'Vovó Tereza', description: 'Receitas tradicionais organizadas com cuidado.' },
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
