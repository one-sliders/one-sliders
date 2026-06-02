import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const categoriesRoot = path.join(root, 'content', 'categories');
const skipParts = new Set(['sport', 'national-day']);
const skipFiles = new Set([
  path.normalize('content/categories/music/song-contests/events/sanremo-music-festival.html')
]);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function posixRel(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function titleCase(value) {
  return String(value || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function decodeEntities(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/â€”/g, '-')
    .replace(/ï¿½/g, "'");
}

function stripHtml(value) {
  return decodeEntities(String(value || '').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function sentence(value, fallback) {
  const clean = stripHtml(value).replace(/\s+/g, ' ').trim();
  if (!clean) return fallback;
  return clean.length > 190 ? `${clean.slice(0, 187).replace(/\s+\S*$/, '')}...` : clean;
}

function extractJson(html, id) {
  const match = html.match(new RegExp(`<script[^>]+id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/script>`, 'i'));
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function extractMeta(html, name) {
  const quoted = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${quoted}["'][^>]+content=["']([^"']*)["']`, 'i'));
  return match ? decodeEntities(match[1]) : '';
}

function absFrom(file, href) {
  if (!href) return '';
  if (/^https?:\/\//i.test(href)) return href;
  if (href.startsWith('/')) return href;
  const base = `/${posixRel(path.dirname(file))}`;
  return path.posix.normalize(`${base}/${href}`);
}

function countryChip(file, country) {
  if (!country || !country.name) return 'TBC';
  const name = escapeHtml(country.name);
  const href = absFrom(file, country.url || '');
  const flag = absFrom(file, country.flag || '');
  if (!href || country.name === 'Global') return href ? `<a href="${escapeHtml(href)}">${name}</a>` : name;
  const flagHtml = flag ? `<img src="${escapeHtml(flag)}" alt="" width="20" height="14" loading="lazy">` : '';
  return `<a class="country" href="${escapeHtml(href)}">${flagHtml}${name}</a>`;
}

function htmlToCountrySafe(file, value) {
  let output = String(value || '');
  output = output.replace(/href="([^"]+)"/g, (_, href) => `href="${escapeHtml(absFrom(file, href))}"`);
  output = output.replace(/src="([^"]+)"/g, (_, src) => `src="${escapeHtml(absFrom(file, src))}"`);
  return output;
}

function currentEdition(data) {
  const editions = Array.isArray(data?.editions) ? data.editions : [];
  return editions.find((e) => e.year === data.defaultYear)
    || editions.find((e) => e.status === 'upcoming')
    || editions[editions.length - 1]
    || {};
}

function navIcon(type) {
  if (type === 'calendar') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
  if (type === 'globe') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>';
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>';
}

function buildPage(file, html) {
  const rel = posixRel(file);
  const parts = rel.split('/');
  const eventSlug = path.basename(file, '.html');
  const categorySlug = parts[2] || 'categories';
  const topicSlug = parts[3] || categorySlug;
  const categoryName = titleCase(categorySlug);
  const topicName = titleCase(topicSlug);
  const data = extractJson(html, 'event-year-data') || {};
  const partData = extractJson(html, 'event-part-data') || {};
  const edition = currentEdition(data);
  const eventName = data.eventName || titleCase(eventSlug);
  const year = data.defaultYear || edition.year || '';
  const country = Array.isArray(edition.countries) ? edition.countries[0] : null;
  const city = Array.isArray(edition.cities) && edition.cities[0] ? edition.cities[0].name : '';
  const venue = edition.venue || 'TBC';
  const dates = edition.dates || (year ? `${year} date TBC` : 'Date TBC');
  const format = edition.format || `${topicName} guide`;
  const status = edition.statusLabel || edition.status || 'Guide';
  const description = extractMeta(html, 'description') || `${eventName} guide for ${categoryName} / ${topicName}.`;
  const lede = sentence(edition.result || description, `${eventName} is an evergreen ${topicName.toLowerCase()} event guide with current planning details in one place.`);
  const hero = `/content/categories/${parts.slice(2, -1).join('/')}/img/${eventSlug}-hero.png`.replace('/events/img/', '/events/img/');
  const heroPath = `/content/categories/${parts.slice(2, parts.length - 1).join('/')}/img/${eventSlug}-hero.png`;
  const miniPath = `/content/categories/${parts.slice(2, parts.length - 1).join('/')}/img/${eventSlug}-mini.png`;
  const canonical = `https://one-sliders.com/${rel}`;
  const topicHref = `/content/categories/${categorySlug}/${topicSlug}.html`;
  const categoryHref = `/content/categories/${categorySlug}/index.html`;
  const eventHref = `/content/categories/${parts.slice(2).join('/')}`;
  const countryHtml = countryChip(file, country);
  const whereValue = [venue, city].filter(Boolean).join(', ') || 'TBC';
  const watchQuestion = (edition.questions || []).find((q) => /watch|stream|broadcast|shown/i.test(q.q || q.a || q.detail || ''));
  const ticketQuestion = (edition.questions || []).find((q) => /ticket|buy/i.test(q.q || q.a || q.detail || ''));
  const transportQuestion = (edition.questions || []).find((q) => /get there|transport|travel/i.test(q.q || q.a || q.detail || ''));
  const stayQuestion = (edition.questions || []).find((q) => /stay|hotel|accommodation/i.test(q.q || q.a || q.detail || ''));
  const programmeQuestion = (edition.questions || []).find((q) => /program|programme|schedule/i.test(q.q || q.a || q.detail || ''));
  const highlights = (edition.highlights || []).slice(0, 3);
  const sourceLinks = (data.sources || []).slice(0, 3).map((s) => s.url && s.url !== '#'
    ? `<a class="value-link" href="${escapeHtml(absFrom(file, s.url))}">${escapeHtml(s.label || 'Source')}</a>`
    : escapeHtml(s.label || 'Source')).join(', ');
  const partsList = Array.isArray(partData.parts) ? partData.parts : [];
  const partsSummary = partsList.slice(0, 3).map((p) => `<div><strong>${escapeHtml(p.title || p.label || 'Part')}</strong><span>${escapeHtml(sentence(p.summary || p.detail || '', 'Use official updates for this part.'))}</span></div>`).join('');
  const calendarFile = path.join(path.dirname(file), `${eventSlug}.ics`);
  const calendarButton = fs.existsSync(calendarFile)
    ? `<div class="country-actions"><a class="country-action" href="${escapeHtml(eventHref.replace(/\.html$/, '.ics'))}" download>Add to calendar</a></div>`
    : '';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': 'https://one-sliders.com/#organization', name: 'OneSliders', url: 'https://one-sliders.com/', logo: 'https://one-sliders.com/assets/icons/one-sliders-icon.svg' },
      { '@type': 'WebSite', '@id': 'https://one-sliders.com/#website', url: 'https://one-sliders.com/', name: 'OneSliders', publisher: { '@id': 'https://one-sliders.com/#organization' } },
      { '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: `${eventName}${year ? ` ${year}` : ''} - Dates, Schedule & Guide`, description, inLanguage: 'en', image: `https://one-sliders.com${heroPath}`, isPartOf: { '@id': 'https://one-sliders.com/#website' }, publisher: { '@id': 'https://one-sliders.com/#organization' } }
    ]
  };

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/assets/css/oneslider-core.css">
  <link rel="stylesheet" href="/assets/css/locations.css?v=event-onepage-20260602">
  <link rel="preload" as="image" href="${escapeHtml(heroPath)}">
  <link rel="icon" href="/assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="/assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="/assets/icons/site.webmanifest">
  <link rel="canonical" href="${escapeHtml(canonical)}"><meta name="content-language" content="en">
  <meta name="description" content="${escapeHtml(description)}">
  <meta property="og:title" content="${escapeHtml(`${eventName}${year ? ` ${year}` : ''} - Dates, Schedule & Guide`)}">
  <meta property="og:image" content="https://one-sliders.com${escapeHtml(heroPath)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="https://one-sliders.com${escapeHtml(heroPath)}">
  <title>${escapeHtml(`${eventName}${year ? ` ${year}` : ''} - Dates, Schedule & Guide`)}</title><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:type" content="website">
  <script defer src="/assets/js/oneslider-core.js"></script>
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body class="country-onepage event-layout-page">
  <nav class="top-menu" aria-label="Event navigation">
    <a class="nav-icon" href="/content/events/index.html" title="Events" aria-label="Events">${navIcon('calendar')}</a>
    <a class="nav-icon" href="/content/locations/index.html" title="World" aria-label="World">${navIcon('globe')}</a>
    <a class="nav-icon active" href="/content/categories/index.html" title="Categories" aria-label="Categories">${navIcon('grid')}</a>
    <span class="nav-divider"></span>
    <a class="nav-pill" href="${escapeHtml(categoryHref)}">${escapeHtml(categoryName)}</a>
    <a class="nav-pill" href="${escapeHtml(topicHref)}">${escapeHtml(topicName)}</a>
    <a class="nav-pill active" aria-current="page" href="${escapeHtml(eventHref)}">${escapeHtml(eventName)}</a>
  </nav>
  <main class="page-shell country-slide country-content-box">
    <section class="country-brief" aria-label="${escapeHtml(eventName)} overview">
      <div class="country-brief__copy">
        <div class="country-hero-image" style="--country-hero-url: url('${escapeHtml(heroPath)}')" aria-hidden="true"></div>
        <h1 class="hero-title">${escapeHtml(eventName)}</h1>
        <p class="hero-text">${escapeHtml(lede)}</p>
        <div class="country-left-stack">
          <div class="country-panel-card">
            <h2>Overview</h2>
            <div class="country-qa-list">
              <div><strong>${escapeHtml(topicName)} event</strong><span>${escapeHtml(`${eventName} is tracked as an evergreen guide with current planning details kept separate from the general overview.`)}</span></div>
              <div><strong>Format</strong><span>${escapeHtml(format)}</span></div>
              <div><strong>Why follow it</strong><span>${escapeHtml(sentence(edition.result || edition.countdownText || description, 'Use this page for dates, venue, programme and visitor context.'))}</span></div>
            </div>
          </div>
        </div>
      </div>
      <div class="country-brief__panel">
        <div class="country-kpis">
          <div class="country-kpi"><span>Country</span><strong>${countryHtml}</strong></div>
          <div class="country-kpi"><span>City</span><strong>${escapeHtml(city || 'TBC')}</strong></div>
          <div class="country-kpi"><span>Venue</span><strong>${escapeHtml(venue)}</strong></div>
          <div class="country-kpi"><span>Timing</span><strong>${escapeHtml(dates)}</strong></div>
        </div>
        <section class="edition-tabs edition-tabs--static" aria-label="Choose ${escapeHtml(eventName)} guide section">
          <input class="edition-tab-input" type="radio" name="event-section" id="event-tab-week" checked>
          <input class="edition-tab-input" type="radio" name="event-section" id="event-tab-trip">
          <input class="edition-tab-input" type="radio" name="event-section" id="event-tab-watch">
          <div class="edition-tablist" role="tablist" aria-label="${escapeHtml(eventName)} sections">
            <label class="edition-tab" for="event-tab-week" role="tab">Event week</label>
            <label class="edition-tab" for="event-tab-trip" role="tab">Plan visit</label>
            <label class="edition-tab" for="event-tab-watch" role="tab">Watch</label>
          </div>
          <div class="edition-tab-panels">
            <div class="edition-tab-panel" data-edition-tab-panel="event">
              <div class="country-panel-card country-panel-card--split">
                <div>
                  <h2>Event week</h2>
                  <div class="fact-table country-facts-tight">
                    <div class="fact-row"><span>Where</span><strong>${escapeHtml(whereValue)}</strong></div>
                    <div class="fact-row"><span>Dates</span><strong>${escapeHtml(dates)}</strong></div>
                    <div class="fact-row"><span>Status</span><strong>${escapeHtml(status)}</strong></div>
                    <div class="fact-row"><span>Format</span><strong>${escapeHtml(format)}</strong></div>
                  </div>
                  ${calendarButton}
                </div>
                <div>
                  <h2>What to follow</h2>
                  <ul class="country-points">
                    <li><strong>Programme:</strong> ${escapeHtml(sentence(programmeQuestion?.a || programmeQuestion?.detail || 'Watch for official schedule updates before the event opens.', 'Watch for official schedule updates.'))}</li>
                    <li><strong>Tickets:</strong> ${escapeHtml(sentence(ticketQuestion?.a || ticketQuestion?.detail || 'Use official channels and check access rules close to the event.', 'Use official channels.'))}</li>
                    <li><strong>Updates:</strong> ${escapeHtml(sentence(edition.countdownText || 'Edition details can change as the organiser publishes the final programme.', 'Edition details can change.'))}</li>
                  </ul>
                </div>
              </div>
              <div class="country-panel-card country-panel-card--split">
                <div>
                  <h2>Key context</h2>
                  <div class="country-qa-list">
                    ${(highlights.length ? highlights : [{ title: 'Current edition', detail: `${dates} is the working edition timing.` }, { title: 'Planning note', detail: 'Check official updates before booking travel.' }]).map((h) => `<div><strong>${escapeHtml(h.title || h.label || 'Note')}</strong><span>${escapeHtml(sentence(h.detail || h.result || '', 'Details TBC.'))}</span></div>`).join('')}
                  </div>
                </div>
                <div>
                  <h2>Visitor note</h2>
                  <div class="country-qa-list">
                    <div><strong>Before you go</strong><span>${escapeHtml(sentence(transportQuestion?.detail || transportQuestion?.a || 'Check venue access, local transport and opening times close to the event.', 'Check venue access and local transport.'))}</span></div>
                    <div><strong>Stay flexible</strong><span>${escapeHtml(sentence(stayQuestion?.detail || stayQuestion?.a || 'Hotels, restaurants and entry rules can change by edition and city.', 'Hotels and entry rules can change.'))}</span></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="edition-tab-panel" data-edition-tab-panel="trip">
              <div class="country-panel-card">
                <h2>Plan the trip</h2>
                <div class="country-qa-list">
                  <div><strong>Where should I stay?</strong><span>${escapeHtml(sentence(stayQuestion?.a || stayQuestion?.detail || `Use ${city || 'the host city'} as the first base, then compare nearby areas once the venue is confirmed.`, 'Use the host city as the first base.'))}</span></div>
                  <div><strong>How do I get there?</strong><span>${escapeHtml(sentence(transportQuestion?.a || transportQuestion?.detail || 'Check local transport, event access notes and arrival buffers before booking.', 'Check local transport and arrival buffers.'))}</span></div>
                  <div><strong>What should I book early?</strong><span>${escapeHtml(sentence(ticketQuestion?.detail || ticketQuestion?.a || 'Tickets, central accommodation and timed-entry experiences are usually the first things to verify.', 'Tickets and central accommodation.'))}</span></div>
                  <div><strong>What can change?</strong><span>${escapeHtml(sentence(edition.countdownText || 'Dates, venue access and programme details should be verified from official sources.', 'Verify official dates and venue access.'))}</span></div>
                </div>
              </div>
            </div>
            <div class="edition-tab-panel" data-edition-tab-panel="watch">
              <div class="country-panel-card country-panel-card--split">
                <div>
                  <h2>Watch from home</h2>
                  <div class="country-qa-list">
                    <div><strong>Where is it shown?</strong><span>${escapeHtml(sentence(watchQuestion?.a || watchQuestion?.detail || 'Use official event channels for streaming, broadcast or recap links.', 'Use official event channels.'))}</span></div>
                    <div><strong>When should I check?</strong><span>${escapeHtml(programmeQuestion ? 'Check when the official programme is published.' : 'Check close to the event window for confirmed timings.')}</span></div>
                  </div>
                </div>
                <div>
                  <h2>Quick answers</h2>
                  <div class="country-qa-list">
                    <div><strong>Current edition</strong><span>${escapeHtml(year || 'TBC')}</span></div>
                    <div><strong>Main location</strong><span>${escapeHtml([city, stripHtml(country?.name || '')].filter(Boolean).join(', ') || 'TBC')}</span></div>
                    ${partsSummary ? `<div><strong>Named parts</strong><span>${escapeHtml(partsList.map((p) => p.label || p.title).filter(Boolean).slice(0, 3).join(', '))}</span></div>` : ''}
                  </div>
                </div>
              </div>
              ${partsSummary ? `<div class="country-panel-card"><h2>Programme parts</h2><div class="country-qa-list">${partsSummary}</div></div>` : ''}
              ${sourceLinks ? `<div class="country-panel-card"><h2>Sources</h2><p class="country-note">${sourceLinks}</p></div>` : ''}
            </div>
          </div>
        </section>
      </div>
    </section>
  </main>
</body>
</html>
`;
}

const files = walk(categoriesRoot)
  .filter((file) => posixRel(file).includes('/events/'))
  .filter((file) => !skipFiles.has(path.normalize(posixRel(file))))
  .filter((file) => {
    const rel = posixRel(file);
    const parts = rel.split('/');
    return !parts.some((part) => skipParts.has(part));
  });

let changed = 0;
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const next = `${buildPage(file, html).split(/\r?\n/).map((line) => line.replace(/[ \t]+$/g, '')).join('\n').trimEnd()}\n`;
  if (html !== next) {
    fs.writeFileSync(file, next, 'utf8');
    changed += 1;
  }
}

console.log(`Migrated ${changed} non-sport, non-national-day event pages.`);
