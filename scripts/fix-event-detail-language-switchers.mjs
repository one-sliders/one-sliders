import fs from 'node:fs';
import path from 'node:path';
import { languages, profiles, codeLabel } from './event-language-profiles.mjs';

const nativeLanguageNames = {
  en: 'English',
  ar: 'العربية',
  sw: 'Kiswahili',
  ha: 'Hausa',
  zh: '中文',
  hi: 'हिन्दी',
  ru: 'Русский',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  pt: 'Português',
  qu: 'Quechua',
  tpi: 'Tok Pisin',
  mi: 'Māori'
};

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function eventRelativePath(file, lang) {
  return path.relative(path.join(lang, 'content/events'), file).replace(/\\/g, '/');
}

function switcherFor(lang, relativePath) {
  const profile = profiles[lang] || profiles.en;
  const links = languages
    .filter((code) => fs.existsSync(path.join(code, 'content/events', relativePath)))
    .map((code) => {
      const href = code === lang
        ? path.basename(relativePath)
        : `../../../../../${code}/content/events/${relativePath}`;
      return `      <a${code === lang ? ' aria-current="true"' : ''} href="${href}"><span class="language-code">${codeLabel(code)}</span><span class="language-name">${nativeLanguageNames[code] || codeLabel(code)}</span></a>`;
    })
    .join('\n');

  return `<div class="event-language-list" aria-label="${profile.labels.language}">
      <span>${profile.labels.language}</span>
${links}
    </div>`;
}

let patched = 0;
let inserted = 0;

for (const lang of languages) {
  for (const file of walk(path.join(lang, 'content/events')).filter((f) => f.endsWith('.html') && !f.endsWith(`${path.sep}index.html`))) {
    const relativePath = eventRelativePath(file, lang);
    let html = fs.readFileSync(file, 'utf8');
    const switcher = switcherFor(lang, relativePath);

    if (/<div class="event-language-list"[\s\S]*?<\/div>/.test(html)) {
      html = html.replace(/<div class="event-language-list"[\s\S]*?<\/div>/, switcher);
      patched++;
    } else if (/<\/nav>/.test(html)) {
      html = html.replace(/(<\/nav>)/, `    ${switcher}\n  $1`);
      inserted++;
    } else {
      html = html.replace(/(<body[^>]*>)/, `$1\n  ${switcher}`);
      inserted++;
    }

    fs.writeFileSync(file, html, 'utf8');
  }
}

console.log(`Updated language switchers on ${patched} pages; inserted ${inserted}.`);
