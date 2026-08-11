import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DEV_ROOT = path.join(ROOT, 'Dev');
const TEST_ROOT = path.join(ROOT, 'Templates', 'test');
const args = new Set(process.argv.slice(2));
const writeDev = !args.has('--prod');
const writeTest = args.has('--test');
const scope = valueArg('--scope') || 'sport';
const slugFilter = valueArg('--slug');
const topicFilter = valueArg('--topic');
const targetRoot = writeTest ? TEST_ROOT : (writeDev ? DEV_ROOT : ROOT);
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
  ethiopia: 'africa/ethiopia',
  india: 'asia/india',
  ireland: 'europe/ireland',
  italy: 'europe/italy',
  japan: 'asia/japan',
  mexico: 'north-america/mexico',
  monaco: 'europe/monaco',
  morocco: 'africa/morocco',
  netherlands: 'europe/netherlands',
  'new zealand': 'oceania/new-zealand',
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

const cityPaths = {
  sydney: 'oceania/australia/sydney.html'
};

function cityLink(name) {
  const normalized = String(name || '').trim();
  if (!normalized) return '';
  const cityPath = cityPaths[normalized.toLowerCase()];
  return cityPath ? `<a href="${CONTENT_BASE}/locations/${cityPath}">${esc(normalized)}</a>` : esc(normalized);
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
  'sydney-marathon': {
    city: 'Sydney',
    venue: 'Miller Street, North Sydney to Sydney Opera House Forecourt',
    country: 'Australia',
    bookingCity: 'Sydney',
    bookingAreas: ['Sydney CBD', 'Circular Quay and The Rocks', 'North Sydney', 'Surry Hills']
  },
  'nrl-grand-final': { city: 'Sydney', venue: 'Accor Stadium', country: 'Australia' },
  'qatar-grand-prix': { city: 'Lusail', venue: 'Lusail International Circuit', country: 'Qatar' },
  'sao-paulo-grand-prix': { city: 'Sao Paulo', venue: 'Autodromo Jose Carlos Pace', country: 'Brazil' },
  'singapore-grand-prix': { city: 'Singapore', venue: 'Marina Bay Street Circuit', country: 'Singapore' },
  'stanley-cup-final': { city: 'United States / Canada', venue: 'Home arenas of the remaining clubs', country: 'United States' },
  'the-hundred-final': { startDate: '2026-08-16', endDate: '2026-08-17', city: 'London', venue: 'Lord\'s Cricket Ground', country: 'United Kingdom', forceCountry: true },
  'tour-de-france': { city: 'Barcelona', venue: 'Grand Depart and route stages', country: 'France' },
  'united-states-grand-prix': { city: 'Austin', venue: 'Circuit of The Americas', country: 'United States' },
  'wimbledon': { city: 'London', venue: 'All England Lawn Tennis Club', country: 'United Kingdom' }
};

const eventNotes = {
  'wimbledon': {
    format: 'Grass-court Grand Slam',
    focus: 'Wimbledon is the oldest of tennis\' four majors and the only Grand Slam still played on grass. It is held at the All England Lawn Tennis Club in Wimbledon, London.',
    follow: 'Watch the order of play, court allocation, weather, queue guidance and transport around Wimbledon and Southfields.'
  },
  'the-hundred-final': {
    format: '100-ball cricket finals day',
    focus: 'The Hundred Final is the championship day for the ECB\'s 100-ball competition, with the women\'s and men\'s trophies decided at Lord\'s after the league stage and eliminator.',
    follow: 'Watch the final league table, the eliminator winners, Lord\'s entry timings and late transport from St John\'s Wood and Marylebone.'
  },
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
  },
  'sydney-marathon': {
    format: '42.195 km road marathon and race-week running festival',
    focus: 'Sydney Marathon is the first Abbott World Marathon Major in Oceania, with a point-to-point city course from North Sydney across the Harbour Bridge to the Opera House finish. The 2026 race suits runners chasing a major-star finish, travelling supporters planning a harbour weekend and spectators who want a clear place to watch the city course unfold.',
    follow: 'Track official ballot, charity and travel-package updates, then plan bib collection at Sydney Showground, race-morning trains to North Sydney, road closures and the Opera House finish crowds.'
  }
};

const eventOverviewOverrides = {
  'the-hundred-final': {
    place: 'London, England',
    facts: [
      { label: 'First season', value: '2021' },
      { label: 'Format', value: '100 balls per innings' },
      { label: 'Finals venue', value: 'Lord\'s Cricket Ground' },
      { label: 'Finals day', value: 'Women\'s final and men\'s final' },
      { label: 'Competition field', value: '8 city-based teams in each competition' },
      { label: 'Knockout route', value: 'League leader to final; 2nd v 3rd in eliminator' }
    ],
    blocks: [
      {
        title: 'A short-format cricket title day',
        text: 'The Hundred Final closes the 100-ball season with two title matches on the same Lord\'s stage. The format is built for short innings, fast field changes and a clear result window for spectators.'
      },
      {
        title: 'How teams reach Lord\'s',
        text: 'The league leader goes straight to the final. The teams finishing second and third meet in an eliminator, and that winner comes to Lord\'s to play for the trophy.'
      },
      {
        title: 'Visiting Lord\'s on finals day',
        text: 'Plan around St John\'s Wood, Baker Street and Marylebone rather than driving close to the ground. Arrive early enough for bag checks and remember that one day can include both women\'s and men\'s finals.'
      },
      {
        title: 'What to watch before booking',
        text: 'The finalists are only known after the league stage and eliminator, so the practical checks are match timings, ticket category, weather, late Tube options and whether you want to stay near Lord\'s or elsewhere in central London.'
      }
    ]
  },
  'wimbledon': {
    place: 'London, England',
    facts: [
      { label: 'Founded', value: '1877' },
      { label: 'Surface', value: 'Grass courts' },
      { label: 'Grand Slam slot', value: 'Third major of season' },
      { label: 'Venue area', value: 'Wimbledon, London, England' },
      { label: 'Format', value: 'Singles, doubles, mixed, juniors' },
      { label: 'Traditions', value: 'All-white kit, Queue, strawberries' }
    ],
    blocks: [
      {
        title: 'Centre Court, grass and SW19',
        text: 'Wimbledon is the oldest major in tennis, first held in 1877, and its identity is still tied to grass courts, Centre Court and the All England Lawn Tennis Club in south-west London.'
      },
      {
        title: 'Grass changes the match',
        text: 'The grass surface usually means lower bounce, quicker points and more pressure on the first strike. Early-round outside courts can be especially good value because several singles matches may run close together.'
      },
      {
        title: 'First-time visit tips',
        text: 'Decide first whether you are aiming for a show-court ticket, a grounds pass or the Queue. Arrive with time for entry checks, wear shoes for a long walking day, and plan around Southfields, Wimbledon or a direct Tube/rail route rather than driving close to the grounds.'
      },
      {
        title: 'What to prepare for',
        text: 'London weather can swing between sun, rain and cool evenings during the same day. Pack light layers, sun protection and a small rain layer; if play runs late, keep enough time for the walk back to station queues after the final match.'
      }
    ]
  },
  'sydney-marathon': {
    factsMode: 'replace',
    facts: [
      { label: 'Date', value: '30 Aug 2026' },
      { label: 'City', html: cityLink('Sydney') },
      { label: 'Distance', value: '42.195 km' },
      { label: '2025 finishers', value: '32,963' },
      { label: '2025 spectators', value: '200K+' },
      { label: 'Course cutoff', value: '7 hours' }
    ],
    blocks: [
      {
        title: 'Who this race is for',
        text: 'Sydney Marathon is an Abbott World Marathon Major for runners who still want the feel of a destination race. The draw is the course: a Miller Street start in North Sydney, the Harbour Bridge early, city landmarks through The Rocks, Circular Quay and Centennial Park, then the Sydney Opera House Forecourt finish.'
      },
      {
        title: 'Why 2026 matters',
        text: 'The 2026 edition is the second Sydney Marathon after its World Marathon Major debut. The general ballot has closed, so late planners should watch charity and official travel-package routes. Treat hotels near the CBD, Circular Quay and North Sydney as race logistics, not just sightseeing.'
      },
      {
        title: 'Race-week rhythm',
        text: 'Bib collection is at the Running Show at Sydney Showground from 27 to 29 August 2026. Build one Olympic Park trip into race week, then keep race morning simple: the marathon starts early in North Sydney and finishes at the Opera House.'
      },
      {
        title: 'How to watch or support',
        text: 'Supporters get the best value by planning around public transport and choosing one or two course points, rather than trying to chase a runner by car. The finish precinct around Circular Quay and the Opera House is the emotional anchor, but it will also be the most crowded part of the day.'
      }
    ]
  }
};

const futureEditionOverrides = {
  'sydney-marathon': [
    {
      year: 2027,
      headingPlace: 'in Sydney',
      status: 'upcoming',
      statusLabel: 'Announced',
      startDate: '2027-08-29',
      endExclusive: '2027-08-30',
      dates: '29 Aug 2027',
      countries: ['Australia'],
      cities: [{ name: 'Sydney' }],
      venue: 'Sydney marathon course',
      format: '42.195 km road marathon',
      countdownText: 'Sydney Marathon 2027 is listed for 29 August 2027 in Sydney.',
      calendarDescription: 'Sydney Marathon 2027.',
      questions: [],
      highlights: [
        {
          label: 'Date',
          title: '29 Aug 2027',
          detail: 'The 2027 race is listed for the last Sunday of August in Sydney.'
        }
      ]
    }
  ],
  'wimbledon': [
    {
      year: 2027,
      headingPlace: 'in London',
      status: 'upcoming',
      statusLabel: 'Scheduled',
      startDate: '2027-06-28',
      endExclusive: '2027-07-12',
      dates: '28 Jun 2027 - 11 Jul 2027',
      countries: ['United Kingdom'],
      cities: [{ name: 'London' }],
      venue: 'All England Lawn Tennis Club',
      format: 'Tennis',
      countdownText: 'Wimbledon 2027 is scheduled for 28 June to 11 July 2027.',
      calendarDescription: 'Wimbledon 2027.',
      questions: [],
      highlights: [
        {
          label: 'Dates',
          title: '28 Jun 2027 - 11 Jul 2027',
          detail: 'The 2027 Championships are scheduled for the usual two-week grass-court window in London.'
        }
      ]
    },
    {
      year: 2028,
      headingPlace: 'in London',
      status: 'upcoming',
      statusLabel: 'Scheduled',
      startDate: '2028-07-03',
      endExclusive: '2028-07-17',
      dates: '3 Jul 2028 - 16 Jul 2028',
      countries: ['United Kingdom'],
      cities: [{ name: 'London' }],
      venue: 'All England Lawn Tennis Club',
      format: 'Tennis',
      countdownText: 'Wimbledon 2028 is scheduled for 3 July to 16 July 2028.',
      calendarDescription: 'Wimbledon 2028.',
      questions: [],
      highlights: [
        {
          label: 'Dates',
          title: '3 Jul 2028 - 16 Jul 2028',
          detail: 'Wimbledon lists the 2028 Championships for this two-week window in London.'
        }
      ]
    },
    {
      year: 2029,
      headingPlace: 'in London',
      status: 'upcoming',
      statusLabel: 'Scheduled',
      startDate: '2029-07-02',
      endExclusive: '2029-07-16',
      dates: '2 Jul 2029 - 15 Jul 2029',
      countries: ['United Kingdom'],
      cities: [{ name: 'London' }],
      venue: 'All England Lawn Tennis Club',
      format: 'Tennis',
      countdownText: 'Wimbledon 2029 is scheduled for 2 July to 15 July 2029.',
      calendarDescription: 'Wimbledon 2029.',
      questions: [],
      highlights: [
        {
          label: 'Dates',
          title: '2 Jul 2029 - 15 Jul 2029',
          detail: 'Wimbledon lists the 2029 Championships for this two-week window in London.'
        }
      ]
    },
    {
      year: 2030,
      headingPlace: 'in London',
      status: 'upcoming',
      statusLabel: 'Scheduled',
      startDate: '2030-07-01',
      endExclusive: '2030-07-15',
      dates: '1 Jul 2030 - 14 Jul 2030',
      countries: ['United Kingdom'],
      cities: [{ name: 'London' }],
      venue: 'All England Lawn Tennis Club',
      format: 'Tennis',
      countdownText: 'Wimbledon 2030 is scheduled for 1 July to 14 July 2030.',
      calendarDescription: 'Wimbledon 2030.',
      questions: [],
      highlights: [
        {
          label: 'Dates',
          title: '1 Jul 2030 - 14 Jul 2030',
          detail: 'Wimbledon lists the 2030 Championships for this two-week window in London.'
        }
      ]
    }
  ],
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

const historyNoEditionOverrides = {
  'sydney-marathon': [
    {
      year: 2021,
      note: 'No in-person Sydney Marathon was held.'
    },
    {
      year: 2020,
      note: 'No in-person Sydney Marathon was held.'
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
  if (event.slug === 'sydney-marathon') {
    return 'The marathon starts on Miller Street in North Sydney, crosses the Harbour Bridge and finishes at the Sydney Opera House Forecourt.';
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
  if (event.slug === 'sydney-marathon') {
    return {
      answer: areas.join(', '),
      detail: 'Stay near the CBD or Circular Quay for the finish, North Sydney for an easier start, or Surry Hills for restaurants and rail access. Build in one separate trip to Sydney Olympic Park for bib collection.'
    };
  }
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
  return `<section class="stay-booking-panel hero-stay-booking" data-event-stay data-booking-base="${esc(BOOKING_BASE)}" data-booking-country="${esc(event.primaryCountry.name)}" aria-label="Book hotels for ${esc(event.title)}">
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
  const override = eventOverviewOverrides[event.slug];
  if (override?.intro) return override.intro;
  const note = eventNotes[event.slug];
  const range = displayRange(event.startDate, event.endDate);
  const intro = note?.focus || `${event.title} is a ${topicLabel(event.topic).toLowerCase()} event at ${event.venue} in ${placeText(event)}.`;
  if (isMultiHostEvent(event)) {
    return `${intro} The ${event.startDate.slice(0, 4)} edition runs ${range}. Because this event is spread across multiple host areas, the practical questions are the fixture city, the route between matches, how late transport works and which base still makes sense after the schedule is confirmed.`;
  }
  return `${intro} The ${event.startDate.slice(0, 4)} edition runs ${range} at ${event.venue}. Arrive with enough time for entry or bib collection, check the local transport plan and choose a stay that keeps the event day straightforward.`;
}

function overviewFacts(event) {
  const override = eventOverviewOverrides[event.slug];
  const baseFacts = [
    { label: 'Date', value: displayRange(event.startDate, event.endDate) },
    { label: 'Venue', value: event.venue },
    { label: 'City', html: cityLink(override?.place || event.city) },
    { label: 'Country', html: countryLinks(event) }
  ];
  if (override?.factsMode === 'replace') return override.facts || [];
  return override?.facts ? [...baseFacts, ...override.facts] : baseFacts;
}

function overviewFactItems(event) {
  return overviewFacts(event).map((fact) => `<li class="event-overview-fact">
                    <span>${esc(fact.label)}</span><strong>${fact.html || esc(fact.value)}</strong>
                  </li>`).join('\n');
}

function overviewBlocks(event) {
  const override = eventOverviewOverrides[event.slug];
  if (override?.blocks?.length) {
    return override.blocks.map((block) => `<section class="event-overview-note">
                    <h3>${esc(block.title)}</h3>
                    <p>${esc(block.text)}</p>
                  </section>`).join('\n');
  }
  return `<section class="event-overview-note">
                    <h3>${esc(event.title)} ${esc(event.startDate.slice(0, 4))}</h3>
                    <p>${esc(overviewText(event))}</p>
                  </section>`;
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
  if (event.slug === 'sydney-marathon') {
    return `<nav class="event-related-links" aria-label="Related links">
            <a class="visual-topic-card visual-topic-card--national event-related-topic-card" href="${topicHref(event)}">
              <img src="${topicMiniImage(event)}" alt="" width="400" height="300" loading="lazy">
              <strong>${esc(topicLabel(event.topic))} topic</strong>
              <span>More ${esc(topicLabel(event.topic))} event pages.</span>
            </a>
            <a class="event-country-link-card" href="${CONTENT_BASE}/locations/oceania/australia/sydney.html">
              <img src="${CONTENT_BASE}/locations/oceania/australia/img/sydney-mini.png" alt="Sydney location guide" width="400" height="300" loading="lazy">
              <strong>Sydney</strong>
              <span>City guide</span>
            </a>
          </nav>`;
  }
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
              <span>More ${esc(topicLabel(event.topic))} event pages.</span>
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
  const isWomen = /^(women|ladies)$/i.test(notes) || /w$/i.test(rankRaw);
  const isMen = /^(men|gentlemen)$/i.test(notes);
  if (event.topic === 'tennis' || event.slug === 'sydney-marathon') {
    if (isWomen || isMen) {
      return {
        key: isWomen ? 'women' : 'men',
        label: isWomen ? 'Women' : 'Men',
        order: event.slug === 'sydney-marathon'
          ? (isWomen ? 2 : 1)
          : (isWomen ? 98 : 97)
      };
    }
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
      const winner = row.winner || row.player_or_team || '';
      const winnerCountry = countryObject(row.winner_country || row.player_country || (winner === row.country ? row.country : ''));
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
        winner,
        winnerCountry,
        score: displayResult || (/^(men|women|ladies|gentlemen)$/i.test(result.score || '') ? '' : result.score),
        contentPriority: displayResult ? 2 : 1,
        sourcePriority: historySourcePriority(row)
      };
    })
    .filter((row) => row.year && row.winner && row.sourcePriority > 0)
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
  const dedupedRows = [...bestRows.values()];
  const latestYears = [...new Set(dedupedRows.map((row) => row.year))]
    .sort((a, b) => b - a)
    .slice(0, event.slug === 'sydney-marathon' ? 25 : 10);

  return latestYears.flatMap((year) => dedupedRows
    .filter((row) => row.year === year)
    .sort((a, b) => (
      a.rank.order - b.rank.order
      || b.contentPriority - a.contentPriority
      || b.sourcePriority - a.sourcePriority
    ))
    .slice(0, 3));
}

function sportHistoryCoverage(event) {
  if (event.category !== 'sport') return null;
  const rows = historyRowsForPanel(event);
  if (!rows.length) return null;
  const countsByYear = new Map();
  rows.forEach((row) => {
    countsByYear.set(row.year, (countsByYear.get(row.year) || 0) + 1);
  });
  const editionYears = [...countsByYear.keys()].sort((a, b) => b - a);
  const requiredYears = editionYears.slice(0, 10);
  const expectedRows = event.slug === 'sydney-marathon' || event.slug === 'the-hundred-final' ? 2 : 3;
  const underfilledYears = requiredYears
    .filter((year) => countsByYear.get(year) < expectedRows)
    .map((year) => ({ year, rows: countsByYear.get(year) }));
  if (editionYears.length >= 10 && !underfilledYears.length) return null;
  return {
    slug: event.slug,
    title: event.title,
    topic: event.topic,
    latestYear: editionYears[0],
    requiredYears,
    availableEditionYears: editionYears.length,
    missingEditionCount: Math.max(0, 10 - editionYears.length),
    underfilledYears
  };
}

function countryChip(country) {
  return country ? `<a class="country" href="${esc(country.url)}"><img src="${esc(country.flag)}" alt="" width="20" height="14" loading="lazy">${esc(country.name)}</a>` : '';
}

const tennisPlayerCountries = {
  'andy murray': 'United Kingdom',
  'cameron norrie': 'United Kingdom',
  'carlos alcaraz': 'Spain',
  'daniil medvedev': 'Russia',
  'denis shapovalov': 'Canada',
  'hubert hurkacz': 'Poland',
  'jannik sinner': 'Italy',
  'john isner': 'United States',
  'kevin anderson': 'South Africa',
  'lorenzo musetti': 'Italy',
  'marin cilic': 'Croatia',
  'matteo berrettini': 'Italy',
  'milos raonic': 'Canada',
  'nick kyrgios': 'Australia',
  'novak djokovic': 'Serbia',
  'rafael nadal': 'Spain',
  'richard gasquet': 'France',
  'roberto bautista agut': 'Spain',
  'roger federer': 'Switzerland',
  'sam querrey': 'United States',
  'taylor fritz': 'United States',
  'tomas berdych': 'Czechia'
};

function historyWinnerCell(row, label = '') {
  const labelAttr = label ? ` data-label="${esc(label)}"` : '';
  if (!row) return `<span class="sport-history-position sport-history-position--empty"${labelAttr} aria-hidden="true"></span>`;
  const parts = String(row.winner || '')
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);
  const winnerText = (parts.length ? parts : [row.winner]).map((part) => {
    const country = parts.length === 1
      ? row.winnerCountry || countryObject(tennisPlayerCountries[part.toLowerCase()] || '')
      : countryObject(tennisPlayerCountries[part.toLowerCase()] || '');
    return `<span class="sport-history-person">${countryChip(country)}<span>${esc(part)}</span></span>`;
  }).join('');
  return `<span class="sport-history-position"${labelAttr}>${winnerText}</span>`;
}

function sportWinnerLeaders(event) {
  const rows = historyRowsForPanel(event)
    .filter((row) => {
      if (!row.winner || !row.rank) return false;
      if (event.slug === 'sydney-marathon') return row.rank.label === 'Men' || row.rank.label === 'Women';
      if (event.slug === 'the-hundred-final') return row.rank.order === 1 || row.rank.order === 2;
      return row.rank.label === '#1' || row.rank.order === 1;
    });
  if (!rows.length) return '';
  const leaders = new Map();
  rows.forEach((row) => {
    const key = row.winner.toLowerCase();
    const current = leaders.get(key) || {
      name: row.winner,
      country: row.winnerCountry || countryObject(tennisPlayerCountries[row.winner.toLowerCase()] || ''),
      count: 0,
      years: [],
      latestYear: 0
    };
    current.count += 1;
    current.years.push(row.year);
    current.latestYear = Math.max(current.latestYear, row.year);
    if (!current.country && row.winnerCountry) current.country = row.winnerCountry;
    leaders.set(key, current);
  });
  const topLeaders = [...leaders.values()]
    .sort((a, b) => b.count - a.count || b.latestYear - a.latestYear || a.name.localeCompare(b.name))
    .slice(0, 3);
  if (!topLeaders.length) return '';
  const maxCount = Math.max(...topLeaders.map((leader) => leader.count));
  const leaderRows = topLeaders.map((leader, index) => {
    const years = [...new Set(leader.years)].sort((a, b) => b - a);
    const dots = Array.from({ length: leader.count }, () => '<span class="sport-history-win-dot" aria-hidden="true"></span>').join('');
    const remainder = Array.from({ length: maxCount - leader.count }, () => '<span class="sport-history-win-dot sport-history-win-dot--empty" aria-hidden="true"></span>').join('');
    const titleLabel = `${leader.count} ${leader.count === 1 ? 'title' : 'titles'}`;
    return `<tr>
              <td>${index + 1}</td>
              <td><span class="sport-history-person">${countryChip(leader.country)}<span>${esc(leader.name)}</span></span></td>
              <td>${esc(leader.count)}</td>
              <td>${esc(years.join(', '))}</td>
              <td><span class="sport-history-win-chart" aria-label="${esc(titleLabel)}">${dots}${remainder}</span></td>
            </tr>`;
  }).join('\n');
  return `<section class="sport-history-leaders" aria-labelledby="sport-history-leaders-title">
            <h3 id="sport-history-leaders-title">Top winners in this archive</h3>
            <table class="sport-history-leader-table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Winner</th>
                  <th scope="col">Titles</th>
                  <th scope="col">Years</th>
                  <th scope="col">Graph</th>
                </tr>
              </thead>
              <tbody>
                ${leaderRows}
              </tbody>
            </table>
          </section>`;
}

function calendarHref(event, edition) {
  const year = edition.year || event.startDate.slice(0, 4);
  const start = String(edition.startDate || event.startDate || '').replace(/-/g, '');
  const end = String(edition.endExclusive || checkoutDate(event) || '').replace(/-/g, '');
  const summary = `${event.title} ${year}`;
  const description = edition.calendarDescription || `${summary}.`;
  const location = [edition.venue || event.venue, event.city].filter(Boolean).join(', ');
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OneSliders//Event Calendar//EN',
    'BEGIN:VEVENT',
    `UID:${event.slug}-${year}@one-sliders.com`,
    `DTSTAMP:${year}0101T000000Z`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${summary}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

function editionBookingHref(event, edition) {
  const stayArea = `${event.bookingCity}, ${event.primaryCountry.name}`;
  return `${BOOKING_BASE}ss%3D${encodeURIComponent(stayArea)}`
    + `%26checkin%3D${encodeURIComponent(edition.startDate || '')}`
    + `%26checkout%3D${encodeURIComponent(edition.endExclusive || '')}`
    + '%26group_adults%3D2%26no_rooms%3D1';
}

function historyPanel(event) {
  const rows = historyRowsForPanel(event);
  if (!rows.length) return '';
  const latestYear = Math.max(...rows.map((row) => row.year));
  const winnerLeaders = sportWinnerLeaders(event);
  const isDualFinal = event.slug === 'the-hundred-final' || event.slug === 'sydney-marathon';
  const columnLabels = isDualFinal
    ? ['Men', 'Women', '']
    : ['#1', '#2', '#3'];
  const rowsByYear = new Map();
  rows.forEach((row) => {
    const yearRows = rowsByYear.get(row.year) || [];
    yearRows.push(row);
    rowsByYear.set(row.year, yearRows);
  });
  (historyNoEditionOverrides[event.slug] || []).forEach((entry) => {
    rowsByYear.set(entry.year, [{ noEdition: true, note: entry.note }]);
  });
  const yearRows = [...rowsByYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, yearEntries]) => {
      if (yearEntries[0]?.noEdition) {
        return `<li class="sport-history-year-row" id="year-${esc(year)}">
                    <strong class="sport-history-year">${esc(year)}</strong>
                    <span class="sport-history-position">${esc(yearEntries[0].note)}</span>
                    <span class="sport-history-position sport-history-position--empty" aria-hidden="true"></span>
                  </li>`;
      }
      const byRank = new Map(yearEntries.map((row) => [row.rank.label, row]));
      const winnerCells = isDualFinal
        ? `${historyWinnerCell(byRank.get('Men') || byRank.get('#1') || yearEntries[0], 'Men')}
                    ${historyWinnerCell(byRank.get('Women') || byRank.get('#2') || yearEntries[1], 'Women')}`
        : `${historyWinnerCell(byRank.get('#1') || yearEntries[0], '#1')}
                    ${historyWinnerCell(byRank.get('#2') || yearEntries[1], '#2')}
                    ${historyWinnerCell(byRank.get('#3') || yearEntries[2], '#3')}`;
      return `<li class="sport-history-year-row" id="year-${esc(year)}">
                    <strong class="sport-history-year">${esc(year)}</strong>
                    ${winnerCells}
                  </li>`;
    }).join('\n');
  const intro = event.slug === 'sydney-marathon'
    ? `This archive covers every Sydney Marathon edition from 2001 to ${latestYear}, with men's and women's winners shown separately and 2020-2021 marked as years without an in-person race.`
    : event.topic === 'tennis'
    ? `The latest recorded edition in this data is ${latestYear}. The archive keeps the recent ranked results together with country and final note where available.`
    : `The latest recorded edition in this data is ${latestYear}. The list below keeps the archive compact: top result, host setting and final note, so the event page explains what came before without turning into a long article.`;
  return `<div class="event-tab-panel" id="panel-history">
              <div class="event-panel-inner">
                <div class="sport-history-body">
                  <h2>${esc(event.title)} history</h2>
                  <p>${esc(intro)}</p>
                </div>
                ${winnerLeaders}
                <div class="sport-history-grid${isDualFinal ? ' sport-history-grid--dual' : ''}" role="table" aria-label="${esc(event.title)} recent history">
                  <div class="sport-history-head" role="row">
                    <span>Year</span>
                    ${columnLabels.filter(Boolean).map((label) => `<span>${esc(label)}</span>`).join('\n                    ')}
                  </div>
                  <ol class="sport-history-list" role="rowgroup">
                    ${yearRows}
                  </ol>
                </div>
              </div>
            </div>`;
}

function futureEditionsFor(event) {
  const currentYear = Number(event.startDate.slice(0, 4));
  return (futureEditionOverrides[event.slug] || [])
    .filter((edition) => Number(edition.year) > currentYear)
    .map((edition) => ({
      ...edition,
      countries: (edition.countries || []).map(countryObject).filter(Boolean)
    }))
    .sort((a, b) => Number(a.year) - Number(b.year));
}

function upcomingPanel(event) {
  const future = futureEditionsFor(event);
  if (!future.length) return '';
  const intro = event.slug === 'sydney-marathon'
    ? 'Next announced date after 2026: 29 Aug 2027. No 2028 row is shown until a reliable date is announced.'
    : 'Future editions stay on this event page and can be linked directly with the year hash.';
  const cards = future.map((edition) => {
    const countryText = edition.countries.length
      ? edition.countries.map(countryChip).join(' ')
      : '';
    const calendarName = `${event.slug}-${edition.year}.ics`;
    return `<article class="event-upcoming-card" id="year-${esc(edition.year)}">
                    <a class="event-upcoming-card__year" href="#year-${esc(edition.year)}" aria-label="${esc(event.title)} ${esc(edition.year)}">${esc(edition.year)}</a>
                    <div class="event-upcoming-card__body">
                      <strong>${esc(edition.dates)}</strong>
                      <span>${esc(edition.venue)}</span>
                      <span>${countryText}</span>
                    </div>
                    <div class="event-upcoming-card__actions">
                      <a class="os-button os-button--secondary event-upcoming-action" href="${calendarHref(event, edition)}" download="${esc(calendarName)}">Add to calendar</a>
                      <a class="os-button os-button--primary event-upcoming-action" href="${esc(editionBookingHref(event, edition))}" target="_blank" rel="nofollow sponsored noopener">Book stay</a>
                    </div>
                  </article>`;
  }).join('\n');
  return `<div class="event-tab-panel" id="panel-upcoming">
              <div class="event-panel-inner">
                <div class="event-upcoming-body">
                  <h2>Upcoming ${esc(event.title)} editions</h2>
                  <p>${esc(intro)}</p>
                </div>
                <div class="event-upcoming-list" aria-label="${esc(event.title)} upcoming editions">
                  ${cards}
                </div>
              </div>
            </div>`;
}

function infoTabs(event) {
  const year = event.startDate.slice(0, 4);
  const history = historyPanel(event);
  const upcoming = upcomingPanel(event);
  return `<div class="event-tabs">
          <input type="radio" name="event-tab" id="tab-overview" checked>
          ${upcoming ? '<input type="radio" name="event-tab" id="tab-upcoming">' : ''}
          ${history ? '<input type="radio" name="event-tab" id="tab-history">' : ''}

          <div class="event-tablist" role="tablist">
            <label class="event-tab-label" for="tab-overview">Overview</label>
            ${upcoming ? '<label class="event-tab-label" for="tab-upcoming">Upcoming</label>' : ''}
            ${history ? '<label class="event-tab-label" for="tab-history">History</label>' : ''}
          </div>

          <div class="event-tab-panels">
            <div class="event-tab-panel" id="panel-overview">
              <div class="event-panel-inner">
                <span class="event-year-anchor" id="year-${esc(year)}" aria-hidden="true"></span>
                <ol class="event-overview-facts" aria-label="${esc(event.title)} key facts">
                  ${overviewFactItems(event)}
                </ol>
                <div class="event-overview-body">
                  <h2>${esc(event.title)} ${esc(year)}</h2>
                  <p>${esc(overviewText(event))}</p>
                  <div class="event-overview-notes">
                    ${overviewBlocks(event)}
                  </div>
                </div>
              </div>
            </div>
            ${upcoming}
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
    lastUpdated: event.lastChecked || '29 July 2026',
    templateMode: 'one-slider',
    eventType: 'edition',
    topic: event.topic,
    sources: event.sources || [],
    editions
  };
  return `<!doctype html>
<html lang="en">
<head>
  <link rel="stylesheet" href="${CSS_BASE}/1_colours.css">
  <link rel="stylesheet" href="${CSS_BASE}/1_typography.css">
  <link rel="stylesheet" href="${CSS_BASE}/1_core.css">
  <link rel="stylesheet" href="${CSS_BASE}/2_frame.css">
  <link rel="stylesheet" href="${CSS_BASE}/3_event.css">
  <link rel="stylesheet" href="${CSS_BASE}/4_flik-left-booking.css">
  <link rel="stylesheet" href="${CSS_BASE}/4_flik-tabs.css">
  <link rel="stylesheet" href="${CSS_BASE}/4_flik-right-overview.css">
  <link rel="stylesheet" href="${CSS_BASE}/4_flik-right-upcoming.css">
  <link rel="stylesheet" href="${CSS_BASE}/4_flik-right-history.css">
  <script defer src="/assets/js/1_core.js"></script>
  <script defer src="/assets/js/3_event.js"></script>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="os-back-href" content="${topicHref(event)}">
  <meta name="os-back-label" content="${esc(topicLabel(event.topic))}">
  <meta name="os-page-title" content="${esc(event.title)}">
  <link rel="icon" href="/assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="/assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="/assets/icons/site.webmanifest">
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
</head>
<body class="event-dashboard onepage event-booking-left" data-cat="${esc(event.category)}" data-os-category="${esc(event.category)}" data-event-schema="${esc(json(schemaFor(event)))}">
  ${topMenu(event)}
  <main class="page-shell page-content page-frame">
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
  const historyGaps = ready.map(sportHistoryCoverage).filter(Boolean);
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
  const historyGapPath = path.join(ROOT, 'tmp', `v3-register-${scope}-sport-history-gaps.json`);
  fs.writeFileSync(historyGapPath, json(historyGaps), 'utf8');
  console.log(`build-register-v3-events: wrote ${ready.length}, skipped ${skipped.length}.`);
  if (skipped.length) console.log(`Skipped report: ${reportPath}`);
  if (historyGaps.length) console.log(`Sport history gaps: ${historyGapPath}`);
}

main();
