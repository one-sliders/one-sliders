import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const categoriesRoot = path.join(root, 'content', 'categories');

const categoryLabels = {
  climate: 'Climate',
  culture: 'Culture',
  drinks: 'Drinks',
  festival: 'Festival',
  food: 'Food',
  'food-and-drinks': 'Food and Drinks',
  music: 'Music',
  nature: 'Nature',
  sport: 'Sports',
  technology: 'Technology',
  wellness: 'Wellness'
};

const categoryImageCandidates = (category) => [
  `/content/categories/${category}/img/${category}-mini-400.webp`,
  `/content/categories/${category}/img/${category}-mini.png`,
  `/content/categories/${category}/img/index-mini.png`,
  `/content/categories/${category}/img/${category}-hero.png`,
  '/content/categories/img/categories-topics-mini.png'
];

const titleCase = (value) => value
  .split('-')
  .map((part) => part ? part[0].toUpperCase() + part.slice(1) : part)
  .join(' ');

const esc = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

function topicLabelFromHtml(html, file) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const raw = h1 || title || path.basename(file, '.html');
  return raw
    .replace(/<[^>]+>/g, '')
    .replace(/\s+Events\s+20\d{2}.*$/i, '')
    .replace(/\s+[-—].*$/i, '')
    .trim() || titleCase(path.basename(file, '.html'));
}

function ensureBackMeta(html, label) {
  const hrefMeta = `<meta name="os-back-href" content="index.html">`;
  const labelMeta = `<meta name="os-back-label" content="${esc(label)}">`;

  let next = html;
  if (/<meta\s+name="os-back-href"[^>]*>/i.test(next)) {
    next = next.replace(/<meta\s+name="os-back-href"[^>]*>/i, hrefMeta);
  } else {
    next = next.replace(/(<meta\s+name="available-languages"[^>]*>\s*)/i, `$1\n    ${hrefMeta}`);
  }

  if (/<meta\s+name="os-back-label"[^>]*>/i.test(next)) {
    next = next.replace(/<meta\s+name="os-back-label"[^>]*>/i, labelMeta);
  } else if (next.includes(hrefMeta)) {
    next = next.replace(hrefMeta, `${hrefMeta}\n    ${labelMeta}`);
  }

  if (!next.includes(hrefMeta)) {
    next = next.replace(/<\/head>/i, `  ${hrefMeta}\n  ${labelMeta}\n</head>`);
  }

  return next;
}

function normalizeNav(html, categoryLabel, topicLabel, file) {
  return html.replace(/<nav class="top-menu"[\s\S]*?<\/nav>/i, (nav) => {
    const divider = '<span class="nav-divider"></span>';
    const dividerIndex = nav.indexOf(divider);
    const currentHref = path.basename(file);
    const parentNav = `
      <a class="nav-back" href="index.html" title="Back to ${esc(categoryLabel)}" aria-label="Back to ${esc(categoryLabel)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg><span>${esc(categoryLabel)}</span></a>
      <span class="nav-current-topic" aria-current="page">${esc(topicLabel)}</span>`;

    if (dividerIndex === -1) {
      const open = nav.match(/^<nav\b[^>]*>/i)?.[0] || '<nav class="top-menu" aria-label="Category navigation">';
      const details = nav.match(/\s*<details class="event-language-menu"[\s\S]*?<\/details>\s*/i)?.[0] || '';
      const withoutDetails = nav.replace(/\s*<details class="event-language-menu"[\s\S]*?<\/details>\s*/i, '');
      const anchors = [...withoutDetails.matchAll(/<a\b[\s\S]*?<\/a>/gi)].map((match) => match[0]);
      const siteAnchors = anchors.slice(0, 3).join('');
      return `${open}${siteAnchors}${divider}${parentNav}${details}</nav>`;
    }

    const before = nav.slice(0, dividerIndex + divider.length);
    const after = nav.slice(dividerIndex + divider.length);
    const details = after.match(/\s*<details class="event-language-menu"[\s\S]*?<\/details>\s*/i)?.[0] || '';

    return `${before}${parentNav}${details}</nav>`;
  });
}

function firstExistingCategoryImage(category) {
  for (const candidate of categoryImageCandidates(category)) {
    if (candidate.startsWith('/content/categories/img/')) return candidate;
    if (fs.existsSync(path.join(root, candidate.replace(/^\//, '')))) return candidate;
  }
  return '/content/categories/img/categories-topics-mini.png';
}

function parentCardHtml(category, categoryLabel, topicLabel) {
  const image = firstExistingCategoryImage(category);
  return `<a class="topic-parent-card" href="index.html" aria-label="Open ${esc(categoryLabel)} category"><img src="${esc(image)}" alt="" width="400" height="300" loading="lazy"><span>More ${esc(categoryLabel)}</span><strong>${esc(categoryLabel)} category</strong><p>More topics, events and calendar moments.</p></a>`;
}

function ensureParentCard(html, category, categoryLabel, topicLabel) {
  const card = parentCardHtml(category, categoryLabel, topicLabel);
  let next = html.replace(/\s*<a class="topic-parent-card"[\s\S]*?<\/a>/g, '');

  if (/<main\b[^>]*>/i.test(next)) {
    return next.replace(/(<main\b[^>]*>)/i, `$1\n    ${card}`);
  }

  return next;
}

const changed = [];
const skipped = [];

for (const category of fs.readdirSync(categoriesRoot)) {
  if (category === 'img') continue;
  const categoryDir = path.join(categoriesRoot, category);
  if (!fs.statSync(categoryDir).isDirectory()) continue;
  if (!fs.existsSync(path.join(categoryDir, 'index.html'))) continue;

  const categoryLabel = categoryLabels[category] || titleCase(category);
  for (const file of fs.readdirSync(categoryDir)) {
    if (!file.endsWith('.html') || file === 'index.html') continue;
    const filePath = path.join(categoryDir, file);
    let html = fs.readFileSync(filePath, 'utf8');
    if (!/<nav class="top-menu"/i.test(html)) {
      skipped.push(`${category}/${file}: no top-menu`);
      continue;
    }

    const topicLabel = topicLabelFromHtml(html, file);
    const next = ensureParentCard(
      normalizeNav(ensureBackMeta(html, categoryLabel), categoryLabel, topicLabel, file),
      category,
      categoryLabel,
      topicLabel
    );
    if (next !== html) {
      fs.writeFileSync(filePath, next);
      changed.push(`${category}/${file}`);
    }
  }
}

console.log(`Changed ${changed.length} topic pages.`);
if (changed.length) console.log(changed.join('\n'));
if (skipped.length) {
  console.log(`Skipped ${skipped.length} pages.`);
  console.log(skipped.join('\n'));
}
