// Pictures for the tanween games (same flat, soft style as ../harakat-games and ../fun-games), to assets/img.
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

// ---- bee, flowers, honey jar (0..5) ----
add("bee", 260, 200, `<defs>${shade("y", "#fff1a8", "#ffc93c")}</defs>
  <ellipse cx="95" cy="55" rx="55" ry="38" fill="#e8f7ff" stroke="${OL}" stroke-width="5" opacity=".9"/><ellipse cx="165" cy="50" rx="55" ry="38" fill="#e8f7ff" stroke="${OL}" stroke-width="5" opacity=".9"/>
  <ellipse cx="130" cy="125" rx="100" ry="66" fill="url(#y)" stroke="${OL}" stroke-width="6"/>
  <path d="M120 62 Q 105 125 120 188 M165 68 Q 150 125 165 182" stroke="${OL}" stroke-width="18" fill="none" opacity=".85"/>
  <path d="M230 125 L255 132 L230 140Z" fill="${OL}"/>${eyes(62, 92, 112, 15)}${smile(78, 145, 34)}`);
[["#ffb3c6", "#ff8fa3"], ["#c3b5ff", "#a991ff"], ["#ffd8a8", "#ffab76"]].forEach(([a, b], k) => add(`flower${k}`, 320, 460, `
  <path d="M160 300 L160 455" stroke="#5fb760" stroke-width="14"/><path d="M160 390 q -60 -10 -80 -60 q 55 0 80 60z M160 420 q 60 -10 80 -60 q -55 0 -80 60z" fill="#8fd88a" stroke="${OL}" stroke-width="4"/>
  ${Array.from({ length: 8 }, (_, i) => `<ellipse cx="160" cy="70" rx="44" ry="74" fill="${i % 2 ? a : b}" stroke="${OL}" stroke-width="5" transform="rotate(${i * 45} 160 155)"/>`).join("")}
  <circle cx="160" cy="155" r="88" fill="#fff8d6" stroke="${OL}" stroke-width="6"/>`));
const jar = n => svg(320, 400, `<rect x="40" y="90" width="240" height="290" rx="50" fill="#fffaf0" stroke="${OL}" stroke-width="7"/>
  <clipPath id="c"><rect x="44" y="94" width="232" height="282" rx="46"/></clipPath>
  <rect x="44" y="${376 - 56 * n}" width="232" height="${56 * n}" fill="#ffc93c" clip-path="url(#c)"/>
  <rect x="60" y="40" width="200" height="60" rx="16" fill="#e8a13a" stroke="${OL}" stroke-width="6"/>
  <rect x="85" y="190" width="150" height="80" rx="14" fill="#fff" stroke="${OL}" stroke-width="4" opacity=".9"/><text x="160" y="243" font-family="Arial" font-weight="bold" font-size="40" text-anchor="middle" fill="${OL}">HONEY</text>`);
for (let n = 0; n <= 5; n++) I.push({ name: `jar${n}`, w: 320, h: 400, svg: jar(n) });
// ---- monkey, palm tree, bananas ----
add("monkey", 260, 280, `<defs>${shade("m", "#d9a273", "#a8683f")}</defs>
  <path d="M200 220 q 60 -20 40 -90" stroke="#a8683f" stroke-width="16" fill="none" stroke-linecap="round"/>
  <ellipse cx="130" cy="200" rx="80" ry="70" fill="url(#m)" stroke="${OL}" stroke-width="6"/>
  <path d="M70 170 L20 90 M190 170 L240 90" stroke="#a8683f" stroke-width="22" stroke-linecap="round"/>
  <circle cx="45" cy="105" r="48" fill="url(#m)" stroke="${OL}" stroke-width="6" opacity="0"/>
  <circle cx="130" cy="95" r="70" fill="url(#m)" stroke="${OL}" stroke-width="6"/><circle cx="60" cy="90" r="24" fill="#f2c9a0" stroke="${OL}" stroke-width="5"/><circle cx="200" cy="90" r="24" fill="#f2c9a0" stroke="${OL}" stroke-width="5"/>
  <ellipse cx="130" cy="115" rx="50" ry="40" fill="#f2c9a0"/>${eyes(108, 152, 90, 15)}${smile(130, 125, 36)}`);
add("palm", 420, 1000, `<path d="M230 990 C 200 700 260 420 210 160" stroke="#b07a4a" stroke-width="56" fill="none" stroke-linecap="round"/>
  ${Array.from({ length: 14 }, (_, k) => `<path d="M${200 + 6 * Math.sin(k)} ${960 - k * 58} q 30 -14 60 0" stroke="#8c5a33" stroke-width="6" fill="none"/>`).join("")}
  ${[[-160, 60], [-110, -20], [0, -60], [110, -20], [160, 60]].map(([dx, dy]) => `<path d="M210 160 q ${dx * 0.6} ${dy - 70} ${dx} ${dy + 20}" stroke="#4fbf6a" stroke-width="40" fill="none" stroke-linecap="round"/>`).join("")}`);
add("bananas", 200, 180, `${[0, 1, 2, 3].map(k => `<path d="M100 30 C ${40 + k * 30} 60 ${30 + k * 35} 140 ${60 + k * 30} 170" stroke="#ffd166" stroke-width="30" fill="none" stroke-linecap="round"/><path d="M100 30 C ${40 + k * 30} 60 ${30 + k * 35} 140 ${60 + k * 30} 170" stroke="${OL}" stroke-width="3" fill="none" opacity=".4"/>`).join("")}
  <rect x="88" y="10" width="24" height="30" rx="6" fill="#8c5a33"/>`);
// ---- darts ----
add("dartboard", 360, 360, `${[[170, "#e5536f"], [135, "#fff"], [100, "#3fa7c9"], [65, "#fff"]].map(([r, c]) => `<circle cx="180" cy="180" r="${r}" fill="${c}" stroke="${OL}" stroke-width="5"/>`).join("")}`);
add("dart", 220, 70, `<path d="M10 35 L60 35" stroke="${OL}" stroke-width="8" stroke-linecap="round"/><rect x="55" y="25" width="100" height="20" rx="8" fill="#ffd166" stroke="${OL}" stroke-width="4"/>
  <path d="M150 35 L215 5 L200 35 L215 65 Z" fill="#8a6cf0" stroke="${OL}" stroke-width="4"/>`);
// ---- basketball ----
add("bball", 240, 240, `<defs>${shade("b", "#ffb36b", "#f07c3c")}</defs><circle cx="120" cy="120" r="112" fill="url(#b)" stroke="${OL}" stroke-width="7"/>
  <path d="M8 120 L232 120 M120 8 L120 232 M40 40 Q 120 120 40 200 M200 40 Q 120 120 200 200" stroke="${OL}" stroke-width="5" fill="none"/>`);
add("hoop", 420, 440, `<rect x="40" y="10" width="340" height="230" rx="14" fill="#fff" stroke="${OL}" stroke-width="7"/><rect x="150" y="110" width="120" height="90" fill="none" stroke="#e5536f" stroke-width="7"/>
  <path d="M110 230 L310 230" stroke="#f07c3c" stroke-width="14" stroke-linecap="round"/>
  ${[0, 1, 2, 3, 4, 5].map(k => `<path d="M${120 + k * 36} 236 L${145 + k * 26} 400" stroke="#9c93b0" stroke-width="4"/>`).join("")}<path d="M128 300 L292 300 M138 350 L282 350" stroke="#9c93b0" stroke-width="4"/>`);
// ---- growing flower in a pot (0..5) ----
const plant = n => svg(380, 720, `<path d="M90 560 L290 560 L265 710 L115 710 Z" fill="#e8916b" stroke="${OL}" stroke-width="7" stroke-linejoin="round"/><rect x="75" y="530" width="230" height="45" rx="12" fill="#f2a98a" stroke="${OL}" stroke-width="6"/>
  <ellipse cx="190" cy="535" rx="100" ry="14" fill="#7a5c45"/>
  ${n === 0 ? `<ellipse cx="190" cy="528" rx="22" ry="14" fill="#c98b5a" stroke="${OL}" stroke-width="4"/>` : ""}
  ${n >= 1 ? `<path d="M190 530 L190 ${520 - 80 * Math.min(n, 4)}" stroke="#5fb760" stroke-width="14" stroke-linecap="round"/>` : ""}
  ${n >= 1 ? `<path d="M190 500 q -50 -10 -70 -50 q 45 0 70 50z M190 500 q 50 -10 70 -50 q -45 0 -70 50z" fill="#8fd88a" stroke="${OL}" stroke-width="4"/>` : ""}
  ${n >= 3 ? `<path d="M190 380 q -60 -10 -85 -60 q 55 0 85 60z M190 360 q 60 -10 85 -60 q -55 0 -85 60z" fill="#8fd88a" stroke="${OL}" stroke-width="4"/>` : ""}
  ${n >= 4 ? `<circle cx="190" cy="190" r="${n === 5 ? 46 : 30}" fill="${n === 5 ? "#fff8d6" : "#b8f0a0"}" stroke="${OL}" stroke-width="5"/>` : ""}
  ${n === 5 ? `${Array.from({ length: 8 }, (_, i) => `<ellipse cx="190" cy="105" rx="38" ry="62" fill="${i % 2 ? "#ffb3c6" : "#ff8fa3"}" stroke="${OL}" stroke-width="5" transform="rotate(${i * 45} 190 190)"/>`).join("")}
    <circle cx="190" cy="190" r="56" fill="#fff8d6" stroke="${OL}" stroke-width="6"/>${eyes(170, 210, 182, 11)}${smile(190, 205, 26)}` : ""}`);
for (let n = 0; n <= 5; n++) I.push({ name: `plant${n}`, w: 380, h: 720, svg: plant(n) });
// ---- pizza (0..5 toppings) ----
const pizza = n => svg(620, 620, `<circle cx="310" cy="310" r="290" fill="#f2c27b" stroke="${OL}" stroke-width="8"/><circle cx="310" cy="310" r="250" fill="#ff8a65" stroke="#e8613a" stroke-width="5"/>
  ${n >= 1 ? `<circle cx="310" cy="310" r="235" fill="#fff3c4" opacity=".9"/>` : ""}
  ${n >= 2 ? [[200, 200], [420, 220], [300, 420], [180, 380], [430, 400]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="38" fill="#e5536f" stroke="${OL}" stroke-width="4"/>`).join("") : ""}
  ${n >= 3 ? [[310, 170], [250, 300], [380, 320], [300, 500]].map(([x, y]) => `<path d="M${x - 30} ${y} q 30 -40 60 0 q -30 25 -60 0z" fill="#4fbf6a" stroke="${OL}" stroke-width="4"/>`).join("") : ""}
  ${n >= 4 ? [[150, 290], [470, 300], [360, 230], [240, 480], [400, 480]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="20" fill="#3b2f4a"/><circle cx="${x}" cy="${y}" r="8" fill="#fff3c4"/>`).join("") : ""}
  ${n >= 5 ? [[240, 150], [390, 150], [120, 220], [500, 260], [200, 540]].map(([x, y]) => `<path d="M${x - 25} ${y - 10} L${x + 25} ${y - 10} L${x + 15} ${y + 25} L${x - 15} ${y + 25}Z" fill="#ffd166" stroke="${OL}" stroke-width="4"/>`).join("") : ""}`);
for (let n = 0; n <= 5; n++) I.push({ name: `pizza${n}`, w: 620, h: 620, svg: pizza(n) });
// ---- turtle and its home ----
add("turtle", 300, 200, `<defs>${shade("t", "#b8f0a0", "#4fbf6a")}</defs>
  <ellipse cx="55" cy="130" rx="45" ry="38" fill="#a7e8bd" stroke="${OL}" stroke-width="6"/>${eyes(42, 70, 120, 11)}${smile(56, 145, 22)}
  ${[95, 230].map(x => `<ellipse cx="${x}" cy="180" rx="28" ry="18" fill="#a7e8bd" stroke="${OL}" stroke-width="5"/>`).join("")}
  <path d="M80 165 Q 160 0 265 165 Z" fill="url(#t)" stroke="${OL}" stroke-width="7" stroke-linejoin="round"/>
  <path d="M130 100 L170 90 L200 120 L180 160 L130 160 Z" fill="none" stroke="#2f8f4a" stroke-width="5"/>`);
add("home", 340, 340, `<path d="M40 160 L170 40 L300 160 Z" fill="#e5536f" stroke="${OL}" stroke-width="7" stroke-linejoin="round"/><rect x="65" y="150" width="210" height="170" fill="#ffe8a3" stroke="${OL}" stroke-width="7"/>
  <rect x="140" y="220" width="60" height="100" rx="10" fill="#c98b5a" stroke="${OL}" stroke-width="5"/><rect x="85" y="185" width="45" height="45" fill="#bfe8ff" stroke="${OL}" stroke-width="5"/><rect x="215" y="185" width="45" height="45" fill="#bfe8ff" stroke="${OL}" stroke-width="5"/>`);
add("blocks", 300, 360, `${[["#ff8fa3", 0], ["#ffd166", 1], ["#7bdff2", 2], ["#95e1a3", 3]].map(([c, k]) => `<rect x="${40 + (k % 2) * 30}" y="${270 - k * 85}" width="190" height="80" rx="14" fill="${c}" stroke="${OL}" stroke-width="6"/>`).join("")}`);
// ---- calm backgrounds ----
const BG = {
  flowers: `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8f6ff"/><stop offset="1" stop-color="#f4fbe9"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#s)"/>
    <path d="M0 820 Q 960 740 1920 820 L1920 1080 L0 1080Z" fill="#cdeccf"/>`,
  jungle: `<rect width="1920" height="1080" fill="#eefaf0"/>${[[1700, 200], [1500, 900], [900, 120], [1250, 600]].map(([x, y], k) => `<ellipse cx="${x}" cy="${y}" rx="${160 - k * 20}" ry="${90 - k * 10}" fill="#d4f0d0" transform="rotate(${k * 30} ${x} ${y})"/>`).join("")}
    <path d="M0 960 Q 960 900 1920 960 L1920 1080 L0 1080Z" fill="#c6e8bf"/>`,
  fair: `<rect width="1920" height="1080" fill="#fffaf2"/>${Array.from({ length: 13 }, (_, k) => `<path d="M${k * 160} 0 L${k * 160 + 80} 0 L${k * 160 + 80} 140 Q ${k * 160 + 40} 180 ${k * 160} 140Z" fill="${k % 2 ? "#ffd6e0" : "#e0f2ff"}"/>`).join("")}
    <rect y="880" width="1920" height="200" fill="#efe1cf"/>`,
  court: `<rect width="1920" height="1080" fill="#f3f6ff"/><rect y="760" width="1920" height="320" fill="#f6d9b0"/>${Array.from({ length: 17 }, (_, k) => `<rect x="${k * 120}" y="760" width="4" height="320" fill="#e8c493"/>`).join("")}
    <path d="M660 1080 Q 960 860 1260 1080" stroke="#fff" stroke-width="10" fill="none"/>`,
  window: `<rect width="1920" height="1080" fill="#fff8ef"/><rect x="1300" y="120" width="460" height="380" rx="20" fill="#d9f1ff" stroke="#e8c8a0" stroke-width="14"/><path d="M1530 120 L1530 500 M1300 310 L1760 310" stroke="#e8c8a0" stroke-width="10"/>
    <circle cx="1650" cy="210" r="40" fill="#ffe066" opacity=".8"/><rect y="880" width="1920" height="200" fill="#e9dccb"/>`,
  kitchen: `<rect width="1920" height="1080" fill="#fff9f0"/>${Array.from({ length: 9 }, (_, r) => Array.from({ length: 17 }, (_, c) => (r + c) % 2 ? "" : `<rect x="${c * 120}" y="${r * 100}" width="120" height="100" fill="#f3fbff"/>`).join("")).join("")}
    <rect y="900" width="1920" height="180" fill="#d4a373"/><rect y="880" width="1920" height="30" fill="#b08968"/>`,
  beach: `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dff4ff"/><stop offset="1" stop-color="#bfe6f6"/></linearGradient></defs><rect width="1920" height="620" fill="url(#s)"/>
    <rect y="560" width="1920" height="120" fill="#a8dcf0"/><path d="M0 640 Q 480 600 960 640 T 1920 640 L1920 1080 L0 1080Z" fill="#f8e7bd"/>`,
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
