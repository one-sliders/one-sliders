import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const topicPath = path.join(root, 'content/categories/culture/national-day.html');
const eventsDir = path.join(root, 'content/categories/culture/national-day/events');

const esc = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

function dateText(edition) {
  if (edition?.dates) return edition.dates;
  return 'Date missing';
}

function countryLink(country) {
  if (!country?.name || !country?.url || !country?.flag) return '';
  return `<a class="country" href="${esc(country.url)}"><img src="${esc(country.flag)}" alt="" width="20" height="14" loading="lazy">${esc(country.name)}</a>`;
}

const cards = [];
for (const file of fs.readdirSync(eventsDir).filter((name) => name.endsWith('.html')).sort()) {
  const fullPath = path.join(eventsDir, file);
  const html = fs.readFileSync(fullPath, 'utf8');
  const match = html.match(/<script type="application\/json" id="event-year-data">([\s\S]*?)<\/script>/);
  if (!match) continue;
  const data = JSON.parse(match[1]);
  const edition = (data.editions || []).find((item) => String(item.year) === String(data.defaultYear))
    || (data.editions || []).at(-1)
    || {};
  const slug = data.slug || file.replace(/\.html$/, '');
  const imgBase = `../../../content/categories/culture/national-day/events/img/${slug}-mini`;
  const eventHref = `../../../content/categories/culture/national-day/events/${slug}.html`;
  const country = (edition.countries || [])[0] || {};
  cards.push({
    startDate: edition.startDate || '',
    html: `          <article class="event-card national-day-card" data-start="${esc(edition.startDate || '')}"><img class="event-thumb" srcset="${imgBase}-200.webp 200w, ${imgBase}-400.webp 400w" sizes="(max-width: 720px) 45vw, 220px" src="${imgBase}.png" alt="" loading="lazy"><time datetime="${esc(edition.startDate || '')}">${esc(dateText(edition))}</time><a class="event-card__title" href="${esc(eventHref)}"><strong>${esc(data.eventName || slug)}</strong></a>${countryLink(country)}</article>`,
  });
}

cards.sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));

let topicHtml = fs.readFileSync(topicPath, 'utf8');
topicHtml = topicHtml.replace(
  /<div class="event-grid">[\s\S]*?<\/div>\s*<\/section><\/main>/,
  `<div class="event-grid">\n${cards.map((card) => card.html).join('\n')}\n        </div>\n      </section></main>`,
);
fs.writeFileSync(topicPath, topicHtml);
console.log(`Updated ${cards.length} national day topic cards.`);
