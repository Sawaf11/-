const A = require('./art_common.js');
const { R, setSeed, star5, svg, lin, rad, OUTL, cloud, mushroom, flower, grassTufts, fireflies, tree } = A;
const W = 1920, H = 1080;
const hill = (pts, fill, extra = '') => `<path d="${pts}" fill="${fill}" ${extra}/>`;
const bgs = {};

// 1 ---- NIGHT NEST ----
setSeed(11);
{
  let s = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  for (let i = 0; i < 160; i++) s += `<circle cx="${R(0, W)}" cy="${R(0, 600)}" r="${R(1, 3.2)}" fill="#fff" opacity="${R(.4, 1)}"/>`;
  for (let i = 0; i < 14; i++) s += `<polygon points="${star5(R(40, W - 40), R(30, 500), R(8, 16), .4)}" fill="#FFF3B0" opacity="${R(.5, .95)}"/>`;
  s += `<circle cx="300" cy="200" r="260" fill="url(#moonGlow)"/><circle cx="300" cy="200" r="110" fill="#FFF6D6"/><circle cx="268" cy="176" r="22" fill="#F0E0B0" opacity=".7"/><circle cx="332" cy="238" r="30" fill="#F0E0B0" opacity=".6"/><circle cx="340" cy="160" r="14" fill="#F0E0B0" opacity=".6"/>`;
  s += cloud(1500, 230, 1.1, '#6B5BC4', .55) + cloud(900, 120, .8, '#6B5BC4', .4);
  s += hill(`M0 640 Q300 520 620 610 T1200 590 T1920 600 L1920 1080 L0 1080Z`, '#3A2F8A');
  s += hill(`M0 720 Q400 620 800 700 T1500 680 T1920 700 L1920 1080 L0 1080Z`, '#2A4A9A');
  s += tree(160, 760, .75, '#2E2562', '#2F6E8F', '#27597F') + tree(1760, 770, .8, '#2E2562', '#2F6E8F', '#27597F');
  s += hill(`M0 800 Q500 740 960 790 T1920 770 L1920 1080 L0 1080Z`, 'url(#grass)');
  s += grassTufts(820, 1070, 70, ['#5CE0A0', '#2FB27E']);
  // nest
  s += `<ellipse cx="960" cy="905" rx="430" ry="100" fill="#8A5A28" stroke="${OUTL}" stroke-width="6"/><ellipse cx="960" cy="885" rx="380" ry="72" fill="#D9A450"/>`;
  for (let i = 0; i < 70; i++) { const x = R(600, 1320), y = R(850, 930); s += `<path d="M${x} ${y} l${R(-70, 70)} ${R(-12, 12)}" stroke="${['#F2C873', '#B77B33', '#E8B25E'][i % 3]}" stroke-width="5" stroke-linecap="round"/>`; }
  // blanket
  s += `<path d="M720 905 Q960 960 1200 905 L1180 960 Q960 1010 740 960Z" fill="#7C6BE8" stroke="${OUTL}" stroke-width="4" opacity=".9"/>`;
  s += mushroom(330, 930, 1.1, '#5BE3D5', true, 'a') + mushroom(1590, 940, 1.3, '#FF7BC5', true, 'b') + mushroom(1470, 985, .7, '#A78BFF', true, 'a') + mushroom(450, 1000, .6, '#FF7BC5', true, 'b');
  s += flower(120, 980, 1.2, '#9EE7FF') + flower(1830, 990, 1.3, '#FFB3E6') + flower(250, 1040, 1, '#FFE066');
  s += fireflies(26, 400, 1000);
  bgs.bg_night = svg(W, H, s, lin('sky', [[0, '#0B1445'], [.5, '#32217A'], [1, '#B05AB0']]) + rad('moonGlow', [[0, '#FFF6D6', .5], [1, '#FFF6D6', 0]]) + lin('grass', [[0, '#2E9B73'], [1, '#14543F']]) +
    rad('mga', [[0, '#5BE3D5', .55], [1, '#5BE3D5', 0]]) + rad('mgb', [[0, '#FF7BC5', .55], [1, '#FF7BC5', 0]]));
}
// 2 ---- MAGIC FOREST ----
setSeed(22);
{
  let s = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  s += `<circle cx="1000" cy="260" r="360" fill="url(#sun)"/>`;
  for (let i = 0; i < 9; i++) s += `<polygon points="${960 + i * 20},0 ${300 + i * 210},1080 ${420 + i * 210},1080" fill="#FFF7C8" opacity=".07"/>`;
  for (let i = 0; i < 7; i++) s += tree(R(0, W), 640, R(.45, .6), '#4F7FA8', '#7FC8C0', '#69B4B8', false).replace(/<g /, '<g opacity=".55" ');
  s += `<path d="M0 660 Q500 600 1000 650 T1920 640 L1920 1080 L0 1080Z" fill="#7BCB92"/>`;
  for (let i = 0; i < 6; i++) s += tree(R(60, W - 60), 700, R(.62, .8), '#6B4A8A', '#3FB07D', '#2F9A73');
  s += `<path d="M0 760 Q600 700 1100 750 T1920 735 L1920 1080 L0 1080Z" fill="url(#ground)"/>`;
  s += tree(110, 1010, 1.25, '#5A3A78', '#2FA06E', '#238C60') + tree(1830, 1010, 1.3, '#5A3A78', '#2FA06E', '#238C60');
  // pond
  s += `<ellipse cx="1440" cy="900" rx="260" ry="62" fill="#4CC9F0" stroke="${OUTL}" stroke-width="5"/><ellipse cx="1420" cy="892" rx="200" ry="38" fill="#9BE7FF" opacity=".6"/>`;
  s += `<ellipse cx="1360" cy="905" rx="34" ry="12" fill="#3FBF6E"/><ellipse cx="1520" cy="890" rx="28" ry="10" fill="#3FBF6E"/>`;
  s += grassTufts(780, 1070, 90, ['#3FD18A', '#2BAA6A', '#7BE8A9']);
  s += mushroom(560, 985, 1.0, '#FF6FA0', true, 'a') + mushroom(1130, 960, .65, '#8E6BFF', true, 'b') + mushroom(260, 930, .75, '#FFD05A', true, 'a');
  s += flower(820, 1010, 1.3, '#FF8FB8') + flower(1010, 1030, 1.1, '#FFFFFF') + flower(1700, 1000, 1.4, '#B38CFF') + flower(400, 1040, 1.2, '#FF7A6B');
  s += fireflies(34, 250, 900);
  bgs.bg_forest = svg(W, H, s, lin('sky', [[0, '#76D4F5'], [.6, '#C7F3E1'], [1, '#FFF1C1']]) + rad('sun', [[0, '#FFFBD0', .9], [1, '#FFFBD0', 0]]) +
    lin('ground', [[0, '#5BD08A'], [1, '#1E8E5E']]) + rad('mga', [[0, '#FFD05A', .5], [1, '#FFD05A', 0]]) + rad('mgb', [[0, '#C8A8FF', .5], [1, '#C8A8FF', 0]]));
}
// 3 ---- BALLOON SKY ----
setSeed(33);
{
  let s = `<rect width="${W}" height="${H}" fill="url(#sky)"/><circle cx="1650" cy="170" r="300" fill="url(#sun)"/><circle cx="1650" cy="170" r="92" fill="#FFE066"/>`;
  // rainbow
  ['#FF6B6B', '#FFA94D', '#FFE066', '#69DB7C', '#4DABF7', '#9775FA'].forEach((c, i) => s += `<path d="M120 800 Q960 ${150 + i * 0} 1800 800" stroke="${c}" stroke-width="22" fill="none" opacity=".0"/>`);
  ['#FF6B6B', '#FFA94D', '#FFE066', '#69DB7C', '#4DABF7', '#9775FA'].forEach((c, i) => s += `<path d="M${40 + i * 26} 860 A ${920 - i * 26} ${640 - i * 22} 0 0 1 ${1880 - i * 26} 860" stroke="${c}" stroke-width="26" fill="none" opacity=".45"/>`);
  s += cloud(280, 220, 1.5) + cloud(820, 130, 1.1) + cloud(1380, 330, 1.3) + cloud(1750, 600, 1.0) + cloud(150, 620, 1.1) + cloud(1000, 520, .9, '#fff', .9);
  s += `<path d="M0 860 Q400 760 800 840 T1500 820 T1920 840 L1920 1080 L0 1080Z" fill="#8EE08E"/><path d="M0 930 Q500 860 1000 920 T1920 900 L1920 1080 L0 1080Z" fill="url(#ground)"/>`;
  s += grassTufts(950, 1070, 50, ['#3FC06E', '#7BE8A9']) + flower(300, 1010, 1.3, '#FF8FB8') + flower(1650, 1020, 1.4, '#FFE066') + flower(1500, 1050, 1, '#fff');
  s += tree(1780, 960, .6, '#8B5E3C', '#4CC96F', '#35B25C') ;
  bgs.bg_sky = svg(W, H, s, lin('sky', [[0, '#3FA9F5'], [1, '#C7F0FF']]) + rad('sun', [[0, '#FFF6A8', .8], [1, '#FFF6A8', 0]]) + lin('ground', [[0, '#5CD97F'], [1, '#2C9E5A']]));
}
// 4 ---- PICNIC / FEEDING ----
setSeed(44);
{
  let s = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  s += cloud(300, 170, 1.2) + cloud(1450, 120, 1.0) + cloud(1000, 240, .7, '#fff', .8);
  s += `<path d="M0 560 Q500 440 1000 540 T1920 520 L1920 1080 L0 1080Z" fill="#9BE39B"/>`;
  s += tree(200, 800, 1.0, '#8B5E3C', '#4CC96F', '#35B25C') + tree(1740, 780, .9, '#8B5E3C', '#4CC96F', '#35B25C');
  s += `<path d="M0 680 Q600 600 1100 660 T1920 640 L1920 1080 L0 1080Z" fill="url(#ground)"/>`;
  s += grassTufts(700, 1070, 60, ['#3FC06E', '#7BE8A9']);
  // blanket with checks
  s += `<g clip-path="url(#bl)"><rect x="120" y="640" width="1680" height="440" fill="#FF6B6B"/>`;
  for (let i = 0; i < 20; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2 === 0) s += `<rect x="${120 + i * 84}" y="${640 + j * 56}" width="84" height="56" fill="#fff" opacity=".9"/>`;
  s += `</g><path d="M300 640 L1620 640 L1800 1000 L120 1000 Z" fill="none" stroke="${OUTL}" stroke-width="5"/>`;
  s += flower(120, 640, 1.3, '#FF8FB8') + flower(1780, 660, 1.3, '#FFE066') + flower(1500, 600, 1, '#fff') + flower(420, 600, 1, '#B38CFF');
  bgs.bg_feed = svg(W, H, s, lin('sky', [[0, '#8AD7FF'], [1, '#FFF3C4']]) + lin('ground', [[0, '#73D98A'], [1, '#32A862']]) + `<clipPath id="bl"><path d="M300 640 L1620 640 L1800 1000 L120 1000 Z"/></clipPath>`);
}
// 5 ---- SUNSET HUG ----
setSeed(55);
{
  let s = `<rect width="${W}" height="${H}" fill="url(#sky)"/><circle cx="960" cy="640" r="420" fill="url(#sun)"/><circle cx="960" cy="660" r="190" fill="#FFE9A0"/>`;
  for (let i = 0; i < 70; i++) s += `<circle cx="${R(0, W)}" cy="${R(0, 380)}" r="${R(1, 2.8)}" fill="#fff" opacity="${R(.3, .9)}"/>`;
  s += cloud(400, 300, 1.5, '#FFB3C8', .8) + cloud(1500, 250, 1.3, '#FFB3C8', .8) + cloud(900, 160, 1, '#FFC9A8', .6);
  s += `<path d="M0 720 Q400 640 800 700 T1500 690 T1920 700 L1920 1080 L0 1080Z" fill="#8B4DA8"/><path d="M0 800 Q500 730 1000 790 T1920 770 L1920 1080 L0 1080Z" fill="#5E3A98"/>`;
  s += `<path d="M0 880 Q600 810 1100 870 T1920 850 L1920 1080 L0 1080Z" fill="url(#ground)"/>`;
  s += tree(140, 860, .8, '#3A2570', '#5B3FA0', '#4A3290') + tree(1790, 860, .85, '#3A2570', '#5B3FA0', '#4A3290');
  s += grassTufts(900, 1070, 70, ['#6BE0A0', '#3FB27E']);
  for (let i = 0; i < 24; i++) s += flower(R(40, W - 40), R(900, 1050), R(.8, 1.4), ['#FF8FB8', '#FFE066', '#9EE7FF', '#fff'][i % 4]);
  s += fireflies(30, 300, 950, '#FFE9A0');
  for (let i = 0; i < 12; i++) s += `<path d="${A.heartPath(R(100, 1820), R(200, 700), R(8, 16))}" fill="#FF8FB8" opacity=".35"/>`;
  bgs.bg_hug = svg(W, H, s, lin('sky', [[0, '#2E1F7A'], [.5, '#E0589A'], [1, '#FFB45E']]) + rad('sun', [[0, '#FFE9A0', .8], [1, '#FFE9A0', 0]]) + lin('ground', [[0, '#3FA878'], [1, '#175C48']]));
}
// 6 ---- SECRET DOOR GARDEN ----
setSeed(66);
{
  let s = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  for (let i = 0; i < 80; i++) s += `<circle cx="${R(0, W)}" cy="${R(0, 300)}" r="${R(1, 2.6)}" fill="#fff" opacity="${R(.3, .9)}"/>`;
  // stone wall
  s += `<rect x="360" y="120" width="1200" height="800" rx="40" fill="#5C5F8F" stroke="${OUTL}" stroke-width="8"/>`;
  for (let r = 0; r < 12; r++) for (let c = 0; c < 10; c++) { const off = r % 2 ? 60 : 0; s += `<rect x="${372 + c * 120 - off}" y="${130 + r * 66}" width="112" height="58" rx="10" fill="${['#6B6EA0', '#5A5D8C', '#7478AA'][(r * 3 + c) % 3]}" opacity=".95" ${(372 + c * 120 - off < 360 || 372 + c * 120 - off + 112 > 1560) ? 'visibility="hidden"' : ''}/>`; }
  // arch recess
  s += `<path d="M700 920 L700 420 A260 260 0 0 1 1220 420 L1220 920 Z" fill="#1A1535" stroke="${OUTL}" stroke-width="10"/><path d="M670 920 L670 420 A290 290 0 0 1 1250 420 L1250 920" fill="none" stroke="#8D91C8" stroke-width="28"/>`;
  // runes
  for (let i = 0; i < 9; i++) { const a = Math.PI + i * Math.PI / 8, x = 960 + 330 * Math.cos(a) * 1.0, y = 430 + 330 * Math.sin(a); s += `<g transform="translate(${x} ${y}) rotate(${i * 22.5 - 90})"><circle r="26" fill="url(#rg)"/><path d="M-9 10 L0 -14 L9 10 M-6 2 L6 2" stroke="#7DFFF0" stroke-width="4" fill="none" stroke-linecap="round"/></g>`; }
  // ivy
  for (let i = 0; i < 30; i++) { const x = R(380, 700), y = R(140, 900); s += `<ellipse cx="${x}" cy="${y}" rx="26" ry="14" fill="#3FB06E" stroke="#1F6F4A" stroke-width="3" transform="rotate(${R(0, 180)} ${x} ${y})"/>`; }
  for (let i = 0; i < 26; i++) { const x = R(1230, 1550), y = R(140, 900); s += `<ellipse cx="${x}" cy="${y}" rx="26" ry="14" fill="#3FB06E" stroke="#1F6F4A" stroke-width="3" transform="rotate(${R(0, 180)} ${x} ${y})"/>`; }
  // ground
  s += `<path d="M0 900 Q500 860 1000 890 T1920 880 L1920 1080 L0 1080Z" fill="url(#ground)"/>`;
  for (let i = 0; i < 22; i++) { const x = R(0, W), y = R(930, 1060); s += `<ellipse cx="${x}" cy="${y}" rx="${R(30, 60)}" ry="${R(10, 18)}" fill="#6B6E9F" stroke="${OUTL}" stroke-width="3" opacity=".7"/>`; }
  s += grassTufts(900, 1060, 40, ['#3FC06E', '#2BAA6A']);
  // big tree right (owl), bracket left (lantern)
  s += tree(1740, 1000, 1.05, '#5A3A78', '#2F8E7A', '#27766A');
  s += `<path d="M200 330 L200 160 L330 160" stroke="#3A3350" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += mushroom(1450, 1010, .7, '#5BE3D5', true, 'a') + mushroom(520, 1020, .6, '#FF7BC5', true, 'b');
  s += fireflies(18, 300, 900, '#9BFFF0');
  bgs.bg_door = svg(W, H, s, lin('sky', [[0, '#0D1B4A'], [1, '#2B3F8F']]) + lin('ground', [[0, '#2E7A6A'], [1, '#144A44']]) + rad('rg', [[0, '#7DFFF0', .7], [1, '#7DFFF0', 0]]) +
    rad('mga', [[0, '#5BE3D5', .55], [1, '#5BE3D5', 0]]) + rad('mgb', [[0, '#FF7BC5', .55], [1, '#FF7BC5', 0]]));
}
// 7 ---- TREASURE ROOM ----
setSeed(77);
{
  let s = `<rect width="${W}" height="${H}" fill="url(#bg)"/>`;
  for (let i = 0; i < 16; i++) s += `<polygon points="960,560 ${R(-200, 2100)},-40 ${R(-200, 2100)},-40" fill="#FFF3B0" opacity=".08"/>`;
  // crystals
  const cr = (x, y, sc, c) => `<g transform="translate(${x} ${y}) scale(${sc})"><polygon points="-40,0 -20,-120 0,-150 24,-110 44,0" fill="${c}" stroke="${OUTL}" stroke-width="5" opacity=".95"/><polygon points="-20,-120 0,-150 0,0 -40,0" fill="#fff" opacity=".25"/></g>`;
  s += cr(120, 900, 1.6, '#6BE4FF') + cr(260, 960, 1.1, '#B38CFF') + cr(1800, 920, 1.7, '#FF8FD0') + cr(1650, 980, 1.0, '#6BE4FF') + cr(520, 1000, .8, '#FFE066');
  s += `<path d="M0 860 Q500 800 960 840 T1920 830 L1920 1080 L0 1080Z" fill="url(#floor)"/>`;
  // gold piles
  for (let i = 0; i < 150; i++) { const x = R(380, 1540), y = R(900 + Math.abs(x - 960) * .05, 1070); s += `<ellipse cx="${x}" cy="${y}" rx="22" ry="9" fill="${['#FFD43B', '#FFC107', '#FFE066'][i % 3]}" stroke="#B8860B" stroke-width="2"/>`; }
  s += `<circle cx="960" cy="640" r="520" fill="url(#glow)"/>`;
  bgs.bg_treasure = svg(W, H, s, rad('bg', [[0, '#7A3FA8'], [1, '#1B1040']], .5, .5, .8) + lin('floor', [[0, '#8A5A3A'], [1, '#3A2418']]) + rad('glow', [[0, '#FFF3B0', .7], [1, '#FFE066', 0]]));
}
module.exports = bgs;
if (require.main === module) {
  const items = Object.entries(bgs).map(([name, s]) => ({ name, w: W, h: H, svg: s, fmt: 'jpeg' }));
  require('fs').writeFileSync(process.argv[2], JSON.stringify(items));
}
