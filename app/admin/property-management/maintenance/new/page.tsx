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
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { createPropertyMaintenance } from "@/lib/api/client"
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

export default function NewMaintenancePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loadingData, setLoadingData] = useState(true)
  
  const [formData, setFormData] = useState({
    property_id: "",
    reported_by: "",
    issue_type: "",
    priority: "medium",
    description: "",
    status: "pending",
    assigned_to: "",
    estimated_cost: "",
    reported_date: "",
  })

  useEffect(() => {
    // Set default date only on client side to avoid hydration mismatch
    if (typeof window !== 'undefined' && !formData.reported_date) {
      setFormData(prev => ({ ...prev, reported_date: new Date().toISOString().split('T')[0] }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchProperties()
    fetchMembers()
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchProperties = async () => {
    try {
      const response = await apiFetch<{ success: boolean; data: any[] }>("/admin/properties?per_page=1000")
      if (response.success) {
        setProperties(response.data || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive",
      })
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
    } finally {
      setLoadingData(false)
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
        ...formData,
        property_id: formData.property_id,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        reported_date: formData.reported_date,
      }

      if (formData.reported_by) submitData.reported_by = formData.reported_by
      if (formData.issue_type) submitData.issue_type = formData.issue_type
      if (formData.assigned_to) submitData.assigned_to = formData.assigned_to
      if (formData.estimated_cost) submitData.estimated_cost = parseFloat(formData.estimated_cost)

      const response = await createPropertyMaintenance(submitData)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Maintenance record created successfully",
        })
        router.push("/admin/property-management/maintenance")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to create maintenance record",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-3xl font-bold">Create New Maintenance Request</h1>
          <p className="text-muted-foreground mt-1">Report a new maintenance issue</p>
        </div>
      </div>

      {loadingData ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Request Information</CardTitle>
              <CardDescription>Enter the details of the maintenance request</CardDescription>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="flex justify-end gap-4">
                <Link href="/admin/property-management/maintenance">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Maintenance Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  )
}

