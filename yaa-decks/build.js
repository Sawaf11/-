const pptxgen = require("pptxgenjs");
const MODE = process.env.MODE;                 // "big" (yaa letter) or "small" (Quranic small yaa after heh)
const T = new pptxgen().ShapeType;
const KASRA = "ِ", YAA = "ي", SMALLYAA = "ۦ";
const FONT = "Arial", INK = "16213E", BG = "DDF5C8";
const RING = ["E8604C", "3A8FD9", "2FB57A"];
let pres;

function arText(s, text, o) {
  s.addText(text, Object.assign({ fontFace: FONT, color: INK, align: "center", valign: "middle",
    margin: 0, isTextBox: true, rtlMode: true, lang: "ar-SA", fit: "none" }, o));
}
function deco(s) {
  const d = (shape, x, y, w, h, color, name, extra) =>
    s.addShape(shape, Object.assign({ x, y, w, h, fill: { color }, line: { color, width: 0 }, objectName: name }, extra || {}));
  d(T.ellipse, -1.2, 5.1, 5.4, 1.5, "7BD66B", "Deco grass left");
  d(T.ellipse, 4.5, 5.2, 6.4, 1.5, "5CC45A", "Deco grass right");
  // trees at the outer edges
  d(T.rect, 0.25, 3.7, 0.22, 1.1, "9A6B3F", "Deco trunk left");
  d(T.ellipse, -0.15, 2.9, 1.0, 1.0, "2FA05A", "Deco crown left");
  d(T.ellipse, 0.15, 2.6, 0.8, 0.8, "3DB86A", "Deco crown left 2");
  d(T.rect, 9.55, 3.7, 0.22, 1.1, "9A6B3F", "Deco trunk right");
  d(T.ellipse, 9.2, 2.9, 1.0, 1.0, "2FA05A", "Deco crown right");
  d(T.ellipse, 9.2, 2.6, 0.8, 0.8, "3DB86A", "Deco crown right 2");
  // sun and clouds
  d(T.sun, 8.5, 0.25, 1.0, 1.0, "FFD23F", "Deco sun");
  d(T.cloud, 0.4, 0.25, 1.6, 0.85, "FFFFFF", "Deco cloud");
  d(T.cloud, 2.3, 0.6, 1.0, 0.55, "F4FFF0", "Deco cloud small");
  // butterflies
  [[6.6,0.5,"FF8A5B"],[1.4,4.5,"7C6CF0"]].forEach(([x,y,c],i)=>{
    d(T.ellipse, x, y, 0.28, 0.2, c, "Deco butterfly wing a"+i);
    d(T.ellipse, x+0.22, y, 0.28, 0.2, c, "Deco butterfly wing b"+i);
    d(T.ellipse, x+0.22, y+0.02, 0.06, 0.2, "16213E", "Deco butterfly body"+i);
  });
  // mushrooms (lower corners) and flowers
  d(T.rect, 8.2, 4.85, 0.2, 0.35, "FFF3D6", "Deco mushroom stem");
  d(T.ellipse, 7.95, 4.5, 0.7, 0.5, "E8604C", "Deco mushroom cap");
  d(T.ellipse, 8.15, 4.62, 0.12, 0.12, "FFFFFF", "Deco mushroom dot");
  d(T.smileyFace, 2.0, 4.6, 0.6, 0.6, "FFB347", "Deco friend");
  d(T.star5, 7.0, 4.75, 0.35, 0.35, "FFD23F", "Deco star");
}

// unit = { bare: letters as written (joined in circle), full: with marks, b: carries the yaa }
const U = (bare, full, b) => ({ bare, full, b: !!b });
function parseBig(w) {                       // "قِ^لَ": ^ after a unit = madd yaa follows it
  const units = [];
  for (const ch of w) {
    if (ch === "^") units[units.length - 1].b = true;
    else if (/[ً-ْ]/.test(ch)) { units[units.length - 1].full += ch; }
    else units.push({ bare: ch, full: ch, b: false });
  }
  return units;
}
const BIG2 = ["قِ^لَ","سِ^قَ","بِ^عَ","حِ^لَ","غِ^ضَ","كِ^لَ","زِ^دَ","حِ^نَ","دِ^نَ","طِ^نَ","رِ^حَ"];
const BIG3 = ["كَبِ^رَ","صَغِ^رَ","قَرِ^بَ","بَعِ^دَ","كَرِ^مَ","رَحِ^مَ","عَلِ^مَ","حَكِ^مَ","قَدِ^رَ","سَمِ^عَ","بَصِ^رَ","خَبِ^رَ","عَظِ^مَ","شَدِ^دَ","جَمِ^لَ","طَوِ^لَ","أَمِ^نَ","سِ^رَةَ","قِ^مَةَ"];
const H = U("ه", "هِ", true);
const SMALL2 = [[U("ب","بِ"), H]];
const SMALL3 = [
  [U("ر","رَ"), U("ب","بِّ"), H],        // رَبِّهِۦ
  [U("نف","نَفْ"), U("س","سِ"), H],      // نَفْسِهِۦ
  [U("قل","قَلْ"), U("ب","بِ"), H],      // قَلْبِهِۦ
  [U("أم","أَمْ"), U("ر","رِ"), H],      // أَمْرِهِۦ
  [U("قو","قَوْ"), U("م","مِ"), H],      // قَوْمِهِۦ
  [U("أه","أَهْ"), U("ل","لِ"), H],      // أَهْلِهِۦ
  [U("مث","مِثْ"), U("ل","لِ"), H],      // مِثْلِهِۦ
  [U("عب","عَبْ"), U("د","دِ"), H],      // عَبْدِهِۦ
  [U("عل","عِلْ"), U("م","مِ"), H],      // عِلْمِهِۦ
  [U("حم","حَمْ"), U("د","دِ"), H],      // حَمْدِهِۦ
  [U("إذ","إِذْ"), U("ن","نِ"), H],      // إِذْنِهِۦ
];
const slides = MODE === "big"
  ? [...BIG2.map(parseBig), ...BIG3.map(parseBig)]
  : [...SMALL2, ...SMALL3];

function drawSlides(SLIDES) {
  SLIDES.forEach((units) => {
    const s = pres.addSlide();
    s.background = { color: BG };
    deco(s);
    const n = units.length, CY = 2.8;
    const g = n === 2
      ? { d: 1.9, gap: 0.7, zone: 1.0, pw: 3.0, ph: 2.2, fs: MODE === "big" ? 66 : 80, rs: 90, plus: 0.45, aw: 0.7 }
      : { d: 1.4, gap: 0.55, zone: 0.85, pw: 2.55, ph: 2.0, fs: MODE === "big" ? 44 : 54, rs: 62, plus: 0.38, aw: 0.6 };
    let right = n === 2 ? 9.25 : 9.35; const cx = [];
    for (let i = 0; i < n; i++) { cx.push(right - g.d); right = right - g.d - g.gap; }
    units.forEach((u, i) => s.addShape(T.ellipse, { x: cx[i], y: CY - g.d / 2, w: g.d, h: g.d, fill: { color: "FFFFFF" },
      line: { color: n === 2 ? [RING[0], RING[2]][i] : RING[i], width: 8 }, objectName: `Circle ${i + 1}` }));
    const leftSrc = cx[n - 1], panelX = leftSrc - g.zone - g.pw;
    s.addShape(T.roundRect, { x: panelX, y: CY - g.ph / 2, w: g.pw, h: g.ph, rectRadius: 0.3,
      fill: { color: "FFFBE3" }, line: { color: "F2B134", width: 6 }, objectName: "Result panel" });
    for (let i = 0; i < n - 1; i++) {
      const mid = cx[i] - g.gap / 2;
      s.addShape(T.mathPlus, { x: mid - g.plus / 2, y: CY - g.plus / 2, w: g.plus, h: g.plus,
        fill: { color: "F2994A" }, line: { color: "F2994A", width: 0 }, objectName: `P${i + 1} plus` });
    }
    s.addShape(T.leftArrow, { x: leftSrc - g.zone / 2 - g.aw / 2, y: CY - 0.28, w: g.aw, h: 0.56,
      fill: { color: "8E5BD0" }, line: { color: "8E5BD0", width: 0 }, objectName: "A arrow" });
    units.forEach((u, i) => {
      const o = { x: cx[i], y: CY - g.d / 2, w: g.d, h: g.d, fontSize: g.fs };
      if (u.b) {
        const o1 = Object.assign({}, o, { x: cx[i] + 0.0046 * g.fs });
        arText(s, u.bare, Object.assign({ objectName: `L${i + 1} letter` }, o1));
        arText(s, u.full, Object.assign({ objectName: `F${i + 1} fathah` }, o1));
        arText(s, MODE === "big" ? YAA : SMALLYAA, Object.assign({ objectName: `M${i + 1} yaa` }, o, { x: cx[i] - 0.0078 * g.fs, fontSize: MODE === "big" ? g.fs : 1.5 * g.fs }));
      } else {
        arText(s, u.bare, Object.assign({ objectName: `L${i + 1} letter` }, o));
        arText(s, u.full, Object.assign({ objectName: `F${i + 1} fathah` }, o));
      }
    });
    const mark = MODE === "big" ? YAA : SMALLYAA;
    const runs = []; let acc = "";
    units.forEach(u => { acc += u.full; if (u.b) {
      if (MODE === "big") acc += mark; else { runs.push({ text: acc, options: {} }); runs.push({ text: mark, options: { fontSize: 1.5 * g.rs } }); acc = ""; } } });
    if (acc) runs.push({ text: acc, options: {} });
    arText(s, MODE === "big" ? runs.map(r => r.text).join("") : runs,
      { x: panelX, y: CY - g.ph / 2, w: g.pw, h: g.ph, fontSize: g.rs, objectName: "R result" });
  });
}
(async () => {
  pres = new pptxgen(); pres.layout = "LAYOUT_16x9";
  pres.title = "Madd with yaa " + MODE;
  drawSlides(slides);
  await pres.writeFile({ fileName: (MODE === "big" ? "Madd-Yaa-Big" : "Madd-Yaa-Small-Quranic") + ".raw.pptx" });
})();
