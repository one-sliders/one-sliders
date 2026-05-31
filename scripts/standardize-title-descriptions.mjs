import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = typeof process === "undefined" ? nodeRepl.cwd : process.cwd();
const year = 2026;
const titleMax = 70;
const descriptionMin = 70;
const descriptionMax = 160;

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

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&ndash;|&mdash;/g, "-")
    .replace(/&nbsp;/g, " ");
}

function cleanText(value) {
  return decodeEntities(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCaseSlug(value) {
  return value
    .replace(/\.html$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\bUsa\b/g, "USA")
    .replace(/\bUk\b/g, "UK")
    .replace(/\bUefa\b/g, "UEFA")
    .replace(/\bFifa\b/g, "FIFA")
    .replace(/\bNba\b/g, "NBA")
    .replace(/\bNfl\b/g, "NFL")
    .replace(/\bPga\b/g, "PGA")
    .replace(/\bLpga\b/g, "LPGA")
    .replace(/\bLiv\b/g, "LIV")
    .replace(/\bF1\b/g, "F1");
}

function htmlTitle(html, rel) {
  return cleanText(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "")
    .replace(/\s*\|\s*OneSliders\s*$/i, "")
    .replace(/\s+[-|]\s+OneSliders\s*$/i, "")
    || titleCaseSlug(path.basename(rel));
}

function h1Title(html, rel) {
  return cleanText(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "") || htmlTitle(html, rel);
}

function metaContent(html, nameOrProperty, key) {
  const tag = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map((match) => match[0])
    .find((tagText) => {
      const attr = tagText.match(new RegExp(`\\b${nameOrProperty}=["']([^"']+)["']`, "i"))?.[1] || "";
      return attr.toLowerCase() === key.toLowerCase();
    });
  return tag?.match(/\bcontent=["']([^"']*)["']/i)?.[1]?.trim() || "";
}

function htmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function truncateWords(value, max = descriptionMax) {
  if (value.length <= max) return value;
  const cut = value.slice(0, max - 1);
  const atSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, atSpace > 45 ? atSpace : max - 1).trim()}.`;
}

function compactName(value, max) {
  if (value.length <= max) return value;
  return value
    .replace(/\bInternational\b/g, "Intl.")
    .replace(/\bChampionship\b/g, "Champ.")
    .replace(/\bChampionships\b/g, "Champs.")
    .replace(/\bTournament\b/g, "Tourn.")
    .replace(/\bFestival\b/g, "Fest.")
    .replace(/\bIndependence\b/g, "Indep.")
    .replace(/\bConstitution\b/g, "Const.")
    .replace(/\bEnvironment\b/g, "Env.")
    .replace(/\bMeteorological\b/g, "Met.")
    .replace(/\bUniversity\b/g, "Univ.")
    .trim();
}

function stripTrailingYear(value) {
  return value.replace(/\s+(?:19|20)\d{2}\b/g, "").replace(/\s+/g, " ").trim();
}

function pathParts(rel) {
  return rel.replace(/\.html$/i, "").split("/");
}

function isEvent(rel) {
  return /^(?:en\/)?content\/categories\/.+\/events\/[^/]+\.html$/.test(rel) ||
    /^(?:en\/)?content\/events\/\d{4}\/\d{2}\/[^/]+\.html$/.test(rel);
}

function isCategory(rel) {
  return /^(?:en\/)?content\/categories\/.+\.html$/.test(rel) && !rel.includes("/events/");
}

function isLocation(rel) {
  return /^(?:en\/)?content\/locations\/.+\.html$/.test(rel);
}

function isIndexable(html) {
  const robots = metaContent(html, "name", "robots");
  if (/\bnoindex\b/i.test(robots)) return false;
  if (/<meta\b[^>]*http-equiv=["']refresh["']/i.test(html)) return false;
  return true;
}

function eventData(html) {
  const raw = html.match(/<script\b[^>]*id=["']event-year-data["'][^>]*>([\s\S]*?)<\/script>/i)?.[1];
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function visibleContext(rel, type) {
  const parts = pathParts(rel).filter((part) => part !== "en" && part !== "content");
  if (type === "event") {
    const categoriesIndex = parts.indexOf("categories");
    if (categoriesIndex >= 0) {
      return parts.slice(categoriesIndex + 1, -2).map(titleCaseSlug).join(" / ");
    }
    return "Events";
  }
  if (type === "category") {
    const categoriesIndex = parts.indexOf("categories");
    return parts.slice(categoriesIndex + 1, -1).map(titleCaseSlug).join(" / ") || "Events";
  }
  const locationsIndex = parts.indexOf("locations");
  return parts.slice(locationsIndex + 1, -1).map(titleCaseSlug).join(" / ") || "World";
}

function eventName(html, rel) {
  const data = eventData(html);
  return stripTrailingYear(data.eventName || h1Title(html, rel));
}

function eventYear(html, rel) {
  const data = eventData(html);
  if (data.defaultYear) return String(data.defaultYear);
  const fromPath = rel.match(/\/((?:19|20)\d{2})\//)?.[1];
  if (fromPath) return fromPath;
  const fromTitle = htmlTitle(html, rel).match(/\b((?:19|20)\d{2})\b/)?.[1];
  return fromTitle || String(year);
}

function categoryName(html, rel) {
  const name = h1Title(html, rel);
  if (!/^index$/i.test(path.basename(rel, ".html"))) return name;
  const parts = pathParts(rel);
  return titleCaseSlug(parts.at(-2) || "Events");
}

function locationName(html, rel) {
  if (!/^index$/i.test(path.basename(rel, ".html"))) return h1Title(html, rel);
  const parts = pathParts(rel);
  return titleCaseSlug(parts.at(-2) || "World");
}

function makeTitle(record, existingTitles) {
  let title;
  if (record.type === "event") {
    let name = compactName(record.name, 32);
    title = `${name} ${record.year} — Dates, Schedule & Results`;
    if (existingTitles.has(title)) {
      const context = compactName(record.context.split(" / ").at(-1) || "", 18);
      if (context && !new RegExp(`^${context}\\b`, "i").test(name)) {
        name = compactName(`${context} ${name}`, 32);
        title = `${name} ${record.year} — Dates, Schedule & Results`;
      }
    }
    while (title.length > titleMax && name.length > 16) {
      name = name.replace(/\s+\S+$/, "");
      title = `${name} ${record.year} — Dates, Schedule & Results`;
    }
  } else if (record.type === "category") {
    let name = compactName(record.name, 34);
    title = `${name} Events ${year} — Schedule & Calendar`;
    if (existingTitles.has(title)) {
      const context = compactName(record.context.split(" / ").filter((part) => part !== record.name).at(-1) || "", 18);
      if (context) {
        name = compactName(`${context} ${name}`, 34);
      } else if (record.rel.startsWith("en/")) {
        name = compactName(`English ${name}`, 34);
      } else {
        name = compactName(`${name} Guide`, 34);
      }
      title = `${name} Events ${year} — Schedule & Calendar`;
    }
    while (title.length > titleMax && name.length > 16) {
      name = name.replace(/\s+\S+$/, "");
      title = `${name} Events ${year} — Schedule & Calendar`;
    }
  } else {
    let place = compactName(record.name, 42);
    title = `Sports Events in ${place} ${year}`;
    if (existingTitles.has(title)) {
      const contextParts = record.context.split(" / ");
      const parent = [...contextParts].reverse().find((part) => part && part !== place);
      if (parent && parent !== place) title = `Sports Events in ${place}, ${parent} ${year}`;
      else title = `Sports Events in ${place} City ${year}`;
    }
    while (title.length > titleMax && place.length > 18) {
      place = place.replace(/\s+\S+$/, "");
      title = `Sports Events in ${place} ${year}`;
    }
  }
  return title;
}

function makeDescription(record, existingDescriptions) {
  const context = record.context || "OneSliders";
  let description;
  if (record.type === "event") {
    description = `${record.name} ${record.year}: dates, schedule, results, venue and winner updates in a quick OneSliders guide for ${context}.`;
  } else if (record.type === "category") {
    description = `${record.name} events calendar for ${year}: key dates, schedules and linked guides across ${context} on OneSliders.`;
  } else {
    description = `Find sports events in ${record.name} in ${year}: calendars, nearby guides and linked event pages for planning around ${context}.`;
  }
  description = truncateWords(description.replace(/\s+/g, " "));
  let suffix = 2;
  while (existingDescriptions.has(description)) {
    const uniqueTail = ` Page ${suffix}.`;
    description = truncateWords(description.replace(/\s+Page \d+\.$/, ""), descriptionMax - uniqueTail.length) + uniqueTail;
    suffix += 1;
  }
  if (description.length < descriptionMin) {
    description = `${description.replace(/\.$/, "")} with current OneSliders links.`;
  }
  return truncateWords(description);
}

function replaceOrInsertMeta(html, attrName, attrValue, content) {
  const tagPattern = new RegExp(`<meta\\b(?=[^>]*\\b${attrName}=["']${attrValue}["'])[^>]*>`, "i");
  const tag = `<meta ${attrName}="${attrValue}" content="${htmlEscape(content)}">`;
  if (tagPattern.test(html)) return html.replace(tagPattern, tag);
  if (/<meta name="viewport"[^>]*>/i.test(html)) {
    return html.replace(/<meta name="viewport"[^>]*>/i, (match) => `${match}\n  ${tag}`);
  }
  return html.replace(/<head[^>]*>/i, (match) => `${match}\n  ${tag}`);
}

function updateJsonLd(html, title, description) {
  return html.replace(/<script\b([^>]*type=["']application\/ld\+json["'][^>]*)>([\s\S]*?)<\/script>/gi, (match, attrs, raw) => {
    try {
      const data = JSON.parse(raw);
      if (data && typeof data === "object" && !Array.isArray(data)) {
        data.name = title.replace(/\s+—\s+.*$/, "");
        data.description = description;
        return `<script${attrs}>${JSON.stringify(data)}</script>`;
      }
    } catch {
      return match;
    }
    return match;
  });
}

function updateHead(html, title, description) {
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${htmlEscape(title)}</title>`);
  } else {
    html = html.replace(/<head[^>]*>/i, (match) => `${match}\n  <title>${htmlEscape(title)}</title>`);
  }
  html = replaceOrInsertMeta(html, "name", "description", description);
  html = replaceOrInsertMeta(html, "property", "og:title", title);
  html = replaceOrInsertMeta(html, "property", "og:description", description);
  html = replaceOrInsertMeta(html, "name", "twitter:title", title);
  html = replaceOrInsertMeta(html, "name", "twitter:description", description);
  return updateJsonLd(html, title, description);
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function safeWriteFile(file, content) {
  const temp = `${file}.${process.pid}.tmp`;
  let lastError;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      fs.writeFileSync(temp, content, "utf8");
      fs.renameSync(temp, file);
      return;
    } catch (error) {
      lastError = error;
      try {
        if (fs.existsSync(temp)) fs.unlinkSync(temp);
      } catch {}
      sleep(75 * (attempt + 1));
    }
  }
  throw lastError;
}

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function headHtml(rel, fallback) {
  try {
    return execFileSync("git", ["show", `HEAD:${rel}`], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      maxBuffer: 40 * 1024 * 1024,
    });
  } catch {
    return fallback;
  }
}

const targets = walk(root)
  .map((file) => ({ file, rel: relPath(file) }))
  .filter(({ rel }) => isEvent(rel) || isCategory(rel) || isLocation(rel))
  .filter(({ file }) => {
    try {
      return isIndexable(fs.readFileSync(file, "utf8"));
    } catch {
      return false;
    }
  });

const existingTitles = new Set();
const existingDescriptions = new Set();
const rows = [];
let changed = 0;
const changedExamples = [];

for (const target of targets) {
  const html = fs.readFileSync(target.file, "utf8");
  const type = isEvent(target.rel) ? "event" : isCategory(target.rel) ? "category" : "location";
  const record = {
    ...target,
    type,
    name: type === "event" ? eventName(html, target.rel) : type === "category" ? categoryName(html, target.rel) : locationName(html, target.rel),
    year: type === "event" ? eventYear(html, target.rel) : String(year),
    context: visibleContext(target.rel, type),
  };
  const baselineHtml = headHtml(target.rel, html);
  const oldTitle = htmlTitle(baselineHtml, target.rel);
  const oldDescription = metaContent(baselineHtml, "name", "description");
  const newTitle = makeTitle(record, existingTitles);
  existingTitles.add(newTitle);
  const newDescription = makeDescription(record, existingDescriptions);
  existingDescriptions.add(newDescription);
  const nextHtml = updateHead(html, newTitle, newDescription);
  if (nextHtml !== html) {
    safeWriteFile(target.file, nextHtml);
    changed += 1;
    if (changedExamples.length < 10) changedExamples.push(target.rel);
  }
  rows.push([target.rel, type, oldTitle, newTitle, oldDescription, newDescription]);
}

fs.mkdirSync(path.join(root, "tmp"), { recursive: true });
safeWriteFile(
  path.join(root, "tmp", "title-desc.csv"),
  [
    ["file", "type", "old_title", "new_title", "old_description", "new_description"].map(csvEscape).join(","),
    ...rows.map((row) => row.map(csvEscape).join(",")),
  ].join("\n") + "\n",
  "utf8",
);

const titleCounts = new Map();
const descriptionCounts = new Map();
const issues = [];
for (const row of rows) {
  const [, type,, title,, description] = row;
  titleCounts.set(title, (titleCounts.get(title) || 0) + 1);
  descriptionCounts.set(description, (descriptionCounts.get(description) || 0) + 1);
  if (title.length > titleMax) issues.push({ file: row[0], type, issue: `title too long (${title.length})`, title });
  if (description.length < descriptionMin || description.length > descriptionMax) {
    issues.push({ file: row[0], type, issue: `description length ${description.length}`, description });
  }
  if (type === "event" && !/ \d{4} — Dates, Schedule & Results$/.test(title)) {
    issues.push({ file: row[0], type, issue: "event title pattern", title });
  }
  if (type === "category" && !/ Events 2026 — Schedule & Calendar$/.test(title)) {
    issues.push({ file: row[0], type, issue: "category title pattern", title });
  }
  if (type === "location" && !/^Sports Events in .+ 2026$/.test(title)) {
    issues.push({ file: row[0], type, issue: "location title pattern", title });
  }
}

for (const [title, count] of titleCounts) {
  if (count > 1) issues.push({ issue: `duplicate title (${count})`, title });
}
for (const [description, count] of descriptionCounts) {
  if (count > 1) issues.push({ issue: `duplicate description (${count})`, description });
}

const summary = {
  processed: rows.length,
  changed,
  csv: "tmp/title-desc.csv",
  duplicateTitles: [...titleCounts.values()].filter((count) => count > 1).length,
  duplicateDescriptions: [...descriptionCounts.values()].filter((count) => count > 1).length,
  issues: issues.length,
  changedExamples,
  examples: issues.slice(0, 20),
};

console.log(JSON.stringify(summary, null, 2));
if (issues.length) process.exitCode = 1;
