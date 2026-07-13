import { NextRequest, NextResponse } from "next/server"
import { getApiBaseUrl } from "@/lib/api/config"

const API_BASE_URL = getApiBaseUrl()

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const formData = await request.formData()
    const authHeader = request.headers.get("Authorization") || ""
    const host = request.headers.get("host") || ""
    const tenantSlug = request.headers.get("X-Tenant-Slug") || ""

    const res = await fetch(
      `${API_BASE_URL}/admin/property-management/tenures/houses/${id}/deed`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: authHeader,
          "X-Forwarded-Host": host,
          ...(tenantSlug && { "X-Tenant-Slug": tenantSlug }),
        },
        body: formData,
      }
    )

    const data = await res.json().catch(() => ({ success: false, message: "Upload failed" }))
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
