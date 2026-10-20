// Renders the animal / bird friends used on the kasrah slides to transparent PNGs in sprites/
// (trim.py then crops them and records each aspect ratio).
// Characters come from fatha-adventure/src/cast.js; flying birds, butterflies and the bee are drawn here.
const fs = require("fs");
const path = require("path");
const { chromium } = require(process.env.PLAYWRIGHT || "/opt/node-tools/node_modules/playwright");
const { critter } = require("../fatha-adventure/src/cast.js");
const OL = "#2A1838";
const svg = inner => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">${inner}</svg>`;
const flyer = (body, wing, belly, up) => svg(`
  <ellipse cx="170" cy="${up ? 150 : 270}" rx="40" ry="95" fill="${wing}" stroke="${OL}" stroke-width="7" transform="rotate(${up ? -35 : 35} 170 ${up ? 150 : 270})"/>
  <path d="M100 225 L45 200 L55 255 Z" fill="${body}" stroke="${OL}" stroke-width="7" stroke-linejoin="round"/>
  <ellipse cx="190" cy="230" rx="100" ry="70" fill="${body}" stroke="${OL}" stroke-width="8"/>
  <ellipse cx="200" cy="255" rx="60" ry="36" fill="${belly}"/>
  <circle cx="275" cy="185" r="52" fill="${body}" stroke="${OL}" stroke-width="8"/>
  <path d="M320 178 L362 194 L320 210Z" fill="#FFB238" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
  <circle cx="290" cy="172" r="11" fill="${OL}"/><circle cx="294" cy="168" r="4" fill="#fff"/>
  <circle cx="266" cy="202" r="9" fill="#FF8FA8" opacity=".7"/>
  <ellipse cx="215" cy="${up ? 145 : 280}" rx="42" ry="100" fill="${wing}" stroke="${OL}" stroke-width="7" transform="rotate(${up ? -20 : 20} 215 ${up ? 145 : 280})"/>`);
const butterfly = (a, b) => svg(`
  <g stroke="${OL}" stroke-width="7" stroke-linejoin="round">
  <path d="M200 200 Q120 40 50 90 Q20 170 200 210Z" fill="${a}"/><path d="M200 200 Q280 40 350 90 Q380 170 200 210Z" fill="${a}"/>
  <path d="M200 210 Q90 230 90 310 Q150 350 200 220Z" fill="${b}"/><path d="M200 210 Q310 230 310 310 Q250 350 200 220Z" fill="${b}"/></g>
  <circle cx="110" cy="120" r="18" fill="#fff" opacity=".8"/><circle cx="290" cy="120" r="18" fill="#fff" opacity=".8"/>
  <ellipse cx="200" cy="215" rx="16" ry="70" fill="#5A3A6A" stroke="${OL}" stroke-width="6"/><circle cx="200" cy="140" r="22" fill="#5A3A6A" stroke="${OL}" stroke-width="6"/>
  <path d="M192 122 Q170 70 150 60 M208 122 Q230 70 250 60" stroke="${OL}" stroke-width="6" fill="none" stroke-linecap="round"/>
  <circle cx="150" cy="60" r="8" fill="${OL}"/><circle cx="250" cy="60" r="8" fill="${OL}"/>`);
const bee = svg(`
  <ellipse cx="170" cy="130" rx="60" ry="80" fill="#DFF4FF" stroke="${OL}" stroke-width="6" opacity=".9" transform="rotate(-25 170 130)"/>
  <ellipse cx="240" cy="125" rx="55" ry="75" fill="#DFF4FF" stroke="${OL}" stroke-width="6" opacity=".9" transform="rotate(20 240 125)"/>
  <ellipse cx="200" cy="240" rx="120" ry="85" fill="#FFD23F" stroke="${OL}" stroke-width="8"/>
  <path d="M160 160 Q140 240 160 320 M215 155 Q195 240 215 325" stroke="${OL}" stroke-width="26" fill="none"/>
  <path d="M318 240 L352 250 L318 262Z" fill="${OL}"/>
  <circle cx="110" cy="230" r="44" fill="#FFD23F" stroke="${OL}" stroke-width="7"/>
  <circle cx="96" cy="222" r="9" fill="${OL}"/><path d="M84 250 Q98 262 112 250" stroke="${OL}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M100 190 Q90 150 70 140 M120 188 Q125 150 140 136" stroke="${OL}" stroke-width="5" fill="none" stroke-linecap="round"/>`);

const LIST = [];
const POSES = ["idle", "happy", "waveA", "cheer", "laughA", "talk", "danceA", "welcome"];
["rabbit", "cat", "dog", "duck", "elephant", "turtle", "bird", "fish"].forEach(sp =>
  POSES.forEach((p, k) => LIST.push({ name: `ground_${sp}_${p}`, svg: critter(sp, p, sp + k).replace('width="800" height="800"', 'width="400" height="400"') })));
[["#E8604C", "#FFB4A2", "#FFE3D8"], ["#3A8FD9", "#9FD3FF", "#E3F4FF"], ["#2FB57A", "#A0E7B9", "#E6FFF0"], ["#8E5BD0", "#C9A7FF", "#F1E8FF"], ["#F2A20C", "#FFD98A", "#FFF4D6"]]
  .forEach(([b, w, be], k) => { LIST.push({ name: `sky_bird${k}_up`, svg: flyer(b, w, be, true) }); LIST.push({ name: `sky_bird${k}_down`, svg: flyer(b, w, be, false) }); });
[["#FF8FB8", "#FFC75F"], ["#7EC8FF", "#B892FF"], ["#FFD23F", "#FF7A90"], ["#A0E7B9", "#5EC2FF"]]
  .forEach(([a, b], k) => LIST.push({ name: `sky_butterfly${k}`, svg: butterfly(a, b) }));
LIST.push({ name: "sky_bee", svg: bee });

(async () => {
  const out = path.join(__dirname, "sprites");
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const page = await browser.newPage({ viewport: { width: 400, height: 400 } });
  for (const it of LIST) {
    await page.setContent(`<html><body style="margin:0;background:transparent">${it.svg}</body></html>`);
    await page.screenshot({ path: `${out}/${it.name}.png`, omitBackground: true });
  }
  await browser.close();
  console.log(LIST.length, "sprites");
})();
