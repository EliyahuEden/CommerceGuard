import type { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import {
  createPromotionsWorkflow,
  updateProductsWorkflow,
  batchVariantImagesWorkflow,
} from "@medusajs/medusa/core-flows"
import { readFileSync, writeFileSync } from "node:fs"
import { prepareCatalog, type CatalogEntry } from "./commerceguard-catalog"

// Runs inside the pinned real Medusa container. Never imports CommerceGuard tests.
export default async function seed({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const search = container.resolve(Modules.SEARCH)
  const catalogPath = process.env.COMMERCEGUARD_CATALOG_PATH
  if (!catalogPath)
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "COMMERCEGUARD_CATALOG_PATH is required",
    )
  const catalog: CatalogEntry[] = JSON.parse(readFileSync(catalogPath, "utf8"))
  await prepareCatalog(container, catalog)
  // Preserve upstream fixture prices/stock; new products have their own data.
  // Medusa core workflows preserve image/variant relationships and search indexing.
  for (const entry of catalog) {
    const { data: matches } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "subtitle",
        "description",
        "thumbnail",
        "material",
        "metadata",
        "images.id",
        "images.url",
      ],
      filters: { handle: entry.handle },
    })
    const current = matches[0]
    if (!current)
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Missing seeded catalog product: ${entry.handle}`,
      )
    const urls = [
      `/forme/${entry.asset}`,
      ...(entry.handle === "t-shirt" ? ["/forme/tee-white.webp"] : []),
    ]
    const { data: collections } = await query.graph({
      entity: "product_collection",
      fields: ["id"],
      filters: { handle: entry.collection },
    })
    if (
      current.title !== entry.title ||
      current.subtitle !== entry.subtitle ||
      current.description !== entry.description ||
      current.thumbnail !== urls[0] ||
      current.material !== entry.material ||
      current.metadata?.fit !== entry.fit ||
      current.metadata?.care !== entry.care ||
      JSON.stringify(current.images?.map((image) => image.url).sort()) !==
        JSON.stringify([...urls].sort())
    ) {
      await updateProductsWorkflow(container).run({
        input: {
          products: [
            {
              id: current.id,
              title: entry.title,
              subtitle: entry.subtitle,
              description: entry.description,
              thumbnail: urls[0],
              material: entry.material,
              collection_id: collections[0].id,
              metadata: { fit: entry.fit, care: entry.care },
              images: urls.map((url) => ({ url })),
            },
          ],
        },
      })
    }
    const { data: refreshed } = await query.graph({
      entity: "product",
      fields: ["id", "images.id", "images.url", "variants.id", "variants.sku"],
      filters: { id: current.id },
    })
    // variants.images also includes unassigned general images. Inspect explicit
    // image-to-variant relations before deciding which links to add or remove.
    const { data: linkedImages } = await query.graph({
      entity: "product_image",
      fields: ["id", "variants.id"],
      filters: { product_id: current.id },
    })
    for (const variant of refreshed[0].variants ?? []) {
      const url =
        entry.handle === "t-shirt" && variant.sku?.endsWith("WHITE")
          ? urls[1]
          : urls[0]
      const image = refreshed[0].images?.find((image) => image.url === url)
      if (!image)
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Missing catalog image for ${variant.sku}`,
        )
      const existing = linkedImages
        .filter((image) =>
          image.variants?.some((linked) => linked?.id === variant.id),
        )
        .map((image) => image.id)
      const add = existing.includes(image.id) ? [] : [image.id]
      const remove = existing.filter((id) => id !== image.id)
      if (add.length || remove.length)
        await batchVariantImagesWorkflow(container).run({
          input: { variant_id: variant.id, add, remove },
        })
    }
    // The CLI exits after this script. Await derived search ingestion explicitly;
    // fire-and-forget local event delivery can otherwise leave the last product
    // stale, and a repeated metadata seed would not emit another update event.
    await search.ingest({ name: "product.updated", data: { id: current.id } })
  }
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
    fields: ["id", "title", "handle", "variants.id", "variants.sku"],
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
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Upstream initial seed is incomplete. Run db:migrate first.",
    )
  const output = process.env.COMMERCEGUARD_SEED_PATH
  if (!output)
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "COMMERCEGUARD_SEED_PATH is required",
    )
  writeFileSync(
    output,
    JSON.stringify(
      {
        regionId: region.id,
        publishableKey: key.token,
        productId: product.id,
        productTitle: product.title,
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
