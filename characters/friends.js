// Kids, animals and birds for the fathah / kasrah / dammah decks.
// Pictures are cut from the three grids in source/ by cut.py (white background removed); aspect.json holds width/height.
// A friend is placed only where it touches no circle, panel or pill and no sun/cloud/star decoration.
const ASPECT = require("./aspect.json");
const NAMES = Object.keys(ASPECT);
const pool = kind => NAMES.filter(n => n.startsWith(kind + "_"));
const KIDS = pool("kid"), ANIMALS = pool("animal"), BIRDS = pool("bird"), SEA = pool("sea");
const GROUND_DECO = /hill|wave|sea floor|grass|stem|dune|moon surface|sun low/;
const hit = (a, b, m) => a.x < b.x + b.w + m && b.x < a.x + a.w + m && a.y < b.y + b.h + m && b.y < a.y + a.h + m;

function place(s, ctx, pic, cands) {
  const ar = ASPECT[pic];
  const blockers = ctx.content.concat(ctx.deco.filter(d => !GROUND_DECO.test(d.name)));
  let best = null;                                  // the biggest spot that is free wins
  for (const c of cands) {
    const w = c.h * ar, x = c.side === "r" ? c.x - w : c.x, b = { x, y: c.y, w, h: c.h };
    if (x < 0 || x + w > ctx.W || b.y < 0 || b.y + b.h > ctx.H) continue;
    if (blockers.some(o => hit(b, o, 0.08))) continue;
    if (!best || b.h * b.w > best.h * best.w) best = b;
  }
  if (!best || best.h < 0.95) return false;         // too small to look nice: leave the side empty
  s.addImage({ path: `${__dirname}/png/${pic}.png`, x: best.x, y: best.y, w: best.w, h: best.h, altText: pic.split("_")[0] });
  ctx.deco.push(Object.assign({ name: "Friend " + pic }, best));
  return true;
}
// ctx = { content, deco, W, H } boxes of the slide; seed varies per deck and slide; the sea scene brings sea animals
module.exports = function friends(s, ctx, seed, scene) {
  const left = seed % 2 === 0 ? KIDS : ANIMALS;
  const right = scene === "sea" ? SEA : seed % 3 === 0 ? KIDS : seed % 2 === 0 ? BIRDS : ANIMALS.concat(BIRDS);
  const a = left[(seed * 7) % left.length], b = right[(seed * 11 + 5) % right.length];
  const ground = side => { const c = []; for (let h = 2.0; h >= 0.95; h -= 0.05) for (const x of side === "l" ? [0.1, 0.5] : [ctx.W - 0.1, ctx.W - 0.5])
    c.push({ x, y: ctx.H - 0.08 - h, h, side }); return c; };
  // beside the content in the middle of the slide, or standing on the ground
  const mid = side => { const c = []; for (let h = 1.8; h >= 0.9; h -= 0.05) c.push({ x: side === "l" ? 0.1 : ctx.W - 0.1, y: 2.85 - h / 2, h, side }); return c; };
  place(s, ctx, a, mid("l").concat(ground("l")));
  place(s, ctx, b, mid("r").concat(ground("r")));
};
