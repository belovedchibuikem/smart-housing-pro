import { type NextRequest, NextResponse } from "next/server"
import { validateDomain, generateVerificationToken, generateDNSRecords } from "@/lib/domain/domain-utils"

export async function POST(request: NextRequest) {
  try {
    const { domain, businessId } = await request.json()

    if (!domain || !businessId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate domain format
    const validation = validateDomain(domain)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Generate verification token
    const verificationToken = generateVerificationToken()

    // Generate DNS records
    const dnsRecords = generateDNSRecords(domain, verificationToken)

    // In production, this would:
    // 1. Insert into custom_domains table
    // 2. Insert DNS records into domain_dns_records table
    // 3. Return the domain configuration

    return NextResponse.json({
      success: true,
      domain: {
        id: crypto.randomUUID(),
        domain,
        business_id: businessId,
        is_verified: false,
        verification_token: verificationToken,
        ssl_status: "pending",
      },
      dns_records: dnsRecords,
    })
  } catch (error) {
    console.error("Add domain error:", error)
    return NextResponse.json({ error: "Failed to add domain" }, { status: 500 })
  }
}
