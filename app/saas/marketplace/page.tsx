"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { SaaSHeader } from "@/components/saas/saas-header"
import { MarketplaceHero } from "@/components/marketplace/marketplace-hero"
import { MarketplaceFiltersPanel } from "@/components/marketplace/marketplace-filters"
import { MarketplaceListingCard } from "@/components/marketplace/listing-card"
import { VendorMarquee } from "@/components/marketplace/vendor-marquee"
import { ListingMap } from "@/components/marketplace/listing-map"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ShieldCheck, FileCheck2, QrCode, SlidersHorizontal, Map as MapIcon } from "lucide-react"
import {
  addFavorite,
  fetchFavoriteListings,
  fetchHousingOsFlags,
  fetchMarketplaceFeatured,
  fetchMarketplaceStats,
  fetchMarketplaceVendors,
  fetchTrendingLocations,
  removeFavorite,
  type MarketplaceFilters,
  type MarketplaceListing,
  type MarketplaceVendor,
} from "@/lib/api/marketplace"
import { useMarketplaceListings } from "@/lib/hooks/use-marketplace-listings"

const defaultFilters: Omit<MarketplaceFilters, "page"> = {
  sort: "newest",
  per_page: 24,
}

function listingRef(listing: MarketplaceListing) {
  return `${listing.tenant_slug}:${listing.listing_kind}:${listing.id}`
}

function filtersFromSearchParams(searchParams: URLSearchParams): Omit<MarketplaceFilters, "page"> {
  return {
    ...defaultFilters,
    vendor_slug: searchParams.get("vendor_slug") || undefined,
    listing_kind: searchParams.get("listing_kind") || undefined,
    listing_category: searchParams.get("listing_category") || undefined,
    listing_purpose: searchParams.get("listing_purpose") || undefined,
    listing_type: searchParams.get("listing_type") || undefined,
    q: searchParams.get("q") || undefined,
    state: searchParams.get("state") || undefined,
    city: searchParams.get("city") || undefined,
  }
}

export default function MarketplacePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [filters, setFilters] = useState<Omit<MarketplaceFilters, "page">>(() =>
    filtersFromSearchParams(searchParams)
  )
  const [vendors, setVendors] = useState<MarketplaceVendor[]>([])
  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchMarketplaceStats>>>(null)
  const [featured, setFeatured] = useState<MarketplaceListing[]>([])
  const [trending, setTrending] = useState<Array<{ state?: string; city?: string; count: number }>>([])
  const [flags, setFlags] = useState<Record<string, boolean> | null>(null)
  const [showMap, setShowMap] = useState(false)
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

  const { listings, pagination, loading, loadingMore, hasMore, loadMore, error } = useMarketplaceListings(filters)

  useEffect(() => {
    fetchMarketplaceVendors({ limit: 40 }).then(setVendors)
    fetchMarketplaceStats().then(setStats)
    fetchHousingOsFlags().then(setFlags)
    fetchMarketplaceFeatured(8).then(setFeatured)
    fetchTrendingLocations(8).then(setTrending)
    fetchFavoriteListings().then((rows) => {
      setFavoriteIds(new Set(rows.map((r) => r.marketplace_id || "").filter(Boolean)))
    })
    try {
      const stored = localStorage.getItem("sh_compare_refs")
      if (stored) setCompareIds(JSON.parse(stored) as string[])
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "" && key !== "per_page" && key !== "sort") {
        params.set(key, String(value))
      }
    })
    const qs = params.toString()
    router.replace(qs ? `/saas/marketplace?${qs}` : "/saas/marketplace", { scroll: false })
  }, [filters, router])

  const vendorOptions = useMemo(
    () => vendors.map((v) => ({ slug: v.slug, name: v.name })),
    [vendors]
  )

  const mapEnabled = Boolean(flags?.map_enabled)
  const favoritesEnabled = Boolean(flags?.favorites_enabled)

  const toggleCompare = useCallback((listing: MarketplaceListing) => {
    const key = listingRef(listing)
    setCompareIds((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : prev.length >= 4 ? prev : [...prev, key]
      localStorage.setItem("sh_compare_refs", JSON.stringify(next))
      return next
    })
  }, [])

  const toggleFavorite = useCallback(
    async (listing: MarketplaceListing) => {
      const mid = listing.marketplace_id
      if (!mid || !favoritesEnabled) return
      const isFav = favoriteIds.has(mid)
      const res = isFav ? await removeFavorite(mid) : await addFavorite(mid)
      if (res.ok) {
        setFavoriteIds((prev) => {
          const next = new Set(prev)
          if (isFav) next.delete(mid)
          else next.add(mid)
          return next
        })
      }
    },
    [favoriteIds, favoritesEnabled]
  )

  const cardProps = (listing: MarketplaceListing) => ({
    listing,
    onCompare: toggleCompare,
    compareSelected: compareIds.includes(listingRef(listing)),
    onFavorite: favoritesEnabled ? toggleFavorite : undefined,
    favoriteSelected: listing.marketplace_id ? favoriteIds.has(listing.marketplace_id) : false,
  })

  return (
    <div className="min-h-screen bg-background">
      <SaaSHeader />
      <MarketplaceHero
        stats={stats}
        search={filters.q || ""}
        onSearchChange={(q) => setFilters((prev) => ({ ...prev, q }))}
        onQuickFilter={(kind) => setFilters((prev) => ({ ...prev, listing_kind: kind }))}
      />

      <VendorMarquee vendors={vendors} />

      {featured.length > 0 && (
        <section className="container mx-auto px-4 pt-10" aria-label="Featured listings">
          <h2 className="text-xl font-bold mb-4">Featured & verified</h2>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {featured.map((listing) => (
              <MarketplaceListingCard key={`feat-${listing.tenant_slug}-${listing.id}`} {...cardProps(listing)} />
            ))}
          </div>
        </section>
      )}

      {trending.length > 0 && (
        <section className="container mx-auto px-4 pt-8" aria-label="Trending locations">
          <h2 className="text-lg font-semibold mb-3">Trending locations</h2>
          <div className="flex flex-wrap gap-2">
            {trending.map((t) => (
              <Button
                key={`${t.state}-${t.city}`}
                variant="outline"
                size="sm"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    state: t.state || undefined,
                    city: t.city || undefined,
                  }))
                }
              >
                {t.city}
                {t.state ? `, ${t.state}` : ""} ({t.count})
              </Button>
            ))}
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-bold">Browse listings</h2>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {pagination.total} verified listing{pagination.total === 1 ? "" : "s"} available
            </p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {mapEnabled && (
              <Button
                variant={showMap ? "default" : "outline"}
                className="gap-2"
                onClick={() => setShowMap((v) => !v)}
                aria-pressed={showMap}
              >
                <MapIcon className="h-4 w-4" />
                Map
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/saas/marketplace/vendors">All vendors</Link>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="overflow-y-auto w-[320px]">
                <MarketplaceFiltersPanel
                  filters={filters}
                  onChange={setFilters}
                  onReset={() => setFilters(defaultFilters)}
                  vendors={vendorOptions}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {showMap && mapEnabled && (
          <div className="mb-8">
            <ListingMap listings={listings} enabled={mapEnabled} />
          </div>
        )}

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          <aside className="hidden lg:block sticky top-24 self-start">
            <MarketplaceFiltersPanel
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(defaultFilters)}
              vendors={vendorOptions}
            />
          </aside>

          <div>
            {loading && listings.length === 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6" aria-busy="true">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-80 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-xl border border-destructive/40 p-8 text-center">
                <p className="text-destructive font-medium">{error}</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="rounded-xl border border-dashed p-12 text-center">
                <h3 className="font-semibold text-lg">No listings match your filters</h3>
                <p className="text-muted-foreground mt-2">Try widening price or location filters.</p>
                <Button className="mt-4" variant="outline" onClick={() => setFilters(defaultFilters)}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <MarketplaceListingCard
                      key={`${listing.tenant_slug}-${listing.id}`}
                      {...cardProps(listing)}
                    />
                  ))}
                </div>
                <div className="flex justify-center mt-10">
                  {hasMore ? (
                    <Button onClick={loadMore} disabled={loadingMore} variant="outline">
                      {loadingMore ? "Loading…" : "Load more"}
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">You have reached the end</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {compareIds.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 rounded-full border bg-background shadow-lg px-4 py-2 text-sm flex items-center gap-2">
          Comparing {compareIds.length} listing{compareIds.length === 1 ? "" : "s"}
          <Button asChild size="sm" variant="default">
            <Link href={`/saas/marketplace/compare?ids=${encodeURIComponent(compareIds.join(","))}`}>
              Open compare
            </Link>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setCompareIds([])
              localStorage.removeItem("sh_compare_refs")
            }}
          >
            Clear
          </Button>
        </div>
      )}

      <section id="trust" className="border-t bg-muted/40 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-bold">Built to stop housing scams</h2>
            <p className="text-muted-foreground mt-3">
              Smart Housing verifies vendors and listings before they appear publicly. Buyers can confirm authenticity
              on the spot with QR codes.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: FileCheck2,
                title: "Document & vendor review",
                body: "Listings require admin review of title documents and vendor identity before going live.",
              },
              {
                icon: ShieldCheck,
                title: "Verified badge",
                body: "Only approved listings show the verified shield — pending or rejected never reach buyers.",
              },
              {
                icon: QrCode,
                title: "QR authenticity check",
                body: "Scan the listing QR on-site to confirm it matches our marketplace record.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border bg-background p-6 shadow-sm">
                <item.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
