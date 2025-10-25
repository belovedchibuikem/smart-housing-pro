"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Building, Users, Wrench, TrendingUp } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function ManagementReportsPage() {
  const [dateRange, setDateRange] = useState("this-month")

  const stats = [
    { label: "Total Estates", value: "12", icon: Building, color: "text-blue-600" },
    { label: "Total Allottees", value: "156", icon: Users, color: "text-green-600" },
    { label: "Maintenance Requests", value: "45", icon: Wrench, color: "text-orange-600" },
    { label: "Occupancy Rate", value: "87%", icon: TrendingUp, color: "text-purple-600" },
  ]

  const estateReports = [
    {
      estate: "FRSC Estate Phase 1",
      location: "Maitama, Abuja",
      totalUnits: 50,
      occupied: 45,
      vacant: 5,
      occupancyRate: "90%",
      maintenanceRequests: 12,
    },
    {
      estate: "FRSC Estate Phase 2",
      location: "Gwarinpa, Abuja",
      totalUnits: 40,
      occupied: 35,
      vacant: 5,
      occupancyRate: "87.5%",
      maintenanceRequests: 8,
    },
    {
      estate: "FRSC Estate Phase 3",
      location: "Asokoro, Abuja",
      totalUnits: 30,
      occupied: 24,
      vacant: 6,
      occupancyRate: "80%",
      maintenanceRequests: 5,
    },
  ]

  const maintenanceReports = [
    {
      id: "MR001",
      estate: "FRSC Estate Phase 1",
      type: "Plumbing",
      status: "Completed",
      requestDate: "2024-03-10",
      completionDate: "2024-03-12",
      cost: "₦45,000",
    },
    {
      id: "MR002",
      estate: "FRSC Estate Phase 2",
      type: "Electrical",
      status: "In Progress",
      requestDate: "2024-03-14",
      completionDate: "-",
      cost: "₦65,000",
    },
    {
      id: "MR003",
      estate: "FRSC Estate Phase 1",
      type: "Painting",
      status: "Pending",
      requestDate: "2024-03-15",
      completionDate: "-",
      cost: "₦120,000",
    },
  ]

  const allotteeReports = [
    {
      estate: "FRSC Estate Phase 1",
      totalAllottees: 45,
      active: 42,
      inactive: 3,
      avgTenure: "3.5 years",
    },
    {
      estate: "FRSC Estate Phase 2",
      totalAllottees: 35,
      active: 33,
      inactive: 2,
      avgTenure: "2.8 years",
    },
    {
      estate: "FRSC Estate Phase 3",
      totalAllottees: 24,
      active: 22,
      inactive: 2,
      avgTenure: "1.5 years",
    },
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

      {/* Estate Occupancy Report */}
      <Card>
        <CardHeader>
          <CardTitle>Estate Occupancy Report</CardTitle>
          <CardDescription>Occupancy rates and unit distribution by estate</CardDescription>
        </CardHeader>
        <CardContent>
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
                {estateReports.map((estate) => (
                  <TableRow key={estate.estate}>
                    <TableCell className="font-medium">{estate.estate}</TableCell>
                    <TableCell>{estate.location}</TableCell>
                    <TableCell className="text-right">{estate.totalUnits}</TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">{estate.occupied}</TableCell>
                    <TableCell className="text-right text-orange-600">{estate.vacant}</TableCell>
                    <TableCell className="text-right font-semibold">{estate.occupancyRate}</TableCell>
                    <TableCell className="text-right">{estate.maintenanceRequests}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Allottee Report */}
      <Card>
        <CardHeader>
          <CardTitle>Allottee Status Report</CardTitle>
          <CardDescription>Allottee distribution and tenure analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estate Name</TableHead>
                  <TableHead className="text-right">Total Allottees</TableHead>
                  <TableHead className="text-right">Active</TableHead>
                  <TableHead className="text-right">Inactive</TableHead>
                  <TableHead className="text-right">Avg Tenure</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allotteeReports.map((report) => (
                  <TableRow key={report.estate}>
                    <TableCell className="font-medium">{report.estate}</TableCell>
                    <TableCell className="text-right">{report.totalAllottees}</TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">{report.active}</TableCell>
                    <TableCell className="text-right text-red-600">{report.inactive}</TableCell>
                    <TableCell className="text-right">{report.avgTenure}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Report */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Request Report</CardTitle>
          <CardDescription>Recent maintenance activities and costs</CardDescription>
        </CardHeader>
        <CardContent>
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
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell>{request.estate}</TableCell>
                    <TableCell>{request.type}</TableCell>
                    <TableCell>{request.requestDate}</TableCell>
                    <TableCell>{request.completionDate}</TableCell>
                    <TableCell className="text-right font-semibold">{request.cost}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.status === "Completed"
                            ? "default"
                            : request.status === "In Progress"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
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
