"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Loader2 } from "lucide-react"
import { getInvestmentPlan } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"

interface Inv {
  id: string
  amount: number
  status?: string
  member?: { user?: { first_name?: string; last_name?: string; email?: string } }
}

interface PlanDetail {
  id: string
  name: string
  description?: string
  min_amount: number
  max_amount: number
  expected_return_rate: number
  min_duration_months: number
  max_duration_months: number
  return_type: string
  risk_level: string
  is_active: boolean
  total_invested?: number
  total_investors?: number
  features?: unknown[]
  investments?: Inv[]
  created_at: string
}

export default function InvestmentPlanDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [plan, setPlan] = useState<PlanDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = params?.id
    if (!id) return
    ;(async () => {
      try {
        setLoading(true)
        const res = await getInvestmentPlan(id)
        if (res.success && res.data) setPlan(res.data as PlanDetail)
      } catch (e: any) {
        toast({ title: "Error", description: e?.message || "Failed to load plan", variant: "destructive" })
        router.push("/admin/investment-plans")
      } finally {
        setLoading(false)
      }
    })()
  }, [params?.id, router, toast])

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n)

  const returnLabel = (t: string) =>
    ({ monthly: "Monthly", quarterly: "Quarterly", annual: "Annual", lump_sum: "Lump sum" }[t] ?? t)

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!plan) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">Plan not found.</CardContent>
      </Card>
    )
  }

  const inv = plan.investments ?? []

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/investment-plans">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{plan.name}</h1>
            <p className="text-muted-foreground mt-1">Investment plan</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/investment-plans/${plan.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Returns and limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant={plan.is_active ? "default" : "secondary"}>
              {plan.is_active ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline" className="capitalize">
              Risk: {plan.risk_level}
            </Badge>
            <Badge variant="secondary">{returnLabel(plan.return_type)}</Badge>
          </div>
          {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Investment range</p>
              <p className="font-semibold">
                {formatCurrency(plan.min_amount)} – {formatCurrency(plan.max_amount)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Expected return</p>
              <p className="font-semibold">{plan.expected_return_rate}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Duration (months)</p>
              <p className="font-semibold">
                {plan.min_duration_months}–{plan.max_duration_months}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Invested / Investors</p>
              <p className="font-semibold">
                {formatCurrency(plan.total_invested ?? 0)} · {plan.total_investors ?? 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Investments</CardTitle>
          <CardDescription>{inv.length} record(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {inv.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No investments yet.</p>
          ) : (
            inv.slice(0, 50).map((row) => (
              <div
                key={row.id}
                className="flex flex-wrap justify-between gap-2 border rounded-lg p-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {row.member?.user
                      ? `${row.member.user.first_name ?? ""} ${row.member.user.last_name ?? ""}`.trim()
                      : "Member"}
                  </p>
                  <p className="text-muted-foreground text-xs">{row.member?.user?.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(Number(row.amount))}</p>
                  <Badge variant="outline" className="capitalize text-xs">
                    {row.status ?? "—"}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
