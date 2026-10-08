const pptxgen = require("pptxgenjs");
let pres;
const T = new pptxgen().ShapeType;
const FATHA = "َ";
const FONT = "Arial";
const INK = "16213E";
const BG = "DDF1FF";
const RING = ["E8604C", "3A8FD9", "2FB57A"];       // right, middle, left source circle

function arText(s, text, o) {
  s.addText(text, Object.assign({ fontFace: FONT, color: INK, align: "center", valign: "middle",
    margin: 0, isTextBox: true, rtlMode: true, lang: "ar-SA", fit: "none" }, o));
}
function deco(s) {
  const d = (shape, x, y, w, h, color, name, extra) =>
    s.addShape(shape, Object.assign({ x, y, w, h, fill: { color }, line: { color, width: 0 }, objectName: name }, extra || {}));
  // hills along the bottom
  d(T.ellipse, -1.0, 5.05, 5.0, 1.5, "8ED98F", "Deco hill left");
  d(T.ellipse, 4.6, 5.15, 6.2, 1.5, "6CCB7A", "Deco hill right");
  // sun and cloud (top corners)
  d(T.sun, 0.35, 0.25, 1.0, 1.0, "FFD23F", "Deco sun");
  d(T.cloud, 7.6, 0.25, 1.7, 0.9, "FFFFFF", "Deco cloud");
  d(T.cloud, 8.5, 0.85, 1.0, 0.55, "F2FAFF", "Deco cloud small");
  // friendly characters at the lower corners
  d(T.smileyFace, 0.4, 4.35, 0.8, 0.8, "FF9EC4", "Deco friend pink");
  d(T.smileyFace, 8.8, 4.35, 0.8, 0.8, "FFB347", "Deco friend orange");
  d(T.star5, 1.5, 4.7, 0.4, 0.4, "FFD23F", "Deco star 1");
  d(T.star5, 8.1, 4.7, 0.4, 0.4, "FFD23F", "Deco star 2");
  d(T.heart, 1.9, 0.5, 0.35, 0.32, "FF7A90", "Deco heart");
}

function drawSlides(pres, SLIDES) { SLIDES.forEach((letters) => {
  const s = pres.addSlide();
  s.background = { color: BG };
  deco(s);
  const n = letters.length;
  const result = letters.map(l => l + FATHA).join("");
  const CY = 2.8;
  if (n === 1) {
    const d = 3.4, x = 5 - d / 2, y = CY - d / 2;
    s.addShape(T.ellipse, { x, y, w: d, h: d, fill: { color: "FFFFFF" }, line: { color: RING[1], width: 10 }, objectName: "Circle 1" });
    arText(s, letters[0], { x, y, w: d, h: d, fontSize: 190, objectName: "L1 letter" });
    arText(s, letters[0] + FATHA, { x, y, w: d, h: d, fontSize: 190, objectName: "F1 fathah" });
    return;
  }
  const g = n === 2
    ? { d: 1.9, gap: 0.7, zone: 1.0, pw: 3.0, ph: 2.2, fs: 90, rs: 96, plus: 0.45, aw: 0.7 }
    : { d: 1.4, gap: 0.55, zone: 0.85, pw: 2.55, ph: 2.0, fs: 66, rs: 72, plus: 0.38, aw: 0.6 };
  let right = n === 2 ? 9.25 : 9.35;
  const cx = [];
  for (let i = 0; i < n; i++) { cx.push(right - g.d); right = right - g.d - g.gap; }
  // draw circles first so they sit behind text
  letters.forEach((l, i) => {
    s.addShape(T.ellipse, { x: cx[i], y: CY - g.d / 2, w: g.d, h: g.d, fill: { color: "FFFFFF" },
      line: { color: n === 2 ? [RING[0], RING[2]][i] : RING[i], width: 8 }, objectName: `Circle ${i + 1}` });
  });
  const leftSrc = cx[n - 1];
  const panelX = leftSrc - g.zone - g.pw;
  s.addShape(T.roundRect, { x: panelX, y: CY - g.ph / 2, w: g.pw, h: g.ph, rectRadius: 0.3,
    fill: { color: "FFFBE3" }, line: { color: "F2B134", width: 6 }, objectName: "Result panel" });
  // plus signs, arrow
  for (let i = 0; i < n - 1; i++) {
    const mid = cx[i] - g.gap / 2;
    s.addShape(T.mathPlus, { x: mid - g.plus / 2, y: CY - g.plus / 2, w: g.plus, h: g.plus,
      fill: { color: "F2994A" }, line: { color: "F2994A", width: 0 }, objectName: `P${i + 1} plus` });
  }
  s.addShape(T.leftArrow, { x: leftSrc - g.zone / 2 - g.aw / 2, y: CY - 0.28, w: g.aw, h: 0.56,
    fill: { color: "8E5BD0" }, line: { color: "8E5BD0", width: 0 }, objectName: "A arrow" });
  // letters + fathah overlays + result
  letters.forEach((l, i) => {
    const o = { x: cx[i], y: CY - g.d / 2, w: g.d, h: g.d, fontSize: g.fs };
    arText(s, l, Object.assign({ objectName: `L${i + 1} letter` }, o));
    arText(s, l + FATHA, Object.assign({ objectName: `F${i + 1} fathah` }, o));
  });
  arText(s, result, { x: panelX, y: CY - g.ph / 2, w: g.pw, h: g.ph, fontSize: g.rs, objectName: "R result" });
}); }

const POOL = ["أ","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش"];
const MID = [["ب","ت"],["ت","ب"],["ث","ب"],["ج","ب"],["ح","ب"],["خ","ب"],["ب","أ"]];
const FAMILIES = [
  ["01-alif", ["أ"]], ["02-ba-ta-tha", ["ب","ت","ث"]], ["03-noon-ya", ["ن","ي"]],
  ["04-jeem-ha-kha", ["ج","ح","خ"]], ["05-dal-dhal", ["د","ذ"]], ["06-ra-zay", ["ر","ز"]],
  ["07-seen-sheen", ["س","ش"]], ["08-sad-dad", ["ص","ض"]], ["09-ta-dha", ["ط","ظ"]],
  ["10-ain-ghain", ["ع","غ"]], ["11-fa-qaf", ["ف","ق"]], ["12-kaf", ["ك"]],
  ["13-lam", ["ل"]], ["14-meem", ["م"]], ["15-ha", ["ه"]], ["16-waw", ["و"]],
];
const pairs = X => POOL.filter(l => l !== X).slice(0, 7).map(l => [l, X]);
const triples = X => MID.map(([a, b]) => {
  if (b === X) b = X === "س" ? "ش" : "س";
  if (a === X) a = X === "س" ? "ش" : "س";
  return [a, b, X];
});
(async () => {
  for (const [file, members] of FAMILIES) {
    pres = new pptxgen();
    pres.layout = "LAYOUT_16x9";
    pres.title = "Arabic letters with fathah " + file;
    const slides = [];
    members.forEach(X => { slides.push([X]); pairs(X).forEach(p => slides.push(p)); });
    members.forEach(X => triples(X).forEach(t => slides.push(t)));
    drawSlides(pres, slides);
    await pres.writeFile({ fileName: file + ".raw.pptx" });
    console.log(file, slides.length);
  }
})();
