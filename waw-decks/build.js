const pptxgen = require("pptxgenjs");
const MODE = process.env.MODE;                 // "big" (waw letter) or "small" (Quranic small waw after heh)
const T = new pptxgen().ShapeType;
const WAW = "و", SMALLWAW = "\u06E5", SUKUN = "\u06E1";   // SUKUN = head-of-haa (Uthmani) sukun
const FONT = process.env.FONT || (MODE === "small" ? "Traditional Arabic" : "Arial"), K = MODE === "small" ? 1.25 : 1, INK = "16213E", BG = "FFE1F0";
const RING = ["E8604C", "3A8FD9", "2FB57A"];
let pres;

function arText(s, text, o) {
  o = Object.assign({}, o, { fontSize: o.fontSize * K });
  if (Array.isArray(text)) text = text.map(r => ({ text: r.text, options: r.options.fontSize ? { fontSize: r.options.fontSize * K } : {} }));
  s.addText(text, Object.assign({ fontFace: FONT, color: INK, align: "center", valign: "middle",
    margin: 0, isTextBox: true, rtlMode: true, lang: "ar-SA", fit: "none" }, o));
}
function deco(s) {
  const d = (shape, x, y, w, h, color, name, extra) =>
    s.addShape(shape, Object.assign({ x, y, w, h, fill: { color }, line: { color, width: 0 }, objectName: name }, extra || {}));
  // sprinkle hills along the bottom
  d(T.ellipse, -1.2, 5.1, 5.4, 1.5, "FFB3D1", "Deco hill left");
  d(T.ellipse, 4.5, 5.2, 6.4, 1.5, "FF94C0", "Deco hill right");
  // rainbow in the top-left corner
  [["E8604C",2.0],["FFB347",1.7],["FFD23F",1.4],["5CC45A",1.1],["3A8FD9",0.8]].forEach(([c,r],i)=>
    d(T.ellipse, -r, -r, 2*r, 2*r, c, "Deco rainbow "+(i+1)));
  d(T.ellipse, -0.5, -0.5, 1.0, 1.0, "FFE1F0", "Deco rainbow centre");
  // clouds and candy at the top-right
  d(T.cloud, 7.7, 0.2, 1.7, 0.9, "FFFFFF", "Deco cloud");
  d(T.heart, 6.9, 0.55, 0.4, 0.36, "FF5C8A", "Deco heart");
  // lollipops at the side edges
  d(T.rect, 0.3, 3.45, 0.07, 1.4, "FFFFFF", "Deco lollipop stick 1");
  d(T.ellipse, 0.05, 2.95, 0.6, 0.6, "8E5BD0", "Deco lollipop 1");
  d(T.ellipse, 0.2, 3.1, 0.3, 0.3, "FFFFFF", "Deco lollipop swirl 1");
  d(T.rect, 9.6, 3.45, 0.07, 1.4, "FFFFFF", "Deco lollipop stick 2");
  d(T.ellipse, 9.35, 2.95, 0.6, 0.6, "3A8FD9", "Deco lollipop 2");
  d(T.ellipse, 9.5, 3.1, 0.3, 0.3, "FFFFFF", "Deco lollipop swirl 2");
  // cupcake and ice cream near the lower corners
  d(T.triangle, 1.25, 4.6, 0.6, 0.55, "C98B5B", "Deco cupcake cup", { rotate: 180 });
  d(T.cloud, 1.2, 4.2, 0.7, 0.5, "FF8AB3", "Deco cupcake frosting");
  d(T.ellipse, 1.5, 4.18, 0.14, 0.14, "E8604C", "Deco cupcake cherry");
  d(T.triangle, 8.3, 4.6, 0.5, 0.65, "E0A458", "Deco cone", { rotate: 180 });
  d(T.ellipse, 8.25, 4.2, 0.6, 0.55, "FFFFFF", "Deco scoop");
  d(T.smileyFace, 0.45, 4.55, 0.6, 0.6, "FFD23F", "Deco friend");
  d(T.star5, 7.2, 4.75, 0.35, 0.35, "FFD23F", "Deco star");
}

// unit = { bare: letters as written (joined in circle), full: with marks, b: carries the yaa }
const U = (bare, full, b) => ({ bare, full, b: !!b });
function parseBig(w) {                       // "قِ^لَ": ^ after a unit = madd yaa follows it
  const units = [];
  for (const ch of w) {
    if (ch === "^") units[units.length - 1].b = true;
    else if (/[ً-ْۡ]/.test(ch)) { units[units.length - 1].full += ch; }
    else units.push({ bare: ch, full: ch, b: false });
  }
  return units;
}
const BIG2 = ["نُ^رَ","دُ^نَ","سُ^قَ","طُ^رَ","صُ^رَ","جُ^عَ","هُ^دَ","نُ^حَ","لُ^طَ","عُ^دَ","ثُ^مَ","قُ^تَ"];
const BIG3 = ["يَقُ^لَ","يَكُ^نَ","نَقُ^لَ","رَسُ^لَ","غَفُ^رَ","شَكُ^رَ","صَبُ^رَ","وَدُ^دَ","جَهُ^لَ","ظَلُ^مَ","كَفُ^رَ","وَقُ^دَ","قَبُ^لَ","فُسُ^قَ","سُجُ^دَ","خُلُ^دَ","جُنُ^دَ"];
const H = U("ه", "هُ", true);
const SMALL2 = [[U("ل","لَ"), H], [U("م","مَ"), U("ع","عَ"), H]];
const SMALL3 = [
  [U("إ","إِ"), U("ن","نَّ"), H],                         // إِنَّهُۥ
  [U("أ","أَ"), U("ن","نَّ"), H],                         // أَنَّهُۥ
  [U("ر","رَ"), U("ب","بَّ"), H],                         // رَبَّهُۥ
  [U("نف","نَف"+SUKUN), U("س","سَ"), H],                  // نَفْسَهُۥ
  [U("عب","عَب"+SUKUN), U("د","دَ"), H],                  // عَبْدَهُۥ
  [U("رز","رِز"+SUKUN), U("ق","قَ"), H],                  // رِزْقَهُۥ
  [U("وج","وَج"+SUKUN), U("ه","هَ"), H],                  // وَجْهَهُۥ
  [U("فض","فَض"+SUKUN), U("ل","لَ"), H],                  // فَضْلَهُۥ
  [U("قل","قَل"+SUKUN), U("ب","بُ"), H],                  // قَلْبُهُۥ
  [U("عن","عِن"+SUKUN), U("د","دَ"), H],                  // عِندَهُۥ
];
const slides = MODE === "big"
  ? [...BIG2.map(parseBig), ...BIG3.map(parseBig)]
  : [...SMALL2.slice(0,1), ...SMALL2.slice(1), ...SMALL3];

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
        arText(s, MODE === "big" ? WAW : SMALLWAW, Object.assign({ objectName: `M${i + 1} yaa` }, o, { x: cx[i] - 0.0078 * g.fs, fontSize: MODE === "big" ? g.fs : 1.5 * g.fs }));
      } else {
        arText(s, u.bare, Object.assign({ objectName: `L${i + 1} letter` }, o));
        arText(s, u.full, Object.assign({ objectName: `F${i + 1} fathah` }, o));
      }
    });
    const mark = MODE === "big" ? WAW : SMALLWAW;
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
  pres.title = "Madd with waw " + MODE;
  drawSlides(slides);
  await pres.writeFile({ fileName: (MODE === "big" ? "Madd-Waw-Big" : "Madd-Waw-Small-Quranic") + ".raw.pptx" });
})();
