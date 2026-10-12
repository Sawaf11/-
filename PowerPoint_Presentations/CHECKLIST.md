# PowerPoint collection: progress

| # | Rule | Source package | Deck | Status |
|---|------|----------------|------|--------|
| 003 | Ghunnah on doubled noon (غنة النون المشددة) | Rule_Explanation.docx + 4 lesson cards | `003-Ghunnah-on-Doubled-Noon.pptx` | Done: 18 main slides + 14 hidden feedback/reference slides |

Checks per deck: `validate.py` passes; every slide (hidden ones too) rendered and inspected; 169 slide-jump links checked
structurally and read back by LibreOffice (ODP export) with correct targets; notes on every slide; Arabic excerpts
match the source text codepoint for codepoint. Not tested: live playback in Microsoft PowerPoint.

## Source issues (flagged, not corrected)
- Card 3 prints the focus labels (الجنة, إن) without shaddah or vowels; the full excerpts are correct.
- Title says "doubled noon", but the rule text covers noon **and** meem with shaddah; both examples use noon.
- The Word file cites `Source_Issues.md` at the collection root; it was not included in the package.
- Activity 1 counts ٱلنَّاسِ as a second doubled noon in 114:6 (the source marks only ٱلْجِنَّةِ as the focus); it meets the stated condition.

## Build
`_build/` holds the reusable generator: `build.js` (design system), `renderers.js` (slide types),
`rule-003.js` (content + teacher notes), `post.py` (click links + fade transitions), `linkcheck.py`, `qa.sh`.
New rule = copy `rule-003.js`, change content/palette, run `qa.sh`.
Arabic font in the deck: Traditional Arabic (QA renders used Amiri as a stand-in).
