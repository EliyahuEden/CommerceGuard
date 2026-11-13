import { createRequire } from "node:module"
import {
  readdirSync,
  statSync,
  realpathSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import { resolve } from "node:path"
import { aut, root } from "./lib.mjs"

// Use the image encoder already installed by the pinned Next.js application.
const require = createRequire(
  realpathSync(resolve(aut, "apps/storefront/node_modules/next/package.json")),
)
const sharp = require("sharp")
const directory = resolve(root, "storefront/public/forme")
for (const file of readdirSync(directory).filter((file) =>
  file.endsWith(".png"),
)) {
  const destination = resolve(directory, file.replace(/\.png$/, ".webp"))
  await sharp(resolve(directory, file))
    .resize({
      width: file.startsWith("campaign") ? 1664 : 1100,
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toFile(destination)
  console.log(`${file}: ${statSync(destination).size} bytes WebP`)
}
// Noncreative format conversion of the same campaign artwork for social previews.
const social = await sharp(resolve(directory, "campaign-hero.png"))
  .resize({ width: 1200, withoutEnlargement: true })
  .jpeg({ quality: 85 })
  .toBuffer()
for (const name of ["opengraph-image", "twitter-image"])
  writeFileSync(
    resolve(root, `storefront/overrides/src/app/${name}.jpg`),
    social,
  )
// Code-native vector identity; embed a PNG in the standard single-image ICO header.
const icon = await sharp(readFileSync(resolve(directory, "favicon.svg")))
  .resize(48, 48)
  .png()
  .toBuffer()
const header = Buffer.alloc(22)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(1, 4)
header[6] = 48
header[7] = 48
header.writeUInt16LE(1, 10)
header.writeUInt16LE(32, 12)
header.writeUInt32LE(icon.length, 14)
header.writeUInt32LE(22, 18)
writeFileSync(
  resolve(root, "storefront/public/favicon.ico"),
  Buffer.concat([header, icon]),
)
