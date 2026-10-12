#!/usr/bin/env bash
# Rebuilds every asset and the .pptx from source (needs: node + playwright/chromium, python3 + numpy, python-pptx, Pillow, lxml).
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p assets/img assets/audio previews /tmp/ldmw
node src/poses.js /tmp/ldmw/lumi.json && node src/render.js /tmp/ldmw/lumi.json assets/img >/dev/null
node src/art_bg.js /tmp/ldmw/bg.json && node src/render.js /tmp/ldmw/bg.json assets/img >/dev/null
node src/art_props.js /tmp/ldmw/props.json && node src/render.js /tmp/ldmw/props.json assets/img >/dev/null
python3 -c "from PIL import Image; Image.new('RGBA',(16,16),(0,0,0,0)).save('assets/img/blank.png')"
python3 src/audio_gen.py >/dev/null
python3 src/make.py Little_Dragon_Magic_World.pptx
python3 src/verify_pptx.py Little_Dragon_Magic_World.pptx
python3 src/verify_flow.py Little_Dragon_Magic_World.pptx
python3 src/keyframes.py
