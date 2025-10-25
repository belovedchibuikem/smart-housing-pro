"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Ruler, Home, Calendar } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function PropertyDetailsTab() {
  // Mock data - replace with actual data fetching
  const property = {
    id: "1",
    name: "Luxury 3-Bedroom Apartment",
    type: "House",
    description:
      "Modern 3-bedroom apartment with spacious living areas, contemporary finishes, and excellent natural lighting. Located in a prime residential area with easy access to major roads and amenities.",
    price: 25000000,
    size: "150 sqm",
    location: "Maitama, Abuja",
    bedrooms: 3,
    bathrooms: 2,
    status: "Available",
    dateAdded: "2024-01-15",
    images: ["/modern-apartment-exterior.png", "/modern-living-room.png", "/modern-kitchen.png", "/modern-bedroom.png"],
    features: ["24/7 Security", "Parking Space", "Generator", "Water Supply", "Fitted Kitchen", "Balcony"],
  }

  return (
    <div className="space-y-6">
      {/* Image Gallery */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Image
                src={property.images[0] || "/placeholder.svg"}
                alt={property.name}
                width={600}
                height={400}
                className="w-full h-[400px] object-cover rounded-lg"
              />
            </div>
            {property.images.slice(1).map((image, index) => (
              <Image
                key={index}
                src={image || "/placeholder.svg"}
                alt={`${property.name} ${index + 2}`}
                width={300}
                height={200}
                className="w-full h-[200px] object-cover rounded-lg"
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Property Information */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{property.name}</h2>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{property.location}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">₦{property.price.toLocaleString()}</div>
              <Badge variant={property.status === "Available" ? "default" : "secondary"} className="mt-2">
                {property.status}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Type</div>
                <div className="font-semibold">{property.type}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Size</div>
                <div className="font-semibold">{property.size}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Bedrooms</div>
                <div className="font-semibold">{property.bedrooms}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Listed</div>
                <div className="font-semibold">{new Date(property.dateAdded).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{property.description}</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Features & Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {property.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <Link href={`/dashboard/properties/${property.id}/subscribe`}>
              <Button size="lg" className="w-full">
                Subscribe to This Property
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Fill the Expression of Interest form to begin your property subscription
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
