import fs from 'node:fs';
import path from 'node:path';
import { languages as languageCodes, languageNames, codeLabel } from './event-language-profiles.mjs';

const slug = 'events-index';
const contentId = 'events-index';
const source = 'content/events/index.html';
const languages = languageCodes.map((code) => [code, languageNames[code] || code]);
const localizedOsloEventLanguages = new Set(languageCodes);

function sitePath(language) {
  return `/${language}/content/events/index.html`;
}

function relativeToRootAssets(html) {
  return html
    .replace(/href="(?:\.\.\/\.\.\/en\/content\/events\/2026\/05\/oslo-constitution-day\.html|2026\/05\/oslo-constitution-day\.html)"(?= data-start="2026-05-17")/g, 'href="2026/05/oslo-constitution-day.html"')
    .replace(/src="((?:2026|2027|2028|2030)\/[^"]+)"/g, 'src="../content/events/$1"')
    .replaceAll('../../assets/', '../../../assets/')
    .replaceAll('href="../events/index.html"', 'href="index.html"')
    .replaceAll('href="../locations/index.html"', 'href="../locations/index.html"')
    .replaceAll('href="../categories/index.html"', 'href="../categories/index.html"');
}

function addIndexMetadata(html, language) {
  let updated = html.replace(/<html lang="[^"]*">/, `<html lang="${language}">`);
  updated = updated.replace(/<title>[^<]+<\/title>/, '<title>World Events Calendar | OneSliders</title>');

  const description = 'Browse major world events by month, category, region and reach on OneSliders.';
  const headBlock = `  <link rel="canonical" href="https://one-sliders.com${sitePath(language)}">
  <meta name="content-id" content="${contentId}">
  <meta name="content-language" content="${language}">
  <meta name="available-languages" content="${languageCodes.join(',')}">
  <link rel="alternate" hreflang="x-default" href="https://one-sliders.com/content/events/index.html">
${languages.map(([code]) => `  <link rel="alternate" hreflang="${code}" href="https://one-sliders.com${sitePath(code)}">`).join('\n')}
  <meta name="description" content="${description}">
  <meta property="og:title" content="World Events Calendar | OneSliders">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="https://one-sliders.com${sitePath(language)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="World Events Calendar | OneSliders">
  <meta name="twitter:description" content="${description}">`;

  if (/<link rel="canonical" href="[^"]+">/.test(updated)) {
    updated = updated.replace(/  <link rel="canonical" href="[^"]+">[\s\S]*?(?=\n\s*<meta name="theme-color"|<title>)/, headBlock);
  } else {
    updated = updated.replace(/(\s*<meta name="theme-color" content="[^"]+">)/, `${headBlock}\n$1`);
  }

  const switcher = `<div class="event-language-list" aria-label="Available languages">
      <span>Language</span>
${languages.map(([code, label]) => `      <a${code === language ? ' aria-current="true"' : ''} title="${label}" aria-label="${label}" href="../../../${code}/content/events/index.html">${codeLabel(code)}</a>`).join('\n')}
    </div>`;

  if (/<div class="event-language-list"[\s\S]*?<\/div>/.test(updated)) {
    updated = updated.replace(/<div class="event-language-list"[\s\S]*?<\/div>/, switcher);
  } else {
    updated = updated.replace(/(\s*<a class="year-link" href="2026\/index\.html">2026<\/a>)/, `$1\n      ${switcher}`);
  }

  const osloHref = localizedOsloEventLanguages.has(language)
    ? '2026/05/oslo-constitution-day.html'
    : '../content/events/2026/05/oslo-constitution-day.html';
  updated = updated.replace(/href="2026\/05\/oslo-constitution-day\.html"(?= data-start="2026-05-17")/g, `href="${osloHref}"`);

  return updated;
}

const sourceHtml = fs.readFileSync(source, 'utf8');
const registry = JSON.parse(fs.readFileSync('content/page-registry.json', 'utf8'));
const withoutIndex = registry.filter((record) => record.content_id !== contentId);
const indexRecords = [];

for (const [language] of languages) {
  const target = path.join(language, 'content/events/index.html');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, addIndexMetadata(relativeToRootAssets(sourceHtml), language), 'utf8');
  indexRecords.push({
    content_id: contentId,
    language,
    slug,
    title: 'World Events Calendar',
    meta_description: 'Browse major world events by month, category, region and reach on OneSliders.',
    path: sitePath(language),
    translation_status: 'published'
  });
}

fs.writeFileSync('content/page-registry.json', `${JSON.stringify([...withoutIndex, ...indexRecords], null, 2)}\n`, 'utf8');

console.log(`Generated events index for ${languages.length} languages.`);

await import('./translate-events-index-all.mjs');
await import('./fix-events-index-links.mjs');
