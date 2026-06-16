import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CSV_PATH = process.argv[2] || 'C:/Users/AndersEriksson/Downloads/events-dates-filled (1).csv';
const TODAY = '2026-06-07';
const LAST_UPDATED = '7 June 2026';
const TARGET_STATUSES = new Set(['expected', 'season']);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (ch === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }
  if (field || row.length) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }
  const headers = rows.shift() || [];
  return rows
    .filter((values) => values.some((value) => String(value || '').trim()))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
}

function escRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function htmlEscape(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function addDays(iso, days) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function addYears(iso, years) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCFullYear(date.getUTCFullYear() + years);
  return date.toISOString().slice(0, 10);
}

function effectiveRecord(row) {
  let start = row.start;
  let end = row.end;
  let yearsAdded = 0;
  while (start && start < TODAY) {
    start = addYears(start, 1);
    end = addYears(end, 1);
    yearsAdded += 1;
  }
  const dateNote = yearsAdded
    ? `${row.dateNote || 'Expected date; verify official source.'} Rolled forward ${yearsAdded} year${yearsAdded === 1 ? '' : 's'} because the original indicated start date has passed.`
    : row.dateNote;
  return { ...row, originalStart: row.start, originalEnd: row.end, start, end, yearsAdded, dateNote };
}

function parseIso(iso) {
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parts(iso) {
  const date = parseIso(iso);
  return {
    day: date.getUTCDate(),
    month: months[date.getUTCMonth()],
    monthIndex: date.getUTCMonth(),
    year: date.getUTCFullYear()
  };
}

function displayRange(start, end) {
  if (!start || !end) return 'Date TBA';
  const a = parts(start);
  const b = parts(end);
  if (start === end) return `${a.day} ${a.month} ${a.year}`;
  if (a.year === b.year && a.monthIndex === b.monthIndex) return `${a.day}-${b.day} ${a.month} ${a.year}`;
  if (a.year === b.year) return `${a.day} ${a.month} - ${b.day} ${b.month} ${a.year}`;
  return `${a.day} ${a.month} ${a.year} - ${b.day} ${b.month} ${b.year}`;
}

function normalizeStatus(status) {
  return status === 'season' ? 'expected season' : 'expected';
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function findEventPage(slug) {
  const matches = walk(path.join(ROOT, 'content', 'categories')).filter((file) => {
    return file.endsWith(`${path.sep}${slug}.html`);
  });
  return matches[0] || '';
}

function cardLocationSuffix(existing) {
  const text = String(existing || '').trim();
  const hyphen = text.match(/\s-\s(.+)$/);
  if (!hyphen) return '';
  const suffix = hyphen[1].trim();
  if (/^(expected|official date tbc|date tbc|tbc|verify|global)$/i.test(suffix)) return '';
  if (/expected|official date tbc|date tbc|tbc/i.test(suffix)) return '';
  return suffix;
}

function updateIndex(records) {
  const file = path.join(ROOT, 'content', 'events', 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  let updated = 0;

  for (const record of records) {
    const slug = record.slug;
    const display = `${displayRange(record.start, record.end)} - ${normalizeStatus(record.dateStatus)}`;
    const re = /<a class="event-card"[\s\S]*?<\/a>/g;
    html = html.replace(re, (card) => {
      if (!new RegExp(`href="[^"]*${escRegExp(slug)}\\.html"`).test(card)) return card;
      let next = card;
      if (/\sdata-start="[^"]*"/.test(next)) next = next.replace(/\sdata-start="[^"]*"/, ` data-start="${record.start}"`);
      else next = next.replace('<a class="event-card"', `<a class="event-card" data-start="${record.start}"`);
      if (/\sdata-end="[^"]*"/.test(next)) next = next.replace(/\sdata-end="[^"]*"/, ` data-end="${record.end}"`);
      else next = next.replace('<a class="event-card"', `<a class="event-card" data-end="${record.end}"`);
      if (/\sdata-date-status="[^"]*"/.test(next)) next = next.replace(/\sdata-date-status="[^"]*"/, ' data-date-status="estimated"');
      else next = next.replace('<a class="event-card"', '<a class="event-card" data-date-status="estimated"');
      if (/\sdata-official-date="[^"]*"/.test(next)) next = next.replace(/\sdata-official-date="[^"]*"/, ' data-official-date="false"');
      else next = next.replace('<a class="event-card"', '<a class="event-card" data-official-date="false"');
      next = next.replace(/<span class="card-meta">([^<]*)<\/span>/, (_m, existing) => {
        const suffix = cardLocationSuffix(existing);
        return `<span class="card-meta">${htmlEscape(display)}${suffix ? ` - ${htmlEscape(suffix)}` : ''}</span>`;
      });
      if (next !== card) updated += 1;
      return next;
    });
  }

  fs.writeFileSync(file, html, 'utf8');
  return updated;
}

function updateStatusFlags(recordsBySlug) {
  const file = path.join(ROOT, 'content', 'events', 'event-status-flags.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  let updated = 0;
  data.generatedAt = `${TODAY}T00:00:00.000Z`;
  data.asOf = TODAY;
  for (const event of data.events || []) {
    const record = recordsBySlug.get(event.slug);
    if (!record) continue;
    event.officialDateSet = false;
    event.dateStatus = 'estimated';
    event.dateCertaintyLabel = record.dateStatus === 'season' ? 'Expected season' : 'Expected date';
    event.displayedDate = record.start === record.end ? record.start : `${record.start} - ${record.end}`;
    event.dateNote = `${record.dateNote || 'Expected date; verify official source.'} Display as ${normalizeStatus(record.dateStatus)} until confirmed.`;
    event.sourceStatus = record.dateStatus === 'season' ? 'csv-season-date-filled' : 'csv-expected-date-filled';
    updated += 1;
  }
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return updated;
}

function updateDateNotSet(recordsBySlug) {
  const file = path.join(ROOT, 'events-date-not-set.csv');
  if (!fs.existsSync(file)) return 0;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const before = lines.length;
  const kept = lines.filter((line, index) => {
    if (index === 0 || !line.trim()) return true;
    const slug = line.match(/^"([^"]+)"/)?.[1];
    return !recordsBySlug.has(slug);
  });
  fs.writeFileSync(file, kept.join('\n').replace(/\n*$/, '\n'), 'utf8');
  return before - kept.length;
}

function updateJsonScript(html, record, display) {
  const match = html.match(/<script type="application\/json" id="event-year-data">([\s\S]*?)<\/script>/);
  if (!match) return { html, changed: false };
  let data;
  try {
    data = JSON.parse(match[1]);
  } catch {
    return { html, changed: false };
  }
  const year = Number(record.start.slice(0, 4));
  const endExclusive = addDays(record.end, 1);
  const isPast = endExclusive <= TODAY;
  data.defaultYear = year;
  data.lastUpdated = LAST_UPDATED;
  const editions = Array.isArray(data.editions) ? data.editions : [];
  let edition = editions.find((item) => Number(item.year) === year);
  if (!edition) {
    const base = editions[0] ? JSON.parse(JSON.stringify(editions[0])) : { year };
    edition = { ...base, year };
    editions.unshift(edition);
    data.editions = editions;
  }
  edition.status = isPast ? 'past' : 'upcoming';
  edition.statusLabel = record.dateStatus === 'season' ? 'Expected season' : 'Expected';
  edition.startDate = record.start;
  edition.endExclusive = endExclusive;
  edition.nextDate = edition.nextDate || '';
  edition.dates = display;
  edition.countdownText = `${record.dateNote || 'Expected date; verify official source.'} This date is expected, not confirmed.`;
  edition.countdownLabel = isPast ? 'Expected date passed' : 'Event starts';
  edition.calendarDescription = `${data.eventName || record.title} ${year}: ${display}.`;
  if (Array.isArray(edition.questions)) {
    for (const question of edition.questions) {
      if (/when is the event/i.test(question.q || '')) {
        question.a = display;
        question.detail = `${record.dateNote || 'Expected date; verify official source.'} Treat as expected until an official date is confirmed.`;
      }
    }
  }
  for (const other of editions) {
    if (Number(other.year) === year || other.startDate) continue;
    if (other.dates === display) {
      other.dates = Number(other.year) > year ? `${other.year} date TBC` : 'Archive details TBC';
    }
    if (String(other.countdownText || '').startsWith(display)) {
      other.countdownText = Number(other.year) > year
        ? 'Exact dates are TBC; check the official organiser before travel.'
        : 'Archive details TBC.';
    }
    if (data.eventName && other.calendarDescription && !String(other.calendarDescription).includes(`${other.year}`)) {
      other.calendarDescription = `${data.eventName} ${other.year}.`;
    }
    if (Array.isArray(other.questions)) {
      for (const question of other.questions) {
        if (/when is the event/i.test(question.q || '') && question.a === display) {
          question.a = Number(other.year) > year ? `${other.year} date TBC` : 'Archive details TBC';
        }
        if (/what is new this year/i.test(question.q || '') && data.eventName) {
          question.a = `${data.eventName} ${other.year} planning page`;
        }
      }
    }
  }
  const nextScript = `<script type="application/json" id="event-year-data">${JSON.stringify(data)}</script>`;
  return { html: html.replace(match[0], nextScript), changed: true };
}

function replaceStaticEventText(html, record, display) {
  const note = record.dateNote || 'Expected date; verify official source.';
  let next = html;
  next = next.replace(/2027 date TBC/g, display);
  next = next.replace(/Exact dates are TBC; check the official organiser before travel\./g, `${display}. ${note}`);
  next = next.replace(/Official organiser listing TBC/g, `Expected date indication: ${htmlEscape(note)} Last updated: ${LAST_UPDATED}.`);
  next = next.replace(/<strong>Watchlist<\/strong>/g, `<strong>${record.dateStatus === 'season' ? 'Expected season' : 'Expected'}</strong>`);
  next = next.replace(/<strong>Date TBC<\/strong>/g, `<strong>${htmlEscape(display)}</strong>`);
  next = next.replace(/<strong>Venue TBC<\/strong>/g, '<strong>Venue TBC</strong>');
  next = next.replace(/<strong>2027<\/strong>/g, `<strong>${record.start.slice(0, 4)}</strong>`);
  return next;
}

function updatePage(record) {
  const file = findEventPage(record.slug);
  if (!file) return { found: false, changed: false };
  const display = `${displayRange(record.start, record.end)} - ${normalizeStatus(record.dateStatus)}`;
  const year = record.start.slice(0, 4);
  let html = fs.readFileSync(file, 'utf8');
  const original = html;
  const jsonResult = updateJsonScript(html, record, display);
  html = jsonResult.html;
  const jsonScripts = [];
  html = html.replace(/<script type="application\/json" id="event-year-data">[\s\S]*?<\/script>/g, (script) => {
    const token = `__EVENT_YEAR_DATA_${jsonScripts.length}__`;
    jsonScripts.push(script);
    return token;
  });
  html = html.replace(new RegExp(`${escRegExp(record.title)} 2027`, 'g'), `${record.title} ${year}`);
  html = html.replace(new RegExp(`${escRegExp(record.title)} 2026`, 'g'), `${record.title} ${year}`);
  html = html.replace(/2027 overview: dates/g, `${year} overview: dates`);
  html = html.replace(/2026 overview: dates/g, `${year} overview: dates`);
  html = replaceStaticEventText(html, record, display);
  html = html.replace(/__EVENT_YEAR_DATA_(\d+)__/g, (_match, index) => jsonScripts[Number(index)]);
  html = html.replace(/Last updated: 1 June 2026/g, `Last updated: ${LAST_UPDATED}`);
  if (html !== original) fs.writeFileSync(file, html, 'utf8');
  return { found: true, changed: html !== original };
}

const records = parseCsv(fs.readFileSync(CSV_PATH, 'utf8'))
  .filter((row) => TARGET_STATUSES.has(row.dateStatus) && row.start && row.end)
  .map(effectiveRecord);

const recordsBySlug = new Map(records.map((record) => [record.slug, record]));
const indexUpdated = updateIndex(records);
const flagsUpdated = updateStatusFlags(recordsBySlug);
const removedFromWatchlist = updateDateNotSet(recordsBySlug);
let pagesFound = 0;
let pagesChanged = 0;
for (const record of records) {
  const result = updatePage(record);
  if (result.found) pagesFound += 1;
  if (result.changed) pagesChanged += 1;
}

console.log(JSON.stringify({
  source: CSV_PATH,
  records: records.length,
  indexUpdated,
  flagsUpdated,
  removedFromWatchlist,
  pagesFound,
  pagesChanged
}, null, 2));
