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
import { getPropertyAllottee, updatePropertyAllottee } from "@/lib/api/client"
import { apiFetch } from "@/lib/api/client"

interface Member {
  id: string
  user: {
    first_name: string
    last_name: string
    email: string
  }
  member_id?: string
  staff_id?: string
}

interface Property {
  id: string
  title: string
  location: string
  type: string
}

export default function EditAllotteePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const allotteeId = params?.id as string

  useEffect(() => {
    setMounted(true)
  }, [])
  
  const [formData, setFormData] = useState({
    property_id: "",
    member_id: "",
    allocation_date: "",
    status: "pending",
    notes: "",
  })

  useEffect(() => {
    if (allotteeId) {
      fetchAllottee()
      fetchMembers()
      fetchProperties()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allotteeId])

  const fetchAllottee = async () => {
    try {
      setFetching(true)
      const response = await getPropertyAllottee(allotteeId)
      if (response.success && response.data) {
        const allottee = response.data
        setFormData({
          property_id: allottee.property?.id || "",
          member_id: allottee.member?.id || "",
          allocation_date: allottee.allocation_date ? allottee.allocation_date.split('T')[0] : "",
          status: allottee.status || "pending",
          notes: allottee.notes || "",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load allocation",
        variant: "destructive",
      })
    } finally {
      setFetching(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.property_id || !formData.member_id) {
      toast({
        title: "Validation Error",
        description: "Please select a property and member",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await updatePropertyAllottee(allotteeId, formData)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Property allocation updated successfully",
        })
        router.push("/admin/property-management/allottees")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update property allocation",
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
        <Link href="/admin/property-management/allottees">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Property Allocation</h1>
          <p className="text-muted-foreground mt-1">Update allocation details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Allocation Information</CardTitle>
            <CardDescription>Update the details for the property allocation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="member_id">
                  Member <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.member_id}
                  onValueChange={(value) => setFormData({ ...formData, member_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.user?.first_name} {member.user?.last_name} ({member.member_id || member.staff_id || '—'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="allocation_date">
                  Allocation Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="allocation_date"
                  type="date"
                  value={formData.allocation_date}
                  onChange={(e) => setFormData({ ...formData, allocation_date: e.target.value })}
                  required
                />
              </div>
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
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Enter any additional notes about this allocation..."
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/admin/property-management/allottees">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update Allocation
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

