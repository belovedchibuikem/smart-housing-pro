"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiFetch } from "@/lib/api/client"

type MemberHit = {
  id: string
  member_number?: string | null
  name: string
  email?: string | null
}

type Product = {
  id: string
  name: string
  interest_rate: number
  min_amount: number
  max_amount?: number | null
  min_tenure_months: number
  max_tenure_months: number
  is_active?: boolean
}

const money = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 })

export default function AdminApplyLoanPage() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [members, setMembers] = useState<MemberHit[]>([])
  const [searching, setSearching] = useState(false)
  const [member, setMember] = useState<MemberHit | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [productId, setProductId] = useState("")
  const [amount, setAmount] = useState("")
  const [tenure, setTenure] = useState("")
  const [purpose, setPurpose] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [submitAs, setSubmitAs] = useState<"pending" | "approved">("pending")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiFetch<{ success?: boolean; data?: Product[]; products?: Product[] }>(
          "/admin/loan-products?per_page=100&is_active=true",
        )
        const list = res.data || res.products || []
        setProducts(Array.isArray(list) ? list.filter((p) => p.is_active !== false) : [])
      } catch {
        setProducts([])
      }
    })()
  }, [])

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setMembers([])
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await apiFetch<{ success: boolean; data: MemberHit[] }>(
          `/admin/loan-repayments/members?query=${encodeURIComponent(q)}`,
        )
        setMembers(res.data || [])
      } catch {
        setMembers([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const product = products.find((item) => item.id === productId)
  const numericAmount = Number(amount) || 0
  const numericTenure = Number(tenure) || 0

  const preview = useMemo(() => {
    if (!product || !numericAmount || !numericTenure) return null
    const interest = numericAmount * (Number(product.interest_rate) / 100)
    const total = numericAmount + interest
    return {
      interest,
      total,
      monthly: total / numericTenure,
      rate: Number(product.interest_rate),
    }
  }, [product, numericAmount, numericTenure])

  const tenureOptions = useMemo(() => {
    if (!product) return []
    const min = Math.max(Number(product.min_tenure_months) || 1, 1)
    const max = Math.max(Number(product.max_tenure_months) || min, min)
    const options: number[] = []
    for (let month = min; month <= max; month += 1) options.push(month)
    return options.slice(0, 60)
  }, [product])

  const submit = async () => {
    if (!member || !product || !preview) {
      toast.error("Choose a member, product, amount, and tenure.")
      return
    }
    if (!purpose.trim()) {
      toast.error("Enter the purpose of the loan.")
      return
    }
    setSaving(true)
    try {
      const res = await apiFetch<{ success: boolean; message?: string; data?: { id: string } }>("/admin/loans/apply", {
        method: "POST",
        body: {
          member_id: member.id,
          product_id: product.id,
          amount: numericAmount,
          tenure_months: numericTenure,
          purpose: purpose.trim(),
          repayment_start_date: startDate || undefined,
          repayment_end_date: endDate || undefined,
          submit_as: submitAs,
        },
      })
      toast.success(res.message || "Loan application created")
      if (res.data?.id) router.push(`/admin/loans/${res.data.id}`)
      else router.push("/admin/loans")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create the application")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/loans">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Apply for a member</h1>
          <p className="text-muted-foreground">Create one loan application using the same product calculation members see.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member</CardTitle>
          <CardDescription>Search by name, member number, staff ID, IPPIS, or phone.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search member" />
          </div>
          {searching ? <p className="text-sm text-muted-foreground">Searching…</p> : null}
          {member ? (
            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              <p className="font-medium">{member.name}</p>
              <p className="text-muted-foreground">{member.member_number || member.id}</p>
              <Button variant="link" className="h-auto px-0" onClick={() => setMember(null)}>
                Change member
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {members.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => {
                    setMember(item)
                    setMembers([])
                    setQuery(item.name)
                  }}
                >
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground">{item.member_number}</span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Loan</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Product</Label>
            <Select
              value={productId}
              onValueChange={(value) => {
                setProductId(value)
                const next = products.find((item) => item.id === value)
                if (next) setTenure(String(next.min_tenure_months || 1))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a loan product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} · {item.interest_rate}% for tenure
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Amount (₦)</Label>
            <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
            {product ? (
              <p className="text-xs text-muted-foreground">
                {money.format(Number(product.min_amount) || 0)}
                {product.max_amount ? ` – ${money.format(Number(product.max_amount))}` : ""}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>Tenure</Label>
            <Select value={tenure} onValueChange={setTenure} disabled={!product}>
              <SelectTrigger>
                <SelectValue placeholder="Months" />
              </SelectTrigger>
              <SelectContent>
                {tenureOptions.map((month) => (
                  <SelectItem key={month} value={String(month)}>
                    {month} month{month === 1 ? "" : "s"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Start date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                const value = e.target.value
                setStartDate(value)
                const months = Number(tenure) || 1
                if (value) {
                  const date = new Date(`${value}T00:00:00`)
                  date.setMonth(date.getMonth() + months - 1)
                  setEndDate(date.toISOString().slice(0, 10))
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>End date</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <p className="text-xs text-muted-foreground">Last deduction month. Tenure follows these dates when both are set.</p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Purpose</Label>
            <Textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>After submit</Label>
            <Select value={submitAs} onValueChange={(value) => setSubmitAs(value === "approved" ? "approved" : "pending")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Send for review</SelectItem>
                <SelectItem value="approved">Approve immediately</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {preview ? (
        <Card className="border-emerald-200 bg-emerald-50/60">
          <CardContent className="grid gap-3 pt-6 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Monthly repayment</p>
              <p className="text-xl font-semibold text-amber-700">{money.format(preview.monthly)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total repayment</p>
              <p className="text-xl font-semibold">{money.format(preview.total)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Interest ({preview.rate}% once)</p>
              <p className="text-xl font-semibold">{money.format(preview.interest)}</p>
            </div>
            <p className="sm:col-span-3 text-xs text-muted-foreground">
              A missed month attracts a default fee of 10% of that month&apos;s repayment ({money.format(preview.monthly * 0.1)}).
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex justify-end">
        <Button onClick={() => void submit()} disabled={saving || !member || !preview}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Submit application
        </Button>
      </div>
    </div>
  )
}
