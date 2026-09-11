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
  ArrowDown,
  ArrowUp,
  BarChart3,
  BookOpen,
  Boxes,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Columns3,
  FileText,
  Eye,
  EyeOff,
  ImagePlus,
  Images,
  KeyRound,
  LogOut,
  Menu,
  MailCheck,
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
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const AnalyticsOverview = dynamic(
  () =>
    import('./analytics-overview').then((module) => module.AnalyticsOverview),
  {
    ssr: false,
    loading: () => (
      <output className="admin-overview is-loading">
        <div className="analytics-card">Carregando visão geral…</div>
      </output>
    ),
  },
);

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

type StripeIntegrationStatus = {
  configured: boolean;
  embeddedCheckoutConfigured: boolean;
  secretKeyHint: string;
  publishableKeyHint: string;
  webhookConfigured: boolean;
  webhookSecretHint: string;
  mode: 'test' | 'live' | null;
  accountId: string;
  accountName: string;
  source: 'panel' | 'environment' | null;
  updatedAt: string;
};

type ResendIntegrationStatus = {
  configured: boolean;
  apiKeyHint: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  source: 'panel' | 'environment' | null;
  updatedAt: string;
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
  | 'cart'
  | 'recovery';
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
  | 'cartSummaryCopy'
  | 'recoveryStage1'
  | 'recoveryStage2'
  | 'recoveryStage3';

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
  recoveryStage1: 'Primeiro popup de recuperação',
  recoveryStage2: 'Segundo popup de recuperação',
  recoveryStage3: 'Terceiro popup de recuperação',
};

const editorSections = [
  ['offer', 'Faixa de oferta', Megaphone],
  ['navigation', 'Menu', Columns3],
  ['hero', 'Seção principal', ImagePlus],
  ['proof', 'Faixa de benefícios', CheckCircle2],
  ['pain', 'Problemas', MessageSquareQuote],
  ['contents', 'Conteúdos', BookOpen],
  ['comments', 'Comentários', MessageSquareQuote],
  ['benefits', 'Benefícios', CheckCircle2],
  ['story', 'História da Tereza', BookOpen],
  ['offers', 'Ofertas', CircleDollarSign],
  ['gallery', 'Fotos de clientes', Images],
  ['comparison', 'Comparação', Columns3],
  ['faq', 'Dúvidas', MessageSquareQuote],
  ['footer', 'Rodapé', FileText],
  ['cart', 'Carrinho', ShoppingCart],
  ['recovery', 'Popups de recuperação', Megaphone],
] as const;

const firstEditorField: Record<EditorSection, EditorField> = {
  offer: 'urgencyText',
  navigation: 'navLabels',
  hero: 'heroBadge',
  proof: 'proofItems',
  pain: 'painHeading',
  contents: 'contentsHeading',
  comments: 'commentsTitle',
  benefits: 'benefitsHeading',
  story: 'founderImage',
  offers: 'collectionHeading',
  gallery: 'galleryCopy',
  comparison: 'comparisonTitle',
  faq: 'faqHeading',
  footer: 'footerText',
  cart: 'cartBannerEmpty',
  recovery: 'recoveryStage1',
};

const reorderableEditorSections = new Set<EditorSection>([
  'hero',
  'proof',
  'pain',
  'contents',
  'comments',
  'benefits',
  'story',
  'offers',
  'comparison',
  'faq',
]);
const hideableEditorSections = new Set<EditorSection>([
  'offer',
  'navigation',
  'hero',
  'proof',
  'pain',
  'contents',
  'comments',
  'benefits',
  'story',
  'offers',
  'gallery',
  'comparison',
  'faq',
  'footer',
]);

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
  ["API's", KeyRound],
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
  const [stripeStatus, setStripeStatus] =
    useState<StripeIntegrationStatus | null>(null);
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState('');
  const [stripeLoading, setStripeLoading] = useState(true);
  const [stripeWebhookUrl, setStripeWebhookUrl] = useState('');
  const [resendStatus, setResendStatus] =
    useState<ResendIntegrationStatus | null>(null);
  const [resendApiKey, setResendApiKey] = useState('');
  const [resendFromName, setResendFromName] = useState('Vovó Tereza');
  const [resendFromEmail, setResendFromEmail] = useState('');
  const [resendReplyTo, setResendReplyTo] = useState('');
  const [resendLoading, setResendLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [editorSection, setEditorSection] = useState<EditorSection>('hero');
  const [selectedEditorField, setSelectedEditorField] =
    useState<EditorField | null>('heroBadge');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>(
    'desktop',
  );
  const [previewSurface, setPreviewSurface] = useState<
    | 'page'
    | 'cart-empty'
    | 'cart-filled'
    | 'recovery-1'
    | 'recovery-2'
    | 'recovery-3'
  >('page');
  const previewRef = useRef<HTMLIFrameElement>(null);
  const previewFrameRef = useRef<HTMLDivElement>(null);
  const [desktopPreviewScale, setDesktopPreviewScale] = useState(1);
  const [desktopPreviewHeight, setDesktopPreviewHeight] = useState(700);
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
      recoveryStage1: 'recovery',
      recoveryStage2: 'recovery',
      recoveryStage3: 'recovery',
    };
    setSelectedEditorField(field);
    setEditorSection(sectionByField[field]);
    if (sectionByField[field] === 'cart') {
      setPreviewSurface(
        field === 'cartBannerEmpty' || field === 'cartEmptyContent'
          ? 'cart-empty'
          : 'cart-filled',
      );
    } else if (sectionByField[field] === 'recovery') {
      const stage = field.slice(-1) as '1' | '2' | '3';
      setPreviewSurface(`recovery-${stage}`);
    } else {
      setPreviewSurface('page');
    }
  }
  function selectEditorSection(section: EditorSection) {
    selectEditorField(firstEditorField[section]);
  }
  function moveEditorSection(section: EditorSection, direction: -1 | 1) {
    if (!reorderableEditorSections.has(section)) return;
    setConfig((current) => {
      const order = [...current.pageSectionOrder];
      const index = order.indexOf(section as (typeof order)[number]);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= order.length)
        return current;
      [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
      return { ...current, pageSectionOrder: order };
    });
  }
  function toggleEditorSection(section: EditorSection) {
    if (!hideableEditorSections.has(section)) return;
    setConfig((current) => ({
      ...current,
      hiddenSections: current.hiddenSections.includes(
        section as (typeof current.hiddenSections)[number],
      )
        ? current.hiddenSections.filter((item) => item !== section)
        : [
            ...current.hiddenSections,
            section as (typeof current.hiddenSections)[number],
          ],
    }));
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
      if (field in editorFieldLabels) selectEditorField(field);
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

  useEffect(() => {
    if (active !== "API's") return;
    let cancelled = false;
    Promise.all([
      fetch('/api/admin/integrations/stripe').then(async (response) => {
        const data = (await response.json()) as {
          status?: StripeIntegrationStatus;
          webhookUrl?: string;
          error?: string;
        };
        if (!response.ok)
          throw new Error(data.error || 'Falha ao carregar a Stripe.');
        if (!cancelled) {
          setStripeStatus(data.status || null);
          setStripeWebhookUrl(data.webhookUrl || '');
        }
      }),
      fetch('/api/admin/integrations/resend').then(async (response) => {
        const data = (await response.json()) as {
          status?: ResendIntegrationStatus;
          error?: string;
        };
        if (!response.ok)
          throw new Error(data.error || 'Falha ao carregar a Resend.');
        if (!cancelled) {
          const status = data.status || null;
          setResendStatus(status);
          setResendFromName(status?.fromName || 'Vovó Tereza');
          setResendFromEmail(status?.fromEmail || '');
          setResendReplyTo(status?.replyTo || '');
        }
      }),
    ])
      .catch((error: unknown) => {
        if (!cancelled)
          setMessage(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar as integrações.',
          );
      })
      .finally(() => {
        if (!cancelled) {
          setStripeLoading(false);
          setResendLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [active]);

  async function saveStripeIntegration(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      (!stripeSecretKey && !stripeStatus?.configured) ||
      (!stripePublishableKey && !stripeStatus?.embeddedCheckoutConfigured)
    ) {
      setMessage(
        'Informe as chaves secreta e publicável da Stripe antes de salvar.',
      );
      return;
    }
    setStripeLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/integrations/stripe', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          secretKey: stripeSecretKey,
          publishableKey: stripePublishableKey,
          webhookSecret: stripeWebhookSecret,
        }),
      });
      const data = (await response.json()) as {
        status?: StripeIntegrationStatus;
        webhookUrl?: string;
        error?: string;
      };
      if (response.ok) {
        setStripeStatus(data.status || null);
        setStripeWebhookUrl(data.webhookUrl || stripeWebhookUrl);
        setStripeSecretKey('');
        setStripePublishableKey('');
        setStripeWebhookSecret('');
        setMessage('Configuração da Stripe salva e validada.');
      } else {
        setMessage(data.error || 'Não foi possível salvar a Stripe.');
      }
    } catch {
      setMessage(
        'Não foi possível se comunicar com o servidor. Tente novamente.',
      );
    } finally {
      setStripeLoading(false);
    }
  }

  async function saveResendIntegration(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resendApiKey && !resendStatus?.configured) {
      setMessage('Informe a chave de API da Resend antes de salvar.');
      return;
    }
    setResendLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/integrations/resend', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          apiKey: resendApiKey,
          fromName: resendFromName,
          fromEmail: resendFromEmail,
          replyTo: resendReplyTo,
        }),
      });
      const data = (await response.json()) as {
        status?: ResendIntegrationStatus;
        error?: string;
      };
      if (!response.ok)
        throw new Error(data.error || 'Não foi possível salvar a Resend.');
      setResendStatus(data.status || null);
      setResendApiKey('');
      setMessage('Configuração da Resend salva e validada.');
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível se comunicar com o servidor.',
      );
    } finally {
      setResendLoading(false);
    }
  }

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
  async function optimizeImage(file: File) {
    if (!file.type.startsWith('image/')) return file;
    try {
      const bitmap = await createImageBitmap(file);
      const maximumEdge = 2000;
      const scale = Math.min(
        1,
        maximumEdge / Math.max(bitmap.width, bitmap.height),
      );
      if (scale === 1 && file.size <= 500 * 1024) {
        bitmap.close();
        return file;
      }
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      if (!context) {
        bitmap.close();
        return file;
      }
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/webp', 0.84),
      );
      if (!blob || blob.size >= file.size) return file;
      return new File(
        [blob],
        `${file.name.replace(/\.[^.]+$/, '') || 'imagem'}.webp`,
        { type: 'image/webp', lastModified: file.lastModified },
      );
    } catch {
      return file;
    }
  }
  async function upload(
    file: File,
    kind: 'cover' | 'deliverable',
    productId: string,
  ) {
    setSaving(true);
    setMessage(
      kind === 'cover' ? 'Otimizando imagem...' : 'Enviando entregável...',
    );
    const uploadFile = kind === 'cover' ? await optimizeImage(file) : file;
    if (kind === 'cover') setMessage('Enviando imagem otimizada...');
    const body = new FormData();
    body.set('file', uploadFile);
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
  async function replaceRecoveryBanner(index: number, file?: File) {
    if (!file) return;
    const offer = catalog.exitOffers[index];
    if (!offer) return;
    const result = await upload(
      file,
      'cover',
      `recuperacao-etapa-${offer.stage}`,
    );
    if (!result?.url) return;
    setCatalog((current) => ({
      ...current,
      exitOffers: current.exitOffers.map((item, itemIndex) =>
        itemIndex === index ? { ...item, banner: result.url! } : item,
      ),
    }));
    setMessage('Banner pronto. Salve a página para publicar a alteração.');
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
    key: {
      [K in keyof Config]: Config[K] extends string ? K : never;
    }[keyof Config],
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
        <div className="page-editor-list-row" key={`${key}-${index}`}>
          <label>
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
          <div className="page-editor-item-actions">
            <button
              type="button"
              aria-label={`Mover item ${index + 1} para cima`}
              disabled={index === 0}
              onClick={() => {
                const items = [...config[key]];
                [items[index - 1], items[index]] = [
                  items[index],
                  items[index - 1],
                ];
                setConfig({ ...config, [key]: items });
              }}
            >
              <ArrowUp aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={`Mover item ${index + 1} para baixo`}
              disabled={index === config[key].length - 1}
              onClick={() => {
                const items = [...config[key]];
                [items[index], items[index + 1]] = [
                  items[index + 1],
                  items[index],
                ];
                setConfig({ ...config, [key]: items });
              }}
            >
              <ArrowDown aria-hidden="true" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
  const cardList = (
    key:
      | 'painItems'
      | 'contentsItems'
      | 'benefitsItems'
      | 'cartBumpRecipes'
      | 'cartOfferRecipes',
  ) => (
    <div className="page-editor-card-fields">
      {config[key].map((item, index) => (
        <fieldset key={`${key}-${index}`}>
          <legend>Card {index + 1}</legend>
          <div className="page-editor-item-actions">
            <button
              type="button"
              aria-label={`Mover card ${index + 1} para cima`}
              disabled={index === 0}
              onClick={() => {
                const items = [...config[key]];
                [items[index - 1], items[index]] = [
                  items[index],
                  items[index - 1],
                ];
                setConfig({ ...config, [key]: items });
              }}
            >
              <ArrowUp aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={`Mover card ${index + 1} para baixo`}
              disabled={index === config[key].length - 1}
              onClick={() => {
                const items = [...config[key]];
                [items[index], items[index + 1]] = [
                  items[index + 1],
                  items[index],
                ];
                setConfig({ ...config, [key]: items });
              }}
            >
              <ArrowDown aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={`Apagar card ${index + 1}`}
              disabled={config[key].length === 1}
              onClick={() =>
                setConfig({
                  ...config,
                  [key]: config[key].filter(
                    (_, itemIndex) => itemIndex !== index,
                  ),
                })
              }
            >
              <Trash2 aria-hidden="true" />
            </button>
          </div>
          <label>
            Título
            <input
              value={item.title}
              onChange={(event) =>
                setConfig({
                  ...config,
                  [key]: config[key].map((current, itemIndex) =>
                    itemIndex === index
                      ? { ...current, title: event.target.value }
                      : current,
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
                    itemIndex === index
                      ? { ...current, text: event.target.value }
                      : current,
                  ),
                })
              }
            />
          </label>
        </fieldset>
      ))}
      {config[key].length <
        (key === 'painItems'
          ? 6
          : key === 'contentsItems' || key === 'benefitsItems'
            ? 8
            : 12) && (
        <button
          type="button"
          className="page-editor-add-item"
          onClick={() =>
            setConfig({
              ...config,
              [key]: [
                ...config[key],
                {
                  title: 'Novo card',
                  text: 'Edite este texto para apresentar o conteúdo.',
                },
              ],
            })
          }
        >
          <Plus aria-hidden="true" /> Adicionar card
        </button>
      )}
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
        <aside className={`admin-sidebar${mobileNavOpen ? ' nav-open' : ''}`}>
          <div className="admin-sidebar-head">
            <div className="brand">
              <BrandLogo />
            </div>
            <div className="admin-sidebar-title">
              <small>ADMINISTRAÇÃO</small>
              <strong>{active}</strong>
            </div>
            <button
              type="button"
              className="admin-menu-toggle"
              aria-label={mobileNavOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileNavOpen}
              aria-controls="admin-navigation"
              onClick={() => setMobileNavOpen((current) => !current)}
            >
              {mobileNavOpen ? <X /> : <Menu />}
              <span className="sr-only">
                {mobileNavOpen ? 'Fechar menu' : 'Abrir menu'}
              </span>
            </button>
          </div>
          <nav id="admin-navigation">
            {nav.map(([name, Icon]) => (
              <button
                type="button"
                key={name}
                className={active === name ? 'active' : ''}
                onClick={() => {
                  setActive(name);
                  setMessage('');
                  if (name === "API's") setStripeLoading(true);
                  setMobileNavOpen(false);
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
            <a href="/receitas" target="_blank">
              Ver loja
            </a>
          </header>
        )}

        {active === 'Visão geral' && <AnalyticsOverview />}

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
                    void replaceRecoveryBanner(index, event.target.files?.[0]);
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
                <a href="/receitas" target="_blank">
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
                <div className="page-editor-tree-heading">
                  <div>
                    <strong>Estrutura da página</strong>
                    <span>Mova ou oculte blocos com segurança.</span>
                  </div>
                  <button
                    type="button"
                    className="page-editor-reset"
                    onClick={() =>
                      setConfig((current) => ({
                        ...current,
                        pageSectionOrder: [
                          'hero',
                          'proof',
                          'pain',
                          'contents',
                          'comments',
                          'benefits',
                          'story',
                          'offers',
                          'comparison',
                          'faq',
                        ],
                        hiddenSections: [],
                      }))
                    }
                  >
                    <RefreshCw aria-hidden="true" /> Restaurar
                  </button>
                </div>
                {editorSections.map(([id, label, Icon]) => {
                  const isHidden = config.hiddenSections.includes(
                    id as (typeof config.hiddenSections)[number],
                  );
                  const orderIndex = config.pageSectionOrder.indexOf(
                    id as (typeof config.pageSectionOrder)[number],
                  );
                  return (
                    <div
                      className={`page-editor-section-row${isHidden ? ' is-hidden' : ''}`}
                      key={id}
                    >
                      <button
                        type="button"
                        className={`page-editor-section-select${editorSection === id ? ' active' : ''}`}
                        aria-pressed={editorSection === id}
                        onClick={() => selectEditorSection(id)}
                      >
                        <Icon aria-hidden="true" />
                        <span>{label}</span>
                        {isHidden && <small>Oculta</small>}
                        <ChevronRight aria-hidden="true" />
                      </button>
                      <div className="page-editor-section-actions">
                        {reorderableEditorSections.has(id) && (
                          <>
                            <button
                              type="button"
                              aria-label={`Mover ${label} para cima`}
                              disabled={orderIndex <= 0}
                              onClick={() => moveEditorSection(id, -1)}
                            >
                              <ArrowUp aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              aria-label={`Mover ${label} para baixo`}
                              disabled={
                                orderIndex ===
                                config.pageSectionOrder.length - 1
                              }
                              onClick={() => moveEditorSection(id, 1)}
                            >
                              <ArrowDown aria-hidden="true" />
                            </button>
                          </>
                        )}
                        {hideableEditorSections.has(id) && (
                          <button
                            type="button"
                            aria-label={`${isHidden ? 'Exibir' : 'Ocultar'} ${label}`}
                            aria-pressed={isHidden}
                            onClick={() => toggleEditorSection(id)}
                          >
                            {isHidden ? (
                              <Eye aria-hidden="true" />
                            ) : (
                              <EyeOff aria-hidden="true" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
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
                      pain: [
                        ['painHeading', 'Introdução'],
                        ['painItems', 'Cards'],
                      ],
                      contents: [
                        ['contentsHeading', 'Introdução'],
                        ['contentsItems', 'Cards'],
                      ],
                      benefits: [
                        ['benefitsHeading', 'Título'],
                        ['benefitsItems', 'Lista'],
                      ],
                      story: [
                        ['founderImage', 'Foto da autora'],
                        ['founderContent', 'Textos'],
                      ],
                      offers: [
                        ['collectionHeading', 'Introdução'],
                        ['collectionBenefits', 'Benefícios'],
                      ],
                      gallery: [
                        ['galleryCopy', 'Título'],
                        ['gallery', 'Galeria rolante'],
                      ],
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
                      faq: [
                        ['faqHeading', 'Título'],
                        ['faqItems', 'Perguntas'],
                      ],
                      footer: [
                        ['footerText', 'Apresentação'],
                        ['footerSocial', 'Redes sociais'],
                        ['footerCopyright', 'Direitos autorais'],
                      ],
                      cart: [
                        ['cartBannerEmpty', 'Banner vazio'],
                        ['cartBannerFilled', 'Banner com produtos'],
                        ['cartEmptyContent', 'Estado vazio'],
                        ['cartBumpCopy', 'Oferta adicional'],
                        ['cartOfferCopy', 'Oferta complementar'],
                        ['cartSummaryCopy', 'Resumo e pagamento'],
                      ],
                      recovery: [
                        ['recoveryStage1', 'Primeira fuga'],
                        ['recoveryStage2', 'Segunda fuga'],
                        ['recoveryStage3', 'Terceira fuga'],
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
                      onChange={(event) =>
                        setPreviewSurface(
                          event.target.value as typeof previewSurface,
                        )
                      }
                    >
                      <option value="page">Página de vendas</option>
                      <option value="cart-empty">Carrinho vazio</option>
                      <option value="cart-filled">Carrinho com produtos</option>
                      <option value="recovery-1">Popup — primeira fuga</option>
                      <option value="recovery-2">Popup — segunda fuga</option>
                      <option value="recovery-3">Popup — terceira fuga</option>
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
                    src={
                      previewSurface === 'page'
                        ? '/receitas?editorPreview=1'
                        : previewSurface.startsWith('recovery-')
                          ? `/receitas?editorPreview=1&editorExit=${previewSurface.slice(-1)}`
                          : `/receitas?editorPreview=1&editorCart=${previewSurface === 'cart-empty' ? 'empty' : 'filled'}`
                    }
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
                      <header>
                        <Columns3 />
                        <div>
                          <h3>Menu principal</h3>
                          <p>Edite os nomes dos links de navegação.</p>
                        </div>
                      </header>
                      {stringList('navLabels', [
                        'Início',
                        'Segundo link',
                        'Terceiro link',
                        'Quarto link',
                      ])}
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
                        stringList('heroBenefits', [
                          'Destaque 1',
                          'Destaque 2',
                          'Destaque 3',
                          'Destaque 4',
                        ])}
                      {selectedEditorField === 'heroPrice' && (
                        <>
                          {input('heroPriceLabel', 'Texto acima do preço')}
                          {input('heroPriceSuffix', 'Texto ao lado do preço')}
                        </>
                      )}
                      {selectedEditorField === 'heroMicrocopy' &&
                        input('heroMicrocopy', 'Mensagem de segurança', true)}
                      {selectedEditorField === 'heroCard' && (
                        <>
                          {input('heroCardTitle', 'Título do selo')}
                          {input('heroCardSubtitle', 'Texto do selo')}
                        </>
                      )}
                    </div>
                  )}
                  {editorSection === 'proof' && (
                    <div className="page-editor-fields">
                      <header>
                        <CheckCircle2 />
                        <div>
                          <h3>Faixa de benefícios</h3>
                          <p>Itens exibidos na faixa rolante.</p>
                        </div>
                      </header>
                      {stringList('proofItems', ['Item 1', 'Item 2', 'Item 3'])}
                    </div>
                  )}
                  {editorSection === 'pain' && (
                    <div className="page-editor-fields">
                      <header>
                        <MessageSquareQuote />
                        <div>
                          <h3>{editorFieldLabels[selectedEditorField]}</h3>
                          <p>Conteúdo da seção de identificação.</p>
                        </div>
                      </header>
                      {selectedEditorField === 'painHeading' && (
                        <>
                          {input('painEyebrow', 'Selo')}
                          {input('painTitle', 'Título', true)}
                          {input('painDescription', 'Descrição', true)}
                        </>
                      )}
                      {selectedEditorField === 'painItems' &&
                        cardList('painItems')}
                    </div>
                  )}
                  {editorSection === 'contents' && (
                    <div className="page-editor-fields">
                      <header>
                        <BookOpen />
                        <div>
                          <h3>{editorFieldLabels[selectedEditorField]}</h3>
                          <p>Conteúdo da apresentação dos cadernos.</p>
                        </div>
                      </header>
                      {selectedEditorField === 'contentsHeading' && (
                        <>
                          {input('contentsEyebrow', 'Selo')}
                          {input('contentsTitle', 'Título', true)}
                          {input('contentsDescription', 'Descrição', true)}
                        </>
                      )}
                      {selectedEditorField === 'contentsItems' &&
                        cardList('contentsItems')}
                    </div>
                  )}
                  {editorSection === 'benefits' && (
                    <div className="page-editor-fields">
                      <header>
                        <CheckCircle2 />
                        <div>
                          <h3>{editorFieldLabels[selectedEditorField]}</h3>
                          <p>Benefícios apresentados na página.</p>
                        </div>
                      </header>
                      {selectedEditorField === 'benefitsHeading' && (
                        <>
                          {input('benefitsEyebrow', 'Selo')}
                          {input('benefitsTitle', 'Título', true)}
                        </>
                      )}
                      {selectedEditorField === 'benefitsItems' &&
                        cardList('benefitsItems')}
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
                            void replacePageImage(
                              event.target.files?.[0],
                              'founderImage',
                            )
                          }
                          onRemove={() =>
                            setConfig({ ...config, founderImage: '' })
                          }
                        />
                      )}
                      {selectedEditorField === 'founderContent' && (
                        <>
                          {input('founderEyebrow', 'Selo')}
                          {input('founderTitle', 'Título', true)}
                          {input('founderBodyOne', 'Primeiro parágrafo', true)}
                          {input('founderBodyTwo', 'Segundo parágrafo', true)}
                          {input('founderSignature', 'Assinatura')}
                          {input('founderCtaText', 'Texto do botão')}
                        </>
                      )}
                    </div>
                  )}
                  {editorSection === 'offers' && (
                    <div className="page-editor-fields">
                      <header>
                        <CircleDollarSign />
                        <div>
                          <h3>{editorFieldLabels[selectedEditorField]}</h3>
                          <p>
                            Textos gerais das ofertas; produtos e preços ficam
                            nas áreas próprias.
                          </p>
                        </div>
                      </header>
                      {selectedEditorField === 'collectionHeading' && (
                        <>
                          {input('collectionEyebrow', 'Selo')}
                          {input('collectionTitle', 'Título', true)}
                          {input('collectionSubtitle', 'Descrição', true)}
                          {input('collectionCtaText', 'Texto do botão')}
                          {input(
                            'paymentNote',
                            'Observação do pagamento',
                            true,
                          )}
                        </>
                      )}
                      {selectedEditorField === 'collectionBenefits' &&
                        stringList('collectionBenefits', [
                          'Benefício 1',
                          'Benefício 2',
                          'Benefício 3',
                          'Benefício 4',
                        ])}
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
                      {selectedEditorField === 'gallery' && (
                        <label className="admin-gallery-add">
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
                        </label>
                      )}
                      {selectedEditorField === 'galleryCopy' && (
                        <>
                          {input('galleryEyebrow', 'Selo')}
                          {input('galleryTitle', 'Título na página')}
                          {input('cartGalleryTitle', 'Título no carrinho')}
                        </>
                      )}
                      {selectedEditorField === 'gallery' &&
                        (config.customerPhotos.length ? (
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
                                        customerPhotos:
                                          config.customerPhotos.map((item) =>
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
                      {selectedEditorField === 'commentsEmpty' && (
                        <>
                          {input(
                            'commentsEmptyTitle',
                            'Título do estado vazio',
                          )}
                          {input(
                            'commentsEmptyText',
                            'Texto do estado vazio',
                            true,
                          )}
                        </>
                      )}
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
                      <header>
                        <MessageSquareQuote />
                        <div>
                          <h3>{editorFieldLabels[selectedEditorField]}</h3>
                          <p>Edite o título ou cada pergunta exibida.</p>
                        </div>
                      </header>
                      {selectedEditorField === 'faqHeading' && (
                        <>
                          {input('faqEyebrow', 'Selo')}
                          {input('faqTitle', 'Título', true)}
                        </>
                      )}
                      {selectedEditorField === 'faqItems' && (
                        <div className="page-editor-card-fields">
                          {config.faqItems.map((item, index) => (
                            <fieldset key={`faq-${index}`}>
                              <legend>Pergunta {index + 1}</legend>
                              <div className="page-editor-item-actions">
                                <button
                                  type="button"
                                  aria-label={`Mover pergunta ${index + 1} para cima`}
                                  disabled={index === 0}
                                  onClick={() => {
                                    const items = [...config.faqItems];
                                    [items[index - 1], items[index]] = [
                                      items[index],
                                      items[index - 1],
                                    ];
                                    setConfig({ ...config, faqItems: items });
                                  }}
                                >
                                  <ArrowUp aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  aria-label={`Mover pergunta ${index + 1} para baixo`}
                                  disabled={
                                    index === config.faqItems.length - 1
                                  }
                                  onClick={() => {
                                    const items = [...config.faqItems];
                                    [items[index], items[index + 1]] = [
                                      items[index + 1],
                                      items[index],
                                    ];
                                    setConfig({ ...config, faqItems: items });
                                  }}
                                >
                                  <ArrowDown aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  aria-label={`Apagar pergunta ${index + 1}`}
                                  disabled={config.faqItems.length === 1}
                                  onClick={() =>
                                    setConfig({
                                      ...config,
                                      faqItems: config.faqItems.filter(
                                        (_, itemIndex) => itemIndex !== index,
                                      ),
                                    })
                                  }
                                >
                                  <Trash2 aria-hidden="true" />
                                </button>
                              </div>
                              <label>
                                Pergunta
                                <input
                                  value={item.question}
                                  onChange={(event) =>
                                    setConfig({
                                      ...config,
                                      faqItems: config.faqItems.map(
                                        (current, itemIndex) =>
                                          itemIndex === index
                                            ? {
                                                ...current,
                                                question: event.target.value,
                                              }
                                            : current,
                                      ),
                                    })
                                  }
                                />
                              </label>
                              <label>
                                Resposta
                                <textarea
                                  value={item.answer}
                                  onChange={(event) =>
                                    setConfig({
                                      ...config,
                                      faqItems: config.faqItems.map(
                                        (current, itemIndex) =>
                                          itemIndex === index
                                            ? {
                                                ...current,
                                                answer: event.target.value,
                                              }
                                            : current,
                                      ),
                                    })
                                  }
                                />
                              </label>
                            </fieldset>
                          ))}
                          {config.faqItems.length < 12 && (
                            <button
                              type="button"
                              className="page-editor-add-item"
                              onClick={() =>
                                setConfig({
                                  ...config,
                                  faqItems: [
                                    ...config.faqItems,
                                    {
                                      question: 'Nova pergunta',
                                      answer:
                                        'Escreva aqui uma resposta clara para a cliente.',
                                    },
                                  ],
                                })
                              }
                            >
                              <Plus aria-hidden="true" /> Adicionar pergunta
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {editorSection === 'footer' && (
                    <div className="page-editor-fields">
                      <header>
                        <FileText />
                        <div>
                          <h3>{editorFieldLabels[selectedEditorField]}</h3>
                          <p>Conteúdo final da página.</p>
                        </div>
                      </header>
                      {selectedEditorField === 'footerText' &&
                        input('footerText', 'Texto do rodapé', true)}
                      {selectedEditorField === 'footerSocial' && (
                        <>
                          {input('facebookUrl', 'Facebook')}
                          {input('instagramUrl', 'Instagram')}
                          {input('tiktokUrl', 'TikTok')}
                          {input('youtubeUrl', 'YouTube')}
                        </>
                      )}
                      {selectedEditorField === 'footerCopyright' &&
                        input('footerCopyright', 'Direitos autorais')}
                    </div>
                  )}
                  {editorSection === 'cart' && (
                    <div className="page-editor-fields">
                      <header>
                        <ShoppingCart />
                        <div>
                          <h3>{editorFieldLabels[selectedEditorField]}</h3>
                          <p>
                            Alterações aparecem no estado correspondente do
                            carrinho.
                          </p>
                        </div>
                      </header>
                      {selectedEditorField === 'cartBannerEmpty' && (
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
                          onRemove={() =>
                            setConfig({ ...config, cartBannerEmpty: '' })
                          }
                        />
                      )}
                      {selectedEditorField === 'cartBannerFilled' && (
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
                      )}
                      {selectedEditorField === 'cartEmptyContent' && (
                        <>
                          {input('cartEmptyTitle', 'Título')}
                          {input('cartEmptyText', 'Descrição', true)}
                          {input('cartEmptyCtaText', 'Texto do botão')}
                          {input('cartEmptyNote', 'Observação', true)}
                        </>
                      )}
                      {selectedEditorField === 'cartBumpCopy' && (
                        <>
                          {input('cartBumpEyebrow', 'Selo')}
                          <label>
                            Título
                            <input
                              value={catalog.orderBump.headline}
                              onChange={(event) =>
                                setCatalog({
                                  ...catalog,
                                  orderBump: {
                                    ...catalog.orderBump,
                                    headline: event.target.value,
                                  },
                                })
                              }
                            />
                          </label>
                          <label>
                            Descrição
                            <textarea
                              value={catalog.orderBump.description}
                              onChange={(event) =>
                                setCatalog({
                                  ...catalog,
                                  orderBump: {
                                    ...catalog.orderBump,
                                    description: event.target.value,
                                  },
                                })
                              }
                            />
                          </label>
                          {input('cartBumpRecipeLabel', 'Selo da receita')}
                          {input('cartAddCtaPrefix', 'Prefixo do botão')}
                          {cardList('cartBumpRecipes')}
                        </>
                      )}
                      {selectedEditorField === 'cartOfferCopy' && (
                        <>
                          {input('cartOfferEyebrow', 'Selo')}
                          <label>
                            Título
                            <input
                              value={catalog.cartOffer.headline}
                              onChange={(event) =>
                                setCatalog({
                                  ...catalog,
                                  cartOffer: {
                                    ...catalog.cartOffer,
                                    headline: event.target.value,
                                  },
                                })
                              }
                            />
                          </label>
                          <label>
                            Descrição
                            <textarea
                              value={catalog.cartOffer.description}
                              onChange={(event) =>
                                setCatalog({
                                  ...catalog,
                                  cartOffer: {
                                    ...catalog.cartOffer,
                                    description: event.target.value,
                                  },
                                })
                              }
                            />
                          </label>
                          {input('cartOfferRecipeLabel', 'Selo da receita')}
                          {input('cartAddCtaPrefix', 'Prefixo do botão')}
                          {cardList('cartOfferRecipes')}
                        </>
                      )}
                      {selectedEditorField === 'cartSummaryCopy' && (
                        <>
                          {input('cartSubtotalLabel', 'Subtotal')}
                          {input('cartSavingsLabel', 'Economia')}
                          {input(
                            'cartSecurityText',
                            'Mensagem de segurança',
                            true,
                          )}
                          {input('cartCheckoutCtaText', 'Botão de pagamento')}
                          {input(
                            'cartCheckoutLoadingText',
                            'Botão durante carregamento',
                          )}
                          {input(
                            'paymentSecurityText',
                            'Texto de segurança do pagamento',
                          )}
                          {input(
                            'paymentNote',
                            'Observação das formas de pagamento',
                            true,
                          )}
                          {input('cartRemoveText', 'Texto para remover item')}
                          {input('cartBundleItemLabel', 'Descrição de bundle')}
                          {input(
                            'cartProductItemLabel',
                            'Descrição de produto',
                          )}
                        </>
                      )}
                    </div>
                  )}
                  {editorSection === 'recovery' &&
                    (() => {
                      const stage = Number(selectedEditorField?.slice(-1));
                      const index = stage - 1;
                      const offer = catalog.exitOffers[index];
                      if (!offer) return null;
                      return (
                        <div className="page-editor-fields">
                          <header>
                            <Megaphone />
                            <div>
                              <h3>{editorFieldLabels[selectedEditorField!]}</h3>
                              <p>
                                Envie o banner e edite os textos desta etapa.
                              </p>
                            </div>
                          </header>
                          <ExitOfferFields
                            offer={offer}
                            bundles={catalog.bundles}
                            onChange={(next) =>
                              setCatalog({
                                ...catalog,
                                exitOffers: catalog.exitOffers.map(
                                  (item, itemIndex) =>
                                    itemIndex === index ? next : item,
                                ),
                              })
                            }
                            onBannerChange={(event) =>
                              void replaceRecoveryBanner(
                                index,
                                event.target.files?.[0],
                              )
                            }
                            onBannerRemove={() =>
                              setCatalog({
                                ...catalog,
                                exitOffers: catalog.exitOffers.map(
                                  (item, itemIndex) =>
                                    itemIndex === index
                                      ? { ...item, banner: '' }
                                      : item,
                                ),
                              })
                            }
                          />
                        </div>
                      );
                    })()}
                </section>
              )}
            </div>
            {notice}
          </form>
        )}

        {active === "API's" && (
          <div className="api-integrations-stack">
            <form
              className="admin-section admin-form api-integration-card"
              onSubmit={saveStripeIntegration}
            >
              <div className="api-provider-heading">
                <div className="api-provider-identity">
                  <span className="api-provider-logo">
                    <Image
                      src="/images/payments/stripe.svg"
                      alt="Stripe"
                      width={77}
                      height={32}
                    />
                  </span>
                  <div className="api-provider-copy">
                    <div className="api-provider-title-row">
                      <h2>Stripe</h2>
                      <span
                        className={`api-status ${stripeStatus?.configured && stripeStatus?.embeddedCheckoutConfigured ? 'connected' : ''}`}
                      >
                        {stripeLoading && !stripeStatus
                          ? 'Verificando'
                          : stripeStatus?.configured &&
                              stripeStatus?.embeddedCheckoutConfigured
                            ? 'Conectada'
                            : stripeStatus?.configured
                              ? 'Configuração incompleta'
                              : 'Não configurada'}
                      </span>
                    </div>
                    <p className="admin-muted">
                      Processamento seguro dos pagamentos e confirmação
                      automática dos pedidos.
                    </p>
                  </div>
                </div>
                <button
                  className="save-button"
                  disabled={stripeLoading}
                  type="submit"
                >
                  {stripeLoading ? (
                    <RefreshCw className="is-spinning" />
                  ) : (
                    <Save />
                  )}
                  {stripeLoading ? 'Validando...' : 'Salvar e validar'}
                </button>
              </div>

              {stripeStatus?.configured && (
                <output className="api-connection-summary">
                  <CheckCircle2 />
                  <div>
                    <strong>
                      {stripeStatus.accountName || 'Conta Stripe conectada'}
                    </strong>
                    <span>
                      {stripeStatus.mode === 'live'
                        ? 'Modo produção'
                        : 'Modo teste'}
                      {stripeStatus.accountId
                        ? ` · ${stripeStatus.accountId}`
                        : ''}
                      {stripeStatus.source === 'environment'
                        ? ' · configuração da Vercel'
                        : ' · configuração do painel'}
                    </span>
                  </div>
                </output>
              )}

              <div className="api-credentials-grid stripe-credentials-grid">
                <label>
                  Chave secreta
                  <input
                    type="password"
                    value={stripeSecretKey}
                    onChange={(event) => setStripeSecretKey(event.target.value)}
                    placeholder={
                      stripeStatus?.secretKeyHint ||
                      'sk_live_... ou sk_test_...'
                    }
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <small>
                    {stripeStatus?.configured
                      ? `Credencial atual: ${stripeStatus.secretKeyHint}. Deixe vazio para manter.`
                      : 'Encontrada em Desenvolvedores → Chaves de API no painel da Stripe.'}
                  </small>
                </label>
                <label>
                  Chave publicável
                  <input
                    type="password"
                    value={stripePublishableKey}
                    onChange={(event) =>
                      setStripePublishableKey(event.target.value)
                    }
                    placeholder={
                      stripeStatus?.publishableKeyHint ||
                      'pk_live_... ou pk_test_...'
                    }
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <small>
                    {stripeStatus?.embeddedCheckoutConfigured
                      ? `Credencial atual: ${stripeStatus.publishableKeyHint}. Deixe vazio para manter.`
                      : 'Necessária para abrir o checkout incorporado dentro do carrinho.'}
                  </small>
                </label>
                <label>
                  Segredo do webhook
                  <input
                    type="password"
                    value={stripeWebhookSecret}
                    onChange={(event) =>
                      setStripeWebhookSecret(event.target.value)
                    }
                    placeholder={stripeStatus?.webhookSecretHint || 'whsec_...'}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <small>
                    {stripeStatus?.webhookConfigured
                      ? `Webhook atual: ${stripeStatus.webhookSecretHint}. Deixe vazio para manter.`
                      : 'Necessário para confirmar pagamentos e liberar os produtos automaticamente.'}
                  </small>
                </label>
              </div>

              <div className="api-webhook-box">
                <div>
                  <strong>URL do webhook</strong>
                  <span>
                    Cadastre esta URL na Stripe para os eventos de pagamento.
                  </span>
                </div>
                <code>{stripeWebhookUrl || '/api/stripe/webhook'}</code>
              </div>

              <p className="api-security-note">
                <KeyRound /> As credenciais são criptografadas antes de serem
                armazenadas e nunca são enviadas para a página de vendas.
              </p>
              {notice}
            </form>

            <form
              className="admin-section admin-form api-integration-card"
              onSubmit={saveResendIntegration}
            >
              <div className="api-provider-heading">
                <div className="api-provider-identity">
                  <span className="api-provider-logo resend-provider-logo">
                    <MailCheck aria-hidden="true" />
                  </span>
                  <div className="api-provider-copy">
                    <div className="api-provider-title-row">
                      <h2>Resend</h2>
                      <span
                        className={`api-status ${resendStatus?.configured ? 'connected' : ''}`}
                      >
                        {resendLoading && !resendStatus
                          ? 'Verificando'
                          : resendStatus?.configured
                            ? 'Conectada'
                            : 'Não configurada'}
                      </span>
                    </div>
                    <p className="admin-muted">
                      Entrega automática dos arquivos e recuperação da coleção
                      três dias após a compra.
                    </p>
                  </div>
                </div>
                <button
                  className="save-button"
                  disabled={resendLoading}
                  type="submit"
                >
                  {resendLoading ? (
                    <RefreshCw className="is-spinning" />
                  ) : (
                    <Save />
                  )}
                  {resendLoading ? 'Validando...' : 'Salvar e validar'}
                </button>
              </div>

              {resendStatus?.configured && (
                <output className="api-connection-summary">
                  <CheckCircle2 aria-hidden="true" />
                  <div>
                    <strong>Envio automático configurado</strong>
                    <span>
                      {resendStatus.fromName} &lt;{resendStatus.fromEmail}&gt;
                      {resendStatus.source === 'environment'
                        ? ' · configuração da Vercel'
                        : ' · configuração do painel'}
                    </span>
                  </div>
                </output>
              )}

              <div className="api-credentials-grid resend-credentials-grid">
                <label>
                  <span className="api-field-heading">Chave de API</span>
                  <input
                    type="password"
                    value={resendApiKey}
                    onChange={(event) => setResendApiKey(event.target.value)}
                    placeholder={resendStatus?.apiKeyHint || 're_...'}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <small>
                    {resendStatus?.configured
                      ? `Credencial atual: ${resendStatus.apiKeyHint}. Deixe vazio para manter.`
                      : 'Crie uma chave em API Keys no painel da Resend.'}
                  </small>
                </label>
                <label>
                  <span className="api-field-heading">Nome do remetente</span>
                  <input
                    value={resendFromName}
                    onChange={(event) => setResendFromName(event.target.value)}
                    placeholder="Vovó Tereza"
                    autoComplete="organization"
                  />
                  <small>Nome exibido na caixa de entrada do cliente.</small>
                </label>
                <label>
                  <span className="api-field-heading">E-mail remetente</span>
                  <input
                    type="email"
                    value={resendFromEmail}
                    onChange={(event) => setResendFromEmail(event.target.value)}
                    placeholder="pedidos@seudominio.com.br"
                    autoComplete="email"
                  />
                  <small>
                    Use um endereço de um domínio verificado na Resend.
                  </small>
                </label>
                <label>
                  <span className="api-field-heading">
                    E-mail para respostas
                    <span className="optional-label">Opcional</span>
                  </span>
                  <input
                    type="email"
                    value={resendReplyTo}
                    onChange={(event) => setResendReplyTo(event.target.value)}
                    placeholder="contato@seudominio.com.br"
                    autoComplete="email"
                  />
                  <small>
                    As respostas das clientes serão direcionadas para cá.
                  </small>
                </label>
              </div>

              <section
                className="email-template-section"
                aria-labelledby="email-templates-title"
              >
                <div className="email-template-heading">
                  <div>
                    <strong id="email-templates-title">
                      Automações incluídas
                    </strong>
                    <span>
                      Os dois e-mails seguem a identidade visual da página de
                      vendas.
                    </span>
                  </div>
                  <span className="email-template-badge">Banner exclusivo</span>
                </div>
                <div className="email-template-grid">
                  <article className="email-template-card">
                    <Image
                      src="/images/email/vovo-tereza-email-banner.jpg"
                      alt="Vovó Tereza preparando receitas em uma cozinha acolhedora"
                      width={1200}
                      height={400}
                    />
                    <div>
                      <span>Imediatamente após o pagamento</span>
                      <h3>Compra confirmada + downloads</h3>
                      <p>
                        Lista cada e-book comprado com seu botão individual de
                        download.
                      </p>
                    </div>
                  </article>
                  <article className="email-template-card">
                    <Image
                      src="/images/email/vovo-tereza-email-banner.jpg"
                      alt=""
                      width={1200}
                      height={400}
                    />
                    <div>
                      <span>Agendado para 3 dias depois</span>
                      <h3>Complete a sua coleção</h3>
                      <p>
                        Apresenta apenas os e-books ativos que ficaram de fora
                        da compra.
                      </p>
                    </div>
                  </article>
                </div>
              </section>

              <p className="api-security-note">
                <KeyRound aria-hidden="true" /> A chave da Resend é
                criptografada e usada somente no servidor. Ela nunca aparece na
                página de vendas.
              </p>
              {notice}
            </form>
          </div>
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
