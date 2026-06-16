import fs from 'node:fs';
import path from 'node:path';
import { languages } from './event-language-profiles.mjs';

const root = process.cwd();
const slugs = [
  ['03', 'world-meteorological-day-2026'],
  ['04', 'earth-day-2026'],
  ['06', 'world-environment-day-2026'],
  ['06', 'world-oceans-day-2026'],
  ['06', 'atlantic-hurricane-season-2026'],
  ['09', 'world-cleanup-day-2026'],
  ['11', 'cop31-2026']
];
const attrRe = /\s(?:href|src)="([^"]+)"/g;
const missing = [];

for (const lang of languages) {
  for (const [month, slug] of slugs) {
    const file = path.join(root, lang, 'content', 'events', '2026', month, `${slug}.html`);
    if (!fs.existsSync(file)) {
      missing.push(`${path.relative(root, file)} -> page missing`);
      continue;
    }
    const html = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = attrRe.exec(html))) {
      const target = match[1];
      if (/^(https?:|mailto:|tel:|#)/.test(target)) continue;
      const clean = target.split('#')[0].split('?')[0];
      if (!clean) continue;
      const resolved = path.resolve(path.dirname(file), clean);
      if (!resolved.startsWith(root) || !fs.existsSync(resolved)) {
        missing.push(`${path.relative(root, file)} -> ${target}`);
      }
    }
  }
}

if (missing.length) {
  console.error(`Missing climate event links/assets: ${missing.length}`);
  console.error(missing.slice(0, 80).join('\n'));
  process.exit(1);
}

console.log(`Checked ${languages.length * slugs.length} climate event views. All internal links and assets resolve.`);
