import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
	try {
		// Call Laravel API directly for tenant info
		const laravelApiUrl = "http://127.0.0.1:8000/api"
		const auth = request.headers.get("authorization") || ""
		const host = request.headers.get("host") || ""

		console.log('Tenant API Route - Fetching tenant:', {
			laravelApiUrl: `${laravelApiUrl}/tenant/current`,
			hasAuth: !!auth,
			host
		})

		const res = await fetch(`${laravelApiUrl}/tenant/current`, {
			method: "GET",
			headers: {
				"Accept": "application/json",
				"Authorization": auth,
				"X-Forwarded-Host": host,
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
				{ message: errorData.message || "Failed to fetch tenant" },
				{ status: res.status }
			)
		}

		const data = await res.json()
		console.log('Tenant API Route - Success:', { tenant: data.tenant?.id })
		return NextResponse.json(data, { status: res.status })
	} catch (err) {
		console.error("Tenant API Route - Exception:", err)
		return NextResponse.json(
			{ message: err instanceof Error ? err.message : "Failed to load tenant" },
			{ status: 500 }
		)
	}
}

// Removed legacy mock tenant handler and duplicate imports
