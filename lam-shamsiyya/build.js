// Sun and moon letters (اللام الشمسية والقمرية), no pictures, Quranic sukun ۡ. One file:
// what ال is, the moon rule (lam with sukun: say it), the sun rule (no mark on the lam + shaddah: skip it), the 14 + 14
// letters, then every letter in the shape order of the other decks (classify it, then a Quranic word: as written → as
// read), a sorting quiz and Quranic phrases. Measured text, a different background on every slide;
// sounds by ../fathah-plus/post.py (transitions only).
// usage: node build.js <outdir>
const pptxgen = require("pptxgenjs");
const measure = require("../fathah-plus/measure");
const T = new pptxgen().ShapeType;
const FONT = "Traditional Arabic";
const INK = "16213E", GREEN = "2F9E44", RED = "E03131", GREY = "ADB5BD";
const SUN = "F08C00", MOON = "4263EB";                   // sun letters orange, moon letters blue
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

// "{x}" = green (said), "(x)" = grey (written, not said), "[x]" = red (the doubled letter)
const plain = t => t.replace(/[{}\[\]()]/g, "");
function runs(t) {
  const out = []; const re = /\{([^}]*)\}|\[([^\]]*)\]|\(([^)]*)\)|([^{[(]+)/g; let mm;
  while ((mm = re.exec(t))) {
    if (mm[1] !== undefined) out.push({ text: mm[1], options: { color: GREEN } });
    else if (mm[2] !== undefined) out.push({ text: mm[2], options: { color: RED } });
    else if (mm[3] !== undefined) out.push({ text: mm[3], options: { color: GREY } });
    else out.push({ text: mm[4], options: {} });
  }
  return out;
}
function arRuns(s, t, x, y, w, h, maxPt, name) {
  const f = centred(plain(t), maxPt, inRect(w, h, 0.18));
  s.addText(runs(t), { x, y: y + f.dy, w, h, fontSize: f.pt, fontFace: FONT, color: INK, align: "center", valign: "middle",
    margin: 0, isTextBox: true, rtlMode: true, lang: "ar-SA", fit: "none", wrap: false, objectName: name });
}
function panel(s, x, y, w, h, line, name, fill) {
  shape(s, T.roundRect, { x, y, w, h, rectRadius: 0.25, fill: { color: fill || "FFFFFF" }, line: { color: line, width: 7 } }, name);
}
// a sun or a moon sign
function icon(s, sun, x, y, d, name) {
  if (sun) shape(s, T.sun, { x, y, w: d, h: d, fill: { color: "FFD43B" }, line: { color: SUN, width: 2 } }, name);
  else shape(s, T.moon, { x: x + d * 0.2, y, w: d * 0.6, h: d, fill: { color: "BAC8FF" }, line: { color: MOON, width: 2 }, rotate: 0 }, name);
}
// caption in a coloured strip
function strip(s, text, x, y, w, color, name) {
  shape(s, T.roundRect, { x, y, w, h: 0.6, rectRadius: 0.2, fill: { color }, line: { width: 0 } }, name + " box");
  const f = centred(text, 30, inRect(w, 0.6, 0.05));
  arText(s, text, { x, y: y + f.dy, w, h: 0.6, fontSize: f.pt, color: "FFFFFF", objectName: name });
}

// ---------- the letters ----------
const MOONS = "أبجحخعغفقكموهي", SUNS = "تثدذرزسشصضطظلن";
const ORDER = ["أ","ب","ت","ث","ن","ي","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ه","و"];
// a Quranic word for each letter: [as written with the lam marked, as read when starting]
const WORDS = {
  "أ": ["ٱ{لۡ}أَرۡضُ", "اَلۡأَرۡضُ"], "ب": ["ٱ{لۡ}بَيۡتُ", "اَلۡبَيۡتُ"], "ج": ["ٱ{لۡ}جَنَّةُ", "اَلۡجَنَّةُ"], "ح": ["ٱ{لۡ}حَمۡدُ", "اَلۡحَمۡدُ"],
  "خ": ["ٱ{لۡ}خَيۡرُ", "اَلۡخَيۡرُ"], "ع": ["ٱ{لۡ}عِلۡمُ", "اَلۡعِلۡمُ"], "غ": ["ٱ{لۡ}غَفُورُ", "اَلۡغَفُورُ"], "ف": ["ٱ{لۡ}فَلَقُ", "اَلۡفَلَقُ"],
  "ق": ["ٱ{لۡ}قَمَرُ", "اَلۡقَمَرُ"], "ك": ["ٱ{لۡ}كِتَٰبُ", "اَلۡكِتَابُ"], "م": ["ٱ{لۡ}مَلِكُ", "اَلۡمَلِكُ"], "و": ["ٱ{لۡ}وَلَدُ", "اَلۡوَلَدُ"],
  "ه": ["ٱ{لۡ}هُدَىٰ", "اَلۡهُدَى"], "ي": ["ٱ{لۡ}يَوۡمُ", "اَلۡيَوۡمُ"],
  "ت": ["ٱ(ل)[تِّ]ينُ", "اَتِّينُ"], "ث": ["ٱ(ل)[ثَّ]مَرَٰتُ", "اَثَّمَرَاتُ"], "د": ["ٱ(ل)[دِّ]ينُ", "اَدِّينُ"], "ذ": ["ٱ(ل)[ذِّ]كۡرُ", "اَذِّكۡرُ"],
  "ر": ["ٱ(ل)[رَّ]حۡمَٰنُ", "اَرَّحۡمَانُ"], "ز": ["ٱ(ل)[زَّ]كَوٰةُ", "اَزَّكَاةُ"], "س": ["ٱ(ل)[سَّ]مَآءُ", "اَسَّمَاءُ"], "ش": ["ٱ(ل)[شَّ]مۡسُ", "اَشَّمۡسُ"],
  "ص": ["ٱ(ل)[صَّ]لَوٰةُ", "اَصَّلَاةُ"], "ض": ["ٱ(ل)[ضُّ]حَىٰ", "اَضُّحَى"], "ط": ["ٱ(ل)[طَّ]ارِقُ", "اَطَّارِقُ"], "ظ": ["ٱ(ل)[ظُّ]لُمَٰتُ", "اَظُّلُمَاتُ"],
  "ل": ["ٱ(ل)[لَّ]يۡلُ", "اَللَّيۡلُ"], "ن": ["ٱ(ل)[نَّ]اسُ", "اَنَّاسُ"],
};
const SAY = { "أ": "al-ardu", "ب": "al-baytu", "ج": "al-jannatu", "ح": "al-hamdu", "خ": "al-khayru", "ع": "al-'ilmu", "غ": "al-ghafooru",
  "ف": "al-falaqu", "ق": "al-qamaru", "ك": "al-kitaabu", "م": "al-maliku", "و": "al-waladu", "ه": "al-hudaa", "ي": "al-yawmu",
  "ت": "at-teenu", "ث": "ath-thamaraatu", "د": "ad-deenu", "ذ": "adh-dhikru", "ر": "ar-rahmaanu", "ز": "az-zakaatu", "س": "as-samaa'u",
  "ش": "ash-shamsu", "ص": "as-salaatu", "ض": "ad-duhaa", "ط": "at-taariqu", "ظ": "adh-dhulumaatu", "ل": "al-laylu", "ن": "an-naasu" };
// checks: moon words have a lam with the Quranic sukun, sun words have a bare lam and a shaddah on the next letter
for (const [l, [w]] of Object.entries(WORDS)) {
  const p = plain(w);
  if (MOONS.includes(l) && !p.startsWith("ٱلۡ" + l)) throw new Error("moon word " + p);
  if (SUNS.includes(l) && !(p.startsWith("ٱل" + l) && p[3] && /[ً-ّ]/.test(p.slice(3, 6)) && p.slice(3, 6).includes("ّ"))) throw new Error("sun word " + p);
}
if (MOONS.length + SUNS.length !== 28 || ORDER.length !== 28) throw new Error("letter count");

const N_AL = "«ال» حرفان: همزة وصل «ٱ» ولام. تُكتب اللام دائماً، لكنها تُنطق مع بعض الحروف ولا تُنطق مع بعضها. نسمّي الحروف التي تُنطق معها اللام قمرية، والتي لا تُنطق معها شمسية.";
const N_MOON = "اللام القمرية: على اللام سكون المصحف «ۡ»، فننطقها واضحة: «ٱلۡقَمَرُ» = اَلۡقَمَرُ (al-qamaru). الحروف القمرية 14 يجمعها: «ٱبۡغِ حَجَّكَ وَخَفۡ عَقِيمَهُۥ».";
const N_SUN = "اللام الشمسية: اللام بلا أي علامة، والحرف بعدها عليه شدة، فتدخل اللام فيه ولا تُنطق: «ٱلشَّمۡسُ» = اَشَّمۡسُ (ash-shamsu). الحروف الشمسية هي الـ14 الباقية.";
const N_TIP = "في المصحف لا نحتاج حفظ القائمة عند القراءة: إذا رأيت سكوناً على اللام فانطقها، وإذا رأيت اللام بلا علامة وبعدها شدة فلا تنطقها.";

// ---------- slides ----------
function alSlide(s, th) {
  const PW = 2.6, PH = 2.0, PY = 1.15;
  panel(s, 6.9, PY, PW, PH, GREEN, "Panel hamza"); arRuns(s, "ٱ", 6.9, PY, PW, PH, 150, "C1 hamza");
  shape(s, T.mathPlus, { x: 6.15, y: PY + PH / 2 - 0.3, w: 0.6, h: 0.6, fill: { color: hsl(th.hue + 180, 0.7, 0.5) }, line: { width: 0 } }, "C2 plus");
  panel(s, 3.4, PY, PW, PH, MOON, "Panel lam"); arRuns(s, "ل", 3.4, PY, PW, PH, 150, "C2 lam");
  shape(s, T.leftArrow, { x: 2.6, y: PY + PH / 2 - 0.3, w: 0.65, h: 0.6, fill: { color: hsl(th.hue + 220, 0.6, 0.45) }, line: { width: 0 } }, "C3 arrow");
  panel(s, 0.4, PY, 2.05, PH, "F2B134", "Panel al", "FFFBE3"); arRuns(s, "ٱل", 0.4, PY, 2.05, PH, 150, "C3 al");
  strip(s, "همزة وصل", 6.9, PY + PH + 0.2, PW, GREEN, "C1 label hamza");
  strip(s, "لام", 3.4, PY + PH + 0.2, PW, MOON, "C2 label lam");
  strip(s, "ال", 0.4, PY + PH + 0.2, 2.05, "D9480F", "C3 label al");
  s.addNotes(N_AL);
}
// the two rules side by side
function ruleSlide(s, sun) {
  const PW = 4.2, PH = 2.0, PY = 1.15;
  const w = sun ? "ٱ(ل)[شَّ]مۡسُ" : "ٱ{لۡ}قَمَرُ", r = sun ? "اَشَّمۡسُ" : "اَلۡقَمَرُ", col = sun ? SUN : MOON;
  panel(s, 5.4, PY, PW, PH, col, "Panel written"); arRuns(s, w, 5.4, PY, PW, PH, 130, "C1 written");
  icon(s, sun, 5.5, PY + 0.08, 0.7, "C1 icon");
  shape(s, T.leftArrow, { x: 4.75, y: PY + PH / 2 - 0.3, w: 0.55, h: 0.6, fill: { color: col }, line: { width: 0 } }, "C2 arrow");
  panel(s, 0.4, PY, PW, PH, "F2B134", "Panel read", "FFFBE3"); arRuns(s, r, 0.4, PY, PW, PH, 130, "C2 read");
  strip(s, sun ? "اللام بلا علامة + شدة" : "على اللام سكون", 5.4, PY + PH + 0.2, PW, col, "C3 label written");
  strip(s, sun ? "لا ننطق اللام" : "ننطق اللام", 0.4, PY + PH + 0.2, PW, sun ? RED : GREEN, "C3 label read");
  s.addNotes(sun ? N_SUN : N_MOON);
}
// the 14 letters of one kind in two rows, appearing one by one
function gridSlide(s, sun) {
  const L = sun ? SUNS : MOONS, col = sun ? SUN : MOON, d = 0.95, gap = 0.22;
  icon(s, sun, 4.6, 1.0, 0.8, "Kind icon");
  const lpt = Math.min(...[...L].map(l => centred(l, 60, inCircle(d, 6)).pt));
  [...L].forEach((l, i) => {
    const row = Math.floor(i / 7), c = i % 7, x = 9.6 - (c + 1) * d - c * gap - 0.3, y = 2.0 + row * (d + 0.35);
    shape(s, T.ellipse, { x, y, w: d, h: d, fill: { color: "FFFFFF" }, line: { color: col, width: 6 } }, `C${i + 1} circle ${i + 1}`);
    const f = centred(l, lpt, inCircle(d, 6));
    arText(s, l, { x, y: y + f.dy, w: d, h: d, fontSize: f.pt, objectName: `C${i + 1} letter ${i + 1}` });
  });
  s.addNotes(sun ? "الحروف الشمسية الأربعة عشر: ت ث د ذ ر ز س ش ص ض ط ظ ل ن. معها لا تُنطق اللام، والحرف بعدها مشدد. " + N_TIP : N_MOON);
}
// one letter: is it a sun or a moon letter?
function classifySlide(s, l) {
  const sun = SUNS.includes(l), col = sun ? SUN : MOON, d = 2.6, x = 5.9, y = 1.25;
  shape(s, T.ellipse, { x, y, w: d, h: d, fill: { color: "FFFFFF" }, line: { color: col, width: 10 } }, "Circle letter");
  const f = centred(l, 170, inCircle(d, 10));
  arText(s, l, { x, y: y + f.dy, w: d, h: d, fontSize: f.pt, objectName: "Letter" });
  icon(s, sun, 2.6, 1.3, 1.6, "C1 icon");
  strip(s, sun ? "حرف شمسي: لا ننطق اللام" : "حرف قمري: ننطق اللام", 1.0, 3.2, 4.4, sun ? RED : GREEN, "C1 label");
  s.addNotes(`هل «${l}» شمسي أم قمري؟ اسأل الطلاب قبل النقر. ` + (sun ? "شمسي: اللام قبله لا تُنطق، والحرف يُشدَّد." : "قمري: اللام قبله ساكنة وتُنطق."));
}
// the Quranic word: as written → as read when starting, with the sounds in Latin letters
function wordSlide(s, th, l) {
  const sun = SUNS.includes(l), col = sun ? SUN : MOON, [w, r] = WORDS[l], PW = 4.2, PH = 2.0, PY = 1.15;
  panel(s, 5.4, PY, PW, PH, col, "Panel written"); arRuns(s, w, 5.4, PY, PW, PH, 120, "C1 written");
  icon(s, sun, 5.5, PY + 0.08, 0.6, "Icon");
  shape(s, T.leftArrow, { x: 4.75, y: PY + PH / 2 - 0.3, w: 0.55, h: 0.6, fill: { color: col }, line: { width: 0 } }, "C2 arrow");
  panel(s, 0.4, PY, PW, PH, "F2B134", "Panel read", "FFFBE3"); arRuns(s, r, 0.4, PY, PW, PH * 0.7, 110, "C2 read");
  const sf = centred(SAY[l], 30, inRect(PW - 0.3, PH * 0.3, 0.05));
  s.addText(SAY[l], { x: 0.55, y: PY + PH * 0.7 + sf.dy, w: PW - 0.3, h: PH * 0.3, fontSize: sf.pt, fontFace: "Arial", bold: true, color: "D9480F",
    align: "center", valign: "middle", margin: 0, objectName: "C2 sounds" });
  strip(s, sun ? "اللام لا تُنطق والحرف مشدد" : "اللام ساكنة وتُنطق", 0.4, PY + PH + 0.2, 9.2, sun ? RED : GREEN, "C3 label");
  s.addNotes(sun ? `«${plain(w)}»: اللام بلا علامة و«${l}» عليها شدة، فنقرأ «${r}».` : `«${plain(w)}»: على اللام سكون، فنقرأ «${r}» ونُظهر اللام.`);
}
// quiz: a word, then its sun / moon sign
function quizSlide(s, l) {
  const sun = SUNS.includes(l), [w] = WORDS[l], PW = 5.0, PH = 2.1;
  panel(s, 2.5, 1.1, PW, PH, "868E96", "Panel word");          // neutral border: the colour would give the answer away
  arRuns(s, plain(w), 2.5, 1.1, PW, PH, 130, "Word");
  icon(s, sun, 4.4, 3.35, 1.1, "C1 icon");
  s.addNotes("سؤال: هل تُنطق اللام هنا؟ انظر إلى ما فوق اللام قبل النقر. " + (sun ? "لا: اللام بلا علامة وبعدها شدة (شمسية)." : "نعم: على اللام سكون (قمرية)."));
}

const QURAN = ["وَٱلشَّمۡسِ وَضُحَىٰهَا", "وَٱلۡقَمَرِ إِذَا تَلَىٰهَا", "ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ", "مَٰلِكِ يَوۡمِ ٱلدِّينِ",
  "قُلۡ أَعُوذُ بِرَبِّ ٱلۡفَلَقِ", "قُلۡ أَعُوذُ بِرَبِّ ٱلنَّاسِ", "وَٱلتِّينِ وَٱلزَّيۡتُونِ", "ٱلۡحَمۡدُ لِلَّهِ رَبِّ ٱلۡعَٰلَمِينَ"];
const QUIZ = ["ش", "ق", "ر", "ك", "ن", "ب", "ص", "ع", "د", "م"];

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
  const slides = [{ al: 1 }, { rule: false }, { rule: true }, { grid: false }, { grid: true }];
  ORDER.forEach(l => slides.push({ classify: l }, { word: l }));
  QUIZ.forEach(l => slides.push({ quiz: l }));
  QURAN.forEach(q => slides.push({ sentence: q }));
  const strings = ["ٱ", "ل", "ٱل", "همزة وصل", "لام", "ال", "اللام بلا علامة + شدة", "على اللام سكون", "لا ننطق اللام", "ننطق اللام",
    "حرف شمسي: لا ننطق اللام", "حرف قمري: ننطق اللام", "اللام لا تُنطق والحرف مشدد", "اللام ساكنة وتُنطق", "اَشَّمۡسُ", "اَلۡقَمَرُ",
    "ٱلشَّمۡسُ", "ٱلۡقَمَرُ", ...MOONS, ...SUNS, ...Object.values(SAY), ...Object.values(WORDS).flatMap(([w, r]) => [plain(w), r]),
    ...QURAN.flatMap(q => [q, ...q.split(" ")])];
  M = await measure(strings);
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "Sun and moon letters";
  used.clear();
  slides.forEach((sl, i) => {
    const s = pres.addSlide(), th = background(60, i);
    s.background = { color: th.bg };
    content = []; deco = [];
    scenery(s, th);
    if (sl.al) alSlide(s, th);
    else if (sl.rule !== undefined) ruleSlide(s, sl.rule);
    else if (sl.grid !== undefined) gridSlide(s, sl.grid);
    else if (sl.classify) classifySlide(s, sl.classify);
    else if (sl.word) wordSlide(s, th, sl.word);
    else if (sl.quiz) quizSlide(s, sl.quiz);
    else { sentenceSlide(s, sl.sentence, th); s.addNotes("ابحث عن «ال» في الآية: هل على اللام سكون (تُنطق) أم بعدها شدة (لا تُنطق)؟"); }
    checkOverlap(`slide ${i + 1}`);
  });
  await pres.writeFile({ fileName: `${process.argv[2] || "."}/Sun-and-Moon-Letters.raw.pptx` });
  console.log("Sun-and-Moon-Letters", slides.length, "slides");
})().catch(e => { console.error(e); process.exit(1); });
