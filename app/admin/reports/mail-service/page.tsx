"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Mail, Send, Inbox, FileEdit } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function MailServiceReportsPage() {
  const [dateRange, setDateRange] = useState("this-month")

  const stats = [
    { label: "Total Messages", value: "1,456", icon: Mail, color: "text-blue-600" },
    { label: "Sent", value: "892", icon: Send, color: "text-green-600" },
    { label: "Received", value: "564", icon: Inbox, color: "text-purple-600" },
    { label: "Drafts", value: "23", icon: FileEdit, color: "text-orange-600" },
  ]

  const mailActivity = [
    {
      id: "MSG001",
      from: "Admin",
      to: "All Members",
      subject: "Monthly Newsletter - March 2024",
      date: "2024-03-15",
      status: "Sent",
      recipients: 1234,
    },
    {
      id: "MSG002",
      from: "Finance Dept",
      to: "John Doe",
      subject: "Contribution Reminder",
      date: "2024-03-14",
      status: "Delivered",
      recipients: 1,
    },
    {
      id: "MSG003",
      from: "Property Dept",
      to: "Property Owners",
      subject: "Maintenance Schedule",
      date: "2024-03-13",
      status: "Sent",
      recipients: 156,
    },
    {
      id: "MSG004",
      from: "Loan Officer",
      to: "Jane Smith",
      subject: "Loan Approval Notification",
      date: "2024-03-12",
      status: "Delivered",
      recipients: 1,
    },
    {
      id: "MSG005",
      from: "Admin",
      to: "New Members",
      subject: "Welcome to FRSC HMS",
      date: "2024-03-11",
      status: "Sent",
      recipients: 45,
    },
  ]

  const departmentActivity = [
    { department: "Admin", sent: 234, received: 156, avgResponseTime: "2.5 hours" },
    { department: "Finance", sent: 189, received: 145, avgResponseTime: "3.2 hours" },
    { department: "Property", sent: 156, received: 98, avgResponseTime: "4.1 hours" },
    { department: "Loans", sent: 145, received: 87, avgResponseTime: "2.8 hours" },
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

      {/* Department Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Department Activity</CardTitle>
          <CardDescription>Mail activity and response times by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Sent</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead className="text-right">Avg Response Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentActivity.map((dept) => (
                  <TableRow key={dept.department}>
                    <TableCell className="font-medium">{dept.department}</TableCell>
                    <TableCell className="text-right">{dept.sent}</TableCell>
                    <TableCell className="text-right">{dept.received}</TableCell>
                    <TableCell className="text-right text-blue-600 font-semibold">{dept.avgResponseTime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Mail Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Mail Activity</CardTitle>
          <CardDescription>Latest messages and delivery status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Message ID</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Recipients</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mailActivity.map((mail) => (
                  <TableRow key={mail.id}>
                    <TableCell className="font-medium">{mail.id}</TableCell>
                    <TableCell>{mail.from}</TableCell>
                    <TableCell>{mail.to}</TableCell>
                    <TableCell className="max-w-xs truncate">{mail.subject}</TableCell>
                    <TableCell>{mail.date}</TableCell>
                    <TableCell className="text-right">{mail.recipients}</TableCell>
                    <TableCell>
                      <Badge variant={mail.status === "Delivered" ? "default" : "secondary"}>{mail.status}</Badge>
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
