"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createOfficeOrgUnit, getOfficeOrgUnits, getOfficeStaffUsers } from "@/lib/api/office"
import { Loader2 } from "lucide-react"

export default function OfficeOrgUnitsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [units, setUnits] = useState<any[]>([])
  const [staff, setStaff] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [form, setForm] = useState({ name: "", code: "", head_user_id: "", description: "" })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const [res, users] = await Promise.all([getOfficeOrgUnits(), getOfficeStaffUsers()])
      setUnits(res.data || [])
      setStaff(users.data || [])
    } catch (e: any) {
      toast({ title: "Failed to load org units", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    if (!form.name || !form.code) {
      toast({ title: "Name and code are required", variant: "destructive" })
      return
    }
    try {
      setSaving(true)
      await createOfficeOrgUnit({
        name: form.name,
        code: form.code,
        head_user_id: form.head_user_id || undefined,
        description: form.description || undefined,
      })
      toast({ title: "Org unit created" })
      setForm({ name: "", code: "", head_user_id: "", description: "" })
      await load()
    } catch (e: any) {
      toast({ title: "Create failed", description: e.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Organizational Units</h1>
        <p className="text-muted-foreground">Departments used for document ownership and workflow routing.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add org unit</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Code</Label>
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Head of unit</Label>
            <select
              className="h-10 w-full rounded-md border px-3 text-sm"
              value={form.head_user_id}
              onChange={(e) => setForm({ ...form, head_user_id: e.target.value })}
            >
              <option value="">— Optional —</option>
              {staff.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Button onClick={create} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Name</th>
                <th className="p-3">Head</th>
                <th className="p-3">Members</th>
                <th className="p-3">Active</th>
              </tr>
            </thead>
            <tbody>
              {units.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3 font-medium">{u.code}</td>
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.head?.name || "—"}</td>
                  <td className="p-3">{u.memberships?.length ?? 0}</td>
                  <td className="p-3">{u.is_active ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
