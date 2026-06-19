import { type NextRequest, NextResponse } from "next/server"
import { buildWebManifest, fetchPwaBranding } from "@/lib/pwa/branding"

export async function GET(request: NextRequest) {
  const branding = await fetchPwaBranding(request)
  const manifest = buildWebManifest(branding, request.nextUrl.origin)

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    },
  })
}
