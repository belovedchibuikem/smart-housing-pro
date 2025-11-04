"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getPropertyMaintenanceById, updatePropertyMaintenance } from "@/lib/api/client"
import { apiFetch } from "@/lib/api/client"

interface Property {
  id: string
  title: string
  location: string
}

interface Member {
  id: string
  user: {
    first_name: string
    last_name: string
  }
  member_id?: string
  staff_id?: string
}

interface User {
  id: string
  first_name: string
  last_name: string
}

export default function EditMaintenancePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [users, setUsers] = useState<User[]>([])
  const maintenanceId = params?.id as string

  useEffect(() => {
    setMounted(true)
  }, [])
  
  const [formData, setFormData] = useState({
    property_id: "",
    reported_by: "",
    issue_type: "",
    priority: "medium",
    description: "",
    status: "pending",
    assigned_to: "",
    estimated_cost: "",
    actual_cost: "",
    reported_date: "",
    started_date: "",
    completed_date: "",
    resolution_notes: "",
  })

  useEffect(() => {
    if (maintenanceId) {
      fetchMaintenance()
      fetchProperties()
      fetchMembers()
      fetchUsers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maintenanceId])

  const fetchMaintenance = async () => {
    try {
      setFetching(true)
      const response = await getPropertyMaintenanceById(maintenanceId)
      if (response.success && response.data) {
        const record = response.data
        setFormData({
          property_id: record.property?.id || "",
          reported_by: record.reported_by?.id || "",
          issue_type: record.issue_type || "",
          priority: record.priority || "medium",
          description: record.description || "",
          status: record.status || "pending",
          assigned_to: record.assigned_to?.id || "",
          estimated_cost: record.estimated_cost?.toString() || "",
          actual_cost: record.actual_cost?.toString() || "",
          reported_date: record.reported_date ? record.reported_date.split('T')[0] : "",
          started_date: record.started_date ? record.started_date.split('T')[0] : "",
          completed_date: record.completed_date ? record.completed_date.split('T')[0] : "",
          resolution_notes: record.resolution_notes || "",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load maintenance record",
        variant: "destructive",
      })
    } finally {
      setFetching(false)
    }
  }

  const fetchProperties = async () => {
    try {
      const response = await apiFetch<{ success: boolean; data: any[] }>("/admin/properties?per_page=1000")
      if (response.success) {
        setProperties(response.data || [])
      }
    } catch (error) {
      console.error("Failed to load properties", error)
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await apiFetch<{ success: boolean; data: any[] }>("/admin/members?per_page=1000")
      if (response.success) {
        setMembers(response.data || [])
      }
    } catch (error) {
      console.error("Failed to load members", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await apiFetch<{ success: boolean; data: any[] }>("/admin/users?per_page=1000")
      if (response.success) {
        setUsers(response.data || [])
      }
    } catch (error) {
      console.error("Failed to load users", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.property_id || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const submitData: any = {
        property_id: formData.property_id,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
      }

      if (formData.reported_by) submitData.reported_by = formData.reported_by
      if (formData.issue_type) submitData.issue_type = formData.issue_type
      if (formData.assigned_to) submitData.assigned_to = formData.assigned_to
      if (formData.estimated_cost) submitData.estimated_cost = parseFloat(formData.estimated_cost)
      if (formData.actual_cost) submitData.actual_cost = parseFloat(formData.actual_cost)
      if (formData.reported_date) submitData.reported_date = formData.reported_date
      if (formData.started_date) submitData.started_date = formData.started_date
      if (formData.completed_date) submitData.completed_date = formData.completed_date
      if (formData.resolution_notes) submitData.resolution_notes = formData.resolution_notes

      const response = await updatePropertyMaintenance(maintenanceId, submitData)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Maintenance record updated successfully",
        })
        router.push("/admin/property-management/maintenance")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update maintenance record",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || fetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/property-management/maintenance">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Maintenance Request</h1>
          <p className="text-muted-foreground mt-1">Update maintenance record details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Request Information</CardTitle>
            <CardDescription>Update the details of the maintenance request</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property_id">
                  Property <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.property_id}
                  onValueChange={(value) => setFormData({ ...formData, property_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.title} - {property.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reported_by">Reported By (Member)</Label>
                <Select
                  value={formData.reported_by}
                  onValueChange={(value) => setFormData({ ...formData, reported_by: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select member (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.user?.first_name} {member.user?.last_name} ({member.member_id || member.staff_id || '—'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issue_type">Issue Type</Label>
                <Input
                  id="issue_type"
                  placeholder="e.g., Plumbing, Electrical, Structural"
                  value={formData.issue_type}
                  onChange={(e) => setFormData({ ...formData, issue_type: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">
                  Priority <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the maintenance issue in detail..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assigned_to">Assigned To</Label>
                <Select
                  value={formData.assigned_to}
                  onValueChange={(value) => setFormData({ ...formData, assigned_to: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.first_name} {user.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reported_date">Reported Date</Label>
                <Input
                  id="reported_date"
                  type="date"
                  value={formData.reported_date}
                  onChange={(e) => setFormData({ ...formData, reported_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="started_date">Started Date</Label>
                <Input
                  id="started_date"
                  type="date"
                  value={formData.started_date}
                  onChange={(e) => setFormData({ ...formData, started_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="completed_date">Completed Date</Label>
                <Input
                  id="completed_date"
                  type="date"
                  value={formData.completed_date}
                  onChange={(e) => setFormData({ ...formData, completed_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated_cost">Estimated Cost (₦)</Label>
                <Input
                  id="estimated_cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.estimated_cost}
                  onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actual_cost">Actual Cost (₦)</Label>
                <Input
                  id="actual_cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.actual_cost}
                  onChange={(e) => setFormData({ ...formData, actual_cost: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resolution_notes">Resolution Notes</Label>
              <Textarea
                id="resolution_notes"
                placeholder="Enter resolution details..."
                rows={4}
                value={formData.resolution_notes}
                onChange={(e) => setFormData({ ...formData, resolution_notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/admin/property-management/maintenance">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update Maintenance Record
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

