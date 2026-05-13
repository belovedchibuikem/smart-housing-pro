"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, MapPinned, TrendingUp, Layers } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getLandReports, exportReport } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function LandReportsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_land_parcels: 0,
    total_value: "₦0",
  })
  const [parcels, setParcels] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await getLandReports({ per_page: 50 })
      if (response.success) {
        setStats(response.data.stats)
        setParcels(response.data.parcels || [])
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load land reports",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      await exportReport("land", {})
      toast({
        title: "Export completed",
        description: "Your land inventory has been downloaded.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export report",
        variant: "destructive",
      })
    }
  }

  const statsCards = [
    { label: "Land parcels", value: stats.total_land_parcels.toString(), icon: MapPinned, color: "text-emerald-600" },
    { label: "Total land value", value: stats.total_value, icon: TrendingUp, color: "text-orange-600" },
    { label: "Inventory type", value: "Land only", icon: Layers, color: "text-blue-600" },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Land reports</h1>
          <p className="text-muted-foreground mt-1">Dedicated view for parcels and land holdings (properties with type land).</p>
        </div>
        <Button onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export land inventory
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Land parcels</CardTitle>
          <CardDescription>Inventory and allotment status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : parcels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No land parcels found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Allocated</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parcels.map((parcel) => (
                    <TableRow key={parcel.id}>
                      <TableCell className="font-medium">
                        <Link href={`/admin/properties/${parcel.id}`} className="hover:underline">
                          {parcel.id}
                        </Link>
                      </TableCell>
                      <TableCell>{parcel.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{parcel.type}</Badge>
                      </TableCell>
                      <TableCell>{parcel.location}</TableCell>
                      <TableCell className="text-right font-semibold">{parcel.price}</TableCell>
                      <TableCell>{parcel.allocated || 0}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{parcel.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
