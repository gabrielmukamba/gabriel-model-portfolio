# Run once from the gabriel-model-portfolio folder:
#   pip install pillow
#   python make_share_image.py
from PIL import Image, ImageOps
import os

src = "images/hero-1.jpg"
out = "images/share.jpg"

img = Image.open(src).convert("RGB")
# 1200x630 is the standard link-preview size; centering keeps the face in frame
img = ImageOps.fit(img, (1200, 630), Image.LANCZOS, centering=(0.5, 0.25))

# WhatsApp ignores preview images over ~300 KB, so shrink until small enough
for quality in (85, 80, 75, 70, 65, 60, 55, 50):
    img.save(out, "JPEG", quality=quality, optimize=True)
    if os.path.getsize(out) < 280 * 1024:
        break
print("Created", out, round(os.path.getsize(out) / 1024), "KB")