const A = require('./art_common.js');
const { R, setSeed, star5, heartPath, svg, lin, rad, OUTL } = A;
const P = {}; // name -> [w,h,svgString]
const ol = (w = 5) => `stroke="${OUTL}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const shine = (cx, cy, rx, ry, rot = -30) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".55" transform="rotate(${rot} ${cx} ${cy})"/>`;

// ---- stars / sparkles / hearts ----
P.star_gold = [240, 240, svg(240, 240, `<circle cx="120" cy="120" r="110" fill="url(#g)"/><polygon points="${star5(120, 126, 78, .5)}" fill="url(#s)" ${ol(7)}/>
  <polygon points="${star5(120, 126, 52, .5)}" fill="#FFF3A0" opacity=".6"/><circle cx="96" cy="100" r="9" fill="#fff"/><circle cx="104" cy="92" r="4" fill="#fff"/>
  <circle cx="82" cy="108" r="0" fill="#fff"/><path d="M120 6 L120 30 M6 120 L30 120 M210 120 L234 120 M40 40 L56 56 M200 40 L184 56" stroke="#FFF7B0" stroke-width="5" stroke-linecap="round"/>`,
  rad('g', [[0, '#FFF7B0', .85], [1, '#FFE066', 0]]) + lin('s', [[0, '#FFE680'], [1, '#FFB300']]))];
P.sparkle_burst = [520, 520, svg(520, 520, (() => { let o = ''; for (let i = 0; i < 8; i++) { const a = i * 45 * Math.PI / 180, r = 150 + (i % 2) * 50; o += `<polygon points="${star5(260 + r * Math.cos(a), 260 + r * Math.sin(a), 34 - (i % 2) * 10, .42)}" fill="#FFE066" ${ol(3)}/>`; }
  for (let i = 0; i < 8; i++) { const a = (i * 45 + 22) * Math.PI / 180; o += `<path d="M${260 + 90 * Math.cos(a)} ${260 + 90 * Math.sin(a)} L${260 + 130 * Math.cos(a)} ${260 + 130 * Math.sin(a)}" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`; }
  return `<circle cx="260" cy="260" r="240" fill="url(#g)"/>` + o; })(), rad('g', [[0, '#FFF7B0', .7], [1, '#FFF7B0', 0]]))];
P.heart_pink = [200, 200, svg(200, 200, `<path d="${heartPath(100, 96, 56)}" fill="url(#g)" ${ol(6)}/>${shine(68, 70, 18, 10)}`, lin('g', [[0, '#FF9EC0'], [1, '#FF3F7F']]))];
P.heart_big = [640, 640, svg(640, 640, `<circle cx="320" cy="320" r="310" fill="url(#gl)"/><path d="${heartPath(320, 300, 170)}" fill="url(#g)" stroke="#fff" stroke-width="14" stroke-linejoin="round"/><path d="${heartPath(320, 300, 170)}" fill="none" ${ol(8)} opacity=".0"/>
  ${shine(210, 190, 52, 28)}<circle cx="168" cy="236" r="12" fill="#fff" opacity=".8"/>
  <polygon points="${star5(520, 110, 26)}" fill="#FFF7B0"/><polygon points="${star5(110, 90, 20)}" fill="#FFF7B0"/><polygon points="${star5(560, 440, 16)}" fill="#FFF7B0"/>`,
  rad('gl', [[0, '#FFD0E4', .95], [1, '#FF7FB0', 0]]) + lin('g', [[0, '#FF8FB8'], [1, '#FF2D6F']]))];
P.glow = [800, 800, svg(800, 800, `<circle cx="400" cy="400" r="400" fill="url(#g)"/>`, rad('g', [[0, '#FFF7B0', .9], [1, '#FFF7B0', 0]]))];
P.hud = [];
for (let k = 0; k <= 5; k++) {
  let s = `<rect x="6" y="6" width="688" height="118" rx="59" fill="#2A1A5E" opacity=".78" stroke="#FFE066" stroke-width="5"/>`;
  for (let i = 0; i < 5; i++) { const cx = 90 + i * 130; s += i < k ? `<circle cx="${cx}" cy="65" r="52" fill="#FFE066" opacity=".35"/><polygon points="${star5(cx, 69, 46, .5)}" fill="url(#s)" ${ol(4)}/>` : `<polygon points="${star5(cx, 69, 42, .5)}" fill="#4A3A8E" stroke="#8A7AD0" stroke-width="4" stroke-dasharray="6 7" stroke-linejoin="round"/>`; }
  P['hud_' + k] = [700, 130, svg(700, 130, s, lin('s', [[0, '#FFF0A0'], [1, '#FFB300']]))];
}
// zzz
P.zzz = [260, 300, svg(260, 300, `<g fill="#CFE3FF" ${ol(4)}><path d="M20 250 L80 250 L80 270 L28 270 L28 276 L88 276 L88 296 L18 296 L18 276 L70 270Z" transform="scale(.001)"/></g>
  <text x="20" y="290" font-family="DejaVu Sans" font-weight="bold" font-size="90" fill="#DCE9FF" stroke="${OUTL}" stroke-width="5" paint-order="stroke">Z</text>
  <text x="95" y="190" font-family="DejaVu Sans" font-weight="bold" font-size="70" fill="#DCE9FF" stroke="${OUTL}" stroke-width="5" paint-order="stroke">Z</text>
  <text x="165" y="100" font-family="DejaVu Sans" font-weight="bold" font-size="52" fill="#DCE9FF" stroke="${OUTL}" stroke-width="5" paint-order="stroke">Z</text>`)];
// portal
P.portal = [560, 560, svg(560, 560, `<circle cx="280" cy="280" r="270" fill="url(#g)"/>
  ${[0, 1, 2, 3, 4].map(i => `<ellipse cx="280" cy="280" rx="${230 - i * 34}" ry="${230 - i * 34}" fill="none" stroke="${['#FF6B9D', '#FFB84D', '#FFE066', '#6BE4A0', '#6BB8FF'][i]}" stroke-width="22" opacity=".95" stroke-dasharray="${180 - i * 20} 40" transform="rotate(${i * 40} 280 280)"/>`).join('')}
  <circle cx="280" cy="280" r="70" fill="url(#c)"/><polygon points="${star5(280, 286, 54, .48)}" fill="#fff" ${ol(0)}/>`,
  rad('g', [[0, '#C8A8FF', .5], [1, '#C8A8FF', 0]]) + rad('c', [[0, '#FFFFFF', 1], [1, '#FFE9A0', .0]]))];
// key + gems
P.key = [320, 200, svg(320, 200, `<g transform="rotate(-20 160 100)"><circle cx="64" cy="100" r="46" fill="url(#g)" ${ol(7)}/><path d="${heartPath(64, 98, 20)}" fill="#FF4F7B" stroke="${OUTL}" stroke-width="3"/>
  <rect x="104" y="88" width="170" height="26" rx="8" fill="url(#g)" ${ol(7)}/><rect x="226" y="108" width="22" height="42" rx="6" fill="url(#g)" ${ol(6)}/><rect x="256" y="108" width="22" height="30" rx="6" fill="url(#g)" ${ol(6)}/></g>${shine(60, 70, 14, 7)}`,
  lin('g', [[0, '#FFE680'], [1, '#FFA800']]))];
const gem = (c1, c2) => [160, 160, svg(160, 160, `<circle cx="80" cy="80" r="74" fill="url(#gl)"/><polygon points="80,16 132,50 132,110 80,144 28,110 28,50" fill="url(#g)" ${ol(6)}/><polygon points="80,16 132,50 80,80 28,50" fill="#fff" opacity=".35"/><path d="M28 50 L80 80 L132 50 M80 80 L80 144" stroke="#fff" stroke-width="3" opacity=".6" fill="none"/>${shine(60, 44, 14, 7)}`,
  lin('g', [[0, c1], [1, c2]]) + rad('gl', [[0, c1, .6], [1, c1, 0]]))];
P.gem_red = gem('#FF8FA0', '#E0204A'); P.gem_blue = gem('#8FD8FF', '#1F6FE0'); P.gem_green = gem('#9CF0A8', '#18A04A');
// balloons
const balloon = (c1, c2) => [260, 520, svg(260, 520, `<path d="M130 380 Q150 430 120 470 Q100 500 130 515" stroke="#7A6A8A" stroke-width="4" fill="none"/>
  <path d="M130 8 C40 8 6 100 22 170 C40 250 100 310 130 342 C160 310 220 250 238 170 C254 100 220 8 130 8 Z" fill="url(#g)" ${ol(6)}/>
  <path d="M112 342 L130 366 L148 342 Z" fill="${c2}" ${ol(4)}/>${shine(80, 80, 20, 40, 25)}<circle cx="64" cy="140" r="7" fill="#fff" opacity=".6"/>`, rad('g', [[0, c1], [1, c2]], .35, .3, .8))];
const COLORS = { red: ['#FF8A8A', '#E0303C'], blue: ['#8AC8FF', '#2F6FE0'], green: ['#9CF0A0', '#25A64A'], pink: ['#FFB0D8', '#EC3F9A'], yellow: ['#FFF0A0', '#F5B800'], purple: ['#D0B0FF', '#7B3FE0'], orange: ['#FFC890', '#F2711C'] };
for (const [n, [a, b]] of Object.entries(COLORS)) P['balloon_' + n] = balloon(a, b);
P.balloon_gold = [420, 700, svg(420, 700, `<path d="M210 8 C110 8 70 100 86 170 C104 240 170 290 210 322 C250 290 316 240 334 170 C350 100 310 8 210 8 Z" fill="url(#g)" ${ol(7)}/>${shine(150, 80, 22, 44, 25)}
  <polygon points="${star5(210, 150, 46, .5)}" fill="#fff" opacity=".85"/><path d="M190 322 L210 350 L230 322Z" fill="#E09A00" ${ol(4)}/>
  <path d="M170 350 L150 500 M250 350 L270 500 M210 350 L210 500" stroke="#7A6A8A" stroke-width="4"/>
  <path d="M120 500 L300 500 L280 640 Q210 660 140 640 Z" fill="#C98A3A" ${ol(7)}/><path d="M130 520 Q210 550 290 520" stroke="#8A5A22" stroke-width="5" fill="none"/>
  <circle cx="170" cy="490" r="26" fill="#FF5A5A" ${ol(4)}/><circle cx="215" cy="480" r="26" fill="#FFD43B" ${ol(4)}/><circle cx="256" cy="492" r="24" fill="#7BD66B" ${ol(4)}/><circle cx="195" cy="470" r="22" fill="#FF9F43" ${ol(4)}/>
  <path d="M120 500 L300 500" ${ol(8)}/>`, rad('g', [[0, '#FFF3A0'], [1, '#F2A900']], .35, .3, .8))];
const burst = (c) => [420, 420, svg(420, 420, `<polygon points="${(() => { let p = []; for (let i = 0; i < 24; i++) { const a = i * 15 * Math.PI / 180, r = i % 2 ? 100 : 195; p.push((210 + r * Math.cos(a)).toFixed(1) + ',' + (210 + r * Math.sin(a)).toFixed(1)); } return p.join(' '); })()}" fill="${c}" ${ol(6)}/>
  <polygon points="${(() => { let p = []; for (let i = 0; i < 16; i++) { const a = (i * 22.5 + 8) * Math.PI / 180, r = i % 2 ? 50 : 110; p.push((210 + r * Math.cos(a)).toFixed(1) + ',' + (210 + r * Math.sin(a)).toFixed(1)); } return p.join(' '); })()}" fill="#fff" opacity=".85"/>`)];
for (const [n, [a, b]] of Object.entries(COLORS)) P['burst_' + n] = burst(a);
// rewards
P.r_bird = [260, 220, svg(260, 220, `<ellipse cx="120" cy="120" rx="76" ry="62" fill="#4DABF7" ${ol(6)}/><circle cx="178" cy="92" r="38" fill="#4DABF7" ${ol(6)}/><path d="M212 90 L252 100 L212 112Z" fill="#FFB300" ${ol(4)}/>
  <circle cx="186" cy="84" r="9" fill="#fff"/><circle cx="188" cy="85" r="5" fill="#222"/><path d="M60 110 Q10 70 30 30 Q70 60 96 100Z" fill="#74C0FC" ${ol(5)}/><path d="M60 140 L10 170 L70 160Z" fill="#74C0FC" ${ol(5)}/><ellipse cx="130" cy="140" rx="40" ry="26" fill="#E7F5FF"/>`)];
P.r_butterfly = [300, 240, svg(300, 240, `<ellipse cx="90" cy="86" rx="70" ry="62" fill="#B197FC" ${ol(6)} transform="rotate(-20 90 86)"/><ellipse cx="210" cy="86" rx="70" ry="62" fill="#B197FC" ${ol(6)} transform="rotate(20 210 86)"/>
  <ellipse cx="100" cy="164" rx="46" ry="42" fill="#FF8FB8" ${ol(6)}/><ellipse cx="200" cy="164" rx="46" ry="42" fill="#FF8FB8" ${ol(6)}/><circle cx="82" cy="80" r="18" fill="#fff" opacity=".8"/><circle cx="218" cy="80" r="18" fill="#fff" opacity=".8"/>
  <rect x="140" y="60" width="20" height="130" rx="10" fill="#4A2A5A"/><path d="M146 62 Q130 20 112 12 M154 62 Q170 20 188 12" stroke="#4A2A5A" stroke-width="5" fill="none" stroke-linecap="round"/>`)];
P.r_rainbow = [420, 240, svg(420, 240, ['#FF6B6B', '#FFA94D', '#FFE066', '#69DB7C', '#4DABF7', '#9775FA'].map((c, i) => `<path d="M${20 + i * 20} 220 A ${190 - i * 20} ${190 - i * 20} 0 0 1 ${400 - i * 20} 220" stroke="${c}" stroke-width="22" fill="none"/>`).join('') + `<ellipse cx="40" cy="214" rx="48" ry="26" fill="#fff" ${ol(5)}/><ellipse cx="380" cy="214" rx="48" ry="26" fill="#fff" ${ol(5)}/>`)];
P.r_flower = [240, 300, svg(240, 300, `<path d="M120 150 L120 290" stroke="#2E9B57" stroke-width="9"/><path d="M120 240 q-50 -10 -60 -50 q45 0 60 50" fill="#4CC96F" ${ol(4)}/>` + Array.from({ length: 8 }, (_, i) => `<ellipse cx="120" cy="70" rx="24" ry="48" fill="#FF8FB8" ${ol(5)} transform="rotate(${i * 45} 120 120)"/>`).join('') + `<circle cx="120" cy="120" r="30" fill="#FFE066" ${ol(5)}/>`)];
P.r_ladybug = [240, 200, svg(240, 200, `<ellipse cx="120" cy="115" rx="86" ry="72" fill="#FF4D4D" ${ol(6)}/><path d="M120 44 L120 186" stroke="#2A1A3A" stroke-width="6"/><circle cx="120" cy="52" r="34" fill="#2A1A3A"/><circle cx="108" cy="46" r="8" fill="#fff"/><circle cx="134" cy="46" r="8" fill="#fff"/>
  ${[[78, 100], [160, 100], [74, 140], [166, 140], [96, 80], [144, 80]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="#2A1A3A"/>`).join('')}`)];
// food
P.food_apple = [300, 300, svg(300, 300, `<path d="M150 82 C100 40 30 76 40 160 C48 240 110 276 150 262 C190 276 252 240 260 160 C270 76 200 40 150 82Z" fill="url(#g)" ${ol(7)}/><path d="M150 82 Q150 50 164 26" stroke="#6B3E1A" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M164 50 Q210 20 236 52 Q196 76 164 50Z" fill="#4CC96F" ${ol(5)}/>${shine(86, 130, 16, 36, 20)}`, rad('g', [[0, '#FF8A8A'], [1, '#E0303C']], .35, .35, .8))];
P.food_cupcake = [300, 300, svg(300, 300, `<path d="M70 150 L90 270 Q150 290 210 270 L230 150Z" fill="#FFB36B" ${ol(7)}/><path d="M110 156 L120 272 M150 160 L150 280 M190 156 L180 272" stroke="#E08A3C" stroke-width="5"/>
  <path d="M52 156 Q40 100 100 96 Q96 52 150 48 Q204 52 200 96 Q260 100 248 156 Q150 180 52 156Z" fill="#FF9EC8" ${ol(7)}/><circle cx="150" cy="38" r="22" fill="#FF3F5F" ${ol(5)}/><path d="M150 18 q6 -16 18 -18" stroke="#2E9B57" stroke-width="5" fill="none"/>
  <rect x="96" y="118" width="22" height="8" rx="4" fill="#FFE066" transform="rotate(-20 96 118)"/><rect x="170" y="108" width="22" height="8" rx="4" fill="#7BD66B" transform="rotate(25 170 108)"/><rect x="132" y="86" width="22" height="8" rx="4" fill="#6BB8FF"/>`)];
P.food_banana = [300, 300, svg(300, 300, `<path d="M60 90 Q70 230 200 252 Q250 256 262 224 Q170 220 124 120 Q112 70 92 56Z" fill="#FFE066" ${ol(7)}/><path d="M92 56 L82 28 L108 24 L104 60Z" fill="#8A6A2A" ${ol(5)}/><path d="M96 100 Q110 190 230 238" stroke="#E8B800" stroke-width="6" fill="none"/>${shine(86, 120, 8, 30, -10)}`)];
P.food_melon = [300, 300, svg(300, 300, `<path d="M26 130 A124 124 0 0 0 274 130 Z" fill="#3FAE5B" ${ol(7)}/><path d="M44 130 A106 106 0 0 0 256 130 Z" fill="#E8F7C8"/><path d="M54 130 A96 96 0 0 0 246 130 Z" fill="#FF5A6E"/>
  ${[[100, 156], [150, 176], [200, 156], [126, 206], [178, 206]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="11" fill="#2A1A3A" transform="rotate(${x % 30 - 15} ${x} ${y})"/>`).join('')}`)];
P.food_broccoli = [300, 300, svg(300, 300, `<path d="M120 190 L112 270 Q150 284 188 270 L180 190Z" fill="#8BD450" ${ol(7)}/>` + [[90, 130, 60], [150, 100, 70], [210, 130, 60], [120, 170, 50], [180, 170, 50]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#35A853" ${ol(6)}/>`).join('') + `<circle cx="136" cy="84" r="9" fill="#6BD27F" opacity=".7"/><circle cx="196" cy="116" r="8" fill="#6BD27F" opacity=".7"/><circle cx="84" cy="116" r="8" fill="#6BD27F" opacity=".7"/>`)];
P.food_chili = [300, 300, svg(300, 300, `<path d="M70 60 Q190 40 240 120 Q270 190 250 262 Q214 214 190 170 Q140 100 70 100Z" fill="url(#g)" ${ol(7)}/><path d="M70 60 Q50 40 56 20 Q90 24 100 62Z" fill="#35A853" ${ol(6)}/>${shine(150, 84, 10, 40, 80)}`, lin('g', [[0, '#FF6B4A'], [1, '#D91F26']], 1, 1))];
// effects: flame, puff, crumbs
P.flame = [620, 360, svg(620, 360, `<path d="M20 180 C120 90 260 70 380 40 C440 110 470 90 560 80 C520 130 600 150 600 180 C600 210 520 230 560 280 C470 270 440 250 380 320 C260 290 120 270 20 180Z" fill="url(#o)" ${ol(6)}/>
  <path d="M60 180 C150 120 280 110 380 90 C420 140 460 130 520 130 C500 160 540 170 540 180 C540 190 500 200 520 230 C460 230 420 220 380 270 C280 250 150 240 60 180Z" fill="url(#y)"/>`, lin('o', [[0, '#FF7A1A'], [1, '#FF3B1A']], 1, 0) + lin('y', [[0, '#FFE066'], [1, '#FFB300']], 1, 0))];
P.puff = [200, 160, svg(200, 160, `<g fill="#fff" ${ol(4)}><circle cx="60" cy="90" r="44"/><circle cx="110" cy="70" r="52"/><circle cx="150" cy="100" r="40"/></g><g fill="#fff"><circle cx="60" cy="90" r="40"/><circle cx="110" cy="70" r="48"/><circle cx="150" cy="100" r="36"/></g>`)];
P.crumbs = [300, 220, svg(300, 220, [[40, 100], [90, 60], [150, 120], [210, 70], [250, 130], [120, 170], [200, 180]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${10 + i % 3 * 4}" fill="${['#FFB36B', '#FFD58A', '#E08A3C'][i % 3]}" ${ol(3)}/>`).join(''))];
P.sweat = [100, 140, svg(100, 140, `<path d="M50 10 Q10 70 24 100 Q50 130 76 100 Q90 70 50 10Z" fill="#7FD8FF" ${ol(5)}/>${shine(40, 80, 6, 14)}`)];
// door scene
const doorW = 520, doorH = 760;
P.door_closed = [doorW, doorH, svg(doorW, doorH, `<defs/><path d="M0 ${doorH} L0 260 A260 260 0 0 1 ${doorW} 260 L${doorW} ${doorH} Z" fill="url(#w)" ${ol(8)}/>
  ${[1, 2, 3, 4].map(i => `<path d="M${i * 104} 20 L${i * 104} ${doorH}" stroke="#7A4A22" stroke-width="5" opacity=".7"/>`).join('')}
  <path d="M0 150 L${doorW} 150 M0 520 L${doorW} 520" stroke="#C9A24A" stroke-width="18" opacity="0"/>
  <rect x="20" y="170" width="${doorW - 40}" height="30" rx="8" fill="#D4A63C" ${ol(5)}/><rect x="20" y="560" width="${doorW - 40}" height="30" rx="8" fill="#D4A63C" ${ol(5)}/>
  ${[130, 260, 390].map(x => `<circle cx="${x}" cy="300" r="40" fill="#2A1A5E" ${ol(6)}/><circle cx="${x}" cy="300" r="30" fill="none" stroke="#FFE066" stroke-width="4" stroke-dasharray="5 6"/>`).join('')}
  <circle cx="260" cy="440" r="48" fill="#D4A63C" ${ol(7)}/><circle cx="260" cy="430" r="14" fill="#2A1A3A"/><path d="M252 436 L246 480 L274 480 L268 436Z" fill="#2A1A3A"/>
  <circle cx="470" cy="420" r="0" fill="#fff"/>`, lin('w', [[0, '#B5773D'], [1, '#8B5426']], 1, 0))];
P.door_inner = [doorW, doorH, svg(doorW, doorH, `<defs><clipPath id="c"><path d="M0 ${doorH} L0 260 A260 260 0 0 1 ${doorW} 260 L${doorW} ${doorH} Z"/></clipPath></defs><g clip-path="url(#c)"><rect width="${doorW}" height="${doorH}" fill="url(#g)"/>
  ${Array.from({ length: 10 }, (_, i) => `<polygon points="260,500 ${-100 + i * 80},-40 ${-60 + i * 80},-40" fill="#fff" opacity=".18"/>`).join('')}<rect y="${doorH - 90}" width="${doorW}" height="90" fill="#8A5A3A" opacity=".8"/>
  ${Array.from({ length: 20 }, (_, i) => `<ellipse cx="${30 + (i * 53) % 470}" cy="${doorH - 20 - (i * 17) % 60}" rx="18" ry="7" fill="#FFD43B" stroke="#B8860B" stroke-width="2"/>`).join('')}</g>`,
  rad('g', [[0, '#FFFBD0'], [.5, '#FFD86B'], [1, '#C77A2A']], .5, .6, .8))];
P.lantern_off = [220, 400, svg(220, 400, `<path d="M110 0 L110 70" stroke="#3A3350" stroke-width="8"/><path d="M60 80 L160 80 L180 120 L180 250 L40 250 L40 120Z" fill="#3A3350" ${ol(6)}/><rect x="56" y="124" width="108" height="116" rx="10" fill="#6B7BA8" opacity=".75" ${ol(4)}/>
  <path d="M30 250 L190 250 L170 280 L50 280Z" fill="#3A3350" ${ol(6)}/><path d="M80 80 Q110 40 140 80" stroke="#3A3350" stroke-width="8" fill="none"/>`)];
P.lantern_on = [440, 640, svg(440, 640, `<circle cx="220" cy="300" r="210" fill="url(#g)"/><g transform="translate(110 40)"><path d="M110 0 L110 70" stroke="#3A3350" stroke-width="8"/><path d="M60 80 L160 80 L180 120 L180 250 L40 250 L40 120Z" fill="#3A3350" ${ol(6)}/><rect x="56" y="124" width="108" height="116" rx="10" fill="#FFE066" ${ol(4)}/>
  <path d="M110 230 Q70 190 100 150 Q104 180 120 170 Q150 190 110 230Z" fill="#FF8A1A"/><path d="M30 250 L190 250 L170 280 L50 280Z" fill="#3A3350" ${ol(6)}/><path d="M80 80 Q110 40 140 80" stroke="#3A3350" stroke-width="8" fill="none"/></g>`, rad('g', [[0, '#FFE9A0', .85], [1, '#FFE9A0', 0]]))];
const owl = (open) => [300, 320, svg(300, 320, `<path d="M70 120 Q40 20 90 30 L120 60 Q150 52 180 60 L210 30 Q260 20 230 120 Q250 250 150 300 Q50 250 70 120Z" fill="#9A7B5A" ${ol(7)}/><ellipse cx="150" cy="215" rx="62" ry="64" fill="#E8D2B0"/>
  <path d="M110 190 q10 10 20 0 M130 220 q10 10 20 0 M150 190 q10 10 20 0 M170 220 q10 10 20 0" stroke="#B89A72" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M148 128 L130 152 L166 152Z" fill="#FFB300" ${ol(5)}/>
  ${open ? `<circle cx="108" cy="116" r="40" fill="#fff" ${ol(6)}/><circle cx="192" cy="116" r="40" fill="#fff" ${ol(6)}/><circle cx="108" cy="118" r="20" fill="#2A1A3A"/><circle cx="192" cy="118" r="20" fill="#2A1A3A"/><circle cx="102" cy="110" r="7" fill="#fff"/><circle cx="186" cy="110" r="7" fill="#fff"/>`
   : `<circle cx="108" cy="116" r="40" fill="#fff" ${ol(6)}/><circle cx="192" cy="116" r="40" fill="#fff" ${ol(6)}/><path d="M76 116 Q108 146 140 116 M160 116 Q192 146 224 116" stroke="#2A1A3A" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M76 116 L140 116 M160 116 L224 116" stroke="#2A1A3A" stroke-width="0"/>`}
  <path d="M60 170 Q20 200 50 260 Q90 240 90 190Z" fill="#7B5E3E" ${ol(6)}/><path d="M240 170 Q280 200 250 260 Q210 240 210 190Z" fill="#7B5E3E" ${ol(6)}/>
  <path d="M110 296 L110 316 M190 296 L190 316" stroke="#FFB300" stroke-width="8" stroke-linecap="round"/>`)];
P.owl_sleep = owl(false); P.owl_awake = owl(true);
P.feather = [80, 160, svg(80, 160, `<path d="M40 150 Q-10 80 40 6 Q90 80 40 150Z" fill="#C9A87A" ${ol(5)}/><path d="M40 150 L40 10" stroke="#8A6A3A" stroke-width="4"/>`)];
const pot = (bloom) => [300, 420, svg(300, 420, `<path d="M150 300 L150 200" stroke="#2E9B57" stroke-width="12"/><path d="M150 270 q-60 -10 -76 -60 q56 -6 76 60 M150 250 q60 -10 76 -60 q-56 -6 -76 60" fill="#4CC96F" ${ol(5)}/>
  ${bloom ? `<circle cx="150" cy="110" r="120" fill="url(#g)"/>` + Array.from({ length: 8 }, (_, i) => `<ellipse cx="150" cy="70" rx="28" ry="56" fill="#9EE87B" ${ol(5)} transform="rotate(${i * 45} 150 130)"/>`).join('') + `<circle cx="150" cy="130" r="34" fill="#FFE066" ${ol(5)}/><circle cx="140" cy="124" r="5" fill="#2A1A3A"/><circle cx="160" cy="124" r="5" fill="#2A1A3A"/><path d="M140 140 Q150 150 160 140" stroke="#2A1A3A" stroke-width="4" fill="none"/>`
    : `<path d="M150 210 C100 180 110 110 150 80 C190 110 200 180 150 210Z" fill="#7BD66B" ${ol(6)}/><path d="M150 210 L150 100" stroke="#3FA050" stroke-width="4"/>`}
  <path d="M70 320 L230 320 L210 410 L90 410Z" fill="#E0703A" ${ol(7)}/><rect x="56" y="296" width="188" height="36" rx="10" fill="#F08A4A" ${ol(6)}/>`, rad('g', [[0, '#C8FF9A', .7], [1, '#C8FF9A', 0]]))];
P.pot_bud = pot(false); P.pot_bloom = pot(true);
// treasure chest
const chest = (open) => [760, 620, svg(760, 620, `${open ? `<circle cx="380" cy="260" r="300" fill="url(#g)"/>` : ''}
  <path d="M60 330 L60 520 Q380 570 700 520 L700 330 Z" fill="url(#w)" ${ol(8)}/><path d="M60 400 Q380 450 700 400 M60 470 Q380 520 700 470" stroke="#6B3A18" stroke-width="5" fill="none" opacity=".5"/>
  <rect x="120" y="340" width="40" height="190" fill="#D4A63C" ${ol(6)}/><rect x="600" y="340" width="40" height="190" fill="#D4A63C" ${ol(6)}/>
  ${open ? `<ellipse cx="380" cy="334" rx="318" ry="40" fill="#5A2A10"/>${Array.from({ length: 40 }, (_, i) => `<ellipse cx="${110 + (i * 97) % 540}" cy="${300 - (i * 37) % 70}" rx="26" ry="11" fill="${['#FFD43B', '#FFC107', '#FFE066'][i % 3]}" stroke="#B8860B" stroke-width="3"/>`).join('')}
     <polygon points="${star5(250, 230, 38, .5)}" fill="#FFF3A0"/><circle cx="470" cy="210" r="28" fill="#FF4F7B" ${ol(5)}/><polygon points="360,260 420,160 480,260 440,300 380,300" fill="#6BE4FF" ${ol(6)}/>
     <path d="M60 330 L20 140 Q380 60 740 140 L700 330 Z" fill="url(#w2)" ${ol(8)} transform="translate(0 -20)"/>`
   : `<path d="M60 330 Q60 110 380 100 Q700 110 700 330 Z" fill="url(#w2)" ${ol(8)}/><path d="M60 250 Q380 190 700 250" stroke="#6B3A18" stroke-width="5" fill="none" opacity=".5"/><rect x="120" y="130" width="40" height="200" fill="#D4A63C" ${ol(6)}/><rect x="600" y="130" width="40" height="200" fill="#D4A63C" ${ol(6)}/>`}
  <rect x="330" y="${open ? 320 : 290}" width="100" height="110" rx="16" fill="#FFD43B" ${ol(7)}/><circle cx="380" cy="${open ? 366 : 336}" r="16" fill="#2A1A3A"/><rect x="372" y="${open ? 366 : 336}" width="16" height="40" rx="4" fill="#2A1A3A"/>`,
  lin('w', [[0, '#B5773D'], [1, '#7A4520']]) + lin('w2', [[0, '#C98445'], [1, '#8B5426']]) + rad('g', [[0, '#FFF7B0', .9], [1, '#FFF7B0', 0]]))];
P.chest_closed = chest(false); P.chest_open = chest(true);
// fireworks / confetti
const fw = (c1, c2) => [560, 560, svg(560, 560, Array.from({ length: 16 }, (_, i) => { const a = i * 22.5 * Math.PI / 180; return `<path d="M${280 + 70 * Math.cos(a)} ${280 + 70 * Math.sin(a)} L${280 + 240 * Math.cos(a)} ${280 + 240 * Math.sin(a)}" stroke="${i % 2 ? c1 : c2}" stroke-width="12" stroke-linecap="round"/><circle cx="${280 + 262 * Math.cos(a)}" cy="${280 + 262 * Math.sin(a)}" r="12" fill="${i % 2 ? c2 : c1}"/>`; }).join('') + `<circle cx="280" cy="280" r="30" fill="#fff" opacity=".9"/>`)];
P.fw_a = fw('#FFE066', '#FF6B9D'); P.fw_b = fw('#6BE4FF', '#B38CFF'); P.fw_c = fw('#9CF0A8', '#FFA94D');
setSeed(9);
P.confetti = [1200, 700, svg(1200, 700, Array.from({ length: 90 }, (_, i) => { const x = R(10, 1190), y = R(10, 690), c = ['#FF6B9D', '#FFE066', '#6BE4FF', '#9CF0A8', '#B38CFF', '#FFA94D'][i % 6]; return i % 3 === 0 ? `<circle cx="${x}" cy="${y}" r="${R(6, 12)}" fill="${c}"/>` : `<rect x="${x}" y="${y}" width="${R(12, 24)}" height="${R(7, 12)}" rx="3" fill="${c}" transform="rotate(${R(0, 180)} ${x} ${y})"/>`; }).join(''))];
P.note = [120, 150, svg(120, 150, `<ellipse cx="42" cy="118" rx="28" ry="20" fill="#B38CFF" ${ol(5)} transform="rotate(-20 42 118)"/><path d="M64 112 L64 20 Q90 30 96 60" stroke="${OUTL}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M64 112 L64 20 Q90 30 96 60" stroke="#B38CFF" stroke-width="4" fill="none" stroke-linecap="round"/>`)];
P.dust = [60, 60, svg(60, 60, `<circle cx="30" cy="30" r="26" fill="url(#g)"/><polygon points="${star5(30, 31, 14, .45)}" fill="#fff"/>`, rad('g', [[0, '#FFF7B0', .9], [1, '#FFE066', 0]]))];
module.exports = P;
if (require.main === module) {
  const items = Object.entries(P).filter(([, v]) => v.length === 3).map(([name, [w, h, s]]) => ({ name, w, h, svg: s }));
  require('fs').writeFileSync(process.argv[2], JSON.stringify(items));
  console.log(items.length, 'props');
}
