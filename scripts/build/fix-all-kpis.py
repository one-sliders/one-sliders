#!/usr/bin/env python3
"""Fix KPI format for all cities - use correct structure from data."""
import json
import glob
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

fixed = 0
for json_file in sorted(glob.glob(str(ROOT / 'content/locations/**/*.city.data.json'), recursive=True)):
    try:
        with open(json_file, 'r', encoding='utf-8-sig') as f:
            data = json.load(f)

        # Get available data
        country = data.get('countryName', '')
        tz = data.get('timezone', '')
        history = data.get('history', [])

        # Find founded year from history
        founded = next((x.get('label') for x in history if re.fullmatch(r'\d{3,4}', str(x.get('label', '')))), None)

        # Build correct KPIs
        kpis = []
        if country:
            kpis.append({'label': 'Region', 'value': country, 'note': country})
        if tz:
            kpis.append({'label': 'Time zone', 'value': tz, 'note': 'local time'})
        if founded:
            kpis.append({'label': 'Founded', 'value': founded, 'note': 'historical origin'})

        # Only update if current KPIs are wrong or empty
        current_kpis = data.get('kpis') or []
        if len(current_kpis) == 0 or any(
            k.get('value') in ('tba', 'City population', 'Metro region', 'historical reference', '')
            for k in current_kpis if isinstance(k, dict)
        ):
            data['kpis'] = kpis
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            fixed += 1
    except Exception as e:
        pass

print(f"Fixed KPI format in {fixed} cities")
