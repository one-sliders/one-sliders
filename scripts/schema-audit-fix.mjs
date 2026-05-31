import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const baseUrl = "https://one-sliders.com";
const outFile = path.join(root, "tmp", "schema-audit.csv");
const shouldFix = process.argv.includes("--fix");

function writeFileRobust(file, content) {
  fs.writeFileSync(file, content, "utf8");
}

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

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function htmlDecode(value = "") {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(value = "") {
  return htmlDecode(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tagAttr(tag, attr) {
  return tag?.match(new RegExp(`\\b${attr}=(["'])([\\s\\S]*?)\\1`, "i"))?.[2]?.trim() || "";
}

function firstTag(html, tag, attr, value) {
  const safeValue = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.match(new RegExp(`<${tag}\\b(?=[^>]*\\b${attr}=["']${safeValue}["'])[^>]*>`, "i"))?.[0] || "";
}

function metaBy(html, attr, value) {
  return tagAttr(firstTag(html, "meta", attr, value), "content");
}

function canonicalOf(html, rel) {
  const canonical = tagAttr(firstTag(html, "link", "rel", "canonical"), "href");
  if (canonical) return canonical;
  return `${baseUrl}/${rel === "index.html" ? "" : rel}`;
}

function titleOf(html, rel) {
  const title = stripHtml(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "");
  if (title) return title.replace(/\s*\|\s*OneSliders\s*$/i, "").trim();
  const basename = path.basename(rel, ".html") === "index" ? path.basename(path.dirname(rel)) : path.basename(rel, ".html");
  return basename.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function descriptionOf(html, title) {
  return stripHtml(metaBy(html, "name", "description") || metaBy(html, "property", "og:description")) ||
    `${title} on OneSliders.`;
}

function imageOf(html, rel) {
  const existing = metaBy(html, "property", "og:image") || metaBy(html, "name", "twitter:image");
  if (existing) return existing.startsWith("http") ? existing : `${baseUrl}${existing.startsWith("/") ? existing : `/${existing}`}`;
  const preload = tagAttr(html.match(/<link\b(?=[^>]*\brel=["']preload["'])(?=[^>]*\bas=["']image["'])[^>]*>/i)?.[0] || "", "href");
  if (!preload) return `${baseUrl}/assets/icons/one-sliders-icon.svg`;
  if (preload.startsWith("http")) return preload;
  if (preload.startsWith("/")) return `${baseUrl}${preload}`;
  return `${baseUrl}/${path.posix.normalize(`${path.posix.dirname(rel)}/${preload}`)}`;
}

function parseEventYearData(html) {
  const raw = html.match(/<script\b(?=[^>]*\bid=["']event-year-data["'])[^>]*>([\s\S]*?)<\/script>/i)?.[1];
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isCategoryEvent(rel) {
  return /^(?:en\/)?content\/categories\/.+\/events\/[^/]+\.html$/.test(rel);
}

function localExists(rel) {
  return fs.existsSync(path.join(root, rel.replaceAll("/", path.sep)));
}

function displayName(segment) {
  if (segment === "en") return "English";
  if (segment === "content") return "Content";
  return segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function breadcrumbFor(rel, title, canonical) {
  const items = [{ name: "Home", item: `${baseUrl}/` }];
  const parts = rel.split("/");
  const prefix = parts[0] === "en" ? "en/" : "";
  const start = prefix ? 2 : 1;
  let current = prefix ? "en/content" : "content";

  for (let index = start; index < parts.length; index += 1) {
    const part = parts[index];
    const isLast = index === parts.length - 1;
    if (part === "events" && !isLast) continue;

    if (isLast) {
      items.push({ name: title, item: canonical });
      break;
    }

    current = `${current}/${part}`;
    const candidates = [`${current}/index.html`, `${current}.html`];
    const target = candidates.find(localExists);
    if (target) {
      items.push({ name: displayName(part), item: `${baseUrl}/${target}` });
    }
  }

  const seen = new Set();
  const deduped = items.filter((item) => {
    const key = `${item.name}|${item.item}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    "@type": "BreadcrumbList",
    "@id": `${canonical}#breadcrumb`,
    itemListElement: deduped.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

function editionFor(yearData) {
  if (!yearData?.editions?.length) return null;
  return yearData.editions.find((edition) => edition.year === yearData.defaultYear) || yearData.editions.at(-1);
}

function endDateFor(edition) {
  if (edition?.endDate) return edition.endDate;
  if (!edition?.endExclusive) return "";
  const date = new Date(`${edition.endExclusive}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return edition.endExclusive;
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function sportsEventFor({ html, rel, title, description, canonical, image }) {
  const yearData = parseEventYearData(html);
  const edition = editionFor(yearData);
  const countries = edition?.countries || [];
  const cities = edition?.cities || [];
  const countryNames = countries.map((country) => country.name).filter(Boolean);
  const cityNames = cities.map((city) => city.name).filter(Boolean);
  const topic = rel.match(/content\/categories\/([^/]+)\/([^/]+)/)?.slice(1).join(" / ") || "Event";
  const locationName = [edition?.venue, cityNames.join(", "), countryNames.join(", ")].filter(Boolean).join(", ") || "TBC";

  const event = {
    "@type": "SportsEvent",
    "@id": `${canonical}#sports-event`,
    name: yearData?.eventName || title,
    description,
    url: canonical,
    inLanguage: "en",
    image,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    sport: topic,
    startDate: edition?.startDate || "",
    location: {
      "@type": "Place",
      name: locationName,
      address: {
        "@type": "PostalAddress",
      },
    },
  };

  const endDate = endDateFor(edition);
  if (endDate) event.endDate = endDate;
  if (cityNames[0]) event.location.address.addressLocality = cityNames[0];
  if (countryNames.length === 1) event.location.address.addressCountry = countryNames[0];
  if (countryNames.length > 1) event.location.name = `${yearData?.eventName || title} host countries: ${countryNames.join(", ")}`;
  if (edition?.winner?.name) {
    event.winner = {
      "@type": "Thing",
      name: edition.winner.name,
      url: edition.winner.url ? `${baseUrl}${edition.winner.url}` : undefined,
    };
  }

  return event;
}

function webPageFor({ title, description, canonical, image, breadcrumb }) {
  return {
    "@type": "WebPage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: title,
    description,
    inLanguage: "en",
    image,
    breadcrumb: { "@id": breadcrumb["@id"] },
    isPartOf: { "@id": `${baseUrl}/#website` },
    publisher: { "@id": `${baseUrl}/#organization` },
  };
}

function rootNodes() {
  return [
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "OneSliders",
      url: `${baseUrl}/`,
      logo: `${baseUrl}/assets/icons/one-sliders-icon.svg`,
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: `${baseUrl}/`,
      name: "OneSliders",
      publisher: { "@id": `${baseUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}/content/events/index.html?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ];
}

function schemaFor(html, rel) {
  const canonical = canonicalOf(html, rel);
  const title = titleOf(html, rel);
  const description = descriptionOf(html, title);
  const image = imageOf(html, rel);
  const breadcrumb = breadcrumbFor(rel, title, canonical);
  const graph = [
    ...rootNodes(),
    webPageFor({ title, description, canonical, image, breadcrumb }),
    breadcrumb,
  ];
  if (isCategoryEvent(rel)) graph.push(sportsEventFor({ html, rel, title, description, canonical, image }));
  return { "@context": "https://schema.org", "@graph": graph };
}

function removeJsonLd(html) {
  return html.replace(/\s*<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>/gi, "");
}

function injectSchema(html, schema) {
  const tag = `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  return removeJsonLd(html).replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1].trim());
}

function flattenTypes(value, types = []) {
  if (!value || typeof value !== "object") return types;
  if (Array.isArray(value)) {
    value.forEach((item) => flattenTypes(item, types));
    return types;
  }
  if (value["@type"]) types.push(value["@type"]);
  if (value["@graph"]) flattenTypes(value["@graph"], types);
  return types;
}

function validateSchema(html, rel) {
  const errors = [];
  const blocks = jsonLdBlocks(html);
  const parsed = [];
  if (!blocks.length) errors.push("missing JSON-LD");
  for (const block of blocks) {
    try {
      parsed.push(JSON.parse(block));
    } catch (error) {
      errors.push(`invalid JSON-LD: ${error.message}`);
    }
  }

  const types = parsed.flatMap((entry) => flattenTypes(entry));
  if (!types.includes("BreadcrumbList")) errors.push("missing BreadcrumbList");
  if (isCategoryEvent(rel) && !types.includes("SportsEvent")) errors.push("missing SportsEvent");
  if (rel === "index.html") {
    if (!types.includes("Organization")) errors.push("missing Organization");
    if (!types.includes("WebSite")) errors.push("missing WebSite");
    if (!html.includes("SearchAction") || !html.includes("search_term_string")) errors.push("missing WebSite SearchAction");
  }
  if (types.includes("SportsEvent")) {
    const text = JSON.stringify(parsed);
    for (const field of ["name", "startDate", "location", "eventStatus", "eventAttendanceMode"]) {
      if (!text.includes(`"${field}"`)) errors.push(`SportsEvent missing ${field}`);
    }
  }
  return errors;
}

const files = walk(root).sort();
let changed = 0;
const writeErrors = new Map();
const writePayload = [];

if (shouldFix) {
  for (const file of files) {
    const rel = relPath(file);
    const before = fs.readFileSync(file, "utf8");
    const after = injectSchema(before, schemaFor(before, rel));
    if (after !== before) {
      try {
        writeFileRobust(file, after);
        changed += 1;
      } catch (error) {
        writeErrors.set(rel, error.message);
        writePayload.push({ rel, content: after });
      }
    }
  }
}

const rows = [["file", "page_type", "json_ld", "sports_event", "breadcrumb", "organization", "website", "errors"]];
let errorCount = 0;
let eventPages = 0;
for (const file of files) {
  const rel = relPath(file);
  const html = fs.readFileSync(file, "utf8");
  const errors = validateSchema(html, rel);
  if (writeErrors.has(rel)) errors.push(`write failed: ${writeErrors.get(rel)}`);
  const types = jsonLdBlocks(html).flatMap((block) => {
    try {
      return flattenTypes(JSON.parse(block));
    } catch {
      return [];
    }
  });
  if (isCategoryEvent(rel)) eventPages += 1;
  errorCount += errors.length;
  rows.push([
    rel,
    isCategoryEvent(rel) ? "event" : "page",
    errors.some((error) => error.includes("JSON-LD")) ? "error" : "ok",
    isCategoryEvent(rel) ? (types.includes("SportsEvent") ? "ok" : "missing") : "n/a",
    types.includes("BreadcrumbList") ? "ok" : "missing",
    rel === "index.html" ? (types.includes("Organization") ? "ok" : "missing") : "n/a",
    rel === "index.html" ? (types.includes("WebSite") ? "ok" : "missing") : "n/a",
    errors.join("; "),
  ]);
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
if (writePayload.length) {
  fs.writeFileSync(path.join(root, "tmp", "schema-write-failures.json"), JSON.stringify(writePayload), "utf8");
}
fs.writeFileSync(outFile, `${rows.map((row) => row.map(csvEscape).join(",")).join("\n")}\n`, "utf8");

console.log(JSON.stringify({
  mode: shouldFix ? "fix" : "audit",
  pages: files.length,
  eventPages,
  changed,
  writeErrors: writeErrors.size,
  schemaErrors: errorCount,
  output: relPath(outFile),
}, null, 2));
