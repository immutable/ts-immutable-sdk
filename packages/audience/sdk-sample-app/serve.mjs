#!/usr/bin/env node
// Static file server for the @imtbl/audience sample app.
//
// Mounts the sample-app's own files under / and the sibling SDK's CDN
// build output under /vendor/. The HTML <script> tag loads the CDN
// bundle from /vendor/imtbl-audience.global.js so the whole page is
// served from a single origin and the tight CSP in index.html stays
// happy. Invoked by `pnpm dev` after `pnpm --filter @imtbl/audience
// run build` has populated ../sdk/dist/cdn/.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number.parseInt(process.env.PORT ?? '3456', 10);
const HERE = resolve(fileURLToPath(new URL('.', import.meta.url)));
const SDK_CDN = resolve(HERE, '..', 'sdk', 'dist', 'cdn');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json; charset=utf-8',
};

const BLOCKED = new Set(['/serve.mjs', '/package.json']);

function resolveRequest(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const normalized = decoded === '/' ? '/index.html' : decoded;

  if (BLOCKED.has(normalized) || normalized.startsWith('/node_modules')) {
    return null;
  }

  if (normalized.startsWith('/vendor/')) {
    const rel = normalized.slice('/vendor/'.length);
    const filePath = resolve(SDK_CDN, rel);
    if (!filePath.startsWith(`${SDK_CDN}/`) && filePath !== SDK_CDN) return null;
    if (filePath === SDK_CDN) return null;
    return filePath;
  }

  const filePath = resolve(HERE, `.${normalized}`);
  if (!filePath.startsWith(`${HERE}/`) && filePath !== HERE) return null;
  if (filePath === HERE) return null;
  return filePath;
}

const server = createServer(async (req, res) => {
  const filePath = resolveRequest(req.url ?? '/');
  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }
  try {
    const body = await readFile(filePath);
    const mime = MIME[extname(filePath)] ?? 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(body);
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`@imtbl/audience sample app → http://localhost:${PORT}/`);
});
