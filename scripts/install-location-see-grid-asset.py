#!/usr/bin/env python3
import os
import sys
from PIL import Image


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
        print("Usage: install-location-see-grid-asset.py <source-grid-image> <img-dir> <slug>", file=sys.stderr)
        return 2
    source, img_dir, slug = sys.argv[1:]
    img_dir = os.path.abspath(img_dir)
    os.makedirs(img_dir, exist_ok=True)
    im = Image.open(source).convert("RGB")
    w, h = im.size
    tile_w, tile_h = w // 3, h // 2
    for index in range(6):
        col = index % 3
        row = index // 3
        tile = im.crop((col * tile_w, row * tile_h, (col + 1) * tile_w, (row + 1) * tile_h))
        mini = cover(tile, (400, 300))
        base = f"{slug}-see-{index + 1}-mini"
        mini.save(os.path.join(img_dir, f"{base}.png"), "PNG", optimize=True)
        for width in (200, 400):
            resized = mini.resize((width, round(width * 300 / 400)), Image.LANCZOS)
            resized.save(os.path.join(img_dir, f"{base}-{width}.webp"), "WEBP", quality=84)
    print(f"installed see grid {slug}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
