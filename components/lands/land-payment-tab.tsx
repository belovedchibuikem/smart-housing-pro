"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { MemberLandSubscriptionRow } from "@/lib/api/client"
import { isRepaymentReversed, repaymentStatusLabel } from "@/lib/utils/repayment-status"
import { GlPropertyLedgerPanel } from "@/components/financial/gl-property-ledger-panel"

type LandPaymentTabProps = {
  subscription?: MemberLandSubscriptionRow | null
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(
    amount,
  )
}

export function LandPaymentTab({ subscription }: LandPaymentTabProps) {
  if (!subscription) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        Payments are available once your land expression of interest is approved.
      </div>
    )
  }

  const payments = subscription.payments ?? []

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total cost</CardDescription>
            <CardTitle>{formatCurrency(subscription.total_cost)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Amount paid</CardDescription>
            <CardTitle>{formatCurrency(subscription.amount_paid)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Outstanding</CardDescription>
            <CardTitle className="text-emerald-700">{formatCurrency(subscription.outstanding_balance)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
          <CardDescription>Recorded land subscription payments</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => {
                  const reversed = isRepaymentReversed(p as { is_reversed?: boolean; status?: string; metadata?: { voided?: boolean } })
                  return (
                  <TableRow key={p.id} className={reversed ? "bg-destructive/5" : undefined}>
                    <TableCell>{p.paid_on ? new Date(p.paid_on).toLocaleDateString() : "—"}</TableCell>
                    <TableCell className={`font-semibold ${reversed ? "line-through text-muted-foreground" : ""}`}>
                      {formatCurrency(Number(p.amount))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={reversed ? "destructive" : "secondary"}>
                        {repaymentStatusLabel(p as { is_reversed?: boolean; status?: string })}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.description ?? "—"}</TableCell>
                  </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {subscription.subscription_id && (
        <Button asChild variant="outline">
          <Link href={`/dashboard/my-lands/${subscription.subscription_id}`}>Open full land account</Link>
        </Button>
      )}

      <GlPropertyLedgerPanel propertyType="land" propertyId={subscription.land_id} />
    </div>
  )
}
