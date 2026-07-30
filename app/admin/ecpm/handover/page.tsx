"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { completeEcpmHandover, getEcpmHandover, listEcpmProjects, updateEcpmHandover } from "@/lib/api/ecpm"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const FLAGS = [
  "construction_complete",
  "final_inspection_passed",
  "snags_resolved",
  "client_accepted",
  "financial_cleared",
  "documentation_complete",
  "keys_issued",
  "warranty_activated",
] as const

export default function EcpmHandoverPage() {
  const { toast } = useToast()
  const [projects, setProjects] = useState<any[]>([])
  const [projectId, setProjectId] = useState("")
  const [checklist, setChecklist] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    listEcpmProjects().then((r) => setProjects(r.data?.data || r.data || [])).catch(() => {})
  }, [])

  const load = async (id: string) => {
    try {
      setLoading(true)
      const res = await getEcpmHandover(id)
      setChecklist(res.data)
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const toggle = async (key: string, value: boolean) => {
    if (!projectId) return
    const res = await updateEcpmHandover(projectId, { [key]: value })
    setChecklist(res.data)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Handover Management</h1>
        <p className="text-muted-foreground">Verify completion gates, then transfer to Facility Management</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Select Project</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Project</Label>
            <select className="w-full border rounded-md h-10 px-3" value={projectId} onChange={(e) => {
              setProjectId(e.target.value)
              if (e.target.value) load(e.target.value)
            }}>
              <option value="">Select</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.status})</option>)}
            </select>
          </div>
        </CardContent>
      </Card>
      {loading && <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}
      {checklist && (
        <Card>
          <CardHeader><CardTitle className="text-base">Checklist — {checklist.status}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {FLAGS.map((key) => (
              <label key={key} className="flex items-center justify-between border-b py-2 text-sm">
                <span>{key.replaceAll("_", " ")}</span>
                <input type="checkbox" checked={!!checklist[key]} onChange={(e) => toggle(key, e.target.checked)} />
              </label>
            ))}
            <Button onClick={async () => {
              try {
                const res = await completeEcpmHandover(projectId)
                setChecklist(res.data)
                toast({ title: "Handover complete", description: res.message })
              } catch (e: any) {
                toast({ title: "Cannot complete", description: e.message, variant: "destructive" })
              }
            }}>Complete & Transfer to FM</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
