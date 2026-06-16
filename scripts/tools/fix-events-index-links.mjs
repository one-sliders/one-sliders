import fs from 'node:fs';
import path from 'node:path';

const indexLanguages = ['en', 'ar', 'sw', 'ha', 'zh', 'hi', 'ru', 'de', 'fr', 'es', 'pt', 'qu', 'tpi', 'mi'];
const rootIndex = 'content/events/index.html';

function patchNav(html, isRoot) {
  if (isRoot) return html;
  return html
    .replaceAll('href="../locations/index.html"', 'href="../content/locations/index.html"')
    .replaceAll('href="../categories/index.html"', 'href="../content/categories/index.html"');
}

function patchCardLinks(html, file, language) {
  const dirname = path.dirname(file);
  const toBestEventHref = (eventPath) => {
    if (language && fs.existsSync(path.join(language, 'content/events', eventPath))) {
      const rel = path.relative(dirname, path.join(language, 'content/events', eventPath)).replace(/\\/g, '/');
      return rel.startsWith('..') ? rel : eventPath;
    }
    if (fs.existsSync(path.join('content/events', eventPath))) {
      const rel = path.relative(dirname, path.join('content/events', eventPath)).replace(/\\/g, '/');
      return rel;
    }
    const rootRel = path.relative(dirname, path.join('content/events', eventPath)).replace(/\\/g, '/');
    return rootRel;
  };

  return html
    .replace(/href="(?:\.\.\/){1,6}en\/content\/events\/((?:2026|2027|2028|2030)\/[^"]+\.html)"/g, (match, eventPath) => `href="${toBestEventHref(eventPath)}"`)
    .replace(/href="((?:2026|2027|2028|2030)\/[^"]+\.html)"/g, (match, eventPath) => `href="${toBestEventHref(eventPath)}"`);
}

function patchFile(file, language = '') {
  let html = fs.readFileSync(file, 'utf8');
  html = patchNav(html, file === rootIndex);
  html = patchCardLinks(html, file, language);
  fs.writeFileSync(file, html, 'utf8');
}

patchFile(rootIndex);

for (const language of indexLanguages) {
  const file = `${language}/content/events/index.html`;
  if (fs.existsSync(file)) patchFile(file, language);
}

console.log(`Patched event index links for ${indexLanguages.length + 1} index pages.`);
