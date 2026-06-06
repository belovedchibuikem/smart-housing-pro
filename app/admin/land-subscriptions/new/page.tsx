"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { apiFetch, createLandSubscription } from "@/lib/api/client"
import { Can } from "@/components/admin/can-permission"
import { SearchableSelect, membersToSearchableOptions } from "@/components/ui/searchable-select"
import { normalizeAdminMembersList } from "@/lib/api/normalize-admin-members"

interface Member {
  id: string
  user?: { first_name?: string; last_name?: string; email?: string }
  member_number?: string
  staff_id?: string
}

interface Land {
  id: string
  land_code?: string | null
  land_title?: string | null
  land_size?: string | null
  cost?: number | string | null
}

function landsToSearchableOptions(lands: Land[]) {
  return lands.map((land) => ({
    value: land.id,
    label: [land.land_title, land.land_code].filter(Boolean).join(" · ") || land.id,
    keywords: [land.land_code, land.land_title, land.land_size].filter(Boolean).join(" "),
  }))
}

export default function NewLandSubscriptionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [lands, setLands] = useState<Land[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const [formData, setFormData] = useState({
    member_id: searchParams.get("member_id") ?? "",
    land_id: searchParams.get("land_id") ?? "",
    allocated_land_size: "",
    allocation_total_cost: "",
    amount_paid: "",
    payment_description: "Initial subscription payment",
  })

  useEffect(() => {
    fetchMembers()
    fetchLands()
  }, [])

  const fetchMembers = async () => {
    try {
      const response = await apiFetch<{ success: boolean }>("/admin/members?per_page=1000")
      setMembers(normalizeAdminMembersList(response) as Member[])
    } catch {
      toast({ title: "Error", description: "Failed to load members", variant: "destructive" })
    } finally {
      setLoadingData(false)
    }
  }

  const fetchLands = async () => {
    try {
      const response = await apiFetch<{ success: boolean; data: Land[] }>("/admin/lands?per_page=1000")
      if (response.success) {
        setLands(response.data ?? [])
      }
    } catch {
      toast({ title: "Error", description: "Failed to load land parcels", variant: "destructive" })
    }
  }

  const memberOptions = useMemo(() => membersToSearchableOptions(members), [members])
  const landOptions = useMemo(() => landsToSearchableOptions(lands), [lands])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.member_id || !formData.land_id) {
      toast({
        title: "Validation Error",
        description: "Please select a member and land parcel",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const payload: Parameters<typeof createLandSubscription>[0] = {
        member_id: formData.member_id,
        land_id: formData.land_id,
      }
      if (formData.allocated_land_size) payload.allocated_land_size = formData.allocated_land_size
      if (formData.allocation_total_cost) payload.allocation_total_cost = Number(formData.allocation_total_cost)
      if (formData.amount_paid) payload.amount_paid = Number(formData.amount_paid)
      if (formData.payment_description) payload.payment_description = formData.payment_description

      const response = await createLandSubscription(payload)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Land assigned to member successfully",
        })
        router.push("/admin/lands")
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign land",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/lands">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Assign Land to Member</h1>
          <p className="text-muted-foreground mt-1">
            Post a land parcel to a member so they can view it on their dashboard
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
              <CardTitle>Land subscription</CardTitle>
              <CardDescription>
                Links the member to the land parcel. Optionally record an initial payment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
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
                  <Label>
                    Land parcel <span className="text-red-500">*</span>
                  </Label>
                  <SearchableSelect
                    value={formData.land_id}
                    onValueChange={(value) => setFormData({ ...formData, land_id: value })}
                    options={landOptions}
                    placeholder="Select a land parcel"
                    searchPlaceholder="Search by title or code…"
                    emptyText="No land parcels match your search."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="allocated_land_size">Allocated size</Label>
                  <Input
                    id="allocated_land_size"
                    placeholder="e.g. 500 sqm"
                    value={formData.allocated_land_size}
                    onChange={(e) => setFormData({ ...formData, allocated_land_size: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allocation_total_cost">Total cost (optional)</Label>
                  <Input
                    id="allocation_total_cost"
                    type="number"
                    min="0"
                    placeholder="e.g. 15000000"
                    value={formData.allocation_total_cost}
                    onChange={(e) => setFormData({ ...formData, allocation_total_cost: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount_paid">Amount paid (optional)</Label>
                  <Input
                    id="amount_paid"
                    type="number"
                    min="0"
                    placeholder="e.g. 500000"
                    value={formData.amount_paid}
                    onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_description">Payment description</Label>
                  <Input
                    id="payment_description"
                    value={formData.payment_description}
                    onChange={(e) => setFormData({ ...formData, payment_description: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Link href="/admin/lands">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Can permission="manage_property_allottees|approve_allotments|manage_payments">
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Assign Land
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
