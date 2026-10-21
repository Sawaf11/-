// Sukun explained, for learners who are not Arabs: what the Quranic sukun looks like, what it means, how it is read,
// and what the mushaf means when a letter has no sukun, a small circle or an upright zero. Picture-light: letters,
// circles, panels and simple signs. Same backgrounds / text fitting as fathah-plus; sounds by ../fathah-plus/post.py.
// usage: node explain.js <outdir>
const pptxgen = require("pptxgenjs");
const measure = require("../fathah-plus/measure");
const T = new pptxgen().ShapeType;
const FATHA = "َ", KASRA = "ِ", DAMMA = "ُ", SUKUN = "ۡ", ROUND = "ْ";   // Quranic head-of-khaa sukun; round sukun of school books
const FONT = "Traditional Arabic";                                           // draws the Quranic marks
const INK = "16213E", GREEN = "2F9E44", RED = "E03131", GREY = "868E96";
const RING = ["E8604C", "3A8FD9", "2FB57A", "8E5BD0"];
const W = 10, H = 5.625;
const BAND_TOP = 0.95, BAND_BOTTOM = 4.7;

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
// like fitCircle / fitRect, but the text box is moved up or down so the ink sits in the middle of the shape
// (tall marks and descenders no longer push the size down); returns { pt, dy } with dy in inches
function centred(s, maxPt, fits) {
  const m = M[s], mid = (0.35 + (m.d - m.a) / 2);           // ink centre below the box centre, in em
  for (let pt = maxPt; pt > 8; pt--) {
    const em = pt / 72, dy = -mid * em;
    if (inkBox(s, pt).every(k => fits({ l: k.l, r: k.r, t: k.t + dy, b: k.b + dy }))) return { pt, dy };
  }
  throw new Error("cannot fit " + s);
}
const inCircle = (d, ringPt) => { const r = d / 2 - ringPt / 72 - 0.1; return k => [k.l, k.r].every(x => [k.t, k.b].every(y => Math.hypot(x, y) <= r)); };
const inRect = (w, h, pad) => k => -k.l <= w / 2 - pad && k.r <= w / 2 - pad && -k.t <= h / 2 - pad && k.b <= h / 2 - pad;
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

// small caption under (or over) a panel: plain Arabic words for the teacher to point at
function caption(s, text, x, y, w, name) {
  const f = centred(text, 30, inRect(w, 0.55, 0.05));
  arText(s, text, { x, y: y + f.dy, w, h: 0.55, fontSize: f.pt, color: "FFFFFF", objectName: name });
  content.push({ x, y, w, h: 0.55, name });
}
function tick(s, ok, cx, y, k) {
  if (!ok) return shape(s, T.mathMultiply, { x: cx - 0.35, y, w: 0.7, h: 0.7, fill: { color: RED }, line: { width: 0 } }, `C${k} X wrong`);
  const line = { color: GREEN, width: 12 };
  shape(s, T.line, { x: cx - 0.3, y: y + 0.3, w: 0.22, h: 0.3, line }, `C${k} V tick a`);
  shape(s, T.line, { x: cx - 0.08, y: y + 0.02, w: 0.42, h: 0.58, line, flipV: true }, `C${k} V tick b`);
}
// two panels side by side (right first); each { t: text, ring, label, sign: "go"|"stop"|"ok"|"no"|null }
function twoPanels(s, th, items, note) {
  const PW = 3.6, PH = 2.2, PY = 1.2, xs = [5.6, 0.8];
  const fits = items.map(it => centred(it.t, 160, inRect(PW, PH, 0.25)));
  const pt = Math.min(...fits.map(f => f.pt));
  let k = 1;
  items.forEach((it, i) => {
    const x = xs[i], f = centred(it.t, pt, inRect(PW, PH, 0.25));
    shape(s, T.roundRect, { x, y: PY, w: PW, h: PH, rectRadius: 0.3, fill: { color: "FFFFFF" }, line: { color: it.ring, width: 8 } }, `Panel ${i + 1}`);
    arText(s, it.t, { x, y: PY + f.dy, w: PW, h: PH, fontSize: f.pt, objectName: `C${k++} T${i + 1} text` });
    const sy = PY + PH + 0.15, cx = x + PW / 2;
    if (it.sign === "ok" || it.sign === "no") tick(s, it.sign === "ok", it.label ? x + 0.45 : cx, sy, k++);
    else if (it.sign === "go") shape(s, T.leftArrow, { x: (it.label ? x + 0.1 : cx - 0.45), y: sy + 0.08, w: 0.8, h: 0.5, fill: { color: GREEN }, line: { width: 0 } }, `C${k++} G go`);
    else if (it.sign === "stop") shape(s, T.octagon, { x: (it.label ? x + 0.12 : cx - 0.33), y: sy, w: 0.66, h: 0.66, fill: { color: RED }, line: { color: "FFFFFF", width: 2 } }, `C${k++} S stop`);
    if (it.label) {
      shape(s, T.roundRect, { x: x + 1.0, y: sy + 0.05, w: PW - 1.0, h: 0.58, rectRadius: 0.2, fill: { color: it.ring }, line: { width: 0 } }, `C${k - 1} B label box`);
      caption(s, it.label, x + 1.0, sy + 0.07, PW - 1.0, `C${k - 1} L label`);
    }
  });
  s.addNotes(note);
}
// letters in circles joined into one word: units [{ c: shown first, full: with its mark, ring? }]
function joinSlide(s, th, units, word, note) {
  const n = units.length, CY = 2.8;
  const G = n === 2 ? { d: 1.9, gap: 0.7, zone: 1.0, pw: 3.0, ph: 2.2, fs: 110, rs: 120, plus: 0.45, aw: 0.7, right: 9.25 }
                    : { d: 1.45, gap: 0.5, zone: 0.85, pw: 2.65, ph: 2.0, fs: 90, rs: 100, plus: 0.36, aw: 0.6, right: 9.4 };
  const cx = []; let right = G.right;
  for (let i = 0; i < n; i++) { cx.push(right - G.d); right -= G.d + G.gap; }
  const lpt = Math.min(...units.map(u => centred(u.full, G.fs, inCircle(G.d, 8)).pt));
  const rf = centred(word, G.rs, inRect(G.pw, G.ph, 0.22));
  units.forEach((u, i) => shape(s, T.ellipse, { x: cx[i], y: CY - G.d / 2, w: G.d, h: G.d, fill: { color: "FFFFFF" },
    line: { color: u.ring || RING[i], width: u.ring ? 10 : 8 } }, `Circle ${i + 1}`));
  const leftSrc = cx[n - 1], panelX = leftSrc - G.zone - G.pw;
  shape(s, T.roundRect, { x: panelX, y: CY - G.ph / 2, w: G.pw, h: G.ph, rectRadius: 0.3, fill: { color: "FFFBE3" }, line: { color: "F2B134", width: 6 } }, "Result panel");
  let k = 1;
  units.forEach((u, i) => {
    const f = centred(u.full, lpt, inCircle(G.d, 8));
    const o = { x: cx[i], y: CY - G.d / 2 + f.dy, w: G.d, h: G.d, fontSize: f.pt };
    arText(s, u.c, Object.assign({ objectName: `C${k++} L${i + 1} letter` }, o));
    arText(s, u.full, Object.assign({ objectName: `C${k++} V${i + 1} mark` }, o));
    if (i < n - 1) shape(s, T.mathPlus, { x: cx[i] - G.gap / 2 - G.plus / 2, y: CY - G.plus / 2, w: G.plus, h: G.plus,
      fill: { color: hsl(th.hue + 180, 0.7, 0.5) }, line: { width: 0 } }, `C${k++} P${i + 1} plus`);
  });
  shape(s, T.leftArrow, { x: leftSrc - G.zone / 2 - G.aw / 2, y: CY - 0.28, w: G.aw, h: 0.56, fill: { color: hsl(th.hue + 220, 0.6, 0.45) }, line: { width: 0 } }, `C${k++} A arrow`);
  arText(s, word, { x: panelX, y: CY - G.ph / 2 + rf.dy, w: G.pw, h: G.ph, fontSize: rf.pt, objectName: `C${k++} R result` });
  s.addNotes(note);
}
// a Quranic word as written (right, green) and as it is read (left, gold); optional captions under them
function readSlide(s, th, written, read, note, labels) {
  const PW = 3.9, PH = 2.2, PY = labels ? 1.15 : 1.5;
  const pt = Math.min(centred(written, 120, inRect(PW, PH, 0.25)).pt, centred(read, 120, inRect(PW, PH, 0.25)).pt);
  const A = centred(written, pt, inRect(PW, PH, 0.25)), B = centred(read, pt, inRect(PW, PH, 0.25));
  shape(s, T.roundRect, { x: 5.6, y: PY, w: PW, h: PH, rectRadius: 0.3, fill: { color: "FFFFFF" }, line: { color: GREEN, width: 8 } }, "Panel written");
  shape(s, T.roundRect, { x: 0.5, y: PY, w: PW, h: PH, rectRadius: 0.3, fill: { color: "FFFBE3" }, line: { color: "F2B134", width: 8 } }, "Panel read");
  arText(s, written, { x: 5.6, y: PY + A.dy, w: PW, h: PH, fontSize: A.pt, objectName: "C1 W written" });
  shape(s, T.leftArrow, { x: 4.6, y: PY + PH / 2 - 0.3, w: 0.8, h: 0.6, fill: { color: hsl(th.hue + 220, 0.6, 0.45) }, line: { width: 0 } }, "C2 A arrow");
  arText(s, read, { x: 0.5, y: PY + B.dy, w: PW, h: PH, fontSize: B.pt, objectName: "C3 R read" });
  if (labels) {
    shape(s, T.roundRect, { x: 5.6, y: PY + PH + 0.15, w: PW, h: 0.6, rectRadius: 0.2, fill: { color: GREEN }, line: { width: 0 } }, "C1 B box written");
    caption(s, labels[0], 5.6, PY + PH + 0.17, PW, "C1 B label written");
    shape(s, T.roundRect, { x: 0.5, y: PY + PH + 0.15, w: PW, h: 0.6, rectRadius: 0.2, fill: { color: "D9480F" }, line: { width: 0 } }, "C3 B box read");
    caption(s, labels[1], 0.5, PY + PH + 0.17, PW, "C3 B label read");
  }
  s.addNotes(note);
}

// ---------- the lesson, in order ----------
const K = SUKUN;
const LESSON = [
  // 1. the shape
  { two: [{ t: "بۡ", ring: GREEN, label: "في المصحف", sign: null }, { t: "بْ", ring: GREY, label: "في الكتب", sign: null }],
    note: "هذه علامة السكون. في المصحف (مصحف المدينة) تُرسم رأس خاء صغيرة بلا نقطة «ۡ» فوق الحرف، وفي الكتب المدرسية تُرسم دائرة صغيرة «ْ». المعنى واحد: الحرف ساكن. نحن نتعلّم شكل المصحف." },
  { two: [{ t: "ـ" + K, ring: GREEN, label: "سكون", sign: null }, { t: "خ", ring: GREY, label: "رأس الخاء", sign: null }],
    note: "شكل السكون في المصحف مأخوذ من رأس حرف الخاء بلا نقطة (من أول كلمة «خفيف»). أشِر إلى رأس الخاء ثم إلى علامة السكون: نفس الشكل الصغير." },
  // 2. the meaning: a vowel moves, sukun stops
  { two: [{ t: "بَ", ring: GREEN, label: "حركة", sign: "go" }, { t: "بۡ", ring: RED, label: "سكون", sign: "stop" }],
    note: "الحركة (الفتحة والكسرة والضمة) صوت يجري بعد الحرف: «بَ» = ba. السكون يعني: لا حركة، نقف على الحرف ونغلق الصوت عليه: «بۡ» = b. مثّل بيدك: الحركة يد تتحرك، والسكون يد تقف." },
  // 3. sukun never starts a word: it leans on the letter before it
  { two: [{ t: "بۡ", ring: RED, label: null, sign: "no" }, { t: "أَبۡ", ring: GREEN, label: null, sign: "ok" }].reverse(),
    note: "لا نبدأ بحرف ساكن أبداً. الساكن يحتاج حرفاً متحركاً قبله يستند إليه: «أَبۡ» (ab) صحيح، و«بۡ» وحدها لا تُقرأ." },
  // 4. joining: voweled letter + sakin letter = one beat
  { join: [{ c: "أ", full: "أَ" }, { c: "ب", full: "بۡ", ring: RED }], word: "أَبۡ",
    note: "نجمع حرفاً متحركاً مع حرف ساكن فيصيران مقطعاً واحداً ننطقه دفعة واحدة: أَ + بۡ = أَبۡ (ab). لا نفصل بينهما." },
  { join: [{ c: "ا", full: "إِ" }, { c: "ب", full: "بۡ", ring: RED }], word: "إِبۡ", note: "مع الكسرة: إِ + بۡ = إِبۡ (ib)." },
  { join: [{ c: "أ", full: "أُ" }, { c: "ب", full: "بۡ", ring: RED }], word: "أُبۡ", note: "مع الضمة: أُ + بۡ = أُبۡ (ub)." },
  // 5. in the middle of a word
  { join: [{ c: "ب", full: "بَ" }, { c: "ح", full: "حۡ", ring: RED }, { c: "ر", full: "رٌ" }], word: "بَحۡرٌ",
    note: "السكون في وسط الكلمة: بَ + حۡ + رٌ = بَحۡرٌ (bah-run). المقطع الأول «بَحۡ» يُنطق دفعة واحدة، ثم «رٌ»." },
  { join: [{ c: "ش", full: "شَ" }, { c: "م", full: "مۡ", ring: RED }, { c: "س", full: "سٌ" }], word: "شَمۡسٌ", note: "شَ + مۡ + سٌ = شَمۡسٌ (sham-sun)." },
  { join: [{ c: "ق", full: "قَ" }, { c: "ل", full: "لۡ", ring: RED }, { c: "ب", full: "بٌ" }], word: "قَلۡبٌ", note: "قَ + لۡ + بٌ = قَلۡبٌ (qal-bun)." },
  // 6. in the Quran: the mark means "say it clearly"
  { read: ["أَنۡعَمۡتَ", "أَنۡ - عَمۡ - تَ"], labels: ["مكتوب", "نقرأ"],
    note: "في المصحف: علامة السكون فوق الحرف تعني أن ننطقه ساكناً واضحاً (إظهار). «أَنۡعَمۡتَ» من الفاتحة: النون ساكنة واضحة، والميم ساكنة واضحة. نقرأ بالمقاطع: أَنۡ – عَمۡ – تَ." },
  { read: ["ٱلۡحَمۡدُ", "اَلۡ - حَمۡ - دُ"], labels: ["مكتوب", "نقرأ"],
    note: "«ٱلۡحَمۡدُ»: اللام ساكنة واضحة، والميم ساكنة واضحة. (عند البدء بها نقرأ الهمزة مفتوحة: اَلۡحَمۡدُ.)" },
  // 7. no mark at all on a letter that has no vowel
  { read: ["مِن رَّبِّهِمۡ", "مِرَّبِّهِمۡ"], labels: ["نون بلا علامة", "تدخل في الراء"],
    note: "في المصحف قد تجد حرفاً بلا حركة وبلا سكون. إذا كان الحرف الذي بعده مشدداً، فالأول يدخل في الثاني (إدغام كامل): «مِن رَّبِّهِمۡ» نقرأ «مِرَّبِّهِمۡ» ولا ننطق النون." },
  { read: ["مِن تَحۡتِهَا", "مِ(ن) تَحۡتِهَا"], labels: ["نون بلا علامة", "نون خفيفة بغنّة"],
    note: "إذا كان الحرف بلا علامة والحرف الذي بعده غير مشدد، فهو إخفاء: لا نُظهر النون كاملة ولا نحذفها، بل ننطقها خفيفة من الأنف (غنّة) ثم ننتقل إلى التاء." },
  // 8. madd letters carry no sukun
  { read: ["قَالَ", "قَا - لَ"], labels: ["الألف بلا سكون", "حرف مد"],
    note: "حروف المد (ا و ي) لا يوضع عليها سكون في المصحف، مثل «قَالَ» و«يَقُولُ» و«قِيلَ». هي ساكنة في الأصل، لكننا نمدّها حركتين ولا نقف عليها." },
  // 9. small circle: never read
  { read: ["قَالُوا۟", "قَالُو"], labels: ["دائرة صغيرة", "لا تُقرأ"],
    note: "الدائرة الصغيرة (الصفر المستدير «۟») فوق حرف تعني أن الحرف زائد لا يُقرأ أبداً، لا في الوصل ولا في الوقف: «قَالُوا۟» نقرأ «قَالُو». انتبه: هذه الدائرة ليست سكوناً." },
  { read: ["أُو۟لَٰٓئِكَ", "أُلَااائِكَ"], labels: ["الواو لا تُقرأ", "نقرأ"],
    note: "«أُو۟لَٰٓئِكَ»: الواو عليها دائرة صغيرة فلا تُقرأ، والألف الخنجرية بعد اللام تُمدّ لأن بعدها همزة." },
  // 10. upright zero: read only when stopping
  { read: ["أَنَا۠", "أَنَ ... / أَنَا"], labels: ["صفر مستطيل", "وصلاً / وقفاً"],
    note: "الصفر المستطيل القائم «۠» فوق الألف: لا تُقرأ الألف إذا وصلنا الكلمة بما بعدها (أَنَ)، وتُقرأ إذا وقفنا عليها (أَنَا)." },
  // 11. stopping makes the last letter sakin
  { read: ["ٱلرَّحِيمِ", "ٱلرَّحِيمۡ"], labels: ["في الوصل", "عند الوقف"],
    note: "عند الوقف على آخر الكلمة نُسكّن الحرف الأخير ولو كان متحركاً: «ٱلرَّحِيمِ» نقف «ٱلرَّحِيمۡ». هذا سكون عارض للوقف، لا يُكتب في المصحف." },
  // 12. qalqalah: ق ط ب ج د bounce when sakin
  { read: ["قَدۡ أَفۡلَحَ", "قَدۡ - أَفۡ - لَحَ"], labels: ["دال ساكنة", "قلقلة: الدال تنبو"],
    note: "حروف القلقلة خمسة: ق ط ب ج د (قُطۡبُ جَدٍّ). إذا كانت ساكنة نُخرجها بارتداد خفيف (نبرة) دون أن نضيف حركة: «قَدۡ» نسمع الدال تنبو قليلاً." },
  { read: ["يَجۡعَلُونَ", "يَجۡ - عَ - لُو - نَ"], labels: ["جيم ساكنة", "قلقلة: الجيم تنبو"], note: "«يَجۡعَلُونَ»: الجيم ساكنة من حروف القلقلة، فنُخرجها بارتداد خفيف." },
];

(async () => {
  const strings = [];
  LESSON.forEach(sl => {
    if (sl.two) sl.two.forEach(it => { strings.push(it.t); if (it.label) strings.push(it.label); });
    if (sl.join) { sl.join.forEach(u => strings.push(u.c, u.full)); strings.push(sl.word); }
    if (sl.read) { strings.push(...sl.read); if (sl.labels) strings.push(...sl.labels); }
  });
  M = await measure(strings);
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "Sukun explained";
  used.clear();
  LESSON.forEach((sl, i) => {
    const s = pres.addSlide(), th = background(40, i);
    s.background = { color: th.bg };
    content = []; deco = [];
    scenery(s, th);
    if (sl.two) twoPanels(s, th, sl.two, sl.note);
    else if (sl.join) joinSlide(s, th, sl.join, sl.word, sl.note);
    else readSlide(s, th, sl.read[0], sl.read[1], sl.note, sl.labels);
    checkOverlap(`slide ${i + 1}`);
  });
  await pres.writeFile({ fileName: `${process.argv[2] || "."}/Sukun-Explained.raw.pptx` });
  console.log("Sukun-Explained", LESSON.length, "slides");
})().catch(e => { console.error(e); process.exit(1); });
