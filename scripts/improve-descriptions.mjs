import fs from "node:fs";
import path from "node:path";

const root = typeof process === "undefined" ? nodeRepl.cwd : process.cwd();

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "tmp") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&ndash;|&mdash;/g, "-")
    .replace(/&middot;/g, "-")
    .replace(/&nbsp;/g, " ");
}

function cleanText(value) {
  return decodeEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<head[\s\S]*?<\/head>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clip(value) {
  if (value.length <= 158) return value;
  const cut = value.slice(0, 155);
  const atSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, atSpace > 90 ? atSpace : 155).trim()}...`;
}

function getAttr(html, regex) {
  return html.match(regex)?.[1]?.trim() || "";
}

function setAttr(html, regex, replacement) {
  return html.replace(regex, replacement);
}

function escapeAttr(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function derivedDescription(html) {
  const h1 = cleanText(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "");
  const intro =
    cleanText(html.match(/<p\b[^>]*class=["'][^"']*(?:intro|lede|event-intro)[^"']*["'][^>]*>([\s\S]*?)<\/p>/i)?.[1] || "") ||
    cleanText(html.match(/<main\b[\s\S]*?<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1] || "");
  const body = cleanText(html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] || html);

  let text = [h1, intro].filter(Boolean).join(": ");
  if (text.length < 80) text = body;
  text = text.replace(/\s*\|\s*OneSliders\s*/gi, " ").trim();
  return clip(text || "OneSliders visual event view.");
}

let changed = 0;

for (const file of walk(root)) {
  let html;
  try {
    html = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }
  const current = getAttr(html, /<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (!/ on OneSliders\.$/.test(current)) continue;

  const next = escapeAttr(derivedDescription(html));
  const before = html;
  html = setAttr(
    html,
    /<meta\b[^>]*name=["']description["'][^>]*content=["'][^"']*["'][^>]*>/i,
    `<meta name="description" content="${next}">`,
  );
  html = setAttr(
    html,
    /<meta\b[^>]*property=["']og:description["'][^>]*content=["'][^"']*["'][^>]*>/i,
    `<meta property="og:description" content="${next}">`,
  );
  html = setAttr(
    html,
    /<meta\b[^>]*name=["']twitter:description["'][^>]*content=["'][^"']*["'][^>]*>/i,
    `<meta name="twitter:description" content="${next}">`,
  );
  if (html !== before) {
    fs.writeFileSync(file, html, "utf8");
    changed += 1;
  }
}

console.log(`Improved ${changed} generic descriptions.`);
