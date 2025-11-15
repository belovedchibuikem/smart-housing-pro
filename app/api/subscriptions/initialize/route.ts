import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const auth = request.headers.get("authorization") || ""
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || ""
    const tenantSlug = request.headers.get("x-tenant-slug") || ""

    const laravelApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

    console.log('Subscription Initialize API Route - Forwarding to Laravel:', {
      laravelApiUrl: `${laravelApiUrl}/api/subscriptions/initialize`,
      hasAuth: !!auth,
      host,
      tenantSlug,
      bodyKeys: Object.keys(body),
    })

    const res = await fetch(`${laravelApiUrl}/api/subscriptions/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": auth,
        "X-Forwarded-Host": host,
        "X-Tenant-Slug": tenantSlug,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    console.log('Subscription Initialize API Route - Response:', {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({
        message: "Failed to initialize subscription",
      }))
      console.error('Subscription Initialize API Route - Error response:', errorData)
      return NextResponse.json(errorData, { status: res.status })
    }

    const data = await res.json()
    console.log('Subscription Initialize API Route - Success:', {
      success: data.success,
      hasReference: !!data.reference,
    })
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error("Subscription Initialize API Route - Exception:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to initialize subscription",
      },
      { status: 500 }
    )
  }
}
