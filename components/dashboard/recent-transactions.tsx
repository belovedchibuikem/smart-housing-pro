"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useMemo } from "react"

interface DashboardData {
  recent_activity: {
    contributions: Array<{
      id: string
      amount: number
      status: string
      created_at: string
      type?: string
    }>
    loans: Array<{
      id: string
      amount: number
      status: string
      created_at: string
      type?: string
    }>
    investments: Array<{
      id: string
      amount: number
      status: string
      created_at: string
    }>
  }
}

interface RecentTransactionsProps {
  data: DashboardData | null
  loading?: boolean
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateString
  }
}

export function RecentTransactions({ data, loading }: RecentTransactionsProps) {
  // Combine all recent activities into transactions
  const transactions = useMemo(() => {
    if (!data) return []

    const allTransactions: Array<{
      id: string
      type: "credit" | "debit"
      description: string
      amount: number
      date: string
      status: string
    }> = []

    // Add contributions as credits
    data.recent_activity.contributions.forEach((contribution) => {
      allTransactions.push({
        id: contribution.id,
      type: "credit",
        description: contribution.type === "monthly" ? "Monthly Contribution" : "Contribution",
        amount: contribution.amount,
        date: formatDate(contribution.created_at),
        status: contribution.status,
      })
    })

    // Add loans as debits (loan taken)
    data.recent_activity.loans.forEach((loan) => {
      allTransactions.push({
        id: loan.id,
      type: "debit",
        description: `Loan ${loan.type || "Application"}`,
        amount: loan.amount,
        date: formatDate(loan.created_at),
        status: loan.status,
      })
    })

    // Add investments as credits (money invested)
    data.recent_activity.investments.forEach((investment) => {
      allTransactions.push({
        id: investment.id,
      type: "credit",
        description: "Investment",
        amount: investment.amount,
        date: formatDate(investment.created_at),
        status: investment.status,
      })
    })

    // Sort by date (most recent first) and limit to 5
    return allTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }, [data])

  if (loading && !data) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (!data || transactions.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            <p className="text-sm text-muted-foreground">Your latest account activity</p>
          </div>
          <Badge variant="outline">Last 30 days</Badge>
        </div>
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          <p>No recent transactions</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <p className="text-sm text-muted-foreground">Your latest account activity</p>
        </div>
        <Badge variant="outline">Recent</Badge>
      </div>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  transaction.type === "credit" ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"
                }`}
              >
                {transaction.type === "credit" ? (
                  <ArrowDownLeft className="h-5 w-5 text-green-600 dark:text-green-500" />
                ) : (
                  <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-500" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">{transaction.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`font-semibold ${transaction.type === "credit" ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}
              >
                {transaction.type === "credit" ? "+" : "-"}₦{Number(transaction.amount).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{transaction.id.substring(0, 8)}...</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
