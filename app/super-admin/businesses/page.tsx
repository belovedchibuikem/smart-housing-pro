"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building2, Search, Users, Calendar, CheckCircle, AlertCircle, XCircle, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { apiFetch } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"

interface Business {
  id: string
  name: string
  slug: string
  custom_domain?: string
  full_domain?: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  contact_email: string
  contact_phone?: string
  address?: string
  status: string
  subscription_status: string
  trial_ends_at?: string
  subscription_ends_at?: string
  settings?: any
  subscription?: {
    id: string
    package: string
    status: string
    ends_at?: string
  }
  created_at: string
  updated_at: string
}

interface BusinessesResponse {
  businesses: Business[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export default function BusinessesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { isLoading, data, error, loadData } = usePageLoading<BusinessesResponse>()

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
            if (statusFilter !== 'all') params.append('subscription_status', statusFilter)
            
            const response = await apiFetch<BusinessesResponse>(`/super-admin/businesses?${params.toString()}`)
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
      if (statusFilter !== 'all') params.append('subscription_status', statusFilter)
      
      const response = await apiFetch<BusinessesResponse>(`/super-admin/businesses?${params.toString()}`)
      return response
    })
  }, [loadData, statusFilter])

  if (error) return <div className="p-6 text-red-600">{error}</div>

  const businesses = data?.businesses || []

  const getStatusBadge = (status: string, subscriptionStatus: string) => {
    if (status === "suspended") {
      return (
        <div className="flex items-center gap-1 text-red-600 text-sm">
          <XCircle className="h-4 w-4" />
          Suspended
        </div>
      )
    }
    if (subscriptionStatus === "trial") {
      return (
        <div className="flex items-center gap-1 text-orange-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          Trial
        </div>
      )
    }
    if (subscriptionStatus === "past_due") {
      return (
        <div className="flex items-center gap-1 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          Past Due
        </div>
      )
    }
    if (subscriptionStatus === "active") {
      return (
        <div className="flex items-center gap-1 text-green-600 text-sm">
          <CheckCircle className="h-4 w-4" />
          Active
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1 text-muted-foreground text-sm">
        <XCircle className="h-4 w-4" />
        Cancelled
      </div>
    )
  }

  // Since we're filtering on the API side, we don't need client-side filtering
  const filteredBusinesses = businesses

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Businesses</h1>
        <p className="text-muted-foreground mt-2">Manage all businesses on the platform</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Businesses</p>
          <p className="text-2xl font-bold mt-1">{data?.pagination?.total || businesses.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold mt-1 text-green-600">
            {businesses.filter((b) => b.subscription_status === "active").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Trial</p>
          <p className="text-2xl font-bold mt-1 text-orange-600">
            {businesses.filter((b) => b.subscription_status === "trial").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Past Due</p>
          <p className="text-2xl font-bold mt-1 text-red-600">
            {businesses.filter((b) => b.subscription_status === "past_due").length}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search businesses..."
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

      {/* Businesses List */}
      <div className="space-y-4">
        {filteredBusinesses.map((business) => (
          <Card key={business.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{business.name}</h3>
                    {getStatusBadge(business.status, business.subscription_status)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Slug</p>
                      <p className="font-medium">{business.slug}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Package</p>
                      <p className="font-medium">{business.subscription?.package || 'No Package'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Contact</p>
                      <p className="font-medium text-sm">{business.contact_email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Joined</p>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(business.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {(business.custom_domain || business.full_domain) && (
                    <div className="mt-2 text-sm">
                      <p className="text-muted-foreground">Domain</p>
                      <p className="font-medium text-primary">{business.custom_domain || business.full_domain}</p>
                    </div>
                  )}
                  {business.trial_ends_at && (
                    <div className="mt-2 text-sm text-orange-600">
                      Trial ends: {new Date(business.trial_ends_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/super-admin/businesses/${business.id}`}>View Details</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/super-admin/businesses/${business.id}/admin`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Admin
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredBusinesses.length === 0 && (
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">No businesses found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </Card>
      )}
    </div>
  )
}
