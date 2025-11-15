"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

interface PageSection {
  id: string
  page_type: string
  section_type: string
  section_key: string
  title: string | null
  subtitle: string | null
  content: Record<string, any>
  media: any[]
  order_index: number
  is_active: boolean
  is_published: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

const PAGE_TYPES = [
  { value: "home", label: "Home Page" },
  { value: "community", label: "Community Page" },
  { value: "about", label: "About Page" },
  { value: "header", label: "Header/Navigation" },
]

const SECTION_TYPES = [
  { value: "hero", label: "Hero Section" },
  { value: "stats", label: "Statistics" },
  { value: "features", label: "Features" },
  { value: "testimonials", label: "Testimonials" },
  { value: "cta", label: "Call to Action" },
  { value: "footer", label: "Footer" },
]

export default function SaasPagesPage() {
  const { isLoading, data, error, loadData } = usePageLoading<{ pages: Record<string, PageSection[]> }>()
  const [selectedPage, setSelectedPage] = useState<string>("home")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<PageSection | null>(null)
  const [formData, setFormData] = useState({
    page_type: "home",
    section_type: "hero",
    section_key: "",
    title: "",
    subtitle: "",
    content: {} as Record<string, any>,
    order_index: 0,
    is_active: true,
    is_published: false,
  })

  useEffect(() => {
    loadData(async () => {
      const response = await apiFetch<{ success: boolean; pages: Record<string, PageSection[]> }>(
        "/super-admin/saas-pages"
      )
      return response
    })
  }, [loadData])

  const handleOpenDialog = (section?: PageSection) => {
    if (section) {
      setEditingSection(section)
      setFormData({
        page_type: section.page_type,
        section_type: section.section_type,
        section_key: section.section_key,
        title: section.title || "",
        subtitle: section.subtitle || "",
        content: section.content || {},
        order_index: section.order_index,
        is_active: section.is_active,
        is_published: section.is_published,
      })
    } else {
      setEditingSection(null)
      setFormData({
        page_type: selectedPage,
        section_type: "hero",
        section_key: "",
        title: "",
        subtitle: "",
        content: {},
        order_index: 0,
        is_active: true,
        is_published: false,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        content: typeof formData.content === "string" ? JSON.parse(formData.content) : formData.content,
      }

      if (editingSection) {
        await apiFetch(`/super-admin/saas-pages/${editingSection.id}`, {
          method: "PUT",
          body: payload,
        })
        toast.success("Section updated successfully")
      } else {
        await apiFetch("/super-admin/saas-pages", {
          method: "POST",
          body: payload,
        })
        toast.success("Section created successfully")
      }

      setIsDialogOpen(false)
      loadData(async () => {
        const response = await apiFetch<{ success: boolean; pages: Record<string, PageSection[]> }>(
          "/super-admin/saas-pages"
        )
        return response
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to save section")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return

    try {
      await apiFetch(`/super-admin/saas-pages/${id}`, {
        method: "DELETE",
      })
      toast.success("Section deleted successfully")
      loadData(async () => {
        const response = await apiFetch<{ success: boolean; pages: Record<string, PageSection[]> }>(
          "/super-admin/saas-pages"
        )
        return response
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to delete section")
    }
  }

  const handleTogglePublish = async (section: PageSection) => {
    try {
      await apiFetch(`/super-admin/saas-pages/${section.id}/publish`, {
        method: "POST",
        body: {
          is_published: !section.is_published,
        },
      })
      toast.success(section.is_published ? "Section unpublished" : "Section published")
      loadData(async () => {
        const response = await apiFetch<{ success: boolean; pages: Record<string, PageSection[]> }>(
          "/super-admin/saas-pages"
        )
        return response
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to update publish status")
    }
  }

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading || !data) return null

  const pages = data?.pages || {}
  const currentPageSections = pages[selectedPage] || []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SaaS Landing Pages</h1>
          <p className="text-muted-foreground mt-2">Manage content for your SaaS landing pages</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>

      {/* Page Type Tabs */}
      <div className="flex gap-2 border-b">
        {PAGE_TYPES.map((page) => (
          <button
            key={page.value}
            onClick={() => setSelectedPage(page.value)}
            className={`px-4 py-2 font-medium transition-colors ${
              selectedPage === page.value
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {page.label}
          </button>
        ))}
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {currentPageSections.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No sections found for this page. Click "Add Section" to create one.
          </Card>
        ) : (
          currentPageSections.map((section) => (
            <Card key={section.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">{section.title || section.section_key}</h3>
                    <Badge variant="outline">{section.section_type}</Badge>
                    {section.is_published ? (
                      <Badge className="bg-green-500">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                    {!section.is_active && <Badge variant="destructive">Inactive</Badge>}
                  </div>
                  {section.subtitle && <p className="text-muted-foreground mb-2">{section.subtitle}</p>}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Order: {section.order_index}</span>
                    <span>Key: {section.section_key}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleTogglePublish(section)}
                    title={section.is_published ? "Unpublish" : "Publish"}
                  >
                    {section.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(section)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(section.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSection ? "Edit Section" : "Create New Section"}</DialogTitle>
            <DialogDescription>Configure the page section details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="page_type">Page Type</Label>
                <Select
                  value={formData.page_type}
                  onValueChange={(value) => setFormData({ ...formData, page_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_TYPES.map((page) => (
                      <SelectItem key={page.value} value={page.value}>
                        {page.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="section_type">Section Type</Label>
                <Select
                  value={formData.section_type}
                  onValueChange={(value) => setFormData({ ...formData, section_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="section_key">Section Key (unique identifier)</Label>
              <Input
                id="section_key"
                value={formData.section_key}
                onChange={(e) => setFormData({ ...formData, section_key: e.target.value })}
                placeholder="e.g., hero-main, features-grid"
              />
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Section title"
              />
            </div>

            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Section subtitle or description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="content">Content (JSON)</Label>
              <Textarea
                id="content"
                value={JSON.stringify(formData.content, null, 2)}
                onChange={(e) => {
                  try {
                    setFormData({ ...formData, content: JSON.parse(e.target.value) })
                  } catch {
                    // Invalid JSON, keep as string
                  }
                }}
                placeholder='{"key": "value"}'
                rows={6}
                className="font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="order_index">Order Index</Label>
                <Input
                  id="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked === true })}
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Active
                </Label>
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked === true })}
                />
                <Label htmlFor="is_published" className="cursor-pointer">
                  Published
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

