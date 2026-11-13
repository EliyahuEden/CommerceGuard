import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs"
import { resolve, relative, dirname, sep } from "node:path"
import { aut, root, runtime } from "./lib.mjs"

export function applyStorefront() {
  const targetRoot = resolve(aut, "apps/storefront")
  const changes = []
  function write(source, destination) {
    const data = readFileSync(source)
    if (existsSync(destination) && readFileSync(destination).equals(data))
      return
    const path = relative(targetRoot, destination)
    if (path.startsWith("..") || !destination.startsWith(targetRoot + sep))
      throw new Error("Overlay escaped storefront")
    const backup = resolve(runtime, "storefront-original", path)
    if (existsSync(destination) && !existsSync(backup)) {
      mkdirSync(dirname(backup), { recursive: true })
      writeFileSync(backup, readFileSync(destination))
    }
    mkdirSync(dirname(destination), { recursive: true })
    writeFileSync(destination, data)
    changes.push(path)
  }
  function tree(source, destination) {
    if (!existsSync(source)) return
    for (const entry of readdirSync(source, { withFileTypes: true })) {
      if (entry.isDirectory())
        tree(resolve(source, entry.name), resolve(destination, entry.name))
      else write(resolve(source, entry.name), resolve(destination, entry.name))
    }
  }
  tree(resolve(root, "storefront/overrides"), targetRoot)
  tree(resolve(root, "storefront/public"), resolve(targetRoot, "public"))
  const patches = JSON.parse(
    readFileSync(resolve(root, "storefront/patches.json"), "utf8"),
  )
  for (const patch of patches) {
    const target = resolve(targetRoot, patch.file)
    if (!target.startsWith(targetRoot + sep))
      throw new Error("Invalid patch path")
    let text = readFileSync(target, "utf8")
    if (text.includes(patch.replace)) continue
    if (text.split(patch.find).length !== 2)
      throw new Error(`Storefront patch anchor mismatch: ${patch.file}`)
    text = text.replace(patch.find, patch.replace)
    writeFileSync(target, text)
    changes.push(patch.file)
  }
  writeFileSync(
    resolve(runtime, "storefront-overlay.json"),
    JSON.stringify(
      { appliedAt: new Date().toISOString(), filesChanged: changes },
      null,
      2,
    ),
  )
  console.log(
    `FORME storefront overlay applied (${changes.length} changed files).`,
  )
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(root, "scripts/storefront.mjs")
)
  applyStorefront()
