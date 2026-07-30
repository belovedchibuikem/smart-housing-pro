"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { acceptEcpmQuotation, createEcpmQuotation, listEcpmBoqs, listEcpmProjects, listEcpmQuotations, submitEcpmQuotation } from "@/lib/api/ecpm"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function EcpmQuotationsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [boqs, setBoqs] = useState<any[]>([])
  const [projectId, setProjectId] = useState("")
  const [boqId, setBoqId] = useState("")
  const [title, setTitle] = useState("")

  const load = async () => {
    try {
      setLoading(true)
      const [q, p, b] = await Promise.all([listEcpmQuotations(), listEcpmProjects(), listEcpmBoqs()])
      setRows(q.data?.data || q.data || [])
      setProjects(p.data?.data || p.data || [])
      setBoqs(b.data?.data || b.data || [])
    } catch (e: any) {
      toast({ title: "Failed to load quotations", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    try {
      await createEcpmQuotation({ project_id: projectId, boq_id: boqId || undefined, title })
      toast({ title: "Quotation created" })
      await load()
    } catch (e: any) {
      toast({ title: "Create failed", description: e.message, variant: "destructive" })
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quotations</h1>
        <p className="text-muted-foreground">Estimates with approval, revision and client acceptance</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">New Quotation</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3">
          <div>
            <Label>Project</Label>
            <select className="w-full border rounded-md h-10 px-3" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Select</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <Label>From BOQ</Label>
            <select className="w-full border rounded-md h-10 px-3" value={boqId} onChange={(e) => setBoqId(e.target.value)}>
              <option value="">Optional</option>
              {boqs.filter((b) => !projectId || b.project_id === projectId).map((b) => (
                <option key={b.id} value={b.id}>{b.boq_number} — {b.title}</option>
              ))}
            </select>
          </div>
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="md:col-span-3"><Button onClick={create} disabled={!projectId || !title}>Create</Button></div>
        </CardContent>
      </Card>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
        <Card><CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="p-3">Number</th><th className="p-3">Title</th><th className="p-3">Status</th><th className="p-3">Total</th><th className="p-3">Actions</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-3 font-mono text-xs">{r.quotation_number} r{r.revision}</td>
                  <td className="p-3">{r.title}</td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3">₦{Number(r.grand_total || 0).toLocaleString()}</td>
                  <td className="p-3 space-x-2">
                    {r.status === "draft" && <Button size="sm" variant="outline" onClick={async () => { await submitEcpmQuotation(r.id); await load() }}>Submit</Button>}
                    {["approved", "pending_approval"].includes(r.status) && <Button size="sm" onClick={async () => { await acceptEcpmQuotation(r.id); await load() }}>Accept</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent></Card>
      )}
    </div>
  )
}
