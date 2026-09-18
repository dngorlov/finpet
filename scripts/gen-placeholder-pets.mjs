/**
 * Regenerates the placeholder pet-asset tree matching the designer-drop
 * contract (ROADMAP §5.4): 3 species x 3 colors x 3 poses + 3 accessory
 * overlays, gray transparent PNGs. Replacing files with real art is a
 * drop-in; run with `node scripts/gen-placeholder-pets.mjs`.
 */
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const petsDir = join(repoRoot, "assets", "pets");
const SIZE = 64;

let crcTable;
function crc32(buf) {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      crcTable[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (const byte of buf) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function grayPng(value) {
  const rgba = Buffer.alloc(SIZE * SIZE * 4);
  for (let i = 0; i < SIZE * SIZE; i += 1) {
    rgba[i * 4] = value;
    rgba[i * 4 + 1] = value;
    rgba[i * 4 + 2] = value;
    rgba[i * 4 + 3] = 0xff;
  }
  return encodePng(SIZE, SIZE, rgba);
}

const POSE_TINT = { idle: 0, happy: 10, sad: -10 };

let written = 0;
for (let sp = 1; sp <= 3; sp += 1) {
  for (let c = 1; c <= 3; c += 1) {
    for (const pose of Object.keys(POSE_TINT)) {
      const dir = join(petsDir, `sp${sp}`, `c${c}`);
      mkdirSync(dir, { recursive: true });
      const value = 96 + sp * 24 + c * 16 + POSE_TINT[pose];
      writeFileSync(join(dir, `${pose}.png`), grayPng(value));
      written += 1;
    }
  }
}

const overlaysDir = join(petsDir, "overlays");
mkdirSync(overlaysDir, { recursive: true });
for (let a = 1; a <= 3; a += 1) {
  writeFileSync(join(overlaysDir, `a${a}.png`), grayPng(200 + a * 10));
  written += 1;
}

console.log(`wrote ${written} placeholder PNGs under assets/pets`);
