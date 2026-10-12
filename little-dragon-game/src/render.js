// Renders a list of SVG sprites to PNG/JPG with Chromium (Playwright).
// usage: node render.js manifest.json   manifest = [{name,w,h,svg,fmt?}]
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
(async () => {
  const items = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const outDir = process.argv[3];
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  for (const it of items) {
    await page.setViewportSize({ width: it.w, height: it.h });
    const html = `<html><body style="margin:0;background:transparent;overflow:hidden">${it.svg}</body></html>`;
    await page.setContent(html);
    const fmt = it.fmt || 'png';
    const file = `${outDir}/${it.name}.${fmt}`;
    if (fmt === 'jpeg' || fmt === 'jpg') await page.screenshot({ path: file, type: 'jpeg', quality: 90 });
    else await page.screenshot({ path: file, omitBackground: true });
    console.log('rendered', file);
  }
  await browser.close();
})();
