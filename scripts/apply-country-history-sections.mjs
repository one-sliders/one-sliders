import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const locationsRoot = path.join(repoRoot, 'content', 'locations');
const dataDir = path.join(repoRoot, 'scripts', 'data');
const dataPath = path.join(dataDir, 'country-history.json');

const wikiTitleOverrides = new Map([
  ['content/locations/europe/czechia/index.html', 'Czech Republic'],
  ['content/locations/europe/russia/index.html', 'Russia'],
  ['content/locations/europe/turkey/index.html', 'Turkey'],
  ['content/locations/north-america/usa/index.html', 'United States'],
  ['content/locations/asia/timor-leste/index.html', 'East Timor'],
  ['content/locations/africa/ivory-coast/index.html', 'Ivory Coast'],
  ['content/locations/africa/republic-of-the-congo/index.html', 'Republic of the Congo'],
  ['content/locations/africa/democratic-republic-of-the-congo/index.html', 'Democratic Republic of the Congo'],
  ['content/locations/oceania/micronesia/index.html', 'Federated States of Micronesia'],
]);

const manualHistories = {
  'content/locations/africa/botswana/index.html': [
    ['1885', 'Britain created the Bechuanaland Protectorate.'],
    ['1966', 'Botswana became independent with Seretse Khama as its first president.'],
    ['1967', 'Major diamond deposits were discovered at Orapa, reshaping the economy.'],
    ['1994', 'Botswana held another peaceful multiparty election, reinforcing its democratic continuity.'],
  ],
  'content/locations/africa/cabo-verde/index.html': [
    ['1456', 'Portuguese navigators reached the Cape Verde islands.'],
    ['1462', 'Ribeira Grande on Santiago became one of the first permanent European settlements in the tropics.'],
    ['1956', 'The PAIGC was founded to campaign for independence in Cape Verde and Guinea-Bissau.'],
    ['1975', 'Cape Verde became independent from Portugal.'],
  ],
  'content/locations/africa/seychelles/index.html': [
    ['1770', 'French settlers established the first permanent settlement.'],
    ['1814', 'Britain took formal control after the Napoleonic Wars.'],
    ['1976', 'Seychelles became independent within the Commonwealth.'],
    ['1993', 'A new constitution restored multiparty politics.'],
  ],
  'content/locations/africa/zambia/index.html': [
    ['1891', 'British South Africa Company rule began in the region later called Northern Rhodesia.'],
    ['1924', 'Northern Rhodesia became a British protectorate.'],
    ['1964', 'Zambia became independent with Kenneth Kaunda as its first president.'],
    ['1991', 'Multiparty elections ended one-party rule.'],
  ],
  'content/locations/asia/israel/index.html': [
    ['c. 1000 BC', 'Ancient Israelite kingdoms emerged in the southern Levant.'],
    ['1917', 'The Balfour Declaration backed a national home for the Jewish people in Palestine.'],
    ['1948', 'The State of Israel declared independence.'],
    ['1967', 'The Six-Day War changed Israel\'s borders and regional politics.'],
    ['1993', 'The Oslo Accords began a new phase of Israeli-Palestinian negotiations.'],
  ],
  'content/locations/asia/japan/index.html': [
    ['660 BC', 'Traditional accounts place the founding of Japan under Emperor Jimmu.'],
    ['710', 'Nara became Japan\'s first permanent imperial capital.'],
    ['1603', 'Tokugawa Ieyasu founded the Tokugawa shogunate.'],
    ['1868', 'The Meiji Restoration returned imperial rule and accelerated modernization.'],
    ['1947', 'Japan\'s postwar constitution came into force.'],
  ],
  'content/locations/europe/denmark/index.html': [
    ['965', 'Harald Bluetooth linked the Danish monarchy with Christianity.'],
    ['1397', 'The Kalmar Union joined Denmark, Norway and Sweden under one crown.'],
    ['1849', 'Denmark adopted a constitution and became a constitutional monarchy.'],
    ['1973', 'Denmark joined the European Economic Community.'],
  ],
  'content/locations/europe/france/index.html': [
    ['843', 'The Treaty of Verdun divided the Carolingian Empire and shaped West Francia.'],
    ['987', 'Hugh Capet became king, beginning the Capetian dynasty.'],
    ['1789', 'The French Revolution began.'],
    ['1958', 'The Fifth Republic was founded.'],
    ['1993', 'France became part of the European Union through the Maastricht Treaty.'],
  ],
  'content/locations/europe/georgia/index.html': [
    ['337', 'Christianity became established as the state religion of ancient Iberia.'],
    ['1008', 'The unified Kingdom of Georgia emerged.'],
    ['1801', 'The Russian Empire annexed eastern Georgia.'],
    ['1918', 'Georgia declared independence as the Democratic Republic of Georgia.'],
    ['1991', 'Georgia restored independence from the Soviet Union.'],
  ],
  'content/locations/europe/germany/index.html': [
    ['962', 'Otto I was crowned emperor, a key marker for the Holy Roman Empire.'],
    ['1871', 'The German Empire was proclaimed after national unification.'],
    ['1949', 'West Germany and East Germany were founded after World War II.'],
    ['1990', 'Germany reunified.'],
    ['1993', 'Germany became part of the European Union through the Maastricht Treaty.'],
  ],
  'content/locations/europe/ireland/index.html': [
    ['1801', 'The Acts of Union brought Ireland into the United Kingdom.'],
    ['1916', 'The Easter Rising became a turning point in the independence movement.'],
    ['1922', 'The Irish Free State was established.'],
    ['1949', 'Ireland formally became a republic.'],
    ['1973', 'Ireland joined the European Economic Community.'],
  ],
  'content/locations/europe/netherlands/index.html': [
    ['1579', 'The Union of Utrecht united rebellious Dutch provinces.'],
    ['1581', 'The Act of Abjuration rejected Spanish rule.'],
    ['1648', 'The Peace of Munster recognized Dutch independence.'],
    ['1815', 'The Kingdom of the Netherlands was established.'],
    ['1957', 'The Netherlands became a founding member of the European Economic Community.'],
  ],
  'content/locations/europe/vatican-city/index.html': [
    ['756', 'The Papal States began as a territorial power in central Italy.'],
    ['1870', 'The Kingdom of Italy captured Rome, ending Papal States rule.'],
    ['1929', 'The Lateran Treaty created Vatican City as a sovereign state.'],
    ['1984', 'A revised concordat updated relations between Italy and the Holy See.'],
  ],
  'content/locations/north-america/bahamas/index.html': [
    ['1648', 'English settlers from Bermuda founded a colony in the Bahamas.'],
    ['1718', 'The islands became a British Crown colony.'],
    ['1964', 'The Bahamas gained internal self-government.'],
    ['1973', 'The Bahamas became independent.'],
  ],
  'content/locations/north-america/jamaica/index.html': [
    ['1494', 'Christopher Columbus reached Jamaica.'],
    ['1655', 'England captured Jamaica from Spain.'],
    ['1834', 'Slavery was abolished in the British Empire, including Jamaica.'],
    ['1962', 'Jamaica became independent.'],
  ],
  'content/locations/oceania/nauru/index.html': [
    ['1888', 'Nauru became a German protectorate.'],
    ['1914', 'Australian forces took control during World War I.'],
    ['1968', 'Nauru became independent.'],
    ['1999', 'Nauru joined the United Nations.'],
  ],
  'content/locations/oceania/solomon-islands/index.html': [
    ['1893', 'Britain declared a protectorate over the southern Solomon Islands.'],
    ['1942', 'The Guadalcanal campaign made the islands central to the Pacific War.'],
    ['1978', 'Solomon Islands became independent.'],
    ['2003', 'The RAMSI regional assistance mission began after years of unrest.'],
  ],
  'content/locations/oceania/tuvalu/index.html': [
    ['1892', 'The Ellice Islands became part of a British protectorate.'],
    ['1975', 'The Ellice Islands separated from the Gilbert Islands.'],
    ['1978', 'Tuvalu became independent.'],
    ['2000', 'Tuvalu joined the United Nations.'],
  ],
  'content/locations/oceania/vanuatu/index.html': [
    ['1906', 'Britain and France created the New Hebrides condominium.'],
    ['1980', 'Vanuatu became independent.'],
    ['1980', 'The Santo rebellion was put down after independence.'],
    ['1981', 'Vanuatu joined the United Nations.'],
  ],
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function relPath(filePath) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, '/');
}

function htmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function htmlDecode(value) {
  return String(value)
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&ndash;', '-')
    .replaceAll('&mdash;', '-')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function titleFromHtml(html, slug) {
  const h1 = html.match(/<h1[^>]*class="hero-title"[^>]*>(.*?)<\/h1>/s);
  if (h1) return htmlDecode(h1[1].replace(/<[^>]+>/g, '')).trim();
  const title = html.match(/<title>(.*?)\s*\|\s*OneSliders<\/title>/s);
  if (title) return htmlDecode(title[1].replace(/<[^>]+>/g, '')).trim();
  return slug
    .split('-')
    .map((part) => (['and', 'of', 'the'].includes(part) ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(' ');
}

function plainWiki(value) {
  let text = String(value || '');
  text = text.replace(/<!--[\s\S]*?-->/g, ' ');
  text = text.replace(/<ref\b[\s\S]*?<\/ref>/gi, ' ');
  text = text.replace(/<ref\b[^>]*\/>/gi, ' ');
  text = text.replace(/<br\s*\/?>/gi, '; ');
  text = text.replace(/'''?/g, '');
  text = text.replace(/\{\{Start date(?: and age)?\|(-?\d{1,4})(?:\|(\d{1,2}))?(?:\|(\d{1,2}))?[^}]*\}\}/gi, '$1');
  text = text.replace(/\{\{circa\|([^}|]+)[^}]*\}\}/gi, 'c. $1');
  text = text.replace(/\{\{c\.\|([^}|]+)[^}]*\}\}/gi, 'c. $1');
  text = text.replace(/\{\{nowrap\|([^{}]+)\}\}/gi, '$1');
  text = text.replace(/\{\{small\|([^{}]+)\}\}/gi, '$1');
  text = text.replace(/\{\{lang(?:-[^|}]+)?\|[^|}]+\|([^{}|]+)\}\}/gi, '$1');
  text = text.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$2');
  text = text.replace(/\[\[([^\]]+)\]\]/g, '$1');
  for (let i = 0; i < 8; i += 1) {
    const next = text.replace(/\{\{([^{}]*)\}\}/g, (_match, inner) => {
      const parts = inner.split('|').map((part) => part.trim()).filter(Boolean);
      if (parts.length <= 1) return '';
      return parts.slice(1).filter((part) => !/^[a-z_]+\s*=/.test(part)).join(' ');
    });
    if (next === text) break;
    text = next;
  }
  text = htmlDecode(text);
  text = text.replace(/\s*\([^)]*?\b(est\.|estimates?|ranked?)\b[^)]*\)/gi, '');
  text = text.replace(/\s+/g, ' ').trim();
  text = text.replace(/\s+([,.;:])/g, '$1');
  text = text.replace(/^\*+/, '').trim();
  return text;
}

function compactDate(value) {
  const text = plainWiki(value)
    .replace(/\s*\[[^\]]+\]/g, '')
    .replace(/\s*\([^)]*\)/g, '')
    .trim();
  if (!text) return '';
  const century = text.match(/\b(?:c\.\s*)?\d{1,2}(?:st|nd|rd|th) century(?:\s*(?:BC|BCE|AD|CE))?/i);
  if (century) return century[0].replace(/\s+/g, ' ');
  const range = text.match(/\b(?:c\.\s*)?\d{3,4}\s*[-/]\s*\d{2,4}\b/);
  if (range) return range[0].replace(/\s+/g, '');
  const era = text.match(/\b(?:c\.\s*)?\d{1,4}\s*(?:BC|BCE|AD|CE)\b/i);
  if (era) return era[0].replace(/\s+/g, ' ');
  const year = text.match(/\b(?:c\.\s*)?(?:[1-9]\d{2}|1\d{3}|20\d{2})\b/i);
  if (year) return year[0].replace(/\s+/g, ' ');
  return text.length <= 22 ? text : text.slice(0, 22).trim();
}

function cleanEvent(value) {
  let text = plainWiki(value);
  text = text.replace(/^from\s+/i, 'Independence from ');
  text = text.replace(/\s+/g, ' ').trim();
  if (!text || /^none$/i.test(text) || /^n\/a$/i.test(text)) return '';
  return text.length > 105 ? `${text.slice(0, 102).trim()}...` : text;
}

function extractTemplate(wikitext, templateName) {
  const start = wikitext.toLowerCase().indexOf(`{{${templateName.toLowerCase()}`);
  if (start < 0) return '';
  let depth = 0;
  for (let i = start; i < wikitext.length - 1; i += 1) {
    const pair = wikitext.slice(i, i + 2);
    if (pair === '{{') {
      depth += 1;
      i += 1;
    } else if (pair === '}}') {
      depth -= 1;
      i += 1;
      if (depth === 0) return wikitext.slice(start, i + 1);
    }
  }
  return '';
}

function parseParams(template) {
  const params = new Map();
  const matches = [...template.matchAll(/\n\|\s*([A-Za-z0-9_]+)\s*=/g)];
  for (let i = 0; i < matches.length; i += 1) {
    const name = matches[i][1].trim();
    const valueStart = matches[i].index + matches[i][0].length;
    const valueEnd = i + 1 < matches.length ? matches[i + 1].index : template.length - 2;
    params.set(name, template.slice(valueStart, valueEnd).trim());
  }
  return params;
}

function rowsFromInfobox(wikitext) {
  const template = extractTemplate(wikitext, 'Infobox country');
  if (!template) return [];
  const params = parseParams(template);
  const rows = [];
  const seen = new Set();

  const unnumberedEvent = cleanEvent(params.get('established_event') || params.get('formation_event'));
  const unnumberedDate = compactDate(params.get('established_date') || params.get('formation_date'));
  if (unnumberedEvent && unnumberedDate) {
    const key = `${unnumberedDate}::${unnumberedEvent}`.toLowerCase();
    seen.add(key);
    rows.push({ year: unnumberedDate, text: unnumberedEvent });
  }

  for (let i = 1; i <= 18; i += 1) {
    const event = cleanEvent(params.get(`established_event${i}`));
    const date = compactDate(params.get(`established_date${i}`));
    if (!event || !date) continue;
    const key = `${date}::${event}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ year: date, text: event });
  }

  const directPairs = [
    ['independence_date', 'independence_event'],
    ['formation_date', 'formation_event'],
    ['sovereignty_date', 'sovereignty_event'],
  ];
  for (const [dateKey, eventKey] of directPairs) {
    const date = compactDate(params.get(dateKey));
    const event = cleanEvent(params.get(eventKey) || params.get('sovereignty_type') || 'Modern state established');
    const key = `${date}::${event}`.toLowerCase();
    if (date && event && !seen.has(key)) {
      seen.add(key);
      rows.push({ year: date, text: event });
    }
  }

  return rows.slice(0, 8);
}

function manualRows(relative) {
  const rows = manualHistories[relative];
  if (!rows) return [];
  return rows.map(([year, text]) => ({ year, text }));
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'OneSliders local country history updater (https://one-sliders.com/)',
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function findWikipediaTitle(title) {
  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('list', 'search');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');
  url.searchParams.set('srlimit', '1');
  url.searchParams.set('srsearch', `${title} country`);
  const json = await fetchJson(url);
  return json.query?.search?.[0]?.title || title;
}

async function fetchWikiText(title) {
  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('prop', 'revisions');
  url.searchParams.set('rvprop', 'content');
  url.searchParams.set('rvslots', 'main');
  url.searchParams.set('format', 'json');
  url.searchParams.set('redirects', '1');
  url.searchParams.set('origin', '*');
  url.searchParams.set('titles', title);
  let json = await fetchJson(url);
  let page = Object.values(json.query?.pages || {})[0];
  if (page?.missing) {
    const fallbackTitle = await findWikipediaTitle(title);
    url.searchParams.set('titles', fallbackTitle);
    json = await fetchJson(url);
    page = Object.values(json.query?.pages || {})[0];
  }
  const text = page?.revisions?.[0]?.slots?.main?.['*'];
  if (!text) throw new Error(`No Wikipedia text for ${title}`);
  return { title: page.title || title, text };
}

async function readHistoryData() {
  try {
    return JSON.parse(await fs.readFile(dataPath, 'utf8'));
  } catch {
    return {};
  }
}

async function writeHistoryData(data) {
  await fs.mkdir(dataDir, { recursive: true });
  const sorted = Object.fromEntries(Object.entries(data).sort(([a], [b]) => a.localeCompare(b)));
  await fs.writeFile(dataPath, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8');
}

async function countryPages() {
  const continentDirs = await fs.readdir(locationsRoot, { withFileTypes: true });
  const files = [];
  for (const continent of continentDirs) {
    if (!continent.isDirectory() || continent.name === 'img') continue;
    const continentPath = path.join(locationsRoot, continent.name);
    const countryDirs = await fs.readdir(continentPath, { withFileTypes: true });
    for (const country of countryDirs) {
      if (!country.isDirectory() || country.name === 'img') continue;
      const filePath = path.join(continentPath, country.name, 'index.html');
      try {
        await fs.access(filePath);
        files.push(filePath);
      } catch {}
    }
  }
  return files.sort((a, b) => relPath(a).localeCompare(relPath(b)));
}

function buildHistoryHtml(rows) {
  const items = rows.map((row) => {
    return `<div><time>${htmlEscape(row.year)}</time><span>${htmlEscape(row.text)}</span></div>`;
  }).join('');
  return `<div class="country-left-stack"><div class="country-panel-card country-history-card"><h2>History</h2><div class="country-history-list">${items}</div></div></div>`;
}

function updateDescriptions(html, title) {
  const description = `${title} historical timeline, capital, population, events and travel context on OneSliders.`;
  const replaceMeta = (input, propertyName) => {
    const pattern = new RegExp(`(<meta ${propertyName}="description" content=")([^"]*)(">)`);
    if (pattern.test(input)) return input.replace(pattern, `$1${htmlEscape(description)}$3`);
    return input;
  };
  html = replaceMeta(html, 'name');
  html = html.replace(/(<meta property="og:description" content=")([^"]*)(">)/, `$1${htmlEscape(description)}$3`);
  return html;
}

function replaceHistoryBlock(html, rows) {
  const next = buildHistoryHtml(rows);
  const leftStackPattern = /<div class="country-left-stack">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>(?=\s*<\/div>\s*<div class="country-brief__panel">)/;
  if (!leftStackPattern.test(html)) {
    throw new Error('Could not find country-left-stack block');
  }
  return html.replace(leftStackPattern, next);
}

async function main() {
  const force = process.argv.includes('--force-refresh');
  const data = await readHistoryData();
  const files = await countryPages();
  const failures = [];
  let fetched = 0;
  let updated = 0;
  let skipped = 0;

  for (const file of files) {
    const relative = relPath(file);
    const html = await fs.readFile(file, 'utf8');
    const slug = path.basename(path.dirname(file));
    const title = titleFromHtml(html, slug);
    const wikiTitle = wikiTitleOverrides.get(relative) || title;

    if (force || !data[relative]?.rows?.length) {
      try {
        const wiki = await fetchWikiText(wikiTitle);
        let rows = rowsFromInfobox(wiki.text);
        if (rows.length < 2) rows = manualRows(relative);
        if (rows.length < 2) throw new Error(`Only ${rows.length} usable history rows from ${wiki.title}`);
        data[relative] = { title, source: `https://en.wikipedia.org/wiki/${encodeURIComponent(wiki.title.replaceAll(' ', '_'))}`, rows };
        fetched += 1;
        await sleep(90);
      } catch (error) {
        const rows = manualRows(relative);
        if (rows.length >= 2) {
          data[relative] = { title, source: 'manual fallback from standard country history references', rows };
        } else {
          failures.push(`${relative}: ${error.message}`);
          continue;
        }
      }
    }

    const rows = data[relative].rows;
    try {
      const withHistory = replaceHistoryBlock(updateDescriptions(html, title), rows);
      if (withHistory !== html) {
        await fs.writeFile(file, withHistory, 'utf8');
        updated += 1;
      } else {
        skipped += 1;
      }
    } catch (error) {
      failures.push(`${relative}: ${error.message}`);
    }
  }

  await writeHistoryData(data);
  console.log(`Country pages: ${files.length}`);
  console.log(`Fetched histories: ${fetched}`);
  console.log(`Updated pages: ${updated}`);
  console.log(`Skipped unchanged: ${skipped}`);
  if (failures.length) {
    console.log('Failures:');
    for (const failure of failures) console.log(`- ${failure}`);
    process.exitCode = 1;
  }
}

await main();
