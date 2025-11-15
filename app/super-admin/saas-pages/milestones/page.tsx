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

interface Milestone {
  id: string
  year: string
  event: string
  icon: string | null
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function MilestonesPage() {
  const { isLoading, data, error, loadData } = usePageLoading<{ milestones: Milestone[] }>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [formData, setFormData] = useState({
    year: "",
    event: "",
    icon: "",
    order_index: 0,
    is_active: true,
  })

  useEffect(() => {
    loadData(async () => {
      const response = await apiFetch<{ success: boolean; milestones: Milestone[] }>(
        "/super-admin/saas-milestones"
      )
      return response
    })
  }, [loadData])

  const handleOpenDialog = (milestone?: Milestone) => {
    if (milestone) {
      setEditingMilestone(milestone)
      setFormData({
        year: milestone.year,
        event: milestone.event,
        icon: milestone.icon || "",
        order_index: milestone.order_index,
        is_active: milestone.is_active,
      })
    } else {
      setEditingMilestone(null)
      setFormData({
        year: "",
        event: "",
        icon: "",
        order_index: 0,
        is_active: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingMilestone) {
        await apiFetch(`/super-admin/saas-milestones/${editingMilestone.id}`, {
          method: "PUT",
          body: formData,
        })
        toast.success("Milestone updated successfully")
      } else {
        await apiFetch("/super-admin/saas-milestones", {
          method: "POST",
          body: formData,
        })
        toast.success("Milestone created successfully")
      }

      setIsDialogOpen(false)
      loadData(async () => {
        const response = await apiFetch<{ success: boolean; milestones: Milestone[] }>(
          "/super-admin/saas-milestones"
        )
        return response
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to save milestone")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this milestone?")) return

    try {
      await apiFetch(`/super-admin/saas-milestones/${id}`, {
        method: "DELETE",
      })
      toast.success("Milestone deleted successfully")
      loadData(async () => {
        const response = await apiFetch<{ success: boolean; milestones: Milestone[] }>(
          "/super-admin/saas-milestones"
        )
        return response
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to delete milestone")
    }
  }

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading || !data) return null

  const milestones = data?.milestones || []
  const sortedMilestones = [...milestones].sort((a, b) => a.order_index - b.order_index)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Milestones</h1>
          <p className="text-muted-foreground mt-2">Manage company milestones and timeline</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      <div className="space-y-4">
        {sortedMilestones.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No milestones found. Click "Add Milestone" to create one.
          </Card>
        ) : (
          sortedMilestones.map((milestone, index) => (
            <Card key={milestone.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {milestone.icon ? (
                        <span className="text-2xl">{milestone.icon}</span>
                      ) : (
                        <span className="text-primary font-bold">{milestone.year}</span>
                      )}
                    </div>
                    {index < sortedMilestones.length - 1 && (
                      <div className="w-0.5 h-16 bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{milestone.year}</h3>
                      <span className="text-sm text-muted-foreground">Order: {milestone.order_index}</span>
                    </div>
                    <p className="text-muted-foreground">{milestone.event}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(milestone)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(milestone.id)}>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMilestone ? "Edit Milestone" : "Create New Milestone"}</DialogTitle>
            <DialogDescription>Configure the milestone details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="e.g., 2020"
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
            </div>

            <div>
              <Label htmlFor="event">Event Description</Label>
              <Textarea
                id="event"
                value={formData.event}
                onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                placeholder="Describe the milestone event"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="icon">Icon (emoji or icon name)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="🎉 or calendar"
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
            <Button onClick={handleSave}>Save Milestone</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

