"use client"

import { useState, useEffect, useCallback } from "react"
import { getCurrentSubscription, getMemberCurrentSubscription } from "@/lib/api/client"
import { useRouter, usePathname } from "next/navigation"

interface SubscriptionStatus {
  hasActiveSubscription: boolean
  subscription: any | null
  isLoading: boolean
  error: string | null
}

/**
 * Hook to check tenant subscription status (for admin)
 */
export function useTenantSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus>({
    hasActiveSubscription: false,
    subscription: null,
    isLoading: true,
    error: null,
  })

  const checkSubscription = useCallback(async () => {
    try {
      setStatus((prev) => ({ ...prev, isLoading: true, error: null }))
      const response = await getCurrentSubscription()
      
      if (response.subscription) {
        const subscription = response.subscription
        // Check if subscription is active based on status and end date
        const isActive = subscription.is_active !== false && 
          subscription.status === "active" && 
          new Date(subscription.ends_at) > new Date()
        
        setStatus({
          hasActiveSubscription: isActive,
          subscription,
          isLoading: false,
          error: null,
        })
      } else {
        // No subscription found
        setStatus({
          hasActiveSubscription: false,
          subscription: null,
          isLoading: false,
          error: null,
        })
      }
    } catch (error: any) {
      // If error is 403 or subscription_required, treat as no subscription
      if (error.message?.includes("subscription") || error.status === 403) {
        setStatus({
          hasActiveSubscription: false,
          subscription: null,
          isLoading: false,
          error: null,
        })
      } else {
        setStatus({
          hasActiveSubscription: false,
          subscription: null,
          isLoading: false,
          error: error.message || "Failed to check subscription",
        })
      }
    }
  }, [])

  useEffect(() => {
    checkSubscription()
  }, [checkSubscription])

  return {
    ...status,
    refetch: checkSubscription,
  }
}

/**
 * Hook to check member subscription status (for users/members)
 */
export function useMemberSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus>({
    hasActiveSubscription: false,
    subscription: null,
    isLoading: true,
    error: null,
  })

  const checkSubscription = useCallback(async () => {
    try {
      setStatus((prev) => ({ ...prev, isLoading: true, error: null }))
      const response = await getMemberCurrentSubscription()
      
      if (response.subscription) {
        const subscription = response.subscription
        // Check if subscription is active based on status, end date, and payment status
        const isActive = subscription.is_active !== false &&
          subscription.status === "active" && 
          new Date(subscription.end_date) > new Date() &&
          (subscription.payment_status === "approved" || subscription.payment_status === "completed")
        
        setStatus({
          hasActiveSubscription: isActive,
          subscription,
          isLoading: false,
          error: null,
        })
      } else {
        // No subscription found
        setStatus({
          hasActiveSubscription: false,
          subscription: null,
          isLoading: false,
          error: null,
        })
      }
    } catch (error: any) {
      // If error is 403 or subscription_required, treat as no subscription
      if (error.message?.includes("subscription") || error.status === 403) {
        setStatus({
          hasActiveSubscription: false,
          subscription: null,
          isLoading: false,
          error: null,
        })
      } else {
        setStatus({
          hasActiveSubscription: false,
          subscription: null,
          isLoading: false,
          error: error.message || "Failed to check subscription",
        })
      }
    }
  }, [])

  useEffect(() => {
    checkSubscription()
  }, [checkSubscription])

  return {
    ...status,
    refetch: checkSubscription,
  }
}

/**
 * Hook to handle subscription guard redirects
 * 
 * @param isAdmin - If true, checks tenant subscription (for admin). If false, checks member subscription (for users/members)
 */
export function useSubscriptionGuard(isAdmin: boolean = false) {
  const router = useRouter()
  const pathname = usePathname()
  
  // Only call the relevant subscription hook based on isAdmin
  // Note: We can't conditionally call hooks, so we call both but only use the relevant one
  // This is acceptable since the hooks handle their own loading states
  const tenantSubscription = useTenantSubscription()
  const memberSubscription = useMemberSubscription()
  
  // Select the appropriate subscription based on isAdmin
  const subscription = isAdmin ? tenantSubscription : memberSubscription
  const subscriptionPath = isAdmin ? "/admin/subscriptions" : "/dashboard/subscriptions"

  useEffect(() => {
    // Don't check if still loading
    if (subscription.isLoading) {
      return
    }

    // Allow access to subscription pages even without active subscription
    // For tenant admin: exclude tenant subscription browsing and payment flow routes
    // For members: exclude member subscription routes
    const isSubscriptionPage = pathname.startsWith(subscriptionPath) ||
      pathname.startsWith("/subscriptions") ||
      pathname.startsWith("/member-subscriptions") ||
      pathname.startsWith("/dashboard/subscriptions") ||
      pathname.startsWith("/admin/subscriptions") ||
      (isAdmin && (
        pathname.startsWith("/admin/subscription") || // Tenant subscription browsing, checkout, and success pages
        pathname.startsWith("/subscription") || // Alternative tenant subscription browsing page
        pathname.startsWith("/subscriptions/checkout") || // Tenant subscription checkout
        pathname.startsWith("/subscriptions/success") || // Tenant subscription success
        pathname.startsWith("/subscription/checkout") || // Alternative checkout route
        pathname.startsWith("/subscription/success") // Alternative success route
      ))

    // Allow access to auth pages
    const isAuthPage = pathname.startsWith("/login") || 
      pathname.startsWith("/register") ||
      pathname.startsWith("/auth")

    if (!subscription.hasActiveSubscription && !isSubscriptionPage && !isAuthPage) {
      console.log(`[Subscription Guard] No active ${isAdmin ? 'tenant' : 'member'} subscription, redirecting to ${subscriptionPath}`)
      router.push(subscriptionPath)
    }
  }, [subscription.hasActiveSubscription, subscription.isLoading, pathname, router, subscriptionPath, isAdmin])

  return subscription
}


