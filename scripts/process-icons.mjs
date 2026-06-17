/**
 * 1. Re-crop precise icon regions from the reference sheet
 * 2. Remove near-white background (threshold → transparent)
 * 3. Trim transparent edges + resize to clean square PNGs
 */
import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = resolve(__dir, '..');
const src   = resolve(root, 'Gemini_Generated_Image_fecffgfecffgfecf.png');
const out   = resolve(root, 'public/images/icons');
mkdirSync(out, { recursive: true });

// Refined crop coordinates based on visual inspection of previous exports
// (1207 × 880 source)
const crops = [
  // Bronze circular coin badge — was hex-blue-flat — top row far-left
  { name: 'badge-coin-bronze',    left:  10, top:  15, width: 180, height: 175 },
  // Clean bronze hexagonal engraved — was hex-clean-modern — top-right area
  { name: 'badge-hex-bronze',     left:1030, top:  15, width: 170, height: 165 },
  // Antique dark-bronze hex with filigree — was hex-silver-1
  { name: 'badge-hex-antique',    left: 460, top:  18, width: 170, height: 165 },
  // Silver/chrome hexagonal badge (centre-ish) — was hex-silver-2 / plaque-slate-text inner
  { name: 'badge-hex-silver',     left:  55, top: 248, width: 185, height: 170 },
  // Circular bronze coin 2 (crisp, leftmost of row 3)
  { name: 'badge-coin-bronze2',   left:  12, top: 458, width: 165, height: 160 },
  // Silver M.S-PORTFOLIO seal stamp
  { name: 'badge-seal-silver',    left: 180, top: 458, width: 165, height: 165 },
];

async function removeBg(inputBuf, threshold = 235) {
  const { data, info } = await sharp(inputBuf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const buf = Buffer.from(data);

  for (let i = 0; i < width * height; i++) {
    const r = buf[i * channels + 0];
    const g = buf[i * channels + 1];
    const b = buf[i * channels + 2];
    if (r >= threshold && g >= threshold && b >= threshold) {
      buf[i * channels + 3] = 0;
    }
  }
  return sharp(buf, { raw: { width, height, channels: 4 } }).png();
}

for (const c of crops) {
  try {
    const cropped = await sharp(src)
      .extract({ left: c.left, top: c.top, width: c.width, height: c.height })
      .toBuffer();

    const cleaned = await removeBg(cropped, 238);
    const file = resolve(out, `${c.name}.png`);
    await cleaned
      .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 10 })
      .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(file);

    console.log(`✓ ${c.name}.png`);
  } catch (e) {
    console.error(`✗ ${c.name}: ${e.message}`);
  }
}

// Also tightly crop the business card (keep white bg — used in contact/about)
try {
  await sharp(src)
    .extract({ left: 870, top: 630, width: 325, height: 235 })
    .png()
    .toFile(resolve(out, 'badge-business-card.png'));
  console.log('✓ badge-business-card.png');
} catch (e) {
  console.error('✗ badge-business-card:', e.message);
}

console.log('\nDone → public/images/icons/');
