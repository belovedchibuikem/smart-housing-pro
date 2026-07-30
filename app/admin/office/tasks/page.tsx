"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { completeMinuteAction, getOfficeMyTasks } from "@/lib/api/office"
import { Loader2 } from "lucide-react"

export default function OfficeTasksPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  const load = async () => {
    try {
      setLoading(true)
      const res = await getOfficeMyTasks()
      setData(res.data)
    } catch (e: any) {
      toast({ title: "Failed to load tasks", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const complete = async (id: string) => {
    try {
      await completeMinuteAction(id)
      toast({ title: "Action completed" })
      await load()
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-6 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading tasks…
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">My Tasks</h1>
        <p className="text-muted-foreground">Pending reviews, minute actions, drafts, and overdue items.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending reviews / approvals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(data?.pending_reviews || []).length === 0 && (
              <p className="text-sm text-muted-foreground">None</p>
            )}
            {(data?.pending_reviews || []).map((t: any) => (
              <Link
                key={t.id}
                href={`/admin/office/documents/${t.office_document_id}`}
                className="block rounded border p-3 text-sm hover:bg-muted/40"
              >
                <div className="font-medium">{t.document?.reference_number}</div>
                <div className="text-muted-foreground">{t.document?.subject}</div>
                <div className="text-xs mt-1">{t.step?.name || t.task_type}</div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending minute actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(data?.pending_minutes || []).length === 0 && (
              <p className="text-sm text-muted-foreground">None</p>
            )}
            {(data?.pending_minutes || []).map((a: any) => (
              <div key={a.id} className="rounded border p-3 text-sm">
                <div className="font-medium">{a.title}</div>
                <div className="text-muted-foreground">
                  {a.document?.reference_number}
                  {a.deadline ? ` · due ${new Date(a.deadline).toLocaleDateString()}` : ""}
                </div>
                <div className="mt-2 flex gap-2">
                  <Link href={`/admin/office/documents/${a.office_document_id}`}>
                    <Button size="sm" variant="outline">
                      Open
                    </Button>
                  </Link>
                  <Button size="sm" onClick={() => complete(a.id)}>
                    Mark done
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Overdue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(data?.overdue || []).length === 0 && (
              <p className="text-sm text-muted-foreground">None</p>
            )}
            {(data?.overdue || []).map((a: any) => (
              <div key={a.id} className="rounded border border-destructive/30 p-3 text-sm">
                {a.title} — {a.document?.reference_number}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Drafts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(data?.drafts || []).length === 0 && (
              <p className="text-sm text-muted-foreground">None</p>
            )}
            {(data?.drafts || []).map((d: any) => (
              <Link
                key={d.id}
                href={`/admin/office/documents/${d.id}`}
                className="block rounded border p-3 text-sm hover:bg-muted/40"
              >
                {d.reference_number} — {d.subject}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
