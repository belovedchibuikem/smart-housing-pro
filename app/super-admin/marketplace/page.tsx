"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { apiFetch } from "@/lib/api/client"
import { VerificationBadge } from "@/components/marketplace/verification-badge"
import { formatMarketplacePrice, type MarketplaceListing } from "@/lib/api/marketplace"
import { Check, X, RotateCcw, Loader2, Wrench, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

type ModerationItem = MarketplaceListing & {
  marketplace_requested?: boolean
  rejection_reason?: string | null
}

type SetupStatus = {
  central_schema_ready: boolean
  central_tables: {
    marketplace_listings: boolean
    tenant_details_vendor_fields: boolean
  }
  tenant_count: number
  tenants: Array<{
    tenant_id: string
    slug: string | null
    database_exists: boolean
    properties_marketplace_requested: boolean | null
    lands_marketplace_requested: boolean | null
    error?: string
  }>
  central_listings: {
    total: number
    pending_moderation: number
    published: number
  }
}

type SetupRunResult = {
  success: boolean
  messages: string[]
  central_schema?: { executed: number; skipped: number; errors: string[] } | null
  tenant_schemas?: Array<{
    tenant_id: string
    slug: string | null
    skipped: boolean
    reason?: string | null
    schema?: { executed: number; skipped: number; errors: string[] } | null
  }>
  reindex?: {
    synced: number
    requested: number
    approved: number
    errors: number
  } | null
  status?: SetupStatus
}

export default function SuperAdminMarketplacePage() {
  const [status, setStatus] = useState("pending")
  const [q, setQ] = useState("")
  const [items, setItems] = useState<ModerationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)

  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null)
  const [setupLoading, setSetupLoading] = useState(true)
  const [setupRunning, setSetupRunning] = useState(false)
  const [setupTenant, setSetupTenant] = useState("")
  const [setupRequestPublish, setSetupRequestPublish] = useState(true)
  const [setupApprove, setSetupApprove] = useState(false)
  const [setupRunCentral, setSetupRunCentral] = useState(true)
  const [setupRunTenant, setSetupRunTenant] = useState(true)
  const [lastSetupResult, setLastSetupResult] = useState<SetupRunResult | null>(null)

  const loadSetupStatus = async () => {
    setSetupLoading(true)
    try {
      const res = await apiFetch<{ success: boolean; data: SetupStatus }>("/super-admin/marketplace/setup/status")
      setSetupStatus(res.data)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load setup status")
    } finally {
      setSetupLoading(false)
    }
  }

  const runSetup = async () => {
    if (
      !window.confirm(
        "Run marketplace setup? This applies schema updates and syncs legacy tenant listings into the moderation queue."
      )
    ) {
      return
    }

    setSetupRunning(true)
    setLastSetupResult(null)
    try {
      const res = await apiFetch<{ success: boolean; message: string; data: SetupRunResult }>(
        "/super-admin/marketplace/setup/run",
        {
          method: "POST",
          body: {
            confirm: true,
            tenant: setupTenant.trim() || undefined,
            run_central_schema: setupRunCentral,
            run_tenant_schema: setupRunTenant,
            request_publish: setupRequestPublish,
            approve: setupApprove,
          },
        }
      )
      setLastSetupResult(res.data)
      if (res.success) {
        toast.success(res.message || "Marketplace setup completed")
      } else {
        toast.warning(res.message || "Setup finished with warnings — review the log below")
      }
      await loadSetupStatus()
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Setup failed")
    } finally {
      setSetupRunning(false)
    }
  }

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
    loadSetupStatus()
  }, [])

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

      <Card className="border-amber-200/60 bg-amber-50/40 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wrench className="h-5 w-5" />
            Marketplace setup (no SSH required)
          </CardTitle>
          <CardDescription>
            Use this once after deploy to apply marketplace database changes and import legacy tenant properties
            (e.g. FRSC) into the moderation queue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {setupLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Checking setup status…
            </div>
          ) : setupStatus ? (
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant={setupStatus.central_schema_ready ? "default" : "secondary"}>
                Central schema {setupStatus.central_schema_ready ? "ready" : "needs setup"}
              </Badge>
              <Badge variant="outline">{setupStatus.central_listings.total} central listings</Badge>
              <Badge variant="outline">{setupStatus.central_listings.pending_moderation} pending</Badge>
              <Badge variant="outline">{setupStatus.central_listings.published} published</Badge>
              <Badge variant="outline">{setupStatus.tenant_count} tenants</Badge>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="setup-tenant">Tenant slug (optional)</Label>
              <Input
                id="setup-tenant"
                placeholder="e.g. frsc — leave empty for all tenants"
                value={setupTenant}
                onChange={(e) => setSetupTenant(e.target.value)}
              />
            </div>
            <div className="space-y-3 text-sm">
              <label className="flex items-center gap-2">
                <Checkbox checked={setupRunCentral} onCheckedChange={(v) => setSetupRunCentral(Boolean(v))} />
                Apply central marketplace schema
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={setupRunTenant} onCheckedChange={(v) => setSetupRunTenant(Boolean(v))} />
                Apply tenant marketplace schema
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={setupRequestPublish}
                  onCheckedChange={(v) => setSetupRequestPublish(Boolean(v))}
                />
                Request publish for browsable legacy listings
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={setupApprove} onCheckedChange={(v) => setSetupApprove(Boolean(v))} />
                Auto-approve after sync (skip moderation)
              </label>
            </div>
          </div>

          {setupApprove && (
            <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-100/50 dark:bg-amber-950/40 p-3 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" />
              <span>
                Auto-approve publishes listings immediately without manual review. Leave unchecked to approve from the
                queue below.
              </span>
            </div>
          )}

          <Button onClick={runSetup} disabled={setupRunning} className="gap-2">
            {setupRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />}
            Run marketplace setup
          </Button>

          {lastSetupResult && (
            <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-2">
              <p className="font-medium">{lastSetupResult.success ? "Setup completed" : "Setup completed with issues"}</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {lastSetupResult.messages?.map((msg) => (
                  <li key={msg}>{msg}</li>
                ))}
              </ul>
              {lastSetupResult.reindex && (
                <p className="text-muted-foreground">
                  Synced {lastSetupResult.reindex.synced}, requested {lastSetupResult.reindex.requested}, approved{" "}
                  {lastSetupResult.reindex.approved}, errors {lastSetupResult.reindex.errors}.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
