"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Download, User, DollarSign, FileText, Home, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ActivityLogsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")

  const activityLogs = [
    {
      id: 1,
      user: "John Doe (FRSC-2024-001)",
      action: "Applied for housing loan",
      details: "Loan amount: ₦5,000,000 | Product: Standard Housing Loan",
      timestamp: "2024-03-15 14:30:25",
      type: "loan",
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      id: 2,
      user: "Admin User (Super Admin)",
      action: "Approved KYC verification",
      details: "Member: Jane Smith (FRSC-2024-045)",
      timestamp: "2024-03-15 14:15:10",
      type: "kyc",
      icon: Shield,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      id: 3,
      user: "Mike Johnson (FRSC-2024-023)",
      action: "Made monthly contribution",
      details: "Amount: ₦50,000 | Payment method: Bank transfer",
      timestamp: "2024-03-15 13:45:00",
      type: "payment",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      id: 4,
      user: "Sarah Williams (FRSC-2024-067)",
      action: "Invested in property",
      details: "Property: Luxury Duplex in Lekki | Amount: ₦2,000,000",
      timestamp: "2024-03-15 12:20:15",
      type: "property",
      icon: Home,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      id: 5,
      user: "Admin User (Accounts)",
      action: "Generated financial report",
      details: "Report type: Monthly contributions summary | Period: February 2024",
      timestamp: "2024-03-15 11:00:00",
      type: "report",
      icon: FileText,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
    {
      id: 6,
      user: "David Brown (FRSC-2024-089)",
      action: "Updated profile information",
      details: "Changed: Phone number, Email address",
      timestamp: "2024-03-15 10:30:45",
      type: "profile",
      icon: User,
      color: "text-teal-600",
      bgColor: "bg-teal-100",
    },
    {
      id: 7,
      user: "Admin User (Loans)",
      action: "Approved loan application",
      details: "Applicant: John Doe | Amount: ₦5,000,000 | Tenure: 15 years",
      timestamp: "2024-03-15 09:15:30",
      type: "loan",
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      id: 8,
      user: "Emma Wilson (FRSC-2024-112)",
      action: "Paid statutory charge",
      details: "Charge: Building Plan Approval | Amount: ₦75,000",
      timestamp: "2024-03-15 08:45:20",
      type: "payment",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ]

  const filteredLogs = filterType === "all" ? activityLogs : activityLogs.filter((log) => log.type === filterType)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Activity Logs</h1>
            <p className="text-muted-foreground mt-1">Track all system activities and user actions</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user, action, or details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="loan">Loans</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="kyc">KYC</SelectItem>
                  <SelectItem value="property">Properties</SelectItem>
                  <SelectItem value="profile">Profile Updates</SelectItem>
                  <SelectItem value="report">Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activity Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Showing {filteredLogs.length} {filterType === "all" ? "" : filterType} activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLogs.map((log) => {
                const Icon = log.icon
                return (
                  <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50">
                    <div className={`p-2 rounded-lg ${log.bgColor} flex-shrink-0`}>
                      <Icon className={`h-5 w-5 ${log.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium">{log.user}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{log.action}</p>
                        </div>
                        <Badge variant="outline" className="capitalize flex-shrink-0">
                          {log.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{log.details}</p>
                      <p className="text-xs text-muted-foreground mt-2">{log.timestamp}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
