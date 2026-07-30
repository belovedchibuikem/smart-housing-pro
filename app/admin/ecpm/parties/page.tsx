"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createEcpmParty, listEcpmParties } from "@/lib/api/ecpm"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function EcpmPartiesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<any[]>([])
  const [name, setName] = useState("")
  const [type, setType] = useState("contractor")
  const [phone, setPhone] = useState("")

  const load = async () => {
    try {
      setLoading(true)
      const res = await listEcpmParties()
      setRows(res.data?.data || res.data || [])
    } catch (e: any) {
      toast({ title: "Failed to load parties", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    try {
      await createEcpmParty({ name, type, phone })
      setName("")
      setPhone("")
      toast({ title: "Party created" })
      await load()
    } catch (e: any) {
      toast({ title: "Create failed", description: e.message, variant: "destructive" })
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contractors & Parties</h1>
        <p className="text-muted-foreground">Company profiles for contractors, consultants and suppliers</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Register Party</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div>
            <Label>Type</Label>
            <select className="w-full border rounded-md h-10 px-3" value={type} onChange={(e) => setType(e.target.value)}>
              {["contractor", "consultant", "architect", "qs", "supplier", "engineer", "other"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div className="md:col-span-3"><Button onClick={create} disabled={!name}>Create</Button></div>
        </CardContent>
      </Card>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
        <Card><CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="p-3">Name</th><th className="p-3">Type</th><th className="p-3">Compliance</th><th className="p-3">Phone</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.type}</td>
                  <td className="p-3">{r.compliance_status}</td>
                  <td className="p-3">{r.phone || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent></Card>
      )}
    </div>
  )
}
