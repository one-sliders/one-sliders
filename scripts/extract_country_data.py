#!/usr/bin/env python3
"""
extract_country_data.py  --  read an existing country index.html into <slug>.data.json

One-off migration helper: pulls the embedded data out of the old hand-built
country pages into the clean data model that build_country_page.py consumes.
Unescapes HTML entities to clean text (the template re-escapes once), which also
fixes pre-existing double-escaping like "&amp;amp;".

Usage:
  python scripts/extract_country_data.py content/locations/europe/norway
  python scripts/extract_country_data.py --continent europe
"""

import os, sys, re, json, glob, html as H

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CONT_NAME = {
    'europe': 'Europe', 'asia': 'Asia', 'africa': 'Africa',
    'north-america': 'North America', 'south-america': 'South America',
    'oceania': 'Oceania',
}


def U(s):
    """Unescape entities (repeatedly, to undo pre-existing double-encoding like
    &amp;amp;) and collapse whitespace to clean text."""
    s = s or ''
    for _ in range(3):
        new = H.unescape(s)
        if new == s:
            break
        s = new
    return re.sub(r'\s+', ' ', s).strip()


def m1(pat, h, default=''):
    m = re.search(pat, h, re.S)
    return m.group(1) if m else default


def extract(country_dir):
    f = os.path.join(country_dir, 'index.html')
    if not os.path.isfile(f):
        print('  no index.html in', country_dir); return None
    h = open(f, encoding='utf-8').read()

    parts = country_dir.replace('\\', '/').split('/')
    slug = parts[-1]
    cont = parts[-2]
    # depth = number of path segments from repo root to index.html.
    # content/locations/<cont>/<slug>/index.html -> 4
    rel = os.path.relpath(os.path.join(country_dir, 'index.html'), ROOT).replace('\\', '/')
    depth = len(rel.split('/')) - 1

    name = U(m1(r'<h1 class="hero-title">([^<]+)</h1>', h)) or slug.capitalize()
    cont_name = CONT_NAME.get(cont, cont.replace('-', ' ').title())

    seo = {
        'title': U(m1(r'<title>([^<]+)</title>', h)),
        'description': U(m1(r'<meta name="description" content="([^"]*)"', h)),
        'twitterDescription': U(m1(r'<meta name="twitter:description" content="([^"]*)"', h)),
        'webpageDescription': U(m1(r'"WebPage"[^}]*?"description":"([^"]*)"', h)),
    }
    if not seo['webpageDescription']:
        seo['webpageDescription'] = seo['twitterDescription']

    # KPIs
    capital = U(m1(r'<span>Capital</span><strong><a class="value-link" href="[^"]*">([^<]+)</a>', h))
    capital_link = m1(r'<span>Capital</span><strong><a class="value-link" href="([^"]*)"', h)
    kpis = {
        'capital': capital,
        'capitalLink': capital_link,
        'population': U(m1(r'<span>Population</span><strong>([^<]+)</strong>', h)),
        'area': U(m1(r'<span>Area</span><strong>([^<]+)</strong>', h)),
        'currency': U(m1(r'<span>Currency</span><strong>([^<]+)</strong>', h)),
    }

    # History
    history = [{'time': U(t), 'text': U(x)} for t, x in
               re.findall(r'<div><time>([^<]*)</time><span>([^<]*)</span></div>', h)]

    # Short facts
    short_facts = [{'label': U(l), 'value': U(v)} for l, v in
                   re.findall(r'<div class="fact-row"><span>([^<]*)</span><strong>([^<]*)</strong></div>', h)]

    # Worth seeing
    worth = []
    ws_block = m1(r'<h2>Worth seeing</h2><ul class="country-points">(.*?)</ul>', h)
    for strong, rest in re.findall(r'<li><strong>([^<]*)</strong>([^<]*)</li>', ws_block):
        worth.append({'title': U(strong), 'text': U(rest)})

    # Cities (image cards) + plain links live in the "Plan a visit" panel,
    # between the worth-seeing list and the Planning-questions card.
    cities, links = [], []
    visit_panel = m1(r'<div class="persona-panel view-panel--visit">(.*?)<div class="country-panel-card"><h2>Planning', h)
    for href, img, cname in re.findall(r'<a class="visual-topic-card visual-topic-card--city" href="([^"]*)"><img src="([^"]*)"[^>]*><strong>(?:Open )?([^<]*)</strong>', visit_panel):
        cities.append({'name': U(cname), 'href': href, 'img': img})
    for href, kind, label in re.findall(r'<a class="country-path" href="([^"]*)"><span>([^<]*)</span><strong>([^<]*)</strong></a>', visit_panel):
        kind_u, label_u = U(kind), U(label)
        # Promote a city link to an image card when its -mini.png exists.
        # (Old pages often listed cities as plain text links even though the
        # thumbnail was available.)
        is_city = kind_u.lower() == 'city' or label_u.lower().startswith('open ')
        local = href.endswith('.html') and '/' not in href      # same-country page
        if is_city and local:
            cslug = href[:-5]
            cname = label_u[5:].strip() if label_u.lower().startswith('open ') else cslug.replace('-', ' ').title()
            img = f"/content/locations/{cont}/{slug}/img/{cslug}-mini.png"
            if os.path.isfile(os.path.join(ROOT, img.lstrip('/'))):
                cities.append({'name': cname, 'href': href, 'img': img})
                continue
        links.append({'kind': kind_u, 'label': label_u, 'href': href})
    # Ensure the capital is reachable as a city card. Some old pages only linked
    # the capital from the KPI value (e.g. Norway -> Oslo), so it never appeared
    # as a city. If the capital links to a local city page that exists (with a
    # -mini image) and isn't already listed, add it.
    cap_href = capital_link or ''
    if (cap_href.endswith('.html') and '/' not in cap_href and cap_href != 'index.html'
            and not any(c['href'] == cap_href for c in cities)):
        cslug = cap_href[:-5]
        cfile = os.path.join(country_dir, cap_href)
        mini = f"/content/locations/{cont}/{slug}/img/{cslug}-mini.png"
        if os.path.isfile(cfile) and os.path.isfile(os.path.join(ROOT, mini.lstrip('/'))):
            cities.insert(0, {'name': capital or cslug.replace('-', ' ').title(),
                              'href': cap_href, 'img': mini})

    # de-dup
    seenc = set(); cities = [c for c in cities if c['href'] not in seenc and not seenc.add(c['href'])]
    seen = set(); links = [l for l in links if (l['href'], l['label']) not in seen and not seen.add((l['href'], l['label']))]

    # Planning questions — grab the qa-list inner, then each Q/A pair.
    # The list ends at the first "</div></div>" that closes the last item + the list.
    qa_block = m1(r'<div class="country-qa-list">(.*?</span></div>)</div>', h)
    qa = [{'q': U(q), 'a': U(a)} for q, a in
          re.findall(r'<div><strong>([^<]*)</strong><span>([^<]*)</span></div>', qa_block)]

    # Events
    events = []
    ev_block = m1(r'data-expiring-events>(.*?)</div></div>', h)
    for mod, dend, href, img, title, meta in re.findall(
            r'<a class="visual-topic-card visual-topic-card--([^"]*)" data-end="([^"]*)" href="([^"]*)"><img src="([^"]*)"[^>]*><strong>([^<]*)</strong><span>([^<]*)</span></a>', ev_block):
        events.append({'modifier': U(mod), 'dataEnd': dend, 'href': href, 'img': img,
                       'title': U(title), 'meta': U(meta)})
    empty_text = U(m1(r'<p class="country-empty">([^<]*)</p>', h)) or \
        f"No future {name}-linked events are active in the current dataset."

    # Food
    food = []
    food_block = m1(r'country-paths--food">(.*?)</div></div>', h)
    for href, img, title, label in re.findall(
            r'<a class="visual-topic-card visual-topic-card--food" href="([^"]*)"><img src="([^"]*)"[^>]*><strong>([^<]*)</strong><span>([^<]*)</span></a>', food_block):
        food.append({'href': href, 'img': img, 'title': U(title), 'label': U(label)})

    # Known for
    known = [U(s) for s in re.findall(r'<span>([^<]*)</span>',
             m1(r'<h2>Known for</h2><div class="country-identity-grid">(.*?)</div>', h))]

    # Topic cards (the non-food, non-event visual cards at the bottom)
    topics = []
    topic_block = m1(r'(<div class="country-paths country-paths--topics">.*?</div>)\s*</div>\s*</section>', h)
    for mod, href, img, alt, title, text in re.findall(
            r'<a class="visual-topic-card visual-topic-card--([^"]*)" href="([^"]*)"><img src="([^"]*)" alt="([^"]*?) thumbnail"[^>]*><strong>([^<]*)</strong><span>([^<]*)</span></a>', topic_block):
        topics.append({'modifier': U(mod), 'href': href, 'img': img,
                       'alt': U(alt), 'title': U(title), 'text': U(text)})

    data = {
        'slug': slug, 'name': name, 'continent': cont, 'continentName': cont_name,
        'depth': depth, 'seo': seo, 'kpis': kpis, 'history': history,
        'shortFacts': short_facts, 'worthSeeing': worth,
        'cities': cities, 'links': links, 'planningQuestions': qa,
        'events': events, 'eventsEmptyText': empty_text, 'food': food,
        'knownFor': known, 'topicCards': topics,
    }
    return data


def save(country_dir, data):
    out = os.path.normpath(os.path.join(country_dir, data['slug'] + '.data.json'))
    with open(out, 'w', encoding='utf-8', newline='') as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
    return out


def main(argv):
    if '--continent' in argv:
        cont = argv[argv.index('--continent') + 1]
        dirs = sorted({os.path.dirname(f) for f in
                       glob.glob(os.path.join(ROOT, f'content/locations/{cont}/*/index.html'))})
        ok = 0
        for d in dirs:
            data = extract(d)
            if data and data['name']:
                save(d, data); ok += 1
                print(f"  extracted {data['slug']}: {len(data['history'])}h {len(data['cities'])}cities "
                      f"{len(data['events'])}ev {len(data['food'])}food {len(data['topicCards'])}topics")
            else:
                print('  FAILED', d)
        print(f"Extracted {ok}/{len(dirs)} countries in {cont}.")
        return 0
    if not argv:
        print('Usage: extract_country_data.py <country_dir> | --continent <name>'); return 1
    target = argv[0] if os.path.isabs(argv[0]) else os.path.join(ROOT, argv[0])
    data = extract(target)
    if data:
        print(save(target, data))
        print(json.dumps({k: (len(v) if isinstance(v, list) else v) for k, v in data.items()
                          if k in ('name', 'history', 'cities', 'events', 'food', 'topicCards', 'knownFor')}, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
