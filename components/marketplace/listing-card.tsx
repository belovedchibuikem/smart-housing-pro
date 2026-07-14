"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Maximize2, BedDouble, Building2 } from "lucide-react"
import {
  formatMarketplacePrice,
  formatRentalPrice,
  marketplaceListingPath,
  type MarketplaceListing,
} from "@/lib/api/marketplace"
import { VerificationBadge } from "@/components/marketplace/verification-badge"
import { resolveStorageUrl } from "@/lib/api/config"

export function MarketplaceListingCard({ listing }: { listing: MarketplaceListing }) {
  const href = marketplaceListingPath(listing)
  const image = resolveStorageUrl(listing.image) || "/placeholder.jpg"
  const isLand = listing.listing_kind !== "house"
  const isRental = listing.listing_type === "rental" || listing.is_rental

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow border-border/60">
      <Link href={href} className="block">
        <div className="relative aspect-[4/3] bg-muted">
          <Image
            src={image}
            alt={listing.name}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            sizes="(max-width:768px) 100vw, 33vw"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur">
              {isLand ? "Land" : "House"}
            </Badge>
            {isRental && (
              <Badge className="bg-violet-700 hover:bg-violet-700">For rent</Badge>
            )}
            {listing.is_verified && <VerificationBadge status="verified" />}
          </div>
          {listing.slots_available != null && (
            <Badge className="absolute bottom-3 right-3 bg-teal-700 hover:bg-teal-700">
              {listing.slots_available} slot{listing.slots_available === 1 ? "" : "s"} left
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Link href={href} className="font-semibold text-lg leading-snug hover:text-primary line-clamp-2">
            {listing.name}
          </Link>
        </div>
        <p className="text-xl font-bold text-primary">
          {isRental ? formatRentalPrice(listing.price) : formatMarketplacePrice(listing.price)}
        </p>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{listing.location || "Location not specified"}</span>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
          {(listing.size_sqm || listing.size) && (
            <span className="inline-flex items-center gap-1">
              <Maximize2 className="h-3 w-3" />
              {listing.size_sqm || listing.size} m²
            </span>
          )}
          {listing.bedrooms != null && (
            <span className="inline-flex items-center gap-1">
              <BedDouble className="h-3 w-3" />
              {listing.bedrooms} bed
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground w-full min-w-0">
          {listing.tenant_logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveStorageUrl(listing.tenant_logo_url) || ""}
              alt=""
              className="h-6 w-6 rounded-full object-cover border"
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
              <Building2 className="h-3 w-3" />
            </div>
          )}
          <span className="truncate font-medium">{listing.tenant_name}</span>
        </div>
      </CardFooter>
    </Card>
  )
}
