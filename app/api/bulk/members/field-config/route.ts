import { NextRequest, NextResponse } from "next/server"
import { getApiBaseUrl } from "@/lib/api/config"

export async function GET(request: NextRequest) {
	try {
		const laravelApiUrl = getApiBaseUrl()
		const authHeader = request.headers.get("Authorization") || ""
		const host = request.headers.get("host") || ""
		const tenantSlug = request.headers.get("X-Tenant-Slug") || ""

		const res = await fetch(`${laravelApiUrl}/admin/bulk/members/field-config`, {
			method: "GET",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: authHeader,
				"X-Forwarded-Host": host,
				...(tenantSlug && { "X-Tenant-Slug": tenantSlug }),
			},
		})

		const data = await res.json().catch(() => ({}))
		if (!res.ok) {
			return NextResponse.json(data, { status: res.status })
		}
		return NextResponse.json(data)
	} catch (error) {
		console.error("field-config proxy error:", error)
		return NextResponse.json({ success: false, message: "Failed to load field config" }, { status: 500 })
	}
}
