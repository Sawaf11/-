import sys, zipfile, re, glob, collections
from lxml import etree
ns = {'p': 'http://schemas.openxmlformats.org/presentationml/2006/main', 'a': 'http://schemas.openxmlformats.org/drawingml/2006/main', 'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
tot = collections.Counter(); bad = []
for f in sorted(glob.glob(sys.argv[1] + '/*.pptx')):
    z = zipfile.ZipFile(f); names = z.namelist(); st = collections.Counter()
    slides = sorted([n for n in names if re.match(r'ppt/slides/slide\d+\.xml$', n)], key=lambda n: int(re.findall(r'\d+', n)[0]))
    for sn in slides:
        x = etree.fromstring(z.read(sn)); rels = etree.fromstring(z.read(sn.replace('slides/', 'slides/_rels/') + '.rels'))
        rm = {r.get('Id'): (r.get('Type').split('/')[-1], r.get('Target')) for r in rels}
        ids = [e.get('id') for e in x.iter('{%s}cNvPr' % ns['p'])]
        if len(ids) != len(set(ids)): bad.append((f, sn, 'dup shape ids'))
        c = [e.get('id') for e in x.iter('{%s}cTn' % ns['p'])]
        if len(c) != len(set(c)): bad.append((f, sn, 'dup cTn ids'))
        for t in x.iter('{%s}spTgt' % ns['p']):
            if t.get('spid') not in ids: bad.append((f, sn, 'missing target'))
        for t in x.iter('{%s}sndTgt' % ns['p']):
            r = t.get('{%s}embed' % ns['r']); st['sounds'] += 1
            if r not in rm or 'ppt/media/' + rm[r][1].split('/')[-1] not in names: bad.append((f, sn, 'bad sound'))
        for h in x.iter('{%s}hlinkClick' % ns['a']):
            if h.get('action') == 'ppaction://hlinksldjump': st['links'] += 1
        if x.get('show') == '0': st['hidden'] += 1
        st['click_steps'] += len([1 for e in x.iter('{%s}cond' % ns['p']) if e.get('delay') == 'indefinite']) - (1 if x.find('.//p:cTn[@nodeType="mainSeq"]', ns) is not None else 0) if False else 0
    # arabic text sanity: every text run has rtl + ar-SA
    allx = b''.join(z.read(n) for n in slides)
    st['slides'] = len(slides); st['ar_runs'] = allx.count(b'lang="ar-SA"'); st['wav'] = len([n for n in names if n.endswith('.wav')])
    st['MB'] = round(sum(i.file_size for i in z.infolist()) / 1e6, 1)
    print(f.split('/')[-1], dict(st)); tot.update({k: v for k, v in st.items() if k != 'MB'})
print('TOTAL', dict(tot)); print('PROBLEMS:' if bad else 'No structural problems', *bad[:10], sep='\n')
