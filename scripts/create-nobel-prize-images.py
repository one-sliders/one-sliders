from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path("content/categories/technology/awards/events/img")


def font(size, bold=False):
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            pass
    return ImageFont.load_default()


def draw_asset(size, path):
    w, h = size
    img = Image.new("RGB", size, "#101820")
    draw = ImageDraw.Draw(img)
    for y in range(h):
        r = int(16 + (y / h) * 34)
        g = int(24 + (y / h) * 20)
        b = int(32 + (y / h) * 8)
        draw.line([(0, y), (w, y)], fill=(r, g, b))
    gold = "#d6b35a"
    pale = "#f7f0d8"
    muted = "#b8c4c2"
    margin = int(w * 0.08)
    medal_r = int(min(w, h) * 0.22)
    cx = w - margin - medal_r
    cy = int(h * 0.42)
    draw.ellipse([cx - medal_r, cy - medal_r, cx + medal_r, cy + medal_r], fill="#c99a38", outline="#f0d889", width=max(3, w // 170))
    draw.ellipse([cx - int(medal_r * 0.68), cy - int(medal_r * 0.68), cx + int(medal_r * 0.68), cy + int(medal_r * 0.68)], outline="#f7dc8a", width=max(2, w // 260))
    draw.text((cx, cy - int(medal_r * 0.2)), "N", fill="#231a0c", anchor="mm", font=font(max(54, int(w * 0.11)), True))
    for i, label in enumerate(["Physics", "Chemistry", "Medicine", "Literature", "Peace", "Economics"]):
        x = margin + (i % 2) * int(w * 0.24)
        y = int(h * 0.68) + (i // 2) * int(h * 0.08)
        draw.rounded_rectangle([x, y, x + int(w * 0.2), y + int(h * 0.052)], radius=max(6, w // 80), fill="#f7f0d8")
        draw.text((x + int(w * 0.01), y + int(h * 0.012)), label, fill="#1e2a2d", font=font(max(12, int(w * 0.018)), True))
    draw.text((margin, int(h * 0.16)), "Nobel Prize", fill=pale, font=font(max(42, int(w * 0.09)), True))
    draw.text((margin, int(h * 0.32)), "Laureates from 1970 onward", fill=gold, font=font(max(18, int(w * 0.036)), True))
    draw.text((margin, int(h * 0.43)), "Stockholm / Oslo · 10 December", fill=muted, font=font(max(16, int(w * 0.026)), False))
    img.save(path)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    hero = OUT / "nobel-prize-hero.png"
    mini = OUT / "nobel-prize-mini.png"
    draw_asset((1200, 630), hero)
    draw_asset((400, 300), mini)
    Image.open(hero).save(OUT / "nobel-prize-hero-1200.webp", quality=86)
    Image.open(hero).resize((768, 403), Image.Resampling.LANCZOS).save(OUT / "nobel-prize-hero-768.webp", quality=84)
    Image.open(hero).resize((400, 210), Image.Resampling.LANCZOS).save(OUT / "nobel-prize-hero-400.webp", quality=82)
    Image.open(mini).save(OUT / "nobel-prize-mini-400.webp", quality=84)
    Image.open(mini).resize((200, 150), Image.Resampling.LANCZOS).save(OUT / "nobel-prize-mini-200.webp", quality=82)


if __name__ == "__main__":
    main()
