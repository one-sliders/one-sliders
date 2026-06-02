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

import os, re, sys, glob
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, 'index.html')


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

    def stat_sub(label, value):
        nonlocal html
        pat = re.compile(
            r'(<div class="stat"><strong>)\d[\d,]*(</strong><span>'
            + re.escape(label) + r'</span></div>)', re.I)
        html, n = pat.subn(lambda m: m.group(1) + f'{value:,}' + m.group(2), html, count=1)
        applied['stat:' + label] = n

    stat_sub('event pages', events)
    stat_sub('topic pages', topics)
    stat_sub('place pages', places)

    # charts block — replace strictly between the START/END markers so re-runs
    # are idempotent (never append duplicate cards).
    pat = re.compile(r'(<!--CHARTS:START-->).*?(<!--CHARTS:END-->)', re.S)
    new_block = '<!--CHARTS:START-->\n' + charts_html + '\n          <!--CHARTS:END-->'
    html, n = pat.subn(lambda m: new_block, html, count=1)
    applied['charts'] = n
    return html, applied


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

    if new_html != html:
        with open(INDEX, 'w', encoding='utf-8', newline='') as fh:
            fh.write(new_html)
        print("index.html updated.")
    else:
        print("index.html already in sync (no change).")
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
