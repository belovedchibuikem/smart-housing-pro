"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Calendar, CreditCard, Percent, TrendingUp } from "lucide-react"
import type { MemberLandSubscriptionRow } from "@/lib/api/client"

type LandFinancialsProps = {
  subscription?: MemberLandSubscriptionRow | null
}

function formatCurrency(amount: number | undefined | null) {
  if (!amount || Number.isNaN(amount)) return "₦0"
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount)
}

export function LandFinancials({ subscription }: LandFinancialsProps) {
  if (!subscription) return null

  const totalCost = subscription.total_cost ?? 0
  const totalPaid = subscription.amount_paid ?? 0
  const balance = subscription.outstanding_balance ?? Math.max(0, totalCost - totalPaid)
  const progress = totalCost > 0 ? (totalPaid / totalCost) * 100 : 0
  const payments = subscription.payments ?? []

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentPayments = payments.filter((payment) => {
    if (!payment.paid_on) return false
    return new Date(payment.paid_on) >= thirtyDaysAgo
  })
  const recentPaymentsTotal = recentPayments.reduce((sum, payment) => sum + (payment.amount ?? 0), 0)

  const lastPayment = payments.length
    ? [...payments].sort((a, b) => {
        const da = a.paid_on ? new Date(a.paid_on).getTime() : 0
        const db = b.paid_on ? new Date(b.paid_on).getTime() : 0
        return db - da
      })[0]
    : null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
          <CardDescription>Summary of your journey to owning this land parcel.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Progress</span>
                <span className="font-semibold">{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Total cost</p>
                <p className="text-xl font-semibold">{formatCurrency(totalCost)}</p>
              </div>
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Total paid</p>
                <p className="text-xl font-semibold text-green-600">{formatCurrency(totalPaid)}</p>
              </div>
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Outstanding</p>
                <p className="text-xl font-semibold text-orange-600">{formatCurrency(balance)}</p>
              </div>
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Progress</p>
                <p className="text-xl font-semibold text-primary">{progress.toFixed(1)}%</p>
              </div>
            </div>

            <div className="grid gap-6 border-t pt-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="mb-1 flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  Recent payments (30 days)
                </p>
                <p className="text-lg font-semibold">{formatCurrency(recentPaymentsTotal)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{recentPayments.length} transaction(s)</p>
              </div>
              <div>
                <p className="mb-1 flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                  <CreditCard className="h-3 w-3" />
                  Recorded payments
                </p>
                <Badge variant="outline" className="text-xs">
                  {payments.length} total
                </Badge>
              </div>
              <div>
                <p className="mb-1 flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Last payment
                </p>
                {lastPayment ? (
                  <>
                    <p className="text-lg font-semibold">{formatCurrency(lastPayment.amount)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {lastPayment.paid_on ? new Date(lastPayment.paid_on).toLocaleDateString() : "—"}
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-semibold text-muted-foreground">No payments yet</p>
                )}
              </div>
              <div>
                <p className="mb-1 flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                  <Percent className="h-3 w-3" />
                  Completion status
                </p>
                <p className="text-lg font-semibold">
                  {progress >= 100 ? (
                    <span className="text-green-600">Completed</span>
                  ) : progress >= 75 ? (
                    <span className="text-blue-600">Near completion</span>
                  ) : progress >= 50 ? (
                    <span className="text-yellow-600">Halfway</span>
                  ) : progress >= 25 ? (
                    <span className="text-orange-600">In progress</span>
                  ) : (
                    <span className="text-gray-600">Getting started</span>
                  )}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{progress.toFixed(1)}% complete</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
