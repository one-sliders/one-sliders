#!/usr/bin/env python3
"""
enrich_climate_topics.py  --  rebuild Climate topic pages as framed one-slider
dashboards: full-bleed hero, 6 KPI cards, fact tables, a CSS trend chart, and a
"leaders by source/type" table where every country is a flag link.

Facts only; no source references printed. Country flag-links resolve against the
real /content/locations tree (built once, with a few name aliases).

Usage: python scripts/enrich_climate_topics.py
"""

import os, re, glob, html as H

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ---- country name -> {cont,slug} lookup from the locations tree ----
def build_country_lookup():
    m = {}
    for f in glob.glob(os.path.join(ROOT, 'content/locations/*/*/index.html')):
        p = f.replace('\\', '/').split('/')
        cont, slug = p[-3], p[-2]
        h = open(f, encoding='utf-8', errors='replace').read()
        mh = re.search(r'<h1 class="hero-title">([^<]+)</h1>', h)
        name = (mh.group(1).strip() if mh else slug.replace('-', ' ').title())
        m[name] = {'cont': cont, 'slug': slug}
    # aliases for names that differ from the H1
    alias = {'United States': ('north-america', 'usa'), 'USA': ('north-america', 'usa'),
             'UK': ('europe', 'united-kingdom'), 'United Kingdom': ('europe', 'united-kingdom')}
    for a, (c, s) in alias.items():
        m.setdefault(a, {'cont': c, 'slug': s})
    return m

CL = build_country_lookup()


def country_link(name):
    """Return a flag country-link if we know the country, else the plain name."""
    info = CL.get(name)
    if not info:
        return H.escape(name)
    base = f"/content/locations/{info['cont']}/{info['slug']}"
    return (f'<a class="country" href="{base}/index.html">'
            f'<img src="{base}/img/flag.svg" alt="" width="20" height="14" loading="lazy">'
            f'{H.escape(name)}</a>')


def esc(s):
    return str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


# ---- per-topic factual content ----
# kpis: (label,value). facts: (label, value|('country',Name)|raw html via ('html',...))
# leaders: (label, CountryName)  -> rendered as flag link
# trend: (title, sub, [(year,pct,label)])
TOPICS = {
 "marine": {
   "intro": "Within Climate, Marine looks at the ocean's role in the climate system: how seas absorb heat and carbon, why warming and acidification stress reefs and marine life, and how coasts adapt to rising seas.",
   "kpis": [("Earth covered by ocean","~71%"),("Excess heat absorbed","~90%"),("CO₂ taken up","~25%"),("Surface pH since 1800s","−0.1"),("Named oceans","5"),("Average depth","~3.7 km")],
   "facts": [("Climate role","Largest heat and carbon sink"),("Main pressures","Warming, acidification, sea-level rise"),("At risk","Coral reefs, fisheries, coasts"),("Largest ocean","Pacific"),("Deepest point","Mariana Trench ~10.9 km"),("Why it matters","Drives weather and coastal life")],
   "leaders_title":"Largest ocean coastlines",
   "leaders":[("Longest coastline","Canada"),("Large EEZ","United States"),("Island nation","Iceland"),("Archipelago","Indonesia")],
   "trend":("Sea level rise","Long-term upward trend",[("1900","10","low"),("1950","30","")," ",("2000","70",""),("2020","100","high")]),
 },
 "ice-and-glaciers": {
   "intro": "Within Climate, Ice and Glaciers tracks the planet's frozen water: glaciers, ice sheets and sea ice, how fast they are shrinking, and what that means for sea level and freshwater supply.",
   "kpis": [("Fresh water held as ice","~69%"),("Land under ice","~10%"),("Sea-level rise / yr","~3-4 mm"),("Warming so far","~1.2°C"),("Ice sheets","2"),("Arctic sea ice","declining")],
   "facts": [("Largest ice mass","Antarctic Ice Sheet"),("Other ice sheet","Greenland"),("Main pressure","Warming air and oceans"),("Key effects","Rising seas, retreating glaciers"),("Also affects","Freshwater for millions"),("Why it matters","Stores water, reflects sunlight")],
   "leaders_title":"Most glaciers / ice by country",
   "leaders":[("Largest ice sheet","Antarctica"),("Greenland ice","Greenland"),("Most glaciers (Alps)","Switzerland"),("Arctic ice","Norway")],
   "trend":("Arctic sea ice (Sept)","Long-term decline",[("1980","100","high"),("1995","85",""),("2010","65",""),("2023","50","low")]),
 },
 "protected-nature": {
   "intro": "Within Climate, Protected Nature covers the parks, reserves and conservation areas set aside to safeguard ecosystems, species and natural landscapes that also store carbon.",
   "kpis": [("Land protected","~16%"),("Ocean protected","~8%"),("UNESCO natural sites","200+"),("2030 target","30%"),("Biggest store","Forests"),("National parks","4,000+")],
   "facts": [("Protection types","Parks, reserves, marine areas"),("Goal","Conserve habitats and species"),("Main pressures","Land use, climate, poaching"),("Stores","Carbon in forests and soils"),("Shelters","Wildlife and biodiversity"),("Why it matters","Buffers ecosystems")],
   "leaders_title":"Protected-area leaders",
   "leaders":[("Most protected land %","Venezuela"),("Largest rainforest","Brazil"),("Marine reserves","Australia"),("Wildlife parks","Kenya")],
   "trend":("Global protected land %","Rising over time",[("1990","9","low"),("2000","12",""),("2010","14",""),("2023","16","")]),
 },
 "weather": {
   "intro": "Within Climate, Weather covers the day-to-day state of the atmosphere – temperature, rain, wind and storms – and the seasonal patterns that shape how places feel.",
   "kpis": [("Seasons","4"),("Atmosphere layers","5"),("Main gases","N₂, O₂"),("Records since","1850s"),("Climate zones","5"),("Wind scale","0-12")],
   "facts": [("Weather vs climate","Short-term vs long-term"),("Drivers","Sun, ocean, pressure, moisture"),("Measured","Temperature, rain, wind, humidity"),("Extremes","Heatwaves, storms, droughts, floods"),("Forecasting","Satellites and models"),("Why it matters","Affects travel and safety")],
   "leaders_title":"Weather extremes by record",
   "leaders":[("Hottest recorded","United States"),("Coldest recorded","Antarctica"),("Most rainfall","India"),("Most tornadoes","United States")],
   "trend":("Global average temperature","Long-term warming",[("1900","20","cool"),("1960","35",""),("2000","70",""),("2023","100","warm")]),
 },
 "sustainability": None,  # already done by hand; skip
}

CSS = """
      .topic-slide { min-height: calc(100vh - 42px); display: grid; grid-template-rows: auto 1fr; gap: 12px; padding: clamp(12px,2.4vw,30px); }
      :root { --topic-nav-h: 54px; --topic-foot-h: 40px; --topic-gap: 12px; }
      .top-menu { position: fixed; top: 0; left: 0; right: 0; z-index: 40; }
      .site-footer { position: fixed; bottom: 0; left: 0; right: 0; z-index: 40; display: grid; place-items: center; min-height: var(--topic-foot-h); height: var(--topic-foot-h); text-align: center; }
      .topic-frame { position: fixed; top: calc(var(--topic-nav-h) + var(--topic-gap)); bottom: calc(var(--topic-foot-h) + var(--topic-gap)); left: clamp(12px,2vw,36px); right: clamp(12px,2vw,36px); padding: clamp(14px,1.8vw,24px); overflow: auto; background: rgba(255,255,255,.72); border: 1px solid var(--line); border-radius: 24px; box-shadow: 0 24px 70px rgba(16,24,32,.12); }
      .topic-frame .topic-slide { min-height: 0; padding: 0; gap: 10px; }
      .left { display: grid; gap: 8px; align-content: start; }
      .note-card strong { color: var(--theme); }
      .kpi-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 8px; }
      .kpi { padding: 11px 13px; border: 1px solid var(--line); border-radius: 8px; background: white; }
      .kpi span { display: block; color: var(--muted); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .02em; }
      .kpi strong { display: block; margin-top: 4px; font-size: clamp(20px,2.4vw,28px); line-height: 1; color: var(--ink); }
      .fact-table { width: 100%; border-collapse: collapse; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; background: white; font-size: 14px; }
      .fact-table th, .fact-table td { padding: 9px 13px; text-align: left; vertical-align: top; border-top: 1px solid var(--line); }
      .fact-table tr:first-child th, .fact-table tr:first-child td { border-top: 0; }
      .fact-table th { width: 42%; color: var(--muted); font-weight: 700; }
      .fact-table td { color: var(--ink); }
      .trend-card { padding: 12px 14px; border: 1px solid var(--line); border-radius: 8px; background: white; }
      .trend-card h3 { margin: 0 0 2px; font-size: 14px; }
      .trend-card .trend-sub { margin: 0 0 10px; color: var(--muted); font-size: 12px; }
      .trend-row { display: grid; grid-template-columns: 46px 1fr 44px; gap: 8px; align-items: center; margin: 5px 0; font-size: 12px; font-weight: 700; }
      .trend-bar { height: 10px; border-radius: 999px; background: rgba(23,32,28,.1); overflow: hidden; }
      .trend-bar i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--theme), var(--accent)); }
      .trend-val { text-align: right; color: var(--theme); }
      .dash { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 8px; align-content: start; }
      .dash .span-all { grid-column: 1 / -1; }
      .dash .kpi-grid { grid-template-columns: repeat(6, minmax(0,1fr)); }
      .dash .col { display: grid; gap: 8px; align-content: start; min-width: 0; }
      .dash .section-heading h2 { font-size: 16px; }
      .dash .fact-table { font-size: 12.5px; }
      .ft-head { background: var(--theme); color: #fff; width: auto; font-weight: 800; }
      .dash .fact-table th, .dash .fact-table td { padding: 6px 10px; }
      .dash .kpi { padding: 9px 11px; }
      .dash .kpi strong { font-size: clamp(18px,2vw,24px); }
      .dash .note-card { font-size: 13px; padding: 10px 13px; }
      .dash .event-grid { grid-template-columns: 1fr; }
      a.country { display: inline-flex; align-items: center; gap: 5px; color: inherit; text-decoration: none; }
      a.country img { width: 20px; height: 14px; border-radius: 2px; object-fit: cover; flex: 0 0 auto; }
      a.country:hover { color: var(--theme); }
      @media (max-width: 1000px) { .dash { grid-template-columns: 1fr 1fr; } .dash .kpi-grid { grid-template-columns: repeat(3,1fr); } }
      @media (max-width: 640px) { .dash { grid-template-columns: 1fr; } .dash .kpi-grid { grid-template-columns: repeat(2,1fr); } }
"""
CSS_MARKER = '/* topic-dash-css */'


def build_dash(slug, d, existing_events):
    kpis = ''.join(f'<div class="kpi"><span>{esc(l)}</span><strong>{v}</strong></div>' for l, v in d['kpis'])
    facts = ''.join(f'<tr><th>{esc(l)}</th><td>{esc(v)}</td></tr>' for l, v in d['facts'])
    leaders = (f'<tr><th colspan="2" class="ft-head">{esc(d["leaders_title"])}</th></tr>' +
               ''.join(f'<tr><th>{esc(l)}</th><td>{country_link(c)}</td></tr>' for l, c in d['leaders']))
    tr = d['trend']
    rows = [x for x in tr[2] if isinstance(x, tuple)]
    trbars = ''.join(f'<div class="trend-row"><span>{esc(y)}</span><span class="trend-bar"><i style="width:{p}%"></i></span><span class="trend-val">{esc(lab) if lab.strip() else ""}</span></div>'
                     for (y, p, lab) in rows)
    trend = (f'<div class="trend-card"><h3>{esc(tr[0])}</h3><p class="trend-sub">{esc(tr[1])}</p>{trbars}</div>')
    events_html = existing_events or '<p class="empty">Events appear here when scheduled.</p>'
    return (
      '<section class="topic-panel dash">'
      f'<div class="note-card span-all">{esc(d["intro"])}</div>'
      f'<div class="kpi-grid span-all">{kpis}</div>'
      f'<div class="col"><table class="fact-table"><tbody>{facts}</tbody></table></div>'
      f'<div class="col"><table class="fact-table"><tbody>{leaders}</tbody></table>{trend}</div>'
      f'<div class="col"><div class="section-heading"><h2>Upcoming events</h2></div>'
      f'<div class="event-grid">{events_html}</div></div>'
      '</section>'
    )


def enrich(slug, d):
    f = os.path.join(ROOT, 'content/categories/climate', slug + '.html')
    h = open(f, encoding='utf-8').read()
    # CSS once
    if CSS_MARKER not in h:
        h = re.sub(r'(\.topic-slide \{[^}]*\})', CSS_MARKER + CSS, h, count=1)
    # extract existing event cards to preserve them
    ev = re.search(r'data-carousel-track>(.*?)</div></div>', h, re.S) or re.search(r'class="event-grid"[^>]*>(.*?)</div>', h, re.S)
    events = ''
    if ev:
        cards = re.findall(r'<a class="event-card".*?</a>', ev.group(1), re.S)
        events = ''.join(cards)
    # ensure main is framed
    if 'class="topic-frame"' not in h:
        h = h.replace('<main class="topic-slide">', '<div class="topic-frame"><main class="topic-slide">', 1)
        h = h.replace('</main>', '</main></div>', 1)
    # replace the panel
    dash = build_dash(slug, d, events)
    h = re.sub(r'<section class="topic-panel".*?</section>', dash, h, count=1, flags=re.S)
    open(f, 'w', encoding='utf-8', newline='').write(h)
    words = len(re.sub(r'<[^>]+>', ' ', re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', h, flags=re.S)).split())
    print(f'  {slug}: {words}w, {h.count("a class=\"country\"")} flag links')


def main():
    for slug, d in TOPICS.items():
        if d is None:
            continue
        enrich(slug, d)
    print('done')


if __name__ == '__main__':
    main()
