import { NextRequest, NextResponse } from 'next/server'

import { getApiBaseUrl } from "@/lib/api/config"

const API_BASE_URL = getApiBaseUrl()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    
    const url = `${API_BASE_URL.replace(/\/$/, '')}/admin/users${queryString ? `?${queryString}` : ''}`
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
        'X-Forwarded-Host': request.headers.get('x-forwarded-host') || request.headers.get('host') || '',
      },
    })

    if (!res.ok) {
      const errorData = await res.json()
      return NextResponse.json(
        { error: 'Failed to fetch users', details: errorData },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/admin/users`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
        'X-Forwarded-Host': request.headers.get('x-forwarded-host') || request.headers.get('host') || '',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errorData = await res.json()
      return NextResponse.json(
        { error: 'Failed to create user', details: errorData },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('User creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




