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
const isEnglish = t => /[A-Za-z]/.test(t);
function strip(s, text, x, y, w, h, color, name) {
  shape(s, T.roundRect, { x, y, w, h, rectRadius: 0.2, fill: { color }, line: { width: 0 } }, name + " box");
  const f = centred(text, 26, inRect(w, h, 0.08));
  if (isEnglish(text)) s.addText(text, { x, y: y + f.dy, w, h, fontSize: f.pt, fontFace: "Arial", bold: true, color: "FFFFFF",
    align: "center", valign: "middle", margin: 0, isTextBox: true, fit: "none", wrap: false, objectName: name });
  else arText(s, text, { x, y: y + f.dy, w, h, fontSize: f.pt, color: "FFFFFF", objectName: name });
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
  [[sl.wasl, "Connecting", sl.sayWasl, GREY], [sl.waqf, "Stopping", sl.sayWaqf, GREEN]].forEach(([t, lab, say, col], i) => {
    const y = PY + i * (half + 0.1), k = i + 2;
    panel(s, 0.4, y, PW, half, i ? GREEN : "868E96", `C${k} row ${i + 1}`, "FFFBE3");
    strip(s, lab, 0.5, y + 0.12, 1.45, half - 0.24, col === GREY ? "868E96" : GREEN, `C${k} label ${i + 1}`);
    arRuns(s, t, 2.0, y, PW - 1.7, half, 90, `C${k} read ${i + 1}`);
  });
  strip(s, sl.tip, 0.4, PY + PH + 0.15, 9.2, 0.75, sl.color, "C4 tip");
  s.addNotes(`${sl.note} (Connecting: ${sl.sayWasl}. Stopping: ${sl.sayWaqf}.)`);
}

// ---------- the lesson ----------
const BLUE = "1971C2", ROUND = "C2255C", OBLONG = "5F3DC4", CONNECT = "E8590C", OTHER = "0B7285";
const LESSON = [
  { signs: true, color: BLUE, title: "Letters that are written but not read: how to spot them", items: [
      ["ا{" + Z + "}", "Never read", ROUND], ["ا{" + R + "}", "Read when stopping", OBLONG], ["{ٱ}", "Dropped when connecting", CONNECT]],
    note: "In the Mushaf some letters are written but not pronounced. Three signs tell you: a small round circle on a letter (never read), an upright oval zero (read only when you stop on the word), and some letters with no sign at all that drop when you connect to the next word (hamzat al-wasl, the sun lam, a madd letter before a silent letter)." },
  // ----- small round zero: never read -----
  { read: true, color: ROUND, title: "Small circle: never read", w: "قَالُو{ا" + Z + "}", r: "قَالُو", say: "qaa-loo",
    tip: "The alif after the plural waw is written, not read", note: "After the plural waw (they) an alif is written with a small circle on it. It is never read, whether you connect or stop: qaaloo." },
  { read: true, color: ROUND, title: "Small circle: never read", w: "ءَامَنُو{ا" + Z + "}", r: "ءَامَنُو", say: "aa-ma-noo",
    tip: "Same here: stop on the waw, skip the alif", note: "aamanoo (they believed). The last alif is not read; the word ends on a long oo." },
  { read: true, color: ROUND, title: "Small circle: never read", w: "مِ{ا" + Z + "}ئَةَ", r: "مِئَةَ", say: "mi-'a-ta",
    tip: "The alif of mi'ah (hundred) is not read", note: "mi'ah (a hundred). Do not say maa'ah or mee'ah. The alif after the meem is not read." },
  { read: true, color: ROUND, title: "Small circle: never read", w: "مِ{ا" + Z + "}ئَتَيۡنِ", r: "مِئَتَيۡنِ", say: "mi-'a-tay-ni",
    tip: "Also mi'atayn (two hundred)", note: "mi'atayni (two hundred). The alif is not read." },
  { read: true, color: ROUND, title: "Small circle: never read", w: "أُ{و" + Z + "}لَٰٓئِكَ", r: "أُلَٰٓئِكَ", say: "u-laaa-'i-ka",
    tip: "The waw of ulaa'ika (those) is not read", note: "ulaa'ika (those). The waw carries a small circle, so it is not read. The small alif after the lam is stretched because a hamza follows it." },
  { read: true, color: ROUND, title: "Small circle: never read", w: "أُ{و" + Z + "}لُو{ا" + Z + "} ٱلۡأَلۡبَٰبِ", r: "أُلُلۡ أَلۡبَابِ", say: "u-lul al-baab",
    tip: "Two letters are not read: the first waw and the last alif", note: "ulul-albaab (people of understanding). The first waw is not read, the alif after the second waw is not read, and the second waw drops when connecting because a silent lam follows." },
  { read: true, color: ROUND, title: "Small circle: never read", w: "لِشَ{ا" + Z + "}يۡءٍ", r: "لِشَيۡءٍ", say: "li-shay-'in",
    tip: "The alif in li-shay'in is not read", note: "Surat al-Kahf 23: wa laa taqoolanna li-shay'in. Read li-shay'in, without the alif." },
  { read: true, color: ROUND, title: "Small circle: never read", w: "إِنَّ ثَمُودَ{ا" + Z + "}", r: "إِنَّ ثَمُودَ", say: "in-na tha-moo-da",
    tip: "The alif of Thamooda is not read", note: "Surat Hud 68: alaa inna Thamooda kafaroo rabbahum. Read Thamooda without an alif, connecting or stopping." },
  { read: true, color: ROUND, title: "Small circle: never read", w: "بِأَيۡ{ي" + Z + "}دٍ", r: "بِأَيۡدٍ", say: "bi-ay-din",
    tip: "The second yaa of bi-aydin is not read", note: "Surat adh-Dhariyat 47: was-samaa'a banaynaahaa bi-aydin. The second yaa is not read." },
  // ----- upright oblong zero: read only when stopping -----
  { two: true, color: OBLONG, title: "Upright oval: read only when you stop", w: "أَنَ{ا" + R + "}", wasl: "أَنَ", sayWasl: "a-na", waqf: "أَنَ[ا]", sayWaqf: "a-naa",
    tip: "Connecting: no alif.  Stopping: say the alif", note: "anaa (I). Joined to the next word, read ana with a short a (ana nadheer). Stopping on it, read anaa with the alif." },
  { two: true, color: OBLONG, title: "Upright oval: read only when you stop", w: "لَّٰكِنَّ{ا" + R + "}", wasl: "لَٰكِنَّ", sayWasl: "laa-kin-na", waqf: "لَٰكِنَّ[ا]", sayWaqf: "laa-kin-naa",
    tip: "From al-Kahf 38: laakinna huwa-llaahu rabbee", note: "Surat al-Kahf 38. Connecting: laakinna huwa. Stopping: laakinnaa." },
  { two: true, color: OBLONG, title: "Upright oval: read only when you stop", w: "ٱلظُّنُونَ{ا" + R + "}", wasl: "ٱلظُّنُونَ", sayWasl: "adh-dhu-noo-na", waqf: "ٱلظُّنُونَ[ا]", sayWaqf: "adh-dhu-noo-naa",
    tip: "At the end of the verse we stop with the alif", note: "Surat al-Ahzab 10. Connecting without the alif, stopping with it. The same in ar-rasoolaa and as-sabeelaa in al-Ahzab." },
  { two: true, color: OBLONG, title: "Upright oval: read only when you stop", w: "ٱلسَّبِيلَ{ا" + R + "}", wasl: "ٱلسَّبِيلَ", sayWasl: "as-sa-bee-la", waqf: "ٱلسَّبِيلَ[ا]", sayWaqf: "as-sa-bee-laa",
    tip: "Also ar-rasoolaa", note: "Surat al-Ahzab 67: fa-adalloonas-sabeelaa." },
  // ----- no sign: dropped when connecting -----
  { read: true, color: CONNECT, title: "No sign: dropped when connecting", w: "بِسۡمِ {ٱ}للَّهِ", r: "بِسۡمِ للَّهِ", say: "bis-mil-laah",
    tip: "Hamzat al-wasl is not read in the middle of speech", note: "The connecting hamza is always written, but not read when the word is joined to the word before it (see the Hamzat al-Wasl lesson)." },
  { read: true, color: CONNECT, title: "No sign: dropped when connecting", w: "ٱ{ل}شَّمۡسُ", r: "اَشَّمۡسُ", say: "ash-sham-su",
    tip: "The sun lam is written, not read", note: "The lam has no mark and the next letter has a shaddah, so the lam is not read (see the Sun and Moon Letters lesson)." },
  { read: true, color: CONNECT, title: "No sign: dropped when connecting", w: "فِ{ي} ٱلۡأَرۡضِ", r: "فِلۡ أَرۡضِ", say: "fil-ar-di",
    tip: "A madd letter before a silent letter is written, not stretched", note: "When a word ends with a madd letter and the next word begins with a silent letter, the madd letter is not pronounced: fil-ardi, not fee al-ardi." },
  { read: true, color: CONNECT, title: "No sign: dropped when connecting", w: "وَقَالُ{وا" + Z + "} ٱلۡحَمۡدُ", r: "وَقَالُلۡ حَمۡدُ", say: "wa-qaa-lul ham-du",
    tip: "The waw drops before the silent lam; the alif is never read", note: "Surat Fatir 34: wa qaalul-hamdu lillaah. The alif is never read (small circle), and the waw drops when connecting because a silent lam follows." },
  { two: true, color: CONNECT, title: "The alif after fathatan", w: "عَلِيمً{ا}", wasl: "عَلِيمَنۡ", sayWasl: "'a-lee-man", waqf: "عَلِيمَ[ا]", sayWaqf: "'a-lee-maa",
    tip: "Connecting: the alif is silent.  Stopping: read it as a long aa", note: "The alif after fathatan is not read when connecting (we say the tanween as a noon). When we stop, the tanween goes and we read a long alif of two counts: 'aleemaa." },
  // ----- written as one letter, read as another -----
  { read: true, color: OTHER, title: "Written as one letter, read as another", w: "ٱلصَّلَ{و}ٰةَ", r: "اَلصَّلَ[ا]ةَ", say: "as-sa-laa-ta",
    tip: "The waw is not read: we read the small alif on top of it", note: "In as-salaah, az-zakaah and al-hayaah a waw is written with a small (dagger) alif on it. Follow the small alif and do not pronounce the waw." },
];

(async () => {
  const strings = [];
  LESSON.forEach(sl => {
    strings.push(sl.title);
    if (sl.items) sl.items.forEach(([t, l]) => strings.push(plain(t), l));
    ["w", "r", "wasl", "waqf"].forEach(k => sl[k] && strings.push(plain(sl[k])));
    ["say", "sayWasl", "sayWaqf", "tip"].forEach(k => sl[k] && strings.push(sl[k]));
  });
  strings.push("Connecting", "Stopping");
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
