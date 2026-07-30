"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { listEcpmAudit } from "@/lib/api/ecpm"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function EcpmAuditPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<any[]>([])
  const [projectId, setProjectId] = useState("")

  const load = async () => {
    try {
      setLoading(true)
      const res = await listEcpmAudit(projectId ? { project_id: projectId } : undefined)
      setRows(res.data?.data || res.data || [])
    } catch (e: any) {
      toast({ title: "Failed to load audit", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ECPM Audit Trail</h1>
        <p className="text-muted-foreground">Immutable insert-only construction activity log</p>
      </div>
      <div className="flex gap-2">
        <Input placeholder="Filter by project UUID" value={projectId} onChange={(e) => setProjectId(e.target.value)} />
        <button className="px-4 border rounded-md" onClick={load}>Filter</button>
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
        <Card><CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="p-3">When</th><th className="p-3">Action</th><th className="p-3">Status</th><th className="p-3">IP</th><th className="p-3">Entity</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-3 whitespace-nowrap text-xs">{r.created_at}</td>
                  <td className="p-3">{r.action}</td>
                  <td className="p-3 text-xs">{r.previous_status || "—"} → {r.new_status || "—"}</td>
                  <td className="p-3 text-xs">{r.ip_address || "—"}</td>
                  <td className="p-3 font-mono text-xs">{r.entity_id || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent></Card>
      )}
    </div>
  )
}
