import { type NextRequest, NextResponse } from "next/server"
import { fetchPwaBranding } from "@/lib/pwa/branding"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ size: string }> },
) {
  const { size: sizeParam } = await context.params
  const size = sizeParam.replace(/\D/g, "") || "192"
  const branding = await fetchPwaBranding(request)

  if (branding.iconUrl.startsWith("http")) {
    return NextResponse.redirect(branding.iconUrl, 302)
  }

  const localIcon = branding.iconUrl.startsWith("/")
    ? new URL(branding.iconUrl, request.nextUrl.origin)
    : new URL("/branding/smarthousing-icon.svg", request.nextUrl.origin)

  return NextResponse.redirect(`${localIcon.toString()}?size=${size}`, 302)
}
