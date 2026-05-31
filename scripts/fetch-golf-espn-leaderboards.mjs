import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const eventDir = path.join(root, 'content/categories/sport/golf/events');
const scheduleFile = path.join(root, 'scripts/data/golf-espn-history.json');
const outFile = path.join(root, 'scripts/data/golf-espn-leaderboards.json');

const countryByAbbr = {
  ARG: 'Argentina',
  AUS: 'Australia',
  AUT: 'Austria',
  BEL: 'Belgium',
  CAN: 'Canada',
  CHI: 'Chile',
  CHL: 'Chile',
  CHN: 'China',
  COL: 'Colombia',
  DEN: 'Denmark',
  ENG: 'United Kingdom',
  ESP: 'Spain',
  FIN: 'Finland',
  FRA: 'France',
  GBR: 'United Kingdom',
  GER: 'Germany',
  IND: 'India',
  IRL: 'Ireland',
  ITA: 'Italy',
  JPN: 'Japan',
  KOR: 'South Korea',
  MEX: 'Mexico',
  NED: 'Netherlands',
  NOR: 'Norway',
  NZL: 'New Zealand',
  PHI: 'Philippines',
  POL: 'Poland',
  POR: 'Portugal',
  RSA: 'South Africa',
  SCO: 'United Kingdom',
  SWE: 'Sweden',
  THA: 'Thailand',
  TPE: 'Taiwan',
  USA: 'United States',
  VEN: 'Venezuela',
  WAL: 'United Kingdom'
};

const historyAliasesBySlug = {
  'fortinet-founders-cup': ['Founders Cup', 'Cognizant Founders Cup'],
  'shoprite-lpga-classic': ['ShopRite LPGA Classic']
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getJson(url) {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'OneSliders golf leaderboard importer'
    }
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response.json();
}

function readEventPages() {
  return fs.readdirSync(eventDir)
    .filter((file) => file.endsWith('.html'))
    .map((file) => {
      const source = fs.readFileSync(path.join(eventDir, file), 'utf8');
      if (!source.includes('data-generated-golf-tour="true"')) return null;
      const match = source.match(/<script type="application\/json" id="event-year-data">([\s\S]*?)<\/script>/);
      if (!match) return null;
      const data = JSON.parse(match[1]);
      const lower = source.toLowerCase();
      const league = lower.includes('liv golf') ? 'liv' : lower.includes('lpga') ? 'lpga' : 'pga';
      return {
        slug: file.replace(/\.html$/, ''),
        name: data.eventName,
        league,
        editions: data.editions || []
      };
    })
    .filter(Boolean);
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

function eventNameScore(leftName, rightEvent) {
  const left = new Set(normalizeEventName(leftName).split(' ').filter(Boolean));
  const right = new Set(normalizeEventName(rightEvent.name || rightEvent.shortName).split(' ').filter(Boolean));
  if (!left.size || !right.size) return 0;
  let overlap = 0;
  for (const token of left) if (right.has(token)) overlap += 1;
  if (overlap >= 2 && (overlap === left.size || overlap === right.size)) return 1;
  return overlap / Math.max(left.size, right.size);
}

function scheduleEventFor(schedule, page, year) {
  const events = schedule.schedules?.[page.league]?.[String(year)] || [];
  const names = [page.name, ...(historyAliasesBySlug[page.slug] || [])];
  const scored = events
    .map((event) => ({
      event,
      score: names
        .map((name) => eventNameScore(name, event))
        .reduce((best, value) => Math.max(best, value), 0)
    }))
    .sort((a, b) => b.score - a.score);
  return scored[0]?.score >= 0.6 ? scored[0].event : null;
}

function athleteCountry(athlete) {
  const abbr = String(
    athlete?.citizenshipCountry?.abbreviation ||
    athlete?.citizenship ||
    athlete?.birthPlace?.countryAbbreviation ||
    ''
  ).trim().toUpperCase();
  const name = countryByAbbr[abbr] || athlete?.citizenshipCountry?.name || athlete?.birthPlace?.country || abbr || '';
  return { abbreviation: abbr, name };
}

async function fetchLeaderboard(league, year, event) {
  const base = `https://sports.core.api.espn.com/v2/sports/golf/leagues/${league}/events/${event.id}/competitions/${event.id}/competitors`;
  const competitors = await getJson(`${base}?limit=100&lang=en&region=us`);
  const topRefs = (competitors.items || [])
    .slice()
    .sort((a, b) => Number(a.order || 999) - Number(b.order || 999))
    .slice(0, 10);
  const players = (await Promise.all(topRefs.map(async (item, index) => {
    const athleteRef = item.athlete?.$ref;
    const scoreRef = item.score?.$ref;
    const linescoresRef = item.linescores?.$ref;
    if (!athleteRef || !scoreRef || !linescoresRef) return null;
    const [athlete, score, linescores] = await Promise.all([
      getJson(String(athleteRef).replace('http://', 'https://')),
      getJson(String(scoreRef).replace('http://', 'https://')),
      getJson(String(linescoresRef).replace('http://', 'https://'))
    ]);
    const rounds = (linescores.items || [])
      .slice()
      .sort((a, b) => Number(a.period || 0) - Number(b.period || 0))
      .map((round) => Number(round.value))
      .filter((value) => Number.isFinite(value));
    const country = athleteCountry(athlete);
    return {
      position: Number(item.order || index + 1),
      name: athlete.displayName || athlete.fullName || athlete.shortName || 'TBC',
      countryName: country.name,
      countryAbbreviation: country.abbreviation,
      final: score.displayValue || score.completedRoundsDisplayValue || '',
      total: score.value || null,
      rounds
    };
  }))).filter(Boolean);
  return {
    id: event.id,
    league,
    year,
    name: event.name,
    shortName: event.shortName,
    date: event.date,
    endDate: event.endDate,
    status: event.status,
    completed: event.completed,
    sourceUrl: `https://www.espn.com/golf/leaderboard?tournamentId=${event.id}`,
    players
  };
}

async function main() {
  const schedule = JSON.parse(fs.readFileSync(scheduleFile, 'utf8'));
  const existing = fs.existsSync(outFile)
    ? JSON.parse(fs.readFileSync(outFile, 'utf8'))
    : { byEventId: {}, bySlugYear: {} };
  const pages = readEventPages();
  const byEventId = existing.byEventId || {};
  const bySlugYear = existing.bySlugYear || {};
  const tasks = [];
  for (const page of pages) {
    for (const edition of page.editions) {
      const year = Number(edition.year);
      const event = scheduleEventFor(schedule, page, year);
      if (!event || !event.completed) continue;
      bySlugYear[`${page.slug}:${year}`] = event.id;
      if (!byEventId[event.id]) tasks.push({ page, year, event });
    }
  }
  console.log(`Fetching ${tasks.length} leaderboards`);
  for (const task of tasks) {
    try {
      byEventId[task.event.id] = await fetchLeaderboard(task.page.league, task.year, task.event);
      console.log(`${task.page.slug} ${task.year}: ${byEventId[task.event.id].players.length} players`);
      fs.writeFileSync(outFile, `${JSON.stringify({ fetchedAt: new Date().toISOString(), byEventId, bySlugYear }, null, 2)}\n`);
    } catch (error) {
      console.error(`${task.page.slug} ${task.year}: ${error.message}`);
    }
    await sleep(30);
  }
  fs.writeFileSync(outFile, `${JSON.stringify({ fetchedAt: new Date().toISOString(), byEventId, bySlugYear }, null, 2)}\n`);
  console.log(`Wrote ${outFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
