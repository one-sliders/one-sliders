import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const topicPath = path.join(root, 'content/categories/culture/national-day.html');
const eventsDir = path.join(root, 'content/categories/culture/national-day/events');

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function existsFromUrl(url) {
  if (!url || /^https?:/i.test(url) || url === '#') return true;
  const local = url.startsWith('/') ? url.slice(1) : url;
  return fs.existsSync(path.join(root, local));
}

const topic = read(topicPath);
assert(!/<style\b|style=/i.test(topic), 'national-day.html contains inline CSS');
assert(!/\bTBC\b|\bTBD\b|Date missing|Country missing/.test(topic), 'national-day.html contains missing/TBC date or country text');
const topicCards = [...topic.matchAll(/<article class="event-card national-day-card"[\s\S]*?<\/article>/g)];
assert(topicCards.length === 52, `national-day.html has ${topicCards.length} national day cards, expected 52`);
for (const [index, match] of topicCards.entries()) {
  const card = match[0];
  assert(/<time datetime="\d{4}-\d{2}-\d{2}">[^<]*\d{4}<\/time>/.test(card), `topic card ${index + 1} lacks full dated time`);
  const country = card.match(/<a class="country" href="([^"]+)"><img src="([^"]+)"[^>]*>([^<]+)<\/a>/);
  assert(country, `topic card ${index + 1} lacks country flag link`);
  if (country) {
    const [, href, flag, label] = country;
    assert(existsFromUrl(href), `country page missing for ${label}: ${href}`);
    assert(existsFromUrl(flag), `flag missing for ${label}: ${flag}`);
    assert(flag.includes('/img/flag.svg'), `flag path is not canonical for ${label}: ${flag}`);
  }
}

for (const name of fs.readdirSync(eventsDir).filter((entry) => entry.endsWith('.html'))) {
  const file = path.join(eventsDir, name);
  const html = read(file);
  assert(!/<style\b|style=/i.test(html), `${name} contains inline CSS`);
  assert(!/\bTBC\b|\bTBD\b|Date missing|Country missing/.test(html), `${name} contains missing/TBC text`);
  assert(!/event-page--framed|event-page--non-sport|event-frame|data-non-sport-event-page/.test(html), `${name} still uses framed/non-sport layout`);
  assert(/<main class="event-carousel" data-carousel>/.test(html), `${name} lacks carousel main`);
  assert(/data-slide="general"/.test(html) && /data-slide="year"/.test(html), `${name} lacks required general/year slides`);
  assert(/data-year-switcher/.test(html) && /data-year-edition/.test(html), `${name} lacks year switcher hooks`);
  const dataMatch = html.match(/<script type="application\/json" id="event-year-data">([\s\S]*?)<\/script>/);
  assert(dataMatch, `${name} lacks event-year-data`);
  if (dataMatch) {
    const data = JSON.parse(dataMatch[1]);
    const edition = (data.editions || []).find((item) => String(item.year) === String(data.defaultYear)) || {};
    assert(edition.startDate && edition.dates, `${name} default edition lacks startDate/dates`);
    const country = (edition.countries || [])[0];
    assert(country && country.name && country.url && country.flag, `${name} default edition lacks country flag link data`);
    if (country) {
      assert(html.includes(`<img src="${country.flag}"`), `${name} rendered page lacks default country flag`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('National day pages validation passed.');
