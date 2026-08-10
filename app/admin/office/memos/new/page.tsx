"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import {
  createOfficeDocument,
  getOfficeCategories,
  getOfficeOrgUnits,
  getOfficeStaffUsers,
  getOfficeTemplates,
  getOfficeWorkflows,
  submitOfficeDocument,
  uploadOfficeAttachment,
} from "@/lib/api/office"
import { ArrowLeft, Loader2, Paperclip, Send, X } from "lucide-react"

type StaffUser = {
  id: string
  name: string
  email: string
  roles?: string[]
}

function staffLabel(u: StaffUser) {
  return `${u.name || "Staff"}${u.email ? ` · ${u.email}` : ""}`
}

export default function NewInternalMemoPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])
  const [orgUnits, setOrgUnits] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [workflows, setWorkflows] = useState<any[]>([])
  const [staff, setStaff] = useState<StaffUser[]>([])
  const [highestAdmin, setHighestAdmin] = useState<StaffUser | null>(null)
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null)
  const [attachments, setAttachments] = useState<File[]>([])
  const [form, setForm] = useState({
    subject: "",
    from_user_id: "",
    to_user_id: "",
    cc_user_ids: [] as string[],
    bcc_user_ids: [] as string[],
    body: "",
    owning_org_unit_id: "",
    category_id: "",
    template_id: "",
    workflow_id: "",
    auto_cc_highest_admin: true,
    submit_now: true,
  })

  useEffect(() => {
    ;(async () => {
      try {
        const [t, o, c, w, usersRes] = await Promise.all([
          getOfficeTemplates(),
          getOfficeOrgUnits(),
          getOfficeCategories(),
          getOfficeWorkflows(),
          getOfficeStaffUsers(),
        ])
        setTemplates(t.data || [])
        setOrgUnits(o.data || [])
        setCategories(c.data || [])
        setWorkflows(w.data || [])
        const staffList = (usersRes.data || []) as StaffUser[]
        setStaff(staffList)

        const highest = (usersRes as any).highest_admin as StaffUser | null
        const me = (usersRes as any).current_user as StaffUser | null
        setHighestAdmin(highest || null)
        setCurrentUser(me || null)

        let fromId = me?.id || ""
        if (!fromId && typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("user_data")
            const parsed = raw ? JSON.parse(raw) : null
            if (parsed?.id) fromId = String(parsed.id)
          } catch {
            /* ignore */
          }
        }

        const memoTpl = (t.data || []).find((x: any) => x.document_type === "internal_memo")
        const memoCat = (c.data || []).find((x: any) => x.slug === "internal-memos")
        const defaultWf = (w.data || []).find((x: any) => x.is_default) || (w.data || [])[0]
        setForm((f) => ({
          ...f,
          from_user_id: fromId,
          template_id: memoTpl?.id || "",
          category_id: memoCat?.id || "",
          workflow_id: memoTpl?.workflow_id || defaultWf?.id || "",
        }))
      } catch (e: any) {
        toast({ title: "Failed to load form data", description: e.message, variant: "destructive" })
      }
    })()
  }, [])

  const fromUser = useMemo(
    () => staff.find((s) => s.id === form.from_user_id) || currentUser,
    [staff, form.from_user_id, currentUser],
  )
  const toUser = useMemo(() => staff.find((s) => s.id === form.to_user_id), [staff, form.to_user_id])
  const ccUsers = useMemo(() => {
    const selected = staff.filter((s) => form.cc_user_ids.includes(s.id))
    if (
      form.auto_cc_highest_admin &&
      highestAdmin &&
      highestAdmin.id !== form.to_user_id &&
      highestAdmin.id !== form.from_user_id &&
      !form.cc_user_ids.includes(highestAdmin.id)
    ) {
      return [...selected, highestAdmin]
    }
    return selected
  }, [staff, form.cc_user_ids, form.auto_cc_highest_admin, form.to_user_id, form.from_user_id, highestAdmin])

  const toggleMulti = (key: "cc_user_ids" | "bcc_user_ids", id: string) => {
    setForm((f) => {
      const set = new Set(f[key])
      if (set.has(id)) set.delete(id)
      else set.add(id)
      return { ...f, [key]: Array.from(set) }
    })
  }

  const addAttachments = (list: FileList | null) => {
    if (!list || list.length === 0) return
    const next = Array.from(list)
    const oversized = next.filter((f) => f.size > 20 * 1024 * 1024)
    if (oversized.length) {
      toast({
        title: "File too large",
        description: "Each attachment must be 20 MB or less.",
        variant: "destructive",
      })
    }
    const ok = next.filter((f) => f.size <= 20 * 1024 * 1024)
    setAttachments((prev) => {
      const names = new Set(prev.map((f) => `${f.name}:${f.size}`))
      return [...prev, ...ok.filter((f) => !names.has(`${f.name}:${f.size}`))]
    })
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const save = async () => {
    if (!form.subject.trim()) {
      toast({ title: "Subject is required", variant: "destructive" })
      return
    }
    if (!form.to_user_id) {
      toast({ title: "Select a recipient (To)", variant: "destructive" })
      return
    }
    if (!form.body.trim()) {
      toast({ title: "Memo body is required", variant: "destructive" })
      return
    }

    try {
      setSaving(true)
      const fromName = fromUser?.name || "Administration"
      const toName = toUser?.name || "All concerned"
      const ccNames = ccUsers.map((u) => u.name).filter(Boolean).join("; ") || "—"
      const bccSelected = staff.filter((s) => form.bcc_user_ids.includes(s.id))
      const bccNames = bccSelected.map((u) => u.name).filter(Boolean).join("; ") || "—"

      const bodyHtml = [
        `<p>From: ${fromName}<br/>Date: ${new Date().toLocaleDateString()}</p>`,
        `<p><strong>MEMORANDUM</strong></p>`,
        `<p>To: ${toName}</p>`,
        `<p>CC: ${ccNames}</p>`,
        form.bcc_user_ids.length ? `<p>BCC: ${bccNames}</p>` : "",
        `<p><strong>Subject:</strong> ${form.subject}</p>`,
        `<p>${form.body.replace(/\n/g, "<br/>")}</p>`,
      ]
        .filter(Boolean)
        .join("")

      const res = await createOfficeDocument({
        document_type: "internal_memo",
        subject: form.subject,
        body_html: bodyHtml,
        template_id: form.template_id || undefined,
        category_id: form.category_id || undefined,
        workflow_id: form.workflow_id || undefined,
        owning_org_unit_id: form.owning_org_unit_id || undefined,
        from_user_id: form.from_user_id || undefined,
        to_user_id: form.to_user_id,
        cc_user_ids: form.cc_user_ids,
        bcc_user_ids: form.bcc_user_ids,
        auto_cc_highest_admin: form.auto_cc_highest_admin,
        variables: {
          subject: form.subject,
          from_name: fromName,
          to_name: toName,
          cc_names: ccNames,
          bcc_names: form.bcc_user_ids.length ? bccNames : "—",
          body: form.body,
          date: new Date().toLocaleDateString(),
          department: orgUnits.find((u) => u.id === form.owning_org_unit_id)?.name || "",
        },
      })
      const id = res.data?.id
      if (!id) {
        throw new Error("Memo was created but no document id was returned.")
      }

      for (const file of attachments) {
        await uploadOfficeAttachment(id, file)
      }

      if (form.submit_now) {
        await submitOfficeDocument(id)
        toast({
          title: "Memo submitted for review",
          description: attachments.length
            ? `${attachments.length} attachment${attachments.length === 1 ? "" : "s"} included.`
            : undefined,
        })
      } else {
        toast({
          title: "Draft saved",
          description: attachments.length
            ? `${attachments.length} attachment${attachments.length === 1 ? "" : "s"} uploaded.`
            : undefined,
        })
      }
      router.push(`/admin/office/documents/${id}`)
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/office/documents">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New Internal Memo</h1>
          <p className="text-sm text-muted-foreground">
            Address staff, copy the cooperative head office, and route for approval.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Routing</CardTitle>
          <CardDescription>From, To, CC and BCC — like a formal office memorandum.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>From (sender)</Label>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={form.from_user_id}
              onChange={(e) => setForm({ ...form, from_user_id: e.target.value })}
            >
              <option value="">— Select sender —</option>
              {staff.map((u) => (
                <option key={u.id} value={u.id}>
                  {staffLabel(u)}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">Defaults to the signed-in admin.</p>
          </div>

          <div className="space-y-2">
            <Label>To</Label>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={form.to_user_id}
              onChange={(e) => setForm({ ...form, to_user_id: e.target.value })}
            >
              <option value="">— Select tenant admin / staff —</option>
              {staff
                .filter((u) => u.id !== form.from_user_id)
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {staffLabel(u)}
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>CC</Label>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={form.auto_cc_highest_admin}
                  onCheckedChange={(v) => setForm({ ...form, auto_cc_highest_admin: Boolean(v) })}
                />
                Auto-CC highest admin
              </label>
            </div>
            {form.auto_cc_highest_admin && highestAdmin ? (
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                <Badge variant="secondary" className="mr-2">
                  Housing / HQ
                </Badge>
                {staffLabel(highestAdmin)}
              </div>
            ) : null}
            <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-2">
              {staff
                .filter(
                  (u) =>
                    u.id !== form.to_user_id &&
                    u.id !== form.from_user_id &&
                    u.id !== highestAdmin?.id,
                )
                .map((u) => (
                  <label key={u.id} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-muted/50">
                    <Checkbox
                      checked={form.cc_user_ids.includes(u.id)}
                      onCheckedChange={() => toggleMulti("cc_user_ids", u.id)}
                    />
                    <span>{staffLabel(u)}</span>
                  </label>
                ))}
              {staff.length === 0 ? (
                <p className="px-1 py-2 text-xs text-muted-foreground">No staff users found.</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label>BCC</Label>
            <div className="max-h-32 space-y-1 overflow-y-auto rounded-md border p-2">
              {staff
                .filter((u) => u.id !== form.to_user_id && u.id !== form.from_user_id)
                .map((u) => (
                  <label key={u.id} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-muted/50">
                    <Checkbox
                      checked={form.bcc_user_ids.includes(u.id)}
                      onCheckedChange={() => toggleMulti("bcc_user_ids", u.id)}
                    />
                    <span>{staffLabel(u)}</span>
                  </label>
                ))}
            </div>
            <p className="text-xs text-muted-foreground">BCC recipients are recorded on the memo for office audit.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Memo content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="e.g. Contribution stoppage — Member FRSC-…"
            />
          </div>
          <div className="space-y-2">
            <Label>Body</Label>
            <Textarea
              rows={10}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="State the purpose, facts, and the action required…"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Owning desk / org unit</Label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
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
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
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
            <div className="space-y-2 sm:col-span-2">
              <Label>Approval workflow</Label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
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
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Attachments
            </Label>
            <Input
              type="file"
              multiple
              disabled={saving}
              onChange={(e) => {
                addAttachments(e.target.files)
                e.target.value = ""
              }}
            />
            <p className="text-xs text-muted-foreground">
              Optional supporting files (PDF, Word, images, spreadsheets). Max 20 MB each.
            </p>
            {attachments.length > 0 ? (
              <ul className="space-y-1 rounded-md border p-2">
                {attachments.map((file, index) => (
                  <li
                    key={`${file.name}-${file.size}-${index}`}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="truncate">
                      {file.name}{" "}
                      <span className="text-muted-foreground">
                        ({Math.max(1, Math.round(file.size / 1024))} KB)
                      </span>
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      disabled={saving}
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.submit_now}
              onCheckedChange={(v) => setForm({ ...form, submit_now: Boolean(v) })}
            />
            Submit for review immediately
          </label>
          <div className="flex flex-wrap gap-2">
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {form.submit_now ? "Create & submit" : "Save draft"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/office/documents">Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
