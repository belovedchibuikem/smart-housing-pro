import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api'

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

import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const laravelApiUrl = "http://127.0.0.1:8000/api"
    
    const res = await fetch(`${laravelApiUrl}/users/${params.id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
    })

    if (!res.ok) {
      const errorData = await res.json()
      return NextResponse.json(
        { error: 'Failed to fetch user', details: errorData },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('User fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const laravelApiUrl = "http://127.0.0.1:8000/api"
    
    const res = await fetch(`${laravelApiUrl}/users/${params.id}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errorData = await res.json()
      return NextResponse.json(
        { error: 'Failed to update user', details: errorData },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const laravelApiUrl = "http://127.0.0.1:8000/api"
    
    const res = await fetch(`${laravelApiUrl}/users/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
    })

    if (!res.ok) {
      const errorData = await res.json()
      return NextResponse.json(
        { error: 'Failed to delete user', details: errorData },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('User deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




