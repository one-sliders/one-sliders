from __future__ import annotations

import hashlib
import math
import re
from collections import defaultdict
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
IMAGE_ROOTS = [ROOT / "content" / "categories", ROOT / "en" / "content" / "categories"]


def image_files() -> list[Path]:
    files: list[Path] = []
    for root in IMAGE_ROOTS:
        if not root.exists():
            continue
        files.extend(
            p
            for p in root.rglob("*.png")
            if p.parent.name == "img"
            and p.parent.parent.name == "events"
            and (p.name.endswith("-hero.png") or p.name.endswith("-mini.png"))
        )
    return sorted(files)


def file_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def title_from_slug(slug: str) -> str:
    keep_upper = {"afl", "atp", "aws", "ces", "f1", "fiba", "fifa", "iihf", "mlb", "mtv", "nba", "nfl", "nhl", "pga", "uefa", "us", "wta"}
    words = []
    for part in slug.split("-"):
        words.append(part.upper() if part in keep_upper else part.capitalize())
    return " ".join(words)


def path_context(path: Path) -> tuple[str, str, str, str]:
    parts = path.relative_to(ROOT).parts
    category_index = parts.index("categories")
    category = parts[category_index + 1]
    topic = parts[category_index + 2]
    suffix = "-hero.png" if path.name.endswith("-hero.png") else "-mini.png"
    slug = path.name[: -len(suffix)]
    return category, topic, slug, "hero" if suffix.startswith("-hero") else "mini"


def palette(seed: bytes) -> tuple[tuple[int, int, int], tuple[int, int, int], tuple[int, int, int]]:
    hue = seed[0] / 255
    hue2 = (hue + 0.28 + seed[1] / 900) % 1
    hue3 = (hue + 0.58 + seed[2] / 1100) % 1

    def hsl(h: float, s: float, l: float) -> tuple[int, int, int]:
        c = (1 - abs(2 * l - 1)) * s
        x = c * (1 - abs((h * 6) % 2 - 1))
        m = l - c / 2
        if h < 1 / 6:
            r, g, b = c, x, 0
        elif h < 2 / 6:
            r, g, b = x, c, 0
        elif h < 3 / 6:
            r, g, b = 0, c, x
        elif h < 4 / 6:
            r, g, b = 0, x, c
        elif h < 5 / 6:
            r, g, b = x, 0, c
        else:
            r, g, b = c, 0, x
        return int((r + m) * 255), int((g + m) * 255), int((b + m) * 255)

    return hsl(hue, 0.58, 0.24), hsl(hue2, 0.64, 0.42), hsl(hue3, 0.72, 0.68)


def load_font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
    ]
    for candidate in candidates:
        p = Path(candidate)
        if p.exists():
            return ImageFont.truetype(str(p), size)
    return ImageFont.load_default()


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        if draw.textbbox((0, 0), trial, font=font)[2] <= max_width or not current:
            current = trial
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines[:4]


def make_unique(path: Path) -> None:
    category, topic, slug, kind = path_context(path)
    title = title_from_slug(slug)
    width, height = (1200, 630) if kind == "hero" else (400, 300)
    seed = hashlib.sha256(str(path.relative_to(ROOT)).encode("utf-8")).digest()
    c1, c2, c3 = palette(seed)

    img = Image.new("RGB", (width, height), c1)
    px = img.load()
    for y in range(height):
        t = y / max(1, height - 1)
        wave = 0.08 * math.sin((y + seed[3]) / max(12, height / 18))
        for x in range(width):
            u = x / max(1, width - 1)
            mix = min(1, max(0, (t * 0.62 + u * 0.38 + wave)))
            r = int(c1[0] * (1 - mix) + c2[0] * mix)
            g = int(c1[1] * (1 - mix) + c2[1] * mix)
            b = int(c1[2] * (1 - mix) + c2[2] * mix)
            px[x, y] = (r, g, b)

    draw = ImageDraw.Draw(img, "RGBA")
    for i in range(14 if kind == "hero" else 8):
        angle = (seed[i % len(seed)] / 255) * math.pi * 2
        cx = int((seed[(i + 5) % len(seed)] / 255) * width)
        cy = int((seed[(i + 9) % len(seed)] / 255) * height)
        radius = int((0.10 + seed[(i + 13) % len(seed)] / 850) * min(width, height))
        color = (*c3, 38 + seed[(i + 17) % len(seed)] % 48)
        dx = int(math.cos(angle) * radius)
        dy = int(math.sin(angle) * radius)
        draw.line((cx - dx, cy - dy, cx + dx, cy + dy), fill=color, width=max(3, radius // 8))
        draw.ellipse((cx - radius // 2, cy - radius // 2, cx + radius // 2, cy + radius // 2), outline=color, width=max(2, radius // 14))

    overlay_h = int(height * (0.50 if kind == "hero" else 0.62))
    draw.rectangle((0, height - overlay_h, width, height), fill=(8, 12, 18, 150))

    title_font = load_font(72 if kind == "hero" else 30, bold=True)
    small_font = load_font(26 if kind == "hero" else 13, bold=True)
    meta_font = load_font(22 if kind == "hero" else 12)
    margin = int(width * 0.07)
    y = height - overlay_h + int(height * 0.10)
    topic_label = f"{category.replace('-', ' ').title()} / {topic.replace('-', ' ').title()}"
    draw.text((margin, y), topic_label.upper(), font=small_font, fill=(245, 248, 250, 218))
    y += int(height * (0.075 if kind == "hero" else 0.07))
    for line in wrap_text(draw, title, title_font, width - margin * 2):
        draw.text((margin, y), line, font=title_font, fill=(255, 255, 255, 245))
        y += int(title_font.size * 1.05)
    draw.text((margin, height - int(height * 0.10)), "OneSliders event image", font=meta_font, fill=(235, 240, 245, 190))

    img.save(path, "PNG", optimize=True)


def main() -> None:
    files = image_files()
    groups: dict[str, list[Path]] = defaultdict(list)
    for file in files:
        groups[file_hash(file)].append(file)

    replacements: list[Path] = []
    for group in groups.values():
        if len(group) <= 1:
            continue
        replacements.extend(group)

    for path in replacements:
        make_unique(path)

    final_groups: dict[str, list[Path]] = defaultdict(list)
    for file in files:
        final_groups[file_hash(file)].append(file)
    dupes = [group for group in final_groups.values() if len(group) > 1]

    print(f"Scanned {len(files)} images")
    print(f"Regenerated {len(replacements)} duplicate image files")
    print(f"Remaining duplicate hash groups: {len(dupes)}")
    if dupes:
        for group in dupes[:5]:
            print("DUPLICATE:", " | ".join(str(p.relative_to(ROOT)) for p in group[:4]))
        raise SystemExit(1)


if __name__ == "__main__":
    main()
