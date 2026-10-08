"""Synthesise the sound-design track (premium, quiet) and mix it under the voiceover.
All event times are locked to the same timeline as scene.js."""
import numpy as np, soundfile as sf, sys
rng = np.random.default_rng(7)
SR = 48000
TOTAL = 77.2
N = int(TOTAL * SR)

def R(i, k=0):
    s = np.sin(i * 127.1 + k * 311.7 + 17.3) * 43758.5453
    return s - np.floor(s)

dry = np.zeros((2, N))

def add(sig, t, pan=0.0, gain=1.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    sig = sig[: N - i]
    l = np.sqrt(.5 * (1 - pan)); r = np.sqrt(.5 * (1 + pan))
    dry[0, i:i + len(sig)] += sig * gain * l * 1.414
    dry[1, i:i + len(sig)] += sig * gain * r * 1.414

def tt(d): return np.arange(int(d * SR)) / SR

def env_ar(n, a, rel_pow=2.0):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na) ** 1.5
    e[na:] = np.linspace(1, 0, n - na) ** rel_pow
    return e

def bell(f, d=2.5, bright=1.0, dec=1.0):
    t = tt(d); s = np.zeros_like(t)
    for ratio, amp, dk in [(1, 1, 1.0), (2.0, .45, 1.6), (3.01, .28, 2.2), (4.2, .16 * bright, 3.0), (5.43, .10 * bright, 4.2), (6.8, .05 * bright, 5.5)]:
        s += amp * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t * (1.7 * dk / dec))
    s *= np.minimum(1, t / .004)
    return s / 1.9

def sub(f0=70, f1=38, d=1.6, drop=.5):
    t = tt(d); f = f1 + (f0 - f1) * np.exp(-t / (drop / 3))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 2.6) * np.minimum(1, t / .006)
    return s

def noise_band(n, lo, hi):
    x = rng.standard_normal(n); X = np.fft.rfft(x); fr = np.fft.rfftfreq(n, 1 / SR)
    m = np.exp(-((np.log(np.maximum(fr, 1)) - np.log(np.sqrt(lo * hi))) / (np.log(hi / lo) / 2 + 1e-6)) ** 2)
    return np.fft.irfft(X * m, n)

def whoosh(d, f0, f1, shape='swell', bw=1.9):
    """noise sweeping from f0 to f1 (log) with a moving band."""
    n = int(d * SR); out = np.zeros(n); K = 12
    fc = np.exp(np.linspace(np.log(f0), np.log(f1), K))
    pos = np.linspace(0, 1, n)
    for k in range(K):
        band = noise_band(n, fc[k] / bw, fc[k] * bw)
        w = np.exp(-((pos - k / (K - 1)) / (1.2 / K)) ** 2)
        out += band * w
    out /= (np.abs(out).max() + 1e-9)
    if shape == 'swell': e = np.sin(np.pi * pos) ** 1.6
    elif shape == 'rise': e = pos ** 2.2 * np.minimum(1, (1 - pos) * 40 + .0)
    else: e = (1 - pos) ** 2
    return out * e

def rustle(d=.7):
    n = int(d * SR); x = noise_band(n, 900, 5200)
    e = np.abs(np.sin(np.linspace(0, np.pi, n))) * (.6 + .4 * np.abs(np.sin(np.linspace(0, 23, n))))
    return x / np.abs(x).max() * e

def heartbeat(g=1.0):
    a = sub(88, 44, .5, .09) * 1.0
    b = sub(80, 42, .5, .09) * .65
    out = np.zeros(int(.5 * SR)); out[: len(a)] += a
    i = int(.24 * SR); out[i:] += b[: len(out) - i]
    return out * g

def pad(freqs, d, a=.5):
    t = tt(d); s = sum(np.sin(2 * np.pi * f * t + R(f)) for f in freqs) / len(freqs)
    return s * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2

def note(deg, octv):  # A minor pentatonic
    sc = [0, 3, 5, 7, 10]
    return 220 * 2 ** ((sc[deg % 5] + 12 * (octv + deg // 5)) / 12)

# ------------------------------------------------------------------ events
# 1) hook: 30 plucks (ascending) then 3 deeper "more than" bells
for i in range(30):
    ta = .06 + 1.08 * (i / 29) ** 1.35
    f = note(i % 5, 1 + i // 6)
    add(bell(f, 1.6, .8), ta, pan=np.sin(i / 30 * 2 * np.pi) * .7, gain=.10 + .05 * i / 29)
for k, ta in enumerate([2.5, 2.95, 3.4]):
    add(bell(note(k * 2, 1) * 1.0, 3.2, 1.0, .9), ta, pan=[-.5, .5, 0][k], gain=.20)
    add(sub(60, 45, .9, .2), ta, gain=.10)
add(sub(46, 36, 3, 1), 0.0, gain=.22)
# 2) race
add(whoosh(2.45, 300, 5200, 'rise'), 4.71, pan=0, gain=.45)
add(whoosh(2.2, 600, 7000, 'rise'), 4.95, pan=-.5, gain=.22)
add(whoosh(2.2, 500, 6000, 'rise'), 5.0, pan=.5, gain=.22)
add(whoosh(.8, 2000, 9000, 'rise'), 6.45, gain=.2)
# bas -> convergence
add(sub(75, 34, 2.4, .6), 7.14, gain=.85)
for j, f in enumerate([880, 1320, 1760, 2349]):
    add(bell(f, 4.5, 1.2, 1.4), 7.14 + j * .03, pan=[-.4, .4, -.2, .2][j], gain=.16)
add(whoosh(1.0, 3500, 250, 'fall'), 7.55, gain=.28)
# 3) hall
air = noise_band(int(37 * SR), 120, 900); air = air / np.abs(air).max()
air *= np.sin(np.pi * np.clip(tt(37) / 37, 0, 1)) ** .6
add(air, 8.4, gain=.045)
for k in range(4): add(bell(note(k + 2, 3), 2.0, .5), 11.4 + k * .45, pan=-.6 + k * .4, gain=.045)
add(rustle(.9), 20.5, pan=-.2, gain=.20); add(rustle(1.0), 23.0, pan=.2, gain=.20)
add(pad([98, 147, 196, 294], 3.4), 23.15, gain=.17)
add(bell(392, 3.5, .7), 23.45, gain=.12)
# du'a (27.58 - 32.4)
for ta, f, g, p in [(27.6, 659, .14, -.2), (28.6, 784, .12, .25), (29.65, 880, .14, -.3), (30.3, 1047, .12, .3)]:
    add(bell(f, 3.0, 1.0), ta, pan=p, gain=g)
add(bell(1568, 3.0, .6), 30.9, pan=0, gain=.17); add(bell(2093, 3.0, .6), 31.0, pan=.2, gain=.10)
for j, f in enumerate([1047, 1319, 1568, 1976, 2349, 2637]):
    add(bell(f, 3.4, 1.2), 31.45 + j * .11, pan=-.5 + j * .2, gain=.12)
add(sub(70, 48, 2.5, .8), 31.45, gain=.18)
sp = np.zeros(int(5 * SR)); idx = rng.integers(0, len(sp) - 4000, 220)
for ii in idx: sp[ii:ii + 300] += rng.standard_normal(300) * np.exp(-np.arange(300) / 40) * rng.uniform(.2, 1)
add(sp * np.sin(np.pi * np.clip(tt(5) / 5, 0, 1)), 27.6, gain=.05)
add(whoosh(1.3, 1200, 200, 'fall'), 33.35, gain=.12)
# the question
add(bell(660, 4.5, .4, 1.3), 37.85, gain=.22)
add(whoosh(1.7, 90, 520, 'swell'), 37.83, gain=.22)
# heartbeat 39.45...
for b in range(5): add(heartbeat(), 39.45 + b * .88, gain=.28 + .09 * b)
# riser into the reveal
add(whoosh(2.3, 200, 8000, 'rise'), 42.47, gain=.38)
t = tt(2.3); gl = np.sin(2 * np.pi * np.cumsum(180 * 2 ** (t / 2.3 * 2.6)) / SR) * (t / 2.3) ** 2
add(gl, 42.47, gain=.10)
add(sub(65, 32, 3, .9), 44.78, gain=.55)
# 33 glints as the host appears
for i in range(33):
    ta = 44.85 + 1.75 * (i / 29) if i < 30 else [46.75, 46.95, 47.15][i - 30]
    add(bell(note(int(R(i) * 5), 3 + int(R(i, 1) * 2)), 2.2, .9), ta, pan=(R(i, 2) - .5) * 1.4, gain=.065)
add(whoosh(.9, 2000, 7000, 'swell'), 46.6, gain=.15)
# the du'a rises, the race
add(whoosh(2.5, 120, 520, 'rise'), 47.35, gain=.18)
for k, (ta, d, p) in enumerate([(47.97, 2.3, -.4), (48.15, 2.1, .4), (48.45, 1.9, -.2), (48.8, 1.6, .5), (49.1, 1.3, -.6)]):
    add(whoosh(d, 350 + k * 90, 5500, 'rise'), ta, pan=p, gain=.30)
# winner arrives
add(sub(85, 34, 2.8, .7), 50.25, gain=.75)
for j, f in enumerate([1175, 1568, 2093, 2637, 3136]):
    add(bell(f, 4.0, 1.2, 1.3), 50.25 + j * .04, pan=-.4 + j * .2, gain=.15)
sp2 = np.zeros(int(1.3 * SR)); idx = rng.integers(0, len(sp2) - 3000, 120)
for ii in idx: sp2[ii:ii + 200] += rng.standard_normal(200) * np.exp(-np.arange(200) / 25)
add(sp2 * np.linspace(1, .2, len(sp2)), 50.25, gain=.12)
for i in range(33):
    ta = 50.5 + R(i, 3) * .85 if i != 16 else 50.25
    add(bell(note(int(R(i, 9) * 5), 3), 1.4, .6), ta + .02, pan=(R(i, 2) - .5) * 1.6, gain=.05)
# count flares
for i in range(33): add(bell(note(i % 5, 2 + i // 11), 1.1, .6), 52.15 + i * .056, pan=np.sin(i * .7) * .7, gain=.055)
# leader swishes
for k in range(10): add(whoosh(.35, 800, 3200, 'swell'), 54.98 + k * .24, pan=(-1) ** k * .5, gain=.07)
add(whoosh(1.0, 300, 3000, 'rise'), 57.3, gain=.18)
# stop
add(sub(80, 40, 1.8, .4), 58.35, gain=.65); add(bell(392, 5, .5, 1.5), 58.35, gain=.16)
# ember
for ii in range(26): add(np.concatenate([rng.standard_normal(260) * np.exp(-np.arange(260) / 30)]), 59.8 + ii * .09 + R(ii) * .06, pan=(R(ii, 1) - .5) * .6, gain=.04 + .04 * R(ii, 2))
add(whoosh(1.5, 150, 1400, 'swell'), 62.7, gain=.13)
add(bell(1047, 4.0, .8), 64.4, gain=.22); add(sub(60, 44, 2.0, .6), 64.4, gain=.22)
# faint angels return
for i in range(33): add(bell(note(int(R(i, 4) * 5), 3 + int(R(i, 5) * 2)), 2.0, .8), 66.16 + R(i, 1) * 1.6, pan=(R(i, 2) - .5) * 1.4, gain=.04)
for k in range(5): add(whoosh(1.5 + k * .1, 450 + k * 120, 5000, 'rise'), 67.98 + k * .09, pan=-.6 + k * .3, gain=.22)
add(sub(70, 40, 2.2, .6), 69.5, gain=.28)
add(rustle(.8), 71.1, gain=.18); add(rustle(.8), 71.95, gain=.18)
t = tt(2.6); gl2 = np.sin(2 * np.pi * np.cumsum(500 + 700 * t / 2.6) / SR) * np.sin(np.pi * t / 2.6) ** 2
add(gl2, 72.6, gain=.07)
for j, f in enumerate([880, 1175, 1568]): add(bell(f, 3, 1.0), 72.7 + j * .1, pan=-.3 + j * .3, gain=.12)
add(whoosh(1.5, 300, 7500, 'rise'), 73.65, gain=.40)
# finale
add(sub(80, 32, 3.2, .7), 75.3, gain=.9)
for j, f in enumerate([523, 784, 1047, 1568, 2093, 3136]): add(bell(f, 5.2, 1.3, 1.6), 75.3 + j * .035, pan=-.7 + j * .28, gain=.17)
add(whoosh(1.9, 8000, 400, 'fall'), 75.3, gain=.25)

# ------------------------------------------------------------------ reverb
def make_ir(d=3.2):
    n = int(d * SR); t = np.arange(n) / SR; ir = np.zeros((2, n))
    for c in range(2):
        x = rng.standard_normal(n) * np.exp(-t / .75)
        X = np.fft.rfft(x); fr = np.fft.rfftfreq(n, 1 / SR)
        X *= 1 / (1 + (fr / 4500) ** 2) * (1 / (1 + (140 / np.maximum(fr, 1)) ** 2)); ir[c] = np.fft.irfft(X, n)
    ir[:, :int(.012 * SR)] *= np.linspace(0, 1, int(.012 * SR))
    return ir / np.sqrt((ir ** 2).sum(1, keepdims=True)) * .55
def fftconv(x, h):
    n = len(x) + len(h) - 1; m = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(h, m), m)[:n]
ir = make_ir()
wet = np.stack([fftconv(dry[c], ir[c])[:N] for c in range(2)])
sfx = dry * .72 + wet * .55

# ------------------------------------------------------------------ voice + ducking
v, vsr = sf.read('voiceover.wav', dtype='float64')
if v.ndim > 1: v = v.mean(1)
x = np.interp(np.arange(int(len(v) / vsr * SR)) / SR, np.arange(len(v)) / vsr, v)
voice = np.zeros(N); voice[: len(x)] = x[:N]
voice /= np.abs(voice).max(); voice *= .85
# envelope for ducking
w = int(.02 * SR); e = np.sqrt(np.convolve(voice ** 2, np.ones(w) / w, 'same'))
e = np.clip(e / np.percentile(e, 98), 0, 1)
a_, r_ = np.exp(-1 / (.03 * SR)), np.exp(-1 / (.35 * SR)); sm = np.zeros_like(e); c = 0
for i in range(0, N, 1):
    c = a_ * c + (1 - a_) * e[i] if e[i] > c else r_ * c + (1 - r_) * e[i]; sm[i] = c
duck = 1 - .62 * np.clip(sm * 1.4, 0, 1)
sfx *= duck
sfx /= np.abs(sfx).max(); sfx *= .45
mix = np.stack([voice, voice]) + sfx
out = mix
sf.write('mix_raw.wav', out.T, SR, subtype='FLOAT')
sf.write('sfx_only.wav', sfx.T, SR, subtype='PCM_16')
print('ok', np.abs(out).max(), 'voice rms', np.sqrt((voice ** 2).mean()), 'sfx rms', np.sqrt((sfx ** 2).mean()))
