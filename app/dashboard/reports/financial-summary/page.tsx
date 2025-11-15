"use client"

import { useState, useEffect } from "react"
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
  Loader2,
} from "lucide-react"
import { getFinancialSummaryReport } from "@/lib/api/client"
import { exportReport } from "@/lib/utils/export"
import { toast } from "sonner"

export default function FinancialSummaryPage() {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [loading, setLoading] = useState(true)
  const [financialData, setFinancialData] = useState({
    total_contributions: 0,
    total_investments: 0,
    total_loans: 0,
    total_properties: 0,
    wallet_balance: 0,
    loan_balance: 0,
    investment_returns: 0,
    property_equity: 0,
  })
  const [netWorth, setNetWorth] = useState(0)
  const [totalAssets, setTotalAssets] = useState(0)
  const [totalLiabilities, setTotalLiabilities] = useState(0)
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; income: number; expenses: number }>>([])

  const loadReport = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo

      const response = await getFinancialSummaryReport(params)
      if (response.success) {
        setFinancialData(response.financial_data)
        setNetWorth(response.net_worth)
        setTotalAssets(response.total_assets)
        setTotalLiabilities(response.total_liabilities)
        setMonthlyData(response.monthly_data)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load financial summary")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReport()
  }, [dateFrom, dateTo])

  const handleExport = async (format: "PDF" | "Excel") => {
    try {
      const params: any = {}
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo

      await exportReport("financial-summary", format, params)
      toast.success(`Report exported successfully as ${format}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to export report")
    }
  }

  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0)
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0)
  const netIncome = totalIncome - totalExpenses

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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
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
                  <Button className="w-full" onClick={loadReport}>
                    Apply Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

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
                    <Progress value={totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0} className="h-2 bg-red-100" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contributions</CardTitle>
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{financialData.total_contributions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {totalAssets > 0 ? ((financialData.total_contributions / totalAssets) * 100).toFixed(1) : 0}% of total assets
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Investments</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{financialData.total_investments.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+₦{financialData.investment_returns.toLocaleString()} returns</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Property Equity</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{financialData.property_equity.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">of ₦{financialData.total_properties.toLocaleString()} total value</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{financialData.wallet_balance.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Available funds</p>
              </CardContent>
            </Card>
          </div>

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
                    const savingsRate = data.income > 0 ? (savings / data.income) * 100 : 0

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
                        <div className="text-xs text-muted-foreground text-right">Savings rate: {savingsRate.toFixed(1)}%</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

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
                    <div className="text-sm text-muted-foreground">Original amount: ₦{financialData.total_loans.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">₦{financialData.loan_balance.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Outstanding</div>
                  </div>
                </div>
                <Progress
                  value={financialData.total_loans > 0 ? ((financialData.total_loans - financialData.loan_balance) / financialData.total_loans) * 100 : 0}
                  className="h-2"
                />
                <div className="text-sm text-muted-foreground">
                  {financialData.total_loans > 0
                    ? (((financialData.total_loans - financialData.loan_balance) / financialData.total_loans) * 100).toFixed(1)
                    : 0}
                  % repaid
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
