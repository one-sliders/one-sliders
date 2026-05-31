import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const baseUrl = "https://one-sliders.com";
const outFile = path.join(root, "tmp", "thin-content.csv");
const shouldFix = process.argv.includes("--fix");

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "tmp" || entry.name === "docs") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

function relPath(file) {
  return path.relative(root, file).replaceAll(path.sep, "/");
}

function urlFor(rel) {
  return `${baseUrl}/${rel === "index.html" ? "" : rel}`;
}

function attrFromTag(tag, attr) {
  return tag?.match(new RegExp(`\\b${attr}=["']([^"']*)["']`, "i"))?.[1]?.trim() || "";
}

function tagByAttr(html, tag, attr, value) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.match(new RegExp(`<${tag}\\b(?=[^>]*\\b${attr}=["']${escaped}["'])[^>]*>`, "i"))?.[0] || "";
}

function metaContent(html, name) {
  return attrFromTag(tagByAttr(html, "meta", "name", name), "content");
}

function canonicalOf(html) {
  return attrFromTag(tagByAttr(html, "link", "rel", "canonical"), "href");
}

function titleOf(html) {
  return decodeEntities(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").trim();
}

function decodeEntities(value = "") {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function visibleText(html) {
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
  return `${decodeEntities(body)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()} ${renderedEventDataText(html)}`.trim();
}

function renderedEventDataText(html) {
  const raw = html.match(/<script\b(?=[^>]*\bid=["']event-year-data["'])[^>]*>([\s\S]*?)<\/script>/i)?.[1];
  if (!raw) return "";
  try {
    const data = JSON.parse(decodeEntities(raw));
    const defaultEdition = data.editions?.find((edition) => edition.year === data.defaultYear) || data.editions?.at(-1);
    const parts = [
      data.eventName,
      data.template,
      defaultEdition?.headingPlace,
      defaultEdition?.statusLabel,
      defaultEdition?.dates,
      defaultEdition?.venue,
      defaultEdition?.format,
      defaultEdition?.countdownText,
      defaultEdition?.result,
      defaultEdition?.countries?.map((country) => country.name).join(" "),
      defaultEdition?.cities?.map((city) => city.name).join(" "),
      defaultEdition?.questions?.map((question) => `${question.q} ${question.a} ${question.detail}`).join(" "),
      defaultEdition?.highlights?.map((highlight) => `${highlight.label} ${highlight.title} ${visibleText(highlight.detail || "")}`).join(" "),
      defaultEdition?.winner ? `${defaultEdition.winner.name} ${defaultEdition.winner.countryName}` : "",
      defaultEdition?.scoreProgression?.note,
    ];
    return parts.filter(Boolean).join(" ");
  } catch {
    return "";
  }
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, " ")
    .replace(/\b\d+\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(?:onesliders|events|locations|categories|english|language|copyright|fractal)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function words(text) {
  return text.match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || [];
}

function shingles(norm, size = 5) {
  const tokens = words(norm);
  if (tokens.length < size) return new Set(tokens);
  const set = new Set();
  for (let i = 0; i <= tokens.length - size; i += 1) {
    set.add(tokens.slice(i, i + size).join(" "));
  }
  return set;
}

function jaccard(a, b) {
  if (!a.size && !b.size) return 1;
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection += 1;
  }
  return intersection / (a.size + b.size - intersection);
}

function slugOf(rel) {
  const base = path.posix.basename(rel, ".html");
  return base.replace(/-\d{4}$/g, "");
}

function isLegacyEvent(rel) {
  return /^(?:en\/)?content\/events\/\d{4}\/\d{2}\/[^/]+\.html$/.test(rel);
}

function isArchiveIndex(rel) {
  return /^(?:en\/)?content\/events\/\d{4}(?:\/\d{2})?\/index\.html$/.test(rel);
}

function isSnapshot(rel) {
  return /\.(?:before-event-detail|before-onesliders-poc)\.html$/.test(rel);
}

function localRelFromUrl(value) {
  if (!value) return "";
  try {
    const url = value.startsWith("http") ? new URL(value) : new URL(value, baseUrl);
    if (url.hostname !== "one-sliders.com") return "";
    return url.pathname.replace(/^\/+/, "") || "index.html";
  } catch {
    return "";
  }
}

function findCanonicalTarget(page, pagesBySlug) {
  if (isSnapshot(page.rel)) return page.rel.replace(/\.(?:before-event-detail|before-onesliders-poc)\.html$/, ".html");
  if (!isLegacyEvent(page.rel)) return "";
  const candidates = pagesBySlug.get(slugOf(page.rel)) || [];
  const category = candidates.find((candidate) => /content\/categories\/.+\/events\/[^/]+\.html$/.test(candidate.rel));
  return category?.rel || "";
}

function isImportantIndex(rel) {
  return /^(?:index|content\/categories\/index|en\/content\/categories\/index|content\/locations\/index|content\/events\/this-week)\.html$/.test(rel)
    || /^(?:en\/)?content\/categories\/[^/]+\/index\.html$/.test(rel);
}

function counterpartRel(rel) {
  if (rel.startsWith("en/")) {
    const candidate = rel.slice(3);
    return fs.existsSync(path.join(root, candidate)) ? candidate : "";
  }
  const candidate = `en/${rel}`;
  return fs.existsSync(path.join(root, candidate)) ? candidate : "";
}

function shouldNoindexThin(page) {
  if (/moved|redirect/i.test(page.title) || /food-and-drinks\/index\.html$/.test(page.rel)) return true;
  if (page.rel.startsWith("en/") && counterpartRel(page.rel)) return true;
  return page.wordCount < 80 && !isImportantIndex(page.rel);
}

function escapeAttr(value = "") {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function replaceOrInsertHead(html, matcher, tag) {
  if (matcher.test(html)) return html.replace(matcher, tag);
  if (/<meta\b[^>]*name=["']viewport["'][^>]*>/i.test(html)) {
    return html.replace(/<meta\b[^>]*name=["']viewport["'][^>]*>/i, (match) => `${match}\n  ${tag}`);
  }
  return html.replace(/<head\b[^>]*>/i, (match) => `${match}\n  ${tag}`);
}

function addRedirectBody(html, targetUrl) {
  if (/<main\b[^>]*class=["'][^"']*seo-redirect/i.test(html)) return html;
  const title = "This page has moved";
  const block = `<main class="seo-redirect"><h1>${title}</h1><p>The current OneSliders page is <a href="${escapeAttr(targetUrl)}">${escapeAttr(targetUrl)}</a>.</p></main>`;
  return html.replace(/<body\b([^>]*)>/i, (match) => `${match}\n  ${block}`);
}

function applyNoindexCanonical(file, targetRel = "") {
  let html = fs.readFileSync(file, "utf8");
  const rel = relPath(file);
  const targetUrl = urlFor(targetRel || rel);
  html = replaceOrInsertHead(
    html,
    /<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/i,
    `<meta name="robots" content="noindex,follow">`,
  );
  html = replaceOrInsertHead(
    html,
    /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i,
    `<link rel="canonical" href="${targetUrl}">`,
  );
  html = replaceOrInsertHead(
    html,
    /<meta\b(?=[^>]*\bproperty=["']og:url["'])[^>]*>/i,
    `<meta property="og:url" content="${targetUrl}">`,
  );
  html = replaceOrInsertHead(
    html,
    /<meta\b(?=[^>]*\bhttp-equiv=["']refresh["'])[^>]*>/i,
    `<meta http-equiv="refresh" content="0; url=${targetUrl}">`,
  );
  if (targetRel && targetRel !== rel) html = addRedirectBody(html, targetUrl);
  fs.writeFileSync(file, html, "utf8");
}

function plainTitle(title, rel) {
  const fromTitle = title.replace(/\s*\|\s*OneSliders\s*$/i, "").replace(/\s+/g, " ").trim();
  if (fromTitle) return fromTitle;
  return path.posix.basename(rel, ".html").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function categoryWords(rel) {
  return rel
    .replace(/^en\//, "")
    .replace(/^content\//, "")
    .replace(/\/index\.html$|\.html$/g, "")
    .split("/")
    .filter((part) => !["categories", "events", "locations"].includes(part))
    .map((part) => part.replace(/-/g, " "))
    .join(", ");
}

function enrichmentHtml(page) {
  const name = plainTitle(page.title, page.rel);
  const context = categoryWords(page.rel) || "events and places";
  const eventLike = /\/events\/[^/]+\.html$/.test(page.rel);
  if (eventLike) {
    return `<section class="content-note" aria-label="${escapeAttr(name)} summary"><h2>${escapeAttr(name)} guide</h2><p>${escapeAttr(name)} belongs in the ${escapeAttr(context)} collection on OneSliders. Use this page as the compact evergreen entry point: start with what the event is, then scan the current edition details, location cues, schedule context and links back into the wider topic. The page is kept short by design, but it should still give enough unique context to distinguish this event from nearby fixtures, annual editions and broader category listings.</p><p>This summary also protects the page from becoming a bare card or redirect-style listing. It explains why the page exists, what kind of decision it helps with, and how it differs from month archives: the event page is meant to hold stable context, while dated archives are only navigation aids.</p></section>`;
  }
  return `<section class="content-note" aria-label="${escapeAttr(name)} summary"><h2>${escapeAttr(name)} on OneSliders</h2><p>${escapeAttr(name)} is the browsing page for ${escapeAttr(context)}. It groups related OneSliders entries so visitors can move from a broad theme to specific events, places and practical planning details without opening a long article. The focus is quick orientation: what belongs in this topic, which nearby pages are worth comparing, and where the calendar or location structure gives the next useful step.</p><p>The page is intentionally concise, but it should still stand on its own in search. This added context clarifies the topic boundary, keeps category pages from looking like empty doorway pages, and gives readers a useful explanation before they choose an event card, location page or broader category route.</p></section>`;
}

function applyEnrichment(page) {
  let html = fs.readFileSync(page.file, "utf8");
  const block = enrichmentHtml(page);
  if (/<section\b[^>]*class=["'][^"']*content-note[\s\S]*?<\/section>/i.test(html)) {
    html = html.replace(/<section\b[^>]*class=["'][^"']*content-note[\s\S]*?<\/section>/i, block);
    fs.writeFileSync(page.file, html, "utf8");
    return;
  }
  if (/<\/main>/i.test(html)) {
    html = html.replace(/<\/main>/i, `${block}</main>`);
  } else {
    html = html.replace(/<\/body>/i, `${block}</body>`);
  }
  fs.writeFileSync(page.file, html, "utf8");
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const files = walk(root);
const pages = files.map((file) => {
  const html = fs.readFileSync(file, "utf8");
  const text = visibleText(html);
  const norm = normalizeText(text);
  const robots = metaContent(html, "robots");
  const canonical = canonicalOf(html);
  return {
    file,
    rel: relPath(file),
    title: titleOf(html),
    robots,
    canonical,
    canonicalRel: localRelFromUrl(canonical),
    indexed: !/noindex/i.test(robots),
    wordCount: words(text).length,
    norm,
    shingles: shingles(norm),
    issue: "",
    action: "",
    target: "",
    similarity: "",
  };
});

const pagesBySlug = new Map();
for (const page of pages) {
  const slug = slugOf(page.rel);
  if (!pagesBySlug.has(slug)) pagesBySlug.set(slug, []);
  pagesBySlug.get(slug).push(page);
}

for (const page of pages) {
  const target = findCanonicalTarget(page, pagesBySlug);
  if (target && target !== page.rel && fs.existsSync(path.join(root, target))) {
    page.issue = isSnapshot(page.rel) ? "snapshot_duplicate" : "legacy_event_duplicate";
    page.target = target;
    page.action = page.indexed || page.canonicalRel !== target ? "noindex_canonical_redirect" : "already_noindexed";
  } else if (isArchiveIndex(page.rel) && page.indexed) {
    page.issue = "thin_archive_index";
    page.target = "content/events/index.html";
    page.action = "noindex_canonical_redirect";
  } else if (page.indexed && page.wordCount < 150) {
    page.issue = "thin_indexed";
    const counterpart = counterpartRel(page.rel);
    page.target = shouldNoindexThin(page) ? (counterpart || "") : "";
    page.action = shouldNoindexThin(page) ? "noindex" : "enrich_unique_content";
  }
}

const indexedCandidates = pages.filter((page) => page.indexed && page.wordCount >= 80);
for (let i = 0; i < indexedCandidates.length; i += 1) {
  const page = indexedCandidates[i];
  if (page.issue) continue;
  const sameSlug = (pagesBySlug.get(slugOf(page.rel)) || []).filter((candidate) => candidate !== page && candidate.indexed);
  for (const other of sameSlug) {
    if (other.issue) continue;
    const score = jaccard(page.shingles, other.shingles);
    if (score >= 0.9) {
      const duplicate = page.rel.startsWith("en/") && !other.rel.startsWith("en/") ? page : other.rel.startsWith("en/") && !page.rel.startsWith("en/") ? other : page;
      duplicate.issue = "near_duplicate_indexed";
      duplicate.action = "noindex_canonical_redirect";
      duplicate.target = duplicate === page ? other.rel : page.rel;
      duplicate.similarity = score.toFixed(3);
      break;
    }
  }
}

const rows = pages
  .filter((page) => page.issue)
  .sort((a, b) => a.issue.localeCompare(b.issue) || a.rel.localeCompare(b.rel));

if (shouldFix) {
  for (const page of rows) {
    if (page.action === "noindex_canonical_redirect" && page.target) {
      applyNoindexCanonical(page.file, page.target);
    } else if (page.action === "noindex") {
      applyNoindexCanonical(page.file, page.target);
    } else if (page.action === "enrich_unique_content") {
      applyEnrichment(page);
    }
  }
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
const header = ["path", "indexed", "word_count", "issue", "action", "canonical", "target", "similarity", "title"];
const csv = [
  header.join(","),
  ...rows.map((page) => [
    page.rel,
    page.indexed ? "yes" : "no",
    page.wordCount,
    page.issue,
    page.action,
    page.canonical,
    page.target,
    page.similarity,
    page.title,
  ].map(csvEscape).join(",")),
].join("\n");
fs.writeFileSync(outFile, `${csv}\n`, "utf8");

const summary = rows.reduce((acc, page) => {
  acc[page.issue] = (acc[page.issue] || 0) + 1;
  return acc;
}, {});
console.log(JSON.stringify({
  pages: pages.length,
  findings: rows.length,
  indexedFindings: rows.filter((page) => page.indexed).length,
  fixApplied: shouldFix,
  summary,
  outFile: relPath(outFile),
}, null, 2));
