// Renders the glassy backgrounds (soft colour gradients with blurred light blobs) to bg/*.jpg.
const fs = require("fs");
const path = require("path");
const { chromium } = require(process.env.PLAYWRIGHT || "/opt/node-tools/node_modules/playwright");
const PALETTES = [
  ["#3a1c71", "#d76d77", "#ffaf7b"], ["#0f2027", "#2c5364", "#38ef7d"], ["#1d2b64", "#5b86e5", "#f8cdda"],
  ["#41295a", "#2f0743", "#ff6fd8"], ["#134e5e", "#71b280", "#ffe29f"], ["#232526", "#5f2c82", "#49a09d"],
  ["#2b5876", "#4e4376", "#ffc371"], ["#0b486b", "#f56217", "#ffd194"], ["#4568dc", "#b06ab3", "#43cea2"],
  ["#1a2a6c", "#b21f1f", "#fdbb2d"],
];
const blobs = (cols, seed) => [0, 1, 2, 3].map(k => {
  const x = (seed * 37 + k * 29) % 100, y = (seed * 53 + k * 41) % 100, r = 28 + ((seed + k) * 13) % 22;
  return `<div style="position:absolute;left:${x - r / 2}%;top:${y - r / 2}%;width:${r}vw;height:${r}vw;border-radius:50%;background:${cols[(k + 1) % 3]};opacity:.55;filter:blur(90px)"></div>`;
}).join("");
(async () => {
  const out = path.join(__dirname, "bg"); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  for (const [i, c] of PALETTES.entries()) {
    await p.setContent(`<body style="margin:0;width:1600px;height:900px;overflow:hidden;position:relative;background:linear-gradient(135deg,${c[0]},${c[1]} 60%,${c[2]})">${blobs(c, i + 3)}</body>`);
    await p.screenshot({ path: `${out}/glass${i}.jpg`, type: "jpeg", quality: 82 });
  }
  await b.close();
  console.log(PALETTES.length, "backgrounds");
})();
