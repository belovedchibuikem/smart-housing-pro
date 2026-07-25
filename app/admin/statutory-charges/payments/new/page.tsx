"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  createStatutoryChargePayment,
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
  const [chargeId, setChargeId] = useState(presetChargeId)
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer")
  const [reference, setReference] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const selected = useMemo(() => charges.find((c) => c.id === chargeId), [charges, chargeId])

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
            setChargeId(opt.id)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chargeId) {
      toast({ title: "Validation", description: "Select a statutory charge", variant: "destructive" })
      return
    }
    const payAmount = Math.round((Number(amount) || 0) * 100) / 100
    if (payAmount <= 0) {
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
      const res = await createStatutoryChargePayment({
        statutory_charge_id: chargeId,
        amount: payAmount,
        payment_method: paymentMethod,
        reference: reference.trim() || null,
        status: "completed",
      })
      if (res.success) {
        toast({ title: "Payment recorded", description: res.message || "Statutory payment saved" })
        router.push("/admin/statutory-charges/payments")
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
            Apply cash or transfer against an existing approved statutory charge ledger row.
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
                <Label>Statutory charge *</Label>
                <Select
                  value={chargeId || undefined}
                  onValueChange={(v) => {
                    setChargeId(v)
                    const opt = charges.find((c) => c.id === v)
                    if (opt) setAmount(opt.remaining.toFixed(2))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingCharges ? "Loading…" : "Select unpaid charge…"} />
                  </SelectTrigger>
                  <SelectContent>
                    {charges.length === 0 ? (
                      <SelectItem value="__none" disabled>
                        No unpaid charges found
                      </SelectItem>
                    ) : (
                      charges.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selected ? (
                  <p className="text-xs text-muted-foreground">
                    Total {formatNairaAmount(selected.amount, { maximumFractionDigits: 2 })} · Remaining{" "}
                    {formatNairaAmount(selected.remaining, { maximumFractionDigits: 2 })} · Status {selected.status}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₦) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min={0}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
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
                <Button type="submit" disabled={submitting || !chargeId}>
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
