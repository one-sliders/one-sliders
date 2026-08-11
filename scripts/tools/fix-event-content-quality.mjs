import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const write = process.argv.includes('--write');
const eventsRoot = path.join(ROOT, 'content', 'categories');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith('.html') && full.includes(`${path.sep}events${path.sep}`)) out.push(full);
  }
  return out;
}

function clean(value) {
  return String(value ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function titleFromHtml(html, file) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const schemaName = html.match(/"@type"\s*:\s*"Event"[\s\S]*?"name"\s*:\s*"([^"]+)"/i)?.[1];
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return clean(h1 || schemaName || title || path.basename(file, '.html'))
    .replace(/\s+20\d{2}\s+[-–—].*$/i, '')
    .replace(/\s+[-–—]\s+Dates.*$/i, '')
    .replace(/\s+\|\s+.*$/i, '');
}

function locationFromHtml(html) {
  const schemaLocation = html.match(/"location"\s*:\s*\{[\s\S]*?"name"\s*:\s*"([^"]+)"/i)?.[1];
  const factVenue = html.match(/<span>Venue<\/span>\s*<strong>([\s\S]*?)<\/strong>/i)?.[1];
  const factPlace = html.match(/<span>(?:City|Location|Place)<\/span>\s*<strong>([\s\S]*?)<\/strong>/i)?.[1];
  return clean(schemaLocation || factVenue || factPlace).replace(/^TBC$/i, '');
}

function replacementDescription(title, location) {
  return location ? `${title}: venue, dates and visitor planning for ${location}.` : `${title}: dates, venue notes and visitor planning.`;
}

function escapeJson(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function escapeAttr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fixHtml(html, file) {
  const title = titleFromHtml(html, file);
  const location = locationFromHtml(html);
  const desc = replacementDescription(title, location);
  let next = html;

  next = next.replace(/\s+-\s+at a glance\./gi, '.');
  next = next.replace(/\s+—\s+at a glance\./gi, '.');
  next = next.replace(/\s+&#x2014;\s+at a glance\./gi, '.');
  next = next.replace(/\bat a glance\b/gi, 'planning notes');
  next = next.replace(/\btravel context\b/gi, 'visitor planning');
  next = next.replace(/\bcalendar moments\b/gi, 'event listings');
  next = next.replace(/More event families and event listings\./g, 'More related event pages.');
  next = next.replace(/More majors, courses and event listings\./g, 'More majors, courses and tournament pages.');
  next = next.replace(/<p id="overview-title" class="event-panel-title">What to know before ([^<]+)<\/p>/g, '<p id="overview-title" class="event-panel-title">$1 planning notes</p>');
  next = next.replace(/<strong>What should I book early\?<\/strong>/g, '<strong>What should I confirm before booking?</strong>');
  next = next.replace(/Ticket windows and access conditions can change by edition\./g, 'Check the official event page for ticket windows and access conditions before booking.');
  next = next.replace(/Tickets, central accommodation and timed-entry experiences are usually the first things to verify\./g, 'Confirm tickets, accommodation location and timed-entry experiences before booking.');
  next = next.replace(/Book spa treatments, limited classes, retreat packages or hotel wellness programmes directly with the venue\./g, 'Confirm spa treatments, limited classes, retreat packages or hotel wellness programmes directly with the venue.');
  next = next.replace(/<p class="event-visit-intro">Base yourself in <strong>([\s\S]*?)<\/strong> for ([\s\S]*?)\. Hotels near the course fill up quickly during tournament week [—-] book early\.<\/p>/g, '<p class="event-visit-intro">Use <strong>$1</strong> as the first stay area for $2 when course access and event timing matter.</p>');
  next = next.replace(/<p class="event-visit-body">Search for flights to the nearest international airport serving <strong>([^<]+)<\/strong>\. Taxis, rideshare and rental cars are the most convenient options to reach the course from the airport\.<\/p>/g, '<p class="event-visit-body">Use <strong>$1</strong> as the arrival anchor, then compare airport transfers, parking and course access before choosing where to stay.</p>');
  next = next.replace(/("description"\s*:\s*")[^"]*(?:planning notes|visitor planning|venue notes|where to stay|overview: dates)[^"]*(")/gi, `$1${escapeJson(desc)}$2`);
  next = next.replace(/(<meta\s+(?:name|property)="(?:description|og:description|twitter:description)"\s+content=")[^"]*(")/gi, `$1${escapeAttr(desc)}$2`);
  next = next.replace(/(<p class="hero-text">)[^<]*(?:visitor planning|overview: dates|venue notes)[^<]*(<\/p>)/gi, `$1${desc}$2`);

  return next;
}

const changes = [];
for (const file of walk(eventsRoot)) {
  const before = fs.readFileSync(file, 'utf8');
  if (!/(Base yourself in|Taxis, rideshare|Search for flights to the nearest|at a glance|What to know before|book early|travel context|calendar moments)/i.test(before)) continue;
  const after = fixHtml(before, file);
  if (after === before) continue;
  changes.push(path.relative(ROOT, file).replace(/\\/g, '/'));
  if (write) fs.writeFileSync(file, after, 'utf8');
}

console.log(`${write ? 'Updated' : 'Would update'} ${changes.length} event pages.`);
for (const item of changes.slice(0, 40)) console.log(`- ${item}`);
if (changes.length > 40) console.log(`... ${changes.length - 40} more`);
