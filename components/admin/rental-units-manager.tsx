"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch } from "@/lib/api/client"
import { Plus, Trash2 } from "lucide-react"

type RentalUnit = {
  id: string
  unit_number: string
  unit_label?: string | null
  rent_amount: number
  deposit_amount?: number | null
  lease_term_months?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  status: string
}

const emptyUnit = {
  unit_number: "",
  unit_label: "",
  rent_amount: "",
  deposit_amount: "",
  lease_term_months: "",
  bedrooms: "",
  bathrooms: "",
  status: "available",
}

export function RentalUnitsManager({ propertyId }: { propertyId: string }) {
  const [units, setUnits] = useState<RentalUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyUnit)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiFetch<{ success: boolean; data: RentalUnit[] }>(`/admin/properties/${propertyId}/rental-units`)
      setUnits(res.data || [])
    } catch {
      setUnits([])
    } finally {
      setLoading(false)
    }
  }, [propertyId])

  useEffect(() => {
    load()
  }, [load])

  async function addUnit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await apiFetch(`/admin/properties/${propertyId}/rental-units`, {
        method: "POST",
        body: {
        unit_number: form.unit_number,
        unit_label: form.unit_label || null,
        rent_amount: Number(form.rent_amount),
        deposit_amount: form.deposit_amount ? Number(form.deposit_amount) : null,
        lease_term_months: form.lease_term_months ? Number(form.lease_term_months) : null,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        status: form.status,
        },
      })
      setForm(emptyUnit)
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function removeUnit(unitId: string) {
    await apiFetch(`/admin/properties/${propertyId}/rental-units/${unitId}`, { method: "DELETE" })
    await load()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Rental units</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading units…</p>
        ) : units.length === 0 ? (
          <p className="text-sm text-muted-foreground">No rental units yet. Add units below when listing mode is rent.</p>
        ) : (
          <ul className="space-y-2">
            {units.map((u) => (
              <li key={u.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <div>
                  <span className="font-medium">Unit {u.unit_number}</span>
                  {u.unit_label && <span className="text-muted-foreground"> — {u.unit_label}</span>}
                  <div className="text-muted-foreground">
                    ₦{u.rent_amount.toLocaleString()}/mo · {u.status}
                    {u.bedrooms != null && ` · ${u.bedrooms} bed`}
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeUnit(u.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={addUnit} className="grid gap-3 border-t pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Unit number</Label>
              <Input required value={form.unit_number} onChange={(e) => setForm({ ...form, unit_number: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Label</Label>
              <Input value={form.unit_label} onChange={(e) => setForm({ ...form, unit_label: e.target.value })} placeholder="e.g. Ground floor" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Monthly rent (₦)</Label>
              <Input required type="number" min={0} value={form.rent_amount} onChange={(e) => setForm({ ...form, rent_amount: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Deposit (₦)</Label>
              <Input type="number" min={0} value={form.deposit_amount} onChange={(e) => setForm({ ...form, deposit_amount: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Lease (months)</Label>
              <Input type="number" min={1} value={form.lease_term_months} onChange={(e) => setForm({ ...form, lease_term_months: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Bedrooms</Label>
              <Input type="number" min={0} value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={saving} className="gap-2 w-fit">
            <Plus className="h-4 w-4" /> Add unit
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
