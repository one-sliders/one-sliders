import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DEV_ROOT = path.join(ROOT, 'Dev');

const args = new Set(process.argv.slice(2));
const testMode = args.has('--test');
const writeDev = !testMode && (args.has('--dev') || !args.has('--prod'));
const slugFilter = process.argv.find((arg) => arg.startsWith('--slug='))?.split('=')[1] ?? null;
const CONTENT_BASE = '/content';
const CSS_BASE = '/assets/css';

const siteConfig = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/config.json'), 'utf8'));
const BOOKING_BASE = siteConfig.affiliate.booking.links['hotels-default']
  + '?url=https%3A%2F%2Fwww.booking.com%2Fsearchresults.html%3F';

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function json(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function mergeVisuals(cards, visuals = []) {
  return cards.map((card, index) => ({ ...card, ...(visuals[index] ?? {}) }));
}

function statStrip(stats = []) {
  if (!stats.length) return '';
  return `<div class="event-stat-strip">${stats.map(([label, value]) => {
    const renderedValue = value && typeof value === 'object' && value.html ? String(value.value ?? '') : esc(value);
    return `<div><span>${esc(label)}</span><strong>${renderedValue}</strong></div>`;
  }).join('')}</div>`;
}

function textDateInput(id, value = '') {
  const attr = value ? ` value="${esc(value)}"` : '';
  return `<input type="text" id="${esc(id)}" class="stay-field-input" inputmode="numeric" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" placeholder="yyyy-mm-dd"${attr}>`;
}

function uniqueList(values = []) {
  return [...new Set(values.map((value) => String(value ?? '').trim()).filter(Boolean))];
}

function cardHtml(card) {
  const classes = ['event-card'];
  const rawTitle = card.htmlTitle ? String(card.title ?? '') : esc(card.title);
  const title = card.href ? `<a href="${esc(card.href)}">${rawTitle}</a>` : rawTitle;
  return `<div class="${classes.join(' ')}"><span>${esc(card.label)}</span><strong>${title}</strong><p>${card.html ? card.detail : esc(card.detail)}</p></div>`;
}

function eventInsight(rowEvent) {
  if (rowEvent.slug !== 'world-glacier-day') return '';
  return `<div class="event-graph-card">
    <div class="event-graph-card__head">
      <span>Glacier loss</span>
      <strong>Global reference glaciers have lost more than 30 m w.e. since 1950</strong>
    </div>
    <div class="event-loss-graph" aria-label="Glacier mass-loss rate has accelerated from less than 100 gigatonnes per year in 1976 to 1995, around 230 gigatonnes per year in 1996 to 2015, and around 390 gigatonnes per year in 2016 to 2025.">
      <div class="event-loss-bar event-loss-bar--low"><i></i><span>1976-1995</span><strong>&lt;100 Gt/yr</strong></div>
      <div class="event-loss-bar event-loss-bar--mid"><i></i><span>1996-2015</span><strong>~230 Gt/yr</strong></div>
      <div class="event-loss-bar event-loss-bar--high"><i></i><span>2016-2025</span><strong>~390 Gt/yr</strong></div>
    </div>
    <p>WGMS reports total glacier mass loss since 1975 of 9,583 +/- 1,211 Gt, equivalent to 26.4 +/- 3.3 mm of sea-level rise.</p>
  </div>`;
}

function country({ name, href, flag }) {
  const img = flag ? `<img src="${flag}" alt="" width="20" height="14" loading="lazy">` : '';
  return `<a class="country" href="${href}">${img}${esc(name)}</a>`;
}

function countrySlugFromName(name) {
  const normalized = String(name || '').trim().toLowerCase();
  const aliases = {
    'united states': 'usa',
    'usa': 'usa',
    'us': 'usa',
    'united kingdom': 'united-kingdom',
    'uk': 'united-kingdom',
  };
  return aliases[normalized] || normalized
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function countryLinkByName(name) {
  const label = String(name || '').trim();
  if (!label) return '';
  const slug = countrySlugFromName(label);
  const locationsRoot = path.join(ROOT, 'content', 'locations');
  if (!fs.existsSync(locationsRoot)) return esc(label);
  for (const continent of fs.readdirSync(locationsRoot, { withFileTypes: true })) {
    if (!continent.isDirectory()) continue;
    const countryDir = path.join(locationsRoot, continent.name, slug);
    const page = path.join(countryDir, 'index.html');
    const flag = path.join(countryDir, 'img', 'flag.svg');
    if (!fs.existsSync(page) || !fs.existsSync(flag)) continue;
    const href = `/content/locations/${continent.name}/${slug}/index.html`;
    const flagHref = `/content/locations/${continent.name}/${slug}/img/flag.svg`;
    return country({ name: label, href, flag: flagHref });
  }
  return esc(label);
}

function placeWithCountry(location, countryName) {
  const place = String(location || '').trim();
  const linkedCountry = countryLinkByName(countryName);
  if (!place) return linkedCountry;
  if (!countryName) return esc(place);
  const label = String(countryName).trim();
  const escapedPlace = esc(place);
  if (place.toLowerCase().includes(label.toLowerCase())) {
    const pattern = new RegExp(`\\b${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return escapedPlace.replace(pattern, linkedCountry);
  }
  return `${esc(place)}, ${linkedCountry}`;
}

function linkCountryInPlace(value) {
  const text = String(value || '').trim();
  const { country: countryName } = splitLocationParts(text);
  if (!countryName) return esc(text);
  return placeWithCountry(text, countryName);
}

function nav({ topicLabel = 'Protected Nature', topicHref = `${CONTENT_BASE}/categories/climate/protected-nature.html` } = {}) {
  return `<nav class="top-menu" aria-label="Site navigation">
    <a class="os-brand" href="/" aria-label="Home"><img class="os-brand__logo" src="/assets/icons/one-sliders-icon.svg" alt="" width="22" height="22" aria-hidden="true"><span class="os-brand__text">OneSliders</span></a>
    <a class="nav-icon" href="${CONTENT_BASE}/events/index.html" title="Events" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></a>
    <a class="nav-icon" href="${CONTENT_BASE}/locations/index.html" title="World" aria-label="World"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></a>
    <a class="nav-icon active" href="${CONTENT_BASE}/categories/index.html" title="Categories" aria-label="Categories" aria-current="page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg></a>
    <span class="nav-divider"></span><a class="nav-back" href="${topicHref}" title="${esc(topicLabel)}" aria-label="Back to ${esc(topicLabel)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg><span>${esc(topicLabel)}</span></a>
    <span class="nav-spacer"></span>
    <details class="nav-language"><summary aria-label="Language">EN</summary><div class="nav-language__list"><a href="#" aria-current="page">EN</a></div></details>
  </nav>`;
}

const countries = {
  argentina: {
    name: 'Argentina',
    href: '/content/locations/south-america/argentina/index.html',
    flag: '/content/locations/south-america/argentina/img/flag.svg'
  },
  bolivia: {
    name: 'Bolivia',
    href: '/content/locations/south-america/bolivia/index.html',
    flag: '/content/locations/south-america/bolivia/img/flag.svg'
  },
  france: {
    name: 'France',
    href: '/content/locations/europe/france/index.html',
    flag: '/content/locations/europe/france/img/flag.svg'
  },
  nepal: {
    name: 'Nepal',
    href: '/content/locations/asia/nepal/index.html',
    flag: '/content/locations/asia/nepal/img/flag.svg'
  },
  tanzania: {
    name: 'Tanzania',
    href: '/content/locations/africa/tanzania/index.html',
    flag: '/content/locations/africa/tanzania/img/flag.svg'
  },
  usa: {
    name: 'United States',
    href: '/content/locations/north-america/usa/index.html',
    flag: '/content/locations/north-america/usa/img/flag.svg'
  },
  canada: {
    name: 'Canada',
    href: '/content/locations/north-america/canada/index.html',
    flag: '/content/locations/north-america/canada/img/flag.svg'
  }
};

const topicLabels = {
  'ice-and-glaciers': 'Ice and Glaciers',
  marine: 'Marine',
  'protected-nature': 'Protected Nature',
  sustainability: 'Sustainability',
  weather: 'Weather'
};

const climateTopicImages = {
  'ice-and-glaciers': '/content/categories/climate/img/ice-and-glaciers-mini.png',
  marine: '/content/categories/climate/img/marine-mini.png',
  'protected-nature': '/content/categories/climate/img/protected-nature-mini.png',
  sustainability: '/content/categories/climate/img/sustainability-mini.png',
  weather: '/content/categories/climate/img/weather-mini.png'
};

const climateDetails = {
  'world-glacier-day': {
    kicker: 'UN observance',
    overviewTitle: 'Cryosphere loss is now a water, risk and policy issue',
    summary: 'The cryosphere stores around 70% of Earthâ€™s freshwater, but glaciers, ice sheets, permafrost, sea ice and snow are shrinking fast. World Glacier Day exists because this loss now affects water security, ecosystems, infrastructure and disaster risk worldwide.',
    cards: [
      {
        label: 'UN response',
        title: '21 March became World Day for Glaciers',
        detail: 'The United Nations designated 21 March as World Day for Glaciers and proclaimed 2025 as the International Year of Glaciersâ€™ Preservation.'
      },
      {
        label: 'Science decade',
        title: '2025-2034 focuses on cryospheric sciences',
        detail: 'The Decade of Action for Cryospheric Sciences is led by UNESCO to strengthen research, monitoring, education and policy action on cryospheric change.'
      },
      {
        label: '2026 context',
        title: 'UNESCO closes IYGP 2025 and opens the next phase',
        detail: 'The 2026 UNESCO Headquarters celebrations close IYGP 2025, present outcomes and introduce the first governance and action architecture of the Decade.'
      }
    ],
    moreInfoTitle: 'What to follow on 21 March',
    moreInfoCards: [
      {
        label: 'Linked date',
        title: 'World Water Day follows on 22 March 2026',
        detail: 'The 2026 programme connects glacier preservation with World Water Day high-level sessions focused on water, women and gender equality.'
      },
      {
        label: 'Side events',
        title: 'Partners add sessions around the UN programme',
        detail: 'The official programme is paired with partner-led side events, making the day a coordination point for science, education and policy action.'
      }
    ]
  },
  'world-reef-day': {
    kicker: 'Coral reef awareness',
    overviewTitle: 'What World Reef Day is for',
    summary: 'World Reef Day is a June 1 awareness day for coral reefs, ocean health and everyday choices that reduce pressure on reef ecosystems.',
    cards: [
      {
        label: 'Purpose',
        title: 'Turn reef concern into action',
        detail: 'The official campaign frames June 1 as a call to action for consumers, businesses and organizations to protect coral reefs through education and engagement.'
      },
      {
        label: 'What happens',
        title: 'Reef-safe choices, cleanups and education',
        detail: 'Past campaign material has focused on beach cleanups, reef-safe products, sea turtle protection, plastic reduction and coral restoration groups.'
      },
      {
        label: 'Why follow it',
        title: 'Reefs are fragile ocean infrastructure',
        detail: 'Coral reefs support marine life, coastal communities and tourism, but they are highly exposed to warming seas, pollution and damaging consumer choices.'
      },
      {
        label: 'Who it is for',
        title: 'Divers, coastal visitors and ocean-minded brands',
        detail: 'The day is useful for anyone planning reef travel, selling ocean-related products, teaching marine conservation or choosing reef-safer habits.'
      }
    ],
    moreInfoTitle: 'What to follow on 1 June',
    moreInfoCards: [
      {
        label: 'Campaign lens',
        title: 'Education and engagement',
        detail: 'Look for toolkit material, reef-safe guidance, partner posts and local ocean or beach actions around the start of World Oceans Month.'
      },
      {
        label: 'Practical takeaway',
        title: 'Check your own reef impact',
        detail: 'The most useful angle is practical: sunscreen, plastics, beach behaviour, tourism operators and support for groups restoring or monitoring reefs.'
      }
    ]
  },
  'earth-day': {
    kicker: 'Global action day',
    overviewTitle: 'Why Earth Day still matters',
    summary: 'Earth Day is the modern environmental movementâ€™s biggest annual public-action date, linking education, campaigns, cleanups, demonstrations and local projects around 22 April.',
    cards: [
      {
        label: 'Origin',
        title: 'First held in 1970',
        detail: 'EARTHDAY.ORG traces Earth Day back to 22 April 1970 and describes it as a movement that now mobilizes more than a billion people annually.'
      },
      {
        label: 'What happens',
        title: 'Events, cleanups, education and campaigns',
        detail: 'People use the day for community cleanups, school material, climate education, tree planting, civic actions, rallies and local environmental events.'
      },
      {
        label: 'Why follow it',
        title: 'It shows where public attention is moving',
        detail: 'The annual theme and event map are useful signals for the environmental issues likely to dominate schools, cities, NGOs and public campaigns that year.'
      },
      {
        label: 'Who runs it',
        title: 'EARTHDAY.ORG and local organizers',
        detail: 'The global campaign provides toolkits, event listings and action ideas; local groups decide what happens on the ground.'
      }
    ],
    moreInfoTitle: 'What to use on Earth Day',
    moreInfoCards: [
      {
        label: 'Find action',
        title: 'Use the event map and toolkits',
        detail: 'The official site publishes event listings, take-action pages, educational material, toolkits and campaign updates.'
      },
      {
        label: 'Best use',
        title: 'Pick one concrete local action',
        detail: 'For most people, the practical value is finding a cleanup, school activity, campaign resource or local organization to join.'
      }
    ]
  },
  'world-environment-day': {
    kicker: 'UNEP-led global day',
    overviewTitle: 'What World Environment Day does',
    summary: 'World Environment Day is the United Nations Environment Programmeâ€™s annual June 5 platform for environmental outreach, public participation and a yearly campaign theme.',
    cards: [
      {
        label: 'Scale',
        title: 'UNEPâ€™s largest public environment platform',
        detail: 'UNEP describes World Environment Day as the biggest international day for the environment, celebrated by millions of people worldwide.'
      },
      {
        label: 'What happens',
        title: 'A host, a theme and global participation',
        detail: 'Each edition uses an official campaign site for the host, theme, featured updates and participation material.'
      },
      {
        label: 'Why follow it',
        title: 'The theme sets the yearâ€™s public focus',
        detail: 'The annual focus helps explain which environmental issue governments, schools, NGOs and campaigns will amplify around 5 June.'
      },
      {
        label: 'Who leads it',
        title: 'United Nations Environment Programme',
        detail: 'UNEP leads the global observance, while countries, cities, schools and organizations create their own activities.'
      }
    ],
    moreInfoTitle: 'What to check before 5 June',
    moreInfoCards: [
      {
        label: 'Campaign site',
        title: 'Host, theme and participation updates',
        detail: 'Use the official campaign website for the current yearâ€™s host country, theme, featured actions and public materials.'
      },
      {
        label: 'Local angle',
        title: 'Look for city and school events',
        detail: 'World Environment Day is often most useful locally: talks, cleanups, education, policy announcements and public environmental campaigns.'
      }
    ]
  },
  'wildfire-community-preparedness-day': {
    kicker: 'Preparedness campaign',
    overviewTitle: 'What Wildfire Community Preparedness Day is for',
    summary: 'Wildfire Community Preparedness Day is an annual North American campaign for reducing wildfire risk before peak fire season through local, practical mitigation work.',
    cards: [
      {
        label: 'Purpose',
        title: 'Reduce risk before fire season',
        detail: 'The day encourages communities to work on home ignition zones, defensible space, local readiness and shared wildfire-risk reduction.'
      },
      {
        label: 'What happens',
        title: 'Neighbourhood projects and safety checks',
        detail: 'Typical work includes clearing debris, reviewing evacuation readiness, improving defensible space and coordinating with local fire or emergency agencies.'
      },
      {
        label: 'Why follow it',
        title: 'It turns wildfire concern into a checklist',
        detail: 'For residents in fire-prone areas, this is less a ceremony and more a prompt to do work that can lower risk before conditions get worse.'
      },
      {
        label: 'Who it is for',
        title: 'Households, HOAs and local leaders',
        detail: 'The event is especially relevant to homeowners, neighbourhood associations, fire departments, emergency managers and community volunteers.'
      }
    ],
    moreInfoTitle: 'What to do before the day',
    moreInfoCards: [
      {
        label: 'Start local',
        title: 'Check your fire agency guidance',
        detail: 'Use official local fire guidance first, because vegetation, building rules, evacuation routes and risk windows vary by region.'
      },
      {
        label: 'Practical focus',
        title: 'Pick a visible mitigation task',
        detail: 'The page should help people choose a concrete task: clearing gutters, moving flammable material, reviewing alerts or organizing a community workday.'
      }
    ]
  },
  'world-meteorological-day': {
    kicker: 'WMO observance',
    overviewTitle: 'Why World Meteorological Day matters',
    summary: 'World Meteorological Day marks the WMO Convention and explains why weather, climate and water services matter for public safety, planning and daily life.',
    cards: [
      {
        label: 'Origin',
        title: '23 March 1950',
        detail: 'WMO says the day commemorates the Convention establishing the World Meteorological Organization, which came into force on 23 March 1950.'
      },
      {
        label: 'What happens',
        title: 'A yearly weather, climate or water theme',
        detail: 'The annual theme highlights a current issue and showcases the contribution of national meteorological and hydrological services.'
      },
      {
        label: 'Why follow it',
        title: 'Forecasts are public infrastructure',
        detail: 'The day is useful for understanding warnings, observation networks, climate services and the agencies that turn data into public safety information.'
      },
      {
        label: '2026 theme',
        title: 'Observing today, protecting tomorrow',
        detail: 'WMO lists the 2026 theme as â€œObserving today, protecting tomorrowâ€.'
      }
    ],
    moreInfoTitle: 'What to follow on 23 March',
    moreInfoCards: [
      {
        label: 'Official campaign',
        title: 'Theme and WMO material',
        detail: 'Use the WMO campaign page for the annual theme, official background and links to previous World Meteorological Day pages.'
      },
      {
        label: 'Local lens',
        title: 'Your national weather service',
        detail: 'For practical relevance, connect the global theme to your own meteorological service: warnings, climate normals, water data and preparedness messages.'
      }
    ]
  }
};

const climateVisuals = {
  'world-glacier-day': {
    stats: [
      ['Focus', 'Cryosphere'],
      ['Use', 'Science + action'],
      ['Lead', 'UN-Glaciers'],
      ['Audience', 'Schools + cities']
    ],
    cards: [
      { metric: '21 Mar', meter: 86 },
      { metric: 'UN', meter: 72 },
      { metric: 'Water', meter: 92 },
      { metric: 'UNESCO / WMO', meter: 78 }
    ],
    moreInfoCards: [
      { metric: 'Campaign', meter: 74 },
      { metric: 'Action', meter: 88 }
    ]
  },
  'world-reef-day': {
    stats: [
      ['Focus', 'Coral reefs'],
      ['Use', 'Habits + cleanups'],
      ['Season', 'World Oceans Month'],
      ['Audience', 'Coastal visitors']
    ],
    cards: [
      { metric: '1 Jun', meter: 84 },
      { metric: 'Cleanups', meter: 70 },
      { metric: 'Reefs', meter: 94 },
      { metric: 'Divers + visitors', meter: 76 }
    ],
    moreInfoCards: [
      { metric: 'Toolkit', meter: 64 },
      { metric: 'Personal impact', meter: 90 }
    ]
  },
  'earth-day': {
    stats: [
      ['Started', '1970'],
      ['Reach', '1B+ people'],
      ['Use', 'Local action'],
      ['Format', 'Campaign + events']
    ],
    cards: [
      { metric: '1970', meter: 95 },
      { metric: '1B+', meter: 98 },
      { metric: 'Theme', meter: 72 },
      { metric: 'Local groups', meter: 86 }
    ],
    moreInfoCards: [
      { metric: 'Map', meter: 80 },
      { metric: 'One action', meter: 90 }
    ]
  },
  'world-environment-day': {
    stats: [
      ['Lead', 'UNEP'],
      ['Format', 'Host + theme'],
      ['Use', 'Public action'],
      ['Audience', 'Cities + schools']
    ],
    cards: [
      { metric: '5 Jun', meter: 84 },
      { metric: 'Host', meter: 78 },
      { metric: 'Theme', meter: 88 },
      { metric: 'UNEP', meter: 92 }
    ],
    moreInfoCards: [
      { metric: 'Host', meter: 76 },
      { metric: 'Local events', meter: 82 }
    ]
  },
  'wildfire-community-preparedness-day': {
    stats: [
      ['Focus', 'Home ignition zone'],
      ['Scale', 'Local'],
      ['Use', 'Risk reduction'],
      ['Audience', 'Neighbourhoods']
    ],
    cards: [
      { metric: 'Before season', meter: 92 },
      { metric: 'Checklist', meter: 88 },
      { metric: 'Mitigation', meter: 94 },
      { metric: 'Neighbours', meter: 76 }
    ],
    moreInfoCards: [
      { metric: 'Local agency', meter: 82 },
      { metric: 'Visible task', meter: 90 }
    ]
  },
  'world-meteorological-day': {
    stats: [
      ['Started', '1950'],
      ['Lead', 'WMO'],
      ['Use', 'Warnings + data'],
      ['Audience', 'Weather services']
    ],
    cards: [
      { metric: '1950', meter: 95 },
      { metric: 'Theme', meter: 76 },
      { metric: 'Forecasts', meter: 92 },
      { metric: '2026 theme', meter: 70 }
    ],
    moreInfoCards: [
      { metric: 'WMO', meter: 80 },
      { metric: 'Local service', meter: 86 }
    ]
  }
};

function parseDelimited(line, sep = ';') {
  const out = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (ch === sep && !quoted) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function readClimateRows() {
  const csvPath = path.join(ROOT, 'Templates', 'data', 'event-analysis.csv');
  const rows = fs.readFileSync(csvPath, 'utf8').split(/\r?\n/).filter(Boolean);
  const headers = parseDelimited(rows.shift() ?? '').map((header) => header.replace(/^\uFEFF/, ''));
  return rows
    .map((row) => Object.fromEntries(parseDelimited(row).map((value, index) => [headers[index], value])))
    .filter((row) => row.category === 'climate');
}

function displayDateToIso(displayDate) {
  const normalized = String(displayDate ?? '').trim().toLowerCase();
  const fixed = normalized.match(/^(\d{1,2})-([a-z]{3})-(\d{2}|\d{4})$/);
  if (fixed) {
    const monthMap = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
    const year = fixed[3].length === 2 ? `20${fixed[3]}` : fixed[3];
    return `${year}-${monthMap[fixed[2]]}-${fixed[1].padStart(2, '0')}`;
  }
  const long = normalized.match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/);
  if (long) {
    const monthMap = {
      january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
      july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
    };
    return `${long[3]}-${monthMap[long[2]]}-${long[1].padStart(2, '0')}`;
  }
  return '';
}

function displayDateLabel(displayDate) {
  const iso = displayDateToIso(displayDate);
  if (!iso) return String(displayDate ?? '');
  const date = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}

function statusLabel(value) {
  const labels = {
    confirmed_recurring_fixed: 'Confirmed annual fixed date',
    confirmed_recurring_official: 'Confirmed by official source'
  };
  const normalized = String(value ?? '').trim();
  return labels[normalized] ?? normalized.replace(/_/g, ' ');
}

function sourceLinks(sourceValue) {
  return String(sourceValue ?? '')
    .split('|')
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => ({ label: new URL(url).hostname.replace(/^www\./, ''), url }));
}

function locationHtml(value) {
  const text = String(value ?? '').trim();
  if (text === 'United States / Canada') {
    return `${country(countries.usa)} <span aria-hidden="true">/</span> ${country(countries.canada)}`;
  }
  return esc(text);
}

const event = {
  name: 'World Ranger Day',
  slug: 'world-ranger-day',
  category: 'climate',
  topic: 'protected-nature',
  topicLabel: 'Protected Nature',
  topicHref: '/content/categories/climate/protected-nature.html',
  canonicalPath: '/content/categories/climate/protected-nature/events/world-ranger-day.html',
  sourceImageRoot: '/content/categories/climate/protected-nature/events/img',
  description: 'World Ranger Day is the annual July 31 observance led by the International Ranger Federation to remember rangers killed or injured in the line of duty and to celebrate the people protecting natural and cultural heritage.',
  intro: 'World Ranger Day is a global observance for the people who protect parks, reserves, wildlife and cultural landscapes. The 2026 edition falls on 31 July and marks 20 years of World Ranger Day, with the theme "Rangers: Guardians of a Changing Planet". This page keeps the evergreen story, the current edition, practical ways to follow the day and recent ranger-community milestones in one fast carousel.',
  facts: [
    ['Founded', '2006'],
    ['Format size', 'Worldwide observance']
  ],
  history: 'World Ranger Day began as an International Ranger Federation initiative and is promoted with The Thin Green Line. It remembers rangers killed or injured in service and gives ranger associations, parks, agencies and communities one shared date to publish tributes, education materials and local activities.',
  format: 'There is no single venue, ticketed gate or winner. Ranger associations, protected-area agencies and conservation groups use the day for memorials, public talks, ranger stories, school activities, fundraising and campaign toolkits. In 2026 the IRF is framing the day around rangers working through climate extremes, biodiversity loss, human-wildlife conflict and wildlife crime.',
  records: 'The fixed date is the record that matters: 31 July every year. The 2026 edition is also the 20-year marker for World Ranger Day, according to the IRF.',
  congressHosts: [
    ['2027', 'Puerto Iguazu', countries.argentina, 'forthcoming World Ranger Congress'],
    ['2024', 'Hyeres', countries.france, '10th World Ranger Congress'],
    ['2019', 'Chitwan', countries.nepal, '9th World Ranger Congress'],
    ['2016', 'Estes Park, Colorado', countries.usa, '8th World Ranger Congress'],
    ['2012', 'Arusha', countries.tanzania, '7th World Ranger Congress'],
    ['2009', 'Santa Cruz', countries.bolivia, '6th World Ranger Congress']
  ],
  moments: [
    '31 July is used worldwide for both remembrance and public celebration of ranger work.',
    'The 2026 theme is "Rangers: Guardians of a Changing Planet".',
    'The 2026 toolkit is scheduled by IRF for 15 July 2026.',
    'The day highlights state-employed rangers, Indigenous guardians, community rangers, volunteers and privately managed-area personnel.'
  ],
  sources: [
    { label: 'International Ranger Federation: World Ranger Day', url: 'https://www.internationalrangers.org/world-ranger-day/' },
    { label: 'International Ranger Federation', url: 'https://www.internationalrangers.org/' },
    { label: 'International Ranger Federation overview: World Ranger Congress list', url: 'https://en.wikipedia.org/wiki/International_Ranger_Federation' }
  ]
};

const editions = [2026, 2025, 2024, 2023, 2022, 2021].map((year) => {
  const isCurrent = year === 2026;
  return {
    year,
    headingPlace: 'worldwide',
    status: isCurrent ? 'upcoming' : 'past',
    statusLabel: isCurrent ? 'Scheduled' : 'Past observance',
    startDate: `${year}-07-31`,
    endExclusive: `${year}-08-01`,
    nextDate: `${year + 1}-07-31`,
    dates: `31 July ${year}`,
    countryFact: '<a class="country" href="/content/locations/index.html">Worldwide</a>',
    countries: [],
    cities: [{ name: 'Worldwide' }],
    venue: 'Worldwide observance',
    format: 'Memorials, ranger stories, public activities and campaign resources',
    resultLabel: isCurrent ? '' : 'Edition follow-up',
    result: isCurrent ? '' : `World Ranger Day ${year} was observed worldwide on 31 July.`,
    countdownLabel: isCurrent ? 'Event starts' : 'Next edition starts',
    countdownText: isCurrent
      ? 'The 2026 edition starts on 31 July 2026. IRF says the 2026 toolkit is scheduled for 15 July 2026.'
      : `This edition was observed on 31 July ${year}; the next annual observance follows on 31 July ${year + 1}.`,
    calendarDescription: `World Ranger Day ${year}: annual observance for remembering rangers killed or injured in the line of duty and celebrating ranger work worldwide.`,
    questions: isCurrent ? [
      {
        q: 'When is the event?',
        a: '31 July 2026',
        detail: 'World Ranger Day is fixed on 31 July every year.'
      },
      {
        q: 'Where is it held?',
        a: 'Worldwide',
        detail: 'There is no single host city. Ranger associations, parks, agencies and conservation groups mark the day locally and online.'
      },
      {
        q: 'How do I get there?',
        a: 'Start with your local park, reserve or ranger association',
        detail: 'For in-person activities, check the protected area or ranger association nearest you. The global page is a signpost; local organisers decide access, routes and times.'
      },
      {
        q: 'Where should I stay?',
        a: 'Not normally a travel-first event',
        detail: 'Most activities are local observances or online campaigns. Only book travel if a specific protected area or organisation publishes an event you plan to attend.'
      },
      {
        q: 'How do I buy tickets?',
        a: 'Most observances are free or locally managed',
        detail: 'Use the organiser page for a specific park, talk, fundraiser or memorial. Do not assume a central World Ranger Day ticket office exists.'
      },
      {
        q: 'What does it cost?',
        a: 'Usually free to follow; donations are separate',
        detail: 'Some local venues may charge normal park entry. Donations or fundraisers should be checked through official ranger or conservation organisations.'
      },
      {
        q: 'What is the program?',
        a: '2026 toolkit: scheduled for 15 July 2026',
        detail: 'IRF says the 2026 toolkit will include resources, messaging guidance and materials for amplifying ranger voices globally.'
      },
      {
        q: 'Who is participating?',
        a: 'Rangers and protected-area workers worldwide',
        detail: 'IRF describes the workforce broadly: state-employed personnel, Indigenous peoples, community and voluntary guardians, and staff of privately managed areas.'
      },
      {
        q: 'What should I pack?',
        a: 'If attending outdoors: water, sun/rain gear and respect for local rules',
        detail: 'Protected-area events can involve trails, visitor centres or memorial spaces. Follow the organiser instructions rather than treating it as a festival.'
      },
      {
        q: 'Are there age limits or rules?',
        a: 'Set locally',
        detail: 'Family activities may be open to all ages; patrol talks, memorials or reserve visits may have site-specific safety rules.'
      },
      {
        q: 'Is it safe to go?',
        a: 'Use official local guidance',
        detail: 'Ranger work can involve fire management, wildlife, law enforcement and remote terrain. Public events should state visitor-safe areas and boundaries.'
      },
      {
        q: 'Can I watch online?',
        a: 'Yes, through official and partner channels',
        detail: 'Follow the IRF page and local ranger associations for toolkits, videos, messages and social posts around 31 July.'
      },
      {
        q: 'What happened last edition / what is new this year?',
        a: '2026 marks 20 years of World Ranger Day',
        detail: 'The 2026 theme is "Rangers: Guardians of a Changing Planet", focusing on ranger work in a rapidly changing conservation context.'
      },
      {
        q: 'How can I contribute?',
        a: 'Share verified messages, attend local events or support ranger organisations',
        detail: 'Use official campaign materials when they are published, and check charity or donation links before giving.'
      }
    ] : [
      {
        q: 'Final follow-up',
        a: `Observed on 31 July ${year}`,
        detail: 'World Ranger Day is an annual observance, so this edition now functions as archive context.'
      },
      {
        q: 'Actual program as played',
        a: 'Local and online observances',
        detail: 'Specific activity lists vary by ranger association, protected area and conservation partner.'
      },
      {
        q: 'Lessons / trivia from this edition',
        a: 'Use official archive materials',
        detail: 'The IRF page links previous World Ranger Day information and resources for selected recent years.'
      }
    ],
    highlights: isCurrent ? [
      { label: 'Theme', title: 'Rangers: Guardians of a Changing Planet', detail: 'The 2026 theme links ranger work to climate extremes, biodiversity loss, human-wildlife conflict, wildlife crime and changing social conditions.' },
      { label: 'Toolkit', title: 'Scheduled for 15 July 2026', detail: 'IRF says the 2026 toolkit will provide messaging and materials for the global campaign.' }
    ] : [
      { label: 'Archive', title: `31 July ${year}`, detail: `The ${year} edition is kept here as one of the last five observable editions for the year switcher.` }
    ]
  };
});

function yearData() {
  return {
    eventName: event.name,
    slug: event.slug,
    defaultYear: 2026,
    hashOnlyYearNavigation: true,
    hideEditionCountryFact: false,
    sources: event.sources,
    editions
  };
}

function renderPage({ imageRoot, canonicalPath }) {
  const hero = `${imageRoot}/${event.slug}-hero.png`;
  const topicImage = '/content/categories/climate/img/protected-nature-mini.png';
  const hostRows = event.congressHosts.map(([year, cityName, c, note]) => `<tr><th>${year}</th><td>${esc(cityName)}</td><td>${country(c)}</td><td>${esc(note)}</td></tr>`).join('');
  const factCards = event.facts.map(([label, value]) => `<div class="fact"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('');
  const kpis = event.facts.map(([label, value]) => `<div class="event-kpi"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('');
  const moments = event.moments.map((item) => `<li>${esc(item)}</li>`).join('');
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Event',
        name: 'World Ranger Day 2026',
        startDate: '2026-07-31',
        endDate: '2026-08-01',
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
        image: `https://one-sliders.com${event.sourceImageRoot}/${event.slug}-hero.png`,
        description: event.description,
        location: { '@type': 'VirtualLocation', url: 'https://www.internationalrangers.org/world-ranger-day/' },
        organizer: { '@type': 'Organization', name: 'International Ranger Federation', url: 'https://www.internationalrangers.org/' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Events', item: 'https://one-sliders.com/content/events/index.html' },
          { '@type': 'ListItem', position: 2, name: 'Climate', item: 'https://one-sliders.com/content/categories/climate/index.html' },
          { '@type': 'ListItem', position: 3, name: 'Protected Nature', item: 'https://one-sliders.com/content/categories/climate/protected-nature.html' },
          { '@type': 'ListItem', position: 4, name: 'World Ranger Day', item: `https://one-sliders.com${event.canonicalPath}` }
        ]
      }
    ]
  };

  return `<!doctype html>
<html lang="en">
<head>
  <link rel="stylesheet" href="/assets/css/oneslider-core.css">
  <script defer src="/assets/js/oneslider-core.js"></script>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="os-back-href" content="${CONTENT_BASE}/categories/climate/protected-nature.html">
  <meta name="os-back-label" content="Protected Nature">
  <meta name="os-page-title" content="World Ranger Day">
  <link rel="icon" href="/assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="/assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="/assets/icons/site.webmanifest">
  <link rel="stylesheet" href="${CSS_BASE}/colors.css">
  <link rel="stylesheet" href="${CSS_BASE}/shapes.css">
  <link rel="stylesheet" href="${CSS_BASE}/typography.css">
  <link rel="stylesheet" href="${CSS_BASE}/event-v2.css">
  <link rel="stylesheet" href="${CSS_BASE}/event-overview.css">
  <link rel="stylesheet" href="${CSS_BASE}/event-left-column.css">
  <link id="palette-css" rel="stylesheet" href="/assets/css/palettes/oneslider-palette-harmonized.css">
  <link rel="canonical" href="https://one-sliders.com${canonicalPath}">
  <meta name="description" content="World Ranger Day 2026: date, theme, toolkit timing, ways to follow and ranger context for the annual 31 July observance.">
  <meta property="og:title" content="World Ranger Day 2026 - Date, Theme &amp; How to Follow">
  <meta property="og:description" content="World Ranger Day is observed worldwide on 31 July. The 2026 theme is Rangers: Guardians of a Changing Planet.">
  <meta property="og:image" content="https://one-sliders.com${event.sourceImageRoot}/${event.slug}-hero.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="https://one-sliders.com${event.canonicalPath}">
  <meta name="twitter:card" content="summary_large_image">
  <title>World Ranger Day 2026 - Date, Theme &amp; How to Follow</title>
  <script type="application/json" id="event-year-data">${json(yearData())}</script>
  <script type="application/ld+json">${json(schema)}</script>
</head>
<body class="event-dashboard onepage country-onepage" data-cat="climate">
  ${nav({ topicLabel: event.topicLabel, topicHref: event.topicHref })}
  <main class="page-shell page-content page-frame">
    <div class="layout-columns">
      <div class="layout__a">
        <div class="hero">
          <picture class="hero__image">
            <source srcset="${imageRoot}/${event.slug}-hero-400.webp 400w, ${imageRoot}/${event.slug}-hero-768.webp 768w, ${imageRoot}/${event.slug}-hero-1200.webp 1200w" sizes="(max-width: 860px) 100vw, 42vw" type="image/webp">
            <img src="${hero}" alt="Ranger walking through protected nature landscape" width="1200" height="630" loading="eager" decoding="async">
          </picture>
          <div class="hero__title-row">
            <p class="event-kicker">Climate / Protected Nature</p>
            <h1 class="hero__title">World Ranger Day 2026</h1>
            <p class="hero__text">${esc(event.intro)}</p>
          </div>
          <div class="event-kpis">${kpis}</div>
          <a class="event-topic-card" href="${event.topicHref}">
            <img src="${topicImage}" alt="Protected nature landscape" width="400" height="300" loading="lazy">
            <div class="event-topic-card__body"><span>Related climate topic</span><strong>Protected Nature topic</strong><p>Parks, reserves, conservation areas and event listings.</p></div>
          </a>
        </div>
      </div>
      <div class="layout__b">
        <section class="event-panel event-panel--single" id="overview" aria-labelledby="overview-title">
          <p class="event-section-kicker">Overview</p>
          <p id="overview-title" class="event-panel-title">What World Ranger Day is</p>
          <p>${esc(event.description)}</p>
          <div class="event-grid">
            ${[
              { label: 'History', metric: '2007', title: 'Remembrance and recognition', detail: event.history, meter: 86 },
              { label: 'Format', metric: 'Global', title: 'No single host city', detail: event.format, meter: 78 },
              { label: 'Support', metric: 'Local', title: 'Use official campaign materials', detail: 'Follow IRF or a named local ranger association for campaign resources and public activities.', meter: 74 }
            ].map(cardHtml).join('')}
          </div>
        </section>
      </div>
    </div>
  </main>
</body>
</html>`;
}

function climateRowToEvent(row) {
  const topicLabel = topicLabels[row.topic] ?? row.topic.replace(/-/g, ' ');
  const sources = sourceLinks(row.source);
  return {
    name: row.title,
    slug: row.slug,
    category: row.category,
    topic: row.topic,
    topicLabel,
    topicHref: `${CONTENT_BASE}/categories/climate/${row.topic}.html`,
    canonicalPath: `/content/categories/climate/${row.topic}/events/${row.slug}.html`,
    sourceImageRoot: `/content/categories/climate/${row.topic}/events/img`,
    displayDate: row.display_dates,
    displayDateLabel: displayDateLabel(row.display_dates),
    startDate: displayDateToIso(row.display_dates),
    location: row.location,
    countryValue: row.country,
    description: row.about_text,
    whenDetails: row.when_details,
    dateStatus: row.date_status,
    dateStatusLabel: statusLabel(row.date_status),
    sources
  };
}

function renderClimatePage(rowEvent) {
  const imageRoot = rowEvent.sourceImageRoot;
  const hero = `${imageRoot}/${rowEvent.slug}-hero.png`;
  const topicImage = climateTopicImages[rowEvent.topic] ?? `${imageRoot}/${rowEvent.slug}-mini.png`;
  const detail = climateDetails[rowEvent.slug] ?? null;
  const visual = climateVisuals[rowEvent.slug] ?? {};
  const overviewTitle = detail?.overviewTitle ?? rowEvent.name;
  const overviewSummary = detail?.summary ?? rowEvent.description;
  const overviewCards = mergeVisuals(detail?.cards ?? [
    { label: 'When', title: rowEvent.displayDateLabel, detail: rowEvent.whenDetails },
    { label: 'Where', title: locationHtml(rowEvent.location), detail: locationHtml(rowEvent.countryValue), html: true },
    { label: 'Verification', title: rowEvent.dateStatusLabel, detail: 'Use the organiser page for the latest date, venue and access updates before making plans.' }
  ], visual.cards);
  const moreInfoCards = mergeVisuals(detail?.moreInfoCards ?? [
    { label: 'Related topic', title: rowEvent.topicLabel, detail: 'Use the topic page for nearby climate events and background context.', href: rowEvent.topicHref }
  ], visual.moreInfoCards);
  const factCards = [
    ['Next date', rowEvent.displayDateLabel],
    ['Location', rowEvent.location]
  ].filter(([, value]) => value).map(([label, value]) => `<div class="event-kpi"><span>${esc(label)}</span><strong>${label === 'Location' ? locationHtml(value) : esc(value)}</strong></div>`).join('');
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: rowEvent.name,
    startDate: rowEvent.startDate || undefined,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    image: `https://one-sliders.com${imageRoot}/${rowEvent.slug}-hero.png`,
    description: rowEvent.description,
    location: { '@type': 'Place', name: rowEvent.location || 'Worldwide' },
    url: `https://one-sliders.com${rowEvent.canonicalPath}`
  };

  return `<!doctype html>
<html lang="en">
<head>
  <link rel="stylesheet" href="/assets/css/oneslider-core.css">
  <script defer src="/assets/js/oneslider-core.js"></script>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="os-back-href" content="${rowEvent.topicHref}">
  <meta name="os-back-label" content="${esc(rowEvent.topicLabel)}">
  <meta name="os-page-title" content="${esc(rowEvent.name)}">
  <link rel="icon" href="/assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="/assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="/assets/icons/site.webmanifest">
  <link rel="stylesheet" href="${CSS_BASE}/colors.css">
  <link rel="stylesheet" href="${CSS_BASE}/shapes.css">
  <link rel="stylesheet" href="${CSS_BASE}/typography.css">
  <link rel="stylesheet" href="${CSS_BASE}/event-v2.css">
  <link rel="stylesheet" href="${CSS_BASE}/event-overview.css">
  <link rel="stylesheet" href="${CSS_BASE}/event-left-column.css">
  <link id="palette-css" rel="stylesheet" href="/assets/css/palettes/oneslider-palette-harmonized.css">
  <link rel="canonical" href="https://one-sliders.com${rowEvent.canonicalPath}">
  <meta name="description" content="${esc(rowEvent.description)}">
  <meta property="og:title" content="${esc(rowEvent.name)}">
  <meta property="og:description" content="${esc(rowEvent.description)}">
  <meta property="og:image" content="https://one-sliders.com${imageRoot}/${rowEvent.slug}-hero.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="https://one-sliders.com${rowEvent.canonicalPath}">
  <meta name="twitter:card" content="summary_large_image">
  <title>${esc(rowEvent.name)}</title>
  <script type="application/ld+json">${json(schema)}</script>
</head>
<body class="event-dashboard onepage country-onepage" data-cat="climate">
  ${nav({ topicLabel: rowEvent.topicLabel, topicHref: rowEvent.topicHref })}
  <main class="page-shell page-content page-frame">
    <div class="layout-columns">
      <div class="layout__a">
        <div class="hero">
          <picture class="hero__image">
            <source srcset="${imageRoot}/${rowEvent.slug}-hero-400.webp 400w, ${imageRoot}/${rowEvent.slug}-hero-768.webp 768w, ${imageRoot}/${rowEvent.slug}-hero-1200.webp 1200w" sizes="(max-width: 860px) 100vw, 42vw" type="image/webp">
            <img src="${hero}" alt="${esc(rowEvent.name)}" width="1200" height="630" loading="eager" decoding="async">
          </picture>
          <div class="hero__title-row">
            <p class="event-kicker">Climate / ${esc(rowEvent.topicLabel)}</p>
            <h1 class="hero__title">${esc(rowEvent.name)}</h1>
          </div>
          <div class="event-kpis">${factCards}</div>
          <a class="event-topic-card" href="${rowEvent.topicHref}">
            <img src="${topicImage}" alt="" width="400" height="300" loading="lazy">
            <div class="event-topic-card__body"><span>Related climate topic</span><strong>${esc(rowEvent.topicLabel)}</strong><p>See the wider topic page for connected events and context.</p></div>
          </a>
        </div>
      </div>
      <div class="layout__b">
        <section class="event-panel event-panel--single" id="overview" aria-labelledby="overview-title">
          <p class="event-section-kicker">Overview</p>
          <p id="overview-title" class="event-panel-title">${esc(overviewTitle)}</p>
          <p>${esc(overviewSummary)}</p>
          <div class="event-grid">
            ${[eventInsight(rowEvent), ...overviewCards.slice(0, 3).map(cardHtml), ...moreInfoCards.slice(0, 1).map(cardHtml)].filter(Boolean).join('')}
          </div>
        </section>
      </div>
    </div>
  </main>
</body>
</html>`;
}

const technologyExample = {
  name: 'Google I/O',
  slug: 'google-io',
  category: 'technology',
  topic: 'developer-conferences',
  topicLabel: 'Developer Conferences',
  topicHref: `${CONTENT_BASE}/categories/technology/developer-conferences.html`,
  canonicalPath: '/content/categories/technology/developer-conferences/events/google-io.html',
  sourceImageRoot: '/content/categories/technology/developer-conferences/events/img',
  description: "Google I/O is Google's annual developer conference. The next tracked editions are 2027 and 2028 with expected dates; the latest completed edition is the 2026 AI-heavy recap.",
  metaDescription: "Google I/O: next editions, date status, 2026 recap, travel notes and official watch links for Google's developer conference.",
  sources: [
    { label: 'Google I/O official site', url: 'https://io.google/' },
    { label: 'Outside expected Google I/O 2027 date', url: 'https://outside.so/when-is/when-is-google-io' },
    { label: 'WorldClockTools expected event countdown data', url: 'https://worldclocktools.com/' },
    { label: 'Android Police Google I/O 2021 recap', url: 'https://www.androidpolice.com/2021/05/18/google-io-2021-android-12-wear-os-news-gallery/' }
  ]
};

const technologyConsumerElectronics = [
  {
    name: 'Apple September Event',
    slug: 'apple-september-event',
    description: 'Apple September Event is the annual product-launch window most closely watched for new iPhone, Apple Watch, AirPods and Apple platform updates.',
    metaDescription: 'Apple September Event guide: iPhone launch history, product focus, how to follow the keynote and planning notes.',
    dateLabel: '9 Sep 2025 - latest confirmed',
    checkIn: '2025-09-08',
    checkOut: '2025-09-10',
    startDate: '2025-09-09',
    location: 'Cupertino / online',
    bookingCity: 'Cupertino, California',
    areas: ['Cupertino', 'San Jose', 'Palo Alto', 'San Francisco'],
    officialUrl: 'https://www.apple.com/apple-events/',
    sources: [{ label: 'Apple Events', url: 'https://www.apple.com/apple-events/' }],
    cards: [
      ['Why people follow it', 'The iPhone launch signal', 'This is the Apple event people track for iPhone naming, pricing, camera changes, Apple Watch updates and release dates.'],
      ['What to search', 'iPhone date, preorder date and keynote time', 'The most useful searches are the official keynote page, Apple Newsroom posts, preorder timing and device comparison pages after the keynote.'],
      ['How to watch', 'Apple streams the keynote online', 'Apple normally publishes the stream and replay from its Apple Events hub, with product pages going live after announcements.'],
      ['Planning note', 'Use the Apple Events page as the source of truth', 'Apple publishes keynote video, replay and product links from its event hub; product lists should come from Appleâ€™s own event page and Newsroom posts.']
    ]
  },
  {
    name: 'Samsung Galaxy Unpacked',
    slug: 'samsung-galaxy-unpacked',
    description: 'Samsung Galaxy Unpacked is Samsungâ€™s flagship launch format for Galaxy phones, foldables, wearables and ecosystem hardware.',
    metaDescription: 'Samsung Galaxy Unpacked guide: Galaxy launch timing, product focus, livestream and preorder notes.',
    dateLabel: '25 Feb 2026',
    checkIn: '2026-02-24',
    checkOut: '2026-02-26',
    startDate: '2026-02-25',
    location: 'United States / online',
    bookingCity: 'San Jose, California',
    areas: ['San Jose', 'San Francisco', 'Palo Alto', 'Los Angeles'],
    officialUrl: 'https://www.samsung.com/global/galaxy/events/',
    sources: [{ label: 'Samsung Galaxy Events', url: 'https://www.samsung.com/global/galaxy/events/' }],
    cards: [
      ['Why people follow it', 'Galaxy launch details', 'Unpacked is where Samsung confirms Galaxy models, camera features, AI features, foldable updates and preorder windows.'],
      ['What to search', 'Livestream, specs and preorder offers', 'People usually want the stream time, product names, carrier offers, trade-in terms and side-by-side specs after the presentation.'],
      ['Format', 'Launch show plus hands-on coverage', 'The event is built around a keynote, official product pages, media hands-on reports and regional preorder pages.'],
      ['Planning note', 'Location varies by edition', 'Use the official event page for the confirmed host city and online viewing details before making travel plans.']
    ]
  },
  {
    name: 'Google Pixel Launch',
    slug: 'google-pixel-launch',
    description: 'Google Pixel Launch is the product event people track for Pixel phones, watches, earbuds and Android AI features.',
    metaDescription: 'Google Pixel Launch guide: Pixel phones, Android AI features, livestream, preorder timing and buying notes.',
    dateLabel: '20 Aug 2025 - latest confirmed',
    checkIn: '2025-08-19',
    checkOut: '2025-08-21',
    startDate: '2025-08-20',
    location: 'United States / online',
    bookingCity: 'Mountain View, California',
    areas: ['Mountain View', 'Palo Alto', 'San Jose', 'San Francisco'],
    officialUrl: 'https://store.google.com/',
    sources: [{ label: 'Google Store', url: 'https://store.google.com/' }],
    cards: [
      ['Why people follow it', 'Pixel and Android AI roadmap', 'The launch usually matters for Pixel hardware, Gemini features, camera tools, Android updates and preorder availability.'],
      ['What to search', 'Pixel price, release date and trade-in', 'The most useful searches are official Google Store pages, carrier availability, trade-in offers and feature comparisons.'],
      ['How to watch', 'Online-first launch coverage', 'Google generally makes the announcement available online, followed by product pages and detailed spec sheets.'],
      ['Planning note', 'Use Googleâ€™s official launch pages first', 'Googleâ€™s own Store and event pages are the safest source for launch timing, product names, preorder links and availability.']
    ]
  },
  {
    name: 'IFA Berlin',
    slug: 'ifa-berlin',
    description: 'IFA Berlin is one of Europeâ€™s major consumer-electronics trade shows, covering TVs, smart homes, appliances, mobile devices and retail technology.',
    metaDescription: 'IFA Berlin guide: dates, venue context, product categories, visitor planning and official source links.',
    dateLabel: '4-8 Sep 2026',
    checkIn: '2026-09-03',
    checkOut: '2026-09-09',
    startDate: '2026-09-04',
    endDate: '2026-09-08',
    location: 'Berlin, Germany',
    bookingCity: 'Berlin, Germany',
    areas: ['Messe Berlin', 'Charlottenburg', 'Mitte', 'Kreuzberg'],
    officialUrl: 'https://www.ifa-berlin.com/',
    sources: [{ label: 'IFA Berlin', url: 'https://www.ifa-berlin.com/' }],
    cards: [
      ['Why people follow it', 'European consumer-tech launches', 'IFA is useful for tracking TV, appliance, smart-home, audio, mobile and retail technology announcements in Europe.'],
      ['Where it happens', 'Messe Berlin', 'The show is associated with Messe Berlin, so visitors usually search for tickets, exhibitor halls, transport and hotel areas around the venue.'],
      ['What to search', 'Tickets, exhibitor list and hall plan', 'The practical searches are the official ticket page, exhibitor directory, conference programme and Messe Berlin travel guidance.'],
      ['Planning note', 'Book Berlin early when dates are confirmed', 'Hotel demand can rise around Messe Berlin events; confirm dates and visitor access on the official site before booking.']
    ]
  },
  {
    name: 'Mobile World Congress',
    slug: 'mobile-world-congress',
    description: 'Mobile World Congress Barcelona is the global mobile-industry show for devices, networks, telecom infrastructure and connected services.',
    metaDescription: 'Mobile World Congress Barcelona guide: venue, what to follow, ticket and travel planning notes.',
    dateLabel: '1-4 Mar 2027',
    checkIn: '2027-02-28',
    checkOut: '2027-03-05',
    startDate: '2027-03-01',
    endDate: '2027-03-04',
    location: 'Barcelona, Spain',
    bookingCity: 'Barcelona, Spain',
    areas: ['Fira Gran Via', 'Lâ€™Hospitalet', 'Eixample', 'Gothic Quarter'],
    officialUrl: 'https://www.mwcbarcelona.com/',
    sources: [{ label: 'MWC Barcelona', url: 'https://www.mwcbarcelona.com/' }],
    cards: [
      ['Why people follow it', 'Mobile and telecom roadmap', 'MWC is where people track smartphone launches, network infrastructure, telecom policy, 5G/6G direction and enterprise mobility.'],
      ['Where it happens', 'Fira Gran Via', 'Visitors usually plan around Fira Gran Via, airport access, metro routes and Barcelona hotel availability.'],
      ['What to search', 'Passes, exhibitors and keynote agenda', 'The official pass types, exhibitor list, keynote programme and partner events are the useful planning searches.'],
      ['Planning note', 'A business-heavy event', 'MWC is more trade-show than fan showcase; check access rules, badge requirements and meeting locations before travel.']
    ]
  },
  {
    name: 'Computex Taipei',
    slug: 'computex-taipei',
    description: 'Computex Taipei is a major PC, semiconductor, AI hardware and component show in Taiwanâ€™s technology supply-chain calendar.',
    metaDescription: 'Computex Taipei guide: PC hardware, chips, AI devices, venue planning and official links.',
    dateLabel: '2-6 Jun 2026',
    checkIn: '2026-06-01',
    checkOut: '2026-06-07',
    startDate: '2026-06-02',
    endDate: '2026-06-06',
    location: 'Taipei, Taiwan',
    bookingCity: 'Taipei, Taiwan',
    areas: ['Nangang', 'Xinyi', 'Songshan', 'Taipei Main Station'],
    officialUrl: 'https://www.computextaipei.com.tw/',
    sources: [{ label: 'Computex Taipei', url: 'https://www.computextaipei.com.tw/' }],
    cards: [
      ['Why people follow it', 'PC and chip announcements', 'Computex is useful for CPUs, GPUs, motherboards, laptops, AI PCs, cooling, cases and component roadmaps.'],
      ['Where it happens', 'Taipei trade-show venues', 'Visitors commonly plan around Nangang and central Taipei, depending on halls, meetings and press events.'],
      ['What to search', 'Keynotes, exhibitor booths and product demos', 'The most useful searches are keynote schedules, exhibitor maps, product demo coverage and registration rules.'],
      ['Planning note', 'Plan around Taipei', 'For this topic page, Computex Taipei is handled as a Taipei event, with hotel and transport planning centered on Nangang and central Taipei.']
    ]
  },
  {
    name: 'Nintendo Direct Showcase',
    slug: 'nintendo-direct-showcase',
    description: 'Nintendo Direct is Nintendoâ€™s online showcase format for game announcements, release dates, trailers and platform updates.',
    metaDescription: 'Nintendo Direct guide: showcase timing, games, trailers, release dates and official stream links.',
    dateLabel: '9 Jun 2026 - latest confirmed',
    checkIn: '2026-06-08',
    checkOut: '2026-06-10',
    startDate: '2026-06-09',
    location: 'Online',
    bookingCity: 'Tokyo, Japan',
    areas: ['Tokyo', 'Shibuya', 'Shinjuku', 'Akihabara'],
    officialUrl: 'https://www.nintendo.com/us/nintendo-direct/',
    sources: [{ label: 'Nintendo Direct', url: 'https://www.nintendo.com/us/nintendo-direct/' }],
    cards: [
      ['Why people follow it', 'Game announcements and release dates', 'Nintendo Direct is where fans look for trailers, release windows, platform updates and surprise first-party announcements.'],
      ['What to search', 'Direct time, runtime and featured games', 'The useful searches are the official stream page, Nintendo regional channels, announced titles and eShop pages after the show.'],
      ['Format', 'Online showcase', 'This is primarily an online event, so travel planning is usually not relevant unless paired with a separate live event.'],
      ['Planning note', 'Nintendo announces streams close to air time', 'Use Nintendoâ€™s Direct hub and regional YouTube channels for the confirmed stream, replay and game links.']
    ]
  },
  {
    name: 'Sony State of Play',
    slug: 'sony-state-of-play',
    description: 'Sony State of Play is PlayStationâ€™s online showcase format for trailers, release dates, gameplay reveals and platform updates.',
    metaDescription: 'Sony State of Play guide: PlayStation showcase timing, games, trailers and official stream notes.',
    dateLabel: '2 Jun 2026 - latest confirmed',
    checkIn: '2026-06-01',
    checkOut: '2026-06-03',
    startDate: '2026-06-02',
    location: 'Online',
    bookingCity: 'Tokyo, Japan',
    areas: ['Tokyo', 'Shibuya', 'Shinjuku', 'Akihabara'],
    officialUrl: 'https://blog.playstation.com/',
    sources: [{ label: 'PlayStation Blog', url: 'https://blog.playstation.com/' }],
    cards: [
      ['Why people follow it', 'PlayStation trailers and gameplay', 'State of Play is useful for first-party updates, third-party trailers, gameplay reveals, release dates and PlayStation Store follow-up pages.'],
      ['What to search', 'Runtime, featured titles and replay', 'People usually want the official PlayStation Blog post, YouTube stream, announced games and regional release details.'],
      ['Format', 'Online broadcast', 'Most State of Play editions are online showcases rather than public ticketed events.'],
      ['Planning note', 'Check the PlayStation Blog first', 'The PlayStation Blog is the cleanest source for the show announcement, replay link, featured games and regional release details.']
    ]
  },
  {
    name: 'Microsoft Surface Event',
    slug: 'microsoft-surface-event',
    description: 'Microsoft Surface Event is the product-launch format people track for Surface devices, Windows hardware features and Copilot PC updates.',
    metaDescription: 'Microsoft Surface Event guide: Surface devices, Windows hardware, Copilot PC news and official event links.',
    dateLabel: 'Oct 2026 expected',
    checkIn: '2026-10-01',
    checkOut: '2026-10-31',
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    location: 'Redmond / online',
    bookingCity: 'Redmond, Washington',
    areas: ['Redmond', 'Bellevue', 'Seattle', 'Kirkland'],
    officialUrl: 'https://www.microsoft.com/surface',
    sources: [{ label: 'Microsoft Surface', url: 'https://www.microsoft.com/surface' }],
    cards: [
      ['Why people follow it', 'Surface and Windows hardware signal', 'This event matters for Surface Pro, Surface Laptop, Windows device strategy, Copilot PC positioning and hardware availability.'],
      ['What to search', 'Specs, pricing and preorder pages', 'The useful searches are official Surface product pages, Microsoft Store availability, processor details and business-device notes.'],
      ['Format', 'Launch content plus product pages', 'The public value is usually the announcement, product pages, store listings and hands-on coverage after the reveal.'],
      ['Planning note', 'Confirm location and access', 'Do not assume an in-person public event; use Microsoftâ€™s official pages for confirmed access and launch timing.']
    ]
  },
  {
    name: 'CES',
    slug: 'ces',
    description: 'CES is the major Las Vegas consumer-technology show for TVs, smart home, mobility, chips, AI devices, health tech and startup hardware.',
    metaDescription: 'CES 2027 guide: Las Vegas dates, venue planning, product categories, tickets, hotels and official source links.',
    dateLabel: '6-9 Jan 2027',
    checkIn: '2027-01-05',
    checkOut: '2027-01-10',
    startDate: '2027-01-06',
    endDate: '2027-01-09',
    location: 'Las Vegas, United States',
    bookingCity: 'Las Vegas, Nevada',
    areas: ['Las Vegas Strip', 'Convention Center', 'Downtown', 'Summerlin'],
    officialUrl: 'https://www.ces.tech/',
    sources: [{ label: 'CES', url: 'https://www.ces.tech/' }],
    cards: [
      ['Why people follow it', 'The broadest consumer-tech signal', 'CES is where companies show TVs, smart homes, vehicle tech, wearables, chips, AI hardware, robotics and experimental devices.'],
      ['Where it happens', 'Las Vegas', 'Planning usually revolves around the Las Vegas Convention Center, Strip hotels, shuttle routes and badge pickup.'],
      ['What to search', 'Registration, exhibitor list and keynote schedule', 'The official registration page, exhibitor directory, keynote programme and hotel guidance are the most useful planning links.'],
      ['Planning note', 'Book around venue access', 'CES is large and spread out; pick hotels based on venue access, shuttle routes and meetings rather than distance alone.']
    ]
  }
].map((event) => ({
  category: 'technology',
  topic: 'consumer-electronics',
  topicLabel: 'Consumer Electronics',
  topicHref: `${CONTENT_BASE}/categories/technology/consumer-electronics.html`,
  canonicalPath: `/content/categories/technology/consumer-electronics/events/${event.slug}.html`,
  sourceImageRoot: '/content/categories/technology/consumer-electronics/events/img',
  topicImage: '/content/categories/technology/img/consumer-electronics-mini.png',
  ...event
}));

const technologyDeveloperConferences = [
  {
    name: 'GitHub Universe',
    slug: 'github-universe',
    description: 'GitHub Universe is GitHubâ€™s developer conference for Copilot, GitHub Actions, security, open source workflow and platform updates.',
    metaDescription: 'GitHub Universe guide: Copilot, Actions, security, platform updates, keynote links and developer planning notes.',
    dateLabel: '28-29 Oct 2025 - latest confirmed',
    checkIn: '2025-10-27',
    checkOut: '2025-10-30',
    startDate: '2025-10-28',
    endDate: '2025-10-29',
    location: 'San Francisco, United States',
    bookingCity: 'San Francisco, California',
    areas: ['San Francisco', 'SoMa', 'Union Square', 'Mission Bay'],
    officialUrl: 'https://githubuniverse.com/',
    sources: [{ label: 'GitHub Universe', url: 'https://githubuniverse.com/' }],
    cards: [
      ['Why people follow it', 'GitHubâ€™s developer roadmap', 'Universe is where developers look for Copilot updates, GitHub Actions changes, security features and platform announcements.'],
      ['What to search', 'Keynote, sessions and Copilot news', 'The useful searches are the keynote replay, session catalog, product announcements and GitHub changelog follow-ups.'],
      ['Audience', 'Developers, platform teams and open-source maintainers', 'The event is useful for teams that rely on GitHub for source control, CI/CD, security and AI-assisted development.'],
      ['Planning note', 'Use the official event hub', 'GitHubâ€™s event site is the source for registration, venue details, session agenda and livestream or replay links.']
    ]
  },
  {
    name: 'NVIDIA GTC',
    slug: 'nvidia-gtc',
    description: 'NVIDIA GTC is NVIDIAâ€™s AI and accelerated-computing conference for GPUs, AI infrastructure, robotics, simulation and developer platforms.',
    metaDescription: 'NVIDIA GTC guide: AI infrastructure, GPUs, robotics, developer sessions, keynotes and travel planning.',
    dateLabel: '16-19 Mar 2026',
    checkIn: '2026-03-15',
    checkOut: '2026-03-20',
    startDate: '2026-03-16',
    endDate: '2026-03-19',
    location: 'San Jose, United States',
    bookingCity: 'San Jose, California',
    areas: ['San Jose', 'Santa Clara', 'Mountain View', 'Palo Alto'],
    officialUrl: 'https://www.nvidia.com/gtc/',
    sources: [{ label: 'NVIDIA GTC', url: 'https://www.nvidia.com/gtc/' }],
    cards: [
      ['Why people follow it', 'AI hardware and software roadmap', 'GTC is where teams track GPU platforms, AI infrastructure, CUDA ecosystem updates, robotics and enterprise AI announcements.'],
      ['What to search', 'Keynote, sessions and developer labs', 'The practical searches are registration, keynote time, session catalog, hands-on labs and replay access.'],
      ['Audience', 'AI builders and infrastructure teams', 'The event is especially relevant for ML engineers, platform teams, researchers, robotics developers and enterprise AI buyers.'],
      ['Planning note', 'Plan around San Jose access', 'Hotel planning should center on San Jose and nearby South Bay areas once pass and venue details are confirmed on NVIDIAâ€™s site.']
    ]
  },
  {
    name: 'AWS re:Invent',
    slug: 'aws-re-invent',
    description: 'AWS re:Invent is Amazon Web Servicesâ€™ annual cloud conference for infrastructure, data, AI, security, partner updates and hands-on builders.',
    metaDescription: 'AWS re:Invent guide: Las Vegas dates, keynotes, cloud announcements, sessions, hotels and official links.',
    dateLabel: '1-5 Dec 2025 - latest confirmed',
    checkIn: '2025-11-30',
    checkOut: '2025-12-06',
    startDate: '2025-12-01',
    endDate: '2025-12-05',
    location: 'Las Vegas, United States',
    bookingCity: 'Las Vegas, Nevada',
    areas: ['Las Vegas Strip', 'Convention Center', 'Downtown', 'Summerlin'],
    officialUrl: 'https://reinvent.awsevents.com/',
    sources: [{ label: 'AWS re:Invent', url: 'https://reinvent.awsevents.com/' }],
    cards: [
      ['Why people follow it', 'AWS cloud roadmap', 're:Invent is where builders track AWS service launches, AI infrastructure, data tools, security updates and cloud architecture guidance.'],
      ['What to search', 'Keynotes, session catalog and hotel blocks', 'The useful searches are the official agenda, keynote schedule, session reservations, campus map and hotel guidance.'],
      ['Audience', 'Cloud builders and enterprise teams', 'The event is built for developers, architects, operators, partners, startups and business teams using AWS.'],
      ['Planning note', 'Las Vegas logistics matter', 'Sessions can be spread across venues, so hotel area and transit planning are part of the event experience.']
    ]
  },
  {
    name: 'Meta Connect',
    slug: 'meta-connect',
    description: 'Meta Connect is Metaâ€™s developer and product event for AI glasses, VR, mixed reality, Horizon, Quest and creator tools.',
    metaDescription: 'Meta Connect guide: AI glasses, Quest, mixed reality, livestreams, developer sessions and official links.',
    dateLabel: '17-18 Sep 2025 - latest confirmed',
    checkIn: '2025-09-16',
    checkOut: '2025-09-19',
    startDate: '2025-09-17',
    endDate: '2025-09-18',
    location: 'Menlo Park / online',
    bookingCity: 'Menlo Park, California',
    areas: ['Menlo Park', 'Palo Alto', 'Mountain View', 'San Francisco'],
    officialUrl: 'https://www.metaconnect.com/',
    sources: [{ label: 'Meta Connect', url: 'https://www.metaconnect.com/' }],
    cards: [
      ['Why people follow it', 'Metaâ€™s AI and spatial platform signal', 'Connect is where people look for Quest updates, smart glasses, AI features, Horizon changes and developer tooling.'],
      ['What to search', 'Keynote, device announcements and developer sessions', 'The useful searches are livestream time, replay links, product pages and session details for developers.'],
      ['Audience', 'XR developers and AI product teams', 'The event matters for builders working with Quest, Horizon, mixed reality, AI assistants and wearable devices.'],
      ['Planning note', 'Online viewing is central', 'Use Metaâ€™s official event site for viewing links, session access and product announcements.']
    ]
  },
  {
    name: 'Salesforce Dreamforce',
    slug: 'salesforce-dreamforce',
    description: 'Salesforce Dreamforce is Salesforceâ€™s annual conference for CRM, Agentforce, data cloud, admins, developers, partners and customer teams.',
    metaDescription: 'Salesforce Dreamforce guide: San Francisco dates, Agentforce, CRM sessions, registration and travel planning.',
    dateLabel: '14-16 Oct 2025 - latest confirmed',
    checkIn: '2025-10-13',
    checkOut: '2025-10-17',
    startDate: '2025-10-14',
    endDate: '2025-10-16',
    location: 'San Francisco, United States',
    bookingCity: 'San Francisco, California',
    areas: ['Moscone Center', 'SoMa', 'Union Square', 'Mission Bay'],
    officialUrl: 'https://www.salesforce.com/dreamforce/',
    sources: [{ label: 'Salesforce Dreamforce', url: 'https://www.salesforce.com/dreamforce/' }],
    cards: [
      ['Why people follow it', 'Salesforce product and ecosystem roadmap', 'Dreamforce is where admins, developers and business teams track Salesforce platform, AI agent, CRM and partner announcements.'],
      ['What to search', 'Registration, agenda and keynote replay', 'The useful searches are pass types, session catalog, keynote schedule, hotel guidance and post-event product summaries.'],
      ['Audience', 'Salesforce builders and operators', 'The event is useful for admins, developers, consultants, partners, marketers, sales teams and data teams.'],
      ['Planning note', 'Plan around Moscone Center', 'Hotel and transport planning normally centers on Moscone Center and nearby San Francisco neighborhoods.']
    ]
  },
  {
    name: 'Red Hat Summit',
    slug: 'red-hat-summit',
    description: 'Red Hat Summit is Red Hatâ€™s conference for open source enterprise platforms, Linux, OpenShift, Ansible, automation and hybrid cloud.',
    metaDescription: 'Red Hat Summit guide: enterprise open source, OpenShift, Ansible, AI, hybrid cloud, sessions and official links.',
    dateLabel: '11-14 May 2026',
    checkIn: '2026-05-10',
    checkOut: '2026-05-15',
    startDate: '2026-05-11',
    endDate: '2026-05-14',
    location: 'Atlanta, United States',
    bookingCity: 'Atlanta, Georgia',
    areas: ['Downtown Atlanta', 'Midtown', 'Buckhead', 'Old Fourth Ward'],
    officialUrl: 'https://www.redhat.com/en/summit',
    sources: [{ label: 'Red Hat Summit', url: 'https://www.redhat.com/en/summit' }],
    cards: [
      ['Why people follow it', 'Enterprise open-source roadmap', 'Summit is where teams track OpenShift, RHEL, Ansible, AI infrastructure and hybrid-cloud announcements.'],
      ['What to search', 'Sessions, labs and product keynotes', 'The useful searches are registration, agenda, technical sessions, hands-on labs and Red Hat product announcements.'],
      ['Audience', 'Platform, operations and cloud teams', 'The event is useful for Linux administrators, platform engineers, architects, security teams and enterprise developers.'],
      ['Planning note', 'Use the official Summit page', 'Red Hatâ€™s event hub is the source for dates, city, registration, sessions and replay links.']
    ]
  },
  {
    name: 'DockerCon',
    slug: 'dockercon',
    description: 'DockerCon is Dockerâ€™s developer event for containers, local development, Docker Desktop, security, AI workflows and software delivery.',
    metaDescription: 'DockerCon guide: containers, Docker Desktop, developer workflows, security, AI sessions and official links.',
    dateLabel: '2025 - latest confirmed edition',
    checkIn: '2025-11-09',
    checkOut: '2025-11-12',
    startDate: '2025-11-10',
    endDate: '2025-11-11',
    location: 'Online / developer event',
    bookingCity: 'Los Angeles, California',
    areas: ['Los Angeles', 'Santa Monica', 'Downtown LA', 'Pasadena'],
    officialUrl: 'https://www.docker.com/dockercon/',
    sources: [{ label: 'DockerCon', url: 'https://www.docker.com/dockercon/' }],
    cards: [
      ['Why people follow it', 'Container workflow updates', 'DockerCon is where developers look for Docker Desktop, container security, build workflow, AI and local development updates.'],
      ['What to search', 'Sessions, product announcements and replay', 'The useful searches are the official agenda, livestream or replay links, Docker blog posts and developer session videos.'],
      ['Audience', 'Application developers and platform teams', 'The event is useful for teams building and shipping containerized software across local machines, CI and cloud platforms.'],
      ['Planning note', 'Online content is important', 'Use Dockerâ€™s official event page for confirmed format, session access and replay links.']
    ]
  },
  {
    name: 'Microsoft Build',
    slug: 'microsoft-build',
    description: 'Microsoft Build is Microsoftâ€™s developer conference for Azure, Windows, Copilot, .NET, GitHub, AI tooling and platform services.',
    metaDescription: 'Microsoft Build guide: Azure, Copilot, Windows, developer tools, sessions, registration and official links.',
    dateLabel: '2-3 Jun 2026',
    checkIn: '2026-06-01',
    checkOut: '2026-06-04',
    startDate: '2026-06-02',
    endDate: '2026-06-03',
    location: 'San Francisco, United States',
    bookingCity: 'San Francisco, California',
    areas: ['San Francisco', 'SoMa', 'Union Square', 'Mission Bay'],
    officialUrl: 'https://build.microsoft.com/',
    sources: [{ label: 'Microsoft Build', url: 'https://build.microsoft.com/' }],
    cards: [
      ['Why people follow it', 'Microsoftâ€™s developer roadmap', 'Build is where developers track Azure, Copilot, Windows, .NET, GitHub and Microsoft platform announcements.'],
      ['What to search', 'Keynote, session catalog and announcements', 'The useful searches are registration, session agenda, keynote replay, Book of News and product documentation links.'],
      ['Audience', 'Microsoft ecosystem builders', 'The event is useful for cloud developers, Windows developers, AI builders, enterprise architects and platform teams.'],
      ['Planning note', 'Use Buildâ€™s official site', 'Microsoftâ€™s Build site is the source for confirmed dates, location, sessions and online access.']
    ]
  },
  {
    name: 'Apple WWDC',
    slug: 'apple-wwdc',
    description: 'Apple WWDC is Appleâ€™s annual developer conference for iOS, macOS, watchOS, visionOS, Swift, developer tools and platform sessions.',
    metaDescription: 'Apple WWDC guide: June 2026 dates, keynote, sessions, Apple platforms, Swift and official links.',
    dateLabel: '8-12 Jun 2026',
    checkIn: '2026-06-07',
    checkOut: '2026-06-13',
    startDate: '2026-06-08',
    endDate: '2026-06-12',
    location: 'Cupertino / online',
    bookingCity: 'Cupertino, California',
    areas: ['Cupertino', 'San Jose', 'Palo Alto', 'San Francisco'],
    officialUrl: 'https://developer.apple.com/wwdc/',
    sources: [{ label: 'Apple WWDC', url: 'https://developer.apple.com/wwdc/' }],
    cards: [
      ['Why people follow it', 'Apple platform roadmap', 'WWDC is where developers track iOS, macOS, watchOS, visionOS, Swift, Xcode and App Store platform changes.'],
      ['What to search', 'Keynote, Platforms State of the Union and sessions', 'The useful searches are the keynote, Platforms State of the Union, session videos, sample code and developer documentation.'],
      ['Audience', 'Apple platform developers', 'The event is useful for iOS, macOS, watchOS, visionOS and web developers building for Apple users.'],
      ['Planning note', 'Online sessions matter', 'WWDC is heavily online, with Appleâ€™s developer site carrying sessions, labs, videos and documentation links.']
    ]
  }
].map((event) => ({
  category: 'technology',
  topic: 'developer-conferences',
  topicLabel: 'Developer Conferences',
  topicHref: `${CONTENT_BASE}/categories/technology/developer-conferences.html`,
  canonicalPath: `/content/categories/technology/developer-conferences/events/${event.slug}.html`,
  sourceImageRoot: '/content/categories/technology/developer-conferences/events/img',
  topicImage: '/content/categories/technology/img/developer-conferences-mini.png',
  ...event
}));

const cultureMusicFestivals = [
  {
    name: 'White Sensation Amsterdam',
    slug: 'white-sensation-amsterdam',
    category: 'culture',
    categoryLabel: 'Culture',
    categoryHref: `${CONTENT_BASE}/categories/culture/index.html`,
    topic: 'music-festivals',
    topicLabel: 'Music Festivals',
    topicHref: `${CONTENT_BASE}/categories/music/music-festivals.html`,
    canonicalPath: '/content/categories/culture/music-festivals/events/white-sensation-amsterdam.html',
    sourceImageRoot: '/content/categories/culture/music-festivals/events/img',
    topicImage: '/content/categories/music/img/music-festivals-mini.png',
    relatedLabel: 'More Music',
    relatedDetail: 'Festivals, live stages and music travel calendars.',
    description: 'White Sensation Amsterdam is an Amsterdam dance-event profile for people checking whether a Sensation-style all-white arena night is active, where it is held and what to verify before booking travel.',
    metaDescription: 'White Sensation Amsterdam guide: venue context, Amsterdam stay planning and what to check before booking.',
    dateLabel: '4-5 Jul 2026 expected',
    checkIn: '2026-07-03',
    checkOut: '2026-07-06',
    startDate: '2026-07-04',
    endDate: '2026-07-05',
    location: 'Amsterdam, Netherlands',
    bookingCity: 'Amsterdam, Netherlands',
    areas: ['Amsterdam', 'Amsterdam Arena area', 'Zuid', 'Centrum'],
    officialUrl: '',
    sources: [],
    cards: [
      ['Date and status', '4-5 Jul 2026 expected', 'Treat this as a watchlist date until a current organiser confirms the exact edition, ticket page and running times.'],
      ['Venue and stay area', 'Amsterdam, Netherlands', 'Plan around Amsterdam first, then narrow stays by the confirmed arena, night transport and entry gate once the active edition is announced.'],
      ['Tickets and dress code', 'Confirm the all-white format', 'The useful checks are ticket release, resale rules, all-white dress-code enforcement, DJ lineup, age limits and bag policy.'],
      ['Before booking', 'Verify the active event brand', 'Sensation-style events have changed formats over time, so do not treat old pages, fan listings or expected dates as final travel information.']
    ]
  }
];

function parseCultureCsv(text, delimiter = ';') {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === delimiter) {
      row.push(value);
      value = '';
    } else if (char === '\n') {
      row.push(value);
      rows.push(row);
      row = [];
      value = '';
    } else if (char !== '\r') {
      value += char;
    }
  }
  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }
  const [header = [], ...dataRows] = rows;
  const cleanHeader = header.map((key) => String(key).replace(/^\uFEFF/, ''));
  return dataRows
    .filter((dataRow) => dataRow.some((cell) => String(cell).trim()))
    .map((dataRow) => Object.fromEntries(cleanHeader.map((key, index) => [key, dataRow[index] ?? ''])));
}

function cleanTopicLabel(topic) {
  return String(topic || '')
    .split('-')
    .map((part) => part ? part[0].toUpperCase() + part.slice(1) : part)
    .join(' ');
}

function isGenericCultureText(text = '') {
  return / is a recurring cultural event associated with /i.test(text)
    || /No confirmed date identified in this enrichment pass/i.test(text)
    || /Existing date carried from source file/i.test(text)
    || /^Verifiera datum$/i.test(text)
    || /^Updated â€” next edition$/i.test(text);
}

function compactDescription(parts) {
  return parts
    .map((part) => String(part ?? '').trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .slice(0, 154);
}

function splitAreas(row) {
  return uniqueList([row.stay_city || row.stay_area_1]);
}

function imageRootFor(row) {
  return `/content/categories/culture/${row.topic}/events/img`;
}

function firstOfficialUrl(source = '') {
  return String(source)
    .split('|')
    .map((part) => part.trim())
    .find((part) => /^https?:\/\//i.test(part)) || '';
}

function monthNumber(name = '') {
  const key = name.slice(0, 3).toLowerCase();
  return {
    jan: '01',
    feb: '02',
    mar: '03',
    apr: '04',
    may: '05',
    jun: '06',
    jul: '07',
    aug: '08',
    sep: '09',
    oct: '10',
    nov: '11',
    dec: '12'
  }[key] || '';
}

function isoDateFromParts(day, month, year) {
  const mm = monthNumber(month);
  if (!day || !mm || !year) return '';
  return `${year}-${mm}-${String(day).padStart(2, '0')}`;
}

function parseCultureDateRange(display = '') {
  const text = String(display || '').replace(/\s+/g, ' ').trim();
  let match = text.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\s*-\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (match) {
    return {
      start: isoDateFromParts(match[1], match[2], match[3]),
      end: isoDateFromParts(match[4], match[5], match[6])
    };
  }
  match = text.match(/^(\d{1,2})\s+([A-Za-z]+)\s*-\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (match) {
    return {
      start: isoDateFromParts(match[1], match[2], match[5]),
      end: isoDateFromParts(match[3], match[4], match[5])
    };
  }
  match = text.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (match) {
    const start = isoDateFromParts(match[1], match[2], match[3]);
    return { start, end: start };
  }
  return { start: '', end: '' };
}

function cultureRowToSimpleEvent(row) {
  const topicLabel = cleanTopicLabel(row.topic);
  const usefulAbout = isGenericCultureText(row.about_text) ? '' : row.about_text;
  const usefulNotes = isGenericCultureText(row.notes) ? '' : row.notes;
  const areas = splitAreas(row);
  const bookingCity = row.stay_city || row.location || row.country || '';
  const dates = parseCultureDateRange(row.display_dates);
  const officialUrl = firstOfficialUrl(row.source);
  const cards = [];

  if (usefulAbout) {
    cards.push(['What it is', row.title, usefulAbout]);
  }
  if (row.display_dates || row.when_details) {
    cards.push(['When', row.display_dates || row.next_date_label || 'Date to confirm', row.when_details || row.display_dates || row.next_date_label]);
  }
  if (row.location || row.country) {
    const placeTitle = placeWithCountry(row.location, row.country);
    cards.push({ label: 'Where', title: placeTitle, detail: row.venue_details || '', htmlTitle: true });
  }
  if (areas.length) {
    cards.push(['Stay base', areas[0], areas.slice(1).join(', ')]);
  }
  if (usefulNotes) {
    cards.push(['Planning note', 'Before booking', usefulNotes]);
  }

  if (!cards.length) {
    cards.push(['Event', row.title, usefulAbout || row.display_dates || row.location || topicLabel]);
  }

  const description = usefulAbout || compactDescription([
    row.display_dates ? `${row.title}: ${row.display_dates}.` : row.title,
    row.location ? `${row.location}.` : '',
    areas.length ? `Stay base: ${areas[0]}.` : ''
  ]);

  return {
    name: row.title,
    slug: row.slug,
    category: 'culture',
    categoryLabel: 'Culture',
    categoryHref: `${CONTENT_BASE}/categories/culture/index.html`,
    topic: row.topic,
    topicLabel,
    topicHref: `${CONTENT_BASE}/categories/culture/${row.topic}.html`,
    canonicalPath: `/content/categories/culture/${row.topic}/events/${row.slug}.html`,
    sourceImageRoot: imageRootFor(row),
    topicImage: `/content/categories/culture/img/${row.topic}-mini.png`,
    relatedLabel: 'More Culture',
    relatedDetail: 'More event families and event listings.',
    description,
    metaDescription: compactDescription([
      `${row.title}:`,
      row.location || row.country || topicLabel,
      `${topicLabel.toLowerCase()} context, venue notes and stay planning.`
    ]),
    dateLabel: row.display_dates,
    checkIn: dates.start,
    checkOut: dates.end,
    startDate: dates.start,
    endDate: dates.end,
    location: row.location || row.country || topicLabel,
    displayLocation: row.location || row.country || topicLabel,
    country: row.country,
    bookingCity,
    areas: areas.length ? areas : [bookingCity].filter(Boolean),
    officialUrl,
    sources: [],
    cards
  };
}

function readCultureSimpleEvents() {
  const csvPath = path.join(ROOT, 'Templates', 'data', 'event-analysis.csv');
  const rows = parseCultureCsv(fs.readFileSync(csvPath, 'utf8'));
  return rows
    .filter((row) => row.category === 'culture')
    .filter((row) => ![row.topic, row.event_type, row.slug, row.title].some((value) => /\bawards?\b/i.test(String(value || ''))))
    .filter((row) => row.topic !== 'national-day')
    .filter((row) => !['music', 'music-festivals'].includes(row.topic) || slugFilter)
    .filter((row) => !slugFilter || row.slug === slugFilter)
    .map(cultureRowToSimpleEvent);
}

function bookingPanel(rowEvent) {
  const areas = (rowEvent.areas?.length ? rowEvent.areas : [rowEvent.bookingCity]).filter(Boolean);
  const selectedArea = areas[0] ?? rowEvent.bookingCity ?? rowEvent.location ?? '';
  const bookingHref = BOOKING_BASE + `ss=${encodeURIComponent(rowEvent.bookingCity || selectedArea)}`;
  return `<section class="stay-booking-panel hero-stay-booking" aria-label="Booking and planning">
            <div class="stay-booking-panel__header">
              <p class="stay-section-label">
                <span class="booking-symbols booking-symbols--small" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false"><path d="M4 21V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13"></path><path d="M3 21h18"></path><path d="M8 10h1"></path><path d="M12 10h1"></path><path d="M18 21v-6h1a2 2 0 0 1 2 2v4"></path></svg>
                  <svg viewBox="0 0 24 24" focusable="false"><path d="M10.5 4.5 13 12l6.5 2a1.5 1.5 0 0 1 .25 2.78l-1.1.55a2 2 0 0 1-1.75.02L12 15.5 8.5 20H6l2-6-5-3V8.5l5 1.5 1-5.5h1.5Z"></path></svg>
                </span>
                <span>BOOK HOTELS &amp; FLIGHTS</span>
              </p>
              <h2 class="stay-section-title">Book stays for ${esc(rowEvent.name)}</h2>
            </div>
            <div class="stay-form-row">
              <div class="stay-form-field">
                <label class="stay-field-label" for="stay-checkin">CHECK-IN</label>
                ${textDateInput('stay-checkin', rowEvent.checkIn)}
              </div>
              <div class="stay-form-field">
                <label class="stay-field-label" for="stay-checkout">CHECK-OUT</label>
                ${textDateInput('stay-checkout', rowEvent.checkOut)}
              </div>
            </div>
            <div class="stay-form-row">
              <div class="stay-form-field">
                <label class="stay-field-label" for="stay-guests">GUESTS</label>
                <input type="number" id="stay-guests" class="stay-field-input" value="2" min="1" max="10">
              </div>
              <div class="stay-form-field">
                <label class="stay-field-label" for="stay-rooms">ROOMS</label>
                <input type="number" id="stay-rooms" class="stay-field-input" value="1" min="1" max="5">
              </div>
            </div>
            <p class="stay-field-label stay-area-label">AREA</p>
            <div class="stay-area-pills">
              ${areas.map((area, index) => `<label class="stay-area-pill"><input type="radio" name="stay-region" value="${esc(area)}"${index === 0 ? ' checked' : ''}><span>${esc(area)}</span></label>`).join('')}
            </div>
            <a class="stay-check-btn" href="${esc(bookingHref)}" target="_blank" rel="nofollow sponsored noopener">Check hotel prices</a>
            <p class="stay-booking-note">OneSliders may earn a commission if you book through Booking.com.</p>
          </section>`;
}

function renderTechnologyEvent(rowEvent) {
  const imageRoot = rowEvent.sourceImageRoot;
  const hero = `${imageRoot}/${rowEvent.slug}-hero.png`;
  const pageTopicHref = writeDev ? `/Dev${rowEvent.topicHref}` : rowEvent.topicHref;
  const category = rowEvent.category ?? 'technology';
  const categoryLabel = rowEvent.categoryLabel ?? 'Technology';
  const categoryHref = rowEvent.categoryHref ?? `${CONTENT_BASE}/categories/${category}/index.html`;
  const relatedLabel = rowEvent.relatedLabel ?? `More ${categoryLabel}`;
  const relatedDetail = rowEvent.relatedDetail ?? 'Devices, trade shows, product showcases and consumer technology calendars.';
  const isMusic = category === 'music';
  const locationLabel = rowEvent.displayLocation || rowEvent.location;
  const visibleLocationLabel = rowEvent.country ? placeWithCountry(locationLabel, rowEvent.country) : linkCountryInPlace(locationLabel);
  const schemaEvent = {
    '@type': 'Event',
    name: rowEvent.startDate ? `${rowEvent.name} ${rowEvent.startDate.slice(0, 4)}` : rowEvent.name,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: rowEvent.location === 'Online' ? 'https://schema.org/OnlineEventAttendanceMode' : 'https://schema.org/MixedEventAttendanceMode',
    image: `https://one-sliders.com${imageRoot}/${rowEvent.slug}-hero.png`,
    description: rowEvent.metaDescription,
    location: { '@type': 'Place', name: locationLabel },
    organizer: rowEvent.officialUrl ? { '@type': 'Organization', name: rowEvent.name, url: rowEvent.officialUrl } : undefined,
    url: `https://one-sliders.com${rowEvent.canonicalPath}`
  };
  if (rowEvent.startDate) schemaEvent.startDate = rowEvent.startDate;
  if (rowEvent.endDate) schemaEvent.endDate = rowEvent.endDate;
  Object.keys(schemaEvent).forEach((key) => schemaEvent[key] === undefined && delete schemaEvent[key]);
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      schemaEvent,
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Events', item: 'https://one-sliders.com/content/events/index.html' },
          { '@type': 'ListItem', position: 2, name: categoryLabel, item: `https://one-sliders.com${categoryHref}` },
          { '@type': 'ListItem', position: 3, name: rowEvent.topicLabel, item: `https://one-sliders.com${rowEvent.topicHref}` },
          { '@type': 'ListItem', position: 4, name: rowEvent.name, item: `https://one-sliders.com${rowEvent.canonicalPath}` }
        ]
      }
    ]
  };
  const cards = rowEvent.cards.map((card) => {
    const label = Array.isArray(card) ? card[0] : card.label;
    const title = Array.isArray(card) ? card[1] : card.title;
    const detail = Array.isArray(card) ? card[2] : card.detail;
    const htmlTitle = !Array.isArray(card) && card.htmlTitle;
    const safeTitle = htmlTitle && String(title || '').includes('class="country"')
      ? title
      : linkCountryInPlace(title);
    return `<div class="event-info-card"><span>${esc(label)}</span><strong>${safeTitle}</strong>${detail ? `<p>${esc(detail)}</p>` : ''}</div>`;
  }).join('');
  return `<!doctype html>
<html lang="en">
<head>
  <link rel="stylesheet" href="/assets/css/oneslider-core.css">
  <script defer src="/assets/js/oneslider-core.js"></script>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="os-back-href" content="${pageTopicHref}">
  <meta name="os-back-label" content="${esc(rowEvent.topicLabel)}">
  <meta name="os-page-title" content="${esc(rowEvent.name)}">
  <link rel="icon" href="/assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="/assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="/assets/icons/site.webmanifest">
  <link rel="stylesheet" href="${CSS_BASE}/colors.css">
  <link rel="stylesheet" href="${CSS_BASE}/shapes.css">
  <link rel="stylesheet" href="${CSS_BASE}/typography.css">
  <link rel="stylesheet" href="${CSS_BASE}/event-v2.css">
  <link rel="stylesheet" href="${CSS_BASE}/event-overview.css">
  <link rel="stylesheet" href="${CSS_BASE}/event-booking-left.css">
  <link id="palette-css" rel="stylesheet" href="/assets/css/palettes/oneslider-palette-harmonized.css">
  <link rel="canonical" href="https://one-sliders.com${rowEvent.canonicalPath}">
  <meta name="description" content="${esc(rowEvent.metaDescription)}">
  <meta property="og:title" content="${esc(rowEvent.name)} - Event Guide">
  <meta property="og:description" content="${esc(rowEvent.metaDescription)}">
  <meta property="og:image" content="https://one-sliders.com${imageRoot}/${rowEvent.slug}-hero.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="https://one-sliders.com${rowEvent.canonicalPath}">
  <meta name="twitter:card" content="summary_large_image">
  <title>${esc(rowEvent.name)} - Event Guide</title>
  <script type="application/ld+json">${json(schema)}</script>
</head>
<body class="event-dashboard onepage country-onepage event-booking-left" data-cat="${esc(category)}" data-os-category="${esc(category)}">
  ${nav({ topicLabel: rowEvent.topicLabel, topicHref: pageTopicHref })}
  <main class="page-shell page-content page-frame">
    <div class="layout-columns">
      <div class="layout__a">
        <div class="hero">
          <picture class="hero__image">
            <source srcset="${imageRoot}/${rowEvent.slug}-hero-400.webp 400w, ${imageRoot}/${rowEvent.slug}-hero-768.webp 768w, ${imageRoot}/${rowEvent.slug}-hero-1200.webp 1200w" sizes="(max-width: 860px) 100vw, 42vw" type="image/webp">
            <img src="${hero}" alt="${esc(rowEvent.name)}" width="1200" height="630" loading="eager" decoding="async">
          </picture>
          <div class="hero__title-row">
            <h1 class="hero__title">${esc(rowEvent.name)}</h1>
          </div>
          ${bookingPanel(rowEvent)}
          <nav class="event-related-links" aria-label="Related links">
            <a class="event-related-topic-card" href="${pageTopicHref}">
              <img src="${rowEvent.topicImage}" alt="" width="400" height="300" loading="lazy">
              <span>${esc(relatedLabel)}</span>
              <strong>${esc(rowEvent.topicLabel)} topic</strong>
              <p>${esc(relatedDetail)}</p>
            </a>
          </nav>
        </div>
      </div>
      <div class="layout__b">
        <section class="event-panel event-panel--single" id="overview" aria-labelledby="overview-title">
          <p class="event-section-kicker">Content / info</p>
          <p id="overview-title" class="event-panel-title">${esc(rowEvent.name)} planning notes</p>
          <p>${esc(rowEvent.description)}</p>
          ${statStrip([
            ['Date', rowEvent.dateLabel],
            [rowEvent.venue ? 'Venue' : 'Location', { value: visibleLocationLabel, html: true }],
            ...(isMusic ? [] : [['Topic', rowEvent.topicLabel]])
          ].filter(([, value]) => value))}
          <div class="event-info-grid">
            ${cards}
          </div>
        </section>
      </div>
    </div>
  </main>
</body>
</html>`;
}

function renderTechnologyExample(rowEvent) {
  const imageRoot = rowEvent.sourceImageRoot;
  const hero = `${imageRoot}/${rowEvent.slug}-hero.png`;
  const topicImage = '/content/categories/culture/img/tech-events-mini.png';
  const pageTopicHref = writeDev ? `/Dev${rowEvent.topicHref}` : rowEvent.topicHref;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Event',
        name: 'Google I/O 2027',
        startDate: '2027-05-12',
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
        image: `https://one-sliders.com${imageRoot}/${rowEvent.slug}-hero.png`,
        description: rowEvent.metaDescription,
        location: { '@type': 'Place', name: 'Mountain View / online' },
        organizer: { '@type': 'Organization', name: 'Google', url: 'https://io.google/' },
        url: `https://one-sliders.com${rowEvent.canonicalPath}`
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Events', item: 'https://one-sliders.com/content/events/index.html' },
          { '@type': 'ListItem', position: 2, name: 'Technology', item: 'https://one-sliders.com/content/categories/technology/index.html' },
          { '@type': 'ListItem', position: 3, name: rowEvent.topicLabel, item: `https://one-sliders.com${rowEvent.topicHref}` },
          { '@type': 'ListItem', position: 4, name: rowEvent.name, item: `https://one-sliders.com${rowEvent.canonicalPath}` }
        ]
      }
    ]
  };

  return `<!doctype html>
<html lang="en">
<head>
  <link rel="stylesheet" href="/assets/css/oneslider-core.css">
  <script defer src="/assets/js/oneslider-core.js"></script>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="os-back-href" content="${pageTopicHref}">
  <meta name="os-back-label" content="${esc(rowEvent.topicLabel)}">
  <meta name="os-page-title" content="${esc(rowEvent.name)}">
  <link rel="icon" href="/assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="/assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="/assets/icons/site.webmanifest">
  <link rel="stylesheet" href="${CSS_BASE}/colors.css">
  <link rel="stylesheet" href="${CSS_BASE}/shapes.css">
  <link rel="stylesheet" href="${CSS_BASE}/typography.css">
  <link rel="stylesheet" href="${CSS_BASE}/event-v2.css">
  <link rel="stylesheet" href="${CSS_BASE}/event-overview.css">
  <link rel="stylesheet" href="${CSS_BASE}/event-booking-left.css">
  <link id="palette-css" rel="stylesheet" href="/assets/css/palettes/oneslider-palette-harmonized.css">
  <link rel="canonical" href="https://one-sliders.com${rowEvent.canonicalPath}">
  <meta name="description" content="${esc(rowEvent.metaDescription)}">
  <meta property="og:title" content="${esc(rowEvent.name)} - Next Edition &amp; Planning">
  <meta property="og:description" content="${esc(rowEvent.metaDescription)}">
  <meta property="og:image" content="https://one-sliders.com${imageRoot}/${rowEvent.slug}-hero.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="https://one-sliders.com${rowEvent.canonicalPath}">
  <meta name="twitter:card" content="summary_large_image">
  <title>${esc(rowEvent.name)} - Next Edition &amp; Planning</title>
  <script type="application/ld+json">${json(schema)}</script>
</head>
<body class="event-dashboard onepage country-onepage event-booking-left" data-cat="technology" data-os-category="technology">
  ${nav({ topicLabel: rowEvent.topicLabel, topicHref: pageTopicHref })}
  <main class="page-shell page-content page-frame">
    <div class="layout-columns">
      <div class="layout__a">
        <div class="hero">
          <picture class="hero__image">
            <source srcset="${imageRoot}/${rowEvent.slug}-hero-400.webp 400w, ${imageRoot}/${rowEvent.slug}-hero-768.webp 768w, ${imageRoot}/${rowEvent.slug}-hero-1200.webp 1200w" sizes="(max-width: 860px) 100vw, 42vw" type="image/webp">
            <img src="${hero}" alt="${esc(rowEvent.name)}" width="1200" height="630" loading="eager" decoding="async">
          </picture>
          <div class="hero__title-row">
            <h1 class="hero__title">${esc(rowEvent.name)}</h1>
          </div>
          <section class="stay-booking-panel hero-stay-booking" aria-label="Booking and planning">
            <div class="stay-booking-panel__header">
              <p class="stay-section-label">
                <span class="booking-symbols booking-symbols--small" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false"><path d="M4 21V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13"></path><path d="M3 21h18"></path><path d="M8 10h1"></path><path d="M12 10h1"></path><path d="M18 21v-6h1a2 2 0 0 1 2 2v4"></path></svg>
                  <svg viewBox="0 0 24 24" focusable="false"><path d="M10.5 4.5 13 12l6.5 2a1.5 1.5 0 0 1 .25 2.78l-1.1.55a2 2 0 0 1-1.75.02L12 15.5 8.5 20H6l2-6-5-3V8.5l5 1.5 1-5.5h1.5Z"></path></svg>
                </span>
                <span>BOOK HOTELS &amp; FLIGHTS</span>
              </p>
              <h2 class="stay-section-title">Book stays for Google I/O</h2>
            </div>
            <div class="stay-form-row">
              <div class="stay-form-field">
                <label class="stay-field-label" for="stay-checkin">CHECK-IN</label>
                ${textDateInput('stay-checkin', '2027-05-11')}
              </div>
              <div class="stay-form-field">
                <label class="stay-field-label" for="stay-checkout">CHECK-OUT</label>
                ${textDateInput('stay-checkout', '2027-05-13')}
              </div>
            </div>
            <div class="stay-form-row">
              <div class="stay-form-field">
                <label class="stay-field-label" for="stay-guests">GUESTS</label>
                <input type="number" id="stay-guests" class="stay-field-input" value="2" min="1" max="10">
              </div>
              <div class="stay-form-field">
                <label class="stay-field-label" for="stay-rooms">ROOMS</label>
                <input type="number" id="stay-rooms" class="stay-field-input" value="1" min="1" max="5">
              </div>
            </div>
            <p class="stay-field-label stay-area-label">AREA</p>
            <div class="stay-area-pills">
              <label class="stay-area-pill"><input type="radio" name="stay-region" value="Mountain View" checked><span>Mountain View</span></label>
              <label class="stay-area-pill"><input type="radio" name="stay-region" value="Palo Alto"><span>Palo Alto</span></label>
              <label class="stay-area-pill"><input type="radio" name="stay-region" value="San Jose"><span>San Jose</span></label>
              <label class="stay-area-pill"><input type="radio" name="stay-region" value="San Francisco"><span>San Francisco</span></label>
            </div>
            <a class="stay-check-btn" href="${BOOKING_BASE}ss=Mountain%20View%2C%20California" target="_blank" rel="nofollow sponsored noopener">Check hotel prices</a>
            <p class="stay-booking-note">OneSliders may earn a commission if you book through Booking.com.</p>
          </section>
          <nav class="event-related-links" aria-label="Related links">
            <a class="event-related-topic-card" href="${pageTopicHref}">
              <img src="${topicImage}" alt="" width="400" height="300" loading="lazy">
              <span>More Technology</span>
              <strong>${esc(rowEvent.topicLabel)} topic</strong>
              <p>Platform roadmaps, SDK launches and keynotes for builders.</p>
            </a>
          </nav>
        </div>
      </div>
      <div class="layout__b">
        <section class="event-panel event-panel--single" id="overview" aria-labelledby="overview-title">
          <p class="event-section-kicker">Content / info</p>
          <p id="overview-title" class="event-panel-title">Google I/O planning notes</p>
          <p>${esc(rowEvent.description)}</p>
          <div class="event-info-grid">
            <div class="event-info-card"><span>Why follow it</span><strong>Google's public developer roadmap</strong><p>Google I/O connects Gemini, Android, Chrome, Cloud, Search and developer tooling into one public event.</p></div>
            <div class="event-info-card"><span>Latest recap</span><strong>19-20 May 2026</strong><p>The latest completed edition was at Shoreline Amphitheatre and online, with AI-heavy product and developer updates.</p></div>
            <div class="event-info-card"><span>Next editions</span><strong>2027 and 2028 expected dates</strong><p>Current tracker data lists 12 May 2027 and 9 May 2028, with official confirmation still required before booking.</p></div>
            <div class="event-info-card"><span>Program parts</span><strong>Keynote, Gemini, Android and web</strong><ul><li>Main keynote</li><li>Gemini and developer tooling</li><li>Android, Chrome and web platform updates</li></ul></div>
            <div class="event-info-card"><span>Planning note</span><strong>Confirm before travel</strong><p>Dates, venue access and in-person registration can change by edition. Treat unconfirmed planning details as TBC.</p></div>
          </div>
        </section>
      </div>
    </div>
  </main>
</body>
</html>`;
}

const musicTopicLabels = {
  'music-festivals': 'Music Festivals',
  'song-contests': 'Song Contests',
  'world-music': 'World Music',
  rock: 'Rock',
  'hard-rock': 'Hard Rock',
  trance: 'Trance'
};

function stripTags(value = '') {
  return String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeHtml(value = '') {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&mdash;/g, '-')
    .replace(/&ndash;/g, '-')
    .replace(/&nbsp;/g, ' ')
    .replace(/Ã¢â‚¬â€/g, '-')
    .replace(/Ã¢â‚¬â€œ/g, '-')
    .replace(/Ã¢â‚¬â„¢/g, "'")
    .replace(/Ã¢â‚¬Å“/g, '"')
    .replace(/Ã¢â‚¬Â/g, '"');
}

function attrValue(html, name) {
  const match = html.match(new RegExp(`${name}="([^"]*)"`, 'i'));
  return match ? decodeHtml(match[1]) : '';
}

function firstMatch(html, patterns) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHtml(stripTags(match[1]));
  }
  return '';
}

function dateLabelFromIso(startDate, endDate) {
  if (!startDate) return '';
  const start = new Date(`${startDate}T12:00:00Z`);
  if (Number.isNaN(start.getTime())) return startDate;
  const sameYear = endDate && endDate.slice(0, 4) === startDate.slice(0, 4);
  const end = endDate ? new Date(`${endDate}T12:00:00Z`) : null;
  const startLabel = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: sameYear ? undefined : 'numeric', timeZone: 'UTC' });
  if (!end || Number.isNaN(end.getTime()) || endDate === startDate) {
    return start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  }
  const endLabel = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  return `${startLabel}-${endLabel}`;
}

function addDaysIso(date, days) {
  if (!date) return '';
  const parsed = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return '';
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

function cityAreas(location) {
  const clean = decodeHtml(location || '').replace(/\s*\/\s*online$/i, '').trim();
  if (!clean) return [];
  const first = clean.split(',')[0].trim();
  const country = clean.includes(',') ? clean.split(',').slice(1).join(',').trim() : '';
  const areas = [first, clean];
  if (country) areas.push(country);
  return [...new Set(areas.filter(Boolean))].slice(0, 4);
}

function splitLocationParts(location) {
  const parts = decodeHtml(location || '').split(',').map((part) => part.trim()).filter(Boolean);
  return {
    first: parts[0] || '',
    country: parts.length > 1 ? parts.at(-1) : '',
    cityCountry: parts.length > 1 ? parts.slice(-2).join(', ') : parts[0] || ''
  };
}

function musicCards({ name, dateLabel, venue, location, displayLocation, cityCountry, countryName, officialUrl }) {
  const linkedCityCountry = countryName ? placeWithCountry(cityCountry || location, countryName) : esc(cityCountry || location);
  const linkedDisplayLocation = countryName ? placeWithCountry(displayLocation || location, countryName) : esc(displayLocation || location || 'Venue TBC');
  const whereTitle = venue ? `${esc(venue)}, ${linkedCityCountry}` : linkedDisplayLocation || 'Venue TBC';
  const whereDetail = venue
    ? `Plan around ${venue} first, then compare hotels and late transport in ${cityCountry || location}. Check gate, bag and entry rules before the show.`
    : `Use the official event page to pin down the exact venue, entry gates and transport plan before choosing where to stay.`;
  const ticketDetail = officialUrl
    ? `Start with the official artist, venue or organiser link for ticket releases, resale rules, age limits and door times.`
    : `Start with the organiser or venue page for ticket releases, resale rules, age limits and door times.`;
  return [
    ['When it happens', dateLabel || 'Date watchlist', dateLabel ? `${name} is listed for ${dateLabel}. Use the event page for door time, support acts and any late schedule changes.` : `Use the organiser page for the confirmed date, door time and schedule before booking travel.`],
    ['Where it happens', whereTitle, whereDetail, true],
    ['Tickets and entry', 'Use official channels first', ticketDetail],
    ['Stay and transport', venue ? `Base the trip around ${venue}` : 'Base the trip around the confirmed venue', `For a concert, the useful choice is not just the city: compare walking routes, late public transport, taxi pickup points and hotels that still work after the show.`]
  ].map(([label, title, detail, htmlTitle]) => ({ label, title, detail, htmlTitle }));
}

function musicLinkTargets() {
  const musicDir = path.join(DEV_ROOT, 'content', 'categories', 'music');
  const rows = [];
  for (const file of fs.readdirSync(musicDir).filter((name) => name.endsWith('.html'))) {
    const topic = file.replace(/\.html$/, '');
    const html = fs.readFileSync(path.join(musicDir, file), 'utf8');
    const linkMatches = html.matchAll(/<a\b[^>]*href="([^"]*events\/[^"]+\.html)"[^>]*>([\s\S]*?)<\/a>/g);
    for (const match of linkMatches) {
      const href = match[1];
      if (href.includes('events/index.html') || href.startsWith('../culture/')) continue;
      let normalized = href.replace(/^\.\//, '');
      if (!normalized.startsWith('music-festivals/') && !normalized.startsWith('song-contests/') && !normalized.startsWith('world-music/') && !normalized.startsWith(`${topic}/events/`)) {
        normalized = `${topic}/${normalized}`;
      }
      rows.push({
        sourceTopic: topic,
        href,
        normalized,
        officialUrl: attrValue(match[0], 'data-official'),
        venue: attrValue(match[0], 'data-venue'),
        startDate: attrValue(match[0], 'data-start'),
        endDate: attrValue(match[0], 'data-end'),
        title: firstMatch(match[2], [/<strong[^>]*>([\s\S]*?)<\/strong>/i, /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i]),
        cardDate: firstMatch(match[2], [/<time[^>]*>([\s\S]*?)<\/time>/i]),
        cardLocation: firstMatch(match[2], [/<p[^>]*>([\s\S]*?)<\/p>/i])
      });
    }
  }
  if (!writeDev) {
    const sourceMusicDir = path.join(ROOT, 'content', 'categories', 'music');
    const topicsWithEvents = fs.readdirSync(sourceMusicDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((topic) => fs.existsSync(path.join(sourceMusicDir, topic, 'events')));
    for (const topic of topicsWithEvents) {
      const eventDir = path.join(sourceMusicDir, topic, 'events');
      for (const file of fs.readdirSync(eventDir).filter((name) => name.endsWith('.html'))) {
        rows.push({
          sourceTopic: topic,
          href: `./${topic}/events/${file}`,
          normalized: `${topic}/events/${file}`,
          startDate: '',
          endDate: '',
          title: '',
          cardDate: '',
          cardLocation: ''
        });
      }
    }
  }
  const unique = new Map();
  rows.forEach((row) => {
    const existing = unique.get(row.normalized);
    if (!existing) {
      unique.set(row.normalized, row);
      return;
    }
    const existingHasDate = Boolean(existing.startDate);
    const rowHasDate = Boolean(row.startDate);
    const existingIsFeatured = /^featured$/i.test(existing.cardDate || '');
    const rowIsFeatured = /^featured$/i.test(row.cardDate || '');
    if ((!existingHasDate && rowHasDate) || (existingIsFeatured && !rowIsFeatured)) {
      unique.set(row.normalized, row);
    }
  });
  return [...unique.values()];
}

function musicEventFromSource(link) {
  const sourcePath = path.join(ROOT, 'content', 'categories', 'music', ...link.normalized.split('/'));
  const html = fs.existsSync(sourcePath) ? fs.readFileSync(sourcePath, 'utf8') : '';
  const parts = link.normalized.split('/');
  const topic = parts[0];
  const slug = parts.at(-1).replace(/\.html$/, '');
  const topicLabel = musicTopicLabels[topic] ?? topic.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  const name = decodeHtml(link.title || firstMatch(html, [/<meta property="og:title" content="([^"]+)"/i, /<title>([\s\S]*?)<\/title>/i])).replace(/\s+-\s+.*$/, '').replace(/\s+â€”\s+.*$/, '').trim();
  const sourceDescription = decodeHtml(attrValue(html.match(/<meta name="description" content="[^"]*"/i)?.[0] ?? '', 'content') || attrValue(html.match(/<meta property="og:description" content="[^"]*"/i)?.[0] ?? '', 'content') || `${name} event guide for ${topicLabel}.`);
  const cardDateText = decodeHtml(link.cardDate || '');
  const pendingDate = /\bdates?\s+pending\b/i.test(cardDateText);
  const startDate = (link.startDate || (pendingDate ? '' : firstMatch(html, [/"startDate"\s*:\s*"([^"]+)"/i]))).slice(0, 10);
  const endDate = (link.endDate || (pendingDate ? '' : firstMatch(html, [/"endDate"\s*:\s*"([^"]+)"/i]))).slice(0, 10);
  const rawCardLocation = stripTags(link.cardLocation || '');
  const cardLocation = /^(open|explore)\b/i.test(rawCardLocation) ? '' : rawCardLocation;
  const venue = decodeHtml(link.venue || '');
  let location = decodeHtml(cardLocation || firstMatch(html, [/"location"\s*:\s*\{[\s\S]*?"name"\s*:\s*"([^"]+)"/i]) || topicLabel);
  if (venue && location.toLowerCase().startsWith(`${venue.toLowerCase()},`)) {
    location = location.slice(venue.length + 1).trim();
  }
  const imageRoot = `/content/categories/music/${topic}/events/img`;
  const dateLabel = dateLabelFromIso(startDate, endDate) || cardDateText;
  const displayLocation = venue ? `${venue}, ${location}` : location;
  const { first: city, country, cityCountry } = splitLocationParts(location);
  const bookingCity = location && !/online/i.test(location) ? location : link.cardLocation;
  const areas = venue ? uniqueList([venue, city, cityCountry, country]).slice(0, 4) : cityAreas(bookingCity || location);
  const description = link.title
    ? `${name} is a live music event${displayLocation ? ` at ${displayLocation}` : ''}${dateLabel ? ` on ${dateLabel}` : ''}. Use this page to plan venue access, tickets, stays and transport around the show.`
    : sourceDescription;
  const eventYear = startDate ? new Date(startDate).getFullYear() : '';
  const stayNear = city || location;
  const metaDescription = compactMetaDescription(
    `${name}: venue, tickets and where to stay near ${stayNear}.`
  );
  return {
    category: 'music',
    categoryLabel: 'Music',
    categoryHref: `${CONTENT_BASE}/categories/music/index.html`,
    topic,
    topicLabel,
    topicHref: `${CONTENT_BASE}/categories/music/${topic}.html`,
    canonicalPath: `/content/categories/music/${topic}/events/${slug}.html`,
    sourceImageRoot: imageRoot,
    topicImage: `/content/categories/music/img/${topic}-mini.png`,
    relatedLabel: 'More Music',
    relatedDetail: 'Festivals, contests, live stages and music travel calendars.',
    name,
    slug,
    description,
    metaDescription,
    dateLabel,
    checkIn: addDaysIso(startDate, -1),
    checkOut: addDaysIso(endDate || startDate, 1),
    startDate,
    endDate,
    location,
    displayLocation,
    venue,
    city,
    country,
    bookingCity,
    areas,
    officialUrl: link.officialUrl || '',
    sources: link.officialUrl ? [{ label: 'Official site', url: link.officialUrl }] : [],
    cards: musicCards({ name, dateLabel, venue, location, displayLocation, cityCountry, countryName: country, officialUrl: link.officialUrl })
  };
}

function compactMetaDescription(value, limit = 155) {
  const clean = String(value || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= limit) return clean;
  const cut = clean.slice(0, limit + 1);
  const atSentence = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (atSentence >= 80) return clean.slice(0, atSentence + 1).trim();
  const atWord = cut.lastIndexOf(' ');
  return clean.slice(0, atWord > 80 && atWord <= limit ? atWord : limit).trim();
}

function readJsonFile(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function golfEdition(data) {
  return (data.editions || []).find((edition) => edition.year === data.defaultYear) ||
    (data.editions || []).at(-1) ||
    {};
}

function golfCountryMarkup(item = {}) {
  if (!item.name) return '';
  return country({ name: item.name, href: item.url || item.countryUrl || '#', flag: item.flag || item.countryFlag || '' });
}

function golfRecentResults(data) {
  return (data.editions || [])
    .filter((edition) => edition.status === 'past' && edition.winner?.name)
    .sort((a, b) => (b.year || 0) - (a.year || 0))
    .slice(0, 5);
}

function golfEventFromYearData(data) {
  const edition = golfEdition(data);
  const modules = edition.currentModules || {};
  const hotel = modules.hotel || {};
  const firstCity = edition.cities?.[0]?.name || hotel.destination || '';
  const venue = edition.venue && edition.venue !== 'TBC' ? edition.venue : '';
  const destination = hotel.destination || firstCity;
  const recentResults = golfRecentResults(data);
  return {
    category: 'sport',
    categoryLabel: 'Sport',
    categoryHref: `${CONTENT_BASE}/categories/sport/index.html`,
    topic: 'golf',
    topicLabel: 'Golf',
    topicHref: `${CONTENT_BASE}/categories/sport/golf.html`,
    canonicalPath: `/content/categories/sport/golf/events/${data.slug}.html`,
    sourceImageRoot: '/content/categories/sport/golf/events/img',
    topicImage: '/content/categories/sport/img/golf-mini.png',
    relatedLabel: 'More Golf',
    relatedDetail: 'More majors, courses and event listings.',
    name: data.eventName,
    slug: data.slug,
    metaDescription: `${data.eventName}: venue, golf trip planning and recent results.`,
    description: golfEventDescription(data, edition, venue, firstCity, recentResults),
    dateLabel: edition.dates || '',
    startDate: edition.startDate || '',
    endDate: edition.endExclusive || '',
    checkIn: hotel.checkIn || addDaysIso(edition.startDate, -1),
    checkOut: hotel.checkOut || edition.endExclusive || '',
    bookingCity: hotel.stayAreas?.[0] || destination,
    areas: hotel.stayAreas || cityAreas(destination),
    venue,
    location: firstCity,
    displayLocation: venue ? `${venue}, ${firstCity}` : firstCity,
    edition,
    yearData: data,
    hotel,
    golfTrip: modules.golfTrip || {},
    faq: modules.faq || [],
    recentResults
  };
}

function golfEventDescription(data, edition, venue, firstCity, recentResults = []) {
  const year = edition.year || '';
  const override = golfKnownOverride(data.slug);
  if (data.slug === 'john-deere-classic') {
    return 'John Deere Classic returns to TPC Deere Run in Silvis, Illinois, the Quad Cities PGA TOUR stop known for aggressive scoring, reachable rough and a closing stretch where birdies decide the week.';
  }
  if (override.dates && override.venue) {
    return `${data.eventName} ${year} is scheduled for ${override.dates} at ${override.venue} in ${override.location}. ${override.detail}`;
  }
  const latest = recentResults[0];
  const winner = latest?.winner?.name;
  const winnerScore = latest?.winner?.final || latest?.resultLabel || '';
  const cleanVenue = venue && !/^(TBC|Not listed in imported feed)$/i.test(venue) ? venue : '';
  const place = [cleanVenue, firstCity].filter(Boolean).join(' in ');
  const resultLine = winner ? ` The latest imported result has ${winner}${winnerScore ? ` winning at ${winnerScore}` : ''}.` : '';
  if (place) {
    return `${data.eventName} ${year} is tracked around ${place}, with current edition dates and recent leaderboard history imported for golf-trip planning.${resultLine}`;
  }
  return `${data.eventName} ${year} is tracked with current edition dates and recent leaderboard history imported for golf-trip planning.${resultLine}`;
}

function golfFact(label, value) {
  if (!value) return '';
  return `<div class="event-info-card"><span>${esc(label)}</span><strong>${value}</strong></div>`;
}

function golfInfoCard(label, title, detail = '') {
  return `<div class="event-info-card"><span>${esc(label)}</span><strong>${title}</strong>${detail ? `<p>${detail}</p>` : ''}</div>`;
}

function golfKnownOverride(slug) {
  return {
    'masters-tournament': {
      dates: 'April 9-12, 2026',
      venue: 'Augusta National Golf Club',
      location: 'Augusta, Georgia',
      detail: 'First men\'s major of the year, played at Augusta National.'
    },
    'pga-championship': {
      dates: 'May 14-17, 2026',
      venue: 'Aronimink Golf Club',
      location: 'Newtown Square, Pennsylvania',
      detail: 'The 108th PGA Championship is at Aronimink, west of Philadelphia.'
    },
    'us-open-golf': {
      dates: 'June 18-21, 2026',
      venue: 'Shinnecock Hills Golf Club',
      location: 'Southampton, New York',
      detail: 'Shinnecock Hills is a demanding USGA setup with wind, firm turf and exposed greens.'
    },
    'the-open-championship': {
      dates: 'July 16-19, 2026',
      venue: 'Royal Birkdale',
      location: 'Southport, England',
      detail: 'The Open returns to Royal Birkdale on the English links coast.'
    },
    'us-womens-open-golf': {
      dates: 'June 4-7, 2026',
      venue: 'Riviera Country Club',
      location: 'Pacific Palisades, California',
      detail: 'The USGA women\'s major is staged at Riviera, one of Los Angeles golf\'s landmark courses.'
    },
    'chevron-championship': {
      dates: 'April 23-26, 2026',
      venue: 'The Club at Carlton Woods',
      location: 'The Woodlands, Texas',
      detail: 'LPGA major week at Carlton Woods.'
    },
    '3m-open': {
      dates: 'July 23-26, 2026',
      venue: 'TPC Twin Cities',
      location: 'Blaine, Minnesota',
      detail: 'A late-summer PGA TOUR stop where recent winners have gone very low.'
    },
    'blue-bay-lpga': {
      dates: 'March 5-8, 2026',
      venue: 'Jian Lake Blue Bay Golf Club',
      location: 'Hainan, China',
      detail: 'LPGA stop in China with imported 2026 final leaderboard data.'
    }
  }[slug] || {};
}

function golfCleanDateLabel(rowEvent) {
  const override = golfKnownOverride(rowEvent.slug);
  if (override.dates) return { label: 'When', title: override.dates, detail: override.detail || '' };
  const date = rowEvent.dateLabel || '';
  if (date.startsWith('Final day listed:')) {
    return { label: 'Final round', title: date.replace('Final day listed:', '').trim(), detail: 'Only the final schedule date is imported for this event.' };
  }
  return { label: 'When', title: date, detail: rowEvent.startDate ? 'Current tracked edition.' : '' };
}

function golfCleanPlace(rowEvent) {
  const override = golfKnownOverride(rowEvent.slug);
  const venue = override.venue || (rowEvent.venue && !/^(TBC|Not listed in imported feed)$/i.test(rowEvent.venue) ? rowEvent.venue : '');
  const location = override.location || rowEvent.location || '';
  if (venue) return { title: venue, detail: location && location !== venue ? location : '' };
  return { title: location || 'Venue to confirm', detail: '' };
}

function golfScoreNumber(value) {
  const normalized = String(value ?? '').trim();
  if (!normalized || normalized === 'E') return normalized === 'E' ? 0 : null;
  const number = Number(normalized.replace('+', ''));
  return Number.isFinite(number) ? number : null;
}

function golfRecentScoreSentence(results = []) {
  const scored = results
    .map((edition) => ({ edition, score: golfScoreNumber(edition.winner?.final || edition.resultLabel?.match(/[+-]?\d+|E/)?.[0]) }))
    .filter((item) => item.score !== null);
  if (scored.length < 2) return '';
  const best = scored.reduce((lowest, item) => item.score < lowest.score ? item : lowest, scored[0]);
  const latest = scored[0];
  const years = scored.map((item) => item.edition.year).filter(Boolean);
  return `${esc(years.at(-1))}-${esc(years[0])} winning scores range from ${golfScoreLabel(best.score)} to ${golfScoreLabel(Math.max(...scored.map((item) => item.score)))}; latest winner finished ${golfScoreLabel(latest.score)}.`;
}

function golfTopNames(edition, limit = 4) {
  return (edition?.scoreProgression?.players || [])
    .slice(0, limit)
    .map((player) => player.name)
    .filter(Boolean)
    .join(', ');
}

function golfOverviewCards(rowEvent) {
  const cleanDate = golfCleanDateLabel(rowEvent);
  const cleanPlace = golfCleanPlace(rowEvent);
  if (rowEvent.slug === 'john-deere-classic') {
    const winner = rowEvent.recentResults[0]?.winner ? golfCountryMarkup(rowEvent.recentResults[0].winner) : 'Brian Campbell';
    return [
      golfInfoCard(cleanDate.label, esc(cleanDate.title), 'Four tournament rounds at TPC Deere Run.'),
      golfInfoCard('Where', esc(cleanPlace.title), esc(cleanPlace.detail || 'Silvis, Illinois, in the Quad Cities area.')),
      golfInfoCard('Defending champion', winner, 'Brian Campbell beat Emiliano Grillo in a playoff in 2025 after both finished at -18.'),
      golfInfoCard('2026 field', esc('Jordan Spieth, Max Homa, Tom Kim, Rickie Fowler'), 'PGA TOUR field data also lists J.T. Poston, Davis Thompson, Ben Griffin, Keith Mitchell, Matt Kuchar and Jackson Koivun.'),
      golfInfoCard('Course profile', esc('TPC Deere Run rewards low scoring'), 'The par-71 Deere Run setup has produced very low winning totals; Hayden Springer opened with 59 here in 2024.'),
      golfInfoCard('What to watch', esc('Birdie pace and Sunday pressure'), 'The event often turns on who keeps making chances through the closing stretch rather than who merely survives the course.')
    ].join('');
  }
  const defendingWinner = rowEvent.recentResults[0]?.winner ? golfCountryMarkup(rowEvent.recentResults[0].winner) : '';
  const latest = rowEvent.recentResults[0];
  const latestTopNames = golfTopNames(latest);
  const scoringSentence = golfRecentScoreSentence(rowEvent.recentResults);
  const hasSpecificTripAnchor = rowEvent.hotel.airportNote?.title && !/^Check the nearest major airport$/i.test(rowEvent.hotel.airportNote.title);
  const cards = [
    golfInfoCard(cleanDate.label, esc(cleanDate.title), esc(cleanDate.detail)),
    golfInfoCard('Where', esc(cleanPlace.title), esc(cleanPlace.detail)),
    defendingWinner ? golfInfoCard('Defending champion', defendingWinner, esc(latest?.resultLabel || '')) : '',
    scoringSentence ? golfInfoCard('Recent scoring', esc('Winning number matters here'), scoringSentence) : '',
    latestTopNames ? golfInfoCard('Last leaderboard', esc(latestTopNames), esc(`${rowEvent.name} ${latest.year || ''} final top names from imported leaderboard history.`)) : '',
    hasSpecificTripAnchor ? golfInfoCard('Trip anchor', esc(rowEvent.hotel.airportNote.title), esc(rowEvent.hotel.airportNote.detail)) : ''
  ];
  return cards.filter(Boolean).join('');
}

function golfScoreLabel(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return esc(value || '');
  if (number === 0) return 'E';
  return number > 0 ? `+${number}` : `${number}`;
}

function golfPlayerRoundTotals(player, par = 72) {
  if (Array.isArray(player.toParByRound) && player.toParByRound.length) {
    return player.toParByRound.map((value) => Number(value)).filter((value) => Number.isFinite(value));
  }
  let total = 0;
  return (player.scores || []).map((score, index) => {
    total += Number(score);
    return total - (Number(par) || 72) * (index + 1);
  }).filter((value) => Number.isFinite(value));
}

function golfLeaderboardRows(progression = {}) {
  const par = progression.par || 72;
  return (progression.players || []).slice(0, 8).map((player) => ({
    player,
    values: golfPlayerRoundTotals(player, par)
  })).filter((row) => row.values.length);
}

function golfLeaderboardSvg(progression = {}) {
  const rows = golfLeaderboardRows(progression);
  const rounds = progression.rounds || ['R1', 'R2', 'R3', 'R4'];
  if (!rows.length) {
    return `<div class="golf-history-chart golf-history-chart--empty"><p>${esc(progression.emptyText || 'Leaderboard graph appears after verified round scores are imported.')}</p></div>`;
  }
  const allValues = rows.flatMap((row) => row.values);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const top = min - 1;
  const bottom = max + 1;
  const span = Math.max(1, bottom - top);
  const xFor = (index) => 60 + index * (640 / Math.max(1, rounds.length - 1));
  const yFor = (value) => 28 + ((value - top) / span) * 170;
  const lines = rows.map((row, index) => {
    const points = row.values.map((value, roundIndex) => `${xFor(roundIndex).toFixed(1)},${yFor(value).toFixed(1)}`).join(' ');
    const circles = row.values.map((value, roundIndex) =>
      `<circle class="golf-history-point golf-history-point--${index % 6}" cx="${xFor(roundIndex).toFixed(1)}" cy="${yFor(value).toFixed(1)}" r="3"></circle>`
    ).join('');
    return `<polyline class="golf-history-line golf-history-line--${index % 6}" points="${points}"></polyline>${circles}`;
  }).join('');
  const labels = rounds.map((round, index) =>
    `<text class="golf-history-axis" x="${xFor(index).toFixed(1)}" y="222">${esc(round)}</text>`
  ).join('');
  return `<div class="golf-history-chart" role="img" aria-label="${esc(progression.ariaLabel || 'Round-by-round leaderboard progression')}">
    <svg viewBox="0 0 760 240" aria-hidden="true" focusable="false">
      <line class="golf-history-grid" x1="60" y1="28" x2="700" y2="28"></line>
      <line class="golf-history-grid" x1="60" y1="${yFor(0).toFixed(1)}" x2="700" y2="${yFor(0).toFixed(1)}"></line>
      <line class="golf-history-grid" x1="60" y1="198" x2="700" y2="198"></line>
      <text class="golf-history-axis golf-history-axis--score" x="52" y="32">${golfScoreLabel(top)}</text>
      <text class="golf-history-axis golf-history-axis--score" x="52" y="${(yFor(0) + 4).toFixed(1)}">E</text>
      <text class="golf-history-axis golf-history-axis--score" x="52" y="202">${golfScoreLabel(bottom)}</text>
      ${lines}
      ${labels}
    </svg>
  </div>`;
}

function golfLeaderboardTable(progression = {}) {
  const rows = golfLeaderboardRows(progression);
  const rounds = progression.rounds || ['R1', 'R2', 'R3', 'R4'];
  if (!rows.length) return '';
  const header = rounds.map((round) => `<th>${esc(round)}</th>`).join('');
  const body = rows.map(({ player, values }) => {
    const cells = rounds.map((_, index) => `<td>${golfScoreLabel(values[index])}</td>`).join('');
    return `<tr>
      <th scope="row">${golfCountryMarkup({ name: player.name, url: player.countryUrl, flag: player.countryFlag })}</th>
      ${cells}
      <td>${golfScoreLabel(player.final ?? values.at(-1))}</td>
    </tr>`;
  }).join('');
  return `<div class="golf-history-table-wrap">
    <table class="golf-history-table">
      <thead><tr><th>Player</th>${header}<th>Total</th></tr></thead>
      <tbody>${body}</tbody>
    </table>
  </div>`;
}

function golfHistoryEditions(rowEvent) {
  return (rowEvent.yearData.editions || [])
    .filter((edition) => edition.status === 'past')
    .sort((a, b) => (a.year || 0) - (b.year || 0));
}

function golfHistoryPanel(rowEvent, edition) {
  const winner = edition.winner ? golfCountryMarkup(edition.winner) : '';
  const venue = edition.venue && !/^(TBC|Not listed in imported feed)$/i.test(edition.venue) ? edition.venue : '';
  return `<div class="golf-history-panel golf-history-panel--${esc(edition.year)}">
    <div class="golf-history-heading">
      <p class="event-panel-title">${esc(rowEvent.name)} ${esc(edition.year)} archive</p>
      <p>${winner ? `<span>Winner ${winner}</span>` : ''}<span>${esc(edition.dates || '')}</span>${venue ? `<span>${esc(venue)}</span>` : ''}</p>
    </div>
    <section class="golf-history-leaderboard" aria-label="Leaderboard">
      <span>Leaderboard</span>
      <strong>Round progression</strong>
      ${golfLeaderboardSvg(edition.scoreProgression || {})}
      ${golfLeaderboardTable(edition.scoreProgression || {})}
    </section>
  </div>`;
}

function renderGolfHistory(rowEvent) {
  const editions = golfHistoryEditions(rowEvent);
  const activeYear = editions.at(-1)?.year || rowEvent.edition.year;
  const inputs = editions.map((edition) =>
    `<input type="radio" name="golf-history-year" id="golf-history-${esc(edition.year)}"${edition.year === activeYear ? ' checked' : ''}>`
  ).join('');
  const labels = editions.map((edition) => {
    const flag = edition.winner?.countryFlag ? `<img src="${edition.winner.countryFlag}" alt="" width="20" height="14" loading="lazy">` : '';
    return `<label for="golf-history-${esc(edition.year)}">${esc(edition.year)}${flag}</label>`;
  }).join('');
  const panels = editions.map((edition) => golfHistoryPanel(rowEvent, edition)).join('');
  return `<div class="golf-history">
    ${inputs}
    <div class="golf-history-years" aria-label="Golf archive years">${labels}</div>
    <div class="golf-history-panels">${panels}</div>
  </div>`;
}

function renderGolfEventV2(rowEvent) {
  const imageRoot = rowEvent.sourceImageRoot;
  const hero = `${imageRoot}/${rowEvent.slug}-hero.png`;
  const pageTopicHref = writeDev ? `/Dev${rowEvent.topicHref}` : rowEvent.topicHref;
  const edition = rowEvent.edition;
  const seoTitleName = stripGolfSponsorSuffix(rowEvent.name);
  const tripCards = (rowEvent.golfTrip.cards || [])
    .filter((card) => !/TBC|once the venue and transport plan are confirmed/i.test(`${card.title} ${card.detail}`))
    .map((card) =>
    `<div class="event-info-card"><span>Golf trip</span><strong>${esc(card.title)}</strong><p>${esc(card.detail)}</p></div>`
  ).join('');
  const hasSpecificAirport = rowEvent.hotel.airportNote?.title && !/^Check the nearest major airport$/i.test(rowEvent.hotel.airportNote.title);
  const overviewCards = golfOverviewCards(rowEvent);
  const historyPanel = renderGolfHistory(rowEvent);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${rowEvent.name} ${edition.year || ''}`.trim(),
    startDate: edition.startDate || undefined,
    endDate: edition.endExclusive || undefined,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: `https://one-sliders.com${imageRoot}/${rowEvent.slug}-hero.png`,
    description: rowEvent.metaDescription,
    location: { '@type': 'Place', name: rowEvent.displayLocation || rowEvent.location },
    url: `https://one-sliders.com${rowEvent.canonicalPath}`
  };
  Object.keys(schema).forEach((key) => schema[key] === undefined && delete schema[key]);

  return `<!doctype html>
<html lang="en">
<head>
  <script defer src="/assets/js/3_event.js"></script>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="os-back-href" content="${pageTopicHref}">
  <meta name="os-back-label" content="${esc(rowEvent.topicLabel)}">
  <meta name="os-page-title" content="${esc(rowEvent.name)}">
  <link rel="icon" href="/assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="/assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="/assets/icons/site.webmanifest">
  <link rel="stylesheet" href="/assets/css/1_colours.css">
  <link rel="stylesheet" href="/assets/css/1_typography.css">
  <link rel="stylesheet" href="/assets/css/1_core.css">
  <link rel="stylesheet" href="/assets/css/2_frame.css">
  <link rel="stylesheet" href="/assets/css/3_event.css">
  <link rel="stylesheet" href="/assets/css/4_flik-left-booking.css">
  <link rel="stylesheet" href="/assets/css/4_flik-right-overview.css">
  <link rel="stylesheet" href="/assets/css/4_flik-event-v2-tabs.css">
  <link rel="stylesheet" href="/assets/css/4_flik-golf-history.css">
  <link rel="canonical" href="https://one-sliders.com${rowEvent.canonicalPath}">
  <meta name="description" content="${esc(rowEvent.metaDescription)}">
  <meta property="og:title" content="${esc(seoTitleName)} - Golf Event Guide">
  <meta property="og:description" content="${esc(rowEvent.metaDescription)}">
  <meta property="og:image" content="https://one-sliders.com${imageRoot}/${rowEvent.slug}-hero.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="https://one-sliders.com${rowEvent.canonicalPath}">
  <meta name="twitter:card" content="summary_large_image">
  <title>${esc(seoTitleName)} - Golf Event Guide</title>
  <script type="application/json" id="event-year-data">${json(rowEvent.yearData)}</script>
  <script type="application/ld+json">${json(schema)}</script>
</head>
<body class="event-dashboard onepage country-onepage event-booking-left event-golf-v2" data-cat="sport" data-os-category="sport">
  ${nav({ topicLabel: rowEvent.topicLabel, topicHref: pageTopicHref })}
  <main class="page-shell page-content page-frame">
    <div class="layout-columns">
      <div class="layout__a">
        <div class="hero">
          <picture class="hero__image">
            <source srcset="${imageRoot}/${rowEvent.slug}-hero-400.webp 400w, ${imageRoot}/${rowEvent.slug}-hero-768.webp 768w, ${imageRoot}/${rowEvent.slug}-hero-1200.webp 1200w" sizes="(max-width: 860px) 100vw, 42vw" type="image/webp">
            <img src="${hero}" alt="${esc(rowEvent.name)}" width="1200" height="630" loading="eager" decoding="async">
          </picture>
          <div class="hero__title-row">
            <h1 class="hero__title">${esc(rowEvent.name)}</h1>
          </div>
          ${bookingPanel(rowEvent)}
          <nav class="event-related-links" aria-label="Related links">
            <a class="event-related-topic-card" href="${pageTopicHref}">
              <img src="${rowEvent.topicImage}" alt="" width="400" height="300" loading="lazy">
              <span>${esc(rowEvent.relatedLabel)}</span>
              <strong>${esc(rowEvent.topicLabel)} topic</strong>
              <p>${esc(rowEvent.relatedDetail)}</p>
            </a>
          </nav>
        </div>
      </div>
      <div class="layout__b">
        <section class="event-panel event-panel--single event-golf-tabs" aria-labelledby="golf-title">
          <p class="event-section-kicker">Golf event</p>
          <p id="golf-title" class="event-panel-title">${esc(rowEvent.name)} ${esc(edition.year || '')}</p>
          <input type="radio" name="golf-tab" id="golf-tab-overview" checked>
          <input type="radio" name="golf-tab" id="golf-tab-trip">
          <input type="radio" name="golf-tab" id="golf-tab-history">
          <div class="event-v2-tablist" role="tablist" aria-label="Golf event sections">
            <label for="golf-tab-overview">Overview</label>
            <label for="golf-tab-trip">Golf trip</label>
            <label for="golf-tab-history">History</label>
          </div>
          <div class="event-v2-tabpanels">
            <div class="event-v2-tabpanel event-v2-tabpanel--overview">
              <p>${esc(rowEvent.description)}</p>
              <div class="event-info-grid">
                ${overviewCards}
              </div>
            </div>
            <div class="event-v2-tabpanel event-v2-tabpanel--trip">
              <div class="event-info-grid">
                ${hasSpecificAirport ? `<div class="event-info-card"><span>Airport</span><strong>${esc(rowEvent.hotel.airportNote.title)}</strong><p>${esc(rowEvent.hotel.airportNote.detail)}</p></div>` : ''}
                ${tripCards}
              </div>
            </div>
            <div class="event-v2-tabpanel event-v2-tabpanel--history">
              ${historyPanel}
            </div>
          </div>
        </section>
      </div>
    </div>
  </main>
</body>
</html>`;
}

function stripGolfSponsorSuffix(name) {
  return String(name || '')
    .replace(/\s+(?:presented|presented by|powered by|driven by|sponsored by)\s+.+$/i, '')
    .replace(/\s+(?:pres\.?|presented)\s+by\s+.+$/i, '')
    .trim();
}

function writeGolfEvents() {
  const targetRoot = testMode ? path.join(ROOT, 'Templates', 'test') : (writeDev ? DEV_ROOT : ROOT);
  const dataPath = path.join(ROOT, 'scripts', 'data', 'golf-events-year-data.json');
  const golfData = readJsonFile(dataPath);
  const rows = Object.values(golfData)
    .map(golfEventFromYearData)
    .filter((rowEvent) => !slugFilter || rowEvent.slug === slugFilter);
  rows.forEach((rowEvent) => {
    const outputDir = path.join(targetRoot, 'content', 'categories', rowEvent.category, rowEvent.topic, 'events');
    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, `${rowEvent.slug}.html`);
    fs.writeFileSync(outputPath, renderGolfEventV2(rowEvent), 'utf8');
    console.log(`Wrote ${path.relative(ROOT, outputPath).replace(/\\/g, '/')}`);
  });
}

function writeMusicEvents() {
  const targetRoot = writeDev ? DEV_ROOT : ROOT;
  const rows = musicLinkTargets()
    .map(musicEventFromSource)
    .filter(Boolean)
    .filter((rowEvent) => !slugFilter || rowEvent.slug === slugFilter);
  rows.forEach((rowEvent) => {
    const outputDir = path.join(targetRoot, 'content', 'categories', rowEvent.category, rowEvent.topic, 'events');
    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, `${rowEvent.slug}.html`);
    fs.writeFileSync(outputPath, renderTechnologyEvent(rowEvent), 'utf8');
    console.log(`Wrote ${path.relative(ROOT, outputPath).replace(/\\/g, '/')}`);
  });
}

function writePage() {
  const targetRoot = writeDev ? DEV_ROOT : ROOT;
  const outputDir = path.join(targetRoot, 'content', 'categories', event.category, event.topic, 'events');
  fs.mkdirSync(outputDir, { recursive: true });
  const page = renderPage({
    imageRoot: event.sourceImageRoot,
    canonicalPath: event.canonicalPath
  });
  const outputPath = path.join(outputDir, `${event.slug}.html`);
  fs.writeFileSync(outputPath, page, 'utf8');
  console.log(`Wrote ${path.relative(ROOT, outputPath).replace(/\\/g, '/')}`);
}

function writeClimatePage(rowEvent) {
  const targetRoot = writeDev ? DEV_ROOT : ROOT;
  const outputDir = path.join(targetRoot, 'content', 'categories', rowEvent.category, rowEvent.topic, 'events');
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${rowEvent.slug}.html`);
  fs.writeFileSync(outputPath, renderClimatePage(rowEvent), 'utf8');
  console.log(`Wrote ${path.relative(ROOT, outputPath).replace(/\\/g, '/')}`);
}

function writeTechnologyExample() {
  const targetRoot = writeDev ? DEV_ROOT : ROOT;
  const outputDir = path.join(targetRoot, 'content', 'categories', technologyExample.category, technologyExample.topic, 'events');
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${technologyExample.slug}.html`);
  fs.writeFileSync(outputPath, renderTechnologyExample(technologyExample), 'utf8');
  console.log(`Wrote ${path.relative(ROOT, outputPath).replace(/\\/g, '/')}`);
}

function writeTechnologyConsumerElectronics() {
  const targetRoot = writeDev ? DEV_ROOT : ROOT;
  const rows = technologyConsumerElectronics.filter((rowEvent) => !slugFilter || rowEvent.slug === slugFilter);
  rows.forEach((rowEvent) => {
    const outputDir = path.join(targetRoot, 'content', 'categories', rowEvent.category, rowEvent.topic, 'events');
    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, `${rowEvent.slug}.html`);
    fs.writeFileSync(outputPath, renderTechnologyEvent(rowEvent), 'utf8');
    console.log(`Wrote ${path.relative(ROOT, outputPath).replace(/\\/g, '/')}`);
  });
}

function writeTechnologyDeveloperConferences() {
  const targetRoot = writeDev ? DEV_ROOT : ROOT;
  const rows = technologyDeveloperConferences.filter((rowEvent) => !slugFilter || rowEvent.slug === slugFilter);
  rows.forEach((rowEvent) => {
    const outputDir = path.join(targetRoot, 'content', 'categories', rowEvent.category, rowEvent.topic, 'events');
    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, `${rowEvent.slug}.html`);
    fs.writeFileSync(outputPath, renderTechnologyEvent(rowEvent), 'utf8');
    console.log(`Wrote ${path.relative(ROOT, outputPath).replace(/\\/g, '/')}`);
  });
}

function writeCultureMusicFestivals() {
  const targetRoot = writeDev ? DEV_ROOT : ROOT;
  const rows = cultureMusicFestivals.filter((rowEvent) => !slugFilter || rowEvent.slug === slugFilter);
  rows.forEach((rowEvent) => {
    const outputDir = path.join(targetRoot, 'content', 'categories', rowEvent.category, rowEvent.topic, 'events');
    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, `${rowEvent.slug}.html`);
    fs.writeFileSync(outputPath, renderTechnologyEvent(rowEvent), 'utf8');
    console.log(`Wrote ${path.relative(ROOT, outputPath).replace(/\\/g, '/')}`);
  });
}

function writeCultureSimpleEvents() {
  const targetRoot = writeDev ? DEV_ROOT : ROOT;
  const rows = readCultureSimpleEvents();
  rows.forEach((rowEvent) => {
    const outputDir = path.join(targetRoot, 'content', 'categories', rowEvent.category, rowEvent.topic, 'events');
    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, `${rowEvent.slug}.html`);
    fs.writeFileSync(outputPath, renderTechnologyEvent(rowEvent), 'utf8');
    console.log(`Wrote ${path.relative(ROOT, outputPath).replace(/\\/g, '/')}`);
  });
  console.log(`Wrote ${rows.length} simple culture event pages${slugFilter ? ` for ${slugFilter}` : ''}.`);
}

if (args.has('--all-climate')) {
  const rows = readClimateRows()
    .map(climateRowToEvent)
    .filter((rowEvent) => !slugFilter || rowEvent.slug === slugFilter);
  rows.forEach((rowEvent) => {
    if (rowEvent.slug === event.slug) {
      writePage();
    } else {
      writeClimatePage(rowEvent);
    }
  });
} else if (args.has('--technology-example')) {
  writeTechnologyExample();
} else if (args.has('--technology-consumer-electronics')) {
  writeTechnologyConsumerElectronics();
} else if (args.has('--technology-developer-conferences')) {
  writeTechnologyDeveloperConferences();
} else if (args.has('--culture-music-festivals')) {
  writeCultureMusicFestivals();
} else if (args.has('--culture-simple')) {
  writeCultureSimpleEvents();
} else if (args.has('--music')) {
  writeMusicEvents();
} else if (args.has('--golf')) {
  writeGolfEvents();
} else {
  writePage();
}
