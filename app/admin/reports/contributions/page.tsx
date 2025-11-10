"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, CreditCard, CheckCircle, Clock, XCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { getContributionReports, exportReport } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function ContributionReportsPage() {
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState("this-month")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_contributions: "₦0",
    paid: "₦0",
    pending: "₦0",
    overdue: "₦0",
  })
  const [contributions, setContributions] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [searchQuery, dateRange])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await getContributionReports({
        date_range: dateRange,
        search: searchQuery || undefined,
        per_page: 50,
      })
      if (response.success) {
        setStats(response.data.stats)
        setContributions(response.data.contributions || [])
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load contribution reports",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      await exportReport('contributions', { date_range: dateRange, search: searchQuery })
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
    { label: "Total Contributions", value: stats.total_contributions, icon: CreditCard, color: "text-blue-600" },
    { label: "Paid", value: stats.paid, icon: CheckCircle, color: "text-green-600" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "text-orange-600" },
    { label: "Overdue", value: stats.overdue, icon: XCircle, color: "text-red-600" },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Contribution Reports</h1>
          <p className="text-muted-foreground mt-1">Track member contributions and payment status</p>
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

      {/* Search Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search Contributions</CardTitle>
          <CardDescription>Filter by member name or ID</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by member name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contributions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contribution Details</CardTitle>
          <CardDescription>Detailed contribution records and payment status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : contributions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No contributions found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contribution ID</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Member ID</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Paid Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contributions.map((contribution) => (
                    <TableRow key={contribution.id}>
                      <TableCell className="font-medium">
                        <Link href={`/admin/contributions/${contribution.id}`} className="hover:underline">
                          {contribution.id}
                        </Link>
                      </TableCell>
                      <TableCell>{contribution.member}</TableCell>
                      <TableCell>{contribution.member_id}</TableCell>
                      <TableCell className="text-right font-semibold">{contribution.amount}</TableCell>
                      <TableCell>{contribution.due_date}</TableCell>
                      <TableCell>{contribution.paid_date || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            contribution.status === "Paid"
                              ? "default"
                              : contribution.status === "Pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {contribution.status}
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
