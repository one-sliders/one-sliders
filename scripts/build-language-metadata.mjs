import fs from 'node:fs/promises';
import path from 'node:path';
import posixPath from 'node:path/posix';

const siteOrigin = 'https://one-sliders.com';
const registryPath = path.resolve('content/page-registry.json');
const registry = JSON.parse(await fs.readFile(registryPath, 'utf8'));
const generatedContentPagePattern = /^\/?[a-z]{2,3}\/content\/[^/]+\/\d{4}\/\d{2}\/[^/]+\.html$/;
const generatedIndexPagePattern = /^\/?[a-z]{2,3}\/content\/[^/]+\/index\.html$/;
const forbiddenLocalizedFilenamePattern = /\.[a-z]{2}\.html$/;

const languageLabels = {
  en: ['EN', 'English'],
  no: ['NO', 'Norwegian'],
  sv: ['SV', 'Swedish'],
  da: ['DA', 'Danish'],
  de: ['DE', 'German'],
  fr: ['FR', 'French'],
  ru: ['RU', 'Russian'],
  es: ['ES', 'Spanish'],
  pt: ['PT', 'Portuguese'],
  zh: ['ZH', 'Mandarin Chinese'],
  ar: ['AR', 'Arabic'],
  hi: ['HI', 'Hindi'],
  sw: ['SW', 'Swahili'],
  ha: ['HA', 'Hausa'],
  tpi: ['TP', 'Tok Pisin'],
  mi: ['MI', 'Maori'],
  qu: ['QU', 'Quechua']
};

function esc(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeSitePath(value) {
  return `/${String(value).replace(/^\/+/, '').replace(/\\/g, '/')}`;
}

function fsPath(sitePath) {
  return path.resolve(normalizeSitePath(sitePath).slice(1));
}

function absoluteUrl(sitePath) {
  return `${siteOrigin}${normalizeSitePath(sitePath)}`;
}

function relativeHref(fromSitePath, toSitePath) {
  const fromDir = posixPath.dirname(normalizeSitePath(fromSitePath));
  const target = normalizeSitePath(toSitePath);
  const relative = posixPath.relative(fromDir, target);
  return relative || posixPath.basename(target);
}

function publishedSiblings(record) {
  return registry
    .filter((item) => item.content_id === record.content_id && item.translation_status === 'published');
}

function validateRecordPath(record) {
  const normalized = normalizeSitePath(record.path);
  const expected = `/${record.language}/content/`;

  if (!normalized.startsWith(expected)) {
    throw new Error(`Invalid multilingual path for ${record.content_id}/${record.language}: ${record.path}. Expected /${record.language}/content/...`);
  }

  if (forbiddenLocalizedFilenamePattern.test(posixPath.basename(normalized))) {
    throw new Error(`Invalid localized filename for ${record.content_id}/${record.language}: ${record.path}. Use language folders, not .${record.language}.html filenames.`);
  }

  if (!generatedContentPagePattern.test(normalized) && !generatedIndexPagePattern.test(normalized)) {
    throw new Error(`Invalid generated content page path for ${record.content_id}/${record.language}: ${record.path}. Expected /{language}/content/{type}/{year}/{month}/{slug}.html or /{language}/content/{type}/index.html`);
  }
}

function languageHead(record, siblings) {
  const fallback = siblings.find((item) => item.language === 'en') || siblings[0];
  return [
    `  <link rel="canonical" href="${absoluteUrl(record.path)}">`,
    `  <meta name="content-id" content="${esc(record.content_id)}">`,
    `  <meta name="content-language" content="${esc(record.language)}">`,
    `  <meta name="available-languages" content="${siblings.map((item) => item.language).join(',')}">`,
    `  <link rel="alternate" hreflang="x-default" href="${absoluteUrl(fallback.path)}">`,
    ...siblings.map((item) => `  <link rel="alternate" hreflang="${esc(item.language)}" href="${absoluteUrl(item.path)}">`)
  ].join('\n');
}

function languageSwitcher(record, siblings) {
  const links = siblings.map((item) => {
    const [shortLabel, fullLabel] = languageLabels[item.language] || [item.language.toUpperCase(), item.language.toUpperCase()];
    const current = item.language === record.language ? ' aria-current="true"' : '';
    return `      <a${current} href="${relativeHref(record.path, item.path)}" title="${esc(fullLabel)}" aria-label="${esc(fullLabel)}" lang="${esc(item.language)}">${esc(shortLabel)}</a>`;
  }).join('\n');

  return `<div class="event-language-list" aria-label="Available languages">
      <span>Languages</span>
${links}
    </div>`;
}

function updateHead(html, record, siblings) {
  const head = languageHead(record, siblings);
  let updated = html.replace(/<html lang="[^"]*">/, `<html lang="${esc(record.language)}">`);

  const existingBlock = /  <link rel="canonical" href="[^"]+">[\s\S]*?(?=\n  <meta name="theme-color"|  <meta name="theme-color")/;

  if (existingBlock.test(updated)) {
    updated = updated.replace(existingBlock, head);
  } else {
    updated = updated.replace(/(<link rel="preload" as="image" href="[^"]+">)/, `$1\n${head}`);
  }

  const publicUrl = absoluteUrl(record.path);
  updated = updated.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${publicUrl}">`);

  if (/<meta name="twitter:url" content="[^"]*">/.test(updated)) {
    updated = updated.replace(/<meta name="twitter:url" content="[^"]*">/, `<meta name="twitter:url" content="${publicUrl}">`);
  }

  updated = updated.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (match, jsonText) => {
    try {
      const data = JSON.parse(jsonText);
      data.url = publicUrl;
      return `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`;
    } catch {
      return match;
    }
  });

  return updated;
}

function updateSwitcher(html, record, siblings) {
  const switcher = languageSwitcher(record, siblings);
  if (/<div class="event-language-list"[\s\S]*?<\/div>/.test(html)) {
    return html.replace(/<div class="event-language-list"[\s\S]*?<\/div>/, switcher);
  }
  return html.replace(/(<\/nav>)/, `    ${switcher}\n  $1`);
}

let updatedCount = 0;

for (const record of registry.filter((item) => item.translation_status === 'published')) {
  validateRecordPath(record);
  const siblings = publishedSiblings(record);
  const file = fsPath(record.path);
  let html = await fs.readFile(file, 'utf8');
  html = updateHead(html, record, siblings);
  html = updateSwitcher(html, record, siblings);
  await fs.writeFile(file, html, 'utf8');
  updatedCount += 1;
}

async function listHtmlFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(entries.map((entry) => {
      const fullPath = path.join(dir, entry.name);
      return entry.isDirectory() ? listHtmlFiles(fullPath) : [fullPath];
    }));
    return files.flat().filter((file) => file.endsWith('.html'));
  } catch {
    return [];
  }
}

const generatedRoots = [...new Set(registry.map((record) => record.language))];
const invalidGeneratedFiles = (await Promise.all(
  generatedRoots.map((language) => listHtmlFiles(path.resolve(language, 'content')))
)).flat().filter((file) => forbiddenLocalizedFilenamePattern.test(path.basename(file)));

if (invalidGeneratedFiles.length) {
  throw new Error(`Invalid generated localized filenames found:\n${invalidGeneratedFiles.map((file) => `- ${path.relative(process.cwd(), file)}`).join('\n')}`);
}

const sitemapEntries = [];
const seenContentIds = new Set();

for (const record of registry.filter((item) => item.translation_status === 'published')) {
  if (seenContentIds.has(record.content_id)) continue;
  seenContentIds.add(record.content_id);
  const siblings = publishedSiblings(record);
  const fallback = siblings.find((item) => item.language === 'en') || siblings[0];
  const alternateLinks = [
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(fallback.path)}"/>`,
    ...siblings.map((item) => `    <xhtml:link rel="alternate" hreflang="${esc(item.language)}" href="${absoluteUrl(item.path)}"/>`)
  ].join('\n');

  for (const sibling of siblings) {
    sitemapEntries.push(`  <url>
    <loc>${absoluteUrl(sibling.path)}</loc>
${alternateLinks}
  </url>`);
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapEntries.join('\n')}
</urlset>
`;

await fs.writeFile(path.resolve('sitemap.xml'), sitemap, 'utf8');

console.log(`Updated language metadata for ${updatedCount} pages from ${path.relative(process.cwd(), registryPath)}.`);
console.log(`Updated sitemap.xml with ${sitemapEntries.length} localized URLs.`);
