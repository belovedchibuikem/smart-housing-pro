"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { apiFetch } from "@/lib/api/client"

interface Permission {
  id: string
  name: string
  description?: string
  group?: string
  is_active: boolean
  sort_order: number
}

export default function EditPermissionPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const permissionId = params?.id
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Permission>>({
    name: "",
    description: "",
    group: "",
    is_active: true,
    sort_order: 0,
  })

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await apiFetch<{ permission: Permission }>(`/admin/permissions/${permissionId}`)
        const p = (data as any).permission || (data as any)
        setForm({
          name: p.name,
          description: p.description || "",
          group: p.group || "",
          is_active: !!(typeof p.is_active === 'boolean' ? p.is_active : Number(p.is_active)),
          sort_order: Number(p.sort_order || 0),
        })
      } catch (e: any) {
        setError(e.message || "Failed to load permission")
      } finally {
        setLoading(false)
      }
    }
    if (permissionId) load()
  }, [permissionId])

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!permissionId) return
    try {
      setSaving(true)
      setError(null)
      await apiFetch(`/admin/permissions/${permissionId}`, {
        method: "PUT",
        body: {
          name: form.name,
          description: form.description,
          group: form.group,
          is_active: form.is_active,
          sort_order: form.sort_order,
        },
      })
      router.push("/admin/permissions")
    } catch (e: any) {
      setError(e.message || "Failed to update permission")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Permission</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSave} className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">System Name</Label>
                <Input id="name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <p className="text-xs text-muted-foreground mt-1">snake_case, e.g., view_documents</p>
              </div>
              <div>
                <Label htmlFor="group">Group</Label>
                <Select value={form.group || ''} onValueChange={(v) => setForm({ ...form, group: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="members">Members</SelectItem>
                    <SelectItem value="properties">Properties</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="loans">Loans</SelectItem>
                    <SelectItem value="documents">Documents</SelectItem>
                    <SelectItem value="reports">Reports</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="roles">Roles</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input id="sort_order" type="number" value={Number(form.sort_order ?? 0)} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.is_active ? 'active' : 'inactive'} onValueChange={(v) => setForm({ ...form, is_active: v === 'active' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
              <Button type="button" variant="secondary" onClick={() => router.push('/admin/permissions')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


