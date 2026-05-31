import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'tmp');
const outFile = path.join(outDir, 'golf-espn-history.json');
const years = [2021, 2022, 2023, 2024, 2025, 2026];
const leagues = ['pga', 'lpga', 'liv'];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getJson(url) {
  const response = await fetch(url, {
    headers: {
      'accept': 'application/json',
      'user-agent': 'OneSliders golf history importer'
    }
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response.json();
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const payload = { fetchedAt: new Date().toISOString(), years, leagues, schedules: {} };
  for (const league of leagues) {
    payload.schedules[league] = {};
    for (const year of years) {
      const url = `https://site.api.espn.com/apis/site/v2/sports/golf/${league}/scoreboard?dates=${year}`;
      const data = await getJson(url);
      payload.schedules[league][year] = (data.events || []).map((event) => ({
        id: event.id,
        name: event.name,
        shortName: event.shortName,
        date: event.date,
        endDate: event.endDate,
        status: event.status?.type?.description || event.competitions?.[0]?.status?.type?.description || '',
        completed: !!(event.status?.type?.completed || event.competitions?.[0]?.status?.type?.completed),
        links: event.links || []
      }));
      await sleep(80);
    }
  }
  fs.writeFileSync(outFile, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${outFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
