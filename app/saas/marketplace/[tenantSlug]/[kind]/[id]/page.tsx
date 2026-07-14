"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { SaaSHeader } from "@/components/saas/saas-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Maximize2, BedDouble, Bath, ArrowLeft, Building2 } from "lucide-react"
import { VerificationBadge } from "@/components/marketplace/verification-badge"
import { ShareListingDialog } from "@/components/marketplace/share-listing-dialog"
import { ListingInquiryDialog } from "@/components/marketplace/listing-inquiry-dialog"
import { QrVerifyPanel } from "@/components/marketplace/qr-verify-panel"
import {
  fetchMarketplaceListing,
  formatMarketplacePrice,
  formatRentalPrice,
  type MarketplaceListing,
} from "@/lib/api/marketplace"
import { resolveStorageUrl } from "@/lib/api/config"

export default function MarketplaceListingDetailPage() {
  const params = useParams<{ tenantSlug: string; kind: string; id: string }>()
  const [listing, setListing] = useState<MarketplaceListing | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params.tenantSlug || !params.kind || !params.id) return
    setLoading(true)
    fetchMarketplaceListing(params.tenantSlug, params.kind, params.id)
      .then(setListing)
      .finally(() => setLoading(false))
  }, [params.tenantSlug, params.kind, params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SaaSHeader />
        <div className="container mx-auto px-4 py-16">
          <div className="h-96 rounded-xl bg-muted animate-pulse" />
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <SaaSHeader />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Listing not found</h1>
          <p className="text-muted-foreground mt-2">This listing may be unpublished or pending verification.</p>
          <Button asChild className="mt-6">
            <Link href="/saas/marketplace">Back to marketplace</Link>
          </Button>
        </div>
      </div>
    )
  }

  const images =
    listing.images && listing.images.length > 0
      ? listing.images.map((i) => resolveStorageUrl(i.url) || "")
      : [resolveStorageUrl(listing.image) || "/placeholder.jpg"]

  const tenantLogin = `https://${listing.tenant_slug}.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "smarthousing.com.ng"}/login`
  const isRental = listing.listing_type === "rental" || listing.is_rental

  return (
    <div className="min-h-screen bg-background">
      <SaaSHeader />
      <div className="container mx-auto px-4 py-8">
        <Button asChild variant="ghost" className="mb-4 gap-2">
          <Link href="/saas/marketplace">
            <ArrowLeft className="h-4 w-4" /> Back to marketplace
          </Link>
        </Button>

        <div className="grid lg:grid-cols-[1fr_340px] gap-8">
          <div className="space-y-6">
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-muted">
              <Image src={images[0] || "/placeholder.jpg"} alt={listing.name} fill className="object-cover" />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(1, 5).map((src, i) => (
                  <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <Image src={src} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="secondary">{listing.listing_kind === "house" ? "House" : "Land"}</Badge>
                {isRental && <Badge className="bg-violet-700">For rent</Badge>}
                <VerificationBadge status={listing.verification_status} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">{listing.name}</h1>
              <p className="text-3xl font-bold text-primary mt-3">
                {isRental ? formatRentalPrice(listing.price) : formatMarketplacePrice(listing.price)}
              </p>
              {isRental && listing.rent_deposit != null && (
                <p className="text-sm text-muted-foreground mt-1">
                  Deposit: {formatMarketplacePrice(listing.rent_deposit)}
                  {listing.lease_term_months ? ` · ${listing.lease_term_months} month lease` : ""}
                </p>
              )}
              <div className="flex items-center gap-2 text-muted-foreground mt-3">
                <MapPin className="h-4 w-4" />
                {listing.location}
              </div>
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                {(listing.size_sqm || listing.size) && (
                  <span className="inline-flex items-center gap-1.5">
                    <Maximize2 className="h-4 w-4" /> {listing.size_sqm || listing.size} m²
                  </span>
                )}
                {listing.bedrooms != null && (
                  <span className="inline-flex items-center gap-1.5">
                    <BedDouble className="h-4 w-4" /> {listing.bedrooms} bedrooms
                  </span>
                )}
                {listing.bathrooms != null && (
                  <span className="inline-flex items-center gap-1.5">
                    <Bath className="h-4 w-4" /> {listing.bathrooms} bathrooms
                  </span>
                )}
                {listing.slots_available != null && (
                  <Badge variant="outline">{listing.slots_available} slots remaining</Badge>
                )}
              </div>
            </div>

            {listing.description && (
              <Card>
                <CardContent className="p-6 prose prose-sm max-w-none">
                  <h2 className="text-lg font-semibold mb-2">About this listing</h2>
                  <p className="whitespace-pre-wrap text-muted-foreground">{listing.description}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <aside className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  {listing.tenant_logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveStorageUrl(listing.tenant_logo_url) || ""}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Building2 className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold">{listing.tenant_name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{listing.vendor_type}</div>
                  </div>
                </div>
                {listing.agent_name && (
                  <p className="text-sm">
                    Listed by agent: <span className="font-medium">{listing.agent_name}</span>
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {isRental
                    ? "Apply to rent or sign in to your member portal for full lease application."
                    : "Express interest securely through the vendor's Smart Housing portal after signing in."}
                </p>
                <ListingInquiryDialog listing={listing} />
                {listing.agent_name && (
                  <ListingInquiryDialog listing={listing} mode="viewing" triggerLabel="Schedule viewing" />
                )}
                <Button asChild variant="outline" className="w-full">
                  <a href={tenantLogin}>Continue to express interest</a>
                </Button>
                <ShareListingDialog listing={listing} />
              </CardContent>
            </Card>
            <QrVerifyPanel listing={listing} />
          </aside>
        </div>
      </div>
    </div>
  )
}
