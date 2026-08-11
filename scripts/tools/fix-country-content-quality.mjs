import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const write = process.argv.includes('--write');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith('.data.json') && !entry.name.endsWith('.city.data.json')) out.push(full);
  }
  return out;
}

function cleanText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function countryEmptyEventText(data) {
  const name = cleanText(data.name);
  const capital = cleanText(data.kpis?.capital);
  const city = (data.cities || []).map((item) => cleanText(item?.name)).find(Boolean);
  const anchor = capital || city;
  if (anchor) {
    return `Use ${anchor} as the first planning anchor for ${name}, then compare the city, food and worth-seeing notes on this page.`;
  }

  const worth = (data.worthSeeing || []).find((item) => cleanText(item?.title) && cleanText(item?.text));
  if (worth) {
    const title = cleanText(worth.title).replace(/:$/, '').toLowerCase();
    return `Use ${title} as the first planning anchor for ${name}, then compare the linked topics and practical country facts on this page.`;
  }

  return `Use the country facts, food notes and linked locations on this page as the first planning anchors for ${name}.`;
}

function seoDescription(data) {
  const name = cleanText(data.name);
  const capital = cleanText(data.kpis?.capital);
  const cityNames = (data.cities || []).map((item) => cleanText(item?.name)).filter(Boolean);
  const worth = (data.worthSeeing || [])
    .map((item) => cleanText(item?.title).replace(/:$/, ''))
    .filter((value) => value && !/^city base$/i.test(value));
  const anchors = [];
  if (capital) anchors.push(`${capital} planning`);
  for (const value of [...cityNames, ...worth]) {
    if (!anchors.some((anchor) => anchor.toLowerCase().includes(value.toLowerCase()))) anchors.push(value);
    if (anchors.length >= 3) break;
  }
  if (!anchors.length) anchors.push('country facts');
  return `${name}: ${anchors.join(', ')} and practical country facts.`;
}

function seoTitle(data) {
  return `${cleanText(data.name)} travel, cities and events`;
}

function hasGenericSeo(value) {
  const text = cleanText(value).toLowerCase();
  return text.includes('sports events') || text.includes('historical timeline') || text.includes('travel context');
}

function hasGenericTitle(value) {
  return cleanText(value).startsWith('Sports Events in ');
}

const files = walk(path.join(ROOT, 'content', 'locations'));
const changes = [];

for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(before);
  const changed = [];

  if (cleanText(data.eventsEmptyText).toLowerCase().includes('current dataset')) {
    data.eventsEmptyText = countryEmptyEventText(data);
    changed.push('eventsEmptyText');
  }

  if (data.seo && hasGenericTitle(data.seo.title)) {
    data.seo.title = seoTitle(data);
    changed.push('seo.title');
  }

  if (data.seo && ['description', 'twitterDescription', 'webpageDescription'].some((field) => hasGenericSeo(data.seo[field]))) {
    const description = seoDescription(data);
    if (hasGenericSeo(data.seo.description)) {
      data.seo.description = description;
      changed.push('seo.description');
    }
    if (hasGenericSeo(data.seo.twitterDescription)) {
      data.seo.twitterDescription = description;
      changed.push('seo.twitterDescription');
    }
    if (hasGenericSeo(data.seo.webpageDescription)) {
      data.seo.webpageDescription = description;
      changed.push('seo.webpageDescription');
    }
  }

  if (!changed.length) continue;
  changes.push({ file: path.relative(ROOT, file).replace(/\\/g, '/'), changed });
  if (write) {
    fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  }
}

console.log(`${write ? 'Updated' : 'Would update'} ${changes.length} country data files.`);
for (const item of changes.slice(0, 20)) {
  console.log(`- ${item.file}: ${item.changed.join(', ')}`);
}
if (changes.length > 20) console.log(`... ${changes.length - 20} more`);
