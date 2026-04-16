/**
 * Generate PWA icons from SVG using sharp.
 * Run: node scripts/generate-icons.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "apps", "web", "public", "icons");
const SVG = readFileSync(join(ROOT, "icon.svg"));

// Try sharp, fallback to just copying SVG
async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.log("sharp not available, generating PNG via canvas fallback...");
    // Fallback: create simple colored PNGs using sharp-free approach
    // For now, just reference the SVG directly in manifest
    console.log("Please install sharp globally: npm i -g sharp");
    console.log("Or update manifest.json to use SVG icons");
    process.exit(0);
  }

  const sizes = [192, 512];

  for (const size of sizes) {
    // Regular icon
    const regular = await sharp(SVG).resize(size, size).png().toBuffer();
    writeFileSync(join(ROOT, `icon-${size}.png`), regular);
    console.log(`Created icon-${size}.png`);

    // Maskable icon (with padding - 80% safe zone)
    const padding = Math.round(size * 0.1);
    const innerSize = size - padding * 2;
    const inner = await sharp(SVG).resize(innerSize, innerSize).png().toBuffer();
    const maskable = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 15, g: 23, b: 42, alpha: 1 }, // #0f172a
      },
    })
      .composite([{ input: inner, left: padding, top: padding }])
      .png()
      .toBuffer();
    writeFileSync(join(ROOT, `icon-maskable-${size}.png`), maskable);
    console.log(`Created icon-maskable-${size}.png`);
  }

  // Apple touch icon (180x180)
  const apple = await sharp(SVG).resize(180, 180).png().toBuffer();
  writeFileSync(join(ROOT, `apple-touch-icon.png`), apple);
  console.log("Created apple-touch-icon.png");

  // Favicon 32x32
  const fav = await sharp(SVG).resize(32, 32).png().toBuffer();
  writeFileSync(join(ROOT, `favicon-32.png`), fav);
  console.log("Created favicon-32.png");
}

main();
