"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { actOnOfficeTask, getOfficeInbox, getOfficeStaffUsers } from "@/lib/api/office"
import { Loader2 } from "lucide-react"

export default function OfficeInboxPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<any[]>([])
  const [staff, setStaff] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [comments, setComments] = useState<Record<string, string>>({})
  const [forwardTo, setForwardTo] = useState<Record<string, string>>({})
  const [acting, setActing] = useState<string | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      const [inbox, users] = await Promise.all([
        getOfficeInbox({ per_page: 50 }),
        getOfficeStaffUsers(),
      ])
      setTasks(inbox.data?.data || inbox.data || [])
      setStaff(users.data || [])
    } catch (e: any) {
      toast({ title: "Failed to load inbox", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const act = async (taskId: string, action: string) => {
    try {
      setActing(taskId + action)
      await actOnOfficeTask(taskId, {
        action,
        comments: comments[taskId] || undefined,
        forward_to_user_id: action === "forward" || action === "reassign" ? forwardTo[taskId] : undefined,
      })
      toast({ title: `Task ${action}d` })
      await load()
    } catch (e: any) {
      toast({ title: "Action failed", description: e.message, variant: "destructive" })
    } finally {
      setActing(null)
    }
  }

  const actionsFor = (task: any): string[] => {
    if (task.is_central || (task.process_key && task.process_key !== "office_document")) {
      if (task.stage_kind === "review") return ["complete_review", "return", "reject"]
      if (task.stage_kind === "recommendation") {
        return ["recommend_approve", "recommend_reject", "return"]
      }
      return ["approve", "reject", "return"]
    }
    return ["approve", "return", "reject", "hold", "forward"]
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Inbox</h1>
        <p className="text-muted-foreground">
          Documents and central workflow tasks awaiting your action.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">Inbox is empty.</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const href =
              task.href ||
              (task.office_document_id
                ? `/admin/office/documents/${task.office_document_id}`
                : `/admin/office/workflow/tasks/${task.id}`)
            const title =
              task.title ||
              (task.document
                ? `${task.document.reference_number} — ${task.document.subject}`
                : "Workflow task")
            const isCentral = task.is_central || (task.process_key && task.process_key !== "office_document")

            return (
              <Card key={task.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    <Link className="hover:underline" href={href}>
                      {title}
                    </Link>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {isCentral ? `Process: ${task.process_key} · ` : ""}
                    Stage: {task.stage_kind || task.step?.name || task.task_type}
                    {task.document?.status ? ` · Doc status: ${task.document.status}` : ""}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Comment / reason (required for reject/return)"
                    value={comments[task.id] || ""}
                    onChange={(e) => setComments((c) => ({ ...c, [task.id]: e.target.value }))}
                  />
                  {!isCentral && (
                    <select
                      className="h-10 w-full rounded-md border px-3 text-sm"
                      value={forwardTo[task.id] || ""}
                      onChange={(e) => setForwardTo((f) => ({ ...f, [task.id]: e.target.value }))}
                    >
                      <option value="">Forward to…</option>
                      {staff.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {actionsFor(task).map((action) => (
                      <Button
                        key={action}
                        size="sm"
                        variant={action.includes("approve") ? "default" : "outline"}
                        disabled={
                          acting === task.id + action ||
                          (action === "forward" && !forwardTo[task.id])
                        }
                        onClick={() => act(task.id, action)}
                      >
                        {acting === task.id + action ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          action.replace(/_/g, " ")
                        )}
                      </Button>
                    ))}
                    {isCentral && (
                      <Button asChild size="sm" variant="secondary">
                        <Link href="/admin/office/workflow/queue">Open queue</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
