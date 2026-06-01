import fs from "node:fs";
import path from "node:path";

const root = typeof process === "undefined" ? nodeRepl.cwd : process.cwd();

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function write(rel, value) {
  fs.writeFileSync(path.join(root, rel), value, "utf8");
}

function replaceInFile(rel, replacements) {
  let html = read(rel);
  const before = html;
  for (const [from, to] of replacements) html = html.replaceAll(from, to);
  if (html !== before) write(rel, html);
  return html !== before;
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

function ics({ uid, start, end, summary, description, location, url }) {
  const safe = (value) => value.replaceAll("\\", "\\\\").replaceAll(",", "\\,").replaceAll("\n", "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//3D Fractal//OneSliders Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}@one-sliders.com`,
    "DTSTAMP:20260528T000000Z",
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${safe(summary)}`,
    `DESCRIPTION:${safe(description)}`,
    `LOCATION:${safe(location)}`,
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\n");
}

let changed = 0;

for (const file of walk(root)) {
  const rel = relPath(file);
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  html = html.replace(/#year-\d{4}/g, "");
  html = html.replace(/<meta name="available-languages" content="[^"]*">/g, '<meta name="available-languages" content="en">');
  if (html !== before) {
    fs.writeFileSync(file, html, "utf8");
    changed += 1;
  }
}

for (const rel of [
  "content/categories/drinks/index.html",
  "content/categories/food/index.html",
]) {
  if (replaceInFile(rel, [["../../../assets/", "../../../../assets/"]])) changed += 1;
}

for (const rel of [
  "content/categories/sport/index.html",
  "content/categories/sport/index.html",
]) {
  if (replaceInFile(rel, [["stanley-cup-final-2026-hero.png", "stanley-cup-final-hero.png"]])) changed += 1;
}

replaceInFile("content/categories/sport/index.html", [
  ["../../events/2026/06/img/stanley-cup-final-hero.png", "/content/categories/sport/ice-hockey/events/img/stanley-cup-final-hero.png"],
]);
replaceInFile("content/categories/sport/index.html", [
  ["../content/events/2026/06/img/stanley-cup-final-hero.png", "/content/categories/sport/ice-hockey/events/img/stanley-cup-final-hero.png"],
]);

replaceInFile("content/events/2026/06/fifa-world-cup-2026.html", [
  ["../../../locations/north-america/usa/los-angeles.html", "../../../locations/north-america/usa/index.html"],
  ["../../../locations/north-america/usa/dallas.html", "../../../locations/north-america/usa/index.html"],
  ["../../../locations/north-america/usa/kansas-city.html", "../../../locations/north-america/usa/index.html"],
  ["../../../locations/north-america/usa/houston.html", "../../../locations/north-america/usa/index.html"],
  ["../../../locations/north-america/usa/atlanta.html", "../../../locations/north-america/usa/index.html"],
  ["../../../locations/north-america/usa/philadelphia.html", "../../../locations/north-america/usa/index.html"],
  ["../../../locations/north-america/usa/seattle.html", "../../../locations/north-america/usa/index.html"],
  ["../../../locations/north-america/usa/san-francisco.html", "../../../locations/north-america/usa/index.html"],
  ["../../../locations/north-america/usa/boston.html", "../../../locations/north-america/usa/index.html"],
  ["../../../locations/north-america/usa/miami.html", "../../../locations/north-america/usa/index.html"],
  ["../../../locations/north-america/canada/vancouver.html", "../../../locations/north-america/canada/index.html"],
  ["../../../locations/north-america/mexico/monterrey.html", "../../../locations/north-america/mexico/index.html"],
  ["../../../locations/north-america/mexico/guadalajara.html", "../../../locations/north-america/mexico/index.html"],
]);

replaceInFile("content/categories/music/song-contests/events/eurovision-song-contest.html", [
  ["../content/locations/europe/switzerland/basel.html", "../content/locations/europe/switzerland/index.html"],
  ["../content/locations/europe/sweden/malmo.html", "../content/locations/europe/sweden/index.html"],
  ["../content/locations/europe/united-kingdom/liverpool.html", "../content/locations/europe/united-kingdom/index.html"],
  ["../content/locations/europe/italy/turin.html", "../content/locations/europe/italy/index.html"],
  ["../content/locations/europe/netherlands/rotterdam.html", "../content/locations/europe/netherlands/index.html"],
]);

replaceInFile("content/events/2026/05/oslo-constitution-day.html", [
  ["../../../index.html", "/content/events/index.html"],
  ["../../../../locations/", "/content/locations/"],
  ["../../../../categories/", "/content/categories/"],
]);

replaceInFile("content/events/2026/06/le-mans-24-hours.html", [
  ["https://one-sliders.com/en//content/categories/sport/motorsport/events/le-mans-24-hours.html", "https://one-sliders.com/content/categories/sport/motorsport/events/le-mans-24-hours.html"],
]);

const calendars = [
  {
    file: "eurovision-grand-final.ics",
    uid: "eurovision-grand-final-2026",
    start: "20260516",
    end: "20260517",
    summary: "Eurovision Grand Final 2026",
    description: "Eurovision Song Contest 2026 Grand Final in Vienna.",
    location: "Vienna, Austria",
  },
  {
    file: "eurovision-semi-final-1.ics",
    uid: "eurovision-semi-final-1-2026",
    start: "20260512",
    end: "20260513",
    summary: "Eurovision Semi-Final 1 2026",
    description: "Eurovision Song Contest 2026 Semi-Final 1 in Vienna.",
    location: "Vienna, Austria",
  },
  {
    file: "eurovision-semi-final-2.ics",
    uid: "eurovision-semi-final-2-2026",
    start: "20260514",
    end: "20260515",
    summary: "Eurovision Semi-Final 2 2026",
    description: "Eurovision Song Contest 2026 Semi-Final 2 in Vienna.",
    location: "Vienna, Austria",
  },
  {
    file: "ipl-final-2026.ics",
    uid: "ipl-final-2026",
    start: "20260531",
    end: "20260601",
    summary: "IPL Final 2026",
    description: "Indian Premier League 2026 final.",
    location: "Ahmedabad, India",
  },
  {
    file: "pga-championship-follow-up.ics",
    uid: "pga-championship-follow-up-2026",
    start: "20260514",
    end: "20260518",
    summary: "PGA Championship Follow-up 2026",
    description: "PGA Championship 2026 follow-up window at Aronimink.",
    location: "Aronimink Golf Club, Newtown Square, USA",
  },
  {
    file: "roland-garros-2026.ics",
    uid: "roland-garros-2026",
    start: "20260518",
    end: "20260608",
    summary: "Roland-Garros 2026",
    description: "Roland-Garros 2026 at Stade Roland-Garros.",
    location: "Paris, France",
  },
];

for (const base of ["content/events/2026/05", "content/events/2026/05"]) {
  for (const calendar of calendars) {
    const target = path.join(root, base, calendar.file);
    if (!fs.existsSync(target)) {
      fs.writeFileSync(
        target,
        ics({
          ...calendar,
          url: `https://one-sliders.com/${base}/${calendar.file.replace(/\.ics$/, ".html")}`,
        }),
        "utf8",
      );
      changed += 1;
    }
  }
}

console.log(`Internal link cleanup changed or created ${changed} items.`);
