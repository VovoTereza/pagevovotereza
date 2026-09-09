import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('a prévia editável abre diretamente na rota de vendas', async () => {
  const dashboard = await readFile(
    new URL('../components/admin/dashboard.tsx', import.meta.url),
    'utf8',
  );

  assert.match(dashboard, /\/receitas\?editorPreview=1/);
  assert.doesNotMatch(dashboard, /['`]\/\?editorPreview=1/);
});
