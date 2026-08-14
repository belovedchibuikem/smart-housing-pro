"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { WorkflowSubjectPanel } from "@/components/office/workflow-subject-panel"
import { actOnWorkflowTask, getWorkflowTask } from "@/lib/api/office"

const ACTION_STYLES: Record<string, "default" | "outline" | "destructive" | "secondary"> = {
  approve: "default",
  recommend_approve: "default",
  complete_review: "default",
  reject: "destructive",
  recommend_reject: "destructive",
  return: "outline",
}

export default function WorkflowTaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [task, setTask] = useState<any>(null)
  const [reason, setReason] = useState("")

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
    if (taskId) void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId])

  const act = async (action: string) => {
    const needsReason = ["reject", "return", "recommend_reject"].includes(action)
    if (needsReason && !reason.trim()) {
      toast({ title: "Reason required", description: "Add a reason before rejecting or returning.", variant: "destructive" })
      return
    }
    try {
      setBusy(true)
      await actOnWorkflowTask(taskId, { action, reason: reason.trim() || undefined })
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
  const caseId = task.office_case_id || task.case_id || task.instance?.office_case_id

  return (
    <div className="space-y-6 p-6 max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Button asChild variant="outline" size="icon">
            <Link href="/admin/office/workflow/queue">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{task.display_title || task.title || "Workflow task"}</h1>
            <p className="text-sm text-muted-foreground">
              {task.process_label || task.process_key} · {task.stage_label || task.stage_kind || task.task_type}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline" className="capitalize">
                {(task.status || "").replace(/_/g, " ")}
              </Badge>
              {task.is_overdue ? <Badge variant="destructive">Overdue</Badge> : null}
            </div>
          </div>
        </div>
        {caseId ? (
          <Button asChild variant="secondary" size="sm">
            <Link href={`/admin/office/cases/${caseId}`}>Open linked case</Link>
          </Button>
        ) : null}
      </div>

      <WorkflowSubjectPanel subject={task.subject} />

      {task.comments ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Last comment</CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-wrap">{task.comments}</CardContent>
        </Card>
      ) : null}

      {task.instance?.decisions?.length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Decision history</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      ) : null}

      {task.status === "pending" ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Take action</CardTitle>
            <CardDescription>
              Add a reason for reject/return. Optional comment for approve or recommend.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-reason">Reason / comment</Label>
              <Textarea
                id="task-reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Required for reject or return…"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {actions.map((action) => (
                <Button
                  key={action}
                  size="sm"
                  variant={ACTION_STYLES[action] || "secondary"}
                  disabled={busy}
                  onClick={() => void act(action)}
                >
                  {action.replace(/_/g, " ")}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
