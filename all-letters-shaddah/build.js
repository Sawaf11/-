const pptxgen = require("pptxgenjs");
const T = new pptxgen().ShapeType;
const FATHA = "َ", SUKUN = "ۡ", SHADDA = "ّ";   // SUKUN = head-of-haa (Uthmani) sukun
const FONT = "Traditional Arabic", K = 1.25;
const INK = "16213E";
const BG = "DDF1FF";
const RING = ["E8604C", "3A8FD9", "2FB57A", "F2994A"];       // right, middle, left source circle

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

const ALPHA = ["أ","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه","و","ي"];
const partners = X => { const i = ALPHA.indexOf(X); return i >= 7 ? ALPHA.slice(0, i) : ALPHA.filter(l => l !== X).slice(0, 7); };
const CFG = {
  1: { d: 3.4 },
  2: { d: 1.9, gap: 0.7, zone: 1.0, pw: 3.0, ph: 2.2, fs: 90, rs: 96, plus: 0.45, aw: 0.7, right: 9.25 },
  3: { d: 1.4, gap: 0.55, zone: 0.85, pw: 2.55, ph: 2.0, fs: 66, rs: 72, plus: 0.38, aw: 0.6, right: 9.35 },
  4: { d: 1.05, gap: 0.4, zone: 0.75, pw: 2.6, ph: 1.8, fs: 46, rs: 50, plus: 0.3, aw: 0.5, right: 9.4 },
};
const N1 = "WHAT IS SHADDAH? A shaddah is TWO letters written as one. The first letter has a sukun (we use the head-of-haa sukun, ۡ) and the second letter has the vowel. Squeeze them together and we write the letter once with a shaddah (ّ) on top. Read it as the letter twice: first stop on it, then go with the vowel.";
const N2 = "A WORD CANNOT START WITH A SHADDAH. The first of the two letters has a sukun, and we can never start a word on a sukun. So a shaddah always comes AFTER a letter that has a vowel. The red sign means: not allowed at the start of a word.";
const N3 = "Right way: a letter with a vowel comes first, then the two letters that make the shaddah.";
const nm = (st, n) => `S${String(st).padStart(2, "0")} ${n}`;
function arText(s, text, o) {
  s.addText(text, Object.assign({ fontFace: FONT, color: INK, align: "center", valign: "middle",
    margin: 0, isTextBox: true, rtlMode: true, lang: "ar-SA", fit: "none" }, o, { fontSize: o.fontSize * K }));
}
// spec: circles [{c, m}] (letter + its mark), result text
function drawSlide(pres, th, circles, result, note) {
  const s = pres.addSlide(); s.background = { color: th.bg }; deco(s, th);
  const n = circles.length, g = CFG[n], CY = 2.8;
  let right = g.right; const cx = [];
  for (let i = 0; i < n; i++) { cx.push(right - g.d); right -= g.d + g.gap; }
  circles.forEach((c, i) => s.addShape(T.ellipse, { x: cx[i], y: CY - g.d / 2, w: g.d, h: g.d, fill: { color: "FFFFFF" },
    line: { color: n === 2 ? [RING[0], RING[2]][i] : RING[i], width: 8 }, objectName: `Circle ${i + 1}` }));
  const leftSrc = cx[n - 1], PX = leftSrc - g.zone - g.pw;
  s.addShape(T.roundRect, { x: PX, y: CY - g.ph / 2, w: g.pw, h: g.ph, rectRadius: 0.3,
    fill: { color: "FFFBE3" }, line: { color: "F2B134", width: 6 }, objectName: "Result panel" });
  let st = 1;
  circles.forEach((c, i) => {
    const o = { x: cx[i], y: CY - g.d / 2, w: g.d, h: g.d, fontSize: g.fs };
    arText(s, c.c, Object.assign({ objectName: nm(st++, `L${i + 1} letter`) }, o));
    arText(s, c.c + c.m, Object.assign({ objectName: nm(st++, `F${i + 1} mark`) }, o));
    if (i < n - 1) s.addShape(T.mathPlus, { x: cx[i] - g.gap / 2 - g.plus / 2, y: CY - g.plus / 2, w: g.plus, h: g.plus,
      fill: { color: th.pl }, line: { color: th.pl, width: 0 }, objectName: nm(st++, `P${i + 1} plus`) });
  });
  s.addShape(T.leftArrow, { x: leftSrc - g.zone / 2 - g.aw / 2, y: CY - 0.28, w: g.aw, h: 0.56,
    fill: { color: th.ar }, line: { color: th.ar, width: 0 }, objectName: nm(st++, "A arrow") });
  arText(s, result, { x: PX, y: CY - g.ph / 2, w: g.pw, h: g.ph, fontSize: g.rs, wrap: false, objectName: nm(st++, "R result") });
  if (note) s.addNotes(note);
}
// "can't start a word": the shaddah letter alone in the panel, then a red NOT-ALLOWED sign over it
function forbidden(pres, th, X, note) {
  const s = pres.addSlide(); s.background = { color: th.bg }; deco(s, th);
  const W = 4.2, H = 3.2, x = 5 - W / 2, y = 2.8 - H / 2;
  s.addShape(T.roundRect, { x, y, w: W, h: H, rectRadius: 0.3, fill: { color: "FFFBE3" }, line: { color: "F2B134", width: 6 }, objectName: "Result panel" });
  arText(s, X + SHADDA + FATHA, { x, y, w: W, h: H, fontSize: 130, objectName: nm(1, "R result") });
  s.addShape(T.noSmoking, { x: x + W / 2 - 1.2, y: 2.8 - 1.2, w: 2.4, h: 2.4, fill: { color: "E8453C", transparency: 40 },
    line: { color: "E8453C", width: 0 }, objectName: nm(2, "B forbidden badge") });
  s.addNotes(note);
}
const F = FATHA, K0 = SUKUN;
(async () => {
  const FAMILIES = [
    ["01-alif", ["أ"]], ["02-ba-ta-tha", ["ب","ت","ث"]], ["03-noon-ya", ["ن","ي"]],
    ["04-jeem-ha-kha", ["ج","ح","خ"]], ["05-dal-dhal", ["د","ذ"]], ["06-ra-zay", ["ر","ز"]],
    ["07-seen-sheen", ["س","ش"]], ["08-sad-dad", ["ص","ض"]], ["09-ta-dha", ["ط","ظ"]],
    ["10-ain-ghain", ["ع","غ"]], ["11-fa-qaf", ["ف","ق"]], ["12-kaf", ["ك"]],
    ["13-lam", ["ل"]], ["14-meem", ["م"]], ["15-ha", ["ه"]], ["16-waw", ["و"]],
  ];
  const ks = Object.keys(TH);
  for (const [file, members] of FAMILIES) {
    const pres = new pptxgen(); pres.layout = "LAYOUT_16x9"; pres.title = "Shaddah " + file;
    const th = TH[ks[(ks.indexOf(file) + 12) % ks.length]];
    // 3 explanation slides: two letters make one, a word cannot start with it, the right way
    drawSlide(pres, th, [{ c: "ب", m: K0 }, { c: "ب", m: F }], "ب" + SHADDA + F, N1);
    forbidden(pres, th, "ب", N2);
    drawSlide(pres, th, [{ c: "ت", m: F }, { c: "ب", m: K0 }, { c: "ب", m: F }], "ت" + F + "ب" + SHADDA + F, N3);
    members.forEach(X => {
      const P = partners(X);
      P.forEach(p => drawSlide(pres, th, [{ c: X, m: F }, { c: p, m: K0 }, { c: p, m: F }], X + F + p + SHADDA + F));                       // beginning
      P.forEach((p, k) => { const q = P[(k + 1) % P.length];
        drawSlide(pres, th, [{ c: p, m: F }, { c: X, m: K0 }, { c: X, m: F }, { c: q, m: F }], p + F + X + SHADDA + F + q + F); });         // middle
      P.forEach(p => drawSlide(pres, th, [{ c: p, m: F }, { c: X, m: K0 }, { c: X, m: F }], p + F + X + SHADDA + F));                      // end
    });
    await pres.writeFile({ fileName: file + ".raw.pptx" });
    console.log(file, pres.slides.length);
  }
})();
