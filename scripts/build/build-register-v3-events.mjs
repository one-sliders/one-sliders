import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DEV_ROOT = path.join(ROOT, 'Dev');
const args = new Set(process.argv.slice(2));
const writeDev = !args.has('--prod');
const scope = valueArg('--scope') || 'sport';
const slugFilter = valueArg('--slug');
const topicFilter = valueArg('--topic');
const targetRoot = writeDev ? DEV_ROOT : ROOT;
const outRoot = path.join(targetRoot, 'content');
const CONTENT_BASE = '/content';
const CSS_BASE = '/assets/css';

const siteConfig = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/config.json'), 'utf8'));
const BOOKING_BASE = siteConfig.affiliate.booking.links['hotels-default']
  + '?url=https%3A%2F%2Fwww.booking.com%2Fsearchresults.html%3F';

function valueArg(name) {
  const arg = process.argv.find((item) => item.startsWith(`${name}=`));
  return arg ? arg.slice(name.length + 1) : '';
}

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

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function titleCase(value) {
  return String(value || '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function topicLabel(value) {
  const key = String(value || '').toLowerCase();
  const labels = {
    'formula-1': 'Formula 1',
    motogp: 'MotoGP',
    'multi-sport': 'Multi-sport',
    'american-football': 'American football',
    'aussie-rules': 'Aussie rules',
    'ice-hockey': 'Ice hockey',
    football: 'Football',
    tennis: 'Tennis'
  };
  return labels[key] || titleCase(value);
}

function addDaysIso(iso, days) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(iso || ''))) return '';
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function displayDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(iso || ''))) return '';
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

function displayRange(start, endExclusive) {
  const startText = displayDate(start);
  const normalizedEnd = endExclusive && endExclusive > start ? addDaysIso(endExclusive, -1) : start;
  const endText = displayDate(normalizedEnd);
  if (!startText) return '';
  return endText && endText !== startText ? `${startText} - ${endText}` : startText;
}

function checkoutDate(event) {
  if (!event.endDate || event.endDate <= event.startDate) return addDaysIso(event.startDate, 1);
  return event.endDate;
}

const countryPaths = {
  argentina: 'south-america/argentina',
  australia: 'oceania/australia',
  belgium: 'europe/belgium',
  belarus: 'europe/belarus',
  brazil: 'south-america/brazil',
  canada: 'north-america/canada',
  croatia: 'europe/croatia',
  czechia: 'europe/czechia',
  france: 'europe/france',
  germany: 'europe/germany',
  india: 'asia/india',
  ireland: 'europe/ireland',
  italy: 'europe/italy',
  japan: 'asia/japan',
  mexico: 'north-america/mexico',
  monaco: 'europe/monaco',
  morocco: 'africa/morocco',
  netherlands: 'europe/netherlands',
  paraguay: 'south-america/paraguay',
  peru: 'south-america/peru',
  poland: 'europe/poland',
  portugal: 'europe/portugal',
  qatar: 'asia/qatar',
  russia: 'europe/russia',
  serbia: 'europe/serbia',
  singapore: 'asia/singapore',
  'saudi arabia': 'asia/saudi-arabia',
  'south africa': 'africa/south-africa',
  spain: 'europe/spain',
  switzerland: 'europe/switzerland',
  kenya: 'africa/kenya',
  tanzania: 'africa/tanzania',
  uganda: 'africa/uganda',
  'united arab emirates': 'asia/united-arab-emirates',
  'united kingdom': 'europe/united-kingdom',
  uruguay: 'south-america/uruguay',
  usa: 'north-america/usa',
  'united states': 'north-america/usa',
  zimbabwe: 'africa/zimbabwe',
  namibia: 'africa/namibia'
};

function countryObject(name) {
  const normalized = String(name || '').trim();
  if (!normalized) return null;
  const key = normalized.toLowerCase();
  const countryPath = countryPaths[key];
  if (!countryPath) return null;
  return {
    name: normalized === 'USA' ? 'United States' : normalized,
    url: `${CONTENT_BASE}/locations/${countryPath}/index.html`,
    flag: `${CONTENT_BASE}/locations/${countryPath}/img/flag.svg`
  };
}

const knownVenueOverrides = {
  'abu-dhabi-grand-prix': { city: 'Abu Dhabi', venue: 'Yas Marina Circuit', country: 'United Arab Emirates' },
  'africa-cup-of-nations': { city: 'Kenya / Tanzania / Uganda', venue: 'Kenya, Tanzania and Uganda', countries: ['Kenya', 'Tanzania', 'Uganda'], bookingCity: 'Nairobi', primaryCountry: 'Kenya' },
  'cape-town-marathon': { city: 'Cape Town', venue: 'Cape Town marathon route', country: 'South Africa' },
  'champions-league-final': { startDate: '2027-06-05', endDate: '2027-06-06', city: 'Madrid', venue: 'Metropolitano Stadium', country: 'Spain', forceCountry: true },
  'copa-libertadores-final': { city: 'Lima', venue: 'Estadio Monumental', country: 'Peru', forceCountry: true },
  'fifa-world-cup': { city: 'Canada / Mexico / United States', venue: '16 host-city stadiums', countries: ['Canada', 'Mexico', 'United States'], bookingCity: 'Mexico City', primaryCountry: 'Mexico' },
  'las-vegas-grand-prix': { city: 'Las Vegas', venue: 'Las Vegas Strip Circuit', country: 'United States' },
  'melbourne-cup': { city: 'Melbourne', venue: 'Flemington Racecourse', country: 'Australia' },
  'mexico-city-grand-prix': { city: 'Mexico City', venue: 'Autodromo Hermanos Rodriguez', country: 'Mexico' },
  'monaco-grand-prix': { city: 'Monaco', venue: 'Circuit de Monaco', country: 'Monaco' },
  'motogp-japan': { city: 'Motegi', venue: 'Mobility Resort Motegi', country: 'Japan', bookingCity: 'Utsunomiya', bookingAreas: ['Utsunomiya', 'Motegi', 'Mito', 'Tokyo'] },
  'nba-finals': { city: 'United States / Canada', venue: 'Finalists home arenas', country: 'United States' },
  'new-york-city-marathon': { city: 'New York', venue: 'New York City five-borough course', country: 'United States' },
  'nrl-grand-final': { city: 'Sydney', venue: 'Accor Stadium', country: 'Australia' },
  'qatar-grand-prix': { city: 'Lusail', venue: 'Lusail International Circuit', country: 'Qatar' },
  'sao-paulo-grand-prix': { city: 'Sao Paulo', venue: 'Autodromo Jose Carlos Pace', country: 'Brazil' },
  'singapore-grand-prix': { city: 'Singapore', venue: 'Marina Bay Street Circuit', country: 'Singapore' },
  'stanley-cup-final': { city: 'United States / Canada', venue: 'Home arenas of the remaining clubs', country: 'United States' },
  'tour-de-france': { city: 'Barcelona', venue: 'Grand Depart and route stages', country: 'France' },
  'united-states-grand-prix': { city: 'Austin', venue: 'Circuit of The Americas', country: 'United States' },
  'wimbledon': { city: 'London', venue: 'All England Lawn Tennis Club', country: 'United Kingdom' }
};

const eventNotes = {
  'champions-league-final': {
    format: 'One-match UEFA club final',
    focus: 'The Champions League Final decides the top club in Europe after the knockout rounds. The finalists are not known until spring, but the host city, stadium and travel demand shape planning long before then.',
    follow: 'Watch the semifinal winners, ticket allocation windows, fan zones and which airport or rail route works best for Madrid.'
  },
  'fifa-world-cup': {
    format: '48-team national-team tournament',
    focus: 'The 2026 FIFA World Cup is the expanded 48-team edition across Canada, Mexico and the United States. It is not one-city travel: visitors plan by match city, knockout path and final-week logistics.',
    follow: 'Follow the match schedule, host-city allocation, team draw and knockout route before choosing where to stay.'
  },
  'copa-libertadores-final': {
    format: 'One-match CONMEBOL club final',
    focus: 'The Copa Libertadores Final decides South America’s club champion. It is a high-demand neutral-site final where travelling supporters, stadium access and late-night city movement matter.',
    follow: 'Follow finalist allocations, supporter zones, airport pressure and match-day transport around the stadium.'
  },
  'afc-asian-cup': {
    format: 'Asian national-team championship',
    focus: 'The AFC Asian Cup gathers Asia’s national teams into a multi-week tournament. Planning is built around host-city clusters, group-stage rhythm and knockout fixtures.',
    follow: 'Track the draw, fixture cities, evening kickoffs and which base makes sense if following one national team.'
  },
  'fifa-womens-world-cup': {
    format: 'Women’s national-team World Cup',
    focus: 'The FIFA Women’s World Cup is the biggest tournament in women’s football. It combines national-team travel, city hosting and a long knockout path to the final.',
    follow: 'Look at host cities, team bases, final-week demand and how match schedules connect with local transport.'
  },
  'uefa-european-championship': {
    format: 'European national-team tournament',
    focus: 'The UEFA European Championship is Europe’s national-team summer tournament. Fans usually plan around one team’s group base first, then adjust if the team reaches the knockout rounds.',
    follow: 'The draw, host cities, knockout route and transport between UK and Ireland venues are the practical planning pieces.'
  },
  'africa-cup-of-nations': {
    format: 'African national-team championship',
    focus: 'The Africa Cup of Nations is CAF’s national-team championship. A multi-host edition is about fixture cities, team followings, climate, transport and knockout movement.',
    follow: 'Watch the draw, confirmed stadium list, team bases and which host country carries the matches you want to see.'
  }
};

const futureEditionOverrides = {
  'fifa-world-cup': [
    {
      year: 2030,
      headingPlace: 'in Morocco, Portugal and Spain',
      status: 'upcoming',
      statusLabel: 'Scheduled',
      startDate: '2030-06-08',
      endExclusive: '2030-07-22',
      dates: '8 Jun 2030 - 21 Jul 2030',
      countries: ['Morocco', 'Portugal', 'Spain', 'Uruguay', 'Argentina', 'Paraguay'],
      cities: [
        { name: 'Morocco' },
        { name: 'Portugal' },
        { name: 'Spain' },
        { name: 'Montevideo' },
        { name: 'Buenos Aires' },
        { name: 'Asuncion' }
      ],
      venue: 'Main tournament in Morocco, Portugal and Spain; centenary matches in Uruguay, Argentina and Paraguay',
      format: '48-team FIFA World Cup',
      countdownText: 'The 2030 tournament is scheduled for 8 June to 21 July 2030.',
      calendarDescription: 'FIFA World Cup 2030.',
      questions: [
        {
          q: 'When is the 2030 World Cup?',
          a: '8 Jun 2030 - 21 Jul 2030',
          detail: 'The planned tournament window is 8 June to 21 July 2030.'
        },
        {
          q: 'Where is it held?',
          a: 'Morocco, Portugal and Spain, with centenary matches in South America',
          detail: 'The main tournament is hosted by Morocco, Portugal and Spain. Uruguay, Argentina and Paraguay are listed for centenary matches before the event continues in the main host region.'
        },
        {
          q: 'Where should I stay?',
          a: 'Wait for match allocation before choosing a base',
          detail: 'The 2030 event is not a one-city trip. Choose hotels after the fixture list, host-city allocation and the team route you want to follow are known.'
        },
        {
          q: 'What should I follow?',
          a: 'Host-city list, match allocation and draw',
          detail: 'The practical planning points are the final stadium list, which cities get group matches, the draw and the knockout route.'
        }
      ],
      highlights: [
        {
          label: 'Main hosts',
          title: 'Morocco, Portugal and Spain',
          detail: 'Most matches are planned around the three main host countries.'
        },
        {
          label: 'Centenary',
          title: 'Uruguay, Argentina and Paraguay',
          detail: 'The edition marks 100 years since the first World Cup in Uruguay.'
        },
        {
          label: 'Trip planning',
          title: 'Do not pick one base too early',
          detail: 'Wait for fixture allocation before deciding which country or city to build the trip around.'
        }
      ]
    }
  ]
};

function splitCsvRow(line, delimiter = ',') {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && !inQuotes) {
      inQuotes = true;
      continue;
    }
    if (char === '"' && inQuotes) {
      if (line[index + 1] === '"') {
        current += '"';
        index += 1;
        continue;
      }
      inQuotes = false;
      continue;
    }
    if (char === delimiter && !inQuotes) {
      fields.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  fields.push(current);
  return fields;
}

function loadHistory(topic) {
  const filePath = path.join(ROOT, 'Templates', 'data', 'history', `history_${topic}.csv`);
  if (!fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const delimiter = lines[0].includes(';') ? ';' : ',';
  const header = splitCsvRow(lines[0], delimiter).map((item) => item.replace(/^\uFEFF/, ''));
  return lines.slice(1).map((line) => {
    const cols = splitCsvRow(line, delimiter);
    const row = {};
    header.forEach((key, index) => {
      row[key] = cols[index] || '';
    });
    return row;
  });
}

function eventHistoryRows(event) {
  return loadHistory(event.topic).filter((row) => (row.slug || row.event_slug) === event.slug);
}

function normalizeEvent(raw) {
  const override = knownVenueOverrides[raw.slug] || {};
  const location = raw.location || {};
  const startDate = override.startDate || raw.startDate;
  const endDate = override.endDate || raw.endDate;
  let countries = [...(location.countries || [])];
  if (Array.isArray(override.countries) && override.countries.length) countries = [...override.countries];
  if (override.country && (override.forceCountry || !countries.length)) countries = [override.country];
  const countryObjects = countries.map(countryObject).filter(Boolean);
  const primaryCountry = countryObject(override.primaryCountry || override.country || countries[0]);
  const city = override.city || (location.cities || []).find((item) => item && !/TBC/i.test(item)) || '';
  const venue = override.venue || location.venue || '';
  const complete = Boolean(
    raw.slug &&
    raw.title &&
    startDate &&
    endDate &&
    city &&
    venue &&
    countryObjects.length &&
    !/TBC|TBA|TBD|to be confirmed|to be announced|pending/i.test(`${city} ${venue} ${raw.title}`)
  );
  return {
    ...raw,
    startDate,
    endDate,
    city,
    bookingCity: override.bookingCity || city,
    venue,
    countries: countryObjects,
    primaryCountry: primaryCountry || countryObjects[0],
    complete
  };
}

function topicHref(event) {
  const key = `${event.category}/${event.topic}`;
  const overrides = {
    'culture/national-day': `${CONTENT_BASE}/categories/culture/national-day.html`,
    'sport/golf': `${CONTENT_BASE}/categories/sport/golf.html`,
    'culture/music': `${CONTENT_BASE}/categories/music/index.html`,
  };
  return overrides[key] || `${CONTENT_BASE}/categories/${event.category}/${event.topic}.html`;
}

function imageRoot(event) {
  return `${CONTENT_BASE}/categories/${event.category}/${event.topic}/events/img`;
}

function topicMiniImage(event) {
  const topicMini = path.join(outRoot, 'categories', event.category, event.topic, 'img', `${event.topic}-mini.png`);
  if (fs.existsSync(topicMini)) return `${CONTENT_BASE}/categories/${event.category}/${event.topic}/img/${event.topic}-mini.png`;
  const categoryTopicMini = path.join(ROOT, 'content', 'categories', event.category, 'img', `${event.topic}-mini.png`);
  if (fs.existsSync(categoryTopicMini)) return `${CONTENT_BASE}/categories/${event.category}/img/${event.topic}-mini.png`;
  return `${imageRoot(event)}/${event.slug}-mini.png`;
}

function countryHeroImage(country) {
  if (!country?.url) return '';
  const countryPath = country.url.replace(`${CONTENT_BASE}/locations/`, '').replace(/\/index\.html$/, '');
  const slug = countryPath.split('/').filter(Boolean).at(-1);
  if (!countryPath || !slug) return '';
  const imagePath = path.join(ROOT, 'content', 'locations', ...countryPath.split('/'), 'img', `${slug}-hero.png`);
  return fs.existsSync(imagePath) ? `${CONTENT_BASE}/locations/${countryPath}/img/${slug}-hero.png` : '';
}

function countryLink(country) {
  return `<a class="country" href="${esc(country.url)}"><img src="${esc(country.flag)}" alt="" width="20" height="14" loading="lazy">${esc(country.name)}</a>`;
}

function countryNames(event) {
  const names = event.countries.map((country) => country.name);
  if (names.length <= 2) return names.join(' / ');
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}

function placeText(event) {
  if (event.countries.length > 1) return event.city || countryNames(event);
  return `${event.city}, ${event.countries[0].name}`;
}

function cleanAreaName(value) {
  return String(value || '')
    .replace(/\s*\/\s*/g, ' / ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizedAreaKey(value) {
  return cleanAreaName(value)
    .toLowerCase()
    .replace(/,\s*/g, ',')
    .replace(/\s+/g, ' ');
}

function bookingAreas(event) {
  const override = knownVenueOverrides[event.slug] || {};
  const candidates = [
    ...(Array.isArray(override.bookingAreas) ? override.bookingAreas : []),
    event.bookingCity,
    event.city,
    event.venue
  ];
  const seen = new Set();
  const areas = [];
  candidates.forEach((candidate) => {
    const area = cleanAreaName(candidate);
    if (!area) return;
    if (event.primaryCountry && normalizedAreaKey(area) === normalizedAreaKey(event.primaryCountry.name)) return;
    if (/\/|stadiums|venues|various/i.test(area)) return;
    const key = normalizedAreaKey(area);
    if (seen.has(key)) return;
    seen.add(key);
    areas.push(area);
  });
  if (!areas.length && event.primaryCountry) areas.push(event.primaryCountry.name);
  return areas.slice(0, 4);
}

function isMultiHostEvent(event) {
  return event.countries.length > 1 || /\/|host-city|stadiums|venues/i.test(`${event.city} ${event.venue}`);
}

function whereAnswer(event) {
  if (isMultiHostEvent(event)) return `${event.venue}, ${countryNames(event)}`;
  return `${event.venue}, ${event.city}`;
}

function whereDetail(event) {
  if (isMultiHostEvent(event)) {
    return `${event.title} uses more than one host area, so the useful answer is the match or session you plan to attend, not one generic city. Choose the fixture city first, then plan flights and hotels around that route.`;
  }
  return `${event.title} is held at ${event.venue} in ${placeText(event)}.`;
}

function stayGuidance(event) {
  const areas = bookingAreas(event);
  if (isMultiHostEvent(event)) {
    return {
      answer: areas.length ? areas.join(', ') : 'Choose after the fixture city is known',
      detail: `${event.title} is not one hotel search. Pick the match city or team route first, then compare stays near the stadium route, late transport and the next match you want to reach.`
    };
  }
  const first = areas[0] || event.bookingCity || event.city;
  return {
    answer: areas.join(', '),
    detail: `${first} is the first stay search. Compare it with ${event.venue}, local transport and how the area works after the event ends.`
  };
}

function bookingPanel(event) {
  const areas = bookingAreas(event);
  const bookingHref = `${BOOKING_BASE}ss=${encodeURIComponent(`${event.bookingCity}, ${event.primaryCountry.name}`)}`;
  const checkIn = addDaysIso(event.startDate, -1);
  const checkOut = checkoutDate(event);
  return `<section class="stay-booking-panel hero-stay-booking" data-national-day-stay data-booking-base="${esc(BOOKING_BASE)}" data-booking-country="${esc(event.primaryCountry.name)}" aria-label="Book hotels for ${esc(event.title)}">
    <div class="stay-booking-panel__header">
      <p class="stay-section-label">
        <span class="booking-symbols booking-symbols--small" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false"><path d="M4 21V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13"></path><path d="M3 21h18"></path><path d="M8 10h1"></path><path d="M12 10h1"></path><path d="M18 21v-6h1a2 2 0 0 1 2 2v4"></path></svg>
          <svg viewBox="0 0 24 24" focusable="false"><path d="M10.5 4.5 13 12l6.5 2a1.5 1.5 0 0 1 .25 2.78l-1.1.55a2 2 0 0 1-1.75.02L12 15.5 8.5 20H6l2-6-5-3V8.5l5 1.5 1-5.5h1.5Z"></path></svg>
        </span>
        <span>BOOK HOTELS &amp; FLIGHTS</span>
      </p>
      <h2 class="stay-section-title">Book stays for ${esc(event.title)}</h2>
    </div>
    <div class="stay-form-row">
      <div class="stay-form-field">
        <label class="stay-field-label" for="stay-checkin">CHECK-IN</label>
        <input type="date" id="stay-checkin" class="stay-field-input" value="${esc(checkIn)}">
      </div>
      <div class="stay-form-field">
        <label class="stay-field-label" for="stay-checkout">CHECK-OUT</label>
        <input type="date" id="stay-checkout" class="stay-field-input" value="${esc(checkOut)}">
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
    <div class="stay-area-pills">${areas.map((area, index) => `<label class="stay-area-pill"><input type="radio" name="stay-region" value="${esc(area)}"${index === 0 ? ' checked' : ''}><span>${esc(area)}</span></label>`).join('\n')}</div>
    <a class="stay-check-btn" id="stay-booking-btn" href="${esc(bookingHref)}" target="_blank" rel="nofollow sponsored noopener">Check hotel prices</a>
    <p class="stay-booking-note">OneSliders may earn a commission if you book through Booking.com.</p>
  </section>`;
}

function overviewText(event) {
  const note = eventNotes[event.slug];
  const range = displayRange(event.startDate, event.endDate);
  const intro = note?.focus || `${event.title} is a ${topicLabel(event.topic).toLowerCase()} event at ${event.venue} in ${placeText(event)}.`;
  if (isMultiHostEvent(event)) {
    return `${intro} The ${event.startDate.slice(0, 4)} edition runs ${range}. Because this event is spread across multiple host areas, the practical questions are the fixture city, the route between matches, how late transport works and which base still makes sense after the schedule is confirmed.`;
  }
  return `${intro} The ${event.startDate.slice(0, 4)} edition runs ${range} at ${event.venue}. For visitors, the useful planning details are the exact date window, the venue area, access after the event and where to stay without turning the trip into a long transfer.`;
}

function topMenu(event) {
  return `<nav class="top-menu" aria-label="Site navigation">
    <a class="os-brand" href="/" aria-label="Home"><img class="os-brand__logo" src="/assets/icons/one-sliders-icon.svg" alt="" width="22" height="22" aria-hidden="true"><span class="os-brand__text">OneSliders</span></a>
    <a class="nav-icon" href="/content/events/index.html" title="Events" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a>
    <a class="nav-icon" href="/content/locations/index.html" title="World" aria-label="World"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>
    <a class="nav-icon" href="/content/categories/index.html" title="Categories" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a>
    <a class="nav-back" href="${topicHref(event)}" aria-label="Back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg><span>Back</span></a>
    <span class="nav-spacer"></span>
    <details class="nav-language"><summary aria-label="Language">EN</summary><div class="nav-language__list"></div></details>
  </nav>`;
}

function noteFor(event) {
  return eventNotes[event.slug] || {
    format: topicLabel(event.topic),
    focus: `${event.title} is a ${topicLabel(event.topic).toLowerCase()} event at ${event.venue} in ${placeText(event)}.`,
    follow: `Follow the official schedule, participants, venue access and transport changes around ${event.venue}.`
  };
}

function relatedLinks(event) {
  const country = event.primaryCountry || event.countries[0];
  const countryHero = countryHeroImage(country);
  const countryCard = country && countryHero ? `<a class="event-country-link-card" href="${esc(country.url)}">
              <img src="${esc(countryHero)}" alt="${esc(country.name)} location hero" width="400" height="300" loading="lazy">
              <strong>${esc(country.name)}</strong>
              <span>Location guide</span>
            </a>` : '';
  return `<nav class="event-related-links" aria-label="Related links">
            <a class="visual-topic-card visual-topic-card--national event-related-topic-card" href="${topicHref(event)}">
              <img src="${topicMiniImage(event)}" alt="" width="400" height="300" loading="lazy">
              <strong>${esc(topicLabel(event.topic))} topic</strong>
              <span>More ${esc(topicLabel(event.topic))} events and calendar moments.</span>
            </a>
            ${countryCard}
          </nav>`;
}

function countryLinks(event) {
  return event.countries
    .map((country) => `<a class="country" href="${esc(country.url)}"><img src="${esc(country.flag)}" alt="" width="20" height="14" loading="lazy">${esc(country.name)}</a>`)
    .join(' ');
}

function historyResultParts(row) {
  const sourceLike = /^(claude_memory|project_facts|official|source|manual|web_search)$/i;
  if (sourceLike.test(String(row.notes || '')) && !row.source) {
    return {
      score: row.r4 || row.final_score || row.score || '',
      notes: sourceLike.test(String(row.final_score || '')) ? '' : (row.final_score || '')
    };
  }
  return {
    score: row.final_score || row.r4 || row.score || '',
    notes: sourceLike.test(String(row.notes || '')) ? '' : (row.notes || '')
  };
}

function historySourcePriority(row) {
  const source = String(row.source || row.notes || '').toLowerCase();
  if (source === 'web_search' || source === 'official') return 4;
  if (source === 'project_facts' || source === 'manual' || source === 'html_json') return 3;
  if (source === 'claude_memory') return 1;
  return 2;
}

function historyRankMeta(row, event) {
  const rankRaw = String(row.rank || '1').trim();
  const rankNumber = Number.parseInt(rankRaw, 10);
  const notes = String(row.notes || '').trim();
  const isWomen = /women|ladies/i.test(notes) || /w$/i.test(rankRaw);
  if (event.topic === 'tennis') {
    return {
      key: isWomen ? 'women' : 'men',
      label: isWomen ? 'Women' : 'Men',
      order: isWomen ? 2 : 1
    };
  }
  return {
    key: Number.isFinite(rankNumber) ? `rank-${rankNumber}` : `rank-${rankRaw}`,
    label: Number.isFinite(rankNumber) ? `#${rankNumber}` : rankRaw,
    order: Number.isFinite(rankNumber) ? rankNumber : 99
  };
}

function historyRowsForPanel(event) {
  const bestRows = new Map();
  eventHistoryRows(event)
    .map((row) => {
      const rank = historyRankMeta(row, event);
      const hostCountry = countryObject(row.country || row.host_country || '');
      const winnerCountry = countryObject(row.winner_country || row.player_country || row.country || '');
      const result = historyResultParts(row);
      const displayResult = [result.notes, result.score && result.score !== 'Win' ? result.score : '']
        .filter(Boolean)
        .filter((item) => !/^(men|women|ladies|gentlemen)$/i.test(item))
        .join(' · ');
      return {
        year: Number(row.year),
        rank,
        dates: row.dates || row.date || String(row.year),
        venue: row.venue || '',
        city: row.city || '',
        hostCountry,
        winner: row.winner || row.player_or_team || '',
        winnerCountry,
        score: displayResult || (/^(men|women|ladies|gentlemen)$/i.test(result.score || '') ? '' : result.score),
        contentPriority: displayResult ? 2 : 1,
        sourcePriority: historySourcePriority(row)
      };
    })
    .filter((row) => row.year && row.winner && row.sourcePriority > 1)
    .forEach((row) => {
      const key = `${row.year}|${row.rank.key}`;
      const current = bestRows.get(key);
      if (
        !current
        || row.contentPriority > current.contentPriority
        || (row.contentPriority === current.contentPriority && row.sourcePriority > current.sourcePriority)
      ) {
        bestRows.set(key, row);
      }
    });
  return [...bestRows.values()]
    .sort((a, b) => b.year - a.year || a.rank.order - b.rank.order)
    .slice(0, 30);
}

function countryChip(country) {
  return country ? `<a class="country" href="${esc(country.url)}"><img src="${esc(country.flag)}" alt="" width="20" height="14" loading="lazy">${esc(country.name)}</a>` : '';
}

function historyPanel(event) {
  const rows = historyRowsForPanel(event);
  if (!rows.length) return '';
  const latestYear = Math.max(...rows.map((row) => row.year));
  const cards = rows.map((row) => {
    const winnerText = row.winnerCountry && row.winner === row.winnerCountry.name
      ? countryChip(row.winnerCountry)
      : `${countryChip(row.winnerCountry)} ${esc(row.winner)}`.trim();
    return `<li class="event-fact">
                    <strong>${esc(row.year)} ${esc(row.rank.label)}</strong>
                    <span>${winnerText}</span>
                    <span>${row.score ? esc(row.score) : ''}</span>
                    <span>${esc([row.venue, row.city].filter(Boolean).join(', '))}${row.hostCountry ? ` · ${countryChip(row.hostCountry)}` : ''}</span>
                  </li>`;
  }).join('\n');
  const intro = event.topic === 'tennis'
    ? `The latest recorded edition in this data is ${latestYear}. The archive keeps the recent men's and women's champions together with country and final note where available.`
    : `The latest recorded edition in this data is ${latestYear}. The list below keeps the archive compact: top result, host setting and final note, so the event page explains what came before without turning into a long article.`;
  return `<div class="event-tab-panel" id="panel-history">
              <div class="event-panel-inner">
                <div class="event-about-body">
                  <h2>${esc(event.title)} history</h2>
                  <p>${esc(intro)}</p>
                </div>
                <ol class="event-key-facts event-history-list" aria-label="${esc(event.title)} recent history">
                  ${cards}
                </ol>
              </div>
            </div>`;
}

function infoTabs(event) {
  const year = event.startDate.slice(0, 4);
  const note = noteFor(event);
  const history = historyPanel(event);
  const stay = stayGuidance(event);
  return `<div class="event-tabs">
          <input type="radio" name="event-tab" id="tab-why" checked>
          <input type="radio" name="event-tab" id="tab-food">
          <input type="radio" name="event-tab" id="tab-culture">
          ${history ? '<input type="radio" name="event-tab" id="tab-history">' : ''}

          <div class="event-tablist" role="tablist">
            <label class="event-tab-label" for="tab-why">Overview</label>
            <label class="event-tab-label" for="tab-food">Event info</label>
            <label class="event-tab-label" for="tab-culture">Stay</label>
            ${history ? '<label class="event-tab-label" for="tab-history">History</label>' : ''}
          </div>

          <div class="event-tab-panels">
            <div class="event-tab-panel" id="panel-why">
              <div class="event-panel-inner">
                <ol class="event-key-facts" aria-label="${esc(event.title)} key facts">
                  <li class="event-fact"><strong>${esc(displayRange(event.startDate, event.endDate))}</strong><span>Date</span></li>
                  <li class="event-fact"><strong>${esc(event.venue)}</strong><span>Venue</span></li>
                  <li class="event-fact"><strong>${esc(event.city)}</strong><span>Place</span></li>
                </ol>
                <div class="event-about-body">
                  <h2>${esc(event.title)} ${esc(year)}</h2>
                  <p>${esc(overviewText(event))}</p>
                </div>
              </div>
            </div>

            <div class="event-tab-panel" id="panel-food">
              <div class="event-panel-inner">
                <div class="event-about-body">
                  <h2>About this event</h2>
                  <p>${esc(note.focus)}</p>
                  <p>${esc(note.follow)}</p>
                </div>
                <ol class="event-key-facts" aria-label="${esc(event.title)} event details">
                  <li class="event-fact"><strong>${esc(note.format || topicLabel(event.topic))}</strong><span>Format</span></li>
                  <li class="event-fact"><strong>${countryLinks(event)}</strong><span>Country</span></li>
                  <li class="event-fact"><strong>${esc(event.venue)}</strong><span>Venue</span></li>
                </ol>
              </div>
            </div>

            <div class="event-tab-panel" id="panel-culture">
              <div class="event-panel-inner">
                <div class="event-about-body">
                  <h2>Where to stay</h2>
                  <p>${esc(stay.detail)}</p>
                </div>
                <a class="event-category-link" href="${topicHref(event)}">More ${esc(topicLabel(event.topic))} events -&gt;</a>
              </div>
            </div>
            ${history}
          </div>
        </div>`;
}

function currentQuestions(event) {
  const note = eventNotes[event.slug] || {};
  const range = displayRange(event.startDate, event.endDate);
  const stay = stayGuidance(event);
  return [
    {
      q: 'When is the event?',
      a: range,
      detail: `${event.title} runs ${range}.`
    },
    {
      q: 'Where is it held?',
      a: whereAnswer(event),
      detail: whereDetail(event)
    },
    {
      q: 'What is the format?',
      a: note.format || topicLabel(event.topic),
      detail: note.focus || `${event.title} is a ${topicLabel(event.topic)} event with a defined date window, venue and competition format.`
    },
    {
      q: 'Where should I stay?',
      a: stay.answer,
      detail: stay.detail
    },
    {
      q: 'What should I follow?',
      a: 'Schedule, participants and venue access',
      detail: note.follow || `Follow the final schedule, who is taking part, venue entry rules and transport around ${event.venue}.`
    },
    {
      q: 'About this event',
      a: note.format || topicLabel(event.topic),
      detail: note.focus || `${event.title} is part of the ${topicLabel(event.topic)} calendar in ${placeText(event)}.`
    }
  ];
}

function historyEditions(event) {
  const rows = historyRowsForPanel(event);
  const byYear = new Map();
  rows.forEach((row) => {
    if (!row.year) return;
    const yearRows = byYear.get(row.year) || [];
    yearRows.push(row);
    byYear.set(row.year, yearRows);
  });
  return [...byYear.entries()].map(([year, yearRows]) => {
    const first = yearRows[0];
    const winnerName = yearRows
      .map((row) => `${row.rank.label}: ${row.winner}${row.score ? ` (${row.score})` : ''}`)
      .join('; ');
    const winner = first.winner || '';
    const winnerCountry = first.winnerCountry;
    return {
      year: Number(year),
      headingPlace: first.city ? `in ${first.city}` : 'archive',
      status: 'past',
      statusLabel: 'Complete',
      startDate: '',
      endExclusive: '',
      dates: first.dates || String(year),
      countries: first.hostCountry ? [first.hostCountry] : event.countries,
      cities: first.city ? [{ name: first.city }] : [{ name: event.city }],
      venue: first.venue || event.venue,
      format: topicLabel(event.topic),
      countdownText: `${event.title} ${year} has already been played.`,
      result: winnerName,
      resultLabel: winnerName,
      winner: winner ? {
        name: winner,
        countryName: winnerCountry?.name || '',
        countryUrl: winnerCountry?.url || '',
        countryFlag: winnerCountry?.flag || ''
      } : null,
      questions: [],
      highlights: yearRows.map((row) => ({
        label: row.rank.label,
        title: row.winner,
        detail: `${row.winner}${row.score ? `: ${row.score}` : ''}`
      }))
    };
  }).filter((edition) => edition.year).sort((a, b) => a.year - b.year);
}

function editionsFor(event) {
  const currentYear = Number(event.startDate.slice(0, 4));
  const current = {
    year: currentYear,
    headingPlace: `in ${event.city}`,
    status: new Date(`${event.endDate}T00:00:00Z`) < new Date() ? 'past' : 'upcoming',
    statusLabel: new Date(`${event.endDate}T00:00:00Z`) < new Date() ? 'Complete' : 'Scheduled',
    startDate: event.startDate,
    endExclusive: event.endDate,
    dates: displayRange(event.startDate, event.endDate),
    countries: event.countries,
    cities: [{ name: event.city }],
    venue: event.venue,
    format: topicLabel(event.topic),
    countdownText: `${event.title} is scheduled at ${event.venue} in ${event.city}.`,
    calendarDescription: `${event.title} ${currentYear}.`,
    questions: currentQuestions(event),
    highlights: [
      { label: 'Place', title: event.city, detail: whereDetail(event) },
      { label: 'Format', title: eventNotes[event.slug]?.format || topicLabel(event.topic), detail: eventNotes[event.slug]?.follow || `Follow the confirmed schedule, participants and venue access before booking.` },
      { label: 'Stay', title: stayGuidance(event).answer, detail: stayGuidance(event).detail }
    ]
  };
  const history = historyEditions(event).filter((edition) => edition.year !== current.year);
  const future = (futureEditionOverrides[event.slug] || []).map((edition) => ({
    ...edition,
    countries: (edition.countries || []).map(countryObject).filter(Boolean)
  }));
  const futureYears = new Set(future.map((edition) => Number(edition.year)));
  const editions = [
    ...history.slice(-5),
    ...(futureYears.has(current.year) ? [] : [current]),
    ...future
  ].sort((a, b) => a.year - b.year);
  return editions;
}

function schemaFor(event) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${event.title} ${event.startDate.slice(0, 4)}`,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: `https://one-sliders.com${imageRoot(event)}/${event.slug}-hero.png`,
    description: metaDescription(event),
    location: {
      '@type': 'Place',
      name: event.venue,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.city,
        addressCountry: event.countries[0].name
      }
    },
    url: `https://one-sliders.com${CONTENT_BASE}/categories/${event.category}/${event.topic}/events/${event.slug}.html`
  };
}

function metaTitle(event) {
  const year = event.startDate.slice(0, 4);
  const base = `${event.title} ${year} - dates, venue & travel`;
  return base.length <= 60 ? base : `${event.title} ${year}`;
}

function metaDescription(event) {
  const year = event.startDate.slice(0, 4);
  const text = `${event.title} ${year}: date, venue, host area and stay planning for ${event.city}.`;
  return text.length <= 155 ? text : `${event.title} ${year}: date, venue and stay planning.`;
}

function page(event) {
  const canonicalPath = `${CONTENT_BASE}/categories/${event.category}/${event.topic}/events/${event.slug}.html`;
  const img = `${imageRoot(event)}/${event.slug}`;
  const editions = editionsFor(event);
  const defaultYear = event.startDate.slice(0, 4);
  const data = {
    eventName: event.title,
    slug: event.slug,
    defaultYear: Number(defaultYear),
    lastUpdated: '5 July 2026',
    templateMode: 'one-slider',
    eventType: 'edition',
    topic: event.topic,
    sources: [],
    editions
  };
  return `<!doctype html>
<html lang="en">
<head>
  <link rel="stylesheet" href="/assets/css/oneslider-core.css">
  <link rel="stylesheet" href="${CSS_BASE}/colors.css">
  <link rel="stylesheet" href="${CSS_BASE}/shapes.css">
  <link rel="stylesheet" href="${CSS_BASE}/typography.css">
  <link rel="stylesheet" href="${CSS_BASE}/event-national-day-left.css">
  <link rel="stylesheet" href="${CSS_BASE}/event-national-day-why.css">
  <script defer src="/assets/js/oneslider-core.js"></script>
  <script defer src="/assets/js/event-page.js"></script>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="os-back-href" content="${topicHref(event)}">
  <meta name="os-back-label" content="${esc(topicLabel(event.topic))}">
  <meta name="os-page-title" content="${esc(event.title)}">
  <link rel="icon" href="/assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="/assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="/assets/icons/site.webmanifest">
  <link id="palette-css" rel="stylesheet" href="/assets/css/palettes/oneslider-palette-harmonized.css">
  <link rel="canonical" href="https://one-sliders.com${canonicalPath}">
  <meta name="description" content="${esc(metaDescription(event))}">
  <meta property="og:title" content="${esc(metaTitle(event))}">
  <meta property="og:description" content="${esc(metaDescription(event))}">
  <meta property="og:image" content="https://one-sliders.com${img}-hero.png">
  <meta property="og:url" content="https://one-sliders.com${canonicalPath}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(metaTitle(event))}">
  <meta name="twitter:description" content="${esc(metaDescription(event))}">
  <meta name="twitter:image" content="https://one-sliders.com${img}-hero.png">
  <title>${esc(metaTitle(event))}</title>
  <script type="application/json" id="event-year-data">${json(data)}</script>
  <script type="application/ld+json">${json(schemaFor(event))}</script>
</head>
<body class="onepage event-standard event-standard--${esc(event.slug)}" data-cat="${esc(event.category)}" data-os-category="${esc(event.category)}">
  ${topMenu(event)}
  <main class="page-shell page-content page-frame" id="year-${esc(defaultYear)}">
    <div class="layout-columns">
      <div class="layout__a">
        <div class="hero">
          <picture class="hero__image">
            <source srcset="${img}-hero-400.webp 400w, ${img}-hero-768.webp 768w, ${img}-hero-1200.webp 1200w" sizes="(max-width: 860px) 100vw, 42vw" type="image/webp">
            <img src="${img}-hero.png" alt="${esc(event.title)}" width="1200" height="630" loading="eager" decoding="async">
          </picture>
          <div class="hero__title-row"><h1 class="hero__title">${esc(event.title)}</h1></div>
          ${bookingPanel(event)}
          ${relatedLinks(event)}
        </div>
      </div>
      <div class="layout__b">
        ${infoTabs(event)}
      </div>
    </div>
  </main>
</body>
</html>`;
}

function writeTopicCards(events) {
  const byTopic = new Map();
  events.forEach((event) => {
    const key = `${event.category}/${event.topic}`;
    if (!byTopic.has(key)) byTopic.set(key, []);
    byTopic.get(key).push(event);
  });
  byTopic.forEach((list, key) => {
    const [category, topic] = key.split('/');
    const pagePath = path.join(outRoot, 'categories', category, `${topic}.html`);
    if (!fs.existsSync(pagePath)) return;
    let html = fs.readFileSync(pagePath, 'utf8');
    const cards = list
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .map((event) => `<a class="event-card" href="${CONTENT_BASE}/categories/${event.category}/${event.topic}/events/${event.slug}.html#year-${event.startDate.slice(0, 4)}"><img class="event-thumb" src="${imageRoot(event)}/${event.slug}-mini.png" alt="${esc(event.title)} thumbnail" loading="lazy" width="400" height="300"><time>${esc(displayRange(event.startDate, event.endDate))}</time><strong>${esc(event.title)}</strong><p>${esc(placeText(event))}</p></a>`)
      .join('\n');
    const block = `<!-- v3-register-events:start -->\n${cards}\n<!-- v3-register-events:end -->`;
    const markerPattern = /<!-- v3-register-events:start -->[\s\S]*?<!-- v3-register-events:end -->/;
    if (markerPattern.test(html)) {
      html = html.replace(markerPattern, block);
    } else if (html.includes('<div class="event-grid')) {
      html = html.replace(
        /(<div class="event-grid[^>]*>)[\s\S]*?(<\/div>\s*<\/section>)/,
        `$1\n${block}\n$2`
      );
    } else if (html.includes('</main>')) {
      html = html.replace('</main>', `<section class="topics-section"><h2>Upcoming events</h2><div class="event-grid">\n${block}\n</div></section></main>`);
    }
    fs.writeFileSync(pagePath, html, 'utf8');
  });
}

function main() {
  const register = JSON.parse(fs.readFileSync(path.join(ROOT, 'events.register.json'), 'utf8'));
  const rows = (Array.isArray(register) ? register : register.events || [])
    .filter((event) => !slugFilter || event.slug === slugFilter)
    .filter((event) => !topicFilter || event.topic === topicFilter)
    .filter((event) => {
      if (scope === 'sport') return event.category === 'sport' && event.topic !== 'golf';
      if (scope === 'all-new') return event.category === 'sport' && event.topic !== 'golf';
      return event.category === scope;
    })
    .map(normalizeEvent);

  const ready = rows.filter((event) => event.complete);
  const skipped = rows.filter((event) => !event.complete);
  ready.forEach((event) => {
    const outFile = path.join(outRoot, 'categories', event.category, event.topic, 'events', `${event.slug}.html`);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, page(event), 'utf8');
  });
  // Topic-page "Find events" cards are owned by the sync-events-index-from-pages.mjs +
  // build-sport-topic-cards.mjs pipeline, not by this script - do not duplicate that here.
  const reportPath = path.join(ROOT, 'tmp', `v3-register-${scope}-skipped.json`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, json(skipped.map((event) => ({
    slug: event.slug,
    title: event.title,
    category: event.category,
    topic: event.topic,
    startDate: event.startDate,
    endDate: event.endDate,
    city: event.city,
    venue: event.venue,
    countries: event.location?.countries || []
  }))), 'utf8');
  console.log(`build-register-v3-events: wrote ${ready.length}, skipped ${skipped.length}.`);
  if (skipped.length) console.log(`Skipped report: ${reportPath}`);
}

main();
