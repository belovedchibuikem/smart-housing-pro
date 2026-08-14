"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell, Check, Trash2, Building2, CreditCard, Shield, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { apiFetch } from "@/lib/api/client"
import { toast } from "sonner"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  priority: string
  created_at: string
}

function normalizeNotification(raw: any): Notification | null {
  if (!raw || typeof raw !== "object" || !raw.id) return null
  return {
    id: String(raw.id),
    type: String(raw.type || "system"),
    title: String(raw.title || "Notification"),
    message: String(raw.message || ""),
    is_read: Boolean(raw.is_read ?? raw.read_at),
    priority: String(raw.priority || "medium"),
    created_at: String(raw.created_at || new Date().toISOString()),
  }
}

export function NotificationDropdown({ className }: { className?: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiFetch<{ success?: boolean; notifications?: unknown[] }>(
        "/super-admin/notifications?per_page=8"
      )
      const rows = Array.isArray(response.notifications) ? response.notifications : []
      setNotifications(rows.map(normalizeNotification).filter(Boolean) as Notification[])
    } catch (error) {
      console.error("Error loading notifications:", error)
      setNotifications([])
      toast.error("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadNotifications()
  }, [loadNotifications])

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await apiFetch<{ success?: boolean }>(`/super-admin/notifications/${notificationId}/read`, {
        method: "POST",
      })
      if (response.success) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId ? { ...notification, is_read: true } : notification
          )
        )
      }
    } catch {
      toast.error("Failed to mark notification as read")
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await apiFetch<{ success?: boolean }>("/super-admin/notifications/mark-all-read", {
        method: "POST",
      })
      if (response.success) {
        setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })))
      }
    } catch {
      toast.error("Failed to mark all notifications as read")
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await apiFetch<{ success?: boolean }>(`/super-admin/notifications/${notificationId}`, {
        method: "DELETE",
      })
      if (response.success) {
        setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId))
      }
    } catch {
      toast.error("Failed to delete notification")
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "security":
        return <Shield className="h-3 w-3" />
      case "business":
        return <Building2 className="h-3 w-3" />
      case "payment":
        return <CreditCard className="h-3 w-3" />
      case "user":
        return <Users className="h-3 w-3" />
      default:
        return <Bell className="h-3 w-3" />
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length
  const recentNotifications = notifications.slice(0, 5)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={`relative ${className || ""}`}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount} unread
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading notifications...</p>
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="p-4 text-center">
            <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-1">
              {recentNotifications.map((notification) => (
                <div key={notification.id} className="p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate">{notification.title}</p>
                        {!notification.is_read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-1">
                          {!notification.is_read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => void markAsRead(notification.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => void deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <DropdownMenuSeparator />
        <div className="p-2 space-y-1">
          <DropdownMenuItem asChild>
            <Link href="/super-admin/notifications" className="w-full">
              View All Notifications
            </Link>
          </DropdownMenuItem>
          {unreadCount > 0 && (
            <DropdownMenuItem onClick={() => void markAllAsRead()}>Mark All as Read</DropdownMenuItem>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
