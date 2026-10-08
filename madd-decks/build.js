const pptxgen = require("pptxgenjs");
const MODE = process.env.MODE;                 // "alif" (big alif madd) or "dagger" (dagger alif)
const T = new pptxgen().ShapeType;
const FATHA = "\u064E", ALIF = "ا", SMALL = 0.65;   // small alif = 65% of letter size
const FONT = "Arial", INK = "16213E", BG = "1B2A5C";
const RING = ["E8604C", "3A8FD9", "2FB57A"];
let pres;

function arText(s, text, o) {
  s.addText(text, Object.assign({ fontFace: FONT, color: INK, align: "center", valign: "middle",
    margin: 0, isTextBox: true, rtlMode: true, lang: "ar-SA", fit: "none" }, o));
}
function deco(s) {
  const d = (shape, x, y, w, h, color, name, extra) =>
    s.addShape(shape, Object.assign({ x, y, w, h, fill: { color }, line: { color, width: 0 }, objectName: name }, extra || {}));
  // planet surfaces along the bottom
  d(T.ellipse, -1.2, 5.1, 5.2, 1.5, "5B4B9A", "Deco ground left");
  d(T.ellipse, 4.6, 5.2, 6.4, 1.5, "7A63C4", "Deco ground right");
  // stars along the top edge and lower corners
  [[0.5,1.25,0.2],[1.6,0.85,0.25],[2.5,0.3,0.3],[3.7,0.7,0.2],[5.2,0.25,0.25],[6.3,0.8,0.22],[7.4,0.35,0.28],[9.35,1.3,0.2],[1.9,4.6,0.22],[3.0,4.95,0.18],[7.0,4.9,0.2],[8.0,4.55,0.24]]
    .forEach(([x,y,z],i)=> d(T.star5, x, y, z, z, i%2 ? "FFFFFF" : "FFD23F", "Deco star "+(i+1)));
  // moon (top-left) and ringed planet (top-right)
  d(T.moon, 0.35, 0.3, 0.6, 0.9, "FFE48A", "Deco moon");
  d(T.ellipse, 8.55, 0.3, 0.85, 0.85, "FF8A5B", "Deco planet");
  s.addShape(T.ellipse, { x: 8.25, y: 0.58, w: 1.45, h: 0.3, fill: { color: "FFD23F", transparency: 100 },
    line: { color: "FFD23F", width: 3 }, objectName: "Deco planet ring" });
  // friendly alien (bottom-left) and rocket (bottom-right)
  d(T.smileyFace, 0.4, 4.45, 0.8, 0.8, "8ED98F", "Deco alien");
  d(T.triangle, 9.0, 3.95, 0.45, 0.35, "E8604C", "Deco rocket nose");
  d(T.roundRect, 9.0, 4.25, 0.45, 0.85, "FFFFFF", "Deco rocket body", { rectRadius: 0.08 });
  d(T.ellipse, 9.1, 4.45, 0.25, 0.25, "3A8FD9", "Deco rocket window");
  d(T.triangle, 9.05, 5.1, 0.35, 0.3, "FFB347", "Deco rocket flame", { rotate: 180 });
}


// each slide = list of units {l: letter, b: true if this letter carries the alif}
function drawSlides(SLIDES) {
  SLIDES.forEach((units) => {
    const s = pres.addSlide();
    s.background = { color: BG };
    deco(s);
    const n = units.length;
    const CY = 2.8;
    let g, cx = [];
    if (n === 1) g = { d: 3.4, fs: 130, rs: 0 };
    else if (n === 2) g = { d: 1.9, gap: 0.7, zone: 1.0, pw: 3.0, ph: 2.2, fs: MODE === "alif" ? 78 : 84, rs: 90, plus: 0.45, aw: 0.7 };
    else g = { d: 1.4, gap: 0.55, zone: 0.85, pw: 2.55, ph: 2.0, fs: MODE === "alif" ? 54 : 60, rs: 66, plus: 0.38, aw: 0.6 };
    if (n === 1) cx = [5 - g.d / 2];
    else {
      let right = n === 2 ? 9.25 : 9.35;
      for (let i = 0; i < n; i++) { cx.push(right - g.d); right = right - g.d - g.gap; }
    }
    const ringCol = i => n === 1 ? RING[1] : (n === 2 ? [RING[0], RING[2]][i] : RING[i]);
    units.forEach((u, i) => s.addShape(T.ellipse, { x: cx[i], y: CY - g.d / 2, w: g.d, h: g.d,
      fill: { color: "FFFFFF" }, line: { color: ringCol(i), width: n === 1 ? 10 : 8 }, objectName: `Circle ${i + 1}` }));
    let panelX = 0;
    if (n > 1) {
      const leftSrc = cx[n - 1];
      panelX = leftSrc - g.zone - g.pw;
      s.addShape(T.roundRect, { x: panelX, y: CY - g.ph / 2, w: g.pw, h: g.ph, rectRadius: 0.3,
        fill: { color: "FFFBE3" }, line: { color: "F2B134", width: 6 }, objectName: "Result panel" });
      for (let i = 0; i < n - 1; i++) {
        const mid = cx[i] - g.gap / 2;
        s.addShape(T.mathPlus, { x: mid - g.plus / 2, y: CY - g.plus / 2, w: g.plus, h: g.plus,
          fill: { color: "FFB347" }, line: { color: "FFB347", width: 0 }, objectName: `P${i + 1} plus` });
      }
      s.addShape(T.leftArrow, { x: leftSrc - g.zone / 2 - g.aw / 2, y: CY - 0.28, w: g.aw, h: 0.56,
        fill: { color: "FFD23F" }, line: { color: "FFD23F", width: 0 }, objectName: "A arrow" });
    }
    units.forEach((u, i) => {
      const l = u.l;
      const o = { x: cx[i], y: CY - g.d / 2, w: g.d, h: g.d, fontSize: g.fs };
      if (u.b) {                                  // letter sits right, alif is its own object on the left
        const big = MODE === "alif";
        const o1 = Object.assign({}, o, { x: cx[i] + (big ? 0.0046 : 0.0042) * g.fs });
        arText(s, l, Object.assign({ objectName: `L${i + 1} letter` }, o1));
        arText(s, l + FATHA, Object.assign({ objectName: `F${i + 1} fathah` }, o1));
        const af = big ? g.fs : SMALL * g.fs;   // small alif is drawn on the letter's baseline
        arText(s, ALIF, Object.assign({ objectName: `M${i + 1} alif` }, o,
          { x: cx[i] - (big ? 0.0078 : 0.0068) * g.fs, fontSize: af, y: o.y + (big ? 0 : 0.33 * (g.fs - af) / 72) }));
      } else {
        arText(s, l, Object.assign({ objectName: `L${i + 1} letter` }, o));
        arText(s, l + FATHA, Object.assign({ objectName: `F${i + 1} fathah` }, o));
      }
    });
    if (n > 1) {                                   // one joined text object; small alif is a smaller run inside it
      const runs = []; let acc = "";
      units.forEach(u => {
        acc += u.l + FATHA;
        if (u.b) {
          if (MODE === "alif") acc += ALIF;
          else { runs.push({ text: acc, options: {} }); runs.push({ text: ALIF, options: { fontSize: SMALL * g.rs } }); acc = ""; }
        }
      });
      if (acc) runs.push({ text: acc, options: {} });
      arText(s, MODE === "alif" ? runs.map(r => r.text).join("") : runs,
        { x: panelX, y: CY - g.ph / 2, w: g.pw, h: g.ph, fontSize: g.rs, objectName: "R result" });
    }
  });
}

// real fatha-only words; the letter right before "ا" carries the alif
const LEX = {
 "ب": { two: ["أبا","ربا","حبا","نبا","خبا","صبا"], three: ["كتبا","ذهبا","ضربا","طلبا","بارك","بادر","باشر"] },
 "ت": { two: ["أتا","عتا","شتا"], three: ["أتاك","سكتا","نبتا","ثبتا","تابع","تاجر"] },
 "ث": { two: ["حثا","عثا","رثا","ثار","ثاب"], three: ["بحثا","حدثا","نكثا","مكثا","ثابر"] },
 "ج": { two: ["نجا","رجا","هجا","جار","جاع","جاب"], three: ["خرجا","ولجا","جاهد","جالس","جادل","جاور"] },
 "ح": { two: ["صحا","محا","نحا","حال","حار","حاك"], three: ["فتحا","نجحا","ذبحا","حاول","حارب","حاسب"] },
 "خ": { two: ["أخا","سخا","خان","خاف","خاب","خاض"], three: ["نسخا","صرخا","طبخا","خالف","خاطب","خادع"] },
 "د": { two: ["بدا","غدا","عدا","يدا","دار","دام","دان"], three: ["سجدا","عبدا","وعدا","قصدا","دافع","داوم"] },
 "ذ": { two: ["هذا","كذا","ذاق","ذاب","ذاع"], three: ["أخذا","نبذا","ذاكر"] },
 "ر": { two: ["ذرا","سرا","راح","راق","رام"], three: ["نصرا","كسرا","ذكرا","راقب","راجع","رافق"] },
 "ز": { two: ["غزا","نزا","عزا","زار","زال","زاد"], three: ["عجزا","برزا","ركزا","زاحم","زارع","زاول"] },
 "س": { two: ["كسا","حسا","رسا","سار","ساق","ساد"], three: ["جلسا","لمسا","غرسا","سافر","ساعد","سابق"] },
 "ش": { two: ["شار","شاب","شاع","شاخ","شاق"], three: ["نقشا","فتشا","خدشا","شاهد","شارك","شاور"] },
 "ص": { two: ["عصا","صار","صاح","صام","صاب","صاد"], three: ["رقصا","نقصا","فحصا","صافح","صاحب","صادق"] },
 "ض": { two: ["نضا","ضار","ضاق","ضاع"], three: ["نهضا","قبضا","فرضا","ضارب","ضاعف","ضايق"] },
 "ط": { two: ["خطا","سطا","طار","طاف","طال","طاب"], three: ["سقطا","هبطا","ربطا","طالب","طابق","طاوع"] },
 "ظ": { two: [], three: ["وعظا","لحظا","غلظا","ظاهر"] },
 "ع": { two: ["دعا","عاد","عاش","عاب"], three: ["رجعا","قطعا","سمعا","عاهد","عالج","عامل"] },
 "غ": { two: ["لغا","غار","غاب","غاص"], three: ["بلغا","فرغا","صبغا","غالب","غادر","غامر"] },
 "ف": { two: ["عفا","صفا","فاز","فاض","فات"], three: ["كشفا","عرفا","وقفا","فاوض","فارق","فاتح"] },
 "ق": { two: ["رقا","قال","قام","قاد"], three: ["سرقا","خلقا","سبقا","قاتل","قابل","قاطع"] },
 "ك": { two: ["شكا","كان","كاد","كال"], three: ["تركا","ملكا","سلكا","كاتب","كاشف","كابر"] },
 "ل": { two: ["ألا","هلا","فلا","ولا","علا","خلا"], three: ["دخلا","نزلا","قتلا","أكلا","لاحظ","لاعب"] },
 "م": { two: ["سما","نما","مات","مال","ماج"], three: ["فهما","حكما","رسما","مارس","مازح","ماثل"] },
 "ن": { two: ["أنا","لنا","دنا","نام","نال","ناح"], three: ["سكنا","دفنا","خزنا","ناقش","ناول","نازع"] },
 "ه": { two: ["لها","سها","هار","هال","هاب","هام"], three: ["كرها","وجها","سفها","هاجر","هاجم","هاتف"] },
 "و": { two: [], three: ["دعوا","غزوا","وافق","واجه","واصل"] },
 "ي": { two: ["هيا"], three: ["رميا","بنيا","سقيا","بكيا","سعيا"] },
};
function parse(word, X, count) {
  const units = [];
  for (const ch of word) { if (ch === "ا") units[units.length - 1].b = true; else units.push({ l: ch, b: false }); }
  const bearing = units.filter(u => u.b);
  if (units.length !== count || bearing.length !== 1 || bearing[0].l !== X) throw new Error("bad word " + word + " for " + X);
  return units;
}
const FAMILIES = [
  ["01-ba-ta-tha", ["ب","ت","ث"]], ["02-noon-ya", ["ن","ي"]], ["03-jeem-ha-kha", ["ج","ح","خ"]],
  ["04-dal-dhal", ["د","ذ"]], ["05-ra-zay", ["ر","ز"]], ["06-seen-sheen", ["س","ش"]],
  ["07-sad-dad", ["ص","ض"]], ["08-ta-dha", ["ط","ظ"]], ["09-ain-ghain", ["ع","غ"]],
  ["10-fa-qaf", ["ف","ق"]], ["11-kaf", ["ك"]], ["12-lam", ["ل"]], ["13-meem", ["م"]],
  ["14-ha", ["ه"]], ["15-waw", ["و"]],
];
(async () => {
  for (const [file, members] of FAMILIES) {
    pres = new pptxgen();
    pres.layout = "LAYOUT_16x9";
    pres.title = "Arabic words with alif " + MODE + " " + file;
    const slides = [];
    members.forEach(X => { slides.push([{ l: X, b: true }]); LEX[X].two.forEach(w => slides.push(parse(w, X, 2))); });
    members.forEach(X => LEX[X].three.forEach(w => slides.push(parse(w, X, 3))));
    drawSlides(slides);
    await pres.writeFile({ fileName: file + ".raw.pptx" });
  }
})();
