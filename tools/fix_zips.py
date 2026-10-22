"""Apply ooxml_fix to every .pptx stored inside the given .zip files (rewritten in place)."""
import sys, zipfile, os, tempfile, shutil
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ooxml_fix import fix
for zpath in sys.argv[1:]:
    work = tempfile.mkdtemp()
    zin = zipfile.ZipFile(zpath); names = zin.namelist(); zin.extractall(work); zin.close()
    for n in names:
        if n.endswith(".pptx"): fix(os.path.join(work, n))
    fd, tmp = tempfile.mkstemp(suffix=".zip", dir=os.path.dirname(os.path.abspath(zpath))); os.close(fd)
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as z:
        for n in names: z.write(os.path.join(work, n), n)
    shutil.move(tmp, zpath); shutil.rmtree(work)
print(len(sys.argv) - 1, "zips fixed")
