const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient: Brand Coral-Red -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF5C4D" />
      <stop offset="50%" stop-color="#E8483F" />
      <stop offset="100%" stop-color="#C92A22" />
    </linearGradient>

    <!-- Grocery Bag Body Gradient -->
    <linearGradient id="bagGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FFF0E6" />
    </linearGradient>

    <!-- Bag Inner Shadow Gradient -->
    <linearGradient id="bagInner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#E2D0C5" />
      <stop offset="100%" stop-color="#FFFFFF" />
    </linearGradient>

    <!-- Green Apple Gradient -->
    <linearGradient id="appleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4ADE80" />
      <stop offset="60%" stop-color="#22C55E" />
      <stop offset="100%" stop-color="#15803D" />
    </linearGradient>

    <!-- Tomato / Berry Red Gradient -->
    <linearGradient id="tomatoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF7568" />
      <stop offset="70%" stop-color="#EF4444" />
      <stop offset="100%" stop-color="#B91C1C" />
    </linearGradient>

    <!-- Carrot Orange Gradient -->
    <linearGradient id="carrotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDBA74" />
      <stop offset="50%" stop-color="#FB923C" />
      <stop offset="100%" stop-color="#EA580C" />
    </linearGradient>

    <!-- Lemon / Citrus Gradient -->
    <linearGradient id="citrusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="60%" stop-color="#FACC15" />
      <stop offset="100%" stop-color="#CA8A04" />
    </linearGradient>

    <!-- Leaf Green Gradient -->
    <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#86EFAC" />
      <stop offset="100%" stop-color="#16A34A" />
    </linearGradient>

    <!-- Soft Drop Shadows -->
    <filter id="shadowFilter" x="-15%" y="-15%" width="130%" height="135%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#550D0A" flood-opacity="0.38" />
    </filter>

    <filter id="produceShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.18" />
    </filter>
  </defs>

  <!-- 1. Squircle App Badge -->
  <rect width="512" height="512" rx="118" fill="url(#bgGrad)" />

  <!-- Inner Soft Ring Border -->
  <rect x="8" y="8" width="496" height="496" rx="110" fill="none" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="6" />

  <!-- Background Subtle Grocery Glow -->
  <circle cx="256" cy="256" r="170" fill="#FFFFFF" opacity="0.08" />

  <!-- 2. Grocery Elements with Shadow -->
  <g filter="url(#shadowFilter)">

    <!-- BACK PRODUCE: Carrot angled right -->
    <g transform="rotate(24 330 190)" filter="url(#produceShadow)">
      <!-- Carrot Tops (Green leafy sprigs) -->
      <path d="M 330 120 C 315 95 305 70 312 55 C 322 70 330 95 330 120 Z" fill="url(#leafGrad)" />
      <path d="M 330 120 C 335 90 350 72 362 65 C 352 82 342 102 330 120 Z" fill="#22C55E" />
      <path d="M 330 120 C 325 85 328 62 332 50 C 336 68 335 92 330 120 Z" fill="#4ADE80" />
      <!-- Carrot Body -->
      <path d="M 314 120 C 314 112 346 112 346 120 L 334 225 C 332 232 328 232 326 225 Z" fill="url(#carrotGrad)" />
      <!-- Carrot Ridges -->
      <path d="M 318 140 Q 330 144 340 141" stroke="#C2410C" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.45" />
      <path d="M 320 165 Q 330 168 338 166" stroke="#C2410C" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.45" />
      <path d="M 323 190 Q 330 192 335 191" stroke="#C2410C" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.45" />
    </g>

    <!-- BACK PRODUCE: Fresh Citrus / Orange on right -->
    <g filter="url(#produceShadow)">
      <circle cx="330" cy="205" r="44" fill="url(#citrusGrad)" />
      <!-- Citrus Leaf -->
      <path d="M 335 165 C 355 150 375 158 375 168 C 362 176 345 174 335 165 Z" fill="url(#leafGrad)" />
    </g>

    <!-- PRODUCE: Crisp Green Apple on left -->
    <g filter="url(#produceShadow)">
      <!-- Apple Stem -->
      <path d="M 188 152 C 188 132 202 120 208 116" stroke="#5C381E" stroke-width="5" stroke-linecap="round" fill="none" />
      <!-- Fresh Organic Leaf -->
      <path d="M 194 135 C 220 115 235 128 232 142 C 214 148 198 144 194 135 Z" fill="url(#leafGrad)" />
      <!-- Apple Body -->
      <path d="M 188 154 C 160 154 140 178 140 208 C 140 240 165 258 188 258 C 211 258 236 240 236 208 C 236 178 216 154 188 154 Z" fill="url(#appleGrad)" />
      <!-- Apple Shine Highlight -->
      <ellipse cx="168" cy="184" rx="12" ry="18" transform="rotate(-25 168 184)" fill="#FFFFFF" opacity="0.4" />
    </g>

    <!-- PRODUCE: Ripe Tomato / Red Berry Center -->
    <g filter="url(#produceShadow)">
      <!-- Tomato Calyx (Green star crown) -->
      <path d="M 256 160 L 260 170 L 270 168 L 263 176 L 271 184 L 260 181 L 256 191 L 252 181 L 241 184 L 249 176 L 242 168 L 252 170 Z" fill="#15803D" />
      <!-- Tomato Body -->
      <circle cx="256" cy="208" r="46" fill="url(#tomatoGrad)" />
      <!-- Tomato Gloss -->
      <ellipse cx="240" cy="192" rx="10" ry="16" transform="rotate(-30 240 192)" fill="#FFFFFF" opacity="0.45" />
    </g>

    <!-- 3. SHOPPING BAG HANDLE -->
    <path d="M 192 232 V 154 C 192 118 320 118 320 154 V 232" fill="none" stroke="#FFFFFF" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 192 232 V 154 C 192 120 320 120 320 154 V 232" fill="none" stroke="#E2E8F0" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />

    <!-- 4. SHOPPING BAG BODY -->
    <path d="M 130 226 L 148 424 C 150 438 162 448 176 448 L 336 448 C 350 448 362 438 364 424 L 382 226 C 383 214 374 204 362 204 L 150 204 C 138 204 129 214 130 226 Z" fill="url(#bagGrad)" />

    <!-- Bag Rim / Fold Shadow -->
    <path d="M 148 204 L 364 204 C 374 204 382 212 381 222 L 380 230 L 132 230 L 131 222 C 130 212 138 204 148 204 Z" fill="url(#bagInner)" opacity="0.65" />

    <!-- 5. BAG EMBLEM: Fresh Leaf & Heart Grocery Icon -->
    <g transform="translate(256, 332)">
      <!-- Badge Circular Base -->
      <circle cx="0" cy="0" r="48" fill="#FEE2E2" />
      <circle cx="0" cy="0" r="42" fill="#E8483F" />

      <!-- Sprouting Organic Farm Leaf in White -->
      <path d="M -12 16 C -12 16 -16 -4 -4 -16 C 8 -28 26 -24 26 -24 C 26 -24 24 -6 12 6 C 0 18 -12 16 -12 16 Z" fill="#FFFFFF" />
      <!-- Leaf Vein -->
      <path d="M -10 14 C 2 4 14 -6 24 -22" stroke="#E8483F" stroke-width="3" stroke-linecap="round" fill="none" />
      <!-- Secondary Accent Leaf -->
      <path d="M -8 14 C -8 14 -24 10 -22 -4 C -20 -14 -6 -16 -6 -16 C -6 -16 -8 -4 -2 4 C 4 12 -8 14 -8 14 Z" fill="#4ADE80" />
    </g>

    <!-- Modern Shopping Basket / Grocery Lines -->
    <path d="M 166 400 L 346 400" stroke="#E8483F" stroke-width="4" stroke-linecap="round" opacity="0.25" />
    <path d="M 186 414 L 326 414" stroke="#E8483F" stroke-width="3" stroke-linecap="round" opacity="0.2" />

  </g>
</svg>
`.trim();

// Function to construct Windows / Browser multi-resolution .ico from PNG buffers
function createIco(pngBuffers) {
  // pngBuffers: array of { width, height, buffer }
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + count * dirEntrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = ICO
  header.writeUInt16LE(count, 4); // count of images

  const entries = [];
  const imageBuffers = [];

  for (const img of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // image size
    entry.writeUInt32LE(offset, 12); // image offset

    entries.push(entry);
    imageBuffers.push(img.buffer);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...imageBuffers]);
}

async function main() {
  console.log('Generating Grocery-Style Favicon and App Icons...');

  const svgBuffer = Buffer.from(svgIcon, 'utf8');

  // Save SVG
  fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), svgBuffer);
  fs.writeFileSync(path.join(__dirname, '../src/app/icon.svg'), svgBuffer);
  console.log('✔ Saved public/favicon.svg and src/app/icon.svg');

  // Render PNG sizes
  const sizes = [16, 32, 48, 64, 180, 192, 512];
  const rendered = {};

  for (const size of sizes) {
    rendered[size] = await sharp(svgBuffer)
      .resize(size, size)
      .png({ quality: 100, compressionLevel: 9 })
      .toBuffer();
    console.log(`✔ Rendered ${size}x${size} PNG`);
  }

  // Save individual PNGs
  fs.writeFileSync(path.join(__dirname, '../public/favicon-16x16.png'), rendered[16]);
  fs.writeFileSync(path.join(__dirname, '../public/favicon-32x32.png'), rendered[32]);
  fs.writeFileSync(path.join(__dirname, '../public/favicon-48x48.png'), rendered[48]);
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon.png'), rendered[180]);
  fs.writeFileSync(path.join(__dirname, '../src/app/apple-icon.png'), rendered[180]);
  fs.writeFileSync(path.join(__dirname, '../public/icon-192.png'), rendered[192]);
  fs.writeFileSync(path.join(__dirname, '../public/icon-512.png'), rendered[512]);

  // Create multi-layer ICO with 16, 32, and 48
  const icoData = createIco([
    { width: 16, height: 16, buffer: rendered[16] },
    { width: 32, height: 32, buffer: rendered[32] },
    { width: 48, height: 48, buffer: rendered[48] }
  ]);

  fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), icoData);
  fs.writeFileSync(path.join(__dirname, '../src/app/favicon.ico'), icoData);
  console.log('✔ Saved public/favicon.ico and src/app/favicon.ico (Multi-size ICO with 16, 32, 48px)');

  // Create site.webmanifest
  const manifest = {
    name: "FOOD MART - Fresh Groceries",
    short_name: "FoodMart",
    description: "Farm-fresh organic groceries and household essentials delivered with care.",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    theme_color: "#E8483F",
    background_color: "#FFF9F2",
    display: "standalone"
  };
  fs.writeFileSync(path.join(__dirname, '../public/site.webmanifest'), JSON.stringify(manifest, null, 2));
  console.log('✔ Saved public/site.webmanifest');

  console.log('All grocery icons successfully generated!');
}

main().catch(err => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
