import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Generate SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#85644e" />
      <stop offset="50%" stop-color="#5a4336" />
      <stop offset="100%" stop-color="#1e2430" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#brandGrad)" />
  <g filter="url(#shadow)">
    <!-- Teddy Bear Icon / Emoji representation in clean vector -->
    <!-- Bear ears -->
    <circle cx="160" cy="165" r="52" fill="#decbb8" stroke="#85644e" stroke-width="8" />
    <circle cx="160" cy="165" r="30" fill="#cbb096" />
    <circle cx="352" cy="165" r="52" fill="#decbb8" stroke="#85644e" stroke-width="8" />
    <circle cx="352" cy="165" r="30" fill="#cbb096" />
    <!-- Bear head -->
    <ellipse cx="256" cy="245" rx="135" ry="120" fill="#decbb8" stroke="#85644e" stroke-width="8" />
    <!-- Bear eyes -->
    <circle cx="205" cy="225" r="14" fill="#3e2723" />
    <circle cx="209" cy="221" r="4.5" fill="#ffffff" />
    <circle cx="307" cy="225" r="14" fill="#3e2723" />
    <circle cx="311" cy="221" r="4.5" fill="#ffffff" />
    <!-- Bear snout -->
    <ellipse cx="256" cy="275" rx="56" ry="42" fill="#f5f1eb" />
    <path d="M 242 260 C 248 252 264 252 270 260 C 273 264 269 274 256 274 C 243 274 239 264 242 260 Z" fill="#5a4336" />
    <path d="M 256 274 L 256 288 M 245 284 Q 256 295 267 284" stroke="#5a4336" stroke-width="4.5" stroke-linecap="round" fill="none" />
  </g>
  <!-- KIDS-BIZ Badge -->
  <rect x="86" y="390" width="340" height="68" rx="20" fill="#ffffff" fill-opacity="0.95" filter="url(#shadow)" />
  <text x="256" y="436" font-family="'Pretendard', sans-serif, system-ui" font-size="34" font-weight="900" fill="#5a4336" text-anchor="middle" letter-spacing="2">KIDS-BIZ</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');
console.log('Created icon.svg');

// 2. Pure Node.js PNG encoder helper
function createPng(width, height, getPixelRgba) {
  // CRC32 table
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }
  function calcCrc(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crc = calcCrc(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  // Header: 8 bytes
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Scanlines with filter byte 0
  const rowBytes = width * 4;
  const rawData = Buffer.alloc(height * (rowBytes + 1));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // filter 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRgba(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Painter for app icon
function paintIcon(x, y, w, h, isMaskable = false) {
  // Normalize coords to [-1, 1]
  const nx = (x / w) * 2 - 1;
  const ny = (y / h) * 2 - 1;

  // Background gradient: warm brand earth tones (#85644e to #5a4336 to #1e2430)
  const gradT = Math.min(1, Math.max(0, (nx + 1) * 0.3 + (ny + 1) * 0.5));
  let bgR = Math.round(133 * (1 - gradT) + 30 * gradT);
  let bgG = Math.round(100 * (1 - gradT) + 36 * gradT);
  let bgB = Math.round(78 * (1 - gradT) + 48 * gradT);

  // Rounded rectangle mask (unless maskable, where it fills whole area)
  if (!isMaskable) {
    const cornerR = 0.28;
    const absX = Math.abs(nx);
    const absY = Math.abs(ny);
    if (absX > 1 - cornerR && absY > 1 - cornerR) {
      const dx = absX - (1 - cornerR);
      const dy = absY - (1 - cornerR);
      if (dx * dx + dy * dy > cornerR * cornerR) {
        return [0, 0, 0, 0]; // transparent
      }
    }
  }

  // Draw cute teddy bear face in center
  // Scale content slightly down for maskable safe zone
  const scale = isMaskable ? 0.72 : 0.88;
  const cx = nx / scale;
  const cy = (ny + 0.08) / scale; // shifted slightly up to make room for badge

  // Bear Ears: left (-0.38, -0.32), right (0.38, -0.32)
  const earDistL = Math.hypot(cx - (-0.38), cy - (-0.32));
  const earDistR = Math.hypot(cx - 0.38, cy - (-0.32));
  if (earDistL < 0.20 || earDistR < 0.20) {
    if (earDistL < 0.12 || earDistR < 0.12) {
      return [203, 176, 150, 255]; // inner ear
    }
    return [222, 203, 184, 255]; // outer ear
  }

  // Bear Head: ellipse at (0, -0.05), rx=0.52, ry=0.46
  const headDist = Math.hypot(cx / 0.54, (cy - (-0.05)) / 0.47);
  if (headDist <= 1.0) {
    // Eyes: left (-0.20, -0.12), right (0.20, -0.12)
    const eyeDistL = Math.hypot(cx - (-0.20), cy - (-0.12));
    const eyeDistR = Math.hypot(cx - 0.20, cy - (-0.12));
    if (eyeDistL < 0.055 || eyeDistR < 0.055) {
      // Catchlight
      const shineL = Math.hypot(cx - (-0.18), cy - (-0.14));
      const shineR = Math.hypot(cx - 0.22, cy - (-0.14));
      if (shineL < 0.018 || shineR < 0.018) {
        return [255, 255, 255, 255];
      }
      return [62, 39, 35, 255]; // dark brown eye
    }

    // Snout: ellipse at (0, 0.08), rx=0.22, ry=0.16
    const snoutDist = Math.hypot(cx / 0.22, (cy - 0.08) / 0.16);
    if (snoutDist <= 1.0) {
      // Nose: ellipse at (0, 0.03), rx=0.07, ry=0.045
      const noseDist = Math.hypot(cx / 0.07, (cy - 0.03) / 0.045);
      if (noseDist <= 1.0) {
        return [90, 67, 54, 255];
      }
      // Mouth line
      if (Math.abs(cx) < 0.012 && cy >= 0.03 && cy <= 0.13) {
        return [90, 67, 54, 255];
      }
      if (cy > 0.11 && cy < 0.15 && Math.abs(cx) < 0.07) {
        return [90, 67, 54, 255];
      }
      return [245, 241, 235, 255]; // snout cream
    }

    return [222, 203, 184, 255]; // bear face fur
  }

  // Bottom Pill badge: "KIDS" style rounded pill
  const pillY = (ny - 0.58) / 0.16;
  const pillX = nx / 0.68;
  if (Math.abs(pillX) < 1.0 && Math.abs(pillY) < 1.0) {
    const corner = 0.4;
    const px = Math.abs(pillX);
    const py = Math.abs(pillY);
    if (!(px > 1 - corner && py > 1 - corner && Math.hypot(px - (1 - corner), py - (1 - corner)) > corner)) {
      return [255, 255, 255, 245]; // white badge
    }
  }

  return [bgR, bgG, bgB, 255];
}

// Generate icons
const sizes = [
  { name: 'icon-192.png', size: 192, maskable: false },
  { name: 'icon-192-maskable.png', size: 192, maskable: true },
  { name: 'icon-512.png', size: 512, maskable: false },
  { name: 'icon-512-maskable.png', size: 512, maskable: true },
  { name: 'apple-touch-icon.png', size: 180, maskable: true },
  { name: 'favicon.png', size: 64, maskable: false },
];

for (const s of sizes) {
  const png = createPng(s.size, s.size, (x, y, w, h) => paintIcon(x, y, w, h, s.maskable));
  fs.writeFileSync(path.join(publicDir, s.name), png);
  console.log(`Generated ${s.name} (${s.size}x${s.size})`);
}
