"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Loader2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { getSubscriptionPackages } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"

function formatDuration(days: number): string {
  if (days === 7) return "7 days"
  if (days === 30) return "30 days"
  if (days === 90) return "90 days"
  if (days === 365) return "365 days"
  return `${days} days`
}

export default function AdminSubscriptionPage() {
  const { isLoading, loadData } = usePageLoading()
  const [packages, setPackages] = useState<Array<{
    id: string
    name: string
    slug: string
    description?: string
    price: number
    billing_cycle: string
    duration: number
    duration_days: number
    trial_days: number
    features: any[]
    is_popular: boolean
    is_active: boolean
  }>>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData(async () => {
      try {
        const response = await getSubscriptionPackages()
        setPackages(response.packages || [])
      } catch (err: any) {
        console.error("Error loading packages:", err)
        setError(err.message || "Failed to load subscription packages")
      }
    })
  }, [loadData])

  if (error && packages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-16">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Tenant Subscription Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select a plan that works best for your organization and get instant access to all features
          </p>
        </div>

        {isLoading && packages.length === 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-4 w-20 mb-4" />
                  <Skeleton className="h-10 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No subscription packages available at the moment.</p>
          </div>
        ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {packages.map((pkg) => (
              <Card key={pkg.id} className={pkg.is_popular ? "border-primary shadow-lg scale-105" : ""}>
              <CardHeader>
                  {pkg.is_popular && <Badge className="w-fit mb-2">Most Popular</Badge>}
                <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <CardDescription>{formatDuration(pkg.duration_days)}</CardDescription>
                <div className="mt-4">
                    <span className="text-4xl font-bold">₦{Number(pkg.price).toLocaleString()}</span>
                </div>
                  {pkg.description && (
                    <p className="text-sm text-muted-foreground mt-2">{pkg.description}</p>
                  )}
              </CardHeader>
              <CardContent>
                  {pkg.features && pkg.features.length > 0 ? (
                <ul className="space-y-3">
                      {Array.isArray(pkg.features) ? (
                        pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm">{typeof feature === 'string' ? feature : JSON.stringify(feature)}</span>
                          </li>
                        ))
                      ) : (
                        Object.entries(pkg.features).map(([key, value], index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm">
                              <strong>{key}:</strong> {String(value)}
                            </span>
                    </li>
                        ))
                      )}
                </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">All standard features included</p>
                  )}
              </CardContent>
              <CardFooter>
                  <Link href={`/admin/subscription/checkout?package=${pkg.id}`} className="w-full">
                    <Button className="w-full" variant={pkg.is_popular ? "default" : "outline"}>
                    Subscribe Now
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        )}

        <div className="text-center mt-12">
          <Link href="/admin/subscriptions">
            <Button variant="outline">
              View Current Subscription
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

