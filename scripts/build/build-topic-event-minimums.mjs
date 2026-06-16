import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TODAY = '31 May 2026';
const MIN_PER_TOPIC = 10;

const countryMap = {
  australia: ['Australia', 'oceania', 'Sydney'],
  belgium: ['Belgium', 'europe', 'Brussels'],
  brazil: ['Brazil', 'south-america', 'Sao Paulo'],
  canada: ['Canada', 'north-america', 'Toronto'],
  china: ['China', 'asia', 'Shanghai'],
  france: ['France', 'europe', 'Paris'],
  germany: ['Germany', 'europe', 'Berlin'],
  india: ['India', 'asia', 'Mumbai'],
  italy: ['Italy', 'europe', 'Milan'],
  japan: ['Japan', 'asia', 'Tokyo'],
  mexico: ['Mexico', 'north-america', 'Mexico City'],
  netherlands: ['Netherlands', 'europe', 'Amsterdam'],
  qatar: ['Qatar', 'asia', 'Doha'],
  saudiArabia: ['Saudi Arabia', 'asia', 'Riyadh', 'saudi-arabia'],
  southAfrica: ['South Africa', 'africa', 'Cape Town', 'south-africa'],
  southKorea: ['South Korea', 'asia', 'Seoul', 'south-korea'],
  spain: ['Spain', 'europe', 'Barcelona'],
  switzerland: ['Switzerland', 'europe', 'Basel'],
  uk: ['United Kingdom', 'europe', 'London', 'united-kingdom'],
  usa: ['United States', 'north-america', 'Los Angeles', 'usa'],
  uae: ['United Arab Emirates', 'asia', 'Dubai', 'united-arab-emirates']
};

function country(key) {
  const [name, continent, city, slugOverride] = countryMap[key] || countryMap.usa;
  const slug = slugOverride || key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
  return {
    key,
    name,
    slug,
    continent,
    city,
    url: `/content/locations/${continent}/${slug}/index.html`,
    flag: `/content/locations/${continent}/${slug}/img/flag.svg`
  };
}

const additions = {
  'culture/art': [
    ['Venice Biennale Arte', 'italy'], ['Art Basel', 'switzerland'], ['Frieze London', 'uk'],
    ['TEFAF Maastricht', 'netherlands'], ['Biennale of Sydney', 'australia'], ['Frieze New York', 'usa']
  ],
  'culture/awards': [
    ['Golden Globe Awards', 'usa'], ['BAFTA Film Awards', 'uk'], ['Emmy Awards', 'usa'], ['Tony Awards', 'usa'],
    ['Cesar Awards', 'france'], ['Brit Awards', 'uk'], ['MTV Video Music Awards', 'usa'], ['BET Awards', 'usa']
  ],
  'culture/carnival': [
    ['Rio Carnival', 'brazil'], ['Notting Hill Carnival', 'uk'], ['Venice Carnival', 'italy'], ['Carnival of Santa Cruz de Tenerife', 'spain'],
    ['Cologne Carnival', 'germany'], ['Nice Carnival', 'france'], ['Quebec Winter Carnival', 'canada'], ['Trinidad Carnival', 'usa']
  ],
  'culture/fashion': [
    ['Paris Fashion Week', 'france'], ['Milan Fashion Week', 'italy'], ['London Fashion Week', 'uk'],
    ['New York Fashion Week', 'usa'], ['Copenhagen Fashion Week', 'denmark'], ['Seoul Fashion Week', 'southKorea'],
    ['Tokyo Fashion Week', 'japan'], ['Shanghai Fashion Week', 'china'], ['Dubai Fashion Week', 'uae']
  ],
  'culture/film': [
    ['Berlin International Film Festival', 'germany'], ['Toronto International Film Festival', 'canada'],
    ['Sundance Film Festival', 'usa'], ['Busan International Film Festival', 'southKorea'],
    ['Locarno Film Festival', 'switzerland'], ['Tribeca Festival', 'usa']
  ],
  'culture/food-drink': [
    ['Taste of Chicago', 'usa'], ['Salon du Chocolat Paris', 'france'], ['Melbourne Food and Wine Festival', 'australia'],
    ['Dubai Food Festival', 'uae'], ['Pizzafest Naples', 'italy'], ['La Tomatina', 'spain'],
    ['Singapore Food Festival', 'china'], ['San Sebastian Gastronomika', 'spain']
  ],
  'culture/gaming': [
    ['Tokyo Game Show', 'japan'], ['PAX East', 'usa'], ['PAX West', 'usa'], ['The Game Awards', 'usa'],
    ['ChinaJoy', 'china'], ['Brasil Game Show', 'brazil'], ['Paris Games Week', 'france'],
    ['DreamHack Dallas', 'usa'], ['EGX London', 'uk']
  ],
  'culture/music': [
    ['Montreux Jazz Festival', 'switzerland'], ['New Orleans Jazz and Heritage Festival', 'usa'],
    ['Sziget Festival', 'hungary'], ['Roskilde Festival', 'denmark'], ['North Sea Jazz Festival', 'netherlands'],
    ['Mawazine Festival', 'france'], ['WOMADelaide', 'australia']
  ],
  'culture/music-festivals': [
    ['Lollapalooza Chicago', 'usa'], ['Primavera Sound Barcelona', 'spain'], ['Sziget Festival Budapest', 'hungary'],
    ['Rock in Rio', 'brazil'], ['Roskilde Festival', 'denmark'], ['Fuji Rock Festival', 'japan']
  ],
  'culture/pop-culture': [
    ['New York Comic Con', 'usa'], ['MCM Comic Con London', 'uk'], ['Anime Expo', 'usa'], ['Japan Expo Paris', 'france'],
    ['CCXP Sao Paulo', 'brazil'], ['Fan Expo Canada', 'canada'], ['Dragon Con', 'usa'], ['D23 Expo', 'usa'], ['Lucca Comics and Games', 'italy']
  ],
  'culture/religion': [
    ['Kumbh Mela', 'india'], ['Easter in Jerusalem', 'italy'], ['Semana Santa Seville', 'spain'], ['Thaipusam', 'india'],
    ['Vesak Day', 'india'], ['Obon Festival', 'japan'], ['Ramadan Nights Dubai', 'uae'], ['Christmas Midnight Mass Vatican', 'italy']
  ],
  'culture/tech-events': [
    ['SXSW Interactive', 'usa'], ['Web Summit Lisbon', 'spain'], ['VivaTech Paris', 'france'], ['Slush Helsinki', 'germany'],
    ['London Tech Week', 'uk'], ['TechCrunch Disrupt', 'usa'], ['GITEX Global', 'uae'], ['RISE Asia', 'china'], ['Dublin Tech Summit', 'uk']
  ],
  'culture/tradition': [
    ['Holi Festival', 'india'], ['Chinese New Year', 'china'], ['Songkran Festival', 'china'], ['Up Helly Aa', 'uk']
  ],
  'culture/wildlife': [
    ['Sardine Run South Africa', 'southAfrica'], ['Monarch Butterfly Migration', 'mexico'], ['Cherry Blossom Wildlife Season', 'japan'],
    ['Great Barrier Reef Coral Spawning', 'australia'], ['Polar Bear Week Churchill', 'canada'], ['Galapagos Wildlife Season', 'usa'], ['Masai Mara Calving Season', 'southAfrica']
  ],
  'culture/winter': [
    ['Sapporo Snow Festival', 'japan'], ['Harbin Ice and Snow Festival', 'china'], ['Quebec Winter Carnival', 'canada'], ['Tromso Northern Lights Festival', 'norway'],
    ['Kiruna Snow Festival', 'sweden'], ['Ice Magic Lake Louise', 'canada'], ['Carnaval de Quebec Night Parade', 'canada'], ['White Turf St Moritz', 'switzerland']
  ],
  'music/music-festivals': [
    ['Glastonbury Festival', 'uk'], ['Tomorrowland', 'belgium'], ['Coachella', 'usa'], ['Ultra Music Festival', 'usa'],
    ['Primavera Sound', 'spain'], ['Fuji Rock Festival', 'japan'], ['Roskilde Festival', 'denmark'], ['Montreux Jazz Festival', 'switzerland']
  ],
  'music/song-contests': [
    ['Sanremo Music Festival', 'italy'], ['Melodifestivalen', 'sweden'], ['American Song Contest', 'usa'], ['Junior Eurovision Song Contest', 'france'],
    ['Benidorm Fest', 'spain'], ['Festival da Cancao', 'spain'], ['Una Voce per San Marino', 'italy'], ['The Voice Finale', 'usa'], ['MGP Norway', 'norway']
  ],
  'music/world-music': [
    ['WOMAD Charlton Park', 'uk'], ['Rainforest World Music Festival', 'china'], ['Sauti za Busara', 'southAfrica'], ['Festival au Desert', 'france'],
    ['Essaouira Gnaoua Festival', 'france'], ['Mawazine Rabat', 'france'], ['Fes Festival of World Sacred Music', 'france'], ['Celtic Connections', 'uk'], ['Udaipur World Music Festival', 'india'], ['GlobalFEST New York', 'usa']
  ],
  'sport/american-football': [
    ['College Football Playoff National Championship', 'usa'], ['NFL Draft', 'usa'], ['Pro Bowl Games', 'usa'], ['Army Navy Game', 'usa'],
    ['Rose Bowl Game', 'usa'], ['Cotton Bowl Classic', 'usa'], ['Orange Bowl', 'usa'], ['Sugar Bowl', 'usa'], ['NFL Kickoff Game', 'usa']
  ],
  'sport/aussie-rules': [
    ['AFL Anzac Day', 'australia'], ['AFL Dreamtime at the G', 'australia'], ['AFL Gather Round', 'australia'], ['AFLW Grand Final', 'australia'],
    ['AFL Preliminary Finals', 'australia'], ['AFL Brownlow Medal', 'australia'], ['AFL Opening Round', 'australia'], ['AFL Queen Birthday Clash', 'australia'], ['AFL International Rules Series', 'australia']
  ],
  'sport/baseball': [
    ['MLB All-Star Game', 'usa'], ['Home Run Derby', 'usa'], ['Opening Day MLB', 'usa'], ['Little League World Series', 'usa'],
    ['College World Series', 'usa'], ['World Baseball Classic', 'usa'], ['Japan Series', 'japan'], ['Korean Series', 'southKorea'], ['Caribbean Series', 'mexico']
  ],
  'sport/basketball': [
    ['NBA All-Star Game', 'usa'], ['NCAA Final Four', 'usa'], ['WNBA Finals', 'usa'], ['EuroLeague Final Four', 'germany'],
    ["FIBA Women's Basketball World Cup", 'germany'], ['NBA Draft', 'usa'], ['Basketball Africa League Finals', 'southAfrica'], ['NBA In-Season Tournament Final', 'usa'], ['NCAA March Madness Selection Sunday', 'usa']
  ],
  'sport/cricket': [
    ['The Ashes', 'uk'], ['ICC Champions Trophy', 'india'], ['The Hundred Final', 'uk'], ['Big Bash League Final', 'australia'],
    ['Pakistan Super League Final', 'uae'], ['Women Cricket World Cup Final', 'india'], ['Asia Cup Cricket Final', 'india']
  ],
  'sport/cycling': [
    ['Giro d Italia', 'italy'], ['Vuelta a Espana', 'spain'], ['Paris Roubaix', 'france'], ['Tour of Flanders', 'belgium'],
    ['UCI Road World Championships', 'canada'], ['Milan San Remo', 'italy'], ['Liege Bastogne Liege', 'belgium'], ['Strade Bianche', 'italy'], ['Amstel Gold Race', 'netherlands']
  ],
  'sport/football': [
    ['UEFA Europa League Final', 'uk'], ['UEFA Conference League Final', 'germany']
  ],
  'sport/horse-racing': [
    ['Kentucky Derby', 'usa'], ['Royal Ascot', 'uk'], ['Prix de l Arc de Triomphe', 'france'], ['Grand National', 'uk'],
    ['Breeders Cup', 'usa'], ['Cheltenham Gold Cup', 'uk'], ['Japan Cup', 'japan']
  ],
  'sport/ice-hockey': [
    ['Winter Classic', 'usa'], ['NHL All-Star Weekend', 'usa'], ['Spengler Cup', 'switzerland'], ['World Junior Ice Hockey Championship', 'canada'],
    ['Champions Hockey League Final', 'switzerland'], ['KHL Gagarin Cup Final', 'china'], ['Memorial Cup', 'canada']
  ],
  'sport/marathon': [
    ['Chicago Marathon', 'usa'], ['Tokyo Marathon', 'japan'], ['New York City Marathon', 'usa'], ['Sydney Marathon', 'australia'],
    ['Paris Marathon', 'france'], ['Amsterdam Marathon', 'netherlands'], ['Valencia Marathon', 'spain']
  ],
  'sport/motogp': [
    ['Qatar MotoGP', 'qatar'], ['Spanish MotoGP', 'spain'], ['Italian MotoGP', 'italy'], ['Dutch TT Assen', 'netherlands'],
    ['British MotoGP', 'uk'], ['Australian MotoGP', 'australia'], ['German MotoGP', 'germany'], ['French MotoGP', 'france'], ['Malaysian MotoGP', 'china']
  ],
  'sport/motorsport': [
    ['Daytona 500', 'usa'], ['NASCAR Championship Race', 'usa'], ['Bathurst 1000', 'australia'], ['Dakar Rally', 'saudiArabia'],
    ['Rally Monte Carlo', 'france'], ['Isle of Man TT', 'uk'], ['Goodwood Festival of Speed', 'uk'], ['Sebring 12 Hours', 'usa']
  ],
  'sport/multi-sport': [
    ['European Championships', 'germany'], ['World University Games', 'germany'], ['Invictus Games', 'canada'],
    ['Pan American Games', 'usa'], ['African Games', 'southAfrica'], ['Youth Olympic Games', 'senegal']
  ],
  'sport/rugby': [
    ['Super Rugby Final', 'australia'], ['Premiership Rugby Final', 'uk'], ['United Rugby Championship Final', 'uk'],
    ['European Rugby Champions Cup Final', 'spain'], ['Rugby League World Cup Final', 'australia']
  ],
  'sport/running': [
    ['Great North Run', 'uk'], ['Comrades Marathon', 'southAfrica'], ['Two Oceans Marathon', 'southAfrica'], ['City2Surf Sydney', 'australia'],
    ['Great Ethiopian Run', 'southAfrica'], ['Bolder Boulder', 'usa'], ['Peachtree Road Race', 'usa']
  ],
  'sport/tennis': [
    ['ATP Finals', 'italy'], ['WTA Finals', 'saudiArabia'], ['Davis Cup Finals', 'spain'], ['Billie Jean King Cup Finals', 'spain'],
    ['Indian Wells Masters', 'usa'], ['Miami Open Tennis', 'usa']
  ],
  'technology/consumer-electronics': [
    ['Apple September Event', 'usa'], ['Samsung Galaxy Unpacked', 'usa'], ['Google Pixel Launch', 'usa'], ['IFA Berlin', 'germany'],
    ['Mobile World Congress', 'spain'], ['Computex Taipei', 'china'], ['Nintendo Direct Showcase', 'japan'], ['Sony State of Play', 'japan'], ['Microsoft Surface Event', 'usa']
  ],
  'technology/developer-conferences': [
    ['GitHub Universe', 'usa'], ['NVIDIA GTC', 'usa'], ['AWS re:Invent', 'usa'], ['Meta Connect', 'usa'],
    ['Salesforce Dreamforce', 'usa'], ['Red Hat Summit', 'usa'], ['DockerCon', 'usa']
  ]
};

const countryFix = { denmark: ['Denmark', 'europe', 'Copenhagen'], hungary: ['Hungary', 'europe', 'Budapest'], norway: ['Norway', 'europe', 'Oslo'], sweden: ['Sweden', 'europe', 'Stockholm'], senegal: ['Senegal', 'africa', 'Dakar'] };
Object.assign(countryMap, countryFix);

function esc(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function slugify(value) {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function titleCase(slug) {
  return slug.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function countryChip(c) {
  return `<a class="country" href="${c.url}"><img src="${c.flag}" alt="" width="20" height="14" loading="lazy">${esc(c.name)}</a>`;
}

function ensureImages(topicDir, slug) {
  const imgDir = path.join(topicDir, 'events', 'img');
  fs.mkdirSync(imgDir, { recursive: true });
  const existingHero = walk(imgDir).find(file => file.endsWith('-hero.png'));
  const existingMini = walk(imgDir).find(file => file.endsWith('-mini.png'));
  const fallbackHero = existingHero || path.join(ROOT, 'assets', 'icons', 'apple-touch-icon.png');
  const fallbackMini = existingMini || path.join(ROOT, 'assets', 'icons', 'apple-touch-icon.png');
  fs.copyFileSync(fallbackHero, path.join(imgDir, `${slug}-hero.png`));
  fs.copyFileSync(fallbackMini, path.join(imgDir, `${slug}-mini.png`));
}

function eventPage({ rootPrefix, category, topic, title, slug, c }) {
  const categoryLabel = titleCase(category);
  const topicLabel = titleCase(topic);
  const topicPath = `${rootPrefix}/content/categories/${category}/${topic}`;
  const imgPath = `${topicPath}/events/img/${slug}`;
  const yearData = {
    eventName: title,
    slug,
    defaultYear: 2026,
    lastUpdated: TODAY,
    sources: [{ label: 'Official organiser listing TBC', url: '#' }],
    editions: [2026, 2025, 2024, 2023, 2022, 2021].map(year => ({
      year,
      headingPlace: `in ${c.city}`,
      status: year === 2026 ? 'upcoming' : 'past',
      statusLabel: year === 2026 ? 'Watchlist' : 'Archive',
      startDate: '',
      endExclusive: '',
      nextDate: '',
      dates: year === 2026 ? '2026 date TBC' : 'Archive details TBC',
      countries: [{ name: c.name, url: c.url, flag: c.flag }],
      cities: [{ name: c.city }],
      venue: 'Venue TBC',
      format: `${topicLabel} event view`,
      result: year === 2026 ? '' : 'Final details TBC.',
      countdownText: 'Exact dates are TBC; check the official organiser before travel.',
      calendarDescription: `${title} ${year}.`,
      questions: [
        { q: 'When is the event?', a: year === 2026 ? '2026 date TBC' : 'Archive details TBC', detail: 'Exact dates should be verified from the official organiser.' },
        { q: 'Where is it held?', a: `${esc(c.city)}, ${countryChip(c)}`, detail: 'Venue details are TBC until the organiser confirms the edition.' },
        { q: 'How do I buy tickets?', a: 'Use official channels', detail: 'Ticket windows, resale rules and access conditions can change by edition.' },
        { q: 'What is the programme?', a: 'Programme TBC', detail: 'Add the official schedule when it is published.' },
        { q: 'What is new this year?', a: `${title} 2026 watchlist`, detail: 'This page is ready for verified edition updates.' }
      ],
      highlights: []
    }))
  };
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="/assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="/assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="/assets/icons/site.webmanifest">
  <link rel="stylesheet" href="/assets/css/events.css">
  <script defer src="/assets/js/events.js"></script>
  <link rel="preload" as="image" href="${imgPath}-hero.png">
  <link rel="canonical" href="https://one-sliders.com${topicPath}/events/${slug}.html">
  <meta name="description" content="${esc(title)} 2026 overview: dates, venue, tickets, programme and travel context for ${categoryLabel} / ${topicLabel}.">
  <meta property="og:title" content="${esc(title)} 2026 - Dates, Schedule &amp; Results">
  <meta property="og:image" content="https://one-sliders.com${imgPath}-hero.png">
  <meta property="og:url" content="https://one-sliders.com${topicPath}/events/${slug}.html">
  <meta name="twitter:card" content="summary_large_image">
  <title>${esc(title)} 2026 - Dates, Schedule &amp; Results</title>
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
          <div class="facts-strip hero-control"><div class="fact"><span>Frequency</span><strong>Recurring</strong></div><div class="fact"><span>Current edition</span><strong>2026</strong></div><div class="fact"><span>Main city</span><strong>${esc(c.city)}</strong></div><div class="fact"><span>Country</span><strong>${countryChip(c)}</strong></div></div>
          <div class="card-grid"><a class="topic-card topic-card--inline" href="${topicPath}.html"><img src="${imgPath}-mini.png" alt="${esc(title)} thumbnail" width="400" height="300" loading="lazy"><span>More ${topicLabel}</span><strong>Back to ${topicLabel}</strong><p>Explore related event views in this topic.</p></a><div class="card"><span>History</span><strong>Why people follow it</strong><p>This overview is prepared as a watchlist page. Replace TBC fields with verified organiser details as the edition opens.</p></div><div class="card"><span>Format / rules</span><strong>Edition details can change</strong><p>The year slide keeps date, ticket, venue and programme updates together without creating separate URLs.</p></div></div>
          <div class="card-grid card-grid--support"><div class="card"><span>Records</span><strong>Records TBC</strong><p>Add verified records only when a reliable source is available.</p></div><div class="card"><span>Notable moments</span><ul class="event-list"><li>Host context: ${countryChip(c)}.</li><li>Current edition: 2026 watchlist.</li><li>Last updated: ${TODAY}.</li></ul></div></div>
          <div class="card card--editions"><span>Recent editions</span><table class="event-table"><thead><tr><th>Year</th><th>Host / place</th><th>Country</th></tr></thead><tbody>${[2025,2024,2023,2022,2021].map(y => `<tr><th>${y}</th><td>Archive TBC</td><td>${countryChip(c)}</td></tr>`).join('')}</tbody></table></div>
        </div>
      </section>
      <section class="event-slide" id="year" data-slide="year">
        <img class="event-hero__image" src="${imgPath}-hero.png" alt="${esc(title)} hero image" width="1200" height="630" loading="lazy">
        <div class="event-slide__content"><div class="event-hero-copy"><p class="event-kicker">Edition view</p><h2 class="event-section-title" data-year-heading>${esc(title)} 2026 in ${esc(c.city)}</h2><p class="event-subtitle">Switch between recent editions without leaving the page.</p></div><div class="year-switcher hero-control" data-year-switcher aria-label="Choose edition"></div><div class="year-edition" data-year-edition><div class="facts-strip"><div class="fact"><span>Country</span><strong>${countryChip(c)}</strong></div><div class="fact"><span>City</span><strong>${esc(c.city)}</strong></div><div class="fact"><span>Venue</span><strong>TBC</strong></div><div class="fact"><span>Dates</span><strong>2026 date TBC</strong></div><div class="fact"><span>Status</span><strong>Watchlist</strong></div><div class="fact"><span>Format</span><strong>${topicLabel} overview</strong></div></div><div class="countdown"><span>Countdown</span><strong>Date TBC</strong><p>Exact dates are TBC; check the official organiser before travel.</p></div><div class="question-grid"><div class="question"><span>When is the event?</span><strong>2026 date TBC</strong><p>Update from the official organiser when confirmed.</p></div><div class="question"><span>Where is it held?</span><strong>${esc(c.city)}, ${countryChip(c)}</strong><p>Venue details are TBC.</p></div><div class="question"><span>How do I buy tickets?</span><strong>Use official channels</strong><p>Ticket windows and resale rules can change.</p></div><div class="question"><span>What is the programme?</span><strong>Programme TBC</strong><p>Add the official schedule when published.</p></div><div class="question"><span>What happened last edition?</span><strong>Archive TBC</strong><p>Add verified highlights when available.</p></div></div><div class="actions-row"><button class="event-button" type="button" data-calendar-download>Add to calendar</button><button class="event-button" type="button" data-save-event="${slug}" data-save-label="Save / remind me" data-saved-label="Saved">Save / remind me</button></div><p class="event-source">Sources: official organiser listing TBC. Last updated: ${TODAY}.</p></div></div>
      </section>
    </div>
    <button class="event-carousel__prev" type="button" data-carousel-prev aria-label="Previous slide">Previous</button><button class="event-carousel__next" type="button" data-carousel-next aria-label="Next slide">Next</button><nav class="event-carousel__dots" data-carousel-dots aria-label="Slide navigation"></nav>
  </main>
</body>
</html>`;
}

function readExistingEvents() {
  const files = walk(path.join(ROOT, 'content')).concat(walk(path.join(ROOT, 'en', 'content')))
    .filter(file => file.endsWith('.html') && /[\\/]content[\\/]categories[\\/].*[\\/]events[\\/][^\\/]+\.html$/.test(file));
  const byTopic = new Map();
  for (const file of files) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const parts = rel.split('/');
    const i = parts.indexOf('categories');
    const key = `${parts[i + 1]}/${parts[i + 2]}`;
    const slug = path.basename(file, '.html');
    if (!byTopic.has(key)) byTopic.set(key, new Set());
    byTopic.get(key).add(slug);
  }
  return byTopic;
}

function chooseRoot(key) {
  return 'content';
}

function topicDirFor(rootPrefix, key) {
  return path.join(ROOT, rootPrefix, 'categories', ...key.split('/'));
}

function makeTopicCard(e, fromEn = false) {
  const root = '/content';
  const href = `${root}/categories/${e.category}/${e.topic}/events/${e.slug}.html`;
  const img = `${root}/categories/${e.category}/${e.topic}/events/img/${e.slug}-mini.png`;
  return `<a class="event-card" href="${href}"><img class="event-thumb" src="${img}" alt="${esc(e.title)} thumbnail" loading="lazy" width="400" height="300"><time>2026 watchlist</time><strong>${esc(e.title)}</strong><p>${esc(e.country.city)}, ${esc(e.country.name)}</p></a>`;
}

function updateTopicPage(pagePath, events) {
  if (!fs.existsSync(pagePath)) {
    const [category, topic] = path.relative(path.join(ROOT, pagePath.includes(`${path.sep}en${path.sep}`) ? 'content/categories' : 'content/categories'), pagePath).replace(/\\/g, '/').replace(/\.html$/, '').split('/');
    fs.mkdirSync(path.dirname(pagePath), { recursive: true });
    fs.writeFileSync(pagePath, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${titleCase(topic)} Events 2026</title><link rel="stylesheet" href="/assets/css/categories.css"></head><body><main class="category-shell"><h1>${titleCase(topic)}</h1><section class="topics-section"><div class="topic-grid event-grid"></div></section></main></body></html>`, 'utf8');
  }
  let html = fs.readFileSync(pagePath, 'utf8');
  const cards = events.map(makeTopicCard).join('\n');
  if (html.includes('<!-- generated-topic-fill:start -->')) {
    html = html.replace(/<!-- generated-topic-fill:start -->[\s\S]*?<!-- generated-topic-fill:end -->/, `<!-- generated-topic-fill:start -->\n${cards}\n<!-- generated-topic-fill:end -->`);
  } else if (html.includes('<div class="event-grid')) {
    html = html.replace(/(<div class="event-grid[^>]*>)/, `$1\n<!-- generated-topic-fill:start -->\n${cards}\n<!-- generated-topic-fill:end -->`);
  } else if (html.includes('<div class="topic-grid')) {
    html = html.replace(/(<div class="topic-grid[^>]*>)/, `$1\n<!-- generated-topic-fill:start -->\n${cards}\n<!-- generated-topic-fill:end -->`);
  } else {
    html = html.replace('</main>', `<section class="topics-section"><div class="event-grid">\n<!-- generated-topic-fill:start -->\n${cards}\n<!-- generated-topic-fill:end -->\n</div></section></main>`);
  }
  fs.writeFileSync(pagePath, html, 'utf8');
}

function indexCard(e, indexRoot = 'content') {
  const base = '../categories';
  const href = `${base}/${e.category}/${e.topic}/events/${e.slug}.html`;
  const img = `${base}/${e.category}/${e.topic}/events/img/${e.slug}-mini.png`;
  return `<a class="event-card" data-end="2026-12-31" data-cat="${esc(e.category)}" data-topic="${esc(e.topic)}" data-cont="${esc(e.country.continent)}" data-country="${esc(e.country.slug)}" href="${href}" data-start="2026-01-01" data-reach="global" style="--cat-color:var(--c-culture)"><img class="card-thumb" src="${img}" alt="${esc(e.title)}" loading="lazy" width="400" height="300"><div class="card-stripe"></div><div class="card-body"><span class="cat-pill">${esc(titleCase(e.category))}</span><strong class="card-title">${esc(e.title)}</strong><span class="card-meta">2026 watchlist - ${esc(e.country.city)}, ${esc(e.country.name)}</span></div></a>`;
}

function updateIndex(indexPath, events, indexRoot) {
  if (!fs.existsSync(indexPath)) return;
  let html = fs.readFileSync(indexPath, 'utf8');
  const cards = events.map(e => indexCard(e, indexRoot)).join('\n        ');
  if (html.includes('<!-- generated-minimum-events:start -->')) {
    html = html.replace(/<!-- generated-minimum-events:start -->[\s\S]*?<!-- generated-minimum-events:end -->/, `<!-- generated-minimum-events:start -->\n        ${cards}\n        <!-- generated-minimum-events:end -->`);
  } else {
    html = html.replace('</main>', `        <!-- generated-minimum-events:start -->\n        ${cards}\n        <!-- generated-minimum-events:end -->\n  </main>`);
  }
  fs.writeFileSync(indexPath, html, 'utf8');
}

function updateCountryPages(events) {
  const byCountry = new Map();
  for (const e of events) {
    const key = `${e.country.continent}/${e.country.slug}`;
    if (!byCountry.has(key)) byCountry.set(key, []);
    byCountry.get(key).push(e);
  }
  for (const [key, list] of byCountry) {
    const pagePath = path.join(ROOT, 'content', 'locations', ...key.split('/'), 'index.html');
    if (!fs.existsSync(pagePath)) continue;
    let html = fs.readFileSync(pagePath, 'utf8');
    const cards = list.slice(0, 12).map(e => `<a class="internal-link-card" href="/content/categories/${e.category}/${e.topic}/events/${e.slug}.html"><span>${esc(titleCase(e.topic))}</span><strong>${esc(e.title)}</strong><p>2026 watchlist</p></a>`).join('');
    const block = `<!-- generated-country-events:start -->${cards}<!-- generated-country-events:end -->`;
    if (html.includes('<!-- generated-country-events:start -->')) {
      html = html.replace(/<!-- generated-country-events:start -->[\s\S]*?<!-- generated-country-events:end -->/, block);
    } else if (html.includes('internal-link-module__grid')) {
      html = html.replace(/(<div class="internal-link-module__grid">)/, `$1${block}`);
    } else {
      html = html.replace('</main>', `<section class="internal-link-module" data-internal-link-module><h2>New event views</h2><div class="internal-link-module__grid">${block}</div></section></main>`);
    }
    fs.writeFileSync(pagePath, html, 'utf8');
  }
}

const existing = readExistingEvents();
const managed = [];
let createdCount = 0;

for (const [key, candidates] of Object.entries(additions)) {
  const current = existing.get(key) || new Set();
  const need = Math.max(0, MIN_PER_TOPIC - current.size);
  if (!need) continue;
  const rootPrefix = chooseRoot(key);
  const [category, topic] = key.split('/');
  const topicDir = topicDirFor(rootPrefix, key);
  fs.mkdirSync(path.join(topicDir, 'events'), { recursive: true });
  let added = 0;
  for (const [title, countryKey] of candidates) {
    if (added >= need) break;
    const slug = slugify(title);
    if (current.has(slug)) continue;
    const c = country(countryKey);
    ensureImages(topicDir, slug);
    const pagePath = path.join(topicDir, 'events', `${slug}.html`);
    fs.writeFileSync(pagePath, eventPage({ rootPrefix: '', category, topic, title, slug, c }), 'utf8');
    current.add(slug);
    added += 1;
    createdCount += 1;
  }
}

for (const [key, candidates] of Object.entries(additions)) {
  const rootPrefix = chooseRoot(key);
  const [category, topic] = key.split('/');
  const topicDir = topicDirFor(rootPrefix, key);
  for (const [title, countryKey] of candidates) {
    const slug = slugify(title);
    const pagePath = path.join(topicDir, 'events', `${slug}.html`);
    if (!fs.existsSync(pagePath)) continue;
    const html = fs.readFileSync(pagePath, 'utf8');
    if (!html.includes('Official organiser listing TBC')) continue;
    managed.push({ rootPrefix: '', category, topic, title, slug, country: country(countryKey) });
  }
}

const byTopicRoot = new Map();
for (const e of managed) {
  const key = `${e.rootPrefix}|${e.category}/${e.topic}`;
  if (!byTopicRoot.has(key)) byTopicRoot.set(key, []);
  byTopicRoot.get(key).push(e);
}

for (const [key, events] of byTopicRoot) {
  const [rootPrefix, topicKey] = key.split('|');
  const [category, topic] = topicKey.split('/');
  const primary = path.join(ROOT, 'content', 'categories', category, `${topic}.html`);
  const fallback = path.join(ROOT, 'content', 'categories', category, `${topic}.html`);
  updateTopicPage(primary, events);
  if (primary !== fallback && fs.existsSync(fallback)) updateTopicPage(fallback, events);
}

updateIndex(path.join(ROOT, 'content', 'events', 'index.html'), managed, 'content');
updateCountryPages(managed);

fs.writeFileSync(path.join(ROOT, 'tmp', 'generated-topic-minimum-events.json'), JSON.stringify(managed, null, 2), 'utf8');
console.log(`Generated ${createdCount} event views. Managed ${managed.length} minimum-fill event views.`);
