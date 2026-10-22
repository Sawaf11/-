// Pictures for the hamzat al-wasl / sun & moon lam games (same flat, soft style as the other game decks), to assets/img.
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

// ---- dinosaur eggs and the baby dino ----
[["#fff3c4", "#ffd166"], ["#d4f5d0", "#7fd08a"], ["#e3dcff", "#a991ff"]].forEach(([a, b], k) => add(`egg${k}`, 300, 380, `<defs>${shade("e", "#ffffff", a)}</defs>
  <path d="M150 15 C 260 15 290 220 280 270 C 265 350 210 370 150 370 C 90 370 35 350 20 270 C 10 220 40 15 150 15 Z" fill="url(#e)" stroke="${OL}" stroke-width="7"/>
  ${[[95, 120, 20], [200, 90, 14], [215, 230, 24], [80, 260, 16], [150, 310, 12]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${b}" opacity=".8"/>`).join("")}`));
const dino = svg(300, 300, `<defs>${shade("d", "#b8f0a0", "#4fbf6a")}</defs>
  <path d="M60 230 Q 20 200 30 150" stroke="#4fbf6a" stroke-width="26" fill="none" stroke-linecap="round"/>
  <ellipse cx="150" cy="210" rx="90" ry="75" fill="url(#d)" stroke="${OL}" stroke-width="6"/>
  ${[[110, 120], [140, 100], [170, 105]].map(([x, y]) => `<path d="M${x - 14} ${y + 14} L${x} ${y - 14} L${x + 14} ${y + 14}Z" fill="#ffd166" stroke="${OL}" stroke-width="4"/>`).join("")}
  <circle cx="190" cy="130" r="68" fill="url(#d)" stroke="${OL}" stroke-width="6"/>${eyes(172, 214, 122, 15)}${smile(195, 160, 40)}${cheeks(160, 230, 150)}`);
I.push({ name: "dino", w: 300, h: 300, svg: dino });
add("hatched", 340, 400, `<g transform="translate(20 20)">${dino.replace(/<\/?svg[^>]*>/g, "")}</g>
  <path d="M30 260 L70 230 L100 270 L140 230 L180 270 L220 230 L260 270 L300 235 C 310 330 260 395 170 395 C 80 395 25 340 30 260 Z" fill="#fff8e6" stroke="${OL}" stroke-width="7" stroke-linejoin="round"/>`);
// ---- claw machine: claw and toys ----
add("claw", 240, 300, `<path d="M120 0 L120 120" stroke="#9c93b0" stroke-width="10"/><rect x="80" y="110" width="80" height="50" rx="12" fill="#ffd166" stroke="${OL}" stroke-width="6"/>
  <path d="M90 160 Q 40 210 70 280 M150 160 Q 200 210 170 280 M120 160 L120 270" stroke="${OL}" stroke-width="12" fill="none" stroke-linecap="round"/>`);
add("toy0", 220, 220, `<defs>${shade("t", "#e8c39e", "#c98b5a")}</defs><circle cx="60" cy="50" r="30" fill="url(#t)" stroke="${OL}" stroke-width="5"/><circle cx="160" cy="50" r="30" fill="url(#t)" stroke="${OL}" stroke-width="5"/>
  <circle cx="110" cy="110" r="80" fill="url(#t)" stroke="${OL}" stroke-width="6"/><ellipse cx="110" cy="140" rx="35" ry="26" fill="#f6e1c8"/>${eyes(85, 135, 100, 12)}<circle cx="110" cy="132" r="9" fill="${OL}"/>`);
add("toy1", 220, 220, `<defs>${shade("t", "#fff3a8", "#ffd166")}</defs><ellipse cx="120" cy="150" rx="90" ry="60" fill="url(#t)" stroke="${OL}" stroke-width="6"/>
  <circle cx="80" cy="80" r="52" fill="url(#t)" stroke="${OL}" stroke-width="6"/><path d="M28 85 L-5 95 L28 105Z" fill="#ffab76" stroke="${OL}" stroke-width="4"/>${eyes(65, 100, 75, 10)}`);
add("toy2", 220, 220, `<defs>${shade("t", "#ffe3ec", "#ffb3c6")}</defs><ellipse cx="80" cy="45" rx="20" ry="45" fill="url(#t)" stroke="${OL}" stroke-width="5"/><ellipse cx="140" cy="45" rx="20" ry="45" fill="url(#t)" stroke="${OL}" stroke-width="5"/>
  <circle cx="110" cy="130" r="80" fill="url(#t)" stroke="${OL}" stroke-width="6"/>${eyes(85, 135, 120, 12)}${smile(110, 150, 30)}`);
add("toy3", 220, 220, `<path d="M110 10 L140 80 L215 85 L155 130 L175 205 L110 165 L45 205 L65 130 L5 85 L80 80 Z" fill="#ffd166" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>${eyes(90, 130, 110, 10)}`);
add("toy4", 220, 220, `<defs>${shade("t", "#bfe8ff", "#7bc4e8")}</defs><circle cx="110" cy="110" r="95" fill="url(#t)" stroke="${OL}" stroke-width="6"/><path d="M15 110 Q 110 60 205 110 M110 15 Q 70 110 110 205" stroke="#fff" stroke-width="10" fill="none"/>`);
// ---- hot-air balloon ----
add("hab", 320, 440, `<path d="M160 10 C 40 10 10 140 70 230 L120 290 L200 290 L250 230 C 310 140 280 10 160 10 Z" fill="#ff8fa3" stroke="${OL}" stroke-width="7"/>
  <path d="M160 10 C 110 60 110 220 130 290 L190 290 C 210 220 210 60 160 10 Z" fill="#ffd166" stroke="${OL}" stroke-width="5"/>
  <path d="M125 290 L130 350 M195 290 L190 350" stroke="${OL}" stroke-width="5"/><rect x="115" y="345" width="90" height="70" rx="10" fill="#c98b5a" stroke="${OL}" stroke-width="6"/>
  ${eyes(140, 180, 160, 13)}${smile(160, 195, 34)}`);
// ---- boat and lighthouse ----
add("boat", 340, 300, `<path d="M170 20 L170 200" stroke="${OL}" stroke-width="8"/><path d="M175 30 L300 190 L175 190Z" fill="#fff" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
  <path d="M165 50 L60 190 L165 190Z" fill="#ffd166" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
  <path d="M20 205 L320 205 L280 285 L60 285 Z" fill="#e5536f" stroke="${OL}" stroke-width="7" stroke-linejoin="round"/>${[110, 170, 230].map(x => `<circle cx="${x}" cy="245" r="14" fill="#fff" stroke="${OL}" stroke-width="4"/>`).join("")}`);
add("lighthouse", 300, 620, `<path d="M100 600 L130 160 L170 160 L200 600 Z" fill="#fff" stroke="${OL}" stroke-width="7"/>
  ${[260, 380, 500].map(y => `<path d="M${115 - (y - 160) * 0.02 * 1} ${y} L${185 + (y - 160) * 0.02} ${y} L${190 + (y - 160) * 0.02} ${y + 50} L${110 - (y - 160) * 0.02} ${y + 50}Z" fill="#e5536f"/>`).join("")}
  <rect x="110" y="90" width="80" height="70" rx="10" fill="#ffe066" stroke="${OL}" stroke-width="6"/><path d="M95 95 L150 30 L205 95Z" fill="#e5536f" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
  <path d="M190 115 L290 80 L290 150Z M110 115 L10 80 L10 150Z" fill="#fff6c4" opacity=".8"/><rect x="60" y="590" width="180" height="25" rx="8" fill="#b8a99a" stroke="${OL}" stroke-width="5"/>`);
// ---- cookies ----
add("cookie", 160, 160, `<circle cx="80" cy="80" r="70" fill="#e8b46a" stroke="${OL}" stroke-width="6"/>${[[55, 55], [100, 50], [70, 100], [110, 95], [45, 85]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#6b4f3a"/>`).join("")}`);
add("cookie_dough", 160, 160, `<circle cx="80" cy="80" r="62" fill="#f6e1c8" stroke="#d9b98f" stroke-width="5" stroke-dasharray="10 8"/>`);
// ---- butterflies, net and jar ----
[["#ffb3c6", "#ff8fa3"], ["#c3b5ff", "#a991ff"], ["#ffd8a8", "#ffab76"]].forEach(([a, b], k) => add(`bfly${k}`, 300, 240, `
  <ellipse cx="85" cy="85" rx="75" ry="65" fill="${a}" stroke="${OL}" stroke-width="6"/><ellipse cx="215" cy="85" rx="75" ry="65" fill="${a}" stroke="${OL}" stroke-width="6"/>
  <ellipse cx="100" cy="175" rx="55" ry="45" fill="${b}" stroke="${OL}" stroke-width="6"/><ellipse cx="200" cy="175" rx="55" ry="45" fill="${b}" stroke="${OL}" stroke-width="6"/>
  <ellipse cx="150" cy="130" rx="22" ry="80" fill="${OL}"/><path d="M140 55 q -20 -40 -40 -45 M160 55 q 20 -40 40 -45" stroke="${OL}" stroke-width="5" fill="none"/>`));
add("glassjar", 320, 420, `<rect x="40" y="70" width="240" height="330" rx="40" fill="#eef9ff" stroke="${OL}" stroke-width="7" opacity=".95"/><rect x="60" y="30" width="200" height="50" rx="14" fill="#9ad3b8" stroke="${OL}" stroke-width="6"/>
  <path d="M70 120 L70 300" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity=".8"/>`);
// ---- camel and oasis ----
add("camel", 380, 320, `<defs>${shade("c", "#f2d0a0", "#d9a273")}</defs>
  ${[110, 160, 250, 300].map(x => `<path d="M${x} 210 L${x} 305" stroke="#c98b5a" stroke-width="20" stroke-linecap="round"/>`).join("")}
  <path d="M90 220 C 80 120 140 90 170 140 C 190 70 260 70 280 140 C 300 160 310 200 300 220 Z" fill="url(#c)" stroke="${OL}" stroke-width="6"/>
  <path d="M95 190 C 50 160 40 100 60 60" stroke="#d9a273" stroke-width="34" fill="none" stroke-linecap="round"/>
  <ellipse cx="50" cy="55" rx="45" ry="32" fill="url(#c)" stroke="${OL}" stroke-width="6"/>${eyes(35, 60, 45, 10)}${smile(40, 70, 20)}
  <rect x="160" y="120" width="120" height="30" rx="10" fill="#e5536f" stroke="${OL}" stroke-width="4"/>`);
add("oasis", 460, 380, `<ellipse cx="230" cy="320" rx="210" ry="50" fill="#8fd3ec" stroke="${OL}" stroke-width="6"/>
  ${[[140, 300], [330, 300]].map(([x, y]) => `<path d="M${x} ${y} Q ${x + 10} 180 ${x - 10} 90" stroke="#b07a4a" stroke-width="20" fill="none" stroke-linecap="round"/>
  ${[[-70, 30], [-30, -20], [30, -20], [70, 30]].map(([dx, dy]) => `<path d="M${x - 10} 90 q ${dx * 0.6} ${dy - 40} ${dx} ${dy + 10}" stroke="#4fbf6a" stroke-width="22" fill="none" stroke-linecap="round"/>`).join("")}`).join("")}`);
// ---- sorting buttons: sun / moon, say it / skip it ----
add("sun", 300, 300, `${Array.from({ length: 12 }, (_, k) => `<path d="M150 150 L${150 + 140 * Math.cos(k * Math.PI / 6)} ${150 + 140 * Math.sin(k * Math.PI / 6)}" stroke="#ffb347" stroke-width="16" stroke-linecap="round"/>`).join("")}
  <circle cx="150" cy="150" r="90" fill="#ffd166" stroke="${OL}" stroke-width="7"/>${eyes(125, 175, 140, 14)}${smile(150, 175, 40)}${cheeks(110, 190, 170)}`);
add("moon", 300, 300, `${[[60, 60], [250, 90], [230, 250]].map(([x, y]) => `<path d="M${x} ${y - 14} l4 10 l11 0 l-9 7 l3 11 l-9 -6 l-9 6 l3 -11 l-9 -7 l11 0z" fill="#ffd166"/>`).join("")}
  <path d="M190 40 A 120 120 0 1 0 220 250 A 100 100 0 1 1 190 40 Z" fill="#fff3a8" stroke="${OL}" stroke-width="7"/><circle cx="110" cy="150" r="10" fill="${OL}"/>${smile(115, 190, 34)}`);
add("face_say", 300, 300, `<circle cx="150" cy="150" r="130" fill="#ffd9b3" stroke="${OL}" stroke-width="7"/>${eyes(110, 190, 120, 18)}
  <ellipse cx="150" cy="200" rx="45" ry="38" fill="#8a2246" stroke="${OL}" stroke-width="6"/><ellipse cx="150" cy="218" rx="25" ry="14" fill="#ff8fa3"/>
  ${[0, 1, 2].map(k => `<path d="M${255 + k * 0} ${150 + (k - 1) * 45} q 20 ${(k - 1) * 10} 35 ${(k - 1) * 25}" stroke="#8a6cf0" stroke-width="8" fill="none" stroke-linecap="round"/>`).join("")}`);
add("face_shh", 300, 300, `<circle cx="150" cy="150" r="130" fill="#ffd9b3" stroke="${OL}" stroke-width="7"/><path d="M95 120 q 20 -15 40 0 M165 120 q 20 -15 40 0" stroke="${OL}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M115 205 L185 205" stroke="${OL}" stroke-width="7" stroke-linecap="round"/><rect x="138" y="140" width="26" height="110" rx="13" fill="#ffc9a0" stroke="${OL}" stroke-width="5"/>`);
// ---- class game: apple tree, apple, basket ----
add("tree", 700, 760, `<path d="M330 750 Q 320 560 350 420" stroke="#b07a4a" stroke-width="60" fill="none" stroke-linecap="round"/>
  <circle cx="350" cy="300" r="240" fill="#95e1a3" stroke="${OL}" stroke-width="7"/><circle cx="200" cy="360" r="130" fill="#a7e8bd" stroke="${OL}" stroke-width="7"/><circle cx="500" cy="360" r="130" fill="#a7e8bd" stroke="${OL}" stroke-width="7"/>`);
add("apple", 110, 120, `<path d="M55 30 C 20 10 0 50 10 80 C 20 110 45 118 55 108 C 65 118 90 110 100 80 C 110 50 90 10 55 30 Z" fill="#e5536f" stroke="${OL}" stroke-width="5"/>
  <path d="M55 30 L60 5" stroke="${OL}" stroke-width="5"/><path d="M60 15 q 20 -15 35 -5 q -20 10 -35 5z" fill="#4fbf6a"/>`);
add("basket", 320, 220, `<path d="M20 70 L300 70 L265 210 L55 210 Z" fill="#d4a373" stroke="${OL}" stroke-width="7" stroke-linejoin="round"/>
  ${[100, 160, 220].map(x => `<path d="M${x} 75 L${x - 10 + (x - 160) * 0.1} 205" stroke="#a87b4f" stroke-width="5"/>`).join("")}<path d="M40 120 L280 120 M50 165 L270 165" stroke="#a87b4f" stroke-width="5"/>
  <path d="M60 70 Q 160 -40 260 70" stroke="#a87b4f" stroke-width="12" fill="none"/>`);
// ---- calm backgrounds ----
const BG = {
  dino: `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1e3"/><stop offset="1" stop-color="#eaf8e4"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#s)"/>
    <path d="M1300 520 L1500 230 L1560 230 L1760 520Z" fill="#f2d6c0" opacity=".7"/><path d="M0 860 Q 960 780 1920 860 L1920 1080 L0 1080Z" fill="#cdeccf"/>
    <ellipse cx="960" cy="930" rx="760" ry="70" fill="#f6e3b8"/>`,
  arcade: `<rect width="1920" height="1080" fill="#f7f1ff"/><rect x="560" y="170" width="1320" height="760" rx="40" fill="#ffe3ec" stroke="#f2a9be" stroke-width="16"/>
    <rect x="600" y="210" width="1240" height="560" rx="24" fill="#f0fbff" stroke="#c9dff0" stroke-width="8"/><rect x="600" y="210" width="1240" height="24" fill="#c9dff0"/>
    <rect x="600" y="790" width="1240" height="110" rx="20" fill="#ffd6e0"/><rect y="960" width="1920" height="120" fill="#ede4f7"/>`,
  clouds: `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe7ff"/><stop offset="1" stop-color="#fdf0f5"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#s)"/>
    ${[[200, 250, 1.4], [700, 160, 1], [1500, 260, 1.2], [400, 620, 1], [1250, 560, 0.9], [900, 880, 1.3]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity=".85"><ellipse cx="0" cy="0" rx="130" ry="45"/><circle cx="-55" cy="-25" r="48"/><circle cx="35" cy="-35" r="60"/></g>`).join("")}`,
  sea2: `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3f3ff"/><stop offset="1" stop-color="#fff4ea"/></linearGradient></defs><rect width="1920" height="560" fill="url(#s)"/>
    <rect y="540" width="1920" height="540" fill="#a8dcf0"/>${[[300, 700], [900, 820], [1500, 680], [600, 960], [1300, 980]].map(([x, y]) => `<path d="M${x - 60} ${y} q 30 -16 60 0 q 30 16 60 0" stroke="#fff" stroke-width="6" fill="none" opacity=".7"/>`).join("")}`,
  desert: `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0dc"/><stop offset="1" stop-color="#ffe7cc"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#s)"/>
    <circle cx="1650" cy="200" r="90" fill="#ffd166" opacity=".6"/><path d="M0 760 Q 400 640 800 740 T 1920 720 L1920 1080 L0 1080Z" fill="#f6d9a8"/><path d="M0 900 Q 600 830 1200 900 T 1920 880 L1920 1080 L0 1080Z" fill="#f0cc92"/>`,
  daynight: `<rect width="960" height="1080" fill="#fff6dc"/><rect x="960" width="960" height="1080" fill="#e6e1ff"/>
    ${[[1150, 200], [1400, 120], [1700, 260], [1300, 420], [1800, 500]].map(([x, y]) => `<path d="M${x} ${y - 14} l4 10 l11 0 l-9 7 l3 11 l-9 -6 l-9 6 l3 -11 l-9 -7 l11 0z" fill="#fff"/>`).join("")}
    <path d="M0 900 Q 480 860 960 900 L960 1080 L0 1080Z" fill="#d6efc8"/><path d="M960 900 Q 1440 860 1920 900 L1920 1080 L960 1080Z" fill="#cdd5f2"/>`,
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
