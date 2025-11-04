import { type NextRequest, NextResponse } from "next/server"

const apiBase = ("http://127.0.0.1:8000/api").replace(/\/$/, "")

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
    
    // Forward the response exactly as received from Laravel
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error("Landing page save API route error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to save landing page",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
