# Página de vendas da Vovó Tereza

Loja de produtos digitais com página de vendas, carrinho, checkout Stripe e painel administrativo para gerenciar conteúdo, catálogo, imagens e entregáveis.

## Requisitos

- Node.js 22.13 ou superior
- npm
- Uma conta Cloudflare com D1 e R2 para persistência e arquivos
- Uma conta Stripe para pagamentos em produção

## Desenvolvimento local

1. Instale as dependências:

   ```bash
   npm ci
   ```

2. Copie `.env.example` para `.env.local` e substitua os valores de exemplo.

3. Inicie o projeto:

   ```bash
   npm run dev
   ```

4. Abra `http://localhost:3000` ou a porta informada no terminal.

## Validação

```bash
npm run lint
npm test
npm run build
```

## Publicação

O projeto usa Vinext sobre Cloudflare Workers. A configuração de hospedagem declara os bindings D1 `DB` e R2 `FILES` em `.openai/hosting.json`. Antes de publicar, configure as variáveis de ambiente listadas em `.env.example` no provedor de hospedagem e aplique as migrações da pasta `drizzle`.

O GitHub armazena o código-fonte e executa a validação automática. O projeto não é compatível com GitHub Pages porque depende de rotas de servidor, banco D1, armazenamento R2 e webhooks.
