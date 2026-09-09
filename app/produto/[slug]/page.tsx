import { notFound } from 'next/navigation';
import { BookOpen, Check, LockKeyhole } from 'lucide-react';
import Image from 'next/image';
import { BrandLogo } from '@/components/brand-logo';
import Link from 'next/link';
import { bundles, formatMoney, products } from '@/lib/catalog';

export function generateStaticParams() { return products.map((product)=>({slug:product.slug})); }
export default async function ProductPage({ params }: { params: Promise<{slug:string}> }) {
  const {slug}=await params; const product=products.find((item)=>item.slug===slug); if(!product) notFound(); const related=bundles.filter((bundle)=>bundle.productIds.includes(product.id));
  const structured={ '@context':'https://schema.org','@type':'Product',name:product.name,description:product.description,image:'/images/hero-vovo-tereza.png',offers:{'@type':'Offer',priceCurrency:'BRL',price:(product.price/100).toFixed(2),availability:'https://schema.org/InStock',url:`/produto/${product.slug}`} };
  return <main className="product-page"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structured)}}/><header><Link href="/receitas" className="brand"><BrandLogo priority /></Link><Link href="/receitas#ofertas">Ver coleções</Link></header><section><div className="product-image"><Image src="/images/hero-vovo-tereza.png" alt="Caderno de receitas tradicionais em uma cozinha" fill priority/></div><div className="product-copy"><p className="eyebrow">{product.category}</p><h1>{product.name}</h1><p>{product.description}</p><ul><li><Check/>Arquivo digital de leitura confortável</li><li><Check/>Acesso após confirmação</li><li><Check/>Compatível com celular, tablet e computador</li></ul><div className="hero-price"><small>Preço individual</small><strong>{formatMoney(product.price)}</strong></div><Link href="/receitas#ofertas" className="primary-button">ESCOLHER UMA OFERTA</Link><p className="microcopy"><LockKeyhole/>O preço final é conferido no servidor.</p></div></section><aside><BookOpen/><div><strong>Também disponível em coleção</strong><p>{related.map((bundle)=>bundle.name).join(', ')}</p></div></aside></main>;
}
