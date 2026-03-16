#!/usr/bin/env node
/**
 * dev/serve.mjs — minimal dev server for leaflet-color-legend.
 *
 * Serves dist/index.js directly as a static file.
 * The HTML imports it via a normal ES import + importmap,
 * so "d3" and "leaflet" resolve to CDN URLs. No string surgery.
 *
 * Usage: node dev/serve.mjs
 */

import http from 'node:http';
import fs   from 'node:fs';
import path from 'node:path';
import { execSync }      from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const TEMPLATE  = path.join(__dirname, 'index.html');
const PORT      = 3000;

// ── SSE clients ──────────────────────────────────────────────────────────
const clients = new Set();
function broadcast(event) {
  for (const res of clients) res.write(`event: ${event}\ndata: {}\n\n`);
}

// ── Build ────────────────────────────────────────────────────────────────
function build() {
  try {
    console.log('[build] running tsdown…');
    execSync('npx tsdown', { cwd: ROOT, stdio: 'inherit' });
    console.log('[build] done');
    return true;
  } catch (e) {
    console.error('[build] failed:', e.message);
    return false;
  }
}

// ── HTTP server ──────────────────────────────────────────────────────────
const MIME = { '.js': 'application/javascript', '.map': 'application/json', '.css': 'text/css' };

const server = http.createServer((req, res) => {
  // SSE live-reload
  if (req.url === '/__reload') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
    res.write(': connected\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  // Main page
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(TEMPLATE));
    return;
  }

  // dist/ static files  e.g. /dist/index.js
  if (req.url.startsWith('/dist/')) {
    const filePath = path.join(ROOT, req.url);
    if (fs.existsSync(filePath)) {
      res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] ?? 'text/plain' });
      res.end(fs.readFileSync(filePath));
      return;
    }
  }

  res.writeHead(404);
  res.end('not found');
});

// ── Watch src/ ───────────────────────────────────────────────────────────
let debounce = null;
function watchSrc() {
  fs.watch(path.join(ROOT, 'src'), { recursive: true }, (_, filename) => {
    if (!filename?.endsWith('.ts')) return;
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      console.log(`[watch] ${filename} changed`);
      if (build()) { broadcast('reload'); console.log('[reload] →', clients.size, 'client(s)'); }
    }, 80);
  });
  console.log('[watch] watching src/');
}

// ── Start ────────────────────────────────────────────────────────────────
build();
server.listen(PORT, () => console.log(`\n  ✓  Dev server → http://localhost:${PORT}\n`));
watchSrc();
