'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  BadgeCheck,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Leaf,
  LockKeyhole,
  MessageSquareQuote,
  NotebookPen,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  BundleSelector,
  CustomerStories,
  PaymentMethods,
} from './bundle-selector';
import { IconsaxBag, IconsaxMenu } from './header-icons';
import {
  IconsaxArchiveBook,
  IconsaxCardTick,
  IconsaxMobile,
} from './proof-icons';
import {
  IconsaxFacebook,
  IconsaxInstagram,
  IconsaxTiktok,
  IconsaxYoutube,
} from './social-icons';
import { BrandLogo } from '@/components/brand-logo';
import { defaultCatalog, defaultSiteConfig, formatMoney } from '@/lib/catalog';

type CartLine = {
  kind: 'bundle' | 'product';
  id: string;
  quantity: number;
  price: number;
  compareAtPrice?: number;
  title: string;
  source?: 'order_bump' | 'cart_offer' | 'exit_offer';
  offerStage?: number;
};

const benefits = [
  [
    'Você encontra o que procura',
    'Receitas separadas por tema, ingrediente e forma de uso.',
  ],
  [
    'Prepara sem complicação',
    'Passos claros e ingredientes conhecidos para acompanhar na sua rotina.',
  ],
  [
    'Acesso em qualquer aparelho',
    'Abra no celular, tablet ou computador depois da confirmação.',
  ],
  [
    'Escolhas mais conscientes',
    'Cuidados, observações e limites de uso aparecem junto dos preparos.',
  ],
];
const faqs = [
  [
    'O produto é físico ou digital?',
    'É uma coleção digital. O acesso aos arquivos fica disponível na página do pedido após a confirmação do pagamento.',
  ],
  [
    'Consigo abrir no celular?',
    'Sim. Os arquivos foram preparados para leitura no celular, tablet ou computador.',
  ],
  [
    'Preciso ter experiência com receitas naturais?',
    'Não. Os preparos têm linguagem direta, lista de ingredientes e modo de uso para facilitar a consulta.',
  ],
  [
    'O pagamento é seguro?',
    'Sim. O pagamento é processado pela Stripe e os dados do cartão não passam pelo nosso servidor.',
  ],
  [
    'Quando recebo?',
    'Após a confirmação do pagamento, os links para baixar os arquivos ficam disponíveis na página do pedido.',
  ],
  [
    'Existe conteúdo sobre babosa para os cabelos?',
    'Sim. A coleção inclui preparos de uso externo e orientações de cuidado, como fazer teste em uma pequena área antes do uso.',
  ],
  [
    'Os cadernos substituem orientação médica ou nutricional?',
    'Não. O conteúdo é educativo e reúne usos tradicionais. Gestantes, lactantes e pessoas com condições de saúde ou que usam medicamentos devem conversar com um profissional antes de consumir chás ou mudar a rotina.',
  ],
];

const bumpRecipePreviews = [
  {
    title: 'Pré-lavagem com babosa',
    summary:
      'Gel de babosa diluído para aplicar no comprimento dos fios antes da lavagem, com orientação de teste em uma pequena área.',
  },
  {
    title: 'Máscara de babosa e aveia',
    summary:
      'Um preparo de uso externo com textura cremosa, tempo de pausa curto e enxágue cuidadoso.',
  },
  {
    title: 'Babosa com óleo vegetal',
    summary:
      'Uma mistura simples para o comprimento dos fios, acompanhada de cuidados de aplicação e retirada.',
  },
];

const ingredientRecipePreviews = [
  {
    title: 'Infusão simples de camomila',
    summary:
      'Flores secas e água quente, com medidas, tempo de infusão e modo de conservação organizados no guia.',
  },
  {
    title: 'Água aromatizada com gengibre e hortelã',
    summary:
      'Um preparo leve com ingredientes frescos e instruções claras de higienização e armazenamento.',
  },
  {
    title: 'Infusão de alecrim com limão',
    summary:
      'Uma combinação tradicional apresentada com proporções simples e observações importantes de consumo.',
  },
];

function track(name: string, data: Record<string, unknown> = {}) {
  window.dispatchEvent(
    new CustomEvent('vovo:analytics', {
      detail: { name, data, at: Date.now() },
    }),
  );
  const win = window as typeof window & {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (...args: unknown[]) => void };
  };
  win.dataLayer?.push({ event: name, ...data });
  win.fbq?.('trackCustom', name, data);
  win.ttq?.track(name, data);
  const body = JSON.stringify({
    name,
    payload: data,
    sessionId: sessionStorage.getItem('vovo-session') || '',
  });
  if (navigator.sendBeacon)
    navigator.sendBeacon(
      '/api/analytics',
      new Blob([body], { type: 'application/json' }),
    );
}

const subscribeToEditorPreview = () => () => {};
const getEditorPreviewSnapshot = () =>
  new URLSearchParams(window.location.search).get('editorPreview') === '1';

export function Storefront() {
  const reduceMotion = useReducedMotion();
  const commentRailRef = useRef<HTMLDivElement>(null);
  const commentAutoPausedRef = useRef(false);
  const [selectedBundle, setSelectedBundle] = useState('familia');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [floatingBuyVisible, setFloatingBuyVisible] = useState(false);
  const isEditorPreview = useSyncExternalStore(
    subscribeToEditorPreview,
    getEditorPreviewSnapshot,
    () => false,
  );
  const [offerRecipeIndexes, setOfferRecipeIndexes] = useState({
    bump: bumpRecipePreviews.length - 1,
    ingredients: ingredientRecipePreviews.length - 1,
  });
  const [exitStage, setExitStage] = useState(0);
  const [exitOpen, setExitOpen] = useState(false);
  const [catalog, setCatalog] = useState(defaultCatalog);
  const { products, bundles, orderBump, cartOffer, exitOffers, testimonials } =
    catalog;
  const activeTestimonials = testimonials.filter((item) => item.active);
  const getBundle = (id: string) => bundles.find((item) => item.id === id);
  const getProduct = (id: string) => products.find((item) => item.id === id);
  const [config, setConfig] = useState({
    ...defaultSiteConfig,
    keyword: 'babosa',
    metaPixelId: '',
    googleAnalyticsId: '',
    tiktokPixelId: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('editorPreview') !== '1') return;
    document.body.classList.add('editor-preview-mode');
    const handleEditorClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLElement>('[data-editor-field]');
      if (!target?.dataset.editorField) return;
      event.preventDefault();
      event.stopPropagation();
      window.parent.postMessage(
        { type: 'vovo-editor-select', field: target.dataset.editorField },
        window.location.origin,
      );
    };
    const handleEditorMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'vovo-editor-config' && event.data.config) {
        setConfig((current) => ({ ...current, ...event.data.config }));
        if (event.data.catalog) setCatalog(event.data.catalog);
      }
      if (event.data?.type === 'vovo-editor-highlight') {
        document
          .querySelectorAll('.editor-selected')
          .forEach((element) => element.classList.remove('editor-selected'));
        document
          .querySelectorAll(`[data-editor-field="${String(event.data.field)}"]`)
          .forEach((element) => element.classList.add('editor-selected'));
      }
    };
    document.addEventListener('click', handleEditorClick, true);
    window.addEventListener('message', handleEditorMessage);
    return () => {
      document.body.classList.remove('editor-preview-mode');
      document.removeEventListener('click', handleEditorClick, true);
      window.removeEventListener('message', handleEditorMessage);
    };
  }, []);

  useEffect(() => {
    if (!sessionStorage.getItem('vovo-session'))
      sessionStorage.setItem('vovo-session', crypto.randomUUID());
    const saved = localStorage.getItem('vovo-cart');
    const savedStage = Number(sessionStorage.getItem('vovo-exit-stage') || 0);
    queueMicrotask(() => {
      if (saved) {
        try {
          setCart(JSON.parse(saved) as CartLine[]);
        } catch {
          localStorage.removeItem('vovo-cart');
        }
      }
      setExitStage(savedStage);
    });
    fetch('/api/site-config')
      .then((response) => (response.ok ? response.json() : null))
      .then((value) => value && setConfig(value as typeof config))
      .catch(() => undefined);
    fetch('/api/catalog')
      .then((response) => (response.ok ? response.json() : null))
      .then((value) => {
        if (!value) return;
        const next = value as typeof catalog;
        setCatalog(next);
        setSelectedBundle((current) =>
          next.bundles.some((bundle) => bundle.id === current)
            ? current
            : next.bundles.find((bundle) => bundle.recommended)?.id ||
              next.bundles[0]?.id ||
              current,
        );
      })
      .catch(() => undefined);
    track('page_view');
  }, []);
  useEffect(() => {
    localStorage.setItem('vovo-cart', JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>('[data-purchase-cta]'),
    );
    if (!targets.length) return;
    const visibility = new Map<Element, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          visibility.set(entry.target, entry.isIntersecting),
        );
        if (visibility.size < targets.length) return;
        setFloatingBuyVisible(
          !targets.some((target) => visibility.get(target) === true),
        );
      },
      { threshold: 0.2 },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      const rail = commentRailRef.current;
      if (
        !rail ||
        !rail.offsetParent ||
        commentAutoPausedRef.current ||
        document.hidden
      )
        return;
      const firstCard = rail.querySelector<HTMLElement>('.comment-card');
      if (!firstCard) return;
      const halfway = rail.scrollWidth / 2;
      if (rail.scrollLeft >= halfway - firstCard.offsetWidth) {
        rail.scrollTo({ left: 0, behavior: 'auto' });
        return;
      }
      rail.scrollBy({
        left: firstCard.offsetWidth + 28,
        behavior: 'smooth',
      });
    }, 3600);
    return () => window.clearInterval(timer);
  }, [activeTestimonials.length, reduceMotion]);
  useEffect(() => {
    if (!drawerOpen && !exitOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen, exitOpen]);
  useEffect(() => {
    if (!drawerOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [drawerOpen]);
  useEffect(() => {
    let engaged = false;
    const mark = () => {
      engaged = true;
    };
    const exit = (event: MouseEvent) => {
      if (
        event.clientY <= 8 &&
        engaged &&
        exitStage < exitOffers.length &&
        !exitOpen &&
        !drawerOpen
      ) {
        const next = exitStage + 1;
        setExitStage(next);
        setExitOpen(true);
        track(`exit_offer_${next}_view`);
      }
    };
    const timer = window.setTimeout(mark, 10000);
    window.addEventListener('scroll', mark, { once: true });
    document.addEventListener('mouseout', exit);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', mark);
      document.removeEventListener('mouseout', exit);
    };
  }, [exitStage, exitOpen, drawerOpen, exitOffers.length]);

  const subtotal = useMemo(
    () => cart.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [cart],
  );
  const savings = useMemo(
    () =>
      cart.reduce((sum, line) => {
        const regularPrice =
          line.compareAtPrice ??
          (line.kind === 'bundle'
            ? bundles.find((bundle) => bundle.id === line.id)?.compareAtPrice
            : products.find((product) => product.id === line.id)?.price) ??
          line.price;
        return sum + Math.max(0, regularPrice - line.price) * line.quantity;
      }, 0),
    [cart, bundles, products],
  );
  const hasProduct = (id: string) =>
    cart.some(
      (line) =>
        line.id === id ||
        (line.kind === 'bundle' && getBundle(line.id)?.productIds.includes(id)),
    );

  function openCart() {
    setOfferRecipeIndexes((current) => ({
      bump: (current.bump + 1) % bumpRecipePreviews.length,
      ingredients: (current.ingredients + 1) % ingredientRecipePreviews.length,
    }));
    setDrawerOpen(true);
    track('cart_open');
  }

  function addBundle(bundleId = selectedBundle, discountPercent = 0) {
    const bundle = getBundle(bundleId);
    if (!bundle) return;
    const price = Math.round(bundle.price * (1 - discountPercent / 100));
    setCart([
      {
        kind: 'bundle',
        id: bundle.id,
        quantity: 1,
        price,
        compareAtPrice: bundle.compareAtPrice,
        title: bundle.name,
        source: discountPercent ? 'exit_offer' : undefined,
        offerStage: discountPercent ? exitStage : undefined,
      },
    ]);
    openCart();
    setExitOpen(false);
    track('bundle_add_to_cart', { bundleId: bundle.id });
  }
  function addProduct(
    id: string,
    title: string,
    price: number,
    source: 'order_bump' | 'cart_offer',
  ) {
    if (hasProduct(id)) return;
    setCart((current) => [
      ...current,
      {
        kind: 'product',
        id,
        quantity: 1,
        price,
        compareAtPrice: getProduct(id)?.price,
        title,
        source,
      },
    ]);
    track(
      id === orderBump.productId ? 'order_bump_accept' : 'cart_offer_accept',
      { productId: id },
    );
  }
  async function checkout() {
    if (!cart.length || checkingOut) return;
    setCheckingOut(true);
    setCheckoutError('');
    track('checkout_started');
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(({ kind, id, quantity, source, offerStage }) => ({
            kind,
            id,
            quantity,
            source,
            offerStage,
          })),
        }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url)
        throw new Error(data.error || 'Não foi possível iniciar o pagamento.');
      window.location.assign(data.url);
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : 'Não foi possível iniciar o pagamento.',
      );
      track('checkout_failed');
      setCheckingOut(false);
    }
  }
  const bumpProduct = getProduct(orderBump.productId);
  const cartOfferProduct = getProduct(cartOffer.productId);
  const averageTestimonialRating = activeTestimonials.length
    ? activeTestimonials.reduce((sum, item) => sum + item.rating, 0) /
      activeTestimonials.length
    : 0;
  const testimonialStories = [
    ...config.customerPhotos.map((item) => ({ src: item.src, alt: item.alt })),
    ...testimonials
      .filter((item) => item.active && item.photo)
      .map((item) => ({
        src: item.photo!,
        alt: `${item.name}${item.city ? `, ${item.city}` : ''}`,
      })),
  ];
  const lineCover = (line: CartLine) =>
    line.kind === 'product'
      ? getProduct(line.id)?.coverImage
      : getProduct(getBundle(line.id)?.productIds[0] || '')?.coverImage;
  const selectedBundleData = getBundle(selectedBundle) || bundles[0];
  const floatingBuyBooks = selectedBundleData
    ? selectedBundleData.productIds.slice(0, 4).map((productId) => ({
        id: productId,
        coverImage: getProduct(productId)?.coverImage,
      }))
    : [];
  const cartBanner = cart.length
    ? config.cartBannerFilled
    : config.cartBannerEmpty;
  const fade = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-80px' },
        transition: { duration: 0.55 },
      };

  return (
    <div className="site-shell">
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <div className="urgency" data-editor-field="urgencyText">
        {config.urgencyText}
      </div>
      <header className="site-header">
        <Link
          href="/"
          className="brand"
          aria-label="Vovó Tereza, página inicial"
        >
          <BrandLogo priority />
        </Link>
        <nav className="desktop-nav" aria-label="Navegação principal">
          <a href="#livro">Início</a>
          <a href="#para-voce">Para você</a>
          <a href="#historia">Nossa história</a>
          <a href="#duvidas">Dúvidas</a>
        </nav>
        <div className="header-actions">
          <button
            className="icon-button"
            onClick={openCart}
            aria-label={`Abrir carrinho com ${cart.length} itens`}
          >
            <IconsaxBag />
            {cart.length > 0 && <span>{cart.length}</span>}
          </button>
          <button
            className="icon-button mobile-only"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menu"
          >
            <IconsaxMenu />
          </button>
        </div>
        {menuOpen && (
          <nav className="mobile-nav">
            <a href="#livro" onClick={() => setMenuOpen(false)}>
              Início
            </a>
            <a href="#ofertas" onClick={() => setMenuOpen(false)}>
              Ofertas
            </a>
            <a href="#duvidas" onClick={() => setMenuOpen(false)}>
              Dúvidas
            </a>
          </nav>
        )}
      </header>
      <main id="conteudo">
        <section className="hero" id="livro">
          <motion.div className="hero-copy" {...fade}>
            <p className="eyebrow" data-editor-field="heroBadge">
              {config.heroBadge}
            </p>
            <h1 data-editor-field="heroTitle">
              {config.heroTitle.startsWith('150 receitas naturais') ? (
                <>
                  <span className="hero-title-accent">
                    150 receitas naturais
                  </span>
                  {config.heroTitle.slice('150 receitas naturais'.length)}
                </>
              ) : (
                config.heroTitle
              )}
            </h1>
            <p className="hero-subtitle" data-editor-field="heroSubtitle">
              {config.heroSubtitle}
            </p>
            <ul className="hero-benefits" aria-label="Destaques dos cadernos">
              <li>
                <Leaf aria-hidden="true" /> Receitas com babosa
              </li>
              <li>
                <Heart aria-hidden="true" /> Chás e infusões
              </li>
              <li>
                <NotebookPen aria-hidden="true" /> Passo a passo simples
              </li>
              <li>
                <Check aria-hidden="true" /> Ingredientes acessíveis
              </li>
            </ul>
            <div className="hero-price">
              <small>A partir de</small>
              <strong>{formatMoney(bundles[0].price)}</strong>
              <span>acesso digital</span>
            </div>
            <a
              href="#ofertas"
              className="primary-button"
              data-purchase-cta
              data-editor-field="ctaText"
              onClick={() => track('hero_cta_click')}
            >
              {config.ctaText}
            </a>
            <p className="microcopy">
              <LockKeyhole /> Pagamento seguro. Acesso liberado após a
              confirmação.
            </p>
          </motion.div>
          <motion.div
            className="hero-visual"
            data-editor-field="heroImage"
            {...fade}
          >
            {config.heroImage && (
              <Image
                src={config.heroImage}
                alt="Vovó Tereza em uma cozinha brasileira com chás, babosa e seu caderno de receitas"
                fill
                priority
                sizes="(max-width: 900px) 100vw, 52vw"
                unoptimized={config.heroImage.startsWith('/api/media')}
              />
            )}
            <div className="book-card">
              <BookOpen />
              <span>150 receitas naturais</span>
              <small>em cadernos fáceis de consultar</small>
            </div>
          </motion.div>
        </section>
        <section
          className="proof-strip"
          aria-label="Características da coleção"
        >
          <div className="proof-track">
            {[false, true].map((duplicate) => (
              <div
                className="proof-group"
                key={String(duplicate)}
                aria-hidden={duplicate || undefined}
              >
                <span>
                  <IconsaxArchiveBook aria-hidden="true" />
                  Conteúdo organizado
                </span>
                <span>
                  <IconsaxMobile aria-hidden="true" />
                  Formato digital
                </span>
                <span>
                  <IconsaxCardTick aria-hidden="true" />
                  Pagamento pela Stripe
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="pain-section" id="para-voce">
          <motion.div className="section-heading" {...fade}>
            <p className="eyebrow">SE ISSO ACONTECE COM VOCÊ</p>
            <h2>Cuidar de si ficou mais confuso do que deveria</h2>
            <p>
              Depois dos 45, o corpo e os cabelos mudam. Ao mesmo tempo, a
              internet oferece receitas demais, explicações de menos e promessas
              difíceis de acreditar.
            </p>
          </motion.div>
          <div className="pain-grid">
            {[
              [
                'Cabelos pedindo cuidado',
                'Ressecamento e fios mais frágeis fazem você testar dicas soltas sem saber como preparar ou usar cada ingrediente.',
              ],
              [
                'Uma rotina difícil de sustentar',
                'Você quer se sentir mais leve e cuidar da alimentação, mas não precisa de mais uma promessa milagrosa.',
              ],
              [
                'Saberes espalhados',
                'Receitas antigas ficam em papéis, mensagens e vídeos salvos, justamente quando você precisa consultá-las.',
              ],
            ].map(([title, text], index) => (
              <motion.article className="pain-card" key={title} {...fade}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </motion.article>
            ))}
          </div>
        </section>
        <section className="collection-contents-section" id="recebe">
          <motion.div className="section-heading" {...fade}>
            <p className="eyebrow">UMA SOLUÇÃO PARA CONSULTAR DE VERDADE</p>
            <h2>Da babosa ao chá da tarde, tudo no seu devido lugar</h2>
            <p>
              A Vovó Tereza organizou receitas tradicionais em cadernos
              temáticos, com linguagem simples e atenção ao modo de preparo.
            </p>
          </motion.div>
          <div className="recipe-grid">
            {[
              'Babosa e cabelos',
              'Chás e infusões',
              'Rotina mais leve',
              'Ingredientes tradicionais',
            ].map((title, index) => (
              <motion.article key={title} className="recipe-card" {...fade}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>
                  {
                    [
                      'Preparos externos para hidratação e cuidado dos fios, com orientações de teste antes do uso.',
                      'Combinações tradicionais para transformar uma pausa do dia em ritual de bem-estar.',
                      'Receitas e hábitos que podem acompanhar objetivos de alimentação equilibrada, sem atalhos milagrosos.',
                      'Como escolher, conservar e preparar itens conhecidos com mais atenção.',
                    ][index]
                  }
                </p>
              </motion.article>
            ))}
          </div>
        </section>
        <section
          className={`customer-comments${activeTestimonials.length ? '' : ' is-empty'}`}
          aria-labelledby="comments-title"
        >
          <div className="comments-heading">
            <h2 id="comments-title" data-editor-field="commentsTitle">
              {config.commentsTitle}
            </h2>
            <div
              className={`comments-score${activeTestimonials.length ? '' : ' comments-score-empty'}`}
              data-editor-field="commentsEyebrow"
            >
              {activeTestimonials.length > 0 ? (
                <span aria-hidden="true">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star key={index} />
                  ))}
                </span>
              ) : (
                <ShieldCheck aria-hidden="true" />
              )}
              {activeTestimonials.length > 0 && (
                <strong>
                  {averageTestimonialRating.toFixed(1).replace('.', ',')}
                </strong>
              )}
              <span>{config.commentsEyebrow}</span>
              {activeTestimonials.length > 0 && (
                <span>
                  · {activeTestimonials.length}{' '}
                  {activeTestimonials.length === 1 ? 'relato' : 'relatos'}
                </span>
              )}
            </div>
            <p data-editor-field="commentsSubtitle">
              {config.commentsSubtitle}
            </p>
          </div>
          {activeTestimonials.length ? (
            <div className="comments-carousel">
              {activeTestimonials.length > 1 && (
                <div className="comments-controls">
                  <button
                    type="button"
                    className="comments-previous"
                    aria-label="Ver comentários anteriores"
                    onClick={() =>
                      commentRailRef.current?.scrollBy({
                        left: -420,
                        behavior: reduceMotion ? 'auto' : 'smooth',
                      })
                    }
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    type="button"
                    className="comments-next"
                    aria-label="Ver próximos comentários"
                    onClick={() =>
                      commentRailRef.current?.scrollBy({
                        left: 420,
                        behavior: reduceMotion ? 'auto' : 'smooth',
                      })
                    }
                  >
                    <ChevronRight />
                  </button>
                </div>
              )}
              <div
                className="comments-rail"
                ref={commentRailRef}
                data-editor-field="commentsList"
                onMouseEnter={() => {
                  commentAutoPausedRef.current = true;
                }}
                onMouseLeave={() => {
                  commentAutoPausedRef.current = false;
                }}
                onFocus={() => {
                  commentAutoPausedRef.current = true;
                }}
                onBlur={() => {
                  commentAutoPausedRef.current = false;
                }}
              >
                {[false, true].map((duplicate) => (
                  <div
                    className="comments-group"
                    aria-hidden={duplicate || undefined}
                    key={duplicate ? 'duplicate' : 'original'}
                  >
                    {activeTestimonials.map((item) => (
                      <article className="comment-card" key={item.id}>
                        <div className="comment-author">
                          <strong>{item.name}</strong>
                          {item.headline && <b>{item.headline}</b>}
                          {item.city && <span>{item.city}</span>}
                        </div>
                        <div
                          className="comment-rating"
                          aria-label={`${item.rating} de 5 estrelas`}
                        >
                          {Array.from({ length: 5 }, (_, index) => (
                            <Star
                              key={index}
                              aria-hidden="true"
                              className={index < item.rating ? 'filled' : ''}
                            />
                          ))}
                        </div>
                        <p>{item.text}</p>
                      </article>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <output className="comments-public-empty">
                <MessageSquareQuote aria-hidden="true" />
                <div>
                  <strong>Relatos em preparação</strong>
                  <p>
                    Os primeiros comentários serão publicados assim que as
                    clientes autorizarem o compartilhamento.
                  </p>
                </div>
              </output>
              {isEditorPreview && (
                <div
                  className="comments-carousel comments-empty-carousel"
                  data-editor-field="commentsList"
                >
                  <div className="comments-controls">
                    <button
                      type="button"
                      className="comments-previous"
                      aria-label="Ver espaços anteriores"
                      onClick={() =>
                        commentRailRef.current?.scrollBy({
                          left: -420,
                          behavior: reduceMotion ? 'auto' : 'smooth',
                        })
                      }
                    >
                      <ChevronLeft />
                    </button>
                    <button
                      type="button"
                      className="comments-next"
                      aria-label="Ver próximos espaços"
                      onClick={() =>
                        commentRailRef.current?.scrollBy({
                          left: 420,
                          behavior: reduceMotion ? 'auto' : 'smooth',
                        })
                      }
                    >
                      <ChevronRight />
                    </button>
                  </div>
                  <div
                    className="comments-rail"
                    ref={commentRailRef}
                    onMouseEnter={() => {
                      commentAutoPausedRef.current = true;
                    }}
                    onMouseLeave={() => {
                      commentAutoPausedRef.current = false;
                    }}
                  >
                    {[false, true].map((duplicate) => (
                      <div
                        className="comments-group"
                        aria-hidden={duplicate || undefined}
                        key={duplicate ? 'duplicate' : 'original'}
                      >
                        {Array.from({ length: 4 }, (_, index) => (
                          <article
                            className="comment-card comment-card-placeholder"
                            key={index}
                          >
                            <MessageSquareQuote aria-hidden="true" />
                            <strong>Espaço para comentário autorizado</strong>
                            <div className="comment-rating" aria-hidden="true">
                              {Array.from({ length: 5 }, (_, starIndex) => (
                                <Star className="filled" key={starIndex} />
                              ))}
                            </div>
                            <p>
                              Cadastre um relato real no painel para substituir
                              este espaço de edição.
                            </p>
                          </article>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
        <section className="benefits">
          <motion.div {...fade}>
            <p className="eyebrow">FEITO PARA MULHERES REAIS</p>
            <h2>Menos informação solta. Mais clareza para cuidar de você.</h2>
          </motion.div>
          <div className="benefit-list">
            {benefits.map(([title, text], i) => (
              <motion.div key={title} {...fade}>
                <span>{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
        <motion.section className="founder-story" id="historia" {...fade}>
          <div className="founder-image" data-editor-field="founderImage">
            {config.founderImage && (
              <Image
                src={config.founderImage}
                alt="Vovó Tereza escrevendo receitas naturais em seu caderno na cozinha"
                fill
                sizes="(max-width: 900px) 100vw, 50vw"
                unoptimized={config.founderImage.startsWith('/api/media')}
              />
            )}
          </div>
          <div className="founder-copy">
            <p className="eyebrow">DA MINHA CASA PARA A SUA</p>
            <h2>Eu sou Tereza. Antes de ser autora, sou mãe e avó.</h2>
            <p>
              Por muitos anos, guardei em cadernos os preparos que aprendi com
              as mulheres da minha família e adaptei na rotina da minha própria
              casa.
            </p>
            <p>
              Criei esta coleção para que esse conhecimento não se perdesse e
              para que outras mulheres pudessem consultar cada receita com
              calma, sem depender de vídeos salvos ou anotações incompletas.
            </p>
            <p className="founder-signature">Com carinho, Vovó Tereza.</p>
            <a href="#ofertas" className="secondary-button">
              VER AS OPÇÕES DE CADERNOS
            </a>
          </div>
        </motion.section>
        <section className="offers" id="ofertas">
          <BundleSelector
            bundles={bundles}
            products={products}
            testimonials={testimonials}
            customerPhotos={config.customerPhotos}
            value={selectedBundle}
            onChange={(bundleId) => {
              setSelectedBundle(bundleId);
              track('bundle_select', { bundleId });
            }}
            onBuy={() => addBundle()}
          />
        </section>
        <section className="collection-comparison">
          <div className="comparison-layout">
            <div className="comparison-intro">
              <p className="eyebrow" data-editor-field="comparisonEyebrow">
                {config.comparisonEyebrow}
              </p>
              <h2 data-editor-field="comparisonTitle">
                {config.comparisonTitle}
              </h2>
              <p data-editor-field="comparisonDescription">
                {config.comparisonDescription}
              </p>
              <a
                href="#ofertas"
                className="comparison-button"
                data-editor-field="comparisonCtaText"
                onClick={() => track('comparison_cta_click')}
              >
                {config.comparisonCtaText}
              </a>
            </div>
            <table
              className="comparison-table"
              aria-label="Comparação entre os cadernos da Vovó Tereza e receitas soltas"
            >
              <thead>
                <tr className="comparison-head">
                  <th scope="col" data-editor-field="comparisonColumns">
                    {config.comparisonFeatureLabel}
                  </th>
                  <th scope="col" data-editor-field="comparisonColumns">
                    {config.comparisonPrimaryLabel}
                  </th>
                  <th scope="col" data-editor-field="comparisonColumns">
                    {config.comparisonSecondaryLabel}
                  </th>
                </tr>
              </thead>
              <tbody>
                {config.comparisonItems.map((item, index) => (
                  <tr
                    className="comparison-row"
                    key={`${index}-${item}`}
                    data-editor-field="comparisonItems"
                  >
                    <th scope="row">
                      <BadgeCheck aria-hidden="true" /> {item}
                    </th>
                    <td className="comparison-yes">
                      <Check aria-hidden="true" />
                      <span className="sr-only">Incluído</span>
                    </td>
                    <td className="comparison-no">
                      <X aria-hidden="true" />
                      <span className="sr-only">Não centralizado</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p
            className="comparison-responsibility"
            data-editor-field="comparisonNote"
          >
            <ShieldCheck aria-hidden="true" />
            {config.comparisonNote}
          </p>
        </section>
        <section className="faq" id="duvidas">
          <div>
            <p className="eyebrow">DÚVIDAS FREQUENTES</p>
            <h2>O que você precisa saber antes de comprar</h2>
          </div>
          <div>
            {faqs.map(([q, a], i) => (
              <div className="faq-item" key={q}>
                <button
                  aria-expanded={openFaq === i}
                  onClick={() => {
                    setOpenFaq(openFaq === i ? null : i);
                    track('faq_open', { question: q });
                  }}
                >
                  <span>{q}</span>
                  <ChevronDown className={openFaq === i ? 'rotate' : ''} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.p
                      initial={reduceMotion ? {} : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduceMotion ? {} : { height: 0, opacity: 0 }}
                    >
                      {a}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer>
        <div className="brand">
          <BrandLogo />
        </div>
        <p>
          Receitas naturais e conhecimentos de família, organizados com cuidado
          e responsabilidade.
        </p>
        <nav className="social-links" aria-label="Redes sociais da Vovó Tereza">
          <a
            href="https://www.facebook.com/avovotereza"
            target="_blank"
            rel="noreferrer"
            aria-label="Vovó Tereza no Facebook"
            title="Facebook"
          >
            <IconsaxFacebook aria-hidden="true" />
          </a>
          <a
            href="https://www.instagram.com/avovotereza/"
            target="_blank"
            rel="noreferrer"
            aria-label="Vovó Tereza no Instagram"
            title="Instagram"
          >
            <IconsaxInstagram aria-hidden="true" />
          </a>
          <a
            href="https://www.tiktok.com/@avovoterezatktk"
            target="_blank"
            rel="noreferrer"
            aria-label="Vovó Tereza no TikTok"
            title="TikTok"
          >
            <IconsaxTiktok aria-hidden="true" />
          </a>
          <a
            href="https://www.youtube.com/@avovotereza"
            target="_blank"
            rel="noreferrer"
            aria-label="Vovó Tereza no YouTube"
            title="YouTube"
          >
            <IconsaxYoutube aria-hidden="true" />
          </a>
        </nav>
        <nav>
          <Link href="/privacidade">Privacidade</Link>
          <Link href="/termos">Termos</Link>
          <Link href="/reembolso">Reembolso</Link>
        </nav>
        <small>
          © {new Date().getFullYear()} Vovó Tereza. Todos os direitos
          reservados.
        </small>
      </footer>
      <AnimatePresence>
        {floatingBuyVisible &&
          selectedBundleData &&
          !drawerOpen &&
          !exitOpen && (
            <motion.aside
              className="floating-buy-shell"
              aria-label="Comprar a oferta selecionada"
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 18 }}
              transition={{ duration: 0.24 }}
            >
              <div className="floating-buy-bar">
                <div
                  className="floating-book-stack"
                  data-count={floatingBuyBooks.length}
                  aria-hidden="true"
                >
                  {floatingBuyBooks.map((book) => (
                    <span className="floating-book-cover" key={book.id}>
                      {book.coverImage ? (
                        <Image
                          src={book.coverImage}
                          alt=""
                          width={50}
                          height={72}
                          unoptimized
                        />
                      ) : (
                        <BookOpen />
                      )}
                    </span>
                  ))}
                </div>
                <div className="floating-buy-copy">
                  <strong>{selectedBundleData.name}</strong>
                  <span>{selectedBundleData.description}</span>
                </div>
                <div className="floating-buy-price">
                  <strong>{formatMoney(selectedBundleData.price)}</strong>
                  {selectedBundleData.compareAtPrice >
                    selectedBundleData.price && (
                    <del>{formatMoney(selectedBundleData.compareAtPrice)}</del>
                  )}
                </div>
                <button
                  type="button"
                  className="floating-buy-button"
                  onClick={() => {
                    track('floating_buy_click', {
                      bundleId: selectedBundleData.id,
                    });
                    addBundle(selectedBundleData.id);
                  }}
                >
                  APROVEITAR OFERTA
                </button>
              </div>
            </motion.aside>
          )}
      </AnimatePresence>
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.button
              className="drawer-backdrop"
              aria-label="Fechar carrinho"
              onClick={() => setDrawerOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.dialog
              open
              className="cart-drawer"
              aria-labelledby="cart-title"
              aria-modal="true"
              initial={reduceMotion ? {} : { x: '100%' }}
              animate={{ x: 0 }}
              exit={reduceMotion ? {} : { x: '100%' }}
              transition={{ duration: 0.28 }}
            >
              <header className="cart-banner">
                <h2 id="cart-title" className="sr-only">
                  Carrinho
                </h2>
                {cartBanner && (
                  <Image
                    src={cartBanner}
                    alt=""
                    fill
                    sizes="(max-width: 600px) 100vw, 480px"
                    unoptimized={cartBanner.startsWith('/api/media')}
                  />
                )}
                <button
                  className="icon-button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Fechar carrinho"
                >
                  <X />
                </button>
              </header>
              {!cart.length ? (
                <div className="empty-cart">
                  <div className="empty-cart-icon" aria-hidden="true">
                    <ShoppingBag />
                  </div>
                  <h3>Seu carrinho está vazio</h3>
                  <p>Escolha uma das coleções para ver o resumo aqui.</p>
                  <button
                    className="primary-button"
                    onClick={() => setDrawerOpen(false)}
                  >
                    CONTINUAR ESCOLHENDO
                  </button>
                  <small>
                    Compra segura e acesso digital após a confirmação.
                  </small>
                </div>
              ) : (
                <>
                  <div className="cart-lines">
                    {cart.map((line, index) => (
                      <div
                        className="cart-line"
                        key={`${line.kind}-${line.id}`}
                      >
                        <div className="cart-thumb">
                          {lineCover(line) ? (
                            <Image
                              src={lineCover(line)!}
                              alt=""
                              width={48}
                              height={64}
                              unoptimized
                            />
                          ) : (
                            <BookOpen />
                          )}
                        </div>
                        <div>
                          <strong>{line.title}</strong>
                          <small>
                            {line.kind === 'bundle'
                              ? getBundle(line.id)?.productIds.length +
                                ' itens digitais'
                              : 'Produto digital'}
                          </small>
                          <button
                            onClick={() =>
                              setCart((current) =>
                                current.filter((_, i) => i !== index),
                              )
                            }
                          >
                            Remover
                          </button>
                        </div>
                        <span>{formatMoney(line.price)}</span>
                      </div>
                    ))}
                  </div>
                  {!hasProduct(orderBump.productId) && (
                    <div className="bump">
                      <div
                        className="offer-cover-placeholder"
                        aria-label={
                          bumpProduct?.coverImage
                            ? undefined
                            : 'Capa do produto ainda não cadastrada'
                        }
                      >
                        {bumpProduct?.coverImage ? (
                          <Image
                            src={bumpProduct.coverImage}
                            alt=""
                            width={76}
                            height={114}
                            unoptimized
                          />
                        ) : (
                          <>
                            <BookOpen aria-hidden="true" />
                            <small>CAPA</small>
                          </>
                        )}
                      </div>
                      <div className="offer-card-copy">
                        <span>OFERTA ADICIONAL</span>
                        <h3>{orderBump.headline}</h3>
                        <p>{orderBump.description}</p>
                        <div className="offer-recipe-preview">
                          <small>RECEITA DO CADERNO</small>
                          <strong>
                            {bumpRecipePreviews[offerRecipeIndexes.bump].title}
                          </strong>
                          <p>
                            {
                              bumpRecipePreviews[offerRecipeIndexes.bump]
                                .summary
                            }
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            addProduct(
                              orderBump.productId,
                              bumpProduct?.name || orderBump.headline,
                              orderBump.price,
                              'order_bump',
                            )
                          }
                        >
                          <Plus aria-hidden="true" /> ADICIONAR POR{' '}
                          {formatMoney(orderBump.price)}
                        </button>
                      </div>
                    </div>
                  )}
                  {!hasProduct(cartOffer.productId) && (
                    <div className="cart-offer">
                      <div
                        className="offer-cover-placeholder"
                        aria-label={
                          cartOfferProduct?.coverImage
                            ? undefined
                            : 'Capa do produto ainda não cadastrada'
                        }
                      >
                        {cartOfferProduct?.coverImage ? (
                          <Image
                            src={cartOfferProduct.coverImage}
                            alt=""
                            width={76}
                            height={114}
                            unoptimized
                          />
                        ) : (
                          <>
                            <BookOpen aria-hidden="true" />
                            <small>CAPA</small>
                          </>
                        )}
                      </div>
                      <div className="offer-card-copy">
                        <span>PARA COMPLETAR</span>
                        <h3>{cartOffer.headline}</h3>
                        <p>{cartOffer.description}</p>
                        <div className="offer-recipe-preview">
                          <small>RECEITA DO GUIA</small>
                          <strong>
                            {
                              ingredientRecipePreviews[
                                offerRecipeIndexes.ingredients
                              ].title
                            }
                          </strong>
                          <p>
                            {
                              ingredientRecipePreviews[
                                offerRecipeIndexes.ingredients
                              ].summary
                            }
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            addProduct(
                              cartOffer.productId,
                              cartOfferProduct?.name || cartOffer.headline,
                              cartOffer.price,
                              'cart_offer',
                            )
                          }
                        >
                          <Plus aria-hidden="true" /> ADICIONAR POR{' '}
                          {formatMoney(cartOffer.price)}
                        </button>
                      </div>
                    </div>
                  )}
                  <CustomerStories compact stories={testimonialStories} />
                  <div className="cart-summary">
                    <div className="cart-total-row">
                      <span>Subtotal</span>
                      <strong>{formatMoney(subtotal)}</strong>
                    </div>
                    <div
                      className="cart-savings-row"
                      data-has-savings={savings > 0}
                    >
                      <span>Economia neste pedido</span>
                      <strong>{formatMoney(savings)}</strong>
                    </div>
                    <p>
                      <LockKeyhole aria-hidden="true" /> Pagamento seguro.
                      Produto digital. Entrega após confirmação.
                    </p>
                    {checkoutError && (
                      <div className="form-error" role="alert">
                        {checkoutError}
                      </div>
                    )}
                    <button
                      className="primary-button"
                      onClick={checkout}
                      disabled={checkingOut}
                    >
                      {checkingOut
                        ? 'PREPARANDO PAGAMENTO...'
                        : 'IR PARA O PAGAMENTO'}
                    </button>
                    <PaymentMethods />
                  </div>
                </>
              )}
            </motion.dialog>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {exitOpen && exitStage > 0 && (
          <>
            <motion.button
              className="modal-backdrop"
              aria-label="Fechar oferta"
              onClick={() => {
                setExitOpen(false);
                sessionStorage.setItem('vovo-exit-stage', String(exitStage));
                track(`exit_offer_${exitStage}_close`);
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.dialog
              open
              className="exit-modal"
              aria-labelledby="exit-title"
              initial={reduceMotion ? {} : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
            >
              <button
                className="icon-button close"
                aria-label="Fechar oferta"
                onClick={() => {
                  setExitOpen(false);
                  sessionStorage.setItem('vovo-exit-stage', String(exitStage));
                  track(`exit_offer_${exitStage}_close`);
                }}
              >
                <X />
              </button>
              <Sparkles />
              <small>OPÇÃO {exitStage} DE 3</small>
              <h2 id="exit-title">{exitOffers[exitStage - 1].headline}</h2>
              <p>{exitOffers[exitStage - 1].description}</p>
              <button
                className="primary-button"
                onClick={() => {
                  const offer = exitOffers[exitStage - 1];
                  track(`exit_offer_${exitStage}_accept`);
                  addBundle(offer.bundleId, offer.discountPercent);
                }}
              >
                {exitOffers[exitStage - 1].cta}
              </button>
              <button
                className="text-button"
                onClick={() => {
                  setExitOpen(false);
                  sessionStorage.setItem('vovo-exit-stage', String(exitStage));
                }}
              >
                Não, quero continuar navegando
              </button>
            </motion.dialog>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
