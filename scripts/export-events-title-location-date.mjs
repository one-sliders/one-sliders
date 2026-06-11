import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function clean(value) {
  return String(value ?? '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&aring;/gi, 'å')
    .replace(/&auml;/gi, 'ä')
    .replace(/&ouml;/gi, 'ö')
    .replace(/&Aring;/g, 'Å')
    .replace(/&Auml;/g, 'Ä')
    .replace(/&Ouml;/g, 'Ö')
    .replace(/\s+/g, ' ')
    .trim();
}

function walk(dir) {
  const output = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) output.push(...walk(fullPath));
    if (entry.isFile() && entry.name.endsWith('.html')) output.push(fullPath);
  }
  return output;
}

function first(html, patterns) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return clean(match[1]);
  }
  return '';
}

function uniqueJoin(items) {
  const output = [];
  const seen = new Set();
  let hadTbc = false;

  for (const item of items.flat().filter(Boolean)) {
    const value = clean(typeof item === 'object' && item.name ? item.name : item);
    if (!value) continue;
    if (/^(TBC|Date TBC|Venue TBC)$/i.test(value)) {
      hadTbc = true;
      if (/^Venue TBC$/i.test(value)) continue;
    }
    const key = value.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      output.push(value);
    }
  }

  return output.length ? output.join(', ') : hadTbc ? 'TBC' : '';
}

function eventJson(html) {
  const match = html.match(/<script[^>]+id=["']event-year-data["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function editionFor(data) {
  if (!data?.editions?.length) return null;
  return data.editions.find((edition) => edition.year === data.defaultYear) || data.editions.at(-1);
}

function fact(html, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return first(html, [
    new RegExp(`<div class=["'][^"']*(?:fact|country-kpi)[^"']*["'][^>]*>\\s*<span>${escaped}<\\/span>\\s*<strong>([\\s\\S]*?)<\\/strong>`, 'i'),
    new RegExp(`<div class=["'][^"']*fact-row[^"']*["'][^>]*>\\s*<span>${escaped}<\\/span>\\s*<strong>([\\s\\S]*?)<\\/strong>`, 'i'),
  ]);
}

function titleFromHtml(html, data) {
  if (data?.eventName) return clean(data.eventName);
  return first(html, [
    /<h1[^>]*class=["'][^"']*event-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i,
    /<h1[^>]*class=["'][^"']*hero-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i,
    /<h1[^>]*>([\s\S]*?)<\/h1>/i,
    /<title>([\s\S]*?)<\/title>/i,
  ])
    .replace(/\s+\d{4}\s*[-–—].*$/, '')
    .replace(/\s*[-–—]\s*Dates,.*$/, '')
    .replace(/\s*\|\s*OneSliders.*$/, '')
    .trim();
}

function locationFromRegister(location) {
  return uniqueJoin([location?.cities || [], location?.countries || [], location?.venue]);
}

function locationFromHtml(html, edition) {
  if (edition) {
    const joined = uniqueJoin([edition.cities || [], edition.countries || [], edition.venue]);
    if (joined) return joined;
  }
  return uniqueJoin([fact(html, 'City'), fact(html, 'Country'), fact(html, 'Venue') || fact(html, 'Where')]);
}

function dateFromHtml(html, edition) {
  if (edition?.dates) return clean(edition.dates);
  const date = fact(html, 'Timing') || fact(html, 'Dates') || fact(html, 'Next edition');
  if (date) return date;
  const metaDate = first(html, [
    /<meta name=["']description["'] content=["'][^"']*?:\s*([^"']*?(?:TBC|\d{4}|\d{1,2}\s+[A-Z][a-z]+)[^"']*)["']/i,
  ]);
  if (metaDate) return metaDate;
  if (edition?.startDate) {
    if (edition.endDate) return `${edition.startDate} - ${edition.endDate}`;
    if (edition.endExclusive) return `${edition.startDate} - ${edition.endExclusive}`;
    return edition.startDate;
  }
  return '';
}

function yearFromRow(registered, data, edition, html, date) {
  if (registered?.currentEdition) return String(registered.currentEdition);
  if (data?.defaultYear) return String(data.defaultYear);
  if (edition?.year) return String(edition.year);
  const titleYear = clean(html).match(/\b(20\d{2})\b/);
  if (titleYear) return titleYear[1];
  const dateYear = String(date || '').match(/\b(20\d{2})\b/);
  return dateYear ? dateYear[1] : 'TBC';
}

function csvEscape(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

const register = JSON.parse(fs.readFileSync(path.join(root, 'events.register.json'), 'utf8'));
const byPage = new Map();

for (const event of register.events || []) {
  if (event.eventPageEN) {
    byPage.set(event.eventPageEN.replaceAll('/', path.sep).toLowerCase(), event);
  }
}

const files = walk(path.join(root, 'content', 'categories'))
  .filter((file) => file.includes(`${path.sep}events${path.sep}`))
  .sort();

const rows = files.map((file) => {
  const relativePath = path.relative(root, file).toLowerCase();
  const html = fs.readFileSync(file, 'utf8');
  const registered = byPage.get(relativePath);
  const data = eventJson(html);
  const edition = editionFor(data);

  const date = (registered?.displayDates ? clean(registered.displayDates) : '') || dateFromHtml(html, edition);

  return {
    Titel: registered?.title ? clean(registered.title) : titleFromHtml(html, data),
    år: yearFromRow(registered, data, edition, html, date),
    lokation: (registered ? locationFromRegister(registered.location) : '') || locationFromHtml(html, edition),
    datum: date,
  };
});

const csv = [
  '"Titel";"år";"lokation";"datum"',
  ...rows.map((row) => [row.Titel, row.år, row.lokation, row.datum].map(csvEscape).join(';')),
].join('\r\n') + '\r\n';

let outputName = 'events-titel-lokation-datum.csv';
try {
  fs.writeFileSync(path.join(root, outputName), `\uFEFF${csv}`, 'utf8');
} catch (error) {
  if (error.code !== 'EBUSY') throw error;
  outputName = 'events-titel-ar-lokation-datum.csv';
  fs.writeFileSync(path.join(root, outputName), `\uFEFF${csv}`, 'utf8');
}

const missing = rows.reduce(
  (acc, row) => {
    if (!row.Titel) acc.title += 1;
    if (!row.år) acc.year += 1;
    if (!row.lokation) acc.location += 1;
    if (!row.datum) acc.date += 1;
    return acc;
  },
  { title: 0, year: 0, location: 0, date: 0 },
);

console.log(`Wrote ${rows.length} rows to ${outputName}`);
console.log(`Missing title: ${missing.title}`);
console.log(`Missing year: ${missing.year}`);
console.log(`Missing location: ${missing.location}`);
console.log(`Missing date: ${missing.date}`);
