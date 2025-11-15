"use client"

import { useState, useEffect, useCallback } from "react"
import { apiFetch } from "@/lib/api/client"

export interface UserNotification {
	id: string
	user_id: string
	type: "info" | "success" | "warning" | "error" | "system"
	title: string
	message: string
	data?: Record<string, any>
	read_at?: string | null
	is_read: boolean
	is_unread: boolean
	created_at: string
	updated_at: string
	time_ago?: string
}

interface UseUserNotificationsReturn {
	notifications: UserNotification[]
	unreadCount: number
	loading: boolean
	error: string | null
	fetchNotifications: (params?: {
		type?: string
		read?: boolean
		page?: number
		per_page?: number
	}) => Promise<void>
	fetchUnreadCount: () => Promise<void>
	markAsRead: (notificationId: string) => Promise<void>
	markAllAsRead: () => Promise<void>
	deleteNotification: (notificationId: string) => Promise<void>
	refresh: () => Promise<void>
}

export function useUserNotifications(): UseUserNotificationsReturn {
	const [notifications, setNotifications] = useState<UserNotification[]>([])
	const [unreadCount, setUnreadCount] = useState(0)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fetchNotifications = useCallback(async (params?: {
		type?: string
		read?: boolean
		page?: number
		per_page?: number
	}) => {
		try {
			setLoading(true)
			setError(null)

			const queryParams = new URLSearchParams()
			if (params?.type) queryParams.set("type", params.type)
			if (params?.read !== undefined) queryParams.set("read", String(params.read))
			if (params?.page) queryParams.set("page", String(params.page))
			if (params?.per_page) queryParams.set("per_page", String(params.per_page))

			const response = await apiFetch<{
				notifications: UserNotification[]
				pagination: {
					current_page: number
					last_page: number
					per_page: number
					total: number
				}
			}>(`/notifications?${queryParams.toString()}`)

			// Format notifications with time_ago
			const formattedNotifications = response.notifications.map((notif) => ({
				...notif,
				is_read: !!notif.read_at,
				is_unread: !notif.read_at,
				time_ago: formatTimeAgo(notif.created_at),
			}))

			setNotifications(formattedNotifications)
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
				unread_count: number
			}>("/notifications/unread-count")

			setUnreadCount(response.unread_count)
		} catch (err) {
			console.error("Error fetching unread count:", err)
		}
	}, [])

	const markAsRead = useCallback(async (notificationId: string) => {
		try {
			await apiFetch<{
				success: boolean
				message: string
			}>(`/notifications/${notificationId}/read`, {
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

	const markAllAsRead = useCallback(async () => {
		try {
			await apiFetch<{
				success: boolean
				message: string
			}>("/notifications/mark-all-read", {
				method: "POST",
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

	const deleteNotification = useCallback(async (notificationId: string) => {
		try {
			await apiFetch<{
				success: boolean
				message: string
			}>(`/notifications/${notificationId}`, {
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
		loading,
		error,
		fetchNotifications,
		fetchUnreadCount,
		markAsRead,
		markAllAsRead,
		deleteNotification,
		refresh,
	}
}

function formatTimeAgo(dateString: string): string {
	const date = new Date(dateString)
	const now = new Date()
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

	if (diffInSeconds < 60) {
		return "Just now"
	}

	const diffInMinutes = Math.floor(diffInSeconds / 60)
	if (diffInMinutes < 60) {
		return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
	}

	const diffInHours = Math.floor(diffInMinutes / 60)
	if (diffInHours < 24) {
		return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
	}

	const diffInDays = Math.floor(diffInHours / 24)
	if (diffInDays < 7) {
		return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
	}

	const diffInWeeks = Math.floor(diffInDays / 7)
	if (diffInWeeks < 4) {
		return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`
	}

	const diffInMonths = Math.floor(diffInDays / 30)
	return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`
}

