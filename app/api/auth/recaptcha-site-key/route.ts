import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "http://localhost:8000"

export async function GET(request: NextRequest) {
  try {
    const tenantSlug = request.headers.get("X-Tenant-Slug") || request.cookies.get("tenant_slug")?.value

    const headers: Record<string, string> = {
      "Accept": "application/json",
    }

    if (tenantSlug) {
      headers["X-Tenant-Slug"] = tenantSlug
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/recaptcha-site-key`, {
      method: "GET",
      headers,
    })

    if (!response.ok) {
      throw new Error("Failed to fetch reCAPTCHA site key")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching reCAPTCHA site key:", error)
    return NextResponse.json(
      { site_key: "" },
      { status: 200 } // Return empty string instead of error to allow graceful degradation
    )
  }
}



