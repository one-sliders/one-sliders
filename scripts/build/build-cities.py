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
  python scripts/build_city_page.py --template-preview             # tmp preview from renderer
  python scripts/build_city_page.py --all                          # all city data files
  python scripts/build_city_page.py --continent europe            # all cities
  python scripts/build_city_page.py --country north-america usa    # one country
  python scripts/build_city_page.py --booking-markets              # europe + usa + canada
"""

import os, sys, json, glob, html as H, re
from datetime import date
from urllib.parse import quote

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOMAIN = 'https://one-sliders.com'
TODAY = date(2026, 6, 14)
MISSING_NODE_MINIS = []

# Load population and airport mappings
POPULATION_MAP = {}
AIRPORT_MAP = {}
pop_map_file = os.path.join(ROOT, 'data', 'city-population-mapping.json')
if os.path.isfile(pop_map_file):
    with open(pop_map_file, 'r', encoding='utf-8-sig') as f:
        POPULATION_MAP = json.load(f) or {}
airport_map_file = os.path.join(ROOT, 'data', 'city-airport-mapping.json')
if os.path.isfile(airport_map_file):
    with open(airport_map_file, 'r', encoding='utf-8-sig') as f:
        AIRPORT_MAP = json.load(f) or {}


def format_population(pop_val):
    """Format population number: 2113705 -> '~2.1M', 717710 -> '~718k'"""
    if not isinstance(pop_val, (int, float)):
        try:
            pop_val = int(pop_val)
        except (ValueError, TypeError):
            return str(pop_val)
    if pop_val >= 1_000_000:
        m = pop_val / 1_000_000
        return f'~{m:.1f}M' if m >= 1 else f'~{int(m * 1000)}k'
    elif pop_val >= 1_000:
        k = pop_val / 1_000
        return f'~{k:.0f}k'
    else:
        return str(pop_val)


def esc(s):
    return (str(s).replace('&', '&amp;').replace('<', '&lt;')
            .replace('>', '&gt;').replace('"', '&quot;'))


def rel_prefix(depth):
    return '../' * depth


def root_href(href):
    if not href:
        return '#'
    if href.startswith(('http://', 'https://', '/', '#')):
        return href
    while href.startswith('../'):
        href = href[3:]
    return f'/content/{href}'


def asset_path(src):
    return str(src or '').split('?', 1)[0].split('#', 1)[0]


def img_srcset(src, sizes='(max-width:620px) 220px, 400px'):
    clean = asset_path(src)
    base = clean[:-4] if clean.endswith('.png') else clean
    parts = []
    for w in (200, 400, 768, 1200):
        p = f'{base}-{w}.webp'
        if os.path.isfile(os.path.join(ROOT, p.lstrip('/'))):
            parts.append(f'{p} {w}w')
    return f' srcset="{", ".join(parts)}" sizes="{esc(sizes)}"' if parts else ''


def asset_exists(src):
    clean = asset_path(src)
    if not clean or clean.startswith(('http://', 'https://')):
        return bool(clean)
    return os.path.isfile(os.path.join(ROOT, clean.lstrip('/')))


def optional_img(src, alt='', class_name='', width=400, height=300, sizes='(max-width:620px) 220px, 400px'):
    if not asset_exists(src):
        return ''
    cls = f' class="{esc(class_name)}"' if class_name else ''
    return (f'<img{cls} src="{esc(src)}"{img_srcset(src, sizes)} alt="{esc(alt)}" '
            f'loading="lazy" width="{width}" height="{height}">')


def node_mini_image(href, label, class_name='node-mini-hero', width=400, height=300):
    href = str(href or '')
    label = str(label or 'Node')
    candidates = []
    if href.startswith('/content/categories/'):
        parts = href.strip('/').split('/')
        if len(parts) >= 4:
            if len(parts) >= 5 and parts[-1] == 'index.html':
                slug = parts[-2]
                parent = '/'.join(parts[:-2])
                candidates.append(f'/{parent}/img/{slug}-mini.png')
            if len(parts) >= 4:
                slug = parts[-2] if parts[-1] == 'index.html' else os.path.splitext(parts[-1])[0]
                parent = '/'.join(parts[:-1])
                candidates.append(f'/{parent}/img/{slug}-mini.png')
    if href.startswith('/content/locations/'):
        parts = href.strip('/').split('/')
        if href.endswith('/index.html') or href.endswith('/'):
            slug = parts[-2] if parts[-1] in ('', 'index.html') else parts[-1]
            parent = '/'.join(parts[:-2] if parts[-1] in ('', 'index.html') else parts[:-1])
            candidates.append(f'/{parent}/{slug}/img/{slug}-mini.png')
        elif href.endswith('.html'):
            slug = os.path.splitext(parts[-1])[0]
            parent = '/'.join(parts[:-1])
            candidates.append(f'/{parent}/img/{slug}-mini.png')
    for src in candidates:
        if os.path.isfile(os.path.join(ROOT, src.lstrip('/'))):
            return optional_img(src, label, class_name=class_name, width=width, height=height)
    if href and not href.startswith('#'):
        MISSING_NODE_MINIS.append({'href': href, 'label': label, 'candidates': candidates})
    elif not href:
        MISSING_NODE_MINIS.append({'href': '(no target node)', 'label': label, 'candidates': candidates})
    initial = esc(label[:1].upper() or '?')
    return f'<span class="{esc(class_name)} node-mini-hero--fallback" aria-hidden="true">{initial}</span>'


def parse_iso_date(value):
    value = str(value or '').strip()
    if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', value):
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


BOOKING_LINKS = {
    'north-america-usa-canada': 'https://www.jdoqocy.com/click-101771061-17293132',
    'central-eastern-europe': 'https://www.kqzyfj.com/click-101771061-15735418',
}


def booking_base_url(d):
    if d.get('bookingAffiliateBase'):
        return d['bookingAffiliateBase']
    if d.get('continent') == 'europe':
        return BOOKING_LINKS['central-eastern-europe']
    if d.get('continent') == 'north-america' and d.get('countrySlug') in ('usa', 'canada'):
        return BOOKING_LINKS['north-america-usa-canada']
    return BOOKING_LINKS['north-america-usa-canada']


def booking_market_class(d):
    if d.get('continent') == 'europe':
        return ' affiliate-market--europe'
    if d.get('continent') == 'north-america' and d.get('countrySlug') in ('usa', 'canada'):
        return ' affiliate-market--usa-canada'
    return ' affiliate-market--usa-canada'


def booking_search_url(search, d):
    return (booking_base_url(d) + '?url='
            + quote(f'https://www.booking.com/searchresults.html?ss={search}', safe=''))


def booking_cars_url(search):
    target = f'https://www.booking.com/cars/search-results/?ss={search}'
    return 'https://www.jdoqocy.com/click-101771061-17122706?url=' + quote(target, safe=':/?=&,')


ATTRACTION_AFFILIATES = {
    'oslo': {
        'sustainable cruise in oslofjord with audioguiding': 'https://www.booking.com/attractions/no/prxz2arpfoaw-sustainable-cruise-in-oslofjord-with-audioguiding.en-gb.html?source=searchresults-product-card&aid=304142&label=mkt123sc-10d3376d-8023-4cad-9ee1-b0f1584633cd&ufi=-251754&date=2026-06-14&timeslot=ATS-PRxz2aRPfOaW-202606141000-nullnull&ticket_type=OF204cBwlU0I',
        'oslofjord': 'https://www.booking.com/attractions/no/prxz2arpfoaw-sustainable-cruise-in-oslofjord-with-audioguiding.en-gb.html?source=searchresults-product-card&aid=304142&label=mkt123sc-10d3376d-8023-4cad-9ee1-b0f1584633cd&ufi=-251754&date=2026-06-14&timeslot=ATS-PRxz2aRPfOaW-202606141000-nullnull&ticket_type=OF204cBwlU0I',
        'munch museum': 'https://www.booking.com/attractions/no/prafmabqdig0-oslo-munch-museum-admission-ticket.en-gb.html?source=searchresults-product-card&date=2026-06-14&aid=304142&label=mkt123sc-10d3376d-8023-4cad-9ee1-b0f1584633cd&ufi=-251754&timeslot=ATS-PRAFmaBqDiG0-202606141000-nullnull&ticket_type=OFLakgnYdj8U',
        'nobel peace center': 'https://www.booking.com/attractions/no/prfurtc1q8is-nobel-peace-centre-museum-tickets.en-gb.html?source=searchresults-product-card&date=2026-06-14&timeslot=ATS-PRAFmaBqDiG0-202606141000-nullnull&aid=304142&label=mkt123sc-10d3376d-8023-4cad-9ee1-b0f1584633cd&ufi=-251754',
        'nobel peace centre': 'https://www.booking.com/attractions/no/prfurtc1q8is-nobel-peace-centre-museum-tickets.en-gb.html?source=searchresults-product-card&date=2026-06-14&timeslot=ATS-PRAFmaBqDiG0-202606141000-nullnull&aid=304142&label=mkt123sc-10d3376d-8023-4cad-9ee1-b0f1584633cd&ufi=-251754',
    }
}


TIMEZONES = {
    'norway': 'Europe/Oslo',
    'sweden': 'Europe/Stockholm',
    'denmark': 'Europe/Copenhagen',
    'finland': 'Europe/Helsinki',
    'iceland': 'Atlantic/Reykjavik',
    'usa': 'America/New_York',
    'canada': 'America/Toronto',
    'zimbabwe': 'Africa/Harare',
}


CONTENT_RULES = {
    'see_min_cards': 6,
    'history_min_rows': 6,
    'history_max_rows': 14,
    'see_text_words': (18, 32),
    'stay_overview_words': (32, 58),
    'hotel_intro_words': (32, 52),
    'area_text_words': (18, 30),
    'airport_text_words': (18, 30),
    'nearby_text_words': (14, 24),
    'tip_text_words': (16, 28),
    'city_intro_words': (44, 72),
}


def words(text):
    return re.findall(r"[\w]+(?:[-'][\w]+)?", str(text or ''), re.UNICODE)


def clamp_words(text, max_words):
    source = str(text or '')
    parts = words(source)
    if len(parts) <= max_words:
        return source
    sentence_parts = re.findall(r'.*?[.!?](?=\s|$)', source, re.S)
    for sentence in sentence_parts:
        sentence = re.sub(r'\s+', ' ', sentence).strip()
        if sentence and len(words(sentence)) <= max_words:
            return sentence
    return source


def bounded_text(text, fallback, rule):
    min_words, max_words = CONTENT_RULES[rule]
    source = str(text or '').strip()
    if len(words(source)) >= min_words:
        return source
    return clamp_words(fallback, max_words)


MONTHS = {
    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
    'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12,
    'sept': 9,
}


def parse_iso_day(value):
    try:
        return date.fromisoformat(str(value or '').strip())
    except ValueError:
        return None


def future_or_current_year_day(month, day):
    value = date(TODAY.year, month, day)
    return value if value >= TODAY else date(TODAY.year + 1, month, day)


def parse_event_day(event):
    start = parse_iso_day(event.get('start'))
    if start:
        return start

    meta = str(event.get('meta') or '')
    m = re.search(r'\b(\d{1,2})\s+([A-Z][a-z]{2,3})\s+-\s+\d{1,2}\s+[A-Z][a-z]{2,3}\s+(\d{4})\b', meta)
    if m and m.group(2).lower() in MONTHS:
        return date(int(m.group(3)), MONTHS[m.group(2).lower()], int(m.group(1)))

    m = re.search(r'\b([A-Z][a-z]{2,3})\s+(\d{1,2}),\s*(\d{4})\b', meta)
    if m and m.group(1).lower() in MONTHS:
        return date(int(m.group(3)), MONTHS[m.group(1).lower()], int(m.group(2)))

    m = re.search(r'\b(\d{1,2})(?:-\d{1,2})?\s+([A-Z][a-z]{2,3})\s+(\d{4})\b', meta)
    if m and m.group(2).lower() in MONTHS:
        return date(int(m.group(3)), MONTHS[m.group(2).lower()], int(m.group(1)))

    m = re.search(r'\b([A-Z][a-z]{2,3})\s+(\d{1,2})(?:-\d{1,2})\b', meta)
    if m and m.group(1).lower() in MONTHS:
        return future_or_current_year_day(MONTHS[m.group(1).lower()], int(m.group(2)))

    m = re.search(r'\bEnds\s+([A-Z][a-z]{2,3})\s+(\d{1,2})\b', meta)
    if m and m.group(1).lower() in MONTHS:
        return future_or_current_year_day(MONTHS[m.group(1).lower()], int(m.group(2)))

    m = re.search(r'\b(\d{4}) date TBC\b', meta)
    if m:
        return date(int(m.group(1)), 12, 31)

    return None


def parse_event_end_day(event, start_day=None):
    end = parse_iso_day(event.get('end'))
    if end:
        return end

    meta = str(event.get('meta') or '')
    m = re.search(r'\b(\d{1,2})-(\d{1,2})\s+([A-Z][a-z]{2,3})\s+(\d{4})\b', meta)
    if m and m.group(3).lower() in MONTHS:
        return date(int(m.group(4)), MONTHS[m.group(3).lower()], int(m.group(2)))

    m = re.search(r'\b([A-Z][a-z]{2,3})\s+(\d{1,2})-(\d{1,2})\b', meta)
    if m and m.group(1).lower() in MONTHS:
        return future_or_current_year_day(MONTHS[m.group(1).lower()], int(m.group(3)))

    m = re.search(r'\bEnds\s+([A-Z][a-z]{2,3})\s+(\d{1,2})\b', meta)
    if m and m.group(1).lower() in MONTHS:
        return future_or_current_year_day(MONTHS[m.group(1).lower()], int(m.group(2)))

    return start_day


def event_sort_key(event):
    day = parse_event_day(event)
    end_day = parse_event_end_day(event, day)
    score = event.get('score', 0)
    if day:
        is_past = day < TODAY and (not end_day or end_day < TODAY)
        return (1 if is_past else 0, day.isoformat(), -score)
    return (2, '9999-99-99', -score)


def event_image_for(event):
    image = root_href(event.get('image', ''))
    if image != '#' and asset_exists(image):
        return image

    href = root_href(event.get('href', ''))
    if href.endswith('.html'):
        folder = href.rsplit('/', 1)[0]
        slug = event.get('slug') or os.path.splitext(os.path.basename(href))[0]
        for candidate in (
            f'{folder}/img/{slug}-mini-400.webp',
            f'{folder}/img/{slug}-mini.png',
            f'{folder}/img/{slug}-mini-200.webp',
        ):
            if asset_exists(candidate):
                return candidate

    return image if image != '#' else ''


def place_matches(hay, place):
    if not place:
        return False
    return re.search(r'(?<![a-z0-9])' + re.escape(place) + r'(?![a-z0-9])', hay) is not None


def event_has_finished(event):
    start_day = parse_event_day(event)
    end_day = parse_event_end_day(event, start_day)
    return bool(end_day and end_day < TODAY)


def is_placeholder_event(event, city_name=''):
    title = str(event.get('title') or event.get('name') or '').strip().lower()
    href = root_href(event.get('href') or '')
    meta = str(event.get('meta') or '').lower()
    if href in ('/content/events/index.html', '/content/events/'):
        return True
    if href.endswith('/events/index.html'):
        return True
    if city_name and title == f'{city_name.lower()} events':
        return True
    if 'calendar' in meta and not (event.get('start') or event.get('end') or event.get('date')):
        return True
    return False


def load_city_events(d, limit=8):
    path = os.path.join(ROOT, 'content/events/events-compact.json')
    if not os.path.isfile(path):
        return []
    city = d['name'].lower()
    city_slug = d.get('slug', '').replace('-', ' ').lower()
    out, seen = [], set()
    try:
        rows = json.load(open(path, encoding='utf-8'))
    except Exception:
        return []
    for e in rows:
        hay = ' '.join(str(e.get(k, '')) for k in ('title', 'meta', 'href', 'slug')).lower()
        is_city_match = place_matches(hay, city) or place_matches(hay, city_slug)
        if not is_city_match:
            continue
        if event_has_finished(e):
            continue
        key = e.get('slug') or e.get('title') or e.get('href')
        if not key or key in seen:
            continue
        seen.add(key)
        out.append({
            'score': 2 if is_city_match else 1,
            'title': e.get('title', 'Event'),
            'meta': e.get('meta', ''),
            'start': e.get('start') or '',
            'end': e.get('end') or '',
            'href': root_href(e.get('href', '#')),
            'img': event_image_for(e),
            'modifier': e.get('cat') or e.get('topic') or 'event',
        })
    out.sort(key=event_sort_key)
    return out[:limit]


def local_city_events(d, limit=6):
    out = []
    for item in d.get('events') or []:
        if isinstance(item, dict):
            if is_placeholder_event(item, d.get('name', '')):
                continue
            event = {
                'title': item.get('title') or item.get('name') or 'Local event',
                'meta': item.get('meta') or f"{d['name']}, {d['countryName']}",
                'start': item.get('startDate') or item.get('start') or item.get('date') or '',
                'end': item.get('endDate') or item.get('end') or '',
                'status': item.get('status') or '',
                'href': root_href(item.get('href') or '/content/events/index.html'),
                'img': root_href(item.get('img') or ''),
                'modifier': item.get('modifier') or item.get('cat') or 'event',
            }
            out.append(event)
        else:
            continue
        if len(out) >= limit:
            break
    out.sort(key=event_sort_key)
    return out


def normalize_city_data(data, city_path):
    p = os.path.relpath(city_path, ROOT).replace('\\', '/').split('/')
    if len(p) >= 5 and p[0] == 'content' and p[1] == 'locations':
        data.setdefault('continent', p[2])
        data.setdefault('countrySlug', p[3])
    CONT_NAME = {'europe': 'Europe', 'asia': 'Asia', 'africa': 'Africa',
                 'north-america': 'North America', 'south-america': 'South America', 'oceania': 'Oceania'}
    data.setdefault('continentName', CONT_NAME.get(data.get('continent', ''), str(data.get('continent', '')).title()))
    if not data.get('countryName') and data.get('countrySlug'):
        data['countryName'] = str(data['countrySlug']).replace('-', ' ').title()
    if not data.get('slug'):
        data['slug'] = os.path.splitext(os.path.basename(city_path))[0]
    data.setdefault('name', str(data['slug']).replace('-', ' ').title())
    if 'coordinates' not in data and isinstance(data.get('coords'), list) and len(data['coords']) >= 2:
        data['coordinates'] = {'lat': data['coords'][0], 'lon': data['coords'][1]}
    if 'heroText' not in data and data.get('intro'):
        data['heroText'] = data['intro']
    if 'airports' not in data and data.get('airport'):
        data['airports'] = [{'name': data['airport'], 'search': f"{data['airport']}, {data['name']}, {data['countryName']}"}]
    if 'bookingDestination' not in data:
        data['bookingDestination'] = f"{data['name']}, {data['countryName']}"
    return data


def infer_city_profile(d):
    explicit = d.get('cityProfile')
    if isinstance(explicit, list) and explicit:
        profile = []
        for item in explicit:
            if isinstance(item, dict):
                label = item.get('label') or item.get('name')
                value = item.get('pct') or item.get('percent') or item.get('value')
            else:
                continue
            try:
                value = int(value)
            except (TypeError, ValueError):
                continue
            if label and value > 0:
                profile.append((str(label), value))
        total = sum(value for _, value in profile)
        if total > 0:
            return [(label, max(1, round(value * 100 / total))) for label, value in profile[:4]]
    return []


def legacy_infer_city_profile(d):
    words = ' '.join(city_item_label(x) for x in d.get('highlights', [])).lower()
    culture = 30 + (10 if any(x in words for x in ('museum', 'opera', 'gallery', 'fortress')) else 0)
    waterfront = 20 + (10 if any(x in words for x in ('fjord', 'harbour', 'harbor', 'archipelago', 'waterfront')) else 0)
    parks = 20 + (10 if any(x in words for x in ('park', 'forest', 'garden', 'mountain')) else 0)
    events = max(10, 100 - culture - waterfront - parks)
    total = culture + waterfront + parks + events
    return [
        ('Culture', round(culture * 100 / total)),
        ('Water', round(waterfront * 100 / total)),
        ('Parks', round(parks * 100 / total)),
        ('Events', max(1, 100 - round(culture * 100 / total) - round(waterfront * 100 / total) - round(parks * 100 / total))),
    ]


def city_item_label(item):
    if isinstance(item, dict):
        return str(item.get('title') or item.get('name') or item.get('label') or '')
    return str(item)


def city_item_text(item):
    if isinstance(item, dict):
        return str(item.get('text') or item.get('description') or item.get('detail') or '')
    return ''


def place_labels(items):
    out = []
    for item in items or []:
        label = city_item_label(item)
        if label:
            out.append(label)
    return out


def ensure_highlights(d, areas):
    highlights = d.get('highlights') or d.get('worthSeeing') or []
    if len(highlights) >= CONTENT_RULES['see_min_cards']:
        return highlights[:CONTENT_RULES['see_min_cards']]
    labels = place_labels(highlights)
    known = d.get('knownFor')
    if isinstance(known, str):
        labels.extend([x.strip() for x in re.split(r',|&| and ', known) if x.strip()])
    labels.extend(place_labels(areas))
    labels.extend([d.get('region'), d.get('state'), d.get('province')])
    labels = [x for x in labels if x]
    seen = set()
    unique = []
    for label in labels:
        key = label.lower()
        if key in seen:
            continue
        seen.add(key)
        unique.append(label)
        if len(unique) >= CONTENT_RULES['see_min_cards']:
            break
    while len(unique) < CONTENT_RULES['see_min_cards']:
        unique.append(f"{d['name']} planning base {len(unique) + 1}")
    return unique[:CONTENT_RULES['see_min_cards']]


def ensure_city_history(d):
    def clean_history_text(value):
        text = str(value or '')
        if 'Ã' in text:
            try:
                text = text.encode('latin1').decode('utf-8')
            except UnicodeError:
                pass
        text = re.sub(r'=+', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text.strip(' -;:')

    def clean_history_label(label, text):
        label = clean_history_text(label)
        if label in ('000', '0', 'TBC', 'TBD'):
            return ''
        if re.fullmatch(r'\d{3,4}', label) and re.search(r'\bBCE\b', text, re.I):
            return f'{label} BCE'
        return label

    def history_order(row):
        label = str(row.get('label') or '')
        text = str(row.get('text') or '')
        source = f'{label} {text}'
        m = re.search(r'\b(\d{3,4})\s*BCE\b', source, re.I)
        if m:
            return (-int(m.group(1)), 0)
        m = re.search(r'\b(\d{3,4})\b', label)
        if m:
            return (int(m.group(1)), 0)
        m = re.search(r'\b(\d{3,4})\b', text)
        if m:
            return (int(m.group(1)), 1)
        return (999999, 2)

    rows = []
    seen = set()
    for item in d.get('history') or []:
        if not isinstance(item, dict):
            continue
        text = clean_history_text(item.get('text'))
        if not text or len(words(text)) < 8:
            continue
        if text.lower().startswith(('add ', 'replace ', 'template ')):
            continue
        if re.search(r'\b(TBC|TBD)\b', text, re.I):
            continue
        if text.count('(') > text.count(')') or text.count('"') % 2:
            continue
        label = clean_history_label(item.get('label'), text)
        if not label:
            continue
        if re.fullmatch(r'\d{1,2}', label):
            continue
        key = re.sub(r'[^a-z0-9]+', ' ', f'{label} {text}'.lower()).strip()
        if key in seen:
            continue
        seen.add(key)
        rows.append({
            'label': label,
            'text': text,
        })
    return sorted(rows, key=history_order)[:CONTENT_RULES['history_max_rows']]


def render_template_city(d):
    slug, name = d['slug'], d['name']
    cont, country_slug, country_name = d['continent'], d['countrySlug'], d['countryName']
    cont_name = d.get('continentName') or cont.replace('-', ' ').title()
    page_url = f"{DOMAIN}/content/locations/{cont}/{country_slug}/{slug}.html"
    img_base = f"/content/locations/{cont}/{country_slug}/img"
    hero = f"{img_base}/{slug}-hero.png"
    hero_1200 = f"{img_base}/{slug}-hero-1200.webp"
    hero_preload = hero_1200 if os.path.isfile(os.path.join(ROOT, hero_1200.lstrip('/'))) else hero
    country_mini = f"{img_base}/{country_slug}-mini.png"
    country_mini_alt = f"{country_name} thumbnail"
    # Old h1_text will be overridden by auto-generated one below
    coords = d.get('coordinates') or {}
    lat = coords.get('lat')
    lon = coords.get('lon')
    tz = d.get('timezone') or TIMEZONES.get(country_slug, 'UTC')
    region = d.get('region') or f'{country_name} region'
    population = d.get('population')
    has_population = population is not None
    population = population or 'TBC'
    areas = d.get('areas') or []
    highlights = ensure_highlights(d, areas)
    airports = d.get('airports') or []
    booking_destination = d.get('bookingDestination') or f'{name}, {country_name}'
    booking_market = booking_market_class(d)
    events = local_city_events(d) or load_city_events(d)
    seo = d.get('seo') or {}

    landmark = 'landmarks'
    if highlights:
        first = highlights[0]
        if isinstance(first, dict):
            landmark = first.get('title') or first.get('name') or 'landmarks'
        else:
            landmark = str(first)

    airport_code = ''
    if airports:
        airport_name = airports[0].get('name', '')
        m = re.search(r'\(([A-Z]+)\)$', airport_name)
        if m:
            airport_code = m.group(1)

    h1_text = f'{name} — travel, stays & events guide'
    title_base = f'{name} travel guide - stays, sights & 2026 events'
    title = title_base if len(title_base) <= 60 else f'{name} travel guide'

    desc_suffix = f'{airport_code} airport links' if airport_code else 'airport links'
    description = f'Plan {name} around {landmark}, hotel areas, {desc_suffix} and local events.'
    if len(description) > 155:
        description = f'Plan {name}: {landmark}, hotel areas and events.' if len(f'Plan {name}: {landmark}, hotel areas and events.') <= 155 else f'Travel guide for {name}.'
    intro = bounded_text(
        d.get('heroText'),
        f'{name} is a city in {country_name} shaped by its region, population, local economy, landmarks, climate and civic history. This overview summarizes the city itself: where it sits, what defines it, which places anchor its identity and why it matters within the wider country.',
        'city_intro_words'
    )
    intro_title = d.get('introTitle') or f'{name} city overview'

    def local_target_exists(href):
        href = str(href or '')
        if not href.startswith('/'):
            return href.startswith('#')
        return os.path.isfile(os.path.join(ROOT, href.lstrip('/')))

    def linked_or_plain(tag, href, attrs, inner):
        if href and (href.startswith('http') or local_target_exists(href)):
            return f'<a {attrs} href="{esc(href)}">{inner}</a>'
        return f'<{tag} {attrs}>{inner}</{tag}>'

    def topic_from_event(event):
        href = str(event.get('href') or '')
        # Normalize relative paths to absolute
        if href.startswith('../'):
            # Convert ../../../categories/X/Y/events/event.html to /content/categories/X/Y/index.html
            # Count ../ and build absolute path
            parts = href.split('/')
            # Find where 'categories' starts
            try:
                idx = parts.index('categories')
                normalized = '/content/' + '/'.join(parts[idx:])
                href = normalized
            except ValueError:
                pass

        m = re.match(r'/content/categories/(.+?)/events/[^/]+\.html$', href)
        if not m:
            return None
        topic_path = m.group(1)
        path_parts = topic_path.split('/')
        slug_part = path_parts[-1]
        label = event.get('topicLabel') or slug_part.replace('-', ' ').title()
        if slug_part == 'golf':
            label = 'Golf'
        elif slug_part == 'sauna':
            label = 'Sauna'
        return {'label': label, 'href': f'/content/categories/{topic_path}.html'}

    def next_confirmed_event():
        candidates = []
        for event in events:
            status = str(event.get('status') or '').lower()
            start = parse_iso_date(event.get('startDate') or event.get('start') or '')
            if status == 'confirmed' and start and start >= TODAY:
                candidates.append((start, event))
        if not candidates:
            return None
        candidates.sort(key=lambda x: x[0])
        return candidates[0]

    def picture(base_name, alt='', sizes='(max-width: 720px) 100vw, 42vw'):
        src = f'{img_base}/{base_name}.png'
        ss = img_srcset(src, sizes)
        return f'<img src="{src}"{ss} alt="{esc(alt)}" loading="lazy" width="400" height="300">'

    hero_sources = img_srcset(hero, '(max-width: 720px) 100vw, 42vw')
    weather_attrs = ''
    if lat is not None and lon is not None:
        weather_attrs = f' data-weather-strip data-weather-dynamic data-weather-lat="{esc(lat)}" data-weather-lon="{esc(lon)}"'

    profile = infer_city_profile(d)
    pie_legend = ''.join(
        f'<div><i class="city-pie-key city-pie-key--{cls}"></i><span>{esc(label)}</span><strong>{pct}%</strong></div>'
        for (cls, (label, pct)) in zip(('culture', 'food', 'green', 'events'), profile)
    )
    pie_html = (
        f'<div class="city-pie-mini" aria-label="{esc(name)} city profile split">'
        f'<div class="city-pie-chart" role="img" aria-label="{esc(name)} city profile split"></div>'
        f'<div class="city-pie-legend city-pie-legend--compact">{pie_legend}</div></div>'
        if pie_legend else ''
    )
    history = ensure_city_history(d)
    history_html = ''.join(f'<div><time>{esc(x["label"])}</time><span>{esc(x["text"])}</span></div>' for x in history)
    history_card = (
        f'<div class="country-panel-card city-history-facts" id="history"><h2>City history</h2>'
        f'<div class="country-history-list">{history_html}</div></div>'
        if history_html else ''
    )
    airport_label = airports[0]['name'] if airports else 'Main airport TBC'
    has_real_airport = bool(airports)
    known_for = ', '.join(city_item_label(x) for x in highlights[:4]) if highlights else 'culture, local areas and events'
    founded_year = next((x.get('label') for x in history if re.fullmatch(r'\d{3,4}', str(x.get('label', '')))), None)
    raw_kpis = d.get('kpis')
    # Auto-generate KPIs if missing or empty
    if not raw_kpis or (isinstance(raw_kpis, list) and len(raw_kpis) == 0):
        raw_kpis = []
        if has_population:
            raw_kpis.append({'label': 'Population', 'value': population, 'note': 'city context'})
        raw_kpis.extend([
            {'label': 'Region', 'value': region, 'note': country_name},
            {'label': 'Time zone', 'value': tz, 'note': 'local time'},
        ])
    if founded_year and not any(str(k.get('label', '')).lower() == 'founded' for k in raw_kpis):
        raw_kpis.insert(2, {'label': 'Founded', 'value': founded_year, 'note': 'historic origin'})
    next_event = next_confirmed_event()
    if next_event and not any(str(k.get('label', '')).lower() == 'next event' for k in raw_kpis):
        start_day, event = next_event
        days_until = (start_day - TODAY).days
        value = 'Today' if days_until == 0 else f'{days_until} days'
        raw_kpis.append({'label': 'Next event', 'value': value, 'note': event.get('title') or 'Confirmed event'})
    kpi_cards = ''.join(
        f'<div class="city-kpi-card"><span>{esc(k.get("label", ""))}</span><strong>'
        + (f'<a class="value-link" href="{esc(k.get("href"))}">{esc(k.get("value", ""))}</a>' if k.get('href') else esc(k.get('value', '')))
        + f'</strong><em>{esc(k.get("note") or k.get("text") or "")}</em></div>'
        for k in raw_kpis[:6]
    )

    see_cards = []
    for i, item in enumerate(highlights[:6], start=1):
        label = city_item_label(item)
        fallback_text = (
            f'{label} is a practical {name} planning anchor: compare its location, transfer time, '
            f'nearby hotel bases and event timing before you lock the day plan.'
        )
        text = bounded_text(city_item_text(item), fallback_text, 'see_text_words')
        img = f'{img_base}/{slug}-see-{i}-mini.png'
        img_html = optional_img(img, f'{label}, {name}')
        href = item.get('href') if isinstance(item, dict) else ''
        inner = f'{img_html}<div><h3>{esc(label)}</h3><p>{esc(text)}</p></div>'
        media_class = '' if img_html else ' destination-attraction-card--text-only'
        attrs = f'class="destination-attraction-card{media_class}" data-attraction-name="{esc(label)}"'
        see_cards.append(linked_or_plain('div', href, attrs, inner))
    if not see_cards:
        see_cards.append(f'<p class="country-empty is-visible">Add confirmed sights for {esc(name)} in the city data file.</p>')

    def stay_area(area, idx):
        if isinstance(area, dict):
            label = area.get('name', 'Area')
            fallback = (f'{label} works best when hotel price, local transfers, evening plans and repeat routes '
                        f'matter more than staying beside one single attraction.')
            text = bounded_text(area.get('text'), fallback, 'area_text_words')
            best = area.get('bestFor') or area.get('best_for') or 'first visits, access, availability'
            if isinstance(best, list):
                best = ', '.join(str(x) for x in best if x)
        else:
            label = str(area)
            fallback = (
                f'{label} is the first area to compare for short transfers, simple arrivals, restaurants '
                f'and a practical first-night base.' if idx == 0 else
                f'{label} is useful when price, transit, parking, quieter nights or a specific event route '
                f'changes the best hotel choice.'
            )
            text = bounded_text('', fallback, 'area_text_words')
            best = 'first visits, dining, sightseeing' if idx == 0 else 'availability, access, alternate bases'
        href = booking_search_url(f'{label}, {name}, {country_name}', d)
        area_page = area.get('href') if isinstance(area, dict) else ''
        title = f'<h3>{esc(label)}</h3>'
        if area_page and local_target_exists(area_page):
            title = f'<h3><a href="{esc(area_page)}">{esc(label)}</a></h3>'
        return f'<div class="stay-area">{title}<p>{esc(text)}</p><span>Best for: {esc(best)}</span><a class="stay-card-link{booking_market}" href="{esc(href)}" target="_blank" rel="nofollow sponsored noopener">Compare stays</a></div>'

    areas_html = ''.join(stay_area(a, i) for i, a in enumerate(areas[:8]))
    stay_overview_text = bounded_text(
        d.get('stayOverview') or d.get('stay_overview'),
        f"Compare {', '.join([str(a.get('name') if isinstance(a, dict) else a) for a in areas[:3]]) or name} before booking {name} hotels. Start with the places you will repeat most, then check airport timing, parking, nightly price and event demand before choosing the final base.",
        'stay_overview_words'
    )
    hotel_intro_text = bounded_text(
        d.get('hotelIntro') or d.get('hotel_intro'),
        f"Compare accommodation options in and around {name} by area, not only by nightly price. A cheaper room can become expensive when airport transfers, parking, attraction routes, late arrivals or event-week demand add time and cost.",
        'hotel_intro_words'
    )
    rental_cars_text = bounded_text(
        d.get('rentalCars') or d.get('rental_cars'),
        "Compare rental cars when airport arrival, day trips, parking, luggage, theme parks, coastal routes or nearby regions matter more than staying fully on transit.",
        'tip_text_words'
    )
    raw_tips = d.get('travelTips') or d.get('tips') or []
    default_tips = [
        {'title': 'Best time to visit', 'text': 'Check weather, school holidays, daylight, local festivals and major event calendars before locking in hotel rates or non-refundable tickets.'},
        {'title': 'Transport notes', 'text': 'Choose a base around the trips you will repeat most: airport, station, old town, waterfront, venue district or day-trip route.'},
        {'title': 'Crowds', 'text': 'Prices can jump around festivals, conventions, school holidays, cruise days, ski weeks, race weekends and large sports events.'},
        {'title': 'Booking detail', 'text': 'Compare total cost with taxes, breakfast, parking, resort fees, transfer timing and cancellation terms before choosing the cheapest room.'},
    ]
    if not isinstance(raw_tips, list) or not raw_tips:
        raw_tips = default_tips
    tip_cards = []
    for fallback_tip, item in zip(default_tips, raw_tips[:4]):
        if isinstance(item, dict):
            tip_title = item.get('title') or fallback_tip['title']
            tip_text = bounded_text(item.get('text'), fallback_tip['text'], 'tip_text_words')
        else:
            tip_title = fallback_tip['title']
            tip_text = bounded_text(str(item), fallback_tip['text'], 'tip_text_words')
        tip_cards.append(f'<div class="stay-tip"><strong>{esc(tip_title)}</strong><p>{esc(tip_text)}</p></div>')
    while len(tip_cards) < 4:
        fallback_tip = default_tips[len(tip_cards)]
        tip_cards.append(f'<div class="stay-tip"><strong>{esc(fallback_tip["title"])}</strong><p>{esc(bounded_text("", fallback_tip["text"], "tip_text_words"))}</p></div>')
    airports_html = ''.join(
        f'<li><strong>{esc(a.get("name", "Airport"))}</strong><span>{esc(a.get("search", a.get("name", "")))}</span><p>{esc(bounded_text(a.get("text"), "Compare airport access against hotel location, arrival time, rental car pickup, late flights and onward driving before choosing the first night base.", "airport_text_words"))}</p></li>'
        for a in airports
    ) or f'<li><strong>{esc(name)} airport access</strong><span>Main gateway TBC.</span><p>{esc(bounded_text("", "Compare airport access against hotel location, arrival time, rental car pickup, late flights and onward driving before choosing the first night base.", "airport_text_words"))}</p></li>'

    nearby = []
    raw_nearby = d.get('nearbyIdeas') or d.get('nearby') or []
    if raw_nearby:
        for i, item in enumerate(raw_nearby[:6]):
            if isinstance(item, dict):
                label = item.get('name') or item.get('title') or 'Nearby idea'
                tag = item.get('label') or item.get('type') or ('Core' if i == 0 else 'Nearby')
                href = item.get('href') or ''
                text = bounded_text(item.get('text'), f'Use {label} as a nearby Oslo idea when the route or season fits the trip.', 'nearby_text_words')
            else:
                label = str(item)
                tag = 'Nearby'
                href = ''
                text = bounded_text('', f'Use {label} as a nearby Oslo idea when the route or season fits the trip.', 'nearby_text_words')
            card_inner = f'{node_mini_image(href, label)}<div><span>{esc(tag)}</span><h3>{esc(label)}</h3><p>{esc(text)}</p></div>'
            nearby.append(linked_or_plain('div', href, 'class="destination-nearby-card"', card_inner))
    else:
        for i, area in enumerate(areas[:6]):
            label = area.get('name') if isinstance(area, dict) else str(area)
            text = bounded_text('', f'Compare {label} for hotel fit, transfer time, evening plans and the routes you will repeat most.', 'nearby_text_words')
            nearby_inner = f'{node_mini_image("#stay-hotels-areas", label)}<div><span>{"Core" if i == 0 else "Area"}</span><h3>{esc(label)}</h3><p>{esc(text)}</p></div>'
            nearby.append(f'<a class="destination-nearby-card" href="#stay-hotels-areas">{nearby_inner}</a>')
    for city in d.get('nearbyCities') or []:
        if len(nearby) >= 8:
            break
        if isinstance(city, dict):
            href = city.get('href') or '#'
            cname = city.get('name') or city.get('title') or 'Nearby city'
            text = bounded_text(city.get('text'), f'Use {cname} as another nearby base when routes, hotel prices or event timing point away from {name}.', 'nearby_text_words')
        else:
            href = '#'
            cname = str(city)
            text = bounded_text('', f'Use {cname} as another nearby base when routes, hotel prices or event timing point away from {name}.', 'nearby_text_words')
        city_inner = f'{node_mini_image(href, cname)}<div><span>City</span><h3>{esc(cname)}</h3><p>{esc(text)}</p></div>'
        nearby.append(f'<a class="destination-nearby-card" href="{esc(href)}">{city_inner}</a>')
    nearby_html = ''.join(nearby) or f'<p class="country-empty is-visible">Nearby ideas can be added in {esc(slug)}.city.data.json.</p>'

    upcoming_event_items = []
    past_event_items = []
    for e in events:
        img = optional_img(e.get('img', ''), e.get('title', 'Event'))
        media_class = '' if img else ' visual-topic-card--no-image'
        start = str(e.get('startDate') or e.get('start') or '').strip()
        end = str(e.get('endDate') or e.get('end') or start).strip()
        status = str(e.get('status') or '').strip().lower()
        end_date = parse_iso_date(end)
        is_past = status in ('past', 'ended', 'complete') or (end_date is not None and end_date < TODAY)
        attrs = []
        if start:
            attrs.append(f'data-start="{esc(start)}"')
        if end:
            attrs.append(f'data-end="{esc(end)}"')
        if status:
            attrs.append(f'data-status="{esc(status)}"')
        attr_html = (' ' + ' '.join(attrs)) if attrs else ''
        card = (
            f'<a class="visual-topic-card visual-topic-card--{esc(e.get("modifier", "event"))}{media_class}" '
            f'href="{esc(e["href"])}"{attr_html}>{img}<h3>{esc(e["title"])}</h3><span>{esc(e.get("meta", ""))}</span></a>'
        )
        (past_event_items if is_past else upcoming_event_items).append(card)
    event_cards = ''.join(upcoming_event_items) or f'<p class="country-empty is-visible">No upcoming {esc(name)} events in the shared event index yet.</p>'
    event_teaser_cards = ''.join(upcoming_event_items[:2])
    fact_event_teaser = (
        f'<div class="country-panel-card city-fact-events-teaser" id="event-planning"><h2>Event planning</h2>'
        f'<div class="country-paths country-paths--events">{event_teaser_cards}</div><a class="stay-card-link" href="#events">See all events</a></div>'
        if event_teaser_cards else ''
    )
    past_event_cards = ''.join(past_event_items)
    past_events_html = (
        f'<details class="city-past-events"><summary>Past events</summary><div class="country-paths country-paths--events">{past_event_cards}</div></details>'
        if past_event_cards else ''
    )

    topic_links = []
    topic_candidates = []
    for event in events:
        topic = topic_from_event(event)
        if topic:
            topic_candidates.append(topic)
    for topic in d.get('topicLinks') or d.get('topics') or []:
        topic_candidates.append(topic)
    seen_topics = set()
    def topic_mosaic_class(index, total):
        if total <= 1:
            return ' city-topic-link--span-8x4'
        if total == 2:
            return ' city-topic-link--span-4x4'
        if total == 3:
            return ' city-topic-link--span-4x4' if index == 0 else ' city-topic-link--span-4x2'
        if total == 4:
            return ' city-topic-link--span-4x2'
        return ' city-topic-link--span-4x4' if index == 0 else ' city-topic-link--span-2x2'

    for topic in topic_candidates:
        if not isinstance(topic, dict):
            continue
        href = topic.get('href') or ''
        label = topic.get('label') or topic.get('name') or ''
        key = href or label
        if key in seen_topics:
            continue
        seen_topics.add(key)
        if label and href and local_target_exists(href):
            topic_links.append((label, href))

    topic_link_cards = []
    topic_total = len(topic_links)
    for index, (label, href) in enumerate(topic_links):
        topic_link_cards.append(
                f'<a class="city-topic-link{topic_mosaic_class(index, topic_total)}" href="{esc(href)}">'
                f'{node_mini_image(href, label, class_name="city-topic-link__image")}'
                f'<span>Topic</span><h3>{esc(label)}</h3></a>'
        )
    topic_links_html = ''.join(topic_link_cards)
    topics_html = (
        f'<div class="country-panel-card city-topic-links" id="big-in-{esc(slug)}"><h2>Big in {esc(name)}</h2><div class="city-topic-mosaic">{topic_links_html}</div></div>'
        if topic_links_html else ''
    )

    flight_cta_href = booking_search_url(f'{airport_label}, {country_name}', d)
    rental_cta_href = booking_cars_url(f'{name}, {country_name}')
    flight_cta = (
        f'<div class="city-context-cta"><h3>{esc(airport_label)} arrival plan</h3>'
        f'<ul>{airports_html}</ul><a class="stay-card-link{booking_market}" href="{esc(flight_cta_href)}" target="_blank" rel="nofollow sponsored noopener">Compare airport-area stays</a></div>'
    )
    rental_cta = (
        f'<div class="city-context-cta"><h3>{esc(name)} day-trip car use</h3><p>{esc(rental_cars_text)}</p>'
        f'<a class="stay-card-link{booking_market}" href="{esc(rental_cta_href)}" target="_blank" rel="nofollow sponsored noopener">Compare rental cars</a></div>'
    )

    graph = [
        {"@type": "WebPage", "url": page_url, "name": title, "description": description,
         "inLanguage": "en", "image": f"{DOMAIN}{hero}"},
        {"@type": "TouristDestination", "name": name, "url": page_url,
         "containedInPlace": {"@type": "Country", "name": country_name}},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": country_name, "item": f"{DOMAIN}/content/locations/{cont}/{country_slug}/index.html"},
            {"@type": "ListItem", "position": 2, "name": name, "item": page_url},
        ]},
    ]
    for i, item in enumerate(highlights[:6], start=1):
        label = city_item_label(item)
        href = item.get('href') if isinstance(item, dict) else ''
        if label and href and local_target_exists(href):
            graph.append({"@type": "TouristAttraction", "name": label, "url": f"{DOMAIN}{href}" if href.startswith('/') else href})
    for e in events:
        status = str(e.get('status') or '').strip().lower()
        start = str(e.get('startDate') or e.get('start') or '').strip()
        if status not in ('confirmed', 'expected') or not start:
            continue
        end = str(e.get('endDate') or e.get('end') or start).strip()
        graph.append({
            "@type": "Event",
            "name": e.get('title') or e.get('name') or 'Event',
            "startDate": start,
            "endDate": end,
            "eventStatus": "https://schema.org/EventScheduled",
            "location": {"@type": "Place", "name": name, "address": {"@type": "PostalAddress", "addressCountry": country_name}},
            "url": f"{DOMAIN}{e.get('href')}" if str(e.get('href') or '').startswith('/') else e.get('href'),
        })
    ldjson = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, separators=(',', ':'))

    # Build chip grid with conditional airport chip
    airport_chip = f'<div><span>Airport base</span><strong>{esc(airport_label)}</strong></div>' if has_real_airport else ''
    city_fact_chip_grid = (
        f'<div class="city-fact-chip-grid" aria-label="City quick facts">'
        f'{airport_chip}'
        f'<div><span>Known for</span><strong>{esc(known_for)}</strong></div>'
        f'</div>'
    )

    return f'''<!doctype html>
<html lang="en">
<head>
  <!-- OneSlider generic city page -->
  <link rel="stylesheet" href="/assets/css/oneslider-core.css?v=city-weather-dark-20260614">
  <link rel="preload" as="image" href="{hero_preload}">
  <script defer src="/assets/js/oneslider-core.js?v=city-generic-20260613"></script>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(description)}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="{page_url}">
  <meta name="content-language" content="en">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{esc(title)}">
  <meta property="og:description" content="{esc(description)}">
  <meta property="og:image" content="{DOMAIN}{hero}">
  <meta property="og:url" content="{page_url}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{esc(title)}">
  <meta name="twitter:description" content="{esc(description)}">
  <link rel="alternate" hreflang="en" href="{page_url}">
  <link rel="alternate" hreflang="x-default" href="{page_url}">
  <link rel="icon" href="/assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="/assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="/assets/icons/site.webmanifest">
  <link rel="stylesheet" href="/assets/css/locations.css?v=city-weather-dark-20260614">
  <meta name="theme-color" content="#0d2137">
  <script type="application/ld+json">{ldjson}</script>
</head>
<body class="country-onepage city-page--stay-template city-page--template">
  <nav class="top-menu" aria-label="Location navigation">
    <a class="nav-icon" href="/content/events/index.html" title="Events" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a>
    <a class="nav-icon active" href="/content/locations/index.html" title="World" aria-label="World"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>
    <a class="nav-icon" href="/content/categories/index.html" title="Categories" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a>
    <span class="nav-divider"></span><a class="nav-back" href="/content/locations/{cont}/{country_slug}/index.html" title="Back to {esc(country_name)}" aria-label="Back to {esc(country_name)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg><span>{esc(country_name)}</span></a>
    <span class="nav-spacer"></span><details class="nav-language"><summary aria-label="Language">EN</summary><div class="nav-language__list"><a href="/content/locations/{cont}/{country_slug}/{slug}.html" aria-current="page">EN</a></div></details>
  </nav>
  <main class="page-shell country-slide country-content-box">
    <section class="country-brief" aria-label="{esc(name)} one-slide overview">
      <div class="country-brief__copy">
        <div class="city-left-fixed-head"><picture class="country-hero-image country-hero-image--clear"><source srcset="{esc(hero_1200)} 1200w" sizes="(max-width: 720px) 100vw, 42vw" type="image/webp"><img src="{hero}"{hero_sources} alt="{esc(name)} city waterfront and skyline" width="1200" height="630" loading="eager" decoding="async"></picture><div class="city-title-row"><h1 class="hero-title">{esc(h1_text)}</h1><div class="city-local-time-card" data-local-time data-time-zone="{esc(tz)}"><div><span>Local time</span><strong data-local-time-value>--:--</strong></div><em data-local-time-zone>{esc(name)} time</em></div></div></div>
        <div class="city-left-scroll"><div class="stay-weather-card stay-weather-card--strip"{weather_attrs}><div class="stay-weather-title-row"><h2>Weather Forecast</h2><span>{esc(name)}, {esc(country_name)}</span></div><div class="stay-weather-page is-active" data-weather-page="0"><div class="stay-weather-days"><article class="stay-weather-tile"><strong>Loading</strong><div class="stay-weather-reading"><span class="weather-icon weather-icon--partly" aria-hidden="true"></span><span class="stay-weather-temp">Forecast</span></div></article></div></div><p class="stay-weather-source">Open-Meteo forecast.</p></div><section class="city-intro-block" aria-labelledby="{slug}-city-overview"><h2 id="{slug}-city-overview">{esc(intro_title)}</h2><p class="hero-text">{esc(intro)}</p></section></div>
        <div class="city-left-fixed-foot"><a class="location-parent-card city-country-card" href="/content/locations/{cont}/{country_slug}/index.html" aria-label="Explore {esc(country_name)}"><img src="{country_mini}"{img_srcset(country_mini, "136px")} alt="{esc(country_mini_alt)}" loading="lazy" width="400" height="300"><span>Part of {esc(country_name)}</span><strong>Explore more {esc(country_name)}</strong><em>More cities, stays and event bases across {esc(country_name)}.</em></a></div>
      </div>
      <div class="country-brief__panel"><section class="persona-tabs" aria-label="Choose {esc(name)} view"><input type="radio" name="{slug}-view" id="view-visit" checked><input type="radio" name="{slug}-view" id="view-see"><input type="radio" name="{slug}-view" id="view-stay"><input type="radio" name="{slug}-view" id="view-nearby"><input type="radio" name="{slug}-view" id="view-events">{'<input type="radio" name="' + slug + '-view" id="view-big">' if topics_html else ''}<div class="persona-tablist" role="tablist" aria-label="Choose {esc(name)} outcome"><label for="view-visit" role="tab">Fact</label><label for="view-see" role="tab">See</label><label for="view-stay" role="tab">Visit</label><label for="view-nearby" role="tab">Nearby</label><label for="view-events" role="tab">Events</label>{'<label for="view-big" role="tab">Big in ' + esc(name) + '</label>' if topics_html else ''}</div>
        <div class="persona-panel view-panel--visit" id="fact"><div class="country-panel-card city-facts-hero"><div class="city-facts-header"><h2>City facts</h2>{pie_html}</div>{city_fact_chip_grid}<div class="city-kpi-grid">{kpi_cards}</div></div>{history_card}{fact_event_teaser}</div>
        <div class="persona-panel view-panel--see" id="see"><div class="country-panel-card"><h2>Worth seeing</h2><div class="destination-attraction-grid">{''.join(see_cards)}</div></div></div>
        <div class="persona-panel view-panel--stay" id="visit"><div class="stay-planner-layout"><nav class="stay-section-menu" aria-label="Stay planning sections"><a href="#stay-overview">Overview</a><a href="#stay-hotels-areas">Hotels &amp; Areas</a><a href="#stay-flights-airports">Flights &amp; Airports</a><a href="#stay-rental-cars">Rental cars</a><a href="#stay-tips">Tips</a></nav><div class="stay-section-stack"><div class="country-panel-card stay-overview-card stay-section-panel" id="stay-overview"><h2>Stay overview</h2><p>{esc(stay_overview_text)}</p></div><div class="country-panel-card stay-booking-card stay-section-panel" id="stay-hotels-areas"><h2>Hotels &amp; areas</h2><p>{esc(hotel_intro_text)}</p><div class="stay-area-grid">{areas_html}</div><a class="stay-booking-button{booking_market}" href="{esc(booking_search_url(booking_destination, d))}" target="_blank" rel="nofollow sponsored noopener">Compare stays in {esc(booking_destination)}</a></div><div class="country-panel-card stay-section-panel" id="stay-flights-airports"><h2>Flights &amp; airports</h2>{flight_cta}</div><div class="country-panel-card stay-section-panel" id="stay-rental-cars"><h2>Rental cars</h2>{rental_cta}</div><div class="country-panel-card stay-section-panel" id="stay-tips"><h2>Travel tips</h2><div class="stay-tip-grid">{''.join(tip_cards)}</div></div></div></div></div>
        <div class="persona-panel view-panel--nearby" id="nearby"><div class="country-panel-card"><h2>Nearby ideas</h2><div class="destination-nearby-grid">{nearby_html}</div></div></div>
        <div class="persona-panel view-panel--events" id="events"><div class="country-panel-card"><h2>Upcoming events</h2><div class="country-paths country-paths--events" data-expiring-events>{event_cards}</div>{past_events_html}</div></div>
        {f'<div class="persona-panel view-panel--big" id="big-in">{topics_html}</div>' if topics_html else ''}
      </section></div>
    </section>
  </main>
</body>
</html>
'''


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
    upcoming_event_items = []
    past_event_items = []
    for e in d['events']:
        start = str(e.get('startDate') or e.get('start') or '').strip()
        end = str(e.get('endDate') or e.get('end') or start).strip()
        status = str(e.get('status') or '').strip().lower()
        end_date = parse_iso_date(end)
        is_past = status in ('past', 'ended', 'complete') or (end_date is not None and end_date < TODAY)
        attrs = []
        if start:
            attrs.append(f'data-start="{esc(start)}"')
        if end:
            attrs.append(f'data-end="{esc(end)}"')
        if status:
            attrs.append(f'data-status="{esc(status)}"')
        attr_html = (' ' + ' '.join(attrs)) if attrs else ''
        card = (
            f'<a class="visual-topic-card visual-topic-card--{esc(e["modifier"])}" href="{esc(e["href"])}"{attr_html}>'
            f'{mini_img(e["img"], e["title"])}<strong>{esc(e["title"])}</strong><span>{esc(e["meta"])}</span></a>'
        )
        (past_event_items if is_past else upcoming_event_items).append(card)
    events = ''.join(upcoming_event_items) or f'<p class="country-empty is-visible">No upcoming {esc(name)} events in the shared event index yet.</p>'
    past_events = ''.join(past_event_items)
    past_events_block = (
        f'<details class="city-past-events"><summary>Past events</summary><div class="country-paths country-paths--events">{past_events}</div></details>'
        if past_events else ''
    )
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
            <div class="country-panel-card"><h2>Upcoming events</h2><div class="country-paths country-paths--events" data-expiring-events>{events}</div>{past_events_block}</div>
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


def write_missing_node_mini_log():
    if not MISSING_NODE_MINIS:
        return
    log_dir = os.path.join(ROOT, 'tmp')
    os.makedirs(log_dir, exist_ok=True)
    lines = []
    seen = set()
    for item in MISSING_NODE_MINIS:
        key = (item.get('href'), item.get('label'))
        if key in seen:
            continue
        seen.add(key)
        candidates = ', '.join(item.get('candidates') or [])
        lines.append(f"{item.get('label')} | {item.get('href')} | tried: {candidates}")
    write(os.path.join(log_dir, 'city-node-mini-missing.log'), '\n'.join(lines) + '\n')


def build_city(city_path, extract_first=False):
    # Use .city.data.json so it never collides with the country's <slug>.data.json
    # (matters for city-states like monaco/monaco.html + monaco/index.html).
    data_path = os.path.splitext(city_path)[0] + '.city.data.json'
    if extract_first or not os.path.isfile(data_path):
        data = extract(city_path)
        write(data_path, json.dumps(data, ensure_ascii=False, indent=2))
    else:
        data = json.load(open(data_path, encoding='utf-8-sig'))

    # Inject population from mapping if missing/placeholder
    current_pop = data.get('population')
    city_name = data.get('name')
    should_have_population = False

    if (not current_pop or current_pop in ('tba', 'TBC', 'TBD', 'pending')) and city_name in POPULATION_MAP:
        pop_val = POPULATION_MAP[city_name]
        if pop_val:
            data['population'] = pop_val
            should_have_population = True
            # Also update kpis if they exist
            if 'kpis' in data and isinstance(data['kpis'], list):
                for kpi in data['kpis']:
                    if isinstance(kpi, dict) and kpi.get('label', '').lower() in ('city population', 'population'):
                        kpi['value'] = format_population(pop_val)
                        kpi['note'] = 'city context'

    # Remove Population KPI if no data exists
    if not should_have_population and 'kpis' in data and isinstance(data['kpis'], list):
        data['kpis'] = [kpi for kpi in data['kpis']
                       if not (isinstance(kpi, dict) and kpi.get('label', '').lower() in ('city population', 'population'))]

    # Inject airport from mapping if missing/placeholder
    if city_name in AIRPORT_MAP and (not data.get('airports') or data.get('airports') == []):
        airport_name = AIRPORT_MAP[city_name]
        data['airports'] = [{'name': airport_name, 'search': f'{airport_name}, {city_name}'}]

    data = normalize_city_data(data, city_path)
    html = render_template_city(data)
    write(os.path.normpath(city_path), html)
    write_missing_node_mini_log()
    return data


def template_preview_data():
    return {
        'slug': 'oslo',
        'name': 'Template City',
        'continent': 'europe',
        'continentName': 'Europe',
        'countrySlug': 'norway',
        'countryName': 'Country',
        'region': 'Region / metro area',
        'population': 'Population',
        'timezone': 'Europe/Oslo',
        'coordinates': {'lat': 59.91, 'lon': 10.75},
        'seo': {
            'title': 'City Page Template Preview',
            'description': 'Generated preview for the generic OneSliders city page template.',
        },
        'introTitle': 'City overview',
        'heroText': (
            'This is the main city overview slot. The generator replaces this text with city-specific facts '
            'about the place itself, while the page frame, navigation, weather, parent card and shared CSS remain stable.'
        ),
        'areas': [
            {'name': 'Central base', 'text': 'Area comparison slot for the main first-visit base near repeat routes and transport.'},
            {'name': 'Second area', 'text': 'Area comparison slot for a quieter or better-value base when price and timing matter.'},
        ],
        'airports': [
            {'name': 'Main airport', 'search': 'Template City, Country'},
            {'name': 'Secondary airport', 'search': 'Template City, Country'},
        ],
        'highlights': [
            {'title': 'Attraction one', 'text': 'Attraction copy slot shown with a matching city See image when the image file exists.'},
            {'title': 'Attraction two', 'text': 'Attraction copy slot shown with a matching city See image when the image file exists.'},
            {'title': 'Attraction three', 'text': 'Attraction copy slot shown with a matching city See image when the image file exists.'},
            {'title': 'Attraction four', 'text': 'Attraction copy slot shown with a matching city See image when the image file exists.'},
            {'title': 'Attraction five', 'text': 'Attraction copy slot shown with a matching city See image when the image file exists.'},
            {'title': 'Attraction six', 'text': 'Attraction copy slot shown with a matching city See image when the image file exists.'},
        ],
        'history': [
            {'label': '1624', 'text': 'Early settlement, harbor, river, fort or market activity shape the first city identity.'},
            {'label': '1700s', 'text': 'Growth period slot for verified trade, civic, industrial, religious or regional development.'},
            {'label': '1898', 'text': 'Modern municipal structure, rail links, roads or new districts reshape the city.'},
            {'label': '1920s', 'text': 'Public buildings, planning, migration, economy or culture change how the city works.'},
            {'label': '1970s', 'text': 'Modern industry, visitor economy, university, airport or event growth changes the city role.'},
            {'label': 'Today', 'text': 'Current population, economy, culture, transport and regional role define the city profile now.'},
        ],
        'kpis': [
            {'label': 'Population', 'value': '8.3M', 'note': 'city proper'},
            {'label': 'Metro', 'value': '19.5M', 'note': 'urban region'},
            {'label': 'Founded', 'value': '1624', 'note': 'historic origin'},
            {'label': 'Airports', 'value': '2', 'note': 'main gateways'},
        ],
        'cityProfile': [
            {'label': 'Culture', 'pct': 35},
            {'label': 'Water', 'pct': 20},
            {'label': 'Parks', 'pct': 15},
            {'label': 'Events', 'pct': 30},
        ],
        'bookingDestination': 'Template City, Country',
    }


def make_tmp_preview_html(html):
    html = html.replace(
        '<body class="country-onepage city-page--stay-template city-page--template">',
        '<body class="country-onepage city-page--stay-template city-page--template city-page--template-preview">'
    )
    replacements = (
        ('href="/', 'href="../../'),
        ('src="/', 'src="../../'),
        ('srcset="/', 'srcset="../../'),
        (', /', ', ../../'),
        ('urlTemplate": "/', 'urlTemplate": "../../'),
    )
    for old, new in replacements:
        html = html.replace(old, new)
    return html


def build_template_preview():
    data = template_preview_data()
    html = render_template_city(data)
    template_path = os.path.join(ROOT, 'scripts', 'templates', 'city-page-template.html')
    preview_path = os.path.join(ROOT, 'tmp', 'city-template-preview', 'index.html')
    write(template_path, html)
    write(preview_path, make_tmp_preview_html(html))
    return template_path, preview_path


def city_paths_from_data(pattern, exclude_prefixes=()):
    paths = []
    for data_path in glob.glob(os.path.join(ROOT, pattern), recursive=True):
        rel_data = os.path.relpath(data_path, ROOT).replace('\\', '/')
        if rel_data == 'content/locations/world.city.data.json':
            continue
        if exclude_prefixes and rel_data.startswith(exclude_prefixes):
            continue
        city_path = data_path[:-len('.city.data.json')] + '.html'
        paths.append(city_path)
    return sorted(paths)


def build_city_paths(paths):
    count = 0
    for c in paths:
        d = build_city(c)
        print(f"  {d['continent']}/{d['countrySlug']}/{d['slug']}: {booking_base_url(d)}")
        count += 1
    return count


def main(argv):
    exclude_prefixes = []
    i = 0
    while i < len(argv):
        if argv[i] == '--exclude-prefix' and i + 1 < len(argv):
            exclude_prefixes.append(argv[i + 1].replace('\\', '/').strip('/'))
            del argv[i:i + 2]
            continue
        i += 1
    exclude_prefixes = tuple(exclude_prefixes)

    if '--template-preview' in argv:
        template_path, preview_path = build_template_preview()
        print(f"Built city template: {template_path}")
        print(f"Built city template preview: {preview_path}")
        return 0
    if '--all' in argv:
        cities = city_paths_from_data('content/locations/**/*.city.data.json', exclude_prefixes)
        count = build_city_paths(cities)
        print(f"Built {count} city pages from all city data files.")
        return 0
    if '--booking-markets' in argv:
        cities = []
        cities.extend(city_paths_from_data('content/locations/europe/*/*.city.data.json', exclude_prefixes))
        cities.extend(city_paths_from_data('content/locations/north-america/usa/*.city.data.json', exclude_prefixes))
        cities.extend(city_paths_from_data('content/locations/north-america/canada/*.city.data.json', exclude_prefixes))
        count = build_city_paths(cities)
        print(f"Built {count} city pages for Europe, USA and Canada.")
        return 0
    if '--country' in argv:
        i = argv.index('--country')
        cont = argv[i + 1]
        country = argv[i + 2]
        cities = city_paths_from_data(f'content/locations/{cont}/{country}/*.city.data.json', exclude_prefixes)
        count = build_city_paths(cities)
        print(f"Built {count} city pages in {cont}/{country}.")
        return 0
    if '--continent' in argv:
        cont = argv[argv.index('--continent') + 1]
        cities = city_paths_from_data(f'content/locations/{cont}/*/*.city.data.json', exclude_prefixes)
        count = build_city_paths(cities)
        print(f"Built {count} city pages in {cont}.")
        return 0
    if not argv:
        print('Usage: build_city_page.py <city.html> | --continent <name>'); return 1
    t = argv[0] if os.path.isabs(argv[0]) else os.path.join(ROOT, argv[0])
    build_city(t)
    print('built', t)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
