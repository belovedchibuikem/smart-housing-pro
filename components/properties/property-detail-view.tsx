"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  MapPin,
  Maximize,
  ArrowLeft,
  Trees,
  Building2,
  Heart,
  ShieldCheck,
  BedDouble,
  Bath,
  CalendarDays,
} from "lucide-react"
import { resolveStorageUrl } from "@/lib/api/config"
import { LandingHeader } from "@/components/landing/landing-header"
import {
  formatPropertyPrice,
  isLandListing,
  propertyDetailPath,
  type PublicPropertyListing,
} from "@/lib/api/public-properties"
import { PropertyTypePriceRow } from "@/components/properties/property-type-price-row"
import { getPropertyTypeLabel } from "@/lib/properties/property-type-label"
import { useWhiteLabel } from "@/lib/context/white-label-context"
import { useTenantSettings } from "@/lib/context/tenant-settings-context"
import { useTenant } from "@/lib/tenant/tenant-context"
import { SharePublicPropertyDialog } from "@/components/properties/share-public-property-dialog"
import { PublicPropertyRequestDialog } from "@/components/properties/public-property-request-dialog"

interface PropertyDetailViewProps {
  property: PublicPropertyListing
}

export function PropertyDetailView({ property }: PropertyDetailViewProps) {
  const [downPayment, setDownPayment] = useState<number>(Math.round(property.price * 0.2))
  const [ratePercent, setRatePercent] = useState<number>(18)
  const [termYears, setTermYears] = useState<number>(20)
  const { settings } = useWhiteLabel()
  const { settings: tenantSettings } = useTenantSettings()
  const { isWishlisted, toggleWishlist } = useTenant()
  const isLand = isLandListing(property)
  const galleryImages = (property.images?.length ? property.images : property.image ? [{ url: property.image }] : [])
    .map((img) => resolveStorageUrl(typeof img === "string" ? img : img.url))
    .filter(Boolean) as string[]

  const primaryImage = galleryImages[0] || "/placeholder.svg"
  const featureList = property.features?.length
    ? property.features
    : property.land_features?.length
      ? property.land_features
      : []
  const slotsRemaining = property.slots_available ?? null
  const loanAmount = Math.max(0, property.price - Math.max(0, downPayment || 0))
  const monthlyRate = Math.max(0, ratePercent || 0) / 100 / 12
  const totalMonths = Math.max(1, Math.round((termYears || 1) * 12))
  const monthlyPayment =
    monthlyRate === 0
      ? loanAmount / totalMonths
      : (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths))
  const totalRepayment = monthlyPayment * totalMonths
  const supportEmail =
    settings?.support_email || tenantSettings?.support_email || tenantSettings?.site_email || "support@smarthousing.com.ng"

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader isTenantPage={true} />

      <div className="container mx-auto px-4 py-8">
        <Link href="/properties">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
        </Link>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image src={primaryImage} alt={property.name} fill className="object-cover" />
                <Badge className="absolute top-4 left-4 bg-background/90 text-foreground capitalize">
                  {getPropertyTypeLabel(property)}
                </Badge>
                <Badge className="absolute top-4 right-4 bg-emerald-700 hover:bg-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Verified
                </Badge>
              </div>
              {galleryImages.length > 1 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {galleryImages.slice(1, 9).map((img, idx) => (
                    <div key={idx} className="relative h-24 rounded-lg overflow-hidden">
                      <Image src={img} alt={`${property.name} ${idx + 2}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="mb-4 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {isLand ? "land parcel" : property.type || "house"}
                      </Badge>
                      {slotsRemaining != null && <Badge variant="outline">{slotsRemaining} slots remaining</Badge>}
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <h1 className="text-3xl font-bold mb-2">{property.name}</h1>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={isWishlisted(property.id, property.listing_kind) ? "Remove from wishlist" : "Add to wishlist"}
                        onClick={() => toggleWishlist({ id: property.id, listingKind: property.listing_kind })}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            isWishlisted(property.id, property.listing_kind) ? "fill-red-500 text-red-500" : ""
                          }`}
                        />
                      </Button>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1 shrink-0" />
                      {property.location}
                    </div>
                    {property.land_code && (
                      <p className="text-sm text-muted-foreground mt-1">Code: {property.land_code}</p>
                    )}
                  </div>
                  <PropertyTypePriceRow
                    typeLabel={getPropertyTypeLabel(property)}
                    price={formatPropertyPrice(property.price)}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Size</div>
                    <div className="font-semibold flex items-center">
                      <Maximize className="h-4 w-4 mr-1" />
                      {property.land_size || property.size || "N/A"}
                    </div>
                  </div>
                  {!isLand && property.bedrooms != null && (
                    <>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Bedrooms</div>
                        <div className="font-semibold inline-flex items-center gap-1">
                          <BedDouble className="h-4 w-4" /> {property.bedrooms}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Bathrooms</div>
                        <div className="font-semibold inline-flex items-center gap-1">
                          <Bath className="h-4 w-4" /> {property.bathrooms}
                        </div>
                      </div>
                    </>
                  )}
                  {isLand && property.suitable_for && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Suitable For</div>
                      <div className="font-semibold flex items-center">
                        <Trees className="h-4 w-4 mr-1" />
                        {property.suitable_for}
                      </div>
                    </div>
                  )}
                </div>

                {property.description && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Description</h2>
                    <p className="text-muted-foreground leading-relaxed">{property.description}</p>
                  </div>
                )}

                {isLand && property.cost_includes_infrastructure != null && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Infrastructure</h2>
                    <p className="text-muted-foreground">
                      {property.cost_includes_infrastructure
                        ? "Cost includes infrastructure development."
                        : "Infrastructure costs are separate from the listed price."}
                    </p>
                  </div>
                )}

                {featureList.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3">
                      {isLand ? "Land Features" : "Features & Amenities"}
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {featureList.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  {settings?.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveStorageUrl(settings.logo_url) || ""}
                      alt={`${settings.company_name || "Cooperative"} logo`}
                      className="h-11 w-11 rounded-full border object-cover"
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-muted flex items-center justify-center">
                      <Building2 className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold leading-tight">{settings?.company_name || "Housing Cooperative"}</p>
                    <p className="text-xs text-muted-foreground">Cooperative</p>
                  </div>
                </div>
                <PublicPropertyRequestDialog property={property} mode="inquiry" triggerLabel="Send inquiry" />
                <PublicPropertyRequestDialog
                  property={property}
                  mode="inspection"
                  triggerLabel="Book inspection"
                  triggerVariant="outline"
                />
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href={`/register?next=${encodeURIComponent(propertyDetailPath(property))}`}>
                    Continue to express interest
                  </Link>
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <SharePublicPropertyDialog property={property}>
                    <Button type="button" variant="outline" className="w-full">
                      Share
                    </Button>
                  </SharePublicPropertyDialog>
                  <Button asChild type="button" variant="outline" className="w-full text-destructive">
                    <a
                      href={`mailto:${supportEmail}?subject=${encodeURIComponent(
                        `Report listing - ${property.name}`
                      )}&body=${encodeURIComponent(
                        `Please review this listing:\nProperty: ${property.name}\nProperty ID: ${property.id}\nKind: ${property.listing_kind}\nReason:\n`
                      )}`}
                    >
                      Report listing
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Verify authenticity</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Use this property reference when contacting support or confirming listing details on-site.
                </p>
                <div className="rounded-lg border bg-muted/30 px-4 py-5 text-center">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Property reference</p>
                  <p className="font-mono font-semibold mt-1">{property.land_code || property.id}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Keep this ID handy while submitting your inquiry or inspection request.
                </p>
              </CardContent>
            </Card>

            {!isLand && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Mortgage calculator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Property price (N)</label>
                    <Input value={property.price} disabled />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Down payment (N)</label>
                    <Input
                      type="number"
                      min={0}
                      max={property.price}
                      value={downPayment}
                      onChange={(e) => setDownPayment(Number(e.target.value || 0))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Rate % / year</label>
                      <Input
                        type="number"
                        min={0}
                        step="0.1"
                        value={ratePercent}
                        onChange={(e) => setRatePercent(Number(e.target.value || 0))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Term (years)</label>
                      <Input
                        type="number"
                        min={1}
                        value={termYears}
                        onChange={(e) => setTermYears(Number(e.target.value || 1))}
                      />
                    </div>
                  </div>
                  <div className="rounded-lg border bg-muted/30 px-3 py-2 space-y-1">
                    <p>Loan amount: {formatPropertyPrice(loanAmount)}</p>
                    <p>Monthly payment: {formatPropertyPrice(Number.isFinite(monthlyPayment) ? monthlyPayment : 0)}</p>
                    <p>Total interest: {formatPropertyPrice(Math.max(0, totalRepayment - loanAmount))}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Investment snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>Price: {formatPropertyPrice(property.price)}</p>
                <p>Status: {property.status || "available"}</p>
                <p>Type: {getPropertyTypeLabel(property)}</p>
                <p className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Listed slots left: {slotsRemaining ?? "N/A"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
