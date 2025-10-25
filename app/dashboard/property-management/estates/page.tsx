"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Building, Eye } from "lucide-react"
import Link from "next/link"

export default function MyEstatesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const estates = [
    {
      id: 1,
      name: "FRSC Estate Phase 1",
      location: "Abuja, FCT",
      totalUnits: 150,
      occupiedUnits: 120,
      myProperties: 2,
      status: "active",
      description: "Modern residential estate with excellent facilities",
    },
    {
      id: 2,
      name: "FRSC Estate Phase 2",
      location: "Lagos State",
      totalUnits: 200,
      occupiedUnits: 180,
      myProperties: 1,
      status: "active",
      description: "Premium housing estate with state-of-the-art amenities",
    },
  ]

  return (
    <div className="w-full space-y-6 px-4 sm:px-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">My Estates</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">View estates where you have properties</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search estates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {estates.map((estate) => (
          <Card key={estate.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Building className="h-10 w-10 text-primary" />
                <Badge>{estate.status}</Badge>
              </div>
              <CardTitle className="mt-4">{estate.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {estate.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{estate.description}</p>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-primary">{estate.myProperties}</div>
                  <div className="text-xs text-muted-foreground">My Properties</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold">{estate.occupiedUnits}</div>
                  <div className="text-xs text-muted-foreground">Occupied</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold">{estate.totalUnits}</div>
                  <div className="text-xs text-muted-foreground">Total Units</div>
                </div>
              </div>

              <Button className="w-full" asChild>
                <Link href={`/dashboard/property-management/estates/${estate.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
