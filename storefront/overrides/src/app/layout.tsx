import CommerceGuardReadiness from "./commerceguard-readiness"
import { getBaseURL } from "@lib/util/env"
import type { Metadata } from "next"
import "styles/globals.css"
import "styles/forme.css"
import WishlistProvider from "@modules/wishlist/provider"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: { default: "FORME — Everyday, considered.", template: "%s · FORME" },
  icons: { icon: "/forme/favicon.svg", shortcut: "/favicon.ico" },
  description:
    "Considered essentials for the everyday. Explore the FORME collection — an original CommerceGuard demonstration storefront.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-mode="light">
      <head>
        <link rel="ucp" href="/.well-known/ucp" />
      </head>
      <body className="forme-theme">
        <a href="#main-content" className="forme-skip-link">
          Skip to content
        </a>
        <WishlistProvider>{children}</WishlistProvider>
        <CommerceGuardReadiness />
      </body>
    </html>
  )
}
