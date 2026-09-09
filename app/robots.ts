import type { MetadataRoute } from 'next';
export default function robots():MetadataRoute.Robots { const base=process.env.NEXT_PUBLIC_SITE_URL||'https://www.receitasdavovotereza.site'; return {rules:{userAgent:'*',allow:['/receitas','/produto/'],disallow:['/admin','/api/']},sitemap:`${base}/sitemap.xml`}; }
