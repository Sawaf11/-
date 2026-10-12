"""Structural verification of the generated deck: ids, targets, audio rels, links, embedded media."""
import sys, zipfile, re, collections
from lxml import etree
z = zipfile.ZipFile(sys.argv[1])
ns = {'p': 'http://schemas.openxmlformats.org/presentationml/2006/main', 'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
slides = sorted([n for n in z.namelist() if re.match(r'ppt/slides/slide\d+\.xml$', n)], key=lambda n: int(re.findall(r'\d+', n)[0]))
errs, stats = [], collections.Counter()
for sn in slides:
    x = etree.fromstring(z.read(sn))
    rels = etree.fromstring(z.read(sn.replace('slides/', 'slides/_rels/') + '.rels'))
    rmap = {r.get('Id'): (r.get('Type').split('/')[-1], r.get('Target')) for r in rels}
    ids = [e.get('id') for e in x.iter('{%s}cNvPr' % ns['p'])]
    if len(ids) != len(set(ids)): errs.append(f'{sn}: duplicate shape ids')
    ctn = [e.get('id') for e in x.iter('{%s}cTn' % ns['p'])]
    if len(ctn) != len(set(ctn)): errs.append(f'{sn}: duplicate cTn ids')
    for t in x.iter('{%s}spTgt' % ns['p']):
        if t.get('spid') not in ids: errs.append(f'{sn}: timing targets missing shape {t.get("spid")}')
    for t in x.iter('{%s}sndTgt' % ns['p']):
        rid = t.get('{%s}embed' % ns['r']); stats['sound_effects'] += 1
        if rid not in rmap or rmap[rid][0] != 'audio': errs.append(f'{sn}: bad sound rel {rid}')
        elif ('ppt/media/' + rmap[rid][1].split('/')[-1]) not in z.namelist(): errs.append(f'{sn}: sound part missing')
    for h in x.iter('{%s}hlinkClick' % ns['a']):
        if h.get('action') == 'ppaction://hlinksldjump':
            rid = h.get('{%s}id' % ns['r']); stats['slide_links'] += 1
            if rid not in rmap or rmap[rid][0] != 'slide': errs.append(f'{sn}: bad link {rid}')
    stats['trigger_seqs'] += len(list(x.iter('{%s}cTn' % ns['p'])) and [c for c in x.iter('{%s}cTn' % ns['p']) if c.get('nodeType') == 'interactiveSeq'])
    if x.find('.//p:transition', ns) is None: errs.append(f'{sn}: no transition/advClick')
    elif x.find('.//p:transition', ns).get('advClick') != '0': errs.append(f'{sn}: advClick not disabled')
media = [n for n in z.namelist() if n.startswith('ppt/media/')]
print('slides', len(slides), '| media parts', len(media), '| wav', len([m for m in media if m.endswith('.wav')]), '|', dict(stats))
print('first slide has music shape:', b'ppaction://media' in z.read('ppt/slides/slide1.xml'), '| numSld=999:', b'numSld="999"' in z.read('ppt/slides/slide1.xml'))
print('ERRORS' if errs else 'No structural errors', *errs[:20], sep='\n')
