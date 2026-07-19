"use client"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Home, Maximize, Heart } from "lucide-react"
import { resolveStorageUrl } from "@/lib/api/config"
import { formatPropertyPrice, propertyDetailPath, type PublicPropertyListing } from "@/lib/api/public-properties"
import { PropertyTypePriceRow } from "@/components/properties/property-type-price-row"
import { getPropertyTypeLabel } from "@/lib/properties/property-type-label"
import { SharePublicPropertyDialog } from "@/components/properties/share-public-property-dialog"
import { useTenant } from "@/lib/tenant/tenant-context"

interface PropertyListingsProps {
  properties?: PublicPropertyListing[]
  config?: {
    title?: string
    subtitle?: string
    limit?: number
  }
}

export function PropertyListings({ properties = [], config }: PropertyListingsProps) {
  // Use provided properties or fallback to empty array
  const displayProperties = properties.slice(0, config?.limit || 6)
  const { isWishlisted, toggleWishlist } = useTenant()

  const formatPrice = formatPropertyPrice

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge className="mb-4" variant="secondary">
            <Home className="h-3 w-3 mr-1" />
            {config?.title || "Featured Properties"}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{config?.title || "Find Your Dream Property"}</h2>
          <p className="text-muted-foreground text-lg">
            {config?.subtitle || "Browse our exclusive collection of properties across Nigeria. Quality homes and land at affordable prices."}
          </p>
        </div>

        {/* Property Grid */}
        {displayProperties.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {displayProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={(property.image && resolveStorageUrl(property.image)) || "/placeholder.svg"}
                  alt={property.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <Badge className="absolute top-3 left-3 max-w-[85%] truncate bg-background/90 text-foreground">
                  {getPropertyTypeLabel(property)}
                </Badge>
              </div>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-lg line-clamp-1">{property.name}</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1 shrink-0" />
                  <span className="line-clamp-1">{property.location}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Maximize className="h-4 w-4 mr-1" />
                    {property.size}
                  </div>
                  {property.bedrooms && (
                    <div className="text-muted-foreground">
                      {property.bedrooms} Beds • {property.bathrooms} Baths
                    </div>
                  )}
                </div>
                <PropertyTypePriceRow
                  size="compact"
                  splitOnMobile
                  typeLabel={getPropertyTypeLabel(property)}
                  typeHeading="Type"
                  priceHeading="Price"
                  price={formatPrice(property.price)}
                />
                {property.non_member_price != null && property.member_price != null && (
                  <p className="text-xs text-muted-foreground">
                    Member: {formatPrice(property.member_price)} | Non-member: {formatPrice(property.non_member_price)}
                  </p>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="px-2.5"
                  aria-label={isWishlisted(property.id, property.listing_kind) ? "Remove from wishlist" : "Add to wishlist"}
                  onClick={() => toggleWishlist({ id: property.id, listingKind: property.listing_kind })}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isWishlisted(property.id, property.listing_kind) ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </Button>
                <SharePublicPropertyDialog property={property}>
                  <Button type="button" variant="outline" size="sm">
                    Share
                  </Button>
                </SharePublicPropertyDialog>
                <Link href={propertyDetailPath(property)} className="flex-1">
                  <Button className="w-full" size="sm">
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No properties available at the moment.</p>
          </div>
        )}

        {/* View All Button */}
        {displayProperties.length > 0 && (
          <div className="text-center">
            <Link href="/properties">
              <Button size="lg" variant="outline">
                View All Properties
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
