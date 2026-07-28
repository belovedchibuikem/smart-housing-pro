"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
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
import {
  getPropertyAllottee,
  updatePropertyAllottee,
  getAdminPropertySlots,
  type AssetSlotSummary,
} from "@/lib/api/client"
import { apiFetch } from "@/lib/api/client"
import { Can } from "@/components/admin/can-permission"
import { normalizeAdminMembersList } from "@/lib/api/normalize-admin-members"
import {
  SearchableSelect,
  membersToSearchableOptions,
  propertiesToSearchableOptions,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select"
import { getPropertyTypeLabel } from "@/lib/properties/property-type-label"

interface Member {
  id: string
  user?: {
    first_name?: string
    last_name?: string
    email?: string
  }
  first_name?: string
  last_name?: string
  email?: string
  member_number?: string
  member_id?: string
  staff_id?: string
  ippis_number?: string
  frsc_pin?: string
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

export default function EditAllotteePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [properties, setProperties] = useState<PropertyOption[]>([])
  const [slots, setSlots] = useState<AssetSlotSummary[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const allotteeId = params?.id as string
  const originalPropertyId = useRef<string>("")
  const originalSlotId = useRef<string>("")

  const [formData, setFormData] = useState({
    property_id: "",
    member_id: "",
    property_slot_id: "",
    allocation_date: "",
    status: "pending",
    unit_address: "",
    notes: "",
    sale_price: "",
    amount_paid: "",
  })

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

  const selectableSlots = useMemo(() => {
    return slots.filter(
      (slot) =>
        slot.status === "available" ||
        slot.id === formData.property_slot_id ||
        slot.id === originalSlotId.current ||
        slot.current_allocation_id === allotteeId
    )
  }, [slots, formData.property_slot_id, allotteeId])

  const selectedProperty = useMemo(
    () => properties.find((property) => property.id === formData.property_id) ?? null,
    [properties, formData.property_id]
  )

  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.id === formData.property_slot_id) ?? null,
    [slots, formData.property_slot_id]
  )

  const propertyChanged =
    !!formData.property_id &&
    !!originalPropertyId.current &&
    formData.property_id !== originalPropertyId.current

  const searchMembers = useCallback(async (query: string): Promise<SearchableSelectOption[]> => {
    const res = await apiFetch<{ success?: boolean }>(
      `/admin/members?search=${encodeURIComponent(query)}&per_page=50`
    )
    const rows = normalizeAdminMembersList(res) as Member[]
    setMembers((prev) => {
      const byId = new Map(prev.map((m) => [m.id, m]))
      for (const m of rows) byId.set(m.id, m)
      return Array.from(byId.values())
    })
    return membersToSearchableOptions(rows)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (allotteeId) {
      void fetchAllottee()
      void fetchMembers()
      void fetchProperties()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allotteeId])

  useEffect(() => {
    if (!formData.property_id) {
      setSlots([])
      return
    }

    let cancelled = false
    const loadSlots = async () => {
      setLoadingSlots(true)
      try {
        const response = await getAdminPropertySlots(formData.property_id)
        if (!cancelled && response.success) {
          setSlots(response.data.slots ?? [])
        }
      } catch {
        if (!cancelled) {
          setSlots([])
          toast({
            title: "Error",
            description: "Failed to load property slots",
            variant: "destructive",
          })
        }
      } finally {
        if (!cancelled) setLoadingSlots(false)
      }
    }

    void loadSlots()
    return () => {
      cancelled = true
    }
  }, [formData.property_id, toast])

  const fetchAllottee = async () => {
    try {
      setFetching(true)
      const response = await getPropertyAllottee(allotteeId)
      if (response.success && response.data) {
        const allottee = response.data
        const propertyId = allottee.property?.id || ""
        const slotId = allottee.property_slot_id || ""
        originalPropertyId.current = propertyId
        originalSlotId.current = slotId

        const currentMember = allottee.member as Member | undefined
        if (currentMember?.id) {
          setMembers((prev) => {
            if (prev.some((m) => m.id === currentMember.id)) return prev
            return [currentMember, ...prev]
          })
        }

        setFormData({
          property_id: propertyId,
          member_id: allottee.member?.id || "",
          property_slot_id: slotId,
          allocation_date: allottee.allocation_date ? allottee.allocation_date.split("T")[0] : "",
          status: allottee.status || "pending",
          unit_address: allottee.unit_address || "",
          notes: allottee.notes || "",
          sale_price: allottee.sale_price != null ? String(allottee.sale_price) : "",
          amount_paid: allottee.amount_paid != null ? String(allottee.amount_paid) : "",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to load allocation",
          variant: "destructive",
        })
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load allocation",
        variant: "destructive",
      })
    } finally {
      setFetching(false)
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await apiFetch<{ success: boolean }>("/admin/members?per_page=50")
      setMembers((prev) => {
        const rows = normalizeAdminMembersList(response) as Member[]
        const byId = new Map(prev.map((m) => [m.id, m]))
        for (const m of rows) byId.set(m.id, m)
        return Array.from(byId.values())
      })
    } catch (error) {
      console.error("Failed to load members", error)
    }
  }

  const fetchProperties = async () => {
    try {
      const response = await apiFetch<{ success: boolean; data: PropertyOption[] }>(
        "/admin/properties?per_page=1000"
      )
      if (response.success) {
        const houses = (response.data || []).filter((property) => property.type !== "land")
        setProperties(houses)
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

    if (!formData.allocation_date) {
      toast({
        title: "Validation Error",
        description: "Please set an allocation date",
        variant: "destructive",
      })
      return
    }

    if (propertyChanged && !loadingSlots && selectableSlots.length === 0) {
      toast({
        title: "No free slots",
        description: "The destination property has no available slots. Free a slot or pick another property.",
        variant: "destructive",
      })
      return
    }

    if (propertyChanged && !formData.property_slot_id) {
      toast({
        title: "Slot required",
        description: "Select a free slot on the new property before updating.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const payload: Record<string, unknown> = {
        property_id: formData.property_id,
        member_id: formData.member_id,
        allocation_date: formData.allocation_date,
        status: formData.status,
        unit_address: formData.unit_address || undefined,
        notes: formData.notes || undefined,
        carry_payments: true,
      }

      if (formData.property_slot_id) {
        payload.property_slot_id = formData.property_slot_id
      }

      if (formData.sale_price.trim() !== "") {
        payload.sale_price = Number(formData.sale_price)
      }
      if (formData.amount_paid.trim() !== "") {
        payload.amount_paid = Number(formData.amount_paid)
      }

      const response = await updatePropertyAllottee(allotteeId, payload)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Property allocation updated successfully",
        })
        const newId = response.data?.id
        if (newId && newId !== allotteeId) {
          router.push(`/admin/property-management/allottees/${newId}/edit`)
        } else {
          router.push("/admin/property-management/allottees")
        }
      } else {
        toast({
          title: "Update failed",
          description: response.message || "Failed to update property allocation",
          variant: "destructive",
        })
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update property allocation",
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
          <p className="text-muted-foreground mt-1">
            Update member, property, slot, or tenure details
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Allocation Information</CardTitle>
            <CardDescription>
              Changing property (e.g. 2 Bedroom → 3 Bedroom) creates a new tenure and preserves the
              previous ownership history. Payments can be carried across.
            </CardDescription>
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
                  onSearch={searchMembers}
                  placeholder="Select a member"
                  searchPlaceholder="Search by name, email, member no, staff ID, or IPPIS…"
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
                    setFormData({
                      ...formData,
                      property_id: value,
                      property_slot_id: value === originalPropertyId.current ? originalSlotId.current : "",
                      unit_address:
                        value === originalPropertyId.current ? formData.unit_address : "",
                    })
                  }
                  options={propertyOptions}
                  placeholder="Select a property"
                  searchPlaceholder="Search by title, type, or location…"
                  emptyText="No properties match your search."
                />
                {selectedProperty ? (
                  <p className="text-xs text-muted-foreground">
                    {getPropertyTypeLabel(selectedProperty)} · ₦
                    {Number(selectedProperty.price ?? 0).toLocaleString()}
                    {selectedProperty.total_slots != null
                      ? ` · ${selectedProperty.slots_available ?? 0} of ${selectedProperty.total_slots} slots free`
                      : " · Unlimited slots"}
                    {propertyChanged ? " · Moving to a new property" : ""}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property_slot_id">
                  Slot {propertyChanged ? <span className="text-red-500">*</span> : null}
                </Label>
                <Select
                  value={formData.property_slot_id || undefined}
                  onValueChange={(value) => {
                    const slot = slots.find((item) => item.id === value)
                    setFormData({
                      ...formData,
                      property_slot_id: value,
                      unit_address:
                        formData.unit_address && !propertyChanged
                          ? formData.unit_address
                          : slot?.label || formData.unit_address,
                    })
                  }}
                  disabled={!formData.property_id || loadingSlots || selectableSlots.length === 0}
                >
                  <SelectTrigger id="property_slot_id">
                    <SelectValue
                      placeholder={
                        loadingSlots
                          ? "Loading slots…"
                          : !formData.property_id
                            ? "Select a property first"
                            : selectableSlots.length === 0
                              ? "No free slots"
                              : "Select a slot"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {selectableSlots.map((slot) => (
                      <SelectItem key={slot.id} value={slot.id}>
                        {slot.label}
                        {slot.slot_number ? ` (#${slot.slot_number})` : ""}
                        {slot.id === originalSlotId.current &&
                        formData.property_id === originalPropertyId.current
                          ? " · current"
                          : slot.status === "available"
                            ? " · free"
                            : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {propertyChanged
                    ? "Pick a free slot on the destination property."
                    : "You can move this allottee to another free slot on the same property."}
                  {selectedSlot ? ` Selected: ${selectedSlot.label}.` : ""}
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="deallocated">Deallocated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sale_price">Sale price</Label>
                <Input
                  id="sale_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.sale_price}
                  onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  {propertyChanged
                    ? "When moving property, paid amounts are carried by default unless you change them here for a member reassignment."
                    : "Used when reallocating to a different member."}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount_paid">Amount paid</Label>
                <Input
                  id="amount_paid"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount_paid}
                  onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
                />
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
                  {propertyChanged ? "Move & Update Allocation" : "Update Allocation"}
                </Button>
              </Can>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
