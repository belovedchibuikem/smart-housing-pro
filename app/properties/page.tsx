"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Home, Maximize, Building2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  {
    id: 5,
    name: "2-Bedroom Bungalow",
    type: "House",
    location: "Ibadan, Oyo",
    price: 18000000,
    size: "120 sqm",
    bedrooms: 2,
    bathrooms: 2,
    image: "/modern-bungalow.jpg",
    featured: false,
  },
  {
    id: 6,
    name: "Estate Development Land",
    type: "Land",
    location: "Enugu, Enugu",
    price: 8000000,
    size: "300 sqm",
    image: "/estate-land.jpg",
    featured: false,
  },
]

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [propertyType, setPropertyType] = useState("all")
  const [priceRange, setPriceRange] = useState("all")
  const [location, setLocation] = useState("all")

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = propertyType === "all" || property.type === propertyType
    const matchesLocation = location === "all" || property.location.includes(location)

    let matchesPrice = true
    if (priceRange === "0-20m") matchesPrice = property.price <= 20000000
    else if (priceRange === "20m-40m") matchesPrice = property.price > 20000000 && property.price <= 40000000
    else if (priceRange === "40m+") matchesPrice = property.price > 40000000

    return matchesSearch && matchesType && matchesLocation && matchesPrice
  })

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

      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge className="mb-4" variant="secondary">
            <Home className="h-3 w-3 mr-1" />
            All Properties
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse All Properties</h1>
          <p className="text-muted-foreground text-lg">
            Explore our complete collection of properties. Use filters to find exactly what you're looking for.
          </p>
        </div>

        {/* Search and Filters */}
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
                <SelectItem value="Abuja">Abuja</SelectItem>
                <SelectItem value="Lagos">Lagos</SelectItem>
                <SelectItem value="Port Harcourt">Port Harcourt</SelectItem>
                <SelectItem value="Ibadan">Ibadan</SelectItem>
                <SelectItem value="Enugu">Enugu</SelectItem>
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

        {/* Property Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={property.image || "/placeholder.svg"}
                  alt={property.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {property.featured && <Badge className="absolute top-3 right-3 bg-primary">Featured</Badge>}
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
              <CardFooter className="p-4 pt-0">
                <Link href={`/properties/${property.id}`} className="w-full">
                  <Button className="w-full" size="sm">
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No properties found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
