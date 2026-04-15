"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Search, Loader2, AlertCircle, CreditCard, Wallet, TrendingUp, PiggyBank, X } from "lucide-react"
import {
  apiFetch,
  getAdminRefundMemberSummary,
  createAdminContribution,
  type AdminRefundMemberSummary,
} from "@/lib/api/client"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface MemberRow {
  id: string
  name: string
  member_number: string
  staff_id: string
  ippis_number: string
  frsc_pin: string
  wallet_balance: number
}

const CONTRIBUTION_TYPES = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
  { value: "special", label: "Special" },
  { value: "emergency", label: "Emergency" },
] as const

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "cash", label: "Cash" },
  { value: "pos", label: "POS" },
  { value: "cheque", label: "Cheque" },
  { value: "deduction", label: "Payroll / deduction" },
  { value: "other", label: "Other" },
]

export default function PostContributionPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null)
  const [members, setMembers] = useState<MemberRow[]>([])
  const [searching, setSearching] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [summary, setSummary] = useState<AdminRefundMemberSummary["summary"] | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  const [form, setForm] = useState({
    type: "monthly" as (typeof CONTRIBUTION_TYPES)[number]["value"],
    amount: "",
    contribution_date: new Date().toISOString().slice(0, 10),
    payment_method: "",
    reference: "",
    notes: "",
  })

  const loadMemberSummary = async (memberId: string) => {
    setSummary(null)
    setSummaryLoading(true)
    try {
      const response = await getAdminRefundMemberSummary(memberId)
      if (response?.success) {
        setSummary(response.summary)
      }
    } catch (error: unknown) {
      console.error("Failed to load member summary", error)
      toast.error(error instanceof Error ? error.message : "Failed to load member balances")
    } finally {
      setSummaryLoading(false)
    }
  }

  const searchMembers = async () => {
    if (!searchQuery.trim()) {
      setMembers([])
      setSelectedMember(null)
      setSummary(null)
      return
    }

    setSearching(true)
    try {
      const res = await apiFetch<{
        members?: unknown[]
        data?: unknown[]
      }>(
        `/admin/members?search=${encodeURIComponent(searchQuery)}&per_page=100`,
      ).catch(() => ({ members: [], data: [] }))
      const list: any[] = Array.isArray(res?.members)
        ? res.members
        : Array.isArray(res?.data)
          ? res.data
          : []

      const normalized: MemberRow[] = list.map((m) => {
        const u = m.user || {}
        const first = m.first_name ?? u.first_name ?? ""
        const last = m.last_name ?? u.last_name ?? ""
        const name =
          `${first} ${last}`.trim() || u.name || m.email || u.email || "Unknown"
        const wallet = m.wallet || {}
        return {
          id: String(m.id ?? ""),
          name,
          member_number: m.member_number != null ? String(m.member_number) : "—",
          staff_id: m.staff_id != null ? String(m.staff_id) : "",
          ippis_number: m.ippis_number != null ? String(m.ippis_number) : "",
          frsc_pin: m.frsc_pin != null ? String(m.frsc_pin) : "",
          wallet_balance: Number(wallet.balance ?? wallet.current_balance ?? 0) || 0,
        }
      })
      setMembers(normalized)
      if (normalized.length === 1) {
        handleSelectMember(normalized[0])
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to search members")
      setMembers([])
    } finally {
      setSearching(false)
    }
  }

  useEffect(() => {
    if (selectedMember) {
      return
    }
    const timer = setTimeout(() => {
      searchMembers()
    }, 500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedMember])

  const formatCurrency = (value?: number | null) => {
    const numeric = Number(value ?? 0)
    if (!Number.isFinite(numeric)) {
      return "₦0"
    }
    return `₦${numeric.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  const handleSelectMember = (member: MemberRow) => {
    setMembers([])
    setSelectedMember(member)
    setForm((f) => ({
      ...f,
      amount: "",
      contribution_date: new Date().toISOString().slice(0, 10),
      payment_method: "",
      reference: "",
      notes: "",
    }))
    loadMemberSummary(member.id)
  }

  const clearMemberSelection = () => {
    setSelectedMember(null)
    setSummary(null)
    setMembers([])
    setSearchQuery("")
  }

  const submitContribution = async () => {
    if (!selectedMember) return
    const amount = parseFloat(form.amount)
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    setSubmitting(true)
    try {
      const response = await createAdminContribution({
        member_id: selectedMember.id,
        amount,
        type: form.type,
        contribution_date: form.contribution_date || undefined,
        payment_method: form.payment_method || undefined,
        reference: form.reference || undefined,
        notes: form.notes || undefined,
      })

      if (!response.success) {
        throw new Error(response.message || "Failed to post contribution")
      }

      toast.success(response.message || "Contribution posted successfully")
      setForm((f) => ({
        ...f,
        amount: "",
        reference: "",
        notes: "",
      }))
      setShowConfirmDialog(false)
      await loadMemberSummary(selectedMember.id)
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to post contribution")
    } finally {
      setSubmitting(false)
    }
  }

  const memberSubtitle = useMemo(() => {
    if (!selectedMember) return ""
    const parts = [
      selectedMember.member_number !== "—" ? `Member #${selectedMember.member_number}` : null,
      selectedMember.frsc_pin ? `FRSC ${selectedMember.frsc_pin}` : null,
      selectedMember.ippis_number ? `IPPIS ${selectedMember.ippis_number}` : null,
      selectedMember.staff_id ? `Staff ${selectedMember.staff_id}` : null,
    ].filter(Boolean)
    return parts.join(" · ")
  }, [selectedMember])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Post contribution</h1>
        <p className="text-muted-foreground mt-2">
          Find a member by name, member number, FRSC PIN, IPPIS, staff ID, or member UUID, then record a completed
          contribution on their behalf. Balances update immediately (same flow as bulk upload).
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Select member</CardTitle>
            <CardDescription>Search matches the member directory (same as Refund Member)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Name, member number, FRSC PIN, IPPIS, staff ID, or UUID…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={!!selectedMember}
                className="pl-10"
              />
            </div>

            {selectedMember && (
              <div className="flex items-start justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Selected member</p>
                  <p className="font-medium truncate">{selectedMember.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{memberSubtitle}</p>
                </div>
                <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={clearMemberSelection}>
                  <X className="h-4 w-4 mr-1" />
                  Change
                </Button>
              </div>
            )}

            {searching && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}

            {!searching && !selectedMember && members.length > 0 && (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {members.map((member) => (
                  <Card
                    key={member.id}
                    className="cursor-pointer transition-colors hover:border-primary/40"
                    onClick={() => handleSelectMember(member)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{member.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {member.member_number !== "—" ? `#${member.member_number}` : "—"}
                            {member.frsc_pin ? ` · FRSC ${member.frsc_pin}` : ""}
                          </p>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {formatCurrency(member.wallet_balance)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!searching && !selectedMember && searchQuery && members.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                No members found
              </div>
            )}
          </CardContent>
        </Card>

        {selectedMember && (
          <Card>
            <CardHeader>
              <CardTitle>Member</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Name</Label>
                <p className="font-medium">{selectedMember.name}</p>
              </div>
              {memberSubtitle && (
                <p className="text-sm text-muted-foreground">{memberSubtitle}</p>
              )}
              {summaryLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
              {!summaryLoading && summary && (
                <div className="space-y-3 pt-2 border-t">
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-3 space-y-1">
                        <div className="flex items-center gap-2 text-blue-600">
                          <Wallet className="h-4 w-4" />
                          <span className="text-xs uppercase font-semibold">Wallet</span>
                        </div>
                        <p className="text-base font-bold text-blue-900">{formatCurrency(summary.wallet.balance)}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-3 space-y-1">
                        <div className="flex items-center gap-2 text-green-600">
                          <CreditCard className="h-4 w-4" />
                          <span className="text-xs uppercase font-semibold">Contributions</span>
                        </div>
                        <p className="text-base font-bold text-green-900">
                          {formatCurrency(summary.contribution.available)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-purple-50 border-purple-200">
                      <CardContent className="p-3 space-y-1">
                        <div className="flex items-center gap-2 text-purple-600">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-xs uppercase font-semibold">Investment profit</span>
                        </div>
                        <p className="text-base font-bold text-purple-900">
                          {formatCurrency(summary.investment_returns.available)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-amber-50 border-amber-200">
                      <CardContent className="p-3 space-y-1">
                        <div className="flex items-center gap-2 text-amber-600">
                          <PiggyBank className="h-4 w-4" />
                          <span className="text-xs uppercase font-semibold">Equity wallet</span>
                        </div>
                        <p className="text-base font-bold text-amber-900">
                          {formatCurrency(summary.equity_wallet.available ?? summary.equity_wallet.balance)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
              {!summaryLoading && !summary && (
                <Alert variant="default">
                  <AlertTitle>Balances unavailable</AlertTitle>
                  <AlertDescription>Could not load summary for this member.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {selectedMember && (
        <Card>
          <CardHeader>
            <CardTitle>Contribution details</CardTitle>
            <CardDescription>
              Posted as <strong>completed</strong> immediately. Optional payment method stores a payment line (same as bulk
              upload). Notes are saved with the payment when a method is selected.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="type">Contribution type *</Label>
                <Select
                  value={form.type}
                  onValueChange={(value: (typeof CONTRIBUTION_TYPES)[number]["value"]) =>
                    setForm({ ...form, type: value })
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRIBUTION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount (₦) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cdate">Contribution date</Label>
                <Input
                  id="cdate"
                  type="date"
                  value={form.contribution_date}
                  onChange={(e) => setForm({ ...form, contribution_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="pmethod">Payment method</Label>
                <Select
                  value={form.payment_method || "__none__"}
                  onValueChange={(v) =>
                    setForm({ ...form, payment_method: v === "__none__" ? "" : v })
                  }
                >
                  <SelectTrigger id="pmethod">
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {PAYMENT_METHODS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="reference">Payment reference</Label>
                <Input
                  id="reference"
                  placeholder="Auto-generated if empty and payment exists"
                  value={form.reference}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  disabled={!form.payment_method}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  rows={2}
                  placeholder="Visible on payment metadata when a payment method is set"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  disabled={!form.payment_method}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setForm({
                    type: "monthly",
                    amount: "",
                    contribution_date: new Date().toISOString().slice(0, 10),
                    payment_method: "",
                    reference: "",
                    notes: "",
                  })
                  clearMemberSelection()
                }}
              >
                Clear
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const amount = parseFloat(form.amount)
                  if (!amount || amount <= 0) {
                    toast.error("Please enter a valid amount")
                    return
                  }
                  setShowConfirmDialog(true)
                }}
                disabled={submitting || !form.amount}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting…
                  </>
                ) : (
                  "Post contribution"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm contribution</DialogTitle>
            <DialogDescription>
              This will credit the member&apos;s contribution balance immediately. Continue?
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-2 py-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Member</span>
                <span className="font-medium text-right">
                  {selectedMember.name} ({selectedMember.member_number})
                </span>
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium text-right capitalize">{form.type}</span>
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium text-right text-lg">
                  {formatCurrency(parseFloat(form.amount || "0"))}
                </span>
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-right">{form.contribution_date || "—"}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={submitContribution} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting…
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
