"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { decideEcpmApproval, listEcpmApprovals } from "@/lib/api/ecpm"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function EcpmApprovalsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<any[]>([])

  const load = async () => {
    try {
      setLoading(true)
      const res = await listEcpmApprovals()
      setRows(res.data?.data || res.data || [])
    } catch (e: any) {
      toast({ title: "Failed to load approvals", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const decide = async (id: string, status: "approved" | "rejected") => {
    try {
      await decideEcpmApproval(id, { status })
      toast({ title: `Marked ${status}` })
      await load()
    } catch (e: any) {
      toast({ title: "Action failed", description: e.message, variant: "destructive" })
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Approvals Inbox</h1>
        <p className="text-muted-foreground">Pending drawings, BOQs, quotations and contracts</p>
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
        <Card><CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="p-3">Type</th><th className="p-3">Entity</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td className="p-6 text-muted-foreground" colSpan={4}>No pending approvals</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-3 text-xs">{String(r.approvable_type || "").split("\\").pop()}</td>
                  <td className="p-3 font-mono text-xs">{r.approvable_id}</td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3 space-x-2">
                    <Button size="sm" onClick={() => decide(r.id, "approved")}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => decide(r.id, "rejected")}>Reject</Button>
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
