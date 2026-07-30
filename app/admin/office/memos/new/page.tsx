"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  createOfficeDocument,
  getOfficeCategories,
  getOfficeOrgUnits,
  getOfficeTemplates,
  getOfficeWorkflows,
  submitOfficeDocument,
} from "@/lib/api/office"
import { Loader2 } from "lucide-react"

export default function NewInternalMemoPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])
  const [orgUnits, setOrgUnits] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [workflows, setWorkflows] = useState<any[]>([])
  const [form, setForm] = useState({
    subject: "",
    to_name: "",
    body: "",
    owning_org_unit_id: "",
    category_id: "",
    template_id: "",
    workflow_id: "",
    member_id: "",
    submit_now: true,
  })

  useEffect(() => {
    ;(async () => {
      try {
        const [t, o, c, w] = await Promise.all([
          getOfficeTemplates(),
          getOfficeOrgUnits(),
          getOfficeCategories(),
          getOfficeWorkflows(),
        ])
        setTemplates(t.data || [])
        setOrgUnits(o.data || [])
        setCategories(c.data || [])
        setWorkflows(w.data || [])
        const memoTpl = (t.data || []).find((x: any) => x.document_type === "internal_memo")
        const memoCat = (c.data || []).find((x: any) => x.slug === "internal-memos")
        const defaultWf = (w.data || []).find((x: any) => x.is_default) || (w.data || [])[0]
        setForm((f) => ({
          ...f,
          template_id: memoTpl?.id || "",
          category_id: memoCat?.id || "",
          workflow_id: memoTpl?.workflow_id || defaultWf?.id || "",
        }))
      } catch (e: any) {
        toast({ title: "Failed to load form data", description: e.message, variant: "destructive" })
      }
    })()
  }, [])

  const save = async () => {
    if (!form.subject.trim()) {
      toast({ title: "Subject is required", variant: "destructive" })
      return
    }
    try {
      setSaving(true)
      const bodyHtml = `<p>To: ${form.to_name || "All concerned"}</p><p>${form.body.replace(/\n/g, "<br/>")}</p>`
      const res = await createOfficeDocument({
        document_type: "internal_memo",
        subject: form.subject,
        body_html: bodyHtml,
        template_id: form.template_id || undefined,
        category_id: form.category_id || undefined,
        workflow_id: form.workflow_id || undefined,
        owning_org_unit_id: form.owning_org_unit_id || undefined,
        member_id: form.member_id || undefined,
        variables: {
          subject: form.subject,
          to_name: form.to_name,
          body: form.body,
          date: new Date().toLocaleDateString(),
        },
      })
      const id = res.data?.id
      if (form.submit_now && id) {
        await submitOfficeDocument(id)
        toast({ title: "Memo submitted for review" })
      } else {
        toast({ title: "Draft saved" })
      }
      if (id) router.push(`/admin/office/documents/${id}`)
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">New Internal Memo</h1>
        <p className="text-muted-foreground">Create a memorandum and route it through the approval workflow.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Memo details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>To</Label>
            <Input value={form.to_name} onChange={(e) => setForm({ ...form, to_name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Body</Label>
            <Textarea
              rows={8}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Owning org unit</Label>
              <select
                className="h-10 w-full rounded-md border px-3 text-sm"
                value={form.owning_org_unit_id}
                onChange={(e) => setForm({ ...form, owning_org_unit_id: e.target.value })}
              >
                <option value="">— Optional —</option>
                {orgUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                className="h-10 w-full rounded-md border px-3 text-sm"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              >
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Workflow</Label>
              <select
                className="h-10 w-full rounded-md border px-3 text-sm"
                value={form.workflow_id}
                onChange={(e) => setForm({ ...form, workflow_id: e.target.value })}
              >
                <option value="">Default</option>
                {workflows.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Link member ID (optional)</Label>
              <Input
                placeholder="UUID"
                value={form.member_id}
                onChange={(e) => setForm({ ...form, member_id: e.target.value })}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.submit_now}
              onChange={(e) => setForm({ ...form, submit_now: e.target.checked })}
            />
            Submit for review immediately
          </label>
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {form.submit_now ? "Create & submit" : "Save draft"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
