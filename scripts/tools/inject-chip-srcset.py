#!/usr/bin/env python3
"""
add_chip_srcset.py  --  add WebP srcset to country/city chip <img> on location
index pages (continent + locations root), where the -mini.webp variants exist.

Makes pages like content/locations/europe/index.html serve the same responsive
WebP thumbnails that the country pages use. PNG stays as src fallback.

Usage:
  python scripts/add_chip_srcset.py content/locations/europe/index.html
  python scripts/add_chip_srcset.py --all
"""

import os, sys, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# <img src="<path>-mini.png" ...>   (only add srcset if not already present)
IMG = re.compile(r'<img\b(?![^>]*\bsrcset=)([^>]*?)\bsrc="([^"]*?-mini)\.png"([^>]*?)>')


def page_dir(page):
    return os.path.dirname(page)


def process(page):
    h = open(page, encoding='utf-8').read()
    pdir = page_dir(page)
    changed = [0]

    def repl(m):
        pre, base, post = m.group(1), m.group(2), m.group(3)
        # resolve the image path relative to the page to check the webp exist on disk
        if base.startswith('/'):
            disk = os.path.join(ROOT, base.lstrip('/'))
        else:
            disk = os.path.normpath(os.path.join(pdir, base))
        variants = []
        for w in (200, 400):
            if os.path.isfile(disk + f'-{w}.webp'):
                variants.append(f'{base}-{w}.webp {w}w')
        if not variants:
            return m.group(0)
        changed[0] += 1
        srcset = ' srcset="' + ', '.join(variants) + '" sizes="(max-width:620px) 220px, 400px"'
        return f'<img{pre}src="{base}.png"{srcset}{post}>'

    new = IMG.sub(repl, h)
    if changed[0]:
        with open(page, 'w', encoding='utf-8', newline='') as fh:
            fh.write(new)
    return changed[0]


def main(argv):
    if '--all' in argv:
        pages = glob.glob(os.path.join(ROOT, 'content/locations/**/index.html'), recursive=True)
        total = 0; files = 0
        for p in pages:
            n = process(p)
            if n:
                files += 1; total += n
        print(f'Added srcset to {total} chips across {files} pages')
        return 0
    if not argv:
        print('Usage: add_chip_srcset.py <page.html> | --all'); return 1
    p = argv[0] if os.path.isabs(argv[0]) else os.path.join(ROOT, argv[0])
    print(f'{process(p)} chips updated in {p}')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
