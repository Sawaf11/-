const pptxgen = require("pptxgenjs");
const T = new pptxgen().ShapeType;
const SUKUN = "ۡ";                                   // head-of-haa (Uthmani) sukun
const FATHA = "َ", KASRA = "ِ", DAMMA = "ُ";
const TAN = { [FATHA]: "ً", [KASRA]: "ٍ", [DAMMA]: "ٌ" };   // fathatan, kasratan, dammatan
const FONT = process.env.FONT || "Traditional Arabic", K = 1.25, INK = "16213E", BG = "E6DEFF";
const RING = ["E8604C", "3A8FD9", "2FB57A", "F2994A"], NOON_RING = "8E5BD0";
const pres = new pptxgen(); pres.layout = "LAYOUT_16x9"; pres.title = "Tanween = vowel + noon";

function arText(s, text, o, step) {
  const name = (step ? `S${String(step).padStart(2, "0")} ` : "") + o.objectName;
  s.addText(text, Object.assign({ fontFace: FONT, color: INK, align: "center", valign: "middle", margin: 0, isTextBox: true,
    rtlMode: true, lang: "ar-SA", fit: "none" }, o, { fontSize: o.fontSize * K, objectName: name }));
}
function shape(s, type, o, step) {
  const name = (step ? `S${String(step).padStart(2, "0")} ` : "") + o.objectName + (step ? " shape" : "");
  s.addShape(type, Object.assign({}, o, { objectName: name }));
}
function deco(s) {
  const d = (sh, x, y, w, h, color, name, extra) =>
    s.addShape(sh, Object.assign({ x, y, w, h, fill: { color }, line: { color, width: 0 }, objectName: name }, extra || {}));
  d(T.ellipse, -1.2, 5.1, 5.4, 1.5, "B6E3A5", "Deco hill left");
  d(T.ellipse, 4.5, 5.2, 6.4, 1.5, "9AD68A", "Deco hill right");
  d(T.cloud, 0.3, 0.25, 1.6, 0.85, "FFFFFF", "Deco cloud 1");
  d(T.cloud, 3.1, 0.15, 1.2, 0.65, "FFFFFF", "Deco cloud 2");
  d(T.cloud, 5.4, 0.45, 1.0, 0.55, "F6F2FF", "Deco cloud 3");
  d(T.sun, 9.0, 4.35, 0.8, 0.8, "FFD23F", "Deco sun");
  // hot-air balloons at the outer edges
  [[0.4, 3.95, 0.62, "E8604C", "FFD23F"], [8.8, 0.55, 0.8, "3A8FD9", "FF7A90"], [7.3, 0.15, 0.55, "2FB57A", "FFD23F"]].forEach(([x, y, w, c1, c2], i) => {
    d(T.ellipse, x, y, w, w * 1.1, c1, `Deco balloon ${i + 1}`);
    d(T.ellipse, x + w * 0.3, y + 0.05, w * 0.4, w * 1.0, c2, `Deco balloon stripe ${i + 1}`);
    d(T.rect, x + w * 0.38, y + w * 1.1 + 0.12, w * 0.24, w * 0.2, "9A6B3F", `Deco basket ${i + 1}`);
    d(T.rect, x + w * 0.25, y + w * 1.0, 0.02, 0.22, "9A6B3F", `Deco rope a ${i + 1}`);
    d(T.rect, x + w * 0.73, y + w * 1.0, 0.02, 0.22, "9A6B3F", `Deco rope b ${i + 1}`);
  });
  d(T.smileyFace, 1.3, 4.55, 0.6, 0.6, "FF9EC4", "Deco friend");
  d(T.star5, 2.2, 4.8, 0.3, 0.3, "FFD23F", "Deco star");
}
function badge(s, kind, cx, y, step, i, sz) {
  if (kind === "stop") shape(s, T.octagon, { x: cx - sz/2, y, w: sz, h: sz, fill: { color: "E8453C" }, line: { color: "FFFFFF", width: 2 }, objectName: `Stop sign ${i}` }, step);
  else shape(s, T.leftArrow, { x: cx - sz*0.7, y: y + sz*0.07, w: sz*1.4, h: sz*0.86, fill: { color: "2FB57A" }, line: { color: "FFFFFF", width: 1.5 }, objectName: `Go arrow ${i}` }, step);
}
const plus = (s, cx, cy, sz, step, i) => shape(s, T.mathPlus, { x: cx - sz/2, y: cy - sz/2, w: sz, h: sz, fill: { color: "F2994A" }, line: { color: "F2994A", width: 0 }, objectName: `Plus ${i}` }, step);
const arrow = (s, x, cy, w, step) => shape(s, T.leftArrow, { x, y: cy - 0.28, w, h: 0.56, fill: { color: "8E5BD0" }, line: { color: "8E5BD0", width: 0 }, objectName: "Arrow" }, step);
const circle = (s, x, cy, d, col, i) => s.addShape(T.ellipse, { x, y: cy - d/2, w: d, h: d, fill: { color: "FFFFFF" }, line: { color: col, width: 8 }, objectName: `Circle ${i}` });
const panel = (s, x, cy, w, h) => s.addShape(T.roundRect, { x, y: cy - h/2, w, h, rectRadius: 0.3, fill: { color: "FFFBE3" }, line: { color: "F2B134", width: 6 }, objectName: "Result panel" });
function pair(s, bare, full, x, cy, d, fs, st1, st2, tag) {
  const o = { x, y: cy - d/2, w: d, h: d, fontSize: fs };
  arText(s, bare, Object.assign({ objectName: `L${tag} letter` }, o), st1);
  arText(s, full, Object.assign({ objectName: `F${tag} mark` }, o), st2);
}
const NOTES = {
  explain: "TANWEEN IS A SHORT VOWEL PLUS A NOON. The two little marks you see (fathatan, kasratan or dammatan) secretly hide a NOON that has a sukun (head-of-haa sign). We say it as the vowel followed by 'n': an / in / un. We never write that noon as a letter - the doubled mark is its costume. Click through to catch the hidden noon.",
  primer: "Read the first circle (the letter with its vowel), then the hidden noon with sukun, then squeeze them into the tanween.",
  word: "Read the pieces, then press the arrow: the vowel + the hidden noon turn into the tanween on the last letter."
};

// config per number of circles
const CFG = {
  2: { d: 1.9, gap: 0.7, zone: 1.0, pw: 3.0, ph: 2.2, fs: 84, rs: 90, plus: 0.45, aw: 0.7, bs: 0.42, right: 9.25 },
  3: { d: 1.4, gap: 0.55, zone: 0.85, pw: 2.55, ph: 2.0, fs: 60, rs: 66, plus: 0.38, aw: 0.6, bs: 0.38, right: 9.35 },
  4: { d: 1.15, gap: 0.45, zone: 0.8, pw: 2.0, ph: 1.8, fs: 50, rs: 56, plus: 0.32, aw: 0.55, bs: 0.34, right: 9.35 },
};
// units: letters carrying their harakah, the last letter takes tanween (given harakah h); noon circle added automatically
function tanweenSlide(letters, h, notes) {
  const n = letters.length + 1, g = CFG[n], CY = 2.8;
  const s = pres.addSlide(); s.background = { color: BG }; deco(s);
  const cx = []; let right = g.right;
  for (let i = 0; i < n; i++) { cx.push(right - g.d); right -= g.d + g.gap; }
  const PX = cx[n - 1] - g.zone - g.pw;
  cx.forEach((x, i) => circle(s, x, CY, g.d, i === n - 1 ? NOON_RING : RING[i % 4], i + 1));
  panel(s, PX, CY, g.pw, g.ph);
  let st = 1;
  const marks = letters.map((l, i) => i === letters.length - 1 ? h : (l.h || FATHA));
  letters.forEach((l, i) => {
    pair(s, l.c, l.c + marks[i], cx[i], CY, g.d, g.fs, st, st + 1, String(i + 1)); st += 2;
    if (i === letters.length - 1) { badge(s, "go", cx[i] + g.d/2, CY - g.d/2 - g.bs - 0.12, st, 1, g.bs); st += 1; }
    plus(s, cx[i] - g.gap/2, CY, g.plus, st, i + 1); st += 1;
  });
  pair(s, "ن", "ن" + SUKUN, cx[n - 1], CY, g.d, g.fs, st, st + 1, String(n)); st += 2;
  badge(s, "stop", cx[n - 1] + g.d/2, CY - g.d/2 - g.bs - 0.12, st, 2, g.bs); st += 1;
  arrow(s, cx[n - 1] - g.zone/2 - g.aw/2, CY, g.aw, st); st += 1;
  const word = letters.map((l, i) => l.c + (i === letters.length - 1 ? TAN[h] : marks[i])).join("");
  arText(s, word, { x: PX, y: CY - g.ph/2, w: g.pw, h: g.ph, fontSize: g.rs, objectName: "Result" }, st);
  s.addNotes(notes);
}
const L = (c, h) => ({ c, h });
const TYPES = [[FATHA, "fathatan"], [KASRA, "kasratan"], [DAMMA, "dammatan"]];

// 1) explain: vowel + hidden noon (one slide per tanween)
TYPES.forEach(([h], k) => {
  const s = pres.addSlide(); s.background = { color: BG }; deco(s);
  const CY = 2.9, PX = 6.5, PW = 2.8, PH = 2.3, D = 1.7, C1 = 3.6, C2 = 1.35;
  panel(s, PX, CY, PW, PH);
  arText(s, "ب" + TAN[h], { x: PX, y: CY - PH/2, w: PW, h: PH, fontSize: 100, objectName: "Result" }, 1);
  arrow(s, 5.6, CY, 0.7, 2);
  circle(s, C1, CY, D, RING[0], 1); circle(s, C2, CY, D, NOON_RING, 2);
  pair(s, "ب", "ب" + h, C1, CY, D, 90, 3, 4, "1");
  badge(s, "go", C1 + D/2, CY - D/2 - 0.65, 5, 1, 0.42);
  plus(s, C1 - 0.3, CY, 0.5, 6, 1);
  pair(s, "ن", "ن" + SUKUN, C2, CY, D, 90, 7, 8, "2");
  badge(s, "stop", C2 + D/2, CY - D/2 - 0.65, 9, 2, 0.42);
  s.addNotes(NOTES.explain);
});

// 2) practice per tanween type
const ARABIC_PRIMER = ["ب", "ت", "س", "ل", "م"];
const W3 = [["أ","ب"],["أ","خ"],["د","م"],["ف","م"],["ي","د"],["غ","د"]];            // أَبٌ أَخٌ دَمٌ فَمٌ يَدٌ غَدٌ (kasratan/dammatan)
const W4 = [["س","ن"],["ل","غ"],["ك","ر"],["ه","ب"],["ع","د"],["ص","ل"],["ث","ق"],["س","م"]];  // + ة
const firstH = { "ل": DAMMA, "ك": DAMMA, "ه": KASRA, "ع": KASRA, "ص": KASRA, "ث": KASRA, "س": null };
TYPES.forEach(([h]) => {
  ARABIC_PRIMER.forEach(c => tanweenSlide([L(c)], h, NOTES.primer));
  if (h !== FATHA) W3.forEach(([a, b]) => tanweenSlide([L(a), L(b)], h, NOTES.word));
  const list = h === FATHA ? W4 : W4.slice(0, 4);
  list.forEach(([a, b], i) => {
    const hk = (c, idx) => (idx === 0 && ["ل","ك"].includes(c)) ? DAMMA : (idx === 0 && ["ه","ع","ص","ث"].includes(c)) ? KASRA : (idx === 0 && c === "س" && b === "م" && h === FATHA && i === 7) ? KASRA : FATHA;
    tanweenSlide([L(a, hk(a, 0)), L(b, FATHA), L("ة", FATHA)], h, NOTES.word);
  });
});
(async () => { await pres.writeFile({ fileName: "Tanween.raw.pptx" }); })();
