import sys, os
sys.path.insert(0, os.path.dirname(__file__))
import pptx_kit as K, build_game
out = sys.argv[1]
K.PREVIEW = (len(sys.argv) > 2 and sys.argv[2] == 'preview')
d = K.Deck(); build_game.build(d); d.save(out)
print('slides:', len(d.slides), 'preview' if K.PREVIEW else 'final')
