import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const locationsRoot = path.join(root, 'content', 'locations');
const python = process.env.CODEX_PYTHON || 'C:\\Users\\AndersEriksson\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe';

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function relParts(file) {
  return path.relative(locationsRoot, file).split(path.sep);
}

function titleFromSlug(slug) {
  return slug.split('-').map((part) => {
    if (!part) return part;
    if (part === 'usa') return 'USA';
    return part[0].toUpperCase() + part.slice(1);
  }).join(' ');
}

const hashScript = [
  'from PIL import Image, ImageOps',
  'from pathlib import Path',
  'import json',
  'import sys',
  'import warnings',
  'warnings.filterwarnings("ignore")',
  'def ahash(p):',
  '    im = Image.open(p).convert("RGB")',
  '    im = ImageOps.fit(im, (8,8))',
  '    im = im.convert("L")',
  '    vals = list(im.getdata())',
  '    avg = sum(vals) / len(vals)',
  '    return "".join("1" if v >= avg else "0" for v in vals)',
  'print(json.dumps({str(Path(p)): ahash(Path(p)) for p in sys.argv[1:]}))',
].join('\n');

const hashCache = new Map();
function loadHashes(files) {
  const missing = [...new Set(files.filter((file) => file && fs.existsSync(file) && !hashCache.has(file)))];
  const batchSize = 120;
  for (let i = 0; i < missing.length; i += batchSize) {
    const batch = missing.slice(i, i + batchSize);
    const hashes = JSON.parse(execFileSync(python, ['-c', hashScript, ...batch], {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 20,
    }));
    for (const [file, hash] of Object.entries(hashes)) hashCache.set(file, hash);
  }
}

function imageHash(file) {
  if (!file || !fs.existsSync(file)) return '';
  return hashCache.get(file);
}

function hamming(a, b) {
  if (!a || !b || a.length !== b.length) return 64;
  let distance = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) distance++;
  return distance;
}

function imageCandidatesForCity(cityFile, citySlug) {
  const [continentSlug, countrySlug] = relParts(cityFile);
  const cityDir = path.dirname(cityFile);
  const countryImgDir = path.join(locationsRoot, continentSlug, countrySlug, 'img');
  return [
    path.join(cityDir, 'img', `${citySlug}-hero.png`),
    path.join(cityDir, 'img', `${citySlug}-mini.png`),
    path.join(countryImgDir, `${countrySlug}-hero.png`),
    path.join(countryImgDir, `${countrySlug}-mini.png`),
  ];
}

function isCountryFallback(cityFile, citySlug) {
  const [continentSlug, countrySlug] = relParts(cityFile);
  const cityDir = path.dirname(cityFile);
  const countryImgDir = path.join(locationsRoot, continentSlug, countrySlug, 'img');
  const cityImages = [
    path.join(cityDir, 'img', `${citySlug}-hero.png`),
    path.join(cityDir, 'img', `${citySlug}-mini.png`),
  ];
  const countryImages = [
    path.join(countryImgDir, `${countrySlug}-hero.png`),
    path.join(countryImgDir, `${countrySlug}-mini.png`),
  ].filter((file) => fs.existsSync(file));
  if (!cityImages.every((file) => fs.existsSync(file))) return true;
  if (!countryImages.length) return false;
  return cityImages.some((cityImage) => countryImages.some((countryImage) => {
    return hamming(imageHash(cityImage), imageHash(countryImage)) <= 4;
  }));
}

const rows = [];
const filesToHash = [];
for (const file of walk(locationsRoot).filter((item) => item.endsWith('.html'))) {
  const parts = relParts(file);
  if (parts.length !== 3 || parts[2] === 'index.html') continue;
  const [continent, country, cityFile] = parts;
  const citySlug = cityFile.replace(/\.html$/i, '');
  filesToHash.push(...imageCandidatesForCity(file, citySlug));
  rows.push({
    continent,
    country,
    citySlug,
    name: titleFromSlug(citySlug),
    path: path.relative(root, file).replace(/\\/g, '/'),
    needsImage: isCountryFallback(file, citySlug),
  });
}

loadHashes(filesToHash);

const missing = rows.filter((row) => row.needsImage);
const byCountry = (items) => Object.entries(items.reduce((acc, row) => {
  const key = `${row.continent}/${row.country}`;
  (acc[key] ||= []).push({ slug: row.citySlug, name: row.name, path: row.path });
  return acc;
}, {})).map(([countryPath, cities]) => ({ countryPath, count: cities.length, cities }));

console.log(JSON.stringify({
  totalCityPages: rows.length,
  totalNeedingImages: missing.length,
  europeNeedingImages: missing.filter((row) => row.continent === 'europe').length,
  usaNeedingImages: missing.filter((row) => row.continent === 'north-america' && row.country === 'usa').length,
  europeByCountry: byCountry(missing.filter((row) => row.continent === 'europe')),
  usaByCountry: byCountry(missing.filter((row) => row.continent === 'north-america' && row.country === 'usa')),
}, null, 2));
