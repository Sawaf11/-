// Pictures for the silent letters and muqatta'at games (same flat, soft style as the other game decks), to assets/img.
const fs = require("fs");
const path = require("path");
const { chromium } = require(process.env.PLAYWRIGHT || "/opt/node-tools/node_modules/playwright");
const OL = "#3b2f4a";
const svg = (w, h, inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner}</svg>`;
const shade = (id, a, b) => `<radialGradient id="${id}" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;
const eyes = (x1, x2, y, r = 22) => `<circle cx="${x1}" cy="${y}" r="${r}" fill="#fff" stroke="${OL}" stroke-width="5"/><circle cx="${x2}" cy="${y}" r="${r}" fill="#fff" stroke="${OL}" stroke-width="5"/>
  <circle cx="${x1 - 4}" cy="${y + 3}" r="${r * 0.48}" fill="${OL}"/><circle cx="${x2 - 4}" cy="${y + 3}" r="${r * 0.48}" fill="${OL}"/><circle cx="${x1 - 8}" cy="${y - 3}" r="${r * 0.18}" fill="#fff"/><circle cx="${x2 - 8}" cy="${y - 3}" r="${r * 0.18}" fill="#fff"/>`;
const smile = (x, y, w = 50) => `<path d="M${x - w / 2} ${y} q ${w / 2} ${w * 0.55} ${w} 0" stroke="${OL}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
const cheeks = (x1, x2, y) => `<ellipse cx="${x1}" cy="${y}" rx="16" ry="9" fill="#ff8fa3" opacity=".6"/><ellipse cx="${x2}" cy="${y}" rx="16" ry="9" fill="#ff8fa3" opacity=".6"/>`;
const I = [];
const add = (name, w, h, inner, jpg) => I.push({ name, w, h, svg: svg(w, h, inner), jpg });

// ---- a friendly ghost (the letter we do not read) ----
add("ghost", 260, 300, `<path d="M30 280 L30 130 C 30 50 80 15 130 15 C 180 15 230 50 230 130 L230 280 L200 255 L170 285 L130 255 L90 285 L60 255 Z" fill="#fbfaff" stroke="${OL}" stroke-width="7" stroke-linejoin="round"/>
  ${eyes(100, 160, 120, 18)}<ellipse cx="130" cy="170" rx="16" ry="12" fill="${OL}"/>${cheeks(80, 180, 155)}
  <path d="M30 170 Q 0 150 10 120 M230 170 Q 260 150 250 120" stroke="${OL}" stroke-width="7" fill="none" stroke-linecap="round"/>`);
// ---- snowman, step by step (0..5) ----
const snow = n => svg(420, 700, `<ellipse cx="210" cy="680" rx="170" ry="18" fill="#dfe8f5"/>
  <g fill="none" stroke="#c9d6ea" stroke-width="5" stroke-dasharray="14 12"><circle cx="210" cy="560" r="130"/><circle cx="210" cy="360" r="100"/><circle cx="210" cy="190" r="80"/></g>
  ${n >= 1 ? `<circle cx="210" cy="560" r="130" fill="#fff" stroke="${OL}" stroke-width="7"/>` : ""}
  ${n >= 2 ? `<circle cx="210" cy="360" r="100" fill="#fff" stroke="${OL}" stroke-width="7"/>${[320, 370, 420].map(y => `<circle cx="210" cy="${y}" r="10" fill="${OL}"/>`).join("")}` : ""}
  ${n >= 3 ? `<circle cx="210" cy="190" r="80" fill="#fff" stroke="${OL}" stroke-width="7"/>${eyes(185, 235, 175, 12)}<path d="M210 195 L265 205 L210 215Z" fill="#ffab76" stroke="${OL}" stroke-width="4"/>${cheeks(170, 250, 210)}` : ""}
  ${n >= 4 ? `<path d="M120 270 Q 210 310 300 270 L300 300 Q 210 340 120 300Z" fill="#e5536f" stroke="${OL}" stroke-width="5"/><path d="M270 290 L285 370 L250 365 Z" fill="#e5536f" stroke="${OL}" stroke-width="5"/>
    <path d="M115 360 L20 300 M305 360 L400 300" stroke="#8c5a33" stroke-width="12" stroke-linecap="round"/>` : ""}
  ${n >= 5 ? `<rect x="140" y="40" width="140" height="90" rx="10" fill="#3b2f4a"/><rect x="110" y="120" width="200" height="22" rx="10" fill="#3b2f4a"/><rect x="140" y="100" width="140" height="18" fill="#e5536f"/>` : ""}`);
for (let n = 0; n <= 5; n++) I.push({ name: `snowman${n}`, w: 420, h: 700, svg: snow(n) });
// ---- treasure dig: sand mound, shovel, gems ----
add("mound", 360, 200, `<path d="M10 190 Q 60 40 180 30 Q 300 40 350 190 Z" fill="#f2d49b" stroke="${OL}" stroke-width="6"/>${[[110, 120], [200, 90], [260, 150], [150, 165]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#d9b277"/>`).join("")}`);
add("shovel", 160, 300, `<rect x="70" y="10" width="20" height="170" rx="8" fill="#b07a4a" stroke="${OL}" stroke-width="5"/><rect x="45" y="5" width="70" height="26" rx="10" fill="#e5536f" stroke="${OL}" stroke-width="5"/>
  <path d="M30 180 L130 180 L120 260 Q 80 300 40 260 Z" fill="#9aa5b8" stroke="${OL}" stroke-width="6"/>`);
[["#ff8fa3", "#e5536f"], ["#7bdff2", "#3fa7c9"], ["#b8f0a0", "#4fbf6a"]].forEach(([a, b], k) => add(`gem${k}`, 180, 160, `<defs>${shade("g", a, b)}</defs>
  <path d="M40 10 L140 10 L175 55 L90 155 L5 55 Z" fill="url(#g)" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/><path d="M5 55 L175 55 M40 10 L65 55 L90 155 L115 55 L140 10" stroke="${OL}" stroke-width="3" fill="none" opacity=".5"/>
  <path d="M55 25 l8 -14 l8 14z" fill="#fff" opacity=".8"/>`));
// ---- fireworks ----
[["#ff8fa3", "#ffd166"], ["#7bdff2", "#c3b5ff"], ["#95e1a3", "#ffab76"]].forEach(([a, b], k) => add(`firework${k}`, 400, 400, `${Array.from({ length: 16 }, (_, i) => { const t = i * Math.PI / 8;
  return `<path d="M${200 + 50 * Math.cos(t)} ${200 + 50 * Math.sin(t)} L${200 + 180 * Math.cos(t)} ${200 + 180 * Math.sin(t)}" stroke="${i % 2 ? a : b}" stroke-width="12" stroke-linecap="round"/><circle cx="${200 + 190 * Math.cos(t)}" cy="${200 + 190 * Math.sin(t)}" r="9" fill="${i % 2 ? b : a}"/>`; }).join("")}
  <circle cx="200" cy="200" r="30" fill="#fff6c4"/>`));
add("rocketstick", 80, 260, `<path d="M40 60 L40 255" stroke="#b07a4a" stroke-width="7"/><path d="M15 70 L40 5 L65 70 Z" fill="#e5536f" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/><rect x="18" y="65" width="44" height="80" rx="8" fill="#ffd166" stroke="${OL}" stroke-width="5"/>`);
// ---- the third sorting button: read only when you stop ----
add("stop_hand", 300, 300, `<circle cx="150" cy="150" r="135" fill="#ffe3ec" stroke="#e5536f" stroke-width="10"/>
  <path d="M100 230 L100 120 Q 100 100 115 100 Q 130 100 130 120 L130 90 Q 130 70 145 70 Q 160 70 160 90 L160 85 Q 160 65 175 65 Q 190 65 190 85 L190 110 Q 190 95 205 95 Q 220 95 220 112 L220 190 Q 220 250 165 255 L135 255 Q 100 255 100 230 Z" fill="#ffd9b3" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>`);
// ---- calm backgrounds ----
const BG = {
  spooky: `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9e2ff"/><stop offset="1" stop-color="#fbeff7"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#s)"/>
    <circle cx="1650" cy="190" r="100" fill="#fff6c4"/>${[[200, 180], [520, 120], [1200, 160], [900, 260]].map(([x, y]) => `<path d="M${x} ${y - 12} l4 9 l10 0 l-8 6 l3 10 l-9 -6 l-9 6 l3 -10 l-8 -6 l10 0z" fill="#fff"/>`).join("")}
    <path d="M0 900 Q 960 830 1920 900 L1920 1080 L0 1080Z" fill="#d9d2ef"/>`,
  snow: `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2f1ff"/><stop offset="1" stop-color="#f7fbff"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#s)"/>
    ${Array.from({ length: 40 }, (_, k) => `<circle cx="${(k * 337) % 1920}" cy="${(k * 151) % 820}" r="${4 + (k % 4) * 2}" fill="#fff"/>`).join("")}<path d="M0 860 Q 960 790 1920 860 L1920 1080 L0 1080Z" fill="#ffffff"/><path d="M0 860 Q 960 790 1920 860" stroke="#dfe8f5" stroke-width="8" fill="none"/>`,
  sky_night: `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d7d2f7"/><stop offset="1" stop-color="#fde6ef"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#s)"/>
    ${[[150, 120], [600, 200], [1100, 90], [1500, 220], [1800, 120], [350, 380]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#fff"/>`).join("")}
    <path d="M0 930 L180 870 L300 900 L420 820 L560 880 L700 840 L900 900 L1100 830 L1300 890 L1500 840 L1700 900 L1920 860 L1920 1080 L0 1080Z" fill="#c9c0ea"/>`,
};
Object.entries(BG).forEach(([n, inner]) => add(`bg_${n}`, 1920, 1080, inner, true));

(async () => {
  const out = path.join(__dirname, "assets", "img"); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const p = await b.newPage();
  for (const it of I) {
    await p.setViewportSize({ width: it.w, height: it.h });
    await p.setContent(`<html><body style="margin:0;background:transparent">${it.svg}</body></html>`);
    if (it.jpg) await p.screenshot({ path: `${out}/${it.name}.jpeg`, type: "jpeg", quality: 85 });
    else await p.screenshot({ path: `${out}/${it.name}.png`, omitBackground: true });
  }
  await b.close();
  console.log(I.length, "pictures");
})();
