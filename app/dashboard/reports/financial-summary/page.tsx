"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  CreditCard,
  Download,
  Calendar,
  PiggyBank,
} from "lucide-react"

export default function FinancialSummaryPage() {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  // Mock data - replace with actual API call
  const financialData = {
    totalContributions: 2500000,
    totalInvestments: 5000000,
    totalLoans: 3000000,
    totalProperties: 28000000,
    walletBalance: 150000,
    loanBalance: 2400000,
    investmentReturns: 450000,
    propertyEquity: 12000000,
  }

  const totalAssets =
    financialData.totalContributions +
    financialData.totalInvestments +
    financialData.propertyEquity +
    financialData.walletBalance

  const totalLiabilities = financialData.loanBalance

  const netWorth = totalAssets - totalLiabilities

  const monthlyData = [
    { month: "Jan", income: 250000, expenses: 180000 },
    { month: "Feb", income: 250000, expenses: 200000 },
    { month: "Mar", income: 250000, expenses: 190000 },
    { month: "Apr", income: 250000, expenses: 210000 },
    { month: "May", income: 250000, expenses: 185000 },
    { month: "Jun", income: 250000, expenses: 195000 },
  ]

  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0)
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0)
  const netIncome = totalIncome - totalExpenses

  const handleExport = (format: string) => {
    console.log(`Exporting financial summary as ${format}`)
    alert(`Financial summary exported as ${format}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Summary</h1>
          <p className="text-muted-foreground">Complete overview of your financial position</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleExport("PDF")} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button onClick={() => handleExport("Excel")} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Report Period
          </CardTitle>
          <CardDescription>Select date range for the financial summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button className="w-full">Apply Filter</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Net Worth Card */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="text-2xl">Net Worth</CardTitle>
          <CardDescription>Your total financial position</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-4xl font-bold text-primary">₦{netWorth.toLocaleString()}</div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Assets</span>
                  <span className="font-medium text-green-600">₦{totalAssets.toLocaleString()}</span>
                </div>
                <Progress value={100} className="h-2 bg-green-100" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Liabilities</span>
                  <span className="font-medium text-red-600">₦{totalLiabilities.toLocaleString()}</span>
                </div>
                <Progress value={(totalLiabilities / totalAssets) * 100} className="h-2 bg-red-100" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Breakdown */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contributions</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{financialData.totalContributions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((financialData.totalContributions / totalAssets) * 100).toFixed(1)}% of total assets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{financialData.totalInvestments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +₦{financialData.investmentReturns.toLocaleString()} returns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Property Equity</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{financialData.propertyEquity.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              of ₦{financialData.totalProperties.toLocaleString()} total value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{financialData.walletBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Available funds</p>
          </CardContent>
        </Card>
      </div>

      {/* Income vs Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses</CardTitle>
          <CardDescription>6-month financial flow analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Total Income</span>
                </div>
                <div className="text-2xl font-bold text-green-600">₦{totalIncome.toLocaleString()}</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Total Expenses</span>
                </div>
                <div className="text-2xl font-bold text-red-600">₦{totalExpenses.toLocaleString()}</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Net Income</span>
                </div>
                <div className="text-2xl font-bold text-primary">₦{netIncome.toLocaleString()}</div>
              </div>
            </div>

            <div className="space-y-4">
              {monthlyData.map((data) => {
                const savings = data.income - data.expenses
                const savingsRate = (savings / data.income) * 100

                return (
                  <div key={data.month} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{data.month}</span>
                      <div className="flex gap-4">
                        <span className="text-green-600">+₦{data.income.toLocaleString()}</span>
                        <span className="text-red-600">-₦{data.expenses.toLocaleString()}</span>
                        <span className="font-medium">₦{savings.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Progress value={(data.income / 300000) * 100} className="h-2 flex-1 bg-green-100" />
                      <Progress value={(data.expenses / 300000) * 100} className="h-2 flex-1 bg-red-100" />
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      Savings rate: {savingsRate.toFixed(1)}%
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Liabilities
          </CardTitle>
          <CardDescription>Outstanding debts and obligations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Active Loans</div>
                <div className="text-sm text-muted-foreground">
                  Original amount: ₦{financialData.totalLoans.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">₦{financialData.loanBalance.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Outstanding</div>
              </div>
            </div>
            <Progress
              value={((financialData.totalLoans - financialData.loanBalance) / financialData.totalLoans) * 100}
              className="h-2"
            />
            <div className="text-sm text-muted-foreground">
              {(((financialData.totalLoans - financialData.loanBalance) / financialData.totalLoans) * 100).toFixed(1)}%
              repaid
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
