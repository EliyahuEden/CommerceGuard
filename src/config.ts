import { existsSync, readFileSync } from "node:fs"
import { z } from "zod"

if (existsSync(".env")) process.loadEnvFile(".env")
const localUrl = z
  .string()
  .url()
  .refine(
    (value) =>
      ["127.0.0.1", "localhost", "[::1]"].includes(new URL(value).hostname),
    "Only local test targets are permitted",
  )
export const env = z
  .object({
    API_URL: localUrl.default("http://127.0.0.1:9000"),
    BASE_URL: localUrl.default("http://localhost:8000"),
    DATABASE_URL: z
      .string()
      .default(
        "postgres://commerceguard:commerceguard_local@127.0.0.1:54329/commerceguard_test",
      ),
  })
  .parse(process.env)
const seedSchema = z.object({
  regionId: z.string(),
  publishableKey: z.string(),
  productId: z.string(),
  productTitle: z.string().default("Medusa T-Shirt"),
  variantId: z.string(),
  handle: z.string(),
  unitPrice: z.number(),
  promotionCode: z.string(),
  stock: z.number(),
})
export type Seed = z.infer<typeof seedSchema>
export function loadSeed(): Seed {
  if (!existsSync(".runtime/seed.json"))
    throw new Error("Missing .runtime/seed.json. Run npm run aut:seed.")
  const seed = seedSchema.parse(
    JSON.parse(readFileSync(".runtime/seed.json", "utf8")),
  )
  return {
    ...seed,
    publishableKey: process.env.PUBLISHABLE_API_KEY || seed.publishableKey,
  }
}
