'use client';
import {
  BarChart3,
  BookOpen,
  Boxes,
  ChevronRight,
  CircleDollarSign,
  FileText,
  KeyRound,
  LogOut,
  Megaphone,
  Package,
  Save,
  Search,
  Settings,
  ShoppingCart,
  Tag,
  Users,
} from 'lucide-react';
import { SyntheticEvent, useState } from 'react';
import { bundles, defaultSiteConfig, products } from '@/lib/catalog';

type Config = typeof defaultSiteConfig & {
  keyword: string;
  metaPixelId: string;
  googleAnalyticsId: string;
  tiktokPixelId: string;
};
const nav = [
  ['Visão geral', BarChart3],
  ['Pedidos', ShoppingCart],
  ['Produtos', Package],
  ['Bundles', Boxes],
  ['Order Bumps', Tag],
  ['Carrinho', ShoppingCart],
  ['Recuperação', Megaphone],
  ['Conteúdo', FileText],
  ['SEO e palavras-chave', Search],
  ['Pixels', Settings],
] as const;

export function AdminDashboard({
  initialConfig,
  orderCount,
  revenue,
}: {
  initialConfig: Config;
  orderCount: number;
  revenue: number;
}) {
  const [active, setActive] = useState('Visão geral');
  const [config, setConfig] = useState(initialConfig);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  async function save(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    const response = await fetch('/api/site-config', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(config),
    });
    const data = (await response.json()) as { error?: string };
    setMessage(
      response.ok
        ? 'Alterações salvas e publicadas na loja.'
        : data.error || 'Não foi possível salvar.',
    );
    setSaving(false);
  }
  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    window.location.assign('/admin/login');
  }
  const input = (key: keyof Config, label: string, area = false) => (
    <label>
      {label}
      {area ? (
        <textarea
          value={config[key]}
          onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
        />
      ) : (
        <input
          value={config[key]}
          onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
        />
      )}
    </label>
  );
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand">
          <span>Vovó</span> Tereza
        </div>
        <small>ADMINISTRAÇÃO</small>
        <nav>
          {nav.map(([name, Icon]) => (
            <button
              key={name}
              className={active === name ? 'active' : ''}
              onClick={() => setActive(name)}
            >
              <Icon />
              {name}
              <ChevronRight />
            </button>
          ))}
        </nav>
        <button className="logout" onClick={logout}>
          <LogOut /> Sair
        </button>
      </aside>
      <main className="admin-main">
        <header>
          <div>
            <p className="eyebrow">PAINEL ADMINISTRATIVO</p>
            <h1>{active}</h1>
          </div>
          <a href="/" target="_blank">
            Ver loja
          </a>
        </header>
        {active === 'Visão geral' && (
          <>
            <div className="metric-grid">
              <article>
                <CircleDollarSign />
                <span>Receita confirmada</span>
                <strong>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(revenue / 100)}
                </strong>
                <small>Somente pedidos pagos</small>
              </article>
              <article>
                <ShoppingCart />
                <span>Pedidos</span>
                <strong>{orderCount}</strong>
                <small>Registros no banco</small>
              </article>
              <article>
                <Boxes />
                <span>Bundles ativos</span>
                <strong>{bundles.length}</strong>
                <small>
                  {bundles.find((b) => b.recommended)?.name} recomendado
                </small>
              </article>
              <article>
                <Users />
                <span>Conversão</span>
                <strong>Sem dados</strong>
                <small>Aparece após eventos reais</small>
              </article>
            </div>
            <section className="admin-section">
              <h2>Próximos cuidados</h2>
              <div className="admin-empty">
                <BarChart3 />
                <p>
                  O gráfico será preenchido conforme pagamentos e eventos reais
                  forem registrados. Dados de demonstração não entram nas
                  métricas.
                </p>
              </div>
            </section>
          </>
        )}
        {active === 'Pedidos' && (
          <section className="admin-section">
            <h2>Pedidos recentes</h2>
            <div className="admin-empty">
              <ShoppingCart />
              <p>
                {orderCount
                  ? `${orderCount} pedido(s) registrado(s). Consulte o banco para auditoria detalhada.`
                  : 'Nenhum pedido recebido ainda.'}
              </p>
            </div>
          </section>
        )}
        {active === 'Produtos' && (
          <section className="admin-section">
            <div className="section-actions">
              <h2>Produtos</h2>
              <button>Adicionar produto</button>
            </div>
            <div className="admin-table">
              {products.map((p) => (
                <div key={p.id}>
                  <BookOpen />
                  <div>
                    <strong>{p.name}</strong>
                    <small>{p.category}</small>
                  </div>
                  <span>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(p.price / 100)}
                  </span>
                  <b>Ativo</b>
                  <button>Editar</button>
                </div>
              ))}
            </div>
          </section>
        )}
        {active === 'Bundles' && (
          <section className="admin-section">
            <div className="section-actions">
              <h2>Bundles</h2>
              <button>Adicionar bundle</button>
            </div>
            <div className="admin-table">
              {bundles.map((b) => (
                <div key={b.id}>
                  <Boxes />
                  <div>
                    <strong>{b.name}</strong>
                    <small>{b.productIds.length} produtos</small>
                  </div>
                  <span>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(b.price / 100)}
                  </span>
                  <b>{b.recommended ? 'Recomendado' : 'Ativo'}</b>
                  <button>Editar</button>
                </div>
              ))}
            </div>
          </section>
        )}
        {['Order Bumps', 'Carrinho', 'Recuperação'].includes(active) && (
          <section className="admin-section">
            <h2>Central de ofertas</h2>
            <div className="offer-admin-grid">
              <article>
                <Tag />
                <h3>
                  {active === 'Recuperação'
                    ? '3 ofertas progressivas'
                    : active === 'Order Bumps'
                      ? 'Oferta adicional no carrinho'
                      : 'Complete sua coleção'}
                </h3>
                <p>
                  Ativa, com condições de produto, prioridade e preço definido
                  no servidor.
                </p>
                <button>Editar oferta</button>
              </article>
              <article>
                <Megaphone />
                <h3>Agenda e status</h3>
                <p>
                  Defina início, fim, público e estado ativo sem alterar o
                  código.
                </p>
                <button>Configurar</button>
              </article>
            </div>
          </section>
        )}
        {['Conteúdo', 'SEO e palavras-chave', 'Pixels'].includes(active) && (
          <form className="admin-section admin-form" onSubmit={save}>
            <div className="section-actions">
              <h2>{active}</h2>
              <button className="save-button" disabled={saving}>
                <Save />
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
            {active === 'Conteúdo' && (
              <div className="form-grid">
                {input('heroBadge', 'Selo do hero')}
                {input('heroTitle', 'Título principal', true)}
                {input('heroSubtitle', 'Subtítulo', true)}
                {input('ctaText', 'Texto do botão')}
                {input('urgencyText', 'Mensagem de urgência', true)}
              </div>
            )}
            {active === 'SEO e palavras-chave' && (
              <div className="form-grid">
                {input('seoTitle', 'Título SEO')}
                {input('seoDescription', 'Meta description', true)}
                {input('keyword', 'Palavra-chave principal')}
                <div className="keyword-card">
                  <KeyRound />
                  <div>
                    <strong>babosa</strong>
                    <span>SEO · produto · landing page</span>
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
                  IDs vazios não carregam scripts e não interferem na loja.
                </p>
              </div>
            )}
            {message && (
              <output
                className={
                  message.startsWith('Alterações')
                    ? 'save-success'
                    : 'form-error'
                }
              >
                {message}
              </output>
            )}
          </form>
        )}
      </main>
    </div>
  );
}
