// usage: node render.js <outDir> <fps> <startFrame> <endFrame(exclusive)> [step]
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const [out, fps, s, e, step = 1] = [process.argv[2], +process.argv[3], +process.argv[4], +process.argv[5], +(process.argv[6] || 1)];
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--disable-gpu'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.error('PAGEERR', e.message));
  await p.goto('file://' + path.resolve(__dirname, 'index.html'));
  const el = await p.$('#c');
  const t0 = Date.now();
  for (let f = s; f < e; f += step) {
    await p.evaluate(t => window.renderFrame(t), f / fps);
    await el.screenshot({ path: `${out}/f${String(f).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 });
  }
  console.log('done', s, e, ((Date.now() - t0) / 1000).toFixed(1) + 's');
  await b.close();
})();
