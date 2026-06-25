/**
 * build-all-events.mjs
 *
 * Reads events.register.json, maps each event's category/topic to an event type
 * via Templates/events/event-types.json, then assembles an HTML page from
 * Templates/base.html + Templates/partials/hero.html + the right tab partials.
 *
 * Output: content/categories/{category}/{topic}/events/{slug}.html
 *
 * Event types:
 *   edition   – sport events and culture/film, fashion, music with yearly results
 *   recurring – climate, national-day, religion, carnival; shows next date prominently
 *   awards    – culture/awards, technology/awards; category winners history
 */

import fs from 'node:fs';
import path from 'node:path';

const root       = process.cwd();
const isTest      = process.argv.includes('--test');
const slugFilter  = process.argv.find(a => a.startsWith('--slug='))?.split('=')[1]  ?? null;
const topicFilter = process.argv.find(a => a.startsWith('--topic='))?.split('=')[1] ?? null;

const ndWithImagesPath = path.join(root, 'Templates/data/national-days-with-images.json');
const ndWithImages = fs.existsSync(ndWithImagesPath)
  ? new Set(JSON.parse(fs.readFileSync(ndWithImagesPath, 'utf8')))
  : null;
const outRoot    = isTest
  ? path.join(root, 'Templates/test/content')
  : path.join(root, 'content');
const today = new Date();
const currentYear = today.getFullYear();

// ── Paths ──────────────────────────────────────────────────────────────────

const registerPath  = path.join(root, 'events.register.json');
const typemapPath   = path.join(root, 'Templates/events/event-types.json');
const basePath      = path.join(root, 'Templates/base.html');
const heroPath      = path.join(root, 'Templates/partials/hero.html');
const nationalDayTemplatePath = path.join(root, 'Templates/events/event_national_day.template.html');

const partialsDir   = path.join(root, 'Templates/partials/events');
const tabPartials   = {
  stay:         fs.readFileSync(path.join(partialsDir, 'tab-stay.html'),          'utf8'),
  edition:      fs.readFileSync(path.join(partialsDir, 'tab-edition.html'),       'utf8'),
  history:      fs.readFileSync(path.join(partialsDir, 'tab-history-sport.html'), 'utf8'),
  when:         fs.readFileSync(path.join(partialsDir, 'tab-when.html'),          'utf8'),
  about:        fs.readFileSync(path.join(partialsDir, 'tab-about.html'),         'utf8'),
  awards:       fs.readFileSync(path.join(partialsDir, 'tab-awards-history.html'),'utf8'),
  why:          fs.readFileSync(path.join(partialsDir, 'tab-why.html'),           'utf8'),
  food:         fs.readFileSync(path.join(partialsDir, 'tab-food.html'),          'utf8'),
  culture:      fs.readFileSync(path.join(partialsDir, 'tab-culture.html'),       'utf8'),
  stayNd:       fs.readFileSync(path.join(partialsDir, 'tab-stay-nd.html'),       'utf8'),
};

const baseTemplate  = fs.readFileSync(basePath,  'utf8');
const heroTemplate  = fs.readFileSync(heroPath,   'utf8');
const nationalDayTemplate = fs.existsSync(nationalDayTemplatePath)
  ? fs.readFileSync(nationalDayTemplatePath, 'utf8')
  : '';

const ndContentCsvPath  = path.join(root, 'Templates/data/national-days-content.csv');
const ndContentJsonPath = path.join(root, 'Templates/data/national-days-content.json');
const ndContent = fs.existsSync(ndContentCsvPath)
  ? ndCsvToContent(fs.readFileSync(ndContentCsvPath, 'utf8'))
  : fs.existsSync(ndContentJsonPath)
    ? JSON.parse(fs.readFileSync(ndContentJsonPath, 'utf8'))
    : {};

const ndDataPath    = path.join(root, 'scripts/data/national-days.json');
const ndData        = fs.existsSync(ndDataPath)
  ? JSON.parse(fs.readFileSync(ndDataPath, 'utf8'))
  : [];

// ── Data ───────────────────────────────────────────────────────────────────

const register  = JSON.parse(fs.readFileSync(registerPath, 'utf8'));
const typemap   = JSON.parse(fs.readFileSync(typemapPath,  'utf8'));

// ── CSV loader ─────────────────────────────────────────────────────────────

function splitCsvRow(line) {
  const fields = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && !inQ) { inQ = true; continue; }
    if (ch === '"' && inQ)  { if (line[i+1] === '"') { cur += '"'; i++; continue; } inQ = false; continue; }
    if (ch === ',' && !inQ) { fields.push(cur); cur = ''; continue; }
    cur += ch;
  }
  fields.push(cur);
  return fields;
}

function loadCsv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const lines  = fs.readFileSync(filePath, 'utf8').trim().split('\n');
  const header = splitCsvRow(lines[0]);
  const rows   = {};
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvRow(lines[i]);
    const row  = {};
    for (let j = 0; j < header.length; j++) row[header[j]] = cols[j] ?? '';
    const key = row.slug + (row.year ? `:${row.year}` : '');
    rows[key] = row;
  }
  return rows;
}

const dataDir      = path.join(root, 'Templates/data');
const csvContent   = loadCsv(path.join(dataDir, 'events-content.csv'));
const csvHistory   = loadCsv(path.join(dataDir, 'events-history.csv'));

// ── Country → flag path map ────────────────────────────────────────────────

const COUNTRY_FLAG = {
  // Europe
  'albania':               'europe/albania',
  'andorra':               'europe/andorra',
  'armenia':               'europe/armenia',
  'austria':               'europe/austria',
  'azerbaijan':            'europe/azerbaijan',
  'belarus':               'europe/belarus',
  'belgium':               'europe/belgium',
  'bosnia':                'europe/bosnia-and-herzegovina',
  'bulgaria':              'europe/bulgaria',
  'croatia':               'europe/croatia',
  'cyprus':                'europe/cyprus',
  'czechia':               'europe/czechia',
  'czech republic':        'europe/czechia',
  'denmark':               'europe/denmark',
  'england':               'europe/england',
  'estonia':               'europe/estonia',
  'finland':               'europe/finland',
  'france':                'europe/france',
  'germany':               'europe/germany',
  'greece':                'europe/greece',
  'hungary':               'europe/hungary',
  'iceland':               'europe/iceland',
  'ireland':               'europe/ireland',
  'italy':                 'europe/italy',
  'latvia':                'europe/latvia',
  'lithuania':             'europe/lithuania',
  'luxembourg':            'europe/luxembourg',
  'malta':                 'europe/malta',
  'moldova':               'europe/moldova',
  'montenegro':            'europe/montenegro',
  'netherlands':           'europe/netherlands',
  'north macedonia':       'europe/north-macedonia',
  'norway':                'europe/norway',
  'poland':                'europe/poland',
  'portugal':              'europe/portugal',
  'romania':               'europe/romania',
  'russia':                'europe/russia',
  'scotland':              'europe/scotland',
  'serbia':                'europe/serbia',
  'slovakia':              'europe/slovakia',
  'slovenia':              'europe/slovenia',
  'spain':                 'europe/spain',
  'sweden':                'europe/sweden',
  'switzerland':           'europe/switzerland',
  'turkey':                'europe/turkey',
  'vatican city':          'europe/vatican-city',
  'ukraine':               'europe/ukraine',
  'united kingdom':        'europe/united-kingdom',
  'great britain':         'europe/united-kingdom',
  'wales':                 'europe/wales',
  // Americas
  'argentina':             'south-america/argentina',
  'brazil':                'south-america/brazil',
  'chile':                 'south-america/chile',
  'colombia':              'south-america/colombia',
  'canada':                'north-america/canada',
  'cuba':                  'north-america/cuba',
  'mexico':                'north-america/mexico',
  'united states':         'north-america/usa',
  'usa':                   'north-america/usa',
  'us':                    'north-america/usa',
  // Asia
  'australia':             'oceania/australia',
  'new zealand':           'oceania/new-zealand',
  'china':                 'asia/china',
  'india':                 'asia/india',
  'japan':                 'asia/japan',
  'south korea':           'asia/south-korea',
  'kazakhstan':            'asia/kazakhstan',
  'pakistan':              'asia/pakistan',
  'sri lanka':             'asia/sri-lanka',
  // Africa
  'kenya':                 'africa/kenya',
  'ethiopia':              'africa/ethiopia',
  'nigeria':               'africa/nigeria',
  'south africa':          'africa/south-africa',
};

function flagHtml(country) {
  if (!country) return '';
  const slug = COUNTRY_FLAG[country.toLowerCase().trim()];
  if (!slug) return '';
  return `<img class="country-flag" src="/content/locations/${slug}/img/flag.svg" alt="${country}" width="20" height="14" loading="lazy">`;
}

function winnerHtml(winner) {
  const flag = flagHtml(winner);
  if (!flag) return html(winner);
  return `<span class="winner-with-flag">${flag}<span>${html(winner)}</span></span>`;
}

// ── Type resolution ────────────────────────────────────────────────────────

function resolveEventType(category, topic) {
  const exact = typemap[`${category}/${topic}`];
  if (exact) return exact;
  const wildcard = typemap[`${category}/*`];
  if (wildcard) return wildcard;
  return 'edition'; // safe default
}

// ── Tab config per type ────────────────────────────────────────────────────

function tabsForType(type) {
  switch (type) {
    case 'edition':
      return [
        { id: 'tab-edition', label: 'This edition', panelId: 'panel-edition', html: tabPartials.edition },
        { id: 'tab-history', label: 'Past winners',  panelId: 'panel-history', html: tabPartials.history },
        { id: 'tab-stay',    label: 'Stay',          panelId: 'panel-stay',    html: tabPartials.stay },
      ];
    case 'recurring':
      return [
        { id: 'tab-when',  label: 'When',  panelId: 'panel-when',  html: tabPartials.when  },
        { id: 'tab-about', label: 'About', panelId: 'panel-about', html: tabPartials.about },
        { id: 'tab-stay',  label: 'Stay',  panelId: 'panel-stay',  html: tabPartials.stay  },
      ];
    case 'national-day':
      return [
        { id: 'tab-why',     label: '{{ND_LABEL_WHY}}',     panelId: 'panel-why',     html: tabPartials.why     },
        { id: 'tab-food',    label: '{{ND_LABEL_FOOD}}',    panelId: 'panel-food',    html: tabPartials.food    },
        { id: 'tab-culture', label: '{{ND_LABEL_CULTURE}}', panelId: 'panel-culture', html: tabPartials.culture },
        { id: 'tab-stay',    label: 'Where to attend?',     panelId: 'panel-stay',    html: tabPartials.stayNd  },
      ];
    case 'awards':
      return [
        { id: 'tab-awards', label: 'Winners',  panelId: 'panel-awards', html: tabPartials.awards  },
        { id: 'tab-about',  label: 'About',    panelId: 'panel-about',  html: tabPartials.about   },
        { id: 'tab-stay',   label: 'Stay',     panelId: 'panel-stay',   html: tabPartials.stay    },
      ];
    default:
      return [
        { id: 'tab-stay', label: 'Stay', panelId: 'panel-stay', html: tabPartials.stay },
      ];
  }
}

// ── HTML helpers ───────────────────────────────────────────────────────────

function html(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildTabsHtml(tabs) {
  const inputs = tabs
    .map((tab, i) => `<input type="radio" name="event-tab" id="${tab.id}" ${i === 0 ? 'checked' : ''}>`)
    .join('\n  ');

  const labels = tabs
    .map(tab => `<label class="event-tab-label" for="${tab.id}">${tab.label}</label>`)
    .join('\n    ');

  const panels = tabs
    .map(tab => tab.html)
    .join('\n');

  return `<div class="event-tabs">
  ${inputs}
  <div class="event-tablist" role="tablist">
    ${labels}
  </div>
  <div class="event-tab-panels">
${panels}
  </div>
</div>`;
}

function buildHeroHtml(event, heroImg, heroImgWebp, heroAlt, dateBadge = '') {
  return heroTemplate
    .replace(/\{\{HERO_IMG_WEBP\}\}/g, heroImgWebp || heroImg)
    .replace(/\{\{HERO_IMG\}\}/g,      heroImg)
    .replace(/\{\{HERO_ALT\}\}/g,      html(heroAlt))
    .replace(/\{\{TITLE\}\}/g,         html(event.title))
    .replace(/\{\{DATE_BADGE\}\}/g,    dateBadge);
}

// ── Next date helpers ──────────────────────────────────────────────────────

function formatDisplayDate(isoDate) {
  if (!isoDate) return 'TBC';
  const date = new Date(`${isoDate}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return 'TBC';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

// ── Stay partial fill ──────────────────────────────────────────────────────

function fillStayTab(tabHtml, event) {
  const csv   = csvContent[event.slug] || {};
  const city  = csv.stay_city || event.location?.cities?.[0] || event.location?.countries?.[0] || 'the event city';
  const venue = event.location?.venue || 'the venue';
  const bookingUrl = csv.booking_url || '#';

  const areaKeys = ['stay_area_1','stay_area_2','stay_area_3','stay_area_4','stay_area_5'];
  const areaCards = areaKeys
    .map(k => csv[k])
    .filter(Boolean)
    .map(area => `<div class="stay-area-card"><strong>${html(area)}</strong></div>`)
    .join('\n');

  return tabHtml
    .replace(/\{\{EVENT_VENUE\}\}/g,   html(venue))
    .replace(/\{\{EVENT_CITY\}\}/g,    html(city))
    .replace(/\{\{EVENT_NAME\}\}/g,    html(event.title))
    .replace(/\{\{STAY_AREAS\}\}/g,    areaCards || `<!-- stay areas for ${html(event.title)} — fill events-content.csv -->`)
    .replace(/\{\{BOOKING_URL\}\}/g,   bookingUrl);
}

// ── Edition tab fill ───────────────────────────────────────────────────────

function fillEditionTab(tabHtml, event) {
  const csv       = csvContent[event.slug] || {};
  const edYear    = event.currentEdition || currentYear;
  const histYears = Object.keys(csvHistory)
    .filter(k => k.startsWith(`${event.slug}:`))
    .map(k => parseInt(k.split(':')[1]))
    .sort((a, b) => b - a);

  const allYears  = [...new Set([edYear, ...histYears])].sort((a, b) => b - a);
  const yearNav   = allYears
    .map(y => `<a class="year-nav-link${y === edYear ? ' current' : ''}" href="#">${y}</a>`)
    .join('\n');

  const curHist   = csvHistory[`${event.slug}:${edYear}`] || {};
  const facts     = [
    curHist.venue ? `<div class="event-fact"><strong>${html(curHist.venue)}</strong>Venue</div>` : '',
    event.startDate ? `<div class="event-fact"><strong>${html(event.displayDates || event.startDate)}</strong>Dates</div>` : ''
  ].filter(Boolean).join('\n') || `<!-- edition facts for ${html(event.title)} -->`;

  const results   = curHist.winner
    ? `<p class="event-edition-winner">Winner: <strong>${winnerHtml(curHist.winner)}</strong>${curHist.col3_value ? ` · ${html(curHist.col3_value)}` : ''}</p>`
    : `<!-- edition results for ${html(event.title)} ${edYear} — fill events-history.csv -->`;

  return tabHtml
    .replace(/\{\{YEAR_NAV\}\}/g,        yearNav)
    .replace(/\{\{EDITION_FACTS\}\}/g,   facts)
    .replace(/\{\{EDITION_RESULTS\}\}/g, results);
}

// ── When tab fill ──────────────────────────────────────────────────────────

function fillWhenTab(tabHtml, event) {
  const csv          = csvContent[event.slug] || {};
  const nextDate     = formatDisplayDate(event.startDate);
  const nextLocation = [
    event.location?.cities?.[0],
    event.location?.countries?.[0]
  ].filter(Boolean).join(', ') || 'TBC';
  const whenDetails  = csv.when_details
    ? `<p>${html(csv.when_details)}</p>`
    : `<!-- when/format details for ${html(event.title)} — fill events-content.csv -->`;

  return tabHtml
    .replace(/\{\{NEXT_DATE_LABEL\}\}/g,  csv.next_date_label || 'Next date')
    .replace(/\{\{NEXT_DATE\}\}/g,        html(nextDate))
    .replace(/\{\{NEXT_LOCATION\}\}/g,    html(nextLocation))
    .replace(/\{\{WHEN_DETAILS\}\}/g,     whenDetails);
}

// ── About tab fill ─────────────────────────────────────────────────────────

function fillAboutTab(tabHtml, event) {
  const csv       = csvContent[event.slug] || {};
  const aboutText = csv.about_text
    ? csv.about_text.split('\\n').map(p => `<p>${html(p)}</p>`).join('\n')
    : `<!-- about text for ${html(event.title)} — fill events-content.csv -->`;
  const facts     = [
    event.startDate ? `<div class="event-fact"><strong>${html(event.displayDates || event.startDate)}</strong>Date</div>` : '',
    event.location?.countries?.[0] ? `<div class="event-fact"><strong>${html(event.location.countries[0])}</strong>Country</div>` : ''
  ].filter(Boolean).join('\n') || '';
  return tabHtml
    .replace(/\{\{KEY_FACTS\}\}/g,   facts)
    .replace(/\{\{ABOUT_TEXT\}\}/g,  aboutText);
}

// ── Awards tab fill ────────────────────────────────────────────────────────

function fillAwardsTab(tabHtml, event) {
  const csv        = csvContent[event.slug] || {};
  const categories = (csv.awards_categories || '').split('|').map(s => s.trim()).filter(Boolean);
  const picker     = categories.length
    ? categories.map((c, i) => `<button class="awards-category-pill${i === 0 ? ' active' : ''}">${html(c)}</button>`).join('\n')
    : `<!-- category pills for ${html(event.title)} — fill awards_categories in events-content.csv (pipe-separated) -->`;

  const histRows = Object.entries(csvHistory)
    .filter(([k]) => k.startsWith(`${event.slug}:`))
    .sort(([a], [b]) => parseInt(b.split(':')[1]) - parseInt(a.split(':')[1]))
    .filter(([, row]) => row.winner)
    .map(([, row]) => `<div class="awards-year-block"><div class="awards-year-heading">${html(row.year)}</div><div class="awards-winner-row"><span class="awards-winner-category">${html(row.col3_value || 'Winner')}</span><span>${html(row.winner)}</span></div></div>`)
    .join('\n');

  return tabHtml
    .replace(/\{\{AWARDS_CATEGORY_PICKER\}\}/g, picker)
    .replace(/\{\{AWARDS_HISTORY\}\}/g,          histRows || `<!-- winners history for ${html(event.title)} — fill events-history.csv -->`)
    .replace(/\{\{RECORDS\}\}/g,                 '');
}

// ── History tab fill ───────────────────────────────────────────────────────

function fillHistoryTab(tabHtml, event) {
  const csv      = csvContent[event.slug] || {};
  const col3     = csv.history_col3_label || 'Score';
  const histRows = Object.entries(csvHistory)
    .filter(([k]) => k.startsWith(`${event.slug}:`))
    .sort(([a], [b]) => parseInt(b.split(':')[1]) - parseInt(a.split(':')[1]))
    .filter(([, row]) => row.winner)
    .map(([, row]) => `<tr><td>${html(row.year)}</td><td>${winnerHtml(row.winner)}</td><td>${html(row.col3_value)}</td><td>${html(row.venue)}</td></tr>`)
    .join('\n');

  return tabHtml
    .replace(/\{\{HISTORY_COL_3\}\}/g, html(col3))
    .replace(/\{\{HISTORY_ROWS\}\}/g,  histRows || `<!-- history rows for ${html(event.title)} — fill events-history.csv -->`);
}

// ── CSV parser for national-days-content.csv ──────────────────────────────

function parseNdCsv(csvText) {
  if (csvText.charCodeAt(0) === 0xFEFF) csvText = csvText.slice(1);
  const rows = [];
  let row = [], field = '', inQ = false;
  for (let i = 0; i < csvText.length; i++) {
    const c = csvText[i];
    if (inQ) {
      if (c === '"' && csvText[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQ = false;
      else field += c;
    } else {
      if (c === '"') { inQ = true; }
      else if (c === ';') { row.push(field); field = ''; }
      else if (c === '\r' && csvText[i + 1] === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else field += c;
    }
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function ndCsvToContent(csvText) {
  const rows = parseNdCsv(csvText);
  if (rows.length < 2) return {};
  const hdrs = rows[0];
  const content = {};

  for (let r = 1; r < rows.length; r++) {
    const row  = rows[r];
    const g    = col => (row[hdrs.indexOf(col)] ?? '').trim();
    const slug = g('slug');
    if (!slug) continue;

    const listItems = (prefix, nameField, fields, max) => {
      const arr = [];
      for (let i = 1; i <= max; i++) {
        const nameVal = g(`${prefix}${i}_${nameField}`);
        if (!nameVal) break;
        const item = {};
        fields.forEach(f => { const v = g(`${prefix}${i}_${f}`); if (v) item[f] = v; });
        arr.push(item);
      }
      return arr;
    };

    const remapContent = arr => arr.map(x => ({
      name: x.name,
      description: x.desc,
      ...(x.img ? { imageSlug: x.img } : {}),
    }));

    const paras = [];
    for (let i = 1; i <= 4; i++) { const p = g(`why_para${i}`); if (p) paras.push(p); }

    content[slug] = {
      dateText:       g('dateText'),
      country:        g('country'),
      timeline:       listItems('timeline', 'year', ['year', 'label'], 3),
      whyHeading:     g('whyHeading'),
      whyParagraphs:  paras,
      flagHeading:    g('flagHeading'),
      flagText:       g('flagText'),
      foodIntro:      g('foodIntro') || undefined,
      foods:          remapContent(listItems('food', 'name', ['name', 'desc', 'img'], 6)),
      drinks:         remapContent(listItems('drink', 'name', ['name', 'desc', 'img'], 3)),
      cultureHeading: g('cultureHeading'),
      cultureIntro:   g('cultureIntro') || undefined,
      cultureItems:   remapContent(listItems('culture', 'name', ['name', 'desc', 'img'], 4)),
      stayCities:     g('stayCities').split('|').filter(Boolean),
      bookingCountry: g('bookingCountry'),
      bookingUrl:     g('bookingUrl'),
    };
  }
  return content;
}

// ── National day helpers ───────────────────────────────────────────────────

function ndDataForSlug(slug) {
  return ndData.find(d => d.eventSlug === slug) || {};
}

function buildDateBadge(event) {
  const nd       = ndDataForSlug(event.slug);
  const cnt      = ndContent[event.slug] || {};
  const dateText = nd.dateText || cnt.dateText || event.displayDates || '';
  if (!dateText) return '';
  return `<div class="event-date-badge">
    <svg class="event-date-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="4" y="5" width="16" height="15" rx="2"></rect>
      <path d="M8 3v4M16 3v4M4 10h16"></path>
    </svg>
    <div>
      <strong>${html(dateText)}</strong>
    </div>
  </div>`;
}

function buildYearAnchors(event) {
  const nd = ndDataForSlug(event.slug);
  if (!nd.day || !nd.month) return '';
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthName = months[nd.month - 1];
  const years = [2026, 2027, 2028];
  return years.map(y => {
    const d = new Date(y, nd.month - 1, nd.day);
    const weekday = days[d.getDay()];
    return `<li class="event-fact" id="year-${y}"><strong>${y}</strong><span>${nd.day} ${monthName} ${y} · ${weekday}</span></li>`;
  }).join('\n');
}

function fillNationalDayWhy(tabHtml, event) {
  const nd  = ndDataForSlug(event.slug);
  const cnt = ndContent[event.slug] || {};

  const timelineItems = (cnt.timeline || []).map(t =>
    `<li class="event-fact"><strong>${html(t.year)}</strong><span>${html(t.label)}</span></li>`
  ).join('\n') || `<!-- timeline for ${html(event.slug)} -->`;

  const whyHeading = cnt.whyHeading || nd.why?.title || `Why celebrate ${event.title}`;
  const whyBody = cnt.whyParagraphs?.length
    ? cnt.whyParagraphs.map(p => `<p>${html(p)}</p>`).join('\n')
    : nd.why?.text
      ? `<p>${html(nd.why.text)}</p>`
      : `<!-- why text for ${html(event.slug)} -->`;

  const country  = (event.location?.countries?.[0] || '').toLowerCase();
  const flagPath = COUNTRY_FLAG[country];
  const flagVisual = flagPath
    ? `<img src="/content/locations/${flagPath}/img/flag.svg" alt="${html(event.location?.countries?.[0] || '')} flag" width="128" height="80" loading="lazy" style="border-radius:6px;box-shadow:0 0 0 1px color-mix(in srgb,var(--page-line) 80%,transparent)">`
    : `<div class="nd-flag-diagram" aria-hidden="true"><span></span></div>`;

  return tabHtml
    .replace(/\{\{EVENT_NAME\}\}/g,     html(event.title))
    .replace(/\{\{TIMELINE_ITEMS\}\}/g, timelineItems)
    .replace(/\{\{WHY_HEADING\}\}/g,    html(whyHeading))
    .replace(/\{\{WHY_TEXT\}\}/g,       whyBody)
    .replace(/\{\{YEAR_ANCHORS\}\}/g,   buildYearAnchors(event))
    .replace(/\{\{FLAG_HEADING\}\}/g,   html(cnt.flagHeading || `The ${event.location?.countries?.[0] || ''} flag`))
    .replace(/\{\{FLAG_VISUAL\}\}/g,    flagVisual)
    .replace(/\{\{FLAG_TEXT\}\}/g,      html(cnt.flagText || ''));
}

function fillNationalDayFood(tabHtml, event) {
  const cnt     = ndContent[event.slug] || {};
  const slug    = event.slug;
  const imgBase = `/content/categories/${event.category}/${event.topic}/events/img/`;

  const foodCards = (cnt.foods || []).map(f => {
    const imgTag = f.imageSlug
      ? `<img src="${imgBase}${slug}-food-${f.imageSlug}.webp" alt="${html(f.name)}" width="400" height="260" loading="lazy">`
      : '';
    return `<div class="event-food-card">${imgTag}<strong>${html(f.name)}</strong><span>${html(f.description)}</span></div>`;
  }).join('\n') || `<!-- food cards for ${html(slug)} -->`;

  const drinkCards = (cnt.drinks || []).map(d => {
    const imgTag = d.imageSlug
      ? `<img src="${imgBase}${slug}-drink-${d.imageSlug}.webp" alt="${html(d.name)}" width="400" height="260" loading="lazy">`
      : '';
    return `<div>${imgTag}<strong>${html(d.name)}</strong><span>${html(d.description)}</span></div>`;
  }).join('\n') || '';

  const foodIntro   = cnt.foodIntro || `Traditional food on ${cnt.dateText || event.displayDates || 'the day'}`;
  const drinksLabel = `Typical drinks for ${event.title}`;

  return tabHtml
    .replace(/\{\{FOOD_INTRO\}\}/g,   html(foodIntro))
    .replace(/\{\{FOOD_CARDS\}\}/g,   foodCards)
    .replace(/\{\{DRINK_CARDS\}\}/g,  drinkCards)
    .replace(/\{\{DRINKS_LABEL\}\}/g, html(drinksLabel));
}

function fillNationalDayCulture(tabHtml, event) {
  const cnt   = ndContent[event.slug] || {};
  const slug  = event.slug;
  const items = cnt.cultureItems || [];
  const imgBase = `/content/categories/${event.category}/${event.topic}/events/img/`;
  const cards = items.map(c => {
    const imgSlug = c.imageSlug
      ? `${slug}-culture-${c.imageSlug}.webp`
      : null;
    const imgTag  = imgSlug
      ? `<img src="${imgBase}${imgSlug}" alt="${html(c.name)}" width="400" height="260" loading="lazy">`
      : '';
    return `<div class="event-culture-card">${imgTag}<strong>${html(c.name)}</strong><span>${html(c.description)}</span></div>`;
  }).join('\n') || `<!-- culture cards for ${html(slug)} — add to Templates/data/national-days-content.json -->`;

  const heading = cnt.cultureHeading || `${event.location?.countries?.[0] || event.title} traditions`;
  const intro   = cnt.cultureIntro  || '';

  return tabHtml
    .replace(/\{\{CULTURE_HEADING\}\}/g, html(heading))
    .replace(/\{\{CULTURE_INTRO\}\}/g,   html(intro))
    .replace(/\{\{CULTURE_CARDS\}\}/g,   cards);
}

function fillNationalDayStay(tabHtml, event) {
  const cnt      = ndContent[event.slug] || {};
  const nd       = ndDataForSlug(event.slug);
  const country  = cnt.bookingCountry || event.location?.countries?.[0] || 'the country';
  const cities   = cnt.stayCities || [];

  // Checkin = day before, checkout = day after
  const year  = nd.nextYear || (currentYear + 1);
  const month = String(nd.month  || 6).padStart(2, '0');
  const day   = nd.day || 1;
  const pad   = n => String(n).padStart(2, '0');
  const checkinDate  = `${year}-${month}-${pad(day - 1)}`;
  const checkoutDate = `${year}-${month}-${pad(day + 1)}`;

  const areaPills = cities
    .map((c, i) => `<label class="stay-area-pill"><input type="radio" name="stay-region" value="${html(c)}"${i === 0 ? ' checked' : ''}><span>${html(c)}</span></label>`)
    .join('\n      ') || `<!-- stay cities for ${html(event.slug)} -->`;

  // Derive booking base URL: strip from 'ss%3D' onwards
  const rawUrl     = cnt.bookingUrl || '#';
  const baseIdx    = rawUrl.indexOf('ss%3D');
  const bookingBase = baseIdx !== -1 ? rawUrl.slice(0, baseIdx) : rawUrl;

  return tabHtml
    .replace(/\{\{EVENT_NAME\}\}/g,      html(event.title))
    .replace(/\{\{CHECKIN_DATE\}\}/g,    checkinDate)
    .replace(/\{\{CHECKOUT_DATE\}\}/g,   checkoutDate)
    .replace(/\{\{AREA_PILLS\}\}/g,      areaPills)
    .replace(/\{\{BOOKING_BASE\}\}/g,    bookingBase)
    .replace(/\{\{BOOKING_COUNTRY\}\}/g, country);
}

// ── Fill tab partials ──────────────────────────────────────────────────────

function replaceTemplateTokens(template, tokens) {
  return template.replace(/\[\*([A-Z0-9_]+)\*\]/g, (match, key) =>
    Object.hasOwn(tokens, key) ? String(tokens[key]) : match
  );
}

function nationalDayImageBase(event) {
  return `/content/categories/${event.category}/${event.topic}/events/img/`;
}

function nationalDayDates(event) {
  const nd = ndDataForSlug(event.slug);
  const year = nd.nextYear || (currentYear + 1);
  const month = nd.month || 6;
  const day = nd.day || 1;
  const date = new Date(Date.UTC(year, month - 1, day));
  const pad = value => String(value).padStart(2, '0');
  const iso = d => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

  return {
    checkin: iso(new Date(date.getTime() - 86400000)),
    checkout: iso(new Date(date.getTime() + 86400000)),
  };
}

function buildNationalDayTemplateTimeline(cnt) {
  return (cnt.timeline || []).map(t =>
    `<li class="event-fact"><strong>${html(t.year)}</strong><span>${html(t.label)}</span></li>`
  ).join('\n') || `[*TIMELINE_ITEMS*]`;
}

function buildNationalDayTemplateParagraphs(cnt, nd) {
  if (cnt.whyParagraphs?.length) {
    return cnt.whyParagraphs.map(p => `<p>${html(p)}</p>`).join('\n');
  }
  if (nd.why?.text) return `<p>${html(nd.why.text)}</p>`;
  return `[*WHY_PARAGRAPHS*]`;
}

function buildNationalDayTemplateFlag(event, cnt) {
  const country = cnt.country || event.location?.countries?.[0] || '';
  if (country.toLowerCase() === 'sweden') {
    return '<div class="nd-flag-diagram" aria-hidden="true"><span></span></div>';
  }

  const flagPath = COUNTRY_FLAG[country.toLowerCase().trim()];
  if (!flagPath) return `[*FLAG_VISUAL*]`;
  return `<img class="event-country-flag" src="/content/locations/${flagPath}/img/flag.svg" alt="${html(country)} flag" width="128" height="80" loading="lazy">`;
}

function buildNationalDayTemplateCards(event, items, kind, className) {
  const imgBase = nationalDayImageBase(event);
  return (items || []).map(item => {
    const imgTag = item.imageSlug
      ? `<img src="${imgBase}${event.slug}-${kind}-${item.imageSlug}.webp" alt="${html(item.name)}" width="400" height="260" loading="lazy">`
      : '';
    return `<div class="${className}">${imgTag}<strong>${html(item.name)}</strong><span>${html(item.description)}</span></div>`;
  }).join('\n');
}

function buildNationalDayTemplateDrinkCards(event, cnt) {
  const imgBase = nationalDayImageBase(event);
  return (cnt.drinks || []).map(item => {
    const imgTag = item.imageSlug
      ? `<img src="${imgBase}${event.slug}-drink-${item.imageSlug}.webp" alt="${html(item.name)}" width="400" height="260" loading="lazy">`
      : '';
    return `<div>${imgTag}<strong>${html(item.name)}</strong><span>${html(item.description)}</span></div>`;
  }).join('\n') || `[*DRINK_CARDS*]`;
}

function buildNationalDayTemplateAreaPills(cnt) {
  return (cnt.stayCities || [])
    .map((city, i) => `<label class="stay-area-pill"><input type="radio" name="stay-region" value="${html(city)}"${i === 0 ? ' checked' : ''}><span>${html(city)}</span></label>`)
    .join('\n') || `[*AREA_PILLS*]`;
}

function relativeUrl(fromDir, toPath) {
  return path.relative(fromDir, toPath).replace(/\\/g, '/') || '.';
}

function nationalDayRelativePaths(event) {
  const fromDir = path.dirname(outputPath(event));
  const contentDir = isTest ? path.join(root, 'Templates/test/content') : path.join(root, 'content');
  return {
    assets: relativeUrl(fromDir, path.join(root, 'assets')),
    content: relativeUrl(fromDir, contentDir),
    root: relativeUrl(fromDir, root),
  };
}

function assembleNationalDayFromHtmlTemplate(event) {
  const cnt = ndContent[event.slug] || {};
  const nd = ndDataForSlug(event.slug);
  const dateText = nd.dateText || cnt.dateText || event.displayDates || '';
  const nextYear = nd.nextYear || (currentYear + 1);
  const country = cnt.country || event.location?.countries?.[0] || '';
  const dates = nationalDayDates(event);
  const canonical = `${BASE_URL}${canonicalUrl(event)}`;
  let metaTitle = `${event.title} - ${dateText} ${nextYear} guide, food & stays`;
  if (metaTitle.length > 60) metaTitle = `${event.title} - ${dateText} ${nextYear} guide`;
  const metaDesc = `Everything about ${event.title} on ${dateText} - why celebrated, what to eat and where to stay - at a glance.`;
  const rel = nationalDayRelativePaths(event);

  return replaceTemplateTokens(nationalDayTemplate, {
    LANG: 'en',
    LANG_DISPLAY: 'EN',
    LANG_LINKS: '',
    META_TITLE: html(metaTitle),
    META_DESCRIPTION: html(metaDesc),
    CANONICAL_URL: canonical,
    STRUCTURED_DATA: buildStructuredData(event, 'national-day'),
    HERO_WEBP: heroImagePath(event, 'webp'),
    HERO_PNG: heroImagePath(event, 'png'),
    HERO_IMG_400: heroImagePathSized(event, 400),
    HERO_IMG_640: heroImagePathSized(event, 640),
    HERO_IMG_960: heroImagePathSized(event, 960),
    HERO_ALT: html(event.title),
    SLUG: html(event.slug),
    TITLE: html(event.title),
    DATE_TEXT: html(dateText),
    TIMELINE_ITEMS: buildNationalDayTemplateTimeline(cnt),
    WHY_HEADING: html(cnt.whyHeading || nd.why?.title || `Why celebrate ${event.title}`),
    WHY_PARAGRAPHS: buildNationalDayTemplateParagraphs(cnt, nd),
    YEAR_ANCHORS: buildYearAnchors(event) || `[*YEAR_ANCHORS*]`,
    FLAG_HEADING: html(cnt.flagHeading || `The ${country} flag`),
    FLAG_VISUAL: buildNationalDayTemplateFlag(event, cnt),
    FLAG_TEXT: html(cnt.flagText || ''),
    FOOD_INTRO: html(cnt.foodIntro || `Traditional food on ${dateText || event.displayDates || 'the day'}`),
    FOOD_CARDS: buildNationalDayTemplateCards(event, cnt.foods, 'food', 'event-food-card') || `[*FOOD_CARDS*]`,
    DRINK_CARDS: buildNationalDayTemplateDrinkCards(event, cnt),
    COUNTRY: html(country),
    CULTURE_HEADING: html(cnt.cultureHeading || `${country || event.title} traditions`),
    CULTURE_INTRO: html(cnt.cultureIntro || ''),
    CULTURE_CARDS: buildNationalDayTemplateCards(event, cnt.cultureItems, 'culture', 'event-culture-card') || `[*CULTURE_CARDS*]`,
    CHECKIN_DATE: dates.checkin,
    CHECKOUT_DATE: dates.checkout,
    AREA_PILLS: buildNationalDayTemplateAreaPills(cnt),
    BOOKING_URL: html(cnt.bookingUrl || '#'),
    BOOKING_BASE: (function() { const u = cnt.bookingUrl || ''; const i = u.indexOf('ss%3D'); return i !== -1 ? u.slice(0, i) : u; })(),
    BOOKING_COUNTRY: html(country),
    YEAR: String(currentYear),
    NAV_BASE: isTest ? '/Templates/test' : '',
  });
}

function fillTabHtml(tab, event, type) {
  let filled = tab.html;
  if (tab.id === 'tab-stay' && type === 'national-day') filled = fillNationalDayStay(filled, event);
  else if (tab.id === 'tab-stay')    filled = fillStayTab(filled, event);
  if (tab.id === 'tab-why')     filled = fillNationalDayWhy(filled, event);
  if (tab.id === 'tab-food')    filled = fillNationalDayFood(filled, event);
  if (tab.id === 'tab-culture') filled = fillNationalDayCulture(filled, event);
  if (tab.id === 'tab-edition') filled = fillEditionTab(filled, event);
  if (tab.id === 'tab-when')    filled = fillWhenTab(filled, event);
  if (tab.id === 'tab-about')   filled = fillAboutTab(filled, event);
  if (tab.id === 'tab-awards')  filled = fillAwardsTab(filled, event);
  if (tab.id === 'tab-history') filled = fillHistoryTab(filled, event);
  return { ...tab, html: filled };
}

// ── Structured data ────────────────────────────────────────────────────────

const BASE_URL = 'https://one-sliders.com';

function buildStructuredData(event, type) {
  const pageUrl  = `${BASE_URL}${canonicalUrl(event)}`;
  const imgUrl   = `${BASE_URL}${heroImagePath(event, 'webp')}`;
  const catUrl   = `${BASE_URL}/content/categories/${event.category}/index.html`;
  const topicUrl = `${BASE_URL}/content/categories/${event.category}/${event.topic}/index.html`;

  if (type === 'national-day') {
    const graph = [];
    if (event.startDate) {
      graph.push({
        '@type': 'Event',
        '@id': `${pageUrl}#event`,
        'name': event.title,
        'startDate': event.startDate,
        'endDate':   event.endDate || event.startDate,
        'eventStatus': 'https://schema.org/EventScheduled',
        'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
        'location': {
          '@type': 'Place',
          'name': event.location?.countries?.[0] || 'Nationwide',
          'address': { '@type': 'PostalAddress', 'addressCountry': event.location?.countries?.[0] || '' }
        },
        'image': imgUrl,
        'url': pageUrl
      });
    }
    graph.push({
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Culture', 'item': catUrl },
        { '@type': 'ListItem', 'position': 2, 'name': 'National Days', 'item': topicUrl },
        { '@type': 'ListItem', 'position': 3, 'name': event.title, 'item': pageUrl }
      ]
    });
    graph.push({
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      'url': pageUrl,
      'name': event.title,
      'description': `Everything about ${event.title} — why celebrated, what to eat and where to stay.`,
      'image': imgUrl
    });
    return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`;
  }

  const sd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    'name': event.title,
    'startDate': event.startDate || '',
    'endDate':   event.endDate   || ''
  };
  if (event.location?.countries?.[0]) {
    sd.location = { '@type': 'Place', 'name': event.location.cities?.[0] || event.location.countries[0] };
  }
  return `<script type="application/ld+json">\n${JSON.stringify(sd, null, 2).replace(/</g, '\\u003c')}\n</script>`;
}

// ── Hero image paths ───────────────────────────────────────────────────────

function heroImagePath(event, ext = 'png') {
  return `/content/categories/${event.category}/${event.topic}/events/img/${event.slug}-hero.${ext}`;
}

function heroImagePathSized(event, width) {
  return `/content/categories/${event.category}/${event.topic}/events/img/${event.slug}-hero-${width}.webp`;
}

// ── Canonical URL ──────────────────────────────────────────────────────────

function canonicalUrl(event) {
  return `/content/categories/${event.category}/${event.topic}/events/${event.slug}.html`;
}

// ── Assemble full page ─────────────────────────────────────────────────────

function assemblePage(event, type) {
  if (type === 'national-day' && nationalDayTemplate) {
    return assembleNationalDayFromHtmlTemplate(event);
  }

  let tabs = tabsForType(type).map(tab => fillTabHtml(tab, event, type));

  if (type === 'national-day') {
    const cnt      = ndContent[event.slug] || {};
    const nd       = ndDataForSlug(event.slug);
    const dateText = nd.dateText || cnt.dateText || event.displayDates || '';
    const country  = event.location?.countries?.[0] || cnt.bookingCountry || '';
    tabs = tabs.map(tab => ({
      ...tab,
      label: tab.label
        .replace('{{ND_LABEL_WHY}}',     `Why ${dateText}?`)
        .replace('{{ND_LABEL_FOOD}}',    'What to eat &amp; drink')
        .replace('{{ND_LABEL_CULTURE}}', `${country} culture`),
    }));
  }

  const dateBadge = type === 'national-day' ? buildDateBadge(event) : '';
  const heroHtml  = buildHeroHtml(event, heroImagePath(event, 'png'), heroImagePath(event, 'webp'), event.title, dateBadge);
  const tabsHtml  = buildTabsHtml(tabs);
  const sd        = buildStructuredData(event, type);

  let metaTitle, metaDesc, canonical, ogImage, bodyClasses;

  if (type === 'national-day') {
    const nd      = ndDataForSlug(event.slug);
    const cnt     = ndContent[event.slug] || {};
    const dateText = nd.dateText || cnt.dateText || event.displayDates || '';
    const nextYear = nd.nextYear || (currentYear + 1);
    const country  = event.location?.countries?.[0] || '';
    metaTitle = `${event.title} — ${dateText} ${nextYear} guide, food & stays`;
    if (metaTitle.length > 60) metaTitle = `${event.title} — ${dateText} ${nextYear} guide`;
    metaDesc  = `Everything about ${event.title} on ${dateText} — why celebrated, what to eat and where to stay — at a glance.`;
    canonical  = `${BASE_URL}${canonicalUrl(event)}`;
    ogImage    = `${BASE_URL}${heroImagePath(event, 'webp')}`;
    bodyClasses = `national-day onepage--${event.slug}`;
  } else {
    metaTitle = `${event.title} — travel, stays & events guide`;
    metaDesc  = `Plan your trip to ${event.title}. Find out when, where and how to stay.`;
    canonical  = canonicalUrl(event);
    ogImage    = heroImagePath(event, 'webp');
    bodyClasses = '';
  }

  return baseTemplate
    .replace(/\{\{META_TITLE\}\}/g,       html(metaTitle))
    .replace(/\{\{META_DESCRIPTION\}\}/g, html(metaDesc))
    .replace(/\{\{CANONICAL_URL\}\}/g,    canonical)
    .replace(/\{\{STRUCTURED_DATA\}\}/g,  sd)
    .replace(/\{\{OG_IMAGE\}\}/g,         ogImage)
    .replace(/\{\{HERO_IMG_1200\}\}/g,    ogImage)
    .replace(/\{\{LANG\}\}/g,             'en')
    .replace(/\{\{LANG_DISPLAY\}\}/g,     'EN')
    .replace(/\{\{NAV_LANG_LINKS\}\}/g,   '')
    .replace(/\{\{NAV_ACTIVE_WORLD\}\}/g, '')
    .replace(/\{\{NAV_ACTIVE_CATEGORIES\}\}/g, 'active')
    .replace(/\{\{NAV_BACK_HREF\}\}/g,    `/content/categories/${event.category}/${event.topic}/index.html`)
    .replace(/\{\{NAV_BACK_TITLE\}\}/g,   html(type === 'national-day' ? 'National Day' : event.topic))
    .replace(/\{\{NAV_BACK_LABEL\}\}/g,   html(type === 'national-day' ? 'National Day' : event.topic))
    .replace(/\{\{BODY_CLASSES\}\}/g,     bodyClasses)
    .replace(/\{\{LAYOUT_CLASS\}\}/g,     'layout-columns')
    .replace(/\{\{CONTENT_A\}\}/g,        heroHtml)
    .replace(/\{\{CONTENT_B\}\}/g,        tabsHtml)
    .replace(/\{\{YEAR\}\}/g,             String(currentYear));
}

// ── Output path ────────────────────────────────────────────────────────────

function outputPath(event) {
  return path.join(outRoot, 'categories', event.category, event.topic, 'events', `${event.slug}.html`);
}

// ── Events index sync ──────────────────────────────────────────────────────

function makeIndexEntry(event) {
  const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const nd      = ndDataForSlug(event.slug);
  const cnt     = ndContent[event.slug] || {};
  const isNd    = event.topic === 'national-day';
  const month   = isNd ? (nd.month  || 6) : new Date(event.startDate || Date.now()).getUTCMonth() + 1;
  const day     = isNd ? (nd.day    || 1) : new Date(event.startDate || Date.now()).getUTCDate();
  const year    = isNd ? (nd.nextYear || (currentYear + 1)) : new Date(event.startDate || Date.now()).getUTCFullYear();
  const start   = event.startDate || `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  const end     = event.endDate   || start;
  const country = (cnt.country || event.location?.countries?.[0] || '').toLowerCase().replace(/\s+/g, '-');
  const displayLoc = cnt.country || event.location?.countries?.[0] || country;
  const datePart   = `${day} ${MONTHS_SHORT[month - 1]} ${year}`;
  return {
    title:  event.title,
    meta:   `${datePart} - ${displayLoc}`,
    href:   `../categories/${event.category}/${event.topic}/events/${event.slug}.html`,
    image:  isTest
      ? `/content/categories/${event.category}/${event.topic}/events/img/${event.slug}-mini-400.webp`
      : `../categories/${event.category}/${event.topic}/events/img/${event.slug}-mini-400.webp`,
    start,
    end,
    cat:    event.category,
    topic:  event.topic,
    reach:  isNd ? 'national' : (event.reach || 'national'),
    slug:   event.slug,
    cont:   nd.continent || event.location?.continent || 'world',
    country,
  };
}

function updateEventsIndex(builtEvents) {
  const indexPath = path.join(outRoot, 'events', 'index.html');
  if (!fs.existsSync(indexPath)) return;

  let html = fs.readFileSync(indexPath, 'utf8');
  const blobRe = /(id="events-data">)(\[[\s\S]*?\])(<\/script>)/;
  const blobMatch = html.match(blobRe);
  if (!blobMatch) return;

  let entries;

  if (isTest) {
    // In test mode: replace blob with exactly what was built in this run
    entries = builtEvents.map(makeIndexEntry);
    console.log(`events index: rebuilt with ${entries.length} entries from this build`);
  } else {
    // In QA mode: when topicFilter is set, replace all entries for that topic;
    // otherwise append only new slugs to the existing blob.
    const existing = JSON.parse(blobMatch[2]);
    if (topicFilter) {
      const others     = existing.filter(e => e.topic !== topicFilter);
      const newEntries = builtEvents.map(makeIndexEntry);
      entries = [...others, ...newEntries];
      console.log(`events index: replaced ${existing.filter(e => e.topic === topicFilter).length} → ${newEntries.length} entries for '${topicFilter}'`);
    } else {
      const existSlugs = new Set(existing.map(e => e.slug));
      const newEntries = builtEvents.filter(e => !existSlugs.has(e.slug)).map(makeIndexEntry);
      if (!newEntries.length) return;
      entries = [...existing, ...newEntries];
      console.log(`events index: +${newEntries.length} new entries`);
    }
  }

  html = html.replace(blobRe, `$1${JSON.stringify(entries)}$3`);
  fs.writeFileSync(indexPath, html, 'utf8');
}

// ── Main ───────────────────────────────────────────────────────────────────

const events = register.events || [];
let generated = 0;
let skipped   = 0;
const errors  = [];

if (isTest) console.log(`[test mode] output → ${outRoot}`);

const builtEvents = [];

for (const event of events) {
  try {
    if (!event.slug || !event.category || !event.topic) {
      skipped++;
      continue;
    }
    if (slugFilter  && event.slug  !== slugFilter)  { skipped++; continue; }
    if (topicFilter && event.topic !== topicFilter) { skipped++; continue; }
    if (event.topic === 'national-day' && ndWithImages && !ndWithImages.has(event.slug)) { skipped++; continue; }

    const type    = resolveEventType(event.category, event.topic);
    const page    = assemblePage(event, type);
    const outFile = outputPath(event);

    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, page, 'utf8');
    builtEvents.push(event);
    generated++;
  } catch (err) {
    errors.push(`${event.slug}: ${err.message}`);
  }
}

updateEventsIndex(builtEvents);

console.log(`\nbuild-all-events: ${generated} pages generated, ${skipped} skipped.`);
if (errors.length) {
  console.error('\nErrors:');
  for (const e of errors) console.error(' ', e);
  process.exit(1);
}
