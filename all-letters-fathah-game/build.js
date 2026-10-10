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

const ALPHA = ["أ","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه","و","ي"];
const partners = X => { const i = ALPHA.indexOf(X); return i >= 7 ? ALPHA.slice(0, i) : ALPHA.filter(l => l !== X).slice(0, 7); };
const SIM = { "ب":"ت","ت":"ث","ث":"ب","ج":"ح","ح":"خ","خ":"ج","د":"ذ","ذ":"د","ر":"ز","ز":"ر","س":"ش","ش":"س","ص":"ض","ض":"ص","ط":"ظ","ظ":"ط","ع":"غ","غ":"ع","ف":"ق","ق":"ف","ن":"ي","ي":"ن" };
const sim = l => SIM[l] || ALPHA[(ALPHA.indexOf(l) + 1) % ALPHA.length];
const QUIZ_EVERY = 8, LEVEL_EVERY = 3;
const nm = (st, n) => `S${String(st).padStart(2, "0")} ${n}`;
const gnm = (ms, n) => `G${String(ms).padStart(4, "0")} ${n}`;
const GOLD = "FFC93C";
const CFG = {
  2: { d: 1.9, gap: 0.7, zone: 1.0, pw: 3.0, ph: 2.2, fs: 90, rs: 96, plus: 0.45, aw: 0.7, right: 9.25 },
  3: { d: 1.4, gap: 0.55, zone: 0.85, pw: 2.55, ph: 2.0, fs: 66, rs: 72, plus: 0.38, aw: 0.6, right: 9.35 },
};
const full = L => L.map(l => l + FATHA).join("");
let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

// progress track along the bottom: fills from the right edge toward the left (the reading direction)
function bar(s, th, frac, miles) {
  const x0 = 1.6, W = 6.8, y = 5.3, h = 0.16;
  s.addShape(T.roundRect, { x: x0, y, w: W, h, rectRadius: 0.08, fill: { color: "FFFFFF", transparency: 25 }, line: { color: "FFFFFF", width: 0 }, objectName: "Game track" });
  const fw = Math.max(0.16, W * frac);
  s.addShape(T.roundRect, { x: x0 + W - fw, y, w: fw, h, rectRadius: 0.08, fill: { color: th.ar }, line: { color: th.ar, width: 0 }, objectName: "Game progress" });
  miles.forEach((m, i) => s.addShape(T.ellipse, { x: x0 + W - W * m - 0.07, y: y + 0.01, w: 0.14, h: 0.14,
    fill: { color: m <= frac + 1e-9 ? GOLD : "FFFFFF" }, line: { color: th.ar, width: 1 }, objectName: `Game milestone ${i + 1}` }));
  s.addShape(T.star5, { x: x0 - 0.22, y: y - 0.1, w: 0.36, h: 0.36, fill: { color: GOLD }, line: { color: "FFFFFF", width: 1 }, objectName: "Game goal star" });
  s.addShape(T.smileyFace, { x: x0 + W - fw - 0.14, y: y - 0.1, w: 0.36, h: 0.36, fill: { color: "FFFFFF" }, line: { color: th.ar, width: 1.5 }, objectName: "Game marker" });
}
function newSlide(pres, th) { const s = pres.addSlide(); s.background = { color: th.bg }; deco(s, th); return s; }
function arText2(s, text, o) { s.addText(text, Object.assign({ fontFace: FONT, color: INK, align: "center", valign: "middle", margin: 0, isTextBox: true, rtlMode: true, lang: "ar-SA", fit: "none" }, o)); }

function drawContent(pres, th, L, prog) {
  const s = newSlide(pres, th), n = L.length, CY = 2.8;
  if (n === 1) {
    const d = 3.4, x = 5 - d / 2, y = CY - d / 2;
    s.addShape(T.ellipse, { x, y, w: d, h: d, fill: { color: "FFFFFF" }, line: { color: RING[1], width: 10 }, objectName: "Circle 1" });
    arText2(s, L[0], { x, y, w: d, h: d, fontSize: 190, objectName: nm(1, "L1 letter") });
    arText2(s, L[0] + FATHA, { x, y, w: d, h: d, fontSize: 190, objectName: nm(2, "F1 mark") });
    bar(s, th, prog.f, prog.m); return;
  }
  const g = CFG[n]; let right = g.right; const cx = [];
  for (let i = 0; i < n; i++) { cx.push(right - g.d); right -= g.d + g.gap; }
  L.forEach((l, i) => s.addShape(T.ellipse, { x: cx[i], y: CY - g.d / 2, w: g.d, h: g.d, fill: { color: "FFFFFF" },
    line: { color: n === 2 ? [RING[0], RING[2]][i] : RING[i], width: 8 }, objectName: `Circle ${i + 1}` }));
  const PX = cx[n - 1] - g.zone - g.pw;
  s.addShape(T.roundRect, { x: PX, y: CY - g.ph / 2, w: g.pw, h: g.ph, rectRadius: 0.3, fill: { color: "FFFBE3" }, line: { color: "F2B134", width: 6 }, objectName: "Result panel" });
  let st = 1;
  L.forEach((l, i) => {
    const o = { x: cx[i], y: CY - g.d / 2, w: g.d, h: g.d, fontSize: g.fs };
    arText2(s, l, Object.assign({ objectName: nm(st++, `L${i + 1} letter`) }, o));
    arText2(s, l + FATHA, Object.assign({ objectName: nm(st++, `F${i + 1} mark`) }, o));
    if (i < n - 1) s.addShape(T.mathPlus, { x: cx[i] - g.gap / 2 - g.plus / 2, y: CY - g.plus / 2, w: g.plus, h: g.plus, fill: { color: th.pl }, line: { color: th.pl, width: 0 }, objectName: nm(st++, `P${i + 1} plus`) });
  });
  s.addShape(T.leftArrow, { x: cx[n - 1] - g.zone / 2 - g.aw / 2, y: CY - 0.28, w: g.aw, h: 0.56, fill: { color: th.ar }, line: { color: th.ar, width: 0 }, objectName: nm(st++, "A arrow") });
  arText2(s, full(L), { x: PX, y: CY - g.ph / 2, w: g.pw, h: g.ph, fontSize: g.rs, objectName: nm(st++, "R result") });
  bar(s, th, prog.f, prog.m);
}
// quiz: source letters are shown, the answer is hidden behind "؟"; tap one of three answers
function drawQuiz(pres, th, L, num, k, prog) {
  const s = newSlide(pres, th), n = L.length, g = CFG[n], CY = 1.95;
  let right = g.right; const cx = [];
  for (let i = 0; i < n; i++) { cx.push(right - g.d); right -= g.d + g.gap; }
  L.forEach((l, i) => s.addShape(T.ellipse, { x: cx[i], y: CY - g.d / 2, w: g.d, h: g.d, fill: { color: "FFFFFF" }, line: { color: n === 2 ? [RING[0], RING[2]][i] : RING[i], width: 8 }, objectName: `Circle ${i + 1}` }));
  const PX = cx[n - 1] - g.zone - g.pw;
  s.addShape(T.roundRect, { x: PX, y: CY - g.ph / 2, w: g.pw, h: g.ph, rectRadius: 0.3, fill: { color: "FFFBE3" }, line: { color: "F2B134", width: 6, dashType: "dash" }, objectName: "Question panel" });
  arText2(s, "؟", { x: PX, y: CY - g.ph / 2, w: g.pw, h: g.ph, fontSize: 110, color: th.ar, objectName: "Question mark" });
  L.forEach((l, i) => {
    const o = { x: cx[i], y: CY - g.d / 2, w: g.d, h: g.d, fontSize: g.fs };
    arText2(s, l + FATHA, Object.assign({ objectName: `Letter ${i + 1}` }, o));
    if (i < n - 1) s.addShape(T.mathPlus, { x: cx[i] - g.gap / 2 - g.plus / 2, y: CY - g.plus / 2, w: g.plus, h: g.plus, fill: { color: th.pl }, line: { color: th.pl, width: 0 }, objectName: `Plus ${i + 1}` });
  });
  s.addShape(T.leftArrow, { x: cx[n - 1] - g.zone / 2 - g.aw / 2, y: CY - 0.28, w: g.aw, h: 0.56, fill: { color: th.ar }, line: { color: th.ar, width: 0 }, objectName: "Arrow" });
  // answers
  const correct = full(L), opts = [];
  const rev = [...L].reverse(); const w1 = full(rev) !== correct ? full(rev) : full(L.map((l, i) => i === L.length - 1 ? sim(l) : l));
  let w2 = full(L.map((l, i) => i === k % L.length ? sim(l) : l));
  if (w2 === w1 || w2 === correct) w2 = full(L.map((l, i) => i === (k + 1) % L.length ? sim(l) : l));
  if (w2 === w1 || w2 === correct) w2 = full(L.map((l, i) => i === 0 ? ALPHA[(ALPHA.indexOf(l) + 3) % 28] : l));
  const wrongs = [w1, w2], pos = k % 3; let wi = 0;
  const W = 2.25, H = 1.25, gap = 0.25, x0 = (10 - (3 * W + 2 * gap)) / 2, Y = 3.55;
  for (let j = 0; j < 3; j++) {
    const isC = j === pos, text = isC ? correct : wrongs[wi++];
    s.addText(text, { shape: T.roundRect, rectRadius: 0.2, x: x0 + (2 - j) * (W + gap), y: Y, w: W, h: H, fill: { color: "FFFFFF" },
      line: { color: [RING[0], RING[1], RING[2]][j], width: 6 }, fontFace: FONT, fontSize: n === 2 ? 64 : 54, color: INK, align: "center", valign: "middle",
      margin: 0, rtlMode: true, lang: "ar-SA", fit: "none", objectName: `LINK${isC ? num + 1 : num + 2} answer ${j + 1}` });
  }
  bar(s, th, prog.f, prog.m);
  s.addNotes("GAME TIME: ask the child to read the equation, then tap the answer they think is right. Right answer = celebration slide. Wrong answer = a hidden try-again slide (only reachable by tapping a wrong answer); tap the green button to try again.");
}
function drawCorrect(pres, th, L, prog) {
  const s = newSlide(pres, th);
  [[3.4, 0.3, 0.9], [4.55, 0.3, 0.9], [5.7, 0.3, 0.9]].forEach(([x, y, z], i) =>
    s.addShape(T.star5, { x: x - 0.05, y, w: z, h: z, fill: { color: GOLD }, line: { color: "FFFFFF", width: 2 }, objectName: gnm(500 + i * 280, `star${i + 1}`) }));
  s.addShape(T.smileyFace, { x: 4.0, y: 1.3, w: 2.0, h: 2.0, fill: { color: "7BE495" }, line: { color: "FFFFFF", width: 4 }, objectName: gnm(0, "face") });
  s.addText(full(L), { shape: T.roundRect, rectRadius: 0.3, x: 2.6, y: 3.55, w: 4.8, h: 1.3, fill: { color: "FFFBE3" }, line: { color: "F2B134", width: 6 },
    fontFace: FONT, fontSize: 80, color: INK, align: "center", valign: "middle", margin: 0, rtlMode: true, lang: "ar-SA", fit: "none", objectName: gnm(1500, "panel") });
  bar(s, th, prog.f, prog.m);
}
function drawOops(pres, th, quizNum) {
  const s = newSlide(pres, th);
  s.addShape(T.mathMultiply, { x: 3.8, y: 0.5, w: 2.4, h: 2.4, fill: { color: "E8453C" }, line: { color: "FFFFFF", width: 3 }, objectName: gnm(0, "oops") });
  s.addShape(T.roundRect, { x: 3.4, y: 3.3, w: 3.2, h: 1.5, rectRadius: 0.3, fill: { color: "2FB57A" }, line: { color: "FFFFFF", width: 5 }, objectName: gnm(700, `LINK${quizNum} retry button`) });
  s.addShape(T.circularArrow, { x: 4.4, y: 3.5, w: 1.2, h: 1.1, fill: { color: "FFFFFF" }, line: { color: "FFFFFF", width: 0 }, objectName: gnm(700, `LINK${quizNum} retry icon`) });
  s.addShape(T.rect, { x: 0, y: 0, w: 0.01, h: 0.01, fill: { color: "FFFFFF", transparency: 100 }, line: { color: "FFFFFF", width: 0 }, objectName: "HIDDEN marker" });
  s.addNotes("Hidden try-again slide: only shown after a wrong answer. Tap the green button to go back to the question.");
}
function drawLevel(pres, th, finale) {
  const s = newSlide(pres, th);
  const cols = ["FF5D8F", "FFC93C", "3A8FD9", "2FB57A", "8E5BD0", "FF8A3D", "FFFFFF"];
  const n = finale ? 40 : 26;
  for (let i = 0; i < n; i++) {                       // confetti on the outer area
    let x, y; do { x = 0.2 + rnd() * 9.4; y = 0.2 + rnd() * 4.8; } while (x > 3.1 && x < 6.9 && y > 0.3 && y < 4.7);
    const z = 0.18 + rnd() * 0.22, kind = [T.ellipse, T.star5, T.rect, T.heart][i % 4], c = cols[i % cols.length];
    s.addShape(kind, { x, y, w: z, h: z, fill: { color: c }, line: { color: c, width: 0 }, rotate: Math.floor(rnd() * 60), objectName: gnm(350 + i * 35, `confetti ${i + 1}`) });
  }
  s.addShape(T.triangle, { x: 3.9, y: 3.45, w: 0.9, h: 1.25, fill: { color: "E8453C" }, line: { color: "FFFFFF", width: 2 }, rotate: 190, objectName: gnm(0, "medal ribbon left") });
  s.addShape(T.triangle, { x: 5.2, y: 3.45, w: 0.9, h: 1.25, fill: { color: "3A8FD9" }, line: { color: "FFFFFF", width: 2 }, rotate: 170, objectName: gnm(0, "medal ribbon right") });
  s.addShape(T.ellipse, { x: 3.4, y: 0.7, w: 3.2, h: 3.2, fill: { color: GOLD }, line: { color: "FFFFFF", width: 6 }, objectName: gnm(0, "medal") });
  s.addShape(T.ellipse, { x: 3.8, y: 1.1, w: 2.4, h: 2.4, fill: { color: "FFE48A" }, line: { color: "F2B134", width: 4 }, objectName: gnm(0, "medal inner") });
  s.addShape(T.star5, { x: 4.1, y: 1.4, w: 1.8, h: 1.8, fill: { color: "FFFFFF" }, line: { color: "F2B134", width: 3 }, objectName: gnm(0, "medal star") });
  s.addShape(T.rect, { x: 0, y: 0, w: 0.01, h: 0.01, fill: { color: "FFFFFF", transparency: 100 }, line: { color: "FFFFFF", width: 0 }, objectName: "NOHIDE marker" });
  s.addNotes(finale ? "Finished! Give the child a big cheer." : "Level up! Celebrate before the next set of letters.");
}

(async () => {
  const FAMILIES = [
    ["01-alif", ["أ"]], ["02-ba-ta-tha", ["ب","ت","ث"]], ["03-noon-ya", ["ن","ي"]],
    ["04-jeem-ha-kha", ["ج","ح","خ"]], ["05-dal-dhal", ["د","ذ"]], ["06-ra-zay", ["ر","ز"]],
    ["07-seen-sheen", ["س","ش"]], ["08-sad-dad", ["ص","ض"]], ["09-ta-dha", ["ط","ظ"]],
    ["10-ain-ghain", ["ع","غ"]], ["11-fa-qaf", ["ف","ق"]], ["12-kaf", ["ك"]],
    ["13-lam", ["ل"]], ["14-meem", ["م"]], ["15-ha", ["ه"]], ["16-waw", ["و"]],
  ];
  for (const [file, members] of FAMILIES) {
    seed = 12345;
    const pres = new pptxgen(); pres.layout = "LAYOUT_16x9"; pres.title = "Fathah game " + file;
    const th = TH[file];
    const content = [];
    members.forEach(X => { const P = partners(X);
      content.push([X]);
      P.forEach(p => content.push([X, p]));
      P.forEach((p, k) => content.push([p, X, P[(k + 1) % P.length]]));
      P.forEach(p => content.push([p, X])); });
    // lay out the deck: content, a quiz block (question, correct, hidden try-again) every few slides, level-up slides, a finale
    const items = []; let lastMulti = null, q = 0; const miles = [];
    content.forEach((L, i) => {
      items.push({ t: "c", L, ci: i + 1 });
      if (L.length > 1) lastMulti = L;
      if ((i + 1) % QUIZ_EVERY === 0 && i + 1 < content.length && lastMulti) {
        q++; items.push({ t: "q", L: lastMulti, k: q, ci: i + 1 }, { t: "ok", L: lastMulti, ci: i + 1 }, { t: "no", ci: i + 1 });
        miles.push((i + 1) / content.length);
        if (q % LEVEL_EVERY === 0) items.push({ t: "lv", ci: i + 1 });
      }
    });
    items.push({ t: "fin", ci: content.length });
    items.forEach((it, idx) => {
      const prog = { f: it.ci / content.length, m: miles }, num = idx + 1;
      if (it.t === "c") drawContent(pres, th, it.L, prog);
      else if (it.t === "q") drawQuiz(pres, th, it.L, num, it.k, prog);
      else if (it.t === "ok") drawCorrect(pres, th, it.L, prog);
      else if (it.t === "no") drawOops(pres, th, num - 2);
      else drawLevel(pres, th, it.t === "fin");
    });
    await pres.writeFile({ fileName: file + ".raw.pptx" });
    console.log(file, content.length, "content;", items.length, "slides;", q, "quizzes");
  }
})();
