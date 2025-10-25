"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Mail, Bell, Shield, Database, Save, TestTube, AlertCircle, CheckCircle } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { toast } from "sonner"

interface PlatformSetting {
  id: string
  key: string
  value: any
  type: 'string' | 'boolean' | 'integer' | 'json'
  category: 'general' | 'email' | 'security' | 'notifications' | 'database'
  description: string
  is_public: boolean
  created_at: string
  updated_at: string
}

interface SettingsResponse {
  success: boolean
  settings: PlatformSetting[]
}

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [emailTestResult, setEmailTestResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await apiFetch<SettingsResponse>('/super-admin/settings')
      console.log('Loaded settings response:', response)
      if (response.success) {
        const settingsMap: Record<string, any> = {}
        response.settings.forEach(setting => {
          console.log(`Mapping setting: ${setting.key} = ${setting.value} (type: ${typeof setting.value})`)
          settingsMap[setting.key] = setting.value
        })
        console.log('Settings map:', settingsMap)
        console.log('Support email specifically:', settingsMap.support_email)
        setSettings(settingsMap)
      } else {
        // If no settings exist, initialize with empty object
        setSettings({})
      }
    } catch (error: any) {
      console.error('Settings load error:', error)
      // Initialize with default empty settings if API fails
      setSettings({})
      toast.error('Failed to load settings. Using defaults.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        type: getSettingType(key),
        category: getSettingCategory(key)
      }))

      console.log('Sending settings:', settingsArray)
      console.log('Current settings state:', settings)

      const response = await apiFetch<{ success: boolean; message: string }>('/super-admin/settings/bulk-update', {
        method: 'POST',
        body: { settings: settingsArray }
      })

      if (response.success) {
        toast.success('Settings saved successfully!')
        // Reload settings to get updated values
        loadSettings()
      } else {
        toast.error(response.message || 'Failed to save settings')
      }
    } catch (error: any) {
      console.error('Save settings error:', error)
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const testEmailSettings = async () => {
    setTestingEmail(true)
    setEmailTestResult(null)
    
    try {
      const emailSettings = {
        smtp_host: settings.smtp_host,
        smtp_port: settings.smtp_port,
        smtp_username: settings.smtp_username,
        smtp_password: settings.smtp_password,
        smtp_encryption: settings.smtp_encryption,
        from_email: settings.from_email,
        from_name: settings.from_name
      }

      const response = await apiFetch<{ success: boolean; message: string }>('/super-admin/settings/test-email', {
        method: 'POST',
        body: emailSettings
      })

      setEmailTestResult({
        success: response.success,
        message: response.message
      })
    } catch (error: any) {
      setEmailTestResult({
        success: false,
        message: error.message || 'Email test failed'
      })
    } finally {
      setTestingEmail(false)
    }
  }

  const getSettingType = (key: string): string => {
    // Explicit string types
    if (key === 'support_email' || key === 'platform_name' || key === 'platform_domain' || 
        key === 'timezone' || key === 'from_email' || key === 'from_name' ||
        key.includes('email') || key.includes('name') || key.includes('domain')) {
      return 'string'
    }
    
    // Boolean types
    if (key.includes('enabled') || key.includes('require') || key.includes('notify') || 
        key.includes('maintenance') || key.includes('2fa') || key.includes('whitelist') ||
        key.includes('optimize')) {
      return 'boolean'
    }
    
    // Integer types
    if (key.includes('port') || key.includes('timeout') || key.includes('days')) {
      return 'integer'
    }
    
    // JSON types
    if (key.includes('allowed_ips')) {
      return 'json'
    }
    
    return 'string'
  }

  const getSettingCategory = (key: string): string => {
    if (key.includes('smtp') || key.includes('from_email') || key.includes('from_name')) return 'email'
    if (key.includes('security') || key.includes('2fa') || key.includes('session') || key.includes('ip')) return 'security'
    if (key.includes('notify')) return 'notifications'
    if (key.includes('backup') || key.includes('optimize')) return 'database'
    return 'general'
  }

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground mt-2">Configure platform-wide settings and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="h-4 w-4 mr-2" />
            Database
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic platform information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <Label htmlFor="platform_name">Platform Name</Label>
                  <Input
                    id="platform_name"
                    value={settings.platform_name || ''}
                    onChange={(e) => updateSetting('platform_name', e.target.value)}
                    placeholder="FRSC Housing Platform"
                  />
              </div>
              <div>
                  <Label htmlFor="platform_domain">Platform Domain</Label>
                  <Input
                    id="platform_domain"
                    value={settings.platform_domain || ''}
                    onChange={(e) => updateSetting('platform_domain', e.target.value)}
                    placeholder="frschousing.com"
                  />
              </div>
              <div>
                  <Label htmlFor="support_email">Support Email</Label>
                  <Input
                    id="support_email"
                    type="email"
                    value={settings.support_email || ''}
                    onChange={(e) => updateSetting('support_email', e.target.value)}
                    placeholder="support@frschousing.com"
                  />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.timezone || 'Africa/Lagos'}
                    onValueChange={(value) => updateSetting('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Lagos">Africa/Lagos (WAT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable maintenance mode to restrict access</p>
                </div>
                <Switch
                  id="maintenance_mode"
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
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure SMTP settings for email delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input
                    id="smtp_host"
                    value={settings.smtp_host || ''}
                    onChange={(e) => updateSetting('smtp_host', e.target.value)}
                    placeholder="smtp.example.com"
                  />
              </div>
              <div>
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={settings.smtp_port || ''}
                    onChange={(e) => updateSetting('smtp_port', parseInt(e.target.value))}
                    placeholder="587"
                  />
              </div>
              <div>
                  <Label htmlFor="smtp_username">SMTP Username</Label>
                  <Input
                    id="smtp_username"
                    value={settings.smtp_username || ''}
                    onChange={(e) => updateSetting('smtp_username', e.target.value)}
                    placeholder="username@example.com"
                  />
              </div>
              <div>
                  <Label htmlFor="smtp_password">SMTP Password</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    value={settings.smtp_password || ''}
                    onChange={(e) => updateSetting('smtp_password', e.target.value)}
                    placeholder="••••••••"
                  />
              </div>
              <div>
                  <Label htmlFor="smtp_encryption">SMTP Encryption</Label>
                  <Select
                    value={settings.smtp_encryption || 'tls'}
                    onValueChange={(value) => updateSetting('smtp_encryption', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="tls">TLS</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
              <div>
                  <Label htmlFor="from_email">From Email</Label>
                  <Input
                    id="from_email"
                    type="email"
                    value={settings.from_email || ''}
                    onChange={(e) => updateSetting('from_email', e.target.value)}
                    placeholder="noreply@frschousing.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="from_name">From Name</Label>
                  <Input
                    id="from_name"
                    value={settings.from_name || ''}
                    onChange={(e) => updateSetting('from_name', e.target.value)}
                    placeholder="FRSC Housing Platform"
                  />
                </div>
              </div>

              {emailTestResult && (
                <Alert className={emailTestResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  {emailTestResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={emailTestResult.success ? "text-green-800" : "text-red-800"}>
                    {emailTestResult.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button onClick={testEmailSettings} disabled={testingEmail}>
                  <TestTube className="h-4 w-4 mr-2" />
                  {testingEmail ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure system notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: 'notify_new_business', label: 'New Business Registration', description: 'Notify when a new business registers' },
                { key: 'notify_subscription_expiring', label: 'Subscription Expiring', description: 'Notify when subscriptions are about to expire' },
                { key: 'notify_payment_failed', label: 'Payment Failed', description: 'Notify when a payment fails' },
                { key: 'notify_usage_limit', label: 'Usage Limit Reached', description: 'Notify when a business reaches usage limits' }
              ].map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                    <Label htmlFor={key}>{label}</Label>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                  <Switch
                    id={key}
                    checked={settings[key] || false}
                    onCheckedChange={(checked) => updateSetting(key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and access control</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="require_2fa">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Require 2FA for all super admins</p>
                </div>
                <Switch
                  id="require_2fa"
                  checked={settings.require_2fa || false}
                  onCheckedChange={(checked) => updateSetting('require_2fa', checked)}
                />
              </div>

                <div>
                <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session_timeout"
                  type="number"
                  value={settings.session_timeout || ''}
                  onChange={(e) => updateSetting('session_timeout', parseInt(e.target.value))}
                  placeholder="120"
                />
                <p className="text-sm text-muted-foreground mt-1">Auto logout after inactivity</p>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="ip_whitelist_enabled">IP Whitelist</Label>
                  <p className="text-sm text-muted-foreground">Restrict access to specific IP addresses</p>
                </div>
                <Switch
                  id="ip_whitelist_enabled"
                  checked={settings.ip_whitelist_enabled || false}
                  onCheckedChange={(checked) => updateSetting('ip_whitelist_enabled', checked)}
                />
              </div>

              {settings.ip_whitelist_enabled && (
                <div>
                  <Label htmlFor="allowed_ips">Allowed IP Addresses</Label>
                  <Textarea
                    id="allowed_ips"
                    value={Array.isArray(settings.allowed_ips) ? settings.allowed_ips.join('\n') : ''}
                    onChange={(e) => updateSetting('allowed_ips', e.target.value.split('\n').filter(ip => ip.trim()))}
                    placeholder="192.168.1.1&#10;10.0.0.1"
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Enter one IP address per line</p>
            </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Settings</CardTitle>
              <CardDescription>Configure database backup and optimization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="backup_frequency">Backup Frequency</Label>
                  <Select
                    value={settings.backup_frequency || 'daily'}
                    onValueChange={(value) => updateSetting('backup_frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="backup_retention_days">Backup Retention (days)</Label>
                  <Input
                    id="backup_retention_days"
                    type="number"
                    value={settings.backup_retention_days || ''}
                    onChange={(e) => updateSetting('backup_retention_days', parseInt(e.target.value))}
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                  <Label htmlFor="auto_optimize">Auto Optimize Database</Label>
                  <p className="text-sm text-muted-foreground">Automatically optimize database performance</p>
                </div>
                <Switch
                  id="auto_optimize"
                  checked={settings.auto_optimize || false}
                  onCheckedChange={(checked) => updateSetting('auto_optimize', checked)}
                />
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium">Database Status</p>
                    <p className="text-sm text-muted-foreground">Current database health</p>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    Connected
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Database Size</p>
                    <p className="text-2xl font-bold">2.4 GB</p>
              </div>
              <div>
                    <p className="text-sm text-muted-foreground">Total Records</p>
                    <p className="text-2xl font-bold">45,231</p>
                  </div>
              </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}