#!/usr/bin/env python3
"""
build_country_page.py  --  ONE layout, many data files.

Proof-of-concept for the country-page template model:
  - a single layout lives HERE (in this generator)
  - each country has a <slug>.data.json with only its facts
  - this script stamps out the full static index.html (full HTML in source => SEO safe)

Usage:
  python scripts/build_country_page.py content/locations/europe/sweden
  python scripts/build_country_page.py --template-preview
  python scripts/build_country_page.py --all          # every */<country> with a *.data.json
"""

import os, sys, json, glob, html as H

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOMAIN = 'https://one-sliders.com'

# UI labels per language. These are the ONLY language-specific strings shared by
# every country page — translate ~25 strings once and all 197 countries get it.
LABELS = {
    'en': {
        'native': 'English', 'code': 'EN',
        'history': 'History', 'capital': 'Capital', 'population': 'Population',
        'area': 'Area', 'currency': 'Currency',
        'planVisit': 'Plan a visit', 'findEvents': 'Find events', 'understand': 'Understand {name}',
        'shortFacts': 'Short facts', 'worthSeeing': 'Worth seeing',
        'planningQuestions': 'Planning questions', 'upcomingEvents': 'Upcoming events',
        'foodDrink': 'Food &amp; drink', 'knownFor': 'Known for',
        'city': 'City', 'open': '{name}', 'browse': 'Browse', 'moreLocations': 'More locations',
        'topics': 'Topics', 'travelInterests': 'Travel interests',
        'backTo': 'Back to {cont}',
    },
    'ru': {
        'native': 'Русский', 'code': 'RU',
        'history': 'История', 'capital': 'Столица', 'population': 'Население',
        'area': 'Площадь', 'currency': 'Валюта',
        'planVisit': 'Планировать поездку', 'findEvents': 'Найти события', 'understand': 'Узнать о {name}',
        'shortFacts': 'Кратко о стране', 'worthSeeing': 'Стоит увидеть',
        'planningQuestions': 'Вопросы для планирования', 'upcomingEvents': 'Предстоящие события',
        'foodDrink': 'Еда и напитки', 'knownFor': 'Известна благодаря',
        'city': 'Город', 'open': '{name}', 'browse': 'Обзор', 'moreLocations': 'Другие места',
        'topics': 'Темы', 'travelInterests': 'Интересы для поездки',
        'backTo': 'Назад: {cont}',
    },
}


def localized(data, lang, key, default=None):
    """Pick a per-language value if the data provides one under data['i18n'][lang][key],
    otherwise fall back to the base (English) field data[key]."""
    i18n = data.get('i18n', {}).get(lang, {})
    if key in i18n:
        return i18n[key]
    return data.get(key, default)


def esc(s):
    # Match the existing pages: escape &, <, > and double-quote, but NOT apostrophe.
    return (str(s).replace('&', '&amp;').replace('<', '&lt;')
            .replace('>', '&gt;').replace('"', '&quot;'))


def esc_pre(s):
    # For values that already contain intended HTML entities (e.g. "Music &amp; Culture"):
    # leave them as-is for display text. Use the raw string.
    return str(s)


def rel_prefix(depth):
    return '../' * depth


def normalize_country_seo(seo, name):
    seo = dict(seo)
    stale_title = str(seo.get('title', '')).startswith('Sports Events in ')
    stale_description = 'sports events' in str(seo.get('webpageDescription', '')).lower()
    default_description = f"Explore {name} with key facts, linked cities, events, food and travel context."
    if stale_title or not seo.get('title'):
        seo['title'] = f"{name} travel, cities and events"
    if stale_description or not seo.get('description'):
        seo['description'] = f"{name} historical timeline, capital, population, events and travel context."
    if stale_description or not seo.get('twitterDescription'):
        seo['twitterDescription'] = default_description
    if stale_description or not seo.get('webpageDescription'):
        seo['webpageDescription'] = default_description
    return seo


def render(data, lang='en'):
    L = LABELS[lang]
    slug = data['slug']
    name = localized(data, lang, 'name', data['name'])
    cont = data['continent']
    cont_name = localized(data, lang, 'continentName', data['continentName'])
    depth = data['depth']
    langs = data.get('langs', ['en'])           # which language versions exist
    # English lives at content/...; other languages at <lang>/content/...
    lang_prefix = '' if lang == 'en' else lang + '/'
    extra = 0 if lang == 'en' else 1            # non-en pages are one folder deeper
    up = rel_prefix(depth + extra)              # to repo root for assets
    inc = rel_prefix(depth - 1 + extra)         # to content/ for in-site nav
    page_path = f"{lang_prefix}content/locations/{cont}/{slug}/index.html"
    page_url = f"{DOMAIN}/{page_path}"
    seo = data['seo']
    # SEO strings can be localized via data['i18n'][lang]['seo']
    seo = data.get('i18n', {}).get(lang, {}).get('seo', seo)
    seo = normalize_country_seo(seo, name)
    hero = f"/content/locations/{cont}/{slug}/img/{slug}-hero.png"

    def mini_img(src, alt, w=400, h=300, eager=False):
        """Responsive thumbnail: WebP srcset (-400/-200) + PNG fallback in src.
        Falls back gracefully if WebP variants don't exist (older pages)."""
        base = src[:-4] if src.endswith('.png') else src
        # Probe which webp widths exist on disk (relative to ROOT for absolute /content paths)
        def exists(p):
            return os.path.isfile(os.path.join(ROOT, p.lstrip('/'))) if p.startswith('/') else False
        srcset = []
        for ww in (200, 400):
            cand = f'{base}-{ww}.webp'
            if exists(cand):
                srcset.append(f'{cand} {ww}w')
        load = 'eager' if eager else 'lazy'
        srcset_attr = (f' srcset="{", ".join(srcset)}" sizes="(max-width:620px) 220px, 400px"'
                       if srcset else '')
        return (f'<img src="{esc(src)}"{srcset_attr} alt="{esc(alt)} thumbnail" '
                f'loading="{load}" width="{w}" height="{h}">')

    def alt_url(lg):
        # Absolute — used for hreflang (Google requires absolute URLs).
        lp = '' if lg == 'en' else lg + '/'
        return f"{DOMAIN}/{lp}content/locations/{cont}/{slug}/index.html"

    def alt_href(lg):
        # Relative — used for the clickable language switcher so it works both
        # locally (localhost) and live. `up` already points at the repo root.
        lp = '' if lg == 'en' else lg + '/'
        return f"{up}{lp}content/locations/{cont}/{slug}/index.html"

    # ---- JSON-LD graph ----
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
             "name": seo['title'], "description": seo['webpageDescription'], "inLanguage": lang,
             "image": f"{DOMAIN}{hero}",
             "breadcrumb": {"@id": f"{page_url}#breadcrumb"},
             "isPartOf": {"@id": f"{DOMAIN}/#website"}, "publisher": {"@id": f"{DOMAIN}/#organization"}},
            {"@type": "BreadcrumbList", "@id": f"{page_url}#breadcrumb", "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{DOMAIN}/"},
                {"@type": "ListItem", "position": 2, "name": "Locations", "item": f"{DOMAIN}/content/locations/index.html"},
                {"@type": "ListItem", "position": 3, "name": cont_name, "item": f"{DOMAIN}/content/locations/{cont}/index.html"},
                {"@type": "ListItem", "position": 4, "name": name, "item": page_url},
                {"@type": "ListItem", "position": 5, "name": seo['title'], "item": page_url},
            ]},
        ],
        "name": seo['title'], "description": seo['webpageDescription'],
    }
    ldjson = json.dumps(jsonld, ensure_ascii=False, separators=(',', ':'))

    # ---- hreflang alternates (only when more than one language exists) ----
    hreflang = ''
    if len(langs) > 1:
        alts = ''.join(f'<link rel="alternate" hreflang="{lg}" href="{alt_url(lg)}">' for lg in langs)
        alts += f'<link rel="alternate" hreflang="x-default" href="{alt_url("en")}">'
        hreflang = alts

    # ---- language switcher (globe icon + code/name rows, matches category pages) ----
    lang_switcher = ''
    if len(langs) > 1:
        globe = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
                 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
                 '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>'
                 '<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>')
        rows = ''.join(
            (f'<a href="#" aria-current="true"><span class="language-code">{LABELS[lg]["code"]}</span><span class="language-name">{LABELS[lg]["native"]}</span></a>'
             if lg == lang else
             f'<a href="{alt_href(lg)}"><span class="language-code">{LABELS[lg]["code"]}</span><span class="language-name">{LABELS[lg]["native"]}</span></a>')
            for lg in langs)
        lang_switcher = (
            f'<details class="event-language-menu">'
            f'<summary aria-label="Language">{globe}<span>{L["code"]}</span></summary>'
            f'<div class="event-language-list" aria-label="Language"><span>Language</span>{rows}</div>'
            f'</details>'
        )

    # ---- nav ----
    nav = (
        f'<nav class="top-menu" aria-label="Location navigation">'
        f'<a class="nav-icon" href="{inc}events/index.html" title="Events" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a>'
        f'<a class="nav-icon active" href="{inc}locations/index.html" title="World" aria-label="World"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>'
        f'<a class="nav-icon" href="{inc}categories/index.html" title="Categories" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a>'
        f'<span class="nav-spacer"></span>'
        f'{lang_switcher}'
        f'</nav>'
    )

    # ---- data-driven sections (free text via localized(), labels via L) ----
    kpis_d = localized(data, lang, 'kpis', data['kpis'])
    history = ''.join(
        f'<div><time>{esc(h["time"])}</time><span>{esc(h["text"])}</span></div>'
        for h in localized(data, lang, 'history', data['history']))
    kpis = (
        f'<div class="country-kpi"><span>{L["capital"]}</span><strong><a class="value-link" href="{esc(data["kpis"]["capitalLink"])}">{esc(kpis_d["capital"])}</a></strong></div>'
        f'<div class="country-kpi"><span>{L["population"]}</span><strong>{esc(kpis_d["population"])}</strong></div>'
        f'<div class="country-kpi"><span>{L["area"]}</span><strong>{esc(kpis_d["area"])}</strong></div>'
        f'<div class="country-kpi"><span>{L["currency"]}</span><strong>{esc(kpis_d["currency"])}</strong></div>'
    )
    short_facts = ''.join(
        f'<div class="fact-row"><span>{esc(f["label"])}</span><strong>{esc(f["value"])}</strong></div>'
        for f in localized(data, lang, 'shortFacts', data['shortFacts']))
    worth = ''.join(
        f'<li><strong>{esc(w["title"])}</strong> {esc(w["text"])}</li>'
        for w in localized(data, lang, 'worthSeeing', data['worthSeeing']))
    city_items = data.get('cities', [])
    def city_card(c):
        tags = c.get("tags") or ["city"]
        tags_attr = " data-city-tags=\"" + esc(" ".join(tags)) + "\""
        img = mini_img(c["img"], c["name"]) if c.get("img") else ""
        no_image_class = " visual-topic-card--no-image" if not c.get("img") else ""
        label = L["open"].format(name=esc(c["name"])) if c.get("href") else esc(c["name"])
        if c.get("href"):
            return (
                f'<a class="visual-topic-card visual-topic-card--city{no_image_class}" href="{esc(c["href"])}"{tags_attr}>'
                f'{img}<strong>{label}</strong><span>{L["city"]}</span></a>'
            )
        return (
            f'<span class="visual-topic-card visual-topic-card--city{no_image_class}"{tags_attr}>'
            f'{img}<strong>{label}</strong><span>{L["city"]}</span></span>'
        )

    cities = ''.join(city_card(c) for c in city_items)
    plain_links = ''.join(
        f'<a class="country-path" href="{esc(l["href"])}"><span>{esc(l["kind"])}</span><strong>{esc(l["label"])}</strong></a>'
        for l in localized(data, lang, 'links', data.get('links', [])))
    has_city_finder = bool(city_items)
    loc_links = cities if has_city_finder else cities + plain_links
    city_finder = ''
    city_grid_attrs = 'class="country-paths country-paths--location-links"'
    if has_city_finder and city_items:
        all_filters = [
            ('all', 'All'),
            ('beach', 'Beaches'),
            ('theme-parks', 'Theme parks'),
            ('mountains', 'Mountains'),
            ('wildlife', 'Wildlife'),
            ('music', 'Music'),
            ('sports', 'Sports'),
            ('outdoors', 'Outdoors'),
            ('culture', 'Culture'),
            ('food', 'Food'),
            ('nightlife', 'Nightlife'),
        ]
        available_tags = set()
        for c in city_items:
            for tag in c.get('tags', ['city']):
                available_tags.add(str(tag))
        filters = [
            (value, label) for value, label in all_filters
            if value == 'all' or value in available_tags
        ]
        filter_buttons = ''.join(
            f'<button class="country-city-filter{" is-active" if value == "all" else ""}" type="button" data-city-filter="{value}" aria-pressed="{"true" if value == "all" else "false"}">{label}</button>'
            for value, label in filters
        )
        finder_country = 'USA' if slug == 'usa' else data.get('name', 'Country')
        city_finder = (
            f'<div class="country-city-finder" data-city-finder>'
            f'<div class="country-city-finder__header"><h2>Find a city in {esc(finder_country)}</h2>'
            f'<label>Search<input type="search" data-city-search placeholder="City, region or activity"></label></div>'
            f'<div class="country-city-filters" aria-label="Filter {esc(finder_country)} cities by activity">{filter_buttons}</div>'
            f'<p class="country-city-count" data-city-count>Showing all cities</p></div>'
        )
        city_grid_attrs = 'class="country-paths country-paths--location-links" data-city-grid'
    qa = ''.join(
        f'<div><strong>{esc(q["q"])}</strong><span>{esc(q["a"])}</span></div>'
        for q in localized(data, lang, 'planningQuestions', data['planningQuestions']))
    events = ''.join(
        f'<a class="visual-topic-card visual-topic-card--{esc(e["modifier"])}" data-end="{esc(e["dataEnd"])}" href="{esc(e["href"])}">{mini_img(e["img"], e["title"])}<strong>{esc(e["title"])}</strong><span>{esc(e["meta"])}</span></a>'
        for e in localized(data, lang, 'events', data['events']))
    food = ''.join(
        f'<a class="visual-topic-card visual-topic-card--food" href="{esc(c["href"])}">{mini_img(c["img"], c["title"])}<strong>{esc(c["title"])}</strong><span>{esc(c["label"])}</span></a>'
        for c in localized(data, lang, 'food', data['food']))
    known = ''.join(f'<span>{esc(k)}</span>' for k in localized(data, lang, 'knownFor', data['knownFor']))
    topics = ''.join(
        f'<a class="visual-topic-card visual-topic-card--{esc(t["modifier"])}" href="{esc(t["href"])}">{mini_img(t["img"], t["alt"])}<strong>{esc(t["title"])}</strong><span>{esc(t["text"])}</span></a>'
        for t in localized(data, lang, 'topicCards', data['topicCards']))
    states = localized(data, lang, 'states', data.get('states', []))
    states_note = localized(data, lang, 'statesNote', data.get('statesNote', ''))
    states_flag_note = localized(data, lang, 'statesFlagNote', data.get('statesFlagNote', ''))
    states_block = ''
    if states:
        state_rows = ''.join(
            f'<tr><th scope="row">{esc(s["name"])}</th><td>{esc(s["abbr"])}</td><td>{esc(s["capital"])}</td><td>{esc(s["region"])}</td><td>{esc(s["admitted"])}</td><td>{esc(s["population2020"])}</td><td>{esc(s["nickname"])}</td></tr>'
            for s in states)
        states_block = (
            f'<div class="country-panel-card country-states-card"><h2>States &amp; federal district</h2>'
            f'<p class="country-state-note">{esc(states_note)}</p>'
            f'<p class="country-state-note country-state-note--flag">{esc(states_flag_note)}</p>'
            f'<div class="country-state-table-wrap" tabindex="0"><table class="country-state-table">'
            f'<thead><tr><th>State</th><th>Code</th><th>Capital</th><th>Region</th><th>Joined</th><th>2020 pop.</th><th>Nickname</th></tr></thead>'
            f'<tbody>{state_rows}</tbody></table></div></div>'
        )
    states_markup = f'\n            {states_block}' if states_block else ''
    empty_text = localized(data, lang, 'eventsEmptyText', data['eventsEmptyText'])

    # ---- hero image ----
    # Render as markup instead of inline CSS so maintained pages stay free of
    # style attributes.
    hero_base = f"/content/locations/{cont}/{slug}/img/{slug}-hero"
    def _has(p): return os.path.isfile(os.path.join(ROOT, p.lstrip('/')))
    hero_1200 = f'{hero_base}-1200.webp'
    hero_srcset = []
    for ww in (400, 768, 1200):
        cand = f'{hero_base}-{ww}.webp'
        if _has(cand):
            hero_srcset.append(f'{cand} {ww}w')
    hero_sizes = '(max-width: 720px) 100vw, 44vw'
    if _has(hero_1200):
        hero_preload = hero_1200
        source_srcset = ', '.join(hero_srcset) if hero_srcset else hero_1200
        img_srcset = f' srcset="{source_srcset}" sizes="{hero_sizes}"' if hero_srcset else ''
        hero_picture = f'<picture class="country-hero-image" aria-hidden="true"><source srcset="{source_srcset}" sizes="{hero_sizes}" type="image/webp"><img src="{hero}"{img_srcset} alt="" width="1200" height="630" loading="eager" decoding="async"></picture>'
    else:
        hero_preload = hero
        hero_picture = f'<picture class="country-hero-image" aria-hidden="true"><img src="{hero}" alt="" width="1200" height="630" loading="eager" decoding="async"></picture>'

    return f'''<!doctype html>
<html lang="{lang}">
<head>
  <!-- OneSlider core v4 -->
  <link rel="stylesheet" href="{up}assets/css/oneslider-core.css">
  <link rel="preload" as="image" href="{hero_preload}"{f' imagesrcset="{", ".join(hero_srcset)}" imagesizes="{hero_sizes}"' if hero_srcset else ''}>
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
  <link rel="canonical" href="{page_url}"><meta name="content-language" content="{lang}">{hreflang}
  <link rel="icon" href="{up}assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="{up}assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="{up}assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="{up}assets/icons/site.webmanifest">
  <link rel="stylesheet" href="{up}assets/css/locations.css?v=country-onepage-title-fix-20260614">
  <meta name="theme-color" content="#0d2137">
  <title>{esc(seo['title'])}</title>
</head>
<body class="country-onepage{' location-page--country-finder' if has_city_finder else ''}">
  {nav}
  <main class="page-shell country-slide country-content-box">
    <section class="country-brief" aria-label="{esc(name)} one-slide overview">
      <div class="country-brief__copy">
        {hero_picture}
        <img class="flag-badge" src="img/flag.svg" alt="{esc(name)} flag" width="1600" height="1000" loading="lazy">
        <h1 class="hero-title">{esc(name)}</h1>
        <div class="country-left-stack"><div class="country-panel-card country-history-card"><h2>{L["history"]}</h2><div class="country-history-list">{history}</div></div><a class="location-parent-card" href="../index.html" aria-label="Go up to {esc(cont_name)}"><img src="/content/locations/{cont}/img/{cont}-mini.png" srcset="/content/locations/{cont}/img/{cont}-mini-200.webp 200w, /content/locations/{cont}/img/{cont}-mini-400.webp 400w" sizes="136px" alt="{esc(cont_name)} thumbnail" loading="lazy" width="400" height="300"><span>Part of</span><strong>{esc(cont_name)}</strong><em>More countries, cities and routes.</em></a></div>
      </div>
      <div class="country-brief__panel">
        <div class="country-kpis">{kpis}</div>
        <section class="persona-tabs" aria-label="Choose {esc(name)} view">
          <input type="radio" name="{slug}-view" id="view-visit" checked>
          <input type="radio" name="{slug}-view" id="view-events">
          <input type="radio" name="{slug}-view" id="view-context">
          <div class="persona-tablist" role="tablist" aria-label="Choose {esc(name)} outcome">
            <label for="view-visit" role="tab">{L["planVisit"]}</label>
            <label for="view-events" role="tab">{L["findEvents"]}</label>
            <label for="view-context" role="tab">{L["understand"].format(name=esc(name))}</label>
          </div>
          <div class="persona-panel view-panel--visit">
            <div class="country-panel-card country-panel-card--split">
              <div><h2>{L["shortFacts"]}</h2><div class="fact-table country-facts-tight">{short_facts}</div></div>
              <div><h2>{L["worthSeeing"]}</h2><ul class="country-points">{worth}</ul></div>
            </div>
            {city_finder}<div {city_grid_attrs}>{loc_links}</div>
            <div class="country-panel-card"><h2>{L["planningQuestions"]}</h2><div class="country-qa-list">{qa}</div></div>
          </div>
          <div class="persona-panel view-panel--events">
            <div class="country-panel-card"><h2>{L["upcomingEvents"]}</h2><div class="country-paths country-paths--events" data-expiring-events>{events}<p class="country-empty">{esc(empty_text)}</p></div></div>
          </div>
          <div class="persona-panel view-panel--context">{states_markup}
            <div class="country-panel-card country-panel-card--food"><h2>{L["foodDrink"]}</h2><div class="country-paths country-paths--topics country-paths--food">{food}</div></div>
            <div class="country-panel-card"><h2>{L["knownFor"]}</h2><div class="country-identity-grid">{known}</div></div>
            <div class="country-paths country-paths--topics">{topics}</div>
          </div>
        </section>
      </div>
    </section></main>
  <footer class="footer">&copy; 2026 <a href="https://3dfractal.no/">3D Fractal</a>.</footer>
</body>
</html>
'''


def output_path(data, lang):
    """Where the generated index.html goes for a given language.
    en -> content/locations/<cont>/<slug>/index.html
    xx -> xx/content/locations/<cont>/<slug>/index.html"""
    cont, slug = data['continent'], data['slug']
    base = '' if lang == 'en' else lang + os.sep
    return os.path.normpath(os.path.join(
        ROOT, base + os.path.join('content', 'locations', cont, slug, 'index.html')))


def write(path, text):
    import time
    os.makedirs(os.path.dirname(path), exist_ok=True)
    for _ in range(5):
        try:
            with open(path, 'w', encoding='utf-8', newline='') as fh:
                fh.write(text)
            return True
        except OSError:
            time.sleep(0.3)
    return False


def template_preview_data():
    data_path = os.path.join(
        ROOT, 'content', 'locations', 'north-america', 'usa', 'usa.data.json')
    data = json.load(open(data_path, encoding='utf-8'))
    data = json.loads(json.dumps(data))
    data['depth'] = 2
    data['seo'] = {
        'title': 'Country Page Template Preview',
        'description': 'Generated preview for the generic OneSliders country page template, based on the USA layout.',
        'twitterDescription': 'Generated preview for the generic OneSliders country page template.',
        'webpageDescription': 'Generated preview for the generic OneSliders country page template.',
    }
    return data


def make_tmp_preview_html(html):
    html = html.replace(
        '<body class="country-onepage location-page--country-finder">',
        '<body class="country-onepage location-page--country-finder country-page--template-preview">'
    )
    html = html.replace(
        '<body class="country-onepage">',
        '<body class="country-onepage country-page--template-preview">'
    )
    replacements = (
        ('href="/', 'href="../../'),
        ('src="/', 'src="../../'),
        ('srcset="/', 'srcset="../../'),
        (', /', ', ../../'),
        ('href="../events/index.html"', 'href="../../content/events/index.html"'),
        ('href="../locations/index.html"', 'href="../../content/locations/index.html"'),
        ('href="../categories/index.html"', 'href="../../content/categories/index.html"'),
        ('href="../index.html"', 'href="../../content/locations/north-america/index.html"'),
        ('href="washington-dc.html"', 'href="../../content/locations/north-america/usa/washington-dc.html"'),
        ('href="new-york.html"', 'href="../../content/locations/north-america/usa/new-york.html"'),
        ('href="las-vegas.html"', 'href="../../content/locations/north-america/usa/las-vegas.html"'),
        ('href="orlando.html"', 'href="../../content/locations/north-america/usa/orlando.html"'),
        ('href="miami.html"', 'href="../../content/locations/north-america/usa/miami.html"'),
        ('href="los-angeles.html"', 'href="../../content/locations/north-america/usa/los-angeles.html"'),
        ('href="san-francisco.html"', 'href="../../content/locations/north-america/usa/san-francisco.html"'),
        ('href="honolulu.html"', 'href="../../content/locations/north-america/usa/honolulu.html"'),
        ('href="new-orleans.html"', 'href="../../content/locations/north-america/usa/new-orleans.html"'),
        ('href="nashville.html"', 'href="../../content/locations/north-america/usa/nashville.html"'),
        ('href="chicago.html"', 'href="../../content/locations/north-america/usa/chicago.html"'),
        ('href="boston.html"', 'href="../../content/locations/north-america/usa/boston.html"'),
        ('href="seattle.html"', 'href="../../content/locations/north-america/usa/seattle.html"'),
        ('href="austin.html"', 'href="../../content/locations/north-america/usa/austin.html"'),
        ('href="augusta.html"', 'href="../../content/locations/north-america/usa/augusta.html"'),
        ('href="black-rock-city.html"', 'href="../../content/locations/north-america/usa/black-rock-city.html"'),
        ('href="charleston.html"', 'href="../../content/locations/north-america/usa/charleston.html"'),
        ('href="savannah.html"', 'href="../../content/locations/north-america/usa/savannah.html"'),
        ('href="santa-fe.html"', 'href="../../content/locations/north-america/usa/santa-fe.html"'),
        ('href="aspen.html"', 'href="../../content/locations/north-america/usa/aspen.html"'),
        ('href="key-west.html"', 'href="../../content/locations/north-america/usa/key-west.html"'),
        ('href="sedona.html"', 'href="../../content/locations/north-america/usa/sedona.html"'),
        ('href="jackson.html"', 'href="../../content/locations/north-america/usa/jackson.html"'),
        ('href="portland-maine.html"', 'href="../../content/locations/north-america/usa/portland-maine.html"'),
        ('href="newport.html"', 'href="../../content/locations/north-america/usa/newport.html"'),
        ('href="east-hampton.html"', 'href="../../content/locations/north-america/usa/east-hampton.html"'),
        ('href="southampton.html"', 'href="../../content/locations/north-america/usa/southampton.html"'),
        ('href="montauk.html"', 'href="../../content/locations/north-america/usa/montauk.html"'),
        ('src="img/flag.svg"', 'src="../../content/locations/north-america/usa/img/flag.svg"'),
        ('urlTemplate":"https://one-sliders.com/', 'urlTemplate":"../../'),
    )
    for old, new in replacements:
        html = html.replace(old, new)
    return html


def build_template_preview():
    data = template_preview_data()
    html = render(data, 'en')
    template_path = os.path.join(ROOT, 'scripts', 'templates', 'country-page-template.html')
    preview_path = os.path.join(ROOT, 'tmp', 'country-template-preview', 'index.html')
    write(template_path, html)
    write(preview_path, make_tmp_preview_html(html))
    return template_path, preview_path


def build_one(country_dir):
    slug = os.path.basename(country_dir.rstrip('/\\'))
    # Country data is <slug>.data.json; exclude city files (*.city.data.json).
    preferred = os.path.join(country_dir, slug + '.data.json')
    if os.path.isfile(preferred):
        data_files = [preferred]
    else:
        data_files = [f for f in glob.glob(os.path.join(country_dir, '*.data.json'))
                      if not f.endswith('.city.data.json')]
    if not data_files:
        print('  no country *.data.json in', country_dir); return False
    data = json.load(open(data_files[0], encoding='utf-8'))
    langs = data.get('langs', ['en'])
    for lang in langs:
        if lang not in LABELS:
            print('  no LABELS for lang', lang, '- skipping'); continue
        out = output_path(data, lang)
        os.makedirs(os.path.dirname(out), exist_ok=True)
        html = render(data, lang)
        import time
        for attempt in range(5):
            try:
                with open(out, 'w', encoding='utf-8', newline='') as fh:
                    fh.write(html)
                break
            except OSError:
                time.sleep(0.3)
        else:
            print('  SKIP (write failed):', out); continue
        print('  built', out)
    return True


def main(argv):
    if '--template-preview' in argv:
        template_path, preview_path = build_template_preview()
        print(f"Built country template: {template_path}")
        print(f"Built country template preview: {preview_path}")
        return 0
    if '--continent' in argv:
        cont = argv[argv.index('--continent') + 1]
        dirs = sorted({os.path.dirname(f) for f in
                       glob.glob(os.path.join(ROOT, f'content/locations/{cont}/*/index.html'))})
        n = sum(1 for d in dirs if build_one(d))
        print(f'Built {n} country pages in {cont}.')
        return 0
    if '--all' in argv:
        dirs = sorted({os.path.dirname(f) for f in glob.glob(os.path.join(ROOT, 'content/locations/*/*/*.data.json'))})
        for d in dirs:
            build_one(d)
        print(f'Built {len(dirs)} country pages.')
        return 0
    if not argv:
        print('Usage: build_country_page.py <country_dir> | --all'); return 1
    target = argv[0]
    if not os.path.isabs(target):
        target = os.path.join(ROOT, target)
    build_one(target)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
