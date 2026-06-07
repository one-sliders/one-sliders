import fs from 'node:fs/promises';
import path from 'node:path';

const dir = path.resolve('content/events/2026/05');
const baseUrl = 'https://one-sliders.com/content/events/2026/05/';

const languageMap = {
  Africa: [['en', 'English'], ['ar', 'Arabic'], ['sw', 'Swahili'], ['ha', 'Hausa']],
  Asia: [['en', 'English'], ['zh', 'Mandarin Chinese'], ['hi', 'Hindi'], ['ar', 'Arabic']],
  Europe: [['en', 'English'], ['ru', 'Russian'], ['de', 'German'], ['fr', 'French']],
  'North America': [['en', 'English'], ['es', 'Spanish'], ['fr', 'French'], ['zh', 'Mandarin Chinese']],
  Oceania: [['en', 'English'], ['fr', 'French'], ['tpi', 'Tok Pisin'], ['mi', 'Maori']]
};

const countries = {
  Austria: ['Europe', '../../../locations/europe/austria/index.html', '../../../locations/europe/austria/vienna.html', '../../../locations/europe/austria/img/flag.svg'],
  Canada: ['North America', '../../../locations/north-america/canada/index.html', '../../../locations/north-america/canada/montreal.html', '../../../locations/north-america/canada/img/flag.svg'],
  France: ['Europe', '../../../locations/europe/france/index.html', '../../../locations/europe/france/paris.html', '../../../locations/europe/france/img/flag.svg'],
  Hungary: ['Europe', '../../../locations/europe/hungary/index.html', '../../../locations/europe/hungary/budapest.html', '../../../locations/europe/hungary/img/flag.svg'],
  Morocco: ['Africa', '../../../locations/africa/morocco/index.html', '../../../locations/africa/morocco/fes.html', '../../../locations/africa/morocco/img/flag.svg'],
  'Saudi Arabia': ['Asia', '../../../locations/asia/saudi-arabia/index.html', '../../../locations/asia/saudi-arabia/mecca.html', '../../../locations/asia/saudi-arabia/img/flag.svg'],
  Australia: ['Oceania', '../../../locations/oceania/australia/index.html', '../../../locations/oceania/australia/sydney.html', '../../../locations/oceania/australia/img/flag.svg'],
  USA: ['North America', '../../../locations/north-america/usa/index.html', '', '../../../locations/north-america/usa/img/flag.svg'],
  Norway: ['Europe', '../../../locations/europe/norway/index.html', '../../../locations/europe/norway/oslo.html', '../../../locations/europe/norway/img/flag.svg'],
  India: ['Asia', '../../../locations/asia/india/index.html', '', '../../../locations/asia/india/img/flag.svg']
};

const navIcons = `    <a class="nav-icon" href="../../index.html" title="Events" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a>
    <a class="nav-icon" href="../../../locations/index.html" title="World" aria-label="World"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>
    <a class="nav-icon" href="../../../categories/index.html" title="Categories" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a>`;

const eventData = [
  ['canada-grand-prix', 'Canada Grand Prix 2026', 'Canada', 'Montreal', 'Circuit Gilles Villeneuve', '22&ndash;24 May 2026', '2026-05-22', '2026-05-24', 'img/canada-grand-prix-hero.png', 'Formula 1', '../../../categories/sport/formula-1.html', 'Formula 1 returns to Montreal for a sprint-format Canadian Grand Prix weekend on the island circuit in Parc Jean-Drapeau.', 'McLaren Canadian GP schedule', 'https://www.mclaren.com/racing/formula-1/2026/canadian-grand-prix/'],
  ['champions-league-final', 'Champions League Final 2026', 'Hungary', 'Budapest', 'Puskas Arena', '30 May 2026', '2026-05-30', '2026-05-30', 'img/champions-league-final-hero.png', 'Football', '../../../categories/sport/football.html', 'European club football closes its season in Budapest, with the Champions League trophy decided in one match at Puskas Arena.', 'UEFA kick-off notes', 'https://www.uefa.com/uefachampionsleague/news/02a5-2092f53360cc-8ee51562d99f-1000--when-does-the-champions-league-final-start-where-you-are-w/'],
  ['eurovision-semi-final-1', 'Eurovision Semi-Final 1 2026', 'Austria', 'Vienna', 'Wiener Stadthalle', '12 May 2026', '2026-05-12', '2026-05-12', 'img/eurovision-semi-final-1-hero.png', 'Song contests', '../../../categories/music/song-contests.html', 'The first Eurovision live show in Vienna opens the qualification path to the Grand Final.', 'Eurovision Vienna 2026', 'https://www.eurovision.com/eurovision-song-contest/vienna-2026'],
  ['eurovision-semi-final-2', 'Eurovision Semi-Final 2 2026', 'Austria', 'Vienna', 'Wiener Stadthalle', '14 May 2026', '2026-05-14', '2026-05-14', 'img/eurovision-song-contest-hero.png', 'Song contests', '../../../categories/music/song-contests.html', 'The second Eurovision semi-final completes the Grand Final line-up in Vienna.', 'Eurovision Vienna 2026', 'https://www.eurovision.com/eurovision-song-contest/vienna-2026'],
  ['eurovision-grand-final', 'Eurovision Grand Final 2026', 'Austria', 'Vienna', 'Wiener Stadthalle', '16 May 2026', '2026-05-16', '2026-05-16', 'img/eurovision-song-contest-hero.png', 'Song contests', '../../../categories/music/song-contests.html', 'Eurovision final night brings direct finalists and semi-final qualifiers together for the winner reveal.', 'Eurovision Vienna 2026', 'https://www.eurovision.com/eurovision-song-contest/vienna-2026'],
  ['fes-festival-of-world-sacred-music', 'Fes Festival of World Sacred Music 2026', 'Morocco', 'Fes', 'Fes festival venues', '4&ndash;7 June 2026', '2026-06-04', '2026-06-07', 'img/fes-festival-of-world-sacred-music-hero.png', 'World music', '../../../categories/music/world-music.html', 'Fes hosts a sacred music festival built around heritage, craft and cross-cultural performance in historic venues.', 'Festival de Fes 2026', 'https://www.fesfestival.com/2026/'],
  ['hajj-2026', 'Hajj 2026', 'Saudi Arabia', 'Mecca', 'Holy sites in and around Mecca', '25&ndash;30 May 2026', '2026-05-25', '2026-05-30', 'img/hajj-2026-hero.png', 'Culture', '../../../categories/culture/index.html', 'Hajj is the annual Islamic pilgrimage to Mecca, with rites across Mina, Arafat, Muzdalifah and the Grand Mosque area.', 'Saudi Hajj information', 'https://www.haj.gov.sa/'],
  ['vivid-sydney', 'Vivid Sydney 2026', 'Australia', 'Sydney', 'Sydney Harbour and city venues', '22 May&ndash;13 June 2026', '2026-05-22', '2026-06-13', 'img/vivid-sydney-hero.png', 'Music festivals', '../../../categories/music/music-festivals.html', 'Sydney becomes a city-wide canvas for light, music, ideas and food across harbour landmarks and cultural venues.', 'Vivid Sydney official information', 'https://www.vividsydney.com/info/about-vivid-sydney'],
  ['state-of-origin', 'State of Origin 2026', 'Australia', 'Sydney / Melbourne / Brisbane', 'Accor Stadium, MCG and Suncorp Stadium', '27 May&ndash;8 July 2026', '2026-05-27', '2026-07-08', 'img/state-of-origin-hero.png', 'Rugby', '../../../categories/sport/rugby.html', 'New South Wales and Queensland renew rugby league greatest state rivalry across a three-match series.', 'NRL 2026 Origin schedule', 'https://www.nrl.com/news/2025/11/12/2026-ampol-state-of-origin/'],
  ['roland-garros-2026', 'Roland-Garros 2026', 'France', 'Paris', 'Stade Roland-Garros', '18 May&ndash;7 June 2026', '2026-05-18', '2026-06-07', 'img/roland-garros-2026-hero.svg', 'Tennis', '../../../categories/sport/tennis.html', 'The clay-court Grand Slam returns to Paris, bringing singles, doubles and wheelchair events to Stade Roland-Garros.', 'Roland-Garros official site', 'https://www.rolandgarros.com/en-us/'],
  ['pga-championship-follow-up', 'PGA Championship Follow-up 2026', 'USA', 'Newtown Square', 'Aronimink Golf Club', '14&ndash;17 May 2026', '2026-05-14', '2026-05-17', 'img/pga-championship-hero.png', 'Golf', '../../../categories/sport/golf.html', 'A compact follow-up page for PGA Championship leaderboard, round tracking and key storylines at Aronimink.', 'PGA Championship field list', 'https://www.pgachampionship.com/news-media/articles/field-list-announced-for-2026-pga-championship-at-aronimink-golf-club'],
  ['norwegian-constitution-day', 'Norwegian Constitution Day 2026', 'Norway', 'Oslo', 'Oslo city centre', '17 May 2026', '2026-05-17', '2026-05-17', 'img/norwegian-constitution-day-hero.png', 'Culture', '../../../categories/culture/index.html', 'Oslo celebrates Norway Constitution Day with children parade, flags, music and city-centre ceremonies.', 'City of Oslo 17 May programme', 'https://www.oslo.kommune.no/english/17th-of-may/'],
  ['ipl-final-2026', 'IPL Final 2026', 'India', 'Ahmedabad', 'Narendra Modi Stadium', '31 May 2026', '2026-05-31', '2026-05-31', 'img/ipl-final-2026-hero.svg', 'Cricket', '../../../categories/sport/cricket.html', 'The Indian Premier League season is set to finish with the T20 final in Ahmedabad.', 'IPL 2026 final host report', 'https://timesofindia.indiatimes.com/sports/cricket/ipl/ipl-2026/icc-meeting-bigger-capacity-why-ahmedabad-landed-ipl-2026-final-over-bengaluru/articleshow/130955368.cms'],
  ['indianapolis-500', 'Indianapolis 500 2026', 'USA', 'Indianapolis', 'Indianapolis Motor Speedway', '24 May 2026', '2026-05-24', '2026-05-24', 'img/indianapolis-500-hero.svg', 'Motorsport', '../../../categories/sport/motorsport.html', 'The 110th Indianapolis 500 brings IndyCar biggest race to Indianapolis Motor Speedway on Memorial Day weekend.', 'Indianapolis 500 official site', 'https://www.indianapolismotorspeedway.com/events/indy500']
];

function esc(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function languageHead(event) {
  return `  <meta name="language-region" content="${esc(event.continent)}">`;
}

function languageList(event) {
  return '';
}

function graph(items) {
  return `<div class="event-rank-bars event-link-grid--after-text">${items.map((item, index) => `<div class="event-rank-bar"><span class="event-rank-bar__rank">${index + 1}</span><span class="event-rank-bar__country">${esc(item[0])}</span><div class="event-rank-bar__track"><i class="event-rank-bar__fill" style="--value:${item[1]}%"></i></div><strong class="event-rank-bar__value">${esc(item[2])}</strong></div>`).join('')}</div>`;
}

function table(rows) {
  return `<table class="event-table"><thead><tr><th>Part</th><th>Focus</th><th>Visitor use</th></tr></thead><tbody>${rows.map((row) => `<tr><th>${esc(row[0])}</th><td>${esc(row[1])}</td><td>${esc(row[2])}</td></tr>`).join('')}</tbody></table>`;
}

function jsonLd(event) {
  const languages = (languageMap[event.continent] || languageMap.Europe).map(([code]) => code);
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: event.ogImage,
    description: event.description,
    inLanguage: languages,
    location: {
      '@type': 'Place',
      name: event.venue,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.city,
        addressCountry: event.country
      }
    }
  }, null, 2);
}

function html(event) {
  const countryLink = event.countryPath ? `<a href="${event.countryPath}"><img src="${event.flag}" alt="" width="28" height="19">${esc(event.country)}</a>` : `<strong>${esc(event.country)}</strong>`;
  const cityLink = event.cityPath ? `<a href="${event.cityPath}">${esc(event.city)}</a>` : `<strong>${esc(event.city)}</strong>`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="../../../../assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="../../../../assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../../../../assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="../../../../assets/icons/site.webmanifest">
  <link rel="stylesheet" href="../../../../assets/css/event-detail.css">
  <link rel="preload" as="image" href="${event.image}">
  <link rel="canonical" href="${event.canonical}">
${languageHead(event)}
  <meta name="theme-color" content="#214e68">
  <meta name="description" content="${esc(event.description)}">
  <meta name="keywords" content="${esc(event.title.toLowerCase())}, ${esc(event.city.toLowerCase())}, ${esc(event.category.toLowerCase())}">
  <meta property="og:title" content="${esc(event.title)} | OneSliders">
  <meta property="og:description" content="${esc(event.description)}">
  <meta property="og:image" content="${event.ogImage}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${event.canonical}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(event.title)} | OneSliders">
  <meta name="twitter:description" content="${esc(event.description)}">
  <meta name="twitter:image" content="${event.ogImage}">
  <title>${esc(event.title)} | OneSliders</title>
  <script type="application/ld+json">${jsonLd(event)}</script>
</head>
<body class="event-page" style="--event-theme:#214e68;--event-theme-2:#1f7888;--event-accent:#8ab7c4">
  <nav class="top-menu" aria-label="Event navigation">
${navIcons}
    <span class="nav-divider"></span>
    <a class="nav-pill" href="${event.categoryPath}">${esc(event.category)}</a>
  </nav>
  <main class="event-shell">
    <section class="event-hero" aria-labelledby="event-title">
      <img class="event-hero__image" src="${event.image}" alt="${esc(event.title)} hero image" width="1200" height="760" fetchpriority="high">
      <div class="event-hero__inner">
        <div>
          <div class="event-badge-row"><img class="event-flag" src="${event.flag}" alt="${esc(event.country)} flag" width="54" height="36"><p class="event-kicker">${esc(event.category)} &middot; 2026</p></div>
          <h1 class="event-title" id="event-title">${esc(event.title)}</h1>
          <p class="event-intro">${esc(event.intro)}</p>
        </div>
        <div class="event-hero__facts" aria-label="${esc(event.title)} key facts">
          <div class="event-hero__fact"><span>Country</span>${countryLink}</div>
          <div class="event-hero__fact"><span>City</span>${cityLink}</div>
          <div class="event-hero__fact"><span>Venue</span><strong>${esc(event.venue)}</strong></div>
          <div class="event-hero__fact"><span>Dates</span><strong>${event.dateLabel}</strong></div>
        </div>
      </div>
    </section>
    <nav class="event-actions" aria-label="Calendar actions"><a class="event-button event-button--primary" href="${event.slug}.ics">Add to calendar</a></nav>
    <div class="event-layout">
      <div class="event-main">
        <section class="event-section"><h2 class="event-section__title">What to know</h2><ul class="event-list"><li>${esc(event.intro)}</li><li>The event is useful to follow for programme details, visitor planning and result updates.</li><li>Country, city and topic context are available through OneSliders internal navigation.</li><li>Results, line-ups or programme details can be added when available.</li></ul></section>
        <section class="event-section"><h2 class="event-section__title">Event structure</h2>${table([['Before', 'Planning', 'Understand the format and timing.'], ['During', 'Programme', 'Follow the main event moments.'], ['After', 'Result or recap', 'Add winners, outcomes or next steps.']])}</section>
        <section class="event-section"><h2 class="event-section__title">Visitor intent</h2><p>A compact view of what this event page is most useful for.</p>${graph([['Dates', 100, 'Core'], ['Programme', 82, 'High'], ['Location', 76, 'High'], ['Follow-up', 62, 'Useful']])}</section>
      </div>
      <aside class="event-side" aria-label="${esc(event.title)} details">
        <section class="event-section"><h2 class="event-section__title">Quick facts</h2><div class="event-fact-grid"><div class="event-fact"><span>Status</span><strong>Upcoming</strong></div><div class="event-fact"><span>Format</span><strong>${esc(event.category)}</strong></div><div class="event-fact"><span>Follow-up</span><strong>Add when available</strong></div><div class="event-fact"><span>Category</span><strong><a href="${event.categoryPath}">${esc(event.category)}</a></strong></div></div></section>
        <section class="event-section"><h2 class="event-section__title">Useful links</h2><div class="event-link-grid"><a class="event-link-card event-link-card--media" href="${event.countryPath}"><img class="event-link-card__thumb" src="${event.flag}" alt="" width="46" height="46"><span><span>Country</span><strong>${esc(event.country)}</strong></span></a><a class="event-link-card event-link-card--media event-link-card--fallback" href="${event.categoryPath}"><span class="event-link-card__icon">${esc(event.category.slice(0, 2).toUpperCase())}</span><span><span>Category</span><strong>${esc(event.category)}</strong></span></a></div></section>
      </aside>
    </div>
    <div class="event-source"><span>Sources: <a href="${event.sourceUrl}" target="_blank" rel="noopener">${esc(event.sourceLabel)} external</a></span><span>Updated 13 May 2026</span></div>
  </main>
</body>
</html>
`;
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

for (const row of eventData) {
  const [slug, title, country, city, venue, dateLabel, startDate, endDate, image, category, categoryPath, intro, sourceLabel, sourceUrl] = row;
  const [continent, countryPath, defaultCityPath, flag] = countries[country];
  const cityPath = city.includes('/') || city === 'Indianapolis' || city === 'Ahmedabad' ? '' : defaultCityPath;
  const event = {
    slug, title, country, city, venue, dateLabel, startDate, endDate, image, category, categoryPath,
    intro, sourceLabel, sourceUrl, continent, countryPath, cityPath, flag,
    description: intro,
    canonical: `${baseUrl}${slug}.html`,
    ogImage: `${baseUrl}${image}`
  };
  const file = path.join(dir, `${slug}.html`);
  const backup = path.join(dir, `${slug}.before-event-detail.html`);
  if (await exists(file) && !(await exists(backup))) {
    await fs.copyFile(file, backup);
  }
  await fs.writeFile(file, html(event), 'utf8');
}

for (const event of [
  { slug: 'cannes-film-festival', continent: 'Europe' },
  { slug: 'eurovision-song-contest', continent: 'Europe' },
  { slug: 'pga-championship', continent: 'North America' }
]) {
  const file = path.join(dir, `${event.slug}.html`);
  let content = await fs.readFile(file, 'utf8');
  const canonical = content.match(/<link rel="canonical" href="([^"]+)">/)?.[1] || `${baseUrl}${event.slug}.html`;
  const data = { ...event, canonical };
  if (!content.includes('name="available-languages"')) {
    content = content.replace(/(<link rel="canonical" href="[^"]+">)/, `$1\n${languageHead(data)}`);
  }
  if (!content.includes('event-language-list')) {
    content = content.replace(/(<\/nav>)/, `    ${languageList(data)}\n  $1`);
  }
  await fs.writeFile(file, content, 'utf8');
}

console.log(`Standardized ${eventData.length} May pages and added language setup to 3 existing pages.`);
