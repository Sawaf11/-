const pptxgen = require("pptxgenjs");
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
function deco(s, th) {
  const d = (shape, x, y, w, h, color, name) =>
    s.addShape(shape, { x, y, w, h, fill: { color }, line: { color, width: 0 }, objectName: name });
  d(T.ellipse, -1.0, 5.05, 5.0, 1.5, th.g1, "Deco hill left");
  d(T.ellipse, 4.6, 5.15, 6.2, 1.5, th.g2, "Deco hill right");
  d(T[th.tl], 0.35, 0.25, 1.0, 1.0, th.tlc, "Deco top left");
  d(T.cloud, 7.6, 0.25, 1.7, 0.9, th.cl1, "Deco cloud");
  d(T.cloud, 8.5, 0.85, 1.0, 0.55, th.cl2, "Deco cloud small");
  d(T.smileyFace, 0.4, 4.35, 0.8, 0.8, th.c1, "Deco friend left");
  d(T.smileyFace, 8.8, 4.35, 0.8, 0.8, th.c2, "Deco friend right");
  d(T.star5, 1.5, 4.7, 0.4, 0.4, th.st, "Deco star 1");
  d(T.star5, 8.1, 4.7, 0.4, 0.4, th.st, "Deco star 2");
  d(T.heart, 1.9, 0.5, 0.35, 0.32, th.ht, "Deco heart");
}
// one background theme per deck (bg, ground x2, top-left shape, clouds, friends, star, heart, plus, arrow)
const TH = {
 "01-alif":{bg:"DDF1FF",g1:"8ED98F",g2:"6CCB7A",tl:"sun",tlc:"FFD23F",cl1:"FFFFFF",cl2:"F2FAFF",c1:"FF9EC4",c2:"FFB347",st:"FFD23F",ht:"FF7A90",pl:"F2994A",ar:"8E5BD0"},
 "02-ba-ta-tha":{bg:"FFE0BF",g1:"F4A261",g2:"E76F51",tl:"sun",tlc:"FF6B35",cl1:"FFF3E0",cl2:"FFD9B0",c1:"FFD166",c2:"EF476F",st:"FFFFFF",ht:"D62839",pl:"C1440E",ar:"7B2CBF"},
 "03-noon-ya":{bg:"1B1F4B",g1:"3B2E7E",g2:"5A3FA0",tl:"moon",tlc:"FFE88A",cl1:"6C63C9",cl2:"4E4AA8",c1:"5EEAD4",c2:"F9A8D4",st:"FFD23F",ht:"FF7A90",pl:"FFC857",ar:"7DF9FF"},
 "04-jeem-ha-kha":{bg:"D8F3C4",g1:"4FAE5B",g2:"2F8F4E",tl:"sun",tlc:"FFD23F",cl1:"FFFFFF",cl2:"EAF9DF",c1:"FFB4A2",c2:"FFE66D",st:"FFF1A8",ht:"FF6F91",pl:"E07A1F",ar:"2A7F62"},
 "05-dal-dhal":{bg:"B5EAF2",g1:"F7DFA5",g2:"F2C879",tl:"sun",tlc:"FFC93C",cl1:"FFFFFF",cl2:"E3F8FB",c1:"FF8FAB",c2:"7BDFF2",st:"FF8FAB",ht:"FF5D8F",pl:"F28B30",ar:"1D7FB5"},
 "06-ra-zay":{bg:"FFD6EC",g1:"FF9ECF",g2:"C79BFF",tl:"star6",tlc:"FFE066",cl1:"FFFFFF",cl2:"FFEAF6",c1:"A0E7E5",c2:"B4F8C8",st:"FFFFFF",ht:"FF4D8D",pl:"E6399B",ar:"7A4FD6"},
 "07-seen-sheen":{bg:"FFE9A8",g1:"E9B65B",g2:"D99A3D",tl:"sun",tlc:"FF8A3D",cl1:"FFF7DC",cl2:"FFF0BE",c1:"6EC6CA",c2:"F4845F",st:"FFFFFF",ht:"E4572E",pl:"B5471A",ar:"2B7A78"},
 "08-sad-dad":{bg:"E3DBFF",g1:"FFFFFF",g2:"D5E9FF",tl:"star6",tlc:"9FD3FF",cl1:"FFFFFF",cl2:"F3EEFF",c1:"FFB3C6",c2:"A0D8EF",st:"9FD3FF",ht:"FF7AA2",pl:"E8590C",ar:"5B3FD0"},
 "09-ta-dha":{bg:"C9F5E8",g1:"7EDCB9",g2:"4FC3A1",tl:"sun",tlc:"FFD23F",cl1:"FFFFFF",cl2:"E8FBF5",c1:"FFC6A5",c2:"FFE381",st:"FFFFFF",ht:"FF7A90",pl:"F2711C",ar:"3D5AFE"},
 "10-ain-ghain":{bg:"0F3D2E",g1:"1B6B4A",g2:"2E8B57",tl:"moon",tlc:"FFF3A3",cl1:"2E8B57",cl2:"1F6F47",c1:"FFE066",c2:"B8F2A1",st:"FFF3A3",ht:"FF9EB5",pl:"FFC857",ar:"9BF6FF"},
 "11-fa-qaf":{bg:"FFF7C2",g1:"9BE564",g2:"6FCF4A",tl:"star6",tlc:"FF7B54",cl1:"FFFFFF",cl2:"FFEFA0",c1:"FF8FA3",c2:"7EC8FF",st:"FF7B54",ht:"EF476F",pl:"E8590C",ar:"3A86FF"},
 "12-kaf":{bg:"FFD3C2",g1:"E07A5F",g2:"C9533A",tl:"sun",tlc:"FFB703",cl1:"FFF1E8",cl2:"FFDCCB",c1:"FFE066",c2:"A7E8BD",st:"FFB703",ht:"9B1D20",pl:"9B2915",ar:"3D348B"},
 "13-lam":{bg:"0B3C5D",g1:"1D6FA3",g2:"328CC1",tl:"moon",tlc:"FFE9A0",cl1:"2F80B5",cl2:"1E5F8C",c1:"FF9EC4",c2:"FFD166",st:"BDEBFF",ht:"FF8FA3",pl:"FFC857",ar:"7DF9FF"},
 "14-meem":{bg:"EBD9FF",g1:"B892FF",g2:"9B72E8",tl:"star6",tlc:"FFD6A5",cl1:"FFFFFF",cl2:"F6ECFF",c1:"FFADAD",c2:"CAFFBF",st:"FFFFFF",ht:"FF6F91",pl:"E8590C",ar:"5A189A"},
 "15-ha":{bg:"F4FFC9",g1:"B5E48C",g2:"99D98C",tl:"sun",tlc:"FFD60A",cl1:"FFFFFF",cl2:"F1FFD9",c1:"FFC8DD",c2:"A2D2FF",st:"FFD60A",ht:"FF8FAB",pl:"E36414",ar:"1B7F5C"},
 "16-waw":{bg:"2B1B3D",g1:"5C2A6F",g2:"7B3A8F",tl:"moon",tlc:"FFD6F6",cl1:"6B4A8F",cl2:"553678",c1:"FFB703",c2:"7DF9FF",st:"FFD6F6",ht:"FF7AA2",pl:"FFC857",ar:"7DF9FF"},
};

const MODE = process.env.MODE;                     // "alif" = big alif madd, "dagger" = small (dagger) alif
const SHIFT = MODE === "alif" ? 2 : 9;
const ALIF = "ا", SMALL = 0.65;                    // small alif = 65% of the letter size
const ALPHA = ["أ","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه","و","ي"];
const partners = X => { const i = ALPHA.indexOf(X); return i >= 7 ? ALPHA.slice(0, i) : ALPHA.filter(l => l !== X).slice(0, 7); };
const nm = (st, n) => `S${String(st).padStart(2, "0")} ${n}`;
const NOTE = MODE === "alif"
  ? "MADD WITH ALIF: a letter with a fathah followed by an alif is stretched - we hold the sound for two counts (ba -> baa). The alif never joins to the letter after it."
  : "DAGGER ALIF (small alif): the small alif written with the letter gives the same stretch as a full alif - hold the sound for two counts (ba -> baa). It is written small, beside the letter.";
// units: {l: letter, b: true if this letter carries the madd alif}
function drawSlide(pres, th, units) {
  const s = pres.addSlide(); s.background = { color: th.bg }; deco(s, th);
  const n = units.length, CY = 2.8, big = MODE === "alif";
  let g, cx = [];
  if (n === 1) g = { d: 3.4, fs: 130, rs: 0 };
  else if (n === 2) g = { d: 1.9, gap: 0.7, zone: 1.0, pw: 3.0, ph: 2.2, fs: big ? 78 : 84, rs: 90, plus: 0.45, aw: 0.7 };
  else g = { d: 1.4, gap: 0.55, zone: 0.85, pw: 2.55, ph: 2.0, fs: big ? 54 : 60, rs: 66, plus: 0.38, aw: 0.6 };
  if (n === 1) cx = [5 - g.d / 2];
  else { let right = n === 2 ? 9.25 : 9.35; for (let i = 0; i < n; i++) { cx.push(right - g.d); right -= g.d + g.gap; } }
  const ring = i => n === 1 ? RING[1] : (n === 2 ? [RING[0], RING[2]][i] : RING[i]);
  units.forEach((u, i) => s.addShape(T.ellipse, { x: cx[i], y: CY - g.d / 2, w: g.d, h: g.d, fill: { color: "FFFFFF" },
    line: { color: ring(i), width: n === 1 ? 10 : 8 }, objectName: `Circle ${i + 1}` }));
  let PX = 0;
  if (n > 1) { PX = cx[n - 1] - g.zone - g.pw;
    s.addShape(T.roundRect, { x: PX, y: CY - g.ph / 2, w: g.pw, h: g.ph, rectRadius: 0.3,
      fill: { color: "FFFBE3" }, line: { color: "F2B134", width: 6 }, objectName: "Result panel" }); }
  let st = 1;
  units.forEach((u, i) => {
    const o = { x: cx[i], y: CY - g.d / 2, w: g.d, h: g.d, fontSize: g.fs };
    if (u.b) {                                  // letter sits right, alif is its own object on the left
      const o1 = Object.assign({}, o, { x: cx[i] + (big ? 0.0046 : 0.0042) * g.fs });
      arText(s, u.l, Object.assign({ objectName: nm(st++, `L${i + 1} letter`) }, o1));
      arText(s, u.l + FATHA, Object.assign({ objectName: nm(st++, `F${i + 1} mark`) }, o1));
      const af = big ? g.fs : SMALL * g.fs;
      arText(s, ALIF, Object.assign({ objectName: nm(st++, `M${i + 1} alif`) }, o,
        { x: cx[i] - (big ? 0.0078 : 0.0068) * g.fs, fontSize: af, y: o.y + (big ? 0 : 0.33 * (g.fs - af) / 72) }));
    } else {
      arText(s, u.l, Object.assign({ objectName: nm(st++, `L${i + 1} letter`) }, o));
      arText(s, u.l + FATHA, Object.assign({ objectName: nm(st++, `F${i + 1} mark`) }, o));
    }
    if (i < n - 1) s.addShape(T.mathPlus, { x: cx[i] - g.gap / 2 - g.plus / 2, y: CY - g.plus / 2, w: g.plus, h: g.plus,
      fill: { color: th.pl }, line: { color: th.pl, width: 0 }, objectName: nm(st++, `P${i + 1} plus`) });
  });
  if (n > 1) {
    s.addShape(T.leftArrow, { x: cx[n - 1] - g.zone / 2 - g.aw / 2, y: CY - 0.28, w: g.aw, h: 0.56,
      fill: { color: th.ar }, line: { color: th.ar, width: 0 }, objectName: nm(st++, "A arrow") });
    const runs = []; let acc = "";               // one joined text object; the small alif is a smaller run inside it
    units.forEach(u => { acc += u.l + FATHA;
      if (u.b) { if (big) acc += ALIF; else { runs.push({ text: acc, options: {} }); runs.push({ text: ALIF, options: { fontSize: SMALL * g.rs } }); acc = ""; } } });
    if (acc) runs.push({ text: acc, options: {} });
    arText(s, big ? runs.map(r => r.text).join("") : runs, { x: PX, y: CY - g.ph / 2, w: g.pw, h: g.ph, fontSize: g.rs, objectName: nm(st++, "R result") });
  }
  s.addNotes(NOTE);
}
const FAMILIES = [
  ["02-ba-ta-tha", ["ب","ت","ث"]], ["03-noon-ya", ["ن","ي"]], ["04-jeem-ha-kha", ["ج","ح","خ"]],
  ["05-dal-dhal", ["د","ذ"]], ["06-ra-zay", ["ر","ز"]], ["07-seen-sheen", ["س","ش"]],
  ["08-sad-dad", ["ص","ض"]], ["09-ta-dha", ["ط","ظ"]], ["10-ain-ghain", ["ع","غ"]],
  ["11-fa-qaf", ["ف","ق"]], ["12-kaf", ["ك"]], ["13-lam", ["ل"]], ["14-meem", ["م"]],
  ["15-ha", ["ه"]], ["16-waw", ["و"]],
];
(async () => {
  const ks = Object.keys(TH);
  for (let fi = 0; fi < FAMILIES.length; fi++) {
    const [file, members] = FAMILIES[fi];
    const pres = new pptxgen(); pres.layout = "LAYOUT_16x9"; pres.title = "Madd " + MODE + " " + file;
    const th = TH[ks[(fi + SHIFT) % ks.length]];
    members.forEach(X => {
      const P = partners(X), U = (l, b) => ({ l, b });
      drawSlide(pres, th, [U(X, true)]);
      P.forEach(p => drawSlide(pres, th, [U(X, true), U(p, false)]));                                            // beginning
      P.forEach((p, k) => drawSlide(pres, th, [U(p, false), U(X, true), U(P[(k + 1) % P.length], false)]));     // middle
      P.forEach(p => drawSlide(pres, th, [U(p, false), U(X, true)]));                                            // end
    });
    await pres.writeFile({ fileName: file + ".raw.pptx" });
    console.log(file, pres.slides.length);
  }
})();
