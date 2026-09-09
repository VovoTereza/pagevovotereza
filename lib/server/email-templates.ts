const colors = {
  ivory: '#fffaf0',
  paper: '#ffffff',
  ink: '#2d251f',
  muted: '#6f6258',
  forest: '#376d35',
  forestDark: '#2f642e',
  terracotta: '#b45132',
  line: '#e5d7c4',
};

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[
        character
      ] || character,
  );

const shell = ({
  preheader,
  title,
  siteUrl,
  content,
}: {
  preheader: string;
  title: string;
  siteUrl: string;
  content: string;
}) => `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;background:${colors.ivory};color:${colors.ink};font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${colors.ivory};">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:${colors.paper};border:1px solid ${colors.line};border-radius:18px;overflow:hidden;">
        <tr><td align="center" style="padding:18px 24px;background:${colors.ink};">
          <img src="${siteUrl}/images/logo-vovo-tereza.png" width="180" alt="Vovó Tereza" style="display:block;width:180px;max-width:70%;height:auto;border:0;">
        </td></tr>
        <tr><td>
          <img src="${siteUrl}/images/email/vovo-tereza-email-banner.jpg" width="640" height="213" alt="Vovó Tereza preparando receitas e cuidados naturais" style="display:block;width:100%;height:auto;border:0;">
        </td></tr>
        <tr><td style="padding:34px 34px 28px;">${content}</td></tr>
        <tr><td align="center" style="padding:20px 24px;border-top:1px solid ${colors.line};color:${colors.muted};font-size:12px;line-height:1.6;">
          Vovó Tereza · cuidado e conhecimento para a sua rotina<br>
          Este é um e-mail automático relacionado à sua compra.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

const button = (label: string, url: string) =>
  `<a href="${escapeHtml(url)}" style="display:inline-block;padding:14px 22px;border-radius:10px;background:${colors.terracotta};color:#fff;text-decoration:none;font-size:15px;font-weight:800;line-height:1.2;">${escapeHtml(label)}</a>`;

export type PurchasedEmailProduct = { name: string; downloadUrl: string };
export type RecoveryEmailProduct = {
  name: string;
  price: number;
  coverImage?: string;
  url: string;
};

export function purchaseEmailTemplate(input: {
  customerName?: string | null;
  orderNumber: string;
  products: PurchasedEmailProduct[];
  siteUrl: string;
}) {
  const firstName =
    input.customerName?.trim().split(/\s+/)[0] || 'querida cliente';
  const productRows = input.products
    .map(
      (
        product,
      ) => `<tr><td style="padding:16px 0;border-top:1px solid ${colors.line};">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
          <td style="padding-right:16px;font-size:16px;font-weight:700;line-height:1.4;">${escapeHtml(product.name)}</td>
          <td align="right" style="white-space:nowrap;">${button('BAIXAR ARQUIVO', product.downloadUrl)}</td>
        </tr></table>
      </td></tr>`,
    )
    .join('');
  const html = shell({
    preheader:
      'Seu pagamento foi confirmado. Seus arquivos já estão disponíveis.',
    title: 'Sua compra Vovó Tereza',
    siteUrl: input.siteUrl,
    content: `<p style="margin:0 0 8px;color:${colors.forestDark};font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">Pedido confirmado · ${escapeHtml(input.orderNumber)}</p>
      <h1 style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:36px;line-height:1.08;font-weight:500;">Está tudo pronto, ${escapeHtml(firstName)}!</h1>
      <p style="margin:0 0 26px;color:${colors.muted};font-size:16px;line-height:1.65;">Obrigada por escolher os cadernos da Vovó Tereza. Use os botões abaixo para baixar os arquivos que fazem parte da sua compra.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${productRows}</table>
      <p style="margin:24px 0 0;padding:15px 17px;border-radius:10px;background:#f3f6ef;color:${colors.forestDark};font-size:13px;line-height:1.55;">Guarde este e-mail. Estes links são pessoais e dão acesso aos arquivos do seu pedido.</p>`,
  });
  const text = [
    `Está tudo pronto, ${firstName}!`,
    `Pedido ${input.orderNumber}.`,
    'Baixe os arquivos da sua compra:',
    ...input.products.map(
      (product) => `${product.name}: ${product.downloadUrl}`,
    ),
  ].join('\n\n');
  return { html, text };
}

const formatMoney = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);

export function recoveryEmailTemplate(input: {
  customerName?: string | null;
  products: RecoveryEmailProduct[];
  siteUrl: string;
}) {
  const firstName =
    input.customerName?.trim().split(/\s+/)[0] || 'querida cliente';
  const cards = input.products
    .slice(0, 3)
    .map(
      (
        product,
      ) => `<tr><td style="padding:14px 0;border-top:1px solid ${colors.line};">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
          ${product.coverImage ? `<td width="72" style="padding-right:15px;"><img src="${escapeHtml(product.coverImage)}" width="64" height="80" alt="" style="display:block;width:64px;height:80px;object-fit:cover;border-radius:7px;border:1px solid ${colors.line};"></td>` : ''}
          <td><strong style="display:block;font-size:16px;line-height:1.35;">${escapeHtml(product.name)}</strong><span style="display:block;margin-top:5px;color:${colors.forestDark};font-weight:800;">${formatMoney(product.price)}</span></td>
          <td align="right" style="padding-left:12px;">${button('CONHECER', product.url)}</td>
        </tr></table>
      </td></tr>`,
    )
    .join('');
  const html = shell({
    preheader:
      'Ainda há cadernos da coleção que podem completar a sua biblioteca.',
    title: 'Complete sua coleção Vovó Tereza',
    siteUrl: input.siteUrl,
    content: `<p style="margin:0 0 8px;color:${colors.forestDark};font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">Um carinho da Vovó Tereza</p>
      <h1 style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:36px;line-height:1.08;font-weight:500;">Sua coleção ainda pode ficar mais completa, ${escapeHtml(firstName)}.</h1>
      <p style="margin:0 0 26px;color:${colors.muted};font-size:16px;line-height:1.65;">Você já começou a sua biblioteca. Separei os cadernos que ficaram de fora da última compra para que possa conhecê-los com calma.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${cards}</table>
      <p style="margin:26px 0 0;text-align:center;">${button('VER TODOS OS CADERNOS', `${input.siteUrl}/#ofertas`)}</p>`,
  });
  const text = [
    `Sua coleção ainda pode ficar mais completa, ${firstName}.`,
    'Conheça os cadernos que ficaram de fora:',
    ...input.products.map(
      (product) =>
        `${product.name} — ${formatMoney(product.price)} — ${product.url}`,
    ),
  ].join('\n\n');
  return { html, text };
}
