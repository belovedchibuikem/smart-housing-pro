"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Send, Trash2, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getOutboxMessages, deleteMessage } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"

export default function AdminOutboxPage() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchMessages()
  }, [searchQuery, statusFilter])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await getOutboxMessages({
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        per_page: 50,
      })
      if (response.success) {
        setMessages(response.data || [])
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load outbox messages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (messageId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await deleteMessage(messageId)
      toast({
        title: "Success",
        description: "Message deleted",
      })
      fetchMessages()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete message",
        variant: "destructive",
      })
    }
  }

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.to?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <SelectItem value="sent">Sent</SelectItem>
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
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No outbox messages found</p>
            </div>
          ) : (
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
                        {message.recipients_count > 1 && (
                          <Badge variant="outline" className="text-xs">
                            {message.recipients_count} recipient{message.recipients_count > 1 ? "s" : ""}
                          </Badge>
                        )}
                        {message.status === "sent" || message.status === "delivered" ? (
                          <Badge variant="default" className="text-xs bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {message.status === "delivered" ? "Delivered" : "Sent"}
                          </Badge>
                        ) : message.status === "pending" ? (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            Failed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium mb-1">{message.subject || '(No subject)'}</p>
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
                            e.stopPropagation()
                            // Resend functionality can be added later if needed
                            toast({
                              title: "Info",
                              description: "Resend functionality coming soon",
                            })
                          }}
                          title="Resend message"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={(e) => handleDelete(message.id, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
