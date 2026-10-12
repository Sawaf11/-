// LUMI - parametric baby dragon, drawn as SVG (viewBox 0 0 400 400)
const OUT = '#7A3010';           // warm outline
const C = { body:'#FF8A3D', bodyD:'#E8601C', bodyL:'#FFB46B', belly:'#FFEBC0', bellyB:'#FFD58E',
  wing:'#2EC4B6', wingD:'#16978C', wingL:'#8AF0E2', horn:'#FFD54A', hornD:'#E8A912',
  cheek:'#FF5F8A', dark:'#2A1838', tongue:'#FF7A9C', mouth:'#5B1226' };

function arm(side, angle, len = 66, bend = 0) {
  // side -1 left, +1 right ; angle: 0 down, 90 sideways, 180 up
  const sx = 200 + side * 84, sy = 262;
  const a = angle * Math.PI / 180;
  const hx = sx + side * len * Math.sin(a), hy = sy + len * Math.cos(a);
  const mx = (sx + hx) / 2 + side * bend * Math.cos(a), my = (sy + hy) / 2 - bend * Math.sin(a) * 0.0 + bend * 0.5;
  const d = `M${sx} ${sy} Q${mx} ${my} ${hx} ${hy}`;
  return `<g>
    <path d="${d}" stroke="${OUT}" stroke-width="35" fill="none" stroke-linecap="round"/>
    <path d="${d}" stroke="${C.body}" stroke-width="26" fill="none" stroke-linecap="round"/>
    <path d="${d}" stroke="${C.bodyL}" stroke-width="8" fill="none" stroke-linecap="round" opacity=".55" transform="translate(-3,-3)"/>
    <circle cx="${hx}" cy="${hy}" r="4" fill="${C.hornD}" opacity="0"/>
  </g>`;
}
function wing(side, ang, sc) {
  // spread wing path for left side, base at (150,222); mirrored for right
  const w = `<g transform="rotate(${ang-24} 150 222) translate(150 222) scale(${Math.min(sc,0.82)*1.12}) translate(-150 -222)">
    <path d="M150 226 C118 182 62 160 18 96 C54 104 78 100 96 88 C100 112 122 124 142 128 C132 112 138 102 150 96 C150 140 146 190 160 216 Z"
      fill="${C.wing}" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M150 218 C112 176 70 150 32 108 M150 214 C128 190 106 160 98 100" stroke="${C.wingD}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M60 128 C80 130 96 120 104 106" stroke="${C.wingL}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/>
  </g>`;
  return side < 0 ? w : `<g transform="translate(400 0) scale(-1 1)">${w}</g>`;
}
function eye(kind, cx, cy, side, look = 0) {
  const white = (rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" stroke="${OUT}" stroke-width="5"/>`;
  const pupil = (rx, ry, ox = 0, oy = 0) => `<ellipse cx="${cx + ox + look}" cy="${cy + oy}" rx="${rx}" ry="${ry}" fill="${C.dark}"/>
     <ellipse cx="${cx + ox + look}" cy="${cy + oy + ry * 0.45}" rx="${rx * 0.72}" ry="${ry * 0.5}" fill="#6B55C0" opacity=".85"/>
     <circle cx="${cx + ox + look - rx * 0.35}" cy="${cy + oy - ry * 0.35}" r="${rx * 0.42}" fill="#fff"/>
     <circle cx="${cx + ox + look + rx * 0.4}" cy="${cy + oy + ry * 0.35}" r="${rx * 0.2}" fill="#fff"/>`;
  switch (kind) {
    case 'open': return white(25, 31) + pupil(17, 23, 0, 3);
    case 'wide': return white(29, 37) + pupil(10, 13, 0, 0);
    case 'sad':  return white(25, 31) + pupil(19, 25, 0, 4) + `<circle cx="${cx - 7}" cy="${cy + 8}" r="4" fill="#fff"/>`;
    case 'look': return white(25, 31) + pupil(17, 23, 7 * side * -1, 3);
    case 'happy': return `<path d="M${cx - 26} ${cy + 10} Q${cx} ${cy - 30} ${cx + 26} ${cy + 10}" stroke="${C.dark}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
    case 'closed': return `<path d="M${cx - 24} ${cy - 2} Q${cx} ${cy + 20} ${cx + 24} ${cy - 2}" stroke="${C.dark}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    case 'squint': { const s = side; return `<path d="M${cx - 22 * s} ${cy - 14} L${cx + 14 * s} ${cy + 2} L${cx - 22 * s} ${cy + 18}" stroke="${C.dark}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; }
    case 'heart': return `<path d="M${cx} ${cy + 24} C${cx - 40} ${cy - 2} ${cx - 22} ${cy - 30} ${cx} ${cy - 10} C${cx + 22} ${cy - 30} ${cx + 40} ${cy - 2} ${cx} ${cy + 24} Z" fill="#FF4F7B" stroke="${OUT}" stroke-width="4"/><circle cx="${cx - 9}" cy="${cy - 7}" r="4.5" fill="#fff"/>`;
    case 'half': {
      const id = 'lid' + cx;
      return `<clipPath id="${id}"><ellipse cx="${cx}" cy="${cy}" rx="25" ry="31"/></clipPath>` + white(25, 31) +
        `<g clip-path="url(#${id})"><ellipse cx="${cx}" cy="${cy + 8}" rx="17" ry="23" fill="${C.dark}"/><circle cx="${cx - 6}" cy="${cy + 6}" r="6" fill="#fff"/>
        <path d="M${cx - 30} ${cy - 36} L${cx + 30} ${cy - 36} L${cx + 30} ${cy - 4} Q${cx} ${cy + 6} ${cx - 30} ${cy - 4} Z" fill="${C.body}" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/></g>
        <ellipse cx="${cx}" cy="${cy}" rx="25" ry="31" fill="none" stroke="${OUT}" stroke-width="5"/>`;
    }
  }
  return '';
}
function brows(kind) {
  const s = (d) => `<path d="${d}" stroke="${OUT}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  if (kind === 'sad') return s('M118 112 L170 92') + s('M282 112 L230 92');
  if (kind === 'up') return s('M124 96 Q150 78 176 94') + s('M276 96 Q250 78 224 94');
  if (kind === 'happy') return s('M124 104 Q150 88 176 102') + s('M276 104 Q250 88 224 102');
  return '';
}
function mouth(kind) {
  const l = (d, w = 6) => `<path d="${d}" stroke="${C.dark}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  switch (kind) {
    case 'smile': return l('M172 198 Q200 228 228 198');
    case 'grin': return `<path d="M164 194 Q200 244 236 194 Z" fill="${C.mouth}" stroke="${C.dark}" stroke-width="6" stroke-linejoin="round"/><path d="M178 216 Q200 206 222 216 Q200 234 178 216Z" fill="${C.tongue}"/>`;
    case 'laugh': return `<path d="M160 192 Q200 262 240 192 Z" fill="${C.mouth}" stroke="${C.dark}" stroke-width="6" stroke-linejoin="round"/><ellipse cx="200" cy="226" rx="22" ry="12" fill="${C.tongue}"/>`;
    case 'o': return `<ellipse cx="200" cy="212" rx="13" ry="17" fill="${C.mouth}" stroke="${C.dark}" stroke-width="5"/>`;
    case 'wait': return `<ellipse cx="200" cy="214" rx="27" ry="30" fill="${C.mouth}" stroke="${C.dark}" stroke-width="6"/><ellipse cx="200" cy="232" rx="17" ry="11" fill="${C.tongue}"/>`;
    case 'yawn': return `<ellipse cx="200" cy="218" rx="30" ry="36" fill="${C.mouth}" stroke="${C.dark}" stroke-width="6"/><ellipse cx="200" cy="240" rx="20" ry="13" fill="${C.tongue}"/>`;
    case 'sleep': return l('M186 206 Q200 214 214 206', 5);
    case 'chewA': return l('M172 206 Q196 218 226 202', 7);
    case 'chewB': return l('M174 202 Q204 218 228 206', 7);
    case 'chewO': return `<ellipse cx="200" cy="210" rx="20" ry="12" fill="${C.mouth}" stroke="${C.dark}" stroke-width="5"/>`;
    case 'sad': return l('M176 218 Q200 192 224 218', 7);
    case 'tongue': return l('M172 198 Q200 226 228 198') + `<path d="M190 214 Q200 244 212 214 Z" fill="${C.tongue}" stroke="${C.dark}" stroke-width="4" stroke-linejoin="round"/>`;
    case 'yuck': return l('M166 214 q9 -14 17 0 t17 0 t17 0 t17 0', 6) + `<path d="M170 218 Q172 246 182 244 Q190 240 186 220" fill="#8BD450" stroke="${C.dark}" stroke-width="3"/>`;
    case 'fire': return `<ellipse cx="200" cy="216" rx="32" ry="30" fill="${C.mouth}" stroke="${C.dark}" stroke-width="6"/><ellipse cx="200" cy="236" rx="18" ry="10" fill="${C.tongue}"/>`;
  }
  return '';
}

function lumi(p = {}) {
  const o = Object.assign({ eyes: 'open', mouth: 'smile', brows: '', armL: 20, armR: 20, wingAng: 18, wingSc: 0.62,
    legs: 'stand', tilt: 0, squash: 1, puff: false, tear: false, bubble: 0, blush: 0.5, look: 0, sweat: false,
    tail: 0, glow: false, id: 'x' }, p);
  const g = o.id;
  const feetY = o.legs === 'jump' ? 350 : 366;
  const feet = o.legs === 'jump' ?
    [[160, 352, 14], [240, 352, -14]] : [[148, 368, 0], [252, 368, 0]];
  const footSvg = feet.map(([fx, fy, r]) => `<g transform="rotate(${r} ${fx} ${fy})">
     <ellipse cx="${fx}" cy="${fy}" rx="40" ry="22" fill="${C.body}" stroke="${OUT}" stroke-width="6"/>
     <circle cx="${fx - 22}" cy="${fy + 12}" r="7" fill="${C.hornD}" stroke="${OUT}" stroke-width="3"/><circle cx="${fx}" cy="${fy + 16}" r="7" fill="${C.hornD}" stroke="${OUT}" stroke-width="3"/><circle cx="${fx + 22}" cy="${fy + 12}" r="7" fill="${C.hornD}" stroke="${OUT}" stroke-width="3"/>
  </g>`).join('');
  const tailPath = o.tail === 1 ? 'M270 334 C328 342 356 300 344 256' : o.tail === -1 ? 'M270 336 C318 362 362 350 366 318' : 'M270 334 C330 346 362 322 356 282';
  const tailEnd = o.tail === 1 ? [344, 256] : o.tail === -1 ? [366, 318] : [356, 282];
  const tailSvg = `<path d="${tailPath}" stroke="${OUT}" stroke-width="40" fill="none" stroke-linecap="round"/>
     <path d="${tailPath}" stroke="${C.body}" stroke-width="30" fill="none" stroke-linecap="round"/>
     <path d="M${tailEnd[0] - 18} ${tailEnd[1] + 4} L${tailEnd[0]} ${tailEnd[1] - 34} L${tailEnd[0] + 18} ${tailEnd[1] + 4} Z" fill="${C.horn}" stroke="${OUT}" stroke-width="5" stroke-linejoin="round" transform="rotate(${o.tail === 1 ? -8 : 10} ${tailEnd[0]} ${tailEnd[1]})"/>`;
  const head = `
    ${o.puff ? `<circle cx="104" cy="186" r="34" fill="${C.body}" stroke="${OUT}" stroke-width="6"/><circle cx="296" cy="186" r="34" fill="${C.body}" stroke="${OUT}" stroke-width="6"/>` : ''}
    <!-- ear fins -->
    <path d="M96 128 L56 98 L62 150 L92 168 Z" fill="${C.wing}" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M304 128 L344 98 L338 150 L308 168 Z" fill="${C.wing}" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/>
    <!-- horns -->
    <path d="M138 70 Q118 30 98 22 Q104 64 120 86 Z" fill="${C.horn}" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M262 70 Q282 30 302 22 Q296 64 280 86 Z" fill="${C.horn}" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/>
    <!-- head -->
    <ellipse cx="200" cy="152" rx="112" ry="98" fill="url(#hg${g})" stroke="${OUT}" stroke-width="7"/>
    <path d="M178 56 Q200 28 222 56 Q200 48 178 56Z" fill="${C.horn}" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>
    <ellipse cx="158" cy="92" rx="30" ry="14" fill="#fff" opacity=".28" transform="rotate(-20 158 92)"/>
    <!-- muzzle -->
    <ellipse cx="200" cy="196" rx="62" ry="40" fill="${C.bodyL}" opacity=".85"/>
    <ellipse cx="188" cy="176" rx="5" ry="3.5" fill="${OUT}"/><ellipse cx="212" cy="176" rx="5" ry="3.5" fill="${OUT}"/>
    <ellipse cx="116" cy="188" rx="22" ry="14" fill="${C.cheek}" opacity="${o.blush}"/><ellipse cx="284" cy="188" rx="22" ry="14" fill="${C.cheek}" opacity="${o.blush}"/>
    ${eye(o.eyes, 150, 142, -1, o.look)}${eye(o.eyes === 'wink' ? 'happy' : o.eyes, 250, 142, 1, o.look)}
    ${brows(o.brows)}
    ${mouth(o.mouth)}
    ${o.tear ? `<path d="M118 176 Q106 204 118 214 Q132 204 118 176Z" fill="#7FD8FF" stroke="#2D7FB5" stroke-width="3"/><circle cx="116" cy="204" r="3" fill="#fff"/>` : ''}
    ${o.sweat ? `<path d="M318 90 Q306 118 318 126 Q332 118 318 90Z" fill="#7FD8FF" stroke="#2D7FB5" stroke-width="3"/>` : ''}
    ${o.bubble ? `<circle cx="226" cy="204" r="${o.bubble}" fill="#BDEBFF" opacity=".7" stroke="#5AA7D6" stroke-width="3"/><circle cx="${226 - o.bubble * 0.35}" cy="${204 - o.bubble * 0.35}" r="${o.bubble * 0.2}" fill="#fff"/>` : ''}
  `;
  const glow = o.glow ? `<circle cx="200" cy="230" r="190" fill="url(#gl${g})"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="800" height="800">
  <defs>
    <radialGradient id="hg${g}" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="${C.bodyL}"/><stop offset=".55" stop-color="${C.body}"/><stop offset="1" stop-color="${C.bodyD}"/></radialGradient>
    <radialGradient id="bg${g}" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="${C.bodyL}"/><stop offset=".6" stop-color="${C.body}"/><stop offset="1" stop-color="${C.bodyD}"/></radialGradient>
    <radialGradient id="gl${g}"><stop offset="0" stop-color="#FFF3B0" stop-opacity=".75"/><stop offset="1" stop-color="#FFF3B0" stop-opacity="0"/></radialGradient>
  </defs>
  <g transform="rotate(${o.tilt} 200 360) translate(200 372) scale(1 ${o.squash}) translate(-200 -372)">
    ${glow}
    ${tailSvg}
    ${wing(-1, o.wingAng, o.wingSc)}${wing(1, o.wingAng, o.wingSc)}
    ${footSvg}
    <ellipse cx="200" cy="292" rx="94" ry="86" fill="url(#bg${g})" stroke="${OUT}" stroke-width="7"/>
    <ellipse cx="200" cy="306" rx="58" ry="62" fill="${C.belly}" stroke="${OUT}" stroke-width="4"/>
    <path d="M150 292 Q200 306 250 292 M146 318 Q200 334 254 318 M156 344 Q200 356 244 344" stroke="${C.bellyB}" stroke-width="7" fill="none" stroke-linecap="round"/>
    ${arm(-1, o.armL, o.armLen || 66, o.bendL || 0)}${arm(1, o.armR, o.armLen || 66, o.bendR || 0)}
    ${head}
  </g></svg>`;
}
module.exports = { lumi, C, OUT };
