import type {
  ExecArgs,
  CreateProductWorkflowInputDTO,
} from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createCollectionsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createInventoryLevelsWorkflow,
} from "@medusajs/medusa/core-flows"

export type CatalogEntry = {
  handle: string
  title: string
  subtitle: string
  description: string
  asset: string
  collection: string
  category: string
  color?: string
  price?: number
  usd?: number
  stock?: number
  material: string
  fit: string
  care: string
}
export async function prepareCatalog(
  container: ExecArgs["container"],
  catalog: CatalogEntry[],
) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  for (const collection of [
    ...new Set(catalog.map((entry) => entry.collection)),
  ]) {
    const { data } = await query.graph({
      entity: "product_collection",
      fields: ["id"],
      filters: { handle: collection },
    })
    if (!data.length)
      await createCollectionsWorkflow(container).run({
        input: {
          collections: [
            {
              handle: collection,
              title: collection
                .split("-")
                .map((word) => word[0].toUpperCase() + word.slice(1))
                .join(" "),
            },
          ],
        },
      })
  }
  for (const category of [...new Set(catalog.map((entry) => entry.category))]) {
    const { data } = await query.graph({
      entity: "product_category",
      fields: ["id"],
      filters: { handle: category },
    })
    if (!data.length)
      await createProductCategoriesWorkflow(container).run({
        input: {
          product_categories: [
            {
              handle: category,
              name: category[0].toUpperCase() + category.slice(1),
              is_active: true,
            },
          ],
        },
      })
  }
  const { data: channels } = await query.graph({
    entity: "sales_channel",
    fields: ["id"],
  })
  const { data: profiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
  })
  if (!channels[0] || !profiles[0] || !locations[0])
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Run the initial data seed before catalog expansion.",
    )
  for (const entry of catalog.filter((entry) => entry.price !== undefined)) {
    const { data: matches } = await query.graph({
      entity: "product",
      fields: ["id"],
      filters: { handle: entry.handle },
    })
    if (!matches.length) {
      const { data: collections } = await query.graph({
        entity: "product_collection",
        fields: ["id"],
        filters: { handle: entry.collection },
      })
      const { data: categories } = await query.graph({
        entity: "product_category",
        fields: ["id"],
        filters: { handle: entry.category },
      })
      const product: CreateProductWorkflowInputDTO = {
        handle: entry.handle,
        title: entry.title,
        subtitle: entry.subtitle,
        description: entry.description,
        status: ProductStatus.PUBLISHED,
        shipping_profile_id: profiles[0].id,
        sales_channels: [{ id: channels[0].id }],
        collection_id: collections[0].id,
        category_ids: [categories[0].id],
        thumbnail: `/forme/${entry.asset}`,
        images: [{ url: `/forme/${entry.asset}` }],
        material: entry.material,
        metadata: { fit: entry.fit, care: entry.care },
        options: [
          { title: "Size", values: ["S", "M", "L", "XL"] },
          { title: "Color", values: [entry.color!] },
        ],
        variants: ["S", "M", "L", "XL"].map((size) => ({
          title: `${size} / ${entry.color}`,
          sku: `CG-${entry.handle.toUpperCase()}-${size}`,
          manage_inventory: true,
          allow_backorder: false,
          options: { Size: size, Color: entry.color! },
          prices: [
            { amount: entry.price!, currency_code: "eur" },
            { amount: entry.usd!, currency_code: "usd" },
          ],
        })),
      }
      await createProductsWorkflow(container).run({
        input: { products: [product] },
      })
    }
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["variants.id", "variants.title"],
      filters: { handle: entry.handle },
    })
    for (const variant of products[0].variants || []) {
      const { data: links } = await query.graph({
        entity: "product_variant_inventory_item",
        fields: ["inventory_item_id"],
        filters: { variant_id: variant.id },
      })
      for (const link of links) {
        const { data: levels } = await query.graph({
          entity: "inventory_level",
          fields: ["id"],
          filters: {
            inventory_item_id: link.inventory_item_id,
            location_id: locations[0].id,
          },
        })
        // Never replenish stock on a repeated seed. XL hoodie is intentionally
        // unavailable; the other size levels demonstrate scarce and normal stock.
        if (!levels.length)
          await createInventoryLevelsWorkflow(container).run({
            input: {
              inventory_levels: [
                {
                  inventory_item_id: link.inventory_item_id,
                  location_id: locations[0].id,
                  stocked_quantity:
                    entry.handle === "charcoal-hoodie" &&
                    variant.title?.startsWith("XL")
                      ? 0
                      : entry.stock!,
                },
              ],
            },
          })
      }
    }
  }
}
