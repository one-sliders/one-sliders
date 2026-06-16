import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const baseUrl = "https://one-sliders.com";
const shouldFix = process.argv.includes("--fix");
const outFile = path.join(root, "tmp", "seo-audit.csv");

const requiredOg = ["title", "description", "url", "type", "image"];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

function relPath(file) {
  return path.relative(root, file).replaceAll(path.sep, "/");
}

function expectedUrl(rel) {
  return `${baseUrl}/${rel}`;
}

function cleanText(value = "") {
  return decodeEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

function decodeEntities(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/Â·/g, "·")
    .replace(/\?\?/g, "")
    .replace(/�/g, "");
}

function htmlEscape(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function attrEscape(value = "") {
  return htmlEscape(value).replace(/\s+/g, " ").trim();
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function tagMatch(html, tagName, attrName, attrValue) {
  const escaped = attrValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`<${tagName}\\b(?=[^>]*\\b${attrName}=["']${escaped}["'])[^>]*>`, "i");
  return html.match(re)?.[0] || "";
}

function attrFromTag(tag, attr) {
  return tag.match(new RegExp(`\\b${attr}=(["'])([\\s\\S]*?)\\1`, "i"))?.[2]?.trim() || "";
}

function titleOf(html) {
  return cleanText(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "");
}

function metaByName(html, name) {
  return attrFromTag(tagMatch(html, "meta", "name", name), "content");
}

function metaByProperty(html, property) {
  return attrFromTag(tagMatch(html, "meta", "property", property), "content");
}

function canonicalOf(html) {
  return attrFromTag(tagMatch(html, "link", "rel", "canonical"), "href");
}

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1].trim());
}

function validJsonLd(html) {
  const blocks = jsonLdBlocks(html);
  if (!blocks.length) return false;
  return blocks.every((block) => {
    try {
      const parsed = JSON.parse(block);
      return Boolean(parsed && (parsed["@context"] || Array.isArray(parsed)));
    } catch {
      return false;
    }
  });
}

function firstBodyText(html) {
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
  return cleanText(body);
}

function h1Text(html) {
  return cleanText(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "");
}

function humanFromRel(rel) {
  const name = path.basename(rel, ".html") === "index"
    ? path.basename(path.dirname(rel))
    : path.basename(rel, ".html");
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function makeTitle(html, rel) {
  let title = titleOf(html) || h1Text(html) || humanFromRel(rel);
  title = title.replace(/\s*\|\s*OneSliders\s*$/i, "").trim();
  const withBrand = `${title} | OneSliders`;
  if (withBrand.length <= 60) return withBrand;
  if (title.length <= 60) return title;
  return title.slice(0, 57).replace(/\s+\S*$/, "").trim() || title.slice(0, 60).trim();
}

function normalizeDescription(text, fallbackTitle) {
  let description = cleanText(text)
    .replace(/\s*\|\s*OneSliders\s*/gi, " ")
    .replace(/\bHome Events Locations Categories EN\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (description.length > 160) {
    description = description.slice(0, 157).replace(/\s+\S*$/, "").trim();
    description = `${description}.`;
  }

  if (description.length < 50) {
    const base = fallbackTitle.replace(/\s*\|\s*OneSliders\s*$/i, "");
    description = `${base} on OneSliders, with a concise visual event view, key facts and useful links for planning or browsing.`;
  }

  if (description.length > 160) {
    description = description.slice(0, 157).replace(/\s+\S*$/, "").trim();
    description = `${description}.`;
  }

  return description;
}

function makeDescription(html, title) {
  const existing = metaByName(html, "description") || metaByProperty(html, "og:description") || metaByName(html, "twitter:description");
  if (existing && cleanText(existing).length >= 50 && cleanText(existing).length <= 160 && !/[�]|Â/.test(existing)) {
    return cleanText(existing);
  }

  const candidates = [
    html.match(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*\bcontent=["']([^"']+)["'][^>]*>/i)?.[1],
    html.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1],
    firstBodyText(html),
  ].filter(Boolean);

  return normalizeDescription(candidates[0] || "", title);
}

function absoluteAssetUrl(rel, asset) {
  if (!asset) return "";
  if (/^https?:\/\//i.test(asset)) return asset;
  if (asset.startsWith("/")) return `${baseUrl}${asset}`;
  const resolved = path.posix.normalize(`${path.posix.dirname(rel)}/${asset}`);
  return `${baseUrl}/${resolved}`;
}

function makeImage(html, rel) {
  const existing = metaByProperty(html, "og:image") || metaByName(html, "twitter:image");
  if (/^https:\/\/one-sliders\.com\/.+/i.test(existing)) return existing;

  const candidates = [
    attrFromTag(html.match(/<link\b(?=[^>]*\brel=["']preload["'])(?=[^>]*\bas=["']image["'])[^>]*>/i)?.[0] || "", "href"),
    attrFromTag(html.match(/<img\b(?=[^>]*\bsrc=["'][^"']*(?:hero|mini|favicon|icon)[^"']*["'])[^>]*>/i)?.[0] || "", "src"),
    attrFromTag(html.match(/<img\b[^>]*>/i)?.[0] || "", "src"),
  ].filter(Boolean);

  return absoluteAssetUrl(rel, candidates[0] || "/assets/icons/favicon-512.png");
}

function replaceOrInsert(html, matcher, tag) {
  if (matcher.test(html)) return html.replace(matcher, tag);
  if (/<meta\b[^>]*name=["']viewport["'][^>]*>/i.test(html)) {
    return html.replace(/<meta\b[^>]*name=["']viewport["'][^>]*>/i, (match) => `${match}\n  ${tag}`);
  }
  return html.replace(/<head\b[^>]*>/i, (match) => `${match}\n  ${tag}`);
}

function ensureTitle(html, title) {
  const tag = `<title>${htmlEscape(title)}</title>`;
  if (/<title>[\s\S]*?<\/title>/i.test(html)) return html.replace(/<title>[\s\S]*?<\/title>/i, tag);
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function ensureMetaName(html, name, content) {
  const re = new RegExp(`<meta\\b(?=[^>]*\\bname=["']${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'])[^>]*>`, "i");
  return replaceOrInsert(html, re, `<meta name="${name}" content="${attrEscape(content)}">`);
}

function ensureMetaProperty(html, property, content) {
  const re = new RegExp(`<meta\\b(?=[^>]*\\bproperty=["']${property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'])[^>]*>`, "i");
  return replaceOrInsert(html, re, `<meta property="${property}" content="${attrEscape(content)}">`);
}

function ensureCanonical(html, url) {
  return replaceOrInsert(html, /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i, `<link rel="canonical" href="${url}">`);
}

function ensureJsonLd(html, rel, title, description, image, url) {
  if (validJsonLd(html)) return html;
  const data = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title.replace(/\s*\|\s*OneSliders\s*$/i, ""),
    description,
    url,
    inLanguage: "en",
    image,
  };
  const tag = `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
  if (jsonLdBlocks(html).length) {
    return html.replace(/<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>/i, tag);
  }
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function fixHtml(html, rel) {
  const url = expectedUrl(rel);
  const title = makeTitle(html, rel);
  const description = makeDescription(html, title);
  const image = makeImage(html, rel);

  html = ensureTitle(html, title);
  html = ensureMetaName(html, "description", description);
  html = ensureCanonical(html, url);
  html = ensureMetaName(html, "content-language", "en");
  html = ensureMetaProperty(html, "og:title", title);
  html = ensureMetaProperty(html, "og:description", description);
  html = ensureMetaProperty(html, "og:url", url);
  html = ensureMetaProperty(html, "og:type", "website");
  html = ensureMetaProperty(html, "og:image", image);
  html = ensureMetaName(html, "twitter:card", "summary_large_image");
  html = ensureMetaName(html, "twitter:title", title);
  html = ensureMetaName(html, "twitter:description", description);
  html = ensureMetaName(html, "twitter:image", image);
  html = ensureJsonLd(html, rel, title, description, image, url);
  return html;
}

function statusMap(html, rel) {
  const title = titleOf(html);
  const description = cleanText(metaByName(html, "description"));
  const canonical = canonicalOf(html);
  const url = expectedUrl(rel);
  const twitterCard = metaByName(html, "twitter:card");
  const contentLanguage = metaByName(html, "content-language");
  const ogStatuses = requiredOg.map((name) => [name, metaByProperty(html, `og:${name}`)]);
  const statuses = {
    title: title && title.length <= 60 ? "ok" : "non-ok",
    description: description.length >= 50 && description.length <= 160 ? "ok" : "non-ok",
    canonical: canonical === url ? "ok" : "non-ok",
    content_language: contentLanguage.toLowerCase() === "en" ? "ok" : "non-ok",
    twitter_card: twitterCard === "summary_large_image" || twitterCard === "summary" ? "ok" : "non-ok",
    json_ld: validJsonLd(html) ? "ok" : "non-ok",
  };
  for (const [name, value] of ogStatuses) {
    statuses[`og_${name}`] = value ? "ok" : "non-ok";
  }
  if (metaByProperty(html, "og:url") !== url) statuses.og_url = "non-ok";
  return statuses;
}

const files = walk(path.join(root, "en")).sort();
let changed = 0;

for (const file of files) {
  if (!shouldFix) continue;
  const rel = relPath(file);
  const before = fs.readFileSync(file, "utf8");
  const after = fixHtml(before, rel);
  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    changed += 1;
  }
}

const headers = [
  "file",
  "title",
  "description",
  "canonical",
  "og_title",
  "og_description",
  "og_url",
  "og_type",
  "og_image",
  "twitter_card",
  "content_language",
  "json_ld",
];

const rows = [headers];
let nonOkCells = 0;
for (const file of files) {
  const rel = relPath(file);
  const html = fs.readFileSync(file, "utf8");
  const statuses = statusMap(html, rel);
  const row = headers.map((header) => header === "file" ? rel : statuses[header]);
  nonOkCells += row.filter((cell) => cell === "non-ok").length;
  rows.push(row);
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, `${rows.map((row) => row.map(csvEscape).join(",")).join("\n")}\n`, "utf8");

console.log(JSON.stringify({
  mode: shouldFix ? "fix" : "audit",
  pages: files.length,
  changed,
  nonOkCells,
  output: relPath(outFile),
}, null, 2));
