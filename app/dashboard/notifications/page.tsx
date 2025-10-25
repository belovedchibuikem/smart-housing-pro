"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle, AlertCircle, Info, DollarSign, FileText, Home, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "payment",
      title: "Monthly Contribution Due",
      message: "Your monthly contribution of ₦50,000 is due in 3 days",
      time: "2 hours ago",
      read: false,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      id: 2,
      type: "loan",
      title: "Loan Application Approved",
      message: "Your housing loan application for ₦5,000,000 has been approved",
      time: "1 day ago",
      read: false,
      icon: CheckCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      id: 3,
      type: "kyc",
      title: "KYC Verification Complete",
      message: "Your KYC documents have been verified successfully",
      time: "2 days ago",
      read: true,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      id: 4,
      type: "property",
      title: "New Property Available",
      message: "A new 3-bedroom apartment is now available in Abuja Estate",
      time: "3 days ago",
      read: true,
      icon: Home,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      id: 5,
      type: "alert",
      title: "Payment Overdue",
      message: "Your loan repayment of ₦150,000 is overdue by 5 days",
      time: "5 days ago",
      read: false,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ])

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated with your housing cooperative activities</p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>All Notifications</CardTitle>
            </div>
            {unreadCount > 0 && (
              <Badge variant="default" className="rounded-full">
                {unreadCount} unread
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
              <TabsTrigger value="payment">Payments</TabsTrigger>
              <TabsTrigger value="loan">Loans</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = notification.icon
                  return (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                        !notification.read ? "bg-muted/50" : "bg-background"
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${notification.bgColor}`}>
                        <Icon className={`h-5 w-5 ${notification.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold">{notification.title}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                          {!notification.read && (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </TabsContent>

            <TabsContent value="unread" className="space-y-4 mt-6">
              {notifications.filter((n) => !n.read).length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">All caught up!</p>
                </div>
              ) : (
                notifications
                  .filter((n) => !n.read)
                  .map((notification) => {
                    const Icon = notification.icon
                    return (
                      <div key={notification.id} className="flex items-start gap-4 p-4 rounded-lg border bg-muted/50">
                        <div className={`p-2 rounded-lg ${notification.bgColor}`}>
                          <Icon className={`h-5 w-5 ${notification.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-muted-foreground">{notification.time}</span>
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })
              )}
            </TabsContent>

            <TabsContent value="payment" className="space-y-4 mt-6">
              {notifications.filter((n) => n.type === "payment" || n.type === "alert").length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No payment notifications</p>
                </div>
              ) : (
                notifications
                  .filter((n) => n.type === "payment" || n.type === "alert")
                  .map((notification) => {
                    const Icon = notification.icon
                    return (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border ${
                          !notification.read ? "bg-muted/50" : "bg-background"
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${notification.bgColor}`}>
                          <Icon className={`h-5 w-5 ${notification.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <span className="text-xs text-muted-foreground mt-2 block">{notification.time}</span>
                        </div>
                      </div>
                    )
                  })
              )}
            </TabsContent>

            <TabsContent value="loan" className="space-y-4 mt-6">
              {notifications.filter((n) => n.type === "loan").length === 0 ? (
                <div className="text-center py-12">
                  <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No loan notifications</p>
                </div>
              ) : (
                notifications
                  .filter((n) => n.type === "loan")
                  .map((notification) => {
                    const Icon = notification.icon
                    return (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border ${
                          !notification.read ? "bg-muted/50" : "bg-background"
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${notification.bgColor}`}>
                          <Icon className={`h-5 w-5 ${notification.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <span className="text-xs text-muted-foreground mt-2 block">{notification.time}</span>
                        </div>
                      </div>
                    )
                  })
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
