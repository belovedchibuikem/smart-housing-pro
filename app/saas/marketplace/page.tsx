"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { SaaSHeader } from "@/components/saas/saas-header"
import { MarketplaceHero } from "@/components/marketplace/marketplace-hero"
import { MarketplaceFiltersPanel } from "@/components/marketplace/marketplace-filters"
import { MarketplaceListingCard } from "@/components/marketplace/listing-card"
import { VendorMarquee } from "@/components/marketplace/vendor-marquee"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ShieldCheck, FileCheck2, QrCode, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import {
  fetchMarketplaceListings,
  fetchMarketplaceStats,
  fetchMarketplaceVendors,
  type MarketplaceFilters,
  type MarketplaceListing,
  type MarketplaceVendor,
} from "@/lib/api/marketplace"

const defaultFilters: MarketplaceFilters = {
  sort: "newest",
  per_page: 24,
  page: 1,
}

export default function MarketplacePage() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<MarketplaceFilters>({
    ...defaultFilters,
    vendor_slug: searchParams.get("vendor_slug") || undefined,
    listing_kind: searchParams.get("listing_kind") || undefined,
    q: searchParams.get("q") || undefined,
  })
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [vendors, setVendors] = useState<MarketplaceVendor[]>([])
  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchMarketplaceStats>>>(null)
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 24, total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMarketplaceVendors({ limit: 40 }).then(setVendors)
    fetchMarketplaceStats().then(setStats)
  }, [])

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

  const vendorOptions = useMemo(
    () => vendors.map((v) => ({ slug: v.slug, name: v.name })),
    [vendors]
  )

  return (
    <div className="min-h-screen bg-background">
      <SaaSHeader />
      <MarketplaceHero
        stats={stats}
        search={filters.q || ""}
        onSearchChange={(q) => setFilters((prev) => ({ ...prev, q, page: 1 }))}
        onQuickFilter={(kind) => setFilters((prev) => ({ ...prev, listing_kind: kind, page: 1 }))}
      />

      <VendorMarquee vendors={vendors} />

      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-bold">Browse listings</h2>
            <p className="text-sm text-muted-foreground">
              {pagination.total} verified listing{pagination.total === 1 ? "" : "s"} available
            </p>
          </div>
          <div className="flex gap-2">
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
            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-80 rounded-xl bg-muted animate-pulse" />
                ))}
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
                    <MarketplaceListingCard key={`${listing.tenant_slug}-${listing.id}`} listing={listing} />
                  ))}
                </div>
                {pagination.last_page > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    <Button
                      variant="outline"
                      disabled={pagination.current_page <= 1}
                      onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) - 1 }))}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center text-sm text-muted-foreground px-3">
                      Page {pagination.current_page} of {pagination.last_page}
                    </span>
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
