"""Make generated decks valid PresentationML (ISO/IEC 29500, checked with the official schema):
 - presentation.xml: children in schema order (pptxgenjs writes notesMasterIdLst after sldIdLst);
 - text paragraphs: one a:pPr, first in the paragraph (pptxgenjs repeats it before every coloured run).
usage: python3 ooxml_fix.py deck.pptx [...]   (files are rewritten in place)"""
import sys, zipfile, re, os, shutil, tempfile
from lxml import etree
P = "http://schemas.openxmlformats.org/presentationml/2006/main"
A = "http://schemas.openxmlformats.org/drawingml/2006/main"
ORDER = ["sldMasterIdLst", "notesMasterIdLst", "handoutMasterIdLst", "sldIdLst", "sldSz", "notesSz", "smartTags", "embeddedFontLst",
         "custShowLst", "photoAlbum", "custDataLst", "kinsoku", "defaultTextStyle", "modifyVerifier", "extLst"]

def fix_presentation(xml):
    root = etree.fromstring(xml)
    kids = list(root)
    for k in kids: root.remove(k)
    rank = lambda e: ORDER.index(etree.QName(e).localname) if etree.QName(e).localname in ORDER else len(ORDER)
    for k in sorted(kids, key=rank): root.append(k)
    return etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)

def fix_paragraphs(xml):
    root = etree.fromstring(xml); changed = False
    for p in root.iter(f"{{{A}}}p"):
        pprs = p.findall(f"{{{A}}}pPr")
        if not pprs: continue
        if len(pprs) > 1 or p.index(pprs[0]) != 0:
            keep = pprs[0]
            for e in pprs: p.remove(e)
            p.insert(0, keep); changed = True
    return etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True) if changed else xml

def fix(path):
    zin = zipfile.ZipFile(path)
    fd, tmp = tempfile.mkstemp(suffix=".pptx", dir=os.path.dirname(os.path.abspath(path))); os.close(fd)
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
        for it in zin.infolist():
            d = zin.read(it.filename)
            if it.filename == "ppt/presentation.xml": d = fix_presentation(d)
            elif re.match(r"ppt/(slides/slide|slideLayouts/slideLayout|slideMasters/slideMaster|notesSlides/notesSlide)\d+\.xml$", it.filename): d = fix_paragraphs(d)
            zout.writestr(it, d)
    zin.close(); shutil.move(tmp, path)

if __name__ == "__main__":
    for f in sys.argv[1:]: fix(f)
    print(len(sys.argv) - 1, "files fixed")
