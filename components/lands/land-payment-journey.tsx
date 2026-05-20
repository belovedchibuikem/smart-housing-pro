"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle2, Calendar, DollarSign } from "lucide-react"
import { getMemberLandSubscriptionDetail, type MemberLandSubscriptionRow } from "@/lib/api/client"

type LandPaymentJourneyProps = {
  subscriptionId?: string | null
  summary?: MemberLandSubscriptionRow | null
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(
    amount,
  )
}

function formatDate(date?: string | null) {
  if (!date) return "—"
  try {
    return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  } catch {
    return "—"
  }
}

export function LandPaymentJourney({ subscriptionId, summary }: LandPaymentJourneyProps) {
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    if (!subscriptionId) return
    let mounted = true
    void (async () => {
      try {
        setLoading(true)
        const res = await getMemberLandSubscriptionDetail(subscriptionId)
        if (mounted && res.success && res.data) {
          setDetail(res.data as Record<string, unknown>)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [subscriptionId])

  const totalCost = Number(detail?.total_cost ?? summary?.total_cost ?? 0)
  const paid = Number(detail?.amount_paid ?? summary?.amount_paid ?? 0)
  const outstanding = Number(detail?.outstanding_balance ?? summary?.outstanding_balance ?? 0)
  const progress = totalCost > 0 ? Math.min(100, Math.round((paid / totalCost) * 100)) : 0

  const payments = useMemo(() => {
    const list = (detail?.payments ?? summary?.payments) as Array<{
      id: string
      amount: number
      paid_on?: string
      description?: string | null
    }> | undefined
    return Array.isArray(list) ? [...list].sort((a, b) => String(b.paid_on).localeCompare(String(a.paid_on))) : []
  }, [detail, summary])

  if (!subscriptionId && !summary) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        Payment journey is available after your expression of interest is approved and a land account is opened.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading payment journey…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            Land payment progress
          </CardTitle>
          <CardDescription>Track contributions toward your allocated land parcel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="text-2xl font-bold">{formatCurrency(paid)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-2xl font-semibold text-emerald-700">{formatCurrency(outstanding)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-muted-foreground">{progress}% of total land cost paid</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="flex items-start gap-3 rounded-lg border p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">{formatCurrency(Number(payment.amount))}</span>
                    <Badge variant="outline">{formatDate(payment.paid_on)}</Badge>
                  </div>
                  {payment.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">{payment.description}</p>
                  ) : null}
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Recorded payment
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
