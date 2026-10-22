"""Hamzat al-wasl and sun & moon lam games, and a review of both - with a new set of games:
  Dino Eggs, Claw Machine, Hot-Air Balloon, Sail to the Lighthouse, Cookie Tray, Butterfly Jar, Camel Trip,
  two sorting games (Sun or Moon?, Say it or skip it?) and Apple Tree (a class game for two teams).
The rules follow the hamzat al-wasl lesson (../hamzat-wasl): starting from ٱ we say it - اَ before al-, اِ in the
special nouns, and in verbs we count to the 3rd letter (damma -> اُ, otherwise اِ; ٱمۡشُوا۟ ٱبۡنُوا۟ ٱقۡضُوا۟ say اِ);
connecting, we skip it. Sun letters: the lam is silent and the next letter has a shaddah; moon letters: the lam has
a sukun and is read. Same engine as ../fun-games and ../tanween-games (slide links only).
usage: python3 build.py <outdir> [preview]"""
import os, sys, importlib.util
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("fb", os.path.join(HERE, "..", "fun-games", "build.py"))
fb = importlib.util.module_from_spec(spec); spec.loader.exec_module(fb)
hg, kit, fx, snd = fb.hg, fb.kit, fb.fx, fb.snd
for d in ("../tanween-games/assets/img", "assets/img"): kit.IMG_DIRS.insert(0, os.path.normpath(os.path.join(HERE, d)))
for d in ("../tanween-games/assets/audio",): kit.AUD_DIRS.insert(0, os.path.normpath(os.path.join(HERE, d)))
SW, SH, INK, WHITE = fb.SW, fb.SH, fb.INK, fb.WHITE

# ---------- hamzat al-wasl: [as in the mushaf, the vowel we start with] ----------
START = {
    "a": ["ٱلۡحَمۡدُ", "ٱللَّهُ", "ٱلۡقَمَرُ", "ٱلشَّمۡسُ", "ٱلنَّاسُ", "ٱلدِّينُ", "ٱلۡفِيلُ", "ٱلۡعِلۡمُ", "ٱلۡبَيۡتُ", "ٱلرَّحِيمُ"],
    "i": ["ٱسۡمُ", "ٱبۡنُ", "ٱمۡرَأَةٌ", "ٱثۡنَانِ", "ٱهۡدِنَا", "ٱذۡهَبۡ", "ٱجۡلِسۡ", "ٱرۡجِعۡ", "ٱصۡبِرۡ", "ٱفۡتَحۡ", "ٱقۡرَأۡ", "ٱمۡشُوا۟", "ٱبۡنُوا۟"],
    "u": ["ٱدۡعُ", "ٱنظُرۡ", "ٱعۡبُدُوا۟", "ٱدۡخُلُوا۟", "ٱكۡتُبۡ", "ٱشۡكُرُوا۟", "ٱسۡجُدُوا۟", "ٱذۡكُرُوا۟", "ٱخۡرُجۡ", "ٱرۡكُضۡ"],
}
OPEN = {"a": "اَ", "i": "اِ", "u": "اُ"}
def start_read(w, v): return OPEN[v] + w[1:]                                   # ٱلۡحَمۡدُ -> اَلۡحَمۡدُ
MIDDLE = ["بِسۡمِ ٱللَّهِ", "رَبِّ ٱلۡعَٰلَمِينَ", "وَٱتَّقُوا۟", "فِي ٱلۡأَرۡضِ", "وَٱلشَّمۡسِ", "وَٱلۡقَمَرِ", "وَٱلۡعَصۡرِ", "وَٱلۡفَجۡرِ", "وَٱللَّيۡلِ",
          "قُلِ ٱدۡعُوا۟", "مِنَ ٱللَّهِ", "يَوۡمِ ٱلدِّينِ", "فَٱسۡجُدُوا۟", "وَٱصۡبِرۡ"]
QAT = ["أَكَلَ", "أَخَذَ", "أَحۡمَدُ", "أُمٌّ", "إِنَّ", "أَنۡتَ", "أَبٌ", "إِذَا", "أُخۡتٌ", "أَرۡضٌ"]
for v, ws in START.items():
    for w in ws: assert w[0] == "ٱ", w
for p in MIDDLE: assert "ٱ" in p and not p.startswith("ٱ"), p
# ---------- sun and moon lam ----------
SUN_L = "تثدذرزسشصضطظلن"; MOON_L = "أبجحخعغفقكمهوي"
SUN_W = ["ٱلشَّمۡسُ", "ٱلتِّينُ", "ٱلثَّوۡبُ", "ٱلدَّرۡسُ", "ٱلذَّهَبُ", "ٱلرَّجُلُ", "ٱلزَّيۡتُ", "ٱلسَّمَكُ", "ٱلصَّبۡرُ", "ٱلضَّوۡءُ", "ٱلطَّعَامُ", "ٱلظُّهۡرُ", "ٱللَّيۡلُ", "ٱلنُّورُ", "ٱلنَّجۡمُ"]
MOON_W = ["ٱلۡقَمَرُ", "ٱلۡأَرۡضُ", "ٱلۡبَابُ", "ٱلۡجَمَلُ", "ٱلۡحَمۡدُ", "ٱلۡخُبۡزُ", "ٱلۡعِلۡمُ", "ٱلۡغَيۡمُ", "ٱلۡفِيلُ", "ٱلۡكِتَابُ", "ٱلۡمَاءُ", "ٱلۡهِلَالُ", "ٱلۡوَلَدُ", "ٱلۡيَدُ"]
for w in SUN_W: assert w[1] == "ل" and w[2] in SUN_L and "ّ" in w[3:5], w      # silent lam: no mark on it, shaddah on the next letter
for w in MOON_W: assert w[1:3] == "لۡ" and w[3] in MOON_L, w                   # read lam: sukun on it

class Rounds:
    def __init__(self, P): self.P = P
    def make(self, prompt, ar, right, wrong, show=None, keep_order=False):
        opts = [right] + list(wrong)
        if not keep_order: opts = self.P.shuffle(opts)
        assert len(set(opts)) == len(opts), opts
        return dict(prompt=prompt, ar=ar, options=opts, right=opts.index(right), solved=right, show=show)
    # hamzat al-wasl
    def start_vowel(self):
        v = self.P.r.choice("aiu"); w = self.P.r.choice(START[v])
        return self.make("Start reading. Which sound first?", w, OPEN[v], [OPEN[o] for o in "aiu" if o != v])
    def start_word(self):
        v = self.P.r.choice("aiu"); w = self.P.r.choice(START[v])
        return self.make("How do we start reading it?", w, start_read(w, v), [start_read(w, o) for o in "aiu" if o != v])
    def find_wasl(self):
        v = self.P.r.choice("aiu")
        return self.make("Find the hamzat al-wasl  ( ٱ )", None, self.P.r.choice(START[v]), self.P.shuffle(QAT)[:2])
    def say_skip(self):
        if self.P.r.random() < 0.5:
            v = self.P.r.choice("aiu"); return self.make("Say it or skip it?", "ٱ", "say", ["skip"], show=self.P.r.choice(START[v]), keep_order=True)
        return self.make("Say it or skip it?", "ٱ", "skip", ["say"], show=self.P.r.choice(MIDDLE), keep_order=True)
    # sun and moon
    def sun_moon_word(self):
        if self.P.r.random() < 0.5: return self.make("Sun or moon?", None, "sun", ["moon"], show=self.P.r.choice(SUN_W), keep_order=True)
        return self.make("Sun or moon?", None, "moon", ["sun"], show=self.P.r.choice(MOON_W), keep_order=True)
    def sun_moon_letter(self):
        if self.P.r.random() < 0.5: return self.make("A sun letter or a moon letter?", None, "sun", ["moon"], show=self.P.r.choice(SUN_L), keep_order=True)
        return self.make("A sun letter or a moon letter?", None, "moon", ["sun"], show=self.P.r.choice(MOON_L), keep_order=True)
    def find_said(self):
        return self.make("Find the word where we SAY the lam", None, self.P.r.choice(MOON_W), self.P.shuffle(SUN_W)[:2])
    def find_silent(self):
        return self.make("Find the word with a SILENT lam", None, self.P.r.choice(SUN_W), self.P.shuffle(MOON_W)[:2])
    def find_letter(self):
        if self.P.r.random() < 0.5: return self.make("Find the SUN letter", None, self.P.r.choice(SUN_L), self.P.shuffle(list(MOON_L))[:2])
        return self.make("Find the MOON letter", None, self.P.r.choice(MOON_L), self.P.shuffle(list(SUN_L))[:2])

# ---------- one game: rounds; a right tap moves the story on, a wrong tap -> "Try again!" ----------
RIGHT = {"dino": "pop", "claw": "ding", "hab": "whoosh", "boat": "splash", "cookies": "sparkle", "butterfly": "sparkle", "camel": "ding", "sunmoon": "ding", "sayskip": "ding"}
def play(g, P, theme, rounds, extra=0):
    N = len(rounds)
    def key(r, oops=False):
        if r == N: return g.key("done")
        return g.key(f"r{r}/oops" if oops else "start" if r == 0 else f"r{r}")
    for r, oops in [(r, False) for r in range(N + 1)] + [(r, True) for r in range(N)]:
        k = key(r, oops)
        sc = g.scene(k[len(g.key("start")) + 1:] or "start", "boing" if oops else None if r == 0 else RIGHT[theme] if r < N else "tada")
        done = r == N
        rd = rounds[min(r, N - 1)]
        links = [key(r + 1) if j == rd["right"] else key(r, True) for j in range(len(rd["options"]))]
        globals()["draw_" + theme](sc, r, N, oops, done, rd, links)
        if not done: hg.banner(sc, rd["prompt"], rd["ar"], w=1000)
        else: sc.on_load([snd("cheer", 600)])
    g.done()
fb.themed = lambda g, P, theme, rounds, extra=0: play(g, P, theme, rounds, extra)
card, great, oops_bubble, side_cards = fb.card, fb.great, fb.oops_bubble, fb.side_cards
def row_cards(sc, rd, links, y=190, h=170, w=440):
    for j, o in enumerate(rd["options"]):
        card(sc, o, 1290 - j * 520, y, w, h, links[j], f"Answer {j + 1} {o}", fill=["FFF0F3", "EEF8FF", "F1FBEA"][j], line="9C93B0")

def draw_dino(sc, r, N, oops, done, rd, links):
    sc.pic("bg_dino", 0, 0, SW, SH, name="Background")
    for i in range(N if done else r):
        d = sc.pic("dino", 60 + i * 170, 850, 160, 160, name=f"Baby dino {i + 1}")
        if done or (i == r - 1 and not oops): sc.on_load([fx("move", d, 0, dx=0, dy=-0.03, dur=250, rev=True, repeat=2)])
    if done: great(sc, "All the eggs hatched!", x=700, y=380); return
    for j, o in enumerate(rd["options"]):
        cx = 1440 - j * 480
        sc.pic(f"egg{j}", cx - 150, 260, 300, 380, name=f"Egg {j + 1}", link=links[j])
        card(sc, o, cx - 130, 390, 260, 140, links[j], f"Answer {j + 1} {o}", fill="FFFDF5", line="F2A93B")
    if oops: oops_bubble(sc, x=1420, y=640)

def draw_claw(sc, r, N, oops, done, rd, links):
    sc.pic("bg_arcade", 0, 0, SW, SH, name="Arcade")
    sc.shp("RECTANGLE", 60, 180, 460, 70, name="Prizes label", text="My prizes", fs=34, color="8A6CF0", bold=True, rtl=False)
    for i in range(N if done else r):
        sc.pic(f"toy{i % 5}", 90 + (i % 2) * 210, 270 + (i // 2) * 210, 190, 190, name=f"Prize {i + 1}")
    if done: great(sc, "You won all the toys!", x=900, y=380); return
    sc.pic("claw", 1100, 214, 200, 250, name="Claw")
    for j, o in enumerate(rd["options"]):
        cx = 1640 - j * 400
        sc.pic(f"toy{(j + r) % 5}", cx - 100, 560, 200, 200, name=f"Toy {j + 1}", link=links[j])
        card(sc, o, cx - 160, 440, 320, 130, links[j], f"Answer {j + 1} {o}", line="F2A9BE")
    if oops: oops_bubble(sc, x=40, y=820)

def draw_hab(sc, r, N, oops, done, rd, links):
    sc.pic("bg_clouds", 0, 0, SW, SH, name="Sky")
    y = 160 if done else 620 - r * (440 / N)
    b = sc.pic("hab", 200, y, 300, 413, name="Hot-air balloon")
    sc.on_load([fx("move", b, 0, dx=0, dy=-0.015, dur=900, rev=True, repeat="inf")])
    if done: great(sc, "Up in the sky!", x=900, y=380); return
    side_cards(sc, rd, links)
    if oops: oops_bubble(sc, x=1340, y=870)

def draw_boat(sc, r, N, oops, done, rd, links):
    sc.pic("bg_sea2", 0, 0, SW, SH, name="Sea")
    sc.pic("lighthouse", 40, 160, 260, 537, name="Lighthouse")
    x = 260 if done else 1500 - r * (1150 / N)
    b = sc.pic("boat", x, 520, 340, 300, name="Boat")
    sc.on_load([fx("spin", b, 0, deg=3, dur=700, rev=True, repeat="inf")])
    if done: great(sc, "Land ahoy!", x=800, y=300); return
    row_cards(sc, rd, links, y=190)
    if oops: oops_bubble(sc, x=1340, y=830)

def draw_cookies(sc, r, N, oops, done, rd, links):
    sc.pic("bg_kitchen", 0, 0, SW, SH, name="Kitchen")
    hg.star_bar(sc, N, r, None if oops or r == 0 else r - 1)
    sc.shp("ROUNDED_RECTANGLE", 110, 300, 760, 520, fill="C9CED8", line="9AA5B8", lw=6, rect_r=0.06, name="Tray")
    for k in range(6):
        baked = done or k < r * 6 // N
        sc.pic("cookie" if baked else "cookie_dough", 160 + (k % 3) * 240, 360 + (k // 3) * 230, 180, 180, name=f"Cookie {k + 1}")
    if done: great(sc, "Cookies are ready!", x=1000, y=380); return
    side_cards(sc, rd, links)
    if oops: oops_bubble(sc, x=1340, y=870)

def draw_butterfly(sc, r, N, oops, done, rd, links):
    sc.pic("bg_garden", 0, 0, SW, SH, name="Garden")
    sc.pic("glassjar", 80, 470, 320, 420, name="Jar")
    for i in range(N if done else r):
        sc.pic(f"bfly{i % 3}", 135 + (i % 2) * 105, 760 - (i // 2) * 95, 110, 88, name=f"Caught butterfly {i + 1}")
    if done: great(sc, "A jar full of butterflies!", x=700, y=380); return
    for j, o in enumerate(rd["options"]):
        cx, cy = 1520 - j * 420, 470 + (j % 2) * 90
        b = sc.pic(f"bfly{j}", cx - 170, cy - 136, 340, 272, name=f"Butterfly {j + 1}", link=links[j])
        c = card(sc, o, cx - 130, cy - 60, 260, 130, links[j], f"Answer {j + 1} {o}", line="A991FF")
        sc.on_load([fx("move", sp, j * 200, dx=0, dy=-0.02, dur=800 + j * 150, rev=True, repeat="inf") for sp in (b, c)])
    if oops: oops_bubble(sc, x=1360, y=820)

def draw_camel(sc, r, N, oops, done, rd, links):
    sc.pic("bg_desert", 0, 0, SW, SH, name="Desert")
    sc.pic("oasis", 30, 560, 460, 380, name="Oasis")
    x = 380 if done else 1480 - r * (1000 / N)
    c = sc.pic("camel", x, 600, 380, 320, name="Camel")
    if r > 0 and not oops: sc.on_load([fx("move", c, 0, dx=0, dy=-0.02, dur=250, rev=True, repeat=2)])
    if done: great(sc, "Water at last!", x=900, y=330); return
    row_cards(sc, rd, links, y=190)
    if oops: oops_bubble(sc, x=900, y=420)

def sorter(bg, pics, labels):
    """Two big picture buttons; the word or letter to sort is on a card in the middle."""
    def draw(sc, r, N, oops, done, rd, links):
        sc.pic(bg, 0, 0, SW, SH, name="Background")
        hg.star_bar(sc, N, r, None if oops or r == 0 else r - 1)
        if done: great(sc, "Great sorting!", x=720, y=380); return
        sc.shp("ROUNDED_RECTANGLE", 610, 190, 700, 300, fill=WHITE, line="B8A1FF", lw=6, rect_r=0.15, name="Card")
        sc.shp("RECTANGLE", 640, 200, 640, 280, name=f"Sort {rd['show']}", text=rd["show"], fs=hg.ar_fs(rd["show"], 600, 270, 130), color=INK, bold=True)
        for j, o in enumerate(rd["options"]):
            k = list(pics).index(o)
            cx = 480 if k == 0 else 1440
            sc.shp("ROUNDED_RECTANGLE", cx - 230, 540, 460, 440, fill=["FFF8DC", "EEEAFF"][k], line="9C93B0", lw=5, rect_r=0.12, name=f"{labels[k]} button", link=links[j])
            sc.pic(pics[o], cx - 140, 560, 280, 280, name=labels[k], link=links[j])
            sc.shp("RECTANGLE", cx - 230, 860, 460, 100, name=f"{labels[k]} label", text=labels[k], fs=44, color=INK, bold=True, rtl=False, link=links[j])
        if oops: oops_bubble(sc, x=740, y=600)
    return draw
draw_sunmoon = sorter("bg_daynight", {"sun": "sun", "moon": "moon"}, ["Sun", "Moon"])
draw_sayskip = sorter("bg_stage", {"say": "face_say", "skip": "face_shh"}, ["Say it", "Skip it"])

fb.HOWTO.update({
    "dino": ("Dino Eggs", ["Read the question at the top.", "Tap the right egg.", "Hatch all the baby dinos!"], "hatched"),
    "claw": ("Claw Machine", ["Read the question at the top.", "Grab the right toy.", "Win all the prizes!"], "claw"),
    "hab": ("Hot-Air Balloon", ["Read the question at the top.", "Tap the right card.", "Fly up to the clouds!"], "hab"),
    "boat": ("Sail Away", ["Read the question at the top.", "Tap the right card.", "Sail to the lighthouse!"], "boat"),
    "cookies": ("Cookie Tray", ["Read the question at the top.", "Tap the right card.", "Bake all the cookies!"], "cookie"),
    "butterfly": ("Butterfly Jar", ["Read the question at the top.", "Catch the right butterfly.", "Fill the jar!"], "bfly0"),
    "camel": ("Camel Trip", ["Read the question at the top.", "Tap the right card.", "Walk the camel to the water!"], "camel"),
    "sunmoon": ("Sun or Moon?", ["Read the word or the letter.", "Silent lam: tap the sun.", "We say the lam: tap the moon."], "moon"),
    "sayskip": ("Say It or Skip It?", ["Look at the ٱ in the word.", "Starting from it: say it.", "Reading on to it: skip it."], "face_shh"),
    "tug": ("Apple Tree (class game)", ["Two teams: Red and Blue.", "Read the word, then tap your team.", "First basket with 5 apples wins!"], "apple"),
})

def apples(g, P, words):
    """Apple Tree: read the word, tap your team, an apple drops into your basket. 5 apples wins."""
    TOP = 5
    def key(r, b):
        if r == TOP or b == TOP: return g.key(f"win{r}-{b}")
        return g.key("start" if (r, b) == (0, 0) else f"t{r}-{b}")
    spots = [(760, 380), (900, 320), (1050, 330), (1170, 400), (700, 520), (850, 470), (1000, 470), (1140, 540), (800, 620), (1060, 620)]
    for r in range(TOP + 1):
        for b in range(TOP + 1):
            if r == TOP and b == TOP: continue
            end = r == TOP or b == TOP
            sc = g.scene(key(r, b)[len(g.key("start")) + 1:] or "start", None if (r, b) == (0, 0) else "cheer" if end else "pop")
            sc.pic("bg_garden", 0, 0, SW, SH, name="Background")
            sc.pic("tree", 610, 270, 700, 760, name="Apple tree")
            for i, (x, y) in enumerate(spots[r + b:]): sc.pic("apple", x, y, 70, 76, name=f"Apple {i + 1}")
            for team, bx, n, col in (("Red", 70, r, "E5536F"), ("Blue", 1530, b, "3FA7C9")):
                for i in range(n): sc.pic("apple", bx + 50 + (i % 3) * 70, 720 - (i // 3) * 60, 70, 76, name=f"{team} apple {i + 1}")
                sc.pic("basket", bx, 760, 320, 220, name=f"{team} basket")
                sc.shp("RECTANGLE", bx, 985, 320, 70, name=f"{team} score", text=f"{team}: {n}", fs=32, color=col, bold=True, rtl=False)
            if end:
                win, col = ("Red", "E5536F") if r == TOP else ("Blue", "3FA7C9")
                ban = sc.shp("ROUNDED_RECTANGLE", 560, 330, 800, 240, fill=col, line=WHITE, lw=6, rect_r=0.3, name=f"{win} wins", text=f"{win} team wins!", fs=54, color=WHITE, bold=True, rtl=False)
                sc.on_load([fx("scale", ban, 300, sx=110, sy=110, dur=300, rev=True, repeat=2)])
                continue
            hg.banner(sc, "Apple Tree!  Read the word, then tap your team.", y=20, h=100, w=1300)
            w = words[(r + b) % len(words)]
            sc.shp("ROUNDED_RECTANGLE", 660, 140, 600, 200, fill=WHITE, line="B8A1FF", lw=6, rect_r=0.15, name="Word card")
            sc.shp("RECTANGLE", 680, 150, 560, 180, name=f"Word {w}", text=w, fs=hg.ar_fs(w, 520, 170, 96), color=INK, bold=True)
            for team, x, col, n in (("Red", 80, "E5536F", (r + 1, b)), ("Blue", 1540, "3FA7C9", (r, b + 1))):
                sc.shp("ROUNDED_RECTANGLE", x, 380, 300, 130, fill=col, line=WHITE, lw=5, rect_r=0.3, name=f"{team} point", text=f"{team} ✓", fs=40, color=WHITE, bold=True, rtl=False, link=key(*n))
    g.done()
fb.tug = apples

# ---------- decks ----------
def make_plan(name, makers, sorter_kind, n_games=30):
    """makers: round makers for the 3-card games; sorter_kind: 'sunmoon', 'sayskip' or both (alternating)."""
    P = hg.Picker(sum(map(ord, name)) + 5); R = Rounds(P)
    cycle = ["dino", "claw", "SORT", "hab", "boat", "cookies", "SORT", "butterfly", "camel"]
    plan, s = [], 0
    for gi in range(n_games):
        kind = cycle[gi % len(cycle)]
        if kind == "SORT":
            kind = sorter_kind[s % len(sorter_kind)]; s += 1
            maker = {"sunmoon": lambda k: (R.sun_moon_word if k % 3 else R.sun_moon_letter)(), "sayskip": lambda k: R.say_skip()}[kind]
            plan.append((kind, ([maker(k) for k in range(5)], 0)))
        else:
            plan.append((kind, ([getattr(R, makers[(gi + k) % len(makers)])() for k in range(5)], 0)))
        if gi in (n_games // 2, n_games - 1): plan.append(("tug", None))
    return P, plan

if __name__ == "__main__":
    for name, makers, sorts, sample, sub, words in [
        ("Hamzat al-Wasl Games", ["start_vowel", "start_word", "find_wasl", "start_word"], ["sayskip"], "ٱلۡحَمۡدُ  ٱهۡدِنَا  ٱدۡعُ", "Start: say it.  Reading on: skip it!",
         sum(START.values(), []) + MIDDLE),
        ("Sun and Moon Lam Games", ["find_said", "find_silent", "find_letter"], ["sunmoon"], "ٱلشَّمۡسُ  ٱلۡقَمَرُ", "Is the lam silent or do we say it?", SUN_W + MOON_W),
        ("Wasl and Lam Review Games", ["start_vowel", "find_said", "start_word", "find_silent", "find_wasl", "find_letter"], ["sayskip", "sunmoon"],
         "ٱلۡحَمۡدُ  وَٱلشَّمۡسِ  ٱلۡقَمَرُ", "Hamzat al-wasl and the sun and moon lam", sum(START.values(), []) + SUN_W + MOON_W),
    ]:
        P, plan = make_plan(name, makers, sorts)
        plan = [(k, a if k != "tug" else P.shuffle(words)[:10]) for k, a in plan]
        fb.deck(name, sample, sub, plan)
