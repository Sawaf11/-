// Deterministic motion-graphics renderer: window.renderFrame(t) draws the frame for time t (seconds).
// Visual timeline is locked to the voiceover (segment times measured from the audio).
const W = 1080, H = 1920, TAU = Math.PI * 2;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sm = (a, b, x) => { x = clamp((x - a) / (b - a)); return x * x * (3 - 2 * x); };
const ease = (x) => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const eo = (x) => { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
const ei = (x) => { x = clamp(x); return x * x * x; };
const lerp = (a, b, t) => a + (b - a) * t;
const R = (i, k = 0) => { const s = Math.sin(i * 127.1 + k * 311.7 + 17.3) * 43758.5453; return s - Math.floor(s); };
const pulse = (t, c, w) => Math.exp(-Math.pow((t - c) / w, 2));

function env(t) {
  const f = clamp(t, 0, 75) * 60, i = Math.floor(f);
  return lerp(ENV[i] || 0, ENV[i + 1] || 0, f - i);
}

// ---------- glow sprites ----------
const COLORS = { gold: '255,205,120', warm: '255,160,85', pale: '255,244,214', cool: '150,215,255', white: '255,255,255', rose: '255,190,170' };
const sprites = {};
for (const k in COLORS) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'), gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, `rgba(${COLORS[k]},1)`); gr.addColorStop(0.18, `rgba(${COLORS[k]},.55)`);
  gr.addColorStop(0.5, `rgba(${COLORS[k]},.14)`); gr.addColorStop(1, `rgba(${COLORS[k]},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256); sprites[k] = c;
}
function glow(x, y, r, col, a) {
  if (a <= 0.004 || r < 0.5) return;
  ctx.globalAlpha = Math.min(1, a); ctx.drawImage(sprites[col], x - r, y - r, r * 2, r * 2); ctx.globalAlpha = 1;
}
const rgba = (col, a) => `rgba(${COLORS[col]},${a})`;

// ---------- shared timeline (seconds, measured from the voiceover) ----------
const T = {
  endVoice: 75.96, total: 77.2,
};

// ---------- base sky ----------
const STARS = Array.from({ length: 280 }, (_, i) => ({ x: R(i) * W, y: R(i, 1) * H, s: .5 + R(i, 3) * 1.5, tw: .6 + R(i, 2) * 2.2, b: .25 + R(i, 4) * .75, d: .2 + R(i, 5) }));
function sky(t, shift, warm) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#02030a'); g.addColorStop(.5, '#060b22'); g.addColorStop(1, '#0c1330');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // nebula wash
  glow(300 + Math.sin(t * .05) * 60, 500 - shift * .3, 900, 'cool', .05);
  glow(800, 1100 - shift * .3, 800, 'rose', .035);
  if (warm > 0) { glow(540, 330 - shift * .2, 1100, 'gold', .30 * warm); glow(540, 200, 700, 'pale', .10 * warm); }
  for (const s of STARS) {
    const y = ((s.y + shift * s.d * .6) % H + H) % H;
    const x = (s.x + t * 2 * s.d) % W;
    const a = s.b * (.35 + .65 * (.5 + .5 * Math.sin(t * s.tw + s.x)));
    ctx.globalAlpha = a * .8; ctx.fillStyle = s.b > .8 ? '#ffe9bd' : '#cfdcff';
    ctx.beginPath(); ctx.arc(x, y, s.s, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // bokeh
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 18; i++) {
    const x = (R(i, 9) * W + t * (6 + R(i, 8) * 10)) % W, y = ((R(i, 7) * H - t * (4 + R(i, 6) * 8)) % H + H) % H;
    glow(x, y, 50 + R(i, 5) * 90, i % 3 ? 'gold' : 'cool', .035 + .02 * Math.sin(t * .6 + i));
  }
  ctx.globalCompositeOperation = 'source-over';
}

// ---------- Islamic geometry ----------
function poly(cx, cy, r, n, rot) { ctx.beginPath(); for (let i = 0; i < n; i++) { const a = rot + i / n * TAU; const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); }
function geometry(cx, cy, r, rot, a, col, lw = 1.6) {
  if (a <= .004) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba(col, a); ctx.lineWidth = lw;
  for (let j = 0; j < 5; j++) {
    const rr = r * (1 - j * .19), rt = rot * (j % 2 ? -1 : 1) + j * Math.PI / 8;
    ctx.globalAlpha = 1 - j * .15;
    poly(cx, cy, rr, 4, rt); ctx.stroke(); poly(cx, cy, rr, 4, rt + Math.PI / 4); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, rr * .93, 0, TAU); ctx.stroke();
  }
  for (let k = 0; k < 8; k++) { // petals
    const a0 = rot * .5 + k / 8 * TAU; ctx.globalAlpha = .8;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a0) * r * .5, cy + Math.sin(a0) * r * .5);
    ctx.quadraticCurveTo(cx + Math.cos(a0 + .22) * r * 1.12, cy + Math.sin(a0 + .22) * r * 1.12, cx + Math.cos(a0 + .39) * r * .5, cy + Math.sin(a0 + .39) * r * .5);
    ctx.stroke();
  }
  ctx.restore();
}

// ---------- angel (abstract light being) ----------
function angel(x, y, ang, s, a, flare, flap, col = 'pale') {
  if (a <= .01) return;
  glow(x, y, 150 * s * (1 + flare * .8), 'gold', a * (.22 + .3 * flare));
  glow(x, y, 56 * s * (1 + flare * .6), col, a * .95);
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang + Math.PI / 2);
  ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  const fl = Math.sin(flap) * .22;
  for (let side = -1; side <= 1; side += 2) {
    const tips = [];
    for (let f = 0; f < 9; f++) {
      const u = f / 8, beta = .7 + u * .75 + fl * (.5 + u), len = s * (58 + 118 * Math.pow(u, .8));
      const sx = side * 5 * s, sy = -2 * s;
      const ex = sx + side * Math.sin(beta + .22) * len, ey = sy + Math.cos(beta + .22) * len * .85;
      const cx = sx + side * Math.sin(beta) * len * .85, cy = sy - len * (.12 + .1 * (1 - u));
      ctx.strokeStyle = rgba('pale', a * (.62 - u * .2)); ctx.lineWidth = Math.max(.9, 3.0 * s * (1 - u * .45));
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(cx, cy, ex, ey); ctx.stroke();
      tips.push([ex, ey]);
    }
    ctx.fillStyle = rgba('gold', a * .10); ctx.beginPath(); ctx.moveTo(side * 5 * s, -2 * s);
    for (const [ex, ey] of tips) ctx.lineTo(ex, ey); ctx.closePath(); ctx.fill();
  }
  // body streak
  const bg = ctx.createLinearGradient(0, -34 * s, 0, 70 * s);
  bg.addColorStop(0, rgba('white', a * .9)); bg.addColorStop(1, rgba('gold', 0));
  ctx.fillStyle = bg; ctx.beginPath(); ctx.ellipse(0, 14 * s, 7 * s, 46 * s, 0, 0, TAU); ctx.fill();
  ctx.restore();
}
function trail(posFn, i, t, n, step, s, a, col = 'gold') {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  let p0 = posFn(i, t);
  for (let k = 1; k <= n; k++) {
    const p1 = posFn(i, t - k * step), f = 1 - k / (n + 1);
    if (p1.a <= .01 && k > 1) break;
    ctx.strokeStyle = rgba(col, a * f * f * .75); ctx.lineWidth = 7 * s * f + 1;
    ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke(); p0 = p1;
  }
  ctx.restore();
}
function heading(posFn, i, t) { const a = posFn(i, t - .02), b = posFn(i, t + .02); return Math.atan2(b.y - a.y, b.x - a.x); }

// ---------- PHASE A/B : the ring of 33 and the race (0 - 8.4) ----------
const N = 33;
const appearAB = (i) => i < 30 ? .06 + 1.08 * Math.pow(i / 29, 1.35) : [2.5, 2.95, 3.4][i - 30];
function posAB(i, t) {
  const ta = appearAB(i), ring = i < 30;
  const Rr = ring ? 300 : 440, th0 = ring ? i / 30 * TAU : (i - 30) / 3 * TAU + .55;
  const kk = ease((t - 4.71 - .45 * R(i, 1)) / (2.43 - .45));
  const rot = .35 * t + 2.6 * ei((t - 4.71) / 2.43);
  const sp = (i % 2 ? 1 : -1) * (R(i, 2) * 3 + 2) * kk * kk;
  const r = (Rr + 16 * env(t) * (1 - kk)) * (1 - kk);
  const th = th0 + rot + sp;
  let a = eo((t - ta) / .22) * (1 - sm(7.1, 7.28, t)) * (t < ta ? 0 : 1);
  return { x: 540 + r * Math.cos(th), y: 880 + .92 * r * Math.sin(th), a };
}
function phaseAB(t) {
  if (t > 8.5) return;
  const cnt = clamp(Math.floor((t - .06) / 1.08 * 30), 0, 30);
  // anchor glow in centre, grows with count
  const gr = (1 - sm(7.1, 7.3, t));
  geometry(540, 880, 380 + 40 * env(t), t * .12, (.10 + .12 * sm(0, 3, t)) * gr, 'gold');
  geometry(540, 880, 560, -t * .07, .07 * sm(2, 4, t) * gr, 'warm', 1.2);
  glow(540, 880, 200 + cnt * 8 + 90 * env(t), 'gold', (.12 + cnt * .008) * gr);
  for (let i = 0; i < N; i++) {
    const p = posAB(i, t); if (p.a < .01) continue;
    const age = t - appearAB(i), flare = Math.max(0, 1 - age / .35);
    const race = sm(4.71, 5.4, t);
    if (race > 0) trail(posAB, i, t, 9, .028, .85, p.a * race * (1 - sm(6.9, 7.2, t)));
    const s = (.62 + .3 * eo(age / .35)) * (i >= 30 ? 1.15 : 1);
    angel(p.x, p.y, heading(posAB, i, t), s * (1 + .5 * flare * (i >= 30 ? 1 : .3)), p.a, flare * (i >= 30 ? 1.4 : .6), t * 9 + i, i >= 30 ? 'white' : 'pale');
  }
  // convergence flash on "bas" (7.14) and the resulting orb (the sentence)
  const f = pulse(t, 7.16, .14);
  if (t > 6.2 && t < 8.6) {
    const orb = sm(6.6, 7.15, t) * (1 - sm(8.1, 8.5, t));
    glow(540, 880, 80 + 700 * f, 'white', f * .95);
    ctx.globalCompositeOperation = 'lighter';
    if (f > .02) { ctx.strokeStyle = rgba('pale', f * .8); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(540, 880, 40 + 520 * (1 - f), 0, TAU); ctx.stroke(); }
    ctx.globalCompositeOperation = 'source-over';
    return orb;
  }
}
// the sentence-orb that travels to the man in the hall (7.2 -> 10.5)
function sentenceOrb(t, manPos) {
  if (t < 7.1 || t > 10.7) return;
  const a = sm(7.1, 7.3, t), k = ease((t - 8.2) / 2.2);
  const mx = manPos ? manPos.x : 430, my = manPos ? manPos.y : 1100;
  const x = lerp(540, mx, k) + Math.sin(k * Math.PI) * 120, y = lerp(880, my, k) - Math.sin(k * Math.PI) * 160;
  const sz = lerp(70, 13, k) * (1 + .15 * Math.sin(t * 9)), fade = 1 - sm(10.3, 10.7, t);
  glow(x, y, sz * 5, 'gold', a * .5 * fade); glow(x, y, sz * 1.8, 'pale', a * .9 * fade);
  // trailing motes
  for (let j = 1; j < 14; j++) {
    const kj = ease((t - j * .045 - 8.2) / 2.2);
    const xj = lerp(540, mx, kj) + Math.sin(kj * Math.PI) * 120 + (R(j) - .5) * 20, yj = lerp(880, my, kj) - Math.sin(kj * Math.PI) * 160 + (R(j, 1) - .5) * 20;
    glow(xj, yj, sz * (1 - j / 16) * 1.6, 'gold', a * .35 * fade * (1 - j / 14));
  }
}

// ---------- HALL (8.4 - 45) ----------
const HL = { f: 1250, vpy: 930, hc: 300 };
const MAN = { X: -60, Z: 520 };
const ROWS = [520, 680, 840, 1000, 1160];
function camZ(t) { return 60 * sm(8.4, 30, t); }
function proj(X, Y, Z, zc) { const s = HL.f / (Z - zc); return { x: 540 + X * s, y: HL.vpy + (HL.hc - Y) * s, s }; }
function rukuAngle(t, row) {
  const tt = t - row * .05;
  return 1.45 * (sm(20.55, 21.35, tt) - sm(23.05, 23.95, tt));
}
function person(sx, floorY, sc, th, alpha, rim, sway = 0) {
  const hip = 95 * sc, tor = 68 * sc, hw = 23 * sc;
  const cth = Math.cos(th), sth = Math.sin(th);
  const ht = tor * cth + 10 * sc * sth;
  const topY = floorY - hip - ht, x = sx + sway;
  ctx.save();
  const fb = ctx.createLinearGradient(0, topY, 0, floorY); fb.addColorStop(0, '#0b0e1d'); fb.addColorStop(1, '#03040a');
  ctx.fillStyle = fb;
  ctx.beginPath();
  ctx.moveTo(x - hw * .95, floorY);
  ctx.lineTo(x - hw * .88, floorY - hip);
  ctx.quadraticCurveTo(x - hw * 1.18, floorY - hip - ht * .5, x - hw * 1.05, topY + 4 * sc);
  ctx.quadraticCurveTo(x, topY - 7 * sc, x + hw * 1.05, topY + 4 * sc);
  ctx.quadraticCurveTo(x + hw * 1.18, floorY - hip - ht * .5, x + hw * .88, floorY - hip);
  ctx.lineTo(x + hw * .95, floorY); ctx.closePath(); ctx.fill();
  // head (turban)
  const hr = 14.5 * sc, hy = topY - hr * .62 + (th > .5 ? 3 * sc * sth : 0);
  ctx.beginPath(); ctx.arc(x, hy, hr, 0, TAU); ctx.fill();
  if (rim > .01) {
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba('warm', rim); ctx.lineWidth = Math.max(1, 1.8 * sc);
    ctx.beginPath(); ctx.arc(x, hy, hr, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - hw * 1.05, topY + 5 * sc); ctx.quadraticCurveTo(x, topY - 7 * sc, x + hw * 1.05, topY + 5 * sc); ctx.stroke();
  }
  ctx.restore();
}
function mihrabLevel(t) {
  return .62 + .45 * pulse(t, 23.9, .75) + .55 * sm(41.8, 44.0, t) + .15 * Math.sin(t * 2.1) * .3;
}
function drawHall(t, a, offY, zoomK) {
  const zc = camZ(t), lvl = mihrabLevel(t);
  const manS = proj(MAN.X, 120, MAN.Z, zc);
  // ----- zoom / camera framing -----
  const z = 1 + .75 * (sm(25.3, 27.4, t) - sm(33.5, 35.8, t)) + .07 * sm(35.5, 44, t) + .05 * sm(13, 20, t);
  const u = (z - 1) / .75;
  const uu = clamp(sm(25.3, 27.4, t) - sm(33.5, 35.8, t));
  ctx.save(); ctx.globalAlpha = a; ctx.translate(0, offY);
  ctx.translate(manS.x + (540 - manS.x) * uu, manS.y + (1060 - manS.y) * uu);
  ctx.scale(z, z); ctx.translate(-manS.x, -manS.y);

  // floor
  const vp = HL.vpy;
  const fg = ctx.createLinearGradient(0, vp, 0, H + 400);
  fg.addColorStop(0, 'rgba(14,20,42,0)'); fg.addColorStop(.04, 'rgba(14,20,42,.92)'); fg.addColorStop(.3, '#080b19'); fg.addColorStop(1, '#03040a');
  ctx.fillStyle = fg; ctx.fillRect(-400, vp, W + 800, H);
  // mihrab glow pool & arch
  const mz = 2400, mp = proj(0, 0, mz, zc), mt = proj(0, 230, mz, zc);
  glow(540, vp + 40, 900, 'warm', .16 * lvl); glow(540, vp + 30, 520, 'gold', .26 * lvl); glow(540, vp, 240, 'pale', .35 * lvl);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const aw = 92, ah = 230 * mp.s * 1.0;
  const ag = ctx.createLinearGradient(0, mt.y, 0, mp.y);
  ag.addColorStop(0, rgba('pale', .95 * Math.min(1, lvl))); ag.addColorStop(1, rgba('gold', .55 * Math.min(1, lvl)));
  ctx.fillStyle = ag; ctx.beginPath();
  ctx.moveTo(540 - aw / 2, mp.y); ctx.lineTo(540 - aw / 2, mt.y + 40); ctx.quadraticCurveTo(540 - aw / 2, mt.y + 6, 540, mt.y - 14);
  ctx.quadraticCurveTo(540 + aw / 2, mt.y + 6, 540 + aw / 2, mt.y + 40); ctx.lineTo(540 + aw / 2, mp.y); ctx.closePath(); ctx.fill();
  // god-rays from mihrab
  for (let k = 0; k < 7; k++) {
    const ra = -Math.PI / 2 + (k - 3) * .21 + Math.sin(t * .3 + k) * .02;
    const rg = ctx.createLinearGradient(540, vp, 540 + Math.cos(ra) * 900, vp + Math.sin(ra) * 900);
    rg.addColorStop(0, rgba('pale', .10 * lvl)); rg.addColorStop(1, rgba('pale', 0));
    ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(540, vp);
    ctx.lineTo(540 + Math.cos(ra - .05) * 1100, vp + Math.sin(ra - .05) * 1100); ctx.lineTo(540 + Math.cos(ra + .05) * 1100, vp + Math.sin(ra + .05) * 1100); ctx.fill();
  }
  ctx.restore();
  { const rg = ctx.createLinearGradient(0, vp, 0, H + 300); rg.addColorStop(0, rgba('gold', .22 * lvl)); rg.addColorStop(1, rgba('gold', .02 * lvl));
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(500, vp); ctx.lineTo(580, vp); ctx.lineTo(900, H + 300); ctx.lineTo(180, H + 300); ctx.closePath(); ctx.fill(); ctx.restore(); }
  // floor lines (prayer mats)
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 1;
  for (let zz = 400; zz < 2400; zz += 150) {
    const z0 = zz - (zc % 150), p = proj(0, 0, z0, zc); if (p.y < vp) continue;
    ctx.strokeStyle = rgba('gold', .05 * clamp(1 - (z0 - 400) / 2000) * lvl); ctx.beginPath(); ctx.moveTo(-200, p.y); ctx.lineTo(W + 200, p.y); ctx.stroke();
  }
  for (let X = -1500; X <= 1500; X += 140) {
    const p0 = proj(X, 0, 380, zc), p1 = proj(X, 0, 2400, zc);
    const lg = ctx.createLinearGradient(0, p0.y, 0, p1.y); lg.addColorStop(0, rgba('gold', 0)); lg.addColorStop(1, rgba('gold', .06 * lvl));
    ctx.strokeStyle = lg; ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
  }
  ctx.restore();
  // palm-trunk columns
  for (let side = -1; side <= 1; side += 2) {
    for (let k = 0; k < 9; k++) {
      const zc2 = 420 + k * 300 - (zc % 300);
      const p = proj(side * 430, 0, zc2, zc), top = proj(side * 430, 560, zc2, zc);
      const wd = 40 * p.s, fog = clamp(1 - (zc2 - 400) / 2400);
      const cg = ctx.createLinearGradient(p.x - wd, 0, p.x + wd, 0);
      const lit = side > 0 ? 0 : 1;
      cg.addColorStop(lit, rgba('warm', .20 * lvl * fog)); cg.addColorStop(.4, `rgba(8,10,22,${.95 * fog + .05})`); cg.addColorStop(1 - lit, `rgba(3,4,10,${.95 * fog + .05})`);
      ctx.fillStyle = cg; ctx.fillRect(p.x - wd, top.y, wd * 2, p.y - top.y);
      // fronds
      ctx.strokeStyle = `rgba(6,8,16,${.9 * fog})`; ctx.lineWidth = Math.max(1, 8 * p.s);
      for (let f = 0; f < 5; f++) {
        const ang = -Math.PI / 2 + (f - 2) * .5 + (side > 0 ? -.35 : .35);
        ctx.beginPath(); ctx.moveTo(p.x, top.y);
        ctx.quadraticCurveTo(p.x + Math.cos(ang) * 150 * p.s, top.y + Math.sin(ang) * 120 * p.s - 30 * p.s, p.x + Math.cos(ang) * 260 * p.s, top.y + Math.sin(ang) * 120 * p.s + 90 * p.s); ctx.stroke();
      }
      // rim edge
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba('warm', .22 * lvl * fog); ctx.lineWidth = Math.max(1, 2 * p.s);
      const ex = p.x + (side > 0 ? -wd : wd) ; ctx.beginPath(); ctx.moveTo(ex, top.y); ctx.lineTo(ex, p.y); ctx.stroke(); ctx.restore();
    }
  }
  // floor-wave of the question (37.83 -> 39.42)
  const qt = (t - 37.83) / 1.59;
  const qz = qt > 0 && qt < 1.15 ? lerp(2400, 480, clamp(qt)) : -1;
  // rows of worshippers
  const dark = 0;
  for (let r = ROWS.length - 1; r >= 0; r--) {
    const Z = ROWS[r], p = proj(0, 0, Z, zc), th = rukuAngle(t, r);
    let wave = 0; if (qz > 0) wave = pulse(Z, qz, 90) ;
    const fog = clamp(1 - (Z - 500) / 2200);
    for (let j = -3; j <= 3; j++) {
      const X = j * 120 + (r % 2 ? 0 : 60);
      if (r === 0 && Math.abs(X - MAN.X) < 1 ) {}
      const q = proj(X, 0, Z, zc);
      const isMan = r === 0 && X === MAN.X;
      const rim = (.28 * lvl + .55 * wave + (isMan ? .35 * sm(39.4, 40.5, t) * (1 - sm(42.8, 44, t)) + .4 * sm(26, 27.4, t) * (1 - sm(34, 35.5, t)) : 0)) * fog;
      person(q.x, q.y, q.s, th, 1, rim, Math.sin(t * .9 + j + r) * .8 * q.s);
    }
  }
  // travelling question line
  if (qz > 0) {
    const p = proj(0, 0, qz, zc);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const lg = ctx.createLinearGradient(-200, 0, W + 200, 0); lg.addColorStop(0, rgba('gold', 0)); lg.addColorStop(.5, rgba('pale', .55 * (1 - clamp(qt)))); lg.addColorStop(1, rgba('gold', 0));
    ctx.strokeStyle = lg; ctx.lineWidth = 3 + 6 * p.s; ctx.beginPath();
    for (let x = -200; x <= W + 200; x += 40) { const yy = p.y + Math.sin(x * .01 + t * 5) * 3 * p.s; x === -200 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); }
    ctx.stroke(); glow(540, p.y, 380 * p.s + 60, 'gold', .18 * (1 - clamp(qt))); ctx.restore();
  }
  ctx.restore();
  return { x: manS.x + (540 - manS.x) * uu, y: manS.y + (1060 - manS.y) * uu, z };
}

// ---------- voice motes + ribbon (du'a) ----------
function chestScreen(t, offY) {
  // screen position of the man's chest including camera framing
  const zc = camZ(t), manS = proj(MAN.X, 120, MAN.Z, zc);
  const uu = clamp(sm(25.3, 27.4, t) - sm(33.5, 35.8, t));
  const z = 1 + .75 * uu + .07 * sm(35.5, 44, t) + .05 * sm(13, 20, t);
  const cx = manS.x + (540 - manS.x) * uu, cy = manS.y + (1060 - manS.y) * uu;
  // point (manS.x, manS.y) maps to (cx, cy)
  return { x: cx, y: cy + offY - 62 * manS.s * z };
}
const MOTES = [];
(function () {
  let j = 0;
  for (let k = 0; k < 420; k++) {
    const te = 27.55 + k * .0125;
    if (te > 32.4) break;
    if (env(te) < .09 && R(k) > .15) continue;
    MOTES.push({ te, vy: 110 + R(k, 1) * 190, amp: 14 + R(k, 2) * 46, w: 1 + R(k, 3) * 2.2, ph: R(k, 4) * TAU, sz: 5 + R(k, 5) * 14, life: 5.5 + R(k, 6) * 2 });
  }
})();
const VOICE_MOTES = MOTES;
function motes(t) {
  if (t < 27.5 || t > 45) return;
  ctx.globalCompositeOperation = 'lighter';
  for (const m of VOICE_MOTES) {
    const age = t - m.te; if (age < 0 || age > m.life) continue;
    const o = chestScreen(m.te, 0);
    const x = o.x + Math.sin(age * m.w + m.ph) * m.amp * (.3 + age * .3), y = o.y - 40 - age * m.vy * (1 + .06 * age);
    // colour by word: tayyiban (30.85-31.4) cool/white, mubarakan (31.4-32.4) bright warm
    const col = m.te > 30.85 && m.te < 31.45 ? 'cool' : (m.te > 31.45 ? 'white' : 'gold');
    const fade = eo(age / .35) * (1 - sm(m.life * .6, m.life, age)) * (1 - sm(43, 45, t));
    glow(x, y, m.sz * (1 + .6 * (m.te > 31.45 ? 1 : 0)), col, .8 * fade);
    glow(x, y, m.sz * 4, col === 'cool' ? 'cool' : 'gold', .18 * fade);
  }
  ctx.globalCompositeOperation = 'source-over';
}
function ribbon(t, x0, y0, t0, t1, scale = 1, fadeEnd = 0) {
  if (t < t0 - .3 || t > t1 + 3) return;
  const a = sm(t0 - .3, t0 + .1, t) * (1 - sm(t1, t1 + 3, t));
  if (a < .01) return;
  const col = t > 30.85 && t < 31.45 ? 'cool' : (t >= 31.45 && t < 33 ? 'white' : 'gold');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  const top = -60, seg = 70;
  for (let pass = 0; pass < 3; pass++) {
    ctx.beginPath();
    for (let k = 0; k <= seg; k++) {
      const u = k / seg, y = lerp(y0, top, u);
      const lag = u * 1.2; // audio history travels along the ribbon
      const e = env(t - lag * .7);
      const x = x0 + Math.sin(u * 14 - t * 5 + pass) * (14 + 70 * e) * Math.pow(u, .6) * scale + Math.sin(u * 5 + t) * 18 * u;
      k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    const w = [22, 9, 3][pass];
    ctx.strokeStyle = rgba(pass === 2 ? 'white' : col, a * [.07, .25, .95][pass]);
    ctx.lineWidth = w * (.6 + env(t) * .9) * scale; ctx.stroke();
  }
  glow(x0, y0, 140 * (.6 + env(t)), col, a * .5);
  ctx.restore();
}

// ---------- PHASE C/D : the host of angels races to the word (44 - 60) ----------
const WIN = 16;
const appearC = (i) => i < 30 ? 44.85 + 1.75 * (i / 29) : [46.75, 46.95, 47.15][i - 30];
function fanPos(i) {
  const arc = i % 3, j = Math.floor(i / 3), cnt = 11;
  const rr = 230 + arc * 135, a = Math.PI + (j + .5 + (arc === 1 ? .35 : 0)) / cnt * Math.PI;
  return { x: 540 + rr * Math.cos(a) * 1.05, y: 640 + rr * Math.sin(a) * .85 };
}
const ORB = (t) => ({ x: 540, y: lerp(1780, 1050, eo((t - 47.35) / 2.5)) });
const arrive = (i) => i === WIN ? 50.25 : 50.5 + R(i, 3) * .85;
function orbitPos(i, t) {
  const ring = i % 3, ro = 300 + ring * 150 + 10 * Math.sin(t * 2 + i);
  const dir = ring % 2 ? -1 : 1;
  const sp = (1 + .9 * sm(56.1, 57.3, t)) * (1 - sm(58.25, 58.62, t));
  // integrate speed: base angle accumulates; use analytic approx
  const base = i / 33 * TAU * 3 + dir * (0.5 * (t - 50.5) * (1 + .5 * sm(56.1, 57.3, t))) ;
  const stop = 1 - sm(58.25, 58.62, t);
  const leader = t >= 54.98 && t < 57.4 ? (Math.floor((t - 54.98) / .24) * 7 + 3) % 33 : -1;
  const pull = leader === i ? .55 : 1;
  const sq = sm(57.4, 58.4, t) * .25;
  const r = ro * pull * (1 - sq - .12 * (1 - stop));
  return { x: 540 + r * Math.cos(base), y: 1050 + r * Math.sin(base) * .72, leader };
}
function posC(i, t) {
  const S = fanPos(i), ap = appearC(i);
  const bob = (1 - sm(47.9, 48.2, t)) * Math.sin(t * 1.6 + i) * 9;
  const O = ORB(t);
  const d = i === WIN ? 0 : .12 + R(i, 4) * .4;
  const dur = i === WIN ? 2.25 : arrive(i) - 47.97 - d;
  const p = ease((t - 47.97 - d) / dur);
  const dest = orbitPos(i, Math.max(t, 51.6));
  // destination: orb area -> then orbit
  const tx = lerp(O.x + (R(i, 5) - .5) * 80, dest.x, sm(51.2, 52.2, t)), ty = lerp(O.y + (R(i, 6) - .5) * 80, dest.y, sm(51.2, 52.2, t));
  const sx = S.x, sy = S.y + bob;
  const cxp = (sx + tx) / 2 + (i % 2 ? 1 : -1) * (120 + R(i, 7) * 200), cyp = (sy + ty) / 2 - 120 - R(i, 8) * 100;
  const q = 1 - p;
  let x = q * q * sx + 2 * q * p * cxp + p * p * tx, y = q * q * sy + 2 * q * p * cyp + p * p * ty;
  if (t >= 51.6) { const o = orbitPos(i, t); const w = sm(51.6, 52.4, t); x = lerp(x, o.x, w); y = lerp(y, o.y, w); }
  const a = (t < ap ? 0 : eo((t - ap) / .35)) * (1 - sm(59.2, 60.6, t));
  return { x, y, a };
}
function phaseCD(t) {
  if (t < 44.6 || t > 61) return;
  const O = ORB(t);
  // camera pull back after arrival
  const pb = lerp(1, .92, sm(51.8, 53.2, t));
  ctx.save();
  ctx.translate(540, 1050); ctx.scale(pb, pb); ctx.translate(-540, -1050);
  // heaven opening: geometry
  const gA = sm(44.2, 46.5, t) * (1 - sm(58.8, 60, t));
  geometry(540, 600, 520, t * .08, .13 * gA, 'gold'); geometry(540, 600, 760, -t * .05, .06 * gA, 'pale', 1.2);
  // the du'a (orb) rising
  const oa = sm(47.3, 47.6, t) * (1 - sm(59.0, 60.2, t));
  const beat = pulse(t, 58.35, .22);
  glow(O.x, O.y, 260 + 80 * Math.sin(t * 5) + 200 * pulse(t, 50.25, .25) + 140 * beat, 'gold', .5 * oa);
  glow(O.x, O.y, 90 + 40 * pulse(t, 50.25, .2) + 40 * beat, 'white', .95 * oa);
  // angels
  for (let i = 0; i < N; i++) {
    const p = posC(i, t); if (p.a < .01) continue;
    const ap = appearC(i), age = t - ap;
    let flare = Math.max(0, 1 - age / .4) * .8;
    const rush = sm(47.97, 48.5, t) * (1 - sm(arrive(i) - .1, arrive(i) + .5, t));
    if (rush > .01) trail(posC, i, t, 11, .03, .85, p.a * rush);
    // counting flare 52.15 -> 54.05
    flare += pulse(t, 52.15 + i * .056, .13) * .9;
    // leader flare
    const op = orbitPos(i, t); if (op.leader === i) flare += .8;
    if (i === WIN) { flare += .55 * sm(48, 50.2, t) * (1 - sm(52, 53, t)); }
    const s = (i === WIN ? 1.15 : .8) * (.7 + .3 * eo(age / .4)) * (1 + (i === WIN ? .25 * sm(50.2, 50.8, t) * (1 - sm(52, 53, t)) : 0));
    angel(p.x, p.y, (t > 47.97 && t < 52 ? heading(posC, i, t) : heading(posC, i, t)), s, p.a, flare, t * 8 + i * 1.7, i === WIN ? 'white' : 'pale');
  }
  // the writing of light (50.25 -> 51.4)
  const wr = clamp((t - 50.25) / 1.1);
  if (wr > 0 && t < 59) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const fadeW = 1 - sm(53, 58, t) * .6;
    for (let pass = 0; pass < 2; pass++) {
      ctx.beginPath();
      const nPts = Math.floor(160 * wr);
      for (let k = 0; k <= nPts; k++) {
        const u = k / 160, x = 540 + (u - .5) * 640;
        const y = 1330 + Math.sin(u * 38) * 24 * Math.sin(u * 3.1) + Math.sin(u * 15) * 12 + Math.cos(u * 61) * 5;
        k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = rgba(pass ? 'white' : 'gold', (pass ? .85 : .25) * fadeW * (1 - sm(58.8, 60, t))); ctx.lineWidth = pass ? 2.4 : 10; ctx.stroke();
    }
    ctx.restore();
  }
  // burst on arrival
  const b = pulse(t, 50.3, .16);
  if (b > .02) { glow(O.x, O.y, 700 * b + 100, 'white', b * .7); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba('pale', b * .7); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(O.x, O.y, 600 * (1 - b) + 30, 0, TAU); ctx.stroke(); ctx.restore(); }
  const b2 = pulse(t, 58.35, .12);
  if (b2 > .02) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba('pale', b2 * .8); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(O.x, O.y, 450 * (1 - b2) + 20, 0, TAU); ctx.stroke(); ctx.restore(); }
  ctx.restore();
}

// ---------- ember (59.7 - 66) ----------
function ember(t) {
  if (t < 59.3 || t > 66.8) return;
  const a = sm(59.4, 60.2, t) * (1 - sm(65.4, 66.6, t));
  const fl = .55 + .25 * Math.sin(t * 17) * Math.sin(t * 5.3) , gone = sm(62.9, 63.9, t);
  const ex = 540 + 60 * sm(62.9, 64, t), ey = 1000 - 10 * sm(62.9, 64, t);
  ctx.globalCompositeOperation = 'lighter';
  glow(ex, ey, 120 * fl * (1 - gone * .6), 'warm', .5 * a * (1 - gone * .8)); glow(ex, ey, 34, 'pale', .8 * a * fl * (1 - gone));
  // drifting ash
  for (let i = 0; i < 40; i++) {
    const t0 = 62.9 + R(i) * .8, age = t - t0; if (age < 0 || age > 3.2) continue;
    const x = 540 + age * (120 + R(i, 1) * 220) + Math.sin(age * 3 + i) * 12, y = 1000 + (R(i, 2) - .5) * 60 - age * (10 + R(i, 3) * 50) + age * age * 10;
    glow(x, y, 5 + R(i, 4) * 8, 'warm', .6 * (1 - age / 3.2));
  }
  // the spark returns (64.33)
  const sp = pulse(t, 64.4, .35);
  glow(540, 1000, 40 + 260 * sp, 'gold', .8 * sp);
  ctx.globalCompositeOperation = 'source-over';
}

// ---------- PHASE E : the finale (64.3 - 77) ----------
const FIG = { x: 540, y: 1790, s: 3.1 };
function heavenPos(i) {
  const arc = i % 3, j = Math.floor(i / 3), cnt = 11;
  const rr = 270 + arc * 150, a = Math.PI + (j + .5 + (arc === 1 ? .35 : 0)) / cnt * Math.PI;
  return { x: 540 + rr * Math.cos(a) * 1.1, y: 560 + rr * Math.sin(a) * .9 };
}
function posE(i, t) {
  const H0 = heavenPos(i), ta = 66.16 + R(i, 1) * 1.6;
  const a0 = (t < ta ? 0 : eo((t - ta) / 1.0)) ;
  const rushT = 67.98 + R(i, 2) * .25, k = ease((t - rushT) / (1.2 + R(i, 3) * .5));
  const circ = 190 + (i % 3) * 110 + 40 * sm(73.7, 75.1, t) * 0;
  const th = i / 33 * TAU + t * (i % 2 ? -.45 : .45) * (1 + 1.5 * sm(73.7, 75.1, t));
  const rr = circ * (1 + .9 * sm(73.7, 75.1, t)) + 800 * ei((t - 75.18) / 1.2);
  const Cx = 540 + rr * Math.cos(th), Cy = 1050 + rr * Math.sin(th) * .6;
  const hov = Math.sin(t * 1.4 + i) * 8;
  const midx = (H0.x + Cx) / 2 + (i % 2 ? 140 : -140), midy = (H0.y + Cy) / 2 - 80;
  const q = 1 - k;
  const x = q * q * H0.x + 2 * q * k * midx + k * k * Cx, y = q * q * (H0.y + hov) + 2 * q * k * midy + k * k * Cy;
  const a = a0 * (1 - sm(76.0, 77.0, t)) ;
  return { x, y, a };
}
function phaseE(t) {
  if (t < 66.0) return;
  const gA = sm(66.5, 69.5, t) * (1 - sm(76.2, 77.1, t));
  glow(540, 700, 1100, 'gold', .10 * gA * (.7 + .3 * sm(73.7, 75.1, t)));
  geometry(540, 900, 560 + 180 * sm(73.7, 75.1, t), t * .1, (.10 + .22 * sm(72.5, 75.2, t) + .5 * pulse(t, 75.3, .25)) * gA, 'gold');
  geometry(540, 900, 820, -t * .06, .07 * gA, 'pale', 1.2);
  // figure (bow & rise) -- the viewer
  const figA = sm(68.8, 69.8, t) * (1 - sm(76.0, 77.0, t));
  const th = 1.4 * (sm(71.15, 71.75, t) - sm(71.95, 72.55, t));
  if (figA > .01) {
    ctx.save(); ctx.globalAlpha = figA;
    // soft floor
    const fg = ctx.createLinearGradient(0, 1700, 0, H); fg.addColorStop(0, 'rgba(10,14,32,0)'); fg.addColorStop(1, 'rgba(3,4,10,.9)');
    ctx.fillStyle = fg; ctx.fillRect(0, 1700, W, 220);
    glow(540, 1700, 520, 'gold', .16 * (1 - sm(72.6, 73.6, t) * 0));
    person(FIG.x, FIG.y, FIG.s * .78, th, 1, .38 + .3 * sm(72.5, 75, t));
    ctx.restore();
  }
  // voice from the viewer (72.68 qawlaha, 73.73 w inta 'aarif)
  const ya = FIG.y - 190 * FIG.s * .78;
  ribbon(t, 540, ya, 72.6, 75.6, .9);
  // angels
  for (let i = 0; i < N; i++) {
    const p = posE(i, t); if (p.a < .01) continue;
    const rushT = 67.98 + R(i, 2) * .25;
    const rushing = sm(rushT - .05, rushT + .3, t) * (1 - sm(rushT + 1.2, rushT + 1.9, t));
    if (rushing > .01) trail(posE, i, t, 10, .03, .8, p.a * rushing * .9);
    const fin = pulse(t, 75.3, .22);
    const flare = fin * 1.6 + .2 * sm(73.7, 75, t) + pulse(t, 72.7 + i * .02, .2) * .5;
    angel(p.x, p.y, heading(posE, i, t), .72 + .1 * fin, p.a * (.55 + .45 * sm(67.9, 69.5, t)), flare, t * 8 + i * 1.3);
  }
  const fl = pulse(t, 75.35, .22);
  if (fl > .02) { glow(540, 1000, 1500 * fl + 200, 'white', fl * .55); }
}

// ---------- hall helpers: question ripple / heartbeat spotlight ----------
function spotlight(t, man) {
  const k = sm(39.4, 40.1, t) * (1 - sm(43.0, 44.2, t));
  if (k < .01) return;
  let beat = 0;
  for (let b = 0; b < 5; b++) { const tb = 39.45 + b * .88; beat += pulse(t, tb, .1) + .55 * pulse(t, tb + .24, .1); }
  const r = 330 - 50 * sm(39.4, 42.4, t) + 28 * beat;
  const g = ctx.createRadialGradient(man.x, man.y - 20, r * .22, man.x, man.y - 20, r * 1.9);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.45, `rgba(1,2,6,${.35 * k})`); g.addColorStop(1, `rgba(1,2,6,${.82 * k})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  glow(man.x, man.y - 20, 150 + 90 * beat, 'gold', .22 * k * (1 + beat));
}

// ---------- compose ----------
const noise = document.createElement('canvas'); noise.width = noise.height = 256;
(function () { const g = noise.getContext('2d'), d = g.createImageData(256, 256); for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); })();
const vig = ctx.createRadialGradient(540, 960, 520, 540, 960, 1250);
vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,.62)');

window.renderFrame = function (t) {
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  // camera tilt up (hall -> heavens) 43.6-45.2
  const tilt = ease((t - 43.6) / 1.6);
  const offY = 1180 * tilt * (t < 69 ? 1 : 0);
  const skyShift = -tilt * 300;
  const warm = sm(44.0, 46, t) * (1 - sm(58.5, 60.2, t)) + sm(66.5, 70, t) * (1 - sm(76.2, 77, t)) * .8;
  sky(t, skyShift, warm);
  if (t < 8.6) phaseAB(t);
  // hall
  const hallA = sm(8.1, 9.3, t) * (1 - sm(46.2, 48.2, t));
  let man = null;
  if (hallA > .002) man = drawHall(t, hallA, offY, 0);
  const manPos = chestScreen(Math.min(t, 40), 0);
  if (t > 7.0 && t < 10.8) sentenceOrb(t, { x: manPos.x, y: manPos.y - 20 });
  if (man) { ctx.save(); ctx.globalAlpha = 1; spotlight(t, { x: man.x, y: man.y + offY }); ctx.restore(); }
  // whisper glints in the hall (someone is listening...)
  if (t > 10.9 && t < 13.2) {
    for (let k = 0; k < 4; k++) { const a = pulse(t, 11.4 + k * .45, .25); glow(300 + k * 150, 300 + (k % 2) * 90, 40, 'pale', .5 * a); }
  }
  // du'a of the man
  const cs = chestScreen(t, offY);
  ribbon(t, cs.x, cs.y - 30, 27.58, 32.5, 1);
  motes(t);
  if (t >= 44.4 && t <= 61) phaseCD(t);
  ember(t);
  phaseE(t);
  // grade
  ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = .035; ctx.globalCompositeOperation = 'overlay';
  const ox = Math.floor(R(Math.floor(t * 30)) * 256), oy = Math.floor(R(Math.floor(t * 30), 3) * 256);
  ctx.fillStyle = ctx.createPattern(noise, 'repeat'); ctx.save(); ctx.translate(-ox, -oy); ctx.fillRect(ox, oy, W, H); ctx.restore();
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  // fades
  const fin = 1 - sm(0, .35, t) , fout = sm(76.2, 77.0, t);
  const f = Math.max(fin * .9, fout);
  if (f > 0) { ctx.fillStyle = `rgba(0,0,0,${f})`; ctx.fillRect(0, 0, W, H); }
};
window.renderFrame(0);
