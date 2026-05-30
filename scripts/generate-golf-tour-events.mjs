import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const today = new Date('2026-05-30T12:00:00Z');
const lastUpdated = '30 May 2026';
const eventDir = path.join(root, 'content/categories/sport/golf/events');
const eventImgDir = path.join(eventDir, 'img');

const countries = {
  usa: country('United States', '/content/locations/north-america/usa/index.html', '/content/locations/north-america/usa/img/flag.svg', 'north-america', 'usa'),
  canada: country('Canada', '/content/locations/north-america/canada/index.html', '/content/locations/north-america/canada/img/flag.svg', 'north-america', 'canada'),
  mexico: country('Mexico', '/content/locations/north-america/mexico/index.html', '/content/locations/north-america/mexico/img/flag.svg', 'north-america', 'mexico'),
  dominicanRepublic: country('Dominican Republic', '/content/locations/north-america/dominican-republic/index.html', '/content/locations/north-america/dominican-republic/img/flag.svg', 'north-america', 'dominican-republic'),
  unitedKingdom: country('United Kingdom', '/content/locations/europe/united-kingdom/index.html', '/content/locations/europe/united-kingdom/img/flag.svg', 'europe', 'united-kingdom'),
  japan: country('Japan', '/content/locations/asia/japan/index.html', '/content/locations/asia/japan/img/flag.svg', 'asia', 'japan'),
  thailand: country('Thailand', '/content/locations/asia/thailand/index.html', '/content/locations/asia/thailand/img/flag.svg', 'asia', 'thailand'),
  singapore: country('Singapore', '/content/locations/asia/singapore/index.html', '/content/locations/asia/singapore/img/flag.svg', 'asia', 'singapore'),
  china: country('China', '/content/locations/asia/china/index.html', '/content/locations/asia/china/img/flag.svg', 'asia', 'china'),
  southKorea: country('South Korea', '/content/locations/asia/south-korea/index.html', '/content/locations/asia/south-korea/img/flag.svg', 'asia', 'south-korea'),
  malaysia: country('Malaysia', '/content/locations/asia/malaysia/index.html', '/content/locations/asia/malaysia/img/flag.svg', 'asia', 'malaysia'),
  france: country('France', '/content/locations/europe/france/index.html', '/content/locations/europe/france/img/flag.svg', 'europe', 'france'),
  netherlands: country('Netherlands', '/content/locations/europe/netherlands/index.html', '/content/locations/europe/netherlands/img/flag.svg', 'europe', 'netherlands'),
  saudiArabia: country('Saudi Arabia', '/content/locations/asia/saudi-arabia/index.html', '/content/locations/asia/saudi-arabia/img/flag.svg', 'asia', 'saudi-arabia'),
  australia: country('Australia', '/content/locations/oceania/australia/index.html', '/content/locations/oceania/australia/img/flag.svg', 'oceania', 'australia'),
  southAfrica: country('South Africa', '/content/locations/africa/south-africa/index.html', '/content/locations/africa/south-africa/img/flag.svg', 'africa', 'south-africa'),
  spain: country('Spain', '/content/locations/europe/spain/index.html', '/content/locations/europe/spain/img/flag.svg', 'europe', 'spain'),
  bahamas: country('Bahamas', '/content/locations/north-america/bahamas/index.html', '/content/locations/north-america/bahamas/img/flag.svg', 'north-america', 'bahamas')
};

const tours = {
  pga: {
    slug: 'pga',
    name: 'PGA Tour',
    label: 'FedExCup',
    description: 'The main men\'s weekly tour, built around regular events, signature events, major weeks and the FedExCup finish.',
    sourceLabel: 'PGA TOUR schedule',
    sourceUrl: 'https://www.pgatour.com/schedule',
    countLabel: '45 official events'
  },
  lpga: {
    slug: 'lpga',
    name: 'LPGA Tour',
    label: 'Race to CME Globe',
    description: 'The leading women\'s professional tour, with official events across North America, Asia and Europe.',
    sourceLabel: 'LPGA tournaments schedule',
    sourceUrl: 'https://www.lpga.com/tournaments',
    countLabel: '31 official events'
  },
  liv: {
    slug: 'liv',
    name: 'LIV Golf',
    label: 'League schedule',
    description: 'A global team-and-individual league playing 72-hole events in 2026, ending with a team championship.',
    sourceLabel: 'LIV Golf schedule',
    sourceUrl: 'https://www.livgolf.com/schedule',
    countLabel: '14 official events'
  }
};

const events = [
  pga('Sony Open in Hawaii', '2026-01-18', 'Hawaii', countries.usa),
  pga('The American Express', '2026-01-25', 'California', countries.usa),
  pga('Farmers Insurance Open', '2026-02-01', 'California', countries.usa),
  pga('WM Phoenix Open', '2026-02-08', 'Arizona', countries.usa),
  pga('AT&T Pebble Beach Pro-Am', '2026-02-15', 'California', countries.usa),
  pga('Genesis Invitational', '2026-02-22', 'California', countries.usa),
  pga('Cognizant Classic', '2026-03-01', 'Florida', countries.usa),
  pga('Arnold Palmer Invitational', '2026-03-08', 'Florida', countries.usa),
  pga('Puerto Rico Open', '2026-03-08', 'Puerto Rico', countries.usa),
  pga('The Players Championship', '2026-03-15', 'Florida', countries.usa),
  pga('Valspar Championship', '2026-03-22', 'Florida', countries.usa),
  pga('Texas Children\'s Houston Open', '2026-03-29', 'Texas', countries.usa, { slug: 'texas-childrens-houston-open' }),
  pga('Valero Texas Open', '2026-04-05', 'Texas', countries.usa),
  pga('Masters Tournament', '2026-04-12', 'Georgia', countries.usa, { slug: 'masters-tournament', major: true }),
  pga('RBC Heritage', '2026-04-19', 'South Carolina', countries.usa),
  pga('Zurich Classic of New Orleans', '2026-04-26', 'Louisiana', countries.usa),
  pga('Cadillac Championship', '2026-05-03', 'Florida', countries.usa),
  pga('Truist Championship', '2026-05-10', 'North Carolina', countries.usa),
  pga('ONEflight Myrtle Beach Classic', '2026-05-10', 'South Carolina', countries.usa),
  pga('PGA Championship', '2026-05-17', 'Pennsylvania', countries.usa, { slug: 'pga-championship', major: true }),
  pga('CJ Cup Byron Nelson', '2026-05-24', 'Texas', countries.usa),
  pga('Charles Schwab Challenge', '2026-05-31', 'Texas', countries.usa),
  pga('Memorial Tournament', '2026-06-07', 'Ohio', countries.usa),
  pga('RBC Canadian Open', '2026-06-14', 'Canada', countries.canada),
  pga('U.S. Open Golf', '2026-06-21', 'New York', countries.usa, { slug: 'us-open-golf', major: true }),
  pga('Travelers Championship', '2026-06-28', 'Connecticut', countries.usa),
  pga('John Deere Classic', '2026-07-05', 'Illinois', countries.usa),
  pga('Genesis Scottish Open', '2026-07-12', 'Scotland', countries.unitedKingdom),
  pga('ISCO Championship', '2026-07-12', 'Kentucky', countries.usa),
  pga('The Open Championship', '2026-07-19', 'England', countries.unitedKingdom, { slug: 'the-open-championship', major: true }),
  pga('Corales Puntacana Championship', '2026-07-19', 'Dominican Republic', countries.dominicanRepublic),
  pga('3M Open', '2026-07-26', 'Minnesota', countries.usa),
  pga('Rocket Classic', '2026-08-02', 'Michigan', countries.usa),
  pga('Wyndham Championship', '2026-08-09', 'North Carolina', countries.usa),
  pga('FedEx St. Jude Championship', '2026-08-16', 'Tennessee', countries.usa),
  pga('BMW Championship', '2026-08-23', 'Missouri', countries.usa),
  pga('Tour Championship', '2026-08-30', 'Georgia', countries.usa),
  pga('Biltmore Championship', '2026-09-20', 'North Carolina', countries.usa),
  pga('Bank of Utah Championship', '2026-10-04', 'Utah', countries.usa),
  pga('Baycurrent Classic', '2026-10-11', 'Japan', countries.japan),
  pga('Butterfield Bermuda Championship', '2026-10-25', 'Bermuda', countries.unitedKingdom),
  pga('VidantaWorld Mexico Open', '2026-11-01', 'Mexico', countries.mexico),
  pga('World Wide Technology Championship', '2026-11-08', 'Mexico', countries.mexico),
  pga('Good Good Championship', '2026-11-15', 'Texas', countries.usa),
  pga('RSM Classic', '2026-11-22', 'Georgia', countries.usa),

  lpga('Hilton Grand Vacations Tournament of Champions', '2026-02-01', 'Florida', countries.usa),
  lpga('Honda LPGA Thailand', '2026-02-22', 'Thailand', countries.thailand),
  lpga('HSBC Women\'s World Championship', '2026-03-01', 'Singapore', countries.singapore, { slug: 'hsbc-womens-world-championship' }),
  lpga('Blue Bay LPGA', '2026-03-08', 'China', countries.china),
  lpga('Fortinet Founders Cup', '2026-03-22', 'California', countries.usa),
  lpga('Ford Championship', '2026-03-29', 'Arizona', countries.usa),
  lpga('Aramco Championship', '2026-04-05', 'Nevada', countries.usa),
  lpga('JM Eagle LA Championship', '2026-04-19', 'California', countries.usa),
  lpga('Chevron Championship', '2026-04-26', 'Texas', countries.usa, { major: true }),
  lpga('Riviera Maya Open', '2026-05-03', 'Mexico', countries.mexico),
  lpga('Mizuho Americas Open', '2026-05-10', 'New Jersey', countries.usa),
  lpga('Kroger Queen City Championship', '2026-05-17', 'Ohio', countries.usa),
  lpga('ShopRite LPGA Classic', '2026-05-31', 'New Jersey', countries.usa),
  lpga('U.S. Women\'s Open', '2026-06-07', 'California', countries.usa, { slug: 'us-womens-open-golf', major: true }),
  lpga('Meijer LPGA Classic', '2026-06-15', 'Michigan', countries.usa),
  lpga('Dow Championship', '2026-06-21', 'Michigan', countries.usa),
  lpga('KPMG Women\'s PGA Championship', '2026-06-28', 'Minnesota', countries.usa, { slug: 'kpmg-womens-pga-championship', major: true }),
  lpga('Amundi Evian Championship', '2026-07-12', 'France', countries.france, { major: true }),
  lpga('ISPS Handa Women\'s Scottish Open', '2026-07-26', 'Scotland', countries.unitedKingdom, { slug: 'isps-handa-womens-scottish-open' }),
  lpga('AIG Women\'s Open', '2026-08-02', 'England', countries.unitedKingdom, { slug: 'aig-womens-open', major: true }),
  lpga('Portland Classic', '2026-08-16', 'Oregon', countries.usa),
  lpga('CPKC Women\'s Open', '2026-08-23', 'Canada', countries.canada, { slug: 'cpkc-womens-open' }),
  lpga('FM Championship', '2026-08-30', 'Massachusetts', countries.usa),
  lpga('Walmart NW Arkansas Championship', '2026-09-27', 'Arkansas', countries.usa),
  lpga('Lotte Championship', '2026-10-04', 'Hawaii', countries.usa),
  lpga('Buick LPGA Shanghai', '2026-10-18', 'China', countries.china),
  lpga('BMW Ladies Championship', '2026-10-25', 'South Korea', countries.southKorea),
  lpga('Maybank Championship', '2026-11-01', 'Malaysia', countries.malaysia),
  lpga('Toto Japan Classic', '2026-11-08', 'Japan', countries.japan),
  lpga('The Annika', '2026-11-15', 'Florida', countries.usa),
  lpga('CME Group Tour Championship', '2026-11-22', 'Florida', countries.usa),

  liv('LIV Golf Riyadh', '2026-02-07', 'Riyadh', countries.saudiArabia),
  liv('LIV Golf Adelaide', '2026-02-15', 'Adelaide', countries.australia),
  liv('LIV Golf Hong Kong', '2026-03-08', 'Hong Kong', countries.china),
  liv('LIV Golf Singapore', '2026-03-15', 'Singapore', countries.singapore),
  liv('LIV Golf South Africa', '2026-03-22', 'South Africa', countries.southAfrica),
  liv('LIV Golf Mexico City', '2026-04-19', 'Mexico City', countries.mexico),
  liv('LIV Golf Virginia', '2026-05-10', 'Virginia', countries.usa),
  liv('LIV Golf Korea', '2026-05-31', 'Busan', countries.southKorea),
  liv('LIV Golf Andalucia', '2026-06-07', 'Andalucia', countries.spain),
  liv('LIV Golf Louisiana', '2026-06-28', 'Louisiana', countries.usa),
  liv('LIV Golf UK', '2026-07-26', 'England', countries.unitedKingdom),
  liv('LIV Golf New York', '2026-08-09', 'New York', countries.usa),
  liv('LIV Golf Indianapolis', '2026-08-23', 'Indiana', countries.usa),
  liv('LIV Team Championship Michigan', '2026-08-30', 'Michigan', countries.usa)
];

function country(name, url, flag, continent, slug) {
  return { name, url, flag, continent, slug };
}

function pga(name, endDate, area, host, extra = {}) {
  return event('pga', name, endDate, area, host, extra);
}

function lpga(name, endDate, area, host, extra = {}) {
  return event('lpga', name, endDate, area, host, extra);
}

function liv(name, endDate, area, host, extra = {}) {
  return event('liv', name, endDate, area, host, extra);
}

function event(tour, name, endDate, area, host, extra) {
  const slug = extra.slug || slugify(name);
  return {
    tour,
    name,
    slug,
    endDate,
    area,
    host,
    major: !!extra.major,
    sourceLabel: tours[tour].sourceLabel,
    sourceUrl: tours[tour].sourceUrl
  };
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function html(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function countryChip(host) {
  return `<a class="country" href="${host.url}"><img src="${host.flag}" alt="" width="20" height="14">${html(host.name)}</a>`;
}

function eventHref(item) {
  return `golf/events/${item.slug}.html`;
}

function eventAbsHref(item) {
  return `/content/categories/sport/golf/events/${item.slug}.html`;
}

function eventMiniAbs(item) {
  return `/content/categories/sport/golf/events/img/${item.slug}-mini.png`;
}

function eventHeroAbs(item) {
  return `/content/categories/sport/golf/events/img/${item.slug}-hero.png`;
}

function endDateObj(item) {
  return new Date(`${item.endDate}T12:00:00Z`);
}

function statusLabel(item) {
  const end = endDateObj(item);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 3);
  if (today > end) return 'Completed';
  if (today >= start) return 'Live week';
  return 'Upcoming';
}

function displayDate(item) {
  const date = endDateObj(item);
  return `Ends ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}`;
}

function fullDate(item) {
  const date = endDateObj(item);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function areaMarkup(item) {
  if (item.area === item.host.name) return countryChip(item.host);
  return html(item.area);
}

function metaLocation(item) {
  return item.area === item.host.name ? item.host.name : `${item.area}, ${item.host.name}`;
}

function navHtml() {
  return `<nav class="event-nav" aria-label="Site navigation">
      <a class="nav-icon" href="/content/events/index.html" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></a>
      <a class="nav-icon" href="/content/locations/index.html" aria-label="Locations"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></a>
      <a class="nav-icon" href="/content/categories/index.html" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg></a>
      <span class="nav-spacer"></span>
      <details class="nav-language"><summary aria-label="Language">EN</summary><div class="nav-language__list"><a href="#" aria-current="page">English</a></div></details>
    </nav>`;
}

function eventPage(item) {
  const tour = tours[item.tour];
  const country = countryChip(item.host);
  const title = `${item.name} | OneSliders`;
  const description = `${item.name} on the 2026 ${tour.name} schedule, linked to ${item.host.name}.`;
  const status = statusLabel(item);
  const area = areaMarkup(item);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="index,follow">
  <meta name="description" content="${html(description)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${html(title)}">
  <meta property="og:description" content="${html(description)}">
  <meta property="og:url" content="https://one-sliders.com/content/categories/sport/golf/events/${item.slug}.html">
  <meta property="og:image" content="https://one-sliders.com/content/categories/sport/golf/events/img/${item.slug}-hero.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="https://one-sliders.com/content/categories/sport/golf/events/${item.slug}.html">
  <link rel="stylesheet" href="/assets/css/events.css">
  <script defer src="/assets/js/events.js"></script>
  <title>${html(title)}</title>
</head>
<body class="event-page">
  ${navHtml()}
  <main class="event-carousel" data-carousel>
    <div class="event-carousel__track" data-carousel-track>
      <section class="event-slide event-slide--hero" id="general" data-slide="general">
        <img class="event-hero__image" src="${eventHeroAbs(item)}" alt="" width="1200" height="630" fetchpriority="high">
        <div class="event-slide__content">
          <p class="event-kicker">${html(tour.name)} 2026</p>
          <h1 class="event-title">${html(item.name)}</h1>
          <p class="event-lede">${html(item.name)} is listed on the 2026 ${tour.name} calendar. The host country is ${country}, with the schedule location listed as ${area}.</p>
          <div class="facts-strip">
            <div class="fact"><span>Tour</span><strong>${html(tour.name)}</strong></div>
            <div class="fact"><span>Schedule date</span><strong>${html(displayDate(item))}</strong></div>
            <div class="fact"><span>Host country</span><strong>${country}</strong></div>
            <div class="fact"><span>Status</span><strong>${html(status)}</strong></div>
          </div>
          <div class="card-grid card-grid--support">
            <article class="card"><span>What it is</span><strong>${html(tour.label)}</strong><p>${html(tour.description)}</p></article>
            <article class="card"><span>Format note</span><strong>Professional stroke play</strong><p>PGA and LPGA events are standard tour stops; LIV events also count toward team standings.</p></article>
            <article class="card"><span>Host link</span><strong>${country}</strong><p>The country link points to the matching OneSliders location page.</p></article>
            <article class="card"><span>Golf topic</span><strong><a href="/content/categories/sport/golf.html">Back to Golf</a></strong><p>See PGA, LPGA and LIV grouped together on the main golf page.</p></article>
          </div>
        </div>
      </section>
      <section class="event-slide" id="year" data-slide="year">
        <img class="event-hero__image" src="${eventHeroAbs(item)}" alt="" width="1200" height="630" loading="lazy">
        <div class="event-slide__content">
          <h2 class="event-section-title">${html(item.name)} 2026</h2>
          <div class="year-edition">
            <div class="facts-strip facts-strip--edition">
              <div class="fact"><span>Country</span><strong>${country}</strong></div>
              <div class="fact"><span>Listed location</span><strong>${area}</strong></div>
              <div class="fact"><span>Tour</span><strong>${html(tour.name)}</strong></div>
              <div class="fact"><span>Date</span><strong>${html(fullDate(item))}</strong></div>
              <div class="fact"><span>Status</span><strong>${html(status)}</strong></div>
              <div class="fact"><span>Schedule count</span><strong>${html(tour.countLabel)}</strong></div>
            </div>
            <div class="question-grid">
              <article class="question"><span>When is the event?</span><strong>${html(fullDate(item))}</strong><p>The tour schedule lists this as the event date, normally the final day of the tournament week.</p></article>
              <article class="question"><span>Where is it held?</span><strong>${area}</strong><p>Host country: ${country}.</p></article>
              <article class="question"><span>Can I follow it?</span><strong>Use official tour channels</strong><p>Broadcast and streaming windows vary by market and are normally confirmed close to tournament week.</p></article>
              <article class="question"><span>What changed?</span><strong>2026 calendar item</strong><p>This page exists so the tour stop can be linked from Golf, country pages and other event pages without using the old EN path.</p></article>
            </div>
            <div class="sources"><span>Sources and update</span><p><a href="${html(item.sourceUrl)}">${html(item.sourceLabel)}</a>. Last updated: ${lastUpdated}.</p></div>
          </div>
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

function leagueList(tourSlug) {
  return events
    .filter((item) => item.tour === tourSlug)
    .map((item) => {
      const area = item.area === item.host.name ? '' : `<span>${html(item.area)}</span>`;
      return `<li><strong><a href="${eventHref(item)}">${html(item.name)}</a></strong><span class="league-event-meta">${html(displayDate(item))}${area ? ' · ' + area : ''} · ${countryChip(item.host)}</span></li>`;
    })
    .join('\n                    ');
}

function nextEventCards() {
  return events
    .filter((item) => endDateObj(item) >= today)
    .sort((a, b) => endDateObj(a) - endDateObj(b))
    .slice(0, 12)
    .map((item) => `<a class="event-card" data-end="${item.endDate}" href="${eventHref(item)}"><img class="event-thumb" src="golf/events/img/${item.slug}-mini.png" alt="" aria-hidden="true"><time>${html(displayDate(item))}</time><strong>${html(item.name)}</strong><p>${html(tours[item.tour].name)} · ${html(metaLocation(item))}</p></a>`)
    .join('\n                ');
}

function ensureGolfPageStyles(source) {
  if (source.includes('.league-events--calendar')) return source;
  const needle = '      .league-events li { padding: 7px 8px; border-radius: 8px; background: rgba(36,95,70,.08); color: var(--muted); font-size: 13px; line-height: 1.22; }\n      .league-events strong { display: block; color: var(--ink); font-size: 13px; }\n';
  const insert = `${needle}      .league-events--calendar { max-height: 250px; overflow: auto; padding-right: 3px; }\n      .league-events--calendar li { display: grid; gap: 4px; }\n      .league-events--calendar strong a { color: var(--ink); text-decoration: none; }\n      .league-events--calendar strong a:hover { color: var(--theme); }\n      .league-event-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; color: var(--muted); font-size: 12px; font-weight: 700; line-height: 1.25; }\n      .league-event-meta .country { min-height: 22px; padding: 0 7px; font-size: 12px; }\n      .league-event-meta .country img { width: 19px; height: 13px; }\n`;
  return source.replace(needle, insert);
}

function updateGolfPage() {
  const file = path.join(root, 'content/categories/sport/golf.html');
  let source = fs.readFileSync(file, 'utf8');
  source = ensureGolfPageStyles(source);

  const linkReplacements = new Map([
    ['../../../en/content/categories/sport/golf/events/masters-tournament.html', 'golf/events/masters-tournament.html'],
    ['../../../en/content/categories/sport/golf/events/pga-championship.html', 'golf/events/pga-championship.html'],
    ['../../../en/content/categories/sport/golf/events/us-open-golf.html', 'golf/events/us-open-golf.html'],
    ['../../../en/content/categories/sport/golf/events/the-open-championship.html', 'golf/events/the-open-championship.html']
  ]);
  for (const [from, to] of linkReplacements) source = source.replaceAll(from, to);
  source = source
    .replace('<li><span>Chevron Championship</span></li>', '<li><a href="golf/events/chevron-championship.html">Chevron Championship</a></li>')
    .replace('<li><span>U.S. Women\'s Open</span></li>', '<li><a href="golf/events/us-womens-open-golf.html">U.S. Women\'s Open</a></li>')
    .replace('<li><span>KPMG Women\'s PGA Championship</span></li>', '<li><a href="golf/events/kpmg-womens-pga-championship.html">KPMG Women\'s PGA Championship</a></li>')
    .replace('<li><span>Amundi Evian Championship</span></li>', '<li><a href="golf/events/amundi-evian-championship.html">Amundi Evian Championship</a></li>')
    .replace('<li><span>AIG Women\'s Open</span></li>', '<li><a href="golf/events/aig-womens-open.html">AIG Women\'s Open</a></li>');

  for (const key of Object.keys(tours)) {
    const start = source.indexOf(`id="league-${key}"`);
    if (start === -1) continue;
    const articleEnd = source.indexOf('</article>', start);
    const before = source.slice(0, start);
    let section = source.slice(start, articleEnd);
    const after = source.slice(articleEnd);
    section = section.replace(/<h3>Events<\/h3>\s*<ul class="league-events">[\s\S]*?<\/ul>/, `<h3>2026 schedule</h3>\n                  <ul class="league-events league-events--calendar">\n                    ${leagueList(key)}\n                  </ul>`);
    source = before + section + after;
  }

  source = source.replace(
    /<p class="ranking-source">Updated 30 May 2026[\s\S]*?<\/p>/,
    `<p class="ranking-source">Updated ${lastUpdated}. Schedule links cover PGA Tour (${tours.pga.countLabel}), LPGA Tour (${tours.lpga.countLabel}) and LIV Golf (${tours.liv.countLabel}).</p>`
  );

  source = source.replace(
    /<h2>Upcoming majors<\/h2>[\s\S]*?<div class="event-grid carousel-track" data-carousel-track>[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/,
    `<h2>Next golf events</h2>
              <div class="carousel-controls" data-carousel-controls aria-label="Upcoming events carousel controls">
                <button class="carousel-button" type="button" data-carousel-prev aria-label="Previous events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
                <button class="carousel-button" type="button" data-carousel-next aria-label="Next events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>
              </div>
            </div>
            <div class="carousel">
              <div class="event-grid carousel-track" data-carousel-track>
                ${nextEventCards()}
              </div>
            </div>
          </section>`
  );

  fs.writeFileSync(file, source);
}

function countryCard(item) {
  const start = new Date(`${item.endDate}T12:00:00Z`);
  start.setUTCDate(start.getUTCDate() - 3);
  const startIso = start.toISOString().slice(0, 10);
  const area = item.area === item.host.name ? tours[item.tour].name : `${item.area} · ${tours[item.tour].name}`;
  return `<a class="visual-topic-card visual-topic-card--national" data-end="${item.endDate}" href="${eventAbsHref(item)}"><img src="${eventMiniAbs(item)}" alt="" loading="lazy"><strong>${html(item.name)}</strong><span>${html(startIso)} - ${html(item.endDate)} · ${html(area)}</span></a>`;
}

function insertCountryEvents(file, countryEvents) {
  let source = fs.readFileSync(file, 'utf8');
  const openTag = '<div class="country-paths country-paths--events" data-expiring-events>';
  const start = source.indexOf(openTag);
  if (start === -1) return false;
  const contentStart = start + openTag.length;
  const contentEnd = source.indexOf('</div>', contentStart);
  if (contentEnd === -1) return false;
  let inner = source.slice(contentStart, contentEnd);
  inner = inner.replace(/<!-- golf-tour-events:start -->[\s\S]*?<!-- golf-tour-events:end -->/g, '');
  inner = inner.replace(/<a class="visual-topic-card[^>]*href="[^"]*(?:\/en\/content\/categories\/sport\/golf\/events\/|\/content\/categories\/sport\/golf\/events\/)[\s\S]*?<\/a>/g, '');
  const block = `<!-- golf-tour-events:start -->${countryEvents.map(countryCard).join('')}<!-- golf-tour-events:end -->`;
  source = source.slice(0, contentStart) + block + inner + source.slice(contentEnd);
  fs.writeFileSync(file, source);
  return true;
}

function updateCountryPages() {
  const byCountry = new Map();
  for (const item of events) {
    if (!byCountry.has(item.host.slug)) byCountry.set(item.host.slug, []);
    byCountry.get(item.host.slug).push(item);
  }

  for (const [slug, items] of byCountry) {
    const host = items[0].host;
    const file = path.join(root, `content/locations/${host.continent}/${host.slug}/index.html`);
    if (!fs.existsSync(file)) continue;
    const sorted = items.sort((a, b) => endDateObj(a) - endDateObj(b));
    insertCountryEvents(file, sorted);
  }
}

function updateEventsIndexLinks() {
  const file = path.join(root, 'content/events/index.html');
  if (!fs.existsSync(file)) return;
  let source = fs.readFileSync(file, 'utf8');
  source = source
    .replaceAll('../../en/content/categories/sport/golf/events/', '../categories/sport/golf/events/')
    .replaceAll('/en/content/categories/sport/golf/events/', '/content/categories/sport/golf/events/')
    .replaceAll('../../en/content/categories/sport/golf/events/img/', '../categories/sport/golf/events/img/')
    .replaceAll('/en/content/categories/sport/golf/events/img/', '/content/categories/sport/golf/events/img/');
  fs.writeFileSync(file, source);
}

function updateSitemap() {
  const file = path.join(root, 'sitemap.xml');
  if (!fs.existsSync(file)) return;
  let source = fs.readFileSync(file, 'utf8');
  source = source.replace(/  <!-- golf-tour-events:start -->[\s\S]*?  <!-- golf-tour-events:end -->\r?\n?/g, '');
  const block = [
    '  <!-- golf-tour-events:start -->',
    ...events.map((item) => `  <url>\n    <loc>https://one-sliders.com/content/categories/sport/golf/events/${item.slug}.html</loc>\n    <lastmod>2026-05-30</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>`),
    '  <!-- golf-tour-events:end -->'
  ].join('\n');
  source = source.replace('</urlset>', `${block}\n</urlset>`);
  fs.writeFileSync(file, source);
}

function writeEventPages() {
  fs.mkdirSync(eventImgDir, { recursive: true });
  for (const item of events) {
    fs.writeFileSync(path.join(eventDir, `${item.slug}.html`), eventPage(item));
  }
}

writeEventPages();
updateGolfPage();
updateCountryPages();
updateEventsIndexLinks();
updateSitemap();

console.log(`Generated ${events.length} golf tour event pages and linked them from golf/country pages.`);
