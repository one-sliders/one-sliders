import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const locationsRoot = path.join(root, 'content', 'locations');
const cssHref = '../../../../assets/css/locations.css?v=country-onepage-oceania-20260527';
const coreHref = '../../../../assets/js/oneslider-core.js';

const svg = {
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>',
};

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function relParts(file) {
  return path.relative(locationsRoot, file).split(path.sep);
}

function isImmediateCityPage(file) {
  const parts = relParts(file);
  return parts.length === 3 && parts[2] !== 'index.html' && parts[2].endsWith('.html');
}

function stripTags(html = '') {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeAttr(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeText(value = '') {
  return String(value)
    .replace(/&(?!(?:[a-zA-Z]+|#\d+|#x[a-fA-F0-9]+);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function matchOne(html, re, fallback = '') {
  const match = html.match(re);
  return match ? (match[1] ?? match[0]).trim() : fallback;
}

function toTitle(slug) {
  return slug.split('-').map((part) => part ? part[0].toUpperCase() + part.slice(1) : part).join(' ');
}

function normalizeImageUrl(url, continentSlug) {
  if (!url) return `/content/locations/${continentSlug}/img/${continentSlug}-mini.png`;
  return url.replace(/^['"]|['"]$/g, '').trim();
}

function lastUrlFromStyle(style, continentSlug) {
  const urls = [...style.matchAll(/url\(([^)]+)\)/gi)].map((m) => m[1].replace(/^['"]|['"]$/g, '').trim());
  return normalizeImageUrl(urls.at(-1), continentSlug);
}

function cityHeroUrl(continentSlug, countrySlug, cityFile) {
  const citySlug = cityFile.replace(/\.html$/i, '');
  const absolute = path.join(locationsRoot, continentSlug, countrySlug, 'img', `${citySlug}-hero.png`);
  return fs.existsSync(absolute)
    ? `/content/locations/${continentSlug}/${countrySlug}/img/${citySlug}-hero.png`
    : `/content/locations/${continentSlug}/img/${continentSlug}-mini.png`;
}

function extractFacts(mainHtml) {
  const facts = new Map();
  for (const match of mainHtml.matchAll(/<div class="fact-row">\s*<span>([\s\S]*?)<\/span>\s*<strong>([\s\S]*?)<\/strong>\s*<\/div>/gi)) {
    const key = stripTags(match[1]);
    const valueHtml = match[2].trim();
    if (key && !facts.has(key)) facts.set(key, valueHtml);
  }
  return facts;
}

function factText(facts, key, fallback = 'TBC') {
  const value = facts.get(key);
  return value ? stripTags(value) || fallback : fallback;
}

function factHtml(facts, key, fallback = 'TBC') {
  return facts.get(key) || escapeText(fallback);
}

function extractEvents(mainHtml, continentSlug) {
  const eventStrip = matchOne(mainHtml, /<div class="event-strip">([\s\S]*?)<\/div>\s*(?:<\/article>|$)/i);
  if (!eventStrip) return [];
  return [...eventStrip.matchAll(/<a\b([^>]*)class="event-card"([^>]*)>([\s\S]*?)<\/a>/gi)].slice(0, 8).map((m) => {
    const attrs = `${m[1]} ${m[2]}`;
    const body = m[3];
    const href = matchOne(attrs, /href="([^"]+)"/i, '#');
    const title = stripTags(matchOne(body, /<strong>([\s\S]*?)<\/strong>/i, 'Event'));
    const date = stripTags(matchOne(body, /<span class="event-date">([\s\S]*?)<\/span>/i, 'Upcoming'));
    const img = matchOne(body, /<img\b[^>]*src="([^"]+)"/i, `/content/locations/${continentSlug}/img/${continentSlug}-mini.png`);
    const alt = matchOne(body, /<img\b[^>]*alt="([^"]*)"/i, `${title} thumbnail`);
    return { href, title, date, img, alt };
  });
}

function extractHighlights(mainHtml) {
  const grid = matchOne(mainHtml, /<div class="mini-grid">([\s\S]*?)<\/div>\s*(?:<\/article>|$)/i);
  if (!grid) return [];
  return [...grid.matchAll(/<(a|div)\b([^>]*)class="mini-tile"([^>]*)>([\s\S]*?)<\/\1>/gi)].slice(0, 6).map((m) => {
    const attrs = `${m[2]} ${m[3]}`;
    const body = m[4];
    const href = matchOne(attrs, /href="([^"]+)"/i, '');
    const title = stripTags(matchOne(body, /<strong>([\s\S]*?)<\/strong>/i, 'City centre'));
    const desc = stripTags(matchOne(body, /<span>([\s\S]*?)<\/span>/i, 'Visitor highlight'));
    return { href, title, desc };
  });
}

function countrySiblings(countryDir, currentFile) {
  return fs.readdirSync(countryDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html') && entry.name !== 'index.html' && path.join(countryDir, entry.name) !== currentFile)
    .slice(0, 3)
    .map((entry) => ({ href: entry.name, name: toTitle(entry.name.replace(/\.html$/, '')) }));
}

function replaceHeadBits(html, heroUrl) {
  let next = html;
  next = next.replace(/<link rel="stylesheet" href="\.\.\/\.\.\/\.\.\/\.\.\/assets\/css\/oneslider-mockup\.css">/i, `<link rel="stylesheet" href="${cssHref}">`);
  next = next.replace(/<body(?![^>]*\bcountry-onepage\b)([^>]*)>/i, (m, attrs) => {
    if (/class="/i.test(attrs)) return `<body${attrs.replace(/class="([^"]*)"/i, 'class="$1 country-onepage"')}>`;
    return `<body class="country-onepage"${attrs}>`;
  });
  if (!/<link rel="preload" as="image"/i.test(next)) {
    next = next.replace(/(<link rel="stylesheet" href="\.\.\/\.\.\/\.\.\/\.\.\/assets\/css\/oneslider-core\.css">\s*)/i, `$1\n  <link rel="preload" as="image" href="${escapeAttr(heroUrl)}">`);
  } else {
    next = next.replace(/<link rel="preload" as="image" href="[^"]*">/i, `<link rel="preload" as="image" href="${escapeAttr(heroUrl)}">`);
  }
  if (!/oneslider-core\.js/i.test(next)) {
    next = next.replace(/(<link rel="preload" as="image"[^>]*>\s*)/i, `$1\n  <script defer src="${coreHref}"></script>`);
  }
  const absoluteHero = `https://one-sliders.com${heroUrl}`;
  if (/<meta property="og:image"/i.test(next)) {
    next = next.replace(/<meta property="og:image" content="[^"]*">/i, `<meta property="og:image" content="${escapeAttr(absoluteHero)}">`);
  } else {
    next = next.replace(/(<meta property="og:title" content="[^"]*">)/i, `$1<meta property="og:image" content="${escapeAttr(absoluteHero)}">`);
  }
  next = next.replace(/"image":"https:\/\/one-sliders\.com\/assets\/icons\/one-sliders-icon\.svg"/g, `"image":"${absoluteHero}"`);
  next = next.replace(/"image":"https:\/\/one-sliders\.com\/content\/locations\/[^"]+"/g, `"image":"${absoluteHero}"`);
  return next;
}

function buildNav({ continentName, countryName, cityName, cityFile }) {
  return `  <nav class="top-menu" aria-label="Location navigation">
    <a class="nav-icon" href="../../../events/index.html" title="Events" aria-label="Events">${svg.calendar}</a>
    <a class="nav-icon active" href="../../../locations/index.html" title="World" aria-label="World">${svg.globe}</a>
    <a class="nav-icon" href="../../../categories/index.html" title="Categories" aria-label="Categories">${svg.grid}</a>
    <span class="nav-divider"></span>
    <a class="nav-back" href="index.html" title="Back to ${escapeAttr(countryName)}" aria-label="Back to ${escapeAttr(countryName)}">${svg.back}<span>${escapeText(countryName)}</span></a>
    <a class="nav-pill" href="../index.html">${escapeText(continentName)}</a>
    <a class="nav-pill" href="index.html">${escapeText(countryName)}</a>
    <a class="nav-pill active" aria-current="page" href="${escapeAttr(cityFile)}">${escapeText(cityName)}</a>
  </nav>`;
}

function buildMain(data) {
  const {
    cityName, countryName, continentName, cityFile, heroUrl, heroText, role,
    facts, events, highlights, siblings, continentSlug,
  } = data;
  const region = factText(facts, 'Region', countryName);
  const population = factText(facts, 'City population', factText(facts, 'Population', 'TBC'));
  const metro = factText(facts, 'Metro population', factText(facts, 'Metro', 'TBC'));
  const landmark = factText(facts, 'Main landmark', 'City centre');
  const roleDisplay = role.toLowerCase().includes(countryName.toLowerCase())
    ? role
    : `${role} in ${countryName}`;
  const timezone = factHtml(facts, 'Time zone', 'Local time');
  const climate = factHtml(facts, 'Climate', 'Seasonal city breaks');
  const transport = factHtml(facts, 'Public transport', 'City transit');
  const area = factHtml(facts, 'Area', 'Urban area');
  const siblingCards = [
    { href: 'index.html', label: 'Country', name: `Open ${countryName}` },
    ...siblings.map((s) => ({ href: s.href, label: 'City', name: `Open ${s.name}` })),
    { href: '../../../locations/index.html', label: 'Browse', name: 'More locations' },
    { href: '../../../categories/index.html', label: 'Topics', name: 'Travel interests' },
  ].slice(0, 6);
  const highlightItems = highlights.length ? highlights : [
    { title: 'City centre', desc: 'Core streets and visitor routes' },
    { title: landmark, desc: 'Signature city sight' },
    { title: 'Routes', desc: 'Transit, day trips and event access' },
  ];
  const eventItems = events.length ? events : [{
    href: '../../../events/index.html',
    title: `${cityName} events`,
    date: '2026 calendar',
    img: `/content/locations/${continentSlug}/img/${continentSlug}-mini.png`,
    alt: `${continentName} thumbnail`,
  }];

  return `  <main class="page-shell country-slide country-content-box">
    <section class="country-brief" aria-label="${escapeAttr(cityName)} one-slide overview">
      <div class="country-brief__copy">
        <div class="country-hero-image country-hero-image--clear" style="--country-hero-url: url('${escapeAttr(heroUrl)}')" aria-hidden="true"></div>
        <img class="flag-badge" src="img/flag.svg" alt="${escapeAttr(countryName)} flag" width="1280" height="640" loading="lazy">
        <p class="kicker">${escapeText(roleDisplay)}</p>
        <h1 class="hero-title">${escapeText(cityName)}</h1>
        <p class="hero-text">${escapeText(heroText)}</p>
        <div class="country-left-stack">
          <div class="country-panel-card country-history-card">
            <h2>City Snapshot</h2>
            <div class="country-history-list">
              <div><time>Place</time><span>${escapeText(cityName)} connects local landmarks, visitor routes and event planning in ${escapeText(countryName)}.</span></div>
              <div><time>Landmark</time><span>${escapeText(landmark)} is the clearest quick-reference sight for this city page.</span></div>
              <div><time>Region</time><span>${escapeText(region)} gives the page its wider route and destination context.</span></div>
              <div><time>Events</time><span>Use the events tab to jump from city context to dated OneSliders event pages.</span></div>
            </div>
          </div>
        </div>
      </div>
      <div class="country-brief__panel">
        <div class="country-kpis">
          <div class="country-kpi"><span>Country</span><strong><a class="value-link" href="index.html">${escapeText(countryName)}</a></strong></div>
          <div class="country-kpi"><span>Population</span><strong>${escapeText(population)}</strong></div>
          <div class="country-kpi"><span>Metro</span><strong>${escapeText(metro)}</strong></div>
          <div class="country-kpi"><span>Known for</span><strong>${escapeText(landmark)}</strong></div>
        </div>
        <section class="persona-tabs" aria-label="Choose ${escapeAttr(cityName)} view">
          <input type="radio" name="${escapeAttr(cityFile.replace(/\.html$/, ''))}-view" id="view-visit" checked>
          <input type="radio" name="${escapeAttr(cityFile.replace(/\.html$/, ''))}-view" id="view-events">
          <input type="radio" name="${escapeAttr(cityFile.replace(/\.html$/, ''))}-view" id="view-context">
          <div class="persona-tablist" role="tablist" aria-label="Choose ${escapeAttr(cityName)} outcome">
            <label for="view-visit" role="tab">Plan a visit</label>
            <label for="view-events" role="tab">Find events</label>
            <label for="view-context" role="tab">Understand ${escapeText(cityName)}</label>
          </div>
          <div class="persona-panel view-panel--visit">
            <div class="country-panel-card country-panel-card--split">
              <div>
                <h2>Short facts</h2>
                <div class="fact-table country-facts-tight">
                  <div class="fact-row"><span>Country</span><strong><a class="value-link" href="index.html">${escapeText(countryName)}</a></strong></div>
                  <div class="fact-row"><span>Region</span><strong>${escapeText(region)}</strong></div>
                  <div class="fact-row"><span>Time zone</span><strong>${timezone}</strong></div>
                  <div class="fact-row"><span>Area</span><strong>${area}</strong></div>
                </div>
              </div>
              <div>
                <h2>Worth seeing</h2>
                <ul class="country-points">
${highlightItems.slice(0, 3).map((item) => `                  <li><strong>${escapeText(item.title)}:</strong> ${escapeText(item.desc)}.</li>`).join('\n')}
                </ul>
              </div>
            </div>
            <div class="country-paths">
${siblingCards.map((item) => `              <a class="country-path" href="${escapeAttr(item.href)}"><span>${escapeText(item.label)}</span><strong>${escapeText(item.name)}</strong></a>`).join('\n')}
            </div>
            <div class="country-panel-card">
              <h2>Planning questions</h2>
              <div class="country-qa-list">
                <div><strong>What is ${escapeText(cityName)} known for?</strong><span>${escapeText(landmark)}, local culture, visitor planning and events.</span></div>
                <div><strong>How should I use this page?</strong><span>Start with the city facts, then jump to linked events or nearby locations.</span></div>
                <div><strong>What should I check before going?</strong><span>${climate}, transport access and the current event calendar.</span></div>
              </div>
            </div>
          </div>
          <div class="persona-panel view-panel--events">
            <div class="country-panel-card">
              <h2>Upcoming events</h2>
              <div class="country-paths country-paths--events" data-expiring-events>
${eventItems.map((event) => `                <a class="visual-topic-card visual-topic-card--music" href="${escapeAttr(event.href)}"><img src="${escapeAttr(event.img)}" alt="${escapeAttr(event.alt)}" loading="lazy" width="400" height="300"><strong>${escapeText(event.title)}</strong><span>${escapeText(event.date)} &middot; ${escapeText(cityName)}</span></a>`).join('\n')}
              </div>
            </div>
          </div>
          <div class="persona-panel view-panel--context">
            <div class="country-panel-card">
              <h2>Known for</h2>
              <div class="country-identity-grid">${[landmark, region, climate, transport, 'Events', countryName].slice(0, 6).map((item) => `<span>${escapeText(stripTags(item))}</span>`).join('')}</div>
            </div>
            <div class="country-paths country-paths--topics">
              <a class="visual-topic-card visual-topic-card--music" href="../../../categories/index.html"><img src="/content/locations/${escapeAttr(continentSlug)}/img/${escapeAttr(continentSlug)}-mini.png" alt="${escapeAttr(continentName)} thumbnail" loading="lazy" width="400" height="300"><strong>Categories</strong><span>Events, themes and practical planning.</span></a>
              <a class="visual-topic-card visual-topic-card--national" href="../index.html"><img src="/content/locations/${escapeAttr(continentSlug)}/img/${escapeAttr(continentSlug)}-mini.png" alt="${escapeAttr(continentName)} thumbnail" loading="lazy" width="400" height="300"><strong>${escapeText(continentName)} outdoors</strong><span>Routes, seasons and nearby places.</span></a>
            </div>
          </div>
        </section>
      </div>
    </section>
  </main>`;
}

const files = walk(locationsRoot).filter(isImmediateCityPage);
let changed = 0;
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const parts = relParts(file);
  const [continentSlug, countrySlug, cityFile] = parts;
  const countryDir = path.dirname(file);
  const continentName = stripTags(matchOne(html, /<a class="nav-pill" href="\.\.\/index\.html">([\s\S]*?)<\/a>/i, toTitle(continentSlug)));
  const countryName = stripTags(matchOne(html, /<a class="nav-back"[^>]*>\s*[\s\S]*?<span>([\s\S]*?)<\/span>/i, toTitle(countrySlug)));
  const cityName = stripTags(matchOne(html, /<h1 class="hero-title">([\s\S]*?)<\/h1>/i, toTitle(cityFile.replace(/\.html$/, ''))));
  const role = stripTags(matchOne(html, /<p class="kicker">([\s\S]*?)<\/p>/i, 'Key city')).replace(/\s+in\s+.+$/i, '');
  const heroText = stripTags(matchOne(html, /<p class="hero-text">([\s\S]*?)<\/p>/i, `${cityName} is a city in ${countryName}, connecting local landmarks, visitor planning and events.`));
  const heroStyle = matchOne(html, /<div class="country-hero-image[^"]*"[^>]*style="([^"]+)"/i)
    || matchOne(html, /<section class="hero-card"([^>]*)>/i);
  const heroUrl = cityHeroUrl(continentSlug, countrySlug, cityFile)
    || (heroStyle ? lastUrlFromStyle(heroStyle, continentSlug) : `/content/locations/${continentSlug}/${countrySlug}/img/${countrySlug}-hero.png`);
  const mainHtml = matchOne(html, /<main[\s\S]*?<\/main>/i, '');
  const facts = extractFacts(mainHtml);
  const events = extractEvents(mainHtml, continentSlug);
  const highlights = extractHighlights(mainHtml);
  const siblings = countrySiblings(countryDir, file);

  let next = replaceHeadBits(html, heroUrl);
  const nav = buildNav({ continentName, countryName, cityName, cityFile });
  const main = buildMain({
    cityName, countryName, continentName, cityFile, heroUrl, heroText, role,
    facts, events, highlights, siblings, continentSlug,
  });
  next = next.replace(/<body[^>]*>[\s\S]*?<\/body>/i, `<body class="country-onepage">\n${nav}\n\n${main}\n\n</body>`);
  next = next.replace(/<footer[\s\S]*?<\/footer>/gi, '');
  if (next !== html) {
    fs.writeFileSync(file, next, 'utf8');
    changed++;
  }
}

console.log(`Migrated ${changed} city pages`);
