# Run this every time you add or remove pictures/videos:
#   python build_media.py
# It scans the "images" and "videos" folders and writes media.json, which the
# Lookbook and Reels pages read. No other file needs to change.
from pathlib import Path
import json, re

IMG_EXT = {".jpg", ".jpeg", ".png", ".webp"}
VID_EXT = {".mp4", ".webm", ".mov", ".m4v"}
SKIP = {"share.jpg", "favicon.png", "favicon.ico"}   # not lookbook photos

def natural(name):
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", name)]

def photo_order(path):
    n = path.name.lower()
    group = 0 if "hero" in n else 1 if ("logo" in n or "brand" in n) else 2   # hero, logo, then the rest
    return (group, natural(path.name))

def pretty(stem):
    return re.sub(r"[-_]+", " ", stem).strip().title()

def classify(name):
    n = name.lower()
    stem = Path(n).stem
    num = re.fullmatch(r"photo-?(\d+)", stem)
    if "logo" in n or "brand" in n:
        return "branding", "BRAND IDENTITY", "Gabriel Mukamba Official Logo" if stem == "logo" else pretty(stem)
    if stem == "hero-1":
        return "featured", "SIGNATURE HERO 01", "Main Editorial Frame"
    if stem == "hero-2":
        return "featured", "SIGNATURE HERO 02", "Comp Card Portrait"
    if "hero" in n:
        return "featured", "SIGNATURE HERO", pretty(stem)
    if any(k in n for k in ("iuea", "stage", "runway")):
        return "runway", "MR. IUEA & STAGE", pretty(stem)
    if num:
        i = int(num.group(1))
        cat = "runway" if i <= 11 else "editorial"      # same rule as before: 01-11 stage, rest editorial
        tag = "MR. IUEA & STAGE" if cat == "runway" else "EDITORIAL & COMMERCIAL"
        return cat, tag, f"Portfolio Frame {i:02d}"
    return "editorial", "EDITORIAL & COMMERCIAL", pretty(stem)

photos, videos, big = [], [], []

img_dir, vid_dir = Path("images"), Path("videos")
if img_dir.exists():
    for f in sorted(img_dir.iterdir(), key=photo_order):
        if f.suffix.lower() in IMG_EXT and f.name.lower() not in SKIP:
            cat, tag, title = classify(f.name)
            photos.append({"src": f"images/{f.name}", "cat": cat, "tag": tag, "title": title})
if vid_dir.exists():
    for f in sorted(vid_dir.iterdir(), key=lambda p: natural(p.name)):
        if f.suffix.lower() in VID_EXT:
            videos.append({"src": f"videos/{f.name}", "name": f.name})
            mb = f.stat().st_size / 1024 / 1024
            if mb > 50:
                big.append((f.name, mb))

Path("media.json").write_text(json.dumps({"photos": photos, "videos": videos}, indent=1), encoding="utf-8")

print(f"media.json written: {len(photos)} photos, {len(videos)} videos")
for name, mb in big:
    flag = "GitHub will REJECT this file (over 100 MB) - compress it!" if mb > 100 else "large (GitHub warns above 50 MB) - compressing it will make the site faster"
    print(f"  {name}: {mb:.0f} MB - {flag}")