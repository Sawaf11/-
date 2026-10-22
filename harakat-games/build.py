"""Harakat games: 4 interactive PowerPoint decks (fathah, kasrah, dammah, all three mixed), English instructions.
Every game works in the slide show by tapping, with slide links only (no triggers, no macros), so it runs in
PowerPoint on Windows, Mac, iPad, phones and the web, and in Keynote / Google Slides: each tap jumps to the slide that
shows the result (a popped balloon and a star, "Try again!", a loaded wagon ...). Those result slides are hidden in the
normal order; the sound of a result is the sound of its slide transition.
  Balloon Pop, Feed the Monster, Catch the Fish, Pop-Up Letters, Mystery Gifts, Word Train, Team Race (class game).
Instructions in English; every sound, letter and word to find is written in Arabic.
Calm pastel backgrounds, soft flat pictures (art.js), sound effects (audio.py). A tap on the background does not move
on; the round green button does. Built with kit.py (python-pptx).
usage: python3 build.py <outdir> [preview]   (preview: hidden result slides stay visible, for LibreOffice pictures)"""
import os, sys, random, unicodedata
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kit
from kit import Deck, fx, snd

OUT = sys.argv[1] if len(sys.argv) > 1 else "."
if len(sys.argv) > 2: kit.PREVIEW = "all"
SW, SH = 1920, 1080
FATHA, KASRA, DAMMA = "َ", "ِ", "ُ"
VOW = {"a": FATHA, "i": KASRA, "u": DAMMA}
VSIGN = {"a": "ـَـ", "i": "ـِـ", "u": "ـُـ"}            # the vowel sign on a stretch line
INK, WHITE = "2E2640", "FFFFFF"
ORDER = ["أ", "ب", "ت", "ث", "ن", "ي", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ه", "و"]
ALIKE = ["حه", "سص", "دض", "تط", "ذظز", "أع", "كق", "ثس"]
alike = lambda a, b: a == b or any(a in g and b in g for g in ALIKE)
def syl(l, v):                                     # a letter with its vowel (alif with kasrah carries its hamza below)
    return ("إ" if l == "أ" and v == "i" else l) + VOW[v]
# words: only letters with fathah / kasrah / dammah, 3 letters, each with one of the deck's vowels
WORDS = {
    "a": ["كَتَبَ", "ذَهَبَ", "جَلَسَ", "فَتَحَ", "أَكَلَ", "أَخَذَ", "رَجَعَ", "رَكَعَ", "سَجَدَ", "دَخَلَ", "خَرَجَ", "شَكَرَ", "صَبَرَ", "زَرَعَ",
          "حَصَدَ", "طَلَبَ", "غَسَلَ", "مَسَحَ", "قَرَأَ", "رَسَمَ", "بَحَثَ", "جَمَعَ", "قَطَعَ", "ظَهَرَ", "طَبَخَ", "وَعَدَ", "نَزَلَ", "نَظَرَ", "حَمَلَ", "سَأَلَ"],
    "i": ["شَرِبَ", "لَعِبَ", "فَرِحَ", "سَمِعَ", "فَهِمَ", "تَعِبَ", "رَكِبَ", "حَزِنَ", "عَلِمَ", "ضَحِكَ", "عَمِلَ", "لَبِسَ", "حَفِظَ", "نَسِيَ", "رَضِيَ",
          "صَعِدَ", "حَمِدَ", "شَبِعَ", "عَطِشَ", "سَلِمَ", "رَحِمَ", "قَبِلَ", "غَضِبَ", "خَشِيَ", "وَثِقَ"],
    "u": ["كُتِبَ", "جُمِعَ", "حُمِلَ", "خُلِقَ", "رُزِقَ", "ذُكِرَ", "شُكِرَ", "فُتِحَ", "نُصِرَ", "حَسُنَ", "كَبُرَ", "كَرُمَ", "عَظُمَ", "سَهُلَ", "طَهُرَ",
          "نَظُفَ", "جَمُلَ", "صَغُرَ", "قَرُبَ", "بَعُدَ", "عُمَرُ", "غُلِبَ", "سُئِلَ"],
}
MARKS = {FATHA: "a", KASRA: "i", DAMMA: "u"}
def units(w):                                      # "كَتَبَ" -> [("ك","a"), ("ت","a"), ("ب","a")]
    out = []
    for ch in w:
        if ch in MARKS: out[-1] = (out[-1][0], MARKS[ch])
        else: out.append(("أ" if ch in "إأ" else "ئ" if ch == "ئ" else ch, None))
    return out
for v, ws in WORDS.items():                        # every word: letters with a vowel only, and the deck's vowel inside
    for w in ws:
        u = units(w)
        assert all(x[1] for x in u) and any(x[1] == v for x in u) and len(u) == 3, w

# ---------- common pieces ----------
def en_fs(text, width_px, max_pt):                 # Arial bold: about 0.6 em per character
    return max(14, min(max_pt, int(width_px * 0.5 * 0.92 / (0.6 * max(1, len(text))))))
def ar_fs(text, width_px, height_px, max_pt):      # Arabic in Arial: about 0.55 em per letter, harakat take no width
    n = max(1, sum(1 for ch in text if not unicodedata.combining(ch) and ch not in " ـ") + text.count("ـ") * 0.6 + text.count(" ") * 0.5)
    return max(20, min(max_pt, int(width_px * 0.5 * 0.85 / (0.6 * n)), int(height_px * 0.5 * 0.7)))
def banner(sc, text, ar=None, y=30, h=120, w=1100):
    """English instruction; the sound / word to find is written in Arabic in its own white badge."""
    x = (SW - w) / 2
    sc.shp("ROUNDED_RECTANGLE", x, y, w, h, fill=WHITE, alpha=88, line="E6DDF5", lw=3, rect_r=0.3, name="Prompt box")
    bw = 0 if ar is None else (200 if len(ar) <= 3 else 330)
    sc.shp("RECTANGLE", x + 20, y, w - 40 - bw, h, name="Prompt", text=text, fs=en_fs(text, w - 60 - bw, 36), color=INK, bold=True, rtl=False)
    if ar in VSIGN.values():                       # a vowel sign alone: drawn big on a dotted circle, the same in every program
        bx, by, bh = x + w - bw - 20, y - 15, h + 30
        sc.shp("ROUNDED_RECTANGLE", bx, by, bw, bh, fill="FFF6D6", line="F2A93B", lw=3, rect_r=0.3, name="Find the vowel")
        v = next(k for k, s in VSIGN.items() if s == ar)
        cx, cy = bx + bw / 2, by + bh / 2 + (-22 if v == "i" else 22)
        sc.shp("OVAL", cx - 30, cy - 30, 60, 60, line="9C93B0", lw=2.5, dash=True, name="Letter place")
        if v == "u": sc.shp("RECTANGLE", cx - 40, cy - 108, 80, 72, name="Dammah", text="و", fs=40, color="C2255C", bold=True)
        else: sc.shp("ROUNDED_RECTANGLE", cx - 30, cy + (-58 if v == "a" else 44), 60, 13, fill="C2255C", rect_r=0.5, rot=-22, name="Fathah" if v == "a" else "Kasrah")
    elif ar is not None:
        sc.shp("ROUNDED_RECTANGLE", x + w - bw - 20, y + 6, bw, h - 12, fill="FFF6D6", line="F2A93B", lw=3, rect_r=0.3, name=f"Find {ar}",
               text=ar, fs=ar_fs(ar, bw - 30, h - 12, 54), color="C2255C", bold=True)
def next_button(sc, target):
    sc.shp("OVAL", 1760, 910, 130, 130, fill="2FB57A", line=WHITE, lw=5, name="Next button", link=target)
    sc.shp("RIGHT_ARROW", 1795, 950, 62, 50, fill=WHITE, name="Next arrow", link=target)
def star_bar(sc, n, filled, new=None):
    """n star places, the first `filled` are gold; the star just won (index `new`) zooms in."""
    for k in range(n):
        x = 40 + k * 82
        if k < filled:
            s = sc.shp("STAR_5", x, 40, 70, 70, fill="FFD43B", line="F2A93B", lw=2, name=f"Star {k + 1}")
            if k == new: sc.on_load([fx("zoomin", s, 150, dur=450)])
        else: sc.shp("STAR_5", x, 40, 70, 70, line="C9BEDF", lw=3, name=f"Star place {k + 1}")
def bubble(sc, text, col, x=1340, y=150, w=460, h=200):
    b = sc.shp("CLOUD_CALLOUT", x, y, w, h, fill=WHITE, line=col, lw=4, name=text, text=text, fs=en_fs(text, w * 0.7, 32), color=col, bold=True, rtl=False)
    sc.on_load([fx("zoomin", b, 100, dur=400)])
def letter_shape(sc, text, x, y, w, h, fs, name, fill=None, line=None, color=INK, kind="OVAL", link=None):
    return sc.shp(kind, x, y, w, h, fill=fill, line=line, lw=4 if line else 0, rect_r=0.25, name=name, text=text, fs=fs, color=color, bold=True, link=link)

class Picker:
    """Deterministic choices for one deck."""
    def __init__(self, seed): self.r = random.Random(seed)
    def shuffle(self, a): a = list(a); self.r.shuffle(a); return a
    def others(self, target, n, avoid=()):
        pool = [l for l in self.shuffle(ORDER) if not alike(l, target) and l not in avoid]
        out = []
        for l in pool:
            if len(out) < n and not any(alike(l, o) for o in out): out.append(l)
        return out

class Game:
    """One game = a start slide (in the normal order) + hidden result slides reached by links."""
    def __init__(self, d, base, nxt): self.d, self.base, self.nxt, self.made = d, base, nxt, []
    def key(self, state): return self.base if state == "start" else f"{self.base}/{state}"
    def scene(self, state, sound=None):
        sc = self.d.new(self.key(state), adv=False, fade=state == "start", hidden_slide=state != "start" and not kit.PREVIEW, tr_snd=sound)
        self.made.append(sc); return sc
    def done(self):
        for sc in self.made: next_button(sc, self.nxt)

# ---------- tap-the-right-ones games: balloons, fish, pop-up letters ----------
PICK = {   # background, sound of a right tap, item drawing
    "balloons": ("bg_sky", "pop"), "fish": ("bg_sea", "splash"), "popup": ("bg_meadow", "bonk"), "cards": ("bg_stage", "ding")}
def pick_game(g, P, kind, prompt, ar, right, wrong):
    """Every subset of the right answers already found is a slide; a wrong tap shows "Try again!" on the same picture."""
    bg, hit = PICK[kind]
    items = P.shuffle([(t, True) for t in right] + [(t, False) for t in wrong])
    R = [k for k, (_, ok) in enumerate(items) if ok]
    look = [P.r.randrange(6) for _ in items]
    st = lambda found: "start" if not found else "f" + "".join(str(k) for k in sorted(found))
    subsets = [frozenset(c) for n in range(len(R) + 1) for c in __import__("itertools").combinations(R, n)]
    for found in subsets:
        for oops in ((False, True) if len(found) < len(R) else (False,)):
            state = st(found) + ("/oops" if oops else "")
            sound = "boing" if oops else (hit if found else None)
            sc = g.scene(state, sound)
            draw_pick(g, sc, kind, bg, prompt, ar, items, R, found, oops, look, st)
    g.done()

def item_box(kind, k):
    if kind == "balloons": x, y = 130 + k * 350, 300 + (60 if k % 2 else 0); return x, y, 260, 450
    if kind == "fish": x, y = [(180, 260), (1050, 300), (560, 520), (1350, 600), (250, 760)][k]; return x, y, 360, 223
    if kind == "cards": cx, cy = (1500, 960, 420)[k % 3], (380, 680)[k // 3]; return cx - 230, cy - 120, 460, 240   # right to left
    cx, cy = (520, 960, 1400)[k % 3], (560, 900)[k // 3]; return cx - 105, cy - 215, 210, 200

def draw_pick(g, sc, kind, bg, prompt, ar, items, R, found, oops, look, st):
    sc.pic(bg, 0, 0, SW, SH, name="Background")
    banner(sc, prompt, ar)
    finished = len(found) == len(R)
    star_bar(sc, len(R), len(found), None if oops or not found else len(found) - 1)
    auto = []
    for k, (t, ok) in enumerate(items):
        x, y, w, h = item_box(kind, k)
        if kind == "popup": sc.shp("OVAL", x + 105 - 150, y + 215 - 30, 300, 90, fill="7A5C45", name=f"Hole {k + 1}")
        if k in found:
            continue
        if finished: link = None
        elif ok: link = g.key(st(found | {k}))
        else: link = g.key(st(found) + "/oops")
        if kind == "balloons":
            a = sc.pic(f"balloon{(k + look[k]) % 6}", x, y, w, h, name=f"Balloon {k + 1}", link=link)
            b = letter_shape(sc, t, x + 20, y + 37, 220, 220, ar_fs(t, 190, 200, 74), f"Balloon letter {k + 1} {t}", link=link)
            move = dict(dx=0, dy=-0.025, dur=1500 + k * 170)
        elif kind == "fish":
            a = sc.pic(f"fish{(k + look[k]) % 5}", x, y, w, h, name=f"Fish {k + 1}", link=link)
            b = letter_shape(sc, t, x + 85, y + 37, 150, 150, ar_fs(t, 125, 140, 48), f"Fish letter {k + 1} {t}", fill=WHITE, line="E6DDF5", link=link)
            move = dict(dx=(0.09 if k % 2 else -0.09), dy=0, dur=2600 + k * 300)
        elif kind == "cards":
            a = None
            b = letter_shape(sc, t, x, y, w, h, ar_fs(t, w - 50, h - 30, 80), f"Card {k + 1} {t}", fill=WHITE, line="F2A93B", kind="ROUNDED_RECTANGLE", link=link)
            move = dict(dx=0, dy=-0.012, dur=1400 + k * 150)
        else:
            a = None
            b = letter_shape(sc, t, x, y, w, h, ar_fs(t, 180, 180, 70), f"Tile {k + 1} {t}", fill="FFF8E6", line="C9A27A", kind="ROUNDED_RECTANGLE", link=link)
            move = dict(dx=0, dy=-0.03, dur=850 + k * 120)
        for sp in (a, b):
            if sp: auto.append(fx("move", sp, k * 150, rev=True, repeat="inf", **move))
    sc.on_load(auto)
    bx, by = (1430, 160) if kind == "popup" else (720, 830) if kind == "cards" else (1250, 830)   # keep clear of the answers
    if oops: bubble(sc, "Try again!", "E5536F", x=bx, y=by, w=480, h=230)
    if finished: bubble(sc, "Great job!", "2FB57A", x=bx, y=by, w=480, h=230); sc.on_load([snd("cheer", 500)])

# ---------- feed the monster ----------
def monster(g, P, prompt, ar, right, wrong):
    items = P.shuffle([(right[0], True)] + [(t, False) for t in wrong])
    look = [P.r.randrange(5) for _ in items]
    for state, sound in (("start", None), ("oops", "boing"), ("yum", "munch")):
        sc = g.scene(state, sound)
        sc.pic("bg_room", 0, 0, SW, SH, name="Background")
        banner(sc, prompt, ar, w=1000)
        face = {"start": "monster_open", "oops": "monster_sad", "yum": "monster_chew"}[state]
        sc.pic(face, 120, 330, 600, 600, name="Monster")
        spots = [(1100, 280), (1500, 280), (1100, 640), (1500, 640)]
        for k, ((t, ok), (x, y)) in enumerate(zip(items, spots)):
            if ok and state == "yum": continue      # eaten
            link = None if state == "yum" else g.key("yum" if ok else "oops")
            sc.pic(f"food{(k + look[k]) % 5}", x, y, 300, 300, name=f"Food {k + 1}", link=link)
            letter_shape(sc, t, x + 70, y + 85, 160, 160, ar_fs(t, 135, 140, 50), f"Food letter {k + 1} {t}", fill=WHITE, line="E6DDF5", link=link)
        if state == "oops": bubble(sc, "No, thanks!", "E5536F", x=520, y=170, w=520, h=240)
        if state == "yum": bubble(sc, "Yummy!", "E5536F", x=520, y=170, w=520, h=240); sc.on_load([snd("cheer", 700)])
    g.done()

# ---------- mystery gifts ----------
def gifts(g, P, cards):
    cards = cards[:8]
    spots = [((330, 750, 1170, 1590)[k % 4], (440, 820)[k // 4]) for k in range(8)]
    sc = g.scene("start")
    sc.pic("bg_party", 0, 0, SW, SH, name="Background")
    banner(sc, "Open a gift and read it!")
    for k, (cx, cy) in enumerate(spots):
        link = g.key(f"gift{k + 1}")
        sc.pic(f"giftbody{k % 4}", cx - 180, cy - 75, 360, 210, name=f"Gift box {k + 1}", link=link)
        sc.pic(f"giftlid{k % 4}", cx - 195, cy - 175, 390, 195, name=f"Gift lid {k + 1}", link=link)
    for k, t in enumerate(cards):                  # one slide per open gift, with a way back to the gifts
        sc = g.scene(f"gift{k + 1}", "tada")
        sc.pic("bg_party", 0, 0, SW, SH, name="Background")
        banner(sc, "Read it!")
        sc.pic(f"giftbody{k % 4}", 690, 700, 540, 315, name="Open gift box")
        lid = sc.pic(f"giftlid{k % 4}", 1250, 640, 390, 195, name="Gift lid", rot=25)
        card = letter_shape(sc, t, 560, 220, 800, 440, ar_fs(t, 740, 440, 150), f"Card {t}", fill=WHITE, line="B8A1FF", kind="ROUNDED_RECTANGLE")
        sc.on_load([fx("zoomin", card, 100, dur=500)])
        sc.shp("ROUNDED_RECTANGLE", 60, 900, 420, 120, fill="8A6CF0", line=WHITE, lw=5, rect_r=0.3, name="Back to the gifts",
               text="◀  Back to the gifts", fs=en_fs("◀  Back to the gifts", 400, 26), color=WHITE, bold=True, rtl=False, link=g.key("start"))
    g.done()

# ---------- word train ----------
def train(g, P, word):
    u = units(word); n = len(u)
    order = P.shuffle(range(n))                    # where each letter card stands
    for state in [f"load{k}" for k in range(n + 1)] + [f"load{k}/oops" for k in range(n - 1)] + ["go"]:   # with one card left no tap is wrong
        loaded = n if state == "go" else int(state[4])
        oops = state.endswith("oops")
        sound = None if state == "load0" else "boing" if oops else "whistle" if state == "go" else "ding"
        sc = g.scene("start" if state == "load0" else state, sound)
        sc.pic("bg_rail", 0, 0, SW, SH, name="Background")
        banner(sc, "Build the word, then tap GO!", word, w=1200)
        moving = [sc.pic("engine", 60, 620, 420, 301, name="Engine")]
        for j in range(n):                         # the wagon next to the engine holds the LAST letter
            x = 500 + j * 290
            moving.append(sc.pic("wagon", x, 690, 280, 243, name=f"Wagon {j + 1}"))
        for i in range(loaded):
            x, y = 500 + (n - 1 - i) * 290 + 38, 690 + 56
            moving.append(letter_shape(sc, syl(*u[i]), x, y, 204, 104, 38, f"Wagon letter {i + 1}"))
        if state == "go":
            sc.on_load([fx("move", sp, 300, dx=-1.25, dy=0, dur=2600) for sp in moving])
            w = sc.shp("ROUNDED_RECTANGLE", 460, 300, 1000, 330, fill=WHITE, alpha=94, line="FFB347", lw=6, rect_r=0.2, name="Word", text=word, fs=ar_fs(word, 940, 330, 110), color=INK, bold=True)
            sc.on_load([fx("zoomin", w, 2900, dur=500), snd("cheer", 2900)])
        else:
            for pos, i in enumerate(order):
                if i < loaded: continue
                link = g.key(f"load{i + 1}" if i == loaded else f"load{loaded}/oops")
                if link == g.key("load0"): link = g.key("start")
                letter_shape(sc, syl(*u[i]), 520 + pos * 260, 280, 190, 190, 62, f"Card {syl(*u[i])}", fill=WHITE, line="FFB347", kind="ROUNDED_RECTANGLE", link=link)
            if loaded == n:
                sc.shp("ROUNDED_RECTANGLE", 1460, 300, 230, 140, fill="2FB57A", line=WHITE, lw=5, rect_r=0.3, name="GO button", text="GO!", fs=48, color=WHITE, bold=True, rtl=False, link=g.key("go"))
            if oops: bubble(sc, "Try again!", "E5536F", x=1300, y=420, w=480, h=230)
    g.done()

# ---------- team race (class game) ----------
STEPS = 5                                          # taps to the finish
def race(g, P, words):
    xs = [80 + i * 300 for i in range(STEPS)] + [1460]
    states = [(r, b) for r in range(STEPS) for b in range(STEPS)] + [("Red",), ("Blue",)]
    for s in states:
        win = s[0] if len(s) == 1 else None
        r, b = (STEPS, 0) if win == "Red" else (0, STEPS) if win == "Blue" else s
        key = "start" if s == (0, 0) else ("win" + win if win else f"r{r}b{b}")
        sc = g.scene(key, None if key == "start" else "cheer" if win else "vroom")
        sc.pic("bg_track", 0, 0, SW, SH, name="Background")
        banner(sc, "Team Race!  Read the word, then tap your team.", y=20, h=100, w=1300)
        for lane, y, col in (("Red", 560, "FFE3E8"), ("Blue", 800, "E0F4FF")):
            sc.shp("ROUNDED_RECTANGLE", 40, y, 1780, 200, fill=col, line="D9D2E9", lw=3, rect_r=0.2, name=f"{lane} lane")
        for rr in range(8):
            for c in range(2):
                sc.shp("RECTANGLE", 1690 + c * 30, 560 + rr * 55, 30, 55, fill=INK if (rr + c) % 2 == 0 else WHITE, name="Finish")
        if win:
            col = "E5536F" if win == "Red" else "3FA7C9"
            sc.pic(f"car_{win.lower()}", xs[-1], 600 if win == "Red" else 840, 230, 126, name=f"{win} car")
            ban = sc.shp("ROUNDED_RECTANGLE", 560, 200, 800, 260, fill=col, line=WHITE, lw=6, rect_r=0.3, name=f"{win} wins", text=f"{win} team wins!", fs=48, color=WHITE, bold=True, rtl=False)
            sc.on_load([fx("scale", ban, 300, sx=110, sy=110, dur=300, rev=True, repeat=2)])
            continue
        sc.pic("car_red", xs[r], 600, 230, 126, name="Red car"); sc.pic("car_blue", xs[b], 840, 230, 126, name="Blue car")
        w = words[(r + b) % len(words)]
        sc.shp("ROUNDED_RECTANGLE", 610, 150, 700, 360, fill=WHITE, line="B8A1FF", lw=6, rect_r=0.15, name="Word card")
        sc.shp("RECTANGLE", 640, 170, 640, 320, name=f"Word {w}", text=w, fs=ar_fs(w, 600, 320, 110), color=INK, bold=True)
        for team, by, col, nxt in (("Red", 180, "E5536F", (r + 1, b)), ("Blue", 330, "3FA7C9", (r, b + 1))):
            tgt = ("win" + team) if max(nxt) == STEPS else f"r{nxt[0]}b{nxt[1]}"
            sc.shp("ROUNDED_RECTANGLE", 60, by, 300, 120, fill=col, line=WHITE, lw=5, rect_r=0.3, name=f"{team} point",
                   text=f"{team} ✓", fs=40, color=WHITE, bold=True, rtl=False, link=g.key(tgt))
    g.done()

HOWTO = {
    "balloons": ("Balloon Pop", ["Look at the sound at the top.", "Tap the balloons that match.", "Pop! You get a star."], "balloon0"),
    "monster": ("Feed the Monster", ["The monster wants one sound.", "Tap the right food.", "Wrong food? “No, thanks!”"], "monster_open"),
    "fish": ("Catch the Fish", ["The fish are swimming.", "Tap the fish that match.", "Splash! You get a star."], "fish1"),
    "popup": ("Pop-Up Letters", ["Letters pop out of the holes.", "Tap the ones that match.", "Bonk! You get a star."], None),
    "gifts": ("Mystery Gifts", ["Tap a gift to open it.", "Read what is inside.", "Go back and open another!"], "giftlid0"),
    "train": ("Word Train", ["Tap the letters in order.", "They ride in the wagons.", "Tap GO and read the word!"], "engine"),
    "race": ("Team Race (class game)", ["Two teams: Red and Blue.", "Read, then tap your team.", "First car to finish wins!"], "car_red"),
}
def howto(sc, kind):
    title, lines, picture = HOWTO[kind]
    sc.pic("bg_title", 0, 0, SW, SH, name="Background")
    sc.shp("ROUNDED_RECTANGLE", 260, 120, 1400, 760, fill=WHITE, alpha=85, line="E6DDF5", lw=4, rect_r=0.08, name="Card")
    sc.shp("RECTANGLE", 300, 150, 1320, 140, name="Title", text=f"How to play: {title}", fs=en_fs(f"How to play: {title}", 1300, 54), color="8A6CF0", bold=True, rtl=False)
    fs = min(en_fs(f"{k + 1}.  {ln}", 1000, 34) for k, ln in enumerate(lines))   # one size for all lines
    for k, ln in enumerate(lines):
        sc.shp("RECTANGLE", 290, 330 + k * 150, 1000, 120, name=f"Line {k + 1}", text=f"{k + 1}.  {ln}", fs=fs, color=INK, bold=True, rtl=False)
    if picture: sc.pic(picture, 1310, 380, 320, 320 if not picture.startswith(("fish", "car", "engine", "giftlid")) else 200, name="Picture")

# ---------- decks ----------
DECKS = [("Fathah", "a"), ("Kasrah", "i"), ("Dammah", "u"), ("Harakat-Mix", None)]

def build(name, v):
    P = Picker(sum(map(ord, name)))
    d = Deck(title=f"{name} Games")
    plan = []                                      # (kind, data)
    kinds = ["balloons", "monster", "fish", "popup"]
    words = P.shuffle(WORDS[v] if v else WORDS["a"] + WORDS["i"] + WORDS["u"])
    vows = ["a", "i", "u"]
    wi = 0
    for idx, l in enumerate(ORDER):
        for r in range(2):
            plan.append((kinds[(2 * idx + r) % 4], (l, v or vows[(idx + r) % 3])))
        if idx % 4 == 3: plan.append(("gifts", ORDER[idx - 3: idx + 1]))
        if idx % 3 == 2 and wi < len(words): plan.append(("train", words[wi])); wi += 1
        if idx == 13: plan.append(("race", words[wi: wi + 10])); wi += 10
    plan.append(("race", words[-10:]))
    seen, final = set(), []
    for kind, data in plan:                        # a "how to play" slide before each game the first time
        if kind not in seen: final.append(("howto", kind)); seen.add(kind)
        final.append((kind, data))
    keys = [f"s{k}" for k in range(len(final))] + ["end"]
    # title
    t = d.new("title", fade=True)
    t.pic("bg_title", 0, 0, SW, SH, name="Background")
    t.shp("ROUNDED_RECTANGLE", 360, 170, 1200, 560, fill=WHITE, alpha=85, line="E6DDF5", lw=4, rect_r=0.1, name="Card")
    t.shp("RECTANGLE", 400, 210, 1120, 150, name="Title", text=f"{name.replace('-', ' ')} Games", fs=en_fs(name + " Games", 1100, 72), color="8A6CF0", bold=True, rtl=False)
    sample = "  ".join(syl(l, v or "aiu"[k % 3]) for k, l in enumerate(["ب", "ت", "ن", "م"]))
    t.shp("RECTANGLE", 400, 370, 1120, 220, name="Letters", text=sample, fs=76, color=INK, bold=True)
    t.shp("RECTANGLE", 400, 590, 1120, 100, name="Subtitle", text="Tap, pop, feed, catch and race!", fs=en_fs("Tap, pop, feed, catch and race!", 1100, 40), color=INK, bold=True, rtl=False)
    t.shp("ROUNDED_RECTANGLE", 760, 790, 400, 140, fill="2FB57A", line=WHITE, lw=5, rect_r=0.3, name="Start", text="Start ▶", fs=40, color=WHITE, bold=True, rtl=False, link=keys[0])
    for k, (kind, data) in enumerate(final):
        g = Game(d, keys[k], keys[k + 1])
        if kind == "howto":
            sc = d.new(keys[k], fade=True); howto(sc, data); next_button(sc, keys[k + 1])
        elif kind in ("balloons", "fish", "popup", "monster"):
            l, vv = data
            n_right = {"balloons": 2, "fish": 2, "popup": 2, "monster": 1}[kind]
            n_wrong = {"balloons": 3, "fish": 3, "popup": 4, "monster": 3}[kind]
            if v or kind == "monster":             # find the sound: the target letter with the vowel, other letters with the same vowel
                others = P.others(l, n_wrong)
                right, wrong = [syl(l, vv)] * n_right, [syl(o, vv) for o in others]
                prompt = {"balloons": "Pop every balloon with", "fish": "Catch every fish with", "popup": "Tap every letter with", "monster": "Feed me"}[kind]
                ar = syl(l, vv)
            else:                                  # mixed deck: find the vowel
                letters = [l] + P.others(l, 4)
                right = [syl(x, vv) for x in letters[:n_right]]
                wv = [x for x in "aiu" if x != vv]
                wrong = [syl(letters[(n_right + j) % len(letters)], wv[j % 2]) for j in range(n_wrong)]
                prompt = {"balloons": "Pop every balloon with", "fish": "Catch every fish with", "popup": "Tap every letter with"}[kind]
                ar = VSIGN[vv]
            if kind == "monster": monster(g, P, prompt, ar, right, wrong)
            else: pick_game(g, P, kind, prompt, ar, right, wrong)
        elif kind == "gifts":
            cards = []
            for j, l in enumerate(data):
                vv1, vv2 = (v, v) if v else ("aiu"[j % 3], "aiu"[(j + 1) % 3])
                o = P.others(l, 1)[0]
                cards += [syl(l, vv1), syl(l, vv2) + syl(o, vv1)]
            gifts(g, P, P.shuffle(cards))
        elif kind == "train": train(g, P, data)
        elif kind == "race": race(g, P, data)
    e = d.new("end", fade=True)
    e.pic("bg_title", 0, 0, SW, SH, name="Background")
    e.shp("ROUNDED_RECTANGLE", 460, 200, 1000, 500, fill=WHITE, alpha=85, line="E6DDF5", lw=4, rect_r=0.1, name="Card")
    e.shp("RECTANGLE", 500, 250, 920, 160, name="Well done", text="Well done!", fs=en_fs("Well done!", 900, 90), color="8A6CF0", bold=True, rtl=False)
    for k in range(5): e.shp("STAR_5", 560 + k * 170, 450, 130, 130, fill="FFD43B", line="F2A93B", lw=3, name=f"Star {k + 1}")
    e.shp("ROUNDED_RECTANGLE", 710, 780, 500, 140, fill="1971C2", line=WHITE, lw=5, rect_r=0.3, name="Play again", text="↺  Play again", fs=30, color=WHITE, bold=True, rtl=False, link=keys[0])
    e.on_load([snd("cheer", 300)])
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, f"{name}-Games.pptx")
    d.save(path)
    print(name, len(d.slides), "slides,", sum(1 for s in d.slides.values() if not s.hidden_slide), "in the normal order")
    return path

if __name__ == "__main__":
    for name, v in DECKS: build(name, v)
