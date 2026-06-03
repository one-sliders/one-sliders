#!/usr/bin/env python3
"""Export the latest generated image into a city's hero/mini asset set."""

from pathlib import Path
import argparse

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
GENERATED = Path.home() / ".codex" / "generated_images"

HERO = [
    ("", (1200, 630), ".png", 90),
    ("-1200", (1200, 630), ".webp", 88),
    ("-768", (768, 403), ".webp", 88),
    ("-400", (400, 210), ".webp", 86),
]
MINI = [
    ("", (400, 300), ".png", 90),
    ("-400", (400, 300), ".webp", 86),
    ("-200", (200, 150), ".webp", 84),
]


def latest_generated() -> Path:
    files = [p for p in GENERATED.rglob("*.png") if p.is_file()]
    if not files:
        raise SystemExit("No generated PNG files found.")
    return max(files, key=lambda p: p.stat().st_mtime)


def save_fit(source: Image.Image, target: Path, size: tuple[int, int], quality: int):
    fitted = ImageOps.fit(source, size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
    if target.suffix.lower() == ".webp":
        fitted.save(target, "WEBP", quality=quality, method=6)
    else:
        fitted.save(target, "PNG")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("continent")
    parser.add_argument("country")
    parser.add_argument("city")
    parser.add_argument("--source", type=Path, default=None)
    args = parser.parse_args()

    source_path = args.source or latest_generated()
    img_dir = ROOT / "content" / "locations" / args.continent / args.country / "img"
    if not img_dir.is_dir():
        raise SystemExit(f"Missing image directory: {img_dir}")

    with Image.open(source_path) as raw:
        source = raw.convert("RGB")
        for suffix, size, ext, quality in HERO:
            save_fit(source, img_dir / f"{args.city}-hero{suffix}{ext}", size, quality)
        for suffix, size, ext, quality in MINI:
            save_fit(source, img_dir / f"{args.city}-mini{suffix}{ext}", size, quality)

    print(f"Exported {args.continent}/{args.country}/{args.city} from {source_path}")


if __name__ == "__main__":
    main()
