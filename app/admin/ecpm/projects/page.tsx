"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createEcpmProject, listEcpmEstates, listEcpmProjects } from "@/lib/api/ecpm"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function EcpmProjectsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<any[]>([])
  const [estates, setEstates] = useState<any[]>([])
  const [name, setName] = useState("")
  const [estateId, setEstateId] = useState("")
  const [budget, setBudget] = useState("")
  const [clientName, setClientName] = useState("")

  const load = async () => {
    try {
      setLoading(true)
      const [p, e] = await Promise.all([listEcpmProjects(), listEcpmEstates()])
      setRows(p.data?.data || p.data || [])
      setEstates(e.data?.data || e.data || [])
    } catch (err: any) {
      toast({ title: "Failed to load projects", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    try {
      await createEcpmProject({
        name,
        estate_id: estateId || undefined,
        budget: budget ? Number(budget) : undefined,
        client_name: clientName || undefined,
        status: "planning",
      })
      setName("")
      setBudget("")
      setClientName("")
      toast({ title: "Project created with default stages" })
      await load()
    } catch (e: any) {
      toast({ title: "Create failed", description: e.message, variant: "destructive" })
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Construction Projects</h1>
        <p className="text-muted-foreground">Projects auto-copy the default 4-stage construction template</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">New Project</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Client Name</Label><Input value={clientName} onChange={(e) => setClientName(e.target.value)} /></div>
          <div>
            <Label>Estate</Label>
            <select className="w-full border rounded-md h-10 px-3" value={estateId} onChange={(e) => setEstateId(e.target.value)}>
              <option value="">Optional</option>
              {estates.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div><Label>Budget</Label><Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} /></div>
          <div className="md:col-span-2"><Button onClick={create} disabled={!name}>Create Project</Button></div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-3">Number</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Progress</th>
                  <th className="p-3">Budget</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="p-3 font-mono text-xs">{p.project_number}</td>
                    <td className="p-3">{p.name}</td>
                    <td className="p-3">{p.status}</td>
                    <td className="p-3">{p.progress_percent}%</td>
                    <td className="p-3">₦{Number(p.budget || 0).toLocaleString()}</td>
                    <td className="p-3">
                      <Link className="text-primary underline" href={`/admin/ecpm/projects/${p.id}`}>Open</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
