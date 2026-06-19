import { type NextRequest, NextResponse } from "next/server"
import { fetchPwaBranding } from "@/lib/pwa/branding"
import { generatePwaIconPng } from "@/lib/pwa/generate-icon"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ size: string }> },
) {
  const { size: sizeParam } = await context.params
  const size = Number.parseInt(sizeParam.replace(/\D/g, ""), 10) || 192
  const branding = await fetchPwaBranding(request)

  try {
    const png = await generatePwaIconPng(
      branding.iconUrl,
      size,
      branding.backgroundColor,
    )

    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    })
  } catch {
    return new NextResponse("Icon unavailable", { status: 500 })
  }
}
