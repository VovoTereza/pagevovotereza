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
  banner?: string;
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
    banner: '',
    headline: 'Quer começar pelo essencial?',
    description:
      'Leve o livro com 150 receitas naturais com 10% de desconto nesta sessão.',
    bundleId: 'essencial',
    discountPercent: 10,
    cta: 'SIM, QUERO COMEÇAR',
  },
  {
    stage: 2,
    banner: '',
    headline: 'Quer conhecer os três temas principais?',
    description:
      'A Coleção Cuidado de Casa reúne o livro principal, o caderno da babosa e o guia de chás.',
    bundleId: 'familia',
    discountPercent: 0,
    cta: 'VER A COLEÇÃO',
  },
  {
    stage: 3,
    banner: '',
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
  navLabels: ['Início', 'Para você', 'Nossa história', 'Dúvidas'] as string[],
  heroBadge: 'RECEITAS DE CUIDADO QUE PASSAM DE MÃE PARA FILHA',
  heroTitle: '150 receitas naturais para cuidar de você todos os dias',
  heroSubtitle:
    'Se você sente que o cabelo mudou e que o cuidado consigo mesma foi ficando para depois, reuni receitas simples com babosa, chás e ingredientes do dia a dia para ajudar você a retomar esse carinho na sua rotina.',
  ctaText: 'CONHECER OS CADERNOS',
  heroBenefits: [
    'Receitas com babosa',
    'Chás e infusões',
    'Passo a passo simples',
    'Ingredientes acessíveis',
  ] as string[],
  heroPriceLabel: 'A partir de',
  heroPriceSuffix: 'acesso digital',
  heroMicrocopy: 'Pagamento seguro. Acesso liberado após a confirmação.',
  heroCardTitle: '150 receitas naturais',
  heroCardSubtitle: 'em cadernos fáceis de consultar',
  urgencyText:
    'Este convite especial da Vovó Tereza é para você · aproveite a oferta',
  heroImage: '/images/vovo-tereza-cozinha-v2.png',
  founderImage: '/images/vovo-tereza-caderno-v2.png',
  cartBannerEmpty: '',
  cartBannerFilled: '',
  proofItems: [
    'Conteúdo organizado',
    'Formato digital',
    'Pagamento pela Stripe',
  ] as string[],
  painEyebrow: 'SE ISSO ACONTECE COM VOCÊ',
  painTitle: 'Cuidar de si ficou mais confuso do que deveria',
  painDescription:
    'Depois dos 45, o corpo e os cabelos mudam. Ao mesmo tempo, a internet oferece receitas demais, explicações de menos e promessas difíceis de acreditar.',
  painItems: [
    {
      title: 'Cabelos pedindo cuidado',
      text: 'Ressecamento e fios mais frágeis fazem você testar dicas soltas sem saber como preparar ou usar cada ingrediente.',
    },
    {
      title: 'Uma rotina difícil de sustentar',
      text: 'Você quer se sentir mais leve e cuidar da alimentação, mas não precisa de mais uma promessa milagrosa.',
    },
    {
      title: 'Saberes espalhados',
      text: 'Receitas antigas ficam em papéis, mensagens e vídeos salvos, justamente quando você precisa consultá-las.',
    },
  ] as { title: string; text: string }[],
  contentsEyebrow: 'UMA SOLUÇÃO PARA CONSULTAR DE VERDADE',
  contentsTitle: 'Da babosa ao chá da tarde, tudo no seu devido lugar',
  contentsDescription:
    'A Vovó Tereza organizou receitas tradicionais em cadernos temáticos, com linguagem simples e atenção ao modo de preparo.',
  contentsItems: [
    {
      title: 'Babosa e cabelos',
      text: 'Preparos externos para hidratação e cuidado dos fios, com orientações de teste antes do uso.',
    },
    {
      title: 'Chás e infusões',
      text: 'Combinações tradicionais para transformar uma pausa do dia em ritual de bem-estar.',
    },
    {
      title: 'Rotina mais leve',
      text: 'Receitas e hábitos que podem acompanhar objetivos de alimentação equilibrada, sem atalhos milagrosos.',
    },
    {
      title: 'Ingredientes tradicionais',
      text: 'Como escolher, conservar e preparar itens conhecidos com mais atenção.',
    },
  ] as { title: string; text: string }[],
  customerPhotos: [] as { id: string; src: string; alt: string }[],
  galleryEyebrow: 'MULHERES REAIS, ROTINAS REAIS',
  galleryTitle: 'Quem escolheu levar os cadernos para casa',
  cartGalleryTitle: 'Quem escolheu os cadernos',
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
  commentsEmptyTitle: 'Relatos em preparação',
  commentsEmptyText:
    'Os primeiros comentários serão publicados assim que as clientes autorizarem o compartilhamento.',
  benefitsEyebrow: 'FEITO PARA MULHERES REAIS',
  benefitsTitle: 'Menos informação solta. Mais clareza para cuidar de você.',
  benefitsItems: [
    {
      title: 'Você encontra o que procura',
      text: 'Receitas separadas por tema, ingrediente e forma de uso.',
    },
    {
      title: 'Prepara sem complicação',
      text: 'Passos claros e ingredientes conhecidos para acompanhar na sua rotina.',
    },
    {
      title: 'Acesso em qualquer aparelho',
      text: 'Abra no celular, tablet ou computador depois da confirmação.',
    },
    {
      title: 'Escolhas mais conscientes',
      text: 'Cuidados, observações e limites de uso aparecem junto dos preparos.',
    },
  ] as { title: string; text: string }[],
  founderEyebrow: 'DA MINHA CASA PARA A SUA',
  founderTitle: 'Eu sou Tereza. Antes de ser autora, sou mãe e avó.',
  founderBodyOne:
    'Por muitos anos, guardei em cadernos os preparos que aprendi com as mulheres da minha família e adaptei na rotina da minha própria casa.',
  founderBodyTwo:
    'Criei esta coleção para que esse conhecimento não se perdesse e para que outras mulheres pudessem consultar cada receita com calma, sem depender de vídeos salvos ou anotações incompletas.',
  founderSignature: 'Com carinho, Vovó Tereza.',
  founderCtaText: 'VER AS OPÇÕES DE CADERNOS',
  collectionEyebrow: 'OS CADERNOS DA VOVÓ TEREZA',
  collectionTitle: 'Escolha como quer começar seu cuidado.',
  collectionSubtitle:
    'Pagamento único, acesso digital e conteúdo organizado para consultar quando precisar.',
  collectionBenefits: [
    '150 receitas organizadas',
    'Passo a passo simples',
    'Leia no celular',
    'Arquivos para baixar',
  ] as string[],
  collectionCtaText: 'APROVEITAR OFERTA',
  paymentSecurityText: 'Pagamento protegido por',
  paymentNote: 'As opções disponíveis são confirmadas no checkout.',
  faqEyebrow: 'DÚVIDAS FREQUENTES',
  faqTitle: 'O que você precisa saber antes de comprar',
  faqItems: [
    { question: 'O produto é físico ou digital?', answer: 'É uma coleção digital. O acesso aos arquivos fica disponível na página do pedido após a confirmação do pagamento.' },
    { question: 'Consigo abrir no celular?', answer: 'Sim. Os arquivos foram preparados para leitura no celular, tablet ou computador.' },
    { question: 'Preciso ter experiência com receitas naturais?', answer: 'Não. Os preparos têm linguagem direta, lista de ingredientes e modo de uso para facilitar a consulta.' },
    { question: 'O pagamento é seguro?', answer: 'Sim. O pagamento é processado pela Stripe e os dados do cartão não passam pelo nosso servidor.' },
    { question: 'Quando recebo?', answer: 'Após a confirmação do pagamento, os links para baixar os arquivos ficam disponíveis na página do pedido.' },
    { question: 'Existe conteúdo sobre babosa para os cabelos?', answer: 'Sim. A coleção inclui preparos de uso externo e orientações de cuidado, como fazer teste em uma pequena área antes do uso.' },
    { question: 'Os cadernos substituem orientação médica ou nutricional?', answer: 'Não. O conteúdo é educativo e reúne usos tradicionais. Gestantes, lactantes e pessoas com condições de saúde ou que usam medicamentos devem conversar com um profissional antes de consumir chás ou mudar a rotina.' },
  ] as { question: string; answer: string }[],
  footerText:
    'Receitas naturais e conhecimentos de família, organizados com cuidado e responsabilidade.',
  footerCopyright: 'Vovó Tereza. Todos os direitos reservados.',
  facebookUrl: 'https://www.facebook.com/avovotereza',
  instagramUrl: 'https://www.instagram.com/avovotereza/',
  tiktokUrl: 'https://www.tiktok.com/@avovoterezatktk',
  youtubeUrl: 'https://www.youtube.com/@avovotereza',
  floatingCtaText: 'APROVEITAR OFERTA',
  cartEmptyTitle: 'Seu carrinho está vazio',
  cartEmptyText: 'Escolha uma das coleções para ver o resumo aqui.',
  cartEmptyCtaText: 'CONTINUAR ESCOLHENDO',
  cartEmptyNote: 'Compra segura e acesso digital após a confirmação.',
  cartBumpEyebrow: 'OFERTA ADICIONAL',
  cartBumpRecipeLabel: 'RECEITA DO CADERNO',
  cartBumpRecipes: [
    { title: 'Pré-lavagem com babosa', text: 'Gel de babosa diluído para aplicar no comprimento dos fios antes da lavagem, com orientação de teste em uma pequena área.' },
    { title: 'Máscara de babosa e aveia', text: 'Um preparo de uso externo com textura cremosa, tempo de pausa curto e enxágue cuidadoso.' },
    { title: 'Babosa com óleo vegetal', text: 'Uma mistura simples para o comprimento dos fios, acompanhada de cuidados de aplicação e retirada.' },
  ] as { title: string; text: string }[],
  cartOfferEyebrow: 'PARA COMPLETAR',
  cartOfferRecipeLabel: 'RECEITA DO GUIA',
  cartOfferRecipes: [
    { title: 'Infusão simples de camomila', text: 'Flores secas e água quente, com medidas, tempo de infusão e modo de conservação organizados no guia.' },
    { title: 'Água aromatizada com gengibre e hortelã', text: 'Um preparo leve com ingredientes frescos e instruções claras de higienização e armazenamento.' },
    { title: 'Infusão de alecrim com limão', text: 'Uma combinação tradicional apresentada com proporções simples e observações importantes de consumo.' },
  ] as { title: string; text: string }[],
  cartAddCtaPrefix: 'ADICIONAR POR',
  cartRemoveText: 'Remover',
  cartBundleItemLabel: 'itens digitais',
  cartProductItemLabel: 'Produto digital',
  cartSubtotalLabel: 'Subtotal',
  cartSavingsLabel: 'Economia neste pedido',
  cartSecurityText: 'Pagamento seguro. Produto digital. Entrega após confirmação.',
  cartCheckoutCtaText: 'IR PARA O PAGAMENTO',
  cartCheckoutLoadingText: 'PREPARANDO PAGAMENTO...',
  seoTitle: 'Vovó Tereza | Receitas naturais e autocuidado',
  seoDescription:
    'Receitas tradicionais de autocuidado, babosa para os cabelos e chás organizados em cadernos digitais.',
};
export type SiteConfig = typeof defaultSiteConfig;

export const formatMoney = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    value / 100,
  );
export const getBundle = (id: string) => bundles.find((item) => item.id === id);
export const getProduct = (id: string) =>
  products.find((item) => item.id === id);
