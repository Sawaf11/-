// Pictures for the fun games (flat, soft colours, rounded shapes, like ../harakat-games/art.js), to assets/img.
const fs = require("fs");
const path = require("path");
const { chromium } = require(process.env.PLAYWRIGHT || "/opt/node-tools/node_modules/playwright");
const OL = "#3b2f4a";
const svg = (w, h, inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner}</svg>`;
const shade = (id, a, b) => `<radialGradient id="${id}" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;
const eyes = (x1, x2, y, r = 22) => `<circle cx="${x1}" cy="${y}" r="${r}" fill="#fff" stroke="${OL}" stroke-width="5"/><circle cx="${x2}" cy="${y}" r="${r}" fill="#fff" stroke="${OL}" stroke-width="5"/>
  <circle cx="${x1 - 4}" cy="${y + 3}" r="${r * 0.48}" fill="${OL}"/><circle cx="${x2 - 4}" cy="${y + 3}" r="${r * 0.48}" fill="${OL}"/><circle cx="${x1 - 8}" cy="${y - 3}" r="${r * 0.18}" fill="#fff"/><circle cx="${x2 - 8}" cy="${y - 3}" r="${r * 0.18}" fill="#fff"/>`;
const smile = (x, y, w = 50) => `<path d="M${x - w / 2} ${y} q ${w / 2} ${w * 0.55} ${w} 0" stroke="${OL}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
const cheeks = (x1, x2, y) => `<ellipse cx="${x1}" cy="${y}" rx="18" ry="10" fill="#ff8fa3" opacity=".6"/><ellipse cx="${x2}" cy="${y}" rx="18" ry="10" fill="#ff8fa3" opacity=".6"/>`;
const I = [];
const add = (name, w, h, inner, jpg) => I.push({ name, w, h, svg: svg(w, h, inner), jpg });

// ---- frog, lily pad, island ----
add("frog", 300, 260, `<defs>${shade("g", "#b8f0a0", "#4fbf6a")}</defs>
  <ellipse cx="150" cy="170" rx="120" ry="80" fill="url(#g)" stroke="${OL}" stroke-width="6"/>
  <ellipse cx="60" cy="235" rx="50" ry="18" fill="#4fbf6a" stroke="${OL}" stroke-width="5"/><ellipse cx="240" cy="235" rx="50" ry="18" fill="#4fbf6a" stroke="${OL}" stroke-width="5"/>
  <circle cx="95" cy="85" r="42" fill="url(#g)" stroke="${OL}" stroke-width="6"/><circle cx="205" cy="85" r="42" fill="url(#g)" stroke="${OL}" stroke-width="6"/>
  ${eyes(95, 205, 85, 24)}${smile(150, 175, 90)}${cheeks(80, 220, 170)}`);
add("lilypad", 360, 160, `<path d="M180 80 L340 60 A 170 75 0 1 1 330 40 Z" fill="#8fd88a" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M180 80 L60 50 M180 80 L90 130 M180 80 L270 130" stroke="#5fb760" stroke-width="5" stroke-linecap="round"/>`);
add("island", 460, 360, `<ellipse cx="230" cy="300" rx="220" ry="60" fill="#f6dfa5" stroke="${OL}" stroke-width="6"/>
  <path d="M300 290 Q 310 170 280 70" stroke="#b07a4a" stroke-width="22" fill="none" stroke-linecap="round"/>
  ${[[-70, 40], [-20, -10], [40, 0], [90, 50]].map(([dx, dy]) => `<path d="M280 70 q ${dx} ${dy - 50} ${dx * 1.8} ${dy + 20}" stroke="#4fbf6a" stroke-width="26" fill="none" stroke-linecap="round"/>`).join("")}
  <rect x="80" y="210" width="150" height="95" rx="12" fill="#e8a13a" stroke="${OL}" stroke-width="6"/><path d="M80 235 Q 155 170 230 235" fill="#f2b84b" stroke="${OL}" stroke-width="6"/>
  <rect x="142" y="230" width="26" height="34" rx="5" fill="#ffd166" stroke="${OL}" stroke-width="4"/>`);
// ---- football and goalkeeper ----
add("ball", 140, 140, `<circle cx="70" cy="70" r="62" fill="#fff" stroke="${OL}" stroke-width="6"/><path d="M70 42 L95 60 L86 90 L54 90 L45 60 Z" fill="${OL}"/>
  <path d="M70 42 L70 10 M95 60 L128 50 M86 90 L105 120 M54 90 L35 120 M45 60 L12 50" stroke="${OL}" stroke-width="5"/>`);
const keeper = mode => {
  const arms = mode === "hold" ? `<path d="M110 200 Q 150 230 190 200" stroke="${OL}" stroke-width="22" fill="none" stroke-linecap="round"/><circle cx="150" cy="215" r="40" fill="#fff" stroke="${OL}" stroke-width="5"/><path d="M150 195 L165 207 L160 225 L140 225 L135 207Z" fill="${OL}"/>`
    : `<path d="M95 175 L40 80 M205 175 L260 80" stroke="#ffb3c6" stroke-width="26" stroke-linecap="round"/><circle cx="40" cy="72" r="24" fill="#ffd166" stroke="${OL}" stroke-width="5"/><circle cx="260" cy="72" r="24" fill="#ffd166" stroke="${OL}" stroke-width="5"/>`;
  return svg(300, 360, `<rect x="95" y="160" width="110" height="120" rx="30" fill="#ffd166" stroke="${OL}" stroke-width="6"/>
    <path d="M115 280 L105 345 M185 280 L195 345" stroke="#6b5b95" stroke-width="26" stroke-linecap="round"/>${arms}
    <circle cx="150" cy="110" r="58" fill="#ffd9b3" stroke="${OL}" stroke-width="6"/><path d="M95 95 Q 150 30 205 95" fill="#6b4f3a"/>
    ${eyes(128, 172, 112, 13)}${mode === "hold" ? smile(150, 140, 36) : `<ellipse cx="150" cy="146" rx="12" ry="9" fill="${OL}"/>`}`);
};
I.push({ name: "keeper", w: 300, h: 360, svg: keeper("stand") }, { name: "keeper_hold", w: 300, h: 360, svg: keeper("hold") });
// ---- robot, step by step: 0 dotted outline ... 5 complete ----
const robot = n => svg(420, 640, `<defs>${shade("m", "#d6f1ff", "#7bc4e8")}${shade("b", "#ffd6e0", "#ff8fa3")}</defs>
  <ellipse cx="210" cy="615" rx="170" ry="20" fill="#d9d2e9"/>
  <g fill="none" stroke="#b9b0cc" stroke-width="5" stroke-dasharray="14 12">
    <rect x="150" y="470" width="40" height="130" rx="12"/><rect x="230" y="470" width="40" height="130" rx="12"/><rect x="110" y="290" width="200" height="190" rx="30"/>
    <rect x="40" y="300" width="60" height="150" rx="25"/><rect x="320" y="300" width="60" height="150" rx="25"/><rect x="120" y="120" width="180" height="160" rx="36"/><path d="M210 120 L210 60"/></g>
  ${n >= 1 ? `<rect x="150" y="470" width="40" height="130" rx="12" fill="#9aa5b8" stroke="${OL}" stroke-width="6"/><rect x="230" y="470" width="40" height="130" rx="12" fill="#9aa5b8" stroke="${OL}" stroke-width="6"/>
    <rect x="130" y="585" width="80" height="30" rx="12" fill="#6b7a99" stroke="${OL}" stroke-width="5"/><rect x="210" y="585" width="80" height="30" rx="12" fill="#6b7a99" stroke="${OL}" stroke-width="5"/>` : ""}
  ${n >= 2 ? `<rect x="110" y="290" width="200" height="190" rx="30" fill="url(#m)" stroke="${OL}" stroke-width="6"/><rect x="150" y="330" width="120" height="80" rx="14" fill="#fff8e6" stroke="${OL}" stroke-width="5"/>
    ${[175, 210, 245].map((x, k) => `<circle cx="${x}" cy="370" r="13" fill="${["#ff8fa3", "#ffd166", "#95e1a3"][k]}" stroke="${OL}" stroke-width="3"/>`).join("")}` : ""}
  ${n >= 3 ? `<rect x="40" y="300" width="60" height="150" rx="25" fill="#9aa5b8" stroke="${OL}" stroke-width="6"/><rect x="320" y="300" width="60" height="150" rx="25" fill="#9aa5b8" stroke="${OL}" stroke-width="6"/>
    <circle cx="70" cy="465" r="26" fill="#ffd166" stroke="${OL}" stroke-width="5"/><circle cx="350" cy="465" r="26" fill="#ffd166" stroke="${OL}" stroke-width="5"/>` : ""}
  ${n >= 4 ? `<rect x="120" y="120" width="180" height="160" rx="36" fill="url(#m)" stroke="${OL}" stroke-width="6"/><rect x="190" y="270" width="40" height="30" fill="#9aa5b8" stroke="${OL}" stroke-width="5"/>
    ${eyes(175, 245, 185, 24)}${smile(210, 235, 56)}${cheeks(150, 270, 230)}` : ""}
  ${n >= 5 ? `<path d="M210 120 L210 60" stroke="${OL}" stroke-width="7"/><circle cx="210" cy="48" r="22" fill="url(#b)" stroke="${OL}" stroke-width="5"/>
    <path d="M330 120 l10 -25 l10 25 l25 10 l-25 10 l-10 25 l-10 -25 l-25 -10z M70 170 l7 -18 l7 18 l18 7 l-18 7 l-7 18 l-7 -18 l-18 -7z" fill="#ffd166"/>` : ""}`);
for (let n = 0; n <= 5; n++) I.push({ name: `robot${n}`, w: 420, h: 640, svg: robot(n) });
// ---- ice cream: cone + n scoops (5 = with a cherry) ----
const SCOOP = [["#ffd6e0", "#ff8fa3"], ["#fff3c4", "#ffd166"], ["#d4f5d0", "#7fd08a"], ["#e3dcff", "#a991ff"], ["#ffe0c7", "#ffab76"]];
const ice = n => svg(380, 800, `<defs>${SCOOP.map(([a, b], k) => shade("s" + k, a, b)).join("")}</defs>
  <path d="M110 560 L270 560 L190 790 Z" fill="#f2c27b" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
  <path d="M130 600 L250 600 M145 650 L235 650 M160 700 L220 700 M150 570 L210 740 M230 570 L170 740" stroke="#d99a4e" stroke-width="5"/>
  ${Array.from({ length: n }, (_, k) => `<circle cx="190" cy="${505 - k * 92}" r="98" fill="url(#s${k})" stroke="${OL}" stroke-width="6"/>
    <path d="M100 ${530 - k * 92} q 30 25 60 0 q 30 25 60 0 q 30 25 60 0" fill="none" stroke="${OL}" stroke-width="5" opacity=".35"/>`).join("")}
  ${n === 5 ? `<path d="M195 55 q 20 -40 50 -45" stroke="${OL}" stroke-width="5" fill="none"/><circle cx="190" cy="70" r="30" fill="#e5536f" stroke="${OL}" stroke-width="5"/><circle cx="180" cy="60" r="8" fill="#fff" opacity=".7"/>` : ""}
  ${n >= 1 ? `${eyes(160, 220, 490, 14)}${smile(190, 525, 34)}` : ""}`);
for (let n = 0; n <= 5; n++) I.push({ name: `ice${n}`, w: 380, h: 800, svg: ice(n) });
// ---- rocket and its flame ----
add("rocket", 300, 560, `<defs>${shade("r", "#ffffff", "#d9e2f2")}</defs>
  <path d="M60 400 L10 500 L90 470Z M240 400 L290 500 L210 470Z" fill="#e5536f" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
  <path d="M150 20 C 260 120 250 330 230 480 L70 480 C 50 330 40 120 150 20 Z" fill="url(#r)" stroke="${OL}" stroke-width="7"/>
  <path d="M150 20 C 200 60 222 100 232 140 L68 140 C 78 100 100 60 150 20Z" fill="#e5536f" stroke="${OL}" stroke-width="6"/>
  <circle cx="150" cy="250" r="50" fill="#bfe8ff" stroke="${OL}" stroke-width="7"/>${eyes(132, 168, 250, 11)}
  <rect x="85" y="470" width="130" height="40" rx="10" fill="#8a6cf0" stroke="${OL}" stroke-width="6"/>`);
add("flame", 200, 260, `<path d="M100 250 C 20 170 40 80 100 10 C 160 80 180 170 100 250Z" fill="#ffb347" stroke="#f08a24" stroke-width="6"/><path d="M100 220 C 60 170 70 110 100 70 C 130 110 140 170 100 220Z" fill="#ffe066"/>`);
// ---- castle door and treasure ----
add("door", 320, 500, `<path d="M20 490 L20 170 A 140 140 0 0 1 300 170 L300 490 Z" fill="#c98b5a" stroke="${OL}" stroke-width="8"/>
  <path d="M60 490 L60 180 A 100 100 0 0 1 260 180 L260 490" fill="none" stroke="#a86e42" stroke-width="6"/>${[110, 160, 210].map(x => `<path d="M${x} 110 L${x} 490" stroke="#a86e42" stroke-width="5"/>`).join("")}
  <circle cx="240" cy="330" r="16" fill="#ffd166" stroke="${OL}" stroke-width="5"/><rect x="40" y="250" width="240" height="18" fill="#7a5c45" opacity=".6"/>`);
add("chest", 440, 360, `<rect x="40" y="170" width="360" height="170" rx="20" fill="#e8a13a" stroke="${OL}" stroke-width="7"/>
  ${[[90, 120], [150, 90], [220, 80], [290, 95], [350, 125]].map(([x, y]) => `<circle cx="${x}" cy="${y + 70}" r="34" fill="#ffd166" stroke="#e0a800" stroke-width="5"/>`).join("")}
  <path d="M30 40 L410 40 L400 150 L40 150 Z" fill="#f2b84b" stroke="${OL}" stroke-width="7" stroke-linejoin="round" transform="rotate(-8 220 150)"/>
  <rect x="195" y="200" width="50" height="60" rx="8" fill="#ffd166" stroke="${OL}" stroke-width="5"/>
  <path d="M90 60 l8 -20 l8 20 l20 8 l-20 8 l-8 20 l-8 -20 l-20 -8z M360 40 l6 -15 l6 15 l15 6 l-15 6 l-6 15 l-6 -15 l-15 -6z" fill="#fff6c4"/>`);
// ---- mystery pictures (each a little scene, 960x720) ----
add("pic_lion", 960, 720, `<rect width="960" height="720" fill="#fff4d6"/><circle cx="800" cy="130" r="70" fill="#ffd166" opacity=".8"/><path d="M0 600 Q 480 540 960 600 L960 720 L0 720Z" fill="#cdeccf"/>
  ${Array.from({ length: 16 }, (_, k) => { const a = k * Math.PI / 8; return `<ellipse cx="${480 + 210 * Math.cos(a)}" cy="${360 + 210 * Math.sin(a)}" rx="80" ry="60" fill="#e8913a" stroke="${OL}" stroke-width="6" transform="rotate(${k * 22.5} ${480 + 210 * Math.cos(a)} ${360 + 210 * Math.sin(a)})"/>`; }).join("")}
  <circle cx="480" cy="360" r="200" fill="#ffc46b" stroke="${OL}" stroke-width="7"/><circle cx="345" cy="215" r="40" fill="#ffc46b" stroke="${OL}" stroke-width="6"/><circle cx="615" cy="215" r="40" fill="#ffc46b" stroke="${OL}" stroke-width="6"/>
  ${eyes(410, 550, 330, 34)}<ellipse cx="480" cy="420" rx="40" ry="28" fill="#8a4b2a"/><path d="M480 448 L480 475 M430 485 Q 480 520 530 485" stroke="${OL}" stroke-width="7" fill="none" stroke-linecap="round"/>${cheeks(370, 590, 430)}`, true);
add("pic_whale", 960, 720, `<rect width="960" height="720" fill="#dff4ff"/><path d="M0 470 Q 240 430 480 470 T 960 470 L960 720 L0 720Z" fill="#8fd3ec"/>
  <path d="M480 150 q -20 -60 -60 -70 M480 150 q 20 -60 60 -70 M480 150 L480 230" stroke="#7bc4e8" stroke-width="16" fill="none" stroke-linecap="round"/>
  <path d="M180 430 C 180 260 330 230 480 230 C 650 230 760 330 760 430 C 760 520 650 560 480 560 C 330 560 180 530 180 430 Z" fill="#6aa9e9" stroke="${OL}" stroke-width="7"/>
  <path d="M740 420 L880 330 Q 860 420 880 510 Z" fill="#6aa9e9" stroke="${OL}" stroke-width="7" stroke-linejoin="round"/>
  <path d="M220 470 C 300 540 500 540 640 480" fill="#dff1ff" stroke="${OL}" stroke-width="5"/>${eyes(300, 380, 380, 26)}${smile(340, 440, 70)}${cheeks(270, 420, 430)}`, true);
add("pic_balloon", 960, 720, `<rect width="960" height="720" fill="#e9f5ff"/>${[[160, 160], [780, 110], [700, 520]].map(([x, y]) => `<g fill="#fff" opacity=".9"><ellipse cx="${x}" cy="${y}" rx="90" ry="34"/><circle cx="${x - 40}" cy="${y - 20}" r="40"/><circle cx="${x + 30}" cy="${y - 25}" r="48"/></g>`).join("")}
  <path d="M480 80 C 300 80 260 300 400 420 L560 420 C 700 300 660 80 480 80 Z" fill="#ff8fa3" stroke="${OL}" stroke-width="7"/>
  <path d="M480 80 C 420 150 420 330 450 420 M480 80 C 540 150 540 330 510 420" stroke="${OL}" stroke-width="5" fill="#ffd166"/>
  <path d="M410 420 L430 520 M550 420 L530 520" stroke="${OL}" stroke-width="5"/><rect x="420" y="515" width="120" height="85" rx="12" fill="#c98b5a" stroke="${OL}" stroke-width="6"/>
  <circle cx="460" cy="500" r="24" fill="#ffd9b3" stroke="${OL}" stroke-width="4"/><circle cx="505" cy="500" r="24" fill="#ffd9b3" stroke="${OL}" stroke-width="4"/>`, true);
// ---- tug of war ----
add("rope", 1700, 90, `<path d="M10 45 Q 425 20 850 45 T 1690 45" stroke="#c98b5a" stroke-width="26" fill="none" stroke-linecap="round"/>
  <path d="M10 45 Q 425 20 850 45 T 1690 45" stroke="#a86e42" stroke-width="5" stroke-dasharray="18 16" fill="none"/>`);
add("flag", 90, 160, `<path d="M45 10 L45 150" stroke="${OL}" stroke-width="7"/><path d="M45 15 L85 35 L45 55Z" fill="#ffd166" stroke="${OL}" stroke-width="4"/><circle cx="45" cy="95" r="20" fill="#ffd166" stroke="${OL}" stroke-width="5"/>`);
[["red", "#ff8fa3", "#e5536f", 1], ["blue", "#7bdff2", "#3fa7c9", -1]].forEach(([n, a, b, dir]) =>
  add(`puller_${n}`, 280, 320, `<defs>${shade("g", a, b)}</defs><g transform="${dir < 0 ? "translate(280 0) scale(-1 1)" : ""}">
    <path d="M90 230 L60 310 M150 230 L190 310" stroke="${OL}" stroke-width="16" stroke-linecap="round"/>
    <ellipse cx="120" cy="170" rx="95" ry="105" fill="url(#g)" stroke="${OL}" stroke-width="6" transform="rotate(-12 120 170)"/>
    <path d="M190 160 L270 150" stroke="${OL}" stroke-width="16" stroke-linecap="round"/>
    <circle cx="105" cy="125" r="18" fill="#fff" stroke="${OL}" stroke-width="4"/><circle cx="155" cy="120" r="18" fill="#fff" stroke="${OL}" stroke-width="4"/><circle cx="110" cy="127" r="8" fill="${OL}"/><circle cx="160" cy="122" r="8" fill="${OL}"/>
    <path d="M110 175 q 25 15 50 0" stroke="${OL}" stroke-width="6" fill="none" stroke-linecap="round"/></g>`));
// ---- calm backgrounds (1920x1080) ----
const BG = {
  river: `<defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d6f2ff"/><stop offset="1" stop-color="#a8dcf0"/></linearGradient></defs>
    <rect width="1920" height="1080" fill="url(#w)"/><rect width="1920" height="170" fill="#eaf7ff"/>
    <path d="M1700 170 Q 1760 600 1700 1080 L1920 1080 L1920 170Z" fill="#c9ecc0"/><path d="M220 170 Q 160 600 220 1080 L0 1080 L0 170Z" fill="#f6e3b8"/>
    ${[[500, 320], [900, 700], [1300, 380], [700, 950], [1500, 860], [1100, 240]].map(([x, y]) => `<path d="M${x - 50} ${y} q 25 -14 50 0 q 25 14 50 0" stroke="#fff" stroke-width="5" fill="none" opacity=".7"/>`).join("")}`,
  pitch: `<rect width="1920" height="1080" fill="#e6f7e1"/>${Array.from({ length: 8 }, (_, k) => `<rect x="0" y="${400 + k * 85}" width="1920" height="42" fill="#d6f0cf"/>`).join("")}
    <rect width="1920" height="190" fill="#eaf4ff"/><path d="M380 600 L1540 600" stroke="#fff" stroke-width="10"/><ellipse cx="960" cy="960" rx="14" ry="8" fill="#fff"/>
    <rect x="420" y="190" width="1080" height="410" fill="#fbfdff" opacity=".7"/>
    <g stroke="#cfd8e3" stroke-width="3">${Array.from({ length: 22 }, (_, k) => `<path d="M${440 + k * 50} 200 L${440 + k * 50} 600"/>`).join("")}${Array.from({ length: 8 }, (_, k) => `<path d="M420 ${220 + k * 50} L1500 ${220 + k * 50}"/>`).join("")}</g>
    <path d="M410 600 L410 180 L1510 180 L1510 600" stroke="#fff" stroke-width="26" fill="none"/><path d="M410 600 L410 180 L1510 180 L1510 600" stroke="#c9d3df" stroke-width="4" fill="none"/>`,
  lab: `<rect width="1920" height="1080" fill="#f1f7ff"/><rect y="860" width="1920" height="220" fill="#dfe7f3"/>
    ${[[160, 220], [1700, 260], [1650, 700]].map(([x, y]) => `<g opacity=".55"><circle cx="${x}" cy="${y}" r="70" fill="none" stroke="#b5c8e8" stroke-width="18" stroke-dasharray="30 18"/><circle cx="${x}" cy="${y}" r="26" fill="#b5c8e8"/></g>`).join("")}`,
  parlor: `<rect width="1920" height="1080" fill="#fff5f8"/>${Array.from({ length: 13 }, (_, k) => `<rect x="${k * 160}" y="0" width="80" height="1080" fill="#ffe8ef"/>`).join("")}
    <path d="M0 0 L1920 0 L1920 110 ${Array.from({ length: 12 }, (_, k) => `Q ${1840 - k * 160} 180 ${1760 - k * 160} 110`).join(" ")} Q 80 180 0 110Z" fill="#ffb3c6"/><rect y="880" width="1920" height="200" fill="#f3d9c4"/>`,
  launch: `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9d4ff"/><stop offset=".7" stop-color="#ffe3ec"/><stop offset="1" stop-color="#fff1df"/></linearGradient></defs>
    <rect width="1920" height="1080" fill="url(#s)"/>${[[200, 150], [500, 260], [1450, 120], [1750, 300], [1100, 200], [800, 90]].map(([x, y]) => `<path d="M${x} ${y - 14} l4 10 l11 0 l-9 7 l3 11 l-9 -6 l-9 6 l3 -11 l-9 -7 l11 0z" fill="#fff" opacity=".9"/>`).join("")}
    <path d="M0 940 Q 960 880 1920 940 L1920 1080 L0 1080Z" fill="#cdeccf"/>`,
  castle: `<rect width="1920" height="1080" fill="#f4efff"/>${Array.from({ length: 12 }, (_, r) => Array.from({ length: 11 }, (_, c) => `<rect x="${c * 180 + (r % 2) * 90 - 90}" y="${r * 75}" width="170" height="65" rx="8" fill="#ece4fb"/>`).join("")).join("")}
    <rect y="880" width="1920" height="200" fill="#e2d6c8"/>${[160, 1760].map(x => `<path d="M${x - 60} 120 L${x + 60} 120 L${x + 60} 420 L${x} 380 L${x - 60} 420Z" fill="#ffb3c6" opacity=".8"/>`).join("")}`,
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
