"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  getAdminNotifications,
  getAdminNotificationStats,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteAdminNotification,
} from "@/lib/api/client"

import {
  Search,
  Bell,
  CheckCircle2,
  XCircle,
  Loader2,
  Filter,
  Trash2,
  Eye,
  CheckCheck,
  Calendar,
  User,
} from "lucide-react"

interface AdminNotification {
  id: string
  user_id: string
  type: "info" | "success" | "warning" | "error" | "system"
  title: string
  message: string
  data?: Record<string, any>
  read_at?: string | null
  created_at: string
  updated_at: string
  user?: {
    id: string
    first_name: string
    last_name: string
    email: string
    avatar_url?: string
  }
}
import { usePageLoading } from "@/hooks/use-loading"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function AdminNotificationsPage() {
  const { isLoading, loadData } = usePageLoading()
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [stats, setStats] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [readFilter, setReadFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set())
  const [selectedNotification, setSelectedNotification] = useState<AdminNotification | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  const typeColors: Record<string, string> = {
    info: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    system: "bg-purple-100 text-purple-800",
  }

  const loadNotifications = useCallback(async () => {
    try {
      const response = await loadData(() => getAdminNotifications({
        search: searchQuery || undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
        read: readFilter !== "all" ? readFilter === "unread" ? "false" : "true" : undefined,
        page: currentPage,
        per_page: 15,
      }))
      if (response) {
        setNotifications(response.notifications || [])
        setTotalPages(response.pagination?.last_page || 1)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load notifications")
    }
  }, [searchQuery, typeFilter, readFilter, currentPage, loadData])

  const loadStats = useCallback(async () => {
    try {
      const response = await getAdminNotificationStats()
      setStats(response.stats)
    } catch (error: any) {
      console.error("Failed to load stats:", error)
    }
  }, [])

  useEffect(() => {
    loadNotifications()
    loadStats()
  }, [loadNotifications, loadStats])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId)
      toast.success("Notification marked as read")
      loadNotifications()
      loadStats()
    } catch (error: any) {
      toast.error(error.message || "Failed to mark notification as read")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      toast.success("All notifications marked as read")
      loadNotifications()
      loadStats()
    } catch (error: any) {
      toast.error(error.message || "Failed to mark all notifications as read")
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteAdminNotification(notificationId)
      toast.success("Notification deleted successfully")
      loadNotifications()
      loadStats()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete notification")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const toggleSelectNotification = (notificationId: string) => {
    const newSelected = new Set(selectedNotifications)
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId)
    } else {
      newSelected.add(notificationId)
    }
    setSelectedNotifications(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set())
    } else {
      setSelectedNotifications(new Set(notifications.map((n) => n.id)))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">View and manage all system notifications</p>
        </div>
        <div className="flex gap-2">
          {selectedNotifications.size > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={isLoading}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark Selected as Read
            </Button>
          )}
          <Button variant="outline" onClick={handleMarkAllAsRead} disabled={isLoading}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <Bell className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.unread || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.today || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.this_month || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <Select value={readFilter} onValueChange={setReadFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => loadNotifications()} variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>Manage and view all system notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedNotifications.size === notifications.length && notifications.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedNotifications.has(notification.id)}
                            onCheckedChange={() => toggleSelectNotification(notification.id)}
                          />
                        </TableCell>
                        <TableCell>
                          {notification.user ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {notification.user.first_name} {notification.user.last_name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">System</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={typeColors[notification.type] || ""}>
                            {notification.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            <p className="font-medium truncate">{notification.title}</p>
                            <p className="text-sm text-muted-foreground truncate">{notification.message}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {notification.read_at ? (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Read
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-600">
                              <Bell className="h-3 w-3 mr-1" />
                              Unread
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(notification.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedNotification(notification)
                                setDetailDialogOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!notification.read_at && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(notification.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
            <DialogDescription>
              View full details of the notification
            </DialogDescription>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Type</Label>
                  <Badge className={typeColors[selectedNotification.type] || ""}>
                    {selectedNotification.type}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>
                    {selectedNotification.read_at ? (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Read
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600">
                        <Bell className="h-3 w-3 mr-1" />
                        Unread
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label>User</Label>
                  <p className="text-sm">
                    {selectedNotification.user
                      ? `${selectedNotification.user.first_name} ${selectedNotification.user.last_name}`
                      : "System"}
                  </p>
                </div>
                <div>
                  <Label>Date</Label>
                  <p className="text-sm">{formatDate(selectedNotification.created_at)}</p>
                </div>
              </div>
              <div>
                <Label>Title</Label>
                <p className="text-base font-medium">{selectedNotification.title}</p>
              </div>
              <div>
                <Label>Message</Label>
                <Textarea
                  value={selectedNotification.message}
                  readOnly
                  rows={6}
                  className="resize-none"
                />
              </div>
              {selectedNotification.data && Object.keys(selectedNotification.data).length > 0 && (
                <div>
                  <Label>Additional Data</Label>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-40">
                    {JSON.stringify(selectedNotification.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedNotification && !selectedNotification.read_at && (
              <Button onClick={() => handleMarkAsRead(selectedNotification.id)}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Read
              </Button>
            )}
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

