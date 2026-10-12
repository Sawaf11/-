let seed = 12345;
function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
function setSeed(s) { seed = s; }
const R = (a, b) => a + rnd() * (b - a);
function star5(cx, cy, r, ir = 0.45, rot = -90) {
  let p = [];
  for (let i = 0; i < 10; i++) { const a = (rot + i * 36) * Math.PI / 180, rr = i % 2 ? r * ir : r; p.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`); }
  return p.join(' ');
}
const heartPath = (cx, cy, s) => `M${cx} ${cy + 0.9 * s} C${cx - 1.6 * s} ${cy - 0.1 * s} ${cx - 0.9 * s} ${cy - 1.3 * s} ${cx} ${cy - 0.5 * s} C${cx + 0.9 * s} ${cy - 1.3 * s} ${cx + 1.6 * s} ${cy - 0.1 * s} ${cx} ${cy + 0.9 * s} Z`;
const svg = (w, h, inner, defs = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${inner}</svg>`;
const lin = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
const rad = (id, stops, cx = .5, cy = .5, r = .5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</radialGradient>`;
const OUTL = '#4A2A5A';
function cloud(x, y, s, fill = '#fff', op = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity="${op}"><g fill="${fill}"><ellipse cx="0" cy="0" rx="120" ry="48"/><circle cx="-60" cy="-30" r="52"/><circle cx="10" cy="-52" r="66"/><circle cx="76" cy="-22" r="48"/></g><ellipse cx="0" cy="28" rx="110" ry="16" fill="#000" opacity=".05"/></g>`;
}
function mushroom(x, y, s, cap = '#FF6FA0', glow = false, id = '') {
  return `<g transform="translate(${x} ${y}) scale(${s})">
   ${glow ? `<circle cx="0" cy="-40" r="120" fill="url(#mg${id})" />` : ''}
   <path d="M-16 0 Q-22 -50 -12 -64 L12 -64 Q22 -50 16 0 Z" fill="#FFF1D6" stroke="${OUTL}" stroke-width="4"/>
   <path d="M-70 -62 Q-62 -128 0 -132 Q62 -128 70 -62 Q0 -48 -70 -62Z" fill="${cap}" stroke="${OUTL}" stroke-width="5" stroke-linejoin="round"/>
   <circle cx="-30" cy="-92" r="10" fill="#fff" opacity=".9"/><circle cx="20" cy="-106" r="12" fill="#fff" opacity=".9"/><circle cx="42" cy="-80" r="7" fill="#fff" opacity=".9"/>
  </g>`;
}
function flower(x, y, s, c = '#FF8FB8', center = '#FFE066') {
  let petals = ''; for (let i = 0; i < 6; i++) petals += `<ellipse cx="0" cy="-16" rx="9" ry="15" fill="${c}" stroke="${OUTL}" stroke-width="2.5" transform="rotate(${i * 60})"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 L0 60" stroke="#2E8B57" stroke-width="5"/>${petals}<circle r="9" fill="${center}" stroke="${OUTL}" stroke-width="2.5"/></g>`;
}
function grassTufts(y0, y1, n, cols) {
  let o = ''; for (let i = 0; i < n; i++) { const x = R(0, 1920), y = R(y0, y1), h = R(18, 46), c = cols[i % cols.length];
    o += `<path d="M${x} ${y} q-6 -${h} -${R(8, 16)} -${h + 8} M${x} ${y} q2 -${h} 2 -${h + 14} M${x} ${y} q6 -${h} ${R(8, 16)} -${h + 6}" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>`; }
  return o;
}
function fireflies(n, y0, y1, col = '#FFF7A8') {
  let o = ''; for (let i = 0; i < n; i++) { const x = R(0, 1920), y = R(y0, y1), r = R(3, 7);
    o += `<circle cx="${x}" cy="${y}" r="${r * 4}" fill="${col}" opacity=".18"/><circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/>`; }
  return o;
}
function tree(x, y, s, trunk = '#8B5E3C', leafA = '#4CC96F', leafB = '#35B25C', outline = true) {
  const st = outline ? `stroke="${OUTL}" stroke-width="${5 / s}"` : '';
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-34 0 Q-22 -120 -26 -300 L26 -300 Q22 -120 34 0 Z" fill="${trunk}" ${st}/>
    <path d="M-10 -180 Q-60 -220 -90 -250" stroke="${trunk}" stroke-width="22" fill="none" stroke-linecap="round"/>
    <circle cx="-120" cy="-330" r="130" fill="${leafB}" ${st}/><circle cx="110" cy="-340" r="140" fill="${leafB}" ${st}/>
    <circle cx="0" cy="-400" r="170" fill="${leafA}" ${st}/><circle cx="-90" cy="-300" r="110" fill="${leafA}" ${st}/><circle cx="90" cy="-290" r="115" fill="${leafA}" ${st}/>
    <ellipse cx="-40" cy="-440" rx="80" ry="34" fill="#fff" opacity=".18" transform="rotate(-20 -40 -440)"/>
  </g>`;
}
module.exports = { rnd, setSeed, R, star5, heartPath, svg, lin, rad, OUTL, cloud, mushroom, flower, grassTufts, fireflies, tree };
