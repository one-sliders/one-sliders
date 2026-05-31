import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const defaultRegistryPath = path.join(root, 'qa-register.json');
const sections = ['html', 'images', 'icons'];

export function now() {
  return new Date();
}

export function localIsoDateTime(date = now()) {
  const parsedDate = date instanceof Date ? date : new Date(date);
  const offsetMinutes = -parsedDate.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absoluteOffset = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absoluteOffset / 60)).padStart(2, '0');
  const offsetRemainder = String(absoluteOffset % 60).padStart(2, '0');
  const localDate = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000);

  return `${localDate.toISOString().slice(0, 19)}${sign}${offsetHours}:${offsetRemainder}`;
}

function registryPathFromOptions(options = {}) {
  return options.registryPath ? path.resolve(options.registryPath) : defaultRegistryPath;
}

function normalizeFileName(fileName) {
  if (!fileName || typeof fileName !== 'string') {
    throw new Error('filename must be a non-empty string.');
  }

  const relativePath = path.isAbsolute(fileName) ? path.relative(root, fileName) : fileName;

  return relativePath
    .replaceAll('\\', '/')
    .replace(/^\.\//, '')
    .replace(/^\/+/, '');
}

async function readRegistry(options = {}) {
  return JSON.parse(await fs.readFile(registryPathFromOptions(options), 'utf8'));
}

async function writeRegistry(registry, options = {}) {
  await fs.writeFile(registryPathFromOptions(options), `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
}

function findRecord(registry, fileName) {
  const normalized = normalizeFileName(fileName);
  const lowerNormalized = normalized.toLowerCase();
  const baseName = path.posix.basename(lowerNormalized);
  const allRecords = [];

  for (const section of sections) {
    for (const record of registry[section] || []) {
      allRecords.push({ section, record });
    }
  }

  const exactMatch = allRecords.find(({ record }) => record.path.toLowerCase() === lowerNormalized);
  if (exactMatch) return exactMatch;

  const fileNameMatches = allRecords.filter(({ record }) => record.fileName.toLowerCase() === baseName);

  if (fileNameMatches.length === 1) return fileNameMatches[0];
  if (fileNameMatches.length > 1) {
    const examples = fileNameMatches.slice(0, 5).map(({ record }) => record.path).join(', ');
    throw new Error(`Ambiguous filename "${fileName}". Use a full registry path. Matches include: ${examples}`);
  }

  throw new Error(`File not found in QA register: ${fileName}`);
}

function timestampMs(value) {
  const parsed = value instanceof Date ? value.getTime() : Date.parse(value);
  if (Number.isNaN(parsed)) throw new Error(`Invalid date value: ${value}`);

  return parsed;
}

export async function funcQANeeded(fileName, nowValue = now(), options = {}) {
  const registry = await readRegistry(options);
  const { record } = findRecord(registry, fileName);

  return timestampMs(record.lastQaAt) < timestampMs(nowValue);
}

export async function funcQADone(fileName, nowValue = now(), options = {}) {
  const registry = await readRegistry(options);
  const { record } = findRecord(registry, fileName);

  record.lastQaAt = localIsoDateTime(nowValue);
  await writeRegistry(registry, options);

  return record;
}
