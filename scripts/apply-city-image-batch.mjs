import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const siteBase = 'https://one-sliders.com';

function htmlEscape(value = '') {
  return String(value)
    .replace(/&(?!(?:[a-zA-Z]+|#\d+|#x[a-fA-F0-9]+);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function attrEscape(value = '') {
  return htmlEscape(value).replace(/"/g, '&quot;');
}

function stripTags(value = '') {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function titleFromSlug(slug) {
  return slug.split('-').map((part) => {
    if (!part) return part;
    if (part === 'dc') return 'DC';
    if (part === 'usa') return 'USA';
    return part[0].toUpperCase() + part.slice(1);
  }).join(' ');
}

function fileToUrl(file) {
  return `/${path.relative(root, file).replace(/\\/g, '/')}`;
}

function updateHeadImages(html, heroUrl) {
  const absoluteHero = `${siteBase}${heroUrl}`;
  let next = html;
  if (/<link rel="preload" as="image"/i.test(next)) {
    next = next.replace(/<link rel="preload" as="image" href="[^"]*">/i, `<link rel="preload" as="image" href="${attrEscape(heroUrl)}">`);
  }
  if (/<meta property="og:image"/i.test(next)) {
    next = next.replace(/<meta property="og:image" content="[^"]*">/i, `<meta property="og:image" content="${attrEscape(absoluteHero)}">`);
  }
  if (/<meta name="twitter:image"/i.test(next)) {
    next = next.replace(/<meta name="twitter:image" content="[^"]*">/i, `<meta name="twitter:image" content="${attrEscape(absoluteHero)}">`);
  }
  next = next.replace(/"image":"https:\/\/one-sliders\.com\/content\/locations\/[^"]+"/g, `"image":"${absoluteHero}"`);
  next = next.replace(/--country-hero-url: url\('[^']+'\)/, `--country-hero-url: url('${heroUrl}')`);
  return next;
}

function cityCard(href, cityName, miniUrl) {
  return `<a class="visual-topic-card visual-topic-card--city" href="${attrEscape(href)}"><img src="${attrEscape(miniUrl)}" alt="${attrEscape(cityName)} thumbnail" loading="lazy" width="400" height="300"><strong>Open ${htmlEscape(cityName)}</strong><span>City</span></a>`;
}

function updateCityLinkCards(file, targets) {
  const html = fs.readFileSync(file, 'utf8');
  let changed = false;
  const next = html.replace(/<a class="(?:country-path|visual-topic-card visual-topic-card--city)" href="([^"]+\.html)">([\s\S]*?)<\/a>/g, (link, href, body) => {
    const slug = path.basename(href, '.html');
    const target = targets.get(slug);
    if (!target) return link;
    const label = stripTags(/<span>([\s\S]*?)<\/span>/i.exec(body)?.[1] || '');
    if (!/^City$/i.test(label)) return link;
    changed = true;
    return cityCard(href, target.cityName, target.miniUrl);
  });
  if (changed) {
    const wrapped = next.replace(/<div class="country-paths(?: country-paths--location-links)?">([\s\S]*?)<\/div>/, '<div class="country-paths country-paths--location-links">$1</div>');
    fs.writeFileSync(file, wrapped, 'utf8');
  }
  return changed;
}

const cityPages = process.argv.slice(2);
if (!cityPages.length) {
  console.error('Usage: node scripts/apply-city-image-batch.mjs <city-page.html> [...]');
  process.exit(1);
}

const byDir = new Map();
let updatedCityPages = 0;

for (const cityPageArg of cityPages) {
  const cityPage = path.resolve(root, cityPageArg);
  const cityDir = path.dirname(cityPage);
  const citySlug = path.basename(cityPage, '.html');
  const heroFile = path.join(cityDir, 'img', `${citySlug}-hero.png`);
  const miniFile = path.join(cityDir, 'img', `${citySlug}-mini.png`);
  if (!fs.existsSync(cityPage) || !fs.existsSync(heroFile) || !fs.existsSync(miniFile)) {
    console.warn(`Skipping ${cityPageArg}: missing page, hero, or mini.`);
    continue;
  }
  const heroUrl = fileToUrl(heroFile);
  const miniUrl = fileToUrl(miniFile);
  const cityName = titleFromSlug(citySlug);
  const html = fs.readFileSync(cityPage, 'utf8');
  const next = updateHeadImages(html, heroUrl);
  if (next !== html) {
    fs.writeFileSync(cityPage, next, 'utf8');
    updatedCityPages++;
  }
  if (!byDir.has(cityDir)) byDir.set(cityDir, new Map());
  byDir.get(cityDir).set(citySlug, { cityName, miniUrl });
}

let updatedLinkPages = 0;
for (const [cityDir, targets] of byDir) {
  const pages = fs.readdirSync(cityDir)
    .filter((name) => name.endsWith('.html'))
    .map((name) => path.join(cityDir, name));
  for (const page of pages) {
    if (updateCityLinkCards(page, targets)) updatedLinkPages++;
  }
}

console.log(`Updated ${updatedCityPages} city pages and ${updatedLinkPages} location-link pages.`);
