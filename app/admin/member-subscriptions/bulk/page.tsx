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
  previewAdminBulkMemberSubscription,
  initializeAdminBulkMemberSubscription,
  uploadPaymentEvidence,
  apiFetch,
  type BulkMemberSubscriptionLine,
} from "@/lib/api/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  Loader2,
  Plus,
  Trash2,
  AlertCircle,
  ArrowLeft,
  Users,
  Upload,
  X,
  CheckCircle2,
  Clock,
} from "lucide-react"
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

function parseUuidList(text: string): string[] {
  const raw = text.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean)
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return [...new Set(raw.filter((s) => uuidRe.test(s)))]
}

type BulkSubmissionOutcome =
  | {
      kind: "awaiting_approval"
      bulk_batch_id?: string
      reference?: string
      member_count?: number
      total_amount?: number
    }
  | {
      kind: "wallet_paid"
      member_count?: number
      total_amount: number
    }
  | {
      kind: "followup"
      detail: string
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
  const [batchTab, setBatchTab] = useState<"mass" | "custom">("mass")
  const [massPackageId, setMassPackageId] = useState<string>("")
  const [massScope, setMassScope] = useState<"all_active" | "selected_ids">("all_active")
  const [massSearch, setMassSearch] = useState("")
  const [idsTextarea, setIdsTextarea] = useState("")
  const [previewResult, setPreviewResult] = useState<{
    member_count: number
    total_amount: number
    package_name?: string
    unit_price?: number
  } | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [submissionOutcome, setSubmissionOutcome] = useState<BulkSubmissionOutcome | null>(null)

  const loadCore = useCallback(async () => {
    setLoading(true)
    try {
      const [pkgRes, pmRes] = await Promise.all([
        getAdminBulkMemberSubscriptionPackages(),
        getAdminBulkMemberSubscriptionPaymentMethods(),
      ])
      const pkgs = pkgRes.packages || []
      setPackages(pkgs)
      if (pkgs[0]?.id) {
        setPickPackageId(pkgs[0].id)
        setMassPackageId(pkgs[0].id)
      }
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
  const massAudienceReady =
    massScope === "all_active" || parseUuidList(idsTextarea).length > 0
  const batchReady =
    batchTab === "custom"
      ? lines.length > 0
      : Boolean(massPackageId && massAudienceReady)
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

  const runPreview = async () => {
    setPreviewLoading(true)
    setPreviewResult(null)
    try {
      if (batchTab === "custom") {
        if (lines.length === 0) {
          toast({ title: "Nothing to preview", description: "Add at least one line, or use the large batch tab." })
          return
        }
        const res = await previewAdminBulkMemberSubscription({ lines })
        if (!res.success) throw new Error(typeof res.message === "string" ? res.message : "Preview failed")
        setPreviewResult({
          member_count: res.member_count ?? 0,
          total_amount: res.total_amount ?? 0,
          package_name: res.package_name,
          unit_price: res.unit_price,
        })
        return
      }
      if (!massPackageId) {
        toast({ title: "Package required", description: "Choose a subscription package." })
        return
      }
      if (massScope === "all_active") {
        const res = await previewAdminBulkMemberSubscription({
          package_id: massPackageId,
          member_scope: "all_active",
          member_search: massSearch.trim() || undefined,
        })
        if (!res.success) throw new Error(typeof res.message === "string" ? res.message : "Preview failed")
        setPreviewResult({
          member_count: res.member_count ?? 0,
          total_amount: res.total_amount ?? 0,
          package_name: res.package_name,
          unit_price: res.unit_price,
        })
        return
      }
      const ids = parseUuidList(idsTextarea)
      if (ids.length === 0) {
        toast({ title: "Member IDs", description: "Paste one member UUID per line (or comma-separated)." })
        return
      }
      const res = await previewAdminBulkMemberSubscription({
        package_id: massPackageId,
        member_scope: "selected_ids",
        member_ids: ids,
      })
      if (!res.success) throw new Error(typeof res.message === "string" ? res.message : "Preview failed")
      setPreviewResult({
        member_count: res.member_count ?? 0,
        total_amount: res.total_amount ?? 0,
        package_name: res.package_name,
        unit_price: res.unit_price,
      })
    } catch (e: unknown) {
      toast({
        title: "Preview failed",
        description: e instanceof Error ? e.message : "Could not preview batch",
        variant: "destructive",
      })
    } finally {
      setPreviewLoading(false)
    }
  }

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
    if (!paymentMethod) {
      toast({ title: "Payment method", description: "Choose a payment method.", variant: "destructive" })
      return
    }
    let body: Parameters<typeof initializeAdminBulkMemberSubscription>[0] = {
      payment_method: paymentMethod,
      notes: notes || undefined,
    }
    if (batchTab === "custom") {
      if (lines.length === 0) {
        toast({ title: "Add members", description: "Add at least one line or switch to large batch.", variant: "destructive" })
        return
      }
      body = { ...body, lines }
    } else {
      if (!massPackageId) {
        toast({ title: "Package", description: "Select a package for the whole batch.", variant: "destructive" })
        return
      }
      if (massScope === "all_active") {
        body = {
          ...body,
          package_id: massPackageId,
          member_scope: "all_active",
          member_search: massSearch.trim() || undefined,
        }
      } else {
        const ids = parseUuidList(idsTextarea)
        if (ids.length === 0) {
          toast({ title: "Member IDs", description: "Paste member UUIDs for selected members.", variant: "destructive" })
          return
        }
        body = { ...body, package_id: massPackageId, member_scope: "selected_ids", member_ids: ids }
      }
    }
    if (isManual) {
      if (manualCfg.require_payer_name !== false) body.payer_name = payerName
      if (manualCfg.require_payer_phone) body.payer_phone = payerPhone
      if (manualCfg.require_account_details) body.account_details = accountDetails
      if (manualCfg.require_payment_evidence !== false && evidenceUrls.length > 0) {
        body.payment_evidence = evidenceUrls
      }
    }
    setSubmitting(true)
    try {
      const res = await initializeAdminBulkMemberSubscription(body)
      if (!res.success) {
        throw new Error(res.message || "Initialization failed")
      }
      if (res.requires_approval || paymentMethod === "manual") {
        toast({
          title: "Submitted for approval",
          description: "This payment is pending review. Details are shown below.",
        })
        setSubmissionOutcome({
          kind: "awaiting_approval",
          bulk_batch_id: res.bulk_batch_id,
          reference: res.reference,
          member_count: res.member_count,
          total_amount: res.total_amount,
        })
        setLines([])
        setEvidenceUrls([])
        setPreviewResult(null)
        return
      }
      if (paymentMethod === "wallet") {
        const paidTotal = res.total_amount ?? grandTotal
        toast({
          title: "Payment completed",
          description: `${formatNgn(paidTotal)} charged from wallet.`,
        })
        setSubmissionOutcome({
          kind: "wallet_paid",
          member_count: res.member_count,
          total_amount: paidTotal,
        })
        setLines([])
        setPreviewResult(null)
        return
      }
      const payUrl = res.payment_url
      if (payUrl) {
        window.location.href = payUrl
        return
      }
      toast({
        title: "Next step",
        description: "Complete payment in your bank or gateway app if applicable, then check Payment approvals.",
      })
      setSubmissionOutcome({
        kind: "followup",
        detail:
          "If you were not redirected to a payment page, open Payment approvals to confirm status or contact support.",
      })
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

      {submissionOutcome && (
        <Alert
          className={
            submissionOutcome.kind === "wallet_paid"
              ? "relative border-emerald-200 bg-emerald-50 pr-12 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/35 dark:text-emerald-50"
              : submissionOutcome.kind === "awaiting_approval"
                ? "relative border-amber-200 bg-amber-50 pr-12 text-amber-950 dark:border-amber-900 dark:bg-amber-950/35 dark:text-amber-50"
                : "relative border-sky-200 bg-sky-50 pr-12 text-sky-950 dark:border-sky-900 dark:bg-sky-950/35 dark:text-sky-50"
          }
        >
          {submissionOutcome.kind === "wallet_paid" ? (
            <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" />
          ) : submissionOutcome.kind === "awaiting_approval" ? (
            <Clock className="text-amber-600 dark:text-amber-400" />
          ) : (
            <AlertCircle className="text-sky-600 dark:text-sky-400" />
          )}
          <AlertTitle>
            {submissionOutcome.kind === "wallet_paid"
              ? "Payment completed from wallet"
              : submissionOutcome.kind === "awaiting_approval"
                ? "Payment sent — awaiting approval"
                : "Submission recorded"}
          </AlertTitle>
          <AlertDescription className="text-current/85 space-y-2">
            {submissionOutcome.kind === "awaiting_approval" ? (
              <>
                <p>
                  This bulk payment has been submitted to the platform. A super admin will review and approve it before
                  member subscriptions are fully activated. Until then, treat it as <strong>pending</strong>, not final.
                </p>
                {(submissionOutcome.member_count != null || submissionOutcome.total_amount != null) && (
                  <p className="text-sm">
                    {submissionOutcome.member_count != null
                      ? `${submissionOutcome.member_count.toLocaleString()} member(s)`
                      : null}
                    {submissionOutcome.member_count != null && submissionOutcome.total_amount != null ? " · " : null}
                    {submissionOutcome.total_amount != null
                      ? `Total ${formatNgn(submissionOutcome.total_amount)}`
                      : null}
                  </p>
                )}
                {(submissionOutcome.reference || submissionOutcome.bulk_batch_id) && (
                  <p className="text-xs font-mono opacity-90 break-all">
                    {submissionOutcome.reference ? `Reference: ${submissionOutcome.reference}` : null}
                    {submissionOutcome.reference && submissionOutcome.bulk_batch_id ? " · " : null}
                    {submissionOutcome.bulk_batch_id ? `Batch: ${submissionOutcome.bulk_batch_id}` : null}
                  </p>
                )}
                <p>
                  <Link
                    href="/admin/payment-approvals"
                    className="font-medium underline underline-offset-2 hover:opacity-90"
                  >
                    Open Payment approvals
                  </Link>{" "}
                  to track or add notes for reviewers.
                </p>
              </>
            ) : submissionOutcome.kind === "wallet_paid" ? (
              <>
                <p>
                  The organisation wallet was charged successfully. Subscription records should update shortly. If
                  anything looks wrong, check{" "}
                  <Link
                    href="/admin/payment-approvals"
                    className="font-medium underline underline-offset-2 hover:opacity-90"
                  >
                    Payment approvals
                  </Link>{" "}
                  or member subscription lists.
                </p>
                <p className="text-sm">
                  {[
                    submissionOutcome.member_count != null
                      ? `${submissionOutcome.member_count.toLocaleString()} member(s)`
                      : null,
                    formatNgn(submissionOutcome.total_amount),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </>
            ) : (
              <p>{submissionOutcome.detail}</p>
            )}
          </AlertDescription>
          <button
            type="button"
            onClick={() => setSubmissionOutcome(null)}
            className="absolute right-3 top-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Dismiss notice"
          >
            <X className="h-4 w-4" />
          </button>
        </Alert>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Super admin gateway</AlertTitle>
        <AlertDescription>
          Charges use the platform payment settings configured by the super admin. For very large cooperatives (e.g.
          2,000+ members), use <strong>Large batch</strong>: one payment covers everyone on the same plan—no need to add
          people one by one.
        </AlertDescription>
      </Alert>

      <Tabs
        value={batchTab}
        onValueChange={(v) => {
          setBatchTab(v as "mass" | "custom")
          setPreviewResult(null)
        }}
      >
        <TabsList className="mb-2">
          <TabsTrigger value="mass">Large batch (recommended)</TabsTrigger>
          <TabsTrigger value="custom">Custom lines</TabsTrigger>
        </TabsList>

        <TabsContent value="mass" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Same package for the whole cooperative</CardTitle>
              <CardDescription>
                Include every <strong>active</strong> member automatically, or paste member UUIDs (e.g. from an export).
                Preview to confirm count and total before paying.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Package</Label>
                  <Select value={massPackageId || undefined} onValueChange={setMassPackageId}>
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
                <div className="space-y-2">
                  <Label>Audience</Label>
                  <Select value={massScope} onValueChange={(v) => setMassScope(v as "all_active" | "selected_ids")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_active">All active members</SelectItem>
                      <SelectItem value="selected_ids">Only pasted member UUIDs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {massScope === "all_active" && (
                <div className="space-y-2">
                  <Label>Optional filter (narrows who counts as “all active”)</Label>
                  <Input
                    placeholder="Name, email, or member number… (leave blank for everyone active)"
                    value={massSearch}
                    onChange={(e) => setMassSearch(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Server loads every matching active member—safe into the thousands per payment (max 10,000).
                  </p>
                </div>
              )}

              {massScope === "selected_ids" && (
                <div className="space-y-2">
                  <Label>Member UUIDs</Label>
                  <Textarea
                    rows={10}
                    placeholder={"One UUID per line, or comma / space separated\ne.g. from admin export or your database"}
                    value={idsTextarea}
                    onChange={(e) => setIdsTextarea(e.target.value)}
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-2 items-center">
                <Button type="button" variant="secondary" onClick={() => void runPreview()} disabled={previewLoading}>
                  {previewLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Preview count &amp; total
                </Button>
              </div>

              {previewResult && batchTab === "mass" && (
                <Alert>
                  <AlertDescription>
                    <strong>{previewResult.member_count}</strong> members
                    {previewResult.package_name ? <> — {previewResult.package_name}</> : null}
                    {typeof previewResult.unit_price === "number" ? <> @ {formatNgn(previewResult.unit_price)} each</> : null}
                    . Total: <strong>{formatNgn(previewResult.total_amount)}</strong>.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle>Add lines</CardTitle>
          <CardDescription>
            Mix different packages—search members and add one row at a time (best for smaller batches).
          </CardDescription>
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
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => void runPreview()} disabled={previewLoading}>
                {previewLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Preview
              </Button>
              <span className="text-lg font-semibold">Total: {formatNgn(grandTotal)}</span>
            </div>
          )}
          {previewResult && batchTab === "custom" && lines.length > 0 && (
            <Alert>
              <AlertDescription>
                Preview: <strong>{previewResult.member_count}</strong> lines, total{" "}
                <strong>{formatNgn(previewResult.total_amount)}</strong>.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>

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
            <Button onClick={submit} disabled={submitting || !batchReady}>
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
