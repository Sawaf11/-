// The secondary madd (al-Madd al-Far'i) for non-Arab learners; explanations in English, reading of Hafs by
// ash-Shatibiyyah (Madinah Mushaf). Natural madd recap, the two causes (a hamza or a sukun), the madd sign ~, then each
// kind with its rule, counts and examples (as written → as read, madd letter green, its cause red): muttasil, munfasil and
// as-sila al-kubra, badal, lazim, 'arid lis-sukun, leen, 'iwad; the order of strength, a quiz and a summary.
// Sounds by ../fathah-plus/post.py.
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
const plain = t => t.replace(/[{}\[\]()]/g, "");
function runs(t) {
  const out = []; const re = /\{([^}]*)\}|\[([^\]]*)\]|\(([^)]*)\)|([^{[(]+)/g; let mm;
  while ((mm = re.exec(t))) {
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

// letters with their names under them and the number of counts on a badge
function namesSlide(s, th, sl) {
  title(s, sl.title, sl.color);
  const n = sl.items.length, d = n > 5 ? 0.95 : 1.2, gap = (9.2 - n * d) / (n + 1);
  const lpt = Math.min(...sl.items.map(([l]) => centred(l, 70, inCircle(d, 7)).pt));
  const npt = Math.min(...sl.items.map(([, nm]) => centred(nm, 40, inRect(d + gap * 0.8, 0.65, 0.03)).pt));
  sl.items.forEach(([l, nm, c], i) => {
    const x = 9.6 - (i + 1) * (d + gap), y = 1.85, k = i + 1;
    shape(s, T.ellipse, { x, y, w: d, h: d, fill: { color: "FFFFFF" }, line: { color: sl.color, width: 7 } }, `C${k} circle`);
    const f = centred(l, lpt, inCircle(d, 7));
    arText(s, l, { x, y: y + f.dy, w: d, h: d, fontSize: f.pt, fontFace: FONT, objectName: `C${k} letter` });
    const nw = d + gap * 0.8, nf = centred(nm, npt, inRect(nw, 0.65, 0.03));
    shape(s, T.roundRect, { x: x - gap * 0.4, y: y + d + 0.12, w: nw, h: 0.65, rectRadius: 0.15, fill: { color: "FFFBE3" }, line: { color: "F2B134", width: 3 } }, `C${k} name box`);
    arText(s, nm, { x: x - gap * 0.4, y: y + d + 0.12 + nf.dy, w: nw, h: 0.65, fontSize: nf.pt, fontFace: FONT, objectName: `C${k} name` });
    if (c) {
      shape(s, T.ellipse, { x: x + d - 0.3, y: y - 0.12, w: 0.42, h: 0.42, fill: { color: c === "2" ? "2F9E44" : c === "0" ? "868E96" : "D9480F" }, line: { color: "FFFFFF", width: 2 } }, `C${k} badge`);
      enFit(s, c, x + d - 0.3, y - 0.12, 0.42, 0.42, 18, { bold: true, color: "FFFFFF", objectName: `C${k} count` });
    }
  });
  panel(s, 0.4, 3.85, 9.2, 0.78, sl.color, `C${n + 1} tip box`);
  enFit(s, sl.tip, 0.55, 3.88, 8.9, 0.72, 22, { objectName: `C${n + 1} tip` });
  s.addNotes(sl.note);
}

// ---------- the lesson ----------
const BLUE2 = "1971C2", HAMZA = "C2255C", SUKUN_C = "5F3DC4", STOP = "0B7285", QUIZ = "E8590C", NAT = "2F9E44";
const LESSON = [
  { text: true, color: BLUE2, title: "The Secondary Madd (al-Madd al-Far'i)", arabic: "جَ[آ]{ءَ}", lines: [
      "Madd = stretching a long vowel.",
      "Natural madd: 2 counts.",
      "Secondary madd: LONGER, because of a cause.",
      "Green = the madd letter.   Red = the cause." ],
    note: "Every slide colours the madd letter green and the thing that makes it longer red. Count the beats on your fingers with the learners." },
  { names: true, color: NAT, title: "Remember: the natural madd = 2 counts", items: [["ـَا", "قَالَ", "2"], ["ـُو", "يَقُولُ", "2"], ["ـِي", "قِيلَ", "2"]],
    tip: "Alif after fathah, waw after dammah, yaa after kasrah: 2 counts",
    note: "The three madd letters: alif after a fathah, waw after a dammah, yaa after a kasrah. On their own they are stretched 2 counts (natural madd)." },
  { text: true, color: BLUE2, title: "What makes a madd longer?", lines: [
      "Two causes only:",
      "1.  a HAMZA  ( ء )  next to the madd letter",
      "2.  a SUKUN (a silent letter) after the madd letter",
      "No cause  →  natural madd, 2 counts." ],
    note: "Every secondary madd has one of these two causes. Ask: is there a hamza? Is there a silent letter (written sukun, shaddah, or the silence of stopping)?" },
  { text: true, color: BLUE2, title: "The madd sign  ~", arabic: "سَ[آ]", lines: [
      "In the Mushaf a small wave  ~  over a madd letter",
      "means: stretch MORE than 2 counts.",
      "You will see it in: Muttasil, Munfasil, Lazim.",
      "No wave on: Badal, 'Arid, Leen (you must know them)." ],
    note: "The madd sign is a helper. Muttasil, munfasil, lazim and as-sila al-kubra carry it. The madd caused by stopping ('arid, leen) and the badal have no sign." },
  // ----- because of a hamza -----
  { text: true, color: HAMZA, title: "1. Madd Muttasil (connected) — obligatory", arabic: "جَ[آ]{ءَ}", lines: [
      "Madd letter + hamza in the SAME word.",
      "Stretch 4 or 5 counts.",
      "Stopping on the hamza at the end: up to 6.",
      "The Mushaf shows  ~ ." ],
    note: "It is called connected because the madd and the hamza are in one word. It is obligatory (wajib) to stretch it more than 2: 4 or 5 counts in the reading of Hafs by ash-Shatibiyyah, and 6 is allowed when you stop on a hamza at the end of the word (as-samaa')." },
  { ex: true, color: HAMZA, title: "Muttasil: madd + hamza in one word", mushaf: "جَآءَ", read: "جَ[آ]{ءَ}", say: "Jaaaa-'a", tip: "Alif, then hamza in the same word  →  4 or 5 counts", note: "jaa'a (he came)." },
  { ex: true, color: HAMZA, title: "Muttasil: madd + hamza in one word", mushaf: "ٱلسَّمَآءِ", read: "ٱلسَّمَ[آ]{ءِ}", say: "As-sa-maaaa-'i", tip: "4 or 5 counts  (6 if you stop on the hamza)", note: "as-samaa' (the sky). Stopping on it: as-samaa' with 4, 5 or 6 counts." },
  { ex: true, color: HAMZA, title: "Muttasil: madd + hamza in one word", mushaf: "سِيٓءَ بِهِمۡ", read: "سِ[يٓ]{ءَ} بِهِمۡ", say: "Seeee-'a bi-him", tip: "Yaa, then hamza in the same word  →  4 or 5 counts", note: "Surat Hud 77: see'a bihim. The madd letter here is a yaa." },
  { ex: true, color: HAMZA, title: "Muttasil: madd + hamza in one word", mushaf: "أُو۟لَٰٓئِكَ", read: "أُلَٰٓئِكَ", say: "U-laaaa-'i-ka", tip: "The small alif counts too: small alif + hamza  →  4 or 5", note: "ulaa'ika. The dagger alif after the lam is a madd letter, followed by a hamza in the same word: muttasil." },
  { text: true, color: HAMZA, title: "2. Madd Munfasil (separated) — permissible", arabic: "إِنَّ[آ] {أَ}", lines: [
      "Madd letter at the END of a word,",
      "hamza at the START of the next word.",
      "Stretch 4 or 5 counts when you connect.",
      "Stop on the first word  →  only 2." ],
    note: "It is called separated because the madd and the hamza are in two words. In the reading of Hafs by ash-Shatibiyyah it is stretched 4 or 5 counts (the same length you choose for muttasil, or less). If you stop on the first word, the hamza is gone and it is a natural madd." },
  { ex: true, color: HAMZA, title: "Munfasil: madd | hamza in the next word", mushaf: "إِنَّآ أَعۡطَيۡنَٰكَ", read: "إِنَّ[آ] {أَ}عۡطَيۡنَٰكَ", say: "In-naaaa a'-tay-naa-k", tip: "Alif at the end, hamza at the start of the next word  →  4 or 5", note: "Surat al-Kawthar 1." },
  { ex: true, color: HAMZA, title: "Munfasil: madd | hamza in the next word", mushaf: "قُوٓا۟ أَنفُسَكُمۡ", read: "قُ[وٓ] {أَ}نفُسَكُمۡ", say: "Qoooo an-fu-sa-kum", tip: "Waw at the end, hamza next  →  4 or 5", note: "Surat at-Tahrim 6. The alif after the waw is not read (small circle)." },
  { ex: true, color: HAMZA, title: "Munfasil: madd | hamza in the next word", mushaf: "فِيٓ أَنفُسِكُمۡ", read: "فِ[يٓ] {أَ}نفُسِكُمۡ", say: "Feeee an-fu-si-kum", tip: "Yaa at the end, hamza next  →  4 or 5", note: "fee anfusikum." },
  { ex: true, color: HAMZA, title: "Like munfasil: the big silah", mushaf: "مَالَهُۥٓ أَخۡلَدَهُۥ", read: "مَالَهُ[ۥٓ] {أَ}خۡلَدَهُۥ", say: "Maa-la-hoooo akh-la-dah", tip: "Small waw / yaa of the pronoun + hamza next  →  4 or 5", note: "Surat al-Humazah 3. The small waw after the pronoun hu, followed by a hamza: madd as-silah al-kubra, read like munfasil." },
  { text: true, color: HAMZA, title: "3. Madd Badal (substitute)", arabic: "{ءَ}[ا]مَنُوا۟", lines: [
      "The HAMZA comes FIRST, then the madd letter.",
      "Only 2 counts (in the reading of Hafs).",
      "No sign in the Mushaf." ],
    note: "Hamza before the madd letter. Do not over-stretch it: 2 counts, like a natural madd." },
  { ex: true, color: HAMZA, title: "Badal: hamza, then madd", mushaf: "ءَامَنُوا۟", read: "{ءَ}[ا]مَنُوا۟", say: "Aa-ma-noo", tip: "Hamza then alif  →  2 counts", note: "aamanoo (they believed)." },
  { ex: true, color: HAMZA, title: "Badal: hamza, then madd", mushaf: "إِيمَٰنًا", read: "{إِ}[ي]مَٰنًا", say: "Ee-maa-nan", tip: "Hamza then yaa  →  2 counts", note: "eemaanan (faith)." },
  { ex: true, color: HAMZA, title: "Badal: hamza, then madd", mushaf: "أُوتُوا۟", read: "{أُ}[و]تُوا۟", say: "Oo-too", tip: "Hamza then waw  →  2 counts", note: "ootoo (they were given)." },
  // ----- because of a sukun -----
  { text: true, color: SUKUN_C, title: "4. Madd Lazim (necessary) — always 6", arabic: "ٱلضَّ[آ]{لِّ}ينَ", lines: [
      "Madd letter + a PERMANENT sukun or shaddah after it.",
      "Always 6 counts, connecting or stopping.",
      "The Mushaf shows  ~ ." ],
    note: "Necessary because the sukun is always there. Four kinds: in a word with a shaddah (ad-daalleen), in a word with a sukun (aal-aana), in a letter name with merging (laam-meem), in a letter name without merging (saad, qaaf, noon)." },
  { ex: true, color: SUKUN_C, title: "Lazim: madd + shaddah", mushaf: "وَلَا ٱلضَّآلِّينَ", read: "وَلَا ٱلضَّ[آ]{لِّ}ينَ", say: "Wa-lad-daaaaaal-leen", tip: "Alif, then a doubled lam  →  6 counts", note: "Al-Fatiha 7. Count six with the learners." },
  { ex: true, color: SUKUN_C, title: "Lazim: madd + shaddah", mushaf: "ٱلۡحَآقَّةُ", read: "ٱلۡحَ[آ]{قَّ}ةُ", say: "Al-haaaaaaq-qah", tip: "Alif, then a doubled qaaf  →  6 counts", note: "Surat al-Haqqah 1. Also at-taammah, as-saakhkhah, daabbah." },
  { ex: true, color: SUKUN_C, title: "Lazim: madd + sukun", mushaf: "ءَآلۡـَٰٔنَ", read: "ءَآلۡـَٰٔنَ", say: "Aaaaaaal-aa-na", tip: "Alif, then a silent lam  →  6 counts  (only Yunus 51 and 91)", note: "The only word of this kind in the reading of Hafs, twice in Surat Yunus (51, 91). The lam after the long alif is silent: 6 counts." },
  { ex: true, color: SUKUN_C, title: "Lazim in the letter names", mushaf: "الٓمٓ", read: "أَلِفۡ لَ[آ]{مۡ} مِّ[ي]{مۡ}", say: "A-lif Laaaaaam Meeeeeem", tip: "Laam and Meem: 6 counts each  (see the Disjointed Letters lesson)", note: "Letter names with a long vowel and a silent last letter are a necessary madd: 6 counts." },
  { text: true, color: STOP, title: "5. Madd 'Arid lis-Sukun (because of stopping)", arabic: "ٱلرَّحِ[ي]{مۡ}", lines: [
      "When you STOP, the last letter becomes silent.",
      "A madd letter just before it may be stretched:",
      "2, 4 or 6 counts (choose one and stay with it).",
      "No sign: the stopping sukun is not written." ],
    note: "'Arid means temporary: the sukun exists only because we stop. When we connect, there is no sukun and the madd is natural (2). Choose 2, 4 or 6 and keep the same length in the whole recitation." },
  { ex: true, color: STOP, title: "'Arid: stretch before the stop", mushaf: "ٱلرَّحِيمِ", read: "ٱلرَّحِ[ي]{مۡ}", say: "Ar-ra-heeeem  (stop)", tip: "Stopping: 2, 4 or 6.   Connecting: 2.", note: "Al-Fatiha 3: stopping on ar-raheem." },
  { ex: true, color: STOP, title: "'Arid: stretch before the stop", mushaf: "نَسۡتَعِينُ", read: "نَسۡتَعِ[ي]{نۡ}", say: "Nas-ta-'eeeen  (stop)", tip: "Stopping: 2, 4 or 6", note: "Al-Fatiha 5." },
  { ex: true, color: STOP, title: "'Arid: stretch before the stop", mushaf: "يَعۡلَمُونَ", read: "يَعۡلَمُ[و]{نۡ}", say: "Ya'-la-mooon  (stop)", tip: "Stopping: 2, 4 or 6", note: "Very common at the end of verses: -oon, -een, -aan." },
  { text: true, color: STOP, title: "6. Madd al-Leen (soft)", arabic: "قُرَ[يۡ]{شۡ}", lines: [
      "و or ي with a sukun after a FATHAH:  aw / ay.",
      "Stopping on the next letter: 2, 4 or 6 counts.",
      "Connecting: no madd at all." ],
    note: "The leen letters are waw and yaa with sukun after a fathah (khawf, bayt). They are soft, not real madd letters, so they are stretched only when we stop on the letter after them." },
  { ex: true, color: STOP, title: "Leen: aw / ay before the stop", mushaf: "قُرَيۡشٍ", read: "قُرَ[يۡ]{شۡ}", say: "Qu-raaysh  (stop)", tip: "Stopping: 2, 4 or 6.   Connecting: no madd.", note: "Surat Quraysh 1." },
  { ex: true, color: STOP, title: "Leen: aw / ay before the stop", mushaf: "خَوۡفٍ", read: "خَ[وۡ]{فۡ}", say: "Khaawf  (stop)", tip: "Stopping: 2, 4 or 6", note: "Surat Quraysh 4 (min khawf)." },
  { ex: true, color: STOP, title: "Leen: aw / ay before the stop", mushaf: "ٱلۡبَيۡتِ", read: "ٱلۡبَ[يۡ]{تۡ}", say: "Al-baayt  (stop)", tip: "Stopping: 2, 4 or 6", note: "Surat Quraysh 3 (rabba haadhal-bayt)." },
  { ex: true, color: STOP, title: "7. Madd al-'Iwad: stopping on fathatan", mushaf: "عَلِيمًا", read: "عَلِيمَ[ا]", say: "'A-lee-maa  (stop)", tip: "The tanween goes; say a long aa: 2 counts", note: "When stopping on fathatan, the tanween is replaced by a long alif of 2 counts. Not on taa marbutah: rahmatan → rahmah." },
  // ----- strength, quiz, summary -----
  { text: true, color: BLUE2, title: "Which madd is strongest?", lines: [
      "1.  Lazim  (6)",
      "2.  Muttasil  (4-5)",
      "3.  'Arid lis-Sukun  (2 / 4 / 6)",
      "4.  Munfasil  (4-5)",
      "5.  Badal  (2)" ],
    note: "When two causes meet on one madd letter, the stronger one wins. For example, a badal that is also before a stop becomes 'arid." },
  { ex: true, color: QUIZ, title: "Quiz: which madd?", mushaf: "يَٰٓأَيُّهَا", read: "يَٰٓ {أَ}يُّهَا", say: "Yaaaa ay-yu-haa", tip: "Munfasil: madd at the end, hamza at the start of the next word (4-5)", note: "Ask before revealing. The dagger alif on yaa is the madd letter; the hamza is in the next word (ayyuhaa)." },
  { ex: true, color: QUIZ, title: "Quiz: which madd?", mushaf: "ٱلطَّآمَّةُ", read: "ٱلطَّ[آ]{مَّ}ةُ", say: "At-taaaaaam-mah", tip: "Lazim: madd + shaddah (6)", note: "Surat an-Nazi'at 34." },
  { ex: true, color: QUIZ, title: "Quiz: which madd?", mushaf: "أُوتِيَ", read: "{أُ}[و]تِيَ", say: "Oo-ti-ya", tip: "Badal: hamza then madd (2)", note: "ootiya (he was given)." },
  { ex: true, color: QUIZ, title: "Quiz: which madd? (stopping)", mushaf: "ٱلۡمُفۡلِحُونَ", read: "ٱلۡمُفۡلِحُ[و]{نۡ}", say: "Al-muf-li-hooon  (stop)", tip: "'Arid lis-Sukun (2, 4 or 6)", note: "End of a verse, stopping." },
  { text: true, color: BLUE2, title: "Summary", lines: [
      "Hamza after, same word  →  Muttasil 4-5  ~",
      "Hamza after, next word  →  Munfasil 4-5  ~",
      "Hamza before  →  Badal 2",
      "Permanent sukun / shaddah  →  Lazim 6  ~",
      "Stopping  →  'Arid 2/4/6,  Leen 2/4/6,  'Iwad 2" ],
    note: "Review: find the madd letter, then look for a hamza (before or after?) or a sukun (permanent or only when stopping?)." },
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
    if (sl.items) sl.items.forEach(([l, nm, c]) => strings.push(l, nm, c || "0"));
  });
  M = await measure(strings);
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "The Secondary Madd";
  used.clear();
  LESSON.forEach((sl, i) => {
    const s = pres.addSlide(), th = background(90, i);
    s.background = { color: th.bg };
    content = []; deco = [];
    scenery(s, th);
    if (sl.text) textSlide(s, sl);
    else if (sl.names) namesSlide(s, th, sl);
    else if (sl.count) countSlide(s, th, sl);
    else exampleSlide(s, th, sl);
    checkOverlap(`slide ${i + 1}`);
  });
  await pres.writeFile({ fileName: `${process.argv[2] || "."}/Secondary-Madd.raw.pptx` });
  console.log("Secondary-Madd", LESSON.length, "slides");
})().catch(e => { console.error(e); process.exit(1); });
