"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, Calendar, Building2, Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/api/client"

interface PublicInvestmentPlan {
  id: string
  name: string
  description?: string | null
  min_amount: number | string
  max_amount: number | string
  expected_return_rate: number | string
  min_duration_months: number
  max_duration_months: number
  return_type?: string
  risk_level?: string
}

export default function InvestmentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [riskFilter, setRiskFilter] = useState("all")
  const [plans, setPlans] = useState<PublicInvestmentPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (riskFilter !== "all") params.set("risk_level", riskFilter)
        if (searchQuery.trim()) params.set("search", searchQuery.trim())
        const qs = params.toString()
        const res = await apiFetch<{ success: boolean; plans: PublicInvestmentPlan[] }>(
          `/investment-plans/public${qs ? `?${qs}` : ""}`
        )
        if (!cancelled && res.success) {
          setPlans(res.plans || [])
          setError(null)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load investment plans")
          setPlans([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [searchQuery, riskFilter])

  const formatCurrency = (amount: number | string) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(
      Number(amount) || 0
    )

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-bold text-xl">Investment opportunities</h1>
              <p className="text-xs text-muted-foreground">Member cooperative plans</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge className="mb-4" variant="secondary">
            <TrendingUp className="h-3 w-3 mr-1" />
            Live plans
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Grow your cooperative wealth</h1>
          <p className="text-muted-foreground text-lg">
            Browse active investment plans. Sign in as a member to subscribe and track returns on your dashboard.
          </p>
        </div>

        <div className="mb-8 space-y-4 max-w-5xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {(["all", "low", "medium", "high"] as const).map((risk) => (
              <Button
                key={risk}
                variant={riskFilter === risk ? "default" : "outline"}
                onClick={() => setRiskFilter(risk)}
                size="sm"
              >
                {risk === "all" ? "All risk levels" : `${risk.charAt(0).toUpperCase()}${risk.slice(1)} risk`}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-muted-foreground">{error}</div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No investment plans are available right now.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-xl transition-shadow">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    <Badge>{plan.expected_return_rate}% p.a.</Badge>
                  </div>
                  {plan.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{plan.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Min. amount</p>
                      <p className="font-semibold">{formatCurrency(plan.min_amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Max. amount</p>
                      <p className="font-semibold">{formatCurrency(plan.max_amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-semibold">
                        {plan.min_duration_months}–{plan.max_duration_months} mo
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Returns</p>
                      <p className="font-semibold capitalize">{plan.return_type?.replace(/_/g, " ") || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground pt-2 border-t">
                    <Calendar className="h-3 w-3 mr-1" />
                    Risk: {plan.risk_level || "medium"}
                  </div>
                </CardContent>
                <CardFooter className="p-5 pt-0">
                  <Link
                    href={`/login?redirect=${encodeURIComponent(`/dashboard/investment-plans/${plan.id}`)}`}
                    className="w-full"
                  >
                    <Button className="w-full" size="sm">
                      Sign in to invest
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
