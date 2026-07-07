import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const mode = process.argv.find((arg) => arg.startsWith('--mode='))?.split('=')[1] ?? 'dev';
const checkOnly = process.argv.includes('--check');
const contentRoot = mode === 'dev' ? path.join(root, 'Dev', 'content') : path.join(root, 'content');

const canonicalLinks = [
  ['/content/categories/culture/national-day/index.html', '/content/categories/culture/national-day.html'],
  ['/content/categories/sport/golf/index.html', '/content/categories/sport/golf.html'],
  ['/content/categories/sport/football/index.html', '/content/categories/sport/football.html'],
  ['/content/categories/culture/awards/index.html', '/content/categories/culture/awards.html'],
  ['/content/categories/culture/music.html', '/content/categories/music/index.html'],
  ['/content/categories/culture/music-festivals.html', '/content/categories/music/music-festivals.html'],
  ['/content/categories/culture/music-festivals/events/coachella.html', '/content/categories/music/music-festivals/events/coachella.html'],
  ['/content/categories/culture/music-festivals/events/fuji-rock-festival.html', '/content/categories/music/music-festivals/events/fuji-rock-festival.html'],
  ['/content/categories/culture/music-festivals/events/primavera-sound-barcelona.html', '/content/categories/music/rock/events/primavera-sound-barcelona.html'],
  ['/content/categories/culture/music-festivals/events/roskilde-festival.html', '/content/categories/music/music-festivals/events/roskilde-festival.html'],
  ['/content/categories/culture/music-festivals/events/tomorrowland.html', '/content/categories/music/music-festivals/events/tomorrowland.html'],
  ['/content/categories/culture/music-festivals/events/ultra-music-festival.html', '/content/categories/music/music-festivals/events/ultra-music-festival.html'],
  ['/content/categories/culture/music/events/mawazine-festival.html', '/content/categories/music/world-music/events/mawazine-rabat.html'],
  ['/content/categories/culture/music/events/montreux-jazz-festival.html', '/content/categories/music/music-festivals/events/montreux-jazz-festival.html'],
  ['/content/categories/culture/music/events/north-sea-jazz-festival.html', '/content/categories/music/jazz/events/north-sea-jazz-festival.html'],
  ['/content/categories/culture/music/events/roskilde-festival.html', '/content/categories/music/music-festivals/events/roskilde-festival.html'],
  ['/content/categories/music/song-contests/events/eurovision-grand-final.html', '/content/categories/music/song-contests/events/eurovision-song-contest.html'],
  ['/content/categories/music/song-contests/events/eurovision-semi-final-1.html', '/content/categories/music/song-contests/events/eurovision-song-contest.html'],
  ['/content/categories/music/song-contests/events/eurovision-semi-final-2.html', '/content/categories/music/song-contests/events/eurovision-song-contest.html'],
  ['/content/privacy.html', '/privacy.html'],
  ['/content/events/2026/06/fifa-world-cup-2026.html', '/content/categories/sport/football/events/fifa-world-cup.html'],
  ['/content/categories/culture/national-day/events/oslo-constitution-day.html', '/content/categories/culture/national-day/events/norwegian-constitution-day.html'],
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && /\.(?:html|json)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

function replacementsFor(from, to) {
  const variants = [
    [from, to],
    [`https://one-sliders.com${from}`, `https://one-sliders.com${to}`],
    [`/Dev${from}`, `/Dev${to}`],
    [`/dev${from}`, `/dev${to}`],
  ];
  return variants;
}

function normalizeInternalLinks(text) {
  let next = text;
  for (const [from, to] of canonicalLinks) {
    for (const [variantFrom, variantTo] of replacementsFor(from, to)) {
      next = next.split(variantFrom).join(variantTo);
    }
  }
  next = next.replace(
    /(?:\.\.\/)+events\/2026\/06\/fifa-world-cup-2026\.html/g,
    '/content/categories/sport/football/events/fifa-world-cup.html'
  );
  return next;
}

const files = walk(contentRoot);
let changed = 0;

for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  const after = normalizeInternalLinks(before);
  if (after !== before) {
    changed++;
    if (!checkOnly) fs.writeFileSync(file, after, 'utf8');
  }
}

console.log(`fix-v3-internal-links: checked ${files.length} files; ${checkOnly ? 'would change' : 'changed'} ${changed}.`);
if (checkOnly && changed) process.exit(1);
