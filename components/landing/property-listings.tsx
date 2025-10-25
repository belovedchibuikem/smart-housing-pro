"use client"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Home, Maximize } from "lucide-react"

const properties = [
  {
    id: 1,
    name: "Luxury 3-Bedroom Apartment",
    type: "House",
    location: "Abuja, FCT",
    price: 25000000,
    size: "180 sqm",
    bedrooms: 3,
    bathrooms: 2,
    image: "/modern-apartment-exterior.png",
    featured: true,
  },
  {
    id: 2,
    name: "Prime Residential Land",
    type: "Land",
    location: "Lagos, Lekki",
    price: 15000000,
    size: "500 sqm",
    image: "/residential-land-plot.jpg",
    featured: true,
  },
  {
    id: 3,
    name: "4-Bedroom Duplex",
    type: "House",
    location: "Port Harcourt, Rivers",
    price: 35000000,
    size: "250 sqm",
    bedrooms: 4,
    bathrooms: 3,
    image: "/modern-duplex.png",
    featured: false,
  },
  {
    id: 4,
    name: "Commercial Land",
    type: "Land",
    location: "Abuja, Maitama",
    price: 45000000,
    size: "1000 sqm",
    image: "/commercial-land.png",
    featured: true,
  },
]

export function PropertyListings() {
  const featuredProperties = properties.filter((p) => p.featured).slice(0, 4)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge className="mb-4" variant="secondary">
            <Home className="h-3 w-3 mr-1" />
            Featured Properties
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Find Your Dream Property</h2>
          <p className="text-muted-foreground text-lg">
            Browse our exclusive collection of properties across Nigeria. Quality homes and land at affordable prices.
          </p>
        </div>

        {/* Property Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {featuredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={property.image || "/placeholder.svg"}
                  alt={property.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <Badge className="absolute top-3 right-3 bg-primary">Featured</Badge>
                <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">{property.type}</Badge>
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
                  {property.bedrooms && (
                    <div className="text-muted-foreground">
                      {property.bedrooms} Beds • {property.bathrooms} Baths
                    </div>
                  )}
                </div>
                <div className="text-2xl font-bold text-primary">{formatPrice(property.price)}</div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Link href={`/properties/${property.id}`} className="flex-1">
                  <Button className="w-full" size="sm">
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link href="/properties">
            <Button size="lg" variant="outline">
              View All Properties
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
