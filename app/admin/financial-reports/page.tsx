"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, TrendingDown, DollarSign, Users } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function FinancialReportsPage() {
  const [period, setPeriod] = useState("this-month")

  const summaryStats = [
    {
      title: "Total Contributions",
      value: "₦45,250,000",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Outstanding Payments",
      value: "₦2,150,000",
      change: "-8.3%",
      trend: "down",
      icon: TrendingDown,
    },
    {
      title: "Active Contributors",
      value: "1,247",
      change: "+5.2%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Collection Rate",
      value: "95.4%",
      change: "+2.1%",
      trend: "up",
      icon: TrendingUp,
    },
  ]

  const contributionData = [
    { month: "January 2024", target: "₦40,000,000", collected: "₦38,500,000", rate: "96.3%" },
    { month: "February 2024", target: "₦40,000,000", collected: "₦39,200,000", rate: "98.0%" },
    { month: "March 2024", target: "₦40,000,000", collected: "₦37,800,000", rate: "94.5%" },
    { month: "April 2024", target: "₦40,000,000", collected: "₦39,500,000", rate: "98.8%" },
    { month: "May 2024", target: "₦40,000,000", collected: "₦38,900,000", rate: "97.3%" },
  ]

  const pendingPayments = [
    { id: "FRSC-HMS-1234", name: "John Doe", amount: "₦50,000", dueDate: "2024-05-15", days: 5 },
    { id: "FRSC-HMS-2345", name: "Jane Smith", amount: "₦50,000", dueDate: "2024-05-10", days: 10 },
    { id: "FRSC-HMS-3456", name: "Mike Johnson", amount: "₦100,000", dueDate: "2024-05-08", days: 12 },
    { id: "FRSC-HMS-4567", name: "Sarah Williams", amount: "₦50,000", dueDate: "2024-05-05", days: 15 },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground mt-1">Comprehensive financial analytics and reporting</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat) => {
          const Icon = stat.icon
          const isPositive = stat.trend === "up"
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${isPositive ? "text-green-600" : "text-red-600"} flex items-center gap-1 mt-1`}>
                  {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stat.change} from last period
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Contribution Summary</CardTitle>
          <CardDescription>Track contribution targets vs actual collections</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Collected</TableHead>
                <TableHead>Collection Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contributionData.map((row) => (
                <TableRow key={row.month}>
                  <TableCell className="font-medium">{row.month}</TableCell>
                  <TableCell>{row.target}</TableCell>
                  <TableCell>{row.collected}</TableCell>
                  <TableCell>
                    <span
                      className={`font-medium ${Number.parseFloat(row.rate) >= 95 ? "text-green-600" : "text-yellow-600"}`}
                    >
                      {row.rate}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Outstanding Payments</CardTitle>
          <CardDescription>Members with pending contributions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Days Overdue</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.id}</TableCell>
                  <TableCell>{payment.name}</TableCell>
                  <TableCell>{payment.amount}</TableCell>
                  <TableCell>{payment.dueDate}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${payment.days > 7 ? "text-red-600" : "text-yellow-600"}`}>
                      {payment.days} days
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Send Reminder
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
