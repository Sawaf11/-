"""Tanween games: one deck for each tanween (fathatan, kasratan, dammatan) and a tanween review - with new games again:
  Busy Bee (fill the honey jar), Monkey Climb, Darts, Basketball, Grow a Flower, Pizza Party, Turtle Trip,
  and Block Tower (a class game for two teams).
The rules of the tanween lessons: fathatan is written with an alif (بًا), except after taa marbutah and after hamza
with an alif before it (شَجَرَةً، سَمَاءً); tanween sounds like the vowel + a silent noon (بُ + نۡ -> بٌ).
Same engine as ../fun-games (rounds, "Try again!", slide links only); instructions in English, everything to read Arabic.
usage: python3 build.py <outdir> [preview]"""
import os, sys, importlib.util
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("fb", os.path.join(HERE, "..", "fun-games", "build.py"))
fb = importlib.util.module_from_spec(spec); spec.loader.exec_module(fb)
hg, kit, fx, snd = fb.hg, fb.kit, fb.fx, fb.snd
kit.IMG_DIRS.insert(0, os.path.join(HERE, "assets", "img")); kit.AUD_DIRS.insert(0, os.path.join(HERE, "assets", "audio"))
SW, SH, INK, WHITE = fb.SW, fb.SH, fb.INK, fb.WHITE
FATHA, KASRA, DAMMA, SUKUN = fb.FATHA, fb.KASRA, fb.DAMMA, fb.SUKUN
syl = fb.syl

# ---------- tanween ----------
TAN = {"an": ("ً", "a", "ا"), "in": ("ٍ", "i", "ي"), "un": ("ٌ", "u", "و")}      # mark, its vowel, the madd letter of that vowel
NAME = {"an": "فَتۡحَتَانِ", "in": "كَسۡرَتَانِ", "un": "ضَمَّتَانِ"}
LETTERS = [l for l in hg.ORDER if l != "أ"]                                    # أ + tanween is written apart (أً، إٍ...)
def tan(l, t): return l + TAN[t][0] + ("ا" if t == "an" else "")             # بًا  بٍ  بٌ
BASES = ["كِتَاب", "بَاب", "وَلَد", "قَلَم", "شَجَر", "بَحۡر", "نَهۡر", "جَمَل", "سَمَك", "قَمَر", "عِنَب", "رَجُل", "بَيۡت", "كَلۡب", "نُور", "بَلَد",
         "طَعَام", "سَحَاب", "حِصَان", "قَلۡب", "نَجۡم", "جَبَل", "مَطَر", "شَجَرَة", "مَدۡرَسَة", "وَرۡدَة", "مَكۡتَبَة", "سَمَاء", "مَاء"]
def tword(base, t):
    """The word with tanween, with the alif of fathatan except after ة and after ء with an alif before it."""
    if t == "an" and not (base.endswith("ة") or base.endswith("اء")): return base + "ًا"
    return base + TAN[t][0]
WORDS = {t: [tword(b, t) for b in BASES] for t in TAN}
assert tword("شَجَرَة", "an") == "شَجَرَةً" and tword("سَمَاء", "an") == "سَمَاءً" and tword("قَلَم", "an") == "قَلَمًا"
NO_TAN = ["كَتَبَ", "ذَهَبَ", "جَلَسَ", "فَتَحَ", "قَالَ", "نَامَ", "يَلۡعَبُ", "يَكۡتُبُ", "سَمِعَ", "شَرِبَ", "الۡقَمَرُ", "الۡبَابُ"]

class Rounds(fb.Rounds):
    def find_tan(self, l, t):                       # بًا among بَ بَا
        v, m = TAN[t][1], TAN[t][2]
        return self.make("Find", tan(l, t), tan(l, t), [syl(l, v), syl(l, v) + m])
    def write_tan(self, l, t):                      # بُ + نۡ -> بٌ
        v, m = TAN[t][1], TAN[t][2]
        return self.make("How do we write it?", f"{syl(l, v)} + ن{SUKUN}", tan(l, t), [syl(l, v), syl(l, v) + m])
    def word_tan(self, t):                          # كِتَابًا among كِتَابَ كِتَابٌ
        b = self.P.r.choice(BASES); w = tword(b, t)
        others = [tword(b, o) for o in TAN if o != t]
        return self.make("Find", w, w, [b + {"an": FATHA, "in": KASRA, "un": DAMMA}[t], self.P.r.choice(others)])
    def which_tan(self, t):
        return self.make("Which word has tanween?", None, self.P.r.choice(WORDS[t]), self.P.shuffle(NO_TAN)[:2])
    def find_mixed(self, l):                        # review: بٍ among بًا بٌ
        t = self.P.r.choice(list(TAN))
        return self.make("Find", tan(l, t), tan(l, t), [tan(l, o) for o in TAN if o != t])
    def name_tan(self, l):
        t = self.P.r.choice(list(TAN))
        return self.make("What is it called?", tan(l, t), NAME[t], [NAME[o] for o in TAN if o != t])
    def write_mixed(self, l):
        t = self.P.r.choice(list(TAN))
        return self.make("How do we write it?", f"{syl(l, TAN[t][1])} + ن{SUKUN}", tan(l, t), [tan(l, o) for o in TAN if o != t])
    def word_mixed(self):
        b = self.P.r.choice(BASES); t = self.P.r.choice(list(TAN))
        return self.make("Find", tword(b, t), tword(b, t), [tword(b, o) for o in TAN if o != t])

# ---------- the new game scenes ----------
HOW = {
    "bee": ("Busy Bee", ["Read the question at the top.", "Fly to the right flower.", "Fill the honey jar!"], "bee"),
    "monkey": ("Monkey Climb", ["Read the question at the top.", "Tap the right card.", "Help the monkey reach the bananas!"], "monkey"),
    "darts": ("Darts", ["Read the question at the top.", "Throw at the right board.", "Bullseye! You get a star."], "dartboard"),
    "basket": ("Basketball", ["Read the question at the top.", "Shoot the right ball.", "Swish! You get a star."], "bball"),
    "garden": ("Grow a Flower", ["Read the question at the top.", "Tap the right card.", "Water the flower until it blooms!"], "plant5"),
    "pizza": ("Pizza Party", ["Read the question at the top.", "Tap the right card.", "Every right answer adds a topping!"], "pizza5"),
    "turtle": ("Turtle Trip", ["Read the question at the top.", "Tap the right card.", "Help the turtle walk home!"], "turtle"),
    "tug": ("Block Tower (class game)", ["Two teams: Red and Blue.", "Read the word, then tap your team.", "First tower of 5 blocks wins!"], "blocks"),
}
fb.HOWTO.update(HOW)
fb.RIGHT_SOUND.update({"bee": "buzz", "monkey": "boing", "darts": "thunk", "basket": "swish", "garden": "sparkle", "pizza": "munch", "turtle": "ding"})
fb.WRONG_SOUND.update({k: "bonk" for k in HOW})
THEMES = ["bee", "monkey", "darts", "basket", "garden", "pizza", "turtle"]
level = lambda r, N, done: 5 if done else min(5, round(r * 5 / N))

def draw_bee(sc, r, N, oops, done, rd, links, extra):
    sc.pic("bg_flowers", 0, 0, SW, SH, name="Meadow")
    n = level(r, N, done)
    sc.pic(f"jar{n}", 80, 560, 260, 325, name=f"Honey jar {n}")
    bee = sc.pic("bee", 300 if r > 0 else 180, 420 if r > 0 else 230, 220, 170, name="Bee")
    sc.on_load([fx("move", bee, 0, dx=0.01, dy=-0.02, dur=500, rev=True, repeat="inf")])
    if done: fb.great(sc, "Yummy honey!", x=700, y=380); return
    for j, o in enumerate(rd["options"]):
        cx = 1520 - j * 420
        sc.pic(f"flower{j}", cx - 150, 330, 300, 431, name=f"Flower {j + 1}", link=links[j])
        fb.card(sc, o, cx - 120, 410, 240, 140, links[j], f"Answer {j + 1} {o}", fill="FFF8D6", line="F2A93B")
    if oops: fb.oops_bubble(sc, x=1440, y=830)

def draw_monkey(sc, r, N, oops, done, rd, links, extra):
    sc.pic("bg_jungle", 0, 0, SW, SH, name="Jungle")
    sc.pic("palm", 130, 190, 360, 857, name="Palm tree")
    sc.pic("bananas", 250, 200, 140, 126, name="Bananas")
    y = 300 if done else 830 - min(r, N) * (480 / N)
    m = sc.pic("monkey", 210, y, 200, 215, name="Monkey")
    if done: sc.on_load([fx("move", m, 200, dx=0, dy=-0.03, dur=300, rev=True, repeat=3)]); fb.great(sc, "Bananas! Yum!", x=900, y=380); return
    if r > 0 and not oops: sc.on_load([fx("move", m, 0, dx=0, dy=-0.03, dur=250, rev=True)])
    fb.side_cards(sc, rd, links)
    if oops: fb.oops_bubble(sc, x=1340, y=870)

def draw_darts(sc, r, N, oops, done, rd, links, extra):
    sc.pic("bg_fair", 0, 0, SW, SH, name="Fair")
    hg.star_bar(sc, N, r, None if oops or r == 0 else r - 1)
    if done:
        sc.pic("dartboard", 780, 300, 360, 360, name="Board"); sc.pic("dart", 960, 440, 220, 70, name="Dart")
        fb.great(sc, "Champion!", x=1250, y=380); return
    for j, o in enumerate(rd["options"]):
        cx = 1440 - j * 480
        sc.pic("dartboard", cx - 180, 300, 360, 360, name=f"Board {j + 1}", link=links[j])
        fb.card(sc, o, cx - 130, 405, 260, 150, links[j], f"Answer {j + 1} {o}", line="3FA7C9")
    if r > 0 and not oops:
        b = sc.shp("RECTANGLE", 560, 760, 800, 140, name="Bullseye", text="Bullseye!", fs=60, color="2FB57A", bold=True, rtl=False)
        sc.on_load([fx("zoomin", b, 0, dur=300), fx("fadeout", b, 1400, dur=500)])
    if oops: fb.oops_bubble(sc, "Missed! Try again!", x=1400, y=780)

def draw_basket(sc, r, N, oops, done, rd, links, extra):
    sc.pic("bg_court", 0, 0, SW, SH, name="Court")
    hg.star_bar(sc, N, r, None if oops or r == 0 else r - 1)
    sc.pic("hoop", 750, 170, 420, 440, name="Hoop")
    if done or (r > 0 and not oops):
        sc.pic("bball", 900, 330, 120, 120, name="Ball in the hoop")
    if done: fb.great(sc, "What a player!", x=1250, y=380); return
    for j, o in enumerate(rd["options"]):
        cx = 1500 - j * 540
        sc.pic("bball", cx - 150, 630, 300, 300, name=f"Ball {j + 1}", link=links[j])
        fb.card(sc, o, cx - 120, 715, 240, 130, links[j], f"Answer {j + 1} {o}", line="F07C3C")
    if r > 0 and not oops:
        b = sc.shp("RECTANGLE", 1200, 380, 600, 140, name="Swish", text="Swish!", fs=60, color="2FB57A", bold=True, rtl=False)
        sc.on_load([fx("zoomin", b, 0, dur=300), fx("fadeout", b, 1400, dur=500)])
    if oops: fb.oops_bubble(sc, x=60, y=400)

def grow_scene(img, bg, label, size, pos, done_text):
    def draw(sc, r, N, oops, done, rd, links, extra):
        sc.pic(bg, 0, 0, SW, SH, name="Background")
        hg.star_bar(sc, N, r, None if oops or r == 0 else r - 1)
        n = level(r, N, done)
        p = sc.pic(f"{img}{n}", *pos, *size, name=f"{label} {n}")
        if done: sc.on_load([fx("scale", p, 200, sx=106, sy=106, dur=300, rev=True, repeat=2)]); fb.great(sc, done_text, x=1000, y=380); return
        if r > 0 and not oops: sc.on_load([fx("scale", p, 0, sx=105, sy=105, dur=200, rev=True)])
        fb.side_cards(sc, rd, links)
        if oops: fb.oops_bubble(sc, x=1340, y=870)
    return draw
draw_garden = grow_scene("plant", "bg_window", "Flower", (360, 682), (250, 230), "Beautiful!")
draw_pizza = grow_scene("pizza", "bg_kitchen", "Pizza", (640, 640), (140, 260), "Pizza is ready!")

def draw_turtle(sc, r, N, oops, done, rd, links, extra):
    sc.pic("bg_beach", 0, 0, SW, SH, name="Beach")
    sc.pic("home", 40, 600, 330, 330, name="Home")
    xs = [1560 - k * (1160 / N) for k in range(N + 1)]       # clear of the next button
    for k, x in enumerate(xs[:-1] if not done else xs):
        sc.shp("OVAL", x - 90, 900, 180, 60, fill="E9D8B4" if k > r else "D9C49A", line="C9A27A", lw=3, name=f"Stone {k + 1}")
    tx = 120 if done else xs[r] - 150
    t = sc.pic("turtle", tx, 740 if not done else 760, 300, 200, name="Turtle")
    if r > 0 and not oops: sc.on_load([fx("move", t, 0, dx=0, dy=-0.02, dur=200, rev=True, repeat=2)])
    if done: fb.great(sc, "Home sweet home!", x=700, y=380); return
    for j, o in enumerate(rd["options"]):
        fb.card(sc, o, 1290 - j * 520, 260, 440, 180, links[j], f"Answer {j + 1} {o}", fill=["FFF0F3", "EEF8FF", "F1FBEA"][j], line="9C93B0")
    if oops: fb.oops_bubble(sc, x=760, y=480)
for k in THEMES: setattr(fb, "draw_" + k, globals()["draw_" + k])

def tower(g, P, words):
    """Block Tower: read the word, tap your team, your tower gets a block. 5 blocks wins."""
    TOP = 5
    states = [(r, b) for r in range(TOP + 1) for b in range(TOP + 1) if not (r == TOP and b == TOP)]
    def key(r, b):
        if r == TOP or b == TOP: return g.key(f"win{r}-{b}")      # the other tower keeps its blocks
        return g.key("start" if (r, b) == (0, 0) else f"t{r}-{b}")
    made = set()
    for r, b in sorted(states, key=lambda s: (s != (0, 0), s)):
        k = key(r, b)
        if k in made: continue
        made.add(k)
        end = r == TOP or b == TOP
        sc = g.scene(k[len(g.key("start")) + 1:] or "start", None if (r, b) == (0, 0) else "cheer" if end else "pop")
        sc.pic("bg_flowers", 0, 0, SW, SH, name="Background")
        for team, x, n, col in (("Red", 170, r, "E5536F"), ("Blue", 1500, b, "3FA7C9")):
            sc.shp("RECTANGLE", x - 40, 900, 330, 20, fill="C9BEDF", name=f"{team} ground")
            for i in range(TOP):
                sc.shp("ROUNDED_RECTANGLE", x + (i % 2) * 20, 800 - i * 100, 230, 90, fill=(["FF8FA3", "FFD166", "7BDFF2", "95E1A3", "B8A1FF"][i] if i < n else None),
                       line=(col if i < n else "C9BEDF"), lw=4, dash=i >= n, rect_r=0.2, name=f"{team} block {i + 1}")
            sc.shp("RECTANGLE", x - 20, 930, 270, 70, name=f"{team} score", text=f"{team}: {n}", fs=32, color=col, bold=True, rtl=False)
        if end:
            win, col = ("Red", "E5536F") if r == TOP else ("Blue", "3FA7C9")
            ban = sc.shp("ROUNDED_RECTANGLE", 560, 300, 800, 260, fill=col, line=WHITE, lw=6, rect_r=0.3, name=f"{win} wins", text=f"{win} team wins!", fs=54, color=WHITE, bold=True, rtl=False)
            sc.on_load([fx("scale", ban, 300, sx=110, sy=110, dur=300, rev=True, repeat=2)])
            continue
        hg.banner(sc, "Block Tower!  Read the word, then tap your team.", y=20, h=100, w=1300)
        w = words[(r + b) % len(words)]
        sc.shp("ROUNDED_RECTANGLE", 610, 170, 700, 330, fill=WHITE, line="B8A1FF", lw=6, rect_r=0.15, name="Word card")
        sc.shp("RECTANGLE", 640, 180, 640, 310, name=f"Word {w}", text=w, fs=hg.ar_fs(w, 600, 300, 110), color=INK, bold=True)
        for team, x, col, n in (("Red", 560, "E5536F", (r + 1, b)), ("Blue", 1060, "3FA7C9", (r, b + 1))):
            sc.shp("ROUNDED_RECTANGLE", x, 560, 300, 130, fill=col, line=WHITE, lw=5, rect_r=0.3, name=f"{team} point", text=f"{team} ✓", fs=40, color=WHITE, bold=True, rtl=False, link=key(*n))
    g.done()
fb.tug = tower

# ---------- decks ----------
def plan(name, maker, n_games=30):
    P = hg.Picker(sum(map(ord, name)) + 11); R = Rounds(P)
    out = []
    for gi in range(n_games):
        theme = THEMES[gi % len(THEMES)]
        out.append((theme, ([maker(R, gi, k) for k in range(5)], gi // len(THEMES))))
        if gi in (n_games // 2, n_games - 1): out.append(("tug", None))
    return P, out
def letter(gi, k): return LETTERS[(gi * 3 + k) % len(LETTERS)]
def single(t):
    def maker(R, gi, k):
        l = letter(gi, k); m = (gi + k) % 5
        return [lambda: R.find_tan(l, t), lambda: R.write_tan(l, t), lambda: R.word_tan(t), lambda: R.which_tan(t), lambda: R.find_tan(l, t)][m]()
    return maker
def review(R, gi, k):
    l = letter(gi, k); m = (gi * 2 + k) % 6
    return [lambda: R.find_mixed(l), lambda: R.name_tan(l), lambda: R.write_mixed(l), lambda: R.word_mixed(), lambda: R.find_mixed(l),
            lambda: R.find_tan(l, R.P.r.choice(list(TAN)))][m]()

if __name__ == "__main__":
    for name, maker, sample, sub, words in [
        ("Fathatan Games", single("an"), "بًا  قَلَمًا  شَجَرَةً", "Bee, monkey, darts, basketball, pizza and more!", WORDS["an"]),
        ("Kasratan Games", single("in"), "بٍ  قَلَمٍ  شَجَرَةٍ", "Bee, monkey, darts, basketball, pizza and more!", WORDS["in"]),
        ("Dammatan Games", single("un"), "بٌ  قَلَمٌ  شَجَرَةٌ", "Bee, monkey, darts, basketball, pizza and more!", WORDS["un"]),
        ("Tanween Review Games", review, "بًا  بٍ  بٌ", "Fathatan, kasratan and dammatan together", WORDS["an"] + WORDS["in"] + WORDS["un"]),
    ]:
        P, pl = plan(name, maker)
        pl = [(k, a if k != "tug" else P.shuffle(words)[:10]) for k, a in pl]
        fb.deck(name, sample, sub, pl)
