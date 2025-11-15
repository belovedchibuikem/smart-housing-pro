import { type NextRequest, NextResponse } from "next/server"

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.LARAVEL_API_URL || "http://127.0.0.1:8000/api"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()
    const url = `${LARAVEL_API_URL}/super-admin/subscriptions${queryString ? `?${queryString}` : ''}`
    
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
      method: "GET",
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to fetch subscriptions" }))
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching subscriptions:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch subscriptions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const url = `${LARAVEL_API_URL}/super-admin/subscriptions`
    
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
      const errorData = await response.json().catch(() => ({ error: "Failed to create subscription" }))
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating subscription:", error)
    return NextResponse.json({ success: false, error: "Failed to create subscription" }, { status: 500 })
  }
}
