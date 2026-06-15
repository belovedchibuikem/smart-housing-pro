import { type NextRequest, NextResponse } from "next/server"
import { getApiBaseUrl } from "@/lib/api/config"
import { buildTenantForwardHeaders } from "@/lib/api/tenant-forward-headers"

const apiBase = getApiBaseUrl()

function buildHeaders(request: NextRequest): Record<string, string> {
  const headers = buildTenantForwardHeaders(request)
  const auth = request.headers.get("authorization")
  if (auth) {
    headers.Authorization = auth
  }
  return headers
}

export async function GET(request: NextRequest) {
  try {
    if (!apiBase) {
      return NextResponse.json({ message: "API base URL not set" }, { status: 500 })
    }

    const res = await fetch(`${apiBase.replace(/\/$/, "")}/admin/white-label`, {
      method: "GET",
      headers: buildHeaders(request),
      cache: "no-store",
    })

    const data = await res.json().catch(() => ({ message: "Failed to fetch white label settings" }))
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error("Admin white label GET proxy error:", error)
    return NextResponse.json({ message: "Failed to fetch white label settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!apiBase) {
      return NextResponse.json({ message: "API base URL not set" }, { status: 500 })
    }

    const body = await request.json()
    const headers = buildHeaders(request)
    headers["Content-Type"] = "application/json"

    const res = await fetch(`${apiBase.replace(/\/$/, "")}/admin/white-label`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    })

    const data = await res.json().catch(() => ({ message: "Failed to save white label settings" }))
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error("Admin white label POST proxy error:", error)
    return NextResponse.json({ message: "Failed to save white label settings" }, { status: 500 })
  }
}
