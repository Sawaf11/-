import sys, os, random
import pptx_kit as K
from pptx_kit import fx, snd, lbox, pose_timeline, hop

AR = False
FATHA = '\u064E'
RING = ['E8604C', '3A8FD9', '2FB57A']          # ring colours used in the earlier fathah decks
def ar(ch): return ch + FATHA
def badge(s, ch, cx, cy, d, i=0, **kw):
    return s.letter(ar(ch), cx, cy, d, ring=RING[i % 3], **kw) if AR else None
def with_none(effs): return [e for e in effs if e is not None and e.get('sp', 1) is not None or e.get('kind') == 'sound']

def pulse(sp, sx=112, dur=900, t=0): return fx('scale', sp, t, sx=sx, sy=sx, dur=dur, rev=True, repeat='inf')
def bob(sp, dy=-0.02, dur=1400, t=0): return fx('move', sp, t, dx=0, dy=dy, dur=dur, rev=True, repeat='inf')
def sway(sp, dx=0.006, dy=-0.02, dur=2400, t=0): return fx('move', sp, t, dx=dx, dy=dy, dur=dur, rev=True, repeat='inf')
def spin_loop(sp, dur=9000, t=0): return fx('spin', sp, t, deg=360, dur=dur, repeat='inf')
def fireflies(s, n, rng, area=(100, 150, 1700, 700)):
    out = []
    for i in range(n):
        x, y = rng.uniform(area[0], area[0] + area[2]), rng.uniform(area[1], area[1] + area[3])
        sp = s.pic('dust', x, y, 56, 56, name='firefly', descr='glowing firefly')
        out.append(fx('move', sp, rng.randint(0, 1500), path=[(0.02, -0.03), (-0.012, -0.06), (0.018, -0.02), (0, 0)], dur=rng.randint(6000, 10000), repeat='inf'))
        out.append(pulse(sp, 130, rng.randint(700, 1400), rng.randint(0, 800)))
    return out
CX = lambda x, w: x + w / 2

def build(deck):
    rng = random.Random(5)
    # ================= 1. WAKE UP LUMI =================
    s = deck.new('wake'); s.add_music('music_loop')
    s.pic('bg_night', 0, 0, 1920, 1080, descr='Moonlit meadow with a cosy nest')
    cue = s.pic('glow', 630, 290, 660, 660, name='click-me glow', descr='gentle glow around sleeping Lumi')
    zzz = s.pic('zzz', 1150, 250, 200, 230, descr='snoring Zs')
    box = lbox(960, 940, 640)
    tl = [('sleep', 0), ('stir', 300), ('yawn', 1000), ('jump', 1700), ('surprised', 2300), ('laughA', 3000), ('laughB', 3250), ('laughA', 3500), ('laughB', 3750),
          ('welcome', 4100), ('waveA', 4700), ('waveB', 5100), ('waveA', 5500), ('waveB', 5900), ('waveA', 6300)]
    ids, pe = pose_timeline(s, box, tl)
    portal = s.pic('portal', 1380, 560, 420, 420, name='Magic portal to the forest', hidden=True, link='f0', descr='glowing magic portal')
    hot = s.hot(690, 340, 540, 600, 'Tap Lumi to wake him')
    s.on_load([pulse(cue, 108, 1300), bob(zzz, -0.03, 1600), fx('scale', ids['sleep'], 0, sx=102, sy=104, dur=1700, rev=True, repeat='inf')] + fireflies(s, 7, rng, (60, 80, 1800, 600)))
    s.on_click(hot, pe + [snd('wake_up', 0), fx('fadeout', zzz, 0, dur=400), fx('fadeout', cue, 0, dur=500),
                           fx('move', ids['jump'], 1700, dx=0, dy=-0.1, dur=300, rev=True, repeat=2),
                           fx('move', ids['surprised'], 2300, dx=0, dy=-0.04, dur=200, rev=True),
                           snd('portal_in', 5300), fx('fadein', portal, 5300, dur=700), spin_loop(portal, 8000, 5300)], restart='never')

    # ================= 2. MAGIC STAR HUNT (32 states) =================
    STAR = [(190, 150), (1540, 70), (880, 400), (1150, 790), (1650, 600)]
    for m in range(32):
        k = bin(m).count('1')
        s = deck.new(f'f{m}', fade=(m == 0))
        s.pic('bg_forest', 0, 0, 1920, 1080, descr='Magical forest full of hiding places')
        auto = fireflies(s, 5, rng)
        for b, (x, y) in enumerate(STAR):
            if not (m >> b) & 1:
                sp = s.pic('star_gold', x, y, 170, 170, name=f'Hidden star {b + 1}', link=f'f{m | (1 << b)}', descr='sparkling star to collect')
                auto += [pulse(sp, 118, 800 + 130 * b, 100 * b), fx('spin', sp, 0, deg=14, dur=1800 + 200 * b, rev=True, repeat='inf')]
                if AR:
                    bd = s.letter(ar('أبتثج'[b]), x + 85, y + 100, 84, ring=RING[b % 3], fs=34, name=f'Star letter {b + 1}', link=f'f{m | (1 << b)}')
                    auto.append(pulse(bd, 118, 800 + 130 * b, 100 * b))
        s.pic(f'hud_{k}', 610, 24, 700, 130, name=f'Star counter {k} of 5', descr=f'{k} of 5 stars collected')
        if AR:
            got = [bt for bt in range(5) if (m >> bt) & 1]
            for j, bt in enumerate(got): s.letter(ar('أبتثج'[bt]), 610 + 90 + j * 130, 24 + 70, 80, plain=True, fs=30, name=f'Collected letter {bt + 1}')
        lb = lbox(560, 1000, 470)
        if k == 5:
            tl = [('cheer', 0), ('flyUp', 1400), ('fly', 1700), ('flyUp', 2000), ('fly', 2300), ('flyUp', 2600), ('fly', 2900), ('flyUp', 3200), ('fly', 3500)]
        elif k == 0:
            tl = [('surprised', 0), ('lookUp', 800)]
        else:
            tl = [('cheer', 0), ('lookUp', 1700)]
        ids, pe = pose_timeline(s, lb, tl)
        auto += pe
        if k == 0: auto += [snd('portal_go', 0)]
        else:
            auto += hop(ids, 0, -0.08, 280, 2) + [snd('jump', 0, 70)]
            cx, cy = 610 + 90 + (k - 1) * 130, 24 + 65
            b = s.pic('sparkle_burst', cx - 150, cy - 150, 300, 300, name='star sparkle', hidden=True)
            auto += [snd('star_all' if k == 5 else f'star_{k}', 0), fx('zoomin', b, 0, dur=300), fx('fadeout', b, 600, dur=600)]
        if k == 5:
            conf = s.pic('confetti', 360, -720, 1200, 700, name='confetti', descr='falling confetti')
            auto += [fx('move', conf, 100, dx=0, dy=1.6, dur=3600)]
            gl = s.pic('glow', 1000, 200, 760, 760, name='portal glow', hidden=True)
            pt = s.pic('portal', 1120, 320, 520, 520, name='Magic portal to the balloon sky', hidden=True, link='balloons', descr='glowing portal to the sky')
            auto += [fx('fadein', gl, 1900, dur=700), fx('zoomin', pt, 1900, dur=700), spin_loop(pt, 8000, 2700), pulse(gl, 112, 1100, 2700)]
        s.on_load(auto)

    # ================= 3. POP THE BALLOONS =================
    s = deck.new('balloons', fade=True)
    s.pic('bg_sky', 0, 0, 1920, 1080, descr='Sunny sky with a rainbow')
    BAL = [('red', 90, 60, 'r_bird'), ('blue', 320, 250, 'r_butterfly'), ('green', 560, 70, 'r_rainbow'), ('yellow', 60, 440, 'r_star'),
           ('pink', 1180, 70, 'r_heart'), ('purple', 1420, 260, 'r_flower'), ('orange', 1650, 60, 'r_ladybug')]
    lb = lbox(960, 1030, 460)
    lids, lpe = pose_timeline(s, lb, [('fly', 0), ('flyUp', 300), ('fly', 600), ('welcome', 900)])
    auto = lpe + [snd('portal_go', 0)]
    gl = s.pic('glow', 730, -20, 460, 460, name='golden balloon glow')
    gold = s.pic('balloon_gold', 810, 40, 300, 500, name='Golden balloon with food basket', link='feed', descr='golden balloon carrying a basket of treats')
    auto += [pulse(gl, 112, 1200), sway(gold, 0.004, -0.015, 2600)]
    pops = []
    for n, (col, x, y, rew) in enumerate(BAL):
        bal = s.pic(f'balloon_{col}', x, y, 180, 360, name=f'{col} balloon', descr=f'{col} balloon')
        cx, cy = x + 90, y + 130
        bd = badge(s, 'حخدذرزس'[n], cx, y + 120, 96, n, name=f'Balloon letter {n + 1}')
        bigl = badge(s, 'حخدذرزس'[n], cx, cy - 80, 250, n, name='big letter', hidden=True) if AR else None
        burst = s.pic(f'burst_{col}', cx - 150, cy - 150, 300, 300, name='pop burst', hidden=True)
        rw, rh = {'r_bird': (210, 178), 'r_butterfly': (230, 184), 'r_rainbow': (330, 188), 'r_star': (180, 180), 'r_heart': (170, 170), 'r_flower': (170, 212), 'r_ladybug': (150, 125)}[rew]
        img = 'star_gold' if rew == 'r_star' else ('heart_pink' if rew == 'r_heart' else rew)
        r = s.pic(img, cx - rw / 2, cy - rh / 2, rw, rh, name='surprise reward', hidden=True, descr='surprise reward')
        auto.append(sway(bal, 0.005 * (1 if n % 2 else -1), -0.02, 2200 + 300 * n, 150 * n))
        hs = s.hot(x, y, 180, 270, f'pop {col} balloon')
        eff = [snd(f'pop_{n + 1}', 0), fx('disappear', bal, 0), fx('zoomin', burst, 0, dur=120), fx('scale', burst, 120, sx=130, sy=130, dur=220), fx('fadeout', burst, 300, dur=300),
               fx('zoomin', r, 80, dur=350)]
        if rew == 'r_bird': eff += [fx('move', r, 450, dx=0.5, dy=-0.25, dur=2200), fx('fadeout', r, 2300, dur=500)]
        if rew == 'r_butterfly': eff += [fx('move', r, 450, path=[(0.05, -0.1), (-0.03, -0.2), (0.07, -0.3), (0.0, -0.42)], dur=3000), fx('fadeout', r, 3000, dur=500)]
        if rew == 'r_rainbow': eff += [fx('scale', r, 450, sx=150, sy=150, dur=1400), fx('fadeout', r, 1700, dur=700)]
        if rew == 'r_star': eff += [fx('spin', r, 450, deg=720, dur=1800), fx('move', r, 450, dx=0.05, dy=-0.35, dur=1800), fx('fadeout', r, 1600, dur=500)]
        if rew == 'r_heart': eff += [fx('move', r, 450, dx=0.0, dy=-0.4, dur=2000), fx('scale', r, 450, sx=160, sy=160, dur=2000), fx('fadeout', r, 1700, dur=500)]
        if rew == 'r_flower': eff += [fx('scale', r, 450, sx=140, sy=140, dur=700, rev=True, repeat=2), fx('fadeout', r, 2200, dur=500)]
        if rew == 'r_ladybug': eff += [fx('move', r, 450, path=[(0.06, 0.04), (0.12, -0.02), (0.2, 0.05)], dur=2400), fx('fadeout', r, 2200, dur=500)]
        eff += hop(lids, 100, -0.06, 220, 2)
        if AR: eff += [fx('disappear', bd, 0), fx('zoomin', bigl, 150, dur=350), fx('move', bigl, 500, dx=0, dy=-0.12, dur=1500), fx('fadeout', bigl, 1700, dur=500)]
        pops.append((hs, eff))
    for hs, eff in pops: s.on_click(hs, eff)
    s.on_load(auto)

    # ================= 4. FEED THE BABY DRAGON =================
    FOODS = [('apple', 'munch'), ('cupcake', 'cake'), ('banana', 'munch'), ('melon', 'munch'), ('lemon' if AR else 'broccoli', 'veg'), ('chili', 'chili')]
    FLET = dict(apple='ت', cupcake='ك', banana='م', melon='ب', lemon='ل', chili='ف')   # first letter of the Arabic word
    FX_ = lambda i: 150 + i * 290
    mouth = (960, 511)
    for variant in [None] + [f[0] for f in FOODS]:
        s = deck.new('feed' if variant is None else f'feed_{variant}', fade=(variant is None))
        s.pic('bg_feed', 0, 0, 1920, 1080, descr='Picnic blanket in a sunny meadow')
        fb = lbox(960, 770, 620)
        auto = []
        foods = {}
        for i, (nm, kind) in enumerate(FOODS):
            if nm == variant:
                foods[nm] = s.pic(f'food_{nm}', FX_(i), 790, 230, 230, name=f'{nm} (flying to Lumi)', descr=nm)
                fbd = badge(s, FLET[nm], FX_(i) + 190, 825, 84, i, name='food letter') if AR else None
            else:
                foods[nm] = s.pic(f'food_{nm}', FX_(i), 790, 230, 230, name=f'Feed {nm}', link=f'feed_{nm}', hidden=(variant is None), descr=f'{nm} to feed Lumi')
                auto.append(pulse(foods[nm], 108, 800 + 100 * i, 120 * i))
                if AR:
                    fb_ = badge(s, FLET[nm], FX_(i) + 190, 825, 84, i, name=f'food letter {nm}', link=f'feed_{nm}', hidden=(variant is None))
                    auto.append(pulse(fb_, 108, 800 + 100 * i, 120 * i))
                    if variant is None: auto.append(fx('zoomin', fb_, 700 + 180 * i, dur=350))
        if variant is None:
            tl = [('surprised', 0), ('wait', 900)]
            ids, pe = pose_timeline(s, fb, tl)
            auto += pe + hop(ids, 0, -0.07, 260, 2) + [snd('pop_gold', 0), snd('feed_wait', 1500)]
            for i, (nm, kind) in enumerate(FOODS): auto.append(fx('zoomin', foods[nm], 700 + 180 * i, dur=350))
        else:
            kind = dict(FOODS)[variant]; i = [f[0] for f in FOODS].index(variant)
            cxm = (FX_(i) + 115, 905)
            dx, dy = (mouth[0] - cxm[0]) / 1920, (mouth[1] - cxm[1]) / 1080
            munch = [('chewA', 450), ('chewB', 670), ('chewA', 890), ('chewB', 1110), ('chewA', 1330)]
            if kind == 'munch': tl = [('wait', 0)] + munch + [('yum', 1500), ('yummy', 2500)]; end = 2700; sound = 'feed_munch'
            if kind == 'cake': tl = [('wait', 0), ('chewA', 450), ('chewB', 670), ('chewA', 890), ('yum', 1100), ('yummy', 1800)]; end = 2000; sound = 'feed_cake'
            if kind == 'veg': tl = [('wait', 0), ('chewA', 450), ('chewB', 670), ('yuck', 1000), ('chewA', 1700), ('chewB', 1950), ('happyAgain', 2300)]; end = 2600; sound = 'feed_veg'
            if kind == 'chili': tl = [('wait', 0), ('chewA', 450), ('chewB', 670), ('hot', 900), ('fire', 1800), ('hot', 3100), ('yummy', 3300)]; end = 3600; sound = 'feed_chili'
            ids, pe = pose_timeline(s, fb, tl)
            if AR:
                auto += [fx('move', fbd, 0, dx=dx, dy=dy, dur=450), fx('scale', fbd, 0, sx=35, sy=35, dur=450), fx('disappear', fbd, 450)]
                tl_big = {'munch': 1500, 'cake': 1100, 'veg': 2300, 'chili': 3300}[kind]
                bl = badge(s, FLET[variant], 1400, 330, 300, i, name='big letter', hidden=True)
                auto += [fx('zoomin', bl, tl_big, dur=400), fx('scale', bl, tl_big + 400, sx=108, sy=108, dur=500, rev=True, repeat=2), fx('fadeout', bl, tl_big + 1800, dur=500)]
            auto += pe + [snd(sound, 0), fx('move', foods[variant], 0, dx=dx, dy=dy, dur=450), fx('scale', foods[variant], 0, sx=35, sy=35, dur=450), fx('spin', foods[variant], 0, deg=360, dur=450), fx('disappear', foods[variant], 450)]
            if kind in ('munch', 'cake'):
                sb = s.pic('sparkle_burst', 710, 180, 500, 500, name='yummy sparkles', hidden=True)
                auto += [fx('zoomin', sb, 1500 if kind == 'munch' else 1100, dur=300), fx('fadeout', sb, 2300 if kind == 'munch' else 1900, dur=500)]
            if kind == 'veg':
                auto += hop(ids, 2000, -0.05, 200, 1)
                sw = s.pic('sweat', 1130, 270, 60, 84, name='sweat drop', hidden=True)
                auto += [fx('zoomin', sw, 1000, dur=200), fx('move', sw, 1200, dx=0, dy=0.1, dur=700), fx('fadeout', sw, 1700, dur=300)]
            if kind == 'chili':
                fl = s.pic('flame', 975, 331, 620, 360, name='Lumi breathes fire', hidden=True, descr='funny flame')
                p1 = s.pic('puff', 1120, 250, 180, 144, name='smoke puff', hidden=True); p2 = s.pic('puff', 1260, 190, 150, 120, name='smoke puff', hidden=True)
                auto += [fx('zoomin', fl, 1800, dur=300), fx('scale', fl, 2100, sx=112, sy=112, dur=250, rev=True, repeat=3), fx('fadeout', fl, 3000, dur=350),
                         fx('zoomin', p1, 3050, dur=250), fx('move', p1, 3050, dx=0.05, dy=-0.15, dur=1200), fx('fadeout', p1, 3600, dur=600),
                         fx('zoomin', p2, 3250, dur=250), fx('move', p2, 3250, dx=0.07, dy=-0.12, dur=1200), fx('fadeout', p2, 3700, dur=600)]
                auto += hop(ids, 900, -0.04, 150, 3)
            ht = s.pic('heart_big', 1560, 40, 280, 280, name='Magic heart: tap for a hug', hidden=True, link='hug', descr='glowing magic heart')
            auto += [fx('zoomin', ht, end, dur=500), pulse(ht, 115, 700, end + 500)]
            if AR:
                hb = badge(s, 'ح', 1700, 175, 100, 0, name='Heart letter', hidden=True, link='hug')
                auto += [fx('zoomin', hb, end, dur=500), pulse(hb, 115, 700, end + 500)]
        s.on_load(auto)

    # ================= 5. THE MAGIC HUG =================
    s = deck.new('hug', fade=True)
    s.pic('bg_hug', 0, 0, 1920, 1080, descr='Sunset meadow')
    small = lbox(560, 800, 360); big = lbox(960, 1050, 900)
    glow = s.pic('glow', 410, 130, 1100, 1100, name='warm hug glow', hidden=True)
    pi = s.pic('lumi_idle', *small, name='Lumi (far away)', descr='Lumi waiting')
    ps = s.pic('lumi_surprised', *small, name='Lumi surprised', hidden=True)
    po = s.pic('lumi_hugOpen', *small, name='Lumi running with open arms', hidden=True)
    pb = s.pic('lumi_hug', *big, name='Lumi hugging (close-up)', hidden=True)
    heart = s.pic('heart_big', 1170, 470, 520, 520, name='Big glowing heart', descr='big glowing heart: tap it')
    hbd = badge(s, 'ح', 1430, 750, 190, 0, name='Heart letter')
    hhot = s.hot(1230, 540, 400, 400, 'Tap the heart')
    key = s.pic('key', 1330, 120, 320, 200, name='Heart key to the secret door', hidden=True, link='d0_n', descr='golden heart key')
    s.on_load([pulse(heart, 108, 800)] + ([pulse(hbd, 108, 800)] if AR else []) + [fx('scale', pi, 0, sx=102, sy=103, dur=1500, rev=True, repeat='inf'), snd('lumi_tap', 300)] + fireflies(s, 6, rng, (60, 100, 1800, 600)))
    eff = [snd('hug_sequence', 0), fx('scale', heart, 0, sx=130, sy=130, dur=300, rev=True)] + ([fx('scale', hbd, 0, sx=130, sy=130, dur=300, rev=True)] if AR else []) + [ fx('disappear', pi, 0), fx('appear', ps, 0), fx('move', ps, 0, dx=0, dy=-0.05, dur=250, rev=True),
           fx('disappear', ps, 700), fx('appear', po, 700),
           fx('move', po, 700, dx=(960 - 560) / 1920, dy=((big[1] + 450) - (small[1] + 180)) / 1080, dur=1300), fx('scale', po, 700, sx=250, sy=250, dur=1300),
           fx('disappear', po, 2000), fx('appear', pb, 2000), fx('fadein', glow, 2000, dur=700), pulse(glow, 106, 1200, 2700),
           fx('scale', pb, 3000, sx=104, sy=104, dur=500, rev=True, repeat=3)]
    for n in range(8):
        sz = 110 + (n % 3) * 40; x0 = 640 + (n * 137) % 600; y0 = 430 + (n * 71) % 200
        h = s.pic('heart_pink', x0, y0, sz, sz, name='floating heart', hidden=True, descr='floating heart')
        t0 = 2200 + n * 230
        eff += [fx('zoomin', h, t0, dur=250), fx('move', h, t0, dx=((-1) ** n) * (0.04 + 0.02 * n % 5) / 1, dy=-0.5, dur=2300), fx('fadeout', h, t0 + 1800, dur=500)]
    eff += [fx('zoomin', key, 3900, dur=500), snd('key_appear', 3900), bob(key, -0.025, 1200, 4400), spin_loop(key, 100000, 4400) if False else pulse(key, 108, 900, 4400)]
    s.on_click(hhot, eff, restart='never')

    # ================= 6. THE SECRET DOOR (13 states) =================
    DOOR = (700, 160, 520, 760); SOCK = [(830, 460), (960, 460), (1090, 460)]
    NAME = {None: 'n', 0: 'L', 1: 'O', 2: 'F'}
    START = [(330, 360), (1710, 560), (1390, 700)]            # where each gem starts flying from
    GEMS = ['gem_red', 'gem_blue', 'gem_green']
    GEM_T = {0: 700, 1: 1500, 2: 900}
    CLUE_SND = {0: 'lantern', 1: 'owl', 2: 'flower'}
    states = [(0, None)] + [(m, b) for m in range(1, 8) for b in range(3) if (m >> b) & 1]
    for m, last in states:
        s = deck.new(f'd{m}_{NAME[last]}', fade=(m == 0))
        s.pic('bg_door', 0, 0, 1920, 1080, descr='Ancient stone wall with a magic door')
        auto = fireflies(s, 5, rng, (60, 100, 1800, 600))
        complete = (m == 7)
        link = lambda b: f'd{m | (1 << b)}_{NAME[b]}' if not (m >> b) & 1 else f'd{m}_{NAME[b]}'
        # lantern
        if (m & 1) and last != 0: lant = s.pic('lantern_on', 110, 120, 440, 640, name='Lantern (lit)', link=link(0), descr='glowing lantern')
        elif last == 0:
            loff = s.pic('lantern_off', 220, 160, 220, 400, name='Lantern (dark)', descr='dark lantern')
            lant = s.pic('lantern_on', 110, 120, 440, 640, name='Lantern (lit)', hidden=True, link=link(0), descr='glowing lantern')
            auto += [fx('disappear', loff, 300), fx('fadein', lant, 300, dur=300)]
            auto += [fx('scale', lant, 700, sx=108, sy=108, dur=350, rev=True, repeat=2)]
        else:
            lant = s.pic('lantern_off', 220, 160, 220, 400, name='Lantern (dark)', link=link(0), descr='dark lantern: tap it')
            auto.append(fx('spin', lant, 0, deg=4, dur=1500, rev=True, repeat='inf'))
        # owl
        if (m & 2) and last != 1: ow = s.pic('owl_awake', 1560, 470, 300, 320, name='Owl (awake)', link=link(1), descr='owl')
        elif last == 1:
            osl = s.pic('owl_sleep', 1560, 470, 300, 320, name='Owl (sleepy)', descr='sleepy owl')
            ow = s.pic('owl_awake', 1560, 470, 300, 320, name='Owl (awake)', hidden=True, link=link(1), descr='owl')
            ft = s.pic('feather', 1650, 760, 60, 120, name='falling feather', hidden=True)
            auto += [fx('disappear', osl, 250), fx('appear', ow, 250), fx('move', ow, 250, dx=0, dy=-0.04, dur=220, rev=True, repeat=2),
                     fx('zoomin', ft, 500, dur=200), fx('move', ft, 500, path=[(0.02, 0.06), (-0.02, 0.12), (0.01, 0.18)], dur=2200), fx('fadeout', ft, 2000, dur=500)]
        else:
            ow = s.pic('owl_sleep', 1560, 470, 300, 320, name='Owl (sleepy)', link=link(1), descr='sleepy owl: tap it')
            auto.append(fx('scale', ow, 0, sx=102, sy=103, dur=1800, rev=True, repeat='inf'))
        # flower
        if (m & 4) and last != 2: fl = s.pic('pot_bloom', 1260, 640, 260, 364, name='Magic flower (open)', link=link(2), descr='magic flower')
        elif last == 2:
            pbud = s.pic('pot_bud', 1260, 640, 260, 364, name='Magic flower (bud)', descr='flower bud')
            fl = s.pic('pot_bloom', 1260, 640, 260, 364, name='Magic flower (open)', hidden=True, link=link(2), descr='magic flower')
            auto += [fx('disappear', pbud, 150), fx('zoomin', fl, 150, dur=450), fx('scale', fl, 600, sx=108, sy=108, dur=300, rev=True, repeat=2)]
        else:
            fl = s.pic('pot_bud', 1260, 640, 260, 364, name='Magic flower (bud)', link=link(2), descr='flower bud: tap it')
            auto.append(pulse(fl, 105, 1000))
        if AR:
            for b, (ch, bx, by) in enumerate([('ف', 480, 330), ('ب', 1710, 440), ('ز', 1390, 610)]):
                s.letter(ar(ch), bx, by, 100, ring=RING[b], name=f'Clue letter {ch}', link=link(b))
        # door (inner + leaf)
        if complete: s.pic('door_inner', *DOOR, name='Treasure room behind the door', descr='golden light behind the door')
        leaf = s.pic('door_closed', *DOOR, name='Magic door', descr='locked magic door')
        # gems
        gem_ids = []
        for b in range(3):
            if (m >> b) & 1:
                cx, cy = SOCK[b]
                if last == b:
                    sx_, sy_ = START[b]
                    g = s.pic(GEMS[b], sx_ - 50, sy_ - 50, 100, 100, name='gem flying to the door', hidden=True, descr='magic gem')
                    auto += [snd(CLUE_SND[b], 0), snd('gem', GEM_T[b]), fx('zoomin', g, GEM_T[b], dur=250), fx('move', g, GEM_T[b] + 250, dx=(cx - sx_) / 1920, dy=(cy - sy_) / 1080, dur=900)]
                else:
                    g = s.pic(GEMS[b], cx - 50, cy - 50, 100, 100, name='gem in its socket', descr='magic gem')
                gem_ids.append(g)
                auto.append(pulse(g, 108, 1100, 1800 + 200 * b)) if last != b else None
        # Lumi
        lbx = lbox(470, 1005, 460)
        if last is None: tl = [('surprised', 0), ('welcome', 900)]
        elif complete:
            T0 = max(GEM_T[last] + 1150, 2300) + 600
            tl = [('surprised', 0), ('jump', 500), ('laughA', 1100), ('happyAgain', 2200), ('cheer', T0), ('proud', T0 + 3000)]
        else: tl = [('surprised', 0), ('jump', 500), ('laughA', 1100), ('happyAgain', 2200)]
        ids, pe = pose_timeline(s, lbx, tl)
        auto += pe
        if last is None: auto += [snd('portal_go', 0)] + hop(ids, 0, -0.06, 240, 2)
        else: auto += hop(ids, 500, -0.07, 260, 2) + [snd('jump', 500)]
        if complete:
            sb = s.pic('sparkle_burst', 610, 190, 700, 700, name='door sparkle', hidden=True)
            auto += [fx('zoomin', sb, T0 - 250, dur=350), fx('fadeout', sb, T0 + 350, dur=500), snd('door_open', T0),
                     fx('move', leaf, T0, dx=-0.125, dy=0, dur=1800), fx('scale', leaf, T0, sx=8, sy=100, dur=1800), fx('disappear', leaf, T0 + 1800)]
            auto += [fx('fadeout', g, T0 + 600, dur=600) for g in gem_ids]
            cg = s.pic('glow', 740, 600, 440, 440, name='chest glow', hidden=True)
            chest = s.pic('chest_closed', 800, 690, 320, 261, name='Secret treasure chest: tap it', hidden=True, link='finale', descr='treasure chest')
            auto += [fx('fadein', cg, T0 + 1500, dur=500), pulse(cg, 112, 1000, T0 + 2000), fx('zoomin', chest, T0 + 1500, dur=500), snd('key_appear', T0 + 1700), fx('spin', chest, T0 + 2100, deg=4, dur=250, rev=True, repeat='inf')]
        else:
            lk = s.hot(*DOOR, name='Locked door (tap)')
            sad = s.pic('lumi_sad', *lbx, name='Lumi sad', hidden=True, descr='Lumi looks sad')
            final = ids[tl[-1][0]]
            s.on_click(lk, [snd('door_locked', 0), fx('spin', leaf, 0, deg=3, dur=90, rev=True, repeat=3), fx('disappear', final, 700), fx('appear', sad, 700),
                            snd('recover', 2000), fx('disappear', sad, 2100), fx('appear', final, 2100)] + [fx('move', final, 2100, dx=0, dy=-0.06, dur=220, rev=True, repeat=2)])
        s.on_load(auto)

    # ================= 7. FINALE =================
    s = deck.new('finale', fade=True)
    s.pic('bg_treasure', 0, 0, 1920, 1080, descr='Glowing treasure cave')
    gl = s.pic('glow', 410, -40, 1100, 1100, name='treasure glow', hidden=True)
    cc = s.pic('chest_closed', 560, 400, 800, 652, name='Treasure chest (closed)', descr='treasure chest')
    co = s.pic('chest_open', 560, 400, 800, 652, name='Treasure chest (open)', hidden=True, descr='open treasure chest full of gold')
    lb = lbox(320, 1010, 560)
    tl = [('crouch', 0), ('jump', 1000)]
    for n in range(14): tl.append(('danceA' if n % 2 == 0 else 'danceB', 1700 + n * 300))
    tl += [('laughA', 5900), ('cheer', 6300), ('bye', 7200), ('byeB', 7650), ('bye', 8100), ('byeB', 8550), ('bye', 9000)]
    ids, pe = pose_timeline(s, lb, tl)
    auto = pe + [snd('chest_open', 0), fx('spin', cc, 0, deg=4, dur=110, rev=True, repeat=5), fx('disappear', cc, 1000), fx('appear', co, 1000), fx('fadein', gl, 1000, dur=500), pulse(gl, 106, 1300, 1500),
                 fx('scale', co, 1000, sx=106, sy=106, dur=250, rev=True)]
    auto += hop(ids, 1000, -0.1, 300, 2) + [snd('jump', 1000, 80)]
    sb = s.pic('sparkle_burst', 480, 120, 960, 960, name='treasure sparkles', hidden=True)
    auto += [fx('zoomin', sb, 1000, dur=400), fx('fadeout', sb, 1700, dur=600), snd('celebrate', 2800)]
    for name_, x, y, t in [('fw_a', 40, 40, 1500), ('fw_b', 1340, 20, 1900), ('fw_c', 700, -60, 2300), ('fw_a', 1300, 480, 3300), ('fw_b', 60, 420, 3700)]:
        f = s.pic(name_, x, y, 560, 560, name='firework', hidden=True, descr='firework')
        auto += [fx('zoomin', f, t, dur=450), fx('scale', f, t + 450, sx=118, sy=118, dur=700), fx('fadeout', f, t + 800, dur=600)]
    for n, t in enumerate([1000, 2600, 4200]):
        c = s.pic('confetti', 360, -720, 1200, 700, name='confetti', descr='falling confetti')
        auto.append(fx('move', c, t, dx=0, dy=1.7, dur=3800))
    auto += [snd('bye', 7200)]
    if AR:
        ALPHA = 'أبتثجحخدذرزسشصضطظعغفقكلمنهوي'
        for n, ch in enumerate(ALPHA):
            col = ['FFC93C', '7DF9FF', 'FF9EC4', 'B8F2A1'][n % 4]
            x = 60 + (n * 67) % 1800
            lt = s.letter(ar(ch), x, -140, 150, color=col, plain=True, fs=64, name=f'Falling letter {ch}')
            auto.append(fx('move', lt, 1800 + n * 170, dx=((-1) ** n) * 0.02, dy=1.4, dur=3400))
    rp = s.pic('portal', 1480, 690, 340, 340, name='Play again', hidden=True, link='wake', descr='glowing portal: play again')
    auto += [fx('zoomin', rp, 9300, dur=600), spin_loop(rp, 8000, 9900), snd('portal_in', 9300)]
    s.on_load(auto)
