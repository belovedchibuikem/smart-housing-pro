"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { MemberHouse } from "@/lib/api/client"

type PropertyFinancialsProps = {
  house?: MemberHouse | null
}

function formatCurrency(amount: number | undefined) {
  if (!amount || Number.isNaN(amount)) return "₦0"
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount)
}

export function PropertyFinancials({ house }: PropertyFinancialsProps) {
  if (!house) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
        <CardDescription>Summary of your journey to owning this house.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">House Amount</p>
          <p className="text-xl font-semibold">{formatCurrency(house.price)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Paid</p>
          <p className="text-xl font-semibold text-green-600">{formatCurrency(house.total_paid)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Current Value</p>
          <p className="text-xl font-semibold text-primary">{formatCurrency(house.current_value)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Predictive Value</p>
          <p className="text-xl font-semibold text-primary/80">{formatCurrency(house.predictive_value)}</p>
        </div>
      </CardContent>
    </Card>
  )
}

