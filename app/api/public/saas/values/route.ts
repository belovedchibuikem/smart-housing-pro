import { type NextRequest, NextResponse } from "next/server"
import { getApiBaseUrl } from "@/lib/api/config"

const apiBase = getApiBaseUrl()

export async function GET(_request: NextRequest) {
  try {
    const res = await fetch(`${apiBase}/public/saas/values`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch values" },
      { status: 500 }
    )
  }
}

