// Erzeugt die handgemalten SVG-Illustrationen fuer Entwurf v3 „Am Kuechentisch“.
// Aufruf: node svg.mjs <ziel-ordner v3/assets/svg>
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });

// ---------------------------------------------------------------- Farben
const C = {
  himbeer: "#B8254E", himbeerTief: "#8E1A3B", tanne: "#1F5C4A", tanneHell: "#3E8468",
  senf: "#F3B33D", senfTief: "#D9921C", kobalt: "#2B6CB0", kobaltHell: "#7FA8DA",
  rose: "#E9C6C9", aubergine: "#2A1E22", porzellan: "#FFFCFB", glasur: "#F3EAEC",
  kaffee: "#5A3324", crema: "#A86E4A", tee: "#C98A2E",
};
const LINIE = "#3A2730";

// ---------------------------------------------------------------- Zufall (reproduzierbar)
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const f = (n) => Math.round(n * 10) / 10;

// Wackeliger Kreis als geschlossene Bezier-Kurve (Catmull-Rom -> kubisch)
function wobble(cx, cy, r, seed, amp = 0.018, n = 28) {
  const rand = rng(seed);
  const ph = [rand() * 6.28, rand() * 6.28, rand() * 6.28];
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + amp * (Math.sin(a * 2 + ph[0]) * 0.6 + Math.sin(a * 3 + ph[1]) * 0.3 + Math.sin(a * 5 + ph[2]) * 0.2) + (rand() - 0.5) * amp * 0.4;
    pts.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k]);
  }
  return smooth(pts, true);
}
function smooth(pts, closed) {
  const n = pts.length;
  const p = (i) => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + (closed ? "Z" : "");
}
// Blob (Bluetenblatt, Blatt) – wackelige Ellipse um einen Punkt, gedreht
function blob(cx, cy, rx, ry, rot, seed, amp = 0.08) {
  const rand = rng(seed);
  const pts = [];
  const n = 10;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + (rand() - 0.5) * amp * 2;
    const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
    const cr = Math.cos(rot), sr = Math.sin(rot);
    pts.push([cx + x * cr - y * sr, cy + x * sr + y * cr]);
  }
  return smooth(pts, true);
}
// Blattform (spitz an beiden Enden)
function leaf(cx, cy, len, w, rot) {
  const cr = Math.cos(rot), sr = Math.sin(rot);
  const T = (x, y) => [cx + x * cr - y * sr, cy + x * sr + y * cr];
  const a = T(-len / 2, 0), b = T(len / 2, 0), c1 = T(-len / 6, -w), c2 = T(len / 6, -w), c3 = T(len / 6, w), c4 = T(-len / 6, w);
  return `M${f(a[0])} ${f(a[1])} C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(b[0])} ${f(b[1])} C${f(c3[0])} ${f(c3[1])} ${f(c4[0])} ${f(c4[1])} ${f(a[0])} ${f(a[1])}Z`;
}
// Ringflaeche (aussen minus innen) als evenodd-Pfad
const ring = (cx, cy, ra, ri, seed, amp) => wobble(cx, cy, ra, seed, amp) + " " + wobble(cx, cy, ri, seed + 7, amp * 0.8);

// ---------------------------------------------------------------- Muster-Definitionen
function patternDefs(id) {
  return `
  <pattern id="${id}-punkte" width="15" height="15" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
    <rect width="15" height="15" fill="${C.porzellan}"/>
    <path d="${blob(4, 4, 2.6, 2.4, 0.4, 3, 0.12)}" fill="${C.kobalt}"/>
    <path d="${blob(11.5, 11, 2.2, 2.5, 1.1, 9, 0.14)}" fill="${C.kobalt}"/>
  </pattern>
  <pattern id="${id}-punkte-senf" width="13" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
    <rect width="13" height="13" fill="${C.porzellan}"/>
    <path d="${blob(3.5, 3.5, 2.1, 2, 0.4, 21, 0.14)}" fill="${C.senfTief}"/>
    <path d="${blob(10, 9.6, 1.8, 2.1, 1.1, 22, 0.14)}" fill="${C.himbeer}"/>
  </pattern>
  <pattern id="${id}-karo" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(4)">
    <rect width="18" height="18" fill="${C.porzellan}"/>
    <rect x="0" y="0" width="9" height="18" fill="${C.himbeer}" opacity=".42"/>
    <rect x="0" y="0" width="18" height="9" fill="${C.himbeer}" opacity=".42"/>
    <path d="M0 0.5 H18 M0.5 0 V18" stroke="${C.himbeerTief}" stroke-width=".6" opacity=".35"/>
  </pattern>
  <pattern id="${id}-karo-kobalt" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-6)">
    <rect width="14" height="14" fill="${C.porzellan}"/>
    <rect x="0" y="0" width="7" height="14" fill="${C.kobalt}" opacity=".45"/>
    <rect x="0" y="0" width="14" height="7" fill="${C.kobalt}" opacity=".45"/>
  </pattern>
  <pattern id="${id}-streifen" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
    <rect width="12" height="12" fill="${C.porzellan}"/>
    <rect x="0" y="0" width="5" height="12" fill="${C.senf}"/>
    <rect x="7.4" y="0" width="1.4" height="12" fill="${C.tanne}" opacity=".8"/>
  </pattern>
  <pattern id="${id}-streifen-tanne" width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
    <rect width="11" height="11" fill="${C.porzellan}"/>
    <rect x="0" y="0" width="4" height="11" fill="${C.tanne}" opacity=".85"/>
  </pattern>`;
}

// ---------------------------------------------------------------- Teller
// Bausteine: Grundscheibe, Randband, Spiegel, Glasurlinie, Mittelmotiv
function plateBase(cx, cy, r, seed, kante) {
  return `
    <path d="${wobble(cx, cy, r, seed, 0.02)}" fill="${C.porzellan}" stroke="${LINIE}" stroke-width="${f(r * 0.016 + 0.6)}" stroke-linejoin="round"/>
    ${kante ? `<path d="${wobble(cx, cy, r * 0.975, seed + 2, 0.022)}" fill="none" stroke="${kante}" stroke-width="${f(r * 0.022)}" opacity=".9"/>` : ""}
    <path d="${wobble(cx + r * 0.006, cy - r * 0.004, r * 1.004, seed + 1, 0.026)}" fill="none" stroke="${LINIE}" stroke-width="${f(r * 0.006 + 0.3)}" stroke-opacity=".4"/>`;
}
function plateWell(cx, cy, r, seed) {
  // Spiegel mit leichter Mulde und handgezogener Glasurlinie
  return `
    <path d="${wobble(cx, cy, r * 0.66, seed + 31, 0.016)}" fill="${C.porzellan}" stroke="${LINIE}" stroke-width="${f(r * 0.009 + 0.4)}" stroke-opacity=".55"/>
    <path d="${wobble(cx, cy, r * 0.6, seed + 37, 0.02)}" fill="none" stroke="${C.himbeerTief}" stroke-opacity=".06" stroke-width="${f(r * 0.06)}"/>
    <path d="${arc(cx, cy, r * 0.52, 200, 290)}" fill="none" stroke="#fff" stroke-width="${f(r * 0.04)}" stroke-linecap="round" opacity=".9"/>`;
}
function arc(cx, cy, r, a0, a1) {
  const p = (a) => [cx + Math.cos((a * Math.PI) / 180) * r, cy + Math.sin((a * Math.PI) / 180) * r];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${f(x0)} ${f(y0)} A${f(r)} ${f(r)} 0 0 1 ${f(x1)} ${f(y1)}`;
}
function rimBand(cx, cy, r, seed, fill) {
  return `
    <path d="${ring(cx, cy, r * 0.94, r * 0.7, seed + 11, 0.016)}" fill-rule="evenodd" fill="${fill}"/>
    <path d="${wobble(cx, cy, r * 0.94, seed + 11, 0.016)}" fill="none" stroke="${LINIE}" stroke-opacity=".35" stroke-width="${f(r * 0.008 + 0.3)}"/>`;
}
// Bluete aus fuenf Blobs
function flower(cx, cy, s, rot, seed, petal = C.himbeer, mitte = C.senf) {
  let d = "";
  for (let i = 0; i < 5; i++) {
    const a = rot + (i / 5) * Math.PI * 2;
    d += `<path d="${blob(cx + Math.cos(a) * s * 0.55, cy + Math.sin(a) * s * 0.55, s * 0.5, s * 0.34, a, seed + i, 0.12)}" fill="${petal}"/>`;
  }
  d += `<path d="${blob(cx, cy, s * 0.3, s * 0.28, rot, seed + 9, 0.1)}" fill="${mitte}"/>`;
  return d;
}
function plateFlowers(cx, cy, r, seed) {
  const rand = rng(seed);
  let m = "";
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + 0.2;
    const rr = r * 0.82;
    const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
    // Blaetter zwischen den Blueten
    const a2 = a + Math.PI / n;
    const lx = cx + Math.cos(a2) * rr, ly = cy + Math.sin(a2) * rr;
    m += `<path d="${leaf(lx, ly, r * 0.15, r * 0.045, a2 + Math.PI / 2 + (rand() - 0.5) * 0.5)}" fill="${C.tanne}"/>`;
    m += flower(x, y, r * 0.1 * (0.9 + rand() * 0.25), rand() * 6, seed + i * 13);
  }
  return m;
}
function centerFlower(cx, cy, r, seed) {
  return flower(cx, cy, r * 0.13, 0.3, seed + 99, C.himbeer, C.senf) +
    `<path d="${leaf(cx + r * 0.16, cy + r * 0.12, r * 0.16, r * 0.05, 0.7)}" fill="${C.tanne}"/>` +
    `<path d="${leaf(cx - r * 0.15, cy + r * 0.14, r * 0.14, r * 0.045, 2.3)}" fill="${C.tanne}"/>`;
}
function plateLeaves(cx, cy, r, seed) {
  // Zweig, der rundum laeuft
  const rand = rng(seed);
  let m = `<path d="${wobble(cx, cy, r * 0.82, seed + 3, 0.02)}" fill="none" stroke="${C.tanne}" stroke-width="${f(r * 0.018)}" stroke-linecap="round"/>`;
  const n = 22;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const side = i % 2 ? 1 : -1;
    const rr = r * 0.82 + side * r * 0.06;
    const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
    m += `<path d="${leaf(x, y, r * 0.13 * (0.85 + rand() * 0.3), r * 0.04, a + Math.PI / 2 + side * 0.6)}" fill="${i % 5 === 0 ? C.senfTief : C.tanne}"/>`;
  }
  return m;
}
function centerSprout(cx, cy, r) {
  return `<path d="M${f(cx)} ${f(cy + r * 0.2)} C${f(cx - r * 0.02)} ${f(cy + r * 0.05)} ${f(cx + r * 0.03)} ${f(cy - r * 0.05)} ${f(cx)} ${f(cy - r * 0.16)}" fill="none" stroke="${C.tanne}" stroke-width="${f(r * 0.022)}" stroke-linecap="round"/>
    <path d="${leaf(cx + r * 0.08, cy - r * 0.04, r * 0.17, r * 0.055, -0.6)}" fill="${C.tanne}"/>
    <path d="${leaf(cx - r * 0.08, cy + r * 0.06, r * 0.14, r * 0.05, 3.6)}" fill="${C.tanneHell}"/>`;
}
function radialStripes(cx, cy, r, seed) {
  const rand = rng(seed);
  let m = "";
  const n = 36;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 0.5 + (rand() - 0.5) * 0.15) / n) * Math.PI * 2;
    const ri = r * 0.71, ra = r * 0.93;
    const P = (a, rr) => `${f(cx + Math.cos(a) * rr)} ${f(cy + Math.sin(a) * rr)}`;
    const col = i % 3 === 0 ? C.himbeer : i % 3 === 1 ? C.senf : C.kobalt;
    m += `<path d="M${P(a0, ri)} L${P(a0 + 0.004, ra)} L${P(a1, ra)} L${P(a1 - 0.004, ri)}Z" fill="${col}" stroke="${col}" stroke-width=".6" stroke-linejoin="round"/>`;
  }
  return m;
}
function centerSpiral(cx, cy, r) {
  const pts = [];
  for (let t = 0; t < 3.3 * Math.PI * 2; t += 0.35) {
    const rr = r * 0.012 * t * 1.1;
    pts.push([cx + Math.cos(t) * rr, cy + Math.sin(t) * rr]);
  }
  return `<path d="${smooth(pts, false)}" fill="none" stroke="${C.himbeer}" stroke-width="${f(r * 0.022)}" stroke-linecap="round"/>`;
}
function twoRings(cx, cy, r, seed) {
  return `<path d="${wobble(cx - r * 0.07, cy, r * 0.13, seed + 5, 0.04)}" fill="none" stroke="${C.himbeer}" stroke-width="${f(r * 0.022)}"/>
    <path d="${wobble(cx + r * 0.07, cy + r * 0.01, r * 0.13, seed + 6, 0.04)}" fill="none" stroke="${C.kobalt}" stroke-width="${f(r * 0.022)}"/>`;
}
function dotCluster(cx, cy, r, seed) {
  const cols = [C.kobalt, C.senfTief, C.himbeer, C.tanne, C.kobalt];
  let m = "";
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.6;
    m += `<path d="${blob(cx + Math.cos(a) * r * 0.1, cy + Math.sin(a) * r * 0.1, r * 0.035, r * 0.033, a, seed + i, 0.14)}" fill="${cols[i]}"/>`;
  }
  return m + `<path d="${blob(cx, cy, r * 0.04, r * 0.04, 0, seed + 8, 0.1)}" fill="${C.senf}"/>`;
}
// Flickenteller: Rand in Segmente mit verschiedenen Mustern, mit Steppnaht
function patchRim(cx, cy, r, seed, id) {
  const fills = [`url(#${id}-punkte)`, `url(#${id}-streifen)`, `url(#${id}-karo)`, `url(#${id}-streifen-tanne)`, `url(#${id}-punkte-senf)`, `url(#${id}-karo-kobalt)`];
  const n = 6;
  let clip = "", m = "";
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2 + 0.3, a1 = ((i + 1) / n) * Math.PI * 2 + 0.3;
    const R = r * 1.2;
    clip += `<clipPath id="${id}-seg${i}"><path d="M${f(cx)} ${f(cy)} L${f(cx + Math.cos(a0) * R)} ${f(cy + Math.sin(a0) * R)} A${f(R)} ${f(R)} 0 0 1 ${f(cx + Math.cos(a1) * R)} ${f(cy + Math.sin(a1) * R)}Z"/></clipPath>`;
    m += `<path clip-path="url(#${id}-seg${i})" d="${ring(cx, cy, r * 0.94, r * 0.7, seed + 11, 0.016)}" fill-rule="evenodd" fill="${fills[i]}"/>`;
    // Naht
    const P = (rr) => `${f(cx + Math.cos(a0) * rr)} ${f(cy + Math.sin(a0) * rr)}`;
    m += `<path d="M${P(r * 0.7)} L${P(r * 0.94)}" stroke="${C.aubergine}" stroke-width="${f(r * 0.012)}" stroke-dasharray="${f(r * 0.03)} ${f(r * 0.022)}" stroke-linecap="round" opacity=".7"/>`;
  }
  return { clip, m };
}

function plate(kind, cx, cy, r, seed, id) {
  let rim = "", center = "", extraDefs = "";
  const KANTE = { bluete: C.himbeer, punkte: C.kobalt, karo: C.himbeer, "karo-kobalt": C.kobalt, streifen: C.tanne, flicken: C.senfTief, spirale: C.kobalt, zweig: C.tanne };
  switch (kind) {
    case "bluete":
      rim = `<path d="${ring(cx, cy, r * 0.94, r * 0.7, seed + 11, 0.016)}" fill-rule="evenodd" fill="${C.rose}" opacity=".55"/>` + plateFlowers(cx, cy, r, seed);
      center = centerFlower(cx, cy, r, seed);
      break;
    case "punkte":
      rim = rimBand(cx, cy, r, seed, `url(#${id}-punkte)`);
      center = dotCluster(cx, cy, r, seed);
      break;
    case "karo":
      rim = rimBand(cx, cy, r, seed, `url(#${id}-karo)`);
      center = twoRings(cx, cy, r, seed);
      break;
    case "karo-kobalt":
      rim = rimBand(cx, cy, r, seed, `url(#${id}-karo-kobalt)`);
      center = twoRings(cx, cy, r, seed);
      break;
    case "streifen":
      rim = rimBand(cx, cy, r, seed, `url(#${id}-streifen)`);
      break;
    case "flicken": {
      const p = patchRim(cx, cy, r, seed, id);
      extraDefs = p.clip;
      rim = p.m + `<path d="${wobble(cx, cy, r * 0.94, seed + 11, 0.016)}" fill="none" stroke="${LINIE}" stroke-opacity=".35" stroke-width="${f(r * 0.008 + 0.3)}"/>`;
      center = `<path d="${wobble(cx, cy, r * 0.15, seed + 40, 0.05)}" fill="none" stroke="${C.aubergine}" stroke-width="${f(r * 0.012)}" stroke-dasharray="${f(r * 0.03)} ${f(r * 0.022)}" opacity=".6"/>`;
      break;
    }
    case "spirale":
      rim = radialStripes(cx, cy, r, seed);
      center = centerSpiral(cx, cy, r);
      break;
    case "zweig":
      rim = plateLeaves(cx, cy, r, seed);
      center = centerSprout(cx, cy, r);
      break;
  }
  return { defs: extraDefs, body: `<g>${plateBase(cx, cy, r, seed, KANTE[kind])}${rim}${plateWell(cx, cy, r, seed)}${center}</g>` };
}

// ---------------------------------------------------------------- Tasse von oben mit Untertasse
function cup(cx, cy, r, seed, opt) {
  const { aussen, fuell, crema, untertasse, henkelWinkel = -0.6, muster } = opt;
  const ha = henkelWinkel;
  const hx = cx + Math.cos(ha) * r * 1.02, hy = cy + Math.sin(ha) * r * 1.02;
  const henkel = blob(hx + Math.cos(ha) * r * 0.22, hy + Math.sin(ha) * r * 0.22, r * 0.36, r * 0.16, ha, seed + 50, 0.06);
  const loch = blob(hx + Math.cos(ha) * r * 0.24, hy + Math.sin(ha) * r * 0.24, r * 0.18, r * 0.06, ha, seed + 51, 0.06);
  const sr = r * 1.62;
  return `<g>
    <path d="${wobble(cx + r * 0.08, cy + r * 0.04, sr, seed, 0.016)}" fill="${C.porzellan}" stroke="${LINIE}" stroke-width="1.6"/>
    <path d="${ring(cx + r * 0.08, cy + r * 0.04, sr * 0.93, sr * 0.72, seed + 3, 0.016)}" fill-rule="evenodd" fill="${untertasse}"/>
    <path d="${wobble(cx + r * 0.08, cy + r * 0.04, sr * 0.72, seed + 4, 0.02)}" fill="none" stroke="${LINIE}" stroke-opacity=".3" stroke-width="1"/>
    <path d="${henkel}" fill="${aussen}" stroke="${LINIE}" stroke-width="1.5"/>
    <path d="${loch}" fill="${C.aubergine}" opacity=".25"/>
    <path d="${wobble(cx, cy, r, seed + 5, 0.015)}" fill="${aussen}" stroke="${LINIE}" stroke-width="1.7"/>
    ${muster || ""}
    <path d="${wobble(cx, cy, r * 0.84, seed + 6, 0.015)}" fill="${C.porzellan}" stroke="${LINIE}" stroke-opacity=".4" stroke-width="1"/>
    <path d="${wobble(cx, cy, r * 0.74, seed + 7, 0.02)}" fill="${fuell}"/>
    ${crema ? `<path d="${arc(cx, cy, r * 0.58, 200, 330)}" fill="none" stroke="${crema}" stroke-width="${f(r * 0.1)}" stroke-linecap="round" opacity=".85"/>
    <path d="${blob(cx + r * 0.12, cy + r * 0.1, r * 0.2, r * 0.13, 0.5, seed + 9, 0.2)}" fill="${crema}" opacity=".7"/>` : ""}
    <path d="${arc(cx, cy, r * 0.66, 210, 250)}" fill="none" stroke="#fff" stroke-width="${f(r * 0.06)}" stroke-linecap="round" opacity=".55"/>
  </g>`;
}

// ---------------------------------------------------------------- Besteck, Serviette, Tischkarte
function fork(x, y, len, rot) {
  const w = len * 0.075;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot})">
    <path d="M${f(-w * 0.32)} ${f(len * 0.32)} C${f(-w * 0.4)} ${f(len * 0.62)} ${f(-w * 0.55)} ${f(len * 0.95)} 0 ${f(len)} C${f(w * 0.55)} ${f(len * 0.95)} ${f(w * 0.4)} ${f(len * 0.62)} ${f(w * 0.32)} ${f(len * 0.32)}Z" fill="#E7DCE0" stroke="${LINIE}" stroke-width="1.3"/>
    <path d="M${f(-w)} 0 L${f(-w)} ${f(len * 0.2)} C${f(-w)} ${f(len * 0.3)} ${f(w)} ${f(len * 0.3)} ${f(w)} ${f(len * 0.2)} L${f(w)} 0" fill="#E7DCE0" stroke="${LINIE}" stroke-width="1.3" stroke-linejoin="round"/>
    <path d="M${f(-w * 0.33)} 0 V${f(len * 0.17)} M${f(w * 0.33)} 0 V${f(len * 0.17)}" stroke="${LINIE}" stroke-width="1.1"/>
  </g>`;
}
function knife(x, y, len, rot) {
  const w = len * 0.06;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot})">
    <path d="M${f(-w)} ${f(len * 0.42)} L${f(-w)} ${f(len * 0.05)} C${f(-w)} ${f(-len * 0.02)} ${f(w * 0.9)} ${f(-len * 0.02)} ${f(w)} ${f(len * 0.12)} L${f(w * 0.8)} ${f(len * 0.42)}Z" fill="#F1EAED" stroke="${LINIE}" stroke-width="1.3" stroke-linejoin="round"/>
    <path d="M${f(-w * 0.8)} ${f(len * 0.42)} C${f(-w * 1.1)} ${f(len * 0.7)} ${f(-w * 1.05)} ${f(len)} 0 ${f(len)} C${f(w * 1.05)} ${f(len)} ${f(w * 1.1)} ${f(len * 0.7)} ${f(w * 0.8)} ${f(len * 0.42)}Z" fill="${C.aubergine}" stroke="${LINIE}" stroke-width="1.3"/>
  </g>`;
}
function napkin(x, y, w, h, rot, col, kante) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot})">
    <path d="M${f(-w / 2 + 2)} ${f(-h / 2)} L${f(w / 2)} ${f(-h / 2 + 3)} L${f(w / 2 - 2)} ${f(h / 2)} L${f(-w / 2)} ${f(h / 2 - 2)}Z" fill="${col}" stroke="${LINIE}" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M${f(-w / 2 + 8)} ${f(-h / 2 + 7)} L${f(w / 2 - 8)} ${f(-h / 2 + 9)} L${f(w / 2 - 9)} ${f(h / 2 - 7)} L${f(-w / 2 + 7)} ${f(h / 2 - 9)}Z" fill="none" stroke="${kante}" stroke-width="1.6" stroke-dasharray="5 4"/>
    <path d="M${f(-w / 2 + 2)} ${f(-h / 2)} L${f(w / 2 - 2)} ${f(h / 2)}" stroke="${LINIE}" stroke-opacity=".25" stroke-width="1.2"/>
    <path d="M${f(-w / 2 + 2)} ${f(-h / 2)} L${f(w / 2 - 2)} ${f(h / 2)} L${f(-w / 2)} ${f(h / 2 - 2)}Z" fill="#fff" opacity=".18"/>
  </g>`;
}
function tentCard(x, y, w, h, rot, text) {
  // Tischkarte von oben: zwei Flaechen, Knick in der Mitte, vordere Flaeche heller
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot})" class="karte">
    <path d="M${f(-w / 2)} ${f(-h / 2)} L${f(w / 2)} ${f(-h / 2 + 1.5)} L${f(w / 2)} 0 L${f(-w / 2)} 0Z" fill="#EAD9DC" stroke="${LINIE}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M${f(-w / 2)} 0 L${f(w / 2)} 0 L${f(w / 2 - 1)} ${f(h / 2)} L${f(-w / 2 + 1)} ${f(h / 2 - 1)}Z" fill="#FFFDFC" stroke="${LINIE}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M${f(-w / 2)} 0 L${f(w / 2)} 0" stroke="${C.himbeerTief}" stroke-width="1.4" opacity=".55"/>
    <path d="M${f(-w / 2 + 10)} ${f(h / 2 - 10)} L${f(w / 2 - 10)} ${f(h / 2 - 11)}" stroke="${C.himbeer}" stroke-width="1.1" stroke-dasharray="3 3" opacity=".7"/>
    <text x="0" y="${f(h * 0.31)}" text-anchor="middle" font-family="Caprasimo, Georgia, serif" font-size="${f(h * 0.27)}" fill="${C.himbeerTief}">${text}</text>
  </g>`;
}
function berries(cx, cy, r, seed) {
  const rand = rng(seed);
  let m = `<path d="${wobble(cx, cy, r, seed, 0.02)}" fill="${C.porzellan}" stroke="${LINIE}" stroke-width="1.6"/>
    <path d="${ring(cx, cy, r * 0.97, r * 0.82, seed + 1, 0.02)}" fill-rule="evenodd" fill="${C.kobalt}"/>
    <path d="${wobble(cx, cy, r * 0.82, seed + 2, 0.02)}" fill="#F7EEF0"/>`;
  const spots = [[-0.3, -0.2], [0.15, -0.35], [0.38, 0.05], [0.05, 0.12], [-0.38, 0.22], [0.18, 0.42], [-0.12, 0.45], [-0.05, -0.5], [0.45, -0.32]];
  spots.forEach(([dx, dy], i) => {
    const x = cx + dx * r, y = cy + dy * r, br = r * 0.2 * (0.9 + rand() * 0.2);
    m += `<path d="${blob(x, y, br, br * 0.92, rand() * 3, seed + 20 + i, 0.08)}" fill="${C.himbeer}" stroke="${C.himbeerTief}" stroke-width="1"/>`;
    // Kuegelchen der Himbeere
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * 6.28 + rand();
      m += `<circle cx="${f(x + Math.cos(a) * br * 0.45)}" cy="${f(y + Math.sin(a) * br * 0.45)}" r="${f(br * 0.18)}" fill="${C.himbeerTief}" opacity=".45"/>`;
    }
    m += `<circle cx="${f(x - br * 0.3)}" cy="${f(y - br * 0.35)}" r="${f(br * 0.16)}" fill="#fff" opacity=".55"/>`;
  });
  m += `<path d="${leaf(cx + r * 0.35, cy - r * 0.62, r * 0.32, r * 0.1, -0.5)}" fill="${C.tanne}"/>`;
  return m;
}
// Kaffeefleck (Ring) – das kleine Leben auf dem Tuch
function stain(cx, cy, r, seed) {
  return `<path d="${wobble(cx, cy, r, seed, 0.03)}" fill="none" stroke="${C.kaffee}" stroke-opacity=".22" stroke-width="${f(r * 0.07)}"/>
    <path d="${arc(cx, cy, r * 0.94, 20, 140)}" fill="none" stroke="${C.kaffee}" stroke-opacity=".14" stroke-width="${f(r * 0.04)}"/>`;
}

// ---------------------------------------------------------------- Schatten-Filter
const SHADOW = (id, dx = 5, dy = 9, sd = 7, op = 0.38, col = "#3B0716") => `
  <filter id="${id}" x="-20%" y="-20%" width="150%" height="150%" color-interpolation-filters="sRGB">
    <feDropShadow dx="${dx}" dy="${dy}" stdDeviation="${sd}" flood-color="${col}" flood-opacity="${op}"/>
  </filter>`;
const GRAIN = (id) => `
  <filter id="${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="n"/>
    <feColorMatrix in="n" type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="table" tableValues="0 .07"/></feComponentTransfer>
    <feComposite in2="SourceGraphic" operator="in"/>
  </filter>`;

// ---------------------------------------------------------------- 1. Einzelteller je Anliegen
const ANLIEGEN = [
  ["familienstreit", "bluete", 101],
  ["kind-teenager", "punkte", 202],
  ["partnerschaft", "karo", 303],
  ["trennung-patchwork", "flicken", 404],
  ["ueberforderung", "spirale", 505],
  ["lebensuebergaenge", "zweig", 606],
];
for (const [slug, kind, seed] of ANLIEGEN) {
  const id = "t" + seed;
  const p = plate(kind, 120, 120, 112, seed, id);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240" role="img" aria-hidden="true">
  <defs>${patternDefs(id)}${p.defs}</defs>
  ${p.body}
</svg>
`;
  writeFileSync(join(OUT, `teller-${slug}.svg`), svg);
}

// ---------------------------------------------------------------- 2. Tischtuch-Gewebe (Kachel)
{
  const rand = rng(77);
  let lines = "";
  for (let i = 0; i < 40; i++) {
    const y = i * 4 + 1 + (rand() - 0.5);
    const o = (0.05 + rand() * 0.07).toFixed(3);
    lines += `<rect x="0" y="${f(y)}" width="160" height="${f(0.8 + rand() * 0.9)}" fill="#fff" opacity="${o}"/>`;
  }
  for (let i = 0; i < 40; i++) {
    const x = i * 4 + 2 + (rand() - 0.5);
    const o = (0.04 + rand() * 0.06).toFixed(3);
    lines += `<rect x="${f(x)}" y="0" width="${f(0.8 + rand() * 0.8)}" height="160" fill="#000" opacity="${o}"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
  <defs>
    <filter id="g" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="11" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .11 0"/>
    </filter>
  </defs>
  ${lines}
  <rect width="160" height="160" filter="url(#g)"/>
</svg>
`;
  writeFileSync(join(OUT, "gewebe.svg"), svg);
}

// ---------------------------------------------------------------- 3. Karo-Borte (Saumband)
{
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <rect width="24" height="24" fill="#FFF6F7"/>
  <rect width="12" height="24" fill="${C.himbeer}" opacity=".5"/>
  <rect width="24" height="12" fill="${C.himbeer}" opacity=".5"/>
</svg>
`;
  writeFileSync(join(OUT, "borte.svg"), svg);
}

// ---------------------------------------------------------------- 4. Hero-Szene: gedeckter Tisch von oben
function heroScene(prefix) {
  const id = prefix;
  const pA = plate("karo-kobalt", 230, 245, 150, 11, id);
  const pB = plate("bluete", 640, 310, 175, 23, id);
  const pC = plate("punkte", 545, 690, 112, 37, id);
  const pD = plate("streifen", 92, 560, 74, 41, id);
  const tasseK = cup(445, 120, 44, 51, {
    aussen: C.kobalt, fuell: C.kaffee, crema: C.crema, untertasse: `url(#${id}-punkte-senf)`, henkelWinkel: -0.4,
  });
  const tasseS = cup(820, 610, 40, 63, {
    aussen: C.senf, fuell: C.tee, crema: null, untertasse: `url(#${id}-streifen-tanne)`, henkelWinkel: 2.5,
  });
  return `
  <defs>${patternDefs(id)}${pA.defs}${pB.defs}${pC.defs}${pD.defs}${SHADOW(id + "-s")}${SHADOW(id + "-s2", 3, 5, 4, 0.32)}</defs>
  <g class="spur" opacity=".9">${stain(345, 470, 34, 5)}</g>
  <g class="gedeck" style="--i:0" filter="url(#${id}-s)">${pA.body}</g>
  <g class="gedeck" style="--i:1" filter="url(#${id}-s)">${pB.body}</g>
  <g class="gedeck" style="--i:2" filter="url(#${id}-s2)">${tasseK}</g>
  <g class="gedeck platz" style="--i:3">
    <g filter="url(#${id}-s2)">${napkin(328, 575, 150, 150, 14, C.rose, C.himbeer)}</g>
    <g filter="url(#${id}-s2)">${fork(212, 505, 165, -3)}${knife(446, 500, 165, 4)}</g>
    <g filter="url(#${id}-s)">${tentCard(330, 468, 178, 96, -5, "Dein Platz")}</g>
  </g>
  <g class="gedeck" style="--i:4" filter="url(#${id}-s)">${pC.body}</g>
  <g class="gedeck" style="--i:5" filter="url(#${id}-s2)">${pD.body}</g>
  <g class="gedeck" style="--i:6" filter="url(#${id}-s2)">${berries(700, 520, 62, 71)}</g>
  <g class="gedeck" style="--i:7" filter="url(#${id}-s2)">${tasseS}</g>`;
}
{
  const inner = heroScene("h");
  writeFileSync(join(OUT, "tisch-hero.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 820" width="900" height="820" role="img" aria-label="Gedeckter Tisch von oben: bemalte Teller, zwei Tassen und ein freier Platz mit Tischkarte">${inner}
</svg>
`);
  // Inline-Fragment fuer index.html (ohne aeusseres svg-Element)
  writeFileSync(process.argv[3] || join(OUT, "_tisch-hero.inline.txt"), inner);
}

// ---------------------------------------------------------------- 5. Mobile (systemisch erklaert)
{
  const L = "#FFFFFF";
  const hang = (x, y1, y2) => `<path d="M${x} ${y1} C${x + 2} ${(y1 + y2) / 2} ${x - 2} ${(y1 + y2) / 2} ${x} ${y2}" stroke="${L}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 260" width="320" height="260" role="img" aria-hidden="true">
  <g class="mobile-arm" style="transform-origin:160px 30px">
    <path d="M160 8 V30" stroke="${L}" stroke-width="2" stroke-linecap="round"/>
    <path d="M40 34 C100 26 220 26 280 34" stroke="${L}" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${hang(40, 34, 120)}${hang(280, 34, 96)}${hang(160, 30, 70)}
    <path d="M110 74 C140 68 180 68 210 74" stroke="${L}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    ${hang(110, 74, 160)}${hang(210, 74, 176)}
    <path d="${wobble(40, 145, 25, 3, 0.04)}" fill="${C.senf}" stroke="${L}" stroke-width="2"/>
    <path d="${wobble(280, 118, 22, 4, 0.04)}" fill="${C.himbeer}" stroke="${L}" stroke-width="2"/>
    <path d="${wobble(110, 182, 22, 5, 0.04)}" fill="${C.rose}" stroke="${L}" stroke-width="2"/>
    <path d="${wobble(210, 196, 18, 6, 0.04)}" fill="${C.tanneHell}" stroke="${L}" stroke-width="2"/>
  </g>
</svg>
`;
  writeFileSync(join(OUT, "mobile.svg"), svg);
}

console.log("SVGs geschrieben nach", OUT);

// ---------------------------------------------------------------- 6. Einzelne Tassen (fuer Anliegen-Seiten)
for (const [name, opt, seed] of [
  ["tasse-kobalt", { aussen: C.kobalt, fuell: C.kaffee, crema: C.crema, untertasse: "url(#ta-punkte-senf)", henkelWinkel: -0.4 }, 51],
  ["tasse-senf", { aussen: C.senf, fuell: C.tee, crema: null, untertasse: "url(#ta-streifen-tanne)", henkelWinkel: 2.5 }, 63],
]) {
  writeFileSync(join(OUT, name + ".svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170" width="170" height="170" aria-hidden="true">
  <defs>${patternDefs("ta")}</defs>
  ${cup(82, 84, 44, seed, opt)}
</svg>
`);
}
