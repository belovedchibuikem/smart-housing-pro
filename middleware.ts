import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantSlugFromHost, isCustomDomain } from "@/lib/tenant/tenant-utils"

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || ""
  const pathname = request.nextUrl.pathname
  
  // Development mode: Check for tenant query parameter or header
  const devTenant = request.nextUrl.searchParams.get("tenant") || request.headers.get("x-dev-tenant")
  const isDevelopment = hostname.includes("localhost") || hostname.includes("127.0.0.1")

  console.log("[Middleware] hostname:", hostname, "pathname:", pathname, "devTenant:", devTenant)

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    return NextResponse.next()
  }

  // Development mode: Use query parameter or header for tenant
  if (isDevelopment && devTenant) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-tenant-slug", devTenant)
    requestHeaders.set("x-dev-mode", "true")
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  const isCustomDomainRequest = isCustomDomain(hostname)
  const tenantSlug = getTenantSlugFromHost(hostname)

  console.log("[Middleware] tenantSlug:", tenantSlug, "isCustomDomain:", isCustomDomainRequest)

  // Validate tenant if we have a slug or custom domain (skip in development)
  if ((tenantSlug || isCustomDomainRequest) && !isDevelopment) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"
      const validateUrl = `${apiUrl}/tenant/validate?host=${encodeURIComponent(hostname)}${tenantSlug ? `&slug=${tenantSlug}` : ""}`
      
      const validationResponse = await fetch(validateUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
        cache: "no-store",
      })

      if (!validationResponse.ok) {
        console.log("[Middleware] Tenant validation failed:", validationResponse.status)
        // Redirect to SaaS page if tenant not found (on main domain)
        const url = new URL(request.url)
        if (!isCustomDomainRequest && (pathname === "/" || !pathname.startsWith("/saas"))) {
          // Redirect to main platform domain SaaS page
          const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "frschousing.com"
          const redirectUrl = new URL(`/saas?error=tenant_not_found`, `${url.protocol}//${platformDomain}`)
          return NextResponse.redirect(redirectUrl)
        }
        return NextResponse.next()
      }

      const validationData = await validationResponse.json()
      if (validationData.valid && validationData.tenant) {
        console.log("[Middleware] Tenant validated:", validationData.tenant.slug)
        // Store validated tenant info in headers for use in components
        request.headers.set("x-tenant-id", validationData.tenant.id)
        request.headers.set("x-tenant-name", validationData.tenant.name)
        // Continue to set headers below - don't return early so route checks still run
      } else {
        // Invalid tenant response
        console.log("[Middleware] Tenant validation returned invalid response")
        const url = new URL(request.url)
        if (!isCustomDomainRequest && (pathname === "/" || !pathname.startsWith("/saas"))) {
          const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "frschousing.com"
          const redirectUrl = new URL(`/saas?error=tenant_not_found`, `${url.protocol}//${platformDomain}`)
          return NextResponse.redirect(redirectUrl)
        }
      }
    } catch (error) {
      console.error("[Middleware] Error validating tenant:", error)
      // Continue anyway - don't block the request in case of network errors
    }
  }

  // Super admin routes (platform.com/super-admin)
  if (pathname.startsWith("/super-admin")) {
    // Only allow on main platform domain
    if (tenantSlug || isCustomDomainRequest) {
      console.log("[v0] Middleware - Redirecting /super-admin to / because tenant or custom domain detected")
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  // SaaS marketing pages (platform.com)
  if (pathname === "/saas" || pathname.startsWith("/saas/")) {
    // Only allow on main platform domain
    if (tenantSlug || isCustomDomainRequest) {
      console.log("[v0] Middleware - Redirecting /saas to / because tenant or custom domain detected")
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  // Business onboarding (platform.com/onboard)
  if (pathname.startsWith("/onboard")) {
    // Only allow on main platform domain
    if (tenantSlug || isCustomDomainRequest) {
      console.log("[v0] Middleware - Redirecting /onboard to / because tenant or custom domain detected")
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  // Handle main platform domain (no subdomain) - redirect to SaaS
  if (!tenantSlug && !isCustomDomainRequest && pathname === "/") {
    console.log("[v0] Middleware - Redirecting main domain root to /saas")
    return NextResponse.redirect(new URL("/saas", request.url))
  }

  // If we have a tenant slug or custom domain, add it to headers for API routes to use
  // (This handles both validated tenants and development mode)
  if (tenantSlug || isCustomDomainRequest) {
    const requestHeaders = new Headers(request.headers)
    if (tenantSlug) {
      requestHeaders.set("x-tenant-slug", tenantSlug)
    }
    if (isCustomDomainRequest) {
      requestHeaders.set("x-custom-domain", hostname)
    }
    // Note: x-tenant-id and x-tenant-name are set during validation above if validation occurred

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
