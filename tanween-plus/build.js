// Tanween decks, improved: same method as tanween-3/ (one file per tanween; every letter alone, then with
// each earlier letter before it; fathatan shows its silent alif in a grey circle), plus sentences,
// a different background on every slide, and font sizes measured so every letter, word and mark stays inside its shape.
// No pictures. Sounds are added by ../fathah-plus/post.py on slide transitions only (no sound on click reveals).
const pptxgen = require("pptxgenjs");
const measure = require("../fathah-plus/measure");
const T = new pptxgen().ShapeType;
const FATHA = "َ";
const FONT = "Arial";
const INK = "16213E";
const RING = ["E8604C", "3A8FD9", "2FB57A"];       // right, middle, left source circle
const GREY = "9AA0B5";                              // the silent alif's circle and sign
const W = 10, H = 5.625;
const BAND_TOP = 0.95, BAND_BOTTOM = 4.7;          // decorations live only above / below these lines

// ---------- letters and slides (unchanged method) ----------
const TANS = ["ً", "ٍ", "ٌ"];
const KINDS = [
  { file: "Tanween-1-Fathatan", name: "fathatan" },
  { file: "Tanween-2-Kasratan", name: "kasratan" },
  { file: "Tanween-3-Dammatan", name: "dammatan" },
];
const ALPHA = ["أ","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه","و","ي"];
// alif with kasratan carries its hamza below (إٍ); before the mark appears it is shown as a bare alif
const seat = (X, kind) => (kind === 1 && X === "أ" ? "إ" : X);
const bare = (X, kind) => (kind === 1 && X === "أ" ? "ا" : X);
const partners = X => { const i = ALPHA.indexOf(X); return i >= 7 ? ALPHA.slice(0, i) : ALPHA.filter(l => l !== X).slice(0, 7); };
const NOTE_ALIF = "تنوين الفتح لا بد له من ألف فارغة بعده: «بً» خطأ، والصحيح «بًا». الألف لا تُقرأ وحدها، هي كرسيّ يحمل الصوت «ـَنْ» (بَ + نْ = بًا). الدائرة الرمادية وعلامة المنع تعنيان أن هذه الألف صامتة. الاستثناءات: التاء المربوطة (شَجَرَةً) والهمزة على الألف (خَطَأً).";
const NOTE_HAMZA = "استثناء: على الهمزة فوق الألف (أً) يجلس تنوين الفتح على الألف نفسها، فلا نضيف ألفاً ثانية، مثل «خَطَأً».";
const NOTE_RULE = "قاعدة تنوين الفتح: «بً» وحدها خطأ (العلامة الحمراء)، والصحيح «بًا» بألف فارغة بعدها (العلامة الخضراء). الألف لا تُقرأ، والصوت «بَنْ».";
const NOTE_EXC = "الاستثناءات: لا نضيف ألفاً بعد تنوين الفتح في حرفين: التاء المربوطة (ةً) مثل «شَجَرَةً»، والهمزة على الألف (أً) مثل «خَطَأً». ويأتي لاحقاً: الهمزة بعد الألف (سَمَاءً) والألف المقصورة (هُدًى).";
const NOTE_NOALIF = "تنوين الكسر وتنوين الضم لا يحتاجان ألفاً: العلامة على الحرف الأخير، وتُقرأ «ـِنْ» (تنوين الكسر) أو «ـُنْ» (تنوين الضم). تنوين الفتح وحده يضيف ألفاً.";

// ---------- sentences: fathah, kasrah, dammah and tanween only (no sukun or shaddah yet) ----------
// fathatan is followed by its silent alif; ة (taa marbuta) may carry the tanween
const SENTENCES = [
  ["رَسَمَ قَمَرًا", "أَكَلَ عِنَبًا", "شَرِبَ لَبَنًا", "رَكِبَ جَمَلًا", "حَمَلَ حَجَرًا", "صَعِدَ جَبَلًا", "زَرَعَ شَجَرًا", "أَخَذَ قَلَمًا",
   "رَسَمَ شَجَرَةً", "أَكَلَ ثَمَرَةً"],
  ["كَتَبَ بِقَلَمٍ", "لَعِبَ بِكُرَةٍ", "قَلَمُ وَلَدٍ", "وَرَقُ شَجَرٍ", "لَبَنُ بَقَرٍ", "صُوَرُ أَسَدٍ", "مَسَحَ بِيَدٍ", "رَسَمَ بِقَلَمٍ"],
  ["نَزَلَ مَطَرٌ", "ظَهَرَ قَمَرٌ", "نَبَتَ شَجَرٌ", "جَلَسَ وَلَدٌ", "قَلَمٌ وَوَرَقٌ", "أَبٌ وَأَخٌ", "عِنَبٌ وَرُطَبٌ", "عَسَلٌ وَلَبَنٌ"],
];
const MARKS = /[ً-ِ]/;                     // fathatan, dammatan, kasratan, fathah, dammah, kasrah
SENTENCES.forEach((list, k) => list.forEach(s => {
  if (!/^[ء-يةً-ِ ]+$/.test(s)) throw new Error("mark not taught yet in " + s);
  if (!s.includes(TANS[k])) throw new Error("no " + KINDS[k].name + " in " + s);
  // fathatan always takes an empty alif after it, except on ة and أ
  s.split(" ").forEach(w => [...w].forEach((ch, i, a) => {
    if (ch === TANS[0] && (a[i + 1] === "ا") === ["ة", "أ"].includes(a[i - 1])) throw new Error("fathatan alif rule broken in " + w);
    if (MARKS.test(ch)) return;
    if (ch === "ا" && a[i - 1] === TANS[0] && i === a.length - 1) return;   // the silent alif of fathatan
    if (!MARKS.test(a[i + 1] || "")) throw new Error("letter without a mark in " + w);
  }));
}));

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
  const hue = (deckNo * 53 + i * 137.508) % 360;
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

// letters = [p, X] or [X]; p carries fathah, X carries the tanween; fathatan adds a silent alif circle
function tanweenSlide(s, kind, letters, th, note) {
  const X = letters[letters.length - 1], p = letters.length > 1 ? letters[0] : null, mark = TANS[kind];
  const alif = kind === 0 && X !== "أ";
  const circles = [];
  if (p) circles.push({ c: p, full: p + FATHA });
  circles.push({ c: bare(X, kind), full: seat(X, kind) + mark });
  if (alif) circles.push({ c: "ا", full: null, ring: GREY });                // بً alone is wrong: always بًا
  const n = circles.length, CY = 2.8;
  const result = (p ? p + FATHA : "") + seat(X, kind) + mark + (alif ? "ا" : "");
  s.addNotes(note || (kind === 0 ? (alif ? NOTE_ALIF : NOTE_HAMZA) : NOTE_NOALIF));
  if (n === 1) {
    const d = 3.3, x = 5 - d / 2, y = CY - d / 2, pt = fitCircle(seat(X, kind) + mark, d, 10, 190);
    shape(s, T.ellipse, { x, y, w: d, h: d, fill: { color: "FFFFFF" }, line: { color: RING[1], width: 10 } }, "Circle 1");
    arText(s, bare(X, kind), { x, y, w: d, h: d, fontSize: pt, objectName: "C1 L1 letter" });
    arText(s, seat(X, kind) + mark, { x, y, w: d, h: d, fontSize: pt, objectName: "C2 T1 tanween" });
    return;
  }
  const g = n === 2
    ? { d: 1.9, gap: 0.7, zone: 1.0, pw: 3.0, ph: 2.2, fs: 96, rs: 110, plus: 0.45, aw: 0.7, bs: 0.42 }
    : { d: 1.45, gap: 0.5, zone: 0.85, pw: 2.65, ph: 2.0, fs: 72, rs: 90, plus: 0.36, aw: 0.6, bs: 0.36 };
  let right = n === 2 ? 9.25 : 9.4;
  const cx = [];
  for (let i = 0; i < n; i++) { cx.push(right - g.d); right = right - g.d - g.gap; }
  // one size for every letter on the slide, the largest that fits all of them
  const lpt = Math.min(...circles.map(c => fitCircle(c.full || c.c, g.d, 8, g.fs)));
  const rpt = fitRect(result, g.pw, g.ph, 0.22, g.rs);
  circles.forEach((c, i) => shape(s, T.ellipse, { x: cx[i], y: CY - g.d / 2, w: g.d, h: g.d, fill: { color: "FFFFFF" },
    line: { color: c.ring || (n === 2 ? [RING[0], RING[2]][i] : RING[i]), width: 8 } }, `Circle ${i + 1}`));
  const leftSrc = cx[n - 1], panelX = leftSrc - g.zone - g.pw;
  shape(s, T.roundRect, { x: panelX, y: CY - g.ph / 2, w: g.pw, h: g.ph, rectRadius: 0.3,
    fill: { color: "FFFBE3" }, line: { color: "F2B134", width: 6 } }, "Result panel");
  let k = 1; const order = [];
  circles.forEach((c, i) => {
    const o = { x: cx[i], y: CY - g.d / 2, w: g.d, h: g.d, fontSize: lpt };
    order.push(() => arText(s, c.c, Object.assign({ objectName: `C${k++} L${i + 1} letter` }, o)));
    if (c.full) order.push(() => arText(s, c.full, Object.assign({ objectName: `C${k++} M${i + 1} mark` }, o)));
    else order.push(() => shape(s, T.noSmoking, { x: cx[i] + g.d / 2 - g.bs / 2, y: CY - g.d / 2 - g.bs - 0.1, w: g.bs, h: g.bs,
      fill: { color: GREY }, line: { color: "FFFFFF", width: 1.5 } }, `C${k++} B silent sign`));
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

// a green tick (two thick lines) or a red cross under a panel, revealed on click k
function verdict(s, ok, cx, y, k) {
  if (!ok) return shape(s, T.mathMultiply, { x: cx - 0.35, y, w: 0.7, h: 0.7, fill: { color: "E03131" }, line: { width: 0 } }, `C${k} X wrong`);
  const line = { color: "2F9E44", width: 12 };
  shape(s, T.line, { x: cx - 0.3, y: y + 0.3, w: 0.22, h: 0.3, line }, `C${k} V tick a`);
  shape(s, T.line, { x: cx - 0.08, y: y + 0.02, w: 0.42, h: 0.58, line, flipV: true }, `C${k} V tick b`);
}
// the rule: «بً» alone is wrong (red cross), «بًا» with its empty alif is right (green tick)
function ruleSlide(s, X) {
  const PW = 3.4, PH = 2.3, PY = 1.25, right = { x: 5.6, t: X + TANS[0], ok: false }, left = { x: 1.0, t: X + TANS[0] + "ا", ok: true };
  const pt = Math.min(fitRect(right.t, PW, PH, 0.25, 150), fitRect(left.t, PW, PH, 0.25, 150));
  [right, left].forEach((p, i) => {
    shape(s, T.roundRect, { x: p.x, y: PY, w: PW, h: PH, rectRadius: 0.3, fill: { color: "FFFFFF" },
      line: { color: p.ok ? "2F9E44" : "E03131", width: 8 } }, `Panel ${i + 1}`);
    arText(s, p.t, { x: p.x, y: PY, w: PW, h: PH, fontSize: pt, objectName: `C${2 * i + 1} W${i + 1} word` });
    verdict(s, p.ok, p.x + PW / 2, PY + PH + 0.2, 2 * i + 2);
  });
  s.addNotes(NOTE_RULE);
}
// the exceptions: ةً and أً take no alif, with a word for each
function exceptionSlide(s) {
  const PW = 3.5, PH = 3.5, PY = 1.0, TOP = 0.58;   // ending in the top part of the panel, a word under it
  const items = [{ x: 5.3, tick: 9.4, end: "ة" + TANS[0], word: "شَجَرَةً" }, { x: 1.2, tick: 0.6, end: "أ" + TANS[0], word: "خَطَأً" }];
  const ept = Math.min(...items.map(it => fitRect(it.end, PW, PH * TOP, 0.2, 150)));
  const wpt = Math.min(...items.map(it => fitRect(it.word, PW, PH * (1 - TOP), 0.2, 90)));
  items.forEach((it, i) => {
    shape(s, T.roundRect, { x: it.x, y: PY, w: PW, h: PH, rectRadius: 0.3, fill: { color: "FFFBE3" }, line: { color: "2F9E44", width: 8 } }, `Panel ${i + 1}`);
    arText(s, it.end, { x: it.x, y: PY, w: PW, h: PH * TOP, fontSize: ept, objectName: `C${3 * i + 1} E${i + 1} ending` });
    arText(s, it.word, { x: it.x, y: PY + PH * TOP, w: PW, h: PH * (1 - TOP), fontSize: wpt, objectName: `C${3 * i + 2} E${i + 1} word` });
    verdict(s, true, it.tick, PY + PH / 2 - 0.3, 3 * i + 3);
  });
  s.addNotes(NOTE_EXC);
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
  const plan = KINDS.map((K, kind) => {
    const intro = kind === 0 ? NOTE_ALIF : NOTE_NOALIF;
    const slides = kind === 0
      ? [{ rule: "ب" }, { letters: ["ب"], note: intro }, { rule: "ت" }, { letters: ["ت"], note: intro }, { exceptions: true }]
      : [{ letters: ["ب"], note: intro }, { letters: ["ت"], note: intro }];
    ALPHA.forEach(X => { slides.push({ letters: [X] }); partners(X).forEach(p => slides.push({ letters: [p, X] })); });
    SENTENCES[kind].forEach(sen => slides.push({ sentence: sen }));
    return { K, kind, slides };
  });
  const strings = ["ا", "ة" + TANS[0], "أ" + TANS[0], "شَجَرَةً", "خَطَأً"];
  plan.forEach(({ kind, slides }) => slides.forEach(sl => {
    if (sl.rule) strings.push(sl.rule + TANS[0], sl.rule + TANS[0] + "ا");
    else if (sl.exceptions) return;
    else if (sl.letters) {
      const X = sl.letters[sl.letters.length - 1], p = sl.letters.length > 1 ? sl.letters[0] : "";
      strings.push(seat(X, kind) + TANS[kind], bare(X, kind), X + TANS[kind] + "ا");
      if (p) strings.push(p + FATHA, (p + FATHA) + seat(X, kind) + TANS[kind] + (kind === 0 && X !== "أ" ? "ا" : ""));
    } else { strings.push(sl.sentence); sl.sentence.split(" ").forEach(w => strings.push(w)); }
  }));
  M = await measure(strings);
  const outDir = process.argv[2] || ".";
  for (const { K, kind, slides } of plan) {
    const pres = new pptxgen();
    pres.layout = "LAYOUT_16x9";
    pres.title = K.file;
    used.clear();
    slides.forEach((sl, i) => {
      const s = pres.addSlide(), th = background(kind + 3, i);
      s.background = { color: th.bg };
      content = []; deco = [];
      scenery(s, th);
      if (sl.rule) ruleSlide(s, sl.rule);
      else if (sl.exceptions) exceptionSlide(s);
      else if (sl.letters) tanweenSlide(s, kind, sl.letters, th, sl.note);
      else sentenceSlide(s, sl.sentence, th);
      checkOverlap(`${K.file} slide ${i + 1}`);
    });
    await pres.writeFile({ fileName: `${outDir}/${K.file}.raw.pptx` });
    console.log(K.file, slides.length, "slides,", SENTENCES[kind].length, "sentences");
  }
})().catch(e => { console.error(e); process.exit(1); });
