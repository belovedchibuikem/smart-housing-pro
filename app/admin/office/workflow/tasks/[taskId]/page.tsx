"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { actOnWorkflowTask, getWorkflowTask } from "@/lib/api/office"
import { Loader2 } from "lucide-react"

export default function WorkflowTaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [task, setTask] = useState<any>(null)

  const load = async () => {
    try {
      setLoading(true)
      const res = await getWorkflowTask(taskId)
      setTask(res.data)
    } catch (e: any) {
      toast({ title: "Failed to load task", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (taskId) load()
  }, [taskId])

  const act = async (action: string) => {
    const needsReason = ["reject", "return", "recommend_reject"].includes(action)
    const reason = window.prompt(needsReason ? "Reason (required):" : "Comment (optional):") || ""
    if (needsReason && !reason) {
      toast({ title: "Reason required", variant: "destructive" })
      return
    }
    try {
      setBusy(true)
      await actOnWorkflowTask(taskId, { action, reason: reason || undefined })
      toast({ title: "Action applied" })
      router.push("/admin/office/workflow/queue")
    } catch (e: any) {
      toast({ title: "Action failed", description: e.message, variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-6 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading task…
      </div>
    )
  }

  if (!task) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Task not found.</p>
        <Button asChild className="mt-3" variant="outline">
          <Link href="/admin/office/workflow/queue">Back to queue</Link>
        </Button>
      </div>
    )
  }

  const actions: string[] = task.available_actions || ["approve", "reject", "return"]

  return (
    <div className="space-y-6 p-6 max-w-3xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{task.title || "Workflow task"}</h1>
          <p className="text-sm text-muted-foreground">
            {task.process_key} · {task.stage_kind || task.task_type} · {task.status}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/office/workflow/queue">Queue</Link>
        </Button>
      </div>

      {task.office_case_id && (
        <Button asChild variant="secondary" size="sm">
          <Link href={`/admin/office/cases/${task.office_case_id}`}>Open linked case</Link>
        </Button>
      )}

      {task.comments && (
        <div className="rounded-md border p-3 text-sm">
          <div className="font-medium mb-1">Last comment</div>
          {task.comments}
        </div>
      )}

      {task.instance?.decisions?.length > 0 && (
        <div className="rounded-md border p-3">
          <div className="font-medium mb-2 text-sm">History</div>
          <ul className="space-y-2 text-sm">
            {task.instance.decisions.map((d: any) => (
              <li key={d.id} className="border-t pt-2 first:border-0 first:pt-0">
                <span className="font-medium">{d.decision}</span>
                {d.reason ? ` — ${d.reason}` : ""}
                <div className="text-xs text-muted-foreground">
                  {d.created_at ? new Date(d.created_at).toLocaleString() : ""}
                  {d.previous_status || d.new_status
                    ? ` · ${d.previous_status || "—"} → ${d.new_status || "—"}`
                    : ""}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {task.status === "pending" && (
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <Button key={action} size="sm" disabled={busy} onClick={() => act(action)}>
              {action.replace(/_/g, " ")}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
