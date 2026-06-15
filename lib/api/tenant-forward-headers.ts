import { type NextRequest } from "next/server"

export function buildTenantForwardHeaders(request: NextRequest): Record<string, string> {
  const host = request.headers.get("host") || ""
  const tenantSlug = request.headers.get("x-tenant-slug") || ""
  const tenantId = request.headers.get("x-tenant-id") || ""

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

  return headers
}
