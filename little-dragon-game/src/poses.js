const { lumi } = require('./lumi.js');
// pose library: name -> params
const P = {
  sleep:   { eyes:'closed', mouth:'sleep', tilt:-4, armL:12, armR:12, wingSc:.5, wingAng:30, squash:.92, bubble:14, blush:.6, legs:'stand', tail:-1 },
  stir:    { eyes:'half', mouth:'yawn', tilt:3, armL:130, armR:60, brows:'', wingAng:20, squash:1.03, tail:0 },
  yawn:    { eyes:'closed', mouth:'yawn', tilt:0, armL:150, armR:150, wingAng:5, wingSc:.9, squash:1.05 },
  surprised:{ eyes:'wide', mouth:'o', brows:'up', armL:120, armR:120, wingAng:-5, wingSc:.85, tilt:0, squash:1.04, legs:'jump' },
  idle:    { eyes:'open', mouth:'smile', armL:22, armR:22 },
  welcome: { eyes:'open', mouth:'grin', armL:100, armR:100, wingAng:5, wingSc:.8, brows:'happy' },
  waveA:   { eyes:'open', mouth:'grin', armL:22, armR:150, tilt:3, brows:'happy' },
  waveB:   { eyes:'happy', mouth:'laugh', armL:22, armR:130, tilt:-3 },
  laughA:  { eyes:'happy', mouth:'laugh', armL:70, armR:70, tilt:-6, wingAng:10, wingSc:.8, squash:.97 },
  laughB:  { eyes:'happy', mouth:'laugh', armL:70, armR:70, tilt:6, wingAng:10, wingSc:.8, squash:1.03 },
  danceA:  { eyes:'happy', mouth:'grin', armL:160, armR:60, tilt:-9, wingAng:8, wingSc:.85, legs:'jump', tail:1 },
  danceB:  { eyes:'happy', mouth:'grin', armL:60, armR:160, tilt:9, wingAng:8, wingSc:.85, legs:'stand', tail:-1 },
  fly:     { eyes:'open', mouth:'grin', armL:150, armR:150, wingAng:-5, wingSc:1.05, legs:'jump', tilt:-5, brows:'happy', tail:1 },
  flyUp:   { eyes:'open', mouth:'grin', armL:160, armR:160, wingAng:35, wingSc:1.05, legs:'jump', tilt:5, brows:'happy', tail:-1 },
  jump:    { eyes:'happy', mouth:'laugh', armL:165, armR:165, wingAng:20, wingSc:.85, legs:'jump', squash:1.06 },
  crouch:  { eyes:'open', mouth:'smile', armL:35, armR:35, squash:.88, wingSc:.5, brows:'happy' },
  cheer:   { eyes:'happy', mouth:'laugh', armL:170, armR:170, wingAng:25, wingSc:.95, legs:'jump', squash:1.05, brows:'happy' },
  hugOpen: { eyes:'open', mouth:'grin', armL:118, armR:118, armLen:78, wingAng:12, wingSc:.9, brows:'happy', blush:.8, tail:1 },
  hug:     { eyes:'heart', mouth:'smile', armL:60, armR:60, bendL:-40, bendR:-40, armLen:70, blush:.9, tilt:3, squash:.97 },
  sad:     { eyes:'sad', mouth:'sad', brows:'sad', armL:6, armR:6, tilt:-3, squash:.9, tear:true, wingSc:.45, wingAng:40, blush:.3, tail:-1 },
  sadTear: { eyes:'sad', mouth:'sad', brows:'sad', armL:10, armR:10, tilt:3, squash:.9, tear:true, wingSc:.45, wingAng:45, sweat:true, blush:.25 },
  happyAgain:{ eyes:'open', mouth:'grin', armL:110, armR:110, brows:'happy', wingAng:12, wingSc:.85 },
  wait:    { eyes:'look', mouth:'wait', armL:50, armR:50, brows:'happy', squash:1.02 },
  chewA:   { eyes:'happy', mouth:'chewA', puff:true, armL:30, armR:30, tilt:-3 },
  chewB:   { eyes:'happy', mouth:'chewB', puff:true, armL:30, armR:30, tilt:3 },
  yum:     { eyes:'closed', mouth:'tongue', armL:60, armR:60, tilt:5, blush:.9, brows:'happy' },
  yummy:   { eyes:'happy', mouth:'laugh', armL:40, armR:40, blush:.9 },
  yuck:    { eyes:'squint', mouth:'yuck', puff:true, armL:60, armR:60, tilt:-4, brows:'sad', sweat:true },
  hot:     { eyes:'wide', mouth:'fire', brows:'up', armL:130, armR:130, wingAng:5, wingSc:.9, squash:1.03, sweat:true },
  fire:    { eyes:'squint', mouth:'fire', armL:50, armR:50, squash:1.03, tilt:-3 },
  burp:    { eyes:'closed', mouth:'o', armL:30, armR:30, blush:.9, puff:true },
  proud:   { eyes:'happy', mouth:'smile', armL:60, armR:20, brows:'happy', blush:.8 },
  bye:     { eyes:'open', mouth:'grin', armL:22, armR:155, tilt:4, brows:'happy', glow:false },
  byeB:    { eyes:'happy', mouth:'smile', armL:22, armR:125, tilt:-3, blush:.7 },
  lookUp:  { eyes:'look', mouth:'o', brows:'up', armL:30, armR:30 },
};
module.exports = { P, lumi };
if (require.main === module) {
  const fs = require('fs');
  const out = process.argv[2];
  const items = Object.entries(P).map(([n, p]) => ({ name: 'lumi_' + n, w: 800, h: 800, svg: lumi(Object.assign({ id: n }, p)) }));
  fs.writeFileSync(out, JSON.stringify(items));
}
