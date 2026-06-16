import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const locationsRoot = path.join(root, 'content', 'locations');
const python = 'C:\\Users\\AndersEriksson\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe';

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function relParts(file) {
  return path.relative(locationsRoot, file).split(path.sep);
}

function isCountryIndex(file) {
  const parts = relParts(file);
  return parts.length === 3 && parts[2] === 'index.html';
}

function isCityPage(file) {
  const parts = relParts(file);
  return parts.length === 3 && parts[2] !== 'index.html' && parts[2].endsWith('.html');
}

function titleFromSlug(slug) {
  return slug.split('-').map((part) => part ? part[0].toUpperCase() + part.slice(1) : part).join(' ');
}

function stripTags(value = '') {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function htmlEscape(value = '') {
  return String(value)
    .replace(/&(?!(?:[a-zA-Z]+|#\d+|#x[a-fA-F0-9]+);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function localPath(url) {
  return url && url.startsWith('/') ? path.join(root, url.slice(1)) : '';
}

const hashScript = [
  'from PIL import Image, ImageOps',
  'from pathlib import Path',
  'import sys',
  'def ahash(p):',
  '    im = Image.open(p).convert("RGB")',
  '    im = ImageOps.fit(im, (8,8))',
  '    im = im.convert("L")',
  '    vals = list(im.getdata())',
  '    avg = sum(vals) / len(vals)',
  '    return "".join("1" if v >= avg else "0" for v in vals)',
  'for p in sys.argv[1:]:',
  '    print(ahash(Path(p)))',
].join('\n');

const hashCache = new Map();
function imageHash(file) {
  if (!file || !fs.existsSync(file)) return '';
  if (!hashCache.has(file)) {
    hashCache.set(file, execFileSync(python, ['-c', hashScript, file], { encoding: 'utf8' }).trim());
  }
  return hashCache.get(file);
}

function hamming(a, b) {
  if (!a || !b || a.length !== b.length) return 64;
  let distance = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) distance++;
  return distance;
}

function cityImageLooksLikeCountry(cityFile, imgUrl) {
  const parts = relParts(cityFile);
  const [continentSlug, countrySlug] = parts;
  const countryDir = path.join(locationsRoot, continentSlug, countrySlug, 'img');
  const countryMini = path.join(countryDir, `${countrySlug}-mini.png`);
  const countryHero = path.join(countryDir, `${countrySlug}-hero.png`);
  const cityImg = localPath(imgUrl);
  if (!cityImg || !fs.existsSync(cityImg)) return true;
  const cityHash = imageHash(cityImg);
  return hamming(cityHash, imageHash(countryMini)) <= 4 || hamming(cityHash, imageHash(countryHero)) <= 4;
}

function cityHasDistinctImage(cityFile, imgUrl) {
  return !cityImageLooksLikeCountry(cityFile, imgUrl);
}

function textLocationCard(href, label, name) {
  return `<a class="country-path" href="${href}"><span>${label}</span><strong>Open ${htmlEscape(name)}</strong></a>`;
}

function fixCountryIndex(file) {
  const html = fs.readFileSync(file, 'utf8');
  const countryDir = path.dirname(file);
  let changed = false;
  const next = html.replace(/<a class="visual-topic-card visual-topic-card--city" href="([^"]+\.html)"><img src="([^"]+)"[^>]*><strong>Open ([^<]+)<\/strong><span>City<\/span><\/a>/g, (card, href, img, name) => {
    const cityFile = path.join(countryDir, href);
    if (fs.existsSync(cityFile) && cityHasDistinctImage(cityFile, img)) return card;
    changed = true;
    return textLocationCard(href, 'City', stripTags(name) || titleFromSlug(path.basename(href, '.html')));
  });
  if (changed) fs.writeFileSync(file, next, 'utf8');
  return changed;
}

function fixCityPage(file) {
  const html = fs.readFileSync(file, 'utf8');
  const countryDir = path.dirname(file);
  let changed = false;
  const next = html.replace(/<a class="visual-topic-card visual-topic-card--city" href="([^"]+\.html)"><img src="([^"]+)"[^>]*><strong>Open ([^<]+)<\/strong><span>City<\/span><\/a>/g, (card, href, img, name) => {
    const cityFile = path.join(countryDir, href);
    if (fs.existsSync(cityFile) && cityHasDistinctImage(cityFile, img)) return card;
    changed = true;
    return textLocationCard(href, 'City', stripTags(name) || titleFromSlug(path.basename(href, '.html')));
  });
  if (changed) fs.writeFileSync(file, next, 'utf8');
  return changed;
}

let countries = 0;
let cities = 0;
for (const file of walk(locationsRoot).filter((item) => item.endsWith('.html'))) {
  if (isCountryIndex(file) && fixCountryIndex(file)) countries++;
  if (isCityPage(file) && fixCityPage(file)) cities++;
}

console.log(`Reverted country-image city cards on ${countries} country pages and ${cities} city pages.`);
