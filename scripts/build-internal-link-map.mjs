import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outFile = path.join(root, "tmp", "internal-link-map.csv");

const EVENT_ROOTS = [
  path.join(root, "en", "content", "categories"),
  path.join(root, "content", "categories"),
];

const CATEGORY_ROOTS = [
  path.join(root, "en", "content", "categories"),
  path.join(root, "content", "categories"),
];

function walk(dir, predicate, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, predicate, files);
    else if (predicate(full)) files.push(full);
  }
  return files;
}

function rel(file) {
  return path.relative(root, file).replaceAll(path.sep, "/");
}

function sitePath(file) {
  return `/${rel(file)}`;
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function csv(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function textFromSlug(slug) {
  return slug
    .split("-")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ")
    .replace(/\bUsa\b/g, "USA")
    .replace(/\bUk\b/g, "UK")
    .replace(/\bPga\b/g, "PGA")
    .replace(/\bLpga\b/g, "LPGA")
    .replace(/\bLiv\b/g, "LIV")
    .replace(/\bFifa\b/g, "FIFA")
    .replace(/\bUefa\b/g, "UEFA");
}

function readJsonData(html) {
  const match = html.match(/<script type="application\/json" id="event-year-data">([\s\S]*?)<\/script>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function writeFileWithRetry(file, value, attempts = 6) {
  let lastError;
  for (let index = 0; index < attempts; index += 1) {
    try {
      fs.writeFileSync(file, value, "utf8");
      return;
    } catch (error) {
      lastError = error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 60 * (index + 1));
    }
  }
  throw lastError;
}

function categoryInfoForEvent(file) {
  const normalized = rel(file);
  const parts = normalized.split("/");
  const eventsIndex = parts.lastIndexOf("events");
  if (eventsIndex < 3) return null;
  const langPrefix = parts[0] === "en" ? "en/" : "";
  const categoryParts = parts.slice(langPrefix ? 3 : 2, eventsIndex);
  const topCategory = categoryParts[0] || "";
  const topic = categoryParts.at(-1) || topCategory;
  const categoryRel = `${langPrefix}content/categories/${categoryParts.join("/")}.html`;
  const fallbackRel = `content/categories/${categoryParts.join("/")}.html`;
  const target = fs.existsSync(path.join(root, categoryRel))
    ? `/${categoryRel}`
    : fs.existsSync(path.join(root, fallbackRel))
      ? `/${fallbackRel}`
      : `/${categoryRel}`;
  return {
    parts: categoryParts,
    topCategory,
    topic,
    label: textFromSlug(topic),
    target,
  };
}

function defaultEdition(data) {
  return data?.editions?.find((edition) => edition.year === data.defaultYear) || data?.editions?.at(-1) || {};
}

function countryTargets(data) {
  const edition = defaultEdition(data);
  const countries = new Map();
  const normalize = (url) => url.replace(/\/$/, "/index.html");
  for (const country of edition.countries || []) {
    if (country?.url && country?.name) countries.set(normalize(country.url), country.name);
  }
  if (!countries.size) {
    for (const editionItem of data?.editions || []) {
      for (const country of editionItem.countries || []) {
        if (country?.url && country?.name) countries.set(normalize(country.url), country.name);
      }
    }
  }
  return [...countries].map(([url, name]) => ({ url, name }));
}

function countryFileFromUrl(url) {
  const clean = url.replace(/^\/+/, "").replace(/\/$/, "/index.html");
  return path.join(root, clean);
}

function eventFiles() {
  const seen = new Set();
  const files = [];
  for (const base of EVENT_ROOTS) {
    for (const file of walk(base, (candidate) => {
      const normalized = rel(candidate);
      return normalized.endsWith(".html")
        && normalized.includes("/events/")
        && !normalized.includes(".before-")
        && !normalized.endsWith("/index.html");
    })) {
      const normalized = rel(file);
      if (!seen.has(normalized)) {
        seen.add(normalized);
        files.push(file);
      }
    }
  }
  return files.sort((a, b) => rel(a).localeCompare(rel(b)));
}

function categoryFilesForEvents(events) {
  const files = new Set();
  for (const event of events) {
    const info = categoryInfoForEvent(event.file);
    if (!info) continue;
    for (const candidate of [info.target.replace(/^\/+/, ""), `content/categories/${info.parts.join("/")}.html`]) {
      const file = path.join(root, candidate);
      if (fs.existsSync(file)) files.add(file);
    }
  }
  return [...files];
}

function relatedCategories(info) {
  const base = path.join(root, info.target.startsWith("/en/") ? "content/categories" : "content/categories", ...info.parts.slice(0, -1));
  if (!fs.existsSync(base)) return [];
  return fs.readdirSync(base)
    .filter((name) => name.endsWith(".html") && name !== "index.html" && name !== `${info.topic}.html`)
    .slice(0, 6)
    .map((name) => {
      const slug = name.replace(/\.html$/, "");
      const prefix = info.target.startsWith("/en/") ? "/content/categories" : "/content/categories";
      return {
        url: `${prefix}/${[...info.parts.slice(0, -1), name].join("/")}`,
        label: textFromSlug(slug),
      };
    });
}

function moduleHtml(title, links) {
  if (!links.length) return "";
  return `<section class="internal-link-module" data-internal-link-module><h2>${esc(title)}</h2><div class="internal-link-module__grid">${links.map((link) => `<a class="internal-link-card" href="${esc(link.url)}"><span>${esc(link.label)}</span><strong>${esc(link.title)}</strong>${link.meta ? `<p>${esc(link.meta)}</p>` : ""}</a>`).join("")}</div></section>`;
}

function upsertBlock(html, block, marker = "data-internal-link-module") {
  const re = new RegExp(`<section class="internal-link-module" ${marker}[\\s\\S]*?<\\/section>`);
  if (re.test(html)) return html.replace(re, block);
  if (html.includes("</main>")) return html.replace("</main>", `${block}</main>`);
  if (html.includes("</body>")) return html.replace("</body>", `${block}</body>`);
  return `${html}${block}`;
}

function withoutContextBlock(html) {
  return html.replace(/<section class="internal-link-module" data-internal-link-module[\s\S]*?<\/section>/g, "");
}

function upsertEventBlock(html, block) {
  const clean = withoutContextBlock(html);
  if (clean.includes("event-page--framed")) {
    return clean.includes("</main>") ? clean.replace("</main>", `</main>${block}`) : `${clean}${block}`;
  }
  const yearSlide = '</div></section><section class="event-slide" id="year"';
  if (clean.includes(yearSlide)) return clean.replace(yearSlide, `${block}${yearSlide}`);
  const firstSlideEnd = '</section><section class="event-slide"';
  if (clean.includes(firstSlideEnd)) return clean.replace(firstSlideEnd, `${block}${firstSlideEnd}`);
  return upsertBlock(clean, block);
}

function eventContextLinks(event) {
  const links = [
    {
      url: event.category.target,
      label: `Other ${event.category.label.toLowerCase()} events`,
      title: `${event.category.label} topic`,
      meta: "Parent category and nearby event views.",
    },
  ];
  for (const country of event.countries) {
    links.push({
      url: country.url,
      label: `Events in ${country.name}`,
      title: country.name,
      meta: "Location context and related events.",
    });
  }
  return links;
}

function buildEvents() {
  const events = [];
  for (const file of eventFiles()) {
    const html = fs.readFileSync(file, "utf8");
    const data = readJsonData(html);
    const category = categoryInfoForEvent(file);
    if (!data || !category) continue;
    events.push({
      file,
      url: sitePath(file),
      title: data.eventName || textFromSlug(path.basename(file, ".html")),
      slug: data.slug || path.basename(file, ".html"),
      category,
      countries: countryTargets(data),
      startDate: defaultEdition(data).startDate || "",
      endDate: defaultEdition(data).endExclusive || "",
    });
  }
  return events;
}

function updateEvents(events) {
  let changed = 0;
  for (const event of events) {
    if (!event.countries.length) continue;
    const html = fs.readFileSync(event.file, "utf8");
    const block = moduleHtml("Related context", eventContextLinks(event));
    const next = upsertEventBlock(html, block);
    if (next !== html) {
      writeFileWithRetry(event.file, next);
      changed += 1;
    }
  }
  return changed;
}

function updateLocations(events) {
  const byLocation = new Map();
  for (const event of events) {
    for (const country of event.countries) {
      if (!byLocation.has(country.url)) byLocation.set(country.url, { country, events: [] });
      byLocation.get(country.url).events.push(event);
    }
  }

  let changed = 0;
  for (const { country, events: countryEvents } of byLocation.values()) {
    const file = countryFileFromUrl(country.url);
    if (!fs.existsSync(file)) continue;
    const links = countryEvents.map((event) => ({
      url: event.url,
      label: event.category.label,
      title: event.title,
      meta: event.startDate || "Event view",
    }));
    const html = fs.readFileSync(file, "utf8");
    const block = moduleHtml(`Events in ${country.name}`, links);
    const next = upsertBlock(html, block);
    if (next !== html) {
      writeFileWithRetry(file, next);
      changed += 1;
    }
  }
  return changed;
}

function updateCategories(events) {
  const byCategory = new Map();
  for (const event of events) {
    const key = event.category.target;
    if (!byCategory.has(key)) byCategory.set(key, { info: event.category, events: [] });
    byCategory.get(key).events.push(event);
  }

  let changed = 0;
  for (const { info, events: categoryEvents } of byCategory.values()) {
    const candidates = [
      path.join(root, info.target.replace(/^\/+/, "")),
      path.join(root, "content", "categories", ...info.parts) + ".html",
    ];
    const file = candidates.find((candidate) => fs.existsSync(candidate));
    if (!file) continue;
    const links = [
      ...categoryEvents.map((event) => ({
        url: event.url,
        label: "Event view",
        title: event.title,
        meta: event.countries.map((country) => country.name).join(", ") || "OneSliders event",
      })),
      ...relatedCategories(info).map((category) => ({
        url: category.url,
        label: "Related category",
        title: category.label,
        meta: `More ${info.topCategory || "topic"} context`,
      })),
    ];
    const html = fs.readFileSync(file, "utf8");
    const block = moduleHtml(`More ${info.label} context`, links);
    const next = upsertBlock(html, block);
    if (next !== html) {
      writeFileWithRetry(file, next);
      changed += 1;
    }
  }
  return changed;
}

function writeMap(events) {
  const rows = [["source_type", "source_url", "target_type", "target_url", "anchor_text", "relation"]];
  for (const event of events) {
    rows.push(["event", event.url, "category", event.category.target, event.category.label, "event_to_category"]);
    for (const country of event.countries) {
      rows.push(["event", event.url, "location", country.url, country.name, "event_to_location"]);
      rows.push(["location", country.url, "event", event.url, event.title, "location_to_event"]);
    }
  }

  const byCategory = new Map();
  for (const event of events) {
    const key = event.category.target;
    if (!byCategory.has(key)) byCategory.set(key, { info: event.category, events: [] });
    byCategory.get(key).events.push(event);
  }
  for (const { info, events: categoryEvents } of byCategory.values()) {
    for (const event of categoryEvents) {
      rows.push(["category", info.target, "event", event.url, event.title, "category_to_event"]);
    }
    for (const category of relatedCategories(info)) {
      rows.push(["category", info.target, "category", category.url, category.label, "category_to_related_category"]);
    }
  }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  writeFileWithRetry(outFile, rows.map((row) => row.map(csv).join(",")).join("\n") + "\n");
  return rows.length - 1;
}

const events = buildEvents();
const eventChanges = updateEvents(events);
const locationChanges = updateLocations(events);
const categoryChanges = updateCategories(events);
const rowCount = writeMap(events);

console.log(`Mapped ${events.length} event views into ${rowCount} link rows.`);
console.log(`Updated ${eventChanges} event views, ${locationChanges} location pages, ${categoryChanges} category pages.`);
