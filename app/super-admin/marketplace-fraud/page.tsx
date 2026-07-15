"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiFetch } from "@/lib/api/client"
import { formatMarketplacePrice, type MarketplaceListing } from "@/lib/api/marketplace"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

type FraudCase = {
  id: string
  status: string
  reason: string
  details?: string | null
  reporter_email?: string | null
  created_at?: string
  listing?: MarketplaceListing | null
}

export default function MarketplaceFraudPage() {
  const [status, setStatus] = useState("open")
  const [items, setItems] = useState<FraudCase[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    apiFetch<{ data: FraudCase[] }>(`/super-admin/marketplace-fraud?status=${status}`)
      .then((res) => setItems(res.data || []))
      .catch(() => toast.error("Could not load fraud queue"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [status])

  const updateStatus = async (id: string, next: string) => {
    setBusyId(id)
    try {
      await apiFetch(`/super-admin/marketplace-fraud/${id}/status`, {
        method: "POST",
        body: JSON.stringify({ status: next }),
      })
      toast.success("Case updated")
      load()
    } catch {
      toast.error("Update failed")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Fraud & trust queue</h1>
          <p className="text-muted-foreground mt-1">Review buyer reports and duplicate listing signals.</p>
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">No cases in this queue.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((c) => (
            <Card key={c.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <CardTitle className="text-base">{c.listing?.name || "Listing"}</CardTitle>
                  <Badge variant="outline">{c.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>
                  <span className="font-medium">Reason:</span> {c.reason}
                </p>
                {c.details && <p className="text-muted-foreground">{c.details}</p>}
                {c.listing?.price != null && (
                  <p>Price: {formatMarketplacePrice(c.listing.price)} · {c.listing.location}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {c.reporter_email || "Anonymous"} · {c.created_at ? new Date(c.created_at).toLocaleString() : ""}
                </p>
                <div className="flex flex-wrap gap-2">
                  {["reviewing", "resolved", "dismissed"].map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant="outline"
                      disabled={busyId === c.id}
                      onClick={() => updateStatus(c.id, s)}
                    >
                      Mark {s}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
