import { type NextRequest, NextResponse } from "next/server"
import { getApiBaseUrl } from "@/lib/api/config"

export async function GET(request: NextRequest) {
	try {
		// Call Laravel API directly for tenant info
		const laravelApiUrl = getApiBaseUrl()
		const auth = request.headers.get("authorization") || ""
		const host = request.headers.get("host") || ""
		const tenantSlug = request.headers.get("x-tenant-slug") || ""
		const tenantId = request.headers.get("x-tenant-id") || ""

		const headers: Record<string, string> = {
			Accept: "application/json",
			"X-Forwarded-Host": host,
		}

		if (tenantSlug) {
			headers["X-Tenant-Slug"] = tenantSlug
		}
		if (tenantId) {
			headers["X-Tenant-ID"] = tenantId
		}

		const res = await fetch(`${laravelApiUrl}/tenant/current`, {
			method: "GET",
			headers: {
				Accept: "application/json",
				Authorization: auth,
				...headers,
			},
			cache: "no-store",
		})

		console.log('Tenant API Route - Response:', {
			status: res.status,
			statusText: res.statusText,
			ok: res.ok
		})

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			console.error('Tenant API Route - Error response:', errorData)
			return NextResponse.json(
				{ message: errorData.message || "Failed to fetch cooperative" },
				{ status: res.status }
			)
		}

		const data = await res.json()
		console.log('Tenant API Route - Success:', { tenant: data.tenant?.id })
		return NextResponse.json(data, { status: res.status })
	} catch (err) {
		console.error("Tenant API Route - Exception:", err)
		return NextResponse.json(
			{ message: err instanceof Error ? err.message : "Failed to load cooperative" },
			{ status: 500 }
		)
	}
}

// Removed legacy mock tenant handler and duplicate imports
