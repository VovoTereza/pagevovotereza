import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyAttribution } from '../lib/client/analytics.ts';

test('classifica clique de anúncio como tráfego pago e identifica plataforma', () => {
  assert.deepEqual(
    classifyAttribution(new URL('https://example.com/receitas?fbclid=abc'), ''),
    { sourceType: 'paid', sourcePlatform: 'Facebook' },
  );
  assert.deepEqual(
    classifyAttribution(new URL('https://example.com/receitas?utm_source=instagram&utm_medium=paid_social'), ''),
    { sourceType: 'paid', sourcePlatform: 'Instagram' },
  );
});

test('distingue busca orgânica, referência e acesso direto', () => {
  assert.deepEqual(classifyAttribution(new URL('https://example.com/receitas'), 'https://google.com/search?q=receitas'), { sourceType: 'organic', sourcePlatform: 'Pesquisa Google' });
  assert.equal(classifyAttribution(new URL('https://example.com/receitas'), 'https://blog.example/post').sourceType, 'referral');
  assert.equal(classifyAttribution(new URL('https://example.com/receitas'), '').sourceType, 'direct');
});

test('identifica links rastreados de WhatsApp, YouTube e TikTok', () => {
  assert.deepEqual(classifyAttribution(new URL('https://example.com/receitas?utm_source=whatsapp&utm_medium=share'), ''), { sourceType: 'referral', sourcePlatform: 'WhatsApp' });
  assert.equal(classifyAttribution(new URL('https://example.com/receitas?utm_source=youtube&utm_medium=social'), '').sourcePlatform, 'YouTube');
  assert.equal(classifyAttribution(new URL('https://example.com/receitas?ttclid=abc'), '').sourcePlatform, 'TikTok');
});
