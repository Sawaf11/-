// Reusable slide renderers for the Tajweed lesson design system. Content comes from the rule file.
const CONTENT_W = 12.133, X0 = 0.6;

function stars(s, c, spots) {
  spots.forEach(([x, y, z], i) => s.addImage({ data: c.I.star, x, y, w: z, h: z, objectName: c.nm("Deco star " + i) }));
}
// Arabic line with optional highlighted segments: segs = [{t, hl}]
function arRuns(c, segs, fs) {
  return segs.map(g => ({ text: g.t, options: g.hl ? { highlight: c.P.hl, color: c.P.primaryDark, fontSize: fs } : { fontSize: fs } }));
}

module.exports = {
  title(s, d, c) {
    const { P, tx, ar, button, I } = c;
    s.addImage({ data: c.WAVE_SOFT, x: 8.6, y: 5.95, w: 4.1, h: 1.0, transparency: 40, objectName: c.nm("Deco wave") });
    s.addImage({ data: c.WAVE_SOFT, x: 0.6, y: 0.55, w: 2.6, h: 0.64, transparency: 55, objectName: c.nm("Deco wave small") });
    stars(s, c, [[11.6, 0.6, 0.34], [12.2, 1.15, 0.22], [1.0, 6.2, 0.26]]);
    tx(s, d.kicker, { x: 1, y: 1.0, w: 11.33, h: 0.4, fontSize: 18, bold: true, color: P.gold, align: "center", charSpacing: 4, objectName: "Kicker" });
    tx(s, d.title, { x: 1, y: 1.45, w: 11.33, h: 1.0, fontSize: 54, bold: true, color: "FFFFFF", align: "center", valign: "middle", objectName: "Deck title" });
    ar(s, d.arabic, { x: 3.2, y: 2.5, w: 6.93, h: 1.05, fontSize: 54, color: P.gold, objectName: "Arabic rule name" });
    tx(s, d.tagline, { x: 1, y: 3.6, w: 11.33, h: 0.5, fontSize: 24, color: "CFE6E1", align: "center", objectName: "Tagline" });
    button(s, "Guided Lesson", 2.65, 4.45, 3.8, 0.9, d.guided, { fs: 26, fill: P.gold, color: P.ink, name: "Route Guided" });
    button(s, "Challenge Mode", 6.88, 4.45, 3.8, 0.9, d.challenge, { fs: 26, fill: P.dark, color: "FFFFFF", line: "FFFFFF", name: "Route Challenge" });
    tx(s, "Explanations, examples and practice", { x: 2.45, y: 5.42, w: 4.2, h: 0.4, fontSize: 16, color: "CFE6E1", align: "center", objectName: "Route note" });
    tx(s, "Straight to practice and review", { x: 6.68, y: 5.42, w: 4.2, h: 0.4, fontSize: 16, color: "CFE6E1", align: "center", objectName: "Route note" });
    button(s, "Lesson menu", 5.67, 6.05, 2.0, 0.5, "menu", { fs: 16, fill: P.dark, color: P.gold, line: P.gold, flat: true, name: "Title Menu" });
    tx(s, d.footer, { x: 0.6, y: 6.95, w: 8, h: 0.3, fontSize: 13, color: "8FBDB4", objectName: "Footer" });
  },

  menu(s, d, c) {
    const { P, tx, button, kicker } = c;
    kicker(s, "LESSON MENU"); s.addText(d.title, { placeholder: "title" });
    tx(s, "Guided", { x: 9.2, y: 0.47, w: 1.0, h: 0.3, fontSize: 14, bold: true, color: P.primary, align: "right", objectName: "Legend" });
    c.dot(s, 10.3, 0.5, 0.24, P.primary, null, "Legend guided");
    tx(s, "Challenge", { x: 10.7, y: 0.47, w: 1.3, h: 0.3, fontSize: 14, bold: true, color: P.accentDark, align: "right", objectName: "Legend" });
    c.dot(s, 12.1, 0.5, 0.24, P.accent, null, "Legend challenge");
    const cols = 4, tw = 2.88, th = 1.32, gap = 0.2;
    d.items.forEach((it, i) => {
      const x = X0 + (i % cols) * (tw + gap), y = 1.78 + Math.floor(i / cols) * (th + gap);
      const ch = it.route === "challenge";
      button(s, it.label, x, y, tw, th, it.to, { fs: 21, fill: ch ? P.accentTint : "FFFFFF", color: P.ink, line: ch ? P.accent : P.cardLine, align: "left", margin: [0.95, 0.15, 0, 0], name: "Menu tile" });
      s.addText(String(i + 1), { shape: "ellipse", x: x + 0.2, y: y + th / 2 - 0.29, w: 0.58, h: 0.58, fill: { color: ch ? P.accent : P.primary }, line: { color: "FFFFFF", width: 0 },
        fontFace: c.LAT, fontSize: 18, bold: true, color: ch ? P.ink : "FFFFFF", align: "center", valign: "middle", margin: 0, objectName: c.nm("Menu number", it.to) });
    });
    c.nav(s, d.key);
  },

  goals(s, d, c) {
    const { P, tx, ar, card, dot, header } = c;
    header(s, d.key, d.kicker, d.title, d.route);
    const w = 3.84, gap = 0.305;
    d.goals.forEach((g, i) => {
      const x = X0 + i * (w + gap);
      card(s, x, 1.75, w, 3.05);
      dot(s, x + 0.3, 2.0, 0.8, [P.primary, P.accentDark, P.ink][i], c.I[g.icon], "Goal");
      tx(s, g.head, { x: x + 1.25, y: 2.13, w: w - 1.45, h: 0.55, fontSize: 26, bold: true, objectName: "Goal head" });
      tx(s, g.text, { x: x + 0.3, y: 3.0, w: w - 0.6, h: 1.65, fontSize: 22, color: P.body, objectName: "Goal text" });
    });
    tx(s, "Key words", { x: X0, y: 5.03, w: 3, h: 0.36, fontSize: 18, bold: true, color: P.primary, objectName: "Key words label" });
    d.terms.forEach((t, i) => {
      const x = X0 + i * (w + gap);
      card(s, x, 5.45, w, 1.08, { fill: P.soft, line: P.soft, noShadow: true, name: "Term chip" });
      if (t.icon) dot(s, x + 0.2, 5.62, 0.75, P.primary, c.I[t.icon], "Term");
      else ar(s, t.mark, { x: x + 0.12, y: 5.42, w: 0.95, h: 0.98, fontSize: 44, color: P.primaryDark, objectName: "Term mark" });
      tx(s, [{ text: t.term, options: { bold: true, breakLine: true } }, { text: t.mean }], { x: x + 1.12, y: 5.55, w: w - 1.25, h: 0.9, fontSize: 19, valign: "middle", objectName: "Term text" });
    });
    c.nav(s, d.key);
  },

  reveal(s, d, c) {
    const { P, tx, ar, card, header, button } = c;
    header(s, d.key, d.kicker, d.title, d.route);
    tx(s, d.prompt, { x: X0, y: 1.7, w: CONTENT_W, h: 0.55, fontSize: 26, objectName: "Prompt" });
    const n = d.tiles.length, tw = 2.6, gap = 0.33, x0 = (c.W - (n * tw + (n - 1) * gap)) / 2;
    d.tiles.forEach((t, i) => {
      const x = x0 + i * (tw + gap), on = d.answer && t.ok;
      card(s, x, 2.4, tw, 2.6, { fill: on ? P.primary : "FFFFFF", line: on ? P.primary : P.cardLine });
      ar(s, t.ar, { x, y: 2.55, w: tw, h: 1.8, fontSize: 74, color: on ? "FFFFFF" : (d.answer ? P.faded : P.ink), objectName: "Tile letter" });
      tx(s, d.answer ? (t.ok ? "✓ shaddah" : t.lab) : String.fromCharCode(65 + i), { x, y: 4.55, w: tw, h: 0.36, fontSize: 18, bold: true, color: on ? "FFFFFF" : P.muted, align: "center", objectName: "Tile label" });
    });
    if (!d.answer) {
      tx(s, "Think first, then click Reveal.", { x: X0, y: 5.18, w: CONTENT_W, h: 0.4, fontSize: 20, italic: true, color: P.muted, align: "center", objectName: "Hint" });
      button(s, "Reveal", 5.17, 5.7, 3.0, 0.72, d.revealTo, { fs: 24, fill: P.gold, color: P.ink, icon: c.I.eye, isz: 0.36, ix: 0.3, margin: [0.5, 0.1, 0, 0], name: "Reveal" });
      c.nav(s, d.key);
    } else {
      card(s, X0, 5.2, CONTENT_W, 1.35, { fill: P.soft, line: P.soft, noShadow: true, name: "Answer panel" });
      tx(s, d.explain, { x: X0 + 0.3, y: 5.25, w: CONTENT_W - 0.6, h: 1.25, fontSize: 24, valign: "middle", objectName: "Answer text" });
      button(s, "‹  Back to question", 0.6, 6.82, 2.6, 0.46, d.backTo, { fs: 15, fill: "FFFFFF", color: P.primary, line: P.primary, flat: true, name: "Back to question" });
      button(s, "Continue  ›", 10.93, 6.82, 1.8, 0.46, d.nextTo, { fs: 15, flat: true, name: "Continue" });
    }
  },

  idea(s, d, c) {
    const { P, tx, ar, card, header, dot } = c;
    header(s, d.key, d.kicker, d.title, d.route);
    tx(s, d.lead, { x: X0, y: 1.68, w: CONTENT_W, h: 0.95, fontSize: 26, objectName: "Lead" });
    // visual equation laid out right-to-left: [result] = [2nd part] + [1st part]
    const bw = 2.2, ow = 0.8, x0 = (c.W - (3 * bw + 2 * ow)) / 2, y = 2.8, bh = 1.6;
    const boxes = [d.eq.result, d.eq.second, d.eq.first];
    boxes.forEach((b, i) => {
      const x = x0 + i * (bw + ow), res = i === 0;
      card(s, x, y, bw, bh, { fill: res ? P.primary : "FFFFFF", line: res ? P.primary : P.cardLine });
      ar(s, b.ar, { x, y: y - 0.05, w: bw, h: bh, fontSize: 80, color: res ? "FFFFFF" : P.ink, objectName: "Equation letter" });
      tx(s, b.lab, { x: x - 0.2, y: y + bh + 0.1, w: bw + 0.4, h: 0.4, fontSize: 18, bold: true, color: res ? P.primary : P.muted, align: "center", objectName: "Equation label" });
      if (i < 2) tx(s, i === 0 ? "=" : "+", { x: x + bw, y, w: ow, h: bh, fontSize: 48, bold: true, color: P.accentDark, align: "center", valign: "middle", objectName: "Operator" });
    });
    tx(s, "Arabic reads right to left  ←", { x: x0 + 3 * bw + 2 * ow - 4, y: 2.38, w: 4, h: 0.35, fontSize: 15, italic: true, color: P.muted, align: "right", objectName: "Direction note" });
    card(s, X0, 5.1, CONTENT_W, 1.4, { fill: P.soft, line: P.soft, noShadow: true, name: "Ghunnah panel" });
    dot(s, X0 + 0.3, 5.3, 1.0, P.primary, c.I.nose, "Nose");
    tx(s, d.ghunnah, { x: X0 + 1.55, y: 5.15, w: 7.3, h: 1.3, fontSize: 24, valign: "middle", objectName: "Ghunnah text" });
    s.addImage({ data: c.WAVE, x: 9.6, y: 5.35, w: 2.9, h: 0.71, objectName: c.nm("Nasal wave") });
    c.nav(s, d.key);
  },

  cues(s, d, c) {
    const { P, tx, ar, card, header, dot } = c;
    header(s, d.key, d.kicker, d.title, d.route);
    d.tiles.forEach((t, i) => {
      const x = X0 + i * 3.15;
      card(s, x, 1.75, 2.95, 2.05, { fill: P.soft, line: P.soft, noShadow: true, name: "Letter tile" });
      ar(s, t.ar, { x, y: 1.85, w: 2.95, h: 1.35, fontSize: 64, color: P.primaryDark, objectName: "Letter" });
      tx(s, t.lab, { x, y: 3.32, w: 2.95, h: 0.4, fontSize: 18, bold: true, color: P.primary, align: "center", objectName: "Letter label" });
    });
    d.cues.forEach((q, i) => {
      const y = 4.1 + i * 1.2;
      dot(s, X0, y + 0.1, 0.8, i ? P.accentDark : P.primary, c.I[q.icon], "Cue");
      tx(s, q.text, { x: X0 + 1.05, y, w: 5.2, h: 1.05, fontSize: 24, valign: "middle", objectName: "Cue text" });
    });
    c.imgFrame(s, d.image, 7.15, 1.9, 5.5, d.imageLabel);
    c.nav(s, d.key);
  },

  steps(s, d, c) {
    const { P, tx, card, header, dot } = c;
    header(s, d.key, d.kicker, d.title, d.route);
    const w = 3.7, ag = 0.515;
    d.steps.forEach((st, i) => {
      const x = X0 + i * (w + ag);
      card(s, x, 1.75, w, 3.35);
      s.addText(String(i + 1), { shape: "ellipse", x: x + 0.3, y: 2.0, w: 0.75, h: 0.75, fill: { color: P.primary }, line: { color: P.primary, width: 0 },
        fontFace: c.LAT, fontSize: 28, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, objectName: c.nm("Step number") });
      dot(s, x + w - 1.05, 2.0, 0.75, P.accentDark, c.I[st.icon], "Step icon");
      tx(s, st.text, { x: x + 0.3, y: 2.95, w: w - 0.6, h: 2.0, fontSize: 24, objectName: "Step text" });
      if (i < d.steps.length - 1) tx(s, "→", { x: x + w, y: 3.05, w: ag, h: 0.6, fontSize: 30, bold: true, color: P.primary, align: "center", valign: "middle", objectName: "Step arrow" });
    });
    card(s, X0, 5.4, CONTENT_W, 1.15, { fill: P.soft, line: P.soft, noShadow: true, name: "Model strip" });
    dot(s, X0 + 0.25, 5.57, 0.8, P.accentDark, c.I.teach, "Model");
    tx(s, d.model, { x: X0 + 1.3, y: 5.45, w: CONTENT_W - 1.5, h: 1.05, fontSize: 24, valign: "middle", objectName: "Model text" });
    c.nav(s, d.key);
  },

  timing(s, d, c) {
    const { P, tx, ar, card, header } = c;
    header(s, d.key, d.kicker, d.title, d.route);
    card(s, X0, 1.75, 6.25, 4.8);
    tx(s, "2", { x: X0 + 0.35, y: 1.85, w: 1.3, h: 1.5, fontSize: 110, bold: true, color: P.primary, valign: "middle", objectName: "Stat number" });
    tx(s, "counts of ghunnah", { x: X0 + 1.65, y: 2.25, w: 4.4, h: 0.7, fontSize: 30, bold: true, valign: "middle", objectName: "Stat label" });
    [0, 1].forEach(i => {
      const x = X0 + 0.45 + i * 1.6;
      s.addShape("ellipse", { x, y: 3.45, w: 1.2, h: 1.2, fill: { color: P.soft }, line: { color: P.primary, width: 2.5 }, objectName: c.nm("Beat") });
      ar(s, "بَ", { x, y: 3.45, w: 1.2, h: 1.15, fontSize: 50, color: P.primaryDark, objectName: "Beat vowel" });
      tx(s, "count " + (i + 1), { x: x - 0.1, y: 4.68, w: 1.4, h: 0.3, fontSize: 15, bold: true, color: P.muted, align: "center", objectName: "Beat label" });
    });
    tx(s, d.beatNote, { x: X0 + 3.6, y: 3.4, w: 2.45, h: 1.6, fontSize: 18, italic: true, color: P.muted, valign: "middle", objectName: "Beat note" });
    tx(s, d.text, { x: X0 + 0.35, y: 5.08, w: 5.6, h: 1.35, fontSize: 22, valign: "middle", objectName: "Timing text" });
    c.imgFrame(s, d.image, 7.45, 1.85, 5.2, d.imageLabel);
    s.addText([{ text: "Keep it accurate  ", options: { bold: true, color: P.gold } }, { text: d.accurate }], { shape: "roundRect", rectRadius: 0.18,
      x: 7.25, y: 5.35, w: 5.48, h: 1.2, fill: { color: P.dark }, line: { color: P.dark, width: 0 }, fontFace: c.LAT, fontSize: 19, color: "FFFFFF",
      valign: "middle", margin: [18, 18, 7, 7], objectName: c.nm("Accuracy callout") });
    c.nav(s, d.key);
  },

  example(s, d, c) {
    const { P, tx, ar, card, header, dot } = c;
    header(s, d.key, d.kicker, d.title, d.route);
    card(s, X0, 1.72, CONTENT_W, 2.2, { name: "Verse panel" });
    tx(s, d.focusNote, { x: X0 + 0.3, y: 1.84, w: CONTENT_W - 0.6, h: 0.34, fontSize: 16, color: P.muted, align: "center", italic: true, objectName: "Focus note" });
    ar(s, arRuns(c, d.segs, 66), { x: X0 + 0.3, y: 2.2, w: CONTENT_W - 0.6, h: 1.62, objectName: "Verse excerpt" });
    const w = 3.84, gap = 0.305;
    d.rows.forEach((r, i) => {
      const x = X0 + i * (w + gap);
      card(s, x, 4.15, w, 2.4);
      dot(s, x + 0.25, 4.32, 0.6, [P.primary, P.accentDark, P.ink][i], c.I[["search", "mic", "eye"][i]], "Row");
      tx(s, r.head, { x: x + 1.0, y: 4.35, w: w - 1.2, h: 0.55, fontSize: 22, bold: true, valign: "middle", objectName: "Row head" });
      tx(s, r.text, { x: x + 0.25, y: 5.05, w: w - 0.45, h: 1.4, fontSize: 21, color: P.body, objectName: "Row text" });
    });
    c.nav(s, d.key);
  },

  mistakes(s, d, c) {
    const { P, tx, card, header, dot } = c;
    header(s, d.key, d.kicker, d.title, d.route);
    d.wrong.forEach((m, i) => {
      const x = X0 + i * 6.165;
      card(s, x, 1.75, 5.97, 2.35, { fill: P.tryBg, line: P.tryLine });
      dot(s, x + 0.3, 1.98, 0.75, P.coral, c.I.times, "Mistake");
      tx(s, m.head, { x: x + 1.25, y: 2.0, w: 4.5, h: 0.7, fontSize: 26, bold: true, valign: "middle", objectName: "Mistake head" });
      tx(s, m.text, { x: x + 0.3, y: 2.95, w: 5.4, h: 1.05, fontSize: 22, color: P.body, objectName: "Mistake text" });
    });
    card(s, X0, 4.4, CONTENT_W, 2.1, { fill: P.goodBg, line: P.goodLine });
    dot(s, X0 + 0.3, 4.65, 0.75, P.good, c.I.check, "Fix");
    tx(s, d.fix.head, { x: X0 + 1.25, y: 4.67, w: 8, h: 0.7, fontSize: 26, bold: true, valign: "middle", objectName: "Fix head" });
    tx(s, d.fix.text, { x: X0 + 0.3, y: 5.5, w: 8.9, h: 0.95, fontSize: 22, color: P.body, objectName: "Fix text" });
    s.addImage({ data: c.WAVE, x: 10.05, y: 5.45, w: 2.5, h: 0.61, objectName: c.nm("Nasal wave") });
    c.nav(s, d.key);
  },

  guided(s, d, c) {
    const { P, tx, header } = c;
    header(s, d.key, d.kicker, d.title, d.route);
    d.steps.forEach((t, i) => {
      const y = 1.78 + i * 0.95;
      s.addText(String(i + 1), { shape: "ellipse", x: X0, y: y + 0.08, w: 0.62, h: 0.62, fill: { color: i % 2 ? P.accent : P.primary }, line: { color: "FFFFFF", width: 0 },
        fontFace: c.LAT, fontSize: 22, bold: true, color: i % 2 ? P.ink : "FFFFFF", align: "center", valign: "middle", margin: 0, objectName: c.nm("Practice number") });
      tx(s, t, { x: X0 + 0.85, y, w: 5.55, h: 0.8, fontSize: 22, valign: "middle", objectName: "Practice step" });
    });
    c.imgFrame(s, d.image, 7.45, 1.85, 5.2, d.imageLabel);
    s.addText([{ text: "Before moving on", options: { bold: true, color: P.primaryDark, breakLine: true } }, { text: d.check }], { shape: "roundRect", rectRadius: 0.18,
      x: 7.25, y: 5.35, w: 5.48, h: 1.2, fill: { color: P.soft }, line: { color: P.soft, width: 0 }, fontFace: c.LAT, fontSize: 18, color: P.ink,
      valign: "middle", margin: [18, 18, 6, 6], objectName: c.nm("Checklist") });
    c.nav(s, d.key);
  },

  mcq(s, d, c) {
    const { P, tx, ar, card, header } = c;
    header(s, d.key, d.kicker, d.title, d.route);
    tx(s, d.prompt, { x: X0, y: 1.68, w: CONTENT_W, h: 0.95, fontSize: 26, objectName: "Question" });
    let cy = 2.75;
    if (d.segs) {
      card(s, X0, 2.72, CONTENT_W, 1.65, { name: "Verse panel" });
      ar(s, arRuns(c, d.segs, 60), { x: X0 + 0.3, y: 2.85, w: CONTENT_W - 0.6, h: 1.42, objectName: "Verse excerpt" });
      if (d.ref) tx(s, d.ref, { x: X0 + 0.25, y: 2.82, w: 1.5, h: 0.3, fontSize: 14, bold: true, color: P.muted, objectName: "Verse ref" });
      cy = 4.55;
    }
    const n = d.choices.length, gap = 0.3, w = (CONTENT_W - (n - 1) * gap) / n, h = d.segs ? 1.95 : 2.6;
    d.choices.forEach((ch, i) => {
      const x = X0 + i * (w + gap), lab = String.fromCharCode(65 + i);
      const hasAr = !!ch.ar;
      c.button(s, ch.text, x, cy, w, h, ch.to, { fs: ch.fs || (hasAr ? 20 : 26), fill: "FFFFFF", color: P.ink, line: P.primary, bold: true,
        margin: hasAr ? [0.3, 0.3, 0.1, h * 0.64] : [0.95, 0.3, 0.1, 0.1], align: hasAr ? "center" : "left", name: "Choice " + lab });
      s.addText(lab, { shape: "ellipse", x: x + 0.18, y: hasAr ? cy + 0.15 : cy + h / 2 - 0.29, w: 0.58, h: 0.58, fill: { color: P.primary }, line: { color: P.primary, width: 0 },
        fontFace: c.LAT, fontSize: 20, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, objectName: c.nm("Choice letter", ch.to) });
      if (hasAr) s.addText(arRuns(c, ch.ar, 42), { x: x + 0.8, y: cy + 0.06, w: w - 1.0, h: h * 0.56, fontFace: c.AR, align: "center", valign: "middle", rtlMode: true, lang: "ar-SA",
        color: P.ink, margin: 0, isTextBox: true, objectName: c.nm("Choice Arabic", ch.to) });
    });
    c.nav(s, d.key);
  },

  good(s, d, c) {
    const { P, tx, ar, card, dot, button } = c;
    dot(s, X0, 0.55, 1.1, P.good, c.I.check, "Correct badge");
    tx(s, d.head || "Correct!", { x: X0 + 1.35, y: 0.6, w: 8, h: 1.0, fontSize: 44, bold: true, color: P.goodDark, valign: "middle", objectName: "Feedback title" });
    stars(s, c, [[10.6, 0.5, 0.55], [11.4, 0.95, 0.38], [12.1, 0.45, 0.45], [9.9, 1.05, 0.3]]);
    let y = 1.95;
    if (d.segs) {
      card(s, X0, y, CONTENT_W, 1.5, { name: "Verse panel" });
      ar(s, arRuns(c, d.segs, 60), { x: X0 + 0.3, y: y + 0.03, w: CONTENT_W - 0.6, h: 1.4, objectName: "Verse excerpt" });
      y += 1.75;
    }
    tx(s, d.text, { x: X0, y, w: CONTENT_W, h: d.segs ? 1.35 : 1.3, fontSize: 24, objectName: "Explanation" });
    if (!d.segs) s.addImage({ data: c.WAVE, x: (c.W - 4.6) / 2, y: 3.35, w: 4.6, h: 1.12, objectName: c.nm("Nasal wave") });
    if (d.extra) {
      const ey = d.segs ? 5.2 : 4.75;
      card(s, X0, ey, CONTENT_W, 1.25, { fill: P.accentTint, line: P.accent, noShadow: true, name: "Extra challenge" });
      c.dot(s, X0 + 0.25, ey + 0.27, 0.7, P.accent, c.I.bolt, "Extra");
      tx(s, [{ text: "Extra challenge  ", options: { bold: true, color: P.accentDark } }, { text: d.extra }], { x: X0 + 1.15, y: ey + 0.08, w: CONTENT_W - 1.4, h: 1.1, fontSize: 21, valign: "middle", objectName: "Extra text" });
    }
    button(s, "‹  Back to question", 0.6, 6.82, 2.6, 0.46, d.backTo, { fs: 15, fill: "FFFFFF", color: P.primary, line: P.primary, flat: true, name: "Back to question" });
    button(s, d.nextLabel || "Next  ›", 10.43, 6.82, 2.3, 0.46, d.nextTo, { fs: 16, fill: P.good, flat: true, name: "Feedback next" });
  },

  tryAgain(s, d, c) {
    const { P, tx, ar, card, dot, button } = c;
    dot(s, X0, 0.55, 1.1, P.coral, c.I.redo, "Try badge");
    tx(s, d.head || "Not quite. Have another go!", { x: X0 + 1.35, y: 0.6, w: 10, h: 1.0, fontSize: 40, bold: true, color: P.coralDark, valign: "middle", objectName: "Feedback title" });
    let y = 1.95;
    if (d.segs) {
      card(s, X0, y, CONTENT_W, 1.5, { name: "Verse panel" });
      ar(s, arRuns(c, d.segs, 60), { x: X0 + 0.3, y: y + 0.03, w: CONTENT_W - 0.6, h: 1.4, objectName: "Verse excerpt" });
      y += 1.75;
    }
    dot(s, X0, y + 0.05, 0.7, P.gold, c.I.bulb, "Hint");
    tx(s, d.text, { x: X0 + 0.95, y, w: CONTENT_W - 0.95, h: 1.4, fontSize: 24, objectName: "Hint text" });
    if (!d.segs) s.addImage({ data: c.WAVE, x: (c.W - 4.6) / 2, y: 3.85, w: 4.6, h: 1.12, transparency: 30, objectName: c.nm("Nasal wave") });
    button(s, "Try again", 4.92, 5.75, 3.5, 0.8, d.backTo, { fs: 26, fill: P.coral, icon: c.I.redo, isz: 0.36, ix: 0.4, margin: [0.5, 0.1, 0, 0], name: "Try again" });
  },

  teach(s, d, c) {
    const { P, tx, ar, card, header, dot, button } = c;
    header(s, d.key, d.kicker, d.title, d.route);
    tx(s, d.prompt, { x: X0, y: 1.68, w: CONTENT_W, h: 0.6, fontSize: 26, objectName: "Prompt" });
    d.tasks.forEach((t, i) => {
      const y = 2.45 + i * 0.95;
      dot(s, X0, y + 0.05, 0.65, [P.primary, P.accentDark, P.ink][i], c.I[t.icon], "Task");
      tx(s, t.text, { x: X0 + 0.9, y, w: 6.4, h: 0.8, fontSize: 24, valign: "middle", objectName: "Task text" });
    });
    d.examples.forEach((e, i) => {
      const ey = 2.35 + i * 1.6;
      card(s, 8.0, ey, 4.73, 1.45, { name: "Example chip" });
      tx(s, e.ref, { x: 8.1, y: ey + 0.1, w: 4.53, h: 0.3, fontSize: 14, bold: true, color: P.muted, align: "center", objectName: "Example ref" });
      ar(s, e.ar, { x: 8.1, y: ey + 0.42, w: 4.53, h: 0.95, fontSize: 38, objectName: "Example" });
    });
    button(s, "Show model answer", 4.17, 5.65, 5.0, 0.8, d.revealTo, { fs: 24, fill: P.gold, color: P.ink, icon: c.I.eye, isz: 0.36, ix: 0.35, margin: [0.5, 0.1, 0, 0], name: "Model answer" });
    c.nav(s, d.key);
  },

  teachAnswer(s, d, c) {
    const { P, tx, card, button, kicker } = c;
    kicker(s, d.kicker);
    tx(s, d.title, { x: X0, y: 0.72, w: 10, h: 0.8, fontSize: 36, bold: true, objectName: "Title" });
    const w = 3.7, ag = 0.515;
    d.steps.forEach((t, i) => {
      const x = X0 + i * (w + ag);
      card(s, x, 1.75, w, 2.55);
      s.addText(String(i + 1), { shape: "ellipse", x: x + 0.25, y: 1.95, w: 0.6, h: 0.6, fill: { color: P.primary }, line: { color: P.primary, width: 0 },
        fontFace: c.LAT, fontSize: 22, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, objectName: c.nm("Step number") });
      tx(s, t, { x: x + 0.25, y: 2.7, w: w - 0.5, h: 1.5, fontSize: 21, objectName: "Step text" });
      if (i < 2) tx(s, "→", { x: x + w, y: 2.7, w: ag, h: 0.5, fontSize: 28, bold: true, color: P.primary, align: "center", objectName: "Arrow" });
    });
    card(s, X0, 4.55, CONTENT_W, 1.9, { fill: P.soft, line: P.soft, noShadow: true, name: "Timing answer" });
    tx(s, [{ text: "Timing  ", options: { bold: true, color: P.primaryDark } }, { text: d.timing, options: { breakLine: true } },
           { text: "Demonstrate  ", options: { bold: true, color: P.primaryDark } }, { text: d.demo }],
       { x: X0 + 0.3, y: 4.65, w: CONTENT_W - 0.6, h: 1.7, fontSize: 22, valign: "middle", paraSpaceAfter: 8, objectName: "Timing text" });
    button(s, "‹  Back to challenge", 0.6, 6.82, 2.7, 0.46, d.backTo, { fs: 15, fill: "FFFFFF", color: P.primary, line: P.primary, flat: true, name: "Back" });
    button(s, "Continue  ›", 10.93, 6.82, 1.8, 0.46, d.nextTo, { fs: 15, flat: true, name: "Continue" });
  },

  recap(s, d, c) {
    const { P, tx, card, dot, button } = c;
    stars(s, c, [[11.3, 0.45, 0.5], [12.05, 0.9, 0.34], [10.75, 1.0, 0.28]]);
    tx(s, "RECAP", { x: X0, y: 0.36, w: 6, h: 0.32, fontSize: 14, bold: true, color: P.gold, charSpacing: 3, objectName: "Kicker" });
    tx(s, d.title, { x: X0, y: 0.72, w: 10, h: 0.8, fontSize: 36, bold: true, color: "FFFFFF", objectName: "Title" });
    const w = 3.84, gap = 0.305;
    d.cols.forEach((col, i) => {
      const x = X0 + i * (w + gap);
      card(s, x, 1.75, w, 2.85, { fill: "FFFFFF", line: "FFFFFF" });
      dot(s, x + 0.3, 1.98, 0.75, [P.primary, P.accentDark, P.ink][i], c.I[col.icon], "Recap");
      tx(s, col.head, { x: x + 1.2, y: 2.0, w: w - 1.4, h: 0.7, fontSize: 26, bold: true, valign: "middle", objectName: "Recap head" });
      tx(s, col.text, { x: x + 0.3, y: 2.9, w: w - 0.6, h: 1.6, fontSize: 21, color: P.body, objectName: "Recap text" });
    });
    s.addImage({ data: c.WAVE_GOLD, x: X0, y: 4.95, w: 2.6, h: 0.64, objectName: c.nm("Nasal wave") });
    tx(s, d.cheer, { x: X0 + 2.9, y: 4.8, w: 9.2, h: 0.95, fontSize: 26, bold: true, color: P.gold, valign: "middle", objectName: "Celebration" });
    button(s, "Lesson cards and sources", 4.17, 5.95, 5.0, 0.55, d.galleryTo, { fs: 18, fill: P.dark, color: "FFFFFF", line: "FFFFFF", flat: true, name: "Gallery link" });
    c.nav(s, d.key, true);
  },

  gallery(s, d, c) {
    const { P, tx, kicker, button } = c;
    kicker(s, "REFERENCE");
    tx(s, d.title, { x: X0, y: 0.72, w: 10, h: 0.8, fontSize: 36, bold: true, objectName: "Title" });
    d.images.forEach((im, i) => {
      const x = X0 + (i % 2) * 3.85, y = 1.72 + Math.floor(i / 2) * 2.6;
      c.imgFrame(s, im.file, x, y, 3.5, im.label);
    });
    tx(s, d.sources, { x: 8.45, y: 1.7, w: 4.28, h: 4.9, fontSize: 16, color: P.body, paraSpaceAfter: 8, objectName: "Sources" });
    button(s, "‹  Back to recap", 0.6, 6.82, 2.4, 0.46, d.backTo, { fs: 15, fill: "FFFFFF", color: P.primary, line: P.primary, flat: true, name: "Back to recap" });
    button(s, "Menu", 11.38, 6.82, 1.35, 0.46, "menu", { fs: 15, flat: true, name: "Menu" });
  },
};
