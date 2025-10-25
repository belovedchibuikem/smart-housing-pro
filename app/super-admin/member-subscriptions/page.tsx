"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, DollarSign, TrendingUp, Package } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useEffect } from "react"
import { apiFetch } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"

interface MemberSubscriptionPackage {
  id: string
  name: string
  slug: string
  description: string
  price: number
  billing_cycle: string
  trial_days: number
  is_active: boolean
  is_featured: boolean
  limits: {
    max_members: number
    max_properties: number
    max_loan_products: number
    max_contribution_plans: number
    max_investment_plans: number
    max_mortgage_plans: number
    storage_gb: number
    max_admins: number
    has_role_management: boolean
  }
  subscribers: number
  created_at: string
  updated_at: string
}

interface MemberSubscriptionsResponse {
  packages: MemberSubscriptionPackage[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export default function AdminSubscriptionsPage() {
  const { isLoading, data, error, loadData } = usePageLoading<MemberSubscriptionsResponse>()

  useEffect(() => {
    loadData(async () => {
      const response = await apiFetch<MemberSubscriptionsResponse>("/super-admin/member-subscriptions")
      return response
    })
  }, [loadData])

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading || !data) return null // Let the skeleton loader handle the display

  const packages = data?.packages || []

  const stats = [
    { label: "Total Packages", value: data?.pagination?.total || packages.length, icon: Package, color: "text-blue-600" },
    { label: "Active Subscribers", value: packages.reduce((sum, pkg) => sum + (pkg.subscribers || 0), 0).toLocaleString(), icon: Users, color: "text-green-600" },
    { label: "Monthly Revenue", value: `₦${packages.reduce((sum, pkg) => sum + ((pkg.price || 0) * (pkg.subscribers || 0)), 0).toLocaleString()}`, icon: DollarSign, color: "text-teal-600" },
    { label: "Growth Rate", value: "+12.5%", icon: TrendingUp, color: "text-purple-600" }, // This would need to be calculated from historical data
  ]


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">Manage subscription packages and monitor revenue</p>
        </div>
        <Link href="/super-admin/member-subscriptions/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Package
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Packages</CardTitle>
          <CardDescription>Manage and monitor all subscription packages</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Subscribers</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  <TableCell>₦{(pkg.price || 0).toLocaleString()}</TableCell>
                  <TableCell>{pkg.billing_cycle || 'N/A'}</TableCell>
                  <TableCell>{pkg.subscribers || 0}</TableCell>
                  <TableCell>₦{((pkg.price || 0) * (pkg.subscribers || 0)).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={pkg.is_active ? "default" : "secondary"}>
                      {pkg.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/super-admin/member-subscriptions/${pkg.id}/edit`}>Edit</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/super-admin/member-subscriptions/${pkg.id}`}>View</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}