"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle2, Clock, TrendingUp, Calendar, DollarSign, Building2, Users, Wallet, CreditCard, AlertCircle } from "lucide-react"
import { getPropertyPaymentSetup, type PropertyPaymentSetup, type PropertyPaymentHistoryEntry, type PropertyLedgerEntry } from "@/lib/api/client"
import type { MemberHouse } from "@/lib/api/client"

type PropertyPaymentJourneyProps = {
  house?: MemberHouse | null
}

function formatCurrency(amount: number | undefined | null) {
  if (!amount || Number.isNaN(amount)) return "₦0"
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount)
}

function formatDate(date: string | null | undefined) {
  if (!date) return "—"
  try {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return "—"
  }
}

function formatDateTime(date: string | null | undefined) {
  if (!date) return "—"
  try {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "—"
  }
}

const getPaymentMethodIcon = (method: string | null | undefined) => {
  switch (method?.toLowerCase()) {
    case "mortgage":
      return Building2
    case "cooperative":
      return Users
    case "equity_wallet":
    case "wallet":
      return Wallet
    case "loan":
      return Building2
    case "cash":
    default:
      return CreditCard
  }
}

const getPaymentMethodLabel = (method: string | null | undefined) => {
  if (!method) return "Payment"
  return method.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

export function PropertyPaymentJourney({ house }: PropertyPaymentJourneyProps) {
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

  // Combine payment history and ledger entries into a timeline
  const timelineEvents = useMemo(() => {
    if (!paymentSetup) return []

    const events: Array<{
      id: string
      date: string
      type: "payment" | "milestone" | "plan_setup" | "schedule_approval"
      title: string
      description: string
      amount?: number
      status: "completed" | "pending" | "overdue"
      icon: React.ComponentType<{ className?: string }>
      metadata?: Record<string, unknown>
    }> = []

    // Add payment history entries
    paymentSetup.payment_history?.forEach((payment: PropertyPaymentHistoryEntry) => {
      const Icon = getPaymentMethodIcon(payment.payment_method)
      events.push({
        id: `payment-${payment.id}`,
        date: payment.created_at || new Date().toISOString(),
        type: "payment",
        title: `Payment via ${getPaymentMethodLabel(payment.payment_method)}`,
        description: payment.description || `Payment of ${formatCurrency(payment.amount)}`,
        amount: payment.amount,
        status: payment.status === "completed" || payment.status === "success" ? "completed" : "pending",
        icon: Icon,
        metadata: payment.metadata,
      })
    })

    // Add ledger entries
    paymentSetup.ledger_entries?.forEach((entry: PropertyLedgerEntry) => {
      if (entry.direction === "credit") {
        const Icon = getPaymentMethodIcon(entry.source)
        events.push({
          id: `ledger-${entry.id}`,
          date: entry.paid_at || entry.created_at || new Date().toISOString(),
          type: "payment",
          title: `Payment via ${getPaymentMethodLabel(entry.source)}`,
          description: `Ledger entry: ${formatCurrency(entry.amount)}`,
          amount: entry.amount,
          status: entry.status === "completed" ? "completed" : "pending",
          icon: Icon,
          metadata: entry.metadata,
        })
      }
    })

    // Add payment plan setup milestone
    if (paymentSetup.payment_plan) {
      events.push({
        id: "plan-setup",
        date: paymentSetup.payment_plan.created_at || new Date().toISOString(),
        type: "plan_setup",
        title: "Payment Plan Created",
        description: `Payment plan configured with ${paymentSetup.payment_plan.selected_methods?.length || 0} payment method(s)`,
        status: "completed",
        icon: CheckCircle2,
      })
    }

    // Add schedule approvals
    const repaymentSchedules = paymentSetup.repayment_schedules || {}
    if (repaymentSchedules.mortgage?.schedule_approved) {
      events.push({
        id: "mortgage-approval",
        date: repaymentSchedules.mortgage.schedule_approved_at || new Date().toISOString(),
        type: "schedule_approval",
        title: "Mortgage Schedule Approved",
        description: "Mortgage repayment schedule has been approved",
        status: "completed",
        icon: CheckCircle2,
      })
    }
    if (repaymentSchedules.cooperative?.schedule_approved) {
      events.push({
        id: "cooperative-approval",
        date: repaymentSchedules.cooperative.schedule_approved_at || new Date().toISOString(),
        type: "schedule_approval",
        title: "Cooperative Deduction Schedule Approved",
        description: "Cooperative deduction schedule has been approved",
        status: "completed",
        icon: CheckCircle2,
      })
    }

    // Sort by date (most recent first)
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [paymentSetup])

  // Calculate milestones
  const milestones = useMemo(() => {
    if (!paymentSetup?.property) return []

    const propertyPrice = paymentSetup.property.price || 0
    const totalPaid = paymentSetup.property.total_paid || 0
    const progress = paymentSetup.property.progress || 0

    const milestonePercentages = [25, 50, 75, 100]
    const achievedMilestones: Array<{ percentage: number; achieved: boolean; date?: string }> = []

    milestonePercentages.forEach((percentage) => {
      const milestoneAmount = (percentage / 100) * propertyPrice
      const achieved = totalPaid >= milestoneAmount

      // Find when this milestone was achieved
      let achievedDate: string | undefined
      if (achieved) {
        // Find the first payment that crossed this threshold
        const sortedPayments = [...timelineEvents]
          .filter((e) => e.type === "payment" && e.status === "completed" && e.amount)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        let runningTotal = 0
        for (const payment of sortedPayments) {
          runningTotal += payment.amount || 0
          if (runningTotal >= milestoneAmount) {
            achievedDate = payment.date
            break
          }
        }
      }

      achievedMilestones.push({
        percentage,
        achieved,
        date: achievedDate,
      })
    })

    return achievedMilestones
  }, [paymentSetup, timelineEvents])

  // Calculate payment statistics
  const stats = useMemo(() => {
    if (!paymentSetup) return null

    const completedPayments = timelineEvents.filter(
      (e) => e.type === "payment" && e.status === "completed"
    )
    const totalPaid = completedPayments.reduce((sum, e) => sum + (e.amount || 0), 0)
    const averagePayment = completedPayments.length > 0 ? totalPaid / completedPayments.length : 0

    // Group by payment method
    const paymentsByMethod: Record<string, { count: number; total: number }> = {}
    completedPayments.forEach((payment) => {
      const method = payment.title.split("via ")[1] || "Unknown"
      if (!paymentsByMethod[method]) {
        paymentsByMethod[method] = { count: 0, total: 0 }
      }
      paymentsByMethod[method].count++
      paymentsByMethod[method].total += payment.amount || 0
    })

    return {
      totalPayments: completedPayments.length,
      totalPaid,
      averagePayment,
      paymentsByMethod,
    }
  }, [paymentSetup, timelineEvents])

  if (!house) {
    return (
      <div className="rounded-lg border bg-muted/40 p-6 text-center text-muted-foreground">
        <p>Please select a property to view payment journey.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const propertyPrice = paymentSetup?.property?.price ?? house.price ?? 0
  const totalPaid = paymentSetup?.property?.total_paid ?? house.total_paid ?? 0
  const progress = paymentSetup?.property?.progress ?? (propertyPrice > 0 ? (totalPaid / propertyPrice) * 100 : 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Payments</p>
                <p className="text-2xl font-bold">{stats?.totalPayments || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats?.totalPaid || totalPaid)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Payment</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.averagePayment)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Milestones</CardTitle>
          <CardDescription>Track your progress towards property ownership</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => {
              const isLast = index === milestones.length - 1
              return (
                <div key={milestone.percentage} className="relative">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      milestone.achieved ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                    }`}>
                      {milestone.achieved ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Clock className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-semibold ${milestone.achieved ? "text-green-600" : "text-gray-400"}`}>
                            {milestone.percentage}% Complete
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency((milestone.percentage / 100) * propertyPrice)}
                          </p>
                        </div>
                        {milestone.achieved && milestone.date && (
                          <Badge variant="outline" className="text-xs">
                            {formatDate(milestone.date)}
                          </Badge>
                        )}
                      </div>
                      {!isLast && (
                        <div className={`absolute left-5 top-10 w-0.5 h-full ${
                          milestone.achieved ? "bg-green-200" : "bg-gray-200"
                        }`} />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Payment Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Timeline</CardTitle>
          <CardDescription>Chronological history of all payments and milestones</CardDescription>
        </CardHeader>
        <CardContent>
          {timelineEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No payment history available yet.</p>
              <p className="text-sm mt-1">Your payment journey will appear here once you start making payments.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {timelineEvents.map((event, index) => {
                const Icon = event.icon
                const isLast = index === timelineEvents.length - 1
                return (
                  <div key={event.id} className="relative">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        event.status === "completed"
                          ? "bg-green-100 text-green-600"
                          : event.status === "overdue"
                            ? "bg-red-100 text-red-600"
                            : "bg-gray-100 text-gray-400"
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold">{event.title}</p>
                              {event.type === "milestone" && (
                                <Badge variant="default" className="text-xs">Milestone</Badge>
                              )}
                              {event.type === "plan_setup" && (
                                <Badge variant="secondary" className="text-xs">Plan Setup</Badge>
                              )}
                              {event.type === "schedule_approval" && (
                                <Badge variant="outline" className="text-xs">Schedule Approval</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                            {event.amount && (
                              <p className="text-lg font-bold text-green-600">{formatCurrency(event.amount)}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">{formatDateTime(event.date)}</p>
                          </div>
                          <Badge
                            variant={
                              event.status === "completed"
                                ? "default"
                                : event.status === "overdue"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {event.status === "completed" ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : event.status === "overdue" ? (
                              <AlertCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            {event.status}
                          </Badge>
                        </div>
                        {!isLast && (
                          <div className="absolute left-5 top-10 w-0.5 h-full bg-gray-200" />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods Breakdown */}
      {stats && Object.keys(stats.paymentsByMethod).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods Breakdown</CardTitle>
            <CardDescription>Payments grouped by payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.paymentsByMethod).map(([method, data]) => {
                const percentage = stats.totalPaid > 0 ? (data.total / stats.totalPaid) * 100 : 0
                return (
                  <div key={method} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">{method}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">{data.count} payment(s)</span>
                        <span className="font-semibold">{formatCurrency(data.total)}</span>
                        <span className="text-muted-foreground">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

