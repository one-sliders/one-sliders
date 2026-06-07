import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const LAST_UPDATED = '2 June 2026';

const countries = {
  global: { name: 'Global', city: 'Global', url: '/content/locations/index.html', flag: '' },
  usa: { name: 'United States', city: 'Los Angeles', url: '/content/locations/north-america/usa/index.html', flag: '/content/locations/north-america/usa/img/flag.svg' },
  uk: { name: 'United Kingdom', city: 'London', url: '/content/locations/europe/united-kingdom/index.html', flag: '/content/locations/europe/united-kingdom/img/flag.svg' },
  brazil: { name: 'Brazil', city: 'Sao Paulo', url: '/content/locations/south-america/brazil/index.html', flag: '/content/locations/south-america/brazil/img/flag.svg' },
  finland: { name: 'Finland', city: 'Helsinki', url: '/content/locations/europe/finland/index.html', flag: '/content/locations/europe/finland/img/flag.svg' },
  southAfrica: { name: 'South Africa', city: 'Cape Town', url: '/content/locations/africa/south-africa/index.html', flag: '/content/locations/africa/south-africa/img/flag.svg' },
  france: { name: 'France', city: 'Paris', url: '/content/locations/europe/france/index.html', flag: '/content/locations/europe/france/img/flag.svg' },
  india: { name: 'India', city: 'New Delhi', url: '/content/locations/asia/india/index.html', flag: '/content/locations/asia/india/img/flag.svg' },
  switzerland: { name: 'Switzerland', city: 'Geneva', url: '/content/locations/europe/switzerland/index.html', flag: '/content/locations/europe/switzerland/img/flag.svg' }
};

const events = [
  { topic: 'climate/ice-and-glaciers', old: 'glaciers', title: 'World Glacier Day', slug: 'world-glacier-day', country: 'global' },
  { topic: 'climate/marine', old: 'coral reefs', title: 'World Reef Day', slug: 'world-reef-day', country: 'global' },
  { topic: 'climate/protected-nature', old: 'national parks', title: 'World Ranger Day', slug: 'world-ranger-day', country: 'global' },
  { topic: 'climate/sustainability', old: 'sustainability topics', title: 'World Environment Day', slug: 'world-environment-day', country: 'global' },
  { topic: 'climate/weather', old: 'wildfires', title: 'Wildfire Community Preparedness Day', slug: 'wildfire-community-preparedness-day', country: 'usa' },
  { topic: 'music/music-festivals', old: 'Lollapalooza Brazil', title: 'Lollapalooza Brazil', slug: 'lollapalooza-brazil', country: 'brazil' },
  { topic: 'wellness/active-wellness', old: 'running events', title: 'Global Running Day', slug: 'global-running-day', country: 'global' },
  { topic: 'wellness/active-wellness', old: 'hiking wellness', title: 'National Trails Day', slug: 'national-trails-day', country: 'usa' },
  { topic: 'wellness/mental-health', old: 'mental health retreats', title: 'World Mental Health Day', slug: 'world-mental-health-day', country: 'global' },
  { topic: 'wellness/spa', old: 'spa destinations', title: 'Global Wellness Day', slug: 'global-wellness-day', country: 'global' },
  { topic: 'wellness/wellness-festivals', old: 'wellness festivals', title: 'World Wellness Weekend', slug: 'world-wellness-weekend', country: 'france' },
  { topic: 'wellness/yoga', old: 'yoga retreats', title: 'International Day of Yoga', slug: 'international-day-of-yoga', country: 'india' }
];

const existingLinks = [
  { file: 'content/categories/climate/marine.html', old: 'oceans', title: 'World Oceans Day', href: '/content/events/2026/06/world-oceans-day-2026.html', img: '/content/events/2026/06/img/world-oceans-day-2026-mini.png', meta: '8 Jun 2026' },
  { file: 'content/categories/climate/weather.html', old: 'extreme weather', title: 'World Meteorological Day', href: '/content/categories/climate/weather/events/world-meteorological-day.html', img: '/content/categories/climate/weather/events/img/world-meteorological-day-mini.png', meta: '2026 watchlist' },
  { file: 'content/categories/music/music-festivals.html', old: 'Coachella', title: 'Coachella', href: '/content/categories/music/music-festivals/events/coachella.html', img: '/content/categories/music/music-festivals/events/img/coachella-mini.png', meta: '2026 watchlist' },
  { file: 'content/categories/music/music-festivals.html', old: 'Glastonbury', title: 'Glastonbury Festival', href: '/content/categories/music/music-festivals/events/glastonbury-festival.html', img: '/content/categories/music/music-festivals/events/img/glastonbury-festival-mini.png', meta: '2026 watchlist' },
  { file: 'content/categories/music/world-music.html', old: 'Sauti za Busara', title: 'Sauti za Busara', href: '/content/categories/music/world-music/events/sauti-za-busara.html', img: '/content/categories/music/world-music/events/img/sauti-za-busara-mini.png', meta: '2026 watchlist' }
];

function esc(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function titleCase(value) {
  return value.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function countryChip(country) {
  if (!country.flag) return `<a class="country" href="${country.url}">${esc(country.name)}</a>`;
  return `<a class="country" href="${country.url}"><img src="${country.flag}" alt="" width="20" height="14" loading="lazy">${esc(country.name)}</a>`;
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function ensureImages(topicDir, slug) {
  const imgDir = path.join(topicDir, 'events', 'img');
  fs.mkdirSync(imgDir, { recursive: true });
  const pngs = walk(imgDir).filter(file => file.endsWith('.png') && !file.includes(`${slug}-`));
  const fallbackHero = pngs.find(file => file.endsWith('-hero.png')) || path.join(ROOT, 'assets', 'icons', 'apple-touch-icon.png');
  const fallbackMini = pngs.find(file => file.endsWith('-mini.png')) || fallbackHero;
  fs.copyFileSync(fallbackHero, path.join(imgDir, `${slug}-hero.png`));
  fs.copyFileSync(fallbackMini, path.join(imgDir, `${slug}-mini.png`));
}

function eventPage({ category, topic, title, slug, country }) {
  const categoryLabel = titleCase(category);
  const topicLabel = titleCase(topic);
  const topicPath = `/content/categories/${category}/${topic}`;
  const imgPath = `${topicPath}/events/img/${slug}`;
  const years = [2027, 2026, 2025, 2024, 2023, 2022];
  const yearData = {
    eventName: title,
    slug,
    defaultYear: 2027,
    lastUpdated: LAST_UPDATED,
    sources: [{ label: 'Official organiser listing TBC', url: '#' }],
    editions: years.map(year => ({
      year,
      headingPlace: `in ${country.city}`,
      status: year === 2027 ? 'upcoming' : 'past',
      statusLabel: year === 2027 ? 'Watchlist' : 'Archive',
      startDate: '',
      endExclusive: '',
      nextDate: '',
      dates: year === 2027 ? '2027 date TBC' : 'Archive details TBC',
      countries: [{ name: country.name, url: country.url, flag: country.flag }],
      cities: [{ name: country.city }],
      venue: 'Venue TBC',
      format: `${topicLabel} event view`,
      result: year === 2027 ? '' : 'Final details TBC.',
      countdownText: 'Exact dates are TBC; check the official organiser before travel.',
      calendarDescription: `${title} ${year}.`,
      questions: [
        { q: 'When is the event?', a: year === 2027 ? '2027 date TBC' : 'Archive details TBC', detail: 'Exact dates should be verified from the official organiser.' },
        { q: 'Where is it held?', a: `${esc(country.city)}, ${countryChip(country)}`, detail: 'Venue details are TBC until the organiser confirms the edition.' },
        { q: 'How do I buy tickets?', a: 'Use official channels', detail: 'Ticket windows and access conditions can change by edition.' },
        { q: 'What is the programme?', a: 'Programme TBC', detail: 'Add the official schedule when it is published.' },
        { q: 'What is new this year?', a: `${title} 2027 planning page`, detail: 'This page is ready for verified edition updates.' }
      ],
      highlights: []
    }))
  };
  const editions = [2026, 2025, 2024, 2023, 2022].map(year => `<tr><th>${year}</th><td>Archive TBC</td><td>${countryChip(country)}</td></tr>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/assets/css/events.css">
  <script defer src="/assets/js/events.js"></script>
  <link rel="preload" as="image" href="${imgPath}-hero.png">
  <link rel="canonical" href="https://one-sliders.com${topicPath}/events/${slug}.html">
  <meta name="description" content="${esc(title)} 2027 overview: dates, venue, programme and travel context for ${categoryLabel} / ${topicLabel}.">
  <meta property="og:title" content="${esc(title)} 2027 - Dates, Schedule &amp; Results">
  <meta property="og:image" content="https://one-sliders.com${imgPath}-hero.png">
  <meta property="og:url" content="https://one-sliders.com${topicPath}/events/${slug}.html">
  <meta name="twitter:card" content="summary_large_image">
  <title>${esc(title)} 2027 - Dates, Schedule &amp; Results</title>
  <script type="application/json" id="event-year-data">${JSON.stringify(yearData)}</script>
</head>
<body class="event-page">
  <nav class="event-nav" aria-label="Site navigation">
    <a class="nav-icon" href="/content/events/index.html" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></a>
    <a class="nav-icon" href="/content/locations/index.html" aria-label="Locations"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></a>
    <a class="nav-icon" href="/content/categories/index.html" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg></a>
    <span class="nav-spacer"></span><details class="nav-language"><summary aria-label="Language">EN</summary><div class="nav-language__list"><a href="#" aria-current="page">English</a></div></details>
  </nav>
  <main class="event-carousel" data-carousel>
    <div class="event-carousel__track" data-carousel-track>
      <section class="event-slide event-slide--hero" id="general" data-slide="general">
        <img class="event-hero__image" src="${imgPath}-hero.png" alt="${esc(title)} hero image" width="1200" height="630" fetchpriority="high">
        <div class="event-slide__content">
          <div class="event-hero-copy"><p class="event-kicker">${categoryLabel} / ${topicLabel}</p><h1 class="event-title">${esc(title)}</h1><p class="event-lede">${esc(title)} is tracked as a ${topicLabel.toLowerCase()} event with one evergreen page and one edition view.</p></div>
          <div class="facts-strip hero-control"><div class="fact"><span>Frequency</span><strong>Recurring</strong></div><div class="fact"><span>Current edition</span><strong>2027</strong></div><div class="fact"><span>Main city</span><strong>${esc(country.city)}</strong></div><div class="fact"><span>Country</span><strong>${countryChip(country)}</strong></div></div>
          <div class="card-grid"><a class="topic-card topic-card--inline" href="${topicPath}.html"><img src="${imgPath}-mini.png" alt="${esc(title)} thumbnail" width="400" height="300" loading="lazy"><span>More ${topicLabel}</span><strong>Back to ${topicLabel}</strong><p>Explore related event views in this topic.</p></a><div class="card"><span>History</span><strong>Why people follow it</strong><p>This overview is prepared as a watchlist page. Replace TBC fields with verified organiser details as the edition opens.</p></div><div class="card"><span>Format / rules</span><strong>Edition details can change</strong><p>The year slide keeps date, venue and programme updates together without creating separate URLs.</p></div></div>
          <div class="card-grid card-grid--support"><div class="card"><span>Records</span><strong>Records TBC</strong><p>Add verified records only when a reliable source is available.</p></div><div class="card"><span>Notable moments</span><ul class="event-list"><li>Host context: ${countryChip(country)}.</li><li>Current edition: 2027 planning page.</li><li>Last updated: ${LAST_UPDATED}.</li></ul></div></div>
          <div class="card card--editions"><span>Recent editions</span><table class="event-table"><thead><tr><th>Year</th><th>Host / place</th><th>Country</th></tr></thead><tbody>${editions}</tbody></table></div>
        </div>
      </section>
      <section class="event-slide" id="year" data-slide="year">
        <img class="event-hero__image" src="${imgPath}-hero.png" alt="${esc(title)} hero image" width="1200" height="630" loading="lazy">
        <div class="event-slide__content"><div class="event-hero-copy"><p class="event-kicker">Edition view</p><h2 class="event-section-title" data-year-heading>${esc(title)} 2027 in ${esc(country.city)}</h2><p class="event-subtitle">Switch between recent editions without leaving the page.</p></div><div class="year-switcher hero-control" data-year-switcher aria-label="Choose edition"></div><div class="year-edition" data-year-edition><div class="facts-strip"><div class="fact"><span>Country</span><strong>${countryChip(country)}</strong></div><div class="fact"><span>City</span><strong>${esc(country.city)}</strong></div><div class="fact"><span>Venue</span><strong>TBC</strong></div><div class="fact"><span>Dates</span><strong>2027 date TBC</strong></div><div class="fact"><span>Status</span><strong>Watchlist</strong></div><div class="fact"><span>Format</span><strong>${topicLabel} overview</strong></div></div><div class="countdown"><span>Countdown</span><strong>Date TBC</strong><p>Exact dates are TBC; check the official organiser before travel.</p></div><div class="question-grid"><div class="question"><span>When is the event?</span><strong>2027 date TBC</strong><p>Update from the official organiser when confirmed.</p></div><div class="question"><span>Where is it held?</span><strong>${esc(country.city)}, ${countryChip(country)}</strong><p>Venue details are TBC.</p></div><div class="question"><span>How do I buy tickets?</span><strong>Use official channels</strong><p>Ticket windows and access conditions can change.</p></div><div class="question"><span>What is the programme?</span><strong>Programme TBC</strong><p>Add the official schedule when published.</p></div><div class="question"><span>What happened last edition?</span><strong>Archive TBC</strong><p>Add verified highlights when available.</p></div></div><div class="actions-row"><button class="event-button" type="button" data-calendar-download>Add to calendar</button><button class="event-button" type="button" data-save-event="${slug}" data-save-label="Save / remind me" data-saved-label="Saved">Save / remind me</button></div><p class="event-source">Sources: official organiser listing TBC. Last updated: ${LAST_UPDATED}.</p></div></div>
      </section>
    </div>
    <button class="event-carousel__prev" type="button" data-carousel-prev aria-label="Previous slide">Previous</button><button class="event-carousel__next" type="button" data-carousel-next aria-label="Next slide">Next</button><nav class="event-carousel__dots" data-carousel-dots aria-label="Slide navigation"></nav>
  </main>
</body>
</html>`;
}

function cardHtml({ href, img, meta, title, description }) {
  return `<a class="event-card" href="${href}"><img class="event-thumb" src="${img}" alt="${esc(title)} thumbnail" loading="lazy" width="400" height="300"><time>${esc(meta)}</time><strong>${esc(title)}</strong><p>${esc(description)}</p></a>`;
}

function replacePlaceholderCard(file, oldStrong, replacement) {
  const full = path.join(ROOT, file);
  let html = fs.readFileSync(full, 'utf8');
  const pattern = new RegExp(`<a class="event-card" href="#"><time>Featured</time><strong>${oldStrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</strong><p>.*?</p></a>`, 's');
  if (!pattern.test(html)) throw new Error(`Placeholder not found: ${file} :: ${oldStrong}`);
  html = html.replace(pattern, replacement);
  fs.writeFileSync(full, html, 'utf8');
}

for (const event of events) {
  const [category, topic] = event.topic.split('/');
  const country = countries[event.country];
  const topicDir = path.join(ROOT, 'content', 'categories', category, topic);
  fs.mkdirSync(path.join(topicDir, 'events'), { recursive: true });
  ensureImages(topicDir, event.slug);
  const pagePath = path.join(topicDir, 'events', `${event.slug}.html`);
  if (!fs.existsSync(pagePath)) {
    fs.writeFileSync(pagePath, eventPage({ category, topic, title: event.title, slug: event.slug, country }), 'utf8');
  }
  replacePlaceholderCard(
    `content/categories/${category}/${topic}.html`,
    event.old,
    cardHtml({
      href: `/content/categories/${category}/${topic}/events/${event.slug}.html`,
      img: `/content/categories/${category}/${topic}/events/img/${event.slug}-mini.png`,
      meta: '2027 watchlist',
      title: event.title,
      description: `${country.city}, ${country.name}`
    })
  );
}

for (const link of existingLinks) {
  replacePlaceholderCard(
    link.file,
    link.old,
    cardHtml({
      href: link.href,
      img: link.img,
      meta: link.meta,
      title: link.title,
      description: 'Open the event view'
    })
  );
}

console.log(`Created or confirmed ${events.length} watchlist event views and linked ${existingLinks.length} existing event cards.`);
