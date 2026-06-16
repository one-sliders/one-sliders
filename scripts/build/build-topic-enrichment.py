#!/usr/bin/env python3
"""
enrich_topic_pages.py  --  add subject KPI cards + a fact table to thin topic-slide
category pages (one-slider style: compact facts about the SUBJECT, seen through the
parent category lens). Facts only; no invented events; no source references printed.

Content per topic is defined in TOPIC_DATA below (hand-curated, factual).
The script injects shared CSS once and replaces the page's <div class="left">…</div>.

Usage:
  python scripts/enrich_topic_pages.py climate            # one group
  python scripts/enrich_topic_pages.py climate/marine     # one page
"""

import os, sys, re, html as H

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Shared CSS injected once (idempotent) after the .note-card rule.
CSS = (
    "\n      .left { display: grid; gap: 8px; align-content: start; }"
    "\n      .note-card strong { color: var(--theme); }"
    "\n      .kpi-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 8px; }"
    "\n      .kpi { padding: 11px 13px; border: 1px solid var(--line); border-radius: 8px; background: white; }"
    "\n      .kpi span { display: block; color: var(--muted); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .02em; }"
    "\n      .kpi strong { display: block; margin-top: 4px; font-size: clamp(20px,2.4vw,28px); line-height: 1; color: var(--ink); }"
    "\n      .fact-table { width: 100%; border-collapse: collapse; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; background: white; font-size: 14px; }"
    "\n      .fact-table th, .fact-table td { padding: 9px 13px; text-align: left; vertical-align: top; border-top: 1px solid var(--line); }"
    "\n      .fact-table tr:first-child th, .fact-table tr:first-child td { border-top: 0; }"
    "\n      .fact-table th { width: 42%; color: var(--muted); font-weight: 700; }"
    "\n      .fact-table td { color: var(--ink); }"
)
CSS_MARKER = '/* topic-kpi-css */'

# Per-topic factual content. intro = one sentence (category lens);
# kpis = list of (label, value); facts = list of (label, value).
TOPIC_DATA = {
  "climate/ice-and-glaciers": {
    "intro": "Within Climate, Ice and Glaciers tracks the planet's frozen water: glaciers, ice sheets and sea ice, how fast they are shrinking, and what that means for sea level and freshwater supply.",
    "kpis": [("Fresh water held as ice","~69%"),("Land covered by ice","~10%"),("Sea-level rise / yr","~3-4 mm"),("Arctic sea ice","declining")],
    "facts": [("Largest ice mass","Antarctic Ice Sheet"),("Other ice sheet","Greenland"),("Main pressure","Warming air and oceans"),("Key effects","Rising seas, retreating glaciers"),("Also affects","Freshwater supply for millions"),("Why it matters","Stores freshwater, reflects sunlight")],
  },
  "climate/protected-nature": {
    "intro": "Within Climate, Protected Nature covers the parks, reserves and conservation areas set aside to safeguard ecosystems, species and natural landscapes.",
    "kpis": [("Land protected","~16%"),("Ocean protected","~8%"),("UNESCO natural sites","200+"),("Global 2030 target","30%")],
    "facts": [("Protection types","National parks, reserves, marine areas"),("Goal","Conserve habitats and biodiversity"),("Main pressures","Land use, climate change, poaching"),("Stores","Carbon in forests, wetlands and soils"),("Shelters","Wildlife and biodiversity"),("Why it matters","Buffers ecosystems against climate stress")],
  },
  "climate/sustainability": {
    "intro": "Within Climate, Sustainability covers how societies cut emissions and use resources responsibly: renewable energy, circular use of materials, and lower-impact living.",
    "kpis": [("UN SDGs","17"),("Renewables in power","~30%"),("Net-zero target year","2050"),("Paris limit","1.5°C")],
    "facts": [("Core idea","Meet needs without depleting the future"),("Key levers","Clean energy, efficiency, recycling"),("Framework","UN Sustainable Development Goals"),("Circular economy","Reuse, repair and recycle materials"),("Measured by","Carbon, water and waste footprints"),("Why it matters","Limits warming and resource depletion")],
  },
  "climate/weather": {
    "intro": "Within Climate, Weather covers the day-to-day state of the atmosphere – temperature, rain, wind and storms – and the seasonal patterns that shape how places feel.",
    "kpis": [("Seasons","4"),("Atmosphere layers","5"),("Main gases","N₂, O₂"),("Records since","1850s")],
    "facts": [("Weather vs climate","Short-term vs long-term average"),("Drivers","Sun, ocean, air pressure, moisture"),("Measured","Temperature, rain, wind, humidity"),("Extremes","Heatwaves, storms, droughts, floods"),("Forecasting","Satellites and numerical models"),("Why it matters","Affects travel, safety and seasons")],
  },
}


def esc(s):
    return str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def build_left(d):
    kpis = ''.join(f'<div class="kpi"><span>{esc(l)}</span><strong>{v}</strong></div>' for l, v in d['kpis'])
    facts = ''.join(f'<tr><th>{esc(l)}</th><td>{esc(v)}</td></tr>' for l, v in d['facts'])
    return (f'<div class="left">'
            f'<div class="note-card">{esc(d["intro"])}</div>'
            f'<div class="kpi-grid">{kpis}</div>'
            f'<table class="fact-table"><tbody>{facts}</tbody></table>'
            f'</div>')


def enrich(path, key):
    d = TOPIC_DATA.get(key)
    if not d:
        print('  no data for', key); return False
    h = open(path, encoding='utf-8').read()
    # 1. inject CSS once
    if CSS_MARKER not in h:
        h = re.sub(r'(\.note-card \{[^}]*\})', r'\1' + CSS_MARKER + CSS, h, count=1)
    # 2. replace the left block
    new_left = build_left(d)
    h2 = re.sub(r'<div class="left">.*?</div>\s*(?=<div class="right">)', new_left, h, count=1, flags=re.S)
    if h2 == h and CSS_MARKER not in open(path, encoding='utf-8').read():
        pass
    if '<div class="left">' not in h2 or new_left not in h2:
        print('  WARN left not replaced:', key)
    import time
    for _ in range(5):
        try:
            open(path, 'w', encoding='utf-8', newline='').write(h2)
            break
        except OSError:
            time.sleep(0.3)
    return True


def main(argv):
    if not argv:
        print('Usage: enrich_topic_pages.py <group> | <group/topic>'); return 1
    arg = argv[0]
    if '/' in arg:
        keys = [arg]
    else:
        keys = [k for k in TOPIC_DATA if k.startswith(arg + '/')]
    n = 0
    for k in keys:
        p = os.path.join(ROOT, 'content', 'categories', *k.split('/')) + '.html'
        if os.path.isfile(p) and enrich(p, k):
            words = len(re.sub(r'<[^>]+>', ' ', re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', open(p, encoding='utf-8').read(), flags=re.S)).split())
            print(f'  enriched {k} ({words}w)')
            n += 1
    print(f'Enriched {n} pages.')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
