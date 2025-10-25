import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantSlugFromHost, isCustomDomain } from "@/lib/tenant/tenant-utils"

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || ""
  const pathname = request.nextUrl.pathname

  console.log("[v0] Middleware - hostname:", hostname, "pathname:", pathname)

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    return NextResponse.next()
  }

  const isCustomDomainRequest = isCustomDomain(hostname)
  const tenantSlug = getTenantSlugFromHost(hostname)

  console.log("[v0] Middleware - tenantSlug:", tenantSlug, "isCustomDomain:", isCustomDomainRequest)

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

  if (isCustomDomainRequest) {
    // In production, look up the business associated with this custom domain
    // For now, we'll add the custom domain to headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-custom-domain", hostname)

    // TODO: Query database to get tenant slug from custom domain
    // const tenantSlug = await getTenantByCustomDomain(hostname)
    // requestHeaders.set("x-tenant-slug", tenantSlug)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // If we have a tenant slug, add it to headers for API routes to use
  if (tenantSlug) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-tenant-slug", tenantSlug)

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
