"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, CheckCircle, Clock, XCircle, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { getMemberStatutoryCharges, getMemberStatutoryChargeTypes } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"

interface StatutoryCharge {
  id: string
  type: string
  amount: number
  description?: string
  due_date?: string
  status: string
  total_paid?: number
  remaining_amount?: number
  created_at: string
}

export default function StatutoryChargesPage() {
  const [loading, setLoading] = useState(true)
  const [charges, setCharges] = useState<StatutoryCharge[]>([])
  const [chargeTypes, setChargeTypes] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalPaid: 0,
    pending: 0,
    overdue: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [chargesResponse, typesResponse] = await Promise.all([
        getMemberStatutoryCharges({ per_page: 100 }),
        getMemberStatutoryChargeTypes().catch(() => ({ success: false, data: [] })),
      ])

      if (chargesResponse.success) {
        const chargesData = Array.isArray(chargesResponse.charges) 
          ? chargesResponse.charges 
          : (chargesResponse as any).data || []
        setCharges(chargesData)

        // Calculate stats
        const totalPaid = chargesData
          .filter((c: StatutoryCharge) => c.status === "paid")
          .reduce((sum: number, c: StatutoryCharge) => sum + (Number(c.total_paid) || Number(c.amount) || 0), 0)
        
        const pending = chargesData.filter((c: StatutoryCharge) => c.status === "approved" || c.status === "pending").length
        
        const now = new Date()
        const overdue = chargesData.filter((c: StatutoryCharge) => {
          if (c.status === "paid") return false
          if (!c.due_date) return false
          const dueDate = new Date(c.due_date)
          return dueDate < now
        }).length

        setStats({ totalPaid, pending, overdue })
      }

      if (typesResponse.success && Array.isArray(typesResponse.data)) {
        setChargeTypes(typesResponse.data)
      }
    } catch (error: any) {
      console.error("Error fetching statutory charges:", error)
      sonnerToast.error("Failed to load statutory charges", {
        description: error.message || "Please try again later",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string, dueDate?: string) => {
    if (status === "paid") return "default"
    if (status === "rejected") return "destructive"
    if (dueDate) {
      const due = new Date(dueDate)
      if (due < new Date() && status !== "paid") return "destructive"
    }
    if (status === "approved" || status === "pending") return "secondary"
    return "outline"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />
      case "approved":
      case "pending":
        return <Clock className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string, dueDate?: string) => {
    if (status === "paid") return "Paid"
    if (status === "rejected") return "Rejected"
    if (dueDate) {
      const due = new Date(dueDate)
      if (due < new Date() && status !== "paid") return "Overdue"
    }
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getChargeTypeName = (type: string) => {
    const chargeType = chargeTypes.find((ct) => ct.type === type)
    return chargeType?.type || type
  }

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
            <div className="text-2xl font-bold">{formatCurrency(stats.totalPaid)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {charges.filter((c) => c.status === "paid").length} payment{charges.filter((c) => c.status === "paid").length !== 1 ? "s" : ""} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(
              charges
                .filter((c) => c.status === "approved" || c.status === "pending")
                .reduce((sum, c) => sum + (Number(c.remaining_amount) || Number(c.amount) || 0), 0)
            )}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.pending} payment{stats.pending !== 1 ? "s" : ""} pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(
                charges
                  .filter((c) => {
                    if (c.status === "paid") return false
                    if (!c.due_date) return false
                    return new Date(c.due_date) < new Date()
                  })
                  .reduce((sum, c) => sum + (Number(c.remaining_amount) || Number(c.amount) || 0), 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stats.overdue} payment{stats.overdue !== 1 ? "s" : ""} overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Your Charges</CardTitle>
          <CardDescription>Your statutory charge payments and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {charges.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No statutory charges found</p>
              <Link href="/dashboard/statutory-charges/pay">
                <Button className="mt-4">Make a Payment</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {charges.map((charge) => {
                const isOverdue = charge.due_date && new Date(charge.due_date) < new Date() && charge.status !== "paid"
                const canPay = (charge.status === "approved" || charge.status === "pending") && !isOverdue
                const remaining = Number(charge.remaining_amount) || Number(charge.amount) || 0

                return (
                  <div key={charge.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{getChargeTypeName(charge.type)}</h3>
                        <Badge variant={getStatusColor(charge.status, charge.due_date)} className="capitalize">
                          {getStatusIcon(charge.status)}
                          <span className="ml-1">{getStatusLabel(charge.status, charge.due_date)}</span>
                        </Badge>
                      </div>
                      {charge.description && (
                        <p className="text-sm text-muted-foreground mt-1">{charge.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {charge.due_date && (
                          <span>Due: {new Date(charge.due_date).toLocaleDateString()}</span>
                        )}
                        <span>Amount: {formatCurrency(Number(charge.amount) || 0)}</span>
                        {charge.status === "paid" && charge.total_paid && (
                          <span>Paid: {formatCurrency(Number(charge.total_paid))}</span>
                        )}
                        {remaining > 0 && charge.status !== "paid" && (
                          <span>Remaining: {formatCurrency(remaining)}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      {charge.status === "paid" ? (
                        <p className="text-xl font-bold text-green-600">{formatCurrency(Number(charge.total_paid) || Number(charge.amount) || 0)}</p>
                      ) : (
                        <>
                          <p className="text-xl font-bold">{formatCurrency(Number(charge.amount) || 0)}</p>
                          {canPay && (
                            <Link href={`/dashboard/statutory-charges/pay?charge=${charge.id}`}>
                              <Button size="sm" className="mt-2">
                                Pay Now
                              </Button>
                            </Link>
                          )}
                          {isOverdue && (
                            <Link href={`/dashboard/statutory-charges/pay?charge=${charge.id}`}>
                              <Button size="sm" variant="destructive" className="mt-2">
                                Pay Now
                              </Button>
                            </Link>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
