"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { SaaSHeader } from "@/components/saas/saas-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Building2 } from "lucide-react"
import { fetchMarketplaceVendors, type MarketplaceVendor } from "@/lib/api/marketplace"
import { resolveStorageUrl } from "@/lib/api/config"

export default function MarketplaceVendorsPage() {
  const [vendors, setVendors] = useState<MarketplaceVendor[]>([])
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handle = setTimeout(() => {
      setLoading(true)
      fetchMarketplaceVendors({ q, limit: 100 })
        .then(setVendors)
        .finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(handle)
  }, [q])

  return (
    <div className="min-h-screen bg-background">
      <SaaSHeader />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mb-8">
          <Badge className="mb-3" variant="secondary">
            Vendor directory
          </Badge>
          <h1 className="text-4xl font-bold">Real-Estate Vendors & Landlords</h1>
          <p className="text-muted-foreground mt-3">
            Explore marketplace vendors with verified branding. Click a vendor to view their published listings.
          </p>
          <Input
            className="mt-6 max-w-md"
            placeholder="Search vendors…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <Link key={vendor.id} href={`/saas/marketplace?vendor_slug=${encodeURIComponent(vendor.slug)}`}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex gap-4">
                    {vendor.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resolveStorageUrl(vendor.logo_url) || ""}
                        alt={vendor.name}
                        className="h-14 w-14 rounded-xl object-contain border bg-muted"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{vendor.name}</div>
                      <div className="text-xs text-muted-foreground capitalize mt-0.5">
                        {vendor.vendor_type}
                        {vendor.marketplace_featured ? " · Featured" : ""}
                        {vendor.cac_verified ? " · CAC verified" : ""}
                      </div>
                      {vendor.years_in_business != null && (
                        <p className="text-xs text-muted-foreground mt-1">{vendor.years_in_business} years in business</p>
                      )}
                      {vendor.marketplace_tagline && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{vendor.marketplace_tagline}</p>
                      )}
                      <p className="text-sm font-medium mt-3">
                        {vendor.listing_count} listing{vendor.listing_count === 1 ? "" : "s"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
