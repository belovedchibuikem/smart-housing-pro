import { type NextRequest, NextResponse } from "next/server"

// GET - Fetch all payment gateway settings for tenant
export async function GET(request: NextRequest) {
  try {
    // TODO: Get tenant_id from session/auth
    const tenantId = "sample-tenant-id"

    // TODO: Fetch from database
    const gateways = [
      {
        id: "1",
        gateway_type: "paystack",
        is_enabled: false,
        is_test_mode: true,
        public_key: "",
        secret_key: "",
        configuration: {},
      },
      {
        id: "2",
        gateway_type: "remita",
        is_enabled: false,
        is_test_mode: true,
        merchant_id: "",
        api_key: "",
        service_type_id: "",
        configuration: {},
      },
      {
        id: "3",
        gateway_type: "stripe",
        is_enabled: false,
        is_test_mode: true,
        public_key: "",
        secret_key: "",
        configuration: {},
      },
      {
        id: "4",
        gateway_type: "manual",
        is_enabled: true,
        is_test_mode: false,
        bank_accounts: [],
        configuration: {},
      },
    ]

    return NextResponse.json({ gateways })
  } catch (error) {
    console.error("[v0] Error fetching payment gateways:", error)
    return NextResponse.json({ error: "Failed to fetch payment gateways" }, { status: 500 })
  }
}

// POST - Create or update payment gateway settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gateway_type, is_enabled, is_test_mode, credentials, bank_accounts, configuration } = body

    // TODO: Get tenant_id from session/auth
    const tenantId = "sample-tenant-id"

    // TODO: Encrypt sensitive credentials before storing
    // TODO: Save to database

    console.log("[v0] Saving payment gateway:", { gateway_type, is_enabled, is_test_mode })

    return NextResponse.json({
      success: true,
      message: "Payment gateway settings saved successfully",
      gateway: {
        id: "new-id",
        tenant_id: tenantId,
        gateway_type,
        is_enabled,
        is_test_mode,
        ...credentials,
        bank_accounts,
        configuration,
      },
    })
  } catch (error) {
    console.error("[v0] Error saving payment gateway:", error)
    return NextResponse.json({ error: "Failed to save payment gateway settings" }, { status: 500 })
  }
}
