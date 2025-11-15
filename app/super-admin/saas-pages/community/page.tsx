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

interface Discussion {
  id: string
  question: string
  author_name: string
  author_role: string | null
  author_avatar_url: string | null
  responses_count: number
  likes_count: number
  views_count: number
  tags: string[]
  top_answer: Record<string, any> | null
  other_answers: Record<string, any>[]
  order_index: number
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function CommunityPage() {
  const { isLoading, data, error, loadData } = usePageLoading<{ discussions: Discussion[] }>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDiscussion, setEditingDiscussion] = useState<Discussion | null>(null)
  const [formData, setFormData] = useState({
    question: "",
    author_name: "",
    author_role: "",
    author_avatar_url: "",
    responses_count: 0,
    likes_count: 0,
    views_count: 0,
    tags: [] as string[],
    top_answer: null as Record<string, any> | null,
    other_answers: [] as Record<string, any>[],
    order_index: 0,
    is_featured: false,
    is_active: true,
  })

  useEffect(() => {
    loadData(async () => {
      const response = await apiFetch<{ success: boolean; discussions: Discussion[] }>(
        "/super-admin/saas-community"
      )
      return response
    })
  }, [loadData])

  const handleOpenDialog = (discussion?: Discussion) => {
    if (discussion) {
      setEditingDiscussion(discussion)
      setFormData({
        question: discussion.question,
        author_name: discussion.author_name,
        author_role: discussion.author_role || "",
        author_avatar_url: discussion.author_avatar_url || "",
        responses_count: discussion.responses_count,
        likes_count: discussion.likes_count,
        views_count: discussion.views_count,
        tags: discussion.tags || [],
        top_answer: discussion.top_answer,
        other_answers: discussion.other_answers || [],
        order_index: discussion.order_index,
        is_featured: discussion.is_featured,
        is_active: discussion.is_active,
      })
    } else {
      setEditingDiscussion(null)
      setFormData({
        question: "",
        author_name: "",
        author_role: "",
        author_avatar_url: "",
        responses_count: 0,
        likes_count: 0,
        views_count: 0,
        tags: [],
        top_answer: null,
        other_answers: [],
        order_index: 0,
        is_featured: false,
        is_active: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        tags: typeof formData.tags === "string" ? formData.tags.split(",").map((t) => t.trim()) : formData.tags,
      }

      if (editingDiscussion) {
        await apiFetch(`/super-admin/saas-community/${editingDiscussion.id}`, {
          method: "PUT",
          body: payload,
        })
        toast.success("Discussion updated successfully")
      } else {
        await apiFetch("/super-admin/saas-community", {
          method: "POST",
          body: payload,
        })
        toast.success("Discussion created successfully")
      }

      setIsDialogOpen(false)
      loadData(async () => {
        const response = await apiFetch<{ success: boolean; discussions: Discussion[] }>(
          "/super-admin/saas-community"
        )
        return response
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to save discussion")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this discussion?")) return

    try {
      await apiFetch(`/super-admin/saas-community/${id}`, {
        method: "DELETE",
      })
      toast.success("Discussion deleted successfully")
      loadData(async () => {
        const response = await apiFetch<{ success: boolean; discussions: Discussion[] }>(
          "/super-admin/saas-community"
        )
        return response
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to delete discussion")
    }
  }

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading || !data) return null

  const discussions = data?.discussions || []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community Discussions</h1>
          <p className="text-muted-foreground mt-2">Manage community Q&A discussions</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Discussion
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {discussions.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground col-span-full">
            No discussions found. Click "Add Discussion" to create one.
          </Card>
        ) : (
          discussions.map((discussion) => (
            <Card key={discussion.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {discussion.is_featured && (
                    <Badge className="mb-2 bg-yellow-500">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  <h3 className="font-semibold mb-2 line-clamp-2">{discussion.question}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    By {discussion.author_name}
                    {discussion.author_role && ` • ${discussion.author_role}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>{discussion.responses_count} responses</span>
                <span>{discussion.likes_count} likes</span>
                <span>{discussion.views_count} views</span>
              </div>

              {discussion.tags && discussion.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {discussion.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(discussion)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(discussion.id)}>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDiscussion ? "Edit Discussion" : "Create New Discussion"}</DialogTitle>
            <DialogDescription>Configure the discussion details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Enter the question"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="author_name">Author Name</Label>
                <Input
                  id="author_name"
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  placeholder="Author name"
                />
              </div>

              <div>
                <Label htmlFor="author_role">Author Role</Label>
                <Input
                  id="author_role"
                  value={formData.author_role}
                  onChange={(e) => setFormData({ ...formData, author_role: e.target.value })}
                  placeholder="e.g., Product Manager"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="author_avatar_url">Author Avatar URL</Label>
              <Input
                id="author_avatar_url"
                value={formData.author_avatar_url}
                onChange={(e) => setFormData({ ...formData, author_avatar_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="responses_count">Responses</Label>
                <Input
                  id="responses_count"
                  type="number"
                  value={formData.responses_count}
                  onChange={(e) => setFormData({ ...formData, responses_count: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="likes_count">Likes</Label>
                <Input
                  id="likes_count"
                  type="number"
                  value={formData.likes_count}
                  onChange={(e) => setFormData({ ...formData, likes_count: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="views_count">Views</Label>
                <Input
                  id="views_count"
                  type="number"
                  value={formData.views_count}
                  onChange={(e) => setFormData({ ...formData, views_count: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={Array.isArray(formData.tags) ? formData.tags.join(", ") : formData.tags}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tags: e.target.value.split(",").map((t) => t.trim()),
                  })
                }
                placeholder="tag1, tag2, tag3"
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
            <Button onClick={handleSave}>Save Discussion</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

