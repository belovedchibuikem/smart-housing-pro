import { type NextRequest, NextResponse } from "next/server"
import { getApiBaseUrl } from "@/lib/api/config"
import { buildTenantForwardHeaders } from "@/lib/api/tenant-forward-headers"

const apiBase = getApiBaseUrl()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!apiBase) {
      return NextResponse.json({ message: "API base URL not set" }, { status: 500 })
    }

    const { id } = await params
    const search = request.nextUrl.searchParams.toString()
    const normalizedApiBase = apiBase.replace(/\/$/, "")
    const preferredUrl = `${normalizedApiBase}/public/properties/${id}${search ? `?${search}` : ""}`
    const legacyUrl = `${normalizedApiBase}/properties/public/${id}${search ? `?${search}` : ""}`

    let res = await fetch(preferredUrl, {
      method: "GET",
      headers: buildTenantForwardHeaders(request),
      cache: "no-store",
    })
    if (res.status === 404) {
      res = await fetch(legacyUrl, {
        method: "GET",
        headers: buildTenantForwardHeaders(request),
        cache: "no-store",
      })
    }

    const data = await res.json().catch(() => ({ message: "Failed to fetch property" }))
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    console.error("Public property detail API route error:", e)
    return NextResponse.json({ message: "Failed to fetch property" }, { status: 500 })
  }
}
