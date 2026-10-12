"""FATHA ADVENTURE - a Lumi-style interactive cartoon game per letter family, with real animal / kid heroes.
Each letter is a chapter: wake the hero (meet the letter) -> star hunt (letter at the BEGINNING) -> balloons (in the MIDDLE)
-> feeding (at the END) -> magic hug -> secret door (collect the three syllables) -> treasure finale."""
import sys, os, random
sys.path.insert(0, os.path.dirname(__file__))
import pptx_kit as K
from pptx_kit import fx, snd, lbox, pose_timeline

FATHA = 'َ'; RING = ['E8604C', '3A8FD9', '2FB57A']; INK = '16213E'; GOLD = 'FFC93C'; HOT = 'E8453C'
ALPHA = list("أبتثجحخدذرزسشصضطظعغفقكلمنهوي")
def partners(X):
    i = ALPHA.index(X); return ALPHA[:i] if i >= 7 else [l for l in ALPHA if l != X][:7]
ar = lambda c: c + FATHA
def runs(L, xi, big=False):                      # syllable as coloured runs: the practised letter X is highlighted
    return [(l + FATHA, HOT if i == xi else INK) for i, l in enumerate(L)]
DECKS = [  # file, letters, hero
 ("01-alif", ["أ"], "rabbit"), ("02-ba-ta-tha", ["ب", "ت", "ث"], "duck"), ("03-noon-ya", ["ن", "ي"], "fish"),
 ("04-jeem-ha-kha", ["ج", "ح", "خ"], "elephant"), ("05-dal-dhal", ["د", "ذ"], "dog"), ("06-ra-zay", ["ر", "ز"], "cat"),
 ("07-seen-sheen", ["س", "ش"], "boy"), ("08-sad-dad", ["ص", "ض"], "bird"), ("09-ta-dha", ["ط", "ظ"], "girl"),
 ("10-ain-ghain", ["ع", "غ"], "turtle"), ("11-fa-qaf", ["ف", "ق"], "rabbit"), ("12-kaf", ["ك"], "duck"),
 ("13-lam", ["ل"], "dog"), ("14-meem", ["م"], "bird"), ("15-ha", ["ه"], "cat"), ("16-waw", ["و"], "elephant")]

def pulse(sp, sx=112, dur=900, t=0): return fx('scale', sp, t, sx=sx, sy=sx, dur=dur, rev=True, repeat='inf')
def bob(sp, dy=-0.02, dur=1400, t=0): return fx('move', sp, t, dx=0, dy=dy, dur=dur, rev=True, repeat='inf')
def sway(sp, dx=0.006, dy=-0.02, dur=2400, t=0): return fx('move', sp, t, dx=dx, dy=dy, dur=dur, rev=True, repeat='inf')
def spin_loop(sp, dur=9000, t=0): return fx('spin', sp, t, deg=360, dur=dur, repeat='inf')
def hop(ids, t, dy=-0.07, dur=260, times=1): return [fx('move', sp, t, dx=0, dy=dy, dur=dur, rev=True, repeat=times if times > 1 else None) for sp in ids.values()]
def fireflies(s, n, rng, area=(100, 150, 1700, 700)):
    out = []
    for i in range(n):
        x, y = rng.uniform(area[0], area[0] + area[2]), rng.uniform(area[1], area[1] + area[3])
        sp = s.pic('dust', x, y, 56, 56, name='firefly', descr='glowing firefly')
        out += [fx('move', sp, rng.randint(0, 1500), path=[(0.02, -0.03), (-0.012, -0.06), (0.018, -0.02), (0, 0)], dur=rng.randint(6000, 10000), repeat='inf'), pulse(sp, 130, rng.randint(700, 1400), rng.randint(0, 800))]
    return out

class Adventure:
    def __init__(self, cfg):
        self.file, self.members, self.hero = cfg
        self.d = K.Deck(); self.rng = random.Random(3); self.pre = f'c_{self.hero}_'

    # ---------- UI pieces ----------
    def strip(self, s, slots):
        """Position board (top-right): circles in reading order, right = FIRST letter. slots: list of (text|None, is_X)."""
        n = len(slots); cw, gap, pad = 100, 22, 28; w = n * cw + (n - 1) * gap + 2 * pad; xr = 1890
        s.shp('ROUNDED_RECTANGLE', xr - w, 24, w, 128, fill='2A1A5E', alpha=80, line='FFE066', lw=2.5, rect_r=.5, name='Position board')
        for i, (tx, isx) in enumerate(slots):
            x = xr - pad - cw - i * (cw + gap)
            if tx: s.shp('OVAL', x, 38, cw, cw, fill='FFF3B0' if isx else 'FFFFFF', line=GOLD if isx else RING[i % 3], lw=4, text=tx, fs=40, color=INK, name=f'Slot {i + 1}' + (' (practised letter)' if isx else ''))
            else: s.shp('OVAL', x, 38, cw, cw, fill='4A3A8E', line='B8A8F0', lw=3, dash=True, text='؟', fs=40, color='D8CCFF', name=f'Slot {i + 1} (empty)')
    def popup(self, s, L, xi, name='Syllable popup'):
        return s.shp('ROUNDED_RECTANGLE', 470, 250, 980, 300, fill='FFFBE3', line='F2B134', lw=7, rect_r=.2, text=runs(L, xi), fs=120, name=name, hidden=True)
    def tag(self, s, L, xi, cx, cy, w=190, h=84, fs=34, ring='3A8FD9', name='Syllable tag', link=None, hidden=False):
        return s.shp('ROUNDED_RECTANGLE', cx - w / 2, cy - h / 2, w, h, fill='FFFFFF', line=ring, lw=4, rect_r=.3, text=runs(L, xi), fs=fs, name=name, link=link, hidden=hidden)
    def hero_sound(self, kind): return f'{kind}_{self.hero}'

    # ---------- chapter data ----------
    def chapter(self, ci, X, nxt):
        h = self.hero; rng = self.rng; P = partners(X)
        B = P[:3]                                           # beginning: X + p
        M = [(P[i % len(P)], P[(i + 1) % len(P)]) for i in range(3, 7)]      # middle: p X q
        E = [P[(3 + i) % len(P)] for i in range(4)]         # end: p + X
        k = lambda name: f'c{ci}_{name}'
        ex_begin, ex_mid, ex_end = [X, B[0]], [M[0][0], X, M[0][1]], [E[0], X]
        # ===== 1. WAKE =====
        s = self.d.new(k('wake'))
        s.pic('bg_night', 0, 0, 1920, 1080, descr='Moonlit meadow with a cosy nest')
        cue = s.pic('glow', 630, 290, 660, 660, name='click-me glow')
        zzz = s.pic('zzz', 1150, 250, 200, 230, descr='snoring Zs')
        tl = [('sleep', 0), ('stir', 300), ('yawn', 1000), ('jump', 1700), ('surprised', 2300), ('laughA', 3000), ('laughB', 3250), ('laughA', 3500), ('laughB', 3750), ('welcome', 4100), ('waveA', 4700), ('waveB', 5100), ('waveA', 5500), ('waveB', 5900), ('waveA', 6300)]
        ids, pe = pose_timeline(s, lbox(960, 950, 640), tl, h, self.pre)
        card = s.shp('OVAL', 1350, 120, 330, 330, fill='FFFFFF', line=GOLD, lw=9, text=ar(X), fs=170, color=INK, name='Meet the letter', hidden=True)
        portal = s.pic('portal', 1380, 600, 400, 400, name='Magic portal to the forest', hidden=True, link=k('s0_n'), descr='glowing portal')
        hot = s.hot(690, 340, 540, 620, 'Tap the hero to wake')
        s.on_load([pulse(cue, 108, 1300), bob(zzz, -0.03, 1600), fx('scale', ids['sleep'], 0, sx=102, sy=104, dur=1700, rev=True, repeat='inf')] + fireflies(s, 7, rng, (60, 80, 1800, 600)))
        s.on_click(hot, pe + [snd(self.hero_sound('wake'), 0), fx('fadeout', zzz, 0, dur=400), fx('fadeout', cue, 0, dur=500),
                              fx('move', ids['jump'], 1700, dx=0, dy=-0.1, dur=300, rev=True, repeat=2), fx('move', ids['surprised'], 2300, dx=0, dy=-0.04, dur=200, rev=True),
                              fx('zoomin', card, 4300, dur=500, sound='syl_gold'), pulse(card, 106, 1000, 4800),
                              snd('portal_in', 5300), fx('fadein', portal, 5300, dur=700), spin_loop(portal, 8000, 5300)], restart='never')
        # ===== 2. STAR HUNT = letter at the BEGINNING (13 state slides) =====
        STAR = [(190, 150), (1540, 150), (880, 410)]
        states = [(0, None)] + [(m, b) for m in range(1, 8) for b in range(3) if (m >> b) & 1]
        NM = {None: 'n', 0: '0', 1: '1', 2: '2'}
        for m, last in states:
            s = self.d.new(k(f's{m}_{NM[last]}'), fade=(m == 0 and last is None))
            s.pic('bg_forest', 0, 0, 1920, 1080, descr='Magical forest')
            cnt = bin(m).count('1'); auto = fireflies(s, 5, rng)
            for b, (x, y) in enumerate(STAR):
                if not (m >> b) & 1:
                    sp = s.pic('star_gold', x, y, 190, 190, name=f'Hidden star {b + 1}', link=k(f's{m | 1 << b}_{b}'), descr='sparkling star')
                    bd = s.shp('OVAL', x + 52, y + 64, 86, 86, fill='FFFFFF', line=RING[b], lw=3.5, text=ar(B[b]), fs=36, color=INK, name=f'Star letter {B[b]}', link=k(f's{m | 1 << b}_{b}'))
                    auto += [pulse(sp, 116, 800 + 130 * b, 100 * b), pulse(bd, 116, 800 + 130 * b, 100 * b)]
            # counter + position board
            s.shp('ROUNDED_RECTANGLE', 480, 24, 440, 128, fill='2A1A5E', alpha=80, line='FFE066', lw=2.5, rect_r=.5, name='Star counter')
            for i in range(3): s.shp('STAR_5', 520 + i * 130, 40, 100, 100, fill=GOLD if i < cnt else '4A3A8E', line='FFFFFF' if i < cnt else 'B8A8F0', lw=2, name=f'Counter star {i + 1}')
            self.strip(s, [(ar(X), True), (ar(B[last]) if last is not None else None, False)])
            tl = [('surprised', 0), ('lookUp', 800)] if cnt == 0 else ([('cheer', 0), ('lookUp', 1900)] if cnt < 3 else [('cheer', 0), ('danceA', 1500), ('danceB', 1800)] + [('danceA' if i % 2 == 0 else 'danceB', 2100 + i * 300) for i in range(6)])
            ids, pe = pose_timeline(s, lbox(560, 1010, 470), tl, h, self.pre); auto += pe
            if cnt == 0: auto.append(snd('portal_go', 0))
            else:
                pu = self.popup(s, [X, B[last]], 0); sb = s.pic('sparkle_burst', 710, 190, 500, 500, name='sparkles', hidden=True)
                auto += hop(ids, 0, -0.08, 280, 2) + [snd('star_all' if cnt == 3 else f'star_{cnt}', 0), snd('syl', 350), snd('jump', 0),
                        fx('zoomin', pu, 250, dur=350), fx('fadeout', pu, 2300, dur=500), fx('zoomin', sb, 250, dur=300), fx('fadeout', sb, 900, dur=500)]
            if cnt == 3:
                conf = s.pic('confetti', 360, -720, 1200, 700, name='confetti'); gl = s.pic('glow', 1000, 250, 760, 760, name='portal glow', hidden=True)
                pt = s.pic('portal', 1120, 370, 520, 520, name='Magic portal to the balloon sky', hidden=True, link=k('bal'), descr='glowing portal')
                auto += [fx('move', conf, 100, dx=0, dy=1.6, dur=3600), fx('fadein', gl, 2300, dur=700), fx('zoomin', pt, 2300, dur=700), spin_loop(pt, 8000, 3100), pulse(gl, 112, 1100, 3100)]
            s.on_load(auto)
        # ===== 3. BALLOONS = letter in the MIDDLE =====
        s = self.d.new(k('bal'), fade=True)
        s.pic('bg_sky', 0, 0, 1920, 1080, descr='Sunny sky with a rainbow')
        self.strip(s, [(None, False), (ar(X), True), (None, False)])
        lids, lpe = pose_timeline(s, lbox(960, 1040, 470), [('jump', 0), ('welcome', 900)], h, self.pre)
        auto = lpe + [snd('portal_go', 0)]
        gl = s.pic('glow', 730, 130, 460, 460, name='golden balloon glow')
        gold = s.pic('balloon_gold', 810, 150, 300, 500, name='Golden balloon with food basket', link=k('feed'), descr='golden balloon carrying a basket of treats')
        auto += [pulse(gl, 112, 1200), sway(gold, 0.004, -0.015, 2600)]
        BAL = [('red', 90, 90, 'r_bird'), ('blue', 380, 330, 'r_butterfly'), ('pink', 1260, 90, 'r_heart'), ('purple', 1500, 330, 'r_flower')]
        pops = []
        for n, (col, x, y, rew) in enumerate(BAL):
            bal = s.pic(f'balloon_{col}', x, y, 190, 380, name=f'{col} balloon', descr=f'{col} balloon')
            L3 = [M[n][0], X, M[n][1]]
            tg = self.tag(s, L3, 1, x + 95, y + 125, 200, 90, 40, RING[n % 3], f'Balloon syllable {n + 1}')
            cx, cy = x + 95, y + 130
            burst = s.pic(f'burst_{col}', cx - 150, cy - 150, 300, 300, name='pop burst', hidden=True)
            rw, rh = {'r_bird': (210, 178), 'r_butterfly': (230, 184), 'r_heart': (170, 170), 'r_flower': (170, 212)}[rew]
            rimg = 'heart_pink' if rew == 'r_heart' else rew
            r = s.pic(rimg, cx - rw / 2, cy - rh / 2, rw, rh, name='surprise', hidden=True)
            pu = self.popup(s, L3, 1)
            auto.append(sway(bal, 0.005 * (1 if n % 2 else -1), -0.02, 2200 + 300 * n, 150 * n)); auto.append(sway(tg, 0.005 * (1 if n % 2 else -1), -0.02, 2200 + 300 * n, 150 * n))
            hs = s.hot(x, y, 190, 280, f'pop balloon {n + 1}')
            eff = [snd(f'pop_{n + 1}', 0), snd('syl', 350), fx('disappear', bal, 0), fx('disappear', tg, 0), fx('zoomin', burst, 0, dur=120), fx('scale', burst, 120, sx=130, sy=130, dur=220), fx('fadeout', burst, 300, dur=300),
                   fx('zoomin', r, 80, dur=350), fx('zoomin', pu, 300, dur=350), fx('fadeout', pu, 2600, dur=500)]
            if rew == 'r_bird': eff += [fx('move', r, 450, dx=0.5, dy=-0.25, dur=2200), fx('fadeout', r, 2300, dur=500)]
            if rew == 'r_butterfly': eff += [fx('move', r, 450, path=[(0.05, -0.1), (-0.03, -0.2), (0.07, -0.3), (0.0, -0.42)], dur=3000), fx('fadeout', r, 3000, dur=500)]
            if rew == 'r_heart': eff += [fx('move', r, 450, dx=0.0, dy=-0.4, dur=2000), fx('scale', r, 450, sx=160, sy=160, dur=2000), fx('fadeout', r, 1700, dur=500)]
            if rew == 'r_flower': eff += [fx('scale', r, 450, sx=140, sy=140, dur=700, rev=True, repeat=2), fx('fadeout', r, 2200, dur=500)]
            eff += hop(lids, 100, -0.06, 220, 2)
            pops.append((hs, eff))
        for hs, eff in pops: s.on_click(hs, eff)
        s.on_load(auto)
        # ===== 4. FEEDING = letter at the END =====
        FOODS = [('apple', 'munch', 120), ('cupcake', 'cake', 480), ('lemon', 'veg', 1180), ('chili', 'chili', 1540)]
        mouth = (960, 494)
        for variant in [None] + [f[0] for f in FOODS]:
            s = self.d.new(k('feed') if variant is None else k(f'feed_{variant}'), fade=(variant is None))
            s.pic('bg_feed', 0, 0, 1920, 1080, descr='Picnic meadow')
            self.strip(s, [(None, False), (ar(X), True)])
            fb = lbox(960, 775, 620); auto = []; foods = {}
            for i, (nm, kind, fx_) in enumerate(FOODS):
                L2 = [E[i], X]
                if nm == variant:
                    foods[nm] = s.pic(f'food_{nm}', fx_, 790, 230, 230, name=f'{nm} flying to the hero', descr=nm)
                    ftag = self.tag(s, L2, 1, fx_ + 115, 765, 210, 88, 42, RING[i % 3], 'food syllable')
                else:
                    foods[nm] = s.pic(f'food_{nm}', fx_, 790, 230, 230, name=f'Feed {nm}', link=k(f'feed_{nm}'), hidden=(variant is None), descr=f'{nm} to feed')
                    tg = self.tag(s, L2, 1, fx_ + 115, 765, 210, 88, 42, RING[i % 3], f'food syllable {nm}', link=k(f'feed_{nm}'), hidden=(variant is None))
                    auto += [pulse(foods[nm], 108, 800 + 100 * i, 120 * i), pulse(tg, 108, 800 + 100 * i, 120 * i)]
                    if variant is None: auto += [fx('zoomin', foods[nm], 700 + 180 * i, dur=350), fx('zoomin', tg, 700 + 180 * i, dur=350)]
            if variant is None:
                ids, pe = pose_timeline(s, fb, [('surprised', 0), ('wait', 900)], h, self.pre)
                auto += pe + hop(ids, 0, -0.07, 260, 2) + [snd('pop_gold', 0), snd('feed_wait', 1500)]
            else:
                kind = dict((f[0], f[1]) for f in FOODS)[variant]; i = [f[0] for f in FOODS].index(variant); fx_ = FOODS[i][2]
                dx, dy = (mouth[0] - (fx_ + 115)) / 1920, (mouth[1] - 905) / 1080
                munch = [('chewA', 450), ('chewB', 670), ('chewA', 890), ('chewB', 1110), ('chewA', 1330)]
                if kind == 'munch': tl = [('wait', 0)] + munch + [('yum', 1500), ('yummy', 2500)]; end = 2700; tp = 1500
                if kind == 'cake': tl = [('wait', 0), ('chewA', 450), ('chewB', 670), ('chewA', 890), ('yum', 1100), ('yummy', 1800)]; end = 2000; tp = 1100
                if kind == 'veg': tl = [('wait', 0), ('chewA', 450), ('chewB', 670), ('yuck', 1000), ('chewA', 1700), ('chewB', 1950), ('happyAgain', 2300)]; end = 2600; tp = 2300
                if kind == 'chili': tl = [('wait', 0), ('chewA', 450), ('chewB', 670), ('hot', 900), ('fire', 1800), ('hot', 3100), ('yummy', 3300)]; end = 3600; tp = 3300
                ids, pe = pose_timeline(s, fb, tl, h, self.pre)
                auto += pe + [snd(f'{kind if kind != "munch" else "munch"}_{h}', 0), fx('move', foods[variant], 0, dx=dx, dy=dy, dur=450), fx('scale', foods[variant], 0, sx=35, sy=35, dur=450), fx('spin', foods[variant], 0, deg=360, dur=450), fx('disappear', foods[variant], 450),
                              fx('move', ftag, 0, dx=dx, dy=dy, dur=450), fx('scale', ftag, 0, sx=35, sy=35, dur=450), fx('disappear', ftag, 450)]
                pu = self.popup(s, [E[i], X], 1)
                auto += [fx('zoomin', pu, tp, dur=350), snd('syl', tp + 100), fx('fadeout', pu, tp + 1800, dur=500)]
                if kind == 'veg':
                    auto += hop(ids, 2000, -0.05, 200, 1)
                if kind == 'chili':
                    fl = s.pic('flame', 975, 345, 620, 360, name='funny flame', hidden=True); p1 = s.pic('puff', 1120, 250, 180, 144, name='puff', hidden=True)
                    auto += [fx('zoomin', fl, 1800, dur=300), fx('scale', fl, 2100, sx=112, sy=112, dur=250, rev=True, repeat=3), fx('fadeout', fl, 3000, dur=350), fx('zoomin', p1, 3050, dur=250), fx('move', p1, 3050, dx=0.05, dy=-0.15, dur=1200), fx('fadeout', p1, 3600, dur=600)] + hop(ids, 900, -0.04, 150, 3)
                ht = s.pic('heart_big', 1560, 190, 280, 280, name='Magic heart: tap for a hug', hidden=True, link=k('hug'), descr='glowing magic heart')
                auto += [fx('zoomin', ht, end, dur=500), pulse(ht, 115, 700, end + 500)]
            s.on_load(auto)
        # ===== 5. MAGIC HUG =====
        s = self.d.new(k('hug'), fade=True)
        s.pic('bg_hug', 0, 0, 1920, 1080, descr='Sunset meadow')
        small = lbox(560, 810, 360); big = lbox(960, 1060, 900)
        glow = s.pic('glow', 410, 130, 1100, 1100, name='warm hug glow', hidden=True)
        pi = s.pic(self.pre + 'idle', *small, name='Hero (far)'); ps_ = s.pic(self.pre + 'surprised', *small, name='Hero surprised', hidden=True)
        po = s.pic(self.pre + 'hugOpen', *small, name='Hero running with open arms', hidden=True); pb = s.pic(self.pre + 'hug', *big, name='Hero hugging', hidden=True)
        heart = s.pic('heart_big', 1170, 470, 520, 520, name='Big glowing heart')
        hb = s.shp('OVAL', 1335, 635, 190, 190, fill='FFFFFF', line=RING[0], lw=5, text=ar(X), fs=84, color=INK, name='Heart letter')
        hh = s.hot(1230, 540, 400, 400, 'Tap the heart')
        key = s.pic('key', 1330, 120, 320, 200, name='Heart key to the secret door', hidden=True, link=k('d0_n'), descr='golden heart key')
        s.on_load([pulse(heart, 108, 800), pulse(hb, 108, 800), fx('scale', pi, 0, sx=102, sy=103, dur=1500, rev=True, repeat='inf'), snd('heart_pulse', 300)] + fireflies(s, 6, rng, (60, 100, 1800, 600)))
        eff = [snd(self.hero_sound('hug'), 0), fx('scale', heart, 0, sx=130, sy=130, dur=300, rev=True), fx('scale', hb, 0, sx=130, sy=130, dur=300, rev=True), fx('disappear', pi, 0), fx('appear', ps_, 0), fx('move', ps_, 0, dx=0, dy=-0.05, dur=250, rev=True),
               fx('disappear', ps_, 700), fx('appear', po, 700), fx('move', po, 700, dx=(960 - 560) / 1920, dy=((big[1] + 450) - (small[1] + 180)) / 1080, dur=1300), fx('scale', po, 700, sx=250, sy=250, dur=1300),
               fx('disappear', po, 2000), fx('appear', pb, 2000), fx('fadein', glow, 2000, dur=700), pulse(glow, 106, 1200, 2700), fx('scale', pb, 3000, sx=104, sy=104, dur=500, rev=True, repeat=3)]
        for n in range(8):
            sz = 110 + (n % 3) * 40; x0 = 640 + (n * 137) % 600; y0 = 430 + (n * 71) % 200
            hr = s.pic('heart_pink', x0, y0, sz, sz, name='floating heart', hidden=True); t0 = 2200 + n * 230
            eff += [fx('zoomin', hr, t0, dur=250), fx('move', hr, t0, dx=((-1) ** n) * (0.04 + 0.02 * (n % 5)), dy=-0.5, dur=2300), fx('fadeout', hr, t0 + 1800, dur=500)]
        eff += [fx('zoomin', key, 3900, dur=500), snd('key_appear', 3900), bob(key, -0.025, 1200, 4400), pulse(key, 108, 900, 4400)]
        s.on_click(hh, eff, restart='never')
        # ===== 6. SECRET DOOR: collect the three syllables (13 states) =====
        DOOR = (700, 160, 520, 760); SOCK = [(830, 460), (960, 460), (1090, 460)]
        DN = {None: 'n', 0: 'L', 1: 'O', 2: 'F'}; START = [(330, 360), (1710, 560), (1390, 700)]; GEMS = ['gem_red', 'gem_blue', 'gem_green']
        GEM_T = {0: 700, 1: 1500, 2: 900}; CLUE = {0: 'lantern', 1: 'owl', 2: 'flower'}
        SYL = [ex_begin, ex_mid, ex_end]; XI = [0, 1, 1]
        for m, last in [(0, None)] + [(m, b) for m in range(1, 8) for b in range(3) if (m >> b) & 1]:
            s = self.d.new(k(f'd{m}_{DN[last]}'), fade=(m == 0))
            s.pic('bg_door', 0, 0, 1920, 1080, descr='Ancient stone wall with a magic door')
            auto = fireflies(s, 5, rng, (60, 100, 1800, 600)); complete = m == 7
            link = lambda b: k(f'd{m | 1 << b}_{DN[b]}') if not (m >> b) & 1 else k(f'd{m}_{DN[b]}')
            # board: the three syllables (beginning / middle / end), filled when collected
            s.shp('ROUNDED_RECTANGLE', 520, 24, 880, 130, fill='2A1A5E', alpha=80, line='FFE066', lw=2.5, rect_r=.35, name='Syllable board')
            for b in range(3):
                x = 1400 - 24 - (b + 1) * 270 - b * 12
                if (m >> b) & 1: s.shp('ROUNDED_RECTANGLE', x, 40, 270, 98, fill='FFFFFF', line=RING[b], lw=4, rect_r=.3, text=runs(SYL[b], XI[b]), fs=42, name=f'Collected syllable {b + 1}')
                else: s.shp('ROUNDED_RECTANGLE', x, 40, 270, 98, fill='4A3A8E', line='B8A8F0', lw=3, rect_r=.3, dash=True, text='؟', fs=44, color='D8CCFF', name=f'Empty syllable {b + 1}')
            # clues with their syllable tags
            if (m & 1) and last != 0: s.pic('lantern_on', 110, 120, 440, 640, name='Lantern (lit)', link=link(0), descr='glowing lantern')
            elif last == 0:
                loff = s.pic('lantern_off', 220, 160, 220, 400, name='Lantern (dark)'); lant = s.pic('lantern_on', 110, 120, 440, 640, name='Lantern (lit)', hidden=True, link=link(0))
                auto += [fx('disappear', loff, 300), fx('fadein', lant, 300, dur=300), fx('scale', lant, 700, sx=108, sy=108, dur=350, rev=True, repeat=2)]
            else:
                lant = s.pic('lantern_off', 220, 160, 220, 400, name='Lantern (dark)', link=link(0), descr='dark lantern: tap it'); auto.append(fx('spin', lant, 0, deg=4, dur=1500, rev=True, repeat='inf'))
            if (m & 2) and last != 1: s.pic('owl_awake', 1560, 470, 300, 320, name='Owl (awake)', link=link(1))
            elif last == 1:
                osl = s.pic('owl_sleep', 1560, 470, 300, 320, name='Owl (sleepy)'); ow = s.pic('owl_awake', 1560, 470, 300, 320, name='Owl (awake)', hidden=True, link=link(1))
                ft = s.pic('feather', 1650, 760, 60, 120, name='feather', hidden=True)
                auto += [fx('disappear', osl, 250), fx('appear', ow, 250), fx('move', ow, 250, dx=0, dy=-0.04, dur=220, rev=True, repeat=2), fx('zoomin', ft, 500, dur=200), fx('move', ft, 500, path=[(0.02, 0.06), (-0.02, 0.12), (0.01, 0.18)], dur=2200), fx('fadeout', ft, 2000, dur=500)]
            else:
                ow = s.pic('owl_sleep', 1560, 470, 300, 320, name='Owl (sleepy)', link=link(1), descr='sleepy owl: tap it'); auto.append(fx('scale', ow, 0, sx=102, sy=103, dur=1800, rev=True, repeat='inf'))
            if (m & 4) and last != 2: s.pic('pot_bloom', 1260, 640, 260, 364, name='Magic flower (open)', link=link(2))
            elif last == 2:
                pbud = s.pic('pot_bud', 1260, 640, 260, 364, name='Magic flower (bud)'); fl = s.pic('pot_bloom', 1260, 640, 260, 364, name='Magic flower (open)', hidden=True, link=link(2))
                auto += [fx('disappear', pbud, 150), fx('zoomin', fl, 150, dur=450), fx('scale', fl, 600, sx=108, sy=108, dur=300, rev=True, repeat=2)]
            else:
                fl = s.pic('pot_bud', 1260, 640, 260, 364, name='Magic flower (bud)', link=link(2), descr='flower bud: tap it'); auto.append(pulse(fl, 105, 1000))
            for b, (bx, by) in enumerate([(480, 330), (1710, 440), (1390, 610)]):          # syllable tags beside each clue
                self.tag(s, SYL[b], XI[b], bx, by, 220, 90, 40, RING[b], f'Clue syllable {b + 1}', link=link(b))
            if complete: s.pic('door_inner', *DOOR, name='Treasure room', descr='golden light behind the door')
            leaf = s.pic('door_closed', *DOOR, name='Magic door', descr='locked magic door')
            gem_ids = []
            for b in range(3):
                if (m >> b) & 1:
                    cx, cy = SOCK[b]
                    if last == b:
                        sx_, sy_ = START[b]; g = s.pic(GEMS[b], sx_ - 50, sy_ - 50, 100, 100, name='gem flying to the door', hidden=True)
                        auto += [snd(CLUE[b], 0), snd('gem', GEM_T[b]), fx('zoomin', g, GEM_T[b], dur=250), fx('move', g, GEM_T[b] + 250, dx=(cx - sx_) / 1920, dy=(cy - sy_) / 1080, dur=900)]
                    else:
                        g = s.pic(GEMS[b], cx - 50, cy - 50, 100, 100, name='gem in its socket'); auto.append(pulse(g, 108, 1100, 1800 + 200 * b))
                    gem_ids.append(g)
            lbx = lbox(470, 1010, 460)
            if last is None: tl = [('surprised', 0), ('welcome', 900)]
            elif complete:
                T0 = max(GEM_T[last] + 1150, 2300) + 600; tl = [('surprised', 0), ('jump', 500), ('laughA', 1100), ('happyAgain', 2200), ('cheer', T0), ('welcome', T0 + 3000)]
            else: tl = [('surprised', 0), ('jump', 500), ('laughA', 1100), ('happyAgain', 2200)]
            ids, pe = pose_timeline(s, lbx, tl, h, self.pre); auto += pe
            if last is None: auto += [snd('portal_go', 0)] + hop(ids, 0, -0.06, 240, 2)
            else:
                pu = self.popup(s, SYL[last], XI[last])
                auto += hop(ids, 500, -0.07, 260, 2) + [snd('jump', 500), snd('syl', GEM_T[last] + 700), fx('zoomin', pu, GEM_T[last] + 600, dur=350), fx('fadeout', pu, GEM_T[last] + 2400, dur=500)]
            if complete:
                sb = s.pic('sparkle_burst', 610, 190, 700, 700, name='door sparkle', hidden=True)
                auto += [fx('zoomin', sb, T0 - 250, dur=350), fx('fadeout', sb, T0 + 350, dur=500), snd('door_open', T0), fx('move', leaf, T0, dx=-0.125, dy=0, dur=1800), fx('scale', leaf, T0, sx=8, sy=100, dur=1800), fx('disappear', leaf, T0 + 1800)]
                auto += [fx('fadeout', g, T0 + 600, dur=600) for g in gem_ids]
                cg = s.pic('glow', 740, 600, 440, 440, name='chest glow', hidden=True)
                chest = s.pic('chest_closed', 800, 690, 320, 261, name='Secret treasure chest: tap it', hidden=True, link=k('fin'), descr='treasure chest')
                auto += [fx('fadein', cg, T0 + 1500, dur=500), pulse(cg, 112, 1000, T0 + 2000), fx('zoomin', chest, T0 + 1500, dur=500), snd('key_appear', T0 + 1700), fx('spin', chest, T0 + 2100, deg=4, dur=250, rev=True, repeat='inf')]
            else:
                lk = s.hot(*DOOR, name='Locked door (tap)'); sad = s.pic(self.pre + 'oops', *lbx, name='Hero sad', hidden=True); final = ids[tl[-1][0]]
                s.on_click(lk, [snd(self.hero_sound('locked'), 0), fx('spin', leaf, 0, deg=3, dur=90, rev=True, repeat=3), fx('disappear', final, 700), fx('appear', sad, 700), snd('recover', 2000), fx('disappear', sad, 2100), fx('appear', final, 2100)] + [fx('move', final, 2100, dx=0, dy=-0.06, dur=220, rev=True, repeat=2)])
            s.on_load(auto)
        # ===== 7. TREASURE FINALE =====
        s = self.d.new(k('fin'), fade=True)
        s.pic('bg_treasure', 0, 0, 1920, 1080, descr='Glowing treasure cave')
        gl = s.pic('glow', 410, -40, 1100, 1100, name='treasure glow', hidden=True)
        cc = s.pic('chest_closed', 560, 400, 800, 652, name='Treasure chest (closed)'); co = s.pic('chest_open', 560, 400, 800, 652, name='Treasure chest (open)', hidden=True)
        tl = [('crouch', 0), ('jump', 1000)] + [('danceA' if n % 2 == 0 else 'danceB', 1700 + n * 300) for n in range(14)] + [('laughA', 5900), ('cheer', 6300), ('bye', 7200), ('byeB', 7650), ('bye', 8100), ('byeB', 8550), ('bye', 9000)]
        ids, pe = pose_timeline(s, lbox(320, 1020, 560), tl, h, self.pre)
        auto = pe + [snd('chest_open', 0), fx('spin', cc, 0, deg=4, dur=110, rev=True, repeat=5), fx('disappear', cc, 1000), fx('appear', co, 1000), fx('fadein', gl, 1000, dur=500), pulse(gl, 106, 1300, 1500), fx('scale', co, 1000, sx=106, sy=106, dur=250, rev=True)]
        auto += hop(ids, 1000, -0.1, 300, 2) + [snd('jump', 1000, 80), snd(self.hero_sound('celebrate'), 2800), snd(self.hero_sound('bye'), 7200)]
        sb = s.pic('sparkle_burst', 480, 120, 960, 960, name='treasure sparkles', hidden=True)
        auto += [fx('zoomin', sb, 1000, dur=400), fx('fadeout', sb, 1700, dur=600)]
        for nm_, x, y, t in [('fw_a', 40, 40, 1500), ('fw_b', 1340, 20, 1900), ('fw_c', 700, -60, 2300), ('fw_a', 1300, 480, 3300), ('fw_b', 60, 420, 3700)]:
            f = s.pic(nm_, x, y, 560, 560, name='firework', hidden=True); auto += [fx('zoomin', f, t, dur=450), fx('scale', f, t + 450, sx=118, sy=118, dur=700), fx('fadeout', f, t + 800, dur=600)]
        for n, t in enumerate([1000, 2600, 4200]):
            c = s.pic('confetti', 360, -720, 1200, 700, name='confetti'); auto.append(fx('move', c, t, dx=0, dy=1.7, dur=3800))
        # the three treasure syllables rise from the chest, then the letters of this chapter rain down
        for b, (L3, xi, x) in enumerate([(ex_begin, 0, 1000), (ex_mid, 1, 760), (ex_end, 1, 520)]):
            tg = s.shp('ROUNDED_RECTANGLE', x + 160, 130 + b * 130, 360, 112, fill='FFFBE3', line='F2B134', lw=5, rect_r=.3, text=runs(L3, xi), fs=56, name=f'Treasure syllable {b + 1}', hidden=True)
            auto += [fx('zoomin', tg, 2200 + b * 600, dur=400, sound='syl'), fx('fadeout', tg, 7000, dur=500)]
        rain = [X] + B + [m_[0] for m_ in M]
        for n, ch in enumerate(rain):
            col = ['FFC93C', '7DF9FF', 'FF9EC4', 'B8F2A1'][n % 4]
            lt = s.shp('RECTANGLE', 60 + (n * 211) % 1800 - 75, -170, 150, 150, text=ar(ch), fs=64, color=col, name=f'Falling letter {ch}')
            auto.append(fx('move', lt, 3000 + n * 260, dx=((-1) ** n) * 0.02, dy=1.4, dur=3400))
        rp = s.pic('portal', 1480, 690, 340, 340, name='Next adventure' if nxt != k('wake') else 'Play again', hidden=True, link=nxt, descr='glowing portal')
        auto += [fx('zoomin', rp, 9300, dur=600), spin_loop(rp, 8000, 9900), snd('portal_in', 9300)]
        s.on_load(auto)

    def build(self):
        for ci, X in enumerate(self.members):
            nxt = f'c{ci + 1}_wake' if ci + 1 < len(self.members) else 'c0_wake'
            self.chapter(ci, X, nxt)
        cp = self.d.prs.core_properties; cp.title = f'Fatha adventure {self.file}'; cp.author = 'Claude'
        return len(self.d.slides)

if __name__ == '__main__':
    out = sys.argv[1]; only = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith('--') else None
    K.PREVIEW = 'start' if '--preview' in sys.argv else False
    os.makedirs(out, exist_ok=True)
    for cfg in DECKS:
        if only and cfg[0] != only: continue
        a = Adventure(cfg); n = a.build(); a.d.save(os.path.join(out, cfg[0] + '.pptx')); print(cfg[0], cfg[2], n, 'slides')
