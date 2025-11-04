// Tenant Utility Functions

import type { Tenant, PackageLimits, TenantUsage } from "@/lib/types/tenant"

/**
 * Extract tenant slug from hostname
 * Examples:
 * - business.platform.com -> business
 * - custom-domain.com -> lookup in database
 * - localhost:3000 -> null (development)
 */
export function getTenantSlugFromHost(hostname: string): string | null {
  // Development environment - allow localhost subdomains for testing
  // e.g., tenant1.localhost:3000 or tenant1.127.0.0.1:3000
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    // Check if it's a subdomain pattern: subdomain.localhost:port
    const localhostMatch = hostname.match(/^([^.]+)\.(localhost|127\.0\.0\.1)(:\d+)?$/)
    if (localhostMatch && localhostMatch[1]) {
      return localhostMatch[1]
    }
    return null
  }

  // v0 preview domains like preview.v0.dev should not be treated as tenant subdomains
  if (hostname.includes("v0.dev") || hostname.includes("vercel.app") || hostname.includes("vusercontent.net")) {
    return null
  }

  // Get platform domain from environment or use default
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "frschousing.com"

  // Check if hostname ends with the platform domain
  if (!hostname.endsWith(`.${platformDomain}`) && hostname !== platformDomain) {
    // This is a custom domain, not a subdomain
    return null
  }

  // If it's the main platform domain (no subdomain), return null
  if (hostname === platformDomain) {
    return null
  }

  // Extract the subdomain (tenant slug)
  const subdomain = hostname.replace(`.${platformDomain}`, "")

  // If the subdomain contains dots, it's not a valid tenant slug
  if (subdomain.includes(".")) {
    return null
  }

  return subdomain
}

/**
 * Check if hostname is a custom domain (not a subdomain of the platform)
 */
export function isCustomDomain(hostname: string): boolean {
  // Development environment
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    return false
  }

  if (hostname.includes("v0.dev") || hostname.includes("vercel.app") || hostname.includes("vusercontent.net")) {
    return false
  }

  // Get platform domain from environment or use default
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "frschousing.com"

  // Check if the hostname is not a subdomain of the main platform
  return !hostname.endsWith(`.${platformDomain}`) && hostname !== platformDomain
}

/**
 * Check if tenant has access to a specific module
 */
export function tenantHasModule(tenant: Tenant, moduleSlug: string): boolean {
  // This would check the tenant's subscription package modules
  // For now, return true (will be implemented with actual subscription data)
  return true
}

/**
 * Check if tenant has reached a usage limit
 */
export function hasReachedLimit(usage: TenantUsage, limits: PackageLimits): boolean {
  const limitKey = usage.metric_name as keyof PackageLimits
  const limit = limits[limitKey]

  // -1 means unlimited
  if (typeof limit === "number" && limit === -1) {
    return false
  }

  return usage.current_value >= (limit as number)
}

/**
 * Calculate usage percentage
 */
export function getUsagePercentage(currentValue: number, limitValue: number): number {
  if (limitValue === -1) return 0 // Unlimited
  if (limitValue === 0) return 100
  return Math.min(Math.round((currentValue / limitValue) * 100), 100)
}

/**
 * Format tenant URL
 */
export function getTenantUrl(tenant: Tenant): string {
  if (tenant.custom_domain) {
    return `https://${tenant.custom_domain}`
  }

  // Use environment variable for platform domain
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "platform.com"
  return `https://${tenant.slug}.${platformDomain}`
}

/**
 * Check if tenant subscription is active
 */
export function isSubscriptionActive(tenant: Tenant): boolean {
  return (
    tenant.status === "active" && (tenant.subscription_status === "active" || tenant.subscription_status === "trial")
  )
}

/**
 * Check if tenant is in trial period
 */
export function isInTrialPeriod(tenant: Tenant): boolean {
  if (tenant.subscription_status !== "trial" || !tenant.trial_ends_at) {
    return false
  }

  return new Date(tenant.trial_ends_at) > new Date()
}

/**
 * Get days remaining in trial
 */
export function getTrialDaysRemaining(tenant: Tenant): number {
  if (!tenant.trial_ends_at) return 0

  const now = new Date()
  const trialEnd = new Date(tenant.trial_ends_at)
  const diffTime = trialEnd.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays)
}
