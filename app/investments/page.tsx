"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, Calendar, MapPin, Home, Coins, Building2 } from "lucide-react"

const investments = [
  {
    id: 1,
    name: "High-Yield Savings Plan",
    type: "Money",
    roi: 15,
    minInvestment: 500000,
    duration: "12 months",
    closingDate: "2025-12-31",
    status: "Open",
    description: "Secure cash investment with guaranteed returns",
    icon: Coins,
  },
  {
    id: 2,
    name: "Lekki Estate Development",
    type: "Land",
    roi: 25,
    minInvestment: 2000000,
    duration: "24 months",
    closingDate: "2025-06-30",
    status: "Open",
    location: "Lagos, Lekki",
    size: "300 sqm plots",
    image: "/estate-development-land.jpg",
    description: "Prime estate land with high appreciation potential",
  },
  {
    id: 3,
    name: "Abuja Housing Project",
    type: "House",
    roi: 30,
    minInvestment: 5000000,
    duration: "36 months",
    closingDate: "2025-09-30",
    status: "Open",
    location: "Abuja, Gwarinpa",
    units: "50 units",
    image: "/housing-project-development.jpg",
    description: "Modern housing development in prime location",
  },
]

export default function InvestmentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [investmentType, setInvestmentType] = useState("all")

  const filteredInvestments = investments.filter((investment) => {
    const matchesSearch =
      investment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      investment.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = investmentType === "all" || investment.type === investmentType

    return matchesSearch && matchesType
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Money":
        return Coins
      case "Land":
        return MapPin
      case "House":
        return Home
      default:
        return TrendingUp
    }
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
            <TrendingUp className="h-3 w-3 mr-1" />
            All Investment Opportunities
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Investment Opportunities</h1>
          <p className="text-muted-foreground text-lg">
            Explore all available investment plans with attractive returns and flexible terms.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4 max-w-5xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search investments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={investmentType === "all" ? "default" : "outline"}
              onClick={() => setInvestmentType("all")}
              size="sm"
            >
              All Investments
            </Button>
            <Button
              variant={investmentType === "Money" ? "default" : "outline"}
              onClick={() => setInvestmentType("Money")}
              size="sm"
            >
              <Coins className="h-4 w-4 mr-2" />
              Cash
            </Button>
            <Button
              variant={investmentType === "Land" ? "default" : "outline"}
              onClick={() => setInvestmentType("Land")}
              size="sm"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Land
            </Button>
            <Button
              variant={investmentType === "House" ? "default" : "outline"}
              onClick={() => setInvestmentType("House")}
              size="sm"
            >
              <Home className="h-4 w-4 mr-2" />
              House
            </Button>
          </div>

          <div className="text-sm text-muted-foreground text-center">
            Showing {filteredInvestments.length} investment opportunities
          </div>
        </div>

        {/* Investment Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredInvestments.map((investment) => {
            const TypeIcon = investment.icon || getTypeIcon(investment.type)
            return (
              <Card key={investment.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                {investment.image ? (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={investment.image || "/placeholder.svg"}
                      alt={investment.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 right-3 bg-primary">{investment.roi}% ROI</Badge>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
                    <TypeIcon className="h-20 w-20 text-primary/40" />
                    <Badge className="absolute top-3 right-3 bg-primary">{investment.roi}% ROI</Badge>
                  </div>
                )}
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-lg line-clamp-2">{investment.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{investment.description}</p>
                  {investment.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {investment.location}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <div className="text-xs text-muted-foreground">Min. Investment</div>
                      <div className="font-semibold text-sm">{formatCurrency(investment.minInvestment)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                      <div className="font-semibold text-sm">{investment.duration}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground pt-2 border-t">
                    <Calendar className="h-3 w-3 mr-1" />
                    Closes: {new Date(investment.closingDate).toLocaleDateString()}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Link href={`/investments/${investment.id}`} className="w-full">
                    <Button className="w-full" size="sm">
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {filteredInvestments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No investments found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
