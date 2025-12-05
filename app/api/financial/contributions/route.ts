import { NextRequest, NextResponse } from "next/server"
import { getApiBaseUrl } from "@/lib/api/config"

const API_BASE_URL = getApiBaseUrl()

export async function GET(request: NextRequest) {
  try {
    const url = new URL(`${API_BASE_URL}/financial/contributions`)
    
    // Forward query parameters
    const searchParams = request.nextUrl.searchParams
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value)
    })

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(request.headers.get("authorization") && {
          "Authorization": request.headers.get("authorization")!
        }),
        ...(request.headers.get("x-forwarded-host") && {
          "X-Forwarded-Host": request.headers.get("x-forwarded-host")!
        }),
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch contributions" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching contributions:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}






























