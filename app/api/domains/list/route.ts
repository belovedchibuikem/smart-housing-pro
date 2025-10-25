import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const businessId = request.headers.get("x-business-id")

    if (!businessId) {
      return NextResponse.json({ error: "Business ID required" }, { status: 400 })
    }

    // In production, this would query the custom_domains table
    // For now, return mock data
    const domains = [
      {
        id: "1",
        business_id: businessId,
        domain: "myhousing.com",
        is_verified: true,
        is_primary: true,
        ssl_status: "active",
        verified_at: "2024-01-15T10:00:00Z",
      },
      {
        id: "2",
        business_id: businessId,
        domain: "housing.mycompany.com",
        is_verified: false,
        is_primary: false,
        ssl_status: "pending",
        verified_at: null,
      },
    ]

    return NextResponse.json({ domains })
  } catch (error) {
    console.error("List domains error:", error)
    return NextResponse.json({ error: "Failed to fetch domains" }, { status: 500 })
  }
}
