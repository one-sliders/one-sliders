import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sportRoot = path.join(root, 'content/categories/sport');
const version = 'sport-current-modules-20260611';

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const changed = [];
for (const file of walk(sportRoot).filter((item) => item.endsWith('.html') && item.includes(`${path.sep}events${path.sep}`))) {
  const source = fs.readFileSync(file, 'utf8');
  const next = source.replace(/\/assets\/js\/events\.js\?v=[^"']+/g, `/assets/js/events.js?v=${version}`);
  if (next !== source) {
    fs.writeFileSync(file, next, 'utf8');
    changed.push(path.relative(root, file));
  }
}

console.log(JSON.stringify({ changed: changed.length, version, files: changed }, null, 2));
