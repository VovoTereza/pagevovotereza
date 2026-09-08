import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const root = process.cwd();
const output = join(root, '.vercel', 'output');
const functionDir = join(output, 'functions', 'index.func');

const build = spawnSync('npm', ['run', 'build'], {
  cwd: root,
  env: process.env,
  shell: process.platform === 'win32',
  stdio: 'inherit',
});

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

await rm(output, { recursive: true, force: true });
await mkdir(functionDir, { recursive: true });
await cp(join(root, 'dist', 'client'), join(output, 'static'), { recursive: true });
await cp(join(root, 'dist', 'server'), join(functionDir, 'server'), { recursive: true });

await writeFile(
  join(functionDir, '.vc-config.json'),
  JSON.stringify({
    runtime: 'nodejs24.x',
    handler: 'index.mjs',
    launcherType: 'Nodejs',
    supportsResponseStreaming: false,
  }),
);

await writeFile(
  join(functionDir, 'package.json'),
  JSON.stringify({ type: 'module' }),
);

await writeFile(
  join(functionDir, 'index.mjs'),
  `import worker from './server/index.js';

export default async function handler(request, response) {
  const protocol = request.headers['x-forwarded-proto'] || 'https';
  const host = request.headers.host || 'localhost';
  const url = new URL(request.url || '/', \`${'${protocol}'}://${'${host}'}\`);
  const method = request.method || 'GET';
  const headers = new Headers();

  for (const [name, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(name, item);
    } else if (value !== undefined) {
      headers.set(name, value);
    }
  }

  const init = { method, headers };
  if (method !== 'GET' && method !== 'HEAD') {
    init.body = request;
    init.duplex = 'half';
  }

  const webResponse = await worker.fetch(
    new Request(url, init),
    process.env,
    { waitUntil() {}, passThroughOnException() {} },
  );

  response.statusCode = webResponse.status;
  for (const [name, value] of webResponse.headers) {
    response.setHeader(name, value);
  }
  response.end(Buffer.from(await webResponse.arrayBuffer()));
}
`,
);

await writeFile(
  join(output, 'config.json'),
  JSON.stringify({
    version: 3,
    routes: [
      { handle: 'filesystem' },
      { src: '/(.*)', dest: '/index' },
    ],
  }),
);

console.log('Vercel Build Output API bundle generated at .vercel/output');
