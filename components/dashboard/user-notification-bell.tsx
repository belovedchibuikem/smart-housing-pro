"use client"

import { Bell, Check, CheckCheck, X, Loader2 } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { useUserNotifications, UserNotification } from "@/lib/hooks/use-user-notifications"
import { useEffect, useState } from "react"
import Link from "next/link"

const getNotificationIcon = (type: UserNotification["type"]) => {
	switch (type) {
		case "success":
			return "✅"
		case "error":
			return "❌"
		case "warning":
			return "⚠️"
		case "info":
			return "ℹ️"
		case "system":
			return "🔔"
		default:
			return "📢"
	}
}

const getNotificationColor = (type: UserNotification["type"]) => {
	switch (type) {
		case "success":
			return "text-green-600"
		case "error":
			return "text-red-600"
		case "warning":
			return "text-yellow-600"
		case "info":
			return "text-blue-600"
		case "system":
			return "text-purple-600"
		default:
			return "text-gray-600"
	}
}

export function UserNotificationBell() {
	const {
		notifications,
		unreadCount,
		loading,
		markAsRead,
		markAllAsRead,
		deleteNotification,
		refresh,
	} = useUserNotifications()

	const [open, setOpen] = useState(false)

	// Refresh when dropdown opens
	useEffect(() => {
		if (open) {
			refresh()
		}
	}, [open, refresh])

	const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
		e.stopPropagation()
		try {
			await markAsRead(notificationId)
		} catch (error) {
			console.error("Failed to mark as read:", error)
		}
	}

	const handleMarkAllAsRead = async (e: React.MouseEvent) => {
		e.stopPropagation()
		try {
			await markAllAsRead()
		} catch (error) {
			console.error("Failed to mark all as read:", error)
		}
	}

	const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
		e.stopPropagation()
		try {
			await deleteNotification(notificationId)
		} catch (error) {
			console.error("Failed to delete notification:", error)
		}
	}

	const displayNotifications = notifications.slice(0, 10) // Show latest 10

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					<Bell className="h-5 w-5" />
					{unreadCount > 0 && (
						<Badge
							className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600"
						>
							{unreadCount > 99 ? "99+" : unreadCount}
						</Badge>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-96">
				<div className="flex items-center justify-between px-2 py-1.5">
					<DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
					<div className="flex items-center gap-1">
						{unreadCount > 0 && (
							<Button
								variant="ghost"
								size="sm"
								className="h-7 px-2 text-xs"
								onClick={handleMarkAllAsRead}
							>
								<CheckCheck className="h-3 w-3 mr-1" />
								Mark all read
							</Button>
						)}
						<Button
							variant="ghost"
							size="sm"
							className="h-7 px-2 text-xs"
							onClick={() => refresh()}
							disabled={loading}
						>
							{loading ? (
								<Loader2 className="h-3 w-3 animate-spin" />
							) : (
								"Refresh"
							)}
						</Button>
					</div>
				</div>
				<DropdownMenuSeparator />
				<ScrollArea className="h-[400px]">
					{loading && notifications.length === 0 ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : displayNotifications.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8 text-center px-4">
							<Bell className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
							<p className="text-sm text-muted-foreground">No notifications</p>
							<p className="text-xs text-muted-foreground mt-1">
								You're all caught up!
							</p>
						</div>
					) : (
						<div className="py-1">
							{displayNotifications.map((notification) => (
								<div
									key={notification.id}
									className={cn(
										"relative px-3 py-2.5 hover:bg-accent transition-colors cursor-pointer border-b last:border-b-0",
										notification.is_unread && "bg-accent/50"
									)}
								>
									<div className="flex items-start gap-2">
										<div className="flex-shrink-0 mt-0.5">
											<span className="text-lg">
												{getNotificationIcon(notification.type)}
											</span>
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between gap-2">
												<div className="flex-1 min-w-0">
													<p
														className={cn(
															"text-sm font-medium truncate",
															notification.is_unread && "font-semibold",
															getNotificationColor(notification.type)
														)}
													>
														{notification.title}
													</p>
													<p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
														{notification.message}
													</p>
													{notification.time_ago && (
														<p className="text-xs text-muted-foreground mt-1">
															{notification.time_ago}
														</p>
													)}
												</div>
												{notification.is_unread && (
													<div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1" />
												)}
											</div>
										</div>
										<div className="flex-shrink-0 flex items-start gap-1">
											{notification.is_unread && (
												<Button
													variant="ghost"
													size="icon"
													className="h-6 w-6"
													onClick={(e) => handleMarkAsRead(notification.id, e)}
													title="Mark as read"
												>
													<Check className="h-3 w-3" />
												</Button>
											)}
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6"
												onClick={(e) => handleDelete(notification.id, e)}
												title="Delete"
											>
												<X className="h-3 w-3" />
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</ScrollArea>
				{displayNotifications.length > 0 && (
					<>
						<DropdownMenuSeparator />
						<div className="px-2 py-1.5">
							<Link href="/dashboard/notifications" className="block">
								<Button variant="ghost" className="w-full text-xs" size="sm">
									View all notifications ({notifications.length})
								</Button>
							</Link>
						</div>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

