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
import { formatMarketplacePrice, type MarketplaceListing } from "@/lib/api/marketplace"
import { Check, X, RotateCcw, Loader2 } from "lucide-react"
import { toast } from "sonner"

type ModerationItem = MarketplaceListing & {
  marketplace_requested?: boolean
  rejection_reason?: string | null
}

export default function SuperAdminMarketplacePage() {
  const [status, setStatus] = useState("pending")
  const [q, setQ] = useState("")
  const [items, setItems] = useState<ModerationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status, marketplace_requested: "true" })
      if (q) params.set("q", q)
      const res = await apiFetch<{ success: boolean; data: ModerationItem[] }>(
        `/super-admin/marketplace?${params.toString()}`
      )
      setItems(res.data || [])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load marketplace queue")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, q])

  const approve = async (id: string) => {
    setBusyId(id)
    try {
      await apiFetch(`/super-admin/marketplace/${id}/approve`, { method: "POST", body: {} })
      toast.success("Listing verified and published")
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
      await apiFetch(`/super-admin/marketplace/${id}/reject`, {
        method: "POST",
        body: { reason: rejectReason },
      })
      toast.success("Listing rejected")
      setRejectingId(null)
      setRejectReason("")
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reject failed")
    } finally {
      setBusyId(null)
    }
  }

  const revoke = async (id: string) => {
    setBusyId(id)
    try {
      await apiFetch(`/super-admin/marketplace/${id}/revoke`, {
        method: "POST",
        body: { reason: "Revoked by platform admin" },
      })
      toast.success("Verification revoked")
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Revoke failed")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marketplace moderation</h1>
        <p className="text-muted-foreground mt-1">
          Review landlord and cooperative listings before they appear on smarthousing.com.ng.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Search title or vendor…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading queue…
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">No listings in this queue.</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.marketplace_id || item.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{item.title || item.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.tenant_name} · {item.tenant_slug} · {item.listing_kind}
                    </p>
                  </div>
                  <VerificationBadge status={item.verification_status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-3 text-sm">
                  <Badge variant="outline">{formatMarketplacePrice(item.price)}</Badge>
                  {item.location && <span className="text-muted-foreground">{item.location}</span>}
                  {item.slots_available != null && <span>{item.slots_available} slots left</span>}
                </div>
                {item.rejection_reason && (
                  <p className="text-sm text-destructive">Reason: {item.rejection_reason}</p>
                )}
                {rejectingId === (item.marketplace_id || "") && (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Rejection reason"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={busyId === item.marketplace_id}
                        onClick={() => reject(item.marketplace_id!)}
                      >
                        Confirm reject
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setRejectingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {item.verification_status !== "verified" && (
                    <Button
                      size="sm"
                      className="gap-1"
                      disabled={busyId === item.marketplace_id}
                      onClick={() => approve(item.marketplace_id!)}
                    >
                      <Check className="h-4 w-4" /> Approve
                    </Button>
                  )}
                  {item.verification_status !== "rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => {
                        setRejectingId(item.marketplace_id || null)
                        setRejectReason("")
                      }}
                    >
                      <X className="h-4 w-4" /> Reject
                    </Button>
                  )}
                  {item.verification_status === "verified" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-1"
                      disabled={busyId === item.marketplace_id}
                      onClick={() => revoke(item.marketplace_id!)}
                    >
                      <RotateCcw className="h-4 w-4" /> Revoke
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
