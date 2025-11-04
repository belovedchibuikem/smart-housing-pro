"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  type: string
  count: number
  total_amount: number
}

export default function ChargeTypesPage() {
  const [types, setTypes] = useState<ChargeType[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [formData, setFormData] = useState({ type: "", description: "" })
  const [newTypeName, setNewTypeName] = useState("")
  const [submitting, setSubmitting] = useState(false)
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
    setFormData({ type: "", description: "" })
    setShowAddDialog(true)
  }

  const handleEdit = (type: ChargeType) => {
    setSelectedType(type.type)
    setNewTypeName(type.type)
    setShowEditDialog(true)
  }

  const handleDelete = (type: ChargeType) => {
    setSelectedType(type.type)
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
      const response = await createStatutoryChargeType(formData)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Charge type will be available when used in a charge",
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
    if (!selectedType || !newTypeName.trim()) {
      toast({
        title: "Validation Error",
        description: "Charge type name is required",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await updateStatutoryChargeType(selectedType, { new_type: newTypeName })
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
      const response = await deleteStatutoryChargeType(selectedType)
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
            <p className="text-muted-foreground mt-1">View all statutory charge types and their statistics</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Charge Type
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Charge Types</CardTitle>
            <CardDescription>All statutory charge types and their usage statistics</CardDescription>
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
                    <TableHead>Total Charges</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {types.map((type, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{type.type}</TableCell>
                      <TableCell>{type.count}</TableCell>
                      <TableCell className="font-semibold">₦{type.total_amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={type.count > 0 ? 'default' : 'secondary'}>
                          {type.count > 0 ? 'Active' : 'Inactive'}
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
              <Label htmlFor="new_type">New Charge Type Name <span className="text-red-500">*</span></Label>
              <Input
                id="new_type"
                placeholder="Enter new type name"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
              />
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
              Are you sure you want to delete "{selectedType}"? This action can only be performed if there are no charges with this type.
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
