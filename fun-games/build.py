"""Fun games: Sukun, Shaddah and a Review of everything - with all-new games, so the children do not get bored:
  Frog Hop, Penalty Kick, Build a Robot, Ice-Cream Tower, Rocket Launch, Castle Doors, Mystery Picture,
  and Tug of War (a class game for two teams).
Every game is a few rounds; a right tap moves the story on (the frog hops, a goal, a robot part, a scoop...),
a wrong tap shows "Try again!" on the same picture. Slide links only (no triggers, no macros): works in PowerPoint
on every device, Keynote and Google Slides. Instructions in English; everything to read is Arabic, with the
Quranic sukun (ۡ). Shared engine and sounds: ../harakat-games (kit.py, build.py).
usage: python3 build.py <outdir> [preview]"""
import os, sys, importlib.util
HERE = os.path.dirname(os.path.abspath(__file__))
HG_DIR = os.path.join(HERE, "..", "harakat-games")
sys.path.insert(0, HG_DIR)
spec = importlib.util.spec_from_file_location("hg", os.path.join(HG_DIR, "build.py"))
hg = importlib.util.module_from_spec(spec); spec.loader.exec_module(hg)
kit, fx, snd = hg.kit, hg.fx, hg.snd
kit.IMG_DIRS.insert(0, os.path.join(HERE, "assets", "img")); kit.AUD_DIRS.insert(0, os.path.join(HERE, "assets", "audio"))
SW, SH, INK, WHITE = hg.SW, hg.SH, hg.INK, hg.WHITE
OUT = hg.OUT
FATHA, KASRA, DAMMA, SUKUN, SHADDA = "َ", "ِ", "ُ", "ۡ", "ّ"
V = {"a": FATHA, "i": KASRA, "u": DAMMA}
def syl(l, v): return hg.syl(l, v)

# ---------- what to read ----------
SUKUN_WORDS = ["قُلۡ", "لَمۡ", "مِنۡ", "عَنۡ", "هَلۡ", "بَلۡ", "قَدۡ", "كَمۡ", "كَلۡبٌ", "شَمۡسٌ", "بَحۡرٌ", "نَهۡرٌ", "قَلۡبٌ", "بِنۡتٌ", "أُخۡتٌ", "نَجۡمٌ",
               "حَبۡلٌ", "سَهۡلٌ", "صَبۡرٌ", "شُكۡرٌ", "ذِكۡرٌ", "عِلۡمٌ", "رَأۡسٌ", "ذِئۡبٌ", "مَسۡجِدٌ", "مَكۡتَبٌ", "مَلۡعَبٌ", "مَطۡبَخٌ", "يَكۡتُبُ", "يَلۡعَبُ", "يَشۡرَبُ", "يَفۡهَمُ", "يَسۡمَعُ"]
PLAIN_WORDS = ["كَتَبَ", "ذَهَبَ", "جَلَسَ", "فَتَحَ", "سَمَكٌ", "قَلَمٌ", "وَلَدٌ", "جَمَلٌ", "بَقَرٌ", "شَجَرٌ", "قَمَرٌ", "عِنَبٌ", "حَجَرٌ", "رَجُلٌ", "بَلَدٌ"]
SHADDAH_WORDS = ["رَبَّ", "شَدَّ", "مَدَّ", "عَدَّ", "رَدَّ", "حَجَّ", "سَلَّمَ", "عَلَّمَ", "كَسَّرَ", "قَطَّعَ", "دَرَّسَ", "مُعَلِّمٌ", "مُدَرِّسٌ", "سُكَّرٌ", "تُفَّاحٌ",
                 "رُمَّانٌ", "بَطَّةٌ", "قِطَّةٌ", "جَنَّةٌ", "أُمٌّ", "جَدٌّ", "حَقٌّ", "مُحَمَّدٌ", "ثُمَّ", "إِنَّ", "كَلَّا", "هِرَّةٌ"]
SHAMS = ["الشَّمۡسُ", "النَّجۡمُ", "الدَّرۡسُ", "الرَّجُلُ", "التِّينُ", "السَّمَكُ", "الزَّهۡرُ", "الصَّبۡرُ"]
QAMAR = ["الۡقَمَرُ", "الۡبَابُ", "الۡكِتَابُ", "الۡوَلَدُ", "الۡفِيلُ", "الۡجَمَلُ", "الۡعِلۡمُ", "الۡبَيۡتُ"]
NAMES = {"a": "فَتۡحَةٌ", "i": "كَسۡرَةٌ", "u": "ضَمَّةٌ", "an": "تَنۡوِينٌ", "madd": "مَدٌّ", "sukun": "سُكُونٌ", "shaddah": "شَدَّةٌ"}
for w in SUKUN_WORDS: assert SUKUN in w, w
for w in SHADDAH_WORDS: assert SHADDA in w, w

def variants(w, mark):
    """Look-alike wrong readings of a word: the mark taken away, or the first vowel changed."""
    out = []
    if mark == SUKUN: out.append(w.replace(SUKUN, FATHA, 1))
    if mark == SHADDA: out.append(w.replace(SHADDA, "", 1))
    for a, b in ((FATHA, DAMMA), (DAMMA, FATHA), (KASRA, FATHA)):
        if a in w: out.append(w.replace(a, b, 1)); break
    return [x for x in dict.fromkeys(out) if x != w]

class Rounds:
    """Builds rounds: {prompt, ar, options (3), right, solved}."""
    def __init__(self, P): self.P = P
    def make(self, prompt, ar, right, wrong):
        opts = self.P.shuffle([right] + wrong[:2])
        assert len(set(opts)) == 3, opts
        return dict(prompt=prompt, ar=ar, options=opts, right=opts.index(right), solved=right)
    def other(self, l, n=1): return self.P.others(l, n)
    # sukun
    def closed(self, l):                           # أَبۡ among أَبَ أَبِ
        x = self.other(l)[0]; v = "a" if l in "أوي" else self.P.r.choice("aiu")
        base = syl(x, v); w = [base + l + V[o] for o in "aiu"][:2]
        return self.make("Find", base + l + SUKUN, base + l + SUKUN, w)
    def join_sukun(self, l):                       # بَ + لۡ = بَلۡ
        x = self.other(l)[0]; v = "a" if l in "أوي" else self.P.r.choice("aiu"); base = syl(x, v)
        return self.make("Put them together:", f"{base} + {l}{SUKUN}", base + l + SUKUN, [base + l + FATHA, base + l + KASRA if v != "i" else base + l + DAMMA])
    def word_with(self, words, mark, plain):
        w = self.P.r.choice(words)
        return self.make("Find", w, w, self.P.shuffle(variants(w, mark))[:2] if len(variants(w, mark)) >= 2 else variants(w, mark) + [self.P.r.choice(plain)])
    def which(self, words, plain, name):
        return self.make(f"Which word has a {name}?", None, self.P.r.choice(words), self.P.shuffle(plain)[:2])
    # shaddah
    def double(self, l):                           # بَّ among بَ بِّ
        v = self.P.r.choice("aiu"); v2 = [o for o in "aiu" if o != v][0]
        return self.make("Find", l + SHADDA + V[v], l + SHADDA + V[v], [syl(l, v), l + SHADDA + V[v2]])
    def twins(self, l):                            # أَبۡ + بَ = أَبَّ
        x = self.other(l)[0]; v = self.P.r.choice("aiu"); v2 = self.P.r.choice("aiu"); base = syl(x, v)
        return self.make("Put them together:", f"{base}{l}{SUKUN} + {l}{V[v2]}", base + l + SHADDA + V[v2], [base + l + V[v2], base + l + SUKUN])
    # review
    def mark_find(self, l, kind):
        if kind == "harakat": v = self.P.r.choice("aiu"); r = syl(l, v); w = [syl(l, o) for o in "aiu" if o != v]
        elif kind == "tanween": t = self.P.r.choice(["ً", "ٍ", "ٌ"]); r = l + t + ("ا" if t == "ً" and l not in "ةء" else ""); w = [l + o + ("ا" if o == "ً" else "") for o in "ًٌٍ" if o != t]
        elif kind == "madd":
            m = self.P.r.choice([("a", "ا"), ("u", "و"), ("i", "ي")]) if l != "أ" else self.P.r.choice([("u", "و"), ("i", "ي")])
            r = syl(l, m[0]) + m[1]; w = [syl(l, v) + c for v, c in (("a", "ا"), ("u", "و"), ("i", "ي")) if c != m[1] and not (l == "أ" and c == "ا")] + [syl(l, m[0])]
        elif kind == "sukun": return self.closed(l)
        else: return self.double(l)
        return self.make("Find", r, r, w)
    def name_it(self, l):                          # what is on the letter? (Arabic names)
        k = self.P.r.choice(["a", "i", "u", "an", "madd", "sukun", "shaddah"])
        show = {"a": syl(l, "a"), "i": syl(l, "i"), "u": syl(l, "u"), "an": l + "ٌ", "madd": syl(l, "u") + "و", "sukun": syl(self.other(l)[0], "a") + l + SUKUN, "shaddah": l + SHADDA + FATHA}[k]
        wrong = self.P.shuffle([NAMES[o] for o in NAMES if o != k])[:2]
        return self.make("What is it called?", show, NAMES[k], wrong)
    def lam(self):
        return self.make("Tap the word where we SAY the lam", None, self.P.r.choice(QAMAR), self.P.shuffle(SHAMS)[:2])

# ---------- the game themes ----------
THEMES = ["frog", "penalty", "robot", "ice", "rocket", "doors", "mystery"]
HOWTO = {
    "frog": ("Frog Hop", ["Read the question at the top.", "Tap the right lily pad.", "Help the frog reach the island!"], "frog"),
    "penalty": ("Penalty Kick", ["Read the question at the top.", "Tap the right card in the goal.", "Score 5 goals!"], "ball"),
    "robot": ("Build a Robot", ["Read the question at the top.", "Tap the right card.", "Every right answer adds a part!"], "robot5"),
    "ice": ("Ice-Cream Tower", ["Read the question at the top.", "Tap the right card.", "Every right answer adds a scoop!"], "ice5"),
    "rocket": ("Rocket Launch", ["Read the question at the top.", "Tap the right card to add fuel.", "Full tank? 3, 2, 1... go!"], "rocket"),
    "doors": ("Castle Doors", ["Read the question at the top.", "Open the right door.", "Find the treasure!"], "door"),
    "mystery": ("Mystery Picture", ["Read the question at the top.", "Tap the right card.", "A piece of the picture opens!"], "pic_lion"),
    "tug": ("Tug of War (class game)", ["Two teams: Red and Blue.", "Read the word, then tap your team.", "Pull the flag 3 steps to win!"], "puller_red"),
}
RIGHT_SOUND = {"frog": "boing", "penalty": "kick", "robot": "beep", "ice": "pop", "rocket": "whoosh", "doors": "creak", "mystery": "ding"}
WRONG_SOUND = {"frog": "splash", "penalty": "bonk", "robot": "bonk", "ice": "bonk", "rocket": "bonk", "doors": "bonk", "mystery": "bonk"}
MYSTERY = [("pic_lion", "It's a lion!"), ("pic_whale", "It's a whale!"), ("pic_balloon", "A hot-air balloon!")]

def card(sc, t, x, y, w, h, link, name, fill=WHITE, line="B8A1FF"):
    return hg.letter_shape(sc, t, x, y, w, h, hg.ar_fs(t, w - 40, h - 30, 80), name, fill=fill, line=line, kind="ROUNDED_RECTANGLE", link=link)
def side_cards(sc, rd, links, x=960, w=820, h=190, y0=250, gap=40):
    for j, o in enumerate(rd["options"]):
        card(sc, o, x, y0 + j * (h + gap), w, h, links[j], f"Answer {j + 1} {o}", fill=["FFF0F3", "EEF8FF", "F1FBEA"][j], line="9C93B0")

def themed(g, P, theme, rounds, extra=0):
    """One game: len(rounds) rounds in the given theme."""
    N = len(rounds)
    def key(r, oops=False):
        if r == N: return g.key("done")
        return g.key(f"r{r}/oops" if oops else "start" if r == 0 else f"r{r}")
    for r, oops in [(r, False) for r in range(N + 1)] + [(r, True) for r in range(N)]:
        k = key(r, oops); state = k[len(g.key("start")) + 1:] or "start"
        sound = WRONG_SOUND[theme] if oops else None if r == 0 else RIGHT_SOUND[theme] if r < N else "tada"
        sc = g.scene(state, sound)
        done = r == N
        rd = rounds[min(r, N - 1)]
        links = [key(r + 1) if j == rd["right"] else key(r, True) for j in range(3)] if not done else [None] * 3
        globals()["draw_" + theme](sc, r, N, oops, done, rd, links, extra)
        if not done:
            hg.banner(sc, rd["prompt"], rd["ar"], w=1000)
        else:
            sc.on_load([snd("cheer", 600)])
    g.done()

def oops_bubble(sc, text="Try again!", x=60, y=180): hg.bubble(sc, text, "E5536F", x=x, y=y, w=440, h=220)
def great(sc, text="Great job!", x=60, y=180): hg.bubble(sc, text, "2FB57A", x=x, y=y, w=480, h=230)

def draw_frog(sc, r, N, oops, done, rd, links, extra):
    sc.pic("bg_river", 0, 0, SW, SH, name="River")
    cols = [1720] + [1480 - k * 240 for k in range(N)]               # the bank, then one column of pads per round
    sc.pic("island", 0, 360, 380, 300, name="Island")
    for k in range(1, r + 1):
        if k <= N: sc.pic("lilypad", cols[k] - 130, 620, 260, 116, name=f"Pad {k}")
    fx_, fy = (90, 300) if done else (cols[r] - 110, 520)
    frog = sc.pic("frog", fx_, fy, 220, 190, name="Frog")
    if r > 0 and not oops: sc.on_load([fx("move", frog, 0, dx=0, dy=-0.06, dur=250, rev=True, repeat=2)])   # a happy hop
    if done:
        great(sc, "You made it!", x=500, y=180)
        return
    for j, o in enumerate(rd["options"]):
        y = 250 + j * 270
        sc.pic("lilypad", cols[r + 1] - 160, y + 40, 320, 142, name=f"Lily pad {j + 1}", link=links[j])
        card(sc, o, cols[r + 1] - 135, y - 30, 270, 120, links[j], f"Answer {j + 1} {o}", line="5FB760")
    if oops: oops_bubble(sc, "Splash! Try again!", x=60, y=760)

def draw_penalty(sc, r, N, oops, done, rd, links, extra):
    sc.pic("bg_pitch", 0, 0, SW, SH, name="Pitch")
    hg.star_bar(sc, N, r, None if oops or r == 0 else r - 1)
    if done:
        sc.pic("ball", 900, 330, 120, 120, name="Ball in the net")
        sc.pic("keeper", 1200, 300, 230, 276, name="Goalkeeper")
        g = sc.shp("RECTANGLE", 560, 640, 800, 220, name="Champion", text="CHAMPION!", fs=80, color="E5536F", bold=True, rtl=False)
        sc.on_load([fx("zoomin", g, 200, dur=500)]); return
    for j, o in enumerate(rd["options"]):
        card(sc, o, 470 + (2 - j) * 340, 230, 300, 160, links[j], f"Answer {j + 1} {o}", line="E5536F")
    sc.pic("keeper_hold" if oops else "keeper", 845, 390, 230, 276, name="Goalkeeper")
    ball = sc.pic("ball", 900, 880, 120, 120, name="Ball")
    if r > 0 and not oops:                         # the goal just scored
        gl = sc.shp("RECTANGLE", 1300, 700, 560, 180, name="GOAL", text="GOAL!", fs=72, color="2FB57A", bold=True, rtl=False)
        sc.on_load([fx("zoomin", gl, 0, dur=300), fx("fadeout", gl, 1500, dur=500)])
    if oops: oops_bubble(sc, "Saved! Try again!", x=1400, y=640)

def build_scene(img, bg, label):
    def draw(sc, r, N, oops, done, rd, links, extra):
        sc.pic(bg, 0, 0, SW, SH, name="Background")
        hg.star_bar(sc, N, r, None if oops or r == 0 else r - 1)
        n = 5 if done else min(5, round(r * 5 / N))
        w, h = (420, 640) if img == "robot" else (330, 695)
        p = sc.pic(f"{img}{n}", 300 - w / 2 + 120, 1040 - h - (20 if img == "robot" else 0), w, h, name=f"{label} {n}")
        if done:
            sc.on_load([fx("move", p, 200, dx=0, dy=-0.04, dur=300, rev=True, repeat=3)])
            great(sc, "Beep beep! Done!" if img == "robot" else "Yummy! Done!", x=900, y=380); return
        if r > 0 and not oops: sc.on_load([fx("scale", p, 0, sx=106, sy=106, dur=200, rev=True)])
        side_cards(sc, rd, links)
        if oops: oops_bubble(sc, x=1340, y=870)
    return draw
draw_robot = build_scene("robot", "bg_lab", "Robot")
draw_ice = build_scene("ice", "bg_parlor", "Ice cream")

def draw_rocket(sc, r, N, oops, done, rd, links, extra):
    sc.pic("bg_launch", 0, 0, SW, SH, name="Sky")
    rk = sc.pic("rocket", 170, 380, 300, 560, name="Rocket")
    sc.shp("ROUNDED_RECTANGLE", 560, 420, 90, 500, fill=WHITE, line="9C93B0", lw=4, rect_r=0.4, name="Fuel tank")
    fill = 1 if done else r / N
    if fill: sc.shp("ROUNDED_RECTANGLE", 572, 908 - 476 * fill, 66, 476 * fill, fill="FFB347", rect_r=0.4, name="Fuel")
    sc.shp("RECTANGLE", 520, 930, 170, 60, name="Fuel label", text="FUEL", fs=24, color=INK, bold=True, rtl=False)
    if done:
        fl = sc.pic("flame", 220, 900, 200, 260, name="Flame")
        sc.on_load([fx("move", rk, 500, dx=0, dy=-1.0, dur=2200), fx("move", fl, 500, dx=0, dy=-1.0, dur=2200)])
        great(sc, "3, 2, 1... Blast off!", x=900, y=380); return
    side_cards(sc, rd, links)
    if oops: oops_bubble(sc, x=1340, y=870)

def draw_doors(sc, r, N, oops, done, rd, links, extra):
    sc.pic("bg_castle", 0, 0, SW, SH, name="Castle")
    sc.shp("ROUNDED_RECTANGLE", 40, 40, 330, 80, fill=WHITE, line="B8A1FF", lw=3, rect_r=0.4, name="Room", text=f"Room {min(r + 1, N)} of {N}", fs=28, color="6741D9", bold=True, rtl=False)
    if done:
        c = sc.pic("chest", 740, 420, 440, 360, name="Treasure")
        sc.on_load([fx("zoomin", c, 100, dur=600)])
        great(sc, "You found the treasure!", x=1280, y=300); return
    for j, o in enumerate(rd["options"]):
        x = 1440 - j * 480
        sc.pic("door", x - 160, 340, 320, 500, name=f"Door {j + 1}", link=links[j])
        card(sc, o, x - 145, 545, 290, 150, links[j], f"Answer {j + 1} {o}", fill="FFF8E6", line="A86E42")
    if oops: oops_bubble(sc, "Locked! Try again!", x=60, y=850)

def draw_mystery(sc, r, N, oops, done, rd, links, extra):
    pic, name = MYSTERY[extra % len(MYSTERY)]
    sc.pic("bg_lab", 0, 0, SW, SH, name="Background")
    X, Y, W, H = 80, 220, 800, 600
    sc.pic(pic, X, Y, W, H, name="Mystery picture")
    opened = N if done else r
    cols = ["FFB3C6", "B5E8FF", "C8F0C8", "FFD8A8", "D0BFFF", "FFE066"]
    for k in range(6):
        if k < opened * 6 // N: continue
        t = sc.shp("ROUNDED_RECTANGLE", X + (k % 3) * W / 3, Y + (k // 3) * H / 2, W / 3, H / 2, fill=cols[k], line=WHITE, lw=6, rect_r=0.08, name=f"Tile {k + 1}", text="?", fs=72, color=WHITE, bold=True, rtl=False)
    if done:
        great(sc, name, x=1000, y=380); return
    side_cards(sc, rd, links)
    if oops: oops_bubble(sc, x=1340, y=870)

# ---------- tug of war (class game) ----------
def tug(g, P, words):
    """Red and Blue: read the word, tap your team; the flag moves one step. 3 steps ahead wins (or the lead after 9 words)."""
    states, todo = {(0, 0)}, [(0, 0)]
    end = lambda r, b: abs(r - b) >= 3 or r + b >= 9
    while todo:
        r, b = todo.pop()
        if end(r, b): continue
        for n in ((r + 1, b), (r, b + 1)):
            if n not in states: states.add(n); todo.append(n)
    def key(r, b):
        if end(r, b): return g.key("draw" if r == b else "winRed" if r > b else "winBlue")
        return g.key("start" if (r, b) == (0, 0) else f"t{r}-{b}")
    made = set()
    for r, b in sorted(states, key=lambda s: (s != (0, 0), s)):
        k = key(r, b)
        if k in made: continue
        made.add(k)
        state = k[len(g.key("start")) + 1:] or "start"
        sc = g.scene(state, None if (r, b) == (0, 0) else "cheer" if end(r, b) else "whoosh")
        sc.pic("bg_garden", 0, 0, SW, SH, name="Background")
        d = max(-3, min(3, r - b))
        sc.pic("rope", 110, 760, 1700, 90, name="Rope")
        sc.shp("RECTANGLE", 955, 700, 10, 200, fill="9C93B0", name="Middle line")
        sc.pic("flag", 960 - 45 - d * 190, 660, 90, 160, name="Flag")
        sc.pic("puller_red", 20, 600, 240, 274, name="Red team")
        sc.pic("puller_blue", 1660, 600, 240, 274, name="Blue team")
        sc.shp("RECTANGLE", 40, 900, 400, 70, name="Red score", text=f"Red: {r}", fs=32, color="E5536F", bold=True, rtl=False)
        sc.shp("RECTANGLE", 1480, 900, 400, 70, name="Blue score", text=f"Blue: {b}", fs=32, color="3FA7C9", bold=True, rtl=False)
        if end(r, b):
            text, col = ("It's a draw!", "8A6CF0") if r == b else ("Red team wins!", "E5536F") if r > b else ("Blue team wins!", "3FA7C9")
            ban = sc.shp("ROUNDED_RECTANGLE", 560, 220, 800, 260, fill=col, line=WHITE, lw=6, rect_r=0.3, name=text, text=text, fs=54, color=WHITE, bold=True, rtl=False)
            sc.on_load([fx("scale", ban, 300, sx=110, sy=110, dur=300, rev=True, repeat=2)])
            continue
        hg.banner(sc, "Tug of War!  Read the word, then tap your team.", y=20, h=100, w=1300)
        w = words[(r + b) % len(words)]
        sc.shp("ROUNDED_RECTANGLE", 610, 160, 700, 330, fill=WHITE, line="B8A1FF", lw=6, rect_r=0.15, name="Word card")
        sc.shp("RECTANGLE", 640, 170, 640, 310, name=f"Word {w}", text=w, fs=hg.ar_fs(w, 600, 300, 110), color=INK, bold=True)
        for team, x, col, n in (("Red", 60, "E5536F", (r + 1, b)), ("Blue", 1560, "3FA7C9", (r, b + 1))):
            sc.shp("ROUNDED_RECTANGLE", x, 280, 300, 130, fill=col, line=WHITE, lw=5, rect_r=0.3, name=f"{team} point", text=f"{team} ✓", fs=40, color=WHITE, bold=True, rtl=False, link=key(*n))
    g.done()

def howto(sc, kind):
    title, lines, pic = HOWTO[kind]
    hg.HOWTO[kind] = (title, lines, None)
    hg.howto(sc, kind)
    w, h = __import__("PIL.Image", fromlist=["Image"]).open(kit.find(kit.IMG_DIRS, pic + ".png", pic + ".jpeg")).size
    s = min(330 / w, 300 / h)
    sc.pic(pic, 1470 - w * s / 2, 480 - h * s / 2, w * s, h * s, name="Picture")

# ---------- decks ----------
def deck(name, sample, sub, plan):
    P = hg.Picker(sum(map(ord, name))); d = hg.Deck(title=name)
    seen, final = set(), []
    for kind, args in plan:
        if kind not in seen: final.append(("howto", kind)); seen.add(kind)
        final.append((kind, args))
    keys = [f"s{k}" for k in range(len(final))] + ["end"]
    t = d.new("title", fade=True)
    t.pic("bg_title", 0, 0, SW, SH, name="Background")
    t.shp("ROUNDED_RECTANGLE", 360, 170, 1200, 560, fill=WHITE, alpha=85, line="E6DDF5", lw=4, rect_r=0.1, name="Card")
    t.shp("RECTANGLE", 400, 210, 1120, 150, name="Title", text=name, fs=hg.en_fs(name, 1100, 72), color="8A6CF0", bold=True, rtl=False)
    t.shp("RECTANGLE", 400, 370, 1120, 220, name="Sample", text=sample, fs=hg.ar_fs(sample, 1080, 220, 76), color=INK, bold=True)
    t.shp("RECTANGLE", 400, 590, 1120, 100, name="Subtitle", text=sub, fs=hg.en_fs(sub, 1100, 40), color=INK, bold=True, rtl=False)
    t.shp("ROUNDED_RECTANGLE", 760, 790, 400, 140, fill="2FB57A", line=WHITE, lw=5, rect_r=0.3, name="Start", text="Start ▶", fs=40, color=WHITE, bold=True, rtl=False, link=keys[0])
    for k, (kind, args) in enumerate(final):
        g = hg.Game(d, keys[k], keys[k + 1])
        if kind == "howto": sc = d.new(keys[k], fade=True); howto(sc, args); hg.next_button(sc, keys[k + 1])
        elif kind == "tug": tug(g, P, args)
        else:
            rounds, extra = args
            themed(g, P, kind, rounds, extra)
    e = d.new("end", fade=True)
    e.pic("bg_title", 0, 0, SW, SH, name="Background")
    e.shp("ROUNDED_RECTANGLE", 460, 200, 1000, 500, fill=WHITE, alpha=85, line="E6DDF5", lw=4, rect_r=0.1, name="Card")
    e.shp("RECTANGLE", 500, 250, 920, 160, name="Well done", text="Well done!", fs=hg.en_fs("Well done!", 900, 90), color="8A6CF0", bold=True, rtl=False)
    for k in range(5): e.shp("STAR_5", 560 + k * 170, 450, 130, 130, fill="FFD43B", line="F2A93B", lw=3, name=f"Star {k + 1}")
    e.shp("ROUNDED_RECTANGLE", 710, 780, 500, 140, fill="1971C2", line=WHITE, lw=5, rect_r=0.3, name="Play again", text="↺  Play again", fs=30, color=WHITE, bold=True, rtl=False, link=keys[0])
    e.on_load([snd("cheer", 300)])
    path = os.path.join(OUT, name.replace(" ", "-") + ".pptx")
    os.makedirs(OUT, exist_ok=True); d.save(path)
    print(name, len(d.slides), "slides,", sum(1 for s in d.slides.values() if not s.hidden_slide), "in the normal order")

def plan_for(name, round_maker, n_games=36):
    P = hg.Picker(sum(map(ord, name)) + 7)
    R = Rounds(P)
    plan = []
    for gi in range(n_games):
        theme = THEMES[gi % len(THEMES)]
        n = 6 if theme == "mystery" else 5
        plan.append((theme, ([round_maker(R, gi, k) for k in range(n)], gi // len(THEMES))))
        if gi in (n_games // 2, n_games - 1): plan.append(("tug", None))
    return P, plan

def letters_for(gi, k, skip=""):
    ls = [l for l in hg.ORDER if l not in skip]
    return ls[(gi * 3 + k) % len(ls)]

def sukun_round(R, gi, k):
    l = letters_for(gi, k)
    m = (gi + k) % 5
    if m == 0: return R.closed(l)
    if m == 1: return R.join_sukun(l)
    if m == 2: return R.word_with(SUKUN_WORDS, SUKUN, PLAIN_WORDS)
    if m == 3: return R.which(SUKUN_WORDS, PLAIN_WORDS, "sukun")
    return R.closed(l)
def shaddah_round(R, gi, k):
    l = letters_for(gi, k, skip="أ")
    m = (gi + k) % 5
    if m == 0: return R.double(l)
    if m == 1: return R.twins(l)
    if m == 2: return R.word_with(SHADDAH_WORDS, SHADDA, PLAIN_WORDS + SUKUN_WORDS)
    if m == 3: return R.which(SHADDAH_WORDS, PLAIN_WORDS + SUKUN_WORDS, "shaddah")
    return R.double(l)
def review_round(R, gi, k):
    l = letters_for(gi, k, skip="أ")
    m = (gi * 2 + k) % 9
    return [lambda: R.mark_find(l, "harakat"), lambda: R.mark_find(l, "tanween"), lambda: R.mark_find(l, "madd"), lambda: R.mark_find(l, "sukun"),
            lambda: R.mark_find(l, "shaddah"), lambda: R.name_it(l), lambda: R.lam(), lambda: R.word_with(SHADDAH_WORDS, SHADDA, PLAIN_WORDS), lambda: R.name_it(l)][m]()

if __name__ == "__main__":
    for name, maker, sample, sub, words in [
        ("Sukun Games", sukun_round, "أَبۡ  قُلۡ  مِنۡ  شَمۡسٌ", "Hop, kick, build and launch with the sukun!", SUKUN_WORDS),
        ("Shaddah Games", shaddah_round, "رَبَّ  ثُمَّ  سُكَّرٌ", "Hop, kick, build and launch with the shaddah!", SHADDAH_WORDS),
        ("Review Games", review_round, "بَ  بٌ  بَا  أَبۡ  بَّ", "Everything so far: harakat, tanween, madd, sukun, shaddah", None),
    ]:
        P, plan = plan_for(name, maker)
        pool = words or (SUKUN_WORDS + SHADDAH_WORDS + PLAIN_WORDS + SHAMS + QAMAR)
        plan = [(k, a if k != "tug" else P.shuffle(pool)[:12]) for k, a in plan]
        deck(name, sample, sub, plan)
