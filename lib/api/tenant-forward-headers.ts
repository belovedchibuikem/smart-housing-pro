import { type NextRequest } from "next/server"

export function buildTenantForwardHeaders(request: NextRequest): Record<string, string> {
  const host = request.headers.get("host") || ""
  const tenantSlug = request.headers.get("x-tenant-slug") || ""
  const tenantId = request.headers.get("x-tenant-id") || ""
  const customDomain = request.headers.get("x-custom-domain") || ""

  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Forwarded-Host": host,
  }

  if (tenantSlug) {
    headers["X-Tenant-Slug"] = tenantSlug
  }
  if (tenantId) {
    headers["X-Tenant-ID"] = tenantId
  }
  if (customDomain) {
    headers["X-Custom-Domain"] = customDomain
  }

  return headers
}
