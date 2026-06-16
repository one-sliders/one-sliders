import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const topicDir = path.join(root, 'content/categories/wellness/sauna');
const eventsDir = path.join(topicDir, 'events');
const imgDir = path.join(eventsDir, 'img');
fs.mkdirSync(imgDir, { recursive: true });

const countries = {
  finland: { name: 'Finland', continent: 'europe', url: '/content/locations/europe/finland/', flag: '/content/locations/europe/finland/img/flag.svg' },
  norway: { name: 'Norway', continent: 'europe', url: '/content/locations/europe/norway/', flag: '/content/locations/europe/norway/img/flag.svg' },
  germany: { name: 'Germany', continent: 'europe', url: '/content/locations/europe/germany/', flag: '/content/locations/europe/germany/img/flag.svg' },
  estonia: { name: 'Estonia', continent: 'europe', url: '/content/locations/europe/estonia/', flag: '/content/locations/europe/estonia/img/flag.svg' },
  uk: { name: 'United Kingdom', continent: 'europe', url: '/content/locations/europe/united-kingdom/', flag: '/content/locations/europe/united-kingdom/img/flag.svg' },
  japan: { name: 'Japan', continent: 'asia', url: '/content/locations/asia/japan/', flag: '/content/locations/asia/japan/img/flag.svg' },
  australia: { name: 'Australia', continent: 'oceania', url: '/content/locations/oceania/australia/', flag: '/content/locations/oceania/australia/img/flag.svg' },
  usa: { name: 'United States', continent: 'north-america', url: '/content/locations/north-america/usa/', flag: '/content/locations/north-america/usa/img/flag.svg' },
  canada: { name: 'Canada', continent: 'north-america', url: '/content/locations/north-america/canada/', flag: '/content/locations/north-america/canada/img/flag.svg' },
  global: { name: 'Global', continent: 'europe', url: '/content/locations/index.html', flag: '' }
};

const events = [
  ['world-sauna-forum', 'World Sauna Forum', '2026-06-09', '2026-06-11', 'Jyväskylä', 'finland', 'Paviljonki, Sataman Viilu and sauna venues', 'Global sauna business, culture and wellness gathering.', 'Verified: official World Sauna Forum lists 9-11 June 2026 in Jyväskylä.'],
  ['sauna-region-week', 'Sauna Region Week', '2026-06-06', '2026-06-14', 'Jyväskylä Region', 'finland', 'Public saunas, lakeside sites and partner venues', 'Regional sauna week around central Finland with pop-ups, tours and local sauna culture.', 'Dates are aligned to the World Sauna Forum week; exact public programme can change.'],
  ['international-sauna-congress', 'International Sauna Congress', '2026-09-24', '2026-09-26', 'Oslo', 'norway', 'Oslo City Hall and Norwegian sauna venues', 'The international congress for sauna societies, builders and bathing-culture specialists.', 'Verified: official ISC26 listings show 24-26 September 2026 in Oslo.'],
  ['aufguss-wm', 'Aufguss WM', '2026-09-14', '2026-09-20', 'Wendisch Rietz', 'germany', 'Satama Sauna Resort & Spa', 'World championship for performance Aufguss: heat, scent, choreography and storytelling.', 'Verified: Aufguss WM lists 14-20 September 2026 at Satama Sauna Resort & Spa, Germany.'],
  ['modern-classic-cup', 'Modern Classic Cup', '2026-10-01', '2026-10-04', 'Larvik', 'norway', 'Farris Bad', 'International Aufguss competition focused on a modern classic format.', 'Verified: Aufguss WM lists 1-4 October 2026 at Farris Bad, Norway.'],
  ['uk-aufguss-championships', 'UK Aufguss Championships', '2026-04-20', '2026-04-22', 'Galgorm', 'uk', 'Galgorm Resort', 'UK qualifier and showcase for sauna masters and Aufguss performance.', 'Verified: British Sauna Society announced 20-22 April 2026 at Galgorm Resort.'],
  ['european-sauna-marathon', 'European Sauna Marathon', '2026-02-07', '2026-02-07', 'Otepää', 'estonia', 'Otepää sauna route', 'Teams move between saunas in an orienteering-style winter sauna race.', 'Guinness notes Otepää European Sauna Marathon as the longest-running annual sauna marathon, first held in 2007.'],
  ['interbad-sauna-forum', 'interbad Sauna Forum', '2026-10-06', '2026-10-08', 'Stuttgart', 'germany', 'Messe Stuttgart', 'Trade-fair meeting point for pool, spa, wellness and sauna operators.', 'Trade fair dates can shift by edition; keep official interbad listing as source of truth.'],
  ['world-sauna-day', 'World Sauna Day', '2026-04-25', '2026-04-25', 'Worldwide', 'global', 'Local saunas and community bathing sites', 'A global participation day for sauna bathing, sauna stories and community sessions.', 'Exact local programmes vary; use organizer listings before travel.'],
  ['helsinki-sauna-day', 'Helsinki Sauna Day', '2026-03-14', '2026-03-14', 'Helsinki', 'finland', 'Public and private saunas around Helsinki', 'City sauna day where unusual, private or pop-up saunas can open to visitors.', 'Next edition details are TBC; Helsinki remains the canonical city context.'],
  ['tampere-sauna-week', 'Tampere Sauna Week', '2026-06-01', '2026-06-07', 'Tampere', 'finland', 'Tampere public saunas and lakeside venues', 'A sauna capital week for public bathing, lake dips and local sauna tourism.', 'Exact 2026 programme is TBC.'],
  ['tuira-sauna-festival', 'Tuira Sauna Festival', '2026-06-12', '2026-06-14', 'Oulu', 'finland', 'Tuira and Oulu waterfront sauna sites', 'Northern Finland sauna festival built around heat, cold water and community bathing.', 'Exact 2026 programme is TBC.'],
  ['sauna-herbal-cup', 'Sauna Herbal Cup', '2026-11-13', '2026-11-15', 'Europe', 'global', 'Host venue TBC', 'Competition and knowledge event around whisking, herbs, aroma and sauna rituals.', 'Host and final dates are TBC for this page.'],
  ['nordic-sauna-summit', 'Nordic Sauna Summit', '2026-05-28', '2026-05-30', 'Helsinki / Tallinn', 'finland', 'Nordic and Baltic sauna venues', 'Regional summit idea for public sauna operators, designers and bathing-culture communities.', 'Edition details are TBC; use this as a planning placeholder.'],
  ['british-sauna-week', 'British Sauna Week', '2026-09-07', '2026-09-13', 'United Kingdom', 'uk', 'Community saunas and bathing venues', 'UK-wide sauna culture week for community saunas, beach saunas and bathhouse operators.', 'Exact 2026 programme is TBC.'],
  ['japan-sauna-fair', 'Japan Sauna Fair', '2026-07-18', '2026-07-20', 'Tokyo', 'japan', 'Tokyo exhibition and sauna venues', 'Japanese sauna event for sento, sauna goods, cold plunge culture and wellness brands.', 'Exact 2026 dates are TBC.'],
  ['sauna-expo-japan', 'Sauna & Wellness Expo Japan', '2026-09-02', '2026-09-04', 'Tokyo', 'japan', 'Tokyo trade-fair venue TBC', 'Trade-focused sauna and wellness expo for equipment, operators and hospitality.', 'Exact 2026 dates are TBC.'],
  ['australia-sauna-cold-plunge-festival', 'Australia Sauna & Cold Plunge Festival', '2026-08-21', '2026-08-23', 'Sydney', 'australia', 'Waterfront wellness venue TBC', 'Australian festival concept around mobile saunas, cold plunges and recovery culture.', 'Exact 2026 dates are TBC.'],
  ['north-american-sauna-summit', 'North American Sauna Summit', '2026-10-16', '2026-10-18', 'Minneapolis', 'usa', 'Community sauna venues TBC', 'North American meeting point for public sauna, backyard builders and bathhouse operators.', 'Exact 2026 dates are TBC.'],
  ['canadian-sauna-culture-weekend', 'Canadian Sauna Culture Weekend', '2026-02-20', '2026-02-22', 'Toronto', 'canada', 'Urban sauna and cold-plunge venues TBC', 'Winter weekend for Canadian sauna, cold exposure and Nordic-style social wellness.', 'Exact 2026 dates are TBC.']
].map(([slug, title, start, end, city, countryKey, venue, intro, sourceNote]) => ({ slug, title, start, end, city, venue, intro, sourceNote, country: countries[countryKey] }));

const fmtDate = (d) => new Date(`${d}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const countryLink = (c) => c.flag ? `<a class="country" href="${c.url}"><img src="${c.flag}" alt="" width="20" height="14">${c.name}</a>` : `<a class="country" href="${c.url}">${c.name}</a>`;
const nav = `<nav class="event-nav" aria-label="Site navigation"><a class="nav-icon" href="/content/events/index.html" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></a><a class="nav-icon" href="/content/locations/index.html" aria-label="Locations"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></a><a class="nav-icon" href="/content/categories/index.html" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg></a><span class="nav-spacer"></span><details class="nav-language"><summary aria-label="Language">EN</summary><div class="nav-language__list"><a href="#" aria-current="page">English</a></div></details></nav>`;

function page(e) {
  const editions = [2026, 2025, 2024, 2023, 2022, 2021].map((year) => ({
    year,
    headingPlace: `in ${e.city}`,
    status: year === 2026 ? (new Date(e.end) < new Date('2026-05-20') ? 'past' : 'upcoming') : 'past',
    statusLabel: year === 2026 ? 'Scheduled' : 'Archive',
    startDate: year === 2026 ? e.start : `${year}${e.start.slice(4)}`,
    endExclusive: year === 2026 ? e.end : `${year}${e.end.slice(4)}`,
    nextDate: e.start,
    dates: year === 2026 ? `${fmtDate(e.start)} - ${fmtDate(e.end)}` : 'Archive details TBC',
    countries: [e.country],
    cities: [{ name: e.city }],
    venue: year === 2026 ? e.venue : 'Archive venue TBC',
    format: 'Sauna culture, wellness sessions and visitor planning',
    result: year === 2026 ? e.intro : 'Archive notes are TBC.',
    countdownText: e.sourceNote,
    calendarDescription: `${e.title} ${year}`,
    questions: [
      { q: 'When is the event?', a: year === 2026 ? `${fmtDate(e.start)} - ${fmtDate(e.end)}` : 'Archive details TBC', detail: e.sourceNote },
      { q: 'Where is it held?', a: `${e.city}, ${countryLink(e.country)}`, detail: e.venue },
      { q: 'How do I get there?', a: 'Use the host city and official venue notes', detail: 'For sauna events, transport details often depend on separate sauna venues, shuttle boats, public transit or regional tours.' },
      { q: 'What should I pack?', a: 'Swimsuit, towel, sandals and water bottle', detail: 'Some Finnish and Nordic venues rent towels, but serious sauna visitors bring their own kit.' },
      { q: 'What is the programme?', a: 'Sessions, talks, bathing experiences and community time', detail: 'Use the parts slide for the practical structure.' }
    ],
    highlights: [
      { label: 'Best use', title: 'Plan the bathing route, not only the ticket', detail: 'The value is usually in the combination of venue, heat, cold water, hosts and local bathing culture.' },
      { label: 'Travel note', title: 'Check official details before booking', detail: e.sourceNote },
      { label: 'Why it matters', title: 'Sauna is moving from niche ritual to global wellness infrastructure', detail: 'These events show how public bathing, recovery, design and hospitality are converging.' }
    ]
  }));
  const yearData = { eventName: e.title, slug: e.slug, defaultYear: 2026, lastUpdated: '20 May 2026', sources: [{ label: 'Official organizer listing or sauna community listing', url: '#' }], editions };
  const partData = { defaultPart: 'programme', parts: [
    { id: 'programme', label: 'Programme', title: 'Main programme', summary: e.intro, facts: [{ label: 'Venue', value: e.venue }, { label: 'Host city', value: e.city }, { label: 'Country', value: countryLink(e.country) }], blocks: [{ label: 'What to watch', title: 'Look for the practical schedule', detail: 'The most useful detail is where bathing sessions, talks, competitions or workshops happen, and whether booking is separate.' }] },
    { id: 'sauna-sessions', label: 'Sauna sessions', title: 'Heat, cold water and hosted sessions', summary: 'Most sauna events are best understood through the actual bathing sessions, not just stage content.', facts: [{ label: 'Bring', value: 'Towel, swimwear, water bottle' }, { label: 'Check', value: 'Age limits, nudity rules and booking windows' }], blocks: [{ label: 'Visitor note', title: 'Rules change by country and venue', detail: 'Mixed-gender textile rules, silence rules, whisking rules and cold-plunge access can differ sharply by venue.' }] },
    { id: 'planning', label: 'Planning', title: 'Tickets, travel and first-timer notes', summary: 'Sauna events can sell a main ticket, separate bathing slots, tours and after-hours sessions.', facts: [{ label: 'Ticket status', value: 'Check official organizer' }, { label: 'Travel risk', value: 'Many details are TBC until programme release' }], blocks: [{ label: 'First timer', title: 'Do less, enjoy more', detail: 'Avoid overbooking every session. Leave recovery time, eat lightly, hydrate and ask hosts about local etiquette.' }] }
  ] };
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/assets/css/events.css?v=sauna-events-20260520">
  <script defer src="/assets/js/events.js?v=year-specific-only-20260520"></script>
  <link rel="preload" as="image" href="/content/categories/wellness/sauna/events/img/${e.slug}-hero.png">
  <meta name="description" content="${e.title} sauna event view with dates, place, programme and visitor planning.">
  <meta property="og:title" content="${e.title} | OneSliders"><meta property="og:image" content="/content/categories/wellness/sauna/events/img/${e.slug}-hero.png">
  <title>${e.title} | OneSliders</title>
  <script type="application/json" id="event-year-data">${JSON.stringify(yearData)}</script>
  <script type="application/json" id="event-part-data">${JSON.stringify(partData)}</script>
</head>
<body class="event-page">${nav}<main class="event-carousel" data-carousel><div class="event-carousel__track" data-carousel-track>
<section class="event-slide event-slide--hero" id="general" data-slide="general"><img class="event-hero__image" src="/content/categories/wellness/sauna/events/img/${e.slug}-hero.png" alt="" width="1200" height="630" fetchpriority="high"><div class="event-slide__content"><div class="event-hero-copy"><p class="event-kicker">Wellness / Sauna</p><h1 class="event-title">${e.title}</h1><p class="event-lede">${e.intro}</p></div><div class="facts-strip hero-control"><div class="fact"><span>Current edition</span><strong>2026</strong></div><div class="fact"><span>Dates</span><strong>${fmtDate(e.start)} - ${fmtDate(e.end)}</strong></div><div class="fact"><span>Place</span><strong>${e.city}</strong></div><div class="fact"><span>Country</span><strong>${countryLink(e.country)}</strong></div></div><div class="card-grid"><a class="topic-card topic-card--inline" href="/content/categories/wellness/sauna.html"><img src="/content/categories/wellness/sauna/events/img/${e.slug}-mini.png" alt="" width="400" height="300" loading="lazy"><span>More sauna events</span><strong>Back to Sauna</strong><p>See the full sauna topic list.</p></a><div class="card"><span>Why follow it</span><strong>Heat culture is becoming travel culture</strong><p>${e.title} connects sauna ritual with hospitality, design, recovery, cold water and community bathing.</p></div><div class="card"><span>Format</span><strong>Programme plus bathing sessions</strong><p>Expect a mix of talks, sauna sessions, demonstrations, networking or local bathing routes depending on the event.</p></div></div><div class="card card--editions"><span>Recent editions</span><table class="event-table"><thead><tr><th>Year</th><th>Host / place</th><th>Country</th></tr></thead><tbody>${[2026,2025,2024,2023,2022,2021].map(y => `<tr><th>${y}</th><td>${y === 2026 ? e.city : 'Archive TBC'}</td><td>${countryLink(e.country)}</td></tr>`).join('')}</tbody></table></div><div class="card-grid card-grid--support"><div class="card"><span>Planning note</span><strong>${e.sourceNote}</strong><p>Where official 2026 data is not yet published, this page keeps the event useful but labels details as TBC.</p></div><div class="card"><span>Notable moments</span><ul class="event-list"><li>Host context: ${countryLink(e.country)}.</li><li>Core visitor value: sauna sessions, local etiquette and bathing culture.</li><li>Best checked close to event: tickets, towels, nudity/textile rules and public transport.</li></ul></div></div></div></section>
<section class="event-slide" id="year" data-slide="year"><img class="event-hero__image" src="/content/categories/wellness/sauna/events/img/${e.slug}-hero.png" alt="" width="1200" height="630" loading="lazy"><div class="event-slide__content"><div class="event-hero-copy"><p class="event-kicker">Edition view</p><h2 class="event-section-title" data-year-heading>${e.title} 2026</h2><p class="event-subtitle">Switch between recent editions without leaving the one-slider.</p></div><div class="year-switcher hero-control" data-year-switcher aria-label="Choose edition"></div><div class="year-edition" data-year-edition></div></div></section>
<section class="event-slide" id="parts" data-slide="parts"><img class="event-hero__image" src="/content/categories/wellness/sauna/events/img/${e.slug}-hero.png" alt="" width="1200" height="630" loading="lazy"><div class="event-slide__content"><div class="event-hero-copy"><p class="event-kicker">Programme parts</p><h2 class="event-section-title">Programme parts</h2><p class="event-subtitle">Practical pieces of the event, from schedule to sauna etiquette.</p></div><div class="part-switcher hero-control" data-part-switcher aria-label="Choose event part"></div><div class="part-detail" data-part-detail></div></div></section>
</div><button class="event-carousel__prev" type="button" data-carousel-prev aria-label="Previous slide">Previous</button><button class="event-carousel__next" type="button" data-carousel-next aria-label="Next slide">Next</button><nav class="event-carousel__dots" data-carousel-dots aria-label="Slide navigation"></nav></main></body></html>`;
}

for (const event of events) fs.writeFileSync(path.join(eventsDir, `${event.slug}.html`), page(event), 'utf8');

const card = (e) => `<a class="event-card" href="sauna/events/${e.slug}.html#year" data-end="${e.end}"><img class="event-thumb" src="sauna/events/img/${e.slug}-mini.png" alt="" loading="lazy"><time>${fmtDate(e.start)}</time><strong>${e.title}</strong><p>${e.city}, ${e.country.name}. ${e.intro}</p></a>`;
let sauna = fs.readFileSync(path.join(root, 'content/categories/wellness/sauna.html'), 'utf8');
sauna = sauna.replace(/<header class="topic-hero" style="--hero:[^"]+">/, `<header class="topic-hero" style="--hero: url('sauna/events/img/world-sauna-forum-hero.png');">`);
sauna = sauna.replace(/<p class="intro">[\s\S]*?<\/p>/, '<p class="intro">Sauna events bring together heat, cold water, recovery, design, community bathing and Nordic wellness culture.</p>');
sauna = sauna.replace(/<div class="note-card">[\s\S]*?<\/div><\/div>/, '<div class="note-card">The largest sauna events range from congresses and trade fairs to Aufguss championships, winter sauna marathons and public bathing festivals.</div></div>');
sauna = sauna.replace(/<div class="carousel"><div class="event-grid carousel-track" data-carousel-track>[\s\S]*?<\/div><\/div>/, `<div class="carousel"><div class="event-grid carousel-track" data-carousel-track>\n${events.map(card).join('\n')}\n          </div></div>`);
fs.writeFileSync(path.join(root, 'content/categories/wellness/sauna.html'), sauna, 'utf8');

const indexPath = path.join(root, 'content/events/index.html');
let index = fs.readFileSync(indexPath, 'utf8');
index = index.replace('--c-tech:     #235c75;', '--c-tech:     #235c75;\n      --c-wellness: #4f8a68;');
index = index.replace('.filter-btn[data-cat="tech"].active     { background: var(--c-tech); }', '.filter-btn[data-cat="tech"].active     { background: var(--c-tech); }\n    .filter-btn[data-cat="wellness"].active { background: var(--c-wellness); }');
index = index.replace('<button class="filter-btn" data-cat="tech">Technology</button>', '<button class="filter-btn" data-cat="tech">Technology</button>\n      <button class="filter-btn" data-cat="wellness">Wellness</button>');
const indexCards = events.map(e => `<a class="event-card" data-end="${e.end}" data-cat="wellness" data-topic="sauna" data-cont="${e.country.continent}" data-country="${e.country.url.split('/').filter(Boolean).pop()}" data-keywords="sauna, wellness, bathing culture, aufguss, cold plunge" href="../categories/wellness/sauna/events/${e.slug}.html#year-2026" data-start="${e.start}" data-reach="${e.country.name === 'Global' ? 'global' : 'continent'}" style="--cat-color:var(--c-wellness)"><img class="card-thumb" src="../categories/wellness/sauna/events/img/${e.slug}-mini.png" alt="${e.title}" loading="lazy"><div class="card-stripe"></div><div class="card-body"><span class="cat-pill">Wellness</span><strong class="card-title">${e.title}</strong><span class="card-meta">${fmtDate(e.start)} - ${fmtDate(e.end)} · ${e.city}, ${e.country.name}</span></div></a>`).join('\n        ');
index = index.replace('</main>', `        ${indexCards}\n  </main>`);
fs.writeFileSync(indexPath, index, 'utf8');

const weekPath = path.join(root, 'content/events/this-week.html');
let week = fs.readFileSync(weekPath, 'utf8');
week = week.replace('--tech:#235c75;', '--tech:#235c75;--wellness:#4f8a68;');
week = week.replace('.toolbar button[data-filter="tech"].active{background:var(--tech);border-color:var(--tech)}', '.toolbar button[data-filter="tech"].active{background:var(--tech);border-color:var(--tech)}.toolbar button[data-filter="wellness"].active{background:var(--wellness);border-color:var(--wellness)}');
week = week.replace('<button data-filter="tech">Technology</button>', '<button data-filter="tech">Technology</button><button data-filter="wellness">Wellness</button>');
fs.writeFileSync(weekPath, week, 'utf8');

fs.writeFileSync(path.join(root, 'scripts/sauna-events-data.json'), JSON.stringify(events, null, 2), 'utf8');
