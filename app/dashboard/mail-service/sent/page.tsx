"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Search, ArrowLeft, Trash2, Paperclip, Loader2 } from "lucide-react"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { getMemberSentMessages, deleteMail, bulkDeleteMails, MailMessage } from "@/lib/api/client"
import { toast } from "sonner"

export default function SentPage() {
  const [selectedMessages, setSelectedMessages] = useState<string[]>([])
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [messages, setMessages] = useState<MailMessage[]>([])
  const [loading, setLoading] = useState(true)

  const loadMessages = async () => {
    try {
      setLoading(true)
      const response = await getMemberSentMessages({
        search: searchQuery || undefined,
        category: filter !== "all" ? filter : undefined,
      })
      if (response.success) {
        setMessages(response.messages)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load messages")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [filter, searchQuery])

  const handleSelectAll = () => {
    if (selectedMessages.length === filteredMessages.length) {
      setSelectedMessages([])
    } else {
      setSelectedMessages(filteredMessages.map((m) => m.id))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedMessages.length === 0) return
    try {
      await bulkDeleteMails(selectedMessages)
      toast.success("Messages deleted successfully")
      setSelectedMessages([])
      await loadMessages()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete messages")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMail(id)
      toast.success("Message deleted successfully")
      await loadMessages()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete message")
    }
  }

  const filteredMessages = messages.filter((msg) => {
    const matchesFilter = filter === "all" || msg.category?.toLowerCase() === filter.toLowerCase()
    const matchesSearch =
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.to?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.preview.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/mail-service">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Sent</h1>
          <p className="text-muted-foreground mt-1">{messages.length} sent messages</p>
        </div>
        <Link href="/dashboard/mail-service/compose">
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
          <Checkbox
            checked={selectedMessages.length === filteredMessages.length && filteredMessages.length > 0}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedMessages(filteredMessages.map((m) => m.id))
              } else {
                setSelectedMessages([])
              }
            }}
            className="h-4 w-4 rounded border-gray-300"
          />
          <span className="text-sm text-muted-foreground">Select all</span>
        </div>

        <div className="space-y-1">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className="group relative flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-sm hover:bg-accent/50 cursor-pointer"
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

              <Link href={`/dashboard/mail-service/${message.id}`} className="flex-1 flex items-center gap-4 min-w-0">
                <div className="w-48 flex-shrink-0">
                  <p className="text-sm font-medium truncate">To: {message.to || message.recipient?.name || "Unknown"}</p>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium truncate">{message.subject}</p>
                    {message.has_attachment && (
                      <Paperclip className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{message.preview}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    variant={message.status === "delivered" ? "default" : "secondary"}
                    className="text-xs capitalize"
                  >
                    {message.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap w-16 text-right">
                    {formatRelativeTime(message.date)}
                  </span>
                </div>
              </Link>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleDelete(message.id)
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
            <p className="text-muted-foreground">No sent messages found</p>
          </div>
        )}
      </Card>
    </div>
  )
}
