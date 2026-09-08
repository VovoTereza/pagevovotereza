'use client';

import { BrandLogo } from '@/components/brand-logo';
import type {
  Bundle,
  CatalogConfig,
  ExitOffer,
  Product,
  SiteConfig,
  Testimonial,
} from '@/lib/catalog';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Boxes,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Columns3,
  FileText,
  ImagePlus,
  Images,
  KeyRound,
  LogOut,
  Megaphone,
  MessageSquareQuote,
  Monitor,
  Package,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShoppingCart,
  Smartphone,
  Tag,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import {
  ChangeEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';

type Config = SiteConfig & {
  keyword: string;
  metaPixelId: string;
  googleAnalyticsId: string;
  tiktokPixelId: string;
};
type AdminOrder = {
  id: string;
  orderNumber: string;
  customerName: string | null;
  customerEmail: string | null;
  status: string;
  paymentStatus: string;
  total: number;
  currency: string;
  createdAt: string;
};

type EditorSection =
  | 'offer'
  | 'navigation'
  | 'hero'
  | 'proof'
  | 'pain'
  | 'contents'
  | 'benefits'
  | 'story'
  | 'offers'
  | 'gallery'
  | 'comparison'
  | 'comments'
  | 'faq'
  | 'footer'
  | 'cart';
type EditorField =
  | 'urgencyText'
  | 'navLabels'
  | 'heroBadge'
  | 'heroTitle'
  | 'heroSubtitle'
  | 'heroImage'
  | 'ctaText'
  | 'heroBenefits'
  | 'heroPrice'
  | 'heroMicrocopy'
  | 'heroCard'
  | 'proofItems'
  | 'painHeading'
  | 'painItems'
  | 'contentsHeading'
  | 'contentsItems'
  | 'benefitsHeading'
  | 'benefitsItems'
  | 'founderImage'
  | 'founderContent'
  | 'collectionHeading'
  | 'collectionBenefits'
  | 'gallery'
  | 'galleryCopy'
  | 'comparisonEyebrow'
  | 'comparisonTitle'
  | 'comparisonDescription'
  | 'comparisonCtaText'
  | 'comparisonColumns'
  | 'comparisonItems'
  | 'comparisonNote'
  | 'commentsEyebrow'
  | 'commentsTitle'
  | 'commentsSubtitle'
  | 'commentsEmpty'
  | 'commentsList'
  | 'faqHeading'
  | 'faqItems'
  | 'footerText'
  | 'footerSocial'
  | 'footerCopyright'
  | 'cartBannerEmpty'
  | 'cartBannerFilled'
  | 'cartEmptyContent'
  | 'cartBumpCopy'
  | 'cartOfferCopy'
  | 'cartSummaryCopy';

const editorFieldLabels: Record<EditorField, string> = {
  urgencyText: 'Mensagem da oferta',
  navLabels: 'Menu principal',
  heroBadge: 'Selo principal',
  heroTitle: 'Título principal',
  heroSubtitle: 'Texto de apresentação',
  heroImage: 'Imagem principal',
  ctaText: 'Botão principal',
  heroBenefits: 'Destaques da abertura',
  heroPrice: 'Apresentação do preço',
  heroMicrocopy: 'Segurança da compra',
  heroCard: 'Selo sobre a imagem',
  proofItems: 'Faixa de benefícios',
  painHeading: 'Introdução do problema',
  painItems: 'Cards do problema',
  contentsHeading: 'Introdução dos conteúdos',
  contentsItems: 'Cards dos conteúdos',
  benefitsHeading: 'Título dos benefícios',
  benefitsItems: 'Lista de benefícios',
  founderImage: 'Foto da Vovó Tereza',
  founderContent: 'História da Vovó Tereza',
  collectionHeading: 'Apresentação das ofertas',
  collectionBenefits: 'Benefícios das ofertas',
  gallery: 'Fotos de clientes',
  galleryCopy: 'Título das fotos de clientes',
  comparisonEyebrow: 'Selo da comparação',
  comparisonTitle: 'Título da comparação',
  comparisonDescription: 'Descrição da comparação',
  comparisonCtaText: 'Botão da comparação',
  comparisonColumns: 'Nomes das colunas',
  comparisonItems: 'Itens comparados',
  comparisonNote: 'Observação responsável',
  commentsEyebrow: 'Selo dos comentários',
  commentsTitle: 'Título dos comentários',
  commentsSubtitle: 'Texto dos comentários',
  commentsEmpty: 'Estado sem comentários',
  commentsList: 'Comentários publicados',
  faqHeading: 'Título das dúvidas',
  faqItems: 'Perguntas e respostas',
  footerText: 'Texto do rodapé',
  footerSocial: 'Links das redes sociais',
  footerCopyright: 'Direitos autorais',
  cartBannerEmpty: 'Banner do carrinho vazio',
  cartBannerFilled: 'Banner do carrinho com produtos',
  cartEmptyContent: 'Carrinho vazio',
  cartBumpCopy: 'Textos da oferta adicional',
  cartOfferCopy: 'Textos para completar a coleção',
  cartSummaryCopy: 'Resumo e botão de pagamento',
};

const nav = [
  ['Visão geral', BarChart3],
  ['Pedidos', ShoppingCart],
  ['Produtos', Package],
  ['Bundles', Boxes],
  ['Order Bumps', Tag],
  ['Carrinho', ShoppingCart],
  ['Recuperação', Megaphone],
  ['Provas sociais', Users],
  ['Editor da página', FileText],
  ['SEO e palavras-chave', Search],
  ['Pixels', Settings],
] as const;
const money = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    value / 100,
  );
const moneyInput = (value?: number) =>
  ((value || 0) / 100).toFixed(2).replace('.', ',');
const toCents = (value: string) =>
  Math.max(0, Math.round(Number(value.replace(',', '.')) * 100) || 0);
const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function AdminDashboard({
  initialConfig,
  initialCatalog,
  orderCount,
  revenue,
  recentOrders,
}: {
  initialConfig: Config;
  initialCatalog: CatalogConfig;
  orderCount: number;
  revenue: number;
  recentOrders: AdminOrder[];
}) {
  const [active, setActive] = useState('Visão geral');
  const [config, setConfig] = useState(initialConfig);
  const [catalog, setCatalog] = useState(initialCatalog);
  const [productDraft, setProductDraft] = useState<Product | null>(null);
  const [bundleDraft, setBundleDraft] = useState<Bundle | null>(null);
  const [testimonialDraft, setTestimonialDraft] = useState<Testimonial | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editorSection, setEditorSection] = useState<EditorSection>('hero');
  const [selectedEditorField, setSelectedEditorField] =
    useState<EditorField | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>(
    'desktop',
  );
  const [previewSurface, setPreviewSurface] = useState<'page' | 'cart-empty' | 'cart-filled'>('page');
  const previewRef = useRef<HTMLIFrameElement>(null);
  const previewFrameRef = useRef<HTMLDivElement>(null);
  const [desktopPreviewScale, setDesktopPreviewScale] = useState(1);
  const [desktopPreviewHeight, setDesktopPreviewHeight] = useState(700);
  const activeProducts = useMemo(
    () => catalog.products.filter((product) => product.active).length,
    [catalog.products],
  );

  function selectEditorField(field: EditorField) {
    const sectionByField: Record<EditorField, EditorSection> = {
      urgencyText: 'offer',
      navLabels: 'navigation',
      heroBadge: 'hero',
      heroTitle: 'hero',
      heroSubtitle: 'hero',
      heroImage: 'hero',
      ctaText: 'hero',
      heroBenefits: 'hero',
      heroPrice: 'hero',
      heroMicrocopy: 'hero',
      heroCard: 'hero',
      proofItems: 'proof',
      painHeading: 'pain',
      painItems: 'pain',
      contentsHeading: 'contents',
      contentsItems: 'contents',
      benefitsHeading: 'benefits',
      benefitsItems: 'benefits',
      founderImage: 'story',
      founderContent: 'story',
      collectionHeading: 'offers',
      collectionBenefits: 'offers',
      gallery: 'gallery',
      galleryCopy: 'gallery',
      comparisonEyebrow: 'comparison',
      comparisonTitle: 'comparison',
      comparisonDescription: 'comparison',
      comparisonCtaText: 'comparison',
      comparisonColumns: 'comparison',
      comparisonItems: 'comparison',
      comparisonNote: 'comparison',
      commentsEyebrow: 'comments',
      commentsTitle: 'comments',
      commentsSubtitle: 'comments',
      commentsEmpty: 'comments',
      commentsList: 'comments',
      faqHeading: 'faq',
      faqItems: 'faq',
      footerText: 'footer',
      footerSocial: 'footer',
      footerCopyright: 'footer',
      cartBannerEmpty: 'cart',
      cartBannerFilled: 'cart',
      cartEmptyContent: 'cart',
      cartBumpCopy: 'cart',
      cartOfferCopy: 'cart',
      cartSummaryCopy: 'cart',
    };
    setSelectedEditorField(field);
    setEditorSection(sectionByField[field]);
    if (sectionByField[field] === 'cart') {
      setPreviewSurface(field === 'cartBannerEmpty' || field === 'cartEmptyContent' ? 'cart-empty' : 'cart-filled');
    } else {
      setPreviewSurface('page');
    }
  }

  const updatePreview = useCallback(() => {
    previewRef.current?.contentWindow?.postMessage(
      { type: 'vovo-editor-config', config, catalog },
      window.location.origin,
    );
  }, [catalog, config]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'vovo-editor-select') return;
      const field = event.data.field as EditorField;
      if (field in editorFieldLabels)
        selectEditorField(field);
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  useEffect(() => {
    previewRef.current?.contentWindow?.postMessage(
      { type: 'vovo-editor-highlight', field: selectedEditorField },
      window.location.origin,
    );
  }, [selectedEditorField]);

  useEffect(() => {
    if (active !== 'Editor da página' || !previewFrameRef.current) return;
    const updateScale = () => {
      const width = previewFrameRef.current?.clientWidth || 1280;
      const height = previewFrameRef.current?.clientHeight || 700;
      setDesktopPreviewScale(Math.min(1, width / 1280));
      setDesktopPreviewHeight(height);
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(previewFrameRef.current);
    return () => observer.disconnect();
  }, [active]);

  async function saveConfig(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    const response = await fetch('/api/site-config', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(config),
    });
    const data = (await response.json()) as { error?: string };
    let catalogResponse: Response | null = null;
    if (response.ok && active === 'Editor da página') {
      catalogResponse = await fetch('/api/catalog', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(catalog),
      });
    }
    setMessage(
      response.ok && (!catalogResponse || catalogResponse.ok)
        ? 'Alterações salvas na loja.'
        : data.error || 'Não foi possível salvar todas as alterações.',
    );
    setSaving(false);
  }
  async function persistCatalog(next: CatalogConfig, success: string) {
    setSaving(true);
    setMessage('');
    const response = await fetch('/api/catalog', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(next),
    });
    const data = (await response.json()) as { error?: string };
    if (response.ok) {
      setCatalog(next);
      setMessage(success);
    } else setMessage(data.error || 'Não foi possível salvar o catálogo.');
    setSaving(false);
    return response.ok;
  }
  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    window.location.assign('/admin/login');
  }
  async function upload(
    file: File,
    kind: 'cover' | 'deliverable',
    productId: string,
  ) {
    setSaving(true);
    setMessage(`Enviando ${kind === 'cover' ? 'imagem' : 'entregável'}...`);
    const body = new FormData();
    body.set('file', file);
    body.set('kind', kind);
    body.set('productId', productId);
    const response = await fetch('/api/admin/upload', { method: 'POST', body });
    const data = (await response.json()) as {
      error?: string;
      key?: string;
      url?: string;
      fileName?: string;
    };
    setSaving(false);
    if (!response.ok) {
      setMessage(data.error || 'Falha no envio.');
      return null;
    }
    setMessage('Arquivo enviado. Salve o produto para concluir.');
    return data;
  }
  async function replacePageImage(
    file: File | undefined,
    key: 'heroImage' | 'founderImage' | 'cartBannerEmpty' | 'cartBannerFilled',
  ) {
    if (!file) return;
    const result = await upload(file, 'cover', `pagina-${key}`);
    if (result?.url) {
      setConfig((current) => ({ ...current, [key]: result.url! }));
      setMessage('Imagem pronta. Salve a página para publicar a alteração.');
    }
  }
  async function addCustomerPhotos(files: FileList | null) {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      const result = await upload(file, 'cover', 'fotos-clientes');
      if (result?.url) {
        setConfig((current) => ({
          ...current,
          customerPhotos: [
            ...current.customerPhotos,
            {
              id: crypto.randomUUID(),
              src: result.url!,
              alt: 'Cliente da Vovó Tereza',
            },
          ],
        }));
      }
    }
    setMessage('Fotos adicionadas. Salve a página para publicar a alteração.');
  }
  async function replaceCustomerPhoto(id: string, file: File | undefined) {
    if (!file) return;
    const result = await upload(file, 'cover', 'fotos-clientes');
    if (result?.url) {
      setConfig((current) => ({
        ...current,
        customerPhotos: current.customerPhotos.map((photo) =>
          photo.id === id ? { ...photo, src: result.url! } : photo,
        ),
      }));
      setMessage('Foto trocada. Salve a página para publicar a alteração.');
    }
  }
  const input = (
    key: { [K in keyof Config]: Config[K] extends string ? K : never }[keyof Config],
    label: string,
    area = false,
  ) => (
    <label>
      {label}
      {area ? (
        <textarea
          value={config[key]}
          onChange={(event) =>
            setConfig({ ...config, [key]: event.target.value })
          }
        />
      ) : (
        <input
          value={config[key]}
          onChange={(event) =>
            setConfig({ ...config, [key]: event.target.value })
          }
        />
      )}
    </label>
  );
  const stringList = (
    key: 'navLabels' | 'heroBenefits' | 'proofItems' | 'collectionBenefits',
    labels: string[],
  ) => (
    <div className="page-editor-list-fields">
      {config[key].map((value, index) => (
        <label key={`${key}-${index}`}>
          {labels[index] || `Item ${index + 1}`}
          <input
            value={value}
            onChange={(event) =>
              setConfig({
                ...config,
                [key]: config[key].map((item, itemIndex) =>
                  itemIndex === index ? event.target.value : item,
                ),
              })
            }
          />
        </label>
      ))}
    </div>
  );
  const cardList = (
    key: 'painItems' | 'contentsItems' | 'benefitsItems' | 'cartBumpRecipes' | 'cartOfferRecipes',
  ) => (
    <div className="page-editor-card-fields">
      {config[key].map((item, index) => (
        <fieldset key={`${key}-${index}`}>
          <legend>Card {index + 1}</legend>
          <label>
            Título
            <input
              value={item.title}
              onChange={(event) =>
                setConfig({
                  ...config,
                  [key]: config[key].map((current, itemIndex) =>
                    itemIndex === index ? { ...current, title: event.target.value } : current,
                  ),
                })
              }
            />
          </label>
          <label>
            Texto
            <textarea
              value={item.text}
              onChange={(event) =>
                setConfig({
                  ...config,
                  [key]: config[key].map((current, itemIndex) =>
                    itemIndex === index ? { ...current, text: event.target.value } : current,
                  ),
                })
              }
            />
          </label>
        </fieldset>
      ))}
    </div>
  );
  const notice = message && (
    <output
      className={
        message.includes('salv') || message.includes('enviado')
          ? 'save-success'
          : 'form-error'
      }
    >
      {message}
    </output>
  );

  async function submitProduct(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!productDraft) return;
    const id =
      productDraft.id || slugify(productDraft.name) || crypto.randomUUID();
    const normalized = {
      ...productDraft,
      id,
      slug: productDraft.slug || slugify(productDraft.name),
    };
    const next = {
      ...catalog,
      products: catalog.products.some((item) => item.id === id)
        ? catalog.products.map((item) => (item.id === id ? normalized : item))
        : [...catalog.products, normalized],
    };
    if (await persistCatalog(next, 'Produto salvo e catálogo atualizado.'))
      setProductDraft(null);
  }
  async function submitBundle(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bundleDraft) return;
    const id =
      bundleDraft.id || slugify(bundleDraft.name) || crypto.randomUUID();
    const normalized = { ...bundleDraft, id };
    const next = {
      ...catalog,
      bundles: catalog.bundles.some((item) => item.id === id)
        ? catalog.bundles.map((item) => (item.id === id ? normalized : item))
        : [...catalog.bundles, normalized],
    };
    if (await persistCatalog(next, 'Bundle salvo e catálogo atualizado.'))
      setBundleDraft(null);
  }
  async function submitTestimonial(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveTestimonialDraft();
  }
  async function saveTestimonialDraft() {
    if (!testimonialDraft) return;
    if (
      testimonialDraft.name.trim().length < 2 ||
      testimonialDraft.text.trim().length < 5
    ) {
      setMessage('Informe o nome e um comentário válido antes de salvar.');
      return;
    }
    const id = testimonialDraft.id || crypto.randomUUID();
    const normalized = { ...testimonialDraft, id };
    const next = {
      ...catalog,
      testimonials: catalog.testimonials.some((item) => item.id === id)
        ? catalog.testimonials.map((item) =>
            item.id === id ? normalized : item,
          )
        : [...catalog.testimonials, normalized],
    };
    if (await persistCatalog(next, 'Prova social salva.'))
      setTestimonialDraft(null);
  }

  return (
    <div
      className={`admin-shell${active === 'Editor da página' ? ' editor-open' : ''}`}
    >
      {active !== 'Editor da página' && (
        <aside className="admin-sidebar">
          <div className="brand">
            <BrandLogo />
          </div>
          <small>ADMINISTRAÇÃO</small>
          <nav>
            {nav.map(([name, Icon]) => (
              <button
                type="button"
                key={name}
                className={active === name ? 'active' : ''}
                onClick={() => {
                  setActive(name);
                  setMessage('');
                }}
              >
                <Icon />
                {name}
                <ChevronRight />
              </button>
            ))}
          </nav>
          <button type="button" className="logout" onClick={logout}>
            <LogOut /> Sair
          </button>
        </aside>
      )}
      <main
        className={`admin-main${active === 'Editor da página' ? ' editor-mode' : ''}`}
      >
        {active !== 'Editor da página' && (
          <header>
            <div>
              <p className="eyebrow">PAINEL ADMINISTRATIVO</p>
              <h1>{active}</h1>
            </div>
            <a href="/" target="_blank">
              Ver loja
            </a>
          </header>
        )}

        {active === 'Visão geral' && (
          <>
            <div className="metric-grid">
              <article>
                <CircleDollarSign />
                <span>Receita confirmada</span>
                <strong>{money(revenue)}</strong>
                <small>Somente pedidos pagos</small>
              </article>
              <article>
                <ShoppingCart />
                <span>Pedidos</span>
                <strong>{orderCount}</strong>
                <small>Registros no banco</small>
              </article>
              <article>
                <Package />
                <span>Produtos ativos</span>
                <strong>{activeProducts}</strong>
                <small>{catalog.products.length} cadastrados</small>
              </article>
              <article>
                <Users />
                <span>Provas publicadas</span>
                <strong>
                  {catalog.testimonials.filter((item) => item.active).length}
                </strong>
                <small>Somente registros autorizados</small>
              </article>
            </div>
            <section className="admin-section">
              <h2>Operação da loja</h2>
              <div className="admin-checklist">
                <p>
                  <CheckCircle2 /> Catálogo, bundles e ofertas editáveis
                </p>
                <p>
                  <CheckCircle2 /> Capas e PDFs enviados ao armazenamento
                  privado
                </p>
                <p>
                  <CheckCircle2 /> Pedidos e receita sincronizados com
                  pagamentos
                </p>
                <p>
                  <CheckCircle2 /> Conteúdo, SEO, pixels e provas sociais
                  centralizados
                </p>
              </div>
            </section>
          </>
        )}

        {active === 'Pedidos' && (
          <section className="admin-section">
            <div className="section-actions">
              <div>
                <h2>Pedidos recentes</h2>
                <p className="admin-muted">
                  Até 50 registros, do mais recente para o mais antigo.
                </p>
              </div>
            </div>
            {recentOrders.length ? (
              <div className="admin-order-list">
                {recentOrders.map((order) => (
                  <article key={order.id}>
                    <div>
                      <strong>{order.orderNumber}</strong>
                      <small>
                        {new Date(order.createdAt).toLocaleString('pt-BR')}
                      </small>
                    </div>
                    <div>
                      <span>
                        {order.customerName || 'Cliente não informado'}
                      </span>
                      <small>
                        {order.customerEmail || 'Email ainda não recebido'}
                      </small>
                    </div>
                    <b data-status={order.paymentStatus}>
                      {order.paymentStatus === 'paid'
                        ? 'Pago'
                        : order.paymentStatus === 'refunded'
                          ? 'Reembolsado'
                          : 'Pendente'}
                    </b>
                    <strong>{money(order.total)}</strong>
                  </article>
                ))}
              </div>
            ) : (
              <div className="admin-empty">
                <ShoppingCart />
                <p>Nenhum pedido recebido ainda.</p>
              </div>
            )}
          </section>
        )}

        {active === 'Produtos' && (
          <section className="admin-section">
            <div className="section-actions">
              <div>
                <h2>Produtos e entregáveis</h2>
                <p className="admin-muted">
                  Cadastre a oferta, envie a capa e associe o PDF entregue após
                  a compra.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setProductDraft({
                    id: '',
                    name: '',
                    slug: '',
                    description: '',
                    price: 100,
                    category: 'Livro digital',
                    active: true,
                  })
                }
              >
                <Plus /> Adicionar produto
              </button>
            </div>
            {productDraft && (
              <form className="admin-editor" onSubmit={submitProduct}>
                <div className="admin-editor-heading">
                  <h3>{productDraft.id ? 'Editar produto' : 'Novo produto'}</h3>
                  <button
                    type="button"
                    aria-label="Fechar editor"
                    onClick={() => setProductDraft(null)}
                  >
                    <X />
                  </button>
                </div>
                <div className="form-grid">
                  <label>
                    Nome
                    <input
                      required
                      value={productDraft.name}
                      onChange={(event) =>
                        setProductDraft({
                          ...productDraft,
                          name: event.target.value,
                          slug:
                            productDraft.slug || slugify(event.target.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    Identificador
                    <input
                      required
                      disabled={Boolean(productDraft.id)}
                      value={productDraft.id}
                      onChange={(event) =>
                        setProductDraft({
                          ...productDraft,
                          id: slugify(event.target.value),
                        })
                      }
                      placeholder="exemplo-caderno"
                    />
                  </label>
                  <label>
                    Slug
                    <input
                      required
                      value={productDraft.slug}
                      onChange={(event) =>
                        setProductDraft({
                          ...productDraft,
                          slug: slugify(event.target.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    Categoria
                    <input
                      required
                      value={productDraft.category}
                      onChange={(event) =>
                        setProductDraft({
                          ...productDraft,
                          category: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Preço
                    <input
                      required
                      inputMode="decimal"
                      value={moneyInput(productDraft.price)}
                      onChange={(event) =>
                        setProductDraft({
                          ...productDraft,
                          price: toCents(event.target.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    Preço comparativo
                    <input
                      inputMode="decimal"
                      value={moneyInput(productDraft.compareAtPrice)}
                      onChange={(event) =>
                        setProductDraft({
                          ...productDraft,
                          compareAtPrice:
                            toCents(event.target.value) || undefined,
                        })
                      }
                    />
                  </label>
                  <label className="admin-wide">
                    Descrição
                    <textarea
                      required
                      value={productDraft.description}
                      onChange={(event) =>
                        setProductDraft({
                          ...productDraft,
                          description: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="admin-upload">
                    <ImagePlus /> Capa do produto
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const result = await upload(
                          file,
                          'cover',
                          productDraft.id || slugify(productDraft.name),
                        );
                        if (result?.url)
                          setProductDraft({
                            ...productDraft,
                            coverImage: result.url,
                          });
                      }}
                    />
                    <small>
                      {productDraft.coverImage
                        ? 'Capa enviada'
                        : 'JPG, PNG, WebP ou AVIF até 8 MB'}
                    </small>
                  </label>
                  <label className="admin-upload">
                    <Upload /> PDF entregável
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const result = await upload(
                          file,
                          'deliverable',
                          productDraft.id || slugify(productDraft.name),
                        );
                        if (result?.key)
                          setProductDraft({
                            ...productDraft,
                            digitalFile: result.key,
                            digitalFileName: result.fileName,
                          });
                      }}
                    />
                    <small>
                      {productDraft.digitalFileName || 'PDF até 50 MB'}
                    </small>
                  </label>
                  <label className="admin-check">
                    <input
                      type="checkbox"
                      checked={productDraft.active}
                      onChange={(event) =>
                        setProductDraft({
                          ...productDraft,
                          active: event.target.checked,
                        })
                      }
                    />{' '}
                    Produto ativo na loja
                  </label>
                </div>
                <button className="save-button" disabled={saving}>
                  <Save /> {saving ? 'Salvando...' : 'Salvar produto'}
                </button>
              </form>
            )}
            <div className="admin-card-list">
              {catalog.products.map((product) => (
                <article key={product.id}>
                  <div className="admin-cover">
                    {product.coverImage ? (
                      <Image
                        src={product.coverImage}
                        alt=""
                        width={58}
                        height={64}
                        unoptimized
                      />
                    ) : (
                      <BookOpen />
                    )}
                  </div>
                  <div>
                    <strong>{product.name}</strong>
                    <small>{product.category}</small>
                    <span>
                      {product.digitalFileName
                        ? `Entregável: ${product.digitalFileName}`
                        : 'Entregável pendente'}
                    </span>
                  </div>
                  <strong>{money(product.price)}</strong>
                  <b>{product.active ? 'Ativo' : 'Inativo'}</b>
                  <button
                    type="button"
                    onClick={() => setProductDraft({ ...product })}
                  >
                    Editar
                  </button>
                </article>
              ))}
            </div>
            {notice}
          </section>
        )}

        {active === 'Bundles' && (
          <section className="admin-section">
            <div className="section-actions">
              <div>
                <h2>Bundles</h2>
                <p className="admin-muted">
                  Monte coleções usando os produtos cadastrados.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setBundleDraft({
                    id: '',
                    name: '',
                    description: '',
                    productIds: [],
                    price: 100,
                    compareAtPrice: 100,
                    cta: 'QUERO ESTA COLEÇÃO',
                  })
                }
              >
                <Plus /> Adicionar bundle
              </button>
            </div>
            {bundleDraft && (
              <form className="admin-editor" onSubmit={submitBundle}>
                <div className="admin-editor-heading">
                  <h3>{bundleDraft.id ? 'Editar bundle' : 'Novo bundle'}</h3>
                  <button
                    type="button"
                    aria-label="Fechar editor"
                    onClick={() => setBundleDraft(null)}
                  >
                    <X />
                  </button>
                </div>
                <div className="form-grid">
                  <label>
                    Nome
                    <input
                      required
                      value={bundleDraft.name}
                      onChange={(event) =>
                        setBundleDraft({
                          ...bundleDraft,
                          name: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Identificador
                    <input
                      required
                      disabled={Boolean(bundleDraft.id)}
                      value={bundleDraft.id}
                      onChange={(event) =>
                        setBundleDraft({
                          ...bundleDraft,
                          id: slugify(event.target.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    Preço
                    <input
                      inputMode="decimal"
                      value={moneyInput(bundleDraft.price)}
                      onChange={(event) =>
                        setBundleDraft({
                          ...bundleDraft,
                          price: toCents(event.target.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    Valor avulso
                    <input
                      inputMode="decimal"
                      value={moneyInput(bundleDraft.compareAtPrice)}
                      onChange={(event) =>
                        setBundleDraft({
                          ...bundleDraft,
                          compareAtPrice: toCents(event.target.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    Selo
                    <input
                      value={bundleDraft.badge || ''}
                      onChange={(event) =>
                        setBundleDraft({
                          ...bundleDraft,
                          badge: event.target.value || undefined,
                        })
                      }
                    />
                  </label>
                  <label>
                    Texto do botão
                    <input
                      value={bundleDraft.cta}
                      onChange={(event) =>
                        setBundleDraft({
                          ...bundleDraft,
                          cta: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="admin-wide">
                    Descrição
                    <textarea
                      required
                      value={bundleDraft.description}
                      onChange={(event) =>
                        setBundleDraft({
                          ...bundleDraft,
                          description: event.target.value,
                        })
                      }
                    />
                  </label>
                  <fieldset className="admin-wide admin-products-field">
                    <legend>Produtos incluídos</legend>
                    {catalog.products.map((product) => (
                      <label key={product.id}>
                        <input
                          type="checkbox"
                          checked={bundleDraft.productIds.includes(product.id)}
                          onChange={(event) =>
                            setBundleDraft({
                              ...bundleDraft,
                              productIds: event.target.checked
                                ? [...bundleDraft.productIds, product.id]
                                : bundleDraft.productIds.filter(
                                    (id) => id !== product.id,
                                  ),
                            })
                          }
                        />
                        {product.name}
                      </label>
                    ))}
                  </fieldset>
                  <label className="admin-check">
                    <input
                      type="checkbox"
                      checked={Boolean(bundleDraft.recommended)}
                      onChange={(event) =>
                        setBundleDraft({
                          ...bundleDraft,
                          recommended: event.target.checked,
                        })
                      }
                    />{' '}
                    Destacar como recomendado
                  </label>
                </div>
                <button className="save-button" disabled={saving}>
                  <Save /> Salvar bundle
                </button>
              </form>
            )}
            <div className="admin-card-list">
              {catalog.bundles.map((bundle) => (
                <article key={bundle.id}>
                  <div className="admin-cover">
                    <Boxes />
                  </div>
                  <div>
                    <strong>{bundle.name}</strong>
                    <small>{bundle.productIds.length} produtos</small>
                    <span>{bundle.description}</span>
                  </div>
                  <strong>{money(bundle.price)}</strong>
                  <b>{bundle.recommended ? 'Recomendado' : 'Ativo'}</b>
                  <button
                    type="button"
                    onClick={() =>
                      setBundleDraft({
                        ...bundle,
                        productIds: [...bundle.productIds],
                      })
                    }
                  >
                    Editar
                  </button>
                </article>
              ))}
            </div>
            {notice}
          </section>
        )}

        {active === 'Order Bumps' && (
          <OfferEditor
            title="Oferta adicional do carrinho"
            offer={catalog.orderBump}
            products={catalog.products}
            saving={saving}
            message={message}
            onChange={(offer) => setCatalog({ ...catalog, orderBump: offer })}
            onSave={() => persistCatalog(catalog, 'Order bump salvo na loja.')}
          />
        )}
        {active === 'Carrinho' && (
          <>
            <form className="admin-section" onSubmit={saveConfig}>
              <div className="section-actions">
                <div>
                  <h2>Banners do carrinho</h2>
                  <p className="admin-muted">
                    Use uma arte para o carrinho vazio e outra para pedidos com
                    produtos.
                  </p>
                </div>
                <button type="submit" disabled={saving}>
                  <Save /> {saving ? 'Salvando...' : 'Salvar banners'}
                </button>
              </div>
              <div className="admin-cart-banners">
                <AdminImageField
                  label="Banner do carrinho vazio"
                  value={config.cartBannerEmpty}
                  aspect="wide"
                  onChange={(event) =>
                    void replacePageImage(
                      event.target.files?.[0],
                      'cartBannerEmpty',
                    )
                  }
                  onRemove={() => setConfig({ ...config, cartBannerEmpty: '' })}
                />
                <AdminImageField
                  label="Banner do carrinho com produtos"
                  value={config.cartBannerFilled}
                  aspect="wide"
                  onChange={(event) =>
                    void replacePageImage(
                      event.target.files?.[0],
                      'cartBannerFilled',
                    )
                  }
                  onRemove={() =>
                    setConfig({ ...config, cartBannerFilled: '' })
                  }
                />
              </div>
              {notice}
            </form>
            <OfferEditor
              title="Oferta para completar a coleção"
              offer={catalog.cartOffer}
              products={catalog.products}
              saving={saving}
              message={message}
              onChange={(offer) => setCatalog({ ...catalog, cartOffer: offer })}
              onSave={() =>
                persistCatalog(catalog, 'Oferta do carrinho salva na loja.')
              }
            />
          </>
        )}

        {active === 'Recuperação' && (
          <section className="admin-section">
            <div className="section-actions">
              <div>
                <h2>Ofertas progressivas</h2>
                <p className="admin-muted">
                  Cada etapa aparece depois que a cliente recusa a anterior.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setCatalog({
                    ...catalog,
                    exitOffers: [
                      ...catalog.exitOffers,
                      {
                        stage: catalog.exitOffers.length + 1,
                        banner: '',
                        headline: 'Nova condição especial',
                        description:
                          'Descreva a condição oferecida nesta etapa.',
                        bundleId: catalog.bundles[0]?.id || '',
                        discountPercent: 0,
                        cta: 'APROVEITAR OFERTA',
                      },
                    ],
                  })
                }
              >
                <Plus /> Adicionar etapa
              </button>
            </div>
            <div className="admin-recovery-list">
              {catalog.exitOffers.map((offer, index) => (
                <ExitOfferFields
                  key={offer.stage}
                  offer={offer}
                  bundles={catalog.bundles}
                  onChange={(next) =>
                    setCatalog({
                      ...catalog,
                      exitOffers: catalog.exitOffers.map((item, i) =>
                        i === index ? next : item,
                      ),
                    })
                  }
                  onBannerChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    void (async () => {
                      const result = await upload(
                        file,
                        'cover',
                        `recuperacao-etapa-${offer.stage}`,
                      );
                      if (!result?.url) return;
                      setCatalog((current) => ({
                        ...current,
                        exitOffers: current.exitOffers.map((item, i) =>
                          i === index ? { ...item, banner: result.url! } : item,
                        ),
                      }));
                      setMessage(
                        'Banner enviado. Salve as etapas para publicar.',
                      );
                    })();
                  }}
                  onBannerRemove={() =>
                    setCatalog({
                      ...catalog,
                      exitOffers: catalog.exitOffers.map((item, i) =>
                        i === index ? { ...item, banner: '' } : item,
                      ),
                    })
                  }
                />
              ))}
            </div>
            <button
              type="button"
              className="save-button"
              disabled={saving}
              onClick={() =>
                persistCatalog(catalog, 'Ofertas de recuperação salvas.')
              }
            >
              <Save /> Salvar etapas
            </button>
            {notice}
          </section>
        )}

        {active === 'Provas sociais' && (
          <section className="admin-section">
            <div className="section-actions">
              <div>
                <h2>Clientes e autorizações</h2>
                <p className="admin-muted">
                  Publique somente relatos e fotos autorizados.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setTestimonialDraft({
                    id: '',
                    name: '',
                    headline: '',
                    city: '',
                    text: '',
                    rating: 5,
                    active: false,
                  })
                }
              >
                <Plus /> Adicionar relato
              </button>
            </div>
            {testimonialDraft && (
              <form className="admin-editor" onSubmit={submitTestimonial}>
                <div className="admin-editor-heading">
                  <h3>
                    {testimonialDraft.id ? 'Editar relato' : 'Novo relato'}
                  </h3>
                  <button
                    type="button"
                    aria-label="Fechar editor"
                    onClick={() => setTestimonialDraft(null)}
                  >
                    <X />
                  </button>
                </div>
                <div className="form-grid">
                  <label>
                    Nome
                    <input
                      required
                      value={testimonialDraft.name}
                      onChange={(event) =>
                        setTestimonialDraft({
                          ...testimonialDraft,
                          name: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Cidade
                    <input
                      value={testimonialDraft.city || ''}
                      onChange={(event) =>
                        setTestimonialDraft({
                          ...testimonialDraft,
                          city: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="admin-wide">
                    Chamada curta
                    <input
                      value={testimonialDraft.headline || ''}
                      onChange={(event) =>
                        setTestimonialDraft({
                          ...testimonialDraft,
                          headline: event.target.value,
                        })
                      }
                      placeholder="Exemplo: Meu ritual de toda semana"
                    />
                  </label>
                  <label>
                    Avaliação
                    <select
                      value={testimonialDraft.rating}
                      onChange={(event) =>
                        setTestimonialDraft({
                          ...testimonialDraft,
                          rating: Number(event.target.value),
                        })
                      }
                    >
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>
                          {value} estrelas
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-wide">
                    Relato
                    <textarea
                      required
                      value={testimonialDraft.text}
                      onChange={(event) =>
                        setTestimonialDraft({
                          ...testimonialDraft,
                          text: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="admin-upload admin-wide">
                    <ImagePlus /> Foto autorizada da cliente
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const result = await upload(
                          file,
                          'cover',
                          `cliente-${testimonialDraft.id || slugify(testimonialDraft.name)}`,
                        );
                        if (result?.url)
                          setTestimonialDraft({
                            ...testimonialDraft,
                            photo: result.url,
                          });
                      }}
                    />
                    <small>
                      {testimonialDraft.photo
                        ? 'Foto enviada'
                        : 'JPG, PNG, WebP ou AVIF até 8 MB'}
                    </small>
                  </label>
                  <label className="admin-check">
                    <input
                      type="checkbox"
                      checked={testimonialDraft.active}
                      onChange={(event) =>
                        setTestimonialDraft({
                          ...testimonialDraft,
                          active: event.target.checked,
                        })
                      }
                    />{' '}
                    Autorizado e publicado
                  </label>
                </div>
                <button className="save-button" disabled={saving}>
                  <Save /> Salvar relato
                </button>
              </form>
            )}
            {catalog.testimonials.length ? (
              <div className="admin-card-list">
                {catalog.testimonials.map((item) => (
                  <article key={item.id}>
                    <div className="admin-cover">
                      <Users />
                    </div>
                    <div>
                      <strong>{item.name}</strong>
                      <small>
                        {item.city || 'Cidade não informada'} · {item.rating}{' '}
                        estrelas
                      </small>
                      <span>{item.text}</span>
                    </div>
                    <b>{item.active ? 'Publicado' : 'Rascunho'}</b>
                    <button
                      type="button"
                      onClick={() => setTestimonialDraft({ ...item })}
                    >
                      Editar
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="admin-empty">
                <Users />
                <p>
                  Nenhum relato cadastrado. Adicione somente provas reais e
                  autorizadas.
                </p>
              </div>
            )}
            {notice}
          </section>
        )}

        {active === 'Editor da página' && (
          <form className="admin-section page-editor" onSubmit={saveConfig}>
            <div className="page-editor-toolbar">
              <div className="page-editor-toolbar-heading">
                <button
                  type="button"
                  className="page-editor-back"
                  onClick={() => {
                    setActive('Visão geral');
                    setMessage('');
                  }}
                >
                  <ArrowLeft /> Voltar ao painel
                </button>
                <div>
                  <p className="eyebrow">PÁGINA DE VENDAS</p>
                  <h2>Editor da página</h2>
                </div>
              </div>
              <div className="page-editor-primary-actions">
                <a href="/" target="_blank">
                  Ver loja
                </a>
                <button className="save-button" disabled={saving}>
                  <Save />
                  {saving ? 'Salvando...' : 'Salvar página'}
                </button>
              </div>
            </div>
            <div
              className={`page-editor-workspace${selectedEditorField ? ' has-inspector' : ''}`}
            >
              <aside className="page-editor-tree" aria-label="Seções da página">
                {(
                  [
                    ['offer', 'Faixa de oferta', Megaphone],
                    ['navigation', 'Menu', Columns3],
                    ['hero', 'Seção principal', ImagePlus],
                    ['proof', 'Faixa de benefícios', CheckCircle2],
                    ['pain', 'Problemas', MessageSquareQuote],
                    ['contents', 'Conteúdos', BookOpen],
                    ['benefits', 'Benefícios', CheckCircle2],
                    ['story', 'História da Tereza', BookOpen],
                    ['offers', 'Ofertas', CircleDollarSign],
                    ['gallery', 'Fotos de clientes', Images],
                    ['comparison', 'Comparação', Columns3],
                    ['comments', 'Comentários', MessageSquareQuote],
                    ['faq', 'Dúvidas', MessageSquareQuote],
                    ['footer', 'Rodapé', FileText],
                    ['cart', 'Carrinho', ShoppingCart],
                  ] as const
                ).map(([id, label, Icon]) => (
                  <button
                    type="button"
                    className={editorSection === id ? 'active' : ''}
                    aria-pressed={editorSection === id}
                    key={String(id)}
                    onClick={() => {
                      setEditorSection(id as EditorSection);
                      setSelectedEditorField(null);
                    }}
                  >
                    <Icon />
                    <span>{String(label)}</span>
                    <ChevronRight />
                  </button>
                ))}
                <div className="page-editor-blocks">
                  {(
                    {
                      offer: [['urgencyText', 'Mensagem da oferta']],
                      navigation: [['navLabels', 'Links do menu']],
                      hero: [
                        ['heroBadge', 'Selo'],
                        ['heroTitle', 'Título'],
                        ['heroSubtitle', 'Apresentação'],
                        ['heroImage', 'Imagem'],
                        ['ctaText', 'Botão'],
                        ['heroBenefits', 'Destaques'],
                        ['heroPrice', 'Preço'],
                        ['heroMicrocopy', 'Segurança'],
                        ['heroCard', 'Selo da imagem'],
                      ],
                      proof: [['proofItems', 'Itens da faixa']],
                      pain: [['painHeading', 'Introdução'], ['painItems', 'Cards']],
                      contents: [['contentsHeading', 'Introdução'], ['contentsItems', 'Cards']],
                      benefits: [['benefitsHeading', 'Título'], ['benefitsItems', 'Lista']],
                      story: [['founderImage', 'Foto da autora'], ['founderContent', 'Textos']],
                      offers: [['collectionHeading', 'Introdução'], ['collectionBenefits', 'Benefícios']],
                      gallery: [['galleryCopy', 'Título'], ['gallery', 'Galeria rolante']],
                      comparison: [
                        ['comparisonEyebrow', 'Selo'],
                        ['comparisonTitle', 'Título'],
                        ['comparisonDescription', 'Descrição'],
                        ['comparisonCtaText', 'Botão'],
                        ['comparisonColumns', 'Colunas'],
                        ['comparisonItems', 'Itens comparados'],
                        ['comparisonNote', 'Observação'],
                      ],
                      comments: [
                        ['commentsEyebrow', 'Selo'],
                        ['commentsTitle', 'Título'],
                        ['commentsSubtitle', 'Texto de apoio'],
                        ['commentsEmpty', 'Estado vazio'],
                        ['commentsList', 'Relatos'],
                      ],
                      faq: [['faqHeading', 'Título'], ['faqItems', 'Perguntas']],
                      footer: [['footerText', 'Apresentação'], ['footerSocial', 'Redes sociais'], ['footerCopyright', 'Direitos autorais']],
                      cart: [
                        ['cartBannerEmpty', 'Banner vazio'],
                        ['cartBannerFilled', 'Banner com produtos'],
                        ['cartEmptyContent', 'Estado vazio'],
                        ['cartBumpCopy', 'Oferta adicional'],
                        ['cartOfferCopy', 'Oferta complementar'],
                        ['cartSummaryCopy', 'Resumo e pagamento'],
                      ],
                    }[editorSection] as [EditorField, string][]
                  ).map(([field, label]) => (
                    <button
                      type="button"
                      className={`page-editor-block${selectedEditorField === field ? ' active' : ''}`}
                      key={field}
                      onClick={() => selectEditorField(field)}
                    >
                      <span className="page-editor-block-dot" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </aside>
              <section className="page-editor-canvas">
                <div className="page-editor-canvas-toolbar">
                  <span>Clique em um texto ou imagem para editar</span>
                  <div className="page-editor-device-buttons">
                    <select
                      aria-label="Conteúdo da prévia"
                      value={previewSurface}
                      onChange={(event) => setPreviewSurface(event.target.value as typeof previewSurface)}
                    >
                      <option value="page">Página de vendas</option>
                      <option value="cart-empty">Carrinho vazio</option>
                      <option value="cart-filled">Carrinho com produtos</option>
                    </select>
                    <button
                      type="button"
                      className={previewDevice === 'desktop' ? 'active' : ''}
                      aria-label="Visualizar como computador"
                      onClick={() => setPreviewDevice('desktop')}
                    >
                      <Monitor />
                    </button>
                    <button
                      type="button"
                      className={previewDevice === 'mobile' ? 'active' : ''}
                      aria-label="Visualizar como celular"
                      onClick={() => setPreviewDevice('mobile')}
                    >
                      <Smartphone />
                    </button>
                    <button
                      type="button"
                      aria-label="Atualizar prévia"
                      onClick={() => {
                        previewRef.current?.contentWindow?.location.reload();
                      }}
                    >
                      <RefreshCw />
                    </button>
                  </div>
                </div>
                <div
                  ref={previewFrameRef}
                  className={`page-editor-frame ${previewDevice}`}
                >
                  <iframe
                    key={previewSurface}
                    ref={previewRef}
                    src={previewSurface === 'page' ? '/?editorPreview=1' : `/?editorPreview=1&editorCart=${previewSurface === 'cart-empty' ? 'empty' : 'filled'}`}
                    title="Prévia editável da página de vendas"
                    style={
                      previewDevice === 'desktop'
                        ? {
                            width: 1280,
                            minWidth: 1280,
                            height: `${desktopPreviewHeight / desktopPreviewScale}px`,
                            transform: `scale(${desktopPreviewScale})`,
                            transformOrigin: 'top center',
                          }
                        : undefined
                    }
                    onLoad={() => {
                      updatePreview();
                      window.setTimeout(() => {
                        updatePreview();
                        previewRef.current?.contentWindow?.postMessage(
                          {
                            type: 'vovo-editor-highlight',
                            field: selectedEditorField,
                          },
                          window.location.origin,
                        );
                      }, 250);
                    }}
                  />
                </div>
              </section>
              {selectedEditorField && (
                <section className="page-editor-inspector">
                  {editorSection === 'navigation' && (
                    <div className="page-editor-fields">
                      <header><Columns3 /><div><h3>Menu principal</h3><p>Edite os nomes dos links de navegação.</p></div></header>
                      {stringList('navLabels', ['Início', 'Segundo link', 'Terceiro link', 'Quarto link'])}
                    </div>
                  )}
                  {editorSection === 'offer' && (
                    <div className="page-editor-fields">
                      <header>
                        <Megaphone />
                        <div>
                          <h3>Faixa de oferta</h3>
                          <p>Mensagem exibida no topo da loja.</p>
                        </div>
                      </header>
                      {input('urgencyText', 'Mensagem de exclusividade', true)}
                    </div>
                  )}
                  {editorSection === 'hero' && (
                    <div className="page-editor-fields">
                      <header>
                        {selectedEditorField === 'heroImage' ? (
                          <ImagePlus />
                        ) : (
                          <FileText />
                        )}
                        <div>
                          <h3>{editorFieldLabels[selectedEditorField]}</h3>
                          <p>Alterações aparecem imediatamente na prévia.</p>
                        </div>
                      </header>
                      {selectedEditorField === 'heroImage' && (
                        <AdminImageField
                          label="Imagem principal"
                          value={config.heroImage}
                          aspect="wide"
                          onChange={(event) =>
                            void replacePageImage(
                              event.target.files?.[0],
                              'heroImage',
                            )
                          }
                          onRemove={() =>
                            setConfig({ ...config, heroImage: '' })
                          }
                        />
                      )}
                      {selectedEditorField === 'heroBadge' &&
                        input('heroBadge', 'Selo acima do título')}
                      {selectedEditorField === 'heroTitle' &&
                        input('heroTitle', 'Título principal', true)}
                      {selectedEditorField === 'heroSubtitle' &&
                        input('heroSubtitle', 'Texto de apresentação', true)}
                      {selectedEditorField === 'ctaText' &&
                        input('ctaText', 'Texto do botão')}
                      {selectedEditorField === 'heroBenefits' &&
                        stringList('heroBenefits', ['Destaque 1', 'Destaque 2', 'Destaque 3', 'Destaque 4'])}
                      {selectedEditorField === 'heroPrice' && <>
                        {input('heroPriceLabel', 'Texto acima do preço')}
                        {input('heroPriceSuffix', 'Texto ao lado do preço')}
                      </>}
                      {selectedEditorField === 'heroMicrocopy' && input('heroMicrocopy', 'Mensagem de segurança', true)}
                      {selectedEditorField === 'heroCard' && <>
                        {input('heroCardTitle', 'Título do selo')}
                        {input('heroCardSubtitle', 'Texto do selo')}
                      </>}
                    </div>
                  )}
                  {editorSection === 'proof' && (
                    <div className="page-editor-fields">
                      <header><CheckCircle2 /><div><h3>Faixa de benefícios</h3><p>Itens exibidos na faixa rolante.</p></div></header>
                      {stringList('proofItems', ['Item 1', 'Item 2', 'Item 3'])}
                    </div>
                  )}
                  {editorSection === 'pain' && (
                    <div className="page-editor-fields">
                      <header><MessageSquareQuote /><div><h3>{editorFieldLabels[selectedEditorField]}</h3><p>Conteúdo da seção de identificação.</p></div></header>
                      {selectedEditorField === 'painHeading' && <>{input('painEyebrow', 'Selo')}{input('painTitle', 'Título', true)}{input('painDescription', 'Descrição', true)}</>}
                      {selectedEditorField === 'painItems' && cardList('painItems')}
                    </div>
                  )}
                  {editorSection === 'contents' && (
                    <div className="page-editor-fields">
                      <header><BookOpen /><div><h3>{editorFieldLabels[selectedEditorField]}</h3><p>Conteúdo da apresentação dos cadernos.</p></div></header>
                      {selectedEditorField === 'contentsHeading' && <>{input('contentsEyebrow', 'Selo')}{input('contentsTitle', 'Título', true)}{input('contentsDescription', 'Descrição', true)}</>}
                      {selectedEditorField === 'contentsItems' && cardList('contentsItems')}
                    </div>
                  )}
                  {editorSection === 'benefits' && (
                    <div className="page-editor-fields">
                      <header><CheckCircle2 /><div><h3>{editorFieldLabels[selectedEditorField]}</h3><p>Benefícios apresentados na página.</p></div></header>
                      {selectedEditorField === 'benefitsHeading' && <>{input('benefitsEyebrow', 'Selo')}{input('benefitsTitle', 'Título', true)}</>}
                      {selectedEditorField === 'benefitsItems' && cardList('benefitsItems')}
                    </div>
                  )}
                  {editorSection === 'story' && (
                    <div className="page-editor-fields">
                      <header>
                        <BookOpen />
                        <div>
                          <h3>História da Tereza</h3>
                          <p>Foto da autora usada na apresentação da marca.</p>
                        </div>
                      </header>
                      {selectedEditorField === 'founderImage' && (
                        <AdminImageField
                          label="Foto da Vovó Tereza"
                          value={config.founderImage}
                          aspect="portrait"
                          onChange={(event) =>
                            void replacePageImage(event.target.files?.[0], 'founderImage')
                          }
                          onRemove={() => setConfig({ ...config, founderImage: '' })}
                        />
                      )}
                      {selectedEditorField === 'founderContent' && <>
                        {input('founderEyebrow', 'Selo')}
                        {input('founderTitle', 'Título', true)}
                        {input('founderBodyOne', 'Primeiro parágrafo', true)}
                        {input('founderBodyTwo', 'Segundo parágrafo', true)}
                        {input('founderSignature', 'Assinatura')}
                        {input('founderCtaText', 'Texto do botão')}
                      </>}
                    </div>
                  )}
                  {editorSection === 'offers' && (
                    <div className="page-editor-fields">
                      <header><CircleDollarSign /><div><h3>{editorFieldLabels[selectedEditorField]}</h3><p>Textos gerais das ofertas; produtos e preços ficam nas áreas próprias.</p></div></header>
                      {selectedEditorField === 'collectionHeading' && <>{input('collectionEyebrow', 'Selo')}{input('collectionTitle', 'Título', true)}{input('collectionSubtitle', 'Descrição', true)}{input('collectionCtaText', 'Texto do botão')}{input('paymentNote', 'Observação do pagamento', true)}</>}
                      {selectedEditorField === 'collectionBenefits' && stringList('collectionBenefits', ['Benefício 1', 'Benefício 2', 'Benefício 3', 'Benefício 4'])}
                    </div>
                  )}
                  {editorSection === 'gallery' && (
                    <div className="page-editor-fields">
                      <header>
                        <Images />
                        <div>
                          <h3>Fotos de clientes</h3>
                          <p>
                            As imagens aparecem na faixa rolante de prova
                            social.
                          </p>
                        </div>
                      </header>
                      {selectedEditorField === 'gallery' && <label className="admin-gallery-add">
                        <ImagePlus />
                        <span>Adicionar fotos</span>
                        <small>
                          Selecione uma ou várias imagens JPG, PNG, WebP ou
                          AVIF.
                        </small>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          multiple
                          onChange={(event) => {
                            void addCustomerPhotos(event.target.files);
                            event.target.value = '';
                          }}
                        />
                      </label>}
                      {selectedEditorField === 'galleryCopy' && <>
                        {input('galleryEyebrow', 'Selo')}
                        {input('galleryTitle', 'Título na página')}
                        {input('cartGalleryTitle', 'Título no carrinho')}
                      </>}
                      {selectedEditorField === 'gallery' && (config.customerPhotos.length ? (
                        <div className="admin-gallery-grid">
                          {config.customerPhotos.map((photo, index) => (
                            <article
                              className="admin-gallery-card"
                              key={photo.id}
                            >
                              <div className="admin-gallery-preview">
                                <Image
                                  src={photo.src}
                                  alt={photo.alt}
                                  fill
                                  sizes="180px"
                                  unoptimized
                                />
                                <span>
                                  {String(index + 1).padStart(2, '0')}
                                </span>
                              </div>
                              <label>
                                Texto alternativo
                                <input
                                  value={photo.alt}
                                  onChange={(event) =>
                                    setConfig({
                                      ...config,
                                      customerPhotos: config.customerPhotos.map(
                                        (item) =>
                                          item.id === photo.id
                                            ? {
                                                ...item,
                                                alt: event.target.value,
                                              }
                                            : item,
                                      ),
                                    })
                                  }
                                />
                              </label>
                              <div className="admin-gallery-actions">
                                <label>
                                  <Upload /> Trocar
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/avif"
                                    onChange={(event) => {
                                      void replaceCustomerPhoto(
                                        photo.id,
                                        event.target.files?.[0],
                                      );
                                      event.target.value = '';
                                    }}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setConfig({
                                      ...config,
                                      customerPhotos:
                                        config.customerPhotos.filter(
                                          (item) => item.id !== photo.id,
                                        ),
                                    })
                                  }
                                >
                                  <Trash2 /> Apagar
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="admin-gallery-empty">
                          <Images />
                          <strong>Nenhuma foto adicionada</strong>
                          <span>
                            Use somente imagens reais e autorizadas pelas
                            clientes.
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {editorSection === 'comparison' && (
                    <div className="page-editor-fields">
                      <header>
                        <Columns3 />
                        <div>
                          <h3>{editorFieldLabels[selectedEditorField]}</h3>
                          <p>Alterações aparecem imediatamente na prévia.</p>
                        </div>
                      </header>
                      {selectedEditorField === 'comparisonEyebrow' &&
                        input('comparisonEyebrow', 'Selo acima do título')}
                      {selectedEditorField === 'comparisonTitle' &&
                        input('comparisonTitle', 'Título da comparação', true)}
                      {selectedEditorField === 'comparisonDescription' &&
                        input(
                          'comparisonDescription',
                          'Texto de apresentação',
                          true,
                        )}
                      {selectedEditorField === 'comparisonCtaText' &&
                        input('comparisonCtaText', 'Texto do botão')}
                      {selectedEditorField === 'comparisonColumns' && (
                        <div className="comparison-columns-editor">
                          {input(
                            'comparisonFeatureLabel',
                            'Nome da coluna de características',
                          )}
                          {input(
                            'comparisonPrimaryLabel',
                            'Nome da coluna principal',
                          )}
                          {input(
                            'comparisonSecondaryLabel',
                            'Nome da segunda coluna',
                          )}
                        </div>
                      )}
                      {selectedEditorField === 'comparisonItems' && (
                        <div className="comparison-items-editor">
                          {config.comparisonItems.map((item, index) => (
                            <div key={index}>
                              <label>
                                Item {index + 1}
                                <input
                                  value={item}
                                  onChange={(event) =>
                                    setConfig({
                                      ...config,
                                      comparisonItems:
                                        config.comparisonItems.map(
                                          (current, currentIndex) =>
                                            currentIndex === index
                                              ? event.target.value
                                              : current,
                                        ),
                                    })
                                  }
                                />
                              </label>
                              <button
                                type="button"
                                aria-label={`Apagar item ${index + 1}`}
                                disabled={config.comparisonItems.length === 1}
                                onClick={() =>
                                  setConfig({
                                    ...config,
                                    comparisonItems:
                                      config.comparisonItems.filter(
                                        (_, currentIndex) =>
                                          currentIndex !== index,
                                      ),
                                  })
                                }
                              >
                                <Trash2 />
                              </button>
                            </div>
                          ))}
                          {config.comparisonItems.length < 10 && (
                            <button
                              type="button"
                              className="comparison-add-item"
                              onClick={() =>
                                setConfig({
                                  ...config,
                                  comparisonItems: [
                                    ...config.comparisonItems,
                                    'Novo item da comparação',
                                  ],
                                })
                              }
                            >
                              <Plus /> Adicionar item
                            </button>
                          )}
                        </div>
                      )}
                      {selectedEditorField === 'comparisonNote' &&
                        input('comparisonNote', 'Observação responsável', true)}
                    </div>
                  )}
                  {editorSection === 'comments' && (
                    <div className="page-editor-fields">
                      <header>
                        <MessageSquareQuote />
                        <div>
                          <h3>{editorFieldLabels[selectedEditorField]}</h3>
                          <p>Use somente comentários reais e autorizados.</p>
                        </div>
                      </header>
                      {selectedEditorField === 'commentsEyebrow' &&
                        input('commentsEyebrow', 'Selo acima do título')}
                      {selectedEditorField === 'commentsTitle' &&
                        input('commentsTitle', 'Título dos comentários', true)}
                      {selectedEditorField === 'commentsSubtitle' &&
                        input('commentsSubtitle', 'Texto de apoio', true)}
                      {selectedEditorField === 'commentsEmpty' && <>
                        {input('commentsEmptyTitle', 'Título do estado vazio')}
                        {input('commentsEmptyText', 'Texto do estado vazio', true)}
                      </>}
                      {selectedEditorField === 'commentsList' && (
                        <div className="comments-admin-editor">
                          <button
                            type="button"
                            className="comments-admin-add"
                            onClick={() =>
                              setTestimonialDraft({
                                id: '',
                                name: '',
                                headline: '',
                                city: '',
                                text: '',
                                rating: 5,
                                active: false,
                              })
                            }
                          >
                            <Plus /> Adicionar comentário
                          </button>
                          {testimonialDraft && (
                            <div className="comments-admin-form">
                              <div className="comments-admin-form-heading">
                                <strong>
                                  {testimonialDraft.id
                                    ? 'Editar comentário'
                                    : 'Novo comentário'}
                                </strong>
                                <button
                                  type="button"
                                  aria-label="Fechar edição do comentário"
                                  onClick={() => setTestimonialDraft(null)}
                                >
                                  <X />
                                </button>
                              </div>
                              <label>
                                Nome da cliente
                                <input
                                  value={testimonialDraft.name}
                                  onChange={(event) =>
                                    setTestimonialDraft({
                                      ...testimonialDraft,
                                      name: event.target.value,
                                    })
                                  }
                                />
                              </label>
                              <label>
                                Cidade
                                <input
                                  value={testimonialDraft.city || ''}
                                  onChange={(event) =>
                                    setTestimonialDraft({
                                      ...testimonialDraft,
                                      city: event.target.value,
                                    })
                                  }
                                />
                              </label>
                              <label>
                                Chamada curta
                                <input
                                  value={testimonialDraft.headline || ''}
                                  onChange={(event) =>
                                    setTestimonialDraft({
                                      ...testimonialDraft,
                                      headline: event.target.value,
                                    })
                                  }
                                  placeholder="Exemplo: Meu ritual de toda semana"
                                />
                              </label>
                              <label>
                                Avaliação
                                <select
                                  value={testimonialDraft.rating}
                                  onChange={(event) =>
                                    setTestimonialDraft({
                                      ...testimonialDraft,
                                      rating: Number(event.target.value),
                                    })
                                  }
                                >
                                  {[5, 4, 3, 2, 1].map((value) => (
                                    <option key={value} value={value}>
                                      {value} estrelas
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label>
                                Comentário
                                <textarea
                                  value={testimonialDraft.text}
                                  onChange={(event) =>
                                    setTestimonialDraft({
                                      ...testimonialDraft,
                                      text: event.target.value,
                                    })
                                  }
                                />
                              </label>
                              <label className="admin-check">
                                <input
                                  type="checkbox"
                                  checked={testimonialDraft.active}
                                  onChange={(event) =>
                                    setTestimonialDraft({
                                      ...testimonialDraft,
                                      active: event.target.checked,
                                    })
                                  }
                                />
                                Autorizado e publicado
                              </label>
                              <button
                                type="button"
                                className="save-button"
                                disabled={saving}
                                onClick={() => void saveTestimonialDraft()}
                              >
                                <Save /> Salvar comentário
                              </button>
                            </div>
                          )}
                          <div className="comments-admin-list">
                            {catalog.testimonials.map((item) => (
                              <article key={item.id}>
                                <div>
                                  <strong>{item.name}</strong>
                                  <span>
                                    {item.active ? 'Publicado' : 'Rascunho'} ·{' '}
                                    {item.rating} estrelas
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setTestimonialDraft({ ...item })
                                  }
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  aria-label={`Apagar comentário de ${item.name}`}
                                  onClick={() =>
                                    void persistCatalog(
                                      {
                                        ...catalog,
                                        testimonials:
                                          catalog.testimonials.filter(
                                            (current) => current.id !== item.id,
                                          ),
                                      },
                                      'Comentário removido.',
                                    )
                                  }
                                >
                                  <Trash2 />
                                </button>
                              </article>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {editorSection === 'faq' && (
                    <div className="page-editor-fields">
                      <header><MessageSquareQuote /><div><h3>{editorFieldLabels[selectedEditorField]}</h3><p>Edite o título ou cada pergunta exibida.</p></div></header>
                      {selectedEditorField === 'faqHeading' && <>{input('faqEyebrow', 'Selo')}{input('faqTitle', 'Título', true)}</>}
                      {selectedEditorField === 'faqItems' && (
                        <div className="page-editor-card-fields">
                          {config.faqItems.map((item, index) => (
                            <fieldset key={`faq-${index}`}>
                              <legend>Pergunta {index + 1}</legend>
                              <label>Pergunta<input value={item.question} onChange={(event) => setConfig({...config, faqItems: config.faqItems.map((current, itemIndex) => itemIndex === index ? {...current, question: event.target.value} : current)})} /></label>
                              <label>Resposta<textarea value={item.answer} onChange={(event) => setConfig({...config, faqItems: config.faqItems.map((current, itemIndex) => itemIndex === index ? {...current, answer: event.target.value} : current)})} /></label>
                            </fieldset>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {editorSection === 'footer' && (
                    <div className="page-editor-fields">
                      <header><FileText /><div><h3>{editorFieldLabels[selectedEditorField]}</h3><p>Conteúdo final da página.</p></div></header>
                      {selectedEditorField === 'footerText' && input('footerText', 'Texto do rodapé', true)}
                      {selectedEditorField === 'footerSocial' && <>{input('facebookUrl', 'Facebook')}{input('instagramUrl', 'Instagram')}{input('tiktokUrl', 'TikTok')}{input('youtubeUrl', 'YouTube')}</>}
                      {selectedEditorField === 'footerCopyright' && input('footerCopyright', 'Direitos autorais')}
                    </div>
                  )}
                  {editorSection === 'cart' && (
                    <div className="page-editor-fields">
                      <header><ShoppingCart /><div><h3>{editorFieldLabels[selectedEditorField]}</h3><p>Alterações aparecem no estado correspondente do carrinho.</p></div></header>
                      {selectedEditorField === 'cartBannerEmpty' && (
                        <AdminImageField label="Banner do carrinho vazio" value={config.cartBannerEmpty} aspect="wide" onChange={(event) => void replacePageImage(event.target.files?.[0], 'cartBannerEmpty')} onRemove={() => setConfig({...config, cartBannerEmpty: ''})} />
                      )}
                      {selectedEditorField === 'cartBannerFilled' && (
                        <AdminImageField label="Banner do carrinho com produtos" value={config.cartBannerFilled} aspect="wide" onChange={(event) => void replacePageImage(event.target.files?.[0], 'cartBannerFilled')} onRemove={() => setConfig({...config, cartBannerFilled: ''})} />
                      )}
                      {selectedEditorField === 'cartEmptyContent' && <>{input('cartEmptyTitle', 'Título')}{input('cartEmptyText', 'Descrição', true)}{input('cartEmptyCtaText', 'Texto do botão')}{input('cartEmptyNote', 'Observação', true)}</>}
                      {selectedEditorField === 'cartBumpCopy' && <>
                        {input('cartBumpEyebrow', 'Selo')}
                        <label>Título<input value={catalog.orderBump.headline} onChange={(event) => setCatalog({...catalog, orderBump: {...catalog.orderBump, headline: event.target.value}})} /></label>
                        <label>Descrição<textarea value={catalog.orderBump.description} onChange={(event) => setCatalog({...catalog, orderBump: {...catalog.orderBump, description: event.target.value}})} /></label>
                        {input('cartBumpRecipeLabel', 'Selo da receita')}{input('cartAddCtaPrefix', 'Prefixo do botão')}
                        {cardList('cartBumpRecipes')}
                      </>}
                      {selectedEditorField === 'cartOfferCopy' && <>
                        {input('cartOfferEyebrow', 'Selo')}
                        <label>Título<input value={catalog.cartOffer.headline} onChange={(event) => setCatalog({...catalog, cartOffer: {...catalog.cartOffer, headline: event.target.value}})} /></label>
                        <label>Descrição<textarea value={catalog.cartOffer.description} onChange={(event) => setCatalog({...catalog, cartOffer: {...catalog.cartOffer, description: event.target.value}})} /></label>
                        {input('cartOfferRecipeLabel', 'Selo da receita')}{input('cartAddCtaPrefix', 'Prefixo do botão')}
                        {cardList('cartOfferRecipes')}
                      </>}
                      {selectedEditorField === 'cartSummaryCopy' && <>{input('cartSubtotalLabel', 'Subtotal')}{input('cartSavingsLabel', 'Economia')}{input('cartSecurityText', 'Mensagem de segurança', true)}{input('cartCheckoutCtaText', 'Botão de pagamento')}{input('cartCheckoutLoadingText', 'Botão durante carregamento')}{input('paymentSecurityText', 'Texto de segurança do pagamento')}{input('paymentNote', 'Observação das formas de pagamento', true)}{input('cartRemoveText', 'Texto para remover item')}{input('cartBundleItemLabel', 'Descrição de bundle')}{input('cartProductItemLabel', 'Descrição de produto')}</>}
                    </div>
                  )}
                </section>
              )}
            </div>
            {notice}
          </form>
        )}

        {['SEO e palavras-chave', 'Pixels'].includes(active) && (
          <form className="admin-section admin-form" onSubmit={saveConfig}>
            <div className="section-actions">
              <h2>{active}</h2>
              <button className="save-button" disabled={saving}>
                <Save />
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
            {active === 'SEO e palavras-chave' && (
              <div className="form-grid">
                {input('seoTitle', 'Título SEO')}
                {input('seoDescription', 'Meta description', true)}
                {input('keyword', 'Palavra-chave principal')}
                <div className="keyword-card">
                  <KeyRound />
                  <div>
                    <strong>{config.keyword}</strong>
                    <span>SEO · produto · página de vendas</span>
                  </div>
                  <b>Prioridade alta</b>
                </div>
              </div>
            )}
            {active === 'Pixels' && (
              <div className="form-grid">
                {input('metaPixelId', 'Meta Pixel ID')}
                {input('googleAnalyticsId', 'Google Analytics ID')}
                {input('tiktokPixelId', 'TikTok Pixel ID')}
                <p className="helper">
                  IDs vazios não carregam scripts na loja.
                </p>
              </div>
            )}
            {notice}
          </form>
        )}
      </main>
    </div>
  );
}

function AdminImageField({
  label,
  value,
  aspect,
  onChange,
  onRemove,
}: {
  label: string;
  value: string;
  aspect: 'wide' | 'portrait';
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="admin-image-field">
      <div className={`admin-image-preview ${aspect}`}>
        {value ? (
          <Image src={value} alt="" fill sizes="520px" unoptimized />
        ) : (
          <div>
            <ImagePlus />
            <span>Nenhuma imagem</span>
          </div>
        )}
      </div>
      <div className="admin-image-meta">
        <strong>{label}</strong>
        <span>
          {value
            ? 'A imagem atual será mantida até você salvar a página.'
            : 'Adicione uma imagem para exibir esta área na loja.'}
        </span>
        <div className="admin-image-actions">
          <label>
            <Upload /> {value ? 'Trocar imagem' : 'Adicionar imagem'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(event) => {
                onChange(event);
                event.target.value = '';
              }}
            />
          </label>
          {value && (
            <button type="button" onClick={onRemove}>
              <Trash2 /> Apagar imagem
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function OfferEditor({
  title,
  offer,
  products,
  saving,
  message,
  onChange,
  onSave,
}: {
  title: string;
  offer: CatalogConfig['orderBump'];
  products: Product[];
  saving: boolean;
  message: string;
  onChange: (offer: CatalogConfig['orderBump']) => void;
  onSave: () => void;
}) {
  return (
    <section className="admin-section">
      <div className="section-actions">
        <div>
          <h2>{title}</h2>
          <p className="admin-muted">
            O preço e o produto são validados novamente no servidor.
          </p>
        </div>
        <button
          type="button"
          className="save-button"
          disabled={saving}
          onClick={onSave}
        >
          <Save /> Salvar oferta
        </button>
      </div>
      <div className="form-grid">
        <label>
          Título
          <input
            value={offer.headline}
            onChange={(event) =>
              onChange({ ...offer, headline: event.target.value })
            }
          />
        </label>
        <label>
          Produto
          <select
            value={offer.productId}
            onChange={(event) =>
              onChange({ ...offer, productId: event.target.value })
            }
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Preço
          <input
            inputMode="decimal"
            value={moneyInput(offer.price)}
            onChange={(event) =>
              onChange({ ...offer, price: toCents(event.target.value) })
            }
          />
        </label>
        <label className="admin-wide">
          Descrição
          <textarea
            value={offer.description}
            onChange={(event) =>
              onChange({ ...offer, description: event.target.value })
            }
          />
        </label>
      </div>
      {message && (
        <output
          className={message.includes('salv') ? 'save-success' : 'form-error'}
        >
          {message}
        </output>
      )}
    </section>
  );
}

function ExitOfferFields({
  offer,
  bundles,
  onChange,
  onBannerChange,
  onBannerRemove,
}: {
  offer: ExitOffer;
  bundles: Bundle[];
  onChange: (offer: ExitOffer) => void;
  onBannerChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBannerRemove: () => void;
}) {
  return (
    <article>
      <strong>Etapa {offer.stage}</strong>
      <AdminImageField
        label={`Banner da ${offer.stage}ª fuga`}
        value={offer.banner || ''}
        aspect="wide"
        onChange={onBannerChange}
        onRemove={onBannerRemove}
      />
      <div className="form-grid">
        <label>
          Título
          <input
            value={offer.headline}
            onChange={(event) =>
              onChange({ ...offer, headline: event.target.value })
            }
          />
        </label>
        <label>
          Bundle
          <select
            value={offer.bundleId}
            onChange={(event) =>
              onChange({ ...offer, bundleId: event.target.value })
            }
          >
            {bundles.map((bundle) => (
              <option key={bundle.id} value={bundle.id}>
                {bundle.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Desconto em porcentagem
          <input
            type="number"
            min="0"
            max="90"
            value={offer.discountPercent}
            onChange={(event) =>
              onChange({
                ...offer,
                discountPercent: Number(event.target.value),
              })
            }
          />
        </label>
        <label>
          Texto do botão
          <input
            value={offer.cta}
            onChange={(event) =>
              onChange({ ...offer, cta: event.target.value })
            }
          />
        </label>
        <label className="admin-wide">
          Descrição
          <textarea
            value={offer.description}
            onChange={(event) =>
              onChange({ ...offer, description: event.target.value })
            }
          />
        </label>
      </div>
    </article>
  );
}
