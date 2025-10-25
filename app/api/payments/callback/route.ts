import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const reference = searchParams.get("reference")
  const status = searchParams.get("status")

  // Redirect to success or failure page based on payment status
  if (status === "success") {
    return NextResponse.redirect(new URL(`/dashboard/payments/success?reference=${reference}`, request.url))
  } else {
    return NextResponse.redirect(new URL(`/dashboard/payments/failed?reference=${reference}`, request.url))
  }
}
