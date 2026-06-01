from __future__ import annotations

import json
import math
import re
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
STAMP = "1 June 2026"


@dataclass
class Country:
    name: str
    continent: str
    slug: str
    city_slug: str | None = None

    @property
    def abs_url(self) -> str:
        return f"/content/locations/{self.continent}/{self.slug}/index.html"

    @property
    def abs_flag(self) -> str:
        return f"/content/locations/{self.continent}/{self.slug}/img/flag.svg"


COUNTRIES = {
    "usa": Country("United States", "north-america", "usa"),
    "india": Country("India", "asia", "india"),
    "sri-lanka": Country("Sri Lanka", "asia", "sri-lanka"),
    "canada": Country("Canada", "north-america", "canada", "montreal"),
    "austria": Country("Austria", "europe", "austria", "vienna"),
    "saudi-arabia": Country("Saudi Arabia", "asia", "saudi-arabia", "mecca"),
    "france": Country("France", "europe", "france", "paris"),
}


EVENTS = [
    {
        "slug": "super-bowl",
        "old_slugs": ["super-bowl-lx"],
        "title": "Super Bowl",
        "edition": "Super Bowl LXI",
        "topic_path": "sport/american-football",
        "topic_label": "American Football",
        "cat": "sport",
        "topic": "american-football",
        "reach": "global",
        "countries": ["usa"],
        "city": "Inglewood",
        "venue": "SoFi Stadium",
        "date_label": "14 Feb 2027",
        "start": "2027-02-14",
        "end": "2027-02-14",
        "keywords": "super bowl, super bowl halftime show, super bowl tickets",
        "intro": "The NFL title game returns to the Los Angeles area at SoFi Stadium, combining championship football, halftime entertainment and one of the world's most concentrated event travel weekends.",
        "why": "The page now points to the next Super Bowl instead of the completed February 2026 edition.",
        "structure": [("Game", "NFL championship", "AFC champion vs NFC champion."), ("Halftime", "Live show", "Entertainment details are announced separately."), ("Host weekend", "Fan events", "City activations and ticketed side events build around game week.")],
        "motif": "football",
        "palette": ("#17324f", "#d9a441", "#f4f0e8"),
    },
    {
        "slug": "icc-t20-world-cup",
        "old_slugs": ["icc-t20-world-cup-2026"],
        "title": "ICC T20 World Cup",
        "edition": "ICC T20 World Cup 2027",
        "topic_path": "sport/cricket",
        "topic_label": "Cricket",
        "cat": "sport",
        "topic": "cricket",
        "reach": "global",
        "countries": ["india", "sri-lanka"],
        "city": "Host cities TBC",
        "venue": "India and Sri Lanka venues",
        "date_label": "Feb-Mar 2027 TBC",
        "start": "2027-02-07",
        "end": "2027-03-08",
        "keywords": "t20 world cup, icc t20, t20 world cup fixtures",
        "intro": "The T20 World Cup guide is rolled forward as a planning shell until the next verified fixture window is confirmed.",
        "why": "Cricket travel depends on the match list, host cities and ticket releases, so stale 2026 dates have been removed from the active card.",
        "structure": [("Group stage", "Dense match calendar", "Use the page for host-city and date updates."), ("Knockouts", "Semi-finals and final", "Replace TBC blocks once fixtures are verified."), ("Travel", "Multi-city planning", "Keep host-country context visible.")],
        "motif": "cricket",
        "palette": ("#0f5f4a", "#f2c14e", "#e6f5ef"),
        "tbc": True,
    },
    {
        "slug": "canadian-grand-prix",
        "old_slugs": ["canada-grand-prix"],
        "title": "Canadian Grand Prix",
        "edition": "Canadian Grand Prix 2027",
        "topic_path": "sport/formula-1",
        "topic_label": "Formula 1",
        "cat": "motor",
        "topic": "formula-1",
        "reach": "global",
        "countries": ["canada"],
        "city": "Montreal",
        "venue": "Circuit Gilles Villeneuve",
        "date_label": "2027 date TBC",
        "start": "2027-06-01",
        "end": "2027-06-01",
        "keywords": "canadian grand prix, formula 1, montreal",
        "intro": "Montreal's island circuit is kept as the planning focus for the next Canadian Grand Prix edition.",
        "why": "The Canadian Grand Prix drives hotel pressure around Parc Jean-Drapeau and is best planned as a whole race weekend.",
        "structure": [("Practice", "Track acclimatisation", "Use this for Friday schedule notes."), ("Qualifying", "Grid order", "Update when the 2027 timetable is published."), ("Race", "Grand Prix", "Final classification belongs here after the event.")],
        "motif": "f1",
        "palette": ("#b91c1c", "#f8fafc", "#18324a"),
        "tbc": True,
    },
    {
        "slug": "eurovision-semi-final-1",
        "old_slugs": ["eurovision-semi-final-1"],
        "title": "Eurovision Semi-Final 1",
        "edition": "Eurovision Semi-Final 1 2027",
        "topic_path": "music/song-contests",
        "topic_label": "Song Contests",
        "cat": "culture",
        "topic": "music",
        "reach": "continent",
        "countries": ["austria"],
        "city": "Host city TBC",
        "venue": "Arena TBC",
        "date_label": "May 2027 TBC",
        "start": "2027-05-01",
        "end": "2027-05-01",
        "keywords": "eurovision semi final 1, eurovision 2027, song contest",
        "intro": "The first live Eurovision semi-final page stays ready for the next contest week, with host details marked TBC until the broadcaster confirms them.",
        "why": "Semi-final pages are useful for running order, qualifiers and broadcast time, so the old 2026 listing is no longer the active card.",
        "structure": [("Draw", "Allocation and running order", "Add official draw data when published."), ("Live show", "Qualifying performances", "Track songs, countries and qualifiers."), ("Result", "Finalists", "Replace TBC with verified qualifiers.")],
        "motif": "eurovision",
        "palette": ("#5b21b6", "#f472b6", "#f8fafc"),
        "tbc": True,
    },
    {
        "slug": "eurovision-semi-final-2",
        "old_slugs": ["eurovision-semi-final-2"],
        "title": "Eurovision Semi-Final 2",
        "edition": "Eurovision Semi-Final 2 2027",
        "topic_path": "music/song-contests",
        "topic_label": "Song Contests",
        "cat": "culture",
        "topic": "music",
        "reach": "continent",
        "countries": ["austria"],
        "city": "Host city TBC",
        "venue": "Arena TBC",
        "date_label": "May 2027 TBC",
        "start": "2027-05-01",
        "end": "2027-05-01",
        "keywords": "eurovision semi final 2, eurovision 2027, song contest",
        "intro": "The second semi-final page is rolled forward for the next Eurovision week and kept clean until the official host and running order are known.",
        "why": "The second semi-final decides the remaining qualifiers, so the page should point to the next edition rather than a completed 2026 show.",
        "structure": [("Draw", "Allocation and running order", "Add official draw data when published."), ("Live show", "Qualifying performances", "Track songs, countries and qualifiers."), ("Result", "Finalists", "Replace TBC with verified qualifiers.")],
        "motif": "eurovision",
        "palette": ("#7c2d12", "#fb923c", "#fff7ed"),
        "tbc": True,
    },
    {
        "slug": "eurovision-grand-final",
        "old_slugs": ["eurovision-grand-final"],
        "title": "Eurovision Grand Final",
        "edition": "Eurovision Grand Final 2027",
        "topic_path": "music/song-contests",
        "topic_label": "Song Contests",
        "cat": "culture",
        "topic": "music",
        "reach": "continent",
        "countries": ["austria"],
        "city": "Host city TBC",
        "venue": "Arena TBC",
        "date_label": "May 2027 TBC",
        "start": "2027-05-01",
        "end": "2027-05-01",
        "keywords": "eurovision grand final, eurovision 2027, song contest",
        "intro": "The Eurovision final page now points to the next Saturday-night final, with host details left open until official confirmation.",
        "why": "Final-night search demand starts months ahead, so the page should collect running order, finalists, voting and winner updates for 2027.",
        "structure": [("Finalists", "Direct finalists and qualifiers", "Add countries once the line-up is known."), ("Voting", "Jury and public vote", "Track official voting rules."), ("Winner", "Result", "Replace TBC after the final.")],
        "motif": "eurovision",
        "palette": ("#1d4ed8", "#facc15", "#eff6ff"),
        "tbc": True,
    },
    {
        "slug": "hajj",
        "old_slugs": ["hajj-2026"],
        "title": "Hajj",
        "edition": "Hajj 2027",
        "topic_path": "culture/religion",
        "topic_label": "Religion",
        "cat": "culture",
        "topic": "religion",
        "reach": "global",
        "countries": ["saudi-arabia"],
        "city": "Mecca",
        "venue": "Holy sites in and around Mecca",
        "date_label": "May 2027 TBC",
        "start": "2027-05-15",
        "end": "2027-05-20",
        "keywords": "hajj 2027, mecca, pilgrimage",
        "intro": "Hajj is the annual Islamic pilgrimage to Mecca; Gregorian dates move each year and must be checked against official Saudi guidance.",
        "why": "Pilgrimage planning depends on permits, health guidance, heat, transport and official dates, so the page is rolled forward with TBC clearly visible.",
        "structure": [("Ihram", "Pilgrimage state", "Check official entry and permit guidance."), ("Arafat", "Peak day", "The main rite should be verified close to the year."), ("Mina", "Final rites", "Use official transport and safety notes.")],
        "motif": "hajj",
        "palette": ("#114232", "#c9a227", "#f8f1dc"),
        "tbc": True,
    },
    {
        "slug": "indianapolis-500",
        "old_slugs": ["indianapolis-500"],
        "title": "Indianapolis 500",
        "edition": "Indianapolis 500 2027",
        "topic_path": "sport/motorsport",
        "topic_label": "Motorsport",
        "cat": "motor",
        "topic": "motorsport",
        "reach": "global",
        "countries": ["usa"],
        "city": "Indianapolis",
        "venue": "Indianapolis Motor Speedway",
        "date_label": "30 May 2027",
        "start": "2027-05-30",
        "end": "2027-05-30",
        "keywords": "indy 500, indianapolis 500, indy 500 tickets",
        "intro": "The 500-mile race moves to its next Memorial Day weekend edition at Indianapolis Motor Speedway.",
        "why": "Race day is the fixed planning anchor, while practice, qualifying and Carb Day details can be added as the official schedule appears.",
        "structure": [("Practice", "May build-up", "Add official session dates."), ("Qualifying", "Grid order", "Track Pole Day and bumping notes."), ("Race", "500 miles", "Final result and winner go here after the race.")],
        "motif": "indy",
        "palette": ("#111827", "#ef4444", "#f8fafc"),
    },
    {
        "slug": "ipl-final",
        "old_slugs": ["ipl-final-2026"],
        "title": "IPL Final",
        "edition": "IPL Final 2027",
        "topic_path": "sport/cricket",
        "topic_label": "Cricket",
        "cat": "sport",
        "topic": "cricket",
        "reach": "continent",
        "countries": ["india"],
        "city": "Host city TBC",
        "venue": "Venue TBC",
        "date_label": "May 2027 TBC",
        "start": "2027-05-01",
        "end": "2027-05-01",
        "keywords": "ipl final, ipl schedule, ipl tickets",
        "intro": "The IPL final page is kept as a next-edition planning shell until the 2027 playoff venue and date are officially confirmed.",
        "why": "The final creates late hotel and ticket demand around one host city; stale 2026 details are replaced with a clear future page.",
        "structure": [("Playoffs", "Qualifier path", "Add teams when the bracket is known."), ("Final", "T20 title match", "Update venue and start time from official IPL sources."), ("Result", "Champion", "Replace TBC after the match.")],
        "motif": "cricket",
        "palette": ("#1e3a8a", "#f97316", "#eef2ff"),
        "tbc": True,
    },
    {
        "slug": "pga-championship",
        "old_slugs": ["pga-championship-follow-up"],
        "existing_page": True,
        "title": "PGA Championship",
        "edition": "PGA Championship 2027",
        "topic_path": "sport/golf",
        "topic_label": "Golf",
        "cat": "sport",
        "topic": "golf",
        "reach": "global",
        "countries": ["usa"],
        "city": "Frisco",
        "venue": "PGA Frisco",
        "date_label": "20-23 May 2027",
        "start": "2027-05-20",
        "end": "2027-05-23",
        "keywords": "pga championship 2027, golf major, pga frisco",
        "intro": "The PGA Championship page now points to the next edition at PGA Frisco, with leaderboards and tee-time notes reserved for the event window.",
        "why": "Golf major pages age quickly after Sunday; the new page keeps the next venue, dates and planning context visible.",
        "structure": [("Round 1", "Opening scores", "Add tee times when published."), ("Cut", "Friday pressure", "Track projected cut and notables."), ("Final round", "Champion", "Replace TBC after Sunday.")],
        "motif": "golf",
        "palette": ("#14532d", "#d4af37", "#f7fee7"),
    },
    {
        "slug": "roland-garros",
        "old_slugs": ["roland-garros-2026"],
        "title": "Roland-Garros",
        "edition": "Roland-Garros 2027",
        "topic_path": "sport/tennis",
        "topic_label": "Tennis",
        "cat": "sport",
        "topic": "tennis",
        "reach": "global",
        "countries": ["france"],
        "city": "Paris",
        "venue": "Stade Roland-Garros",
        "date_label": "May-Jun 2027 TBC",
        "start": "2027-05-01",
        "end": "2027-06-01",
        "keywords": "roland garros 2027, french open, tennis tickets",
        "intro": "The clay-court Grand Slam page is rolled to the next main-draw window in Paris.",
        "why": "Ticketing, draw release and daily order of play all belong to the upcoming edition, while the old 2026 page can retire.",
        "structure": [("Early rounds", "Outer-court volume", "Useful for ticket and daily schedule notes."), ("Second week", "Quarterfinals onward", "Track draw paths and major stories."), ("Finals", "Champions", "Replace TBC after finals weekend.")],
        "motif": "tennis",
        "palette": ("#9a3412", "#2563eb", "#fff7ed"),
        "tbc": True,
    },
]


def esc(value: str) -> str:
    return str(value).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def font(size: int, bold: bool = False):
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            pass
    return ImageFont.load_default()


def wrap(text: str, fnt, width: int) -> list[str]:
    draw = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    lines, current = [], ""
    for word in text.split():
        trial = f"{current} {word}".strip()
        if draw.textbbox((0, 0), trial, font=fnt)[2] <= width or not current:
            current = trial
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines[:3]


def gradient(draw, w: int, h: int, a: str, b: str) -> None:
    ca = tuple(int(a[i : i + 2], 16) for i in (1, 3, 5))
    cb = tuple(int(b[i : i + 2], 16) for i in (1, 3, 5))
    for y in range(h):
        t = y / max(1, h - 1)
        draw.line((0, y, w, y), fill=tuple(int(ca[i] * (1 - t) + cb[i] * t) for i in range(3)))


def motif(draw, event, w: int, h: int) -> None:
    cx, cy = int(w * 0.67), int(h * 0.52)
    kind = event["motif"]
    primary, secondary, _ = event["palette"]
    if kind == "football":
        draw.rounded_rectangle((cx - 220, cy - 120, cx + 260, cy + 120), radius=120, fill="#7c2d12", outline="#fef3c7", width=8)
        draw.arc((cx - 180, cy - 150, cx + 220, cy + 150), 60, 300, fill="#fef3c7", width=10)
        draw.line((cx - 120, cy, cx + 120, cy), fill="#fef3c7", width=9)
        for i in range(-3, 4):
            draw.line((cx + i * 22, cy - 34, cx + i * 22, cy + 34), fill="#fef3c7", width=6)
    elif kind == "cricket":
        draw.ellipse((cx - 210, cy - 120, cx + 210, cy + 120), fill="#166534", outline="#fef3c7", width=8)
        draw.rectangle((cx - 35, cy - 115, cx + 35, cy + 115), fill="#d6a86c")
        draw.line((cx + 150, cy + 120, cx + 250, cy - 150), fill="#f59e0b", width=16)
        draw.ellipse((cx - 185, cy - 15, cx - 145, cy + 25), fill="#ef4444")
    elif kind == "f1":
        draw.line((cx - 260, cy + 120, cx - 90, cy - 70, cx + 90, cy - 50, cx + 260, cy + 100), fill="#111827", width=48, joint="curve")
        draw.line((cx - 260, cy + 120, cx - 90, cy - 70, cx + 90, cy - 50, cx + 260, cy + 100), fill="#e5e7eb", width=8, joint="curve")
        draw.rounded_rectangle((cx - 70, cy + 15, cx + 150, cy + 80), radius=25, fill="#dc2626", outline="#fee2e2", width=4)
        draw.ellipse((cx - 40, cy + 68, cx + 12, cy + 120), fill="#111827")
        draw.ellipse((cx + 95, cy + 68, cx + 147, cy + 120), fill="#111827")
    elif kind == "eurovision":
        for r, color in [(170, "#ffffff55"), (130, secondary), (88, primary)]:
            draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=color)
        draw.rectangle((cx - 18, cy - 130, cx + 18, cy + 60), fill="#111827")
        draw.ellipse((cx - 64, cy - 190, cx + 64, cy - 70), fill="#f8fafc", outline="#111827", width=6)
        for i in range(9):
            angle = i * math.pi / 4
            draw.line((cx, cy - 60, cx + math.cos(angle) * 250, cy - 60 + math.sin(angle) * 170), fill="#ffffff66", width=5)
    elif kind == "hajj":
        draw.rectangle((cx - 135, cy - 145, cx + 135, cy + 115), fill="#111827")
        draw.rectangle((cx - 135, cy - 145, cx + 135, cy - 102), fill="#d4af37")
        draw.arc((cx - 260, cy + 20, cx + 260, cy + 260), 185, 355, fill="#f8f1dc", width=16)
        draw.arc((cx - 310, cy - 15, cx + 310, cy + 305), 185, 355, fill="#f8f1dc88", width=10)
    elif kind == "indy":
        draw.ellipse((cx - 280, cy - 150, cx + 280, cy + 150), outline="#f8fafc", width=34)
        draw.ellipse((cx - 210, cy - 82, cx + 210, cy + 82), outline="#111827", width=28)
        draw.rounded_rectangle((cx - 100, cy - 30, cx + 115, cy + 32), radius=20, fill="#ef4444", outline="#fee2e2", width=4)
        draw.ellipse((cx - 68, cy + 18, cx - 20, cy + 66), fill="#111827")
        draw.ellipse((cx + 55, cy + 18, cx + 103, cy + 66), fill="#111827")
    elif kind == "golf":
        draw.ellipse((cx - 250, cy + 20, cx + 260, cy + 180), fill="#65a30d")
        draw.ellipse((cx - 68, cy + 70, cx + 68, cy + 105), fill="#f8fafc")
        draw.line((cx + 110, cy - 150, cx + 110, cy + 90), fill="#f8fafc", width=8)
        draw.polygon([(cx + 118, cy - 150), (cx + 235, cy - 115), (cx + 118, cy - 80)], fill="#dc2626")
        draw.ellipse((cx - 170, cy - 50, cx - 120, cy), fill="#f8fafc")
    elif kind == "tennis":
        draw.ellipse((cx - 250, cy - 130, cx + 250, cy + 130), fill="#c2410c", outline="#f8fafc", width=10)
        draw.line((cx - 250, cy, cx + 250, cy), fill="#f8fafc", width=6)
        draw.line((cx, cy - 130, cx, cy + 130), fill="#f8fafc", width=6)
        draw.ellipse((cx + 80, cy - 170, cx + 150, cy - 100), fill="#d9f99d")


def image(event, out: Path, size: tuple[int, int]) -> None:
    w, h = size
    primary, secondary, paper = event["palette"]
    img = Image.new("RGB", size, primary)
    draw = ImageDraw.Draw(img, "RGBA")
    gradient(draw, w, h, primary, secondary)
    for i in range(12):
        x, y, r = int((i * 173) % w), int((i * 97) % h), 90 + (i % 4) * 35
        draw.ellipse((x - r, y - r, x + r, y + r), fill="#ffffff18")
    motif(draw, event, w, h)
    overlay = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(overlay).rectangle((0, 0, int(w * 0.53), h), fill=(5, 15, 24, 176))
    img = Image.alpha_composite(img.convert("RGBA"), overlay)
    draw = ImageDraw.Draw(img)
    draw.text((52, 48), event["topic_label"].upper(), fill="#ffffffcc", font=font(max(14, w // 42), True))
    title_font = font(max(30, w // 17), True)
    y = 98
    for line in wrap(event["edition"], title_font, int(w * 0.43)):
        draw.text((52, y), line, fill="white", font=title_font)
        y += title_font.size + 4
    draw.text((54, min(h - 96, y + 20)), event["date_label"], fill=paper, font=font(max(18, w // 31), True))
    draw.text((54, min(h - 54, y + 58)), event["venue"], fill="#ffffffcc", font=font(max(13, w // 52)))
    img = img.filter(ImageFilter.UnsharpMask(radius=1.4, percent=115, threshold=4))
    img.convert("RGB").save(out, "PNG", optimize=True)


def chip(country: Country) -> str:
    flag = ROOT / "content" / "locations" / country.continent / country.slug / "img" / "flag.svg"
    if flag.exists():
        return f'<a class="country" href="{country.abs_url}"><img src="{country.abs_flag}" alt="" width="20" height="14" loading="lazy">{esc(country.name)}</a>'
    return f'<a class="country" href="{country.abs_url}">{esc(country.name)}</a>'


def city(event) -> str:
    countries = [COUNTRIES[key] for key in event["countries"]]
    if len(countries) == 1 and countries[0].city_slug and "TBC" not in event["city"]:
        path = ROOT / "content" / "locations" / countries[0].continent / countries[0].slug / f"{countries[0].city_slug}.html"
        if path.exists():
            return f'<a href="/content/locations/{countries[0].continent}/{countries[0].slug}/{countries[0].city_slug}.html">{esc(event["city"])}</a>'
    return f"<strong>{esc(event['city'])}</strong>"


def page(event) -> str:
    countries = [COUNTRIES[key] for key in event["countries"]]
    country_chips = " ".join(chip(c) for c in countries)
    country_names = " / ".join(c.name for c in countries)
    event_dir = f"content/categories/{event['topic_path']}/events"
    desc = f"{event['edition']}: {event['date_label']}, {event['venue']} and planning notes in a quick OneSliders guide."
    structure = "".join(f"<tr><th>{esc(a)}</th><td>{esc(b)}</td><td>{esc(c)}</td></tr>" for a, b, c in event["structure"])
    schema = {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": event["edition"],
        "description": desc,
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "image": f"https://one-sliders.com/{event_dir}/img/{event['slug']}-hero.png",
        "location": {"@type": "Place", "name": event["venue"], "address": {"@type": "PostalAddress", "addressLocality": event["city"], "addressCountry": country_names}},
    }
    if not event.get("tbc"):
        schema["startDate"] = event["start"]
        schema["endDate"] = event["end"]
    status = "Date TBC" if event.get("tbc") else "Scheduled"
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="index,follow">
  <meta name="content-language" content="en">
  <link rel="icon" href="../../../../../../assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="../../../../../../assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../../../../../../assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="../../../../../../assets/icons/site.webmanifest">
  <link rel="stylesheet" href="../../../../../../assets/css/event-detail.css">
  <link rel="preload" as="image" href="img/{event['slug']}-hero.png">
  <link rel="canonical" href="https://one-sliders.com/{event_dir}/{event['slug']}.html">
  <meta name="theme-color" content="#214e68">
  <meta name="description" content="{esc(desc)}">
  <meta name="keywords" content="{esc(event['keywords'])}">
  <meta property="og:title" content="{esc(event['edition'])} | OneSliders">
  <meta property="og:description" content="{esc(desc)}">
  <meta property="og:image" content="https://one-sliders.com/{event_dir}/img/{event['slug']}-hero.png">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://one-sliders.com/{event_dir}/{event['slug']}.html">
  <meta name="twitter:card" content="summary_large_image">
  <title>{esc(event['edition'])} | OneSliders</title>
  <script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>
</head>
<body class="event-page">
  <nav class="top-menu" aria-label="Event navigation">
    <a class="nav-icon" href="../content/events/index.html" title="Events" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a>
    <a class="nav-icon" href="../content/locations/index.html" title="World" aria-label="World"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>
    <a class="nav-icon" href="../content/categories/index.html" title="Categories" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a>
    <span class="nav-divider"></span>
    <a class="nav-pill" href="../content/categories{event['topic_path']}.html">{esc(event['topic_label'])}</a>
    <details class="event-language-menu"><summary aria-label="Language"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg><span>EN</span></summary><div class="event-language-list"><span>Language</span><a href="#" aria-current="true"><span class="language-code">EN</span><span class="language-name">English</span></a></div></details>
  </nav>
  <main class="event-shell">
    <section class="event-hero" aria-labelledby="event-title">
      <img class="event-hero__image" src="img/{event['slug']}-hero.png" alt="{esc(event['edition'])} hero image" width="1200" height="630" fetchpriority="high">
      <div class="event-hero__inner">
        <div>
          <div class="event-badge-row"><p class="event-kicker">{esc(event['topic_label'])} &middot; 2027</p></div>
          <h1 class="event-title" id="event-title">{esc(event['edition'])}</h1>
          <p class="event-intro">{esc(event['intro'])}</p>
        </div>
        <div class="event-hero__facts" aria-label="{esc(event['edition'])} key facts">
          <div class="event-hero__fact"><span>Country</span>{country_chips}</div>
          <div class="event-hero__fact"><span>City</span>{city(event)}</div>
          <div class="event-hero__fact"><span>Venue</span><strong>{esc(event['venue'])}</strong></div>
          <div class="event-hero__fact"><span>Dates</span><strong>{esc(event['date_label'])}</strong></div>
        </div>
      </div>
    </section>
    <nav class="event-actions" aria-label="Calendar actions"><a class="event-button event-button--primary" href="{event['slug']}.ics">Add to calendar</a></nav>
    <div class="event-layout">
      <div class="event-main">
        <section class="event-section"><h2 class="event-section__title">What changed</h2><p>{esc(event['why'])}</p><ul class="event-list"><li>The active page is now under the category event structure.</li><li>The edition shown here is 2027.</li><li>Countries are rendered as flag, name and link: {country_chips}.</li></ul></section>
        <section class="event-section"><h2 class="event-section__title">Event structure</h2><table class="event-table"><thead><tr><th>Part</th><th>Focus</th><th>Visitor use</th></tr></thead><tbody>{structure}</tbody></table></section>
        <section class="event-section"><h2 class="event-section__title">Planning notes</h2><ul class="event-list"><li>Check official organisers before booking; schedules can shift.</li><li>Use this page for dates, venue context, travel pressure and result updates.</li><li>Replace TBC fields only when a verified source is available.</li></ul></section>
      </div>
      <aside class="event-side" aria-label="{esc(event['edition'])} details">
        <section class="event-section"><h2 class="event-section__title">Quick facts</h2><div class="event-fact-grid"><div class="event-fact"><span>Status</span><strong>{status}</strong></div><div class="event-fact"><span>Edition</span><strong>2027</strong></div><div class="event-fact"><span>Format</span><strong>{esc(event['topic_label'])}</strong></div><div class="event-fact"><span>Last updated</span><strong>{STAMP}</strong></div></div></section>
        <section class="event-section"><h2 class="event-section__title">Useful links</h2><div class="event-link-grid"><a class="event-link-card event-link-card--media" href="{countries[0].abs_url}"><img class="event-link-card__thumb" src="{countries[0].abs_flag}" alt="" width="46" height="46" loading="lazy"><span><span>Country</span><strong>{esc(countries[0].name)}</strong></span></a><a class="event-link-card event-link-card--media event-link-card--fallback" href="../content/categories{event['topic_path']}.html"><span class="event-link-card__icon">{esc(event['topic_label'][:2].upper())}</span><span><span>Category</span><strong>{esc(event['topic_label'])}</strong></span></a></div></section>
      </aside>
    </div>
    <div class="event-source"><span>Source status: future-facing OneSliders planning page; official details may be TBC.</span><span>Updated {STAMP}</span></div>
  </main>
</body>
</html>
"""


def ics(event) -> str:
    return f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//OneSliders//Event Calendar//EN
BEGIN:VEVENT
UID:{event['slug']}@one-sliders.com
DTSTAMP:20260601T000000Z
DTSTART;VALUE=DATE:{event['start'].replace('-', '')}
DTEND;VALUE=DATE:{event['end'].replace('-', '')}
SUMMARY:{event['edition']}
DESCRIPTION:{event['intro']}
LOCATION:{event['venue']}, {event['city']}
END:VEVENT
END:VCALENDAR
"""


def redirect(title: str, target: str) -> str:
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0; url={target}">
  <meta name="robots" content="noindex,follow">
  <link rel="canonical" href="{target}">
  <title>{esc(title)} moved</title>
</head>
<body>
  <main class="seo-redirect"><h1>This event has moved</h1><p>The current page is <a href="{target}">{esc(title)}</a>.</p></main>
</body>
</html>
"""


def card(event, category_prefix: str) -> str:
    href = f"{category_prefix}{event['topic_path']}/events/{event['slug']}.html"
    img_src = f"{category_prefix}{event['topic_path']}/events/img/{event['slug']}-mini.png"
    country = " / ".join(COUNTRIES[key].name for key in event["countries"])
    return (
        f'        <a class="event-card" data-end="{event["end"]}" data-cat="{event["cat"]}" data-topic="{event["topic"]}" '
        f'data-cont="{COUNTRIES[event["countries"][0]].continent}" data-country="{COUNTRIES[event["countries"][0]].slug}" '
        f'data-keywords="{esc(event["keywords"])}" href="{href}" data-start="{event["start"]}" data-reach="{event["reach"]}" '
        f'><img class="card-thumb" src="{img_src}" alt="{esc(event["edition"])}" '
        f'loading="lazy" width="400" height="300"><div class="card-stripe"></div><div class="card-body"><span class="cat-pill">{esc(event["topic_label"])}</span>'
        f'<strong class="card-title">{esc(event["edition"])}</strong><span class="card-meta">{esc(event["date_label"])} · {esc(event["city"])}, {esc(country)}</span></div></a>'
    )


def update_index(path: Path, category_prefix: str) -> None:
    html = path.read_text(encoding="utf-8")
    html = re.sub(
        r'\n\s*<!-- Passed 2026 events moved to categories: start -->[\s\S]*?<!-- Passed 2026 events moved to categories: end -->',
        "",
        html,
    )
    for event in EVENTS:
        for old in [event["slug"], *event["old_slugs"]]:
            html = "\n".join(
                line for line in html.splitlines()
                if not ('class="event-card"' in line and old in line)
            )
    start = "    <!-- Passed 2026 events moved to categories: start -->"
    end = "    <!-- Passed 2026 events moved to categories: end -->"
    block = f"{start}\n" + "\n".join(card(e, category_prefix) for e in EVENTS) + f"\n{end}"
    if start in html and end in html:
        html = re.sub(rf"{re.escape(start)}[\s\S]*?{re.escape(end)}", block, html)
    else:
        html = html.replace("</main>", f"{block}\n  </main>")
    path.write_text(html, encoding="utf-8")


def old_month(slug: str) -> str:
    for month in ("02", "05"):
        if (ROOT / "content" / "events" / "2026" / month / f"{slug}.html").exists():
            return month
    return "05"


def main() -> None:
    for event in EVENTS:
        event_dir = ROOT / "content" / "categories" / event["topic_path"] / "events"
        img_dir = event_dir / "img"
        img_dir.mkdir(parents=True, exist_ok=True)
        if not event.get("existing_page"):
            (event_dir / f"{event['slug']}.html").write_text(page(event), encoding="utf-8")
            (event_dir / f"{event['slug']}.ics").write_text(ics(event), encoding="utf-8")
            image(event, img_dir / f"{event['slug']}-hero.png", (1200, 630))
            image(event, img_dir / f"{event['slug']}-mini.png", (400, 300))
        target_abs = f"https://one-sliders.com/content/categories/{event['topic_path']}/events/{event['slug']}.html"
        for old in event["old_slugs"]:
            month = old_month(old)
            for root_prefix, rel_target in (
                ("content", target_abs),
            ):
                old_file = ROOT / root_prefix / "events" / "2026" / month / f"{old}.html"
                if old_file.exists():
                    old_file.write_text(redirect(event["edition"], rel_target), encoding="utf-8")
    update_index(ROOT / "content" / "events" / "index.html", "../categories")
    print(f"Moved {len(EVENTS)} passed 2026 event pages to category event pages.")


if __name__ == "__main__":
    main()
