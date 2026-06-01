from __future__ import annotations

import json
import math
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
STAMP = "1 June 2026"


EVENTS = [
    {
        "slug": "super-bowl",
        "old_slug": "super-bowl-lx",
        "title": "Super Bowl",
        "edition": "Super Bowl LXI",
        "topic_path": "sport/american-football",
        "topic_label": "American Football",
        "category_label": "Sport / American Football",
        "country": {"name": "United States", "continent": "north-america", "slug": "usa"},
        "city": {"name": "Inglewood", "url": ""},
        "venue": "SoFi Stadium",
        "dates": "14 Feb 2027",
        "start": "2027-02-14",
        "end_exclusive": "2027-02-15",
        "status": "Scheduled",
        "format": "NFL championship game",
        "first_held": "1967",
        "frequency": "Annual",
        "intro": "The NFL title game returns to the Los Angeles area at SoFi Stadium, combining championship football, halftime entertainment and one of the world's busiest event travel weekends.",
        "history": "The Super Bowl grew from the AFL-NFL championship into a sports, broadcast and entertainment event followed far beyond the host city.",
        "rules": "One game decides the NFL champion. AFC and NFC winners qualify through the playoffs; halftime entertainment is announced separately.",
        "records": "TV audience, attendance, MVP, scoring records and halftime performers are the key records to update after the game.",
        "notable": [
            "Host context: the Los Angeles area and SoFi Stadium.",
            "The 2027 edition is the next active planning page.",
            "The old February 2026 card has been removed from the active month view.",
        ],
        "questions": [
            ["When is the event?", "14 Feb 2027", "Super Bowl LXI is scheduled for Sunday 14 February 2027."],
            ["Where is it held?", "Inglewood, {country}", "The planned venue is SoFi Stadium in the Los Angeles area."],
            ["How do I buy tickets?", "Use official channels", "Ticket and resale details should be checked through the NFL, teams and official partners."],
            ["What is the programme?", "Game, halftime show and host-week events", "Exact kick-off and entertainment details can be updated when confirmed."],
            ["What happened last edition?", "Archive TBC", "Add verified winner, score and MVP details when available."],
        ],
        "sources": [{"label": "NFL", "url": "https://www.nfl.com/super-bowl/"}],
        "palette": ((23, 50, 79), (217, 164, 65), (244, 240, 232)),
        "motif": "football",
        "old_month": "02",
        "index": {"cat": "sport", "topic": "american-football", "cont": "north-america", "country": "usa", "reach": "global", "keywords": "super bowl, super bowl halftime show, super bowl tickets"},
    },
    {
        "slug": "icc-t20-world-cup",
        "old_slug": "icc-t20-world-cup-2026",
        "title": "ICC T20 World Cup",
        "edition": "ICC T20 World Cup 2027",
        "topic_path": "sport/cricket",
        "topic_label": "Cricket",
        "category_label": "Sport / Cricket",
        "countries": [
            {"name": "India", "continent": "asia", "slug": "india"},
            {"name": "Sri Lanka", "continent": "asia", "slug": "sri-lanka"},
        ],
        "country": {"name": "India", "continent": "asia", "slug": "india"},
        "city": {"name": "Host cities TBC", "url": ""},
        "venue": "India and Sri Lanka venues",
        "dates": "Feb-Mar 2027 TBC",
        "start": "2027-02-07",
        "end_exclusive": "2027-03-09",
        "status": "Date TBC",
        "format": "T20 international tournament",
        "first_held": "2007",
        "frequency": "Recurring",
        "intro": "The T20 World Cup guide is rolled forward as a planning shell until the next verified fixture window, host cities and match schedule are confirmed.",
        "history": "The ICC T20 World Cup turns short-format cricket into a compressed global tournament with group matches, knockouts and a final.",
        "rules": "Teams qualify through ICC pathways. The match list, host cities and ticket windows should stay TBC until official confirmation.",
        "records": "Champion, final score, player of the tournament and attendance notes are the key records to update after the event.",
        "notable": [
            "Host context: India and Sri Lanka.",
            "The 2027 edition is the next active planning page.",
            "The old February 2026 card has been removed from the active month view.",
        ],
        "questions": [
            ["When is the event?", "Feb-Mar 2027 TBC", "The exact fixture window should be verified from ICC sources."],
            ["Where is it held?", "Host cities TBC, {country}", "Venue details are TBC until the match list is confirmed."],
            ["How do I buy tickets?", "Use official channels", "Ticket windows and resale rules can change by venue."],
            ["What is the programme?", "Group stage and knockouts", "Add the official fixture list when it is published."],
            ["What happened last edition?", "Archive TBC", "Add verified champion and final details when available."],
        ],
        "sources": [{"label": "ICC", "url": "https://www.icc-cricket.com/"}],
        "palette": ((15, 95, 74), (242, 193, 78), (230, 245, 239)),
        "motif": "cricket",
        "old_month": "02",
        "index": {"cat": "sport", "topic": "cricket", "cont": "asia", "country": "india", "reach": "global", "keywords": "t20 world cup, icc t20, t20 world cup fixtures"},
    },
    {
        "slug": "world-meteorological-day",
        "old_slug": "world-meteorological-day-2026",
        "title": "World Meteorological Day",
        "edition": "World Meteorological Day 2027",
        "topic_path": "climate/weather",
        "topic_label": "Climate Weather",
        "category_label": "Climate / Weather",
        "country": {"name": "Switzerland", "continent": "europe", "slug": "switzerland"},
        "city": {"name": "Geneva", "url": ""},
        "venue": "World Meteorological Organization",
        "dates": "23 Mar 2027",
        "start": "2027-03-23",
        "end_exclusive": "2027-03-24",
        "status": "Scheduled",
        "format": "Global observance",
        "first_held": "1961",
        "frequency": "Annual",
        "intro": "World Meteorological Day focuses attention on weather, climate and water data, and on the early-warning systems communities use as climate risks grow.",
        "history": "The observance marks the World Meteorological Organization convention coming into force and turns technical weather cooperation into a public-facing climate-readiness moment.",
        "rules": "The day is an observance, not a festival programme. National meteorological services, educators and climate communicators adapt the theme locally.",
        "records": "Early-warning access, forecast reach and public preparedness are the useful records to track.",
        "notable": [
            "Host context is international weather cooperation based in Geneva.",
            "The 2027 edition is the next active planning page.",
            "The old March 2026 card has been removed from the active month view.",
        ],
        "questions": [
            ["When is the event?", "23 Mar 2027", "The annual observance falls on 23 March."],
            ["Where is it held?", "Geneva, {country}", "WMO coordinates the global observance; local weather services may run their own activity."],
            ["What is the programme?", "Campaigns and public communication", "Expect theme material, national meteorological service posts and education resources."],
            ["Who participates?", "Meteorological services and climate communicators", "Schools, forecasters, emergency planners and climate educators can use the day."],
            ["What happened last edition?", "Archive TBC", "Add verified 2026 campaign details when a reliable source is available."],
        ],
        "sources": [{"label": "World Meteorological Organization", "url": "https://wmo.int/"}],
        "palette": ((31, 95, 114), (126, 187, 207), (239, 246, 249)),
        "motif": "weather",
        "old_month": "03",
        "index": {"cat": "nature", "topic": "weather", "cont": "europe", "country": "switzerland", "reach": "global", "keywords": "world meteorological day, WMO, weather, climate"},
    },
    {
        "slug": "earth-day",
        "old_slug": "earth-day-2026",
        "title": "Earth Day",
        "edition": "Earth Day 2027",
        "topic_path": "climate/climate-action",
        "topic_label": "Climate Action",
        "category_label": "Climate / Climate Action",
        "country": {"name": "Worldwide", "continent": "", "slug": ""},
        "city": {"name": "Local communities", "url": ""},
        "venue": "Global local actions",
        "dates": "22 Apr 2027",
        "start": "2027-04-22",
        "end_exclusive": "2027-04-23",
        "status": "Scheduled",
        "format": "Global action day",
        "first_held": "1970",
        "frequency": "Annual",
        "intro": "Earth Day turns climate and environmental concern into public action through community events, education, cleanup work and energy campaigns.",
        "history": "The first Earth Day in 1970 helped make modern environmental action visible at mass scale, and the date is still used for local campaigns worldwide.",
        "rules": "There is no single venue or ticket gate. The event is a shared date for schools, cities, organisations and volunteers.",
        "records": "Participation, cleanup projects and campaign reach are the practical records to update after the edition.",
        "notable": [
            "Host context is worldwide local action rather than one country.",
            "The 2027 edition is the next active planning page.",
            "The old April 2026 card has been removed from the active month view.",
        ],
        "questions": [
            ["When is the event?", "22 Apr 2027", "Earth Day is observed every year on 22 April."],
            ["Where is it held?", "Worldwide", "Local events can happen in schools, cities, parks, offices and community spaces."],
            ["How do I take part?", "Use local organisers or official campaign material", "Look for city, school, NGO or workplace activities close to the date."],
            ["What is the programme?", "Cleanup, education and climate action", "Programmes vary locally and should be checked with the organiser running each action."],
            ["What happened last edition?", "Archive TBC", "Add verified 2026 campaign details when a reliable source is available."],
        ],
        "sources": [{"label": "EarthDay.org", "url": "https://www.earthday.org/"}],
        "palette": ((24, 96, 71), (77, 150, 110), (239, 248, 241)),
        "motif": "earth",
        "old_month": "04",
        "index": {"cat": "nature", "topic": "climate-action", "cont": "global", "country": "worldwide", "reach": "global", "keywords": "earth day, climate action, environment, sustainability"},
    },
    {
        "slug": "masters-tournament",
        "old_slug": "masters-tournament",
        "title": "Masters Tournament",
        "edition": "Masters Tournament 2027",
        "topic_path": "sport/golf",
        "topic_label": "Golf",
        "category_label": "Sport / Golf",
        "country": {"name": "United States", "continent": "north-america", "slug": "usa"},
        "city": {"name": "Augusta", "url": "/content/locations/north-america/usa/augusta.html"},
        "venue": "Augusta National Golf Club",
        "dates": "8-11 Apr 2027",
        "start": "2027-04-08",
        "end_exclusive": "2027-04-12",
        "status": "Scheduled",
        "format": "72-hole major",
        "old_month": "04",
        "index": {"cat": "sport", "topic": "golf", "cont": "north-america", "country": "usa", "reach": "global", "keywords": "masters tournament, golf, augusta, green jacket"},
        "existing_page": True,
    },
]


def esc(value: object) -> str:
    return str(value).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def font(size: int, bold: bool = False):
    for candidate in (
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
    ):
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def wrap(draw: ImageDraw.ImageDraw, text: str, fnt, width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        if not current or draw.textbbox((0, 0), trial, font=fnt)[2] <= width:
            current = trial
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines[:3]


def blend(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(int(a[i] * (1 - t) + b[i] * t) for i in range(3))


def image(event: dict, out: Path, size: tuple[int, int]) -> None:
    w, h = size
    primary, secondary, paper = event["palette"]
    base = Image.new("RGB", size, primary)
    px = base.load()
    for y in range(h):
        for x in range(w):
            t = (x / max(1, w - 1)) * .42 + (y / max(1, h - 1)) * .58
            px[x, y] = blend(primary, secondary, t)
    base = base.filter(ImageFilter.GaussianBlur(0.25))
    draw = ImageDraw.Draw(base, "RGBA")
    if event["motif"] == "weather":
        for i in range(12):
            x = int(w * (.08 + (i % 4) * .26))
            y = int(h * (.18 + (i // 4) * .18))
            draw.ellipse((x, y, x + w * .18, y + h * .07), fill=(255, 255, 255, 55))
        for i in range(8):
            x = int(w * (.15 + i * .1))
            draw.line((x, h * .18, x + w * .08, h * .76), fill=(220, 244, 255, 120), width=max(2, w // 180))
        draw.arc((w * .52, h * .18, w * .92, h * .75), 205, 340, fill=(255, 255, 255, 160), width=max(5, w // 90))
        draw.ellipse((w * .68, h * .42, w * .76, h * .56), fill=(255, 231, 108, 210))
    else:
        draw.ellipse((w * .50, h * .12, w * .90, h * .86), fill=(68, 150, 112, 210), outline=(230, 249, 232, 140), width=max(5, w // 100))
        draw.polygon([(w*.58,h*.24),(w*.69,h*.19),(w*.76,h*.34),(w*.71,h*.44),(w*.60,h*.39)], fill=(218, 236, 171, 180))
        draw.polygon([(w*.66,h*.52),(w*.82,h*.54),(w*.79,h*.70),(w*.62,h*.73)], fill=(215, 238, 179, 170))
        for i in range(7):
            y = h * (.22 + i * .085)
            draw.line((w * .10, y, w * .45, y + h * .03), fill=(231, 245, 218, 95), width=max(3, w // 140))
    overlay = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(overlay).rectangle((0, 0, int(w * .55), h), fill=(4, 14, 22, 176))
    base = Image.alpha_composite(base.convert("RGBA"), overlay)
    draw = ImageDraw.Draw(base)
    draw.text((52, 46), event["topic_label"].upper(), fill=(255, 255, 255, 215), font=font(max(13, w // 44), True))
    title_font = font(max(30, w // 18), True)
    y = 96
    for line in wrap(draw, event["edition"], title_font, int(w * .45)):
        draw.text((52, y), line, fill=(255, 255, 255, 248), font=title_font)
        y += title_font.size + 4
    draw.text((54, min(h - 94, y + 18)), event["dates"], fill=paper, font=font(max(18, w // 32), True))
    draw.text((54, min(h - 54, y + 58)), event["venue"], fill=(255, 255, 255, 205), font=font(max(13, w // 54)))
    out.parent.mkdir(parents=True, exist_ok=True)
    base.convert("RGB").save(out, "PNG", optimize=True)


def country_chip(event: dict) -> str:
    chips = []
    for country in event.get("countries", [event["country"]]):
        if country["name"] == "Worldwide":
            chips.append("Worldwide")
            continue
        href = f'/content/locations/{country["continent"]}/{country["slug"]}/index.html'
        flag = f'/content/locations/{country["continent"]}/{country["slug"]}/img/flag.svg'
        chips.append(f'<a class="country" href="{href}"><img src="{flag}" alt="" width="20" height="14" loading="lazy">{esc(country["name"])}</a>')
    return " ".join(chips)


def country_json(event: dict) -> list[dict]:
    countries = []
    for country in event.get("countries", [event["country"]]):
        if country["name"] == "Worldwide":
            continue
        countries.append({
            "name": country["name"],
            "url": f'/content/locations/{country["continent"]}/{country["slug"]}/index.html',
            "flag": f'/content/locations/{country["continent"]}/{country["slug"]}/img/flag.svg',
        })
    return countries


def country_names(event: dict) -> str:
    return " / ".join(country["name"] for country in event.get("countries", [event["country"]]))


def country_primary(event: dict) -> dict:
    return event.get("countries", [event["country"]])[0]


def country_primary_name(event: dict) -> str:
    names = country_names(event)
    if names == "Worldwide":
        return '<strong>Worldwide</strong>'
    return names


def city_html(event: dict) -> str:
    city = event["city"]
    if city.get("url"):
        return f'<a class="city-link" href="{city["url"]}">{esc(city["name"])}</a>'
    return esc(city["name"])


def edition_json(event: dict) -> str:
    chip = country_chip(event)
    questions = []
    for q, a, detail in event["questions"]:
        questions.append({"q": q, "a": a.replace("{country}", chip), "detail": detail})
    editions = []
    for year in range(2022, 2027):
        editions.append({
            "year": year,
            "headingPlace": f'in {event["city"]["name"]}',
            "status": "past",
            "statusLabel": "Archive",
            "startDate": "",
            "endExclusive": "",
            "nextDate": event["start"],
            "dates": "Archive details TBC",
            "countries": country_json(event),
            "cities": [{"name": event["city"]["name"], **({"url": event["city"]["url"]} if event["city"].get("url") else {})}],
            "venue": event["venue"],
            "format": event["format"],
            "result": "Final details TBC.",
            "countdownText": "This edition is complete; add verified archive details when available.",
            "calendarDescription": f'{event["title"]} {year}.',
            "questions": [],
            "highlights": [],
        })
    editions.append({
        "year": 2027,
        "headingPlace": f'in {event["city"]["name"]}',
        "status": "upcoming",
        "statusLabel": event["status"],
        "startDate": event["start"],
        "endExclusive": event["end_exclusive"],
        "nextDate": "",
        "dates": event["dates"],
        "countries": country_json(event),
        "cities": [{"name": event["city"]["name"], **({"url": event["city"]["url"]} if event["city"].get("url") else {})}],
        "venue": event["venue"],
        "format": event["format"],
        "result": "",
        "countdownText": "Countdown to the next active edition.",
        "calendarDescription": f'{event["edition"]}.',
        "questions": questions,
        "highlights": [],
    })
    return json.dumps({
        "eventName": event["title"],
        "slug": event["slug"],
        "defaultYear": 2027,
        "lastUpdated": STAMP,
        "sources": event["sources"],
        "editions": editions,
    }, ensure_ascii=False).replace("</", "<\\/")


def event_page(event: dict) -> str:
    event_dir = f'/content/categories/{event["topic_path"]}/events'
    chip = country_chip(event)
    source_text = "; ".join(f'{esc(s["label"])}' for s in event["sources"])
    recent_rows = "".join(
        f"<tr><th>{year}</th><td>Archive TBC</td><td>{chip}</td></tr>" for year in range(2026, 2021, -1)
    )
    notable = "".join(f"<li>{esc(item)}</li>" for item in event["notable"])
    schema = {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": event["edition"],
        "description": event["intro"],
        "url": f'https://one-sliders.com{event_dir}/{event["slug"]}.html',
        "image": f'https://one-sliders.com{event_dir}/img/{event["slug"]}-hero.png',
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/MixedEventAttendanceMode" if country_names(event) == "Worldwide" else "https://schema.org/OfflineEventAttendanceMode",
        "startDate": event["start"],
        "endDate": event["end_exclusive"],
        "location": {"@type": "Place", "name": event["venue"], "address": {"@type": "PostalAddress", "addressLocality": event["city"]["name"], "addressCountry": country_names(event)}},
    }
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="index,follow">
  <meta name="content-language" content="en">
  <link rel="stylesheet" href="/assets/css/events.css">
  <script defer src="/assets/js/events.js"></script>
  <link rel="preload" as="image" href="{event_dir}/img/{event["slug"]}-hero.png">
  <link rel="canonical" href="https://one-sliders.com{event_dir}/{event["slug"]}.html">
  <meta name="description" content="{esc(event["edition"])} guide: dates, venue, programme and planning context.">
  <meta property="og:title" content="{esc(event["edition"])} - Dates, Schedule &amp; Guide">
  <meta property="og:image" content="https://one-sliders.com{event_dir}/img/{event["slug"]}-hero.png">
  <meta property="og:url" content="https://one-sliders.com{event_dir}/{event["slug"]}.html">
  <meta name="twitter:card" content="summary_large_image">
  <title>{esc(event["edition"])} - Dates, Schedule &amp; Guide</title>
  <script type="application/json" id="event-year-data">{edition_json(event)}</script>
  <script type="application/ld+json">{json.dumps(schema, ensure_ascii=False).replace("</", "<\\/")}</script>
</head>
<body class="event-page">
  <nav class="event-nav" aria-label="Site navigation">
    <a class="nav-icon" href="/content/events/index.html" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></a>
    <a class="nav-icon" href="/content/locations/index.html" aria-label="Locations"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></a>
    <a class="nav-icon" href="/content/categories/index.html" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg></a>
    <span class="nav-spacer"></span><details class="nav-language"><summary aria-label="Language">EN</summary><div class="nav-language__list"><a href="#" aria-current="page">English</a></div></details>
  </nav>
  <main class="event-carousel" data-carousel>
    <div class="event-carousel__track" data-carousel-track>
      <section class="event-slide event-slide--hero" id="general" data-slide="general">
        <img class="event-hero__image" src="{event_dir}/img/{event["slug"]}-hero.png" alt="{esc(event["title"])} hero image" width="1200" height="630" fetchpriority="high">
        <div class="event-slide__content">
          <div class="event-hero-copy"><p class="event-kicker">{esc(event["category_label"])}</p><h1 class="event-title">{esc(event["title"])}</h1><p class="event-lede">{esc(event["intro"])}</p></div>
          <div class="facts-strip hero-control"><div class="fact"><span>First held</span><strong>{esc(event["first_held"])}</strong></div><div class="fact"><span>Frequency</span><strong>{esc(event["frequency"])}</strong></div><div class="fact"><span>Current edition</span><strong>2027</strong></div><div class="fact"><span>Country</span><strong>{chip}</strong></div></div>
          <div class="card-grid"><a class="topic-card topic-card--inline" href="/content/categories/{event["topic_path"]}.html"><img src="{event_dir}/img/{event["slug"]}-mini.png" alt="{esc(event["title"])} thumbnail" width="400" height="300" loading="lazy"><span>More {esc(event["topic_label"])}</span><strong>Back to {esc(event["topic_label"])}</strong><p>Explore related event guides in this topic.</p></a><div class="card"><span>History</span><strong>Why people follow it</strong><p>{esc(event["history"])}</p></div><div class="card"><span>Format / rules</span><strong>{esc(event["format"])}</strong><p>{esc(event["rules"])}</p></div></div>
          <div class="card-grid card-grid--support"><div class="card"><span>Records</span><strong>Records to update</strong><p>{esc(event["records"])}</p></div><div class="card"><span>Notable moments</span><ul class="event-list">{notable}</ul></div></div>
          <div class="card card--editions"><span>Recent editions</span><table class="event-table"><thead><tr><th>Year</th><th>Host / place</th><th>Country</th></tr></thead><tbody>{recent_rows}</tbody></table></div>
        </div>
      </section>
      <section class="event-slide" id="year" data-slide="year">
        <img class="event-hero__image" src="{event_dir}/img/{event["slug"]}-hero.png" alt="{esc(event["title"])} hero image" width="1200" height="630" loading="lazy">
        <div class="event-slide__content"><div class="event-hero-copy"><p class="event-kicker">Edition guide</p><h2 class="event-section-title" data-year-heading>{esc(event["edition"])} in {esc(event["city"]["name"])}</h2><p class="event-subtitle">Switch between recent editions without leaving the page.</p></div><div class="year-switcher hero-control" data-year-switcher aria-label="Choose edition"></div><div class="year-edition" data-year-edition><div class="facts-strip"><div class="fact"><span>Country</span><strong>{chip}</strong></div><div class="fact"><span>City</span><strong>{city_html(event)}</strong></div><div class="fact"><span>Venue</span><strong>{esc(event["venue"])}</strong></div><div class="fact"><span>Dates</span><strong>{esc(event["dates"])}</strong></div><div class="fact"><span>Status</span><strong>{esc(event["status"])}</strong></div><div class="fact"><span>Format</span><strong>{esc(event["format"])}</strong></div></div><div class="countdown"><span>Countdown</span><strong data-countdown data-start="{event["start"]}">Date loading...</strong><p>Countdown to the next active edition.</p></div><div class="question-grid"><div class="question"><span>When is the event?</span><strong>{esc(event["dates"])}</strong><p>Use official sources before travel.</p></div><div class="question"><span>Where is it held?</span><strong>{esc(event["city"]["name"])} {chip}</strong><p>{esc(event["venue"])}</p></div><div class="question"><span>What is the programme?</span><strong>{esc(event["format"])}</strong><p>Programme details can be updated when the organiser publishes them.</p></div><div class="question"><span>What happened last edition?</span><strong>Archive TBC</strong><p>Add verified highlights when available.</p></div></div><div class="actions-row"><button class="event-button" type="button" data-calendar-download>Add to calendar</button><button class="event-button" type="button" data-save-event="{event["slug"]}" data-save-label="Save / remind me" data-saved-label="Saved">Save / remind me</button></div><p class="event-source">Sources: {source_text}. Last updated: {STAMP}.</p></div></div>
      </section>
    </div>
    <button class="event-carousel__prev" type="button" data-carousel-prev aria-label="Previous slide">Previous</button><button class="event-carousel__next" type="button" data-carousel-next aria-label="Next slide">Next</button><nav class="event-carousel__dots" data-carousel-dots aria-label="Slide navigation"></nav>
  </main>
</body>
</html>
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


def card(event: dict) -> str:
    idx = event["index"]
    href = f'../categories/{event["topic_path"]}/events/{event["slug"]}.html'
    img_src = f'../categories/{event["topic_path"]}/events/img/{event["slug"]}-mini.png'
    country = country_names(event)
    meta_place = f'{event["city"]["name"]}, {country}' if country != "Worldwide" else "Worldwide"
    return (
        f'        <a class="event-card" data-end="{event["end_exclusive"]}" data-cat="{idx["cat"]}" data-topic="{idx["topic"]}" '
        f'data-cont="{idx["cont"]}" data-country="{idx["country"]}" data-keywords="{esc(idx["keywords"])}" href="{href}" data-start="{event["start"]}" data-reach="{idx["reach"]}" '
        f'><img class="card-thumb" src="{img_src}" alt="{esc(event["edition"])}" loading="lazy" width="400" height="300"><div class="card-stripe"></div><div class="card-body"><span class="cat-pill">{esc(event["topic_label"])}</span>'
        f'<strong class="card-title">{esc(event["edition"])}</strong><span class="card-meta">{esc(event["dates"])} - {esc(meta_place)}</span></div></a>'
    )


def update_index() -> None:
    index = ROOT / "content" / "events" / "index.html"
    html = index.read_text(encoding="utf-8")
    html = "\n".join(
        line for line in html.splitlines()
        if not (
            'class="event-card"' in line
            and any(token in line for token in ("masters-tournament.html", "world-meteorological-day-2026.html", "earth-day-2026.html"))
        )
    )
    start = "    <!-- Passed 2026 events moved to categories: start -->"
    end = "    <!-- Passed 2026 events moved to categories: end -->"
    current = re.search(rf"{re.escape(start)}([\s\S]*?){re.escape(end)}", html)
    cards = [card(e) for e in EVENTS]
    existing = current.group(1).strip().splitlines() if current else []
    existing = [line for line in existing if not any(f'/{e["slug"]}.html' in line or f'>{e["edition"]}<' in line for e in EVENTS)]
    block = f"{start}\n" + "\n".join(cards + existing) + f"\n    {end}"
    if current:
        html = re.sub(rf"{re.escape(start)}[\s\S]*?{re.escape(end)}", block, html)
    else:
        html = html.replace("</main>", f"{block}\n  </main>")
    index.write_text(html, encoding="utf-8")


def clean_month_indexes() -> None:
    for month in ("03", "04"):
        index = ROOT / "content" / "events" / "2026" / month / "index.html"
        if not index.exists():
            continue
        html = index.read_text(encoding="utf-8")
        html = "\n".join(
            line for line in html.splitlines()
            if not any(token in line for token in ("masters-tournament", "world-meteorological-day-2026", "earth-day-2026"))
        )
        html = html.replace("Major events across the month, from global sport to festivals and culture.", "Past 2026 events have moved to their next active edition pages.")
        html = re.sub(r'<div class="events-grid">\s*</div>', '<p class="empty">Past events from this month now redirect to their next active edition pages.</p>', html)
        index.write_text(html, encoding="utf-8")


def main() -> None:
    for event in EVENTS:
        event_dir = ROOT / "content" / "categories" / event["topic_path"] / "events"
        img_dir = event_dir / "img"
        img_dir.mkdir(parents=True, exist_ok=True)
        if not event.get("existing_page"):
            (event_dir / f'{event["slug"]}.html').write_text(event_page(event), encoding="utf-8")
            (event_dir / f'{event["slug"]}.ics').write_text(
                f"BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//OneSliders//Event Calendar//EN\nBEGIN:VEVENT\nUID:{event['slug']}@one-sliders.com\nDTSTAMP:20260601T000000Z\nDTSTART;VALUE=DATE:{event['start'].replace('-', '')}\nDTEND;VALUE=DATE:{event['end_exclusive'].replace('-', '')}\nSUMMARY:{event['edition']}\nDESCRIPTION:{event['intro']}\nLOCATION:{event['venue']}, {event['city']['name']}\nEND:VEVENT\nEND:VCALENDAR\n",
                encoding="utf-8",
            )
            hero = img_dir / f'{event["slug"]}-hero.png'
            mini = img_dir / f'{event["slug"]}-mini.png'
            if not hero.exists():
                image(event, hero, (1200, 630))
            if not mini.exists():
                image(event, mini, (400, 300))
        old_file = ROOT / "content" / "events" / "2026" / event["old_month"] / f'{event["old_slug"]}.html'
        target = f'https://one-sliders.com/content/categories/{event["topic_path"]}/events/{event["slug"]}.html'
        if old_file.exists():
            old_file.write_text(redirect(event["edition"], target), encoding="utf-8")
    update_index()
    clean_month_indexes()
    print("Fixed pre-May 2026 events: category pages, redirects, index cards and images.")


if __name__ == "__main__":
    main()
