"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Search, ArrowLeft, Trash2, CheckCircle2, Paperclip, Users } from "lucide-react"
import Link from "next/link"

export default function AdminSentPage() {
  const [selectedMessages, setSelectedMessages] = useState<number[]>([])
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const [messages, setMessages] = useState([
    {
      id: 1,
      to: "All Members",
      recipients: 245,
      subject: "New Investment Opportunity Available",
      preview: "We are pleased to announce a new investment plan for Q1 2024...",
      date: "2024-01-15 10:30 AM",
      status: "delivered",
      category: "Investment",
      hasAttachment: true,
    },
    {
      id: 2,
      to: "John Doe (Member #12345)",
      recipients: 1,
      subject: "Contribution Receipt Confirmation",
      preview: "Your contribution for January 2024 has been received...",
      date: "2024-01-14 02:15 PM",
      status: "delivered",
      category: "Contribution",
      hasAttachment: true,
    },
    {
      id: 3,
      to: "Jane Smith (Member #12346)",
      recipients: 1,
      subject: "Loan Application Approved",
      preview: "Your loan application #LN-2024-001 has been approved...",
      date: "2024-01-13 09:45 AM",
      status: "delivered",
      category: "Loan",
      hasAttachment: false,
    },
    {
      id: 4,
      to: "All Members",
      recipients: 245,
      subject: "System Maintenance Notice",
      preview: "Please be informed that the system will undergo maintenance...",
      date: "2024-01-11 08:00 AM",
      status: "delivered",
      category: "General",
      hasAttachment: false,
    },
  ])

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

  const filteredMessages = messages.filter((msg) => {
    const matchesFilter = filter === "all" || msg.category.toLowerCase() === filter.toLowerCase()
    const matchesSearch =
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.preview.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/mail-service">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Sent Messages</h1>
          <p className="text-muted-foreground mt-1">{messages.length} sent messages</p>
        </div>
        <Link href="/admin/mail-service/compose">
          <Button>
            <Mail className="h-4 w-4 mr-2" />
            Compose
          </Button>
        </Link>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sent messages..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="investment">Investment</SelectItem>
              <SelectItem value="contribution">Contribution</SelectItem>
              <SelectItem value="loan">Loan</SelectItem>
              <SelectItem value="property">Property</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedMessages.length > 0 && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-accent rounded-lg">
            <span className="text-sm font-medium">{selectedMessages.length} selected</span>
            <Button size="sm" variant="outline" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedMessages([])}>
              Clear Selection
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

        <div className="space-y-2">
          {filteredMessages.map((message) => (
            <div key={message.id} className="p-4 rounded-lg border hover:bg-accent transition-colors">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedMessages.includes(message.id)}
                  onChange={() => {
                    if (selectedMessages.includes(message.id)) {
                      setSelectedMessages(selectedMessages.filter((id) => id !== message.id))
                    } else {
                      setSelectedMessages([...selectedMessages, message.id])
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 mt-1"
                  onClick={(e) => e.stopPropagation()}
                />

                <Link href={`/admin/mail-service/${message.id}`} className="flex-1 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 mt-0.5 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold">To: {message.to}</p>
                      {message.recipients > 1 && (
                        <Badge variant="secondary" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {message.recipients} recipients
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {message.category}
                      </Badge>
                      {message.hasAttachment && (
                        <Badge variant="secondary" className="text-xs">
                          <Paperclip className="h-3 w-3 mr-1" />
                          Attachment
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium mb-1">{message.subject}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">{message.preview}</p>
                  </div>
                </Link>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{message.date}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault()
                      setMessages(messages.filter((m) => m.id !== message.id))
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No sent messages found</p>
          </div>
        )}
      </Card>
    </div>
  )
}
