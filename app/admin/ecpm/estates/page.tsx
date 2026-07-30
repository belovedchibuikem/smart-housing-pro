"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createEcpmEstate, createEcpmPlot, listEcpmEstates } from "@/lib/api/ecpm"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function EcpmEstatesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<any[]>([])
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [plotEstateId, setPlotEstateId] = useState("")
  const [plotNumber, setPlotNumber] = useState("")

  const load = async () => {
    try {
      setLoading(true)
      const res = await listEcpmEstates()
      setRows(res.data?.data || res.data || [])
    } catch (e: any) {
      toast({ title: "Failed to load estates", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    try {
      await createEcpmEstate({ name, location, status: "planning" })
      setName("")
      setLocation("")
      toast({ title: "Estate created" })
      await load()
    } catch (e: any) {
      toast({ title: "Create failed", description: e.message, variant: "destructive" })
    }
  }

  const addPlot = async () => {
    if (!plotEstateId || !plotNumber) return
    try {
      await createEcpmPlot(plotEstateId, { plot_number: plotNumber })
      setPlotNumber("")
      toast({ title: "Plot added" })
      await load()
    } catch (e: any) {
      toast({ title: "Plot failed", description: e.message, variant: "destructive" })
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Estates & Plots</h1>
        <p className="text-muted-foreground">First-class development estates with optional Land/Property links</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">New Estate</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label>Location</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} /></div>
            <Button onClick={create} disabled={!name}>Create Estate</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Add Plot</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Estate</Label>
              <select className="w-full border rounded-md h-10 px-3" value={plotEstateId} onChange={(e) => setPlotEstateId(e.target.value)}>
                <option value="">Select estate</option>
                {rows.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div><Label>Plot Number</Label><Input value={plotNumber} onChange={(e) => setPlotNumber(e.target.value)} /></div>
            <Button onClick={addPlot} disabled={!plotEstateId || !plotNumber}>Add Plot</Button>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-3">Code</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Plots</th>
                  <th className="p-3">Projects</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id} className="border-b">
                    <td className="p-3 font-mono text-xs">{e.code}</td>
                    <td className="p-3">{e.name}</td>
                    <td className="p-3">{e.status}</td>
                    <td className="p-3">{e.plots_count ?? "—"}</td>
                    <td className="p-3">{e.projects_count ?? "—"}</td>
                    <td className="p-3"><Link className="text-primary underline" href={`/admin/ecpm/estates`}>View</Link></td>
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
