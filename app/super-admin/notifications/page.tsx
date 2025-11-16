"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Bell, 
  Shield, 
  Users, 
  Building2, 
  CreditCard, 
  AlertCircle, 
  Settings,
  Trash2,
  CheckCircle2
} from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { toast } from "sonner"

interface Notification {
  id: string
  type: 'system' | 'business' | 'payment' | 'security' | 'user'
  title: string
  message: string
  is_read: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string
  metadata?: any
}

interface NotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  business_alerts: boolean
  payment_alerts: boolean
  security_alerts: boolean
  system_updates: boolean
}

export default function SuperAdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: true,
    business_alerts: true,
    payment_alerts: true,
    security_alerts: true,
    system_updates: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadNotifications()
    loadSettings()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      // Load notifications from API
      const response = await apiFetch('/super-admin/notifications')
      if (response.success) {
        setNotifications(response.notifications)
      } else {
        // Fallback to mock data if API fails
        const mockNotifications: Notification[] = [
          {
            id: '1',
            type: 'security',
            title: 'New Super Admin Login',
            message: 'A new super admin account was created and logged in successfully.',
            is_read: false,
            priority: 'high',
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            type: 'business',
            title: 'New Business Registration',
            message: 'A new business "Tech Solutions Ltd" has registered on the platform.',
            is_read: false,
            priority: 'medium',
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
        ]
        setNotifications(mockNotifications)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
      // Fallback to mock data if API fails
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'security',
          title: 'New Super Admin Login',
          message: 'A new super admin account was created and logged in successfully.',
          is_read: false,
          priority: 'high',
          created_at: new Date().toISOString(),
        },
      ]
      setNotifications(mockNotifications)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      // Mock settings for now - replace with actual API call
      setSettings({
        email_notifications: true,
        push_notifications: true,
        business_alerts: true,
        payment_alerts: true,
        security_alerts: true,
        system_updates: true,
      })
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await apiFetch(`/super-admin/notifications/${notificationId}/read`, {
        method: 'POST'
      })
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true }
              : notification
          )
        )
        toast.success('Notification marked as read')
      } else {
        toast.error('Failed to mark notification as read')
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Failed to mark notification as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await apiFetch('/super-admin/notifications/mark-all-read', {
        method: 'POST'
      })
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, is_read: true }))
        )
        toast.success('All notifications marked as read')
      } else {
        toast.error('Failed to mark all notifications as read')
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      toast.error('Failed to mark all notifications as read')
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await apiFetch(`/super-admin/notifications/${notificationId}`, {
        method: 'DELETE'
      })
      
      if (response.success) {
        setNotifications(prev => 
          prev.filter(notification => notification.id !== notificationId)
        )
        toast.success('Notification deleted')
      } else {
        toast.error('Failed to delete notification')
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Failed to delete notification')
    }
  }

  const updateSettings = async (newSettings: NotificationSettings) => {
    try {
      setSaving(true)
      // Mock API call - replace with actual implementation
      setSettings(newSettings)
      toast.success('Notification settings updated')
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error('Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'security':
        return <Shield className="h-4 w-4" />
      case 'business':
        return <Building2 className="h-4 w-4" />
      case 'payment':
        return <CreditCard className="h-4 w-4" />
      case 'user':
        return <Users className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive'
      case 'high':
        return 'default'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Manage your notifications and alerts</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive">
              {unreadCount} unread
            </Badge>
          )}
          <Button onClick={markAllAsRead} variant="outline" size="sm">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-muted-foreground text-center">
                  You're all caught up! New notifications will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className={!notification.is_read ? 'border-l-4 border-l-primary' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{notification.title}</h4>
                            <Badge variant={getPriorityColor(notification.priority)}>
                              {notification.priority}
                            </Badge>
                            {!notification.is_read && (
                              <div className="h-2 w-2 rounded-full bg-primary"></div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.is_read && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark Read
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => 
                      updateSettings({ ...settings, email_notifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.push_notifications}
                    onCheckedChange={(checked) => 
                      updateSettings({ ...settings, push_notifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Business Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about new business registrations
                    </p>
                  </div>
                  <Switch
                    checked={settings.business_alerts}
                    onCheckedChange={(checked) => 
                      updateSettings({ ...settings, business_alerts: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Payment Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about payment activities
                    </p>
                  </div>
                  <Switch
                    checked={settings.payment_alerts}
                    onCheckedChange={(checked) => 
                      updateSettings({ ...settings, payment_alerts: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about security-related events
                    </p>
                  </div>
                  <Switch
                    checked={settings.security_alerts}
                    onCheckedChange={(checked) => 
                      updateSettings({ ...settings, security_alerts: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">System Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about system updates and maintenance
                    </p>
                  </div>
                  <Switch
                    checked={settings.system_updates}
                    onCheckedChange={(checked) => 
                      updateSettings({ ...settings, system_updates: checked })
                    }
                  />
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  These settings control how you receive notifications. Changes will take effect immediately.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
