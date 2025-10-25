"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, History, TrendingUp, Eye, EyeOff, Download } from "lucide-react"

export default function WalletPage() {
  const [showBalance, setShowBalance] = useState(true)

  // Mock data
  const walletBalance = 450000
  const recentTransactions = [
    {
      id: "TXN001",
      type: "credit",
      description: "Wallet Top-up via Paystack",
      amount: 50000,
      date: "2024-01-15",
      time: "10:30 AM",
      status: "completed",
    },
    {
      id: "TXN002",
      type: "debit",
      description: "Monthly Contribution Payment",
      amount: 25000,
      date: "2024-01-14",
      time: "02:15 PM",
      status: "completed",
    },
    {
      id: "TXN003",
      type: "credit",
      description: "Investment Return",
      amount: 15000,
      date: "2024-01-13",
      time: "09:45 AM",
      status: "completed",
    },
    {
      id: "TXN004",
      type: "debit",
      description: "Loan Repayment",
      amount: 30000,
      date: "2024-01-12",
      time: "11:20 AM",
      status: "completed",
    },
  ]

  const stats = [
    { label: "Total Income", value: 165000, icon: ArrowDownRight, color: "text-green-600" },
    { label: "Total Expenses", value: 55000, icon: ArrowUpRight, color: "text-red-600" },
    { label: "This Month", value: 110000, icon: TrendingUp, color: "text-blue-600" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Wallet</h1>
        <p className="text-muted-foreground mt-2">Manage your funds and view transaction history</p>
      </div>

      {/* Wallet Balance Card */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              <CardTitle className="text-lg">Wallet Balance</CardTitle>
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
              <p className="text-3xl font-bold">{showBalance ? `₦${walletBalance.toLocaleString()}` : "₦••••••"}</p>
              <p className="text-sm text-primary-foreground/80 mt-1">Available Balance</p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="secondary">
                <Link href="/dashboard/wallet/add-funds">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Funds
                </Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href="/dashboard/wallet/history">
                  <History className="h-4 w-4 mr-2" />
                  View History
                </Link>
              </Button>
              <Button size="sm" variant="secondary">
                <Download className="h-4 w-4 mr-2" />
                Download Statement
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

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest wallet activities</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/wallet/history">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      transaction.type === "credit" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}
                  >
                    {transaction.type === "credit" ? (
                      <ArrowDownRight className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.date} • {transaction.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                    {transaction.type === "credit" ? "+" : "-"}₦{transaction.amount.toLocaleString()}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {transaction.status}
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
