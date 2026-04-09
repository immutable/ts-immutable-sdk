#!/usr/bin/env node
/*
 * Static file server for the audience SDK sample app.
 *
 * Serves the sample-app's own files from this directory, and exposes the
 * CDN bundle (built into ../sdk/dist/cdn/) under /vendor/. This keeps the
 * sdk's dist/ as the single source of truth — no copy step, no gitignored
 * artifacts — while letting the demo's <script> tag load the bundle from
 * a same-origin URL (which keeps the CSP in index.html happy).
 *
 * Invoked by `pnpm dev`, after `pnpm --filter @imtbl/audience run build`
 * has populated ../sdk/dist/cdn/.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number.parseInt(process.env.PORT ?? '3456', 10);
// resolve() strips the trailing slash that fileURLToPath leaves on a dir URL,
// so later `${HERE}/` concatenations yield clean paths, not `/foo//`.
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

/**
 * Resolve a request path to a file path inside one of the allowed roots.
 * Rejects paths that escape their root via .. segments.
 */
function resolveRequest(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const normalized = decoded === '/' ? '/index.html' : decoded;

  if (normalized.startsWith('/vendor/')) {
    const rel = normalized.slice('/vendor/'.length);
    const filePath = resolve(SDK_CDN, rel);
    if (!filePath.startsWith(`${SDK_CDN}/`) && filePath !== SDK_CDN) return null;
    return filePath;
  }

  const filePath = resolve(HERE, `.${normalized}`);
  if (!filePath.startsWith(`${HERE}/`) && filePath !== HERE) return null;
  // Don't serve this file or package metadata.
  const blocked = ['serve.mjs', 'package.json', 'node_modules'];
  for (const name of blocked) {
    if (filePath === join(HERE, name) || filePath.startsWith(`${join(HERE, name)}/`)) return null;
  }
  return filePath;
}

const server = createServer(async (req, res) => {
  try {
    const filePath = resolveRequest(req.url ?? '/');
    if (!filePath) {
      res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('403 forbidden');
      return;
    }
    const body = await readFile(filePath);
    const type = MIME[extname(filePath)] ?? 'application/octet-stream';
    res.writeHead(200, {
      'content-type': type,
      'cache-control': 'no-store',
    });
    res.end(body);
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(`404 not found: ${req.url}`);
      return;
    }
    // eslint-disable-next-line no-console
    console.error('[serve]', err);
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('500 server error');
  }
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`audience sdk sample app: http://localhost:${PORT}/`);
});
