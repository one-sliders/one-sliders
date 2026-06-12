import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const eventsDir = path.join(root, 'content/categories/culture/national-day/events');

const esc = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

function readJson(html, id) {
  const match = html.match(new RegExp(`<script type="application/(?:json|ld\\+json)" id="${id}">([\\s\\S]*?)<\\/script>`));
  return match ? JSON.parse(match[1]) : null;
}

function scriptBlock(html, id) {
  const match = html.match(new RegExp(`<script type="application/(?:json|ld\\+json)"(?: id="${id}")?>[\\s\\S]*?<\\/script>`));
  return match ? match[0] : '';
}

function countryLink(country) {
  if (!country?.name || !country?.url || !country?.flag) return '';
  return `<a class="country" href="${esc(country.url)}"><img src="${esc(country.flag)}" alt="" width="20" height="14" loading="lazy">${esc(country.name)}</a>`;
}

function fact(label, value) {
  return `<div class="fact"><span>${esc(label)}</span><strong>${value}</strong></div>`;
}

function compactCard(label, title, text) {
  return `<div class="card"><span>${esc(label)}</span><strong>${esc(title)}</strong><p>${esc(text)}</p></div>`;
}

function questionCard(item) {
  return `<div class="question"><span>${esc(item.q || 'Note')}</span><strong>${item.a || ''}</strong><p>${esc(item.detail || '')}</p></div>`;
}

function visibleDate(edition) {
  return String(edition?.dates || '').replace(/\s+\d{4}$/, '') || edition?.dates || 'Date missing';
}

function buildPage(oldHtml, data) {
  const slug = data.slug;
  const title = data.eventName || slug;
  const edition = (data.editions || []).find((item) => String(item.year) === String(data.defaultYear))
    || (data.editions || []).at(-1)
    || {};
  const country = (edition.countries || [])[0] || {};
  const countryHtml = countryLink(country);
  const dateLabel = visibleDate(edition);
  const hero = `/content/categories/culture/national-day/events/img/${slug}-hero.png`;
  const heroSrcset = `/content/categories/culture/national-day/events/img/${slug}-hero-400.webp 400w, /content/categories/culture/national-day/events/img/${slug}-hero-768.webp 768w, /content/categories/culture/national-day/events/img/${slug}-hero-1200.webp 1200w`;
  const description = oldHtml.match(/<meta name="description" content="([^"]*)"/)?.[1]
    || `${title} event view with date, country and planning context.`;
  const jsonData = scriptBlock(oldHtml, 'event-year-data');
  const jsonLd = oldHtml.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/)?.[0] || '';
  const questions = (edition.questions || [])
    .filter((item) => !/^(date|public holiday)$/i.test(item.q || ''))
    .slice(0, 4);
  const historyText = `${title} is tied to ${dateLabel}. The date is fixed in the calendar, while ceremonies, parades and opening hours are planned locally each year.`;

  return `<!doctype html>
<html lang="en">
<head>
  <!-- OneSlider core v4 -->
  <link rel="stylesheet" href="/assets/css/oneslider-core.css">
  <script defer src="/assets/js/oneslider-core.js"></script>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="/assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="/assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="/assets/icons/site.webmanifest">
  <link rel="stylesheet" href="/assets/css/events.css?v=national-day-carousel-20260612b">
  <script defer src="/assets/js/events.js?v=national-day-carousel-20260612b"></script>
  <link rel="preload" as="image" href="${hero}">
  <link rel="canonical" href="https://one-sliders.com/content/categories/culture/national-day/events/${slug}.html">
  <meta name="description" content="${esc(description)}">
  <meta property="og:title" content="${esc(title)} | OneSliders">
  <meta property="og:image" content="https://one-sliders.com${hero}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="https://one-sliders.com/content/categories/culture/national-day/events/${slug}.html">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="content-language" content="en">
  <title>${esc(title)} | OneSliders</title>
${jsonData}
${jsonLd}
</head>
<body class="event-page event-page--national-day">
  <nav class="event-nav" aria-label="Site navigation">
    <a class="nav-icon" href="/content/events/index.html" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></a>
    <a class="nav-icon" href="/content/locations/index.html" aria-label="Locations"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></a>
    <a class="nav-icon" href="/content/categories/index.html" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg></a>
    <span class="nav-spacer"></span>
    <details class="nav-language"><summary aria-label="Language">EN</summary><div class="nav-language__list"><a href="#" aria-current="page">English</a></div></details>
  </nav>
  <main class="event-carousel" data-carousel>
    <div class="event-carousel__track" data-carousel-track>
      <section class="event-slide event-slide--hero" id="general" data-slide="general">
        <img class="event-hero__image" src="${hero}" srcset="${heroSrcset}" sizes="100vw" alt="${esc(title)} visual" width="1200" height="630" fetchpriority="high">
        <div class="event-slide__content">
          <p class="event-kicker">National day</p>
          <h1 class="event-title">${esc(title)}</h1>
          <p class="event-lede">${countryHtml ? `${countryHtml} marks this national day on ${esc(dateLabel)}.` : `${esc(title)} is a fixed national-day date.`} Plan by city: ceremonies, routes and opening hours are local.</p>
          <div class="facts-strip">
            ${fact('Date', esc(dateLabel))}
            ${fact('Country', countryHtml || esc(country.name || 'Country missing'))}
            ${fact('Frequency', 'Annual')}
            ${fact('Format', esc(edition.format || 'Fixed annual civic date'))}
          </div>
          <div class="card-grid card-grid--support">
            ${compactCard('History', 'Fixed civic date', historyText)}
            ${compactCard('How it works', 'Local programme, national date', 'The date stays the same, while cities publish the practical programme for ceremonies, traffic and public gatherings.')}
            ${compactCard('Visitor note', 'Check the city first', 'Use municipal pages for route timing, closures, transport and public-holiday opening hours.')}
            ${compactCard('Parent topic', 'All national days', 'Browse the full national-day collection from the Culture topic page.')}
          </div>
        </div>
      </section>
      <section class="event-slide" id="year" data-slide="year">
        <img class="event-hero__image" src="${hero}" srcset="${heroSrcset}" sizes="100vw" alt="" width="1200" height="630" loading="lazy">
        <div class="event-slide__content">
          <h2 class="event-section-title" data-year-heading>${esc(title)} ${esc(edition.year || data.defaultYear || '')} ${esc(edition.headingPlace || '')}</h2>
          <div class="year-switcher" data-year-switcher aria-label="Choose edition"></div>
          <div class="year-edition" data-year-edition></div>
        </div>
      </section>
    </div>
    <button class="event-carousel__prev" data-carousel-prev aria-label="Previous slide"></button>
    <button class="event-carousel__next" data-carousel-next aria-label="Next slide"></button>
    <nav class="event-carousel__dots" data-carousel-dots aria-label="Slide navigation"></nav>
  </main>
</body>
</html>
`;
}

let changed = 0;
for (const name of fs.readdirSync(eventsDir).filter((entry) => entry.endsWith('.html'))) {
  const file = path.join(eventsDir, name);
  const html = fs.readFileSync(file, 'utf8');
  const data = readJson(html, 'event-year-data');
  if (!data) continue;
  fs.writeFileSync(file, buildPage(html, data));
  changed += 1;
}

console.log(`Migrated ${changed} national day event pages to carousel layout.`);
