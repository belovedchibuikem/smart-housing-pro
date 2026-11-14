import type { Tenant, PackageLimits, TenantUsage } from "@/lib/types/tenant"

const KNOWN_PLATFORM_DOMAINS = ["smarthousing.com.ng", "frschousing.com"]

function platformDomains(): string[] {
  const fromEnv = (process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "").replace(/^www\./, "").trim()
  return Array.from(new Set([fromEnv, ...KNOWN_PLATFORM_DOMAINS].filter(Boolean)))
}

function matchingPlatformDomain(hostname: string): string | null {
  const host = hostname.replace(/:\d+$/, "").toLowerCase()
  for (const domain of platformDomains()) {
    if (host === domain || host === `www.${domain}` || host.endsWith(`.${domain}`)) {
      return domain
    }
  }
  return null
}

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

  const host = hostname.replace(/:\d+$/, "").toLowerCase()
  const platformDomain = matchingPlatformDomain(host)
  if (platformDomain) {
    if (host === platformDomain || host === `www.${platformDomain}`) {
      return null
    }

    const subdomain = host.slice(0, -(platformDomain.length + 1))
    if (subdomain === "www" || subdomain.includes(".")) {
      return null
    }

    return subdomain
  }

  // v0 preview domains like preview.v0.dev should not be treated as tenant subdomains
  if (host.includes("v0.dev") || host.includes("vusercontent.net") || host.includes("vercel.app")) {
    return null
  }

  // This is a custom domain, not a subdomain of the platform
  return null
}

/**
 * Check if hostname is a custom domain (not a subdomain of the platform)
 */
export function isCustomDomain(hostname: string): boolean {
  // Development environment
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    return false
  }

  const host = hostname.replace(/:\d+$/, "").toLowerCase()
  if (matchingPlatformDomain(host)) {
    return false
  }

  if (host.includes("v0.dev") || host.includes("vusercontent.net") || host.includes("vercel.app")) {
    return false
  }

  // Everything else is a custom domain
  return true
}

/**
 * Check if tenant has access to a specific module
 */
export function tenantHasModule(tenant: Tenant, moduleSlug: string): boolean {
  const enabled = (tenant as Tenant & { enabled_modules?: string[] }).enabled_modules
  if (!Array.isArray(enabled) || enabled.length === 0) {
    return true
  }
  return enabled.includes(moduleSlug)
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
