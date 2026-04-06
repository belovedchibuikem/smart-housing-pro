"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  getAdminBulkMemberSubscriptionPackages,
  getAdminBulkMemberSubscriptionPaymentMethods,
  initializeAdminBulkMemberSubscription,
  uploadPaymentEvidence,
  apiFetch,
  type BulkMemberSubscriptionLine,
} from "@/lib/api/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Plus, Trash2, AlertCircle, ArrowLeft, Users, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Pkg {
  id: string
  name: string
  price: number
  duration_days?: number
}

interface PayMethod {
  id: string
  name: string
  description: string
  is_enabled: boolean
  configuration?: Record<string, unknown>
}

interface MemberOpt {
  id: string
  member_number?: string
  first_name?: string
  last_name?: string
  email?: string
  user?: { first_name?: string; last_name?: string; email?: string }
}

function formatNgn(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n)
}

export default function AdminBulkMemberSubscriptionsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [packages, setPackages] = useState<Pkg[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PayMethod[]>([])
  const [members, setMembers] = useState<MemberOpt[]>([])
  const [memberSearch, setMemberSearch] = useState("")
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [lines, setLines] = useState<BulkMemberSubscriptionLine[]>([])
  const [paymentMethod, setPaymentMethod] = useState("")
  const [notes, setNotes] = useState("")
  const [payerName, setPayerName] = useState("")
  const [payerPhone, setPayerPhone] = useState("")
  const [accountDetails, setAccountDetails] = useState("")
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([])
  const [uploadingEv, setUploadingEv] = useState(false)
  const [pickMemberId, setPickMemberId] = useState<string>("")
  const [pickPackageId, setPickPackageId] = useState<string>("")

  const loadCore = useCallback(async () => {
    setLoading(true)
    try {
      const [pkgRes, pmRes] = await Promise.all([
        getAdminBulkMemberSubscriptionPackages(),
        getAdminBulkMemberSubscriptionPaymentMethods(),
      ])
      setPackages(pkgRes.packages || [])
      const enabled = (pmRes.payment_methods || []).filter((m) => m.is_enabled)
      setPaymentMethods(enabled)
      const first = enabled.find((m) => m.id !== "stripe")?.id || enabled[0]?.id || ""
      setPaymentMethod(first)
    } catch (e: unknown) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadCore()
  }, [loadCore])

  const searchMembers = useCallback(async () => {
    setLoadingMembers(true)
    try {
      const params = new URLSearchParams({ per_page: "100", page: "1" })
      if (memberSearch.trim()) params.set("search", memberSearch.trim())
      const raw = await apiFetch<{ members?: MemberOpt[]; data?: MemberOpt[] }>(
        `/admin/members?${params.toString()}`
      )
      const list = raw.members || raw.data || []
      setMembers(list)
    } catch {
      setMembers([])
    } finally {
      setLoadingMembers(false)
    }
  }, [memberSearch])

  useEffect(() => {
    const t = setTimeout(searchMembers, 300)
    return () => clearTimeout(t)
  }, [memberSearch, searchMembers])

  const selectedPm = paymentMethods.find((m) => m.id === paymentMethod)
  const isManual = paymentMethod === "manual"
  const manualCfg = (selectedPm?.configuration || {}) as {
    require_payer_name?: boolean
    require_payer_phone?: boolean
    require_account_details?: boolean
    require_payment_evidence?: boolean
  }

  const addLine = (memberId: string, packageId: string) => {
    if (!memberId || !packageId) return
    if (lines.some((l) => l.member_id === memberId)) {
      toast({ title: "Already added", description: "That member is already in the batch." })
      return
    }
    setLines((prev) => [...prev, { member_id: memberId, package_id: packageId }])
  }

  const removeLine = (idx: number) => {
    setLines((prev) => prev.filter((_, i) => i !== idx))
  }

  const lineTotal = (packageId: string) => {
    const p = packages.find((x) => x.id === packageId)
    return p?.price ?? 0
  }

  const grandTotal = lines.reduce((s, l) => s + lineTotal(l.package_id), 0)

  const handleEvidence = async (files: FileList | null) => {
    if (!files?.length) return
    setUploadingEv(true)
    try {
      const urls: string[] = []
      for (const f of Array.from(files)) {
        const url = await uploadPaymentEvidence(f)
        urls.push(url)
      }
      setEvidenceUrls((prev) => [...prev, ...urls])
      setEvidenceFiles([])
    } catch (e: unknown) {
      toast({
        title: "Upload failed",
        description: e instanceof Error ? e.message : "Could not upload",
        variant: "destructive",
      })
    } finally {
      setUploadingEv(false)
    }
  }

  const submit = async () => {
    if (lines.length === 0) {
      toast({ title: "Add members", description: "Add at least one member and package.", variant: "destructive" })
      return
    }
    if (!paymentMethod) {
      toast({ title: "Payment method", description: "Choose a payment method.", variant: "destructive" })
      return
    }
    setSubmitting(true)
    try {
      const body: Parameters<typeof initializeAdminBulkMemberSubscription>[0] = {
        lines,
        payment_method: paymentMethod,
        notes: notes || undefined,
      }
      if (isManual) {
        if (manualCfg.require_payer_name !== false) body.payer_name = payerName
        if (manualCfg.require_payer_phone) body.payer_phone = payerPhone
        if (manualCfg.require_account_details) body.account_details = accountDetails
        if (manualCfg.require_payment_evidence !== false && evidenceUrls.length > 0) {
          body.payment_evidence = evidenceUrls
        }
      }
      const res = await initializeAdminBulkMemberSubscription(body)
      if (!res.success) {
        throw new Error(res.message || "Initialization failed")
      }
      if (res.requires_approval || paymentMethod === "manual") {
        toast({
          title: "Submitted",
          description: "Awaiting payment approval. You can track it under Payment approvals.",
        })
        setLines([])
        setEvidenceUrls([])
        return
      }
      if (paymentMethod === "wallet") {
        toast({ title: "Paid", description: `${formatNgn(res.total_amount || grandTotal)} charged from wallet.` })
        setLines([])
        return
      }
      const payUrl = res.payment_url
      if (payUrl) {
        window.location.href = payUrl
        return
      }
      toast({ title: "Next step", description: "Complete payment if redirected, or check payment status." })
    } catch (e: unknown) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Request failed",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Loading…
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/members">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Members
          </Link>
        </Button>
      </div>
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          Bulk member subscriptions
        </h1>
        <p className="text-muted-foreground mt-1">
          Pay for multiple members in one transaction using the same platform payment gateways (Paystack, Remita, manual,
          or organisation wallet).
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Super admin gateway</AlertTitle>
        <AlertDescription>
          Charges use the platform payment settings configured by the super admin, consistent with individual member
          checkout. Super admins see these as bulk transactions with a per-member breakdown.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Add lines</CardTitle>
          <CardDescription>Search members, pick a package, then add to the batch.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Search members</Label>
              <Input
                placeholder="Name, email, member number…"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
              />
              {loadingMembers ? (
                <p className="text-sm text-muted-foreground">Searching…</p>
              ) : (
                <Select value={pickMemberId || undefined} onValueChange={setPickMemberId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select member…" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => {
                      const nm =
                        [m.first_name || m.user?.first_name, m.last_name || m.user?.last_name]
                          .filter(Boolean)
                          .join(" ") ||
                        m.email ||
                        m.user?.email ||
                        "Member"
                      return (
                        <SelectItem key={m.id} value={m.id}>
                          {nm}
                          {m.member_number ? ` (#${m.member_number})` : ""}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>Package for new line</Label>
              <Select value={pickPackageId || undefined} onValueChange={setPickPackageId}>
                <SelectTrigger>
                  <SelectValue placeholder="Package" />
                </SelectTrigger>
                <SelectContent>
                  {packages.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — {formatNgn(p.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (pickMemberId && pickPackageId) addLine(pickMemberId, pickPackageId)
            }}
            disabled={!pickMemberId || !pickPackageId}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add to batch
          </Button>
          <p className="text-sm text-muted-foreground">
            {members.length === 0 && !loadingMembers
              ? "No members match. Try a different search."
              : `${members.length} member(s) shown (max 100).`}
          </p>

          {lines.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line, idx) => {
                  const m = members.find((x) => x.id === line.member_id)
                  const p = packages.find((x) => x.id === line.package_id)
                  const label =
                    m &&
                    ([m.first_name || m.user?.first_name, m.last_name || m.user?.last_name]
                      .filter(Boolean)
                      .join(" ") ||
                      m.email ||
                      m.user?.email ||
                      "Member")
                  return (
                    <TableRow key={`${line.member_id}-${idx}`}>
                      <TableCell>
                        {label || line.member_id.slice(0, 8)}
                        {m?.member_number ? ` (#${m.member_number})` : ""}
                      </TableCell>
                      <TableCell>{p?.name ?? line.package_id}</TableCell>
                      <TableCell className="text-right">{formatNgn(lineTotal(line.package_id))}</TableCell>
                      <TableCell>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeLine(idx)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {lines.length > 0 && (
            <div className="flex justify-end text-lg font-semibold">Total: {formatNgn(grandTotal)}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
          <CardDescription>Choose how the organisation pays for this batch.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((m) => (
                  <SelectItem key={m.id} value={m.id} disabled={m.id === "stripe"}>
                    {m.name}
                    {m.id === "stripe" ? " (unavailable)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          {isManual && (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
              {manualCfg.require_payer_name !== false && (
                <div className="space-y-2">
                  <Label>Payer name</Label>
                  <Input value={payerName} onChange={(e) => setPayerName(e.target.value)} />
                </div>
              )}
              {manualCfg.require_payer_phone && (
                <div className="space-y-2">
                  <Label>Payer phone</Label>
                  <Input value={payerPhone} onChange={(e) => setPayerPhone(e.target.value)} />
                </div>
              )}
              {manualCfg.require_account_details && (
                <div className="space-y-2">
                  <Label>Account details</Label>
                  <Textarea value={accountDetails} onChange={(e) => setAccountDetails(e.target.value)} rows={2} />
                </div>
              )}
              {manualCfg.require_payment_evidence !== false && (
                <div className="space-y-2">
                  <Label>Payment evidence</Label>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Button type="button" variant="outline" size="sm" disabled={uploadingEv} asChild>
                      <label className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-1 inline" />
                        Upload
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,application/pdf"
                          multiple
                          onChange={(e) => handleEvidence(e.target.files)}
                        />
                      </label>
                    </Button>
                    {uploadingEv && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                  {evidenceUrls.length > 0 && (
                    <ul className="text-sm space-y-1">
                      {evidenceUrls.map((u, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <a href={u} target="_blank" rel="noreferrer" className="text-primary underline truncate max-w-xs">
                            File {i + 1}
                          </a>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setEvidenceUrls((prev) => prev.filter((_, j) => j !== i))}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {(manualCfg.bank_accounts as { bank_name?: string }[] | undefined)?.length ? (
                <div className="text-sm text-muted-foreground">
                  Pay into the bank account(s) shown in your manual gateway configuration, then submit evidence.
                </div>
              ) : null}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={submit} disabled={submitting || lines.length === 0}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Pay bulk total
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/dashboard">Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
