#!/usr/bin/env python3
"""Fix KPI format for all cities - use correct structure with population data."""
import json
import glob
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

# Load population mapping
pop_data = {}
pop_file = ROOT / 'data' / 'city-population-mapping.json'
if pop_file.exists():
    with open(pop_file, encoding='utf-8') as f:
        pop_data = json.load(f)

def format_population(num):
    """Format population like 2113705 -> ~2.1M"""
    if not num:
        return None
    num = int(num)
    if num >= 1000000:
        return f'~{num / 1000000:.1f}M'
    if num >= 1000:
        return f'~{num / 1000:.0f}K'
    return str(num)

fixed = 0
for json_file in sorted(glob.glob(str(ROOT / 'content/locations/**/*.city.data.json'), recursive=True)):
    try:
        with open(json_file, 'r', encoding='utf-8-sig') as f:
            data = json.load(f)

        city_name = data.get('name', '')
        country = data.get('countryName', '')
        tz = data.get('timezone', '')
        history = data.get('history', [])

        # Get population
        population = pop_data.get(city_name)
        population_str = format_population(population) if population else None

        # Find founded year from history
        founded = next((x.get('label') for x in history if re.fullmatch(r'\d{3,4}', str(x.get('label', '')))), None)

        # Build correct KPIs
        kpis = []
        if population_str:
            kpis.append({'label': 'Population', 'value': population_str, 'note': 'city context'})
        if country:
            kpis.append({'label': 'Region', 'value': country, 'note': country})
        if tz:
            kpis.append({'label': 'Time zone', 'value': tz, 'note': 'local time'})
        if founded:
            kpis.append({'label': 'Founded', 'value': founded, 'note': 'historical origin'})

        # Always update KPIs - build proper structure from available data
        if kpis:
            data['kpis'] = kpis
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            fixed += 1
    except Exception as e:
        pass

print(f"Fixed KPI format in {fixed} cities (with population data)")
