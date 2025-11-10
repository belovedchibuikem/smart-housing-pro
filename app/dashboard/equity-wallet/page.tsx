"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, History, TrendingUp, Eye, EyeOff, Download, Home } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"

interface EquityWalletBalance {
  balance: number
  total_contributed: number
  total_used: number
  currency: string
  is_active: boolean
  last_updated_at?: string
}

interface EquityTransaction {
  id: string
  type: "contribution" | "deposit_payment" | "refund" | "adjustment"
  amount: number
  balance_before: number
  balance_after: number
  reference?: string
  reference_type?: string
  description?: string
  created_at: string
}

export default function EquityWalletPage() {
  const [showBalance, setShowBalance] = useState(true)
  const [loading, setLoading] = useState(true)
  const [walletBalance, setWalletBalance] = useState<EquityWalletBalance>({
    balance: 0,
    total_contributed: 0,
    total_used: 0,
    currency: "NGN",
    is_active: true,
  })
  const [recentTransactions, setRecentTransactions] = useState<EquityTransaction[]>([])

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        setLoading(true)
        const [balanceRes, txRes] = await Promise.all([
          apiFetch<{ success: boolean; data: EquityWalletBalance }>('/user/equity-wallet/balance').catch(() => ({ success: false, data: walletBalance })),
          apiFetch<{ success: boolean; data: EquityTransaction[]; pagination?: any }>('/user/equity-wallet/transactions?per_page=5').catch(() => ({ success: false, data: [] })),
        ])
        if (!isMounted) return

        if (balanceRes.success && balanceRes.data) {
          setWalletBalance(balanceRes.data)
        }

        if (txRes.success && txRes.data) {
          const transactions = Array.isArray(txRes.data) ? txRes.data : (txRes.data as any).data || []
          setRecentTransactions(transactions)
        }
      } catch (error: any) {
        console.error('Error fetching equity wallet:', error)
        sonnerToast.error("Failed to load equity wallet", {
          description: error.message || "Please try again later",
        })
      } finally {
        if (isMounted) setLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  const stats = useMemo(() => {
    const contributions = recentTransactions
      .filter((t) => t.type === 'contribution')
      .reduce((sum, t) => sum + t.amount, 0)
    const payments = recentTransactions
      .filter((t) => t.type === 'deposit_payment')
      .reduce((sum, t) => sum + t.amount, 0)
    const monthTotal = recentTransactions
      .filter((t) => {
        const d = new Date(t.created_at)
        const now = new Date()
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      .reduce((sum, t) => sum + (t.type === 'contribution' ? t.amount : -t.amount), 0)
    return [
      { label: "Total Contributed", value: walletBalance.total_contributed, icon: ArrowDownRight, color: "text-green-600" },
      { label: "Total Used", value: walletBalance.total_used, icon: ArrowUpRight, color: "text-red-600" },
      { label: "This Month", value: monthTotal, icon: TrendingUp, color: "text-blue-600" },
    ]
  }, [recentTransactions, walletBalance])

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'contribution':
        return <ArrowDownRight className="h-4 w-4" />
      case 'deposit_payment':
        return <Home className="h-4 w-4" />
      default:
        return <ArrowUpRight className="h-4 w-4" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'contribution':
        return "bg-green-100 text-green-600"
      case 'deposit_payment':
        return "bg-blue-100 text-blue-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Equity Wallet</h1>
        <p className="text-muted-foreground mt-2">Manage your equity contributions for property deposits</p>
      </div>

      {/* Wallet Balance Card */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              <CardTitle className="text-lg">Equity Wallet Balance</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowBalance(!showBalance)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-3xl font-bold">{showBalance ? `₦${walletBalance.balance.toLocaleString()}` : "₦••••••"}</p>
              <p className="text-sm text-primary-foreground/80 mt-1">Available Balance for Property Deposits</p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="secondary">
                <Link href="/dashboard/equity-contributions/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Make Contribution
                </Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href="/dashboard/equity-contributions">
                  <History className="h-4 w-4 mr-2" />
                  View Contributions
                </Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href="/dashboard/properties">
                  <Home className="h-4 w-4 mr-2" />
                  Browse Properties
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{stat.value.toLocaleString()}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Wallet Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Wallet Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Contributed</span>
              <span className="font-semibold">₦{walletBalance.total_contributed.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Used</span>
              <span className="font-semibold text-red-600">₦{walletBalance.total_used.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-medium">Available Balance</span>
              <span className="font-bold text-lg text-primary">₦{walletBalance.balance.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">About Equity Wallet</p>
              <p className="text-xs text-blue-700 mt-1">
                Your equity wallet is specifically for property deposits and payments. Funds are automatically added when your equity contributions are approved.
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-900">Using Your Wallet</p>
              <p className="text-xs text-green-700 mt-1">
                You can use your equity wallet balance when purchasing properties. Select "Equity Wallet" as your payment method during property checkout.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest equity wallet activities</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/equity-contributions">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading && recentTransactions.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6">Loading transactions…</div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6">No recent transactions</div>
            ) : recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getTransactionColor(transaction.type)}`}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-medium">
                      {transaction.description || transaction.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString()}
                      {transaction.reference && ` • ${transaction.reference_type || 'Ref'}: ${transaction.reference}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${transaction.type === 'contribution' ? "text-green-600" : "text-red-600"}`}>
                    {transaction.type === 'contribution' ? "+" : "-"}₦{transaction.amount.toLocaleString()}
                  </p>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {transaction.type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

