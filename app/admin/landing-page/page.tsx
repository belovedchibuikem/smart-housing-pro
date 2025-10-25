"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Settings, Layout, Palette, Save, Globe, Plus, GripVertical, Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface PageSection {
  id: string
  type: "hero" | "features" | "testimonials" | "cta" | "properties" | "investments" | "loans" | "stats" | "how-it-works"
  name: string
  visible: boolean
  position: number
  config: Record<string, any>
}

interface LandingPageData {
  id?: string
  is_published: boolean
  sections: PageSection[]
  theme: {
    primary_color: string
    secondary_color: string
    accent_color: string
    font_family: string
  }
  seo: {
    title: string
    description: string
    keywords: string
  }
}

const SECTION_TYPES = [
  { value: "hero", label: "Hero Section", icon: "🎯" },
  { value: "features", label: "Features", icon: "⭐" },
  { value: "properties", label: "Properties", icon: "🏠" },
  { value: "investments", label: "Investments", icon: "📈" },
  { value: "loans", label: "Loans", icon: "💰" },
  { value: "stats", label: "Statistics", icon: "📊" },
  { value: "testimonials", label: "Testimonials", icon: "💬" },
  { value: "how-it-works", label: "How It Works", icon: "🔄" },
  { value: "cta", label: "Call to Action", icon: "📢" },
]

export default function LandingPageBuilderPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageData, setPageData] = useState<LandingPageData>({
    is_published: false,
    sections: [],
    theme: {
      primary_color: "#FDB11E",
      secondary_color: "#276254",
      accent_color: "#10b981",
      font_family: "Inter",
    },
    seo: {
      title: "FRSC Housing Management System",
      description: "Your trusted partner in housing solutions",
      keywords: "housing, cooperative, FRSC, properties, loans",
    },
  })
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [draggedSection, setDraggedSection] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  useEffect(() => {
    fetchPageData()
  }, [])

  const fetchPageData = async () => {
    try {
      const response = await fetch("/api/admin/landing-page")
      const data = await response.json()
      if (data.page) {
        setPageData(data.page)
      }
    } catch (error) {
      console.error("[v0] Error fetching landing page data:", error)
      toast({
        title: "Error",
        description: "Failed to load landing page data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/landing-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Landing page saved successfully",
        })
        fetchPageData()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("[v0] Error saving landing page:", error)
      toast({
        title: "Error",
        description: "Failed to save landing page",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    const newPublishState = !pageData.is_published
    setPageData((prev) => ({ ...prev, is_published: newPublishState }))

    try {
      const response = await fetch("/api/admin/landing-page/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: newPublishState }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: newPublishState ? "Landing page published" : "Landing page unpublished",
        })
      }
    } catch (error) {
      console.error("[v0] Error publishing landing page:", error)
      toast({
        title: "Error",
        description: "Failed to update publish status",
        variant: "destructive",
      })
      setPageData((prev) => ({ ...prev, is_published: !newPublishState }))
    }
  }

  const addSection = (type: string) => {
    const newSection: PageSection = {
      id: `section-${Date.now()}`,
      type: type as any,
      name: SECTION_TYPES.find((t) => t.value === type)?.label || type,
      visible: true,
      position: pageData.sections.length,
      config: getDefaultConfig(type),
    }
    setPageData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }))
  }

  const getDefaultConfig = (type: string): Record<string, any> => {
    switch (type) {
      case "hero":
        return {
          title: "Your Path to Homeownership Made Simple",
          subtitle: "Join the FRSC Housing Cooperative",
          cta_text: "Get Started",
          cta_link: "/register",
          show_stats: true,
        }
      case "features":
        return {
          title: "Everything You Need",
          subtitle: "Comprehensive tools for your housing journey",
          features: [
            { icon: "Users", title: "Membership Management", description: "Easy registration with KYC verification" },
            { icon: "Wallet", title: "Digital Wallet", description: "Automated monthly contributions" },
            { icon: "TrendingUp", title: "Loan & Mortgage", description: "Access affordable housing loans" },
          ],
        }
      case "cta":
        return {
          title: "Ready to Start Your Journey?",
          description: "Join thousands of FRSC personnel building their future",
          cta_text: "Register Now",
          cta_link: "/register",
        }
      default:
        return {}
    }
  }

  const removeSection = (id: string) => {
    setPageData((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== id).map((s, idx) => ({ ...s, position: idx })),
    }))
  }

  const toggleSectionVisibility = (id: string) => {
    setPageData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)),
    }))
  }

  const updateSectionConfig = (id: string, config: Record<string, any>) => {
    setPageData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, config: { ...s.config, ...config } } : s)),
    }))
  }

  const handleDragStart = (id: string) => {
    setDraggedSection(id)
  }

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedSection || draggedSection === targetId) return

    const sections = [...pageData.sections]
    const draggedIdx = sections.findIndex((s) => s.id === draggedSection)
    const targetIdx = sections.findIndex((s) => s.id === targetId)

    const [removed] = sections.splice(draggedIdx, 1)
    sections.splice(targetIdx, 0, removed)

    setPageData((prev) => ({
      ...prev,
      sections: sections.map((s, idx) => ({ ...s, position: idx })),
    }))
  }

  const handleDragEnd = () => {
    setDraggedSection(null)
  }

  const activeSecData = pageData.sections.find((s) => s.id === activeSection)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading page builder...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Landing Page Builder</h1>
          <p className="text-muted-foreground mt-1">Customize your business landing page</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/" target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant={pageData.is_published ? "secondary" : "default"} onClick={handlePublish}>
            <Globe className="h-4 w-4 mr-2" />
            {pageData.is_published ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sections" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sections">
            <Layout className="h-4 w-4 mr-2" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="theme">
            <Palette className="h-4 w-4 mr-2" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Settings className="h-4 w-4 mr-2" />
            SEO
          </TabsTrigger>
        </TabsList>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Page Sections</h3>
                <p className="text-sm text-muted-foreground mt-1">Drag to reorder, click to edit content</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Section</DialogTitle>
                    <DialogDescription>Choose a section type to add to your landing page</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {SECTION_TYPES.map((type) => (
                      <Button
                        key={type.value}
                        variant="outline"
                        className="h-auto py-4 flex flex-col items-center gap-2 bg-transparent"
                        onClick={() => {
                          addSection(type.value)
                          toast({ title: "Section added", description: `${type.label} section added successfully` })
                        }}
                      >
                        <span className="text-2xl">{type.icon}</span>
                        <span className="text-sm">{type.label}</span>
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {pageData.sections.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sections added yet. Click "Add Section" to get started.</p>
                </div>
              ) : (
                pageData.sections.map((section) => (
                  <Card
                    key={section.id}
                    className={`p-4 cursor-move hover:border-primary transition-colors ${
                      !section.visible ? "opacity-50" : ""
                    }`}
                    draggable
                    onDragStart={() => handleDragStart(section.id)}
                    onDragOver={(e) => handleDragOver(e, section.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                          <span>{SECTION_TYPES.find((t) => t.value === section.type)?.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-medium">{section.name}</h4>
                          <p className="text-sm text-muted-foreground">{section.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={section.visible} onCheckedChange={() => toggleSectionVisibility(section.id)} />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveSection(section.id)
                            setEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => removeSection(section.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>

          {/* Section Editor Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit {activeSecData?.name}</DialogTitle>
                <DialogDescription>Customize the content and settings for this section</DialogDescription>
              </DialogHeader>
              {activeSecData && (
                <div className="space-y-4 mt-4">
                  {activeSecData.type === "hero" && (
                    <>
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={activeSecData.config.title || ""}
                          onChange={(e) => updateSectionConfig(activeSecData.id, { title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Subtitle</Label>
                        <Textarea
                          value={activeSecData.config.subtitle || ""}
                          onChange={(e) => updateSectionConfig(activeSecData.id, { subtitle: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>CTA Button Text</Label>
                          <Input
                            value={activeSecData.config.cta_text || ""}
                            onChange={(e) => updateSectionConfig(activeSecData.id, { cta_text: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>CTA Link</Label>
                          <Input
                            value={activeSecData.config.cta_link || ""}
                            onChange={(e) => updateSectionConfig(activeSecData.id, { cta_link: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Show Statistics</Label>
                        <Switch
                          checked={activeSecData.config.show_stats || false}
                          onCheckedChange={(checked) => updateSectionConfig(activeSecData.id, { show_stats: checked })}
                        />
                      </div>
                    </>
                  )}
                  {activeSecData.type === "cta" && (
                    <>
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={activeSecData.config.title || ""}
                          onChange={(e) => updateSectionConfig(activeSecData.id, { title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={activeSecData.config.description || ""}
                          onChange={(e) => updateSectionConfig(activeSecData.id, { description: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Button Text</Label>
                          <Input
                            value={activeSecData.config.cta_text || ""}
                            onChange={(e) => updateSectionConfig(activeSecData.id, { cta_text: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Button Link</Label>
                          <Input
                            value={activeSecData.config.cta_link || ""}
                            onChange={(e) => updateSectionConfig(activeSecData.id, { cta_link: e.target.value })}
                          />
                        </div>
                      </div>
                    </>
                  )}
                  {activeSecData.type === "features" && (
                    <>
                      <div className="space-y-2">
                        <Label>Section Title</Label>
                        <Input
                          value={activeSecData.config.title || ""}
                          onChange={(e) => updateSectionConfig(activeSecData.id, { title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Section Subtitle</Label>
                        <Input
                          value={activeSecData.config.subtitle || ""}
                          onChange={(e) => updateSectionConfig(activeSecData.id, { subtitle: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Theme Tab */}
        <TabsContent value="theme" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Theme Customization</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="mb-2 block">Primary Color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="color"
                    value={pageData.theme.primary_color}
                    onChange={(e) =>
                      setPageData((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, primary_color: e.target.value },
                      }))
                    }
                    className="h-10 w-20 rounded border cursor-pointer"
                  />
                  <Input
                    value={pageData.theme.primary_color}
                    onChange={(e) =>
                      setPageData((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, primary_color: e.target.value },
                      }))
                    }
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Secondary Color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="color"
                    value={pageData.theme.secondary_color}
                    onChange={(e) =>
                      setPageData((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, secondary_color: e.target.value },
                      }))
                    }
                    className="h-10 w-20 rounded border cursor-pointer"
                  />
                  <Input
                    value={pageData.theme.secondary_color}
                    onChange={(e) =>
                      setPageData((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, secondary_color: e.target.value },
                      }))
                    }
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Accent Color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="color"
                    value={pageData.theme.accent_color}
                    onChange={(e) =>
                      setPageData((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, accent_color: e.target.value },
                      }))
                    }
                    className="h-10 w-20 rounded border cursor-pointer"
                  />
                  <Input
                    value={pageData.theme.accent_color}
                    onChange={(e) =>
                      setPageData((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, accent_color: e.target.value },
                      }))
                    }
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Font Family</Label>
                <Select
                  value={pageData.theme.font_family}
                  onValueChange={(value) =>
                    setPageData((prev) => ({
                      ...prev,
                      theme: { ...prev.theme, font_family: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Lato">Lato</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Page Title</Label>
                <Input
                  value={pageData.seo.title}
                  onChange={(e) =>
                    setPageData((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, title: e.target.value },
                    }))
                  }
                  placeholder="Enter page title"
                />
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea
                  value={pageData.seo.description}
                  onChange={(e) =>
                    setPageData((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, description: e.target.value },
                    }))
                  }
                  rows={3}
                  placeholder="Enter meta description for SEO"
                />
              </div>
              <div className="space-y-2">
                <Label>Keywords</Label>
                <Input
                  value={pageData.seo.keywords}
                  onChange={(e) =>
                    setPageData((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, keywords: e.target.value },
                    }))
                  }
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
