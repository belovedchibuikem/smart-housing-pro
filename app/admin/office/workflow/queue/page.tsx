"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  actOnWorkflowTask,
  bulkActWorkflowTasks,
  getMyWorkflowApprovals,
  getMyWorkflowRecommendations,
  getMyWorkflowReviews,
  getWorkflowQueue,
} from "@/lib/api/office"
import { CheckCircle2, Loader2, RefreshCw } from "lucide-react"

type QueueMode = "all" | "reviews" | "recommendations" | "approvals" | "overdue"

const loaders: Record<QueueMode, (params?: Record<string, string | number | boolean>) => Promise<any>> = {
  all: getWorkflowQueue,
  reviews: getMyWorkflowReviews,
  recommendations: getMyWorkflowRecommendations,
  approvals: getMyWorkflowApprovals,
  overdue: (p) => getWorkflowQueue({ ...p, overdue: true }),
}

export default function WorkflowQueuePage() {
  const { toast } = useToast()
  const [mode, setMode] = useState<QueueMode>("all")
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const res = await loaders[mode]({ per_page: 50 })
      const data = res.data?.data ?? res.data ?? []
      setRows(Array.isArray(data) ? data : [])
      setSelected([])
    } catch (e: any) {
      toast({ title: "Failed to load queue", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [mode])

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const act = async (taskId: string, action: string) => {
    const reason =
      action === "reject" || action === "return" || action === "recommend_reject"
        ? window.prompt("Reason (required):") || ""
        : window.prompt("Comment (optional):") || undefined
    if (
      (action === "reject" || action === "return" || action === "recommend_reject") &&
      !reason
    ) {
      toast({ title: "Reason required", variant: "destructive" })
      return
    }
    try {
      setBusy(true)
      await actOnWorkflowTask(taskId, { action, reason: reason || undefined })
      toast({ title: "Action applied" })
      await load()
    } catch (e: any) {
      toast({ title: "Action failed", description: e.message, variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  const bulk = async (action: string) => {
    if (!selected.length) return
    const confirmation_note =
      action === "approve" || action === "bulk_approve"
        ? window.prompt("Confirm bulk approval (required note):") || ""
        : undefined
    if ((action === "approve" || action === "bulk_approve") && !confirmation_note) {
      toast({ title: "Confirmation required for bulk approval", variant: "destructive" })
      return
    }
    const reason = window.prompt("Reason / comment (optional):") || undefined
    try {
      setBusy(true)
      const res = await bulkActWorkflowTasks({
        task_ids: selected,
        action,
        reason,
        confirmation_note,
      })
      toast({
        title: "Bulk complete",
        description: res.message || `${res.data?.successful ?? 0} successful`,
      })
      await load()
    } catch (e: any) {
      toast({ title: "Bulk failed", description: e.message, variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workflow Queue</h1>
          <p className="text-sm text-muted-foreground">
            Review, recommendation, and approval work from the central Workflow Engine.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/office/workflow/settings">Configure</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "All pending"],
            ["reviews", "My Reviews"],
            ["recommendations", "My Recommendations"],
            ["approvals", "My Approvals"],
            ["overdue", "Overdue"],
          ] as const
        ).map(([key, label]) => (
          <Button
            key={key}
            size="sm"
            variant={mode === key ? "default" : "outline"}
            onClick={() => setMode(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-md border bg-muted/40 p-3 text-sm">
          <span className="mr-2 self-center">{selected.length} selected</span>
          <Button size="sm" disabled={busy} onClick={() => bulk("complete_review")}>
            Bulk review
          </Button>
          <Button size="sm" disabled={busy} onClick={() => bulk("recommend_approve")}>
            Bulk recommend
          </Button>
          <Button size="sm" disabled={busy} onClick={() => bulk("approve")}>
            Bulk approve
          </Button>
          <Button size="sm" variant="destructive" disabled={busy} onClick={() => bulk("return")}>
            Bulk return
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No pending workflow tasks.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 w-10" />
                <th className="p-3">Title</th>
                <th className="p-3">Process</th>
                <th className="p-3">Stage</th>
                <th className="p-3">Due</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(row.id)}
                      onChange={() => toggle(row.id)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{row.title || "Workflow task"}</div>
                    {row.href && (
                      <Link className="text-xs text-primary underline" href={row.href}>
                        Open in Digital Office
                      </Link>
                    )}
                  </td>
                  <td className="p-3">{row.process_key}</td>
                  <td className="p-3">{row.stage_kind || row.task_type}</td>
                  <td className="p-3">
                    {row.due_at ? new Date(row.due_at).toLocaleString() : "—"}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {(row.stage_kind === "review"
                        ? ["complete_review", "return"]
                        : row.stage_kind === "recommendation"
                          ? ["recommend_approve", "recommend_reject", "return"]
                          : ["approve", "reject", "return"]
                      ).map((action) => (
                        <Button
                          key={action}
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          onClick={() => act(row.id, action)}
                        >
                          {action === "approve" ? (
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                          ) : null}
                          {action.replace(/_/g, " ")}
                        </Button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
