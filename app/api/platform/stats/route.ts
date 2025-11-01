import { type NextRequest, NextResponse } from "next/server"

const apiBase = ("http://127.0.0.1:8000/api").replace(/\/$/, "")

export async function GET(_request: NextRequest) {
	try {
		if (!apiBase) return NextResponse.json({ message: "API base URL not set" }, { status: 500 })
		const res = await fetch(`${apiBase}/platform/stats`, {
			method: "GET",
			headers: { Accept: "application/json" },
			cache: "no-store",
		})
		const data = await res.json()
		return NextResponse.json(data, { status: res.status })
	} catch (e) {
		return NextResponse.json({ message: "Failed to fetch platform stats" }, { status: 500 })
	}
}


