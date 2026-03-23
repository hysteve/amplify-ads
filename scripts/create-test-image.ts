import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const dir = "assets/products/classic-sneaker";
await mkdir(dir, { recursive: true });

// Create a simple 512x512 placeholder product image
await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: { r: 60, g: 120, b: 220, alpha: 1 },
  },
})
  .composite([
    {
      input: Buffer.from(
        `<svg width="512" height="512">
          <rect x="80" y="200" width="352" height="160" rx="40" fill="#ffffff"/>
          <text x="256" y="295" text-anchor="middle" font-size="36" font-family="sans-serif" fill="#3c78dc">PRODUCT</text>
        </svg>`
      ),
    },
  ])
  .png()
  .toFile(`${dir}/source.png`);

console.log(`Created ${dir}/source.png`);
