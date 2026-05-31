import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outFile = path.join(root, "tmp", "broken-links.csv");

function walkHtml(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "tmp") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, files);
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

function walkFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "tmp") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, files);
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

function rel(file) {
  return path.relative(root, file).replaceAll(path.sep, "/");
}

function csv(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function stripQueryAndHash(rawHref) {
  let href = rawHref.trim();
  const hashAt = href.indexOf("#");
  const fragment = hashAt >= 0 ? href.slice(hashAt + 1) : "";
  if (hashAt >= 0) href = href.slice(0, hashAt);
  const queryAt = href.indexOf("?");
  if (queryAt >= 0) href = href.slice(0, queryAt);
  return { href, fragment: decodeURIComponent(fragment) };
}

function isInternalUrl(url) {
  return url.hostname === "one-sliders.com" || url.hostname === "www.one-sliders.com";
}

function resolveTarget(sourceFile, rawHref) {
  if (!rawHref || /^(?:mailto|tel|javascript|data|blob):/i.test(rawHref)) return null;
  if (rawHref.startsWith("//")) return null;

  let original = rawHref.trim();
  if (/^https?:\/\//i.test(original)) {
    const url = new URL(original);
    if (!isInternalUrl(url)) return null;
    original = `${url.pathname}${url.search}${url.hash}`;
  }

  const { href, fragment } = stripQueryAndHash(original);
  if (!href && fragment) return { targetFile: sourceFile, fragment, rawHref };
  if (!href) return null;

  let targetFile = href.startsWith("/")
    ? path.join(root, href.replace(/^\/+/, ""))
    : path.resolve(path.dirname(sourceFile), href);

  if (href.endsWith("/") || !path.extname(targetFile)) {
    targetFile = path.join(targetFile, "index.html");
  }

  return { targetFile, fragment, rawHref };
}

function reasonFor(targetFile) {
  const targetRel = rel(targetFile);
  if (/\.ics$/i.test(targetRel)) return "missing-ics";
  if (/^(?:en\/)?content\/locations\/[^/]+\/[^/]+\/[^/]+\.html$/i.test(targetRel)) return "missing-city";
  return "missing-file";
}

function hasAnchor(html, fragment) {
  if (!fragment) return true;
  const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b(?:id|name)=["']${escaped}["']`, "i").test(html);
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });

const enRoot = path.join(root, "en");
const pages = fs.existsSync(enRoot) ? walkHtml(enRoot).sort() : [];
const files = new Set(walkFiles(root).map((file) => path.resolve(file).toLowerCase()));
const broken = [];
const htmlCache = new Map();

for (const sourceFile of pages) {
  const html = fs.readFileSync(sourceFile, "utf8");
  const refs = [
    ...html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi),
  ].map((match) => match[1]);

  for (const href of refs) {
    const target = resolveTarget(sourceFile, href);
    if (!target) continue;

    const targetPath = path.resolve(target.targetFile).toLowerCase();
    if (!files.has(targetPath)) {
      broken.push({
        sourcePage: rel(sourceFile),
        brokenHref: href,
        reason: reasonFor(target.targetFile),
      });
      continue;
    }

    if (target.fragment && /\.html$/i.test(target.targetFile)) {
      const key = path.resolve(target.targetFile);
      if (!htmlCache.has(key)) htmlCache.set(key, fs.readFileSync(target.targetFile, "utf8"));
      if (!hasAnchor(htmlCache.get(key), target.fragment)) {
        broken.push({
          sourcePage: rel(sourceFile),
          brokenHref: href,
          reason: "dead-anchor",
        });
      }
    }
  }
}

const lines = ["sourcePage,brokenHref,reason"];
for (const item of broken) lines.push([item.sourcePage, item.brokenHref, item.reason].map(csv).join(","));
fs.writeFileSync(outFile, `${lines.join("\n")}\n`, "utf8");

const counts = broken.reduce((acc, item) => {
  acc[item.reason] = (acc[item.reason] || 0) + 1;
  return acc;
}, {});

console.log(JSON.stringify({ pages: pages.length, broken: broken.length, counts, outFile: rel(outFile) }, null, 2));
