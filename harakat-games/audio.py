"""Short sound effects for the games (no music, no voice): pop, boing, munch, splash, bonk, ding, whistle, tada, cheer, vroom."""
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
save("pop", mix((0, noise(0.08, 40)), (0, sweep(900, 300, 0.12, 25))))
save("boing", mix((0, sweep(180, 420, 0.35, 5) * (1 + 0.5 * np.sin(2 * np.pi * 18 * T(0.35))))))
save("munch", mix(*[(0.13 * k, lp(noise(0.09, 30, k), 0.3)) for k in range(4)]))
save("splash", mix((0, lp(noise(0.5, 6, 3), 0.25)), (0.05, sweep(600, 1400, 0.2, 12) * 0.3)))
save("bonk", mix((0, sweep(500, 220, 0.18, 14)), (0, noise(0.03, 60) * 0.4)))
save("ding", mix((0, tone(1318.5, 0.6, 5)), (0, tone(2637, 0.4, 8) * 0.3)))
save("whistle", mix((0, (np.sin(2 * np.pi * 880 * T(0.9)) + 0.5 * np.sin(2 * np.pi * 1108 * T(0.9))) * np.minimum(1, T(0.9) / 0.05) * np.minimum(1, (0.9 - T(0.9)) / 0.2))))
save("tada", mix((0, tone(523.25, 0.25, 6)), (0.12, tone(659.25, 0.25, 6)), (0.24, tone(783.99, 0.6, 3)), (0.24, tone(1046.5, 0.6, 3) * 0.6)))
save("cheer", mix(*[(0.1 * k, tone(f, 0.5, 4)) for k, f in enumerate((523.25, 659.25, 783.99, 1046.5, 1318.5))], (0.5, lp(noise(1.0, 3, 9), 0.4) * 0.5)))
save("vroom", mix((0, sweep(90, 260, 0.7, 2) * (1 + 0.3 * np.sin(2 * np.pi * 30 * T(0.7))))))
print("sounds:", sorted(os.listdir(OUT)))
