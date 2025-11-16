import { type NextRequest, NextResponse } from "next/server"

import { getApiBaseUrl } from "@/lib/api/config"

const apiBase = getApiBaseUrl()

export async function GET(
  request: NextRequest,
  { params }: { params: { pageType: string } }
) {
  try {
    const { pageType } = params
    const res = await fetch(`${apiBase}/public/saas/pages/${pageType}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch page content" },
      { status: 500 }
    )
  }
}

