"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Send, Search, ArrowLeft, RefreshCw, Trash2 } from "lucide-react"
import { useState } from "react"

export default function OutboxPage() {
  const [sentMessages, setSentMessages] = useState([
    {
      id: 1,
      to: "Housing Admin",
      subject: "Inquiry about Investment Plan",
      preview: "I would like to know more details about the new investment...",
      date: "2024-01-14 03:30 PM",
      status: "Delivered",
    },
    {
      id: 2,
      to: "Accounts Department",
      subject: "Contribution Payment Confirmation",
      preview: "Please confirm receipt of my January contribution payment...",
      date: "2024-01-13 11:20 AM",
      status: "Read",
    },
    {
      id: 3,
      to: "Loan Department",
      subject: "Loan Repayment Schedule Request",
      preview: "Could you please send me my updated loan repayment schedule...",
      date: "2024-01-12 09:15 AM",
      status: "Read",
    },
    {
      id: 4,
      to: "Property Department",
      subject: "Property Inspection Request",
      preview: "I would like to schedule an inspection for property...",
      date: "2024-01-10 02:45 PM",
      status: "Delivered",
    },
  ])
  const [searchQuery, setSearchQuery] = useState("")

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = diffInMs / (1000 * 60 * 60)
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24)

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60))
      return `${minutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" })
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  const handleResend = (messageId: number) => {
    setSentMessages(sentMessages.map((msg) => (msg.id === messageId ? { ...msg, status: "Sending..." } : msg)))
    // Simulate resend
    setTimeout(() => {
      setSentMessages(sentMessages.map((msg) => (msg.id === messageId ? { ...msg, status: "Delivered" } : msg)))
    }, 2000)
  }

  const filteredMessages = sentMessages.filter(
    (msg) =>
      msg.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.preview.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/mail-service">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Sent Messages</h1>
          <p className="text-muted-foreground mt-1">{sentMessages.length} messages sent</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sent messages..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className="group relative flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-sm hover:bg-accent/50 cursor-pointer"
            >
              <Link href={`/dashboard/mail-service/${message.id}`} className="flex-1 flex items-center gap-4 min-w-0">
                {/* Recipient info */}
                <div className="w-48 flex-shrink-0">
                  <p className="text-sm font-medium truncate">To: {message.to}</p>
                </div>

                {/* Subject and preview */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate mb-0.5">{message.subject}</p>
                  <p className="text-sm text-muted-foreground truncate">{message.preview}</p>
                </div>

                {/* Status and time */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    variant={
                      message.status === "Read" ? "default" : message.status === "Delivered" ? "secondary" : "outline"
                    }
                    className="text-xs"
                  >
                    {message.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap w-16 text-right">
                    {formatRelativeTime(message.date)}
                  </span>
                </div>
              </Link>

              {/* Action buttons on hover */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {message.status === "Delivered" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleResend(message.id)
                    }}
                    title="Resend message"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSentMessages(sentMessages.filter((m) => m.id !== message.id))
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{searchQuery ? "No messages found" : "No messages sent"}</p>
          </div>
        )}
      </Card>
    </div>
  )
}
