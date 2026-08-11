import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const mode = process.argv.find((arg) => arg.startsWith('--mode='))?.split('=')[1] ?? 'dev';
const checkOnly = process.argv.includes('--check');
const isDev = mode === 'dev';
const contentRoot = isDev ? path.join(root, 'Dev', 'content') : path.join(root, 'content');
const baseUrl = 'https://one-sliders.com';

const eventRoots = [
  ['categories', 'climate'],
  ['categories', 'culture'],
  ['categories', 'music'],
  ['categories', 'sport', 'golf', 'events'],
  ['categories', 'technology'],
  ['categories', 'culture', 'national-day', 'events'],
  ['events']
].map((parts) => path.join(contentRoot, ...parts));

const headTags = {
  canonical: /<link\b[^>]*rel=["']canonical["'][^>]*>/i,
  robots: /<meta\b[^>]*name=["']robots["'][^>]*>/i,
  description: /<meta\b[^>]*name=["']description["'][^>]*>/i,
  ogUrl: /<meta\b[^>]*property=["']og:url["'][^>]*>/i,
  ogTitle: /<meta\b[^>]*property=["']og:title["'][^>]*>/i,
  ogDescription: /<meta\b[^>]*property=["']og:description["'][^>]*>/i,
  ogImage: /<meta\b[^>]*property=["']og:image["'][^>]*>/i,
  ogType: /<meta\b[^>]*property=["']og:type["'][^>]*>/i,
  twitterCard: /<meta\b[^>]*name=["']twitter:card["'][^>]*>/i,
  twitterTitle: /<meta\b[^>]*name=["']twitter:title["'][^>]*>/i,
  twitterDescription: /<meta\b[^>]*name=["']twitter:description["'][^>]*>/i,
  twitterImage: /<meta\b[^>]*name=["']twitter:image["'][^>]*>/i,
  contentLanguage: /<meta\b[^>]*name=["']content-language["'][^>]*>/i,
  referrer: /<meta\b[^>]*name=["']referrer["'][^>]*>/i,
  hreflangEn: /<link\b[^>]*rel=["']alternate["'][^>]*hreflang=["']en["'][^>]*>/i,
  hreflangDefault: /<link\b[^>]*rel=["']alternate["'][^>]*hreflang=["']x-default["'][^>]*>/i
};

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function unique(items) {
  return [...new Set(items.map((item) => path.resolve(item)))];
}

function relFromContent(file) {
  return path.relative(contentRoot, file).replaceAll(path.sep, '/');
}

function canonicalUrl(file) {
  return `${baseUrl}/content/${relFromContent(file)}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function stripTags(value) {
  return String(value ?? '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function tagContent(html, regex) {
  return stripTags(html.match(regex)?.[1] || '');
}

function attrContent(html, regex) {
  return stripTags(html.match(regex)?.[1] || '');
}

function titleFor(html, file) {
  return tagContent(html, /<title>([\s\S]*?)<\/title>/i)
    || tagContent(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i)
    || path.basename(file, '.html').replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function descriptionFor(html, title) {
  return attrContent(html, /<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    || attrContent(html, /<meta\b[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    || `${title.replace(/\s*\|\s*OneSliders\s*$/i, '')} on OneSliders.`;
}

function truncateText(value, limit) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (text.length <= limit) return text;
  const candidate = text.slice(0, limit + 1);
  const sentence = candidate.match(/^(.{40,}?[.!?])\s/);
  if (sentence?.[1] && sentence[1].length <= limit) return sentence[1].trim();
  const wordCut = candidate.slice(0, limit).replace(/\s+\S*$/, '').trim();
  return (wordCut || text.slice(0, limit)).trim();
}

function stripGolfSponsorSuffix(value) {
  return String(value ?? '')
    .replace(/\s+[-—]\s+.*$/i, '')
    .replace(/\s+(?:pres\.?\s+by|presented\s+by|powered\s+by|driven\s+by|sponsored\s+by)\s+.+?(?=\s+20\d{2}$|$)/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function compactTitle(value, file) {
  let title = String(value ?? '').replace(/\s+/g, ' ').trim();
  const rel = relFromContent(file);
  if (rel.includes('/sport/golf/events/')) {
    title = stripGolfSponsorSuffix(title);
  }
  if (rel.includes('/culture/national-day/events/')) {
    title = title
      .replace(/\s+guide,\s*food\s*&\s*stays$/i, '')
      .replace(/\s+guide$/i, '')
      .trim();
    if (title.length > 60) {
      const year = title.match(/\b20\d{2}\b/)?.[0] || '';
      title = `${title.split(/\s+[-—]\s+/)[0]} ${year}`.trim();
    }
  }
  return truncateText(title, 60);
}

function imageFor(html, file) {
  const current = attrContent(html, /<meta\b[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    || attrContent(html, /<meta\b[^>]*name=["']twitter:image["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (current.startsWith('https://')) return current;
  if (current.startsWith('/')) return `${baseUrl}${current}`;

  const rel = relFromContent(file);
  const eventImage = rel.replace(/\.html$/i, '').replace(/\/events\/([^/]+)$/i, '/events/img/$1-hero.png');
  if (eventImage !== rel.replace(/\.html$/i, '')) return `${baseUrl}/content/${eventImage}`;
  return `${baseUrl}/assets/icons/share-image-1200x630.png`;
}

function ensureMusicCollectionJsonLd(html, file, title, description, image) {
  const rel = relFromContent(file);
  if (!rel.startsWith('categories/music/') || rel.includes('/events/')) return html;
  if (html.includes('"@type":"CollectionPage"') || html.includes('"@type": "CollectionPage"')) return html;

  const url = canonicalUrl(file);
  const slug = path.basename(file, '.html');
  const topicName = slug === 'index' ? 'Music' : title.replace(/\s*\|\s*Music\s*$/i, '');
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#collection`,
        url,
        name: title,
        description,
        inLanguage: 'en',
        image,
        isPartOf: { '@id': `${baseUrl}/#website` },
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: title,
        description,
        inLanguage: 'en',
        image,
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
          { '@type': 'ListItem', position: 2, name: 'Categories', item: `${baseUrl}/content/categories/index.html` },
          { '@type': 'ListItem', position: 3, name: 'Music', item: `${baseUrl}/content/categories/music/index.html` },
          { '@type': 'ListItem', position: 4, name: topicName, item: url },
        ],
      },
    ],
  };
  const tag = `\n  <script type="application/ld+json">${JSON.stringify(graph).replace(/<\//g, '<\\/')}</script>`;
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${tag}\n</head>`);
  return `${tag}\n${html}`;
}

function isEventPage(file) {
  return relFromContent(file).includes('/events/');
}

function avoidsDatedSeoDescription(file) {
  const rel = relFromContent(file);
  return isEventPage(file) && /\b(?:categories\/(?:culture|music)\/|categories\/sport\/golf\/events\/)/.test(rel);
}

function cleanEventTitle(value) {
  return String(value ?? '')
    .replace(/\s*\|\s*OneSliders\s*$/i, '')
    .replace(/\s+-\s*Event Guide$/i, '')
    .replace(/\s+-\s*Next Edition.*$/i, '')
    .replace(/\s+\b20\d{2}\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function evergreenEventDescription(file, title, html) {
  const rel = relFromContent(file);
  const cleanTitle = cleanEventTitle(title) || path.basename(file, '.html').replace(/-/g, ' ');
  const location = attrContent(html, /<meta\b[^>]*property=["']event:location["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    || tagContent(html, /<div class=["'][^"']*event-stat-strip[^"']*["'][\s\S]*?<span>(?:Venue|Location)<\/span>\s*<strong>([\s\S]*?)<\/strong>/i)
    || tagContent(html, /<p class=["'][^"']*event-place[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
  const cleanLocation = /\b20\d{2}\b/.test(location) ? '' : location;
  if (rel.includes('/sport/golf/events/')) {
    return `${cleanTitle}: venue, course context, golf trip planning and recent results.`;
  }
  if (rel.startsWith('categories/music/')) {
    const place = cleanLocation ? ` near ${cleanLocation.replace(/\s*,\s*/g, ', ')}` : '';
    return `${cleanTitle}: venue, tickets and where to stay${place}.`;
  }
  const place = cleanLocation ? `${cleanLocation.replace(/\s*,\s*/g, ', ')}, ` : '';
  return `${cleanTitle}: ${place}event context, venue notes and stay planning.`;
}

function sanitizeDescriptionForFile(file, title, html, description) {
  if (avoidsDatedSeoDescription(file) && /\b20\d{2}\b/.test(description)) {
    return truncateText(evergreenEventDescription(file, title, html), 155);
  }
  return truncateText(description, 155);
}

function sanitizeJsonLdDescriptions(html, file, description) {
  if (!avoidsDatedSeoDescription(file)) return html;
  const encoded = JSON.stringify(description);
  return html.replace(/"description"\s*:\s*"[^"]*\b20\d{2}\b[^"]*"/g, `"description":${encoded}`);
}

function ensureJsonLdCoverage(html, file, title, description, image) {
  const rel = relFromContent(file);
  const url = canonicalUrl(file);
  const hasWebPage = html.includes('"@type":"WebPage"') || html.includes('"@type": "WebPage"');
  const hasCollection = html.includes('"@type":"CollectionPage"') || html.includes('"@type": "CollectionPage"');
  const hasEvent = html.includes('"@type":"Event"') || html.includes('"@type": "Event"');
  const hasBreadcrumb = html.includes('"@type":"BreadcrumbList"') || html.includes('"@type": "BreadcrumbList"');
  const graph = [];

  if (!hasWebPage) {
    graph.push({
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: title,
      description,
      inLanguage: 'en',
      image
    });
  }

  if (!isEventPage(file) && rel.startsWith('categories/') && !hasCollection) {
    graph.push({
      '@type': 'CollectionPage',
      '@id': `${url}#collection`,
      url,
      name: title,
      description,
      inLanguage: 'en',
      image,
      isPartOf: { '@id': `${baseUrl}/#website` }
    });
  }

  if (!hasBreadcrumb) {
    const parts = rel.replace(/\.html$/i, '').split('/');
    const items = [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Categories', item: `${baseUrl}/content/categories/index.html` }
    ];
    if (parts[0] === 'categories' && parts[1]) {
      items.push({
        '@type': 'ListItem',
        position: items.length + 1,
        name: parts[1].replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
        item: `${baseUrl}/content/categories/${parts[1]}/index.html`
      });
    }
    items.push({ '@type': 'ListItem', position: items.length + 1, name: title, item: url });
    graph.push({ '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: items });
  }

  if (isEventPage(file) && !hasEvent && !/\b(?:TBC|TBA|to be confirmed|date pending)\b/i.test(description)) {
    graph.push({
      '@type': 'Event',
      name: title.replace(/\s*\|\s*OneSliders\s*$/i, ''),
      url,
      image,
      description,
      eventStatus: 'https://schema.org/EventScheduled'
    });
  }

  if (!graph.length) return html;
  const tag = `\n  <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/<\//g, '<\\/')}</script>`;
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${tag}\n</head>`);
  return `${tag}\n${html}`;
}

function replaceOrInsert(html, matcher, tag) {
  if (matcher.test(html)) return html.replace(matcher, tag);
  if (/<meta\s+name=["']viewport["'][^>]*>/i.test(html)) {
    return html.replace(/<meta\s+name=["']viewport["'][^>]*>/i, (match) => `${match}\n  ${tag}`);
  }
  return html.replace(/<head[^>]*>/i, (match) => `${match}\n  ${tag}`);
}

function normalize(html, file) {
  const title = compactTitle(titleFor(html, file), file);
  const description = sanitizeDescriptionForFile(file, title, html, descriptionFor(html, title));
  const image = imageFor(html, file);
  const url = canonicalUrl(file);
  const ogType = isEventPage(file) ? 'article' : 'website';
  const escapedTitle = escapeHtml(title);
  const escapedDescription = escapeHtml(description);
  const escapedImage = escapeHtml(image);

  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapedTitle}</title>`);
  } else {
    html = html.replace(/<head[^>]*>/i, (match) => `${match}\n  <title>${escapedTitle}</title>`);
  }
  html = replaceOrInsert(html, headTags.canonical, `<link rel="canonical" href="${url}">`);
  html = replaceOrInsert(html, headTags.robots, '<meta name="robots" content="index,follow">');
  html = replaceOrInsert(html, headTags.description, `<meta name="description" content="${escapedDescription}">`);
  html = replaceOrInsert(html, headTags.ogUrl, `<meta property="og:url" content="${url}">`);
  html = replaceOrInsert(html, headTags.ogTitle, `<meta property="og:title" content="${escapedTitle}">`);
  html = replaceOrInsert(html, headTags.ogDescription, `<meta property="og:description" content="${escapedDescription}">`);
  html = replaceOrInsert(html, headTags.ogImage, `<meta property="og:image" content="${escapedImage}">`);
  html = replaceOrInsert(html, headTags.ogType, `<meta property="og:type" content="${ogType}">`);
  html = replaceOrInsert(html, headTags.twitterCard, '<meta name="twitter:card" content="summary_large_image">');
  html = replaceOrInsert(html, headTags.twitterTitle, `<meta name="twitter:title" content="${escapedTitle}">`);
  html = replaceOrInsert(html, headTags.twitterDescription, `<meta name="twitter:description" content="${escapedDescription}">`);
  html = replaceOrInsert(html, headTags.twitterImage, `<meta name="twitter:image" content="${escapedImage}">`);
  html = replaceOrInsert(html, headTags.contentLanguage, '<meta name="content-language" content="en">');
  html = replaceOrInsert(html, headTags.referrer, '<meta name="referrer" content="strict-origin-when-cross-origin">');
  html = replaceOrInsert(html, headTags.hreflangEn, `<link rel="alternate" hreflang="en" href="${url}">`);
  html = replaceOrInsert(html, headTags.hreflangDefault, `<link rel="alternate" hreflang="x-default" href="${url}">`);
  html = ensureMusicCollectionJsonLd(html, file, title, description, image);
  html = ensureJsonLdCoverage(html, file, title, description, image);
  html = sanitizeJsonLdDescriptions(html, file, description);
  return html;
}

function validate(html, file) {
  const issues = [];
  const url = canonicalUrl(file);
  const title = tagContent(html, /<title>([\s\S]*?)<\/title>/i);
  const description = attrContent(html, /<meta\b[^>]*name=["']description["'][^>]*content="([^"]*)"[^>]*>/i);
  const canonical = attrContent(html, /<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i);
  const ogUrl = attrContent(html, /<meta\b[^>]*property=["']og:url["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  const robots = attrContent(html, /<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  const ogType = attrContent(html, /<meta\b[^>]*property=["']og:type["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  const twitterTitle = attrContent(html, /<meta\b[^>]*name=["']twitter:title["'][^>]*content="([^"]*)"[^>]*>/i);
  const twitterDescription = attrContent(html, /<meta\b[^>]*name=["']twitter:description["'][^>]*content="([^"]*)"[^>]*>/i);
  const referrer = attrContent(html, /<meta\b[^>]*name=["']referrer["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  const h1Count = (html.match(/<h1\b/gi) || []).length;

  if (!title) issues.push('missing title');
  if (!description) issues.push('missing meta description');
  if (title.length > 60) issues.push(`title too long: ${title.length}`);
  if (/\bslider\b/i.test(title)) issues.push('title contains slider');
  if (description.length > 155) issues.push(`meta description too long: ${description.length}`);
  if (avoidsDatedSeoDescription(file) && /\b20\d{2}\b/.test(description)) {
    issues.push('meta description contains year');
  }
  if (canonical !== url) issues.push(`canonical mismatch: ${canonical || 'missing'}`);
  if (ogUrl !== url) issues.push(`og:url mismatch: ${ogUrl || 'missing'}`);
  if (!robots) issues.push('missing robots');
  if (ogType !== (isEventPage(file) ? 'article' : 'website')) issues.push(`og:type mismatch: ${ogType || 'missing'}`);
  if (twitterTitle !== title) issues.push('twitter:title mismatch');
  if (twitterDescription !== description) issues.push('twitter:description mismatch');
  if (referrer !== 'strict-origin-when-cross-origin') issues.push('missing strict referrer');
  if (!new RegExp(`<link\\b[^>]*rel=["']alternate["'][^>]*hreflang=["']en["'][^>]*href=["']${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i').test(html)) issues.push('missing hreflang en');
  if (!new RegExp(`<link\\b[^>]*rel=["']alternate["'][^>]*hreflang=["']x-default["'][^>]*href=["']${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i').test(html)) issues.push('missing hreflang x-default');
  if (h1Count !== 1) issues.push(`h1 count ${h1Count}`);
  if (!html.includes('"@type":"WebPage"') && !html.includes('"@type": "WebPage"')) issues.push('missing WebPage JSON-LD');
  return issues;
}

const files = unique(eventRoots.flatMap(walk));
let changed = 0;
const issues = [];

for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  const after = normalize(before, file);
  const pageIssues = validate(after, file);
  if (pageIssues.length) {
    issues.push({ file: path.relative(root, file).replaceAll(path.sep, '/'), issues: pageIssues });
  }
  if (!checkOnly && after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    changed++;
  }
}

console.log(`seo-v3-onpage: checked ${files.length} V3 pages; ${checkOnly ? 'would change' : 'changed'} ${changed}.`);
if (issues.length) {
  console.error(JSON.stringify(issues.slice(0, 25), null, 2));
  process.exit(1);
}
