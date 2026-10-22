// Fathah games: interactive PowerPoint games with buttons that work in the slide show (hyperlinks), glassy look,
// English instructions for non-Arab children. One file per letter family (same order as the other decks).
// Games: 1 Find the fathah (fathah / kasrah / dammah), 2 Find the sound ("ba"), 3 Build it (ba + ta = ?),
// 4 Read the word (real fathah words). A right answer jumps to a "Great job!" slide (stars, happy sound);
// a wrong answer jumps to a hidden "Try again" slide that leads back to the question.
// game_post.py adds the links, the hidden slides, the sounds and the star animation.
// usage: node build.js <outdir>
const pptxgen = require("pptxgenjs");
const measure = require("../fathah-plus/measure");
const T = new pptxgen().ShapeType;
const FATHA = "َ", KASRA = "ِ", DAMMA = "ُ";
const FONT = "Arial", EN = "Arial";
const INK = "1B1B3A", WHITE = "FFFFFF";
const W = 10, H = 5.625;

const FAMILIES = [
  ["01-alif", ["أ"]], ["02-ba-ta-tha", ["ب","ت","ث"]], ["03-noon-ya", ["ن","ي"]],
  ["04-jeem-ha-kha", ["ج","ح","خ"]], ["05-dal-dhal", ["د","ذ"]], ["06-ra-zay", ["ر","ز"]],
  ["07-seen-sheen", ["س","ش"]], ["08-sad-dad", ["ص","ض"]], ["09-ta-dha", ["ط","ظ"]],
  ["10-ain-ghain", ["ع","غ"]], ["11-fa-qaf", ["ف","ق"]], ["12-kaf", ["ك"]],
  ["13-lam", ["ل"]], ["14-meem", ["م"]], ["15-ha", ["ه"]], ["16-waw", ["و"]],
];
const ALPHA = ["أ","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه","و","ي"];
const partners = X => { const i = ALPHA.indexOf(X); return i >= 7 ? ALPHA.slice(0, i) : ALPHA.filter(l => l !== X).slice(0, 7); };
// the sound of each letter with fathah, in simple Latin letters (dots mark the heavy letters)
const SOUND = { "أ": "a", "ب": "ba", "ت": "ta", "ث": "tha", "ج": "ja", "ح": "ḥa", "خ": "kha", "د": "da", "ذ": "dha", "ر": "ra", "ز": "za",
  "س": "sa", "ش": "sha", "ص": "ṣa", "ض": "ḍa", "ط": "ṭa", "ظ": "ẓa", "ع": "'a", "غ": "gha", "ف": "fa", "ق": "qa", "ك": "ka", "ل": "la",
  "م": "ma", "ن": "na", "ه": "ha", "و": "wa", "ي": "ya" };
// letters that sound alike for a beginner: never offered together in "find the sound"
const ALIKE = ["حه", "سص", "دض", "تط", "ذظز", "أع", "كق", "ثس"];
const alike = (a, b) => ALIKE.some(g => g.includes(a) && g.includes(b));
const seat = (l, m) => (l === "أ" && m === KASRA ? "إ" : l);
const say = w => [...w.replace(/[^ء-ي]/g, "")].map((l, i) => (l === "أ" && i === 0 ? "a" : l === "أ" ? "'a" : SOUND[l])).join("");

const SENTENCES = {
  "01-alif": ["أَكَلَ وَشَكَرَ", "قَرَأَ وَكَتَبَ", "سَأَلَ وَأَخَذَ", "أَخَذَ وَأَكَلَ"],
  "02-ba-ta-tha": ["كَتَبَ وَرَسَمَ", "فَتَحَ وَدَخَلَ", "ذَهَبَ وَرَجَعَ", "حَرَثَ وَزَرَعَ", "بَحَثَ وَوَجَدَ"],
  "03-noon-ya": ["نَبَتَ وَيَنَعَ", "نَزَلَ وَجَلَسَ", "دَرَسَ وَنَجَحَ", "صَنَعَ وَرَسَمَ"],
  "04-jeem-ha-kha": ["جَلَسَ وَكَتَبَ", "خَرَجَ وَرَجَعَ", "طَبَخَ وَأَكَلَ", "حَمَلَ وَخَرَجَ", "فَتَحَ وَدَخَلَ"],
  "05-dal-dhal": ["ذَهَبَ وَرَجَعَ", "رَكَعَ وَسَجَدَ", "دَرَسَ وَكَتَبَ", "ذَكَرَ وَشَكَرَ"],
  "06-ra-zay": ["زَرَعَ وَحَصَدَ", "رَسَمَ وَكَتَبَ", "نَزَلَ وَجَلَسَ", "صَبَرَ وَشَكَرَ", "حَرَثَ وَزَرَعَ وَحَصَدَ"],
  "07-seen-sheen": ["جَلَسَ وَدَرَسَ", "غَسَلَ وَمَسَحَ", "سَأَلَ وَشَكَرَ", "شَرَحَ وَرَسَمَ"],
  "08-sad-dad": ["صَبَرَ وَشَكَرَ", "حَضَرَ وَجَلَسَ", "زَرَعَ وَحَصَدَ", "نَهَضَ وَخَرَجَ"],
  "09-ta-dha": ["طَبَخَ وَأَكَلَ", "طَلَبَ وَأَخَذَ", "ظَهَرَ وَسَطَعَ", "نَظَرَ وَرَسَمَ"],
  "10-ain-ghain": ["رَكَعَ وَسَجَدَ", "غَسَلَ وَمَسَحَ", "زَرَعَ وَغَرَسَ", "بَلَغَ وَرَجَعَ", "جَمَعَ وَحَمَلَ"],
  "11-fa-qaf": ["فَتَحَ وَدَخَلَ", "قَرَأَ وَكَتَبَ", "وَقَفَ وَسَأَلَ", "قَعَدَ وَقَرَأَ"],
  "12-kaf": ["كَتَبَ وَرَسَمَ", "أَكَلَ وَشَكَرَ", "رَكَعَ وَسَجَدَ", "سَكَتَ وَنَظَرَ", "قَرَأَ وَكَتَبَ وَرَسَمَ"],
  "13-lam": ["جَلَسَ وَأَكَلَ", "حَمَلَ وَنَزَلَ", "سَأَلَ وَشَكَرَ", "دَخَلَ وَجَلَسَ وَأَكَلَ"],
  "14-meem": ["رَسَمَ وَكَتَبَ", "جَمَعَ وَحَمَلَ", "غَسَلَ وَمَسَحَ", "صَنَعَ وَرَسَمَ"],
  "15-ha": ["ذَهَبَ وَرَجَعَ", "ظَهَرَ وَسَطَعَ", "نَهَضَ وَذَهَبَ", "وَهَبَ وَرَزَقَ"],
  "16-waw": ["وَقَفَ وَسَأَلَ", "وَعَدَ وَصَدَقَ", "وَضَعَ وَجَلَسَ", "نَزَلَ وَوَقَفَ"],
};
const WORDS = [...new Set(Object.values(SENTENCES).flat().flatMap(s => s.split(" ")))];

let seed = 7;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

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


// ---------- glass drawing ----------
function glass(s, x, y, w, h, o = {}) {
  const r = o.circle ? null : Math.min(0.35, h / 2);
  const kind = o.circle ? T.ellipse : T.roundRect;
  s.addShape(kind, { x, y, w, h, rectRadius: r || undefined, fill: { color: o.tint || WHITE, transparency: o.clear ?? 72 },
    line: { color: WHITE, width: 2, transparency: 25 }, shadow: { type: "outer", blur: 12, offset: 4, angle: 90, color: "000000", opacity: 0.25 },
    objectName: o.name || "Glass" });
  // a soft sheen on the top half
  s.addShape(kind, { x: x + w * 0.06, y: y + h * 0.04, w: w * 0.88, h: h * 0.42, rectRadius: r ? r * 0.8 : undefined,
    fill: { color: WHITE, transparency: 86 }, line: { width: 0, color: WHITE, transparency: 100 }, objectName: (o.name || "Glass") + " sheen" });
}
function enText(s, text, x, y, w, h, maxPt, o = {}) {
  const f = centred(text, maxPt, inRect(w, h, 0.08));
  s.addText(text, Object.assign({ x, y: y + f.dy, w, h, fontSize: f.pt, fontFace: EN, bold: true, color: WHITE, align: "center", valign: "middle",
    margin: 0, isTextBox: true, fit: "none", wrap: false, shadow: { type: "outer", blur: 3, offset: 1, angle: 90, color: "000000", opacity: 0.35 } }, o));
}
function arText(s, text, x, y, w, h, maxPt, fits, o = {}) {
  const f = centred(text, maxPt, fits || inRect(w, h, 0.15));
  s.addText(text, Object.assign({ x, y: y + f.dy, w, h, fontSize: f.pt, fontFace: FONT, color: INK, align: "center", valign: "middle",
    margin: 0, isTextBox: true, rtlMode: true, lang: "ar-SA", fit: "none", wrap: false }, o));
}
const bg = (s, k) => { s.background = { path: `${__dirname}/bg/glass${k % 10}.jpg` }; };
const kindMark = (s, kind) => s.addShape(T.rect, { x: 0, y: 0, w: 0.01, h: 0.01, fill: { color: WHITE, transparency: 100 }, line: { width: 0, color: WHITE, transparency: 100 }, objectName: "KIND " + kind });
function button(s, label, x, y, w, h, target, tint) {
  glass(s, x, y, w, h, { tint, clear: 20, name: `LINK${target} button` });
  enText(s, label, x, y, w, h, 28, { objectName: `LINK${target} button text` });
}
function progress(s, i, n) {
  const d = 0.16, gap = 0.1, total = n * d + (n - 1) * gap;
  for (let k = 0; k < n; k++) s.addShape(T.ellipse, { x: 5 - total / 2 + k * (d + gap), y: 5.25, w: d, h: d,
    fill: { color: WHITE, transparency: k < i ? 0 : k === i ? 20 : 70 }, line: { color: WHITE, width: 1 }, objectName: "Progress" });
}

// ---------- slides ----------
function titleSlide(s, file, members, first) {
  bg(s, 0); kindMark(s, "title");
  glass(s, 1.2, 0.7, 7.6, 3.1);
  enText(s, "Fathah Games", 1.4, 0.85, 7.2, 0.9, 54);
  arText(s, members.map(l => seat(l, FATHA) + FATHA).join("   "), 1.4, 1.75, 7.2, 1.4, 110);
  enText(s, "Tap the right answer!", 1.4, 3.1, 7.2, 0.55, 26);
  button(s, "▶  Start", 3.6, 4.1, 2.8, 0.85, first, "2F9E44");
  s.addNotes("Slide show: the buttons work by tapping or clicking. A wrong answer opens a 'try again' slide that goes back to the question.");
}
function questionSlide(s, q, i, n, self) {
  bg(s, i + 1); kindMark(s, "question");
  glass(s, 2.0, 0.25, 6.0, 0.62, { tint: "000000", clear: 75 });
  enText(s, q.game, 2.1, 0.27, 5.8, 0.58, 24);
  glass(s, 0.8, 1.05, 8.4, 1.45);
  if (q.promptAr) {
    enText(s, q.prompt, 1.0, 1.08, 3.6, 1.4, 30);
    arText(s, q.promptAr, 4.6, 1.08, 4.4, 1.4, 80, null, { color: WHITE, shadow: { type: "outer", blur: 3, offset: 1, angle: 90, color: "000000", opacity: 0.35 } });
  } else enText(s, q.prompt, 1.0, 1.08, 8.0, 1.4, 34);
  const nOpt = q.options.length, d = q.wide ? 2.4 : 1.75, h = q.wide ? 1.35 : 1.75, gap = (W - nOpt * d) / (nOpt + 1);
  const pt = Math.min(...q.options.map(o => centred(o, 130, q.wide ? inRect(d, h, 0.2) : inCircle(d, 4)).pt));
  q.options.forEach((o, k) => {
    const x = W - (k + 1) * (d + gap), y = 2.85, target = o === q.answer ? self + 1 : self + 2;     // right → "great", wrong → "try again"
    glass(s, x, y, d, h, { circle: !q.wide, clear: 25, name: `LINK${target} answer ${k + 1}` });
    arText(s, o, x, y, d, h, pt, q.wide ? inRect(d, h, 0.2) : inCircle(d, 4), { objectName: `LINK${target} answer ${k + 1} text` });
  });
  progress(s, i, n);
  s.addNotes(`${q.game}. Answer: ${q.answer}`);
}
function rightSlide(s, q, i, next) {
  bg(s, i + 1); kindMark(s, "right");
  glass(s, 2.2, 0.55, 5.6, 3.1);
  enText(s, "Great job!", 2.4, 0.7, 5.2, 0.85, 50);
  arText(s, q.answer, 2.4, 1.55, 5.2, 1.5, 110);
  if (q.say) enText(s, q.say, 2.4, 3.0, 5.2, 0.5, 28);
  [[1.1, 0.6], [8.2, 0.7], [0.9, 2.6], [8.5, 2.5], [1.6, 4.3], [7.6, 4.3]].forEach(([x, y], k) =>
    s.addShape(T.star5, { x, y, w: 0.75, h: 0.75, fill: { color: "FFD43B" }, line: { color: WHITE, width: 2 }, objectName: `A${200 + k * 180} star ${k + 1}` }));
  button(s, "Next  ▶", 3.6, 4.35, 2.8, 0.8, next, "2F9E44");
}
function wrongSlide(s, i, back) {
  bg(s, i + 1); kindMark(s, "wrong");
  glass(s, 2.2, 0.8, 5.6, 2.5);
  enText(s, "Oops!", 2.4, 0.95, 5.2, 0.9, 54);
  enText(s, "Look again and try one more time.", 2.4, 1.95, 5.2, 0.7, 26);
  button(s, "↺  Try again", 3.4, 3.75, 3.2, 0.9, back, "E8590C");
}
function endSlide(s, first, n) {
  bg(s, 3); kindMark(s, "end");
  glass(s, 1.6, 0.6, 6.8, 3.2);
  enText(s, "You did it!", 1.8, 0.8, 6.4, 1.0, 58);
  enText(s, `${n} games won`, 1.8, 1.9, 6.4, 0.6, 30);
  [[2.4, 2.65], [4.55, 2.55], [6.7, 2.65]].forEach(([x, y], k) =>
    s.addShape(T.star5, { x, y, w: 0.9, h: 0.9, fill: { color: "FFD43B" }, line: { color: WHITE, width: 2 }, objectName: `A${300 + k * 300} star ${k + 1}` }));
  button(s, "↺  Play again", 3.3, 4.2, 3.4, 0.85, first, "1971C2");
}

// ---------- questions for one file ----------
function questions(members) {
  const qs = [];
  members.forEach(X => qs.push({ game: "Game 1 · Find the fathah", prompt: "Tap the letter with FATHAH (a)", say: SOUND[X],
    answer: X + FATHA, options: shuffle([X + FATHA, seat(X, KASRA) + KASRA, X + DAMMA]) }));
  members.forEach(X => {
    const pool = shuffle(partners(X).concat(ALPHA.filter(l => !partners(X).includes(l) && l !== X))).filter(l => !alike(l, X));
    for (let r = 0; r < 2; r++) {
      const others = [];
      for (const l of pool.slice(r * 3)) { if (others.length < 2 && !others.some(o => alike(o, l))) others.push(l); }
      qs.push({ game: "Game 2 · Find the sound", prompt: `Tap:  “${SOUND[X]}”`, say: SOUND[X], answer: X + FATHA,
        options: shuffle([X, ...others].map(l => l + FATHA)) });
    }
  });
  members.forEach(X => {
    const P = shuffle(partners(X));
    for (let r = 0; r < 2; r++) {
      const p = P[r], q = P[r + 2];
      const right = X + FATHA + p + FATHA, swap = p + FATHA + X + FATHA, other = X + FATHA + q + FATHA;
      qs.push({ game: "Game 3 · Build it", prompt: `${SOUND[X]} + ${SOUND[p]} = ?`, promptAr: X + FATHA + "  +  " + p + FATHA, say: SOUND[X] + SOUND[p],
        answer: right, options: shuffle([right, swap, other]), wide: true });
    }
  });
  const mine = shuffle(WORDS.filter(w => members.some(X => w.includes(X)))).slice(0, 3);
  mine.forEach(w => {
    const others = shuffle(WORDS.filter(o => o !== w && say(o) !== say(w))).slice(0, 2);
    qs.push({ game: "Game 4 · Read the word", prompt: `Which word says  “${say(w)}”?`, say: say(w), answer: w, options: shuffle([w, ...others]), wide: true });
  });
  return qs;
}

(async () => {
  const plan = FAMILIES.map(([file, members]) => ({ file, members, qs: questions(members) }));
  const strings = ["Fathah Games", "Tap the right answer!", "▶  Start", "Great job!", "Next  ▶", "Oops!", "Look again and try one more time.", "↺  Try again", "You did it!", "↺  Play again"];
  plan.forEach(p => {
    strings.push(p.members.map(l => seat(l, FATHA) + FATHA).join("   "));
    p.qs.forEach(q => strings.push(q.game, q.prompt, q.say, ...q.options, ...(q.promptAr ? [q.promptAr] : [])));
    strings.push(`${p.qs.length} games won`);
  });
  M = await measure(strings.filter(Boolean));
  const outDir = process.argv[2] || ".";
  for (const { file, members, qs } of plan) {
    const pres = new pptxgen();
    pres.layout = "LAYOUT_16x9";
    pres.title = "Fathah Games " + file;
    // slide numbers: 1 title; question i at 2+3i, its "great" slide after it, its "try again" slide after that; then the end
    const qSlide = i => 2 + 3 * i, end = 2 + 3 * qs.length;
    titleSlide(pres.addSlide(), file, members, qSlide(0));
    qs.forEach((q, i) => {
      questionSlide(pres.addSlide(), q, i, qs.length, qSlide(i));
      rightSlide(pres.addSlide(), q, i, i + 1 < qs.length ? qSlide(i + 1) : end);
      wrongSlide(pres.addSlide(), i, qSlide(i));
    });
    endSlide(pres.addSlide(), qSlide(0), qs.length);
    await pres.writeFile({ fileName: `${outDir}/${file}.raw.pptx` });
    console.log(file, qs.length, "questions,", end, "slides");
  }
})().catch(e => { console.error(e); process.exit(1); });
