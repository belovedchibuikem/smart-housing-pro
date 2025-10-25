import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Bed, Bath, Square, TrendingUp } from "lucide-react"
import Link from "next/link"

export function PropertyListings() {
  const properties = [
    {
      id: "PROP-001",
      title: "Modern 3-Bedroom Apartment",
      location: "Lekki Phase 1, Lagos",
      price: 45000000,
      totalShares: 100,
      availableShares: 35,
      minInvestment: 450000,
      expectedReturn: "12-15%",
      bedrooms: 3,
      bathrooms: 3,
      area: 150,
      status: "available",
      image: "/modern-apartment-building.png",
    },
    {
      id: "PROP-002",
      title: "Luxury 4-Bedroom Duplex",
      location: "Victoria Island, Lagos",
      price: 85000000,
      totalShares: 100,
      availableShares: 20,
      minInvestment: 850000,
      expectedReturn: "15-18%",
      bedrooms: 4,
      bathrooms: 5,
      area: 280,
      status: "available",
      image: "/luxury-duplex-house.jpg",
    },
    {
      id: "PROP-003",
      title: "Executive 2-Bedroom Flat",
      location: "Ikeja GRA, Lagos",
      price: 28000000,
      totalShares: 100,
      availableShares: 50,
      minInvestment: 280000,
      expectedReturn: "10-12%",
      bedrooms: 2,
      bathrooms: 2,
      area: 95,
      status: "available",
      image: "/executive-apartment.jpg",
    },
    {
      id: "PROP-004",
      title: "5-Bedroom Detached House",
      location: "Ikoyi, Lagos",
      price: 120000000,
      totalShares: 100,
      availableShares: 8,
      minInvestment: 1200000,
      expectedReturn: "18-20%",
      bedrooms: 5,
      bathrooms: 6,
      area: 400,
      status: "limited",
      image: "/detached-house-mansion.jpg",
    },
  ]

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {properties.map((property) => (
        <Card key={property.id} className="overflow-hidden">
          <div className="relative">
            <img src={property.image || "/placeholder.svg"} alt={property.title} className="w-full h-48 object-cover" />
            <Badge className="absolute top-3 right-3">
              {property.status === "limited" ? "Limited Shares" : "Available"}
            </Badge>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-xl font-bold mb-1">{property.title}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {property.location}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <span>{property.bedrooms} Beds</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4 text-muted-foreground" />
                <span>{property.bathrooms} Baths</span>
              </div>
              <div className="flex items-center gap-1">
                <Square className="h-4 w-4 text-muted-foreground" />
                <span>{property.area}m²</span>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Property Value</span>
                <span className="font-semibold">₦{property.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Min. Investment</span>
                <span className="font-semibold">₦{property.minInvestment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available Shares</span>
                <span className="font-semibold">
                  {property.availableShares}/{property.totalShares}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expected Return</span>
                <span className="font-semibold text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {property.expectedReturn}
                </span>
              </div>
            </div>

            <Link href={`/dashboard/properties/${property.id}`}>
              <Button className="w-full">View Details & Invest</Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  )
}
