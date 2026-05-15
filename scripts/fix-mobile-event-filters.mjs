import fs from 'node:fs';
import path from 'node:path';
import { languages } from './event-language-profiles.mjs';

const root = process.cwd();
const marker = '/* mobile filter drawer fix */';
const css = `
    ${marker}
    @media (max-width: 768px) {
      .filters { max-height: calc(100svh - 44px); overflow-y: auto; overscroll-behavior: contain; }
      .filters:not(.open) > .filter-row,
      .filters:not(.open) > .filter-rows { display: none !important; }
      .filters.open > #location-row,
      .filters.open > #reach-row { display: flex; }
    }
`;

let count = 0;
for (const lang of languages) {
  const file = path.join(root, lang, 'content', 'events', 'index.html');
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes(marker)) {
    html = html.replace('</style>', `${css}</style>`);
  }
  fs.writeFileSync(file, html, 'utf8');
  count += 1;
}

console.log(`Patched mobile event filters in ${count} language indexes.`);
