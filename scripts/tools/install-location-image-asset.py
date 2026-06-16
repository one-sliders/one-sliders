#!/usr/bin/env python3
import os
import sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def cover(im, size):
    target_w, target_h = size
    source_w, source_h = im.size
    scale = max(target_w / source_w, target_h / source_h)
    next_w, next_h = round(source_w * scale), round(source_h * scale)
    resized = im.resize((next_w, next_h), Image.LANCZOS)
    left = max(0, (next_w - target_w) // 2)
    top = max(0, (next_h - target_h) // 2)
    return resized.crop((left, top, left + target_w, top + target_h))


def main():
    if len(sys.argv) != 4:
        print("Usage: install-location-image-asset.py <source-image> <img-dir> <slug>", file=sys.stderr)
        return 2
    source, img_dir, slug = sys.argv[1:]
    img_dir = os.path.abspath(img_dir)
    os.makedirs(img_dir, exist_ok=True)
    im = Image.open(source).convert("RGB")
    hero = cover(im, (1200, 630))
    mini = cover(im, (400, 300))
    hero_path = os.path.join(img_dir, f"{slug}-hero.png")
    mini_path = os.path.join(img_dir, f"{slug}-mini.png")
    hero.save(hero_path, "PNG", optimize=True)
    mini.save(mini_path, "PNG", optimize=True)
    for width in (400, 768, 1200):
        resized = hero.resize((width, round(width * 630 / 1200)), Image.LANCZOS)
        resized.save(os.path.join(img_dir, f"{slug}-hero-{width}.webp"), "WEBP", quality=84)
    for width in (200, 400):
        resized = mini.resize((width, round(width * 300 / 400)), Image.LANCZOS)
        resized.save(os.path.join(img_dir, f"{slug}-mini-{width}.webp"), "WEBP", quality=84)
    print(f"installed {slug}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
