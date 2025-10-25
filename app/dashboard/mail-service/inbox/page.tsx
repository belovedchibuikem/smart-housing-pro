"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, Search, ArrowLeft, Trash2, MailOpen, Star, Paperclip, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function InboxPage() {
  const [selectedMessages, setSelectedMessages] = useState<number[]>([])
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "Housing Admin",
      fromEmail: "admin@frschousing.org",
      subject: "New Investment Opportunity Available",
      preview: "We are pleased to announce a new investment plan for Q1 2024...",
      date: "2024-01-15T10:30:00",
      unread: true,
      category: "Investment",
      hasAttachment: true,
      starred: false,
    },
    {
      id: 2,
      from: "Accounts Department",
      fromEmail: "accounts@frschousing.org",
      subject: "Monthly Contribution Receipt",
      preview: "Your contribution for January 2024 has been received and processed...",
      date: "2024-01-14T14:15:00",
      unread: true,
      category: "Contribution",
      hasAttachment: false,
      starred: true,
    },
    {
      id: 3,
      from: "Loan Department",
      fromEmail: "loan@frschousing.org",
      subject: "Loan Application Status Update",
      preview: "Your loan application #LN-2024-001 has been approved...",
      date: "2024-01-13T09:45:00",
      unread: false,
      category: "Loan",
      hasAttachment: false,
      starred: false,
    },
    {
      id: 4,
      from: "Property Department",
      fromEmail: "property@frschousing.org",
      subject: "Property Allocation Notice",
      preview: "Congratulations! A property has been allocated to you...",
      date: "2024-01-12T11:20:00",
      unread: false,
      category: "Property",
      hasAttachment: true,
      starred: true,
    },
    {
      id: 5,
      from: "Housing Admin",
      fromEmail: "admin@frschousing.org",
      subject: "System Maintenance Notice",
      preview: "Please be informed that the system will undergo maintenance...",
      date: "2024-01-11T08:00:00",
      unread: false,
      category: "General",
      hasAttachment: false,
      starred: false,
    },
  ])

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

  const toggleRead = (id: number) => {
    setMessages(messages.map((msg) => (msg.id === id ? { ...msg, unread: !msg.unread } : msg)))
  }

  const toggleStar = (id: number) => {
    setMessages(messages.map((msg) => (msg.id === id ? { ...msg, starred: !msg.starred } : msg)))
  }

  const handleSelectAll = () => {
    if (selectedMessages.length === filteredMessages.length) {
      setSelectedMessages([])
    } else {
      setSelectedMessages(filteredMessages.map((m) => m.id))
    }
  }

  const handleBulkDelete = () => {
    setMessages(messages.filter((m) => !selectedMessages.includes(m.id)))
    setSelectedMessages([])
  }

  const handleBulkMarkAsRead = () => {
    setMessages(messages.map((m) => (selectedMessages.includes(m.id) ? { ...m, unread: false } : m)))
    setSelectedMessages([])
  }

  const filteredMessages = messages.filter((msg) => {
    const matchesFilter = filter === "all" || (filter === "unread" && msg.unread) || (filter === "read" && !msg.unread)
    const matchesSearch =
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.preview.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/mail-service">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Inbox</h1>
          <p className="text-muted-foreground mt-1">{messages.filter((m) => m.unread).length} unread messages</p>
        </div>
        <Button variant="outline" size="icon" className="ml-auto bg-transparent">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inbox..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Messages</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedMessages.length > 0 && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-accent rounded-lg">
            <span className="text-sm font-medium">{selectedMessages.length} selected</span>
            <Button size="sm" variant="outline" onClick={handleBulkMarkAsRead}>
              Mark as Read
            </Button>
            <Button size="sm" variant="outline" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedMessages([])}>
              Clear
            </Button>
          </div>
        )}

        <div className="flex items-center gap-3 mb-3 pb-3 border-b">
          <input
            type="checkbox"
            checked={selectedMessages.length === filteredMessages.length && filteredMessages.length > 0}
            onChange={handleSelectAll}
            className="h-4 w-4 rounded border-gray-300"
          />
          <span className="text-sm text-muted-foreground">Select all</span>
        </div>

        <div className="space-y-1">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`group relative flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-sm cursor-pointer ${
                message.unread ? "bg-accent/30 border-primary/20" : "hover:bg-accent/50"
              }`}
            >
              <Checkbox
                checked={selectedMessages.includes(message.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedMessages([...selectedMessages, message.id])
                  } else {
                    setSelectedMessages(selectedMessages.filter((id) => id !== message.id))
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  toggleStar(message.id)
                }}
              >
                <Star className={`h-4 w-4 ${message.starred ? "fill-yellow-400 text-yellow-400" : ""}`} />
              </Button>

              <Link href={`/dashboard/mail-service/${message.id}`} className="flex-1 flex items-center gap-4 min-w-0">
                <div className="w-48 flex-shrink-0">
                  <p className={`text-sm truncate ${message.unread ? "font-semibold" : "font-medium"}`}>
                    {message.from}
                  </p>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-sm truncate ${message.unread ? "font-semibold" : ""}`}>{message.subject}</p>
                    {message.hasAttachment && <Paperclip className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{message.preview}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className="text-xs">
                    {message.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(message.date)}
                  </span>
                </div>
              </Link>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleRead(message.id)
                  }}
                  title={message.unread ? "Mark as read" : "Mark as unread"}
                >
                  {message.unread ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setMessages(messages.filter((m) => m.id !== message.id))
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
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No messages found</p>
          </div>
        )}
      </Card>
    </div>
  )
}
