export type Product = { id: string; name: string; slug: string; description: string; price: number; compareAtPrice?: number; category: string; active: boolean };
export type Bundle = { id: string; name: string; badge?: string; description: string; productIds: string[]; price: number; compareAtPrice: number; cta: string; recommended?: boolean };

export const products: Product[] = [
  { id: 'livro-principal', name: 'O Caderno Esquecido', slug: 'caderno-esquecido', description: 'Receitas de família organizadas por ocasião e ingrediente.', price: 2790, category: 'Livro digital', active: true },
  { id: 'sobremesas', name: 'Caderno de Bolos e Sobremesas', slug: 'bolos-sobremesas', description: 'Preparos para o café e para os domingos em família.', price: 1990, category: 'Livro digital', active: true },
  { id: 'economicas', name: 'Receitas Econômicas', slug: 'receitas-economicas', description: 'Ideias simples para aproveitar melhor o que já está na cozinha.', price: 1590, category: 'Livro digital', active: true },
  { id: 'ingredientes', name: 'Guia de Ingredientes Tradicionais', slug: 'ingredientes-tradicionais', description: 'Notas culinárias sobre plantas e ingredientes conhecidos, incluindo a babosa quando apropriado.', price: 1490, category: 'Guia digital', active: true },
];

export const bundles: Bundle[] = [
  { id: 'essencial', name: 'Caderno Essencial', description: 'O livro principal para começar.', productIds: ['livro-principal'], price: 2790, compareAtPrice: 2790, cta: 'QUERO O CADERNO' },
  { id: 'familia', name: 'Coleção da Família', badge: 'RECOMENDADO', description: 'Livro principal, sobremesas e receitas econômicas.', productIds: ['livro-principal', 'sobremesas', 'economicas'], price: 4790, compareAtPrice: 6370, cta: 'QUERO A COLEÇÃO', recommended: true },
  { id: 'completa', name: 'Acervo Completo', badge: 'MAIOR ECONOMIA', description: 'Todos os livros e o guia de ingredientes tradicionais.', productIds: ['livro-principal', 'sobremesas', 'economicas', 'ingredientes'], price: 5790, compareAtPrice: 7860, cta: 'QUERO O ACERVO COMPLETO' },
];

export const orderBump = { id: 'bump-sobremesas', productId: 'sobremesas', headline: 'Leve também o Caderno de Sobremesas', description: 'Bolos, pudins e receitas para acompanhar o café.', price: 990 };
export const cartOffer = { id: 'offer-ingredientes', productId: 'ingredientes', headline: 'Complete sua coleção', description: 'Acrescente o guia de ingredientes tradicionais.', price: 1190 };
export const exitOffers = [
  { stage: 1, headline: 'Quer começar pelo essencial?', description: 'Leve o Caderno Esquecido com 10% de desconto nesta sessão.', bundleId: 'essencial', discountPercent: 10, cta: 'SIM, QUERO COMEÇAR' },
  { stage: 2, headline: 'Uma coleção mais completa para sua cozinha', description: 'A Coleção da Família reúne o livro principal, o caderno de sobremesas e o de receitas econômicas.', bundleId: 'familia', discountPercent: 0, cta: 'VER A COLEÇÃO' },
  { stage: 3, headline: 'Uma última opção para esta sessão', description: 'Comece pelo caderno principal em uma condição mais econômica.', bundleId: 'essencial', discountPercent: 15, cta: 'APROVEITAR A ÚLTIMA OPÇÃO' },
];
export const defaultSiteConfig = { heroBadge: 'CADERNOS DIGITAIS DE RECEITAS', heroTitle: 'Receitas para trazer o sabor da cozinha de casa à sua mesa', heroSubtitle: 'Conheça a coleção Vovó Tereza: cadernos digitais sobre receitas caseiras, sobremesas e economia na cozinha.', ctaText: 'ESCOLHER MINHA COLEÇÃO', urgencyText: 'Produtos digitais · Conheça os cadernos e escolha sua coleção', seoTitle: 'Vovó Tereza | Receitas tradicionais em cadernos digitais', seoDescription: 'Receitas brasileiras, cadernos de família e conhecimentos tradicionais organizados para consultar no celular.' };

export const formatMoney = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);
export const getBundle = (id: string) => bundles.find((item) => item.id === id);
export const getProduct = (id: string) => products.find((item) => item.id === id);
