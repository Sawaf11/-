"""Cut a 10x10 grid of characters on white into transparent PNGs. usage: cut.py grid.webp prefix outdir"""
import sys, os, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
src, prefix, out = sys.argv[1:4]
im = np.asarray(Image.open(src).convert("RGB")).astype(int)
H, W = im.shape[:2]
mn = im.min(axis=2)
light = mn >= 236
lab, _ = ndimage.label(light)
border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bg = np.isin(lab, list(border))
# the grid has thin near-white seams running through the pictures: background must be wider than a seam
bg = ndimage.binary_opening(bg, structure=np.ones((5, 5)))
obj = ~bg
soft = np.clip((255 - mn) * 255 // 40, 0, 255).astype(np.uint8)
edge = ndimage.binary_dilation(bg, iterations=1) & ~bg
alpha_all = np.where(bg, 0, 255).astype(np.uint8)
alpha_all[edge] = np.minimum(alpha_all[edge], soft[edge])
# seeds: the solid body of each character (light shadows between neighbours are not part of it)
strong = ndimage.binary_erosion(ndimage.binary_fill_holes(ndimage.binary_closing(mn < 225, iterations=1)) & obj, iterations=4)
seed, n = ndimage.label(strong)
area = ndimage.sum(np.ones_like(seed), seed, range(1, n + 1))
keep = [i + 1 for i in range(n) if area[i] >= 500]
seed = np.where(np.isin(seed, keep), seed, 0)
# a character split in two (wings, tails) gives extra seeds: join the smallest to its nearest neighbour
while len(keep) > 100:
    sizes = {l: (seed == l).sum() for l in keep}
    l = min(keep, key=sizes.get)
    others = np.isin(seed, [x for x in keep if x != l])
    d, ind = ndimage.distance_transform_edt(~others, return_indices=True)
    ys, xs = np.nonzero(seed == l); j = np.argmin(d[ys, xs])
    seed[seed == l] = seed[ind[0][ys[j], xs[j]], ind[1][ys[j], xs[j]]]; keep.remove(l)
assert len(keep) == 100, len(keep)
# every remaining object pixel joins its nearest seed
idx = ndimage.distance_transform_edt(seed == 0, return_distances=False, return_indices=True)
owner = seed[idx[0], idx[1]] * obj
cents = {l: ndimage.center_of_mass(seed == l) for l in keep}
order = sorted(keep, key=lambda l: cents[l][0])          # ten characters per row, top to bottom
rows = {r: order[r * 10:(r + 1) * 10] for r in range(10)}
k = 0
for r in sorted(rows):
    items = sorted(rows[r], key=lambda l: cents[l][1])
    if len(items) != 10: print("row", r, "has", len(items))
    for c, l in enumerate(items):
        mine = owner == l
        # drop far-away crumbs that only joined by distance
        lab2, m = ndimage.label(mine)
        if m > 1:
            sizes = ndimage.sum(np.ones_like(lab2), lab2, range(1, m + 1)); core = lab2[seed == l]
            ok = set(np.unique(core[core > 0])) | {j + 1 for j in range(m) if sizes[j] >= 300}
            mine = np.isin(lab2, list(ok))
        ys, xs = np.nonzero(mine); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        a = np.where(mine[y0:y1, x0:x1], alpha_all[y0:y1, x0:x1], 0).astype(np.uint8)
        rgb = im[y0:y1, x0:x1].astype(np.uint8).copy()
        # the light grey floor shadow under the feet becomes a soft see-through dark shadow,
        # so it looks right on any background colour
        cm = mn[y0:y1, x0:x1]; spread = im[y0:y1, x0:x1].max(2) - cm
        floor = (cm >= 205) & (spread < 14) & mine[y0:y1, x0:x1]
        floor[: int((y1 - y0) * 0.8)] = False
        # light grey crumbs of the shadow from the row above sit on top of heads: drop them
        top = (cm >= 205) & (spread < 14) & mine[y0:y1, x0:x1]
        top[int((y1 - y0) * 0.12):] = False
        a[top] = 0
        fl, fn = ndimage.label(floor)
        touch = set(np.unique(fl[ndimage.binary_dilation(a == 0) & (fl > 0)]))
        floor = np.isin(fl, list(touch - {0}))
        rgb[floor] = (40, 30, 50)
        a[floor] = np.clip((255 - cm[floor].astype(int)) * 3, 0, 120)
        a = Image.fromarray(a).filter(ImageFilter.GaussianBlur(0.5))
        rgba = Image.fromarray(rgb).convert("RGBA"); rgba.putalpha(a)
        rgba = rgba.crop(rgba.getchannel("A").point(lambda v: 255 if v > 24 else 0).getbbox())
        rgba.save(os.path.join(out, f"{prefix}_{r}{c}.png")); k += 1
print(prefix, k)
