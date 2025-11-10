"use client"

import { Card } from "@/components/ui/card"
import { Wallet, TrendingUp, Home, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardData {
  wallet_balance: number
  financial_summary: {
    total_contributions: number
    total_loans: number
    outstanding_loans: number
    total_investments: number
    total_repayments: number
  }
}

interface StatsCardsProps {
  data: DashboardData | null
  loading?: boolean
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatCompactCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `₦${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `₦${(amount / 1000).toFixed(1)}K`
  }
  return formatCurrency(amount)
}

export function StatsCards({ data, loading }: StatsCardsProps) {
  if (loading && !data) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-10 w-10 rounded-lg mb-4" />
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-20" />
          </Card>
        ))}
      </div>
    )
  }

  if (!data) {
    return null
  }

  // Calculate trends (simple comparison with previous period)
  // For now, we'll show basic info without trend calculations
  const stats = [
    {
      title: "Total Contributions",
      value: formatCurrency(data.financial_summary.total_contributions),
      change: null,
      trend: "neutral" as const,
      icon: Wallet,
      description: "All time contributions",
    },
    {
      title: "Active Loans",
      value: formatCurrency(data.financial_summary.outstanding_loans),
      change: data.financial_summary.total_loans > 0 ? `${Math.round((data.financial_summary.outstanding_loans / data.financial_summary.total_loans) * 100)}% outstanding` : null,
      trend: "neutral" as const,
      icon: TrendingUp,
      description: "Outstanding balance",
    },
    {
      title: "Total Investments",
      value: formatCurrency(data.financial_summary.total_investments),
      change: null,
      trend: "neutral" as const,
      icon: Home,
      description: "Active investments",
    },
    {
      title: "Wallet Balance",
      value: formatCurrency(data.wallet_balance),
      change: null,
      trend: "neutral" as const,
      icon: Wallet,
      description: "Available balance",
    },
  ]

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              {stat.change && stat.trend !== "neutral" && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    stat.trend === "up" ? "text-green-600" : "text-red-600",
                  )}
                >
                  {stat.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.change}
                </div>
              )}
              {stat.change && stat.trend === "neutral" && (
                <div className="text-xs text-muted-foreground">
                  {stat.change}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
