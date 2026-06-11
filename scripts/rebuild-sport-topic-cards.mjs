import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const today = Date.parse('2026-06-11T00:00:00Z');
const maxCards = 8;

const registryPath = path.join(root, 'content', 'events', 'events-compact.json');
const sportDir = path.join(root, 'content', 'categories', 'sport');
const events = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
  const [year, month, day] = value.split('-').map(Number);
  return { year, month: month - 1, day, time: Date.parse(`${value}T00:00:00Z`) };
}

function dateTime(value) {
  return parseDate(value)?.time ?? Number.POSITIVE_INFINITY;
}

function formatCardDate(event) {
  const start = parseDate(event.start);
  const end = parseDate(event.end);

  if (start && end && event.start !== event.end) {
    if (start.year === end.year && start.month === end.month) {
      return `${start.day}-${end.day} ${months[start.month]} ${start.year}`;
    }
    if (start.year === end.year) {
      return `${start.day} ${months[start.month]}-${end.day} ${months[end.month]} ${start.year}`;
    }
    return `${start.day} ${months[start.month]} ${start.year}-${end.day} ${months[end.month]} ${end.year}`;
  }

  if (start) return `${start.day} ${months[start.month]} ${start.year}`;
  if (end) return `${end.day} ${months[end.month]} ${end.year}`;

  const meta = String(event.meta || '').trim();
  if (/\b\d{4}\b.*\bTBC\b/i.test(meta)) return meta;
  return 'Date TBC';
}

function cardLocation(event) {
  const meta = String(event.meta || '').trim();
  if (!meta || /\bdate\s+TBC\b/i.test(meta)) return '';

  const parts = meta.split(/\s+-\s*/).map((part) => part.trim());
  const last = parts.at(-1) || '';
  if (!last || /^expected$/i.test(last)) return '';
  if (/\b\d{4}\b/.test(last) && !/[A-Za-z]{3,}.*[,/]/.test(last)) return '';
  return last;
}

function absoluteContentPath(value) {
  return String(value || '')
    .replace(/^\.\.\/categories\//, '/content/categories/')
    .replace(/^\.\//, '/content/categories/sport/');
}

function baseHref(href) {
  return absoluteContentPath(href).split(/[?#]/)[0];
}

function slugFromHref(href) {
  return baseHref(href).replace(/\.html$/, '').split('/').pop();
}

function imageFor(event, topic) {
  if (event.image) return absoluteContentPath(event.image);
  const slug = event.slug || slugFromHref(event.href);
  return `/content/categories/sport/${topic}/events/img/${slug}-mini.png`;
}

function sortEvents(a, b) {
  const aEnd = dateTime(a.end || a.start);
  const bEnd = dateTime(b.end || b.start);
  const aPast = aEnd < today;
  const bPast = bEnd < today;
  if (aPast !== bPast) return aPast ? 1 : -1;

  const aStart = dateTime(a.start || a.end);
  const bStart = dateTime(b.start || b.end);
  if (aStart !== bStart) return aStart - bStart;

  return String(a.title || '').localeCompare(String(b.title || ''));
}

function topicEvents(topic) {
  const seen = new Set();
  return events
    .filter((event) => {
      const href = String(event.href || '');
      return event.topic === topic && href.includes(`/categories/sport/${topic}/events/`);
    })
    .sort(sortEvents)
    .filter((event) => {
      const key = baseHref(event.href);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, maxCards);
}

function stripTags(value) {
  return String(value || '').replace(/<[^>]*>/g, '').trim();
}

function locationLooksUseful(value) {
  const text = stripTags(value);
  return Boolean(text) && !/^(Sport|expected|Annual event|2026 watchlist)$/i.test(text);
}

function locationFallbacks(html) {
  const map = new Map();
  for (const [card] of html.matchAll(/<a class="event-card"[\s\S]*?<\/a>/g)) {
    const href = card.match(/\shref="([^"]+)"/)?.[1] || '';
    const title = stripTags(card.match(/<strong>([\s\S]*?)<\/strong>/)?.[1] || '');
    const location = stripTags(card.match(/<p>([\s\S]*?)<\/p>/)?.[1] || '');
    if (!locationLooksUseful(location)) continue;
    if (href) map.set(baseHref(href), location);
    if (title) map.set(`title:${title.replace(/\s+\d{4}$/, '')}`, location);
  }
  return map;
}

function headHtml(relativePath) {
  try {
    return execFileSync('git', ['show', `HEAD:${relativePath.replace(/\\/g, '/')}`], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    });
  } catch {
    return '';
  }
}

function locationFor(event, fallbacks) {
  const central = cardLocation(event);
  if (central) return central;
  const title = String(event.title || '').replace(/\s+\d{4}$/, '');
  return fallbacks.get(baseHref(event.href)) || fallbacks.get(`title:${title}`) || '';
}

function renderCard(event, topic, fallbacks) {
  const href = absoluteContentPath(event.href);
  const img = imageFor(event, topic);
  const startAttr = event.start ? ` data-start="${esc(event.start)}"` : '';
  const endAttr = event.end ? ` data-end="${esc(event.end)}"` : '';
  const dateStatusAttr = event.dateStatus ? ` data-date-status="${esc(event.dateStatus)}"` : '';
  const officialDateAttr = event.officialDate ? ` data-official-date="${esc(event.officialDate)}"` : '';
  const reachAttr = event.reach ? ` data-reach="${esc(event.reach)}"` : '';
  const date = formatCardDate(event);
  const location = locationFor(event, fallbacks);

  return `<a class="event-card"${startAttr}${endAttr}${dateStatusAttr}${officialDateAttr}${reachAttr} href="${esc(href)}"><img class="event-thumb" src="${esc(img)}" alt="${esc(event.title)} thumbnail" loading="lazy" width="400" height="300"><time>${esc(date)}</time><strong>${esc(event.title)}</strong><p>${esc(location)}</p></a>`;
}

function renderTopicEventCard(event, topic, fallbacks) {
  const href = absoluteContentPath(event.href);
  const img = imageFor(event, topic);
  const endAttr = event.end ? ` data-end="${esc(event.end)}"` : '';
  const startAttr = event.start ? ` data-start="${esc(event.start)}"` : '';
  const date = formatCardDate(event);
  const location = locationFor(event, fallbacks);

  return `<article class="topic-event-card"${startAttr}${endAttr}><img src="${esc(img)}" alt="${esc(event.title)} thumbnail" loading="lazy" width="400" height="300"><a class="topic-event-link" href="${esc(href)}"><strong>${esc(event.title)}</strong></a><span>${esc(date)} / ${esc(location)}</span></article>`;
}

const carouselBlockPattern = /(<div class="carousel"><div class="event-grid carousel-track" data-carousel-track>\s*)([\s\S]*?)(\s*<\/div><\/div>)/;
const plainGridBlockPattern = /(<div class="event-grid">\s*)([\s\S]*?)(\s*<\/div>\s*<\/section>)/;
const topicEventListPattern = /(<div class="topic-event-list" data-expiring-events>\s*)([\s\S]*?)(\s*<p class="topic-event-empty">[\s\S]*?<\/p>\s*<\/div>)/;
const report = [];

for (const file of fs.readdirSync(sportDir)) {
  if (!file.endsWith('.html') || file === 'index.html') continue;

  const topic = file.replace(/\.html$/, '');
  const cards = topicEvents(topic);
  const filePath = path.join(sportDir, file);
  const relativePath = path.relative(root, filePath);
  const html = fs.readFileSync(filePath, 'utf8');
  const fallbacks = new Map([
    ...locationFallbacks(headHtml(relativePath)),
    ...locationFallbacks(html)
  ]);

  if (!cards.length) {
    report.push(`${topic}: skipped, no central events`);
    continue;
  }

  let next = html;
  if (carouselBlockPattern.test(next)) {
    const cardHtml = cards.map((event) => renderCard(event, topic, fallbacks)).join('\n');
    next = next.replace(carouselBlockPattern, `$1${cardHtml}$3`);
  } else if (topicEventListPattern.test(next)) {
    const cardHtml = cards.map((event) => renderTopicEventCard(event, topic, fallbacks)).join('\n');
    next = next.replace(topicEventListPattern, `$1${cardHtml}$3`);
  } else if (plainGridBlockPattern.test(next)) {
    const cardHtml = cards.map((event) => renderCard(event, topic, fallbacks)).join('\n');
    next = next.replace(plainGridBlockPattern, `$1${cardHtml}$3`);
  } else {
    report.push(`${topic}: skipped, no supported event-card block`);
    continue;
  }

  fs.writeFileSync(filePath, next);
  report.push(`${topic}: ${cards.length} cards`);
}

console.log(report.join('\n'));
