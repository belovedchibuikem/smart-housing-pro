"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Mail, Send, Inbox, FileEdit } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getMailServiceReports, exportReport } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function MailServiceReportsPage() {
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState("this-month")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_messages: 0,
    sent_messages: 0,
    draft_messages: 0,
    delivered_messages: 0,
  })
  const [messagesByCategory, setMessagesByCategory] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await getMailServiceReports({ date_range: dateRange, per_page: 50 })
      if (response.success) {
        setStats(response.data.stats)
        setMessagesByCategory(response.data.messages_by_category || [])
        setMessages(response.data.messages || [])
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load mail service reports",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      await exportReport('mail-service', { date_range: dateRange })
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
    { label: "Total Messages", value: stats.total_messages.toString(), icon: Mail, color: "text-blue-600" },
    { label: "Sent", value: stats.sent_messages.toString(), icon: Send, color: "text-green-600" },
    { label: "Drafts", value: stats.draft_messages.toString(), icon: FileEdit, color: "text-orange-600" },
    { label: "Delivered", value: stats.delivered_messages.toString(), icon: Inbox, color: "text-purple-600" },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Mail Service Reports</h1>
          <p className="text-muted-foreground mt-1">Track communication and messaging activity</p>
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

      {/* Category Breakdown */}
      {messagesByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Messages by Category</CardTitle>
            <CardDescription>Message distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messagesByCategory.map((item) => (
                    <TableRow key={item.category}>
                      <TableCell className="font-medium">{item.category}</TableCell>
                      <TableCell className="text-right">{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Mail Activity</CardTitle>
          <CardDescription>Latest messages and delivery status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No messages found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Message ID</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Recipient Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((mail) => (
                    <TableRow key={mail.id}>
                      <TableCell className="font-medium">
                        <Link href={`/admin/mail-service/${mail.id}`} className="hover:underline">
                          {mail.id}
                        </Link>
                      </TableCell>
                      <TableCell>{mail.sender}</TableCell>
                      <TableCell className="max-w-xs truncate">{mail.subject}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{mail.category}</Badge>
                      </TableCell>
                      <TableCell>{mail.recipient_type}</TableCell>
                      <TableCell>{mail.sent_at || mail.created_at}</TableCell>
                      <TableCell>
                        <Badge variant={mail.status === "Delivered" ? "default" : "secondary"}>
                          {mail.status}
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
