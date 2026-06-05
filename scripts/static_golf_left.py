#!/usr/bin/env python3
"""Rewrite the left-side `<div class="event-frame__copy">` on every golf event
page to a STATIC, generic block. The right-side panel still shows year tabs
(unchanged). No data-year-title / data-identity-* / snapshot-card on the left —
so switching year no longer touches the left side."""
import re, json, glob, os, time

GOLF = "content/categories/sport/golf/events"
DATA_RE = re.compile(
    r'<script type="application/json" id="event-year-data">(.*?)</script>', re.S)
COPY_RE = re.compile(r'<div class="event-frame__copy">.*?</div>\s*</section>', re.S)

# Real venue/country map (already in the data after fill_golf_venues.py).
def write(p, s):
    for _ in range(6):
        try:
            open(p, "w", encoding="utf-8", newline="\n").write(s); return True
        except OSError:
            time.sleep(0.3)
    return False


def clean(s):
    return re.sub(r"<[^>]+>", "", s or "").strip()


def slug_to_locations(country_name):
    # crude country->slug for the flag URL (matches what the events use)
    overrides = {
        "United States": ("north-america", "usa"),
        "United Kingdom": ("europe", "united-kingdom"),
        "South Korea": ("asia", "south-korea"),
        "Dominican Republic": ("north-america", "dominican-republic"),
        "Puerto Rico": ("north-america", "puerto-rico"),
        "Saudi Arabia": ("asia", "saudi-arabia"),
        "Singapore": ("asia", "singapore"),
        "Bermuda": ("north-america", "bermuda"),
    }
    if country_name in overrides:
        return overrides[country_name]
    # default guess - europe slug
    s = country_name.lower().replace(" ", "-")
    return ("europe", s) if country_name in (
        "France", "Spain", "Italy", "Germany", "Netherlands", "Ireland",
        "Norway", "Sweden", "Denmark") else ("asia", s)


def detect_tour(data):
    name = data.get("eventName", "")
    slug = data.get("slug", "")
    # Tour can come from FAQ Q "What is the tour?"
    for ed in data.get("editions", []):
        for q in ed.get("questions") or []:
            if "tour" in q.get("q", "").lower():
                lab = clean(q.get("a", ""))
                if lab:
                    return lab
    if "Ryder Cup" in name:
        return "Ryder Cup"
    if "Solheim Cup" in name:
        return "Solheim Cup"
    if "LIV" in name or slug.startswith("liv"):
        return "LIV Golf"
    # LPGA detection
    lpga_signals = ["lpga", "ladies", "womens", "women's"]
    if any(s in slug.lower() or s in name.lower() for s in lpga_signals):
        return "LPGA Tour"
    return "PGA Tour"


def best_format(data):
    # Use the format from an edition that has it, else generic
    for ed in data.get("editions", []):
        f = clean(ed.get("format", ""))
        if f and f.upper() != "TBC":
            return f
    return ""


def is_team_event(data):
    for ed in data.get("editions", []):
        if ed.get("sessionScores") or ed.get("liveResults"):
            return True
    name = data.get("eventName", "")
    return ("Ryder Cup" in name or "Solheim Cup" in name or "Presidents Cup" in name)


def first_event_country(data):
    for ed in data.get("editions", []):
        cs = ed.get("countries") or []
        if cs and cs[0].get("name"):
            return cs[0]
    return None


def build_static_copy(data, slug):
    name = data.get("eventName", "")
    tour = detect_tour(data)
    fmt = best_format(data)
    team = is_team_event(data)

    # Generic lede
    if team:
        gender = "women's" if "Solheim" in name else "men's"
        cup = "biennial" if ("Ryder" in name or "Solheim" in name or "Presidents" in name) else ""
        lede = (f"{name} is the {cup} {gender} golf match-play between Europe and the United States.").replace("  ", " ")
    else:
        lede = f"{name} is a stop on the {tour} schedule. Use this page to browse every edition, results and key facts."

    facts = [("Tour", tour)]
    if fmt:
        facts.append(("Format", fmt))

    if team:
        teams_html = (
            '<span class="country country--team">'
            '<img class="country__team-icon" src="/assets/icons/europe-team.svg" alt="" width="40" height="28" loading="lazy">Europe</span>'
            ' vs '
            '<a class="country" href="/content/locations/north-america/usa/index.html">'
            '<img src="/content/locations/north-america/usa/img/flag.svg" alt="" width="20" height="14" loading="lazy">United States</a>')
        facts.append(("Teams", teams_html))
    else:
        # link the host country for individual events (using the most recent past
        # edition's country; this is static metadata, not a year-specific value)
        c = first_event_country(data)
        if c and c.get("name"):
            url = c.get("url") or ""
            flag = c.get("flag") or ""
            if url and flag:
                facts.append(("Host country",
                    f'<a class="country" href="{url}"><img src="{flag}" alt="" width="20" height="14" loading="lazy">{clean(c["name"])}</a>'))

    # Editions count
    n_eds = len([e for e in data.get("editions", []) if e.get("year")])
    if n_eds:
        years = sorted(int(e["year"]) for e in data.get("editions", []) if e.get("year"))
        facts.append(("Editions", f"{n_eds} (since {years[0]})"))

    facts_html = "".join(
        f'<div class="fact"><span>{lbl}</span><strong>{val}</strong></div>'
        for lbl, val in facts)

    copy = (
        '<div class="event-frame__copy">'
        '<div>'
        f'<h1 class="event-title" id="event-title">{name}</h1>'
        f'<p class="event-lede">{lede}</p>'
        '</div>'
        f'<div class="facts-strip">{facts_html}</div>'
        '<a class="topic-card topic-card--inline" href="/content/categories/sport/golf.html" aria-label="Open the Golf topic page">'
        '<img src="/content/categories/sport/img/golf-mini.png" alt="Golf thumbnail" width="400" height="300" loading="eager">'
        '<span>More golf</span><strong>Golf topic</strong>'
        '<p>More majors, courses and calendar moments.</p></a>'
        '</div></section>'
    )
    return copy


def main():
    n = 0
    for p in sorted(glob.glob(os.path.join(GOLF, "*.html"))):
        s = open(p, encoding="utf-8").read()
        m = DATA_RE.search(s)
        if not m:
            continue
        data = json.loads(m.group(1))
        slug = os.path.splitext(os.path.basename(p))[0]
        new_copy = build_static_copy(data, slug)
        # find the event-frame__copy block ending at </section>
        s2, n_sub = COPY_RE.subn(new_copy, s, count=1)
        if n_sub == 0:
            continue
        if write(p, s2):
            n += 1
    print(f"Rewrote left-side copy on {n} golf event pages")


if __name__ == "__main__":
    main()
