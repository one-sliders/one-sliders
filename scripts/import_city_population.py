"""Import city population figures from the curated CSV into each city's
*.city.data.json file.

CSV: data/Import/world_cities_population_filled.csv  (semicolon-separated,
"City name;City population"). The CSV text is double-encoded (UTF-8 bytes
mis-decoded as cp1252/latin-1), so names are repaired before matching.

Matching is by slug against content/locations/world.city.data.json (the
master routing list), whose `slug` field is clean ASCII. Only rows with a
non-empty integer population are written; everything else is reported and
skipped. We never guess a value.

Each matched city JSON gets a numeric `populationValue` (authoritative raw
figure) plus `populationSource`, inserted after the `region` key. The
existing display `population` string is left untouched so later scripting
can format it. Run with --apply to write; default is a dry run.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSV = ROOT / "data" / "Import" / "world_cities_population_filled.csv"
MASTER = ROOT / "content" / "locations" / "world.city.data.json"

# CSV name -> master slug, for the few cases where the slug isn't a direct
# slugification of the CSV name.
ALIASES = {
    "new-york-city": "new-york",
}


def fix_mojibake(s: str) -> str:
    """Repair text that was UTF-8 but got decoded as cp1252/latin-1."""
    for enc in ("cp1252", "latin-1"):
        try:
            return s.encode(enc).decode("utf-8")
        except (UnicodeEncodeError, UnicodeDecodeError):
            continue
    return s


def slugify(name: str) -> str:
    s = fix_mojibake(name)
    # Letters that do not decompose under NFKD.
    s = (s.replace("ø", "o").replace("Ø", "o")
          .replace("æ", "ae").replace("Æ", "ae")
          .replace("ð", "d").replace("Ð", "d")
          .replace("þ", "th").replace("Þ", "th"))
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = re.sub(r"['.’]", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


def load_rows():
    text = CSV.read_text(encoding="utf-8")
    rows = []
    for line in text.splitlines()[1:]:
        if not line.strip():
            continue
        parts = line.split(";")
        name = parts[0].strip()
        pop = parts[1].strip() if len(parts) > 1 else ""
        rows.append((name, pop))
    return rows


def insert_after(d: dict, anchor: str, key: str, value):
    """Return a new dict with key/value inserted right after `anchor`."""
    if key in d:
        d[key] = value
        return d
    out = {}
    placed = False
    for k, v in d.items():
        out[k] = v
        if k == anchor:
            out[key] = value
            placed = True
    if not placed:
        out[key] = value
    return out


def main():
    apply = "--apply" in sys.argv
    master = json.loads(MASTER.read_text(encoding="utf-8-sig"))["cities"]
    by_slug = {c["slug"]: c for c in master}

    rows = load_rows()
    written, skipped_empty, bad_pop, unmatched, missing_file = [], [], [], [], []

    for name, pop in rows:
        if not pop:
            skipped_empty.append(name)
            continue
        try:
            value = int(pop.replace(",", "").replace(" ", ""))
        except ValueError:
            bad_pop.append((name, pop))
            continue
        slug = slugify(name)
        slug = ALIASES.get(slug, slug)
        city = by_slug.get(slug)
        if not city:
            unmatched.append((name, slug, pop))
            continue
        data_path = ROOT / city["dataFile"].lstrip("/")
        if not data_path.exists():
            missing_file.append((name, str(data_path)))
            continue
        d = json.loads(data_path.read_text(encoding="utf-8-sig"))
        anchor = "region" if "region" in d else (
            "population" if "population" in d else "name")
        d = insert_after(d, anchor, "populationValue", value)
        d = insert_after(d, "populationValue", "populationSource",
                         "Curated city population import (data/Import)")
        if apply:
            # newline="" keeps the literal "\n" we emit (no CRLF translation)
            # so written files match the LF line endings of the originals.
            data_path.write_text(
                json.dumps(d, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8", newline="")
        written.append((name, slug, value))

    print(f"CSV rows: {len(rows)}")
    print(f"Written ({'apply' if apply else 'dry-run'}): {len(written)}")
    print(f"Skipped (empty population): {len(skipped_empty)}")
    print(f"Bad population value: {len(bad_pop)}")
    print(f"Unmatched (had population): {len(unmatched)}")
    print(f"Matched but file missing: {len(missing_file)}")
    for n, s, p in unmatched:
        print(f"  UNMATCHED {n!r} -> {s!r} ({p})")
    for n, p in bad_pop:
        print(f"  BAD POP {n!r} -> {p!r}")
    for n, fp in missing_file:
        print(f"  NO FILE {n!r} -> {fp}")
    if not apply:
        print("\n(dry run — re-run with --apply to write)")


if __name__ == "__main__":
    main()
