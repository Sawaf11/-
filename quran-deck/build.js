const pptxgen = require("pptxgenjs");
const { applyTheme } = require(process.env.SKILL_DIR + "/scripts/apply_theme.js");

const THEME = { name: "Quran Kids", headFontFace: "Cambria", bodyFontFace: "Calibri",
  colors: { dk1:"12352E", lt1:"FFFFFF", dk2:"0B5D4B", lt2:"E6F4EE", accent1:"0B5D4B", accent2:"F2B134",
    accent3:"E8604C", accent4:"3A8FD9", accent5:"8E5BD0", accent6:"2FB57A", hlink:"3A8FD9", folHlink:"8E5BD0" } };
const AR = "Arial";
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Learn to Read the Quran: Arabic Letters";
const C = pres.SchemeColor;
const CARD = [C.accent3, C.accent4, C.accent2, C.accent5, C.accent6];
const HEX = { dk:"12352E" };

pres.defineSlideMaster({ title: "LIGHT", background: { color: C.background2 },
  slideNumber: { x: 9.2, y: 5.2, w: 0.5, h: 0.3, fontSize: 10, color: C.text1 } });
pres.defineSlideMaster({ title: "DARK", background: { color: C.accent1 } });

function addMasterTitle(s, text) {
  s.addText(text, { x: 0.5, y: 0.35, w: 9, h: 0.7, fontSize: 36, bold: true, color: C.text1, fontFace: THEME.headFontFace, margin: 0, isTextBox: true, objectName: "Title" });
}

// 1. Title
let s = pres.addSlide({ masterName: "DARK" });
s.addShape(pres.ShapeType.ellipse, { x: 6.3, y: 0.7, w: 3.3, h: 3.3, fill: { color: C.accent2 }, objectName: "!!Moon" });
s.addText("ق", { x: 6.3, y: 0.7, w: 3.3, h: 3.3, fontSize: 150, bold: true, color: C.accent1, fontFace: AR, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "!!Letter" });
s.addText("Let's Read the Quran!", { x: 0.6, y: 1.2, w: 5.4, h: 1.6, fontSize: 44, bold: true, color: C.background1, fontFace: THEME.headFontFace, margin: 0, valign: "top", isTextBox: true, objectName: "Title" });
s.addText("Adventure 1: The Arabic Letters", { x: 0.6, y: 3.0, w: 5.4, h: 0.5, fontSize: 20, color: C.accent2, margin: 0, isTextBox: true });
s.addText("Bismillah, let's begin!", { x: 0.6, y: 4.5, w: 5.4, h: 0.4, fontSize: 16, italic: true, color: C.background2, margin: 0, isTextBox: true });
s.addNotes("Welcome the children. Start by saying Bismillah together. Explain that the Quran is written in Arabic and today they will learn the letters it is made of. Press the arrow key to see the letter move to the next slide (Morph transition).");

// 2. How we learn
s = pres.addSlide({ masterName: "LIGHT" });
addMasterTitle(s, "How We Learn Each Letter");
const steps = [["1","Look","See the big letter"],["2","Listen","Hear its name and sound"],["3","Say","Say it out loud together"],["4","Find","Spot it in the word"]];
steps.forEach((t,i)=>{
  const x = 0.5 + i*2.3;
  s.addShape(pres.ShapeType.roundRect, { x, y: 1.5, w: 2.1, h: 2.8, fill:{color:C.background1}, rectRadius:0.2, shadow:{type:"outer",color:"000000",opacity:0.15,blur:6,offset:2,angle:90}, objectName:"Card "+t[1] });
  s.addShape(pres.ShapeType.ellipse, { x: x+0.55, y: 1.75, w: 1.0, h: 1.0, fill:{color:CARD[i]}, objectName:"Badge "+t[1] });
  s.addText(t[0], { x: x+0.55, y: 1.75, w: 1.0, h: 1.0, fontSize: 36, bold:true, color:C.background1, align:"center", valign:"middle", margin:0, isTextBox:true });
  s.addText(t[1], { x, y: 2.95, w: 2.1, h: 0.5, fontSize: 24, bold:true, color:C.text1, align:"center", margin:0, isTextBox:true });
  s.addText(t[2], { x: x+0.15, y: 3.45, w: 1.8, h: 0.7, fontSize: 14, color:C.text1, align:"center", margin:0, valign:"top", isTextBox:true });
});
s.addText("Remember: Arabic is read from RIGHT to LEFT!", { x: 0.5, y: 4.6, w: 9, h: 0.5, fontSize: 18, bold:true, color:C.accent3, margin:0, isTextBox:true });
s.addNotes("Use the same four steps for every letter so children know what to expect. Point out that Arabic, like the Quran, is read from right to left.");

// Letters: [char, name, sound, word, meaning]
const L = [
["ا","Alif","a","أَسَد","lion"],["ب","Ba","b","بَطَّة","duck"],["ت","Ta","t","تُفَّاح","apple"],["ث","Tha","th (think)","ثَعْلَب","fox"],
["ج","Jeem","j","جَمَل","camel"],["ح","Ha","h (breathy)","حِصَان","horse"],["خ","Kha","kh","خَرُوف","sheep"],["د","Dal","d","دُبّ","bear"],
["ذ","Thal","th (this)","ذُرَة","corn"],["ر","Ra","r","رُمَّان","pomegranate"],["ز","Zay","z","زَرَافَة","giraffe"],["س","Seen","s","سَمَكَة","fish"],
["ش","Sheen","sh","شَمْس","sun"],["ص","Sad","s (heavy)","صَقْر","falcon"],["ض","Dad","d (heavy)","ضِفْدَع","frog"],["ط","Ta","t (heavy)","طَائِر","bird"],
["ظ","Dha","dh (heavy)","ظَرْف","envelope"],["ع","Ain","'a (from throat)","عِنَب","grapes"],["غ","Ghain","gh","غَيْمَة","cloud"],["ف","Fa","f","فِيل","elephant"],
["ق","Qaf","q (deep k)","قَمَر","moon"],["ك","Kaf","k","كَلْب","dog"],["ل","Lam","l","لَيْمُون","lemon"],["م","Meem","m","مَوْز","banana"],
["ن","Noon","n","نَجْمَة","star"],["ه","Ha","h (soft)","هِلَال","crescent"],["و","Waw","w","وَرْدَة","rose"],["ي","Ya","y","يَد","hand"]];

// 3. Alphabet overview (grid, letters named so they morph into letter slides? keep simple)
s = pres.addSlide({ masterName: "LIGHT" });
addMasterTitle(s, "28 Letters, One Beautiful Book");
const cols = 7, cw = 1.2, ch = 0.82, gx = 0.1, gy = 0.1, x0 = (10 - (cols*cw + (cols-1)*gx))/2;
// RTL order: first letter at the right
L.forEach((l,i)=>{
  const r = Math.floor(i/cols), c = i%cols;
  const x = x0 + (cols-1-c)*(cw+gx), y = 1.3 + r*(ch+gy);
  s.addShape(pres.ShapeType.roundRect, { x, y, w: cw, h: ch, fill:{color:CARD[i%5]}, rectRadius:0.15, objectName:"Tile "+l[1]+i });
  s.addText(l[0], { x, y, w: cw, h: ch, fontSize: 36, bold:true, color:C.background1, fontFace:AR, align:"center", valign:"middle", margin:0, isTextBox:true });
});
s.addNotes("Show all 28 letters. Read the first row from right to left. Ask: which letters do you already know?");

// 4. Letter slides — morph between them
L.forEach((l,i)=>{
  s = pres.addSlide({ masterName: "LIGHT" });
  const right = i%2===0;                       // swap sides so Morph slides the card across
  const cx = right ? 5.6 : 0.5, tx = right ? 0.5 : 5.2;
  const col = CARD[i%5];
  s.addShape(pres.ShapeType.roundRect, { x: cx, y: 0.6, w: 3.9, h: 4.2, fill:{color:col}, rectRadius:0.3, objectName:"!!LetterCard" });
  s.addText(l[0], { x: cx, y: 0.6, w: 3.9, h: 4.2, fontSize: 170, bold:true, color:C.background1, fontFace:AR, align:"center", valign:"middle", margin:0, isTextBox:true, objectName:"!!Letter" });
  s.addText(l[1], { x: tx, y: 0.7, w: 3.9, h: 0.9, fontSize: 48, bold:true, color:C.text1, fontFace:THEME.headFontFace, margin:0, isTextBox:true, objectName:"!!Name" });
  s.addText([{text:"Sounds like: ", options:{color:C.text1}},{text:l[2], options:{bold:true,color:col}}], { x: tx, y: 1.65, w: 3.9, h: 0.5, fontSize: 22, margin:0, isTextBox:true, objectName:"!!Sound" });
  s.addShape(pres.ShapeType.roundRect, { x: tx, y: 2.5, w: 3.9, h: 2.3, fill:{color:C.background1}, rectRadius:0.2, shadow:{type:"outer",color:"000000",opacity:0.15,blur:6,offset:2,angle:90}, objectName:"!!WordCard" });
  s.addText(l[3], { x: tx, y: 2.65, w: 3.9, h: 1.2, fontSize: 54, bold:true, color:C.text1, fontFace:AR, align:"center", valign:"middle", margin:0, isTextBox:true, objectName:"!!Word" });
  s.addText(l[4], { x: tx, y: 3.9, w: 3.9, h: 0.6, fontSize: 24, color:col, bold:true, align:"center", margin:0, isTextBox:true, objectName:"!!Meaning" });
  s.addNotes(`Letter ${i+1} of 28: ${l[1]}. Say the name, then the sound, then the example word ${l[4]}. Have the children repeat it three times.`);
});

// 5. Short vowels
const V = [["بَ","ba","Fatha","a small slash ABOVE the letter makes an 'a' sound"],["بِ","bi","Kasra","a small slash BELOW the letter makes an 'i' sound"],["بُ","bu","Damma","a little loop ABOVE the letter makes a 'u' sound"]];
s = pres.addSlide({ masterName: "DARK" });
s.addText("Little Marks, Big Sounds", { x: 0.5, y: 0.4, w: 9, h: 0.8, fontSize: 40, bold:true, color:C.background1, fontFace:THEME.headFontFace, margin:0, isTextBox:true });
s.addText("Tiny marks tell us how to say a letter. Let's try them on Ba.", { x: 0.5, y: 1.2, w: 9, h: 0.5, fontSize: 18, color:C.accent2, margin:0, isTextBox:true });
s.addNotes("Introduce the three short vowels. Overview slide, then one slide for each.");
V.forEach((v,i)=>{
  s.addShape(pres.ShapeType.roundRect, { x: 0.5+i*3.1, y: 2.0, w: 2.8, h: 2.8, fill:{color:C.background1}, rectRadius:0.2, objectName:"!!VowelCard"+i });
  s.addText(v[0], { x: 0.5+i*3.1, y: 2.1, w: 2.8, h: 1.7, fontSize: 90, bold:true, color:CARD[i], fontFace:AR, align:"center", valign:"middle", margin:0, isTextBox:true, objectName:"!!Vowel"+i });
  s.addText(v[1], { x: 0.5+i*3.1, y: 3.85, w: 2.8, h: 0.5, fontSize: 28, bold:true, color:C.text1, align:"center", margin:0, isTextBox:true });
  s.addText(v[2], { x: 0.5+i*3.1, y: 4.3, w: 2.8, h: 0.4, fontSize: 16, color:C.text1, align:"center", margin:0, isTextBox:true });
});
V.forEach((v,i)=>{
  const sl = pres.addSlide({ masterName: "LIGHT" });
  sl.addShape(pres.ShapeType.roundRect, { x: i%2?5.6:0.5, y: 0.6, w: 3.9, h: 4.2, fill:{color:CARD[i]}, rectRadius:0.3, objectName:"!!VowelCard"+i });
  sl.addText(v[0], { x: i%2?5.6:0.5, y: 0.6, w: 3.9, h: 4.2, fontSize: 150, bold:true, color:C.background1, fontFace:AR, align:"center", valign:"middle", margin:0, isTextBox:true, objectName:"!!Vowel"+i });
  const tx = i%2?0.5:5.2;
  sl.addText(v[2], { x: tx, y: 0.7, w: 3.9, h: 0.9, fontSize: 44, bold:true, color:C.text1, fontFace:THEME.headFontFace, margin:0, isTextBox:true });
  sl.addText("Says: "+v[1], { x: tx, y: 1.65, w: 3.9, h: 0.5, fontSize: 24, bold:true, color:CARD[i], margin:0, isTextBox:true });
  sl.addText("Look: "+v[3], { x: tx, y: 2.5, w: 3.9, h: 1.2, fontSize: 20, color:C.text1, margin:0, valign:"top", isTextBox:true });
  sl.addNotes(`Say "${v[1]}" slowly. Try it with other letters: ta, tha, ja…`);
});

// Quiz + celebration
s = pres.addSlide({ masterName: "LIGHT" });
addMasterTitle(s, "Mystery Letter Game");
const Q = [["ب","Which letter says 'b' like in duck?"],["م","Which letter says 'm' like in moon?"],["ن","Which letter says 'n' like in star?"]];
Q.forEach((q,i)=>{
  s.addShape(pres.ShapeType.ellipse, { x: 0.8+i*3.0, y: 1.5, w: 1.6, h: 1.6, fill:{color:CARD[i]}, objectName:"Bubble"+i });
  s.addText("?", { x: 0.8+i*3.0, y: 1.5, w: 1.6, h: 1.6, fontSize: 64, bold:true, color:C.background1, align:"center", valign:"middle", margin:0, isTextBox:true });
  s.addText(q[1], { x: 0.5+i*3.0, y: 3.3, w: 2.3, h: 1.0, fontSize: 16, color:C.text1, align:"center", valign:"top", margin:0, isTextBox:true });
});
s.addNotes("Read each question aloud and let the children shout the answer before showing it. Answers: Ba, Meem, Noon.");

s = pres.addSlide({ masterName: "DARK" });
s.addShape(pres.ShapeType.ellipse, { x: 6.3, y: 0.7, w: 3.3, h: 3.3, fill:{color:C.accent2}, objectName:"!!Moon" });
s.addText("ما شاء الله", { x: 6.3, y: 0.7, w: 3.3, h: 3.3, fontSize: 44, bold:true, color:C.accent1, fontFace:AR, align:"center", valign:"middle", margin:0, isTextBox:true, objectName:"!!Letter" });
s.addText("MashaAllah, Superstars!", { x: 0.6, y: 1.2, w: 5.4, h: 1.6, fontSize: 42, bold:true, color:C.background1, fontFace:THEME.headFontFace, margin:0, valign:"top", isTextBox:true, objectName:"Title" });
s.addText("You learned all 28 letters and 3 vowels. Next adventure: joining letters into words!", { x: 0.6, y: 3.0, w: 5.4, h: 1.2, fontSize: 18, color:C.accent2, margin:0, valign:"top", isTextBox:true });
s.addNotes("Celebrate! Hand out stickers. Review a few favourite letters before ending.");

(async()=>{
  await pres.writeFile({ fileName: "Quran-Reading-Letters.pptx" });
  await applyTheme("Quran-Reading-Letters.pptx", THEME);
})();
