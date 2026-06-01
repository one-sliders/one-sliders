from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
STAMP = "1 June 2026"
INDEX = ROOT / "content" / "events" / "index.html"


def roll_date(value: str) -> str:
    return re.sub(r"^2026-", "2027-", value)


def title_from_card(card: str) -> str:
    match = re.search(r'<strong class="card-title">([^<]+)</strong>', card)
    return match.group(1) if match else "Event"


def local_page(href: str) -> Path | None:
    if not href.startswith("../categories/"):
        return None
    return ROOT / "content" / href.removeprefix("../").replace("/", "\\")


def next_edition(data: dict) -> dict | None:
    editions = data.get("editions")
    if not isinstance(editions, list) or not editions:
        return None
    source = None
    for edition in editions:
        if edition.get("year") == 2026:
            source = edition
            break
    if source is None:
        source = editions[-1]
    edition = json.loads(json.dumps(source))
    event_name = data.get("eventName") or data.get("slug", "Event").replace("-", " ").title()
    edition.update({
        "year": 2027,
        "status": "upcoming",
        "statusLabel": "Date TBC",
        "startDate": "",
        "endExclusive": "",
        "nextDate": "",
        "dates": "2027 date TBC",
        "result": "",
        "resultLabel": "",
        "winner": None,
        "scoreProgression": {"rounds": [], "players": [], "note": "This edition has not started."},
        "countdownText": "Next edition details are TBC; check official sources before travel.",
        "calendarDescription": f"{event_name} 2027.",
        "highlights": [],
    })
    if "headingPlace" in edition:
        edition["headingPlace"] = re.sub(r"\b2026\b", "2027", str(edition["headingPlace"]))
    questions = edition.get("questions")
    if isinstance(questions, list):
        for question in questions:
            if question.get("q") == "When is the event?":
                question["a"] = "2027 date TBC"
                question["detail"] = "Exact 2027 details should be verified from the official organiser."
            elif "result" in str(question.get("q", "")).lower():
                question["a"] = "Not played yet"
                question["detail"] = "Add verified results after the 2027 edition."
    return edition


def roll_page(path: Path) -> bool:
    if not path.exists():
        return False
    source = path.read_text(encoding="utf-8", errors="ignore")
    match = re.search(r'(<script type="application/json" id="event-year-data">)([\s\S]*?)(</script>)', source)
    if not match:
        return False
    try:
        data = json.loads(match.group(2))
    except json.JSONDecodeError:
        return False
    if data.get("defaultYear") == 2027:
        changed_data = False
    else:
        changed_data = True
        data["defaultYear"] = 2027
    data["lastUpdated"] = STAMP
    editions = data.get("editions", [])
    if isinstance(editions, list) and not any(e.get("year") == 2027 for e in editions if isinstance(e, dict)):
        edition = next_edition(data)
        if edition:
            editions.append(edition)
            data["editions"] = editions
            changed_data = True
    encoded = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    next_source = source[:match.start(2)] + encoded + source[match.end(2):]
    head, rest = next_source.split(match.group(1), 1)
    head = re.sub(r"\b2026\b", "2027", head)
    next_source = head + match.group(1) + rest
    next_source = next_source.replace("<span>Current edition</span><strong>2026</strong>", "<span>Current edition</span><strong>2027</strong>")
    next_source = re.sub(r"(data-year-heading>[^<]*?) 2026\b", r"\1 2027", next_source, count=1)
    next_source = re.sub(r"(<span>Dates</span><strong>)([^<]*2026[^<]*|[^<]*)(</strong>)", r"\g<1>2027 date TBC\3", next_source, count=2)
    next_source = re.sub(r"(<span>Status</span><strong>)(Completed|Complete|Scheduled|Past|Upcoming)(</strong>)", r"\g<1>Date TBC\3", next_source, count=2)
    next_source = next_source.replace("<span>2026 event facts</span>", "<span>2027 planning facts</span>")
    next_source = next_source.replace("<small>Winner</small>", "<small>Last winner</small>")
    next_source = next_source.replace("<span>Current edition</span><strong>2026</strong>", "<span>Current edition</span><strong>2027</strong>")
    if next_source != source or changed_data:
        path.write_text(next_source, encoding="utf-8")
        return True
    return False


def roll_card(card: str) -> tuple[str, Path | None]:
    href = re.search(r'href="([^"]+)"', card)
    page = local_page(href.group(1)) if href else None
    title = title_from_card(card)
    if "2027" not in title:
        card = card.replace(f'<strong class="card-title">{title}</strong>', f'<strong class="card-title">{title} 2027</strong>')
    card = re.sub(r'data-start="2026-([^"]+)"', r'data-start="2027-\1"', card)
    card = re.sub(r'data-end="2026-([^"]+)"', r'data-end="2027-\1"', card)
    card = re.sub(r"\b2026\b", "2027", card)
    return card, page


def main() -> None:
    html = INDEX.read_text(encoding="utf-8")
    changed_pages: set[Path] = set()
    rolled = 0

    def repl(match: re.Match[str]) -> str:
        nonlocal rolled
        card = match.group(0)
        end = re.search(r'data-end="(2026-[0-9]{2}-[0-9]{2})"', card)
        if not end:
            return card
        if end.group(1) >= "2026-05-01":
            return card
        next_card, page = roll_card(card)
        rolled += 1
        if page and roll_page(page):
            changed_pages.add(page)
        return next_card

    next_html = re.sub(r'<a class="event-card"[\s\S]*?</a>', repl, html)
    INDEX.write_text(next_html, encoding="utf-8")
    print(f"Rolled {rolled} pre-May cards to 2027")
    print(f"Updated {len(changed_pages)} event pages")


if __name__ == "__main__":
    main()
