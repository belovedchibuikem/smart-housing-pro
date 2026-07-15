"use client"

import { useState } from "react"
import Link from "next/link"
import { MarketplaceListingCard } from "@/components/marketplace/listing-card"
import { MarketplaceFiltersPanel } from "@/components/marketplace/marketplace-filters"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Store } from "lucide-react"
import { type MarketplaceFilters } from "@/lib/api/marketplace"
import { useMarketplaceListings } from "@/lib/hooks/use-marketplace-listings"

const defaultFilters: Omit<MarketplaceFilters, "page"> = { sort: "newest", per_page: 24 }

export default function MarketHubPage() {
  const [filters, setFilters] = useState<Omit<MarketplaceFilters, "page">>(defaultFilters)
  const { listings, pagination, loading, loadingMore, hasMore, loadMore } = useMarketplaceListings(filters)

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
          {loading && listings.length === 0 ? (
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
              <div className="flex justify-center mt-8">
                {hasMore ? (
                  <Button onClick={loadMore} disabled={loadingMore} variant="outline">
                    {loadingMore ? "Loading…" : "Load more"}
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">End of results</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
