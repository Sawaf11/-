import zipfile, re, sys, shutil
src, dst = sys.argv[1], sys.argv[2]
M = ('<mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006">'
 '<mc:Choice xmlns:p159="http://schemas.microsoft.com/office/powerpoint/2015/09/main" Requires="p159">'
 '<p:transition spd="slow"><p159:morph option="byObject"/></p:transition></mc:Choice>'
 '<mc:Fallback><p:transition spd="slow"><p:fade/></p:transition></mc:Fallback></mc:AlternateContent>')
zin = zipfile.ZipFile(src); zout = zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED)
for it in zin.infolist():
    d = zin.read(it.filename)
    if re.match(r"ppt/slides/slide\d+\.xml$", it.filename) and it.filename != "ppt/slides/slide1.xml":
        t = d.decode("utf8")
        t = t.replace("</p:clrMapOvr>", "</p:clrMapOvr>" + M, 1)
        d = t.encode("utf8")
    zout.writestr(it, d)
zout.close()
