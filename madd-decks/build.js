const pptxgen = require("pptxgenjs");
const MODE = process.env.MODE;                 // "alif" (big alif madd) or "dagger" (dagger alif)
const T = new pptxgen().ShapeType;
const FATHA = "\u064E", ALIF = "ا", SMALL = 0.65;   // small alif = 65% of letter size
const FONT = "Arial", INK = "16213E", BG = "1B2A5C";
const RING = ["E8604C", "3A8FD9", "2FB57A"];
let pres;

function arText(s, text, o) {
  s.addText(text, Object.assign({ fontFace: FONT, color: INK, align: "center", valign: "middle",
    margin: 0, isTextBox: true, rtlMode: true, lang: "ar-SA", fit: "none" }, o));
}
function deco(s) {
  const d = (shape, x, y, w, h, color, name, extra) =>
    s.addShape(shape, Object.assign({ x, y, w, h, fill: { color }, line: { color, width: 0 }, objectName: name }, extra || {}));
  // planet surfaces along the bottom
  d(T.ellipse, -1.2, 5.1, 5.2, 1.5, "5B4B9A", "Deco ground left");
  d(T.ellipse, 4.6, 5.2, 6.4, 1.5, "7A63C4", "Deco ground right");
  // stars along the top edge and lower corners
  [[0.5,1.25,0.2],[1.6,0.85,0.25],[2.5,0.3,0.3],[3.7,0.7,0.2],[5.2,0.25,0.25],[6.3,0.8,0.22],[7.4,0.35,0.28],[9.35,1.3,0.2],[1.9,4.6,0.22],[3.0,4.95,0.18],[7.0,4.9,0.2],[8.0,4.55,0.24]]
    .forEach(([x,y,z],i)=> d(T.star5, x, y, z, z, i%2 ? "FFFFFF" : "FFD23F", "Deco star "+(i+1)));
  // moon (top-left) and ringed planet (top-right)
  d(T.moon, 0.35, 0.3, 0.6, 0.9, "FFE48A", "Deco moon");
  d(T.ellipse, 8.55, 0.3, 0.85, 0.85, "FF8A5B", "Deco planet");
  s.addShape(T.ellipse, { x: 8.25, y: 0.58, w: 1.45, h: 0.3, fill: { color: "FFD23F", transparency: 100 },
    line: { color: "FFD23F", width: 3 }, objectName: "Deco planet ring" });
  // friendly alien (bottom-left) and rocket (bottom-right)
  d(T.smileyFace, 0.4, 4.45, 0.8, 0.8, "8ED98F", "Deco alien");
  d(T.triangle, 9.0, 3.95, 0.45, 0.35, "E8604C", "Deco rocket nose");
  d(T.roundRect, 9.0, 4.25, 0.45, 0.85, "FFFFFF", "Deco rocket body", { rectRadius: 0.08 });
  d(T.ellipse, 9.1, 4.45, 0.25, 0.25, "3A8FD9", "Deco rocket window");
  d(T.triangle, 9.05, 5.1, 0.35, 0.3, "FFB347", "Deco rocket flame", { rotate: 180 });
}

function drawSlides(SLIDES) {
  SLIDES.forEach((letters) => {
    const s = pres.addSlide();
    s.background = { color: BG };
    deco(s);
    const n = letters.length, X = letters[n - 1];
    const prefix = letters.slice(0, n - 1).map(l => l + FATHA).join("");
    const result = MODE === "alif"
      ? prefix + X + FATHA + ALIF
      : [{ text: prefix + X + FATHA, options: {} }, { text: ALIF, options: { fontSize: SMALL * (n === 2 ? 90 : 66) } }];
    const CY = 2.8;
    let g, cx = [];
    if (n === 1) g = { d: 3.4, fs: 130, rs: 0 };
    else if (n === 2) g = { d: 1.9, gap: 0.7, zone: 1.0, pw: 3.0, ph: 2.2, fs: MODE === "alif" ? 78 : 84, rs: 90, plus: 0.45, aw: 0.7 };
    else g = { d: 1.4, gap: 0.55, zone: 0.85, pw: 2.55, ph: 2.0, fs: MODE === "alif" ? 54 : 60, rs: 66, plus: 0.38, aw: 0.6 };
    if (n === 1) cx = [5 - g.d / 2];
    else {
      let right = n === 2 ? 9.25 : 9.35;
      for (let i = 0; i < n; i++) { cx.push(right - g.d); right = right - g.d - g.gap; }
    }
    const ringCol = i => n === 1 ? RING[1] : (n === 2 ? [RING[0], RING[2]][i] : RING[i]);
    letters.forEach((l, i) => s.addShape(T.ellipse, { x: cx[i], y: CY - g.d / 2, w: g.d, h: g.d,
      fill: { color: "FFFFFF" }, line: { color: ringCol(i), width: n === 1 ? 10 : 8 }, objectName: `Circle ${i + 1}` }));
    let panelX = 0;
    if (n > 1) {
      const leftSrc = cx[n - 1];
      panelX = leftSrc - g.zone - g.pw;
      s.addShape(T.roundRect, { x: panelX, y: CY - g.ph / 2, w: g.pw, h: g.ph, rectRadius: 0.3,
        fill: { color: "FFFBE3" }, line: { color: "F2B134", width: 6 }, objectName: "Result panel" });
      for (let i = 0; i < n - 1; i++) {
        const mid = cx[i] - g.gap / 2;
        s.addShape(T.mathPlus, { x: mid - g.plus / 2, y: CY - g.plus / 2, w: g.plus, h: g.plus,
          fill: { color: "FFB347" }, line: { color: "FFB347", width: 0 }, objectName: `P${i + 1} plus` });
      }
      s.addShape(T.leftArrow, { x: leftSrc - g.zone / 2 - g.aw / 2, y: CY - 0.28, w: g.aw, h: 0.56,
        fill: { color: "FFD23F" }, line: { color: "FFD23F", width: 0 }, objectName: "A arrow" });
    }
    letters.forEach((l, i) => {
      const last = i === n - 1;
      const o = { x: cx[i], y: CY - g.d / 2, w: g.d, h: g.d, fontSize: g.fs };
      if (last) {                                 // letter sits right, alif is its own object on the left
        const big = MODE === "alif";
        const o1 = Object.assign({}, o, { x: cx[i] + (big ? 0.0046 : 0.0042) * g.fs });
        arText(s, l, Object.assign({ objectName: `L${i + 1} letter` }, o1));
        arText(s, l + FATHA, Object.assign({ objectName: `F${i + 1} fathah` }, o1));
        const af = big ? g.fs : SMALL * g.fs;   // small alif is drawn on the letter's baseline
        arText(s, ALIF, Object.assign({ objectName: `M${i + 1} alif` }, o,
          { x: cx[i] - (big ? 0.0078 : 0.0068) * g.fs, fontSize: af, y: o.y + (big ? 0 : 0.33 * (g.fs - af) / 72) }));
      } else {
        arText(s, l, Object.assign({ objectName: `L${i + 1} letter` }, o));
        arText(s, l + FATHA, Object.assign({ objectName: `F${i + 1} fathah` }, o));
      }
    });
    if (n > 1) arText(s, result, { x: panelX, y: CY - g.ph / 2, w: g.pw, h: g.ph, fontSize: g.rs, objectName: "R result" });
  });
}

const POOL = ["أ","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش"];
const MID = [["ب","ت"],["ت","ب"],["ث","ب"],["ج","ب"],["ح","ب"],["خ","ب"],["ب","أ"]];
const FAMILIES = [
  ["01-ba-ta-tha", ["ب","ت","ث"]], ["02-noon-ya", ["ن","ي"]], ["03-jeem-ha-kha", ["ج","ح","خ"]],
  ["04-dal-dhal", ["د","ذ"]], ["05-ra-zay", ["ر","ز"]], ["06-seen-sheen", ["س","ش"]],
  ["07-sad-dad", ["ص","ض"]], ["08-ta-dha", ["ط","ظ"]], ["09-ain-ghain", ["ع","غ"]],
  ["10-fa-qaf", ["ف","ق"]], ["11-kaf", ["ك"]], ["12-lam", ["ل"]], ["13-meem", ["م"]],
  ["14-ha", ["ه"]], ["15-waw", ["و"]],
];
const pairs = X => POOL.filter(l => l !== X).slice(0, 7).map(l => [l, X]);
const triples = X => MID.map(([a, b]) => {
  const alt = X === "س" ? "ش" : "س";
  if (b === X) b = alt;
  if (a === X) a = alt;
  return [a, b, X];
});
(async () => {
  for (const [file, members] of FAMILIES) {
    pres = new pptxgen();
    pres.layout = "LAYOUT_16x9";
    pres.title = "Arabic madd " + MODE + " " + file;
    const slides = [];
    members.forEach(X => { slides.push([X]); pairs(X).forEach(p => slides.push(p)); });
    members.forEach(X => triples(X).forEach(t => slides.push(t)));
    drawSlides(slides);
    await pres.writeFile({ fileName: file + ".raw.pptx" });
  }
})();
