import { readFileSync, writeFileSync } from "node:fs";
const [tpl, hero, mobile, out] = process.argv.slice(2);
let h = readFileSync(tpl, "utf8");
const heroIn = readFileSync(hero, "utf8").trim();
const mob = readFileSync(mobile, "utf8").replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").trim();
h = h.replace("<!--HERO-SVG-->", heroIn).replace("<!--MOBILE-SVG-->", mob);
h = h.replace('viewBox="0 0 320 230" width="320" height="230"', 'viewBox="0 0 320 260" width="320" height="260"');
writeFileSync(out, h);
console.log("geschrieben", out, h.length);
