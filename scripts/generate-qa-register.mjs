import fs from 'node:fs/promises';
import path from 'node:path';
import { localIsoDateTime } from './qa-register.mjs';

const root = process.cwd();
const outputFile = path.join(root, 'qa-register.json');

const excludedDirectories = new Set(['.git', 'node_modules']);
const htmlExtensions = new Set(['.html']);
const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif']);
const iconExtensions = new Set(['.svg', '.ico']);

function toRelativePath(filePath) {
  return path.relative(root, filePath).split(path.sep).join('/');
}

function isIconLike(relativePath, extension) {
  const normalized = relativePath.toLowerCase();
  const fileName = path.posix.basename(normalized);

  return (
    iconExtensions.has(extension) ||
    normalized.startsWith('assets/icons/') ||
    fileName.includes('favicon') ||
    fileName.includes('icon')
  );
}

function createRecord(filePath, type, lastQaAt) {
  const relativePath = toRelativePath(filePath);

  return {
    type,
    fileName: path.basename(filePath),
    path: relativePath,
    lastQaAt
  };
}

function oneYearBefore(date) {
  const previousYear = new Date(date);
  previousYear.setFullYear(previousYear.getFullYear() - 1);

  return previousYear;
}

async function readExistingQaDates() {
  try {
    const existing = JSON.parse(await fs.readFile(outputFile, 'utf8'));
    const dates = new Map();

    for (const section of ['html', 'images', 'icons']) {
      for (const record of existing[section] || []) {
        if (record?.type && record?.path && record?.lastQaAt) {
          dates.set(`${record.type}:${record.path}`, record.lastQaAt);
        }
      }
    }

    return dates;
  } catch (error) {
    if (error.code === 'ENOENT') return new Map();
    throw error;
  }
}

async function collectFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;

    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

const generatedAtDate = new Date();
const generatedAt = localIsoDateTime(generatedAtDate);
const defaultLastQaAt = localIsoDateTime(oneYearBefore(generatedAtDate));
const existingQaDates = await readExistingQaDates();
const files = await collectFiles(root);
const registry = {
  schemaVersion: 1,
  generatedAt,
  purpose: 'QA inventory for HTML files, image assets, and icon assets.',
  lastQaAtDefault: defaultLastQaAt,
  counts: {
    html: 0,
    images: 0,
    icons: 0,
    total: 0
  },
  html: [],
  images: [],
  icons: []
};

function preservedLastQaAt(type, relativePath) {
  return existingQaDates.get(`${type}:${relativePath}`) || defaultLastQaAt;
}

for (const file of files) {
  const extension = path.extname(file).toLowerCase();
  const relativePath = toRelativePath(file);

  if (htmlExtensions.has(extension)) {
    registry.html.push(createRecord(file, 'html', preservedLastQaAt('html', relativePath)));
  } else if (imageExtensions.has(extension) && isIconLike(relativePath, extension)) {
    registry.icons.push(createRecord(file, 'icon', preservedLastQaAt('icon', relativePath)));
  } else if (imageExtensions.has(extension)) {
    registry.images.push(createRecord(file, 'image', preservedLastQaAt('image', relativePath)));
  } else if (iconExtensions.has(extension)) {
    registry.icons.push(createRecord(file, 'icon', preservedLastQaAt('icon', relativePath)));
  }
}

for (const collection of [registry.html, registry.images, registry.icons]) {
  collection.sort((left, right) => left.path.localeCompare(right.path, 'en'));
}

registry.counts.html = registry.html.length;
registry.counts.images = registry.images.length;
registry.counts.icons = registry.icons.length;
registry.counts.total = registry.counts.html + registry.counts.images + registry.counts.icons;

await fs.writeFile(outputFile, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');

console.log(`Wrote ${toRelativePath(outputFile)} with ${registry.counts.total} QA records.`);
