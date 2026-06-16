import json
import math
import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path.cwd()
DATA = ROOT / "scripts/data/nordic-stay-cities.json"

COUNTRY_PALETTES = {
    "denmark": ("#b91c1c", "#f7f7f2", "#1f2937", "#0f766e"),
    "sweden": ("#1d4ed8", "#facc15", "#0f172a", "#0891b2"),
    "norway": ("#dc2626", "#1e3a8a", "#f8fafc", "#0369a1"),
    "finland": ("#2563eb", "#f8fafc", "#0f172a", "#059669"),
    "iceland": ("#0f766e", "#2563eb", "#f8fafc", "#7c3aed"),
    "faroe-islands": ("#1d4ed8", "#dc2626", "#f8fafc", "#0f766e"),
    "greenland": ("#dc2626", "#f8fafc", "#0f172a", "#06b6d4"),
}

EXISTING_IMAGE_SLUGS = {
    "copenhagen",
    "stockholm",
    "gothenburg",
    "oslo",
    "helsinki",
    "reykjavik",
}


def slugify(value):
    import unicodedata

    text = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    out = []
    last_dash = False
    for ch in text.lower():
        if ch.isalnum():
            out.append(ch)
            last_dash = False
        elif not last_dash:
            out.append("-")
            last_dash = True
    return "".join(out).strip("-")


def lerp(a, b, t):
    return int(a + (b - a) * t)


def hex_rgb(value):
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def gradient(size, top, bottom):
    w, h = size
    top = hex_rgb(top)
    bottom = hex_rgb(bottom)
    img = Image.new("RGB", size)
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / max(1, h - 1)
        col = tuple(lerp(top[i], bottom[i], t) for i in range(3))
        draw.line([(0, y), (w, y)], fill=col)
    return img


def draw_mountains(draw, w, h, color, offset=0, height=0.45):
    base = int(h * 0.72)
    peaks = []
    step = w // 5
    for i in range(-1, 7):
        x = i * step + offset
        y = int(h * (0.25 + (i % 3) * 0.06))
        peaks.extend([(x, base), (x + step // 2, y), (x + step, base)])
    draw.polygon(peaks, fill=color)


def draw_water(draw, w, h, color):
    y0 = int(h * 0.68)
    draw.rectangle([0, y0, w, h], fill=color)
    for i in range(7):
        y = y0 + 22 + i * 28
        draw.arc([-(i * 37 % 180), y, w + 220, y + 36], 180, 360, fill="#ffffff66", width=2)


def draw_city_blocks(draw, w, h, colors, seed):
    base = int(h * 0.72)
    x = 40
    i = 0
    while x < w - 30:
        bw = 36 + ((seed + i * 13) % 56)
        bh = 80 + ((seed + i * 29) % 150)
        y = base - bh
        fill = colors[i % len(colors)]
        draw.rounded_rectangle([x, y, x + bw, base], radius=5, fill=fill)
        for wx in range(x + 8, x + bw - 6, 18):
            for wy in range(y + 12, base - 12, 24):
                if (wx + wy + seed) % 3:
                    draw.rectangle([wx, wy, wx + 7, wy + 8], fill="#fef3c7")
        x += bw + 10
        i += 1


def draw_landmark(draw, w, h, city, highlight, palette):
    name = city["name"].lower()
    text = highlight.lower()
    ink = "#0f172a"
    light = "#f8fafc"
    accent, second, surface, teal = palette
    cx = w // 2
    base = int(h * 0.68)
    if any(k in text for k in ["cathedral", "church", "hallgrim", "nidaros", "dom", "kirk", "christians"]):
        draw.polygon([(cx - 80, base), (cx, base - 210), (cx + 80, base)], fill=surface)
        draw.rectangle([cx - 54, base - 115, cx + 54, base], fill=surface)
        draw.rectangle([cx - 15, base - 170, cx + 15, base], fill=accent)
        draw.ellipse([cx - 18, base - 88, cx + 18, base - 52], fill=second)
    elif any(k in text for k in ["castle", "fortress", "palace", "kronborg", "akershus", "karnan"]):
        draw.rectangle([cx - 150, base - 120, cx + 150, base], fill=surface)
        for tx in [cx - 145, cx + 95]:
            draw.rectangle([tx, base - 180, tx + 55, base], fill=surface)
            draw.polygon([(tx, base - 180), (tx + 27, base - 225), (tx + 55, base - 180)], fill=accent)
        for x in range(cx - 120, cx + 130, 42):
            draw.rectangle([x, base - 76, x + 18, base - 42], fill=second)
    elif any(k in text for k in ["bridge", "oresund", "old town bridge"]):
        draw.arc([80, base - 155, w - 80, base + 120], 190, 350, fill=surface, width=14)
        draw.line([80, base, w - 80, base], fill=surface, width=12)
        for x in range(150, w - 120, 110):
            draw.line([x, base, x + 42, base - 90], fill=light, width=3)
    elif any(k in text for k in ["opera", "harpa", "dokk", "oodi", "aros", "katuaq"]):
        draw.polygon([(cx - 180, base), (cx - 70, base - 155), (cx + 180, base - 75), (cx + 130, base)], fill=surface)
        for x in range(cx - 120, cx + 130, 42):
            draw.line([x, base - 15, x + 55, base - 95], fill=accent, width=5)
    elif any(k in text for k in ["ice", "glacier", "icefjord", "iceberg"]):
        for i in range(5):
            x = 130 + i * 115
            draw.polygon([(x, base), (x + 42, base - 130 - i * 9), (x + 94, base)], fill=surface)
            draw.polygon([(x + 42, base - 130 - i * 9), (x + 94, base), (x + 118, base - 18)], fill="#bae6fd")
    elif any(k in text for k in ["northern lights", "aurora", "sky station"]):
        for i, col in enumerate(["#22c55e", "#67e8f9", "#a78bfa"]):
            pts = []
            for x in range(0, w + 40, 40):
                y = int(h * 0.25 + math.sin((x + i * 50) / 70) * 35 + i * 25)
                pts.append((x, y))
            draw.line(pts, fill=col, width=16)
    elif any(k in text for k in ["fjord", "waterfall", "falls", "cruises", "geiranger", "naeroy"]):
        draw_mountains(draw, w, h, "#334155", 0)
        draw.polygon([(cx - 18, int(h * 0.35)), (cx + 26, int(h * 0.35)), (cx + 8, base)], fill="#e0f2fe")
    elif any(k in text for k in ["tower", "turning", "pyynikki", "puijo", "nasinneula", "water tower"]):
        draw.rectangle([cx - 22, base - 230, cx + 22, base], fill=surface)
        draw.ellipse([cx - 70, base - 260, cx + 70, base - 205], fill=accent)
        draw.rectangle([cx - 52, base - 205, cx + 52, base - 170], fill=second)
    elif any(k in text for k in ["lego", "tivoli", "zoo", "santa"]):
        for i, col in enumerate([accent, second, teal, "#facc15"]):
            x = cx - 155 + i * 95
            draw.rounded_rectangle([x, base - 105, x + 75, base], radius=12, fill=col)
            draw.ellipse([x + 14, base - 126, x + 61, base - 82], fill=col)
    elif any(k in text for k in ["ship", "harbour", "harbor", "ferry", "boat", "whale"]):
        draw.polygon([(cx - 170, base - 35), (cx + 170, base - 35), (cx + 115, base + 25), (cx - 120, base + 25)], fill=surface)
        draw.rectangle([cx - 65, base - 100, cx + 50, base - 35], fill=accent)
        draw.polygon([(cx + 55, base - 35), (cx + 55, base - 165), (cx + 150, base - 35)], fill=light)
    else:
        draw_city_blocks(draw, w, h, [surface, accent, second, teal], sum(ord(ch) for ch in city["slug"] + highlight))


def make_image(city, highlight=None, size=(1200, 630)):
    country = city["countrySlug"]
    palette = COUNTRY_PALETTES[country]
    accent, second, surface, teal = palette
    w, h = size
    arctic = any(k in (city["known"] + " " + " ".join(city["highlights"])).lower() for k in ["arctic", "aurora", "ice", "northern lights", "lapland", "polar"])
    coastal = any(k in (city["known"] + " " + " ".join(city["highlights"])).lower() for k in ["fjord", "harbour", "coast", "island", "bay", "sea", "lake", "river", "water"])
    img = gradient(size, "#dbeafe" if not arctic else "#172554", "#f8fafc" if not arctic else "#312e81")
    draw = ImageDraw.Draw(img, "RGBA")
    if arctic:
        for i in range(45):
            x = (i * 83 + len(city["slug"]) * 19) % w
            y = (i * 47 + 20) % int(h * 0.48)
            draw.ellipse([x, y, x + 2, y + 2], fill="#ffffff")
        draw_landmark(draw, w, h, city, "northern lights", palette)
    if coastal:
        draw_mountains(draw, w, h, "#475569" if arctic else "#94a3b8", len(city["slug"]) * 7)
        draw_water(draw, w, h, "#0e7490" if not arctic else "#0f172a")
    else:
        draw.rectangle([0, int(h * 0.68), w, h], fill="#d9f99d")
    draw_city_blocks(draw, w, h, [surface, accent, second, teal], sum(ord(ch) for ch in city["slug"]))
    draw_landmark(draw, w, h, city, highlight or city["highlights"][0], palette)
    draw.rounded_rectangle([36, 36, w - 36, h - 36], radius=26, outline="#ffffff99", width=3)
    draw.rectangle([0, int(h * 0.78), w, h], fill="#0f172acc")
    draw.rectangle([0, int(h * 0.78), 18, h], fill=accent)
    img = img.filter(ImageFilter.UnsharpMask(radius=1.3, percent=110, threshold=3))
    return img


def save_set(img, base, hero=False):
    base.parent.mkdir(parents=True, exist_ok=True)
    if hero:
        img.resize((1200, 630), Image.Resampling.LANCZOS).save(base.with_suffix(".png"), optimize=True)
        for width, height, suffix in [(400, 210, "-400.webp"), (768, 403, "-768.webp"), (1200, 630, "-1200.webp")]:
            img.resize((width, height), Image.Resampling.LANCZOS).save(base.with_name(base.name + suffix), quality=86, method=6)
    else:
        img.resize((400, 300), Image.Resampling.LANCZOS).save(base.with_suffix(".png"), optimize=True)
        for width, height, suffix in [(200, 150, "-200.webp"), (400, 300, "-400.webp")]:
            img.resize((width, height), Image.Resampling.LANCZOS).save(base.with_name(base.name + suffix), quality=86, method=6)


def make_country_image(country, cities, size=(1200, 630)):
    palette = COUNTRY_PALETTES[country["slug"]]
    img = gradient(size, "#e0f2fe", "#f8fafc")
    draw = ImageDraw.Draw(img, "RGBA")
    w, h = size
    draw_mountains(draw, w, h, "#94a3b8", 40)
    draw_water(draw, w, h, "#0e7490")
    for i, city in enumerate(cities[:8]):
        x = 60 + i * 135
        top = int(h * 0.48) - (i % 3) * 24
        draw.rounded_rectangle([x, top, x + 86, int(h * 0.72)], radius=8, fill=palette[i % 4])
    draw.rectangle([0, int(h * 0.78), w, h], fill="#0f172acc")
    draw.rectangle([0, int(h * 0.78), 18, h], fill=palette[0])
    return img.filter(ImageFilter.UnsharpMask(radius=1.3, percent=110, threshold=3))


def main():
    data = json.loads(DATA.read_text(encoding="utf-8"))
    countries = data["countries"]
    cities = data["cities"]
    for city in cities:
        country = countries[city["countrySlug"]]
        img_dir = ROOT / "content/locations" / country["continent"] / country["slug"] / "img"
        if city["slug"] not in EXISTING_IMAGE_SLUGS:
            hero = make_image(city, size=(1200, 630))
            mini = make_image(city, size=(400, 300))
            save_set(hero, img_dir / f"{city['slug']}-hero", hero=True)
            save_set(mini, img_dir / f"{city['slug']}-mini", hero=False)
            for highlight in city["highlights"][:6]:
                card = make_image(city, highlight=highlight, size=(400, 300))
                save_set(card, img_dir / f"{city['slug']}-{slugify(highlight)}-mini", hero=False)
    for slug, country in countries.items():
        group = [city for city in cities if city["countrySlug"] == slug]
        if not group:
            continue
        img_dir = ROOT / "content/locations" / country["continent"] / country["slug"] / "img"
        if not (img_dir / f"{slug}-hero.png").exists():
            country_img = make_country_image(country, group, size=(1200, 630))
            save_set(country_img, img_dir / f"{slug}-hero", hero=True)
            save_set(country_img, img_dir / f"{slug}-mini", hero=False)
    print(f"Generated images for {len(cities)} cities and {len(countries)} countries.")


if __name__ == "__main__":
    main()
