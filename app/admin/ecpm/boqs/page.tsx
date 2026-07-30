"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createEcpmBoq, listEcpmBoqs, listEcpmProjects, submitEcpmBoq } from "@/lib/api/ecpm"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function EcpmBoqsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [projectId, setProjectId] = useState("")
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("Concrete works")
  const [qty, setQty] = useState("1")
  const [rate, setRate] = useState("0")

  const load = async () => {
    try {
      setLoading(true)
      const [b, p] = await Promise.all([listEcpmBoqs(), listEcpmProjects()])
      setRows(b.data?.data || b.data || [])
      setProjects(p.data?.data || p.data || [])
    } catch (e: any) {
      toast({ title: "Failed to load BOQs", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    try {
      await createEcpmBoq({
        project_id: projectId,
        title,
        items: [{ description: desc, category: "material", quantity: Number(qty), unit_rate: Number(rate), unit: "sum" }],
      })
      toast({ title: "BOQ created" })
      await load()
    } catch (e: any) {
      toast({ title: "Create failed", description: e.message, variant: "destructive" })
    }
  }

  const submit = async (id: string) => {
    try {
      await submitEcpmBoq(id)
      toast({ title: "Submitted for approval" })
      await load()
    } catch (e: any) {
      toast({ title: "Submit failed", description: e.message, variant: "destructive" })
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bills of Quantities</h1>
        <p className="text-muted-foreground">Labour, material and equipment cost breakdowns</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">New BOQ</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          <div>
            <Label>Project</Label>
            <select className="w-full border rounded-md h-10 px-3" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Select</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label>Line description</Label><Input value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Qty</Label><Input value={qty} onChange={(e) => setQty(e.target.value)} /></div>
            <div><Label>Rate</Label><Input value={rate} onChange={(e) => setRate(e.target.value)} /></div>
          </div>
          <div className="md:col-span-2"><Button onClick={create} disabled={!projectId || !title}>Create BOQ</Button></div>
        </CardContent>
      </Card>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
        <Card><CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="p-3">Number</th><th className="p-3">Title</th><th className="p-3">Status</th><th className="p-3">Total</th><th className="p-3"></th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-3 font-mono text-xs">{r.boq_number}</td>
                  <td className="p-3">{r.title}</td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3">₦{Number(r.grand_total || 0).toLocaleString()}</td>
                  <td className="p-3">{r.status === "draft" && <Button size="sm" variant="outline" onClick={() => submit(r.id)}>Submit</Button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent></Card>
      )}
    </div>
  )
}
