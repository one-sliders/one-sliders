#!/usr/bin/env python3
"""
build_homepage.py  --  keep index.html in sync with the real content/ tree.

Per GIT-WORKFLOW.md Step 0. Computes everything from the live file tree:
  - stat cards: event / topic / place counts
  - two donut pie charts:
      1. Events grouped by category group (sport, culture, music, ...)
      2. Countries grouped by continent (africa, europe, asia, ...)

SVG donuts use presentation attributes + shared .slice-N / .dot-N palette classes
(defined once in index.html's stylesheet) — no inline colors.

Run:  python scripts/build_homepage.py            # writes index.html
      python scripts/build_homepage.py --report   # prints data, writes nothing
"""

import os, re, sys, glob, json
from datetime import datetime
from html import escape
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
INDEX = os.path.join(ROOT, 'index.html')
TEST_INDEX = os.path.join(ROOT, 'Templates', 'test', 'index.html')
FEATURED_JS = os.path.join(ROOT, 'assets', 'js', '4_featured-rotator.js')
TEST_FEATURED_JS = os.path.join(ROOT, 'Templates', 'test', 'assets', 'js', '4_featured-rotator.js')
HOME_JS = os.path.join(ROOT, 'assets', 'js', 'home.js')
TEST_HOME_JS = os.path.join(ROOT, 'Templates', 'test', 'assets', 'js', 'home.js')


FEATURED_SPECS = [
    ('sport/tennis/australian-open', 'australian-open.json'),
    ('sport/american-football/super-bowl', 'super-bowl.json'),
    ('sport/golf/masters-tournament', 'masters-tournament.json'),
    ('sport/cycling/tour-de-france', 'tour-de-france.json'),
    ('sport/tennis/us-open-tennis', 'us-open-tennis.json'),
    ('culture/food-drink/oktoberfest', 'oktoberfest.json'),
    ('sport/marathon/berlin-marathon', 'berlin-marathon.json'),
    ('culture/tradition/new-years-eve-copacabana', 'new-years-eve-copacabana.json'),
    ('technology/consumer-electronics/ces', 'ces.json'),
    ('culture/religion/christmas-midnight-mass-vatican', 'christmas-midnight-mass-vatican.json'),
]


def _event_iso_dates(data):
    graph = data.get('structuredData', {}).get('@graph', [])
    if isinstance(graph, dict):
        graph = [graph]
    node = next((x for x in graph if isinstance(x, dict) and x.get('startDate')), {})
    return node.get('startDate'), node.get('endDate') or node.get('startDate')


def curated_featured_events():
    out = []
    for key, filename in FEATURED_SPECS:
        parts = key.split('/')
        matches = glob.glob(os.path.join(ROOT, 'data', 'events', *parts[:-1], filename))
        if len(matches) != 1:
            raise RuntimeError(f'Featured event data missing or ambiguous: {key}')
        data_path = matches[0]
        with open(data_path, encoding='utf-8') as fh:
            data = json.load(fh)
        start, end = _event_iso_dates(data)
        image = data.get('heroImage')
        url = re.sub(r'^https?://[^/]+', '', data.get('canonicalUrl', ''))
        if not (start and end and re.fullmatch(r'\d{4}-\d{2}-\d{2}', start) and re.fullmatch(r'\d{4}-\d{2}-\d{2}', end)):
            raise RuntimeError(f'Featured event lacks ISO dates: {key}')
        if not url or not image or not os.path.isfile(os.path.join(ROOT, image.lstrip('/'))):
            raise RuntimeError(f'Featured event URL/image does not resolve: {key}')
        title = data.get('title') or data.get('h1')
        out.append({'startDate': start, 'endDate': end, 'title': re.sub(r'\s*\|\s*OneSliders\s*$', '', title), 'image': image, 'url': url})
    return out


def homepage_popular_event_card(data_path, href, image, fallback_title):
    """Render a popular event card from the event's canonical JSON data."""
    with open(os.path.join(ROOT, data_path), encoding='utf-8') as fh:
        data = json.load(fh)
    graph = data.get('structuredData', {}).get('@graph', [])
    if isinstance(graph, dict):
        graph = [graph]
    event = next((x for x in graph if isinstance(x, dict) and x.get('startDate')), {})
    start = event.get('startDate')
    end = event.get('endDate') or start
    dates = data.get('dates')
    if start and end:
        if not dates:
            start_dt = datetime.strptime(start, '%Y-%m-%d')
            end_dt = datetime.strptime(end, '%Y-%m-%d')
            if start_dt.month == end_dt.month:
                dates = f'{start_dt.day}–{end_dt.day} {start_dt.strftime("%b %Y")}'
            else:
                dates = f'{start_dt.day} {start_dt.strftime("%b %Y")}–{end_dt.day} {end_dt.strftime("%b %Y")}'
    elif not dates:
        # No structured date AND no human-readable fallback string — genuinely
        # nothing to show, so this event can't be a homepage pick.
        raise RuntimeError(f'Homepage event lacks any date info (structured or text): {data_path}')
    dates = dates.replace('\u00e2\u0080\u0093', '\u2013').replace('\ufffd', '\u2013')
    location = event.get('location', {})
    address = location.get('address', {}) if isinstance(location, dict) else {}
    title = data.get('title') or event.get('name') or fallback_title
    title = re.sub(r'\s*\|\s*OneSliders\s*$', '', title)
    country = data.get('country') or address.get('addressCountry') or ''
    country_url = data.get('countryUrl') or ''
    country_flag = data.get('countryFlag') or ''
    city = data.get('city') or address.get('addressLocality') or ''
    venue = data.get('venue') or location.get('name') or ''
    place = ', '.join(x for x in (venue, city) if x)
    country_link = ''
    if country and country_url and country_flag:
        country_link = (f'<span class="country-chip"><img src="{escape(country_flag)}" alt="" width="20" height="14">'
                        f'{escape(country)}</span>')
    return f'''<a class="node-card" href="{escape(href)}">
                <span class="node-card__media"><img src="{escape(image)}" alt="{escape(title)} event thumbnail" width="200" height="150" loading="lazy" decoding="async"><span class="card-tag">Event</span><img class="flag" src="{escape(country_flag)}" alt="" width="36" height="24"></span>
                <span class="node-card__body"><strong>{escape(title)}</strong><span>{escape(dates)}</span><span>{escape(place)}, {country_link}</span></span>
              </a>'''


# ----------------------------------------------------------------- live data
def count_events():
    files = glob.glob(os.path.join(ROOT, 'content/categories/**/events/*.html'), recursive=True)
    return [f for f in files if os.path.basename(f) != 'index.html']


def count_topics():
    files = glob.glob(os.path.join(ROOT, 'content/categories/**/*.html'), recursive=True)
    out = []
    for f in files:
        p = f.replace('\\', '/')
        if '/events/' in p or os.path.basename(p) == 'index.html':
            continue
        out.append(f)
    return out


def count_places():
    files = glob.glob(os.path.join(ROOT, 'content/locations/**/*.html'), recursive=True)
    return [f for f in files if os.path.isfile(f)]


def events_by_group():
    c = Counter()
    for f in count_events():
        grp = f.replace('\\', '/').split('/categories/')[1].split('/')[0]
        c[grp] += 1
    return c


def countries_by_continent():
    c = Counter()
    for f in glob.glob(os.path.join(ROOT, 'content/locations/*/*/index.html')):
        parts = f.replace('\\', '/').split('/locations/')[1].split('/')
        if len(parts) == 3 and parts[2] == 'index.html':
            c[parts[0]] += 1
    return c


def titlecase(seg):
    fix = {'north-america': 'North America', 'south-america': 'South America'}
    if seg in fix:
        return fix[seg]
    return ' '.join(w.capitalize() for w in seg.replace('-', ' ').split())


# ----------------------------------------------------------------- conic pie
# Categorical palette (matches the soft tone of the drinks recipe charts).
PALETTE = ['#0b8f68', '#2f6f92', '#e0a83b', '#c8553d',
           '#7a5cc7', '#3bb0a8', '#b0476b', '#6b7a52']


def pie_card(counts, title):
    """Return a chart-card with a CSS conic-gradient donut + legend, matching the
    drinks recipe-chart style. Slices in descending order; >8 buckets fold to 'Other'."""
    items = counts.most_common()
    if len(items) > 8:
        items = items[:7] + [('other', sum(v for _, v in items[7:]))]
    total = sum(v for _, v in items) or 1

    # Build conic-gradient stops: each slice spans [start%, end%] in one colour.
    stops = []
    acc = 0.0
    for i, (_, val) in enumerate(items):
        color = PALETTE[i % len(PALETTE)]
        start = acc / total * 100
        acc += val
        end = acc / total * 100
        stops.append(f'{color} {start:.2f}% {end:.2f}%')
    gradient = 'conic-gradient(' + ', '.join(stops) + ')'

    legend = ['<ul class="legend">']
    for i, (name, val) in enumerate(items):
        color = PALETTE[i % len(PALETTE)]
        pct = round(100 * val / total)
        legend.append(
            f'<li><i style="background:{color}"></i>'
            f'{titlecase(name)}'
            f'<span class="legend-val">{val} &middot; {pct}%</span></li>'
        )
    legend.append('</ul>')

    return (
        '<div class="chart-card">'
        f'<h2>{title}</h2>'
        '<div class="chart-body">'
        f'<div class="pie" role="img" aria-label="{title}: {total} total" '
        f'style="background:{gradient}"></div>'
        + ''.join(legend) +
        '</div></div>'
    )


# ----------------------------------------------------------------- index.html
def update_index(html, events, topics, places, charts_html):
    applied = {}

    # Keep the client-rendered daily sections wired to the stable home.js
    # mounting points while allowing the featured rotator to own its markup.
    # This is deliberately idempotent so rebuilding cannot silently remove the
    # daily content again.
    if 'id="today-featured"' not in html:
        marker = re.search(r'(<main\s+class="main-content"[^>]*>\s*<div class="main-stack">)', html)
        if marker:
            html = html[:marker.end()] + '\n          <div class="today-featured" id="today-featured">\n            <div class="today-col" id="today-col"></div>\n' + html[marker.end():]
            applied['today-featured'] = 1
    elif 'id="today-col"' not in html:
        html = html.replace('<div class="today-featured" id="today-featured">', '<div class="today-featured" id="today-featured">\n            <div class="today-col" id="today-col"></div>', 1)
        applied['today-col'] = 1

    if 'id="happening-now-grid"' not in html:
        happening = ('\n          <section id="happening-now" aria-labelledby="happening-now-title" hidden>\n'
                     '            <div class="section-head">\n'
                     '              <h2 id="happening-now-title">Happening now</h2>\n'
                     '            </div>\n'
                     '            <div id="happening-now-grid" class="happening-row"></div>\n'
                     '          </section>\n')
        anchor = re.search(r'(</div><!--\s*/\.today-featured\s*-->)', html)
        if anchor:
            html = html[:anchor.end()] + happening + html[anchor.end():]
            applied['happening-now'] = 1
    elif 'id="happening-now"' not in html:
        html = html.replace('<div id="happening-now-grid" class="happening-row"></div>',
                            '<div id="happening-now-grid" class="happening-row"></div>', 1)
        applied['happening-now'] = 0

    def stat_sub(label, value):
        nonlocal html
        pat = re.compile(
            r'(<strong>)\d[\d,]*(</strong><b>'
            + re.escape(label) + r'</b>)', re.I)
        html, n = pat.subn(lambda m: m.group(1) + f'{value:,}' + m.group(2), html, count=1)
        applied['stat:' + label] = n

    stat_sub('Event Guides', events)
    stat_sub('Place Guides', places)
    stat_sub('Topic Guides', topics)

    # charts block — replace strictly between the START/END markers so re-runs
    # are idempotent (never append duplicate cards).
    pat = re.compile(r'(<!--CHARTS:START-->).*?(<!--CHARTS:END-->)', re.S)
    new_block = '<!--CHARTS:START-->\n' + charts_html + '\n          <!--CHARTS:END-->'
    html, n = pat.subn(lambda m: new_block, html, count=1)
    applied['charts'] = n
    featured = curated_featured_events()
    featured_json = '<script type="application/json" id="featured-events">' + json.dumps(featured, ensure_ascii=False, separators=(',', ':')) + '</script>'
    html = re.sub(r'\s*<script type="application/json" id="featured-events">.*?</script>', '', html, flags=re.S)
    html = html.replace('</head>', '  ' + featured_json + '\n</head>', 1)
    html = re.sub(r'\s*<script defer src="/assets/js/4_featured-rotator\.js"></script>', '', html)
    html = html.replace('  <script defer src="/assets/js/home.js"></script>', '  <script defer src="/assets/js/home.js"></script>\n  <script defer src="/assets/js/4_featured-rotator.js"></script>', 1)
    # home.js reveals this section by clearing its inline display value.
    # Keep the PROD-compatible style instead of converting it to [hidden].
    html = re.sub(r'(<section id="happening-now"[^>]*)(?:\s+hidden|\s+style="display:none")',
                  r'\1 style="display:none"', html, count=1)
    article = '''<article class="featured-card">
              <div class="carousel-controls" aria-label="Featured guide controls">
                <button type="button" aria-label="Previous featured guide"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
                <button type="button" aria-label="Next featured guide"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>
              </div>
              <div class="carousel-dots" aria-hidden="true"></div>
              <div class="featured-slides" aria-live="polite"></div>
            </article>'''
    html, n = re.subn(r'<article class="featured-card">.*?</article>', article, html, count=1, flags=re.S)
    applied['featured'] = n

    popular_events = [
        ('data/events/sport/golf/ryder-cup.json',
         '/content/categories/sport/golf/events/ryder-cup.html#year-2027',
         '/content/categories/sport/golf/events/img/ryder-cup-mini-200.webp',
         'Ryder Cup'),
        ('data/events/music/song-contests/eurovision-song-contest.json',
         '/content/categories/music/song-contests/events/eurovision-song-contest.html',
         '/content/categories/music/song-contests/events/img/eurovision-song-contest-mini-200.webp',
         'Eurovision Song Contest'),
    ]
    for data_path, href, image, fallback_title in popular_events:
        card = homepage_popular_event_card(data_path, href, image, fallback_title)
        card_pattern = re.compile(r'<a class="node-card" href="' + re.escape(href) + r'">.*?</a>', re.S)
        html, n = card_pattern.subn(card, html, count=1)
        applied['popular:' + fallback_title] = n
    return html, applied


def build_test_page(html):
    """Emit the home test artifact on the numbered CSS stack."""
    style_match = re.search(r'<style>(.*?)</style>', html, re.S)
    css = (style_match.group(1) if style_match else open(
        os.path.join(ROOT, 'assets', 'css', 'home.css'), encoding='utf-8').read())
    css = re.sub(r'html\s*,\s*body\s*\{[^}]*\}', '', css)
    css = re.sub(r'\bbody\.home-page', '.home-page', css)
    css = re.sub(r'\.(node-card__body|today-card__body|happening-card__body)\s*\{',
                 lambda m: f'[class~="{m.group(1)}"]{{/* .{m.group(1)} */', css)
    dynamic_rules = []
    pie_index = 0
    swatch_index = 0

    def pie_class(match):
        nonlocal pie_index
        pie_index += 1
        dynamic_rules.append(f'.pie--{pie_index}' + '{background:' + match.group(1) + '}')
        return f'class="pie pie--{pie_index}"'

    def swatch_class(match):
        nonlocal swatch_index
        swatch_index += 1
        dynamic_rules.append(f'.legend-swatch--{swatch_index}' + '{background:' + match.group(1) + '}')
        return f'class="legend-swatch legend-swatch--{swatch_index}"'

    if style_match:
        html = html[:style_match.start()] + html[style_match.end():]
    html = re.sub(r'class="pie"\s+role="img"([^>]*?)\s+style="background:([^"]+)"',
                  lambda m: pie_class(type('M', (), {'group': lambda _, __: m.group(2)})()) + ' role="img"' + m.group(1), html)
    html = re.sub(r'<i\s+style="background:([^"]+)"></i>',
                  lambda m: '<i ' + swatch_class(m) + '></i>', html)
    html = re.sub(r'\s*<link[^>]+rel="stylesheet"[^>]*>', '', html)
    html = re.sub(r'\s*<script\b(?![^>]*type="(?:application/json|application/ld\+json)")[^>]*>[\s\S]*?</script>', '', html)
    # Dev lives at /Templates/test/. Keep internal homepage navigation inside
    # that tree instead of sending clicks to the QA root.
    html = html.replace('href="/"', 'href="./"')
    html = re.sub(r'href="/(?!https?://)([^\"]+)"', r'href="\1"', html)
    links = ('\n  <link rel="stylesheet" href="assets/css/oneslider-core.css">'
             '\n  <script defer src="assets/js/oneslider-core.js"></script>'
             '\n  <link rel="stylesheet" href="assets/css/1_colours.css">'
             '\n  <link rel="stylesheet" href="assets/css/1_typography.css">'
             '\n  <link rel="stylesheet" href="assets/css/1_core.css">'
             '\n  <link rel="stylesheet" href="assets/css/2_frame.css">'
             '\n  <link rel="stylesheet" href="assets/css/3_home.css">')
    links += ('\n  <script defer src="assets/js/home.js"></script>'
              '\n  <script defer src="assets/js/4_featured-rotator.js"></script>')
    html = re.sub(r'(<meta name="viewport"[^>]*>)', r'\1' + links, html, count=1)
    os.makedirs(os.path.dirname(TEST_INDEX), exist_ok=True)
    with open(os.path.join(ROOT, 'assets', 'css', '3_home.css'), 'w', encoding='utf-8', newline='') as fh:
        fh.write('/* Home-page components. Shared frame and primitives load upstream. */\n' + css + '\n' + '\n'.join(dynamic_rules) + '\n')
    with open(TEST_INDEX, 'w', encoding='utf-8', newline='') as fh:
        fh.write(html)
    os.makedirs(os.path.dirname(TEST_FEATURED_JS), exist_ok=True)
    # Dev may expose shared assets through a symlink. Never open that path for
    # writing when it resolves to the source file; doing so would truncate the
    # shared module before it can be loaded.
    if os.path.realpath(TEST_FEATURED_JS) != os.path.realpath(FEATURED_JS):
        with open(TEST_FEATURED_JS, 'w', encoding='utf-8', newline='') as fh:
            fh.write(open(FEATURED_JS, encoding='utf-8').read())
    if os.path.realpath(TEST_HOME_JS) != os.path.realpath(HOME_JS):
        with open(TEST_HOME_JS, 'w', encoding='utf-8', newline='') as fh:
            fh.write(open(HOME_JS, encoding='utf-8').read())
    return TEST_INDEX


def main(argv):
    ev_files, tp_files, pl_files = count_events(), count_topics(), count_places()
    events, topics, places = len(ev_files), len(tp_files), len(pl_files)
    ev_grp = events_by_group()
    co_cont = countries_by_continent()

    print(f"Live counts -> events: {events}  topics: {topics}  places: {places}")
    print("Events by category:", dict(ev_grp.most_common()))
    print("Countries by continent:", dict(co_cont.most_common()))

    chart1 = pie_card(ev_grp, 'Events by category')
    chart2 = pie_card(co_cont, 'Countries by continent')
    charts_html = '          ' + chart1 + '\n          ' + chart2

    html = open(INDEX, encoding='utf-8').read()
    new_html, applied = update_index(html, events, topics, places, charts_html)

    missed = [k for k, v in applied.items() if v == 0]
    if missed:
        print("WARNING: could not locate these slots in index.html:", ', '.join(missed))

    if '--report' in argv:
        print("(report mode: index.html not written)")
        return 0

    if '--test' in argv:
        print('Built home test:', build_test_page(new_html))
        return 0

    if new_html != html:
        with open(INDEX, 'w', encoding='utf-8', newline='') as fh:
            fh.write(new_html)
        print("index.html updated.")
    else:
        print("index.html already in sync (no change).")
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
