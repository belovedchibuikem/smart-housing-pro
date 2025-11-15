"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Star } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

interface Testimonial {
  id: string
  name: string
  role: string
  content: string
  rating: number
  avatar_url: string | null
  company: string | null
  order_index: number
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function TestimonialsPage() {
  const { isLoading, data, error, loadData } = usePageLoading<{ testimonials: Testimonial[] }>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    content: "",
    rating: 5,
    avatar_url: "",
    company: "",
    order_index: 0,
    is_featured: false,
    is_active: true,
  })

  useEffect(() => {
    loadData(async () => {
      const response = await apiFetch<{ success: boolean; testimonials: Testimonial[] }>(
        "/super-admin/saas-testimonials"
      )
      return response
    })
  }, [loadData])

  const handleOpenDialog = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingTestimonial(testimonial)
      setFormData({
        name: testimonial.name,
        role: testimonial.role,
        content: testimonial.content,
        rating: testimonial.rating,
        avatar_url: testimonial.avatar_url || "",
        company: testimonial.company || "",
        order_index: testimonial.order_index,
        is_featured: testimonial.is_featured,
        is_active: testimonial.is_active,
      })
    } else {
      setEditingTestimonial(null)
      setFormData({
        name: "",
        role: "",
        content: "",
        rating: 5,
        avatar_url: "",
        company: "",
        order_index: 0,
        is_featured: false,
        is_active: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingTestimonial) {
        await apiFetch(`/super-admin/saas-testimonials/${editingTestimonial.id}`, {
          method: "PUT",
          body: formData,
        })
        toast.success("Testimonial updated successfully")
      } else {
        await apiFetch("/super-admin/saas-testimonials", {
          method: "POST",
          body: formData,
        })
        toast.success("Testimonial created successfully")
      }

      setIsDialogOpen(false)
      loadData(async () => {
        const response = await apiFetch<{ success: boolean; testimonials: Testimonial[] }>(
          "/super-admin/saas-testimonials"
        )
        return response
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to save testimonial")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return

    try {
      await apiFetch(`/super-admin/saas-testimonials/${id}`, {
        method: "DELETE",
      })
      toast.success("Testimonial deleted successfully")
      loadData(async () => {
        const response = await apiFetch<{ success: boolean; testimonials: Testimonial[] }>(
          "/super-admin/saas-testimonials"
        )
        return response
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to delete testimonial")
    }
  }

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading || !data) return null

  const testimonials = data?.testimonials || []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground mt-2">Manage customer testimonials</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground col-span-full">
            No testimonials found. Click "Add Testimonial" to create one.
          </Card>
        ) : (
          testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {testimonial.is_featured && (
                    <Badge className="mb-2 bg-yellow-500">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{testimonial.content}</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                      {testimonial.company && ` • ${testimonial.company}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(testimonial)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(testimonial.id)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTestimonial ? "Edit Testimonial" : "Create New Testimonial"}</DialogTitle>
            <DialogDescription>Configure the testimonial details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Customer name"
                />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., CEO, Manager"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="content">Testimonial Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter the testimonial text"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 5 })}
                />
              </div>

              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Company name (optional)"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="order_index">Order Index</Label>
              <Input
                id="order_index"
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked === true })}
                />
                <Label htmlFor="is_featured" className="cursor-pointer">
                  Featured
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked === true })}
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Active
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Testimonial</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

