"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Building2, Home, MapPin, Calendar, Download, Search, Filter, Loader2 } from "lucide-react"
import { getPropertyReport } from "@/lib/api/client"
import { exportReport } from "@/lib/utils/export"
import { toast } from "sonner"

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export default function PropertyReportPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [propertyType, setPropertyType] = useState("all")
  const [paymentStatus, setPaymentStatus] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_properties: 0,
    completed_properties: 0,
    ongoing_properties: 0,
    total_invested: 0,
    total_value: 0,
    payment_progress: 0,
  })
  const [properties, setProperties] = useState<any[]>([])

  const loadReport = async () => {
    try {
      setLoading(true)
      const params: any = {
        property_type: propertyType !== "all" ? propertyType : undefined,
        payment_status: paymentStatus !== "all" ? paymentStatus : undefined,
      }
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo

      const response = await getPropertyReport(params)
      if (response.success) {
        setStats(response.stats)
        setProperties(response.properties)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load property report")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReport()
  }, [propertyType, paymentStatus, dateFrom, dateTo])

  const handleReset = () => {
    setSearchTerm("")
    setPropertyType("all")
    setPaymentStatus("all")
    setDateFrom("")
    setDateTo("")
  }

  const handleExport = async (format: "PDF" | "Excel") => {
    try {
      const params: any = {
        property_type: propertyType !== "all" ? propertyType : undefined,
        payment_status: paymentStatus !== "all" ? paymentStatus : undefined,
      }
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo

      await exportReport("properties", format, params)
      toast.success(`Report exported successfully as ${format}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to export report")
    }
  }

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_properties}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.completed_properties} completed, {stats.ongoing_properties} ongoing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{stats.total_invested.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Amount paid so far</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{stats.total_value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Combined property value</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payment Progress</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(stats.payment_progress)}%</div>
                <p className="text-xs text-muted-foreground">Overall completion rate</p>
              </CardContent>
            </Card>
          </div>

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

          <div className="space-y-4">
            {filteredProperties.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-lg font-medium">No properties found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                </CardContent>
              </Card>
            ) : (
              filteredProperties.map((property) => {
                const paymentProgress = property.total_cost > 0 ? (property.amount_paid / property.total_cost) * 100 : 0

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
                            <Badge variant={property.payment_status === "completed" ? "default" : "secondary"}>
                              {property.payment_status === "completed" ? "Completed" : "Ongoing"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {property.location}
                            </span>
                            <span>{property.size}</span>
                            <span>{property.payment_method}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">₦{property.amount_paid.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">of ₦{property.total_cost.toLocaleString()}</div>
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
                          <div className="font-medium">{formatDate(new Date(property.subscription_date))}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Last Payment</div>
                          <div className="font-medium">
                            {property.last_payment ? formatDate(new Date(property.last_payment)) : "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Balance</div>
                          <div className="font-medium text-destructive">
                            ₦{(property.total_cost - property.amount_paid).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </>
      )}
    </div>
  )
}
