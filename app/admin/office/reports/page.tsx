"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { exportOfficeReport, getOfficeReportSummary } from "@/lib/api/office"
import { Loader2 } from "lucide-react"

export default function OfficeReportsPage() {
  const { toast } = useToast()
  const [data, setData] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getOfficeReportSummary()
        setData(res.data)
      } catch (e: any) {
        toast({ title: "Failed to load reports", description: e.message, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const download = async (type: string) => {
    try {
      const blob = await exportOfficeReport(type)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `office-${type}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      toast({ title: "Export failed", description: e.message, variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-6 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading reports…
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Office Reports</h1>
          <p className="text-muted-foreground">Workload, turnaround indicators, and CSV exports.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => download("documents")}>
            Export documents CSV
          </Button>
          <Button variant="outline" onClick={() => download("tasks")}>
            Export tasks CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Created", data?.documents_created],
          ["Approved", data?.documents_approved],
          ["Rejected", data?.documents_rejected],
          ["Pending approvals", data?.pending_approvals],
          ["Overdue actions", data?.overdue_minute_actions],
          ["Archived", data?.archived],
          ["Legal hold", data?.legal_hold],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">{label}</CardTitle>
              <div className="text-3xl font-semibold">{value ?? 0}</div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By status</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-3 text-sm">
          {Object.entries(data?.by_status || {}).map(([k, v]) => (
            <div key={k} className="rounded border px-3 py-2 capitalize">
              {k.replace("_", " ")}: <strong>{String(v)}</strong>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
