"""Add a PowerPoint animation sound to every on-click reveal. usage: addsound.py in.pptx out.pptx"""
import zipfile, re, sys, wave, struct, math, io, random
R = 22050
def wav(samples):
    b = io.BytesIO(); w = wave.open(b, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R)
    w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, s)) * 26000)) for s in samples)); w.close(); return b.getvalue()
def tone(f0, f1, dur, harm=(1,), decay=6):
    n = int(R * dur); out = []; ph = 0
    for i in range(n):
        t = i / n; f = f0 + (f1 - f0) * t; ph += 2 * math.pi * f / R
        out.append(sum(math.sin(ph * h) / h for h in harm) / len(harm) * math.exp(-decay * t) * min(1, i / 80))
    return out
def seq(*parts):
    o = []
    for p in parts: o += p
    return o
SND = {
 "pop":   wav(tone(500, 900, 0.14, decay=5)),
 "ding":  wav(tone(1320, 1320, 0.55, harm=(1, 2, 3), decay=5)),
 "tick":  wav(tone(700, 1100, 0.10, decay=7)),
 "win":   wav(seq(tone(523, 523, 0.15, (1, 2), 4), tone(659, 659, 0.15, (1, 2), 4), tone(784, 784, 0.15, (1, 2), 4), tone(1047, 1047, 0.5, (1, 2, 3), 5))),
}
def kind(name):
    if name.startswith("R "): return "win"
    if name.startswith("F"): return "ding"
    if "plus" in name or "arrow" in name: return "tick"
    return "pop"
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
        t = d.decode(); names = {x.group(1): x.group(2) for x in re.finditer(r'<p:cNvPr id="(\d+)" name="([^"]*)"', t)}
        used = {}; nid = [1000]
        def rep(mo):
            spid = re.search(r'spid="(\d+)"', mo.group(1)).group(1); k = kind(names[spid])
            rid = used.setdefault(k, f"rIdSnd{len(used) + 1}"); nid[0] += 1
            return mo.group(1) + AUD.format(id=nid[0], rid=rid, nm=k) + mo.group(2)
        t = re.sub(r'(<p:animEffect.*?</p:animEffect>)(</p:childTnLst></p:cTn></p:par>)', rep, t)
        d = t.encode()
        relname = f"ppt/slides/_rels/slide{m.group(1)}.xml.rels"
        rels = zin.read(relname).decode()
        add = "".join(f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/audio" Target="../media/{k}.wav"/>' for k, rid in used.items())
        slide_rels = (relname, rels.replace("</Relationships>", add + "</Relationships>"))
    if it.filename.endswith(".rels") and re.match(r"ppt/slides/_rels/", it.filename): continue
    zout.writestr(it, d)
    if m: zout.writestr(*slide_rels)
for k, b in SND.items(): zout.writestr(f"ppt/media/{k}.wav", b)
zout.close()
