"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, HandCoins, CheckCircle, Clock, XCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getLoanReports, exportReport } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function LoanReportsPage() {
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState("this-month")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_loans: "₦0",
    active_loans: 0,
    pending_applications: 0,
    defaulted: 0,
  })
  const [loanTypes, setLoanTypes] = useState<any[]>([])
  const [loans, setLoans] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await getLoanReports({ date_range: dateRange, per_page: 50 })
      if (response.success) {
        setStats(response.data.stats)
        setLoanTypes(response.data.loan_types || [])
        setLoans(response.data.loans || [])
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load loan reports",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      await exportReport('loans', { date_range: dateRange })
      toast({
        title: "Export completed",
        description: "Your report has been downloaded.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export report",
        variant: "destructive",
      })
    }
  }

  const statsCards = [
    { label: "Total Loans", value: stats.total_loans, icon: HandCoins, color: "text-blue-600" },
    { label: "Active Loans", value: stats.active_loans.toString(), icon: CheckCircle, color: "text-green-600" },
    { label: "Pending Applications", value: stats.pending_applications.toString(), icon: Clock, color: "text-orange-600" },
    { label: "Defaulted", value: stats.defaulted.toString(), icon: XCircle, color: "text-red-600" },
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
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
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
      {loanTypes.length > 0 && (
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
                      <TableCell className="text-right font-semibold">{type.total_amount}</TableCell>
                      <TableCell className="text-right">{type.avg_amount}</TableCell>
                      <TableCell className="text-right text-green-600 font-semibold">{type.repayment_rate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loan Details */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Details</CardTitle>
          <CardDescription>Individual loan records and repayment status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : loans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No loans found</div>
          ) : (
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
                      <TableCell className="font-medium">
                        <Link href={`/admin/loans/${loan.id}`} className="hover:underline">
                          {loan.id}
                        </Link>
                      </TableCell>
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
