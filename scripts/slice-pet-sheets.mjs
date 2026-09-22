/**
 * Cuts Andrei's sprite sheets (design/pets/sp{N}-c{N}-*.png) into the pet
 * asset contract (ROADMAP §5.4): assets/pets/sp{N}/c{N}/{idle,happy,sad}.png.
 *
 * Sheets are a 32×32 px grid (15 columns × 8 rows). Frames are scaled up ×8
 * with nearest-neighbour so PetView shrinks a sharp 256 px image instead of
 * blurring a 32 px one. Re-run after a new sheet drop:
 *   node scripts/slice-pet-sheets.mjs
 *
 * POSES picks one frame per pose. Ask the artist before changing it — the
 * grid rows are animations (idle, jump, walk, hurt, …) and only these three
 * frames are used until PetView animates.
 */
import { readdirSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const sheetsDir = join(repoRoot, "design", "pets");
const petsDir = join(repoRoot, "assets", "pets");

const CELL = 32;
const SCALE = 8;
/** [row, column] in the sheet grid. */
const POSES = {
  idle: [0, 0], // standing frame
  happy: [1, 11], // top of the jump
  sad: [4, 8], // knocked back — replace when a dedicated sad frame exists
};

function cutFrame(sheet, [row, col]) {
  const out = new PNG({ width: CELL * SCALE, height: CELL * SCALE });
  for (let y = 0; y < CELL * SCALE; y += 1) {
    for (let x = 0; x < CELL * SCALE; x += 1) {
      const sx = col * CELL + Math.floor(x / SCALE);
      const sy = row * CELL + Math.floor(y / SCALE);
      const from = (sy * sheet.width + sx) * 4;
      const to = (y * out.width + x) * 4;
      sheet.data.copy(out.data, to, from, from + 4);
    }
  }
  return out;
}

const pattern = /^(sp[1-3])-(c[1-3])(?:-.*)?\.png$/;
let written = 0;
for (const file of readdirSync(sheetsDir).sort()) {
  const match = pattern.exec(file);
  if (!match) continue;
  const [, species, color] = match;
  const sheet = PNG.sync.read(readFileSync(join(sheetsDir, file)));
  if (sheet.width % CELL !== 0 || sheet.height % CELL !== 0) {
    throw new Error(`${file}: ${sheet.width}×${sheet.height} is not a ${CELL}px grid`);
  }
  const target = join(petsDir, species, color);
  mkdirSync(target, { recursive: true });
  for (const [pose, cell] of Object.entries(POSES)) {
    writeFileSync(join(target, `${pose}.png`), PNG.sync.write(cutFrame(sheet, cell)));
    written += 1;
  }
  console.log(`${file} → ${species}/${color}`);
}
console.log(`${written} pose files written`);
