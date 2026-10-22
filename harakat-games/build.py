"""Harakat games: 4 interactive PowerPoint decks (fathah, kasrah, dammah, all three mixed), English instructions.
Every slide is a game that works inside the slide show by tapping (triggers and links, no macros):
  Balloon Pop, Feed the Monster, Catch the Fish, Pop-Up Letters (tap the right ones; wrong ones wobble),
  Mystery Gifts (open and read), Word Train (put the letters in the wagons, then GO), Team Race (class game).
Calm pastel backgrounds, soft flat pictures (art.js), sound effects (audio.py). A tap on the background does not move
on; the round green button does. Built with kit.py (python-pptx + hand-written animation timelines).
usage: python3 build.py <outdir> [preview]   (preview: draw the starting state only, for LibreOffice pictures)"""
import os, sys, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kit
from kit import Deck, fx, snd, group

OUT = sys.argv[1] if len(sys.argv) > 1 else "."
if len(sys.argv) > 2: kit.PREVIEW = "start"
SW, SH = 1920, 1080
FATHA, KASRA, DAMMA = "َ", "ِ", "ُ"
VOW = {"a": FATHA, "i": KASRA, "u": DAMMA}
VNAME = {"a": "FATHAH", "i": "KASRAH", "u": "DAMMAH"}
INK, WHITE = "2E2640", "FFFFFF"
ORDER = ["أ", "ب", "ت", "ث", "ن", "ي", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ه", "و"]
CONS = {"أ": "", "ب": "b", "ت": "t", "ث": "th", "ج": "j", "ح": "ḥ", "خ": "kh", "د": "d", "ذ": "dh", "ر": "r", "ز": "z", "س": "s", "ش": "sh",
        "ص": "ṣ", "ض": "ḍ", "ط": "ṭ", "ظ": "ẓ", "ع": "'", "غ": "gh", "ف": "f", "ق": "q", "ك": "k", "ل": "l", "م": "m", "ن": "n", "ه": "h", "و": "w", "ي": "y"}
ALIKE = ["حه", "سص", "دض", "تط", "ذظز", "أع", "كق", "ثس"]
alike = lambda a, b: a == b or any(a in g and b in g for g in ALIKE)
def syl(l, v):                                     # a letter with its vowel (alif with kasrah carries its hamza below)
    return ("إ" if l == "أ" and v == "i" else l) + VOW[v]
def sound(l, v): return CONS[l] + v
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
def say_word(w):
    s = ""
    for k, (l, v) in enumerate(units(w)):
        s += ("" if (l == "أ" and k == 0) else "'" if l in "أئ" else CONS[l]) + v
    return s
for v, ws in WORDS.items():                        # every word: letters with a vowel only, and the deck's vowel inside
    for w in ws:
        u = units(w)
        assert all(x[1] for x in u) and any(x[1] == v for x in u) and len(u) == 3, w

# ---------- common pieces ----------
def en_fs(text, width_px, max_pt):                 # Arial bold: about 0.6 em per character
    return max(14, min(max_pt, int(width_px * 0.5 * 0.92 / (0.6 * max(1, len(text))))))
def banner(sc, text, y=30, h=120, w=1100):
    x = (SW - w) / 2
    sc.shp("ROUNDED_RECTANGLE", x, y, w, h, fill=WHITE, alpha=88, line="E6DDF5", lw=3, rect_r=0.3, name="Prompt box")
    sc.shp("RECTANGLE", x + 20, y, w - 40, h, name="Prompt", text=text, fs=en_fs(text, w - 60, 36), color=INK, bold=True, rtl=False)
def next_button(sc, target):
    sc.shp("OVAL", 1760, 910, 130, 130, fill="2FB57A", line=WHITE, lw=5, name="Next button", link=target)
    sc.shp("RIGHT_ARROW", 1795, 950, 62, 50, fill=WHITE, name="Next arrow", link=target)
def star_bar(sc, n):
    stars = []
    for k in range(n):
        x = 40 + k * 82
        sc.shp("STAR_5", x, 40, 70, 70, line="C9BEDF", lw=3, name=f"Star place {k + 1}")
        stars.append(sc.shp("STAR_5", x, 40, 70, 70, fill="FFD43B", line="F2A93B", lw=2, name=f"Star {k + 1}", hidden=True))
    return stars
def wobble(sp, t=0): return fx("spin", sp, t, deg=9, dur=90, rev=True, repeat=3, sound="boing")
def letter_shape(sc, text, x, y, w, h, fs, name, parent=None, hidden=False, fill=None, line=None, color=INK, kind="OVAL"):
    return sc.shp(kind, x, y, w, h, fill=fill, line=line, lw=4 if line else 0, rect_r=0.25, name=name, text=text, fs=fs, color=color, bold=True, parent=parent, hidden=hidden)

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

# ---------- the games ----------
def balloons(sc, P, prompt, right, wrong):
    """right: 2 syllables, wrong: 3 syllables. Tap the right balloons: they pop; wrong ones wobble."""
    sc.pic("bg_sky", 0, 0, SW, SH, name="Background")
    banner(sc, prompt)
    stars = star_bar(sc, len(right))
    items = P.shuffle([(t, True) for t in right] + [(t, False) for t in wrong])
    auto = []
    for k, (t, ok) in enumerate(items):
        x, y = 130 + k * 350, 300 + (60 if k % 2 else 0)
        g, gid = group(sc, f"Balloon {k + 1} {t}")
        sc.pic(f"balloon{(k + P.r.randrange(6)) % 6}", x, y, 260, 450, name=f"Balloon picture {k + 1}", parent=g.shapes)
        letter_shape(sc, t, x + 20, y + 37, 220, 220, 74, f"Balloon letter {k + 1}", parent=g.shapes)
        auto.append(fx("move", gid, k * 150, dx=0, dy=-0.025, dur=1500 + k * 170, rev=True, repeat="inf"))
        if ok:
            s = stars[sum(1 for q in items[:k] if q[1])]
            sc.on_click(gid, [fx("scale", gid, 0, sx=125, sy=125, dur=150, sound="pop"), fx("fadeout", gid, 150, dur=250), fx("zoomin", s, 150, dur=400)])
        else: sc.on_click(gid, [wobble(gid)])
    sc.on_load(auto)

def monster(sc, P, prompt, right, wrong):
    """One right food (right: 1 syllable), 3 wrong. The right food flies into the mouth."""
    sc.pic("bg_room", 0, 0, SW, SH, name="Background")
    banner(sc, prompt, w=1000)
    box = (120, 330, 600, 600)
    m_open = sc.pic("monster_open", *box, name="Monster (hungry)")
    m_chew = sc.pic("monster_chew", *box, name="Monster (chewing)", hidden=True)
    m_sad = sc.pic("monster_sad", *box, name="Monster (no thanks)", hidden=True)
    yum = sc.shp("CLOUD_CALLOUT", 560, 230, 380, 200, fill=WHITE, line="E6DDF5", lw=3, name="Yummy", text="Yummy!", fs=32, color="E5536F", bold=True, rtl=False, hidden=True)
    mouth = (120 + 300, 330 + 330)
    items = P.shuffle([(right[0], True)] + [(t, False) for t in wrong])
    spots = [(1100, 280), (1500, 280), (1100, 640), (1500, 640)]
    for k, ((t, ok), (x, y)) in enumerate(zip(items, spots)):
        g, gid = group(sc, f"Food {k + 1} {t}")
        sc.pic(f"food{(k + P.r.randrange(5)) % 5}", x, y, 300, 300, name=f"Food picture {k + 1}", parent=g.shapes)
        letter_shape(sc, t, x + 70, y + 85, 160, 160, 50, f"Food letter {k + 1}", parent=g.shapes, fill=WHITE, line="E6DDF5")
        if ok:
            dx, dy = (mouth[0] - (x + 150)) / SW, (mouth[1] - (y + 150)) / SH
            sc.on_click(gid, [fx("move", gid, 0, dx=dx, dy=dy, dur=700), fx("disappear", gid, 700), fx("disappear", m_open, 700), fx("appear", m_chew, 700),
                              snd("munch", 700), fx("zoomin", yum, 900, dur=400), fx("disappear", m_chew, 2000), fx("appear", m_open, 2000)])
        else:
            sc.on_click(gid, [wobble(gid), fx("disappear", m_open, 0), fx("appear", m_sad, 0), fx("disappear", m_sad, 1100), fx("appear", m_open, 1100)])

def fish(sc, P, prompt, right, wrong):
    sc.pic("bg_sea", 0, 0, SW, SH, name="Background")
    banner(sc, prompt)
    stars = star_bar(sc, len(right))
    items = P.shuffle([(t, True) for t in right] + [(t, False) for t in wrong])
    spots = [(180, 260), (1050, 300), (560, 520), (1350, 600), (250, 760)]
    auto = []
    for k, ((t, ok), (x, y)) in enumerate(zip(items, spots)):
        g, gid = group(sc, f"Fish {k + 1} {t}")
        sc.pic(f"fish{(k + P.r.randrange(5)) % 5}", x, y, 360, 223, name=f"Fish picture {k + 1}", parent=g.shapes)
        letter_shape(sc, t, x + 85, y + 37, 150, 150, 48, f"Fish letter {k + 1}", parent=g.shapes, fill=WHITE, line="E6DDF5")
        auto.append(fx("move", gid, k * 200, dx=(0.09 if k % 2 else -0.09), dy=0, dur=2600 + k * 300, rev=True, repeat="inf"))
        if ok:
            s = stars[sum(1 for q in items[:k] if q[1])]
            sc.on_click(gid, [fx("scale", gid, 0, sx=120, sy=120, dur=150, sound="splash"), fx("fadeout", gid, 150, dur=300), fx("zoomin", s, 150, dur=400)])
        else: sc.on_click(gid, [wobble(gid)])
    sc.on_load(auto)

def popup(sc, P, prompt, right, wrong):
    """3 right, 3 wrong letter tiles bobbing out of holes."""
    sc.pic("bg_meadow", 0, 0, SW, SH, name="Background")
    banner(sc, prompt)
    stars = star_bar(sc, len(right))
    items = P.shuffle([(t, True) for t in right] + [(t, False) for t in wrong])
    auto = []
    for k, (t, ok) in enumerate(items):
        cx, cy = (520, 960, 1400)[k % 3], (560, 900)[k // 3]
        sc.shp("OVAL", cx - 150, cy - 30, 300, 90, fill="7A5C45", name=f"Hole {k + 1}")
        tile = letter_shape(sc, t, cx - 105, cy - 215, 210, 200, 70, f"Tile {k + 1} {t}", fill="FFF8E6", line="C9A27A", kind="ROUNDED_RECTANGLE")
        auto.append(fx("move", tile, k * 230, dx=0, dy=-0.03, dur=850 + k * 120, rev=True, repeat="inf"))
        if ok:
            s = stars[sum(1 for q in items[:k] if q[1])]
            sc.on_click(tile, [fx("spin", tile, 0, deg=360, dur=400, sound="bonk"), fx("fadeout", tile, 300, dur=250), fx("zoomin", s, 300, dur=400)])
        else: sc.on_click(tile, [wobble(tile)])
    sc.on_load(auto)

def gifts(sc, P, prompt, cards):
    """8 gifts; under each a card to read."""
    sc.pic("bg_party", 0, 0, SW, SH, name="Background")
    banner(sc, prompt)
    for k, t in enumerate(cards[:8]):
        cx, cy = (330, 750, 1170, 1590)[k % 4], (440, 820)[k // 4]
        fs = 72 if len(t) <= 4 else 58
        letter_shape(sc, t, cx - 165, cy - 115, 330, 240, fs, f"Card {k + 1} {t}", fill=WHITE, line="B8A1FF", kind="ROUNDED_RECTANGLE")
        g, gid = group(sc, f"Gift {k + 1}")
        sc.pic(f"giftbody{k % 4}", cx - 180, cy - 75, 360, 210, name=f"Gift box {k + 1}", parent=g.shapes)
        sc.pic(f"giftlid{k % 4}", cx - 195, cy - 175, 390, 195, name=f"Gift lid {k + 1}", parent=g.shapes)
        sc.on_click(gid, [fx("move", gid, 0, dx=0, dy=-0.12, dur=400, sound="tada"), fx("fadeout", gid, 200, dur=300)])

def train(sc, P, word):
    sc.pic("bg_rail", 0, 0, SW, SH, name="Background")
    banner(sc, f"Build the word:  “{say_word(word)}”  then tap GO!")
    u = units(word); n = len(u)
    eng = sc.pic("engine", 60, 620, 420, 301, name="Engine")
    wagons, slots = [], []
    for j in range(n):                             # wagon next to the engine holds the LAST letter
        x = 500 + j * 290
        wagons.append(sc.pic("wagon", x, 690, 280, 243, name=f"Wagon {j + 1}"))
        slots.append((x + 38, 690 + 56))
    # the letter that goes in each wagon, hidden until its card is tapped
    in_wagon = {}
    for i, (l, v) in enumerate(u):
        x, y = slots[n - 1 - i]
        in_wagon[i] = letter_shape(sc, syl(l, v), x, y, 204, 104, 38, f"Wagon letter {i + 1}", hidden=True)
    order = P.shuffle(range(n))
    for pos, i in enumerate(order):
        l, v = u[i]
        card = letter_shape(sc, syl(l, v), 520 + pos * 260, 280, 190, 190, 62, f"Card {syl(l, v)}", fill=WHITE, line="FFB347", kind="ROUNDED_RECTANGLE")
        sc.on_click(card, [fx("fadeout", card, 0, dur=200, sound="ding"), fx("zoomin", in_wagon[i], 150, dur=350)])
    go = sc.shp("ROUNDED_RECTANGLE", 1460, 300, 230, 140, fill="2FB57A", line=WHITE, lw=5, rect_r=0.3, name="GO button", text="GO!", fs=48, color=WHITE, bold=True, rtl=False)
    done = sc.shp("ROUNDED_RECTANGLE", 460, 470, 1000, 300, fill=WHITE, alpha=94, line="FFB347", lw=6, rect_r=0.2, name="Word", text=word, fs=96, color=INK, bold=True, hidden=True)
    moving = [eng] + wagons + list(in_wagon.values())
    sc.on_click(go, [snd("whistle", 0)] + [fx("move", sp, 0, dx=-1.25, dy=0, dur=2600) for sp in moving if sp] + [fx("zoomin", done, 2600, dur=500), snd("cheer", 2600)])

def race(sc, P, words):
    """Class game. The teacher shows a word; the team that reads it gets a tap and its car moves one step."""
    sc.pic("bg_track", 0, 0, SW, SH, name="Background")
    banner(sc, "Team Race!  Read the word, then tap your team.", y=20, h=100, w=1300)
    for lane, y, col in (("Red", 560, "FFE3E8"), ("Blue", 800, "E0F4FF")):
        sc.shp("ROUNDED_RECTANGLE", 40, y, 1780, 200, fill=col, line="D9D2E9", lw=3, rect_r=0.2, name=f"{lane} lane")
    for r in range(8):                             # finish line
        for c in range(2):
            sc.shp("RECTANGLE", 1690 + c * 30, 560 + r * 55, 30, 55, fill=INK if (r + c) % 2 == 0 else WHITE, name="Finish")
    steps = 8
    xs = [80 + i * 200 for i in range(steps)]
    # word card with its "next word" buttons
    sc.shp("ROUNDED_RECTANGLE", 610, 150, 700, 360, fill=WHITE, line="B8A1FF", lw=6, rect_r=0.15, name="Word card")
    wtxt = [sc.shp("RECTANGLE", 640, 170, 640, 320, name=f"Word {j + 1}", text=w, fs=110, color=INK, bold=True, hidden=j > 0) for j, w in enumerate(words)]
    nb = [sc.shp("ROUNDED_RECTANGLE", 1340, 280, 380, 110, fill="8A6CF0", line=WHITE, lw=4, rect_r=0.3, name=f"Next word {j + 1}",
                 text="Next word ▶", fs=24, color=WHITE, bold=True, rtl=False, hidden=j > 0) for j in range(len(words) - 1)]
    for j in range(len(words) - 1):
        eff = [fx("disappear", wtxt[j], 0), fx("appear", wtxt[j + 1], 0, sound="ding"), fx("disappear", nb[j], 0)]
        if j + 1 < len(nb): eff.append(fx("appear", nb[j + 1], 0))
        sc.on_click(nb[j], eff)
    for team, y, col in (("Red", 600, "E5536F"), ("Blue", 840, "3FA7C9")):
        cars = [sc.pic(f"car_{team.lower()}", xs[i], y, 230, 126, name=f"{team} car {i + 1}", hidden=i > 0) for i in range(steps)]
        win = sc.shp("ROUNDED_RECTANGLE", 560, 300, 800, 220, fill=col, line=WHITE, lw=6, rect_r=0.3, name=f"{team} wins", text=f"{team} team wins!", fs=40, color=WHITE, bold=True, rtl=False, hidden=True)
        by = 180 if team == "Red" else 330
        btn = [sc.shp("ROUNDED_RECTANGLE", 60, by, 300, 120, fill=col, line=WHITE, lw=5, rect_r=0.3, name=f"{team} point {i + 1}",
                      text=f"{team} ✓", fs=40, color=WHITE, bold=True, rtl=False, hidden=i > 0) for i in range(steps - 1)]
        for i in range(steps - 1):
            eff = [fx("disappear", cars[i], 0), fx("appear", cars[i + 1], 0, sound="vroom"), fx("disappear", btn[i], 0)]
            if i + 1 < steps - 1: eff.append(fx("appear", btn[i + 1], 0))
            else: eff += [fx("zoomin", win, 200, dur=500), snd("cheer", 200)]
            sc.on_click(btn[i], eff)

HOWTO = {
    "balloons": ("Balloon Pop", ["Read the word at the top.", "Tap the balloons that match.", "Pop! You get a star."], "balloon0"),
    "monster": ("Feed the Monster", ["The monster wants one sound.", "Tap the right food.", "Wrong food? “No, thanks!”"], "monster_open"),
    "fish": ("Catch the Fish", ["The fish are swimming.", "Tap the fish that match.", "Splash! You get a star."], "fish1"),
    "popup": ("Pop-Up Letters", ["Letters pop out of the holes.", "Tap the ones that match.", "Bonk! You get a star."], None),
    "gifts": ("Mystery Gifts", ["Tap a gift to open it.", "Read what is inside.", "Open them all!"], "giftlid0"),
    "train": ("Word Train", ["Tap letters to fill the wagons.", "Read the word.", "Tap GO!"], "engine"),
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
    keys = ["title"] + [f"s{k}" for k in range(len(final))] + ["end"]
    for k in range(len(keys)):
        d.new(keys[k], adv=keys[k] in ("title", "end") or (0 < k < len(keys) - 1 and final[k - 1][0] == "howto"), fade=True)
    # title
    t = d.slides["title"]
    t.pic("bg_title", 0, 0, SW, SH, name="Background")
    t.shp("ROUNDED_RECTANGLE", 360, 170, 1200, 560, fill=WHITE, alpha=85, line="E6DDF5", lw=4, rect_r=0.1, name="Card")
    t.shp("RECTANGLE", 400, 210, 1120, 150, name="Title", text=f"{name.replace('-', ' ')} Games", fs=en_fs(name + " Games", 1100, 72), color="8A6CF0", bold=True, rtl=False)
    sample = "  ".join(syl(l, v or "aiu"[k % 3]) for k, l in enumerate(["ب", "ت", "ن", "م"]))
    t.shp("RECTANGLE", 400, 370, 1120, 220, name="Letters", text=sample, fs=76, color=INK, bold=True)
    t.shp("RECTANGLE", 400, 590, 1120, 100, name="Subtitle", text="Tap, pop, feed, catch and race!", fs=en_fs("Tap, pop, feed, catch and race!", 1100, 40), color=INK, bold=True, rtl=False)
    t.shp("ROUNDED_RECTANGLE", 760, 790, 400, 140, fill="2FB57A", line=WHITE, lw=5, rect_r=0.3, name="Start", text="Start ▶", fs=40, color=WHITE, bold=True, rtl=False, link=keys[1])
    for k, (kind, data) in enumerate(final):
        sc = d.slides[keys[k + 1]]
        if kind == "howto": howto(sc, data)
        elif kind in ("balloons", "fish", "popup", "monster"):
            l, vv = data
            n_right = {"balloons": 2, "fish": 2, "popup": 3, "monster": 1}[kind]
            n_wrong = {"balloons": 3, "fish": 3, "popup": 3, "monster": 3}[kind]
            if v or kind == "monster":             # find the sound: the target letter with the vowel, other letters with the same vowel
                others = P.others(l, n_wrong)
                right, wrong = [syl(l, vv)] * n_right, [syl(o, vv) for o in others]
                verb = {"balloons": "Pop", "fish": "Catch", "popup": "Tap every", "monster": "Feed me"}[kind]
                prompt = f"{verb}  “{sound(l, vv)}”" + ("!" if kind == "monster" else "")
            else:                                  # mixed deck: find the vowel
                letters = [l] + P.others(l, 4)
                right = [syl(x, vv) for x in letters[:n_right]]
                wv = [x for x in "aiu" if x != vv]
                wrong = [syl(letters[(n_right + j) % len(letters)], wv[j % 2]) for j in range(n_wrong)]
                verb = {"balloons": "Pop every balloon", "fish": "Catch every fish", "popup": "Tap every letter"}[kind]
                prompt = f"{verb} with {VNAME[vv]}  ({vv})"
            {"balloons": balloons, "fish": fish, "popup": popup, "monster": monster}[kind](sc, P, prompt, right, wrong)
        elif kind == "gifts":
            cards = []
            for j, l in enumerate(data):
                vv1, vv2 = (v, v) if v else ("aiu"[j % 3], "aiu"[(j + 1) % 3])
                o = P.others(l, 1)[0]
                cards += [syl(l, vv1), syl(l, vv2) + syl(o, vv1)]
            gifts(sc, P, "Open a gift and read it!", P.shuffle(cards))
        elif kind == "train": train(sc, P, data)
        elif kind == "race": race(sc, P, data)
        nxt = keys[k + 2]
        next_button(sc, nxt if nxt != "end" else "end")
    e = d.slides["end"]
    e.pic("bg_title", 0, 0, SW, SH, name="Background")
    e.shp("ROUNDED_RECTANGLE", 460, 200, 1000, 500, fill=WHITE, alpha=85, line="E6DDF5", lw=4, rect_r=0.1, name="Card")
    e.shp("RECTANGLE", 500, 250, 920, 160, name="Well done", text="Well done!", fs=en_fs("Well done!", 900, 90), color="8A6CF0", bold=True, rtl=False)
    for k in range(5): e.shp("STAR_5", 560 + k * 170, 450, 130, 130, fill="FFD43B", line="F2A93B", lw=3, name=f"Star {k + 1}")
    e.shp("ROUNDED_RECTANGLE", 710, 780, 500, 140, fill="1971C2", line=WHITE, lw=5, rect_r=0.3, name="Play again", text="↺  Play again", fs=30, color=WHITE, bold=True, rtl=False, link=keys[1])
    e.on_load([snd("cheer", 300)])
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, f"{name}-Games.pptx")
    d.save(path)
    print(name, len(keys), "slides")
    return path

if __name__ == "__main__":
    for name, v in DECKS: build(name, v)
