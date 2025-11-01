import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const url = `${API_BASE_URL.replace(/\/$/, '')}/admin/permissions/${params.id}`
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
        'X-Forwarded-Host': request.headers.get('x-forwarded-host') || request.headers.get('host') || '',
      },
    })
    const contentType = res.headers.get('content-type') || ''
    if (!res.ok) {
      if (contentType.includes('application/json')) {
        const err = await res.json()
        return NextResponse.json(err, { status: res.status })
      }
      return NextResponse.json({ message: `Upstream error ${res.status}` }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Permission GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const url = `${API_BASE_URL.replace(/\/$/, '')}/admin/permissions/${params.id}`
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
    const contentType = res.headers.get('content-type') || ''
    if (!res.ok) {
      if (contentType.includes('application/json')) {
        const err = await res.json()
        return NextResponse.json(err, { status: res.status })
      }
      return NextResponse.json({ message: `Upstream error ${res.status}` }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Permission UPDATE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const url = `${API_BASE_URL.replace(/\/$/, '')}/admin/permissions/${params.id}`
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
        'X-Forwarded-Host': request.headers.get('x-forwarded-host') || request.headers.get('host') || '',
      },
    })
    const contentType = res.headers.get('content-type') || ''
    if (!res.ok) {
      if (contentType.includes('application/json')) {
        const err = await res.json()
        return NextResponse.json(err, { status: res.status })
      }
      return NextResponse.json({ message: `Upstream error ${res.status}` }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Permission DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


