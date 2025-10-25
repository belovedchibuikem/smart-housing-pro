"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, HandCoins, CheckCircle, Clock, XCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function LoanReportsPage() {
  const [dateRange, setDateRange] = useState("this-month")

  const stats = [
    { label: "Total Loans", value: "₦156.8M", icon: HandCoins, color: "text-blue-600" },
    { label: "Active Loans", value: "156", icon: CheckCircle, color: "text-green-600" },
    { label: "Pending Applications", value: "23", icon: Clock, color: "text-orange-600" },
    { label: "Defaulted", value: "8", icon: XCircle, color: "text-red-600" },
  ]

  const loans = [
    {
      id: "L001",
      member: "John Doe",
      type: "Housing Loan",
      amount: "₦5,000,000",
      disbursed: "₦5,000,000",
      repaid: "₦1,200,000",
      balance: "₦3,800,000",
      status: "Active",
    },
    {
      id: "L002",
      member: "Jane Smith",
      type: "Cash Loan",
      amount: "₦2,000,000",
      disbursed: "₦2,000,000",
      repaid: "₦800,000",
      balance: "₦1,200,000",
      status: "Active",
    },
    {
      id: "L003",
      member: "Mike Johnson",
      type: "Emergency Loan",
      amount: "₦500,000",
      disbursed: "₦0",
      repaid: "₦0",
      balance: "₦500,000",
      status: "Pending",
    },
    {
      id: "L004",
      member: "Sarah Williams",
      type: "Housing Loan",
      amount: "₦8,000,000",
      disbursed: "₦8,000,000",
      repaid: "₦8,000,000",
      balance: "₦0",
      status: "Completed",
    },
    {
      id: "L005",
      member: "David Brown",
      type: "Cash Loan",
      amount: "₦1,500,000",
      disbursed: "₦1,500,000",
      repaid: "₦500,000",
      balance: "₦1,000,000",
      status: "Defaulted",
    },
  ]

  const loanTypes = [
    { type: "Housing Loan", count: 89, totalAmount: "₦98.5M", avgAmount: "₦1.1M", repaymentRate: "92%" },
    { type: "Cash Loan", count: 54, totalAmount: "₦42.3M", avgAmount: "₦783K", repaymentRate: "88%" },
    { type: "Emergency Loan", count: 13, totalAmount: "₦16.0M", avgAmount: "₦1.2M", repaymentRate: "95%" },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Loan Reports</h1>
          <p className="text-muted-foreground mt-1">Track loan disbursements and repayments</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Loan Type Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Type Analysis</CardTitle>
          <CardDescription>Performance metrics by loan type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan Type</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-right">Avg Amount</TableHead>
                  <TableHead className="text-right">Repayment Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loanTypes.map((type) => (
                  <TableRow key={type.type}>
                    <TableCell className="font-medium">{type.type}</TableCell>
                    <TableCell className="text-right">{type.count}</TableCell>
                    <TableCell className="text-right font-semibold">{type.totalAmount}</TableCell>
                    <TableCell className="text-right">{type.avgAmount}</TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">{type.repaymentRate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Loan Details */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Details</CardTitle>
          <CardDescription>Individual loan records and repayment status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan ID</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Disbursed</TableHead>
                  <TableHead className="text-right">Repaid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">{loan.id}</TableCell>
                    <TableCell>{loan.member}</TableCell>
                    <TableCell>{loan.type}</TableCell>
                    <TableCell className="text-right font-semibold">{loan.amount}</TableCell>
                    <TableCell className="text-right">{loan.disbursed}</TableCell>
                    <TableCell className="text-right text-green-600">{loan.repaid}</TableCell>
                    <TableCell className="text-right text-orange-600 font-semibold">{loan.balance}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          loan.status === "Active"
                            ? "default"
                            : loan.status === "Completed"
                              ? "secondary"
                              : loan.status === "Pending"
                                ? "outline"
                                : "destructive"
                        }
                      >
                        {loan.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
