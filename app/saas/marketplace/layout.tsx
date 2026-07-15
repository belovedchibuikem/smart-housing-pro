import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Verified Marketplace",
  description:
    "Browse verified houses, land, rentals, and commercial properties on SmartHousing — Nigeria's trust-first housing marketplace.",
  openGraph: {
    title: "SmartHousing Verified Marketplace",
    description: "Verification-first property discovery for Nigeria.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartHousing Verified Marketplace",
    description: "Verification-first property discovery for Nigeria.",
  },
}

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="min-h-screen bg-background" />}>{children}</Suspense>
}
