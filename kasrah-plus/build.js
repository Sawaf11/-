// Kasrah decks, improved: same letter order and beginning/middle/end method as all-letters-kasrah/,
// plus sentences (fathah + kasrah only), animal and bird friends on every slide, a different background
// on every slide, and font sizes measured so every letter, word and kasrah stays inside its shape.
// Sounds are added by post.py on slide transitions only (no sound on click reveals).
const pptxgen = require("pptxgenjs");
const measure = require("../fathah-plus/measure");
const friends = require("../characters/friends");
const T = new pptxgen().ShapeType;
const FATHA = "َ", KASRA = "ِ";
// alif carries its hamza below with kasrah (إِ); before the kasrah appears it is shown as a bare alif
const withK = l => (l === "أ" ? "إ" : l) + KASRA;
const bare = l => (l === "أ" ? "ا" : l);
const FONT = "Arial";
const INK = "16213E";
const RING = ["E8604C", "3A8FD9", "2FB57A"];       // right, middle, left source circle
const W = 10, H = 5.625;
const BAND_TOP = 0.95, BAND_BOTTOM = 4.7;          // decorations live only above / below these lines

// ---------- letters and slides (unchanged method) ----------
const FAMILIES = [
  ["01-alif", ["أ"]], ["02-ba-ta-tha", ["ب","ت","ث"]], ["03-noon-ya", ["ن","ي"]],
  ["04-jeem-ha-kha", ["ج","ح","خ"]], ["05-dal-dhal", ["د","ذ"]], ["06-ra-zay", ["ر","ز"]],
  ["07-seen-sheen", ["س","ش"]], ["08-sad-dad", ["ص","ض"]], ["09-ta-dha", ["ط","ظ"]],
  ["10-ain-ghain", ["ع","غ"]], ["11-fa-qaf", ["ف","ق"]], ["12-kaf", ["ك"]],
  ["13-lam", ["ل"]], ["14-meem", ["م"]], ["15-ha", ["ه"]], ["16-waw", ["و"]],
];
const ALPHA = ["أ","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه","و","ي"];
const partners = X => { const i = ALPHA.indexOf(X); return i >= 7 ? ALPHA.slice(0, i) : ALPHA.filter(l => l !== X).slice(0, 7); };
const slidesFor = X => {
  const P = partners(X), out = [[X]];
  P.forEach(p => out.push([X, p]));                                   // beginning
  P.forEach((p, k) => out.push([p, X, P[(k + 1) % P.length]]));       // middle
  P.forEach(p => out.push([p, X]));                                   // end
  return out;
};
// ---------- sentences: only fathah and kasrah (both already taught); each has a kasrah and the deck's letter ----------
const SENTENCES = {
  "01-alif": ["أَمِنَ وَفَرِحَ", "أَكَلَ وَشَبِعَ", "قَرَأَ وَفَهِمَ", "سَأَلَ وَعَلِمَ"],
  "02-ba-ta-tha": ["شَرِبَ وَلَعِبَ", "لَعِبَ وَتَعِبَ", "رَكِبَ وَفَرِحَ", "وَرِثَ وَشَكَرَ", "تَعِبَ وَجَلَسَ"],
  "03-noon-ya": ["نَسِيَ وَحَزِنَ", "لَقِيَ وَفَرِحَ", "يَبِسَ وَسَقَطَ", "حَزِنَ وَبَقِيَ"],
  "04-jeem-ha-kha": ["فَرِحَ وَضَحِكَ", "حَفِظَ وَفَهِمَ", "خَشِيَ وَرَجَعَ", "شَرِبَ وَحَمِدَ"],
  "05-dal-dhal": ["صَعِدَ وَنَزَلَ", "حَمِدَ وَشَكَرَ", "أَذِنَ وَدَخَلَ", "حَذِرَ وَسَلِمَ"],
  "06-ra-zay": ["رَكِبَ وَفَرِحَ", "حَزِنَ وَصَبَرَ", "شَرِبَ وَرَضِيَ", "رَحِمَ وَرَزَقَ"],
  "07-seen-sheen": ["سَمِعَ وَفَهِمَ", "لَبِسَ وَخَرَجَ", "عَطِشَ وَشَرِبَ", "سَلِمَ وَفَرِحَ"],
  "08-sad-dad": ["صَعِدَ وَنَزَلَ", "ضَحِكَ وَلَعِبَ", "رَضِيَ وَشَكَرَ", "حَضَرَ وَسَمِعَ"],
  "09-ta-dha": ["عَطِشَ وَشَرِبَ", "حَفِظَ وَفَهِمَ", "طَبَخَ وَأَكَلَ وَشَبِعَ", "يَقِظَ وَقَعَدَ"],
  "10-ain-ghain": ["سَمِعَ وَعَلِمَ", "لَعِبَ وَتَعِبَ", "عَمِلَ وَتَعِبَ", "غَسَلَ وَلَبِسَ", "شَبِعَ وَحَمِدَ"],
  "11-fa-qaf": ["فَرِحَ وَضَحِكَ", "قَدِمَ وَجَلَسَ", "فَهِمَ وَحَفِظَ", "لَقِيَ وَفَرِحَ"],
  "12-kaf": ["رَكِبَ وَضَحِكَ", "ضَحِكَ وَلَعِبَ", "أَكَلَ وَشَبِعَ", "سَكَتَ وَسَمِعَ"],
  "13-lam": ["لَعِبَ وَتَعِبَ", "لَبِسَ وَخَرَجَ", "عَلِمَ وَعَمِلَ", "قَبِلَ وَشَكَرَ"],
  "14-meem": ["سَمِعَ وَفَهِمَ", "رَحِمَ وَرَزَقَ", "عَمِلَ وَتَعِبَ", "حَمِدَ وَشَكَرَ"],
  "15-ha": ["فَهِمَ وَحَفِظَ", "شَهِدَ وَصَدَقَ", "ذَهَبَ وَلَعِبَ", "سَهِرَ وَتَعِبَ"],
  "16-waw": ["وَرِثَ وَشَكَرَ", "وَصَلَ وَفَرِحَ", "وَقَفَ وَسَمِعَ", "وَثِقَ وَأَمِنَ"],
};
const MARK = /[\u064E\u0650]/;
const LETTERS_FIRST = { "01-alif": "أ", "02-ba-ta-tha": "بتث", "03-noon-ya": "ني", "04-jeem-ha-kha": "جحخ", "05-dal-dhal": "دذ",
  "06-ra-zay": "رز", "07-seen-sheen": "سش", "08-sad-dad": "صض", "09-ta-dha": "طظ", "10-ain-ghain": "عغ", "11-fa-qaf": "فق",
  "12-kaf": "ك", "13-lam": "ل", "14-meem": "م", "15-ha": "ه", "16-waw": "و" };
for (const [f, list] of Object.entries(SENTENCES)) list.forEach(s => {
  if (!/^[\u0621-\u064A\u064E\u0650 ]+$/.test(s)) throw new Error("mark other than fathah/kasrah in " + s);
  if (!s.includes(KASRA)) throw new Error("no kasrah in " + s);
  if (![...LETTERS_FIRST[f]].some(l => s.includes(l))) throw new Error("deck letter missing in " + s);
  s.split(" ").forEach(w => { if ([...w].some((ch, i, a) => !MARK.test(ch) && !MARK.test(a[i + 1] || ""))) throw new Error("letter without a mark in " + w); });
});
const deckLetters = Object.fromEntries(Object.entries(LETTERS_FIRST).map(([f, l]) => [f, [...l]]));
for (const [f, ls] of Object.entries(deckLetters)) ls.forEach(l => { if (!SENTENCES[f].some(x => x.includes(l))) throw new Error(f + ": no sentence with " + l); });

// ---------- font fitting ----------
let M;                                              // ink metrics per em, from measure.js
const BASE = [0.25, 0.45];                          // baseline below box centre (em) – covers PowerPoint/LibreOffice
function inkBox(s, pt) {
  const m = M[s], em = pt / 72;
  return BASE.map(b => ({ l: -m.l * em, r: m.r * em, t: (b - m.a) * em, b: (b + m.d) * em }));
}
function fitCircle(s, d, ringPt, maxPt) {
  const r = d / 2 - ringPt / 72 - 0.1;
  for (let pt = maxPt; pt > 8; pt--) {
    if (inkBox(s, pt).every(k => [k.l, k.r].every(x => [k.t, k.b].every(y => Math.hypot(x, y) <= r)))) return pt;
  }
  throw new Error("cannot fit " + s);
}
function fitRect(s, w, h, pad, maxPt) {
  for (let pt = maxPt; pt > 8; pt--) {
    if (inkBox(s, pt).every(k => -k.l <= w / 2 - pad && k.r <= w / 2 - pad && -k.t <= h / 2 - pad && k.b <= h / 2 - pad)) return pt;
  }
  throw new Error("cannot fit " + s);
}
const inkW = (s, pt) => (M[s].l + M[s].r) * pt / 72;

// ---------- colours and backgrounds ----------
function hsl(h, s, l) {
  h = ((h % 360) + 360) % 360; const a = s * Math.min(l, 1 - l);
  const f = n => { const k = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))); };
  return [f(0), f(8), f(4)].map(v => v.toString(16).padStart(2, "0")).join("").toUpperCase();
}
const SCENES = ["meadow", "night", "sea", "garden", "space", "sunset"];
const used = new Set();
function background(deckNo, i) {
  const scene = SCENES[(i + deckNo) % SCENES.length];
  const hue = (deckNo * 53 + i * 137.508 + 25) % 360;
  const dark = scene === "night" || scene === "space";
  let l = dark ? 0.17 : 0.87, bg;
  do { bg = hsl(hue, dark ? 0.55 : 0.75, l); l += dark ? 0.004 : -0.004; } while (used.has(bg));
  used.add(bg);
  return { scene, hue, bg };
}

// ---------- drawing ----------
let content, deco;                                  // boxes on the current slide, for the overlap check
function box(list, x, y, w, h, name) { list.push({ x, y, w, h, name }); }
function arText(s, text, o) {
  s.addText(text, Object.assign({ fontFace: FONT, color: INK, align: "center", valign: "middle",
    margin: 0, isTextBox: true, rtlMode: true, lang: "ar-SA", fit: "none", wrap: false }, o));
}
function shape(s, kind, o, name, isDeco) {
  s.addShape(kind, Object.assign({ objectName: name }, o));
  if (isDeco) box(deco, o.x, o.y, o.w, o.h, name); else box(content, o.x, o.y, o.w, o.h, name);
}
function scenery(s, { scene, hue }) {
  const d = (k, x, y, w, h, color, name, extra) => shape(s, T[k], Object.assign({ x, y, w, h,
    fill: { color }, line: { color, width: 0 } }, extra || {}), "Deco " + name, true);
  const c = (dh, sat, l) => hsl(hue + dh, sat, l);
  if (scene === "meadow") {
    d("ellipse", -1.0, 4.85, 5.2, 1.6, c(120 - hue % 40, 0.5, 0.6), "hill left");
    d("ellipse", 4.4, 4.95, 6.4, 1.6, c(140 - hue % 40, 0.5, 0.5), "hill right");
    d("sun", 0.3, 0.1, 0.8, 0.8, "FFD23F", "sun");
    d("cloud", 7.5, 0.12, 1.6, 0.7, "FFFFFF", "cloud");
    d("cloud", 8.6, 0.5, 0.9, 0.4, "F4FAFF", "cloud small");
    [1.4, 2.0, 8.0, 8.7].forEach((x, k) => d("star5", x, 4.95, 0.32, 0.32, ["FF7A90", "FFB347", "8E5BD0", "FF7A90"][k], "flower " + k));
  } else if (scene === "night") {
    d("moon", 0.4, 0.1, 0.55, 0.8, "FFE88A", "moon");
    [[1.4, 0.2], [2.4, 0.55], [3.6, 0.15], [6.3, 0.5], [7.4, 0.12], [8.5, 0.45], [9.3, 0.15]].forEach(([x, y], k) =>
      d(k % 2 ? "star4" : "star5", x, y, k % 3 ? 0.3 : 0.4, k % 3 ? 0.3 : 0.4, "FFF3A3", "star " + k));
    d("ellipse", -1.0, 4.9, 5.4, 1.6, c(30, 0.4, 0.28), "hill left");
    d("ellipse", 4.6, 5.0, 6.2, 1.6, c(60, 0.4, 0.34), "hill right");
  } else if (scene === "sea") {
    d("wave", -0.2, 4.8, 10.4, 0.6, c(200 - hue % 30, 0.6, 0.6), "wave back");
    d("rect", 0, 5.15, 10, 0.5, c(205 - hue % 30, 0.6, 0.5), "sea floor");
    [[0.4, 0.2, 0.45], [1.0, 0.55, 0.28], [8.9, 0.15, 0.5], [8.4, 0.6, 0.25], [9.5, 0.62, 0.2]].forEach(([x, y, r], k) =>
      d("ellipse", x, y, r, r, "FFFFFF", "bubble " + k, { fill: { color: "FFFFFF", transparency: 45 }, line: { color: "FFFFFF", width: 1.5 } }));
    d("sun", 4.6, 0.12, 0.75, 0.75, "FFD23F", "sun");
  } else if (scene === "garden") {
    d("rect", 0, 5.05, 10, 0.6, c(110 - hue % 40, 0.5, 0.55), "grass");
    [0.5, 1.4, 2.3, 7.4, 8.3, 9.1].forEach((x, k) => {
      d("ellipse", x + 0.13, 5.18, 0.04, 0.4, "3C8D40", "stem " + k);
      d("flowChartConnector", x, 4.78, 0.3, 0.3, ["FF7A90", "FFB347", "B892FF", "FF6F91", "FFD23F", "7EC8FF"][k], "flower " + k);
    });
    d("heart", 0.45, 0.25, 0.5, 0.45, c(340, 0.8, 0.65), "heart");
    d("cloud", 7.8, 0.12, 1.6, 0.7, "FFFFFF", "cloud");
    d("smileyFace", 6.9, 0.2, 0.6, 0.6, "FFD166", "friend");
  } else if (scene === "space") {
    d("ellipse", 8.4, 0.1, 0.8, 0.8, c(30, 0.7, 0.6), "planet");
    d("ellipse", 8.15, 0.42, 1.3, 0.18, c(30, 0.7, 0.6), "planet ring",
      { fill: { color: "FFFFFF", transparency: 100 }, line: { color: c(60, 0.8, 0.75), width: 2 } });
    d("ellipse", 0.3, 0.2, 0.55, 0.55, c(180, 0.6, 0.65), "small planet");
    [[1.5, 0.3], [2.7, 0.1], [4.2, 0.55], [5.6, 0.15], [7.2, 0.5], [1.2, 5.0], [3.0, 5.2], [6.8, 5.1], [8.9, 5.0]].forEach(([x, y], k) =>
      d(k % 2 ? "star4" : "star5", x, y, 0.28, 0.28, k % 3 ? "FFFFFF" : "FFE066", "star " + k));
    d("ellipse", 3.5, 5.15, 3.0, 1.2, c(260, 0.3, 0.4), "moon surface");
  } else {                                            // sunset
    d("ellipse", 3.9, 4.75, 2.2, 2.2, "FFB347", "sun low");
    d("ellipse", -1.2, 5.0, 5.0, 1.4, c(25, 0.6, 0.62), "dune left");
    d("ellipse", 5.8, 5.05, 5.6, 1.4, c(15, 0.6, 0.55), "dune right");
    d("cloud", 0.35, 0.15, 1.5, 0.65, "FFFFFF", "cloud");
    d("cloud", 7.9, 0.2, 1.4, 0.6, "FFF3E8", "cloud right");
    [[3.2, 0.35], [3.6, 0.25], [5.9, 0.4]].forEach(([x, y], k) => d("chevron", x, y, 0.3, 0.14, "6B4A3A", "bird " + k, { rotate: 90 }));
  }
}
function checkOverlap(where) {
  for (const a of deco) for (const b of content)
    if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) throw new Error("decoration overlaps content on " + where);
  for (const b of content) if (b.x < 0 || b.y < BAND_TOP - 0.25 || b.x + b.w > W || b.y + b.h > BAND_BOTTOM) throw new Error("content outside safe area on " + where);
}

function letterSlide(s, letters, th) {
  const n = letters.length, CY = 2.8;
  const result = letters.map(withK).join("");
  if (n === 1) {
    const d = 3.3, x = 5 - d / 2, y = CY - d / 2, pt = fitCircle(withK(letters[0]), d, 10, 190);
    shape(s, T.ellipse, { x, y, w: d, h: d, fill: { color: "FFFFFF" }, line: { color: RING[1], width: 10 } }, "Circle 1");
    arText(s, bare(letters[0]), { x, y, w: d, h: d, fontSize: pt, objectName: "C1 L1 letter" });
    arText(s, withK(letters[0]), { x, y, w: d, h: d, fontSize: pt, objectName: "C2 K1 kasrah" });
    return;
  }
  const g = n === 2
    ? { d: 1.9, gap: 0.7, zone: 1.0, pw: 3.0, ph: 2.2, fs: 96, rs: 110, plus: 0.45, aw: 0.7 }
    : { d: 1.45, gap: 0.5, zone: 0.85, pw: 2.65, ph: 2.0, fs: 72, rs: 90, plus: 0.36, aw: 0.6 };
  let right = n === 2 ? 9.25 : 9.4;
  const cx = [];
  for (let i = 0; i < n; i++) { cx.push(right - g.d); right = right - g.d - g.gap; }
  // one size for every letter on the slide, the largest that fits all of them
  const lpt = Math.min(...letters.map(l => fitCircle(withK(l), g.d, 8, g.fs)));
  const rpt = fitRect(result, g.pw, g.ph, 0.22, g.rs);
  letters.forEach((l, i) => shape(s, T.ellipse, { x: cx[i], y: CY - g.d / 2, w: g.d, h: g.d, fill: { color: "FFFFFF" },
    line: { color: n === 2 ? [RING[0], RING[2]][i] : RING[i], width: 8 } }, `Circle ${i + 1}`));
  const leftSrc = cx[n - 1], panelX = leftSrc - g.zone - g.pw;
  shape(s, T.roundRect, { x: panelX, y: CY - g.ph / 2, w: g.pw, h: g.ph, rectRadius: 0.3,
    fill: { color: "FFFBE3" }, line: { color: "F2B134", width: 6 } }, "Result panel");
  let k = 1; const order = [];
  letters.forEach((l, i) => {
    const o = { x: cx[i], y: CY - g.d / 2, w: g.d, h: g.d, fontSize: lpt };
    order.push(() => arText(s, bare(l), Object.assign({ objectName: `C${k++} L${i + 1} letter` }, o)));
    order.push(() => arText(s, withK(l), Object.assign({ objectName: `C${k++} K${i + 1} kasrah` }, o)));
    if (i < n - 1) {
      const mid = cx[i] - g.gap / 2;
      order.push(() => shape(s, T.mathPlus, { x: mid - g.plus / 2, y: CY - g.plus / 2, w: g.plus, h: g.plus,
        fill: { color: hsl(th.hue + 180, 0.7, 0.5) }, line: { width: 0 } }, `C${k++} P${i + 1} plus`));
    }
  });
  order.push(() => shape(s, T.leftArrow, { x: leftSrc - g.zone / 2 - g.aw / 2, y: CY - 0.28, w: g.aw, h: 0.56,
    fill: { color: hsl(th.hue + 220, 0.6, 0.45) }, line: { width: 0 } }, `C${k++} A arrow`));
  order.push(() => arText(s, result, { x: panelX, y: CY - g.ph / 2, w: g.pw, h: g.ph, fontSize: rpt, objectName: `C${k++} R result` }));
  order.forEach(f => f());
}

function sentenceSlide(s, sentence, th) {
  const words = sentence.split(" ");
  // word pills (first word on the right), one font size for the row
  const PH = 1.5, PY = 0.98, GAP = 0.35, PAD = 0.32;
  let pt = Math.min(...words.map(w => fitRect(w, 20, PH, 0.2, 80)));
  const widths = () => words.map(w => inkW(w, pt) + 2 * PAD + 0.2);
  while (widths().reduce((a, b) => a + b, 0) + GAP * (words.length - 1) > 9.0) pt--;
  const ws = widths(), total = ws.reduce((a, b) => a + b, 0) + GAP * (words.length - 1);
  let x = 5 + total / 2;
  const pillColors = [0, 120, 240].map(dh => hsl(th.hue + dh + 40, 0.75, 0.55));
  words.forEach((w, i) => {
    x -= ws[i];
    const pw = ws[i];
    if (fitRect(w, pw, PH, 0.2, pt) < pt) throw new Error("pill too small for " + w);
    shape(s, T.roundRect, { x, y: PY, w: pw, h: PH, rectRadius: 0.4, fill: { color: "FFFFFF" },
      line: { color: pillColors[i % 3], width: 6 } }, `C${i + 1} W${i + 1} pill`);
    arText(s, w, { x, y: PY, w: pw, h: PH, fontSize: pt, objectName: `C${i + 1} W${i + 1} word` });
    x -= GAP;
  });
  const n = words.length + 1;
  shape(s, T.downArrow, { x: 4.7, y: PY + PH + 0.08, w: 0.6, h: 0.5, fill: { color: hsl(th.hue + 220, 0.6, 0.45) }, line: { width: 0 } }, `C${n} A arrow`);
  const SY = PY + PH + 0.62, SH = 1.55;
  let spt = fitRect(sentence, 20, SH, 0.22, 84);
  while (inkW(sentence, spt) + 1.0 > 9.2) spt--;
  const sw = Math.min(9.2, inkW(sentence, spt) + 1.0);
  if (fitRect(sentence, sw, SH, 0.22, spt) < spt) throw new Error("panel too small for " + sentence);
  shape(s, T.roundRect, { x: 5 - sw / 2, y: SY, w: sw, h: SH, rectRadius: 0.35, fill: { color: "FFFBE3" },
    line: { color: "F2B134", width: 6 } }, `C${n} S panel`);
  arText(s, sentence, { x: 5 - sw / 2, y: SY, w: sw, h: SH, fontSize: spt, objectName: `C${n} S sentence` });
}

(async () => {
  const plan = FAMILIES.map(([file, members]) => {
    const slides = [];
    members.forEach(X => slidesFor(X).forEach(t => slides.push({ letters: t })));
    SENTENCES[file].forEach(sen => slides.push({ sentence: sen }));
    return { file, slides };
  });
  const strings = [];
  plan.forEach(p => p.slides.forEach(sl => {
    if (sl.letters) { sl.letters.forEach(l => strings.push(withK(l), bare(l))); strings.push(sl.letters.map(withK).join("")); }
    else { strings.push(sl.sentence); sl.sentence.split(" ").forEach(w => strings.push(w)); }
  }));
  M = await measure(strings);
  const outDir = process.argv[2] || ".";
  for (const [deckNo, { file, slides }] of plan.entries()) {
    const pres = new pptxgen();
    pres.layout = "LAYOUT_16x9";
    pres.title = "Kasrah reading " + file;
    used.clear();
    slides.forEach((sl, i) => {
      const s = pres.addSlide(), th = background(deckNo, i);
      s.background = { color: th.bg };
      content = []; deco = [];
      scenery(s, th);
      if (sl.letters) letterSlide(s, sl.letters, th); else sentenceSlide(s, sl.sentence, th);
      if (!process.env.NO_PICTURES) friends(s, { content, deco, W, H }, deckNo * 131 + i * 7 + 0, th.scene);
      checkOverlap(`${file} slide ${i + 1}`);
    });
    await pres.writeFile({ fileName: `${outDir}/${file}.raw.pptx` });
    console.log(file, slides.length, "slides,", SENTENCES[file].length, "sentences");
  }
})().catch(e => { console.error(e); process.exit(1); });
