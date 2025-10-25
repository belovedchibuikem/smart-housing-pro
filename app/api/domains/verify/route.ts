import { type NextRequest, NextResponse } from "next/server"
import { verifyDomain } from "@/lib/domain/domain-utils"

export async function POST(request: NextRequest) {
  try {
    const { domain, verificationToken } = await request.json()

    if (!domain || !verificationToken) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const isVerified = await verifyDomain(domain, verificationToken)

    if (isVerified) {
      // Update database to mark domain as verified
      // In production, this would update the custom_domains table
      return NextResponse.json({
        success: true,
        message: "Domain verified successfully",
        verified: true,
      })
    }

    return NextResponse.json({
      success: false,
      message: "Domain verification failed. Please check your DNS records.",
      verified: false,
    })
  } catch (error) {
    console.error("Domain verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
