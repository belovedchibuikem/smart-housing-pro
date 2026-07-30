"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { listEcpmAiSuggestions, listEcpmProjects, requestEcpmAi, reviewEcpmAi } from "@/lib/api/ecpm"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const TYPES = [
  "boq_validation",
  "cost_estimation",
  "schedule_risk",
  "delay_prediction",
  "inspection_checklist",
  "progress_report",
]

export default function EcpmAiPage() {
  const { toast } = useToast()
  const [projects, setProjects] = useState<any[]>([])
  const [rows, setRows] = useState<any[]>([])
  const [projectId, setProjectId] = useState("")
  const [type, setType] = useState("boq_validation")
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const [p, a] = await Promise.all([listEcpmProjects(), listEcpmAiSuggestions()])
      setProjects(p.data?.data || p.data || [])
      setRows(a.data?.data || a.data || [])
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Assist</h1>
        <p className="text-muted-foreground">Suggestions require human accept/reject before use</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Request suggestion</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3">
          <div>
            <Label>Type</Label>
            <select className="w-full border rounded-md h-10 px-3" value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <Label>Project</Label>
            <select className="w-full border rounded-md h-10 px-3" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Optional</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={async () => {
              await requestEcpmAi({ suggestion_type: type, project_id: projectId || undefined })
              toast({ title: "Suggestion ready for review" }); await load()
            }}>Generate</Button>
          </div>
        </CardContent>
      </Card>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
        <div className="space-y-3">
          {rows.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <CardTitle className="text-base">{r.title} <span className="text-muted-foreground font-normal">({r.status})</span></CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm whitespace-pre-wrap">
                <p>{r.suggestion_body}</p>
                {r.status === "pending_review" && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={async () => { await reviewEcpmAi(r.id, { status: "accepted" }); await load() }}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={async () => { await reviewEcpmAi(r.id, { status: "rejected" }); await load() }}>Reject</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
