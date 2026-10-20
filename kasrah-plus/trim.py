"""Crop each sprite to its visible pixels and record width/height in sprites/aspect.json."""
import glob, json, os
from PIL import Image
here = os.path.dirname(os.path.abspath(__file__))
meta = {}
for f in sorted(glob.glob(os.path.join(here, "sprites", "*.png"))):
    im = Image.open(f).convert("RGBA")
    im = im.crop(im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox())
    im.save(f, optimize=True)
    meta[os.path.basename(f)[:-4]] = round(im.width / im.height, 3)
json.dump(meta, open(os.path.join(here, "sprites", "aspect.json"), "w"), indent=0)
print(len(meta), "sprites trimmed")
