"""FATHA GAME - 16 decks (one per letter family), real animals & kids. Same pedagogy/flow as the earlier fathah decks:
single letter -> letter at the beginning -> in the middle -> at the end -> quiz (tap an answer) -> hidden try-again slide -> level-ups -> finale."""
import sys, os, random
sys.path.insert(0, os.path.dirname(__file__))
import pptx_kit as K
from pptx_kit import fx, snd

FATHA = 'َ'
RING = ['E8604C', '3A8FD9', '2FB57A']
INK = '16213E'; GOLD = 'FFC93C'
U = 192            # px per inch of the earlier 10in-wide decks
PT = 4 / 3         # font scale (earlier decks: 10in wide; these: 13.33in wide)
ALPHA = list("أبتثجحخدذرزسشصضطظعغفقكلمنهوي")
SIM = {"ب": "ت", "ت": "ث", "ث": "ب", "ج": "ح", "ح": "خ", "خ": "ج", "د": "ذ", "ذ": "د", "ر": "ز", "ز": "ر", "س": "ش", "ش": "س", "ص": "ض", "ض": "ص", "ط": "ظ", "ظ": "ط", "ع": "غ", "غ": "ع", "ف": "ق", "ق": "ف", "ن": "ي", "ي": "ن"}
sim = lambda l: SIM.get(l, ALPHA[(ALPHA.index(l) + 1) % len(ALPHA)])
def partners(X):
    i = ALPHA.index(X)
    return ALPHA[:i] if i >= 7 else [l for l in ALPHA if l != X][:7]
full = lambda L: ''.join(l + FATHA for l in L)
CFG = {2: dict(d=1.9, gap=.7, zone=1.0, pw=3.0, ph=2.2, fs=90, rs=96, plus=.45, aw=.7, right=9.25),
       3: dict(d=1.4, gap=.55, zone=.85, pw=2.55, ph=2.0, fs=66, rs=72, plus=.38, aw=.6, right=9.35)}
QUIZ_EVERY, LEVEL_EVERY = 8, 3
# file, letters, scene, host, friend, third (quiz peekers), accent colour
DECKS = [
 ("01-alif", ["أ"], "s01_meadow", "rabbit", "girl", "cat", "8E5BD0"),
 ("02-ba-ta-tha", ["ب", "ت", "ث"], "s02_pond", "duck", "boy", "turtle", "C1440E"),
 ("03-noon-ya", ["ن", "ي"], "s03_sea", "fish", "turtle", "bird", "F2B134"),
 ("04-jeem-ha-kha", ["ج", "ح", "خ"], "s04_savanna", "elephant", "boy", "dog", "7A3F12"),
 ("05-dal-dhal", ["د", "ذ"], "s05_farm", "dog", "girl", "rabbit", "1D7FB5"),
 ("06-ra-zay", ["ر", "ز"], "s06_garden", "cat", "bird", "girl", "7A4FD6"),
 ("07-seen-sheen", ["س", "ش"], "s07_desert", "boy", "elephant", "duck", "2B7A78"),
 ("08-sad-dad", ["ص", "ض"], "s08_snow", "bird", "girl", "rabbit", "5B3FD0"),
 ("09-ta-dha", ["ط", "ظ"], "s09_jungle", "girl", "turtle", "elephant", "FFC857"),
 ("10-ain-ghain", ["ع", "غ"], "s10_night", "turtle", "cat", "bird", "7DF9FF"),
 ("11-fa-qaf", ["ف", "ق"], "s11_mountain", "rabbit", "dog", "boy", "3A86FF"),
 ("12-kaf", ["ك"], "s12_beach", "duck", "girl", "dog", "E07A5F"),
 ("13-lam", ["ل"], "s13_orchard", "dog", "cat", "girl", "E8590C"),
 ("14-meem", ["م"], "s14_kites", "bird", "boy", "elephant", "5A189A"),
 ("15-ha", ["ه"], "s15_sunset", "cat", "duck", "rabbit", "FFC857"),
 ("16-waw", ["و"], "s16_autumn", "elephant", "girl", "dog", "9B2915"),
]

def sp_(n, pose): return f'c_{n}_{pose}'

class Game:
    def __init__(self, cfg):
        self.file, self.members, self.scene, self.host, self.friend, self.third, self.acc = cfg
        self.d = K.Deck(); self.rng = random.Random(12345)

    def new(self, key, **kw):
        s = self.d.new(key, **kw); s.pic('bg_' + self.scene, 0, 0, 1920, 1080, name='Background', descr='Cartoon habitat'); return s

    # ---- progress bar (fills from the right, like the earlier decks) ----
    def bar(self, s, frac, miles):
        x0, W, y, h = 1.6 * U, 6.8 * U, 5.3 * U, .16 * U
        s.shp('ROUNDED_RECTANGLE', x0, y, W, h, fill='FFFFFF', alpha=85, line=self.acc, lw=1.5, rect_r=.5, name='Game track')
        fw = max(.16 * U, W * frac)
        s.shp('ROUNDED_RECTANGLE', x0 + W - fw, y, fw, h, fill=self.acc, rect_r=.5, name='Game progress')
        for i, m in enumerate(miles):
            s.shp('OVAL', x0 + W - W * m - .07 * U, y + .01 * U, .14 * U, .14 * U, fill=GOLD if m <= frac + 1e-9 else 'FFFFFF', line=self.acc, lw=1, name=f'Game milestone {i + 1}')
        s.shp('STAR_5', x0 - .22 * U, y - .1 * U, .36 * U, .36 * U, fill=GOLD, line='FFFFFF', lw=1, name='Game goal star')
        s.pic(sp_(self.host, 'idle'), x0 + W - fw - .22 * U, y - .42 * U, .64 * U, .64 * U, name='Game marker (host animal)', descr='progress marker')

    def eq_geometry(self, n):
        g = CFG[n]; right = g['right']; cx = []
        for i in range(n): cx.append(right - g['d']); right -= g['d'] + g['gap']
        return g, cx

    # ---- content slide: the equation, revealed step by step on click ----
    def content(self, key, L, prog):
        s = self.new(key); n = len(L); CY = 2.8 * U
        ph = (sp_(self.host, 'idle'), sp_(self.host, 'happy')); fr = (sp_(self.friend, 'idle'), sp_(self.friend, 'happy'))
        hb = (1570, 700, 340, 340); fb = (10, 700, 340, 340)
        h_i = s.pic(ph[0], *hb, name=f'{self.host} (host)'); h_h = s.pic(ph[1], *hb, name=f'{self.host} (happy)', hidden=True)
        f_i = s.pic(fr[0], *fb, name=f'{self.friend} (friend)'); f_h = s.pic(fr[1], *fb, name=f'{self.friend} (happy)', hidden=True)
        hop = lambda sp: fx('move', sp, 0, dx=0, dy=-.05, dur=170, rev=True)
        steps = []
        if n == 1:
            d = 3.4 * U; x = 5 * U - d / 2; y = CY - d / 2
            s.shp('OVAL', x, y, d, d, fill='FFFFFF', line=RING[1], lw=10 * PT * .75, name='Circle 1')
            a = s.shp('RECTANGLE', x, y, d, d, text=L[0], fs=190 * PT, color=INK, name='S01 L1 letter', hidden=True)
            b = s.shp('RECTANGLE', x, y, d, d, text=L[0] + FATHA, fs=190 * PT, color=INK, name='S02 F1 mark', hidden=True)
            steps = [[fx('fadein', a, 0, dur=300, sound='pluck1'), hop(h_i)], [fx('fadein', b, 0, dur=300, sound='bell1'), hop(h_i), hop(f_i)]]
            s.on_step(steps[0]); s.on_step(steps[1])
            s.on_step([fx('disappear', h_i, 0), fx('appear', h_h, 0), fx('disappear', f_i, 0), fx('appear', f_h, 0), hop(h_h), hop(f_h), snd(f'a_{self.host}', 100), snd('win', 700)])
            self.bar(s, *prog); return s
        g, cx = self.eq_geometry(n); d = g['d'] * U
        for i, l in enumerate(L):
            s.shp('OVAL', cx[i] * U, CY - d / 2, d, d, fill='FFFFFF', line=(RING[0], RING[2])[i] if n == 2 else RING[i], lw=8 * PT * .75, name=f'Circle {i + 1}')
        PX = (cx[-1] - g['zone'] - g['pw']) * U
        s.shp('ROUNDED_RECTANGLE', PX, CY - g['ph'] * U / 2, g['pw'] * U, g['ph'] * U, fill='FFFBE3', line='F2B134', lw=6 * PT * .75, rect_r=.14, name='Result panel')
        order = []
        for i, l in enumerate(L):
            o = dict(x=cx[i] * U, y=CY - d / 2, w=d, h=d)
            a = s.shp('RECTANGLE', o['x'], o['y'], d, d, text=l, fs=g['fs'] * PT, color=INK, name=f'L{i + 1} letter', hidden=True)
            b = s.shp('RECTANGLE', o['x'], o['y'], d, d, text=l + FATHA, fs=g['fs'] * PT, color=INK, name=f'F{i + 1} mark', hidden=True)
            order.append(([fx('fadein', a, 0, dur=300, sound=f'pluck{min(i + 1, 3)}'), hop(h_i)]))
            order.append(([fx('fadein', b, 0, dur=300, sound=f'bell{min(i + 1, 3)}'), hop(h_i), hop(f_i)]))
            if i < n - 1:
                pl = s.shp('MATH_PLUS', (cx[i] - g['gap'] / 2 - g['plus'] / 2) * U, CY - g['plus'] * U / 2, g['plus'] * U, g['plus'] * U, fill=self.acc, name=f'P{i + 1} plus', hidden=True)
                order.append([fx('fadein', pl, 0, dur=300, sound='bloop')])
        ar = s.shp('LEFT_ARROW', (cx[-1] - g['zone'] / 2 - g['aw'] / 2) * U, CY - .28 * U, g['aw'] * U, .56 * U, fill=self.acc, name='A arrow', hidden=True)
        order.append([fx('fadein', ar, 0, dur=300, sound='whoosh')])
        rs = s.shp('RECTANGLE', PX, CY - g['ph'] * U / 2, g['pw'] * U, g['ph'] * U, text=full(L), fs=g['rs'] * PT, color=INK, name='R result', hidden=True)
        order.append([fx('fadein', rs, 0, dur=350, sound='win'), fx('disappear', h_i, 0), fx('appear', h_h, 0), fx('disappear', f_i, 0), fx('appear', f_h, 0), hop(h_h), hop(f_h), snd(f'a_{self.host}', 150)])
        for st in order: s.on_step([e for e in st if e is not None])
        self.bar(s, *prog); return s

    # ---- quiz: read the equation, tap the animal holding the right answer ----
    def quiz(self, key, L, k, ok_key, no_key, prog):
        s = self.new(key, adv=False); n = len(L); g, cx = self.eq_geometry(n); d = g['d'] * U; CY = 1.7 * U
        for i, l in enumerate(L):
            s.shp('OVAL', cx[i] * U, CY - d / 2, d, d, fill='FFFFFF', line=(RING[0], RING[2])[i] if n == 2 else RING[i], lw=8 * PT * .75, name=f'Circle {i + 1}')
        PX = (cx[-1] - g['zone'] - g['pw']) * U
        s.shp('ROUNDED_RECTANGLE', PX, CY - g['ph'] * U / 2, g['pw'] * U, g['ph'] * U, fill='FFFBE3', line='F2B134', lw=6 * PT * .75, rect_r=.14, dash=True, name='Question panel')
        s.shp('RECTANGLE', PX, CY - g['ph'] * U / 2, g['pw'] * U, g['ph'] * U, text='؟', fs=110 * PT, color=self.acc, name='Question mark')
        for i, l in enumerate(L):
            s.shp('RECTANGLE', cx[i] * U, CY - d / 2, d, d, text=l + FATHA, fs=g['fs'] * PT, color=INK, name=f'Letter {i + 1}')
            if i < n - 1: s.shp('MATH_PLUS', (cx[i] - g['gap'] / 2 - g['plus'] / 2) * U, CY - g['plus'] * U / 2, g['plus'] * U, g['plus'] * U, fill=self.acc, name=f'Plus {i + 1}')
        s.shp('LEFT_ARROW', (cx[-1] - g['zone'] / 2 - g['aw'] / 2) * U, CY - .28 * U, g['aw'] * U, .56 * U, fill=self.acc, name='Arrow')
        correct = full(L); rev = list(reversed(L))
        w1 = full(rev) if full(rev) != correct else full([l if i < len(L) - 1 else sim(l) for i, l in enumerate(L)])
        w2 = full([sim(l) if i == k % len(L) else l for i, l in enumerate(L)])
        if w2 in (w1, correct): w2 = full([sim(l) if i == (k + 1) % len(L) else l for i, l in enumerate(L)])
        if w2 in (w1, correct): w2 = full([ALPHA[(ALPHA.index(l) + 3) % 28] if i == 0 else l for i, l in enumerate(L)])
        wrongs = [w1, w2]; pos = k % 3; wi = 0
        W_, H_, gap = 2.25 * U, 1.25 * U, .25 * U; x0 = (10 * U - (3 * W_ + 2 * gap)) / 2; Y = 3.55 * U
        peek = [self.host, self.friend, self.third]
        for j in range(3):
            isC = j == pos; text = correct if isC else wrongs[wi]; wi += 0 if isC else 1
            x = x0 + (2 - j) * (W_ + gap)
            s.pic(sp_(peek[j], 'think'), x + W_ / 2 - 125, Y - 178, 250, 250, name=f'{peek[j]} holding answer {j + 1}', descr=f'{peek[j]} peeking over the answer card')
            s.shp('ROUNDED_RECTANGLE', x, Y, W_, H_, fill='FFFFFF', line=RING[j], lw=6 * PT * .75, rect_r=.16, text=text, fs=(64 if n == 2 else 54) * PT, color=INK,
                  name=f'LINK answer {j + 1}', link=ok_key if isC else no_key)
        self.bar(s, *prog)
        s.slide.notes_slide.notes_text_frame.text = "GAME TIME: ask the child to read the equation, then tap the animal holding the answer they think is right. Right answer = celebration slide. Wrong answer = a hidden try-again slide; tap the green button to try again."
        return s

    def correct(self, key, L, prog):
        s = self.new(key)
        h = s.pic(sp_(self.host, 'happy'), 760, 190, 400, 400, name=f'{self.host} cheering'); t = s.pic(sp_(self.host, 'talk'), 760, 190, 400, 400, name=f'{self.host} cheering 2', hidden=True)
        s.pic(sp_(self.friend, 'happy'), 120, 330, 330, 330, name=f'{self.friend} cheering'); s.pic(sp_(self.third, 'happy'), 1470, 330, 330, 330, name=f'{self.third} cheering')
        auto = [snd(f'a_{self.host}', 0), snd(f'a_{self.friend}', 350), snd(f'a_{self.third}', 700)]
        for i in range(8):
            auto += [fx('appear' if i % 2 == 0 else 'disappear', t, 400 + i * 420), fx('disappear' if i % 2 == 0 else 'appear', h, 400 + i * 420)]
        for i, (x, z) in enumerate([(3.35, .9), (4.5, .9), (5.65, .9)]):
            st = s.shp('STAR_5', x * U, .3 * U, z * U, z * U, fill=GOLD, line='FFFFFF', lw=2, name=f'G star{i + 1}', hidden=True)
            auto.append(fx('fadein', st, 500 + i * 280, dur=300, sound=f'bell{i + 1}'))
        pn = s.shp('ROUNDED_RECTANGLE', 2.6 * U, 3.55 * U, 4.8 * U, 1.3 * U, fill='FFFBE3', line='F2B134', lw=6 * PT * .75, rect_r=.2, text=full(L), fs=80 * PT, color=INK, name='G panel', hidden=True)
        auto.append(fx('fadein', pn, 1500, dur=300, sound='win'))
        s.on_load(auto); self.bar(s, *prog); return s

    def oops(self, key, quiz_key):
        s = self.new(key, hidden_slide=True, adv=False)
        s.pic(sp_(self.host, 'oops'), 40, 600, 380, 380, name=f'{self.host} sad'); s.pic(sp_(self.friend, 'think'), 1500, 640, 340, 340, name=f'{self.friend} encouraging')
        x = s.shp('MATH_MULTIPLY', 3.8 * U, .5 * U, 2.4 * U, 2.4 * U, fill='E8453C', line='FFFFFF', lw=3, name='G oops', hidden=True)
        s.shp('ROUNDED_RECTANGLE', 3.4 * U, 3.3 * U, 3.2 * U, 1.5 * U, fill='2FB57A', line='FFFFFF', lw=5 * PT * .75, rect_r=.2, name='LINK retry button', link=quiz_key)
        s.shp('CIRCULAR_ARROW', 4.4 * U, 3.5 * U, 1.2 * U, 1.1 * U, fill='FFFFFF', name='LINK retry icon', link=quiz_key)
        s.on_load([fx('fadein', x, 0, dur=300, sound='oops'), snd('aww', 250), fx('move', x, 300, dx=.015, dy=0, dur=90, rev=True, repeat=3)])
        s.slide.notes_slide.notes_text_frame.text = "Hidden try-again slide: only shown after a wrong answer. Tap the green button to go back to the question."
        return s

    def level(self, key, finale):
        s = self.new(key); cols = ['FF5D8F', 'FFC93C', '3A8FD9', '2FB57A', '8E5BD0', 'FF8A3D', 'FFFFFF']; n = 40 if finale else 26
        cast = [self.host, self.friend, self.third, 'girl' if self.host != 'girl' else 'boy'] if finale else [self.host, self.friend, self.third]
        xs = [(1920 - 300 * len(cast)) / 2 + 300 * i for i in range(len(cast))]
        auto = []
        for i, c in enumerate(cast):
            p = s.pic(sp_(c, 'happy'), xs[i] - 10, 740, 320, 320, name=f'{c} celebrating'); auto += [snd(f'a_{c}', 200 + i * 300), fx('move', p, 0, dx=0, dy=-.06, dur=260, rev=True, repeat='inf')]
        for i in range(n):
            while True:
                x, y = .2 + self.rng.random() * 9.4, .2 + self.rng.random() * 4.8
                if not (3.1 < x < 6.9 and .3 < y < 4.7) and not y > 3.7: break
            z = .18 + self.rng.random() * .22; kind = ['OVAL', 'STAR_5', 'RECTANGLE', 'HEART'][i % 4]
            c = s.shp(kind, x * U, y * U, z * U, z * U, fill=cols[i % len(cols)], name=f'G confetti {i + 1}', rot=int(self.rng.random() * 60), hidden=True)
            auto.append(fx('fadein', c, 350 + i * 35, dur=300))
        for nm_, x, y, w, h, c, r in [('medal ribbon left', 3.9, 3.45, .9, 1.25, 'E8453C', 190), ('medal ribbon right', 5.2, 3.45, .9, 1.25, '3A8FD9', 170)]:
            s.shp('ISOSCELES_TRIANGLE', x * U, y * U - 80, w * U, h * U * .8, fill=c, line='FFFFFF', lw=2, rot=r, name=nm_)
        md = s.shp('OVAL', 3.4 * U, .55 * U, 3.0 * U, 3.0 * U, fill=GOLD, line='FFFFFF', lw=6 * PT * .75, name='G medal')
        s.shp('OVAL', 3.8 * U, .95 * U, 2.2 * U, 2.2 * U, fill='FFE48A', line='F2B134', lw=4 * PT * .75, name='G medal inner')
        s.shp('STAR_5', 4.1 * U, 1.25 * U, 1.6 * U, 1.6 * U, fill='FFFFFF', line='F2B134', lw=3, name='G medal star')
        auto += [snd('win' if finale else 'level', 0), fx('scale', md, 300, sx=108, sy=108, dur=400, rev=True, repeat=3)]
        s.on_load(auto)
        s.slide.notes_slide.notes_text_frame.text = "Finished! Give the child a big cheer." if finale else "Level up! Celebrate before the next set of letters."
        return s

    def build(self):
        content = []
        for X in self.members:
            P = partners(X); content.append([X])
            content += [[X, p] for p in P]                                       # letter at the BEGINNING
            content += [[p, X, P[(k + 1) % len(P)]] for k, p in enumerate(P)]    # letter in the MIDDLE
            content += [[p, X] for p in P]                                       # letter at the END
        items = []; lastMulti = None; q = 0; miles = []
        for i, L in enumerate(content):
            items.append(dict(t='c', L=L, ci=i + 1))
            if len(L) > 1: lastMulti = L
            if (i + 1) % QUIZ_EVERY == 0 and i + 1 < len(content) and lastMulti:
                q += 1; items += [dict(t='q', L=lastMulti, k=q, ci=i + 1), dict(t='ok', L=lastMulti, ci=i + 1), dict(t='no', ci=i + 1)]
                miles.append((i + 1) / len(content))
                if q % LEVEL_EVERY == 0: items.append(dict(t='lv', ci=i + 1))
        items.append(dict(t='fin', ci=len(content)))
        keys = [f'k{i}' for i in range(len(items))]
        for idx, it in enumerate(items):
            prog = (it['ci'] / len(content), miles); key = keys[idx]
            if it['t'] == 'c': self.content(key, it['L'], prog)
            elif it['t'] == 'q': self.quiz(key, it['L'], it['k'], keys[idx + 1], keys[idx + 2], prog)
            elif it['t'] == 'ok': self.correct(key, it['L'], prog)
            elif it['t'] == 'no': self.oops(key, keys[idx - 2])
            else: self.level(key, it['t'] == 'fin')
        self.d.prs.core_properties.title = f"Fatha game {self.file}"; self.d.prs.core_properties.author = 'Claude'
        return len(content), len(items), q

if __name__ == '__main__':
    out = sys.argv[1]; only = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith('--') else None
    K.PREVIEW = 'end' if '--preview' in sys.argv else False
    os.makedirs(out, exist_ok=True)
    for cfg in DECKS:
        if only and cfg[0] != only: continue
        g = Game(cfg); a, b, c = g.build(); g.d.save(os.path.join(out, cfg[0] + '.pptx')); print(cfg[0], a, 'content;', b, 'slides;', c, 'quizzes')
