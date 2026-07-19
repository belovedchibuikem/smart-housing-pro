"use client"

import Image from "next/image"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MapPin,
  Maximize2,
  BedDouble,
  Building2,
  Bath,
  Car,
  Heart,
  Share2,
  GitCompare,
  Eye,
  ShieldCheck,
} from "lucide-react"
import {
  formatMarketplacePrice,
  formatRentalPrice,
  marketplaceListingPath,
  type MarketplaceListing,
} from "@/lib/api/marketplace"
import { VerificationBadge } from "@/components/marketplace/verification-badge"
import { resolveStorageUrl } from "@/lib/api/config"
import { ShareListingDialog } from "@/components/marketplace/share-listing-dialog"

type Props = {
  listing: MarketplaceListing
  onFavorite?: (listing: MarketplaceListing) => void
  favoriteSelected?: boolean
  onCompare?: (listing: MarketplaceListing) => void
  compareSelected?: boolean
}

export function MarketplaceListingCard({ listing, onFavorite, favoriteSelected, onCompare, compareSelected }: Props) {
  const href = marketplaceListingPath(listing)
  const isLand = listing.listing_kind !== "house"
  const isRental = listing.listing_type === "rental" || listing.is_rental
  const hasDualPrice =
    listing.member_price != null &&
    listing.non_member_price != null &&
    Number(listing.member_price) !== Number(listing.non_member_price)
  const images =
    listing.images && listing.images.length > 0
      ? listing.images.map((i) => resolveStorageUrl(i.url) || "/placeholder.jpg")
      : [resolveStorageUrl(listing.image) || "/placeholder.jpg"]

  const [emblaRef] = useEmblaCarousel({ loop: images.length > 1 })

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow border-border/60">
      <div className="relative aspect-[4/3] bg-muted overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((src, idx) => (
            <Link key={`${src}-${idx}`} href={href} className="relative min-w-0 flex-[0_0_100%] h-full">
              <Image
                src={src}
                alt={`${listing.name} photo ${idx + 1}`}
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                sizes="(max-width:768px) 100vw, 33vw"
              />
            </Link>
          ))}
        </div>
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[85%]">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur text-xs">
            {isLand ? "Land" : listing.listing_category || listing.property_type || "House"}
          </Badge>
          {isRental && <Badge className="bg-violet-700 hover:bg-violet-700 text-xs">For rent</Badge>}
          {listing.is_featured && <Badge className="bg-amber-600 hover:bg-amber-600 text-xs">Featured</Badge>}
          {listing.is_premium && <Badge className="bg-slate-900 hover:bg-slate-900 text-xs">Premium</Badge>}
          {listing.is_verified && <VerificationBadge status="verified" />}
          {listing.government_verified && (
            <Badge className="bg-emerald-800 hover:bg-emerald-800 gap-1 text-xs">
              <ShieldCheck className="h-3 w-3" /> Gov
            </Badge>
          )}
          {listing.virtual_tour_url && (
            <Badge variant="outline" className="bg-background/90 text-xs">
              360° Tour
            </Badge>
          )}
        </div>
        {(listing.slots_available != null || listing.rental_units_available != null) && (
          <Badge className="absolute bottom-3 right-3 bg-teal-700 hover:bg-teal-700 text-xs">
            {listing.rental_units_available != null
              ? `${listing.rental_units_available} units left`
              : `${listing.slots_available} slots left`}
          </Badge>
        )}
        {listing.trust_score != null && (
          <Badge className="absolute bottom-3 left-3 bg-background/95 text-foreground text-xs">
            Trust {listing.trust_score}
          </Badge>
        )}
      </div>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Link href={href} className="font-semibold text-lg leading-snug hover:text-primary line-clamp-2">
            {listing.name}
          </Link>
        </div>
        {listing.verification_code && (
          <p className="text-[11px] font-mono text-muted-foreground truncate">ID {listing.verification_code}</p>
        )}
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="text-xl font-bold text-primary">
            {isRental ? formatRentalPrice(listing.price) : formatMarketplacePrice(listing.price)}
          </p>
          {listing.old_price != null && listing.old_price > listing.price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatMarketplacePrice(listing.old_price)}
            </span>
          )}
          {listing.is_negotiable && (
            <Badge variant="outline" className="text-[10px]">
              Negotiable
            </Badge>
          )}
        </div>
        {hasDualPrice && !isRental && (
          <p className="text-xs text-muted-foreground">
            Member: {formatMarketplacePrice(Number(listing.member_price))} | Non-member:{" "}
            {formatMarketplacePrice(Number(listing.non_member_price))}
          </p>
        )}
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
          {listing.bathrooms != null && (
            <span className="inline-flex items-center gap-1">
              <Bath className="h-3 w-3" />
              {listing.bathrooms} bath
            </span>
          )}
          {listing.parking_spaces != null && (
            <span className="inline-flex items-center gap-1">
              <Car className="h-3 w-3" />
              {listing.parking_spaces} park
            </span>
          )}
        </div>
        {(listing.agent_name || listing.tenant_name) && (
          <p className="text-xs text-muted-foreground truncate">
            {listing.agent_name ? `Agent: ${listing.agent_name}` : null}
            {listing.agent_name && listing.tenant_name ? " · " : null}
            Vendor: {listing.tenant_name}
          </p>
        )}
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-0 flex flex-col gap-3">
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
        <div className="flex flex-wrap gap-1 w-full">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 px-2"
            aria-label="Save listing"
            onClick={() => onFavorite?.(listing)}
          >
            <Heart className={`h-4 w-4 ${favoriteSelected ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={compareSelected ? "secondary" : "ghost"}
            className="h-8 px-2"
            aria-label="Compare listing"
            onClick={() => onCompare?.(listing)}
          >
            <GitCompare className="h-4 w-4" />
          </Button>
          <ShareListingDialog listing={listing}>
            <Button type="button" size="sm" variant="ghost" className="h-8 px-2" aria-label="Share listing">
              <Share2 className="h-4 w-4" />
            </Button>
          </ShareListingDialog>
          <Button asChild size="sm" variant="outline" className="h-8 ml-auto gap-1">
            <Link href={href}>
              <Eye className="h-3.5 w-3.5" /> View
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
