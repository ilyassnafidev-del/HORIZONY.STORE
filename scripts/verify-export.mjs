import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve('out');
assert.ok(existsSync(path.join(root, 'index.html')), 'Run the production build first.');
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const file = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});
const files = walk(root);
const failures = new Set();
let checked = 0;
function checkReference(value, source) {
  const decoded = value.replaceAll('&amp;', '&');
  if (!decoded || /^(?:#|mailto:|tel:|data:|https?:\/\/|\/\/)/i.test(decoded)) return;
  let pathname;
  try { pathname = decodeURIComponent(new URL(decoded, `https://horizony.store/${path.relative(root, source).split(path.sep).join('/')}`).pathname); }
  catch { failures.add(`${path.relative(root, source)}: invalid URL ${decoded}`); return; }
  const target = path.resolve(root, '.' + pathname);
  if (!target.startsWith(root + path.sep) && target !== root) {
    failures.add(`${path.relative(root, source)}: path outside export ${decoded}`); return;
  }
  checked++;
  if (!existsSync(target) || (statSync(target).isDirectory() && !existsSync(path.join(target, 'index.html')))) {
    failures.add(`${path.relative(root, source)}: missing ${pathname}`);
  }
}
for (const file of files.filter(file => /\.(html|css)$/.test(file))) {
  const text = readFileSync(file, 'utf8');
  if (file.endsWith('.html')) {
    for (const match of text.matchAll(/\b(?:href|src)="([^"]*)"/g)) checkReference(match[1], file);
    for (const match of text.matchAll(/\bsrc[Ss]et="([^"]*)"/g)) {
      for (const candidate of match[1].split(',')) checkReference(candidate.trim().split(/\s+/)[0], file);
    }
    assert.ok(!text.includes('horisony-studio.sevenproject244.chatgpt.site'), `Old canonical origin in ${file}`);
  }
  for (const match of text.matchAll(/url\(["']?([^\s)"']+)["']?\)/g)) checkReference(match[1], file);
}
assert.equal(failures.size, 0, [...failures].join('\n'));
assert.ok(existsSync(path.join(root, '.htaccess')), 'Hostinger static server configuration is missing.');
console.log(`Verified ${checked} local references across ${files.filter(file => file.endsWith('.html')).length} HTML pages and stylesheets.`);
