import { type NextRequest, NextResponse } from "next/server"
const apiBase = ("http://127.0.0.1:8000/api").replace(/\/$/, "")

export async function POST(request: NextRequest) {
	try {
		if (!apiBase) return NextResponse.json({ message: "API base URL not set" }, { status: 500 })
		const auth = request.headers.get("authorization") || ""
		const host = request.headers.get("host") || ""
		const body = await request.json()
		const res = await fetch(`${apiBase}/admin/landing-page/publish`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: auth,
				"X-Forwarded-Host": host,
			},
			body: JSON.stringify(body),
		})
		const data = await res.json()
		return NextResponse.json(data, { status: res.status })
	} catch (e) {
		return NextResponse.json({ message: "Failed to publish" }, { status: 500 })
	}
}

// POST - Publish/Unpublish landing page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { is_published } = body

    // TODO: Get tenant_id from session/auth
    const tenantId = "sample-tenant-id"

    // TODO: Update database
    console.log("[v0] Updating publish status:", is_published)

    return NextResponse.json({
      success: true,
      message: is_published ? "Landing page published" : "Landing page unpublished",
    })
  } catch (error) {
    console.error("[v0] Error updating publish status:", error)
    return NextResponse.json({ error: "Failed to update publish status" }, { status: 500 })
  }
}
