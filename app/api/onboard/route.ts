import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessInfo, adminInfo, packageId } = body

    // TODO: Create business, admin user, and subscription in database
    const business = {
      id: Date.now().toString(),
      name: businessInfo.name,
      slug: businessInfo.subdomain,
      email: businessInfo.email,
      phone: businessInfo.phone,
      address: businessInfo.address,
      package_id: packageId,
      status: "trial",
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    }

    // TODO: Create admin user
    const admin = {
      id: Date.now().toString(),
      business_id: business.id,
      email: adminInfo.email,
      name: adminInfo.name,
      role: "admin",
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: {
        business,
        admin,
        message: "Business created successfully. Please check your email to verify your account.",
      },
    })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json({ error: "Failed to complete onboarding" }, { status: 500 })
  }
}
