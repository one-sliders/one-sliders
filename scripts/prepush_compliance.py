#!/usr/bin/env python3
"""
prepush_compliance.py  --  OneSliders pre-push compliance gate.

When the user says "push all changes" this script runs first. It does NOT block:
for every changed/added HTML page it AUTO-FIXES the page to compliance, then the
normal git push happens (see GIT-WORKFLOW.md).

Two compliance dimensions:
  1. Responsive / iPhone-iPad-PC: viewport meta present; no dev-only layout overrides left on.
  2. SEO that represents the page content: title, description, canonical, og:*, twitter,
     content-language, and JSON-LD whose event facts come from the page's own
     `event-year-data` block (never invented).

Modes:
  (default)        operate on git-changed HTML pages only
  --all            operate on every HTML page in content/ + root pages
  --report         do not write; just print the coverage table
  --paths a b c    operate on an explicit list of files

Exit code is always 0 (gate never blocks). Pages it cannot fully resolve are listed
under "MANUAL REVIEW" for a human to finish.

Consolidates the throwaway tmp/ scripts proven during the 2026-06 QA session:
  fix_seo_gaps, fix_schema, fix_titles, enrich_category_heads, fix_json_escape,
  content_seo_analysis / analysis_split.
"""

import os, re, sys, json, glob, html as H, datetime, subprocess

# Windows consoles default to cp1252 and choke on non-Latin page names; force UTF-8 output.
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOMAIN = 'https://one-sliders.com'

EXCLUDE_DIR_PARTS = {'tmp', 'topics', 'docs', '.claude', '.git', 'node_modules', '__pycache__'}
ROOT_PAGES = ['index.html', 'privacy.html', 'terms.html']

EYD_RE = re.compile(r'<script type="application/json" id="event-year-data">(.*?)</script>', re.S)
LD_RE  = re.compile(r'(<script type="application/ld\+json">)(.*?)(</script>)', re.S)


# --------------------------------------------------------------------------- utils
def rel(path):
    return os.path.relpath(path, ROOT).replace('\\', '/')


def excluded(path):
    parts = rel(path).split('/')
    return any(p in EXCLUDE_DIR_PARTS for p in parts)


def read(path):
    with open(path, encoding='utf-8') as fh:
        return fh.read()


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


def first(h, *pats):
    for p in pats:
        m = re.search(p, h, re.S | re.I)
        if m:
            return m.group(1).strip()
    return None


def canon_url_for(path):
    return DOMAIN + '/' + rel(path)


def to_abs(url, canonical):
    if not url:
        return None
    if url.startswith('http'):
        return url
    if url.startswith('/'):
        return DOMAIN + url
    if canonical:
        return canonical.rsplit('/', 1)[0] + '/' + url
    return None


def is_sport(path):
    return '/categories/sport/' in rel(path)


def clean_sport(path):
    parts = rel(path).split('/')
    try:
        seg = parts[parts.index('sport') + 1]
        return ' '.join(w.capitalize() for w in seg.replace('-', ' ').split())
    except Exception:
        return None


def is_event_page(path):
    p = rel(path)
    return '/categories/' in p and '/events/' in p and os.path.basename(p) != 'index.html'


def subject_from(h):
    """Real subject of the page: event-year-data eventName, else first <h1>."""
    m = EYD_RE.search(h)
    if m:
        try:
            name = json.loads(m.group(1)).get('eventName')
            if name:
                return name.strip()
        except Exception:
            pass
    h1 = first(h, r'<h1[^>]*>(.*?)</h1>')
    if h1:
        return H.unescape(re.sub(r'<[^>]+>', '', h1)).strip()
    return None


# --------------------------------------------------------------------------- file set
def git_changed_html():
    try:
        out = subprocess.run(
            ['git', 'status', '--porcelain'], cwd=ROOT,
            capture_output=True, text=True, check=True).stdout
    except Exception:
        return []
    files = []
    for line in out.splitlines():
        if not line.strip():
            continue
        path = line[3:].strip().strip('"')
        if ' -> ' in path:
            path = path.split(' -> ', 1)[1]
        if path.lower().endswith('.html'):
            full = os.path.join(ROOT, path)
            if os.path.isfile(full) and not excluded(full):
                files.append(full)
    return files


def all_html():
    files = []
    for pat in ('content/**/*.html',):
        files += [os.path.join(ROOT, p) for p in glob.glob(os.path.join(ROOT, pat), recursive=True)]
    for rp in ROOT_PAGES:
        fp = os.path.join(ROOT, rp)
        if os.path.isfile(fp):
            files.append(fp)
    return [f for f in files if os.path.isfile(f) and not excluded(f)]


# --------------------------------------------------------------------------- JSON repair
EYD_BLOCK_RE = re.compile(r'(<script type="application/json" id="event-year-data">)(.*?)(</script>)', re.S)


def repair_json_blocks(h):
    """Escape stray loading="lazy" inside JSON script blocks; drop dangling commas."""
    state = {'changed': False}

    def make_rep():
        def rep(mo):
            inner = mo.group(2)
            try:
                json.loads(inner)
                return mo.group(0)
            except Exception:
                pass
            new = inner.replace('loading="lazy"', 'loading=\\"lazy\\"')
            new = re.sub(r',\s*([}\]])', r'\1', new)
            try:
                json.loads(new)
            except Exception:
                return mo.group(0)
            if new != inner:
                state['changed'] = True
                return mo.group(1) + new + mo.group(3)
            return mo.group(0)
        return rep

    h = EYD_BLOCK_RE.sub(make_rep(), h)
    h = LD_RE.sub(make_rep(), h)
    return h, state['changed']


# --------------------------------------------------------------------------- schema builder
def pick_edition(eyd):
    eds = eyd.get('editions') or []
    if not eds:
        return None
    dy = eyd.get('defaultYear')
    for e in eds:
        if e.get('year') == dy:
            return e
    for e in eds:
        if e.get('status') == 'upcoming':
            return e
    return eds[-1]


def end_from_exclusive(exc):
    try:
        d = datetime.date.fromisoformat(exc)
        return (d - datetime.timedelta(days=1)).isoformat()
    except Exception:
        return ''


def breadcrumb_items(path, page_name):
    """Build BreadcrumbList itemListElement from the file path taxonomy."""
    p = rel(path)
    items = [{"@type": "ListItem", "position": 1, "name": "Home", "item": DOMAIN + "/"}]
    pos = 2
    if '/categories/' in p:
        items.append({"@type": "ListItem", "position": pos, "name": "Categories",
                      "item": DOMAIN + "/content/categories/index.html"}); pos += 1
        seg = p.split('/categories/', 1)[1].split('/')
        # group (sport/culture/music/...) then topic
        if len(seg) >= 1 and seg[0]:
            grp = seg[0]
            items.append({"@type": "ListItem", "position": pos,
                          "name": grp.capitalize(),
                          "item": f"{DOMAIN}/content/categories/{grp}/index.html"}); pos += 1
        if '/events/' in p and len(seg) >= 2:
            topic = seg[1]
            items.append({"@type": "ListItem", "position": pos,
                          "name": ' '.join(w.capitalize() for w in topic.replace('-', ' ').split()),
                          "item": f"{DOMAIN}/content/categories/{seg[0]}/{topic}.html"}); pos += 1
    elif '/locations/' in p:
        items.append({"@type": "ListItem", "position": pos, "name": "Locations",
                      "item": DOMAIN + "/content/locations/index.html"}); pos += 1
    items.append({"@type": "ListItem", "position": pos, "name": page_name,
                  "item": canon_url_for(path)})
    return items


def build_jsonld(h, path):
    """Create a full @graph (WebPage + BreadcrumbList + Event/SportsEvent) from page data."""
    subject = subject_from(h)
    title = first(h, r'<title>(.*?)</title>') or subject or 'OneSliders'
    title = H.unescape(title)
    desc = first(h, r'name="description"[^>]*content="([^"]*)"') or (subject or '')
    desc = H.unescape(desc)
    canonical = first(h, r'rel="canonical" href="([^"]+)"') or canon_url_for(path)
    og_img = first(h, r'property="og:image"[^>]*content="([^"]+)"')

    graph = [
        {"@type": "Organization", "@id": f"{DOMAIN}/#organization", "name": "OneSliders",
         "url": f"{DOMAIN}/", "logo": f"{DOMAIN}/assets/icons/one-sliders-icon.svg"},
        {"@type": "WebSite", "@id": f"{DOMAIN}/#website", "url": f"{DOMAIN}/", "name": "OneSliders",
         "publisher": {"@id": f"{DOMAIN}/#organization"}},
        {"@type": "WebPage", "@id": canonical + "#webpage", "url": canonical, "name": title,
         "description": desc, "inLanguage": "en",
         **({"image": og_img} if og_img else {}),
         "breadcrumb": {"@id": canonical + "#breadcrumb"},
         "isPartOf": {"@id": f"{DOMAIN}/#website"},
         "publisher": {"@id": f"{DOMAIN}/#organization"}},
        {"@type": "BreadcrumbList", "@id": canonical + "#breadcrumb",
         "itemListElement": breadcrumb_items(path, title)},
    ]

    # Event node from event-year-data (facts never invented)
    m = EYD_RE.search(h)
    if m:
        try:
            eyd = json.loads(m.group(1))
            ed = pick_edition(eyd)
        except Exception:
            ed = None
        if ed:
            start = ed.get('startDate', '') or ''
            end_excl = ed.get('endExclusive')
            if not start:
                for e in reversed(eyd.get('editions') or []):
                    if e.get('startDate'):
                        start, end_excl, ed = e['startDate'], e.get('endExclusive'), e
                        break
            end = end_from_exclusive(end_excl) if end_excl else ''
            venue = (ed.get('venue') or '').strip()
            if venue.upper() == 'TBC':
                venue = ''
            cities = ed.get('cities') or []
            city = cities[0]['name'].strip() if cities and (cities[0].get('name') or '').strip() else ''
            countries = ed.get('countries') or []
            country = countries[0]['name'].strip() if countries and (countries[0].get('name') or '').strip() else ''
            # schema.org Event requires startDate; skip the Event node if we have no real date
            # (watchlist events with all-TBC editions). WebPage + BreadcrumbList still apply.
            if start:
                loc_name = venue or city or country or eyd.get('eventName') or 'TBC'
                ev = {
                    "@type": "SportsEvent" if is_sport(path) else "Event",
                    "@id": canonical + "#sports-event",
                    "name": eyd.get('eventName') or subject or title,
                    "url": canonical, "inLanguage": "en",
                    **({"image": og_img} if og_img else {}),
                    "eventStatus": "https://schema.org/EventScheduled",
                    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                    "startDate": start,
                }
                if is_sport(path):
                    sp = clean_sport(path)
                    if sp:
                        ev['sport'] = sp
                if end:
                    ev['endDate'] = end
                addr = {"@type": "PostalAddress"}
                if city:
                    addr['addressLocality'] = city
                if country:
                    addr['addressCountry'] = country
                ev['location'] = {"@type": "Place", "name": loc_name, "address": addr}
                if desc:
                    ev['description'] = desc
                graph.append(ev)

    data = {"@context": "https://schema.org", "@graph": graph}
    return ('<script type="application/ld+json">'
            + json.dumps(data, ensure_ascii=False, separators=(',', ':'))
            + '</script>')


def fix_event_schema(h, path):
    """Fill SportsEvent/Event facts from the page's own event-year-data.
    If no JSON-LD block exists at all, create a full @graph."""
    if not re.search(r'application/ld\+json', h, re.I):
        block = build_jsonld(h, path)
        if '</head>' in h:
            return h.replace('</head>', block + '</head>', 1), True
        return h, False
    m = EYD_RE.search(h)
    if not m:
        return h, False
    try:
        eyd = json.loads(m.group(1))
    except Exception:
        return h, False
    ed = pick_edition(eyd)
    if not ed:
        return h, False

    start = ed.get('startDate', '') or ''
    end_excl = ed.get('endExclusive')
    if not start:
        for e in reversed(eyd.get('editions') or []):
            if e.get('startDate'):
                start, end_excl, ed = e['startDate'], e.get('endExclusive'), e
                break
    end = end_from_exclusive(end_excl) if end_excl else ''
    venue = (ed.get('venue') or '').strip()
    if venue.upper() == 'TBC':
        venue = ''
    cities = ed.get('cities') or []
    city = cities[0]['name'].strip() if cities and (cities[0].get('name') or '').strip() else ''
    countries = ed.get('countries') or []
    country = countries[0]['name'].strip() if countries and (countries[0].get('name') or '').strip() else ''
    loc_name = venue or city or country or eyd.get('eventName') or 'TBC'

    touched = [False]

    def fix_ld(mo):
        head, body, tail = mo.group(1), mo.group(2), mo.group(3)
        try:
            data = json.loads(body)
        except Exception:
            return mo.group(0)
        graph = data.get('@graph')
        if not isinstance(graph, list):
            return mo.group(0)
        for node in graph:
            if not isinstance(node, dict):
                continue
            if node.get('@type') in ('SportsEvent', 'Event'):
                if start and node.get('startDate', '') != start:
                    node['startDate'] = start; touched[0] = True
                if end and node.get('endDate', '') != end:
                    node['endDate'] = end; touched[0] = True
                addr = {"@type": "PostalAddress"}
                if city:
                    addr['addressLocality'] = city
                if country:
                    addr['addressCountry'] = country
                newloc = {"@type": "Place", "name": loc_name, "address": addr}
                if node.get('location') != newloc:
                    node['location'] = newloc; touched[0] = True
                if is_sport(path):
                    sp = clean_sport(path)
                    if sp and node.get('sport') != sp:
                        node['sport'] = sp; touched[0] = True
                    if node.get('@type') != 'SportsEvent':
                        node['@type'] = 'SportsEvent'; touched[0] = True
                else:
                    if node.get('@type') != 'Event':
                        node['@type'] = 'Event'; touched[0] = True
                    if 'sport' in node:
                        del node['sport']; touched[0] = True
        if not touched[0]:
            return mo.group(0)
        return head + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + tail

    new_h = LD_RE.sub(fix_ld, h, count=1)
    return new_h, touched[0]


# --------------------------------------------------------------------------- head SEO
def derive_description(h, subject):
    lede = first(h, r'class="event-lede"[^>]*>(.*?)</p>', r'class="intro"[^>]*>(.*?)</p>')
    if lede:
        txt = H.unescape(re.sub(r'<[^>]+>', '', lede)).strip()
        if len(txt) >= 50:
            return txt[:160]
    if subject:
        return (f"{subject}: dates, schedule, location and guide on OneSliders.")[:160]
    return None


def ensure_head_seo(h, path):
    """Add/repair head SEO tags. Returns (html, fixed_fields:list, manual:list)."""
    fixed, manual = [], []
    subject = subject_from(h)
    canonical = first(h, r'rel="canonical" href="([^"]+)"') or canon_url_for(path)

    def insert_after_title(tag):
        nonlocal h
        if '</title>' in h:
            h = h.replace('</title>', '</title>' + tag, 1)
        elif '</head>' in h:
            h = h.replace('</head>', tag + '</head>', 1)

    # title
    title = first(h, r'<title>(.*?)</title>')
    if not title:
        t = (subject or 'OneSliders')
        if '</head>' in h:
            h = h.replace('</head>', f'<title>{H.escape(t)}</title></head>', 1)
        title = t
        fixed.append('title')
    elif len(H.unescape(title)) > 60:
        short = re.sub(r'\s+[-–—]\s+.*$', '', H.unescape(title)).strip()
        if len(short) > 60:
            short = short[:60].rstrip()
        if short and short != H.unescape(title):
            h = h.replace(f'<title>{title}</title>', f'<title>{H.escape(short)}</title>', 1)
            title = short
            fixed.append('title_len')
        else:
            manual.append('title>60')

    # description
    if not re.search(r'name="description"', h, re.I):
        desc = derive_description(h, subject)
        if desc:
            insert_after_title(f'<meta name="description" content="{H.escape(desc, quote=True)}">')
            fixed.append('description')
        else:
            manual.append('no-description')

    # canonical
    if not re.search(r'rel="canonical"', h, re.I):
        insert_after_title(f'<link rel="canonical" href="{canonical}">')
        fixed.append('canonical')

    # content-language
    if not re.search(r'name="content-language"', h, re.I):
        insert_after_title('<meta name="content-language" content="en">')
        fixed.append('content-language')

    # og:type
    if not re.search(r'property="og:type"', h, re.I):
        insert_after_title('<meta property="og:type" content="website">')
        fixed.append('og:type')

    # og:title / twitter:title
    og_title = title or subject or 'OneSliders'
    if not re.search(r'property="og:title"', h, re.I):
        insert_after_title(f'<meta property="og:title" content="{H.escape(og_title, quote=True)}">')
        fixed.append('og:title')
    if not re.search(r'name="twitter:card"', h, re.I):
        insert_after_title('<meta name="twitter:card" content="summary_large_image">')
        fixed.append('twitter:card')

    # og:url
    if not re.search(r'property="og:url"', h, re.I):
        insert_after_title(f'<meta property="og:url" content="{canonical}">')
        fixed.append('og:url')

    # og:description
    if not re.search(r'property="og:description"', h, re.I):
        d = first(h, r'name="description"[^>]*content="([^"]*)"')
        if d:
            insert_after_title(f'<meta property="og:description" content="{H.escape(d, quote=True)}">')
            fixed.append('og:description')

    # og:image -- from the page's own hero/mini
    if not re.search(r'property="og:image"', h, re.I):
        hero = first(
            h,
            r'class="event-hero__image"[^>]*src="([^"]+)"',
            r'class="event-frame__media"[^>]*>\s*<img[^>]*src="([^"]+)"',
            r'--hero:\s*url\([\'"]?([^\'")]+)',
            r'class="topic-hero"[^>]*url\([\'"]?([^\'")]+)',
            r'<img[^>]*src="([^"]+-hero\.(?:png|jpg|jpeg|svg))"',
            r'<img[^>]*src="([^"]+-mini\.png)"',
        )
        img_abs = to_abs(hero, canonical)
        if img_abs:
            insert_after_title(f'<meta property="og:image" content="{H.escape(img_abs, quote=True)}">')
            fixed.append('og:image')
        else:
            manual.append('no-og:image (no hero on page)')

    # content-representative check: title/og must mention the real subject.
    # Normalize accents (fold to ASCII) so "Fårikål" matches "Farikal" in a title.
    if subject:
        import unicodedata

        def fold(s):
            s = unicodedata.normalize('NFKD', s)
            s = ''.join(c for c in s if not unicodedata.combining(c))
            return re.sub(r'[^a-z0-9]', '', s.lower())

        subj_key = fold(subject)[:12]
        cur_title = fold(first(h, r'<title>(.*?)</title>') or '')
        # only flag clear mismatches: a real subject of decent length absent from the title
        if len(subj_key) >= 4 and subj_key not in cur_title:
            manual.append(f'title may not represent subject "{subject}"')

    return h, fixed, manual


# --------------------------------------------------------------------------- responsive
def ensure_responsive(h):
    fixed, manual = [], []
    if not re.search(r'name="viewport"', h, re.I):
        tag = '<meta name="viewport" content="width=device-width, initial-scale=1">'
        if '<meta charset' in h:
            h = re.sub(r'(<meta charset[^>]*>)', r'\1' + tag, h, count=1)
        elif '<head>' in h:
            h = h.replace('<head>', '<head>' + tag, 1)
        fixed.append('viewport')
    # dev-only override left enabled
    if re.search(r"location\.href\.includes\('localhost'\)\s*\)\s*document\.body\.classList\.add\('is-localhost'\)", h):
        h = re.sub(r"if\s*\(location\.href\.includes\('localhost'\)\)\s*document\.body\.classList\.add\('is-localhost'\);",
                   "/* dev-only is-localhost layout override disabled by prepush gate */", h)
        fixed.append('disable-is-localhost')
    # report-only risks
    if re.search(r'width:\s*100vw', h):
        manual.append('uses width:100vw (overflow risk)')
    return h, fixed, manual


# --------------------------------------------------------------------------- report
def coverage_report(files):
    fields = ['title', 'tlen', 'desc', 'canon', 'ogimg', 'tw', 'jsonld', 'lang', 'viewport', 'h1']
    counts = {k: 0 for k in fields}
    n = 0
    for f in files:
        h = read(f)
        if re.search(r'name="robots"[^>]*noindex', h, re.I):
            continue
        n += 1
        t = first(h, r'<title>(.*?)</title>')
        if t: counts['title'] += 1
        if t and len(H.unescape(t)) <= 60: counts['tlen'] += 1
        if re.search(r'name="description"', h, re.I): counts['desc'] += 1
        if re.search(r'rel="canonical"', h, re.I): counts['canon'] += 1
        if re.search(r'property="og:image"', h, re.I): counts['ogimg'] += 1
        if re.search(r'name="twitter:card"', h, re.I): counts['tw'] += 1
        if re.search(r'application/ld\+json', h, re.I): counts['jsonld'] += 1
        if re.search(r'name="content-language"', h, re.I): counts['lang'] += 1
        if re.search(r'name="viewport"', h, re.I): counts['viewport'] += 1
        if re.search(r'<h1[\s>]', h, re.I): counts['h1'] += 1
    print(f"\nIndexable pages: {n}")
    print("  " + " | ".join(f"{k} {0 if not n else round(100*counts[k]/n)}%" for k in fields))


# --------------------------------------------------------------------------- main
def process(files, write_changes):
    changed = 0
    field_tally = {}
    manual_log = []
    for f in files:
        h0 = read(f)
        h = h0
        h, _ = repair_json_blocks(h)
        # Head SEO first so og:image exists before JSON-LD references it.
        h, seo_fixed, seo_manual = ensure_head_seo(h, f)
        # JSON-LD: create a full @graph if none exists; else enrich event facts.
        jsonld_fixed = []
        if not re.search(r'application/ld\+json', h, re.I):
            block = build_jsonld(h, f)
            if '</head>' in h:
                h = h.replace('</head>', block + '</head>', 1)
                jsonld_fixed.append('json-ld(created)')
        elif is_event_page(f):
            h2, touched = fix_event_schema(h, f)
            if touched:
                h = h2
                jsonld_fixed.append('json-ld(enriched)')
        h, resp_fixed, resp_manual = ensure_responsive(h)
        for x in seo_fixed + resp_fixed + jsonld_fixed:
            field_tally[x] = field_tally.get(x, 0) + 1
        for x in seo_manual + resp_manual:
            manual_log.append(f"  {rel(f)} :: {x}")
        if h != h0:
            if write_changes:
                if write(f, h):
                    changed += 1
            else:
                changed += 1
    print(f"\nPages scanned: {len(files)}")
    print(f"Pages {'fixed' if write_changes else 'WOULD be fixed'}: {changed}")
    if field_tally:
        print("Fields applied:")
        for k in sorted(field_tally):
            print(f"  {k}: {field_tally[k]}")
    if manual_log:
        print(f"\nMANUAL REVIEW ({len(manual_log)}):")
        for line in manual_log[:60]:
            print(line)
        if len(manual_log) > 60:
            print(f"  ... and {len(manual_log)-60} more")


def main(argv):
    report = '--report' in argv
    use_all = '--all' in argv
    explicit = []
    if '--paths' in argv:
        i = argv.index('--paths')
        explicit = [os.path.join(ROOT, p) for p in argv[i+1:] if not p.startswith('--')]

    if explicit:
        files = [f for f in explicit if os.path.isfile(f) and not excluded(f)]
    elif use_all:
        files = all_html()
    else:
        files = git_changed_html()

    if not files:
        print("No HTML pages to check.")
        return 0

    if report:
        coverage_report(files)
    else:
        process(files, write_changes=True)
        print("\nGate complete (auto-fix mode). Pages were never blocked.")
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
