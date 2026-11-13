import type { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import FormeDialog from "@modules/common/components/forme-dialog"
export default function ImageGallery({
  images,
}: {
  images: HttpTypes.StoreProductImage[]
}) {
  return (
    <div className="forme-gallery">
      {images.map((image, index) => (
        <div key={image.id} id={image.id} className="forme-gallery-image">
          {image.url && (
            <FormeDialog
              label={`Product image ${index + 1}`}
              className="forme-zoom-trigger"
              trigger={
                <>
                  <Image
                    src={image.url}
                    alt={`Product view ${index + 1}`}
                    priority={index === 0}
                    fill
                    sizes="(max-width: 1023px) 100vw, 55vw"
                    className="forme-gallery-photo"
                  />
                  <span className="forme-zoom-label">Zoom image +</span>
                </>
              }
            >
              <Image
                width={1400}
                height={1400}
                unoptimized
                src={image.url}
                alt={`Enlarged product view ${index + 1}`}
                className="forme-zoom-image"
              />
            </FormeDialog>
          )}
        </div>
      ))}
    </div>
  )
}
