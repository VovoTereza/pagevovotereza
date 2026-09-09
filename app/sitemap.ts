import type { MetadataRoute } from 'next';
import { products } from '@/lib/catalog';
export default function sitemap():MetadataRoute.Sitemap { const base=process.env.NEXT_PUBLIC_SITE_URL||'https://www.receitasdavovotereza.site'; return [{url:`${base}/receitas`,changeFrequency:'weekly',priority:1},...products.map((p)=>({url:`${base}/produto/${p.slug}`,changeFrequency:'monthly' as const,priority:.8}))]; }
