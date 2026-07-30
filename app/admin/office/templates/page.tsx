"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { getOfficeTemplates, getOfficeWorkflows, updateOfficeTemplate } from "@/lib/api/office"
import { Loader2 } from "lucide-react"

export default function OfficeTemplatesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<any[]>([])
  const [workflows, setWorkflows] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const [t, w] = await Promise.all([getOfficeTemplates(), getOfficeWorkflows()])
      setTemplates(t.data || [])
      setWorkflows(w.data || [])
    } catch (e: any) {
      toast({ title: "Failed to load templates", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const save = async () => {
    if (!editing) return
    try {
      setSaving(true)
      await updateOfficeTemplate(editing.id, {
        name: editing.name,
        subject: editing.subject,
        body_html: editing.body_html,
        workflow_id: editing.workflow_id || null,
        is_active: editing.is_active,
      })
      toast({ title: "Template updated" })
      setEditing(null)
      await load()
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Office Templates</h1>
        <p className="text-muted-foreground">Reusable document bodies with merge fields and workflow binding.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((t) => (
            <Card key={t.id}>
              <CardHeader>
                <CardTitle className="text-base">{t.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Type: {t.document_type} · Workflow: {t.workflow?.name || "—"} ·{" "}
                  {t.is_active ? "Active" : "Inactive"}
                </p>
                <p className="line-clamp-2">{t.subject}</p>
                <Button size="sm" variant="outline" onClick={() => setEditing({ ...t })}>
                  Edit
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Edit: {editing.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={editing.name || ""}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              placeholder="Name"
            />
            <Input
              value={editing.subject || ""}
              onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
              placeholder="Subject"
            />
            <Textarea
              rows={8}
              value={editing.body_html || ""}
              onChange={(e) => setEditing({ ...editing, body_html: e.target.value })}
            />
            <select
              className="h-10 w-full rounded-md border px-3 text-sm"
              value={editing.workflow_id || ""}
              onChange={(e) => setEditing({ ...editing, workflow_id: e.target.value })}
            >
              <option value="">No workflow</option>
              {workflows.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!editing.is_active}
                onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
              />
              Active
            </label>
            <div className="flex gap-2">
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
