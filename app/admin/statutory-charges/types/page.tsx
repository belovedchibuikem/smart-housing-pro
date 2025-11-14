"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getStatutoryChargeTypes, createStatutoryChargeType, updateStatutoryChargeType, deleteStatutoryChargeType } from "@/lib/api/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ChargeType {
  id: string
  type: string
  description?: string
  default_amount?: number | null
  frequency?: string
  frequency_display?: string
  is_active: boolean
  sort_order: number
  count: number
  total_amount: number
  created_at?: string
  updated_at?: string
}

export default function ChargeTypesPage() {
  const [types, setTypes] = useState<ChargeType[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedType, setSelectedType] = useState<ChargeType | null>(null)
  const [formData, setFormData] = useState({ type: "", description: "", default_amount: "", frequency: "annually", is_active: true, sort_order: 0 })
  const [editFormData, setEditFormData] = useState({ type: "", description: "", default_amount: "", frequency: "annually", is_active: true, sort_order: 0 })
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchTypes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchTypes = async () => {
    try {
      setLoading(true)
      const response = await getStatutoryChargeTypes()
      if (response.success) {
        setTypes(response.data || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch charge types",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setFormData({ type: "", description: "", default_amount: "", frequency: "annually", is_active: true, sort_order: 0 })
    setShowAddDialog(true)
  }

  const handleEdit = (type: ChargeType) => {
    setSelectedType(type)
    setEditFormData({
      type: type.type,
      description: type.description || "",
      default_amount: type.default_amount ? String(type.default_amount) : "",
      frequency: type.frequency || "annually",
      is_active: type.is_active,
      sort_order: type.sort_order,
    })
    setShowEditDialog(true)
  }

  const handleDelete = (type: ChargeType) => {
    setSelectedType(type)
    setShowDeleteDialog(true)
  }

  const handleSubmitAdd = async () => {
    if (!formData.type.trim()) {
      toast({
        title: "Validation Error",
        description: "Charge type is required",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        type: formData.type,
        description: formData.description || undefined,
        default_amount: formData.default_amount ? Number(formData.default_amount) : undefined,
        frequency: formData.frequency,
        is_active: formData.is_active,
        sort_order: formData.sort_order,
      }
      const response = await createStatutoryChargeType(payload)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Charge type created successfully",
        })
        setShowAddDialog(false)
        fetchTypes()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to create charge type",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitEdit = async () => {
    if (!selectedType || !editFormData.type.trim()) {
      toast({
        title: "Validation Error",
        description: "Charge type name is required",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        type: editFormData.type,
        description: editFormData.description || undefined,
        default_amount: editFormData.default_amount ? Number(editFormData.default_amount) : null,
        frequency: editFormData.frequency,
        is_active: editFormData.is_active,
        sort_order: editFormData.sort_order,
      }
      const response = await updateStatutoryChargeType(selectedType.id, payload)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Charge type updated successfully",
        })
        setShowEditDialog(false)
        setSelectedType(null)
        fetchTypes()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update charge type",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedType) return

    setSubmitting(true)
    try {
      const response = await deleteStatutoryChargeType(selectedType.id)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Charge type deleted successfully",
        })
        setShowDeleteDialog(false)
        setSelectedType(null)
        fetchTypes()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete charge type",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex-1 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manage Charge Types</h1>
            <p className="text-muted-foreground mt-1">Configure statutory charge types and default amounts</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Charge Type
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Charge Types</CardTitle>
                <CardDescription>All configured statutory charge types</CardDescription>
              </div>
              <div className="relative w-64">
                <Input
                  placeholder="Search charge types..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
                <svg
                  className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : types.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No charge types found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Charge Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Default Amount</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {types
                    .filter((type) => {
                      if (!searchQuery) return true
                      const query = searchQuery.toLowerCase()
                      return (
                        type.type.toLowerCase().includes(query) ||
                        type.description?.toLowerCase().includes(query) ||
                        type.frequency_display?.toLowerCase().includes(query)
                      )
                    })
                    .map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-medium">{type.type}</TableCell>
                      <TableCell className="text-muted-foreground">{type.description || "-"}</TableCell>
                      <TableCell className="font-semibold">
                        {type.default_amount ? `₦${Number(type.default_amount).toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell>{type.frequency_display || type.frequency || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={type.is_active ? 'default' : 'secondary'}>
                          {type.is_active ? 'active' : 'inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(type)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(type)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Charge Type</DialogTitle>
            <DialogDescription>
              Create a new charge type. It will be available when creating charges.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Charge Type <span className="text-red-500">*</span></Label>
              <Input
                id="type"
                placeholder="e.g., Service Charge, Maintenance Fee"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_amount">Default Amount</Label>
              <Input
                id="default_amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.default_amount}
                onChange={(e) => setFormData({ ...formData, default_amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="bi_annually">Bi-Annually</SelectItem>
                  <SelectItem value="annually">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                min="0"
                placeholder="0"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAdd} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Charge Type</DialogTitle>
            <DialogDescription>
              Update the charge type name. This will update all charges with this type.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit_type">Charge Type <span className="text-red-500">*</span></Label>
              <Input
                id="edit_type"
                placeholder="e.g., Service Charge, Maintenance Fee"
                value={editFormData.type}
                onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                placeholder="Optional description..."
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_default_amount">Default Amount</Label>
              <Input
                id="edit_default_amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={editFormData.default_amount}
                onChange={(e) => setEditFormData({ ...editFormData, default_amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_frequency">Frequency</Label>
              <Select
                value={editFormData.frequency}
                onValueChange={(value) => setEditFormData({ ...editFormData, frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="bi_annually">Bi-Annually</SelectItem>
                  <SelectItem value="annually">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_sort_order">Sort Order</Label>
              <Input
                id="edit_sort_order"
                type="number"
                min="0"
                placeholder="0"
                value={editFormData.sort_order}
                onChange={(e) => setEditFormData({ ...editFormData, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit_is_active"
                checked={editFormData.is_active}
                onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="edit_is_active" className="cursor-pointer">
                Active
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Charge Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedType?.type}"? This action can only be performed if there are no charges with this type.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={submitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
