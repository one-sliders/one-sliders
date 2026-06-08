import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const today = new Date('2026-06-08T00:00:00');
const indexPath = path.join(root, 'content/events/index.html');
const compactPath = path.join(root, 'content/events/events-compact.json');
const weekPath = path.join(root, 'content/events/this-week.html');
const projectionYears = [2027, 2028];
const blockStart = '<!-- projected-future-events:start -->';
const blockEnd = '<!-- projected-future-events:end -->';

function attrs(source) {
  const out = {};
  const re = /([\w:-]+)=("[^"]*"|'[^']*')/g;
  let match;
  while ((match = re.exec(source))) out[match[1]] = match[2].slice(1, -1);
  return out;
}

function attrString(attrs) {
  return Object.entries(attrs)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}="${html(value)}"`)
    .join(' ');
}

function html(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function unescapeHtml(source) {
  return String(source ?? '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function stripTags(source) {
  return unescapeHtml(String(source ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}

function dateObj(iso, endOfDay = false) {
  const date = new Date(`${iso}T${endOfDay ? '23:59:59' : '00:00:00'}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function addDays(iso, days) {
  const date = dateObj(iso);
  if (!date) return iso;
  date.setDate(date.getDate() + days);
  return toIso(date);
}

function toIso(date) {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 10);
}

function projectIso(iso, year) {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso || '') ? `${year}${iso.slice(4)}` : '';
}

function sameDay(a, b) {
  return a && b && a === b;
}

function displayDateRange(start, end) {
  const startDate = dateObj(start);
  const endDate = dateObj(end || start);
  if (!startDate || !endDate) return 'Date expected';
  const monthFmt = new Intl.DateTimeFormat('en', { month: 'short' });
  const fullFmt = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' });
  if (sameDay(start, end)) return fullFmt.format(startDate);
  if (startDate.getFullYear() === endDate.getFullYear() && startDate.getMonth() === endDate.getMonth()) {
    return `${startDate.getDate()}-${endDate.getDate()} ${monthFmt.format(startDate)} ${startDate.getFullYear()}`;
  }
  return `${fullFmt.format(startDate)} - ${fullFmt.format(endDate)}`;
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

function textBetween(body, re) {
  return stripTags(re.exec(body)?.[1] || '');
}

function parseCards(source) {
  const cards = [];
  const re = /<a\s+class="event-card"\s+([^>]*?)>([\s\S]*?)<\/a>/g;
  let match;
  while ((match = re.exec(source))) {
    const a = attrs(match[1]);
    const body = match[2];
    const image = /<img[^>]*class="card-thumb"[^>]*src="([^"]+)"/i.exec(body)?.[1] || '';
    const title = textBetween(body, /<strong class="card-title">([\s\S]*?)<\/strong>/i);
    const meta = textBetween(body, /<span class="card-meta">([\s\S]*?)<\/span>/i);
    cards.push({ attrs: a, body, image, title, meta, raw: match[0] });
  }
  return cards;
}

function isPastCard(card) {
  const end = card.attrs['data-end'] || card.attrs['data-start'];
  const endDate = end ? dateObj(end, true) : null;
  return Boolean(endDate && endDate < today);
}

function projectedMeta(card, start, end) {
  const datePart = displayDateRange(start, end);
  const original = card.meta || '';
  const location = original.includes(' - ') ? original.split(' - ').slice(1).join(' - ') : '';
  return location ? `${datePart} - expected - ${location}` : `${datePart} - expected`;
}

function projectedCard(card, year) {
  const start = projectIso(card.attrs['data-start'], year);
  const end = projectIso(card.attrs['data-end'] || card.attrs['data-start'], year);
  const a = { ...card.attrs };
  a.href = `${baseHref(a.href)}#year-${year}`;
  a['data-start'] = start;
  a['data-end'] = end;
  a['data-year'] = String(year);
  a['data-date-status'] = 'estimated';
  a['data-official-date'] = 'false';
  a['data-keywords'] = [a['data-keywords'], `${card.title} ${year} expected date`].filter(Boolean).join(' ');
  const body = card.body.replace(
    /<span class="card-meta">[\s\S]*?<\/span>/i,
    `<span class="card-meta">${html(projectedMeta(card, start, end))}</span>`
  );
  return `        <a class="event-card" ${attrString(a)}>${body}</a>`;
}

function countryName(country) {
  return country?.name || 'TBC';
}

function cityName(edition) {
  return edition?.cities?.[0]?.name || 'TBC';
}

function editionForProjection(data) {
  return (data.editions || []).find((edition) => edition.year === 2026)
    || (data.editions || []).filter((edition) => Number(edition.year) < 2027).sort((a, b) => Number(b.year) - Number(a.year))[0]
    || (data.editions || [])[0];
}

function projectedEdition(data, baseEdition, card, year) {
  const start = projectIso(card.attrs['data-start'], year);
  const inclusiveEnd = projectIso(card.attrs['data-end'] || card.attrs['data-start'], year);
  const dates = displayDateRange(start, inclusiveEnd);
  const countries = baseEdition?.countries || [];
  const city = cityName(baseEdition);
  const country = countryName(countries[0]);
  return {
    year,
    headingPlace: city && city !== 'TBC' ? `in ${city}` : (baseEdition?.headingPlace || ''),
    status: 'upcoming',
    statusLabel: 'Expected',
    startDate: start,
    endExclusive: addDays(inclusiveEnd, 1),
    nextDate: projectIso(card.attrs['data-start'], year + 1),
    dates,
    countries,
    cities: baseEdition?.cities || [],
    venue: baseEdition?.venue || 'TBC',
    format: baseEdition?.format || 'Event',
    countdownText: 'Expected date based on the current event calendar pattern; verify the official schedule before booking.',
    liveLabel: 'Expected date',
    calendarDescription: `${data.eventName || card.title} ${year}.`,
    questions: [
      { q: 'When is the event?', a: dates, detail: 'Expected date based on the current OneSliders projection while the official future edition is not yet confirmed here.' },
      { q: 'Where is it held?', a: [baseEdition?.venue, city, country].filter(Boolean).join(', '), detail: 'Use the official event site before booking travel, tickets or accommodation.' },
      { q: 'What changed?', a: 'Future edition placeholder', detail: 'This keeps the evergreen event page pointing at the next planning edition instead of a completed occurrence.' }
    ],
    highlights: [
      { label: 'Planning status', title: 'Expected date', detail: 'Treat this as a planning placeholder until the organizer publishes the confirmed schedule.' },
      { label: 'Travel note', title: 'Verify before booking', detail: 'Tickets, venue access, host city details and dates can shift by edition.' }
    ],
    lifecycleLabel: 'Planning',
    result: 'Not played yet; future edition details are expected and should be verified against the official organizer.',
    resultLabel: 'Expected date',
    winner: null,
    scoreProgression: baseEdition?.scoreProgression
      ? { rounds: ['R1', 'R2', 'R3', 'R4'], players: [], limit: 10, emptyText: 'Leaderboard graph appears after the edition is played.', note: 'Future edition placeholder.', ariaLabel: `${data.eventName || card.title} ${year} future edition leaderboard placeholder` }
      : undefined,
    historyNotice: null,
    hasEspnLeaderboard: false,
    leaderboardSourceUrl: ''
  };
}

function patchEventYearData(card, years) {
  const file = resolveEventPage(card.attrs.href);
  if (!file || !fs.existsSync(file)) return { patched: false, reason: 'missing-page' };
  let source = fs.readFileSync(file, 'utf8');
  const match = source.match(/<script type="application\/json" id="event-year-data">([\s\S]*?)<\/script>/);
  if (!match) return { patched: false, reason: 'no-year-data' };
  let data;
  try {
    data = JSON.parse(match[1]);
  } catch {
    return { patched: false, reason: 'bad-json' };
  }
  data.editions ||= [];
  const base = editionForProjection(data);
  if (!base) return { patched: false, reason: 'no-base-edition' };
  let changed = false;
  for (const year of years) {
    if (data.editions.some((edition) => Number(edition.year) === year)) continue;
    data.editions.push(projectedEdition(data, base, card, year));
    changed = true;
  }
  if (!changed) return { patched: false, reason: 'already-has-years' };
  data.editions.sort((a, b) => Number(a.year) - Number(b.year));
  data.defaultYear = data.editions.some((edition) => Number(edition.year) === 2027) ? 2027 : data.defaultYear;
  data.lastUpdated = '8 June 2026';
  data.sources ||= [];
  if (!data.sources.some((sourceItem) => sourceItem.label === 'OneSliders expected future edition projection')) {
    data.sources.push({ label: 'OneSliders expected future edition projection', url: '/content/events/index.html' });
  }
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  source = source.replace(match[0], `<script type="application/json" id="event-year-data">${json}</script>`);
  fs.writeFileSync(file, source, 'utf8');
  return { patched: true, file };
}

function compactRowsFromIndex(source) {
  return parseCards(source).map((card) => {
    const href = card.attrs.href || '';
    const slug = (href.split('/').pop() || '').replace(/\.html(?:#.*)?(?:\?.*)?$/, '');
    const row = {
      title: card.title,
      meta: card.meta,
      href,
      image: card.image,
      start: card.attrs['data-start'] || '',
      end: card.attrs['data-end'] || '',
      cat: card.attrs['data-cat'] || '',
      topic: card.attrs['data-topic'] || '',
      reach: card.attrs['data-reach'] || '',
      slug
    };
    if (card.attrs['data-year']) row.year = card.attrs['data-year'];
    if (card.attrs['data-date-status']) row.dateStatus = card.attrs['data-date-status'];
    if (card.attrs['data-official-date']) row.officialDate = card.attrs['data-official-date'];
    return row;
  });
}

let index = fs.readFileSync(indexPath, 'utf8');
index = index.replace(new RegExp(`\\s*${blockStart}[\\s\\S]*?${blockEnd}\\r?\\n?`, 'g'), '\n');
const cards = parseCards(index);
const existingFutureKeys = new Set(cards.map((card) => `${baseHref(card.attrs.href)}::${card.attrs['data-year'] || (card.attrs['data-start'] || '').slice(0, 4)}`));
const projectedCards = [];
const pagePatchStats = { patched: 0, missingPage: 0, noYearData: 0, skipped: 0 };

for (const card of cards.filter(isPastCard)) {
  const yearsToCreate = projectionYears.filter((year) => {
    if (!card.attrs['data-start']) return false;
    return !existingFutureKeys.has(`${baseHref(card.attrs.href)}::${year}`);
  });
  if (yearsToCreate.length === 0) continue;
  const patch = patchEventYearData(card, yearsToCreate);
  if (patch.patched) pagePatchStats.patched += 1;
  else if (patch.reason === 'missing-page') pagePatchStats.missingPage += 1;
  else if (patch.reason === 'no-year-data') pagePatchStats.noYearData += 1;
  else pagePatchStats.skipped += 1;
  for (const year of yearsToCreate) {
    projectedCards.push(projectedCard(card, year));
    existingFutureKeys.add(`${baseHref(card.attrs.href)}::${year}`);
  }
}

if (projectedCards.length) {
  const block = `\n    ${blockStart}\n${projectedCards.join('\n')}\n    ${blockEnd}\n`;
  index = index.replace(/(\s*<\/main>\s*<footer class="site-footer">)/, `${block}$1`);
}
fs.writeFileSync(indexPath, index, 'utf8');

const rows = compactRowsFromIndex(index);
fs.writeFileSync(compactPath, JSON.stringify(rows), 'utf8');

let week = fs.readFileSync(weekPath, 'utf8');
week = week.replace(
  /<script type="application\/json" id="event-data">[\s\S]*?<\/script>/,
  `<script type="application/json" id="event-data">${JSON.stringify(rows)}</script>`
);
fs.writeFileSync(weekPath, week, 'utf8');

console.log(JSON.stringify({
  projectedCards: projectedCards.length,
  compactRows: rows.length,
  pagePatchStats
}, null, 2));
