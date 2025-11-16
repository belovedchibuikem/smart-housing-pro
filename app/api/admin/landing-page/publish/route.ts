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

