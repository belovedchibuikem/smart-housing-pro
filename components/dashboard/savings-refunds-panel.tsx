"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PiggyBank, Banknote, RotateCcw, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    })
  } catch {
    return iso
  }
}

export interface SavingsRefundsPanelProps {
  loading?: boolean
  contributionBalance?: number
  totalContributions?: number
  totalRefunds?: number
  totalContributionRefunded?: number
  history?: Array<{
    id: string
    ticket_number: string | null
    amount: number
    source: string | null
    source_label: string
    status: string
    reason: string | null
    reference: string | null
    created_at: string | null
    completed_at: string | null
  }>
}

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default"
    case "processing":
    case "approved":
      return "secondary"
    case "rejected":
      return "destructive"
    default:
      return "outline"
  }
}

export function SavingsRefundsPanel({
  loading,
  contributionBalance = 0,
  totalContributions = 0,
  totalRefunds = 0,
  totalContributionRefunded = 0,
  history = [],
}: SavingsRefundsPanelProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full max-w-md mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-40 w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  const items = history ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Contributions &amp; refunds</CardTitle>
        <CardDescription>
          Your savings contribution balance, lifetime totals, and refund history (including source).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <PiggyBank className="h-4 w-4" />
              Contribution balance
            </div>
            <p className="text-xl font-bold tabular-nums">{formatCurrency(contributionBalance)}</p>
            <p className="text-xs text-muted-foreground mt-1">Available in your savings wallet</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Banknote className="h-4 w-4" />
              Total contributions
            </div>
            <p className="text-xl font-bold tabular-nums">{formatCurrency(totalContributions)}</p>
            <p className="text-xs text-muted-foreground mt-1">Lifetime amount credited</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <RotateCcw className="h-4 w-4" />
              Refunded from contributions
            </div>
            <p className="text-xl font-bold tabular-nums">{formatCurrency(totalContributionRefunded)}</p>
            <p className="text-xs text-muted-foreground mt-1">Taken from contribution wallet</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <RotateCcw className="h-4 w-4" />
              Total refunds
            </div>
            <p className="text-xl font-bold tabular-nums">{formatCurrency(totalRefunds)}</p>
            <p className="text-xs text-muted-foreground mt-1">All sources, completed &amp; processing</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Refund history</h3>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center border rounded-lg">No refunds yet</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Ticket</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                        {formatWhen(row.completed_at || row.created_at)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{row.ticket_number || "—"}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatCurrency(row.amount)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{row.source_label || row.source || "—"}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(row.status)} className="capitalize">
                          {row.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground max-w-[140px] truncate">
                        {row.reference || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function SavingsRefundsPanelLoading() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <CardTitle>Contributions &amp; refunds</CardTitle>
        </div>
      </CardHeader>
    </Card>
  )
}
