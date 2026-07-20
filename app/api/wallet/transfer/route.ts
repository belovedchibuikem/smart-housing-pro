import { type NextRequest, NextResponse } from "next/server"
import { getApiBaseUrl } from "@/lib/api/config"

const API_BASE_URL = getApiBaseUrl()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const mappedBody = {
      amount: body?.amount,
      recipient_type: body?.recipient_type || "member_number",
      recipient_identifier: body?.recipient_identifier || body?.recipientId || "",
      note: body?.note,
    }

    const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/wallet/transfer`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": request.headers.get("Authorization") || "",
        "X-Forwarded-Host": request.headers.get("x-forwarded-host") || request.headers.get("host") || "",
      },
      body: JSON.stringify(mappedBody),
    })

    const text = await response.text()
    const payload = (() => {
      try {
        return text ? JSON.parse(text) : {}
      } catch {
        return {
          success: false,
          message: "Upstream returned non-JSON response",
          details: text.slice(0, 300),
        }
      }
    })()

    return NextResponse.json(payload, { status: response.status })
  } catch (error) {
    console.error("Wallet transfer proxy error:", error)
    return NextResponse.json({ success: false, message: "Failed to process transfer" }, { status: 500 })
  }
}
