import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outPath = path.join(root, 'data/culture/awards/events/awards-history.json');

const awards = {
  'golden-globe-awards': [
    source('Motion Picture Drama', 'Golden_Globe_Award_for_Best_Motion_Picture_%E2%80%93_Drama', ['title']),
    source('Motion Picture Musical/Comedy', 'Golden_Globe_Award_for_Best_Motion_Picture_%E2%80%93_Musical_or_Comedy', ['title']),
    source('TV Drama Series', 'Golden_Globe_Award_for_Best_Television_Series_%E2%80%93_Drama', ['title']),
    source('TV Musical/Comedy Series', 'Golden_Globe_Award_for_Best_Television_Series_%E2%80%93_Musical_or_Comedy', ['title'])
  ],
  'bafta-film-awards': [
    source('Best Film', 'BAFTA_Award_for_Best_Film', ['title']),
    source('Director', 'BAFTA_Award_for_Best_Direction', ['title', 'work']),
    source('Leading Actor', 'BAFTA_Award_for_Best_Actor_in_a_Leading_Role', ['title', 'work']),
    source('Leading Actress', 'BAFTA_Award_for_Best_Actress_in_a_Leading_Role', ['title', 'work'])
  ],
  'emmy-awards': [
    source('Drama Series', 'Primetime_Emmy_Award_for_Outstanding_Drama_Series', ['title']),
    source('Comedy Series', 'Primetime_Emmy_Award_for_Outstanding_Comedy_Series', ['title']),
    source('Limited Series', 'Primetime_Emmy_Award_for_Outstanding_Limited_or_Anthology_Series', ['title'])
  ],
  'tony-awards': [
    source('Best Musical', 'Tony_Award_for_Best_Musical', ['title']),
    source('Best Play', 'Tony_Award_for_Best_Play', ['title']),
    source('Revival of a Musical', 'Tony_Award_for_Best_Revival_of_a_Musical', ['title']),
    source('Lead Actor Musical', 'Tony_Award_for_Best_Performance_by_a_Leading_Actor_in_a_Musical', ['title', 'work'])
  ],
  'cesar-awards': [
    source('Best Film', 'C%C3%A9sar_Award_for_Best_Film', ['title']),
    source('Director', 'C%C3%A9sar_Award_for_Best_Director', ['title', 'work']),
    source('Actor', 'C%C3%A9sar_Award_for_Best_Actor', ['title', 'work']),
    source('Actress', 'C%C3%A9sar_Award_for_Best_Actress', ['title', 'work'])
  ],
  'grammy-awards': [
    source('Album of the Year', 'Grammy_Award_for_Album_of_the_Year', ['title', 'work']),
    source('Record of the Year', 'Grammy_Award_for_Record_of_the_Year', ['title', 'work']),
    source('Song of the Year', 'Grammy_Award_for_Song_of_the_Year', ['title', 'work']),
    source('Best New Artist', 'Grammy_Award_for_Best_New_Artist', ['title'])
  ],
  'brit-awards': [
    source('Album of the Year', 'Brit_Award_for_British_Album_of_the_Year', ['title', 'work']),
    source('Song of the Year', 'Brit_Award_for_Song_of_the_Year', ['title', 'work']),
    source('Artist of the Year', 'Brit_Award_for_British_Artist_of_the_Year', ['title']),
    source('Best New Artist', 'Brit_Award_for_Best_New_Artist', ['title'])
  ],
  'mtv-video-music-awards': [
    source('Video of the Year', 'MTV_Video_Music_Award_for_Video_of_the_Year', ['title', 'work']),
    source('Artist of the Year', 'MTV_Video_Music_Award_for_Artist_of_the_Year', ['title']),
    source('Song of the Year', 'MTV_Video_Music_Award_for_Song_of_the_Year', ['title', 'work']),
    source('Best New Artist', 'MTV_Video_Music_Award_for_Best_New_Artist', ['title'])
  ],
  'bet-awards': [
    source('Album of the Year', 'BET_Award_for_Album_of_the_Year', ['title', 'work']),
    source('Video of the Year', 'BET_Award_for_Video_of_the_Year', ['title', 'work']),
    source('Best Female R&B/Pop Artist', 'BET_Award_for_Best_Female_R%26B/Pop_Artist', ['title']),
    source('Best Male Hip Hop Artist', 'BET_Award_for_Best_Male_Hip-Hop_Artist', ['title'])
  ]
};

function source(label, title, valueParts) {
  return { label, title, valueParts };
}

function rawUrl(title) {
  return `https://en.wikipedia.org/w/index.php?title=${title}&action=raw`;
}

async function fetchRaw(title) {
  const response = await fetch(rawUrl(title), { headers: { 'user-agent': 'OneSliders history importer' } });
  if (!response.ok) throw new Error(`${response.status} ${title}`);
  return response.text();
}

function stripWiki(value) {
  return String(value || '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^\s*(?:rowspan|colspan|style|scope|align|bgcolor|width|class)\s*=\s*(?:"[^"]*"|'[^']*'|[^|]+)\s*\|\s*/i, '')
    .replace(/^\s*(?:rowspan|colspan|style|scope|align|bgcolor|width|class)[^|]*\|\s*/i, '')
    .replace(/<ref[\s\S]*?<\/ref>/gi, '')
    .replace(/<ref[^>]*\/>/gi, '')
    .replace(/<br\s*\/?>/gi, ', ')
    .replace(/<\/?small[^>]*>/gi, '')
    .replace(/<\/?[^>]+>/g, '')
    .replace(/\{\{sort\|[^|{}]*\|([^{}]+)\}\}/gi, '$1')
    .replace(/\{\{small\|([^{}]+)\}\}/gi, '$1')
    .replace(/\{\{nowrap\|([^{}]+)\}\}/gi, '$1')
    .replace(/\{\{flagicon\|[^{}]+\}\}/gi, '')
    .replace(/\{\{[^{}]*\}\}/g, '')
    .replace(/'''/g, '')
    .replace(/''/g, '')
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\[[^\] ]+ ([^\]]+)\]/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&ndash;|–/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*,\s*/g, ', ')
    .trim();
}

function splitCells(row) {
  return row
    .replace(/\|\|/g, '\n|')
    .split(/\n[!|]/)
    .map((cell, index) => (index === 0 ? cell.replace(/^[!|]/, '') : cell))
    .map((cell) => {
      let next = cell.trim();
      for (let i = 0; i < 5; i += 1) {
        next = next
          .replace(/^\s*[!|]\s*/, '')
          .replace(/^\s*(?:rowspan|colspan|style|scope|align|bgcolor|width|class)\s*=\s*(?:"[^"]*"|'[^']*'|[^|]+)\s*\|\s*/i, '')
          .replace(/^\s*(?:rowspan|colspan|style|scope|align|bgcolor|width|class)[^|]*\|\s*/i, '')
          .trim();
      }
      return next;
    })
    .filter(Boolean);
}

function yearFromCell(cell) {
  const clean = stripWiki(cell);
  const match = clean.match(/\b(19[0-9]{2}|20[0-9]{2})\b/);
  return match ? match[1] : '';
}

function parseWinnerRows(raw, sourceConfig) {
  const result = {};
  const rows = raw.split(/\n\|-/g);
  let pendingYear = '';
  for (const rawRow of rows) {
    const row = rawRow.trim();
    const winner = /background\s*[:=]\s*#?(?:FAEB86|B0C4DE)|bgcolor\s*=\s*"?#?(?:FAEB86|B0C4DE)|background-color\s*:\s*#?(?:FAEB86|B0C4DE)|winner/i.test(row);
    const cells = splitCells(row);
    const yearCell = cells.find((cell) => yearFromCell(cell));
    const year = yearCell ? yearFromCell(yearCell) : pendingYear;
    if (yearCell) pendingYear = year;
    if (!winner || !year) continue;
    const dataCells = cells
      .filter((cell) => !yearFromCell(cell))
      .map((cell) => stripWiki(cell))
      .filter((cell) => cell && !isTableAttributeCell(cell));
    const title = dataCells[0];
    const work = dataCells[1];
    if (!title) continue;
    if (isBadWinnerText(title) || isBadWinnerText(work)) continue;
    result[year] = sourceConfig.valueParts
      .map((part) => (part === 'title' ? title : work))
      .filter(Boolean)
      .join(', ');
  }
  return result;
}

function isTableAttributeCell(value) {
  return /^(?:rowspan|colspan|style|scope|align|bgcolor|width|class)\s*=/i.test(String(value || '').trim());
}

function isBadWinnerText(value) {
  const text = String(value || '');
  return /\{\{|==|See also|References|External links|Category:/i.test(text);
}

const output = {};

for (const [slug, configs] of Object.entries(awards)) {
  output[slug] = { categories: configs.map((config) => config.label), rows: {} };
  for (const config of configs) {
    try {
      const raw = await fetchRaw(config.title);
      const winners = parseWinnerRows(raw, config);
      for (const [year, winner] of Object.entries(winners)) {
        output[slug].rows[year] ||= {};
        output[slug].rows[year][config.label] = winner;
      }
      console.log(`${slug}: ${config.label} ${Object.keys(winners).length} rows`);
    } catch (error) {
      console.warn(`${slug}: failed ${config.label}: ${error.message}`);
    }
  }
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`Wrote ${outPath}`);
