import fs from 'node:fs';
import path from 'node:path';

const sourceRoot = 'en/content/events';
const targetRoot = 'ru/content/events';
const lang = 'ru';
const siteBase = 'https://one-sliders.com';

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  });
}

function localizeHtml(html, relativePath) {
  const publicPath = `/${lang}/content/events/${relativePath.replace(/\\/g, '/')}`;
  let out = html
    .replace(/<html lang="[^"]*"/, `<html lang="${lang}"`)
    .replaceAll(`${siteBase}/en/content/events/`, `${siteBase}/${lang}/content/events/`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${siteBase}${publicPath}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${siteBase}${publicPath}$2`);

  out = out.replace(/("url"\s*:\s*")https:\/\/one-sliders\.com\/en\/content\/events\/[^"]*(")/g, `$1${siteBase}${publicPath}$2`);

  // Language-folder event detail pages sit one level deeper than root content.
  // Shared topic/location/category pages still live under /content, not /ru/content.
  out = out.replaceAll('href="../../../../content/', 'href="../../../../../content/');

  return out;
}

let created = 0;
let copiedAssets = 0;

for (const source of walk(sourceRoot)) {
  const relative = path.relative(sourceRoot, source);
  if (relative === 'index.html') continue;
  if (!/\.(html|ics)$/i.test(relative)) continue;

  const target = path.join(targetRoot, relative);
  if (fs.existsSync(target)) continue;

  fs.mkdirSync(path.dirname(target), { recursive: true });

  if (/\.html$/i.test(relative)) {
    const html = fs.readFileSync(source, 'utf8');
    fs.writeFileSync(target, localizeHtml(html, relative), 'utf8');
    created++;
  } else {
    fs.copyFileSync(source, target);
    copiedAssets++;
  }
}

console.log(`Created ${created} RU event pages and copied ${copiedAssets} calendar files.`);
