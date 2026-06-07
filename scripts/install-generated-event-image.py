#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
GENERATED_ROOT = Path.home() / ".codex" / "generated_images"
FLAGS_PATH = ROOT / "content" / "events" / "event-status-flags.json"
INDEX_PATH = ROOT / "content" / "events" / "index.html"


def cover(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    target_w, target_h = size
    source_w, source_h = im.size
    scale = max(target_w / source_w, target_h / source_h)
    next_w, next_h = round(source_w * scale), round(source_h * scale)
    resized = im.resize((next_w, next_h), Image.Resampling.LANCZOS)
    left = max(0, (next_w - target_w) // 2)
    top = max(0, (next_h - target_h) // 2)
    return resized.crop((left, top, left + target_w, top + target_h))


def newest_generated_png() -> Path:
    files = [p for p in GENERATED_ROOT.rglob("*.png") if p.is_file()]
    if not files:
        raise SystemExit("No generated PNG found under .codex/generated_images")
    return max(files, key=lambda p: p.stat().st_mtime)


def sync_index_status_flags(html: str, flags: dict) -> str:
    status_by_href = {
        ".." + entry.get("url", "").replace("/content", ""): entry
        for entry in flags.get("events", [])
        if entry.get("url")
    }
    card_pattern = re.compile(r'<a class="event-card"[^>]*>')

    def replace(match: re.Match[str]) -> str:
        tag = match.group(0)
        href_match = re.search(r'href="([^"]+)"', tag)
        if not href_match:
            return tag
        status = status_by_href.get(href_match.group(1))
        if not status:
            return tag

        next_tag = re.sub(r'\sdata-image-status="fake"', "", tag)
        next_tag = re.sub(r'\sdata-official-date="[^"]*"', "", next_tag)
        next_tag = re.sub(r'\sdata-date-status="[^"]*"', "", next_tag)

        if status.get("imageStatus") == "fake-template":
            next_tag = next_tag.replace(
                '<a class="event-card"',
                '<a class="event-card" data-image-status="fake"',
                1,
            )
        if status.get("officialDateSet") is False:
            next_tag = next_tag.replace(
                '<a class="event-card"',
                '<a class="event-card" data-official-date="false"',
                1,
            )
        if status.get("dateStatus"):
            next_tag = next_tag.replace(
                '<a class="event-card"',
                f'<a class="event-card" data-date-status="{status.get("dateStatus")}"',
                1,
            )

        return next_tag

    return card_pattern.sub(replace, html)


def event_url_for_slug(flags: dict, slug: str) -> str:
    for entry in flags.get("events", []):
        if entry.get("slug") == slug:
            return entry.get("url", "")
    return ""


def install_image(slug: str, src: Path) -> dict:
    flags = json.loads(FLAGS_PATH.read_text(encoding="utf-8-sig"))
    url = event_url_for_slug(flags, slug)
    if not url:
        raise SystemExit(f"No event-status-flags entry for slug: {slug}")

    page_path = ROOT / url.lstrip("/")
    out_dir = page_path.parent / "img"
    out_dir.mkdir(parents=True, exist_ok=True)

    im = Image.open(src).convert("RGB")
    hero = cover(im, (1200, 630))
    mini = cover(im, (400, 300))

    hero.save(out_dir / f"{slug}-hero.png", "PNG", optimize=True)
    mini.save(out_dir / f"{slug}-mini.png", "PNG", optimize=True)

    for width in (1200, 768, 400):
        height = round(630 * width / 1200)
        hero.resize((width, height), Image.Resampling.LANCZOS).save(
            out_dir / f"{slug}-hero-{width}.webp",
            "WEBP",
            quality=92,
            method=6,
        )

    for width in (400, 200):
        height = round(300 * width / 400)
        mini.resize((width, height), Image.Resampling.LANCZOS).save(
            out_dir / f"{slug}-mini-{width}.webp",
            "WEBP",
            quality=82,
            method=6,
        )

    for entry in flags.get("events", []):
        if entry.get("slug") == slug:
            entry["imageStatus"] = "real-event-image"
            entry["imageNote"] = (
                "Generated photorealistic event image set completed locally: "
                "hero/mini PNG masters plus responsive WebP variants."
            )
            entry["imageUpdatedAt"] = "2026-06-07"

    html = INDEX_PATH.read_text(encoding="utf-8")
    html = sync_index_status_flags(html, flags)
    INDEX_PATH.write_text(html, encoding="utf-8")
    FLAGS_PATH.write_text(json.dumps(flags, indent=2) + "\n", encoding="utf-8")

    expected = [
        f"{slug}-hero.png",
        f"{slug}-hero-1200.webp",
        f"{slug}-hero-768.webp",
        f"{slug}-hero-400.webp",
        f"{slug}-mini.png",
        f"{slug}-mini-400.webp",
        f"{slug}-mini-200.webp",
    ]
    dimensions = {}
    for name in expected:
        path = out_dir / name
        with Image.open(path) as img:
            dimensions[name] = {"size": img.size, "bytes": path.stat().st_size}

    return {
        "slug": slug,
        "source": str(src),
        "outDir": str(out_dir),
        "files": dimensions,
        "fakeTotal": sum(
            1 for entry in flags.get("events", []) if entry.get("imageStatus") == "fake-template"
        ),
    }


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: install-generated-event-image.py <slug> [generated_png]")
        return 1
    slug = sys.argv[1]
    src = Path(sys.argv[2]) if len(sys.argv) > 2 else newest_generated_png()
    print(json.dumps(install_image(slug, src), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
