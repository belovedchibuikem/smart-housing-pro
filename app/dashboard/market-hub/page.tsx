"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MarketplaceListingCard } from "@/components/marketplace/listing-card"
import { MarketplaceFiltersPanel } from "@/components/marketplace/marketplace-filters"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Store } from "lucide-react"
import {
  fetchMarketplaceListings,
  type MarketplaceFilters,
  type MarketplaceListing,
} from "@/lib/api/marketplace"

const defaultFilters: MarketplaceFilters = { sort: "newest", per_page: 24, page: 1 }

export default function MarketHubPage() {
  const [filters, setFilters] = useState<MarketplaceFilters>(defaultFilters)
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 24, total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handle = setTimeout(() => {
      setLoading(true)
      fetchMarketplaceListings(filters)
        .then((result) => {
          setListings(result.data)
          setPagination(result.pagination)
        })
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(handle)
  }, [filters])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge variant="secondary" className="mb-2 gap-1">
            <Store className="h-3 w-3" /> Market Hub
          </Badge>
          <h1 className="text-3xl font-bold">Cross-vendor marketplace</h1>
          <p className="text-muted-foreground mt-1">
            Discover verified houses and land from all Smart Housing vendors. Express interest with the listing&apos;s
            cooperative after opening the detail page.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/saas/marketplace" target="_blank">
            Open public marketplace
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        <MarketplaceFiltersPanel
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(defaultFilters)}
        />
        <div>
          {loading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
              No marketplace listings match your filters yet.
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">{pagination.total} verified listings</p>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {listings.map((listing) => (
                  <MarketplaceListingCard key={`${listing.tenant_slug}-${listing.id}`} listing={listing} />
                ))}
              </div>
              {pagination.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={pagination.current_page <= 1}
                    onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) - 1 }))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={pagination.current_page >= pagination.last_page}
                    onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
