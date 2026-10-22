"""Madd games: 6 interactive PowerPoint decks, English instructions, everything to read in Arabic.
  Madd-Alif, Madd-Waw, Madd-Yaa, Madd-Mix (the natural madd), Quran-Small-Madd (dagger alif, small waw / yaa),
  Secondary-Madd (muttasil, munfasil, badal, lazim, 'arid, leen, 'iwad).
Every tap is a slide link (no triggers, no macros): it works in PowerPoint on every device, Keynote and Google Slides.
The games of the harakat decks (balloons, monster, fish, pop-up letters, gifts, word train, team race) come from
../harakat-games/build.py; new here: Short or Long? (caterpillars), Tap the short / long one, Which madd letter?,
How do we read it?, Which madd?, How many counts? - all built on one quiz engine (rounds, stars, "Try again!").
usage: python3 build.py <outdir> [preview]"""
import os, sys, itertools, importlib.util
HERE = os.path.dirname(os.path.abspath(__file__))
HG_DIR = os.path.join(HERE, "..", "harakat-games")
sys.path.insert(0, HG_DIR)
spec = importlib.util.spec_from_file_location("hg", os.path.join(HG_DIR, "build.py"))
hg = importlib.util.module_from_spec(spec); spec.loader.exec_module(hg)
from PIL import Image
kit, fx, snd = hg.kit, hg.fx, hg.snd
SW, SH, INK, WHITE = hg.SW, hg.SH, hg.INK, hg.WHITE
OUT = hg.OUT

# ---------- the natural madd ----------
TYPES = {"alif": ("a", "ا"), "waw": ("u", "و"), "yaa": ("i", "ي")}      # vowel before the madd letter, the madd letter
SIGN = {"alif": "ـَا", "waw": "ـُو", "yaa": "ـِي"}
def short(l, v): return hg.syl(l, v)                          # بَ
def S(l, t): return hg.syl(l, TYPES[t][0]) + TYPES[t][1]      # بَا  بُو  بِي
MADD_OF = {"َ": "ا", "ُ": "و", "ِ": "ي"}
def cards(word):
    """A word as reading cards: a letter with its vowel, and a madd letter joins the card before it (كِتَابٌ -> كِ تَا بٌ)."""
    out = []
    for ch in word:
        if hg.unicodedata.combining(ch):
            out[-1] += ch
        elif out and ch in "اوي" and out[-1][-1] in MADD_OF and MADD_OF[out[-1][-1]] == ch:
            out[-1] += ch
        else: out.append(ch)
    for c in out:
        assert hg.unicodedata.combining(c[-1]) or c[-1] in "اوي", (word, c)    # every letter is read: a vowel, or it is a madd letter
    return out
WORDS = {
    "alif": ["قَالَ", "نَامَ", "سَارَ", "زَارَ", "صَامَ", "قَامَ", "بَابٌ", "نَارٌ", "دَارٌ", "مَالٌ", "جَارٌ", "كَاتِبٌ", "عَالِمٌ", "صَابِرٌ", "شَاكِرٌ",
             "نَاصِرٌ", "قَادِرٌ", "جَالِسٌ", "سَامِعٌ", "حَامِدٌ", "كِتَابٌ", "طَعَامٌ", "شَرَابٌ", "سَحَابٌ", "جَمَالٌ", "غَزَالٌ", "حِصَانٌ", "لِسَانٌ", "ثِمَارٌ", "سَلَامٌ"],
    "waw": ["نُورٌ", "حُوتٌ", "تُوتٌ", "دُودٌ", "عُودٌ", "رُوحٌ", "كُوبٌ", "ثُومٌ", "صُوفٌ", "فُولٌ", "يَقُولُ", "يَقُومُ", "يَصُومُ", "يَزُورُ", "يَعُودُ",
            "يَطُوفُ", "يَدُورُ", "يَفُوزُ", "جُنُودٌ", "سُيُوفٌ", "قُلُوبٌ", "عُيُونٌ", "بُيُوتٌ", "دُرُوسٌ", "نُجُومٌ", "ثُلُوجٌ", "سُطُورٌ", "طُيُورٌ", "زُهُورٌ", "شُيُوخٌ"],
    "yaa": ["فِيلٌ", "تِينٌ", "دِينٌ", "طِينٌ", "عِيدٌ", "رِيحٌ", "رِيشٌ", "كِيسٌ", "قِيلَ", "كَبِيرٌ", "صَغِيرٌ", "جَمِيلٌ", "طَوِيلٌ", "قَرِيبٌ", "بَعِيدٌ",
            "سَعِيدٌ", "حَدِيدٌ", "جَدِيدٌ", "رَحِيمٌ", "كَرِيمٌ", "عَظِيمٌ", "حَلِيبٌ", "طَبِيبٌ", "وَزِيرٌ", "أَمِيرٌ", "نَشِيدٌ", "سَرِيرٌ", "شَعِيرٌ", "حَزِينٌ", "ثَمِينٌ"],
}
for t, ws in WORDS.items():                         # 2 or 3 cards, and the deck's madd inside
    for w in ws:
        c = cards(w)
        assert 2 <= len(c) <= 3 and any(x.endswith(TYPES[t][1]) and len(x) > 2 for x in c), w

# ---------- the small Quranic madd letters: [as written in the mushaf, as it is read, a wrong reading] ----------
READ = [
    ("هَٰذَا", "هَاذَا", "هَذَا"), ("ذَٰلِكَ", "ذَالِكَ", "ذَلِكَ"), ("ٱلرَّحۡمَٰنِ", "الرَّحۡمَانِ", "الرَّحۡمَنِ"), ("إِلَٰهَ", "إِلَاهَ", "إِلَهَ"),
    ("لَٰكِنۡ", "لَاكِنۡ", "لَكِنۡ"), ("ٱلۡعَٰلَمِينَ", "الۡعَالَمِينَ", "الۡعَلَمِينَ"), ("مَٰلِكِ", "مَالِكِ", "مَلِكِ"), ("سُبۡحَٰنَ", "سُبۡحَانَ", "سُبۡحَنَ"),
    ("إِبۡرَٰهِيمَ", "إِبۡرَاهِيمَ", "إِبۡرَهِيمَ"), ("ٱلۡكِتَٰبُ", "الۡكِتَابُ", "الۡكِتَبُ"), ("هَٰرُونَ", "هَارُونَ", "هَرُونَ"),
    ("ٱلصَّلَوٰةَ", "الصَّلَاةَ", "الصَّلَوَةَ"), ("ٱلزَّكَوٰةَ", "الزَّكَاةَ", "الزَّكَوَةَ"), ("ٱلۡحَيَوٰةُ", "الۡحَيَاةُ", "الۡحَيَوَةُ"),
    ("عَلَىٰ", "عَلَا", "عَلَيۡ"), ("مُوسَىٰ", "مُوسَا", "مُوسَيۡ"), ("ٱلۡهُدَىٰ", "الۡهُدَا", "الۡهُدَيۡ"),
    ("إِنَّهُۥ عَلِيمٌ", "إِنَّهُو عَلِيمٌ", "إِنَّهُ عَلِيمٌ"), ("بِهِۦ بَصِيرًا", "بِهِي بَصِيرًا", "بِهِ بَصِيرًا"),
    ("وَقَلۡبِهِۦ وَجَعَلَ", "وَقَلۡبِهِي وَجَعَلَ", "وَقَلۡبِهِ وَجَعَلَ"), ("إِنَّهُۥ لَا يُحِبُّ", "إِنَّهُو لَا يُحِبُّ", "إِنَّهُ لَا يُحِبُّ"),
    ("لَهُ ٱلۡمُلۡكُ", "لَهُلۡ مُلۡكُ", "لَهُو الۡمُلۡكُ"), ("وَلَهُ ٱلۡحَمۡدُ", "وَلَهُلۡ حَمۡدُ", "وَلَهُو الۡحَمۡدُ"),
]
SMALL_ALIF = [m for m, _, _ in READ if "ٰ" in m]
SILAH = [m for m, _, _ in READ if "ۥ" in m or "ۦ" in m]
NO_SMALL = ["قَالَ", "ٱلنَّاسِ", "يَقُولُ", "قِيلَ", "ٱلۡحَمۡدُ", "رَبِّ", "ٱلدِّينِ", "نَارًا", "لَهُ ٱلۡمُلۡكُ", "وَلَهُ ٱلۡحَمۡدُ"]

# ---------- the secondary madd (mushaf spelling, from the Secondary-Madd lesson) ----------
SEC = {
    "Muttasil": ["جَآءَ", "ٱلسَّمَآءِ", "سِيٓءَ بِهِمۡ", "أُو۟لَٰٓئِكَ", "شَآءَ", "ٱلۡمَآءِ", "سَوَآءٌ", "ٱلدُّعَآءِ", "يَشَآءُ", "ٱلنِّسَآءِ"],
    "Munfasil": ["إِنَّآ أَعۡطَيۡنَٰكَ", "قُوٓا۟ أَنفُسَكُمۡ", "فِيٓ أَنفُسِكُمۡ", "يَٰٓأَيُّهَا", "بِمَآ أُنزِلَ", "وَمَآ أَدۡرَىٰكَ", "إِنِّيٓ أَعۡلَمُ", "لَآ إِلَٰهَ"],
    "Badal": ["ءَامَنُوا۟", "إِيمَٰنًا", "أُوتُوا۟", "ءَادَمَ", "ءَاتُوا۟", "إِيلَٰفِ"],
    "Lazim": ["وَلَا ٱلضَّآلِّينَ", "ٱلۡحَآقَّةُ", "ٱلطَّآمَّةُ", "ٱلصَّآخَّةُ", "دَآبَّةٍ", "الٓمٓ", "قٓ", "صٓ"],
    "'Arid": ["ٱلرَّحِيمِ", "نَسۡتَعِينُ", "يَعۡلَمُونَ", "ٱلۡعَٰلَمِينَ", "ٱلدِّينِ", "تَعۡمَلُونَ"],
    "Leen": ["قُرَيۡشٍ", "خَوۡفٍ", "ٱلۡبَيۡتِ", "ٱلصَّيۡفِ"],
    "'Iwad": ["عَلِيمًا", "حَكِيمًا", "بَصِيرًا", "أَفۡوَاجًا"],
}
COUNTS = {"Muttasil": "4 or 5", "Munfasil": "4 or 5", "Badal": "2", "Lazim": "6", "'Arid": "2, 4 or 6", "Leen": "2, 4 or 6", "'Iwad": "2"}
STOP = {"'Arid", "Leen", "'Iwad"}                   # these happen when you stop on the word

# ---------- quiz engine: rounds, one card, buttons; a right tap -> next round, a wrong tap -> "Try again!" ----------
QUIZ = {   # background, instruction, buttons left to right (English) or right to left (Arabic)
    "shortlong": ("bg_garden", "Short or long?  Tap the caterpillar!", "ltr"),
    "whichmadd": ("bg_party", "Which madd letter comes next?", "rtl"),
    "readit": ("bg_mosque", "How do we read it?", "rtl"),
    "whichtype": ("bg_stage", "Which madd is it?", "ltr"),
    "counts": ("bg_stage", "How many counts?", "ltr"),
}
ASPECT = {}
def pic_fit(sc, img, cx, cy, maxw, maxh, **kw):    # a picture at its own shape, centred, as big as fits
    if img not in ASPECT:
        p = kit.find(kit.IMG_DIRS, img + ".png")
        with Image.open(p) as im: ASPECT[img] = im.width / im.height
    a = ASPECT[img]; w = min(maxw, maxh * a); h = w / a
    return sc.pic(img, cx - w / 2, cy - h / 2, w, h, **kw)
def quiz(g, P, kind, rounds):
    """rounds: [{show, options, right, solved, hint?}]"""
    bg, prompt, direction = QUIZ[kind]
    N = len(rounds)
    def key(r, oops=False):
        if r == N: return g.key("done")
        return g.key(f"q{r}/oops" if oops else "start" if r == 0 else f"q{r}")
    for r, oops in [(r, False) for r in range(N + 1)] + [(r, True) for r in range(N)]:
        state = key(r, oops)[len(g.key("start")) + 1:] or "start"
        sound = "boing" if oops else None if r == 0 else "tada" if r == N else "ding"
        sc = g.scene(state, sound)
        sc.pic(bg, 0, 0, SW, SH, name="Background")
        hg.banner(sc, prompt, w=1200)
        hg.star_bar(sc, N, r, None if oops or r == 0 else r - 1)
        if r > 0:                                  # the last answer, solved
            sv = rounds[r - 1]["solved"]
            sc.shp("ROUNDED_RECTANGLE", 1540, 170, 340, 110, fill="EBFBEE", line="2FB57A", lw=3, rect_r=0.3, name=f"Solved {sv}",
                   text=sv, fs=hg.ar_fs(sv, 250, 100, 44), color="2B8A3E", bold=True)
            sc.shp("OVAL", 1500, 190, 70, 70, fill="2FB57A", line=WHITE, lw=3, name="Check", text="✓", fs=28, color=WHITE, bold=True, rtl=False)
        rd = rounds[min(r, N - 1)]
        show = rd["solved"] if r == N else rd["show"]
        if kind == "whichmadd" and r < N:          # the letter and an empty place for its madd letter (right to left)
            sc.shp("ROUNDED_RECTANGLE", 560, 190, 800, 340, fill=WHITE, line="B8A1FF", lw=6, rect_r=0.15, name="Card")
            sc.shp("RECTANGLE", 980, 200, 340, 320, name=f"Letter {show}", text=show, fs=130, color=INK, bold=True)
            sc.shp("ROUNDED_RECTANGLE", 640, 250, 260, 220, line="9C93B0", lw=4, dash=True, rect_r=0.2, name="Madd letter place", text="?", fs=80, color="9C93B0", bold=True, rtl=False)
        else:
            sc.shp("ROUNDED_RECTANGLE", 560, 190, 800, 340, fill=WHITE, line="B8A1FF", lw=6, rect_r=0.15, name="Card")
            sc.shp("RECTANGLE", 590, 200, 740, 320, name=f"Read {show}", text=show, fs=hg.ar_fs(show, 700, 300, 130), color=INK, bold=True)
            if rd.get("hint"): sc.shp("RECTANGLE", 560, 535, 800, 50, name="Hint", text=rd["hint"], fs=24, color="6741D9", bold=True, rtl=False)
        if r == N:
            hg.bubble(sc, "Great job!", "2FB57A", x=60, y=160, w=440, h=220); sc.on_load([snd("cheer", 500)])
        else:
            opts = rd["options"]; n = len(opts)
            bw = min(560, (1640 - (n - 1) * 40) / n); total = n * bw + (n - 1) * 40; x0 = (SW - total) / 2
            for j, o in enumerate(opts):
                pos = j if direction == "ltr" else n - 1 - j
                x, y, h = x0 + pos * (bw + 40), 620, 270
                link = key(r + 1) if j == rd["right"] else key(r, True)
                col = ["FFE3E8", "E0F4FF", "EBFBEE", "FFF3BF"][j % 4]
                sc.shp("ROUNDED_RECTANGLE", x, y, bw, h, fill=col, line="9C93B0", lw=4, rect_r=0.18, name=f"Answer {j + 1} {o}", link=link)
                if kind == "shortlong":
                    pic_fit(sc, "caterpillar_short" if o == "Short" else "caterpillar_long", x + bw / 2, y + 95, bw - 60, 150, name=f"{o} caterpillar", link=link)
                    sc.shp("RECTANGLE", x, y + 180, bw, 80, name=f"{o} label", text=o, fs=40, color=INK, bold=True, rtl=False, link=link)
                elif direction == "rtl":
                    sc.shp("RECTANGLE", x + 15, y + 10, bw - 30, h - 20, name=f"Answer text {j + 1}", text=o, fs=hg.ar_fs(o, bw - 60, h - 40, 110), color=INK, bold=True, link=link)
                else:
                    sc.shp("RECTANGLE", x + 15, y + 10, bw - 30, h - 20, name=f"Answer text {j + 1}", text=o, fs=hg.en_fs(o, bw - 40, 48), color=INK, bold=True, rtl=False, link=link)
            if oops: hg.bubble(sc, "Try again!", "E5536F", x=60, y=160, w=440, h=220)
    g.done()

# ---------- word train with ready cards ----------
def train(g, P, word):
    u = cards(word); n = len(u)
    order = P.shuffle(range(n))
    for state in [f"load{k}" for k in range(n + 1)] + [f"load{k}/oops" for k in range(n - 1)] + ["go"]:
        loaded = n if state == "go" else int(state[4])
        oops = state.endswith("oops")
        sound = None if state == "load0" else "boing" if oops else "whistle" if state == "go" else "ding"
        sc = g.scene("start" if state == "load0" else state, sound)
        sc.pic("bg_rail", 0, 0, SW, SH, name="Background")
        hg.banner(sc, "Build the word, then tap GO!", word, w=1200)
        moving = [sc.pic("engine", 60, 620, 420, 301, name="Engine")]
        for j in range(n):                         # the wagon next to the engine holds the LAST card
            moving.append(sc.pic("wagon", 500 + j * 290, 690, 280, 243, name=f"Wagon {j + 1}"))
        for i in range(loaded):
            x = 500 + (n - 1 - i) * 290 + 38
            moving.append(hg.letter_shape(sc, u[i], x, 746, 204, 104, hg.ar_fs(u[i], 180, 100, 38), f"Wagon card {i + 1}"))
        if state == "go":
            sc.on_load([fx("move", sp, 300, dx=-1.25, dy=0, dur=2600) for sp in moving])
            w = sc.shp("ROUNDED_RECTANGLE", 460, 300, 1000, 330, fill=WHITE, alpha=94, line="FFB347", lw=6, rect_r=0.2, name="Word", text=word, fs=hg.ar_fs(word, 940, 330, 110), color=INK, bold=True)
            sc.on_load([fx("zoomin", w, 2900, dur=500), snd("cheer", 2900)])
        else:
            for pos, i in enumerate(order):
                if i < loaded: continue
                link = g.key(f"load{i + 1}" if i == loaded else f"load{loaded}/oops")
                hg.letter_shape(sc, u[i], 520 + pos * 260, 280, 210, 190, hg.ar_fs(u[i], 180, 170, 62), f"Card {u[i]}", fill=WHITE, line="FFB347", kind="ROUNDED_RECTANGLE", link=link)
            if loaded == n:
                sc.shp("ROUNDED_RECTANGLE", 1460, 300, 230, 140, fill="2FB57A", line=WHITE, lw=5, rect_r=0.3, name="GO button", text="GO!", fs=48, color=WHITE, bold=True, rtl=False, link=g.key("go"))
            if oops: hg.bubble(sc, "Try again!", "E5536F", x=1300, y=420, w=480, h=230)
    g.done()

hg.HOWTO.update({
    "cards": ("Find It!", ["Read every card.", "Tap the card the question asks for.", "Ding! You get a star."], None),
    "shortlong": ("Short or Long?", ["Read the sound on the card.", "Short sound: the short caterpillar.", "Long sound (madd): the long one!"], "caterpillar_long"),
    "whichmadd": ("Which Madd Letter?", ["Look at the vowel on the letter.", "Fathah: ا    Dammah: و    Kasrah: ي", "Tap the madd letter that fits."], None),
    "readit": ("How Do We Read It?", ["Read the word from the Mushaf.", "Look at the small red letters.", "Tap the right way to read it."], None),
    "whichtype": ("Which Madd?", ["Read the words from the Mushaf.", "Find the madd and its cause.", "Tap the name of the madd."], None),
    "counts": ("How Many Counts?", ["Read the words from the Mushaf.", "How long is the madd?", "Tap the number of counts."], None),
})
def howto(sc, kind):                               # as in the harakat decks, the picture keeps its own shape
    pic = hg.HOWTO[kind][2]
    hg.HOWTO[kind] = hg.HOWTO[kind][:2] + (None,)
    hg.howto(sc, kind)
    hg.HOWTO[kind] = hg.HOWTO[kind][:2] + (pic,)
    if pic: pic_fit(sc, pic, 1470, 480, 330, 300, name="Picture")

# ---------- decks ----------
def title_slide(d, name, sample, first, sub):
    t = d.new("title", fade=True)
    t.pic("bg_title", 0, 0, SW, SH, name="Background")
    t.shp("ROUNDED_RECTANGLE", 360, 170, 1200, 560, fill=WHITE, alpha=85, line="E6DDF5", lw=4, rect_r=0.1, name="Card")
    t.shp("RECTANGLE", 400, 210, 1120, 150, name="Title", text=name, fs=hg.en_fs(name, 1100, 72), color="8A6CF0", bold=True, rtl=False)
    t.shp("RECTANGLE", 400, 370, 1120, 220, name="Sample", text=sample, fs=hg.ar_fs(sample, 1080, 220, 76), color=INK, bold=True)
    t.shp("RECTANGLE", 400, 590, 1120, 100, name="Subtitle", text=sub, fs=hg.en_fs(sub, 1100, 40), color=INK, bold=True, rtl=False)
    t.shp("ROUNDED_RECTANGLE", 760, 790, 400, 140, fill="2FB57A", line=WHITE, lw=5, rect_r=0.3, name="Start", text="Start ▶", fs=40, color=WHITE, bold=True, rtl=False, link=first)
def end_slide(d, first):
    e = d.new("end", fade=True)
    e.pic("bg_title", 0, 0, SW, SH, name="Background")
    e.shp("ROUNDED_RECTANGLE", 460, 200, 1000, 500, fill=WHITE, alpha=85, line="E6DDF5", lw=4, rect_r=0.1, name="Card")
    e.shp("RECTANGLE", 500, 250, 920, 160, name="Well done", text="Well done!", fs=hg.en_fs("Well done!", 900, 90), color="8A6CF0", bold=True, rtl=False)
    for k in range(5): e.shp("STAR_5", 560 + k * 170, 450, 130, 130, fill="FFD43B", line="F2A93B", lw=3, name=f"Star {k + 1}")
    e.shp("ROUNDED_RECTANGLE", 710, 780, 500, 140, fill="1971C2", line=WHITE, lw=5, rect_r=0.3, name="Play again", text="↺  Play again", fs=30, color=WHITE, bold=True, rtl=False, link=first)
    e.on_load([snd("cheer", 300)])

def run(d, P, plan, name, sample, sub):
    """plan: [(kind, args)]; a how-to slide before the first game of each kind."""
    seen, final = set(), []
    for kind, args in plan:
        hk = "cards" if kind.startswith("cards") else kind
        if hk not in seen: final.append(("howto", hk)); seen.add(hk)
        final.append((kind, args))
    keys = [f"s{k}" for k in range(len(final))] + ["end"]
    title_slide(d, name, sample, keys[0], sub)
    for k, (kind, args) in enumerate(final):
        g = hg.Game(d, keys[k], keys[k + 1])
        if kind == "howto":
            sc = d.new(keys[k], fade=True); howto(sc, args); hg.next_button(sc, keys[k + 1])
        elif kind in ("balloons", "fish", "popup", "cards"):
            assert not set(args[2]) & set(args[3]) and len(set(args[3])) == len(args[3]), (kind, args)   # a wrong answer is never right
            hg.pick_game(g, P, kind, *args)
        elif kind == "monster":
            assert args[2][0] not in args[3] and len(set(args[3])) == 3, args
            hg.monster(g, P, *args)
        elif kind == "gifts": hg.gifts(g, P, args)
        elif kind == "train": train(g, P, args)
        elif kind == "race": hg.race(g, P, args)
        else:
            for rd in args: assert len(set(rd["options"])) == len(rd["options"]), rd
            quiz(g, P, kind, args)
    end_slide(d, keys[0])
    path = os.path.join(OUT, name.replace(" ", "-") + ".pptx")
    os.makedirs(OUT, exist_ok=True); d.save(path)
    print(name, len(d.slides), "slides,", sum(1 for s in d.slides.values() if not s.hidden_slide), "in the normal order")

def natural(name, types):
    """The natural madd: one type (alif / waw / yaa) or all three mixed."""
    P = hg.Picker(sum(map(ord, name)))
    d = hg.Deck(title=name)
    mix = len(types) > 1
    letters = [l for l in hg.ORDER if not (types == ["alif"] and l == "أ")]     # alif + madd alif is written آ: taught apart
    ok = lambda l, t: not (l == "أ" and t == "alif")
    def pick_others(l, n, t):
        return [o for o in P.others(l, n + 1) if ok(o, t)][:n]
    def tfor(idx, r, l):
        if not mix: return types[0]
        for k in range(3):
            t = types[(idx + r + k) % 3]
            if ok(l, t): return t
    kinds = ["balloons", "monster", "fish", "popup", "cards", "shortlong"] + (["whichmadd"] if mix else [])
    words = P.shuffle(sum((WORDS[t] for t in types), []))
    plan, wi = [], 0
    for idx, l in enumerate(letters):
        for r in range(2):
            kind = kinds[(2 * idx + r) % len(kinds)]
            t = tfor(idx, r, l); v = TYPES[t][0]
            other_t = [x for x in types if x != t and ok(l, x)] if mix else []
            Y, Z, W = pick_others(l, 3, t)
            other_v = [x for x in "aiu" if x != v]
            if kind == "balloons":
                wrong = [short(l, v), S(Y, t), S(Z, t)] if not mix else [short(l, v)] + [S(l, x) for x in other_t] + [S(Y, t)]
                plan.append((kind, ("Pop every balloon with", S(l, t), [S(l, t)] * 2, wrong[:3])))
            elif kind == "fish":
                wrong = [short(l, v), S(Y, t), short(l, other_v[0])] if not mix else [short(l, v), S(Y, t)] + [S(l, x) for x in other_t][:1]
                plan.append((kind, ("Catch every fish with", S(l, t), [S(l, t)] * 2, wrong)))
            elif kind == "monster":
                wrong = [short(l, v), S(Y, t), (S(l, other_t[0]) if other_t else short(l, other_v[0]))]
                plan.append((kind, ("Feed me", S(l, t), [S(l, t)], wrong)))
            elif kind == "popup":
                right = [S(l, t), S(Y, t)]
                wrong = [short(l, v), short(Y, v), short(Z, v), short(W, v)]
                plan.append((kind, ("Tap every long sound (madd)", None if mix else SIGN[t], right, wrong)))
            elif kind == "cards":
                ts = [tfor(idx, j, l) for j in range(3)] if mix else [t] * 3
                if (idx + r) % 2 == 0:
                    plan.append(("cards", ("Tap the SHORT one!", None, [short(l, v)], [S(x, tt) if ok(x, tt) else S(x, t) for x, tt in zip((Y, Z, W), ts)])))
                else:
                    plan.append(("cards", ("Tap the LONG one (madd)!", None, [S(l, t)], [short(x, TYPES[tt][0]) for x, tt in zip((Y, Z, W), ts)])))
            elif kind == "shortlong":
                pool = [l] + pick_others(l, 5, t)
                rounds = []
                for j, x in enumerate(pool[:6]):
                    tt = t if not mix else types[(idx + j) % 3]
                    if not ok(x, tt): tt = "waw"
                    long_ = (j + idx) % 2 == 0 if j < 2 else P.r.random() < 0.5
                    s = S(x, tt) if long_ else short(x, TYPES[tt][0])
                    rounds.append(dict(show=s, options=["Short", "Long"], right=1 if long_ else 0, solved=s))
                plan.append(("shortlong", rounds))
            elif kind == "whichmadd":
                rounds = []
                for j, x in enumerate([l] + pick_others(l, 4, "waw")):
                    tt = types[(idx + j) % 3]
                    if not ok(x, tt): tt = "waw"
                    rounds.append(dict(show=short(x, TYPES[tt][0]), options=["ا", "و", "ي"], right=["alif", "waw", "yaa"].index(tt), solved=S(x, tt)))
                plan.append(("whichmadd", rounds))
        if idx % 4 == 3:
            cs = []
            for j, x in enumerate(letters[idx - 3: idx + 1]):
                t = tfor(idx, j, x); o = P.others(x, 1)[0]
                cs += [S(x, t), short(o, TYPES[t][0]) + S(x, t)]
            plan.append(("gifts", P.shuffle(cs)))
        if idx % 3 == 2 and wi < len(words): plan.append(("train", words[wi])); wi += 1
        if idx == 13: plan.append(("race", words[wi: wi + 10])); wi += 10
    plan.append(("race", words[-10:]))
    sample = "  ".join(S(l, types[k % len(types)]) for k, l in enumerate(["ب", "ت", "ن", "م"]))
    run(d, P, plan, name, sample, "Stretch the sound: pop, feed, catch and race!")

def small_madd():
    name = "Quran Small Madd Games"
    P = hg.Picker(sum(map(ord, name))); d = hg.Deck(title=name)
    plan = []
    items = P.shuffle(READ)
    def rounds_from(chunk):
        out = []
        for m, right, wrong in chunk:
            opts = P.shuffle([right, wrong]); out.append(dict(show=m, options=opts, right=opts.index(right), solved=right))
        return out
    chunks = [items[k:k + 5] for k in range(0, len(items), 5)]
    cards_games = []
    for j in range(10):                            # tap the words with a small alif / with a small waw or yaa
        if j % 3 < 2: cards_games.append(("cards", ("Tap every word with a SMALL ALIF", None, P.shuffle(SMALL_ALIF)[:2], P.shuffle(NO_SMALL)[:3])))
        else: cards_games.append(("cards", ("Tap every SMALL WAW or SMALL YAA", None, P.shuffle(SILAH)[:2], P.shuffle([m for m in NO_SMALL if " " in m] + P.shuffle(SMALL_ALIF)[:2])[:3])))
    gifts_cards = [P.shuffle([m for m, _, _ in READ])[:8] for _ in range(3)]
    race_words = P.shuffle([m for m, _, _ in READ])[:10]
    for k, ch in enumerate(chunks):
        plan.append(("readit", rounds_from(ch)))
        if k < len(cards_games): plan.append(cards_games[k])
        if k < len(gifts_cards): plan.append(("gifts", gifts_cards[k]))
    plan += cards_games[len(chunks):]
    for k in range(2 * len(chunks)):               # two more times round, new order, with the other games between
        plan.append(("readit", rounds_from(P.shuffle(READ)[:5])))
        if k % 2 == 1: plan.append(("gifts", P.shuffle([m for m, _, _ in READ])[:8]))
        if k == 4: plan.append(("race", race_words))
    plan.append(("race", P.shuffle([m for m, _, _ in READ])[:10]))
    run(d, P, plan, name, "هَٰذَا  ٱلصَّلَوٰةَ  إِنَّهُۥ", "The small red alif, the small waw and yaa")

def secondary():
    name = "Secondary Madd Games"
    P = hg.Picker(sum(map(ord, name))); d = hg.Deck(title=name)
    allw = [(w, t) for t, ws in SEC.items() for w in ws]
    names = list(SEC)
    def type_rounds(chunk):
        out = []
        for w, t in chunk:
            opts = P.shuffle([t] + P.shuffle([n for n in names if n != t])[:2])
            out.append(dict(show=w, options=opts, right=opts.index(t), solved=w, hint="(stop on this word)" if t in STOP else None))
        return out
    def count_rounds(chunk):
        opts = ["2", "4 or 5", "6", "2, 4 or 6"]
        return [dict(show=w, options=opts, right=opts.index(COUNTS[t]), solved=w, hint="(stop on this word)" if t in STOP else None) for w, t in chunk]
    plan = []
    order = P.shuffle(allw)
    k = 0
    for j in range(14):
        plan.append(("whichtype", type_rounds([order[(k + i) % len(order)] for i in range(5)]))); k += 5
        t = ["Muttasil", "Munfasil", "Badal", "Lazim"][j % 4]
        others = [w for w, tt in allw if tt != t and tt not in STOP]
        plan.append(("cards", (f"Tap every {t}", None, P.shuffle(SEC[t])[:2], P.shuffle(others)[:3])))
        plan.append(("counts", count_rounds(P.shuffle(allw)[:5])))
        if j % 3 == 2: plan.append(("gifts", P.shuffle([w for w, _ in allw])[:8]))
        if j == 6: plan.append(("race", P.shuffle([w for w, _ in allw])[:10]))
    plan.append(("race", P.shuffle([w for w, _ in allw])[:10]))
    run(d, P, plan, name, "جَآءَ  إِنَّآ أَعۡطَيۡنَٰكَ  ٱلضَّآلِّينَ", "Muttasil, Munfasil, Badal, Lazim, 'Arid, Leen, 'Iwad")

if __name__ == "__main__":
    natural("Madd Alif Games", ["alif"])
    natural("Madd Waw Games", ["waw"])
    natural("Madd Yaa Games", ["yaa"])
    natural("Madd Mix Games", ["alif", "waw", "yaa"])
    small_madd()
    secondary()
