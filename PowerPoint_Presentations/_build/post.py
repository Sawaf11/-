"""Post-process a generated deck: turn objects named '... LINK:<key>' into slide-jump hyperlinks
(the whole shape is clickable in slideshow), and add a gentle fade transition to every slide.
usage: python3 post.py in.pptx links.json out.pptx"""
import json, re, sys, zipfile

src, linkfile, dst = sys.argv[1:4]
links = json.load(open(linkfile))
zin = zipfile.ZipFile(src)
files = {i.filename: zin.read(i.filename) for i in zin.infolist()}
TRANS = '<p:transition spd="med"><p:fade/></p:transition>'
done = 0
for fn in list(files):
    m = re.match(r"ppt/slides/slide(\d+)\.xml$", fn)
    if not m:
        continue
    t = files[fn].decode("utf8")
    rels_fn = f"ppt/slides/_rels/slide{m.group(1)}.xml.rels"
    rels = files[rels_fn].decode("utf8")
    add = []

    def sub(mo):
        global done
        name = mo.group(2)
        if name not in links:
            raise SystemExit(f"slide {m.group(1)}: link name not in map: {name}")
        rid = f"rIdJump{len(add) + 1}"
        add.append(f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slide{links[name]}.xml"/>')
        done += 1
        inner = f'<a:hlinkClick r:id="{rid}" action="ppaction://hlinksldjump"/>'
        head = f'<p:cNvPr id="{mo.group(1)}" name="{name}"{mo.group(3)}>'
        return head + inner + ("</p:cNvPr>" if mo.group(4) == "/>" else "")

    t = re.sub(r'<p:cNvPr id="(\d+)" name="([^"]* LINK:[^"]+)"([^>]*?)(/?>)', sub, t)
    if "<p:transition" not in t:
        t = t.replace("</p:clrMapOvr>", "</p:clrMapOvr>" + TRANS, 1) if "</p:clrMapOvr>" in t else t.replace("</p:sld>", TRANS + "</p:sld>")
    files[fn] = t.encode("utf8")
    if add:
        files[rels_fn] = rels.replace("</Relationships>", "".join(add) + "</Relationships>").encode("utf8")

out = zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED)
for i in zin.infolist():
    out.writestr(i, files[i.filename])
out.close()
print(f"{dst}: {done} linked objects (map has {len(links)})")
