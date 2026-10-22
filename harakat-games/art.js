// Draws the game pictures (flat, soft colours, rounded shapes) and the calm backgrounds, to assets/img.
const fs = require("fs");
const path = require("path");
const { chromium } = require(process.env.PLAYWRIGHT || "/opt/node-tools/node_modules/playwright");
const OL = "#3b2f4a";                                         // soft dark outline
const svg = (w, h, inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner}</svg>`;
const shade = (id, a, b) => `<radialGradient id="${id}" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;
const ITEMS = [];
// ---- balloons (body with highlight, knot, curly string) ----
[["#ff8fa3", "#e5536f"], ["#ffd166", "#f2a93b"], ["#7bdff2", "#3fa7c9"], ["#b8a1ff", "#8a6cf0"], ["#95e1a3", "#4fbf6a"], ["#ffab76", "#f07c3c"]].forEach(([a, b], k) =>
  ITEMS.push({ name: `balloon${k}`, w: 300, h: 520, svg: svg(300, 520, `<defs>${shade("g", a, b)}</defs>
    <path d="M150 345 C 140 380 165 400 150 430 C 135 460 165 480 150 515" stroke="${OL}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <ellipse cx="150" cy="170" rx="132" ry="160" fill="url(#g)" stroke="${OL}" stroke-width="6"/>
    <path d="M136 328 L164 328 L172 350 L128 350 Z" fill="${b}" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
    <ellipse cx="95" cy="95" rx="26" ry="44" fill="#fff" opacity=".55" transform="rotate(25 95 95)"/>`) }));
// ---- fish (facing left) ----
[["#ffb347", "#ff8c42"], ["#7bdff2", "#2fa4c9"], ["#ff8fa3", "#e5536f"], ["#c3a6ff", "#8a6cf0"], ["#a7e8bd", "#4fbf6a"]].forEach(([a, b], k) =>
  ITEMS.push({ name: `fish${k}`, w: 420, h: 260, svg: svg(420, 260, `<defs>${shade("g", a, b)}</defs>
    <path d="M300 130 L405 50 Q 380 130 405 210 Z" fill="${b}" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
    <ellipse cx="185" cy="130" rx="165" ry="110" fill="url(#g)" stroke="${OL}" stroke-width="6"/>
    <path d="M180 30 Q 230 0 265 45" fill="${b}" stroke="${OL}" stroke-width="5"/>
    <circle cx="80" cy="105" r="20" fill="#fff" stroke="${OL}" stroke-width="4"/><circle cx="75" cy="105" r="10" fill="${OL}"/>
    <path d="M40 150 Q 55 165 72 158" stroke="${OL}" stroke-width="5" fill="none" stroke-linecap="round"/>`) }));
// ---- food ----
const leaf = (x, y) => `<path d="M${x} ${y} q 25 -35 55 -20 q -20 30 -55 20z" fill="#6cc070" stroke="${OL}" stroke-width="4"/>`;
ITEMS.push({ name: "food0", w: 300, h: 300, svg: svg(300, 300, `<defs>${shade("g", "#ff7b7b", "#d93b48")}</defs><path d="M150 70 C 90 40 30 80 40 160 C 50 250 110 290 150 265 C 190 290 250 250 260 160 C 270 80 210 40 150 70Z" fill="url(#g)" stroke="${OL}" stroke-width="6"/><path d="M150 72 Q 150 40 165 25" stroke="${OL}" stroke-width="7" fill="none" stroke-linecap="round"/>${leaf(160, 45)}`) });
ITEMS.push({ name: "food1", w: 300, h: 300, svg: svg(300, 300, `<defs>${shade("g", "#ffc46b", "#f08a24")}</defs><circle cx="150" cy="160" r="120" fill="url(#g)" stroke="${OL}" stroke-width="6"/>${leaf(150, 45)}<circle cx="110" cy="120" r="5" fill="#e07a1f"/><circle cx="190" cy="150" r="5" fill="#e07a1f"/><circle cx="140" cy="210" r="5" fill="#e07a1f"/>`) });
ITEMS.push({ name: "food2", w: 300, h: 300, svg: svg(300, 300, `<defs>${shade("g", "#ff8fa3", "#e5536f")}</defs><path d="M150 285 C 60 230 35 130 70 80 C 100 45 200 45 230 80 C 265 130 240 230 150 285Z" fill="url(#g)" stroke="${OL}" stroke-width="6"/>${[[100,120],[150,110],[200,120],[120,170],[180,170],[150,220]].map(([x,y]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="9" fill="#ffe08a"/>`).join("")}<path d="M90 70 L120 40 L150 65 L180 40 L210 70" fill="#6cc070" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>`) });
ITEMS.push({ name: "food3", w: 300, h: 300, svg: svg(300, 300, `<defs>${shade("g", "#c9f08a", "#86c34a")}</defs><path d="M150 60 C 120 60 115 110 100 140 C 70 190 80 280 150 280 C 220 280 230 190 200 140 C 185 110 180 60 150 60Z" fill="url(#g)" stroke="${OL}" stroke-width="6"/><path d="M150 62 Q 150 35 160 22" stroke="${OL}" stroke-width="7" fill="none" stroke-linecap="round"/>${leaf(158, 38)}`) });
ITEMS.push({ name: "food4", w: 300, h: 300, svg: svg(300, 300, `<path d="M70 150 L230 150 L210 270 L90 270 Z" fill="#ff9ec4" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>${[95,125,155,185].map(x => `<path d="M${x} 152 L${x + 8} 268" stroke="#e5709f" stroke-width="5"/>`).join("")}<path d="M55 155 C 40 100 100 60 150 70 C 200 60 260 100 245 155 Z" fill="#fff4e0" stroke="${OL}" stroke-width="6"/><circle cx="150" cy="58" r="20" fill="#e5536f" stroke="${OL}" stroke-width="5"/>`) });
// ---- monster: open mouth, chewing, sad ----
const monster = mode => svg(560, 560, `<defs>${shade("g", "#9ff0b0", "#4fbf6a")}</defs>
  <path d="M160 120 L130 40 L200 95Z M400 120 L430 40 L360 95Z" fill="#ffd166" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
  <ellipse cx="280" cy="310" rx="230" ry="220" fill="url(#g)" stroke="${OL}" stroke-width="7"/>
  <ellipse cx="200" cy="520" rx="60" ry="26" fill="#4fbf6a" stroke="${OL}" stroke-width="6"/><ellipse cx="360" cy="520" rx="60" ry="26" fill="#4fbf6a" stroke="${OL}" stroke-width="6"/>
  ${mode === "sad" ? `<path d="M175 205 q 30 -18 60 0 M325 205 q 30 -18 60 0" stroke="${OL}" stroke-width="7" fill="none" stroke-linecap="round"/>` :
    mode === "chew" ? `<path d="M170 210 q 35 -30 70 0 M320 210 q 35 -30 70 0" stroke="${OL}" stroke-width="8" fill="none" stroke-linecap="round"/>` :
    `<circle cx="205" cy="205" r="44" fill="#fff" stroke="${OL}" stroke-width="6"/><circle cx="355" cy="205" r="44" fill="#fff" stroke="${OL}" stroke-width="6"/><circle cx="215" cy="212" r="20" fill="${OL}"/><circle cx="345" cy="212" r="20" fill="${OL}"/><circle cx="222" cy="204" r="7" fill="#fff"/><circle cx="352" cy="204" r="7" fill="#fff"/>`}
  <ellipse cx="160" cy="300" rx="28" ry="16" fill="#ff8fa3" opacity=".6"/><ellipse cx="400" cy="300" rx="28" ry="16" fill="#ff8fa3" opacity=".6"/>
  ${mode === "open" ? `<path d="M175 300 Q 280 470 385 300 Z" fill="#8a2246" stroke="${OL}" stroke-width="7" stroke-linejoin="round"/><path d="M215 300 l15 25 l15 -25 M315 300 l15 25 l15 -25" fill="#fff"/><ellipse cx="280" cy="385" rx="45" ry="22" fill="#ff7b9c"/>` :
    mode === "chew" ? `<path d="M210 330 q 35 30 70 0 q 35 30 70 0" stroke="${OL}" stroke-width="8" fill="none" stroke-linecap="round"/>` :
    `<path d="M215 360 q 65 -45 130 0" stroke="${OL}" stroke-width="8" fill="none" stroke-linecap="round"/>`}`);
["open", "chew", "sad"].forEach(m => ITEMS.push({ name: `monster_${m}`, w: 560, h: 560, svg: monster(m) }));
// ---- train: engine (facing left) and wagon ----
ITEMS.push({ name: "engine", w: 460, h: 330, svg: svg(460, 330, `<rect x="40" y="150" width="300" height="120" rx="22" fill="#e5536f" stroke="${OL}" stroke-width="6"/>
  <rect x="250" y="60" width="150" height="210" rx="18" fill="#3fa7c9" stroke="${OL}" stroke-width="6"/><rect x="280" y="95" width="90" height="70" rx="12" fill="#e8f9ff" stroke="${OL}" stroke-width="5"/>
  <rect x="235" y="40" width="180" height="30" rx="10" fill="#ffd166" stroke="${OL}" stroke-width="6"/><rect x="80" y="90" width="50" height="65" rx="8" fill="#ffd166" stroke="${OL}" stroke-width="6"/>
  <path d="M40 250 L5 285 L60 285Z" fill="#ffd166" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
  ${[100, 210, 330].map(x => `<circle cx="${x}" cy="280" r="40" fill="#4a4060" stroke="${OL}" stroke-width="6"/><circle cx="${x}" cy="280" r="14" fill="#ffd166"/>`).join("")}`) });
ITEMS.push({ name: "wagon", w: 300, h: 260, svg: svg(300, 260, `<rect x="15" y="40" width="270" height="160" rx="22" fill="#ffd166" stroke="${OL}" stroke-width="6"/>
  <rect x="40" y="62" width="220" height="116" rx="16" fill="#fff8e6" stroke="${OL}" stroke-width="4"/><rect x="-5" y="150" width="30" height="16" rx="6" fill="#4a4060"/>
  ${[80, 220].map(x => `<circle cx="${x}" cy="215" r="34" fill="#4a4060" stroke="${OL}" stroke-width="6"/><circle cx="${x}" cy="215" r="12" fill="#ff8fa3"/>`).join("")}`) });
// ---- race cars (facing left) ----
[["red", "#e5536f"], ["blue", "#3fa7c9"]].forEach(([n, c]) => ITEMS.push({ name: `car_${n}`, w: 420, h: 230, svg: svg(420, 230, `
  <path d="M20 150 Q 20 110 70 105 L130 105 L170 50 L300 50 L350 105 L380 110 Q 405 115 405 150 L405 175 L20 175 Z" fill="${c}" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
  <path d="M185 65 L240 65 L240 105 L155 105 Z M255 65 L290 65 L330 105 L255 105 Z" fill="#e8f9ff" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
  <circle cx="35" cy="140" r="12" fill="#ffd166" stroke="${OL}" stroke-width="4"/>
  ${[100, 320].map(x => `<circle cx="${x}" cy="180" r="38" fill="#4a4060" stroke="${OL}" stroke-width="6"/><circle cx="${x}" cy="180" r="14" fill="#ddd"/>`).join("")}`) }));
// ---- gift boxes: body and lid ----
[["#ff8fa3", "#ffd166"], ["#7bdff2", "#ff8fa3"], ["#b8a1ff", "#ffd166"], ["#95e1a3", "#e5536f"]].forEach(([c, r], k) => {
  ITEMS.push({ name: `giftbody${k}`, w: 300, h: 230, svg: svg(300, 230, `<rect x="20" y="10" width="260" height="210" rx="16" fill="${c}" stroke="${OL}" stroke-width="6"/><rect x="128" y="10" width="44" height="210" fill="${r}" stroke="${OL}" stroke-width="5"/>`) });
  ITEMS.push({ name: `giftlid${k}`, w: 340, h: 170, svg: svg(340, 170, `<path d="M170 70 C 110 0 60 40 110 72 Z M170 70 C 230 0 280 40 230 72 Z" fill="${r}" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/><rect x="10" y="70" width="320" height="90" rx="16" fill="${c}" stroke="${OL}" stroke-width="6"/><rect x="146" y="70" width="48" height="90" fill="${r}" stroke="${OL}" stroke-width="5"/>`) });
});
ITEMS.push({ name: "blank", w: 4, h: 4, svg: svg(4, 4, "") });
// ---- caterpillars (head on the left): short = a short sound, long = a stretched (madd) sound ----
const caterpillar = n => { const W = 150 + n * 95; return { w: W, h: 230, svg: svg(W, 230, `<defs>${shade("g", "#b8f0a0", "#5fc56a")}${shade("h", "#ffe08a", "#f2b23b")}</defs>
  ${Array.from({ length: n }, (_, k) => { const x = W - 70 - k * 95, y = 140 + (k % 2 ? -12 : 0);
    return `<path d="M${x - 15} ${y + 45} l-6 28 M${x + 15} ${y + 45} l6 28" stroke="${OL}" stroke-width="6" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="58" fill="url(#g)" stroke="${OL}" stroke-width="6"/>`; }).join("")}
  <path d="M70 55 q -15 -40 -30 -45 M110 55 q 10 -40 30 -45" stroke="${OL}" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="40" cy="10" r="9" fill="#ff8fa3"/><circle cx="140" cy="10" r="9" fill="#ff8fa3"/>
  <circle cx="90" cy="115" r="68" fill="url(#h)" stroke="${OL}" stroke-width="6"/>
  <circle cx="68" cy="100" r="13" fill="${OL}"/><circle cx="112" cy="100" r="13" fill="${OL}"/><circle cx="64" cy="96" r="4" fill="#fff"/><circle cx="108" cy="96" r="4" fill="#fff"/>
  <path d="M70 140 q 20 18 40 0" stroke="${OL}" stroke-width="6" fill="none" stroke-linecap="round"/><ellipse cx="50" cy="130" rx="12" ry="7" fill="#ff8fa3" opacity=".7"/><ellipse cx="130" cy="130" rx="12" ry="7" fill="#ff8fa3" opacity=".7"/>`) }; };
ITEMS.push(Object.assign({ name: "caterpillar_short" }, caterpillar(1)), Object.assign({ name: "caterpillar_long" }, caterpillar(6)));
// ---- calm backgrounds (1920x1080) ----
const BG = {
  sky: `<rect width="1920" height="1080" fill="url(#s)"/><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe9ff"/><stop offset="1" stop-color="#fdeef4"/></linearGradient></defs>
    ${[[260, 190, 1], [1500, 140, 1.3], [980, 260, .8]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity=".85"><ellipse cx="0" cy="0" rx="120" ry="45"/><circle cx="-55" cy="-25" r="50"/><circle cx="20" cy="-45" r="62"/><circle cx="80" cy="-15" r="44"/></g>`).join("")}
    <path d="M0 930 Q 480 820 960 920 T 1920 900 L1920 1080 L0 1080Z" fill="#cdeccf"/><path d="M0 990 Q 600 900 1200 990 T 1920 980 L1920 1080 L0 1080Z" fill="#b5e2b9"/>`,
  sea: `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d5f3ff"/><stop offset="1" stop-color="#8fd3ec"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#s)"/>
    ${[200, 520, 1400, 1720].map((x, k) => `<path d="M${x} 1080 q -30 -90 0 -170 q 30 -80 0 -160" stroke="#7cc79a" stroke-width="22" fill="none" stroke-linecap="round" opacity=".7"/>`).join("")}
    <path d="M0 1000 Q 960 950 1920 1000 L1920 1080 L0 1080Z" fill="#f6e3b8"/>${[[300, 300], [1600, 420], [900, 180], [1200, 600]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="16" fill="none" stroke="#fff" stroke-width="4" opacity=".6"/>`).join("")}`,
  room: `<rect width="1920" height="1080" fill="#fff4e6"/><rect y="780" width="1920" height="300" fill="#f3d9b8"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(k => `<rect x="${k * 240}" y="780" width="6" height="300" fill="#e8c8a0"/>`).join("")}
    <rect x="760" y="190" width="260" height="220" rx="20" fill="#d9f1ff" stroke="#e8c8a0" stroke-width="12"/><path d="M890 190 L890 410 M760 300 L1020 300" stroke="#e8c8a0" stroke-width="8"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(k => `<circle cx="${110 + k * 170}" cy="60" r="16" fill="${["#ffb3c6", "#ffd8a8", "#b5e8ff", "#c8f0c8"][k % 4]}"/>`).join("")}`,
  meadow: `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3f6ff"/><stop offset="1" stop-color="#f2fbe9"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#s)"/>
    <path d="M0 360 Q 500 250 960 340 T 1920 320 L1920 1080 L0 1080Z" fill="#c9ecc0"/>${[[150, 330], [420, 300], [1550, 300], [1800, 330]].map(([x, y]) => `<circle cx="${x}" cy="${y - 60}" r="55" fill="#a9dca0"/><rect x="${x - 8}" y="${y - 20}" width="16" height="40" fill="#c8a27a"/>`).join("")}`,
  rail: `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dff1ff"/><stop offset="1" stop-color="#fff6e8"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#s)"/>
    <path d="M0 620 Q 480 520 960 600 T 1920 580 L1920 1080 L0 1080Z" fill="#d6efc8"/><rect y="905" width="1920" height="16" fill="#b08968"/><rect y="955" width="1920" height="16" fill="#b08968"/>
    ${Array.from({ length: 33 }, (_, k) => `<rect x="${k * 60}" y="895" width="22" height="90" rx="4" fill="#d4a373" opacity=".7"/>`).join("")}`,
  track: `<rect width="1920" height="1080" fill="#eef7ee"/><rect y="0" width="1920" height="160" fill="#e3f2fd"/>`,
  party: `<rect width="1920" height="1080" fill="#f6f0ff"/>${Array.from({ length: 13 }, (_, k) => `<path d="M${k * 160} 0 L${k * 160 + 80} 0 L${k * 160 + 40} 70Z" fill="${["#ffb3c6", "#ffd8a8", "#b5e8ff", "#c8f0c8"][k % 4]}"/>`).join("")}
    ${[[150, 900], [1750, 880], [300, 300], [1650, 320]].map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="${40 + k * 6}" fill="${["#ffd8a8", "#b5e8ff", "#ffb3c6", "#c8f0c8"][k]}" opacity=".6"/>`).join("")}`,
  title: `<defs><linearGradient id="s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe5ec"/><stop offset=".5" stop-color="#e8f4ff"/><stop offset="1" stop-color="#eaffea"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#s)"/>
    ${[[200, 200, "#ffb3c6"], [1700, 220, "#b5e8ff"], [320, 880, "#c8f0c8"], [1600, 860, "#ffd8a8"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="120" fill="${c}" opacity=".55"/>`).join("")}`,
  garden: `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7e0"/><stop offset="1" stop-color="#eefbe6"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#s)"/>
    <path d="M0 860 Q 960 780 1920 860 L1920 1080 L0 1080Z" fill="#cdeccf"/>
    ${Array.from({ length: 14 }, (_, k) => { const x = 70 + k * 138, y = 900 + (k % 3) * 40, c = ["#ffb3c6", "#ffd8a8", "#c3b5ff", "#b5e8ff"][k % 4];
      return `<path d="M${x} ${y} l0 70" stroke="#8bc98a" stroke-width="8"/>${[0, 72, 144, 216, 288].map(r => `<ellipse cx="${x}" cy="${y - 18}" rx="12" ry="20" fill="${c}" transform="rotate(${r} ${x} ${y})"/>`).join("")}<circle cx="${x}" cy="${y}" r="10" fill="#ffd166"/>`; }).join("")}`,
  stage: `<rect width="1920" height="1080" fill="#fbf4ff"/><rect y="860" width="1920" height="220" fill="#f1e2d0"/><rect y="850" width="1920" height="20" fill="#e2c9ae"/>
    <path d="M0 0 L330 0 Q 260 400 300 850 L0 850Z M1920 0 L1590 0 Q 1660 400 1620 850 L1920 850Z" fill="#f7c6d4"/>
    <path d="M0 0 L1920 0 L1920 90 Q 960 150 0 90Z" fill="#f2a9be"/>${Array.from({ length: 12 }, (_, k) => `<circle cx="${80 + k * 160}" cy="96" r="12" fill="#ffd166"/>`).join("")}`,
  mosque: `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6f0ff"/><stop offset="1" stop-color="#fff3e6"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#s)"/>
    <g fill="#e4dcf5" opacity=".9"><rect x="120" y="760" width="1680" height="320"/><path d="M760 760 Q 760 560 960 520 Q 1160 560 1160 760Z"/><rect x="955" y="470" width="10" height="60"/><circle cx="960" cy="465" r="12"/>
    <path d="M330 760 Q 330 660 420 640 Q 510 660 510 760Z M1410 760 Q 1410 660 1500 640 Q 1590 660 1590 760Z"/>
    <rect x="200" y="420" width="60" height="340"/><path d="M190 420 L230 340 L270 420Z"/><rect x="1660" y="420" width="60" height="340"/><path d="M1650 420 L1690 340 L1730 420Z"/></g>
    ${[[300, 160], [700, 110], [1250, 140], [1600, 190], [1000, 90]].map(([x, y]) => `<path d="M${x} ${y - 14} l4 10 l11 0 l-9 7 l3 11 l-9 -6 l-9 6 l3 -11 l-9 -7 l11 0z" fill="#ffd166" opacity=".8"/>`).join("")}`,
};
Object.entries(BG).forEach(([n, inner]) => ITEMS.push({ name: `bg_${n}`, w: 1920, h: 1080, svg: svg(1920, 1080, inner), jpg: true }));

(async () => {
  const out = path.join(__dirname, "assets", "img"); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const p = await b.newPage();
  for (const it of ITEMS) {
    await p.setViewportSize({ width: it.w, height: it.h });
    await p.setContent(`<html><body style="margin:0;background:transparent">${it.svg}</body></html>`);
    if (it.jpg) await p.screenshot({ path: `${out}/${it.name}.jpeg`, type: "jpeg", quality: 85 });
    else await p.screenshot({ path: `${out}/${it.name}.png`, omitBackground: true });
  }
  await b.close();
  console.log(ITEMS.length, "pictures");
})();
