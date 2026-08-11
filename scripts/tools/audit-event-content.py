"""Hard content contract for event Visit and booking data.

This audit runs before rendering. It deliberately rejects unresolved placeholders,
empty visit panels and incomplete booking context instead of letting the renderer
silently remove those units.
"""
from __future__ import annotations
import glob, json, os, re, sys
from datetime import datetime
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data" / "events"
TEMPLATES = ROOT / "page-templates"
BOOKING_LAYOUTS = {"event-basic", "event-history", "music", "music-festival", "awards", "golf"}
BOOKING_TEMPLATES = ("awards", "event-basic", "event-history", "golf", "music", "music-festival")
REACH_LEVELS = {"global", "continental", "national", "regional", "local"}
VENUE_CATEGORIES = {"sport", "music", "culture", "technology"}
EXCLUDED_VENUE_LAYOUTS = {"national-day", "global-observance", "online"}
TASK40_PILOT_FILES = {
    "data/events/sport/tennis/us-open-tennis.json",
    "data/events/sport/golf/us-open-golf.json",
    "data/events/technology/consumer-electronics/ces.json",
}
GOLF_FIELDS = ("visitIntro", "bookingTitle", "bookingDetail", "arrivalTitle", "arrivalDetail",
               "stayTitle", "stayDetail", "ticketsTitle", "ticketsDetail", "nearbyTitle", "nearbyDetail")
VISIT_FIELDS = (("airport", "airportTransfer"), ("stayAreas", "stayGuidance"),
                ("transportTip", "transportDetail"), ("eventDayTip", "eventDayDetail"))
CITY_FIELDS = ("airport", "airportTransfer", "stayAreas", "stayGuidance", "transportTip", "transportDetail", "eventDayTip", "eventDayDetail", "checkIn", "checkOut", "region", "guests", "rooms")
BAD = re.compile(r"\b(?:TBC|TBD|expected|zulu-0129)\b|\[[A-Za-z][^\]]{1,80}\]|bookingbookingbooking", re.I)
REGISTER_DUMP = re.compile(r"\bregister key\b|\bevent record\b|\bhost city\b|\b(?:venue|city|country)\s*[:=]?\s*[^.;]+(?:;|\.)\s*(?:venue|city|country)\s*[:=]?", re.I)

def venue_event(path, d):
    """Return True for physical venue-led events covered by task 40."""
    rel = path.relative_to(ROOT).parts
    category = rel[2].lower() if len(rel) > 2 else ""
    layout = text(d.get("layout")).lower()
    city = text(d.get("city")).lower()
    topic = text(d.get("topic")).lower()
    if layout not in BOOKING_LAYOUTS or layout in EXCLUDED_VENUE_LAYOUTS:
        return False
    if category not in VENUE_CATEGORIES or topic in {"online", "online events"}:
        return False
    if city in {"online", "nationwide", "multiple cities", "expected", "tbd", "tbc"} or "not announced" in city or "not confirmed" in city:
        return False
    return True

def stay_area_details(d):
    details = d.get("stayAreaDetails")
    if not isinstance(details, list):
        return []
    return [item for item in details if isinstance(item, dict)]

def supported_unannounced_host(d):
    """True only for an explicit false marker with a source that says host is unannounced."""
    if d.get("hostAnnounced") is not False:
        return False
    for source in d.get("sources", []):
        if not isinstance(source, dict):
            continue
        label = text(source.get("label"))
        if source.get("supportsHostUnannounced") is True:
            return True
        if re.search(r"host|venue", label, re.I) and re.search(r"not announced|unannounced|to be announced|tba", label, re.I):
            return True
    return False

def supported_unannounced_next_edition(d):
    """True only for an explicit, sourced no-next-date marker."""
    if d.get("nextEditionAnnounced") is not False:
        return False
    for source in d.get("sources", []):
        if not isinstance(source, dict):
            continue
        if source.get("supportsNextEditionUnannounced") is True:
            return True
        label = text(source.get("label"))
        if re.search(r"next edition", label, re.I) and re.search(r"not announced|unannounced|no published", label, re.I):
            return True
    return False

def text(v):
    return str(v or "").strip()

def topic_asset_path(value):
    """Resolve a same-site topic image to a local file without accepting URLs."""
    value = text(value)
    if value.startswith("http"):
        value = re.sub(r"^https?://[^/]+", "", value)
    if not value.startswith("/"):
        return None
    candidate = (ROOT / value.lstrip("/")).resolve()
    try:
        candidate.relative_to(ROOT.resolve())
    except ValueError:
        return None
    return candidate if candidate.is_file() else None

def topic_card_defaults(d):
    """Mirror the build transform's data-only topic-card derivation."""
    canonical = text(d.get("canonicalUrl"))
    match = re.search(r"/content/categories/([^/]+)/([^/]+)/events/[^/]+\.html$", canonical)
    topic_slug = match.group(2) if match else ""
    if not topic_slug:
        topic_match = re.search(r"/([^/]+)\.html$", text(d.get("topicUrl")))
        topic_slug = topic_match.group(1) if topic_match else ""
    image = text(d.get("topicImage"))
    if not image and match:
        candidate = f"/content/categories/{match.group(1)}/img/{topic_slug}-mini.png"
        if topic_asset_path(candidate) is not None:
            image = candidate
    summary = text(d.get("topicSummary"))
    if not summary and topic_slug:
        summary = f"More {text(d.get('topic')) or topic_slug.replace('-', ' ').title()} event pages."
    return image, summary

def dates(d):
    graph = d.get("structuredData", {}).get("@graph", [])
    if isinstance(graph, dict): graph = [graph]
    for item in graph:
        try:
            start = datetime.fromisoformat(text(item.get("startDate"))[:10]).date()
            end = datetime.fromisoformat(text(item.get("endDate"))[:10]).date()
            return start, end
        except (TypeError, ValueError):
            pass
    return None, None

def template_booking_issues():
    """Require native number steppers in both booking panels of every layout."""
    issues = []
    attr = lambda tag, name: re.search(rf'\b{name}\s*=\s*["\']([^"\']*)["\']', tag, re.I)
    panels = (("hero-booking", ("template-guests", "template-rooms")),
              ("Visit-booking", ("stay-guests", "stay-rooms")))
    for layout in BOOKING_TEMPLATES:
        path = TEMPLATES / f"{layout}.html"
        if not path.exists():
            issues.append(f"page-templates/{layout}.html saknas")
            continue
        html = path.read_text(encoding="utf-8")
        for panel, field_ids in panels:
            for field_id in field_ids:
                match = re.search(rf'<input\b[^>]*\bid\s*=\s*["\']{re.escape(field_id)}["\'][^>]*>', html, re.I)
                if not match:
                    issues.append(f"page-templates/{layout}.html: {panel} saknar {field_id}")
                    continue
                tag = match.group(0)
                values = {name: (attr(tag, name).group(1) if attr(tag, name) else "")
                          for name in ("type", "min", "step")}
                if values != {"type": "number", "min": "1", "step": "1"}:
                    issues.append(f"page-templates/{layout}.html: {panel}/{field_id} kräver type=number min=1 step=1 (fick {values})")
    return issues

def persona_overview_issues(rel, d):
    """Validate the optional persona-driven Overview contract without forcing it globally yet."""
    overview = d.get("overview")
    if not isinstance(overview, dict):
        return []
    issues = []
    personas = overview.get("personas")
    if not isinstance(personas, list) or not 1 <= len(personas) <= 3 or any(not text(item) for item in personas):
        issues.append(f"{rel}: overview.personas must contain 1-3 non-empty values")
    about = text(overview.get("about"))
    if len(about) < 150:
        issues.append(f"{rel}: overview.about must be substantive (at least 150 characters)")
    cop_out = re.compile(r"official source|confirm .*schedule|before travel|;\s*venue\b|;\s*host\b|—[^\n;]+;[^\n;]+;\s*date", re.I)
    if cop_out.search(about):
        issues.append(f"{rel}: overview.about contains cop-out or field-dump wording")
    if not text(overview.get("nextEvent")):
        issues.append(f"{rel}: overview.nextEvent is required")
    kpis = overview.get("kpis", [])
    if kpis is None: kpis = []
    if not isinstance(kpis, list) or len(kpis) > 5 or any(not isinstance(item, dict) or not text(item.get("value")) or not text(item.get("label")) for item in kpis):
        issues.append(f"{rel}: overview.kpis must be 0-5 complete objects")
    charts = overview.get("charts", [])
    if charts is None: charts = []
    valid_types = {"line", "bar", "rank"}
    # Honest, well-defined history scopes. "open-era" is the recognised tennis
    # dividing line (from 1968); it prevents cherry-picked windows while letting
    # sports with a pre-modern era present a meaningful ranking.
    valid_scopes = {"all-editions", "open-era"}
    if not isinstance(charts, list) or len(charts) > 3:
        issues.append(f"{rel}: overview.charts must contain 0-3 charts")
    else:
        for index, chart in enumerate(charts):
            series = chart.get("series") if isinstance(chart, dict) else None
            if not isinstance(chart, dict) or chart.get("type") not in valid_types or not text(chart.get("title")) or not isinstance(series, list) or not series:
                issues.append(f"{rel}: overview.charts[{index + 1}] is incomplete or has an invalid type")
            elif chart.get("historyScope") not in valid_scopes or not isinstance(chart.get("sourceUrls"), list) or not chart.get("sourceUrls"):
                issues.append(f"{rel}: overview.charts[{index + 1}] must use a sourced history (historyScope one of {sorted(valid_scopes)})")
    return issues

def rendered_global_overview_issues():
    """Check current Dev HTML for the rendered global Overview contract."""
    issues = []
    dev_root = ROOT / "Templates" / "test"
    if not dev_root.exists():
        return issues
    for path in sorted(DATA.rglob("*.json")):
        d = json.loads(path.read_text(encoding="utf-8"))
        if d.get("reach") != "global":
            continue
        route = re.sub(r"^https?://[^/]+", "", text(d.get("canonicalUrl"))).lstrip("/")
        html_path = dev_root / route
        if not html_path.is_file():
            continue
        rendered = html_path.read_text(encoding="utf-8")
        rel = path.relative_to(ROOT).as_posix()
        soup = BeautifulSoup(rendered, "html.parser")
        overview = soup.select_one(".event-persona-overview")
        if not overview:
            issues.append(f"{rel}: Dev-renderad global Overview saknas")
            continue
        for anchor in overview.select("a.country"):
            if not anchor.select_one("img"):
                issues.append(f"{rel}: country-länk saknar flagga i Overview")
    return issues

def audit():
    issues = template_booking_issues()
    for path in sorted(DATA.rglob("*.json")):
        d = json.loads(path.read_text(encoding="utf-8"))
        rel = path.relative_to(ROOT).as_posix()
        reach = text(d.get("reach"))
        if reach not in REACH_LEVELS:
            issues.append(f"{rel}: reach must be one of {sorted(REACH_LEVELS)}")
        if reach == "global" or isinstance(d.get("overview"), dict):
            issues.extend(persona_overview_issues(rel, d))
        topic_image, topic_summary = topic_card_defaults(d)
        if not topic_image or topic_asset_path(topic_image) is None:
            issues.append(f"{rel}: topicImage saknas eller pekar inte på en befintlig lokal bild")
        if not topic_summary or BAD.search(topic_summary):
            issues.append(f"{rel}: topicSummary saknas eller innehåller placeholder")
        layout = text(d.get("layout"))
        start, end = dates(d)
        if d.get("nextEditionAnnounced") is False and end and end >= datetime.now().date():
            issues.append(f"{rel}: nextEditionAnnounced:false fÃ¥r inte anvÃ¤ndas med framtida endDate {end.isoformat()}")
        if end and end < datetime.now().date() and not supported_unannounced_next_edition(d):
            issues.append(f"{rel}: endDate {end.isoformat()} har passerat utan framrullat datum eller källbelagd nextEditionAnnounced:false")
        if layout not in BOOKING_LAYOUTS:
            continue
        is_venue_event = venue_event(path, d) and rel in TASK40_PILOT_FILES
        if (not start or not end) and not isinstance(d.get("overview"), dict):
            issues.append(f"{rel}: booking-datum saknas eller är inte ISO")
        region = text(d.get("stayArea")) or text(d.get("city")) or text(d.get("venue"))
        tba_host = supported_unannounced_host(d)
        multi = isinstance(d.get("cities"), list) or text(d.get("city")).lower() == "multiple cities"
        city_text = text(d.get("city")).lower()
        unresolved_location = (not city_text or city_text in {"expected", "tbd", "tbc", "online", "multiple cities"} or "not announced" in city_text or "not confirmed" in city_text) and not (isinstance(d.get("cities"), list) and d.get("cities"))
        if multi:
            cities = d.get("cities")
            if not isinstance(cities, list) or not cities:
                pass
            else:
                for index, city in enumerate(cities):
                    if not isinstance(city, dict) or not text(city.get("name")):
                        issues.append(f"{rel}: multi-city stad {index + 1} saknar name")
                        continue
                    if city.get("hostAnnounced") is False:
                        continue
                    for key in CITY_FIELDS:
                        value = city.get(key)
                        if key in {"guests", "rooms"}:
                            if not isinstance(value, (int, float)) or value < 1:
                                issues.append(f"{rel}: multi-city {city.get('name')} saknar giltigt {key}")
                        elif not text(value) or BAD.search(text(value)):
                            issues.append(f"{rel}: multi-city {city.get('name')} saknar/har placeholder i {key}")
        if unresolved_location:
            continue
        if is_venue_event:
            venue = text(d.get("venue"))
            city_name = text(d.get("city"))
            if not venue:
                issues.append(f"{rel}: venue-förankrat event saknar riktig venue")
            elif venue.casefold() == city_name.casefold():
                issues.append(f"{rel}: venue får inte vara samma som city ({venue})")
            details = stay_area_details(d)
            fallback = d.get("stayAreaFallback") is True and any(
                isinstance(source, dict) and (source.get("supportsStayAreaFallback") is True or
                    re.search(r"stay.?area|accommodation|hotel", text(source.get("label")), re.I) and
                    re.search(r"no suitable|no venue|not available|cannot", text(source.get("label")), re.I))
                for source in d.get("sources", [])
            )
            if not details and not fallback:
                issues.append(f"{rel}: venue-förankrat event saknar stayAreaDetails eller källbelagd stayAreaFallback")
            if details:
                if not 2 <= len(details) <= 4:
                    issues.append(f"{rel}: stayAreaDetails måste innehålla 2–4 venue-nära områden")
                for index, item in enumerate(details):
                    if not text(item.get("area")) or not text(item.get("toVenue")):
                        issues.append(f"{rel}: stayAreaDetails[{index + 1}] saknar area eller restid till venue")
                if not text(d.get("stayAreas")):
                    issues.append(f"{rel}: stayAreas saknas trots stayAreaDetails")
        if not unresolved_location and (not region or BAD.search(region)):
            issues.append(f"{rel}: booking-region saknas eller är placeholder")
        # guests/rooms are intentionally defaulted by the renderer to 2/1; explicit
        # values, when present, must still be positive numbers.
        for key, default in (("guests", 2), ("rooms", 1)):
            value = d.get(key, default)
            if not isinstance(value, (int, float)) or value < 1:
                issues.append(f"{rel}: {key} saknas eller är ogiltigt")
        if layout == "golf":
            for key in GOLF_FIELDS:
                if not text(d.get(key)) or BAD.search(text(d.get(key))):
                    issues.append(f"{rel}: Visit-fält '{key}' saknas/placeholder")
        else:
            # A Visit panel must have real arrival, stay and event-day guidance.
            for pair in VISIT_FIELDS:
                # If no host city/venue is published, these fields are genuinely host-dependent.
                # Once a city is known, airport/transport/stay remain mandatory.
                if tba_host and not text(d.get("city")) and not text(d.get("venue")):
                    continue
                if any(not text(d.get(k)) or BAD.search(text(d.get(k))) for k in pair):
                    issues.append(f"{rel}: Visit-fält saknas/placeholder ({pair[0]}, {pair[1]})")
        blob = json.dumps(d, ensure_ascii=False)
        if tba_host:
            # Host-dependent values are omitted for a supported TBA event; scan only
            # the remaining published content and source metadata.
            scrub = {k: v for k, v in d.items() if k not in {"city", "venue", "stayArea", "airport", "airportTransfer", "stayAreas", "stayGuidance", "transportTip", "transportDetail", "eventDayTip", "eventDayDetail"}}
            blob = json.dumps(scrub, ensure_ascii=False)
        overview_value = d.get("overview")
        overview_blob = " ".join(
            text(overview_value.get(key)) for key in ("about", "nextEvent")
        ) if isinstance(overview_value, dict) else text(overview_value)
        content_blob = " ".join((overview_blob, text(d.get("description")), text(d.get("metaDescription"))))
        if is_venue_event and REGISTER_DUMP.search(content_blob):
            issues.append(f"{rel}: overview/description/meta innehåller register-dump eller etikett-dump")
        if BAD.search(blob):
            issues.append(f"{rel}: innehåller placeholder/boilerplate")
    if os.environ.get("AUDIT_RENDERED_GLOBALS") == "1":
        issues.extend(rendered_global_overview_issues())
    return issues

if __name__ == "__main__":
    problems = audit()
    if problems:
        print(f"EVENT-CONTENT-GATE: {len(problems)} brister")
        for issue in problems[:200]: print(f" - {issue}")
        if len(problems) > 200: print(f" - ... {len(problems)-200} ytterligare")
        sys.exit(1)
    print("EVENT-CONTENT-GATE: 0 brister")
