"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Eye, Calendar, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { getMemberStatutoryCharges } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"

interface StatutoryChargePayment {
  id: string
  statutory_charge_id: string
  amount: number
  payment_method: string
  reference?: string
  status: string
  paid_at?: string
  created_at: string
  statutory_charge?: {
    id: string
    type: string
    description?: string
  }
}

interface StatutoryCharge {
  id: string
  type: string
  amount: number
  description?: string
}

export default function StatutoryChargesHistoryPage() {
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [payments, setPayments] = useState<StatutoryChargePayment[]>([])
  const [charges, setCharges] = useState<StatutoryCharge[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const chargesResponse = await getMemberStatutoryCharges({ per_page: 100 })

      if (chargesResponse.success) {
        const chargesData = Array.isArray(chargesResponse.charges) 
          ? chargesResponse.charges 
          : (chargesResponse as any).data || []
        setCharges(chargesData)

        // Extract payments from charges
        const allPayments: StatutoryChargePayment[] = []
        chargesData.forEach((charge: any) => {
          if (charge.payments && Array.isArray(charge.payments)) {
            charge.payments.forEach((payment: any) => {
              allPayments.push({
                ...payment,
                statutory_charge_id: charge.id,
                statutory_charge: {
                  id: charge.id,
                  type: charge.type,
                  description: charge.description,
                },
              })
            })
          }
        })

        // Sort by date (newest first)
        allPayments.sort((a, b) => {
          const dateA = new Date(a.paid_at || a.created_at).getTime()
          const dateB = new Date(b.paid_at || b.created_at).getTime()
          return dateB - dateA
        })

        setPayments(allPayments)
      }
    } catch (error: any) {
      console.error("Error fetching payment history:", error)
      sonnerToast.error("Failed to load payment history", {
        description: error.message || "Please try again later",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return "default"
      case "pending":
        return "secondary"
      case "failed":
      case "rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatPaymentMethod = (method: string) => {
    const methodMap: Record<string, string> = {
      paystack: "Card Payment",
      remita: "Remita",
      stripe: "Stripe",
      wallet: "Wallet",
      manual: "Bank Transfer",
      bank_transfer: "Bank Transfer",
    }
    return methodMap[method] || method
  }

  const filteredPayments = payments.filter((payment) => {
    if (statusFilter !== "all" && payment.status !== statusFilter) return false
    
    if (typeFilter !== "all" && payment.statutory_charge?.type !== typeFilter) return false
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesReference = payment.reference?.toLowerCase().includes(query)
      const matchesType = payment.statutory_charge?.type.toLowerCase().includes(query)
      const matchesDescription = payment.statutory_charge?.description?.toLowerCase().includes(query)
      if (!matchesReference && !matchesType && !matchesDescription) return false
    }
    
    return true
  })

  const uniqueTypes = Array.from(new Set(charges.map((c) => c.type)))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment History</h1>
          <p className="text-muted-foreground mt-2">View all your statutory charge payments</p>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
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
                <SelectItem value="paid">Paid</SelectItem>
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
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredPayments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No payment history found</p>
            <Link href="/dashboard/statutory-charges/pay">
              <Button className="mt-4">Make a Payment</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <Card key={payment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">
                        {payment.statutory_charge?.type || "Unknown Charge"}
                      </h3>
                      <Badge variant={getStatusColor(payment.status)}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </div>
                    {payment.statutory_charge?.description && (
                      <p className="text-sm text-muted-foreground">{payment.statutory_charge.description}</p>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      {payment.reference && (
                        <div>
                          <span className="font-medium">Reference:</span> {payment.reference}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Payment Method:</span> {formatPaymentMethod(payment.payment_method)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {payment.paid_at 
                          ? new Date(payment.paid_at).toLocaleDateString()
                          : new Date(payment.created_at).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span>{" "}
                        <span className="text-primary font-semibold">{formatCurrency(payment.amount)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/statutory-charges?charge=${payment.statutory_charge_id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                    {payment.status === "completed" || payment.status === "paid" ? (
                      <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <Download className="h-4 w-4 mr-2" />
                        Receipt
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredPayments.length > 0 && (
        <Card className="print:hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Showing {filteredPayments.length} of {payments.length} payment{payments.length !== 1 ? "s" : ""}
              </span>
              <span className="font-semibold">
                Total: {formatCurrency(filteredPayments.reduce((sum, p) => sum + p.amount, 0))}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
