import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Maximize, Building2, ArrowLeft, Phone, Mail, Share2 } from "lucide-react"
import { notFound } from "next/navigation"

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
    description:
      "A luxurious 3-bedroom apartment in the heart of Abuja. Features modern amenities, spacious rooms, and excellent finishing. Perfect for families looking for comfort and style.",
    features: ["24/7 Security", "Swimming Pool", "Gym", "Parking Space", "Generator", "Water Supply"],
    images: ["/modern-apartment-exterior.png", "/modern-duplex.png", "/modern-bungalow.jpg"],
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
    description:
      "Prime residential land in the rapidly developing Lekki area. Perfect for building your dream home or investment property. Clear title documents available.",
    features: ["Fenced", "Gated Estate", "Good Road Network", "Electricity", "Water", "C of O"],
    images: ["/residential-land-plot.jpg", "/estate-land.jpg", "/commercial-land.png"],
  },
]

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = properties.find((p) => p.id === Number.parseInt(params.id))

  if (!property) {
    notFound()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-bold text-xl">FRSC HMS</h1>
              <p className="text-xs text-muted-foreground">Housing Management System</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/properties">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image src={property.image || "/placeholder.svg"} alt={property.name} fill className="object-cover" />
                {property.featured && <Badge className="absolute top-4 right-4 bg-primary">Featured</Badge>}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {property.images?.slice(1, 4).map((img, idx) => (
                  <div key={idx} className="relative h-24 rounded-lg overflow-hidden">
                    <Image
                      src={img || "/placeholder.svg"}
                      alt={`${property.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Property Details */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{property.name}</h1>
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {property.location}
                      </div>
                    </div>
                    <Badge variant="secondary">{property.type}</Badge>
                  </div>
                  <div className="text-3xl font-bold text-primary">{formatPrice(property.price)}</div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Size</div>
                    <div className="font-semibold flex items-center">
                      <Maximize className="h-4 w-4 mr-1" />
                      {property.size}
                    </div>
                  </div>
                  {property.bedrooms && (
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
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Type</div>
                    <div className="font-semibold">{property.type}</div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">Description</h2>
                  <p className="text-muted-foreground leading-relaxed">{property.description}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">Features & Amenities</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {property.features?.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Interested in this property?</h3>
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
                <h3 className="font-semibold">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>+234 800 000 0000</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>info@frschms.com</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Property
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
