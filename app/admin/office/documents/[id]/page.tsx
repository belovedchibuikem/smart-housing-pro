"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  actOnOfficeTask,
  addOfficeMinute,
  archiveOfficeDocument,
  checkinOfficeDocument,
  checkoutOfficeDocument,
  compareOfficeVersions,
  downloadOfficeDocument,
  getOfficeDocument,
  getOfficeStaffUsers,
  recallOfficeDocument,
  setOfficeLegalHold,
  signOfficeDocument,
  submitOfficeDocument,
  updateOfficeDocument,
  uploadOfficeAttachment,
} from "@/lib/api/office"
import { Loader2 } from "lucide-react"

export default function OfficeDocumentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [doc, setDoc] = useState<any>(null)
  const [minuteBody, setMinuteBody] = useState("")
  const [actionTitle, setActionTitle] = useState("")
  const [actionAssignee, setActionAssignee] = useState("")
  const [editSubject, setEditSubject] = useState("")
  const [editBody, setEditBody] = useState("")
  const [busy, setBusy] = useState(false)
  const [staff, setStaff] = useState<Array<{ id: string; name: string; email: string }>>([])

  const load = async () => {
    try {
      setLoading(true)
      const [res, users] = await Promise.all([getOfficeDocument(id), getOfficeStaffUsers()])
      setDoc(res.data)
      setStaff(users.data || [])
      setEditSubject(res.data?.subject || "")
      setEditBody((res.data?.body_html || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, ""))
    } catch (e: any) {
      toast({ title: "Failed to load document", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) load()
  }, [id])

  const run = async (fn: () => Promise<any>, ok: string) => {
    try {
      setBusy(true)
      await fn()
      toast({ title: ok })
      await load()
    } catch (e: any) {
      toast({ title: "Action failed", description: e.message, variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  const pendingTask = (doc?.tasks || []).find((t: any) => t.status === "pending")

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-6 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading document…
      </div>
    )
  }

  if (!doc) {
    return <div className="p-6">Document not found.</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{doc.reference_number}</p>
          <h1 className="text-2xl font-semibold">{doc.subject}</h1>
          <p className="text-sm text-muted-foreground capitalize mt-1">
            {doc.document_type?.replace("_", " ")} · {doc.status?.replace("_", " ")}
            {doc.member_id ? (
              <>
                {" · "}
                <Link className="text-primary hover:underline" href={`/admin/office/member-file/${doc.member_id}`}>
                  Member file
                </Link>
              </>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["draft", "returned"].includes(doc.status) && (
            <Button
              disabled={busy}
              onClick={() =>
                run(
                  () =>
                    updateOfficeDocument(doc.id, {
                      subject: editSubject,
                      body_html: `<p>${editBody.replace(/\n/g, "<br/>")}</p>`,
                    }),
                  "Draft updated"
                )
              }
            >
              Save edits
            </Button>
          )}
          {["draft", "returned"].includes(doc.status) && (
            <Button disabled={busy} onClick={() => run(() => submitOfficeDocument(doc.id), "Submitted")}>
              Submit
            </Button>
          )}
          {doc.status === "in_review" && (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => run(() => recallOfficeDocument(doc.id), "Recalled")}
            >
              Recall
            </Button>
          )}
          {["approved", "issued"].includes(doc.status) && (
            <Button
              disabled={busy}
              onClick={() => {
                const canvas = document.createElement("canvas")
                canvas.width = 300
                canvas.height = 80
                const ctx = canvas.getContext("2d")
                if (ctx) {
                  ctx.fillStyle = "#fff"
                  ctx.fillRect(0, 0, 300, 80)
                  ctx.strokeStyle = "#111"
                  ctx.font = "28px Georgia"
                  ctx.fillStyle = "#111"
                  ctx.fillText("Approved", 40, 50)
                }
                const dataUri = canvas.toDataURL("image/png")
                run(() => signOfficeDocument(doc.id, dataUri, "Approving Officer"), "Signed")
              }}
            >
              Apply e-signature
            </Button>
          )}
          {doc.status !== "archived" && (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => run(() => archiveOfficeDocument(doc.id), "Archived")}
            >
              Archive
            </Button>
          )}
          {!doc.checked_out_by ? (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => run(() => checkoutOfficeDocument(doc.id), "Checked out")}
            >
              Check out
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => run(() => checkinOfficeDocument(doc.id), "Checked in")}
            >
              Check in
            </Button>
          )}
          <Button
            variant="outline"
            disabled={busy}
            onClick={() =>
              run(() => setOfficeLegalHold(doc.id, !doc.legal_hold), doc.legal_hold ? "Legal hold cleared" : "Legal hold on")
            }
          >
            {doc.legal_hold ? "Clear legal hold" : "Legal hold"}
          </Button>
          {(doc.versions || []).length >= 2 && (
            <Button
              variant="outline"
              disabled={busy}
              onClick={async () => {
                try {
                  const versions = [...(doc.versions || [])].sort(
                    (a: any, b: any) => a.version_number - b.version_number
                  )
                  const left = versions[versions.length - 2].version_number
                  const right = versions[versions.length - 1].version_number
                  const res = await compareOfficeVersions(doc.id, left, right)
                  toast({
                    title: `Compare v${left} → v${right}`,
                    description: res.data?.body_changed
                      ? "Body changed between versions"
                      : "No body differences",
                  })
                } catch (e: any) {
                  toast({ title: "Compare failed", description: e.message, variant: "destructive" })
                }
              }}
            >
              Compare versions
            </Button>
          )}
          <Button
            variant="secondary"
            disabled={busy}
            onClick={async () => {
              try {
                const blob = await downloadOfficeDocument(doc.id)
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `${doc.reference_number}.pdf`
                a.click()
                URL.revokeObjectURL(url)
              } catch (e: any) {
                toast({ title: "Download failed", description: e.message, variant: "destructive" })
              }
            }}
          >
            Download PDF
          </Button>
        </div>
      </div>

      {["draft", "returned"].includes(doc.status) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Edit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} />
            <Textarea rows={6} value={editBody} onChange={(e) => setEditBody(e.target.value)} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Body</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: doc.body_html || "" }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(doc.tasks || []).map((t: any) => (
              <div key={t.id} className="rounded border p-2">
                <div className="font-medium">{t.step?.name || t.task_type}</div>
                <div className="text-muted-foreground">
                  {t.assignee?.name || "Unassigned"} · {t.status}
                  {t.action_taken ? ` · ${t.action_taken}` : ""}
                </div>
              </div>
            ))}
            {pendingTask && (
              <div className="space-y-2 pt-2">
                <p className="text-xs text-muted-foreground">Act on your pending task</p>
                <div className="flex flex-wrap gap-2">
                  {["approve", "return", "reject"].map((action) => (
                    <Button
                      key={action}
                      size="sm"
                      variant={action === "approve" ? "default" : "outline"}
                      disabled={busy}
                      onClick={() =>
                        run(
                          () => actOnOfficeTask(pendingTask.id, { action, comments: action === "approve" ? undefined : action }),
                          `Task ${action}d`
                        )
                      }
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attachments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(doc.attachments || []).length === 0 && (
            <p className="text-sm text-muted-foreground">No attachments yet.</p>
          )}
          {(doc.attachments || []).map((a: any) => (
            <div key={a.id} className="text-sm">
              {a.original_name}{" "}
              <span className="text-muted-foreground">
                ({Math.round((a.file_size || 0) / 1024)} KB)
              </span>
            </div>
          ))}
          <Input
            type="file"
            disabled={busy}
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              try {
                setBusy(true)
                await uploadOfficeAttachment(doc.id, file)
                toast({ title: "Attachment uploaded" })
                await load()
              } catch (err: any) {
                toast({ title: "Upload failed", description: err.message, variant: "destructive" })
              } finally {
                setBusy(false)
                e.target.value = ""
              }
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Minute sheet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {(doc.minutes || []).map((m: any) => (
              <div key={m.id} className="rounded border p-3 text-sm">
                <div className="font-medium">{m.author?.name}</div>
                <div className="text-muted-foreground text-xs mb-1">
                  {m.created_at ? new Date(m.created_at).toLocaleString() : ""}
                </div>
                <div className="whitespace-pre-wrap">{m.body}</div>
                {(m.actions || []).map((a: any) => (
                  <div key={a.id} className="mt-2 rounded bg-muted/50 px-2 py-1 text-xs">
                    Action: {a.title} → {a.assignee?.name} ({a.status})
                  </div>
                ))}
              </div>
            ))}
          </div>
          <Textarea
            placeholder="Add a minute…"
            value={minuteBody}
            onChange={(e) => setMinuteBody(e.target.value)}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              placeholder="Optional action title"
              value={actionTitle}
              onChange={(e) => setActionTitle(e.target.value)}
            />
            <select
              className="h-10 rounded-md border px-3 text-sm"
              value={actionAssignee}
              onChange={(e) => setActionAssignee(e.target.value)}
            >
              <option value="">Action assignee (optional)</option>
              {staff.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <Button
            disabled={busy || !minuteBody.trim()}
            onClick={() =>
              run(async () => {
                const payload: any = { body: minuteBody }
                if (actionTitle && actionAssignee) {
                  payload.action = { title: actionTitle, assignee_user_id: actionAssignee }
                }
                await addOfficeMinute(doc.id, payload)
                setMinuteBody("")
                setActionTitle("")
                setActionAssignee("")
              }, "Minute added")
            }
          >
            Add minute
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audit trail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(doc.audit_logs || []).map((log: any) => (
            <div key={log.id} className="flex flex-wrap gap-2 border-b py-2 last:border-0">
              <span className="font-medium">{log.action}</span>
              <span className="text-muted-foreground">{log.actor?.name || "System"}</span>
              <span className="text-muted-foreground">
                {log.created_at ? new Date(log.created_at).toLocaleString() : ""}
              </span>
              {log.comments ? <span>· {log.comments}</span> : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
