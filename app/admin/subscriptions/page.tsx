"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, CreditCard, Package, Loader2 } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { getCurrentSubscription, getSubscriptionHistory, getSubscriptionPackages } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateString
  }
}

function getStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    expired: "secondary",
    cancelled: "destructive",
    past_due: "destructive",
    trial: "outline",
  }
  return variants[status] || "secondary"
}

export default function AdminSubscriptionsPage() {
  const { isLoading, loadData } = usePageLoading()
  const [activeSubscription, setActiveSubscription] = useState<any>(null)
  const [subscriptionHistory, setSubscriptionHistory] = useState<Array<{
    id: string
    package_name: string
    amount: number
    status: string
    payment_method: string
    starts_at: string
    ends_at: string
    created_at: string
  }>>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData(async () => {
      try {
        const [currentRes, historyRes] = await Promise.all([
          getCurrentSubscription().catch(() => ({ subscription: null })),
          getSubscriptionHistory().catch(() => ({ subscriptions: [] })),
        ])

        if (currentRes.subscription) {
          setActiveSubscription(currentRes.subscription)
        }

        if (historyRes.subscriptions) {
          setSubscriptionHistory(historyRes.subscriptions)
        }
      } catch (err: any) {
        console.error("Error loading subscriptions:", err)
        setError(err.message || "Failed to load subscriptions")
      }
    })
  }, [loadData])

  if (error && !activeSubscription && subscriptionHistory.length === 0) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const daysRemaining = activeSubscription?.ends_at 
    ? Math.max(0, Math.ceil((new Date(activeSubscription.ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tenant Subscription</h1>
          <p className="text-muted-foreground">Manage your tenant subscription and view history</p>
        </div>
        <Link href="/admin/subscription">
          <Button>
            <Package className="h-4 w-4 mr-2" />
            Browse Packages
          </Button>
        </Link>
      </div>

      {activeSubscription ? (
      <Card className="border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Subscription</CardTitle>
              <CardDescription>Your current subscription plan</CardDescription>
            </div>
              <Badge className={activeSubscription.is_active ? "bg-green-600" : ""}>
                {activeSubscription.status}
              </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Package</div>
                  <div className="font-semibold">{activeSubscription.package_name || activeSubscription.package?.name || 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">₦{Number(activeSubscription.amount || 0).toLocaleString()}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Valid Period</div>
                  <div className="font-semibold">{formatDate(activeSubscription.starts_at || activeSubscription.start_date)}</div>
                  <div className="text-sm text-muted-foreground">to {formatDate(activeSubscription.ends_at || activeSubscription.end_date)}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Days Remaining</div>
                  <div className="font-semibold text-2xl">{daysRemaining}</div>
                <Link href="/admin/subscription">
                  <Button variant="link" className="p-0 h-auto text-sm">
                    Renew Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      ) : isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>You don't have an active subscription. Subscribe to a plan to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/subscription">
              <Button>
                <Package className="h-4 w-4 mr-2" />
                Browse Packages
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Subscription History</CardTitle>
          <CardDescription>View all your past and current subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && subscriptionHistory.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : subscriptionHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No subscription history found.</p>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptionHistory.map((sub) => (
                <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.package_name}</TableCell>
                    <TableCell>₦{Number(sub.amount || 0).toLocaleString()}</TableCell>
                    <TableCell>{formatDate(sub.starts_at || sub.start_date || sub.created_at)}</TableCell>
                    <TableCell>{formatDate(sub.ends_at || sub.end_date || '')}</TableCell>
                    <TableCell className="capitalize">{sub.payment_method || 'N/A'}</TableCell>
                  <TableCell>
                      <Badge variant={getStatusBadge(sub.status)}>{sub.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

