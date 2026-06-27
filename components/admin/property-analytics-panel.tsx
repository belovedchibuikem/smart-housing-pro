"use client"

import { useEffect, useState } from "react"
import { Loader2, TrendingUp, Wallet, AlertCircle, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { apiFetch } from "@/lib/api/client"
import { formatNaira } from "@/lib/properties/pricing"

type SubscriptionRow = {
  allocation_id: string
  member_name: string
  member_number: string
  slots_assigned: number
  price_per_slot: number
  subscription_cost: number
  amount_paid: number
  outstanding: number
  collection_rate: number
  payment_status: string
  allocation_status?: string
  allocation_date?: string
}

type AnalyticsData = {
  pricing: {
    price_per_slot: number
    total_slots: number
    total_listing_cost: number
  }
  financial_summary: {
    total_listing_cost: number
    expected_from_subscriptions: number
    amount_collected: number
    outstanding: number
    collection_rate: number
    unassigned_slots: number
    unassigned_slot_value: number
    potential_total_if_fully_subscribed: number
  }
  subscription_breakdown: SubscriptionRow[]
  subscriber_count: number
}

export function PropertyAnalyticsPanel({ propertyId }: { propertyId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    apiFetch<{ success: boolean; data: AnalyticsData }>(`/admin/properties/${propertyId}/analytics`)
      .then((res) => {
        if (mounted && res.success) setData(res.data)
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : "Failed to load analytics")
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [propertyId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading analytics…
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {error ?? "Analytics unavailable"}
        </CardContent>
      </Card>
    )
  }

  const summary = data.financial_summary

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" /> Expected from subscribers
            </CardDescription>
            <CardTitle className="text-xl tabular-nums">
              {formatNaira(summary.expected_from_subscriptions)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Wallet className="h-4 w-4" /> Collected
            </CardDescription>
            <CardTitle className="text-xl tabular-nums text-green-600">
              {formatNaira(summary.amount_collected)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4" /> Outstanding
            </CardDescription>
            <CardTitle className="text-xl tabular-nums text-orange-600">
              {formatNaira(summary.outstanding)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Users className="h-4 w-4" /> Subscribers
            </CardDescription>
            <CardTitle className="text-xl">{data.subscriber_count}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {summary.unassigned_slots} slot(s) unassigned ·{" "}
              {formatNaira(summary.unassigned_slot_value)} potential
            </p>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Collection progress</CardTitle>
          <CardDescription>
            {summary.collection_rate}% of expected subscription revenue collected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={Math.min(100, summary.collection_rate)} className="h-3" />
          <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between rounded-md bg-muted/50 px-3 py-2">
              <span className="text-muted-foreground">Listing capacity value</span>
              <span className="font-medium tabular-nums">{formatNaira(summary.total_listing_cost)}</span>
            </div>
            <div className="flex justify-between rounded-md bg-muted/50 px-3 py-2">
              <span className="text-muted-foreground">If fully subscribed</span>
              <span className="font-medium tabular-nums">
                {formatNaira(summary.potential_total_if_fully_subscribed)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription breakdown</CardTitle>
          <CardDescription>Paid vs outstanding per member subscription</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {data.subscription_breakdown.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">No subscriptions yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead className="text-right">Slots</TableHead>
                  <TableHead className="text-right">Per slot</TableHead>
                  <TableHead className="text-right">Total cost</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.subscription_breakdown.map((row) => (
                  <TableRow key={row.allocation_id}>
                    <TableCell>
                      <div className="font-medium">{row.member_name}</div>
                      <div className="text-xs text-muted-foreground">{row.member_number}</div>
                    </TableCell>
                    <TableCell className="text-right">{row.slots_assigned}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatNaira(row.price_per_slot)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatNaira(row.subscription_cost)}</TableCell>
                    <TableCell className="text-right tabular-nums text-green-600">
                      {formatNaira(row.amount_paid)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-orange-600">
                      {formatNaira(row.outstanding)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={row.payment_status === "fully_paid" ? "default" : "secondary"}>
                        {row.payment_status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
