"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getEcpmExecutiveReport, getEcpmHseReport, getEcpmProcurementReport, getEcpmProjectReport } from "@/lib/api/ecpm"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function EcpmReportsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [exec, setExec] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [proc, setProc] = useState<any>(null)
  const [hse, setHse] = useState<any>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const [e, p, pr, h] = await Promise.all([
          getEcpmExecutiveReport(),
          getEcpmProjectReport(),
          getEcpmProcurementReport(),
          getEcpmHseReport(),
        ])
        setExec(e.data)
        setProjects(p.data || [])
        setProc(pr.data)
        setHse(h.data)
      } catch (err: any) {
        toast({ title: "Reports failed", description: err.message, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ECPM Reports</h1>
        <p className="text-muted-foreground">Executive, project status, procurement and HSE analytics</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Active projects", exec?.projects_active],
          ["Avg progress", `${exec?.avg_progress ?? 0}%`],
          ["Contract value", `₦${Number(exec?.contract_value_active || 0).toLocaleString()}`],
          ["Open HSE", exec?.hse_open],
          ["Failed inspections", exec?.inspections_failed],
          ["Open POs", exec?.pos_open],
          ["Low stock", exec?.stock_below_reorder],
          ["Handed over", exec?.projects_handed_over],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{String(value ?? 0)}</CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Project status</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="p-3">Project</th><th className="p-3">Progress</th><th className="p-3">Cost variance</th><th className="p-3">Milestones pending</th></tr></thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.progress_percent}%</td>
                  <td className="p-3">₦{Number(p.cost_variance || 0).toLocaleString()}</td>
                  <td className="p-3">{p.milestones_pending}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <Card>
          <CardHeader><CardTitle className="text-base">Low stock</CardTitle></CardHeader>
          <CardContent>
            {(proc?.low_stock || []).map((s: any) => (
              <div key={s.id} className="border-b py-1">{s.name}: {s.quantity_on_hand} / reorder {s.reorder_level}</div>
            ))}
            {(proc?.low_stock || []).length === 0 && <p className="text-muted-foreground">None</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">HSE by type</CardTitle></CardHeader>
          <CardContent>
            {Object.entries(hse?.by_type || {}).map(([k, v]) => (
              <div key={k} className="flex justify-between border-b py-1"><span>{k}</span><span>{String(v)}</span></div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
