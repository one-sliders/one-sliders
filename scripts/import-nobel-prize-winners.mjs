import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const outDir = path.resolve('data/technology/awards/events');
const startYear = 1970;
const endYear = 2025;
const categories = [
  'Chemistry',
  'Economic Sciences',
  'Literature',
  'Peace',
  'Physics',
  'Physiology or Medicine'
];

function decadeOf(year) {
  return `${Math.floor(Number(year) / 10) * 10}s`;
}

function text(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.en || value.se || value.no || '';
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not fetch ${url}: ${response.status}`);
  }
  return response.json();
}

const url = `https://api.nobelprize.org/2.1/nobelPrizes?offset=0&limit=1000&nobelPrizeYear=${startYear}&yearTo=${endYear}`;
const json = await fetchJson(url);
const prizes = Array.isArray(json.nobelPrizes) ? json.nobelPrizes : [];
const byDecade = new Map();

for (const prize of prizes) {
  const year = Number(prize.awardYear);
  if (!year || year < startYear || year > endYear) continue;
  const decade = decadeOf(year);
  if (!byDecade.has(decade)) byDecade.set(decade, new Map());
  const years = byDecade.get(decade);
  if (!years.has(year)) {
    years.set(year, {
      year,
      ceremony: null,
      awards: []
    });
  }
  const yearItem = years.get(year);
  const category = text(prize.category);
  const laureates = Array.isArray(prize.laureates) ? prize.laureates : [];
  yearItem.awards.push({
    category,
    winner: laureates.length
      ? laureates.map((laureate) => text(laureate.knownName) || text(laureate.fullName) || text(laureate.orgName) || 'TBC').join(' / ')
      : 'No prize awarded',
    film: prize.topMotivation ? text(prize.topMotivation) : laureates.map((laureate) => text(laureate.motivation)).filter(Boolean).join(' | '),
    winnerType: laureates.some((laureate) => laureate.orgName) ? 'organization' : 'person',
    dateAwarded: prize.dateAwarded || '',
    prizeAmount: prize.prizeAmount || null,
    laureates: laureates.map((laureate) => ({
      id: laureate.id || '',
      name: text(laureate.knownName) || text(laureate.fullName) || text(laureate.orgName) || 'TBC',
      portion: laureate.portion || '',
      motivation: text(laureate.motivation),
      type: laureate.orgName ? 'organization' : 'person'
    }))
  });
}

await mkdir(outDir, { recursive: true });

for (const [decade, yearsMap] of [...byDecade.entries()].sort()) {
  const years = [...yearsMap.values()]
    .sort((a, b) => a.year - b.year)
    .map((yearItem) => {
      const awardsByCategory = new Map(yearItem.awards.map((award) => [award.category, award]));
      yearItem.awards = categories
        .map((category) => awardsByCategory.get(category))
        .filter(Boolean);
      return yearItem;
    });
  await writeFile(
    path.join(outDir, `nobel-prize-${decade}.json`),
    `${JSON.stringify({ event: 'Nobel Prize', decade, years }, null, 2)}\n`,
    'utf8'
  );
}

const records = [
  {
    title: 'Six prizes, one week',
    value: 'Oct announcements',
    note: 'Physics, Chemistry, Medicine, Literature, Peace and Economic Sciences are announced over Nobel Week in autumn.'
  },
  {
    title: 'Two ceremony cities',
    value: 'Stockholm / Oslo',
    note: 'Most prizes are awarded in Stockholm. The Peace Prize is awarded in Oslo.'
  },
  {
    title: 'Economic Sciences',
    value: 'Since 1969',
    note: 'The economics prize is awarded in memory of Alfred Nobel and is included here with the Nobel Prize archive.'
  }
];
await writeFile(path.join(outDir, 'nobel-prize-records.json'), `${JSON.stringify({ event: 'Nobel Prize', records }, null, 2)}\n`, 'utf8');

console.log(`Wrote Nobel Prize data for ${startYear}-${endYear} from ${url}`);
