"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AutoPaymentSettings, type ContributionAutoPaySetting } from "@/components/contributions/auto-payment-settings"
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Loader2,
  Plus,
  Target,
  TrendingUp,
  Wallet,
  XCircle,
  Clock,
  Search,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getContributionAutoPaySetting,
  getMemberContributions,
  getMemberSubscriptionPaymentMethods,
  updateContributionAutoPaySetting,
  type MemberContributionFilters,
} from "@/lib/api/client"

type ContributionListItem = {
  id: string
  amount: number
  status: string
  frequency?: string | null
  type?: string | null
  contribution_date?: string | null
  approved_at?: string | null
  rejection_reason?: string | null
  plan?: { id: string; name: string }
}

type ContributionStats = {
  total_contributions: number
  this_month: number
  this_year: number
  average_monthly: number
  completed_payments: number
  next_due_date?: string | null
}

type Pagination = {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "Approved", value: "approved" },
  { label: "Pending", value: "pending" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Rejected", value: "rejected" },
]

const typeOptions = [
  { label: "All Types", value: "all" },
  { label: "Regular", value: "regular" },
  { label: "Special", value: "special" },
]

const perPageOptions = [10, 20, 50]

const defaultFilters: MemberContributionFilters & { payment_method: string } = {
  search: "",
  status: "all",
  type: "all",
  date_from: "",
  date_to: "",
  per_page: perPageOptions[0],
  page: 1,
  payment_method: "all",
}

const moneyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
})

export default function ContributionsPage() {
  const { toast } = useToast()
  const [stats, setStats] = useState<ContributionStats | null>(null)
  const [contributions, setContributions] = useState<ContributionListItem[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    last_page: 1,
    per_page: perPageOptions[0],
    total: 0,
  })
  const [filters, setFilters] = useState(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)
  const [loading, setLoading] = useState(true)
  const [autoPaySetting, setAutoPaySetting] = useState<ContributionAutoPaySetting | null>(null)
  const [autoPayLoading, setAutoPayLoading] = useState(true)
  const [autoPaySaving, setAutoPaySaving] = useState(false)

  const loadContributions = useCallback(
    async (params: MemberContributionFilters & { payment_method: string }) => {
      setLoading(true)
      try {
        const response = await getMemberContributions(params)
        setContributions(response.contributions ?? [])
        setStats(response.stats)
        setPagination(response.pagination)
      } catch (error: any) {
        console.error("Failed to load contributions", error)
        toast({
          title: "Unable to load contributions",
          description: error?.message || "Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const loadAutoPay = useCallback(async () => {
    setAutoPayLoading(true)
    try {
      const response = await getContributionAutoPaySetting()
      setAutoPaySetting(response.setting ?? null)
    } catch (error: any) {
      console.error("Failed to load auto-pay setting", error)
      toast({
        title: "Unable to load auto-payment settings",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setAutoPayLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadContributions(defaultFilters)
    loadAutoPay()

    // Preload payment methods for card reference hints (optional future use)
    getMemberSubscriptionPaymentMethods().catch(() => undefined)
  }, [loadAutoPay, loadContributions])

  const onApplyFilters = () => {
    const next = { ...filters, page: 1 }
    setAppliedFilters(next)
    setPagination((prev) => ({ ...prev, current_page: 1 }))
    loadContributions(next)
  }

  const onClearFilters = () => {
    setFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
    loadContributions(defaultFilters)
  }

  const onPageChange = (direction: "prev" | "next") => {
    const nextPage =
      direction === "prev" ? Math.max(1, pagination.current_page - 1) : Math.min(pagination.last_page, pagination.current_page + 1)
    if (nextPage === pagination.current_page) return
    const next = { ...appliedFilters, page: nextPage }
    setAppliedFilters(next)
    setPagination((prev) => ({ ...prev, current_page: nextPage }))
    loadContributions(next)
  }

  const handleAutoPaySave = async (payload: ContributionAutoPaySetting) => {
    try {
      setAutoPaySaving(true)
      await updateContributionAutoPaySetting({
        is_enabled: payload.is_enabled,
        payment_method: payload.payment_method,
        amount: payload.amount ?? undefined,
        day_of_month: payload.day_of_month,
        card_reference: payload.card_reference ?? undefined,
        metadata: payload.metadata ?? undefined,
      })
      toast({
        title: "Auto-payment updated",
        description: payload.is_enabled
          ? "Your contribution auto-payment has been scheduled."
          : "Auto-payment has been disabled.",
      })
      loadAutoPay()
    } catch (error: any) {
      console.error("Failed to update auto-pay", error)
      toast({
        title: "Unable to update auto-payment",
        description: error?.message || "Please review the details and try again.",
        variant: "destructive",
      })
    } finally {
      setAutoPaySaving(false)
    }
  }

  const summaryCards = useMemo(() => {
    return [
      {
        title: "Total Contributions",
        icon: Wallet,
        tone: "primary",
        value: stats ? moneyFormatter.format(stats.total_contributions) : "—",
      },
      {
        title: "This Month",
        icon: Calendar,
        tone: "green",
        value: stats ? moneyFormatter.format(stats.this_month) : "—",
      },
      {
        title: "This Year",
        icon: TrendingUp,
        tone: "blue",
        value: stats ? moneyFormatter.format(stats.this_year) : "—",
      },
      {
        title: "Average Monthly",
        icon: Target,
        tone: "purple",
        value: stats ? moneyFormatter.format(stats.average_monthly) : "—",
      },
    ]
  }, [stats])

  const nextDueDate = useMemo(() => {
    if (!stats?.next_due_date) return null
    return new Date(stats.next_due_date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }, [stats?.next_due_date])

  const contributionStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approved</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Scheduled</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <ArrowRight className="h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Contributions</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Monitor contributions and automate repayments.</p>
        </div>
        <Link href="/dashboard/contributions/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Make Contribution
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <Card key={card.title} className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
            </div>
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  index === 0
                    ? "bg-primary/10 text-primary"
                    : index === 1
                      ? "bg-green-100 text-green-600"
                      : index === 2
                        ? "bg-blue-100 text-blue-600"
                        : "bg-purple-100 text-purple-600"
                }`}
              >
                <card.icon className="h-6 w-6" />
            </div>
          </div>
        </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-6">
            <p className="text-sm text-muted-foreground">Completed Payments</p>
          <p className="text-3xl font-bold mt-2">{stats?.completed_payments ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">All time completed contributions</p>
        </Card>
        <Card className="p-6">
            <p className="text-sm text-muted-foreground">Next Due Date</p>
          <p className="text-3xl font-bold mt-2">{nextDueDate ?? "No pending contributions"}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Upcoming payment based on your contribution plan
          </p>
        </Card>
      </div>

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="history" className="flex-1 sm:flex-none">
            Contribution History
          </TabsTrigger>
          <TabsTrigger value="autopay" className="flex-1 sm:flex-none">
            Auto-Payment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by reference or plan"
                value={filters.search ?? ""}
                onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                className="pl-10"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 bg-muted/30 rounded-lg p-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filters.status ?? "all"} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Contribution Type</Label>
                <Select value={filters.type ?? "all"} onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date From</Label>
                <Input
                  type="date"
                  value={filters.date_from ?? ""}
                  onChange={(event) => setFilters((prev) => ({ ...prev, date_from: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Date To</Label>
                <Input
                  type="date"
                  value={filters.date_to ?? ""}
                  onChange={(event) => setFilters((prev) => ({ ...prev, date_to: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Per Page</Label>
                <Select
                  value={String(filters.per_page ?? perPageOptions[0])}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, per_page: Number(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {perPageOptions.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size} per page
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 flex gap-3 justify-end items-center">
                <Button variant="outline" onClick={onClearFilters}>
                  Reset
                </Button>
                <Button onClick={onApplyFilters}>Apply Filters</Button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading contributions...
              </div>
            ) : contributions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No contributions found. Try adjusting your filters or make a contribution.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contributions.map((contribution) => {
                  const date = contribution.contribution_date
                    ? new Date(contribution.contribution_date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"

                  return (
                    <div
                      key={contribution.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {statusIcon(contribution.status)}
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {contribution.plan?.name ?? "Contribution"} <span className="text-xs text-muted-foreground">#{contribution.id}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {date} {contribution.type ? `• ${contribution.type}` : ""}{" "}
                            {contribution.frequency ? `• ${contribution.frequency}` : ""}
                          </p>
                          {contribution.rejection_reason && (
                            <p className="text-xs text-red-600">Reason: {contribution.rejection_reason}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex sm:flex-col sm:items-end gap-2 items-center">
                        <p className="font-semibold text-lg">{moneyFormatter.format(contribution.amount)}</p>
                        {contributionStatusBadge(contribution.status)}
                      </div>
                    </div>
                  )
                })}

                <div className="flex items-center justify-between px-4 py-3 text-sm text-muted-foreground border rounded-lg">
                  <span>
                    Page {pagination.current_page} of {pagination.last_page} • {pagination.total.toLocaleString()} records
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange("prev")}
                      disabled={pagination.current_page <= 1 || loading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange("next")}
                      disabled={pagination.current_page >= pagination.last_page || loading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="autopay">
          {autoPayLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading auto-payment settings...
            </div>
          ) : (
            <AutoPaymentSettings setting={autoPaySetting} saving={autoPaySaving} onSave={handleAutoPaySave} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
