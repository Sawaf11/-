"""Add a PowerPoint animation sound to every on-click reveal. usage: addsound.py in.pptx out.pptx"""
import zipfile, re, sys, wave, struct, math, io, random
import numpy as np
R = 44100
def wav(x):
    x = np.asarray(x, dtype=float); x = x / max(1e-9, np.abs(x).max()) * 0.85
    b = io.BytesIO(); w = wave.open(b, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R)
    w.writeframes((x * 32000).astype("<i2").tobytes()); w.close(); return b.getvalue()
def T(d): return np.arange(int(R * d)) / R
def verb(x, taps=((0.07, .28), (0.13, .16), (0.21, .08))):
    out = np.concatenate([x, np.zeros(int(R * 0.3))])
    for dl, g in taps: out[int(R * dl):int(R * dl) + len(x)] += x * g
    return out
def pluck(f, d=0.5):                      # marimba-like
    t = T(d); e = np.exp(-9 * t) * np.minimum(1, t / 0.002)
    return verb((np.sin(2*np.pi*f*t) + 0.5*np.sin(2*np.pi*4*f*t)*np.exp(-30*t) + 0.2*np.sin(2*np.pi*2*f*t)) * e)
def bell(f, d=0.9):                       # glassy bell / sparkle
    t = T(d); x = sum(a*np.sin(2*np.pi*f*r*t)*np.exp(-k*t) for a, r, k in ((1, 1, 4), (.5, 2.76, 6), (.3, 5.4, 9), (.2, 8.9, 14)))
    return verb(x * np.minimum(1, t / 0.002), ((0.09, .3), (0.18, .18)))
def bloop(d=0.16):                        # plus sign: soft bubble
    t = T(d); ph = 2*np.pi*np.cumsum(330 + 700*t/d) / R
    return verb(np.sin(ph) * np.exp(-14 * t) * np.minimum(1, t / 0.004), ((0.06, .2),))
def whoosh(d=0.4):                        # arrow: airy sweep with rising tone
    t = T(d); rng = np.random.default_rng(7); n = rng.standard_normal(len(t)); y = np.zeros_like(n); a = 0.02
    for i in range(1, len(n)):
        a = 0.02 + 0.5 * (i / len(n)); y[i] = y[i-1] + a * (n[i] - y[i-1])
    env = np.sin(np.pi * t / d) ** 2
    return verb(y * env * 2 + 0.25 * np.sin(2*np.pi*np.cumsum(400 + 1200*t/d)/R) * env, ((0.08, .15),))
def mix(*parts):                          # parts = (start_sec, samples)
    L = max(int(R * st) + len(x) for st, x in parts); o = np.zeros(L)
    for st, x in parts: o[int(R * st):int(R * st) + len(x)] += x
    return o
C5, E5, G5, C6, E6, G6 = 523.25, 659.25, 783.99, 1046.5, 1318.5, 1568.0
SND = {"pluck1": wav(pluck(C5)), "pluck2": wav(pluck(E5)), "pluck3": wav(pluck(G5)),
       "bell1": wav(bell(C6)), "bell2": wav(bell(E6)), "bell3": wav(bell(G6)),
       "bloop": wav(bloop()), "whoosh": wav(whoosh()),
       "oops": wav(mix((0, pluck(392, 0.5)), (0.22, pluck(294, 0.7)))),
       "level": wav(mix((0, pluck(C5)), (0.12, pluck(E5)), (0.24, pluck(G5)), (0.36, pluck(C6, 0.8)), (0.55, pluck(G5)), (0.67, pluck(C6)), (0.79, pluck(E6, 0.9)), (0.81, bell(C6, 1.5)), (0.95, bell(G6, 1.5)))),
       "win": wav(mix((0, pluck(C5)), (0.12, pluck(E5)), (0.24, pluck(G5)), (0.36, pluck(C6, 0.8)), (0.38, bell(C6, 1.2)), (0.5, bell(G6, 1.2))))}
def kind(name):
    name = re.sub(r"^[SG]\d+ ", "", name)
    for key, k in (("confetti", None), ("panel", None), ("medal ", None), ("medal", "level"), ("face", "win"), ("oops", "oops"), ("star1", "bell1"), ("star2", "bell2"), ("star3", "bell3")):
        if name.startswith(key): return k
    if name.startswith("B "): return "bloop"
    if name.startswith("R "): return "win"
    if "plus" in name: return "bloop"
    if "arrow" in name: return "whoosh"
    i = name[1] if name[1] in "123" else "1"
    return ("bell" if name.startswith("F") else "pluck") + i
AUD = ('<p:audio><p:cMediaNode vol="80000"><p:cTn id="{id}" display="0"><p:stCondLst><p:cond delay="0"/></p:stCondLst>'
       '<p:endCondLst><p:cond evt="onStopAudio" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:endCondLst></p:cTn>'
       '<p:tgtEl><p:sndTgt r:embed="{rid}" name="{nm}.wav"/></p:tgtEl></p:cMediaNode></p:audio>')
src, dst = sys.argv[1:3]
zin = zipfile.ZipFile(src); zout = zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED)
for it in zin.infolist():
    d = zin.read(it.filename)
    if it.filename == "[Content_Types].xml":
        t = d.decode()
        if 'Extension="wav"' not in t: t = t.replace("<Default ", '<Default Extension="wav" ContentType="audio/wav"/><Default ', 1)
        d = t.encode()
    m = re.match(r"ppt/slides/slide(\d+)\.xml$", it.filename)
    if m:
        t = re.sub(r'<p:audio>.*?</p:audio>', '', d.decode()); names = {x.group(1): x.group(2) for x in re.finditer(r'<p:cNvPr id="(\d+)" name="([^"]*)"', t)}
        used = {}; nid = [1000]
        def rep(mo):
            spid = re.search(r'spid="(\d+)"', mo.group(1)).group(1); k = kind(names[spid])
            if k is None: return mo.group(0)
            rid = used.setdefault(k, f"rIdSnd{len(used) + 1}"); nid[0] += 1
            return mo.group(1) + AUD.format(id=nid[0], rid=rid, nm=k) + mo.group(2)
        t = re.sub(r'(<p:animEffect.*?</p:animEffect>)(</p:childTnLst></p:cTn></p:par>)', rep, t)
        d = t.encode()
        relname = f"ppt/slides/_rels/slide{m.group(1)}.xml.rels"
        rels = re.sub(r'<Relationship Id="rIdSnd\d+"[^>]*/>', '', zin.read(relname).decode())
        add = "".join(f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/audio" Target="../media/{k}.wav"/>' for k, rid in used.items())
        slide_rels = (relname, rels.replace("</Relationships>", add + "</Relationships>"))
    if it.filename.endswith(".rels") and re.match(r"ppt/slides/_rels/", it.filename): continue
    if re.match(r"ppt/media/.*\.wav$", it.filename): continue
    zout.writestr(it, d)
    if m: zout.writestr(*slide_rels)
for k, b in SND.items(): zout.writestr(f"ppt/media/{k}.wav", b)
zout.close()
