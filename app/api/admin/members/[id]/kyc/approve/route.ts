import { NextRequest, NextResponse } from "next/server"
import { getApiBaseUrl } from "@/lib/api/config"

const API_BASE_URL = getApiBaseUrl()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const response = await fetch(`${API_BASE_URL}/admin/members/${id}/kyc/approve`, {
      method: "POST",
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
        { error: errorData.message || "Failed to approve KYC" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error approving KYC:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}






























