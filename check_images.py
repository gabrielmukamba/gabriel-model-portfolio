# Finds and repairs pictures that the browser cannot show.
# Run inside the gabriel-model-portfolio folder:
#     python check_images.py          (only checks and reports)
#     python check_images.py --fix    (repairs them; your originals are backed up first)
# For phone pictures saved as HEIC/AVIF you need once:  pip install pillow-heif
import os, shutil, subprocess, sys
from pathlib import Path
from PIL import Image, ImageOps

try:
    import pillow_heif
    pillow_heif.register_heif_opener()
    HEIF_OK = True
except Exception:
    HEIF_OK = False

FIX = "--fix" in sys.argv
IMG_EXT = {".jpg", ".jpeg", ".png", ".webp"}
MAX_SIDE = 3200                      # longest side after repair (still very sharp)
folder = Path("images")
backup = Path.home() / "Documents" / "images-backup-heic"

def real_type(path):
    with open(path, "rb") as f:
        h = f.read(16)
    if h[:3] == b"\xff\xd8\xff": return "jpeg"
    if h[:8] == b"\x89PNG\r\n\x1a\n": return "png"
    if h[:4] == b"RIFF" and h[8:12] == b"WEBP": return "webp"
    if h[4:8] == b"ftyp": return "heic/avif (browsers can NOT show this)"
    if h[:3] == b"GIF": return "gif"
    return "unknown"

def git_lines(*args):
    try:
        out = subprocess.run(["git", *args], capture_output=True, text=True, check=True).stdout
        return set(l.strip().strip('"') for l in out.splitlines() if l.strip())
    except Exception:
        return None

def scan():
    tracked = git_lines("ls-files", "images")
    on_github = git_lines("ls-tree", "-r", "--name-only", "origin/main", "images")
    found = []
    for p in sorted(x for x in folder.iterdir() if x.is_file() and x.suffix.lower() in IMG_EXT):
        notes, fixable = [], False
        t = real_type(p)
        ext = p.suffix.lower().lstrip(".")
        ext = "jpeg" if ext == "jpg" else ext
        if t != ext:
            notes.append(f"file is really '{t}' but is named {p.suffix}")
            fixable = True
        try:
            with Image.open(p) as im:
                im.verify()
            with Image.open(p) as im:
                if im.mode not in ("RGB", "L", "RGBA", "P"):
                    notes.append(f"colour mode {im.mode}"); fixable = True
                if max(im.size) > 6000:
                    notes.append(f"very large ({im.size[0]}x{im.size[1]})"); fixable = True
        except Exception as e:
            notes.append(f"cannot be opened ({type(e).__name__})"); fixable = True
        mb = p.stat().st_size / 1024 / 1024
        if mb > 10:
            notes.append(f"very big file ({mb:.0f} MB)"); fixable = True
        rel = "images/" + p.name
        if tracked is not None and rel not in tracked:
            notes.append("NOT added to git (or spelled with different capital letters in git)")
        if on_github is not None and rel not in on_github:
            notes.append("NOT on GitHub yet (or spelled differently there)")
        if notes:
            found.append((p, notes, fixable))
    return found

problems = scan()
print(f"Checked {len(list(folder.iterdir()))} files in images.")
if not problems:
    print("No problem found.")
else:
    print(f"{len(problems)} picture(s) with a problem:\n")
    for p, notes, _ in problems:
        print(" -", p.name)
        for n in notes:
            print("     *", n)

if FIX and problems:
    needs_heif = any("heic" in " ".join(n) for _, n, _ in problems)
    if needs_heif and not HEIF_OK:
        print("\nSome pictures are HEIC/AVIF. First run:   pip install pillow-heif")
        print("then run this command again.")
        sys.exit(1)
    backup.mkdir(parents=True, exist_ok=True)
    print(f"\nBacking up originals to {backup} and repairing...")
    fixed = failed = 0
    for p, notes, fixable in problems:
        if not fixable:
            continue
        try:
            shutil.copy2(p, backup / p.name)
            with Image.open(p) as im:
                im = ImageOps.exif_transpose(im)           # keep the picture upright
                keep_alpha = p.suffix.lower() == ".png" and im.mode in ("RGBA", "LA", "P")
                im = im.convert("RGBA" if keep_alpha else "RGB")
                if max(im.size) > MAX_SIDE:
                    im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
                tmp = p.with_name(p.stem + ".tmp" + p.suffix)
                if p.suffix.lower() == ".png":
                    im.save(tmp, "PNG", optimize=True)
                else:
                    im.save(tmp, "JPEG", quality=92, optimize=True)
            os.replace(tmp, p)
            fixed += 1
            print("   fixed", p.name)
        except Exception as e:
            failed += 1
            print("   COULD NOT FIX", p.name, "-", e)
    print(f"\nDone: {fixed} fixed, {failed} failed.")
    print("Next:  python build_media.py ; git add . ; git commit -m \"Fix pictures\" ; git push")