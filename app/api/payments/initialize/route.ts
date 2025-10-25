import { type NextRequest, NextResponse } from "next/server"
import { paystackService } from "@/lib/payment/paystack"
import { remitaService } from "@/lib/payment/remita"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, email, paymentMethod, reference, metadata } = body

    if (!amount || !email || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let responseData: any = {}

    switch (paymentMethod) {
      case "card":
        // Initialize Paystack payment
        const paystackResponse = await paystackService.initializeTransaction({
          email,
          amount,
          reference: reference || `PAY-${Date.now()}`,
          callback_url: `${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN}/api/payments/callback`,
          metadata,
        })

        if (paystackResponse.status) {
          responseData = {
            authorizationUrl: paystackResponse.data.authorization_url,
            reference: paystackResponse.data.reference,
            accessCode: paystackResponse.data.access_code,
          }
        } else {
          return NextResponse.json(
            { success: false, message: paystackResponse.message || "Payment initialization failed" },
            { status: 400 },
          )
        }
        break

      case "remita":
        // Generate Remita RRR
        const remitaResponse = await remitaService.generateRRR({
          amount,
          payerEmail: email,
          payerName: metadata?.name || "Customer",
          payerPhone: metadata?.phone || "",
          description: metadata?.description || "Payment",
          orderId: reference || `ORD-${Date.now()}`,
        })

        if (remitaResponse.statuscode === "025") {
          responseData = {
            rrr: remitaResponse.RRR,
            status: remitaResponse.status,
          }
        } else {
          return NextResponse.json({ success: false, message: "Failed to generate RRR" }, { status: 400 })
        }
        break

      case "wallet":
        // Process wallet payment
        // TODO: Add database integration to deduct from wallet
        responseData = {
          reference: reference || `WALLET-${Date.now()}`,
          status: "completed",
          message: "Payment successful from wallet",
        }
        break

      case "bank":
        // Bank transfer - just record the intent
        responseData = {
          reference: reference || `BANK-${Date.now()}`,
          status: "pending",
          message: "Please complete bank transfer and upload evidence",
          bankDetails: {
            bankName: "First Bank of Nigeria",
            accountNumber: "1234567890",
            accountName: "FRSC Housing Cooperative",
          },
        }
        break

      default:
        return NextResponse.json({ success: false, message: "Invalid payment method" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Payment initialized successfully",
      data: responseData,
    })
  } catch (error) {
    console.error("[v0] Payment initialization error:", error)
    return NextResponse.json({ success: false, message: "Failed to initialize payment" }, { status: 500 })
  }
}
