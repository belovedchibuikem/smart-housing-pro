"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, CheckCircle, AlertCircle, XCircle, Calendar, CreditCard, Building2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { apiFetch } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"

interface BusinessSubscription {
  id: string
  business_name: string
  business_id: string
  package: string
  status: string
  current_period_start: string
  current_period_end: string
  amount: number
  next_billing_date?: string
  created_at: string
  updated_at: string
}

interface SubscriptionsResponse {
  subscriptions: BusinessSubscription[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export default function SubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { isLoading, data, error, loadData } = usePageLoading<SubscriptionsResponse>()

  // Debounced search
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (query: string) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          loadData(async () => {
            const params = new URLSearchParams()
            if (query) params.append('search', query)
            if (statusFilter !== 'all') params.append('status', statusFilter)
            
            const response = await apiFetch<SubscriptionsResponse>(`/super-admin/subscriptions?${params.toString()}`)
            return response
          })
        }, 300)
      }
    })(),
    [loadData, statusFilter]
  )

  useEffect(() => {
    debouncedSearch(searchQuery)
  }, [searchQuery, debouncedSearch])

  useEffect(() => {
    loadData(async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const response = await apiFetch<SubscriptionsResponse>(`/super-admin/subscriptions?${params.toString()}`)
      return response
    })
  }, [loadData, statusFilter])

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading || !data) return null // Let the skeleton loader handle the display

  const subscriptions = data?.subscriptions || []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <div className="flex items-center gap-1 text-green-600 text-sm">
            <CheckCircle className="h-4 w-4" />
            Active
          </div>
        )
      case "trial":
        return (
          <div className="flex items-center gap-1 text-orange-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            Trial
          </div>
        )
      case "past_due":
        return (
          <div className="flex items-center gap-1 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            Past Due
          </div>
        )
      case "cancelled":
        return (
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <XCircle className="h-4 w-4" />
            Cancelled
          </div>
        )
      default:
        return null
    }
  }

  // Since we're filtering on the API side, we don't need client-side filtering
  const filteredSubscriptions = subscriptions

  const stats = {
    total: data?.pagination?.total || subscriptions.length,
    active: subscriptions.filter((s) => s.status === "active").length,
    trial: subscriptions.filter((s) => s.status === "trial").length,
    past_due: subscriptions.filter((s) => s.status === "past_due").length,
    mrr: subscriptions
      .filter((s) => s.status === "active")
      .reduce((sum, s) => sum + (s.amount || 0), 0)
      .toFixed(2),
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground mt-2">Manage all business subscriptions and billing</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Subscriptions</p>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{stats.active}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Trial</p>
          <p className="text-2xl font-bold mt-1 text-orange-600">{stats.trial}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Past Due</p>
          <p className="text-2xl font-bold mt-1 text-red-600">{stats.past_due}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">MRR</p>
          <p className="text-2xl font-bold mt-1">₦{stats.mrr}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subscriptions..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="past_due">Past Due</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </Card>

      {/* Subscriptions List */}
      <div className="space-y-4">
        {filteredSubscriptions.map((subscription) => (
          <Card key={subscription.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{subscription.business_name}</h3>
                    {getStatusBadge(subscription.status)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Package</p>
                      <p className="font-medium">{subscription.package}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-medium flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />₦{(subscription.amount || 0).toFixed(2)}/mo
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Current Period</p>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {subscription.current_period_start ? new Date(subscription.current_period_start).toLocaleDateString() : 'N/A'} -{" "}
                        {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Next Billing</p>
                      <p className="font-medium">
                        {subscription.next_billing_date
                          ? new Date(subscription.next_billing_date).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/super-admin/businesses/${subscription.business_id}`}>View Business</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/super-admin/subscriptions/${subscription.id}`}>Manage</Link>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredSubscriptions.length === 0 && (
        <Card className="p-12 text-center">
          <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">No subscriptions found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </Card>
      )}
    </div>
  )
}
