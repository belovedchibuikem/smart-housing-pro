import { type NextRequest, NextResponse } from "next/server"
import { paystackService } from "@/lib/payment/paystack"
import { remitaService } from "@/lib/payment/remita"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const provider = searchParams.get("provider")
    const reference = searchParams.get("reference")

    if (!provider || !reference) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    let response

    switch (provider) {
      case "paystack":
        response = await paystackService.verifyTransaction(reference)
        break

      case "remita":
        response = await remitaService.verifyPayment(reference)
        break

      default:
        return NextResponse.json({ error: "Invalid payment provider" }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: response })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
