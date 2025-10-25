"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Send, Users, Search, Plus } from "lucide-react"
import Link from "next/link"

export default function AdminMailServicePage() {
  const stats = [
    { label: "Total Messages", value: 1247, icon: Mail },
    { label: "Sent Today", value: 23, icon: Send },
    { label: "Active Users", value: 456, icon: Users },
  ]

  const recentMessages = [
    {
      id: 1,
      from: "John Doe (FRSC/HMS/2024/001)",
      to: "Housing Admin",
      subject: "Inquiry about Investment Plan",
      date: "2024-01-15 03:30 PM",
      status: "Pending",
      category: "Investment",
    },
    {
      id: 2,
      from: "Jane Smith (FRSC/HMS/2024/045)",
      to: "Accounts Department",
      subject: "Contribution Payment Confirmation",
      date: "2024-01-15 11:20 AM",
      status: "Replied",
      category: "Contribution",
    },
    {
      id: 3,
      from: "Mike Johnson (FRSC/HMS/2024/089)",
      to: "Loan Department",
      subject: "Loan Repayment Schedule Request",
      date: "2024-01-14 09:15 AM",
      status: "Replied",
      category: "Loan",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mail Service Management</h1>
          <p className="text-muted-foreground mt-2">Manage member correspondence and announcements</p>
        </div>
        <Link href="/admin/mail-service/compose">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Send Announcement
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
              </div>
              <stat.icon className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search messages..." className="pl-9" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Messages</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all-categories">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-categories">All Categories</SelectItem>
              <SelectItem value="investment">Investment</SelectItem>
              <SelectItem value="contribution">Contribution</SelectItem>
              <SelectItem value="loan">Loan</SelectItem>
              <SelectItem value="property">Property</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          {recentMessages.map((message) => (
            <div key={message.id} className="p-4 rounded-lg border hover:bg-accent transition-colors">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{message.from}</p>
                    <Badge variant={message.status === "Pending" ? "default" : "secondary"} className="text-xs">
                      {message.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {message.category}
                    </Badge>
                  </div>
                  <p className="text-sm mb-1">To: {message.to}</p>
                  <p className="text-sm font-medium">{message.subject}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{message.date}</span>
                  <Button variant="outline" size="sm">
                    View & Reply
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
