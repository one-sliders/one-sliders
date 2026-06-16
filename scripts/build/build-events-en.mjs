import fs from 'node:fs';
import path from 'node:path';

const root = 'content/events';
const targetRoot = 'content/events';

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  });
}

function fixEventHtml(html, sourceFile) {
  const sourceDir = path.dirname(sourceFile).replace(/\\/g, '/');
  return html
    .replaceAll('../../../../assets/', '../../../../../assets/')
    .replaceAll('../../../categories/', '../content/categories/')
    .replaceAll('../../../locations/', '../content/locations/')
    .replace(/(src|href)="img\/([^"]+)"/g, `$1="../../../../../${sourceDir}/img/$2"`)
    .replace(/<link rel="canonical" href="https:\/\/one-sliders\.com\/content\/events\/([^"]+)">/g, '<link rel="canonical" href="https://one-sliders.com/content/events/$1">')
    .replace(/<meta property="og:url" content="https:\/\/one-sliders\.com\/content\/events\/([^"]+)">/g, '<meta property="og:url" content="https://one-sliders.com/content/events/$1">');
}

let count = 0;

for (const source of walk(root)) {
  if (!source.endsWith('.html')) continue;
  if (source.includes('.before-')) continue;
  if (path.basename(source) === 'index.html') continue;

  const relative = path.relative(root, source);
  const target = path.join(targetRoot, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, fixEventHtml(fs.readFileSync(source, 'utf8'), source), 'utf8');
  count += 1;
}

console.log(`Generated ${count} English event views in ${targetRoot}.`);
