import { type NextRequest, NextResponse } from "next/server"
import { getApiBaseUrl } from "@/lib/api/config"
import { buildTenantForwardHeaders } from "@/lib/api/tenant-forward-headers"

const apiBase = getApiBaseUrl()

export async function GET(request: NextRequest) {
  try {
    if (!apiBase) {
      return NextResponse.json({ message: "API base URL not set" }, { status: 500 })
    }

    const search = request.nextUrl.searchParams.toString()
    const url = `${apiBase.replace(/\/$/, "")}/properties/public${search ? `?${search}` : ""}`

    const res = await fetch(url, {
      method: "GET",
      headers: buildTenantForwardHeaders(request),
      cache: "no-store",
    })

    const data = await res.json().catch(() => ({ message: "Failed to fetch properties" }))
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    console.error("Public properties API route error:", e)
    return NextResponse.json({ message: "Failed to fetch properties" }, { status: 500 })
  }
}
