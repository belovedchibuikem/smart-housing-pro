"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Clock3,
  ExternalLink,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  Settings2,
  ThumbsDown,
  ThumbsUp,
  XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  actOnWorkflowTask,
  bulkActWorkflowTasks,
  getMyWorkflowApprovals,
  getMyWorkflowRecommendations,
  getMyWorkflowReviews,
  getWorkflowProcessKeys,
  getWorkflowQueue,
} from "@/lib/api/office"
import { cn } from "@/lib/utils"

type QueueMode = "all" | "reviews" | "recommendations" | "approvals" | "overdue"

type QueueRow = {
  id: string
  title?: string
  display_title?: string
  process_key?: string
  process_label?: string
  stage_kind?: string
  stage_label?: string
  task_type?: string
  due_at?: string | null
  href?: string
  case_number?: string | null
  case_id?: string | null
  assignee_name?: string | null
  is_overdue?: boolean
  available_actions?: string[]
  created_at?: string
}

const MODE_META: Array<{
  key: QueueMode
  label: string
  description: string
}> = [
  { key: "all", label: "My office", description: "Pending work assigned to you or your office" },
  { key: "reviews", label: "My reviews", description: "Assigned to you for review" },
  { key: "recommendations", label: "My recommendations", description: "Awaiting your recommendation" },
  { key: "approvals", label: "My approvals", description: "Ready for your final decision" },
  { key: "overdue", label: "Overdue", description: "Past due date" },
]

const loaders: Record<
  QueueMode,
  (params?: Record<string, string | number | boolean>) => Promise<any>
> = {
  all: getWorkflowQueue,
  reviews: getMyWorkflowReviews,
  recommendations: getMyWorkflowRecommendations,
  approvals: getMyWorkflowApprovals,
  overdue: (p) => getWorkflowQueue({ ...p, overdue: true }),
}

const ACTION_META: Record<
  string,
  { label: string; variant: "default" | "outline" | "secondary" | "destructive"; icon?: typeof CheckCircle2 }
> = {
  complete_review: { label: "Complete review", variant: "default", icon: CheckCircle2 },
  recommend_approve: { label: "Recommend approve", variant: "default", icon: ThumbsUp },
  recommend_reject: { label: "Recommend reject", variant: "destructive", icon: ThumbsDown },
  approve: { label: "Approve", variant: "default", icon: CheckCircle2 },
  reject: { label: "Reject", variant: "destructive", icon: XCircle },
  return: { label: "Return", variant: "outline", icon: RotateCcw },
}

function stageBadgeClass(stage?: string) {
  switch (stage) {
    case "review":
      return "bg-sky-50 text-sky-800 border-sky-200"
    case "recommendation":
      return "bg-amber-50 text-amber-900 border-amber-200"
    case "approval":
      return "bg-emerald-50 text-emerald-900 border-emerald-200"
    default:
      return ""
  }
}

function formatWhen(value?: string | null) {
  if (!value) return null
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    })
  } catch {
    return value
  }
}

function needsReason(action: string) {
  return ["reject", "return", "recommend_reject"].includes(action)
}

export default function WorkflowQueuePage() {
  const { toast } = useToast()
  const [mode, setMode] = useState<QueueMode>("all")
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<QueueRow[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [search, setSearch] = useState("")
  const [searchApplied, setSearchApplied] = useState("")
  const [processFilter, setProcessFilter] = useState("all")
  const [processOptions, setProcessOptions] = useState<Array<{ key: string; label: string }>>([])
  const [actionDialog, setActionDialog] = useState<{
    mode: "single" | "bulk"
    action: string
    taskId?: string
  } | null>(null)
  const [comment, setComment] = useState("")

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const params: Record<string, string | number | boolean> = { per_page: 50 }
      if (searchApplied.trim()) params.q = searchApplied.trim()
      if (processFilter !== "all") params.process_key = processFilter
      const res = await loaders[mode](params)
      const data = res.data?.data ?? res.data ?? []
      setRows(Array.isArray(data) ? data : [])
      setSelected([])
    } catch (e: any) {
      toast({ title: "Failed to load queue", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [mode, processFilter, searchApplied, toast])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    void getWorkflowProcessKeys()
      .then((res) => setProcessOptions(res.data || []))
      .catch(() => setProcessOptions([]))
  }, [])

  const counts = useMemo(() => {
    const byStage = { review: 0, recommendation: 0, approval: 0 }
    let overdue = 0
    for (const row of rows) {
      if (row.stage_kind === "review") byStage.review++
      if (row.stage_kind === "recommendation") byStage.recommendation++
      if (row.stage_kind === "approval") byStage.approval++
      if (row.is_overdue) overdue++
    }
    return { total: rows.length, ...byStage, overdue }
  }, [rows])

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? rows.map((r) => r.id) : [])
  }

  const openAction = (action: string, taskId?: string) => {
    setComment("")
    setActionDialog({
      mode: taskId ? "single" : "bulk",
      action,
      taskId,
    })
  }

  const runAction = async () => {
    if (!actionDialog) return
    const { action, mode: actMode, taskId } = actionDialog
    if (needsReason(action) && !comment.trim()) {
      toast({ title: "Reason required", variant: "destructive" })
      return
    }

    try {
      setBusy(true)
      if (actMode === "single" && taskId) {
        await actOnWorkflowTask(taskId, {
          action,
          reason: comment.trim() || undefined,
        })
        toast({ title: "Action applied", description: ACTION_META[action]?.label || action })
      } else {
        const confirmation_note =
          action === "approve" || action === "bulk_approve" ? comment.trim() : undefined
        if ((action === "approve" || action === "bulk_approve") && !confirmation_note) {
          toast({ title: "Confirmation note required for bulk approval", variant: "destructive" })
          return
        }
        const res = await bulkActWorkflowTasks({
          task_ids: selected,
          action,
          reason: comment.trim() || undefined,
          confirmation_note,
        })
        toast({
          title: "Bulk complete",
          description: res.message || `${res.data?.successful ?? 0} successful`,
        })
      }
      setActionDialog(null)
      setComment("")
      await load()
    } catch (e: any) {
      toast({ title: "Action failed", description: e.message, variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  const dialogTitle = actionDialog
    ? ACTION_META[actionDialog.action]?.label || actionDialog.action.replace(/_/g, " ")
    : ""

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/admin/office" className="inline-flex items-center gap-1 hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" />
              Digital Office
            </Link>
            <span>/</span>
            <span>Workflow queue</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Workflow queue</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Work items waiting for review, recommendation, or approval across enabled processes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading || busy}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/office/workflow/delegations">Delegations</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/office/workflow/settings">
              <Settings2 className="mr-2 h-4 w-4" />
              Configure
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "In this view", value: counts.total, icon: ClipboardList },
          { label: "Reviews", value: counts.review, icon: Search },
          { label: "Recommendations", value: counts.recommendation, icon: ThumbsUp },
          { label: "Approvals", value: counts.approval, icon: CheckCircle2 },
        ].map((stat) => (
          <Card key={stat.label} className="shadow-sm">
            <CardContent className="flex items-center justify-between gap-3 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{stat.value}</p>
              </div>
              <div className="rounded-lg bg-muted p-2.5 text-muted-foreground">
                <stat.icon className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-base">Inbox filters</CardTitle>
              <CardDescription>Focus on your stage, process, or search by title.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {MODE_META.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setMode(item.key)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    mode === item.key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  title={item.description}
                >
                  {item.label}
                  {item.key === "overdue" && counts.overdue > 0 ? (
                    <span className="ml-1.5 rounded-full bg-destructive/15 px-1.5 text-xs text-destructive">
                      {counts.overdue}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search title or process…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSearchApplied(search)
                }}
              />
            </div>
            <Select value={processFilter} onValueChange={setProcessFilter}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="All processes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All processes</SelectItem>
                {processOptions.map((p) => (
                  <SelectItem key={p.key} value={p.key}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSearchApplied(search)}
              disabled={loading}
            >
              Search
            </Button>
          </div>
        </CardHeader>

        {selected.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 px-6 py-3">
            <span className="text-sm font-medium">{selected.length} selected</span>
            <div className="h-4 w-px bg-border" />
            <Button size="sm" disabled={busy} onClick={() => openAction("complete_review")}>
              Bulk complete review
            </Button>
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => openAction("recommend_approve")}>
              Bulk recommend
            </Button>
            <Button size="sm" disabled={busy} onClick={() => openAction("approve")}>
              Bulk approve
            </Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => openAction("return")}>
              Bulk return
            </Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => setSelected([])}>
              Clear
            </Button>
          </div>
        ) : null}

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center gap-2 px-6 py-16 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading workflow tasks…
            </div>
          ) : rows.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <ClipboardList className="mx-auto mb-3 h-9 w-9 text-muted-foreground/50" />
              <p className="text-sm font-medium">No pending tasks</p>
              <p className="mt-1 text-sm text-muted-foreground">
                When items are submitted to an enabled process, they appear here for action.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left text-muted-foreground">
                  <tr>
                    <th className="w-12 px-4 py-3">
                      <Checkbox
                        checked={selected.length > 0 && selected.length === rows.length}
                        onCheckedChange={(v) => toggleAll(!!v)}
                        aria-label="Select all"
                      />
                    </th>
                    <th className="px-3 py-3 font-medium">Item</th>
                    <th className="px-3 py-3 font-medium">Process</th>
                    <th className="px-3 py-3 font-medium">Stage</th>
                    <th className="px-3 py-3 font-medium">Due</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const actions = row.available_actions?.length
                      ? row.available_actions
                      : row.stage_kind === "review"
                        ? ["complete_review", "return"]
                        : row.stage_kind === "recommendation"
                          ? ["recommend_approve", "recommend_reject", "return"]
                          : ["approve", "reject", "return"]
                    const title = row.display_title || row.title || "Workflow task"
                    const dueLabel = formatWhen(row.due_at)

                    return (
                      <tr
                        key={row.id}
                        className={cn(
                          "border-b last:border-0 hover:bg-muted/20",
                          row.is_overdue && "bg-destructive/5",
                        )}
                      >
                        <td className="px-4 py-4 align-top">
                          <Checkbox
                            checked={selected.includes(row.id)}
                            onCheckedChange={() => toggle(row.id)}
                            aria-label={`Select ${title}`}
                          />
                        </td>
                        <td className="px-3 py-4 align-top">
                          <div className="min-w-[220px] max-w-[360px]">
                            <Link
                              href={`/admin/office/workflow/tasks/${row.id}`}
                              className="font-medium text-foreground hover:underline"
                            >
                              {title}
                            </Link>
                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                              {row.case_number ? <span>Case {row.case_number}</span> : null}
                              {row.assignee_name ? <span>· {row.assignee_name}</span> : null}
                            </div>
                            {row.href ? (
                              <Link
                                href={row.href}
                                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                              >
                                Open record
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-3 py-4 align-top">
                          <div className="font-medium">{row.process_label || row.process_key || "—"}</div>
                          {row.process_key && row.process_label ? (
                            <div className="text-xs text-muted-foreground">{row.process_key}</div>
                          ) : null}
                        </td>
                        <td className="px-3 py-4 align-top">
                          <Badge
                            variant="outline"
                            className={cn("capitalize", stageBadgeClass(row.stage_kind))}
                          >
                            {row.stage_label || row.stage_kind || row.task_type || "—"}
                          </Badge>
                        </td>
                        <td className="px-3 py-4 align-top text-muted-foreground">
                          {dueLabel ? (
                            <span
                              className={cn(
                                "inline-flex items-center gap-1",
                                row.is_overdue && "font-medium text-destructive",
                              )}
                            >
                              <Clock3 className="h-3.5 w-3.5" />
                              {dueLabel}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/70">No due date</span>
                          )}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-wrap justify-end gap-1.5">
                            {actions.map((action) => {
                              const meta = ACTION_META[action] || {
                                label: action.replace(/_/g, " "),
                                variant: "outline" as const,
                              }
                              const Icon = meta.icon
                              return (
                                <Button
                                  key={action}
                                  size="sm"
                                  variant={meta.variant}
                                  disabled={busy}
                                  onClick={() => openAction(action, row.id)}
                                >
                                  {Icon ? <Icon className="mr-1 h-3.5 w-3.5" /> : null}
                                  {meta.label}
                                </Button>
                              )
                            })}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!actionDialog} onOpenChange={(open) => !open && setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              {actionDialog?.mode === "bulk"
                ? `Apply this action to ${selected.length} selected task(s).`
                : needsReason(actionDialog?.action || "")
                  ? "A reason is required for this action."
                  : "Add an optional comment for the audit trail."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="wf-comment">
              {needsReason(actionDialog?.action || "") ||
              actionDialog?.action === "approve" ||
              actionDialog?.action === "bulk_approve"
                ? "Reason / confirmation"
                : "Comment"}
            </Label>
            <Textarea
              id="wf-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder={
                needsReason(actionDialog?.action || "")
                  ? "Explain why this item is being returned or rejected…"
                  : "Optional note for colleagues and audit history…"
              }
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={busy} onClick={() => setActionDialog(null)}>
              Cancel
            </Button>
            <Button type="button" disabled={busy} onClick={() => void runAction()}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
