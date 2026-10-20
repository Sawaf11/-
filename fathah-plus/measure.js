// Measures the ink box of Arabic strings (letters, harakat, words, sentences) in a real browser,
// so build.js can pick font sizes that keep every glyph and every fathah inside its shape.
// Two fonts are measured (DejaVu Sans + Noto Sans Arabic) and the larger box wins: both are
// bigger than Arial's Arabic glyphs, so a size that fits here also fits in PowerPoint.
const path = require("path");
const fs = require("fs");
const { chromium } = require(process.env.PLAYWRIGHT || "/opt/node-tools/node_modules/playwright");
const FONTS = {
  dejavu: "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
  noto: require.resolve("@fontsource/noto-sans-arabic/files/noto-sans-arabic-arabic-400-normal.woff2"),
};
module.exports = async function measure(strings) {
  const html = path.join(__dirname, ".measure.html");
  fs.writeFileSync(html, "<style>" + Object.entries(FONTS).map(([n, f]) =>
    `@font-face{font-family:${n};src:url("file://${f}")}`).join("") + "</style>" +
    Object.keys(FONTS).map(n => `<span style="font-family:${n}">بَ</span>`).join(""));
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const page = await browser.newPage();
  await page.goto("file://" + html);
  await page.evaluate(() => document.fonts.ready);
  const out = await page.evaluate(([list, names]) => {
    const c = document.createElement("canvas").getContext("2d");
    c.textAlign = "center"; c.direction = "rtl";
    const res = {};
    for (const s of list) {
      const m = { l: 0, r: 0, a: 0, d: 0 };
      for (const n of names) {
        c.font = `100px ${n}`;
        const t = c.measureText(s);
        m.l = Math.max(m.l, t.actualBoundingBoxLeft / 100); m.r = Math.max(m.r, t.actualBoundingBoxRight / 100);
        m.a = Math.max(m.a, t.actualBoundingBoxAscent / 100); m.d = Math.max(m.d, t.actualBoundingBoxDescent / 100);
      }
      res[s] = m;                                  // per em: ink left/right of centre, ascent/descent from baseline
    }
    return res;
  }, [[...new Set(strings)], Object.keys(FONTS)]);
  await browser.close();
  fs.unlinkSync(html);
  return out;
};
