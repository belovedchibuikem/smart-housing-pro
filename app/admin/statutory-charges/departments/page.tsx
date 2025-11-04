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
import { getStatutoryChargeDepartments, createStatutoryChargeDepartment, updateStatutoryChargeDepartment, deleteStatutoryChargeDepartment } from "@/lib/api/client"
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

interface Department {
  id: string
  name: string
  charge_count: number
  total_allocated: number
  total_collected: number
  collection_rate: number
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "" })
  const [newDepartmentName, setNewDepartmentName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchDepartments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const response = await getStatutoryChargeDepartments()
      if (response.success) {
        setDepartments(response.data || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch departments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setFormData({ name: "", description: "" })
    setShowAddDialog(true)
  }

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department)
    setNewDepartmentName(department.name)
    setShowEditDialog(true)
  }

  const handleDelete = (department: Department) => {
    setSelectedDepartment(department)
    setShowDeleteDialog(true)
  }

  const handleSubmitAdd = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Department name is required",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await createStatutoryChargeDepartment(formData)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Department will be available when charges are created with this type",
        })
        setShowAddDialog(false)
        fetchDepartments()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to create department",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitEdit = async () => {
    if (!selectedDepartment || !newDepartmentName.trim()) {
      toast({
        title: "Validation Error",
        description: "Department name is required",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await updateStatutoryChargeDepartment(selectedDepartment.id, { name: newDepartmentName })
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Department updated successfully",
        })
        setShowEditDialog(false)
        setSelectedDepartment(null)
        fetchDepartments()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update department",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedDepartment) return

    setSubmitting(true)
    try {
      const response = await deleteStatutoryChargeDepartment(selectedDepartment.id)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Department deleted successfully",
        })
        setShowDeleteDialog(false)
        setSelectedDepartment(null)
        fetchDepartments()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete department",
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
            <h1 className="text-3xl font-bold">Department Allocation</h1>
            <p className="text-muted-foreground mt-1">View charge allocation and collection by department</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Allocation
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Departments</CardTitle>
            <CardDescription>Charge allocation and collection statistics by department</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : departments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No departments found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Total Charges</TableHead>
                    <TableHead>Total Allocated</TableHead>
                    <TableHead>Total Collected</TableHead>
                    <TableHead>Collection Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell>{dept.charge_count}</TableCell>
                      <TableCell className="font-semibold">₦{dept.total_allocated.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold">₦{dept.total_collected.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={dept.collection_rate >= 80 ? 'default' : dept.collection_rate >= 50 ? 'secondary' : 'destructive'}>
                          {dept.collection_rate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(dept)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(dept)}>
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
            <DialogTitle>Add Department Allocation</DialogTitle>
            <DialogDescription>
              Create a new department. Charges with this type will be allocated to this department.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Department Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                placeholder="e.g., Finance, Operations"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update the department name. This will update all charges with this department type.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new_name">Department Name <span className="text-red-500">*</span></Label>
              <Input
                id="new_name"
                placeholder="Enter department name"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
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
            <AlertDialogTitle>Delete Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedDepartment?.name}"? This action can only be performed if there are no charges with this department.
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
