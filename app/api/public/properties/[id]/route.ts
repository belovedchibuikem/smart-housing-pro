import { type NextRequest, NextResponse } from "next/server"
import { getApiBaseUrl } from "@/lib/api/config"
import { buildTenantForwardHeaders } from "@/lib/api/tenant-forward-headers"

const apiBase = getApiBaseUrl()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!apiBase) {
      return NextResponse.json({ message: "API base URL not set" }, { status: 500 })
    }

    const search = request.nextUrl.searchParams.toString()
    const url = `${apiBase.replace(/\/$/, "")}/properties/public/${params.id}${search ? `?${search}` : ""}`

    const res = await fetch(url, {
      method: "GET",
      headers: buildTenantForwardHeaders(request),
      cache: "no-store",
    })

    const data = await res.json().catch(() => ({ message: "Failed to fetch property" }))
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    console.error("Public property detail API route error:", e)
    return NextResponse.json({ message: "Failed to fetch property" }, { status: 500 })
  }
}
