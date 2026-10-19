// =============================================================================
// Titel:        brotkorb-generator.mjs
// Version:      1.0.0
// Datum:        19.10.2026
// Beschreibung: Erzeugt assets/svg/brotkorb.svg – Draufsicht-Requisit (Brotkorb
//               mit kariertem Tuch und drei Semmeln) im Stil der Teller:
//               handgezeichnet wackelnde Konturen, Strich #3A2730, Porzellan-
//               und Tuchfarben aus dem v3-System. Deterministisch (fester Seed).
// Aufruf:       node _quellen/brotkorb-generator.mjs assets/svg/brotkorb.svg
// -----------------------------------------------------------------------------
// v1.0.0  19.10.2026  Erstfassung (Fix-Runde v3.0.1)
// =============================================================================
import { writeFileSync } from "node:fs";

let seed = 887;
const zufall = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const r1 = (n) => Math.round(n * 10) / 10;

// Wackelnde Ellipse als geschlossener Pfad (glatte Kurve durch Punkte)
function wackel(cx, cy, rx, ry, dreh = 0, staerke = 0.025, n = 22) {
  const pkt = [];
  for (let i = 0; i < n; i++) {
    const w = (i / n) * Math.PI * 2;
    const f = 1 + (zufall() - 0.5) * 2 * staerke;
    const x = Math.cos(w) * rx * f, y = Math.sin(w) * ry * f;
    const c = Math.cos(dreh), s = Math.sin(dreh);
    pkt.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  let d = `M${r1(pkt[0][0])} ${r1(pkt[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pkt[(i - 1 + n) % n], p1 = pkt[i], p2 = pkt[(i + 1) % n], p3 = pkt[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d + "Z";
}

const strich = "#3A2730";
const teile = [];
// Korb: Außenrand und Innenboden, Flechtwerk als Muster
teile.push(`<path d="${wackel(130, 100, 118, 84, -0.06, 0.018)}" fill="#C98A2E" stroke="${strich}" stroke-width="1.7"/>`);
teile.push(`<path d="${wackel(130, 100, 118, 84, -0.06, 0.018)}" fill="url(#bk-flecht)" opacity=".55"/>`);
teile.push(`<path d="${wackel(130, 100, 98, 66, -0.06, 0.02)}" fill="#A86C1C" stroke="${strich}" stroke-opacity=".5" stroke-width="1.2"/>`);
// Kariertes Tuch, schräg eingelegt, Ecken hängen über den Rand
teile.push(`<path d="M44 64 C80 50 128 40 196 38 C214 70 222 110 218 152 C170 170 110 172 52 160 C38 126 36 94 44 64Z" fill="url(#bk-karo)" stroke="${strich}" stroke-width="1.5"/>`);
teile.push(`<path d="M196 38 C206 30 222 24 236 26 C232 40 224 52 214 62" fill="url(#bk-karo)" stroke="${strich}" stroke-width="1.5"/>`);
teile.push(`<path d="M52 160 C44 170 30 180 18 180 C20 166 28 156 40 148" fill="url(#bk-karo)" stroke="${strich}" stroke-width="1.5"/>`);
// Drei Semmeln mit Kerbe und Glanz
const semmeln = [[100, 96, 34, 27, -0.5], [156, 84, 31, 25, 0.35], [146, 132, 30, 23, -0.15]];
for (const [x, y, rx, ry, d] of semmeln) {
  teile.push(`<path d="${wackel(x + 2, y + 4, rx, ry, d, 0.03)}" fill="#2A1E22" opacity=".18"/>`);
  teile.push(`<path d="${wackel(x, y, rx, ry, d, 0.035)}" fill="#E0A04A" stroke="${strich}" stroke-width="1.6"/>`);
  teile.push(`<path d="${wackel(x - 3, y - 3, rx * 0.72, ry * 0.62, d, 0.04)}" fill="#F0BE6A" opacity=".8"/>`);
  const c = Math.cos(d), s = Math.sin(d);
  const k = (t) => [x + t * rx * 0.75 * c, y + t * rx * 0.75 * s];
  const [a, b] = [k(-1), k(1)];
  teile.push(`<path d="M${r1(a[0])} ${r1(a[1])} Q${r1(x - 3 * s)} ${r1(y + 3 * c)} ${r1(b[0])} ${r1(b[1])}" fill="none" stroke="${strich}" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 200" width="260" height="200" aria-hidden="true">
  <defs>
  <pattern id="bk-flecht" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
    <path d="M0 2.5 H10 M0 7.5 H10" stroke="#7A4A12" stroke-width="1.4"/>
    <path d="M2.5 0 V5 M7.5 5 V10" stroke="#7A4A12" stroke-width="1"/>
  </pattern>
  <pattern id="bk-karo" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(8)">
    <rect width="16" height="16" fill="#FFFCFB"/>
    <rect width="8" height="16" fill="#B8254E" opacity=".42"/>
    <rect width="16" height="8" fill="#B8254E" opacity=".42"/>
  </pattern>
  </defs>
  <g>
    ${teile.join("\n    ")}
  </g>
</svg>
`;
writeFileSync(process.argv[2] || "brotkorb.svg", svg);
console.log("geschrieben", process.argv[2]);
