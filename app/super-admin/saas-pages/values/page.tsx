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

interface Value {
  id: string
  title: string
  description: string
  icon: string | null
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function ValuesPage() {
  const { isLoading, data, error, loadData } = usePageLoading<{ values: Value[] }>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingValue, setEditingValue] = useState<Value | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "",
    order_index: 0,
    is_active: true,
  })

  useEffect(() => {
    loadData(async () => {
      const response = await apiFetch<{ success: boolean; values: Value[] }>("/super-admin/saas-values")
      return response
    })
  }, [loadData])

  const handleOpenDialog = (value?: Value) => {
    if (value) {
      setEditingValue(value)
      setFormData({
        title: value.title,
        description: value.description,
        icon: value.icon || "",
        order_index: value.order_index,
        is_active: value.is_active,
      })
    } else {
      setEditingValue(null)
      setFormData({
        title: "",
        description: "",
        icon: "",
        order_index: 0,
        is_active: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingValue) {
        await apiFetch(`/super-admin/saas-values/${editingValue.id}`, {
          method: "PUT",
          body: formData,
        })
        toast.success("Value updated successfully")
      } else {
        await apiFetch("/super-admin/saas-values", {
          method: "POST",
          body: formData,
        })
        toast.success("Value created successfully")
      }

      setIsDialogOpen(false)
      loadData(async () => {
        const response = await apiFetch<{ success: boolean; values: Value[] }>("/super-admin/saas-values")
        return response
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to save value")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this value?")) return

    try {
      await apiFetch(`/super-admin/saas-values/${id}`, {
        method: "DELETE",
      })
      toast.success("Value deleted successfully")
      loadData(async () => {
        const response = await apiFetch<{ success: boolean; values: Value[] }>("/super-admin/saas-values")
        return response
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to delete value")
    }
  }

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading || !data) return null

  const values = data?.values || []
  const sortedValues = [...values].sort((a, b) => a.order_index - b.order_index)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Company Values</h1>
          <p className="text-muted-foreground mt-2">Manage company core values</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Value
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedValues.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground col-span-full">
            No values found. Click "Add Value" to create one.
          </Card>
        ) : (
          sortedValues.map((value) => (
            <Card key={value.id} className="p-6">
              <div className="text-center mb-4">
                {value.icon && (
                  <div className="text-4xl mb-3 flex items-center justify-center">
                    {value.icon}
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>

              <div className="flex items-center justify-center gap-2 mt-4">
                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(value)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(value.id)}>
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
            <DialogTitle>{editingValue ? "Edit Value" : "Create New Value"}</DialogTitle>
            <DialogDescription>Configure the company value details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Innovation, Integrity"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the value"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="icon">Icon (emoji or icon name)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="💡 or lightbulb"
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
            <Button onClick={handleSave}>Save Value</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

