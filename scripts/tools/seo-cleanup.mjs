import fs from "node:fs";
import path from "node:path";

const root = typeof process === "undefined" ? nodeRepl.cwd : process.cwd();
const baseUrl = "https://one-sliders.com";
const removedLangs = [
  "ar",
  "de",
  "es",
  "fr",
  "ha",
  "hi",
  "mi",
  "no",
  "pt",
  "qu",
  "ru",
  "sw",
  "tpi",
  "zh",
];

const removedLangPattern = removedLangs.join("|");
const removedLangHref = new RegExp(
  `<a\\b[^>]*href=["'][^"']*(?:^|/|\\.\\./)(?:${removedLangPattern})(?:/|["'])[^>]*>[\\s\\S]*?<\\/a>`,
  "gi",
);
const removedHreflang = new RegExp(
  `\\s*<link\\b[^>]*rel=["']alternate["'][^>]*hreflang=["'](?:${removedLangPattern})["'][^>]*>`,
  "gi",
);
const canonicalTag = /<link\b[^>]*rel=["']canonical["'][^>]*>/i;
const ogUrlTag = /<meta\b[^>]*property=["']og:url["'][^>]*>/i;
const robotsTag = /<meta\b[^>]*name=["']robots["'][^>]*>/i;
const descriptionTag = /<meta\b[^>]*name=["']description["'][^>]*>/i;
const ogTitleTag = /<meta\b[^>]*property=["']og:title["'][^>]*>/i;
const ogDescriptionTag = /<meta\b[^>]*property=["']og:description["'][^>]*>/i;
const ogTypeTag = /<meta\b[^>]*property=["']og:type["'][^>]*>/i;
const twitterCardTag = /<meta\b[^>]*name=["']twitter:card["'][^>]*>/i;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "tmp") continue;
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

function fileExistsForRel(rel) {
  return fs.existsSync(path.join(root, rel.replaceAll("/", path.sep)));
}

function htmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function textFromTitle(html, rel) {
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim();
  if (title) return title;
  return path.basename(rel, ".html").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function descriptionFrom(html, title) {
  const existing = html.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1]?.trim();
  if (existing) return existing;
  return `${title.replace(/\s*\|\s*OneSliders\s*$/i, "")} on OneSliders.`;
}

function legacyEvent(rel) {
  return /^(?:en\/)?content\/events\/\d{4}\/\d{2}\/[^/]+\.html$/.test(rel);
}

function sameEnglishCategoryPage(rel) {
  if (!rel.startsWith("content/categories/")) return null;
  const candidate = `en/${rel}`;
  return fileExistsForRel(candidate) ? candidate : null;
}

function existingCanonicalRel(html) {
  const tag = html.match(canonicalTag)?.[0];
  const href = tag?.match(/href=["']([^"']+)["']/i)?.[1];
  if (!href) return null;
  try {
    const url = href.startsWith("http") ? new URL(href) : new URL(href, baseUrl);
    if (url.hostname !== "one-sliders.com") return null;
    return url.pathname.replace(/^\/+/, "") || "index.html";
  } catch {
    return null;
  }
}

function canonicalRelFor(rel, html) {
  if (rel === "index.html" || rel === "privacy.html" || rel === "terms.html") return rel;
  if (legacyEvent(rel)) {
    const existing = existingCanonicalRel(html);
    if (existing && !new RegExp(`^(?:${removedLangPattern})/`).test(existing) && fileExistsForRel(existing)) {
      return existing;
    }
    return rel;
  }
  const enCategory = sameEnglishCategoryPage(rel);
  if (enCategory) return enCategory;
  return rel;
}

function shouldNoindex(rel) {
  return (
    legacyEvent(rel) ||
    /^change-log_\d+\.html$/.test(rel) ||
    rel.startsWith("shopping-list/")
  );
}

function replaceOrInsert(html, matcher, tag) {
  if (matcher.test(html)) return html.replace(matcher, tag);
  if (/<meta name="viewport"[^>]*>/i.test(html)) {
    return html.replace(/<meta name="viewport"[^>]*>/i, (match) => `${match}\n  ${tag}`);
  }
  return html.replace(/<head[^>]*>/i, (match) => `${match}\n  ${tag}`);
}

function normalizeHead(html, rel) {
  const title = textFromTitle(html, rel);
  const description = descriptionFrom(html, title);
  const canonicalUrl = urlFor(canonicalRelFor(rel, html));
  const escapedTitle = htmlEscape(title);
  const escapedDescription = htmlEscape(description);

  html = replaceOrInsert(html, canonicalTag, `<link rel="canonical" href="${canonicalUrl}">`);
  html = replaceOrInsert(html, ogUrlTag, `<meta property="og:url" content="${canonicalUrl}">`);
  html = replaceOrInsert(html, descriptionTag, `<meta name="description" content="${escapedDescription}">`);
  html = replaceOrInsert(html, ogTitleTag, `<meta property="og:title" content="${escapedTitle}">`);
  html = replaceOrInsert(html, ogDescriptionTag, `<meta property="og:description" content="${escapedDescription}">`);
  html = replaceOrInsert(html, ogTypeTag, `<meta property="og:type" content="website">`);
  html = replaceOrInsert(html, twitterCardTag, `<meta name="twitter:card" content="summary_large_image">`);

  const robots = shouldNoindex(rel) ? "noindex,follow" : "index,follow";
  html = replaceOrInsert(html, robotsTag, `<meta name="robots" content="${robots}">`);

  return html;
}

let changed = 0;
let processed = 0;

for (const file of walk(root)) {
  const rel = relPath(file);
  let html = fs.readFileSync(file, "utf8");
  const before = html;

  html = html.replace(removedHreflang, "");
  html = html.replace(removedLangHref, "");
  html = html.replace(/\n{3,}/g, "\n\n");
  html = normalizeHead(html, rel);

  processed += 1;
  if (html !== before) {
    fs.writeFileSync(file, html, "utf8");
    changed += 1;
  }
}

console.log(`SEO cleanup processed ${processed} HTML files; changed ${changed}.`);
