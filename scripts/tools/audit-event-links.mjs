import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outFile = path.join(root, 'tmp', 'event-link-counts.csv');
const eventRoots = [
  path.join(root, 'content', 'categories'),
  path.join(root, 'en', 'content', 'categories'),
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (
      entry.isFile()
      && entry.name.endsWith('.html')
      && full.replaceAll(path.sep, '/').includes('/events/')
      && !entry.name.startsWith('index.')
    ) {
      files.push(full);
    }
  }
  return files;
}

function rel(file) {
  return path.relative(root, file).replaceAll(path.sep, '/');
}

function csv(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function isExternal(href) {
  if (/^(?:mailto|tel|javascript|data|blob):/i.test(href)) return false;
  if (href.startsWith('//')) return true;
  if (!/^https?:\/\//i.test(href)) return false;
  try {
    const url = new URL(href);
    return url.hostname !== 'one-sliders.com' && url.hostname !== 'www.one-sliders.com';
  } catch {
    return false;
  }
}

function normalizedHref(href) {
  return href.trim().replace(/[?#].*$/, '');
}

function extractStaticAnchorHrefs(html) {
  const hrefs = [];
  for (const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1[^>]*>/gis)) {
    const href = match[2]?.trim();
    if (href) hrefs.push(href);
  }
  return hrefs;
}

function extractEscapedAnchorHrefs(html) {
  const hrefs = [];
  for (const match of html.matchAll(/<a\b[^>]*\bhref\s*=\\(["'])(.*?)\\\1[^>]*>/gis)) {
    const href = match[2]?.trim();
    if (href) hrefs.push(href);
  }
  return hrefs;
}

function countLinks(file) {
  const html = fs.readFileSync(file, 'utf8');
  const staticHrefs = extractStaticAnchorHrefs(html);
  const embeddedHrefs = extractEscapedAnchorHrefs(html);
  const hrefs = [...staticHrefs, ...embeddedHrefs];
  const unique = new Set(hrefs.map(normalizedHref).filter(Boolean));
  const external = hrefs.filter(isExternal).length;
  const fragmentOnly = hrefs.filter((href) => href.trim().startsWith('#')).length;
  return {
    file: rel(file),
    static: staticHrefs.length,
    embedded: embeddedHrefs.length,
    total: hrefs.length,
    unique: unique.size,
    internal: hrefs.length - external,
    external,
    fragmentOnly,
  };
}

const files = eventRoots.flatMap((dir) => walk(dir)).sort((a, b) => rel(a).localeCompare(rel(b)));
const seen = new Set();
const rows = [];
for (const file of files) {
  const key = rel(file);
  if (seen.has(key)) continue;
  seen.add(key);
  rows.push(countLinks(file));
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(
  outFile,
  [
    ['event_file', 'static_a_links', 'embedded_renderable_a_links', 'total_a_links', 'unique_hrefs', 'internal_links', 'external_links', 'fragment_only_links'].map(csv).join(','),
    ...rows.map((row) => [row.file, row.static, row.embedded, row.total, row.unique, row.internal, row.external, row.fragmentOnly].map(csv).join(',')),
  ].join('\n') + '\n',
  'utf8',
);

const totals = rows.reduce((acc, row) => {
  acc.total += row.total;
  acc.unique += row.unique;
  acc.external += row.external;
  return acc;
}, { total: 0, unique: 0, external: 0 });

const lowCounts = rows.filter((row) => row.total < 3).length;
console.log(JSON.stringify({
  events: rows.length,
  totalLinks: totals.total,
  averageLinksPerEvent: rows.length ? Number((totals.total / rows.length).toFixed(2)) : 0,
  lowCountEvents: lowCounts,
  outFile: rel(outFile),
}, null, 2));
