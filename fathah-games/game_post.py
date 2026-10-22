"""Game post-processing: answer / button links (objects named "LINK<n> ..." jump to slide n), hidden "try again" slides,
star animations (objects named "A<delay ms> ..." appear by themselves), and a sound + transition when a slide opens:
a cheer on "great job", a soft "oops" on "try again", a fanfare at the end. On question and "try again" slides a click
on the background does not move on: only the buttons do.
usage: game_post.py in.raw.pptx out.pptx"""
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
SOUNDS["oops"] = wav(mix((0, pluck(392, 0.4)), (0.18, pluck(311.1, 0.6))))
SOUNDS["win"] = wav(mix(*[(0.11 * k, pluck(f, 0.5)) for k, f in enumerate((C5, E5, G5, C6))], (0.5, bell(C6, 1.2)), (0.62, bell(G6, 1.2))))
KIND = {"title": ("<p:fade/>", "whoosh", True), "question": ("<p:push dir=\"l\"/>", None, False),
        "right": ("<p:zoom/>", "sparkle", True), "wrong": ("<p:fade/>", "oops", False), "end": ("<p:zoom/>", "win", True)}

def autos(steps):
    nid = 5; inner = []; bld = []
    for k, (delay, spid) in enumerate(steps):
        node = "afterEffect" if k == 0 else "withEffect"
        inner.append(f'<p:par><p:cTn id="{nid}" presetID="53" presetClass="entr" presetSubtype="16" fill="hold" grpId="0" nodeType="{node}">'
          f'<p:stCondLst><p:cond delay="{delay}"/></p:stCondLst><p:childTnLst>'
          f'<p:set><p:cBhvr><p:cTn id="{nid+1}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>'
          f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>'
          f'<p:anim calcmode="lin" valueType="num"><p:cBhvr><p:cTn id="{nid+2}" dur="400" fill="hold"/><p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl><p:attrNameLst><p:attrName>ppt_w</p:attrName></p:attrNameLst></p:cBhvr>'
          f'<p:tavLst><p:tav tm="0"><p:val><p:fltVal val="0"/></p:val></p:tav><p:tav tm="100000"><p:val><p:strVal val="#ppt_w"/></p:val></p:tav></p:tavLst></p:anim>'
          f'<p:anim calcmode="lin" valueType="num"><p:cBhvr><p:cTn id="{nid+3}" dur="400" fill="hold"/><p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl><p:attrNameLst><p:attrName>ppt_h</p:attrName></p:attrNameLst></p:cBhvr>'
          f'<p:tavLst><p:tav tm="0"><p:val><p:fltVal val="0"/></p:val></p:tav><p:tav tm="100000"><p:val><p:strVal val="#ppt_h"/></p:val></p:tav></p:tavLst></p:anim>'
          f'</p:childTnLst></p:cTn></p:par>')
        nid += 4; bld.append(f'<p:bldP spid="{spid}" grpId="0" animBg="1"/>')
    body = ('<p:par><p:cTn id="3" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond></p:stCondLst><p:childTnLst>'
            '<p:par><p:cTn id="4" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>' + "".join(inner) + '</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>')
    return ('<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
      '<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>' + body +
      '</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
      '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
      '</p:childTnLst></p:cTn></p:par></p:tnLst><p:bldLst>' + "".join(bld) + '</p:bldLst></p:timing>')

src, dst = sys.argv[1:3]
zin = zipfile.ZipFile(src)
files = {it.filename: zin.read(it.filename) for it in zin.infolist()}
infos = {it.filename: it for it in zin.infolist()}
# pptxgenjs stores a copy of the background picture for every slide: keep one copy of each picture
canon, first = {}, {}
for n in list(files):
    if n.startswith("ppt/media/"): canon[n] = first.setdefault(hashlib.sha1(files[n]).hexdigest(), n)
for n, c in canon.items():
    if c != n: del files[n]; del infos[n]
for n in list(files):
    if n.endswith(".rels"):
        files[n] = re.sub(r'Target="\.\./media/([^"]+)"', lambda mo: 'Target="../media/%s"' % canon.get("ppt/media/" + mo.group(1), "ppt/media/" + mo.group(1))[10:], files[n].decode()).encode()
for fn in list(files):
    m = re.match(r"ppt/slides/slide(\d+)\.xml$", fn)
    if not m: continue
    t = files[fn].decode("utf8"); relsname = f"ppt/slides/_rels/slide{m.group(1)}.xml.rels"
    kind = re.search(r'name="KIND (\w+)"', t).group(1)
    eff, snd, adv = KIND[kind]
    if kind == "wrong": t = t.replace("<p:sld ", '<p:sld show="0" ', 1)
    sndxml = f'<p:sndAc><p:stSnd><p:snd r:embed="rIdGameSnd" name="{snd}.wav"/></p:stSnd></p:sndAc>' if snd else ""
    tr = f'<p:transition spd="med"{"" if adv else " advClick=\"0\""}>{eff}{sndxml}</p:transition>'
    t = t.replace("</p:clrMapOvr>", "</p:clrMapOvr>" + tr, 1)
    aut = sorted((int(x.group(2)), x.group(1)) for x in re.finditer(r'<p:cNvPr id="(\d+)" name="A(\d+) [^"]*"', t))
    if aut: t = t.replace("</p:sld>", autos(aut) + "</p:sld>")
    links = []
    def link(mo):
        links.append(mo.group(3))
        return f'<p:cNvPr id="{mo.group(1)}" name="{mo.group(2)}">' + f'<a:hlinkClick r:id="rIdLnk{len(links)}" action="ppaction://hlinksldjump"/>'
    t = re.sub(r'<p:cNvPr id="(\d+)" name="(LINK(\d+)[^"]*)">', link, t)
    files[fn] = t.encode("utf8")
    r = files[relsname].decode()
    add = "".join(f'<Relationship Id="rIdLnk{i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slide{n}.xml"/>' for i, n in enumerate(links))
    if snd: add += f'<Relationship Id="rIdGameSnd" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/audio" Target="../media/{snd}.wav"/>'
    files[relsname] = r.replace("</Relationships>", add + "</Relationships>").encode()
ct = files["[Content_Types].xml"].decode()
if 'Extension="wav"' not in ct: files["[Content_Types].xml"] = ct.replace("<Default ", '<Default Extension="wav" ContentType="audio/wav"/><Default ', 1).encode()
zout = zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED)
for fn, it in infos.items(): zout.writestr(it, files[fn])
for k, b in SOUNDS.items(): zout.writestr(f"ppt/media/{k}.wav", b)
zout.close()
