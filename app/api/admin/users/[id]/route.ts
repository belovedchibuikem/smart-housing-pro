import { NextRequest, NextResponse } from 'next/server'
import { getApiBaseUrl } from "@/lib/api/config"

const API_BASE_URL = getApiBaseUrl()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const url = `${API_BASE_URL.replace(/\/$/, '')}/admin/users/${params.id}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': request.headers.get('Authorization') || '',
      'X-Forwarded-Host': request.headers.get('x-forwarded-host') || request.headers.get('host') || '',
    },
  })
  const ct = res.headers.get('content-type') || ''
  if (!res.ok) {
    const body = ct.includes('application/json') ? await res.json() : { message: `Upstream error ${res.status}` }
    return NextResponse.json(body, { status: res.status })
  }
  const data = await res.json()
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()
  const url = `${API_BASE_URL.replace(/\/$/, '')}/admin/users/${params.id}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': request.headers.get('Authorization') || '',
      'X-Forwarded-Host': request.headers.get('x-forwarded-host') || request.headers.get('host') || '',
    },
    body: JSON.stringify(body),
  })
  const ct = res.headers.get('content-type') || ''
  if (!res.ok) {
    const resp = ct.includes('application/json') ? await res.json() : { message: `Upstream error ${res.status}` }
    return NextResponse.json(resp, { status: res.status })
  }
  const data = await res.json()
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const url = `${API_BASE_URL.replace(/\/$/, '')}/admin/users/${params.id}`
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': request.headers.get('Authorization') || '',
      'X-Forwarded-Host': request.headers.get('x-forwarded-host') || request.headers.get('host') || '',
    },
  })
  const ct = res.headers.get('content-type') || ''
  if (!res.ok) {
    const resp = ct.includes('application/json') ? await res.json() : { message: `Upstream error ${res.status}` }
    return NextResponse.json(resp, { status: res.status })
  }
  const data = await res.json()
  return NextResponse.json(data)
}

