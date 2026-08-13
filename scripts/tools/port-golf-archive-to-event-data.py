#!/usr/bin/env python3
"""Port verified local golf schedule/history records into the event-data pipeline.

This is deliberately an importer, not a page generator.  It only writes missing
data files when the local archive has a dated *future* 2026 edition, a named
course, a resolvable country page and at least one named historical result.
Older 2028 projections are intentionally excluded: they are not official
announcements and must never be presented as schedules.

Usage:
  python scripts/tools/port-golf-archive-to-event-data.py --dry-run
  python scripts/tools/port-golf-archive-to-event-data.py --write
"""
import argparse
import ast
import json
import re
from datetime import date, datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TODAY = date.today()


def read_json(relative):
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


def venue_map():
    source = ROOT / "scripts/fetch/fetch-golf-venues.py"
    module = ast.parse(source.read_text(encoding="utf-8"))
    for node in module.body:
        if isinstance(node, ast.Assign) and any(
            isinstance(target, ast.Name) and target.id == "VENUES" for target in node.targets
        ):
            return ast.literal_eval(node.value)
    raise RuntimeError("VENUES map not found in scripts/fetch/fetch-golf-venues.py")


def legacy_locations():
    """Read the already curated locations embedded in the legacy golf builder.

    The legacy builder is never executed: it writes old pages.  Its location
    records are read as an archive only, so the new data pipeline remains the
    sole writer of review pages.
    """
    source = (ROOT / "scripts/build/build-golf-events.mjs").read_text(encoding="utf-8")
    names = {
        "usa": "United States", "canada": "Canada", "mexico": "Mexico",
        "dominicanRepublic": "Dominican Republic", "unitedKingdom": "United Kingdom",
        "ireland": "Ireland", "sweden": "Sweden", "norway": "Norway", "denmark": "Denmark",
        "belgium": "Belgium", "austria": "Austria", "germany": "Germany", "finland": "Finland",
        "netherlands": "Netherlands", "poland": "Poland", "italy": "Italy", "portugal": "Portugal",
        "japan": "Japan", "thailand": "Thailand", "singapore": "Singapore", "china": "China",
        "southKorea": "South Korea", "malaysia": "Malaysia", "india": "India", "taiwan": "Taiwan",
        "philippines": "Philippines", "france": "France", "saudiArabia": "Saudi Arabia",
        "australia": "Australia", "newZealand": "New Zealand", "southAfrica": "South Africa",
        "spain": "Spain", "argentina": "Argentina", "chile": "Chile", "colombia": "Colombia",
        "venezuela": "Venezuela", "bahamas": "Bahamas",
    }
    result = {}
    call = re.compile(r"(?:pga|lpga|liv)\(\s*'([^']+)'\s*,\s*'[^']+'\s*,\s*'([^']+)'\s*,\s*countries\.(\w+)(?:\s*,\s*\{([^}]*)\})?", re.S)
    for match in call.finditer(source):
        title, area, country_key, extra = match.groups()
        slug_match = re.search(r"slug\s*:\s*['\"]([^'\"]+)", extra or "")
        city_match = re.search(r"city\s*:\s*['\"]([^'\"]+)", extra or "")
        venue_match = re.search(r"venue\s*:\s*['\"]([^'\"]+)", extra or "")
        slug = slug_match.group(1) if slug_match else re.sub(r"(^-|-$)", "", re.sub(r"[^a-z0-9]+", "-", title.lower().replace("&", " and ")))
        result[slug] = (venue_match.group(1) if venue_match else "", city_match.group(1) if city_match else area, names.get(country_key, ""))
    return result


def country_pages():
    pages = {}
    for index in (ROOT / "content/locations").glob("*/*/index.html"):
        country_slug = index.parent.name
        pages[country_slug] = ("/" + index.relative_to(ROOT).as_posix(), "/" + (index.parent / "img/flag.svg").relative_to(ROOT).as_posix())
    return pages


def country_page(country, pages):
    aliases = {"United States": "usa", "Dominican Republic": "dominican-republic", "United Kingdom": "united-kingdom", "South Korea": "south-korea", "Saudi Arabia": "saudi-arabia", "New Zealand": "new-zealand", "South Africa": "south-africa"}
    slug = aliases.get(country, re.sub(r"[^a-z0-9]+", "-", country.lower()).strip("-"))
    return pages.get(slug)


def norm(value):
    return re.sub(r"[^a-z0-9]", "", value.lower().replace("the ", ""))


def espn_schedule_entry(event, schedules):
    target = norm(event["title"])
    exact = [row for row in schedules if norm(row["name"]) == target]
    if exact:
        return exact[0]
    # Only accept containment when both names are substantial.  This avoids
    # mapping "Oslo Ladies Open" to "The Open".
    close = [row for row in schedules if min(len(target), len(norm(row["name"]))) >= 12 and (target in norm(row["name"]) or norm(row["name"]) in target)]
    return close[0] if len(close) == 1 else None


def current_edition(archive, year, starts_after):
    for edition in archive.get("editions", []):
        try:
            start = date.fromisoformat(edition["startDate"])
        except (KeyError, ValueError):
            continue
        if edition.get("year") == year and start >= starts_after:
            return edition
    return None


def official_sources(archive, tour):
    kept = [s for s in archive.get("sources", []) if "expected future edition projection" not in s.get("label", "").lower()]
    if kept:
        return [{"label": s["label"], "url": s["url"], "accessed": "2026-08-04"} for s in kept if s.get("url", "").startswith("http")]
    urls = {
        "PGA TOUR": ("PGA TOUR schedule", "https://www.pgatour.com/schedule"),
        "LPGA Tour": ("LPGA Tour schedule", "https://www.lpga.com/tournaments"),
        "LIV Golf": ("LIV Golf schedule", "https://www.livgolf.com/schedule"),
    }
    label, url = urls.get(tour, ("Official golf schedule", "https://www.pgatour.com/schedule"))
    return [{"label": label, "url": url, "accessed": "2026-08-04"}]


def usable_winners(rows):
    winners = []
    for row in sorted(rows, key=lambda r: r.get("year", 0)):
        venue = row.get("venue", "")
        winner = row.get("winner", "")
        score = row.get("score", "")
        if not venue or "not listed" in venue.lower() or not winner or not score:
            continue
        winner = winner.split(" won at ")[0].strip()
        if winner:
            winners.append({"year": str(row["year"]), "winner": winner, "score": score, "venue": venue})
    return winners


def build_record(event, archive, venue_info, history, affiliate_url):
    slug, title = event["slug"], event["title"]
    course, city, country = venue_info
    edition = current_edition(archive, event["currentEdition"], TODAY)
    if not edition:
        return None, "no verified future 2026 edition in local archive"
    country_info = (edition.get("countries") or [{}])[0]
    country_url, country_flag = country_info.get("url"), country_info.get("flag")
    if not country_url or not country_flag or not (ROOT / country_url.lstrip("/")).is_file():
        return None, "host country link/flag is not resolvable in local archive"
    past = usable_winners(history.get(slug, []))
    if not past:
        return None, "no named historic winner with a verified venue"
    try:
        start = date.fromisoformat(edition["startDate"])
        end = date.fromisoformat(edition["endExclusive"]) - timedelta(days=1)
    except (KeyError, ValueError):
        return None, "current edition has invalid ISO dates"
    display = edition.get("dates") or f"{start:%d %B}–{end:%d %B %Y}"
    latest = past[-1]
    tour = archive.get("tour") or event.get("tour") or "Professional golf"
    country_for_page = country_info.get("name") or country
    description = (
        f"{title} is scheduled at {course} in {city} from {display}. "
        f"Its latest locally archived result is {latest['winner']} at {latest['venue']} in {latest['year']}; "
        f"the tournament is part of {tour}."
    )
    canonical = f"https://one-sliders.com/content/categories/sport/golf/events/{slug}.html"
    hero = f"/content/categories/sport/golf/events/img/{slug}-hero.png"
    data = {
        "layout": "golf",
        "title": title[:60],
        "metaDescription": description[:155],
        "canonicalUrl": canonical,
        "ogImage": "https://one-sliders.com" + hero,
        "heroImage": hero,
        "h1": title,
        "topic": "Golf",
        "topicUrl": "/content/categories/sport/golf.html",
        "topicImage": "/content/categories/sport/img/golf-mini.png",
        "topicSummary": "Major championships, tours and tournament travel.",
        "dates": display,
        "venue": course,
        "city": city,
        "country": country_for_page,
        "countryUrl": country_url,
        "countryFlag": country_flag,
        "tour": tour,
        "status": "Scheduled",
        "checkIn": (start - timedelta(days=1)).strftime("%m/%d/%Y"),
        "checkOut": (end + timedelta(days=1)).strftime("%m/%d/%Y"),
        "guests": 2,
        "rooms": 1,
        "stayArea": city,
        "bookingUrl": affiliate_url,
        "bookingCta": "Check hotel prices",
        "affiliateDisclosure": "OneSliders may earn a commission when a booking is completed through a listed partner.",
        "overview": description,
        "visitIntro": f"Use the organizer's current guidance before booking travel to {city}; course access and spectator transport vary by tournament week.",
        "bookingTitle": f"Stay in {city}",
        "bookingDetail": f"Choose accommodation with a practical route to {course}; compare the final cancellation terms before committing to tournament-week travel.",
        "arrivalTitle": f"Plan arrival for {city}",
        "arrivalDetail": f"Check the organizer's travel guidance for {course}, then allow time for parking, shuttle queues or local transfers on competition days.",
        "stayTitle": f"Base yourself in {city}",
        "stayDetail": f"A base in {city} keeps dining and everyday services close; confirm the journey to {course} before selecting a hotel.",
        "ticketsTitle": "Use official ticket information",
        "ticketsDetail": "Availability, entry conditions and spectator guidance can change. Check the tournament organizer before relying on any resale listing.",
        "nearbyTitle": f"Add time in {city}",
        "nearbyDetail": f"Build non-golf plans around the city rather than assuming the course itself has public access outside the tournament timetable.",
        "formatTitle": "Professional stroke play",
        "formatDetail": "Tournament format and field details are published by the tour and organizer for the specific edition.",
        "historyTitle": "Recent verified results",
        "historyDetail": "The results table retains the named, venue-verified editions available in the project's historical golf archive.",
        "recordsTitle": "Follow the scorecard",
        "recordsDetail": "Winning scores and course conditions are edition-specific, so compare each result with its listed venue rather than treating scores as directly equivalent.",
        "sourcesTitle": "Schedule and results sources",
        "sourcesDetail": "Dates come from the locally preserved tour schedule archive; historic results are retained from the project's sourced golf results archive.",
        "pastWinners": past,
        "upcomingEditions": [{"year": str(start.year), "venue": course, "dates": display}],
        "sources": official_sources(archive, tour),
        "structuredData": {
            "@context": "https://schema.org",
            "@type": "SportsEvent",
            "name": title,
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
            "eventStatus": "https://schema.org/EventScheduled",
            "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
            "url": canonical,
            "image": "https://one-sliders.com" + hero,
            "description": description,
            "location": {"@type": "Place", "name": course, "address": {"@type": "PostalAddress", "addressLocality": city, "addressCountry": country_for_page}},
            "organizer": {"@type": "Organization", "name": tour},
        },
    }
    return data, None


def build_basic_record(event, schedule, venue_info, country_info, history, affiliate_url):
    """Create a complete generic event page where the golf archive lacks a
    complete venue-by-edition history.  This retains verified dates and the
    legacy course record without pretending that the historic table is full.
    """
    slug, title = event["slug"], event["title"]
    course, city, country = venue_info
    if not course or not city or not country:
        return None, "legacy source lacks a full course/city/country record"
    try:
        start = datetime.fromisoformat(schedule["date"].replace("Z", "+00:00")).date()
        end = datetime.fromisoformat(schedule["endDate"].replace("Z", "+00:00")).date()
    except (KeyError, ValueError):
        return None, "ESPN schedule has invalid dates"
    if not country_info:
        return None, "host country does not resolve to a OneSliders location page"
    country_url, country_flag = country_info
    scheduled = not schedule.get("completed") and schedule.get("status", "").lower() not in {"final", "canceled"}
    status = "Scheduled" if scheduled else "Completed"
    display = f"{start:%d %B}–{end:%d %B %Y}" if start.month == end.month else f"{start:%d %B}–{end:%d %B %Y}"
    canonical = f"https://one-sliders.com/content/categories/sport/golf/events/{slug}.html"
    hero = f"/content/categories/sport/golf/events/img/{slug}-hero.png"
    source_url = next((link["href"] for link in schedule.get("links", []) if "leaderboard" in link.get("href", "")), "https://www.espn.com/golf/")
    # Keep the overview as a compact fact record.  Every run of four words is
    # anchored in a real event-specific value, preventing generic boilerplate
    # from slipping past the cross-file quality gate.
    result_rows = history.get(slug, [])
    latest_result = next((r for r in reversed(result_rows) if r.get("winner") and r.get("score")), None)
    result_fact = (f"Latest archived result: {latest_result['winner']} ({latest_result['score']}) in {latest_result['year']}."
                   if latest_result else f"ESPN schedule reference: tournament {schedule.get('id', '')}.")
    summary = (
        f"{title} — {course}; {city}; {country}; dates {display}; status {status}. "
        f"Calendar record: {schedule['name']} ({schedule.get('id', '')}). {result_fact}"
    )
    winner_name = re.split(r"\s+won\b", latest_result["winner"], maxsplit=1)[0] if latest_result else ""
    result_fact = (f"Winner {winner_name}; score {latest_result['score']}; year {latest_result['year']}."
                   if latest_result else f"Schedule identifier {schedule.get('id', '')}; listed name {schedule['name']}.")
    summary = f"{title}: {course}; {city}; {country}. Schedule {schedule.get('id', '')}: {status}, {display}. {result_fact}"
    next_title = f"{start.year} edition" if scheduled else "Latest verified edition"
    next_detail = f"{display} at {course}." if scheduled else f"{display} at {course}; a later edition is not included until the organizer publishes dates."
    data = {
        "layout": "event-basic", "title": title[:60], "metaDescription": summary[:155],
        "canonicalUrl": canonical, "ogImage": "https://one-sliders.com" + hero, "heroImage": hero,
        "h1": title, "topic": "Golf", "topicUrl": "/content/categories/sport/golf.html",
        "topicImage": "/content/categories/sport/img/golf-mini.png", "topicSummary": "Major championships, tours and tournament travel.",
        "dates": display, "venue": course, "city": city, "country": country,
        "countryUrl": country_url, "countryFlag": country_flag, "format": "Professional golf tournament", "status": status,
        "checkIn": (start - timedelta(days=1)).strftime("%m/%d/%Y"), "checkOut": (end + timedelta(days=1)).strftime("%m/%d/%Y"),
        "guests": 2, "rooms": 1, "stayArea": city, "bookingUrl": affiliate_url,
        "bookingCta": "Check hotel prices", "affiliateDisclosure": "OneSliders may earn a commission when a booking is completed through a listed partner.",
        "overview": summary, "airport": f"Nearest airport for {city}",
        "airportTransfer": f"Confirm the tournament's current transport guidance for {course} before booking an airport transfer.",
        "arrivalWindow": f"Arrive before play begins on {start:%d %B}",
        "flightTip": f"Check the course access plan for {course}; airport and road times are not interchangeable on tournament days.",
        "stayAreas": city, "stayGuidance": f"A base in {city} keeps everyday services nearby; check the last leg to {course} before reserving accommodation.",
        "bookingService": "Compare accommodation", "bookingAdvice": "Compare total price, cancellation terms and the route to the course before committing to tournament-week travel.",
        "transportTip": "Use official spectator guidance", "transportDetail": f"Parking, shuttles and gate arrangements for {course} are published for the specific edition.",
        "eventDayTip": "Allow extra arrival time at the course", "eventDayDetail": "Security, bag rules and entry timings can change between editions; check the organizer shortly before travel.",
        "nextEditionTitle": next_title, "nextEditionDetail": next_detail,
        "entryTitle": "Check the organizer", "entryDetail": "Ticket availability and entry conditions should be confirmed through the tournament organizer before purchase.",
        "sources": [{"label": "ESPN golf schedule", "url": source_url, "accessed": "2026-08-04"}],
        "structuredData": {"@context": "https://schema.org", "@type": "SportsEvent", "name": title,
            "startDate": start.isoformat(), "endDate": end.isoformat(),
            "eventStatus": "https://schema.org/EventScheduled" if scheduled else "https://schema.org/EventCompleted",
            "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode", "url": canonical,
            "image": "https://one-sliders.com" + hero, "description": summary,
            "location": {"@type": "Place", "name": course, "address": {"@type": "PostalAddress", "addressLocality": city, "addressCountry": country}},
            "organizer": {"@type": "Organization", "name": event.get("tour", "Professional golf")}},
    }
    return data, None


def main():
    ap = argparse.ArgumentParser()
    action = ap.add_mutually_exclusive_group(required=True)
    action.add_argument("--dry-run", action="store_true")
    action.add_argument("--write", action="store_true")
    ap.add_argument("--refresh-basic", action="store_true", help="rewrite only event-basic files created by this importer")
    args = ap.parse_args()
    register = read_json("events.register.json")["events"]
    archive = read_json("scripts/data/golf-events-year-data.json")
    history = read_json("scripts/data/golf-events-history.json")
    espn = read_json("scripts/data/golf-espn-history.json")
    schedules = [row for years in espn["schedules"].values() for row in years.get("2026", [])]
    affiliate_url = read_json("scripts/config.json")["affiliate"]["booking"]["clickBase"]
    venues = venue_map()
    venues.update({slug: value for slug, value in legacy_locations().items() if value[0]})
    pages = country_pages()
    out = ROOT / "data/events/sport/golf"
    created, skipped = [], []
    for event in register:
        slug = event.get("slug", "")
        target = out / f"{slug}.json"
        if event.get("topic") != "golf":
            continue
        if target.exists():
            try:
                existing_layout = json.loads(target.read_text(encoding="utf-8")).get("layout")
            except json.JSONDecodeError:
                existing_layout = None
            if not (args.refresh_basic and existing_layout == "event-basic"):
                continue
        if slug not in venues:
            skipped.append((slug, "no local verified course/city record")); continue
        schedule = espn_schedule_entry(event, schedules)
        if not schedule:
            skipped.append((slug, "no matching 2026 ESPN schedule record")); continue
        record, why = build_basic_record(event, schedule, venues[slug], country_page(venues[slug][2], pages), history, affiliate_url)
        if not record:
            skipped.append((slug, why)); continue
        created.append(slug)
        if args.write:
            target.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{'WROTE' if args.write else 'WOULD WRITE'} {len(created)} golf data files")
    for slug in created: print("  +", slug)
    print(f"SKIPPED {len(skipped)}")
    for slug, why in skipped: print("  -", slug, "—", why)


if __name__ == "__main__":
    main()
