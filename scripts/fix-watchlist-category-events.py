from __future__ import annotations

import hashlib
import html
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
STAMP = "1 June 2026"

COUNTRIES = {
    "australia": ("Australia", "oceania", "australia"),
    "brazil": ("Brazil", "south-america", "brazil"),
    "canada": ("Canada", "north-america", "canada"),
    "china": ("China", "asia", "china"),
    "denmark": ("Denmark", "europe", "denmark"),
    "france": ("France", "europe", "france"),
    "germany": ("Germany", "europe", "germany"),
    "italy": ("Italy", "europe", "italy"),
    "japan": ("Japan", "asia", "japan"),
    "netherlands": ("Netherlands", "europe", "netherlands"),
    "south-korea": ("South Korea", "asia", "south-korea"),
    "spain": ("Spain", "europe", "spain"),
    "switzerland": ("Switzerland", "europe", "switzerland"),
    "trinidad-and-tobago": ("Trinidad and Tobago", "north-america", "trinidad-and-tobago"),
    "united-arab-emirates": ("United Arab Emirates", "asia", "united-arab-emirates"),
    "united-kingdom": ("United Kingdom", "europe", "united-kingdom"),
    "usa": ("United States", "north-america", "usa"),
}

LOCATION_FIXES = {
    "venice-biennale-arte": ("Venice", "italy"),
    "art-basel": ("Basel", "switzerland"),
    "frieze-london": ("London", "united-kingdom"),
    "tefaf-maastricht": ("Maastricht", "netherlands"),
    "biennale-of-sydney": ("Sydney", "australia"),
    "frieze-new-york": ("New York", "usa"),
    "golden-globe-awards": ("Los Angeles", "usa"),
    "bafta-film-awards": ("London", "united-kingdom"),
    "emmy-awards": ("Los Angeles", "usa"),
    "tony-awards": ("New York", "usa"),
    "cesar-awards": ("Paris", "france"),
    "brit-awards": ("London", "united-kingdom"),
    "mtv-video-music-awards": ("New York", "usa"),
    "bet-awards": ("Los Angeles", "usa"),
    "rio-carnival": ("Rio de Janeiro", "brazil"),
    "notting-hill-carnival": ("London", "united-kingdom"),
    "venice-carnival": ("Venice", "italy"),
    "carnival-of-santa-cruz-de-tenerife": ("Santa Cruz de Tenerife", "spain"),
    "cologne-carnival": ("Cologne", "germany"),
    "nice-carnival": ("Nice", "france"),
    "quebec-winter-carnival": ("Quebec City", "canada"),
    "trinidad-carnival": ("Port of Spain", "trinidad-and-tobago"),
    "paris-fashion-week": ("Paris", "france"),
    "milan-fashion-week": ("Milan", "italy"),
    "london-fashion-week": ("London", "united-kingdom"),
    "new-york-fashion-week": ("New York", "usa"),
    "copenhagen-fashion-week": ("Copenhagen", "denmark"),
    "seoul-fashion-week": ("Seoul", "south-korea"),
    "tokyo-fashion-week": ("Tokyo", "japan"),
    "shanghai-fashion-week": ("Shanghai", "china"),
    "dubai-fashion-week": ("Dubai", "united-arab-emirates"),
}


def font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def wrap(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.ImageFont, width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        if not current or draw.textbbox((0, 0), trial, font=fnt)[2] <= width:
            current = trial
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines[:4]


def blend(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(int(a[i] * (1 - t) + b[i] * t) for i in range(3))


def palette(topic: str, title: str) -> tuple[tuple[int, int, int], tuple[int, int, int], tuple[int, int, int]]:
    key = f"{topic}:{title}".lower()
    presets = [
        ("carnival", ((18, 79, 94), (220, 62, 96), (248, 205, 78))),
        ("awards", ((30, 24, 44), (126, 53, 116), (235, 185, 80))),
        ("fashion", ((28, 31, 44), (184, 71, 114), (240, 232, 214))),
        ("art", ((22, 58, 64), (185, 92, 68), (235, 204, 140))),
        ("film", ((26, 35, 53), (156, 36, 49), (239, 206, 142))),
        ("music", ((18, 38, 72), (63, 109, 188), (237, 91, 103))),
        ("food", ((66, 38, 25), (194, 91, 47), (243, 196, 91))),
        ("gaming", ((22, 25, 59), (58, 185, 171), (245, 96, 145))),
        ("religion", ((37, 67, 61), (196, 152, 74), (242, 231, 202))),
        ("winter", ((20, 51, 82), (90, 166, 196), (238, 249, 252))),
        ("wildlife", ((32, 75, 48), (183, 126, 58), (233, 212, 160))),
        ("sport", ((22, 64, 46), (45, 117, 84), (232, 195, 89))),
    ]
    for needle, colors in presets:
        if needle in key:
            return colors
    seed = hashlib.sha256(key.encode()).digest()
    return (seed[0] // 2, seed[1] // 2, seed[2] // 2), (80 + seed[3] // 2, 60 + seed[4] // 2, 70 + seed[5] // 2), (210, 198, 156)


def draw_scene(draw: ImageDraw.ImageDraw, w: int, h: int, topic: str, title: str, accent: tuple[int, int, int]) -> None:
    key = f"{topic} {title}".lower()
    white = (255, 255, 255, 210)
    dark = (5, 8, 14, 110)
    if "carnival" in key:
        for i in range(18):
            x = int(w * (0.08 + (i % 6) * 0.16))
            y = int(h * (0.18 + (i // 6) * 0.15))
            r = int(min(w, h) * (0.035 + (i % 3) * 0.01))
            draw.ellipse((x - r, y - r, x + r, y + r), fill=(*accent, 150), outline=white, width=max(2, r // 7))
        draw.polygon([(w * .14, h * .57), (w * .27, h * .44), (w * .40, h * .57), (w * .27, h * .68)], fill=(255, 255, 255, 190))
        draw.polygon([(w * .60, h * .57), (w * .73, h * .44), (w * .86, h * .57), (w * .73, h * .68)], fill=(255, 255, 255, 170))
        draw.ellipse((w * .23, h * .54, w * .31, h * .60), fill=dark)
        draw.ellipse((w * .69, h * .54, w * .77, h * .60), fill=dark)
    elif "awards" in key:
        draw.rectangle((w * .12, h * .62, w * .88, h * .72), fill=(20, 20, 28, 170))
        draw.rectangle((w * .22, h * .31, w * .78, h * .63), fill=(18, 18, 26, 140), outline=(*accent, 210), width=max(3, w // 120))
        draw.ellipse((w * .45, h * .24, w * .55, h * .42), fill=(*accent, 230))
        draw.rectangle((w * .485, h * .40, w * .515, h * .61), fill=(*accent, 230))
        draw.rectangle((w * .43, h * .60, w * .57, h * .66), fill=(*accent, 230))
    elif "fashion" in key:
        draw.polygon([(w * .44, h * .30), (w * .56, h * .30), (w * .72, h * .82), (w * .28, h * .82)], fill=(245, 232, 220, 190))
        for x in (0.18, 0.32, 0.68, 0.82):
            draw.line((w * x, h * .18, w * .5, h * .83), fill=(*accent, 150), width=max(2, w // 90))
        draw.ellipse((w * .47, h * .22, w * .53, h * .31), fill=white)
    elif "art" in key:
        for x, y, ww, hh in ((.12, .22, .22, .25), (.40, .18, .22, .30), (.68, .24, .20, .24)):
            draw.rectangle((w*x, h*y, w*(x+ww), h*(y+hh)), fill=(244, 232, 201, 190), outline=(*accent, 230), width=max(4, w // 90))
            draw.line((w*(x+.03), h*(y+hh-.04), w*(x+ww-.03), h*(y+.05)), fill=(35, 58, 63, 160), width=max(2, w // 160))
        draw.rectangle((0, h*.72, w, h), fill=(16, 21, 24, 85))
    elif "food" in key:
        for x in (.27, .5, .73):
            r = min(w, h) * .10
            draw.ellipse((w*x-r, h*.44-r, w*x+r, h*.44+r), fill=(245, 237, 205, 210))
            draw.ellipse((w*x-r*.65, h*.44-r*.65, w*x+r*.65, h*.44+r*.65), fill=(*accent, 190))
        draw.line((w*.18, h*.66, w*.82, h*.66), fill=white, width=max(3, w // 90))
    elif "film" in key:
        draw.rectangle((w*.15, h*.30, w*.85, h*.62), fill=(12, 12, 18, 170), outline=white, width=max(3, w//110))
        for i in range(7):
            x = w*(.18+i*.095)
            draw.rectangle((x, h*.34, x+w*.035, h*.40), fill=(*accent, 210))
            draw.rectangle((x, h*.52, x+w*.035, h*.58), fill=(*accent, 210))
        draw.polygon([(w*.18,h*.78),(w*.82,h*.78),(w*.60,h*.62),(w*.40,h*.62)], fill=(180, 31, 48, 170))
    elif "music" in key:
        draw.rectangle((w*.18, h*.61, w*.82, h*.72), fill=(10, 12, 20, 170))
        for x in (.28, .42, .58, .72):
            draw.ellipse((w*x-w*.035, h*.38-w*.035, w*x+w*.035, h*.38+w*.035), fill=(*accent, 210))
            draw.rectangle((w*x-w*.01, h*.38, w*x+w*.01, h*.62), fill=white)
        draw.arc((w*.20, h*.16, w*.80, h*.78), 200, 340, fill=(*accent, 160), width=max(4, w//70))
    else:
        for i in range(9):
            x = w * (0.12 + (i % 3) * 0.32)
            y = h * (0.22 + (i // 3) * 0.17)
            draw.rounded_rectangle((x, y, x + w*.16, y + h*.09), radius=max(4, w//70), fill=(*accent, 120), outline=white, width=max(2, w//160))


def make_image(path: Path, title: str, topic: str, size: tuple[int, int]) -> None:
    w, h = size
    c1, c2, accent = palette(topic, title)
    small_w, small_h = (160, 90) if w > 500 else (80, 60)
    img = Image.new("RGB", (small_w, small_h), c1)
    px = img.load()
    for y in range(small_h):
        for x in range(small_w):
            px[x, y] = blend(c1, c2, (x / max(1, small_w - 1)) * .48 + (y / max(1, small_h - 1)) * .52)
    img = img.resize(size, Image.Resampling.BICUBIC).filter(ImageFilter.GaussianBlur(radius=0.35))
    draw = ImageDraw.Draw(img, "RGBA")
    draw_scene(draw, w, h, topic, title, accent)
    draw.rectangle((0, 0, w, h), fill=(0, 0, 0, 54))
    draw.rectangle((0, int(h * .58), w, h), fill=(5, 10, 18, 150))
    title_font = font(64 if w > 500 else 28, True)
    meta_font = font(22 if w > 500 else 12, True)
    margin = int(w * .07)
    y = int(h * .66)
    draw.text((margin, y - int(h*.08)), topic.replace("/", " / ").upper(), font=meta_font, fill=(240, 245, 250, 210))
    for line in wrap(draw, title, title_font, w - margin * 2):
        draw.text((margin, y), line, font=title_font, fill=(255, 255, 255, 245))
        y += int(title_font.size * 1.08)
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "PNG", optimize=True)


def collect_watchlist_cards(index_path: Path) -> list[str]:
    source = index_path.read_text(encoding="utf-8")
    return [m.group(0) for m in re.finditer(r'\n\s*<a class="event-card"[\s\S]*?</a>', source) if "2026 watchlist" in m.group(0)]


def marker_pages() -> set[Path]:
    pages: set[Path] = set()
    for path in (ROOT / "en" / "content" / "categories").glob("**/events/*.html"):
        source = path.read_text(encoding="utf-8", errors="ignore")
        if "2027 planning page" in source or "2026 watchlist" in source:
            pages.add(path)
    return pages


def remove_watchlist_cards(index_path: Path) -> int:
    source = index_path.read_text(encoding="utf-8")
    count = 0

    def repl(match: re.Match[str]) -> str:
        nonlocal count
        card = match.group(0)
        if "2026 watchlist" not in card:
            return card
        count += 1
        return ""

    next_source = re.sub(r'\n\s*<a class="event-card"[\s\S]*?</a>', repl, source)
    index_path.write_text(next_source, encoding="utf-8")
    return count


def local_category_path(href: str) -> Path | None:
    href = href.split("#", 1)[0]
    if "/content/categories/" not in href and not href.startswith("../categories/"):
        return None
    if "/content/categories/" in href:
        rel = "content/categories/" + href.split("/content/categories/", 1)[1]
    else:
        rel = "content/" + href.removeprefix("../")
    return ROOT / rel


def fix_page(path: Path) -> None:
    if not path.exists():
        return
    source = path.read_text(encoding="utf-8")
    next_source = source
    next_source = next_source.replace('"defaultYear":2026', '"defaultYear":2027')
    next_source = next_source.replace('"year":2026', '"year":2027', 1)
    next_source = next_source.replace("2026 date TBC", "2027 date TBC")
    next_source = next_source.replace("2026 watchlist", "2027 planning page")
    next_source = next_source.replace("Current edition: 2026", "Current edition: 2027")
    next_source = next_source.replace("<span>Current edition</span><strong>2026</strong>", "<span>Current edition</span><strong>2027</strong>")
    next_source = next_source.replace("31 May 2026", STAMP)
    next_source = next_source.replace("31 May 2027", STAMP)
    next_source = re.sub(r"(content=\"[^\"]*?) 2026([^\"]*?\")", r"\1 2027\2", next_source)
    next_source = re.sub(r"(<title>[^<]*?) 2026([^<]*</title>)", r"\1 2027\2", next_source)
    next_source = re.sub(r"(data-year-heading>[^<]*?) 2026( in )", r"\1 2027\2", next_source)
    next_source = re.sub(r"(Last updated: )31 May 2027", rf"\g<1>{STAMP}", next_source)
    next_source = re.sub(r"(Last updated: )31 May 2026", rf"\g<1>{STAMP}", next_source)
    next_source = apply_location_fix(path, next_source)
    if next_source != source:
        path.write_text(next_source, encoding="utf-8")


def first_city_country(path: Path) -> tuple[str, str] | None:
    source = path.read_text(encoding="utf-8", errors="ignore")
    city = re.search(r'"cities":\[\{"name":"([^"]+)"\}', source)
    country = re.search(r'"countries":\[\{"name":"([^"]+)"', source)
    if not city or not country:
        return None
    return city.group(1), country.group(1)


def fix_topic_card(page_path: Path) -> bool:
    parts = page_path.relative_to(ROOT).parts
    category_index = parts.index("categories")
    topic_file = ROOT.joinpath(*parts[: category_index + 3]).with_suffix(".html")
    if not topic_file.exists():
        return False
    city_country = first_city_country(page_path)
    if city_country is None:
        return False
    city, country = city_country
    source = topic_file.read_text(encoding="utf-8")
    href = f"/content/categories/{parts[category_index + 1]}/{parts[category_index + 2]}/events/{page_path.name}"

    def repl(match: re.Match[str]) -> str:
        card = match.group(0)
        card = card.replace("<time>2026 watchlist</time>", "<time>2027 planning</time>")
        card = re.sub(r"<p>[^<]*</p>", f"<p>{html.escape(city)}, {html.escape(country)}</p>", card)
        return card

    next_source, count = re.subn(
        rf'<a class="event-card" href="{re.escape(href)}"[\s\S]*?</a>',
        repl,
        source,
        count=1,
    )
    if count:
        topic_file.write_text(next_source, encoding="utf-8")
        return True
    return False


def country_link(country_key: str) -> tuple[str, str, str]:
    name, continent, slug = COUNTRIES[country_key]
    return name, f"/content/locations/{continent}/{slug}/index.html", f"/content/locations/{continent}/{slug}/img/flag.svg"


def apply_location_fix(path: Path, source: str) -> str:
    fix = LOCATION_FIXES.get(path.stem)
    if not fix:
        return source
    city, country_key = fix
    country_name, country_url, country_flag = country_link(country_key)
    old_city = re.search(r'"headingPlace":"in ([^"]+)"', source)
    old_country = re.search(r'"countries":\[\{"name":"([^"]+)","url":"([^"]+)","flag":"([^"]+)"\}', source)
    next_source = source
    if old_city:
        next_source = next_source.replace(old_city.group(1), city)
    if old_country:
        old_name, old_url, old_flag = old_country.groups()
        next_source = next_source.replace(old_name, country_name)
        next_source = next_source.replace(old_url, country_url)
        next_source = next_source.replace(old_flag, country_flag)
    return next_source


def main() -> None:
    cards = collect_watchlist_cards(ROOT / "content" / "events" / "index.html")
    pages: set[Path] = set()
    image_jobs: dict[Path, tuple[str, str]] = {}
    for card in cards:
        href_match = re.search(r'href="([^"]+)"', card)
        title_match = re.search(r'<strong class="card-title">([\s\S]*?)</strong>', card)
        topic_match = re.search(r'data-topic="([^"]+)"', card)
        if not href_match or not title_match:
            continue
        title = html.unescape(re.sub(r"<[^>]+>", "", title_match.group(1)))
        topic = topic_match.group(1) if topic_match else "event"
        page_path = local_category_path(href_match.group(1))
        if page_path is None:
            continue
        pages.add(page_path)
        slug = page_path.stem
        img_dir = page_path.parent / "img"
        image_jobs[img_dir / f"{slug}-hero.png"] = (title, topic)
        image_jobs[img_dir / f"{slug}-mini.png"] = (title, topic)

    if not pages:
        pages = marker_pages()
        for page_path in pages:
            parts = page_path.relative_to(ROOT).parts
            topic = parts[parts.index("categories") + 2]
            title = page_path.stem.replace("-", " ").title()
            img_dir = page_path.parent / "img"
            image_jobs[img_dir / f"{page_path.stem}-hero.png"] = (title, topic)
            image_jobs[img_dir / f"{page_path.stem}-mini.png"] = (title, topic)

    removed = 0
    for index in (ROOT / "content" / "events" / "index.html", ROOT / "en" / "content" / "events" / "index.html"):
        removed += remove_watchlist_cards(index)

    for page in sorted(pages):
        fix_page(page)
    topic_cards = sum(1 for page in sorted(pages) if fix_topic_card(page))

    for path, (title, topic) in sorted(image_jobs.items()):
        make_image(path, title, topic, (1200, 630) if path.name.endswith("-hero.png") else (400, 300))

    print(f"Removed {removed} watchlist cards from event indexes")
    print(f"Updated {len(pages)} category pages")
    print(f"Updated {topic_cards} topic cards")
    print(f"Generated {len(image_jobs)} representative images")


if __name__ == "__main__":
    main()
