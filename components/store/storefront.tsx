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
  const [cartBannerRatio, setCartBannerRatio] = useState<number | null>(null);
  const [exitBannerRatios, setExitBannerRatios] = useState<
    Record<string, number>
  >({});
  const isEditorPreview = useSyncExternalStore(
    subscribeToEditorPreview,
    getEditorPreviewSnapshot,
    () => false,
  );
  const [offerRecipeIndexes, setOfferRecipeIndexes] = useState({
    bump: 0,
    ingredients: 0,
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
    if (!isEditorPreview) return;
    const params = new URLSearchParams(window.location.search);
    const cartMode = params.get('editorCart');
    const exitMode = Number(params.get('editorExit'));
    if (exitMode >= 1 && exitMode <= exitOffers.length) {
      queueMicrotask(() => {
        setDrawerOpen(false);
        setExitStage(exitMode);
        setExitOpen(true);
      });
      return;
    }
    if (!cartMode) return;
    const bundle = bundles[0];
    queueMicrotask(() => {
      setDrawerOpen(true);
      if (cartMode === 'empty') {
        setCart([]);
      } else if (bundle) {
        setCart([
          {
            kind: 'bundle',
            id: bundle.id,
            quantity: 1,
            price: bundle.price,
            compareAtPrice: bundle.compareAtPrice,
            title: bundle.name,
          },
        ]);
      }
    });
  }, [bundles, exitOffers.length, isEditorPreview]);

  useEffect(() => {
    if (!sessionStorage.getItem('vovo-session'))
      sessionStorage.setItem('vovo-session', crypto.randomUUID());
    const saved = localStorage.getItem('vovo-cart');
    const savedStage = Number(sessionStorage.getItem('vovo-exit-stage') || 0);
    const previewStage = Number(
      new URLSearchParams(window.location.search).get('editorExit'),
    );
    queueMicrotask(() => {
      if (saved) {
        try {
          setCart(JSON.parse(saved) as CartLine[]);
        } catch {
          localStorage.removeItem('vovo-cart');
        }
      }
      setExitStage(
        previewStage >= 1 && previewStage <= defaultCatalog.exitOffers.length
          ? previewStage
          : savedStage,
      );
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
    if (isEditorPreview) return;
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
  }, [exitStage, exitOpen, drawerOpen, exitOffers.length, isEditorPreview]);

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
      bump: (current.bump + 1) % config.cartBumpRecipes.length,
      ingredients: (current.ingredients + 1) % config.cartOfferRecipes.length,
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
  const lineProducts = (line: CartLine) =>
    (line.kind === 'bundle'
      ? getBundle(line.id)?.productIds || []
      : [line.id]
    ).flatMap((productId) => {
      const product = getProduct(productId);
      return product ? [product] : [];
    });
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
        <nav
          className="desktop-nav"
          aria-label="Navegação principal"
          data-editor-field="navLabels"
        >
          <a href="#livro">{config.navLabels[0]}</a>
          <a href="#para-voce">{config.navLabels[1]}</a>
          <a href="#historia">{config.navLabels[2]}</a>
          <a href="#duvidas">{config.navLabels[3]}</a>
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
              {config.navLabels[0]}
            </a>
            <a href="#ofertas" onClick={() => setMenuOpen(false)}>
              {config.navLabels[1]}
            </a>
            <a href="#duvidas" onClick={() => setMenuOpen(false)}>
              {config.navLabels[3]}
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
            <ul
              className="hero-benefits"
              aria-label="Destaques dos cadernos"
              data-editor-field="heroBenefits"
            >
              <li>
                <Leaf aria-hidden="true" /> {config.heroBenefits[0]}
              </li>
              <li>
                <Heart aria-hidden="true" /> {config.heroBenefits[1]}
              </li>
              <li>
                <NotebookPen aria-hidden="true" /> {config.heroBenefits[2]}
              </li>
              <li>
                <Check aria-hidden="true" /> {config.heroBenefits[3]}
              </li>
            </ul>
            <div className="hero-price" data-editor-field="heroPrice">
              <small>{config.heroPriceLabel}</small>
              <strong>{formatMoney(bundles[0].price)}</strong>
              <span>{config.heroPriceSuffix}</span>
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
            <p className="microcopy" data-editor-field="heroMicrocopy">
              <LockKeyhole /> {config.heroMicrocopy}
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
            <div className="book-card" data-editor-field="heroCard">
              <BookOpen />
              <span>{config.heroCardTitle}</span>
              <small>{config.heroCardSubtitle}</small>
            </div>
          </motion.div>
        </section>
        <section
          className="proof-strip"
          aria-label="Características da coleção"
          data-editor-field="proofItems"
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
                  {config.proofItems[0]}
                </span>
                <span>
                  <IconsaxMobile aria-hidden="true" />
                  {config.proofItems[1]}
                </span>
                <span>
                  <IconsaxCardTick aria-hidden="true" />
                  {config.proofItems[2]}
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="pain-section" id="para-voce">
          <motion.div
            className="section-heading"
            {...fade}
            data-editor-field="painHeading"
          >
            <p className="eyebrow">{config.painEyebrow}</p>
            <h2>{config.painTitle}</h2>
            <p>{config.painDescription}</p>
          </motion.div>
          <div className="pain-grid" data-editor-field="painItems">
            {config.painItems.map(({ title, text }, index) => (
              <motion.article className="pain-card" key={title} {...fade}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </motion.article>
            ))}
          </div>
        </section>
        <section className="collection-contents-section" id="recebe">
          <motion.div
            className="section-heading"
            {...fade}
            data-editor-field="contentsHeading"
          >
            <p className="eyebrow">{config.contentsEyebrow}</p>
            <h2>{config.contentsTitle}</h2>
            <p>{config.contentsDescription}</p>
          </motion.div>
          <div className="recipe-grid" data-editor-field="contentsItems">
            {config.contentsItems.map(({ title, text }, index) => (
              <motion.article key={title} className="recipe-card" {...fade}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
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
              <output
                className="comments-public-empty"
                data-editor-field="commentsEmpty"
              >
                <MessageSquareQuote aria-hidden="true" />
                <div>
                  <strong>{config.commentsEmptyTitle}</strong>
                  <p>{config.commentsEmptyText}</p>
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
          <motion.div {...fade} data-editor-field="benefitsHeading">
            <p className="eyebrow">{config.benefitsEyebrow}</p>
            <h2>{config.benefitsTitle}</h2>
          </motion.div>
          <div className="benefit-list" data-editor-field="benefitsItems">
            {config.benefitsItems.map(({ title, text }, i) => (
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
          <div className="founder-copy" data-editor-field="founderContent">
            <p className="eyebrow">{config.founderEyebrow}</p>
            <h2>{config.founderTitle}</h2>
            <p>{config.founderBodyOne}</p>
            <p>{config.founderBodyTwo}</p>
            <p className="founder-signature">{config.founderSignature}</p>
            <a href="#ofertas" className="secondary-button">
              {config.founderCtaText}
            </a>
          </div>
        </motion.section>
        <section className="offers" id="ofertas">
          <BundleSelector
            bundles={bundles}
            products={products}
            testimonials={testimonials}
            customerPhotos={config.customerPhotos}
            content={config}
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
          <div data-editor-field="faqHeading">
            <p className="eyebrow">{config.faqEyebrow}</p>
            <h2>{config.faqTitle}</h2>
          </div>
          <div data-editor-field="faqItems">
            {config.faqItems.map(({ question, answer }, i) => (
              <div className="faq-item" key={question}>
                <button
                  aria-expanded={openFaq === i}
                  onClick={() => {
                    setOpenFaq(openFaq === i ? null : i);
                    track('faq_open', { question });
                  }}
                >
                  <span>{question}</span>
                  <ChevronDown className={openFaq === i ? 'rotate' : ''} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.p
                      initial={reduceMotion ? {} : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduceMotion ? {} : { height: 0, opacity: 0 }}
                    >
                      {answer}
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
        <p data-editor-field="footerText">{config.footerText}</p>
        <nav
          className="social-links"
          aria-label="Redes sociais da Vovó Tereza"
          data-editor-field="footerSocial"
        >
          <a
            href={config.facebookUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Vovó Tereza no Facebook"
            title="Facebook"
          >
            <IconsaxFacebook aria-hidden="true" />
          </a>
          <a
            href={config.instagramUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Vovó Tereza no Instagram"
            title="Instagram"
          >
            <IconsaxInstagram aria-hidden="true" />
          </a>
          <a
            href={config.tiktokUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Vovó Tereza no TikTok"
            title="TikTok"
          >
            <IconsaxTiktok aria-hidden="true" />
          </a>
          <a
            href={config.youtubeUrl}
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
        <small data-editor-field="footerCopyright">
          © {new Date().getFullYear()} {config.footerCopyright}
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
                  {config.floatingCtaText}
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
              <header
                className={`cart-banner${cartBanner ? ' has-image' : ''}`}
                data-editor-field={
                  cart.length ? 'cartBannerFilled' : 'cartBannerEmpty'
                }
                style={
                  cartBanner ? { aspectRatio: cartBannerRatio ?? 4 } : undefined
                }
              >
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
                    onLoad={(event) => {
                      const { naturalWidth, naturalHeight } =
                        event.currentTarget;
                      if (naturalWidth && naturalHeight) {
                        setCartBannerRatio(naturalWidth / naturalHeight);
                      }
                    }}
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
                <div
                  className="empty-cart"
                  data-editor-field="cartEmptyContent"
                >
                  <div className="empty-cart-icon" aria-hidden="true">
                    <ShoppingBag />
                  </div>
                  <h3>{config.cartEmptyTitle}</h3>
                  <p>{config.cartEmptyText}</p>
                  <button
                    className="primary-button"
                    onClick={() => setDrawerOpen(false)}
                  >
                    {config.cartEmptyCtaText}
                  </button>
                  <small>{config.cartEmptyNote}</small>
                </div>
              ) : (
                <>
                  <div className="cart-lines">
                    {cart.map((line, index) => {
                      const productsInLine = lineProducts(line);
                      const isBundle = line.kind === 'bundle';

                      return (
                        <div
                          className={`cart-line${isBundle ? ' is-bundle' : ''}`}
                          key={`${line.kind}-${line.id}`}
                        >
                          {isBundle ? (
                            <div
                              className="cart-thumb cart-thumb-bundle"
                              aria-label={`Capas incluídas: ${productsInLine
                                .map((product) => product.name)
                                .join(', ')}`}
                            >
                              {productsInLine.map((product) => (
                                <span
                                  className="cart-thumb-book"
                                  key={product.id}
                                >
                                  {product.coverImage ? (
                                    <Image
                                      src={product.coverImage}
                                      alt=""
                                      width={48}
                                      height={64}
                                      unoptimized
                                    />
                                  ) : (
                                    <BookOpen aria-hidden="true" />
                                  )}
                                </span>
                              ))}
                            </div>
                          ) : (
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
                                <BookOpen aria-hidden="true" />
                              )}
                            </div>
                          )}
                          <div>
                            <strong>{line.title}</strong>
                            <small>
                              {line.kind === 'bundle'
                                ? getBundle(line.id)?.productIds.length +
                                  ` ${config.cartBundleItemLabel}`
                                : config.cartProductItemLabel}
                            </small>
                            <button
                              onClick={() =>
                                setCart((current) =>
                                  current.filter((_, i) => i !== index),
                                )
                              }
                            >
                              {config.cartRemoveText}
                            </button>
                          </div>
                          <span>{formatMoney(line.price)}</span>
                        </div>
                      );
                    })}
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
                      <div
                        className="offer-card-copy"
                        data-editor-field="cartBumpCopy"
                      >
                        <span>{config.cartBumpEyebrow}</span>
                        <h3>{orderBump.headline}</h3>
                        <p>{orderBump.description}</p>
                        <div className="offer-recipe-preview">
                          <small>{config.cartBumpRecipeLabel}</small>
                          <strong>
                            {
                              config.cartBumpRecipes[
                                offerRecipeIndexes.bump %
                                  config.cartBumpRecipes.length
                              ].title
                            }
                          </strong>
                          <p>
                            {
                              config.cartBumpRecipes[
                                offerRecipeIndexes.bump %
                                  config.cartBumpRecipes.length
                              ].text
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
                          <Plus aria-hidden="true" /> {config.cartAddCtaPrefix}{' '}
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
                      <div
                        className="offer-card-copy"
                        data-editor-field="cartOfferCopy"
                      >
                        <span>{config.cartOfferEyebrow}</span>
                        <h3>{cartOffer.headline}</h3>
                        <p>{cartOffer.description}</p>
                        <div className="offer-recipe-preview">
                          <small>{config.cartOfferRecipeLabel}</small>
                          <strong>
                            {
                              config.cartOfferRecipes[
                                offerRecipeIndexes.ingredients %
                                  config.cartOfferRecipes.length
                              ].title
                            }
                          </strong>
                          <p>
                            {
                              config.cartOfferRecipes[
                                offerRecipeIndexes.ingredients %
                                  config.cartOfferRecipes.length
                              ].text
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
                          <Plus aria-hidden="true" /> {config.cartAddCtaPrefix}{' '}
                          {formatMoney(cartOffer.price)}
                        </button>
                      </div>
                    </div>
                  )}
                  <CustomerStories
                    compact
                    stories={testimonialStories}
                    eyebrow={config.galleryEyebrow}
                    title={config.galleryTitle}
                    compactTitle={config.cartGalleryTitle}
                  />
                  <div
                    className="cart-summary"
                    data-editor-field="cartSummaryCopy"
                  >
                    <div className="cart-total-row">
                      <span>{config.cartSubtotalLabel}</span>
                      <strong>{formatMoney(subtotal)}</strong>
                    </div>
                    <div
                      className="cart-savings-row"
                      data-has-savings={savings > 0}
                    >
                      <span>{config.cartSavingsLabel}</span>
                      <strong>{formatMoney(savings)}</strong>
                    </div>
                    <p>
                      <LockKeyhole aria-hidden="true" />{' '}
                      {config.cartSecurityText}
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
                        ? config.cartCheckoutLoadingText
                        : config.cartCheckoutCtaText}
                    </button>
                    <PaymentMethods
                      note={config.paymentNote}
                      securityText={config.paymentSecurityText}
                    />
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
              data-editor-field={`recoveryStage${exitStage}`}
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
              {exitOffers[exitStage - 1].banner && (
                <div
                  className="exit-banner"
                  style={{
                    aspectRatio: String(
                      exitBannerRatios[exitOffers[exitStage - 1].banner!] ||
                        8 / 3,
                    ),
                  }}
                >
                  <Image
                    src={exitOffers[exitStage - 1].banner!}
                    alt=""
                    fill
                    sizes="(max-width: 600px) calc(100vw - 24px), 560px"
                    unoptimized={exitOffers[exitStage - 1].banner!.startsWith(
                      '/api/media',
                    )}
                    onLoad={(event) => {
                      const { naturalWidth, naturalHeight } =
                        event.currentTarget;
                      if (!naturalWidth || !naturalHeight) return;
                      const banner = exitOffers[exitStage - 1].banner!;
                      setExitBannerRatios((current) => ({
                        ...current,
                        [banner]: naturalWidth / naturalHeight,
                      }));
                    }}
                  />
                </div>
              )}
              <div className="exit-modal-content">
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
                    sessionStorage.setItem(
                      'vovo-exit-stage',
                      String(exitStage),
                    );
                  }}
                >
                  Não, quero continuar navegando
                </button>
              </div>
            </motion.dialog>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
