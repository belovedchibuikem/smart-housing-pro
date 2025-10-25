import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
	try {
		const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "")
		if (!apiBase) {
			return NextResponse.json({ message: "API base URL is not configured" }, { status: 500 })
		}

		const auth = request.headers.get("authorization") || ""
		const host = request.headers.get("host") || ""

		const res = await fetch(`${apiBase}/tenant/current`, {
			method: "GET",
			headers: {
				"Accept": "application/json",
				"Authorization": auth,
				"X-Forwarded-Host": host,
			},
			cache: "no-store",
		})

		const data = await res.json()
		return NextResponse.json(data, { status: res.status })
	} catch (err) {
		return NextResponse.json(
			{ message: err instanceof Error ? err.message : "Failed to load tenant" },
			{ status: 500 }
		)
	}
}

// Removed legacy mock tenant handler and duplicate imports
