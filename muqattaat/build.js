// The disjointed letters (al-Huruf al-Muqatta'at) for non-Arab learners; explanations in English.
// They are read by their NAMES: 2-count letters (حي طهر), 6-count letters (نقص عسلكم, ع 4 or 6), alif without madd;
// then all 14 openings of the 29 surahs (as written → as read, the counts, the surahs), the joins between the names
// (idgham, ikhfa, Hafs' izhar in يسٓ and نٓ, الٓمٓ ٱللَّهُ), a quiz and a summary. Sounds by ../fathah-plus/post.py.
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
const BLUE2 = "1971C2", TWO = "2F9E44", SIX = "D9480F", OPEN = "5F3DC4", JOIN = "C2255C", QUIZ = "0B7285";
const M_ = "ٓ";                                       // the madd sign on the 6-count letters
const LESSON = [
  { text: true, color: BLUE2, title: "The Disjointed Letters (al-Huruf al-Muqatta'at)", arabic: "الٓمٓ", lines: [
      "29 surahs begin with single letters, like الٓمٓ.",
      "We do NOT read them as one word.",
      "We read each letter by its NAME,",
      "like spelling in English: A - B - C." ],
    note: "These openings are among the most recited words of the Quran. Their meaning is known to Allah. Today we learn only how to read them correctly." },
  { ex: true, color: BLUE2, title: "Read the NAMES, not the sounds", mushaf: "الٓمٓ", read: "أَلِفۡ لَآمۡ مِّيمۡ", say: "A-lif  Laaam  Meeem",
    tip: "Not 'alam'.  Three names: alif, laam, meem.", note: "الٓمٓ is not read as the word 'alam'. It is three letter names: alif - laam - meem, like saying 'A, L, M' in English." },
  { names: true, color: BLUE2, title: "Only 14 letters are used", items: [["ا", "أَلِفۡ"], ["ل", "لَامۡ"], ["م", "مِيمۡ"], ["ص", "صَادۡ"], ["ر", "رَا"], ["ك", "كَافۡ"], ["ه", "هَا"]],
    tip: "Memory sentence in the notes", note: "The 14 letters are gathered in the sentence نَصٌّ حَكِيمٌ قَاطِعٌ لَهُۥ سِرٌّ (a wise, decisive text that has a secret). First 7 of them." },
  { names: true, color: BLUE2, title: "Only 14 letters are used", items: [["ي", "يَا"], ["ع", "عَيۡنۡ"], ["ط", "طَا"], ["س", "سِينۡ"], ["ح", "حَا"], ["ق", "قَافۡ"], ["ن", "نُونۡ"]],
    tip: "Half of the Arabic alphabet appears here", note: "The other 7 letters with their names." },
  // ----- how long -----
  { names: true, color: TWO, title: "Group 1: two-letter names → 2 counts", items: [["ح", "حَا", "2"], ["ي", "يَا", "2"], ["ط", "طَا", "2"], ["ه", "هَا", "2"], ["ر", "رَا", "2"]],
    tip: "Haa, Yaa, Taa, Haa, Raa: a normal long vowel, 2 counts",
    note: "Five letters have short names ending in a long aa: حَا يَا طَا هَا رَا. Stretch them 2 counts only (natural madd). Memory phrase: حَيٌّ طَهُرَ." },
  { names: true, color: SIX, title: "Group 2: three-letter names → 6 counts", items: [["ن", "نُونۡ", "6"], ["ق", "قَافۡ", "6"], ["ص", "صَادۡ", "6"], ["ع", "عَيۡنۡ", "6"], ["س", "سِينۡ", "6"], ["ل", "لَامۡ", "6"], ["ك", "كَافۡ", "6"], ["م", "مِيمۡ", "6"]],
    tip: "Long vowel + silent letter → 6 counts   ('Ayn: 4 or 6)",
    note: "Eight letters have names of three letters with a long vowel in the middle and a silent last letter (noon, qaaf, saad, 'ayn, seen, laam, kaaf, meem). The long vowel is stretched 6 counts (al-madd al-lazim). For 'ayn the vowel is a soft ay: 4 or 6 counts are allowed, 6 is preferred. Memory phrase: نَقَصَ عَسَلُكُمۡ. In the Mushaf these letters carry the madd sign ~ on top." },
  { names: true, color: "868E96", title: "Group 3: alif → no stretch", items: [["ا", "أَلِفۡ", "0"]],
    tip: "A-lif: short a, short i.  No madd at all.",
    note: "Alif is the only letter with no long vowel in its name (a-lif), so it is not stretched." },
  { text: true, color: SIX, title: "The Mushaf helps you", arabic: "لٓ مٓ صٓ", lines: [
      "A wavy line ~ on a letter = stretch it 6 counts.",
      "No wavy line = 2 counts (or none for alif).",
      "Count on your fingers: 1 - 2 - 3 - 4 - 5 - 6." ],
    note: "In the Madinah Mushaf the madd sign (a small wave) is printed on the 6-count letters: لٓ مٓ صٓ نٓ قٓ سٓ كٓ عٓ. Letters like ر ه ط ح ي have no sign: 2 counts." },
  // ----- the openings -----
  { ex: true, color: OPEN, title: "Alif-Laam-Meem  (6 surahs)", mushaf: "الٓمٓ", read: "أَلِفۡ لَآمۡ مِّيمۡ", say: "A-lif  Laaa-am  Meeee-m",
    tip: "Alif  ·  Laam 6  ·  Meem 6",
    note: "Surahs: al-Baqarah, Al 'Imran, al-'Ankabut, ar-Rum, Luqman, as-Sajdah. The meem at the end of 'laam' merges into the meem of 'meem' (idgham with ghunnah): laaam-meeem. In Al 'Imran, when connected to ٱللَّهُ, the last meem takes a fathah: alif laaam meeemal-laah (2 or 6 counts)." },
  { ex: true, color: OPEN, title: "Alif-Laam-Meem-Saad  (al-A'raf)", mushaf: "الٓمٓصٓ", read: "أَلِفۡ لَآمۡ مِّيمۡ صَآدۡ", say: "A-lif Laaam Meeem Saaad",
    tip: "Alif · Laam 6 · Meem 6 · Saad 6", note: "Surat al-A'raf. Four names." },
  { ex: true, color: OPEN, title: "Alif-Laam-Raa  (5 surahs)", mushaf: "الٓر", read: "أَلِفۡ لَآمۡ رَا", say: "A-lif  Laaam  Raa",
    tip: "Alif  ·  Laam 6  ·  Raa 2", note: "Surahs: Yunus, Hud, Yusuf, Ibrahim, al-Hijr. Raa has a short name: only 2 counts. Laam: 6 counts." },
  { ex: true, color: OPEN, title: "Alif-Laam-Meem-Raa  (ar-Ra'd)", mushaf: "الٓمٓر", read: "أَلِفۡ لَآمۡ مِّيمۡ رَا", say: "A-lif Laaam Meeem Raa",
    tip: "Alif · Laam 6 · Meem 6 · Raa 2", note: "Surat ar-Ra'd. The meem of laam merges into meem, as in الٓمٓ." },
  { ex: true, color: OPEN, title: "Kaaf-Haa-Yaa-'Ayn-Saad  (Maryam)", mushaf: "كٓهيعٓصٓ", read: "كَافۡ هَا يَا عَيۡنۡ صَآدۡ", say: "Kaaaf Haa Yaa 'Aaayn Saaad",
    tip: "Kaaf 6 · Haa 2 · Yaa 2 · 'Ayn 4/6 · Saad 6",
    note: "Surat Maryam. Five names. The noon at the end of 'ayn is followed by saad, so it is hidden with a nasal sound (ikhfa)." },
  { ex: true, color: OPEN, title: "Taa-Haa  (Ta-Ha)", mushaf: "طه", read: "طَا هَا", say: "Taa  Haa",
    tip: "Two short names: 2 counts each.", note: "Surat Ta-Ha: taa haa." },
  { ex: true, color: OPEN, title: "Taa-Seen-Meem  (ash-Shu'ara, al-Qasas)", mushaf: "طسٓمٓ", read: "طَا سِينۡ مِّيمۡ", say: "Taa  Seeem-Meeem",
    tip: "Taa 2  ·  Seen 6  ·  Meem 6   (the n of seen merges into meem)",
    note: "The noon at the end of 'seen' merges into the meem (idgham with ghunnah): taa seeem-meeem." },
  { ex: true, color: OPEN, title: "Taa-Seen  (an-Naml)", mushaf: "طسٓ", read: "طَا سِينۡ", say: "Taa  Seeen",
    tip: "Taa 2 · Seen 6", note: "Surat an-Naml." },
  { ex: true, color: OPEN, title: "Yaa-Seen  (Ya-Sin)", mushaf: "يسٓ", read: "يَا سِينۡ", say: "Yaa  Seeen",
    tip: "Yaa 2  ·  Seen 6   (Hafs: the n is said clearly before wal-Qur'aan)",
    note: "Surat Ya-Sin. In the reading of Hafs the noon of 'seen' is pronounced clearly before wal-qur'aan (no merging)." },
  { ex: true, color: OPEN, title: "Saad  (Sad)", mushaf: "صٓ", read: "صَآدۡ", say: "Saaad",
    tip: "Saad 6", note: "Surat Sad." },
  { ex: true, color: OPEN, title: "Haa-Meem  (7 surahs)", mushaf: "حمٓ", read: "حَا مِيمۡ", say: "Haa  Meeem",
    tip: "Haa 2  ·  Meem 6",
    note: "The seven Ha-Meem surahs: Ghafir, Fussilat, ash-Shura, az-Zukhruf, ad-Dukhan, al-Jathiyah, al-Ahqaf. Haa: 2 counts, Meem: 6 counts." },
  { ex: true, color: OPEN, title: "'Ayn-Seen-Qaaf  (ash-Shura, verse 2)", mushaf: "عٓسٓقٓ", read: "عَيۡنۡ سِينۡ قَافۡ", say: "'Aaayn  Seeen  Qaaaf",
    tip: "'Ayn 4/6  ·  Seen 6  ·  Qaaf 6",
    note: "Surat ash-Shura: verse 1 is حمٓ, verse 2 is عٓسٓقٓ. The noon of 'ayn is followed by seen and the noon of seen by qaaf: both hidden (ikhfa)." },
  { ex: true, color: OPEN, title: "Qaaf  (Qaf)", mushaf: "قٓ", read: "قَافۡ", say: "Qaaaf",
    tip: "Qaaf 6", note: "Surat Qaf." },
  { ex: true, color: OPEN, title: "Noon  (al-Qalam)", mushaf: "نٓ", read: "نُونۡ", say: "Nooon",
    tip: "Noon 6   (Hafs: the n is said clearly before wal-qalam)", note: "Surat al-Qalam. In Hafs the last noon is pronounced clearly before wal-qalam." },
  // ----- quiz and summary -----
  { ex: true, color: QUIZ, title: "Quiz: how do we read it?", mushaf: "حمٓ", read: "حَا مِيمۡ", say: "Haa (2)  Meeem (6)",
    tip: "Ask first, then click.", note: "Ask the learners to say it before you reveal the answer." },
  { ex: true, color: QUIZ, title: "Quiz: how do we read it?", mushaf: "الٓر", read: "أَلِفۡ لَآمۡ رَا", say: "Alif  Laaam (6)  Raa (2)", tip: "Ask first, then click.", note: "Watch for Raa: only 2 counts." },
  { ex: true, color: QUIZ, title: "Quiz: how do we read it?", mushaf: "كٓهيعٓصٓ", read: "كَافۡ هَا يَا عَيۡنۡ صَآدۡ", say: "Kaaaf Haa Yaa 'Aaayn Saaad", tip: "Ask first, then click.", note: "The longest opening: five names." },
  { text: true, color: BLUE2, title: "Summary", lines: [
      "Read each letter by its NAME.",
      "Haa, Yaa, Taa, Haa, Raa  →  2 counts",
      "Noon, Qaaf, Saad, 'Ayn, Seen, Laam, Kaaf, Meem  →  6",
      "Alif  →  no stretch.   ~ on a letter = 6 counts" ],
    note: "Review the 14 openings with the learners and count the beats together on your fingers." },
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
  pres.title = "The Disjointed Letters";
  used.clear();
  LESSON.forEach((sl, i) => {
    const s = pres.addSlide(), th = background(80, i);
    s.background = { color: th.bg };
    content = []; deco = [];
    scenery(s, th);
    if (sl.text) textSlide(s, sl);
    else if (sl.names) namesSlide(s, th, sl);
    else if (sl.count) countSlide(s, th, sl);
    else exampleSlide(s, th, sl);
    checkOverlap(`slide ${i + 1}`);
  });
  await pres.writeFile({ fileName: `${process.argv[2] || "."}/Disjointed-Letters.raw.pptx` });
  console.log("Disjointed-Letters", LESSON.length, "slides");
})().catch(e => { console.error(e); process.exit(1); });
