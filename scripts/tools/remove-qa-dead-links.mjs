import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checkOnly = process.argv.includes('--check');
const contentRoot = path.join(root, 'content');

const datedEventLinks = [
  '/content/events/2026/05/hajj-2026.html',
  '/content/events/2026/09/asian-games-2026.html',
  '/content/events/2026/10/diwali-2026.html',
  '/content/events/2026/05/canada-grand-prix.html',
];

const datedEventSuffixes = datedEventLinks.map((link) => link.replace(/^\/content\//, ''));

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

function isDatedEventHref(value) {
  const text = String(value || '').replace(/\\/g, '/');
  return datedEventLinks.some((link) => text.endsWith(link))
    || datedEventSuffixes.some((suffix) => text.endsWith(suffix));
}

function pruneJson(value) {
  if (Array.isArray(value)) {
    return value
      .filter((item) => !(item && typeof item === 'object' && isDatedEventHref(item.href || item.url || item.path)))
      .map(pruneJson);
  }
  if (value && typeof value === 'object') {
    const next = {};
    for (const [key, child] of Object.entries(value)) next[key] = pruneJson(child);
    return next;
  }
  return value;
}

function pruneHtml(text) {
  let next = text;
  for (const link of datedEventLinks) {
    const escaped = link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    next = next.replace(new RegExp(`<a\\b[^>]*href=["']${escaped}["'][\\s\\S]*?<\\/a>`, 'g'), '');
  }
  next = next.replace(/<div class="country-paths country-paths--events"[^>]*>\s*<\/div>/g, '<div class="country-paths country-paths--events"></div>');
  next = next.replace(/<div class="country-paths country-paths--events" data-expiring-events>\s*<\/div>/g, '<div class="country-paths country-paths--events" data-expiring-events></div>');
  return next;
}

let changed = 0;

for (const file of walk(contentRoot)) {
  const before = fs.readFileSync(file, 'utf8');
  const parseable = before.replace(/^\uFEFF/, '');
  let after = before;

  if (file.endsWith('page-registry.json')) {
    const data = JSON.parse(parseable);
    after = `${JSON.stringify(data.filter((item) => !(item.content_id === 'events-index' && item.language !== 'en')), null, 2)}\n`;
  } else if (file.endsWith('.json')) {
    after = `${JSON.stringify(pruneJson(JSON.parse(parseable)), null, 2)}\n`;
  } else if (file.endsWith('.html')) {
    after = pruneHtml(before);
  }

  if (after !== before) {
    changed += 1;
    if (!checkOnly) fs.writeFileSync(file, after);
  }
}

console.log(`remove-qa-dead-links: checked content; ${checkOnly ? 'would change' : 'changed'} ${changed}.`);
if (checkOnly && changed) process.exit(1);
