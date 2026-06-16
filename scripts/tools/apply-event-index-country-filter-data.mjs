import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const INDEX_PATH = path.join(ROOT, 'content', 'events', 'index.html');
const LOCATIONS_ROOT = path.join(ROOT, 'content', 'locations');

function escRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function htmlText(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleCaseSlug(slug) {
  const special = {
    usa: 'United States',
    uk: 'United Kingdom',
    uae: 'United Arab Emirates'
  };
  return special[slug] || slug.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function readCountryName(continent, slug) {
  const file = path.join(LOCATIONS_ROOT, continent, slug, 'index.html');
  if (!fs.existsSync(file)) return titleCaseSlug(slug);
  const html = fs.readFileSync(file, 'utf8');
  return htmlText(
    html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
    || html.match(/<title>([^<|]+)/i)?.[1]
    || titleCaseSlug(slug)
  ).replace(/\s+-\s+OneSliders$/i, '');
}

function buildCountries() {
  const countries = [];
  for (const continentEntry of fs.readdirSync(LOCATIONS_ROOT, { withFileTypes: true })) {
    if (!continentEntry.isDirectory()) continue;
    const continent = continentEntry.name;
    if (continent === 'img' || continent === 'antarctica') continue;
    const continentDir = path.join(LOCATIONS_ROOT, continent);
    for (const countryEntry of fs.readdirSync(continentDir, { withFileTypes: true })) {
      if (!countryEntry.isDirectory()) continue;
      const slug = countryEntry.name;
      if (!fs.existsSync(path.join(continentDir, slug, 'index.html'))) continue;
      countries.push({ continent, slug, name: readCountryName(continent, slug) });
    }
  }
  return countries;
}

function aliasList(countries) {
  const aliases = [];
  for (const country of countries) {
    aliases.push({ alias: country.name, ...country });
    aliases.push({ alias: titleCaseSlug(country.slug), ...country });
  }
  aliases.push(
    { alias: 'USA', slug: 'usa', continent: 'north-america', name: 'United States' },
    { alias: 'U.S.', slug: 'usa', continent: 'north-america', name: 'United States' },
    { alias: 'US', slug: 'usa', continent: 'north-america', name: 'United States' },
    { alias: 'United States', slug: 'usa', continent: 'north-america', name: 'United States' },
    { alias: 'UK', slug: 'united-kingdom', continent: 'europe', name: 'United Kingdom' },
    { alias: 'U.K.', slug: 'united-kingdom', continent: 'europe', name: 'United Kingdom' },
    { alias: 'United Kingdom', slug: 'united-kingdom', continent: 'europe', name: 'United Kingdom' },
    { alias: 'UAE', slug: 'united-arab-emirates', continent: 'asia', name: 'United Arab Emirates' },
    { alias: 'South Korea', slug: 'south-korea', continent: 'asia', name: 'South Korea' },
    { alias: 'North Korea', slug: 'north-korea', continent: 'asia', name: 'North Korea' },
    { alias: 'Czech Republic', slug: 'czechia', continent: 'europe', name: 'Czechia' },
    { alias: 'Vatican City', slug: 'vatican-city', continent: 'europe', name: 'Vatican City' }
  );
  const seen = new Set();
  return aliases
    .filter((item) => {
      const key = `${item.alias.toLowerCase()}|${item.slug}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return item.alias && item.slug && item.continent;
    })
    .sort((a, b) => b.alias.length - a.alias.length);
}

function absoluteEventPath(href) {
  if (!href) return '';
  const normalized = href.replace(/\\/g, '/').replace(/^\.\.\//, 'content/');
  const noHash = normalized.split('#')[0];
  return path.join(ROOT, noHash);
}

function inferFromPage(href) {
  const file = absoluteEventPath(href);
  if (!file || !fs.existsSync(file)) return null;
  const html = fs.readFileSync(file, 'utf8');
  const urlMatch = html.match(/\/content\/locations\/([^/"']+)\/([^/"']+)\/index\.html/i);
  if (urlMatch) return { continent: urlMatch[1], slug: urlMatch[2], source: 'event-page-link' };
  const jsonMatch = html.match(/<script type="application\/json" id="event-year-data">([\s\S]*?)<\/script>/);
  if (jsonMatch) {
    try {
      const data = JSON.parse(jsonMatch[1]);
      const editions = Array.isArray(data.editions) ? data.editions : [];
      for (const edition of editions) {
        const countries = Array.isArray(edition.countries) ? edition.countries : [];
        for (const country of countries) {
          const match = String(country.url || '').match(/\/content\/locations\/([^/"']+)\/([^/"']+)\/index\.html/i);
          if (match) return { continent: match[1], slug: match[2], source: 'event-page-json' };
        }
      }
    } catch {
      return null;
    }
  }
  return null;
}

function inferFromCard(card, aliases) {
  const meta = htmlText(card.match(/<span class="card-meta">([\s\S]*?)<\/span>/)?.[1] || '');
  const title = htmlText(card.match(/<strong class="card-title">([\s\S]*?)<\/strong>/)?.[1] || '');
  const text = `${meta} ${title}`;
  for (const item of aliases) {
    const pattern = new RegExp(`(^|[^A-Za-z])${escRegExp(item.alias)}($|[^A-Za-z])`, 'i');
    if (pattern.test(text)) return { continent: item.continent, slug: item.slug, source: 'card-text' };
  }
  return null;
}

function addOrReplaceAttribute(tag, name, value) {
  if (new RegExp(`\\s${name}="[^"]*"`).test(tag)) {
    return tag.replace(new RegExp(`\\s${name}="[^"]*"`), ` ${name}="${value}"`);
  }
  if (/\sdata-topic="[^"]*"/.test(tag)) {
    return tag.replace(/(\sdata-topic="[^"]*")/, `$1 ${name}="${value}"`);
  }
  return tag.replace('<a class="event-card"', `<a class="event-card" ${name}="${value}"`);
}

function updateCard(card, inference) {
  if (!inference) return { card, changed: false };
  let next = card;
  const openTag = next.match(/^<a\b[^>]*>/)?.[0];
  if (!openTag) return { card, changed: false };
  let newTag = openTag;
  if (!/\sdata-cont="[^"]*"/.test(newTag)) newTag = addOrReplaceAttribute(newTag, 'data-cont', inference.continent);
  if (!/\sdata-country="[^"]*"/.test(newTag)) newTag = addOrReplaceAttribute(newTag, 'data-country', inference.slug);
  next = next.replace(openTag, newTag);
  return { card: next, changed: next !== card };
}

const countries = buildCountries();
const aliases = aliasList(countries);
const countryBySlug = new Map(countries.map((country) => [country.slug, country]));
let html = fs.readFileSync(INDEX_PATH, 'utf8');
const stats = {
  totalCards: 0,
  alreadyHadCountry: 0,
  updated: 0,
  fromPage: 0,
  fromCardText: 0,
  stillMissingCountry: 0,
  missingSamples: []
};

html = html.replace(/<a class="event-card"[\s\S]*?<\/a>/g, (card) => {
  stats.totalCards += 1;
  const href = card.match(/href="([^"]+)"/)?.[1] || '';
  const existingCountry = card.match(/\sdata-country="([^"]*)"/)?.[1] || '';
  const existingContinent = card.match(/\sdata-cont="([^"]*)"/)?.[1] || '';
  if (existingCountry && existingContinent) {
    stats.alreadyHadCountry += 1;
    return card;
  }
  let inference = null;
  if (existingCountry && countryBySlug.has(existingCountry)) {
    const country = countryBySlug.get(existingCountry);
    inference = { continent: country.continent, slug: existingCountry, source: 'existing-country' };
  }
  inference ||= inferFromPage(href);
  inference ||= inferFromCard(card, aliases);
  const result = updateCard(card, inference);
  if (result.changed) {
    stats.updated += 1;
    if (inference.source.startsWith('event-page')) stats.fromPage += 1;
    if (inference.source === 'card-text') stats.fromCardText += 1;
    return result.card;
  }
  stats.stillMissingCountry += 1;
  if (stats.missingSamples.length < 25) {
    stats.missingSamples.push({
      href,
      title: htmlText(card.match(/<strong class="card-title">([\s\S]*?)<\/strong>/)?.[1] || ''),
      meta: htmlText(card.match(/<span class="card-meta">([\s\S]*?)<\/span>/)?.[1] || '')
    });
  }
  return card;
});

fs.writeFileSync(INDEX_PATH, html, 'utf8');
console.log(JSON.stringify(stats, null, 2));
