import zipfile, re, sys
src, dst = sys.argv[1:3]
def fade(ids, spid, click=True):
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
def timing(order, ids_by_name):
    nid = 3; pars = []; bld = []
    for name in order:
        spid = ids_by_name[name]
        pars.append(fade(range(nid, nid + 5), spid)); nid += 5
        extra = ' animBg="1"' if (name.endswith("plus") or name.endswith("arrow")) else ''
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
        ids = {m.group(2): m.group(1) for m in re.finditer(r'<p:cNvPr id="(\d+)" name="([^"]*)"', t)}
        k = sum(1 for nme in ids if re.match(r"L\d letter", nme))
        order = ["L1 letter","F1 dammah"] if k == 1 else (
            ["L1 letter","F1 dammah","P1 plus","L2 letter","F2 dammah","A arrow","R result"] if k == 2 else
            ["L1 letter","F1 dammah","P1 plus","L2 letter","F2 dammah","P2 plus","L3 letter","F3 dammah","A arrow","R result"])
        if k == 1: assert "R result" not in ids
        t = t.replace("</p:sld>", timing(order, ids) + "</p:sld>")
        d = t.encode("utf8")
    zout.writestr(it, d)
zout.close()
