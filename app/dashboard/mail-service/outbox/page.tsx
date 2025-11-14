"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Send, Search, ArrowLeft, RefreshCw, Trash2, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { getMemberOutboxMessages, deleteMail, MailMessage } from "@/lib/api/client"
import { toast } from "sonner"

export default function OutboxPage() {
  const [messages, setMessages] = useState<MailMessage[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  const loadMessages = async () => {
    try {
      setLoading(true)
      const response = await getMemberOutboxMessages({
        search: searchQuery || undefined,
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
  }, [searchQuery])

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

  const handleDelete = async (id: string) => {
    try {
      await deleteMail(id)
      toast.success("Message deleted successfully")
      await loadMessages()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete message")
    }
  }

  const filteredMessages = messages.filter(
    (msg) =>
      msg.to?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.preview.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
          <h1 className="text-3xl font-bold">Sent Messages</h1>
          <p className="text-muted-foreground mt-1">{messages.length} messages sent</p>
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
                <div className="w-48 flex-shrink-0">
                  <p className="text-sm font-medium truncate">To: {message.to || message.recipient?.name || "Unknown"}</p>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate mb-0.5">{message.subject}</p>
                  <p className="text-sm text-muted-foreground truncate">{message.preview}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    variant={
                      message.status === "delivered"
                        ? "default"
                        : message.status === "sent"
                          ? "secondary"
                          : "outline"
                    }
                    className="text-xs capitalize"
                  >
                    {message.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap w-16 text-right">
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
                    loadMessages()
                  }}
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
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
            <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{searchQuery ? "No messages found" : "No messages sent"}</p>
          </div>
        )}
      </Card>
    </div>
  )
}
