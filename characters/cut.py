"""Cut a 10x10 grid of characters on a transparent background into one PNG each.
usage: cut2.py grid.webp prefix outdir   -> prefix_<row><column>.png, rows top to bottom, columns left to right"""
import sys, os, numpy as np
from PIL import Image
from scipy import ndimage
src, prefix, out = sys.argv[1:4]
im = np.asarray(Image.open(src).convert("RGBA")).copy()
a = im[..., 3].astype(int)
a[a < 24] = 0                                   # faint haze around the pictures
# seeds: the solid core of each character, shrunk so that neighbours that touch come apart
core = ndimage.binary_erosion(a >= 160, iterations=2)
seed, n = ndimage.label(core)
area = ndimage.sum(core, seed, range(1, n + 1))
keep = [i + 1 for i in range(n) if area[i] >= 80]
seed[~np.isin(seed, keep)] = 0
while len(keep) > 100:                          # a character in two parts: join the smaller part to its neighbour
    l = min(keep, key=lambda l: (seed == l).sum())
    d, ind = ndimage.distance_transform_edt(~np.isin(seed, [x for x in keep if x != l]), return_indices=True)
    ys, xs = np.nonzero(seed == l); j = np.argmin(d[ys, xs])
    seed[seed == l] = seed[ind[0][ys[j], xs[j]], ind[1][ys[j], xs[j]]]; keep.remove(l)
assert len(keep) == 100, len(keep)
# every visible pixel joins its nearest seed (only if close to it)
d, ind = ndimage.distance_transform_edt(seed == 0, return_indices=True)
owner = np.where((a > 0) & (d <= 14), seed[ind[0], ind[1]], 0)
cent = {l: ndimage.center_of_mass(seed == l) for l in keep}
order = sorted(keep, key=lambda l: cent[l][0])
for r in range(10):
    for c, l in enumerate(sorted(order[r * 10:(r + 1) * 10], key=lambda l: cent[l][1])):
        mine = owner == l
        lab, m = ndimage.label(mine)                # drop crumbs that are not part of the character
        if m > 1:
            sizes = ndimage.sum(mine, lab, range(1, m + 1))
            mine = np.isin(lab, [j + 1 for j in range(m) if sizes[j] >= 0.03 * sizes.max()])
        ys, xs = np.nonzero(mine); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        piece = im[y0:y1, x0:x1].copy()
        piece[..., 3] = np.where(mine[y0:y1, x0:x1], np.minimum(255, a[y0:y1, x0:x1] * 255 // 254), 0)
        Image.fromarray(piece).save(os.path.join(out, f"{prefix}_{r}{c}.png"))
print(prefix, "100 characters")
