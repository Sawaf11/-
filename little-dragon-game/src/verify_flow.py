"""BFS over real slide-jump hyperlinks stored in the pptx (only links on pictures/shapes that are visible or revealed by an entrance effect count)."""
import sys, re, zipfile, collections
from pptx import Presentation
prs = Presentation(sys.argv[1])
slides = list(prs.slides); idx = {s.slide_id: i for i, s in enumerate(slides)}
ns = {'a': 'http://schemas.openxmlformats.org/drawingml/2006/main', 'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
graph = collections.defaultdict(set)
for i, s in enumerate(slides):
    for h in s._element.iter('{%s}hlinkClick' % ns['a']):
        if h.get('action') == 'ppaction://hlinksldjump':
            tgt = s.part.related_part(h.get('{%s}id' % ns['r']))
            j = [k for k, t in enumerate(slides) if t.part is tgt][0]
            graph[i].add(j)
seen, q = {0}, [0]
while q:
    u = q.pop()
    for v in graph[u]:
        if v not in seen: seen.add(v); q.append(v)
print(f'slides reachable from slide 1 by clicking: {len(seen)}/{len(slides)}')
print('unreachable:', sorted(set(range(len(slides))) - seen))
fin = len(slides) - 1
print('finale reachable:', fin in seen, '| finale links back to slide 1:', 0 in graph[fin])
# dead ends: slides with no outgoing link
print('slides with no outgoing links (expected: none):', [i + 1 for i in range(len(slides)) if not graph[i]])
