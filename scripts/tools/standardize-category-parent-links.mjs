import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const categoriesRoot = path.join(root, 'content', 'categories');

const esc = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

function parentCardHtml() {
  return '<a class="category-parent-card" href="../index.html" aria-label="Open Categories"><img src="/content/categories/img/categories-topics-mini.png" alt="" width="400" height="300" loading="lazy"><span>More</span><strong>Categories</strong><p>More event families and calendar topics.</p></a>';
}

function ensureParentCard(html) {
  const card = parentCardHtml();
  let next = html
    .replace(/\s*<a class="category-parent-card"[\s\S]*?<\/a>/g, '')
    .replace(/\s*<a class="category-back"[\s\S]*?<\/a>/g, '');

  if (/<main\b[^>]*>/i.test(next)) {
    return next.replace(/(<main\b[^>]*>)/i, `$1\n      ${card}`);
  }

  return next;
}

function ensureBackMeta(html) {
  const hrefMeta = '<meta name="os-back-href" content="../index.html">';
  const labelMeta = '<meta name="os-back-label" content="Categories">';
  let next = html;

  if (/<meta\s+name="os-back-href"[^>]*>/i.test(next)) {
    next = next.replace(/<meta\s+name="os-back-href"[^>]*>/i, hrefMeta);
  } else if (/<meta\s+name="available-languages"[^>]*>/i.test(next)) {
    next = next.replace(/(<meta\s+name="available-languages"[^>]*>\s*)/i, `$1\n    ${hrefMeta}`);
  } else {
    next = next.replace(/<\/head>/i, `  ${hrefMeta}\n</head>`);
  }

  if (/<meta\s+name="os-back-label"[^>]*>/i.test(next)) {
    next = next.replace(/<meta\s+name="os-back-label"[^>]*>/i, labelMeta);
  } else if (next.includes(hrefMeta)) {
    next = next.replace(hrefMeta, `${hrefMeta}\n    ${labelMeta}`);
  }

  return next;
}

const changed = [];

for (const category of fs.readdirSync(categoriesRoot)) {
  if (category === 'img') continue;
  const indexPath = path.join(categoriesRoot, category, 'index.html');
  if (!fs.existsSync(indexPath)) continue;

  const html = fs.readFileSync(indexPath, 'utf8');
  const next = ensureParentCard(ensureBackMeta(html));
  if (next !== html) {
    fs.writeFileSync(indexPath, next);
    changed.push(`${esc(category)}/index.html`);
  }
}

console.log(`Changed ${changed.length} category index pages.`);
if (changed.length) console.log(changed.join('\n'));
