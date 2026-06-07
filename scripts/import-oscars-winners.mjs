import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const csvUrl = 'https://huggingface.co/datasets/ceyyyh/oscar_award_winners/resolve/main/oscars_1929_2025.csv';
const outDir = path.resolve('data/culture/awards/events');
const wantedStart = 1970;
const wantedEnd = 2026;

const official2026Awards = [
  { category: 'Best Picture', winner: 'One Battle after Another', film: 'One Battle after Another', winnerType: 'film' },
  { category: 'Best Director', winner: 'Paul Thomas Anderson', film: 'One Battle after Another', winnerType: 'person' },
  { category: 'Best Actor', winner: 'Michael B. Jordan', film: 'Sinners', winnerType: 'person' },
  { category: 'Best Actress', winner: 'Jessie Buckley', film: 'Hamnet', winnerType: 'person' },
  { category: 'Best Supporting Actor', winner: 'Sean Penn', film: 'One Battle after Another', winnerType: 'person' },
  { category: 'Best Supporting Actress', winner: 'Amy Madigan', film: 'Weapons', winnerType: 'person' },
  { category: 'Best Animated Feature', winner: 'KPop Demon Hunters', film: 'KPop Demon Hunters', winnerType: 'film' },
  { category: 'Best Animated Short Film', winner: 'The Girl Who Cried Pearls', film: 'The Girl Who Cried Pearls', winnerType: 'film' },
  { category: 'Best Casting', winner: 'Cassandra Kulukundis', film: 'One Battle after Another', winnerType: 'person' },
  { category: 'Best Cinematography', winner: 'Autumn Durald Arkapaw', film: 'Sinners', winnerType: 'person' },
  { category: 'Best Costume Design', winner: 'Kate Hawley', film: 'Frankenstein', winnerType: 'person' },
  { category: 'Best Documentary Feature', winner: 'David Borenstein, Pavel Talankin, Helle Faber and Alzbeta Karaskova', film: 'Mr. Nobody against Putin', winnerType: 'film' },
  { category: 'Best Documentary Short', winner: 'Joshua Seftel and Conall Jones', film: 'All the Empty Rooms', winnerType: 'film' },
  { category: 'Best Film Editing', winner: 'Andy Jurgensen', film: 'One Battle after Another', winnerType: 'person' },
  { category: 'Best International Feature Film', winner: 'Norway', film: 'Sentimental Value', winnerType: 'film' },
  { category: 'Best Live Action Short Film', winner: 'The Singers / Two People Exchanging Saliva', film: 'The Singers / Two People Exchanging Saliva', winnerType: 'film' },
  { category: 'Best Makeup and Hairstyling', winner: 'Mike Hill, Jordan Samuel and Cliona Furey', film: 'Frankenstein', winnerType: 'person' },
  { category: 'Best Original Score', winner: 'Ludwig Goransson', film: 'Sinners', winnerType: 'person' },
  { category: 'Best Original Song', winner: 'Golden', film: 'KPop Demon Hunters', winnerType: 'film' },
  { category: 'Best Production Design', winner: 'Production Design: Tamara Deverell; Set Decoration: Shane Vieau', film: 'Frankenstein', winnerType: 'person' },
  { category: 'Best Sound', winner: 'Gareth John, Al Nelson, Gwendolyn Yates Whittle, Gary A. Rizzo and Juan Peralta', film: 'F1', winnerType: 'person' },
  { category: 'Best Visual Effects', winner: 'Joe Letteri, Richard Baneham, Eric Saindon and Daniel Barrett', film: 'Avatar: Fire and Ash', winnerType: 'person' },
  { category: 'Best Adapted Screenplay', winner: 'Written by Paul Thomas Anderson', film: 'One Battle after Another', winnerType: 'film' },
  { category: 'Best Original Screenplay', winner: 'Written by Ryan Coogler', film: 'Sinners', winnerType: 'film' }
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (quoted && ch === '"' && next === '"') {
      cell += '"';
      i += 1;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (!quoted && ch === ',') {
      row.push(cell);
      cell = '';
    } else if (!quoted && (ch === '\n' || ch === '\r')) {
      if (ch === '\r' && next === '\n') i += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    if (row.some((value) => value.trim())) rows.push(row);
  }
  const header = rows.shift().map((item) => item.trim());
  return rows.map((values) => Object.fromEntries(header.map((key, index) => [key, values[index] || ''])));
}

function normalizeCategory(category) {
  if (/^Music \(Original Song|^Music \(Song/i.test(category)) return 'Best Original Song';
  if (/^Music \(/i.test(category)) return 'Best Original Score';
  if (/^Writing \(Screenplay Based|^Writing \(Screenplay.based/i.test(category)) return 'Best Adapted Screenplay';
  if (/^Writing \(Story and Screenplay|^Writing \(Screenplay Written Directly/i.test(category)) return 'Best Original Screenplay';
  if (category === 'Animated Short Film') return 'Best Animated Short Film';
  if (category === 'Live Action Short Film' || category === 'Short Film (Dramatic Live Action)') return 'Best Live Action Short Film';
  if (category === 'Sound Effects Editing') return 'Best Sound Editing';
  const map = new Map([
    ['Actor', 'Best Actor'],
    ['Actor in a Leading Role', 'Best Actor'],
    ['Actor in a Supporting Role', 'Best Supporting Actor'],
    ['Actress', 'Best Actress'],
    ['Actress in a Leading Role', 'Best Actress'],
    ['Actress in a Supporting Role', 'Best Supporting Actress'],
    ['Animated Feature Film', 'Best Animated Feature'],
    ['Art Direction', 'Best Production Design'],
    ['Cinematography', 'Best Cinematography'],
    ['Costume Design', 'Best Costume Design'],
    ['Directing', 'Best Director'],
    ['Directing (Comedy Picture)', 'Best Director'],
    ['Directing (Dramatic Picture)', 'Best Director'],
    ['Documentary (Feature)', 'Best Documentary Feature'],
    ['Documentary Feature Film', 'Best Documentary Feature'],
    ['Documentary (Short Subject)', 'Best Documentary Short'],
    ['Documentary Short Film', 'Best Documentary Short'],
    ['Film Editing', 'Best Film Editing'],
    ['International Feature Film', 'Best International Feature Film'],
    ['Foreign Language Film', 'Best International Feature Film'],
    ['Makeup', 'Best Makeup and Hairstyling'],
    ['Makeup and Hairstyling', 'Best Makeup and Hairstyling'],
    ['Music (Original Score)', 'Best Original Score'],
    ['Music (Original Song)', 'Best Original Song'],
    ['Music (Song)', 'Best Original Song'],
    ['Best Picture', 'Best Picture'],
    ['Outstanding Picture', 'Best Picture'],
    ['Outstanding Production', 'Best Picture'],
    ['Picture', 'Best Picture'],
    ['Production Design', 'Best Production Design'],
    ['Short Film (Animated)', 'Best Animated Short Film'],
    ['Short Film (Live Action)', 'Best Live Action Short Film'],
    ['Short Subject (Animated)', 'Best Animated Short Film'],
    ['Short Subject (Cartoon)', 'Best Animated Short Film'],
    ['Short Subject (Live Action)', 'Best Live Action Short Film'],
    ['Sound', 'Best Sound'],
    ['Sound Editing', 'Best Sound Editing'],
    ['Sound Mixing', 'Best Sound Mixing'],
    ['Sound Recording', 'Best Sound'],
    ['Visual Effects', 'Best Visual Effects'],
    ['Writing (Adapted Screenplay)', 'Best Adapted Screenplay'],
    ['Writing (Original Screenplay)', 'Best Original Screenplay'],
    ['Writing (Screenplay Adapted from Other Material)', 'Best Adapted Screenplay'],
    ['Writing (Screenplay Written Directly for the Screen)', 'Best Original Screenplay'],
    ['Writing (Story and Screenplay Written Directly for the Screen)', 'Best Original Screenplay'],
    ['Writing (Story and Screenplay)', 'Best Original Screenplay'],
    ['Writing (Screenplay)', 'Best Screenplay'],
    ['Writing', 'Best Screenplay']
  ]);
  return map.get(category) || category;
}

function parseWinner(value, category) {
  const winnerText = (value || '').trim();
  const parts = winnerText.split(' - ');
  if (parts.length >= 2) {
    const winner = parts.slice(0, -1).join(' - ').trim();
    const film = parts[parts.length - 1].trim();
    return {
      winner: winner || film,
      film,
      winnerType: /Actor|Actress|Director|Writing|Cinematography|Editing|Design|Costume|Makeup|Music|Song|Sound|Effects/i.test(category) ? 'person' : 'film'
    };
  }
  return { winner: winnerText || 'TBC', winnerType: 'film' };
}

function ceremonyNumber(year) {
  return year - 1928;
}

function decadeName(year) {
  return `${Math.floor(year / 10) * 10}s`;
}

const response = await fetch(csvUrl);
if (!response.ok) throw new Error(`Could not fetch ${csvUrl}: ${response.status}`);
const rows = parseCsv(await response.text());
const byDecade = new Map();

for (const row of rows) {
  const year = Number(String(row.year || '').replace(/,/g, ''));
  if (!Number.isFinite(year) || year < wantedStart || year > wantedEnd || year === 2026) continue;
  const category = normalizeCategory(row.category);
  if (/Special|Honorary|Scientific|Technical|Irving|Thalberg|Jean Hersholt|Juvenile|Gordon E\. Sawyer/i.test(category)) continue;
  const parsed = parseWinner(row.winners, category);
  const decade = decadeName(year);
  if (!byDecade.has(decade)) byDecade.set(decade, new Map());
  const years = byDecade.get(decade);
  if (!years.has(year)) years.set(year, { year, ceremony: ceremonyNumber(year), awards: [] });
  years.get(year).awards.push({
    category,
    winner: parsed.winner,
    ...(parsed.film ? { film: parsed.film } : {}),
    winnerType: parsed.winnerType
  });
}

const decade2026 = decadeName(2026);
if (!byDecade.has(decade2026)) byDecade.set(decade2026, new Map());
byDecade.get(decade2026).set(2026, {
  year: 2026,
  ceremony: 98,
  awards: official2026Awards
});

const preferred = [
  'Best Picture',
  'Best Director',
  'Best Actor',
  'Best Actress',
  'Best Supporting Actor',
  'Best Supporting Actress',
  'Best Original Screenplay',
  'Best Adapted Screenplay',
  'Best Cinematography',
  'Best Film Editing',
  'Best Production Design',
  'Best Costume Design',
  'Best Makeup and Hairstyling',
  'Best Original Score',
  'Best Original Song',
  'Best Casting',
  'Best Sound',
  'Best Sound Editing',
  'Best Sound Mixing',
  'Best Visual Effects',
  'Best International Feature Film',
  'Best Animated Feature',
  'Best Documentary Feature',
  'Best Animated Short Film',
  'Best Live Action Short Film',
  'Best Documentary Short'
];

function sortAwards(a, b) {
  const ai = preferred.indexOf(a.category);
  const bi = preferred.indexOf(b.category);
  if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  return a.category.localeCompare(b.category);
}

await mkdir(outDir, { recursive: true });
for (const [decade, yearsMap] of byDecade) {
  const years = Array.from(yearsMap.values())
    .sort((a, b) => a.year - b.year)
    .map((year) => ({ ...year, awards: year.awards.sort(sortAwards) }));
  const file = path.join(outDir, `oscars-${decade}.json`);
  await writeFile(file, JSON.stringify({ event: 'Oscars', decade, years }, null, 2) + '\n');
  console.log(`Wrote ${file} (${years.length} years, ${years.reduce((sum, year) => sum + year.awards.length, 0)} awards)`);
}
