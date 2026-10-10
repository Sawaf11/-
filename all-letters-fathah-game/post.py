"""click steps (S## names), auto celebration effects (G#### names, delay in ms), answer links (LINK<n> names), hidden slides"""
import zipfile, re, sys
src, dst = sys.argv[1:3]
def eff(i, spid, node, delay, dur=300):
    return (f'<p:par><p:cTn id="{i}" presetID="10" presetClass="entr" presetSubtype="0" fill="hold" grpId="0" nodeType="{node}">'
      f'<p:stCondLst><p:cond delay="{delay}"/></p:stCondLst><p:childTnLst>'
      f'<p:set><p:cBhvr><p:cTn id="{i+1}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>'
      f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr>'
      f'<p:to><p:strVal val="visible"/></p:to></p:set>'
      f'<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="{i+2}" dur="{dur}"/><p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl></p:cBhvr></p:animEffect>'
      f'</p:childTnLst></p:cTn></p:par>')
def wrap(inner, bld):
    return ('<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
      '<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>' + inner +
      '</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
      '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
      '</p:childTnLst></p:cTn></p:par></p:tnLst><p:bldLst>' + bld + '</p:bldLst></p:timing>')
def bldp(spid, name):
    return f'<p:bldP spid="{spid}" grpId="0"' + (' animBg="1"' if re.search(r'plus|arrow|star|face|oops|medal|confetti|button|icon|ribbon', name) else '') + '/>'
def clicks(steps):
    nid = 3; pars = []; bld = []
    for spid, name in steps:
        pars.append(f'<p:par><p:cTn id="{nid}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst>'
                    f'<p:par><p:cTn id="{nid+1}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
                    + eff(nid + 2, spid, "clickEffect", 0) + '</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>')
        nid += 5; bld.append(bldp(spid, name))
    return wrap("".join(pars), "".join(bld))
def autos(steps):                                    # steps = [(delay_ms, spid, name)]; the whole group starts by itself when the slide opens
    nid = 5; inner = []; bld = []
    for k, (delay, spid, name) in enumerate(steps):
        inner.append(eff(nid, spid, "afterEffect" if k == 0 else "withEffect", delay)); nid += 3; bld.append(bldp(spid, name))
    body = ('<p:par><p:cTn id="3" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond></p:stCondLst><p:childTnLst>'
            '<p:par><p:cTn id="4" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>' + "".join(inner) + '</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>')
    return wrap(body, "".join(bld))
zin = zipfile.ZipFile(src)
files = {it.filename: zin.read(it.filename) for it in zin.infolist()}
infos = {it.filename: it for it in zin.infolist()}
for fn in list(files):
    m = re.match(r"ppt/slides/slide(\d+)\.xml$", fn)
    if not m: continue
    t = files[fn].decode("utf8"); relsname = f"ppt/slides/_rels/slide{m.group(1)}.xml.rels"
    clk = sorted((int(x.group(3)), x.group(1), x.group(2)) for x in re.finditer(r'<p:cNvPr id="(\d+)" name="(S(\d+) [^"]*)"', t))
    aut = sorted((int(x.group(3)), int(x.group(1)), x.group(2)) for x in re.finditer(r'<p:cNvPr id="(\d+)" name="(G(\d+) [^"]*)"', t))
    if clk: t = t.replace("</p:sld>", clicks([(a, b) for _, a, b in clk]) + "</p:sld>")
    elif aut: t = t.replace("</p:sld>", autos([(dl, sp, nmx) for dl, sp, nmx in aut]) + "</p:sld>")
    if 'name="HIDDEN marker"' in t: t = t.replace("<p:sld ", '<p:sld show="0" ', 1)
    links = []
    def link(mo):
        links.append(mo.group(3))
        return f'<p:cNvPr id="{mo.group(1)}" name="{mo.group(2)}">' + f'<a:hlinkClick r:id="rIdLnk{len(links)}" action="ppaction://hlinksldjump"/>'
    t = re.sub(r'<p:cNvPr id="(\d+)" name="((?:\w+ )?LINK(\d+)[^"]*)">', link, t)
    files[fn] = t.encode("utf8")
    if links:
        r = files[relsname].decode()
        add = "".join(f'<Relationship Id="rIdLnk{i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slide{n}.xml"/>' for i, n in enumerate(links))
        files[relsname] = r.replace("</Relationships>", add + "</Relationships>").encode()
zout = zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED)
for fn, it in infos.items(): zout.writestr(it, files[fn])
zout.close()
