"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface SubscriptionBannerProps {
  message?: string
  redirectTo?: string
  onDismiss?: () => void
}

/**
 * Banner component to display subscription warning/expired message
 */
export function SubscriptionBanner({ 
  message = "Your subscription has expired. Please renew to continue using the platform.",
  redirectTo,
  onDismiss 
}: SubscriptionBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) {
    return null
  }

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Subscription Required</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        <div className="flex items-center gap-2 ml-4">
          {redirectTo && (
            <Link href={redirectTo}>
              <Button size="sm" variant="outline">
                Subscribe Now
              </Button>
            </Link>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}

