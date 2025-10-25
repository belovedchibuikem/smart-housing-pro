import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // TODO: Fetch businesses from database
    const businesses = [
      {
        id: "1",
        name: "ABC Housing Cooperative",
        slug: "abc-housing",
        status: "active",
        package_id: "1",
        members_count: 150,
        created_at: new Date().toISOString(),
      },
    ]

    return NextResponse.json({ success: true, data: businesses })
  } catch (error) {
    console.error("Error fetching businesses:", error)
    return NextResponse.json({ error: "Failed to fetch businesses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, email, package_id } = body

    // TODO: Create business in database
    const business = {
      id: Date.now().toString(),
      name,
      slug,
      email,
      package_id,
      status: "trial",
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, data: business })
  } catch (error) {
    console.error("Error creating business:", error)
    return NextResponse.json({ error: "Failed to create business" }, { status: 500 })
  }
}
