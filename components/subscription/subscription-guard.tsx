"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSubscriptionGuard } from "@/lib/hooks/use-subscription"
import { Loader2 } from "lucide-react"

interface SubscriptionGuardProps {
  children: React.ReactNode
  isAdmin?: boolean
}

/**
 * Component that guards routes based on subscription status
 * Redirects to subscription page if subscription is inactive
 */
export function SubscriptionGuard({ children, isAdmin = false }: SubscriptionGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const subscription = useSubscriptionGuard(isAdmin)
  const subscriptionPath = isAdmin ? "/admin/subscriptions" : "/dashboard/subscriptions"

  // Allow access to subscription pages even without active subscription
  const isSubscriptionPage = pathname.startsWith(subscriptionPath) ||
    pathname.startsWith("/subscriptions") ||
    pathname.startsWith("/member-subscriptions") ||
    pathname.startsWith("/dashboard/subscriptions") ||
    pathname.startsWith("/admin/subscriptions")

  // Allow access to auth pages
  const isAuthPage = pathname.startsWith("/login") || 
    pathname.startsWith("/register") ||
    pathname.startsWith("/auth")

  useEffect(() => {
    // Don't redirect if still loading
    if (subscription.isLoading) {
      return
    }

    // Redirect if no active subscription and not on subscription/auth pages
    if (!subscription.hasActiveSubscription && !isSubscriptionPage && !isAuthPage) {
      console.log(`[Subscription Guard] No active subscription, redirecting to ${subscriptionPath}`)
      router.push(subscriptionPath)
    }
  }, [subscription.hasActiveSubscription, subscription.isLoading, pathname, router, subscriptionPath, isSubscriptionPage, isAuthPage])

  // Show loading while checking subscription
  if (subscription.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Checking subscription status...</p>
        </div>
      </div>
    )
  }

  // If no subscription and not on subscription page, don't render children (redirect will happen)
  if (!subscription.hasActiveSubscription && !isSubscriptionPage && !isAuthPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to subscription page...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

