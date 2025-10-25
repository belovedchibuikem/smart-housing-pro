"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Send, Trash2, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function AdminOutboxPage() {
  // Mock data - replace with actual data fetching
  const sentMessages = [
    {
      id: "1",
      to: "All Members",
      subject: "Monthly Contribution Reminder",
      preview: "This is a reminder that monthly contributions are due...",
      date: "2024-01-12",
      time: "02:30 PM",
      status: "delivered",
      recipients: 150,
    },
    {
      id: "2",
      to: "John Doe",
      subject: "Re: Property Payment Inquiry",
      preview: "Thank you for your inquiry. The payment schedule is...",
      date: "2024-01-12",
      time: "11:00 AM",
      status: "delivered",
      recipients: 1,
    },
    {
      id: "3",
      to: "Property Subscribers",
      subject: "New Property Listing Available",
      preview: "We are excited to announce a new property listing...",
      date: "2024-01-11",
      time: "03:45 PM",
      status: "pending",
      recipients: 45,
    },
  ]

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const handleResend = (messageId: string) => {
    console.log("Resending message:", messageId)
  }

  const filteredMessages = sentMessages.filter((message) => {
    const matchesSearch =
      message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.to.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || message.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Outbox</h1>
        <p className="text-muted-foreground">View sent messages and delivery status</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sent messages..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sent Messages ({filteredMessages.length})</CardTitle>
          <CardDescription>Track your sent messages and delivery status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredMessages.map((message) => (
              <Link
                key={message.id}
                href={`/admin/mail-service/${message.id}`}
                className="block p-4 rounded-lg border transition-colors hover:bg-accent"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">To: {message.to}</span>
                      <Badge variant="outline" className="text-xs">
                        {message.recipients} recipient{message.recipients > 1 ? "s" : ""}
                      </Badge>
                      {message.status === "delivered" && (
                        <Badge variant="default" className="text-xs bg-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Delivered
                        </Badge>
                      )}
                      {message.status === "pending" && (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium mb-1">{message.subject}</p>
                    <p className="text-sm text-muted-foreground truncate">{message.preview}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {message.date} {message.time}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.preventDefault()
                          handleResend(message.id)
                        }}
                        title="Resend message"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.preventDefault()
                          // Handle delete
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
