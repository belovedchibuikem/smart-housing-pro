import type { MetadataRoute } from "next"
import { getApiBaseUrl } from "@/lib/api/config"

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://smarthousing.com.ng"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site}/saas`, changeFrequency: "weekly", priority: 1 },
    { url: `${site}/saas/marketplace`, changeFrequency: "daily", priority: 0.95 },
    { url: `${site}/saas/marketplace/vendors`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${site}/saas/marketplace/agents`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${site}/saas/marketplace/compare`, changeFrequency: "monthly", priority: 0.4 },
  ]

  try {
    const res = await fetch(`${getApiBaseUrl()}/marketplace/listings?per_page=100&page=1&sort=newest`, {
      next: { revalidate: 86400 },
    })
    if (!res.ok) return staticRoutes
    const json = await res.json()
    const listings = (json.data || []) as Array<{
      tenant_slug: string
      listing_kind: string
      id: string
      published_at?: string
    }>

    const listingRoutes: MetadataRoute.Sitemap = listings.map((l) => ({
      url: `${site}/saas/marketplace/${l.tenant_slug}/${l.listing_kind}/${l.id}`,
      lastModified: l.published_at ? new Date(l.published_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }))

    return [...staticRoutes, ...listingRoutes]
  } catch {
    return staticRoutes
  }
}
