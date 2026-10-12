// Interactive Tajweed lesson deck generator (one rule = one deck).
// Usage: node build.js rule.js out.pptx   -> writes out.pptx and out.links.json (for post.py)
const pptxgen = require("pptxgenjs");
const fs = require("fs"), path = require("path");
const React = require("react"), RDS = require("react-dom/server"), sharp = require("sharp");
const fa = require("react-icons/fa"), gi = require("react-icons/gi");

const R = require(path.resolve(process.argv[2]));
const OUT = process.argv[3];
const P = R.palette;                         // per-rule accent colours, shared design system
const AR = "Traditional Arabic", LAT = "Calibri";
const W = 13.333, H = 7.5;

// ---------- assets ----------
async function icon(name, color, set) {
  const Comp = (set === "gi" ? gi : fa)[name];
  const svg = RDS.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: 256 }));
  return "image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");
}
async function wave(color, w = 900, h = 220) {   // the "nasal wave" motif from the lesson cards
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 900 220">
  <path d="M10 110 H150 C175 110 185 20 215 20 C250 20 245 200 285 200 C320 200 320 45 355 45 C390 45 385 165 420 165 C450 165 450 85 480 85 C500 85 505 110 530 110 H860"
   fill="none" stroke="#${color}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="860" cy="110" r="22" fill="#${color}"/></svg>`;
  return "image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");
}

// ---------- deck plan: keys -> slide numbers (hidden feedback slides sit right after their question) ----------
const plan = R.slides.map(s => s.key);
const mainKeys = R.slides.filter(s => !s.hidden).map(s => s.key);
const num = k => { const i = plan.indexOf(k); if (i < 0) throw new Error("unknown slide key " + k); return i + 1; };
const links = {};                            // objectName -> target slide number

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.title = R.title; pres.subject = "Tajweed lesson"; pres.author = R.series;
  pres.theme = { headFontFace: LAT, bodyFontFace: LAT };
  const I = {
    home: await icon("FaHome", "FFFFFF"), menu: await icon("FaThLarge", P.primary),
    check: await icon("FaCheck", "FFFFFF"), times: await icon("FaTimes", "FFFFFF"), redo: await icon("FaRedoAlt", "FFFFFF"),
    star: await icon("FaStar", P.gold), bulb: await icon("FaLightbulb", "FFFFFF"), search: await icon("FaSearch", "FFFFFF"),
    mic: await icon("FaMicrophoneAlt", "FFFFFF"), teach: await icon("FaChalkboardTeacher", "FFFFFF"), nose: await icon("GiNoseSide", "FFFFFF", "gi"),
    eye: await icon("FaEye", "FFFFFF"), book: await icon("FaBookOpen", "FFFFFF"), users: await icon("FaUserFriends", "FFFFFF"),
    flag: await icon("FaFlagCheckered", "FFFFFF"), bolt: await icon("FaBolt", "FFFFFF"), heart: await icon("FaHeart", "FFFFFF"),
    play: await icon("FaPlay", "FFFFFF"), ear: await icon("FaAssistiveListeningSystems", "FFFFFF"),
  };
  const WAVE = await wave(P.primary), WAVE_GOLD = await wave(P.gold), WAVE_SOFT = await wave(P.soft2);

  pres.defineSlideMaster({ title: "LESSON_LIGHT", background: { color: P.bg },
    objects: [{ placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.72, w: 9.9, h: 0.8, fontFace: LAT, fontSize: 36, bold: true, color: P.ink, margin: 0, valign: "top", align: "left" }, text: "" } }] });
  pres.defineSlideMaster({ title: "LESSON_DARK", background: { color: P.dark } });
  pres.defineSlideMaster({ title: "FEEDBACK_GOOD", background: { color: P.goodBg } });
  pres.defineSlideMaster({ title: "FEEDBACK_TRY", background: { color: P.tryBg } });

  // ---------- primitives ----------
  let nameSeq = 0;
  const nm = (base, target) => { const n = `${base} ${++nameSeq}` + (target ? ` LINK:${target}` : ""); if (target) links[n] = num(target); return n; };
  const tx = (s, text, o) => s.addText(text, Object.assign({ fontFace: LAT, fontSize: 24, color: P.ink, margin: 0, valign: "top", isTextBox: true, fit: "none" }, o, { objectName: nm(o.objectName || "Text") }));
  const ar = (s, text, o) => s.addText(text, Object.assign({ fontFace: AR, fontSize: 60, color: P.ink, align: "center", valign: "middle", margin: 0,
    rtlMode: true, lang: "ar-SA", isTextBox: true, fit: "none" }, o, { objectName: nm(o.objectName || "Arabic") }));
  const card = (s, x, y, w, h, o = {}) => s.addShape("roundRect", { x, y, w, h, rectRadius: 0.18, fill: { color: o.fill || "FFFFFF" },
    line: { color: o.line || P.cardLine, width: o.lw || 1 }, shadow: o.noShadow ? undefined : { type: "outer", color: "0F3D3A", opacity: 0.10, blur: 8, offset: 2, angle: 90 }, objectName: nm(o.name || "Card") });
  const dot = (s, x, y, d, color, img, name) => {
    s.addShape("ellipse", { x, y, w: d, h: d, fill: { color }, line: { color, width: 0 }, objectName: nm((name || "Icon") + " circle") });
    if (img) s.addImage({ data: img, x: x + d * 0.25, y: y + d * 0.25, w: d * 0.5, h: d * 0.5, objectName: nm((name || "Icon") + " glyph") });
  };
  // a clickable button = one shape with its own text (whole area clickable) + optional icon (also linked)
  const button = (s, label, x, y, w, h, target, o = {}) => {
    const fill = o.fill || P.primary, color = o.color || "FFFFFF";
    s.addText(label, { shape: "roundRect", rectRadius: Math.min(h / 2, 0.22), x, y, w, h, fill: { color: fill },
      line: { color: o.line || fill, width: o.line ? 1.5 : 0 }, fontFace: o.ar ? AR : LAT, fontSize: o.fs || 18, bold: o.bold !== false, color,
      align: o.align || "center", valign: "middle", margin: (o.margin || [0.12, 0.12, 0, 0]).map(v => v * 72),   // [l, r, b, t] in inches -> points rtlMode: !!o.ar, lang: o.ar ? "ar-SA" : undefined,
      objectName: nm(o.name || "Button " + label.toString().slice(0, 20).replace(/[^\w ]/g, ""), target),
      shadow: o.flat ? undefined : { type: "outer", color: "0F3D3A", opacity: 0.18, blur: 4, offset: 2, angle: 90 } });
    if (o.icon) s.addImage({ data: o.icon, x: x + (o.ix != null ? o.ix : 0.2), y: y + (h - o.isz) / 2, w: o.isz, h: o.isz, objectName: nm("Button icon", target) });
  };
  const kicker = (s, text, color) => tx(s, text, { x: 0.6, y: 0.36, w: 8, h: 0.32, fontSize: 14, bold: true, color: color || P.primary, charSpacing: 3, objectName: "Kicker" });
  const chip = (s, label, fill) => s.addText(label, { shape: "roundRect", rectRadius: 0.2, x: 10.95, y: 0.4, w: 1.78, h: 0.42, fill: { color: fill }, line: { color: fill, width: 0 },
    fontFace: LAT, fontSize: 13, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, charSpacing: 2, objectName: nm("Route chip") });
  function nav(s, key, dark) {
    const i = mainKeys.indexOf(key), prev = mainKeys[i - 1], next = mainKeys[i + 1];
    const y = 6.82, h = 0.46;
    button(s, "Home", 0.6, y, 1.35, h, "title", { fs: 15, icon: I.home, isz: 0.24, ix: 0.22, margin: [0.4, 0.1, 0, 0], fill: dark ? P.primary : P.ink, flat: true, name: "Nav Home" });
    button(s, "Menu", 2.08, y, 1.1, h, "menu", { fs: 15, fill: dark ? P.dark : "FFFFFF", color: dark ? "FFFFFF" : P.ink, line: dark ? "FFFFFF" : P.ink, flat: true, name: "Nav Menu" });
    tx(s, `${i + 1} / ${mainKeys.length}`, { x: 5.67, y, w: 2, h, fontSize: 14, color: dark ? "B9D8D2" : P.muted, align: "center", valign: "middle", objectName: "Slide counter" });
    if (prev) button(s, "‹  Back", 9.9, y, 1.35, h, prev, { fs: 15, fill: dark ? P.dark : "FFFFFF", color: dark ? "FFFFFF" : P.primary, line: dark ? "FFFFFF" : P.primary, flat: true, name: "Nav Back" });
    if (next) button(s, "Next  ›", 11.38, y, 1.35, h, next, { fs: 15, fill: P.primary, flat: true, name: "Nav Next" });
  }
  function header(s, key, kick, title, route) {
    kicker(s, kick);
    s.addText(title, { placeholder: "title" });
    chip(s, route === "challenge" ? "CHALLENGE" : "GUIDED", route === "challenge" ? P.accent : P.primary);
  }
  const imgFrame = (s, file, x, y, w, label) => {      // never stretched: 16:9 source shown at 16:9
    const h = w * 1125 / 2000;
    card(s, x - 0.08, y - 0.08, w + 0.16, h + 0.16, { name: "Image frame" });
    s.addImage({ path: path.join(__dirname, "img", file), x, y, w, h, altText: label, objectName: nm(label) });
    tx(s, label, { x, y: y + h + 0.14, w, h: 0.3, fontSize: 14, color: P.muted, italic: true, align: "center", objectName: "Image caption" });
  };

  // ---------- slide renderers ----------
  const renderers = require(path.resolve(path.dirname(process.argv[2]), R.renderers));
  const ctx = { pres, R, P, I, WAVE, WAVE_GOLD, WAVE_SOFT, AR, LAT, W, H, tx, ar, card, dot, button, kicker, chip, nav, header, imgFrame, nm, num, mainKeys };
  for (const sd of R.slides) {
    const s = pres.addSlide({ masterName: sd.master || "LESSON_LIGHT" });
    if (sd.hidden) s.hidden = true;
    renderers[sd.type](s, sd, ctx);
    s.addNotes(sd.notes);
  }
  await pres.writeFile({ fileName: OUT });
  fs.writeFileSync(OUT.replace(/\.pptx$/, ".links.json"), JSON.stringify(links, null, 1));
  console.log("wrote", OUT, plan.length, "slides,", Object.keys(links).length, "links");
})();
