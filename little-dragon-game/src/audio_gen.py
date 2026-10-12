"""Original synthesized audio for The Little Dragon's Magic World (numpy only).
Everything is generated from scratch: no third-party samples, no TTS (none installed).
Voices are *non-verbal* baby-dragon vocalisations built with a glottal source + formant filter."""
import numpy as np, wave, os, json
SR = 32000
rng = np.random.default_rng(7)
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'audio')
os.makedirs(OUT, exist_ok=True)

def t_(d): return np.arange(int(d * SR)) / SR
def env(n, a=0.01, r=0.05):
    e = np.ones(n); na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def adsr_exp(d, a=0.003, decay=6.0):
    t = t_(d); return np.minimum(1, t / a) * np.exp(-decay * t)
def sine(f, d, ph=0): return np.sin(2 * np.pi * f * t_(d) + ph)
def sweep(f0, f1, d, curve=1.0):
    t = t_(d); x = (t / d) ** curve; f = f0 + (f1 - f0) * x
    return np.sin(2 * np.pi * np.cumsum(f) / SR)
def noise(d): return rng.standard_normal(int(d * SR))
def onepole(x, a):
    # a may be array or scalar in (0,1): y += a*(x-y)
    y = np.zeros_like(x); s = 0.0
    a = np.broadcast_to(a, x.shape)
    for i in range(len(x)):
        s += a[i] * (x[i] - s); y[i] = s
    return y
def lowpass(x, fc): return onepole(x, 1 - np.exp(-2 * np.pi * fc / SR))
def highpass(x, fc): return x - lowpass(x, fc)
def mix(parts, total=None):
    end = max(int((t + len(s) / SR) * SR) for t, s in parts) + 1
    n = int(total * SR) if total else end
    out = np.zeros(n)
    for t, s in parts:
        i = int(t * SR); e = min(n, i + len(s))
        if i < n: out[i:e] += s[:e - i]
    return out
def norm(x, peak=0.7):
    m = np.max(np.abs(x)); return x * (peak / m) if m > 0 else x
def reverb(x, wet=0.25, tail=0.9):
    out = x.copy()
    for d, g in [(0.029, .5), (0.047, .4), (0.071, .33), (0.103, .25), (0.151, .18)]:
        k = int(d * SR); out = np.concatenate([out, np.zeros(k)]); out[k:k + len(x)] += wet * g * x
    return out[: len(x) + int(tail * SR * 0.25)]
def save(name, x, peak=0.7):
    x = norm(x, peak)
    n = len(x); fade = int(0.01 * SR); x[:fade] *= np.linspace(0, 1, fade); x[-fade:] *= np.linspace(1, 0, fade)
    with wave.open(os.path.join(OUT, name + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype('<i2').tobytes())
    return n / SR

# ---------- formant voice ----------
FORM = {'a': (850, 1250, 2800), 'e': (560, 2000, 2900), 'i': (330, 2500, 3300), 'o': (520, 950, 2700),
        'u': (350, 780, 2500), 'ae': (760, 1750, 2700), 'm': (260, 900, 2400)}
def voice(syl, gap=0.03, kid=1.35, breath=0.04):
    """syl: list of (vowel_a, vowel_b, f0_a, f0_b, dur, amp, vibrato_depth)"""
    parts = []; t = 0.0
    for (va, vb, f0a, f0b, d, amp, vib) in syl:
        n = int(d * SR); tt = np.arange(n) / SR
        f0 = np.linspace(f0a, f0b, n) * (1 + vib * np.sin(2 * np.pi * 6 * tt))
        ph = np.cumsum(f0) / SR
        src = 2 * (ph % 1) - 1                     # saw
        src = src + 0.6 * np.sin(2 * np.pi * ph)   # warm
        src += breath * rng.standard_normal(n)
        # STFT formant shaping
        N = 512; hop = 128; win = np.hanning(N)
        frames = []; freqs = np.fft.rfftfreq(N, 1 / SR)
        out = np.zeros(n + N)
        for s in range(0, n, hop):
            a = s / n
            fa, fb = FORM[va], FORM[vb]
            fm = [(x * (1 - a) + y * a) * kid for x, y in zip(fa, fb)]
            seg = np.zeros(N); chunk = src[s:s + N]; seg[:len(chunk)] = chunk
            sp = np.fft.rfft(seg * win)
            shape = sum(g / (1 + ((freqs - f) / (bw)) ** 2) for f, bw, g in zip(fm, (110, 160, 220), (1, .7, .35)))
            sp *= shape
            out[s:s + N] += np.fft.irfft(sp) * win
        y = out[:n] * env(n, 0.02, 0.05) * amp
        parts.append((t, y)); t += d + gap
    return norm(mix(parts), 0.8)

# ---------- sound building blocks ----------
def bell(f, d=1.4, bright=1.0):
    t = t_(d)
    x = (np.sin(2 * np.pi * f * t) * np.exp(-3.2 * t) + 0.45 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-6 * t) * bright +
         0.25 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-9 * t) * bright + 0.5 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-4 * t))
    return x * np.minimum(1, t / 0.002)
def sparkle(d=1.0, n=14, lo=2200, hi=5200, t0=0.0):
    parts = []
    for i in range(n):
        f = rng.uniform(lo, hi); st = t0 + rng.uniform(0, d * 0.8)
        parts.append((st, sine(f, 0.22) * adsr_exp(0.22, 0.002, 18) * rng.uniform(.3, 1)))
    return mix(parts, d + 0.3)
def whoosh(d=0.7, f0=400, f1=3000, peak=0.5, down=False):
    n = noise(d); t = t_(d); x = t / d
    a = 1 - np.exp(-2 * np.pi * np.linspace(f0, f1, len(t)) / SR) if not down else 1 - np.exp(-2 * np.pi * np.linspace(f1, f0, len(t)) / SR)
    y = onepole(n, a)
    e = np.sin(np.pi * x) ** 1.5
    return y * e * peak * 4
def pop(pitch=1.0, d=0.35):
    n = int(d * SR); t = np.arange(n) / SR
    burst = highpass(noise(d), 1500) * np.exp(-60 * t)
    thump = np.sin(2 * np.pi * np.cumsum(np.linspace(300, 70, n) * pitch) / SR) * np.exp(-25 * t)
    return np.concatenate([np.zeros(int(0.012 * SR)), burst * 0.9 + thump * 1.1])
def boing(f=320, d=0.5, depth=0.25):
    t = t_(d); f_t = f * (1 + depth * np.sin(2 * np.pi * 14 * t) * np.exp(-6 * t)) * (1 + 0.5 * np.exp(-9 * t))
    return np.sin(2 * np.pi * np.cumsum(f_t) / SR) * np.exp(-5 * t) * np.minimum(1, t / .004)
def thud(f=90, d=0.18): t = t_(d); return np.sin(2 * np.pi * f * t) * np.exp(-28 * t) + 0.3 * lowpass(noise(d), 400) * np.exp(-40 * t)
def step(d=0.14, bright=1.0): t = t_(d); return lowpass(noise(d), 900 * bright) * np.exp(-35 * t) * 2
def crunch(d=0.09):
    t = t_(d); return highpass(noise(d), 1200) * np.exp(-45 * t) * 1.2 + lowpass(noise(d), 500) * np.exp(-30 * t)
def chime_chord(freqs, d=2.5, atk=0.35):
    t = t_(d); x = 0
    for f in freqs: x = x + np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t + 1) + 0.12 * np.sin(2 * np.pi * 3 * f * t)
    e = np.minimum(1, t / atk) * np.exp(-1.1 * np.maximum(0, t - atk))
    return x * e
def coins(d=1.6, n=36):
    parts = []
    for i in range(n):
        st = rng.uniform(0, d * 0.85); f = rng.uniform(2800, 5600)
        parts.append((st, (sine(f, .18) + .5 * sine(f * 1.5, .18)) * adsr_exp(.18, .001, 22) * rng.uniform(.3, 1)))
    return mix(parts, d + .3)
def creak(d=1.4, f0=70, f1=180):
    t = t_(d); f = f0 + (f1 - f0) * (t / d) ** 2 + 6 * np.sin(2 * np.pi * 9 * t)
    saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    y = lowpass(saw, 700) * (0.6 + 0.4 * np.sin(2 * np.pi * 5 * t)) * np.sin(np.pi * t / d) ** 0.7
    return y + lowpass(noise(d), 300) * 0.3 * np.sin(np.pi * t / d)
def pad(freqs, d, atk=.6, rel=.8, vib=0.004):
    t = t_(d); x = 0
    for f in freqs:
        for det in (0.997, 1.0, 1.003):
            x = x + np.sin(2 * np.pi * f * det * t + 0.3 * np.sin(2 * np.pi * 4.5 * t)) / 3
    return x * np.minimum(1, t / atk) * np.minimum(1, (d - t) / rel)
def clap(): return highpass(noise(.12), 900) * np.exp(-40 * t_(.12))

NOTE = lambda n: 440 * 2 ** ((n - 69) / 12)
PENT = [72, 74, 76, 79, 81, 84]  # C5 D5 E5 G5 A5 C6

durations = {}
def out(name, x, peak=0.7): durations[name] = round(save(name, x, peak), 2)

# ===== VOICES =====
V_yawn  = voice([('a', 'o', 300, 420, .9, 1, .01), ('o', 'u', 420, 280, .6, .8, .02)], gap=.02, breath=.15)
V_eep   = voice([('i', 'e', 700, 1000, .22, 1, .0)])
V_hello = voice([('i', 'a', 650, 760, .2, 1, .01), ('i', 'a', 700, 900, .32, 1, .015)], gap=.1)
V_giggle= voice([('i', 'e', 820, 900, .09, 1, 0), ('i', 'e', 780, 880, .09, .9, 0)] * 3, gap=.05)
V_laugh = voice([('a', 'ae', 520 - 25 * i, 470 - 25 * i, .13, 1 - .08 * i, .02) for i in range(6)], gap=.07)
V_surp  = voice([('o', 'a', 420, 980, .38, 1, .0)])
V_yay   = voice([('a', 'e', 560, 640, .25, 1, 0), ('a', 'e', 640, 900, .6, 1, .02)], gap=.04)
V_aww   = voice([('o', 'a', 720, 520, .55, 1, .03), ('o', 'u', 520, 360, .55, .8, .04)], gap=.0)
V_coo   = voice([('m', 'u', 430, 520, .35, .9, .01), ('a', 'o', 560, 480, .8, 1, .03)], gap=.02, breath=.07)
V_yum   = voice([('m', 'm', 330, 330, .3, .9, 0), ('a', 'a', 400, 480, .22, 1, 0), ('m', 'm', 360, 330, .3, .9, 0)], gap=.05)
V_yuck  = voice([('e', 'ae', 380, 240, .7, 1, .06)], breath=.25)
V_mmm   = voice([('m', 'm', 360, 400, .5, 1, .02)])
V_hoo   = voice([('u', 'o', 210, 190, .35, 1, .01), ('u', 'o', 220, 180, .55, 1, .01)], gap=.3, kid=.9)
V_ooh   = voice([('o', 'u', 480, 600, .5, 1, .02)])
V_hehe  = voice([('e', 'i', 760, 820, .1, 1, 0), ('e', 'i', 700, 780, .1, 1, 0)], gap=.06)
V_burp  = voice([('a', 'o', 140, 90, .3, 1, .06)], kid=.7, breath=.3)
V_yippee= voice([('i', 'i', 600, 760, .18, 1, 0), ('i', 'e', 760, 1000, .45, 1, .02)], gap=.03)
V_hurt  = voice([('o', 'a', 600, 500, .4, 1, .05), ('o', 'a', 560, 440, .5, .8, .07)], gap=.1)
V_hot   = voice([('o', 'a', 400, 1100, .35, 1, 0), ('a', 'o', 1000, 800, .5, 1, .05)], gap=.02)

# ===== COMPOSITE SOUNDS =====
# timings referenced by build_pptx.py (seconds)
out('wake_up', reverb(mix([(0.0, V_yawn * .9), (0.2, whoosh(1.2, 200, 900, .12)), (1.75, boing(280, .5) * .7), (2.35, V_eep), (3.1, V_giggle * .9),
                           (3.1, sparkle(1.0, 8) * .3), (4.2, V_hello), (5.1, bell(NOTE(84), 1.5) * .35)], 6.5), .15))
out('portal_in', mix([(0, whoosh(1.0, 300, 4000, .5)), (.2, sparkle(1.0, 20) * .5), (.5, bell(NOTE(76), 1.5) * .5), (.7, bell(NOTE(83), 1.6) * .4)], 2.4))
out('portal_go', mix([(0, whoosh(1.1, 600, 5000, .6)), (.1, sparkle(1.0, 24) * .6), (.35, bell(NOTE(79), 1.0) * .5), (.55, bell(NOTE(84), 1.0) * .5)], 1.8))
for k in range(1, 6):   # star collected: rising scale + giggle
    out(f'star_{k}', reverb(mix([(0, bell(NOTE(PENT[k - 1]), 1.4) * .8), (0.02, sparkle(.8, 12) * .5), (0.12, bell(NOTE(PENT[k - 1] + 12), 1.0) * .3),
                                  (0.35, (V_hehe if k % 2 else V_giggle) * .6)], 1.9), .2))
out('star_all', reverb(mix([(0, whoosh(1.0, 300, 4000, .5)), (.1, bell(NOTE(72), 1.8) * .6), (.25, bell(NOTE(76), 1.8) * .6), (.4, bell(NOTE(79), 1.8) * .6), (.55, bell(NOTE(84), 2.0) * .7),
                            (.55, sparkle(1.6, 40) * .6), (.9, V_yay), (1.6, V_giggle * .7)], 3.6), .2))
for i, (pt, extra) in enumerate([(1.0, None), (1.25, 'squeak'), (0.8, 'boing'), (1.1, 'chime'), (0.9, 'giggle'), (1.4, 'whoosh'), (1.05, 'sparkle')]):
    parts = [(0, pop(pt))]
    if extra == 'squeak': parts.append((.1, V_eep * .6))
    if extra == 'boing': parts.append((.12, boing(300, .45) * .5))
    if extra == 'chime': parts += [(.1, bell(NOTE(84), 1.2) * .5), (.25, bell(NOTE(88), 1.2) * .4)]
    if extra == 'giggle': parts.append((.15, V_hehe * .6))
    if extra == 'whoosh': parts.append((.1, whoosh(.7, 400, 3500, .3)))
    if extra == 'sparkle': parts.append((.1, sparkle(.8, 14) * .5))
    out(f'pop_{i + 1}', mix(parts, 1.6))
out('pop_gold', mix([(0, pop(.9)), (.1, whoosh(1.0, 300, 3500, .4)), (.2, bell(NOTE(84), 1.5) * .5), (.3, bell(NOTE(88), 1.5) * .5), (.4, sparkle(1.2, 24) * .5), (.6, V_yay * .8)], 2.6))
out('jump', mix([(0, boing(380, .35) * .8), (.05, whoosh(.3, 300, 1500, .15))], .5))
out('footsteps', mix([(i * .22, step(bright=1 + .2 * (i % 2)) * .8) for i in range(6)], 1.5))
# feeding
out('feed_wait', mix([(0, V_ooh * .8), (.6, V_mmm * .5)], 1.3))
out('feed_munch', mix([(0, whoosh(.35, 500, 2500, .25)), (.4, crunch()), (.62, crunch() * .9), (.84, crunch()), (1.06, crunch() * .9), (1.3, thud(140) * .5), (1.5, V_yum), (2.5, bell(NOTE(84), 1.0) * .3)], 3.4))
out('feed_cake', mix([(0, whoosh(.35, 500, 2500, .25)), (.4, crunch(.12) * .5), (.62, crunch(.12) * .5), (.84, crunch(.12) * .5), (1.1, V_mmm), (1.8, V_giggle * .7), (2.4, bell(NOTE(88), 1.0) * .3)], 3.2))
out('feed_veg', mix([(0, whoosh(.35, 500, 2500, .25)), (.4, crunch()), (.62, crunch() * .8), (1.0, V_yuck), (2.0, boing(180, .4) * .5), (2.3, V_hehe * .8)], 3.0))
out('feed_chili', mix([(0, whoosh(.35, 500, 2500, .25)), (.4, crunch()), (.9, V_hot), (1.8, whoosh(1.4, 200, 1800, .7)), (1.8, lowpass(noise(1.4), 1500) * np.hanning(int(1.4 * SR)) * .4), (3.3, V_giggle * .8)], 4.4))
out('feed_burp', mix([(0, V_burp), (.5, V_hehe * .8)], 1.0))
out('hug_sequence', reverb(mix([(0, V_surp), (.35, boing(300, .4) * .6), (.45, whoosh(.8, 300, 1800, .2)), (.7, mix([(i * .2, step(bright=1 + .2 * (i % 2)) * .9) for i in range(7)], 1.5)), (1.3, chime_chord([NOTE(60), NOTE(64), NOTE(67), NOTE(72)], 3.5) * .7),
                                (1.6, V_coo), (2.3, sparkle(1.8, 26) * .45), (3.0, V_aww * .6), (3.3, bell(NOTE(88), 1.6) * .35)], 5.4), .2))
out('heart_pulse', mix([(0, thud(70) * .9), (.28, thud(80) * .8), (.0, bell(NOTE(67), 1.2) * .3)], 1.0))
out('key_appear', mix([(0, sparkle(1.0, 18) * .6), (.15, bell(NOTE(88), 1.6) * .6), (.4, bell(NOTE(91), 1.6) * .5)], 2.2))
# door scene
out('lantern', mix([(0, whoosh(.5, 300, 2000, .3)), (.2, thud(300, .06) * .4), (.4, bell(NOTE(79), 1.0) * .5), (.5, sparkle(.8, 10) * .4)], 1.6))
out('owl', reverb(mix([(0, V_hoo * 1.0), (1.4, bell(NOTE(81), 1.2) * .35)], 2.5), .2))
out('flower', mix([(0, pop(1.3, .25) * .6), (.1, boing(500, .35) * .5), (.25, bell(NOTE(86), 1.2) * .5), (.3, sparkle(.8, 10) * .4)], 1.8))
out('gem', reverb(mix([(0, whoosh(.6, 400, 3500, .3)), (.3, bell(NOTE(84), 1.5) * .7), (.4, bell(NOTE(91), 1.5) * .5), (.45, sparkle(1.0, 18) * .5), (.7, V_hehe * .6)], 2.4), .2))
out('door_locked', mix([(0, thud(110, .2)), (.25, thud(110, .2) * .8), (.5, np.zeros(10)), (.7, V_aww * .7), (1.3, (highpass(noise(.3), 2500) * np.exp(-10 * t_(.3))) * .15)], 2.0))
out('sad_to_happy', reverb(mix([(0, V_aww), (1.4, bell(NOTE(72), 1.2) * .5), (1.6, bell(NOTE(76), 1.2) * .5), (1.8, bell(NOTE(79), 1.4) * .5), (1.9, V_yippee)], 3.6), .15))
out('door_open', reverb(mix([(0, creak(1.8) * .8), (.4, pad([NOTE(60), NOTE(64), NOTE(67)], 3.0) * .35), (1.0, sparkle(2.0, 40) * .5), (1.6, whoosh(1.2, 300, 4000, .4)), (1.9, bell(NOTE(84), 2.0) * .6)], 4.0), .2))
out('chest_open', reverb(mix([(0, creak(1.0, 100, 260) * .9), (1.0, thud(70) * .9), (1.05, chime_chord([NOTE(60), NOTE(64), NOTE(67), NOTE(72), NOTE(76)], 3.0) * .8),
                              (1.1, coins(1.8) * .8), (1.2, sparkle(2.5, 50) * .6), (1.4, whoosh(1.4, 400, 5000, .5))], 5.0), .2))
fan = []
for i, n in enumerate([60, 64, 67, 72, 67, 72, 76, 79]):
    fan.append((i * .16, (bell(NOTE(n), 1.0) * .6)))
fan.append((1.4, chime_chord([NOTE(67), NOTE(72), NOTE(76), NOTE(79)], 3.0) * .7))
cheer = [(0.0 + .05 * i, V_yay * (.5 + .1 * i)) for i in range(3)] + [(.3 + rng.uniform(0, 1.2), clap() * .4) for _ in range(26)]
out('celebrate', reverb(mix(fan + cheer + [(1.6, sparkle(2.5, 60) * .5), (2.2, V_laugh * .8), (3.2, V_yippee)], 6.0), .22))
out('bye', reverb(mix([(0, V_hello), (.9, bell(NOTE(84), 1.5) * .4), (1.1, bell(NOTE(79), 1.5) * .4), (1.3, bell(NOTE(76), 2) * .4), (1.5, V_giggle * .5)], 3.2), .2))
out('recover', reverb(mix([(0, bell(NOTE(72), 1.2) * .5), (.2, bell(NOTE(76), 1.2) * .5), (.4, bell(NOTE(79), 1.4) * .5), (.5, V_yippee)], 2.0), .15))
out('lumi_tap', mix([(0, V_hehe * .9), (.05, bell(NOTE(88), .6) * .2)], .7))   # small tickle reaction for idle taps

# ===== BACKGROUND MUSIC: soft music-box lullaby, seamless loop (C pentatonic) =====
BPM = 84; beat = 60 / BPM; bars = 16; total = bars * 4 * beat
prog = [[48, 55, 64], [45, 52, 60], [41, 48, 57], [43, 50, 59]]  # C Am F G pads (bass+triad)
mel_pat = [  # per 2 bars, scale degrees as midi notes, in eighth-note slots (None = rest)
    [76, None, 79, None, 81, None, 79, None, 76, None, 74, 72, 74, None, None, None],
    [72, None, 76, None, 79, None, 81, 79, 76, None, 74, None, 72, None, None, None],
    [81, None, 84, None, 81, None, 79, None, 76, None, 79, None, 76, None, None, None],
    [79, None, 76, None, 74, None, 76, None, 72, 74, 76, None, 72, None, None, None],
]
parts = []
for b in range(bars):
    ch = prog[b % 4]; st = b * 4 * beat
    parts.append((st, pad([NOTE(n) for n in ch[1:]], 4 * beat + 0.4, atk=.5, rel=.9) * .12))
    parts.append((st, (sine(NOTE(ch[0] - 12), 2 * beat) * adsr_exp(2 * beat, .01, 2.2)) * .22))
    parts.append((st + 2 * beat, (sine(NOTE(ch[0] - 12 + 7), 2 * beat) * adsr_exp(2 * beat, .01, 2.2)) * .16))
    pat = mel_pat[(b // 2) % 4] if b % 2 == 0 else mel_pat[((b // 2) + 1) % 4]
    for i, n in enumerate(pat):
        if n: parts.append((st + i * beat / 2, bell(NOTE(n), 1.6, .6) * .32))
    for i in range(8):  # arpeggio sparkle
        parts.append((st + i * beat / 2 + beat / 4, bell(NOTE(ch[1 + i % 2] + 24), .8, .3) * .05))
m = mix(parts, total + 3)
m[:int(3 * SR)] += m[int(total * SR):int((total + 3) * SR)]   # wrap the tail onto the head for a seamless loop
m = m[:int(total * SR)]
m = reverb(m, .3)[:len(m)]
out('music_loop', m, 0.5)

json.dump(durations, open(os.path.join(OUT, 'durations.json'), 'w'), indent=1)
print(durations)
