"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDownRight, ArrowUpRight, Search, Filter, Download, Calendar } from "lucide-react"

export default function WalletHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Mock data
  const allTransactions = [
    {
      id: "TXN001",
      type: "credit",
      description: "Wallet Top-up via Paystack",
      amount: 50000,
      date: "2024-01-15",
      time: "10:30 AM",
      status: "completed",
      reference: "PAY-001-2024",
    },
    {
      id: "TXN002",
      type: "debit",
      description: "Monthly Contribution Payment",
      amount: 25000,
      date: "2024-01-14",
      time: "02:15 PM",
      status: "completed",
      reference: "CON-002-2024",
    },
    {
      id: "TXN003",
      type: "credit",
      description: "Investment Return",
      amount: 15000,
      date: "2024-01-13",
      time: "09:45 AM",
      status: "completed",
      reference: "INV-003-2024",
    },
    {
      id: "TXN004",
      type: "debit",
      description: "Loan Repayment",
      amount: 30000,
      date: "2024-01-12",
      time: "11:20 AM",
      status: "completed",
      reference: "LOAN-004-2024",
    },
    {
      id: "TXN005",
      type: "credit",
      description: "Wallet Top-up via Bank Transfer",
      amount: 100000,
      date: "2024-01-10",
      time: "03:30 PM",
      status: "completed",
      reference: "PAY-005-2024",
    },
    {
      id: "TXN006",
      type: "debit",
      description: "Property Payment",
      amount: 75000,
      date: "2024-01-08",
      time: "01:20 PM",
      status: "completed",
      reference: "PROP-006-2024",
    },
    {
      id: "TXN007",
      type: "credit",
      description: "Refund - Cancelled Transaction",
      amount: 5000,
      date: "2024-01-05",
      time: "04:15 PM",
      status: "completed",
      reference: "REF-007-2024",
    },
    {
      id: "TXN008",
      type: "debit",
      description: "Investment Purchase",
      amount: 50000,
      date: "2024-01-03",
      time: "10:00 AM",
      status: "pending",
      reference: "INV-008-2024",
    },
  ]

  // Filter transactions
  const filteredTransactions = allTransactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || transaction.type === filterType
    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus
    const matchesDateFrom = !dateFrom || transaction.date >= dateFrom
    const matchesDateTo = !dateTo || transaction.date <= dateTo

    return matchesSearch && matchesType && matchesStatus && matchesDateFrom && matchesDateTo
  })

  const totalCredit = filteredTransactions.filter((t) => t.type === "credit").reduce((sum, t) => sum + t.amount, 0)
  const totalDebit = filteredTransactions.filter((t) => t.type === "debit").reduce((sum, t) => sum + t.amount, 0)

  const handleExport = () => {
    // Export functionality
    alert("Exporting transactions...")
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setFilterType("all")
    setFilterStatus("all")
    setDateFrom("")
    setDateTo("")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wallet History</h1>
        <p className="text-muted-foreground mt-2">View and filter your complete wallet transaction history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTransactions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Credit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₦{totalCredit.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Debit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₦{totalDebit.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Filter and search your transactions</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? "Hide" : "Show"} Filters
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by description or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-4 rounded-lg border bg-muted/50">
              <div className="space-y-2">
                <Label>Transaction Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="debit">Debit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date From</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Date To</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="pl-10" />
                </div>
              </div>

              <div className="md:col-span-2 lg:col-span-4">
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}

          {/* Transactions List */}
          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No transactions found matching your filters.</p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors gap-3"
                >
                  <div className="flex items-start gap-3 flex-1">
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
                    <div className="flex-1">
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.reference} • {transaction.date} • {transaction.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <Badge
                      variant={transaction.status === "completed" ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {transaction.status}
                    </Badge>
                    <p
                      className={`font-semibold text-lg ${
                        transaction.type === "credit" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.type === "credit" ? "+" : "-"}₦{transaction.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
