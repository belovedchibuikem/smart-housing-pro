"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, RotateCcw, ClipboardList, Clock, XCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { getRefundReports, exportReport } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"

export default function RefundReportsPage() {
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState("this-month")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_requests: 0,
    total_completed_processing_amount: "₦0",
    pending_amount: "₦0",
    rejected_amount: "₦0",
  })
  const [rows, setRows] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [searchQuery, dateRange])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await getRefundReports({
        date_range: dateRange,
        search: searchQuery || undefined,
        per_page: 50,
      })
      if (response.success) {
        setStats(response.data.stats)
        setRows(response.data.refunds || [])
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load refund reports",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      await exportReport("refunds", { date_range: dateRange, search: searchQuery })
      toast({
        title: "Export completed",
        description: "Your refund report has been downloaded.",
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
    { label: "Requests in period", value: stats.total_requests.toLocaleString(), icon: ClipboardList, color: "text-blue-600" },
    { label: "Completed / processing", value: stats.total_completed_processing_amount, icon: RotateCcw, color: "text-green-600" },
    { label: "Pending amount", value: stats.pending_amount, icon: Clock, color: "text-orange-600" },
    { label: "Rejected amount", value: stats.rejected_amount, icon: XCircle, color: "text-red-600" },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Refund reports</h1>
          <p className="text-muted-foreground mt-1">Track payouts, statuses, and member refund traffic.</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This month</SelectItem>
              <SelectItem value="last-month">Last month</SelectItem>
              <SelectItem value="this-quarter">This quarter</SelectItem>
              <SelectItem value="this-year">This year</SelectItem>
              <SelectItem value="all-time">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

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
                <div className="text-xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search refunds</CardTitle>
          <CardDescription>Filter by ticket number, reference, member name or ID.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Refund details</CardTitle>
          <CardDescription>Individual refund requests recorded in this period.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No refunds found for this selection.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium whitespace-nowrap">{row.ticket_number}</TableCell>
                      <TableCell>
                        <div>{row.member}</div>
                        <span className="text-xs text-muted-foreground">{row.member_id}</span>
                      </TableCell>
                      <TableCell className="capitalize">{row.request_type}</TableCell>
                      <TableCell className="text-right font-semibold">{row.amount}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            row.status === "Completed"
                              ? "default"
                              : row.status === "Rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{row.requested_at || "—"}</TableCell>
                      <TableCell className="text-sm">{row.completed_at || "—"}</TableCell>
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
