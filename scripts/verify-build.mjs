import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { products } from '../lib/catalog.ts';
import { siteConfig } from '../lib/config.ts';

if (process.env.HORISONY_OUTPUT === 'export') {
  await import('./verify-export.mjs');
} else {
  const project = fileURLToPath(new URL('../', import.meta.url));
  const build = path.join(project, '.next');
  const requireFile = file => assert.ok(existsSync(file) && statSync(file).isFile(), `Missing Node.js production build file: ${file}`);
  const readManifest = name => {
    const file = path.join(build, name);
    requireFile(file);
    return JSON.parse(readFileSync(file, 'utf8'));
  };
  requireFile(path.join(build, 'BUILD_ID'));
  assert.ok(readFileSync(path.join(build, 'BUILD_ID'), 'utf8').trim(), 'Empty .next/BUILD_ID');
  const serverFiles = readManifest('required-server-files.json');
  assert.notEqual(serverFiles.config.output, 'export', 'Static output requires npm run build:static and the static export verifier.');
  for (const file of serverFiles.files) requireFile(path.resolve(project, file));
  const prerender = readManifest('prerender-manifest.json');
  readManifest('routes-manifest.json');
  readManifest('build-manifest.json');
  const appPaths = readManifest('server/app-paths-manifest.json');
  for (const file of Object.values(appPaths)) requireFile(path.join(build, 'server', file));
  const requiredRoutes = ['/', '/shop', '/about', '/cart', '/checkout', '/collections/t-shirts', '/collections/jackets', '/collections/accessories',
    ...['contact', 'shipping', 'returns', 'privacy', 'terms', 'refund-policy', 'privacy-policy', 'terms-of-service'].map(slug => '/' + slug),
    ...products.map(product => '/products/' + product.slug)];
  const htmlFiles = requiredRoutes.map(route => {
    assert.ok(Object.hasOwn(prerender.routes, route), `Missing prerendered storefront route: ${route}`);
    const file = path.join(build, 'server/app', route === '/' ? 'index.html' : route.slice(1) + '.html');
    requireFile(file);
    return { file, url: route === '/' ? '/' : route + '/' };
  });
  const staticDir = path.join(build, 'static');
  assert.ok(existsSync(staticDir), 'Missing .next/static production assets.');
  const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
    ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
  const cssFiles = walk(staticDir).filter(file => file.endsWith('.css')).map(file => ({
    file, url: '/_next/static/' + path.relative(staticDir, file).split(path.sep).join('/'),
  }));
  assert.ok(cssFiles.length, 'Missing compiled storefront CSS.');
  const failures = new Set();
  let references = 0;
  const checkReference = (value, sourceUrl) => {
    const decoded = value.replaceAll('&amp;', '&');
    if (!decoded || /^(?:#|mailto:|tel:|data:|https?:\/\/|\/\/)/i.test(decoded)) return;
    const pathname = decodeURIComponent(new URL(decoded, 'https://horizony.store' + sourceUrl).pathname);
    references++;
    if (pathname.startsWith('/_next/static/')) {
      const file = path.resolve(staticDir, '.' + pathname.slice('/_next/static'.length));
      if (!file.startsWith(staticDir + path.sep) || !existsSync(file) || !statSync(file).isFile()) failures.add(`Missing compiled asset: ${pathname}`);
      return;
    }
    const publicDir = path.join(project, 'public');
    const file = path.resolve(publicDir, '.' + pathname);
    if (file.startsWith(publicDir + path.sep) && existsSync(file) && statSync(file).isFile()) return;
    const route = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
    if (!Object.hasOwn(prerender.routes, route) && !Object.hasOwn(appPaths, route + '/route')) failures.add(`Missing public asset or route: ${pathname}`);
  };
  for (const {file, url} of [...htmlFiles, ...cssFiles]) {
    const text = readFileSync(file, 'utf8');
    if (file.endsWith('.html')) {
      assert.ok(text.includes(`href="${siteConfig.supportWhatsappUrl}"`), `Missing WhatsApp support link in ${url}`);
      assert.ok(!text.includes('href="mailto:'), `Unexpected email contact link in ${url}`);
      if (['/contact/', '/returns/', '/refund-policy/', '/privacy-policy/', '/terms-of-service/'].includes(url)) {
        const links = [...text.matchAll(/<a\b[^>]*href="https:\/\/wa\.me\/14066086028"[^>]*>/g)];
        assert.ok(links.length >= 2, `Missing page-specific WhatsApp support or footer contact in ${url}`);
      }
      if (['/returns/', '/refund-policy/'].includes(url)) {
        assert.ok(!text.includes('Draft for business review'), `Unfinished refund policy in ${url}`);
        assert.ok(text.includes('30 calendar days') && text.includes('5–10 business days'), `Missing confirmed return/refund timing in ${url}`);
      }
      assert.ok(!text.includes('horisony-studio.sevenproject244.chatgpt.site'), `Old canonical origin in ${file}`);
      for (const match of text.matchAll(/\b(?:href|src)="([^"]*)"/g)) checkReference(match[1], url);
      for (const match of text.matchAll(/\bsrc[Ss]et="([^"]*)"/g)) {
        for (const candidate of match[1].split(',')) checkReference(candidate.trim().split(/\s+/)[0], url);
      }
    }
    for (const match of text.matchAll(/url\(["']?([^\s)"']+)["']?\)/g)) checkReference(match[1], url);
  }
  assert.equal(failures.size, 0, [...failures].join('\n'));
  console.log(`Verified Node.js .next build: ${requiredRoutes.length} storefront routes, ${products.length} products and ${references} local asset/link references. No out directory is required.`);
}
