"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Maximize, ArrowLeft, Phone, Mail, Share2, Trees } from "lucide-react"
import { resolveStorageUrl } from "@/lib/api/config"
import { LandingHeader } from "@/components/landing/landing-header"
import {
  formatPropertyPrice,
  isLandListing,
  type PublicPropertyListing,
} from "@/lib/api/public-properties"

interface PropertyDetailViewProps {
  property: PublicPropertyListing
}

export function PropertyDetailView({ property }: PropertyDetailViewProps) {
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

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image src={primaryImage} alt={property.name} fill className="object-cover" />
                <Badge className="absolute top-4 left-4 bg-background/90 text-foreground capitalize">
                  {isLand ? "land" : property.type || "house"}
                </Badge>
              </div>
              {galleryImages.length > 1 && (
                <div className="grid grid-cols-3 gap-4">
                  {galleryImages.slice(1, 4).map((img, idx) => (
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
                  <div className="flex items-start justify-between mb-4 gap-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{property.name}</h1>
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1 shrink-0" />
                        {property.location}
                      </div>
                      {property.land_code && (
                        <p className="text-sm text-muted-foreground mt-1">Code: {property.land_code}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className="capitalize shrink-0">
                      {isLand ? "land" : property.type || "house"}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-primary">{formatPropertyPrice(property.price)}</div>
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
                        <div className="font-semibold">{property.bedrooms}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Bathrooms</div>
                        <div className="font-semibold">{property.bathrooms}</div>
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
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Type</div>
                    <div className="font-semibold capitalize">{isLand ? "Land" : "House"}</div>
                  </div>
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
                <h3 className="font-semibold text-lg">Interested in this {isLand ? "land parcel" : "property"}?</h3>
                <p className="text-sm text-muted-foreground">
                  Register or login to express your interest and get more information.
                </p>
                <Link href="/register" className="block">
                  <Button className="w-full" size="lg">
                    Express Interest
                  </Button>
                </Link>
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full bg-transparent">
                    Login to View More
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">Need Help?</h3>
                <p className="text-sm text-muted-foreground">
                  Contact the cooperative office for viewing arrangements and allocation details.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>Reach out via your member portal after registration</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>Support available to registered members</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Listing
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
