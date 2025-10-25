"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Palette, Type, ImageIcon, Mail, FileText, Save, Upload, X, Code, LinkIcon, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface WhiteLabelSettings {
  id?: string
  tenant_id?: string
  company_name: string
  company_tagline: string
  company_description: string
  logo_url: string
  logo_dark_url: string
  favicon_url: string
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  heading_font: string
  body_font: string
  login_background_url: string
  dashboard_hero_url: string
  email_sender_name: string
  email_reply_to: string
  email_footer_text: string
  email_logo_url: string
  terms_url: string
  privacy_url: string
  support_email: string
  support_phone: string
  help_center_url: string
  footer_text: string
  footer_links: Array<{ label: string; url: string }>
  social_links: {
    facebook?: string
    twitter?: string
    linkedin?: string
    instagram?: string
  }
  enabled_modules: string[]
  custom_css: string
  is_active: boolean
}

const FONT_OPTIONS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Raleway",
  "Ubuntu",
  "Nunito",
  "Playfair Display",
  "Merriweather",
]

const MODULE_OPTIONS = [
  { value: "properties", label: "Properties" },
  { value: "loans", label: "Loans" },
  { value: "investments", label: "Investments" },
  { value: "contributions", label: "Contributions" },
  { value: "wallet", label: "Wallet" },
  { value: "mail_service", label: "Mail Service" },
  { value: "statutory_charges", label: "Statutory Charges" },
  { value: "blockchain", label: "Blockchain" },
]

export default function WhiteLabelPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<WhiteLabelSettings>({
    company_name: "",
    company_tagline: "",
    company_description: "",
    logo_url: "",
    logo_dark_url: "",
    favicon_url: "",
    primary_color: "#3b82f6",
    secondary_color: "#8b5cf6",
    accent_color: "#10b981",
    background_color: "#ffffff",
    text_color: "#1f2937",
    heading_font: "Inter",
    body_font: "Inter",
    login_background_url: "",
    dashboard_hero_url: "",
    email_sender_name: "",
    email_reply_to: "",
    email_footer_text: "",
    email_logo_url: "",
    terms_url: "",
    privacy_url: "",
    support_email: "",
    support_phone: "",
    help_center_url: "",
    footer_text: "",
    footer_links: [],
    social_links: {},
    enabled_modules: ["properties", "loans", "investments", "contributions", "wallet"],
    custom_css: "",
    is_active: true,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/white-label")
      const data = await response.json()
      if (data.settings) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error("[v0] Error fetching white label settings:", error)
      toast({
        title: "Error",
        description: "Failed to load white label settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/white-label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "White label settings saved successfully",
        })
        fetchSettings()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("[v0] Error saving white label settings:", error)
      toast({
        title: "Error",
        description: "Failed to save white label settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = (updates: Partial<WhiteLabelSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }

  const addFooterLink = () => {
    updateSettings({
      footer_links: [...settings.footer_links, { label: "", url: "" }],
    })
  }

  const removeFooterLink = (index: number) => {
    const links = [...settings.footer_links]
    links.splice(index, 1)
    updateSettings({ footer_links: links })
  }

  const updateFooterLink = (index: number, field: "label" | "url", value: string) => {
    const links = [...settings.footer_links]
    links[index] = { ...links[index], [field]: value }
    updateSettings({ footer_links: links })
  }

  const toggleModule = (module: string) => {
    const modules = settings.enabled_modules.includes(module)
      ? settings.enabled_modules.filter((m) => m !== module)
      : [...settings.enabled_modules, module]
    updateSettings({ enabled_modules: modules })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading white label settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">White Label Settings</h1>
          <p className="text-muted-foreground mt-2">Customize your platform branding and appearance</p>
        </div>
        <Badge variant={settings.is_active ? "default" : "secondary"}>
          {settings.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Changes to white label settings will be reflected across your entire platform. Preview changes before saving.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="branding">
            <ImageIcon className="h-4 w-4 mr-2" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography">
            <Type className="h-4 w-4 mr-2" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="content">
            <FileText className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Code className="h-4 w-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Basic information about your organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  placeholder="e.g., FRSC Housing Cooperative"
                  value={settings.company_name}
                  onChange={(e) => updateSettings({ company_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-tagline">Tagline</Label>
                <Input
                  id="company-tagline"
                  placeholder="e.g., Building Dreams Together"
                  value={settings.company_tagline}
                  onChange={(e) => updateSettings({ company_tagline: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-description">Description</Label>
                <Textarea
                  id="company-description"
                  placeholder="Brief description of your organization"
                  value={settings.company_description}
                  onChange={(e) => updateSettings({ company_description: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo & Brand Assets</CardTitle>
              <CardDescription>Upload your logos and brand images</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo-url">Logo URL (Light Mode)</Label>
                <div className="flex gap-2">
                  <Input
                    id="logo-url"
                    placeholder="https://example.com/logo.png"
                    value={settings.logo_url}
                    onChange={(e) => updateSettings({ logo_url: e.target.value })}
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                {settings.logo_url && (
                  <div className="mt-2 p-4 border rounded-lg bg-muted">
                    <img
                      src={settings.logo_url || "/placeholder.svg"}
                      alt="Logo preview"
                      className="h-12 object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo-dark-url">Logo URL (Dark Mode)</Label>
                <div className="flex gap-2">
                  <Input
                    id="logo-dark-url"
                    placeholder="https://example.com/logo-dark.png"
                    value={settings.logo_dark_url}
                    onChange={(e) => updateSettings({ logo_dark_url: e.target.value })}
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="favicon-url">Favicon URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="favicon-url"
                    placeholder="https://example.com/favicon.ico"
                    value={settings.favicon_url}
                    onChange={(e) => updateSettings({ favicon_url: e.target.value })}
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="login-bg-url">Login Page Background</Label>
                <div className="flex gap-2">
                  <Input
                    id="login-bg-url"
                    placeholder="https://example.com/login-bg.jpg"
                    value={settings.login_background_url}
                    onChange={(e) => updateSettings({ login_background_url: e.target.value })}
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dashboard-hero-url">Dashboard Hero Image</Label>
                <div className="flex gap-2">
                  <Input
                    id="dashboard-hero-url"
                    placeholder="https://example.com/dashboard-hero.jpg"
                    value={settings.dashboard_hero_url}
                    onChange={(e) => updateSettings({ dashboard_hero_url: e.target.value })}
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
              <CardDescription>Customize your platform's color palette</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={settings.primary_color}
                      onChange={(e) => updateSettings({ primary_color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={settings.primary_color}
                      onChange={(e) => updateSettings({ primary_color: e.target.value })}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={settings.secondary_color}
                      onChange={(e) => updateSettings({ secondary_color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={settings.secondary_color}
                      onChange={(e) => updateSettings({ secondary_color: e.target.value })}
                      placeholder="#8b5cf6"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accent-color"
                      type="color"
                      value={settings.accent_color}
                      onChange={(e) => updateSettings({ accent_color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={settings.accent_color}
                      onChange={(e) => updateSettings({ accent_color: e.target.value })}
                      placeholder="#10b981"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="background-color">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="background-color"
                      type="color"
                      value={settings.background_color}
                      onChange={(e) => updateSettings({ background_color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={settings.background_color}
                      onChange={(e) => updateSettings({ background_color: e.target.value })}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="text-color"
                      type="color"
                      value={settings.text_color}
                      onChange={(e) => updateSettings({ text_color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={settings.text_color}
                      onChange={(e) => updateSettings({ text_color: e.target.value })}
                      placeholder="#1f2937"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="p-4 border rounded-lg space-y-2">
                <p className="text-sm font-medium">Color Preview</p>
                <div className="flex gap-2">
                  <div
                    className="w-16 h-16 rounded-lg border"
                    style={{ backgroundColor: settings.primary_color }}
                    title="Primary"
                  />
                  <div
                    className="w-16 h-16 rounded-lg border"
                    style={{ backgroundColor: settings.secondary_color }}
                    title="Secondary"
                  />
                  <div
                    className="w-16 h-16 rounded-lg border"
                    style={{ backgroundColor: settings.accent_color }}
                    title="Accent"
                  />
                  <div
                    className="w-16 h-16 rounded-lg border"
                    style={{ backgroundColor: settings.background_color }}
                    title="Background"
                  />
                  <div
                    className="w-16 h-16 rounded-lg border"
                    style={{ backgroundColor: settings.text_color }}
                    title="Text"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Typography Settings</CardTitle>
              <CardDescription>Choose fonts for your platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="heading-font">Heading Font</Label>
                <Select
                  value={settings.heading_font}
                  onValueChange={(value) => updateSettings({ heading_font: value })}
                >
                  <SelectTrigger id="heading-font">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((font) => (
                      <SelectItem key={font} value={font}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="body-font">Body Font</Label>
                <Select value={settings.body_font} onValueChange={(value) => updateSettings({ body_font: value })}>
                  <SelectTrigger id="body-font">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((font) => (
                      <SelectItem key={font} value={font}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="p-4 border rounded-lg space-y-2">
                <p className="text-sm font-medium mb-4">Font Preview</p>
                <h1 className="text-3xl font-bold" style={{ fontFamily: settings.heading_font }}>
                  This is a heading
                </h1>
                <p className="text-base" style={{ fontFamily: settings.body_font }}>
                  This is body text. The quick brown fox jumps over the lazy dog.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Tab */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Branding</CardTitle>
              <CardDescription>Customize email templates and sender information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-sender-name">Sender Name</Label>
                <Input
                  id="email-sender-name"
                  placeholder="e.g., FRSC Housing Team"
                  value={settings.email_sender_name}
                  onChange={(e) => updateSettings({ email_sender_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-reply-to">Reply-To Email</Label>
                <Input
                  id="email-reply-to"
                  type="email"
                  placeholder="e.g., support@frschousing.com"
                  value={settings.email_reply_to}
                  onChange={(e) => updateSettings({ email_reply_to: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-logo-url">Email Logo URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="email-logo-url"
                    placeholder="https://example.com/email-logo.png"
                    value={settings.email_logo_url}
                    onChange={(e) => updateSettings({ email_logo_url: e.target.value })}
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-footer-text">Email Footer Text</Label>
                <Textarea
                  id="email-footer-text"
                  placeholder="Footer text for all emails"
                  value={settings.email_footer_text}
                  onChange={(e) => updateSettings({ email_footer_text: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Support & Legal</CardTitle>
              <CardDescription>Configure support information and legal document links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    placeholder="support@example.com"
                    value={settings.support_email}
                    onChange={(e) => updateSettings({ support_email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-phone">Support Phone</Label>
                  <Input
                    id="support-phone"
                    placeholder="+234 xxx xxx xxxx"
                    value={settings.support_phone}
                    onChange={(e) => updateSettings({ support_phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="help-center-url">Help Center URL</Label>
                  <Input
                    id="help-center-url"
                    placeholder="https://help.example.com"
                    value={settings.help_center_url}
                    onChange={(e) => updateSettings({ help_center_url: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="terms-url">Terms of Service URL</Label>
                  <Input
                    id="terms-url"
                    placeholder="https://example.com/terms"
                    value={settings.terms_url}
                    onChange={(e) => updateSettings({ terms_url: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privacy-url">Privacy Policy URL</Label>
                  <Input
                    id="privacy-url"
                    placeholder="https://example.com/privacy"
                    value={settings.privacy_url}
                    onChange={(e) => updateSettings({ privacy_url: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Footer Content</CardTitle>
              <CardDescription>Customize footer text and links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="footer-text">Footer Copyright Text</Label>
                <Input
                  id="footer-text"
                  placeholder="© 2025 Your Company. All rights reserved."
                  value={settings.footer_text}
                  onChange={(e) => updateSettings({ footer_text: e.target.value })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Footer Links</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addFooterLink}>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Add Link
                  </Button>
                </div>

                {settings.footer_links.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Label"
                      value={link.label}
                      onChange={(e) => updateFooterLink(index, "label", e.target.value)}
                    />
                    <Input
                      placeholder="URL"
                      value={link.url}
                      onChange={(e) => updateFooterLink(index, "url", e.target.value)}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeFooterLink(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Social Media Links</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      placeholder="https://facebook.com/yourpage"
                      value={settings.social_links.facebook || ""}
                      onChange={(e) =>
                        updateSettings({
                          social_links: { ...settings.social_links, facebook: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter/X</Label>
                    <Input
                      id="twitter"
                      placeholder="https://twitter.com/yourhandle"
                      value={settings.social_links.twitter || ""}
                      onChange={(e) =>
                        updateSettings({
                          social_links: { ...settings.social_links, twitter: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      placeholder="https://linkedin.com/company/yourcompany"
                      value={settings.social_links.linkedin || ""}
                      onChange={(e) =>
                        updateSettings({
                          social_links: { ...settings.social_links, linkedin: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      placeholder="https://instagram.com/yourhandle"
                      value={settings.social_links.instagram || ""}
                      onChange={(e) =>
                        updateSettings({
                          social_links: { ...settings.social_links, instagram: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Control</CardTitle>
              <CardDescription>Enable or disable platform modules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {MODULE_OPTIONS.map((module) => (
                <div key={module.value} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{module.label}</Label>
                    <p className="text-sm text-muted-foreground">
                      {settings.enabled_modules.includes(module.value) ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                  <Switch
                    checked={settings.enabled_modules.includes(module.value)}
                    onCheckedChange={() => toggleModule(module.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom CSS</CardTitle>
              <CardDescription>Add custom CSS for advanced styling (use with caution)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="/* Your custom CSS here */"
                value={settings.custom_css}
                onChange={(e) => updateSettings({ custom_css: e.target.value })}
                rows={10}
                className="font-mono text-sm"
              />
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Custom CSS can override platform styles. Test thoroughly before applying to production.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Status</CardTitle>
              <CardDescription>Control white label activation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Activate White Label</Label>
                  <p className="text-sm text-muted-foreground">Apply white label settings across the platform</p>
                </div>
                <Switch
                  checked={settings.is_active}
                  onCheckedChange={(checked) => updateSettings({ is_active: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={fetchSettings}>
          <X className="h-4 w-4 mr-2" />
          Reset Changes
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>
    </div>
  )
}
