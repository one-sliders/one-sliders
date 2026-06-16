import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sportRoot = path.join(root, 'content/categories/sport');

const countries = {
  australia: country('Australia', '/content/locations/oceania/australia/index.html', '/content/locations/oceania/australia/img/flag.svg'),
  brazil: country('Brazil', '/content/locations/south-america/brazil/index.html', '/content/locations/south-america/brazil/img/flag.svg'),
  canada: country('Canada', '/content/locations/north-america/canada/index.html', '/content/locations/north-america/canada/img/flag.svg'),
  france: country('France', '/content/locations/europe/france/index.html', '/content/locations/europe/france/img/flag.svg'),
  germany: country('Germany', '/content/locations/europe/germany/index.html', '/content/locations/europe/germany/img/flag.svg'),
  italy: country('Italy', '/content/locations/europe/italy/index.html', '/content/locations/europe/italy/img/flag.svg'),
  japan: country('Japan', '/content/locations/asia/japan/index.html', '/content/locations/asia/japan/img/flag.svg'),
  malaysia: country('Malaysia', '/content/locations/asia/malaysia/index.html', '/content/locations/asia/malaysia/img/flag.svg'),
  mexico: country('Mexico', '/content/locations/north-america/mexico/index.html', '/content/locations/north-america/mexico/img/flag.svg'),
  netherlands: country('Netherlands', '/content/locations/europe/netherlands/index.html', '/content/locations/europe/netherlands/img/flag.svg'),
  qatar: country('Qatar', '/content/locations/asia/qatar/index.html', '/content/locations/asia/qatar/img/flag.svg'),
  singapore: country('Singapore', '/content/locations/asia/singapore/index.html', '/content/locations/asia/singapore/img/flag.svg'),
  southAfrica: country('South Africa', '/content/locations/africa/south-africa/index.html', '/content/locations/africa/south-africa/img/flag.svg'),
  southKorea: country('South Korea', '/content/locations/asia/south-korea/index.html', '/content/locations/asia/south-korea/img/flag.svg'),
  spain: country('Spain', '/content/locations/europe/spain/index.html', '/content/locations/europe/spain/img/flag.svg'),
  uae: country('United Arab Emirates', '/content/locations/asia/united-arab-emirates/index.html', '/content/locations/asia/united-arab-emirates/img/flag.svg'),
  uk: country('United Kingdom', '/content/locations/europe/united-kingdom/index.html', '/content/locations/europe/united-kingdom/img/flag.svg'),
  uruguay: country('Uruguay', '/content/locations/south-america/uruguay/index.html', '/content/locations/south-america/uruguay/img/flag.svg'),
  usa: country('United States', '/content/locations/north-america/usa/index.html', '/content/locations/north-america/usa/img/flag.svg')
};

const overrides = {
  'army-navy-game': {
    year: 2027,
    startDate: '2027-12-11',
    dates: '11 Dec 2027',
    venue: 'Lincoln Financial Field',
    cities: [{ name: 'Philadelphia' }],
    countries: [countries.usa],
    source: ['Army-Navy future sites', 'https://armynavygame.com/news/2022/6/15/football-future-sites-of-americas-game-announced.aspx']
  },
  'college-football-playoff-national-championship': {
    year: 2027,
    startDate: '2027-01-25',
    dates: '25 Jan 2027',
    venue: 'Allegiant Stadium',
    cities: [{ name: 'Las Vegas' }],
    countries: [countries.usa],
    source: ['College Football Playoff future championship sites', 'https://collegefootballplayoff.com/']
  },
  'nfl-draft': {
    year: 2027,
    dates: '2027 dates TBC',
    venue: 'National Mall',
    cities: [{ name: 'Washington, D.C.' }],
    countries: [countries.usa],
    source: ['NFL 2027 Draft host announcement', 'https://www.nfl.com/draft/']
  },
  'rose-bowl-game': {
    year: 2027,
    startDate: '2027-01-01',
    dates: '1 Jan 2027',
    venue: 'Rose Bowl Stadium',
    cities: [{ name: 'Pasadena' }],
    countries: [countries.usa],
    source: ['Rose Bowl Game venue', 'https://rosebowlgame.com/']
  },
  'sugar-bowl': {
    year: 2027,
    startDate: '2027-01-01',
    dates: '1 Jan 2027',
    venue: 'Caesars Superdome',
    cities: [{ name: 'New Orleans' }],
    countries: [countries.usa],
    source: ['Sugar Bowl venue', 'https://allstatesugarbowl.org/']
  },
  'college-world-series': {
    year: 2026,
    venue: 'Charles Schwab Field Omaha',
    cities: [{ name: 'Omaha' }],
    countries: [countries.usa],
    source: ['NCAA Men College World Series venue', 'https://www.ncaa.com/championships/baseball/d1']
  },
  'little-league-world-series': {
    year: 2026,
    venue: 'Howard J. Lamade Stadium and Volunteer Stadium',
    cities: [{ name: 'Williamsport' }],
    countries: [countries.usa],
    source: ['Little League World Series location', 'https://www.littleleague.org/world-series/']
  },
  'mlb-all-star-game': {
    year: 2027,
    startDate: '2027-07-13',
    dates: '13 Jul 2027',
    venue: 'Wrigley Field',
    cities: [{ name: 'Chicago' }],
    countries: [countries.usa],
    source: ['MLB 2027 All-Star Game announcement', 'https://www.mlb.com/']
  },
  'champions-league-final': {
    year: 2027,
    startDate: '2027-06-05',
    dates: '5 Jun 2027',
    venue: 'Estadio Metropolitano',
    cities: [{ name: 'Madrid' }],
    countries: [countries.spain],
    source: ['UEFA 2027 Champions League final host', 'https://www.uefa.com/uefachampionsleague/']
  },
  'copa-libertadores-final': {
    year: 2026,
    startDate: '2026-11-28',
    dates: '28 Nov 2026',
    venue: 'Estadio Centenario',
    cities: [{ name: 'Montevideo' }],
    countries: [countries.uruguay],
    source: ['CONMEBOL Libertadores 2026 final venue', 'https://www.conmebol.com/libertadores/']
  },
  'uefa-europa-league-final': {
    year: 2027,
    startDate: '2027-05-26',
    dates: '26 May 2027',
    venue: 'Waldstadion',
    cities: [{ name: 'Frankfurt' }],
    countries: [countries.germany],
    source: ['UEFA 2027 Europa League final host', 'https://www.uefa.com/uefaeuropaleague/']
  },
  'abu-dhabi-grand-prix': {
    year: 2026,
    venue: 'Yas Marina Circuit',
    cities: [{ name: 'Abu Dhabi' }],
    countries: [countries.uae],
    source: ['Formula 1 Abu Dhabi Grand Prix venue', 'https://www.formula1.com/']
  },
  'las-vegas-grand-prix': {
    year: 2026,
    venue: 'Las Vegas Strip Circuit',
    cities: [{ name: 'Las Vegas' }],
    countries: [countries.usa],
    source: ['Formula 1 Las Vegas Grand Prix venue', 'https://www.formula1.com/']
  },
  'mexico-city-grand-prix': {
    year: 2026,
    venue: 'Autodromo Hermanos Rodriguez',
    cities: [{ name: 'Mexico City' }],
    countries: [countries.mexico],
    source: ['Formula 1 Mexico City Grand Prix venue', 'https://www.formula1.com/']
  },
  'qatar-grand-prix': {
    year: 2026,
    venue: 'Lusail International Circuit',
    cities: [{ name: 'Doha' }],
    countries: [countries.qatar],
    source: ['Formula 1 Qatar Grand Prix venue', 'https://www.formula1.com/']
  },
  'sao-paulo-grand-prix': {
    year: 2026,
    venue: 'Interlagos / Autodromo Jose Carlos Pace',
    cities: [{ name: 'Sao Paulo' }],
    countries: [countries.brazil],
    source: ['Formula 1 Sao Paulo Grand Prix venue', 'https://www.formula1.com/']
  },
  'singapore-grand-prix': {
    year: 2026,
    venue: 'Marina Bay Street Circuit',
    cities: [{ name: 'Singapore' }],
    countries: [countries.singapore],
    source: ['Formula 1 Singapore Grand Prix venue', 'https://www.formula1.com/']
  },
  'united-states-grand-prix': {
    year: 2026,
    venue: 'Circuit of The Americas',
    cities: [{ name: 'Austin, Texas' }],
    countries: [countries.usa],
    source: ['Formula 1 United States Grand Prix venue', 'https://www.formula1.com/']
  },
  'the-hundred-final': {
    year: 2026,
    venue: 'Lord\'s',
    cities: [{ name: 'London' }],
    countries: [countries.uk],
    source: ['The Hundred finals venue', 'https://www.thehundred.com/']
  },
  'paris-roubaix': {
    year: 2027,
    venue: 'Roubaix Velodrome',
    cities: [{ name: 'Roubaix' }],
    countries: [countries.france],
    source: ['Paris-Roubaix route finish', 'https://www.paris-roubaix.fr/']
  },
  'kentucky-derby': {
    venue: 'Churchill Downs',
    cities: [{ name: 'Louisville' }],
    countries: [countries.usa],
    source: ['Kentucky Derby at Churchill Downs', 'https://www.kentuckyderby.com/']
  },
  'grand-national': {
    venue: 'Aintree Racecourse',
    cities: [{ name: 'Liverpool' }],
    countries: [countries.uk],
    source: ['Grand National at Aintree', 'https://www.thejockeyclub.co.uk/aintree/events-tickets/grand-national/']
  },
  'royal-ascot': {
    venue: 'Ascot Racecourse',
    cities: [{ name: 'Ascot' }],
    countries: [countries.uk],
    source: ['Royal Ascot venue', 'https://www.ascot.com/royal-ascot']
  },
  'cheltenham-gold-cup': {
    venue: 'Cheltenham Racecourse',
    cities: [{ name: 'Cheltenham' }],
    countries: [countries.uk],
    source: ['Cheltenham Festival venue', 'https://www.thejockeyclub.co.uk/cheltenham/events-tickets/the-festival/']
  },
  'prix-de-l-arc-de-triomphe': {
    venue: 'ParisLongchamp Racecourse',
    cities: [{ name: 'Paris' }],
    countries: [countries.france],
    source: ['Prix de l Arc de Triomphe venue', 'https://www.france-galop.com/en/racecourse-and-events/parislongchamp']
  },
  'japan-cup': {
    venue: 'Tokyo Racecourse',
    cities: [{ name: 'Tokyo' }],
    countries: [countries.japan],
    source: ['Japan Cup venue', 'https://japanracing.jp/en/']
  },
  'melbourne-cup': {
    venue: 'Flemington Racecourse',
    cities: [{ name: 'Melbourne' }],
    countries: [countries.australia],
    source: ['Melbourne Cup Carnival venue', 'https://www.vrc.com.au/melbourne-cup-carnival/']
  },
  'durban-july': {
    venue: 'Hollywoodbets Greyville Racecourse',
    cities: [{ name: 'Durban' }],
    countries: [countries.southAfrica],
    source: ['Hollywoodbets Durban July venue', 'https://www.hollywoodbetsdurbanjuly.co.za/']
  },
  'australian-motogp': {
    venue: 'Phillip Island Grand Prix Circuit',
    cities: [{ name: 'Phillip Island' }],
    countries: [countries.australia],
    source: ['MotoGP Australian Grand Prix venue', 'https://www.motogp.com/']
  },
  'british-motogp': {
    venue: 'Silverstone Circuit',
    cities: [{ name: 'Silverstone' }],
    countries: [countries.uk],
    source: ['MotoGP British Grand Prix venue', 'https://www.motogp.com/']
  },
  'dutch-tt-assen': {
    venue: 'TT Circuit Assen',
    cities: [{ name: 'Assen' }],
    countries: [countries.netherlands],
    source: ['Dutch TT Assen venue', 'https://www.ttcircuit.com/']
  },
  'french-motogp': {
    venue: 'Bugatti Circuit',
    cities: [{ name: 'Le Mans' }],
    countries: [countries.france],
    source: ['MotoGP French Grand Prix venue', 'https://www.motogp.com/']
  },
  'german-motogp': {
    venue: 'Sachsenring',
    cities: [{ name: 'Hohenstein-Ernstthal' }],
    countries: [countries.germany],
    source: ['MotoGP German Grand Prix venue', 'https://www.motogp.com/']
  },
  'italian-motogp': {
    venue: 'Mugello Circuit',
    cities: [{ name: 'Mugello' }],
    countries: [countries.italy],
    source: ['MotoGP Italian Grand Prix venue', 'https://www.motogp.com/']
  },
  'malaysian-motogp': {
    venue: 'Petronas Sepang International Circuit',
    cities: [{ name: 'Sepang' }],
    countries: [countries.malaysia],
    source: ['Sepang International Circuit MotoGP venue', 'https://www.sepangcircuit.com/']
  },
  'qatar-motogp': {
    venue: 'Lusail International Circuit',
    cities: [{ name: 'Doha' }],
    countries: [countries.qatar],
    source: ['Lusail International Circuit MotoGP venue', 'https://www.lcsc.qa/']
  },
  'spanish-motogp': {
    venue: 'Circuito de Jerez - Angel Nieto',
    cities: [{ name: 'Jerez' }],
    countries: [countries.spain],
    source: ['MotoGP Spanish Grand Prix venue', 'https://www.motogp.com/']
  },
  'daytona-500': {
    venue: 'Daytona International Speedway',
    cities: [{ name: 'Daytona Beach' }],
    countries: [countries.usa],
    source: ['Daytona 500 venue', 'https://www.daytonainternationalspeedway.com/events/daytona-500/']
  },
  'sebring-12-hours': {
    venue: 'Sebring International Raceway',
    cities: [{ name: 'Sebring' }],
    countries: [countries.usa],
    source: ['Sebring 12 Hours venue', 'https://www.sebringraceway.com/']
  },
  'bathurst-1000': {
    venue: 'Mount Panorama Circuit',
    cities: [{ name: 'Bathurst' }],
    countries: [countries.australia],
    source: ['Bathurst 1000 venue', 'https://www.supercars.com/events/bathurst-1000']
  },
  'goodwood-festival-of-speed': {
    venue: 'Goodwood House',
    cities: [{ name: 'Goodwood' }],
    countries: [countries.uk],
    source: ['Goodwood Festival of Speed venue', 'https://www.goodwood.com/motorsport/festival-of-speed/']
  },
  'indian-wells-masters': {
    venue: 'Indian Wells Tennis Garden',
    cities: [{ name: 'Indian Wells' }],
    countries: [countries.usa],
    source: ['BNP Paribas Open venue', 'https://bnpparibasopen.com/']
  },
  'miami-open-tennis': {
    venue: 'Hard Rock Stadium',
    cities: [{ name: 'Miami Gardens' }],
    countries: [countries.usa],
    source: ['Miami Open venue', 'https://www.miamiopen.com/']
  },
  'atp-finals': {
    venue: 'Inalpi Arena',
    cities: [{ name: 'Turin' }],
    countries: [countries.italy],
    source: ['ATP Finals venue', 'https://www.nittoatpfinals.com/']
  }
};

function country(name, url, flag) {
  return { name, url, flag };
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function eventJson(source) {
  const match = source.match(/<script type="application\/json" id="event-year-data">([\s\S]*?)<\/script>/);
  if (!match) return null;
  return { raw: match[1], data: JSON.parse(match[1]) };
}

function activeEdition(data, forcedYear) {
  return (data.editions || []).find((edition) => String(edition.year) === String(forcedYear))
    || (data.editions || []).find((edition) => edition.year === data.defaultYear)
    || (data.editions || []).find((edition) => edition.status === 'upcoming');
}

const patched = [];
const skipped = [];

for (const file of walk(sportRoot).filter((item) => item.endsWith('.html') && item.includes(`${path.sep}events${path.sep}`))) {
  const source = fs.readFileSync(file, 'utf8');
  const parsed = eventJson(source);
  if (!parsed) continue;
  const override = overrides[parsed.data.slug];
  if (!override) continue;
  const edition = activeEdition(parsed.data, override.year);
  if (!edition || edition.status === 'past') {
    skipped.push({ file: path.relative(root, file), reason: 'edition not active/upcoming' });
    continue;
  }
  edition.venue = override.venue;
  edition.cities = override.cities;
  edition.countries = override.countries;
  const mainCity = override.cities?.[0]?.name || '';
  if (mainCity) edition.headingPlace = `in ${mainCity}`;
  if (override.startDate) edition.startDate = override.startDate;
  if (override.dates) edition.dates = override.dates;
  if (Array.isArray(edition.questions)) {
    const whereQuestion = edition.questions.find((item) => /where is it held/i.test(item.q || ''));
    if (whereQuestion && mainCity) {
      whereQuestion.a = `${override.venue}, ${mainCity}, ${override.countries.map((item) => item.name).join(', ')}.`;
      whereQuestion.detail = 'Venue and host city checked from the listed source; confirm final gates, sessions and transport before booking.';
    }
  }
  if (override.source) {
    parsed.data.sources = parsed.data.sources || [];
    if (!parsed.data.sources.some((item) => item.url === override.source[1])) {
      parsed.data.sources.push({ label: override.source[0], url: override.source[1] });
    }
  }
  delete edition.currentModules;
  let next = source.replace(parsed.raw, JSON.stringify(parsed.data));
  if (mainCity) {
    next = next.replace(
      /(<span>Main city<\/span><strong>)([^<]*)(<\/strong>)/,
      `$1${mainCity}$3`
    );
  }
  if (next !== source) {
    fs.writeFileSync(file, next, 'utf8');
    patched.push(path.relative(root, file));
  }
}

console.log(JSON.stringify({ patched: patched.length, patchedFiles: patched, skipped }, null, 2));
