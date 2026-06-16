import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outPath = path.join(root, 'scripts/data/usa-stay-cities.real.json');
const imageDir = path.join(root, 'content/locations/north-america/usa/img/source');

const pages = [
  ['new-york', 'New York City'],
  ['las-vegas', 'Las Vegas'],
  ['orlando', 'Orlando, Florida'],
  ['miami', 'Miami'],
  ['los-angeles', 'Los Angeles'],
  ['san-francisco', 'San Francisco'],
  ['honolulu', 'Honolulu'],
  ['new-orleans', 'New Orleans'],
  ['nashville', 'Nashville, Tennessee'],
  ['chicago', 'Chicago'],
  ['boston', 'Boston'],
  ['seattle', 'Seattle'],
  ['austin', 'Austin, Texas'],
  ['augusta', 'Augusta, Georgia'],
  ['black-rock-city', 'Black Rock City'],
  ['charleston', 'Charleston, South Carolina'],
  ['savannah', 'Savannah, Georgia'],
  ['santa-fe', 'Santa Fe, New Mexico'],
  ['portland-maine', 'Portland, Maine'],
  ['newport', 'Newport, Rhode Island'],
  ['newtown-square', 'Newtown Square, Pennsylvania'],
  ['aspen', 'Aspen, Colorado'],
  ['jackson', 'Jackson, Wyoming'],
  ['southampton', 'Southampton, New York'],
  ['east-hampton', 'East Hampton (town), New York'],
  ['montauk', 'Montauk, New York'],
  ['sedona', 'Sedona, Arizona'],
  ['key-west', 'Key West'],
  ['washington-dc', 'Washington, D.C.']
];

function apiTitle(title) {
  return encodeURIComponent(title.replace(/ /g, '_'));
}

function extFromMime(mime) {
  if (/jpeg|jpg/i.test(mime)) return '.jpg';
  if (/png/i.test(mime)) return '.png';
  if (/webp/i.test(mime)) return '.webp';
  return '.img';
}

async function getJson(url) {
  let response;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    response = await fetch(url, {
      headers: {
        'User-Agent': 'OneSliders city page asset updater (local build)'
      }
    });
    if (response.ok) break;
    if (response.status !== 429 || attempt === 5) break;
    await sleep(3000 * attempt);
  }
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

async function download(url, fileBase) {
  url = absoluteUrl(url);
  const existing = await existingDownload(fileBase);
  if (existing) return existing;
  let response;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    response = await fetch(url, {
      headers: {
        'User-Agent': 'OneSliders city page asset updater (local build)'
      }
    });
    if (response.ok) break;
    if (response.status === 429 && attempt === 2) {
      url = smallerWikimediaThumb(url);
    }
    if (response.status !== 429 || attempt === 4) break;
    await sleep(1500 * attempt);
  }
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  const mime = response.headers.get('content-type') || '';
  const ext = extFromMime(mime);
  const file = path.join(imageDir, `${fileBase}${ext}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  await fs.writeFile(file, bytes);
  return { file: path.relative(root, file).replaceAll('\\', '/'), mime, bytes: bytes.length };
}

function smallerWikimediaThumb(url) {
  if (!url.includes('upload.wikimedia.org') || !url.includes('/thumb/')) return url;
  return url.replace(/\/\d+px-([^/]+)$/i, '/640px-$1');
}

function absoluteUrl(url) {
  return String(url).startsWith('//') ? `https:${url}` : String(url);
}

async function existingDownload(fileBase) {
  for (const ext of ['.jpg', '.jpeg', '.png', '.webp']) {
    const file = path.join(imageDir, `${fileBase}${ext}`);
    try {
      const stat = await fs.stat(file);
      return {
        file: path.relative(root, file).replaceAll('\\', '/'),
        mime: ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg',
        bytes: stat.size
      };
    } catch {}
  }
  return null;
}

function widthFromUrl(url) {
  const match = String(url).match(/\/(\d+)px-[^/]+$/i);
  return match ? Number(match[1]) : 0;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function imageCandidate(summary, media) {
  const pageLead = (media.items || []).find((item) => item.type === 'image' && (item.srcset || item.thumbnail || item.original));
  const candidates = [];
  for (const src of pageLead?.srcset || []) {
    candidates.push({ source: absoluteUrl(src.src), width: Number(src.width) || widthFromUrl(src.src) });
  }
  if (pageLead?.thumbnail?.source) {
    candidates.push({ source: pageLead.thumbnail.source, width: Number(pageLead.thumbnail.width) || 0 });
  }
  if (summary.thumbnail?.source) {
    candidates.push({ source: summary.thumbnail.source, width: Number(summary.thumbnail.width) || 0 });
  }
  if (summary.originalimage?.source) {
    candidates.push({ source: summary.originalimage.source, width: Number(summary.originalimage.width) || 0 });
  }
  candidates.sort((a, b) => {
    const aScore = a.width >= 1200 && a.width <= 2200 ? Math.abs(a.width - 1600) : a.width > 2200 ? 5000 + a.width : 10000 - a.width;
    const bScore = b.width >= 1200 && b.width <= 2200 ? Math.abs(b.width - 1600) : b.width > 2200 ? 5000 + b.width : 10000 - b.width;
    return aScore - bScore;
  });
  return {
    url: candidates[0]?.source,
    meta: pageLead
  };
}

async function fetchCity([slug, title]) {
  const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${apiTitle(title)}`;
  const mediaUrl = `https://en.wikipedia.org/api/rest_v1/page/media-list/${apiTitle(title)}`;
  const summary = await getJson(summaryUrl);
  const media = await getJson(mediaUrl);
  const leadImage = imageCandidate(summary, media);
  if (!leadImage.url) throw new Error(`No lead image for ${title}`);
  const downloaded = await download(leadImage.url, slug);
  const imageMeta = leadImage.meta;
  return {
    slug,
    title,
    wikipediaTitle: summary.title,
    description: summary.description || '',
    extract: summary.extract || '',
    coordinates: summary.coordinates || null,
    contentUrl: summary.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${apiTitle(title)}`,
    image: {
      sourceUrl: leadImage.url,
      localSource: downloaded.file,
      mime: downloaded.mime,
      bytes: downloaded.bytes,
      caption: imageMeta?.title || summary.title,
      credit: imageMeta?.artist?.html || imageMeta?.credit?.html || '',
      license: imageMeta?.license?.type || imageMeta?.license?.code || '',
      licenseUrl: imageMeta?.license?.url || ''
    }
  };
}

async function main() {
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.mkdir(imageDir, { recursive: true });
  const results = [];
  for (const page of pages) {
    const result = await fetchCity(page);
    results.push(result);
    console.log(`${result.slug}: ${result.wikipediaTitle} (${result.image.bytes} bytes)`);
    await sleep(4000);
  }
  await fs.writeFile(outPath, `${JSON.stringify({ fetchedAt: new Date().toISOString(), cities: results }, null, 2)}\n`);
  console.log(`Wrote ${path.relative(root, outPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
