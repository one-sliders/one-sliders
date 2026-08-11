import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const write = process.argv.includes('--write');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith('.city.data.json')) out.push(full);
  }
  return out;
}

function cleanText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function itemLabel(item) {
  if (!item || typeof item !== 'object') return cleanText(item);
  return cleanText(item.title || item.name || item.label);
}

function cityAnchors(data) {
  const pools = [data.highlights, data.see, data.attractions, data.worthSeeing];
  const anchors = [];
  for (const pool of pools) {
    if (!Array.isArray(pool)) continue;
    for (const item of pool) {
      const label = itemLabel(item);
      if (label && !anchors.some((anchor) => anchor.toLowerCase() === label.toLowerCase())) anchors.push(label);
      if (anchors.length >= 3) return anchors;
    }
  }
  return anchors;
}

function seoTitle(data) {
  return `${cleanText(data.name)} travel, stays and events`;
}

function seoDescription(data) {
  const name = cleanText(data.name);
  const anchors = cityAnchors(data);
  const airport = Array.isArray(data.airports) && data.airports[0] ? cleanText(data.airports[0].name) : '';
  const pieces = anchors.slice(0, 2);
  if (airport) pieces.push(airport);
  if (!pieces.length) pieces.push(cleanText(data.countryName) || 'local event links');
  return `Plan ${name} around ${pieces.join(', ')} and nearby event links.`;
}

function hasGenericSeo(value) {
  const text = cleanText(value).toLowerCase();
  return text.includes('sports events') || text.includes('travel context') || text.includes('at a glance');
}

function hasGenericTitle(value) {
  return cleanText(value).startsWith('Sports Events in ');
}

function rewriteGenericStopover(text) {
  const value = cleanText(text);
  const match = value.match(/^(.+?) is a (.+?) base best planned around named sights rather than a generic stopover\. Start with (.+?), add (.+?), and use (.+?) to understand (.+)$/);
  if (!match) return text;

  const [, city, country, first, second, third, rest] = match;
  return `${city} works best as a base in ${country} when you anchor days around ${first}, ${second} and ${third}. Use those sights to understand ${rest}`;
}

const files = walk(path.join(ROOT, 'content', 'locations'));
const changes = [];

for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(before);
  const changed = [];

  if (cleanText(data.heroText).includes('rather than a generic stopover')) {
    const next = rewriteGenericStopover(data.heroText);
    if (next !== data.heroText && !cleanText(next).includes('generic stopover')) {
      data.heroText = next;
      changed.push('heroText');
    }
  }

  if (data.seo && hasGenericTitle(data.seo.title)) {
    data.seo.title = seoTitle(data);
    changed.push('seo.title');
  }

  if (data.seo && ['description', 'twitterDescription', 'webpageDescription'].some((field) => hasGenericSeo(data.seo[field]))) {
    const description = seoDescription(data);
    for (const field of ['description', 'twitterDescription', 'webpageDescription']) {
      if (hasGenericSeo(data.seo[field])) {
        data.seo[field] = description;
        changed.push(`seo.${field}`);
      }
    }
  }

  if (!changed.length) continue;
  changes.push({ file: path.relative(ROOT, file).replace(/\\/g, '/'), changed });
  if (write) fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

console.log(`${write ? 'Updated' : 'Would update'} ${changes.length} city data files.`);
for (const item of changes.slice(0, 20)) {
  console.log(`- ${item.file}: ${item.changed.join(', ')}`);
}
if (changes.length > 20) console.log(`... ${changes.length - 20} more`);
