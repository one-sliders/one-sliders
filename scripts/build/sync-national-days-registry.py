"""Sync national-days-content.csv → events.register.json + scripts/data/national-days.json.
Adds any CSV slug missing from either JSON file. Does not touch existing entries.
"""
import csv, json, os, re
from datetime import date

ROOT = os.path.join(os.path.dirname(__file__), '../..')
CSV_PATH     = os.path.join(ROOT, 'Templates/data/national-days-content.csv')
REG_PATH     = os.path.join(ROOT, 'events.register.json')
ND_PATH      = os.path.join(ROOT, 'scripts/data/national-days.json')
TODAY        = date.today()

MONTHS = {
    'January':1,'February':2,'March':3,'April':4,'May':5,'June':6,
    'July':7,'August':8,'September':9,'October':10,'November':11,'December':12,
}

# ── Country → continent mapping ───────────────────────────────────────────────
CONTINENT = {
    # Africa
    'algeria':'africa','angola':'africa','benin':'africa','botswana':'africa',
    'burkina-faso':'africa','burundi':'africa','cabo-verde':'africa','cameroon':'africa',
    'central-african-republic':'africa','chad':'africa','comoros':'africa',
    'democratic-republic-of-the-congo':'africa','djibouti':'africa','egypt':'africa',
    'equatorial-guinea':'africa','eritrea':'africa','ethiopia':'africa','eswatini':'africa',
    'gabon':'africa','gambia':'africa','ghana':'africa','guinea':'africa',
    'guinea-bissau':'africa','ivory-coast':'africa','kenya':'africa','lesotho':'africa',
    'liberia':'africa','libya':'africa','madagascar':'africa','malawi':'africa',
    'mali':'africa','mauritania':'africa','mauritius':'africa','morocco':'africa',
    'mozambique':'africa','namibia':'africa','niger':'africa','nigeria':'africa',
    'republic-of-the-congo':'africa','rwanda':'africa','sao-tome-and-principe':'africa',
    'senegal':'africa','seychelles':'africa','sierra-leone':'africa','somalia':'africa',
    'south-africa':'africa','south-sudan':'africa','sudan':'africa','tanzania':'africa',
    'togo':'africa','tunisia':'africa','uganda':'africa','zambia':'africa',
    'zimbabwe':'africa',
    # Asia
    'afghanistan':'asia','bahrain':'asia','bangladesh':'asia','bhutan':'asia',
    'brunei':'asia','cambodia':'asia','china':'asia','india':'asia','indonesia':'asia',
    'iran':'asia','iraq':'asia','israel':'asia','japan':'asia','jordan':'asia',
    'kazakhstan':'asia','kuwait':'asia','kyrgyzstan':'asia','laos':'asia',
    'lebanon':'asia','malaysia':'asia','maldives':'asia','mongolia':'asia',
    'myanmar':'asia','nepal':'asia','north-korea':'asia','oman':'asia',
    'pakistan':'asia','palestine':'asia','philippines':'asia','qatar':'asia',
    'saudi-arabia':'asia','singapore':'asia','south-korea':'asia','sri-lanka':'asia',
    'syria':'asia','taiwan':'asia','tajikistan':'asia','thailand':'asia',
    'timor-leste':'asia','turkmenistan':'asia','united-arab-emirates':'asia',
    'uzbekistan':'asia','vietnam':'asia','yemen':'asia',
    # North & Central America + Caribbean
    'antigua-and-barbuda':'north-america','bahamas':'north-america',
    'barbados':'north-america','belize':'north-america','canada':'north-america',
    'costa-rica':'north-america','cuba':'north-america','dominica':'north-america',
    'dominican-republic':'north-america','el-salvador':'north-america',
    'grenada':'north-america','guatemala':'north-america','guyana':'south-america',
    'haiti':'north-america','honduras':'north-america','jamaica':'north-america',
    'mexico':'north-america','nicaragua':'north-america','panama':'north-america',
    'saint-kitts-and-nevis':'north-america','saint-lucia':'north-america',
    'saint-vincent-and-the-grenadines':'north-america','suriname':'south-america',
    'trinidad-and-tobago':'north-america','usa':'north-america',
    # South America
    'argentina':'south-america','bolivia':'south-america','colombia':'south-america',
    'ecuador':'south-america','paraguay':'south-america','peru':'south-america',
    'uruguay':'south-america','venezuela':'south-america',
    # Oceania
    'australia':'oceania','kiribati':'oceania','marshall-islands':'oceania',
    'micronesia':'oceania','nauru':'oceania','new-zealand':'oceania','palau':'oceania',
    'papua-new-guinea':'oceania','samoa':'oceania','solomon-islands':'oceania',
    'tonga':'oceania','tuvalu':'oceania','vanuatu':'oceania',
    # Europe extras (not in existing 52)
    'england':'europe','faroe-islands':'europe','greenland':'north-america',
    'scotland':'europe','wales':'europe','united-kingdom':'europe',
}

# Approximate fixed dates for special cases
SPECIAL_DATES = {
    'israel-national-day':      (23, 4),   # Yom Ha'atzmaut ≈ late April
    'united-kingdom-national-day': (14, 6), # Trooping the Colour ≈ second Saturday June
}

def parse_date_text(date_text):
    """Parse '4 July' → (4, 7). Returns (None, None) if unparseable."""
    m = re.match(r'^(\d{1,2})\s+([A-Za-z]+)$', date_text.strip())
    if m:
        day = int(m.group(1))
        month = MONTHS.get(m.group(2))
        if month:
            return day, month
    return None, None

def next_year_for(day, month):
    """Return the next upcoming year for this date (from TODAY)."""
    try:
        d = date(TODAY.year, month, day)
    except ValueError:
        d = date(TODAY.year, month, 28)  # safety for Feb 29 etc
    return TODAY.year if d >= TODAY else TODAY.year + 1

def fmt_date(year, month, day):
    return f'{year}-{month:02d}-{day:02d}'

def display_date(year, month, day):
    mn = list(MONTHS.keys())[month - 1][:3]
    return f'{day} {mn} {year}'

def country_slug_from_slug(slug):
    return slug.replace('-national-day', '').replace('-independence-day', '')

def continent_for(slug):
    cs = country_slug_from_slug(slug)
    return CONTINENT.get(cs, 'world')

def title_from(slug, country):
    """Derive a human title from the slug."""
    suffixes = {
        '-national-day': 'National Day',
        '-independence-day': 'Independence Day',
        '-constitution-day': 'Constitution Day',
        '-liberation-day': 'Liberation Day',
        '-republic-day': 'Republic Day',
        '-statehood-day': 'Statehood Day',
    }
    for suffix, label in suffixes.items():
        if slug.endswith(suffix):
            return f'{country} {label}'
    return f'{country} National Day'

# ── Load sources ──────────────────────────────────────────────────────────────
with open(CSV_PATH, encoding='utf-8-sig', newline='') as f:
    csv_rows = {r['slug']: r for r in csv.DictReader(f, delimiter=';') if r.get('slug')}

with open(REG_PATH, encoding='utf-8') as f:
    reg = json.load(f)
reg_slugs = {e['slug'] for e in reg['events']}

with open(ND_PATH, encoding='utf-8') as f:
    nd_list = json.load(f)
nd_slugs = {e['eventSlug'] for e in nd_list}

# ── Build new entries ─────────────────────────────────────────────────────────
new_reg = []
new_nd  = []

for slug in sorted(csv_rows):
    row     = csv_rows[slug]
    country = row['country']
    dt      = row['dateText']

    # Parse date
    if slug in SPECIAL_DATES:
        day, month = SPECIAL_DATES[slug]
    else:
        day, month = parse_date_text(dt)

    if day is None or month is None:
        print(f'  SKIP (unparseable date): {slug} — "{dt}"')
        continue

    ny          = next_year_for(day, month)
    start_date  = fmt_date(ny, month, day)
    display     = display_date(ny, month, day)
    event_title = title_from(slug, country)
    continent   = continent_for(slug)

    # First stay city as primary city
    cities = [c.strip() for c in row.get('stayCities','').split('|') if c.strip()]
    city   = cities[0] if cities else country

    # Short reason from why_para1 (first sentence, max 120 chars)
    para1  = row.get('why_para1', '').strip()
    reason = (para1.split('.')[0] + '.').strip() if para1 else f'{event_title} — national celebration'
    if len(reason) > 120:
        reason = reason[:117] + '...'

    # ── events.register.json entry ────────────────────────────────────────────
    if slug not in reg_slugs:
        new_reg.append({
            'slug':          slug,
            'title':         event_title,
            'category':      'culture',
            'topic':         'national-day',
            'notesFile':     f'docs/events/culture/national-day/{slug}.md',
            'location': {
                'countries': [country],
                'cities':    ['Nationwide'],
                'venue':     country,
            },
            'currentEdition':  ny,
            'startDate':       start_date,
            'endDate':         start_date,
            'displayDates':    display,
            'status':          'upcoming',
            'sourceStatus':    'upcoming',
            'statusLabel':     'Scheduled',
            'updateMode':      'event-update',
            'priority':        'normal',
            'lastChecked':     '22 June 2026',
            'sources': [
                {'label': 'OneSliders country page',
                 'url':   f'/content/locations/{continent}/{slug.replace("-national-day","")}/'}
            ],
            'eventPageEN': f'content/categories/culture/national-day/events/{slug}.html',
        })

    # ── national-days.json entry ──────────────────────────────────────────────
    if slug not in nd_slugs:
        new_nd.append({
            'continent':   continent,
            'countrySlug': slug.replace('-national-day','').replace('-independence-day',''),
            'country':     country,
            'dateText':    dt,
            'day':         day,
            'month':       month,
            'nextYear':    ny,
            'startDate':   start_date,
            'title':       event_title,
            'eventSlug':   slug,
            'city':        city,
            'reason':      reason,
            'why': {
                'title': event_title,
                'text':  para1[:300] if para1 else f'Annual national celebration of {country}.',
            },
        })

# ── Write ─────────────────────────────────────────────────────────────────────
if new_reg:
    # Insert after last national-day entry in events array
    last_nd_idx = max(
        (i for i, e in enumerate(reg['events']) if e.get('topic') == 'national-day'),
        default=len(reg['events']) - 1
    )
    for entry in reversed(new_reg):
        reg['events'].insert(last_nd_idx + 1, entry)
    with open(REG_PATH, 'w', encoding='utf-8') as f:
        json.dump(reg, f, indent=2, ensure_ascii=False)
    print(f'events.register.json: added {len(new_reg)} entries')
else:
    print('events.register.json: nothing to add')

if new_nd:
    nd_list.extend(new_nd)
    with open(ND_PATH, 'w', encoding='utf-8') as f:
        json.dump(nd_list, f, indent=2, ensure_ascii=False)
    print(f'national-days.json:   added {len(new_nd)} entries')
else:
    print('national-days.json:   nothing to add')
