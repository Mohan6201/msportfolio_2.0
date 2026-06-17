import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = resolve(__dir, '..');
const src   = resolve(root, 'Gemini_Generated_Image_fecffgfecffgfecf.png');
const out   = resolve(root, 'public/images/icons');
mkdirSync(out, { recursive: true });

// Image is 1207 × 880
// Row 1 (y≈10–215): 6 hexagon variants across the top
// Row 2 (y≈225–445): M·S·PORTFOLIO plaque (left) + larger 3D metallic (centre/right)
// Row 3 (y≈445–670): Large gold coin (left) + medallion (centre) + integrated signage (right)
// Row 4 (y≈670–880): Text labels + business card (far right)
const crops = [
  // ── Row 1 ─────────────────────────────────────────────
  { name: 'hex-blue-flat',      left:   5, top:  10, width: 200, height: 205 }, // teal/blue flat
  { name: 'hex-silver-1',       left: 460, top:  10, width: 185, height: 205 }, // silver metallic
  { name: 'hex-silver-2',       left: 650, top:  10, width: 185, height: 205 }, // silver variant
  { name: 'hex-bronze-sm',      left: 840, top:  10, width: 185, height: 205 }, // bronze/copper small
  { name: 'hex-clean-modern',   left:1025, top:  10, width: 180, height: 205 }, // clean orange+cyan

  // ── Row 2 ─────────────────────────────────────────────
  { name: 'plaque-slate-text',  left:   5, top: 225, width: 285, height: 215 }, // M·S·PORTFOLIO slate
  { name: 'hex-gold-3d',        left: 295, top: 215, width: 270, height: 225 }, // large gold 3D
  { name: 'hex-bronze-texture', left: 575, top: 215, width: 240, height: 225 }, // textured bronze
  { name: 'hex-integrated',     left: 820, top: 215, width: 245, height: 225 }, // integrated signage

  // ── Row 3 ─────────────────────────────────────────────
  { name: 'coin-gold-large',    left:   5, top: 445, width: 355, height: 270 }, // large gold coin
  { name: 'medallion-seal',     left: 370, top: 445, width: 295, height: 270 }, // leather medallion
  { name: 'hex-silver-large',   left: 675, top: 445, width: 260, height: 270 }, // large silver

  // ── Row 4 / bottom-right ──────────────────────────────
  { name: 'business-card',      left: 855, top: 615, width: 350, height: 260 }, // business card
];

for (const c of crops) {
  const file = resolve(out, `${c.name}.png`);
  try {
    await sharp(src)
      .extract({ left: c.left, top: c.top, width: c.width, height: c.height })
      .png()
      .toFile(file);
    console.log(`✓ ${c.name}.png`);
  } catch (e) {
    console.error(`✗ ${c.name}: ${e.message}`);
  }
}
console.log('\nAll done → public/images/icons/');
