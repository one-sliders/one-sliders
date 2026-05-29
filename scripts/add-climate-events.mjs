import fs from 'node:fs';
import path from 'node:path';
import { languages, profiles } from './event-language-profiles.mjs';

const root = process.cwd();
const events = [
  {
    slug: 'world-meteorological-day-2026',
    title: 'World Meteorological Day 2026',
    start: '2026-03-23',
    end: '2026-03-23',
    month: '03',
    topic: 'weather',
    country: 'switzerland',
    cont: 'europe',
    place: 'Geneva, Switzerland',
    venue: 'World Meteorological Organization',
    image: 'content/events/2026/03/img/world-meteorological-day-2026-hero.svg',
    summary: 'A climate-weather observance focused on meteorology, climate services, early warnings and the data that helps communities prepare for extreme conditions.',
    sourceLabel: 'WMO World Meteorological Day 2026',
    sourceUrl: 'https://extranet.wmo.int/edistrib_exped/grp_prs/_en/6557696-2026-GCE-WMD26_en.pdf'
  },
  {
    slug: 'earth-day-2026',
    title: 'Earth Day 2026',
    start: '2026-04-22',
    end: '2026-04-22',
    month: '04',
    topic: 'climate-action',
    country: 'usa',
    cont: 'north-america',
    place: 'Worldwide',
    venue: 'Global local actions',
    image: 'content/events/2026/04/img/earth-day-2026-hero.svg',
    summary: 'Earth Day 2026 uses the theme “Our Power, Our Planet” to connect climate, energy, environmental protection and community action worldwide.',
    sourceLabel: 'Earth Day 2026',
    sourceUrl: 'https://www.earthday.org/earth-day-2026/'
  },
  {
    slug: 'world-environment-day-2026',
    title: 'World Environment Day 2026',
    start: '2026-06-05',
    end: '2026-06-05',
    month: '06',
    topic: 'climate-action',
    country: 'azerbaijan',
    cont: 'asia',
    place: 'Azerbaijan',
    venue: 'Global observance',
    image: 'content/events/2026/06/img/world-environment-day-2026-hero.svg',
    summary: 'World Environment Day is one of the largest annual UN environment observances, with 2026 hosted by Azerbaijan and linked to climate and environmental protection.',
    sourceLabel: 'World Environment Day',
    sourceUrl: 'https://www.worldenvironmentday.global/'
  },
  {
    slug: 'world-oceans-day-2026',
    title: 'World Oceans Day 2026',
    start: '2026-06-08',
    end: '2026-06-08',
    month: '06',
    topic: 'marine',
    country: 'usa',
    cont: 'north-america',
    place: 'Worldwide',
    venue: 'Coasts, schools and marine organizations',
    image: 'content/events/2026/06/img/world-oceans-day-2026-hero.svg',
    summary: 'World Oceans Day links ocean health, climate, biodiversity and plastic pollution through public actions around 8 June.',
    sourceLabel: 'World Oceans Day',
    sourceUrl: 'https://worldoceanday.org/'
  },
  {
    slug: 'atlantic-hurricane-season-2026',
    title: 'Atlantic Hurricane Season 2026',
    start: '2026-06-01',
    end: '2026-11-30',
    month: '06',
    topic: 'weather',
    country: 'usa',
    cont: 'north-america',
    place: 'Atlantic basin',
    venue: 'Atlantic Ocean, Caribbean and Gulf coasts',
    image: 'content/events/2026/06/img/atlantic-hurricane-season-2026-hero.svg',
    summary: 'The Atlantic hurricane season is a climate-weather planning window for tropical cyclone risk, coastal preparedness and early warning systems.',
    sourceLabel: 'National Hurricane Center seasonal dates',
    sourceUrl: 'https://www.nhc.noaa.gov/climo/'
  },
  {
    slug: 'world-cleanup-day-2026',
    title: 'World Cleanup Day 2026',
    start: '2026-09-20',
    end: '2026-09-20',
    month: '09',
    topic: 'sustainability',
    country: 'tbc',
    cont: 'global',
    place: 'Worldwide',
    venue: 'Local cleanup sites',
    image: 'content/events/2026/09/img/world-cleanup-day-2026-hero.svg',
    summary: 'World Cleanup Day mobilizes communities against waste and pollution, connecting local cleanup action with sustainability and environmental stewardship.',
    sourceLabel: 'UN World Cleanup Day',
    sourceUrl: 'https://www.un.org/en/observances/world-cleanup-day'
  },
  {
    slug: 'cop31-2026',
    title: 'COP31 UN Climate Change Conference',
    start: '2026-11-09',
    end: '2026-11-20',
    month: '11',
    topic: 'climate-action',
    country: 'turkiye',
    cont: 'asia',
    place: 'Antalya, Turkiye',
    venue: 'UN Climate Change Conference venue',
    image: 'content/events/2026/11/img/cop31-2026-hero.svg',
    summary: 'COP31 brings governments, observers and climate stakeholders to Antalya for UN climate negotiations on implementation, finance and adaptation.',
    sourceLabel: 'UNFCCC COP31',
    sourceUrl: 'https://unfccc.int/cop31'
  }
];

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const rootHref = (lang, ev) => `${lang === 'content' ? '' : '../../'}${lang === 'content' ? 'content/' : `${lang}/content/`}events/2026/${ev.month}/${ev.slug}.html`;

function cardHref(lang, ev) {
  return lang === 'content'
    ? `2026/${ev.month}/${ev.slug}.html`
    : `2026/${ev.month}/${ev.slug}.html`;
}

function imgHrefFromIndex(ev) {
  return `../../../${ev.image}`;
}

function miniImage(ev) {
  return ev.image.replace(/-hero\.(svg|png|jpe?g|webp)$/i, '-mini.png');
}

function pageFor(lang, ev) {
  const profile = profiles[lang] || profiles.en;
  const labels = profile.labels || profiles.en.labels;
  const catHref = `../../../categories/climate/${ev.topic}.html`;
  const img = `../../../../../${ev.image}`;
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="../../../../../assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="../../../../../assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../../../../../assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="../../../../../assets/icons/site.webmanifest">
  <link rel="canonical" href="https://one-sliders.com/${lang}/content/events/2026/${ev.month}/${ev.slug}.html">
  <meta name="content-id" content="event-${ev.slug}">
  <meta name="content-language" content="${lang}">
  <title>${esc(ev.title)}</title>
  <style>
    :root{--theme:#245f46;--accent:#9fd16b;--ink:#17201c;--paper:#fbfaf6;--muted:#5f6b63;--line:rgba(23,32,28,.14)}
    *{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:var(--ink);background:var(--paper)}a{color:inherit}.top-menu{position:sticky;top:0;z-index:10;display:flex;gap:8px;align-items:center;padding:8px clamp(14px,3vw,36px);background:rgba(251,250,246,.95);border-bottom:1px solid var(--line);backdrop-filter:blur(10px)}.top-menu a{padding:8px 11px;border-radius:999px;text-decoration:none;font-size:13px}.top-menu a:hover,.top-menu a.active{background:var(--theme);color:white}.nav-icon{display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;color:var(--muted)}.nav-icon svg{width:22px;height:22px}.nav-divider{width:1px;height:18px;background:var(--line)}
    .event-hero{min-height:clamp(280px,46vh,520px);display:grid;align-items:end;padding:clamp(24px,6vw,86px);color:white;background:linear-gradient(90deg,rgba(8,18,12,.72),rgba(8,18,12,.32) 58%,rgba(8,18,12,0)),linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.28)),url('${img}') center/cover}.eyebrow{margin:0 0 8px;color:var(--accent);font-size:13px;font-weight:800;text-transform:uppercase}.event-hero h1{max-width:820px;margin:0;font-size:clamp(42px,7vw,86px);line-height:.94}.event-hero p{max-width:720px;margin:14px 0 0;font-size:clamp(15px,1.5vw,18px);line-height:1.38}
    main{display:grid;grid-template-columns:minmax(280px,.78fr) minmax(420px,1.22fr);gap:12px;padding:clamp(18px,4vw,64px)}.panel{padding:16px;border:1px solid var(--line);border-radius:8px;background:white;border-left:5px solid var(--theme);box-shadow:0 8px 18px rgba(23,32,28,.05)}.panel h2{margin:0 0 10px;font-size:22px}.fact{display:grid;grid-template-columns:120px 1fr;gap:10px;padding:9px 0;border-top:1px solid rgba(23,32,28,.1)}.fact:first-of-type{border-top:0}.fact span{color:var(--muted);font-size:12px;font-weight:800;text-transform:uppercase}.fact strong{font-size:15px}.links{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.route-chip{padding:12px;border:1px solid var(--line);border-radius:8px;text-decoration:none;background:rgba(159,209,107,.08)}.route-chip span{display:block;color:var(--muted);font-size:11px;font-weight:800;text-transform:uppercase}.route-chip strong{display:block;margin-top:4px;color:var(--theme)}.site-footer{padding:14px clamp(14px,3vw,36px);color:var(--muted);font-size:13px;border-top:1px solid var(--line);background:white}@media(max-width:860px){main{grid-template-columns:1fr}.links{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <nav class="top-menu" aria-label="Event navigation">
    <a class="nav-icon" href="../../index.html" title="${esc(profile.categories?.events || 'Events')}" aria-label="${esc(profile.categories?.events || 'Events')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a>
    <a class="nav-icon" href="../../../../../content/locations/index.html" title="${esc(labels.place || 'World')}" aria-label="${esc(labels.place || 'World')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>
    <a class="nav-icon" href="../../../categories/index.html" title="${esc(labels.category || 'Categories')}" aria-label="${esc(labels.category || 'Categories')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a>
    <span class="nav-divider"></span>
    <a href="${catHref}">Climate</a>
    <a class="active" aria-current="page" href="${ev.slug}.html">${esc(ev.title)}</a>
  </nav>
  <header class="event-hero">
    <div>
      <p class="eyebrow">Climate - ${esc(ev.topic.replace(/-/g, ' '))}</p>
      <h1>${esc(ev.title)}</h1>
      <p>${esc(ev.summary)}</p>
    </div>
  </header>
  <main>
    <section class="panel">
      <h2>Quick facts</h2>
      <div class="fact"><span>Dates</span><strong>${esc(formatDateRange(ev.start, ev.end))}</strong></div>
      <div class="fact"><span>Place</span><strong>${esc(ev.place)}</strong></div>
      <div class="fact"><span>Venue</span><strong>${esc(ev.venue)}</strong></div>
      <div class="fact"><span>Topic</span><strong><a href="${catHref}">${esc(ev.topic.replace(/-/g, ' '))}</a></strong></div>
    </section>
    <section class="panel">
      <h2>Why it matters</h2>
      <p>${esc(ev.summary)} OneSlider tracks it as a climate-category moment because it connects dates, public attention and practical planning.</p>
      <div class="links">
        <a class="route-chip" href="${catHref}"><span>Topic</span><strong>${esc(ev.topic.replace(/-/g, ' '))}</strong></a>
        <a class="route-chip" href="${esc(ev.sourceUrl)}"><span>Source</span><strong>${esc(ev.sourceLabel)}</strong></a>
      </div>
    </section>
  </main>
  <footer class="site-footer"><p>&copy; 2026 <a href="https://3dfractal.no/">3D Fractal</a>. All rights reserved.</p></footer>
</body>
</html>
`;
}

function formatDateRange(start, end) {
  const s = new Date(`${start}T00:00:00Z`);
  const e = new Date(`${end}T00:00:00Z`);
  const fmt = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  return start === end ? fmt.format(s) : `${fmt.format(s)} - ${fmt.format(e)}`;
}

function ensureImage(ev) {
  const file = path.join(root, ev.image);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file)) return;
  const label = ev.title.replace(/&/g, '&amp;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 640"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#0d2137"/><stop offset=".55" stop-color="#245f46"/><stop offset="1" stop-color="#9fd16b"/></linearGradient></defs><rect width="1200" height="640" fill="url(#g)"/><circle cx="930" cy="138" r="210" fill="rgba(255,255,255,.13)"/><path d="M0 470c170-86 310-102 480-43s331 61 470 6 203-50 250-25v232H0z" fill="rgba(255,255,255,.18)"/><path d="M0 530c170-52 342-50 516-5s328 45 454-3 186-42 230-20v138H0z" fill="rgba(255,255,255,.22)"/><text x="72" y="432" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="68" font-weight="900">${label}</text><text x="76" y="486" fill="#d9f6b8" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700">Climate calendar</text></svg>`;
  fs.writeFileSync(file, svg, 'utf8');
}

function ensureTopicSeed() {
  const file = path.join(root, 'content', 'categories', 'climate', 'climate-action.html');
  if (!fs.existsSync(file)) fs.writeFileSync(file, '<!doctype html><title>Climate Action</title>', 'utf8');
}

function monthSection(ev, lang) {
  return `    <section class="month-section" id="m2026${ev.month}">
      <div class="month-header"><span class="month-title">${monthNames[Number(ev.month) - 1]} 2026</span><span class="month-line"></span></div>
      <div class="events-grid">
      </div>
    </section>`;
}

function eventCard(ev) {
  const meta = `${formatDateRange(ev.start, ev.end).replace(', 2026', '')} - ${ev.place}`;
  return `        <a class="event-card" data-end="${ev.end}" data-cat="climate" data-topic="${ev.topic}" data-cont="${ev.cont}" data-country="${ev.country}" href="2026/${ev.month}/${ev.slug}.html" data-start="${ev.start}" data-reach="global" style="--cat-color:var(--c-climate)"><img class="card-thumb" src="../../../${miniImage(ev)}" alt="${esc(ev.title)}" loading="lazy"><div class="card-stripe"></div><div class="card-body"><span class="cat-pill">Climate</span><strong class="card-title">${esc(ev.title)}</strong><span class="card-meta">${esc(meta)}</span></div></a>`;
}

function updateIndex(lang) {
  const file = path.join(root, lang, 'content', 'events', 'index.html');
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/(--c-nature:\s*#[0-9a-fA-F]+;\s*)/, `$1\n      --c-climate:  #245f46;`);
  html = html.replace(/(\.filter-btn\[data-cat="nature"\]\.active\s*\{\s*background:\s*var\(--c-nature\);\s*\})/, `$1\n    .filter-btn[data-cat="climate"].active  { background: var(--c-climate); }`);
  html = html.replace(/(<button class="filter-btn" data-cat="nature">[^<]*<\/button>)/, `$1\n      <button class="filter-btn" data-cat="climate">Climate</button>`);
  html = html.replace(/'wildlife':'Wildlife',/, "'wildlife':'Wildlife','weather':'Climate weather','climate-action':'Climate action','marine':'Marine','sustainability':'Sustainability',");
  for (const ev of events) {
    html = html.replace(new RegExp(`\\s*<a class="event-card"[^>]+href="2026/${ev.month}/${ev.slug}\\.html"[\\s\\S]*?</a>`), '');
    if (!html.includes(`id="m2026${ev.month}"`)) {
      html = html.replace(/\s*<\/main>/, `\n${monthSection(ev, lang)}\n  </main>`);
    }
    const sectionRe = new RegExp(`(<section class="month-section" id="m2026${ev.month}"[\\s\\S]*?<div class="events-grid">)([\\s\\S]*?)(\\n\\s*</div>\\s*</section>)`);
    html = html.replace(sectionRe, `$1\n${eventCard(ev)}$2$3`);
  }
  fs.writeFileSync(file, html, 'utf8');
}

ensureTopicSeed();
for (const ev of events) ensureImage(ev);

for (const lang of languages) {
  for (const ev of events) {
    const dir = path.join(root, lang, 'content', 'events', '2026', ev.month);
    fs.mkdirSync(path.join(dir, 'img'), { recursive: true });
    fs.writeFileSync(path.join(dir, `${ev.slug}.html`), pageFor(lang, ev), 'utf8');
  }
  updateIndex(lang);
}

console.log(`Added ${events.length} climate events across ${languages.length} languages.`);
