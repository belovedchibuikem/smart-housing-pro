"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Building, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { getMyEstates, type MemberEstate } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"

export default function MyEstatesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [estates, setEstates] = useState<MemberEstate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEstates = async () => {
      try {
        setLoading(true)
        const response = await getMyEstates()
        if (response.success) {
          setEstates(response.estates)
        } else {
          sonnerToast.error("Failed to load estates")
        }
      } catch (error: any) {
        console.error("Error fetching estates:", error)
        sonnerToast.error("Failed to load estates", {
          description: error?.message || "Please try again later",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEstates()
  }, [])

  const filteredEstates = useMemo(() => {
    if (!searchQuery) return estates
    const query = searchQuery.toLowerCase()
    return estates.filter(
      (estate) =>
        estate.name.toLowerCase().includes(query) ||
        estate.location.toLowerCase().includes(query)
    )
  }, [estates, searchQuery])

  if (loading) {
    return (
      <div className="w-full space-y-6 px-4 sm:px-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

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

      {filteredEstates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchQuery ? "No estates found matching your search" : "You don't have any properties in estates yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {filteredEstates.map((estate) => (
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
                    <div className="text-xl sm:text-2xl font-bold text-primary">{estate.my_properties}</div>
                    <div className="text-xs text-muted-foreground">My Properties</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold">{estate.occupied_units}</div>
                    <div className="text-xs text-muted-foreground">Occupied</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold">{estate.total_units}</div>
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
      )}
    </div>
  )
}
