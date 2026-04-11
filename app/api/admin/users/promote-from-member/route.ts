import { NextRequest, NextResponse } from "next/server"

import { getApiBaseUrl } from "@/lib/api/config"

const API_BASE_URL = getApiBaseUrl()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const res = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/admin/users/promote-from-member`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: request.headers.get("Authorization") || "",
        "X-Forwarded-Host": request.headers.get("x-forwarded-host") || request.headers.get("host") || "",
        "X-Tenant-Slug": request.headers.get("x-tenant-slug") || "",
      },
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Promote member API error:", error)
    return NextResponse.json({ error: "Failed to promote member" }, { status: 500 })
  }
}
