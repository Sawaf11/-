// Sukun drills, new system (no pictures): every letter with the Quranic sukun ۡ (red circle) after a voweled letter,
// with every earlier letter: beginning (X then a sakin letter), middle and end. The vowel before the sukun turns between
// fathah, kasrah and dammah. Explanation slides at the start of every file, Quranic phrases at the end, a different
// background on every slide, measured text; sounds by ../../fathah-plus/post.py (transitions only).
// usage: node build.js <outdir>
const pptxgen = require("pptxgenjs");
const measure = require("../../fathah-plus/measure");
const T = new pptxgen().ShapeType;
const FATHA = "َ", KASRA = "ِ", DAMMA = "ُ", SUKUN = "ۡ", SHADDA = "ّ", MADDAH = "ٓ";
const FONT = "Traditional Arabic";                 // draws the Quranic sukun and marks
const INK = "16213E", GREEN = "2F9E44", RED = "E03131", GREY = "9AA0B5";
const RING = ["E8604C", "3A8FD9", "2FB57A", "8E5BD0"];
const SUKUN_RING = "E03131", MADD_RING = "F59F00";
const W = 10, H = 5.625;
const BAND_TOP = 0.95, BAND_BOTTOM = 4.7;
const HUE = 210;
const FAMILIES = [
  ["01-alif", ["أ"]], ["02-ba-ta-tha", ["ب","ت","ث"]], ["03-noon-ya", ["ن","ي"]],
  ["04-jeem-ha-kha", ["ج","ح","خ"]], ["05-dal-dhal", ["د","ذ"]], ["06-ra-zay", ["ر","ز"]],
  ["07-seen-sheen", ["س","ش"]], ["08-sad-dad", ["ص","ض"]], ["09-ta-dha", ["ط","ظ"]],
  ["10-ain-ghain", ["ع","غ"]], ["11-fa-qaf", ["ف","ق"]], ["12-kaf", ["ك"]],
  ["13-lam", ["ل"]], ["14-meem", ["م"]], ["15-ha", ["ه"]], ["16-waw", ["و"]],
];
const ALPHA = ["أ","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه","و","ي"];
const partners = X => { const i = ALPHA.indexOf(X); return i >= 7 ? ALPHA.slice(0, i) : ALPHA.filter(l => l !== X).slice(0, 7); };
const seat = (l, m) => (l === "أ" && m === KASRA ? "إ" : l);
const U = (l, m, ring) => ({ c: l === "أ" && m === KASRA ? "ا" : l, full: seat(l, m) + m, ring });
const SAK = l => U(l, SUKUN, SUKUN_RING);
const SILENT = {};                                     // not used here; joinSlide checks for it
const V3 = [FATHA, KASRA, DAMMA];
const wordOf = units => units.map(u => u.full).join("");
const QALQALA = "قطبجد";

const N_RULE = "لا نبدأ بحرف ساكن أبداً: الحرف الساكن (بسكون المصحف «ۡ») يحتاج قبله حرفاً متحركاً يستند إليه.";
const N_JOIN = v => `حرف متحرك + حرف ساكن = مقطع واحد ننطقه دفعة واحدة. هنا الحرف الأول عليه ${v === FATHA ? "فتحة" : v === KASRA ? "كسرة" : "ضمة"}، ثم نقف على الحرف الساكن.`;
const N_DRILL = X => "الدائرة الحمراء حرف ساكن: نقف عليه ولا نضيف حركة." + (QALQALA.includes(X) ? " وهذا الحرف من حروف القلقلة (قطب جد): إذا سكن نُخرجه بارتداد خفيف." : "");

// Quranic phrases (mushaf spelling): each has a letter of the file with the Quranic sukun
const SENT = {
  "01-alif": ["وَأۡمُرۡ أَهۡلَكَ بِٱلصَّلَوٰةِ", "لَيَأۡكُلُونَ ٱلطَّعَامَ", "فَأۡتُوا۟ بِسُورَةٍ"],
  "02-ba-ta-tha": ["إِنَّ شَانِئَكَ هُوَ ٱلۡأَبۡتَرُ", "تَبَّتۡ يَدَآ أَبِي لَهَبٍ", "يَٰٓأَهۡلَ يَثۡرِبَ"],
  "03-noon-ya": ["أَنۡعَمۡتَ عَلَيۡهِمۡ", "إِنَّآ أَعۡطَيۡنَٰكَ ٱلۡكَوۡثَرَ", "غَيۡرِ ٱلۡمَغۡضُوبِ عَلَيۡهِمۡ"],
  "04-jeem-ha-kha": ["وَٱلشَّمۡسُ تَجۡرِي", "إِنَّا نَحۡنُ نَزَّلۡنَا ٱلذِّكۡرَ", "فَأَخۡرَجۡنَا بِهِۦ"],
  "05-dal-dhal": ["قَدۡ أَفۡلَحَ ٱلۡمُؤۡمِنُونَ", "وَإِذۡ قَالَ رَبُّكَ", "وَٱدۡخُلِي جَنَّتِي"],
  "06-ra-zay": ["وَرَبَّكَ فَكَبِّرۡ", "وَخَلَقۡنَٰكُمۡ أَزۡوَٰجًا", "فِي ٱلۡأَرۡضِ"],
  "07-seen-sheen": ["أَلَمۡ نَشۡرَحۡ لَكَ صَدۡرَكَ", "ٱهۡدِنَا ٱلصِّرَٰطَ ٱلۡمُسۡتَقِيمَ", "وَٱسۡتَغۡفِرُوا۟ ٱللَّهَ"],
  "08-sad-dad": ["فَٱصۡبِرۡ صَبۡرًا جَمِيلًا", "وَٱخۡفِضۡ جَنَاحَكَ", "ذَٰلِكَ فَضۡلُ ٱللَّهِ"],
  "09-ta-dha": ["ٱلَّذِيٓ أَطۡعَمَهُم مِّن جُوعٍ", "وَهَنَ ٱلۡعَظۡمُ مِنِّي", "وَلَا يُظۡلَمُونَ"],
  "10-ain-ghain": ["إِيَّاكَ نَعۡبُدُ", "غَيۡرِ ٱلۡمَغۡضُوبِ عَلَيۡهِمۡ", "وَٱسۡتَغۡفِرُوا۟ ٱللَّهَ"],
  "11-fa-qaf": ["قَدۡ أَفۡلَحَ ٱلۡمُؤۡمِنُونَ", "ٱقۡرَأۡ بِٱسۡمِ رَبِّكَ", "فِي مَقۡعَدِ صِدۡقٍ"],
  "12-kaf": ["وَٱشۡكُرُوا۟ لِي وَلَا تَكۡفُرُونِ", "وَلَٰكِنَّ أَكۡثَرَهُمۡ", "بِمَا كَانُوا۟ يَكۡسِبُونَ"],
  "13-lam": ["قُلۡ هُوَ ٱللَّهُ أَحَدٌ", "ٱلۡحَمۡدُ لِلَّهِ", "أَلۡهَىٰكُمُ ٱلتَّكَاثُرُ"],
  "14-meem": ["ٱلۡحَمۡدُ لِلَّهِ", "أَلَمۡ تَرَ", "أَنۡعَمۡتَ عَلَيۡهِمۡ"],
  "15-ha": ["ٱهۡدِنَا ٱلصِّرَٰطَ ٱلۡمُسۡتَقِيمَ", "يَٰٓأَهۡلَ ٱلۡكِتَٰبِ", "وَأۡمُرۡ أَهۡلَكَ"],
  "16-waw": ["مَٰلِكِ يَوۡمِ ٱلدِّينِ", "إِنَّآ أَعۡطَيۡنَٰكَ ٱلۡكَوۡثَرَ", "يَوۡمَ ٱلۡقِيَٰمَةِ"],
};
FAMILIES.forEach(([file, members]) => SENT[file].forEach(s => {
  if (/ْ/.test(s)) throw new Error("round sukun in " + s);
  if (!members.some(l => s.includes(l + SUKUN))) throw new Error(file + ": no sakin letter of the file in " + s);
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

// circles joined into the word; up to 4 circles
function joinSlide(s, units, th, note) {
  const n = units.length, CY = 2.8;
  const G = {
    2: { d: 1.9, gap: 0.7, zone: 1.0, pw: 3.0, ph: 2.2, fs: 110, rs: 120, plus: 0.45, aw: 0.7, right: 9.25 },
    3: { d: 1.45, gap: 0.5, zone: 0.85, pw: 2.65, ph: 2.0, fs: 90, rs: 100, plus: 0.36, aw: 0.6, right: 9.4 },
    4: { d: 1.32, gap: 0.3, zone: 0.62, pw: 2.4, ph: 1.8, fs: 80, rs: 90, plus: 0.26, aw: 0.46, right: 9.62 },
  }[n];
  const cx = []; let right = G.right;
  for (let i = 0; i < n; i++) { cx.push(right - G.d); right -= G.d + G.gap; }
  const shown = u => u.full || u.c;
  const lpt = Math.min(...units.map(u => centred(shown(u), G.fs, inCircle(G.d, 9)).pt));
  const word = wordOf(units), rf = centred(word, G.rs, inRect(G.pw, G.ph, 0.22));
  units.forEach((u, i) => shape(s, T.ellipse, { x: cx[i], y: CY - G.d / 2, w: G.d, h: G.d, fill: { color: "FFFFFF" },
    line: { color: u.ring || RING[i % RING.length], width: u.ring ? 10 : 8 } }, `Circle ${i + 1}`));
  const leftSrc = cx[n - 1], panelX = leftSrc - G.zone - G.pw;
  shape(s, T.roundRect, { x: panelX, y: CY - G.ph / 2, w: G.pw, h: G.ph, rectRadius: 0.3, fill: { color: "FFFBE3" }, line: { color: "F2B134", width: 6 } }, "Result panel");
  let k = 1;
  units.forEach((u, i) => {
    const f = centred(shown(u), lpt, inCircle(G.d, 9));
    const o = { x: cx[i], y: CY - G.d / 2 + f.dy, w: G.d, h: G.d, fontSize: f.pt };
    arText(s, u.c, Object.assign({ objectName: `C${k++} L${i + 1} letter`, color: u === SILENT ? GREY : INK }, o));
    if (u.full) arText(s, u.full, Object.assign({ objectName: `C${k++} M${i + 1} mark` }, o));
    else shape(s, T.noSmoking, { x: cx[i] + G.d / 2 - 0.19, y: CY - G.d / 2 - 0.48, w: 0.38, h: 0.38, fill: { color: GREY }, line: { color: "FFFFFF", width: 1.5 } }, `C${k++} B silent`);
    if (i < n - 1) shape(s, T.mathPlus, { x: cx[i] - G.gap / 2 - G.plus / 2, y: CY - G.plus / 2, w: G.plus, h: G.plus,
      fill: { color: hsl(th.hue + 180, 0.7, 0.5) }, line: { width: 0 } }, `C${k++} P${i + 1} plus`);
  });
  // the two halves of the shaddah: a bracket over the sakin circle and the voweled one after it
  units.forEach((u, i) => {
    if (u.ring === SUKUN_RING && units[i + 1] && units[i + 1].c === u.c) {
      const x0 = cx[i + 1], x1 = cx[i] + G.d;
      shape(s, T.rect, { x: x0 + 0.15, y: CY - G.d / 2 - 0.24, w: x1 - x0 - 0.3, h: 0.12, fill: { color: SUKUN_RING }, line: { width: 0 } }, `C${k} H shaddah bar`);
      k++;
    }
  });
  shape(s, T.leftArrow, { x: leftSrc - G.zone / 2 - G.aw / 2, y: CY - 0.28, w: G.aw, h: 0.56, fill: { color: hsl(th.hue + 220, 0.6, 0.45) }, line: { width: 0 } }, `C${k++} A arrow`);
  arText(s, word, { x: panelX, y: CY - G.ph / 2 + rf.dy, w: G.pw, h: G.ph, fontSize: rf.pt, objectName: `C${k++} R result` });
  s.addNotes(note || "");
}
function verdict(s, ok, cx, y, k) {
  if (!ok) return shape(s, T.mathMultiply, { x: cx - 0.35, y, w: 0.7, h: 0.7, fill: { color: RED }, line: { width: 0 } }, `C${k} X wrong`);
  const line = { color: GREEN, width: 12 };
  shape(s, T.line, { x: cx - 0.3, y: y + 0.3, w: 0.22, h: 0.3, line }, `C${k} V tick a`);
  shape(s, T.line, { x: cx - 0.08, y: y + 0.02, w: 0.42, h: 0.58, line, flipV: true }, `C${k} V tick b`);
}
// «بَّ» at the start of a word is wrong; «تَبَّ» is right
function startRuleSlide(s, wrong, right, note) {
  const PW = 3.4, PH = 2.3, PY = 1.25, items = [{ x: 5.6, t: wrong, ok: false }, { x: 1.0, t: right, ok: true }];
  const pt = Math.min(...items.map(it => centred(it.t, 150, inRect(PW, PH, 0.25)).pt));
  items.forEach((it, i) => {
    const f = centred(it.t, pt, inRect(PW, PH, 0.25));
    shape(s, T.roundRect, { x: it.x, y: PY, w: PW, h: PH, rectRadius: 0.3, fill: { color: "FFFFFF" }, line: { color: it.ok ? GREEN : RED, width: 8 } }, `Panel ${i + 1}`);
    arText(s, it.t, { x: it.x, y: PY + f.dy, w: PW, h: PH, fontSize: f.pt, objectName: `C${2 * i + 1} W${i + 1} word` });
    verdict(s, it.ok, it.x + PW / 2, PY + PH + 0.2, 2 * i + 2);
  });
  s.addNotes(note);
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

function plan() {
  return FAMILIES.map(([file, members]) => {
    const X0 = members[0], slides = [];
    // explanation: a sakin letter cannot start; then the three vowels before it
    slides.push({ rule: [X0 + SUKUN, (X0 === "أ" ? "بَ" : "أَ") + X0 + SUKUN], note: N_RULE });
    V3.forEach(v => slides.push({ join: [U(X0 === "أ" ? "ب" : "أ", v), SAK(X0)], note: N_JOIN(v) }));
    members.forEach(X => {
      const P = partners(X);
      P.forEach((p, k) => slides.push({ join: [U(X, V3[k % 3]), SAK(p)], note: N_DRILL(p) }));                                           // beginning
      P.forEach((p, k) => slides.push({ join: [U(p, V3[k % 3]), SAK(X), U(P[(k + 1) % P.length], FATHA)], note: N_DRILL(X) }));          // middle
      P.forEach((p, k) => slides.push({ join: [U(p, V3[(k + 1) % 3]), SAK(X)], note: N_DRILL(X) }));                                     // end
    });
    SENT[file].forEach(sen => slides.push({ sentence: sen }));
    return { file, slides };
  });
}

(async () => {
  const files = plan();
  const strings = [];
  files.forEach(f => f.slides.forEach(sl => {
    if (sl.join) { sl.join.forEach(u => strings.push(u.c, u.full)); strings.push(wordOf(sl.join)); }
    if (sl.rule) strings.push(...sl.rule);
    if (sl.sentence) { strings.push(sl.sentence); sl.sentence.split(" ").forEach(w => strings.push(w)); }
  }));
  M = await measure(strings);
  const outDir = process.argv[2] || ".";
  for (const [deckNo, { file, slides }] of files.entries()) {
    const pres = new pptxgen();
    pres.layout = "LAYOUT_16x9";
    pres.title = "Sukun " + file;
    used.clear();
    slides.forEach((sl, i) => {
      const s = pres.addSlide(), th = background(deckNo + HUE, i);
      s.background = { color: th.bg };
      content = []; deco = [];
      scenery(s, th);
      if (sl.join) joinSlide(s, sl.join, th, sl.note);
      else if (sl.rule) startRuleSlide(s, sl.rule[0], sl.rule[1], sl.note);
      else { sentenceSlide(s, sl.sentence, th); s.addNotes("جملة قرآنية: ابحث عن الحروف الساكنة (علامة رأس الخاء) واقرأها بالوقوف عليها."); }
      checkOverlap(`${file} slide ${i + 1}`);
    });
    await pres.writeFile({ fileName: `${outDir}/${file}.raw.pptx` });
    console.log(file, slides.length, "slides");
  }
})().catch(e => { console.error(e); process.exit(1); });
