import fs from 'node:fs';
import path from 'node:path';
import { languages } from './event-language-profiles.mjs';

const root = process.cwd();
const categoriesRoot = path.join(root, 'content', 'categories');
const leafPages = [];

for (const category of fs.readdirSync(categoriesRoot)) {
  const categoryDir = path.join(categoriesRoot, category);
  if (!fs.statSync(categoryDir).isDirectory() || category === 'img') continue;
  for (const file of fs.readdirSync(categoryDir)) {
    if (file.endsWith('.html') && file !== 'index.html') {
      for (const lang of languages) {
        leafPages.push(path.join(root, lang, 'content', 'categories', category, file));
      }
    }
  }
}

const missing = [];
const attrRe = /\s(?:href|src)="([^"]+)"/g;

for (const file of leafPages) {
  if (!fs.existsSync(file)) {
    missing.push({ file, target: '(page missing)' });
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
      missing.push({ file, target });
    }
  }
}

if (missing.length) {
  console.error(`Missing internal links/assets: ${missing.length}`);
  for (const item of missing.slice(0, 80)) {
    console.error(`${path.relative(root, item.file)} -> ${item.target}`);
  }
  process.exit(1);
}

console.log(`Checked ${leafPages.length} topic pages. All internal links and assets resolve.`);
