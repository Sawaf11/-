// Animal and bird friends for the fathah / kasrah / dammah decks.
// Pictures: Microsoft Fluent Emoji 3D (MIT, see LICENSE-fluentui-emoji.txt), trimmed; aspect.json holds width/height.
// A friend is placed only where it touches no circle, panel or pill and no sun/cloud/star decoration,
// and it is mirrored when needed so it looks toward the middle of the slide.
const ASPECT = require("./aspect.json");
const NAMES = Object.keys(ASPECT);
const GROUND = NAMES.filter(n => n.startsWith("ground_")), SEA = NAMES.filter(n => n.startsWith("sea_")), SKY = NAMES.filter(n => n.startsWith("sky_"));
// pictures whose head points right (all the others look left or straight ahead)
const FACES_RIGHT = new Set(["ground_goat", "ground_kangaroo", "ground_zebra", "ground_snail"]);
const FRONT = new Set(["ground_penguin", "ground_owl", "ground_peacock", "ground_hatching_chick", "ground_monkey",
  "sea_crab", "sea_octopus", "sky_butterfly", "sky_lady_beetle"]);
const GROUND_DECO = /hill|wave|sea floor|grass|stem|dune|moon surface|sun low/;
const hit = (a, b, m) => a.x < b.x + b.w + m && b.x < a.x + a.w + m && a.y < b.y + b.h + m && b.y < a.y + a.h + m;

function place(s, ctx, pic, cands) {
  const ar = ASPECT[pic];
  const blockers = ctx.content.concat(ctx.deco.filter(d => !GROUND_DECO.test(d.name)));
  for (const c of cands) {
    const w = c.h * ar, x = c.side === "r" ? c.x - w : c.x, b = { x, y: c.y, w, h: c.h };
    if (x < 0 || x + w > ctx.W || b.y < 0 || b.y + b.h > ctx.H) continue;
    if (blockers.some(o => hit(b, o, 0.08))) continue;
    const looksRight = FACES_RIGHT.has(pic);
    const flipH = !FRONT.has(pic) && (c.side === "l" ? !looksRight : looksRight);
    s.addImage({ path: `${__dirname}/${pic}.png`, x: b.x, y: b.y, w: b.w, h: b.h, flipH, altText: pic.replace(/^\w+?_/, "") });
    ctx.deco.push(Object.assign({ name: "Friend " + pic }, b));
    return true;
  }
  return false;
}
// ctx = { content, deco, W, H } boxes of the slide; seed varies per deck and slide; scene picks sea animals for the sea
module.exports = function friends(s, ctx, seed, scene) {
  const pool = scene === "sea" ? SEA.concat(["ground_turtle", "ground_penguin", "ground_duck", "ground_swan"]) : GROUND;
  const a = pool[seed % pool.length], b = pool[(seed * 7 + 3) % pool.length] === a ? pool[(seed + 1) % pool.length] : pool[(seed * 7 + 3) % pool.length];
  const ground = side => { const c = []; for (let h = 1.9; h >= 0.7; h -= 0.05) for (const x of side === "l" ? [0.1, 0.5] : [ctx.W - 0.1, ctx.W - 0.5])
    c.push({ x, y: ctx.H - 0.08 - h, h, side }); return c; };
  // beside the content in the middle of the slide first, otherwise standing on the ground
  const mid = side => { const c = []; for (let h = 1.6; h >= 0.9; h -= 0.05) c.push({ x: side === "l" ? 0.1 : ctx.W - 0.1, y: 2.8 - h / 2, h, side }); return c; };
  place(s, ctx, a, mid("l").concat(ground("l")));
  place(s, ctx, b, mid("r").concat(ground("r")));
  const sky = SKY[(seed * 3) % SKY.length], right = seed % 2 === 0;
  const xs = right ? [9.9, 8.9, 7.9, 6.9, 6.1] : [0.1, 1.1, 2.1, 3.1, 3.9];
  const c = []; for (let h = 0.85; h >= 0.4; h -= 0.05) xs.forEach(x => c.push({ x, y: 0.05, h, side: right ? "r" : "l" }));
  place(s, ctx, sky, c);
};
