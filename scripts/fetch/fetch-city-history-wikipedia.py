#!/usr/bin/env python3
"""Import verified city history rows from Wikipedia into *.city.data.json files.

The script is intentionally conservative: it only writes rows based on a
Wikipedia page extract, and it leaves existing history untouched unless
--overwrite is passed.
"""

import argparse
import unicodedata
import json
import pathlib
import re
import time
import urllib.parse
import urllib.request
import urllib.error


ROOT = pathlib.Path(__file__).resolve().parents[1]
CITY_ROOT = ROOT / "content" / "locations"
API = "https://en.wikipedia.org/w/api.php"
USER_AGENT = "OneSliders city history importer (https://one-sliders.com/)"
MIN_HISTORY_ROWS = 6
MAX_HISTORY_ROWS = 14

WIKI_TITLE_OVERRIDES = {
    "content/locations/oceania/nauru/yaren.city.data.json": "Yaren District",
    "content/locations/north-america/antigua-and-barbuda/saint-johns.city.data.json": "St. John's, Antigua and Barbuda",
    "content/locations/north-america/canada/charlottetown.city.data.json": "Charlottetown",
    "content/locations/north-america/canada/halifax.city.data.json": "Halifax, Nova Scotia",
    "content/locations/north-america/canada/quebec-city.city.data.json": "Quebec City",
    "content/locations/north-america/canada/st-johns.city.data.json": "St. John's, Newfoundland and Labrador",
    "content/locations/north-america/canada/vancouver.city.data.json": "Vancouver",
    "content/locations/north-america/grenada/saint-georges.city.data.json": "St. George's, Grenada",
    "content/locations/europe/denmark/billund.city.data.json": "Billund",
    "content/locations/europe/iceland/husavik.city.data.json": "Húsavík",
    "content/locations/europe/iceland/selfoss.city.data.json": "Selfoss (town)",
    "content/locations/europe/norway/alta.city.data.json": "Alta, Norway",
    "content/locations/asia/oman/muscat.city.data.json": "Muscat",
    "content/locations/africa/chad/ndjamena.city.data.json": "N'Djamena",
    "content/locations/africa/seychelles/victoria.city.data.json": "Victoria, Seychelles",
}

WIKI_TITLE_OVERRIDES.update({
    "content/locations/africa/morocco/fes.city.data.json": "Fez, Morocco",
    "content/locations/africa/morocco/marrakech.city.data.json": "Marrakesh",
    "content/locations/europe/latvia/riga.city.data.json": "Riga",
    "content/locations/europe/united-kingdom/silverstone.city.data.json": "Silverstone",
    "content/locations/europe/vatican-city/vatican-city.city.data.json": "Vatican City",
    "content/locations/north-america/canada/tofino.city.data.json": "Tofino",
    "content/locations/north-america/canada/victoria.city.data.json": "Victoria, British Columbia",
})

SECTION_STOP_WORDS = {
    "geography", "climate", "demographics", "economy", "culture",
    "transport", "transportation", "education", "sports", "see also",
    "references", "external links", "government", "administration",
    "notable people", "tourism", "cityscape"
}

HISTORY_SECTION_WORDS = (
    "history", "etymology", "origins", "early history", "founding",
    "prehistory", "colonial", "middle ages", "modern history"
)


def wiki_get(params):
    query = urllib.parse.urlencode({**params, "format": "json", "formatversion": "2"})
    req = urllib.request.Request(f"{API}?{query}", headers={"User-Agent": USER_AGENT})
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=30) as res:
                return json.loads(res.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            if exc.code != 429 or attempt == 4:
                raise
            time.sleep(8 * (attempt + 1))
        except urllib.error.URLError:
            if attempt == 4:
                raise
            time.sleep(4 * (attempt + 1))


def normalize(value):
    value = unicodedata.normalize("NFKD", str(value or "")).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def acceptable_title(title, data):
    title_norm = normalize(title)
    name_norm = normalize(data.get("name"))
    slug_norm = normalize(str(data.get("slug") or "").replace("-", " "))
    if not title_norm or not name_norm:
        return False
    if name_norm in title_norm or title_norm in name_norm:
        return True
    if slug_norm and (slug_norm in title_norm or title_norm in slug_norm):
        return True
    name_tokens = [x for x in name_norm.split() if len(x) > 2]
    title_tokens = set(title_norm.split())
    return bool(name_tokens) and all(token in title_tokens for token in name_tokens)


def title_from_source(data):
    for src in data.get("sources") or []:
        if not isinstance(src, dict):
            continue
        url = str(src.get("url") or "")
        marker = "wikipedia.org/wiki/"
        if marker in url:
            title = urllib.parse.unquote(url.split(marker, 1)[1].split("#", 1)[0])
            return title.replace("_", " ")
    return None


def search_title(data):
    pieces = [data.get("name"), data.get("state"), data.get("province"), data.get("countryName")]
    search = " ".join(str(x) for x in pieces if x)
    result = wiki_get({
        "action": "query",
        "list": "search",
        "srlimit": "10",
        "srsearch": search,
    })
    rows = result.get("query", {}).get("search", [])
    for row in rows:
        title = row.get("title") or ""
        if acceptable_title(title, data):
            return title
    return None


def fetch_extract(title):
    result = wiki_get({
        "action": "query",
        "prop": "extracts",
        "explaintext": "1",
        "redirects": "1",
        "titles": title,
    })
    pages = result.get("query", {}).get("pages", [])
    if not pages:
        return None, ""
    page = pages[0]
    if page.get("missing"):
        return None, ""
    return page.get("title") or title, page.get("extract") or ""


def clean_text(text):
    text = re.sub(r"\[[^\]]+\]", "", text)
    text = re.sub(r"=+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text.strip(" -;:")


def split_sentences(text):
    text = text.replace("\r\n", "\n")
    raw = re.split(r"(?<=[.!?])\s+(?=[A-Z0-9])", text)
    return [clean_text(x) for x in raw if len(clean_text(x).split()) >= 8]


def history_text(extract):
    lines = [line.strip() for line in extract.splitlines()]
    sections = []
    collecting = False
    for line in lines:
        low = line.lower().strip("= ")
        is_heading = bool(line) and len(line.split()) <= 7 and not line.endswith(".")
        if is_heading and any(word == low or word in low for word in HISTORY_SECTION_WORDS):
            collecting = True
            continue
        if collecting and is_heading and low in SECTION_STOP_WORDS:
            break
        if collecting and line:
            sections.append(line)
    return "\n".join(sections) if sections else extract


def date_sort_value(label):
    label = str(label or "").lower()
    m = re.search(r"\b(\d{1,5})\s*bce\b", label)
    if m:
        return -int(m.group(1))
    m = re.search(r"\b(\d{1,2})(?:st|nd|rd|th)\s+century\b", label)
    if m:
        return (int(m.group(1)) - 1) * 100
    m = re.search(r"\b(\d{3,4})s\b", label)
    if m:
        return int(m.group(1))
    m = re.search(r"\b(\d{3,4})\b", label)
    if m:
        return int(m.group(1))
    if label in ("early settlement", "origins"):
        return -99999
    return 999999


def label_for(sentence, fallback_index):
    ago = re.search(r"\b(?:more than|at least|about|around|over)?\s*(\d{1,2}),000\s+years(?:\s+ago)?\b", sentence, re.I)
    if ago:
        years = int(ago.group(1)) * 1000
        return "Early settlement" if years >= 5000 else f"c. {max(1, years - 2000)} BCE"
    patterns = [
        r"\b\d{1,5}\s*BCE\b",
        r"\b(?:c\.|circa)\s*\d{3,4}\b",
        r"\b\d{1,2}(?:st|nd|rd|th) century\b",
        r"\b\d{3,4}s\b",
        r"\b(?:in|by|from|since|around|during|after|before|on)\s+\d{3,4}\b",
        r"\b\d{4}\b",
        r"\b\d{3}\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, sentence, flags=re.IGNORECASE)
        if match:
            label_match = re.search(r"\d{3,5}\s*BCE|\d{1,2}(?:st|nd|rd|th) century|\d{3,4}s|\d{3,4}", match.group(0), re.I)
            if not label_match:
                continue
            label = label_match.group(0)
            end = match.end()
            if re.fullmatch(r"\d{3}", label):
                following = sentence[end:end + 24]
                prefix = sentence[max(0, match.start() - 10):match.start()].lower()
                if re.match(r"\s+[A-Z]", following) and not re.search(r"\b(in|by|from|since|around|during|after|before|on)\s+$", prefix):
                    continue
            return label.replace("circa", "c.").strip()
    return ["Origins", "Growth", "Modern city", "Today", "Civic role", "Regional role"][min(fallback_index, 5)]


def trim_sentence(sentence, max_words=31):
    parts = sentence.split()
    if len(parts) <= max_words:
        return sentence
    return " ".join(parts[:max_words]).rstrip(" ,;:") + "."


def sentence_score(sentence):
    low = sentence.lower()
    score = 0
    strong = (
        "founded", "established", "incorporated", "became", "capital",
        "moved", "renamed", "built", "opened", "completed", "created",
        "designated", "annexed", "destroyed", "rebuilt", "independence",
        "colonial", "settlement", "inhabited", "charter", "university",
        "railway", "railroad", "airport", "port", "fort", "cathedral",
        "palace", "museum", "world war", "fire", "earthquake", "flood"
    )
    weak = (
        "flag", "coat of arms", "nickname", "demonym", "etymology",
        "term", "word", "means", "is derived", "population",
        "climate", "average", "sister city"
    )
    for word in strong:
        if word in low:
            score += 3
    for word in weak:
        if word in low:
            score -= 3
    if re.search(r"\b(\d{3,4}|century|bce|\d{1,2},000 years)\b", low):
        score += 2
    if re.search(r"\b(on|in|during|after|before|by)\b", low):
        score += 1
    if len(sentence.split()) < 10:
        score -= 4
    if sentence.count("(") > sentence.count(")") or sentence.count('"') % 2:
        score -= 5
    if low.startswith(("the term ", "the name ", "the word ")):
        score -= 4
    return score


def is_good_history_sentence(sentence):
    if not sentence or len(sentence.split()) < 8:
        return False
    if "===" in sentence:
        return False
    if re.search(r"\b(TBC|TBD)\b", sentence):
        return False
    if re.search(r"\bflag\b|coat of arms", sentence, re.I):
        return False
    if sentence.count("(") > sentence.count(")") or sentence.count('"') % 2:
        return False
    if re.search(r"\b\d{1,2}\b", sentence) and not re.search(r"\b(\d{3,4}|century|bce|\d{1,2},000 years)\b", sentence, re.I):
        return False
    return True


def make_history_rows(extract):
    scoped = history_text(extract)
    sentences = split_sentences(scoped)
    candidates = []
    seen_text = set()

    for source_index, sentence in enumerate(sentences):
        sentence = clean_text(sentence)
        if not is_good_history_sentence(sentence):
            continue
        text = trim_sentence(sentence, 34)
        text_key = re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()
        if text_key in seen_text:
            continue
        label = label_for(text, len(candidates))
        if label in ("000", "0", "TBC", "TBD"):
            continue
        candidates.append({
            "label": label,
            "text": text,
            "_score": sentence_score(text),
            "_sort": date_sort_value(label),
            "_source": source_index,
        })
        seen_text.add(text_key)

    best = sorted(candidates, key=lambda r: (-r["_score"], r["_source"]))
    selected = []
    seen_labels = set()
    for row in best:
        label_key = row["label"].lower()
        if label_key in seen_labels and re.search(r"\d", row["label"]):
            continue
        if row["_score"] < 1 and len(selected) >= MIN_HISTORY_ROWS:
            continue
        selected.append(row)
        seen_labels.add(label_key)
        if len(selected) >= MAX_HISTORY_ROWS:
            break

    selected = sorted(selected, key=lambda r: (r["_sort"], r["_source"]))
    return [{"label": row["label"], "text": row["text"]} for row in selected]


def import_file(path, overwrite=False, overwrite_imported=False):
    data = json.loads(path.read_text(encoding="utf-8"))
    imported = bool(data.get("historySource"))
    if data.get("history") and not overwrite and not (overwrite_imported and imported):
        return "kept", None
    rel = path.relative_to(ROOT).as_posix()
    override_title = WIKI_TITLE_OVERRIDES.get(rel)
    title = override_title or title_from_source(data) or search_title(data)
    if not title:
        if overwrite_imported and imported:
            data.pop("history", None)
            data.pop("historySource", None)
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            return "removed-bad-title", None
        return "no-title", None
    resolved_title, extract = fetch_extract(title)
    if not extract:
        return "no-extract", title
    if not override_title and not title_from_source(data) and not acceptable_title(resolved_title or title, data):
        if overwrite_imported and imported:
            data.pop("history", None)
            data.pop("historySource", None)
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            return "removed-bad-title", resolved_title or title
        return "bad-title", resolved_title or title
    rows = make_history_rows(extract)
    if len(rows) < MIN_HISTORY_ROWS:
        return f"short-{len(rows)}", resolved_title
    data["history"] = rows[:MAX_HISTORY_ROWS]
    data["historySource"] = f"https://en.wikipedia.org/wiki/{urllib.parse.quote((resolved_title or title).replace(' ', '_'))}"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return f"wrote-{len(data['history'])}", resolved_title


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--overwrite", action="store_true")
    parser.add_argument("--overwrite-imported", action="store_true")
    parser.add_argument("--sleep", type=float, default=0.12)
    parser.add_argument("--exclude-prefix", action="append", default=[])
    parser.add_argument("paths", nargs="*")
    args = parser.parse_args()

    files = [pathlib.Path(p) for p in args.paths] if args.paths else sorted(CITY_ROOT.rglob("*.city.data.json"))
    files = [p if p.is_absolute() else ROOT / p for p in files]
    exclude_prefixes = tuple(str(p).replace("\\", "/").strip("/") for p in args.exclude_prefix)
    if exclude_prefixes:
        files = [
            p for p in files
            if not str(p.relative_to(ROOT)).replace("\\", "/").startswith(exclude_prefixes)
        ]
    if args.limit:
        files = files[:args.limit]
    counts = {}
    for i, path in enumerate(files, start=1):
        status, title = import_file(path, overwrite=args.overwrite, overwrite_imported=args.overwrite_imported)
        counts[status] = counts.get(status, 0) + 1
        rel = path.relative_to(ROOT)
        line = f"{i:03d}/{len(files)} {status:8} {rel} {title or ''}"
        print(line.encode("ascii", "replace").decode("ascii"))
        time.sleep(args.sleep)
    print("summary", counts)


if __name__ == "__main__":
    main()
