#!/usr/bin/env python3
import json
import os
import sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'scripts', 'data', 'usa-stay-cities.real.json')
IMG_DIR = os.path.join(ROOT, 'content', 'locations', 'north-america', 'usa', 'img')


def cover(im, size):
    target_w, target_h = size
    source_w, source_h = im.size
    scale = max(target_w / source_w, target_h / source_h)
    next_w, next_h = round(source_w * scale), round(source_h * scale)
    resized = im.resize((next_w, next_h), Image.LANCZOS)
    left = max(0, (next_w - target_w) // 2)
    top = max(0, (next_h - target_h) // 2)
    return resized.crop((left, top, left + target_w, top + target_h))


def install(city):
    slug = city['slug']
    src = os.path.join(ROOT, city['image']['localSource'])
    if not os.path.isfile(src):
        raise FileNotFoundError(src)
    im = Image.open(src).convert('RGB')
    hero = cover(im, (1200, 630))
    mini = cover(im, (400, 300))
    hero_path = os.path.join(IMG_DIR, f'{slug}-hero.png')
    mini_path = os.path.join(IMG_DIR, f'{slug}-mini.png')
    hero.save(hero_path, 'PNG', optimize=True)
    mini.save(mini_path, 'PNG', optimize=True)
    return slug, os.path.getsize(hero_path), os.path.getsize(mini_path)


def main():
    with open(DATA, encoding='utf-8') as f:
        payload = json.load(f)
    os.makedirs(IMG_DIR, exist_ok=True)
    for city in payload['cities']:
        slug, hero_bytes, mini_bytes = install(city)
        print(f'{slug}: hero {hero_bytes} bytes, mini {mini_bytes} bytes')
    return 0


if __name__ == '__main__':
    sys.exit(main())
