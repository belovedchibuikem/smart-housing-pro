"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Activity, Shield, AlertTriangle, CheckCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function AuditReportsPage() {
  const [dateRange, setDateRange] = useState("this-month")
  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState("all")

  const stats = [
    { label: "Total Activities", value: "5,678", icon: Activity, color: "text-blue-600" },
    { label: "Admin Actions", value: "1,234", icon: Shield, color: "text-green-600" },
    { label: "Warnings", value: "45", icon: AlertTriangle, color: "text-orange-600" },
    { label: "Successful", value: "5,589", icon: CheckCircle, color: "text-green-600" },
  ]

  const auditLogs = [
    {
      id: "AUD001",
      timestamp: "2024-03-15 14:32:15",
      user: "Admin User",
      role: "Super Admin",
      action: "Updated Loan Settings",
      module: "Loans",
      ipAddress: "192.168.1.1",
      status: "Success",
    },
    {
      id: "AUD002",
      timestamp: "2024-03-15 13:45:22",
      user: "Finance Manager",
      role: "Finance Manager",
      action: "Approved Contribution",
      module: "Contributions",
      ipAddress: "192.168.1.5",
      status: "Success",
    },
    {
      id: "AUD003",
      timestamp: "2024-03-15 12:18:45",
      user: "Loan Officer",
      role: "Loan Officer",
      action: "Rejected Loan Application",
      module: "Loans",
      ipAddress: "192.168.1.8",
      status: "Success",
    },
    {
      id: "AUD004",
      timestamp: "2024-03-15 11:05:33",
      user: "Property Manager",
      role: "Property Manager",
      action: "Added New Property",
      module: "Properties",
      ipAddress: "192.168.1.12",
      status: "Success",
    },
    {
      id: "AUD005",
      timestamp: "2024-03-15 10:22:11",
      user: "System Admin",
      role: "System Admin",
      action: "Failed Login Attempt",
      module: "Authentication",
      ipAddress: "192.168.1.99",
      status: "Failed",
    },
  ]

  const moduleActivity = [
    { module: "Loans", actions: 1234, users: 12, lastActivity: "2 mins ago" },
    { module: "Contributions", actions: 987, users: 8, lastActivity: "5 mins ago" },
    { module: "Properties", actions: 654, users: 6, lastActivity: "15 mins ago" },
    { module: "Members", actions: 543, users: 10, lastActivity: "1 hour ago" },
    { module: "Authentication", actions: 2260, users: 45, lastActivity: "Just now" },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Audit Reports</h1>
          <p className="text-muted-foreground mt-1">System activity logs and security audit trail</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
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

      {/* Module Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Module Activity Summary</CardTitle>
          <CardDescription>Activity breakdown by system module</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead className="text-right">Total Actions</TableHead>
                  <TableHead className="text-right">Active Users</TableHead>
                  <TableHead>Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {moduleActivity.map((module) => (
                  <TableRow key={module.module}>
                    <TableCell className="font-medium">{module.module}</TableCell>
                    <TableCell className="text-right font-semibold">{module.actions}</TableCell>
                    <TableCell className="text-right">{module.users}</TableCell>
                    <TableCell className="text-muted-foreground">{module.lastActivity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Audit Logs</CardTitle>
          <CardDescription>Search and filter system activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user, action, or module..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="login">Login</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>Detailed system activity logs with timestamps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Audit ID</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.id}</TableCell>
                    <TableCell className="text-xs">{log.timestamp}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.role}</Badge>
                    </TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.module}</TableCell>
                    <TableCell className="font-mono text-xs">{log.ipAddress}</TableCell>
                    <TableCell>
                      <Badge variant={log.status === "Success" ? "default" : "destructive"}>{log.status}</Badge>
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
