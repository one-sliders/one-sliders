import fs from 'node:fs';

const managed = JSON.parse(fs.readFileSync('tmp/generated-topic-minimum-events.json', 'utf8'));

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function titleCase(slug) {
  return slug.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function card(event, indexRoot) {
  let base;
  if (indexRoot === 'en/content') {
    base = event.rootPrefix === 'en' ? '../categories' : '../../../content/categories';
  } else {
    base = event.rootPrefix === 'en' ? '../../en/content/categories' : '../categories';
  }

  let start = '2026-01-01';
  let end = '2026-12-31';
  let meta = `2026 watchlist - ${event.country.city}, ${event.country.name}`;

  if (event.slug === 'apple-september-event') {
    start = '2026-09-01';
    end = '2026-09-30';
    meta = 'Sep 2026 watchlist - United States';
  }

  return `<a class="event-card" data-end="${end}" data-cat="${esc(event.category)}" data-topic="${esc(event.topic)}" data-cont="${esc(event.country.continent)}" data-country="${esc(event.country.slug)}" href="${base}/${event.category}/${event.topic}/events/${event.slug}.html" data-start="${start}" data-reach="global" style="--cat-color:var(--c-culture)"><img class="card-thumb" src="${base}/${event.category}/${event.topic}/events/img/${event.slug}-mini.png" alt="${esc(event.title)}" loading="lazy" width="400" height="300"><div class="card-stripe"></div><div class="card-body"><span class="cat-pill">${esc(titleCase(event.category))}</span><strong class="card-title">${esc(event.title)}</strong><span class="card-meta">${esc(meta)}</span></div></a>`;
}

for (const [file, root] of [
  ['content/events/index.html', 'content'],
  ['en/content/events/index.html', 'en/content'],
]) {
  let html = fs.readFileSync(file, 'utf8');
  const block = `<!-- generated-minimum-events:start -->\n        ${managed.map((event) => card(event, root)).join('\n        ')}\n        <!-- generated-minimum-events:end -->`;
  html = html.replace(/<!-- generated-minimum-events:start -->[\s\S]*?<!-- generated-minimum-events:end -->/, block);
  fs.writeFileSync(file, html, 'utf8');
}

console.log(`Rebuilt generated index blocks for ${managed.length} events.`);
