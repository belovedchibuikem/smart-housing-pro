"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default function AdminWalletTransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const transactions = [
    {
      id: "1",
      memberName: "John Doe",
      memberId: "FRSC001",
      type: "deposit",
      amount: 50000,
      method: "Paystack",
      status: "completed",
      date: "2024-01-10 14:30",
      reference: "TXN001234",
    },
    {
      id: "2",
      memberName: "Jane Smith",
      memberId: "FRSC002",
      type: "withdrawal",
      amount: 25000,
      method: "Bank Transfer",
      status: "pending",
      date: "2024-01-10 12:15",
      reference: "TXN001235",
    },
    {
      id: "3",
      memberName: "Mike Johnson",
      memberId: "FRSC003",
      type: "deposit",
      amount: 100000,
      method: "Remita",
      status: "completed",
      date: "2024-01-09 16:45",
      reference: "TXN001236",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wallet Transactions</h1>
        <p className="text-muted-foreground mt-2">View all wallet deposits and withdrawals</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>Monitor all wallet transactions across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-4 text-left text-sm font-medium">Member</th>
                    <th className="p-4 text-left text-sm font-medium">Type</th>
                    <th className="p-4 text-left text-sm font-medium">Amount</th>
                    <th className="p-4 text-left text-sm font-medium">Method</th>
                    <th className="p-4 text-left text-sm font-medium">Status</th>
                    <th className="p-4 text-left text-sm font-medium">Date</th>
                    <th className="p-4 text-left text-sm font-medium">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{transaction.memberName}</p>
                          <p className="text-sm text-muted-foreground">{transaction.memberId}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {transaction.type === "deposit" ? (
                            <ArrowDownRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-red-600" />
                          )}
                          <span className="capitalize">{transaction.type}</span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold">₦{transaction.amount.toLocaleString()}</td>
                      <td className="p-4">{transaction.method}</td>
                      <td className="p-4">
                        <Badge
                          variant={
                            transaction.status === "completed"
                              ? "default"
                              : transaction.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{transaction.date}</td>
                      <td className="p-4 text-sm font-mono">{transaction.reference}</td>
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
