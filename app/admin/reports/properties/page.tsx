"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Home, Building2, LandPlot, TrendingUp } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getPropertyReports, exportReport } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function PropertyReportsPage() {
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState("this-month")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_properties: 0,
    houses: 0,
    land: 0,
    total_value: "₦0",
  })
  const [properties, setProperties] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await getPropertyReports({ date_range: dateRange, per_page: 50 })
      if (response.success) {
        setStats(response.data.stats)
        setProperties(response.data.properties || [])
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load property reports",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      await exportReport('properties', { date_range: dateRange })
      toast({
        title: "Export initiated",
        description: "Your report is being generated.",
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
    { label: "Total Properties", value: stats.total_properties.toString(), icon: Home, color: "text-blue-600" },
    { label: "Houses", value: stats.houses.toString(), icon: Building2, color: "text-green-600" },
    { label: "Land", value: stats.land.toString(), icon: LandPlot, color: "text-purple-600" },
    { label: "Total Value", value: stats.total_value, icon: TrendingUp, color: "text-orange-600" },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Property Reports</h1>
          <p className="text-muted-foreground mt-1">Track property portfolio and performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle>Property Portfolio</CardTitle>
          <CardDescription>Detailed property listings and status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : properties.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No properties found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Allocated</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium">
                        <Link href={`/admin/properties/${property.id}`} className="hover:underline">
                          {property.id}
                        </Link>
                      </TableCell>
                      <TableCell>{property.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{property.type}</Badge>
                      </TableCell>
                      <TableCell>{property.location}</TableCell>
                      <TableCell className="text-right font-semibold">{property.price}</TableCell>
                      <TableCell>{property.allocated || 0}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            property.status === "Sold"
                              ? "default"
                              : property.status === "Reserved"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {property.status}
                        </Badge>
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
