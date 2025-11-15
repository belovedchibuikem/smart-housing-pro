"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"
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

interface TeamMember {
  id: string
  name: string
  role: string
  bio: string | null
  avatar_url: string | null
  email: string | null
  linkedin_url: string | null
  twitter_url: string | null
  order_index: number
  is_active: boolean
}

export default function TeamPage() {
  const { isLoading, data, error, loadData } = usePageLoading<{ team_members: TeamMember[] }>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    bio: "",
    avatar_url: "",
    email: "",
    linkedin_url: "",
    twitter_url: "",
    order_index: 0,
    is_active: true,
  })

  useEffect(() => {
    loadData(async () => {
      const response = await apiFetch<{ success: boolean; team_members: TeamMember[] }>("/super-admin/saas-team")
      return response
    })
  }, [loadData])

  const handleOpenDialog = (member?: TeamMember) => {
    if (member) {
      setEditingMember(member)
      setFormData({
        name: member.name,
        role: member.role,
        bio: member.bio || "",
        avatar_url: member.avatar_url || "",
        email: member.email || "",
        linkedin_url: member.linkedin_url || "",
        twitter_url: member.twitter_url || "",
        order_index: member.order_index,
        is_active: member.is_active,
      })
    } else {
      setEditingMember(null)
      setFormData({
        name: "",
        role: "",
        bio: "",
        avatar_url: "",
        email: "",
        linkedin_url: "",
        twitter_url: "",
        order_index: 0,
        is_active: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingMember) {
        await apiFetch(`/super-admin/saas-team/${editingMember.id}`, {
          method: "PUT",
          body: formData,
        })
        toast.success("Team member updated successfully")
      } else {
        await apiFetch("/super-admin/saas-team", {
          method: "POST",
          body: formData,
        })
        toast.success("Team member created successfully")
      }

      setIsDialogOpen(false)
      loadData(async () => {
        const response = await apiFetch<{ success: boolean; team_members: TeamMember[] }>("/super-admin/saas-team")
        return response
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to save team member")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return

    try {
      await apiFetch(`/super-admin/saas-team/${id}`, {
        method: "DELETE",
      })
      toast.success("Team member deleted successfully")
      loadData(async () => {
        const response = await apiFetch<{ success: boolean; team_members: TeamMember[] }>("/super-admin/saas-team")
        return response
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to delete team member")
    }
  }

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading || !data) return null

  const members = data?.team_members || []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground mt-2">Manage team member profiles</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {members.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground col-span-full">
            No team members found. Click "Add Member" to create one.
          </Card>
        ) : (
          members.map((member) => (
            <Card key={member.id} className="p-6">
              <div className="text-center mb-4">
                {member.avatar_url && (
                  <img
                    src={member.avatar_url}
                    alt={member.name}
                    className="w-20 h-20 rounded-full mx-auto mb-3"
                  />
                )}
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
                {member.bio && <p className="text-sm mt-2 line-clamp-2">{member.bio}</p>}
              </div>

              <div className="flex items-center justify-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(member)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(member.id)}>
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
            <DialogTitle>{editingMember ? "Edit Team Member" : "Create New Team Member"}</DialogTitle>
            <DialogDescription>Configure the team member details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., CEO, CTO"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Short biography"
                rows={3}
              />
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/..."
                />
              </div>

              <div>
                <Label htmlFor="twitter_url">Twitter URL</Label>
                <Input
                  id="twitter_url"
                  value={formData.twitter_url}
                  onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                  placeholder="https://twitter.com/..."
                />
              </div>
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

