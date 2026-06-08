import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const today = new Date('2026-06-08T00:00:00');
const indexPath = path.join(root, 'content/events/index.html');
const markerStart = '<!-- projected-legacy-editions:start -->';
const markerEnd = '<!-- projected-legacy-editions:end -->';

function attrs(source) {
  const out = {};
  const re = /([\w:-]+)=("[^"]*"|'[^']*')/g;
  let match;
  while ((match = re.exec(source))) out[match[1]] = match[2].slice(1, -1);
  return out;
}

function stripTags(source) {
  return String(source || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseCards(source) {
  const cards = [];
  const re = /<a\s+class="event-card"\s+([^>]*?)>([\s\S]*?)<\/a>/g;
  let match;
  while ((match = re.exec(source))) {
    const a = attrs(match[1]);
    const body = match[2];
    const title = stripTags((body.match(/<strong class="card-title">([\s\S]*?)<\/strong>/i) || [])[1]);
    const meta = stripTags((body.match(/<span class="card-meta">([\s\S]*?)<\/span>/i) || [])[1]);
    cards.push({ attrs: a, body, title, meta });
  }
  return cards;
}

function baseHref(href) {
  return (href || '').split('#')[0].split('?')[0];
}

function resolveEventPage(href) {
  const clean = baseHref(href);
  if (!clean) return '';
  if (clean.startsWith('/')) return path.join(root, clean.replace(/^\/+/, ''));
  return path.normalize(path.join(root, 'content/events', clean));
}

function dateObj(iso, endOfDay = false) {
  const date = new Date(`${iso}T${endOfDay ? '23:59:59' : '00:00:00'}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isPast(card) {
  const value = card.attrs['data-end'] || card.attrs['data-start'];
  const end = value ? dateObj(value, true) : null;
  return Boolean(end && end < today);
}

function html(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function projectedRows(allCards, href) {
  return allCards
    .filter((card) => baseHref(card.attrs.href) === baseHref(href) && ['2027', '2028'].includes(card.attrs['data-year']))
    .sort((a, b) => (a.attrs['data-start'] || '').localeCompare(b.attrs['data-start'] || ''));
}

function legacyBlock(rows) {
  const factRows = rows.map((row) => `<div class="fact-row"><span>${html(row.attrs['data-year'])}</span><strong>${html(row.meta)}</strong></div>`).join('');
  return `${markerStart}
        <div class="country-panel-card" data-projected-editions>
          <h2>Upcoming editions</h2>
          <div class="fact-table country-facts-tight">${factRows}</div>
          <p class="country-note">Expected dates are planning placeholders until the organizer confirms the next edition.</p>
        </div>
        ${markerEnd}`;
}

function frameBlock(rows) {
  const cards = rows.map((row) => `<article class="part-card"><span>${html(row.attrs['data-year'])}</span><h3>${html(row.meta)}</h3><p>Expected date. Verify the official event schedule before booking travel, tickets or accommodation.</p></article>`).join('');
  return `${markerStart}
        <div class="part-page__grid" data-projected-editions>${cards}</div>
        ${markerEnd}`;
}

const index = fs.readFileSync(indexPath, 'utf8');
const cards = parseCards(index);
let patched = 0;
const skipped = [];

for (const card of cards.filter(isPast)) {
  const file = resolveEventPage(card.attrs.href);
  if (!file || !fs.existsSync(file)) continue;
  let source = fs.readFileSync(file, 'utf8');
  if (source.includes('id="event-year-data"')) continue;
  const rows = projectedRows(cards, card.attrs.href);
  if (rows.length === 0) continue;
  source = source.replace(new RegExp(`\\s*${markerStart}[\\s\\S]*?${markerEnd}`, 'g'), '');
  if (source.includes('country-brief__panel') && source.includes('country-kpis')) {
    source = source.replace(/(<\/div>\s*<section class="edition-tabs edition-tabs--static")/, `</div>
        ${legacyBlock(rows)}
        <section class="edition-tabs edition-tabs--static"`);
    patched += 1;
  } else if (source.includes('event-frame__panel')) {
    source = source.replace(/(<div class="facts-strip facts-strip--edition")/, `${frameBlock(rows)}
        $1`);
    patched += 1;
  } else {
    skipped.push({ title: card.title, file });
    continue;
  }
  fs.writeFileSync(file, source, 'utf8');
}

console.log(JSON.stringify({ patched, skipped }, null, 2));
