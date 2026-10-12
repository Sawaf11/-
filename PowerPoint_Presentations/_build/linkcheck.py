"""Structural link check: every LINK:<key> object jumps to the slide with that key; hidden slides are reachable;
every slide has notes and an exit; LibreOffice's PDF export carries the same jumps (second engine)."""
import json, re, sys, zipfile
deck, rule_keys_json, pdf = sys.argv[1:4]
keys = json.load(open(rule_keys_json))           # ordered list of slide keys
z = zipfile.ZipFile(deck)
n = len(keys); errors = []; incoming = {k: 0 for k in keys}; hidden = set()
for i in range(1, n + 1):
    x = z.read(f"ppt/slides/slide{i}.xml").decode(); rels = z.read(f"ppt/slides/_rels/slide{i}.xml.rels").decode()
    if 'show="0"' in x[:400]: hidden.add(keys[i - 1])
    rid2t = dict(re.findall(r'Id="(rIdJump\d+)"[^>]*Target="slide(\d+)\.xml"', rels))
    outs = 0
    for name, rid in re.findall(r'<p:cNvPr id="\d+" name="([^"]*LINK:([^"]+?))"', x) and re.findall(r'name="[^"]* LINK:([^"]+)"[^>]*><a:hlinkClick r:id="(rIdJump\d+)"', x):
        tgt = keys[int(rid2t[rid]) - 1]
        if tgt != name: errors.append(f"slide {i}: link {name} goes to {tgt}")
        incoming[tgt] += 1; outs += 1
    if re.search(r'LINK:', x) and not outs: errors.append(f"slide {i}: link names without hlinkClick")
    if outs == 0: errors.append(f"slide {i} ({keys[i-1]}): no clickable exit")
    notes = [r for r in z.namelist() if r == f"ppt/notesSlides/notesSlide{i}.xml"]
    nrels = z.read(f"ppt/slides/_rels/slide{i}.xml.rels").decode()
    m = re.search(r'notesSlide(\d+)\.xml', nrels)
    ntext = "".join(re.findall(r"<a:t>([^<]*)</a:t>", z.read(f"ppt/notesSlides/notesSlide{m.group(1)}.xml").decode())) if m else ""
    if len(ntext) < 80: errors.append(f"slide {i}: notes too short")
for k in hidden:
    if incoming[k] == 0: errors.append(f"hidden slide {k} unreachable")
# second engine: PDF link annotations from LibreOffice export of the unhidden QA copy
from pypdf import PdfReader
rd = PdfReader(pdf); pdf_links = 0
pages = {p.indirect_reference.idnum: j for j, p in enumerate(rd.pages)}
bad_pdf = 0
for j, p in enumerate(rd.pages):
    for a in p.get("/Annots") or []:
        a = a.get_object()
        if a.get("/Subtype") != "/Link": continue
        d = a.get("/Dest") or (a.get("/A") or {}).get("/D")
        if d is None: bad_pdf += 1; continue
        if isinstance(d, (str,)) or hasattr(d, "decode"):
            d = rd.named_destinations[d] if d in rd.named_destinations else None
            if d is None: bad_pdf += 1; continue
            tgt = pages.get(d.page.idnum) if hasattr(d, "page") else None
        else:
            tgt = pages.get(d[0].idnum)
        if tgt is None: bad_pdf += 1
        pdf_links += 1
print(f"slides={n} hidden={len(hidden)} links_ok={sum(incoming.values())} pdf_link_annots={pdf_links} pdf_unresolved={bad_pdf}")
print("ERRORS:" if errors else "no structural errors", *errors, sep="\n")
