"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Save, Mail, TestTube, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { toast as sonnerToast } from "sonner"
import { apiFetch } from "@/lib/api/client"

interface Settings {
  // General
  site_name?: string
  site_email?: string
  support_email?: string
  default_currency?: string
  timezone?: string
  maintenance_mode?: boolean
  
  // Email
  smtp_host?: string
  smtp_port?: number
  smtp_username?: string
  smtp_password?: string
  smtp_encryption?: string
  smtp_from_address?: string
  smtp_from_name?: string
  
  // Security
  allow_registration?: boolean
  require_email_verification?: boolean
  session_timeout?: number
  password_min_length?: number
  require_strong_password?: boolean
  enable_two_factor?: boolean
  max_login_attempts?: number
  
  // Notifications
  email_notifications?: boolean
  sms_notifications?: boolean
  admin_alerts?: boolean
  notification_email?: string
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [testEmailAddress, setTestEmailAddress] = useState("")
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null)
  const [settings, setSettings] = useState<Settings>({})

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const data = await apiFetch<{ settings: Settings }>("/admin/settings")
      setSettings(data.settings || {})
    } catch (error: any) {
      console.error("Error fetching settings:", error)
      sonnerToast.error("Failed to load settings", {
        description: error.message || "Please try again later"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = await apiFetch("/admin/settings", {
        method: "POST",
        body: { settings },
      })

      if (data.success) {
        sonnerToast.success("Settings saved successfully", {
          description: "Your changes have been applied"
        })
        await fetchSettings()
        // Trigger settings update event for other components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('tenant-settings-updated'))
        }
      } else {
        throw new Error(data.message || "Failed to save settings")
      }
    } catch (error: any) {
      console.error("Error saving settings:", error)
      sonnerToast.error("Failed to save settings", {
        description: error.message || "Please check your input and try again"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    if (!testEmailAddress) {
      sonnerToast.error("Please enter an email address")
      return
    }

    setTestingEmail(true)
    setTestEmailResult(null)
    try {
      const data = await apiFetch("/admin/settings/test-email", {
        method: "POST",
        body: { email: testEmailAddress },
      })

      if (data.success) {
        setTestEmailResult({ success: true, message: data.message })
        sonnerToast.success("Test email sent successfully", {
          description: data.message
        })
      } else {
        throw new Error(data.message || "Failed to send test email")
      }
    } catch (error: any) {
      console.error("Error testing email:", error)
      setTestEmailResult({ success: false, message: error.message || "Failed to send test email" })
      sonnerToast.error("Failed to send test email", {
        description: error.message || "Please check your SMTP settings"
      })
    } finally {
      setTestingEmail(false)
    }
  }

  const updateSetting = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  const CURRENCIES = ['NGN', 'USD', 'EUR', 'GBP', 'GHS', 'KES', 'ZAR']
  const TIMEZONES = [
    'Africa/Lagos', 'Africa/Accra', 'Africa/Nairobi', 'Africa/Johannesburg',
    'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London'
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground mt-1">Configure system-wide settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic system information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="site_name">Site Name</Label>
                <Input
                  id="site_name"
                  value={settings.site_name || ""}
                  onChange={(e) => updateSetting('site_name', e.target.value)}
                  placeholder="Your Site Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_email">Site Email</Label>
                <Input
                  id="site_email"
                  type="email"
                  value={settings.site_email || ""}
                  onChange={(e) => updateSetting('site_email', e.target.value)}
                  placeholder="contact@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support_email">Support Email</Label>
                <Input
                  id="support_email"
                  type="email"
                  value={settings.support_email || ""}
                  onChange={(e) => updateSetting('support_email', e.target.value)}
                  placeholder="support@example.com"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="default_currency">Default Currency</Label>
                  <Select
                    value={settings.default_currency || "NGN"}
                    onValueChange={(value) => updateSetting('default_currency', value)}
                  >
                    <SelectTrigger id="default_currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.timezone || "Africa/Lagos"}
                    onValueChange={(value) => updateSetting('timezone', value)}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Temporarily disable public access</p>
                </div>
                <Switch
                  checked={settings.maintenance_mode || false}
                  onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>Configure email notifications and SMTP settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input
                    id="smtp_host"
                    value={settings.smtp_host || ""}
                    onChange={(e) => updateSetting('smtp_host', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={settings.smtp_port || ""}
                    onChange={(e) => updateSetting('smtp_port', parseInt(e.target.value) || 587)}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp_encryption">SMTP Encryption</Label>
                <Select
                  value={settings.smtp_encryption || "tls"}
                  onValueChange={(value) => updateSetting('smtp_encryption', value)}
                >
                  <SelectTrigger id="smtp_encryption">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tls">TLS</SelectItem>
                    <SelectItem value="ssl">SSL</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtp_username">SMTP Username</Label>
                  <Input
                    id="smtp_username"
                    value={settings.smtp_username || ""}
                    onChange={(e) => updateSetting('smtp_username', e.target.value)}
                    placeholder="your-email@gmail.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_password">SMTP Password</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    value={settings.smtp_password || ""}
                    onChange={(e) => updateSetting('smtp_password', e.target.value)}
                    placeholder="Your SMTP password"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtp_from_address">From Email Address</Label>
                  <Input
                    id="smtp_from_address"
                    type="email"
                    value={settings.smtp_from_address || ""}
                    onChange={(e) => updateSetting('smtp_from_address', e.target.value)}
                    placeholder="noreply@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_from_name">From Name</Label>
                  <Input
                    id="smtp_from_name"
                    value={settings.smtp_from_name || ""}
                    onChange={(e) => updateSetting('smtp_from_name', e.target.value)}
                    placeholder="Your Site Name"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test_email">Test Email Configuration</Label>
                  <div className="flex gap-2">
                    <Input
                      id="test_email"
                      type="email"
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                      placeholder="test@example.com"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTestEmail}
                      disabled={testingEmail || !testEmailAddress}
                    >
                      {testingEmail ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <TestTube className="h-4 w-4 mr-2" />
                          Send Test
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {testEmailResult && (
                  <Alert variant={testEmailResult.success ? "default" : "destructive"}>
                    {testEmailResult.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>{testEmailResult.message}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow New Registrations</Label>
                  <p className="text-sm text-muted-foreground">Allow new users to register</p>
                </div>
                <Switch
                  checked={settings.allow_registration ?? true}
                  onCheckedChange={(checked) => updateSetting('allow_registration', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">Users must verify email before accessing system</p>
                </div>
                <Switch
                  checked={settings.require_email_verification ?? true}
                  onCheckedChange={(checked) => updateSetting('require_email_verification', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Strong Password</Label>
                  <p className="text-sm text-muted-foreground">Enforce strong password requirements</p>
                </div>
                <Switch
                  checked={settings.require_strong_password ?? false}
                  onCheckedChange={(checked) => updateSetting('require_strong_password', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Allow users to enable 2FA for extra security</p>
                </div>
                <Switch
                  checked={settings.enable_two_factor ?? false}
                  onCheckedChange={(checked) => updateSetting('enable_two_factor', checked)}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    value={settings.session_timeout || ""}
                    onChange={(e) => updateSetting('session_timeout', parseInt(e.target.value) || 30)}
                    placeholder="30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_min_length">Minimum Password Length</Label>
                  <Input
                    id="password_min_length"
                    type="number"
                    value={settings.password_min_length || ""}
                    onChange={(e) => updateSetting('password_min_length', parseInt(e.target.value) || 8)}
                    placeholder="8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
                <Input
                  id="max_login_attempts"
                  type="number"
                  value={settings.max_login_attempts || ""}
                  onChange={(e) => updateSetting('max_login_attempts', parseInt(e.target.value) || 5)}
                  placeholder="5"
                />
                <p className="text-sm text-muted-foreground">Maximum failed login attempts before account lockout</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure system notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send email notifications to users</p>
                </div>
                <Switch
                  checked={settings.email_notifications ?? true}
                  onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send SMS notifications to users</p>
                </div>
                <Switch
                  checked={settings.sms_notifications ?? false}
                  onCheckedChange={(checked) => updateSetting('sms_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Admin Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive alerts for important events</p>
                </div>
                <Switch
                  checked={settings.admin_alerts ?? true}
                  onCheckedChange={(checked) => updateSetting('admin_alerts', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification_email">Notification Email</Label>
                <Input
                  id="notification_email"
                  type="email"
                  value={settings.notification_email || ""}
                  onChange={(e) => updateSetting('notification_email', e.target.value)}
                  placeholder="admin@example.com"
                />
                <p className="text-sm text-muted-foreground">Email address to receive admin notifications</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
