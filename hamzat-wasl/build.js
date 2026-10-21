// Hamzat al-Wasl (ٱ) for non-Arab learners, children and adults. All explanations are in English.
// Covers: the two kinds of hamza, how to spot ٱ, why it exists (no word starts with a sakin letter),
// starting (say it: a / i / u and how to choose), connecting (skip it), and the three "watch outs"
// (a long vowel before it turns short, sun / moon letters, a silent letter or tanween before it gets a vowel),
// then practice with Al-Fatiha. Same backgrounds and measured text as the other decks; sounds by ../fathah-plus/post.py.
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

// ---------- the lesson ----------
const START = "15AABF", CONNECT = "E8590C", WATCH = "C2255C", PRACTICE = "5F3DC4";
const LESSON = [
  { text: true, title: "Hamzat al-Wasl: the connecting hamza", arabic: "{ٱ}", lines: [
      "A special alif you will see many times in the Quran.",
      "Sometimes we SAY it, sometimes we SKIP it.",
      "Today we learn exactly when." ],
    note: "Show the sign. Tell the learners: this alif looks like a normal alif with a tiny letter on top. It is pronounced only in one situation, and silent in another. By the end they will know which." },
  { text: true, title: "Two kinds of hamza", arabic: "أ  إ  {ٱ}", lines: [
      "أ  or  إ  = Hamzat al-Qat' (the cutting hamza)",
      "It is ALWAYS pronounced: start or middle.",
      "ٱ  = Hamzat al-Wasl (the connecting hamza)",
      "It is pronounced ONLY when you start from it." ],
    note: "Hamzat al-Qat' is a real consonant, a short catch in the throat, like the break in English 'uh-oh'. It is always read. Hamzat al-Wasl is only a helper sound for starting, so it disappears inside connected speech." },
  { text: true, title: "How to spot it in the Mushaf", arabic: "{ٱ}", lines: [
      "Look at the top of the alif: a tiny ص (saad).",
      "It comes from the word Silah = connection.",
      "No fathah, kasrah or dammah is written on it.",
      "You decide the sound yourself (you will learn how)." ],
    note: "In the Madinah Mushaf the hamzat al-wasl has a small head of the letter saad on it. Because no vowel is printed, the reader must know which vowel to use when starting." },
  { text: true, title: "Why does it exist?", arabic: "{ٱ}لۡ", lines: [
      "We never START a word with a silent letter.",
      "Many Quran words begin with a silent letter.",
      "So a 'starter' sound is put in front: ٱ",
      "Starting? Say it.   Connecting? Skip it." ],
    note: "This is the key idea for non-Arabs. Arabic cannot begin with a consonant cluster. English can (str-eet), Arabic cannot. The hamzat al-wasl is a ramp to get onto the road; once you are already driving (reading the word before), you do not need the ramp." },
  // ----- starting -----
  { text: true, color: START, title: "Rule 1: STARTING from ٱ → say it", lines: [
      "Which sound: a, i or u?  Three cases:",
      "1.  Before  لۡ  (al-)  →  always  'a'",
      "2.  In a few special nouns  →  'i'",
      "3.  In verbs  →  look at the 3rd letter" ],
    note: "When you begin reading at a word that starts with hamzat al-wasl (start of a verse, or after you stopped to breathe), you must pronounce it. The vowel is not written, so use these three cases." },
  { ex: true, color: START, title: "Case 1: before al- → start with 'a'", mushaf: "{ٱ}لۡحَمۡدُ", read: "[اَ]لۡحَمۡدُ", say: "Al-ham-du",
    tip: "Every word that starts with al- : say 'a' at the start.",
    note: "The definite article al- (the). When we start with it, the hamzat al-wasl is read with a fathah: Al-hamdu." },
  { ex: true, color: START, title: "Case 1: before al- → start with 'a'", mushaf: "{ٱ}للَّهُ", read: "[اَ]للَّهُ", say: "Al-laa-hu",
    tip: "The Name of Allah is the same: start with 'a'.",
    note: "Starting with the Name of Allah: Allaahu. The hamza is read with fathah." },
  { ex: true, color: START, title: "Case 2: special nouns → start with 'i'", mushaf: "{ٱ}سۡمُهُۥٓ أَحۡمَدُ", read: "[اِ]سۡمُهُۥٓ أَحۡمَدُ", say: "Is-mu-hoo Ah-mad",
    tip: "Special nouns: ism, ibn, ibnah, imru', imra'ah, ithnaan, ithnataan.",
    note: "A short list of nouns begins with hamzat al-wasl and always starts with kasrah: ٱسۡم ، ٱبۡن ، ٱبۡنَت ، ٱمۡرُؤ ، ٱمۡرَأَة ، ٱثۡنَان ، ٱثۡنَتَان. Example from Surat as-Saff 6." },
  { ex: true, color: START, title: "Case 2: special nouns → start with 'i'", mushaf: "{ٱ}بۡنُ مَرۡيَمَ", read: "[اِ]بۡنُ مَرۡيَمَ", say: "Ib-nu Mar-yam",
    tip: "Ibn = son. Starting: 'i'.", note: "Starting at ٱبۡنُ مَرۡيَمَ: Ibnu Maryam (son of Maryam)." },
  { ex: true, color: START, title: "Case 2: special nouns → start with 'i'", mushaf: "{ٱ}مۡرَأَتُ فِرۡعَوۡنَ", read: "[اِ]مۡرَأَتُ فِرۡعَوۡنَ", say: "Im-ra-'a-tu Fir-'awn",
    tip: "Imra'ah = woman / wife. Starting: 'i'.", note: "Surat at-Tahrim 11: Imra'atu Fir'awn (the wife of Pharaoh)." },
  { count: true, color: START, title: "Case 3: verbs → count to the 3rd letter", letters: ["ٱ", "دۡ", "عُ"], read: "[اُ]دۡعُ", say: "Ud-'u",
    tip: "3rd letter has a dammah (u)  →  start with 'u'.",
    note: "Count from the hamza itself: 1 = ٱ, 2 = دۡ, 3 = عُ. The third letter has a dammah, so we start with dammah: Ud'u (call / invite), Surat an-Nahl 125." },
  { count: true, color: START, title: "Case 3: verbs → count to the 3rd letter", letters: ["ٱ", "هۡ", "دِ"], read: "[اِ]هۡدِنَا", say: "Ih-di-naa",
    tip: "3rd letter has a kasrah (i)  →  start with 'i'.",
    note: "1 = ٱ, 2 = هۡ, 3 = دِ. Kasrah on the third letter, so start with kasrah: Ihdinaa (guide us), Al-Fatiha." },
  { count: true, color: START, title: "Case 3: verbs → count to the 3rd letter", letters: ["ٱ", "ذۡ", "هَ"], read: "[اِ]ذۡهَبۡ", say: "Idh-hab",
    tip: "3rd letter has a fathah (a)  →  still start with 'i'.",
    note: "1 = ٱ, 2 = ذۡ, 3 = هَ. Fathah on the third letter: we start with KASRAH, not fathah. Only a dammah gives 'u'; fathah and kasrah both give 'i'. Idh-hab (go)." },
  { ex: true, color: START, title: "Verbs: more practice", mushaf: "{ٱ}نظُرۡ", read: "[اُ]نظُرۡ", say: "Un-dhur",
    tip: "1st alif, 2nd noon, 3rd dhaa has a dammah (u)  →  start with 'u'.", note: "The noon here has no mark because of ikhfa, but it is still the second letter. The third letter ظ has a dammah: Undhur (look)." },
  { ex: true, color: START, title: "Verbs: more practice", mushaf: "{ٱ}عۡبُدُوا۟ ٱللَّهَ", read: "[اُ]عۡبُدُوا۟ ٱللَّهَ", say: "U'-bu-dul-laah",
    tip: "1st alif, 2nd 'ayn, 3rd baa has a dammah (u)  →  start with 'u'.", note: "U'budullaah (worship Allah). The third letter بُ has dammah. Notice the second hamzat al-wasl in ٱللَّهَ is skipped, because we are connecting." },
  { ex: true, color: START, title: "Verbs: more practice", mushaf: "{ٱ}سۡتَعِينُوا۟ بِٱللَّهِ", read: "[اِ]سۡتَعِينُوا۟ بِٱللَّهِ", say: "Is-ta-'ee-noo bil-laah",
    tip: "1st alif, 2nd seen, 3rd taa has a fathah (a)  →  start with 'i'.", note: "Surat al-A'raf 128. Third letter تَ has fathah, so start with kasrah: Ista'eenoo. Inside بِٱللَّهِ the hamza is skipped: billaah." },
  { ex: true, color: START, title: "Careful: these verbs start with 'i'", mushaf: "{ٱ}مۡشُوا۟", read: "[اِ]مۡشُوا۟", say: "Im-shoo",
    tip: "Imshoo, iqdoo, ibnoo, i'too: the dammah is only borrowed  →  start with 'i'.",
    note: "A few verbs look like they have dammah on the third letter, but the dammah is not original (it came because of the waw of the plural). We start them with kasrah: ٱمۡشُوا۟ (Surat Saad 6), ٱقۡضُوٓا۟ (Yunus 71), ٱبۡنُوا۟ (al-Kahf 21), ٱئۡتُوا۟. For beginners: just remember this small list." },
  // ----- connecting -----
  { text: true, color: CONNECT, title: "Rule 2: CONNECTING → skip it", arabic: "بِسۡمِ (ٱ)للَّهِ", lines: [
      "When the word is joined to the word before it,",
      "do NOT say the hamza at all.",
      "Jump from the last sound of the word before",
      "straight to the letter after ٱ." ],
    note: "This is what happens most of the time in recitation. The previous word ends with a vowel, so there is no need for a starter sound. The light grey alif on the slide is written but not read." },
  { ex: true, color: CONNECT, title: "Connecting: skip it", mushaf: "بِسۡمِ {ٱ}للَّهِ", read: "بِسۡمِ (ٱ)للَّهِ", say: "Bis-mil-laah",
    tip: "Not 'Bismi Allaah'.  The kasrah of meem runs straight into the L.", note: "The meem's kasrah connects directly to the lam: bis-mil-laah. Saying 'bismi allaah' with a hamza is a mistake." },
  { ex: true, color: CONNECT, title: "Connecting: skip it", mushaf: "رَبِّ {ٱ}لۡعَٰلَمِينَ", read: "رَبِّ (ٱ)لۡعَٰلَمِينَ", say: "Rab-bil-'aa-la-meen",
    tip: "The kasrah of baa joins the L:  rab-bil-...", note: "Rabbil-'aalameen. Not 'rabbi al-'aalameen'." },
  { ex: true, color: CONNECT, title: "Inside a word too", mushaf: "وَ{ٱ}تَّقُوا۟", read: "وَ(ٱ)تَّقُوا۟", say: "Wat-ta-qoo",
    tip: "wa + ittaqoo  =  wattaqoo.  Small words like wa, fa, bi join the same way.",
    note: "When و, ف, ب or ل is attached to a word with hamzat al-wasl, we are connecting, so the hamza is skipped: wattaqoo, fattaqoo, billaah." },
  // ----- watch outs -----
  { ex: true, color: WATCH, title: "Watch out 1: a long vowel before ٱ becomes short", mushaf: "فِي {ٱ}لۡأَرۡضِ", read: "فِ(ي) (ٱ)لۡأَرۡضِ", say: "Fil-ard",
    tip: "Not 'Fee-l-ard'.  The madd letter is written but not stretched.",
    note: "When a word ends with a madd letter (ا و ي) and the next word starts with hamzat al-wasl, the madd letter is not pronounced, because two silent sounds cannot meet. Fil-ard, not fee al-ard." },
  { ex: true, color: WATCH, title: "Watch out 1: a long vowel before ٱ becomes short", mushaf: "إِذَا {ٱ}لسَّمَآءُ", read: "إِذَ(ا) (ٱ)لسَّمَآءُ", say: "I-dhas-sa-maa'",
    tip: "Not 'Idhaa as-samaa''.  The alif of idhaa is not stretched.", note: "Surat al-Inshiqaq 1: Idhas-samaa'u nshaqqat." },
  { ex: true, color: WATCH, title: "Watch out 1: a long vowel before ٱ becomes short", mushaf: "وَ{ٱ}تَّقُوا۟ {ٱ}للَّهَ", read: "وَ(ٱ)تَّقُ(وا۟) (ٱ)للَّهَ", say: "Wat-ta-qul-laah",
    tip: "Two hamzas are skipped, and the waw (oo) is not stretched.",
    note: "A very common phrase: Wattaqullaah. The waw of ٱتَّقُوا۟ is not stretched before ٱللَّهَ." },
  { ex: true, color: WATCH, title: "Watch out 2: moon letters (say the L)", mushaf: "{ٱ}لۡقَمَرُ", read: "[اَ]لۡقَمَرُ", say: "Al-qa-mar",
    tip: "The lam has a sukun  →  pronounce the L clearly.",
    note: "With moon letters the lam of al- carries the Quranic sukun, so it is pronounced: al-qamar, al-hamd, al-'aalameen." },
  { ex: true, color: WATCH, title: "Watch out 2: sun letters (the L is silent)", mushaf: "{ٱ}لشَّمۡسُ", read: "[اَ](ل)شَّمۡسُ", say: "Ash-shams",
    tip: "No mark on the lam + a shaddah on the next letter  →  skip the L.",
    note: "With sun letters the lam has no mark and the next letter has a shaddah: the lam merges into it. Starting: ash-shams. Connected: wash-shamsi." },
  { ex: true, color: WATCH, title: "Watch out 3: a silent letter before ٱ gets a vowel", mushaf: "قُلِ {ٱ}دۡعُوا۟", read: "قُلِ (ٱ)دۡعُوا۟", say: "Qu-lid-'oo",
    tip: "Qul became quli: the Mushaf prints the new kasrah for you.",
    note: "Two silent letters cannot meet, so the silent letter before hamzat al-wasl gets a vowel (usually kasrah). The Mushaf already prints it, so just read what you see: Qulid'oo (al-Isra 56)." },
  { ex: true, color: WATCH, title: "Watch out 3: a silent letter before ٱ gets a vowel", mushaf: "مِنَ {ٱ}للَّهِ", read: "مِنَ (ٱ)للَّهِ", say: "Mi-nal-laah",
    tip: "Min became mina (with a fathah) before al-.", note: "Min becomes mina before the Name of Allah and before al-: minallaah." },
  { ex: true, color: WATCH, title: "Watch out 3: a silent letter before ٱ gets a vowel", mushaf: "عَلَيۡهِمُ {ٱ}لۡقِتَالُ", read: "عَلَيۡهِمُ (ٱ)لۡقِتَالُ", say: "'A-lay-hi-mul-qi-taal",
    tip: "The meem gets a dammah:  ...himul-qitaal.", note: "Al-Baqarah 246: kutiba 'alayhimul-qitaal." },
  { ex: true, color: WATCH, title: "Watch out 3: tanween before ٱ", mushaf: "خَيۡرًا {ٱ}لۡوَصِيَّةُ", read: "خَيۡرً(ا) (ٱ)لۡوَصِيَّةُ", say: "Khay-ra-nil-wa-siy-yah",
    tip: "Tanween = vowel + hidden noon. The noon gets a kasrah:  ...ra-nil-...",
    note: "Al-Baqarah 180. Remember: tanween is a vowel plus a noon with sukun. Before hamzat al-wasl that noon gets a kasrah so it can connect: khayranil-wasiyyah." },
  // ----- practice: Al-Fatiha -----
  { ex: true, color: PRACTICE, title: "Practice: Al-Fatiha", mushaf: "{ٱ}لۡحَمۡدُ لِلَّهِ رَبِّ {ٱ}لۡعَٰلَمِينَ", read: "[اَ]لۡحَمۡدُ لِلَّهِ رَبِّ (ٱ)لۡعَٰلَمِينَ", say: "Al-ham-du lil-laa-hi rab-bil-'aa-la-meen",
    tip: "First hamza: we START → say 'a'.   Second hamza: we CONNECT → skip it.", note: "Point at each hamzat al-wasl and ask: are we starting or connecting?" },
  { ex: true, color: PRACTICE, title: "Practice: Al-Fatiha", mushaf: "{ٱ}لرَّحۡمَٰنِ {ٱ}لرَّحِيمِ", read: "[اَ](ل)رَّحۡمَٰنِ (ٱل)رَّحِيمِ", say: "Ar-rah-maa-nir-ra-heem",
    tip: "Start: 'a'.  Connect: skip.  Raa is a sun letter, so the L is silent both times.", note: "Combines everything: starting vowel, skipping in the middle, and sun letters." },
  { ex: true, color: PRACTICE, title: "Practice: Al-Fatiha", mushaf: "مَٰلِكِ يَوۡمِ {ٱ}لدِّينِ", read: "مَٰلِكِ يَوۡمِ (ٱل)دِّينِ", say: "Maa-li-ki yaw-mid-deen",
    tip: "Connect: the kasrah of meem runs into the daal (a sun letter).", note: "Yawmid-deen." },
  { ex: true, color: PRACTICE, title: "Practice: Al-Fatiha", mushaf: "{ٱ}هۡدِنَا {ٱ}لصِّرَٰطَ {ٱ}لۡمُسۡتَقِيمَ", read: "[اِ]هۡدِنَ(ا) (ٱل)صِّرَٰطَ (ٱ)لۡمُسۡتَقِيمَ", say: "Ih-di-nas-si-raa-tal-mus-ta-qeem",
    tip: "Start 'i' (verb, 3rd letter has kasrah).  Then skip twice.  The alif of naa is short.", note: "Ihdinas-siraatal-mustaqeem. Every rule of the lesson in one verse." },
  { text: true, title: "Summary", lines: [
      "START  →  say it  ('a' / 'i' / 'u')",
      "CONNECT  →  skip it, jump to the next letter",
      "Long vowel before ٱ  →  make it short",
      "Silent letter before ٱ  →  it gets a vowel" ],
    note: "Review with the learners using any page of the Mushaf: find every ٱ and decide: start or connect?" },
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
  });
  M = await measure(strings);
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "Hamzat al-Wasl";
  used.clear();
  LESSON.forEach((sl, i) => {
    const s = pres.addSlide(), th = background(50, i);
    s.background = { color: th.bg };
    content = []; deco = [];
    scenery(s, th);
    if (sl.text) textSlide(s, sl);
    else if (sl.count) countSlide(s, th, sl);
    else exampleSlide(s, th, sl);
    checkOverlap(`slide ${i + 1}`);
  });
  await pres.writeFile({ fileName: `${process.argv[2] || "."}/Hamzat-al-Wasl.raw.pptx` });
  console.log("Hamzat-al-Wasl", LESSON.length, "slides");
})().catch(e => { console.error(e); process.exit(1); });
