import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    // TODO: Fetch packages from database
    const packages = [
      {
        id: "1",
        name: "Starter",
        price: 50000,
        billing_cycle: "monthly",
        features: {
          max_members: 100,
          max_properties: 50,
          max_loans: 20,
        },
      },
    ]

    return NextResponse.json({ success: true, data: packages })
  } catch (error) {
    console.error("Error fetching packages:", error)
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // TODO: Create package in database
    const packageData = {
      id: Date.now().toString(),
      ...body,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, data: packageData })
  } catch (error) {
    console.error("Error creating package:", error)
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 })
  }
}
