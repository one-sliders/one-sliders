import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const topicPath = path.join(root, 'content/categories/culture/awards.html');
const eventsDir = path.join(root, 'content/categories/culture/awards/events');

const awards = [
  {
    slug: 'golden-globe-awards',
    title: 'Golden Globe Awards',
    date: '2027-01-10',
    label: '10 Jan 2027',
    status: 'confirmed',
    next2028: '9 Jan 2028 expected'
  },
  {
    slug: 'grammy-awards',
    title: 'Grammy Awards',
    date: '2027-02-07',
    label: '7 Feb 2027',
    status: 'confirmed',
    next2028: '2028 date TBC'
  },
  {
    slug: 'bafta-film-awards',
    title: 'BAFTA Film Awards',
    date: '2027-02-21',
    label: '21 Feb 2027 expected',
    status: 'estimated',
    next2028: '2028 date TBC'
  },
  {
    slug: 'cesar-awards',
    title: 'Cesar Awards',
    date: '2027-02-25',
    label: '25 Feb 2027',
    status: 'confirmed',
    next2028: '2028 date TBC'
  },
  {
    slug: 'brit-awards',
    title: 'Brit Awards',
    date: '2027-02-28',
    label: '28 Feb 2027 expected',
    status: 'estimated',
    next2028: '2028 date TBC'
  },
  {
    slug: 'oscars',
    title: 'Oscars',
    date: '2027-03-14',
    label: '14 Mar 2027',
    status: 'confirmed',
    next2028: '5 Mar 2028'
  },
  {
    slug: 'tony-awards',
    title: 'Tony Awards',
    date: '2027-06-13',
    label: '13 Jun 2027 expected',
    status: 'estimated',
    next2028: '2028 date TBC'
  },
  {
    slug: 'bet-awards',
    title: 'BET Awards',
    date: '2026-06-28',
    label: '28 Jun 2026',
    status: 'confirmed',
    next2028: '2027 date TBC'
  },
  {
    slug: 'emmy-awards',
    title: 'Emmy Awards',
    date: '2026-09-14',
    label: '14 Sep 2026',
    status: 'confirmed',
    next2028: '2027 date TBC'
  },
  {
    slug: 'mtv-video-music-awards',
    title: 'MTV Video Music Awards',
    date: '2026-09-29',
    label: '29 Sep 2026',
    status: 'confirmed',
    next2028: '2027 date TBC'
  }
];

function card(entry) {
  const official = entry.status === 'confirmed' ? 'true' : 'false';
  return `            <a class="event-card" data-start="${entry.date}" data-end="${entry.date}" data-date-status="${entry.status}" data-official-date="${official}" data-next-edition="${entry.next2028}" href="/content/categories/culture/awards/events/${entry.slug}.html"><img src="/content/categories/culture/awards/events/img/${entry.slug}-mini.png" alt="${entry.title} thumbnail" loading="lazy" width="400" height="300"><time>${entry.label}</time><strong>${entry.title}</strong></a>`;
}

function replaceTopicGrid() {
  let source = fs.readFileSync(topicPath, 'utf8');
  const start = source.indexOf('          <div class="event-grid" aria-label="Featured award events">');
  if (start === -1) throw new Error('event-grid start not found');
  const end = source.indexOf('          </div>', start);
  if (end === -1) throw new Error('event-grid end not found');
  const next = [
    '          <div class="event-grid" aria-label="Featured award events">',
    ...awards.map(card),
    '          </div>'
  ].join('\n');
  source = source.slice(0, start) + next + source.slice(end + '          </div>'.length);
  fs.writeFileSync(topicPath, source, 'utf8');
}

function patchFile(slug, replacements) {
  const file = path.join(eventsDir, `${slug}.html`);
  let source = fs.readFileSync(file, 'utf8');
  for (const [from, to] of replacements) {
    if (!source.includes(from)) {
      throw new Error(`${slug}: missing text: ${from}`);
    }
    source = source.replaceAll(from, to);
  }
  fs.writeFileSync(file, source, 'utf8');
}

replaceTopicGrid();

patchFile('bafta-film-awards', [
  ['<div class="fact"><span>Next edition</span><strong>2027 date TBC</strong></div>', '<div class="fact"><span>Next edition</span><strong>21 Feb 2027 expected</strong></div>'],
  ['<p>2027 date TBC in London. Data checked against BAFTA heritage.</p>', '<p>21 Feb 2027 expected in London. Treat as a planning date until BAFTA publishes the official 2027 ceremony timetable.</p>']
]);

patchFile('tony-awards', [
  ['<div class="fact"><span>Next edition</span><strong>2027 watchlist</strong></div>', '<div class="fact"><span>Next edition</span><strong>13 Jun 2027 expected</strong></div>'],
  ['<p>2027 watchlist in New York City. Data checked against Britannica Tony Awards.</p>', '<p>13 Jun 2027 expected in New York City, based on the Tony Awards June ceremony pattern after the completed 2026 edition.</p>']
]);

patchFile('brit-awards', [
  ['<div class="fact"><span>Next edition</span><strong>2027 watchlist</strong></div>', '<div class="fact"><span>Next edition</span><strong>28 Feb 2027 expected</strong></div>'],
  ['<div class="fact"><span>Venue</span><strong>Venue TBC</strong></div>', '<div class="fact"><span>Venue</span><strong>Co-op Live</strong></div>'],
  ['<div class="fact"><span>City</span><strong>London</strong></div>', '<div class="fact"><span>City</span><strong>Manchester</strong></div>'],
  ['<p>2027 watchlist in London. Data checked against BRITs 2025 winners.</p>', '<p>28 Feb 2027 expected at Co-op Live, Manchester. The venue is confirmed for the BRIT Awards in 2027; the date remains a planning estimate until officially published.</p>']
]);

console.log(JSON.stringify({
  topicCards: awards.length,
  patchedPages: ['bafta-film-awards', 'tony-awards', 'brit-awards']
}, null, 2));
