"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, CheckCircle, Clock, XCircle } from "lucide-react"
import Link from "next/link"

export default function StatutoryChargesPage() {
  const charges = [
    {
      id: 1,
      name: "Title Document Processing (TDP)",
      description: "Processing fee for property title documents",
      amount: "₦150,000",
      status: "paid",
      date: "2024-01-15",
      reference: "TDP-2024-001",
    },
    {
      id: 2,
      name: "Building Plan Approval",
      description: "Approval fee for building construction plans",
      amount: "₦75,000",
      status: "pending",
      date: "2024-02-20",
      reference: "BPA-2024-002",
    },
    {
      id: 3,
      name: "Property Alteration Fee",
      description: "Fee for approved property modifications",
      amount: "₦50,000",
      status: "overdue",
      date: "2024-01-10",
      reference: "ALT-2024-003",
    },
    {
      id: 4,
      name: "Development Levy",
      description: "Annual estate development and maintenance levy",
      amount: "₦100,000",
      status: "paid",
      date: "2024-03-01",
      reference: "DEV-2024-004",
    },
  ]

  const availableCharges = [
    {
      name: "Title Document Processing (TDP)",
      description: "Required for all property title transfers and registrations",
      amount: "₦150,000",
      category: "Legal",
    },
    {
      name: "Building Plan Approval",
      description: "Mandatory approval for new construction or major renovations",
      amount: "₦75,000",
      category: "Engineering",
    },
    {
      name: "Property Alteration Fee",
      description: "Fee for approved modifications to existing structures",
      amount: "₦50,000",
      category: "Engineering",
    },
    {
      name: "Development Levy",
      description: "Annual contribution for estate infrastructure and maintenance",
      amount: "₦100,000",
      category: "Accounts",
    },
    {
      name: "Survey and Demarcation",
      description: "Professional land survey and boundary marking services",
      amount: "₦200,000",
      category: "Engineering",
    },
    {
      name: "Environmental Impact Assessment",
      description: "Required assessment for large-scale developments",
      amount: "₦300,000",
      category: "Legal",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "pending":
        return "secondary"
      case "overdue":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "overdue":
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Statutory Charges</h1>
          <p className="text-muted-foreground mt-1">Manage property-related fees and statutory payments</p>
        </div>
        <Link href="/dashboard/statutory-charges/pay">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Payment
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦250,000</div>
            <p className="text-xs text-muted-foreground mt-1">2 payments completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦75,000</div>
            <p className="text-xs text-muted-foreground mt-1">1 payment pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₦50,000</div>
            <p className="text-xs text-muted-foreground mt-1">1 payment overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Your statutory charge payments and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {charges.map((charge) => (
              <div key={charge.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{charge.name}</h3>
                    <Badge variant={getStatusColor(charge.status)} className="capitalize">
                      {getStatusIcon(charge.status)}
                      <span className="ml-1">{charge.status}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{charge.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Ref: {charge.reference}</span>
                    <span>Date: {charge.date}</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xl font-bold">{charge.amount}</p>
                  {charge.status === "pending" && (
                    <Button size="sm" className="mt-2">
                      Pay Now
                    </Button>
                  )}
                  {charge.status === "overdue" && (
                    <Button size="sm" variant="destructive" className="mt-2">
                      Pay Now
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Charges */}
      <Card>
        <CardHeader>
          <CardTitle>Available Statutory Charges</CardTitle>
          <CardDescription>Common fees and charges for property-related services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {availableCharges.map((charge, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{charge.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{charge.description}</p>
                    <Badge variant="outline" className="mt-2">
                      {charge.category}
                    </Badge>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-lg">{charge.amount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
