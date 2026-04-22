"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Wallet, TrendingUp, CreditCard, PiggyBank, Loader2 } from "lucide-react"
import type { AdminRefundMemberSummary } from "@/lib/api/client"

type Summary = AdminRefundMemberSummary["summary"]

function formatCurrency(value?: number | null) {
  const numeric = Number(value ?? 0)
  if (!Number.isFinite(numeric)) {
    return "₦0"
  }
  return `₦${numeric.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function MemberFinancialSummaryGrid({
  summary,
  loading,
  className,
}: {
  summary: Summary | null
  loading?: boolean
  className?: string
}) {
  if (loading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className ?? ""}`}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!summary) {
    return null
  }

  return (
    <div className={`grid grid-cols-2 gap-4 ${className ?? ""}`}>
      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Wallet className="h-4 w-4" />
            <span className="text-xs uppercase font-semibold">Wallet</span>
          </div>
          <p className="text-lg font-bold text-blue-900 dark:text-blue-100 tabular-nums">{formatCurrency(summary.wallet.balance)}</p>
        </CardContent>
      </Card>
      <Card className="bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CreditCard className="h-4 w-4" />
            <span className="text-xs uppercase font-semibold">Contributions</span>
          </div>
          <p className="text-lg font-bold text-green-900 dark:text-green-100 tabular-nums">
            {formatCurrency(summary.contribution.available)}
          </p>
          <p className="text-xs text-green-700 dark:text-green-300">
            Total: {formatCurrency(summary.contribution.total)} • Refunded: {formatCurrency(summary.contribution.refunded)}
          </p>
        </CardContent>
      </Card>
      <Card className="bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-900">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs uppercase font-semibold">Investment Profit</span>
          </div>
          <p className="text-lg font-bold text-purple-900 dark:text-purple-100 tabular-nums">
            {formatCurrency(summary.investment_returns.available)}
          </p>
          <p className="text-xs text-purple-700 dark:text-purple-300">
            Total: {formatCurrency(summary.investment_returns.total)} • Refunded: {formatCurrency(summary.investment_returns.refunded)}
          </p>
        </CardContent>
      </Card>
      <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <PiggyBank className="h-4 w-4" />
            <span className="text-xs uppercase font-semibold">Equity Wallet</span>
          </div>
          <p className="text-lg font-bold text-amber-900 dark:text-amber-100 tabular-nums">
            {formatCurrency(summary.equity_wallet.available ?? summary.equity_wallet.balance)}
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Total: {formatCurrency(summary.equity_wallet.total)} • Refunded: {formatCurrency(summary.equity_wallet.refunded)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
