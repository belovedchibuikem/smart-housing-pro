"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import {
  assignOfficeCase,
  claimOfficeCase,
  createOfficeCaseLetter,
  downloadOfficeDocument,
  escalateOfficeCase,
  getOfficeCase,
  getOfficeStaffUsers,
  issueOfficeCaseLetterhead,
  replyOfficeCase,
  resolveOfficeCase,
  transitionOfficeCase,
  uploadOfficeCaseAttachment,
} from "@/lib/api/office"
import { ArrowLeft, Loader2 } from "lucide-react"

const TRANSITION_STATUSES = [
  "submitted",
  "assigned",
  "in_progress",
  "awaiting_member",
  "pending_signature",
  "resolved",
  "closed",
  "rejected",
]

export default function OfficeCaseDetailPage() {
  const params = useParams()
  const id = typeof params?.id === "string" ? params.id : ""
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [caseData, setCaseData] = useState<any>(null)
  const [staff, setStaff] = useState<any[]>([])
  const [reply, setReply] = useState("")
  const [visibility, setVisibility] = useState("member")
  const [assignee, setAssignee] = useState("")
  const [resolution, setResolution] = useState("")
  const [nextStatus, setNextStatus] = useState("")
  const [applyDomainAction, setApplyDomainAction] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    if (!id) return
    try {
      setLoading(true)
      const [res, users] = await Promise.all([getOfficeCase(id), getOfficeStaffUsers()])
      setCaseData(res.data)
      setStaff(users.data || [])
      setAssignee(res.data?.assigned_to_user_id || "")
      setResolution(res.data?.resolution_summary || "")
      setNextStatus(res.data?.status || "")
    } catch (e: any) {
      toast({ title: "Failed to load case", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    try {
      await fn()
      await load()
    } catch (e: any) {
      toast({ title: "Action failed", description: e.message, variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  if (loading || !caseData) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const events = caseData.events || []
  const openStatuses = ["submitted", "assigned", "in_progress", "awaiting_member", "pending_signature"]
  const isOpen = openStatuses.includes(caseData.status)
  const slaPaused = caseData.status === "awaiting_member"
  const slaOverdue =
    Boolean(caseData.due_at) &&
    isOpen &&
    !slaPaused &&
    new Date(caseData.due_at).getTime() < Date.now()
  const linkedDomain =
    caseData.source_type ||
    caseData.meta?.source_type ||
    caseData.linked_entity_type ||
    caseData.meta?.domain
  const canApplyDomain =
    Boolean(linkedDomain) &&
    ["refund", "stoppage", "finance", "payment", "withdrawal"].some((k) =>
      String(linkedDomain).toLowerCase().includes(k),
    )

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/office/cases">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{caseData.case_number}</h1>
            <Badge>{caseData.status}</Badge>
            <Badge variant="outline">{caseData.case_type}</Badge>
            {slaOverdue ? <Badge variant="destructive">SLA overdue</Badge> : null}
            {slaPaused ? <Badge variant="outline">SLA paused</Badge> : null}
            {caseData.priority && caseData.priority !== "normal" ? (
              <Badge variant="secondary">Priority: {caseData.priority}</Badge>
            ) : null}
          </div>
          <p className="text-muted-foreground">{caseData.subject}</p>
          <p className="text-sm mt-1">
            Attending:{" "}
            {caseData.assignee
              ? `${caseData.assignee.first_name || ""} ${caseData.assignee.last_name || ""}`.trim()
              : "Unassigned"}
            {caseData.owning_org_unit?.name ? ` · Desk: ${caseData.owning_org_unit.name}` : ""}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Due:{" "}
            <span className={slaOverdue ? "text-destructive font-medium" : undefined}>
              {caseData.due_at ? new Date(caseData.due_at).toLocaleString() : "—"}
            </span>
            {slaPaused ? " (clock paused while awaiting member)" : ""}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Request / response timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.map((ev: any) => (
              <div key={ev.id} className="border-l-2 pl-4 py-1">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{ev.event_type}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {ev.visibility}
                  </Badge>
                  <span>{ev.created_at ? new Date(ev.created_at).toLocaleString() : ""}</span>
                  <span>
                    {ev.actor_user
                      ? `${ev.actor_user.first_name || ""} ${ev.actor_user.last_name || ""}`.trim()
                      : ev.actor_member
                        ? `Member ${ev.actor_member.member_number}`
                        : ""}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap mt-1">{ev.body}</p>
              </div>
            ))}
            {events.length === 0 && <p className="text-muted-foreground text-sm">No events yet.</p>}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={nextStatus} onValueChange={setNextStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSITION_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="w-full"
                variant="secondary"
                disabled={busy || !nextStatus || nextStatus === caseData.status}
                onClick={() =>
                  run(async () => {
                    await transitionOfficeCase(id, { status: nextStatus })
                    toast({ title: "Status updated" })
                  })
                }
              >
                Update status
              </Button>
              <div className="grid grid-cols-2 gap-2">
                {!caseData.assigned_to_user_id && isOpen ? (
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        await claimOfficeCase(id)
                        toast({ title: "Case claimed" })
                      })
                    }
                  >
                    Claim
                  </Button>
                ) : null}
                {isOpen ? (
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        await escalateOfficeCase(id, { reassign_to_head: true })
                        toast({ title: "Case escalated" })
                      })
                    }
                  >
                    Escalate
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={assignee || "none"} onValueChange={(v) => setAssignee(v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name || s.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="w-full"
                disabled={busy || !assignee}
                onClick={() =>
                  run(async () => {
                    await assignOfficeCase(id, { assigned_to_user_id: assignee })
                    toast({ title: "Case assigned" })
                  })
                }
              >
                Assign
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reply</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea rows={4} value={reply} onChange={(e) => setReply(e.target.value)} />
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Visible to member</SelectItem>
                  <SelectItem value="internal">Internal note</SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="w-full"
                disabled={busy || !reply.trim()}
                onClick={() =>
                  run(async () => {
                    await replyOfficeCase(id, { body: reply, visibility })
                    setReply("")
                    toast({ title: "Reply posted" })
                  })
                }
              >
                Post reply
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documents &amp; letterhead</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    const doc = await createOfficeCaseLetter(id)
                    toast({ title: "Letter draft created", description: doc.data?.reference_number })
                  })
                }
              >
                Create letter draft
              </Button>
              <Button
                className="w-full"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    const res = await issueOfficeCaseLetterhead(id, {
                      use_tenant_signatory: true,
                      body_html: resolution
                        ? `<p>${resolution.replace(/</g, "&lt;")}</p>`
                        : undefined,
                    })
                    const ref = res.data?.document?.reference_number
                    toast({
                      title: "Letterhead document issued",
                      description: ref
                        ? `${ref} — issued without workflow approval (audited).`
                        : "Branded PDF issued (audited bypass of case_letter workflow).",
                    })
                  })
                }
              >
                Issue / print on letterhead &amp; send
              </Button>
              <p className="text-xs text-muted-foreground">
                Direct letterhead issue is audited as issued without workflow approval. Prefer Create letter draft when multi-step approval is required.
              </p>
              <div>
                <Label>Upload schedule / attachment</Label>
                <Input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    run(async () => {
                      await uploadOfficeCaseAttachment(id, file)
                      toast({ title: "File uploaded" })
                    })
                  }}
                />
              </div>
              {(caseData.documents || []).length > 0 && (
                <ul className="text-sm space-y-2">
                  {caseData.documents.map((d: any) => (
                    <li key={d.id} className="flex flex-wrap items-center gap-2">
                      <Link className="text-primary hover:underline" href={`/admin/office/documents/${d.id}`}>
                        {d.reference_number} — {d.subject}
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        onClick={async () => {
                          try {
                            setBusy(true)
                            const blob = await downloadOfficeDocument(d.id)
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement("a")
                            a.href = url
                            a.download = `${d.reference_number || "letter"}.pdf`
                            a.click()
                            URL.revokeObjectURL(url)
                          } catch (e: any) {
                            toast({ title: "Download failed", description: e.message, variant: "destructive" })
                          } finally {
                            setBusy(false)
                          }
                        }}
                      >
                        Download PDF
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resolve</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                rows={3}
                placeholder="Resolution summary (visible to member)"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              />
              {canApplyDomain ? (
                <label className="flex items-start gap-2 text-sm">
                  <Checkbox
                    checked={applyDomainAction}
                    onCheckedChange={(v) => setApplyDomainAction(v === true)}
                  />
                  <span>
                    Also apply domain finance action (e.g. approve linked refund). Leave unchecked to close the case only — no silent money mutation.
                  </span>
                </label>
              ) : null}
              <Button
                className="w-full"
                disabled={busy || !resolution.trim()}
                onClick={() =>
                  run(async () => {
                    await resolveOfficeCase(id, {
                      resolution_summary: resolution,
                      close: true,
                      apply_domain_action: applyDomainAction || undefined,
                    })
                    toast({
                      title: "Case resolved and closed",
                      description: applyDomainAction
                        ? "Domain action was requested explicitly."
                        : "Case closed without mutating finance.",
                    })
                  })
                }
              >
                Resolve & close
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
