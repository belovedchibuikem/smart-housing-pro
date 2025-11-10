"use client"

import { useState, useEffect, useCallback } from "react"
import { apiFetch } from "@/lib/api/client"

export interface Notification {
  id: string
  user_id: string
  user?: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
  type: "info" | "success" | "warning" | "error" | "system"
  title: string
  message: string
  data?: Record<string, any>
  read_at?: string
  is_read: boolean
  is_unread: boolean
  created_at: string
  updated_at: string
  time_ago?: string
}

export interface NotificationStats {
  total: number
  unread: number
  read: number
  by_type: Record<string, number>
  today: number
  this_week: number
  this_month: number
}

interface UseAdminNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  stats: NotificationStats | null
  loading: boolean
  error: string | null
  fetchNotifications: (params?: {
    user_id?: string
    type?: string
    read?: boolean
    from_date?: string
    to_date?: string
    search?: string
    page?: number
    per_page?: number
  }) => Promise<void>
  fetchUnreadCount: () => Promise<void>
  fetchStats: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: (userId?: string) => Promise<void>
  markMultipleAsRead: (notificationIds: string[]) => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useAdminNotifications(): UseAdminNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async (params?: {
    user_id?: string
    type?: string
    read?: boolean
    from_date?: string
    to_date?: string
    search?: string
    page?: number
    per_page?: number
  }) => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      if (params?.user_id) queryParams.set("user_id", params.user_id)
      if (params?.type) queryParams.set("type", params.type)
      if (params?.read !== undefined) queryParams.set("read", String(params.read))
      if (params?.from_date) queryParams.set("from_date", params.from_date)
      if (params?.to_date) queryParams.set("to_date", params.to_date)
      if (params?.search) queryParams.set("search", params.search)
      if (params?.page) queryParams.set("page", String(params.page))
      if (params?.per_page) queryParams.set("per_page", String(params.per_page))

      const response = await apiFetch<{
        success: boolean
        notifications: Notification[]
        pagination: {
          current_page: number
          last_page: number
          per_page: number
          total: number
        }
      }>(`/admin/notifications?${queryParams.toString()}`)

      if (response.success) {
        setNotifications(response.notifications)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notifications")
      console.error("Error fetching notifications:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await apiFetch<{
        success: boolean
        unread_count: number
      }>("/admin/notifications/unread-count")

      if (response.success) {
        setUnreadCount(response.unread_count)
      }
    } catch (err) {
      console.error("Error fetching unread count:", err)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiFetch<{
        success: boolean
        stats: NotificationStats
      }>("/admin/notifications/stats")

      if (response.success) {
        setStats(response.stats)
      }
    } catch (err) {
      console.error("Error fetching stats:", err)
    }
  }, [])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await apiFetch<{
        success: boolean
        message: string
      }>(`/admin/notifications/${notificationId}/read`, {
        method: "POST",
      })

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId
            ? { ...notif, read_at: new Date().toISOString(), is_read: true, is_unread: false }
            : notif
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error("Error marking notification as read:", err)
      throw err
    }
  }, [])

  const markAllAsRead = useCallback(async (userId?: string) => {
    try {
      const body = userId ? { user_id: userId } : {}
      await apiFetch<{
        success: boolean
        message: string
        count: number
      }>("/admin/notifications/mark-all-read", {
        method: "POST",
        body,
      })

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          read_at: notif.read_at || new Date().toISOString(),
          is_read: true,
          is_unread: false,
        }))
      )
      setUnreadCount(0)
    } catch (err) {
      console.error("Error marking all as read:", err)
      throw err
    }
  }, [])

  const markMultipleAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      await apiFetch<{
        success: boolean
        message: string
        count: number
      }>("/admin/notifications/mark-multiple-read", {
        method: "POST",
        body: { notification_ids: notificationIds },
      })

      // Update local state
      const updatedIds = new Set(notificationIds)
      let updatedCount = 0
      setNotifications((prev) =>
        prev.map((notif) => {
          if (updatedIds.has(notif.id) && !notif.is_read) {
            updatedCount++
            return {
              ...notif,
              read_at: new Date().toISOString(),
              is_read: true,
              is_unread: false,
            }
          }
          return notif
        })
      )
      setUnreadCount((prev) => Math.max(0, prev - updatedCount))
    } catch (err) {
      console.error("Error marking multiple as read:", err)
      throw err
    }
  }, [])

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await apiFetch<{
        success: boolean
        message: string
      }>(`/admin/notifications/${notificationId}`, {
        method: "DELETE",
      })

      // Update local state
      const deleted = notifications.find((n) => n.id === notificationId)
      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId))
      if (deleted && !deleted.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error("Error deleting notification:", err)
      throw err
    }
  }, [notifications])

  const refresh = useCallback(async () => {
    await Promise.all([
      fetchNotifications({ per_page: 10 }),
      fetchUnreadCount(),
    ])
  }, [fetchNotifications, fetchUnreadCount])

  // Initial fetch
  useEffect(() => {
    refresh()
  }, [refresh])

  // Poll for updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  return {
    notifications,
    unreadCount,
    stats,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    fetchStats,
    markAsRead,
    markAllAsRead,
    markMultipleAsRead,
    deleteNotification,
    refresh,
  }
}

