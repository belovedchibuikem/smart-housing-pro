import { type NextRequest, NextResponse } from "next/server"

const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "")

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

