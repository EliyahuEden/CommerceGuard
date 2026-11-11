import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { resolve } from "node:path"
import pg from "pg"
import { assertTestDatabase, databaseUrl, pin, root } from "./lib.mjs"

assertTestDatabase()
const seed = JSON.parse(
  readFileSync(resolve(root, ".runtime/seed.json"), "utf8"),
)
const headers = {
  "x-publishable-api-key": seed.publishableKey,
  "content-type": "application/json",
}
const created = await fetch("http://127.0.0.1:9000/store/carts", {
  method: "POST",
  headers,
  body: JSON.stringify({ region_id: seed.regionId }),
})
if (!created.ok) throw new Error(`Create cart failed: ${created.status}`)
const { cart } = await created.json()
const payload = { variant_id: seed.variantId, quantity: 1.5 }
const response = await fetch(
  `http://127.0.0.1:9000/store/carts/${cart.id}/line-items`,
  { method: "POST", headers, body: JSON.stringify(payload) },
)
const body = await response.json()
const database = new pg.Client({
  connectionString: databaseUrl,
  options: "-c default_transaction_read_only=on",
})
await database.connect()
const { rows } = await database.query(
  "SELECT quantity, unit_price FROM cart_line_item WHERE cart_id=$1 AND deleted_at IS NULL",
  [cart.id],
)
const schema = await database.query(
  "SELECT data_type FROM information_schema.columns WHERE table_name=$1 AND column_name=$2",
  ["cart_line_item", "quantity"],
)
await database.end()
const result = {
  id: "CG-B001",
  measuredAt: new Date().toISOString(),
  commit: pin.commit,
  request: {
    method: "POST",
    path: `/store/carts/${cart.id}/line-items`,
    body: payload,
  },
  response: {
    status: response.status,
    quantity: body.cart?.items?.[0]?.quantity,
    unit_price: body.cart?.items?.[0]?.unit_price,
    total: body.cart?.total,
  },
  database: rows,
  quantityColumnType: schema.rows[0]?.data_type,
  expected:
    "Reject fractional input or preserve it. Never silently change the requested units.",
}
mkdirSync(resolve(root, "docs/evidence"), { recursive: true })
writeFileSync(
  resolve(root, "docs/evidence/quantity-coercion.json"),
  JSON.stringify(result, null, 2),
)
console.log(JSON.stringify(result, null, 2))
if (response.ok && result.response.quantity !== payload.quantity)
  process.exitCode = 1
