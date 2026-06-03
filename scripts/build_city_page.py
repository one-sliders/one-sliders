#!/usr/bin/env python3
"""
build_city_page.py  --  template + data model for CITY pages (one layout, many JSON).

Mirror of build_country_page.py but for the city one-pager structure:
  - City Snapshot (label/text rows) instead of History
  - KPIs: Country / Population / Metro / Known for
  - location-links may include a --country card + city links
  - no Food, no sub-cities
Generates full static HTML (SEO-safe) + responsive WebP (image-set/srcset).

Usage:
  python scripts/build_city_page.py <country_dir>/<city>.html      # one city
  python scripts/build_city_page.py --continent europe            # all cities
"""

import os, sys, json, glob, html as H

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOMAIN = 'https://one-sliders.com'


def esc(s):
    return (str(s).replace('&', '&amp;').replace('<', '&lt;')
            .replace('>', '&gt;').replace('"', '&quot;'))


def rel_prefix(depth):
    return '../' * depth


# ===================================================================== render
def render(d):
    slug = d['slug']
    name = d['name']
    cont = d['continent']
    cont_name = d['continentName']
    country_slug = d['countrySlug']
    country_name = d['countryName']
    depth = d['depth']                       # content/locations/<cont>/<country>/<city>.html -> 5
    up = rel_prefix(depth)                   # to repo root for assets
    inc = rel_prefix(depth - 1)              # to content/ for nav icons
    page_url = f"{DOMAIN}/content/locations/{cont}/{country_slug}/{slug}.html"
    seo = d['seo']
    img_base = f"/content/locations/{cont}/{country_slug}/img"
    hero = f"{img_base}/{slug}-hero.png"

    def _has(p): return os.path.isfile(os.path.join(ROOT, p.lstrip('/')))

    def mini_img(src, alt):
        base = src[:-4] if src.endswith('.png') else src
        ss = [f'{base}-{w}.webp {w}w' for w in (200, 400)
              if src.startswith('/') and _has(f'{base}-{w}.webp')]
        ss_attr = (f' srcset="{", ".join(ss)}" sizes="(max-width:620px) 220px, 400px"' if ss else '')
        return (f'<img src="{esc(src)}"{ss_attr} alt="{esc(alt)} thumbnail" '
                f'loading="lazy" width="400" height="300">')

    # hero image-set (q92 webp + png fallback); single quotes inside url()
    hero_1200 = f"{img_base}/{slug}-hero-1200.webp"
    if _has(hero_1200):
        hero_url = (f"image-set(url('{hero_1200}') type('image/webp'), "
                    f"url('{hero}') type('image/png'))")
        hero_preload = hero_1200
    else:
        hero_url = f"url('{hero}')"
        hero_preload = hero

    # JSON-LD
    jsonld = {
        "@context": "https://schema.org",
        "@graph": [
            {"@type": "Organization", "@id": f"{DOMAIN}/#organization", "name": "OneSliders",
             "url": f"{DOMAIN}/", "logo": f"{DOMAIN}/assets/icons/one-sliders-icon.svg"},
            {"@type": "WebSite", "@id": f"{DOMAIN}/#website", "url": f"{DOMAIN}/", "name": "OneSliders",
             "publisher": {"@id": f"{DOMAIN}/#organization"},
             "potentialAction": {"@type": "SearchAction",
                 "target": {"@type": "EntryPoint", "urlTemplate": f"{DOMAIN}/content/events/index.html?search={{search_term_string}}"},
                 "query-input": "required name=search_term_string"}},
            {"@type": "WebPage", "@id": f"{page_url}#webpage", "url": page_url,
             "name": seo['title'], "description": seo['webpageDescription'], "inLanguage": "en",
             "image": f"{DOMAIN}{hero}", "breadcrumb": {"@id": f"{page_url}#breadcrumb"},
             "isPartOf": {"@id": f"{DOMAIN}/#website"}, "publisher": {"@id": f"{DOMAIN}/#organization"}},
            {"@type": "BreadcrumbList", "@id": f"{page_url}#breadcrumb", "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{DOMAIN}/"},
                {"@type": "ListItem", "position": 2, "name": "Locations", "item": f"{DOMAIN}/content/locations/index.html"},
                {"@type": "ListItem", "position": 3, "name": cont_name, "item": f"{DOMAIN}/content/locations/{cont}/index.html"},
                {"@type": "ListItem", "position": 4, "name": country_name, "item": f"{DOMAIN}/content/locations/{cont}/{country_slug}/index.html"},
                {"@type": "ListItem", "position": 5, "name": seo['title'], "item": page_url},
            ]},
        ],
        "name": seo['title'], "description": seo['webpageDescription'],
    }
    ldjson = json.dumps(jsonld, ensure_ascii=False, separators=(',', ':'))

    nav = (
        f'<nav class="top-menu" aria-label="Location navigation">'
        f'<a class="nav-icon" href="{inc}events/index.html" title="Events" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a>'
        f'<a class="nav-icon active" href="{inc}locations/index.html" title="World" aria-label="World"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>'
        f'<a class="nav-icon" href="{inc}categories/index.html" title="Categories" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a>'
        f'<span class="nav-divider"></span>'
        f'<a class="nav-back" href="index.html" title="Back to {esc(country_name)}" aria-label="Back to {esc(country_name)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg><span>{esc(country_name)}</span></a>'
        f'<a class="nav-pill" href="../index.html">{esc(cont_name)}</a>'
        f'<a class="nav-pill" href="index.html">{esc(country_name)}</a>'
        f'<a class="nav-pill active" aria-current="page" href="{slug}.html">{esc(name)}</a>'
        f'</nav>'
    )

    snapshot = ''.join(
        f'<div><time>{esc(s["label"])}</time><span>{esc(s["text"])}</span></div>' for s in d['snapshot'])
    kpis = ''.join(
        (f'<div class="country-kpi"><span>{esc(k["label"])}</span><strong>'
         + (f'<a class="value-link" href="{esc(k["href"])}">{esc(k["value"])}</a>' if k.get("href") else esc(k["value"]))
         + '</strong></div>')
        for k in d['kpis'])
    short_facts = ''.join(
        (f'<div class="fact-row"><span>{esc(f["label"])}</span><strong>'
         + (f'<a class="value-link" href="{esc(f["href"])}">{esc(f["value"])}</a>' if f.get("href") else esc(f["value"]))
         + '</strong></div>')
        for f in d['shortFacts'])
    worth = ''.join(f'<li><strong>{esc(w["title"])}</strong> {esc(w["text"])}</li>' for w in d['worthSeeing'])

    # location links: optional country card (image) + plain links
    loc = ''
    if d.get('countryCard'):
        cc = d['countryCard']
        loc += (f'<a class="visual-topic-card visual-topic-card--country" href="{esc(cc["href"])}">'
                f'{mini_img(cc["img"], cc["name"])}<strong>{esc(cc["name"])}</strong><span>Country</span></a>')
    # sibling-city image cards (e.g. Stockholm linked from Gothenburg)
    for c in d.get('cityCards', []):
        loc += (f'<a class="visual-topic-card visual-topic-card--city" href="{esc(c["href"])}">'
                f'{mini_img(c["img"], c["name"])}<strong>{esc(c["name"])}</strong><span>City</span></a>')
    loc += ''.join(
        f'<a class="country-path" href="{esc(l["href"])}"><span>{esc(l["kind"])}</span><strong>{esc(l["label"])}</strong></a>'
        for l in d.get('links', []))

    # Landmarks (attractions in the city). Cards link into the <city>/ subfolder.
    # Rendered only when the city has landmark data; the section is omitted otherwise
    # so it never shows an empty block (placeholder cities just have an empty list).
    landmarks = ''.join(
        f'<a class="visual-topic-card visual-topic-card--landmark" href="{esc(lm["href"])}">{mini_img(lm["img"], lm["name"])}<strong>{esc(lm["name"])}</strong><span>{esc(lm.get("kicker", "Landmark"))}</span></a>'
        for lm in d.get('landmarks', []))
    landmarks_block = (f'<div class="country-panel-card"><h2>Landmarks</h2>'
                       f'<div class="country-paths country-paths--topics">{landmarks}</div></div>'
                       if landmarks else '')

    qa = ''.join(f'<div><strong>{esc(q["q"])}</strong><span>{esc(q["a"])}</span></div>' for q in d['planningQuestions'])
    events = ''.join(
        f'<a class="visual-topic-card visual-topic-card--{esc(e["modifier"])}" href="{esc(e["href"])}">{mini_img(e["img"], e["title"])}<strong>{esc(e["title"])}</strong><span>{esc(e["meta"])}</span></a>'
        for e in d['events'])
    known = ''.join(f'<span>{esc(k)}</span>' for k in d['knownFor'])
    topics = ''.join(
        f'<a class="visual-topic-card visual-topic-card--{esc(t["modifier"])}" href="{esc(t["href"])}">{mini_img(t["img"], t["alt"])}<strong>{esc(t["title"])}</strong><span>{esc(t["text"])}</span></a>'
        for t in d['topicCards'])

    return f'''<!doctype html>
<html lang="en">
<head>
  <!-- OneSlider core v4 -->
  <link rel="stylesheet" href="{up}assets/css/oneslider-core.css">
  <link rel="preload" as="image" href="{hero_preload}">
<script defer src="{up}assets/js/oneslider-core.js"></script>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="twitter:description" content="{esc(seo['twitterDescription'])}">
  <meta name="twitter:title" content="{esc(seo['title'])}">
  <meta name="robots" content="index,follow">
  <meta name="twitter:card" content="summary_large_image">
  <meta property="og:type" content="website">
  <meta property="og:description" content="{esc(seo['description'])}">
  <meta property="og:title" content="{esc(seo['title'])}"><meta property="og:image" content="{DOMAIN}{hero}">
  <meta name="description" content="{esc(seo['description'])}">
  <meta property="og:url" content="{page_url}">
  <link rel="canonical" href="{page_url}"><meta name="content-language" content="en">
  <link rel="icon" href="{up}assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="{up}assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="{up}assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="{up}assets/icons/site.webmanifest">
  <link rel="stylesheet" href="{up}assets/css/locations.css?v=country-onepage-20260602-langmenu">
  <meta name="theme-color" content="#0d2137">
  <title>{esc(seo['title'])}</title>
  <script type="application/ld+json">{ldjson}</script>
</head>
<body class="country-onepage">
  {nav}
  <main class="page-shell country-slide country-content-box">
    <section class="country-brief" aria-label="{esc(name)} one-slide overview">
      <div class="country-brief__copy">
        <div class="country-hero-image country-hero-image--clear" style="--country-hero-url: {hero_url}" aria-hidden="true"></div>
        <img class="flag-badge" src="img/flag.svg" alt="{esc(country_name)} flag" width="1280" height="640" loading="lazy">
        <p class="kicker">{esc(d['kicker'])}</p>
        <h1 class="hero-title">{esc(name)}</h1>
        <p class="hero-text">{esc(d['heroText'])}</p>
        <div class="country-left-stack"><div class="country-panel-card country-history-card"><h2>City Snapshot</h2><div class="country-history-list">{snapshot}</div></div></div>
      </div>
      <div class="country-brief__panel">
        <div class="country-kpis">{kpis}</div>
        <section class="persona-tabs" aria-label="Choose {esc(name)} view">
          <input type="radio" name="{slug}-view" id="view-visit" checked>
          <input type="radio" name="{slug}-view" id="view-events">
          <input type="radio" name="{slug}-view" id="view-context">
          <div class="persona-tablist" role="tablist" aria-label="Choose {esc(name)} outcome">
            <label for="view-visit" role="tab">Plan a visit</label>
            <label for="view-events" role="tab">Find events</label>
            <label for="view-context" role="tab">Understand {esc(name)}</label>
          </div>
          <div class="persona-panel view-panel--visit">
            <div class="country-panel-card country-panel-card--split">
              <div><h2>Short facts</h2><div class="fact-table country-facts-tight">{short_facts}</div></div>
              <div><h2>Worth seeing</h2><ul class="country-points">{worth}</ul></div>
            </div>
            <div class="country-paths country-paths--location-links">{loc}</div>
            {landmarks_block}
            <div class="country-panel-card"><h2>Planning questions</h2><div class="country-qa-list">{qa}</div></div>
          </div>
          <div class="persona-panel view-panel--events">
            <div class="country-panel-card"><h2>Upcoming events</h2><div class="country-paths country-paths--events" data-expiring-events>{events}</div></div>
          </div>
          <div class="persona-panel view-panel--context">
            <div class="country-panel-card"><h2>Known for</h2><div class="country-identity-grid">{known}</div></div>
            <div class="country-paths country-paths--topics">{topics}</div>
          </div>
        </section>
      </div>
    </section>
  </main>
</body>
</html>
'''


# ==================================================================== extract
def U(s):
    import re
    s = s or ''
    for _ in range(3):
        n = H.unescape(s)
        if n == s:
            break
        s = n
    return re.sub(r'\s+', ' ', s).strip()


def extract(city_path):
    import re
    h = open(city_path, encoding='utf-8').read()
    # Collapse inter-tag whitespace so section regexes are robust to pretty-printed
    # source (the old city pages are indented; generated ones are not).
    h = re.sub(r'>\s+<', '><', h)
    p = city_path.replace('\\', '/').split('/')
    slug = os.path.splitext(p[-1])[0]
    country_slug = p[-2]
    cont = p[-3]
    relp = os.path.relpath(city_path, ROOT).replace('\\', '/')
    depth = len(relp.split('/')) - 1       # segments from root to file's dir; up=rel_prefix(depth)

    CONT_NAME = {'europe': 'Europe', 'asia': 'Asia', 'africa': 'Africa',
                 'north-america': 'North America', 'south-america': 'South America', 'oceania': 'Oceania'}

    def m1(pat, default=''):
        m = re.search(pat, h, re.S)
        return m.group(1) if m else default

    name = U(m1(r'<h1 class="hero-title">([^<]+)</h1>')) or slug.title()
    country_name = U(m1(r'<a class="nav-back"[^>]*title="Back to ([^"]+)"')) or country_slug.title()
    cont_name = CONT_NAME.get(cont, cont.title())

    seo = {'title': U(m1(r'<title>([^<]+)</title>')),
           'description': U(m1(r'<meta name="description" content="([^"]*)"')),
           'twitterDescription': U(m1(r'<meta name="twitter:description" content="([^"]*)"')),
           'webpageDescription': U(m1(r'"WebPage"[^}]*?"description":"([^"]*)"'))}
    if not seo['webpageDescription']:
        seo['webpageDescription'] = seo['twitterDescription']

    kicker = U(m1(r'<p class="kicker">([^<]*)</p>'))
    hero_text = U(m1(r'<p class="hero-text">([^<]*)</p>'))

    snapshot = [{'label': U(t), 'text': U(x)} for t, x in
                re.findall(r'<div><time>([^<]*)</time><span>([^<]*)</span></div>',
                           m1(r'<h2>City Snapshot</h2><div class="country-history-list">(.*?</span></div>)</div>'))]

    def kpi_list(block):
        out = []
        for mk in re.finditer(r'<div class="country-kpi"><span>([^<]*)</span><strong>(.*?)</strong></div>', block, re.S):
            label, val = U(mk.group(1)), mk.group(2)
            link = re.search(r'href="([^"]*)"', val)
            text = U(re.sub(r'<[^>]+>', '', val))
            item = {'label': label, 'value': text}
            if link:
                item['href'] = link.group(1)
            out.append(item)
        return out
    kpis = kpi_list(m1(r'<div class="country-kpis">(.*?)</div>\s*<section class="persona-tabs"'))

    short_facts = []
    for mf in re.finditer(r'<div class="fact-row"><span>([^<]*)</span><strong>(.*?)</strong></div>',
                          m1(r'<h2>Short facts</h2><div class="fact-table[^"]*">(.*?)</div>\s*</div>'), re.S):
        label, val = U(mf.group(1)), mf.group(2)
        link = re.search(r'href="([^"]*)"', val)
        item = {'label': label, 'value': U(re.sub(r'<[^>]+>', '', val))}
        if link:
            item['href'] = link.group(1)
        short_facts.append(item)

    worth = [{'title': U(a), 'text': U(b)} for a, b in
             re.findall(r'<li><strong>([^<]*)</strong>([^<]*)</li>',
                        m1(r'<h2>Worth seeing</h2><ul class="country-points">(.*?)</ul>'))]

    # location links: country card (image) + sibling-city image cards + plain links
    ll = m1(r'<div class="country-paths country-paths--location-links">(.*?)</div>\s*<div class="country-panel-card">')
    country_card = None
    mc = re.search(r'<a class="visual-topic-card visual-topic-card--country" href="([^"]*)"><img src="([^"]*)"[^>]*><strong>(?:Open )?([^<]*)</strong>', ll)
    if mc:
        country_card = {'href': mc.group(1), 'img': mc.group(2), 'name': U(mc.group(3))}
    # already-image city cards
    city_cards = [{'href': hr, 'img': img, 'name': U(nm)}
                  for hr, img, nm in re.findall(
                  r'<a class="visual-topic-card visual-topic-card--city" href="([^"]*)"><img src="([^"]*)"[^>]*><strong>(?:Open )?([^<]*)</strong>', ll)]
    links = []
    for hr, k, l in re.findall(r'<a class="country-path" href="([^"]*)"><span>([^<]*)</span><strong>([^<]*)</strong></a>', ll):
        k_u, l_u = U(k), U(l)
        # promote a city link to an image card when its -mini.png exists in the same dir
        is_city = k_u.lower() == 'city' or l_u.lower().startswith('open ')
        local = hr.endswith('.html') and '/' not in hr and hr != 'index.html'
        if is_city and local:
            cslug = hr[:-5]
            cname = l_u[5:].strip() if l_u.lower().startswith('open ') else cslug.replace('-', ' ').title()
            img = f"/content/locations/{cont}/{country_slug}/img/{cslug}-mini.png"
            if os.path.isfile(os.path.join(ROOT, img.lstrip('/'))):
                city_cards.append({'href': hr, 'img': img, 'name': cname})
                continue
        links.append({'kind': k_u, 'label': l_u, 'href': hr})
    # de-dup city cards by href
    seen = set(); city_cards = [c for c in city_cards if c['href'] not in seen and not seen.add(c['href'])]

    qa = [{'q': U(q), 'a': U(a)} for q, a in
          re.findall(r'<div><strong>([^<]*)</strong><span>([^<]*)</span></div>',
                     m1(r'<div class="country-qa-list">(.*?</span></div>)</div>'))]

    events = [{'modifier': U(mod), 'href': hr, 'img': img, 'title': U(t), 'meta': U(meta)}
              for mod, hr, img, t, meta in re.findall(
              r'<a class="visual-topic-card visual-topic-card--([^"]*)" href="([^"]*)"><img src="([^"]*)"[^>]*><strong>([^<]*)</strong><span>([^<]*)</span></a>',
              m1(r'data-expiring-events>(.*?)</div>\s*</div>'))]

    known = [U(s) for s in re.findall(r'<span>([^<]*)</span>',
             m1(r'<h2>Known for</h2><div class="country-identity-grid">(.*?)</div>'))]

    topics = [{'modifier': U(mod), 'href': hr, 'img': img, 'alt': U(alt), 'title': U(t), 'text': U(x)}
              for mod, hr, img, alt, t, x in re.findall(
              r'<a class="visual-topic-card visual-topic-card--([^"]*)" href="([^"]*)"><img src="([^"]*)" alt="([^"]*?) thumbnail"[^>]*><strong>([^<]*)</strong><span>([^<]*)</span></a>',
              m1(r'(<div class="country-paths country-paths--topics">.*?</div>)\s*</section>'))]

    # Landmarks: auto-detected from the <city>/ subfolder (sibling to this <city>.html).
    landmarks = []
    sub = os.path.join(os.path.dirname(city_path), slug)
    if os.path.isdir(sub):
        for lf in sorted(glob.glob(os.path.join(sub, '*.html'))):
            if os.path.basename(lf) == 'index.html':
                continue
            lslug = os.path.splitext(os.path.basename(lf))[0]
            lh = open(lf, encoding='utf-8').read()
            mn = re.search(r'<h1 class="hero-title">([^<]+)</h1>', lh)
            mk = re.search(r'<p class="kicker">([^<]*)</p>', lh)
            ln = U(mn.group(1)) if mn else lslug.replace('-', ' ').title()
            lk = U(mk.group(1)) if mk else 'Landmark'
            img = f"/content/locations/{cont}/{country_slug}/{slug}/img/{lslug}-mini.png"
            if not os.path.isfile(os.path.join(ROOT, img.lstrip('/'))):
                img = f"/content/locations/{cont}/{country_slug}/{slug}/img/{lslug}-hero.png"
            landmarks.append({'name': ln, 'kicker': lk, 'href': f'{slug}/{lslug}.html', 'img': img})

    return {
        'slug': slug, 'name': name, 'continent': cont, 'continentName': cont_name,
        'countrySlug': country_slug, 'countryName': country_name, 'depth': depth,
        'seo': seo, 'kicker': kicker, 'heroText': hero_text, 'snapshot': snapshot,
        'kpis': kpis, 'shortFacts': short_facts, 'worthSeeing': worth,
        'countryCard': country_card, 'cityCards': city_cards, 'links': links, 'planningQuestions': qa,
        'landmarks': landmarks,
        'events': events, 'knownFor': known, 'topicCards': topics,
    }


# ====================================================================== build
def write(path, text):
    import time
    for _ in range(5):
        try:
            with open(path, 'w', encoding='utf-8', newline='') as fh:
                fh.write(text)
            return True
        except OSError:
            time.sleep(0.3)
    return False


def build_city(city_path, extract_first=True):
    # Use .city.data.json so it never collides with the country's <slug>.data.json
    # (matters for city-states like monaco/monaco.html + monaco/index.html).
    data_path = os.path.splitext(city_path)[0] + '.city.data.json'
    if extract_first or not os.path.isfile(data_path):
        data = extract(city_path)
        write(data_path, json.dumps(data, ensure_ascii=False, indent=2))
    else:
        data = json.load(open(data_path, encoding='utf-8'))
    html = render(data)
    write(os.path.normpath(city_path), html)
    return data


def main(argv):
    if '--continent' in argv:
        cont = argv[argv.index('--continent') + 1]
        cities = [f for f in glob.glob(os.path.join(ROOT, f'content/locations/{cont}/*/*.html'))
                  if os.path.basename(f) != 'index.html']
        for c in cities:
            d = build_city(c)
            print(f"  {d['countrySlug']}/{d['slug']}: {len(d['snapshot'])}snap {len(d['events'])}ev {len(d['topicCards'])}topics")
        print(f"Built {len(cities)} city pages in {cont}.")
        return 0
    if not argv:
        print('Usage: build_city_page.py <city.html> | --continent <name>'); return 1
    t = argv[0] if os.path.isabs(argv[0]) else os.path.join(ROOT, argv[0])
    build_city(t)
    print('built', t)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
