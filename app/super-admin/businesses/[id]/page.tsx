"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  Users,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Edit,
  Ban,
  Play,
} from "lucide-react"
import Link from "next/link"
import { useEffect, use } from "react"
import { apiFetch } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"

interface BusinessDetail {
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
  // Additional fields for detail view
  members_count?: number
  properties_count?: number
  loans_count?: number
  monthly_revenue?: number
  total_revenue?: number
}

export default function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { isLoading, data, error, loadData } = usePageLoading<{ business: BusinessDetail }>()

  useEffect(() => {
    loadData(async () => {
      try {
        const response = await apiFetch<{ business: BusinessDetail }>(`/super-admin/businesses/${resolvedParams.id}`)
        return response
      } catch (error) {
        console.error('Failed to load business details:', error)
        throw error
      }
    })
  }, [loadData, resolvedParams.id])

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!data) return <div className="p-6">Loading business details...</div>

  const business = data.business

  const usageStats = [
    { label: "Members", current: business.members_count || 0, limit: 500, percentage: Math.min(((business.members_count || 0) / 500) * 100, 100) },
    { label: "Properties", current: business.properties_count || 0, limit: 100, percentage: Math.min(((business.properties_count || 0) / 100) * 100, 100) },
    { label: "Loan Products", current: business.loans_count || 0, limit: 20, percentage: Math.min(((business.loans_count || 0) / 20) * 100, 100) },
    { label: "Storage", current: 0, limit: 25, unit: "GB", percentage: 0 },
  ]

  // Recent activity would be fetched from API in a real implementation
  const recentActivity: Array<{
    id: string
    action: string
    details: string
    timestamp: string
  }> = []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{business.name}</h1>
            <p className="text-muted-foreground mt-1">{business.slug}</p>
            <div className="flex items-center gap-2 mt-2">
              {business.subscription_status === "active" ? (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  Active Subscription
                </div>
              ) : (
                <div className="flex items-center gap-1 text-orange-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Trial Period
                </div>
              )}
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{business.package} Plan</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin?business_id=${business.id}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Admin Panel
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/super-admin/businesses/${business.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          {business.status === "active" ? (
            <Button variant="outline" className="text-destructive bg-transparent">
              <Ban className="h-4 w-4 mr-2" />
              Suspend
            </Button>
          ) : (
            <Button variant="outline" className="text-green-600 bg-transparent">
              <Play className="h-4 w-4 mr-2" />
              Activate
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold mt-1">{(business.members_count || 0).toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Properties</p>
                  <p className="text-2xl font-bold mt-1">{business.properties_count || 0}</p>
                </div>
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Loans</p>
                  <p className="text-2xl font-bold mt-1">{business.loans_count || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold mt-1">₦{(business.monthly_revenue || 0).toLocaleString()}</p>
                </div>
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
            </Card>
          </div>

          {/* Contact Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{business.contact_email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{business.contact_phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{business.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">{new Date(business.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Subscription Details</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-semibold">{business.subscription?.package || 'No Package'} Plan</p>
                    <p className="text-sm text-muted-foreground">₦{(business.monthly_revenue || 0).toLocaleString()}/month</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Change Plan
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold text-green-600 mt-1">Active</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Next Billing Date</p>
                  <p className="font-semibold mt-1">{business.subscription_ends_at ? new Date(business.subscription_ends_at).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="font-semibold mt-1">₦{(business.total_revenue || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-semibold mt-1">Not configured</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Usage & Limits</h2>
            <div className="space-y-6">
              {usageStats.map((stat) => (
                <div key={stat.label}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{stat.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {stat.current.toLocaleString()} / {stat.limit === -1 ? "Unlimited" : stat.limit.toLocaleString()}{" "}
                      {stat.unit || ""}
                    </p>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${stat.percentage > 90 ? "bg-red-600" : stat.percentage > 75 ? "bg-orange-600" : "bg-green-600"}`}
                      style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                    />
                  </div>
                  {stat.percentage > 90 && (
                    <p className="text-sm text-red-600 mt-1">Approaching limit - consider upgrading</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Business Settings</h2>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <p className="font-medium mb-2">Custom Domain</p>
                <p className="text-sm text-muted-foreground mb-3">
                  {business.custom_domain || "No custom domain configured"}
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/super-admin/businesses/${business.id}/domains`}>Configure Domain</Link>
                </Button>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="font-medium mb-2">Branding</p>
                <div className="flex gap-4 mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Primary Color</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-6 w-6 rounded" style={{ backgroundColor: business.primary_color || '#000000' }} />
                      <span className="text-sm font-mono">{business.primary_color || '#000000'}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Secondary Color</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-6 w-6 rounded" style={{ backgroundColor: business.secondary_color || '#000000' }} />
                      <span className="text-sm font-mono">{business.secondary_color || '#000000'}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Update Branding
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
