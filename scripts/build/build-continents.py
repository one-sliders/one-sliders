#!/usr/bin/env python3
"""
build_continent_page.py -- template + data model for CONTINENT pages.

DO NOT USE THIS SCRIPT TO GENERATE COUNTRY PAGES.
Country pages are owned by scripts/build_country_page.py. This script may link
to countries from continent indexes, but must not stamp out country or UK nation
HTML pages.

POC target:
  python scripts/build_continent_page.py europe

The script mirrors the country/city generator model: one layout here, static
HTML output, existing location assets preserved.
"""

import glob
import json
import os
import sys
from datetime import date
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOMAIN = "https://one-sliders.com"
TODAY = date(2026, 6, 15)

COUNTRY_CHIP_IMAGE_OVERRIDES = {
    "europe": {
        "faroe-islands": "faroe-islands/img/torshavn-mini",
    }
}

_BIG_MAC_BY_SLUG = None

_BIG_MAC_SLUG_ALIASES = {
    "czechia": "czech-republic",
    "united-arab-emirates": "uae",
    "united-kingdom": "uk",
}

CONTINENTS = {
    "europe": {
        "name": "Europe",
        "title": "Europe travel, countries and events",
        "description": "Explore Europe by country groups, key facts, linked countries, cities and upcoming events.",
        "heroText": "Europe turns one long-haul trip into many different worlds: Roman streets, Nordic coastlines, Alpine rail routes, island summers, old capitals and food cultures that change every few hours by train. For travelers coming from far away, the real sell is density: short hops, deep history, strong public transport and a continent where one itinerary can feel like five separate journeys.",
        "kpis": [
            ("Countries / areas", "53"),
            ("Population", "744M"),
            ("Area", "10.4M km2"),
            ("Region groups", "5"),
        ],
        "overview": [
            ("Area", "10.4 million km2"),
            ("Population", "744 million"),
            ("Population ranking", "#3"),
            ("Share of world population", "9.0%"),
            ("Listed countries / areas", "53"),
            ("Largest country", "Russia"),
            ("Smallest country", "Vatican City"),
            ("Time zones", "UTC -1 to +5"),
        ],
        "identity": [
            "Dense capital network",
            "Rail corridors",
            "Mediterranean islands",
            "Nordic light",
            "Alpine routes",
            "Old city cores",
            "Festival calendar",
            "Short border hops",
        ],
        "history": [
            ("Ancient", "Greek, Roman, Celtic, Nordic, Slavic and other cultures shaped early European routes and cities."),
            ("Middle Ages", "Kingdoms, city-states, trade leagues and religious centers formed the map visitors still recognize."),
            ("1800s", "Industrial rail, ports and national movements tied cities and regions into modern travel corridors."),
            ("1900s", "Wars, borders, reconstruction and European cooperation reshaped the continent's institutions."),
            ("Today", "Europe is easiest to understand as connected regions: flights, trains, ferries and short cross-border stays."),
        ],
        "routes": [
            ("North", "Nordic capitals, fjords, Baltic cities, islands and winter routes."),
            ("West", "Atlantic cities, Benelux density, French routes and British-Irish city breaks."),
            ("Central", "Alpine passes, Danube cities, German-speaking hubs and Central European capitals."),
            ("East", "Baltic, Slavic, Black Sea and Caucasus routes with larger distances."),
            ("South", "Iberia, Italy, the Balkans, Greece, islands and Mediterranean coastlines."),
        ],
        "groups": [
            {
                "title": "Northern & Western Europe",
                "text": "Northern, Atlantic, Baltic and dense western city routes.",
                "subgroups": [
                    {
                        "title": "Nordic countries",
                        "countries": ["finland", "iceland", "faroe-islands"],
                        "subgroups": [
                            ("Scandinavia", ["denmark", "norway", "sweden"]),
                        ],
                    },
                    ("Baltic states", ["estonia", "latvia", "lithuania"]),
                    {
                        "title": "Western Europe",
                        "countries": ["france", "monaco"],
                        "subgroups": [
                            ("Benelux", ["belgium", "luxembourg", "netherlands"]),
                        ],
                    },
                    {
                        "title": "British & Irish Isles",
                        "countries": ["ireland"],
                        "subgroups": [
                            ("United Kingdom", ["england", "scotland", "wales"]),
                        ],
                    },
                ],
            },
            {
                "title": "Central & Eastern Europe",
                "text": "Alpine, Danube, Baltic-border and large eastern routes.",
                "subgroups": [
                    ("German-speaking Europe", ["austria", "germany", "liechtenstein", "switzerland"]),
                    ("Central Europe", ["czechia", "hungary", "poland", "slovakia"]),
                    ("Eastern Europe", ["belarus", "moldova", "russia", "ukraine"]),
                    ("Caucasus", ["armenia", "azerbaijan", "georgia"]),
                ],
            },
            {
                "title": "Southern & Southeastern Europe",
                "text": "Iberian, Mediterranean and Balkan routes across southern Europe.",
                "subgroups": [
                    ("Iberian Peninsula", ["andorra", "portugal", "spain"]),
                    ("Italian Peninsula", ["italy", "san-marino", "vatican-city"]),
                    ("Mediterranean Europe", ["cyprus", "greece", "malta", "turkey"]),
                    {
                        "title": "Balkans",
                        "countries": ["croatia", "slovenia"],
                        "subgroups": [
                            ("Western Balkans", ["albania", "bosnia-and-herzegovina", "kosovo", "montenegro", "north-macedonia", "serbia"]),
                            ("Eastern Balkans", ["bulgaria", "romania"]),
                        ],
                    },
                ],
            },
        ],
    }
}

CONTINENT_COPY = {
    "africa": {
        "name": "Africa",
        "best": "Wildlife, cities, coast",
        "hero": "Saharan routes, Atlantic and Indian Ocean coasts, rainforest cities, highlands and southern road trips. Africa is easiest to browse through regional country groups.",
        "identity": ["Sahara routes", "Wildlife corridors", "Indian Ocean islands", "Atlantic coast", "Great Lakes", "Highland capitals", "Festival cities", "Long-distance routes"],
        "routes": [
            ("North", "Mediterranean cities, Sahara edges and Red Sea routes."),
            ("West", "Atlantic capitals, Sahel routes, coastal food and music cities."),
            ("Central", "Rainforest, Congo basin routes and Gulf of Guinea links."),
            ("East", "Great Lakes, highlands, safari circuits and Indian Ocean access."),
            ("South", "Southern road trips, wine regions, deserts and coastal cities."),
        ],
    },
    "asia": {
        "name": "Asia",
        "best": "Megacities, food, temples",
        "hero": "Mega-cities, mountain corridors, island chains, desert routes and old trade paths. Asia is easiest to browse through east, south, southeast, central and western routes.",
        "identity": ["Megacity hubs", "Island chains", "Mountain routes", "Food capitals", "Temple circuits", "Desert corridors", "High-speed rail", "Old trade paths"],
        "routes": [
            ("East", "Dense city routes, rail corridors and island capitals."),
            ("South", "Himalayan edges, Indian Ocean routes and large cultural circuits."),
            ("Southeast", "Tropical islands, river capitals and short regional flights."),
            ("Central", "Steppe, Silk Road cities and mountain crossings."),
            ("West", "Gulf hubs, Levant routes and desert city breaks."),
        ],
    },
    "north-america": {
        "name": "North America",
        "best": "Road trips, islands, cities",
        "hero": "Big road trips, Arctic edges, Caribbean islands, national parks and city breaks. North America is easiest to browse through mainland, Central American and island routes.",
        "identity": ["Road trips", "National parks", "Caribbean islands", "Arctic edges", "Music cities", "Beach routes", "Big sports", "Food regions"],
        "routes": [
            ("Northern", "Canada, Greenland and large-distance nature routes."),
            ("Mainland", "United States and Mexico city, coast and road-trip corridors."),
            ("Central", "Compact land routes between Pacific and Caribbean coasts."),
            ("Caribbean", "Island capitals, beaches, festivals and short-hop flights."),
        ],
    },
    "south-america": {
        "name": "South America",
        "best": "Andes, Amazon, cities",
        "hero": "Andean routes, Amazon gateways, Atlantic beaches, wine regions and football cities. South America is easiest to browse through western, northern and southern routes.",
        "identity": ["Andes routes", "Amazon gateways", "Atlantic beaches", "Wine regions", "Football cities", "Rainforest travel", "Patagonia", "Colonial cores"],
        "routes": [
            ("Andes", "Highland capitals, mountain routes and Pacific access."),
            ("Amazon & north", "Rainforest gateways, Caribbean-facing coasts and river routes."),
            ("Atlantic", "Brazilian city, beach and festival routes."),
            ("Southern Cone", "Wine, Patagonia, plains and southern capitals."),
        ],
    },
    "oceania": {
        "name": "Oceania",
        "best": "Islands, reefs, road trips",
        "hero": "Pacific islands, reef routes, long coastlines and southern hemisphere city breaks. Oceania is easiest to browse through Australia, New Zealand and island subregions.",
        "identity": ["Pacific islands", "Reef routes", "Long coastlines", "Volcanic islands", "Outdoor cities", "Ferry hops", "Lagoon travel", "Southern seasons"],
        "routes": [
            ("Australasia", "Australia and New Zealand city, coast and nature routes."),
            ("Melanesia", "Larger island routes and reef access."),
            ("Micronesia", "Small island states and lagoon routes."),
            ("Polynesia", "Pacific island chains, culture and beach routes."),
        ],
    },
    "antarctica": {
        "name": "Antarctica",
        "best": "Expeditions, ice, wildlife",
        "hero": "Ice shelves, research stations, expedition cruises and polar wildlife. Antarctica is browsed by expedition routes rather than countries.",
        "kpis": [
            ("Countries / areas", "0"),
            ("Population", "0"),
            ("Area", "14.2M km2"),
        ],
        "overview": [
            ("Area", "14.2 million km2"),
            ("Permanent population", "0"),
            ("Seasonal population", "1,000-5,000"),
            ("Listed countries / areas", "No countries"),
            ("Country groups", "0"),
            ("Time zones", "Station-dependent"),
        ],
        "identity": ["Ice shelves", "Research stations", "Penguin colonies", "Polar cruises", "Extreme seasons", "Scientific routes", "Protected wilderness", "Remote travel"],
        "history": [
            ("Exploration", "Antarctica is shaped by polar exploration routes, research stations and protected wilderness rather than permanent cities."),
            ("Research", "Scientific programs, logistics hubs and seasonal station crews define most human activity on the continent."),
            ("Today", "Visitor travel is concentrated around expedition routes, strict environmental rules and short polar-season windows."),
        ],
        "routes": [
            ("Peninsula", "Most visitor routes approach the Antarctic Peninsula by expedition ship."),
            ("Ross Sea", "Longer expedition routes with historic exploration sites."),
            ("Interior", "Research, logistics and specialist expedition routes."),
        ],
    },
}

CONTINENT_GROUPS = {
    "africa": [
        ("Northern Africa", ["algeria", "egypt", "libya", "morocco", "sudan", "tunisia"]),
        ("Western Africa", ["benin", "burkina-faso", "cabo-verde", "gambia", "ghana", "guinea", "guinea-bissau", "ivory-coast", "liberia", "mali", "mauritania", "niger", "nigeria", "senegal", "sierra-leone", "togo"]),
        ("Central Africa", ["angola", "cameroon", "central-african-republic", "chad", "democratic-republic-of-the-congo", "equatorial-guinea", "gabon", "republic-of-the-congo", "sao-tome-and-principe"]),
        ("Eastern Africa", ["burundi", "comoros", "djibouti", "eritrea", "ethiopia", "kenya", "madagascar", "malawi", "mauritius", "mozambique", "rwanda", "seychelles", "somalia", "south-sudan", "tanzania", "uganda", "zambia", "zimbabwe"]),
        ("Southern Africa", ["botswana", "eswatini", "lesotho", "namibia", "south-africa"]),
    ],
    "asia": [
        ("East Asia", ["china", "japan", "mongolia", "north-korea", "south-korea", "taiwan"]),
        ("Southeast Asia", ["brunei", "cambodia", "indonesia", "laos", "malaysia", "myanmar", "philippines", "singapore", "thailand", "timor-leste", "vietnam"]),
        ("South Asia", ["afghanistan", "bangladesh", "bhutan", "india", "maldives", "nepal", "pakistan", "sri-lanka"]),
        ("Central Asia", ["kazakhstan", "kyrgyzstan", "tajikistan", "turkmenistan", "uzbekistan"]),
        ("Western Asia", ["bahrain", "iran", "iraq", "israel", "jordan", "kuwait", "lebanon", "oman", "palestine", "qatar", "saudi-arabia", "syria", "united-arab-emirates", "yemen"]),
    ],
    "north-america": [
        ("Northern North America", ["canada", "greenland", "usa"]),
        ("Mexico & Central America", ["belize", "costa-rica", "el-salvador", "guatemala", "honduras", "mexico", "nicaragua", "panama"]),
        ("Caribbean Islands", ["antigua-and-barbuda", "bahamas", "barbados", "cuba", "dominica", "dominican-republic", "grenada", "haiti", "jamaica", "saint-kitts-and-nevis", "saint-lucia", "saint-vincent-and-the-grenadines", "trinidad-and-tobago"]),
    ],
    "south-america": [
        ("Andean South America", ["bolivia", "chile", "colombia", "ecuador", "peru", "venezuela"]),
        ("Atlantic South America", ["brazil", "guyana", "suriname", "uruguay"]),
        ("Southern Cone", ["argentina", "paraguay"]),
    ],
    "oceania": [
        ("Australasia", ["australia", "new-zealand"]),
        ("Melanesia", ["fiji", "papua-new-guinea", "solomon-islands", "vanuatu"]),
        ("Micronesia", ["kiribati", "marshall-islands", "micronesia", "nauru", "palau"]),
        ("Polynesia", ["samoa", "tonga", "tuvalu"]),
    ],
    "antarctica": [
        ("Expedition Areas", []),
    ],
}

CONTINENT_ORDER = ["africa", "antarctica", "asia", "europe", "north-america", "oceania", "south-america"]

def esc(value):
    return (
        str(value)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def asset_exists(path):
    if not path:
        return False
    return os.path.isfile(os.path.join(ROOT, path.lstrip("/")))


def load_countries(continent):
    countries = {}
    pattern = os.path.join(ROOT, "content", "locations", continent, "*", "*.data.json")
    for path in sorted(glob.glob(pattern)):
        if path.endswith(".city.data.json"):
            continue
        try:
            data = json.load(open(path, encoding="utf-8"))
        except Exception:
            continue
        slug = data.get("slug") or os.path.basename(os.path.dirname(path))
        countries[slug] = data
    return countries


def load_big_mac_data():
    global _BIG_MAC_BY_SLUG
    if _BIG_MAC_BY_SLUG is not None:
        return _BIG_MAC_BY_SLUG
    path = os.path.join(ROOT, "scripts", "data", "bigmacindex-countries.json")
    _BIG_MAC_BY_SLUG = {}
    if os.path.isfile(path):
        payload = json.load(open(path, encoding="utf-8"))
        for country in payload.get("countries", []):
            slug = country.get("slug")
            if slug:
                _BIG_MAC_BY_SLUG[slug] = country
    return _BIG_MAC_BY_SLUG


def big_mac_kpi_value(slug):
    data = load_big_mac_data().get(_BIG_MAC_SLUG_ALIASES.get(slug, slug))
    if not data:
        return ""
    diff = data.get("diff_percent")
    if not isinstance(diff, (int, float)):
        return ""
    if abs(diff) < 0.05:
        return "0.0%"
    return f"{diff:+.1f}%"


def big_mac_numeric_value(slug):
    data = load_big_mac_data().get(_BIG_MAC_SLUG_ALIASES.get(slug, slug))
    if not data:
        return None
    diff = data.get("diff_percent")
    return diff if isinstance(diff, (int, float)) else None


def numeric_value(value):
    text = str(value or "").strip().replace(",", "")
    if not text:
        return -1
    multiplier = 1
    suffix = text[-1:].lower()
    if suffix == "k":
        multiplier = 1_000
        text = text[:-1]
    elif suffix == "m":
        multiplier = 1_000_000
        text = text[:-1]
    elif suffix == "b":
        multiplier = 1_000_000_000
        text = text[:-1]
    text = text.replace("km2", "").strip()
    try:
        return round(float(text) * multiplier)
    except ValueError:
        return -1


def big_mac_meter(value):
    if value is None:
        return ""
    width = min(abs(value), 60) / 60 * 50
    side = "positive" if value > 0 else "negative" if value < 0 else "zero"
    return (
        f'<span class="continent-bigmac-meter continent-bigmac-meter--{side}" '
        f'style="--bigmac-width:{width:.1f}%"><i></i></span>'
    )


def format_count(value, singular, plural=None):
    plural = plural or f"{singular}s"
    return f"{value} {singular if value == 1 else plural}"


def continent_meta(continent, countries):
    if continent in CONTINENTS:
        return CONTINENTS[continent]
    copy = CONTINENT_COPY[continent]
    country_count = len(countries)
    listed = format_count(country_count, "country", "countries") if country_count else "No countries"
    groups = [
        {
            "title": title,
            "text": f"{title} country links and travel entry points.",
            "countries": slugs,
            "subgroups": [],
        }
        for title, slugs in CONTINENT_GROUPS.get(continent, [])
    ]
    group_count = len([group for group in groups if group["subgroups"]])
    kpis = copy.get("kpis") or [
        ("Countries / areas", str(country_count)),
        ("Population", "See country pages"),
        ("Area", "See country pages"),
    ]
    if group_count and "kpis" not in copy:
        kpis.append(("Region groups", str(group_count)))
    overview = copy.get("overview") or [
        ("Listed countries / areas", listed),
        ("Country groups", str(group_count)),
        ("Largest country", "See country pages"),
        ("Time zones", "See country pages"),
    ]
    history = copy.get("history") or [
        ("Early routes", f"{copy['name']} has long-running regional routes, ports, inland corridors and cultural centers."),
        ("Modern travel", "Air links, city hubs and regional gateways shape how visitors move today."),
        ("Today", f"{copy['name']} is easier to browse as practical country groups rather than one long alphabetical list."),
    ]
    return {
        "name": copy["name"],
        "title": f"{copy['name']} travel, countries and events",
        "description": f"Explore {copy['name']} by country groups, key facts, linked countries, cities and upcoming events.",
        "heroText": copy["hero"],
        "kpis": kpis,
        "overview": overview,
        "identity": copy["identity"],
        "history": history,
        "routes": copy["routes"],
        "groups": groups,
    }


def img_srcset(base, widths=(200, 400), sizes="(max-width:620px) 220px, 400px"):
    parts = []
    for width in widths:
        candidate = f"{base}-{width}.webp"
        if asset_exists(candidate):
            parts.append(f"{candidate} {width}w")
    return f' srcset="{", ".join(parts)}" sizes="{esc(sizes)}"' if parts else ""


def country_chip(continent, countries, slug):
    data = countries.get(slug, {})
    name = data.get("name") or slug.replace("-", " ").title()
    href = f"{slug}/index.html"
    mini_base = COUNTRY_CHIP_IMAGE_OVERRIDES.get(continent, {}).get(slug) or f"{slug}/img/{slug}-mini"
    mini_abs_base = f"/content/locations/{continent}/{mini_base}"
    mini = f"{mini_base}.png" if asset_exists(f"/content/locations/{continent}/{mini_base}.png") else f"{mini_base}.jpg"
    flag = f"{slug}/img/flag.svg"
    return (
        f'<a class="country-chip country-chip--with-hero" href="{href}">'
        f'<span class="country-chip__hero" aria-hidden="true"><img src="{mini}"{img_srcset(mini_abs_base)} alt="{esc(name)} thumbnail" width="400" height="300" loading="lazy"></span>'
        f'<span class="country-chip__label"><img class="country-chip__flag" src="{flag}" alt="" width="24" height="18" loading="lazy"><span class="country-chip__name">{esc(name)}</span></span>'
        f"</a>"
    )


def area_chip(name, href, flag):
    return (
        f'<a class="country-chip country-chip--area" href="{href}" data-country-card-skip>'
        f'<span class="country-chip__label"><img class="country-chip__flag" src="{flag}" alt="" width="24" height="18" loading="lazy">'
        f'<span class="country-chip__name">{esc(name)}</span></span></a>'
    )


def normalize_subgroup(item):
    if isinstance(item, dict):
        return item
    title, slugs = item
    return {"title": title, "countries": slugs, "subgroups": []}


def render_subgroup(continent, countries, item):
    subgroup = normalize_subgroup(item)
    chips = []
    count = 0
    for slug in subgroup.get("countries", []):
        if slug in countries and asset_exists(f"/content/locations/{continent}/{slug}/img/flag.svg"):
            chips.append(country_chip(continent, countries, slug))
            count += 1

    for name, href, flag in subgroup.get("areas", []):
        if asset_exists(f"/content/locations/{continent}/{flag}"):
            chips.append(area_chip(name, href, flag))
            count += 1

    nested = []
    for child in subgroup.get("subgroups", []):
        html, child_count, _ = render_subgroup(continent, countries, child)
        if html:
            nested.append(html)
            count += child_count

    if not chips and not nested:
        return "", 0, False

    nested_html = (
        f'<div class="continent-subgroups continent-subgroups--nested">{"".join(nested)}</div>'
        if nested
        else ""
    )
    chips_html = f'<div class="country-chip-row">{"".join(chips)}</div>' if chips else ""
    modifier = " continent-subgroup--wide" if len(nested) > 1 else ""
    return (
        f'<div class="continent-subgroup{modifier}"><strong>{esc(subgroup["title"])}</strong>'
        f'{chips_html}{nested_html}</div>',
        count,
        len(nested) > 1,
    )


def render_group(continent, countries, group):
    direct_chips = []
    subgroups = []
    count = 0
    for slug in group.get("countries", []):
        if slug in countries and asset_exists(f"/content/locations/{continent}/{slug}/img/flag.svg"):
            direct_chips.append(country_chip(continent, countries, slug))
            count += 1

    for item in group["subgroups"]:
        html, item_count, is_wide = render_subgroup(continent, countries, item)
        if html:
            subgroups.append((html, item_count, is_wide))
            count += item_count

    if direct_chips:
        columns = f'<div class="continent-subgroups continent-subgroups--direct"><div class="country-chip-row">{"".join(direct_chips)}</div></div>'
    else:
        stacks = [[], [], []]
        stack_weights = [0, 0, 0]
        wide_subgroups = []
        for html, item_count, is_wide in subgroups:
            if is_wide:
                wide_subgroups.append(html)
                continue
            index = min(range(len(stacks)), key=lambda i: stack_weights[i])
            stacks[index].append(html)
            stack_weights[index] += max(1, item_count)
        stack_html = "".join(
            f'<div class="continent-subgroup-stack">{"".join(stack)}</div>'
            for stack in stacks
            if stack
        )
        wide_html = "".join(
            f'<div class="continent-subgroup-stack continent-subgroup-stack--wide">{html}</div>'
            for html in wide_subgroups
        )
        columns = (
            f'<div class="continent-subgroups continent-subgroups--columns">'
            f'{stack_html}{wide_html}'
            f'</div>'
        )

    return (
        f'<section class="continent-group-panel">'
        f'<h3>{esc(group["title"])} <span>{count}</span></h3>'
        f'<p>{esc(group["text"])}</p>'
        f'{columns}'
        f"</section>"
    )


def collect_country_groups(groups):
    paths = {}

    def walk_item(item, parents):
        subgroup = normalize_subgroup(item)
        path = parents + [subgroup["title"]]
        for slug in subgroup.get("countries", []):
            paths.setdefault(slug, path)
        for child in subgroup.get("subgroups", []):
            walk_item(child, path)

    for group in groups:
        base = [group["title"]]
        for slug in group.get("countries", []):
            paths.setdefault(slug, base)
        for item in group.get("subgroups", []):
            walk_item(item, base)
    return paths


def short_fact(data, label):
    for fact in data.get("shortFacts", []):
        if str(fact.get("label", "")).lower() == label.lower():
            return fact.get("value", "")
    return ""


def render_country_table(continent, countries, groups):
    group_paths = collect_country_groups(groups)
    filter_labels = []
    for group in groups:
        if group.get("title") and group["title"] not in filter_labels:
            filter_labels.append(group["title"])
    rows = []
    for slug, data in countries.items():
        if group_paths and slug not in group_paths:
            continue
        name = data.get("name") or slug.replace("-", " ").title()
        kpis = data.get("kpis", {})
        group_path = group_paths.get(slug)
        if group_path:
            group_label = " / ".join(group_path)
            group_sort = " / ".join(group_path).lower()
            filter_key = group_path[0]
        else:
            region = short_fact(data, "Region")
            group_label = region or ""
            group_sort = group_label.lower()
            filter_key = group_label
        population = kpis.get("population", "")
        area = kpis.get("area", "")
        big_mac = big_mac_kpi_value(slug)
        population_sort = numeric_value(population)
        area_sort = numeric_value(area)
        big_mac_sort = big_mac_numeric_value(slug)
        flag = f"{slug}/img/flag.svg"
        flag_img = (
            f'<img class="continent-country-table__flag" src="{flag}" alt="" width="24" height="18" loading="lazy">'
            if asset_exists(f"/content/locations/{continent}/{flag}")
            else ""
        )
        rows.append({
            "sort": (group_sort, name.lower()),
            "html": (
                f'<tr data-country-row data-group="{esc(filter_key)}" data-country="{esc(name.lower())}">'
                f'<th scope="row"><a class="continent-country-link" href="{slug}/index.html">{flag_img}<span>{esc(name)}</span></a></th>'
                f'<td>{esc(group_label)}</td>'
                f'<td class="number continent-metric-cell" data-sort="{population_sort}"><span>{esc(population)}</span></td>'
                f'<td class="number continent-metric-cell" data-sort="{area_sort}"><span>{esc(area)}</span></td>'
                f'<td class="number continent-bigmac-cell" data-sort="{big_mac_sort if big_mac_sort is not None else -9999}"><span>{esc(big_mac)}</span>{big_mac_meter(big_mac_sort)}</td>'
                f'</tr>'
            ),
        })
    rows.sort(key=lambda row: row["sort"])
    body = "".join(row["html"] for row in rows)
    filters = "".join(
        f'<button type="button" aria-pressed="false" data-continent-filter="{esc(label)}">{esc(label)}</button>'
        for label in filter_labels
    )
    return (
        f'<div class="continent-country-tools" data-continent-table-tools>'
        f'<button type="button" class="is-active" aria-pressed="true" data-continent-filter="all">All</button>{filters}'
        f'</div>'
        f'<div class="continent-country-table-wrap">'
        f'<table class="continent-country-table" data-continent-country-table>'
        f'<thead><tr>'
        f'<th><button type="button" data-sort-key="country">Country</button></th>'
        f'<th><button type="button" data-sort-key="group">Group</button></th>'
        f'<th><button type="button" data-sort-key="population" data-sort-type="number">Population</button></th>'
        f'<th><button type="button" data-sort-key="area" data-sort-type="number">Area</button></th>'
        f'<th><button type="button" data-sort-key="bigmac" data-sort-type="number">Big Mac Index</button></th>'
        f'</tr></thead>'
        f'<tbody>{body}</tbody>'
        f'</table>'
        f'</div>'
    )


def parse_day(value):
    try:
        return date.fromisoformat(str(value or "")[:10])
    except ValueError:
        return None


def normalize_site_path(value):
    value = str(value or "")
    if value.startswith("../../../"):
        return "/content/" + value[len("../../../"):]
    if value.startswith("../../"):
        return "/content/" + value[len("../../"):]
    return value


def normalize_event_index_path(value):
    value = str(value or "")
    if value.startswith("../"):
        return "/content/" + value[len("../"):]
    return normalize_site_path(value)


def event_country_slug(event, countries):
    country_slug = event.get("country") or ""
    meta = event.get("meta") or ""
    location = meta.split(" - ", 1)[1] if " - " in meta else meta
    location_parts = [part.strip().lower() for part in location.split(",") if part.strip()]
    name_to_slug = {
        (data.get("name") or slug.replace("-", " ").title()).lower(): slug
        for slug, data in countries.items()
    }
    for part in location_parts:
        slug = name_to_slug.get(part)
        if slug == "united-kingdom":
            continue
        if slug:
            return slug
    if country_slug == "united-kingdom":
        return ""
    return country_slug if country_slug in countries else ""


def local_site_exists(value):
    value = normalize_site_path(value).split("?", 1)[0].split("#", 1)[0]
    if not value or value.startswith(("http://", "https://", "mailto:")):
        return True
    if value.startswith("/"):
        return asset_exists(value)
    return False


def collect_events(countries, limit=8):
    events = []
    seen = set()
    for data in countries.values():
        for event in data.get("events", []):
            key = event.get("href") or event.get("title")
            if not key or key in seen:
                continue
            if not local_site_exists(event.get("href") or ""):
                continue
            if event.get("img") and not local_site_exists(event.get("img")):
                continue
            seen.add(key)
            end = parse_day(event.get("dataEnd") or event.get("end") or event.get("start"))
            if end and end < TODAY:
                continue
            events.append(event)
    events.sort(key=lambda item: item.get("dataEnd") or "9999-99-99")
    return events[:limit]


class EventIndexParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.cards = []
        self.data_blob = ""
        self.current = None
        self.capture = None
        self.capture_data_blob = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = attrs.get("class", "").split()
        if tag == "a" and "event-card" in classes:
            self.current = {
                "href": normalize_event_index_path(attrs.get("href", "")),
                **{key[5:]: value for key, value in attrs.items() if key.startswith("data-")},
            }
            self.current["modifier"] = self.current.get("cat") or "event"
        elif self.current and tag == "img" and not self.current.get("img"):
            self.current["img"] = normalize_event_index_path(attrs.get("src", ""))
        elif self.current and tag == "strong" and "card-title" in classes:
            self.capture = "title"
            self.current["title"] = ""
        elif self.current and tag == "span" and "card-meta" in classes:
            self.capture = "meta"
            self.current["meta"] = ""
        elif tag == "script" and attrs.get("id") == "events-data":
            self.capture_data_blob = True

    def handle_data(self, data):
        if self.current and self.capture:
            self.current[self.capture] += data
        elif self.capture_data_blob:
            self.data_blob += data

    def handle_endtag(self, tag):
        if self.current and tag in ("strong", "span") and self.capture:
            self.capture = None
        if self.current and tag == "a":
            self.cards.append(self.current)
            self.current = None
            self.capture = None
        if tag == "script" and self.capture_data_blob:
            self.capture_data_blob = False


def collect_event_index_entries():
    path = os.path.join(ROOT, "content", "events", "index.html")
    if not os.path.isfile(path):
        return []
    parser = EventIndexParser()
    parser.feed(open(path, encoding="utf-8").read())
    entries = list(parser.cards)
    if parser.data_blob.strip():
        try:
            for item in json.loads(parser.data_blob):
                entries.append({
                    "href": normalize_event_index_path(item.get("href", "")),
                    "img": normalize_event_index_path(item.get("image", "") or item.get("img", "")),
                    "title": item.get("title", ""),
                    "meta": item.get("meta", ""),
                    "start": item.get("start", ""),
                    "end": item.get("end", ""),
                    "dataEnd": item.get("end", ""),
                    "cat": item.get("cat", ""),
                    "topic": item.get("topic", ""),
                    "reach": item.get("reach", ""),
                    "cont": item.get("cont", ""),
                    "country": item.get("country", ""),
                    "modifier": item.get("cat", "") or "event",
                })
        except json.JSONDecodeError:
            pass
    return entries


def collect_global_events(continent, limit=48):
    events = []
    seen = set()
    for event in collect_event_index_entries():
        if event.get("reach") != "global":
            continue
        if event.get("cont") != continent:
            continue
        key = event.get("href") or event.get("title")
        if not key or key in seen:
            continue
        if not local_site_exists(event.get("href") or ""):
            continue
        if event.get("img") and not local_site_exists(event.get("img")):
            continue
        end = parse_day(event.get("end") or event.get("dataEnd") or event.get("start"))
        if end and end < TODAY:
            continue
        seen.add(key)
        event["dataEnd"] = event.get("end") or event.get("dataEnd") or event.get("start") or ""
        events.append(event)
    events.sort(key=lambda item: (item.get("start") or item.get("dataEnd") or "9999-99-99", item.get("title") or ""))
    return events[:limit]


def render_events(events, continent):
    if not events:
        return ""
    countries = load_countries(continent)
    cards = []
    for event in events:
        modifier = esc(event.get("modifier") or "event")
        href = esc(normalize_site_path(event.get("href") or "/content/events/index.html"))
        img = esc(normalize_site_path(event.get("img") or f"/content/locations/{continent}/img/{continent}-mini.png"))
        title = esc(event.get("title") or "Event")
        meta = esc(event.get("meta") or CONTINENT_COPY.get(continent, CONTINENTS.get(continent, {})).get("name", "Continent"))
        end = esc(event.get("dataEnd") or "")
        country_slug = event_country_slug(event, countries)
        country = countries.get(country_slug, {})
        country_name = country.get("name") or country_slug.replace("-", " ").title()
        flag = f"/content/locations/{continent}/{country_slug}/img/flag.svg"
        country_badge = (
            f'<span class="visual-topic-card__country"><img src="{flag}" alt="" width="20" height="14" loading="lazy">'
            f'<span>{esc(country_name)}</span></span>'
            if country_slug and country and asset_exists(flag)
            else ""
        )
        cards.append(
            f'<a class="visual-topic-card visual-topic-card--{modifier}" data-end="{end}" href="{href}">'
            f'<img src="{img}"{img_srcset(img[:-4] if img.endswith(".png") else img)} alt="{title} thumbnail" loading="lazy" width="400" height="300">'
            f"<strong>{title}</strong>{country_badge}<span>{meta}</span></a>"
        )
    return "".join(cards)


def render(continent):
    countries = load_countries(continent)
    meta = continent_meta(continent, countries)
    page_url = f"{DOMAIN}/content/locations/{continent}/index.html"
    hero = f"/content/locations/{continent}/img/{continent}-hero.jpg"
    hero_preload = f"/content/locations/{continent}/img/{continent}-hero-1200.webp"
    hero_srcset = []
    for width in (768, 1200):
        candidate = f"/content/locations/{continent}/img/{continent}-hero-{width}.webp"
        if asset_exists(candidate):
            hero_srcset.append(f"{candidate} {width}w")
    hero_source = ", ".join(hero_srcset) if hero_srcset else hero
    hero_sizes = "(max-width: 720px) 100vw, 44vw"
    kpis = "".join(f'<div class="country-kpi"><span>{esc(label)}</span><strong>{esc(value)}</strong></div>' for label, value in meta["kpis"])
    overview = "".join(f'<div class="fact-row"><span>{esc(label)}</span><strong>{esc(value)}</strong></div>' for label, value in meta["overview"])
    history = "".join(f'<div><time>{esc(label)}</time><span>{esc(text)}</span></div>' for label, text in meta["history"])
    routes = "".join(f'<li><strong>{esc(label)}:</strong> {esc(text)}</li>' for label, text in meta["routes"])
    country_table = render_country_table(continent, countries, meta["groups"])
    events = render_events(collect_global_events(continent), continent)
    jsonld = json.dumps({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "url": page_url,
        "name": meta["title"],
        "description": meta["description"],
        "inLanguage": "en",
        "image": f"{DOMAIN}{hero}",
    }, separators=(",", ":"))

    return f'''<!doctype html>
<html lang="en">
<head>
  <!-- OneSlider continent page -->
  <link rel="stylesheet" href="../../../assets/css/oneslider-core.css">
  <link rel="preload" as="image" href="{hero_preload}" imagesrcset="{", ".join(hero_srcset)}" imagesizes="{hero_sizes}">
  <script defer src="../../../assets/js/oneslider-core.js?v=no-palette-overlay-20260708"></script>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="twitter:description" content="{esc(meta["description"])}">
  <meta name="twitter:title" content="{esc(meta["title"])}">
  <meta name="robots" content="index,follow">
  <meta name="twitter:card" content="summary_large_image">
  <meta property="og:type" content="website">
  <meta property="og:description" content="{esc(meta["description"])}">
  <meta property="og:title" content="{esc(meta["title"])}"><meta property="og:image" content="{DOMAIN}{hero}">
  <meta name="description" content="{esc(meta["description"])}">
  <meta property="og:url" content="{page_url}">
  <link rel="canonical" href="{page_url}"><meta name="content-language" content="en">
  <link rel="icon" href="../../../assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="../../../assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../../../assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="../../../assets/icons/site.webmanifest">
  <link rel="stylesheet" href="../../../assets/css/locations.css?v=continent-onepage-iphone-20260709">
  <meta name="theme-color" content="#0d2137">
  <title>{esc(meta["title"])}</title>
  <script type="application/ld+json">{jsonld}</script>
</head>
<body class="country-onepage continent-onepage">
  <nav class="top-menu" aria-label="Location navigation">
    <a class="os-brand" href="/" aria-label="Home"><img class="os-brand__logo" src="/assets/icons/one-sliders-icon.svg" alt="" width="22" height="22" aria-hidden="true"><span class="os-brand__text">OneSliders</span></a>
    <a class="nav-icon" href="../../events/index.html" title="Events" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a>
    <a class="nav-icon active" href="../../locations/index.html" title="World" aria-label="World"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>
    <a class="nav-icon" href="../../categories/index.html" title="Categories" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a>
    <span class="nav-spacer"></span><details class="nav-language"><summary aria-label="Language">EN</summary><div class="nav-language__list"><a href="index.html" aria-current="page">EN</a></div></details>
  </nav>
  <main class="page-shell country-slide country-content-box">
    <section class="country-brief" aria-label="{esc(meta["name"])} one-slide overview">
      <div class="country-brief__copy">
        <picture class="country-hero-image" aria-hidden="true"><source srcset="{hero_source}" sizes="{hero_sizes}" type="image/webp"><img src="{hero}"{f' srcset="{hero_source}" sizes="{hero_sizes}"' if hero_srcset else ''} alt="" width="1200" height="630" loading="eager" decoding="async"></picture>
        <p class="kicker">Continent</p>
        <h1 class="hero-title">{esc(meta["name"])}</h1>
        <div class="country-left-stack"><div class="country-panel-card country-history-card"><h2>How {esc(meta["name"])} fits together</h2><div class="country-history-list">{history}</div></div><a class="location-parent-card" href="../index.html" aria-label="Go up to World locations"><img src="/content/locations/img/world-hero-small.png?v=world-hero-20260708" srcset="/content/locations/img/world-hero-small-200.webp?v=world-hero-20260708 200w, /content/locations/img/world-hero-small-400.webp?v=world-hero-20260708 400w" sizes="136px" alt="World locations thumbnail" loading="lazy" width="400" height="300"><span>Part of</span><strong>World locations</strong><em>More continents, countries and cities.</em></a></div>
      </div>
      <div class="country-brief__panel">
        <div class="country-kpis">{kpis}</div>
        <section class="persona-tabs" aria-label="Choose {esc(meta["name"])} view">
          <input type="radio" name="{continent}-view" id="view-overview" checked>
          <input type="radio" name="{continent}-view" id="view-visit">
          <input type="radio" name="{continent}-view" id="view-events">
          <div class="persona-tablist" role="tablist" aria-label="Choose {esc(meta["name"])} outcome">
            <label for="view-overview" role="tab">Overview</label>
            <label for="view-visit" role="tab">Countries</label>
            <label for="view-events" role="tab">Events</label>
          </div>
          <div class="persona-panel view-panel--overview">
            <div class="country-panel-card continent-overview-pitch"><h2>Why go</h2><p>{esc(meta["heroText"])}</p></div>
            <div class="country-panel-card country-panel-card--split">
              <div><h2>Browse by subregion</h2><div class="fact-table country-facts-tight">{overview}</div></div>
              <div><h2>Route logic</h2><ul class="country-points">{routes}</ul></div>
            </div>
          </div>
          <div class="persona-panel view-panel--visit">
            <div class="country-panel-card continent-country-overview">
              <div class="continent-country-overview__head">
                <div><h2>Countries by region</h2><p>Filter by group, then sort countries by population, area or Big Mac Index.</p></div>
              </div>
              {country_table}
            </div>
          </div>
          <div class="persona-panel view-panel--events">
            <div class="country-panel-card"><h2>Global events in {esc(meta["name"])}</h2><div class="country-paths country-paths--events" data-expiring-events>{events}</div></div>
          </div>
        </section>
      </div>
    </section>
  </main>
  <footer class="footer">&copy; 2026 <a href="https://3dfractal.no/">3D Fractal</a>.</footer>
</body>
</html>
'''


def build(continent):
    if continent not in CONTINENTS and continent not in CONTINENT_COPY:
        print(f"Unknown continent: {continent}")
        return 1
    out = os.path.join(ROOT, "content", "locations", continent, "index.html")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8", newline="") as fh:
        fh.write(render(continent))
    print(f"built {out}")
    return 0


def main(argv):
    if not argv:
        print("Usage: build_continent_page.py <continent|all>")
        return 1
    if argv[0] == "all":
        status = 0
        for continent in CONTINENT_ORDER:
            status = build(continent) or status
        return status
    return build(argv[0])


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
