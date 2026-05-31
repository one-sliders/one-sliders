import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const today = new Date('2026-05-31T12:00:00Z');
const lastUpdated = '31 May 2026';
const eventDir = path.join(root, 'content/categories/sport/golf/events');
const eventImgDir = path.join(eventDir, 'img');
const espnHistory = readJsonIfExists(path.join(root, 'scripts/data/golf-espn-history.json'));
const espnLeaderboards = readJsonIfExists(path.join(root, 'scripts/data/golf-espn-leaderboards.json'));

const countries = {
  usa: country('United States', '/content/locations/north-america/usa/index.html', '/content/locations/north-america/usa/img/flag.svg', 'north-america', 'usa'),
  canada: country('Canada', '/content/locations/north-america/canada/index.html', '/content/locations/north-america/canada/img/flag.svg', 'north-america', 'canada'),
  mexico: country('Mexico', '/content/locations/north-america/mexico/index.html', '/content/locations/north-america/mexico/img/flag.svg', 'north-america', 'mexico'),
  dominicanRepublic: country('Dominican Republic', '/content/locations/north-america/dominican-republic/index.html', '/content/locations/north-america/dominican-republic/img/flag.svg', 'north-america', 'dominican-republic'),
  unitedKingdom: country('United Kingdom', '/content/locations/europe/united-kingdom/index.html', '/content/locations/europe/united-kingdom/img/flag.svg', 'europe', 'united-kingdom'),
  ireland: country('Ireland', '/content/locations/europe/ireland/index.html', '/content/locations/europe/ireland/img/flag.svg', 'europe', 'ireland'),
  sweden: country('Sweden', '/content/locations/europe/sweden/index.html', '/content/locations/europe/sweden/img/flag.svg', 'europe', 'sweden'),
  norway: country('Norway', '/content/locations/europe/norway/index.html', '/content/locations/europe/norway/img/flag.svg', 'europe', 'norway'),
  denmark: country('Denmark', '/content/locations/europe/denmark/index.html', '/content/locations/europe/denmark/img/flag.svg', 'europe', 'denmark'),
  belgium: country('Belgium', '/content/locations/europe/belgium/index.html', '/content/locations/europe/belgium/img/flag.svg', 'europe', 'belgium'),
  austria: country('Austria', '/content/locations/europe/austria/index.html', '/content/locations/europe/austria/img/flag.svg', 'europe', 'austria'),
  germany: country('Germany', '/content/locations/europe/germany/index.html', '/content/locations/europe/germany/img/flag.svg', 'europe', 'germany'),
  finland: country('Finland', '/content/locations/europe/finland/index.html', '/content/locations/europe/finland/img/flag.svg', 'europe', 'finland'),
  netherlands: country('Netherlands', '/content/locations/europe/netherlands/index.html', '/content/locations/europe/netherlands/img/flag.svg', 'europe', 'netherlands'),
  poland: country('Poland', '/content/locations/europe/poland/index.html', '/content/locations/europe/poland/img/flag.svg', 'europe', 'poland'),
  italy: country('Italy', '/content/locations/europe/italy/index.html', '/content/locations/europe/italy/img/flag.svg', 'europe', 'italy'),
  portugal: country('Portugal', '/content/locations/europe/portugal/index.html', '/content/locations/europe/portugal/img/flag.svg', 'europe', 'portugal'),
  japan: country('Japan', '/content/locations/asia/japan/index.html', '/content/locations/asia/japan/img/flag.svg', 'asia', 'japan'),
  thailand: country('Thailand', '/content/locations/asia/thailand/index.html', '/content/locations/asia/thailand/img/flag.svg', 'asia', 'thailand'),
  singapore: country('Singapore', '/content/locations/asia/singapore/index.html', '/content/locations/asia/singapore/img/flag.svg', 'asia', 'singapore'),
  china: country('China', '/content/locations/asia/china/index.html', '/content/locations/asia/china/img/flag.svg', 'asia', 'china'),
  southKorea: country('South Korea', '/content/locations/asia/south-korea/index.html', '/content/locations/asia/south-korea/img/flag.svg', 'asia', 'south-korea'),
  malaysia: country('Malaysia', '/content/locations/asia/malaysia/index.html', '/content/locations/asia/malaysia/img/flag.svg', 'asia', 'malaysia'),
  india: country('India', '/content/locations/asia/india/index.html', '/content/locations/asia/india/img/flag.svg', 'asia', 'india'),
  taiwan: country('Taiwan', '/content/locations/asia/taiwan/index.html', '/content/locations/asia/taiwan/img/flag.svg', 'asia', 'taiwan'),
  philippines: country('Philippines', '/content/locations/asia/philippines/index.html', '/content/locations/asia/philippines/img/flag.svg', 'asia', 'philippines'),
  france: country('France', '/content/locations/europe/france/index.html', '/content/locations/europe/france/img/flag.svg', 'europe', 'france'),
  saudiArabia: country('Saudi Arabia', '/content/locations/asia/saudi-arabia/index.html', '/content/locations/asia/saudi-arabia/img/flag.svg', 'asia', 'saudi-arabia'),
  australia: country('Australia', '/content/locations/oceania/australia/index.html', '/content/locations/oceania/australia/img/flag.svg', 'oceania', 'australia'),
  newZealand: country('New Zealand', '/content/locations/oceania/new-zealand/index.html', '/content/locations/oceania/new-zealand/img/flag.svg', 'oceania', 'new-zealand'),
  southAfrica: country('South Africa', '/content/locations/africa/south-africa/index.html', '/content/locations/africa/south-africa/img/flag.svg', 'africa', 'south-africa'),
  spain: country('Spain', '/content/locations/europe/spain/index.html', '/content/locations/europe/spain/img/flag.svg', 'europe', 'spain'),
  argentina: country('Argentina', '/content/locations/south-america/argentina/index.html', '/content/locations/south-america/argentina/img/flag.svg', 'south-america', 'argentina'),
  chile: country('Chile', '/content/locations/south-america/chile/index.html', '/content/locations/south-america/chile/img/flag.svg', 'south-america', 'chile'),
  colombia: country('Colombia', '/content/locations/south-america/colombia/index.html', '/content/locations/south-america/colombia/img/flag.svg', 'south-america', 'colombia'),
  venezuela: country('Venezuela', '/content/locations/south-america/venezuela/index.html', '/content/locations/south-america/venezuela/img/flag.svg', 'south-america', 'venezuela'),
  bahamas: country('Bahamas', '/content/locations/north-america/bahamas/index.html', '/content/locations/north-america/bahamas/img/flag.svg', 'north-america', 'bahamas')
};

const tours = {
  pga: {
    slug: 'pga',
    name: 'PGA Tour',
    label: 'FedExCup',
    description: 'The main men\'s weekly tour, built around regular events, signature events, major weeks and the FedExCup finish.',
    sourceLabel: 'PGA TOUR schedule',
    sourceUrl: 'https://www.pgatour.com/schedule',
    countLabel: '45 official events'
  },
  lpga: {
    slug: 'lpga',
    name: 'LPGA Tour',
    label: 'Race to CME Globe',
    description: 'The leading women\'s professional tour, with official events across North America, Asia and Europe.',
    sourceLabel: 'LPGA tournaments schedule',
    sourceUrl: 'https://www.lpga.com/tournaments',
    countLabel: '31 official events'
  },
  liv: {
    slug: 'liv',
    name: 'LIV Golf',
    label: 'League schedule',
    description: 'A global team-and-individual league playing 72-hole events in 2026, ending with a team championship.',
    sourceLabel: 'LIV Golf schedule',
    sourceUrl: 'https://www.livgolf.com/schedule',
    countLabel: '14 official events'
  }
};

const events = [
  pga('Sony Open in Hawaii', '2026-01-18', 'Hawaii', countries.usa, {
    startDate: '2026-01-15',
    city: 'Honolulu',
    venue: 'Waialae Country Club',
    purse: '$9,100,000',
    points: '500 FedExCup points',
    sourceLabel: 'PGA TOUR leaderboard',
    sourceUrl: 'https://www.pgatour.com/tournaments/2026/sony-open-in-hawaii/R2026006/leaderboard',
    winner: { name: 'Chris Gotterup', country: countries.usa, score: '-16', total: '264', rounds: '63, 69, 68, 64' }
  }),
  pga('The American Express', '2026-01-25', 'California', countries.usa),
  pga('Farmers Insurance Open', '2026-02-01', 'California', countries.usa),
  pga('WM Phoenix Open', '2026-02-08', 'Arizona', countries.usa),
  pga('AT&T Pebble Beach Pro-Am', '2026-02-15', 'California', countries.usa),
  pga('Genesis Invitational', '2026-02-22', 'California', countries.usa),
  pga('Cognizant Classic', '2026-03-01', 'Florida', countries.usa),
  pga('Arnold Palmer Invitational', '2026-03-08', 'Florida', countries.usa),
  pga('Puerto Rico Open', '2026-03-08', 'Puerto Rico', countries.usa),
  pga('The Players Championship', '2026-03-15', 'Florida', countries.usa),
  pga('Valspar Championship', '2026-03-22', 'Florida', countries.usa),
  pga('Texas Children\'s Houston Open', '2026-03-29', 'Texas', countries.usa, { slug: 'texas-childrens-houston-open' }),
  pga('Valero Texas Open', '2026-04-05', 'Texas', countries.usa),
  pga('Masters Tournament', '2026-04-12', 'Georgia', countries.usa, { slug: 'masters-tournament', major: true }),
  pga('RBC Heritage', '2026-04-19', 'South Carolina', countries.usa),
  pga('Zurich Classic of New Orleans', '2026-04-26', 'Louisiana', countries.usa),
  pga('Cadillac Championship', '2026-05-03', 'Florida', countries.usa, {
    startDate: '2026-04-30',
    city: 'Doral',
    venue: 'Trump National Doral',
    firstEditionYear: 2026,
    sourceLabel: 'Cadillac Championship PGA TOUR announcement',
    sourceUrl: 'https://www.pgatour.com/article/news/latest/2025/12/15/cadillac-championship-sponsor-pga-tour-new-signature-event',
    sources: [
      { label: 'Cadillac Championship PGA TOUR announcement', url: 'https://www.pgatour.com/article/news/latest/2025/12/15/cadillac-championship-sponsor-pga-tour-new-signature-event' },
      { label: 'PGA TOUR schedule', url: 'https://www.pgatour.com/schedule' }
    ]
  }),
  pga('Truist Championship', '2026-05-10', 'North Carolina', countries.usa),
  pga('ONEflight Myrtle Beach Classic', '2026-05-10', 'South Carolina', countries.usa),
  pga('PGA Championship', '2026-05-17', 'Pennsylvania', countries.usa, { slug: 'pga-championship', major: true }),
  pga('CJ Cup Byron Nelson', '2026-05-24', 'Texas', countries.usa),
  pga('Charles Schwab Challenge', '2026-05-31', 'Texas', countries.usa),
  pga('Memorial Tournament', '2026-06-07', 'Ohio', countries.usa),
  pga('RBC Canadian Open', '2026-06-14', 'Canada', countries.canada),
  pga('U.S. Open Golf', '2026-06-21', 'New York', countries.usa, { slug: 'us-open-golf', major: true }),
  pga('Travelers Championship', '2026-06-28', 'Connecticut', countries.usa),
  pga('John Deere Classic', '2026-07-05', 'Illinois', countries.usa),
  pga('Genesis Scottish Open', '2026-07-12', 'Scotland', countries.unitedKingdom),
  pga('ISCO Championship', '2026-07-12', 'Kentucky', countries.usa),
  pga('The Open Championship', '2026-07-19', 'England', countries.unitedKingdom, { slug: 'the-open-championship', major: true }),
  pga('Corales Puntacana Championship', '2026-07-19', 'Dominican Republic', countries.dominicanRepublic),
  pga('3M Open', '2026-07-26', 'Minnesota', countries.usa),
  pga('Rocket Classic', '2026-08-02', 'Michigan', countries.usa),
  pga('Wyndham Championship', '2026-08-09', 'North Carolina', countries.usa),
  pga('FedEx St. Jude Championship', '2026-08-16', 'Tennessee', countries.usa),
  pga('BMW Championship', '2026-08-23', 'Missouri', countries.usa),
  pga('Tour Championship', '2026-08-30', 'Georgia', countries.usa),
  pga('Biltmore Championship Asheville', '2026-09-20', 'North Carolina', countries.usa, {
    slug: 'biltmore-championship',
    startDate: '2026-09-17',
    city: 'Asheville',
    venue: 'The Cliffs at Walnut Cove',
    firstEditionYear: 2026,
    sourceLabel: 'Biltmore Championship announcement',
    sourceUrl: 'https://biltmorechampionship.com/news/2025/11/10/biltmore-championship-asheville-debut-2026-fedexcup-fall-pga-tour',
    sources: [
      { label: 'Biltmore Championship announcement', url: 'https://biltmorechampionship.com/news/2025/11/10/biltmore-championship-asheville-debut-2026-fedexcup-fall-pga-tour' },
      { label: 'PGA TOUR schedule', url: 'https://www.pgatour.com/schedule' }
    ]
  }),
  pga('Bank of Utah Championship', '2026-10-04', 'Utah', countries.usa),
  pga('Baycurrent Classic', '2026-10-11', 'Japan', countries.japan),
  pga('Butterfield Bermuda Championship', '2026-10-25', 'Bermuda', countries.unitedKingdom),
  pga('VidantaWorld Mexico Open', '2026-11-01', 'Mexico', countries.mexico),
  pga('World Wide Technology Championship', '2026-11-08', 'Mexico', countries.mexico),
  pga('Good Good Championship', '2026-11-15', 'Texas', countries.usa, {
    startDate: '2026-11-12',
    city: 'Austin',
    venue: 'Omni Barton Creek Resort & Spa - Fazio Canyons Course',
    firstEditionYear: 2026,
    sourceLabel: 'Good Good Championship announcement',
    sourceUrl: 'https://www.goodgoodchampionship.com/media/latest-news/good-good-championship-to-debut-on-pga-tour-in-2026/',
    sources: [
      { label: 'Good Good Championship announcement', url: 'https://www.goodgoodchampionship.com/media/latest-news/good-good-championship-to-debut-on-pga-tour-in-2026/' },
      { label: 'PGA TOUR schedule', url: 'https://www.pgatour.com/schedule' }
    ]
  }),
  pga('RSM Classic', '2026-11-22', 'Georgia', countries.usa),

  lpga('Hilton Grand Vacations Tournament of Champions', '2026-02-01', 'Florida', countries.usa),
  lpga('Honda LPGA Thailand', '2026-02-22', 'Thailand', countries.thailand),
  lpga('HSBC Women\'s World Championship', '2026-03-01', 'Singapore', countries.singapore, { slug: 'hsbc-womens-world-championship' }),
  lpga('Blue Bay LPGA', '2026-03-08', 'China', countries.china),
  lpga('Fortinet Founders Cup', '2026-03-22', 'California', countries.usa, {
    historyAliases: ['Founders Cup', 'Cognizant Founders Cup']
  }),
  lpga('Ford Championship presented by Wild Horse Pass', '2026-03-29', 'Arizona', countries.usa, { slug: 'ford-championship' }),
  lpga('Aramco Championship', '2026-04-05', 'Nevada', countries.usa),
  lpga('JM Eagle LA Championship presented by Plastpro', '2026-04-19', 'California', countries.usa, { slug: 'jm-eagle-la-championship' }),
  lpga('The Chevron Championship', '2026-04-26', 'Texas', countries.usa, { slug: 'chevron-championship', major: true }),
  lpga('Mexico Riviera Maya Open at Mayakoba', '2026-05-03', 'Mexico', countries.mexico, { slug: 'riviera-maya-open' }),
  lpga('Mizuho Americas Open', '2026-05-10', 'New Jersey', countries.usa),
  lpga('Kroger Queen City Championship presented by P&G', '2026-05-17', 'Ohio', countries.usa, { slug: 'kroger-queen-city-championship' }),
  lpga('ShopRite LPGA powered by Wakefern', '2026-05-31', 'New Jersey', countries.usa, {
    slug: 'shoprite-lpga-classic',
    historyAliases: ['ShopRite LPGA Classic']
  }),
  lpga('U.S. Women\'s Open presented by Ally', '2026-06-07', 'California', countries.usa, { slug: 'us-womens-open-golf', major: true }),
  lpga('Dow Championship', '2026-06-14', 'Michigan', countries.usa),
  lpga('Meijer LPGA Classic for Simply Give', '2026-06-21', 'Michigan', countries.usa, { slug: 'meijer-lpga-classic' }),
  lpga('KPMG Women\'s PGA Championship', '2026-06-28', 'Minnesota', countries.usa, { slug: 'kpmg-womens-pga-championship', major: true }),
  lpga('Amundi Evian Championship', '2026-07-12', 'France', countries.france, { major: true }),
  lpga('ISPS Handa Women\'s Scottish Open', '2026-07-26', 'Scotland', countries.unitedKingdom, { slug: 'isps-handa-womens-scottish-open' }),
  lpga('AIG Women\'s Open', '2026-08-02', 'England', countries.unitedKingdom, { slug: 'aig-womens-open', major: true }),
  lpga('The Standard Portland Classic', '2026-08-16', 'Oregon', countries.usa, { slug: 'portland-classic' }),
  lpga('CPKC Women\'s Open', '2026-08-23', 'Canada', countries.canada, { slug: 'cpkc-womens-open' }),
  lpga('FM Championship', '2026-08-30', 'Massachusetts', countries.usa),
  lpga('Walmart NW Arkansas Championship presented by P&G', '2026-09-27', 'Arkansas', countries.usa, { slug: 'walmart-nw-arkansas-championship' }),
  lpga('LOTTE Championship presented by Hoakalei', '2026-10-04', 'Hawaii', countries.usa, { slug: 'lotte-championship' }),
  lpga('Buick LPGA Shanghai', '2026-10-18', 'China', countries.china),
  lpga('BMW Ladies Championship', '2026-10-25', 'South Korea', countries.southKorea),
  lpga('Maybank Championship', '2026-11-01', 'Malaysia', countries.malaysia),
  lpga('TOTO Japan Classic', '2026-11-08', 'Japan', countries.japan, { slug: 'toto-japan-classic' }),
  lpga('The ANNIKA driven by Gainbridge at Pelican', '2026-11-15', 'Florida', countries.usa, { slug: 'the-annika' }),
  lpga('CME Group Tour Championship', '2026-11-22', 'Florida', countries.usa),

  liv('LIV Golf Riyadh', '2026-02-07', 'Riyadh', countries.saudiArabia, {
    startDate: '2026-02-04',
    city: 'Riyadh',
    venue: 'Riyadh Golf Club',
    sourceLabel: 'LIV Golf Riyadh leaderboard',
    sourceUrl: 'https://www.prd.livgolf.com/leaderboard/2026/riyadh',
    sources: [
      { label: 'LIV Golf schedule', url: 'https://www.livgolf.com/schedule' },
      { label: 'LIV Golf Riyadh leaderboard', url: 'https://www.prd.livgolf.com/leaderboard/2026/riyadh' }
    ],
    winner: { name: 'Elvis Smylie', country: countries.australia, score: '-24' },
    runnerUp: 'Jon Rahm (-23)',
    teamWinner: 'Ripper GC (-69)',
    resultNote: 'Elvis Smylie won at -24, one shot ahead of Jon Rahm. Ripper GC won the team competition at -69.'
  }),
  liv('LIV Golf Adelaide', '2026-02-15', 'Adelaide', countries.australia, {
    startDate: '2026-02-12',
    city: 'Adelaide',
    venue: 'The Grange Golf Club',
    sourceLabel: 'LIV Golf Adelaide event page',
    sourceUrl: 'https://www.livgolf.com/schedule/adelaide-2026',
    sources: [
      { label: 'LIV Golf Adelaide event page', url: 'https://www.livgolf.com/schedule/adelaide-2026' },
      { label: 'ESPN LIV Golf Adelaide leaderboard', url: 'https://www.espn.com/golf/leaderboard/_/tournamentId/401804701' }
    ],
    winner: { name: 'Anthony Kim', country: countries.usa, score: '-23', total: '265', rounds: '67, 67, 68, 63' },
    runnerUp: 'Jon Rahm (-20)',
    teamWinner: 'Ripper GC (-55)',
    resultNote: 'Anthony Kim closed with a 63 and won at -23, three shots ahead of Jon Rahm. Ripper GC won the team competition at -55.'
  }),
  liv('LIV Golf Hong Kong', '2026-03-08', 'Hong Kong', countries.china, {
    startDate: '2026-03-05',
    city: 'Fanling',
    venue: 'Hong Kong Golf Club at Fanling',
    sourceLabel: 'LIV Golf Hong Kong leaderboard',
    sourceUrl: 'https://www.livgolf.com/leaderboard/2026/hong-kong',
    sources: [
      { label: 'LIV Golf schedule', url: 'https://www.livgolf.com/schedule' },
      { label: 'LIV Golf Hong Kong leaderboard', url: 'https://www.livgolf.com/leaderboard/2026/hong-kong' }
    ],
    winner: { name: 'Jon Rahm', country: countries.spain, score: '-23', total: '257', rounds: '66, 62, 65, 64' },
    runnerUp: 'Thomas Detry (-20)',
    teamWinner: '4Aces GC (-58)',
    resultNote: 'Jon Rahm won at -23. 4Aces GC won the team competition at -58.'
  }),
  liv('LIV Golf Singapore', '2026-03-15', 'Singapore', countries.singapore, {
    startDate: '2026-03-12',
    city: 'Singapore',
    venue: 'Sentosa Golf Club',
    sourceLabel: 'LIV Golf Singapore recap',
    sourceUrl: 'https://www.livgolf.com/news/bryson-dechambeau-wins-playoff-aramco-liv-golf-singapore-4aces-gc-top-team-2026',
    sources: [
      { label: 'LIV Golf schedule', url: 'https://www.livgolf.com/schedule' },
      { label: 'LIV Golf Singapore recap', url: 'https://www.livgolf.com/news/bryson-dechambeau-wins-playoff-aramco-liv-golf-singapore-4aces-gc-top-team-2026' }
    ],
    winner: { name: 'Bryson DeChambeau', country: countries.usa, score: '-14', total: '270', rounds: '67, 65, 72, 66' },
    runnerUp: 'Richard T. Lee (-14)',
    teamWinner: '4Aces GC (-27)',
    resultNote: 'Bryson DeChambeau beat Richard T. Lee in a playoff after both finished at -14. 4Aces GC won the team competition at -27.'
  }),
  liv('LIV Golf South Africa', '2026-03-22', 'Johannesburg', countries.southAfrica, {
    startDate: '2026-03-19',
    city: 'Johannesburg',
    venue: 'The Club at Steyn City',
    sourceLabel: 'LIV Golf South Africa recap',
    sourceUrl: 'https://www.livgolf.com/news/bryson-dechambeau-crushers-gc-win-liv-golf-south-africa-2026',
    sources: [
      { label: 'LIV Golf schedule', url: 'https://www.livgolf.com/schedule' },
      { label: 'LIV Golf South Africa recap', url: 'https://www.livgolf.com/news/bryson-dechambeau-crushers-gc-win-liv-golf-south-africa-2026' }
    ],
    winner: { name: 'Bryson DeChambeau', country: countries.usa, score: '-26', total: '258', rounds: '63, 65, 64, 66' },
    runnerUp: 'Jon Rahm (-26)',
    teamWinner: 'Crushers GC (-76)',
    resultNote: 'Bryson DeChambeau beat Jon Rahm on the first playoff hole after both finished at -26. Crushers GC won the team competition at -76.'
  }),
  liv('LIV Golf Mexico City', '2026-04-19', 'Mexico City', countries.mexico, {
    startDate: '2026-04-16',
    city: 'Mexico City',
    venue: 'Club de Golf Chapultepec',
    sourceLabel: 'LIV Golf Mexico City leaderboard',
    sourceUrl: 'https://www.livgolf.com/leaderboard/2026/mexico-city',
    sources: [
      { label: 'LIV Golf schedule', url: 'https://www.livgolf.com/schedule' },
      { label: 'LIV Golf Mexico City leaderboard', url: 'https://www.livgolf.com/leaderboard/2026/mexico-city' }
    ],
    winner: { name: 'Jon Rahm', country: countries.spain, score: '-21' },
    runnerUp: 'David Puig (-15)',
    teamWinner: 'Legion XIII (-45)',
    resultNote: 'Jon Rahm won at -21, six shots ahead of David Puig. Legion XIII won the team competition at -45.'
  }),
  liv('LIV Golf Virginia', '2026-05-10', 'Virginia', countries.usa, {
    startDate: '2026-05-07',
    city: 'Sterling',
    venue: 'Trump National Golf Club, Washington D.C.',
    sourceLabel: 'LIV Golf Virginia leaderboard',
    sourceUrl: 'https://www.livgolf.com/leaderboard/2026/virginia',
    sources: [
      { label: 'LIV Golf schedule', url: 'https://www.livgolf.com/schedule' },
      { label: 'LIV Golf Virginia leaderboard', url: 'https://www.livgolf.com/leaderboard/2026/virginia' }
    ],
    winner: { name: 'Lucas Herbert', country: countries.australia, score: '-24' },
    runnerUp: 'Sergio Garcia (-20)',
    teamWinner: '4Aces GC (-49)',
    resultNote: 'Lucas Herbert won at -24, four shots ahead of Sergio Garcia. 4Aces GC won the team competition at -49.'
  }),
  liv('LIV Golf Korea', '2026-05-31', 'Busan', countries.southKorea, {
    startDate: '2026-05-28',
    city: 'Busan',
    venue: 'Asiad Country Club',
    sourceLabel: 'LIV Golf Korea leaderboard',
    sourceUrl: 'https://www.livgolf.com/leaderboard/2026/korea',
    sources: [
      { label: 'LIV Golf schedule', url: 'https://www.livgolf.com/schedule' },
      { label: 'LIV Golf Korea leaderboard', url: 'https://www.livgolf.com/leaderboard/2026/korea' }
    ],
    leaderNote: 'LIV Golf Korea is in progress at Asiad Country Club. Final result is added after Round 4 is complete.'
  }),
  liv('LIV Golf Andalucia', '2026-06-07', 'Andalucia', countries.spain, {
    startDate: '2026-06-04',
    city: 'Sotogrande',
    venue: 'Real Club Valderrama',
    sourceLabel: 'LIV Golf schedule',
    sourceUrl: 'https://www.livgolf.com/schedule'
  }),
  liv('LIV Golf Louisiana', '2026-06-28', 'Louisiana', countries.usa, {
    startDate: '2026-06-25',
    city: 'New Orleans',
    venue: 'Bayou Oaks at City Park',
    sourceLabel: 'LIV Golf Louisiana event page',
    sourceUrl: 'https://www.livgolf.com/schedule/louisiana-2026',
    sources: [
      { label: 'LIV Golf Louisiana event page', url: 'https://www.livgolf.com/schedule/louisiana-2026' },
      { label: 'LIV Golf Louisiana tickets page', url: 'https://events.livgolf.com/louisiana/' }
    ]
  }),
  liv('LIV Golf UK', '2026-07-26', 'England', countries.unitedKingdom, {
    startDate: '2026-07-23',
    city: 'Rocester',
    venue: 'JCB Golf & Country Club',
    sourceLabel: 'LIV Golf schedule',
    sourceUrl: 'https://www.livgolf.com/schedule'
  }),
  liv('LIV Golf New York', '2026-08-09', 'New Jersey', countries.usa, {
    startDate: '2026-08-06',
    city: 'Bedminster',
    venue: 'Trump National Golf Club Bedminster',
    sourceLabel: 'LIV Golf schedule',
    sourceUrl: 'https://www.livgolf.com/schedule'
  }),
  liv('LIV Golf Indianapolis', '2026-08-23', 'Indiana', countries.usa, {
    startDate: '2026-08-20',
    city: 'Westfield',
    venue: 'The Club at Chatham Hills',
    sourceLabel: 'LIV Golf schedule',
    sourceUrl: 'https://www.livgolf.com/schedule'
  }),
  liv('LIV Team Championship Michigan', '2026-08-30', 'Michigan', countries.usa, {
    startDate: '2026-08-27',
    city: 'Plymouth',
    venue: 'The Cardinal at Saint John\'s',
    sourceLabel: 'LIV Golf schedule',
    sourceUrl: 'https://www.livgolf.com/schedule'
  })
];

function country(name, url, flag, continent, slug) {
  return { name, url, flag, continent, slug };
}

function countryForName(name) {
  const normalized = String(name || '').toLowerCase();
  const aliases = {
    england: 'unitedKingdom',
    scotland: 'unitedKingdom',
    wales: 'unitedKingdom',
    'great britain': 'unitedKingdom',
    uk: 'unitedKingdom',
    usa: 'usa',
    'united states': 'usa',
    'south korea': 'southKorea',
    korea: 'southKorea',
    'new zealand': 'newZealand',
    'south africa': 'southAfrica'
  };
  const aliasKey = aliases[normalized];
  if (aliasKey && countries[aliasKey]) return countries[aliasKey];
  return Object.values(countries).find((item) => item.name.toLowerCase() === normalized) || null;
}

function pga(name, endDate, area, host, extra = {}) {
  return event('pga', name, endDate, area, host, extra);
}

function lpga(name, endDate, area, host, extra = {}) {
  return event('lpga', name, endDate, area, host, extra);
}

function liv(name, endDate, area, host, extra = {}) {
  return event('liv', name, endDate, area, host, extra);
}

function event(tour, name, endDate, area, host, extra) {
  const slug = extra.slug || slugify(name);
  return {
    tour,
    name,
    slug,
    startDate: extra.startDate || '',
    endDate,
    area,
    host,
    city: extra.city || '',
    venue: extra.venue || '',
    purse: extra.purse || '',
    points: extra.points || '',
    winner: extra.winner || null,
    runnerUp: extra.runnerUp || '',
    teamWinner: extra.teamWinner || '',
    resultNote: extra.resultNote || '',
    leaderNote: extra.leaderNote || '',
    sources: extra.sources || null,
    historyAliases: extra.historyAliases || [],
    major: !!extra.major,
    firstEditionYear: extra.firstEditionYear || null,
    sourceLabel: extra.sourceLabel || tours[tour].sourceLabel,
    sourceUrl: extra.sourceUrl || tours[tour].sourceUrl
  };
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function html(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readJsonIfExists(file) {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function countryChip(host) {
  return `<a class="country" href="${host.url}"><img src="${host.flag}" alt="" width="20" height="14">${html(host.name)}</a>`;
}

function eventHref(item) {
  return `golf/events/${item.slug}.html`;
}

function eventAbsHref(item) {
  return `/content/categories/sport/golf/events/${item.slug}.html`;
}

function eventMiniAbs(item) {
  return `/content/categories/sport/golf/events/img/${item.slug}-mini.png`;
}

function eventHeroAbs(item) {
  return `/content/categories/sport/golf/events/img/${item.slug}-hero.png`;
}

function endDateObj(item) {
  return new Date(`${item.endDate}T12:00:00Z`);
}

function startDateObj(item) {
  if (item.startDate) return new Date(`${item.startDate}T12:00:00Z`);
  const date = endDateObj(item);
  date.setUTCDate(date.getUTCDate() - 3);
  return date;
}

function statusLabel(item) {
  const end = endDateObj(item);
  const start = startDateObj(item);
  if (today > end) return 'Completed';
  if (today >= start) return 'Live week';
  return 'Upcoming';
}

function displayDate(item) {
  if (item.startDate) return shortDateRange(item);
  const date = endDateObj(item);
  return `Ends ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}`;
}

function fullDate(item) {
  const date = endDateObj(item);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function shortDateRange(item) {
  const start = startDateObj(item);
  const end = endDateObj(item);
  const startMonth = start.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  const startDay = start.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'UTC' });
  const endDay = end.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'UTC' });
  if (startMonth === endMonth) return `${startMonth} ${startDay}-${endDay}`;
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
}

function fullDateRange(item) {
  if (!item.startDate) return `Final day listed: ${fullDate(item)}`;
  const start = startDateObj(item);
  const end = endDateObj(item);
  const startMonth = start.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
  const startDay = start.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'UTC' });
  const endDay = end.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'UTC' });
  const year = end.toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' });
  if (startMonth === endMonth) return `${startMonth} ${startDay}-${endDay}, ${year}`;
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
}

function dateRangeFromIso(startIso, endIso) {
  if (!startIso) return 'TBC';
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : start;
  if (Number.isNaN(start.getTime())) return 'TBC';
  const endDate = Number.isNaN(end.getTime()) ? start : end;
  const startMonth = start.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
  const endMonth = endDate.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
  const startDay = start.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'UTC' });
  const endDay = endDate.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'UTC' });
  const year = endDate.toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' });
  if (startMonth === endMonth && startDay === endDay) return `${startMonth} ${startDay}, ${year}`;
  if (startMonth === endMonth) return `${startMonth} ${startDay}-${endDay}, ${year}`;
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
}

function normalizeEventName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\b(the|pres|presented|powered|driven|sponsored|by|with|for)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function eventNameScore(item, candidate) {
  const left = new Set(normalizeEventName(item.name).split(' ').filter(Boolean));
  const right = new Set(normalizeEventName(candidate.name || candidate.shortName).split(' ').filter(Boolean));
  if (!left.size || !right.size) return 0;
  let overlap = 0;
  for (const token of left) if (right.has(token)) overlap += 1;
  if (overlap >= 2 && (overlap === left.size || overlap === right.size)) return 1;
  return overlap / Math.max(left.size, right.size);
}

function espnEventFor(item, year) {
  const eventsForYear = espnHistory?.schedules?.[item.tour]?.[String(year)] || espnHistory?.schedules?.[item.tour]?.[year] || [];
  if (!eventsForYear.length) return null;
  const directNames = [item.name, ...(item.historyAliases || [])].map(normalizeEventName);
  const exact = eventsForYear.find((event) => {
    const names = [normalizeEventName(event.name), normalizeEventName(event.shortName)];
    return directNames.some((name) => names.includes(name));
  });
  if (exact) return exact;
  const scored = eventsForYear
    .map((event) => {
      const score = [item.name, ...(item.historyAliases || [])]
        .map((name) => eventNameScore({ ...item, name }, event))
        .reduce((best, value) => Math.max(best, value), 0);
      return { event, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored[0]?.score >= 0.6 ? scored[0].event : null;
}

function endExclusive(item) {
  const date = endDateObj(item);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function editionStatus(item) {
  const end = endDateObj(item);
  const start = startDateObj(item);
  if (today > end) return 'past';
  if (today >= start) return 'ongoing';
  return 'upcoming';
}

function areaMarkup(item) {
  if (item.area === item.host.name) return countryChip(item.host);
  return html(item.area);
}

function cityAreaLabel(item) {
  if (item.city && item.area && item.city !== item.area) return `${item.city}, ${item.area}`;
  return item.city || item.area;
}

function locationSentence(item) {
  const place = [];
  if (item.venue) place.push(html(item.venue));
  if (item.city) place.push(html(item.city));
  if (item.area && item.area !== item.city && item.area !== item.host.name) place.push(html(item.area));
  return `${place.join(', ')}${place.length ? ', ' : ''}${countryChip(item.host)}`;
}

function countryData(host) {
  return { name: host.name, url: host.url, flag: host.flag };
}

function leaderboardFor(item, year) {
  const id = espnLeaderboards?.bySlugYear?.[`${item.slug}:${year}`];
  return id ? espnLeaderboards?.byEventId?.[id] || null : null;
}

function leaderboardPlayers(leaderboard) {
  return (leaderboard?.players || []).filter((player) => player?.name && Array.isArray(player.rounds));
}

function regulationRounds(player) {
  return (player?.rounds || [])
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value >= 45 && value <= 95);
}

function scoreLabel(value) {
  if (value === null || value === undefined || value === '') return '';
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  if (number === 0) return 'E';
  const label = Number.isInteger(number)
    ? String(number)
    : number.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  return number > 0 ? `+${label}` : label;
}

function inferLeaderboardPar(leaderboard) {
  const counts = new Map();
  for (const player of leaderboardPlayers(leaderboard)) {
    const rounds = regulationRounds(player);
    const toPar = scoreToParValue(player.final);
    if (rounds.length < 1 || toPar === null) continue;
    const rawPar = (rounds.reduce((sum, value) => sum + value, 0) - toPar) / rounds.length;
    const rounded = Math.round(rawPar * 4) / 4;
    if (!Number.isFinite(rawPar) || Math.abs(rawPar - rounded) > 0.01 || rounded < 60 || rounded > 76) continue;
    counts.set(rounded, (counts.get(rounded) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

function playerCountry(player) {
  return countryForName(player?.countryName) || countryForName(player?.countryAbbreviation);
}

function playerFinal(player, par, rounds = regulationRounds(player)) {
  if (par && rounds.length >= 2) {
    const computed = rounds.reduce((sum, value) => sum + value, 0) - (par * rounds.length);
    const raw = scoreToParValue(player.final);
    if (raw === null || raw !== computed) return scoreLabel(computed);
  }
  return player.final || '';
}

function leaderboardWinnerData(leaderboard) {
  const winner = leaderboardPlayers(leaderboard)[0];
  if (!winner) return null;
  const country = playerCountry(winner);
  return {
    name: winner.name,
    flag: country?.flag || '',
    url: country?.url || '',
    countryName: country?.name || winner.countryName || '',
    countryUrl: country?.url || '',
    countryFlag: country?.flag || ''
  };
}

function leaderboardWinnerName(leaderboard) {
  return leaderboardPlayers(leaderboard)[0]?.name || '';
}

function leaderboardScoreProgression(item, year, leaderboard) {
  const players = leaderboardPlayers(leaderboard);
  const par = inferLeaderboardPar(leaderboard);
  if (!players.length || !par) return null;
  const normalizedPlayers = players
    .slice(0, 10)
    .map((player, index) => {
      const country = playerCountry(player);
      const rounds = regulationRounds(player);
      return {
        name: player.name,
        countryName: country?.name || player.countryName || '',
        countryUrl: country?.url || '',
        countryFlag: country?.flag || '',
        scores: rounds,
        final: playerFinal(player, par, rounds),
        winner: index === 0
      };
    })
    .filter((player) => player.scores.length >= 1);
  if (!normalizedPlayers.length) return null;
  const roundCount = Math.max(...normalizedPlayers.map((player) => player.scores.length));
  return {
    rounds: Array.from({ length: roundCount }, (_, index) => `R${index + 1}`),
    par,
    players: normalizedPlayers,
    note: `ESPN final top 10 for ${item.name} ${year}. Playoff holes, when listed separately, are excluded from the round graph.`,
    ariaLabel: `${item.name} ${year} final top 10 round-by-round score progression`
  };
}

function leaderboardHasPlayoff(leaderboard) {
  const players = leaderboardPlayers(leaderboard);
  const regulationCount = Math.max(0, ...players.map((player) => regulationRounds(player).length));
  return players.slice(0, 2).some((player) => (player.rounds || []).length > regulationCount);
}

function leaderboardResultSummary(leaderboard) {
  const winner = leaderboardPlayers(leaderboard)[0];
  if (!winner) return '';
  const par = inferLeaderboardPar(leaderboard);
  const final = playerFinal(winner, par);
  const playoff = leaderboardHasPlayoff(leaderboard) ? ' in a playoff' : '';
  return `${winner.name} won${playoff}${final ? ` at ${final}` : ''}`;
}

function leaderboardResultDetail(item, year, leaderboard) {
  const winner = leaderboardPlayers(leaderboard)[0];
  if (!winner) return '';
  const country = playerCountry(winner);
  const winnerLabel = country
    ? `${countryChip(country)} <span>${html(winner.name)}</span>`
    : html(winner.name);
  const par = inferLeaderboardPar(leaderboard);
  const final = playerFinal(winner, par);
  const playoff = leaderboardHasPlayoff(leaderboard) ? ' in a playoff' : '';
  return `${winnerLabel} won ${html(item.name)} ${year}${playoff}${final ? ` at ${html(final)}` : ''}. Final top 10 and round scores are from ESPN.`;
}

function winnerData(item) {
  if (!item.winner) return null;
  return {
    name: item.winner.name,
    flag: item.winner.country.flag,
    url: item.winner.country.url,
    countryName: item.winner.country.name,
    countryUrl: item.winner.country.url,
    countryFlag: item.winner.country.flag
  };
}

function winnerLine(item) {
  if (!item.winner) return 'TBC';
  return `${countryChip(item.winner.country)} <span>${html(item.winner.name)}</span>`;
}

function scoreToParValue(score) {
  const text = String(score || '').trim().toUpperCase();
  if (!text) return null;
  if (text === 'E' || text === 'EVEN') return 0;
  const match = text.match(/[+-]?\d+/);
  return match ? Number(match[0]) : null;
}

function winnerRoundScores(winner) {
  if (!winner?.rounds) return [];
  return winner.rounds
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value));
}

function winnerPar(winner, scores) {
  const roundScores = scores || winnerRoundScores(winner);
  const toPar = scoreToParValue(winner?.score);
  if (!roundScores.length || toPar === null) return null;
  const strokeTotal = roundScores.reduce((sum, value) => sum + value, 0);
  const par = (strokeTotal - toPar) / roundScores.length;
  return Number.isFinite(par) && par > 0 ? Math.round(par) : null;
}

function winnerScoreProgression(item) {
  const scores = winnerRoundScores(item.winner);
  const par = winnerPar(item.winner, scores);
  if (!item.winner || scores.length < 2 || !par) return null;
  return {
    rounds: scores.map((_, index) => `R${index + 1}`),
    par,
    players: [{
      name: item.winner.name,
      countryName: item.winner.country.name,
      countryUrl: item.winner.country.url,
      countryFlag: item.winner.country.flag,
      scores,
      final: item.winner.score
    }],
    note: `Winner round scores for ${item.name}.`,
    ariaLabel: `${item.name} winner round-by-round score progression`
  };
}

function itemSources(item, editions = []) {
  const sources = (item.sources || [{ label: item.sourceLabel, url: item.sourceUrl }]).slice();
  const sourceUrls = new Set(sources.map((source) => source.url).filter(Boolean));
  const leaderboardSource = editions.find((edition) => edition.leaderboardSourceUrl)?.leaderboardSourceUrl;
  if (leaderboardSource && !sourceUrls.has(leaderboardSource)) {
    sources.push({ label: 'ESPN golf leaderboard', url: leaderboardSource });
  } else if (editions.some((edition) => edition.hasEspnLeaderboard) && !sources.some((source) => /espn/i.test(source.label || ''))) {
    sources.push({ label: 'ESPN golf leaderboards', url: 'https://www.espn.com/golf/leaderboard' });
  }
  return sources;
}

function resultSummary(item) {
  if (item.winner) {
    const score = item.winner.score ? ` on ${item.winner.score}` : '';
    return `${item.winner.name} won${score}`;
  }
  const status = editionStatus(item);
  if (status === 'ongoing') return 'Tournament in progress';
  if (status === 'upcoming') return 'Not played yet';
  return 'Result TBC';
}

function resultDetail(item) {
  if (item.resultNote) return item.resultNote;
  if (item.winner) {
    const score = item.winner.score ? ` at ${item.winner.score}` : '';
    const total = item.winner.total ? ` (${item.winner.total})` : '';
    const runnerUp = item.runnerUp ? ` Runner-up: ${item.runnerUp}.` : '';
    const team = item.teamWinner ? ` Team winner: ${item.teamWinner}.` : '';
    return `${item.winner.name} won ${item.name}${score}${total}.${runnerUp}${team}`;
  }
  const status = editionStatus(item);
  if (status === 'ongoing') return item.leaderNote || 'The tournament is in progress; final result is added after the final round.';
  if (status === 'upcoming') return 'The tournament has not been played yet; winner and team result are decided after the final round.';
  return 'Final result and top 10 leaderboard TBC for this event page.';
}

function placeholderScoreProgression(item, year, status) {
  const isPast = status === 'past';
  return {
    rounds: ['R1', 'R2', 'R3', 'R4'],
    players: [],
    limit: 10,
    emptyText: isPast ? 'Top 10 leaderboard is TBC for this edition.' : 'Leaderboard graph appears here after Round 1.',
    note: isPast
      ? `Add a verified final top 10 for ${item.name} ${year} to render round-by-round lines.`
      : `The card becomes a top 10 round graph once verified scores are available.`,
    ariaLabel: `${item.name} ${year} top 10 round-by-round score progression`
  };
}

function currentScoreProgression(item, status) {
  return winnerScoreProgression(item) || placeholderScoreProgression(item, 2026, status);
}

function archiveEdition(item, year, espnEvent = null) {
  if (item.firstEditionYear && year < item.firstEditionYear) {
    return null;
  }
  if (espnHistory && !espnEvent) return null;
  if (espnEvent?.completed === false) return null;
  const dates = espnEvent ? dateRangeFromIso(espnEvent.date, espnEvent.endDate) : 'TBC';
  const leaderboard = leaderboardFor(item, year);
  const scoreProgression = leaderboardScoreProgression(item, year, leaderboard);
  const winner = leaderboardWinnerData(leaderboard);
  const result = leaderboardResultDetail(item, year, leaderboard);
  const resultLabel = leaderboardResultSummary(leaderboard);
  const cityName = cityAreaLabel(item) || item.area || item.host.name;
  const hasLeaderboard = Boolean(scoreProgression && scoreProgression.players.length);
  return {
    year,
    headingPlace: 'archive',
    status: 'past',
    statusLabel: leaderboard?.completed ? 'Complete' : (espnEvent?.status || 'Archive'),
    startDate: espnEvent?.date ? espnEvent.date.slice(0, 10) : '',
    endExclusive: espnEvent?.endDate ? endExclusive({ endDate: espnEvent.endDate.slice(0, 10) }) : '',
    nextDate: '',
    dates,
    countries: [countryData(item.host)],
    cities: [{ name: cityName }],
    venue: item.venue || 'Not listed in imported feed',
    format: item.tour === 'liv' ? 'Individual and team golf event' : '72-hole professional stroke play',
    countdownText: `${item.name} ${year} has already been played.`,
    liveLabel: '',
    calendarDescription: `${item.name} ${year}.`,
    questions: [],
    highlights: hasLeaderboard
      ? [{
          label: 'Archive result',
          title: resultLabel || 'Final leaderboard',
          detail: result || `Final top 10 is listed for ${item.name} ${year}.`
        }]
      : [{
          label: 'Archive result',
          title: 'Edition listed',
          detail: `ESPN lists ${item.name} ${year}; round-by-round individual leaderboard rows were not exposed in the imported feed for this event format.`
        }],
    lifecycleLabel: 'Result',
    result: result || `ESPN lists ${item.name} ${year}; round-by-round individual leaderboard rows were not exposed in the imported feed for this event format.`,
    resultLabel: resultLabel || 'Edition listed',
    winner,
    scoreProgression: scoreProgression,
    hasEspnLeaderboard: Boolean(leaderboard),
    leaderboardSourceUrl: leaderboard?.sourceUrl || ''
  };
}

function jsonForScript(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

function eventYearData(item) {
  const tour = tours[item.tour];
  const status = editionStatus(item);
  const dates = fullDateRange(item);
  const cityName = cityAreaLabel(item);
  const venue = item.venue || 'TBC';
  const locationHtml = locationSentence(item);
  const currentLeaderboard = leaderboardFor(item, 2026);
  const currentLeaderboardHasPlayers = leaderboardPlayers(currentLeaderboard).length > 0;
  const currentLeaderboardListed = Boolean(currentLeaderboard);
  const currentResult = currentLeaderboardHasPlayers
    ? leaderboardResultDetail(item, 2026, currentLeaderboard)
    : currentLeaderboardListed
      ? `ESPN lists ${item.name} 2026; round-by-round individual leaderboard rows were not exposed in the imported feed for this event format.`
      : resultDetail(item);
  const currentResultLabel = currentLeaderboardHasPlayers
    ? leaderboardResultSummary(currentLeaderboard)
    : currentLeaderboardListed
      ? 'Edition listed'
      : resultSummary(item);
  const currentWinner = (currentLeaderboardHasPlayers ? leaderboardWinnerData(currentLeaderboard) : null) || winnerData(item);
  const currentWinnerName = (currentLeaderboardHasPlayers ? leaderboardWinnerName(currentLeaderboard) : '') || item.winner?.name || currentResultLabel;
  const currentProgression = currentLeaderboardHasPlayers
    ? leaderboardScoreProgression(item, 2026, currentLeaderboard)
    : currentLeaderboardListed && status === 'past'
      ? null
      : currentScoreProgression(item, status);
  const sourceStatus = currentLeaderboardHasPlayers
    ? 'Final result, top 10 and round scores have been imported from ESPN.'
    : currentLeaderboardListed
    ? 'ESPN lists this edition, but the imported feed does not expose individual round rows for this event format.'
    : item.winner || item.venue || item.startDate
    ? 'Schedule, venue and status fields have been checked against the linked source.'
    : 'Schedule shell only; venue and result need verification.';
  const archiveEditions = [2021, 2022, 2023, 2024, 2025]
    .map((year) => archiveEdition(item, year, espnEventFor(item, year)))
    .filter(Boolean);
  const onlyCurrentEdition = archiveEditions.length === 0;
  const currentEdition = {
    year: 2026,
    headingPlace: cityName ? `in ${cityName}` : '',
    status,
    statusLabel: statusLabel(item),
    startDate: item.startDate || item.endDate,
    endExclusive: endExclusive(item),
    nextDate: '',
    dates,
    countries: [countryData(item.host)],
    cities: [{ name: cityName || 'TBC' }],
    venue,
    format: item.tour === 'liv' ? 'Individual and team golf event' : '72-hole professional stroke play',
    countdownText: status === 'past' ? 'This edition is complete.' : `${item.name} is on the ${tour.name} schedule.`,
    liveLabel: status === 'ongoing' ? 'Tournament week' : '',
    calendarDescription: `${item.name} 2026.`,
    questions: [
      { q: 'When is the event?', a: dates, detail: item.startDate ? 'Official 2026 tournament window for this page.' : 'Only the final schedule date is entered; the full tournament window still needs verification.' },
      { q: 'Where is it held?', a: locationHtml, detail: item.venue ? `${item.name} is listed at ${item.venue}.` : 'Venue still needs verification against the official event page.' },
      { q: 'What is the tour?', a: tour.name, detail: tour.description },
      { q: 'What is the result?', a: currentResultLabel, detail: currentResult },
      { q: 'Source status', a: item.sourceLabel, detail: sourceStatus }
    ],
    highlights: currentWinner
      ? [
          { label: 'Result', title: currentWinnerName, detail: currentResult },
          ...(!currentLeaderboardHasPlayers && item.teamWinner ? [{ label: 'Team result', title: item.teamWinner, detail: `${item.teamWinner} won the team competition.` }] : [])
        ]
      : [{ label: status === 'ongoing' ? 'Live status' : 'Result status', title: currentResultLabel, detail: currentResult }],
    lifecycleLabel: 'Result',
    result: currentResult,
    resultLabel: currentResultLabel,
    winner: currentWinner,
    scoreProgression: currentProgression,
    historyNotice: onlyCurrentEdition
      ? {
          label: 'Edition history',
          title: 'Only one edition so far',
          detail: `${item.name} has only the ${item.endDate.slice(0, 4)} edition in this page because no earlier editions are listed for this event name.`
        }
      : null,
    hasEspnLeaderboard: currentLeaderboardHasPlayers,
    leaderboardSourceUrl: currentLeaderboard?.sourceUrl || ''
  };
  const editions = archiveEditions.concat([currentEdition]);
  return {
    eventName: item.name,
    slug: item.slug,
    defaultYear: 2026,
    lastUpdated,
    sources: itemSources(item, editions),
    hideYearSwitcher: false,
    showStageQuestions: true,
    templateMode: 'one-slider',
    editions
  };
}

function metaLocation(item) {
  return item.area === item.host.name ? item.host.name : `${item.area}, ${item.host.name}`;
}

function navHtml() {
  return `<nav class="event-nav" aria-label="Site navigation">
      <a class="nav-icon" href="/content/events/index.html" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></a>
      <a class="nav-icon" href="/content/locations/index.html" aria-label="Locations"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></a>
      <a class="nav-icon" href="/content/categories/index.html" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg></a>
      <span class="nav-spacer"></span>
      <details class="nav-language"><summary aria-label="Language">EN</summary><div class="nav-language__list"><a href="#" aria-current="page">English</a></div></details>
    </nav>`;
}

function snapshotRow(index, body, title, meta, value, fillClass) {
  return `<div class="rank-row rank-row--snapshot"><strong>${index}</strong><span class="rank-row__team">${body}<span class="rank-row__team-copy"><span class="rank-row__team-name">${title}</span><small>${meta}</small></span></span><div class="rank-row__track"><i class="rank-row__fill ${fillClass}"></i></div><strong class="rank-row__metric">${value}</strong></div>`;
}

function eventSnapshotCard(item) {
  const tour = tours[item.tour];
  const status = editionStatus(item);
  const statusShort = status === 'ongoing' ? 'Live' : status === 'upcoming' ? 'Next' : 'Done';
  const venueLabel = item.venue || 'Venue TBC';
  const resultLabel = item.winner ? html(item.winner.name) : html(resultSummary(item));
  const resultBody = item.winner ? countryChip(item.winner.country) : '';
  const resultValue = item.winner?.score ? html(item.winner.score) : statusShort;
  return `<div class="card card--rank card--team-rank card--event-snapshot"><span>2026 event facts</span><div class="rank-list">` +
    snapshotRow(1, countryChip(item.host), html(cityAreaLabel(item) || item.area || item.host.name), 'Host', 'HOST', 'w100') +
    snapshotRow(2, '', html(venueLabel), 'Venue', item.venue ? 'VENUE' : 'TBC', 'w80') +
    snapshotRow(3, '', html(tour.name), item.major ? 'Major week' : 'Tour', item.major ? 'MAJOR' : tour.slug.toUpperCase(), 'w60') +
    snapshotRow(4, resultBody, resultLabel, item.winner ? 'Winner' : 'Result', resultValue, 'w50') +
    `</div></div>`;
}

function eventPage(item) {
  const tour = tours[item.tour];
  const country = countryChip(item.host);
  const title = `${item.name} | OneSliders`;
  const description = `${item.name} on the 2026 ${tour.name} schedule.`;
  const status = statusLabel(item);
  const dates = fullDateRange(item);
  const venue = item.venue ? html(item.venue) : 'TBC';
  const cityArea = html(cityAreaLabel(item));
  const headingPlace = cityArea ? `in ${cityArea}` : '';
  const formatLabel = item.tour === 'liv' ? 'Individual and team golf event' : '72-hole professional stroke play';
  const snapshotCard = eventSnapshotCard(item);
  const jsonData = eventYearData(item);
  return `<!doctype html><html lang="en"><head>
  <!-- golf-tour-generated-framed -->
  <link rel="stylesheet" href="/assets/css/oneslider-core.css">
  <script src="/assets/js/oneslider-core.js"></script><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="index,follow">
  <meta property="og:type" content="website">
  <meta property="og:description" content="${html(description)}">
  <meta property="og:url" content="https://one-sliders.com/content/categories/sport/golf/events/${item.slug}.html"><link rel="icon" href="/assets/icons/favicon.ico" sizes="any"><link rel="icon" href="/assets/icons/one-sliders-icon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png"><link rel="manifest" href="/assets/icons/site.webmanifest"><link rel="stylesheet" href="/assets/css/events.css?v=event-frame-20260530-golf-pga-layout-3"><script defer src="/assets/js/events.js?v=event-frame-20260530-golf-pga-layout-3"></script><link rel="preload" as="image" href="${eventHeroAbs(item)}"><link rel="canonical" href="https://one-sliders.com/content/categories/sport/golf/events/${item.slug}.html"><meta name="description" content="${html(description)}">
  <meta name="content-language" content="en">
  <meta name="keywords" content="${html(item.name.toLowerCase())}, golf, ${html(tour.name.toLowerCase())}, one sliders"><meta property="og:title" content="${html(title)}"><meta property="og:image" content="https://one-sliders.com/content/categories/sport/golf/events/img/${item.slug}-hero.png"><meta name="twitter:card" content="summary_large_image"><title>${html(title)}</title><script type="application/json" id="event-year-data">${jsonForScript(jsonData)}</script></head><body class="event-page event-page--framed" data-generated-golf-tour="true">${navHtml()}<main class="event-frame" id="general" aria-labelledby="event-title"><section class="event-frame__visual" aria-label="${html(item.name)} overview"><div class="event-frame__media"><img src="${eventHeroAbs(item)}" alt="" width="1200" height="630" fetchpriority="high"></div><div class="event-frame__copy"><div><h1 class="event-title" id="event-title">${html(item.name)}</h1></div><div class="facts-strip"><div class="fact"><span>Dates</span><strong>${html(dates)}</strong></div><div class="fact"><span>Status</span><strong>${html(status)}</strong></div></div>${snapshotCard}<a class="topic-card topic-card--inline" href="/content/categories/sport/golf.html" aria-label="Open the Golf topic page"><img src="/content/categories/sport/img/golf-mini.png" alt="" width="400" height="300" loading="eager"><span>More golf</span><strong>Golf topic</strong><p>More majors, courses and calendar moments.</p></a></div></section><section class="event-frame__panel" id="year" aria-label="Edition details"><div class="event-frame__panel-header"><h2 class="event-section-title" data-year-heading>${html(item.name)} 2026 ${headingPlace}</h2></div><div class="year-switcher" data-year-switcher aria-label="Choose edition"></div><div class="year-edition" data-year-edition><div class="facts-strip"><div class="fact"><span>Country</span><strong>${country}</strong></div><div class="fact"><span>City</span><strong>${cityArea || 'TBC'}</strong></div><div class="fact"><span>Venue</span><strong>${venue}</strong></div><div class="fact"><span>Dates</span><strong>${html(dates)}</strong></div><div class="fact"><span>Status</span><strong>${html(status)}</strong></div><div class="fact"><span>Format</span><strong>${html(formatLabel)}</strong></div></div></div></section></main><footer class="event-footer">&copy; 2026 <a href="https://3dfractal.no/">3D Fractal</a>.</footer></body></html>
`;
}

function leagueList(tourSlug) {
  return events
    .filter((item) => item.tour === tourSlug)
    .map((item) => {
      const area = item.area === item.host.name ? '' : `<span class="league-event-area">${html(item.area)}</span>`;
      const badge = item.major ? '<span class="league-event-badge">Major</span>' : '';
      return `<li><a class="league-event-thumb-link" href="${eventHref(item)}" aria-label="${html(item.name)}"><img class="league-event-thumb" src="golf/events/img/${item.slug}-mini.png" alt="" loading="lazy"></a><span class="league-event-copy"><span class="league-event-topline"><time>${html(displayDate(item))}</time>${badge}</span><strong><a href="${eventHref(item)}">${html(item.name)}</a></strong><span class="league-event-meta">${area}${countryChip(item.host)}</span></span></li>`;
    })
    .join('\n                    ');
}

function nextEventCards() {
  return events
    .filter((item) => endDateObj(item) >= today)
    .sort((a, b) => endDateObj(a) - endDateObj(b))
    .slice(0, 12)
    .map((item) => `<a class="event-card" data-end="${item.endDate}" href="${eventHref(item)}"><img class="event-thumb" src="golf/events/img/${item.slug}-mini.png" alt="" aria-hidden="true"><time>${html(displayDate(item))}</time><strong>${html(item.name)}</strong><p>${html(tours[item.tour].name)} · ${html(metaLocation(item))}</p></a>`)
    .join('\n                ');
}

function ensureGolfPageStyles(source) {
  const calendarStyles = `      .league-events--calendar { display: grid; grid-template-columns: repeat(auto-fit,minmax(150px,1fr)); gap: 10px; max-height: 560px; overflow: auto; padding-right: 4px; align-items: start; }\n      .league-events--calendar li { display: grid; grid-template-rows: 94px 1fr; gap: 0; min-height: 196px; padding: 0; overflow: hidden; border: 1px solid var(--line); border-radius: 8px; background: #fff; box-shadow: 0 10px 24px rgba(18,32,46,.07); }\n      .league-event-thumb-link { display: block; width: 100%; height: 94px; overflow: hidden; background: #edf1ee; border: 0; border-radius: 0; }\n      .league-event-thumb { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .18s ease; }\n      .league-event-thumb-link:hover .league-event-thumb { transform: scale(1.04); }\n      .league-event-copy { display: grid; gap: 7px; min-width: 0; padding: 10px; align-content: start; }\n      .league-event-topline { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; }\n      .league-event-topline time { color: var(--theme); font-size: 11px; font-weight: 900; text-transform: uppercase; }\n      .league-event-badge { padding: 3px 6px; border-radius: 999px; background: rgba(188,146,58,.16); color: #7a5410; font-size: 10px; font-weight: 900; text-transform: uppercase; }\n      .league-event-copy strong { display: block; }\n      .league-event-copy strong a { display: -webkit-box; min-height: 34px; overflow: hidden; color: var(--ink); font-size: 15px; line-height: 1.12; text-decoration: none; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }\n      .league-event-copy strong a:hover { color: var(--theme); }\n      .league-event-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; color: var(--muted); font-size: 12px; font-weight: 700; line-height: 1.25; }\n      .league-event-area { padding: 4px 7px; border-radius: 999px; background: rgba(36,95,70,.08); color: var(--theme); font-size: 11px; font-weight: 900; }\n      .league-event-meta .country { min-height: 22px; padding: 0 7px; font-size: 12px; }\n      .league-event-meta .country img { width: 19px; height: 13px; }\n`;
  const existingCalendarStyles = /      \.league-events--calendar \{[\s\S]*?      \.league-event-meta \.country img \{ width: 19px; height: 13px; \}\r?\n/;
  if (existingCalendarStyles.test(source)) return source.replace(existingCalendarStyles, calendarStyles);
  const needle = '      .league-events li { padding: 7px 8px; border-radius: 8px; background: rgba(36,95,70,.08); color: var(--muted); font-size: 13px; line-height: 1.22; }\n      .league-events strong { display: block; color: var(--ink); font-size: 13px; }\n';
  const insert = `${needle}${calendarStyles}`;
  return source.replace(needle, insert);
}

function updateGolfPage() {
  const file = path.join(root, 'content/categories/sport/golf.html');
  let source = fs.readFileSync(file, 'utf8');
  source = ensureGolfPageStyles(source);

  const linkReplacements = new Map([
    ['../../../en/content/categories/sport/golf/events/masters-tournament.html', 'golf/events/masters-tournament.html'],
    ['../../../en/content/categories/sport/golf/events/pga-championship.html', 'golf/events/pga-championship.html'],
    ['../../../en/content/categories/sport/golf/events/us-open-golf.html', 'golf/events/us-open-golf.html'],
    ['../../../en/content/categories/sport/golf/events/the-open-championship.html', 'golf/events/the-open-championship.html']
  ]);
  for (const [from, to] of linkReplacements) source = source.replaceAll(from, to);
  source = source
    .replace('<li><span>Chevron Championship</span></li>', '<li><a href="golf/events/chevron-championship.html">Chevron Championship</a></li>')
    .replace('<li><span>U.S. Women\'s Open</span></li>', '<li><a href="golf/events/us-womens-open-golf.html">U.S. Women\'s Open</a></li>')
    .replace('<li><span>KPMG Women\'s PGA Championship</span></li>', '<li><a href="golf/events/kpmg-womens-pga-championship.html">KPMG Women\'s PGA Championship</a></li>')
    .replace('<li><span>Amundi Evian Championship</span></li>', '<li><a href="golf/events/amundi-evian-championship.html">Amundi Evian Championship</a></li>')
    .replace('<li><span>AIG Women\'s Open</span></li>', '<li><a href="golf/events/aig-womens-open.html">AIG Women\'s Open</a></li>');

  for (const key of Object.keys(tours)) {
    const start = source.indexOf(`id="league-${key}"`);
    if (start === -1) continue;
    const articleEnd = source.indexOf('</article>', start);
    const before = source.slice(0, start);
    let section = source.slice(start, articleEnd);
    const after = source.slice(articleEnd);
    section = section.replace(/<h3>(?:Events|2026 schedule)<\/h3>\s*<ul class="league-events(?: league-events--calendar)?">[\s\S]*?<\/ul>/, `<h3>2026 schedule</h3>\n                  <ul class="league-events league-events--calendar">\n                    ${leagueList(key)}\n                  </ul>`);
    source = before + section + after;
  }

  source = source.replace(
    /<p class="ranking-source">Updated 30 May 2026[\s\S]*?<\/p>/,
    `<p class="ranking-source">Updated ${lastUpdated}. Schedule links cover PGA Tour (${tours.pga.countLabel}), LPGA Tour (${tours.lpga.countLabel}) and LIV Golf (${tours.liv.countLabel}).</p>`
  );

  source = source.replace(/\s*<section>\s*<div class="section-heading">\s*<h2>(?:Upcoming majors|Next golf events)<\/h2>[\s\S]*?<div class="event-grid carousel-track" data-carousel-track>[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/, '');

  fs.writeFileSync(file, source);
}

function countryCard(item) {
  const start = startDateObj(item);
  const startIso = start.toISOString().slice(0, 10);
  const area = item.area === item.host.name ? tours[item.tour].name : `${item.area} - ${tours[item.tour].name}`;
  return `<a class="visual-topic-card visual-topic-card--national" data-end="${item.endDate}" href="${eventAbsHref(item)}"><img src="${eventMiniAbs(item)}" alt="" loading="lazy"><strong>${html(item.name)}</strong><span>${html(startIso)} - ${html(item.endDate)} - ${html(area)}</span></a>`;
}

function insertCountryEvents(file, countryEvents) {
  let source = fs.readFileSync(file, 'utf8');
  const openTag = '<div class="country-paths country-paths--events" data-expiring-events>';
  const start = source.indexOf(openTag);
  if (start === -1) return false;
  const contentStart = start + openTag.length;
  const contentEnd = source.indexOf('</div>', contentStart);
  if (contentEnd === -1) return false;
  let inner = source.slice(contentStart, contentEnd);
  inner = inner.replace(/<!-- golf-tour-events:start -->[\s\S]*?<!-- golf-tour-events:end -->/g, '');
  inner = inner.replace(/<a class="visual-topic-card[^>]*href="[^"]*(?:\/en\/content\/categories\/sport\/golf\/events\/|\/content\/categories\/sport\/golf\/events\/)[\s\S]*?<\/a>/g, '');
  const block = `<!-- golf-tour-events:start -->${countryEvents.map(countryCard).join('')}<!-- golf-tour-events:end -->`;
  source = source.slice(0, contentStart) + block + inner + source.slice(contentEnd);
  fs.writeFileSync(file, source);
  return true;
}

function updateCountryPages() {
  const byCountry = new Map();
  for (const item of events) {
    if (!byCountry.has(item.host.slug)) byCountry.set(item.host.slug, []);
    byCountry.get(item.host.slug).push(item);
  }

  for (const [slug, items] of byCountry) {
    const host = items[0].host;
    const file = path.join(root, `content/locations/${host.continent}/${host.slug}/index.html`);
    if (!fs.existsSync(file)) continue;
    const sorted = items.sort((a, b) => endDateObj(a) - endDateObj(b));
    insertCountryEvents(file, sorted);
  }
}

function updateEventsIndexLinks() {
  const file = path.join(root, 'content/events/index.html');
  if (!fs.existsSync(file)) return;
  let source = fs.readFileSync(file, 'utf8');
  for (const item of events) {
    source = source
      .replaceAll(`../../en/content/categories/sport/golf/events/${item.slug}.html`, `../categories/sport/golf/events/${item.slug}.html`)
      .replaceAll(`/en/content/categories/sport/golf/events/${item.slug}.html`, `/content/categories/sport/golf/events/${item.slug}.html`)
      .replaceAll(`../../en/content/categories/sport/golf/events/img/${item.slug}-mini.png`, `../categories/sport/golf/events/img/${item.slug}-mini.png`)
      .replaceAll(`/en/content/categories/sport/golf/events/img/${item.slug}-mini.png`, `/content/categories/sport/golf/events/img/${item.slug}-mini.png`);
  }
  source = source
    .replaceAll(`../categories/sport/golf/events/oslo-ladies-open.html`, `../../en/content/categories/sport/golf/events/oslo-ladies-open.html`)
    .replaceAll(`../categories/sport/golf/events/img/oslo-ladies-open-mini.png`, `../../en/content/categories/sport/golf/events/img/oslo-ladies-open-mini.png`)
    .replaceAll(`../categories/sport/golf/events/ryder-cup.html`, `../../en/content/categories/sport/golf/events/ryder-cup.html`)
    .replaceAll(`../categories/sport/golf/events/img/ryder-cup-mini.png`, `../../en/content/categories/sport/golf/events/img/ryder-cup-mini.png`);
  fs.writeFileSync(file, source);
}

function listHtmlFiles(dir) {
  const found = [];
  if (!fs.existsSync(dir)) return found;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...listHtmlFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.html')) found.push(full);
  }
  return found;
}

function updateLegacyLocationGolfLinks() {
  const slugs = new Set(events.map((item) => item.slug));
  const files = listHtmlFiles(path.join(root, 'content/locations'));
  for (const file of files) {
    let source = fs.readFileSync(file, 'utf8');
    let changed = false;
    for (const slug of slugs) {
      const next = source
        .replaceAll(`../../../../en/content/categories/sport/golf/events/${slug}.html`, `../../../categories/sport/golf/events/${slug}.html`)
        .replaceAll(`/en/content/categories/sport/golf/events/${slug}.html`, `/content/categories/sport/golf/events/${slug}.html`)
        .replaceAll(`../../../../en/content/categories/sport/golf/events/img/${slug}-mini.png`, `../../../categories/sport/golf/events/img/${slug}-mini.png`)
        .replaceAll(`/en/content/categories/sport/golf/events/img/${slug}-mini.png`, `/content/categories/sport/golf/events/img/${slug}-mini.png`);
      if (next !== source) {
        source = next;
        changed = true;
      }
    }
    if (changed) fs.writeFileSync(file, source);
  }
}

function updateSitemap() {
  const file = path.join(root, 'sitemap.xml');
  if (!fs.existsSync(file)) return;
  let source = fs.readFileSync(file, 'utf8');
  source = source.replace(/  <!-- golf-tour-events:start -->[\s\S]*?  <!-- golf-tour-events:end -->\r?\n?/g, '');
  const block = [
    '  <!-- golf-tour-events:start -->',
    ...events.map((item) => `  <url>\n    <loc>https://one-sliders.com/content/categories/sport/golf/events/${item.slug}.html</loc>\n    <lastmod>2026-05-30</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>`),
    '  <!-- golf-tour-events:end -->'
  ].join('\n');
  source = source.replace('</urlset>', `${block}\n</urlset>`);
  fs.writeFileSync(file, source);
}

function writeEventPages() {
  fs.mkdirSync(eventImgDir, { recursive: true });
  for (const item of events) {
    const target = path.join(eventDir, `${item.slug}.html`);
    if (isDetailedEventPage(target)) continue;
    fs.writeFileSync(target, eventPage(item));
  }
}

function isDetailedEventPage(file) {
  if (!fs.existsSync(file)) return false;
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes('data-generated-golf-tour="true"') || source.includes('golf-tour-generated-framed')) return false;
  return source.includes('id="event-year-data"') || source.includes('event-page--framed') || source.includes('class="event-frame"');
}

writeEventPages();
updateGolfPage();
updateCountryPages();
updateEventsIndexLinks();
updateLegacyLocationGolfLinks();
updateSitemap();

console.log(`Generated ${events.length} golf tour event pages and linked them from golf/country pages.`);
