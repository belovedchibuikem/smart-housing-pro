import { type NextRequest, NextResponse } from "next/server"
import { getApiBaseUrl } from "@/lib/api/config"
import { buildTenantForwardHeaders } from "@/lib/api/tenant-forward-headers"

const apiBase = getApiBaseUrl()

async function proxyAuth(request: NextRequest, pathSegments: string[]) {
  if (!apiBase) {
    return NextResponse.json({ message: "API base URL not set" }, { status: 500 })
  }

  const path = pathSegments.join("/")
  const url = `${apiBase.replace(/\/$/, "")}/auth/${path}${request.nextUrl.search}`

  const headers: Record<string, string> = {
    ...buildTenantForwardHeaders(request),
    Accept: "application/json",
  }

  const auth = request.headers.get("authorization")
  if (auth) {
    headers.Authorization = auth
  }

  const contentType = request.headers.get("content-type")
  if (contentType) {
    headers["Content-Type"] = contentType
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text()
  }

  const res = await fetch(url, init)
  const body = await res.text()

  return new NextResponse(body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") || "application/json",
    },
  })
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params
  return proxyAuth(request, path)
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params
  return proxyAuth(request, path)
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params
  return proxyAuth(request, path)
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params
  return proxyAuth(request, path)
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params
  return proxyAuth(request, path)
}

export async function OPTIONS(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params
  return proxyAuth(request, path)
}
