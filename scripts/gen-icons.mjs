// Run: node scripts/gen-icons.mjs
// Generates PWA icons from the SVG source using sharp (if available) or writes
// minimal PNG fallbacks using raw PNG bytes.

import { writeFileSync } from "fs";
import { execSync } from "child_process";

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#0a1422"/>
  <rect x="32" y="32" width="448" height="448" rx="56" fill="none" stroke="#d4a437" stroke-width="8"/>
  <rect x="56" y="56" width="400" height="400" rx="40" fill="none" stroke="#d4a437" stroke-width="4" opacity="0.55"/>
  <text x="260" y="330" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="220" fill="#f6f0e2" text-anchor="middle">A.</text>
  <text x="256" y="420" font-family="Georgia, serif" font-size="60" fill="#d4a437" text-anchor="middle">✦</text>
</svg>`;

const MASKABLE = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0a1422"/>
  <rect x="32" y="32" width="448" height="448" rx="0" fill="none" stroke="#d4a437" stroke-width="8"/>
  <text x="260" y="330" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="220" fill="#f6f0e2" text-anchor="middle">A.</text>
  <text x="256" y="420" font-family="Georgia, serif" font-size="60" fill="#d4a437" text-anchor="middle">✦</text>
</svg>`;

writeFileSync("public/icon-512.svg", SVG);
writeFileSync("public/icon-maskable.svg", MASKABLE);

// Try sharp
try {
  const sharp = (await import("sharp")).default;
  await sharp(Buffer.from(SVG)).resize(192).png().toFile("public/icon-192.png");
  await sharp(Buffer.from(SVG)).resize(512).png().toFile("public/icon-512.png");
  await sharp(Buffer.from(MASKABLE)).resize(512).png().toFile("public/icon-maskable.png");
  console.log("Icons generated with sharp.");
} catch {
  // Try Inkscape or rsvg-convert
  try {
    execSync(`rsvg-convert -w 192 -h 192 public/icon-512.svg -o public/icon-192.png`);
    execSync(`rsvg-convert -w 512 -h 512 public/icon-512.svg -o public/icon-512.png`);
    execSync(`rsvg-convert -w 512 -h 512 public/icon-maskable.svg -o public/icon-maskable.png`);
    console.log("Icons generated with rsvg-convert.");
  } catch {
    console.log("No SVG renderer found — copy icon-512.svg manually.");
  }
}
