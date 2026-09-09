import assert from 'node:assert/strict';
import test from 'node:test';
import {
  purchaseEmailTemplate,
  recoveryEmailTemplate,
} from '../lib/server/email-templates.ts';

test('template de compra inclui banner, pedido e link individual de download', () => {
  const result = purchaseEmailTemplate({
    customerName: 'Maria da Silva',
    orderNumber: 'VT-123',
    siteUrl: 'https://pagevovotereza.vercel.app',
    products: [
      {
        name: 'Livro Essencial',
        downloadUrl:
          'https://pagevovotereza.vercel.app/api/download?token=abc&product=livro',
      },
    ],
  });

  assert.match(result.html, /vovo-tereza-email-banner\.jpg/);
  assert.match(result.html, /VT-123/);
  assert.match(result.html, /BAIXAR ARQUIVO/);
  assert.match(result.text, /token=abc&product=livro/);
});

test('template de recuperação apresenta apenas os produtos recebidos', () => {
  const result = recoveryEmailTemplate({
    customerName: 'Ana',
    siteUrl: 'https://pagevovotereza.vercel.app',
    products: [
      {
        name: 'Caderno da Babosa',
        price: 1990,
        url: 'https://pagevovotereza.vercel.app/produto/caderno-da-babosa',
      },
    ],
  });

  assert.match(result.html, /Caderno da Babosa/);
  assert.match(result.html, /R\$\s19,90/);
  assert.doesNotMatch(result.html, /Guia de Ingredientes/);
  assert.match(result.text, /produto\/caderno-da-babosa/);
});
