"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { SaaSHeader } from "@/components/saas/saas-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchMarketplaceListing, formatMarketplacePrice, type MarketplaceListing } from "@/lib/api/marketplace"
import { ArrowLeft } from "lucide-react"

type Ref = { tenantSlug: string; kind: string; id: string }

function parseRefs(raw: string | null): Ref[] {
  if (!raw) return []
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const segments = part.split(":")
      if (segments.length === 3) {
        return { tenantSlug: segments[0], kind: segments[1], id: segments[2] }
      }
      const [tenantSlug, id] = segments
      return { tenantSlug: tenantSlug || "", kind: "house", id: id || part }
    })
    .filter((r) => r.tenantSlug && r.id)
}

export default function MarketplaceComparePage() {
  const searchParams = useSearchParams()
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let refs = parseRefs(searchParams.get("ids"))
    if (refs.length === 0) {
      try {
        const stored = localStorage.getItem("sh_compare_refs")
        if (stored) refs = JSON.parse(stored) as Ref[]
      } catch {
        /* ignore */
      }
    }
    if (refs.length === 0) {
      setLoading(false)
      return
    }
    Promise.all(refs.map((r) => fetchMarketplaceListing(r.tenantSlug, r.kind, r.id)))
      .then((rows) => setListings(rows.filter(Boolean) as MarketplaceListing[]))
      .finally(() => setLoading(false))
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background">
      <SaaSHeader />
      <div className="container mx-auto px-4 py-10">
        <Button asChild variant="ghost" className="mb-4 gap-2">
          <Link href="/saas/marketplace">
            <ArrowLeft className="h-4 w-4" /> Back to marketplace
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-6">Compare listings</h1>
        {loading ? (
          <div className="h-40 bg-muted animate-pulse rounded-xl" />
        ) : listings.length === 0 ? (
          <p className="text-muted-foreground">Select listings to compare from the marketplace using the compare icon.</p>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {listings.map((l) => (
              <Card key={`${l.tenant_slug}-${l.id}`}>
                <CardHeader>
                  <CardTitle className="text-base line-clamp-2">{l.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p className="font-bold text-primary">{formatMarketplacePrice(l.price)}</p>
                  <p>{l.location}</p>
                  <p>
                    {l.bedrooms ?? "—"} bed · {l.bathrooms ?? "—"} bath
                  </p>
                  <p>{l.size_sqm ?? l.size ?? "—"} m²</p>
                  <p>Trust: {l.trust_score ?? "—"}</p>
                  <Button asChild size="sm" variant="outline" className="w-full mt-2">
                    <Link href={`/saas/marketplace/${l.tenant_slug}/${l.listing_kind}/${l.id}`}>View</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
