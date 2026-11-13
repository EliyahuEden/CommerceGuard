import type { HttpTypes } from "@medusajs/types"
import FormeDialog from "@modules/common/components/forme-dialog"

export default function ProductDetails({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  const metadata = product.metadata || {}
  const fit =
    typeof metadata.fit === "string"
      ? metadata.fit
      : "Regular fit. Choose your usual size for an easy silhouette."
  const care =
    typeof metadata.care === "string"
      ? metadata.care
      : "Machine wash cold with similar colours. Reshape while damp and air dry. Do not bleach."
  const bottom =
    product.handle?.includes("pants") ||
    product.handle?.includes("shorts") ||
    product.handle?.includes("chinos")
  return (
    <div className="forme-product-facts">
      <p>
        <strong>Fit</strong> {fit}
      </p>
      <FormeDialog
        label="Size guide"
        className="forme-text-link"
        trigger="Find your size ↗"
      >
        <p>
          Body measurements in centimetres. Measure without pulling the tape
          tight. Between sizes? Choose the larger size for a relaxed fit.
        </p>
        <div className="forme-table-scroll">
          <table>
            <caption>
              {bottom ? "Trousers and shorts" : "Tops and layers"} —
              demonstration size chart
            </caption>
            <thead>
              <tr>
                <th scope="col">Size</th>
                <th scope="col">{bottom ? "Waist" : "Chest"}</th>
                <th scope="col">{bottom ? "Hip" : "Waist"}</th>
              </tr>
            </thead>
            <tbody>
              {["S", "M", "L", "XL"].map((size, i) => (
                <tr key={size}>
                  <th scope="row">{size}</th>
                  <td>
                    {bottom ? 76 + i * 8 : 88 + i * 8}–
                    {bottom ? 83 + i * 8 : 95 + i * 8}
                  </td>
                  <td>
                    {bottom ? 92 + i * 8 : 72 + i * 8}–
                    {bottom ? 99 + i * 8 : 79 + i * 8}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="forme-note">
          Fictional product specifications for this portfolio demonstration. No
          physical garment measurements are certified.
        </p>
      </FormeDialog>
      <details>
        <summary>Fabric & care</summary>
        <p>{product.material || "Cotton blend"}</p>
        <p>{care}</p>
      </details>
    </div>
  )
}
