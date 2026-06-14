#!/usr/bin/env python3
"""Fill missing city coordinates in *.city.data.json files.

Uses Open-Meteo's geocoding API and writes only missing coordinates by default.
The city page generator then emits data-weather-lat/lon for the weather widget.
"""

import argparse
import json
import pathlib
import re
import time
import unicodedata
import urllib.parse
import urllib.request


ROOT = pathlib.Path(__file__).resolve().parents[1]
CITY_ROOT = ROOT / "content" / "locations"
API = "https://geocoding-api.open-meteo.com/v1/search"
USER_AGENT = "OneSliders city coordinate importer (https://one-sliders.com/)"

CITY_QUERY_OVERRIDES = {
    "content/locations/africa/chad/ndjamena.city.data.json": "N'Djamena",
    "content/locations/africa/morocco/marrakech.city.data.json": "Marrakesh",
    "content/locations/africa/sao-tome-and-principe/sao-tome.city.data.json": "Sao Tome",
    "content/locations/asia/sri-lanka/sri-jayawardenepura-kotte.city.data.json": "Sri Jayewardenepura Kotte",
    "content/locations/europe/turkey/ankara.city.data.json": "Ankara",
    "content/locations/north-america/canada/jasper.city.data.json": "Jasper, Alberta",
    "content/locations/north-america/canada/quebec-city.city.data.json": "Quebec City",
    "content/locations/north-america/usa/portland-maine.city.data.json": "Portland, Maine",
    "content/locations/north-america/usa/washington-dc.city.data.json": "Washington, D.C.",
    "content/locations/oceania/kiribati/south-tarawa.city.data.json": "South Tarawa",
    "content/locations/oceania/tonga/nukualofa.city.data.json": "Nuku'alofa",
}

COORDINATE_OVERRIDES = {
    "content/locations/europe/iceland/husavik.city.data.json": (66.0449, -17.3389, "Husavik", "Iceland"),
    "content/locations/europe/turkey/ankara.city.data.json": (39.9334, 32.8597, "Ankara", "Turkey"),
    "content/locations/north-america/antigua-and-barbuda/saint-johns.city.data.json": (17.1274, -61.8468, "St. John's", "Antigua and Barbuda"),
    "content/locations/north-america/canada/jasper.city.data.json": (52.8737, -118.0814, "Jasper", "Canada"),
    "content/locations/north-america/canada/prince-edward-county.city.data.json": (44.0008, -77.2474, "Prince Edward County", "Canada"),
    "content/locations/north-america/canada/quebec-city.city.data.json": (46.8139, -71.2080, "Quebec City", "Canada"),
    "content/locations/north-america/grenada/saint-georges.city.data.json": (12.0561, -61.7488, "St. George's", "Grenada"),
    "content/locations/north-america/usa/augusta.city.data.json": (33.4735, -82.0105, "Augusta", "United States"),
    "content/locations/north-america/usa/east-hampton.city.data.json": (40.9634, -72.1848, "East Hampton", "United States"),
    "content/locations/north-america/usa/newport.city.data.json": (41.4901, -71.3128, "Newport", "United States"),
    "content/locations/north-america/usa/portland-maine.city.data.json": (43.6591, -70.2568, "Portland", "United States"),
    "content/locations/north-america/usa/southampton.city.data.json": (40.8843, -72.3895, "Southampton", "United States"),
    "content/locations/north-america/usa/washington-dc.city.data.json": (38.9072, -77.0369, "Washington, D.C.", "United States"),
    "content/locations/oceania/kiribati/south-tarawa.city.data.json": (1.3291, 172.9791, "South Tarawa", "Kiribati"),
    "content/locations/oceania/tonga/nukualofa.city.data.json": (-21.1394, -175.2049, "Nuku'alofa", "Tonga"),
}

COUNTRY_ALIASES = {
    "usa": "united states",
    "us": "united states",
    "u s a": "united states",
    "united states of america": "united states",
    "uk": "united kingdom",
    "uae": "united arab emirates",
    "cote d ivoire": "ivory coast",
    "c te d ivoire": "ivory coast",
    "republic of the congo": "congo",
    "congo republic": "congo",
    "democratic republic of the congo": "democratic republic of congo",
    "czech republic": "czechia",
    "the gambia": "gambia",
    "sao tome principe": "sao tome and principe",
    "sao tome and principe": "sao tome and principe",
    "turkiye": "turkey",
}


def normalize(value):
    value = unicodedata.normalize("NFKD", str(value or "")).encode("ascii", "ignore").decode("ascii").lower()
    value = value.replace("&", " and ")
    value = re.sub(r"[^a-z0-9]+", " ", value).strip()
    return COUNTRY_ALIASES.get(value, value)


def query_geocoder(name):
    params = urllib.parse.urlencode({
        "name": name,
        "count": "10",
        "language": "en",
        "format": "json",
    })
    req = urllib.request.Request(f"{API}?{params}", headers={"User-Agent": USER_AGENT})
    last_error = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as res:
                return json.loads(res.read().decode("utf-8")).get("results") or []
        except Exception as exc:
            last_error = exc
            time.sleep(0.5 + attempt)
    raise last_error


def score_result(row, data):
    wanted_city = normalize(data.get("name"))
    wanted_country = normalize(data.get("countryName"))
    row_city = normalize(row.get("name"))
    row_country = normalize(row.get("country"))
    row_admin1 = normalize(row.get("admin1"))

    score = 0
    country_score = 0
    if row_city == wanted_city:
        score += 100
    elif wanted_city in row_city or row_city in wanted_city:
        score += 45
    if row_country == wanted_country:
        country_score = 80
    elif wanted_country and (wanted_country in row_country or row_country in wanted_country):
        country_score = 35
    if row_country and wanted_country and country_score == 0:
        return -100
    score += country_score
    if row_admin1 and row_admin1 in wanted_city:
        score += 5
    return score


def find_coordinates(data, path=None):
    rel = path.relative_to(ROOT).as_posix() if path else ""
    override = CITY_QUERY_OVERRIDES.get(rel)
    queries = [
        override or "",
        str(data.get("name") or ""),
        f"{override}, {data.get('countryName')}" if override else "",
        f"{data.get('name')}, {data.get('countryName')}",
    ]
    seen = set()
    candidates = []
    for query in queries:
        query = query.strip(" ,")
        if not query or query.lower() in seen:
            continue
        seen.add(query.lower())
        candidates.extend(query_geocoder(query))
        time.sleep(0.08)

    if not candidates:
        return None

    ranked = sorted(candidates, key=lambda row: score_result(row, data), reverse=True)
    best = ranked[0]
    if score_result(best, data) < 80:
        return None
    return {
        "lat": round(float(best["latitude"]), 6),
        "lon": round(float(best["longitude"]), 6),
        "timezone": best.get("timezone") or None,
        "matchedName": best.get("name"),
        "matchedCountry": best.get("country"),
    }


def update_file(path, overwrite=False):
    data = json.loads(path.read_text(encoding="utf-8"))
    coords = data.get("coordinates") or {}
    if not overwrite and coords.get("lat") is not None and coords.get("lon") is not None:
        return "kept", None

    rel = path.relative_to(ROOT).as_posix()
    if rel in COORDINATE_OVERRIDES:
        lat, lon, matched_name, matched_country = COORDINATE_OVERRIDES[rel]
        found = {
            "lat": lat,
            "lon": lon,
            "timezone": None,
            "matchedName": matched_name,
            "matchedCountry": matched_country,
        }
    else:
        found = find_coordinates(data, path)
    if not found:
        return "missing", None

    data["coordinates"] = {"lat": found["lat"], "lon": found["lon"]}
    if found.get("timezone") and not data.get("timezone"):
        data["timezone"] = found["timezone"]
    data["coordinateSource"] = {
        "label": "Open-Meteo Geocoding API",
        "matchedName": found.get("matchedName"),
        "matchedCountry": found.get("matchedCountry"),
    }
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return "wrote", found


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--overwrite", action="store_true")
    parser.add_argument("--sleep", type=float, default=0.25)
    parser.add_argument("--exclude-prefix", action="append", default=[])
    parser.add_argument("paths", nargs="*")
    args = parser.parse_args()

    files = [pathlib.Path(p) for p in args.paths] if args.paths else sorted(CITY_ROOT.rglob("*.city.data.json"))
    files = [p if p.is_absolute() else ROOT / p for p in files]
    exclude_prefixes = tuple(str(p).replace("\\", "/").strip("/") for p in args.exclude_prefix)
    if exclude_prefixes:
        files = [
            p for p in files
            if not str(p.relative_to(ROOT)).replace("\\", "/").startswith(exclude_prefixes)
        ]
    if args.limit:
        files = files[:args.limit]
    counts = {}
    for index, path in enumerate(files, start=1):
        try:
            status, found = update_file(path, overwrite=args.overwrite)
        except Exception as exc:
            status, found = "error", None
            error_line = f"error {path.relative_to(ROOT)} {exc}"
            print(error_line.encode("ascii", "replace").decode("ascii"))
        counts[status] = counts.get(status, 0) + 1
        rel = path.relative_to(ROOT)
        suffix = ""
        if found:
            suffix = f" -> {found['lat']},{found['lon']} {found.get('matchedName')}, {found.get('matchedCountry')}"
        line = f"{index:03d}/{len(files)} {status:7} {rel}{suffix}"
        print(line.encode("ascii", "replace").decode("ascii"))
        time.sleep(args.sleep)
    print("summary", counts)


if __name__ == "__main__":
    main()
