import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const maxExamples = Number.parseInt(process.argv.find((arg) => arg.startsWith('--max='))?.split('=')[1] ?? '80', 10);
const showProgress = process.argv.includes('--progress');

const servedRoots = [
  '404.html',
  'index.html',
  'privacy.html',
  'terms.html',
  'content',
  'ru',
].map((entry) => path.join(root, entry));

const htmlJsonExtensions = new Set(['.html', '.json']);
const brokenLinks = [];
const brokenAssets = [];
const suspiciousPaths = [];
const sitemapMissing = [];
const existsCache = new Map();

function rel(file) {
  return path.relative(root, file).replaceAll(path.sep, '/');
}

function normalizedPath(value) {
  const normalized = path.normalize(value);
  if (normalized === path.parse(normalized).root) return normalized;
  return normalized.replace(/[\\/]$/, '');
}

function walk(fileOrDir, files = []) {
  if (!fs.existsSync(fileOrDir)) return files;
  const stat = fs.statSync(fileOrDir);
  if (stat.isFile()) {
    if (htmlJsonExtensions.has(path.extname(fileOrDir).toLowerCase())) files.push(fileOrDir);
    return files;
  }
  for (const entry of fs.readdirSync(fileOrDir, { withFileTypes: true })) {
    const full = path.join(fileOrDir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile() && htmlJsonExtensions.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
  return files;
}

function exists(fileOrDir) {
  const normalized = normalizedPath(fileOrDir);
  if (existsCache.has(normalized)) return existsCache.get(normalized);
  const result = fs.existsSync(normalized);
  existsCache.set(normalized, result);
  return result;
}

function isIgnoredValue(value) {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith('#')) return true;
  if (/^(?:https?:)?\/\//i.test(trimmed)) return true;
  if (/^(?:mailto|tel|data|blob|javascript):/i.test(trimmed)) return true;
  if (trimmed.includes('${') || trimmed.includes("' +") || trimmed.includes('" +')) return true;
  if (trimmed.includes('{{') || trimmed.includes('}}')) return true;
  return false;
}

function stripUrlNoise(value) {
  return value.trim().split('#')[0].split('?')[0];
}

function resolveInternal(fromFile, rawValue) {
  const clean = stripUrlNoise(rawValue);
  if (!clean) return null;
  let absolute = clean.startsWith('/')
    ? path.join(root, clean.slice(1))
    : path.resolve(path.dirname(fromFile), clean);
  if (clean.endsWith('/') || !path.extname(clean)) absolute = path.join(absolute, 'index.html');
  absolute = normalizedPath(absolute);
  if (!absolute.startsWith(root)) return null;
  return absolute;
}

function classify(attribute, target) {
  if (attribute === 'href') return 'link';
  if (/\.(?:html?|json|xml|txt|ics)$/i.test(stripUrlNoise(target))) return 'link';
  return 'asset';
}

function recordMissing(file, attribute, target) {
  const resolved = resolveInternal(file, target);
  if (!resolved || exists(resolved)) return;
  const item = {
    file: rel(file),
    attribute,
    target,
    resolved: rel(resolved),
  };
  if (classify(attribute, target) === 'link') brokenLinks.push(item);
  else brokenAssets.push(item);
}

function extractSrcsetEntries(srcset) {
  return srcset
    .split(',')
    .map((part) => part.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function checkAttribute(file, attribute, value) {
  if (!isIgnoredValue(value)) recordMissing(file, attribute.toLowerCase(), value);
}

function checkFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes('categories/contentcategories')) {
    suspiciousPaths.push({ file: rel(file), pattern: 'categories/contentcategories' });
  }
  const markup = text.replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, '$1</script>');

  for (const match of markup.matchAll(/\b(href|src)\s*=\s*"([^"]*)"/gi)) {
    checkAttribute(file, match[1], match[2]);
  }

  for (const match of markup.matchAll(/\b(href|src)\s*=\s*'([^']*)'/gi)) {
    checkAttribute(file, match[1], match[2]);
  }

  for (const match of markup.matchAll(/\bsrcset\s*=\s*"([^"]*)"/gi)) {
    for (const value of extractSrcsetEntries(match[1])) {
      if (!isIgnoredValue(value)) recordMissing(file, 'srcset', value);
    }
  }

  for (const match of markup.matchAll(/\bsrcset\s*=\s*'([^']*)'/gi)) {
    for (const value of extractSrcsetEntries(match[1])) {
      if (!isIgnoredValue(value)) recordMissing(file, 'srcset', value);
    }
  }

  if (path.extname(file).toLowerCase() === '.json') {
    const jsonStringPattern = /"(href|src|image|url|path|canonical|eventPageEN)"\s*:\s*"([^"]*)"/g;
    for (const match of text.matchAll(jsonStringPattern)) {
      const [, attribute, value] = match;
      if (!isIgnoredValue(value)) recordMissing(file, attribute, value);
    }
  }
}

function checkSitemap() {
  const sitemap = path.join(root, 'sitemap.xml');
  if (!fs.existsSync(sitemap)) return;
  const text = fs.readFileSync(sitemap, 'utf8');
  for (const match of text.matchAll(/<loc>\s*(.*?)\s*<\/loc>/g)) {
    let loc = match[1].trim();
    try {
      const url = new URL(loc);
      loc = url.pathname;
    } catch {
      // Keep local paths as-is.
    }
    if (!loc.startsWith('/')) continue;
    const resolved = resolveInternal(sitemap, loc);
    if (resolved && !exists(resolved)) {
      sitemapMissing.push({ loc, resolved: rel(resolved) });
    }
  }
}

const files = servedRoots.flatMap((entry) => walk(entry)).sort((a, b) => rel(a).localeCompare(rel(b)));
files.forEach((file, index) => {
  if (showProgress && (index % 100 === 0 || index >= 2000)) console.error(`checking ${index + 1}/${files.length}: ${rel(file)}`);
  checkFile(file);
});
if (showProgress) console.error('checking sitemap.xml');
checkSitemap();

function printGroup(title, items, render) {
  console.log(`${title}: ${items.length}`);
  for (const item of items.slice(0, maxExamples)) console.log(`  - ${render(item)}`);
  if (items.length > maxExamples) console.log(`  ... ${items.length - maxExamples} more`);
}

console.log(`check-links: checked ${files.length} served html/json files.`);
printGroup('Broken page links', brokenLinks, (item) => `${item.file} ${item.attribute}="${item.target}" -> ${item.resolved}`);
printGroup('Broken assets', brokenAssets, (item) => `${item.file} ${item.attribute}="${item.target}" -> ${item.resolved}`);
printGroup('Suspicious duplicate paths', suspiciousPaths, (item) => `${item.file}: ${item.pattern}`);
printGroup('Missing sitemap targets', sitemapMissing, (item) => `${item.loc} -> ${item.resolved}`);

const failures = brokenLinks.length + brokenAssets.length + suspiciousPaths.length + sitemapMissing.length;
if (failures) process.exit(1);
