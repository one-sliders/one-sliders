import fs from 'node:fs';
import path from 'node:path';
import { languages } from './event-language-profiles.mjs';

const root = process.cwd();
const climateSlugs = [
  'world-meteorological-day-2026',
  'earth-day-2026',
  'world-environment-day-2026',
  'world-oceans-day-2026',
  'atlantic-hurricane-season-2026',
  'world-cleanup-day-2026',
  'cop31-2026'
];

for (const lang of languages) {
  const file = path.join(root, lang, 'content', 'events', 'index.html');
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');

  if (!html.includes('--c-climate:')) {
    html = html.replace(/(--c-nature:\s*#[0-9a-fA-F]+;\s*)/, `$1\n      --c-climate:  #245f46;`);
  }
  if (!html.includes('data-cat="climate"].active')) {
    html = html.replace(/(\.filter-btn\[data-cat="nature"\]\.active\s*\{\s*background:\s*var\(--c-nature\);\s*\})/, `$1\n    .filter-btn[data-cat="climate"].active  { background: var(--c-climate); }`);
  }
  if (!html.includes('data-cat="climate">')) {
    html = html.replace(/(<button class="filter-btn" data-cat="nature">[^<]*<\/button>)/, `$1\n      <button class="filter-btn" data-cat="climate">Climate</button>`);
  }

  for (const slug of climateSlugs) {
    const cardRe = new RegExp(`(<a class="event-card"[^>]+href="2026/\\d{2}/${slug}\\.html"[^>]*>)`, 'g');
    html = html.replace(cardRe, (tag) => tag
      .replace(/data-cat="nature"/, 'data-cat="climate"')
      .replace(/style="--cat-color:var\(--c-nature\)"/, 'style="--cat-color:var(--c-climate)"'));
  }

  html = html.replace(/'wildlife':'Wildlife',(?!'weather')/, "'wildlife':'Wildlife','weather':'Climate weather','climate-action':'Climate action','marine':'Marine','sustainability':'Sustainability',");

  fs.writeFileSync(file, html, 'utf8');
}

console.log(`Fixed climate category filter in ${languages.length} event indexes.`);
