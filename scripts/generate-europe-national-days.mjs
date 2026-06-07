import fs from 'node:fs';
import path from 'node:path';

const ROOT = globalThis.nodeRepl ? globalThis.nodeRepl.cwd : process.cwd();
const TODAY = new Date('2026-06-07T00:00:00Z');
const STAMP = '7 June 2026';
const GENERATED_AT = '2026-06-07';
const EVENT_DIR = 'content/categories/culture/national-day/events';
const IMG_DIR = `${EVENT_DIR}/img`;
const DATA_FILE = 'scripts/data/national-days.json';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const overrides = {
  austria: { date: '26 October', title: 'Austria National Day', reason: 'neutrality and modern civic identity', city: 'Vienna' },
  switzerland: { date: '1 August', title: 'Swiss National Day', reason: 'Swiss founding tradition and cantonal identity', city: 'Bern' },
  norway: { date: '17 May', title: 'Norwegian Constitution Day', reason: 'the signing of Norway\'s constitution in 1814', city: 'Oslo' },
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
  return fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/^\uFEFF/, '');
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

function countryChip(country, slug, prefix = '../../../../../../', continent = 'europe') {
  return `<a class="country" href="${prefix}content/locations/${continent}/${slug}/index.html"><img src="${prefix}content/locations/${continent}/${slug}/img/flag.svg" alt="" width="20" height="14">${esc(country)}</a>`;
}

function cityLink(countrySlug, city, continent = 'europe') {
  if (!city || city.toUpperCase() === 'TBC') return '';
  const citySlug = slugify(city);
  const file = `content/locations/${continent}/${countrySlug}/${citySlug}.html`;
  return fs.existsSync(path.join(ROOT, file)) ? `/content/locations/${continent}/${countrySlug}/${citySlug}.html` : '';
}

function makeEditions(event, dateParts) {
  const editions = [];
  for (let year = 2021; year <= event.nextYear; year += 1) {
    const startDate = iso(year, dateParts.month, dateParts.day);
    const end = new Date(`${startDate}T00:00:00Z`);
    end.setUTCDate(end.getUTCDate() + 1);
    const endExclusive = end.toISOString().slice(0, 10);
    const status = year < event.nextYear ? 'past' : 'upcoming';
    const continent = event.continent || 'europe';
    const chip = `<a class="country" href="/content/locations/${continent}/${event.countrySlug}/index.html"><img src="/content/locations/${continent}/${event.countrySlug}/img/flag.svg" alt="" width="20" height="14">${esc(event.country)}</a>`;
    const whereDetail = event.countrySlug === 'norway'
      ? 'Norwegian Constitution Day is nationwide. In Oslo, watch the children parade by the palace. In Stavanger, follow the city-centre parade and harbour crowds. In Bergen, expect local parades around the centre. Check each municipality\'s 17 May programme before travel.'
      : `${event.title} uses one national date, but the useful visitor plan starts with the city. ${event.city ? `In ${event.city}, expect official or highly visible civic moments, but local celebrations can vary by municipality.` : 'Local celebrations vary by city and region.'} Check municipal programmes before travel.`;
    editions.push({
      year,
      headingPlace: `in ${event.country}`,
      status,
      statusLabel: status === 'past' ? 'Archive' : 'Scheduled',
      startDate,
      endExclusive,
      nextDate: iso(year + 1, dateParts.month, dateParts.day),
      dates: displayDate(dateParts.day, dateParts.month, year),
      countries: [{ name: event.country, url: `/content/locations/${continent}/${event.countrySlug}/index.html`, flag: `/content/locations/${continent}/${event.countrySlug}/img/flag.svg` }],
      cities: [{ name: 'Nationwide' }],
      venue: event.country,
      format: 'Fixed annual civic date',
      countdownText: `${event.title} follows the same calendar date: ${event.dateText}.`,
      calendarDescription: `${event.title} ${year}.`,
      questions: [
        { q: 'Where can I celebrate?', a: chip, detail: whereDetail },
        { q: 'Date', a: displayDate(dateParts.day, dateParts.month, year), detail: `${event.title} is observed annually on ${event.dateText}.` },
        { q: 'Public holiday', a: 'National public holiday', detail: `${event.dateText} is ${event.country}'s national day and a countrywide public holiday or civic observance.` },
        { q: 'Ceremony', a: 'Official ceremonies', detail: 'Expect flag raising, speeches, wreath-laying or civic ceremonies, with exact local timing set by each municipality or organiser.' },
        { q: 'Parade', a: 'Local parades and processions', detail: 'The core pattern is annual: flags, civic groups, schools, bands or local parades, with routes published locally.' },
        { q: 'Opening hours', a: 'Public-holiday hours', detail: 'Many shops and services use holiday hours. Restaurants, museums and transport vary by city, so check local listings for the place you visit.' },
        { q: 'Transport', a: 'Local parade traffic', detail: 'Plan for closed streets, busy public transport and walking routes around town centres during ceremonies and parades.' },
        { q: 'Weather', a: 'Seasonal weather', detail: 'Check the local forecast a few days before the national day and dress for outdoor waiting.' },
      ],
      highlights: [],
      lifecycleLabel: status === 'past' ? 'Archive' : 'Programme',
    });
  }
  return editions;
}

function countryChipAbs(event) {
  const continent = event.continent || 'europe';
  return `<a class="country" href="/content/locations/${continent}/${event.countrySlug}/index.html"><img src="/content/locations/${continent}/${event.countrySlug}/img/flag.svg" alt="" width="20" height="14">${esc(event.country)}</a>`;
}

function defaultRhythm(event) {
  return event.rhythm || [
    { time: 'Morning', label: 'Flags and official moments' },
    { time: 'Midday', label: 'Local ceremonies' },
    { time: 'Afternoon', label: 'Family visits and city walks' },
    { time: 'Evening', label: 'Public gatherings' },
  ];
}

function defaultBars(event) {
  return event.foodBars || [
    { label: 'Local holiday food', width: 88, note: 'check city' },
    { label: 'Flags', width: 96, note: 'high' },
    { label: 'Ceremonies', width: 78, note: 'official' },
    { label: 'Family meals', width: 66, note: 'common' },
  ];
}

function defaultPlaces(event) {
  if (event.places && event.places.length) return event.places;
  const city = event.city && !/^nationwide$/i.test(event.city) ? event.city : 'Capital city';
  return [
    { name: city, note: 'official ceremonies and the most visible programme' },
    { name: 'Town centres', note: 'local flags, speeches and public-holiday crowds' },
    { name: 'Main squares', note: 'good first stop after checking municipal timings' },
  ];
}

function defaultStayCities(event) {
  if (event.stayCities && event.stayCities.length) return event.stayCities;
  const continent = event.continent || 'europe';
  if (event.city && !/^nationwide$/i.test(event.city)) return [{ name: event.city, url: event.cityUrl || `/content/locations/${continent}/${event.countrySlug}/index.html` }];
  return [{ name: event.country, url: `/content/locations/${continent}/${event.countrySlug}/index.html` }];
}

function defaultAnthem(event) {
  if (!event.anthem || !event.anthem.title || !event.anthem.note) {
    throw new Error(`Missing anthem content for ${event.eventSlug}`);
  }
  return event.anthem;
}

function nationalDayWhy(event) {
  if (!event.why || !event.why.title || !event.why.text) {
    throw new Error(`Missing why content for ${event.eventSlug}`);
  }
  return event.why;
}

function pctClass(width) {
  const safe = Math.max(10, Math.min(100, Number(width) || 64));
  const rounded = Math.round(safe / 10) * 10;
  return `class="nd-w${rounded}"`;
}

function eventHtml(event, dateParts) {
  const yearData = {
    eventName: event.title,
    slug: event.eventSlug,
    eventType: 'national-day',
    defaultYear: event.nextYear,
    lastUpdated: STAMP,
    sources: [{ label: 'OneSliders country page', url: `/content/locations/${event.continent || 'europe'}/${event.countrySlug}/` }],
    editions: makeEditions(event, dateParts),
  };

  const country = countryChipAbs(event);
  const bodyClass = `event-page event-page--framed event-page--non-sport event-page--national-day${event.eventSlug === 'norwegian-constitution-day' ? ' event-page--norway-national-day' : ''}`;
  const rhythm = defaultRhythm(event).map(item => `<div><time>${esc(item.time)}</time><b>${esc(item.label)}</b></div>`).join('');
  const bars = defaultBars(event).map(item => `<p><b>${esc(item.label)}</b><i ${pctClass(item.width)}></i><em>${esc(item.note)}</em></p>`).join('');
  const places = defaultPlaces(event).map(item => `<tr><th>${esc(item.name)}</th><td>${esc(item.note)}</td></tr>`).join('');
  const stay = defaultStayCities(event).slice(0, 4).map(item => `<a href="${esc(item.url || `/content/locations/europe/${event.countrySlug}/index.html`)}">Stay ${esc(item.name)}</a>`).join('');
  const anthem = defaultAnthem(event);
  const why = nationalDayWhy(event);
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
  <link rel="stylesheet" href="../../../../../../assets/css/events.css?v=national-day-frame-20260607d">
  <script defer src="../../../../../../assets/js/events.js?v=national-day-frame-20260607d"></script>
  <link rel="preload" as="image" href="../../../../../../${IMG_DIR}/${event.eventSlug}-hero.png">
  <link rel="canonical" href="https://one-sliders.com/${EVENT_DIR}/${event.eventSlug}.html">
  <meta name="description" content="${esc(event.title)} event view with date, meaning, city planning, food notes and national-day context.">
  <meta name="keywords" content="${esc(event.eventSlug.replace(/-/g, ' '))}, national day, ${esc(event.country.toLowerCase())} public holiday, ${esc(event.dateText.toLowerCase())}">
  <meta property="og:title" content="${esc(event.title)} | OneSliders">
  <meta property="og:image" content="https://one-sliders.com/${IMG_DIR}/${event.eventSlug}-hero.png">
  <meta name="twitter:card" content="summary_large_image">
  <title>${esc(event.title)} | OneSliders</title>
<script type="application/json" id="event-year-data">${JSON.stringify(yearData)}</script>
</head>
<body class="${bodyClass}">
  <nav class="event-nav" aria-label="Site navigation">
    <a class="nav-icon" href="/content/events/index.html" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></a>
    <a class="nav-icon" href="/content/locations/index.html" aria-label="Locations"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></a>
    <a class="nav-icon" href="/content/categories/index.html" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg></a>
    <span class="nav-spacer"></span>
    <details class="nav-language"><summary aria-label="Language">EN</summary><div class="nav-language__list"><a href="#" aria-current="page">English</a></div></details>
  </nav>
  <main class="event-frame national-day-frame" id="general" aria-labelledby="event-title" data-non-sport-event-page>
    <section class="event-frame__visual" aria-label="${esc(event.title)} overview">
      <div class="event-frame__media">
        <img src="../../../../../../${IMG_DIR}/${event.eventSlug}-hero.png" srcset="../../../../../../${IMG_DIR}/${event.eventSlug}-hero-400.webp 400w, ../../../../../../${IMG_DIR}/${event.eventSlug}-hero-768.webp 768w, ../../../../../../${IMG_DIR}/${event.eventSlug}-hero-1200.webp 1200w" sizes="(max-width: 900px) 100vw, 42vw" alt="${esc(event.title)} visual" width="1200" height="630" fetchpriority="high">
      </div>
      <div class="event-frame__copy">
        <div>
          <p class="event-kicker">National day</p>
          <h1 class="event-title" id="event-title">${esc(event.title)}</h1>
        </div>
        <div class="card-grid">
          <div class="card"><span>Why this day?</span><strong>${esc(why.title)}</strong><p>${esc(why.text)}</p></div>
          <div class="card"><span>Before you go</span><strong>Check the municipality programme</strong><p>Use the city programme for street closures, transport changes and public-holiday opening hours.</p></div>
        </div>
        <div class="question-grid">
          <div class="question"><span>Country guide</span><strong>${country}</strong><p>${esc(event.happensNote || 'Expect the national date to be shared, but the visible celebration to be local.')}</p></div>
          <div class="question"><span>Transport</span><strong>Plan around official routes</strong><p>Central streets can close early. Pick your city, check the municipal route map and leave extra time for walking.</p></div>
        </div>
      </div>
    </section>
    <section class="event-frame__panel" aria-label="${esc(event.title)} planning">
      <div class="event-frame__panel-header"><p class="event-kicker">Planning</p><h2 class="event-section-title">In practice</h2><p class="event-subtitle">Pick the city first, then check its route, timing, food stops and transport changes.</p><div class="actions-row"><a class="event-button event-button--inline" href="/content/categories/culture/national-day.html">All national days</a></div></div>
      <div class="year-edition">
        <div class="national-day-visuals" aria-label="${esc(event.title)} visual guide">
          <div class="nd-panel nd-panel--wide"><span>Day rhythm</span><strong>${esc(event.rhythmTitle || 'From official moments to local gatherings')}</strong><div class="nd-timeline">${rhythm}</div></div>
          <div class="nd-panel"><span>Food and day mix</span><strong>${esc(event.foodTitle || 'What fills the day')}</strong><div class="nd-bars">${bars}</div></div>
          <div class="nd-panel"><span>City feel</span><strong>Pick your scene</strong><table class="nd-table"><tbody>${places}</tbody></table>${stay ? `<div class="stay-city-buttons" aria-label="Stay choices">${stay}</div>` : ''}</div>
          <div class="nd-panel nd-panel--anthem"><span>National anthem</span><strong>${esc(anthem.title)}</strong><p>${esc(anthem.note)}</p><dl class="anthem-facts">${anthem.writer ? `<div><dt>Words</dt><dd>${esc(anthem.writer)}</dd></div>` : ''}${anthem.composer ? `<div><dt>Music</dt><dd>${esc(anthem.composer)}</dd></div>` : ''}${anthem.created ? `<div><dt>Created</dt><dd>${esc(anthem.created)}</dd></div>` : ''}${anthem.adopted ? `<div><dt>Adopted</dt><dd>${esc(anthem.adopted)}</dd></div>` : ''}</dl><div class="nd-notes" aria-label="Anthem motif"><i></i><i></i><i></i><i></i><i></i></div></div>
        </div>
      </div>
    </section>
  </main>
</body>
</html>
`;
}

function cardHtml(event, eventDir, imgDir = `${eventDir}/img`) {
  const meta = `${displayDate(event.day, event.month, event.nextYear)} - ${event.country}`;
  const continent = event.continent || 'europe';
  const flag = `../locations/${continent}/${event.countrySlug}/img/flag.svg`;
  return `        <a class="event-card" data-end="${event.startDate}" data-cat="culture" data-topic="national-day" data-cont="${continent}" data-country="${event.countrySlug}" data-keywords="${esc(`${event.title}, ${event.country} national day, public holiday`)}" href="${eventDir}/${event.eventSlug}.html" data-start="${event.startDate}" data-reach="national" style="--cat-color:var(--c-culture)"><img class="card-thumb" src="${imgDir}/${event.eventSlug}-mini.png" alt="${esc(event.title)}" loading="lazy"><div class="card-stripe"></div><div class="card-body"><span class="cat-pill"><img src="${flag}" alt="" width="18" height="12" loading="lazy">National Day</span><strong class="card-title">${esc(event.title)}</strong><span class="card-meta">${esc(meta)}</span></div></a>`;
}

function removeLegacyNationalDayCards(file) {
  let html = read(file);
  html = html.replace(/\s*<a class="event-card"[\s\S]*?<\/a>/g, card =>
    /\bdata-topic="national-day"/.test(card) ? '' : card
  );
  write(file, html);
}

function stripGeneratedNationalDayBlock(html) {
  return html.replace(/\n?\s*<!-- Europe national days generated: start -->[\s\S]*?<!-- Europe national days generated: end -->\n?/g, '\n');
}

function upsertNationalDayCardsIntoMonths(file, events) {
  removeLegacyNationalDayCards(file);
  let html = stripGeneratedNationalDayBlock(read(file));
  for (const event of [...events].sort((a, b) => a.startDate.localeCompare(b.startDate))) {
    const monthId = `m${event.startDate.slice(0, 7).replace('-', '')}`;
    const card = cardHtml(event, '../categories/culture/national-day/events');
    const re = new RegExp(`(<section class="month-section" id="${monthId}">[\\s\\S]*?<div class="events-grid">)([\\s\\S]*?)(\\n\\s*</div>\\s*</section>)`);
    if (!re.test(html)) throw new Error(`Missing month section ${monthId} for ${event.eventSlug}`);
    html = html.replace(re, `$1$2\n${card}$3`);
  }
  write(file, html);
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
      location: { countries: [event.country], cities: ['Nationwide'], venue: event.country },
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
      sources: [{ label: 'OneSliders country page', url: `/content/locations/${event.continent || 'europe'}/${event.countrySlug}/` }],
      eventPageEN: `${EVENT_DIR}/${event.eventSlug}.html`,
    };
    if (bySlug.has(event.eventSlug)) registry.events[bySlug.get(event.eventSlug)] = { ...registry.events[bySlug.get(event.eventSlug)], ...record };
    else registry.events.push(record);
  }
  registry.generatedAt = GENERATED_AT;
  write(file, `${JSON.stringify(registry, null, 2)}\n`);
}

function countryEventCard(event) {
  return `<a class="visual-topic-card visual-topic-card--national" data-end="${event.startDate}" href="/${EVENT_DIR}/${event.eventSlug}.html"><img src="/${IMG_DIR}/${event.eventSlug}-mini.png" alt="" loading="lazy"><strong>${esc(event.title)}</strong><span>${esc(displayDate(event.day, event.month, event.nextYear))} Â· ${esc(event.country)}</span></a>`;
}

function updateCountryPages(events) {
  for (const event of events) {
    const file = `content/locations/${event.continent || 'europe'}/${event.countrySlug}/index.html`;
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
- Displayed edition: ${event.nextYear}
- Status: upcoming

## Source

- OneSliders country page: \`/content/locations/${event.continent || 'europe'}/${event.countrySlug}/\`

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
      const eventSlug = countrySlug === 'norway' ? 'norwegian-constitution-day' : slugify(title);
      const city = override.city || extractCapital(page);
      return {
        continent: 'europe',
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
        cityUrl: cityLink(countrySlug, city, 'europe'),
        reason: override.reason || reasonOverrides[countrySlug] || `a defining civic date in ${country}'s national calendar`,
      };
    })
    .filter(Boolean);
}

function enrichNationalDayEvent(event) {
  const next = { ...event };
  next.continent = next.continent || 'europe';
  next.cityUrl = next.cityUrl || cityLink(next.countrySlug, next.city || '', next.continent);
  next.startDate = next.startDate || iso(next.nextYear, next.month, next.day);
  if (next.countrySlug === 'norway') {
    next.happens = 'Children parades, flags and local ceremonies';
    next.happensNote = 'The national date is fixed; the route, timing and crowd pattern are decided locally.';
    next.rhythmTitle = 'From breakfast to parade crowds';
    next.rhythm = [
      { time: 'Morning', label: 'Breakfasts, bunad, flags' },
      { time: 'Late morning', label: 'Children parades' },
      { time: 'Afternoon', label: 'Food, family visits, concerts' },
      { time: 'Evening', label: 'Local gatherings' },
    ];
    next.foodTitle = 'What fills the day';
    next.foodBars = [
      { label: 'Ice cream', width: 96, note: 'very high' },
      { label: 'Hot dogs', width: 88, note: 'classic' },
      { label: 'Waffles', width: 70, note: 'common' },
      { label: 'Cake breakfast', width: 62, note: 'families' },
    ];
    next.places = [
      { name: 'Oslo', note: 'royal palace route, biggest crowds' },
      { name: 'Stavanger', note: 'harbour, city-centre parade' },
      { name: 'Bergen', note: 'centre parades and local bands' },
    ];
    next.stayCities = [
      { name: 'Oslo', url: '/content/locations/europe/norway/oslo.html' },
      { name: 'Bergen', url: '/content/locations/europe/norway/index.html' },
      { name: 'Stavanger', url: '/content/locations/europe/norway/index.html' },
      { name: 'Trondheim', url: '/content/locations/europe/norway/index.html' },
    ];
    next.anthem = {
      title: 'Ja, vi elsker dette landet',
      note: 'Words by Bjornstjerne Bjornson, melody by Rikard Nordraak. Often sung at school and civic gatherings on 17 May.',
    };
  }
  return next;
}

function extraNationalDayEvents() {
  return [
    {
      continent: 'south-america',
      countrySlug: 'brazil',
      country: 'Brazil',
      dateText: '7 September',
      day: 7,
      month: 9,
      nextYear: 2026,
      title: 'Brazil Independence Day',
      eventSlug: 'brazil-independence-day',
      city: 'Brasilia',
      cityUrl: '/content/locations/south-america/brazil/brasilia.html',
      reason: 'Brazilian independence from Portugal in 1822',
      places: [
        { name: 'Brasilia', note: 'official capital programme and civic ceremonies' },
        { name: 'Rio de Janeiro', note: 'large-city holiday crowds and public spaces' },
        { name: 'Sao Paulo', note: 'urban holiday base with transport planning needed' },
      ],
      stayCities: [
        { name: 'Brasilia', url: '/content/locations/south-america/brazil/brasilia.html' },
        { name: 'Rio', url: '/content/locations/south-america/brazil/rio-de-janeiro.html' },
        { name: 'Sao Paulo', url: '/content/locations/south-america/brazil/sao-paulo.html' },
      ],
    },
    {
      continent: 'south-america',
      countrySlug: 'chile',
      country: 'Chile',
      dateText: '18 September',
      day: 18,
      month: 9,
      nextYear: 2026,
      title: 'Chile Fiestas Patrias',
      eventSlug: 'chile-independence-day-and-fiestas-patrias',
      city: 'Santiago',
      cityUrl: '/content/locations/south-america/chile/santiago.html',
      reason: 'Chile\'s first national government junta in 1810 and the wider Fiestas Patrias holiday',
      places: [
        { name: 'Santiago', note: 'largest urban base and civic holiday programme' },
        { name: 'Fondas', note: 'traditional food, music and dancing venues' },
        { name: 'Local towns', note: 'family gatherings and municipal celebrations' },
      ],
      stayCities: [
        { name: 'Santiago', url: '/content/locations/south-america/chile/santiago.html' },
      ],
    },
    {
      continent: 'oceania',
      countrySlug: 'fiji',
      country: 'Fiji',
      dateText: '10 October',
      day: 10,
      month: 10,
      nextYear: 2026,
      title: 'Fiji Day',
      eventSlug: 'fiji-day',
      city: 'Suva',
      cityUrl: '/content/locations/oceania/fiji/suva.html',
      reason: 'Fiji\'s independence in 1970',
      places: [
        { name: 'Suva', note: 'capital ceremonies and civic programme' },
        { name: 'Nadi', note: 'visitor base; check local holiday services' },
        { name: 'Resort areas', note: 'ask locally which ceremonies or cultural moments are open' },
      ],
      stayCities: [
        { name: 'Suva', url: '/content/locations/oceania/fiji/suva.html' },
        { name: 'Fiji', url: '/content/locations/oceania/fiji/index.html' },
      ],
    },
  ];
}

function loadNationalDayData() {
  const full = path.join(ROOT, DATA_FILE);
  let data;
  if (fs.existsSync(full)) {
    data = JSON.parse(fs.readFileSync(full, 'utf8'));
  } else {
    data = collectEvents();
  }
  const seen = new Set(data.map(event => event.eventSlug));
  for (const event of extraNationalDayEvents()) {
    if (!seen.has(event.eventSlug)) data.push(event);
  }
  return data.map(enrichNationalDayEvent);
}

const events = loadNationalDayData();
write(DATA_FILE, `${JSON.stringify(events, null, 2)}\n`);
fs.mkdirSync(path.join(ROOT, IMG_DIR), { recursive: true });

for (const event of events) {
  write(`${EVENT_DIR}/${event.eventSlug}.html`, eventHtml(event, { day: event.day, month: event.month }));
  writeNotes(event);
}

upsertNationalDayCardsIntoMonths('content/events/index.html', events);
ensureCountryNames('content/events/index.html', events);
updateTopicPage(events);
updateCountryPages(events);
updateRegister(events);

write('tmp/national-days.json', `${JSON.stringify(events, null, 2)}\n`);
console.log(`Generated ${events.length} national-day events.`);
console.log(events.map(event => `${event.country}: ${event.title} (${event.startDate})`).join('\n'));
