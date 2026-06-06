"use client"

import { useTenant as useTenantContext } from "@/lib/tenant/tenant-context"

export function useTenant() {
  return useTenantContext()
}

// Helper hook to check if tenant has a specific module
export function useTenantModule(moduleSlug: string) {
  const { tenant } = useTenantContext()
  const enabledModules = Array.isArray((tenant as { enabled_modules?: string[] } | null)?.enabled_modules)
    ? ((tenant as { enabled_modules?: string[] }).enabled_modules as string[])
    : []

  return {
    hasAccess: enabledModules.length === 0 ? true : enabledModules.includes(moduleSlug),
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
