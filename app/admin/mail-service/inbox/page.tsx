"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Star, Trash2, Archive } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"

export default function AdminInboxPage() {
  // Mock data - replace with actual data fetching
  const messages = [
    {
      id: "1",
      from: "John Doe",
      subject: "Property Payment Inquiry",
      preview: "I would like to inquire about the payment schedule for...",
      date: "2024-01-12",
      time: "10:30 AM",
      isRead: false,
      isStarred: true,
      category: "Property",
    },
    {
      id: "2",
      from: "Jane Smith",
      subject: "Loan Application Status",
      preview: "Could you please provide an update on my loan application...",
      date: "2024-01-12",
      time: "09:15 AM",
      isRead: true,
      isStarred: false,
      category: "Loans",
    },
    {
      id: "3",
      from: "Mike Johnson",
      subject: "Contribution Query",
      preview: "I have a question regarding my monthly contributions...",
      date: "2024-01-11",
      time: "04:20 PM",
      isRead: false,
      isStarred: false,
      category: "Contributions",
    },
  ]

  const [selectedMessages, setSelectedMessages] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const handleSelectAll = () => {
    if (selectedMessages.length === messages.length) {
      setSelectedMessages([])
    } else {
      setSelectedMessages(messages.map((m) => m.id))
    }
  }

  const handleMarkAsRead = () => {
    console.log("Marking as read:", selectedMessages)
    setSelectedMessages([])
  }

  const handleMarkAsUnread = () => {
    console.log("Marking as unread:", selectedMessages)
    setSelectedMessages([])
  }

  const handleBulkDelete = () => {
    console.log("Deleting:", selectedMessages)
    setSelectedMessages([])
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inbox</h1>
        <p className="text-muted-foreground">Manage incoming messages from members</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search messages..." className="pl-10" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="property">Property</SelectItem>
            <SelectItem value="loans">Loans</SelectItem>
            <SelectItem value="contributions">Contributions</SelectItem>
            <SelectItem value="investments">Investments</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Messages ({messages.length})</CardTitle>
              <CardDescription>{messages.filter((m) => !m.isRead).length} unread messages</CardDescription>
            </div>
            {selectedMessages.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{selectedMessages.length} selected</span>
                <Button size="sm" variant="outline" onClick={handleMarkAsRead}>
                  Mark as Read
                </Button>
                <Button size="sm" variant="outline" onClick={handleMarkAsUnread}>
                  Mark as Unread
                </Button>
                <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b">
            <Checkbox checked={selectedMessages.length === messages.length} onCheckedChange={handleSelectAll} />
            <span className="text-sm font-medium">Select All</span>
          </div>

          <div className="space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg border transition-colors ${
                  !message.isRead ? "bg-accent/50" : ""
                } ${selectedMessages.includes(message.id) ? "ring-2 ring-primary" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedMessages.includes(message.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedMessages([...selectedMessages, message.id])
                      } else {
                        setSelectedMessages(selectedMessages.filter((id) => id !== message.id))
                      }
                    }}
                  />
                  <Link href={`/admin/mail-service/${message.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`font-semibold ${!message.isRead ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {message.from}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {message.category}
                      </Badge>
                      {!message.isRead && (
                        <Badge variant="default" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm mb-1 ${!message.isRead ? "font-medium" : ""}`}>{message.subject}</p>
                    <p className="text-sm text-muted-foreground truncate">{message.preview}</p>
                  </Link>
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
                          // Handle star toggle
                        }}
                      >
                        <Star className={`h-4 w-4 ${message.isStarred ? "fill-yellow-400 text-yellow-400" : ""}`} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.preventDefault()
                          // Handle archive
                        }}
                      >
                        <Archive className="h-4 w-4" />
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
