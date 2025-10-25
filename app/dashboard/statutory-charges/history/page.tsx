"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Eye, Calendar } from "lucide-react"
import Link from "next/link"

export default function StatutoryChargesHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const payments = [
    {
      id: "PAY001",
      chargeType: "Title Document Processing (TDP)",
      amount: 50000,
      date: "2024-01-15",
      status: "completed",
      propertyId: "PROP-2024-001",
      reference: "TDP-2024-001",
    },
    {
      id: "PAY002",
      chargeType: "Building Plan Approval",
      amount: 75000,
      date: "2024-01-10",
      status: "completed",
      propertyId: "PROP-2024-002",
      reference: "BPA-2024-001",
    },
    {
      id: "PAY003",
      chargeType: "Building Alteration Fee",
      amount: 35000,
      date: "2024-01-05",
      status: "pending",
      propertyId: "PROP-2024-003",
      reference: "BAF-2024-001",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "pending":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment History</h1>
          <p className="text-muted-foreground mt-2">View all your statutory charge payments</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Payments</CardTitle>
          <CardDescription>Search and filter your payment history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="tdp">TDP</SelectItem>
                <SelectItem value="building">Building Plan</SelectItem>
                <SelectItem value="alteration">Alteration</SelectItem>
                <SelectItem value="survey">Survey</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {payments.map((payment) => (
          <Card key={payment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{payment.chargeType}</h3>
                    <Badge variant={getStatusColor(payment.status)}>{payment.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Reference:</span> {payment.reference}
                    </div>
                    <div>
                      <span className="font-medium">Property ID:</span> {payment.propertyId}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(payment.date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Amount:</span>{" "}
                      <span className="text-primary font-semibold">₦{payment.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Receipt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {payments.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No payment history found</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/statutory-charges/pay">Make a Payment</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
