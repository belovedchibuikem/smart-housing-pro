"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Building, Users, Wrench, TrendingUp, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getPropertyManagementReports } from "@/lib/api/client"

interface EstateReport {
  estate_name: string
  location: string
  total_properties: number
  allocated_properties: number
  available_properties: number
  occupancy_rate: number
  maintenance_requests: number
}

interface AllotteeReport {
  estate_name: string
  total_allottees: number
  active_allottees: number
  inactive_allottees: number
  avg_tenure_months?: number
}

interface MaintenanceReport {
  id: string
  estate_name: string
  issue_type: string
  status: string
  reported_date: string
  completed_date?: string
  cost: number
}

export default function ManagementReportsPage() {
  const [dateRange, setDateRange] = useState("this-month")
  const [loading, setLoading] = useState(true)
  const [estateReports, setEstateReports] = useState<EstateReport[]>([])
  const [allotteeReports, setAllotteeReports] = useState<AllotteeReport[]>([])
  const [maintenanceReports, setMaintenanceReports] = useState<MaintenanceReport[]>([])
  const [stats, setStats] = useState({
    total_estates: 0,
    total_allottees: 0,
    maintenance_requests: 0,
    occupancy_rate: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchReports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await getPropertyManagementReports({ type: 'all' })
      if (response.success) {
        const data = response.data || {}
        
        // Set stats
        if (data.stats) {
          setStats(data.stats)
        }

        // Set estate reports
        if (data.estate_reports) {
          setEstateReports(data.estate_reports)
        }

        // Set allottee reports
        if (data.allottee_reports) {
          setAllotteeReports(data.allottee_reports)
        }

        // Set maintenance reports
        if (data.maintenance_reports) {
          setMaintenanceReports(data.maintenance_reports)
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    toast({
      title: "Export",
      description: "Export functionality will be implemented soon",
    })
  }

  const statsList = [
    { label: "Total Estates", value: stats.total_estates.toString(), icon: Building, color: "text-blue-600" },
    { label: "Total Allottees", value: stats.total_allottees.toString(), icon: Users, color: "text-green-600" },
    { label: "Maintenance Requests", value: stats.maintenance_requests.toString(), icon: Wrench, color: "text-orange-600" },
    { label: "Occupancy Rate", value: `${stats.occupancy_rate.toFixed(1)}%`, icon: TrendingUp, color: "text-purple-600" },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Property Management Reports</h1>
          <p className="text-muted-foreground mt-1">Comprehensive estate and maintenance analytics</p>
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsList.map((stat) => {
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

      {/* Estate Occupancy Report */}
      <Card>
        <CardHeader>
          <CardTitle>Estate Occupancy Report</CardTitle>
          <CardDescription>Occupancy rates and unit distribution by estate</CardDescription>
        </CardHeader>
        <CardContent>
              {estateReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No estate reports available</div>
              ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estate Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Total Units</TableHead>
                  <TableHead className="text-right">Occupied</TableHead>
                  <TableHead className="text-right">Vacant</TableHead>
                  <TableHead className="text-right">Occupancy Rate</TableHead>
                  <TableHead className="text-right">Maintenance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                      {estateReports.map((estate, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{estate.estate_name}</TableCell>
                    <TableCell>{estate.location}</TableCell>
                          <TableCell className="text-right">{estate.total_properties}</TableCell>
                          <TableCell className="text-right text-green-600 font-semibold">{estate.allocated_properties}</TableCell>
                          <TableCell className="text-right text-orange-600">{estate.available_properties}</TableCell>
                          <TableCell className="text-right font-semibold">{estate.occupancy_rate.toFixed(1)}%</TableCell>
                          <TableCell className="text-right">{estate.maintenance_requests}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
              )}
        </CardContent>
      </Card>

      {/* Allottee Report */}
      <Card>
        <CardHeader>
          <CardTitle>Allottee Status Report</CardTitle>
          <CardDescription>Allottee distribution and tenure analysis</CardDescription>
        </CardHeader>
        <CardContent>
              {allotteeReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No allottee reports available</div>
              ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estate Name</TableHead>
                  <TableHead className="text-right">Total Allottees</TableHead>
                  <TableHead className="text-right">Active</TableHead>
                  <TableHead className="text-right">Inactive</TableHead>
                        {allotteeReports.some(r => r.avg_tenure_months) && (
                  <TableHead className="text-right">Avg Tenure</TableHead>
                        )}
                </TableRow>
              </TableHeader>
              <TableBody>
                      {allotteeReports.map((report, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{report.estate_name}</TableCell>
                          <TableCell className="text-right">{report.total_allottees}</TableCell>
                          <TableCell className="text-right text-green-600 font-semibold">{report.active_allottees}</TableCell>
                          <TableCell className="text-right text-red-600">{report.inactive_allottees}</TableCell>
                          {report.avg_tenure_months !== undefined && (
                            <TableCell className="text-right">
                              {(report.avg_tenure_months / 12).toFixed(1)} years
                            </TableCell>
                          )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
              )}
        </CardContent>
      </Card>

      {/* Maintenance Report */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Request Report</CardTitle>
          <CardDescription>Recent maintenance activities and costs</CardDescription>
        </CardHeader>
        <CardContent>
              {maintenanceReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No maintenance reports available</div>
              ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Estate</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Completion Date</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceReports.map((request) => (
                  <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.id.substring(0, 8)}...</TableCell>
                          <TableCell>{request.estate_name}</TableCell>
                          <TableCell>{request.issue_type || '—'}</TableCell>
                          <TableCell>{request.reported_date ? new Date(request.reported_date).toLocaleDateString() : '—'}</TableCell>
                          <TableCell>{request.completed_date ? new Date(request.completed_date).toLocaleDateString() : '—'}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {request.cost ? `₦${request.cost.toLocaleString()}` : '—'}
                          </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                                request.status === "completed"
                            ? "default"
                                  : request.status === "in_progress"
                              ? "secondary"
                              : "outline"
                        }
                      >
                              {request.status.replace('_', ' ').split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
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
        </>
      )}
    </div>
  )
}
