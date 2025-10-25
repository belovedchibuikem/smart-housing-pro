"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, DollarSign, PieChart, Target } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function InvestmentReportsPage() {
  const [dateRange, setDateRange] = useState("this-month")

  const stats = [
    { label: "Total Investments", value: "₦85.5M", icon: DollarSign, color: "text-blue-600" },
    { label: "Active Investments", value: "234", icon: TrendingUp, color: "text-green-600" },
    { label: "Average ROI", value: "12.5%", icon: Target, color: "text-purple-600" },
    { label: "Total Returns", value: "₦10.7M", icon: PieChart, color: "text-orange-600" },
  ]

  const investments = [
    {
      id: "INV001",
      member: "John Doe",
      plan: "Premium Growth",
      amount: "₦2,000,000",
      roi: "15%",
      startDate: "2024-01-15",
      maturityDate: "2025-01-15",
      status: "Active",
    },
    {
      id: "INV002",
      member: "Jane Smith",
      plan: "Standard Plan",
      amount: "₦1,500,000",
      roi: "12%",
      startDate: "2024-02-01",
      maturityDate: "2025-02-01",
      status: "Active",
    },
    {
      id: "INV003",
      member: "Mike Johnson",
      plan: "Basic Plan",
      amount: "₦1,000,000",
      roi: "10%",
      startDate: "2023-12-01",
      maturityDate: "2024-12-01",
      status: "Matured",
    },
    {
      id: "INV004",
      member: "Sarah Williams",
      plan: "Premium Growth",
      amount: "₦3,000,000",
      roi: "15%",
      startDate: "2024-01-10",
      maturityDate: "2025-01-10",
      status: "Active",
    },
    {
      id: "INV005",
      member: "David Brown",
      plan: "Standard Plan",
      amount: "₦1,200,000",
      roi: "12%",
      startDate: "2024-03-01",
      maturityDate: "2025-03-01",
      status: "Active",
    },
  ]

  const planPerformance = [
    { plan: "Premium Growth", totalInvested: "₦35.2M", investors: 87, avgROI: "15%", returns: "₦5.3M" },
    { plan: "Standard Plan", totalInvested: "₦28.5M", investors: 95, avgROI: "12%", returns: "₦3.4M" },
    { plan: "Basic Plan", totalInvested: "₦21.8M", investors: 52, avgROI: "10%", returns: "₦2.0M" },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Investment Reports</h1>
          <p className="text-muted-foreground mt-1">Track investment performance and returns</p>
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

      {/* Plan Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Plan Performance</CardTitle>
          <CardDescription>Performance metrics by investment plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead className="text-right">Total Invested</TableHead>
                  <TableHead className="text-right">Investors</TableHead>
                  <TableHead className="text-right">Avg ROI</TableHead>
                  <TableHead className="text-right">Total Returns</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planPerformance.map((plan) => (
                  <TableRow key={plan.plan}>
                    <TableCell className="font-medium">{plan.plan}</TableCell>
                    <TableCell className="text-right font-semibold">{plan.totalInvested}</TableCell>
                    <TableCell className="text-right">{plan.investors}</TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">{plan.avgROI}</TableCell>
                    <TableCell className="text-right text-blue-600 font-semibold">{plan.returns}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Investment Details */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Details</CardTitle>
          <CardDescription>Individual investment records and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investment ID</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">ROI</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Maturity Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investments.map((investment) => (
                  <TableRow key={investment.id}>
                    <TableCell className="font-medium">{investment.id}</TableCell>
                    <TableCell>{investment.member}</TableCell>
                    <TableCell>{investment.plan}</TableCell>
                    <TableCell className="text-right font-semibold">{investment.amount}</TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">{investment.roi}</TableCell>
                    <TableCell>{investment.startDate}</TableCell>
                    <TableCell>{investment.maturityDate}</TableCell>
                    <TableCell>
                      <Badge variant={investment.status === "Active" ? "default" : "secondary"}>
                        {investment.status}
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
