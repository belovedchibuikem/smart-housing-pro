"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Loader2, TrendingUp, DollarSign, CreditCard, Calendar, Percent } from "lucide-react"
import { getPropertyPaymentSetup, type PropertyPaymentSetup } from "@/lib/api/client"
import type { MemberHouse } from "@/lib/api/client"

type PropertyFinancialsProps = {
  house?: MemberHouse | null
}

function formatCurrency(amount: number | undefined | null) {
  if (!amount || Number.isNaN(amount)) return "₦0"
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount)
}

export function PropertyFinancials({ house }: PropertyFinancialsProps) {
  const [paymentSetup, setPaymentSetup] = useState<PropertyPaymentSetup | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!house?.id) return

    let isMounted = true
    const fetchPaymentSetup = async () => {
      try {
        setLoading(true)
        const response = await getPropertyPaymentSetup(house.id)
        if (isMounted && response.success) {
          setPaymentSetup(response.data)
        }
      } catch (error) {
        console.error("Failed to load payment setup:", error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchPaymentSetup()

    return () => {
      isMounted = false
    }
  }, [house?.id])

  if (!house) return null

  // Use actual payment data if available, otherwise fall back to house data
  const totalPaid = paymentSetup?.property?.total_paid ?? house.total_paid ?? 0
  const propertyPrice = paymentSetup?.property?.price ?? house.price ?? 0
  const balance = paymentSetup?.property?.balance ?? Math.max(0, propertyPrice - totalPaid)
  const progress = paymentSetup?.property?.progress ?? (propertyPrice > 0 ? (totalPaid / propertyPrice) * 100 : 0)
  const ledgerTotalPaid = paymentSetup?.ledger_total_paid ?? 0
  const paymentHistory = paymentSetup?.payment_history ?? []
  const ledgerEntries = paymentSetup?.ledger_entries ?? []
  
  // Calculate active payment methods
  const activePaymentMethods = new Set<string>()
  paymentHistory.forEach((payment) => {
    if (payment.payment_method && (payment.status === "completed" || payment.status === "success")) {
      activePaymentMethods.add(payment.payment_method)
    }
  })
  ledgerEntries.forEach((entry) => {
    if (entry.source && entry.direction === "credit" && entry.status === "completed") {
      activePaymentMethods.add(entry.source)
    }
  })

  // Calculate next payment due (from repayment schedules)
  const repaymentSchedules = paymentSetup?.repayment_schedules ?? {}
  let nextPaymentDue: { amount: number; date: string; type: string } | null = null
  
  // Check mortgage schedule
  if (repaymentSchedules.mortgage?.schedule) {
    const nextMortgagePayment = repaymentSchedules.mortgage.schedule.find(
      (entry) => entry.status === "pending" || entry.status === "overdue"
    )
    if (nextMortgagePayment) {
      nextPaymentDue = {
        amount: nextMortgagePayment.total ?? 0,
        date: nextMortgagePayment.due_date ?? "",
        type: "Mortgage",
      }
    }
  }

  // Check loan schedule
  if (!nextPaymentDue && repaymentSchedules.loan?.schedule) {
    const nextLoanPayment = repaymentSchedules.loan.schedule.find(
      (entry) => entry.status === "pending" || entry.status === "overdue"
    )
    if (nextLoanPayment) {
      nextPaymentDue = {
        amount: nextLoanPayment.total ?? 0,
        date: nextLoanPayment.due_date ?? "",
        type: "Loan",
      }
    }
  }

  // Check cooperative schedule
  if (!nextPaymentDue && repaymentSchedules.cooperative?.schedule) {
    const nextCoopPayment = repaymentSchedules.cooperative.schedule.find(
      (entry) => entry.status === "pending" || entry.status === "overdue"
    )
    if (nextCoopPayment) {
      nextPaymentDue = {
        amount: nextCoopPayment.total ?? 0,
        date: nextCoopPayment.due_date ?? "",
        type: "Cooperative Deduction",
      }
    }
  }

  // Calculate recent payments (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentPayments = paymentHistory.filter((payment) => {
    if (!payment.created_at) return false
    const paymentDate = new Date(payment.created_at)
    return paymentDate >= thirtyDaysAgo && (payment.status === "completed" || payment.status === "success")
  })
  const recentPaymentsTotal = recentPayments.reduce((sum, payment) => sum + (payment.amount ?? 0), 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
          <CardDescription>Summary of your journey to owning this property.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Progress</span>
                  <span className="font-semibold">{progress.toFixed(1)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Main Financial Metrics */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Property Value</p>
                  <p className="text-xl font-semibold">{formatCurrency(propertyPrice)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Paid</p>
                  <p className="text-xl font-semibold text-green-600">{formatCurrency(totalPaid)}</p>
                  {ledgerTotalPaid > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      (₦{ledgerTotalPaid.toLocaleString()} via ledger)
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Remaining Balance</p>
                  <p className="text-xl font-semibold text-orange-600">{formatCurrency(balance)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Progress</p>
                  <p className="text-xl font-semibold text-primary">{progress.toFixed(1)}%</p>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 pt-4 border-t">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Recent Payments (30 days)
                  </p>
                  <p className="text-lg font-semibold">{formatCurrency(recentPaymentsTotal)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{recentPayments.length} transaction(s)</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    Active Payment Methods
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activePaymentMethods.size > 0 ? (
                      Array.from(activePaymentMethods).map((method) => (
                        <Badge key={method} variant="outline" className="text-xs">
                          {method.replace(/_/g, " ")}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">None</span>
                    )}
                  </div>
                </div>
                {nextPaymentDue ? (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Next Payment Due
                    </p>
                    <p className="text-lg font-semibold">{formatCurrency(nextPaymentDue.amount)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {nextPaymentDue.type} • {new Date(nextPaymentDue.date).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Next Payment Due
                    </p>
                    <p className="text-lg font-semibold text-muted-foreground">No upcoming payments</p>
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    Completion Status
                  </p>
                  <p className="text-lg font-semibold">
                    {progress >= 100 ? (
                      <span className="text-green-600">Completed</span>
                    ) : progress >= 75 ? (
                      <span className="text-blue-600">Near Completion</span>
                    ) : progress >= 50 ? (
                      <span className="text-yellow-600">Halfway</span>
                    ) : progress >= 25 ? (
                      <span className="text-orange-600">In Progress</span>
                    ) : (
                      <span className="text-gray-600">Getting Started</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{progress.toFixed(1)}% complete</p>
                </div>
              </div>

              {/* Current Value Cards */}
              {(house.current_value || house.predictive_value) && (
                <div className="grid gap-6 md:grid-cols-2 pt-4 border-t">
                  {house.current_value && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Current Value</p>
                      <p className="text-xl font-semibold text-primary">{formatCurrency(house.current_value)}</p>
                    </div>
                  )}
                  {house.predictive_value && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Predictive Value</p>
                      <p className="text-xl font-semibold text-primary/80">{formatCurrency(house.predictive_value)}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

