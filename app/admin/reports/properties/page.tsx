"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Home, Building2, TrendingUp } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getPropertyReports, exportReport } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function PropertyReportsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_properties: 0,
    houses: 0,
    total_value: "₦0",
  })
  const [properties, setProperties] = useState<any[]>([])
  const [exportingBalances, setExportingBalances] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await getPropertyReports({ per_page: 50 })
      if (response.success) {
        setStats(response.data.stats)
        setProperties(response.data.properties || [])
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load building portfolio reports",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      await exportReport("properties", { date_range: "this-month" })
      toast({
        title: "Export completed",
        description: "Your report has been downloaded.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export report",
        variant: "destructive",
      })
    }
  }

  const handleExportBalances = async () => {
    try {
      setExportingBalances(true)
      await exportReport("estate-repayment-balances", { format: "xlsx" })
      toast({
        title: "Export completed",
        description: "Estate repayment balances have been downloaded.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export repayment balances",
        variant: "destructive",
      })
    } finally {
      setExportingBalances(false)
    }
  }

  const statsCards = [
    { label: "Building inventory", value: stats.total_properties.toString(), icon: Home, color: "text-blue-600" },
    { label: "Residential-style units", value: stats.houses.toString(), icon: Building2, color: "text-green-600" },
    { label: "Portfolio value (non-land)", value: stats.total_value, icon: TrendingUp, color: "text-orange-600" },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Building portfolio reports</h1>
          <p className="text-muted-foreground mt-1">
            Houses and structured inventory (land parcels live under Land reports). Per-estate repayment balances can also be downloaded from Manage Estates.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleExportBalances} disabled={exportingBalances}>
            <Download className="h-4 w-4 mr-2" />
            {exportingBalances ? "Exporting…" : "Export repayment balances"}
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
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
          <CardTitle>Building portfolio</CardTitle>
          <CardDescription>Detailed listings excluding land parcels</CardDescription>
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
