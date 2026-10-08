const pptxgen = require("pptxgenjs");
const T = new pptxgen().ShapeType;
const SUKUN = "ۡ", SHADDA = "ّ", FATHA = "َ", KASRA = "ِ", DAMMA = "ُ";   // SUKUN = head-of-haa (Uthmani)
const FONT = process.env.FONT || "Traditional Arabic", K = 1.25, INK = "16213E", BG = "12304A";
const RING = ["E8604C", "3A8FD9", "2FB57A"];
const pres = new pptxgen(); pres.layout = "LAYOUT_16x9"; pres.title = "Shaddah: one mark, two letters";

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
  // night skyline along the bottom: domes and minarets
  d(T.rect, -0.1, 5.15, 10.2, 0.6, "0B1F33", "Deco ground");
  d(T.ellipse, 0.1, 4.6, 1.3, 1.2, "0B1F33", "Deco dome left");
  d(T.rect, 1.45, 4.35, 0.18, 1.2, "0B1F33", "Deco minaret left");
  d(T.triangle, 1.4, 4.1, 0.28, 0.3, "0B1F33", "Deco minaret top left");
  d(T.ellipse, 8.6, 4.6, 1.3, 1.2, "0B1F33", "Deco dome right");
  d(T.rect, 8.35, 4.35, 0.18, 1.2, "0B1F33", "Deco minaret right");
  d(T.triangle, 8.3, 4.1, 0.28, 0.3, "0B1F33", "Deco minaret top right");
  // crescent and stars
  d(T.moon, 0.4, 0.3, 0.6, 0.95, "FFE48A", "Deco moon");
  [[1.6,0.35,0.2],[3.0,0.8,0.16],[4.2,0.3,0.22],[5.4,0.75,0.16],[6.2,0.25,0.2],[9.2,1.5,0.18],[0.45,1.6,0.16],[3.3,4.7,0.16],[6.4,4.6,0.18]]
    .forEach(([x,y,z],i)=> d(T.star5, x, y, z, z, i%2 ? "FFFFFF" : "FFD23F", "Deco star "+(i+1)));
  // hanging lanterns (fanous)
  [[7.3,"FFB347"],[8.4,"FF7A90"],[9.1,"FFD23F"]].forEach(([x,c],i)=>{
    d(T.rect, x+0.19, 0, 0.02, 0.35 + (i%2)*0.2, "FFFFFF", "Deco string "+(i+1));
    const y0 = 0.35 + (i%2)*0.2;
    d(T.triangle, x, y0, 0.4, 0.18, "C98B5B", "Deco lantern top "+(i+1));
    d(T.roundRect, x, y0+0.18, 0.4, 0.5, c, "Deco lantern body "+(i+1), { rectRadius: 0.1 });
    d(T.ellipse, x+0.12, y0+0.3, 0.16, 0.26, "FFF3C4", "Deco lantern glow "+(i+1));
  });
}
function badge(s, kind, cx, y, step, i) {   // stop sign = red octagon, go = green arrow
  const sz = 0.42;
  if (kind === "stop") shape(s, T.octagon, { x: cx - sz/2, y, w: sz, h: sz, fill: { color: "E8453C" }, line: { color: "FFFFFF", width: 2 }, objectName: `Stop sign ${i}` }, step);
  else shape(s, T.leftArrow, { x: cx - 0.3, y: y + 0.03, w: 0.6, h: 0.36, fill: { color: "3DDC84" }, line: { color: "FFFFFF", width: 1.5 }, objectName: `Go arrow ${i}` }, step);
}
const plus = (s, cx, cy, sz, step, i) => shape(s, T.mathPlus, { x: cx - sz/2, y: cy - sz/2, w: sz, h: sz, fill: { color: "FFB347" }, line: { color: "FFB347", width: 0 }, objectName: `Plus ${i}` }, step);
const arrow = (s, x, cy, w, step, dir) => shape(s, dir === "right" ? T.rightArrow : T.leftArrow, { x, y: cy - 0.28, w, h: 0.56, fill: { color: "FFD23F" }, line: { color: "FFD23F", width: 0 }, objectName: "Arrow" }, step);
const circle = (s, x, cy, d, col, i) => s.addShape(T.ellipse, { x, y: cy - d/2, w: d, h: d, fill: { color: "FFFFFF" }, line: { color: col, width: 8 }, objectName: `Circle ${i}` });
const panel = (s, x, cy, w, h) => s.addShape(T.roundRect, { x, y: cy - h/2, w, h, rectRadius: 0.3, fill: { color: "FFFBE3" }, line: { color: "F2B134", width: 6 }, objectName: "Result panel" });
// two steps for a letter in a circle: bare letter, then letter + mark
function pair(s, bare, full, x, cy, d, fs, step1, step2, tag) {
  const o = { x, y: cy - d/2, w: d, h: d, fontSize: fs };
  arText(s, bare, Object.assign({ objectName: `L${tag} letter` }, o), step1);
  arText(s, full, Object.assign({ objectName: `F${tag} mark` }, o), step2);
}
const HK = { "َ": ["fatha", "a"], "ِ": ["kasra"], "ُ": ["damma"] };

const NOTES = {
 meet: "The little mark that looks like a tiny 'w' is the SHADDAH. It is a secret code: this letter is really TWO letters standing in the same spot. Click through to watch it split.",
 split: "Shaddah = two identical letters. The FIRST one rests with a sukun (shown with the head-of-haa sign) - red stop sign. The SECOND one moves with a harakah (fatha, kasra or damma) - green go arrow. Say them quickly together: the stop-then-go gives the shaddah its strong sound.",
 primer: "Practice splitting a single doubled letter: stop (sukun), then go (harakah), then squeeze them together.",
 word: "Read the word in three pieces: the letter before, the resting letter (sukun), and the moving letter (harakah). Then press the arrow to see them join into one word with a shaddah."
};

// 1) the shaddah splits (3 explain slides, one per harakah)
[["بَ", FATHA], ["بِ", KASRA], ["بُ", DAMMA]].forEach(([bare, hk], k) => {
  const s = pres.addSlide(); s.background = { color: BG }; deco(s);
  const CY = 2.9;
  const PX = 6.5, PW = 2.8, PH = 2.3;
  panel(s, PX, CY, PW, PH);
  arText(s, "ب" + SHADDA + hk, { x: PX, y: CY - PH/2, w: PW, h: PH, fontSize: 100, objectName: "Result" }, 1);
  arrow(s, 5.6, CY, 0.7, 2, "left");
  const D = 1.7, C1 = 3.6, C2 = 1.35;
  circle(s, C1, CY, D, RING[0], 1); circle(s, C2, CY, D, RING[2], 2);
  pair(s, "ب", "ب" + SUKUN, C1, CY, D, 90, 3, 4, "1");
  badge(s, "stop", C1 + D/2, CY - D/2 - 0.62, 5, 1);
  plus(s, C1 - 0.3, CY, 0.5, 6, 1);
  pair(s, "ب", "ب" + hk, C2, CY, D, 90, 7, 8, "2");
  badge(s, "go", C2 + D/2, CY - D/2 - 0.62, 9, 2);
  s.addNotes(k === 0 ? NOTES.meet + " " + NOTES.split : NOTES.split);
});

// 2) split practice on single doubled letters (fatha)
["ن","م","د","ل","ر","س","ك","ق"].forEach(L => {
  const s = pres.addSlide(); s.background = { color: BG }; deco(s);
  const CY = 2.8, D = 1.9, GAP = 0.7;
  const c1 = 9.25 - D, c2 = c1 - GAP - D, PW = 3.0, PH = 2.2, PX = c2 - 1.0 - PW;
  circle(s, c1, CY, D, RING[0], 1); circle(s, c2, CY, D, RING[2], 2); panel(s, PX, CY, PW, PH);
  pair(s, L, L + SUKUN, c1, CY, D, 84, 1, 2, "1");
  badge(s, "stop", c1 + D/2, CY - D/2 - 0.62, 3, 1);
  plus(s, c1 - GAP/2, CY, 0.45, 4, 1);
  pair(s, L, L + FATHA, c2, CY, D, 84, 5, 6, "2");
  badge(s, "go", c2 + D/2, CY - D/2 - 0.62, 7, 2);
  arrow(s, c2 - 0.85, CY, 0.7, 8, "left");
  arText(s, L + SHADDA + FATHA, { x: PX, y: CY - PH/2, w: PW, h: PH, fontSize: 90, objectName: "Result" }, 9);
  s.addNotes(NOTES.primer);
});

// 3) real words: [letter + harakah] + [doubled letter sukun] + [doubled letter harakah]
// word = [first letter, its harakah, doubled letter, doubled letter's harakah]
const W = [
 ["أ",FATHA,"ن",FATHA],["ر",FATHA,"ب",FATHA],["ح",FATHA,"ق",FATHA],["ض",FATHA,"ل",FATHA],["ظ",FATHA,"ل",FATHA],
 ["ج",FATHA,"ن",FATHA],["م",FATHA,"س",FATHA],["م",FATHA,"ر",FATHA],["ر",FATHA,"د",FATHA],["م",FATHA,"د",FATHA],
 ["ش",FATHA,"د",FATHA],["ع",FATHA,"د",FATHA],["ظ",FATHA,"ن",FATHA],["ح",FATHA,"ج",FATHA],["ص",FATHA,"د",FATHA],
 ["ف",FATHA,"ر",FATHA],["ك",FATHA,"ف",FATHA],["غ",FATHA,"ش",FATHA],["ث",FATHA,"م",FATHA],["ه",FATHA,"م",FATHA],
 ["م",DAMMA,"د",FATHA],["ش",DAMMA,"د",FATHA],["ر",DAMMA,"د",FATHA],["ج",DAMMA,"ن",FATHA],["ع",DAMMA,"د",FATHA],
 ["إ",KASRA,"ن",FATHA],["ف",KASRA,"ر",FATHA],["ج",KASRA,"د",FATHA],
];
W.forEach(([a, ah, b, bh]) => {
  const s = pres.addSlide(); s.background = { color: BG }; deco(s);
  const CY = 2.8, D = 1.4, GAP = 0.55, PW = 2.55, PH = 2.0;
  const c1 = 9.35 - D, c2 = c1 - GAP - D, c3 = c2 - GAP - D, PX = c3 - 0.85 - PW;
  circle(s, c1, CY, D, RING[0], 1); circle(s, c2, CY, D, RING[1], 2); circle(s, c3, CY, D, RING[2], 3); panel(s, PX, CY, PW, PH);
  pair(s, a, a + ah, c1, CY, D, 60, 1, 2, "1");
  plus(s, c1 - GAP/2, CY, 0.38, 3, 1);
  pair(s, b, b + SUKUN, c2, CY, D, 60, 4, 5, "2");
  badge(s, "stop", c2 + D/2, CY - D/2 - 0.58, 6, 1);
  plus(s, c2 - GAP/2, CY, 0.38, 7, 2);
  pair(s, b, b + bh, c3, CY, D, 60, 8, 9, "3");
  badge(s, "go", c3 + D/2, CY - D/2 - 0.58, 10, 2);
  arrow(s, c3 - 0.775, CY, 0.6, 11, "left");
  arText(s, a + ah + b + SHADDA + bh, { x: PX, y: CY - PH/2, w: PW, h: PH, fontSize: 66, objectName: "Result" }, 12);
  s.addNotes(NOTES.word);
});
(async () => { await pres.writeFile({ fileName: "Shaddah.raw.pptx" }); })();
