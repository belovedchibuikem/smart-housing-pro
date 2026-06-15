"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Home, Maximize } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { resolveStorageUrl } from "@/lib/api/config"
import { LandingHeader } from "@/components/landing/landing-header"
import {
  fetchPublicProperties,
  formatPropertyPrice,
  propertyDetailPath,
  type PublicPropertyListing,
} from "@/lib/api/public-properties"

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PublicPropertyListing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [propertyType, setPropertyType] = useState("all")
  const [priceRange, setPriceRange] = useState("all")
  const [location, setLocation] = useState("all")

  useEffect(() => {
    fetchPublicProperties()
      .then(setProperties)
      .finally(() => setLoading(false))
  }, [])

  const locations = useMemo(() => {
    const values = new Set<string>()
    properties.forEach((property) => {
      const parts = property.location.split(",").map((part) => part.trim()).filter(Boolean)
      if (parts[0]) values.add(parts[0])
    })
    return Array.from(values).sort()
  }, [properties])

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType =
      propertyType === "all" ||
      (propertyType === "House" && property.listing_kind === "house") ||
      (propertyType === "Land" &&
        (property.listing_kind === "land_parcel" || property.listing_kind === "land_legacy"))

    const matchesLocation = location === "all" || property.location.includes(location)

    let matchesPrice = true
    if (priceRange === "0-20m") matchesPrice = property.price <= 20000000
    else if (priceRange === "20m-40m") matchesPrice = property.price > 20000000 && property.price <= 40000000
    else if (priceRange === "40m+") matchesPrice = property.price > 40000000

    return matchesSearch && matchesType && matchesLocation && matchesPrice
  })

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader isTenantPage={true} />

      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge className="mb-4" variant="secondary">
            <Home className="h-3 w-3 mr-1" />
            All Properties
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse All Properties</h1>
          <p className="text-muted-foreground text-lg">
            Explore available houses and land parcels from your cooperative.
          </p>
        </div>

        <div className="mb-8 space-y-4 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger>
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="House">House</SelectItem>
                <SelectItem value="Land">Land</SelectItem>
              </SelectContent>
            </Select>

            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="0-20m">₦0 - ₦20M</SelectItem>
                <SelectItem value="20m-40m">₦20M - ₦40M</SelectItem>
                <SelectItem value="40m+">₦40M+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {filteredProperties.length} properties</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setPropertyType("all")
                setPriceRange("all")
                setLocation("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading properties...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredProperties.map((property) => (
              <Card key={`${property.listing_kind}-${property.id}`} className="overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={(property.image && resolveStorageUrl(property.image)) || "/placeholder.svg"}
                    alt={property.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 left-3 bg-background/90 text-foreground capitalize">
                    {property.type}
                  </Badge>
                </div>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-lg line-clamp-1">{property.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Maximize className="h-4 w-4 mr-1" />
                      {property.size}
                    </div>
                    {property.bedrooms != null && (
                      <div className="text-muted-foreground">
                        {property.bedrooms} Beds • {property.bathrooms} Baths
                      </div>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-primary">{formatPropertyPrice(property.price)}</div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Link href={propertyDetailPath(property)} className="w-full">
                    <Button className="w-full" size="sm">
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No properties found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
