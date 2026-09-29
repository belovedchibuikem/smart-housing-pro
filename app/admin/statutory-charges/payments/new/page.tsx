"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2, Search } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  createStatutoryChargePayments,
  getStatutoryCharge,
  getStatutoryCharges,
} from "@/lib/api/client"
import { formatNairaAmount } from "@/lib/utils/currency"

type ChargeOption = {
  id: string
  label: string
  amount: number
  remaining: number
  status: string
}

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "card", label: "Card" },
  { value: "wallet", label: "Wallet" },
  { value: "equity_wallet", label: "Equity wallet" },
  { value: "contribution_wallet", label: "Contribution wallet" },
  { value: "other", label: "Other" },
]

function chargeLabel(c: any): ChargeOption {
  const member = c.member?.user
  const name = member
    ? `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim()
    : c.member?.member_number || "Member"
  const type = c.type || c.definition?.name || "Charge"
  const amount = Number(c.amount) || 0
  const remaining = Number(c.remaining_amount ?? Math.max(0, amount - (Number(c.total_paid) || 0))) || 0
  return {
    id: String(c.id),
    label: `${name} · ${type} · due ${formatNairaAmount(remaining, { maximumFractionDigits: 2 })}`,
    amount,
    remaining,
    status: String(c.status ?? ""),
  }
}

export default function RecordStatutoryPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const presetChargeId = searchParams.get("charge") || ""
  const { toast } = useToast()

  const [search, setSearch] = useState("")
  const [charges, setCharges] = useState<ChargeOption[]>([])
  const [loadingCharges, setLoadingCharges] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>(presetChargeId ? [presetChargeId] : [])
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer")
  const [reference, setReference] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const selectedCharges = useMemo(
    () => charges.filter((charge) => selectedIds.includes(charge.id)),
    [charges, selectedIds],
  )
  const selected = selectedCharges.length === 1 ? selectedCharges[0] : null
  const selectedTotal = selectedCharges.reduce((sum, charge) => sum + charge.remaining, 0)

  const loadCharges = async (term?: string) => {
    setLoadingCharges(true)
    try {
      const res = await getStatutoryCharges({
        search: term?.trim() || undefined,
        per_page: 50,
        page: 1,
      })
      const list = (res.data || [])
        .map(chargeLabel)
        .filter((c) => c.remaining > 0.009 && !["paid", "rejected", "waived"].includes(c.status))
      setCharges(list)

      if (presetChargeId && !list.some((c) => c.id === presetChargeId)) {
        const one = await getStatutoryCharge(presetChargeId).catch(() => null)
        if (one?.success && one.data) {
          const opt = chargeLabel(one.data)
          if (opt.remaining > 0.009) {
            setCharges((prev) => [opt, ...prev.filter((p) => p.id !== opt.id)])
            setSelectedIds((prev) => (prev.includes(opt.id) ? prev : [opt.id, ...prev]))
            setAmount(opt.remaining.toFixed(2))
          }
        }
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to load charges",
        variant: "destructive",
      })
    } finally {
      setLoadingCharges(false)
    }
  }

  useEffect(() => {
    void loadCharges()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      void loadCharges(search)
    }, 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  useEffect(() => {
    if (selected && !amount) {
      setAmount(selected.remaining.toFixed(2))
    }
  }, [selected, amount])

  const toggleCharge = (id: string, checked: boolean) => {
    setSelectedIds((current) => {
      const next = checked ? Array.from(new Set([...current, id])) : current.filter((item) => item !== id)
      if (next.length === 1) {
        const only = charges.find((charge) => charge.id === next[0])
        if (only) setAmount(only.remaining.toFixed(2))
      }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedIds.length === 0) {
      toast({ title: "Validation", description: "Select at least one statutory charge", variant: "destructive" })
      return
    }
    const payAmount = Math.round((Number(amount) || 0) * 100) / 100
    if (selectedIds.length === 1 && payAmount <= 0) {
      toast({ title: "Validation", description: "Enter a valid amount", variant: "destructive" })
      return
    }
    if (selected && payAmount > selected.remaining + 0.009) {
      toast({
        title: "Validation",
        description: `Amount exceeds remaining balance of ${formatNairaAmount(selected.remaining, { maximumFractionDigits: 2 })}`,
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const res = await createStatutoryChargePayments({
        charge_ids: selectedIds,
        amount: selectedIds.length === 1 ? payAmount : null,
        payment_method: paymentMethod,
        reference: reference.trim() || null,
      })
      if (res.success) {
        toast({ title: "Payment recorded", description: res.message || "Statutory payment saved" })
        router.push("/admin/statutory-charges/payments")
      } else {
        throw new Error(res.message || "Failed to record payment")
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to record payment",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex-1 p-6 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <Link href="/admin/statutory-charges/payments">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to payment records
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Record Statutory Payment</h1>
          <p className="mt-1 text-muted-foreground">
            Select one member's charges, or charges across several members, and record repayment together.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment details</CardTitle>
            <CardDescription>
              1) Create / assign a charge definition so the member has a ledger row under All Charges. 2) Record payment
              here. Members can also pay from their dashboard/app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Find charge</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search by member name, charge type…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Statutory charges *</Label>
                  <span className="text-xs text-muted-foreground">{selectedIds.length} selected</span>
                </div>
                <div className="max-h-72 space-y-1 overflow-y-auto rounded-md border p-2">
                  {loadingCharges ? (
                    <p className="px-2 py-4 text-sm text-muted-foreground">Loading charges…</p>
                  ) : charges.length === 0 ? (
                    <p className="px-2 py-4 text-sm text-muted-foreground">No unpaid charges found</p>
                  ) : (
                    charges.map((charge) => (
                      <label key={charge.id} className="flex cursor-pointer items-start gap-2 rounded px-2 py-2 hover:bg-muted">
                        <Checkbox
                          checked={selectedIds.includes(charge.id)}
                          onCheckedChange={(value) => toggleCharge(charge.id, value === true)}
                          className="mt-0.5"
                        />
                        <span className="text-sm">{charge.label}</span>
                      </label>
                    ))
                  )}
                </div>
                {selectedCharges.length > 1 ? (
                  <p className="text-xs text-muted-foreground">
                    Each selected charge will be repaid in full. Combined remaining{" "}
                    {formatNairaAmount(selectedTotal, { maximumFractionDigits: 2 })}.
                  </p>
                ) : selected ? (
                  <p className="text-xs text-muted-foreground">
                    Total {formatNairaAmount(selected.amount, { maximumFractionDigits: 2 })} · Remaining{" "}
                    {formatNairaAmount(selected.remaining, { maximumFractionDigits: 2 })} · Status {selected.status}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₦) {selectedIds.length > 1 ? "" : "*"}</Label>
                  <Input
                    id="amount"
                    type="number"
                    min={0}
                    step="0.01"
                    value={selectedIds.length > 1 ? selectedTotal.toFixed(2) : amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={selectedIds.length > 1}
                    required={selectedIds.length <= 1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment method *</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Reference (optional)</Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Bank slip / receipt no."
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={submitting || selectedIds.length === 0}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Record payment"
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin/statutory-charges">View all charges</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
