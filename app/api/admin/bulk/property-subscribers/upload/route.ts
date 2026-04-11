import { NextRequest, NextResponse } from "next/server"
import { getApiBaseUrl } from "@/lib/api/config"

const API_BASE_URL = getApiBaseUrl()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const authHeader = request.headers.get("Authorization") || ""
    const host = request.headers.get("host") || ""
    const tenantSlug = request.headers.get("X-Tenant-Slug") || ""

    const res = await fetch(`${API_BASE_URL}/admin/bulk/property-subscribers/upload`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: authHeader,
        "X-Forwarded-Host": host,
        ...(tenantSlug && { "X-Tenant-Slug": tenantSlug }),
      },
      body: formData,
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({
        success: false,
        message: "Upload failed",
        errors: ["Unable to process the upload request. Please try again."],
      }))

      return NextResponse.json(
        {
          success: false,
          message: errorData.message || "Failed to upload",
          errors: errorData.errors || [errorData.message || "Upload failed"],
          ...(errorData.data && { data: errorData.data }),
        },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Bulk property subscribers upload error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
