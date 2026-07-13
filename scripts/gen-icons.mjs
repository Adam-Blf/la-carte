// Run: node scripts/gen-icons.mjs
// Generates PWA icons from the SVG source using sharp (if available) or writes
// minimal PNG fallbacks using raw PNG bytes.

import { writeFileSync } from "fs";
import { execSync } from "child_process";

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <!-- Fond nuit encré -->
  <rect width="512" height="512" rx="96" fill="#0a1422"/>
  <!-- Double cadre doré -->
  <rect x="28" y="28" width="456" height="456" rx="68" fill="none" stroke="#d4a437" stroke-width="10"/>
  <rect x="48" y="48" width="416" height="416" rx="52" fill="none" stroke="#d4a437" stroke-width="3" opacity="0.4"/>
  <!-- Filets horizontaux -->
  <line x1="80" y1="148" x2="432" y2="148" stroke="#d4a437" stroke-width="1.5" opacity="0.35"/>
  <line x1="80" y1="364" x2="432" y2="364" stroke="#d4a437" stroke-width="1.5" opacity="0.35"/>
  <!-- Lettrine principale -->
  <text x="256" y="310" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-weight="300" font-size="210" fill="#f6f0e2" text-anchor="middle">A.</text>
  <!-- Ornement bas -->
  <text x="256" y="400" font-family="Georgia, serif" font-size="48" fill="#d4a437" text-anchor="middle" opacity="0.9">✦</text>
  <!-- Petits points ornementaux coins intérieurs -->
  <circle cx="80" cy="80" r="3" fill="#d4a437" opacity="0.5"/>
  <circle cx="432" cy="80" r="3" fill="#d4a437" opacity="0.5"/>
  <circle cx="80" cy="432" r="3" fill="#d4a437" opacity="0.5"/>
  <circle cx="432" cy="432" r="3" fill="#d4a437" opacity="0.5"/>
</svg>`;

const MASKABLE = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0a1422"/>
  <rect x="28" y="28" width="456" height="456" fill="none" stroke="#d4a437" stroke-width="10"/>
  <rect x="48" y="48" width="416" height="416" fill="none" stroke="#d4a437" stroke-width="3" opacity="0.4"/>
  <line x1="80" y1="148" x2="432" y2="148" stroke="#d4a437" stroke-width="1.5" opacity="0.35"/>
  <line x1="80" y1="364" x2="432" y2="364" stroke="#d4a437" stroke-width="1.5" opacity="0.35"/>
  <text x="256" y="310" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-weight="300" font-size="210" fill="#f6f0e2" text-anchor="middle">A.</text>
  <text x="256" y="400" font-family="Georgia, serif" font-size="48" fill="#d4a437" text-anchor="middle" opacity="0.9">✦</text>
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
  // Try rsvg-convert
  try {
    execSync(`rsvg-convert -w 192 -h 192 public/icon-512.svg -o public/icon-192.png`);
    execSync(`rsvg-convert -w 512 -h 512 public/icon-512.svg -o public/icon-512.png`);
    execSync(`rsvg-convert -w 512 -h 512 public/icon-maskable.svg -o public/icon-maskable.png`);
    console.log("Icons generated with rsvg-convert.");
  } catch {
    console.log("No SVG renderer found — copy icon-512.svg manually.");
  }
}
