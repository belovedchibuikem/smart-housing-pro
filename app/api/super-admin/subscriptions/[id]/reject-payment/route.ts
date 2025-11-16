import { type NextRequest, NextResponse } from "next/server"
import { getApiBaseUrl } from "@/lib/api/config"

const LARAVEL_API_URL = getApiBaseUrl()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const url = `${LARAVEL_API_URL}/super-admin/subscriptions/${id}/reject-payment`
    
    const authHeader = request.headers.get("authorization")
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    
    if (authHeader) {
      headers["Authorization"] = authHeader
    }

    // Forward tenant headers
    const tenantSlug = request.headers.get("x-tenant-slug")
    if (tenantSlug) {
      headers["X-Tenant-Slug"] = tenantSlug
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to reject payment" }))
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error rejecting payment:", error)
    return NextResponse.json({ success: false, error: "Failed to reject payment" }, { status: 500 })
  }
}

