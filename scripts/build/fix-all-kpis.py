#!/usr/bin/env python3
"""Clear KPIs from all city data files so auto-generation works."""
import json
import glob
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

fixed = 0
for json_file in sorted(glob.glob(str(ROOT / 'content/locations/**/*.city.data.json'), recursive=True)):
    try:
        with open(json_file, 'r', encoding='utf-8-sig') as f:
            data = json.load(f)

        # If KPIs exist and are not empty, clear them so auto-generation fills in real data
        if data.get('kpis'):
            data['kpis'] = []
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            fixed += 1
    except Exception as e:
        print(f"ERROR {json_file}: {e}")

print(f"Cleared KPIs in {fixed} cities for auto-generation")
