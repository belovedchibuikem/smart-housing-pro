"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { SaaSHeader } from "@/components/saas/saas-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Maximize2, BedDouble, Bath, ArrowLeft, Building2, Car } from "lucide-react"
import { VerificationBadge } from "@/components/marketplace/verification-badge"
import { ShareListingDialog } from "@/components/marketplace/share-listing-dialog"
import { ListingInquiryDialog } from "@/components/marketplace/listing-inquiry-dialog"
import { QrVerifyPanel } from "@/components/marketplace/qr-verify-panel"
import { MortgageCalculatorPanel } from "@/components/marketplace/mortgage-calculator-panel"
import { FraudReportDialog } from "@/components/marketplace/fraud-report-dialog"
import { ListingReviews } from "@/components/marketplace/listing-reviews"
import { MarketplaceListingCard } from "@/components/marketplace/listing-card"
import { ListingMap } from "@/components/marketplace/listing-map"
import {
  fetchMarketplaceListing,
  fetchSimilarListings,
  formatMarketplacePrice,
  formatRentalPrice,
  type MarketplaceListing,
} from "@/lib/api/marketplace"
import { resolveStorageUrl } from "@/lib/api/config"

export default function MarketplaceListingDetailPage() {
  const params = useParams<{ tenantSlug: string; kind: string; id: string }>()
  const [listing, setListing] = useState<MarketplaceListing | null>(null)
  const [similar, setSimilar] = useState<MarketplaceListing[]>([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    if (!params.tenantSlug || !params.kind || !params.id) return
    setLoading(true)
    fetchMarketplaceListing(params.tenantSlug, params.kind, params.id)
      .then((data) => {
        setListing(data)
        if (data) {
          fetchSimilarListings(params.tenantSlug, params.kind, params.id).then(setSimilar)
        }
      })
      .finally(() => setLoading(false))
  }, [params.tenantSlug, params.kind, params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SaaSHeader />
        <div className="container mx-auto px-4 py-16">
          <div className="h-96 rounded-xl bg-muted animate-pulse" aria-busy="true" />
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
  const isLand = listing.listing_kind !== "house"
  const amenities = listing.amenities || []
  const meta = listing.detail_meta || {}
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.name,
    description: listing.description || undefined,
    image: images[0] || undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "NGN",
      price: listing.price,
      availability: "https://schema.org/InStock",
    },
  }

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
              <Image
                src={images[activeImage] || "/placeholder.jpg"}
                alt={listing.name}
                fill
                className="object-cover"
                priority
              />
              {listing.video_url && (
                <Badge className="absolute top-4 right-4 bg-black/70">Video available</Badge>
              )}
              {listing.virtual_tour_url && (
                <Badge className="absolute top-4 left-4 bg-black/70">360° tour placeholder</Badge>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {images.slice(0, 12).map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`relative aspect-video rounded-lg overflow-hidden bg-muted ring-offset-2 ${
                      activeImage === i ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setActiveImage(i)}
                    aria-label={`Show photo ${i + 1}`}
                  >
                    <Image src={src} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="secondary">
                  {isLand ? "Land" : listing.listing_category || listing.property_type || "House"}
                </Badge>
                {isRental && <Badge className="bg-violet-700">For rent</Badge>}
                {listing.is_featured && <Badge className="bg-amber-600">Featured</Badge>}
                <VerificationBadge status={listing.verification_status} />
                {listing.government_verified && <Badge className="bg-emerald-800">Government verified</Badge>}
                {listing.trust_score != null && <Badge variant="outline">Trust {listing.trust_score}</Badge>}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">{listing.name}</h1>
              {listing.verification_code && (
                <p className="text-xs font-mono text-muted-foreground mt-2">Property ID: {listing.verification_code}</p>
              )}
              <p className="text-3xl font-bold text-primary mt-3">
                {isRental ? formatRentalPrice(listing.price) : formatMarketplacePrice(listing.price)}
              </p>
              {listing.old_price != null && listing.old_price > listing.price && (
                <p className="text-sm text-muted-foreground line-through">
                  Was {formatMarketplacePrice(listing.old_price)}
                </p>
              )}
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
                {listing.parking_spaces != null && (
                  <span className="inline-flex items-center gap-1.5">
                    <Car className="h-4 w-4" /> {listing.parking_spaces} parking
                  </span>
                )}
                {listing.slots_available != null && (
                  <Badge variant="outline">{listing.slots_available} slots remaining</Badge>
                )}
                {listing.rental_units_available != null && (
                  <Badge variant="outline">{listing.rental_units_available} units available</Badge>
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

            {amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Amenities & features</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {amenities.map((a) => (
                    <Badge key={a} variant="secondary">
                      {a}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            )}

            {isLand && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Land details</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
                  <p>
                    Coordinates:{" "}
                    {listing.lat != null && listing.lng != null
                      ? `${listing.lat}, ${listing.lng}`
                      : "Not published"}
                  </p>
                  <p>Title status: {(meta.title_status as string) || "See documents with vendor"}</p>
                  <p>Survey plan: {(meta.survey_plan as string) || "Available on verified request"}</p>
                  <p>C of O: {(meta.c_of_o as string) || "Confirm with vendor"}</p>
                  <p>Road access: {(meta.road_access as string) || "—"}</p>
                  <p>Flood risk: {(meta.flood_risk as string) || "—"}</p>
                  <p>Investment score: {(meta.investment_score as string) || listing.trust_score || "—"}</p>
                </CardContent>
              </Card>
            )}

            {listing.lat != null && listing.lng != null && (
              <ListingMap listings={[listing]} center={{ lat: listing.lat, lng: listing.lng }} enabled height={280} />
            )}

            {listing.verification_history && listing.verification_history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Verification timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {listing.verification_history.map((h) => (
                    <div key={h.id} className="border-l-2 border-primary/40 pl-3 text-sm">
                      <p className="font-medium capitalize">{h.action || "update"}</p>
                      <p className="text-muted-foreground">{h.notes}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {h.actor ? `${h.actor} · ` : ""}
                        {h.created_at ? new Date(h.created_at).toLocaleString() : ""}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {listing.rental_units && listing.rental_units.units && listing.rental_units.units.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Available rental units</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    {listing.rental_units.available_count} unit
                    {listing.rental_units.available_count === 1 ? "" : "s"} available
                    {listing.rental_units.min_rent != null
                      ? ` · from ${formatMarketplacePrice(listing.rental_units.min_rent)}/mo`
                      : ""}
                  </p>
                  <ul className="divide-y">
                    {listing.rental_units.units.slice(0, 8).map((u) => (
                      <li key={u.id} className="py-2 flex justify-between gap-2">
                        <span>
                          {u.unit_label || u.unit_number || "Unit"} · {u.status || "—"}
                        </span>
                        {u.rent_amount != null && (
                          <span className="font-medium">{formatMarketplacePrice(u.rent_amount)}/mo</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <ListingReviews listing={listing} />

            {similar.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Similar listings</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {similar.slice(0, 4).map((s) => (
                    <MarketplaceListingCard key={`${s.tenant_slug}-${s.id}`} listing={s} />
                  ))}
                </div>
              </div>
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
                <ListingInquiryDialog listing={listing} />
                <ListingInquiryDialog listing={listing} mode="viewing" triggerLabel="Book inspection" />
                <Button asChild variant="outline" className="w-full">
                  <a href={tenantLogin}>Continue to express interest</a>
                </Button>
                <ShareListingDialog listing={listing} />
                <FraudReportDialog listing={listing} />
              </CardContent>
            </Card>
            <QrVerifyPanel listing={listing} />
            {!isRental && <MortgageCalculatorPanel defaultPrincipal={listing.price} />}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Investment snapshot</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>Price: {formatMarketplacePrice(listing.price)}</p>
                <p>Trust score: {listing.trust_score ?? "Pending computation"}</p>
                <p>Verification score: {listing.verification_score ?? "—"}</p>
                <p>Purpose: {listing.listing_purpose || (isRental ? "rent" : "sale")}</p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
