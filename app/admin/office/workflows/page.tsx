"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createOfficeWorkflow, getOfficeWorkflows } from "@/lib/api/office"
import { Loader2 } from "lucide-react"

export default function OfficeWorkflowsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [workflows, setWorkflows] = useState<any[]>([])
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const res = await getOfficeWorkflows()
      setWorkflows(res.data || [])
    } catch (e: any) {
      toast({ title: "Failed to load workflows", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    if (!name.trim()) return
    try {
      setSaving(true)
      await createOfficeWorkflow({
        name,
        document_type: "internal_memo",
        is_default: false,
        steps: [
          {
            name: "Supervisor Review",
            assignee_type: "creator_org_unit_head",
            allowed_actions: ["approve", "reject", "return", "hold", "forward"],
          },
          {
            name: "Final Approval",
            assignee_type: "role",
            assignee_role: "admin",
            require_comment: true,
            allowed_actions: ["approve", "reject", "return"],
          },
        ],
      })
      toast({ title: "Workflow created" })
      setName("")
      await load()
    } catch (e: any) {
      toast({ title: "Create failed", description: e.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Workflows</h1>
        <p className="text-muted-foreground">Configurable multi-level approval chains for office documents.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick-create memo workflow</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Legal + MD approval" />
          </div>
          <Button onClick={create} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {workflows.map((wf) => (
            <Card key={wf.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {wf.name}
                  {wf.is_default ? " · Default" : ""}
                  {wf.is_system ? " · System" : ""}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">{wf.description || wf.document_type}</p>
                <ol className="list-decimal pl-5 space-y-1">
                  {(wf.steps || []).map((s: any) => (
                    <li key={s.id}>
                      {s.name}{" "}
                      <span className="text-muted-foreground">
                        ({s.assignee_type}
                        {s.assignee_role ? `:${s.assignee_role}` : ""})
                      </span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
