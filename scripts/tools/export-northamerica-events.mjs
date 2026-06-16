import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const html = fs.readFileSync(path.join(root, 'content/events/index.html'), 'utf8');
const outputPath = path.join(root, 'north-america-events.csv');
const today = new Date('2026-06-11T00:00:00');

const countryNames = {
  'antigua-and-barbuda': 'Antigua and Barbuda',
  bahamas: 'Bahamas',
  barbados: 'Barbados',
  belize: 'Belize',
  canada: 'Canada',
  'costa-rica': 'Costa Rica',
  cuba: 'Cuba',
  dominica: 'Dominica',
  'dominican-republic': 'Dominican Republic',
  'el-salvador': 'El Salvador',
  grenada: 'Grenada',
  guatemala: 'Guatemala',
  haiti: 'Haiti',
  honduras: 'Honduras',
  jamaica: 'Jamaica',
  mexico: 'Mexico',
  nicaragua: 'Nicaragua',
  panama: 'Panama',
  'saint-kitts-and-nevis': 'Saint Kitts and Nevis',
  'saint-lucia': 'Saint Lucia',
  'saint-vincent-and-the-grenadines': 'Saint Vincent and the Grenadines',
  'trinidad-and-tobago': 'Trinidad and Tobago',
  usa: 'United States',
};

const countryAliases = new Map([
  ['usa', 'United States'],
  ['us', 'United States'],
  ['u.s.', 'United States'],
  ['u.s', 'United States'],
  ['united states', 'United States'],
  ['canada', 'Canada'],
  ['mexico', 'Mexico'],
  ['panama', 'Panama'],
  ['costa rica', 'Costa Rica'],
  ['jamaica', 'Jamaica'],
  ['cuba', 'Cuba'],
  ['dominican republic', 'Dominican Republic'],
  ['bahamas', 'Bahamas'],
  ['barbados', 'Barbados'],
  ['trinidad and tobago', 'Trinidad and Tobago'],
]);

function clean(value) {
  return String(value ?? '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function attrs(value) {
  const output = {};
  for (const match of value.matchAll(/\s([a-zA-Z0-9_-]+)="([^"]*)"/g)) {
    output[match[1]] = clean(match[2]);
  }
  return output;
}

function eventIdentity(card) {
  return (card.href || '').split('#')[0].split('?')[0].replace(/\/+$/, '');
}

function isCurrentOrUpcoming(card) {
  const end = card.end || card.start;
  if (!end) return true;
  const endDate = new Date(`${end}T00:00:00`);
  return Number.isNaN(endDate.getTime()) || endDate >= today;
}

function titleCaseSlug(value) {
  return String(value || '').replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function countryFromSlug(slug) {
  return countryNames[slug] || titleCaseSlug(slug);
}

function locationFromMeta(meta) {
  const parts = meta.split(' - ').map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return '';
  const location = parts.at(-1).replace(/\s+-\s*$/, '').trim();
  return /^(expected|tbc)$/i.test(location) ? '' : location;
}

function normalizeCountryToken(token) {
  const key = token.trim().toLowerCase();
  return countryAliases.get(key) || token.trim();
}

function countryFromLocation(location, fallbackSlug) {
  if (!location) return countryFromSlug(fallbackSlug);
  const normalizedLocation = location.replace(/\bUSA\b/g, 'United States');
  const slashParts = normalizedLocation.split(/\s*\/\s*/);
  if (slashParts.length > 1) {
    const countries = slashParts
      .map((part) => part.split(',').pop())
      .map((part) => {
        const normalized = normalizeCountryToken(part);
        return normalized === part.trim() ? '' : normalized;
      })
      .filter(Boolean);
    const unique = [...new Set(countries)];
    if (unique.length > 1) return unique.join(' / ');
    if (unique.length === 1) return unique[0];
  }
  const last = normalizedLocation.split(',').pop().trim();
  const normalized = normalizeCountryToken(last);
  return normalized === last ? countryFromSlug(fallbackSlug) : normalized;
}

function cityFromLocation(location, country, title = '') {
  if (!location) return 'TBC';
  if (/^(expected|tbc)$/i.test(location)) return 'TBC';
  if (title && location.toLowerCase() === title.toLowerCase()) return 'TBC';
  if (/\bvs\b/i.test(location)) return 'TBC';
  if (/^\d{1,2}\s+\w+\s+\d{4}/.test(location)) return 'TBC';
  const withoutExpected = location.replace(/\s*\((?:expected|TBC)\)\s*/gi, '').trim();
  if (withoutExpected.includes('/')) {
    const first = withoutExpected.split('/')[0].trim();
    return first.replace(/,\s*(USA|United States|Canada|Mexico)$/i, '').trim() || 'TBC';
  }
  const parts = withoutExpected.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length > 1) return parts.slice(0, -1).join(', ');
  const countryOnly = country && parts[0]?.toLowerCase() === country.toLowerCase();
  return countryOnly ? 'TBC' : parts[0] || 'TBC';
}

function pagePathFromHref(href) {
  const cleanHref = String(href || '').split('#')[0].split('?')[0];
  if (!cleanHref) return '';
  return path.normalize(path.join(root, 'content/events', cleanHref));
}

function first(htmlText, patterns) {
  for (const pattern of patterns) {
    const match = htmlText.match(pattern);
    if (match) return clean(match[1]);
  }
  return '';
}

function fact(htmlText, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return first(htmlText, [
    new RegExp(`<div class=["'][^"']*(?:fact|country-kpi)[^"']*["'][^>]*>\\s*<span>${escaped}<\\/span>\\s*<strong>([\\s\\S]*?)<\\/strong>`, 'i'),
    new RegExp(`<div class=["'][^"']*fact-row[^"']*["'][^>]*>\\s*<span>${escaped}<\\/span>\\s*<strong>([\\s\\S]*?)<\\/strong>`, 'i'),
  ]);
}

function detailLocation(card) {
  const filePath = pagePathFromHref(card.href);
  if (!filePath || !fs.existsSync(filePath)) return {};
  const detailHtml = fs.readFileSync(filePath, 'utf8');
  const dataMatch = detailHtml.match(/<script[^>]+id=["']event-year-data["'][^>]*>([\s\S]*?)<\/script>/i);
  if (dataMatch) {
    try {
      const data = JSON.parse(dataMatch[1]);
      const wantedYear = card['data-year'] || card.start?.slice(0, 4) || data.defaultYear;
      const edition = data.editions?.find((item) => String(item.year) === String(wantedYear))
        || data.editions?.find((item) => item.year === data.defaultYear)
        || data.editions?.at(-1);
      if (edition) {
        return {
          country: edition.countries?.map((item) => normalizeCountryToken(item.name || item)).filter(Boolean).join(' / ') || '',
          city: edition.cities?.map((item) => item.name || item).filter(Boolean).join(' / ') || '',
        };
      }
    } catch {
      // Fall back to visible facts below.
    }
  }
  return {
    country: normalizeCountryToken(fact(detailHtml, 'Country')) || '',
    city: fact(detailHtml, 'City') || '',
  };
}

function csvEscape(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

const cards = [];
for (const match of html.matchAll(/<a\b([^>]*class="[^"]*\bevent-card\b[^"]*"[^>]*)>([\s\S]*?)<\/a>/g)) {
  const attr = attrs(match[1]);
  const body = match[2];
  cards.push({
    ...attr,
    title: clean(body.match(/<strong class="card-title">([\s\S]*?)<\/strong>/)?.[1] || ''),
    meta: clean(body.match(/<span class="card-meta">([\s\S]*?)<\/span>/)?.[1] || ''),
  });
}

const northAmerica = cards
  .filter((card) => isCurrentOrUpcoming(card))
  .filter((card) => (card['data-cont'] || card.cont) === 'north-america')
  .filter((card, index, all) => {
    const key = eventIdentity(card) || card.title.toLowerCase();
    return all.findIndex((candidate) => (eventIdentity(candidate) || candidate.title.toLowerCase()) === key) === index;
  })
  .map((card) => {
    const countrySlug = card['data-country'] || card.country || '';
    const location = locationFromMeta(card.meta);
    let country = countryFromLocation(location, countrySlug);
    let city = cityFromLocation(location, country, card.title);
    if (city === 'TBC') {
      const detail = detailLocation(card);
      country = detail.country || country;
      city = detail.city || city;
    }
    return {
      Titel: card.title,
      Land: country,
      Stad: city || 'TBC',
      Från: card['data-start'] || card.start || 'TBC',
      Till: card['data-end'] || card.end || card['data-start'] || card.start || 'TBC',
    };
  });

const csv = [
  '"Titel";"Land";"Stad";"Från";"Till"',
  ...northAmerica.map((row) => [row.Titel, row.Land, row.Stad, row.Från, row.Till].map(csvEscape).join(';')),
].join('\r\n') + '\r\n';

fs.writeFileSync(outputPath, `\uFEFF${csv}`, 'utf8');

console.log(`Wrote ${northAmerica.length} rows to ${path.basename(outputPath)}`);
