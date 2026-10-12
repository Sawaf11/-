import sys, os
sys.path.insert(0, os.path.dirname(__file__))
import pptx_kit as K, build_game
out = sys.argv[1]
K.PREVIEW = 'preview' in sys.argv
build_game.AR = '--ar' in sys.argv
d = K.Deck(); build_game.build(d); d.save(out)
print('slides:', len(d.slides), 'preview' if K.PREVIEW else 'final')
