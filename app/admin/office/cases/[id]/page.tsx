"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  CalendarClock,
  FileText,
  Loader2,
  MessageSquare,
  Paperclip,
  RefreshCw,
  UserPlus,
  UserRound,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select"
import { Textarea } from "@/components/ui/textarea"
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
import { cn } from "@/lib/utils"

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

function statusBadgeVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "resolved":
    case "closed":
      return "default"
    case "rejected":
      return "destructive"
    case "in_progress":
    case "assigned":
      return "secondary"
    default:
      return "outline"
  }
}

function formatPerson(user?: {
  first_name?: string
  last_name?: string
  name?: string
  email?: string
} | null) {
  if (!user) return null
  const name =
    user.name ||
    `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
    user.email
  return name || null
}

function staffToOptions(
  users: Array<{
    id: string
    name?: string
    email?: string
    first_name?: string
    last_name?: string
    role_label?: string | null
    roles?: string[]
  }>,
): SearchableSelectOption[] {
  return users.map((u) => {
    const label =
      u.name ||
      `${u.first_name || ""} ${u.last_name || ""}`.trim() ||
      u.email ||
      "Staff"
    const role =
      u.role_label ||
      (u.roles?.[0] ? u.roles[0].replace(/_/g, " ") : undefined)
    return {
      value: u.id,
      label,
      description: [u.email, role].filter(Boolean).join(" · "),
      searchText: [label, u.email, role, ...(u.roles || [])].filter(Boolean).join(" "),
    }
  })
}

function eventTone(type?: string) {
  const t = (type || "").toLowerCase()
  if (t.includes("reject") || t.includes("escalat")) return "border-destructive/40"
  if (t.includes("resolv") || t.includes("clos") || t.includes("approv")) return "border-emerald-400"
  if (t.includes("reply") || t.includes("message")) return "border-sky-400"
  if (t.includes("assign") || t.includes("claim")) return "border-amber-400"
  return "border-primary/40"
}

export default function OfficeCaseDetailPage() {
  const params = useParams()
  const id = typeof params?.id === "string" ? params.id : ""
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [caseData, setCaseData] = useState<any>(null)
  const [staffOptions, setStaffOptions] = useState<SearchableSelectOption[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [reply, setReply] = useState("")
  const [visibility, setVisibility] = useState("member")
  const [assignee, setAssignee] = useState("")
  const [resolution, setResolution] = useState("")
  const [nextStatus, setNextStatus] = useState("")
  const [applyDomainAction, setApplyDomainAction] = useState(false)
  const [busy, setBusy] = useState(false)

  const loadStaff = useCallback(async (query = "") => {
    const users = await getOfficeStaffUsers(query || undefined, { excludeSelf: true })
    if (users.current_user?.id) setCurrentUserId(users.current_user.id)
    const options = staffToOptions(users.data || [])
    setStaffOptions(options)
    return options
  }, [])

  const load = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const [res, staffRes] = await Promise.all([
        getOfficeCase(id),
        getOfficeStaffUsers(undefined, { excludeSelf: true }),
      ])
      setCaseData(res.data)
      if (staffRes.current_user?.id) setCurrentUserId(staffRes.current_user.id)

      let options = staffToOptions(staffRes.data || [])
      const assignedId = res.data?.assigned_to_user_id || ""
      // Keep current assignee visible even if they are the viewer or missing from the exclude-self list
      if (assignedId && !options.some((o) => o.value === assignedId) && res.data?.assignee) {
        const a = res.data.assignee
        options = [
          {
            value: assignedId,
            label: formatPerson(a) || "Current assignee",
            description: a.email || "Currently assigned",
            searchText: `${formatPerson(a) || ""} ${a.email || ""}`,
          },
          ...options,
        ]
      }
      setStaffOptions(options)
      setAssignee(assignedId)
      setResolution(res.data?.resolution_summary || "")
      setNextStatus(res.data?.status || "")
    } catch (e: any) {
      toast({ title: "Failed to load case", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [id, toast])

  useEffect(() => {
    void load()
  }, [load])

  const searchStaff = useCallback(
    async (query: string): Promise<SearchableSelectOption[]> => {
      try {
        return await loadStaff(query)
      } catch {
        return []
      }
    },
    [loadStaff],
  )

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

  const events = useMemo(() => caseData?.events || [], [caseData])

  if (loading || !caseData) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Loading case…</p>
      </div>
    )
  }

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
  const attending = formatPerson(caseData.assignee) || "Unassigned"
  const memberLabel = caseData.member
    ? formatPerson(caseData.member.user) ||
      caseData.member.member_number ||
      "Member"
    : null

  return (
    <div className="space-y-6 p-1 md:p-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/office/cases">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{caseData.case_number}</h1>
              <Badge variant={statusBadgeVariant(caseData.status)} className="capitalize">
                {(caseData.status || "").replace(/_/g, " ")}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {(caseData.case_type || "case").replace(/_/g, " ")}
              </Badge>
              {slaOverdue ? <Badge variant="destructive">SLA overdue</Badge> : null}
              {slaPaused ? <Badge variant="outline">SLA paused</Badge> : null}
              {caseData.priority && caseData.priority !== "normal" ? (
                <Badge variant="secondary" className="capitalize">
                  {caseData.priority} priority
                </Badge>
              ) : null}
            </div>
            <p className="max-w-3xl text-base text-foreground">{caseData.subject}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5" />
                Attending: <span className="text-foreground">{attending}</span>
              </span>
              {memberLabel ? <span>Member: {memberLabel}</span> : null}
              {caseData.owning_org_unit?.name ? (
                <span>Desk: {caseData.owning_org_unit.name}</span>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5" />
                Due:{" "}
                <span className={cn(slaOverdue && "font-medium text-destructive")}>
                  {caseData.due_at ? new Date(caseData.due_at).toLocaleString() : "—"}
                </span>
                {slaPaused ? " (paused)" : ""}
              </span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" disabled={busy || loading} onClick={() => void load()}>
          <RefreshCw className={cn("mr-2 h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4" />
              Request / response timeline
            </CardTitle>
            <CardDescription>
              Chronological activity for this case — submissions, replies, and status changes.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {events.length === 0 ? (
              <div className="rounded-lg border border-dashed px-4 py-12 text-center">
                <MessageSquare className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm font-medium">No timeline events yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Replies and status changes will appear here.
                </p>
              </div>
            ) : (
              <ol className="relative space-y-0 border-l border-border ml-2">
                {events.map((ev: any) => {
                  const actor =
                    formatPerson(ev.actor_user) ||
                    (ev.actor_member
                      ? `Member ${ev.actor_member.member_number || ""}`.trim()
                      : "System")
                  return (
                    <li key={ev.id} className="relative pb-6 pl-6 last:pb-0">
                      <span
                        className={cn(
                          "absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 bg-background",
                          eventTone(ev.event_type),
                        )}
                      />
                      <div className="rounded-lg border bg-card px-3 py-2.5 shadow-sm">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium capitalize text-foreground">
                            {(ev.event_type || "event").replace(/_/g, " ")}
                          </span>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {(ev.visibility || "internal").replace(/_/g, " ")}
                          </Badge>
                          <span>{ev.created_at ? new Date(ev.created_at).toLocaleString() : ""}</span>
                          <span>· {actor}</span>
                        </div>
                        {ev.body ? (
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{ev.body}</p>
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Status</CardTitle>
              <CardDescription>Move the case through the service desk lifecycle.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Next status</Label>
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
              </div>
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
                ) : (
                  <div />
                )}
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

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus className="h-4 w-4" />
                Assign
              </CardTitle>
              <CardDescription>
                Search and select another tenant admin. You are excluded from this list.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Staff assignee</Label>
                <SearchableSelect
                  value={assignee}
                  onValueChange={setAssignee}
                  options={staffOptions}
                  onSearch={searchStaff}
                  allowEmpty
                  emptyValueLabel="Unassigned"
                  placeholder="Search staff by name or email…"
                  searchPlaceholder="Type to search admins…"
                  emptyText="No matching staff found."
                />
              </div>
              {currentUserId && assignee === currentUserId ? (
                <p className="text-xs text-muted-foreground">
                  This case is currently assigned to you. Pick another admin to reassign.
                </p>
              ) : null}
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
                Assign to selected staff
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Reply</CardTitle>
              <CardDescription>Respond to the member or leave an internal note.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                rows={4}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write your reply…"
              />
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

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Documents & letterhead
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    const doc = await createOfficeCaseLetter(id)
                    toast({
                      title: "Letter draft created",
                      description: doc.data?.reference_number,
                    })
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
                Issue / print on letterhead & send
              </Button>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Direct letterhead issue is audited as issued without workflow approval. Prefer Create
                letter draft when multi-step approval is required.
              </p>
              <div className="space-y-2">
                <Label className="inline-flex items-center gap-1.5">
                  <Paperclip className="h-3.5 w-3.5" />
                  Upload schedule / attachment
                </Label>
                <Input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    run(async () => {
                      await uploadOfficeCaseAttachment(id, file)
                      toast({ title: "File uploaded" })
                      e.target.value = ""
                    })
                  }}
                />
              </div>
              {(caseData.documents || []).length > 0 ? (
                <ul className="space-y-2 border-t pt-3">
                  {caseData.documents.map((d: any) => (
                    <li
                      key={d.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-2.5 py-2"
                    >
                      <Link
                        className="text-sm font-medium text-primary hover:underline"
                        href={`/admin/office/documents/${d.id}`}
                      >
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
                            toast({
                              title: "Download failed",
                              description: e.message,
                              variant: "destructive",
                            })
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
              ) : null}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Resolve</CardTitle>
              <CardDescription>Close the case with a member-visible resolution summary.</CardDescription>
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
                    Also apply domain finance action (e.g. approve linked refund). Leave unchecked to
                    close the case only.
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
