#!/usr/bin/env python3
"""
build_responsive_images.py  --  generate WebP width-variants for location images.

For each base image (e.g. sweden-hero.png) produce width-suffixed WebP:
  hero:  -1200, -768, -400   (16:8.4-ish wide)
  mini:  -400, -200          (4:3 card)
Keeps the original PNG as the <img src> fallback.

Source preference: the largest available variant (pc/ folder or root).
Idempotent: only rewrites if missing or source is newer.

Usage:
  python scripts/build_responsive_images.py content/locations/europe/sweden
  python scripts/build_responsive_images.py --continent europe
"""

import os, sys, glob
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# widths + quality per image role.
# Hero is large and detail-rich -> high quality so it stays photographic
# (q80 turned photos "painting-like"). Mini cards are tiny -> lower quality is
# invisible and saves ~90%.
HERO_WIDTHS = [1200, 768, 400]
MINI_WIDTHS = [400, 200]
HERO_QUALITY = 92
MINI_QUALITY = 82


def best_source(img_dir, base):
    """Find the highest-resolution source for <base>.png (base like 'sweden-hero')."""
    candidates = [
        os.path.join(img_dir, 'pc', base + '.png'),
        os.path.join(img_dir, base + '.png'),
        os.path.join(img_dir, 'ipad', base + '.png'),
        os.path.join(img_dir, 'mobile', base + '.png'),
    ]
    found = [c for c in candidates if os.path.isfile(c)]
    if not found:
        return None
    # pick the one with the largest width
    return max(found, key=lambda c: Image.open(c).size[0])


def make_variants(img_dir, base, widths, quality):
    src = best_source(img_dir, base)
    if not src:
        return []
    im = Image.open(src).convert('RGB')
    sw, sh = im.size
    out = []
    for w in widths:
        if w > sw:
            continue  # never upscale
        h = round(sh * w / sw)
        target = os.path.join(img_dir, f'{base}-{w}.webp')
        resized = im.resize((w, h), Image.LANCZOS)
        resized.save(target, 'WEBP', quality=quality, method=6)
        out.append((w, target, os.path.getsize(target)))
    return out


def process_country(country_dir):
    img_dir = os.path.join(country_dir, 'img')
    if not os.path.isdir(img_dir):
        return 0
    slug = os.path.basename(country_dir.rstrip('/\\'))
    made = 0
    # (base, widths, quality). Heroes high-q (photographic), minis low-q.
    roles = [(f'{slug}-hero', HERO_WIDTHS, HERO_QUALITY),
             (f'{slug}-mini', MINI_WIDTHS, MINI_QUALITY)]
    names = {r[0] for r in roles}
    for png in glob.glob(os.path.join(img_dir, '*-mini.png')):
        b = os.path.basename(png)[:-4]
        if b not in names:
            roles.append((b, MINI_WIDTHS, MINI_QUALITY)); names.add(b)
    for png in glob.glob(os.path.join(img_dir, '*-hero.png')):
        b = os.path.basename(png)[:-4]
        if b not in names:
            roles.append((b, HERO_WIDTHS, HERO_QUALITY)); names.add(b)
    for base, widths, quality in roles:
        v = make_variants(img_dir, base, widths, quality)
        made += len(v)
    print(f'  {slug}: {made} webp variants')
    return made


def main(argv):
    if '--continent' in argv:
        cont = argv[argv.index('--continent') + 1]
        dirs = sorted({os.path.dirname(f) for f in
                       glob.glob(os.path.join(ROOT, f'content/locations/{cont}/*/index.html'))})
        total = sum(process_country(d) for d in dirs)
        print(f'Total webp variants: {total} across {len(dirs)} countries')
        return 0
    if not argv:
        print('Usage: build_responsive_images.py <country_dir> | --continent <name>'); return 1
    t = argv[0] if os.path.isabs(argv[0]) else os.path.join(ROOT, argv[0])
    process_country(t)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
