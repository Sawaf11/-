"""On-click fade reveals (silent) + a transition effect and sound between slides.
usage: post.py in.raw.pptx out.pptx
Objects named "C<k> ..." appear together on click k. Click reveals carry no sound;
each slide (except the first) gets a transition effect and one of the transition sounds."""
import zipfile, re, sys, wave, io, hashlib
import numpy as np
R = 44100
def wav(x):
    x = np.asarray(x, dtype=float); x = x / max(1e-9, np.abs(x).max()) * 0.7
    b = io.BytesIO(); w = wave.open(b, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R)
    w.writeframes((x * 32000).astype("<i2").tobytes()); w.close(); return b.getvalue()
def T(d): return np.arange(int(R * d)) / R
def verb(x, taps=((0.07, .25), (0.13, .14), (0.21, .07))):
    out = np.concatenate([x, np.zeros(int(R * 0.3))])
    for dl, g in taps: out[int(R * dl):int(R * dl) + len(x)] += x * g
    return out
def pluck(f, d=0.45):
    t = T(d); e = np.exp(-9 * t) * np.minimum(1, t / 0.002)
    return (np.sin(2*np.pi*f*t) + 0.4*np.sin(2*np.pi*4*f*t)*np.exp(-30*t) + 0.2*np.sin(2*np.pi*2*f*t)) * e
def bell(f, d=0.8):
    t = T(d); x = sum(a*np.sin(2*np.pi*f*r*t)*np.exp(-k*t) for a, r, k in ((1, 1, 4), (.5, 2.76, 6), (.3, 5.4, 9)))
    return x * np.minimum(1, t / 0.002)
def mix(*parts):
    L = max(int(R * st) + len(x) for st, x in parts); o = np.zeros(L)
    for st, x in parts: o[int(R * st):int(R * st) + len(x)] += x
    return verb(o)
def whoosh(d=0.5):
    t = T(d); n = np.random.default_rng(3).standard_normal(len(t)); y = np.zeros_like(n)
    for i in range(1, len(n)):
        a = 0.03 + 0.4 * (i / len(n)); y[i] = y[i-1] + a * (n[i] - y[i-1])
    return verb(y * np.sin(np.pi * t / d) ** 2)
def bubble(d=0.25):
    t = T(d); ph = 2*np.pi*np.cumsum(300 + 900*t/d) / R
    return np.sin(ph) * np.exp(-10 * t) * np.minimum(1, t / 0.004)
C5, D5, E5, G5, A5, C6, E6, G6 = 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1318.5, 1568.0
SOUNDS = {
    "harp": wav(mix(*[(0.05 * k, pluck(f, 0.5)) for k, f in enumerate((C5, E5, G5, C6, E6))])),
    "chime": wav(mix((0, bell(E6)), (0.14, bell(C6)))),
    "whoosh": wav(whoosh()),
    "bubbles": wav(mix((0, bubble()), (0.1, bubble(0.2)), (0.22, bubble(0.22)))),
    "sparkle": wav(mix(*[(0.06 * k, bell(f, 0.5)) for k, f in enumerate((G6, E6, G6, C6 * 2))])),
    "marimba": wav(mix((0, pluck(G5)), (0.12, pluck(A5)), (0.24, pluck(D5 * 2, 0.6)))),
}
NAMES = list(SOUNDS)
EFFECTS = ['<p:fade/>', '<p:push dir="l"/>', '<p:wipe dir="l"/>', '<p:cover dir="l"/>', '<p:split orient="vert" dir="out"/>',
           '<p:circle/>', '<p:zoom/>', '<p:pull dir="l"/>', '<p:randomBar dir="vert"/>', '<p:wheel spokes="4"/>']

def fade(ids, spid, first):
    a, b = ids
    node = "clickEffect" if first else "withEffect"
    return (f'<p:par><p:cTn id="{a}" presetID="10" presetClass="entr" presetSubtype="0" fill="hold" grpId="0" nodeType="{node}">'
      f'<p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
      f'<p:set><p:cBhvr><p:cTn id="{b}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>'
      f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr>'
      f'<p:to><p:strVal val="visible"/></p:to></p:set>'
      f'<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="{b + 1}" dur="350"/><p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl></p:cBhvr></p:animEffect>'
      f'</p:childTnLst></p:cTn></p:par>')
def timing(groups):
    nid = 3; pars = []; bld = []
    for spids in groups:
        a, b = nid, nid + 1; nid += 2
        inner = []
        for j, spid in enumerate(spids):
            inner.append(fade((nid, nid + 1), spid, j == 0)); nid += 3
            bld.append(f'<p:bldP spid="{spid}" grpId="0" animBg="1"/>')
        pars.append(f'<p:par><p:cTn id="{a}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst>'
                    f'<p:par><p:cTn id="{b}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
                    + "".join(inner) + '</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>')
    return ('<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
      '<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>' + "".join(pars) +
      '</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
      '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
      '</p:childTnLst></p:cTn></p:par></p:tnLst><p:bldLst>' + "".join(bld) + '</p:bldLst></p:timing>')
def transition(n):
    eff = EFFECTS[(n * 3) % len(EFFECTS)]
    if n == 1: return f'<p:transition spd="med">{eff}</p:transition>'
    snd = NAMES[n % len(NAMES)]
    return (f'<p:transition spd="med">{eff}<p:sndAc><p:stSnd><p:snd r:embed="rIdTrSnd" name="{snd}.wav"/></p:stSnd></p:sndAc></p:transition>'), snd

src, dst = sys.argv[1:3]
zin = zipfile.ZipFile(src); zout = zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED)
# pptxgenjs stores a copy of a picture for every slide that uses it: keep one copy of each
canon, first = {}, {}
for n in zin.namelist():
    if n.startswith("ppt/media/"):
        canon[n] = first.setdefault(hashlib.sha1(zin.read(n)).hexdigest(), n)
for it in zin.infolist():
    if canon.get(it.filename, it.filename) != it.filename: continue
    d = zin.read(it.filename)
    if it.filename.endswith(".rels"):
        d = re.sub(r'Target="\.\./media/([^"]+)"', lambda mo: 'Target="../media/%s"' % canon.get("ppt/media/" + mo.group(1), "ppt/media/" + mo.group(1))[10:], d.decode()).encode()
    if it.filename == "[Content_Types].xml":
        t = d.decode()
        if 'Extension="wav"' not in t: t = t.replace("<Default ", '<Default Extension="wav" ContentType="audio/wav"/><Default ', 1)
        d = t.encode()
    m = re.match(r"ppt/slides/slide(\d+)\.xml$", it.filename)
    if m:
        n = int(m.group(1)); t = d.decode("utf8")
        assert "<p:timing" not in t and "<p:transition" not in t and "<p:audio" not in t
        groups = {}
        for x in re.finditer(r'<p:cNvPr id="(\d+)" name="C(\d+) [^"]*"', t): groups.setdefault(int(x.group(2)), []).append(x.group(1))
        ks = sorted(groups); assert ks == list(range(1, len(ks) + 1)), ks
        tr = transition(n)
        if isinstance(tr, tuple): tr = tr[0]
        t = t.replace("</p:clrMapOvr>", "</p:clrMapOvr>" + tr, 1) if "</p:clrMapOvr>" in t else t.replace("</p:cSld>", "</p:cSld>" + tr, 1)
        t = t.replace("</p:sld>", timing([groups[k] for k in ks]) + "</p:sld>")
        d = t.encode("utf8")
    r = re.match(r"ppt/slides/_rels/slide(\d+)\.xml\.rels$", it.filename)
    if r and int(r.group(1)) != 1:
        n = int(r.group(1)); snd = NAMES[n % len(NAMES)]
        d = d.decode().replace("</Relationships>", f'<Relationship Id="rIdTrSnd" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/audio" Target="../media/{snd}.wav"/></Relationships>').encode()
    zout.writestr(it, d)
for k, b in SOUNDS.items(): zout.writestr(f"ppt/media/{k}.wav", b)
zout.close()

# make the file valid PresentationML (see tools/ooxml_fix.py)
sys.path.insert(0, __import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "tools"))
from ooxml_fix import fix
fix(dst)
