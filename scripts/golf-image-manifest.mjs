import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const eventsDir = path.join(root, 'content/categories/sport/golf/events');

function titleCase(slug) {
  return slug.split('-').map((part) => {
    if (part === 'pga' || part === 'lpga' || part === 'liv' || part === 'us') return part.toUpperCase();
    if (part === 'at' || part === 'and' || part === 'of' || part === 'in') return part;
    return part.charAt(0).toUpperCase() + part.slice(1);
  }).join(' ');
}

function extractJson(html) {
  const match = html.match(/<script type="application\/json" id="event-year-data">([\s\S]*?)<\/script>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function courseStyle(title, venue, city) {
  const text = `${title} ${venue} ${city}`.toLowerCase();
  if (/open championship|aig|scottish|royal|links|scotland|st andrews|troon|muirfield|carnoustie|portrush|lancashire|liverpool/.test(text)) return 'windswept coastal links course, firm fescue turf, pot bunkers, dunes and low seaside light';
  if (/pebble|hawaii|kapalua|sony|puerto rico|bermuda|riviera maya|punta|bay|ocean|coast|island|singapore|hong kong|adelaide/.test(text)) return 'coastal resort course, ocean air, palms, bright water hazards and sculpted seaside greens';
  if (/phoenix|arizona|american express|las vegas|utah|mexico|riyadh|desert|texas/.test(text)) return 'desert golf course, arid mountains, sandy waste areas, bright sun and sharp desert shadows';
  if (/augusta|masters/.test(text)) return 'immaculate spring major course with azaleas, towering pines, white bunkers and rolling emerald fairways';
  if (/frisco|pga|valhalla|oak hill|quail hollow|memorial|muirfield village|east lake|arnold palmer|bay hill|sawgrass|players|genesis|riviera|bmw|fedex|traveler|rbc heritage|harbour town/.test(text)) return 'championship parkland course, mature trees, deep bunkers, water hazards and manicured tournament fairways';
  if (/lpga|women|evian|annika|founders|shoprite|meijer|kroger|walmart|lotte|maybank|honda|toto|bmw ladies|buick|blue bay|ford championship|fm championship/.test(text)) return 'elite LPGA tournament course, clean fairways, gallery ropes, polished greens and calm championship atmosphere';
  if (/liv/.test(text)) return 'modern LIV golf tournament course, shotgun-start energy, bold gallery atmosphere and dramatic stadium-style holes';
  return 'professional tournament golf course, distinctive fairways, bunkers, water and spectator ropes';
}

const items = fs.readdirSync(eventsDir)
  .filter((name) => name.endsWith('.html'))
  .sort()
  .map((name) => {
    const slug = name.replace(/\.html$/, '');
    const html = fs.readFileSync(path.join(eventsDir, name), 'utf8');
    const data = extractJson(html);
    const edition = data?.editions?.find((entry) => entry.year === data.defaultYear) || data?.editions?.at(-1) || {};
    const title = data?.eventName || titleCase(slug);
    const venue = edition.venue || 'golf course TBC';
    const city = edition.cities?.[0]?.name || edition.headingPlace?.replace(/^in\s+/i, '') || '';
    const country = edition.countries?.[0]?.name || '';
    return {
      slug,
      title,
      venue,
      city,
      country,
      style: courseStyle(title, venue, city),
      hero: `content/categories/sport/golf/events/img/${slug}-hero.png`,
      mini: `content/categories/sport/golf/events/img/${slug}-mini.png`
    };
  });

fs.writeFileSync('tmp/golf-image-manifest.json', JSON.stringify(items, null, 2), 'utf8');
console.log(`Wrote ${items.length} golf image prompts to tmp/golf-image-manifest.json`);
