import { type NextRequest, NextResponse } from "next/server"

const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "")

// GET - Fetch landing page configuration
export async function GET(request: NextRequest) {
  try {
    if (!apiBase) return NextResponse.json({ message: "API base URL not set" }, { status: 500 })
    const auth = request.headers.get("authorization") || ""
    const host = request.headers.get("host") || ""

    const res = await fetch(`${apiBase}/admin/landing-page`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: auth,
        "X-Forwarded-Host": host,
      },
      cache: "no-store",
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch landing page" }, { status: 500 })
  }
}

// POST - Update landing page configuration
export async function POST(request: NextRequest) {
  try {
    if (!apiBase) return NextResponse.json({ message: "API base URL not set" }, { status: 500 })

    const auth = request.headers.get("authorization") || ""
    const host = request.headers.get("host") || ""
    const body = await request.json()

    const res = await fetch(`${apiBase}/admin/landing-page`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: auth,
        "X-Forwarded-Host": host,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save landing page" }, { status: 500 })
  }
}
