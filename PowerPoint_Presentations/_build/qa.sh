# Build one rule deck, add links/transitions, validate, and render every slide (hidden ones too) for visual QA.
# usage: SKILL=<pptx skill dir> bash qa.sh rule-003.js ../003-Ghunnah-on-Doubled-Noon.pptx
# needs: npm i pptxgenjs sharp react react-dom react-icons ; pip install pypdf ; an Arabic font for QA renders
set -e
cd "$(dirname "$0")"; RULE=$1; OUT=$2
node build.js $RULE deck.pptx >/dev/null && python3 post.py deck.pptx deck.links.json "$OUT"
python3 "$SKILL/scripts/office/validate.py" "$OUT" | tail -1
node -e "console.log(JSON.stringify(require('./$RULE').slides.map(s=>s.key)))" > keys.json
python3 -c "
import zipfile,sys
zi=zipfile.ZipFile(sys.argv[1]); zo=zipfile.ZipFile('qa.pptx','w',zipfile.ZIP_DEFLATED)
for i in zi.infolist():
  d=zi.read(i.filename)
  if i.filename.startswith('ppt/slides/slide'): d=d.replace(b' show=\"0\"',b'')
  zo.writestr(i,d)
zo.close()" "$OUT"
rm -rf r; mkdir r
python3 "$SKILL/scripts/office/soffice.py" --headless --convert-to pdf --outdir r qa.pptx >/dev/null 2>&1
pdftoppm -jpeg -r 60 r/qa.pdf r/s 2>/dev/null
python3 linkcheck.py "$OUT" keys.json r/qa.pdf
rm -f deck.pptx deck.links.json qa.pptx keys.json
