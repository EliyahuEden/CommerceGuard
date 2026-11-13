import Image from "next/image"
import { clx } from "@modules/common/components/ui"
import type { HttpTypes } from "@medusajs/types"

type Props = {
  thumbnail?: string | null
  images?: HttpTypes.StoreProductImage[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  className?: string
  alt?: string
  "data-testid"?: string
}
export default function Thumbnail({
  thumbnail,
  images,
  size = "small",
  className,
  alt = "",
  "data-testid": testId,
}: Props) {
  const image = thumbnail || images?.[0]?.url
  return (
    <div
      className={clx("forme-thumbnail", `forme-thumbnail-${size}`, className)}
      data-testid={testId}
    >
      {image ? (
        <Image
          src={image}
          alt={alt}
          fill
          className="forme-product-image"
          sizes="(max-width: 767px) 46vw, 25vw"
        />
      ) : (
        <span
          className="forme-image-placeholder"
          aria-label="Image unavailable"
        >
          F.
        </span>
      )}
    </div>
  )
}
