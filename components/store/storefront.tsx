'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  BookOpen,
  Check,
  ChevronDown,
  LockKeyhole,
  Menu,
  Plus,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { BundleSelector, PaymentMethods } from './bundle-selector';
import { BrandLogo } from '@/components/brand-logo';
import {
  bundles,
  cartOffer,
  defaultSiteConfig,
  exitOffers,
  formatMoney,
  getBundle,
  orderBump,
} from '@/lib/catalog';

type CartLine = {
  kind: 'bundle' | 'product';
  id: string;
  quantity: number;
  price: number;
  title: string;
  source?: 'order_bump' | 'cart_offer' | 'exit_offer';
  offerStage?: number;
};

const benefits = [
  [
    'Organizado por assunto',
    'Encontre o preparo que procura sem folhear dezenas de páginas.',
  ],
  [
    'Passo a passo legível',
    'Instruções diretas, boas para acompanhar mesmo em telas pequenas.',
  ],
  [
    'Acesso em qualquer aparelho',
    'Abra no celular, tablet ou computador depois da confirmação.',
  ],
  [
    'Conhecimento preservado',
    'Receitas e anotações de família reunidas em um único lugar.',
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
    'Preciso saber cozinhar?',
    'Não. O passo a passo foi escrito para quem cozinha todos os dias e também para quem está começando.',
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
    'Existe conteúdo sobre babosa?',
    'O guia de ingredientes traz contexto culinário e tradicional sobre a babosa. Não há promessas médicas ou substituição de orientação profissional.',
  ],
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

export function Storefront() {
  const reduceMotion = useReducedMotion();
  const [selectedBundle, setSelectedBundle] = useState('familia');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [exitStage, setExitStage] = useState(0);
  const [exitOpen, setExitOpen] = useState(false);
  const [config, setConfig] = useState({
    ...defaultSiteConfig,
    keyword: 'babosa',
    metaPixelId: '',
    googleAnalyticsId: '',
    tiktokPixelId: '',
  });

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
    track('page_view');
  }, []);
  useEffect(() => {
    localStorage.setItem('vovo-cart', JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    let engaged = false;
    const mark = () => {
      engaged = true;
    };
    const exit = (event: MouseEvent) => {
      if (
        event.clientY <= 8 &&
        engaged &&
        exitStage < 3 &&
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
  }, [exitStage, exitOpen, drawerOpen]);

  const subtotal = useMemo(
    () => cart.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [cart],
  );
  const hasProduct = (id: string) =>
    cart.some(
      (line) =>
        line.id === id ||
        (line.kind === 'bundle' && getBundle(line.id)?.productIds.includes(id)),
    );

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
        title: bundle.name,
        source: discountPercent ? 'exit_offer' : undefined,
        offerStage: discountPercent ? exitStage : undefined,
      },
    ]);
    setDrawerOpen(true);
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
      { kind: 'product', id, quantity: 1, price, title, source },
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
      <div className="urgency">{config.urgencyText}</div>
      <header className="site-header">
        <Link
          href="/"
          className="brand"
          aria-label="Vovó Tereza, página inicial"
        >
          <BrandLogo priority />
        </Link>
        <nav className="desktop-nav" aria-label="Navegação principal">
          <a href="#livro">O Livro</a>
          <a href="#recebe">O que você recebe</a>
          <a href="#receitas">Receitas</a>
          <a href="#duvidas">Dúvidas</a>
        </nav>
        <div className="header-actions">
          <button
            className="icon-button"
            onClick={() => setDrawerOpen(true)}
            aria-label={`Abrir carrinho com ${cart.length} itens`}
          >
            <ShoppingBag />
            <span>{cart.length}</span>
          </button>
          <button
            className="icon-button mobile-only"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menu"
          >
            <Menu />
          </button>
        </div>
        {menuOpen && (
          <nav className="mobile-nav">
            <a href="#livro" onClick={() => setMenuOpen(false)}>
              O Livro
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
            <p className="eyebrow">{config.heroBadge}</p>
            <h1>{config.heroTitle}</h1>
            <p className="hero-subtitle">{config.heroSubtitle}</p>
            <div className="hero-price">
              <small>A partir de</small>
              <strong>{formatMoney(bundles[0].price)}</strong>
              <span>acesso digital</span>
            </div>
            <a
              href="#ofertas"
              className="primary-button"
              onClick={() => track('hero_cta_click')}
            >
              {config.ctaText}
            </a>
            <p className="microcopy">
              <LockKeyhole /> Pagamento seguro. Acesso liberado após a
              confirmação.
            </p>
          </motion.div>
          <motion.div className="hero-visual" {...fade}>
            <Image
              src="/images/hero-vovo-tereza.png"
              alt="Mãos de uma mulher mais velha organizando um antigo caderno de receitas em uma cozinha brasileira"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 52vw"
            />
            <div className="book-card">
              <BookOpen />
              <span>4 cadernos digitais</span>
              <small>para guardar e consultar</small>
            </div>
          </motion.div>
        </section>
        <section
          className="proof-strip"
          aria-label="Características da coleção"
        >
          <span>
            <Check /> Leitura confortável
          </span>
          <span>
            <Check /> Formato digital
          </span>
          <span>
            <Check /> Receitas organizadas
          </span>
        </section>
        <motion.section className="story section-grid" id="receitas" {...fade}>
          <div>
            <p className="eyebrow">O CADERNO ESQUECIDO</p>
            <h2>A inspiração vem dos cadernos de receitas de família</h2>
          </div>
          <div className="story-copy">
            <p>
              A Vovó Tereza nasce da ideia de valorizar a cozinha de casa:
              receitas compartilhadas, ingredientes conhecidos e o cuidado
              de preparar uma refeição.
            </p>
            <p>
              Essa inspiração orienta a coleção de cadernos digitais, com temas
              como bolos, sobremesas, economia na cozinha e ingredientes
              tradicionais.
            </p>
          </div>
        </motion.section>
        <section className="contents" id="recebe">
          <motion.div className="section-heading" {...fade}>
            <p className="eyebrow">POR DENTRO DA COLEÇÃO</p>
            <h2>Receitas para os dias comuns e para a mesa cheia</h2>
            <p>
              Um índice claro reúne preparos de família em categorias fáceis de
              consultar.
            </p>
          </motion.div>
          <div className="recipe-grid">
            {[
              'Bolos e cafés',
              'Domingo em família',
              'Receitas econômicas',
              'Ingredientes tradicionais',
            ].map((title, index) => (
              <motion.article key={title} className="recipe-card" {...fade}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>
                  {
                    [
                      'Massas simples, bolos caseiros e acompanhamentos para o café.',
                      'Pratos que podem ser preparados sem pressa e compartilhados.',
                      'Aproveitamento cuidadoso de ingredientes e preparos do dia a dia.',
                      'Contexto culinário sobre plantas e ingredientes conhecidos, como a babosa.',
                    ][index]
                  }
                </p>
              </motion.article>
            ))}
          </div>
        </section>
        <section className="benefits">
          <motion.div {...fade}>
            <p className="eyebrow">FEITO PARA SER USADO</p>
            <h2>Um caderno bonito só tem valor quando ajuda na cozinha</h2>
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
        <section className="offers" id="ofertas">
          <BundleSelector value={selectedBundle} onChange={(bundleId) => {
            setSelectedBundle(bundleId);
            track('bundle_select', { bundleId });
          }} onBuy={() => addBundle()} />
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
        <p>Receitas e conhecimentos de família, organizados com cuidado.</p>
        <nav>
          <Link href="/privacidade">Privacidade</Link>
          <Link href="/termos">Termos</Link>
          <Link href="/reembolso">Reembolso</Link>
        </nav>
        <small>
          © {new Date().getFullYear()} Vovó Tereza. Todos os direitos reservados.
        </small>
      </footer>
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
              initial={reduceMotion ? {} : { x: '100%' }}
              animate={{ x: 0 }}
              exit={reduceMotion ? {} : { x: '100%' }}
              transition={{ duration: 0.28 }}
            >
              <header>
                <div>
                  <small>SEU PEDIDO</small>
                  <h2 id="cart-title">Carrinho</h2>
                </div>
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
                  <ShoppingBag />
                  <h3>Seu carrinho está vazio</h3>
                  <p>Escolha uma das coleções para ver o resumo aqui.</p>
                  <button
                    className="secondary-button"
                    onClick={() => setDrawerOpen(false)}
                  >
                    CONTINUAR ESCOLHENDO
                  </button>
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
                          <BookOpen />
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
                      <span>OFERTA ADICIONAL</span>
                      <h3>{orderBump.headline}</h3>
                      <p>{orderBump.description}</p>
                      <button
                        onClick={() =>
                          addProduct(
                            orderBump.productId,
                            'Caderno de Bolos e Sobremesas',
                            orderBump.price,
                            'order_bump',
                          )
                        }
                      >
                        <Plus /> ADICIONAR POR {formatMoney(orderBump.price)}
                      </button>
                    </div>
                  )}
                  {!hasProduct(cartOffer.productId) && (
                    <div className="cart-offer">
                      <div>
                        <strong>{cartOffer.headline}</strong>
                        <p>{cartOffer.description}</p>
                      </div>
                      <button
                        onClick={() =>
                          addProduct(
                            cartOffer.productId,
                            'Guia de Ingredientes Tradicionais',
                            cartOffer.price,
                            'cart_offer',
                          )
                        }
                      >
                        Adicionar {formatMoney(cartOffer.price)}
                      </button>
                    </div>
                  )}
                  <div className="cart-summary">
                    <div>
                      <span>Subtotal</span>
                      <strong>{formatMoney(subtotal)}</strong>
                    </div>
                    <p>
                      <LockKeyhole /> Pagamento seguro. Produto digital. Entrega
                      após confirmação.
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
