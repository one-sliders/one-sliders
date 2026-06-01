from pathlib import Path
import argparse
from PIL import Image, ImageOps


def fit_crop(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    return ImageOps.fit(image.convert("RGB"), size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))


def main() -> None:
    parser = argparse.ArgumentParser(description="Crop a generated event image into OneSliders hero and mini assets.")
    parser.add_argument("--source", required=True, help="Generated source image path")
    parser.add_argument("--dest-dir", required=True, help="Event img directory")
    parser.add_argument("--slug", required=True, help="Event slug")
    args = parser.parse_args()

    source = Path(args.source)
    dest_dir = Path(args.dest_dir)
    dest_dir.mkdir(parents=True, exist_ok=True)

    with Image.open(source) as im:
        hero = fit_crop(im, (1200, 630))
        mini = fit_crop(im, (400, 300))

    hero.save(dest_dir / f"{args.slug}-hero.png", "PNG", optimize=True)
    mini.save(dest_dir / f"{args.slug}-mini.png", "PNG", optimize=True)


if __name__ == "__main__":
    main()
