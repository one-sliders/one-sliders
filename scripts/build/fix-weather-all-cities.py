#!/usr/bin/env python3
"""Add coordinates and weather fields to all city data files if missing."""
import json
import glob
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

# Coordinates for major cities (from previous extraction)
CITY_COORDS = {
    "Paris": {"lat": 48.85341, "lon": 2.3488},
    "London": {"lat": 51.5074, "lon": -0.1278},
    "Tokyo": {"lat": 35.6762, "lon": 139.6503},
    "Berlin": {"lat": 52.52, "lon": 13.405},
    "Madrid": {"lat": 40.4168, "lon": -3.7038},
    "Rome": {"lat": 41.9028, "lon": 12.4964},
    "Amsterdam": {"lat": 52.3676, "lon": 4.9041},
    "Vienna": {"lat": 48.2082, "lon": 16.3738},
    "Prague": {"lat": 50.0755, "lon": 14.4378},
    "Barcelona": {"lat": 41.3851, "lon": 2.1734},
    "Oslo": {"lat": 59.91273, "lon": 10.74609},
    "Stockholm": {"lat": 59.3293, "lon": 18.0686},
    "Copenhagen": {"lat": 55.6761, "lon": 12.5683},
    "Dublin": {"lat": 53.3498, "lon": -6.2603},
    "Lisbon": {"lat": 38.7223, "lon": -9.1393},
    "Athens": {"lat": 37.9838, "lon": 23.7275},
    "Istanbul": {"lat": 41.0082, "lon": 28.9784},
    "Moscow": {"lat": 55.7558, "lon": 37.6173},
    "Kyiv": {"lat": 50.45, "lon": 30.5238},
    "Warsaw": {"lat": 52.2297, "lon": 21.0122},
    "Budapest": {"lat": 47.4979, "lon": 19.0402},
    "New York City": {"lat": 40.7128, "lon": -74.0060},
    "Los Angeles": {"lat": 34.0522, "lon": -118.2437},
    "Chicago": {"lat": 41.8781, "lon": -87.6298},
    "San Francisco": {"lat": 37.7749, "lon": -122.4194},
    "Toronto": {"lat": 43.6532, "lon": -79.3832},
    "Mexico City": {"lat": 19.4326, "lon": -99.1332},
    "São Paulo": {"lat": -23.5505, "lon": -46.6333},
    "Buenos Aires": {"lat": -34.6037, "lon": -58.3816},
    "Rio de Janeiro": {"lat": -22.9068, "lon": -43.1729},
    "Sydney": {"lat": -33.8688, "lon": 151.2093},
    "Melbourne": {"lat": -37.8136, "lon": 144.9631},
    "Bangkok": {"lat": 13.7563, "lon": 100.5018},
    "Singapore": {"lat": 1.3521, "lon": 103.8198},
    "Delhi": {"lat": 28.7041, "lon": 77.1025},
    "Mumbai": {"lat": 19.0760, "lon": 72.8777},
    "Beijing": {"lat": 39.9042, "lon": 116.4074},
    "Shanghai": {"lat": 31.2304, "lon": 121.4737},
    "Hong Kong": {"lat": 22.3193, "lon": 114.1694},
    "Luanda": {"lat": -8.8383, "lon": 13.2344},
    "Nairobi": {"lat": -1.2921, "lon": 36.8219},
    "Johannesburg": {"lat": -26.2023, "lon": 28.0436},
    "Cape Town": {"lat": -33.9249, "lon": 18.4241},
    "Cairo": {"lat": 30.0444, "lon": 31.2357},
}

WEATHER_TEMPLATE = {
    "source": "OneSlider shared weather module",
    "dynamic": True
}

count = 0
fixed = 0

for json_file in sorted(glob.glob(str(ROOT / 'content/locations/**/*.city.data.json'), recursive=True)):
    count += 1
    try:
        with open(json_file, 'r', encoding='utf-8-sig') as f:
            data = json.load(f)

        city_name = data.get('name')
        needs_fix = False

        # Add coordinates if missing
        if not data.get('coordinates'):
            if city_name in CITY_COORDS:
                data['coordinates'] = CITY_COORDS[city_name]
                needs_fix = True

        # Add weather if missing
        if not data.get('weather'):
            data['weather'] = WEATHER_TEMPLATE.copy()
            needs_fix = True

        if needs_fix:
            # Reorder to put coordinates early
            ordered = {}
            for key in ['slug', 'name', 'continent', 'continentName', 'countrySlug', 'countryName', 'depth', 'coordinates', 'weather']:
                if key in data:
                    ordered[key] = data.pop(key)
            ordered.update(data)

            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(ordered, f, ensure_ascii=False, indent=2)
            fixed += 1
    except Exception as e:
        print(f"ERROR {json_file}: {e}")

print(f"OK {fixed}/{count} cities fixed with coordinates/weather")
