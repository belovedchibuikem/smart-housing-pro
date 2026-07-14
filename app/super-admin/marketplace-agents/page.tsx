"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiFetch } from "@/lib/api/client"
import { VerificationBadge } from "@/components/marketplace/verification-badge"
import type { MarketplaceAgent } from "@/lib/api/marketplace"
import { Check, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function SuperAdminMarketplaceAgentsPage() {
  const [status, setStatus] = useState("pending")
  const [items, setItems] = useState<MarketplaceAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const load = async () => {
    setLoading(true)
    try {
      const res = await apiFetch<{ success: boolean; data: MarketplaceAgent[] }>(
        `/super-admin/marketplace-agents?status=${status}`
      )
      setItems(res.data || [])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load agents")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const approve = async (id: string) => {
    setBusyId(id)
    try {
      await apiFetch(`/super-admin/marketplace-agents/${id}/approve`, { method: "POST", body: {} })
      toast.success("Agent verified")
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Approve failed")
    } finally {
      setBusyId(null)
    }
  }

  const reject = async (id: string) => {
    if (!rejectReason.trim()) {
      toast.error("Provide a rejection reason")
      return
    }
    setBusyId(id)
    try {
      await apiFetch(`/super-admin/marketplace-agents/${id}/reject`, {
        method: "POST",
        body: { reason: rejectReason },
      })
      toast.success("Agent rejected")
      setRejectingId(null)
      setRejectReason("")
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reject failed")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Agent verification</h1>
        <p className="text-muted-foreground text-sm">Review REA license applications before agents appear publicly.</p>
      </div>

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="verified">Verified</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="all">All</SelectItem>
        </SelectContent>
      </Select>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No agents in this queue.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {items.map((agent) => (
            <Card key={agent.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-lg">{agent.display_name}</CardTitle>
                  <VerificationBadge status={agent.is_verified ? "verified" : "pending"} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>{agent.email}</p>
                {agent.rea_license_number && (
                  <Badge variant="outline">REA {agent.rea_license_number}</Badge>
                )}
                {agent.bio && <p className="text-muted-foreground">{agent.bio}</p>}
                {status === "pending" && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button size="sm" onClick={() => approve(agent.id)} disabled={busyId === agent.id}>
                      {busyId === agent.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setRejectingId(agent.id)}>
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}
                {rejectingId === agent.id && (
                  <div className="space-y-2 border-t pt-3">
                    <Textarea
                      placeholder="Rejection reason…"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <Button size="sm" variant="destructive" onClick={() => reject(agent.id)} disabled={busyId === agent.id}>
                      Confirm reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
