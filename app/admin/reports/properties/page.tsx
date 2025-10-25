"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Home, Building2, LandPlot, TrendingUp } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function PropertyReportsPage() {
  const [dateRange, setDateRange] = useState("this-month")

  const stats = [
    { label: "Total Properties", value: "23", icon: Home, color: "text-blue-600" },
    { label: "Houses", value: "15", icon: Building2, color: "text-green-600" },
    { label: "Land", value: "8", icon: LandPlot, color: "text-purple-600" },
    { label: "Total Value", value: "₦450M", icon: TrendingUp, color: "text-orange-600" },
  ]

  const properties = [
    {
      id: "P001",
      name: "Luxury Villa - Lekki",
      type: "House",
      location: "Lekki, Lagos",
      size: "450 sqm",
      value: "₦45,000,000",
      status: "Sold",
      owner: "John Doe",
    },
    {
      id: "P002",
      name: "Modern Apartment - VI",
      type: "House",
      location: "Victoria Island, Lagos",
      size: "280 sqm",
      value: "₦35,000,000",
      status: "Available",
      owner: "-",
    },
    {
      id: "P003",
      name: "Land Plot - Abuja",
      type: "Land",
      location: "Gwarinpa, Abuja",
      size: "1000 sqm",
      value: "₦25,000,000",
      status: "Reserved",
      owner: "Jane Smith",
    },
    {
      id: "P004",
      name: "Duplex - Ikeja",
      type: "House",
      location: "Ikeja GRA, Lagos",
      size: "350 sqm",
      value: "₦40,000,000",
      status: "Sold",
      owner: "Mike Johnson",
    },
    {
      id: "P005",
      name: "Commercial Land - PH",
      type: "Land",
      location: "Port Harcourt",
      size: "2000 sqm",
      value: "₦50,000,000",
      status: "Available",
      owner: "-",
    },
  ]

  const locationAnalysis = [
    { location: "Lagos", properties: 12, totalValue: "₦280M", avgValue: "₦23.3M", occupancy: "85%" },
    { location: "Abuja", properties: 7, totalValue: "₦120M", avgValue: "₦17.1M", occupancy: "78%" },
    { location: "Port Harcourt", properties: 4, totalValue: "₦50M", avgValue: "₦12.5M", occupancy: "92%" },
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
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
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

      {/* Location Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Location Analysis</CardTitle>
          <CardDescription>Property distribution and performance by location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Properties</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                  <TableHead className="text-right">Avg Value</TableHead>
                  <TableHead className="text-right">Occupancy Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locationAnalysis.map((location) => (
                  <TableRow key={location.location}>
                    <TableCell className="font-medium">{location.location}</TableCell>
                    <TableCell className="text-right">{location.properties}</TableCell>
                    <TableCell className="text-right font-semibold">{location.totalValue}</TableCell>
                    <TableCell className="text-right">{location.avgValue}</TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">{location.occupancy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle>Property Portfolio</CardTitle>
          <CardDescription>Detailed property listings and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">{property.id}</TableCell>
                    <TableCell>{property.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{property.type}</Badge>
                    </TableCell>
                    <TableCell>{property.location}</TableCell>
                    <TableCell>{property.size}</TableCell>
                    <TableCell className="text-right font-semibold">{property.value}</TableCell>
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
                    <TableCell>{property.owner}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
