import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createPromotionsWorkflow } from "@medusajs/medusa/core-flows"
import { writeFileSync } from "node:fs"

// Runs inside the pinned real Medusa container. Never imports CommerceGuard tests.
export default async function seed({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code"],
  })
  const { data: keys } = await query.graph({
    entity: "api_key",
    fields: ["id", "token", "type"],
  })
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "variants.id", "variants.sku"],
    filters: { handle: "t-shirt" },
  })
  const { data: promotions } = await query.graph({
    entity: "promotion",
    fields: ["id", "code"],
    filters: { code: "CG10" },
  })
  if (!promotions.length) {
    await createPromotionsWorkflow(container).run({
      input: {
        promotionsData: [
          {
            code: "CG10",
            type: "standard",
            status: "active",
            is_automatic: false,
            application_method: {
              type: "percentage",
              target_type: "items",
              allocation: "across",
              value: 10,
              currency_code: "eur",
            },
          },
        ],
      },
    })
  }
  const product = products[0]
  const variant = product?.variants?.find(
    (value) => value.sku === "SHIRT-S-BLACK",
  )
  const region = regions.find((value) => value.currency_code === "eur")
  const key = keys.find((value) => value.type === "publishable")
  if (!product || !variant || !region || !key)
    throw new Error(
      "Upstream initial seed is incomplete. Run db:migrate first.",
    )
  const output = process.env.COMMERCEGUARD_SEED_PATH
  if (!output) throw new Error("COMMERCEGUARD_SEED_PATH is required")
  writeFileSync(
    output,
    JSON.stringify(
      {
        regionId: region.id,
        publishableKey: key.token,
        productId: product.id,
        variantId: variant.id,
        handle: product.handle,
        unitPrice: 10,
        promotionCode: "CG10",
        stock: 1000000,
      },
      null,
      2,
    ),
  )
  console.log(
    "CommerceGuard seed manifest exported; promotion CG10 is available.",
  )
}
