"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Star, Trash2, Archive } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { getInboxMessages, bulkMailOperation, updateMessage, deleteMessage } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"

export default function AdminInboxPage() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessages, setSelectedMessages] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    fetchMessages()
  }, [searchQuery, categoryFilter])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await getInboxMessages({
        search: searchQuery || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        per_page: 50,
      })
      if (response.success) {
        setMessages(response.data || [])
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load messages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedMessages.length === messages.length) {
      setSelectedMessages([])
    } else {
      setSelectedMessages(messages.map((m) => m.id))
    }
  }

  const handleMarkAsRead = async () => {
    try {
      await bulkMailOperation({
        action: 'mark_read',
        message_ids: selectedMessages,
      })
      toast({
        title: "Success",
        description: "Messages marked as read",
      })
      setSelectedMessages([])
      fetchMessages()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark messages as read",
        variant: "destructive",
      })
    }
  }

  const handleMarkAsUnread = async () => {
    try {
      await bulkMailOperation({
        action: 'mark_unread',
        message_ids: selectedMessages,
      })
      toast({
        title: "Success",
        description: "Messages marked as unread",
      })
      setSelectedMessages([])
      fetchMessages()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark messages as unread",
        variant: "destructive",
      })
    }
  }

  const handleBulkDelete = async () => {
    try {
      await bulkMailOperation({
        action: 'delete',
        message_ids: selectedMessages,
      })
      toast({
        title: "Success",
        description: "Messages deleted",
      })
      setSelectedMessages([])
      fetchMessages()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete messages",
        variant: "destructive",
      })
    }
  }

  const handleStar = async (messageId: string, isStarred: boolean) => {
    try {
      await updateMessage(messageId, { is_starred: !isStarred })
      fetchMessages()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update message",
        variant: "destructive",
      })
    }
  }

  const handleArchive = async (messageId: string) => {
    try {
      await updateMessage(messageId, { is_archived: true })
      toast({
        title: "Success",
        description: "Message archived",
      })
      fetchMessages()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to archive message",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (messageId: string) => {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inbox</h1>
        <p className="text-muted-foreground">Manage incoming messages from members</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search messages..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="property">Property</SelectItem>
            <SelectItem value="loan">Loan</SelectItem>
            <SelectItem value="contribution">Contribution</SelectItem>
            <SelectItem value="investment">Investment</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Messages ({messages.length})</CardTitle>
              <CardDescription>{messages.filter((m) => !m.is_read).length} unread messages</CardDescription>
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
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No messages found</div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                <Checkbox 
                  checked={selectedMessages.length === messages.length && messages.length > 0} 
                  onCheckedChange={handleSelectAll} 
                />
                <span className="text-sm font-medium">Select All</span>
              </div>

              <div className="space-y-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      !message.is_read ? "bg-accent/50" : ""
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
                            className={`font-semibold ${!message.is_read ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {message.from}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {message.category}
                          </Badge>
                          {!message.is_read && (
                            <Badge variant="default" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm mb-1 ${!message.is_read ? "font-medium" : ""}`}>{message.subject || '(No subject)'}</p>
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
                              handleStar(message.id, message.is_starred)
                            }}
                          >
                            <Star className={`h-4 w-4 ${message.is_starred ? "fill-yellow-400 text-yellow-400" : ""}`} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.preventDefault()
                              handleArchive(message.id)
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
                              handleDelete(message.id)
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
