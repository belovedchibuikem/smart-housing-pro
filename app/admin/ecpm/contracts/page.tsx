"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createEcpmContract, listEcpmContracts, listEcpmParties, listEcpmProjects, signEcpmContract, submitEcpmContract } from "@/lib/api/ecpm"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function EcpmContractsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [parties, setParties] = useState<any[]>([])
  const [projectId, setProjectId] = useState("")
  const [partyId, setPartyId] = useState("")
  const [title, setTitle] = useState("")
  const [value, setValue] = useState("")

  const load = async () => {
    try {
      setLoading(true)
      const [c, p, partiesRes] = await Promise.all([listEcpmContracts(), listEcpmProjects(), listEcpmParties()])
      setRows(c.data?.data || c.data || [])
      setProjects(p.data?.data || p.data || [])
      setParties(partiesRes.data?.data || partiesRes.data || [])
    } catch (e: any) {
      toast({ title: "Failed to load contracts", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    try {
      await createEcpmContract({
        project_id: projectId,
        party_id: partyId || undefined,
        title,
        contract_value: Number(value || 0),
        contract_type: "construction",
      })
      toast({ title: "Contract created" })
      await load()
    } catch (e: any) {
      toast({ title: "Create failed", description: e.message, variant: "destructive" })
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contracts</h1>
        <p className="text-muted-foreground">Construction agreements with retention; signing posts to the GL</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">New Contract</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          <div>
            <Label>Project</Label>
            <select className="w-full border rounded-md h-10 px-3" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Select</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Contractor</Label>
            <select className="w-full border rounded-md h-10 px-3" value={partyId} onChange={(e) => setPartyId(e.target.value)}>
              <option value="">Optional</option>
              {parties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label>Contract Value</Label><Input type="number" value={value} onChange={(e) => setValue(e.target.value)} /></div>
          <div className="md:col-span-2"><Button onClick={create} disabled={!projectId || !title}>Create</Button></div>
        </CardContent>
      </Card>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
        <Card><CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="p-3">Number</th><th className="p-3">Title</th><th className="p-3">Status</th><th className="p-3">Value</th><th className="p-3">Actions</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-3 font-mono text-xs">{r.contract_number}</td>
                  <td className="p-3">{r.title}</td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3">₦{Number(r.contract_value || 0).toLocaleString()}</td>
                  <td className="p-3 space-x-2">
                    {r.status === "draft" && <Button size="sm" variant="outline" onClick={async () => { await submitEcpmContract(r.id); await load() }}>Submit</Button>}
                    {["approved", "pending_approval", "draft"].includes(r.status) && r.status !== "active" && (
                      <Button size="sm" onClick={async () => { await signEcpmContract(r.id); toast({ title: "Contract signed (GL soft-post attempted)" }); await load() }}>Sign</Button>
                    )}
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
