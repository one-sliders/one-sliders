#!/usr/bin/env python3
"""
Generate responsive WebP variants from existing event PNG masters.

This is intentionally narrower than install-generated-event-image.py: it does
not install a new source image, alter event flags, or touch HTML. It only fills
missing/outdated WebP variants beside existing {slug}-hero.png and
{slug}-mini.png files under category event image folders and date-archive
event image folders.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
HERO_SIZES = ((1200, 630), (768, 403), (400, 210))
MINI_SIZES = ((400, 300), (200, 150))
HERO_QUALITY = 92
MINI_QUALITY = 82


def cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    target_w, target_h = size
    source_w, source_h = image.size
    scale = max(target_w / source_w, target_h / source_h)
    next_w, next_h = round(source_w * scale), round(source_h * scale)
    resized = image.resize((next_w, next_h), Image.Resampling.LANCZOS)
    left = max(0, (next_w - target_w) // 2)
    top = max(0, (next_h - target_h) // 2)
    return resized.crop((left, top, left + target_w, top + target_h))


def variants_for(master: Path) -> tuple[tuple[tuple[int, int], ...], int]:
    name = master.name
    if name.endswith("-hero.png"):
        return HERO_SIZES, HERO_QUALITY
    if name.endswith("-mini.png"):
        return MINI_SIZES, MINI_QUALITY
    raise ValueError(f"Unsupported event image master: {master}")


def target_is_current(target: Path, master: Path, size: tuple[int, int]) -> bool:
    if not target.exists() or target.stat().st_mtime < master.stat().st_mtime:
        return False
    try:
        with Image.open(target) as image:
            return image.size == size
    except OSError:
        return False


def build_variant(master: Path, size: tuple[int, int], quality: int, force: bool) -> Path | None:
    width, height = size
    target = master.with_name(f"{master.stem}-{width}.webp")
    if not force and target_is_current(target, master, size):
        return None

    with Image.open(master) as source:
        image = source.convert("RGB")
        source_w, source_h = image.size
        if width > source_w or height > source_h:
            return None
        resized = cover(image, size)
        resized.save(target, "WEBP", quality=quality, method=6)
    return target


def discover_masters() -> list[Path]:
    roots = sorted(ROOT.glob("content/categories/**/events/img"))
    roots.extend(sorted(ROOT.glob("content/events/**/img")))
    masters: list[Path] = []
    for img_dir in roots:
        masters.extend(sorted(img_dir.glob("*-hero.png")))
        masters.extend(sorted(img_dir.glob("*-mini.png")))
    return masters


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="Regenerate existing variants too.")
    parser.add_argument("--json", action="store_true", help="Print machine-readable output.")
    args = parser.parse_args()

    created: list[str] = []
    scanned = 0
    skipped_upscale: list[str] = []

    for master in discover_masters():
        scanned += 1
        sizes, quality = variants_for(master)
        with Image.open(master) as source:
            source_w, source_h = source.size
        for size in sizes:
            width, height = size
            if width > source_w or height > source_h:
                skipped_upscale.append(str(master.relative_to(ROOT)))
                continue
            made = build_variant(master, size, quality, args.force)
            if made:
                created.append(str(made.relative_to(ROOT)))

    result = {
        "mastersScanned": scanned,
        "webpCreated": len(created),
        "created": created,
        "skippedUpscale": sorted(set(skipped_upscale)),
    }
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(f"Scanned {scanned} event PNG masters")
        print(f"Created/updated {len(created)} WebP variants")
        if skipped_upscale:
            print(f"Skipped {len(set(skipped_upscale))} undersized masters to avoid upscaling")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
