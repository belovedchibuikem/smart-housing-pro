"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Eye, Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react"

export default function AdminWalletsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const wallets = [
    {
      id: "1",
      memberName: "John Doe",
      memberId: "FRSC001",
      balance: 250000,
      totalDeposits: 500000,
      totalWithdrawals: 250000,
      status: "active",
      lastTransaction: "2024-01-10",
    },
    {
      id: "2",
      memberName: "Jane Smith",
      memberId: "FRSC002",
      balance: 150000,
      totalDeposits: 300000,
      totalWithdrawals: 150000,
      status: "active",
      lastTransaction: "2024-01-09",
    },
    {
      id: "3",
      memberName: "Mike Johnson",
      memberId: "FRSC003",
      balance: 50000,
      totalDeposits: 100000,
      totalWithdrawals: 50000,
      status: "suspended",
      lastTransaction: "2024-01-08",
    },
  ]

  const stats = [
    {
      title: "Total Wallet Balance",
      value: "₦450,000",
      icon: Wallet,
      trend: "+12.5%",
      trendUp: true,
    },
    {
      title: "Total Deposits",
      value: "₦900,000",
      icon: TrendingUp,
      trend: "+8.2%",
      trendUp: true,
    },
    {
      title: "Total Withdrawals",
      value: "₦450,000",
      icon: TrendingDown,
      trend: "-3.1%",
      trendUp: false,
    },
    {
      title: "Active Wallets",
      value: "2",
      icon: DollarSign,
      trend: "+2",
      trendUp: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wallet Management</h1>
        <p className="text-muted-foreground mt-2">Manage all member wallets and transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${stat.trendUp ? "text-green-600" : "text-red-600"}`}>
                  {stat.trend} from last month
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All Wallets</CardTitle>
          <CardDescription>View and manage member wallet balances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or member ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Wallets Table */}
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-4 text-left text-sm font-medium">Member</th>
                    <th className="p-4 text-left text-sm font-medium">Balance</th>
                    <th className="p-4 text-left text-sm font-medium">Total Deposits</th>
                    <th className="p-4 text-left text-sm font-medium">Total Withdrawals</th>
                    <th className="p-4 text-left text-sm font-medium">Status</th>
                    <th className="p-4 text-left text-sm font-medium">Last Transaction</th>
                    <th className="p-4 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {wallets.map((wallet) => (
                    <tr key={wallet.id} className="border-b">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{wallet.memberName}</p>
                          <p className="text-sm text-muted-foreground">{wallet.memberId}</p>
                        </div>
                      </td>
                      <td className="p-4 font-semibold">₦{wallet.balance.toLocaleString()}</td>
                      <td className="p-4 text-green-600">₦{wallet.totalDeposits.toLocaleString()}</td>
                      <td className="p-4 text-red-600">₦{wallet.totalWithdrawals.toLocaleString()}</td>
                      <td className="p-4">
                        <Badge variant={wallet.status === "active" ? "default" : "destructive"}>{wallet.status}</Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{wallet.lastTransaction}</td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
