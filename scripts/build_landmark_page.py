#!/usr/bin/env python3
"""
build_landmark_page.py  --  template + data for LANDMARK pages (attractions in a city).

These pages (e.g. norway/oslo/akershus-fortress.html) are a third tier below cities.
Old versions were noindex with a circular meta-refresh; this rebuilds them as real,
indexable pages: hero-card + Snapshot fact-table + "Why It Matters" note, with
full SEO and responsive WebP (hero image-set).

Usage:
  python scripts/build_landmark_page.py <path/to/landmark.html>
  python scripts/build_landmark_page.py --continent europe
"""

import os, sys, json, glob, re, html as H

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOMAIN = 'https://one-sliders.com'
CONT_NAME = {'europe': 'Europe', 'asia': 'Asia', 'africa': 'Africa',
             'north-america': 'North America', 'south-america': 'South America', 'oceania': 'Oceania'}


def esc(s):
    return (str(s).replace('&', '&amp;').replace('<', '&lt;')
            .replace('>', '&gt;').replace('"', '&quot;'))


def U(s):
    s = s or ''
    for _ in range(3):
        n = H.unescape(s)
        if n == s:
            break
        s = n
    return re.sub(r'\s+', ' ', s).strip()


def rel_prefix(n):
    return '../' * n


# ===================================================================== render
def render(d):
    slug = d['slug']
    name = d['name']
    cont, country_slug, city_slug = d['continent'], d['countrySlug'], d['citySlug']
    cont_name, country_name, city_name = d['continentName'], d['countryName'], d['cityName']
    depth = d['depth']
    up = rel_prefix(depth)
    inc = rel_prefix(depth - 1)
    page_url = f"{DOMAIN}/content/locations/{cont}/{country_slug}/{city_slug}/{slug}.html"
    seo = d['seo']
    img_base = f"/content/locations/{cont}/{country_slug}/{city_slug}/img"
    hero = f"{img_base}/{slug}-hero.png"

    def _has(p): return os.path.isfile(os.path.join(ROOT, p.lstrip('/')))
    hero_1200 = f"{img_base}/{slug}-hero-1200.webp"
    if _has(hero_1200):
        hero_img = (f"image-set(url('{hero_1200}') type('image/webp'), "
                    f"url('{hero}') type('image/png'))")
        hero_preload = hero_1200
    else:
        hero_img = f"url('{hero}')"
        hero_preload = hero

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
             "name": seo['title'], "description": seo['description'], "inLanguage": "en",
             "image": f"{DOMAIN}{hero}", "breadcrumb": {"@id": f"{page_url}#breadcrumb"},
             "isPartOf": {"@id": f"{DOMAIN}/#website"}, "publisher": {"@id": f"{DOMAIN}/#organization"}},
            {"@type": "TouristAttraction", "@id": f"{page_url}#attraction", "name": name,
             "description": seo['description'], "image": f"{DOMAIN}{hero}",
             "address": {"@type": "PostalAddress", "addressLocality": city_name, "addressCountry": country_name}},
            {"@type": "BreadcrumbList", "@id": f"{page_url}#breadcrumb", "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{DOMAIN}/"},
                {"@type": "ListItem", "position": 2, "name": "Locations", "item": f"{DOMAIN}/content/locations/index.html"},
                {"@type": "ListItem", "position": 3, "name": cont_name, "item": f"{DOMAIN}/content/locations/{cont}/index.html"},
                {"@type": "ListItem", "position": 4, "name": country_name, "item": f"{DOMAIN}/content/locations/{cont}/{country_slug}/index.html"},
                {"@type": "ListItem", "position": 5, "name": city_name, "item": f"{DOMAIN}/content/locations/{cont}/{country_slug}/{city_slug}/index.html"},
                {"@type": "ListItem", "position": 6, "name": name, "item": page_url},
            ]},
        ],
        "name": seo['title'], "description": seo['description'],
    }
    ldjson = json.dumps(jsonld, ensure_ascii=False, separators=(',', ':'))

    facts = ''.join(f'<div class="fact-row"><span>{esc(f["label"])}</span><strong>{esc(f["value"])}</strong></div>'
                    for f in d['snapshot'])
    hero_style = ("background-image:linear-gradient(180deg,rgba(5,15,24,.04),rgba(5,15,24,.58)),"
                  "linear-gradient(90deg,rgba(5,15,24,.58),rgba(5,15,24,.12) 66%)," + hero_img)

    return f'''<!doctype html>
<html lang="en">
<head>
  <!-- OneSlider core v4 -->
  <link rel="stylesheet" href="{up}assets/css/oneslider-core.css">
  <link rel="preload" as="image" href="{hero_preload}">
<script defer src="{up}assets/js/oneslider-core.js"></script>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="index,follow">
  <meta name="twitter:card" content="summary_large_image">
  <meta property="og:type" content="website">
  <meta property="og:description" content="{esc(seo['description'])}">
  <meta property="og:title" content="{esc(seo['title'])}">
  <meta property="og:image" content="{DOMAIN}{hero}">
  <meta property="og:url" content="{page_url}">
  <meta name="twitter:title" content="{esc(seo['title'])}">
  <meta name="twitter:description" content="{esc(seo['description'])}">
  <meta name="twitter:image" content="{DOMAIN}{hero}">
  <meta name="description" content="{esc(seo['description'])}">
  <link rel="canonical" href="{page_url}"><meta name="content-language" content="en">
  <link rel="icon" href="{up}assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="{up}assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="{up}assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="{up}assets/icons/site.webmanifest">
  <link rel="stylesheet" href="{up}assets/css/oneslider-mockup.css">
  <meta name="theme-color" content="#0d2137">
  <title>{esc(seo['title'])}</title>
  <script type="application/ld+json">{ldjson}</script>
</head>
<body>
  <nav class="top-menu">
    <a class="nav-icon" href="{inc}events/index.html" title="Events" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a>
    <a class="nav-icon" href="{inc}locations/index.html" title="World" aria-label="World"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>
    <a class="nav-icon" href="{inc}categories/index.html" title="Categories" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a>
    <span class="nav-divider"></span>
    <a class="nav-back" href="index.html" title="Back to {esc(city_name)}" aria-label="Back to {esc(city_name)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg><span>{esc(city_name)}</span></a>
    <a class="nav-pill active" aria-current="page" href="{slug}.html">{esc(name)}</a>
  </nav>
  <main class="page-shell">
    <section class="hero-card" style="{hero_style}"><div class="hero-inner"><div class="hero-copy"><p class="kicker">{esc(d['kicker'])}</p><h1 class="hero-title">{esc(name)}</h1><p class="hero-text">{esc(d['heroText'])}</p></div></div></section>
    <section class="dashboard-grid"><article class="card span-6"><h2 class="card-title">Snapshot</h2><div class="fact-table">{facts}</div></article><article class="card span-6"><h2 class="card-title">{esc(d['whyTitle'])}</h2><p class="note">{esc(d['whyText'])}</p></article></section>
  </main>
</body>
</html>
'''


# ==================================================================== extract
def extract(path):
    h = open(path, encoding='utf-8').read()
    h = re.sub(r'>\s+<', '><', h)
    p = path.replace('\\', '/').split('/')
    slug = os.path.splitext(p[-1])[0]
    city_slug, country_slug, cont = p[-2], p[-3], p[-4]
    relp = os.path.relpath(path, ROOT).replace('\\', '/')
    depth = len(relp.split('/')) - 1

    def m1(pat, dflt=''):
        m = re.search(pat, h, re.S)
        return m.group(1) if m else dflt

    name = U(m1(r'<h1 class="hero-title">([^<]+)</h1>')) or slug.replace('-', ' ').title()
    city_name = U(m1(r'nav-back"[^>]*title="Back to ([^"]+)"')) or city_slug.replace('-', ' ').title()
    country_name = country_slug.replace('-', ' ').title()
    cont_name = CONT_NAME.get(cont, cont.title())
    kicker = U(m1(r'<p class="kicker">([^<]*)</p>'))
    hero_text = U(m1(r'<p class="hero-text">([^<]*)</p>'))
    snapshot = [{'label': U(a), 'value': U(b)} for a, b in
                re.findall(r'<div class="fact-row"><span>([^<]*)</span><strong>([^<]*)</strong></div>', h)]
    cards = re.findall(r'<h2 class="card-title">([^<]+)</h2>', h)
    why_title = U(cards[1]) if len(cards) > 1 else 'Why It Matters'
    why_text = U(m1(r'<p class="note">([^<]+)</p>'))

    # Clean SEO description (the old one had "...Snapshot Type..." dump); use hero text.
    desc = hero_text or f"{name} in {city_name}, {country_name}."
    seo = {'title': name, 'description': desc}

    return {
        'slug': slug, 'name': name, 'continent': cont, 'continentName': cont_name,
        'countrySlug': country_slug, 'countryName': country_name,
        'citySlug': city_slug, 'cityName': city_name, 'depth': depth,
        'seo': seo, 'kicker': kicker, 'heroText': hero_text,
        'snapshot': snapshot, 'whyTitle': why_title, 'whyText': why_text,
    }


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


def build(path):
    data = extract(path)
    write(os.path.splitext(path)[0] + '.landmark.data.json',
          json.dumps(data, ensure_ascii=False, indent=2))
    write(os.path.normpath(path), render(data))
    return data


def is_landmark(path):
    """A landmark is a city sub-page: content/locations/<c>/<country>/<city>/<x>.html"""
    rel = os.path.relpath(path, ROOT).replace('\\', '/').split('/')
    return (len(rel) == 6 and rel[0] == 'content' and rel[1] == 'locations'
            and os.path.basename(path) != 'index.html')


def main(argv):
    if '--continent' in argv:
        cont = argv[argv.index('--continent') + 1]
        paths = [f for f in glob.glob(os.path.join(ROOT, f'content/locations/{cont}/*/*/*.html'))
                 if is_landmark(f)]
        for f in paths:
            d = build(f)
            print(f"  {d['citySlug']}/{d['slug']}: {len(d['snapshot'])} facts")
        print(f"Built {len(paths)} landmark pages in {cont}.")
        return 0
    if not argv:
        print('Usage: build_landmark_page.py <landmark.html> | --continent <name>'); return 1
    t = argv[0] if os.path.isabs(argv[0]) else os.path.join(ROOT, argv[0])
    build(t)
    print('built', t)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
