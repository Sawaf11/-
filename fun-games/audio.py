"""Sounds for the fun games (the other sounds come from ../harakat-games/assets/audio): kick, beep, whoosh, creak."""
import numpy as np, wave, os
R = 44100
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "audio")
def T(d): return np.arange(int(R * d)) / R
def save(name, x):
    x = np.asarray(x, float); x = x / max(1e-9, np.abs(x).max()) * 0.7
    with wave.open(os.path.join(OUT, name + ".wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((x * 32000).astype("<i2").tobytes())
def env(t, a=0.003, k=8): return np.minimum(1, t / a) * np.exp(-k * t)
def tone(f, d, k=6): t = T(d); return np.sin(2 * np.pi * f * t) * env(t, k=k)
def sweep(f0, f1, d, k=6): t = T(d); return np.sin(2 * np.pi * np.cumsum(f0 + (f1 - f0) * t / d) / R) * env(t, k=k)
def noise(d, k=10, seed=1): t = T(d); return np.random.default_rng(seed).standard_normal(len(t)) * env(t, 0.002, k)
def lp(x, a=0.15):
    y = np.zeros_like(x)
    for i in range(1, len(x)): y[i] = y[i - 1] + a * (x[i] - y[i - 1])
    return y
def mix(*parts):
    L = max(int(R * s) + len(x) for s, x in parts); o = np.zeros(L)
    for s, x in parts: o[int(R * s):int(R * s) + len(x)] += x
    return o
os.makedirs(OUT, exist_ok=True)
save("kick", mix((0, sweep(160, 50, 0.25, 14)), (0, lp(noise(0.05, 50), 0.3) * 0.6)))
save("beep", mix((0, tone(880, 0.12, 10)), (0.14, tone(1175, 0.12, 10)), (0.28, tone(1568, 0.25, 7))))
save("whoosh", mix((0, lp(noise(1.2, 1.5, 4), 0.06) * np.sin(np.pi * T(1.2) / 1.2)), (0, sweep(120, 420, 1.2, 1) * 0.3)))
save("creak", mix((0, sweep(300, 180, 0.6, 3) * (1 + 0.6 * np.sign(np.sin(2 * np.pi * 35 * T(0.6)))) * 0.5)))
print("sounds:", sorted(os.listdir(OUT)))
