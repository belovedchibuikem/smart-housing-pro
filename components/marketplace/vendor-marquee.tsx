"use client"

import Link from "next/link"
import { Building2 } from "lucide-react"
import type { MarketplaceVendor } from "@/lib/api/marketplace"
import { resolveStorageUrl } from "@/lib/api/config"

export function VendorMarquee({ vendors }: { vendors: MarketplaceVendor[] }) {
  if (!vendors.length) return null

  return (
    <section className="py-10 border-y bg-muted/30">
      <div className="container mx-auto px-4 mb-6 text-center">
        <h2 className="text-2xl font-bold">Trusted vendors & cooperatives</h2>
        <p className="text-muted-foreground mt-1">Verified partners listing on Smart Housing Marketplace</p>
      </div>
      <div className="container mx-auto px-4">
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
          {vendors.map((vendor) => (
            <Link
              key={vendor.slug}
              href={`/saas/marketplace?vendor_slug=${encodeURIComponent(vendor.slug)}`}
              className="flex items-center gap-3 rounded-xl border bg-background px-4 py-3 min-w-[220px] hover:border-primary/40 transition-colors shadow-sm snap-start shrink-0"
            >
              {vendor.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveStorageUrl(vendor.logo_url) || ""}
                  alt={vendor.name}
                  className="h-10 w-10 rounded-lg object-contain bg-muted"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0">
                <div className="font-medium truncate">{vendor.name}</div>
                <div className="text-xs text-muted-foreground capitalize">
                  {vendor.vendor_type} · {vendor.listing_count} listing{vendor.listing_count === 1 ? "" : "s"}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link href="/saas/marketplace/vendors" className="text-sm font-medium text-primary hover:underline">
            View all vendors
          </Link>
        </div>
      </div>
    </section>
  )
}
