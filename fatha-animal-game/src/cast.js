// CAST: cartoon kids and real animals (rabbit, cat, dog, duck, bird, fish, elephant, turtle, girl, boy) - SVG, 5 expressions each
const D = '#2A1838';
const L = (d, w = 6, c = D) => `<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
function eyes(kind, cx, cy, dx, ol, look = 0) {
  const one = (x, s) => {
    const white = (rx, ry) => `<ellipse cx="${x}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" stroke="${ol}" stroke-width="5"/>`;
    const pup = (rx, ry, ox = 0) => `<ellipse cx="${x + ox}" cy="${cy + 3}" rx="${rx}" ry="${ry}" fill="${D}"/><circle cx="${x + ox - rx * .35}" cy="${cy - ry * .25}" r="${rx * .4}" fill="#fff"/><circle cx="${x + ox + rx * .4}" cy="${cy + ry * .4}" r="${rx * .18}" fill="#fff"/>`;
    switch (kind) {
      case 'open': return white(21, 26) + pup(14, 19);
      case 'wide': return white(24, 30) + pup(9, 12);
      case 'look': return white(21, 26) + pup(14, 19, 8 * look);
      case 'sad': return white(21, 26) + pup(16, 21) + `<circle cx="${x - 5}" cy="${cy + 8}" r="3.5" fill="#fff"/>`;
      case 'happy': return L(`M${x - 21} ${cy + 9} Q${x} ${cy - 24} ${x + 21} ${cy + 9}`, 7);
      case 'closed': return L(`M${x - 20} ${cy} Q${x} ${cy + 16} ${x + 20} ${cy}`, 6);
    }
    return '';
  };
  return one(cx - dx, -1) + one(cx + dx, 1);
}
function brows(kind, cx, cy, dx, ol) {
  const b = (d) => L(d, 6, ol);
  if (kind === 'sad') return b(`M${cx - dx - 22} ${cy - 22} L${cx - dx + 18} ${cy - 36}`) + b(`M${cx + dx + 22} ${cy - 22} L${cx + dx - 18} ${cy - 36}`);
  if (kind === 'up') return b(`M${cx - dx - 20} ${cy - 40} Q${cx - dx} ${cy - 54} ${cx - dx + 20} ${cy - 40}`) + b(`M${cx + dx - 20} ${cy - 40} Q${cx + dx} ${cy - 54} ${cx + dx + 20} ${cy - 40}`);
  return '';
}
function mouth(kind, x, y, tongue = '#FF7A9C') {
  switch (kind) {
    case 'smile': return L(`M${x - 26} ${y} Q${x} ${y + 26} ${x + 26} ${y}`);
    case 'grin': return `<path d="M${x - 30} ${y - 4} Q${x} ${y + 40} ${x + 30} ${y - 4} Z" fill="#5B1226" stroke="${D}" stroke-width="5" stroke-linejoin="round"/><ellipse cx="${x}" cy="${y + 16}" rx="13" ry="7" fill="${tongue}"/>`;
    case 'laugh': return `<path d="M${x - 36} ${y - 6} Q${x} ${y + 56} ${x + 36} ${y - 6} Z" fill="#5B1226" stroke="${D}" stroke-width="5" stroke-linejoin="round"/><ellipse cx="${x}" cy="${y + 22}" rx="18" ry="10" fill="${tongue}"/>`;
    case 'o': return `<ellipse cx="${x}" cy="${y + 6}" rx="11" ry="15" fill="#5B1226" stroke="${D}" stroke-width="4"/>`;
    case 'sad': return L(`M${x - 24} ${y + 14} Q${x} ${y - 10} ${x + 24} ${y + 14}`, 6);
  }
  return '';
}
function arm(side, ang, len, fill, ol, sx, sy, w = 24) {
  const a = ang * Math.PI / 180, hx = sx + side * len * Math.sin(a), hy = sy + len * Math.cos(a);
  const d = `M${sx} ${sy} L${hx} ${hy}`;
  return `<path d="${d}" stroke="${ol}" stroke-width="${w + 9}" stroke-linecap="round"/><path d="${d}" stroke="${fill}" stroke-width="${w}" stroke-linecap="round"/>`;
}
const body = (cx, cy, rx, ry, fill, ol, id) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})" stroke="${ol}" stroke-width="7"/>`;
const grad = (id, c1, c2, c3) => `<radialGradient id="${id}" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="${c1}"/><stop offset=".6" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></radialGradient>`;
const cheeks = (cx, cy, dx, o) => `<ellipse cx="${cx - dx}" cy="${cy}" rx="18" ry="12" fill="#FF5F8A" opacity="${o}"/><ellipse cx="${cx + dx}" cy="${cy}" rx="18" ry="12" fill="#FF5F8A" opacity="${o}"/>`;
const tearSvg = (x, y) => `<path d="M${x} ${y} Q${x - 12} ${y + 28} ${x} ${y + 38} Q${x + 14} ${y + 28} ${x} ${y}Z" fill="#7FD8FF" stroke="#2D7FB5" stroke-width="3"/>`;

// ---- species: each returns inner svg given pose p ----
const S = {};
S.rabbit = (p, id) => {
  const fur = '#FFF4EC', fl = '#fff', fd = '#E8D2C6', ol = '#8A5A6A', pink = '#FFB3C7';
  return { defs: grad('b' + id, fl, fur, fd), svg: `
    <circle cx="318" cy="330" r="30" fill="#fff" stroke="${ol}" stroke-width="6"/>
    <ellipse cx="156" cy="58" rx="30" ry="82" fill="url(#b${id})" stroke="${ol}" stroke-width="7" transform="rotate(${p.earA ?? -8} 156 130)"/><ellipse cx="156" cy="62" rx="14" ry="58" fill="${pink}" transform="rotate(${p.earA ?? -8} 156 130)"/>
    <ellipse cx="244" cy="58" rx="30" ry="82" fill="url(#b${id})" stroke="${ol}" stroke-width="7" transform="rotate(${-(p.earA ?? -8)} 244 130)"/><ellipse cx="244" cy="62" rx="14" ry="58" fill="${pink}" transform="rotate(${-(p.earA ?? -8)} 244 130)"/>
    <ellipse cx="150" cy="372" rx="48" ry="20" fill="url(#b${id})" stroke="${ol}" stroke-width="6"/><ellipse cx="250" cy="372" rx="48" ry="20" fill="url(#b${id})" stroke="${ol}" stroke-width="6"/>
    ${body(200, 300, 82, 80, fur, ol, 'b' + id)}<ellipse cx="200" cy="312" rx="48" ry="52" fill="#fff" opacity=".8"/>
    ${arm(-1, p.armL, 62, fur, ol, 130, 270)}${arm(1, p.armR, 62, fur, ol, 270, 270)}
    ${body(200, 168, 98, 88, fur, ol, 'b' + id)}${cheeks(200, 196, 64, p.blush)}
    <ellipse cx="200" cy="184" rx="14" ry="10" fill="#FF8FB0" stroke="${ol}" stroke-width="4"/>
    ${L('M120 196 L70 188 M120 206 L72 214 M280 196 L330 188 M280 206 L328 214', 4, '#B08A9A')}
    ${eyes(p.eyes, 200, 150, 52, ol, p.look)}${brows(p.brows, 200, 150, 52, ol)}${mouth(p.mouth, 200, 206)}
    ${p.mouth !== 'laugh' && p.mouth !== 'grin' ? `<rect x="190" y="218" width="9" height="16" rx="3" fill="#fff" stroke="${ol}" stroke-width="3"/><rect x="201" y="218" width="9" height="16" rx="3" fill="#fff" stroke="${ol}" stroke-width="3"/>` : ''}` };
};
S.cat = (p, id) => {
  const fur = '#F7A24F', fl = '#FFC98B', fd = '#D9772B', ol = '#7A3F12';
  const stripes = `<path d="M170 76 L176 104 M200 70 L200 102 M230 76 L224 104" stroke="${fd}" stroke-width="9" stroke-linecap="round"/>`;
  return { defs: grad('b' + id, fl, fur, fd), svg: `
    <path d="M285 335 C360 340 372 270 340 235" stroke="${ol}" stroke-width="40" fill="none" stroke-linecap="round"/><path d="M285 335 C360 340 372 270 340 235" stroke="${fur}" stroke-width="30" fill="none" stroke-linecap="round"/>
    <path d="M345 300 L336 280 M356 278 L338 268" stroke="${fd}" stroke-width="8"/>
    <ellipse cx="150" cy="372" rx="38" ry="19" fill="url(#b${id})" stroke="${ol}" stroke-width="6"/><ellipse cx="250" cy="372" rx="38" ry="19" fill="url(#b${id})" stroke="${ol}" stroke-width="6"/>
    ${body(200, 300, 84, 80, fur, ol, 'b' + id)}<ellipse cx="200" cy="314" rx="50" ry="52" fill="#FFF1DC"/><path d="M130 280 L152 292 M126 310 L150 316 M270 280 L248 292 M274 310 L250 316" stroke="${fd}" stroke-width="7" stroke-linecap="round"/>
    ${arm(-1, p.armL, 62, fur, ol, 130, 272)}${arm(1, p.armR, 62, fur, ol, 270, 272)}
    <path d="M110 92 L96 20 L162 62Z" fill="${fur}" stroke="${ol}" stroke-width="7" stroke-linejoin="round"/><path d="M118 80 L110 44 L146 66Z" fill="#FFB3C7"/>
    <path d="M290 92 L304 20 L238 62Z" fill="${fur}" stroke="${ol}" stroke-width="7" stroke-linejoin="round"/><path d="M282 80 L290 44 L254 66Z" fill="#FFB3C7"/>
    ${body(200, 164, 104, 90, fur, ol, 'b' + id)}${stripes}
    <ellipse cx="200" cy="198" rx="58" ry="38" fill="#FFF1DC" opacity=".9"/>${cheeks(200, 192, 74, p.blush)}
    <path d="M188 178 L212 178 L200 192Z" fill="#FF7FA0" stroke="${ol}" stroke-width="4" stroke-linejoin="round"/>
    ${L('M120 188 L64 176 M120 200 L66 206 M280 188 L336 176 M280 200 L334 206', 4, '#9A6A3A')}
    ${eyes(p.eyes, 200, 142, 54, ol, p.look)}${brows(p.brows, 200, 142, 54, ol)}${mouth(p.mouth, 200, 204)}` };
};
S.dog = (p, id) => {
  const fur = '#C98B52', fl = '#E8B27E', fd = '#9A6338', ol = '#5A3418';
  return { defs: grad('b' + id, fl, fur, fd), svg: `
    <path d="M285 330 Q340 320 350 270" stroke="${ol}" stroke-width="34" fill="none" stroke-linecap="round"/><path d="M285 330 Q340 320 350 270" stroke="${fur}" stroke-width="24" fill="none" stroke-linecap="round"/>
    <ellipse cx="150" cy="372" rx="38" ry="19" fill="url(#b${id})" stroke="${ol}" stroke-width="6"/><ellipse cx="250" cy="372" rx="38" ry="19" fill="url(#b${id})" stroke="${ol}" stroke-width="6"/>
    ${body(200, 300, 84, 80, fur, ol, 'b' + id)}<ellipse cx="200" cy="314" rx="50" ry="52" fill="#FFF3E2"/>
    <path d="M130 250 Q200 280 270 250" stroke="#E8453C" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="200" cy="272" r="12" fill="#FFD84A" stroke="${ol}" stroke-width="4"/>
    ${arm(-1, p.armL, 62, fur, ol, 130, 276)}${arm(1, p.armR, 62, fur, ol, 270, 276)}
    <ellipse cx="96" cy="130" rx="40" ry="80" fill="${fd}" stroke="${ol}" stroke-width="7" transform="rotate(${p.earA ?? 14} 96 90)"/><ellipse cx="304" cy="130" rx="40" ry="80" fill="${fd}" stroke="${ol}" stroke-width="7" transform="rotate(${-(p.earA ?? 14)} 304 90)"/>
    ${body(200, 164, 104, 90, fur, ol, 'b' + id)}<ellipse cx="256" cy="136" rx="34" ry="38" fill="${fd}" opacity=".85"/>
    <ellipse cx="200" cy="204" rx="62" ry="44" fill="#FFF3E2"/>${cheeks(200, 196, 80, p.blush * .8)}
    <ellipse cx="200" cy="182" rx="22" ry="15" fill="${D}"/><ellipse cx="193" cy="178" rx="7" ry="4" fill="#fff" opacity=".8"/>
    ${eyes(p.eyes, 200, 142, 54, ol, p.look)}${brows(p.brows, 200, 142, 54, ol)}${mouth(p.mouth, 200, 210, '#FF6F8F')}
    ${p.mouth === 'smile' ? `<path d="M196 222 Q200 252 214 226Z" fill="#FF6F8F" stroke="${D}" stroke-width="4" stroke-linejoin="round"/>` : ''}` };
};
S.duck = (p, id) => {
  const fur = '#FFD83F', fl = '#FFF08A', fd = '#EDB400', ol = '#8A5A00', bill = '#FF9A2E';
  const open = ['laugh', 'grin', 'o'].includes(p.mouth);
  return { defs: grad('b' + id, fl, fur, fd), svg: `
    <path d="M286 318 Q352 300 346 262 Q316 280 290 290Z" fill="${fur}" stroke="${ol}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M118 372 L90 394 L140 394 L160 372Z M282 372 L310 394 L260 394 L240 372Z" fill="${bill}" stroke="${ol}" stroke-width="6" stroke-linejoin="round"/>
    ${body(200, 300, 86, 80, fur, ol, 'b' + id)}<ellipse cx="200" cy="316" rx="50" ry="50" fill="#FFF7B8"/>
    ${arm(-1, p.armL, 64, fur, ol, 128, 272, 30)}${arm(1, p.armR, 64, fur, ol, 272, 272, 30)}
    ${body(200, 164, 100, 90, fur, ol, 'b' + id)}<path d="M190 76 Q176 40 200 34 Q196 56 214 72Z M210 76 Q226 48 246 56 Q230 70 226 82Z" fill="${fur}" stroke="${ol}" stroke-width="5"/>
    ${cheeks(200, 188, 70, p.blush)}
    <ellipse cx="200" cy="${open ? 214 : 196}" rx="52" ry="${open ? 26 : 24}" fill="${bill}" stroke="${ol}" stroke-width="6"/>${open ? `<ellipse cx="200" cy="222" rx="36" ry="14" fill="#5B1226"/><ellipse cx="200" cy="228" rx="20" ry="7" fill="#FF7A9C"/><ellipse cx="200" cy="196" rx="52" ry="22" fill="${bill}" stroke="${ol}" stroke-width="6"/>` : ''}
    <circle cx="186" cy="190" r="4" fill="${ol}"/><circle cx="214" cy="190" r="4" fill="${ol}"/>
    ${eyes(p.eyes, 200, 140, 50, ol, p.look)}${brows(p.brows, 200, 140, 50, ol)}` };
};
S.bird = (p, id) => {
  const fur = '#4DA3FF', fl = '#9CD0FF', fd = '#2D6FD0', ol = '#1D3F80', beak = '#FFA52E';
  const open = ['laugh', 'grin', 'o'].includes(p.mouth);
  return { defs: grad('b' + id, fl, fur, fd), svg: `
    <path d="M250 320 L330 380 M236 332 L300 392 M262 306 L350 350" stroke="${ol}" stroke-width="30" stroke-linecap="round"/><path d="M250 320 L330 380 M236 332 L300 392 M262 306 L350 350" stroke="${fd}" stroke-width="20" stroke-linecap="round"/>
    <path d="M158 372 L158 392 M242 372 L242 392 M140 394 L176 394 M224 394 L260 394" stroke="${beak}" stroke-width="9" stroke-linecap="round"/>
    ${body(200, 300, 84, 80, fur, ol, 'b' + id)}<ellipse cx="200" cy="316" rx="50" ry="50" fill="#fff"/>
    ${arm(-1, p.armL, 66, fur, ol, 128, 274, 30)}${arm(1, p.armR, 66, fur, ol, 272, 274, 30)}
    <path d="M176 74 Q170 30 196 26 Q196 52 204 72Z M204 72 Q214 30 242 38 Q226 56 224 80Z" fill="${fd}" stroke="${ol}" stroke-width="5"/>
    ${body(200, 164, 100, 90, fur, ol, 'b' + id)}<ellipse cx="200" cy="200" rx="60" ry="40" fill="#fff" opacity=".85"/>${cheeks(200, 192, 74, p.blush)}
    <path d="M178 186 L222 186 L200 ${open ? 232 : 214}Z" fill="${beak}" stroke="${ol}" stroke-width="5" stroke-linejoin="round"/>${open ? `<path d="M184 196 L216 196 L200 224Z" fill="#5B1226"/>` : ''}
    ${eyes(p.eyes, 200, 140, 50, ol, p.look)}${brows(p.brows, 200, 140, 50, ol)}` };
};
S.fish = (p, id) => {
  const fur = '#FF8A3D', fl = '#FFC08A', fd = '#E0561A', ol = '#7A2A08';
  const open = ['laugh', 'grin', 'o'].includes(p.mouth);
  return { defs: grad('b' + id, fl, fur, fd), svg: `
    <circle cx="70" cy="90" r="16" fill="#CFF1FF" stroke="#5AA7D6" stroke-width="3" opacity=".9"/><circle cx="104" cy="52" r="10" fill="#CFF1FF" stroke="#5AA7D6" stroke-width="3" opacity=".9"/><circle cx="60" cy="40" r="7" fill="#CFF1FF" stroke="#5AA7D6" stroke-width="3" opacity=".9"/>
    <path d="M330 230 L392 160 Q404 230 392 300 Z" fill="${fd}" stroke="${ol}" stroke-width="7" stroke-linejoin="round" transform="rotate(${p.tailA ?? 0} 330 230)"/>
    <path d="M150 128 Q200 40 270 120 Z" fill="${fd}" stroke="${ol}" stroke-width="7" stroke-linejoin="round"/><path d="M170 330 Q210 392 260 330Z" fill="${fd}" stroke="${ol}" stroke-width="7" stroke-linejoin="round"/>
    <ellipse cx="200" cy="232" rx="152" ry="122" fill="url(#b${id})" stroke="${ol}" stroke-width="8"/>
    <path d="M232 112 Q256 232 232 352 M290 128 Q310 232 290 336" stroke="#fff" stroke-width="22" fill="none" opacity=".92"/><path d="M232 112 Q256 232 232 352 M290 128 Q310 232 290 336" stroke="${ol}" stroke-width="3" fill="none" opacity=".35"/>
    <path d="M150 262 q10 12 20 0 q10 12 20 0 M130 292 q10 12 20 0 q10 12 20 0" stroke="${fd}" stroke-width="4" fill="none" opacity=".6"/>
    <path d="M160 270 Q96 ${p.finY ?? 300} 100 340 Q150 336 176 296Z" fill="${fd}" stroke="${ol}" stroke-width="6" stroke-linejoin="round"/>
    ${cheeks(150, 252, 40, p.blush)}
    ${eyes(p.eyes, 150, 196, 42, ol, p.look)}${brows(p.brows, 150, 196, 42, ol)}
    ${open ? `<ellipse cx="86" cy="250" rx="18" ry="22" fill="#5B1226" stroke="${ol}" stroke-width="5"/>` : p.mouth === 'sad' ? L('M64 262 Q80 244 98 262', 6, ol) : L('M62 246 Q82 272 100 250', 6, ol)}` };
};
S.elephant = (p, id) => {
  const fur = '#93AECB', fl = '#C4D6EA', fd = '#6F8CAD', ol = '#34506E';
  return { defs: grad('b' + id, fl, fur, fd), svg: `
    <ellipse cx="80" cy="150" rx="68" ry="78" fill="${fur}" stroke="${ol}" stroke-width="7"/><ellipse cx="86" cy="152" rx="44" ry="54" fill="#FFB8C9" opacity=".8"/>
    <ellipse cx="320" cy="150" rx="68" ry="78" fill="${fur}" stroke="${ol}" stroke-width="7"/><ellipse cx="314" cy="152" rx="44" ry="54" fill="#FFB8C9" opacity=".8"/>
    <path d="M286 336 Q330 336 330 310" stroke="${ol}" stroke-width="16" fill="none" stroke-linecap="round"/>
    <ellipse cx="146" cy="372" rx="42" ry="20" fill="url(#b${id})" stroke="${ol}" stroke-width="6"/><ellipse cx="254" cy="372" rx="42" ry="20" fill="url(#b${id})" stroke="${ol}" stroke-width="6"/>
    ${body(200, 300, 90, 80, fur, ol, 'b' + id)}
    ${arm(-1, p.armL, 62, fur, ol, 126, 274, 30)}${arm(1, p.armR, 62, fur, ol, 274, 274, 30)}
    ${body(200, 162, 100, 90, fur, ol, 'b' + id)}${cheeks(200, 200, 76, p.blush)}
    <path d="M178 196 Q176 262 ${p.trunk ?? 214} 296 Q${(p.trunk ?? 214) + 26} 306 ${(p.trunk ?? 214) + 30} 280 L${(p.trunk ?? 214) + 14} 270 Q232 262 222 196Z" fill="${fur}" stroke="${ol}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M186 224 L214 224 M186 244 L212 244 M188 264 L210 264" stroke="${fd}" stroke-width="4"/>
    <path d="M160 214 Q150 250 168 262 Q170 238 176 224Z M240 214 Q250 250 232 262 Q230 238 224 224Z" fill="#FFF8E8" stroke="${ol}" stroke-width="4" stroke-linejoin="round"/>
    ${eyes(p.eyes, 200, 140, 52, ol, p.look)}${brows(p.brows, 200, 140, 52, ol)}${p.mouth === 'laugh' || p.mouth === 'grin' ? mouth('grin', 200, 262).replace(/<ellipse[^>]*\/>$/, '') : ''}` };
};
S.turtle = (p, id) => {
  const sh = '#3FA85A', shl = '#7BD58D', shd = '#26743C', fur = '#9ED86B', fl = '#C8F0A0', fd = '#6FB045', ol = '#2A5A22';
  return { defs: grad('b' + id, fl, fur, fd) + grad('s' + id, shl, sh, shd), svg: `
    <path d="M60 330 Q30 330 36 306 Q60 316 80 312Z" fill="${fur}" stroke="${ol}" stroke-width="6" stroke-linejoin="round"/>
    <ellipse cx="130" cy="372" rx="40" ry="20" fill="url(#b${id})" stroke="${ol}" stroke-width="6"/><ellipse cx="270" cy="372" rx="40" ry="20" fill="url(#b${id})" stroke="${ol}" stroke-width="6"/>
    <path d="M70 330 Q60 190 200 180 Q340 190 330 330 Q200 368 70 330Z" fill="url(#s${id})" stroke="${ol}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M130 214 L170 200 L230 200 L270 214 L282 262 L252 300 L148 300 L118 262Z" fill="none" stroke="${shd}" stroke-width="6" stroke-linejoin="round"/><path d="M170 200 L148 300 M230 200 L252 300 M130 214 L282 262 M270 214 L118 262" stroke="${shd}" stroke-width="5" opacity=".7"/>
    ${arm(-1, p.armL, 58, fur, ol, 92, 300, 30)}${arm(1, p.armR, 58, fur, ol, 308, 300, 30)}
    ${body(200, 156, 92, 82, fur, ol, 'b' + id)}${cheeks(200, 188, 66, p.blush)}
    ${eyes(p.eyes, 200, 140, 48, ol, p.look)}${brows(p.brows, 200, 140, 48, ol)}${mouth(p.mouth, 200, 196)}` };
};
const kid = (skin, hair, top, bottom, girl) => (p, id) => {
  const ol = '#5A3A2A';
  return { defs: grad('b' + id, '#FFDDBF', skin, '#C98F66').replace('#FFDDBF', skin), svg: `
    ${girl ? `<circle cx="84" cy="150" r="34" fill="${hair}" stroke="${ol}" stroke-width="6"/><circle cx="316" cy="150" r="34" fill="${hair}" stroke="${ol}" stroke-width="6"/><circle cx="84" cy="150" r="10" fill="#FF6FA0"/><circle cx="316" cy="150" r="10" fill="#FF6FA0"/>` : ''}
    <rect x="132" y="352" width="56" height="34" rx="14" fill="${bottom}" stroke="${ol}" stroke-width="6"/><rect x="212" y="352" width="56" height="34" rx="14" fill="${bottom}" stroke="${ol}" stroke-width="6"/>
    <rect x="150" y="320" width="26" height="44" fill="${skin}" stroke="${ol}" stroke-width="5"/><rect x="224" y="320" width="26" height="44" fill="${skin}" stroke="${ol}" stroke-width="5"/>
    ${girl ? `<path d="M128 252 Q200 238 272 252 L304 340 Q200 364 96 340Z" fill="${top}" stroke="${ol}" stroke-width="7" stroke-linejoin="round"/>` : `<rect x="122" y="246" width="156" height="92" rx="30" fill="${top}" stroke="${ol}" stroke-width="7"/><path d="M122 330 L278 330 L270 352 L130 352Z" fill="${bottom}" stroke="${ol}" stroke-width="6"/>`}
    ${arm(-1, p.armL, 62, skin, ol, 128, 270, 22)}${arm(1, p.armR, 62, skin, ol, 272, 270, 22)}
    <ellipse cx="200" cy="162" rx="92" ry="94" fill="url(#b${id})" stroke="${ol}" stroke-width="7"/>
    <ellipse cx="108" cy="168" rx="14" ry="20" fill="${skin}" stroke="${ol}" stroke-width="5"/><ellipse cx="292" cy="168" rx="14" ry="20" fill="${skin}" stroke="${ol}" stroke-width="5"/>
    ${girl ? `<path d="M108 150 Q110 66 200 62 Q290 66 292 150 Q260 100 200 108 Q140 100 108 150Z" fill="${hair}" stroke="${ol}" stroke-width="7" stroke-linejoin="round"/>` :
      `<path d="M108 140 Q104 60 200 58 Q296 60 292 140 Q270 96 200 100 Q130 96 108 140Z" fill="${hair}" stroke="${ol}" stroke-width="7" stroke-linejoin="round"/><path d="M104 112 Q200 40 296 112 L310 124 L90 124Z" fill="#E8453C" stroke="${ol}" stroke-width="7" stroke-linejoin="round"/><rect x="86" y="118" width="64" height="16" rx="8" fill="#C0302A" stroke="${ol}" stroke-width="5"/>`}
    ${cheeks(200, 192, 62, p.blush + .1)}<path d="M194 176 q6 8 12 0" stroke="#B87A52" stroke-width="4" fill="none" stroke-linecap="round"/>
    ${eyes(p.eyes, 200, 150, 44, ol, p.look)}${brows(p.brows, 200, 150, 44, ol)}${mouth(p.mouth, 200, 204)}` };
};
S.girl = kid('#F0B58E', '#2B2030', '#FF6FA0', '#7A5AD0', true);
S.boy = kid('#D99A6B', '#3A2418', '#3FA0E8', '#2F4F9A', false);

const POSES = {
  idle: { eyes: 'open', mouth: 'smile', armL: 22, armR: 22, blush: .5 },
  talk: { eyes: 'open', mouth: 'grin', armL: 22, armR: 140, blush: .55 },
  happy: { eyes: 'happy', mouth: 'laugh', armL: 160, armR: 160, blush: .7, earA: -22, tailA: 10, finY: 270, trunk: 244 },
  think: { eyes: 'look', mouth: 'o', brows: 'up', armL: 40, armR: 60, blush: .4, look: 1 },
  oops: { eyes: 'sad', mouth: 'sad', brows: 'sad', armL: 8, armR: 8, blush: .25, earA: 6, tear: true },
};
function critter(name, pose, id = 'x') {
  const p = Object.assign({ eyes: 'open', mouth: 'smile', armL: 20, armR: 20, blush: .5 }, POSES[pose]);
  const r = S[name](p, id);
  const tear = p.tear ? tearSvg(name === 'fish' ? 118 : 138, 190) : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="600" height="600"><defs>${r.defs}</defs>${name === 'fish' ? `<g transform="translate(14 36) scale(.9)">${r.svg}${tear}</g>` : r.svg + tear}</svg>`;
}
module.exports = { critter, SPECIES: Object.keys(S), POSES: Object.keys(POSES) };
if (require.main === module) {
  const items = []; for (const sp of Object.keys(S)) for (const po of Object.keys(POSES)) items.push({ name: `c_${sp}_${po}`, w: 600, h: 600, svg: critter(sp, po, sp + po) });
  require('fs').writeFileSync(process.argv[2], JSON.stringify(items)); console.log(items.length, 'sprites');
}
