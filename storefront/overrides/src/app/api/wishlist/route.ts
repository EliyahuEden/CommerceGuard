import { getWishlistSession } from "@lib/data/wishlist"
export const dynamic = "force-dynamic"
export async function GET() {
  try {
    return Response.json(await getWishlistSession(), {
      headers: { "Cache-Control": "private, no-store", Vary: "Cookie" },
    })
  } catch {
    return Response.json(
      { error: "Wishlist session could not be loaded." },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    )
  }
}
