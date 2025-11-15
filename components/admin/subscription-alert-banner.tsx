"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTenantSubscription } from "@/lib/hooks/use-subscription"
import { useState } from "react"

export function AdminSubscriptionAlertBanner() {
  const { hasActiveSubscription, isLoading } = useTenantSubscription()
  const [dismissed, setDismissed] = useState(false)

  // Don't show if loading, has active subscription, or dismissed
  if (isLoading || hasActiveSubscription || dismissed) {
    return null
  }

  return (
    <Alert variant="destructive" className="rounded-none border-x-0 border-t-0 mb-0">
      <AlertCircle className="h-4 w-4" />
      <div className="flex items-center justify-between flex-1">
        <div className="flex-1">
          <AlertTitle>No Active Tenant Subscription</AlertTitle>
          <AlertDescription>
            Your tenant subscription has expired or is inactive. Please subscribe to continue using all features.
          </AlertDescription>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Link href="/admin/subscription">
            <Button size="sm" variant="outline" className="bg-background">
              Subscribe Now
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Alert>
  )
}

