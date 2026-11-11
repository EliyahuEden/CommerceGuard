import { existsSync, readFileSync, mkdirSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { root, run, waitFor } from "./lib.mjs"

const seed = JSON.parse(
  readFileSync(resolve(root, ".runtime/seed.json"), "utf8"),
)
await waitFor("http://127.0.0.1:9000/health")
const portable = resolve(root, ".tools/k6/k6-v2.3.0-windows-amd64/k6.exe")
const binary = process.env.K6_BINARY || (existsSync(portable) ? portable : "k6")
mkdirSync(
  resolve(
    root,
    dirname(process.env.PERF_OUTPUT || "test-results/performance.json"),
  ),
  { recursive: true },
)
await run(binary, ["run", "--quiet", resolve(root, "performance/catalog.js")], {
  env: {
    ...process.env,
    API_URL: "http://127.0.0.1:9000",
    PUBLISHABLE_API_KEY: seed.publishableKey,
    REGION_ID: seed.regionId,
    PRODUCT_ID: seed.productId,
  },
})
