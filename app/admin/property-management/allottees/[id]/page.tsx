"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { apiFetch, getPropertyAllottee } from "@/lib/api/client"
import { Can } from "@/components/admin/can-permission"

type TenureSummary = {
  sale_price: number
  amount_paid: number
  outstanding: number
  payment_progress_percent?: number | null
  payment_status?: string | null
  tenure_status: string
  owner_sequence: number | null
  owner_label: string | null
  deed_ready: boolean
  allocation: {
    id: string
    property_slot_id?: string | null
    slot_number?: number | null
    slot_label?: string | null
    unit_address?: string | null
    property?: { title?: string }
    member?: { user?: { first_name?: string; last_name?: string }; member_number?: string }
  }
  payments?: Array<{ id: string; amount: number; paid_at?: string; source?: string; reference?: string }>
  documents?: Array<{ id: string; document_type: string; status: string; file_path?: string }>
}

type AllotteeSlotMeta = {
  property_slot_id?: string | null
  slot_number?: number | null
  slot_label?: string | null
  payment_progress_percent?: number | null
  payment_status?: string | null
  outstanding?: number | null
}

export default function AllotteeTenurePage() {
  const params = useParams()
  const allotteeId = params?.id as string
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<TenureSummary | null>(null)
  const [slotMeta, setSlotMeta] = useState<AllotteeSlotMeta | null>(null)
  const [repayAmount, setRepayAmount] = useState("")
  const [repayDesc, setRepayDesc] = useState("")
  const [busy, setBusy] = useState(false)
  const [overrideReason, setOverrideReason] = useState("")
  const [deedFile, setDeedFile] = useState<File | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [tenureRes, allotteeRes] = await Promise.all([
        apiFetch<{ success: boolean; data: TenureSummary }>(
          `/admin/property-management/tenures/houses/${allotteeId}`
        ),
        getPropertyAllottee(allotteeId).catch(() => null),
      ])
      if (tenureRes.success) setSummary(tenureRes.data)
      if (allotteeRes?.success && allotteeRes.data) {
        setSlotMeta({
          property_slot_id: allotteeRes.data.property_slot_id,
          slot_number: allotteeRes.data.slot_number,
          slot_label: allotteeRes.data.slot_label,
          payment_progress_percent: allotteeRes.data.payment_progress_percent,
          payment_status: allotteeRes.data.payment_status,
          outstanding: allotteeRes.data.outstanding,
        })
      }
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to load tenure",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [allotteeId, toast])

  useEffect(() => {
    if (allotteeId) void load()
  }, [allotteeId, load])

  const recordRepayment = async () => {
    setBusy(true)
    try {
      await apiFetch(`/admin/property-management/tenures/houses/${allotteeId}/repayments`, {
        method: "POST",
        body: JSON.stringify({
          amount: Number(repayAmount),
          description: repayDesc || "Admin repayment",
          allow_overpay: true,
        }),
      })
      toast({ title: "Repayment recorded" })
      setRepayAmount("")
      setRepayDesc("")
      await load()
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed",
        variant: "destructive",
      })
    } finally {
      setBusy(false)
    }
  }

  const uploadDeed = async () => {
    if (!deedFile) {
      toast({ title: "Select a deed file first", variant: "destructive" })
      return
    }
    setBusy(true)
    try {
      const form = new FormData()
      form.append("file", deedFile)
      form.append("status", "uploaded")
      const token = localStorage.getItem("auth_token") || localStorage.getItem("token")
      const tenantSlug = localStorage.getItem("tenant_slug")
      const res = await fetch(`/api/admin/property-management/tenures/houses/${allotteeId}/deed`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(tenantSlug ? { "X-Tenant-Slug": tenantSlug } : {}),
        },
        body: form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Upload failed")
      toast({ title: "Deed uploaded" })
      setDeedFile(null)
      await load()
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed",
        variant: "destructive",
      })
    } finally {
      setBusy(false)
    }
  }

  const markSold = async (override = false) => {
    setBusy(true)
    try {
      await apiFetch(`/admin/property-management/tenures/houses/${allotteeId}/mark-sold`, {
        method: "POST",
        body: JSON.stringify(
          override
            ? { override_deed: true, override_reason: overrideReason }
            : {}
        ),
      })
      toast({ title: "Marked as sold — owner sequence assigned" })
      await load()
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed",
        variant: "destructive",
      })
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!summary) {
    return <p className="p-6 text-muted-foreground">Tenure not found.</p>
  }

  const memberName = [
    summary.allocation?.member?.user?.first_name,
    summary.allocation?.member?.user?.last_name,
  ]
    .filter(Boolean)
    .join(" ")

  const slotLabel =
    slotMeta?.slot_label ||
    summary.allocation?.slot_label ||
    (slotMeta?.slot_number != null
      ? `Slot #${slotMeta.slot_number}`
      : summary.allocation?.slot_number != null
        ? `Slot #${summary.allocation.slot_number}`
        : summary.allocation?.unit_address || null)
  const progressPercent =
    slotMeta?.payment_progress_percent != null
      ? Math.round(Number(slotMeta.payment_progress_percent))
      : summary.payment_progress_percent != null
        ? Math.round(Number(summary.payment_progress_percent))
        : summary.sale_price > 0
          ? Math.round((Number(summary.amount_paid) / Number(summary.sale_price)) * 100)
          : null
  const paymentStatus = slotMeta?.payment_status ?? summary.payment_status
  const outstanding =
    slotMeta?.outstanding != null ? Number(slotMeta.outstanding) : Number(summary.outstanding)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/property-management/allottees">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">House tenure & ownership</h1>
          <p className="text-muted-foreground mt-1">
            {summary.allocation?.property?.title ?? "Property"}
            {slotLabel ? ` · ${slotLabel}` : ""}
            {" · "}
            {memberName || "Member"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Slot</CardDescription>
            <CardTitle className="text-lg">{slotLabel || "—"}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sale price</CardDescription>
            <CardTitle>₦{Number(summary.sale_price).toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Amount paid</CardDescription>
            <CardTitle>₦{Number(summary.amount_paid).toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Outstanding</CardDescription>
            <CardTitle>₦{outstanding.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Progress / tenure</CardDescription>
            <CardTitle className="text-lg capitalize">
              {progressPercent != null ? `${progressPercent}%` : "—"}
              {paymentStatus ? ` · ${paymentStatus.replace(/_/g, " ")}` : ""}
              <span className="mt-1 block text-sm font-normal text-muted-foreground capitalize">
                {summary.tenure_status}
                {summary.owner_label ? ` · ${summary.owner_label}` : ""}
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Record repayment</CardTitle>
            <CardDescription>Credits this member&apos;s current tenure only</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={repayDesc} onChange={(e) => setRepayDesc(e.target.value)} />
            </div>
            <Can permission="manage_payments|manage_property_allottees">
              <Button onClick={recordRepayment} disabled={busy || !repayAmount}>
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Record repayment
              </Button>
            </Can>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deed of Assignment</CardTitle>
            <CardDescription>
              Upload executed/registered deed before marking sold (or override with reason)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Deed ready: {summary.deed_ready ? "Yes" : "No"}
            </p>
            <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setDeedFile(e.target.files?.[0] ?? null)} />
            <Can permission="manage_property_allottees|approve_allotments">
              <Button variant="outline" onClick={uploadDeed} disabled={busy || !deedFile}>
                <Upload className="mr-2 h-4 w-4" />
                Upload deed
              </Button>
            </Can>
            {summary.tenure_status === "allocation" ? (
              <div className="space-y-3 border-t pt-4">
                <Can permission="manage_property_allottees|approve_allotments">
                  <Button onClick={() => markSold(false)} disabled={busy}>
                    Mark as Sold
                  </Button>
                </Can>
                <div className="space-y-2">
                  <Label>Override reason (if deed not uploaded)</Label>
                  <Textarea value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} rows={2} />
                  <Button variant="secondary" onClick={() => markSold(true)} disabled={busy || !overrideReason.trim()}>
                    Mark sold with override
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payments on this tenure</CardTitle>
        </CardHeader>
        <CardContent>
          {(summary.payments ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {(summary.payments ?? []).map((p) => (
                <li key={p.id} className="flex justify-between border-b py-2">
                  <span>
                    ₦{Number(p.amount).toLocaleString()} · {p.source ?? "cash"}
                    {p.reference ? ` · ${p.reference}` : ""}
                  </span>
                  <span className="text-muted-foreground">{p.paid_at?.slice(0, 10) ?? "—"}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
