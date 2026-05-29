import fs from 'node:fs';
import path from 'node:path';

const ROOT = globalThis.nodeRepl ? globalThis.nodeRepl.cwd : process.cwd();
const TODAY = new Date('2026-05-26T00:00:00Z');
const STAMP = '26 May 2026';
const GENERATED_AT = '2026-05-26';
const EVENT_DIR = 'en/content/categories/culture/national-day/events';
const IMG_DIR = `${EVENT_DIR}/img`;

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const overrides = {
  austria: { date: '26 October', title: 'Austria National Day', reason: 'neutrality and modern civic identity', city: 'Vienna' },
  switzerland: { date: '1 August', title: 'Swiss National Day', reason: 'Swiss founding tradition and cantonal identity', city: 'Bern' },
  norway: { date: '17 May', title: 'Oslo Constitution Day', reason: 'the signing of Norway\'s constitution in 1814', city: 'Oslo' },
  'united-kingdom': { skip: true },
};

const titleOverrides = {
  albania: 'Albania Independence Day',
  andorra: 'Our Lady of Meritxell Day',
  armenia: 'Armenia Independence Day',
  azerbaijan: 'Azerbaijan Republic Day',
  belarus: 'Belarus Independence Day',
  belgium: 'Belgian National Day',
  'bosnia-and-herzegovina': 'Bosnia and Herzegovina Statehood Day',
  bulgaria: 'Bulgaria Liberation Day',
  croatia: 'Croatia Statehood Day',
  cyprus: 'Cyprus Independence Day',
  czechia: 'Czech Independent State Day',
  denmark: 'Denmark Constitution Day',
  estonia: 'Estonia Independence Day',
  finland: 'Finland Independence Day',
  france: 'Bastille Day',
  georgia: 'Georgia Independence Day',
  germany: 'Day of German Unity',
  greece: 'Greek Independence Day',
  hungary: 'Saint Stephen\'s Day',
  iceland: 'Iceland National Day',
  ireland: 'Saint Patrick\'s Day',
  italy: 'Festa della Repubblica',
  kosovo: 'Kosovo Independence Day',
  latvia: 'Latvia Independence Day',
  liechtenstein: 'Liechtenstein National Day',
  lithuania: 'Lithuania Independence Day',
  luxembourg: 'Luxembourg National Day',
  malta: 'Malta Freedom Day',
  moldova: 'Moldova Independence Day',
  monaco: 'Monaco National Day',
  montenegro: 'Montenegro Statehood Day',
  netherlands: 'King\'s Day',
  'north-macedonia': 'North Macedonia Independence Day',
  poland: 'Poland Independence Day',
  portugal: 'Portugal Day',
  romania: 'Great Union Day',
  russia: 'Russia Day',
  'san-marino': 'San Marino Foundation Day',
  serbia: 'Serbia Statehood Day',
  slovakia: 'Slovakia Constitution Day',
  slovenia: 'Slovenia Statehood Day',
  spain: 'Spain National Day',
  sweden: 'Sweden National Day',
  turkey: 'Republic Day of Turkey',
  ukraine: 'Ukraine Independence Day',
  'vatican-city': 'Chair of Saint Peter',
};

const reasonOverrides = {
  france: 'the French Revolution and national civic identity',
  germany: 'German reunification in 1990',
  italy: 'the 1946 republic referendum',
  netherlands: 'the Dutch monarch\'s birthday and national public celebration',
  portugal: 'Portuguese culture and the death of Luis de Camoes in 1580',
  spain: 'Spanish national identity and the 1492 arrival in the Americas',
  sweden: 'the 1523 election of Gustav Vasa and the 1809 constitution',
  ireland: 'Saint Patrick and Irish culture',
  denmark: 'the Danish constitution',
  greece: 'the start of the Greek War of Independence',
  poland: 'the restoration of Polish independence in 1918',
  ukraine: 'Ukraine\'s 1991 declaration of independence',
  turkey: 'the proclamation of the Republic in 1923',
  russia: 'the 1990 declaration of state sovereignty',
  vatican: 'the liturgical feast of the Chair of Saint Peter',
};

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slugify(value) {
  return value.toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function write(file, content) {
  const full = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
}

function extractCountry(pageHtml, slug) {
  const match = pageHtml.match(/<h1 class="hero-title">([^<]+)<\/h1>/);
  return match ? match[1].replace(/&amp;/g, '&') : slug.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join(' ');
}

function extractDate(pageHtml) {
  const match = pageHtml.match(/When is the national day\?<\/strong><span>(.*?)<\/span>/);
  return match ? match[1].replace(/<[^>]+>/g, '').replace(/\.$/, '').trim() : '';
}

function extractCapital(pageHtml) {
  const match = pageHtml.match(/<div class="country-kpi"><span>Capital<\/span><strong>(?:<a[^>]*>)?([^<]+)(?:<\/a>)?<\/strong><\/div>/);
  return match ? match[1].trim() : '';
}

function parseDayMonth(dateText) {
  const clean = dateText.replace(/\.$/, '').trim();
  const match = clean.match(/^(\d{1,2})\s+([A-Za-z]+)$/);
  if (!match) return null;
  const monthIndex = fullMonthNames.findIndex(m => m.toLowerCase() === match[2].toLowerCase());
  if (monthIndex < 0) return null;
  return { day: Number(match[1]), month: monthIndex + 1 };
}

function iso(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function displayDate(day, month, year) {
  return `${day} ${monthNames[month - 1]} ${year}`;
}

function countryChip(country, slug, prefix = '../../../../../../') {
  return `<a class="country" href="${prefix}content/locations/europe/${slug}/index.html"><img src="${prefix}content/locations/europe/${slug}/img/flag.svg" alt="" width="20" height="14">${esc(country)}</a>`;
}

function cityLink(countrySlug, city) {
  if (!city || city.toUpperCase() === 'TBC') return '';
  const citySlug = slugify(city);
  const file = `content/locations/europe/${countrySlug}/${citySlug}.html`;
  return fs.existsSync(path.join(ROOT, file)) ? `/content/locations/europe/${countrySlug}/${citySlug}.html` : '';
}

function makeEditions(event, dateParts) {
  const editions = [];
  for (let year = 2021; year <= event.nextYear; year += 1) {
    const startDate = iso(year, dateParts.month, dateParts.day);
    const end = new Date(`${startDate}T00:00:00Z`);
    end.setUTCDate(end.getUTCDate() + 1);
    const endExclusive = end.toISOString().slice(0, 10);
    const status = year < event.nextYear ? 'past' : 'upcoming';
    const chip = `<a class="country" href="/content/locations/europe/${event.countrySlug}/index.html"><img src="/content/locations/europe/${event.countrySlug}/img/flag.svg" alt="" width="20" height="14">${esc(event.country)}</a>`;
    editions.push({
      year,
      headingPlace: `in ${event.country}`,
      status,
      statusLabel: status === 'past' ? 'Archive' : 'Scheduled',
      startDate,
      endExclusive,
      nextDate: iso(year + 1, dateParts.month, dateParts.day),
      dates: displayDate(dateParts.day, dateParts.month, year),
      countries: [{ name: event.country, url: `/content/locations/europe/${event.countrySlug}/index.html`, flag: `/content/locations/europe/${event.countrySlug}/img/flag.svg` }],
      cities: event.city ? [{ name: event.city, ...(event.cityUrl ? { url: event.cityUrl } : {}) }] : [],
      venue: event.country,
      format: 'National day programme',
      countdownText: status === 'past' ? 'Archive edition; add verified local programme notes when available.' : `${event.title} is observed every year on ${event.dateText}.`,
      calendarDescription: `${event.title} ${year}.`,
      questions: status === 'past' ? [] : [
        { q: 'When is the event?', a: displayDate(dateParts.day, dateParts.month, year), detail: `${event.title} is observed annually on ${event.dateText}.` },
        { q: `Why is ${dateParts.day} ${monthNames[dateParts.month - 1]} important?`, a: event.reason, detail: 'Use this as the quick answer, then check official local programmes close to the date.' },
        { q: 'Where is it held?', a: `Across ${chip}`, detail: event.city ? `${esc(event.city)} may carry official or highly visible ceremonies, but local celebrations can vary.` : 'Local celebrations vary by city and region.' },
        { q: 'What do people do?', a: 'Expect flags, public ceremonies and local gatherings', detail: 'National days are civic events, so the best programme is usually local rather than one central ticketed venue.' },
        { q: 'Do I need tickets?', a: 'Usually not for public outdoor moments', detail: 'Some concerts, museums, guided tours or special viewing areas may require booking.' },
        { q: 'What should visitors check?', a: 'Transport, opening hours and official city programmes', detail: 'Public holidays can change shop hours, road access and public transport.' },
        { q: 'What is new this year?', a: `${event.title} ${year}`, detail: 'Specific speeches, concerts, parades and security notes should be updated when official programmes are published.' },
      ],
      highlights: [],
      lifecycleLabel: status === 'past' ? 'Archive' : 'Programme',
    });
  }
  return editions;
}

function eventHtml(event, dateParts) {
  const yearData = {
    eventName: event.title,
    slug: event.eventSlug,
    defaultYear: event.nextYear,
    lastUpdated: STAMP,
    sources: [{ label: 'OneSliders country page', url: `/content/locations/europe/${event.countrySlug}/` }],
    editions: makeEditions(event, dateParts),
  };

  const country = countryChip(event.country, event.countrySlug);
  return `<!doctype html>
<html lang="en">
<head>
  <!-- OneSlider core v4 -->
  <link rel="stylesheet" href="../../../../../../assets/css/oneslider-core.css">
  <script src="../../../../../../assets/js/oneslider-core.js"></script>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="../../../../../../assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="../../../../../../assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../../../../../../assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="../../../../../../assets/icons/site.webmanifest">
  <link rel="stylesheet" href="../../../../../../assets/css/events.css?v=events-sport-tracker-20260521">
  <script defer src="../../../../../../assets/js/events.js?v=tbc-actions-20260520"></script>
  <link rel="preload" as="image" href="../../../../../../${IMG_DIR}/${event.eventSlug}-hero.png">
  <link rel="canonical" href="https://one-sliders.com/${EVENT_DIR}/${event.eventSlug}.html">
  <meta name="description" content="${esc(event.title)} guide with date, meaning, visitor questions and current edition details.">
  <meta name="keywords" content="${esc(event.eventSlug.replace(/-/g, ' '))}, national day, ${esc(event.country.toLowerCase())} public holiday, ${esc(event.dateText.toLowerCase())}">
  <meta property="og:title" content="${esc(event.title)} | OneSliders">
  <meta property="og:image" content="https://one-sliders.com/${IMG_DIR}/${event.eventSlug}-hero.png">
  <meta name="twitter:card" content="summary_large_image">
  <title>${esc(event.title)} | OneSliders</title>
<script type="application/json" id="event-year-data">${JSON.stringify(yearData)}</script>
</head>
<body class="event-page">
  <nav class="event-nav" aria-label="Site navigation">
    <a class="nav-icon" href="../../../../../../content/events/index.html" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></a>
    <a class="nav-icon" href="../../../../../../content/locations/index.html" aria-label="Locations"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></a>
    <a class="nav-icon" href="../../../../../../content/categories/index.html" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg></a>
    <span class="nav-spacer"></span>
    <details class="nav-language"><summary aria-label="Language">EN</summary><div class="nav-language__list"><a href="#" aria-current="page">English</a></div></details>
  </nav>
  <main class="event-carousel" data-carousel>
    <div class="event-carousel__track" data-carousel-track>
      <section class="event-slide event-slide--hero" id="general" data-slide="general">
        <img class="event-hero__image" src="../../../../../../${IMG_DIR}/${event.eventSlug}-hero.png" alt="" width="1200" height="630" fetchpriority="high">
        <div class="event-slide__content">
          <div class="event-hero-copy"><p class="event-kicker">National day</p><h1 class="event-title">${esc(event.title)}</h1><p class="event-lede">A compact guide to the annual civic date, what it means and what visitors should check before going.</p></div>
          <div class="facts-strip hero-control"><div class="fact"><span>Date</span><strong>${esc(event.dateText)}</strong></div><div class="fact"><span>Country</span><strong>${country}</strong></div><div class="fact"><span>Next edition</span><strong>${event.nextYear}</strong></div><div class="fact"><span>Type</span><strong>National day</strong></div></div>
          <div class="card-grid"><a class="topic-card topic-card--inline" href="../../../../../../content/categories/culture/national-day.html"><img src="../../../../../../${IMG_DIR}/${event.eventSlug}-mini.png" alt="" width="400" height="300" loading="lazy"><span>Culture calendar</span><strong>National days</strong><p>Independence, constitutions, republic days and civic identity dates.</p></a><div class="card"><span>Why the date matters</span><strong>${esc(event.reason)}</strong><p>The exact programme changes by city and year, but the date remains the yearly anchor.</p></div><div class="card"><span>What visitors notice</span><strong>Flags, ceremonies and public life</strong><p>National days are often best read through local squares, official buildings, streets and evening gatherings.</p></div><div class="card"><span>Planning lens</span><strong>Check official local programmes</strong><p>Public transport, opening hours and security routes can change because this is a public holiday.</p></div></div>
          <div class="card card--rank"><span>At a glance</span><div class="rank-list"><div class="rank-row"><strong>1</strong><span>Public meaning</span><div class="rank-row__track"><i class="rank-row__fill w100"></i></div><strong>National identity</strong></div><div class="rank-row"><strong>2</strong><span>Main date</span><div class="rank-row__track"><i class="rank-row__fill w80"></i></div><strong>${esc(event.dateText)}</strong></div><div class="rank-row"><strong>3</strong><span>Best view</span><div class="rank-row__track"><i class="rank-row__fill w65"></i></div><strong>${esc(event.city || 'Local cities')}</strong></div></div></div>
        </div>
      </section>
      <section class="event-slide" id="year" data-slide="year">
        <img class="event-hero__image" src="../../../../../../${IMG_DIR}/${event.eventSlug}-hero.png" alt="" width="1200" height="630" loading="lazy">
        <div class="event-slide__content"><div class="event-hero-copy"><p class="event-kicker">Edition guide</p><h2 class="event-section-title" data-year-heading>${esc(event.title)} ${event.nextYear}</h2><p class="event-subtitle">Dates, place and practical notes for the selected edition.</p></div><div class="year-switcher hero-control" data-year-switcher aria-label="Choose edition"></div><div class="year-edition" data-year-edition></div></div>
      </section>
    </div>
    <button class="event-carousel__prev" type="button" data-carousel-prev aria-label="Previous slide">Previous</button>
    <button class="event-carousel__next" type="button" data-carousel-next aria-label="Next slide">Next</button>
    <nav class="event-carousel__dots" data-carousel-dots aria-label="Slide navigation"></nav>
  </main>
</body>
</html>
`;
}

function cardHtml(event, eventDir, imgDir = `${eventDir}/img`) {
  const meta = `${displayDate(event.day, event.month, event.nextYear)} · ${event.country}`;
  return `        <a class="event-card" data-end="${event.startDate}" data-cat="culture" data-topic="national-day" data-cont="europe" data-country="${event.countrySlug}" data-keywords="${esc(`${event.title}, ${event.country} national day, public holiday`)}" href="${eventDir}/${event.eventSlug}.html#year-${event.nextYear}" data-start="${event.startDate}" data-reach="national" style="--cat-color:var(--c-culture)"><img class="card-thumb" src="${imgDir}/${event.eventSlug}-mini.png" alt="${esc(event.title)}" loading="lazy"><div class="card-stripe"></div><div class="card-body"><span class="cat-pill">Culture</span><strong class="card-title">${esc(event.title)}</strong><span class="card-meta">${esc(meta)}</span></div></a>`;
}

function removeLegacyNationalDayCards(file) {
  let html = read(file);
  html = html.replace(/\s*<a class="event-card"(?=[\s\S]*?data-topic="national-day")[\s\S]*?<\/a>/g, '');
  write(file, html);
}

function upsertGeneratedBlock(file, startMarker, endMarker, content) {
  const html = read(file);
  const block = `${startMarker}\n${content}\n${endMarker}`;
  let next;
  if (html.includes(startMarker) && html.includes(endMarker)) {
    const re = new RegExp(`${startMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${endMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
    next = html.replace(re, block);
  } else {
    next = html.replace('</main>', `${block}\n  </main>`);
  }
  write(file, next);
}

function ensureCountryNames(file, events) {
  let html = read(file);
  for (const event of events) {
    const key = `'${event.countrySlug}'`;
    if (!html.includes(`${key}:`) && !html.includes(`${key}':`)) {
      html = html.replace(/(const countryNames = \{[\s\S]*?)(\n\s*\};)/, `$1\n      '${event.countrySlug}':'${event.country.replace(/'/g, "\\'")}',$2`);
    }
  }
  write(file, html);
}

function updateTopicPage(events) {
  const cards = events
    .sort((a, b) => a.country.localeCompare(b.country))
    .map(event => `          <a class="event-card" href="../../../${EVENT_DIR}/${event.eventSlug}.html"><img class="event-thumb" src="../../../${IMG_DIR}/${event.eventSlug}-mini.png" alt="" loading="lazy"><time>${esc(event.dateText)}</time><strong>${esc(event.title)}</strong><p>${esc(event.country)} national day.</p></a>`)
    .join('\n');
  let html = read('content/categories/culture/national-day.html');
  html = html.replace(/<div class="event-grid">[\s\S]*?<\/div>\s*<\/section>/, `<div class="event-grid">\n${cards}\n        </div>\n      </section>`);
  write('content/categories/culture/national-day.html', html);
}

function updateRegister(events) {
  const file = 'events.register.json';
  const registry = JSON.parse(read(file));
  const bySlug = new Map(registry.events.map((event, index) => [event.slug, index]));
  for (const event of events) {
    const record = {
      slug: event.eventSlug,
      title: event.title,
      category: 'culture',
      topic: 'national-day',
      notesFile: `docs/events/culture/national-day/${event.eventSlug}.md`,
      location: { countries: [event.country], cities: event.city ? [event.city] : [], venue: event.country },
      currentEdition: event.nextYear,
      startDate: event.startDate,
      endDate: event.startDate,
      displayDates: displayDate(event.day, event.month, event.nextYear),
      status: 'upcoming',
      sourceStatus: 'upcoming',
      statusLabel: 'Scheduled',
      updateMode: 'event-update',
      priority: 'normal',
      lastChecked: STAMP,
      sources: [{ label: 'OneSliders country page', url: `/content/locations/europe/${event.countrySlug}/` }],
      eventPageEN: `${EVENT_DIR}/${event.eventSlug}.html`,
    };
    if (bySlug.has(event.eventSlug)) registry.events[bySlug.get(event.eventSlug)] = { ...registry.events[bySlug.get(event.eventSlug)], ...record };
    else registry.events.push(record);
  }
  registry.generatedAt = GENERATED_AT;
  write(file, `${JSON.stringify(registry, null, 2)}\n`);
}

function countryEventCard(event) {
  return `<a class="visual-topic-card visual-topic-card--national" data-end="${event.startDate}" href="/${EVENT_DIR}/${event.eventSlug}.html#year-${event.nextYear}"><img src="/${IMG_DIR}/${event.eventSlug}-mini.png" alt="" loading="lazy"><strong>${esc(event.title)}</strong><span>${esc(displayDate(event.day, event.month, event.nextYear))} · ${esc(event.country)}</span></a>`;
}

function updateCountryPages(events) {
  for (const event of events) {
    const file = `content/locations/europe/${event.countrySlug}/index.html`;
    if (!fs.existsSync(path.join(ROOT, file))) continue;
    let html = read(file);
    const card = countryEventCard(event);
    if (html.includes(`/${EVENT_DIR}/${event.eventSlug}.html`)) {
      html = html.replace(/<a class="visual-topic-card visual-topic-card--national"[^>]*href="[^"]*\/en\/content\/categories\/culture\/national-day\/events\/[^"]+"[\s\S]*?<\/a>/, card);
    } else {
      html = html.replace(/(<div class="country-paths country-paths--events" data-expiring-events>)/, `$1${card}`);
    }
    write(file, html);
  }
}

function writeNotes(event) {
  const content = `# ${event.title}

Internal reference notes for the OneSliders national-day event page.

## Event Page

- English page: \`${EVENT_DIR}/${event.eventSlug}.html\`
- Country: ${event.country}
- Date: ${event.dateText}
- Current edition: ${event.nextYear}
- Status: upcoming

## Source

- OneSliders country page: \`/content/locations/europe/${event.countrySlug}/\`

## Update Notes

- Keep the event evergreen: the URL should not include a year.
- Update Slide 2 when official ${event.nextYear} local programmes are published.
- Do not invent parades, concerts, speeches or broadcast details without a source.
`;
  write(`docs/events/culture/national-day/${event.eventSlug}.md`, content);
}

function collectEvents() {
  const countryRoot = path.join(ROOT, 'content/locations/europe');
  return fs.readdirSync(countryRoot, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort()
    .map(countrySlug => {
      const pageFile = path.join(countryRoot, countrySlug, 'index.html');
      if (!fs.existsSync(pageFile)) return null;
      const page = fs.readFileSync(pageFile, 'utf8');
      const country = extractCountry(page, countrySlug);
      const override = overrides[countrySlug] || {};
      if (override.skip) return null;
      const dateText = override.date || extractDate(page);
      if (!dateText || /no official/i.test(dateText)) return null;
      const parts = parseDayMonth(dateText);
      if (!parts) return null;
      const candidate2026 = new Date(`${iso(2026, parts.month, parts.day)}T00:00:00Z`);
      const nextYear = candidate2026 < TODAY ? 2027 : 2026;
      const title = override.title || titleOverrides[countrySlug] || `${country} National Day`;
      const eventSlug = countrySlug === 'norway' ? 'oslo-constitution-day' : slugify(title);
      const city = override.city || extractCapital(page);
      return {
        countrySlug,
        country,
        dateText,
        day: parts.day,
        month: parts.month,
        nextYear,
        startDate: iso(nextYear, parts.month, parts.day),
        title,
        eventSlug,
        city,
        cityUrl: cityLink(countrySlug, city),
        reason: override.reason || reasonOverrides[countrySlug] || `a defining civic date in ${country}'s national calendar`,
      };
    })
    .filter(Boolean);
}

const events = collectEvents();
fs.mkdirSync(path.join(ROOT, IMG_DIR), { recursive: true });

for (const event of events) {
  write(`${EVENT_DIR}/${event.eventSlug}.html`, eventHtml(event, { day: event.day, month: event.month }));
  writeNotes(event);
}

const contentCards = events.map(event => cardHtml(event, `../../${EVENT_DIR}`, `../../${IMG_DIR}`)).join('\n');
const enCards = events.map(event => cardHtml(event, '../categories/culture/national-day/events')).join('\n');

removeLegacyNationalDayCards('content/events/index.html');
removeLegacyNationalDayCards('en/content/events/index.html');
upsertGeneratedBlock('content/events/index.html', '    <!-- Europe national days generated: start -->', '    <!-- Europe national days generated: end -->', contentCards);
upsertGeneratedBlock('en/content/events/index.html', '    <!-- Europe national days generated: start -->', '    <!-- Europe national days generated: end -->', enCards);
ensureCountryNames('content/events/index.html', events);
ensureCountryNames('en/content/events/index.html', events);
updateTopicPage(events);
updateCountryPages(events);
updateRegister(events);

write('tmp/europe-national-days.json', `${JSON.stringify(events, null, 2)}\n`);
console.log(`Generated ${events.length} European national-day events.`);
console.log(events.map(event => `${event.country}: ${event.title} (${event.startDate})`).join('\n'));
