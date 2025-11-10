"use client"

import { useEffect, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { toast as sonnerToast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getContributionPlans, switchContributionPlan } from "@/lib/api/client"

interface ContributionPlan {
  id: string
  name: string
  description: string | null
  amount: number
  minimum_amount: number
  frequency: string
  is_mandatory: boolean
}

interface MemberPlan {
  plan: ContributionPlan
  started_at: string | null
  last_contribution_at: string | null
  contributions_count: number
  total_contributed: number
}

export default function ContributionPlanPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [plans, setPlans] = useState<ContributionPlan[]>([])
  const [memberPlan, setMemberPlan] = useState<MemberPlan | null>(null)
  const [submitting, setSubmitting] = useState<string | null>(null)

  useEffect(() => {
    void fetchPlans(false)
  }, [])

  const fetchPlans = async (silent: boolean) => {
    if (silent) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await getContributionPlans()
      setPlans(response.plans ?? [])
      setMemberPlan(response.member_plan ?? null)
    } catch (error: any) {
      console.error("Failed to load contribution plans:", error)
      sonnerToast.error("Failed to load contribution plans", {
        description: error?.message ?? "Please try again later.",
      })
    } finally {
      if (silent) {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  const handleRefresh = async () => {
    if (!loading) {
      await fetchPlans(true)
    }
  }

  const handleSwitchPlan = async (planId: string) => {
    if (submitting || loading) return
    if (memberPlan?.plan.id === planId) {
      sonnerToast.info("You are already on this contribution plan.")
      return
    }

    setSubmitting(planId)
    try {
      const response = await switchContributionPlan(planId)
      if (response.success) {
        sonnerToast.success("Plan updated", {
          description: response.message ?? "Contribution plan switched successfully.",
        })
      } else {
        sonnerToast.info(response.message ?? "Plan updated.")
      }

      await fetchPlans(true)
    } catch (error: any) {
      console.error("Failed to switch contribution plan:", error)
      sonnerToast.error("Unable to switch plan", {
        description: error?.message ?? "Please try again later.",
      })
    } finally {
      setSubmitting(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatFrequency = (value: string) => {
    return value
      .split("_")
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ")
  }

  const formatDate = (value: string | null) => {
    if (!value) return "—"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "—"
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const currentPlanId = memberPlan?.plan.id

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-3xl font-bold">Contribution Plan</h1>
          <p className="text-muted-foreground">Review your active plan and explore other contribution options.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading || refreshing}>
          {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {loading ? (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading contribution plans...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your active contribution arrangement.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {memberPlan ? (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold">{memberPlan.plan.name}</h3>
                        {memberPlan.plan.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{memberPlan.plan.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>{memberPlan.plan.frequency.replace("_", " ")}</Badge>
                        {memberPlan.plan.is_mandatory && <Badge variant="secondary">Mandatory</Badge>}
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
            <div>
                        <p className="text-xs text-muted-foreground">Contribution Amount</p>
                        <p className="text-sm font-medium">{formatCurrency(memberPlan.plan.amount)}</p>
            </div>
            <div>
                        <p className="text-xs text-muted-foreground">Minimum Amount</p>
                        <p className="text-sm font-medium">{formatCurrency(memberPlan.plan.minimum_amount)}</p>
            </div>
            <div>
                        <p className="text-xs text-muted-foreground">Started On</p>
                        <p className="text-sm font-medium">{formatDate(memberPlan.started_at)}</p>
            </div>
            <div>
                        <p className="text-xs text-muted-foreground">Last Contribution</p>
                        <p className="text-sm font-medium">{formatDate(memberPlan.last_contribution_at)}</p>
            </div>
          </div>
                  </>
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    You have not joined a contribution plan yet. Review the available plans below to get started.
        </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plan Statistics</CardTitle>
                <CardDescription>Summary of your contributions under the active plan.</CardDescription>
              </CardHeader>
              <CardContent>
                {memberPlan ? (
                  <div className="grid gap-4 sm:grid-cols-2">
            <div>
                      <p className="text-xs text-muted-foreground">Total Contributed</p>
                      <p className="text-sm font-medium">{formatCurrency(memberPlan.total_contributed)}</p>
            </div>
            <div>
                      <p className="text-xs text-muted-foreground">Number of Contributions</p>
                      <p className="text-sm font-medium">{memberPlan.contributions_count}</p>
            </div>
            </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No contribution data yet. Once you join a plan and begin contributing, your statistics will appear
                    here.
            </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Available Plans</CardTitle>
              <CardDescription>These plans are configured by your cooperative administrator.</CardDescription>
            </CardHeader>
            <CardContent>
              {plans.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No contribution plans have been published yet. Please check back later.
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {plans.map((plan) => {
                    const isCurrent = currentPlanId === plan.id
                    return (
                      <div
                        key={plan.id}
                        className={`flex h-full flex-col gap-4 rounded-xl border p-6 shadow-sm transition-colors ${
                          isCurrent ? "border-amber-400 bg-amber-50/60" : "hover:border-amber-400/70"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                          {plan.is_mandatory && <Badge variant="secondary">Mandatory</Badge>}
        </div>
                        {plan.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3">{plan.description}</p>
                        )}

                        <div>
                          <p className="text-3xl font-bold text-amber-600">{formatCurrency(plan.amount)}</p>
                          <p className="text-sm text-muted-foreground">{formatFrequency(plan.frequency)}</p>
      </div>

                        <div className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                          Minimum contribution: <span className="font-medium text-foreground">{formatCurrency(plan.minimum_amount)}</span>
                        </div>
                        <Button
                          className="mt-auto w-full bg-amber-500 text-amber-950 hover:bg-amber-500/90 disabled:bg-amber-200 disabled:text-amber-500"
                          variant="default"
                          size="sm"
                          disabled={isCurrent || submitting === plan.id}
                          onClick={() => handleSwitchPlan(plan.id)}
                        >
                          {isCurrent ? "Current Plan" : submitting === plan.id ? "Switching..." : "Switch to Plan"}
                        </Button>
                        {isCurrent && (
                          <div className="text-center text-xs font-medium text-amber-700">
                            You are currently enrolled in this plan.
            </div>
                        )}
        </div>
                    )
                  })}
      </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
