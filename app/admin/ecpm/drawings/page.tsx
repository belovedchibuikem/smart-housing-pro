"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { listEcpmDrawings } from "@/lib/api/ecpm"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function EcpmDrawingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<any[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await listEcpmDrawings()
        setRows(res.data?.data || res.data || [])
      } catch (e: any) {
        toast({ title: "Failed to load drawings", description: e.message, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Drawing Register</h1>
        <p className="text-muted-foreground">Upload drawings via API /admin/ecpm/drawings (multipart). Revisions create approval requests.</p>
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
        <Card><CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="p-3">Number</th><th className="p-3">Title</th><th className="p-3">Discipline</th><th className="p-3">Rev</th><th className="p-3">Status</th></tr></thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td className="p-6 text-muted-foreground" colSpan={5}>No drawings yet. POST multipart to /admin/ecpm/drawings with project_id, title, file.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-3 font-mono text-xs">{r.drawing_number}</td>
                  <td className="p-3">{r.title}</td>
                  <td className="p-3">{r.discipline}</td>
                  <td className="p-3">{r.current_revision}</td>
                  <td className="p-3">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent></Card>
      )}
    </div>
  )
}
