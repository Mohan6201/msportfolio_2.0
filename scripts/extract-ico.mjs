import { readFileSync } from 'fs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dir, '..');

const ico = readFileSync(resolve(root, 'public/icons/Actual_Logo.ico'));

const count = ico.readUInt16LE(4);
const entries = [];
for (let i = 0; i < count; i++) {
  const off = 6 + i * 16;
  entries.push({
    width:       ico[off]     || 256,
    height:      ico[off + 1] || 256,
    bytesInRes:  ico.readUInt32LE(off + 8),
    imageOffset: ico.readUInt32LE(off + 12),
  });
}
entries.sort((a, b) => b.width - a.width);
const { imageOffset, bytesInRes } = entries[0];

const dib = ico.subarray(imageOffset, imageOffset + bytesInRes);

if (dib[0] === 0x89 && dib[1] === 0x50) {
  await sharp(Buffer.from(dib))
    .resize(1024, 1024, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toFile(resolve(root, 'public/images/profile/brand-icon.png'));
  console.log('✓ brand-icon.png (PNG frame)');
  process.exit(0);
}

// 32bpp BMP DIB, bottom-up, biHeight doubled
const biSize  = dib.readUInt32LE(0);
const biWidth = dib.readInt32LE(4);
const h       = Math.abs(dib.readInt32LE(8)) / 2;
const rowSize = biWidth * 4;

const rgba = Buffer.alloc(biWidth * h * 4);
for (let row = 0; row < h; row++) {
  const srcRow = h - 1 - row;
  const srcOff = biSize + srcRow * rowSize;
  const dstOff = row * rowSize;
  for (let x = 0; x < biWidth; x++) {
    const s = srcOff + x * 4;
    const d = dstOff + x * 4;
    rgba[d]     = dib[s + 2]; // R
    rgba[d + 1] = dib[s + 1]; // G
    rgba[d + 2] = dib[s + 0]; // B
    rgba[d + 3] = dib[s + 3]; // A
  }
}

await sharp(rgba, { raw: { width: biWidth, height: h, channels: 4 } })
  .resize(1024, 1024, { kernel: 'lanczos3', fit: 'fill' })
  .png({ compressionLevel: 9 })
  .toFile(resolve(root, 'public/images/profile/brand-icon.png'));

console.log('✓ brand-icon.png (1024×1024 from Actual_Logo.ico)');
