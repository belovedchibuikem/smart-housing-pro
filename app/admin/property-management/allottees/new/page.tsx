"use client"

import { useState, useEffect, useMemo } from "react"
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
import { createPropertyAllottee } from "@/lib/api/client"
import { apiFetch } from "@/lib/api/client"
import { Can } from "@/components/admin/can-permission"
import { SearchableSelect, membersToSearchableOptions, propertiesToSearchableOptions } from "@/components/ui/searchable-select"
import { normalizeAdminMembersList } from "@/lib/api/normalize-admin-members"
import { getPropertyTypeLabel } from "@/lib/properties/property-type-label"

interface Member {
  id: string
  user?: {
    first_name?: string
    last_name?: string
    email?: string
  }
  member_number?: string
  member_id?: string
  staff_id?: string
}

interface PropertyOption {
  id: string
  title: string
  location?: string
  type?: string
  property_type?: string
  type_label?: string
  price?: number
  total_slots?: number | null
  slots_available?: number | null
}

export default function NewAllotteePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [properties, setProperties] = useState<PropertyOption[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const [formData, setFormData] = useState({
    property_id: "",
    member_id: "",
    allocation_date: "",
    status: "completed",
    slots_assigned: "1",
    unit_address: "",
    notes: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined" && !formData.allocation_date) {
      setFormData((prev) => ({ ...prev, allocation_date: new Date().toISOString().split("T")[0] }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchMembers()
    fetchProperties()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchMembers = async () => {
    try {
      const response = await apiFetch<{ success: boolean }>("/admin/members?per_page=1000")
      setMembers(normalizeAdminMembersList(response) as Member[])
    } catch {
      toast({
        title: "Error",
        description: "Failed to load members",
        variant: "destructive",
      })
    } finally {
      setLoadingData(false)
    }
  }

  const fetchProperties = async () => {
    try {
      const response = await apiFetch<{ success: boolean; data: PropertyOption[] }>("/admin/properties?per_page=1000")
      if (response.success) {
        const houses = (response.data || []).filter((property) => property.type !== "land")
        setProperties(houses)
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive",
      })
    }
  }

  const selectedProperty = useMemo(
    () => properties.find((property) => property.id === formData.property_id) ?? null,
    [properties, formData.property_id]
  )

  const maxAssignableSlots = useMemo(() => {
    if (!selectedProperty) return 1
    if (selectedProperty.total_slots == null) return 99
    return Math.max(1, selectedProperty.slots_available ?? selectedProperty.total_slots ?? 1)
  }, [selectedProperty])

  const slotOptions = useMemo(() => {
    const count = Math.min(maxAssignableSlots, 20)
    return Array.from({ length: count }, (_, index) => index + 1)
  }, [maxAssignableSlots])

  const memberOptions = useMemo(() => membersToSearchableOptions(members), [members])
  const propertyOptions = useMemo(
    () =>
      propertiesToSearchableOptions(
        properties.map((property) => ({
          ...property,
          type_label: property.type_label || getPropertyTypeLabel(property),
        }))
      ),
    [properties]
  )

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

    const slotsAssigned = Math.max(1, parseInt(formData.slots_assigned, 10) || 1)
    if (selectedProperty?.total_slots != null && slotsAssigned > maxAssignableSlots) {
      toast({
        title: "Validation Error",
        description: `Only ${maxAssignableSlots} slot(s) available on this property.`,
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await createPropertyAllottee({
        ...formData,
        slots_assigned: slotsAssigned,
      })
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Property allocation created successfully",
        })
        router.push("/admin/property-management/allottees")
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create property allocation",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-3xl font-bold">Assign House to Member</h1>
          <p className="text-muted-foreground mt-1">
            Post a house or building to a member so they can view it on their dashboard
          </p>
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
              <CardTitle>Allocation Information</CardTitle>
              <CardDescription>Creates an approved subscription and completed allocation for the member</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="member_id">
                    Member <span className="text-red-500">*</span>
                  </Label>
                  <SearchableSelect
                    value={formData.member_id}
                    onValueChange={(value) => setFormData({ ...formData, member_id: value })}
                    options={memberOptions}
                    placeholder="Select a member"
                    searchPlaceholder="Search by name, number, email…"
                    emptyText="No members match your search."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property_id">
                    Property <span className="text-red-500">*</span>
                  </Label>
                  <SearchableSelect
                    value={formData.property_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, property_id: value, slots_assigned: "1" })
                    }
                    options={propertyOptions}
                    placeholder="Select a property"
                    searchPlaceholder="Search by title, type, location, price…"
                    emptyText="No properties match your search."
                  />
                  {selectedProperty ? (
                    <p className="text-xs text-muted-foreground">
                      {getPropertyTypeLabel(selectedProperty)} · ₦
                      {Number(selectedProperty.price ?? 0).toLocaleString()}
                      {selectedProperty.total_slots != null
                        ? ` · ${selectedProperty.slots_available ?? 0} of ${selectedProperty.total_slots} slots free`
                        : " · Unlimited slots"}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slots_assigned">
                    Slots to assign <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.slots_assigned}
                    onValueChange={(value) => setFormData({ ...formData, slots_assigned: value })}
                  >
                    <SelectTrigger id="slots_assigned">
                      <SelectValue placeholder="Select slots" />
                    </SelectTrigger>
                    <SelectContent>
                      {slotOptions.map((slot) => (
                        <SelectItem key={slot} value={String(slot)}>
                          {slot} slot{slot === 1 ? "" : "s"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Each slot is one unit subscription on this listing.
                  </p>
                </div>
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
                      <SelectItem value="completed">Completed (member can view)</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending (not visible to member)</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_address">House / block address</Label>
                <Input
                  id="unit_address"
                  placeholder="e.g. C17A, Jagua Crescent, 3rd Avenue"
                  value={formData.unit_address}
                  onChange={(e) => setFormData({ ...formData, unit_address: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Optional. Shown to the member instead of the general property location once subscribed.
                </p>
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
                <Can permission="manage_property_allottees|approve_allotments">
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Assign Property
                  </Button>
                </Can>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  )
}
