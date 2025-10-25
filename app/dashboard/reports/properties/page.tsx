"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Building2, Home, MapPin, Calendar, Download, Search, Filter } from "lucide-react"

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export default function PropertyReportPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [propertyType, setPropertyType] = useState("all")
  const [paymentStatus, setPaymentStatus] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  // Mock data - replace with actual API call
  const properties = [
    {
      id: "1",
      name: "Luxury Apartment - Block A",
      type: "house",
      location: "Abuja, FCT",
      size: "3 Bedroom",
      totalCost: 15000000,
      amountPaid: 9000000,
      paymentStatus: "ongoing",
      subscriptionDate: new Date(2024, 0, 15),
      lastPayment: new Date(2024, 11, 1),
      paymentMethod: "Mortgage",
    },
    {
      id: "2",
      name: "Commercial Plot - Zone 5",
      type: "land",
      location: "Lagos, Nigeria",
      size: "500 SQM",
      totalCost: 8000000,
      amountPaid: 8000000,
      paymentStatus: "completed",
      subscriptionDate: new Date(2023, 5, 10),
      lastPayment: new Date(2024, 2, 15),
      paymentMethod: "Cash",
    },
    {
      id: "3",
      name: "Residential Land - Estate",
      type: "land",
      location: "Port Harcourt, Rivers",
      size: "700 SQM",
      totalCost: 5000000,
      amountPaid: 1500000,
      paymentStatus: "ongoing",
      subscriptionDate: new Date(2024, 8, 20),
      lastPayment: new Date(2024, 11, 10),
      paymentMethod: "Cooperative",
    },
  ]

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = propertyType === "all" || property.type === propertyType
    const matchesStatus = paymentStatus === "all" || property.paymentStatus === paymentStatus

    let matchesDate = true
    if (dateFrom) {
      matchesDate = matchesDate && property.subscriptionDate >= new Date(dateFrom)
    }
    if (dateTo) {
      matchesDate = matchesDate && property.subscriptionDate <= new Date(dateTo)
    }

    return matchesSearch && matchesType && matchesStatus && matchesDate
  })

  const totalProperties = filteredProperties.length
  const completedProperties = filteredProperties.filter((p) => p.paymentStatus === "completed").length
  const ongoingProperties = filteredProperties.filter((p) => p.paymentStatus === "ongoing").length
  const totalInvested = filteredProperties.reduce((sum, p) => sum + p.amountPaid, 0)
  const totalValue = filteredProperties.reduce((sum, p) => sum + p.totalCost, 0)

  const handleExport = (format: string) => {
    console.log(`Exporting property report as ${format}`)
    alert(`Property report exported as ${format}`)
  }

  const handleReset = () => {
    setSearchTerm("")
    setPropertyType("all")
    setPaymentStatus("all")
    setDateFrom("")
    setDateTo("")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Property Report</h1>
          <p className="text-muted-foreground">Comprehensive overview of your property portfolio</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleExport("PDF")} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button onClick={() => handleExport("Excel")} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              {completedProperties} completed, {ongoingProperties} ongoing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalInvested.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Amount paid so far</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Combined property value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Progress</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalValue > 0 ? Math.round((totalInvested / totalValue) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Overall completion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter properties by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Property name or location"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Property Type</Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Payment Status</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={handleReset}>
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Properties List */}
      <div className="space-y-4">
        {filteredProperties.map((property) => {
          const paymentProgress = (property.amountPaid / property.totalCost) * 100

          return (
            <Card key={property.id}>
              <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{property.name}</CardTitle>
                      <Badge variant={property.type === "house" ? "default" : "secondary"}>
                        {property.type === "house" ? (
                          <Home className="mr-1 h-3 w-3" />
                        ) : (
                          <Building2 className="mr-1 h-3 w-3" />
                        )}
                        {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                      </Badge>
                      <Badge variant={property.paymentStatus === "completed" ? "default" : "secondary"}>
                        {property.paymentStatus === "completed" ? "Completed" : "Ongoing"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {property.location}
                      </span>
                      <span>{property.size}</span>
                      <span>{property.paymentMethod}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">₦{property.amountPaid.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">of ₦{property.totalCost.toLocaleString()}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Progress</span>
                    <span className="font-medium">{Math.round(paymentProgress)}%</span>
                  </div>
                  <Progress value={paymentProgress} className="h-2" />
                </div>

                <div className="grid gap-4 text-sm md:grid-cols-3">
                  <div>
                    <div className="text-muted-foreground">Subscription Date</div>
                    <div className="font-medium">{formatDate(property.subscriptionDate)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Last Payment</div>
                    <div className="font-medium">{formatDate(property.lastPayment)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Balance</div>
                    <div className="font-medium text-destructive">
                      ₦{(property.totalCost - property.amountPaid).toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filteredProperties.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">No properties found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
