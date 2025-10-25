import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Bed, Bath, Square, Calendar, TrendingUp, Home, Shield } from "lucide-react"

export function PropertyDetails() {
  const property = {
    id: "PROP-001",
    title: "Modern 3-Bedroom Apartment",
    location: "Lekki Phase 1, Lagos",
    price: 45000000,
    bedrooms: 3,
    bathrooms: 3,
    area: 150,
    yearBuilt: 2023,
    expectedReturn: "12-15%",
    status: "available",
    description:
      "A beautifully designed modern apartment in the heart of Lekki Phase 1. This property features contemporary finishes, spacious rooms, and access to premium amenities including a swimming pool, gym, and 24/7 security.",
    features: [
      "Fully fitted kitchen",
      "Air conditioning",
      "Parking space",
      "Swimming pool",
      "Gym facility",
      "24/7 Security",
      "Backup generator",
      "Water treatment plant",
    ],
    images: [
      "/modern-apartment-living-room.png",
      "/modern-apartment-bedroom.png",
      "/modern-apartment-kitchen.png",
      "/modern-apartment-bathroom.png",
    ],
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <img src={property.images[0] || "/placeholder.svg"} alt={property.title} className="w-full h-96 object-cover" />
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">{property.location}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Property Value</p>
              <p className="text-3xl font-bold">₦{property.price.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 py-4 border-y">
            <div className="flex items-center gap-2">
              <Bed className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{property.bedrooms} Bedrooms</span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{property.bathrooms} Bathrooms</span>
            </div>
            <div className="flex items-center gap-2">
              <Square className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{property.area}m²</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Built {property.yearBuilt}</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Expected Return</p>
                <p className="font-semibold">{property.expectedReturn}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Home className="h-8 w-8 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Property Type</p>
                <p className="font-semibold">Apartment</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge>{property.status}</Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="description" className="space-y-4">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>

        <TabsContent value="description">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-3">About This Property</h3>
            <p className="text-muted-foreground leading-relaxed">{property.description}</p>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Property Features</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {property.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="gallery">
          <div className="grid sm:grid-cols-2 gap-4">
            {property.images.map((image, index) => (
              <Card key={index} className="overflow-hidden">
                <img
                  src={image || "/placeholder.svg"}
                  alt={`Property view ${index + 1}`}
                  className="w-full h-64 object-cover"
                />
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
