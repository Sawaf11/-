"""Sounds for the tanween games (the others come from ../harakat-games and ../fun-games): buzz, swish, thunk, sparkle."""
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
save("buzz", mix((0, np.sign(np.sin(2 * np.pi * 180 * T(0.7))) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * T(0.7))) * np.minimum(1, T(0.7) / 0.05) * np.minimum(1, (0.7 - T(0.7)) / 0.15) * 0.4)))
save("swish", mix((0, lp(noise(0.45, 4, 6), 0.35) * np.sin(np.pi * T(0.45) / 0.45)), (0.35, tone(1046.5, 0.4, 7) * 0.4)))
save("thunk", mix((0, sweep(300, 120, 0.15, 20)), (0, lp(noise(0.04, 60, 2), 0.5) * 0.7)))
save("sparkle", mix(*[(0.07 * k, tone(f, 0.35, 9) * 0.6) for k, f in enumerate((1568, 2093, 1760, 2349, 2637))]))
print("sounds:", sorted(os.listdir(OUT)))
