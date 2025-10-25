"use client"

import { useTenant as useTenantContext } from "@/lib/tenant/tenant-context"

export function useTenant() {
  return useTenantContext()
}

// Helper hook to check if tenant has a specific module
export function useTenantModule(moduleSlug: string) {
  const { tenant } = useTenantContext()

  // TODO: Implement actual module checking logic
  // For now, return true (all modules available)
  return {
    hasAccess: true,
    isLoading: !tenant,
  }
}

// Helper hook to check tenant limits
export function useTenantLimit(limitKey: string) {
  const { tenant } = useTenantContext()

  // TODO: Implement actual limit checking logic
  return {
    currentValue: 0,
    limitValue: -1, // -1 means unlimited
    hasReachedLimit: false,
    isLoading: !tenant,
  }
}
