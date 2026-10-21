// Madd decks (alif, waw, yaa, dagger alif), improved: same letter order and beginning/middle/end method as
// fathah-plus/ (every letter, with every earlier letter before / around / after it), plus sentences,
// a different background on every slide, and font sizes measured so every letter and mark stays inside its shape.
// No pictures. Sounds are added by ../fathah-plus/post.py on slide transitions only (no sound on click reveals).
// MODE=quran builds one file of Quranic words: madd letters, the dagger alif, the small waw / yaa and the madd sign,
// each word in mushaf spelling next to how it is read.
// usage: MODE=alif|waw|yaa|dagger|quran node build.js <outdir>
const pptxgen = require("pptxgenjs");
const measure = require("../fathah-plus/measure");
const T = new pptxgen().ShapeType;
const FATHA = "َ", KASRA = "ِ", DAMMA = "ُ";
// every sukun in these decks is the Quranic head-of-haa sukun (U+06E1 ۡ), not the round one (U+0652)
const FONT = process.env.MODE === "quran" ? "Traditional Arabic" : "Arial";   // the small Quranic letters need it
const INK = "16213E";
const RING = ["E8604C", "3A8FD9", "2FB57A", "8E5BD0"];   // source circles, right to left
const MADD_RING = "F59F00";                               // the madd letter's circle
const W = 10, H = 5.625;
const BAND_TOP = 0.95, BAND_BOTTOM = 4.7;                // decorations live only above / below these lines
const SMALL = 0.65;                                      // dagger alif = small alif, 65% of the letter size

const MODE = process.env.MODE;
const CFG = {
  // mark: the vowel before the madd letter (the rule: alif after fathah, waw after dammah, yaa after kasrah)
  alif:   { mark: FATHA, madd: "ا", title: "Madd with alif", hue: 70,
            note: "مدّ الألف: الألف الساكنة لا يكون ما قبلها إلا مفتوحاً، نحو «قَالَ». نمدّ الصوت بمقدار حركتين (بَ ← بَا). الألف لا تتصل بالحرف الذي بعدها." },
  waw:    { mark: DAMMA, madd: "و", title: "Madd with waw", hue: 160,
            note: "مدّ الواو: الواو الساكنة المضموم ما قبلها، نحو «يَقُولُ». نمدّ الصوت بمقدار حركتين (بُ ← بُو). الواو لا تتصل بالحرف الذي بعدها." },
  yaa:    { mark: KASRA, madd: "ي", title: "Madd with yaa", hue: 250,
            note: "مدّ الياء: الياء الساكنة المكسور ما قبلها، نحو «قِيلَ». نمدّ الصوت بمقدار حركتين (بِ ← بِي)." },
  dagger: { mark: FATHA, madd: "\u0670", small: true, title: "Dagger alif", hue: 320,
            note: "الألف الخنجرية (الألف الصغيرة): تُلفظ ولا تُكتب ألفاً كبيرة، ولها حكم الألف الكبيرة نفسه: نمدّ بمقدار حركتين، نحو «هٰذَا» (هَاذَا) و«الرَّحۡمٰنِ» (الرَّحۡمَانِ). كُتبت صغيرة بجانب الحرف." },
  quran:  { title: "Quran small letters", hue: 30 },
}[MODE];
if (!CFG) throw new Error("MODE must be alif, waw, yaa, dagger or quran");

// ---------- letters and slides (same method as fathah-plus) ----------
const FAMILIES = [
  ["01-alif", ["أ"]], ["02-ba-ta-tha", ["ب","ت","ث"]], ["03-noon-ya", ["ن","ي"]],
  ["04-jeem-ha-kha", ["ج","ح","خ"]], ["05-dal-dhal", ["د","ذ"]], ["06-ra-zay", ["ر","ز"]],
  ["07-seen-sheen", ["س","ش"]], ["08-sad-dad", ["ص","ض"]], ["09-ta-dha", ["ط","ظ"]],
  ["10-ain-ghain", ["ع","غ"]], ["11-fa-qaf", ["ف","ق"]], ["12-kaf", ["ك"]],
  ["13-lam", ["ل"]], ["14-meem", ["م"]], ["15-ha", ["ه"]], ["16-waw", ["و"]],
].filter(([f]) => !(f === "01-alif" && (MODE === "alif" || MODE === "dagger")) && MODE !== "quran");   // alif + madd alif is آ: taught apart
const ALPHA = ["أ","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه","و","ي"];
const partners = X => { const i = ALPHA.indexOf(X); return i >= 7 ? ALPHA.slice(0, i) : ALPHA.filter(l => l !== X).slice(0, 7); };
// a unit is one circle: { l: letter, m: its mark } or { madd: true }
const seat = (l, m) => (l === "أ" && m === KASRA ? "إ" : l);                 // alif with kasrah carries its hamza below
const bare = (l, m) => (l === "أ" && m === KASRA ? "ا" : l);
const L = (l, m) => ({ l, m, full: seat(l, m) + m, bare: bare(l, m) });
const MADD = { madd: true };
const slidesFor = X => {
  const P = partners(X), x = L(X, CFG.mark), out = [[x, MADD]];
  P.forEach(p => out.push([x, MADD, L(p, FATHA)]));                                     // beginning
  P.forEach((p, k) => out.push([L(p, FATHA), x, MADD, L(P[(k + 1) % P.length], FATHA)]));  // middle
  P.forEach(p => out.push([L(p, FATHA), x, MADD]));                                     // end
  return out;
};
// the joined word, as runs (the dagger alif is a smaller alif inside the word)
// the dagger alif is drawn as a small red alif BESIDE its letter (to the left), raised a little: a superscript "ا"
const DAGGER_RED = "E03131", SHOW = () => (CFG.small ? "ا" : CFG.madd);
// a new run every time (pptxgenjs changes the options it is given); 80% size, raised a little above the line
const dag = pt => ({ text: "ا", options: { color: DAGGER_RED, fontSize: Math.round(0.8 * pt), baseline: 250 } });
const redDagger = (t, pt) => !t.includes("\u0670") ? t : t.split(/(\u0670)/).filter(Boolean).map(p => (p === "\u0670" ? dag(pt) : { text: p, options: {} }));
function wordRuns(units, pt) {
  const runs = []; let acc = "";
  units.forEach(u => {
    if (!u.madd) { acc += u.full; return; }
    if (!CFG.small) { acc += CFG.madd; return; }
    runs.push({ text: acc, options: {} }); runs.push(dag(pt)); acc = "";
  });
  if (acc) runs.push({ text: acc, options: {} });
  return runs;
}
const wordText = units => units.map(u => (u.madd ? (CFG.small ? "ا" : CFG.madd) : u.full)).join("");   // the small alif takes room

// ---------- sentences: each has this file's madd and the file's letter ----------
// (madd letters carry no sukun, as in the mushaf; dagger-alif sentences are Quranic phrases written with ٰ)
const SENT = {
  alif: {
    "02-ba-ta-tha": ["بَابٌ وَاسِعٌ", "تَابَ وَعَادَ", "لَبِسَ ثِيَابًا"],
    "03-noon-ya": ["نَامَ وَلَدٌ", "نَارٌ وَدُخَانٌ", "يَا وَلَدُ"],
    "04-jeem-ha-kha": ["جَاءَ وَلَدٌ", "خَافَ وَهَرَبَ", "صَاحَ حَارِسٌ"],
    "05-dal-dhal": ["عَادَ وَلَدٌ", "ذَاقَ عَسَلًا", "دَارٌ وَاسِعَةٌ"],
    "06-ra-zay": ["زَارَ جَارًا", "رَاحَ وَعَادَ", "سَارَ رَجُلٌ"],
    "07-seen-sheen": ["سَالَ مَاءٌ", "شَاهَدَ قَمَرًا", "جَلَسَ سَالِمٌ"],
    "08-sad-dad": ["صَاحَ حَارِسٌ", "ضَاعَ قَلَمٌ", "صَامَ رَجُلٌ"],
    "09-ta-dha": ["طَارَ نَسۡرٌ", "طَابَ طَعَامٌ", "قَامَ حَافِظٌ"],
    "10-ain-ghain": ["غَابَ قَمَرٌ", "عَادَ غَانِمٌ", "سَارَ عَامِرٌ"],
    "11-fa-qaf": ["فَازَ وَلَدٌ", "قَالَ أَبٌ", "فَاتَ وَقۡتٌ"],
    "12-kaf": ["جَاءَ كَاتِبٌ", "كَانَ وَلَدًا", "كَادَ يَقَعُ"],
    "13-lam": ["لَاحَ قَمَرٌ", "قَالَ لَهُ", "سَالَ لَبَنٌ"],
    "14-meem": ["نَامَ مَازِنٌ", "مَاءٌ وَطَعَامٌ", "مَالٌ وَمَتَاعٌ"],
    "15-ha": ["هَاجَرَ أَبٌ", "شَاهَدَ هِلَالًا", "جَاءَ هَانِئٌ"],
    "16-waw": ["وَاحَةٌ وَمَاءٌ", "وَادٍ وَاسِعٌ", "وَصَلَ سَالِمٌ"],
  },
  waw: {
    "01-alif": ["أُوذِيَ وَصَبَرَ", "أُوتِيَ عِلۡمًا", "يَأۡكُلُونَ وَيَشۡرَبُونَ"],
    "02-ba-ta-tha": ["حُوتٌ وَسَمَكٌ", "تُوتٌ وَعِنَبٌ", "ثُومٌ وَبَصَلٌ"],
    "03-noon-ya": ["نُوحٌ وَهُودٌ", "يَقُولُ وَلَدٌ", "يَنُوبُ عَنۡهُ"],
    "04-jeem-ha-kha": ["جُوعٌ وَعَطَشٌ", "حُوتٌ يَسۡبَحُ", "يَخُوضُ بَحۡرًا"],
    "05-dal-dhal": ["يَعُودُ وَلَدٌ", "دُودٌ وَنَمۡلٌ", "يَذُوقُ عَسَلًا"],
    "06-ra-zay": ["يَزُورُ جَدَّهُ", "نُورٌ وَسُرُورٌ", "يَدُورُ دُولَابٌ"],
    "07-seen-sheen": ["سُورٌ عَالٍ", "يَصُومُ وَيَشۡكُرُ", "سُوقٌ وَبَائِعٌ"],
    "08-sad-dad": ["يَصُومُ وَيَقُومُ", "وُضُوءٌ وَصَلَاةٌ", "صُورَةٌ جَمِيلَةٌ"],
    "09-ta-dha": ["يَطُوفُ حَاجٌّ", "ظُهُورُ قَمَرٍ", "طُولٌ وَعَرۡضٌ"],
    "10-ain-ghain": ["يَعُودُ وَيَقُولُ", "يَغُوصُ غَوَّاصٌ", "عُودٌ وَبَخُورٌ"],
    "11-fa-qaf": ["فُولٌ وَخُبۡزٌ", "يَقُومُ وَيَقُولُ", "يَفُوزُ فَرِيقٌ"],
    "12-kaf": ["كُوبُ مَاءٍ", "كُوبٌ وَصَحۡنٌ", "يَكُونُ هُنَا"],
    "13-lam": ["طُولٌ وَعَرۡضٌ", "يَلُومُ نَفۡسَهُ", "يَقُولُ لَهُ"],
    "14-meem": ["يَمُوجُ بَحۡرٌ", "يَقُومُ رَجُلٌ", "ثُومٌ وَتُوتٌ"],
    "15-ha": ["هُودٌ وَنُوحٌ", "وُجُوهٌ مُشۡرِقَةٌ", "يَهُونُ أَمۡرٌ"],
    "16-waw": ["يَعُودُ وَيَزُورُ", "يَطُوفُ وَيَدۡعُو", "وُجُوهٌ وَعُيُونٌ"],
  },
  yaa: {
    "01-alif": ["رَجُلٌ أَمِينٌ", "إِيمَانٌ وَعَمَلٌ", "أَكَلَ تِينًا"],
    "02-ba-ta-tha": ["تِينٌ وَزَيۡتُونٌ", "بَعِيرٌ كَبِيرٌ", "حَدِيثٌ جَمِيلٌ"],
    "03-noon-ya": ["يَسِيرُ فِيلٌ", "طِينٌ وَتُرَابٌ", "دِينٌ وَإِيمَانٌ"],
    "04-jeem-ha-kha": ["رِيحٌ شَدِيدَةٌ", "وَجۡهٌ جَمِيلٌ", "طَبِيخٌ لَذِيذٌ"],
    "05-dal-dhal": ["دِيكٌ وَدَجَاجٌ", "طَعَامٌ لَذِيذٌ", "عِيدٌ سَعِيدٌ"],
    "06-ra-zay": ["رِيشٌ جَمِيلٌ", "مِيزَانٌ كَبِيرٌ", "رِيحٌ وَمَطَرٌ"],
    "07-seen-sheen": ["كِيسٌ كَبِيرٌ", "رِيشُ طَيۡرٍ", "يَسِيرُ سَعِيدٌ"],
    "08-sad-dad": ["صَدِيقٌ كَرِيمٌ", "طِفۡلٌ مَرِيضٌ", "صَغِيرٌ وَكَبِيرٌ"],
    "09-ta-dha": ["طَرِيقٌ طَوِيلٌ", "بَيۡتٌ نَظِيفٌ", "نَهۡرٌ عَظِيمٌ"],
    "10-ain-ghain": ["عِيدٌ سَعِيدٌ", "طِفۡلٌ صَغِيرٌ", "بَعِيرٌ عَطۡشَانُ"],
    "11-fa-qaf": ["فِيلٌ كَبِيرٌ", "قِيلَ لَهُ", "صَدِيقٌ وَفِيٌّ"],
    "12-kaf": ["صَاحَ دِيكٌ", "كَبِيرٌ وَصَغِيرٌ", "كِيسٌ ثَقِيلٌ"],
    "13-lam": ["لَوۡنٌ جَمِيلٌ", "رَجُلٌ نَبِيلٌ", "لَيۡلٌ طَوِيلٌ"],
    "14-meem": ["مِيزَانٌ دَقِيقٌ", "رَحِيمٌ كَرِيمٌ", "يَمِينٌ وَشِمَالٌ"],
    "15-ha": ["عَالِمٌ فَقِيهٌ", "شَهِيقٌ وَزَفِيرٌ", "هِيَ جَمِيلَةٌ"],
    "16-waw": ["نَهۡرٌ طَوِيلٌ", "حَيَوَانٌ أَلِيفٌ", "وَلَدٌ سَعِيدٌ"],
  },
};
const DAGGER = ["هٰذَا كِتَابٌ", "ذٰلِكَ خَيۡرٌ", "إِلٰهٌ وَاحِدٌ", "الرَّحۡمٰنِ الرَّحِيمِ"];
const sentencesFor = file => (MODE === "dagger" ? DAGGER : SENT[MODE][file]);
// checks: only taught marks; this file's madd is present (madd letter = the right vowel before it, no mark on it)
// ---------- Quranic words: [as written in the mushaf, as it is read, teacher note] ----------
const N_MADD = "حروف المد ثلاثة: الألف الساكنة ولا يكون ما قبلها إلا مفتوحاً، والواو الساكنة المضموم ما قبلها، والياء الساكنة المكسور ما قبلها. تُمد بمقدار حركتين.";
const N_DAG = "الألف الخنجرية بين الحروف: تُلفظ ألفاً مدية ولم تُكتب ألفاً كبيرة. لها حكم الألف الكبيرة: مد طبيعي بمقدار حركتين.";
const N_DAGWY = "الألف الخنجرية فوق الواو أو الياء: العبرة بالحرف الصغير المكتوب فوق. تُنطق ألفاً مدية، ولا تُنطق الواو ولا الياء.";
const N_WAW = "الواو الصغيرة بعد هاء الضمير المضمومة (صلة صغرى): تقع بين متحركين، فتُشبع الضمة واواً وتُمد حركتين في الوصل.";
const N_YAA = "الياء الصغيرة بعد هاء الضمير المكسورة (صلة صغرى): تقع بين متحركين، فتُشبع الكسرة ياءً وتُمد حركتين في الوصل.";
const N_NOSILA = "لا صلة إذا جاء بعد الهاء ساكن: لا تُكتب الواو ولا الياء الصغيرة ولا تُنطق، مثل «لَهُ ٱلۡمُلۡكُ». أما «إِنَّهُۥ لَا يُحِبُّ» فتُنطق الواو لأن اللام بعدها متحركة.";
const N_BIG = "الصلة الكبرى: إذا جاء بعد الواو أو الياء الصغيرة همزة قطع، توضع علامة المد (~) ويُمد 4 أو 5 حركات (من طريق الشاطبية)، كالمد المنفصل.";
const N_DAGMADD = "الألف الخنجرية تأخذ أحكام المد كالألف الكبيرة: إذا جاءت بعدها همزة في الكلمة نفسها فهو مد متصل (4 أو 5 حركات)، وإذا جاءت الهمزة في أول الكلمة التالية فهو مد منفصل (4 أو 5 حركات)، وتوضع فوقها علامة المد.";
const QURAN = [
  ["قَالَ", "قَا", N_MADD], ["السَّمَاوَاتِ", "مَا", N_MADD], ["يَقُولُ", "قُو", N_MADD], ["طُوبَىٰ", "طُو", N_MADD], ["قِيلَ", "قِي", N_MADD], ["ٱلرَّحِيمِ", "حِي", N_MADD],
  ["هَٰذَا", "هَاذَا", N_DAG], ["ٱلرَّحۡمَٰنِ", "الرَّحۡمَانِ", N_DAG], ["إِلَٰهَ", "إِلَاهَ", N_DAG], ["ذَٰلِكَ", "ذَالِكَ", N_DAG], ["لَٰكِنۡ", "لَاكِنۡ", N_DAG],
  ["ٱلصَّلَوٰةَ", "الصَّلَاةَ", N_DAGWY], ["ٱلزَّكَوٰةَ", "الزَّكَاةَ", N_DAGWY], ["ٱلۡحَيَوٰةُ", "الۡحَيَاةُ", N_DAGWY], ["عَلَىٰ", "عَلَا", N_DAGWY], ["مُوسَىٰ", "مُوسَا", N_DAGWY], ["ٱلۡهُدَىٰ", "الۡهُدَا", N_DAGWY],
  ["إِنَّهُۥ عَلِيمٌ", "إِنَّهُو عَلِيمٌ", N_WAW], ["إِنَّهُۥ لَا يُحِبُّ", "إِنَّهُو لَا يُحِبُّ", N_NOSILA],
  ["بِهِۦ بَصِيرًا", "بِهِي بَصِيرًا", N_YAA], ["وَقَلۡبِهِۦ وَجَعَلَ", "وَقَلۡبِهِي وَجَعَلَ", N_YAA],
  ["لَهُ ٱلۡمُلۡكُ", "لَهُلۡ مُلۡكُ", N_NOSILA], ["وَلَهُ ٱلۡحَمۡدُ", "وَلَهُلۡ حَمۡدُ", N_NOSILA],
  ["مَالَهُۥٓ أَخۡلَدَهُۥ", "مَالَهُووو أَخۡلَدَهُ", N_BIG], ["بِهِۦٓ أَن يُوصَلَ", "بِهِييي أَنۡ يُوصَلَ", N_BIG],
  ["يَٰٓأَيُّهَا", "يَااا أَيُّهَا", N_DAGMADD], ["هَٰٓأَنتُمۡ", "هَااا أَنۡتُمۡ", N_DAGMADD], ["أُولَٰٓئِكَ", "أُولَااائِكَ", N_DAGMADD],
];
const AFTER = { alif: /َا(?![ًٌٍَُِّۡ])/, waw: /ُو(?![ًٌٍَُِّۡ])/, yaa: /ِي(?![ًٌٍَُِّۡ])/, dagger: /ٰ/ }[MODE];
if (MODE !== "quran") FAMILIES.forEach(([file, members]) => sentencesFor(file).forEach(s => {
  if (!/^[ء-يً-ٰۡ ]+$/.test(s)) throw new Error("unexpected character in " + s);
  if (!AFTER.test(s)) throw new Error("no " + MODE + " madd in " + s);
  if (MODE !== "dagger" && !members.some(l => s.includes(l) || (l === "أ" && /[إأ]/.test(s)))) throw new Error(file + ": letter missing in " + s);
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
// Arial has no Quranic marks (the head-of-khaa sukun ۡ and the other small signs): text with them uses Traditional Arabic
const QURANIC = /[\u06D6-\u06ED]/;
function arText(s, text, o) {
  const raw = typeof text === "string" ? text : text.map(r => r.text).join("");
  s.addText(text, Object.assign({ fontFace: QURANIC.test(raw) ? "Traditional Arabic" : FONT, color: INK, align: "center", valign: "middle",
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

function maddSlide(s, units, th) {
  const n = units.length, CY = 2.8;
  const G = {
    2: { d: 1.9, gap: 0.7, zone: 1.0, pw: 3.0, ph: 2.2, fs: 96, rs: 110, plus: 0.45, aw: 0.7, right: 9.25 },
    3: { d: 1.45, gap: 0.5, zone: 0.85, pw: 2.65, ph: 2.0, fs: 72, rs: 90, plus: 0.36, aw: 0.6, right: 9.4 },
    4: { d: 1.32, gap: 0.3, zone: 0.62, pw: 2.4, ph: 1.8, fs: 66, rs: 80, plus: 0.26, aw: 0.46, right: 9.62 },
  }[n];
  const cx = []; let right = G.right;
  for (let i = 0; i < n; i++) { cx.push(right - G.d); right -= G.d + G.gap; }
  // each circle gets the largest size that fits, centred; the madd circle shows the madd letter (smaller for the dagger alif)
  const fit = units.map(u => centred(u.madd ? SHOW() : u.full, u.madd ? 2 * G.fs : G.fs, inCircle(G.d, u.madd ? 10 : 8)));
  const lpt = Math.min(...fit.filter((f, i) => !units[i].madd).map(f => f.pt));     // letters share one size
  units.forEach((u, i) => { if (!u.madd) fit[i] = centred(u.full, lpt, inCircle(G.d, 8)); });
  if (CFG.small) units.forEach((u, i) => { if (u.madd) fit[i] = centred("ا", Math.round(0.8 * lpt), inCircle(G.d, 10)); });
  else units.forEach((u, i) => { if (u.madd) fit[i] = centred(CFG.madd, Math.min(fit[i].pt, Math.round(lpt * 1.15)), inCircle(G.d, 10)); });
  const word = wordText(units), rf = centred(word, G.rs, inRect(G.pw, G.ph, 0.22)), rpt = rf.pt;
  units.forEach((u, i) => shape(s, T.ellipse, { x: cx[i], y: CY - G.d / 2, w: G.d, h: G.d, fill: { color: "FFFFFF" },
    line: { color: u.madd ? MADD_RING : RING[i % RING.length], width: u.madd ? 10 : 8 } }, `Circle ${i + 1}`));
  const leftSrc = cx[n - 1], panelX = leftSrc - G.zone - G.pw;
  shape(s, T.roundRect, { x: panelX, y: CY - G.ph / 2, w: G.pw, h: G.ph, rectRadius: 0.3,
    fill: { color: "FFFBE3" }, line: { color: "F2B134", width: 6 } }, "Result panel");
  let k = 1;
  units.forEach((u, i) => {
    const o = { x: cx[i], y: CY - G.d / 2 + fit[i].dy, w: G.d, h: G.d, fontSize: fit[i].pt };
    if (u.madd) {
      // the stretch: an arrow over the madd circle comes with the madd letter
      const kk = k++;
      arText(s, CFG.small ? [{ text: "ا", options: { color: DAGGER_RED } }] : CFG.madd, Object.assign({}, o, { objectName: `C${kk} M${i + 1} madd` }));
      shape(s, T.leftRightArrow, { x: cx[i] + G.d / 2 - 0.32, y: CY - G.d / 2 - 0.36, w: 0.64, h: 0.28,
        fill: { color: MADD_RING }, line: { width: 0 } }, `C${kk} S${i + 1} stretch`);
    } else {
      arText(s, u.bare, Object.assign({ objectName: `C${k++} L${i + 1} letter` }, o));
      arText(s, u.full, Object.assign({ objectName: `C${k++} V${i + 1} vowel` }, o));
    }
    if (i < n - 1) {
      const mid = cx[i] - G.gap / 2;
      shape(s, T.mathPlus, { x: mid - G.plus / 2, y: CY - G.plus / 2, w: G.plus, h: G.plus,
        fill: { color: hsl(th.hue + 180, 0.7, 0.5) }, line: { width: 0 } }, `C${k++} P${i + 1} plus`);
    }
  });
  shape(s, T.leftArrow, { x: leftSrc - G.zone / 2 - G.aw / 2, y: CY - 0.28, w: G.aw, h: 0.56,
    fill: { color: hsl(th.hue + 220, 0.6, 0.45) }, line: { width: 0 } }, `C${k++} A arrow`);
  arText(s, CFG.small ? wordRuns(units, rpt) : word, { x: panelX, y: CY - G.ph / 2 + rf.dy, w: G.pw, h: G.ph, fontSize: rpt, objectName: `C${k++} R result` });
  s.addNotes(CFG.note);
}

// a Quranic word as written (right) and as it is read (left)
function quranSlide(s, [written, read, note], th) {
  const PW = 3.9, PH = 2.3, PY = 1.6;
  const a = centred(written, 110, inRect(PW, PH, 0.25)), b = centred(read, 110, inRect(PW, PH, 0.25));
  const pt = Math.min(a.pt, b.pt);
  const A = centred(written, pt, inRect(PW, PH, 0.25)), B = centred(read, pt, inRect(PW, PH, 0.25));
  shape(s, T.roundRect, { x: 5.6, y: PY, w: PW, h: PH, rectRadius: 0.3, fill: { color: "FFFFFF" }, line: { color: "2F9E44", width: 8 } }, "Panel written");
  shape(s, T.roundRect, { x: 0.5, y: PY, w: PW, h: PH, rectRadius: 0.3, fill: { color: "FFFBE3" }, line: { color: "F2B134", width: 8 } }, "Panel read");
  arText(s, written, { x: 5.6, y: PY + A.dy, w: PW, h: PH, fontSize: A.pt, objectName: "C1 W written" });
  shape(s, T.leftArrow, { x: 4.6, y: PY + PH / 2 - 0.3, w: 0.8, h: 0.6, fill: { color: hsl(th.hue + 220, 0.6, 0.45) }, line: { width: 0 } }, "C2 A arrow");
  arText(s, read, { x: 0.5, y: PY + B.dy, w: PW, h: PH, fontSize: B.pt, objectName: "C3 R read" });
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
    arText(s, CFG.small ? redDagger(w, pt) : w, { x, y: PY, w: pw, h: PH, fontSize: pt, objectName: `C${i + 1} W${i + 1} word` });
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
  arText(s, CFG.small ? redDagger(sentence, spt) : sentence, { x: 5 - sw / 2, y: SY, w: sw, h: SH, fontSize: spt, objectName: `C${n} S sentence` });
}

(async () => {
  const plan = MODE === "quran" ? [{ file: "Quran-Small-Letters", slides: QURAN.map(q => ({ quran: q })) }] : FAMILIES.map(([file, members]) => {
    const slides = [];
    members.forEach(X => slidesFor(X).forEach(u => slides.push({ units: u })));
    sentencesFor(file).forEach(sen => slides.push({ sentence: sen }));
    return { file, slides };
  });
  const strings = MODE === "quran" ? QURAN.flatMap(q => [q[0], q[1]]) : [CFG.madd, "ـ" + CFG.madd, "ا"];
  plan.forEach(p => p.slides.forEach(sl => {
    if (sl.quran) return;
    if (sl.units) { sl.units.forEach(u => u.madd || strings.push(u.full, u.bare)); strings.push(wordText(sl.units)); }
    else { strings.push(sl.sentence); sl.sentence.split(" ").forEach(w => strings.push(w)); }
  }));
  M = await measure(strings);
  const outDir = process.argv[2] || ".";
  for (const [deckNo, { file, slides }] of plan.entries()) {
    const pres = new pptxgen();
    pres.layout = "LAYOUT_16x9";
    pres.title = CFG.title + " " + file;
    used.clear();
    slides.forEach((sl, i) => {
      const s = pres.addSlide(), th = background(deckNo + CFG.hue, i);
      s.background = { color: th.bg };
      content = []; deco = [];
      scenery(s, th);
      if (sl.quran) quranSlide(s, sl.quran, th);
      else if (sl.units) maddSlide(s, sl.units, th); else { sentenceSlide(s, sl.sentence, th); s.addNotes(CFG.note); }
      checkOverlap(`${file} slide ${i + 1}`);
    });
    await pres.writeFile({ fileName: `${outDir}/${file}.raw.pptx` });
    console.log(MODE, file, slides.length, "slides");
  }
})().catch(e => { console.error(e); process.exit(1); });
