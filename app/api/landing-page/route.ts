import { type NextRequest, NextResponse } from "next/server"

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api"

export async function GET(request: NextRequest) {
	try {
		if (!apiBase) return NextResponse.json({ message: "API base URL not set" }, { status: 500 })
		
		const host = request.headers.get("host") || ""
		const tenantSlug = request.headers.get("x-tenant-slug") || ""
		const tenantId = request.headers.get("x-tenant-id") || ""
		
		// Forward tenant headers to Laravel backend
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
		
		const res = await fetch(`${apiBase.replace(/\/$/, "")}/landing-page`, {
			method: "GET",
			headers,
			cache: "no-store",
		})
		
		if (!res.ok) {
			const errorData = await res.json().catch(() => ({ message: "Failed to fetch landing page" }))
			return NextResponse.json(errorData, { status: res.status })
		}
		
		const data = await res.json()
		
		// Add no-cache headers to prevent browser caching
		return NextResponse.json(data, { 
			status: res.status,
			headers: {
				'Cache-Control': 'no-cache, no-store, must-revalidate',
				'Pragma': 'no-cache',
				'Expires': '0',
			},
		})
	} catch (e) {
		console.error("Landing page API route error:", e)
		return NextResponse.json({ 
			message: "Failed to fetch landing page",
			error: e instanceof Error ? e.message : "Unknown error"
		}, { status: 500 })
	}
}


