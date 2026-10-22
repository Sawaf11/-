"""Games for the letters that are written but not read, and for the disjointed letters (al-huruf al-muqatta'at).
New games: Ghost Hunt (the word in its letters - tap the one we do not read), Snowman, Treasure Dig, Fireworks,
and two sorting games (Read it / Never read / Only when I stop; 2 counts or 6 counts?), mixed with the best games
of the earlier decks (frog, rocket, dino eggs, claw machine, bee, darts, pizza ...) and the Apple Tree class game.
Rules as in the lessons ../silent-letters and ../muqattaat:
  ۟ (small round zero) never read; ۠ (upright oval zero) read only when you stop on the word;
  muqatta'at are read by their names (الٓمٓ = أَلِفۡ لَآمۡ مِّيمۡ): حي طهر 2 counts, نقص عسلكم 6, alif no stretch.
Same engine as ../wasl-lam-games (slide links only); instructions in English, mushaf spelling.
usage: python3 build.py <outdir> [preview]"""
import os, sys, importlib.util
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
def load(name, rel):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, rel)); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m
wb = load("wb", "../wasl-lam-games/build.py")               # the engine (play), its scenes and the Apple Tree class game
tb = load("tb", "../tanween-games/build.py")                # more scenes: bee, monkey, darts, basketball, flower, pizza, turtle
fb, hg, kit, fx, snd = wb.fb, wb.hg, wb.kit, wb.fx, wb.snd
kit.IMG_DIRS.insert(0, os.path.join(HERE, "assets", "img"))
SW, SH, INK, WHITE = fb.SW, fb.SH, fb.INK, fb.WHITE
for k in ["frog", "penalty", "robot", "ice", "rocket", "doors", "mystery"]:            # fun-games scenes into the engine
    setattr(wb, "draw_" + k, (lambda f: lambda *a: f(*a, 0))(getattr(fb, "draw_" + k))); wb.RIGHT[k] = fb.RIGHT_SOUND[k]
for k in tb.THEMES:                                                                     # tanween-games scenes into the engine
    setattr(wb, "draw_" + k, (lambda f: lambda *a: f(*a, 0))(getattr(tb, "draw_" + k))); wb.RIGHT[k] = tb.fb.RIGHT_SOUND[k]
    fb.HOWTO[k] = tb.HOW[k]
card, great, oops_bubble, side_cards = fb.card, fb.great, fb.oops_bubble, fb.side_cards
Z, OBL = "۟", "۠"

# ---------- the letters that are written but not read ----------
NEVER = ["قَالُوا۟", "ءَامَنُوا۟", "مِا۟ئَةَ", "أُو۟لَٰٓئِكَ", "لِشَا۟يۡءٍ", "ثَمُودَا۟", "بِأَيۡي۟دٍ", "كَفَرُوا۟", "عَمِلُوا۟", "صَدَقُوا۟", "جَاهَدُوا۟", "هَاجَرُوا۟", "تَابُوا۟"]
STOPW = [("أَنَا۠", "أَنَ", "أَنَا"), ("لَّٰكِنَّا۠", "لَٰكِنَّ", "لَٰكِنَّا"), ("ٱلظُّنُونَا۠", "ٱلظُّنُونَ", "ٱلظُّنُونَا"), ("ٱلسَّبِيلَا۠", "ٱلسَّبِيلَ", "ٱلسَّبِيلَا"),
         ("ٱلرَّسُولَا۠", "ٱلرَّسُولَ", "ٱلرَّسُولَا"), ("قَوَارِيرَا۠", "قَوَارِيرَ", "قَوَارِيرَا")]                 # as written, read on (connecting), stopping
PLAIN = ["قَالَ", "نَامَ", "يَلۡعَبُ", "سَمِعَ", "نُورٌ", "فِيلٌ", "ذَهَبَ", "كِتَابٌ", "جَلَسَ", "يَقُولُ"]
def tiles(w):
    """The word in its letters: each letter with its marks (the small zero stays on its letter)."""
    out = []
    for ch in w:
        if out and hg.unicodedata.combining(ch) or (out and ch in "ٰ۟۠ۡ"): out[-1] += ch
        else: out.append(ch)
    return out
for w in NEVER: assert sum(Z in t for t in tiles(w)) == 1 and len(set(tiles(w))) == len(tiles(w)), (w, tiles(w))
for w, a, b in STOPW: assert w.endswith("ا" + OBL) and a + "ا" == b and w.replace(OBL, "").replace("لَّ", "لَ", 1) == b, w

# ---------- the disjointed letters ----------
NAMES = {"ا": "أَلِفۡ", "ل": "لَامۡ", "م": "مِيمۡ", "ص": "صَادۡ", "ر": "رَا", "ك": "كَافۡ", "ه": "هَا", "ي": "يَا", "ع": "عَيۡنۡ", "ط": "طَا", "س": "سِينۡ",
         "ح": "حَا", "ق": "قَافۡ", "ن": "نُونۡ"}
COUNT = {l: ("0" if l == "ا" else "2" if l in "حيطهر" else "6") for l in NAMES}
MUQ = [("الٓمٓ", "أَلِفۡ لَآمۡ مِّيمۡ", "أَلَمۡ"), ("الٓمٓصٓ", "أَلِفۡ لَآمۡ مِّيمۡ صَآدۡ", "أَلَمَصۡ"), ("الٓر", "أَلِفۡ لَآمۡ رَا", "أَلَرۡ"),
       ("الٓمٓر", "أَلِفۡ لَآمۡ مِّيمۡ رَا", "أَلَمَرۡ"), ("كٓهيعٓصٓ", "كَافۡ هَا يَا عَيۡنۡ صَآدۡ", "كَهَيۡعَصۡ"), ("طه", "طَا هَا", "طَهَ"),
       ("طسٓمٓ", "طَا سِينۡ مِّيمۡ", "طَسَمۡ"), ("طسٓ", "طَا سِينۡ", "طَسۡ"), ("يسٓ", "يَا سِينۡ", "يَسۡ"), ("صٓ", "صَآدۡ", "صَ"), ("حمٓ", "حَا مِيمۡ", "حَمۡ"),
       ("عٓسٓقٓ", "عَيۡنۡ سِينۡ قَافۡ", "عَسَقۡ"), ("قٓ", "قَافۡ", "قَ"), ("نٓ", "نُونۡ", "نَ")]
for m, r, w in MUQ:                               # every 6-count letter carries the madd sign in the mushaf, the others do not
    for i, ch in enumerate(m):
        if ch in NAMES and ch != "ا": assert (m[i + 1:i + 2] == "ٓ") == (COUNT[ch] == "6") or (ch == "ل" and m[i + 1:i + 2] == "ٓ"), (m, ch)

class Rounds(wb.Rounds):
    # silent letters
    def ghost(self):
        w = self.P.r.choice(NEVER); t = tiles(w)
        return self.make("Tap the letter we do NOT read", None, next(x for x in t if Z in x), [x for x in t if Z not in x], show=w, keep_order=True) | {"options": t, "right": next(i for i, x in enumerate(t) if Z in x)}
    def find_never(self):
        return self.make("Find the word with a letter we never read", None, self.P.r.choice(NEVER), self.P.shuffle(PLAIN)[:2])
    def connect_stop(self):
        w, a, b = self.P.r.choice(STOPW)
        if self.P.r.random() < 0.5: return self.make("Reading on to the next word:", w, a, [b])
        return self.make("Stopping on this word:", w, b, [a])
    def sort3(self):
        k = self.P.r.random()
        if k < 0.4:
            w = self.P.r.choice(NEVER); t = tiles(w); i = next(i for i, x in enumerate(t) if Z in x); cat = "never"
        elif k < 0.7:
            w = self.P.r.choice(STOPW)[0]; t = tiles(w); i = len(t) - 1; cat = "stop"
        else:
            w = self.P.r.choice(NEVER + [s[0] for s in STOPW]); t = tiles(w)
            i = self.P.r.choice([i for i, x in enumerate(t) if Z not in x and OBL not in x]); cat = "read"
        runs = [("".join(t[:i]), INK), (t[i], "F08A24"), ("".join(t[i + 1:]), INK)]
        return dict(prompt="The orange letter: read it?", ar=None, options=["read", "never", "stop"], right=["read", "never", "stop"].index(cat), solved=w, show=[r for r in runs if r[0]])
    # muqatta'at
    def read_muq(self):
        m, r, w = self.P.r.choice(MUQ)
        return self.make("How do we read it?", m, r, [w])
    def name_of(self):
        l = self.P.r.choice(list(NAMES))
        return self.make("What is its name?", l, NAMES[l], [NAMES[o] for o in self.P.shuffle([o for o in NAMES if o != l])[:2]])
    def counts(self):
        l = self.P.r.choice(list(NAMES))
        return dict(prompt="How many counts do we stretch it?", ar=l, options=["0", "2", "6"], right=["0", "2", "6"].index(COUNT[l]), solved=NAMES[l], show=None)
    def find_six(self):
        if self.P.r.random() < 0.5:
            return self.make("Find the letter we stretch 6 counts", None, self.P.r.choice([l for l in NAMES if COUNT[l] == "6"]), self.P.shuffle([l for l in NAMES if COUNT[l] != "6"])[:2])
        return self.make("Find the letter we stretch 2 counts", None, self.P.r.choice([l for l in NAMES if COUNT[l] == "2"]), self.P.shuffle([l for l in NAMES if COUNT[l] != "2"])[:2])
    def sort26(self):
        l = self.P.r.choice([l for l in NAMES if l != "ا"])
        return dict(prompt="2 counts or 6 counts?", ar=None, options=["2", "6"], right=["2", "6"].index(COUNT[l]), solved=NAMES[l], show=l + "   " + NAMES[l])

# ---------- new scenes ----------
def fit(sc, img, cx, cy, maxw, maxh, **kw):
    with Image.open(kit.find(kit.IMG_DIRS, img + ".png", img + ".jpeg")) as im: a = im.width / im.height
    w = min(maxw, maxh * a); h = w / a
    return sc.pic(img, cx - w / 2, cy - h / 2, w, h, **kw)

def draw_ghost(sc, r, N, oops, done, rd, links):
    sc.pic("bg_spooky", 0, 0, SW, SH, name="Background")
    for i in range(N if done else r): sc.pic("ghost", 40 + i * 100, 170, 90, 104, name=f"Ghost found {i + 1}")
    if done:
        for i in range(3):
            g = sc.pic("ghost", 500 + i * 330, 380, 260, 300, name=f"Happy ghost {i + 1}")
            sc.on_load([fx("move", g, i * 150, dx=0, dy=-0.04, dur=500, rev=True, repeat="inf")])
        great(sc, "You found all the ghosts!", x=1300, y=200); return
    sc.shp("ROUNDED_RECTANGLE", 610, 190, 700, 250, fill=WHITE, line="B8A1FF", lw=6, rect_r=0.15, name="Word card")
    sc.shp("RECTANGLE", 640, 200, 640, 230, name=f"Word {rd['show']}", text=rd["show"], fs=hg.ar_fs(rd["show"], 600, 220, 110), color=INK, bold=True)
    n = len(rd["options"]); w = min(230, (1720 - (n - 1) * 30) / n); x0 = (SW + n * w + (n - 1) * 30) / 2
    for j, o in enumerate(rd["options"]):                     # right to left, as the word is written
        x = x0 - (j + 1) * w - j * 30
        card(sc, o, x, 520, w, 230, links[j], f"Letter {j + 1} {o}", fill="FBFAFF", line="A991FF")
    if r > 0 and not oops:
        g = sc.pic("ghost", 1460, 780, 180, 207, name="Boo")
        b = sc.shp("RECTANGLE", 1080, 820, 360, 120, name="Boo text", text="Boo! Found it!", fs=36, color="8A6CF0", bold=True, rtl=False)
        sc.on_load([fx("move", g, 0, dx=0, dy=-0.05, dur=400, rev=True, repeat=2), fx("fadeout", b, 1600, dur=400)])
    if oops: oops_bubble(sc, x=60, y=800)

def draw_snowman(sc, r, N, oops, done, rd, links):
    sc.pic("bg_snow", 0, 0, SW, SH, name="Snow")
    hg.star_bar(sc, N, r, None if oops or r == 0 else r - 1)
    n = 5 if done else min(5, round(r * 5 / N))
    p = sc.pic(f"snowman{n}", 230, 320, 400, 667, name=f"Snowman {n}")
    if done: sc.on_load([fx("move", p, 200, dx=0, dy=-0.03, dur=300, rev=True, repeat=3)]); great(sc, "Hello, snowman!", x=1000, y=380); return
    side_cards(sc, rd, links)
    if oops: oops_bubble(sc, x=1340, y=870)

def draw_dig(sc, r, N, oops, done, rd, links):
    sc.pic("bg_beach", 0, 0, SW, SH, name="Beach")
    for i in range(N if done else r): sc.pic(f"gem{i % 3}", 60 + i * 120, 180, 100, 89, name=f"Gem {i + 1}")
    if done:
        c = sc.pic("chest", 740, 480, 440, 360, name="Treasure"); sc.on_load([fx("zoomin", c, 100, dur=600)])
        great(sc, "Treasure!", x=1250, y=330); return
    sc.pic("shovel", 1720, 380, 140, 262, name="Shovel")
    for j, o in enumerate(rd["options"]):
        cx = 1400 - j * 470
        sc.pic("mound", cx - 200, 600, 400, 222, name=f"Sand {j + 1}", link=links[j])
        card(sc, o, cx - 190, 630, 380, 160, links[j], f"Answer {j + 1} {o}", fill="FFF8E6", line="D9B277")
    if r > 0 and not oops:
        gm = sc.pic(f"gem{(r - 1) % 3}", 880, 340, 160, 142, name="New gem"); sc.on_load([fx("zoomin", gm, 0, dur=400)])
    if oops: oops_bubble(sc, x=60, y=380)

def draw_fireworks(sc, r, N, oops, done, rd, links):
    sc.pic("bg_sky_night", 0, 0, SW, SH, name="Night")
    spots = [(260, 160), (700, 120), (1150, 150), (1550, 130), (420, 360), (1350, 330)]
    for i in range(N if done else r):
        x, y = spots[i % len(spots)]
        f = sc.pic(f"firework{i % 3}", x, y, 260, 260, name=f"Firework {i + 1}")
        if done or (i == r - 1 and not oops): sc.on_load([fx("zoomin", f, i * 150 if done else 0, dur=500)])
    if done: great(sc, "Hooray!", x=760, y=700); sc.on_load([snd("pop", 0), snd("pop", 300)]); return
    for j, o in enumerate(rd["options"]):
        cx = 1440 - j * 480
        sc.pic("rocketstick", cx - 40, 700, 80, 260, name=f"Rocket {j + 1}", link=links[j])
        card(sc, o, cx - 200, 520, 400, 160, links[j], f"Answer {j + 1} {o}", fill="FFFDF5", line="C3B5FF")
    if oops: oops_bubble(sc, x=740, y=260)

def picture_sorter(bg, buttons):
    """buttons: {option: (picture, label)} left to right; the word on a card in the middle."""
    def draw(sc, r, N, oops, done, rd, links):
        sc.pic(bg, 0, 0, SW, SH, name="Background")
        hg.star_bar(sc, N, r, None if oops or r == 0 else r - 1)
        if done: great(sc, "Great sorting!", x=720, y=380); return
        plain = rd["show"] if isinstance(rd["show"], str) else "".join(t for t, _ in rd["show"])
        sc.shp("ROUNDED_RECTANGLE", 560, 180, 800, 300, fill=WHITE, line="B8A1FF", lw=6, rect_r=0.15, name="Card")
        sc.shp("RECTANGLE", 590, 190, 740, 280, name=f"Sort {plain}", text=rd["show"], fs=hg.ar_fs(plain, 700, 260, 120), color=INK, bold=True)
        n = len(buttons); bw = 460 if n == 2 else 420; gap = (SW - n * bw) / (n + 1)
        for k, (o, (pic, label)) in enumerate(buttons.items()):
            x = gap + k * (bw + gap); link = links[rd["options"].index(o)]
            sc.shp("ROUNDED_RECTANGLE", x, 530, bw, 450, fill=["FFF8DC", "EEEAFF", "FFE3EC"][k], line="9C93B0", lw=5, rect_r=0.12, name=f"{label} button", link=link)
            fit(sc, pic, x + bw / 2, 700, bw - 80, 260, name=label, link=link)
            sc.shp("RECTANGLE", x, 860, bw, 100, name=f"{label} label", text=label, fs=hg.en_fs(label, bw - 30, 40), color=INK, bold=True, rtl=False, link=link)
        if oops: oops_bubble(sc, x=1440, y=230)
    return draw
draw_sort3 = picture_sorter("bg_stage", {"read": ("face_say", "Read it"), "never": ("face_shh", "Never read"), "stop": ("stop_hand", "Only when I stop")})
draw_sort26 = picture_sorter("bg_garden", {"2": ("caterpillar_short", "2 counts"), "6": ("caterpillar_long", "6 counts")})
for k in ["ghost", "snowman", "dig", "fireworks", "sort3", "sort26"]: setattr(wb, "draw_" + k, globals()["draw_" + k])
wb.RIGHT.update({"ghost": "pop", "snowman": "sparkle", "dig": "ding", "fireworks": "whoosh", "sort3": "ding", "sort26": "ding"})
fb.HOWTO.update({
    "ghost": ("Ghost Hunt", ["The word is split into its letters.", "One letter is a ghost: we do not read it.", "Tap the ghost letter!"], "ghost"),
    "snowman": ("Build a Snowman", ["Read the question at the top.", "Tap the right card.", "Every right answer adds a piece!"], "snowman5"),
    "dig": ("Treasure Dig", ["Read the question at the top.", "Dig in the right sand.", "Find the gems and the treasure!"], "gem1"),
    "fireworks": ("Fireworks", ["Read the question at the top.", "Light the right rocket.", "Boom! A firework in the sky!"], "firework0"),
    "sort3": ("Read It?", ["Look at the orange letter.", "Read it, never read it,", "or read it only when you stop?"], "stop_hand"),
    "sort26": ("2 or 6?", ["Read the letter and its name.", "Short name (حَا): 2 counts.", "Long name (نُونۡ): 6 counts."], "caterpillar_long"),
})

# ---------- decks ----------
def make_plan(name, cycle, makers, n_games=30):
    P = hg.Picker(sum(map(ord, name)) + 3); R = Rounds(P)
    plan = []
    for gi in range(n_games):
        kind = cycle[gi % len(cycle)]
        ms = makers.get(kind, makers["*"])
        plan.append((kind, ([getattr(R, ms[(gi + k) % len(ms)])() for k in range(5)], 0)))
        if gi in (n_games // 2, n_games - 1): plan.append(("tug", None))
    for kind, (rounds, _) in [p for p in plan if p[0] != "tug"]:
        for rd in rounds: assert len(set(map(str, rd["options"]))) == len(rd["options"]) and 0 <= rd["right"] < len(rd["options"]), rd
    return P, plan

if __name__ == "__main__":
    silent_cycle = ["ghost", "snowman", "sort3", "dig", "fireworks", "ghost", "frog", "dino", "sort3", "bee", "ghost", "rocket", "claw", "pizza", "sort3"]
    muq_cycle = ["snowman", "dig", "sort26", "fireworks", "penalty", "hab", "sort26", "darts", "robot", "butterfly", "sort26", "monkey", "camel", "basket"]
    for name, cycle, makers, sample, sub, words in [
        ("Silent Letters Games", silent_cycle, {"ghost": ["ghost"], "sort3": ["sort3"], "*": ["find_never", "connect_stop", "find_never", "connect_stop", "find_never"]},
         "قَالُوا۟  مِا۟ئَةَ  أَنَا۠", "Find the ghost letters: written, but not read!", NEVER + [s[0] for s in STOPW]),
        ("Muqattaat Games", muq_cycle, {"sort26": ["sort26"], "*": ["read_muq", "name_of", "counts", "find_six", "read_muq"]},
         "الٓمٓ  كٓهيعٓصٓ  يسٓ", "Read the letter names: 0, 2 or 6 counts", [m for m, _, _ in MUQ]),
    ]:
        P, plan = make_plan(name, cycle, makers)
        plan = [(k, a if k != "tug" else P.shuffle(words)[:10]) for k, a in plan]
        fb.deck(name, sample, sub, plan)
