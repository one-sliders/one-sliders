#!/usr/bin/env python3
"""
build-events.py — OneSliders event transformer.

data JSON (+ layout) + page-templates/<layout>.html  ->  real HTML page.

The template owns layout and the data owns event facts. This script binds those
facts into the selected template, derives booking search defaults only from
verified dates/place fields, and renders structured country podiums from real
internal location pages.

Pipeline per file:
  1. VALIDATE the data against page-templates/<layout>.model.json. On any failure it
     STOPS immediately with a clear, per-field message and writes nothing (never a broken page).
  2. RENDER via BeautifulSoup (DOM, never string-replace over the whole file).
  3. GATE the rendered HTML (no leftover tokens/placeholders/TBC, valid JSON-LD, links resolve).
  4. WRITE to the env-correct path derived from canonicalUrl.

Usage:
  python scripts/build/build-events.py --file data/events/.../x.json [--env dev|qa|prod]
  python scripts/build/build-events.py --scope "data/events/**/*.json" --env dev
  python scripts/build/build-events.py --all --env dev
"""
import argparse, copy, glob, html, json, os, posixpath, re, subprocess, sys
from datetime import date, datetime, timedelta
from urllib.parse import quote, urlencode
from bs4 import BeautifulSoup, Tag, NavigableString, Doctype

try:                       # Windows consoles default to cp1252 — keep build output crash-proof
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TPL_DIR = os.path.join(ROOT, "page-templates")
CONFIG = json.load(open(os.path.join(ROOT, "scripts", "config.json"), encoding="utf-8"))
DT_ATTRS = ("data-template-text", "data-template-src", "data-template-href", "data-template-value")
UNIT_CLASSES = {"event-overview-fact", "event-info-card", "event-stay-section"}
TOKEN_RE = re.compile(r"\{\{([A-Za-z0-9_]+)\}\}")

def _country_key(name):
    return re.sub(r"[^a-z0-9]+", "", html.unescape(str(name or "")).lower().replace("&", "and"))

def _strip_tags(value):
    return html.unescape(re.sub(r"<[^>]+>", "", value or "")).strip()

def _title_case_slug(slug):
    small = {"and", "of", "the"}
    words = slug.split("-")
    return " ".join(w.upper() if w in {"usa", "uae", "uk"} else (w if i and w in small else w.capitalize()) for i, w in enumerate(words))

def _load_country_location_paths():
    locations = {}
    base_dir = os.path.join(ROOT, "content", "locations")
    for index_path in glob.glob(os.path.join(base_dir, "*", "*", "index.html")):
        rel = os.path.relpath(os.path.dirname(index_path), base_dir).replace("\\", "/")
        slug = os.path.basename(os.path.dirname(index_path))
        names = {_title_case_slug(slug)}
        try:
            page = open(index_path, encoding="utf-8").read()
        except OSError:
            page = ""
        h1 = re.search(r"<h1[^>]*>(.*?)</h1>", page, re.I | re.S)
        title = re.search(r"<title[^>]*>(.*?)</title>", page, re.I | re.S)
        if h1:
            names.add(_strip_tags(h1.group(1)))
        if title:
            names.add(re.split(r"\s*[|–-]\s*", _strip_tags(title.group(1)))[0])
        for name in names:
            key = _country_key(name)
            if key:
                locations.setdefault(key, rel)
    aliases = {
        "USA": "United States",
        "US": "United States",
        "U.S.": "United States",
        "United States of America": "United States",
        "UK": "United Kingdom",
        "U.K.": "United Kingdom",
        "Great Britain": "United Kingdom",
        "Britain": "United Kingdom",
        "Czech Republic": "Czechia",
        "Turkey": "Türkiye",
        "UAE": "United Arab Emirates",
        "Republic of Korea": "South Korea",
        "Korea Republic": "South Korea",
    }
    for alias, canonical in aliases.items():
        target = locations.get(_country_key(canonical))
        if target:
            locations.setdefault(_country_key(alias), target)
    return locations

COUNTRY_LOCATION_PATHS = _load_country_location_paths()

def _country_location_for(name):
    return COUNTRY_LOCATION_PATHS.get(_country_key(name))

# ----------------------------------------------------------------------------- models
def load_models():
    models = {}
    for p in glob.glob(os.path.join(TPL_DIR, "*.model.json")):
        m = json.load(open(p, encoding="utf-8"))
        models[m.get("layout") or os.path.basename(p).replace(".model.json", "")] = m
    return models

# ----------------------------------------------------------------------------- validation
def internal_ok(u):
    p = u.split("#")[0].split("?")[0]
    if p.startswith("http"):
        if "one-sliders.com" not in p:
            return False                      # external where an internal link is required
        p = re.sub(r"^https?://[^/]+", "", p)
    if not p.startswith("/"):
        return False
    fp = os.path.join(ROOT, p.lstrip("/"))
    return (os.path.isfile(fp) or os.path.isfile(fp.rstrip("/") + ".html")
            or (os.path.isdir(fp) and os.path.isfile(os.path.join(fp, "index.html"))))

_MONTHS = {}
for _i, _full in enumerate(("january february march april may june july august "
                            "september october november december").split(), 1):
    _MONTHS[_full] = _i
    _MONTHS[_full[:3]] = _i

def edition_is_past(item):
    """True if a future-only edition's date has already passed, None if undeterminable."""
    try:
        y = int(item.get("year"))
    except (TypeError, ValueError):
        return None
    ds = str(item.get("dates", ""))
    mon = next((n for name, n in _MONTHS.items() if re.search(r"\b" + name, ds, re.I)), None)
    days = [int(x) for x in re.findall(r"\d{1,2}", ds)]
    if mon and days:
        try:
            return date(y, mon, max(days)) < date.today()
        except ValueError:
            pass
    return y < date.today().year          # fallback: year-only

def validate(data, models):
    layout = data.get("layout")
    if layout not in models:
        return [f"okänd/saknad 'layout': {layout!r} (måste vara en av {sorted(models)})"]
    fields = models[layout]["fields"]
    errs = []
    for name, spec in fields.items():
        v = data.get(name)
        if spec.get("type") == "array":
            if not isinstance(v, list) or not v:
                if spec.get("required"):
                    errs.append(f"lista '{name}' saknas eller är tom (required)")
                continue
            req_keys = [k for k, s in spec.get("items", {}).items() if s.get("required")]
            for i, it in enumerate(v):
                if not isinstance(it, dict):
                    errs.append(f"{name}[{i}] är inte ett objekt"); continue
                for k in req_keys:
                    if it.get(k) in (None, ""):
                        errs.append(f"{name}[{i}] saknar item-nyckeln '{k}'")
                if spec.get("futureOnly") and edition_is_past(it) is True:
                    errs.append(f"{name}[{i}] ({it.get('year')} {it.get('dates','')}) har redan varit "
                                f"— flytta den till resultat/historik (upcoming ska bara vara framtida)")
            continue
        if v is None or v == "":
            if spec.get("required"):
                errs.append(f"fält '{name}' saknas (required)")
            continue
        if isinstance(v, str):
            mn, mx = spec.get("minLength"), spec.get("maxLength")
            if mn and len(v) < mn: errs.append(f"'{name}' för kort ({len(v)} < {mn} tecken)")
            if mx and len(v) > mx: errs.append(f"'{name}' för lång ({len(v)} > {mx} tecken)")
            if spec.get("internal") and not internal_ok(v):
                errs.append(f"'{name}' ska vara en intern länk som upplöses — pekar externt/brutet: {v}")
    blob = json.dumps(data, ensure_ascii=False)
    for bad in ("TBC", "TBD", "to be confirmed", "to be announced", "at a glance"):
        if re.search(r"\b" + re.escape(bad) + r"\b", blob, re.I):
            errs.append(f"innehåller förbjuden text: '{bad}'")
    for ph in ("for visitors, the useful planning", "swap the name"):
        if ph in blob.lower():
            errs.append(f"förbjuden AI-boilerplate-fras: '{ph}…'")
    sd = json.dumps(data.get("structuredData", ""), ensure_ascii=False)
    persona_overview = isinstance(data.get("overview"), dict)
    if '"startDate"' not in sd and not persona_overview: errs.append("Event JSON-LD saknar startDate")
    if '"endDate"' not in sd and not persona_overview:   errs.append("Event JSON-LD saknar endDate")
    for k in ("startDate", "endDate"):
        mt = re.search(rf'"{k}"\s*:\s*"([^"]*)"', sd)
        if mt and not re.match(r"\d{4}-\d{2}-\d{2}", mt.group(1)):
            errs.append(f"JSON-LD {k} är inte ISO (YYYY-MM-DD): {mt.group(1)}")
    # consistency: the displayed `dates` year must match the JSON-LD startDate year
    disp = str(data.get("dates", ""))
    disp_years = set(re.findall(r"\b(20\d\d)\b", disp))
    sy = re.search(r'"startDate"\s*:\s*"(\d{4})', sd)
    if disp_years and sy and sy.group(1) not in disp_years:
        errs.append(f"datum inkonsekvent: 'dates' ({disp}) vs JSON-LD startDate-år {sy.group(1)}")
    for i, item in enumerate(data.get("pastResults") or []):
        result = str(item.get("result", ""))
        podium = re.findall(r"#(\d):\s*([^()]+?)\s*\(([^)]*)\)", result)
        if len(podium) >= 2:
            for _, country, _ in podium:
                country = country.strip()
                if country and not _country_location_for(country):
                    errs.append(f"pastResults[{i}] podium-land saknar intern location-sida: {country}")
    return errs

# ----------------------------------------------------------------------------- rendering
def _tok(s):
    m = TOKEN_RE.search(s or "")
    return m.group(1) if m else None

def _unit(el):
    for anc in el.parents:
        if UNIT_CLASSES & set(anc.get("class") or []):
            return anc
    return el

def _attached(el):
    return el is not None and el.find_parent("html") is not None

def _event_dates(data):
    """Read the already-validated JSON-LD dates without guessing event facts."""
    structured = data.get("structuredData", {})
    graph = structured.get("@graph", structured)
    if isinstance(graph, dict):
        graph = [graph]
    for item in graph:
        if not isinstance(item, dict):
            continue
        start, end = item.get("startDate"), item.get("endDate")
        try:
            return (datetime.fromisoformat(str(start)[:10]).date(),
                    datetime.fromisoformat(str(end)[:10]).date())
        except (TypeError, ValueError):
            continue
    return (None, None)

def _booking_affiliate_url(place, data):
    """Build the configured Booking.com affiliate search URL for a real place.

    Marknadsuppdelningen (Nordamerika vs övrigt) är borttagen — alla länkar går via
    samma Evergreen-länk, satt i scripts/config.json. Se TASK-0046.
    """
    base = CONFIG["affiliate"]["booking"]["clickBase"]
    params = {"ss": place}
    if data.get("checkIn"): params["checkin"] = data["checkIn"]
    if data.get("checkOut"): params["checkout"] = data["checkOut"]
    if data.get("guests"): params["group_adults"] = data["guests"]
    if data.get("rooms"): params["no_rooms"] = data["rooms"]
    target = "https://www.booking.com/searchresults.html?" + urlencode(params)
    return base + "?url=" + quote(target, safe="")

def _booking_choices(data):
    """Return clean stay-area names for the booking AREA chips only.

    Guidance and transport prose belongs in Visit sections, never in the
    location picker.  A legacy record can contain that prose in ``stayAreas``;
    when detected, retain only its existing clean ``stayArea`` value.
    """
    visit_locations = data.get("visitLocations")
    if isinstance(visit_locations, list) and visit_locations:
        locations = [str(item.get("name") or "").strip() for item in visit_locations if isinstance(item, dict)]
        return [name for name in locations if name], []
    details = data.get("stayAreaDetails")
    if isinstance(details, list):
        raw_areas = "; ".join(str(item.get("area", "")).strip() for item in details if isinstance(item, dict))
    elif isinstance(data.get("stayAreas"), list):
        raw_areas = "; ".join(str(area).strip() for area in data.get("stayAreas", []) if str(area).strip())
    else:
        raw_areas = str(data.get("stayAreas") or "")
    areas = [p.strip() for p in re.split(r"\s*;\s*", raw_areas) if p.strip()]
    # Legacy prose was sometimes stored in stayAreas.  Do not expose it as a
    # selectable location; use the already-curated singular stayArea instead.
    if any(
        len(area.split()) > 5
        or re.search(r"\b(stay|near|route|transport|published|event|organiser|organizer|confirm)\b", area, re.I)
        for area in areas
    ):
        clean_area = str(data.get("stayArea") or "").strip()
        areas = [clean_area] if clean_area else []
    unique_areas = []
    for area in areas:
        if area not in unique_areas:
            unique_areas.append(area)
    return [], unique_areas

def _iso_booking_date(value):
    """Normalize booking dates to the ISO format required by input[type=date]."""
    value = str(value or "").strip()
    if not value:
        return ""
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%m-%d-%Y"):
        try:
            return datetime.strptime(value, fmt).date().isoformat()
        except ValueError:
            continue
    return value

def _with_booking_basics(data):
    """Supply a usable booking card from verified event dates and location.

    These are display defaults, not invented venue or travel claims.  Specific
    data-file advice always wins; missing Flights/Hotels/Tips sections are
    removed later instead of being rendered as empty cards.
    """
    booking_layouts = {"awards", "event-basic", "event-basic-v2", "event-history", "golf", "golf-v2", "music", "music-festival"}
    if data.get("layout") not in booking_layouts:
        return data
    result = copy.deepcopy(data)
    start, end = _event_dates(result)
    if start:
        result.setdefault("checkIn", (start - timedelta(days=1)).isoformat())
    if end:
        result.setdefault("checkOut", (end + timedelta(days=1)).isoformat())
    result["checkIn"] = _iso_booking_date(result.get("checkIn"))
    result["checkOut"] = _iso_booking_date(result.get("checkOut"))
    city = str(result.get("city") or "").strip()
    city_lower = city.lower()
    city_unconfirmed = "not announced" in city_lower or "not confirmed" in city_lower
    place = str(result.get("bookingPlace") or "").strip()
    if not place:
        place = city if city and city_lower not in {"multiple cities", "online"} and not city_unconfirmed else ""
    if isinstance(result.get("stayAreaDetails"), list) and str(result.get("stayArea") or "").strip():
        place = str(result["stayArea"]).strip()
    if place:
        result.setdefault("stayArea", place)
        result["bookingUrl"] = _booking_affiliate_url(place, result)
        result.setdefault("bookingCta", f"Find stays in {place}")
    airport_place = str(result.get("airport") or place).strip()
    if airport_place:
        result["flightUrl"] = _booking_affiliate_url(airport_place, result)
        result["flightCta"] = "Compare airport-area stays"
    return result

def _with_structured_data(data):
    """Complete missing Event JSON-LD fields from canonical event fields."""
    result = copy.deepcopy(data)
    sd = result.get("structuredData")
    if not isinstance(sd, dict):
        sd = {"@context": "https://schema.org", "@type": "Event"}
    graph = sd.get("@graph")
    if isinstance(graph, dict):
        graph = [graph]
    if not isinstance(graph, list):
        graph = []
    events = [item for item in graph if isinstance(item, dict) and item.get("@type")]
    if not events:
        events = [{"@type": sd.get("@type") or "Event"}]
        graph.append(events[0])
    status_map = {"scheduled": "EventScheduled", "postponed": "EventPostponed", "cancelled": "EventCancelled", "rescheduled": "EventRescheduled", "completed": "EventCompleted"}
    status = str(result.get("status") or "Scheduled").strip().lower()
    status_url = "https://schema.org/" + status_map.get(status, "EventScheduled")
    hero = result.get("heroImage") or result.get("ogImage")
    if hero and str(hero).startswith("/"):
        hero = "https://one-sliders.com" + str(hero)
    venue = str(result.get("venue") or "").strip()
    city = str(result.get("city") or "").strip()
    country = str(result.get("country") or "").strip()
    place_name = venue or city or country
    organizer_name = str(result.get("organizer") or result.get("title") or result.get("h1") or "").strip()
    offer_url = result.get("bookingUrl") or result.get("canonicalUrl")
    for item in events:
        if not item.get("location") and place_name:
            item["location"] = {"@type": "Place", "name": place_name, "address": {"@type": "PostalAddress", "addressLocality": city or country, "addressCountry": country}}
        if not item.get("image") and hero:
            item["image"] = hero
        if not item.get("eventStatus"):
            item["eventStatus"] = status_url
        if not item.get("offers") and offer_url:
            item["offers"] = {"@type": "Offer", "url": offer_url, "availability": "https://schema.org/InStock"}
        if not item.get("organizer") and organizer_name:
            item["organizer"] = {"@type": "Organization", "name": organizer_name}
    sd["@context"] = sd.get("@context") or "https://schema.org"
    sd["@graph"] = graph
    result["structuredData"] = sd
    return result

def _with_topic_card_defaults(data, env):
    """Keep the shared topic card complete and inside the active environment."""
    result = copy.deepcopy(data)
    topic_url = str(result.get("topicUrl") or "").strip()
    if not topic_url:
        return result

    # Topic links are stored both as canonical paths and as event-relative
    # paths (for example ``./../../tennis.html``).  Derive the data asset from
    # the canonical category/topic path, never from template markup.
    canonical = str(result.get("canonicalUrl") or "")
    match = re.search(r"/content/categories/([^/]+)/([^/]+)/events/[^/]+\.html$", canonical)
    if match:
        category, topic_slug = match.groups()
    else:
        topic_match = re.search(r"/([^/]+)\.html$", topic_url)
        category = ""
        topic_slug = topic_match.group(1) if topic_match else ""
    if topic_slug:
        # The related card is a link to the topic, so its visual must come
        # from the topic page rather than from the event itself.
        candidate = f"/content/categories/{category}/img/{topic_slug}-hero.png"
        if os.path.isfile(os.path.join(ROOT, candidate.lstrip("/"))):
            optimized = candidate[:-len("-hero.png")] + "-hero-400.webp"
            result["topicImage"] = optimized if os.path.isfile(os.path.join(ROOT, optimized.lstrip("/"))) else candidate
        elif not result.get("topicImage"):
            candidate = f"/content/categories/{category}/img/{topic_slug}-mini.png"
            if os.path.isfile(os.path.join(ROOT, candidate.lstrip("/"))):
                optimized = candidate[:-len("-mini.png")] + "-mini-200.webp"
                result["topicImage"] = optimized if os.path.isfile(os.path.join(ROOT, optimized.lstrip("/"))) else candidate
        # Prefer the topic hero's card-sized derivative when available; it is
        # the same hero visual without shipping a 1200px file into a small card.
        topic_image = str(result.get("topicImage") or "")
        if topic_image.endswith("-hero.png"):
            optimized = topic_image[:-len("-hero.png")] + "-hero-400.webp"
            if os.path.isfile(os.path.join(ROOT, optimized.lstrip("/"))):
                result["topicImage"] = optimized
    if topic_slug and not str(result.get("topicSummary") or "").strip():
        topic_name = str(result.get("topic") or _title_case_slug(topic_slug)).strip()
        result["topicSummary"] = f"More {topic_name} event pages."
    topic_image = str(result.get("topicImage") or "").strip()
    return result

def _with_canonical_event_asset_paths(data):
    """Resolve legacy same-site/relative event-image references from canonicalUrl.

    Event assets live under the canonical content tree.  A relative ``./img``
    reference works on production, but points at ``Templates/test`` in Dev and
    leaves the hero blank.  Rendering the canonical root path works in both
    environments without changing the template or its layout.
    """
    result = copy.deepcopy(data)
    event_dir = posixpath.dirname(site_rel(str(result.get("canonicalUrl") or "")))

    def local_path(value):
        value = str(value or "")
        if value.startswith("./"):
            return posixpath.normpath(posixpath.join(event_dir, value))
        valid_same_site = re.match(r"^https?://one-sliders\.com(/.*)$", value)
        if valid_same_site:
            return valid_same_site.group(1)
        malformed_same_site = re.match(r"^https?://one-sliders\.com\./(.*)$", value)
        if malformed_same_site:
            return "/" + malformed_same_site.group(1)
        return value

    hero = local_path(result.get("heroImage"))
    if hero:
        result["heroImage"] = hero
    og_image = str(result.get("ogImage") or "")
    if og_image:
        local_og = local_path(og_image)
        result["ogImage"] = "https://one-sliders.com" + local_og if local_og.startswith("/") else local_og
    return result

def _resolve_scalars(scope, values, item_scope):
    """Bind every data-template-* under `scope` against `values`.
    Missing value -> remove only that dynamic element, never its template unit."""
    els = [t for t in scope.find_all(lambda x: isinstance(x, Tag) and any(a in x.attrs for a in DT_ATTRS))]
    for el in els:
        if getattr(el, "attrs", None) is None:
            continue                                              # a previous missing binding removed this unit
        if not _attached(el) and scope.find_parent("html") is not None:
            continue                                              # ancestor already removed
        present = {a: _tok(el.get(a)) for a in DT_ATTRS if el.has_attr(a)}
        vals, missing = {}, False
        for a, tok in present.items():
            v = values.get(tok)
            if v is None or v == "":
                missing = True; break
            vals[a] = v
        if missing:
            el.decompose()
            continue
        for a, v in vals.items():
            if a == "data-template-text":
                el.clear(); el.append(str(v))
            elif a == "data-template-src":
                el["src"] = str(v)
            elif a == "data-template-href":
                el["href"] = str(v)
            elif a == "data-template-value":
                el["value"] = str(v)
        for a in present:
            del el[a]

def _render_multi_city_panel(soup, data):
    country_locations = data.get("visitLocations")
    cities = country_locations if isinstance(country_locations, list) and country_locations else data.get("cities")
    panel = soup.select_one("#panel-stay, #panel-visit")
    if not isinstance(cities, list) or not cities or not panel:
        return
    inner = panel.select_one(".event-panel-inner") or panel
    inner.clear()
    country_mode = isinstance(country_locations, list) and bool(country_locations)
    heading = soup.new_tag("h2", attrs={"class": "event-panel-title"}); heading.string = "Visit by host country" if country_mode else "Visit by host city"; inner.append(heading)
    selector = soup.new_tag("label", attrs={"class": "multi-city-selector"}); selector.string = "Choose a host country" if country_mode else "Choose a host city"
    select = soup.new_tag("select", attrs={"data-multi-city-selector": ""})
    for index, city in enumerate(cities):
        if not isinstance(city, dict) or not city.get("name"): continue
        option = soup.new_tag("option", attrs={"value": str(index)}); option.string = str(city["name"]); select.append(option)
    selector.append(select); inner.append(selector)
    panels = soup.new_tag("div", attrs={"class": "multi-city-panels", "data-multi-city-panels": ""})
    for index, city in enumerate(cities):
        if not isinstance(city, dict) or not city.get("name"): continue
        card = soup.new_tag("section", attrs={"class": "multi-city-panel", "data-city-index": str(index)})
        h3 = soup.new_tag("h3"); h3.string = str(city["name"]); card.append(h3)
        if country_mode:
            location = _country_location_for(city["name"])
            if location:
                link = soup.new_tag("a", attrs={"class": "country", "href": f"/content/locations/{location}/index.html"})
                link.append(soup.new_tag("img", attrs={"src": f"/content/locations/{location}/img/flag.svg", "alt": "", "width": "20", "height": "14"}))
                label = soup.new_tag("span"); label.string = str(city["name"]); link.append(label)
                h3.clear(); h3.append(link)
        booking = soup.new_tag("article", attrs={"class": "event-info-card multi-city-booking"})
        booking_title = soup.new_tag("strong"); booking_title.string = "Booking"; booking.append(booking_title)
        fields = soup.new_tag("div", attrs={"class": "event-stay-fields"})
        for label, key in (("CHECK-IN", "checkIn"), ("CHECK-OUT", "checkOut"), ("GUESTS", "guests"), ("ROOMS", "rooms")):
            value = city.get(key, data.get(key, ""))
            if value in (None, ""): continue
            wrap = soup.new_tag("div", attrs={"class": "event-stay-field"}); lab = soup.new_tag("label"); lab.string = label; wrap.append(lab)
            inp = soup.new_tag("input", attrs={"type": "number" if key in {"guests","rooms"} else "text", "value": str(value), "readonly": "" if key not in {"guests","rooms"} else None})
            if key in {"guests","rooms"}: inp["min"] = "1"; inp["step"] = "1"
            wrap.append(inp); fields.append(wrap)
        if fields.contents:
            booking.append(fields)
        booking_url = city.get("bookingUrl") or data.get("bookingUrl")
        if booking_url:
            cta = soup.new_tag("a", attrs={"class": "event-stay-cta", "href": str(booking_url), "rel": "nofollow sponsored noopener", "target": "_blank"})
            cta.string = str(city.get("bookingCta") or data.get("bookingCta") or f"Compare stays in {city['name']}")
            booking.append(cta)
        card.append(booking)
        for title, key1, key2 in (("Arrival", "airport", "airportTransfer"), ("Stay", "stayAreas", "stayGuidance"), ("Transport", "transportTip", "transportDetail"), ("Event day", "eventDayTip", "eventDayDetail")):
            if not city.get(key1) and not city.get(key2): continue
            article = soup.new_tag("article", attrs={"class": "event-info-card"}); strong = soup.new_tag("strong"); strong.string = title; article.append(strong)
            p = soup.new_tag("p"); p.string = f"{city.get(key1, '')} {city.get(key2, '')}".strip(); article.append(p); card.append(article)
        panels.append(card)
    inner.append(panels)

def _svg_text(soup, parent, tag, text, attrs=None):
    node = soup.new_tag(tag, attrs=attrs or {})
    node.string = str(text)
    parent.append(node)
    return node

def _kebab_slug(name):
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", str(name or "").lower())).strip("-")

def _location_mini_image(location, file_slug):
    """Resolve a small thumbnail photo (the '-mini' variant, not the big
    hero banner) for a place inside a location folder (e.g. location=
    'europe/ireland', file_slug='ireland' for the country itself, or
    'dublin' for a city page that lives inside that country's img/
    folder). Prefers the 200px webp, falls back to the source png.
    Returns None if no such asset exists on disk -- a KPI card must never
    point at a fabricated image path."""
    if not location or not file_slug:
        return None
    for candidate in (f"/content/locations/{location}/img/{file_slug}-mini-200.webp",
                      f"/content/locations/{location}/img/{file_slug}-mini.png"):
        if os.path.isfile(os.path.join(ROOT, candidate.lstrip("/"))):
            return candidate
    return None

def _location_city_url(location, file_slug):
    """Resolve a city's own page (e.g. '/content/locations/asia/saudi-arabia/
    riyadh.html'), distinct from the country's index.html. Returns None if
    that city has no dedicated page yet -- never link to a page that
    doesn't exist."""
    if not location or not file_slug:
        return None
    candidate = f"/content/locations/{location}/{file_slug}.html"
    if os.path.isfile(os.path.join(ROOT, candidate.lstrip("/"))):
        return candidate
    return None

def _country_map(data, overview):
    mapping = {}
    def add(item):
        if not isinstance(item, dict) or not item.get("name"):
            return
        location = _country_location_for(item["name"])
        canonical_url = f"/content/locations/{location}/index.html" if location else str(item.get("url") or "")
        canonical_flag = f"/content/locations/{location}/img/flag.svg" if location else str(item.get("flag") or "")
        mapping[str(item["name"])] = {
            "url": canonical_url,
            "flag": canonical_flag
        }
    if data.get("country"):
        add({"name": data.get("country"), "url": data.get("countryUrl"), "flag": data.get("countryFlag")})
    for item in data.get("countries") or []:
        add(item)
    for kpi in overview.get("kpis") or []:
        for item in kpi.get("countries") or []:
            add(item)
    for chart in overview.get("charts") or []:
        for item in chart.get("series") or []:
            add({"name": item.get("label"), "url": item.get("countryUrl"), "flag": item.get("countryFlag")})
    # Country names can also occur in persona copy (for example a multi-country
    # host announcement). Resolve those names against the existing location
    # taxonomy so prose never falls back to a text-only country reference.
    prose = " ".join(str(overview.get(key) or "") for key in ("about", "nextEvent"))
    for path in set(COUNTRY_LOCATION_PATHS.values()):
        name = _title_case_slug(os.path.basename(path))
        if name and re.search(rf"(?<![A-Za-z]){re.escape(name)}(?![A-Za-z])", prose, re.I):
            add({"name": name})
    return mapping

def _append_rich_country_text(soup, parent, value, countries, with_flag=True):
    text_value = str(value or "")
    names = sorted((name for name, item in countries.items() if item.get("url") and item.get("flag")), key=len, reverse=True)
    if not names:
        parent.append(text_value)
        return
    pattern = re.compile("(" + "|".join(re.escape(name) for name in names) + ")")
    parts = pattern.split(text_value)
    for part in parts:
        if not part:
            continue
        item = countries.get(part)
        if not item:
            parent.append(part)
            continue
        link = soup.new_tag("a", attrs={"class": "country" + (" country--text" if not with_flag else ""), "href": item["url"]})
        if with_flag:
            image = soup.new_tag("img", attrs={"src": item["flag"], "alt": "", "width": "20", "height": "14"})
            link.append(image)
        label = soup.new_tag("span"); label.string = part; link.append(label)
        parent.append(link)

def _svg_country_anchor(soup, svg, item, x, y):
    if not item.get("countryUrl") or not item.get("countryFlag"):
        _svg_text(soup, svg, "text", item.get("label", ""), {"class": "event-chart__rank-label", "x": str(x), "y": str(y)})
        return
    anchor = soup.new_tag("a", attrs={"class": "event-chart__country", "href": item["countryUrl"]})
    anchor.append(soup.new_tag("image", attrs={"class": "event-chart__flag", "href": item["countryFlag"], "x": str(x), "y": str(y - 11), "width": "18", "height": "12"}))
    _svg_text(soup, anchor, "text", item.get("label", ""), {"class": "event-chart__rank-label", "x": str(x + 24), "y": str(y)})
    svg.append(anchor)

def _render_persona_chart(soup, chart):
    series = chart.get("series") if isinstance(chart, dict) else None
    if not isinstance(series, list) or not series:
        return None
    card = soup.new_tag("figure", attrs={"class": "event-graph-card", "data-chart-type": str(chart.get("type") or "")})
    head = soup.new_tag("figcaption", attrs={"class": "event-graph-card__head"}); card.append(head)
    _svg_text(soup, head, "strong", chart.get("title") or "Chart")
    values = []
    for item in series:
        try: values.append(float(item.get("value")))
        except (TypeError, ValueError): values.append(0.0)
    maximum = max(values) if values else 1.0
    minimum = min(values) if values else 0.0
    if maximum == minimum: maximum = minimum + 1.0
    chart_type = str(chart.get("type") or "bar").lower()
    if chart_type == "rank":
        rank_list = soup.new_tag("div", attrs={"class": "event-chart-rank-list", "role": "list", "aria-label": str(chart.get("title") or "Ranking")})
        card.append(rank_list)
        for index, item in enumerate(series[:6]):
            row = soup.new_tag("div", attrs={"class": "event-chart-rank-row", "role": "listitem"})
            _svg_text(soup, row, "span", f"{index + 1}", {"class": "event-chart__rank-number"})
            # Flag + country link only when the series item is an actual country
            # (has countryFlag/countryUrl). Team/driver/player rows render as a
            # plain label — no empty <img> (which showed a broken-image icon).
            flag = item.get("countryFlag"); url = item.get("countryUrl")
            if url:
                country = soup.new_tag("a", attrs={"class": "country event-chart__country", "href": url})
            else:
                country = soup.new_tag("span", attrs={"class": "event-chart__country event-chart__country--plain"})
            if flag:
                country.append(soup.new_tag("img", attrs={"class": "event-chart__flag", "src": flag, "alt": "", "width": "18", "height": "12"}))
            _svg_text(soup, country, "span", item.get("label", ""), {"class": "event-chart__rank-label"})
            row.append(country)
            bar = soup.new_tag("span", attrs={"class": "event-chart__rank-bar", "style": f"--rank-width:{(220 * (values[index] / maximum if maximum else 0)):.1f}px"})
            row.append(bar)
            _svg_text(soup, row, "span", item.get("display", item.get("value", "")), {"class": "event-chart__rank-value"})
            rank_list.append(row)
        return card
    svg = soup.new_tag("svg", attrs={"class": "event-chart", "viewBox": "0 0 360 156", "role": "img", "aria-label": str(chart.get("title") or "Chart")})
    card.append(svg)
    if chart_type == "line":
        points = []
        for index, item in enumerate(series):
            x = 20 + (320 * index / max(1, len(series) - 1))
            y = 118 - ((values[index] - minimum) / (maximum - minimum) * 82)
            points.append(f"{x:.1f},{y:.1f}")
        svg.append(soup.new_tag("polyline", attrs={"class": "event-chart__line", "points": " ".join(points)}))
        for index, item in enumerate(series):
            x = 20 + (320 * index / max(1, len(series) - 1))
            y = 118 - ((values[index] - minimum) / (maximum - minimum) * 82)
            svg.append(soup.new_tag("circle", attrs={"class": "event-chart__point", "cx": f"{x:.1f}", "cy": f"{y:.1f}", "r": "4"}))
            _svg_text(soup, svg, "text", item.get("label", ""), {"class": "event-chart__label", "x": f"{x:.1f}", "y": "145", "text-anchor": "middle"})
    else:
        slot = 320 / max(1, len(series))
        for index, item in enumerate(series):
            height = 82 * (values[index] / maximum if maximum else 0)
            x = 20 + index * slot + slot * .2
            y = 118 - height
            svg.append(soup.new_tag("rect", attrs={"class": "event-chart__bar", "x": f"{x:.1f}", "y": f"{y:.1f}", "width": f"{slot * .6:.1f}", "height": f"{height:.1f}", "rx": "6"}))
            _svg_text(soup, svg, "text", item.get("label", ""), {"class": "event-chart__label", "x": f"{x + slot * .3:.1f}", "y": "145", "text-anchor": "middle"})
            _svg_text(soup, svg, "text", item.get("display", item.get("value", "")), {"class": "event-chart__value", "x": f"{x + slot * .3:.1f}", "y": f"{max(12, y - 5):.1f}", "text-anchor": "middle"})
    return card

def _resolve_where(data, countries):
    """Resolve everything needed to render a 'Where' block: country info +
    mini photo, and the city's mini photo + own page URL when the city is
    confirmed AND has a dedicated location page. Returns None when neither
    a country nor a linked city can be resolved -- the caller must then
    render nothing rather than fabricate a link or image."""
    country_name = str(data.get("country") or "").strip()
    country_info = countries.get(country_name) if country_name else None
    if not country_info or not country_info.get("flag"):
        return None
    location = _country_location_for(country_name)
    country_mini = _location_mini_image(location, os.path.basename(location or ""))
    city_name = str(data.get("city") or "").strip()
    unconfirmed_city = {"expected", "tbd", "tbc", "multiple cities", "online"}
    confirmed_city_name = city_name if city_name and city_name.lower() not in unconfirmed_city else ""
    city_slug = _kebab_slug(confirmed_city_name) if confirmed_city_name else ""
    city_mini = _location_mini_image(location, city_slug) if city_slug else None
    city_url = _location_city_url(location, city_slug) if city_slug else None
    if not country_mini and not (city_mini and city_url):
        return None
    return {
        "country_name": country_name, "country_info": country_info, "country_mini": country_mini,
        "city_name": confirmed_city_name, "city_mini": city_mini, "city_url": city_url,
    }

def _prune_where_facts(soup, where, prune_venue):
    city_in_meta = bool(where["city_mini"] and where["city_url"])
    prune_keys = {"dates", "country"}
    if city_in_meta:
        prune_keys.add("city")
    if prune_venue:
        prune_keys.add("venue")
    for fact in soup.select(".event-overview-fact"):
        label = fact.find("span", recursive=False)
        if not label:
            continue
        if label.get_text(" ", strip=True).lower() in prune_keys:
            fact.decompose()

def _build_location_meta(soup, data, countries):
    """Build the dates + linked 'Where: country, city' block (flag + mini
    photos, each linking to the real location page) for the plain (non-
    overlay) hero card, pruning the now-duplicated Dates/Country/City fact
    tiles as a side effect. Returns None (and prunes nothing) when no
    country/city page+photo can be resolved."""
    where = _resolve_where(data, countries)
    if not where:
        return None
    _prune_where_facts(soup, where, prune_venue=False)

    meta = soup.new_tag("div", attrs={"class": "event-hero-location"})
    dates = str(data.get("dates") or "").strip()
    if dates:
        _svg_text(soup, meta, "span", dates, {"class": "event-hero-location__date"})
    where_el = soup.new_tag("p", attrs={"class": "event-hero-location__where"})
    meta.append(where_el)
    where_el.append(NavigableString("Where: "))
    added = False
    if where["country_mini"] or where["country_info"].get("url"):
        link = soup.new_tag("a", attrs={"class": "event-hero-location__place", "href": where["country_info"]["url"]})
        where_el.append(link)
        if where["country_mini"]:
            link.append(soup.new_tag("img", attrs={"src": where["country_mini"], "alt": "", "width": "74", "height": "58"}))
        link.append(soup.new_tag("img", attrs={"class": "event-hero-location__flag", "src": where["country_info"]["flag"], "alt": "", "width": "16", "height": "12"}))
        link.append(NavigableString(where["country_name"]))
        added = True
    if where["city_mini"] and where["city_url"]:
        if added:
            where_el.append(NavigableString(", "))
        link = soup.new_tag("a", attrs={"class": "event-hero-location__place", "href": where["city_url"]})
        where_el.append(link)
        link.append(soup.new_tag("img", attrs={"src": where["city_mini"], "alt": "", "width": "74", "height": "58"}))
        link.append(NavigableString(where["city_name"]))
    return meta

def _build_where_pills(soup, data, countries):
    """Build the light 'pill' Where row for the photo-overlay hero
    (golf-v2/event-basic-v2): flag + country pill, city pill, each linking
    to its real page. Also prunes Dates/Country/City/Venue facts, since
    Venue joins the hero's meta row and the rest join these pills. Returns
    None (and prunes nothing) when nothing can be resolved."""
    where = _resolve_where(data, countries)
    if not where:
        return None
    _prune_where_facts(soup, where, prune_venue=True)

    row = soup.new_tag("p", attrs={"class": "hero__where-row"})
    if where["country_mini"] or where["country_info"].get("url"):
        link = soup.new_tag("a", attrs={"class": "hero__where-pill", "href": where["country_info"]["url"]})
        row.append(link)
        link.append(soup.new_tag("img", attrs={"class": "hero__where-flag", "src": where["country_info"]["flag"], "alt": "", "width": "16", "height": "12"}))
        link.append(NavigableString(where["country_name"]))
    if where["city_mini"] and where["city_url"]:
        link = soup.new_tag("a", attrs={"class": "hero__where-pill", "href": where["city_url"]})
        row.append(link)
        link.append(NavigableString(where["city_name"]))
    return row

_ICONS = {
    "calendar": '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    "pin": '<path d="M12 22s7-7.58 7-12a7 7 0 1 0-14 0c0 4.42 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
    "award": '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
    "briefcase": '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    "star": '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    "users": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    "repeat": '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/><path d="M20.49 15A9 9 0 0 1 5.64 18.36L1 14"/>',
    "info": '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    "bed": '<rect x="2" y="11" width="20" height="8" rx="2"/><path d="M4 11V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4"/><path d="M2 19v2"/><path d="M22 19v2"/>',
    "send": '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    "lightbulb": '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.9c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/>',
}

# Keyword -> icon key for KPI tiles, checked in order (first match wins).
# Kept small and generic on purpose: labels vary per event, so this only
# needs to *usually* land on something sensible -- "info" is the honest
# fallback rather than guessing a specific icon for an unknown label.
_KPI_ICON_RULES = [
    (("tour", "champion", "winner", "wins", "title"), "award"),
    (("purse", "prize", "money"), "star"),
    (("backer", "sponsor", "organiser", "organizer", "host"), "briefcase"),
    (("first played", "founded", "established", "since", "history"), "calendar"),
    (("held", "format", "frequency", "biennial", "annual"), "repeat"),
    (("attendance", "participants", "field", "players", "teams"), "users"),
    (("venue", "location"), "pin"),
]

def _kpi_icon_key(label):
    low = str(label or "").strip().lower()
    for keywords, icon in _KPI_ICON_RULES:
        if any(k in low for k in keywords):
            return icon
    return "info"

def _hero_icon(soup, key):
    svg = soup.new_tag("svg", attrs={
        "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "stroke-width": "2",
        "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true"})
    for piece in BeautifulSoup(_ICONS[key], "html.parser").contents:
        svg.append(piece)
    return svg

def _render_hero_overlay(soup, data, countries):
    """golf-v2/event-basic-v2 (POC, 2026-08-11): paint tour badge + dates +
    venue + linked country/city pills directly onto the hero photo instead
    of the plain stacked title, matching the site's photo-hero convention.
    Requires a real <h1>; only adds what's resolvable (never fabricates a
    link, image, or fact)."""
    hero = soup.select_one(".hero")
    title_row = soup.select_one(".hero__title-row")
    h1 = title_row.select_one("h1") if title_row else None
    if not hero or not title_row or not h1 or not h1.get_text(strip=True):
        return
    hero["class"] = (hero.get("class") or []) + ["hero--overlay"]
    overlay = soup.new_tag("div", attrs={"class": "hero__overlay"})
    title_row.extract()
    hero.append(overlay)
    # The "whole event" About+KPI anchor lives inside .hero in the static
    # template (right after the title row), but it must render BELOW the
    # photo, not inside it -- .hero becomes an overflow:hidden photo box
    # here, so anything left as a normal-flow child of it (this anchor's
    # content is often tall) renders far outside the visible photo area.
    # Move it out to be .hero's sibling instead.
    whole_anchor = soup.select_one("[data-persona-whole]")
    if whole_anchor and whole_anchor.find_parent(class_="hero"):
        whole_anchor.extract()
        hero.insert_after(whole_anchor)
    tour = str(data.get("tour") or "").strip()
    if tour:
        badge = soup.new_tag("span", attrs={"class": "hero__badge"}); badge.string = tour
        overlay.append(badge)
        # Now duplicated by the badge -- the KPI strip in the left column
        # still carries its own Tour tile, so the fact is only dropped here.
        for fact in soup.select(".event-overview-fact"):
            label = fact.find("span", recursive=False)
            if label and label.get_text(" ", strip=True).lower() == "tour":
                fact.decompose()
    overlay.append(title_row)
    accent = soup.new_tag("span", attrs={"class": "hero__accent"}); overlay.append(accent)
    dates = str(data.get("dates") or "").strip()
    venue = str(data.get("venue") or "").strip()
    if dates or venue:
        meta_row = soup.new_tag("p", attrs={"class": "hero__meta-row"})
        overlay.append(meta_row)
        if dates:
            meta_row.append(_hero_icon(soup, "calendar"))
            meta_row.append(NavigableString(dates))
        if dates and venue:
            sep = soup.new_tag("span", attrs={"class": "hero__meta-divider"}); sep.string = "|"
            meta_row.append(sep)
        if venue:
            meta_row.append(_hero_icon(soup, "pin"))
            meta_row.append(NavigableString(venue))
    where_row = _build_where_pills(soup, data, countries)
    if where_row:
        overlay.append(where_row)

def _render_hero_location_card(soup, data):
    """POC (2026-08-11, not yet rolled out beyond the pages it's explicitly
    rebuilt on): adds dates + Where to the hero. Templates with a
    [data-persona-whole] anchor (golf-v2/event-basic-v2) get the full photo
    overlay (_render_hero_overlay, includes Venue + a tour badge); every
    other template keeps the simpler stacked card below the title."""
    overview = data.get("overview")
    if not isinstance(overview, dict):
        return
    countries = _country_map(data, overview)
    if soup.select_one("[data-persona-whole]"):
        _render_hero_overlay(soup, data, countries)
        return
    title_row = soup.select_one(".hero__title-row")
    h1 = title_row.select_one("h1") if title_row else None
    if not title_row or not h1 or not h1.get_text(strip=True):
        return
    meta = _build_location_meta(soup, data, countries)
    if not meta:
        return
    title_row["class"] = (title_row.get("class") or []) + ["event-hero-location-card"]
    title_row.append(meta)

def _render_persona_overview(soup, data):
    holder = soup.select_one("[data-persona-overview]")
    legacy = soup.select_one(".event-overview-body")
    overview = data.get("overview")
    if not isinstance(overview, dict):
        if holder: holder.decompose()
        return
    if not holder:
        holder = soup.new_tag("div", attrs={"class": "event-persona-overview"})
        anchor = soup.select_one(".event-overview-body")
        if anchor: anchor.insert_after(holder)
        else: return
    if legacy: legacy.decompose()
    holder.clear()
    # Eurovision's POC needs the useful planning facts only. Format and
    # status duplicate the title/next-edition context and were visually
    # cluttering the compact fact grid.
    for fact in soup.select(".event-overview-fact"):
        label = fact.find("span", recursive=False)
        if label and label.get_text(" ", strip=True).lower() in {"format", "status"}:
            fact.decompose()
    countries = _country_map(data, overview)
    multi_country_items = data.get("countries") or []
    if isinstance(multi_country_items, list) and multi_country_items:
        for fact in soup.select(".event-overview-fact"):
            label = fact.find("span", recursive=False)
            if not label or label.get_text(" ", strip=True).casefold() != "country":
                continue
            current = fact.select_one("a.country")
            if not current:
                continue
            country_list = soup.new_tag("span", attrs={"class": "country-list"})
            for index, item in enumerate(multi_country_items):
                name = str(item.get("name") or "").strip() if isinstance(item, dict) else ""
                resolved = countries.get(name)
                if not name or not resolved:
                    continue
                if index:
                    country_list.append(NavigableString(", "))
                link = soup.new_tag("a", attrs={"class": "country", "href": resolved["url"]})
                link.append(soup.new_tag("img", attrs={"src": resolved["flag"], "alt": "", "width": "20", "height": "14"}))
                value = soup.new_tag("span"); value.string = name; link.append(value)
                country_list.append(link)
            current.replace_with(country_list)
    for link in soup.select("a.country"):
        label = link.get_text(" ", strip=True)
        item = countries.get(label)
        if not item:
            continue
        link["href"] = item["url"]
        image = link.find("img")
        if image: image["src"] = item["flag"]
    # "the event as a whole" (About + general KPIs) vs "the next event"
    # (Next edition card + Where + charts). Templates that opt in with a
    # [data-persona-whole] anchor in the left column get the split; every
    # other template keeps everything in the right-column holder, unchanged.
    whole = soup.select_one("[data-persona-whole]")
    about_target = whole if whole else holder

    body = soup.new_tag("article", attrs={"class": "event-overview-body event-persona-about"}); about_target.append(body)
    event_name = str(data.get("h1") or data.get("title") or "This event").strip()
    _svg_text(soup, body, "h2", f"About {event_name}")
    about = soup.new_tag("p"); _append_rich_country_text(soup, about, overview.get("about", ""), countries, with_flag=False); body.append(about)
    # Split layout (golf-v2/event-basic-v2): dates/venue/Where now live on
    # the hero photo itself (_render_hero_overlay), so the right column
    # starts straight with "About next edition". Other templates keep the
    # single "Next edition" narrative card, unchanged.
    # Next Edition is a required Overview section. The fact grid owns the
    # short date/venue/city/country facts; this card remains the narrative
    # explanation, so both layers are useful without duplicating KPI cards.
    next_card = soup.new_tag("article", attrs={"class": "event-info-card event-persona-next"}); holder.append(next_card)
    _svg_text(soup, next_card, "span", "About next edition" if whole else "Next edition")
    _svg_text(soup, next_card, "strong", event_name)
    next_text = soup.new_tag("p"); _append_rich_country_text(soup, next_text, overview.get("nextEditionSummary") or overview.get("nextEvent", ""), countries, with_flag=False); next_card.append(next_text)
    kpis = overview.get("kpis") or []
    if kpis:
        strip = soup.new_tag("section", attrs={"class": "event-stat-strip", "aria-label": "Key figures"}); about_target.append(strip)
        duplicate_fact_labels = {"next edition", "host country", "host city", "country", "city", "dates", "venue"}
        duplicate_fact_labels.update(str(label).strip().lower() for label in (overview.get("kpiExclusions") or []))
        rendered_kpis = 0
        for item in kpis:
            label = str(item.get("label", "")).strip().lower()
            if label == "most victories" or label in duplicate_fact_labels:
                continue
            if rendered_kpis >= 5:
                break
            rendered_kpis += 1
            tile = soup.new_tag("div"); strip.append(tile)
            body = tile
            if whole:
                # Icon-in-circle treatment (golf-v2/event-basic-v2 POC) --
                # keyword-matched per label, "info" fallback when unknown.
                # Label/value/sublabel move into their own body element so
                # the icon can sit in its own column beside them.
                tile["class"] = ["event-stat-strip__tile"]
                icon_key = _kpi_icon_key(item.get("label", ""))
                icon_wrap = soup.new_tag("span", attrs={"class": f"event-stat-strip__icon event-stat-strip__icon--{icon_key}"})
                icon_wrap.append(_hero_icon(soup, icon_key))
                tile.append(icon_wrap)
                body = soup.new_tag("div", attrs={"class": "event-stat-strip__body"}); tile.append(body)
            _svg_text(soup, body, "span", item.get("label", ""))
            _svg_text(soup, body, "strong", item.get("value", ""))
            if item.get("sublabel"):
                if item.get("countries"):
                    small = soup.new_tag("small")
                    country_names = [str(country.get("name") or "").strip() for country in item["countries"] if isinstance(country, dict) and str(country.get("name") or "").strip()]
                    _append_rich_country_text(soup, small, ", ".join(country_names), countries)
                    body.append(small)
                else:
                    _svg_text(soup, body, "small", item["sublabel"])
    charts = [chart for chart in (overview.get("charts") or []) if chart.get("historyScope") in ("all-editions", "open-era")]
    if charts:
        grid = soup.new_tag("section", attrs={"class": "event-persona-charts", "aria-label": f"{event_name} charts"}); holder.append(grid)
        for chart in charts[:3]:
            rendered = _render_persona_chart(soup, chart)
            if rendered: grid.append(rendered)

def render(data, template_html, env):
    data = _with_canonical_event_asset_paths(data)
    data = _with_booking_basics(data)
    if isinstance(data.get("cities"), list) and data["cities"]:
        city_names = [str(item.get("name") or "").strip() for item in data["cities"] if isinstance(item, dict) and str(item.get("name") or "").strip()]
        if city_names:
            data = copy.deepcopy(data)
            data["city"] = " and ".join(city_names)
    if isinstance(data.get("pastResults"), list):
        data = copy.deepcopy(data)
        data["pastResults"] = sorted(
            data["pastResults"],
            key=lambda item: int(str(item.get("year", "0"))[:4]) if str(item.get("year", "0"))[:4].isdigit() else 0,
            reverse=True,
        )
    data = _with_structured_data(data)
    data = _with_topic_card_defaults(data, env)
    soup = BeautifulSoup(template_html, "html.parser")

    # `event-basic` uses the left-booking layout. Keep the related topic below
    # the booking card in that column; the Overview POC must not change the
    # card's size or invent a second placement.
    topic_nav = soup.select_one(".event-related-links")
    left_column = soup.select_one(".layout__a")
    if topic_nav and left_column:
        topic_nav.extract()
        topic_nav_classes = [c for c in (topic_nav.get("class") or []) if c != "event-related-links--right"]
        topic_nav["class"] = topic_nav_classes
        booking_panel = left_column.select_one(".hero-stay-booking, .stay-booking-panel")
        if booking_panel:
            booking_panel.insert_after(topic_nav)
        else:
            left_column.append(topic_nav)

    # Hide optional booking/Visit UI when no host city is confirmed. Persona
    # Overview pages keep the template-owned Visit/booking surface: the POC
    # is an Overview-content change, not a layout replacement.
    city = str(data.get("city") or "").strip().lower()
    multi_city = isinstance(data.get("cities"), list) and bool(data.get("cities"))
    unconfirmed_city = {"expected", "tbd", "tbc", "multiple cities", "online"}
    confirmed_city = multi_city or bool(city and city not in unconfirmed_city and "not announced" not in city and "not confirmed" not in city)
    if not confirmed_city and not isinstance(data.get("overview"), dict):
        for selector in (".hero-stay-booking", "#panel-stay", "#panel-visit"):
            for node in list(soup.select(selector)):
                node.decompose()
        for selector in ("label[for='tab-stay']", "#tab-stay", "label[for='tab-visit']", "#tab-visit"):
            for node in list(soup.select(selector)):
                node.decompose()

    # 1) lists first — resolve each clone against its item dict
    for container in soup.find_all(attrs={"data-template-list": True}):
        tok = _tok(container["data-template-list"]); del container["data-template-list"]
        arr = data.get(tok)
        sample = next((c for c in container.children if isinstance(c, Tag)), None)
        if sample is not None:
            sample.extract()
        for c in list(container.children):           # drop leftover whitespace/text nodes
            c.extract()
        if not arr:
            container.decompose(); continue           # optional/empty -> omit (required caught in validate)
        for item in arr:
            clone = BeautifulSoup(str(sample), "html.parser")
            _resolve_scalars(clone, item, item_scope=True)
            for c in list(clone.children):
                container.append(c)

    # 2) top-level scalars.  stayAreas is a list for the booking picker, but
    # the Visit/Hotels template has a scalar text binding; never leak Python's
    # list representation into rendered HTML.
    template_data = copy.deepcopy(data)
    if isinstance(template_data.get("overview"), dict):
        template_data["overviewText"] = template_data["overview"].get("about", "")
    else:
        template_data["overviewText"] = template_data.get("overview", "")
    if isinstance(template_data.get("stayAreas"), list):
        template_data["stayAreas"] = "; ".join(str(area).strip() for area in template_data["stayAreas"] if str(area).strip())
    _resolve_scalars(soup, template_data, item_scope=False)

    _render_persona_overview(soup, data)
    _render_hero_location_card(soup, data)

    _render_multi_city_panel(soup, data)

    # Golf's About tab exists to show Format/History/Records/Sources cards.
    # Once an event has persona-format overview data, that "About" narrative
    # already renders on the Overview tab -- a second About tab would read as
    # a duplicate ("cake on cake"), so hide it outright whenever Overview
    # carries the persona About block, regardless of what the tab's own cards
    # contain.
    for panel in list(soup.select("#panel-about")):
        if isinstance(data.get("overview"), dict):
            panel.decompose()
            for control in soup.select("label[for='tab-about'], #tab-about"):
                control.decompose()
            continue
        # No persona overview: fall back to showing the About tab's own
        # cards, dropping any that are genuinely empty rather than leaving an
        # unexplained blank card, and dropping the whole tab if none survive.
        for card in list(panel.select(".event-info-grid > .event-info-card")):
            content_nodes = card.find_all(["strong", "p", "a", "img", "ul", "table"])
            has_content = any(
                node.get_text(" ", strip=True)
                or (node.name == "img" and node.get("src"))
                for node in content_nodes
            )
            if not has_content:
                card.decompose()
        grid = panel.select_one(".event-info-grid")
        if grid and not grid.select_one(".event-info-card"):
            grid.decompose()
        if not panel.select_one(".event-info-grid .event-info-card"):
            panel.decompose()
            for control in soup.select("label[for='tab-about'], #tab-about"):
                control.decompose()

    for block in soup.select(".event-overview-planning"):
        grid = block.select_one(".event-info-grid")
        if grid and not grid.select_one(".event-info-card"):
            block.decompose()

    # Every Visit section that offers a planning path needs an actionable link:
    # Flights opens flight search; Hotels reuses the event's accommodation link.
    for section_id, url_key, label_key, default_label in (
        ("stay-flights", "flightUrl", "flightCta", "Compare airport-area stays"),
        ("stay-hotels", "bookingUrl", "bookingCta", "View hotels"),
    ):
        section = soup.select_one(f"#{section_id}")
        url = data.get(url_key)
        if section and url and not section.select_one(".event-stay-cta"):
            cta = soup.new_tag("a", href=str(url), attrs={"class": "event-stay-cta", "rel": "nofollow sponsored noopener", "target": "_blank"})
            cta.string = str(data.get(label_key) or default_label)
            section.append(cta)

    # Do not leave Visit subtabs that contain only a heading/CTA after optional
    # cards have been removed. Booking can stand on its form; Flights/Hotels/Tips
    # need rendered guidance cards to be useful.
    for section_id, tab_id in (
        ("stay-flights", "stay-tab-flights"),
        ("stay-hotels", "stay-tab-hotels"),
        ("stay-tips", "stay-tab-tips"),
    ):
        section = soup.select_one(f"#{section_id}")
        if not section:
            continue
        has_card_data = any(len(card.get_text(" ", strip=True)) > 24 for card in section.select(".event-info-card"))
        if has_card_data:
            continue
        section.decompose()
        tab = soup.select_one(f"#{tab_id}")
        if tab:
            tab.decompose()
        for label in soup.select(f'label[for="{tab_id}"]'):
            label.decompose()

    for cta in soup.select("a.stay-check-btn[href*='booking.com'], a.event-stay-cta[href*='booking.com']"):
        cta["rel"] = "nofollow sponsored noopener"
        cta["target"] = "_blank"

    # Port the production hotel-search contract: one radio list of real stay
    # locations, handled by the shared assets/js/events.js module.
    cities, areas = _booking_choices(data)
    options = []
    for option in cities + areas:
        if option not in options:
            options.append(option)
    booking_base = str(data.get("bookingUrl", "")).split("?url=", 1)[0]
    booking_roots = list(soup.select(".hero-stay-booking, #stay-booking"))
    for root_index, root in enumerate(booking_roots):
        if not booking_base or not options or root.select_one(".hotel-search__areas"):
            continue
        root["data-hotel-search"] = ""
        root["data-booking-base"] = booking_base
        root["data-country"] = str(data.get("country") or "")
        for field, name in (("template-checkin", "checkin"), ("stay-checkin", "checkin"), ("template-checkout", "checkout"), ("stay-checkout", "checkout"), ("template-guests", "adults"), ("stay-guests", "adults"), ("template-rooms", "rooms"), ("stay-rooms", "rooms")):
            control = root.select_one(f"#{field}")
            if control:
                control["name"] = name
        # Use the established PROD booking controls: native radios styled as
        # the existing AREA pills, rather than a second booking UI.
        area_label = soup.new_tag("p", attrs={"class": "stay-field-label stay-area-label"})
        area_label.string = "HOST COUNTRY" if data.get("visitLocations") else "AREA"
        choices = soup.new_tag("div", attrs={"class": "stay-area-pills hotel-search__areas"})
        for option_index, option in enumerate(options):
            ident = f"booking-{root_index}-area-{option_index}"
            label = soup.new_tag("label", attrs={"class": "stay-area-pill hotel-search__area", "for": ident})
            radio = soup.new_tag("input", attrs={"type": "radio", "name": "hotel-area", "id": ident, "value": option})
            if option_index == 0:
                radio["checked"] = ""
            label.append(radio)
            text = soup.new_tag("span"); text.string = option; label.append(text)
            choices.append(label)
        # Branch on what the root actually contains, not its id -- a root
        # can carry id="stay-booking" *and* already have its own AREA picker
        # to replace (e.g. the merged hero-stay-booking panel), so id alone
        # is not a reliable signal for "no picker yet, insert after fields".
        old_area = root.select_one(".stay-area-label")
        old_pills = root.select_one(".stay-area-pills")
        if old_area or old_pills:
            if old_area:
                old_area.replace_with(area_label)
            if old_pills:
                old_pills.replace_with(choices)
            else:
                root.append(choices)
        else:
            fields = root.select_one(".event-stay-fields")
            if fields:
                fields.insert_after(area_label)
                area_label.insert_after(choices)
            else:
                root.append(area_label)
                root.append(choices)
        for cta in root.select(".stay-check-btn, .event-stay-cta"):
            cta["class"] = list(cta.get("class", [])) + ["hotel-search__go"]

    # Do not leave a Visit tab that contains only a heading.  Data-rich pages
    # retain all four planning sections; pages with only verified booking basics
    # retain Booking and hide unavailable travel advice.
    for section in list(soup.select(".event-stay-section")):
        has_content = bool(section.select("input, .event-stay-cta, .event-info-card"))
        if has_content:
            continue
        section_id = section.get("id")
        section.decompose()
        if section_id:
            for control in soup.select(f"label[for='{section_id.replace('stay-', 'stay-tab-')}'], input#{section_id.replace('stay-', 'stay-tab-')}"):
                control.decompose()
    for panel in list(soup.select("#panel-stay")):
        if panel.select_one(".event-stay-section"):
            continue
        panel.decompose()
        for control in soup.select("label[for='tab-stay'], #tab-stay"):
            control.decompose()

    # Do not leave an Upcoming tab unless real next-edition / entry content
    # survived template binding. Without this, completed events with no verified
    # next date show a blank "Upcoming" panel, which reads like missing data.
    for panel in list(soup.select("#panel-upcoming")):
        if panel.select_one(".event-info-card"):
            continue
        panel.decompose()
        for control in soup.select("label[for='tab-upcoming'], #tab-upcoming"):
            control.decompose()

    # 3) head tokens (title text, meta/link attrs) + structuredData
    head = soup.head
    if head is not None:
        for node in list(head.contents):              # lone {{structuredData}} text node
            if isinstance(node, NavigableString) and "{{structuredData}}" in node:
                script = soup.new_tag("script", type="application/ld+json")
                script.string = json.dumps(data.get("structuredData", {}), ensure_ascii=False)
                node.replace_with(script)
        for el in head.find_all(True):
            for a in list(el.attrs):
                val = el[a]
                if isinstance(val, str) and "{{" in val:
                    el[a] = TOKEN_RE.sub(lambda m: str(data.get(m.group(1), m.group(0))), val)
            for child in list(el.children):
                if isinstance(child, NavigableString) and "{{" in child:
                    child.replace_with(TOKEN_RE.sub(lambda m: str(data.get(m.group(1), m.group(0))), str(child)))

    # Site navigation must stay relative to the generated page.  That keeps
    # identical HTML valid in dev, QA and production without environment rewrites.
    current_dir = posixpath.dirname(site_rel(data["canonicalUrl"]))
    nav_targets = {
        "Home": "/index.html",
        "Events": "/content/events/index.html",
        "Locations": "/content/locations/index.html",
        "Categories": "/content/categories/index.html",
    }
    for el in soup.select(".top-menu a[href]"):
        label = el.get("aria-label") or el.get_text(" ", strip=True)
        target = nav_targets.get(label)
        if target:
            el["href"] = posixpath.relpath(target.lstrip("/"), current_dir.lstrip("/"))

    # Templates may be written as readable link labels, but the shared chrome is
    # icon-only.  Normalize it once in the transformer so every layout stays alike.
    nav_icons = {
        "Events": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
        "Locations": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
        "Categories": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>',
    }
    for el in soup.select(".top-menu .nav-icon"):
        label = el.get("aria-label") or el.get_text(" ", strip=True)
        markup = nav_icons.get(label)
        if markup and not el.find("svg"):
            el.clear()
            el.append(BeautifulSoup(markup, "html.parser").svg)

    # Resolve every remaining relative href/src/srcset from the generated page
    # directory. Templates contain readable relative paths, but the generated
    # event pages live at different taxonomy depths; keeping only nav links
    # relative leaves topic, country and asset links at the wrong depth.
    def _target_path(value):
        value = str(value or "")
        if not value or value.startswith(("#", "/", "http://", "https://", "mailto:", "tel:", "javascript:", "data:")):
            return value
        clean = value.split("#", 1)[0].split("?", 1)[0]
        suffix = re.match(r"^(?:\.\./)+((?:content|assets)/.*)$", clean)
        if suffix:
            return "/" + suffix.group(1)
        if clean.startswith(("content/", "assets/")):
            return "/" + clean
        return "/" + posixpath.normpath(posixpath.join(current_dir, clean)).lstrip("/")

    def _relative_target(value):
        target = _target_path(value)
        if not target.startswith("/"):
            return value
        return posixpath.relpath(target.lstrip("/"), current_dir.lstrip("/"))

    def _asset_target(value):
        """Keep content images rooted; resolve every /assets ref from page depth."""
        target = _target_path(value)
        if target.startswith("/content/"):
            return target
        return _relative_target(value)

    for el in soup.find_all(True):
        if el.has_attr("href"):
            if "os-brand" in (el.get("class") or []):
                el["href"] = _relative_target("/index.html")
            else:
                el["href"] = _relative_target(el["href"])
        for attr in ("src",):
            if el.has_attr(attr):
                el[attr] = _asset_target(el[attr])
        if el.has_attr("srcset"):
            parts = []
            for part in str(el["srcset"]).split(","):
                bits = part.strip().split()
                if bits:
                    bits[0] = _asset_target(bits[0]); parts.append(" ".join(bits))
            el["srcset"] = ", ".join(parts)

    # Persona Overview country references are canonical retention links, not
    # environment-relative navigation. Keep the required /content/locations
    # paths after the generic Dev/QA relativizer above.
    if isinstance(data.get("overview"), dict):
        countries = _country_map(data, data["overview"])
        for link in soup.select("a.country"):
            item = countries.get(link.get_text(" ", strip=True))
            if item: link["href"] = item["url"]
        for link in soup.select("a.event-chart__country"):
            label = link.select_one(".event-chart__rank-label")
            item = countries.get(label.get_text(" ", strip=True)) if label else None
            if item:
                link["href"] = item["url"]
                image = link.select_one(".event-chart__flag")
                if image: image["href"] = item["flag"]

    # A festival is the only music page type with a programme/line-up tab.
    # A single concert already has its performer in the title; showing an empty
    # Lineup tab there is both misleading and unusable.
    if data.get("layout") == "music" and not data.get("lineup"):
        for el in soup.select("#tab-lineup, label[for='tab-lineup'], #panel-lineup"):
            el.extract()

    # A three-place national-team result is rendered as a readable podium.
    # Keep the source result string intact in JSON while giving each country its
    # required flag and internal location link in the generated history table.
    result_rows = data.get("pastResults", [])
    table_rows = soup.select("#panel-past .event-table tbody tr")
    for tr, item in zip(table_rows, result_rows):
        result = str(item.get("result", ""))
        podium = re.findall(r"#(\d):\s*([^()]+?)\s*\(([^)]*)\)", result)
        if len(podium) < 2:
            continue
        resolved_podium = []
        for place, country, detail in podium:
            country = country.strip()
            base = _country_location_for(country)
            if not base:
                raise ValueError(f"pastResults podium-land saknar intern location-sida: {country}")
            resolved_podium.append((place, country, detail, base))
        cells = tr.find_all("td", recursive=False)
        if len(cells) < 4:
            continue
        # The #1 podium row is always the winner, so a separate Winner column
        # only repeats information.  Remove it for this structured podium view.
        table = tr.find_parent("table")
        headers = table.select("thead th") if table else []
        if len(headers) == 4:
            headers[1].extract()
        cells[1].extract()
        cells = tr.find_all("td", recursive=False)
        podium_list = soup.new_tag("ul", attrs={"class": "event-podium"})
        for place, country, detail, base in resolved_podium:
            row = soup.new_tag("li", attrs={"class": "event-podium__row"})
            rank = soup.new_tag("span", attrs={"class": "event-podium__place"}); rank.string = f"#{place}"; row.append(rank)
            link = soup.new_tag("a", href=f"/content/locations/{base}/index.html", attrs={"class": "country"})
            link.append(soup.new_tag("img", src=f"/content/locations/{base}/img/flag.svg", alt="", width="20", height="14"))
            label = soup.new_tag("span"); label.string = country; link.append(label); row.append(link)
            note = soup.new_tag("span", attrs={"class": "event-podium__detail"}); note.string = detail; row.append(note)
            podium_list.append(row)
        cells[1].clear(); cells[1].append(podium_list)

    return str(soup)

# ----------------------------------------------------------------------------- post-render gates
def link_resolves(u, produced):
    """An internal /link resolves if it is a page THIS build produces (canonical page or
    redirect stub) OR a real file already on disk. Anything else is a dead link / future 404."""
    u = u.split("#")[0].split("?")[0]
    if u in produced or u.rstrip("/") + "/" in produced or u.rstrip("/") + ".html" in produced:
        return True
    fp = os.path.join(ROOT, u.lstrip("/"))
    return (os.path.isfile(fp) or os.path.isfile(fp.rstrip("/") + ".html")
            or (os.path.isdir(fp) and os.path.isfile(os.path.join(fp, "index.html"))))

def gates(html, produced=frozenset()):
    errs = []
    # JSON-LD legitimately contains { } [ ] — blank its content before scanning for tokens/placeholders
    scan = re.sub(r'(<script type="application/ld\+json">).*?(</script>)', r"\1\2", html, flags=re.S)
    if TOKEN_RE.search(scan):        errs.append(f"kvarvarande token i output: {sorted(set(TOKEN_RE.findall(scan)))[:6]}")
    if "data-template-" in html:     errs.append("kvarvarande data-template-* attribut i output")
    if re.search(r">\s*\[[^\]]+\]\s*<", scan): errs.append("kvarvarande [platshållare] i output")
    for bad in ("TBC", "TBD", "at a glance"):
        if re.search(r"\b" + re.escape(bad) + r"\b", scan, re.I): errs.append(f"förbjuden text i output: '{bad}'")
    if "application/ld+json" not in html: errs.append("saknar JSON-LD script i output")
    broken = [m.group(1) for m in re.finditer(r'(?:href|src)="(/[^"]*)"', html)
              if not link_resolves(m.group(1), produced)]
    if broken:
        errs.append(f"{len(set(broken))} döda interna länkar (skulle ge 404): {sorted(set(broken))[:8]}")
    return errs

def seo_perf_gate():
    """Hard gate for event SEO/schema/image regressions in generated Dev output."""
    script = os.path.join(ROOT, "scripts", "tools", "audit-seo-perf.py")
    result = subprocess.run([sys.executable, script], cwd=ROOT, text=True, capture_output=True)
    output = (result.stdout or "") + (result.stderr or "")
    checks = [
        r"title:\s+0\s+icke-unika,\s+0\s+>",
        r"meta\s+:\s+0\s+icke-unika,\s+0\s+utanf",
        r"JSON-LD Event utan alla rek\.[^:]+:\s+0",
        r"översized \(intrinsic bredd > 2× visad\):\s+0|Ã¶versized \(intrinsic bredd > 2Ã— visad\):\s+0",
    ]
    missing_images = re.search(r"saknade bildfiler:\s+([1-9]\d*)", output)
    ok = result.returncode == 0 and not missing_images and all(re.search(pattern, output) for pattern in checks)
    if not ok:
        print("\n❌ SEO/PERF-GATE MISSLYCKADES — audit-seo-perf.py måste vara 0 på alla punkter:")
        print(output.strip())
        sys.exit(1)
    print("\n✅ SEO/PERF-GATE grön — title/meta 0, JSON-LD rek.fält 0, oversized 0, saknade bilder 0")

# ----------------------------------------------------------------------------- output paths + redirect stubs
def site_rel(url):
    return re.sub(r"^https?://[^/]+", "", url or "")

def dest_for(rel_path, env):
    base = os.path.join(ROOT, "Templates", "test") if env == "dev" else ROOT
    return os.path.join(base, rel_path.lstrip("/"))

def out_path(data, env):
    return dest_for(site_rel(data["canonicalUrl"]), env)   # content/categories/.../x.html

def redirect_stub(canonical_url, env):
    """A 200-redirect stub (HTTP 200 + canonical + meta refresh) — Google follows it and
    consolidates ranking to the canonical page. Matches the existing on-site stub format."""
    t = site_rel(canonical_url)
    if env == "dev":
        t = "/Templates/test" + t
    return ('<!doctype html>\n<html lang="en">\n<head>\n'
            '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            '<title>Moved</title>\n'
            f'<link rel="canonical" href="{t}">\n'
            f'<meta http-equiv="refresh" content="0; url={t}">\n'
            '<meta name="robots" content="index,follow">\n'
            f'</head>\n<body>\n<p>This page has moved to <a href="{t}">its canonical page</a>.</p>\n</body>\n</html>\n')

# ----------------------------------------------------------------------------- Dev event-index projection
def sync_dev_events_index():
    """Write the Dev index from canonical pipeline data, never from stale HTML."""
    data_files = sorted(glob.glob(os.path.join(ROOT, "data", "events", "**", "*.json"), recursive=True))
    items = [(path, json.load(open(path, encoding="utf-8"))) for path in data_files]
    entries = []
    for _, data in items:
        rel = site_rel(data.get("canonicalUrl", ""))
        match = re.fullmatch(r"/content/categories/([^/]+)/([^/]+)/events/([^/]+)\.html", rel)
        if not match:
            continue
        category, topic, slug = match.groups()
        structured = data.get("structuredData", {})
        graph = structured.get("@graph", structured)
        if isinstance(graph, dict): graph = [graph]
        event = next((item for item in graph if isinstance(item, dict) and item.get("startDate")), {})
        hero = str(data.get("heroImage", ""))
        image = hero
        if "-hero." in hero:
            base = hero.rsplit("-hero.", 1)[0]
            for candidate in (f"{base}-mini-400.webp", f"{base}-mini.png", f"{base}-mini.webp"):
                if os.path.isfile(os.path.join(ROOT, candidate.lstrip("/"))):
                    image = candidate; break
        # De-duplicate the location parts so a card never shows "United States —
        # United States" or "Across Spain — Spain": drop any part already present
        # in (or contained by) an earlier part, case-insensitively.
        _loc = []
        for v in (data.get("venue"), data.get("city"), data.get("country")):
            v = str(v or "").strip()
            if not v or any(v.casefold() == p.casefold() or v.casefold() in p.casefold() or p.casefold() in v.casefold() for p in _loc):
                continue
            _loc.append(v)
        location = " — ".join(_loc)
        entry = {
            "eventKey": f"{category}/{topic}/{slug}", "title": data.get("h1") or data.get("title"),
            "meta": " — ".join(v for v in (data.get("dates"), location) if v),
            "href": f"../categories/{category}/{topic}/events/{slug}.html", "image": image,
            "start": str(event.get("startDate", ""))[:10], "end": str(event.get("endDate", ""))[:10],
            "cat": "tech" if category == "technology" else category, "topic": topic, "slug": slug,
        }
        if data.get("reach") in {"global", "continental", "national", "regional", "local"}:
            entry["reach"] = data["reach"]
        country = re.fullmatch(r"/content/locations/([^/]+)/([^/]+)/index\.html", str(data.get("countryUrl", "")))
        if country: entry["cont"], entry["country"] = country.groups()
        entries.append({key: value for key, value in entry.items() if value not in (None, "")})
    entries.sort(key=lambda entry: (entry.get("start") or "9999-12-31", entry["title"].lower()))
    events_dir = os.path.join(ROOT, "Templates", "test", "content", "events")
    index_path = os.path.join(events_dir, "index.html")
    payload = json.dumps(entries, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
    index_html = open(index_path, encoding="utf-8").read()
    pattern = r'(<script type="application/json" id="events-data">)(\[[\s\S]*?\])(<\/script>)'
    if not re.search(pattern, index_html):
        raise RuntimeError("Dev events-index saknar events-data")
    # A replacement string would interpret backslashes contained in event data.
    # Use a function so the embedded JSON stays byte-for-byte valid JSON.
    updated_index = re.sub(pattern, lambda match: match.group(1) + payload + match.group(3), index_html, count=1)
    open(index_path, "w", encoding="utf-8").write(updated_index)
    open(os.path.join(events_dir, "dev-events.json"), "w", encoding="utf-8").write(payload + "\n")
    print(f"✅ Dev events-index synkad: {len(entries)} pipelineevent")

# ----------------------------------------------------------------------------- event content gate + main
def event_content_gate():
    """Run the Visit/booking contract before rendering any event output."""
    script = os.path.join(ROOT, "scripts", "tools", "audit-event-content.py")
    result = subprocess.run([sys.executable, script], cwd=ROOT, text=True,
                            capture_output=True)
    if result.returncode:
        print("\nEVENT-CONTENT-GATE FAILED - no output written:")
        print((result.stdout or "") + (result.stderr or ""))
        sys.exit(result.returncode)
    print(result.stdout.strip())

def image_budget_gate():
    """Fail event builds when any referenced image exceeds its role budget."""
    script = os.path.join(ROOT, "scripts", "tools", "audit-image-budget.py")
    result = subprocess.run([sys.executable, script], cwd=ROOT, text=True,
                            capture_output=True)
    print((result.stdout or "").strip())
    if result.returncode:
        print((result.stderr or "").strip())
        sys.exit(result.returncode)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--file"); ap.add_argument("--scope"); ap.add_argument("--all", action="store_true")
    ap.add_argument("--env", choices=["dev", "qa", "prod"], default="dev")
    a = ap.parse_args()

    # Global hard gate: --file cannot bypass missing Visit/booking data elsewhere.
    event_content_gate()

    if a.file:      targets = [a.file]
    elif a.scope:   targets = sorted(glob.glob(a.scope, recursive=True))
    elif a.all:     targets = sorted(glob.glob(os.path.join(ROOT, "data", "events", "**", "*.json"), recursive=True))
    else:           ap.error("ange --file, --scope eller --all")
    if not targets: ap.error("inga datafiler matchade")

    models = load_models()
    items = [(f, json.load(open(f, encoding="utf-8"))) for f in targets]

    # cross-file canonical guard — the SCRIPT owns URL uniqueness, not the data authors.
    canon, redirs, conflicts = {}, {}, []
    for f, d in items:
        c = site_rel(d.get("canonicalUrl", ""))
        if c and c in canon:
            conflicts.append(f"två datafiler delar canonicalUrl {c}: "
                             f"{os.path.relpath(canon[c],ROOT)} & {os.path.relpath(f,ROOT)}")
        elif c:
            canon[c] = f
    for f, d in items:
        for old in d.get("redirectsFrom", []):
            o = site_rel(old)
            if o in canon:
                conflicts.append(f"redirectsFrom {o} (i {os.path.relpath(f,ROOT)}) krockar med en riktig kanonisk sida")
            if o in redirs and redirs[o] != f:
                conflicts.append(f"redirectsFrom {o} anges av två filer")
            redirs[o] = f
    # same event under several URLs: identical slug OR identical h1 across files = duplicate content.
    for key, kind in (("__slug__", "event-slug"), ("h1", "h1")):
        seen = {}
        for f, d in items:
            v = (os.path.basename(f)[:-5] if key == "__slug__" else str(d.get("h1", "")).strip().lower())
            if v:
                seen.setdefault(v, []).append(f)
        for v, fs in seen.items():
            if len(fs) > 1:
                conflicts.append(f"samma {kind} '{v}' i {len(fs)} datafiler (dubblett-content) — välj EN kanonisk, "
                                 f"ta bort övriga och lägg deras URL i redirectsFrom: "
                                 f"{[os.path.relpath(x,ROOT).replace(chr(92),'/') for x in fs]}")
    # boilerplate detection via shared word 4-grams (catches PARAPHRASED templates, not just verbatim).
    def _shingles(t, k=4):
        w = re.findall(r"[a-z0-9]+", (t or "").lower())
        return {tuple(w[i:i + k]) for i in range(len(w) - k + 1)}
    ov = {f: _shingles(d.get("overview", {}).get("about", "") if isinstance(d.get("overview"), dict) else d.get("overview", "")) for f, d in items}
    df = {}
    for s in ov.values():
        for g in s:
            df[g] = df.get(g, 0) + 1
    hot = {g for g, c in df.items() if c > 8}           # a 4-gram in >8 overviews = shared template
    # Annual roll-forward records are generated from event-specific venue/city/date
    # fields and carry an audit marker; do not mistake that compact canonical form
    # for the register-dump boilerplate this gate is intended to catch.
    recurring_files = {
        f for f, d in items
        if any(isinstance(src, dict) and src.get("supportsAnnualRecurrence") is True
               for src in d.get("sources", []))
    }
    boiler = sorted(((len(s & hot), f) for f, s in ov.items()
                     if f not in recurring_files and len(s & hot) >= 3), reverse=True)
    for hits, f in boiler[:15]:
        conflicts.append(f"mall-/boilerplate-overview ({hits} delade 4-gram med andra event, skriv event-specifikt): "
                         f"{os.path.relpath(f,ROOT).replace(chr(92),'/')}")
    if len(boiler) > 15:
        conflicts.append(f"…och {len(boiler)-15} fler mall-overviews — TOTALT {len(boiler)} av {len(items)} "
                         f"overviews delar mall-formuleringar och måste skrivas om event-specifikt")
    if conflicts:
        print("\n❌ CANONICAL-KONFLIKT — inget skrevs:")
        for c in conflicts: print(f"   • {c}")
        sys.exit(1)

    for f, data in items:
        rel = os.path.relpath(f, ROOT).replace("\\", "/")

        errs = validate(data, models)
        if errs:
            print(f"\n❌ VALIDERING MISSLYCKADES — {rel}\n   layout: {data.get('layout')}")
            for e in errs: print(f"   • {e}")
            print("\nStoppar. Ingen sida skrevs. Rätta datan och kör igen.")
            sys.exit(1)

        html = render(data, open(os.path.join(TPL_DIR, data["layout"] + ".html"), encoding="utf-8").read(), a.env)

        gerrs = gates(html)
        if gerrs:
            print(f"\n❌ RENDER-GATE MISSLYCKADES — {rel}")
            for e in gerrs: print(f"   • {e}")
            print("\nStoppar. Ingen sida skrevs.")
            sys.exit(1)

        dest = out_path(data, a.env)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        open(dest, "w", encoding="utf-8").write(html)
        print(f"✅ {data['layout']:14} {os.path.relpath(dest, ROOT).replace(chr(92),'/'):70} {len(html):>7} bytes")

        # auto-generate 200-redirect stubs for any old/duplicate URLs the data declares
        for old in data.get("redirectsFrom", []):
            sdest = dest_for(site_rel(old), a.env)
            os.makedirs(os.path.dirname(sdest), exist_ok=True)
            open(sdest, "w", encoding="utf-8").write(redirect_stub(data["canonicalUrl"], a.env))
            print(f"   ↪ redirect-stub {site_rel(old):66} → {site_rel(data['canonicalUrl'])}")

    if a.env == "dev":
        # The index is a projection of the whole pipeline, even after --file builds.
        sync_dev_events_index()
    if a.all and a.env == "dev":
        seo_perf_gate()
        image_budget_gate()

if __name__ == "__main__":
    main()
