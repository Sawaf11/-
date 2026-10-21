// Letters that are written but not read (الحروف التي تُكتب ولا تُقرأ), one lesson, no pictures, Quranic sukun ۡ.
// The mushaf signs: the small round zero ۟ (never read), the upright oblong zero ۠ (read only when stopping),
// letters with no sign that drop when connecting (hamzat al-wasl, the sun lam, a madd letter before a sakin letter,
// the alif after fathatan), and a letter read as another (the waw of ٱلصَّلَوٰةَ). Each example: as written (the silent
// letter in red) → as read, with the sounds in Latin letters. Measured text; sounds by ../fathah-plus/post.py.
// usage: node build.js <outdir>
const pptxgen = require("pptxgenjs");
const measure = require("../fathah-plus/measure");
const T = new pptxgen().ShapeType;
const FONT = "Traditional Arabic";
const INK = "16213E", GREEN = "2F9E44", RED = "E03131", GREY = "ADB5BD", ORANGE = "D9480F";
const W = 10, H = 5.625;
const BAND_TOP = 0.95, BAND_BOTTOM = 4.7;
const Z = "۟", R = "۠";                  // small round zero (never read); upright oblong zero (read when stopping)

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

// "{x}" = the letter that is not read, red; "[x]" = what we say instead, green
const plain = t => t.replace(/[{}\[\]]/g, "");
function runs(t) {
  const out = []; const re = /\{([^}]*)\}|\[([^\]]*)\]|([^{[]+)/g; let mm;
  while ((mm = re.exec(t))) {
    if (mm[1] !== undefined) out.push({ text: mm[1], options: { color: RED } });
    else if (mm[2] !== undefined) out.push({ text: mm[2], options: { color: GREEN } });
    else out.push({ text: mm[3], options: {} });
  }
  return out;
}
function arRuns(s, t, x, y, w, h, maxPt, name) {
  const f = centred(plain(t), maxPt, inRect(w, h, 0.16));
  s.addText(runs(t), { x, y: y + f.dy, w, h, fontSize: f.pt, fontFace: FONT, color: INK, align: "center", valign: "middle",
    margin: 0, isTextBox: true, rtlMode: true, lang: "ar-SA", fit: "none", wrap: false, objectName: name });
}
function panel(s, x, y, w, h, line, name, fill) {
  shape(s, T.roundRect, { x, y, w, h, rectRadius: 0.25, fill: { color: fill || "FFFFFF" }, line: { color: line, width: 7 } }, name);
}
function strip(s, text, x, y, w, h, color, name) {
  shape(s, T.roundRect, { x, y, w, h, rectRadius: 0.2, fill: { color }, line: { width: 0 } }, name + " box");
  const f = centred(text, 30, inRect(w, h, 0.06));
  arText(s, text, { x, y: y + f.dy, w, h, fontSize: f.pt, color: "FFFFFF", objectName: name });
}
function title(s, text, color) { strip(s, text, 0.4, 0.98, 9.2, 0.58, color, "Title"); }
function latin(s, text, x, y, w, h, name) {
  const f = centred(text, 28, inRect(w, h, 0.05));
  s.addText(text, { x, y: y + f.dy, w, h, fontSize: f.pt, fontFace: "Arial", bold: true, color: ORANGE, align: "center", valign: "middle", margin: 0, objectName: name });
}

// three signs side by side (intro)
function signsSlide(s, sl) {
  title(s, sl.title, sl.color);
  const PW = 2.85, PH = 1.75, PY = 1.75, xs = [6.75, 3.575, 0.4];
  sl.items.forEach(([t, label, col], i) => {
    panel(s, xs[i], PY, PW, PH, col, `Panel ${i + 1}`);
    arRuns(s, t, xs[i], PY, PW, PH, 120, `C${i + 1} sign`);
    strip(s, label, xs[i], PY + PH + 0.15, PW, 0.75, col, `C${i + 1} label`);
  });
  s.addNotes(sl.note);
}
// as written → as read (one reading)
function readSlide(s, th, sl) {
  title(s, sl.title, sl.color);
  const PW = 4.25, PH = 2.05, PY = 1.7;
  panel(s, 5.35, PY, PW, PH, sl.color, "Panel written");
  arRuns(s, sl.w, 5.35, PY, PW, PH, 110, "C1 written");
  shape(s, T.leftArrow, { x: 4.72, y: PY + PH / 2 - 0.25, w: 0.56, h: 0.5, fill: { color: hsl(th.hue + 220, 0.6, 0.45) }, line: { width: 0 } }, "C2 arrow");
  panel(s, 0.4, PY, PW, PH, "F2B134", "Panel read", "FFFBE3");
  arRuns(s, sl.r, 0.4, PY, PW, PH * 0.66, 100, "C2 read");
  latin(s, sl.say, 0.55, PY + PH * 0.66, PW - 0.3, PH * 0.34 - 0.06, "C2 sounds");
  strip(s, sl.tip, 0.4, PY + PH + 0.15, 9.2, 0.75, sl.color, "C3 tip");
  s.addNotes(sl.note);
}
// as written → read when connecting (top) and when stopping (bottom)
function twoReadSlide(s, th, sl) {
  title(s, sl.title, sl.color);
  const PW = 4.25, PY = 1.7, PH = 2.05, half = (PH - 0.1) / 2;
  panel(s, 5.35, PY, PW, PH, sl.color, "Panel written");
  arRuns(s, sl.w, 5.35, PY, PW, PH, 110, "C1 written");
  shape(s, T.leftArrow, { x: 4.72, y: PY + PH / 2 - 0.25, w: 0.56, h: 0.5, fill: { color: hsl(th.hue + 220, 0.6, 0.45) }, line: { width: 0 } }, "C2 arrow");
  [[sl.wasl, "وصلاً", sl.sayWasl, GREY], [sl.waqf, "وقفاً", sl.sayWaqf, GREEN]].forEach(([t, lab, say, col], i) => {
    const y = PY + i * (half + 0.1), k = i + 2;
    panel(s, 0.4, y, PW, half, i ? GREEN : "868E96", `C${k} row ${i + 1}`, "FFFBE3");
    strip(s, lab, 0.5, y + 0.12, 1.0, half - 0.24, col === GREY ? "868E96" : GREEN, `C${k} label ${i + 1}`);
    arRuns(s, t, 1.55, y, PW - 1.25, half, 90, `C${k} read ${i + 1}`);
  });
  strip(s, sl.tip, 0.4, PY + PH + 0.15, 9.2, 0.75, sl.color, "C4 tip");
  s.addNotes(`${sl.note} (وصلاً: ${sl.sayWasl} — وقفاً: ${sl.sayWaqf})`);
}

// ---------- the lesson ----------
const BLUE = "1971C2", ROUND = "C2255C", OBLONG = "5F3DC4", CONNECT = "E8590C", OTHER = "0B7285";
const LESSON = [
  { signs: true, color: BLUE, title: "حروف تُكتب ولا تُقرأ: كيف نعرفها؟", items: [
      ["ا{" + Z + "}", "لا تُقرأ أبداً", ROUND], ["ا{" + R + "}", "تُقرأ عند الوقف", OBLONG], ["{ٱ}", "تسقط في الوصل", CONNECT]],
    note: "في المصحف حروف تُكتب ولا تُقرأ. ثلاث علامات تدلنا: الدائرة الصغيرة «۟» فوق الحرف (لا يُقرأ أبداً)، والصفر المستطيل القائم «۠» (يُقرأ عند الوقف فقط)، وحروف بلا علامة تسقط عند الوصل (مثل همزة الوصل واللام الشمسية)." },
  // ----- small round zero: never read -----
  { read: true, color: ROUND, title: "الدائرة الصغيرة: لا تُقرأ أبداً", w: "قَالُو{ا" + Z + "}", r: "قَالُو", say: "qaa-loo",
    tip: "ألف واو الجماعة: نكتبها ولا نقرؤها", note: "بعد واو الجماعة تُكتب ألف عليها دائرة صغيرة. لا تُقرأ في الوصل ولا في الوقف: «قَالُوا۟» نقرأ «قَالُو»." },
  { read: true, color: ROUND, title: "الدائرة الصغيرة: لا تُقرأ أبداً", w: "ءَامَنُو{ا" + Z + "}", r: "ءَامَنُو", say: "aa-ma-noo",
    tip: "ألف واو الجماعة: نكتبها ولا نقرؤها", note: "«ءَامَنُوا۟»: الألف الأخيرة لا تُقرأ. نقف على الواو بمدٍّ طبيعي: آمَنُو." },
  { read: true, color: ROUND, title: "الدائرة الصغيرة: لا تُقرأ أبداً", w: "مِ{ا" + Z + "}ئَةَ", r: "مِئَةَ", say: "mi-'a-ta",
    tip: "ألف «مِائَة»: لا تُقرأ، ونقرأ «مِئَة»", note: "«مِا۟ئَةَ» (مئة): الألف بعد الميم لا تُقرأ. لا نقول «مَائة» ولا «مِيئة»، بل «مِئَة»." },
  { read: true, color: ROUND, title: "الدائرة الصغيرة: لا تُقرأ أبداً", w: "مِ{ا" + Z + "}ئَتَيۡنِ", r: "مِئَتَيۡنِ", say: "mi-'a-tay-ni",
    tip: "وكذلك «مِائَتَيۡن»", note: "«مِا۟ئَتَيۡنِ» (مئتين): الألف لا تُقرأ." },
  { read: true, color: ROUND, title: "الدائرة الصغيرة: لا تُقرأ أبداً", w: "أُ{و" + Z + "}لَٰٓئِكَ", r: "أُلَٰٓئِكَ", say: "u-laaa-'i-ka",
    tip: "الواو في «أُولَٰئِك» لا تُقرأ", note: "«أُو۟لَٰٓئِكَ»: الواو عليها دائرة صغيرة فلا تُقرأ: «أُلَٰٓئِك». والألف الخنجرية بعد اللام تُمد لأن بعدها همزة." },
  { read: true, color: ROUND, title: "الدائرة الصغيرة: لا تُقرأ أبداً", w: "أُ{و" + Z + "}لُو{ا" + Z + "} ٱلۡأَلۡبَٰبِ", r: "أُلُلۡ أَلۡبَابِ", say: "u-lul al-baab",
    tip: "حرفان لا يُقرآن: الواو الأولى والألف بعد الواو", note: "«أُو۟لُوا۟ ٱلۡأَلۡبَٰبِ»: الواو الأولى لا تُقرأ، والألف بعد الواو الثانية لا تُقرأ، والواو الثانية تسقط في الوصل لأن بعدها ساكناً: «أُلُلۡ أَلۡبَاب»." },
  { read: true, color: ROUND, title: "الدائرة الصغيرة: لا تُقرأ أبداً", w: "لِشَ{ا" + Z + "}يۡءٍ", r: "لِشَيۡءٍ", say: "li-shay-'in",
    tip: "ألف «لِشَا۟يۡءٍ» لا تُقرأ", note: "سورة الكهف 23: «وَلَا تَقُولَنَّ لِشَا۟يۡءٍ»: نقرأ «لِشَيۡءٍ»." },
  { read: true, color: ROUND, title: "الدائرة الصغيرة: لا تُقرأ أبداً", w: "إِنَّ ثَمُودَ{ا" + Z + "}", r: "إِنَّ ثَمُودَ", say: "in-na tha-moo-da",
    tip: "ألف «ثَمُودَا۟» لا تُقرأ", note: "سورة هود 68: «أَلَآ إِنَّ ثَمُودَا۟ كَفَرُوا۟ رَبَّهُمۡ»: نقرأ «ثَمُودَ» بلا ألف، وصلاً ووقفاً." },
  { read: true, color: ROUND, title: "الدائرة الصغيرة: لا تُقرأ أبداً", w: "بِأَيۡ{ي" + Z + "}دٍ", r: "بِأَيۡدٍ", say: "bi-ay-din",
    tip: "الياء الثانية في «بِأَيۡي۟دٍ» لا تُقرأ", note: "سورة الذاريات 47: «وَٱلسَّمَآءَ بَنَيۡنَٰهَا بِأَيۡي۟دٍ»: نقرأ «بِأَيۡدٍ»، الياء الثانية لا تُقرأ." },
  // ----- upright oblong zero: read only when stopping -----
  { two: true, color: OBLONG, title: "الصفر المستطيل: تُقرأ عند الوقف فقط", w: "أَنَ{ا" + R + "}", wasl: "أَنَ", sayWasl: "a-na", waqf: "أَنَ[ا]", sayWaqf: "a-naa",
    tip: "في الوصل لا نقرأ الألف، وعند الوقف نقرؤها", note: "«أَنَا۠»: إذا وصلناها بما بعدها نقرأ «أَنَ» بلا ألف (أَنَ نَذِيرٌ)، وإذا وقفنا عليها نقرأ «أَنَا» بالألف." },
  { two: true, color: OBLONG, title: "الصفر المستطيل: تُقرأ عند الوقف فقط", w: "لَّٰكِنَّ{ا" + R + "}", wasl: "لَٰكِنَّ", sayWasl: "laa-kin-na", waqf: "لَٰكِنَّ[ا]", sayWaqf: "laa-kin-naa",
    tip: "«لَّٰكِنَّا۠ هُوَ ٱللَّهُ رَبِّي»", note: "سورة الكهف 38: «لَّٰكِنَّا۠ هُوَ ٱللَّهُ رَبِّي»: في الوصل «لَٰكِنَّ هُوَ»، وعند الوقف «لَٰكِنَّا»." },
  { two: true, color: OBLONG, title: "الصفر المستطيل: تُقرأ عند الوقف فقط", w: "ٱلظُّنُونَ{ا" + R + "}", wasl: "ٱلظُّنُونَ", sayWasl: "adh-dhu-noo-na", waqf: "ٱلظُّنُونَ[ا]", sayWaqf: "adh-dhu-noo-naa",
    tip: "في آخر الآية نقف عليها بالألف", note: "سورة الأحزاب 10: «وَتَظُنُّونَ بِٱللَّهِ ٱلظُّنُونَا۠». في الوصل بلا ألف، وعند الوقف بالألف. ومثلها «ٱلرَّسُولَا۠» و«ٱلسَّبِيلَا۠» في الأحزاب." },
  { two: true, color: OBLONG, title: "الصفر المستطيل: تُقرأ عند الوقف فقط", w: "ٱلسَّبِيلَ{ا" + R + "}", wasl: "ٱلسَّبِيلَ", sayWasl: "as-sa-bee-la", waqf: "ٱلسَّبِيلَ[ا]", sayWaqf: "as-sa-bee-laa",
    tip: "ومثلها «ٱلرَّسُولَا۠»", note: "سورة الأحزاب 67: «فَأَضَلُّونَا ٱلسَّبِيلَا۠»." },
  // ----- no sign: dropped when connecting -----
  { read: true, color: CONNECT, title: "بلا علامة: تسقط في الوصل", w: "بِسۡمِ {ٱ}للَّهِ", r: "بِسۡمِ للَّهِ", say: "bis-mil-laah",
    tip: "همزة الوصل لا تُقرأ في وسط الكلام", note: "همزة الوصل تُكتب دائماً، لكنها لا تُقرأ إذا وصلنا الكلمة بما قبلها. (راجع ملف همزة الوصل.)" },
  { read: true, color: CONNECT, title: "بلا علامة: تسقط في الوصل", w: "ٱ{ل}شَّمۡسُ", r: "اَشَّمۡسُ", say: "ash-sham-su",
    tip: "اللام الشمسية تُكتب ولا تُقرأ", note: "اللام بلا علامة والحرف بعدها مشدد: لا تُقرأ. (راجع ملف اللام الشمسية والقمرية.)" },
  { read: true, color: CONNECT, title: "بلا علامة: تسقط في الوصل", w: "فِ{ي} ٱلۡأَرۡضِ", r: "فِلۡ أَرۡضِ", say: "fil-ar-di",
    tip: "حرف المد قبل حرف ساكن: يُكتب ولا يُمد", note: "إذا جاء بعد حرف المد حرف ساكن في الكلمة التالية، سقط حرف المد في النطق: «فِي ٱلۡأَرۡضِ» نقرأ «فِلۡأَرۡضِ»." },
  { read: true, color: CONNECT, title: "بلا علامة: تسقط في الوصل", w: "وَقَالُ{وا" + Z + "} ٱلۡحَمۡدُ", r: "وَقَالُلۡ حَمۡدُ", say: "wa-qaa-lul ham-du",
    tip: "الواو تسقط للساكن بعدها، والألف لا تُقرأ أبداً", note: "سورة فاطر 34: «وَقَالُوا۟ ٱلۡحَمۡدُ لِلَّهِ»: الألف لا تُقرأ أبداً (الدائرة)، والواو تسقط في الوصل لأن بعدها لاماً ساكنة." },
  { two: true, color: CONNECT, title: "ألف تنوين الفتح", w: "عَلِيمً{ا}", wasl: "عَلِيمَنۡ", sayWasl: "'a-lee-man", waqf: "عَلِيمَ[ا]", sayWaqf: "'a-lee-maa",
    tip: "في الوصل لا تُقرأ الألف، وعند الوقف نقرؤها ألف مد", note: "ألف تنوين الفتح لا تُقرأ في الوصل (نقرأ التنوين نوناً ساكنة)، وعند الوقف يذهب التنوين ونقرأ ألفاً مدية حركتين: «عَلِيمَا»." },
  // ----- written as one letter, read as another -----
  { read: true, color: OTHER, title: "يُكتب حرف ويُقرأ غيره", w: "ٱلصَّلَ{و}ٰةَ", r: "اَلصَّلَ[ا]ةَ", say: "as-sa-laa-ta",
    tip: "الواو لا تُقرأ: نقرأ الألف الصغيرة فوقها", note: "في «ٱلصَّلَوٰةَ» و«ٱلزَّكَوٰةَ» و«ٱلۡحَيَوٰةَ» تُكتب واو فوقها ألف خنجرية: العبرة بالألف الصغيرة، فلا ننطق الواو." },
];

(async () => {
  const strings = [];
  LESSON.forEach(sl => {
    strings.push(sl.title);
    if (sl.items) sl.items.forEach(([t, l]) => strings.push(plain(t), l));
    ["w", "r", "wasl", "waqf"].forEach(k => sl[k] && strings.push(plain(sl[k])));
    ["say", "sayWasl", "sayWaqf", "tip"].forEach(k => sl[k] && strings.push(sl[k]));
  });
  strings.push("وصلاً", "وقفاً");
  M = await measure(strings);
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "Written but not read";
  used.clear();
  LESSON.forEach((sl, i) => {
    const s = pres.addSlide(), th = background(70, i);
    s.background = { color: th.bg };
    content = []; deco = [];
    scenery(s, th);
    if (sl.signs) signsSlide(s, sl);
    else if (sl.two) twoReadSlide(s, th, sl);
    else readSlide(s, th, sl);
    checkOverlap(`slide ${i + 1}`);
  });
  await pres.writeFile({ fileName: `${process.argv[2] || "."}/Written-Not-Read.raw.pptx` });
  console.log("Written-Not-Read", LESSON.length, "slides");
})().catch(e => { console.error(e); process.exit(1); });
