import fs from "node:fs";
import path from "node:path";

const root = typeof process === "undefined" ? nodeRepl.cwd : process.cwd();
const baseUrl = "https://one-sliders.com";
const deletedLangs = new Set([
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
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "tmp") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    if (entry.isFile()) files.push(full);
  }
  return files;
}

function relPath(file) {
  return path.relative(root, file).replaceAll(path.sep, "/");
}

function toLocalTarget(currentFile, rawUrl) {
  if (!rawUrl) return null;
  if (/^(?:mailto|tel|javascript|data):/i.test(rawUrl)) return null;
  if (rawUrl.startsWith("#")) return { file: currentFile, fragment: rawUrl.slice(1) };

  let clean = rawUrl.trim();
  const hashIndex = clean.indexOf("#");
  const fragment = hashIndex >= 0 ? clean.slice(hashIndex + 1) : "";
  if (hashIndex >= 0) clean = clean.slice(0, hashIndex);
  const queryIndex = clean.indexOf("?");
  if (queryIndex >= 0) clean = clean.slice(0, queryIndex);
  if (!clean) return { file: currentFile, fragment };

  if (/^https?:\/\//i.test(clean)) {
    const url = new URL(clean);
    if (url.hostname !== "one-sliders.com" && url.hostname !== "www.one-sliders.com") return null;
    clean = url.pathname;
  }
  if (clean.startsWith("//")) return null;

  let target = clean.startsWith("/")
    ? path.join(root, clean.replace(/^\/+/, ""))
    : path.resolve(path.dirname(currentFile), clean);

  if (clean.endsWith("/") || !path.extname(target)) target = path.join(target, "index.html");
  return { file: target, fragment };
}

function urlFor(rel) {
  return `${baseUrl}/${rel === "index.html" ? "" : rel}`;
}

function tagContent(html, regex) {
  return html.match(regex)?.[1]?.trim() || "";
}

function hasElementIdOrName(html, fragment) {
  if (!fragment) return true;
  const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b(?:id|name)=["']${escaped}["']`, "i").test(html);
}

const files = walk(root);
const fileSet = new Set(files.map((file) => path.resolve(file).toLowerCase()));
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const missingRefs = [];
const deletedLangRefs = [];
const fragmentMisses = [];
const seoIssues = [];

for (const file of htmlFiles) {
  const rel = relPath(file);
  const html = fs.readFileSync(file, "utf8");

  const refs = [...html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)].map((match) => match[1]);
  for (const ref of refs) {
    const local = toLocalTarget(file, ref);
    if (!local) continue;
    const targetRel = relPath(local.file);
    if (deletedLangs.has(targetRel.split("/")[0])) {
      deletedLangRefs.push({ file: rel, ref, target: targetRel });
    }
    if (!fileSet.has(path.resolve(local.file).toLowerCase())) {
      missingRefs.push({ file: rel, ref, target: targetRel });
      continue;
    }
    if (local.fragment && local.file.endsWith(".html")) {
      const targetHtml = fs.readFileSync(local.file, "utf8");
      if (!hasElementIdOrName(targetHtml, decodeURIComponent(local.fragment))) {
        fragmentMisses.push({ file: rel, ref, target: targetRel, fragment: local.fragment });
      }
    }
  }

  const title = tagContent(html, /<title>([\s\S]*?)<\/title>/i);
  const description = tagContent(html, /<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  const canonical = tagContent(html, /<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  const ogUrl = tagContent(html, /<meta\b[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  const robots = tagContent(html, /<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i);

  if (!title) seoIssues.push({ file: rel, issue: "missing title" });
  if (!description) seoIssues.push({ file: rel, issue: "missing meta description" });
  if (!canonical) seoIssues.push({ file: rel, issue: "missing canonical" });
  if (!ogUrl) seoIssues.push({ file: rel, issue: "missing og:url" });
  if (!robots) seoIssues.push({ file: rel, issue: "missing robots tag" });
  if (canonical && !canonical.startsWith(baseUrl)) seoIssues.push({ file: rel, issue: `canonical is not absolute: ${canonical}` });
  if (canonical && ogUrl && canonical.replace(/\/$/, "") !== ogUrl.replace(/\/$/, "")) {
    seoIssues.push({ file: rel, issue: `og:url differs from canonical: ${ogUrl}` });
  }
}

const sitemapXml = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
const sitemapLocs = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const sitemapIssues = [];
for (const loc of sitemapLocs) {
  const local = toLocalTarget(path.join(root, "index.html"), loc);
  if (!local || !fileSet.has(path.resolve(local.file).toLowerCase())) {
    sitemapIssues.push({ loc, issue: "target file missing" });
    continue;
  }
  const html = fs.readFileSync(local.file, "utf8");
  const canonical = tagContent(html, /<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  const robots = tagContent(html, /<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  if (/noindex/i.test(robots)) sitemapIssues.push({ loc, issue: "noindex page in sitemap" });
  if (canonical.replace(/\/$/, "") !== loc.replace(/\/$/, "")) {
    sitemapIssues.push({ loc, issue: `canonical mismatch: ${canonical}` });
  }
}

const result = {
  htmlFiles: htmlFiles.length,
  sitemapUrls: sitemapLocs.length,
  missingRefs: missingRefs.length,
  deletedLangRefs: deletedLangRefs.length,
  fragmentMisses: fragmentMisses.length,
  seoIssues: seoIssues.length,
  sitemapIssues: sitemapIssues.length,
  examples: {
    missingRefs: missingRefs.slice(0, 25),
    deletedLangRefs: deletedLangRefs.slice(0, 25),
    fragmentMisses: fragmentMisses.slice(0, 25),
    seoIssues: seoIssues.slice(0, 25),
    sitemapIssues: sitemapIssues.slice(0, 25),
  },
};

const output = JSON.stringify(result, null, 2);
if (typeof nodeRepl === "undefined") console.log(output);
else nodeRepl.write(output);
