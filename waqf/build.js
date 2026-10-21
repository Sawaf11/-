// Stopping in the Quran (al-Waqf) for non-Arab learners; explanations in English, reading of Hafs, Madinah Mushaf.
// Part 1: the stop signs (مـ لا ج صلى قلى ∴∴ the verse end, the saktah س), each with a Quranic example.
// Part 2: how to stop on the last word, rule by rule (vowel → sukun, tanween, fathatan → alif, taa marbutah → haa,
// alif maqsurah, the pronoun haa with silah, madd and leen before the last letter, qalqalah, shaddah, madd letter at the end,
// the upright zero, rawm and ishmam for teachers), starting again after a stop, a quiz and a summary.
// In the examples the stop sign is drawn as small red letters between the words. Sounds by ../fathah-plus/post.py.
// usage: node build.js <outdir>
const pptxgen = require("pptxgenjs");
const measure = require("../fathah-plus/measure");
const T = new pptxgen().ShapeType;
const FONT = "Traditional Arabic", EN = "Arial";       // Arabic in the Quranic font; English in Arial
const INK = "16213E", GREEN = "2F9E44", RED = "E03131", GREY = "ADB5BD", BLUE = "1971C2", ORANGE = "D9480F";
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

// "{ٱ}" in a string = the hamzat al-wasl, drawn red; "[اِ]" = the starting sound, green; "(ٱ)" = skipped, light grey
const plain = t => t.replace(/[{}\[\]()<>]/g, "");
function runs(t, pt) {
  const out = []; const re = /<([^>]*)>|\{([^}]*)\}|\[([^\]]*)\]|\(([^)]*)\)|([^{[(<]+)/g; let mm;
  while ((mm = re.exec(t))) {
    if (mm[1] !== undefined) { out.push({ text: " " + mm[1] + " ", options: { color: RED, bold: true, fontSize: pt ? Math.max(10, Math.round(pt * 0.55)) : undefined } }); continue; }
    mm = [mm[0], mm[2], mm[3], mm[4], mm[5]];
    if (mm[1] !== undefined) out.push({ text: mm[1], options: { color: RED } });
    else if (mm[2] !== undefined) out.push({ text: mm[2], options: { color: GREEN } });
    else if (mm[3] !== undefined) out.push({ text: mm[3], options: { color: GREY } });
    else out.push({ text: mm[4], options: {} });
  }
  return out;
}
function enText(s, text, o) {
  s.addText(text, Object.assign({ fontFace: EN, color: INK, align: "center", valign: "middle", margin: 0, isTextBox: true, fit: "none", wrap: false }, o));
}
// English text fitted in a box (one line)
function enFit(s, text, x, y, w, h, maxPt, o) {
  const f = centred(text, maxPt, inRect(w, h, 0.12));
  enText(s, text, Object.assign({ x, y: y + f.dy, w, h, fontSize: f.pt }, o));
}
function panel(s, x, y, w, h, line, name, fill) {
  shape(s, T.roundRect, { x, y, w, h, rectRadius: 0.25, fill: { color: fill || "FFFFFF" }, line: { color: line, width: 6 } }, name);
}
function title(s, text, color) {
  panel(s, 0.4, 0.98, 9.2, 0.55, color || BLUE, "Title box", color || BLUE);
  enFit(s, text, 0.4, 0.98, 9.2, 0.55, 26, { color: "FFFFFF", bold: true, objectName: "Title" });
}
// a slide of short English lines, revealed one by one, with an optional big Arabic sample on the right
function textSlide(s, sl) {
  title(s, sl.title, sl.color);
  const big = sl.arabic, LW = big ? 6.0 : 9.2, n = sl.lines.length, LH = Math.min(0.6, 2.9 / n);
  panel(s, 0.4, 1.68, LW, 2.95, sl.color || BLUE, "Lines panel");
  const lpt = Math.min(...sl.lines.map(ln => centred(ln, 22, inRect(LW - 0.3, LH, 0.12)).pt));   // one size for all lines
  sl.lines.forEach((ln, i) => enFit(s, ln, 0.55, 1.78 + i * (2.75 / n) + (2.75 / n - LH) / 2, LW - 0.3, LH, lpt, { objectName: `C${i + 1} line ${i + 1}` }));
  if (big) {
    panel(s, 6.6, 1.68, 3.0, 2.95, sl.color || BLUE, "Arabic panel");
    const f = centred(plain(big), 200, inRect(3.0, 2.95, 0.3));
    s.addText(runs(big), { x: 6.6, y: 1.68 + f.dy, w: 3.0, h: 2.95, fontSize: f.pt, fontFace: FONT, color: INK, align: "center", valign: "middle",
      margin: 0, isTextBox: true, rtlMode: true, lang: "ar-SA", fit: "none", wrap: false, objectName: "Arabic sample" });
  }
  s.addNotes(sl.note);
}
// the mushaf (right) → how we read it (left: Arabic + English sounds) → a tip line
function exampleSlide(s, th, sl) {
  title(s, sl.title, sl.color);
  const PY = 1.65, PH = 1.85, PW = 4.25;
  panel(s, 5.35, PY, PW, PH, GREEN, "Mushaf panel");
  panel(s, 0.4, PY, PW, PH, "F2B134", "Read panel", "FFFBE3");
  const A = centred(plain(sl.mushaf), 110, inRect(PW, PH * 0.8, 0.2));
  s.addText(runs(sl.mushaf), { x: 5.35, y: PY + PH * 0.1 + A.dy, w: PW, h: PH * 0.8, fontSize: A.pt, fontFace: FONT, color: INK, align: "center", valign: "middle",
    margin: 0, isTextBox: true, rtlMode: true, lang: "ar-SA", fit: "none", wrap: false, objectName: "C1 mushaf" });
  shape(s, T.leftArrow, { x: 4.72, y: PY + PH / 2 - 0.25, w: 0.56, h: 0.5, fill: { color: hsl(th.hue + 220, 0.6, 0.45) }, line: { width: 0 } }, "C2 arrow");
  const RA = 0.58;                                      // Arabic in the top part of the read panel, English sounds under it
  const B = centred(plain(sl.read), 100, inRect(PW, PH * RA, 0.18));
  s.addText(runs(sl.read), { x: 0.4, y: PY + B.dy, w: PW, h: PH * RA, fontSize: B.pt, fontFace: FONT, color: INK, align: "center", valign: "middle",
    margin: 0, isTextBox: true, rtlMode: true, lang: "ar-SA", fit: "none", wrap: false, objectName: "C2 read arabic" });
  enFit(s, sl.say, 0.5, PY + PH * RA, PW - 0.2, PH * (1 - RA) - 0.08, 30, { bold: true, color: ORANGE, objectName: "C2 read sounds" });
  panel(s, 0.4, 3.68, 9.2, 0.92, sl.color || BLUE, "C3 tip box");
  enFit(s, sl.tip, 0.55, 3.72, 8.9, 0.84, 22, { objectName: "C3 tip" });
  s.addNotes(sl.note);
}
// verbs: count the letters 1-2-3; the vowel on the 3rd letter decides the starting sound
function countSlide(s, th, sl) {
  title(s, sl.title, sl.color);
  const d = 1.25, CY = 2.45, xs = [8.2, 6.6, 5.0];      // circles right to left: letter 1, 2, 3
  const lpt = Math.min(...sl.letters.map(l => centred(l, 90, inCircle(d, 8)).pt));
  sl.letters.forEach((l, i) => {
    const third = i === 2;
    shape(s, T.ellipse, { x: xs[i], y: CY - d / 2, w: d, h: d, fill: { color: third ? "FFF3BF" : "FFFFFF" }, line: { color: third ? ORANGE : BLUE, width: third ? 10 : 7 } }, `C${i + 1} circle ${i + 1}`);
    const f = centred(l, lpt, inCircle(d, 8));
    arText(s, l, { x: xs[i], y: CY - d / 2 + f.dy, w: d, h: d, fontSize: f.pt, fontFace: FONT, objectName: `C${i + 1} letter ${i + 1}` });
    enFit(s, String(i + 1), xs[i] + d / 2 - 0.3, CY + d / 2 + 0.05, 0.6, 0.42, 24, { bold: true, color: third ? ORANGE : BLUE, objectName: `C${i + 1} number ${i + 1}` });
  });
  panel(s, 0.4, 1.7, 4.2, 1.6, "F2B134", "C4 result panel", "FFFBE3");
  const B = centred(plain(sl.read), 100, inRect(4.2, 1.6 * 0.62, 0.15));
  s.addText(runs(sl.read), { x: 0.4, y: 1.7 + B.dy, w: 4.2, h: 1.6 * 0.62, fontSize: B.pt, fontFace: FONT, color: INK, align: "center", valign: "middle",
    margin: 0, isTextBox: true, rtlMode: true, lang: "ar-SA", fit: "none", wrap: false, objectName: "C4 read arabic" });
  enFit(s, sl.say, 0.5, 1.7 + 1.6 * 0.62, 4.0, 1.6 * 0.38 - 0.06, 28, { bold: true, color: ORANGE, objectName: "C4 read sounds" });
  shape(s, T.leftArrow, { x: 4.7, y: CY - 0.22, w: 0.25, h: 0.44, fill: { color: hsl(th.hue + 220, 0.6, 0.45) }, line: { width: 0 } }, "C4 arrow");
  panel(s, 0.4, 3.68, 9.2, 0.92, sl.color || BLUE, "C5 tip box");
  enFit(s, sl.tip, 0.55, 3.72, 8.9, 0.84, 22, { objectName: "C5 tip" });
  s.addNotes(sl.note);
}

// the stop signs side by side, each with its English meaning
function signsSlide(s, th, sl) {
  title(s, sl.title, sl.color);
  const n = sl.items.length, d = 0.9, gap = (9.2 - n * d) / (n + 1);
  const lpt = Math.min(...sl.items.map(([g]) => centred(g, 44, inCircle(d, 6)).pt));
  sl.items.forEach(([g, label], i) => {
    const x = 9.6 - (i + 1) * (d + gap), y = 1.85, k = i + 1, lw = d + gap * 0.9;
    shape(s, T.ellipse, { x, y, w: d, h: d, fill: { color: "FFFFFF" }, line: { color: RED, width: 6 } }, `C${k} circle`);
    const f = centred(g, lpt, inCircle(d, 6));
    s.addText(g, { x, y: y + f.dy, w: d, h: d, fontSize: f.pt, fontFace: FONT, bold: true, color: RED, align: "center", valign: "middle", margin: 0, rtlMode: true, objectName: `C${k} sign` });
    shape(s, T.roundRect, { x: x - gap * 0.45, y: y + d + 0.12, w: lw, h: 1.1, rectRadius: 0.15, fill: { color: "FFFBE3" }, line: { color: "F2B134", width: 3 } }, `C${k} label box`);
    const lines = label.split("\n"), lh = 1.1 / lines.length;
    const pt = Math.min(...lines.map(ln => centred(ln, 20, inRect(lw - 0.06, lh, 0.02)).pt));
    lines.forEach((ln, j) => enFit(s, ln, x - gap * 0.45 + 0.03, y + d + 0.12 + j * lh, lw - 0.06, lh, pt, { bold: j === 0, objectName: `C${k} label ${j}` }));
  });
  panel(s, 0.4, 4.05, 9.2, 0.6, sl.color, `C${n + 1} tip box`);
  enFit(s, sl.tip, 0.55, 4.07, 8.9, 0.56, 20, { objectName: `C${n + 1} tip` });
  s.addNotes(sl.note);
}
// one sign: the verse with the sign (red), then what to do
function signExample(s, th, sl) {
  title(s, sl.title, sl.color);
  panel(s, 0.4, 1.68, 9.2, 1.55, GREEN, "Verse panel");
  const f = centred(plain(sl.verse), 70, inRect(9.2, 1.55, 0.25));
  s.addText(runs(sl.verse, f.pt), { x: 0.4, y: 1.68 + f.dy, w: 9.2, h: 1.55, fontSize: f.pt, fontFace: FONT, color: INK, align: "center", valign: "middle",
    margin: 0, isTextBox: true, rtlMode: true, lang: "ar-SA", fit: "none", wrap: false, objectName: "C1 verse" });
  sl.lines.forEach((ln, i) => {
    panel(s, 0.4, 3.35 + i * 0.66, 9.2, 0.58, sl.color, `C${i + 2} line box ${i + 1}`);
    enFit(s, ln, 0.55, 3.37 + i * 0.66, 8.9, 0.54, 20, { objectName: `C${i + 2} line ${i + 1}` });
  });
  s.addNotes(sl.note);
}

// ---------- the lesson ----------
const BLUE2 = "1971C2", SIGN = "C2255C", HOW = "5F3DC4", START = "0B7285", QUIZ = "E8590C";
const LESSON = [
  { text: true, color: BLUE2, title: "Stopping in the Quran (al-Waqf)", arabic: "قلى ج صلى", lines: [
      "We stop to breathe, or at the end of a meaning.",
      "TWO things to learn:",
      "1.  WHERE to stop: the signs in the Mushaf",
      "2.  HOW to stop: what happens to the last word" ],
    note: "Stopping is part of reciting correctly. A wrong stop can change the meaning; a wrong ending on the stopped word is a mistake in pronunciation. This lesson covers both, with the Madinah Mushaf (Hafs)." },
  // ----- part 1: signs -----
  { signs: true, color: SIGN, title: "Part 1: the stop signs", items: [["مـ", "Must\nstop"], ["لا", "Do not\nstop"], ["ج", "Stop\nor go"], ["صلى", "Better\ngo on"], ["قلى", "Better\nstop"], ["∴", "Stop at\none"], ["س", "Pause,\nno breath"]],
    tip: "The signs are small letters printed above the end of a word.", note: "These small signs are printed above the line, after the word they belong to. They tell you whether stopping there is required, forbidden, allowed, better or not." },
  { sx: true, color: SIGN, title: "Meem sign: you MUST stop (al-waqf al-lazim)", verse: "وَلَا يَحۡزُنكَ قَوۡلُهُمۡ <مـ> إِنَّ ٱلۡعِزَّةَ لِلَّهِ جَمِيعًا",
    lines: ["Stop after qawluhum.", "If you connect, it sounds like THEY said 'all honour belongs to Allah'."],
    note: "Surat Yunus 65. The meem sign means stopping is required, because connecting would give a wrong meaning: the sentence 'all honour belongs to Allah' is from Allah, not the saying of the disbelievers." },
  { sx: true, color: SIGN, title: "Laa sign: do NOT stop here", verse: "ٱلَّذِينَ تَتَوَفَّىٰهُمُ ٱلۡمَلَٰٓئِكَةُ طَيِّبِينَ <لا> يَقُولُونَ سَلَٰمٌ عَلَيۡكُمُ",
    lines: ["Do not stop on tayyibeen: the sentence is not finished.", "If you must stop for breath, go back and read it again joined."],
    note: "Surat an-Nahl 32. The laa sign means: do not stop here. If you run out of breath and stop, begin again from an earlier word so the meaning stays whole." },
  { sx: true, color: SIGN, title: "Jeem sign: stop or go on, both are fine", verse: "نَّحۡنُ نَقُصُّ عَلَيۡكَ نَبَأَهُم بِٱلۡحَقِّ <ج> إِنَّهُمۡ فِتۡيَةٌ ءَامَنُوا۟ بِرَبِّهِمۡ",
    lines: ["You may stop after bil-haqq, or continue.", "Both are equally good."], note: "Surat al-Kahf 13. Jeem = jaa'iz (permissible), equal either way." },
  { sx: true, color: SIGN, title: "Salaa sign: better to go on", verse: "فَلَا كَاشِفَ لَهُۥٓ إِلَّا هُوَ <صلى> وَإِن يَمۡسَسۡكَ بِخَيۡرٍ",
    lines: ["Stopping is allowed,", "but continuing is better."], note: "Surat al-An'am 17. Salaa (from al-waslu awlaa): connecting is preferred." },
  { sx: true, color: SIGN, title: "Qalaa sign: better to stop", verse: "مَّا يَعۡلَمُهُمۡ إِلَّا قَلِيلٌ <قلى> فَلَا تُمَارِ فِيهِمۡ",
    lines: ["Continuing is allowed,", "but stopping is better."], note: "Surat al-Kahf 22. Qalaa (from al-waqfu awlaa): stopping is preferred." },
  { sx: true, color: SIGN, title: "Three dots twice: stop at ONE of the two, not both", verse: "ذَٰلِكَ ٱلۡكِتَٰبُ لَا رَيۡبَ <∴> فِيهِ <∴> هُدًى لِّلۡمُتَّقِينَ",
    lines: ["Stop after laa rayba  OR  after feeh, never at both.", "Each stop gives a correct meaning; both together break it."],
    note: "Surat al-Baqarah 2. The two sets of three dots (mu'aanaqah, embracing): if you stop at the first, read through the second; if you pass the first, you may stop at the second." },
  { sx: true, color: SIGN, title: "The end of a verse", verse: "ٱلۡحَمۡدُ لِلَّهِ رَبِّ ٱلۡعَٰلَمِينَ <1> ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ <2>",
    lines: ["The circle with a number ends a verse.", "It is sunnah to stop at the end of each verse."],
    note: "Stopping at every verse end is the practice of the Prophet ﷺ, even when the meaning continues into the next verse." },
  { sx: true, color: SIGN, title: "Small seen: saktah, a short pause without breath", verse: "وَلَمۡ يَجۡعَل لَّهُۥ عِوَجَا <س> قَيِّمًا",
    lines: ["Stop the sound for a moment, do NOT take a breath, then continue.", "Hafs: 4 places (al-Kahf 1, Ya-Sin 52, al-Qiyamah 27, al-Mutaffifin 14)."],
    note: "The saktah is a very short silence without breathing. In the reading of Hafs it is required in four places: عِوَجَا ۜ قَيِّمًا (al-Kahf 1-2), مِن مَّرۡقَدِنَا ۜ هَٰذَا (Ya-Sin 52), مَنۡ ۜ رَاقٍ (al-Qiyamah 27), بَلۡ ۜ رَانَ (al-Mutaffifin 14)." },
  // ----- part 2: how to stop -----
  { text: true, color: HOW, title: "Part 2: HOW to stop on the last word", arabic: "بۡ", lines: [
      "The golden rule: we never stop on a vowel.",
      "The last letter becomes SILENT (sukun),",
      "with a few special cases.",
      "Let us go through every case." ],
    note: "Stopping means cutting the sound on the last letter. Because Arabic does not stop on a short vowel, the last letter becomes sakin. Some endings (tanween with fathah, taa marbutah, the pronoun haa) have their own rules." },
  { ex: true, color: HOW, title: "Case 1: a vowel at the end → sukun", mushaf: "قُلۡ أَعُوذُ بِرَبِّ ٱلنَّاسِ", read: "...ٱلنَّا[سۡ]", say: "...an-naas", tip: "Fathah, kasrah or dammah on the last letter: drop it, stop silent", note: "Surat an-Nas 1. an-naasi becomes an-naas when stopping. The alif before it is now a madd 'arid (2, 4 or 6)." },
  { ex: true, color: HOW, title: "Case 1: a vowel at the end → sukun", mushaf: "ٱلَّذِي خَلَقَ", read: "ٱلَّذِي خَلَ[قۡ]", say: "Al-ladhee kha-laq", tip: "khalaqa → khalaq  (qaaf is a qalqalah letter: it bounces)", note: "Surat al-'Alaq 1. Stopping on a qalqalah letter gives the strongest bounce." },
  { ex: true, color: HOW, title: "Case 2: tanween with dammah or kasrah → sukun", mushaf: "قُلۡ هُوَ ٱللَّهُ أَحَدٌ", read: "...أَحَ[دۡ]", say: "...a-had", tip: "-un / -in: drop the tanween and the vowel, stop silent", note: "Surat al-Ikhlas 1. ahadun → ahad, with a strong qalqalah on the daal." },
  { ex: true, color: HOW, title: "Case 2: tanween with dammah or kasrah → sukun", mushaf: "وَءَامَنَهُم مِّنۡ خَوۡفٍ", read: "...خَوۡ[فۡ]", say: "...khawf", tip: "khawfin → khawf  (the leen ay/aw before it may be stretched 2, 4 or 6)", note: "Surat Quraysh 4." },
  { ex: true, color: HOW, title: "Case 3: tanween with fathah → long aa", mushaf: "فِي دِينِ ٱللَّهِ أَفۡوَاجًا", read: "...أَفۡوَاجَ[ا]", say: "...af-waa-jaa", tip: "-an → -aa  (the written alif is now read, 2 counts)", note: "Surat an-Nasr 2. Fathatan becomes a long alif of 2 counts (madd al-'iwad)." },
  { ex: true, color: HOW, title: "Case 3: tanween with fathah → long aa", mushaf: "دُعَآءً وَنِدَآءً", read: "...نِدَآءَ[ا]", say: "...ni-daa-'aa", tip: "Also after a hamza:  -'an → -'aa", note: "Surat al-Baqarah 171. On a hamza with fathatan we also stop with a long alif." },
  { ex: true, color: HOW, title: "Case 4: round taa (taa marbutah) → a silent h", mushaf: "ٱلۡقَارِعَةُ", read: "ٱلۡقَارِعَ[هۡ]", say: "Al-qaa-ri-'ah", tip: "The round taa becomes a silent h:  -tu / -ti / -tun → -h", note: "Surat al-Qari'ah 1. The round taa (taa marbutah) is read as t when connecting, but becomes a silent h when stopping." },
  { ex: true, color: HOW, title: "Case 4: round taa (taa marbutah) → a silent h", mushaf: "مِن لَّدُنكَ رَحۡمَةً", read: "...رَحۡمَ[هۡ]", say: "...rah-mah", tip: "Even with fathatan: NO long aa on the round taa.  rahmatan → rahmah", note: "Surat al-Kahf 10. This is the exception to case 3: taa marbutah with fathatan does not become aa, it becomes a silent haa." },
  { ex: true, color: HOW, title: "Case 5: tanween on alif maqsurah → aa", mushaf: "هُدًى لِّلۡمُتَّقِينَ", read: "هُدَ[ى]", say: "Hu-daa  (stop)", tip: "hudan → hudaa: stop with a long aa (2 counts)", note: "Al-Baqarah 2: if you stop on hudan, say hudaa. Also duhan → duhaa." },
  { ex: true, color: HOW, title: "Case 6: the pronoun haa (hu / hi) → silent h", mushaf: "خَيۡرًا يَرَهُۥ", read: "خَيۡرًا يَرَ[هۡ]", say: "...ya-rah", tip: "The small waw / yaa is dropped:  yarahoo → yarah", note: "Surat az-Zalzalah 7. The silah (the small waw or yaa) is only for connecting. When stopping, the haa is silent and the silah is not read." },
  { ex: true, color: HOW, title: "Case 6: the pronoun haa (hu / hi) → silent h", mushaf: "لِمَنۡ خَشِيَ رَبَّهُۥ", read: "...رَبَّ[هۡ]", say: "...rab-bah", tip: "rabbahoo → rabbah", note: "Surat al-Bayyinah 8." },
  { ex: true, color: HOW, title: "Case 6: the pronoun haa (hu / hi) → silent h", mushaf: "وَٱسۡتَغۡفِرۡهُ", read: "وَٱسۡتَغۡفِرۡ[هۡ]", say: "Was-tagh-fir-h", tip: "No silah here (a silent letter before the haa); stopping: silent h", note: "Surat an-Nasr 3." },
  { ex: true, color: HOW, title: "Case 7: a madd letter before the last letter", mushaf: "ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ", read: "...ٱلرَّحِ[ي]مۡ", say: "...ar-ra-heeem", tip: "Madd 'arid: stretch 2, 4 or 6  (keep the same length every time)", note: "The madd before the stopped letter becomes madd 'arid lis-sukun. Choose 2, 4 or 6 and stay consistent." },
  { ex: true, color: HOW, title: "Case 7: leen (aw / ay) before the last letter", mushaf: "لِإِيلَٰفِ قُرَيۡشٍ", read: "...قُرَ[يۡ]شۡ", say: "...qu-raysh", tip: "ay / aw before the stop: 2, 4 or 6", note: "Surat Quraysh 1." },
  { ex: true, color: HOW, title: "Case 8: qalqalah is strongest at a stop", mushaf: "مِن شَرِّ مَا خَلَقَ", read: "...خَلَ[قۡ]", say: "...kha-laq!", tip: "Qaaf, Taa, Baa, Jeem, Daal at a stop: a clear bounce", note: "Surat al-Falaq 2. The qalqalah at a stop is called qalqalah kubra: the clearest bounce." },
  { ex: true, color: HOW, title: "Case 9: a shaddah at the end → keep it", mushaf: "تَبَّتۡ يَدَآ أَبِي لَهَبٍ وَتَبَّ", read: "...وَتَ[بّۡ]", say: "...wa-tabb", tip: "Hold the doubled letter, then stop  (and bounce the baa)", note: "Surat al-Masad 1. A doubled letter at the end stays doubled: press on it, then stop with qalqalah." },
  { ex: true, color: HOW, title: "Case 9: a shaddah at the end → keep it", mushaf: "وَلَكُمۡ فِي ٱلۡأَرۡضِ مُسۡتَقَرٌّ", read: "...مُسۡتَقَ[رّۡ]", say: "...mus-ta-qarr", tip: "-qarrun → -qarr: hold the doubled r", note: "Surat al-Baqarah 36." },
  { ex: true, color: HOW, title: "Case 10: a madd letter at the end → keep it", mushaf: "وَٱلضُّحَىٰ", read: "وَٱلضُّحَ[ى]", say: "Wad-du-haa", tip: "The word already ends with a long vowel: stop on it, 2 counts", note: "Surat ad-Duha 1. Also qaaloo, fee, anaa (the upright zero: read the alif when stopping)." },
  { ex: true, color: HOW, title: "Case 11: the upright oval zero → read the alif", mushaf: "أَنَا۠", read: "أَنَ[ا]", say: "A-naa  (stop)", tip: "Connecting: ana.   Stopping: anaa.", note: "See the lesson on letters written but not read." },
  { text: true, color: HOW, title: "For teachers: rawm and ishmam", lines: [
      "Rawm: say a third of the last vowel very softly (dammah, kasrah).",
      "Ishmam: close the lips like a dammah, without sound.",
      "Both are allowed for Hafs when stopping; full sukun is the default.",
      "Teach them after the learners stop well with sukun." ],
    note: "Rawm (a very faint part of the vowel) is used with dammah and kasrah; ishmam (rounding the lips silently) only with dammah. They are optional refinements; beginners should stop with a full sukun." },
  // ----- starting again -----
  { text: true, color: START, title: "Starting again after a stop (al-Ibtida')", lines: [
      "Start from a word where the meaning is complete.",
      "Do not start in the middle of a phrase that changes the meaning.",
      "Starting on a connecting hamza: say it (see that lesson).",
      "If you stopped at a bad place, go back a few words." ],
    note: "After a stop for breath, begin again from a sensible place. Starting on a word with hamzat al-wasl, pronounce it with the right vowel." },
  // ----- quiz and summary -----
  { ex: true, color: QUIZ, title: "Quiz: how do we stop here?", mushaf: "نَارٌ حَامِيَةٌ", read: "...حَامِيَ[هۡ]", say: "...haa-mi-yah", tip: "Taa marbutah → silent haa", note: "Surat al-Qari'ah 11. Ask before revealing." },
  { ex: true, color: QUIZ, title: "Quiz: how do we stop here?", mushaf: "عَلِيمًا حَكِيمًا", read: "...حَكِيمَ[ا]", say: "...ha-kee-maa", tip: "Fathatan → long aa", note: "A very common verse ending." },
  { ex: true, color: QUIZ, title: "Quiz: how do we stop here?", mushaf: "فَمَن يَعۡمَلۡ مِثۡقَالَ ذَرَّةٍ شَرًّا يَرَهُۥ", read: "...يَرَ[هۡ]", say: "...ya-rah", tip: "Pronoun haa → silent h, no silah", note: "Surat az-Zalzalah 8." },
  { ex: true, color: QUIZ, title: "Quiz: how do we stop here?", mushaf: "وَلَمۡ يَكُن لَّهُۥ كُفُوًا أَحَدٌ", read: "...أَحَ[دۡ]", say: "...a-had", tip: "Dammatan → sukun, with a strong qalqalah", note: "Surat al-Ikhlas 4." },
  { text: true, color: BLUE2, title: "Summary: how to stop", lines: [
      "Vowel or -un / -in  →  sukun",
      "-an  →  long aa   (round taa → silent h)",
      "Pronoun haa  →  silent h, no small waw / yaa",
      "Madd or leen before the end  →  2 / 4 / 6",
      "Shaddah  →  keep it;  qalqalah  →  bounce clearly" ],
    note: "Review with any page of Juz 'Amma: stop at each verse end and apply the rules." },
];

(async () => {
  const strings = [];
  LESSON.forEach(sl => {
    strings.push(sl.title);
    if (sl.lines) strings.push(...sl.lines);
    if (sl.arabic) strings.push(plain(sl.arabic));
    if (sl.mushaf) strings.push(plain(sl.mushaf));
    if (sl.read) strings.push(plain(sl.read));
    if (sl.say) strings.push(sl.say);
    if (sl.tip) strings.push(sl.tip);
    if (sl.letters) strings.push(...sl.letters, "1", "2", "3");
    if (sl.items) sl.items.forEach(([g, label]) => strings.push(g, ...label.split("\n")));
    if (sl.verse) strings.push(plain(sl.verse));
  });
  M = await measure(strings);
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "Stopping in the Quran";
  used.clear();
  LESSON.forEach((sl, i) => {
    const s = pres.addSlide(), th = background(100, i);
    s.background = { color: th.bg };
    content = []; deco = [];
    scenery(s, th);
    if (sl.text) textSlide(s, sl);
    else if (sl.signs) signsSlide(s, th, sl);
    else if (sl.sx) signExample(s, th, sl);
    else if (sl.count) countSlide(s, th, sl);
    else exampleSlide(s, th, sl);
    checkOverlap(`slide ${i + 1}`);
  });
  await pres.writeFile({ fileName: `${process.argv[2] || "."}/Stopping-Waqf.raw.pptx` });
  console.log("Stopping-Waqf", LESSON.length, "slides");
})().catch(e => { console.error(e); process.exit(1); });
