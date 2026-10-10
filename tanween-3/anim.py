import zipfile, re, sys
src, dst = sys.argv[1:3]
def fade(ids, spid):
    a, b, c, d, e = ids
    return (f'<p:par><p:cTn id="{a}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst>'
      f'<p:par><p:cTn id="{b}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
      f'<p:par><p:cTn id="{c}" presetID="10" presetClass="entr" presetSubtype="0" fill="hold" grpId="0" nodeType="clickEffect">'
      f'<p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
      f'<p:set><p:cBhvr><p:cTn id="{d}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>'
      f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr>'
      f'<p:to><p:strVal val="visible"/></p:to></p:set>'
      f'<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="{e}" dur="300"/><p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl></p:cBhvr></p:animEffect>'
      f'</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>')
def timing(steps):                       # steps = [(spid, name)] in click order
    nid = 3; pars = []; bld = []
    for spid, name in steps:
        pars.append(fade(range(nid, nid + 5), spid)); nid += 5
        extra = ' animBg="1"' if re.search(r'plus|arrow|badge', name) else ''
        bld.append(f'<p:bldP spid="{spid}" grpId="0"{extra}/>')
    return ('<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
      '<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>' + "".join(pars) +
      '</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
      '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
      '</p:childTnLst></p:cTn></p:par></p:tnLst><p:bldLst>' + "".join(bld) + '</p:bldLst></p:timing>')
zin = zipfile.ZipFile(src); zout = zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED)
for it in zin.infolist():
    d = zin.read(it.filename)
    if re.match(r"ppt/slides/slide\d+\.xml$", it.filename):
        t = d.decode("utf8")
        steps = sorted((int(m.group(3)), m.group(1), m.group(2)) for m in re.finditer(r'<p:cNvPr id="(\d+)" name="(S(\d+) [^"]*)"', t))
        steps = [(sp, nm) for _, sp, nm in steps]
        if steps: t = t.replace("</p:sld>", timing(steps) + "</p:sld>")
        d = t.encode("utf8")
    zout.writestr(it, d)
zout.close()
