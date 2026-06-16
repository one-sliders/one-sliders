import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const locationsRoot = path.join(root, 'content', 'locations');
const python = process.env.CODEX_PYTHON || 'C:\\Users\\AndersEriksson\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe';
const siteBase = 'https://one-sliders.com';

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function slash(value) {
  return value.replace(/\\/g, '/');
}

function fileToUrl(file) {
  return `/${slash(path.relative(root, file))}`;
}

function htmlEscape(value = '') {
  return String(value)
    .replace(/&(?!(?:[a-zA-Z]+|#\d+|#x[a-fA-F0-9]+);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function attrEscape(value = '') {
  return htmlEscape(value).replace(/"/g, '&quot;');
}

function titleFromSlug(slug) {
  return slug.split('-').map((part) => {
    if (!part) return part;
    if (part === 'usa') return 'USA';
    return part[0].toUpperCase() + part.slice(1);
  }).join(' ');
}

function stripTags(value = '') {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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

function existing(...files) {
  return files.find((file) => file && fs.existsSync(file)) || '';
}

function imagePairSource(pageFile, slug, continentSlug, countrySlug = '') {
  const dir = path.dirname(pageFile);
  const imgDir = path.join(dir, 'img');
  const localHero = path.join(imgDir, `${slug}-hero.png`);
  const localMini = path.join(imgDir, `${slug}-mini.png`);
  const countryDir = countrySlug ? path.join(locationsRoot, continentSlug, countrySlug) : dir;
  const countryHero = path.join(countryDir, 'img', `${countrySlug || slug}-hero.png`);
  const countryMini = path.join(countryDir, 'img', `${countrySlug || slug}-mini.png`);
  const continentMini = path.join(locationsRoot, continentSlug, 'img', `${continentSlug}-mini.png`);
  const continentHero = path.join(locationsRoot, continentSlug, 'img', `${continentSlug}-hero.png`);
  return {
    imgDir,
    hero: localHero,
    mini: localMini,
    source: existing(localHero, localMini, countryHero, countryMini, continentMini, continentHero),
  };
}

function imagePairSourceStrictLocal(pageFile, slug) {
  const dir = path.dirname(pageFile);
  const imgDir = path.join(dir, 'img');
  const localHero = path.join(imgDir, `${slug}-hero.png`);
  const localMini = path.join(imgDir, `${slug}-mini.png`);
  return {
    imgDir,
    hero: localHero,
    mini: localMini,
    source: existing(localHero, localMini),
  };
}

function ensureImagePair(pageFile, slug, continentSlug, countrySlug = '', options = {}) {
  const pair = options.strictLocal
    ? imagePairSourceStrictLocal(pageFile, slug)
    : imagePairSource(pageFile, slug, continentSlug, countrySlug);
  if (!pair.source) return { heroUrl: '', miniUrl: '', created: false };
  fs.mkdirSync(pair.imgDir, { recursive: true });
  const script = [
    'from PIL import Image',
    'from pathlib import Path',
    'import sys',
    'src, hero, mini = map(Path, sys.argv[1:4])',
    'im = Image.open(src).convert("RGB")',
    'def crop_resize(im, size):',
    '    tw, th = size',
    '    sw, sh = im.size',
    '    tr = tw / th',
    '    if sw / sh > tr:',
    '        nw = int(sh * tr)',
    '        left = (sw - nw) // 2',
    '        box = (left, 0, left + nw, sh)',
    '    else:',
    '        nh = int(sw / tr)',
    '        top = (sh - nh) // 2',
    '        box = (0, top, sw, top + nh)',
    '    return im.crop(box).resize(size, Image.Resampling.LANCZOS)',
    'force_mini = len(sys.argv) > 4 and sys.argv[4] == "force-mini"',
    'if (not hero.exists()) or hero.stat().st_size == 0:',
    '    crop_resize(im, (1200, 630)).save(hero, optimize=True)',
    'if force_mini or (not mini.exists()) or mini.stat().st_size == 0:',
    '    crop_resize(im, (400, 300)).save(mini, optimize=True)',
  ].join('\n');
  const args = ['-c', script, pair.source, pair.hero, pair.mini];
  if (options.forceMini) args.push('force-mini');
  execFileSync(python, args, { stdio: 'inherit' });
  return {
    heroUrl: fileToUrl(pair.hero),
    miniUrl: fileToUrl(pair.mini),
    created: true,
  };
}

function localPathFromUrl(url) {
  if (!url || /^https?:\/\//i.test(url)) return '';
  const clean = decodeURIComponent(url.split(/[?#]/)[0]).replace(/^\/+/, '');
  return path.join(root, clean);
}

function cityImageLooksLikeCountry(cityFile, imageUrl) {
  const imageFile = localPathFromUrl(imageUrl);
  if (!imageFile || !fs.existsSync(imageFile)) return true;
  const [continentSlug, countrySlug] = relParts(cityFile);
  const countryImgDir = path.join(locationsRoot, continentSlug, countrySlug, 'img');
  const countryImages = [
    path.join(countryImgDir, `${countrySlug}-mini.png`),
    path.join(countryImgDir, `${countrySlug}-hero.png`),
  ].filter((candidate) => fs.existsSync(candidate));
  if (!countryImages.length) return false;
  const cityReal = fs.realpathSync.native(imageFile);
  return countryImages.some((candidate) => fs.realpathSync.native(candidate) === cityReal);
}

function ensureCityImagePair(cityFile, citySlug, continentSlug, countrySlug) {
  const pair = ensureImagePair(cityFile, citySlug, continentSlug, countrySlug, { strictLocal: true, forceMini: true });
  if (!pair.heroUrl || !pair.miniUrl) return { heroUrl: '', miniUrl: '' };
  if (cityImageLooksLikeCountry(cityFile, pair.heroUrl) || cityImageLooksLikeCountry(cityFile, pair.miniUrl)) {
    return { heroUrl: '', miniUrl: '' };
  }
  return pair;
}

function updateHeadImages(html, heroUrl) {
  if (!heroUrl) return html;
  const absoluteHero = `${siteBase}${heroUrl}`;
  let next = html;
  if (/<link rel="preload" as="image"/i.test(next)) {
    next = next.replace(/<link rel="preload" as="image" href="[^"]*">/i, `<link rel="preload" as="image" href="${attrEscape(heroUrl)}">`);
  }
  if (/<meta property="og:image"/i.test(next)) {
    next = next.replace(/<meta property="og:image" content="[^"]*">/i, `<meta property="og:image" content="${attrEscape(absoluteHero)}">`);
  } else {
    next = next.replace(/(<meta property="og:title" content="[^"]*">)/i, `$1<meta property="og:image" content="${attrEscape(absoluteHero)}">`);
  }
  if (/<meta name="twitter:image"/i.test(next)) {
    next = next.replace(/<meta name="twitter:image" content="[^"]*">/i, `<meta name="twitter:image" content="${attrEscape(absoluteHero)}">`);
  }
  next = next.replace(/"image":"https:\/\/one-sliders\.com\/assets\/icons\/one-sliders-icon\.svg"/g, `"image":"${absoluteHero}"`);
  next = next.replace(/"image":"https:\/\/one-sliders\.com\/content\/locations\/[^"]+"/g, `"image":"${absoluteHero}"`);
  return next;
}

function updateCityPage(file) {
  const parts = relParts(file);
  const [continentSlug, countrySlug, cityFile] = parts;
  const citySlug = cityFile.replace(/\.html$/i, '');
  const pair = ensureCityImagePair(file, citySlug, continentSlug, countrySlug);
  if (!pair.heroUrl) return false;
  const html = fs.readFileSync(file, 'utf8');
  let next = updateHeadImages(html, pair.heroUrl);
  next = next.replace(/--country-hero-url: url\('[^']+'\)/, `--country-hero-url: url('${pair.heroUrl}')`);
  const countryIndex = path.join(path.dirname(file), 'index.html');
  const countryName = stripTags(/<a class="nav-back"[^>]*>\s*[\s\S]*?<span>([\s\S]*?)<\/span>/i.exec(next)?.[1] || titleFromSlug(countrySlug));
  const countryPair = ensureImagePair(countryIndex, countrySlug, continentSlug);
  next = next.replace(/<div class="country-paths(?: country-paths--location-links)?">([\s\S]*?)<\/div>/, (block, inner) => {
    const linkRe = /<a class="(?:country-path|visual-topic-card visual-topic-card--(?:city|country))" href="([^"]+)">([\s\S]*?)<\/a>/gi;
    let foundLocation = false;
    const rewritten = inner.replace(linkRe, (link, href, body) => {
      const label = stripTags(/<span>([\s\S]*?)<\/span>/i.exec(body)?.[1] || '');
      const strong = stripTags(/<strong>([\s\S]*?)<\/strong>/i.exec(body)?.[1] || '');
      if (/^Country$/i.test(label) || href === 'index.html') {
        const img = countryPair.miniUrl || countryPair.heroUrl;
        if (!img) return link;
        foundLocation = true;
        return `<a class="visual-topic-card visual-topic-card--country" href="${attrEscape(href)}"><img src="${attrEscape(img)}" alt="${attrEscape(countryName)} thumbnail" loading="lazy" width="400" height="300"><strong>Open ${htmlEscape(countryName)}</strong><span>Country</span></a>`;
      }
      const isCity = /City/i.test(label) || /^Open\s+/i.test(strong);
      if (!isCity || !href.endsWith('.html')) return link;
      const siblingFile = path.join(path.dirname(file), href);
      if (!fs.existsSync(siblingFile)) return link;
      const siblingSlug = path.basename(href, '.html');
      const siblingName = strong.replace(/^Open\s+/i, '').trim() || titleFromSlug(siblingSlug);
      const siblingPair = ensureCityImagePair(siblingFile, siblingSlug, continentSlug, countrySlug);
      const img = siblingPair.miniUrl || siblingPair.heroUrl;
      if (!img) return link;
      foundLocation = true;
      return `<a class="visual-topic-card visual-topic-card--city" href="${attrEscape(href)}"><img src="${attrEscape(img)}" alt="${attrEscape(siblingName)} thumbnail" loading="lazy" width="400" height="300"><strong>Open ${htmlEscape(siblingName)}</strong><span>City</span></a>`;
    });
    return foundLocation ? `<div class="country-paths country-paths--location-links">${rewritten}</div>` : block;
  });
  if (next !== html) {
    fs.writeFileSync(file, next, 'utf8');
    return true;
  }
  return false;
}

function cityNameFromLink(match) {
  return stripTags(match[2] || '').replace(/^Open\s+/i, '').trim();
}

function updateCountryIndex(file) {
  const parts = relParts(file);
  const [continentSlug, countrySlug] = parts;
  const countryDir = path.dirname(file);
  const countrySlugName = path.basename(countryDir);
  const countryPair = ensureImagePair(file, countrySlugName, continentSlug);
  const html = fs.readFileSync(file, 'utf8');
  let next = updateHeadImages(html, countryPair.heroUrl);
  next = next.replace(/<div class="country-paths(?: country-paths--location-links)?">([\s\S]*?)<\/div>/, (block, inner) => {
    const cityRe = /<a class="(?:country-path|visual-topic-card visual-topic-card--city)" href="([^"]+\.html)">([\s\S]*?)<\/a>/gi;
    let foundCity = false;
    const rewritten = inner.replace(cityRe, (link, href, body) => {
      const label = /<span>([\s\S]*?)<\/span>/i.exec(body)?.[1] || '';
      const strong = /<strong>([\s\S]*?)<\/strong>/i.exec(body)?.[1] || '';
      const isCity = /City/i.test(stripTags(label)) || /^Open\s+/i.test(stripTags(strong));
      if (!isCity) return link;
      const cityFile = path.join(countryDir, href);
      if (!fs.existsSync(cityFile)) return link;
      const citySlug = path.basename(href, '.html');
      const cityName = cityNameFromLink(['', href, strong]) || titleFromSlug(citySlug);
      const cityPair = ensureCityImagePair(cityFile, citySlug, continentSlug, countrySlug);
      const img = cityPair.miniUrl || cityPair.heroUrl;
      if (!img) return link;
      foundCity = true;
      return `<a class="visual-topic-card visual-topic-card--city" href="${attrEscape(href)}"><img src="${attrEscape(img)}" alt="${attrEscape(cityName)} thumbnail" loading="lazy" width="400" height="300"><strong>Open ${htmlEscape(cityName)}</strong><span>City</span></a>`;
    });
    return foundCity ? `<div class="country-paths country-paths--location-links">${rewritten}</div>` : block;
  });
  if (next !== html) {
    fs.writeFileSync(file, next, 'utf8');
    return true;
  }
  return false;
}

const scopeArg = process.argv.find((arg) => arg.startsWith('--scope='));
const scopeRoot = scopeArg ? path.resolve(root, scopeArg.slice('--scope='.length)) : locationsRoot;
if (!scopeRoot.startsWith(locationsRoot) || !fs.existsSync(scopeRoot)) {
  throw new Error(`Invalid --scope. Expected a path under ${locationsRoot}`);
}

const files = walk(scopeRoot).filter((file) => file.endsWith('.html'));
let countries = 0;
let cities = 0;
for (const file of files) {
  if (isCityPage(file) && updateCityPage(file)) cities++;
  if (isCountryIndex(file) && updateCountryIndex(file)) countries++;
}
console.log(`Updated ${countries} country pages and ${cities} city pages.`);
