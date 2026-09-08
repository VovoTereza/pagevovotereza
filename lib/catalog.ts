export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  active: boolean;
  coverImage?: string;
  digitalFile?: string;
  digitalFileName?: string;
};
export type Bundle = {
  id: string;
  name: string;
  badge?: string;
  description: string;
  productIds: string[];
  price: number;
  compareAtPrice: number;
  cta: string;
  recommended?: boolean;
};
export type SimpleOffer = {
  id: string;
  productId: string;
  headline: string;
  description: string;
  price: number;
};
export type ExitOffer = {
  stage: number;
  headline: string;
  description: string;
  bundleId: string;
  discountPercent: number;
  cta: string;
};
export type Testimonial = {
  id: string;
  name: string;
  headline?: string;
  city?: string;
  text: string;
  photo?: string;
  rating: number;
  active: boolean;
};
export type CatalogConfig = {
  products: Product[];
  bundles: Bundle[];
  orderBump: SimpleOffer;
  cartOffer: SimpleOffer;
  exitOffers: ExitOffer[];
  testimonials: Testimonial[];
};

export const products: Product[] = [
  {
    id: 'livro-principal',
    name: '150 Receitas Naturais da Vovó Tereza',
    slug: '150-receitas-naturais',
    description:
      'Preparos tradicionais de autocuidado organizados por ingrediente e finalidade.',
    price: 2790,
    category: 'Livro digital',
    active: true,
  },
  {
    id: 'sobremesas',
    name: 'Caderno da Babosa para os Cabelos',
    slug: 'caderno-da-babosa',
    description: 'Máscaras e cuidados externos para incluir no ritual capilar.',
    price: 1990,
    category: 'Livro digital',
    active: true,
  },
  {
    id: 'economicas',
    name: 'Chás para uma Rotina Mais Leve',
    slug: 'chas-rotina-leve',
    description:
      'Infusões e hábitos simples para acompanhar uma rotina equilibrada.',
    price: 1590,
    category: 'Livro digital',
    active: true,
  },
  {
    id: 'ingredientes',
    name: 'Guia de Ingredientes Tradicionais',
    slug: 'ingredientes-tradicionais',
    description:
      'Como escolher, preparar e usar ingredientes populares com mais atenção.',
    price: 1490,
    category: 'Guia digital',
    active: true,
  },
];

export const bundles: Bundle[] = [
  {
    id: 'essencial',
    name: 'Livro Essencial',
    description: 'As 150 receitas naturais reunidas em um único caderno.',
    productIds: ['livro-principal'],
    price: 2790,
    compareAtPrice: 2790,
    cta: 'QUERO O LIVRO',
  },
  {
    id: 'familia',
    name: 'Coleção Cuidado de Casa',
    badge: 'RECOMENDADO',
    description: 'Livro principal, caderno da babosa e guia de chás.',
    productIds: ['livro-principal', 'sobremesas', 'economicas'],
    price: 4790,
    compareAtPrice: 6370,
    cta: 'QUERO A COLEÇÃO',
    recommended: true,
  },
  {
    id: 'completa',
    name: 'Biblioteca da Vovó Tereza',
    badge: 'MAIOR ECONOMIA',
    description: 'Os quatro cadernos para uma rotina de autocuidado completa.',
    productIds: ['livro-principal', 'sobremesas', 'economicas', 'ingredientes'],
    price: 5790,
    compareAtPrice: 7860,
    cta: 'QUERO A BIBLIOTECA',
  },
];

export const orderBump = {
  id: 'bump-sobremesas',
  productId: 'sobremesas',
  headline: 'Leve também o Caderno da Babosa',
  description: 'Cuidados externos para incluir no seu ritual capilar.',
  price: 990,
};
export const cartOffer = {
  id: 'offer-ingredientes',
  productId: 'ingredientes',
  headline: 'Complete sua coleção',
  description: 'Acrescente o guia de ingredientes tradicionais.',
  price: 1190,
};
export const exitOffers = [
  {
    stage: 1,
    headline: 'Quer começar pelo essencial?',
    description:
      'Leve o livro com 150 receitas naturais com 10% de desconto nesta sessão.',
    bundleId: 'essencial',
    discountPercent: 10,
    cta: 'SIM, QUERO COMEÇAR',
  },
  {
    stage: 2,
    headline: 'Quer conhecer os três temas principais?',
    description:
      'A Coleção Cuidado de Casa reúne o livro principal, o caderno da babosa e o guia de chás.',
    bundleId: 'familia',
    discountPercent: 0,
    cta: 'VER A COLEÇÃO',
  },
  {
    stage: 3,
    headline: 'Uma última opção para esta sessão',
    description: 'Comece pelo livro principal em uma condição mais econômica.',
    bundleId: 'essencial',
    discountPercent: 15,
    cta: 'APROVEITAR A ÚLTIMA OPÇÃO',
  },
];
export const defaultCatalog: CatalogConfig = {
  products,
  bundles,
  orderBump,
  cartOffer,
  exitOffers,
  testimonials: [],
};
export const defaultSiteConfig = {
  heroBadge: 'RECEITAS DE CUIDADO QUE PASSAM DE MÃE PARA FILHA',
  heroTitle: '150 receitas naturais para cuidar de você todos os dias',
  heroSubtitle:
    'Se você sente que o cabelo mudou e que o cuidado consigo mesma foi ficando para depois, reuni receitas simples com babosa, chás e ingredientes do dia a dia para ajudar você a retomar esse carinho na sua rotina.',
  ctaText: 'CONHECER OS CADERNOS',
  urgencyText:
    'Este convite especial da Vovó Tereza é para você · aproveite a oferta',
  heroImage: '/images/vovo-tereza-cozinha-v2.png',
  founderImage: '/images/vovo-tereza-caderno-v2.png',
  cartBannerEmpty: '',
  cartBannerFilled: '',
  customerPhotos: [] as { id: string; src: string; alt: string }[],
  comparisonEyebrow: 'TUDO REUNIDO PARA VOCÊ CONSULTAR',
  comparisonTitle:
    'Os cadernos da Vovó Tereza ou receitas soltas pela internet?',
  comparisonDescription:
    'Em vez de guardar vídeos, anotações e links espalhados, você recebe uma coleção organizada para encontrar cada preparo com mais calma e clareza.',
  comparisonCtaText: 'VER OS CADERNOS',
  comparisonFeatureLabel: 'O que você encontra',
  comparisonPrimaryLabel: 'Cadernos da Vovó Tereza',
  comparisonSecondaryLabel: 'Receitas soltas',
  comparisonItems: [
    'Receitas separadas por tema',
    'Ingredientes e preparo no mesmo lugar',
    'Cuidados e observações junto da receita',
    'Conteúdo para consultar sem procurar novamente',
    'Linguagem simples e sem promessas de cura',
  ] as string[],
  comparisonNote:
    'Conteúdo educativo sobre usos tradicionais. Não substitui diagnóstico, tratamento ou acompanhamento profissional.',
  commentsEyebrow: 'RELATOS REAIS E AUTORIZADOS',
  commentsTitle: 'Histórias de quem escolheu os cadernos',
  commentsSubtitle:
    'Experiências compartilhadas por clientes que autorizaram a publicação de seus comentários.',
  seoTitle: 'Vovó Tereza | Receitas naturais e autocuidado',
  seoDescription:
    'Receitas tradicionais de autocuidado, babosa para os cabelos e chás organizados em cadernos digitais.',
};

export const formatMoney = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    value / 100,
  );
export const getBundle = (id: string) => bundles.find((item) => item.id === id);
export const getProduct = (id: string) =>
  products.find((item) => item.id === id);
