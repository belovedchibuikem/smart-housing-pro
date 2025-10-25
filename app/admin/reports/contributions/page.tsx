"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, CreditCard, CheckCircle, Clock, XCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function ContributionReportsPage() {
  const [dateRange, setDateRange] = useState("this-month")
  const [searchQuery, setSearchQuery] = useState("")

  const stats = [
    { label: "Total Contributions", value: "₦45.2M", icon: CreditCard, color: "text-blue-600" },
    { label: "Paid", value: "₦42.8M", icon: CheckCircle, color: "text-green-600" },
    { label: "Pending", value: "₦2.1M", icon: Clock, color: "text-orange-600" },
    { label: "Overdue", value: "₦300K", icon: XCircle, color: "text-red-600" },
  ]

  const contributions = [
    {
      id: "C001",
      member: "John Doe",
      memberId: "M001",
      amount: "₦50,000",
      dueDate: "2024-03-01",
      paidDate: "2024-03-01",
      status: "Paid",
    },
    {
      id: "C002",
      member: "Jane Smith",
      memberId: "M002",
      amount: "₦50,000",
      dueDate: "2024-03-01",
      paidDate: "2024-03-02",
      status: "Paid",
    },
    {
      id: "C003",
      member: "Mike Johnson",
      memberId: "M003",
      amount: "₦50,000",
      dueDate: "2024-03-01",
      paidDate: null,
      status: "Pending",
    },
    {
      id: "C004",
      member: "Sarah Williams",
      memberId: "M004",
      amount: "₦75,000",
      dueDate: "2024-03-01",
      paidDate: "2024-02-28",
      status: "Paid",
    },
    {
      id: "C005",
      member: "David Brown",
      memberId: "M005",
      amount: "₦50,000",
      dueDate: "2024-02-01",
      paidDate: null,
      status: "Overdue",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Contribution Reports</h1>
          <p className="text-muted-foreground mt-1">Track member contributions and payment status</p>
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

      {/* Search Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search Contributions</CardTitle>
          <CardDescription>Filter by member name or ID</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by member name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contributions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contribution Details</CardTitle>
          <CardDescription>Detailed contribution records and payment status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contribution ID</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Member ID</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Paid Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributions.map((contribution) => (
                  <TableRow key={contribution.id}>
                    <TableCell className="font-medium">{contribution.id}</TableCell>
                    <TableCell>{contribution.member}</TableCell>
                    <TableCell>{contribution.memberId}</TableCell>
                    <TableCell className="text-right font-semibold">{contribution.amount}</TableCell>
                    <TableCell>{contribution.dueDate}</TableCell>
                    <TableCell>{contribution.paidDate || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          contribution.status === "Paid"
                            ? "default"
                            : contribution.status === "Pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {contribution.status}
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
