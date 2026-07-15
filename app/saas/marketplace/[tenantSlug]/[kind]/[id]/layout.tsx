import type { Metadata } from "next"
import { getApiBaseUrl } from "@/lib/api/config"

type Props = {
  params: Promise<{ tenantSlug: string; kind: string; id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug, kind, id } = await params
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://smarthousing.com.ng"

  try {
    const res = await fetch(
      `${getApiBaseUrl()}/marketplace/listings/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(kind)}/${encodeURIComponent(id)}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) {
      return { title: "Listing | SmartHousing Marketplace" }
    }
    const json = await res.json()
    const listing = json.data
    const title = listing?.name || listing?.title || "Verified listing"
    const description =
      listing?.description?.slice(0, 160) ||
      `Verified ${kind} listing on SmartHousing — ${listing?.location || "Nigeria"}`
    const image = listing?.image || listing?.images?.[0]?.url

    return {
      title: `${title} | SmartHousing Marketplace`,
      description,
      openGraph: {
        title,
        description,
        url: `${site}/saas/marketplace/${tenantSlug}/${kind}/${id}`,
        images: image ? [{ url: image }] : undefined,
        type: "website",
      },
      alternates: {
        canonical: `${site}/saas/marketplace/${tenantSlug}/${kind}/${id}`,
      },
    }
  } catch {
    return { title: "Listing | SmartHousing Marketplace" }
  }
}

export default function MarketplaceListingLayout({ children }: { children: React.ReactNode }) {
  return children
}
